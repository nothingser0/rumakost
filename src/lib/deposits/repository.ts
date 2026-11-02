import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";

const moneyText = z.string().regex(/^\d+\.\d{2}$/);
const actorRoleSchema = z.enum(["OWNER", "STAFF", "TENANT"]);
const attemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  actorId: z.string().uuid().nullable(),
  actorRole: actorRoleSchema.nullable(),
  targetId: z.string().uuid().nullable(),
  targetStatus: z.string().nullable(),
  leaseId: z.string().uuid().nullable(),
  leaseStatus: z.string().nullable(),
  invoiceStatus: z.string().nullable(),
  lineKind: z.string().nullable(),
  lineAmount: moneyText.nullable(),
  linePaid: moneyText.nullable(),
  lineApplied: moneyText.nullable(),
  amount: moneyText.nullable(),
  availableEscrow: moneyText.nullable(),
  refundStatus: z.string().nullable(),
  savedResponsePayload: z.unknown().nullable(),
}).strict();

const idempotencyRowSchema = z.object({
  operation: z.string(),
  responseCode: z.number().int().nullable(),
  responsePayload: z.unknown().nullable(),
  completedAt: z.string().nullable(),
}).strict();

const storedResponseSchema = z.object({
  requestHash: z.string().regex(/^[a-f0-9]{64}$/),
  data: z.unknown(),
}).strict();

const depositSettlementResultSchema = z.object({
  entryId: z.string().uuid(),
  leaseId: z.string().uuid(),
  invoiceLineId: z.string().uuid(),
  amount: moneyText,
  amountOutstanding: moneyText,
  kind: z.literal("APPLIED_TO_RENT"),
}).strict();

const checkoutDepositResultSchema = z.object({
  entryId: z.string().uuid(),
  leaseId: z.string().uuid(),
  amount: moneyText,
  kind: z.enum(["REFUNDED", "WITHHELD_AT_CHECKOUT"]),
  reason: z.string().min(1),
  refundStatus: z.enum(["PENDING"]).nullable(),
  availableAfter: moneyText,
}).strict();

const checkoutRefundResultSchema = z.object({
  entryId: z.string().uuid(),
  leaseId: z.string().uuid(),
  amount: moneyText,
  status: z.enum(["PAID", "REJECTED"]),
  availableAfter: moneyText,
}).strict();

export type DepositSettlementResult = z.infer<typeof depositSettlementResultSchema>;
export type CheckoutDepositResult = z.infer<typeof checkoutDepositResultSchema>;
export type CheckoutRefundResult = z.infer<typeof checkoutRefundResultSchema>;

type IdempotentInput = {
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
};

export type SettleInvoiceFromDepositInput = IdempotentInput & {
  invoiceLineId: string;
  amount: string;
  reason: string | null;
};

export type ReconcileCheckoutDepositInput = IdempotentInput & {
  leaseId: string;
  mode: "REFUND" | "DEDUCTION";
  amount: string;
  reason: string;
};

export type ResolveCheckoutRefundInput = IdempotentInput & {
  entryId: string;
  status: "PAID" | "REJECTED";
};

export type DepositRepository = {
  settleInvoiceFromDeposit(input: SettleInvoiceFromDepositInput): Promise<DepositSettlementResult>;
  reconcileCheckoutDeposit(input: ReconcileCheckoutDepositInput): Promise<CheckoutDepositResult>;
  resolveCheckoutRefund(input: ResolveCheckoutRefundInput): Promise<CheckoutRefundResult>;
};

