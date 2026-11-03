import "server-only";

import { z } from "zod";

const parseUrl = (value: string): URL | undefined => {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

const postgresUrl = z
  .string()
  .trim()
  .min(1)
  .url()
  .refine((value) => {
    const url = parseUrl(value);
    return url?.protocol === "postgres:" || url?.protocol === "postgresql:";
  });

const httpsUrl = z
  .string()
  .trim()
  .min(1)
  .url()
  .refine((value) => parseUrl(value)?.protocol === "https:");

const appOrigin = z
  .string()
  .trim()
  .min(1)
  .url()
  .refine((value) => {
    const url = parseUrl(value);
    if (!url) return false;

    const isLocalDevelopmentOrigin =
      process.env.NODE_ENV !== "production" &&
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]") &&
      url.protocol === "http:";

    return (
      (url.protocol === "https:" || isLocalDevelopmentOrigin) &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === ""
    );
  });

const serverEnvSchema = z.object({
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  NEON_AUTH_BASE_URL: httpsUrl,
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  NEON_STORAGE_ENDPOINT: httpsUrl,
  NEON_STORAGE_BUCKET: z.string().trim().min(3).max(63).regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/),
  NEON_STORAGE_ACCESS_KEY: z.string().trim().min(1),
  NEON_STORAGE_SECRET_KEY: z.string().trim().min(1),
  APP_ORIGIN: appOrigin,
  CRON_SECRET: z.string().min(16),
});

const authEnvSchema = serverEnvSchema.pick({
  NEON_AUTH_BASE_URL: true,
  NEON_AUTH_COOKIE_SECRET: true,
});

const databaseEnvSchema = serverEnvSchema.pick({ DATABASE_URL: true });
const appOriginEnvSchema = serverEnvSchema.pick({ APP_ORIGIN: true });
const storageEnvSchema = serverEnvSchema.pick({
  NEON_STORAGE_ENDPOINT: true,
  NEON_STORAGE_BUCKET: true,
  NEON_STORAGE_ACCESS_KEY: true,
  NEON_STORAGE_SECRET_KEY: true,
});

function parseEnvironment<T extends z.ZodType>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (result.success) {
    return result.data;
  }

  const invalidVariables = [
    ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
  ].sort();

  throw new Error(
    `Invalid server environment variables: ${invalidVariables.join(", ")}`,
  );
}

export function getAuthEnv() {
  return parseEnvironment(authEnvSchema);
}

export function getDatabaseEnv() {
  return parseEnvironment(databaseEnvSchema);
}

export function getStorageEnv() {
  return parseEnvironment(storageEnvSchema);
}

export function getAppOriginEnv() {
  return parseEnvironment(appOriginEnvSchema);
}

export function getServerEnv() {
  return parseEnvironment(serverEnvSchema);
}

export type AuthEnv = z.infer<typeof authEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
