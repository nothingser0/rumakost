import { auth } from "@/lib/auth/server";
import { getAppOriginEnv } from "@/lib/env";
import { handleAuthMutation } from "@/lib/auth/auth-route.mjs";
import { toNextJsHandler } from "better-auth/next-js";

const authHandlers = toNextJsHandler(auth);

export const GET = authHandlers.GET;

export async function POST(request: Request) {
  return handleAuthMutation(
    request,
    getAppOriginEnv().APP_ORIGIN,
    authHandlers.POST,
  );
}
