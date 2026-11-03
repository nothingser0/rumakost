import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  TicketCommentResult,
  TicketDetail,
  TicketExpiryResult,
  TicketMutationResult,
  TicketRole,
  TicketStatus,
  TicketSummary,
} from "./operations.mjs";

const roleSchema = z.enum(["OWNER", "STAFF", "TENANT"]);
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
const mutationAttemptSchema = z.object({
  existingOperation: z.string().nullable(),
  existingResponseCode: z.number().int().nullable(),
  existingResponsePayload: z.unknown().nullable(),
  existingCompletedAt: z.string().nullable(),
  actorId: z.string().uuid().nullable(),
  actorRole: roleSchema.nullable(),
  targetId: z.string().uuid().nullable(),
  targetStatus: z.string().nullable(),
  targetCreatorId: z.string().uuid().nullable(),
  targetLeaseId: z.string().uuid().nullable(),
  targetCreatedAt: z.string().nullable(),
  targetCanAccess: z.boolean().nullable(),
  targetLeaseCurrent: z.boolean().nullable(),
  targetHasAvailableMedia: z.boolean().nullable(),
  roomId: z.string().uuid().nullable(),
  roomCode: z.string().nullable(),
  roomArchived: z.boolean().nullable(),
  leaseRoomId: z.string().uuid().nullable(),
  leaseTenantId: z.string().uuid().nullable(),
  leaseStatus: z.string().nullable(),
  leaseStartsOn: z.string().nullable(),
  leaseEndsOn: z.string().nullable(),
  leaseCurrent: z.boolean().nullable(),
  resultPayload: z.unknown().nullable(),
}).strict();
const uuidSchema = z.string().uuid();
const ticketStatusSchema = z.enum([
  "DRAFT",
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
  "CANCELLED",
]);
const mutationResultSchema = z.object({
  ticketId: uuidSchema,
  status: ticketStatusSchema,
  updatedAt: z.string().datetime({ offset: true }),
}).strict();
const commentResultSchema = z.object({
  commentId: uuidSchema,
  ticketId: uuidSchema,
  visibility: z.enum(["TENANT_VISIBLE", "INTERNAL"]),
  createdAt: z.string().datetime({ offset: true }),
}).strict();
const expiryResultSchema = z.object({
  expiredTickets: z.number().int().nonnegative(),
  queuedAttachments: z.number().int().nonnegative(),
}).strict();
const ticketSummarySchema = z.object({
  id: uuidSchema,
  ticketNumber: z.string().regex(/^\d+$/),
  ticketLabel: z.string().regex(/^TKT-\d{6}-\d{4,}$/),
  roomId: uuidSchema,
  roomCode: z.string(),
  leaseId: uuidSchema.nullable(),
  createdById: uuidSchema,
  createdByName: z.string(),
  assignedToId: uuidSchema.nullable(),
  assignedToName: z.string().nullable(),
  title: z.string(),
  category: z.enum(["AC", "PLUMBING", "ELECTRICAL", "DOORS_LOCKS", "FURNITURE", "GENERAL"]),
  priority: z.enum(["LOW", "NORMAL", "URGENT"]),
  status: ticketStatusSchema,
  targetCompletionOn: z.string().nullable(),
  closedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
}).strict();
const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  resolutionSummary: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.string().datetime({ offset: true }).nullable(),
  reopenedAt: z.string().datetime({ offset: true }).nullable(),
  statusChangedById: uuidSchema.nullable(),
  comments: z.array(z.object({
    id: uuidSchema,
    authorId: uuidSchema,
    authorName: z.string(),
    authorRole: roleSchema,
    body: z.string(),
    visibility: z.enum(["TENANT_VISIBLE", "INTERNAL"]),
    createdAt: z.string().datetime({ offset: true }),
  }).strict()),
  attachments: z.array(z.object({
    id: uuidSchema,
    commentId: uuidSchema.nullable(),
    uploadedById: uuidSchema,
    mimeType: z.string(),
    sizeBytes: z.string().regex(/^\d+$/),
    durationSeconds: z.number().int().nullable(),
    uploadStatus: z.enum(["PENDING_UPLOAD", "AVAILABLE", "DELETE_PENDING", "DELETED", "FAILED"]),
    createdAt: z.string().datetime({ offset: true }),
  }).strict()),
  statusEvents: z.array(z.object({
    id: uuidSchema,
    fromStatus: ticketStatusSchema.nullable(),
    toStatus: ticketStatusSchema,
    actorType: z.enum(["USER", "SYSTEM"]),
    actorId: uuidSchema.nullable(),
    reason: z.string().nullable(),
    resolutionSummary: z.string().nullable(),
    occurredAt: z.string().datetime({ offset: true }),
  }).strict()),
}).strict();

type IdempotentInput = {
  actorId: string;
  idempotencyKey: string;
  requestHash: string;
};
type CreateTicketDraftInput = IdempotentInput & {
  roomId: string;
  leaseId?: string | null;
  category: string;
  title: string;
  description: string;
  priority: string;
};
type TicketInput = IdempotentInput & { ticketId: string };
type DiscardInput = TicketInput & { reason: string };
type UpdateInput = TicketInput & {
  status?: string;
  priority?: string;
  assignedToId?: string | null;
  targetCompletionOn?: string | null;
  resolutionSummary?: string;
};
type AssignInput = TicketInput & { assignedToId: string | null };
type CancelInput = TicketInput & { reason: string };
type CommentInput = TicketInput & {
  actorRole: TicketRole;
  body: string;
  visibility: "TENANT_VISIBLE" | "INTERNAL";
};
type ListInput = {
  actorId: string;
  role: TicketRole;
  limit: number;
  cursor: { createdAt: string; id: string } | null;
};
type TicketRepository = {
  createTicketDraft(input: CreateTicketDraftInput): Promise<TicketSummary>;
  listTickets(input: ListInput): Promise<TicketSummary[]>;
  getTicket(input: { actorId: string; role: TicketRole; ticketId: string }): Promise<TicketDetail | null>;
  submitTicketDraft(input: TicketInput & { actorRole: TicketRole }): Promise<TicketMutationResult>;
  discardTicketDraft(input: DiscardInput & { actorRole: TicketRole }): Promise<TicketMutationResult>;
  updateTicket(input: UpdateInput): Promise<TicketMutationResult>;
  assignTicket(input: AssignInput): Promise<TicketMutationResult>;
  cancelTicket(input: CancelInput): Promise<TicketMutationResult>;
  reopenTicket(input: TicketInput): Promise<TicketMutationResult>;
  addTicketComment(input: CommentInput): Promise<TicketCommentResult>;
  expireTicketDrafts(): Promise<TicketExpiryResult>;
};

