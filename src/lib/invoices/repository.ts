import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  InvoiceRecord,
  InvoiceRepository,
  VoidInvoiceInput,
} from "./operations.mjs";

const invoiceLineSchema = z.object({
  id: z.string().uuid(),
  kind: z.string().min(1),
  amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  description: z.string(),
}).strict();

const invoiceRecordSchema = z.object({
  id: z.string().uuid(),
  leaseId: z.string().uuid(),
  tenantUserId: z.string().uuid(),
  tenantName: z.string(),
  roomId: z.string().uuid(),
  roomCode: z.string(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.string().min(1),
  status: z.enum(["ISSUED", "VOID"]),
  deliveryStatus: z.enum(["UNSENT", "SENT"]),
  issuedAt: z.string().datetime({ offset: true }),
  deliveredAt: z.string().datetime({ offset: true }).nullable(),
  voidedAt: z.string().datetime({ offset: true }).nullable(),
  amountDue: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  amountPaid: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  lines: z.array(invoiceLineSchema).min(1),
}).strict();

const invoiceRowsSchema = z.array(invoiceRecordSchema);

const deliveredResultSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.literal("ISSUED"),
  deliveryStatus: z.literal("SENT"),
  channel: z.literal("MANUAL"),
  deliveredAt: z.string().datetime({ offset: true }).nullable(),
}).strict();

const voidResultSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.literal("VOID"),
  voidedAt: z.string().datetime({ offset: true }),
}).strict();

const idempotencyRowSchema = z.object({
  operation: z.string(),
  responseCode: z.number().int().nullable(),
  responsePayload: z.unknown().nullable(),
  completedAt: z.string().nullable(),
});

const storedVoidResponseSchema = z.object({
  requestHash: z.string().regex(/^[a-f0-9]{64}$/),
  data: voidResultSchema,
}).strict();

const voidAttemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  authorizedActorId: z.string().uuid().nullable(),
  invoiceStatus: z.enum(["ISSUED", "VOID"]).nullable(),
  pendingPaymentCount: z.number().int().nonnegative(),
  activeVerifiedPaymentCount: z.number().int().nonnegative(),
  resultInvoiceId: z.string().uuid().nullable(),
  resultVoidedAt: z.string().datetime({ offset: true }).nullable(),
  auditEventId: z.string().uuid().nullable(),
  savedResponsePayload: z.unknown().nullable(),
});

