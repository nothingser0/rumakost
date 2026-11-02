"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  getFinancialReport,
  setOperatingBudget,
} from "@/lib/reports/operations.mjs";
import type {
  FinancialReport,
  OperatingBudgetResult,
} from "@/lib/reports/operations.mjs";
import { createReportsRepository } from "@/lib/reports/repository";

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
    ? "NOT_OWNER"
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

export async function setOperatingBudgetAction(
  input: unknown,
): Promise<ActionResult<OperatingBudgetResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await setOperatingBudget({
      actor: access.user,
      input,
      repository: createReportsRepository(),
    });
    revalidatePath("/laporan");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getFinancialReportAction(
  input: unknown,
): Promise<ActionResult<FinancialReport>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await getFinancialReport({
      actor: access.user,
      input,
      repository: createReportsRepository(),
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
