import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  PaymentRecord,
  PaymentRepository,
  RecordPaymentRepositoryInput,
} from "./record-payment.mjs";

const paymentRecordSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  method: z.enum(["TRANSFER", "QRIS", "CASH"]),
  reference: z.string().nullable(),
  status: z.literal("PENDING"),
  createdAt: z.string().datetime({ offset: true }),
}).strict();

const paymentAttemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  authorizedActorId: z.string().uuid().nullable(),
  authorizedActorRole: z.enum(["OWNER", "STAFF", "TENANT"]).nullable(),
  invoiceId: z.string().uuid().nullable(),
  invoiceStatus: z.enum(["ISSUED", "VOID"]).nullable(),
  tenantUserId: z.string().uuid().nullable(),
  leaseStatus: z.enum(["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"]).nullable(),
  startsOn: z.string().nullable(),
  endsOn: z.string().nullable(),
  lineCount: z.number().int().nonnegative().nullable(),
  amountDue: z.string().nullable(),
  amountPaid: z.string().nullable(),
  resultPaymentId: z.string().uuid().nullable(),
  resultInvoiceId: z.string().uuid().nullable(),
  resultAmount: z.string().nullable(),
  resultMethod: z.enum(["TRANSFER", "QRIS", "CASH"]).nullable(),
  resultReference: z.string().nullable(),
  resultCreatedAt: z.string().datetime({ offset: true }).nullable(),
  auditEventId: z.string().uuid().nullable(),
  savedResponsePayload: z.unknown().nullable(),
}).strict();

const idempotencyRowSchema = z.object({
  operation: z.string(),
  responseCode: z.number().int().nullable(),
  responsePayload: z.unknown().nullable(),
  completedAt: z.string().nullable(),
});

const storedPaymentResponseSchema = z.object({
  requestHash: z.string().regex(/^[a-f0-9]{64}$/),
  data: paymentRecordSchema,
}).strict();

