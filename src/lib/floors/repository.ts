import "server-only";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { getDatabaseEnv } from "@/lib/env";

type SqlValue = string | number | boolean | Date | null;

const floorRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  archivedAt: z.string().nullable(),
});

const existsRowSchema = z.object({ exists: z.boolean() });

export type FloorRecord = z.infer<typeof floorRowSchema>;
export type FloorListResult = {
  items: FloorRecord[];
  nextCursor: { afterName: string } | null;
};

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

async function queryRows<T>(
  statement: string,
  parameters: SqlValue[],
  schema: z.ZodType<T>,
): Promise<T[]> {
  const result: unknown[] = await getSql().query(statement, parameters);
  return result.map((row) => schema.parse(row));
}

const floorColumns = `
  id,
  name,
  archived_at::text AS "archivedAt"
`;

export function createFloorRepository() {
  return {
    async findFloor(floorId: string): Promise<FloorRecord | null> {
      const rows = await queryRows(
        `SELECT ${floorColumns} FROM floors WHERE id = $1::uuid LIMIT 1`,
        [floorId],
        floorRowSchema,
      );
      return rows[0] ?? null;
    },

    async findFloorByNormalizedName(name: string): Promise<FloorRecord | null> {
      const rows = await queryRows(
        `SELECT ${floorColumns}
         FROM floors
         WHERE normalized_name = lower(btrim($1::text))
         LIMIT 1`,
        [name],
        floorRowSchema,
      );
      return rows[0] ?? null;
    },

    async hasUnarchivedRooms(floorId: string): Promise<boolean> {
      const rows = await queryRows(
        `SELECT EXISTS (
           SELECT 1 FROM rooms
           WHERE floor_id = $1::uuid AND archived_at IS NULL
         ) AS exists`,
        [floorId],
        existsRowSchema,
      );
      return rows[0]?.exists ?? false;
    },

    async listFloors({
      includeArchived,
      limit,
      afterName,
    }: {
      includeArchived: boolean;
      limit: number;
      afterName?: string;
    }): Promise<FloorRecord[]> {
      return queryRows(
        `SELECT ${floorColumns}
         FROM floors
         WHERE ($1::boolean OR archived_at IS NULL)
           AND ($2::text IS NULL OR normalized_name > lower(btrim($2::text)))
         ORDER BY normalized_name
         LIMIT $3::integer`,
        [includeArchived, afterName ?? null, limit],
        floorRowSchema,
      );
    },

    async createFloor(input: { name: string; actorId: string }): Promise<FloorRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $2::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), inserted AS (
           INSERT INTO floors (
             id, name, normalized_name, created_at, updated_at
           )
           SELECT gen_random_uuid(), $1, lower(btrim($1::text)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM actor
           RETURNING *
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'FLOOR_CREATED', 'FLOOR', inserted.id,
                  CURRENT_TIMESTAMP, '{}'::jsonb
             FROM actor CROSS JOIN inserted
           RETURNING id
         )
         SELECT ${floorColumns} FROM inserted JOIN audit ON TRUE`,
        [input.name, input.actorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("Floor insert returned no row.");
      return rows[0];
    },

    async updateFloor(
      floorId: string,
      input: { name: string },
      actorId: string,
    ): Promise<FloorRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $3::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), prior AS MATERIALIZED (
           SELECT floor.* FROM floors floor JOIN actor ON TRUE
            WHERE floor.id = $1::uuid AND floor.archived_at IS NULL
            FOR UPDATE OF floor
         ), updated AS (
           UPDATE floors floor
              SET name = $2, normalized_name = lower(btrim($2::text)), updated_at = CURRENT_TIMESTAMP
             FROM prior
            WHERE floor.id = prior.id
              AND (prior.name IS DISTINCT FROM $2::text
                OR prior.normalized_name IS DISTINCT FROM lower(btrim($2::text)))
           RETURNING floor.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'FLOOR_UPDATED', 'FLOOR', updated.id,
                  CURRENT_TIMESTAMP, jsonb_build_object('changedFields', jsonb_build_array('name'))
             FROM actor CROSS JOIN updated
           RETURNING id
         )
         SELECT ${floorColumns} FROM updated
         UNION ALL
         SELECT ${floorColumns} FROM prior WHERE NOT EXISTS (SELECT 1 FROM updated)`,
        [floorId, input.name, actorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },

    async archiveFloor(floorId: string, actorId: string): Promise<FloorRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $2::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), updated AS (
           UPDATE floors floor
              SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             FROM actor
            WHERE floor.id = $1::uuid AND floor.archived_at IS NULL
           RETURNING floor.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'FLOOR_ARCHIVED', 'FLOOR', updated.id,
                  CURRENT_TIMESTAMP, '{}'::jsonb
             FROM actor CROSS JOIN updated
           RETURNING id
         )
         SELECT ${floorColumns} FROM updated JOIN audit ON TRUE`,
        [floorId, actorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },

    async restoreFloor(floorId: string, actorId: string): Promise<FloorRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $2::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), updated AS (
           UPDATE floors floor
              SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
             FROM actor
            WHERE floor.id = $1::uuid AND floor.archived_at IS NOT NULL
           RETURNING floor.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'FLOOR_RESTORED', 'FLOOR', updated.id,
                  CURRENT_TIMESTAMP, '{}'::jsonb
             FROM actor CROSS JOIN updated
           RETURNING id
         )
         SELECT ${floorColumns} FROM updated JOIN audit ON TRUE`,
        [floorId, actorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },
  };
}
