import "server-only";

import { getStorageEnv } from "@/lib/env";
import { createNeonObjectStorageFromEnv } from "./s3-media-storage.mjs";
import type { MediaStorage } from "@/lib/media/operations.mjs";

let cached: MediaStorage | undefined;

export function createNeonObjectStorage(): MediaStorage {
  if (cached) return cached;
  cached = createNeonObjectStorageFromEnv(getStorageEnv());
  return cached;
}
