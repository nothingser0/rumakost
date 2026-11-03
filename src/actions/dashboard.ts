"use server";

import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { getDashboardSnapshot } from "@/lib/dashboard/operations.mjs";
import type { DashboardSnapshot } from "@/lib/dashboard/operations.mjs";
import { createDashboardRepository } from "@/lib/dashboard/repository";
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
    ? "FORBIDDEN"
    : reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : "UNAUTHENTICATED";
  return { success: false, error: toPublicError(new DomainError(code)) };
}

function actionFailure(error: unknown): ActionFailure {
  return { success: false, error: toPublicError(error) };
}

export async function getDashboardAction(
  input: unknown = {},
): Promise<ActionResult<DashboardSnapshot>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await getDashboardSnapshot({
      actor: access.user,
      input,
      repository: createDashboardRepository(),
      reportsRepository: access.user.role === "OWNER" ? createReportsRepository() : undefined,
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
