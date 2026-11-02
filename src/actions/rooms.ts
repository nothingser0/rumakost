"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import type { RoomRecord } from "@/lib/rooms/repository";
import {
  archiveRoom,
  createRoom,
  getRoom,
  listRooms,
  restoreRoom,
  updateRoom,
} from "@/lib/rooms/operations.mjs";
import { createRoomRepository } from "@/lib/rooms/repository";

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

export async function listRoomsAction(
  options: unknown = {},
): Promise<ActionResult<RoomRecord[]>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await listRooms({
      actor: access.user,
      options,
      repository: createRoomRepository(),
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function getRoomAction(input: unknown): Promise<ActionResult<RoomRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await getRoom({
      actor: access.user,
      input,
      repository: createRoomRepository(),
    });
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function createRoomAction(input: unknown): Promise<ActionResult<RoomRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await createRoom({
      actor: access.user,
      input,
      repository: createRoomRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function updateRoomAction(input: unknown): Promise<ActionResult<RoomRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await updateRoom({
      actor: access.user,
      input,
      repository: createRoomRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function archiveRoomAction(input: unknown): Promise<ActionResult<RoomRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await archiveRoom({
      actor: access.user,
      input,
      repository: createRoomRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function restoreRoomAction(input: unknown): Promise<ActionResult<RoomRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await restoreRoom({
      actor: access.user,
      input,
      repository: createRoomRepository(),
    });
    revalidatePath("/kamar");
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