const RECORD_PAYMENT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $7::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND is_active
       AND NOT must_change_password
       AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole", 'TENANT'::"AppRole")
  ),
  target AS MATERIALIZED (
    SELECT invoice.id,
           invoice.status::text AS status,
           lease.tenant_user_id AS "tenantUserId",
           lease.status::text AS "leaseStatus",
           lease.starts_on AS "startsOnDate",
           lease.ends_on AS "endsOnDate",
           lease.starts_on::text AS "startsOn",
           lease.ends_on::text AS "endsOn"
      FROM invoices AS invoice
      JOIN leases AS lease ON lease.id = invoice.lease_id
     WHERE invoice.id = $2::uuid
  ),
  totals AS MATERIALIZED (
    SELECT target.id AS "invoiceId",
           (
             SELECT COUNT(*)::integer
               FROM invoice_lines AS line
              WHERE line.invoice_id = target.id
           ) AS "lineCount",
           COALESCE((
             SELECT SUM(line.amount)
               FROM invoice_lines AS line
              WHERE line.invoice_id = target.id
           ), 0)::text AS "amountDue",
           (
             COALESCE((
               SELECT SUM(allocation.amount)
                 FROM payment_allocations AS allocation
                 JOIN invoice_lines AS line ON line.id = allocation.invoice_line_id
                 JOIN payments AS payment ON payment.id = allocation.payment_id
                WHERE line.invoice_id = target.id
                  AND payment.invoice_id = target.id
                  AND payment.status = 'VERIFIED'::"PaymentStatus"
                  AND NOT EXISTS (
                    SELECT 1
                      FROM payment_reversals AS reversal
                     WHERE reversal.payment_id = payment.id
                  )
             ), 0)
             + COALESCE((
               SELECT SUM(entry.amount)
                 FROM deposit_ledger_entries AS entry
                 JOIN invoice_lines AS line ON line.id = entry.invoice_line_id
                WHERE line.invoice_id = target.id
                  AND entry.kind = 'APPLIED_TO_RENT'
             ), 0)
           )::numeric(12,2)::text AS "amountPaid"
      FROM target
  ),
  inserted AS (
    INSERT INTO payments (
      id, invoice_id, amount, method, status, recorded_by_id, reference,
      created_at, updated_at
    )
    SELECT $8::uuid,
           target.id,
           $3::numeric,
           $4::text,
           'PENDING'::"PaymentStatus",
           actor.id,
           $5::text,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
      FROM target
      JOIN authorized_actor AS actor ON TRUE
      JOIN totals ON totals."invoiceId" = target.id
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND target.status = 'ISSUED'
       AND (actor.role <> 'TENANT' OR target."tenantUserId" = actor.id)
       AND (
         actor.role <> 'TENANT'
         OR (
           target."leaseStatus" = 'ACTIVE'
           AND target."startsOnDate" <= $6::date
           AND (target."endsOnDate" IS NULL OR target."endsOnDate" >= $6::date)
         )
       )
       AND totals."lineCount" > 0
       AND totals."amountDue"::numeric >= totals."amountPaid"::numeric
       AND $3::numeric <= totals."amountDue"::numeric - totals."amountPaid"::numeric
    RETURNING id,
              invoice_id AS "invoiceId",
              amount::text AS amount,
              method,
              reference,
              status::text AS status,
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $9::uuid,
           actor.id,
           'PAYMENT_RECORDED',
           'PAYMENT',
           inserted.id,
           CURRENT_TIMESTAMP,
           NULL,
           jsonb_build_object(
             'invoiceId', inserted."invoiceId",
             'amount', inserted.amount,
             'method', inserted.method,
             'status', 'PENDING'
           )
      FROM inserted
      JOIN authorized_actor AS actor ON TRUE
    RETURNING id
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $7::uuid,
           'recordPayment',
           200,
           jsonb_build_object(
             'requestHash', $10::text,
             'data', jsonb_build_object(
               'id', inserted.id,
               'invoiceId', inserted."invoiceId",
               'amount', inserted.amount,
               'method', inserted.method,
               'reference', inserted.reference,
               'status', inserted.status,
               'createdAt', inserted."createdAt"
             )
           ),
           CURRENT_TIMESTAMP
      FROM inserted
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM authorized_actor) AS "authorizedActorId",
         (SELECT role FROM authorized_actor) AS "authorizedActorRole",
         target.id AS "invoiceId",
         target.status AS "invoiceStatus",
         target."tenantUserId",
         target."leaseStatus",
         target."startsOn",
         target."endsOn",
         totals."lineCount",
         totals."amountDue",
         totals."amountPaid",
         (SELECT id FROM inserted) AS "resultPaymentId",
         (SELECT "invoiceId" FROM inserted) AS "resultInvoiceId",
         (SELECT amount FROM inserted) AS "resultAmount",
         (SELECT method FROM inserted) AS "resultMethod",
         (SELECT reference FROM inserted) AS "resultReference",
         (SELECT "createdAt" FROM inserted) AS "resultCreatedAt",
         (SELECT id FROM audit) AS "auditEventId",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) AS request
    LEFT JOIN target ON TRUE
    LEFT JOIN totals ON totals."invoiceId" = target.id
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function parseAttempt(row: unknown) {
  const result = paymentAttemptSchema.safeParse(row);
  if (!result.success) throw new DomainError("INTERNAL_ERROR");
  return result.data;
}

function parseStoredResponse(row: unknown, requestHash: string): PaymentRecord {
  const parsedKey = idempotencyRowSchema.safeParse(row);
  if (!parsedKey.success) throw new DomainError("INTERNAL_ERROR");
  const key = parsedKey.data;
  if (
    key.operation !== "recordPayment" ||
    key.responseCode !== 200 ||
    key.completedAt === null ||
    key.responsePayload === null
  ) {
    throw new DomainError("CONFLICT");
  }

  let payload: unknown = key.responsePayload;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      throw new DomainError("INTERNAL_ERROR");
    }
  }

  const stored = storedPaymentResponseSchema.safeParse(payload);
  if (!stored.success) throw new DomainError("INTERNAL_ERROR");
  if (stored.data.requestHash !== requestHash) throw new DomainError("CONFLICT");
  return stored.data.data;
}

