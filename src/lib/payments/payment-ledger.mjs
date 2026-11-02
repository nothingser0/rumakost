import { createHash } from "node:crypto";
import { DomainError } from "../errors/domain-error.mjs";
import {
  rejectPaymentSchema,
  reversePaymentSchema,
  verifyPaymentSchema,
} from "../validation/operations.mjs";

function requireOwner(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER") throw new DomainError("NOT_OWNER");
}

function parseInput(schema, input, reasonField) {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;

  if (reasonField && parsed.error.issues.some((issue) => issue.path[0] === reasonField)) {
    throw new DomainError("REASON_REQUIRED");
  }
  throw parsed.error;
}

function fingerprint(operation, actorId, data) {
  const request = { ...data };
  delete request.idempotencyKey;
  return createHash("sha256")
    .update(JSON.stringify({ operation, actorId, request }))
    .digest("hex");
}

export async function verifyPayment({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(verifyPaymentSchema, input);
  return repository.verifyPayment({
    actorId: actor.id,
    paymentId: data.paymentId,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("verifyPayment", actor.id, data),
  });
}

export async function rejectPayment({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(rejectPaymentSchema, input, "rejectionReason");
  return repository.rejectPayment({
    actorId: actor.id,
    paymentId: data.paymentId,
    reason: data.rejectionReason,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("rejectPayment", actor.id, data),
  });
}

export async function reversePayment({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(reversePaymentSchema, input, "reason");
  return repository.reversePayment({
    actorId: actor.id,
    paymentId: data.paymentId,
    reason: data.reason,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("reversePayment", actor.id, data),
  });
}
