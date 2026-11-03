import { createHash } from "node:crypto";
import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";
import {
  createCursorPage,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../data/pagination.mjs";
import {
  addTicketCommentSchema,
  assignTicketSchema,
  cancelTicketSchema,
  createTicketDraftSchema,
  discardTicketDraftSchema,
  reopenTicketSchema,
  submitTicketDraftSchema,
  updateTicketSchema,
} from "../validation/operations.mjs";

const roles = ["OWNER", "STAFF", "TENANT"];
const ticketStatuses = [
  "DRAFT",
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
  "CANCELLED",
];

const ticketSummarySchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.string().regex(/^\d+$/),
  ticketLabel: z.string().regex(/^TKT-\d{6}-\d{4,}$/),
  roomId: z.string().uuid(),
  roomCode: z.string(),
  leaseId: z.string().uuid().nullable(),
  createdById: z.string().uuid(),
  createdByName: z.string(),
  assignedToId: z.string().uuid().nullable(),
  assignedToName: z.string().nullable(),
  title: z.string(),
  category: z.enum(["AC", "PLUMBING", "ELECTRICAL", "DOORS_LOCKS", "FURNITURE", "GENERAL"]),
  priority: z.enum(["LOW", "NORMAL", "URGENT"]),
  status: z.enum(ticketStatuses),
  targetCompletionOn: z.string().nullable(),
  closedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
}).strict();

const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  resolutionSummary: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  cancelledAt: z.string().datetime({ offset: true }).nullable(),
  reopenedAt: z.string().datetime({ offset: true }).nullable(),
  statusChangedById: z.string().uuid().nullable(),
  comments: z.array(z.object({
    id: z.string().uuid(),
    authorId: z.string().uuid(),
    authorName: z.string(),
    authorRole: z.enum(roles),
    body: z.string(),
    visibility: z.enum(["TENANT_VISIBLE", "INTERNAL"]),
    createdAt: z.string().datetime({ offset: true }),
  }).strict()),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    commentId: z.string().uuid().nullable(),
    uploadedById: z.string().uuid(),
    mimeType: z.string(),
    sizeBytes: z.string().regex(/^\d+$/),
    durationSeconds: z.number().int().nullable(),
    uploadStatus: z.enum(["PENDING_UPLOAD", "AVAILABLE", "DELETE_PENDING", "DELETED", "FAILED"]),
    createdAt: z.string().datetime({ offset: true }),
  }).strict()),
  statusEvents: z.array(z.object({
    id: z.string().uuid(),
    fromStatus: z.enum(ticketStatuses).nullable(),
    toStatus: z.enum(ticketStatuses),
    actorType: z.enum(["USER", "SYSTEM"]),
    actorId: z.string().uuid().nullable(),
    reason: z.string().nullable(),
    resolutionSummary: z.string().nullable(),
    occurredAt: z.string().datetime({ offset: true }),
  }).strict()),
}).strict();

const mutationResultSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(ticketStatuses),
  updatedAt: z.string().datetime({ offset: true }),
}).strict();

const createResultSchema = ticketSummarySchema;
const commentResultSchema = z.object({
  commentId: z.string().uuid(),
  ticketId: z.string().uuid(),
  visibility: z.enum(["TENANT_VISIBLE", "INTERNAL"]),
  createdAt: z.string().datetime({ offset: true }),
}).strict();

const expiryResultSchema = z.object({
  expiredTickets: z.number().int().nonnegative(),
  queuedAttachments: z.number().int().nonnegative(),
}).strict();
const listTicketsSchema = z.object({
  limit: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  cursor: z.object({
    createdAt: z.string().datetime({ offset: true }),
    id: z.string().uuid(),
  }).strict().optional(),
}).strict();

