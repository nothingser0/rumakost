import "server-only";

import { cleanupTicketMedia } from "@/lib/media/operations.mjs";
import { createMediaRepository } from "@/lib/media/repository";
import { createNeonObjectStorage } from "./neon-object-storage";

export async function runTicketMediaCleanupJob() {
  return cleanupTicketMedia({
    repository: createMediaRepository(),
    storage: createNeonObjectStorage(),
  });
}
