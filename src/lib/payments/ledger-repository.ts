import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  PaymentLedgerRepository,
} from "./payment-ledger.mjs";
import type {
  PaymentRejection,
  PaymentReversal,
  PaymentVerification,
} from "./record-payment.mjs";

const attemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  authorizedActorId: z.string().uuid().nullable(),
  targetPaymentId: z.string().uuid().nullable(),
  paymentStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).nullable(),
  invoiceId: z.string().uuid().nullable(),
  invoiceStatus: z.enum(["ISSUED", "VOID"]).nullable(),
  paymentAmount: z.string().nullable(),
  amountDue: z.string().nullable(),
  amountPaid: z.string().nullable(),
  depositApplied: z.string().nullable(),
  allocationTotal: z.string().nullable(),
  hasReversal: z.boolean(),
  auditEventId: z.string().uuid().nullable(),
  savedResponsePayload: z.unknown().nullable(),
}).strict();

const idempotencyRowSchema = z.object({
  operation: z.string(),
  responseCode: z.number().int().nullable(),
  responsePayload: z.unknown().nullable(),
  completedAt: z.string().nullable(),
});

const verificationSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountPaid: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountOutstanding: z.string().regex(/^\d+(?:\.\d{2})$/),
  status: z.literal("VERIFIED"),
  verifiedAt: z.string().datetime({ offset: true }),
  allocations: z.array(z.object({
    invoiceLineId: z.string().uuid(),
    kind: z.enum(["RENT", "DEPOSIT"]),
    amount: z.string().regex(/^\d+(?:\.\d{2})$/),
  }).strict()).min(1),
}).strict();

const rejectionSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountPaid: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountOutstanding: z.string().regex(/^\d+(?:\.\d{2})$/),
  status: z.literal("REJECTED"),
  rejectionReason: z.string().min(1),
  rejectedAt: z.string().datetime({ offset: true }),
}).strict();

const reversalSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountPaid: z.string().regex(/^\d+(?:\.\d{2})$/),
  amountOutstanding: z.string().regex(/^\d+(?:\.\d{2})$/),
  reason: z.string().min(1),
  reversedAt: z.string().datetime({ offset: true }),
}).strict();

const ALLOCATE_BY_LINE_KIND_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT 1 FROM idempotency_keys WHERE "key" = $3::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id FROM app_users
     WHERE id = $2::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT p.id, p.invoice_id AS "invoiceId", p.amount
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      CROSS JOIN authorized_actor
     WHERE p.id = $1::uuid
       AND p.status = 'PENDING'::"PaymentStatus"
       AND i.status = 'ISSUED'::"InvoiceStatus"
       AND NOT EXISTS (SELECT 1 FROM existing)
  ),
  line_balances AS MATERIALIZED (
    SELECT line.id,
           line.kind::text AS kind,
           GREATEST(
             line.amount - COALESCE((
               SELECT SUM(prior_allocation.amount)
                 FROM payment_allocations prior_allocation
                 JOIN payments prior_payment
                   ON prior_payment.id = prior_allocation.payment_id
                WHERE prior_allocation.invoice_line_id = line.id
                  AND prior_payment.status = 'VERIFIED'::"PaymentStatus"
                  AND NOT EXISTS (
                    SELECT 1 FROM payment_reversals prior_reversal
                     WHERE prior_reversal.payment_id = prior_payment.id
                  )
             ), 0)
             - COALESCE((
               SELECT SUM(entry.amount)
                 FROM deposit_ledger_entries entry
                WHERE entry.invoice_line_id = line.id
                  AND entry.kind = 'APPLIED_TO_RENT'
             ), 0),
             0
           ) AS remaining
      FROM target
      JOIN invoice_lines line ON line.invoice_id = target."invoiceId"
  ),
  capacity AS MATERIALIZED (
    SELECT COALESCE(SUM(line_balances.remaining), 0) AS amount
      FROM line_balances
  ),
  ordered AS MATERIALIZED (
    SELECT line_balances.id,
           line_balances.kind,
           line_balances.remaining,
           COALESCE(
             SUM(line_balances.remaining) OVER (
               ORDER BY line_balances.id
               ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
             ),
             0
           ) AS previousRemaining
      FROM line_balances
     WHERE line_balances.kind = $4::text
  ),
  inserted AS (
    INSERT INTO payment_allocations (id, payment_id, invoice_line_id, amount)
    SELECT gen_random_uuid(),
           target.id,
           ordered.id,
           LEAST(
             ordered.remaining,
             GREATEST(
               target.amount - COALESCE((
                 SELECT SUM(current_allocation.amount)
                   FROM payment_allocations current_allocation
                  WHERE current_allocation.payment_id = target.id
               ), 0) - ordered.previousRemaining,
               0
             )
           )
      FROM target
      CROSS JOIN capacity
      CROSS JOIN authorized_actor
      JOIN ordered ON TRUE
     WHERE capacity.amount >= target.amount
       AND LEAST(
         ordered.remaining,
         GREATEST(
           target.amount - COALESCE((
             SELECT SUM(current_allocation.amount)
               FROM payment_allocations current_allocation
              WHERE current_allocation.payment_id = target.id
           ), 0) - ordered.previousRemaining,
           0
         )
       ) > 0
    RETURNING id
  )
  SELECT COUNT(*)::integer AS inserted_count FROM inserted
