import { authorizeCurrentAction } from "@/lib/authorization/server";
import { createMediaRouteHandlers } from "@/lib/media/http.mjs";
import { createMediaRepository } from "@/lib/media/repository";
import { getAppOriginEnv } from "@/lib/env";
import { createNeonObjectStorage } from "@/lib/storage/neon-object-storage";
import { DomainError } from "@/lib/errors/domain-error.mjs";

const handlers = createMediaRouteHandlers({
  authenticate: async () => {
    const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
    if (access.allowed) {
      if (!access.user) throw new DomainError("UNAUTHENTICATED");
      return { id: access.user.id, role: access.user.role };
    }
    const code = access.reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : access.reason === "role-denied" || access.reason === "password-change-required"
        ? "FORBIDDEN"
        : "UNAUTHENTICATED";
    throw new DomainError(code);
  },
  createRepository: createMediaRepository,
  createStorage: createNeonObjectStorage,
  appOrigin: () => getAppOriginEnv().APP_ORIGIN,
});

export async function POST(request: Request) {
  return handlers.uploadIntent(request);
}
