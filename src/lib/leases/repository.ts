import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";

const leaseStatusSchema = z.enum(["SCHEDULED", "ACTIVE", "ENDED"]);
const billingModeSchema = z.enum([
  "PRORATA_TO_MONTH_END",
  "FULL_MONTH_ANNIVERSARY",
]);
const lineKindSchema = z.enum(["RENT", "DEPOSIT"]);

const leaseRecordSchema = z.object({
  id: z.string().uuid(),
  tenantUserId: z.string().uuid(),
  roomId: z.string().uuid(),
  startsOn: z.string(),
  endsOn: z.string().nullable(),
  rentAmount: z.string(),
  depositAgreedAmount: z.string(),
  billingMode: billingModeSchema,
  status: leaseStatusSchema,
  contractNumber: z.string().nullable(),
  createdById: z.string().uuid(),
});

const invoiceLineSchema = z.object({
  id: z.string().uuid(),
  kind: lineKindSchema,
  amount: z.string(),
  description: z.string(),
});

const invoiceSchema = z.object({
  id: z.string().uuid(),
  periodStart: z.string(),
  periodEnd: z.string(),
  dueOn: z.string(),
  kind: z.literal("INITIAL"),
  status: z.literal("ISSUED"),
  amountDue: z.string(),
  lines: z.array(invoiceLineSchema).min(1),
});

const leaseCreationResultSchema = z.object({
  lease: leaseRecordSchema,
  invoice: invoiceSchema,
});

const idempotencyRowSchema = z.object({
  operation: z.string(),
  responseCode: z.number().nullable(),
  responsePayload: z.unknown().nullable(),
  completedAt: z.string().nullable(),
});

const storedResponseSchema = z.object({
  requestHash: z.string().regex(/^[a-f0-9]{64}$/),
  data: leaseCreationResultSchema,
});

const appUserRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["OWNER", "STAFF", "TENANT"]),
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  hasTenantProfile: z.boolean(),
});

const roomRowSchema = z.object({
  id: z.string().uuid(),
  archived: z.boolean(),
  physicalStatus: z.enum(["READY", "CLEANING", "MAINTENANCE"]),
  floorId: z.string().uuid().nullable(),
  floorArchived: z.boolean().nullable(),
});

const conflictRowSchema = z.object({
  roomConflict: z.boolean(),
  tenantConflict: z.boolean(),
});

type BillingMode = z.infer<typeof billingModeSchema>;
type LeaseStatus = z.infer<typeof leaseStatusSchema>;

export type InitialInvoiceInput = {
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  amountDue: string;
  lines: Array<{
    kind: z.infer<typeof lineKindSchema>;
    amount: string;
    description: string;
  }>;
};

export type CreateLeaseWithInvoiceInput = {
  actorId: string;
  tenantUserId: string;
  roomId: string;
  startsOn: string;
  endsOn: string | null;
  rentAmount: string;
  depositAgreedAmount: string;
  billingMode: BillingMode;
  contractNumber: string | null;
  status: LeaseStatus;
  idempotencyKey: string;
  initialInvoice: InitialInvoiceInput;
  requestHash: string;
};

export type LeaseCreationResult = z.infer<typeof leaseCreationResultSchema>;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function rowsAt(results: unknown[][], index: number): unknown[] {
  const rows = results[index];
  return Array.isArray(rows) ? rows : [];
}

