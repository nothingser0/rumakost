import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { getDatabaseEnv } from "@/lib/env";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import type { MediaRepository } from "./operations.mjs";
import {
  MAX_CLEANUP_BATCH_SIZE,
  MAX_PROJECT_BYTES,
  MAX_TICKET_BYTES,
  MAX_UPLOAD_INTENTS_PER_MINUTE,
} from "./operations.mjs";

const uploadStatusSchema = z.enum([
  "PENDING_UPLOAD",
  "AVAILABLE",
  "DELETE_PENDING",
  "DELETED",
  "FAILED",
]);

const uploadRecordSchema = z.object({
  id: z.string().uuid(),
  objectKey: z.string().min(1),
  uploadStatus: uploadStatusSchema,
  createdAt: z.union([z.string().datetime({ offset: true }), z.date()]),
  mimeType: z.string(),
  sizeBytes: z.union([z.string().regex(/^\d+$/), z.number().int().positive()]),
  durationSeconds: z.number().int().nullable(),
  deleteAfter: z.union([z.string().datetime({ offset: true }), z.date()]).nullable(),
}).strict();

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function firstRow(results: unknown[][], index: number): unknown {
  return Array.isArray(results[index]) ? results[index]?.[0] : undefined;
}

function firstRows(results: unknown[][], index: number): unknown[] {
  return Array.isArray(results[index]) ? results[index] : [];
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function parseRecord(value: unknown) {
  const result = uploadRecordSchema.safeParse(value);
  if (!result.success) throw new DomainError("INTERNAL_ERROR");
  return result.data;
}

function mapMediaPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const message = error && typeof error === "object" && "message" in error ? String(error.message) : "";
  if (message.includes("TICKET_MEDIA_REQUIRED")) return new DomainError("MEDIA_REQUIRED");
  if (message.includes("TICKET_NOT_FOUND")) return new DomainError("TICKET_NOT_FOUND");
  if (message.includes("TICKET_UPLOAD_LEASE_FORBIDDEN")) return new DomainError("LEASE_ENDED");
  if (message.includes("TICKET_UPLOAD_INTERNAL_COMMENT_FORBIDDEN")) return new DomainError("FORBIDDEN_VISIBILITY");
  if (message.includes("TICKET_MEDIA_TOTAL_LIMIT_EXCEEDED")) return new DomainError("TICKET_LIMIT_EXCEEDED");
  if (message.includes("TICKET_MEDIA_BATCH_")) return new DomainError("TICKET_LIMIT_EXCEEDED");
  if (message.includes("TICKET_UPLOADER_INACTIVE")) return new DomainError("FORBIDDEN");
  if (["23505", "23503", "23514", "40001", "40P01", "23P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

const CREATE_UPLOAD_INTENT_SQL = `
  WITH existing AS MATERIALIZED (
    SELECT operation, response_payload AS "responsePayload"
      FROM idempotency_keys
     WHERE "key" = $10::uuid
  ),
  actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $2::uuid AND is_active = TRUE AND must_change_password = FALSE
  ),
  target AS MATERIALIZED (
    SELECT id, status::text AS status, created_by_id, lease_id
      FROM tickets
     WHERE id = $3::uuid
  ),
  lease_access AS MATERIALIZED (
    SELECT
      EXISTS (
        SELECT 1 FROM leases lease
         WHERE lease.id = target.lease_id
           AND lease.tenant_user_id = actor.id
      ) AS "tenantOwnsLease",
      EXISTS (
        SELECT 1 FROM leases lease
         WHERE lease.id = target.lease_id
           AND lease.tenant_user_id = actor.id
           AND lease.status = 'ACTIVE'
           AND lease.starts_on <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
           AND (lease.ends_on IS NULL OR lease.ends_on >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date)
      ) AS "tenantLeaseActive"
      FROM actor CROSS JOIN target
  ),
  comment_access AS MATERIALIZED (
    SELECT
      ($4::uuid IS NULL OR EXISTS (
        SELECT 1 FROM ticket_comments comment
         WHERE comment.id = $4::uuid AND comment.ticket_id = target.id
      )) AS "commentExists",
      ($4::uuid IS NULL OR actor.role <> 'TENANT' OR EXISTS (
        SELECT 1 FROM ticket_comments comment
         WHERE comment.id = $4::uuid
           AND comment.ticket_id = target.id
           AND comment.visibility = 'TENANT_VISIBLE'
      )) AS "commentVisible"
      FROM actor CROSS JOIN target
  ),
  counts AS MATERIALIZED (
    SELECT
      COUNT(*) FILTER (
        WHERE uploaded_by_id = $2::uuid
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute'
      )::integer AS "rateCount",
      COALESCE(SUM(size_bytes) FILTER (WHERE upload_status NOT IN ('FAILED', 'DELETED')), 0)::text AS "projectBytes",
      COALESCE(SUM(size_bytes) FILTER (
        WHERE ticket_id = $3::uuid AND upload_status NOT IN ('FAILED', 'DELETED')
      ), 0)::text AS "ticketBytes",
      COUNT(*) FILTER (
        WHERE ticket_id = $3::uuid AND upload_batch_id = $5::uuid
          AND upload_status NOT IN ('FAILED', 'DELETED')
          AND mime_type IN ('image/jpeg', 'image/png', 'image/webp')
      )::integer AS "batchPhotos",
      COUNT(*) FILTER (
        WHERE ticket_id = $3::uuid AND upload_batch_id = $5::uuid
          AND upload_status NOT IN ('FAILED', 'DELETED')
          AND mime_type IN ('video/mp4', 'video/quicktime')
      )::integer AS "batchVideos",
      NOT EXISTS (
        SELECT 1 FROM ticket_attachments attachment
         WHERE attachment.ticket_id = $3::uuid
           AND attachment.upload_batch_id = $5::uuid
           AND attachment.upload_status NOT IN ('FAILED', 'DELETED')
           AND (attachment.uploaded_by_id <> $2::uuid
             OR attachment.comment_id IS DISTINCT FROM $4::uuid)
      ) AS "batchConsistent"
      FROM ticket_attachments
  ),
  access AS MATERIALIZED (
    SELECT
      EXISTS (SELECT 1 FROM target) AS "ticketFound",
      (SELECT status FROM target) = 'CANCELLED' AS "ticketCancelled",
      COALESCE((SELECT "tenantOwnsLease" FROM lease_access), FALSE) AS "tenantOwnsLease",
      COALESCE((SELECT "tenantLeaseActive" FROM lease_access), FALSE) AS "tenantLeaseActive",
      COALESCE((SELECT "commentExists" FROM comment_access), FALSE) AS "commentExists",
      COALESCE((SELECT "commentVisible" FROM comment_access), FALSE) AS "commentVisible",
      COALESCE((
        SELECT CASE
          WHEN actor.role IN ('OWNER', 'STAFF') THEN target.status <> 'CANCELLED'
            AND comment_access."commentExists" AND comment_access."commentVisible"
          WHEN actor.role = 'TENANT' THEN target.status <> 'CANCELLED'
            AND (target.status <> 'DRAFT' OR target.created_by_id = actor.id)
            AND lease_access."tenantLeaseActive"
            AND comment_access."commentExists" AND comment_access."commentVisible"
          ELSE FALSE
        END
          FROM actor CROSS JOIN target CROSS JOIN lease_access CROSS JOIN comment_access
      ), FALSE) AS "canUpload"
  ),
  prior AS MATERIALIZED (
    SELECT
      operation,
      "responsePayload" AS response_payload,
      CASE WHEN operation = 'createUploadIntent'
        THEN ("responsePayload"->'data'->>'attachmentId')::uuid
        ELSE NULL
      END AS "attachmentId"
      FROM existing
  ),
  replay AS MATERIALIZED (
    SELECT attachment.id, attachment.object_key, attachment.upload_status::text AS upload_status,
           attachment.created_at
      FROM prior
      JOIN ticket_attachments attachment ON attachment.id = prior."attachmentId"
  ),
  inserted AS (
    INSERT INTO ticket_attachments (
      id, ticket_id, comment_id, uploaded_by_id, upload_batch_id, object_key,
      mime_type, size_bytes, duration_seconds
    )
    SELECT $1::uuid, $3::uuid, $4::uuid, actor.id, $5::uuid, $6::text,
           $7::text, $8::bigint, $9::integer
      FROM actor CROSS JOIN target CROSS JOIN access CROSS JOIN counts
     WHERE NOT EXISTS (SELECT 1 FROM existing)
       AND access."canUpload"
       AND counts."rateCount" < $11::integer
       AND counts."projectBytes"::numeric + $8::numeric <= $12::numeric
       AND counts."ticketBytes"::numeric + $8::numeric <= $13::numeric
       AND (CASE WHEN $7::text IN ('image/jpeg', 'image/png', 'image/webp')
         THEN counts."batchPhotos" < 4 ELSE counts."batchVideos" < 1 END)
     RETURNING id, object_key, upload_status::text AS upload_status, created_at
  ),
  saved AS (
    INSERT INTO idempotency_keys ("key", operation, response_code, response_payload, completed_at)
    SELECT $10::uuid, 'createUploadIntent', 201,
           jsonb_build_object(
             'requestHash', $14::text,
             'data', jsonb_build_object('attachmentId', inserted.id::text)
           ), CURRENT_TIMESTAMP
      FROM inserted
    RETURNING "key"
  ),
  quota_alert AS (
    INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata)
    SELECT gen_random_uuid(), actor.id, 'TICKET_MEDIA_PROJECT_QUOTA_EXCEEDED', 'TICKET', target.id,
           CURRENT_TIMESTAMP,
           jsonb_build_object('usedBytes', counts."projectBytes", 'limitBytes', $12::text)
      FROM actor CROSS JOIN target CROSS JOIN counts CROSS JOIN access
     WHERE access."canUpload"
       AND NOT EXISTS (SELECT 1 FROM existing)
       AND counts."projectBytes"::numeric + $8::numeric > $12::numeric
       AND NOT EXISTS (
         SELECT 1 FROM audit_events alert
          WHERE alert.action = 'TICKET_MEDIA_PROJECT_QUOTA_EXCEEDED'
            AND alert.occurred_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
       )
    RETURNING id
  )
  SELECT
    (SELECT id FROM actor) AS "actorId",
    (SELECT role FROM actor) AS "actorRole",
    access."ticketFound",
    access."ticketCancelled",
    access."tenantOwnsLease",
    access."tenantLeaseActive",
    access."commentExists",
    access."commentVisible",
    access."canUpload",
    counts."rateCount",
    counts."projectBytes",
    counts."ticketBytes",
    counts."batchPhotos",
    counts."batchVideos",
    counts."batchConsistent",
    (SELECT operation FROM existing) AS "existingOperation",
    (SELECT "responsePayload" FROM existing) AS "existingResponsePayload",
    (SELECT id FROM inserted) AS "insertedId",
    (SELECT object_key FROM inserted) AS "insertedObjectKey",
    (SELECT upload_status FROM inserted) AS "insertedStatus",
    (SELECT created_at FROM inserted) AS "insertedCreatedAt",
    (SELECT replay.id FROM replay) AS "replayId",
    (SELECT replay.object_key FROM replay) AS "replayObjectKey",
    (SELECT replay.upload_status FROM replay) AS "replayStatus",
    (SELECT replay.created_at FROM replay) AS "replayCreatedAt"
    FROM access CROSS JOIN counts
`;

const ATTACHMENT_ACCESS_SQL = `
  WITH actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid AND is_active = TRUE AND must_change_password = FALSE
  ),
  target AS MATERIALIZED (
    SELECT attachment.id, attachment.ticket_id, attachment.comment_id,
           attachment.uploaded_by_id, attachment.object_key,
           attachment.mime_type, attachment.size_bytes::text AS size_bytes,
           attachment.duration_seconds, attachment.upload_status::text AS upload_status,
           attachment.created_at, attachment.delete_after,
           ticket.status::text AS ticket_status, ticket.created_by_id, ticket.lease_id,
           comment.visibility::text AS comment_visibility
      FROM ticket_attachments attachment
      JOIN tickets ticket ON ticket.id = attachment.ticket_id
      LEFT JOIN ticket_comments comment ON comment.id = attachment.comment_id
                                        AND comment.ticket_id = attachment.ticket_id
     WHERE attachment.id = $2::uuid
  ),
  allowed AS MATERIALIZED (
    SELECT target.*
      FROM actor CROSS JOIN target
      WHERE (
        actor.role IN ('OWNER', 'STAFF')
        OR (
          actor.role = 'TENANT'
          AND (target.comment_id IS NULL OR target.comment_visibility = 'TENANT_VISIBLE')
          AND (
            (target.ticket_status = 'DRAFT' AND target.created_by_id = actor.id)
            OR (target.ticket_status <> 'DRAFT' AND EXISTS (
              SELECT 1 FROM leases lease
               WHERE lease.id = target.lease_id AND lease.tenant_user_id = actor.id
            ))
          )
          AND ($3::boolean = FALSE OR EXISTS (
            SELECT 1 FROM leases lease
             WHERE lease.id = target.lease_id
               AND lease.tenant_user_id = actor.id
               AND lease.status = 'ACTIVE'
               AND lease.starts_on <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
               AND (lease.ends_on IS NULL OR lease.ends_on >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date)
          ))
        )
      )
      AND ($3::boolean = FALSE OR target.ticket_status <> 'CANCELLED')
  ),
  audit AS (
    INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata)
    SELECT gen_random_uuid(), actor.id, $4::text, 'TICKET_ATTACHMENT', allowed.id,
           CURRENT_TIMESTAMP, jsonb_build_object('uploadStatus', allowed.upload_status)
      FROM actor CROSS JOIN allowed
    RETURNING id
  )
  SELECT allowed.id, allowed.object_key AS "objectKey",
         allowed.upload_status AS "uploadStatus", allowed.created_at AS "createdAt",
         allowed.mime_type AS "mimeType", allowed.size_bytes AS "sizeBytes",
         allowed.duration_seconds AS "durationSeconds", allowed.delete_after AS "deleteAfter"
    FROM allowed
`;

const FINALIZE_UPLOAD_SQL = `
  WITH actor AS MATERIALIZED (
    SELECT id, role::text AS role FROM app_users
     WHERE id = $1::uuid AND is_active = TRUE AND must_change_password = FALSE
  ),
  target AS MATERIALIZED (
    SELECT attachment.id, attachment.ticket_id, attachment.comment_id,
           attachment.upload_status::text AS upload_status,
           ticket.status::text AS ticket_status, ticket.created_by_id, ticket.lease_id,
           comment.visibility::text AS comment_visibility
      FROM ticket_attachments attachment
      JOIN tickets ticket ON ticket.id = attachment.ticket_id
      LEFT JOIN ticket_comments comment ON comment.id = attachment.comment_id
                                        AND comment.ticket_id = attachment.ticket_id
     WHERE attachment.id = $2::uuid
  ),
  allowed AS MATERIALIZED (
    SELECT target.*
      FROM actor CROSS JOIN target
     WHERE target.ticket_status <> 'CANCELLED'
       AND (actor.role IN ('OWNER', 'STAFF') OR (
         actor.role = 'TENANT'
         AND (target.ticket_status <> 'DRAFT' OR target.created_by_id = actor.id)
         AND (target.comment_id IS NULL OR target.comment_visibility = 'TENANT_VISIBLE')
         AND EXISTS (
           SELECT 1 FROM leases lease
            WHERE lease.id = target.lease_id
              AND lease.tenant_user_id = actor.id
              AND lease.status = 'ACTIVE'
              AND lease.starts_on <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date
              AND (lease.ends_on IS NULL OR lease.ends_on >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date)
         )
       ))
  ),
  updated AS (
    UPDATE ticket_attachments attachment
       SET upload_status = 'AVAILABLE'::"TicketUploadStatus"
      FROM allowed
     WHERE attachment.id = allowed.id
       AND attachment.upload_status = 'PENDING_UPLOAD'::"TicketUploadStatus"
       AND allowed.upload_status = 'PENDING_UPLOAD'
     RETURNING attachment.id
  ),
  audit AS (
    INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata)
    SELECT gen_random_uuid(), actor.id, $3::text, 'TICKET_ATTACHMENT', updated.id,
           CURRENT_TIMESTAMP, '{}'::jsonb
      FROM actor CROSS JOIN updated
    RETURNING id
  )
  SELECT
    EXISTS (SELECT 1 FROM updated)
    OR EXISTS (SELECT 1 FROM allowed WHERE upload_status = 'AVAILABLE') AS finalized
`;

function parseStoredResponse(value: unknown): { requestHash: string; attachmentId: string } {
  const parsed = z.object({
    requestHash: z.string().regex(/^[a-f0-9]{64}$/),
    data: z.object({ attachmentId: z.string().uuid() }).strict(),
  }).strict().safeParse(parseJson(value));
  if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
  return { requestHash: parsed.data.requestHash, attachmentId: parsed.data.data.attachmentId };
}

export function createMediaRepository(): MediaRepository {
  return {
    async createUploadIntent(input) {
      const actorId = String(input.actorId);
      const ticketId = String(input.ticketId);
      const idempotencyKey = String(input.idempotencyKey);
      const attachmentId = randomUUID();
      const objectKey = `ticket-media/${randomUUID()}`;
      let results: unknown[][];
      try {
        const sql = getSql();
        results = await sql.transaction([
          sql.query(`SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`, [`media:idempotency:${idempotencyKey}`]),
          sql.query(`SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`, [`media:actor:${actorId}`]),
          sql.query(`SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`, ["media:project-quota"]),
          sql.query(`SELECT id FROM tickets WHERE id = $1::uuid FOR UPDATE`, [ticketId]),
          sql.query(CREATE_UPLOAD_INTENT_SQL, [
            attachmentId,
            actorId,
            ticketId,
            input.commentId ?? null,
            input.uploadBatchId,
            objectKey,
            input.contentType,
            input.sizeBytes,
            input.durationSeconds ?? null,
            idempotencyKey,
            MAX_UPLOAD_INTENTS_PER_MINUTE,
            MAX_PROJECT_BYTES,
            MAX_TICKET_BYTES,
            input.requestHash,
          ]),
        ]);
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }

      const rowSchema = z.object({
        actorId: z.string().uuid().nullable(),
        actorRole: z.enum(["OWNER", "STAFF", "TENANT"]).nullable(),
        ticketFound: z.boolean(),
        ticketCancelled: z.boolean().nullable(),
        tenantOwnsLease: z.boolean(),
        tenantLeaseActive: z.boolean(),
        commentExists: z.boolean(),
        commentVisible: z.boolean(),
        canUpload: z.boolean(),
        rateCount: z.number().int().nonnegative(),
        projectBytes: z.string().regex(/^\d+$/),
        ticketBytes: z.string().regex(/^\d+$/),
        batchPhotos: z.number().int().nonnegative(),
        batchVideos: z.number().int().nonnegative(),
        batchConsistent: z.boolean(),
        existingOperation: z.string().nullable(),
        existingResponsePayload: z.unknown().nullable(),
        insertedId: z.string().uuid().nullable(),
        insertedObjectKey: z.string().nullable(),
        insertedStatus: uploadStatusSchema.nullable(),
        insertedCreatedAt: z.union([z.string().datetime({ offset: true }), z.date()]).nullable(),
        replayId: z.string().uuid().nullable(),
        replayObjectKey: z.string().nullable(),
        replayStatus: uploadStatusSchema.nullable(),
        replayCreatedAt: z.union([z.string().datetime({ offset: true }), z.date()]).nullable(),
      }).strict();
      const row = rowSchema.safeParse(firstRow(results, results.length - 1));
      if (!row.success) throw new DomainError("INTERNAL_ERROR");
      const attempt = row.data;

      if (!attempt.actorId || !attempt.actorRole) throw new DomainError("UNAUTHENTICATED");
      if (!attempt.ticketFound) throw new DomainError("TICKET_NOT_FOUND");
      if (attempt.actorRole === "TENANT") {
        if (!attempt.tenantOwnsLease) throw new DomainError("TICKET_NOT_OWNED");
        if (!attempt.tenantLeaseActive) throw new DomainError("LEASE_ENDED");
      }
      if (!attempt.commentExists) throw new DomainError("TICKET_NOT_FOUND");
      if (!attempt.commentVisible) throw new DomainError("FORBIDDEN_VISIBILITY");
      if (attempt.ticketCancelled) throw new DomainError("CANCELLED_TERMINAL");

      if (attempt.existingOperation !== null) {
        if (attempt.existingOperation !== "createUploadIntent") throw new DomainError("CONFLICT");
        const saved = parseStoredResponse(attempt.existingResponsePayload);
        if (saved.requestHash !== input.requestHash || saved.attachmentId !== attempt.replayId) {
          throw new DomainError("CONFLICT");
        }
        if (!attempt.replayId || !attempt.replayObjectKey || !attempt.replayStatus || !attempt.replayCreatedAt) {
          throw new DomainError("CONFLICT");
        }
        return {
          id: attempt.replayId,
          objectKey: attempt.replayObjectKey,
          uploadStatus: attempt.replayStatus,
          createdAt: attempt.replayCreatedAt,
          created: false,
        };
      }

      if (!attempt.canUpload) throw new DomainError("FORBIDDEN");
      if (!attempt.batchConsistent) throw new DomainError("CONFLICT");
      if (attempt.rateCount >= MAX_UPLOAD_INTENTS_PER_MINUTE) throw new DomainError("RATE_LIMITED");
      if (BigInt(attempt.projectBytes) + BigInt(Number(input.sizeBytes)) > BigInt(MAX_PROJECT_BYTES)) {
        throw new DomainError("STORAGE_QUOTA_EXCEEDED");
      }
      if (BigInt(attempt.ticketBytes) + BigInt(Number(input.sizeBytes)) > BigInt(MAX_TICKET_BYTES)) {
        throw new DomainError("TICKET_LIMIT_EXCEEDED");
      }
      if (["video/mp4", "video/quicktime"].includes(String(input.contentType)) && attempt.batchVideos >= 1) {
        throw new DomainError("TICKET_LIMIT_EXCEEDED");
      }
      if (!["video/mp4", "video/quicktime"].includes(String(input.contentType)) && attempt.batchPhotos >= 4) {
        throw new DomainError("TICKET_LIMIT_EXCEEDED");
      }
      if (!attempt.insertedId || !attempt.insertedObjectKey || !attempt.insertedStatus || !attempt.insertedCreatedAt) {
        throw new DomainError("CONFLICT");
      }

      return {
        id: attempt.insertedId,
        objectKey: attempt.insertedObjectKey,
        uploadStatus: attempt.insertedStatus,
        createdAt: attempt.insertedCreatedAt,
        created: true,
      };
    },

    async getUploadForFinalize(input) {
      try {
        const sql = getSql();
        const results = await sql.transaction([
          sql.query(ATTACHMENT_ACCESS_SQL, [input.actorId, input.attachmentId, true, "TICKET_MEDIA_FINALIZE_REQUESTED"]),
        ]);
        const row = firstRow(results, 0);
        return row ? parseRecord(row) : null;
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },

    async queueInvalidUpload(id) {
      try {
        const sql = getSql();
        await sql.transaction([
          sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'on', TRUE)`, []),
          sql.query(`
            UPDATE ticket_attachments
               SET upload_status = 'DELETE_PENDING'::"TicketUploadStatus",
                   delete_after = CURRENT_TIMESTAMP
             WHERE id = $1::uuid AND upload_status = 'PENDING_UPLOAD'::"TicketUploadStatus"
          `, [id]),
          sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'off', TRUE)`, []),
        ]);
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },

    async finalizeUpload(input) {
      try {
        const sql = getSql();
        const results = await sql.transaction([
          sql.query(FINALIZE_UPLOAD_SQL, [input.actorId, input.attachmentId, "TICKET_MEDIA_FINALIZED"]),
        ]);
        const row = z.object({ finalized: z.boolean() }).strict().safeParse(firstRow(results, 0));
        if (!row.success) throw new DomainError("INTERNAL_ERROR");
        return row.data.finalized;
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },

    async getAttachmentForDownload(input) {
      try {
        const sql = getSql();
        const results = await sql.transaction([
          sql.query(ATTACHMENT_ACCESS_SQL, [input.actorId, input.attachmentId, false, "TICKET_MEDIA_DOWNLOAD_URL_REQUESTED"]),
        ]);
        const row = firstRow(results, 0);
        return row ? parseRecord(row) : null;
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },

    async prepareMediaCleanup(input) {
      const limit = Math.min(Math.max(input.limit, 1), MAX_CLEANUP_BATCH_SIZE);
      try {
        const sql = getSql();
        const results = await sql.transaction([
          sql.query(`SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`, ["rumakost:ticket-media-cleanup"]),
          sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'on', TRUE)`, []),
          sql.query(`
            UPDATE ticket_attachments
               SET upload_status = 'DELETE_PENDING'::"TicketUploadStatus",
                   delete_after = COALESCE(delete_after, CURRENT_TIMESTAMP)
             WHERE (upload_status = 'AVAILABLE'::"TicketUploadStatus" AND delete_after <= $1::timestamptz)
                OR (upload_status = 'PENDING_UPLOAD'::"TicketUploadStatus" AND (
                     delete_after <= $1::timestamptz
                     OR created_at <= $1::timestamptz - INTERVAL '1 hour'
                   ))
          `, [input.now]),
          sql.query(`SELECT set_config('rumakost.ticket_retention_update', 'off', TRUE)`, []),
          sql.query(`
            SELECT id, object_key AS "objectKey"
              FROM ticket_attachments
             WHERE upload_status = 'DELETE_PENDING'::"TicketUploadStatus"
             ORDER BY delete_after NULLS FIRST, created_at, id
             LIMIT $1::integer
          `, [limit]),
        ]);
        return firstRows(results, 4).map((candidate) => {
          const parsed = z.object({ id: z.string().uuid(), objectKey: z.string().min(1) }).strict().safeParse(candidate);
          if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
          return parsed.data;
        });
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },

    async markAttachmentDeleted(id) {
      try {
        const sql = getSql();
        const results = await sql.transaction([
          sql.query(`
            WITH deleted AS (
              UPDATE ticket_attachments
                 SET upload_status = 'DELETED'::"TicketUploadStatus"
               WHERE id = $1::uuid
                 AND upload_status = 'DELETE_PENDING'::"TicketUploadStatus"
              RETURNING id
            ),
            audit AS (
              INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata)
              SELECT gen_random_uuid(), NULL, 'TICKET_MEDIA_DELETED', 'TICKET_ATTACHMENT', deleted.id,
                     CURRENT_TIMESTAMP, jsonb_build_object('uploadStatus', 'DELETED')
                FROM deleted
              RETURNING id
            )
            SELECT EXISTS (SELECT 1 FROM deleted) AS deleted
          `, [id]),
        ]);
        const row = z.object({ deleted: z.boolean() }).strict().safeParse(firstRow(results, 0));
        if (!row.success) throw new DomainError("INTERNAL_ERROR");
        return row.data.deleted;
      } catch (error) {
        throw mapMediaPersistenceError(error);
      }
    },
  };
}
