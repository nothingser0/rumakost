import "server-only";

import type { AuthAppUser } from "./app-user";
import { getAppOriginEnv, getAuthEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { authEmailSender } from "./email-delivery";
import {
  completeLoginEmailChange as completeLoginEmailChangeOperation,
  createEmailChangeRepository,
  isEmailChangeTokenShape,
  requestLoginEmailChange as requestLoginEmailChangeOperation,
  type EmailChangeResult,
} from "./email-change-operations.mjs";

const repository = createEmailChangeRepository(prisma);

export function requestLoginEmailChange(
  actor: AuthAppUser,
  targetUserId: string,
  email: unknown,
): Promise<EmailChangeResult> {
  return requestLoginEmailChangeOperation({
    actor,
    targetUserId,
    email,
    repository,
    sendVerification: authEmailSender.sendVerification,
    appOrigin: getAppOriginEnv().APP_ORIGIN,
    secret: getAuthEnv().BETTER_AUTH_SECRET,
  });
}

export function completeLoginEmailChange(token: unknown): Promise<EmailChangeResult> {
  return completeLoginEmailChangeOperation({
    token,
    repository,
    secret: getAuthEnv().BETTER_AUTH_SECRET,
  });
}

export { isEmailChangeTokenShape };
