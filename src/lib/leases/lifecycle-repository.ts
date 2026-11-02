import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";

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
  targetStartsOn: z.string().nullable(),
  targetEndsOn: z.string().nullable(),
  targetTenantId: z.string().uuid().nullable(),
  targetCurrent: z.boolean().nullable(),
  pendingRequest: z.boolean(),
  requestStatus: z.string().nullable(),
  leaseStatus: z.string().nullable(),
  dateValid: z.boolean().nullable(),
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

const leaseEndRequestResultSchema = z.object({
  requestId: z.string().uuid(),
  leaseId: z.string().uuid(),
  requestedEndOn: z.string(),
  status: z.literal("PENDING"),
  createdAt: z.string().datetime({ offset: true }),
}).strict();

const leaseEndResultSchema = z.object({
  leaseId: z.string().uuid(),
  roomId: z.string().uuid(),
  status: z.literal("ENDED"),
  endsOn: z.string(),
}).strict();

const leaseEndReviewResultSchema = z.object({
  requestId: z.string().uuid(),
  leaseId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED"]),
  leaseStatus: z.string(),
  endsOn: z.string().nullable(),
}).strict();

export type LeaseEndRequestResult = z.infer<typeof leaseEndRequestResultSchema>;
export type LeaseEndResult = z.infer<typeof leaseEndResultSchema>;
export type LeaseEndReviewResult = z.infer<typeof leaseEndReviewResultSchema>;

type LifecycleInput = {
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
};

export type RequestLeaseEndInput = LifecycleInput & {
  leaseId: string;
  requestedEndOn: string;
  reason: string | null;
  localDate: string;
};

export type EndLeaseInput = LifecycleInput & {
  leaseId: string;
  actualEndOn: string;
  localDate: string;
};

export type ReviewLeaseEndRequestInput = LifecycleInput & {
  requestId: string;
  decision: "APPROVE" | "REJECT";
  actualEndOn: string | null;
  localDate: string;
};

export type LeaseLifecycleRepository = {
  requestLeaseEnd(input: RequestLeaseEndInput): Promise<LeaseEndRequestResult>;
  endLease(input: EndLeaseInput): Promise<LeaseEndResult>;
  reviewLeaseEndRequest(input: ReviewLeaseEndRequestInput): Promise<LeaseEndReviewResult>;
};

