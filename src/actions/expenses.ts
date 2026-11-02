"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  recordExpense,
  reverseExpense,
} from "@/lib/expenses/operations.mjs";
import type {
  ExpenseRecord,
  ExpenseReversalRecord,
} from "@/lib/expenses/operations.mjs";
import { createExpenseRepository } from "@/lib/expenses/repository";

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

function ownerAuthorizationFailure(reason: string): ActionFailure {
  return reason === "role-denied"
    ? actionFailure(new DomainError("NOT_OWNER"))
    : authorizationFailure(reason);
}

function revalidateExpenseViews() {
  revalidatePath("/pengeluaran");
  revalidatePath("/laporan");
  revalidatePath("/dashboard");
}

export async function recordExpenseAction(
  input: unknown,
): Promise<ActionResult<ExpenseRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await recordExpense({
      actor: access.user,
      input,
      repository: createExpenseRepository(),
    });
    revalidateExpenseViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function reverseExpenseAction(
  input: unknown,
): Promise<ActionResult<ExpenseReversalRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return ownerAuthorizationFailure(access.reason);

  try {
    const data = await reverseExpense({
      actor: access.user,
      input,
      repository: createExpenseRepository(),
    });
    revalidateExpenseViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