`;

const VERIFY_PAYMENT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $3::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT p.id, p.invoice_id AS "invoiceId", p.amount,
           p.status::text AS status, i.status::text AS "invoiceStatus"
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.id AS "paymentId",
           COALESCE((
             SELECT SUM(line.amount)
               FROM invoice_lines line
              WHERE line.invoice_id = target."invoiceId"
           ), 0)::text AS "amountDue",
           COALESCE((
             SELECT SUM(allocation.amount)
               FROM payment_allocations allocation
               JOIN payments paid ON paid.id = allocation.payment_id
              WHERE paid.invoice_id = target."invoiceId"
                AND paid.status = 'VERIFIED'::"PaymentStatus"
                AND NOT EXISTS (
                  SELECT 1 FROM payment_reversals reversal
                   WHERE reversal.payment_id = paid.id
                )
           ), 0)::text AS "amountPaid",
           COALESCE((
             SELECT SUM(entry.amount)
               FROM deposit_ledger_entries entry
               JOIN invoice_lines line ON line.id = entry.invoice_line_id
              WHERE line.invoice_id = target."invoiceId"
                AND entry.kind = 'APPLIED_TO_RENT'
           ), 0)::text AS "depositApplied",
           COALESCE((
             SELECT SUM(allocation.amount)
               FROM payment_allocations allocation
              WHERE allocation.payment_id = target.id
           ), 0)::text AS "allocationTotal",
           EXISTS (
             SELECT 1 FROM payment_reversals reversal
              WHERE reversal.payment_id = target.id
           ) AS "hasReversal"
      FROM target
  ),
  updated AS (
    UPDATE payments payment
       SET status = 'VERIFIED'::"PaymentStatus",
           verified_by_id = actor.id,
           verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
      FROM target, authorized_actor actor, totals
     WHERE payment.id = target.id
       AND target.status = 'PENDING'
       AND target."invoiceStatus" = 'ISSUED'
       AND totals."allocationTotal"::numeric = target.amount
       AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING payment.id,
              payment.invoice_id AS "invoiceId",
              payment.amount::text AS amount,
              to_char(payment.verified_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "verifiedAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $6::uuid, actor.id, 'PAYMENT_VERIFIED', 'PAYMENT', updated.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object(
             'invoiceId', updated."invoiceId",
             'amount', updated.amount,
             'status', 'VERIFIED'
           )
      FROM updated
      JOIN authorized_actor actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT updated.id AS "paymentId",
           updated."invoiceId",
           updated.amount,
           (totals."amountPaid"::numeric + updated.amount::numeric)::numeric(12,2)::text AS "amountPaid",
           (totals."amountDue"::numeric - totals."amountPaid"::numeric
            - totals."depositApplied"::numeric - updated.amount::numeric)::numeric(12,2)::text AS "amountOutstanding",
           'VERIFIED'::text AS status,
           updated."verifiedAt",
           COALESCE((
             SELECT jsonb_agg(
               jsonb_build_object(
                 'invoiceLineId', allocation.invoice_line_id,
                 'kind', line.kind,
                 'amount', allocation.amount::text
               )
               ORDER BY CASE line.kind WHEN 'RENT' THEN 0 ELSE 1 END,
                        line.id
             )
               FROM payment_allocations allocation
               JOIN invoice_lines line ON line.id = allocation.invoice_line_id
              WHERE allocation.payment_id = updated.id
           ), '[]'::jsonb) AS allocations
      FROM updated
      JOIN totals ON totals."paymentId" = updated.id
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $3::uuid, 'verifyPayment', 200,
           jsonb_build_object(
             'requestHash', $4::text,
             'attemptId', $5::uuid,
             'data', jsonb_build_object(
               'paymentId', response_data."paymentId",
               'invoiceId', response_data."invoiceId",
               'amount', response_data.amount,
               'amountPaid', response_data."amountPaid",
               'amountOutstanding', response_data."amountOutstanding",
               'status', response_data.status,
               'verifiedAt', response_data."verifiedAt",
               'allocations', response_data.allocations
             )
           ),
           CURRENT_TIMESTAMP
      FROM response_data
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM authorized_actor) AS "authorizedActorId",
         (SELECT id FROM target) AS "targetPaymentId",
         (SELECT status FROM target) AS "paymentStatus",
         (SELECT "invoiceId" FROM target) AS "invoiceId",
         (SELECT "invoiceStatus" FROM target) AS "invoiceStatus",
         (SELECT amount::text FROM target) AS "paymentAmount",
         (SELECT "amountDue" FROM totals) AS "amountDue",
         (SELECT "amountPaid" FROM totals) AS "amountPaid",
         (SELECT "depositApplied" FROM totals) AS "depositApplied",
         (SELECT "allocationTotal" FROM totals) AS "allocationTotal",
         COALESCE((SELECT "hasReversal" FROM totals), FALSE) AS "hasReversal",
         (SELECT id FROM audit) AS "auditEventId",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) request
`;

