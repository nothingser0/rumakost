"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import type { TicketActor, TicketRepository } from "@/lib/tickets/operations.mjs";
import {
  addTicketComment,
  assignTicket,
  cancelTicket,
  createTicketDraft,
  discardTicketDraft,
  getTicket,
  listTickets,
  reopenTicket,
  submitTicketDraft,
  updateTicket,
} from "@/lib/tickets/operations.mjs";
import { createTicketRepository } from "@/lib/tickets/repository";

type ActionFailure = {
  success: false;
  error: {
    code: string;
    status: number;
    issues?: Array<{ path: Array<string | number>; code: string }>;
  };
};

type ActionResult<T> = { success: true; data: T } | ActionFailure;
type TicketOperation<T> = (args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}) => Promise<T>;

function authorizationFailure(reason: string, ownerOnly = false): ActionFailure {
  const code = reason === "role-denied"
    ? ownerOnly ? "NOT_OWNER" : "FORBIDDEN"
    : reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : "UNAUTHENTICATED";
  return { success: false, error: toPublicError(new DomainError(code)) };
}

function actionFailure(error: unknown): ActionFailure {
  return { success: false, error: toPublicError(error) };
}

async function runTicketAction<T>(
  input: unknown,
  roles: TicketActor["role"][],
  operation: TicketOperation<T>,
  revalidate = false,
): Promise<ActionResult<T>> {
  const access = await authorizeCurrentAction({ roles });
  if (!access.allowed) return authorizationFailure(access.reason, roles.length === 1 && roles[0] === "OWNER");

  try {
    const data = await operation({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createTicketRepository(),
    });
    if (revalidate) {
      revalidatePath("/tiket");
      revalidatePath("/tiket/[id]", "page");
      revalidatePath("/portal/tiket");
      revalidatePath("/portal/tiket/[id]", "page");
      revalidatePath("/portal");
      revalidatePath("/dashboard");
    }
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

const allRoles: TicketActor["role"][] = ["OWNER", "STAFF", "TENANT"];
const operationalRoles: TicketActor["role"][] = ["OWNER", "STAFF"];

export async function createTicketDraftAction(input: unknown) {
  return runTicketAction(input, allRoles, createTicketDraft, true);
}

export async function listTicketsAction(input: unknown = {}) {
  return runTicketAction(input, allRoles, listTickets);
}

export async function getTicketAction(input: unknown) {
  return runTicketAction(input, allRoles, getTicket);
}

export async function submitTicketDraftAction(input: unknown) {
  return runTicketAction(input, allRoles, submitTicketDraft, true);
}

export async function discardTicketDraftAction(input: unknown) {
  return runTicketAction(input, allRoles, discardTicketDraft, true);
}

export async function updateTicketAction(input: unknown) {
  return runTicketAction(input, operationalRoles, updateTicket, true);
}

export async function assignTicketAction(input: unknown) {
  return runTicketAction(input, operationalRoles, assignTicket, true);
}

export async function cancelTicketAction(input: unknown) {
  return runTicketAction(input, operationalRoles, cancelTicket, true);
}

export async function reopenTicketAction(input: unknown) {
  return runTicketAction(input, ["OWNER"], reopenTicket, true);
}

export async function addTicketCommentAction(input: unknown) {
  return runTicketAction(input, allRoles, addTicketComment, true);
}
