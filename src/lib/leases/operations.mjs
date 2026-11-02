import { createHash } from "node:crypto";
import { DomainError, mapPersistenceError } from "../errors/domain-error.mjs";
import { calculateInitialInvoice } from "../billing/initial-invoice.mjs";
import { createLeaseSchema } from "../validation/operations.mjs";

const LEASE_CREATION_ROLES = ["OWNER", "STAFF"];

function requireActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }

  if (!LEASE_CREATION_ROLES.includes(actor.role)) {
    throw new DomainError("FORBIDDEN");
  }
}

function parseInput(input) {
  const result = createLeaseSchema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

function jakartaDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function statusForDates({ startsOn, endsOn }, today) {
  if (startsOn > today) return "SCHEDULED";
  if (endsOn !== null && endsOn < today) return "ENDED";
  return "ACTIVE";
}

function requestFingerprint(actorId, data) {
  const canonicalRequest = JSON.stringify({
    actorId,
    tenantUserId: data.tenantUserId,
    roomId: data.roomId,
    startsOn: data.startsOn,
    endsOn: data.endsOn ?? null,
    rentAmount: data.rentAmount,
    depositAgreedAmount: data.depositAgreedAmount,
    billingMode: data.billingMode,
    contractNumber: data.contractNumber ?? null,
  });

  return createHash("sha256").update(canonicalRequest).digest("hex");
}

function mapLeasePersistenceError(error) {
  if (error instanceof DomainError) return error;

  const record = error && typeof error === "object" ? error : {};
  const code = typeof record.code === "string" ? record.code : "";
  const constraint = typeof record.constraint === "string" ? record.constraint : "";
  const message = typeof record.message === "string" ? record.message : "";

  if (message.includes("LEASE_ARCHIVED_ROOM_DENIED")) {
    return new DomainError("ROOM_NOT_FOUND");
  }
  if (message.includes("LEASE_MAINTENANCE_ROOM_DENIED")) {
    return new DomainError("ROOM_IN_USE");
  }
  if (message.includes("ROOM_ARCHIVED_FLOOR_DENIED")) {
    return new DomainError("FLOOR_NOT_FOUND");
  }
  if (code === "23P01") {
    return new DomainError(
      constraint.includes("leases_room_active_period_excl")
        ? "ROOM_CONFLICT"
        : "CONFLICT",
    );
  }
  if (code === "23505") return new DomainError("CONFLICT");
  if (code === "23514") return new DomainError("VALIDATION_ERROR");
  if (code === "23503") {
    if (constraint.includes("tenant_user_id")) {
      return new DomainError("TENANT_INACTIVE");
    }
    if (constraint.includes("room_id")) return new DomainError("ROOM_NOT_FOUND");
  }

  return mapPersistenceError(error);
}

async function persist(operation) {
  try {
    return await operation();
  } catch (error) {
    throw mapLeasePersistenceError(error);
  }
}

export async function createLease({ actor, input, repository, now = () => new Date() }) {
  requireActor(actor);
  const data = parseInput(input);
  const normalizedData = {
    ...data,
    endsOn: data.endsOn ?? null,
    contractNumber: data.contractNumber ?? null,
  };
  const initialInvoice = calculateInitialInvoice({
    startsOn: normalizedData.startsOn,
    rentAmount: normalizedData.rentAmount,
    depositAgreedAmount: normalizedData.depositAgreedAmount,
    billingMode: normalizedData.billingMode,
  });

  return persist(() => repository.createLeaseWithInitialInvoice({
    actorId: actor.id,
    ...normalizedData,
    status: statusForDates(normalizedData, jakartaDate(now())),
    initialInvoice,
    requestHash: requestFingerprint(actor.id, normalizedData),
  }));
}
