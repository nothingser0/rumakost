"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { createLease } from "@/lib/leases/operations.mjs";
import { createLeaseRepository } from "@/lib/leases/repository";
import type { LeaseCreationResult } from "@/lib/leases/repository";

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

export async function createLeaseAction(
  input: unknown,
): Promise<ActionResult<LeaseCreationResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await createLease({
      actor: access.user,
      input,
      repository: createLeaseRepository(),
    });
    revalidatePath("/kontrak");
    revalidatePath("/penghuni");
    revalidatePath("/tagihan");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