const SETTLE_INVOICE_FROM_DEPOSIT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $5::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT line.id,
           line.invoice_id AS "invoiceId",
           line.kind AS "lineKind",
           line.amount::numeric(12,2)::text AS "lineAmount",
           invoice.status::text AS "invoiceStatus",
           invoice.lease_id AS "leaseId",
           lease.status::text AS "leaseStatus"
      FROM invoice_lines line
      JOIN invoices invoice ON invoice.id = line.invoice_id
      JOIN leases lease ON lease.id = invoice.lease_id
     WHERE line.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.*,
           COALESCE((
             SELECT SUM(allocation.amount)
               FROM payment_allocations allocation
               JOIN payments payment ON payment.id = allocation.payment_id
              WHERE allocation.invoice_line_id = target.id
                AND payment.status = 'VERIFIED'::"PaymentStatus"
                AND NOT EXISTS (
                  SELECT 1 FROM payment_reversals reversal
                   WHERE reversal.payment_id = payment.id
                )
           ), 0)::numeric(12,2)::text AS "linePaid",
           COALESCE((
             SELECT SUM(entry.amount)
               FROM deposit_ledger_entries entry
              WHERE entry.invoice_line_id = target.id
                AND entry.kind = 'APPLIED_TO_RENT'
           ), 0)::numeric(12,2)::text AS "lineApplied",
           (
             COALESCE((
               SELECT SUM(entry.amount) FILTER (WHERE entry.kind = 'COLLECTED')
                 FROM deposit_ledger_entries entry
                WHERE entry.lease_id = target."leaseId"
             ), 0)
             - COALESCE((
               SELECT SUM(entry.amount) FILTER (WHERE entry.kind = 'COLLECTION_REVERSED')
                 FROM deposit_ledger_entries entry
                WHERE entry.lease_id = target."leaseId"
             ), 0)
             - COALESCE((
               SELECT SUM(entry.amount) FILTER (
                 WHERE entry.kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT')
                    OR (entry.kind = 'REFUNDED' AND entry.refund_status IN ('PENDING', 'PAID'))
               )
                 FROM deposit_ledger_entries entry
                WHERE entry.lease_id = target."leaseId"
             ), 0)
           )::numeric(12,2)::text AS "availableEscrow"
      FROM target
  ),
  inserted AS (
    INSERT INTO deposit_ledger_entries (
      id, lease_id, invoice_line_id, kind, amount, reason, created_by_id, created_at
    )
    SELECT $7::uuid, totals."leaseId", totals.id, 'APPLIED_TO_RENT',
           $3::numeric, $4::text, actor.id, CURRENT_TIMESTAMP
      FROM totals
      JOIN actor ON TRUE
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND totals."lineKind" = 'RENT'
       AND totals."invoiceStatus" = 'ISSUED'
       AND $3::numeric <= totals."lineAmount"::numeric
                             - totals."linePaid"::numeric
                             - totals."lineApplied"::numeric
       AND $3::numeric <= totals."availableEscrow"::numeric
    RETURNING id, lease_id AS "leaseId", invoice_line_id AS "invoiceLineId",
              amount::numeric(12,2)::text AS amount, kind
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $8::uuid, actor.id, 'DEPOSIT_APPLIED_TO_RENT',
           'DEPOSIT_LEDGER_ENTRY', inserted.id, CURRENT_TIMESTAMP, $4::text,
           jsonb_build_object('leaseId', inserted."leaseId",
                              'invoiceLineId', inserted."invoiceLineId",
                              'amount', inserted.amount)
      FROM inserted
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'entryId', inserted.id,
             'leaseId', inserted."leaseId",
             'invoiceLineId', inserted."invoiceLineId",
             'amount', inserted.amount,
             'amountOutstanding',
               (totals."lineAmount"::numeric
                - totals."linePaid"::numeric
                - totals."lineApplied"::numeric
                - inserted.amount::numeric)::numeric(12,2)::text,
             'kind', inserted.kind
           ) AS data
      FROM inserted
      JOIN totals ON totals.id = inserted."invoiceLineId"
      JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $5::uuid, 'settleInvoiceFromDeposit', 200,
           jsonb_build_object('requestHash', $6::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         (SELECT id FROM totals) AS "targetId",
         (SELECT "invoiceStatus" FROM totals) AS "targetStatus",
         (SELECT "leaseId" FROM totals) AS "leaseId",
         (SELECT "leaseStatus" FROM totals) AS "leaseStatus",
         (SELECT "invoiceStatus" FROM totals) AS "invoiceStatus",
         (SELECT "lineKind" FROM totals) AS "lineKind",
         (SELECT "lineAmount" FROM totals) AS "lineAmount",
         (SELECT "linePaid" FROM totals) AS "linePaid",
         (SELECT "lineApplied" FROM totals) AS "lineApplied",
         $3::numeric(12,2)::text AS amount,
         (SELECT "availableEscrow" FROM totals) AS "availableEscrow",
         NULL::text AS "refundStatus",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

const RECONCILE_CHECKOUT_DEPOSIT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $6::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT lease.id,
           lease.status::text AS status
      FROM leases lease
     WHERE lease.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.*,
           (
             COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target.id AND entry.kind = 'COLLECTED'), 0)
             - COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target.id AND entry.kind = 'COLLECTION_REVERSED'), 0)
             - COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target.id AND (
                          entry.kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT')
                          OR (entry.kind = 'REFUNDED' AND entry.refund_status IN ('PENDING', 'PAID'))
                        )), 0)
           )::numeric(12,2)::text AS "availableEscrow"
      FROM target
  ),
  inserted AS (
    INSERT INTO deposit_ledger_entries (
      id, lease_id, kind, amount, reason, refund_status, created_by_id, created_at
    )
    SELECT $8::uuid, totals.id,
           CASE $3::text
             WHEN 'REFUND' THEN 'REFUNDED'
             ELSE 'WITHHELD_AT_CHECKOUT'
           END,
           $4::numeric, $5::text,
           CASE $3::text
             WHEN 'REFUND' THEN 'PENDING'::"RefundStatus"
             ELSE NULL
           END,
           actor.id, CURRENT_TIMESTAMP
      FROM totals
      JOIN actor ON TRUE
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND totals.status = 'ENDED'
       AND $4::numeric <= totals."availableEscrow"::numeric
    RETURNING id, lease_id AS "leaseId", kind,
              amount::numeric(12,2)::text AS amount, reason,
              refund_status::text AS "refundStatus"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $9::uuid, actor.id,
           CASE inserted.kind
             WHEN 'REFUNDED' THEN 'DEPOSIT_REFUND_REQUESTED'
             ELSE 'DEPOSIT_WITHHELD_AT_CHECKOUT'
           END,
           'DEPOSIT_LEDGER_ENTRY', inserted.id, CURRENT_TIMESTAMP,
           inserted.reason,
           jsonb_build_object('leaseId', inserted."leaseId",
                              'kind', inserted.kind,
                              'amount', inserted.amount,
                              'refundStatus', inserted."refundStatus")
      FROM inserted
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'entryId', inserted.id,
             'leaseId', inserted."leaseId",
             'amount', inserted.amount,
             'kind', inserted.kind,
             'reason', inserted.reason,
             'refundStatus', inserted."refundStatus",
             'availableAfter', (totals."availableEscrow"::numeric
                                - inserted.amount::numeric)::numeric(12,2)::text
           ) AS data
      FROM inserted
      JOIN totals ON totals.id = inserted."leaseId"
      JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $6::uuid, 'reconcileCheckoutDeposit', 200,
           jsonb_build_object('requestHash', $7::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         (SELECT id FROM totals) AS "targetId",
         (SELECT status FROM totals) AS "targetStatus",
         (SELECT id FROM totals) AS "leaseId",
         (SELECT status FROM totals) AS "leaseStatus",
         NULL::text AS "invoiceStatus",
         NULL::text AS "lineKind",
         NULL::numeric(12,2)::text AS "lineAmount",
         NULL::numeric(12,2)::text AS "linePaid",
         NULL::numeric(12,2)::text AS "lineApplied",
         $4::numeric(12,2)::text AS amount,
         (SELECT "availableEscrow" FROM totals) AS "availableEscrow",
         NULL::text AS "refundStatus",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

const RESOLVE_CHECKOUT_REFUND_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $4::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT entry.id,
           entry.lease_id AS "leaseId",
           entry.kind,
           entry.amount::numeric(12,2)::text AS amount,
           entry.refund_status::text AS "refundStatus"
      FROM deposit_ledger_entries entry
     WHERE entry.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.*,
           (
             COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target."leaseId" AND entry.kind = 'COLLECTED'), 0)
             - COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target."leaseId" AND entry.kind = 'COLLECTION_REVERSED'), 0)
             - COALESCE((SELECT SUM(entry.amount) FROM deposit_ledger_entries entry
                        WHERE entry.lease_id = target."leaseId" AND (
                          entry.kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT')
                          OR (entry.kind = 'REFUNDED' AND entry.refund_status IN ('PENDING', 'PAID'))
                        )), 0)
           )::numeric(12,2)::text AS "availableEscrow"
      FROM target
  ),
  updated AS (
    UPDATE deposit_ledger_entries entry
       SET refund_status = $3::"RefundStatus"
      FROM totals
      JOIN actor ON TRUE
     WHERE entry.id = totals.id
       AND totals.kind = 'REFUNDED'
       AND totals."refundStatus" = 'PENDING'
       AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING entry.id,
              entry.lease_id AS "leaseId",
              entry.amount::numeric(12,2)::text AS amount,
              entry.refund_status::text AS status
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $5::uuid, actor.id,
           CASE updated.status
             WHEN 'PAID' THEN 'DEPOSIT_REFUND_PAID'
             ELSE 'DEPOSIT_REFUND_REJECTED'
           END,
           'DEPOSIT_LEDGER_ENTRY', updated.id, CURRENT_TIMESTAMP, NULL,
           jsonb_build_object('leaseId', updated."leaseId",
                              'amount', updated.amount,
                              'status', updated.status)
      FROM updated
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'entryId', updated.id,
             'leaseId', updated."leaseId",
             'amount', updated.amount,
             'status', updated.status,
             'availableAfter', (totals."availableEscrow"::numeric
               + CASE WHEN updated.status = 'REJECTED'
                 THEN updated.amount::numeric ELSE 0 END)::numeric(12,2)::text
           ) AS data
      FROM updated
      JOIN totals ON totals.id = updated.id
      JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $4::uuid, 'resolveCheckoutRefund', 200,
           jsonb_build_object('requestHash', $6::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         (SELECT id FROM totals) AS "targetId",
         (SELECT kind FROM totals) AS "targetStatus",
         (SELECT "leaseId" FROM totals) AS "leaseId",
         NULL::text AS "leaseStatus",
         NULL::text AS "invoiceStatus",
         NULL::text AS "lineKind",
         NULL::numeric(12,2)::text AS "lineAmount",
         NULL::numeric(12,2)::text AS "linePaid",
         NULL::numeric(12,2)::text AS "lineApplied",
         (SELECT amount FROM totals) AS amount,
         (SELECT "availableEscrow" FROM totals) AS "availableEscrow",
         (SELECT "refundStatus" FROM totals) AS "refundStatus",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function firstRow(results: unknown[][], index: number): unknown {
  return Array.isArray(results[index]) ? results[index]?.[0] : undefined;
}

function parseAttempt(row: unknown) {
  const result = attemptSchema.safeParse(row);
  if (!result.success) throw new DomainError("INTERNAL_ERROR");
  return result.data;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function parseResponse<T>(value: unknown, requestHash: string, schema: z.ZodType<T>): T {
  const parsed = storedResponseSchema.safeParse(parseJson(value));
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  if (parsed.data.requestHash !== requestHash) throw new DomainError("CONFLICT");
  const data = schema.safeParse(parsed.data.data);
  if (!data.success) throw new DomainError("INTERNAL_ERROR");
  return data.data;
}

function existingResponse<T>(
  attempt: z.infer<typeof attemptSchema>,
  operation: string,
  requestHash: string,
  schema: z.ZodType<T>,
): T | null {
  if (attempt.existingOperation === null) return null;
  const parsed = idempotencyRowSchema.safeParse({
    operation: attempt.existingOperation,
    responseCode: attempt.existingResponseCode,
    responsePayload: attempt.existingResponsePayload,
    completedAt: attempt.existingCompletedAt,
  });
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  if (
    parsed.data.operation !== operation ||
    parsed.data.responseCode !== 200 ||
    parsed.data.responsePayload === null ||
    parsed.data.completedAt === null
  ) {
    throw new DomainError("CONFLICT");
  }
  return parseResponse(parsed.data.responsePayload, requestHash, schema);
}

function checkOwner(attempt: z.infer<typeof attemptSchema>) {
  if (!attempt.actorId || !attempt.actorRole) throw new DomainError("UNAUTHENTICATED");
  if (attempt.actorRole !== "OWNER") throw new DomainError("NOT_OWNER");
}

function cents(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function mapDepositPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";
  if (message.includes("DEPOSIT_INSUFFICIENT")) return new DomainError("DEPOSIT_INSUFFICIENT");
  if (message.includes("INVOICE_LINE") || message.includes("INVOICE_REQUIRES")) {
    return new DomainError("INVOICE_CLOSED");
  }
  if (["23505", "23503", "23P01", "40001", "40P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

export function createDepositRepository(): DepositRepository {
  return {
    async settleInvoiceFromDeposit(input) {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(
            `SELECT lease.id
               FROM leases lease
               JOIN invoices invoice ON invoice.lease_id = lease.id
               JOIN invoice_lines line ON line.invoice_id = invoice.id
              WHERE line.id = $1::uuid
              FOR UPDATE OF lease`,
            [input.invoiceLineId],
          ),
          sql.query(
            `SELECT invoice.id
               FROM invoices invoice
               JOIN invoice_lines line ON line.invoice_id = invoice.id
              WHERE line.id = $1::uuid
              FOR UPDATE OF invoice`,
            [input.invoiceLineId],
          ),
          sql.query(
            `SELECT id FROM invoice_lines WHERE id = $1::uuid FOR UPDATE`,
            [input.invoiceLineId],
          ),
          sql.query(SETTLE_INVOICE_FROM_DEPOSIT_SQL, [
            input.actorId,
            input.invoiceLineId,
            input.amount,
            input.reason,
            input.idempotencyKey,
            input.requestHash,
            randomUUID(),
            randomUUID(),
          ]),
        ]);
      } catch (error) {
        throw mapDepositPersistenceError(error);
      }

      const attempt = parseAttempt(firstRow(results, 4));
      checkOwner(attempt);
      const prior = existingResponse(
        attempt,
        "settleInvoiceFromDeposit",
        input.requestHash,
        depositSettlementResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("INVOICE_NOT_FOUND");
      if (attempt.invoiceStatus !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
      if (attempt.lineKind !== "RENT") throw new DomainError("AMOUNT_INVALID");
      if (!attempt.amount || !attempt.lineAmount || !attempt.linePaid || !attempt.lineApplied) {
        throw new DomainError("INTERNAL_ERROR");
      }
      if (cents(attempt.amount) > cents(attempt.lineAmount) - cents(attempt.linePaid) - cents(attempt.lineApplied)) {
        throw new DomainError("OVERPAYMENT");
      }
      if (!attempt.availableEscrow || cents(attempt.amount) > cents(attempt.availableEscrow)) {
        throw new DomainError("DEPOSIT_INSUFFICIENT");
      }
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, depositSettlementResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },

    async reconcileCheckoutDeposit(input) {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(
            `SELECT id FROM leases WHERE id = $1::uuid FOR UPDATE`,
            [input.leaseId],
          ),
          sql.query(RECONCILE_CHECKOUT_DEPOSIT_SQL, [
            input.actorId,
            input.leaseId,
            input.mode,
            input.amount,
            input.reason,
            input.idempotencyKey,
            input.requestHash,
            randomUUID(),
            randomUUID(),
          ]),
        ]);
      } catch (error) {
        throw mapDepositPersistenceError(error);
      }

      const attempt = parseAttempt(firstRow(results, 2));
      checkOwner(attempt);
      const prior = existingResponse(
        attempt,
        "reconcileCheckoutDeposit",
        input.requestHash,
        checkoutDepositResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("NOT_FOUND");
      if (attempt.leaseStatus !== "ENDED") throw new DomainError("LEASE_NOT_ENDED");
      if (!attempt.amount || !attempt.availableEscrow) throw new DomainError("INTERNAL_ERROR");
      if (cents(attempt.amount) > cents(attempt.availableEscrow)) {
        throw new DomainError("DEPOSIT_INSUFFICIENT");
      }
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, checkoutDepositResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },

    async resolveCheckoutRefund(input) {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(
            `SELECT lease.id
               FROM leases lease
               JOIN deposit_ledger_entries entry ON entry.lease_id = lease.id
              WHERE entry.id = $1::uuid
              FOR UPDATE OF lease`,
            [input.entryId],
          ),
          sql.query(
            `SELECT id FROM deposit_ledger_entries WHERE id = $1::uuid FOR UPDATE`,
            [input.entryId],
          ),
          sql.query(RESOLVE_CHECKOUT_REFUND_SQL, [
            input.actorId,
            input.entryId,
            input.status,
            input.idempotencyKey,
            randomUUID(),
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        throw mapDepositPersistenceError(error);
      }

      const attempt = parseAttempt(firstRow(results, 3));
      checkOwner(attempt);
      const prior = existingResponse(
        attempt,
        "resolveCheckoutRefund",
        input.requestHash,
        checkoutRefundResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("NOT_FOUND");
      if (attempt.targetStatus !== "REFUNDED") throw new DomainError("CONFLICT");
      if (attempt.refundStatus !== "PENDING") throw new DomainError("CONFLICT");
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, checkoutRefundResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },
  };
}