const REJECT_PAYMENT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $4::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT p.id, p.invoice_id AS "invoiceId", p.amount,
           p.status::text AS status, i.status::text AS "invoiceStatus"
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.id AS "paymentId",
           COALESCE((SELECT SUM(line.amount) FROM invoice_lines line
                      WHERE line.invoice_id = target."invoiceId"), 0)::numeric(12,2)::text AS "amountDue",
           COALESCE((
             SELECT SUM(allocation.amount)
               FROM payment_allocations allocation
               JOIN payments paid ON paid.id = allocation.payment_id
              WHERE paid.invoice_id = target."invoiceId"
                AND paid.status = 'VERIFIED'::"PaymentStatus"
                AND NOT EXISTS (
                  SELECT 1 FROM payment_reversals reversal
                   WHERE reversal.payment_id = paid.id
                )
           ), 0)::numeric(12,2)::text AS "amountPaid",
           COALESCE((
             SELECT SUM(entry.amount)
               FROM deposit_ledger_entries entry
               JOIN invoice_lines line ON line.id = entry.invoice_line_id
              WHERE line.invoice_id = target."invoiceId"
                AND entry.kind = 'APPLIED_TO_RENT'
           ), 0)::numeric(12,2)::text AS "depositApplied"
      FROM target
  ),
  updated AS (
    UPDATE payments payment
       SET status = 'REJECTED'::"PaymentStatus",
           rejected_by_id = actor.id,
           rejected_at = CURRENT_TIMESTAMP,
           rejection_reason = $3::text,
           updated_at = CURRENT_TIMESTAMP
      FROM target, authorized_actor actor
     WHERE payment.id = target.id
       AND target.status = 'PENDING'
       AND target."invoiceStatus" = 'ISSUED'
       AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING payment.id,
              payment.invoice_id AS "invoiceId",
              payment.amount::text AS amount,
              payment.rejection_reason AS "rejectionReason",
              to_char(payment.rejected_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "rejectedAt"
  ),
  response_data AS MATERIALIZED (
    SELECT updated.id AS "paymentId",
           updated."invoiceId",
           updated.amount,
           totals."amountPaid",
           (totals."amountDue"::numeric - totals."amountPaid"::numeric
            - totals."depositApplied"::numeric)::numeric(12,2)::text AS "amountOutstanding",
           updated."rejectionReason",
           updated."rejectedAt"
      FROM updated
      JOIN totals ON totals."paymentId" = updated.id
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $7::uuid, actor.id, 'PAYMENT_REJECTED', 'PAYMENT', updated.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object(
             'invoiceId', updated."invoiceId",
             'amount', updated.amount,
             'status', 'REJECTED'
           )
      FROM updated
      JOIN authorized_actor actor ON TRUE
    RETURNING id
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $4::uuid, 'rejectPayment', 200,
           jsonb_build_object(
             'requestHash', $5::text,
             'attemptId', $6::uuid,
             'data', jsonb_build_object(
               'paymentId', response_data."paymentId",
               'invoiceId', response_data."invoiceId",
               'amount', response_data.amount,
               'amountPaid', response_data."amountPaid",
               'amountOutstanding', response_data."amountOutstanding",
               'status', 'REJECTED',
               'rejectionReason', response_data."rejectionReason",
               'rejectedAt', response_data."rejectedAt"
             )
           ),
           CURRENT_TIMESTAMP
      FROM response_data
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM authorized_actor) AS "authorizedActorId",
         (SELECT id FROM target) AS "targetPaymentId",
         (SELECT status FROM target) AS "paymentStatus",
         (SELECT "invoiceId" FROM target) AS "invoiceId",
         (SELECT "invoiceStatus" FROM target) AS "invoiceStatus",
         (SELECT amount::text FROM target) AS "paymentAmount",
         (SELECT "amountDue" FROM totals) AS "amountDue",
         (SELECT "amountPaid" FROM totals) AS "amountPaid",
         (SELECT "depositApplied" FROM totals) AS "depositApplied",
         NULL::text AS "allocationTotal",
         FALSE AS "hasReversal",
         (SELECT id FROM audit) AS "auditEventId",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) request