const REQUEST_LEASE_END_SQL = `
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
       AND role = 'TENANT'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT lease.id,
           lease.tenant_user_id AS "tenantUserId",
           lease.starts_on::text AS "startsOn",
           lease.ends_on::text AS "endsOn",
           lease.starts_on AS "startsOnDate",
           lease.ends_on AS "endsOnDate",
           lease.status::text AS status,
           lease.room_id AS "roomId"
      FROM leases lease
      JOIN actor ON actor.id = lease.tenant_user_id
     WHERE lease.id = $2::uuid
  ),
  eligibility AS MATERIALIZED (
    SELECT target.*,
           target.status = 'ACTIVE'
             AND target."startsOnDate" <= $5::date
             AND (target."endsOnDate" IS NULL OR target."endsOnDate" >= $5::date)
             AS "isCurrent",
           $3::date > target."startsOnDate"
             AND $3::date >= $5::date AS "dateValid",
           EXISTS (
             SELECT 1 FROM lease_end_requests request
              WHERE request.lease_id = target.id
                AND request.status = 'PENDING'::"LeaseEndRequestStatus"
           ) AS "pendingRequest"
      FROM target
  ),
  inserted AS (
    INSERT INTO lease_end_requests (
      id, lease_id, requested_by_tenant_id, requested_end_on, reason,
      status, created_at, updated_at
    )
    SELECT $8::uuid, target.id, actor.id, $3::date, $4::text,
           'PENDING'::"LeaseEndRequestStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM eligibility target
      JOIN actor ON actor.id = target."tenantUserId"
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND target."isCurrent"
       AND target."dateValid"
       AND NOT target."pendingRequest"
    RETURNING id, lease_id AS "leaseId", requested_end_on::text AS "requestedEndOn",
              status::text AS status,
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $9::uuid, actor.id, 'LEASE_END_REQUESTED', 'LEASE_END_REQUEST', inserted.id,
           CURRENT_TIMESTAMP, $4::text,
           jsonb_build_object('leaseId', inserted."leaseId",
                              'requestedEndOn', inserted."requestedEndOn",
                              'status', 'PENDING')
      FROM inserted
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'requestId', inserted.id,
             'leaseId', inserted."leaseId",
             'requestedEndOn', inserted."requestedEndOn",
             'status', inserted.status,
             'createdAt', inserted."createdAt"
           ) AS data
      FROM inserted
      JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $6::uuid, 'requestLeaseEnd', 200,
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
         (SELECT id FROM eligibility) AS "targetId",
         (SELECT status FROM eligibility) AS "targetStatus",
         (SELECT "startsOn" FROM eligibility) AS "targetStartsOn",
         (SELECT "endsOn" FROM eligibility) AS "targetEndsOn",
         (SELECT "tenantUserId" FROM eligibility) AS "targetTenantId",
         (SELECT "isCurrent" FROM eligibility) AS "targetCurrent",
         COALESCE((SELECT "pendingRequest" FROM eligibility), FALSE) AS "pendingRequest",
         NULL::text AS "requestStatus",
         NULL::text AS "leaseStatus",
         (SELECT "dateValid" FROM eligibility) AS "dateValid",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

const END_LEASE_SQL = `
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
    SELECT lease.id,
           lease.room_id AS "roomId",
           lease.starts_on::text AS "startsOn",
           lease.starts_on AS "startsOnDate",
           lease.status::text AS status
      FROM leases lease
     WHERE lease.id = $2::uuid
  ),
  validation AS MATERIALIZED (
    SELECT target.*,
           $3::date > target."startsOnDate"
             AND $3::date <= $4::date AS "dateValid"
      FROM target
  ),
  updated AS (
    UPDATE leases lease
       SET ends_on = $3::date,
           status = 'ENDED'::"LeaseStatus",
           updated_at = CURRENT_TIMESTAMP
      FROM validation target
      JOIN actor ON TRUE
     WHERE lease.id = target.id
       AND target.status = 'ACTIVE'
       AND target."dateValid"
       AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING lease.id, lease.room_id AS "roomId",
              lease.ends_on::text AS "endsOn"
  ),
  reviewed_requests AS (
    UPDATE lease_end_requests request
       SET status = 'APPROVED'::"LeaseEndRequestStatus",
           reviewed_by_owner_id = actor.id,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
      FROM updated, actor
     WHERE request.lease_id = updated.id
       AND request.status = 'PENDING'::"LeaseEndRequestStatus"
    RETURNING request.id, request.lease_id AS "leaseId"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT gen_random_uuid(), actor.id, 'LEASE_ENDED', 'LEASE', updated.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object('roomId', updated."roomId",
                              'actualEndOn', updated."endsOn",
                              'status', 'ENDED')
      FROM updated
      JOIN actor ON TRUE
    UNION ALL
    SELECT gen_random_uuid(), actor.id, 'LEASE_END_REQUEST_APPROVED',
           'LEASE_END_REQUEST', reviewed_requests.id, CURRENT_TIMESTAMP, NULL,
           jsonb_build_object('leaseId', reviewed_requests."leaseId",
                              'status', 'APPROVED',
                              'actualEndOn', updated."endsOn")
      FROM reviewed_requests
      JOIN updated ON updated.id = reviewed_requests."leaseId"
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'leaseId', updated.id,
             'roomId', updated."roomId",
             'status', 'ENDED',
             'endsOn', updated."endsOn"
           ) AS data
      FROM updated
     WHERE EXISTS (SELECT 1 FROM audit)
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $5::uuid, 'endLease', 200,
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
         (SELECT id FROM target) AS "targetId",
         (SELECT status FROM target) AS "targetStatus",
         (SELECT "startsOn" FROM target) AS "targetStartsOn",
         NULL::text AS "targetEndsOn",
         NULL::uuid AS "targetTenantId",
         NULL::boolean AS "targetCurrent",
         FALSE AS "pendingRequest",
         NULL::text AS "requestStatus",
         NULL::text AS "leaseStatus",
         (SELECT "dateValid" FROM validation) AS "dateValid",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

