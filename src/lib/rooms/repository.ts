import "server-only";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { getDatabaseEnv } from "@/lib/env";

type SqlValue = string | number | boolean | Date | null;

const roomStatusSchema = z.enum(["READY", "CLEANING", "MAINTENANCE"]);

const roomRowSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  floorId: z.string().uuid().nullable(),
  roomType: z.string().nullable(),
  widthMeters: z.string().nullable(),
  lengthMeters: z.string().nullable(),
  monthlyRent: z.string(),
  depositDefaultAmount: z.string(),
  physicalStatus: roomStatusSchema,
  maintenanceNote: z.string().nullable(),
  archivedAt: z.string().nullable(),
});

const floorRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  archivedAt: z.string().nullable(),
});

const existsRowSchema = z.object({ exists: z.boolean() });

export type RoomRecord = z.infer<typeof roomRowSchema>;
export type FloorRecord = z.infer<typeof floorRowSchema>;
export type RoomPhysicalStatus = z.infer<typeof roomStatusSchema>;
export type RoomListResult = {
  items: RoomRecord[];
  nextCursor: { afterCode: string } | null;
};

export type RoomCreateInput = {
  code: string;
  floorId: string | null;
  roomType: string | null;
  widthMeters: string | null;
  lengthMeters: string | null;
  monthlyRent: string;
  depositDefaultAmount: string;
  physicalStatus: RoomPhysicalStatus;
  maintenanceNote: string | null;
};

export type RoomUpdateInput = Partial<RoomCreateInput>;

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

const roomColumns = `
  id,
  code,
  floor_id AS "floorId",
  room_type AS "roomType",
  width_m::text AS "widthMeters",
  length_m::text AS "lengthMeters",
  monthly_rent::text AS "monthlyRent",
  deposit_default_amount::text AS "depositDefaultAmount",
  physical_status::text AS "physicalStatus",
  maintenance_note AS "maintenanceNote",
  archived_at::text AS "archivedAt"
`;

const floorColumns = `
  id,
  name,
  archived_at::text AS "archivedAt"
`;