`;

const REVERSE_PAYMENT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $4::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT p.id, p.invoice_id AS "invoiceId", p.amount,
           p.status::text AS status, i.status::text AS "invoiceStatus"
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.id AS "paymentId",
           COALESCE((SELECT SUM(line.amount) FROM invoice_lines line
                      WHERE line.invoice_id = target."invoiceId"), 0)::numeric(12,2)::text AS "amountDue",
           COALESCE((
             SELECT SUM(allocation.amount)
               FROM payment_allocations allocation
               JOIN payments paid ON paid.id = allocation.payment_id
              WHERE paid.invoice_id = target."invoiceId"
                AND paid.status = 'VERIFIED'::"PaymentStatus"
                AND NOT EXISTS (
                  SELECT 1 FROM payment_reversals reversal
                   WHERE reversal.payment_id = paid.id
                )
           ), 0)::numeric(12,2)::text AS "amountPaid",
           COALESCE((
             SELECT SUM(entry.amount)
               FROM deposit_ledger_entries entry
               JOIN invoice_lines line ON line.id = entry.invoice_line_id
              WHERE line.invoice_id = target."invoiceId"
                AND entry.kind = 'APPLIED_TO_RENT'
           ), 0)::numeric(12,2)::text AS "depositApplied"
      FROM target
  ),
  reversed AS (
    INSERT INTO payment_reversals (
      id, payment_id, amount, reason, created_by_id, created_at
    )
    SELECT $8::uuid, target.id, target.amount, $3::text,
           actor.id, CURRENT_TIMESTAMP
      FROM target
      JOIN authorized_actor actor ON TRUE
     WHERE target.status = 'VERIFIED'
       AND NOT EXISTS (SELECT 1 FROM existing)
       AND NOT EXISTS (
         SELECT 1 FROM payment_reversals prior
          WHERE prior.payment_id = target.id
       )
    RETURNING payment_id AS "paymentId",
              amount::text AS amount,
              reason,
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "reversedAt"
  ),
  response_data AS MATERIALIZED (
    SELECT reversed."paymentId",
           target."invoiceId",
           reversed.amount,
           (totals."amountPaid"::numeric - reversed.amount::numeric)::numeric(12,2)::text AS "amountPaid",
           (totals."amountDue"::numeric - totals."amountPaid"::numeric
            - totals."depositApplied"::numeric + reversed.amount::numeric)::numeric(12,2)::text AS "amountOutstanding",
           reversed.reason,
           reversed."reversedAt"
      FROM reversed
      JOIN target ON target.id = reversed."paymentId"
      JOIN totals ON totals."paymentId" = reversed."paymentId"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $7::uuid, actor.id, 'PAYMENT_REVERSED', 'PAYMENT', reversed."paymentId",
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object(
             'invoiceId', target."invoiceId",
             'amount', reversed.amount,
             'status', 'REVERSED'
           )
      FROM reversed
      JOIN target ON target.id = reversed."paymentId"
      JOIN authorized_actor actor ON TRUE
    RETURNING id
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $4::uuid, 'reversePayment', 200,
           jsonb_build_object(
             'requestHash', $5::text,
             'attemptId', $6::uuid,
             'data', jsonb_build_object(
               'paymentId', response_data."paymentId",
               'invoiceId', response_data."invoiceId",
               'amount', response_data.amount,
               'amountPaid', response_data."amountPaid",
               'amountOutstanding', response_data."amountOutstanding",
               'reason', response_data.reason,
               'reversedAt', response_data."reversedAt"
             )
           ),
           CURRENT_TIMESTAMP
      FROM response_data
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM authorized_actor) AS "authorizedActorId",
         (SELECT id FROM target) AS "targetPaymentId",
         (SELECT status FROM target) AS "paymentStatus",
         (SELECT "invoiceId" FROM target) AS "invoiceId",
         (SELECT "invoiceStatus" FROM target) AS "invoiceStatus",
         (SELECT amount::text FROM target) AS "paymentAmount",
         (SELECT "amountDue" FROM totals) AS "amountDue",
         (SELECT "amountPaid" FROM totals) AS "amountPaid",
         (SELECT "depositApplied" FROM totals) AS "depositApplied",
         NULL::text AS "allocationTotal",
         EXISTS (
           SELECT 1 FROM payment_reversals prior
            WHERE prior.payment_id = $2::uuid
         ) AS "hasReversal",
         (SELECT id FROM audit) AS "auditEventId",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) request
`;