const REVIEW_LEASE_END_REQUEST_SQL = `
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
    SELECT request.id,
           request.lease_id AS "leaseId",
           request.status::text AS status,
           lease.status::text AS "leaseStatus",
           lease.starts_on AS "startsOnDate",
           lease.ends_on::text AS "endsOn"
      FROM lease_end_requests request
      JOIN leases lease ON lease.id = request.lease_id
     WHERE request.id = $2::uuid
  ),
  validation AS MATERIALIZED (
    SELECT target.*,
           $3::text = 'REJECT'
             OR ($4::date > target."startsOnDate" AND $4::date <= $5::date)
             AS "dateValid"
      FROM target
  ),
  updated_lease AS (
    UPDATE leases lease
       SET ends_on = $4::date,
           status = 'ENDED'::"LeaseStatus",
           updated_at = CURRENT_TIMESTAMP
      FROM validation target
      JOIN actor ON TRUE
     WHERE lease.id = target."leaseId"
       AND target.status = 'PENDING'
       AND target."leaseStatus" = 'ACTIVE'
       AND $3::text = 'APPROVE'
       AND target."dateValid"
       AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING lease.id,
              lease.status::text AS status,
              lease.ends_on::text AS "endsOn"
  ),
  updated_request AS (
    UPDATE lease_end_requests request
       SET status = CASE $3::text
             WHEN 'APPROVE' THEN 'APPROVED'::"LeaseEndRequestStatus"
             ELSE 'REJECTED'::"LeaseEndRequestStatus"
           END,
           reviewed_by_owner_id = actor.id,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
      FROM validation target
      JOIN actor ON TRUE
      LEFT JOIN updated_lease ON updated_lease.id = target."leaseId"
     WHERE request.id = target.id
       AND target.status = 'PENDING'
       AND NOT EXISTS (SELECT 1 FROM existing)
       AND (
         $3::text = 'REJECT'
         OR ($3::text = 'APPROVE' AND updated_lease.id IS NOT NULL)
       )
    RETURNING request.id,
              request.lease_id AS "leaseId",
              request.status::text AS status
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $8::uuid, actor.id,
           CASE updated_request.status
             WHEN 'APPROVED' THEN 'LEASE_END_REQUEST_APPROVED'
             ELSE 'LEASE_END_REQUEST_REJECTED'
           END,
           'LEASE_END_REQUEST', updated_request.id, CURRENT_TIMESTAMP, NULL,
           jsonb_build_object('leaseId', updated_request."leaseId",
                              'status', updated_request.status,
                              'actualEndOn', updated_lease."endsOn")
      FROM updated_request
      JOIN actor ON TRUE
      LEFT JOIN updated_lease ON updated_lease.id = updated_request."leaseId"
    UNION ALL
    SELECT $9::uuid, actor.id, 'LEASE_ENDED', 'LEASE', updated_lease.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object('actualEndOn', updated_lease."endsOn",
                              'status', 'ENDED')
      FROM updated_lease
      JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
             'requestId', updated_request.id,
             'leaseId', updated_request."leaseId",
             'status', updated_request.status,
             'leaseStatus', COALESCE(updated_lease.status, target."leaseStatus"),
             'endsOn', COALESCE(updated_lease."endsOn", target."endsOn")
           ) AS data
      FROM updated_request
      JOIN validation target ON target.id = updated_request.id
      LEFT JOIN updated_lease ON updated_lease.id = updated_request."leaseId"
     WHERE EXISTS (SELECT 1 FROM audit)
  ),
  saved AS (
    INSERT INTO idempotency_keys (
      "key", operation, response_code, response_payload, completed_at
    )
    SELECT $6::uuid, 'reviewLeaseEndRequest', 200,
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
         (SELECT id FROM target) AS "targetId",
         (SELECT status FROM target) AS "targetStatus",
         NULL::text AS "targetStartsOn",
         (SELECT "endsOn" FROM target) AS "targetEndsOn",
         NULL::uuid AS "targetTenantId",
         NULL::boolean AS "targetCurrent",
         COALESCE((SELECT status = 'PENDING' FROM target), FALSE) AS "pendingRequest",
         (SELECT status FROM target) AS "requestStatus",
         (SELECT "leaseStatus" FROM target) AS "leaseStatus",
         (SELECT "dateValid" FROM validation) AS "dateValid",
         (SELECT "responsePayload" FROM saved) AS "savedResponsePayload"
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
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
  const existing = idempotencyRowSchema.safeParse({
    operation: attempt.existingOperation,
    responseCode: attempt.existingResponseCode,
    responsePayload: attempt.existingResponsePayload,
    completedAt: attempt.existingCompletedAt,
  });
  if (!existing.success) throw new DomainError("INTERNAL_ERROR");
  if (
    existing.data.operation !== operation ||
    existing.data.responseCode !== 200 ||
    existing.data.responsePayload === null ||
    existing.data.completedAt === null
  ) {
    throw new DomainError("CONFLICT");
  }
  return parseResponse(existing.data.responsePayload, requestHash, schema);
}

function mapLifecyclePersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";
  if (message.includes("DEPOSIT_INSUFFICIENT")) return new DomainError("DEPOSIT_INSUFFICIENT");
  if (message.includes("LEASE_END_REQUEST")) return new DomainError("CONFLICT");
  if (["23505", "23503", "23P01", "40001", "40P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

function firstRow(results: unknown[][], index: number): unknown {
  return Array.isArray(results[index]) ? results[index]?.[0] : undefined;
}

function checkActor(attempt: z.infer<typeof attemptSchema>) {
  if (!attempt.actorId || !attempt.actorRole) throw new DomainError("UNAUTHENTICATED");
  if (attempt.actorRole !== "OWNER" && attempt.actorRole !== "TENANT") {
    throw new DomainError("FORBIDDEN");
  }
}

export function createLeaseLifecycleRepository(): LeaseLifecycleRepository {
  return {
    async requestLeaseEnd(input) {
      const sql = getSql();
      const results = await sql.transaction([
        sql.query(
          `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
          [input.idempotencyKey],
        ),
        sql.query(
          `SELECT id FROM leases WHERE id = $1::uuid FOR UPDATE`,
          [input.leaseId],
        ),
        sql.query(REQUEST_LEASE_END_SQL, [
          input.actorId,
          input.leaseId,
          input.requestedEndOn,
          input.reason,
          input.localDate,
          input.idempotencyKey,
          input.requestHash,
          randomUUID(),
          randomUUID(),
        ]),
      ]).catch((error: unknown) => {
        throw mapLifecyclePersistenceError(error);
      });
      const attempt = parseAttempt(firstRow(results, 2));
      checkActor(attempt);
      const prior = existingResponse(
        attempt, "requestLeaseEnd", input.requestHash, leaseEndRequestResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("LEASE_NOT_OWNED");
      if (attempt.targetStatus !== "ACTIVE" || !attempt.targetCurrent) {
        throw new DomainError(attempt.targetStatus === "ENDED"
          ? "LEASE_ALREADY_ENDED"
          : "LEASE_NOT_ACTIVE");
      }
      if (attempt.dateValid !== true) throw new DomainError("INVALID_DATES");
      if (attempt.pendingRequest) throw new DomainError("CONFLICT");
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, leaseEndRequestResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },

    async endLease(input) {
      const sql = getSql();
      const results = await sql.transaction([
        sql.query(
          `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
          [input.idempotencyKey],
        ),
        sql.query(
          `SELECT id FROM leases WHERE id = $1::uuid FOR UPDATE`,
          [input.leaseId],
        ),
        sql.query(
          `SELECT id FROM app_users
            WHERE id = (SELECT tenant_user_id FROM leases WHERE id = $1::uuid)
            FOR UPDATE`,
          [input.leaseId],
        ),
        sql.query(
          `SELECT id FROM rooms
            WHERE id = (SELECT room_id FROM leases WHERE id = $1::uuid)
            FOR UPDATE`,
          [input.leaseId],
        ),
        sql.query(END_LEASE_SQL, [
          input.actorId,
          input.leaseId,
          input.actualEndOn,
          input.localDate,
          input.idempotencyKey,
          input.requestHash,
        ]),
      ]).catch((error: unknown) => {
        throw mapLifecyclePersistenceError(error);
      });
      const attempt = parseAttempt(firstRow(results, 4));
      checkActor(attempt);
      const prior = existingResponse(
        attempt, "endLease", input.requestHash, leaseEndResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("NOT_FOUND");
      if (attempt.targetStatus !== "ACTIVE") {
        throw new DomainError(attempt.targetStatus === "ENDED"
          ? "LEASE_ALREADY_ENDED"
          : "LEASE_NOT_ACTIVE");
      }
      if (attempt.dateValid !== true) throw new DomainError("INVALID_DATES");
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, leaseEndResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },

    async reviewLeaseEndRequest(input) {
      const sql = getSql();
      const results = await sql.transaction([
        sql.query(
          `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
          [input.idempotencyKey],
        ),
        sql.query(
          `SELECT lease.id
             FROM leases lease
             JOIN lease_end_requests request ON request.lease_id = lease.id
            WHERE request.id = $1::uuid
            FOR UPDATE OF lease`,
          [input.requestId],
        ),
        sql.query(
          `SELECT tenant.id
             FROM app_users tenant
             JOIN leases lease ON lease.tenant_user_id = tenant.id
             JOIN lease_end_requests request ON request.lease_id = lease.id
            WHERE request.id = $1::uuid
            FOR UPDATE OF tenant`,
          [input.requestId],
        ),
        sql.query(
          `SELECT room.id
             FROM rooms room
             JOIN leases lease ON lease.room_id = room.id
             JOIN lease_end_requests request ON request.lease_id = lease.id
            WHERE request.id = $1::uuid
            FOR UPDATE OF room`,
          [input.requestId],
        ),
        sql.query(
          `SELECT id FROM lease_end_requests WHERE id = $1::uuid FOR UPDATE`,
          [input.requestId],
        ),
        sql.query(REVIEW_LEASE_END_REQUEST_SQL, [
          input.actorId,
          input.requestId,
          input.decision,
          input.actualEndOn,
          input.localDate,
          input.idempotencyKey,
          input.requestHash,
          randomUUID(),
          randomUUID(),
        ]),
      ]).catch((error: unknown) => {
        throw mapLifecyclePersistenceError(error);
      });
      const attempt = parseAttempt(firstRow(results, 5));
      checkActor(attempt);
      const prior = existingResponse(
        attempt, "reviewLeaseEndRequest", input.requestHash, leaseEndReviewResultSchema,
      );
      if (prior) return prior;
      if (!attempt.targetId) throw new DomainError("NOT_FOUND");
      if (attempt.requestStatus !== "PENDING") throw new DomainError("CONFLICT");
      if (input.decision === "APPROVE" && attempt.leaseStatus !== "ACTIVE") {
        throw new DomainError("LEASE_NOT_ACTIVE");
      }
      if (attempt.dateValid !== true) throw new DomainError("INVALID_DATES");
      if (attempt.savedResponsePayload !== null) {
        return parseResponse(attempt.savedResponsePayload, input.requestHash, leaseEndReviewResultSchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },
  };
}