export function createRoomRepository() {
  return {
    async findRoom(roomId: string): Promise<RoomRecord | null> {
      const rows = await queryRows(
        `SELECT ${roomColumns} FROM rooms WHERE id = $1::uuid LIMIT 1`,
        [roomId],
        roomRowSchema,
      );
      return rows[0] ?? null;
    },

    async findRoomByCode(code: string): Promise<RoomRecord | null> {
      const rows = await queryRows(
        `SELECT ${roomColumns} FROM rooms WHERE code = $1 LIMIT 1`,
        [code],
        roomRowSchema,
      );
      return rows[0] ?? null;
    },

    async findRoomForTenant(
      roomId: string,
      tenantUserId: string,
    ): Promise<RoomRecord | null> {
      const rows = await queryRows(
        `SELECT ${roomColumns}
         FROM rooms AS room
         WHERE room.id = $1::uuid
           AND EXISTS (
             SELECT 1 FROM leases
             WHERE leases.room_id = room.id
               AND leases.tenant_user_id = $2::uuid
           )
         LIMIT 1`,
        [roomId, tenantUserId],
        roomRowSchema,
      );
      return rows[0] ?? null;
    },

    async findFloor(floorId: string): Promise<FloorRecord | null> {
      const rows = await queryRows(
        `SELECT ${floorColumns} FROM floors WHERE id = $1::uuid LIMIT 1`,
        [floorId],
        floorRowSchema,
      );
      return rows[0] ?? null;
    },

    async hasBlockingLease(roomId: string): Promise<boolean> {
      const rows = await queryRows(
        `SELECT EXISTS (
           SELECT 1 FROM leases
           WHERE room_id = $1::uuid AND status IN ('SCHEDULED', 'ACTIVE')
         ) AS exists`,
        [roomId],
        existsRowSchema,
      );
      return rows[0]?.exists ?? false;
    },

    async listRooms({
      includeArchived,
      limit,
      afterCode,
    }: {
      includeArchived: boolean;
      limit: number;
      afterCode?: string;
    }): Promise<RoomRecord[]> {
      return queryRows(
        `SELECT ${roomColumns}
         FROM rooms
         WHERE ($1::boolean OR archived_at IS NULL)
           AND ($2::text IS NULL OR code > $2::text)
         ORDER BY code
         LIMIT $3::integer`,
        [includeArchived, afterCode ?? null, limit],
        roomRowSchema,
      );
    },

    async createRoom(input: RoomCreateInput & { actorId: string }): Promise<RoomRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $10::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), inserted AS (
           INSERT INTO rooms (
             id, code, floor_id, room_type, width_m, length_m,
             monthly_rent, deposit_default_amount, physical_status,
             maintenance_note, created_at, updated_at
           )
           SELECT gen_random_uuid(), $1, $2::uuid, $3, $4::numeric, $5::numeric,
                  $6::numeric, $7::numeric, $8::"RoomPhysicalStatus",
                  $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM actor
           RETURNING *
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'ROOM_CREATED', 'ROOM', inserted.id,
                  CURRENT_TIMESTAMP,
                  jsonb_build_object(
                    'code', inserted.code,
                    'floorId', inserted.floor_id,
                    'physicalStatus', inserted.physical_status,
                    'monthlyRent', inserted.monthly_rent::text,
                    'depositDefaultAmount', inserted.deposit_default_amount::text
                  )
             FROM actor CROSS JOIN inserted
           RETURNING id
         )
         SELECT ${roomColumns} FROM inserted JOIN audit ON TRUE`,
        [
          input.code,
          input.floorId,
          input.roomType,
          input.widthMeters,
          input.lengthMeters,
          input.monthlyRent,
          input.depositDefaultAmount,
          input.physicalStatus,
          input.maintenanceNote,
          input.actorId,
        ],
        roomRowSchema,
      );
      if (!rows[0]) throw new Error("Room insert returned no row.");
      return rows[0];
    },

    async updateRoom(roomId: string, input: RoomUpdateInput, actorId: string): Promise<RoomRecord> {
      const columns: Record<keyof RoomUpdateInput, { column: string; cast: string }> = {
        code: { column: "code", cast: "" },
        floorId: { column: "floor_id", cast: "::uuid" },
        roomType: { column: "room_type", cast: "" },
        widthMeters: { column: "width_m", cast: "::numeric" },
        lengthMeters: { column: "length_m", cast: "::numeric" },
        monthlyRent: { column: "monthly_rent", cast: "::numeric" },
        depositDefaultAmount: { column: "deposit_default_amount", cast: "::numeric" },
        physicalStatus: { column: "physical_status", cast: `::"RoomPhysicalStatus"` },
        maintenanceNote: { column: "maintenance_note", cast: "" },
      };
      const parameters: SqlValue[] = [roomId];
      const assignments = Object.entries(input).map(([key, value]) => {
        const column = columns[key as keyof RoomUpdateInput];
        if (!column || value === undefined) throw new TypeError("Invalid room update field.");
        parameters.push(value as SqlValue);
        return `${column.column} = $${parameters.length}${column.cast}`;
      });
      if (assignments.length === 0) throw new TypeError("Room update is empty.");
      assignments.push("updated_at = CURRENT_TIMESTAMP");

      const changedConditions = Object.entries(input).map(([key], index) => {
        const column = columns[key as keyof RoomUpdateInput];
        return `prior.${column.column} IS DISTINCT FROM $${index + 2}${column.cast}`;
      });
      const actorParameter = parameters.length + 1;
      const staffPermissionParameter = actorParameter + 1;
      const changedFieldsParameter = actorParameter + 2;
      const staffMayUpdate = Object.keys(input).length === 1 && "physicalStatus" in input;
      parameters.push(actorId, staffMayUpdate, JSON.stringify(Object.keys(input)));

      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id, role::text AS role FROM app_users
            WHERE id = $${actorParameter}::uuid
              AND role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole")
              AND is_active AND NOT must_change_password
         ), authorized AS MATERIALIZED (
           SELECT * FROM actor
            WHERE role = 'OWNER' OR (role = 'STAFF' AND $${staffPermissionParameter}::boolean)
         ), prior AS MATERIALIZED (
           SELECT room.* FROM rooms room JOIN authorized ON TRUE
            WHERE room.id = $1::uuid AND room.archived_at IS NULL
            FOR UPDATE OF room
         ), updated AS (
           UPDATE rooms room SET ${assignments.join(", ")}
             FROM prior
            WHERE room.id = prior.id
              AND (${changedConditions.join(" OR ")})
           RETURNING room.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), authorized.id, 'ROOM_UPDATED', 'ROOM', updated.id,
                  CURRENT_TIMESTAMP,
                  jsonb_build_object('changedFields', $${changedFieldsParameter}::jsonb)
             FROM updated CROSS JOIN authorized
           RETURNING id
         )
         SELECT ${roomColumns} FROM updated
         UNION ALL
         SELECT ${roomColumns} FROM prior WHERE NOT EXISTS (SELECT 1 FROM updated)`,
        parameters,
        roomRowSchema,
      );
      if (!rows[0]) throw new Error("ROOM_NOT_FOUND");
      return rows[0];
    },

    async archiveRoom(roomId: string, actorId: string): Promise<RoomRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $2::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), updated AS (
           UPDATE rooms room
              SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             FROM actor
            WHERE room.id = $1::uuid AND room.archived_at IS NULL
           RETURNING room.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'ROOM_ARCHIVED', 'ROOM', updated.id,
                  CURRENT_TIMESTAMP, jsonb_build_object('code', updated.code)
             FROM actor CROSS JOIN updated
           RETURNING id
         )
         SELECT ${roomColumns} FROM updated JOIN audit ON TRUE`,
        [roomId, actorId],
        roomRowSchema,
      );
      if (!rows[0]) throw new Error("ROOM_NOT_FOUND");
      return rows[0];
    },

    async restoreRoom(roomId: string, actorId: string): Promise<RoomRecord> {
      const rows = await queryRows(
        `WITH actor AS MATERIALIZED (
           SELECT id FROM app_users
            WHERE id = $2::uuid AND role = 'OWNER'::"AppRole"
              AND is_active AND NOT must_change_password
         ), updated AS (
           UPDATE rooms room
              SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
             FROM actor
            WHERE room.id = $1::uuid AND room.archived_at IS NOT NULL
           RETURNING room.*
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'ROOM_RESTORED', 'ROOM', updated.id,
                  CURRENT_TIMESTAMP, jsonb_build_object('code', updated.code)
             FROM actor CROSS JOIN updated
           RETURNING id
         )
         SELECT ${roomColumns} FROM updated JOIN audit ON TRUE`,
        [roomId, actorId],
        roomRowSchema,
      );
      if (!rows[0]) throw new Error("ROOM_NOT_FOUND");
      return rows[0];
    },
  };
}