const RECORD_DEPOSIT_COLLECTIONS_SQL = `
  INSERT INTO deposit_ledger_entries (
    id, lease_id, payment_allocation_id, kind, amount, created_by_id
  )
  SELECT gen_random_uuid(), invoice.lease_id, allocation.id,
         'COLLECTED', allocation.amount, payment.verified_by_id
    FROM idempotency_keys saved
    JOIN payments payment ON payment.id = $1::uuid
    JOIN invoices invoice ON invoice.id = payment.invoice_id
    JOIN payment_allocations allocation ON allocation.payment_id = payment.id
    JOIN invoice_lines line ON line.id = allocation.invoice_line_id
   WHERE saved."key" = $2::uuid
     AND saved.response_payload->>'attemptId' = $3::text
     AND payment.status = 'VERIFIED'::"PaymentStatus"
     AND line.kind = 'DEPOSIT'
     AND NOT EXISTS (
       SELECT 1 FROM deposit_ledger_entries prior
        WHERE prior.payment_allocation_id = allocation.id
          AND prior.kind = 'COLLECTED'
     )
  RETURNING id
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function parseAttempt(row: unknown): z.infer<typeof attemptSchema> {
  const parsed = attemptSchema.safeParse(row);
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  return parsed.data;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function parseStoredResponse<T>(
  row: unknown,
  operation: string,
  requestHash: string,
  responseSchema: z.ZodType<T>,
): T {
  const parsed = idempotencyRowSchema.safeParse(row);
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  const key = parsed.data;
  if (
    key.operation !== operation ||
    key.responseCode !== 200 ||
    key.completedAt === null ||
    key.responsePayload === null
  ) {
    throw new DomainError("CONFLICT");
  }

  const payload = z.object({
    requestHash: z.string().regex(/^[a-f0-9]{64}$/),
    attemptId: z.string().uuid(),
    data: z.unknown(),
  }).strict().safeParse(parseJson(key.responsePayload));
  if (!payload.success) throw new DomainError("INTERNAL_ERROR");
  if (payload.data.requestHash !== requestHash) throw new DomainError("CONFLICT");

  const data = responseSchema.safeParse(payload.data.data);
  if (!data.success) throw new DomainError("INTERNAL_ERROR");
  return data.data;
}

function cents(value: string): bigint {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new DomainError("INTERNAL_ERROR");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function mapLedgerPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";

  if (message.includes("DEPOSIT_INSUFFICIENT")) return new DomainError("DEPOSIT_INSUFFICIENT");
  if (message.includes("PAYMENT_OVERPAYMENT")) return new DomainError("OVERPAYMENT");
  if (message.includes("PAYMENT_INVOICE_CLOSED")) return new DomainError("INVOICE_CLOSED");
  if (message.includes("PAYMENT_REVERSAL_REQUIRES_VERIFIED_PAYMENT")) {
    return new DomainError("NOT_VERIFIED");
  }
  if (message.includes("PAYMENT_REVERSAL_REASON_REQUIRED")) {
    return new DomainError("REASON_REQUIRED");
  }
  if (code === "23505" && message.includes("payment_reversals_payment_id")) {
    return new DomainError("ALREADY_REVERSED");
  }
  if (["23505", "23503", "40001", "40P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

function lockStatements(
  sql: ReturnType<typeof neon>,
  paymentId: string,
  idempotencyKey: string,
) {
  return [
    sql.query(
      `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
      [idempotencyKey],
    ),
    sql.query(
      `SELECT id FROM payments WHERE id = $1::uuid FOR UPDATE`,
      [paymentId],
    ),
    sql.query(
      `SELECT lease.id
         FROM leases lease
         JOIN invoices invoice ON invoice.lease_id = lease.id
         JOIN payments payment ON payment.invoice_id = invoice.id
        WHERE payment.id = $1::uuid
        FOR UPDATE OF lease`,
      [paymentId],
    ),
    sql.query(
      `SELECT id FROM invoices
        WHERE id = (SELECT invoice_id FROM payments WHERE id = $1::uuid)
        FOR UPDATE`,
      [paymentId],
    ),
  ];
}

