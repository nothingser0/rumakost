import "server-only";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type { ActivityRepository } from "./operations.mjs";

const activityRecordSchema = z.object({
  id: z.string().uuid(),
  source: z.enum(["AUDIT", "TICKET_STATUS"]),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().uuid(),
  parentEntityId: z.string().uuid().nullable(),
  occurredAt: z.string().datetime({ offset: true }),
  actorId: z.string().uuid().nullable(),
  actorName: z.string().nullable(),
  actorRole: z.enum(["OWNER", "STAFF", "TENANT"]).nullable(),
  actorType: z.enum(["USER", "SYSTEM"]),
  fromStatus: z.string().nullable(),
  toStatus: z.string().nullable(),
}).strict();

const ACTIVITY_PAGE_SQL = `
  WITH activity AS MATERIALIZED (
    SELECT event.id,
           'AUDIT'::text AS source,
           event.action,
           event.entity_type AS "entityType",
           event.entity_id AS "entityId",
           CASE event.entity_type
             WHEN 'TICKET_ATTACHMENT' THEN attachment.ticket_id
             WHEN 'LEASE_END_REQUEST' THEN end_request.lease_id
             WHEN 'DEPOSIT_LEDGER_ENTRY' THEN deposit_entry.lease_id
             ELSE NULL
           END AS "parentEntityId",
           to_char(event.occurred_at AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "occurredAt",
           event.actor_id AS "actorId",
           actor.display_name AS "actorName",
           actor.role::text AS "actorRole",
           CASE WHEN event.actor_id IS NULL THEN 'SYSTEM' ELSE 'USER' END AS "actorType",
           NULL::text AS "fromStatus",
           NULL::text AS "toStatus",
           event.occurred_at AS sort_time
      FROM audit_events event
      LEFT JOIN app_users actor ON actor.id = event.actor_id
      LEFT JOIN ticket_attachments attachment
        ON event.entity_type = 'TICKET_ATTACHMENT' AND attachment.id = event.entity_id
      LEFT JOIN lease_end_requests end_request
        ON event.entity_type = 'LEASE_END_REQUEST' AND end_request.id = event.entity_id
      LEFT JOIN deposit_ledger_entries deposit_entry
        ON event.entity_type = 'DEPOSIT_LEDGER_ENTRY' AND deposit_entry.id = event.entity_id
     WHERE event.occurred_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Jakarta')
       AND event.occurred_at < (($2::date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
       AND (
         $3::text = 'OWNER'
         OR event.entity_type IN (
           'TICKET', 'TICKET_ATTACHMENT', 'ROOM', 'FLOOR', 'LEASE', 'LEASE_END_REQUEST'
         )
       )

    UNION ALL

    SELECT event.id,
           'TICKET_STATUS'::text AS source,
           'TICKET_STATUS_CHANGED'::text AS action,
           'TICKET'::text AS "entityType",
           event.ticket_id AS "entityId",
           NULL::uuid AS "parentEntityId",
           to_char(event.occurred_at AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "occurredAt",
           event.actor_id AS "actorId",
           actor.display_name AS "actorName",
           actor.role::text AS "actorRole",
           event.actor_type::text AS "actorType",
           event.from_status::text AS "fromStatus",
           event.to_status::text AS "toStatus",
           event.occurred_at AS sort_time
      FROM ticket_status_events event
      LEFT JOIN app_users actor ON actor.id = event.actor_id
     WHERE event.occurred_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Jakarta')
       AND event.occurred_at < (($2::date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
       AND NOT EXISTS (
         SELECT 1
           FROM audit_events audit
          WHERE audit.entity_type = 'TICKET'
            AND audit.entity_id = event.ticket_id
            AND audit.actor_id IS NOT DISTINCT FROM event.actor_id
            AND audit.occurred_at = event.occurred_at
            AND (
              (audit.action = 'TICKET_DRAFT_CREATED'
                AND event.from_status IS NULL
                AND event.to_status = 'DRAFT'::"TicketStatus")
              OR (audit.action = 'TICKET_DRAFT_EXPIRED'
                AND event.from_status = 'DRAFT'::"TicketStatus"
                AND event.to_status = 'CANCELLED'::"TicketStatus")
              OR (audit.action IN (
                    'TICKET_SUBMITTED', 'TICKET_DRAFT_DISCARDED', 'TICKET_CANCELLED',
                    'TICKET_REOPENED', 'TICKET_ASSIGNED', 'TICKET_UPDATED'
                  )
                AND audit.safe_metadata->>'fromStatus' IS NOT DISTINCT FROM event.from_status::text
                AND audit.safe_metadata->>'toStatus' IS NOT DISTINCT FROM event.to_status::text)
            )
       )
  )
  SELECT id, source, action, "entityType", "entityId", "parentEntityId",
         "occurredAt", "actorId", "actorName", "actorRole", "actorType",
         "fromStatus", "toStatus"
    FROM activity
   WHERE $4::timestamptz IS NULL
      OR (sort_time, id) < ($4::timestamptz, $5::uuid)
   ORDER BY sort_time DESC, id DESC
   LIMIT $6::integer
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

export function createActivityRepository(): ActivityRepository {
  return {
    async listActivity(input) {
      let rows: unknown[];
      try {
        rows = await getSql().query(ACTIVITY_PAGE_SQL, [
          input.startDate,
          input.endDate,
          input.actorRole,
          input.cursor?.occurredAt ?? null,
          input.cursor?.id ?? null,
          input.limit,
        ]);
      } catch (error) {
        if (error instanceof DomainError) throw error;
        throw mapPersistenceError(error);
      }

      const parsed = z.array(activityRecordSchema).safeParse(rows);
      if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
      return parsed.data;
    },
  };
}
