import { createHash } from "node:crypto";
import { DomainError, mapPersistenceError } from "../errors/domain-error.mjs";
import { getJakartaLocalDate } from "../billing/generate-invoices.mjs";
import { createCursorPage } from "../data/pagination.mjs";
import {
  getInvoiceSchema,
  listInvoicesSchema,
  markInvoiceDeliveredSchema,
  voidInvoiceSchema,
} from "../validation/operations.mjs";

const READ_ROLES = ["OWNER", "STAFF", "TENANT"];
const DELIVERY_ROLES = ["OWNER", "STAFF"];

function requireActor(actor, roles) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (!roles.includes(actor.role)) throw new DomainError("FORBIDDEN");
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

function moneyToCents(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new DomainError("INTERNAL_ERROR");
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function centsToMoney(cents) {
  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

function mapReadPersistenceError(error) {
  if (error instanceof DomainError) return error;
  return mapPersistenceError(error);
}

async function persist(operation) {
  try {
    return await operation();
  } catch (error) {
    throw mapReadPersistenceError(error);
  }
}

function presentInvoice(invoice, today) {
  if (!invoice || !Array.isArray(invoice.lines)) {
    throw new DomainError("INTERNAL_ERROR");
  }

  const amountDueCents = moneyToCents(invoice.amountDue);
  const amountPaidCents = moneyToCents(invoice.amountPaid);
  if (amountPaidCents > amountDueCents) throw new DomainError("INTERNAL_ERROR");

  const voided = invoice.status === "VOID";
  const amountOutstandingCents = voided ? 0n : amountDueCents - amountPaidCents;
  let displayStatus;
  if (voided) displayStatus = "VOID";
  else if (amountOutstandingCents === 0n) displayStatus = "PAID";
  else if (invoice.dueOn < today) displayStatus = "OVERDUE";
  else if (amountPaidCents > 0n) displayStatus = "PARTIAL";
  else displayStatus = "UNPAID";

  return {
    id: invoice.id,
    leaseId: invoice.leaseId,
    tenantUserId: invoice.tenantUserId,
    tenantName: invoice.tenantName,
    roomId: invoice.roomId,
    roomCode: invoice.roomCode,
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    dueOn: invoice.dueOn,
    kind: invoice.kind,
    status: invoice.status,
    displayStatus,
    deliveryStatus: invoice.deliveryStatus,
    issuedAt: invoice.issuedAt,
    deliveredAt: invoice.deliveredAt,
    voidedAt: invoice.voidedAt,
    amountDue: centsToMoney(amountDueCents),
    amountPaid: centsToMoney(amountPaidCents),
    amountOutstanding: centsToMoney(amountOutstandingCents),
    lines: invoice.lines,
  };
}

function requestFingerprint(actorId, data) {
  return createHash("sha256")
    .update(JSON.stringify({
      actorId,
      invoiceId: data.invoiceId,
      reason: data.reason,
    }))
    .digest("hex");
}

export async function listInvoices({
  actor,
  input = {},
  repository,
  today = getJakartaLocalDate(),
}) {
  requireActor(actor, READ_ROLES);
  const data = parse(listInvoicesSchema, input);
  const rows = await persist(() => repository.listInvoices({
    actorId: actor.id,
    limit: data.limit + 1,
    cursor: data.cursor ?? null,
  }));

  if (!Array.isArray(rows)) throw new DomainError("INTERNAL_ERROR");
  const items = rows.map((row) => presentInvoice(row, today));
  return createCursorPage(items, data.limit, (invoice) => ({
    dueOn: invoice.dueOn,
    id: invoice.id,
  }));
}

export async function getInvoice({
  actor,
  input,
  repository,
  today = getJakartaLocalDate(),
}) {
  requireActor(actor, READ_ROLES);
  const { invoiceId } = parse(getInvoiceSchema, input);
  const invoice = await persist(() => repository.getInvoice({
    actorId: actor.id,
    invoiceId,
  }));

  if (!invoice) throw new DomainError("INVOICE_NOT_FOUND");
  return presentInvoice(invoice, today);
}

export async function markInvoiceDelivered({ actor, input, repository }) {
  requireActor(actor, DELIVERY_ROLES);
  const data = parse(markInvoiceDeliveredSchema, input);
  return persist(() => repository.markInvoiceDelivered({
    actorId: actor.id,
    invoiceId: data.invoiceId,
    channel: data.channel,
  }));
}

export async function voidInvoice({ actor, input, repository }) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER") throw new DomainError("NOT_OWNER");
  if (
    !input ||
    typeof input !== "object" ||
    !("reason" in input) ||
    typeof input.reason !== "string" ||
    input.reason.trim() === ""
  ) {
    throw new DomainError("REASON_REQUIRED");
  }
  const data = parse(voidInvoiceSchema, input);
  return persist(() => repository.voidInvoice({
    actorId: actor.id,
    ...data,
    requestHash: requestFingerprint(actor.id, data),
  }));
}