function requireActor(actor) {
  if (!actor || !actor.id || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (!roles.includes(actor.role)) throw new DomainError("FORBIDDEN");
}

function requireRole(actor, allowedRoles) {
  requireActor(actor);
  if (!allowedRoles.includes(actor.role)) {
    throw new DomainError(allowedRoles.length === 1 && allowedRoles[0] === "OWNER"
      ? "OWNER_REQUIRED"
      : "FORBIDDEN");
  }
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

function fingerprint(operation, actorId, data) {
  const request = { ...data };
  delete request.idempotencyKey;
  return createHash("sha256")
    .update(JSON.stringify({ operation, actorId, request }))
    .digest("hex");
}

function parseResult(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw new DomainError("INTERNAL_ERROR");
  return result.data;
}

function authorizeResult(result) {
  if (!result) throw new DomainError("TICKET_NOT_FOUND");
  return result;
}

export async function createTicketDraft({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(createTicketDraftSchema, input);
  const requestHash = fingerprint("createTicketDraft", actor.id, data);
  const result = await repository.createTicketDraft({
    actorId: actor.id,
    ...data,
    requestHash,
  });
  return parseResult(createResultSchema, result);
}

export async function listTickets({ actor, input = {}, repository }) {
  requireActor(actor);
  const data = parse(listTicketsSchema, input);
  const rows = await repository.listTickets({
    actorId: actor.id,
    role: actor.role,
    limit: data.limit + 1,
    cursor: data.cursor ?? null,
  });
  if (!Array.isArray(rows)) throw new DomainError("INTERNAL_ERROR");
  const parsedRows = rows.map((row) => parseResult(ticketSummarySchema, row));
  const visibleRows = actor.role === "TENANT"
    ? parsedRows.filter((row) => row.status !== "DRAFT" || row.createdById === actor.id)
    : parsedRows;
  return createCursorPage(visibleRows, data.limit, (ticket) => ({
    createdAt: ticket.createdAt,
    id: ticket.id,
  }));
}

export async function getTicket({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(getTicketInputSchema, input);
  const result = await repository.getTicket({
    actorId: actor.id,
    role: actor.role,
    ticketId: data.ticketId,
  });
  const detail = parseResult(ticketDetailSchema, authorizeResult(result));
  if (actor.role !== "TENANT") return detail;
  if (detail.status === "DRAFT" && detail.createdById !== actor.id) {
    throw new DomainError("TICKET_NOT_FOUND");
  }

  const visibleCommentIds = new Set(
    detail.comments
      .filter((comment) => comment.visibility === "TENANT_VISIBLE")
      .map((comment) => comment.id),
  );
  return {
    ...detail,
    comments: detail.comments.filter((comment) => comment.visibility === "TENANT_VISIBLE"),
    attachments: detail.attachments.filter((attachment) =>
      attachment.commentId === null || visibleCommentIds.has(attachment.commentId)
    ),
  };
}

export async function submitTicketDraft({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(submitTicketDraftSchema, input);
  const requestHash = fingerprint("submitTicketDraft", actor.id, data);
  const result = await repository.submitTicketDraft({
    actorId: actor.id,
    actorRole: actor.role,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function discardTicketDraft({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(discardTicketDraftSchema, input);
  const requestHash = fingerprint("discardTicketDraft", actor.id, data);
  const result = await repository.discardTicketDraft({
    actorId: actor.id,
    actorRole: actor.role,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function updateTicket({ actor, input, repository }) {
  requireRole(actor, ["OWNER", "STAFF"]);
  const data = parse(updateTicketSchema, input);
  const requestHash = fingerprint("updateTicket", actor.id, data);
  const result = await repository.updateTicket({
    actorId: actor.id,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function assignTicket({ actor, input, repository }) {
  requireRole(actor, ["OWNER", "STAFF"]);
  const data = parse(assignTicketSchema, input);
  const requestHash = fingerprint("assignTicket", actor.id, data);
  const result = await repository.assignTicket({
    actorId: actor.id,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function cancelTicket({ actor, input, repository }) {
  requireRole(actor, ["OWNER", "STAFF"]);
  const data = parse(cancelTicketSchema, input);
  if (data.reason === "DRAFT_EXPIRED") throw new DomainError("CONFLICT");
  const requestHash = fingerprint("cancelTicket", actor.id, data);
  const result = await repository.cancelTicket({
    actorId: actor.id,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function reopenTicket({ actor, input, repository }) {
  requireRole(actor, ["OWNER"]);
  const data = parse(reopenTicketSchema, input);
  const requestHash = fingerprint("reopenTicket", actor.id, data);
  const result = await repository.reopenTicket({
    actorId: actor.id,
    ...data,
    requestHash,
  });
  return parseResult(mutationResultSchema, result);
}

export async function addTicketComment({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(addTicketCommentSchema, input);
  if (actor.role === "TENANT" && data.visibility !== "TENANT_VISIBLE") {
    throw new DomainError("FORBIDDEN_VISIBILITY");
  }
  const requestHash = fingerprint("addTicketComment", actor.id, data);
  const result = await repository.addTicketComment({
    actorId: actor.id,
    actorRole: actor.role,
    ...data,
    requestHash,
  });
  return parseResult(commentResultSchema, result);
}

export async function expireTicketDrafts({ repository }) {
  return parseResult(expiryResultSchema, await repository.expireTicketDrafts());
}

const getTicketInputSchema = z.object({ ticketId: z.string().uuid() }).strict();

export const ticketSchemas = Object.freeze({
  ticketSummary: ticketSummarySchema,
  ticketDetail: ticketDetailSchema,
  mutationResult: mutationResultSchema,
  commentResult: commentResultSchema,
  expiryResult: expiryResultSchema,
});