const ticketSummaryJson = (alias: string) => `jsonb_build_object(
  'id', ${alias}.id,
  'ticketNumber', ${alias}.ticket_number::text,
  'ticketLabel', 'TKT-' || to_char(${alias}.created_at AT TIME ZONE 'Asia/Jakarta', 'YYYYMM') || '-'
    || lpad(${alias}.ticket_number::text, greatest(4, length(${alias}.ticket_number::text)), '0'),
  'roomId', ${alias}.room_id,
  'roomCode', room.code,
  'leaseId', ${alias}.lease_id,
  'createdById', ${alias}.created_by_id,
  'createdByName', creator.display_name,
  'assignedToId', ${alias}.assigned_to_id,
  'assignedToName', assignee.display_name,
  'title', ${alias}.title,
  'category', ${alias}.category::text,
  'priority', ${alias}.priority::text,
  'status', ${alias}.status::text,
  'targetCompletionOn', ${alias}.target_completion_on::text,
  'closedAt', CASE WHEN ${alias}.closed_at IS NULL THEN NULL ELSE
    to_char(${alias}.closed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
  'createdAt', to_char(${alias}.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'updatedAt', to_char(${alias}.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
)`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function jakartaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function firstRow(results: unknown[][], index: number): unknown {
  return Array.isArray(results[index]) ? results[index]?.[0] : undefined;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function mapTicketPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "";
  if (message.includes("TICKET_MEDIA_REQUIRED")) return new DomainError("MEDIA_REQUIRED");
  if (message.includes("TICKET_NOT_FOUND")) return new DomainError("TICKET_NOT_FOUND");
  if (message.includes("TICKET_LEASE_NOT_OWNED_OR_ACTIVE")) return new DomainError("LEASE_NOT_ACTIVE");
  if (message.includes("TICKET_LEASE_ROOM_MISMATCH")) return new DomainError("LEASE_NOT_OWNED");
  if (message.includes("TICKET_COMMENT_LEASE_REQUIRED")) return new DomainError("LEASE_ENDED");
  if (message.includes("TICKET_COMMENT_VISIBILITY_FORBIDDEN")) return new DomainError("FORBIDDEN_VISIBILITY");
  if (message.includes("TICKET_ASSIGNEE_INVALID")) return new DomainError("NOT_FOUND");
  if (message.includes("TICKET_SYSTEM_EXPIRY")) return new DomainError("CONFLICT");
  if (message.includes("TICKET_CANCELLATION_REASON_REQUIRED")) return new DomainError("REASON_REQUIRED");
  if (message.includes("TICKET_RESOLUTION_SUMMARY_REQUIRED")) return new DomainError("TEXT_REQUIRED");
  if (message.includes("TICKET_ASSIGNEE_REQUIRED")) return new DomainError("INVALID_TRANSITION");
  if (message.includes("TICKET_RESOLUTION_SUMMARY_STATE_INVALID")) return new DomainError("INVALID_TRANSITION");
  if (message.includes("TICKET_STATUS_ACTOR_INVALID")) return new DomainError("FORBIDDEN");
  if (message.includes("INVALID_TICKET_TRANSITION")) return new DomainError("INVALID_TRANSITION");
  if (message.includes("CANCELLED_TICKET_IMMUTABLE")) return new DomainError("CANCELLED_TERMINAL");
  if (["23505", "23503", "23514", "40001", "40P01", "23P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

function parseAttempt(row: unknown) {
  const parsed = mutationAttemptSchema.safeParse(row);
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  return parsed.data;
}

function parseResponse<T>(value: unknown, requestHash: string, schema: z.ZodType<T>): T {
  const stored = storedResponseSchema.safeParse(parseJson(value));
  if (!stored.success) throw new DomainError("INTERNAL_ERROR");
  if (stored.data.requestHash !== requestHash) throw new DomainError("CONFLICT");
  const result = schema.safeParse(stored.data.data);
  if (!result.success) throw new DomainError("INTERNAL_ERROR");
  return result.data;
}

function priorResponse<T>(
  attempt: z.infer<typeof mutationAttemptSchema>,
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

function checkActor(attempt: z.infer<typeof mutationAttemptSchema>, allowedRoles?: TicketRole[]) {
  if (!attempt.actorId || !attempt.actorRole) throw new DomainError("UNAUTHENTICATED");
  if (allowedRoles && !allowedRoles.includes(attempt.actorRole)) {
    throw new DomainError(allowedRoles.length === 1 && allowedRoles[0] === "OWNER"
      ? "OWNER_REQUIRED"
      : "FORBIDDEN");
  }
}

async function runTransaction(
  idempotencyKey: string,
  lockQueries: Array<{ text: string; params: unknown[] }>,
  queryText: string,
  queryParams: unknown[],
) {
  const sql = getSql();
  try {
    return await sql.transaction([
      sql.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
        [idempotencyKey],
      ),
      ...lockQueries.map(({ text, params }) => sql.query(text, params)),
      sql.query(queryText, queryParams),
    ]);
  } catch (error) {
    throw mapTicketPersistenceError(error);
  }
}

function attemptSelect() {
  return `
    SELECT (SELECT operation FROM existing) AS "existingOperation",
           (SELECT "responseCode" FROM existing) AS "existingResponseCode",
           (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
           (SELECT "completedAt" FROM existing) AS "existingCompletedAt",
           (SELECT id FROM actor) AS "actorId",
           (SELECT role FROM actor) AS "actorRole",
           (SELECT id FROM target) AS "targetId",
           (SELECT status FROM target) AS "targetStatus",
           (SELECT "createdById" FROM target) AS "targetCreatorId",
           (SELECT "leaseId" FROM target) AS "targetLeaseId",
           (SELECT "createdAt" FROM target) AS "targetCreatedAt",
           (SELECT "canAccess" FROM target) AS "targetCanAccess",
           (SELECT "leaseCurrent" FROM target) AS "targetLeaseCurrent",
           (SELECT "hasAvailableMedia" FROM target) AS "targetHasAvailableMedia",
           (SELECT id FROM room_context) AS "roomId",
           (SELECT code FROM room_context) AS "roomCode",
           (SELECT archived_at IS NOT NULL FROM room_context) AS "roomArchived",
           (SELECT "roomId" FROM lease_context) AS "leaseRoomId",
           (SELECT "tenantUserId" FROM lease_context) AS "leaseTenantId",
           (SELECT status FROM lease_context) AS "leaseStatus",
           (SELECT "startsOn" FROM lease_context) AS "leaseStartsOn",
           (SELECT "endsOn" FROM lease_context) AS "leaseEndsOn",
           (SELECT "isCurrent" FROM lease_context) AS "leaseCurrent",
           (SELECT "responsePayload" FROM saved) AS "resultPayload"
  `;
}

const INSERT_TICKET_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation, response_code AS "responseCode",
           response_payload AS "responsePayload", completed_at::text AS "completedAt"
      FROM idempotency_keys WHERE "key" = $8::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role, display_name
      FROM app_users
     WHERE id = $1::uuid AND is_active AND NOT must_change_password
  ),
  room_context AS MATERIALIZED (
    SELECT id, code, archived_at FROM rooms WHERE id = $2::uuid
  ),
  lease_context AS MATERIALIZED (
    SELECT id, room_id AS "roomId", tenant_user_id AS "tenantUserId",
           status::text AS status, starts_on::text AS "startsOn",
           ends_on::text AS "endsOn",
           status = 'ACTIVE'::"LeaseStatus"
             AND starts_on <= $9::date
             AND (ends_on IS NULL OR ends_on >= $9::date) AS "isCurrent"
      FROM leases WHERE id = $3::uuid
  ),
  inserted AS (
    INSERT INTO tickets (
      id, room_id, lease_id, created_by_id, title, description,
      category, priority, status, created_at, updated_at
    )
    SELECT $7::uuid, room.id, $3::uuid, actor.id, $4::text, $5::text,
           $6::"TicketCategory", $10::"TicketPriority", 'DRAFT'::"TicketStatus",
           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM room_context room
      JOIN actor ON TRUE
      LEFT JOIN lease_context lease ON TRUE
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND room.archived_at IS NULL
       AND (
         (actor.role = 'TENANT'
           AND lease.id IS NOT NULL
           AND lease."roomId" = room.id
           AND lease."tenantUserId" = actor.id
           AND lease."isCurrent")
         OR
         (actor.role IN ('OWNER', 'STAFF')
           AND ($3::uuid IS NULL OR (lease.id IS NOT NULL AND lease."roomId" = room.id)))
       )
    RETURNING id, room_id AS "roomId", lease_id AS "leaseId",
              created_by_id AS "createdById", ticket_number AS "ticketNumber",
              title, category::text AS category, priority::text AS priority,
              status::text AS status, created_at AS "createdAt", updated_at AS "updatedAt"
  ),
  target AS MATERIALIZED (
    SELECT inserted.id, inserted.status, inserted."createdById",
           inserted."leaseId", inserted."createdAt",
           COALESCE(lease."isCurrent", FALSE) AS "leaseCurrent",
           TRUE AS "canAccess", FALSE AS "hasAvailableMedia"
      FROM inserted
      LEFT JOIN lease_context lease ON TRUE
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
    )
    SELECT $11::uuid, actor.id, 'TICKET_DRAFT_CREATED', 'TICKET', inserted.id,
           CURRENT_TIMESTAMP,
           jsonb_build_object('ticketNumber', inserted."ticketNumber"::text,
                              'roomId', inserted."roomId",
                              'leaseId', inserted."leaseId",
                              'category', inserted.category,
                              'priority', inserted.priority)
      FROM inserted JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
      'id', inserted.id,
      'ticketNumber', inserted."ticketNumber"::text,
      'ticketLabel', 'TKT-' || to_char(inserted."createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYYMM') || '-'
        || lpad(inserted."ticketNumber"::text,
                greatest(4, length(inserted."ticketNumber"::text)), '0'),
      'roomId', inserted."roomId",
      'roomCode', room.code,
      'leaseId', inserted."leaseId",
      'createdById', inserted."createdById",
      'createdByName', actor.display_name,
      'assignedToId', NULL,
      'assignedToName', NULL,
      'title', inserted.title,
      'category', inserted.category,
      'priority', inserted.priority,
      'status', inserted.status,
      'targetCompletionOn', NULL,
      'closedAt', NULL,
      'createdAt', to_char(inserted."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'updatedAt', to_char(inserted."updatedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
    ) AS data
      FROM inserted
      JOIN room_context room ON room.id = inserted."roomId"
      JOIN actor ON TRUE
      JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys ("key", operation, response_code, response_payload, completed_at)
    SELECT $8::uuid, 'createTicketDraft', 200,
           jsonb_build_object('requestHash', $12::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
    RETURNING response_payload AS "responsePayload"
  )
`;

export function createTicketRepository(): TicketRepository {
  return {
    async createTicketDraft(input) {
      const query = `${INSERT_TICKET_SQL}${attemptSelect()}
        FROM (SELECT 1) AS request`;
      const results = await runTransaction(input.idempotencyKey, [
        { text: `SELECT id FROM app_users WHERE id = $1::uuid FOR UPDATE`, params: [input.actorId] },
        { text: `SELECT id FROM leases WHERE id = $1::uuid FOR UPDATE`, params: [input.leaseId ?? null] },
        { text: `SELECT id FROM rooms WHERE id = $1::uuid FOR UPDATE`, params: [input.roomId] },
      ], query, [
        input.actorId,
        input.roomId,
        input.leaseId ?? null,
        input.title,
        input.description,
        input.category,
        randomUUID(),
        input.idempotencyKey,
        jakartaDate(),
        input.priority,
        randomUUID(),
        input.requestHash,
      ]);
      const attempt = parseAttempt(firstRow(results, results.length - 1));
      checkActor(attempt, ["OWNER", "STAFF", "TENANT"]);
      const prior = priorResponse(attempt, "createTicketDraft", input.requestHash, ticketSummarySchema);
      if (prior) return prior;
      if (!attempt.roomId || attempt.roomArchived) throw new DomainError("ROOM_NOT_FOUND");
      if (attempt.actorRole === "TENANT") {
        if (!input.leaseId || attempt.leaseTenantId !== input.actorId || attempt.leaseRoomId !== input.roomId) {
          throw new DomainError("LEASE_NOT_OWNED");
        }
        if (!attempt.leaseCurrent) throw new DomainError("LEASE_NOT_ACTIVE");
      } else if (input.leaseId && (attempt.leaseRoomId !== input.roomId || !attempt.leaseStatus)) {
        throw new DomainError("LEASE_NOT_OWNED");
      }
      if (attempt.resultPayload !== null) {
        return parseResponse(attempt.resultPayload, input.requestHash, ticketSummarySchema);
      }
      throw new DomainError("INTERNAL_ERROR");
    },

    async listTickets(input) {
      const sql = getSql();
      let rows: unknown[];
      try {
        rows = await sql.query(`
          WITH actor AS MATERIALIZED (
            SELECT id, role::text AS role
              FROM app_users
             WHERE id = $1::uuid AND is_active AND NOT must_change_password
          ),
          page AS MATERIALIZED (
            SELECT ${ticketSummaryJson("ticket")} AS data,
                   ticket.created_at AS cursor_created_at,
                   ticket.id AS cursor_id
              FROM tickets ticket
              JOIN rooms room ON room.id = ticket.room_id
              JOIN app_users creator ON creator.id = ticket.created_by_id
              LEFT JOIN app_users assignee ON assignee.id = ticket.assigned_to_id
              CROSS JOIN actor
             WHERE (
               actor.role IN ('OWNER', 'STAFF')
               OR (actor.role = 'TENANT' AND (
                 (ticket.status = 'DRAFT' AND ticket.created_by_id = actor.id)
                 OR (ticket.status <> 'DRAFT' AND EXISTS (
                   SELECT 1 FROM leases lease
                    WHERE lease.id = ticket.lease_id AND lease.tenant_user_id = actor.id
                 ))
               ))
             )
               AND ($3::timestamptz IS NULL
                 OR (ticket.created_at, ticket.id) < ($3::timestamptz, $4::uuid))
             ORDER BY ticket.created_at DESC, ticket.id DESC
             LIMIT $2::integer
          )
          SELECT (SELECT id FROM actor) AS "actorId",
                 (SELECT role FROM actor) AS "actorRole",
                 COALESCE(jsonb_agg(page.data ORDER BY page.cursor_created_at DESC, page.cursor_id DESC), '[]'::jsonb) AS items
            FROM page
        `, [input.actorId, input.limit, input.cursor?.createdAt ?? null, input.cursor?.id ?? null]);
      } catch (error) {
        throw mapTicketPersistenceError(error);
      }
      const row = firstRow(rows, 0);
      const record = z.object({ actorId: uuidSchema.nullable(), actorRole: roleSchema.nullable(), items: z.unknown() }).strict().safeParse(row);
      if (!record.success) throw new DomainError("INTERNAL_ERROR");
      if (!record.data.actorId || !record.data.actorRole) throw new DomainError("UNAUTHENTICATED");
      if (record.data.actorRole !== input.role) throw new DomainError("UNAUTHENTICATED");
      const items = z.array(ticketSummarySchema).safeParse(parseJson(record.data.items));
      if (!items.success) throw new DomainError("INTERNAL_ERROR");
      return items.data;
    },

    async getTicket(input) {
      const sql = getSql();
      let rows: unknown[];
      try {
        rows = await sql.query(`
          WITH actor AS MATERIALIZED (
            SELECT id, role::text AS role
              FROM app_users
             WHERE id = $1::uuid AND is_active AND NOT must_change_password
          ),
          target AS MATERIALIZED (
            SELECT ticket.*,
                   room.code AS "roomCode",
                   creator.display_name AS "createdByName",
                   assignee.display_name AS "assignedToName",
                   creator.role::text AS "creatorRole",
                   actor.id AS "actorId",
                   actor.role AS "actorRole",
                   (
                     actor.role IN ('OWNER', 'STAFF')
                     OR (actor.role = 'TENANT' AND (
                       (ticket.status = 'DRAFT' AND ticket.created_by_id = actor.id)
                       OR (ticket.status <> 'DRAFT' AND EXISTS (
                         SELECT 1 FROM leases lease
                          WHERE lease.id = ticket.lease_id AND lease.tenant_user_id = actor.id
                       ))
                     ))
                   ) AS "canAccess"
              FROM tickets ticket
              JOIN rooms room ON room.id = ticket.room_id
              JOIN app_users creator ON creator.id = ticket.created_by_id
              LEFT JOIN app_users assignee ON assignee.id = ticket.assigned_to_id
              CROSS JOIN actor
             WHERE ticket.id = $2::uuid
          )
          SELECT (SELECT id FROM actor) AS "actorId",
                 (SELECT role FROM actor) AS "actorRole",
                 (SELECT id FROM target) AS "targetId",
                 (SELECT "canAccess" FROM target) AS "canAccess",
                 CASE WHEN (SELECT "canAccess" FROM target) THEN (
                   SELECT jsonb_build_object(
                     'id', target.id,
                     'ticketNumber', target.ticket_number::text,
                     'ticketLabel', 'TKT-' || to_char(target.created_at AT TIME ZONE 'Asia/Jakarta', 'YYYYMM') || '-'
                       || lpad(target.ticket_number::text, greatest(4, length(target.ticket_number::text)), '0'),
                     'roomId', target.room_id,
                     'roomCode', target."roomCode",
                     'leaseId', target.lease_id,
                     'createdById', target.created_by_id,
                     'createdByName', target."createdByName",
                     'assignedToId', target.assigned_to_id,
                     'assignedToName', target."assignedToName",
                     'title', target.title,
                     'description', target.description,
                     'category', target.category::text,
                     'priority', target.priority::text,
                     'status', target.status::text,
                     'resolutionSummary', target.resolution_summary,
                     'cancellationReason', target.cancellation_reason,
                     'cancelledAt', CASE WHEN target.cancelled_at IS NULL THEN NULL ELSE
                       to_char(target.cancelled_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
                     'reopenedAt', CASE WHEN target.reopened_at IS NULL THEN NULL ELSE
                       to_char(target.reopened_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
                     'statusChangedById', target.status_changed_by_id,
                     'targetCompletionOn', target.target_completion_on::text,
                     'closedAt', CASE WHEN target.closed_at IS NULL THEN NULL ELSE
                       to_char(target.closed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
                     'createdAt', to_char(target.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
                     'updatedAt', to_char(target.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
                     'comments', COALESCE((
                       SELECT jsonb_agg(jsonb_build_object(
                         'id', comment.id,
                         'authorId', comment.author_id,
                         'authorName', author.display_name,
                         'authorRole', author.role::text,
                         'body', comment.body,
                         'visibility', comment.visibility::text,
                         'createdAt', to_char(comment.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
                       ) ORDER BY comment.created_at, comment.id)
                         FROM ticket_comments comment
                         JOIN app_users author ON author.id = comment.author_id
                        WHERE comment.ticket_id = target.id
                          AND (target."actorRole" <> 'TENANT' OR comment.visibility = 'TENANT_VISIBLE')
                     ), '[]'::jsonb),
                     'attachments', COALESCE((
                       SELECT jsonb_agg(jsonb_build_object(
                         'id', attachment.id,
                         'commentId', attachment.comment_id,
                         'uploadedById', attachment.uploaded_by_id,
                         'mimeType', attachment.mime_type,
                         'sizeBytes', attachment.size_bytes::text,
                         'durationSeconds', attachment.duration_seconds,
                         'uploadStatus', attachment.upload_status::text,
                         'createdAt', to_char(attachment.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
                       ) ORDER BY attachment.created_at, attachment.id)
                         FROM ticket_attachments attachment
                        WHERE attachment.ticket_id = target.id
                          AND (target."actorRole" <> 'TENANT' OR attachment.comment_id IS NULL OR EXISTS (
                            SELECT 1 FROM ticket_comments comment
                             WHERE comment.id = attachment.comment_id
                               AND comment.visibility = 'TENANT_VISIBLE'
                          ))
                     ), '[]'::jsonb),
                     'statusEvents', COALESCE((
                       SELECT jsonb_agg(jsonb_build_object(
                         'id', event.id,
                         'fromStatus', event.from_status::text,
                         'toStatus', event.to_status::text,
                         'actorType', event.actor_type::text,
                         'actorId', event.actor_id,
                         'reason', event.reason,
                         'resolutionSummary', event.resolution_summary,
                         'occurredAt', to_char(event.occurred_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
                       ) ORDER BY event.occurred_at, event.id)
                         FROM ticket_status_events event WHERE event.ticket_id = target.id
                     ), '[]'::jsonb)
                   )
                     FROM target
                 ) ELSE NULL END AS ticket
        `, [input.actorId, input.ticketId]);
      } catch (error) {
        throw mapTicketPersistenceError(error);
      }
      const rowSchema = z.object({
        actorId: uuidSchema.nullable(),
        actorRole: roleSchema.nullable(),
        targetId: uuidSchema.nullable(),
        canAccess: z.boolean().nullable(),
        ticket: z.unknown().nullable(),
      }).strict();
      const parsed = rowSchema.safeParse(firstRow(rows, 0));
      if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
      if (!parsed.data.actorId || !parsed.data.actorRole) throw new DomainError("UNAUTHENTICATED");
      if (parsed.data.actorRole !== input.role) throw new DomainError("UNAUTHENTICATED");
      if (!parsed.data.targetId) return null;
      if (!parsed.data.canAccess) throw new DomainError("TICKET_NOT_OWNED");
      const detail = ticketDetailSchema.safeParse(parseJson(parsed.data.ticket));
      if (!detail.success) throw new DomainError("INTERNAL_ERROR");
      return detail.data;
    },

    async submitTicketDraft(input) {
      return runTicketMutation(input, "submitTicketDraft", {
        actorRoles: ["OWNER", "STAFF", "TENANT"],
      });
    },

    async discardTicketDraft(input) {
      return runTicketMutation(input, "discardTicketDraft", {
        actorRoles: ["OWNER", "STAFF", "TENANT"],
      });
    },

    async updateTicket(input) {
      return runTicketMutation(input, "updateTicket", {
        actorRoles: ["OWNER", "STAFF"],
      });
    },

    async assignTicket(input) {
      return runTicketMutation(input, "assignTicket", {
        actorRoles: ["OWNER", "STAFF"],
      });
    },

    async cancelTicket(input) {
      return runTicketMutation(input, "cancelTicket", {
        actorRoles: ["OWNER", "STAFF"],
      });
    },

    async reopenTicket(input) {
      return runTicketMutation(input, "reopenTicket", {
        actorRoles: ["OWNER"],
      });
    },

    async addTicketComment(input) {
      return runTicketComment(input);
    },

    async expireTicketDrafts() {
      return expireExpiredTicketDrafts();
    },
  };
}

type MutationOperation =
  | "submitTicketDraft"
  | "discardTicketDraft"
  | "updateTicket"
  | "assignTicket"
  | "cancelTicket"
  | "reopenTicket";

const mutationSql = `
  WITH existing AS MATERIALIZED (
    SELECT operation, response_code AS "responseCode",
           response_payload AS "responsePayload", completed_at::text AS "completedAt"
      FROM idempotency_keys WHERE "key" = $3::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid AND is_active AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT ticket.id, ticket.ticket_number AS "ticketNumber",
           ticket.status::text AS status,
           ticket.created_by_id AS "createdById",
           ticket.lease_id AS "leaseId",
           ticket.created_at AS "createdAt",
           EXISTS (
             SELECT 1 FROM leases lease
              WHERE lease.id = ticket.lease_id
                AND lease.tenant_user_id = actor.id
                AND lease.status = 'ACTIVE'::"LeaseStatus"
                AND lease.starts_on <= $8::date
                AND (lease.ends_on IS NULL OR lease.ends_on >= $8::date)
           ) AS "leaseCurrent",
           (
             actor.role IN ('OWNER', 'STAFF')
             OR (actor.role = 'TENANT' AND (
               (ticket.status = 'DRAFT' AND ticket.created_by_id = actor.id)
               OR (ticket.status <> 'DRAFT' AND EXISTS (
                 SELECT 1 FROM leases lease
                  WHERE lease.id = ticket.lease_id AND lease.tenant_user_id = actor.id
               ))
             ))
           ) AS "canAccess",
           EXISTS (
             SELECT 1 FROM ticket_attachments attachment
              WHERE attachment.ticket_id = ticket.id
                AND attachment.upload_status = 'AVAILABLE'::"TicketUploadStatus"
           ) AS "hasAvailableMedia"
      FROM tickets ticket
      CROSS JOIN actor
     WHERE ticket.id = $2::uuid
  ),
  room_context AS MATERIALIZED (
    SELECT room.id, room.code, room.archived_at
      FROM rooms room
     WHERE room.id = (SELECT ticket.room_id FROM tickets ticket WHERE ticket.id = $2::uuid)
  ),
  lease_context AS MATERIALIZED (
    SELECT lease.id, lease.room_id AS "roomId", lease.tenant_user_id AS "tenantUserId",
           lease.status::text AS status, lease.starts_on::text AS "startsOn",
           lease.ends_on::text AS "endsOn",
           lease.status = 'ACTIVE'::"LeaseStatus"
             AND lease.starts_on <= $8::date
             AND (lease.ends_on IS NULL OR lease.ends_on >= $8::date) AS "isCurrent"
      FROM leases lease
     WHERE lease.id = (SELECT "leaseId" FROM target)
  ),
  changed AS (
    UPDATE tickets ticket
       SET status = CASE
             WHEN $5::text = 'submitTicketDraft' THEN 'RECEIVED'::"TicketStatus"
             WHEN $5::text IN ('discardTicketDraft', 'cancelTicket') THEN 'CANCELLED'::"TicketStatus"
             WHEN $5::text = 'reopenTicket' THEN 'IN_PROGRESS'::"TicketStatus"
             WHEN $5::text = 'assignTicket'
               AND ticket.status = 'RECEIVED'::"TicketStatus"
               AND NULLIF($6::jsonb->>'assignedToId', '') IS NOT NULL
               THEN 'ASSIGNED'::"TicketStatus"
             WHEN $5::text = 'updateTicket' AND $6::jsonb ? 'status'
               THEN ($6::jsonb->>'status')::"TicketStatus"
             ELSE ticket.status
           END,
           status_changed_by_id = CASE
             WHEN $5::text IN ('submitTicketDraft', 'discardTicketDraft', 'cancelTicket', 'reopenTicket')
               OR ($5::text = 'assignTicket'
                 AND ticket.status = 'RECEIVED'::"TicketStatus"
                 AND NULLIF($6::jsonb->>'assignedToId', '') IS NOT NULL)
               OR ($5::text = 'updateTicket'
                 AND $6::jsonb ? 'status'
                 AND ($6::jsonb->>'status')::"TicketStatus" <> ticket.status)
               THEN actor.id
             ELSE ticket.status_changed_by_id
           END,
           cancellation_reason = CASE
             WHEN $5::text IN ('discardTicketDraft', 'cancelTicket') THEN $6::jsonb->>'reason'
             ELSE ticket.cancellation_reason
           END,
           resolution_summary = CASE
             WHEN $5::text = 'reopenTicket' THEN NULL
             WHEN $5::text = 'updateTicket' AND $6::jsonb ? 'resolutionSummary'
               THEN $6::jsonb->>'resolutionSummary'
             ELSE ticket.resolution_summary
           END,
           priority = CASE
             WHEN $5::text = 'updateTicket' AND $6::jsonb ? 'priority'
               THEN ($6::jsonb->>'priority')::"TicketPriority"
             ELSE ticket.priority
           END,
           assigned_to_id = CASE
             WHEN $5::text = 'assignTicket' OR ($5::text = 'updateTicket' AND $6::jsonb ? 'assignedToId')
               THEN CASE WHEN jsonb_typeof($6::jsonb->'assignedToId') = 'null'
                 THEN NULL ELSE ($6::jsonb->>'assignedToId')::uuid END
             ELSE ticket.assigned_to_id
           END,
           target_completion_on = CASE
             WHEN $5::text = 'updateTicket' AND $6::jsonb ? 'targetCompletionOn'
               THEN CASE WHEN jsonb_typeof($6::jsonb->'targetCompletionOn') = 'null'
                 THEN NULL ELSE ($6::jsonb->>'targetCompletionOn')::date END
             ELSE ticket.target_completion_on
           END,
           updated_at = CURRENT_TIMESTAMP
      FROM target, actor
     WHERE ticket.id = target.id
       AND NOT EXISTS (SELECT 1 FROM existing)
       AND target."canAccess"
       AND (
         ($5::text IN ('submitTicketDraft', 'discardTicketDraft') AND actor.role IN ('OWNER', 'STAFF', 'TENANT'))
         OR ($5::text IN ('updateTicket', 'assignTicket', 'cancelTicket') AND actor.role IN ('OWNER', 'STAFF'))
         OR ($5::text = 'reopenTicket' AND actor.role = 'OWNER')
       )
       AND (
         ($5::text = 'submitTicketDraft' AND target.status = 'DRAFT'
           AND target."hasAvailableMedia"
           AND (actor.role <> 'TENANT' OR target."leaseCurrent")
           AND (actor.role IN ('OWNER', 'STAFF') OR target."createdById" = actor.id))
         OR ($5::text = 'discardTicketDraft' AND target.status = 'DRAFT'
           AND (actor.role <> 'TENANT' OR target."leaseCurrent")
           AND (actor.role IN ('OWNER', 'STAFF') OR target."createdById" = actor.id))
         OR ($5::text = 'updateTicket' AND target.status <> 'CANCELLED')
         OR ($5::text = 'assignTicket' AND target.status IN ('RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'INSPECTION'))
         OR ($5::text = 'cancelTicket' AND target.status <> 'CANCELLED')
         OR ($5::text = 'reopenTicket' AND target.status = 'RESOLVED')
       )
    RETURNING ticket.id, ticket.ticket_number AS "ticketNumber",
              ticket.status::text AS status, ticket.updated_at AS "updatedAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at, reason, safe_metadata
    )
    SELECT $7::uuid, actor.id,
           CASE $5::text
             WHEN 'submitTicketDraft' THEN 'TICKET_SUBMITTED'
             WHEN 'discardTicketDraft' THEN 'TICKET_DRAFT_DISCARDED'
             WHEN 'updateTicket' THEN 'TICKET_UPDATED'
             WHEN 'assignTicket' THEN 'TICKET_ASSIGNED'
             WHEN 'cancelTicket' THEN 'TICKET_CANCELLED'
             WHEN 'reopenTicket' THEN 'TICKET_REOPENED'
           END,
           'TICKET', changed.id, CURRENT_TIMESTAMP,
           CASE $5::text
             WHEN 'discardTicketDraft' THEN 'CREATOR_DISCARDED_DRAFT'
             WHEN 'cancelTicket' THEN 'USER_REQUESTED_CANCELLATION'
             ELSE NULL
           END,
           jsonb_build_object(
             'ticketNumber', changed."ticketNumber"::text,
             'fromStatus', target.status,
             'toStatus', changed.status,
             'priority', CASE WHEN $6::jsonb ? 'priority' THEN $6::jsonb->>'priority' ELSE NULL END,
             'assignedToId', CASE WHEN $6::jsonb ? 'assignedToId' THEN $6::jsonb->>'assignedToId' ELSE NULL END,
             'targetCompletionOn', CASE WHEN $6::jsonb ? 'targetCompletionOn' THEN $6::jsonb->>'targetCompletionOn' ELSE NULL END
           )
      FROM changed JOIN actor ON TRUE JOIN target ON target.id = changed.id
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
      'ticketId', changed.id,
      'status', changed.status,
      'updatedAt', to_char(changed."updatedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
    ) AS data
      FROM changed JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys ("key", operation, response_code, response_payload, completed_at)
    SELECT $3::uuid, $5::text, 200,
           jsonb_build_object('requestHash', $4::text, 'data', response_data.data),
           CURRENT_TIMESTAMP
      FROM response_data
    RETURNING response_payload AS "responsePayload"
  )
  ${attemptSelect()}
  FROM (SELECT 1) AS request
`;

async function runTicketMutation<T extends TicketInput & { actorRole?: TicketRole }>(
  input: T,
  operation: MutationOperation,
  options: { actorRoles: TicketRole[] },
): Promise<TicketMutationResult> {
  const payload = { ...input } as unknown as Record<string, unknown>;
  delete payload.actorId;
  delete payload.actorRole;
  delete payload.ticketId;
  delete payload.idempotencyKey;
  delete payload.requestHash;
  const results = await runTransaction(input.idempotencyKey, [
    { text: `SELECT id FROM app_users WHERE id = $1::uuid FOR UPDATE`, params: [input.actorId] },
    { text: `SELECT id FROM tickets WHERE id = $1::uuid FOR UPDATE`, params: [input.ticketId] },
    { text: `SELECT id FROM app_users WHERE id = $1::uuid FOR UPDATE`, params: [payload.assignedToId ?? null] },
    {
      text: `SELECT id FROM leases WHERE id = (SELECT lease_id FROM tickets WHERE id = $1::uuid) FOR UPDATE`,
      params: [input.ticketId],
    },
  ], mutationSql, [
    input.actorId,
    input.ticketId,
    input.idempotencyKey,
    input.requestHash,
    operation,
    JSON.stringify(payload),
    randomUUID(),
    jakartaDate(),
  ]);
  const attempt = parseAttempt(firstRow(results, results.length - 1));
  checkActor(attempt, options.actorRoles);
  const prior = priorResponse(attempt, operation, input.requestHash, mutationResultSchema);
  if (prior) return prior;
  if (!attempt.targetId) throw new DomainError("TICKET_NOT_FOUND");
  if (!attempt.targetCanAccess) throw new DomainError("TICKET_NOT_OWNED");
  if (operation === "submitTicketDraft" && attempt.targetStatus === "DRAFT" && !attempt.targetHasAvailableMedia) {
    throw new DomainError("MEDIA_REQUIRED");
  }
  if (attempt.targetStatus === "CANCELLED") throw new DomainError("CANCELLED_TERMINAL");
  if (attempt.resultPayload === null) throw new DomainError("INVALID_TRANSITION");
  return parseResponse(attempt.resultPayload, input.requestHash, mutationResultSchema);
}

const commentSql = `
  WITH existing AS MATERIALIZED (
    SELECT operation, response_code AS "responseCode",
           response_payload AS "responsePayload", completed_at::text AS "completedAt"
      FROM idempotency_keys WHERE "key" = $3::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid AND is_active AND NOT must_change_password
  ),
  target AS MATERIALIZED (
    SELECT ticket.id, ticket.status::text AS status,
           ticket.created_by_id AS "createdById", ticket.lease_id AS "leaseId",
           ticket.created_at AS "createdAt",
           (actor.role IN ('OWNER', 'STAFF') OR (actor.role = 'TENANT' AND (
             (ticket.status = 'DRAFT' AND ticket.created_by_id = actor.id)
             OR (ticket.status <> 'DRAFT' AND EXISTS (
               SELECT 1 FROM leases lease
                WHERE lease.id = ticket.lease_id AND lease.tenant_user_id = actor.id
             ))
           ))) AS "canAccess"
      FROM tickets ticket CROSS JOIN actor
     WHERE ticket.id = $2::uuid
  ),
  inserted AS (
    INSERT INTO ticket_comments (id, ticket_id, author_id, body, visibility, created_at)
    SELECT $5::uuid, target.id, actor.id, $6::text, $7::"CommentVisibility", CURRENT_TIMESTAMP
      FROM target JOIN actor ON TRUE
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND target."canAccess"
       AND (actor.role IN ('OWNER', 'STAFF') OR $7::"CommentVisibility" = 'TENANT_VISIBLE'::"CommentVisibility")
    RETURNING id, ticket_id AS "ticketId", visibility::text AS visibility, created_at AS "createdAt"
  ),
  audit AS (
    INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata)
    SELECT $8::uuid, actor.id, 'TICKET_COMMENT_ADDED', 'TICKET', inserted."ticketId",
           CURRENT_TIMESTAMP, jsonb_build_object('visibility', inserted.visibility)
      FROM inserted JOIN actor ON TRUE
    RETURNING id
  ),
  response_data AS MATERIALIZED (
    SELECT jsonb_build_object(
      'commentId', inserted.id,
      'ticketId', inserted."ticketId",
      'visibility', inserted.visibility,
      'createdAt', to_char(inserted."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
    ) AS data
      FROM inserted JOIN audit ON TRUE
  ),
  saved AS (
    INSERT INTO idempotency_keys ("key", operation, response_code, response_payload, completed_at)
    SELECT $3::uuid, 'addTicketComment', 200,
           jsonb_build_object('requestHash', $4::text, 'data', response_data.data),
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
         (SELECT "createdById" FROM target) AS "targetCreatorId",
         (SELECT "leaseId" FROM target) AS "targetLeaseId",
         (SELECT "createdAt" FROM target) AS "targetCreatedAt",
         (SELECT "canAccess" FROM target) AS "targetCanAccess",
         NULL::boolean AS "targetLeaseCurrent",
         NULL::boolean AS "targetHasAvailableMedia",
         NULL::uuid AS "roomId", NULL::text AS "roomCode", NULL::boolean AS "roomArchived",
         NULL::uuid AS "leaseRoomId", NULL::uuid AS "leaseTenantId", NULL::text AS "leaseStatus",
         NULL::text AS "leaseStartsOn", NULL::text AS "leaseEndsOn", NULL::boolean AS "leaseCurrent",
         (SELECT "responsePayload" FROM saved) AS "resultPayload"
    FROM (SELECT 1) AS request
`;

async function runTicketComment(input: CommentInput): Promise<TicketCommentResult> {
  const results = await runTransaction(input.idempotencyKey, [
    { text: `SELECT id FROM app_users WHERE id = $1::uuid FOR UPDATE`, params: [input.actorId] },
    { text: `SELECT id FROM tickets WHERE id = $1::uuid FOR UPDATE`, params: [input.ticketId] },
    {
      text: `SELECT id FROM leases WHERE id = (SELECT lease_id FROM tickets WHERE id = $1::uuid) FOR UPDATE`,
      params: [input.ticketId],
    },
  ], commentSql, [
    input.actorId,
    input.ticketId,
    input.idempotencyKey,
    input.requestHash,
    randomUUID(),
    input.body,
    input.visibility,
    randomUUID(),
  ]);
  const attempt = parseAttempt(firstRow(results, results.length - 1));
  checkActor(attempt);
  const prior = priorResponse(attempt, "addTicketComment", input.requestHash, commentResultSchema);
  if (prior) return prior;
  if (!attempt.targetId) throw new DomainError("TICKET_NOT_FOUND");
  if (!attempt.targetCanAccess) throw new DomainError("TICKET_NOT_OWNED");
  if (
    attempt.actorRole === "TENANT" &&
    (operation === "submitTicketDraft" || operation === "discardTicketDraft") &&
    !attempt.targetLeaseCurrent
  ) {
    throw new DomainError("LEASE_ENDED");
  }
  if (attempt.actorRole === "TENANT" && input.visibility !== "TENANT_VISIBLE") {
    throw new DomainError("FORBIDDEN_VISIBILITY");
  }
  if (attempt.resultPayload === null) {
    throw new DomainError(attempt.actorRole === "TENANT" ? "LEASE_ENDED" : "CONFLICT");
  }
  return parseResponse(attempt.resultPayload, input.requestHash, commentResultSchema);
}

async function expireExpiredTicketDrafts(): Promise<TicketExpiryResult> {
  const sql = getSql();
  try {
    const results = await sql.transaction([
      sql.query(`SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`, ["rumakost:ticket-draft-expiry"]),
      sql.query(`
        WITH expired AS (
          UPDATE tickets
             SET status = 'CANCELLED'::"TicketStatus",
                 status_changed_by_id = NULL,
                 cancellation_reason = 'DRAFT_EXPIRED',
                 updated_at = CURRENT_TIMESTAMP
           WHERE status = 'DRAFT'::"TicketStatus"
             AND created_at <= CURRENT_TIMESTAMP - INTERVAL '7 days'
          RETURNING id, ticket_number
        ),
        audit AS (
          INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, reason, safe_metadata)
          SELECT gen_random_uuid(), NULL, 'TICKET_DRAFT_EXPIRED', 'TICKET', id,
                 CURRENT_TIMESTAMP, 'DRAFT_EXPIRED',
                 jsonb_build_object('ticketNumber', ticket_number::text)
            FROM expired
          RETURNING id
        )
        SELECT count(*)::integer AS "expiredTickets" FROM expired
      `, []),
      sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'on', TRUE)`, []),
      sql.query(`
        WITH queued AS (
          UPDATE ticket_attachments attachment
             SET upload_status = CASE
                   WHEN attachment.upload_status = 'AVAILABLE'::"TicketUploadStatus"
                     THEN 'DELETE_PENDING'::"TicketUploadStatus"
                   ELSE attachment.upload_status
                 END,
                 delete_after = CURRENT_TIMESTAMP
            FROM tickets ticket
           WHERE ticket.id = attachment.ticket_id
             AND ticket.status = 'CANCELLED'::"TicketStatus"
             AND ticket.cancellation_reason = 'DRAFT_EXPIRED'
             AND ticket.created_at <= CURRENT_TIMESTAMP - INTERVAL '7 days'
             AND attachment.upload_status IN ('PENDING_UPLOAD'::"TicketUploadStatus", 'AVAILABLE'::"TicketUploadStatus")
          RETURNING attachment.id
        ), audit AS (
          INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, reason, safe_metadata)
          SELECT gen_random_uuid(), NULL, 'TICKET_MEDIA_DELETE_QUEUED', 'TICKET_ATTACHMENT', queued.id,
                 CURRENT_TIMESTAMP, 'DRAFT_EXPIRED', jsonb_build_object('uploadStatus', 'DELETE_PENDING')
            FROM queued
          RETURNING id
        )
        SELECT queued.id FROM queued CROSS JOIN audit
      `, []),
      sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'off', TRUE)`, []),
    ]);
    const expiredRow = z.object({ expiredTickets: z.number().int().nonnegative() }).strict()
      .safeParse(firstRow(results, 1));
    if (!expiredRow.success) throw new DomainError("INTERNAL_ERROR");
    const queuedRows = results[3];
    if (!Array.isArray(queuedRows)) throw new DomainError("INTERNAL_ERROR");
    return expiryResultSchema.parse({
      expiredTickets: expiredRow.data.expiredTickets,
      queuedAttachments: queuedRows.length,
    });
  } catch (error) {
    throw mapTicketPersistenceError(error);
  }
}