const invoiceSelect = `
  SELECT invoice.id,
         lease.id AS "leaseId",
         lease.tenant_user_id AS "tenantUserId",
         tenant.display_name AS "tenantName",
         room.id AS "roomId",
         room.code AS "roomCode",
         invoice.period_start::text AS "periodStart",
         invoice.period_end::text AS "periodEnd",
         invoice.due_on::text AS "dueOn",
         invoice.kind,
         invoice.status::text AS status,
         invoice.delivery_status::text AS "deliveryStatus",
         to_char(invoice.issued_at AT TIME ZONE 'UTC',
                 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "issuedAt",
         (
           SELECT to_char(event.occurred_at AT TIME ZONE 'UTC',
                          'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
             FROM audit_events AS event
            WHERE event.entity_type = 'INVOICE'
              AND event.entity_id = invoice.id
              AND event.action = 'INVOICE_DELIVERED'
            ORDER BY event.occurred_at DESC, event.id DESC
            LIMIT 1
         ) AS "deliveredAt",
         CASE WHEN invoice.voided_at IS NULL THEN NULL ELSE
           to_char(invoice.voided_at AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
         END AS "voidedAt",
         totals."amountDue",
         paid."amountPaid",
         totals.lines
    FROM invoices AS invoice
    JOIN leases AS lease ON lease.id = invoice.lease_id
    JOIN app_users AS tenant ON tenant.id = lease.tenant_user_id
    JOIN rooms AS room ON room.id = lease.room_id
    CROSS JOIN authorized_actor AS actor
    CROSS JOIN LATERAL (
      SELECT COALESCE(SUM(line.amount), 0)::text AS "amountDue",
             COALESCE(
               jsonb_agg(
                 jsonb_build_object(
                   'id', line.id,
                   'kind', line.kind,
                   'amount', line.amount::text,
                   'description', line.description
                 ) ORDER BY line.id
               ),
               '[]'::jsonb
             ) AS lines
        FROM invoice_lines AS line
       WHERE line.invoice_id = invoice.id
    ) AS totals
    CROSS JOIN LATERAL (
      SELECT COALESCE(SUM(allocation.amount), 0)::text AS "amountPaid"
        FROM payment_allocations AS allocation
        JOIN invoice_lines AS line ON line.id = allocation.invoice_line_id
        JOIN payments AS payment ON payment.id = allocation.payment_id
       WHERE line.invoice_id = invoice.id
         AND payment.invoice_id = invoice.id
         AND payment.status = 'VERIFIED'::"PaymentStatus"
         AND NOT EXISTS (
           SELECT 1 FROM payment_reversals AS reversal
            WHERE reversal.payment_id = payment.id
         )
    ) AS paid`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function parseRows(rows: unknown[]): InvoiceRecord[] {
  try {
    return invoiceRowsSchema.parse(rows);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function parseStoredResponse(row: unknown, requestHash: string) {
  let key: z.infer<typeof idempotencyRowSchema>;
  try {
    key = idempotencyRowSchema.parse(row);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }

  if (
    key.operation !== "voidInvoice" ||
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

  const stored = storedVoidResponseSchema.safeParse(payload);
  if (!stored.success) throw new DomainError("INTERNAL_ERROR");
  if (stored.data.requestHash !== requestHash) throw new DomainError("CONFLICT");
  return stored.data.data;
}

function throwVoidFailure(attempt: z.infer<typeof voidAttemptSchema>): never {
  if (!attempt.authorizedActorId) throw new DomainError("FORBIDDEN");
  if (!attempt.invoiceStatus) throw new DomainError("INVOICE_NOT_FOUND");
  if (attempt.invoiceStatus === "VOID") throw new DomainError("INVOICE_ALREADY_VOID");
  if (attempt.pendingPaymentCount > 0) {
    throw new DomainError("PENDING_PAYMENT_EXISTS");
  }
  if (attempt.activeVerifiedPaymentCount > 0) {
    throw new DomainError("VERIFIED_PAYMENT_UNREVERSED");
  }
  throw new DomainError("INTERNAL_ERROR");
}

const VOID_INVOICE_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $3::uuid
  ),
  authorized_actor AS MATERIALIZED (
    SELECT id
      FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT invoice.id, invoice.status::text AS status
      FROM invoices AS invoice
     WHERE invoice.id = $2::uuid
     FOR UPDATE OF invoice
  ),
  payment_state AS MATERIALIZED (
    SELECT COUNT(*) FILTER (
             WHERE payment.status = 'PENDING'::"PaymentStatus"
           )::integer AS "pendingPaymentCount",
           COUNT(*) FILTER (
             WHERE payment.status = 'VERIFIED'::"PaymentStatus"
               AND NOT EXISTS (
                 SELECT 1 FROM payment_reversals AS reversal
                  WHERE reversal.payment_id = payment.id
               )
           )::integer AS "activeVerifiedPaymentCount"
      FROM payments AS payment
      JOIN target ON target.id = payment.invoice_id
  ),
  updated AS (
    UPDATE invoices AS invoice
       SET status = 'VOID'::"InvoiceStatus",
           voided_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
      FROM target, authorized_actor, payment_state
     WHERE invoice.id = target.id
       AND target.status = 'ISSUED'
       AND payment_state."pendingPaymentCount" = 0
       AND payment_state."activeVerifiedPaymentCount" = 0
       AND NOT EXISTS (SELECT 1 FROM existing)
     RETURNING invoice.id,
               to_char(invoice.voided_at AT TIME ZONE 'UTC',
                       'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "voidedAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $5::uuid,
           actor.id,
           'INVOICE_VOIDED',
           'INVOICE',
           updated.id,
           CURRENT_TIMESTAMP,
           $4::text,
           jsonb_build_object('status', 'VOID')
      FROM updated
      CROSS JOIN authorized_actor AS actor
    RETURNING id
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $3::uuid,
           'voidInvoice',
           200,
           jsonb_build_object(
             'requestHash', $6::text,
             'data', jsonb_build_object(
               'invoiceId', updated.id,
               'status', 'VOID',
               'voidedAt', updated."voidedAt"
             )
           ),
           CURRENT_TIMESTAMP
      FROM updated
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM authorized_actor) AS "authorizedActorId",
         (SELECT status FROM target) AS "invoiceStatus",
         COALESCE((SELECT "pendingPaymentCount" FROM payment_state), 0)::integer
           AS "pendingPaymentCount",
         COALESCE((SELECT "activeVerifiedPaymentCount" FROM payment_state), 0)::integer
           AS "activeVerifiedPaymentCount",
         (SELECT id FROM updated) AS "resultInvoiceId",
         (SELECT "voidedAt" FROM updated) AS "resultVoidedAt",
         (SELECT id FROM audit) AS "auditEventId",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

async function classifyGuardedVoidFailure(sql: ReturnType<typeof getSql>, invoiceId: string) {
  const rows: unknown[] = await sql.query(
    `SELECT COUNT(*) FILTER (
              WHERE payment.status = 'PENDING'::"PaymentStatus"
            )::integer AS "pendingPaymentCount",
            COUNT(*) FILTER (
              WHERE payment.status = 'VERIFIED'::"PaymentStatus"
                AND NOT EXISTS (
                  SELECT 1 FROM payment_reversals AS reversal
                   WHERE reversal.payment_id = payment.id
                )
            )::integer AS "activeVerifiedPaymentCount"
       FROM payments AS payment
      WHERE payment.invoice_id = $1::uuid`,
    [invoiceId],
  );
  const state = z.object({
    pendingPaymentCount: z.number().int().nonnegative(),
    activeVerifiedPaymentCount: z.number().int().nonnegative(),
  }).safeParse(rows[0]);
  if (!state.success) throw new DomainError("INTERNAL_ERROR");
  if (state.data.pendingPaymentCount > 0) {
    throw new DomainError("PENDING_PAYMENT_EXISTS");
  }
  if (state.data.activeVerifiedPaymentCount > 0) {
    throw new DomainError("VERIFIED_PAYMENT_UNREVERSED");
  }
  throw new DomainError("CONFLICT");
}

export function createInvoiceRepository(): InvoiceRepository {
  return {
    async listInvoices({ actorId, limit, cursor }) {
      const sql = getSql();
      const rows: unknown[] = await sql.query(
        `WITH authorized_actor AS MATERIALIZED (
           SELECT id, role
             FROM app_users
            WHERE id = $1::uuid
              AND is_active
              AND NOT must_change_password
              AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole", 'TENANT'::"AppRole")
         )
         ${invoiceSelect}
          WHERE (actor.role <> 'TENANT'::"AppRole"
                 OR lease.tenant_user_id = actor.id)
            AND ($3::date IS NULL
                 OR (invoice.due_on, invoice.id) < ($3::date, $4::uuid))
          ORDER BY invoice.due_on DESC, invoice.id DESC
          LIMIT $2::integer`,
        [actorId, limit, cursor?.dueOn ?? null, cursor?.id ?? null],
      );
      return parseRows(rows);
    },

    async getInvoice({ actorId, invoiceId }) {
      const sql = getSql();
      const rows: unknown[] = await sql.query(
        `WITH authorized_actor AS MATERIALIZED (
           SELECT id, role
             FROM app_users
            WHERE id = $1::uuid
              AND is_active
              AND NOT must_change_password
              AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole", 'TENANT'::"AppRole")
         )
         ${invoiceSelect}
          WHERE invoice.id = $2::uuid
            AND (actor.role <> 'TENANT'::"AppRole"
                 OR lease.tenant_user_id = actor.id)
          LIMIT 1`,
        [actorId, invoiceId],
      );
      return parseRows(rows)[0] ?? null;
    },

    async markInvoiceDelivered({ actorId, invoiceId, channel }) {
      const sql = getSql();
      const auditId = randomUUID();
      const rows: unknown[] = await sql.query(
        `WITH authorized_actor AS MATERIALIZED (
           SELECT id
             FROM app_users
            WHERE id = $1::uuid
              AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole")
              AND is_active
              AND NOT must_change_password
         ),
         target AS MATERIALIZED (
           SELECT invoice.id,
                  invoice.status::text AS status,
                  invoice.delivery_status::text AS "deliveryStatus"
             FROM invoices AS invoice
             CROSS JOIN authorized_actor
            WHERE invoice.id = $2::uuid
             FOR UPDATE OF invoice
         ),
         changed AS (
           UPDATE invoices AS invoice
              SET delivery_status = 'SENT'::"InvoiceDeliveryStatus",
                  updated_at = CURRENT_TIMESTAMP
             FROM target
            WHERE invoice.id = target.id
              AND invoice.status = 'ISSUED'::"InvoiceStatus"
              AND invoice.delivery_status = 'UNSENT'::"InvoiceDeliveryStatus"
              AND target.status = 'ISSUED'
              AND target."deliveryStatus" = 'UNSENT'
            RETURNING invoice.id
         ),
         audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at,
             reason, safe_metadata
           )
           SELECT $3::uuid,
                  actor.id,
                  'INVOICE_DELIVERED',
                  'INVOICE',
                  changed.id,
                  CURRENT_TIMESTAMP,
                  NULL,
                  jsonb_build_object('channel', $4::text)
             FROM changed
             CROSS JOIN authorized_actor AS actor
           RETURNING occurred_at
         )
         SELECT (SELECT id FROM authorized_actor) AS "authorizedActorId",
                target.id AS "invoiceId",
                target.status,
                CASE WHEN target.id IS NULL THEN NULL ELSE 'SENT' END AS "deliveryStatus",
                COALESCE(
                  (SELECT to_char(audit.occurred_at AT TIME ZONE 'UTC',
                                  'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') FROM audit),
                  (
                    SELECT to_char(event.occurred_at AT TIME ZONE 'UTC',
                                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
                      FROM audit_events AS event
                     WHERE event.entity_type = 'INVOICE'
                       AND event.entity_id = target.id
                       AND event.action = 'INVOICE_DELIVERED'
                     ORDER BY event.occurred_at DESC, event.id DESC
                     LIMIT 1
                  )
                ) AS "deliveredAt"
           FROM (SELECT 1) AS request
           LEFT JOIN target ON TRUE`,
        [actorId, invoiceId, auditId, channel],
      );

      const result = z.object({
        authorizedActorId: z.string().uuid().nullable(),
        invoiceId: z.string().uuid().nullable(),
        status: z.enum(["ISSUED", "VOID"]).nullable(),
        deliveryStatus: z.literal("SENT").nullable(),
        deliveredAt: z.string().datetime({ offset: true }).nullable(),
      }).safeParse(rows[0]);
      if (!result.success) throw new DomainError("INTERNAL_ERROR");
      if (!result.data.authorizedActorId) throw new DomainError("FORBIDDEN");
      if (!result.data.invoiceId || !result.data.status) {
        throw new DomainError("INVOICE_NOT_FOUND");
      }
      if (result.data.status === "VOID") throw new DomainError("INVOICE_ALREADY_VOID");

      return deliveredResultSchema.parse({
        invoiceId: result.data.invoiceId,
        status: result.data.status,
        deliveryStatus: result.data.deliveryStatus,
        channel,
        deliveredAt: result.data.deliveredAt,
      });
    },

    async voidInvoice(input: VoidInvoiceInput) {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(VOID_INVOICE_SQL, [
            input.actorId,
            input.invoiceId,
            input.idempotencyKey,
            input.reason,
            randomUUID(),
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        const record = error && typeof error === "object" ? error : {};
        const message = "message" in record && typeof record.message === "string"
          ? record.message
          : "";
        if (message.includes("INVOICE_PAYMENT_VOID_DENIED")) {
          await classifyGuardedVoidFailure(sql, input.invoiceId);
        }
        throw mapPersistenceError(error);
      }

      const attemptResult = voidAttemptSchema.safeParse(results[1]?.[0]);
      if (!attemptResult.success) throw new DomainError("INTERNAL_ERROR");
      const attempt = attemptResult.data;

      if (attempt.existingOperation !== null) {
        return parseStoredResponse({
          operation: attempt.existingOperation,
          responseCode: attempt.existingResponseCode,
          responsePayload: attempt.existingResponsePayload,
          completedAt: attempt.existingCompletedAt,
        }, input.requestHash);
      }

      if (attempt.resultInvoiceId && attempt.resultVoidedAt) {
        if (!attempt.auditEventId || attempt.savedResponsePayload === null) {
          throw new DomainError("INTERNAL_ERROR");
        }
        return voidResultSchema.parse({
          invoiceId: attempt.resultInvoiceId,
          status: "VOID",
          voidedAt: attempt.resultVoidedAt,
        });
      }

      return throwVoidFailure(attempt);
    },
  };
}
