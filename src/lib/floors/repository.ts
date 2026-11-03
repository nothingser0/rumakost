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

    async createFloor(input: { name: string }): Promise<FloorRecord> {
      const rows = await queryRows(
        `INSERT INTO floors (
           id, name, normalized_name, created_at, updated_at
         ) VALUES (
           gen_random_uuid(), $1, lower(btrim($1::text)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         )
         RETURNING ${floorColumns}`,
        [input.name],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("Floor insert returned no row.");
      return rows[0];
    },

    async updateFloor(
      floorId: string,
      input: { name: string },
    ): Promise<FloorRecord> {
      const rows = await queryRows(
        `UPDATE floors
         SET name = $2, normalized_name = lower(btrim($2::text)), updated_at = CURRENT_TIMESTAMP
         WHERE id = $1::uuid AND archived_at IS NULL
         RETURNING ${floorColumns}`,
        [floorId, input.name],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },

    async archiveFloor(floorId: string): Promise<FloorRecord> {
      const rows = await queryRows(
        `UPDATE floors
         SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1::uuid AND archived_at IS NULL
         RETURNING ${floorColumns}`,
        [floorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },

    async restoreFloor(floorId: string): Promise<FloorRecord> {
      const rows = await queryRows(
        `UPDATE floors
         SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1::uuid AND archived_at IS NOT NULL
         RETURNING ${floorColumns}`,
        [floorId],
        floorRowSchema,
      );
      if (!rows[0]) throw new Error("FLOOR_NOT_FOUND");
      return rows[0];
    },
  };
}
