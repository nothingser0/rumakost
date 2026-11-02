"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import type { FloorRecord } from "@/lib/floors/repository";
import {
  archiveFloor,
  createFloor,
  listFloors,
  restoreFloor,
  updateFloor,
} from "@/lib/floors/operations.mjs";
import { createFloorRepository } from "@/lib/floors/repository";

type ActionFailure = {
  success: false;
  error: {
    code: string;
    status: number;
    issues?: Array<{ path: Array<string | number>; code: string }>;
  };
};

type ActionSuccess<T> = { success: true; data: T };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

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

export async function listFloorsAction(
  options: unknown = {},
): Promise<ActionResult<FloorRecord[]>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await listFloors({
      actor: access.user,
      options,
      repository: createFloorRepository(),
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function createFloorAction(input: unknown): Promise<ActionResult<FloorRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await createFloor({
      actor: access.user,
      input,
      repository: createFloorRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updateFloorAction(input: unknown): Promise<ActionResult<FloorRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await updateFloor({
      actor: access.user,
      input,
      repository: createFloorRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function archiveFloorAction(input: unknown): Promise<ActionResult<FloorRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await archiveFloor({
      actor: access.user,
      input,
      repository: createFloorRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function restoreFloorAction(input: unknown): Promise<ActionResult<FloorRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await restoreFloor({
      actor: access.user,
      input,
      repository: createFloorRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
