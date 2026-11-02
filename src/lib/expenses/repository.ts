import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  ExpenseRecord,
  ExpenseRepository,
  ExpenseReversalRecord,
  RecordExpenseRepositoryInput,
  ReverseExpenseRepositoryInput,
} from "./operations.mjs";

const roleSchema = z.enum(["OWNER", "STAFF", "TENANT"]);
const moneyTextSchema = z.string().regex(/^\d+\.\d{2}$/);

const expenseRecordSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  amount: moneyTextSchema,
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  recordedById: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
}).strict();

const expenseReversalSchema = z.object({
  id: z.string().uuid(),
  expenseId: z.string().uuid(),
  amount: moneyTextSchema,
  reason: z.string().min(1),
  createdById: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
}).strict();

const attemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  actorId: z.string().uuid().nullable(),
  actorRole: roleSchema.nullable(),
  resultId: z.string().uuid().nullable(),
  resultExpenseId: z.string().uuid().nullable(),
  resultCategory: z.string().nullable(),
  resultAmount: z.string().nullable(),
  resultDate: z.string().nullable(),
  resultDescription: z.string().nullable(),
  resultReason: z.string().nullable(),
  resultRecordedById: z.string().uuid().nullable(),
  resultCreatedById: z.string().uuid().nullable(),
  resultCreatedAt: z.string().nullable(),
  hasPriorReversal: z.boolean(),
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

const RECORD_EXPENSE_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $2::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole")
       AND is_active
       AND NOT must_change_password
  ),
  inserted AS (
    INSERT INTO expenses (
      id, category, amount, occurred_on, description, recorded_by_id
    )
    SELECT $3::uuid, $4::text, $5::numeric(12,2), $6::date,
           $7::text, actor.id
      FROM actor
     WHERE NOT EXISTS (SELECT 1 FROM existing)
    RETURNING id, category, amount, occurred_on AS "occurredOn",
              description, recorded_by_id AS "recordedById",
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $8::uuid, actor.id, 'EXPENSE_RECORDED', 'EXPENSE', inserted.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object(
             'category', inserted.category,
             'amount', inserted.amount::numeric(12,2)::text,
             'occurredOn', inserted."occurredOn"
           )
      FROM inserted
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'id', inserted.id,
             'category', inserted.category,
             'amount', inserted.amount::numeric(12,2)::text,
             'occurredOn', inserted."occurredOn",
             'description', inserted.description,
             'recordedById', inserted."recordedById",
             'createdAt', inserted."createdAt"
           ) AS data
      FROM inserted
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $2::uuid, 'recordExpense', 200,
           jsonb_build_object('requestHash', $9::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         (SELECT id FROM inserted) AS "resultId",
         NULL::uuid AS "resultExpenseId",
         (SELECT category FROM inserted) AS "resultCategory",
         (SELECT amount::numeric(12,2)::text FROM inserted) AS "resultAmount",
         (SELECT "occurredOn"::text FROM inserted) AS "resultDate",
         (SELECT description FROM inserted) AS "resultDescription",
         NULL::text AS "resultReason",
         (SELECT "recordedById" FROM inserted) AS "resultRecordedById",
         NULL::uuid AS "resultCreatedById",
         (SELECT "createdAt" FROM inserted) AS "resultCreatedAt",
         false AS "hasPriorReversal",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) AS request