function moneyToCents(value: string): bigint {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new DomainError("INTERNAL_ERROR");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function throwRecordFailure(
  attempt: ReturnType<typeof parseAttempt>,
  input: RecordPaymentRepositoryInput,
): never {
  if (attempt.authorizedActorId !== input.actorId || !attempt.authorizedActorRole) {
    throw new DomainError("FORBIDDEN");
  }

  if (!attempt.invoiceId || !attempt.invoiceStatus) {
    throw new DomainError(attempt.authorizedActorRole === "TENANT"
      ? "INVOICE_NOT_OWNED"
      : "INVOICE_NOT_FOUND");
  }

  if (
    attempt.authorizedActorRole === "TENANT" &&
    attempt.tenantUserId !== input.actorId
  ) {
    throw new DomainError("INVOICE_NOT_OWNED");
  }

  if (attempt.invoiceStatus !== "ISSUED") throw new DomainError("INVOICE_CLOSED");

  if (
    attempt.authorizedActorRole === "TENANT" &&
    (
      attempt.leaseStatus !== "ACTIVE" ||
      !attempt.startsOn ||
      attempt.startsOn > input.localDate ||
      (attempt.endsOn !== null && attempt.endsOn < input.localDate)
    )
  ) {
    throw new DomainError("LEASE_ENDED");
  }

  if (attempt.lineCount === null || attempt.lineCount === 0 || !attempt.amountDue || !attempt.amountPaid) {
    throw new DomainError("INTERNAL_ERROR");
  }

  const due = moneyToCents(attempt.amountDue);
  const paid = moneyToCents(attempt.amountPaid);
  if (paid > due) throw new DomainError("INTERNAL_ERROR");
  if (moneyToCents(input.amount) > due - paid) throw new DomainError("OVERPAYMENT");

  throw new DomainError("INTERNAL_ERROR");
}

function mapPaymentPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "23505" || error.code === "23503")
  ) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

export function createPaymentRepository(): PaymentRepository {
  return {
    async recordPayment(input: RecordPaymentRepositoryInput): Promise<PaymentRecord> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(
            `SELECT id FROM invoices WHERE id = $1::uuid FOR UPDATE`,
            [input.invoiceId],
          ),
          sql.query(RECORD_PAYMENT_SQL, [
            input.actorId,
            input.invoiceId,
            input.amount,
            input.method,
            input.reference,
            input.localDate,
            input.idempotencyKey,
            randomUUID(),
            randomUUID(),
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        throw mapPaymentPersistenceError(error);
      }

      const attempt = parseAttempt(results[2]?.[0]);
      if (attempt.authorizedActorId !== input.actorId || !attempt.authorizedActorRole) {
        throw new DomainError("FORBIDDEN");
      }

      if (attempt.existingOperation !== null) {
        return parseStoredResponse({
          operation: attempt.existingOperation,
          responseCode: attempt.existingResponseCode,
          responsePayload: attempt.existingResponsePayload,
          completedAt: attempt.existingCompletedAt,
        }, input.requestHash);
      }

      if (attempt.resultPaymentId && attempt.resultInvoiceId && attempt.resultAmount && attempt.resultMethod && attempt.resultCreatedAt) {
        if (!attempt.auditEventId || attempt.savedResponsePayload === null) {
          throw new DomainError("INTERNAL_ERROR");
        }
        return paymentRecordSchema.parse({
          id: attempt.resultPaymentId,
          invoiceId: attempt.resultInvoiceId,
          amount: attempt.resultAmount,
          method: attempt.resultMethod,
          reference: attempt.resultReference,
          status: "PENDING",
          createdAt: attempt.resultCreatedAt,
        });
      }

      return throwRecordFailure(attempt, input);
    },
  };
}
