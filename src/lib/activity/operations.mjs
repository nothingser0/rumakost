import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";
import { resolveDashboardPeriod } from "../dashboard/period.mjs";

const roleSchema = z.enum(["OWNER", "STAFF", "TENANT"]);
const statusSchema = z.enum([
  "DRAFT",
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
  "CANCELLED",
]);

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
  actorRole: roleSchema.nullable(),
  actorType: z.enum(["USER", "SYSTEM"]),
  fromStatus: statusSchema.nullable(),
  toStatus: statusSchema.nullable(),
}).strict();

const activityInputSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.object({
    occurredAt: z.string().datetime({ offset: true }),
    id: z.string().uuid(),
  }).strict().nullable().optional(),
}).strict();

function requireInternalActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER" && actor.role !== "STAFF") {
    throw new DomainError("FORBIDDEN");
  }
}

export function canViewActivityAction(role, record) {
  if (role === "OWNER") return true;
  if (role !== "STAFF") return false;
  return ["TICKET", "TICKET_ATTACHMENT", "ROOM", "FLOOR", "LEASE", "LEASE_END_REQUEST"]
    .includes(record.entityType);
}

export function activityHref(record) {
  switch (record.entityType) {
    case "ROOM":
      return `/kamar/${record.entityId}`;
    case "FLOOR":
      return "/kamar";
    case "LEASE":
      return `/kontrak/${record.entityId}`;
    case "LEASE_END_REQUEST":
    case "DEPOSIT_LEDGER_ENTRY":
      return record.parentEntityId ? `/kontrak/${record.parentEntityId}` : null;
    case "INVOICE":
      return `/tagihan/${record.entityId}`;
    case "INVOICE_GENERATION":
      return "/tagihan";
    case "PAYMENT":
      return "/pembayaran";
    case "EXPENSE":
      return "/pengeluaran";
    case "OPERATING_BUDGET":
      return "/laporan";
    case "TICKET":
      return `/tiket/${record.entityId}`;
    case "TICKET_ATTACHMENT":
      return record.parentEntityId ? `/tiket/${record.parentEntityId}` : null;
    case "APP_USER":
      return "/pengaturan/akun";
    case "TENANT_PROFILE":
      return `/penghuni/${record.entityId}`;
    default:
      return null;
  }
}

function toActivityItem(record) {
  const statusChange = record.source === "TICKET_STATUS"
    ? { fromStatus: record.fromStatus, toStatus: record.toStatus }
    : null;
  return {
    id: record.id,
    source: record.source,
    action: record.action,
    occurredAt: record.occurredAt,
    actor: {
      id: record.actorId,
      name: record.actorName,
      role: record.actorRole,
      type: record.actorType,
    },
    entity: { type: record.entityType, id: record.entityId },
    statusChange,
    href: activityHref(record),
  };
}

export async function getActivityPage({ actor, input = {}, repository, now = new Date() }) {
  requireInternalActor(actor);
  const parsed = activityInputSchema.safeParse(input);
  if (!parsed.success) throw new DomainError("VALIDATION_ERROR");

  const period = resolveDashboardPeriod(
    parsed.data.month ? { month: parsed.data.month } : {},
    now,
  );
  const limit = parsed.data.limit ?? 20;
  const records = await repository.listActivity({
    actorRole: actor.role,
    startDate: period.startDate,
    endDate: period.endDate,
    limit: limit + 1,
    cursor: parsed.data.cursor ?? null,
  });
  const validated = z.array(activityRecordSchema).safeParse(records);
  if (!validated.success) throw new DomainError("INTERNAL_ERROR");

  const hasMore = validated.data.length > limit;
  const pageRecords = validated.data.slice(0, limit);
  const visible = pageRecords.filter((record) => canViewActivityAction(actor.role, record));
  const last = hasMore ? pageRecords.at(-1) : undefined;

  return {
    period: {
      month: period.month,
      startDate: period.startDate,
      endDate: period.endDate,
    },
    items: visible.map(toActivityItem),
    nextCursor: last ? { occurredAt: last.occurredAt, id: last.id } : null,
  };
}
