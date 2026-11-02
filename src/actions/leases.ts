"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  createLease,
  endLease,
  requestLeaseEnd,
  reviewLeaseEndRequest,
} from "@/lib/leases/operations.mjs";
import { createLeaseRepository } from "@/lib/leases/repository";
import type { LeaseCreationResult } from "@/lib/leases/repository";
import { createLeaseLifecycleRepository } from "@/lib/leases/lifecycle-repository";
import type {
  LeaseEndRequestResult,
  LeaseEndResult,
  LeaseEndReviewResult,
} from "@/lib/leases/lifecycle-repository";

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

export async function requestLeaseEndAction(
  input: unknown,
): Promise<ActionResult<LeaseEndRequestResult>> {
  const access = await authorizeCurrentAction({ roles: ["TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await requestLeaseEnd({
      actor: access.user,
      input,
      repository: createLeaseLifecycleRepository(),
    });
    revalidatePath("/portal");
    revalidatePath("/kontrak");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function endLeaseAction(
  input: unknown,
): Promise<ActionResult<LeaseEndResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await endLease({
      actor: access.user,
      input,
      repository: createLeaseLifecycleRepository(),
    });
    revalidatePath("/kontrak");
    revalidatePath("/kamar");
    revalidatePath("/penghuni");
    revalidatePath("/portal");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function reviewLeaseEndRequestAction(
  input: unknown,
): Promise<ActionResult<LeaseEndReviewResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await reviewLeaseEndRequest({
      actor: access.user,
      input,
      repository: createLeaseLifecycleRepository(),
    });
    revalidatePath("/kontrak");
    revalidatePath("/kamar");
    revalidatePath("/penghuni");
    revalidatePath("/portal");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
