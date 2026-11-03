import "server-only";

import { headers } from "next/headers";
import { getAppOriginEnv } from "@/lib/env";
import { runSameOriginAuthMutation } from "./request-origin.mjs";

export async function runTrustedAuthMutation<Result>(
  rejectedValue: Result,
  operation: (appOrigin: string) => Promise<Result>,
): Promise<Result> {
  let originHeader: string | null;
  let appOrigin: string;

  try {
    originHeader = (await headers()).get("origin");
    appOrigin = getAppOriginEnv().APP_ORIGIN;
  } catch {
    return rejectedValue;
  }

  return runSameOriginAuthMutation({
    originHeader,
    appOrigin,
    rejectedValue,
    operation: () => operation(appOrigin),
  });
}
