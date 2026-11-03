"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { updateTenantProfile } from "@/lib/tenant-profile/operations.mjs";
import { createTenantProfileRepository } from "@/lib/tenant-profile/repository";

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
  const code = reason === "role-denied" || reason === "ownership-denied"
    ? "FORBIDDEN"
    : reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : "UNAUTHENTICATED";

  return {
    success: false,
    error: toPublicError(new DomainError(code)),
  };
}

export async function updateTenantProfileAction(
  input: unknown,
): Promise<ActionResult<{ tenantUserId: string; changed: boolean }>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await updateTenantProfile({
      actor: access.user,
      input,
      repository: createTenantProfileRepository(),
    });

    revalidatePath(access.user.role === "TENANT"
      ? "/portal/profil"
      : `/penghuni/${data.tenantUserId}`);

    return { success: true, data };
  } catch (error) {
    return { success: false, error: toPublicError(error) };
  }
}
