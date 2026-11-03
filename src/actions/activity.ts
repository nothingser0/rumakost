"use server";

import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { getActivityPage } from "@/lib/activity/operations.mjs";
import type { ActivityPage } from "@/lib/activity/operations.mjs";
import { createActivityRepository } from "@/lib/activity/repository";

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

export async function getActivityAction(
  input: unknown = {},
): Promise<ActionResult<ActivityPage>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await getActivityPage({
      actor: access.user,
      input,
      repository: createActivityRepository(),
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
