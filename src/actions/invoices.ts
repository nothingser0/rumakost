"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  getJakartaLocalDate,
  runInvoiceGeneration,
} from "@/lib/billing/generate-invoices";
import { createInvoiceGenerationRepository } from "@/lib/billing/invoice-generation-repository";
import type { InvoiceGenerationResult } from "@/lib/billing/generate-invoices";
import {
  getInvoice,
  listInvoices,
  markInvoiceDelivered,
  voidInvoice,
} from "@/lib/invoices/operations.mjs";
import type {
  InvoiceListResult,
  InvoiceRepository,
  InvoiceView,
} from "@/lib/invoices/operations.mjs";
import { createInvoiceRepository } from "@/lib/invoices/repository";
import { dateOnlySchema } from "@/lib/validation/primitives.mjs";

type ActionFailure = {
  success: false;
  error: {
    code: string;
    status: number;
    issues?: Array<{ path: Array<string | number>; code: string }>;
  };
};

type ActionResult<T> = { success: true; data: T } | ActionFailure;

function authorizationFailure(reason: string): ActionFailure {
  const code = reason === "role-denied"
    ? "FORBIDDEN"
    : reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : "UNAUTHENTICATED";
  return {
    success: false,
    error: toPublicError(new DomainError(code)),
  };
}

function actionFailure(error: unknown): ActionFailure {
  return { success: false, error: toPublicError(error) };
}

export async function runInvoiceGenerationAction(
  requestedLocalDate?: unknown,
): Promise<ActionResult<InvoiceGenerationResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const today = getJakartaLocalDate();
    const localDate = requestedLocalDate === undefined
      ? today
      : dateOnlySchema.parse(requestedLocalDate);
    if (localDate > today) throw new DomainError("INVALID_DATES");

    const data = await runInvoiceGeneration({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      localDate,
      source: "OWNER_RERUN",
      repository: createInvoiceGenerationRepository(),
    });
    revalidatePath("/tagihan");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function listInvoicesAction(
  input: unknown = {},
): Promise<ActionResult<InvoiceListResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    return {
      success: true,
      data: await listInvoices({
        actor: {
          id: access.user.id,
          role: access.user.role,
          isActive: access.user.isActive,
          mustChangePassword: access.user.mustChangePassword,
        },
        input,
        repository: createInvoiceRepository(),
      }),
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getInvoiceAction(
  input: unknown,
): Promise<ActionResult<InvoiceView>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    return {
      success: true,
      data: await getInvoice({
        actor: {
          id: access.user.id,
          role: access.user.role,
          isActive: access.user.isActive,
          mustChangePassword: access.user.mustChangePassword,
        },
        input,
        repository: createInvoiceRepository(),
      }),
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function markInvoiceDeliveredAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<InvoiceRepository["markInvoiceDelivered"]>>>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await markInvoiceDelivered({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createInvoiceRepository(),
    });
    revalidatePath("/tagihan");
    revalidatePath("/portal");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function voidInvoiceAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<InvoiceRepository["voidInvoice"]>>>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) {
    return access.reason === "role-denied"
      ? actionFailure(new DomainError("NOT_OWNER"))
      : authorizationFailure(access.reason);
  }

  try {
    const data = await voidInvoice({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createInvoiceRepository(),
    });
    revalidatePath("/tagihan");
    revalidatePath("/portal");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
