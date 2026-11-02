import { createHash } from "node:crypto";
import { DomainError } from "../errors/domain-error.mjs";
import { getJakartaLocalDate } from "../billing/generate-invoices.mjs";
import {
  reconcileCheckoutDepositSchema,
  resolveCheckoutRefundSchema,
  settleInvoiceFromDepositSchema,
} from "../validation/operations.mjs";

function requireOwner(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER") throw new DomainError("NOT_OWNER");
}

function parseInput(schema, input, reasonField) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  if (reasonField && result.error.issues.some((issue) => issue.path[0] === reasonField)) {
    throw new DomainError("REASON_REQUIRED");
  }
  throw result.error;
}

function fingerprint(operation, actorId, data) {
  const request = { ...data };
  delete request.idempotencyKey;
  return createHash("sha256")
    .update(JSON.stringify({ operation, actorId, request }))
    .digest("hex");
}

export async function settleInvoiceFromDeposit({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(settleInvoiceFromDepositSchema, input);
  return repository.settleInvoiceFromDeposit({
    actorId: actor.id,
    invoiceLineId: data.invoiceLineId,
    amount: data.amount,
    reason: data.reason ?? null,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("settleInvoiceFromDeposit", actor.id, data),
  });
}

export async function reconcileCheckoutDeposit({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(reconcileCheckoutDepositSchema, input, "reason");
  return repository.reconcileCheckoutDeposit({
    actorId: actor.id,
    leaseId: data.leaseId,
    mode: data.mode,
    amount: data.amount,
    reason: data.reason,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("reconcileCheckoutDeposit", actor.id, data),
  });
}

export async function resolveCheckoutRefund({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(resolveCheckoutRefundSchema, input);
  return repository.resolveCheckoutRefund({
    actorId: actor.id,
    entryId: data.entryId,
    status: data.status,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("resolveCheckoutRefund", actor.id, data),
  });
}
