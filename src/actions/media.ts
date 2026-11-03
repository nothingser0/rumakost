"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { finalizeUpload } from "@/lib/media/operations.mjs";
import { createMediaRepository } from "@/lib/media/repository";
import { createNeonObjectStorage } from "@/lib/storage/neon-object-storage";

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
  const code = reason === "session-unavailable"
    ? "PROVIDER_UNAVAILABLE"
    : reason === "role-denied" || reason === "password-change-required"
      ? "FORBIDDEN"
      : "UNAUTHENTICATED";
  return { success: false, error: toPublicError(new DomainError(code)) };
}

export async function finalizeUploadAction(input: unknown): Promise<ActionResult<{
  attachmentId: string;
  uploadStatus: "AVAILABLE";
}>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);
  if (!access.user) return authorizationFailure("unauthenticated");

  try {
    const data = await finalizeUpload({
      actor: { id: access.user.id, role: access.user.role },
      input,
      repository: createMediaRepository(),
      storage: createNeonObjectStorage(),
    });
    revalidatePath("/tiket/[id]", "page");
    revalidatePath("/portal/tiket/[id]", "page");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: toPublicError(error) };
  }
}
