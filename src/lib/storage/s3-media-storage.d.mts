import type { MediaStorage } from "../media/operations.mjs";

export type NeonStorageEnvironment = {
  NEON_STORAGE_ENDPOINT: string;
  NEON_STORAGE_REGION: string;
  NEON_STORAGE_BUCKET: string;
  NEON_STORAGE_ACCESS_KEY: string;
  NEON_STORAGE_SECRET_KEY: string;
};

export function createNeonObjectStorageFromEnv(env: NeonStorageEnvironment): MediaStorage;