function throwVerifyFailure(attempt: z.infer<typeof attemptSchema>, input: {
  paymentId: string;
  amount: string;
}): never {
  if (!attempt.authorizedActorId) throw new DomainError("NOT_OWNER");
  if (attempt.targetPaymentId !== input.paymentId || !attempt.paymentStatus) {
    throw new DomainError("PAYMENT_NOT_FOUND");
  }
  if (attempt.invoiceStatus !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
  if (attempt.paymentStatus !== "PENDING") throw new DomainError("PAYMENT_NOT_PENDING");
  if (!attempt.paymentAmount || !attempt.amountDue || !attempt.amountPaid ||
      !attempt.depositApplied || !attempt.allocationTotal) {
    throw new DomainError("INTERNAL_ERROR");
  }
  const due = cents(attempt.amountDue);
  const paid = cents(attempt.amountPaid) + cents(attempt.depositApplied);
  if (paid > due) throw new DomainError("INTERNAL_ERROR");
  if (cents(input.amount) > due - paid) throw new DomainError("OVERPAYMENT");
  if (cents(attempt.allocationTotal) > 0n) throw new DomainError("CONFLICT");
  throw new DomainError("INTERNAL_ERROR");
}

function throwRejectFailure(attempt: z.infer<typeof attemptSchema>, paymentId: string): never {
  if (!attempt.authorizedActorId) throw new DomainError("NOT_OWNER");
  if (attempt.targetPaymentId !== paymentId || !attempt.paymentStatus) {
    throw new DomainError("PAYMENT_NOT_FOUND");
  }
  if (attempt.invoiceStatus !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
  if (attempt.paymentStatus !== "PENDING") throw new DomainError("PAYMENT_NOT_PENDING");
  throw new DomainError("INTERNAL_ERROR");
}

function throwReverseFailure(attempt: z.infer<typeof attemptSchema>, paymentId: string): never {
  if (!attempt.authorizedActorId) throw new DomainError("NOT_OWNER");
  if (attempt.targetPaymentId !== paymentId || !attempt.paymentStatus) {
    throw new DomainError("PAYMENT_NOT_FOUND");
  }
  if (attempt.hasReversal) throw new DomainError("ALREADY_REVERSED");
  if (attempt.paymentStatus !== "VERIFIED") throw new DomainError("NOT_VERIFIED");
  throw new DomainError("INTERNAL_ERROR");
}

function parseAttemptOrReplay<T>(
  row: unknown,
  operation: string,
  requestHash: string,
  responseSchema: z.ZodType<T>,
) {
  const attempt = parseAttempt(row);
  if (!attempt.authorizedActorId) throw new DomainError("NOT_OWNER");
  if (attempt.existingOperation !== null) {
    return {
      attempt,
      replay: parseStoredResponse({
        operation: attempt.existingOperation,
        responseCode: attempt.existingResponseCode,
        responsePayload: attempt.existingResponsePayload,
        completedAt: attempt.existingCompletedAt,
      }, operation, requestHash, responseSchema),
    };
  }
  return { attempt, replay: null };
}

export function createPaymentLedgerRepository(): PaymentLedgerRepository {
  return {
    async verifyPayment(input): Promise<PaymentVerification> {
      const sql = getSql();
      const attemptId = randomUUID();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          ...lockStatements(sql, input.paymentId, input.idempotencyKey),
          sql.query(ALLOCATE_BY_LINE_KIND_SQL, [
            input.paymentId, input.actorId, input.idempotencyKey, "RENT",
          ]),
          sql.query(ALLOCATE_BY_LINE_KIND_SQL, [
            input.paymentId, input.actorId, input.idempotencyKey, "DEPOSIT",
          ]),
          sql.query(VERIFY_PAYMENT_SQL, [
            input.actorId,
            input.paymentId,
            input.idempotencyKey,
            input.requestHash,
            attemptId,
            randomUUID(),
          ]),
          sql.query(RECORD_DEPOSIT_COLLECTIONS_SQL, [
            input.paymentId,
            input.idempotencyKey,
            attemptId,
          ]),
        ]);
      } catch (error) {
        throw mapLedgerPersistenceError(error);
      }

      const { attempt, replay } = parseAttemptOrReplay(
        results[6]?.[0], "verifyPayment", input.requestHash, verificationSchema,
      );
      if (replay) return replay;
      if (attempt.savedResponsePayload !== null && attempt.auditEventId) {
        return parseStoredResponse({
          operation: "verifyPayment",
          responseCode: 200,
          responsePayload: attempt.savedResponsePayload,
          completedAt: "present",
        }, "verifyPayment", input.requestHash, verificationSchema);
      }
      return throwVerifyFailure(attempt, {
        paymentId: input.paymentId,
        amount: attempt.paymentAmount ?? "0",
      });
    },

    async rejectPayment(input): Promise<PaymentRejection> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          ...lockStatements(sql, input.paymentId, input.idempotencyKey),
          sql.query(REJECT_PAYMENT_SQL, [
            input.actorId,
            input.paymentId,
            input.reason,
            input.idempotencyKey,
            input.requestHash,
            randomUUID(),
            randomUUID(),
          ]),
        ]);
      } catch (error) {
        throw mapLedgerPersistenceError(error);
      }

      const { attempt, replay } = parseAttemptOrReplay(
        results[4]?.[0], "rejectPayment", input.requestHash, rejectionSchema,
      );
      if (replay) return replay;
      if (attempt.savedResponsePayload !== null && attempt.auditEventId) {
        return parseStoredResponse({
          operation: "rejectPayment",
          responseCode: 200,
          responsePayload: attempt.savedResponsePayload,
          completedAt: "present",
        }, "rejectPayment", input.requestHash, rejectionSchema);
      }
      return throwRejectFailure(attempt, input.paymentId);
    },

    async reversePayment(input): Promise<PaymentReversal> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          ...lockStatements(sql, input.paymentId, input.idempotencyKey),
          sql.query(REVERSE_PAYMENT_SQL, [
            input.actorId,
            input.paymentId,
            input.reason,
            input.idempotencyKey,
            input.requestHash,
            randomUUID(),
            randomUUID(),
            randomUUID(),
          ]),
        ]);
      } catch (error) {
        throw mapLedgerPersistenceError(error);
      }

      const { attempt, replay } = parseAttemptOrReplay(
        results[4]?.[0], "reversePayment", input.requestHash, reversalSchema,
      );
      if (replay) return replay;
      if (attempt.savedResponsePayload !== null && attempt.auditEventId) {
        return parseStoredResponse({
          operation: "reversePayment",
          responseCode: 200,
          responsePayload: attempt.savedResponsePayload,
          completedAt: "present",
        }, "reversePayment", input.requestHash, reversalSchema);
      }
      return throwReverseFailure(attempt, input.paymentId);
    },
  };
}
