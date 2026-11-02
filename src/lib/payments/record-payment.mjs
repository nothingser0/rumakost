import { createHash } from "node:crypto";
import { DomainError, mapPersistenceError } from "../errors/domain-error.mjs";
import { getJakartaLocalDate } from "../billing/generate-invoices.mjs";
import { recordPaymentSchema } from "../validation/operations.mjs";

const RECORD_ROLES = ["OWNER", "STAFF", "TENANT"];

function requireActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (!RECORD_ROLES.includes(actor.role)) throw new DomainError("FORBIDDEN");
}

function parseInput(input) {
  const result = recordPaymentSchema.safeParse(input);
  if (!result.success) {
    if (result.error.issues.some((issue) => issue.path[0] === "amount")) {
      throw new DomainError("AMOUNT_INVALID");
    }
    throw result.error;
  }
  return result.data;
}

function requestFingerprint(actorId, data) {
  return createHash("sha256")
    .update(JSON.stringify({
      actorId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference ?? null,
    }))
    .digest("hex");
}

function mapPaymentPersistenceError(error) {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? error.code
    : undefined;
  if (code === "23505" || code === "23503") return new DomainError("CONFLICT");
  return mapPersistenceError(error);
}

async function persist(operation) {
  try {
    return await operation();
  } catch (error) {
    throw mapPaymentPersistenceError(error);
  }
}

export async function recordPayment({
  actor,
  input,
  repository,
  today = getJakartaLocalDate(),
}) {
  requireActor(actor);
  const data = parseInput(input);
  return persist(() => repository.recordPayment({
    actorId: actor.id,
    invoiceId: data.invoiceId,
    amount: data.amount,
    method: data.method,
    reference: data.reference ?? null,
    idempotencyKey: data.idempotencyKey,
    localDate: today,
    requestHash: requestFingerprint(actor.id, data),
  }));
}
