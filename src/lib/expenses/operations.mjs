import { createHash } from "node:crypto";
import { DomainError } from "../errors/domain-error.mjs";
import {
  recordExpenseSchema,
  reverseExpenseSchema,
} from "../validation/operations.mjs";

function requireExpenseActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (!["OWNER", "STAFF"].includes(actor.role)) {
    throw new DomainError("FORBIDDEN");
  }
}

function requireOwner(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER") throw new DomainError("NOT_OWNER");
}

function parseInput(schema, input, fieldCodes) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    const code = fieldCodes[issue.path[0]];
    if (code) throw new DomainError(code);
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

export async function recordExpense({ actor, input, repository }) {
  requireExpenseActor(actor);
  const data = parseInput(recordExpenseSchema, input, {
    category: "TEXT_REQUIRED",
    amount: "AMOUNT_INVALID",
    date: "INVALID_DATES",
    description: "TEXT_REQUIRED",
  });

  return repository.recordExpense({
    actorId: actor.id,
    category: data.category,
    amount: data.amount,
    occurredOn: data.date,
    description: data.description,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("recordExpense", actor.id, data),
  });
}

export async function reverseExpense({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(reverseExpenseSchema, input, {
    reason: "REASON_REQUIRED",
  });

  return repository.reverseExpense({
    actorId: actor.id,
    expenseId: data.expenseId,
    reason: data.reason,
    idempotencyKey: data.idempotencyKey,
    requestHash: fingerprint("reverseExpense", actor.id, data),
  });
}