`;

const REVERSE_EXPENSE_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation,
           response_code AS "responseCode",
           response_payload AS "responsePayload",
           completed_at::text AS "completedAt"
      FROM idempotency_keys
     WHERE "key" = $3::uuid
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
    SELECT id, amount
      FROM expenses
     WHERE id = $2::uuid
       AND NOT EXISTS (SELECT 1 FROM existing)
  ),
  prior_reversal AS MATERIALIZED (
    SELECT id
      FROM expense_reversals
     WHERE expense_id = $2::uuid
  ),
  inserted AS (
    INSERT INTO expense_reversals (
      id, expense_id, amount, reason, created_by_id
    )
    SELECT $4::uuid, target.id, target.amount, $5::text, actor.id
      FROM target
      JOIN actor ON TRUE
     WHERE NOT EXISTS (SELECT 1 FROM prior_reversal)
    RETURNING id, expense_id AS "expenseId",
              amount::numeric(12,2)::text AS amount, reason,
              created_by_id AS "createdById",
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $6::uuid, actor.id, 'EXPENSE_REVERSED', 'EXPENSE', inserted."expenseId",
           CURRENT_TIMESTAMP, inserted.reason,
           jsonb_build_object('amount', inserted.amount, 'reversalId', inserted.id)
      FROM inserted
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'id', inserted.id,
             'expenseId', inserted."expenseId",
             'amount', inserted.amount,
             'reason', inserted.reason,
             'createdById', inserted."createdById",
             'createdAt', inserted."createdAt"
           ) AS data
      FROM inserted
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $3::uuid, 'reverseExpense', 200,
           jsonb_build_object('requestHash', $7::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
      JOIN audit ON TRUE
    RETURNING response_payload AS "responsePayload"
  )
  SELECT (SELECT operation FROM existing) AS "existingOperation",
         (SELECT "responseCode" FROM existing) AS "existingResponseCode",
         (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
         (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
         (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         (SELECT id FROM inserted) AS "resultId",
         (SELECT "expenseId" FROM inserted) AS "resultExpenseId",
         NULL::text AS "resultCategory",
         (SELECT amount FROM inserted) AS "resultAmount",
         NULL::text AS "resultDate",
         NULL::text AS "resultDescription",
         (SELECT reason FROM inserted) AS "resultReason",
         NULL::uuid AS "resultRecordedById",
         (SELECT "createdById" FROM inserted) AS "resultCreatedById",
         (SELECT "createdAt" FROM inserted) AS "resultCreatedAt",
         EXISTS (SELECT 1 FROM prior_reversal) AS "hasPriorReversal",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
    FROM (SELECT 1) AS request
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

function priorResponse<T>(
  attempt: z.infer<typeof attemptSchema>,
  operation: string,
  requestHash: string,
  schema: z.ZodType<T>,
): T | null {
  if (attempt.existingOperation === null) return null;

  const saved = idempotencyRowSchema.safeParse({
    operation: attempt.existingOperation,
    responseCode: attempt.existingResponseCode,
    responsePayload: attempt.existingResponsePayload,
    completedAt: attempt.existingCompletedAt,
  });
  if (!saved.success) throw new DomainError("INTERNAL_ERROR");
  if (
    saved.data.operation !== operation ||
    saved.data.responseCode !== 200 ||
    saved.data.responsePayload === null ||
    saved.data.completedAt === null
  ) {
    throw new DomainError("CONFLICT");
  }

  const payload = storedResponseSchema.safeParse(parseJson(saved.data.responsePayload));
  if (!payload.success) throw new DomainError("INTERNAL_ERROR");
  if (payload.data.requestHash !== requestHash) throw new DomainError("CONFLICT");

  const data = schema.safeParse(payload.data.data);
  if (!data.success) throw new DomainError("INTERNAL_ERROR");
  return data.data;
}

function assertActor(attempt: z.infer<typeof attemptSchema>, ownerOnly: boolean) {
  if (!attempt.actorId || !attempt.actorRole) throw new DomainError("FORBIDDEN");
  if (ownerOnly && attempt.actorRole !== "OWNER") throw new DomainError("NOT_OWNER");
  if (!ownerOnly && !["OWNER", "STAFF"].includes(attempt.actorRole)) {
    throw new DomainError("FORBIDDEN");
  }
}

function mapExpensePersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";
  if (message.includes("EXPENSE_NOT_FOUND")) return new DomainError("EXPENSE_NOT_FOUND");
  if (message.includes("EXPENSE_REVERSAL_OWNER_REQUIRED")) return new DomainError("NOT_OWNER");
  if (["23505", "23503", "23514", "40001", "40P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

export function createExpenseRepository(): ExpenseRepository {
  return {
    async recordExpense(input: RecordExpenseRepositoryInput): Promise<ExpenseRecord> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(RECORD_EXPENSE_SQL, [
            input.actorId,
            input.idempotencyKey,
            randomUUID(),
            input.category,
            input.amount,
            input.occurredOn,
            input.description,
            randomUUID(),
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        throw mapExpensePersistenceError(error);
      }

      const attempt = parseAttempt(firstRow(results, 1));
      assertActor(attempt, false);
      const prior = priorResponse(
        attempt,
        "recordExpense",
        input.requestHash,
        expenseRecordSchema,
      );
      if (prior) return prior;
      if (!attempt.resultId || !attempt.actorId || !attempt.resultCategory ||
          !attempt.resultAmount || !attempt.resultDate || !attempt.resultDescription ||
          !attempt.resultRecordedById || !attempt.resultCreatedAt) {
        throw new DomainError("INTERNAL_ERROR");
      }

      const result = expenseRecordSchema.safeParse({
        id: attempt.resultId,
        category: attempt.resultCategory,
        amount: attempt.resultAmount,
        occurredOn: attempt.resultDate,
        description: attempt.resultDescription,
        recordedById: attempt.resultRecordedById,
        createdAt: attempt.resultCreatedAt,
      });
      if (!result.success) throw new DomainError("INTERNAL_ERROR");
      return result.data;
    },

    async reverseExpense(input: ReverseExpenseRepositoryInput): Promise<ExpenseReversalRecord> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.idempotencyKey],
          ),
          sql.query(
            `SELECT id FROM expenses WHERE id = $1::uuid FOR UPDATE`,
            [input.expenseId],
          ),
          sql.query(REVERSE_EXPENSE_SQL, [
            input.actorId,
            input.expenseId,
            input.idempotencyKey,
            randomUUID(),
            input.reason,
            randomUUID(),
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        throw mapExpensePersistenceError(error);
      }

      const attempt = parseAttempt(firstRow(results, 2));
      assertActor(attempt, true);
      const prior = priorResponse(
        attempt,
        "reverseExpense",
        input.requestHash,
        expenseReversalSchema,
      );
      if (prior) return prior;
      if (!attempt.resultId) {
        if (!attempt.resultExpenseId && !attempt.hasPriorReversal) {
          throw new DomainError("EXPENSE_NOT_FOUND");
        }
        throw new DomainError("ALREADY_REVERSED");
      }
      if (!attempt.resultExpenseId || !attempt.resultAmount || !attempt.resultReason ||
          !attempt.resultCreatedById || !attempt.resultCreatedAt) {
        throw new DomainError("INTERNAL_ERROR");
      }

      const result = expenseReversalSchema.safeParse({
        id: attempt.resultId,
        expenseId: attempt.resultExpenseId,
        amount: attempt.resultAmount,
        reason: attempt.resultReason,
        createdById: attempt.resultCreatedById,
        createdAt: attempt.resultCreatedAt,
      });
      if (!result.success) throw new DomainError("INTERNAL_ERROR");
      return result.data;
    },
  };
}
