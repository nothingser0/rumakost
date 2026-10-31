import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getAuthEnv } from "@/lib/env";

const env = getAuthEnv();

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: env.NEON_AUTH_COOKIE_SECRET,
    sameSite: "lax",
  },
});