function parseStoredResponse(row: unknown, requestHash: string): LeaseCreationResult {
  const key = idempotencyRowSchema.parse(row);
  if (
    key.operation !== "createLease" ||
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

  const stored = storedResponseSchema.safeParse(payload);
  if (!stored.success) throw new DomainError("INTERNAL_ERROR");
  if (stored.data.requestHash !== requestHash) {
    throw new DomainError("CONFLICT");
  }

  return stored.data.data;
}

async function findIdempotencyKey(sql: ReturnType<typeof getSql>, key: string) {
  const rows: unknown[] = await sql.query(
    `SELECT operation,
            response_code AS "responseCode",
            response_payload AS "responsePayload",
            completed_at::text AS "completedAt"
       FROM idempotency_keys
      WHERE "key" = $1::uuid
      LIMIT 1`,
    [key],
  );
  return rows[0] ?? null;
}

function classifyNoLeaseCreated({
  users,
  room,
  conflict,
  actorId,
  tenantUserId,
}: {
  users: z.infer<typeof appUserRowSchema>[];
  room: z.infer<typeof roomRowSchema> | null;
  conflict: z.infer<typeof conflictRowSchema>;
  actorId: string;
  tenantUserId: string;
}): never {
  const actor = users.find((user) => user.id === actorId);
  if (
    !actor ||
    !actor.isActive ||
    actor.mustChangePassword ||
    !["OWNER", "STAFF"].includes(actor.role)
  ) {
    throw new DomainError("UNAUTHENTICATED");
  }

  const tenant = users.find((user) => user.id === tenantUserId);
  if (!tenant || tenant.role !== "TENANT" || !tenant.isActive) {
    throw new DomainError("TENANT_INACTIVE");
  }
  if (!tenant.hasTenantProfile) {
    throw new DomainError("TENANT_PROFILE_NOT_FOUND");
  }

  if (!room || room.archived) throw new DomainError("ROOM_NOT_FOUND");
  if (room.floorId !== null && room.floorArchived !== false) {
    throw new DomainError("FLOOR_NOT_FOUND");
  }
  if (room.physicalStatus === "MAINTENANCE") {
    throw new DomainError("ROOM_IN_USE");
  }
  if (conflict.roomConflict) throw new DomainError("ROOM_CONFLICT");
  if (conflict.tenantConflict) throw new DomainError("CONFLICT");

  throw new DomainError("INTERNAL_ERROR");
}

export function createLeaseRepository() {
  return {
    async createLeaseWithInitialInvoice(
      input: CreateLeaseWithInvoiceInput,
    ): Promise<LeaseCreationResult> {
      const sql = getSql();
      const leaseId = randomUUID();
      const invoiceId = randomUUID();
      const lineIds = input.initialInvoice.lines.map(() => randomUUID());
      const responseData: LeaseCreationResult = {
        lease: {
          id: leaseId,
          tenantUserId: input.tenantUserId,
          roomId: input.roomId,
          startsOn: input.startsOn,
          endsOn: input.endsOn,
          rentAmount: input.rentAmount,
          depositAgreedAmount: input.depositAgreedAmount,
          billingMode: input.billingMode,
          status: input.status,
          contractNumber: input.contractNumber,
          createdById: input.actorId,
        },
        invoice: {
          id: invoiceId,
          periodStart: input.initialInvoice.periodStart,
          periodEnd: input.initialInvoice.periodEnd,
          dueOn: input.initialInvoice.dueOn,
          kind: "INITIAL",
          status: "ISSUED",
          amountDue: input.initialInvoice.amountDue,
          lines: input.initialInvoice.lines.map((line, index) => ({
            id: lineIds[index],
            kind: line.kind,
            amount: line.amount,
            description: line.description,
          })),
        },
      };
      const responsePayload = JSON.stringify({
        requestHash: input.requestHash,
        data: responseData,
      });

      const queries = [
        sql.query(
          `SELECT operation,
                  response_code AS "responseCode",
                  response_payload AS "responsePayload",
                  completed_at::text AS "completedAt"
             FROM idempotency_keys
            WHERE "key" = $1::uuid
            LIMIT 1
            FOR UPDATE`,
          [input.idempotencyKey],
        ),
        sql.query(
          `SELECT app_user.id,
                  app_user.role::text AS role,
                  app_user.is_active AS "isActive",
                  app_user.must_change_password AS "mustChangePassword",
                  EXISTS (
                    SELECT 1 FROM tenant_profiles
                     WHERE tenant_profiles.user_id = app_user.id
                  ) AS "hasTenantProfile"
             FROM app_users AS app_user
            WHERE app_user.id IN ($1::uuid, $2::uuid)
            ORDER BY app_user.id
            FOR UPDATE OF app_user`,
          [input.actorId, input.tenantUserId],
        ),
        sql.query(
          `SELECT room.id,
                  (room.archived_at IS NOT NULL) AS archived,
                  room.physical_status::text AS "physicalStatus",
                  room.floor_id AS "floorId",
                  (floor.archived_at IS NOT NULL) AS "floorArchived"
             FROM rooms AS room
             LEFT JOIN floors AS floor ON floor.id = room.floor_id
            WHERE room.id = $1::uuid
            LIMIT 1
            FOR UPDATE OF room`,
          [input.roomId],
        ),
        sql.query(
          `SELECT EXISTS (
                    SELECT 1 FROM leases
                     WHERE room_id = $1::uuid
                       AND status <> 'CANCELLED'
                       AND daterange(starts_on, ends_on, '[]')
                           && daterange($3::date, $4::date, '[]')
                  ) AS "roomConflict",
                  EXISTS (
                    SELECT 1 FROM leases
                     WHERE tenant_user_id = $2::uuid
                       AND status <> 'CANCELLED'
                       AND daterange(starts_on, ends_on, '[]')
                           && daterange($3::date, $4::date, '[]')
                  ) AS "tenantConflict"`,
          [input.roomId, input.tenantUserId, input.startsOn, input.endsOn],
        ),
        sql.query(
          `INSERT INTO leases (
             id, tenant_user_id, room_id, starts_on, ends_on,
             rent_amount, deposit_agreed_amount, billing_mode, status,
             contract_number, created_by_id, created_at, updated_at
           )
           SELECT $1::uuid,
                  tenant.id,
                  room.id,
                  $5::date,
                  $6::date,
                  $7::numeric,
                  $8::numeric,
                  $9::"BillingMode",
                  $10::"LeaseStatus",
                  $11::text,
                  actor.id,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
             FROM app_users AS actor
             JOIN app_users AS tenant
               ON tenant.id = $3::uuid
              AND tenant.role::text = 'TENANT'
              AND tenant.is_active
             JOIN tenant_profiles AS profile ON profile.user_id = tenant.id
             JOIN rooms AS room
               ON room.id = $4::uuid
              AND room.archived_at IS NULL
              AND room.physical_status <> 'MAINTENANCE'
             LEFT JOIN floors AS floor ON floor.id = room.floor_id
            WHERE actor.id = $2::uuid
              AND actor.role::text IN ('OWNER', 'STAFF')
              AND actor.is_active
              AND NOT actor.must_change_password
              AND (room.floor_id IS NULL OR floor.archived_at IS NULL)
              AND NOT EXISTS (
                SELECT 1 FROM idempotency_keys
                 WHERE "key" = $12::uuid
              )
              AND (
                $10::"LeaseStatus" NOT IN ('SCHEDULED', 'ACTIVE')
                OR (
                  NOT EXISTS (
                    SELECT 1 FROM leases AS existing_room_lease
                     WHERE existing_room_lease.room_id = room.id
                       AND existing_room_lease.status <> 'CANCELLED'
                       AND daterange(existing_room_lease.starts_on, existing_room_lease.ends_on, '[]')
                           && daterange($5::date, $6::date, '[]')
                  )
                  AND NOT EXISTS (
                    SELECT 1 FROM leases AS existing_tenant_lease
                     WHERE existing_tenant_lease.tenant_user_id = tenant.id
                       AND existing_tenant_lease.status <> 'CANCELLED'
                       AND daterange(existing_tenant_lease.starts_on, existing_tenant_lease.ends_on, '[]')
                           && daterange($5::date, $6::date, '[]')
                  )
                )
              )
           RETURNING id,
                     tenant_user_id AS "tenantUserId",
                     room_id AS "roomId",
                     starts_on::text AS "startsOn",
                     ends_on::text AS "endsOn",
                     rent_amount::text AS "rentAmount",
                     deposit_agreed_amount::text AS "depositAgreedAmount",
                     billing_mode::text AS "billingMode",
                     status::text AS status,
                     contract_number AS "contractNumber",
                     created_by_id AS "createdById"`,
          [
            leaseId,
            input.actorId,
            input.tenantUserId,
            input.roomId,
            input.startsOn,
            input.endsOn,
            input.rentAmount,
            input.depositAgreedAmount,
            input.billingMode,
            input.status,
            input.contractNumber,
            input.idempotencyKey,
          ],
        ),
        sql.query(
          `INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'LEASE_CREATED', 'LEASE', lease.id,
                  CURRENT_TIMESTAMP,
                  jsonb_build_object(
                    'tenantUserId', lease.tenant_user_id,
                    'roomId', lease.room_id,
                    'status', lease.status,
                    'billingMode', lease.billing_mode,
                    'startsOn', lease.starts_on,
                    'endsOn', lease.ends_on
                  )
             FROM app_users actor
             JOIN leases lease ON lease.id = $2::uuid
            WHERE actor.id = $1::uuid
              AND actor.role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole")
              AND actor.is_active AND NOT actor.must_change_password
           RETURNING id`,
          [input.actorId, leaseId],
        ),
        sql.query(
          `INSERT INTO invoices (
             id, lease_id, period_start, period_end, due_on, kind, status,
             issued_at, delivery_status, voided_at, created_at, updated_at
           )
           SELECT $1::uuid,
                  lease.id,
                  $3::date,
                  $4::date,
                  $5::date,
                  'INITIAL',
                  'ISSUED'::"InvoiceStatus",
                  CURRENT_TIMESTAMP,
                  'UNSENT'::"InvoiceDeliveryStatus",
                  NULL,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
             FROM leases AS lease
            WHERE lease.id = $2::uuid
           RETURNING id,
                     period_start::text AS "periodStart",
                     period_end::text AS "periodEnd",
                     due_on::text AS "dueOn",
                     kind,
                     status::text AS status`,
          [
            invoiceId,
            leaseId,
            input.initialInvoice.periodStart,
            input.initialInvoice.periodEnd,
            input.initialInvoice.dueOn,
          ],
        ),
        sql.query(
          `INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), actor.id, 'INITIAL_INVOICE_ISSUED', 'INVOICE', invoice.id,
                  CURRENT_TIMESTAMP,
                  jsonb_build_object(
                    'leaseId', invoice.lease_id,
                    'kind', invoice.kind,
                    'periodStart', invoice.period_start,
                    'periodEnd', invoice.period_end,
                    'status', invoice.status
                  )
             FROM app_users actor
             JOIN invoices invoice ON invoice.id = $2::uuid
            WHERE actor.id = $1::uuid
              AND actor.role IN ('OWNER'::"AppRole", 'STAFF'::"AppRole")
              AND actor.is_active AND NOT actor.must_change_password
           RETURNING id`,
          [input.actorId, invoiceId],
        ),
        ...input.initialInvoice.lines.map((line, index) =>
          sql.query(
            `INSERT INTO invoice_lines (id, invoice_id, kind, amount, description)
             SELECT $1::uuid, invoice.id, $3::text, $4::numeric, $5::text
               FROM invoices AS invoice
              WHERE invoice.id = $2::uuid
             RETURNING id, kind, amount::text AS amount, description`,
            [lineIds[index], invoiceId, line.kind, line.amount, line.description],
          ),
        ),
        sql.query(
          `INSERT INTO idempotency_keys (
             "key", operation, response_code, response_payload, completed_at
           )
           SELECT $1::uuid, 'createLease', 200, $3::jsonb, CURRENT_TIMESTAMP
            WHERE EXISTS (SELECT 1 FROM leases WHERE id = $2::uuid)
           RETURNING "key"`,
          [input.idempotencyKey, leaseId, responsePayload],
        ),
      ];

      let results: unknown[][];
      try {
        results = await sql.transaction(queries);
      } catch (error) {
        try {
          const existing = await findIdempotencyKey(sql, input.idempotencyKey);
          if (existing !== null) {
            return parseStoredResponse(existing, input.requestHash);
          }
        } catch (lookupError) {
          if (lookupError instanceof DomainError) throw lookupError;
        }
        throw error;
      }

      const existingKey = rowsAt(results, 0);
      if (existingKey[0] !== undefined) {
        return parseStoredResponse(existingKey[0], input.requestHash);
      }

      const users = rowsAt(results, 1).map((row) => appUserRowSchema.parse(row));
      const roomRow = rowsAt(results, 2)[0];
      const room = roomRow === undefined ? null : roomRowSchema.parse(roomRow);
      const conflict = conflictRowSchema.parse(rowsAt(results, 3)[0]);
      const leaseRows = rowsAt(results, 4);
      const leaseAuditRows = rowsAt(results, 5);
      const invoiceRows = rowsAt(results, 6);
      const invoiceAuditRows = rowsAt(results, 7);
      const lineOffset = 8;
      const lineRows = input.initialInvoice.lines.flatMap((_, index) =>
        rowsAt(results, lineOffset + index),
      );
      const idempotencyRows = rowsAt(results, lineOffset + input.initialInvoice.lines.length);

      if (leaseRows.length === 0) {
        const completedDuringRequest = await findIdempotencyKey(sql, input.idempotencyKey);
        if (completedDuringRequest !== null) {
          return parseStoredResponse(completedDuringRequest, input.requestHash);
        }
        classifyNoLeaseCreated({
          users,
          room,
          conflict,
          actorId: input.actorId,
          tenantUserId: input.tenantUserId,
        });
      }
      if (
        leaseAuditRows.length !== 1 ||
        invoiceRows.length !== 1 ||
        invoiceAuditRows.length !== 1 ||
        lineRows.length !== input.initialInvoice.lines.length ||
        idempotencyRows.length !== 1
      ) {
        throw new DomainError("INTERNAL_ERROR");
      }

      const result: LeaseCreationResult = {
        lease: leaseRecordSchema.parse(leaseRows[0]),
        invoice: {
          ...invoiceSchema.omit({ amountDue: true, lines: true }).parse(invoiceRows[0]),
          amountDue: input.initialInvoice.amountDue,
          lines: lineRows.map((row) => invoiceLineSchema.parse(row)),
        },
      };

      return leaseCreationResultSchema.parse(result);
    },
  };
}
