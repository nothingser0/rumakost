import "server-only";

import { getAuthEnv, getAppOriginEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { authEmailSender } from "./email-delivery";
import { createBetterAuth } from "./provider.mjs";

const authEnv = getAuthEnv();
const appOrigin = getAppOriginEnv().APP_ORIGIN;

export const auth = createBetterAuth({
  prisma,
  baseURL: authEnv.BETTER_AUTH_URL,
  secret: authEnv.BETTER_AUTH_SECRET,
  appOrigin,
  emailSender: authEmailSender,
  isActiveAppUser: async (authSubject: string) => {
    const [appUser, authUser] = await Promise.all([
      prisma.appUser.findFirst({
        where: { authSubject, isActive: true },
        select: { id: true },
      }),
      prisma.user.findFirst({
        where: { id: authSubject, emailVerified: true },
        select: { id: true },
      }),
    ]);

    return appUser !== null && authUser !== null;
  },
  onPasswordReset: async (authSubject: string) => {
    await prisma.$transaction(async (transaction) => {
      await transaction.user.updateMany({
        where: { id: authSubject, emailVerified: false },
        data: { emailVerified: true },
      });
      await transaction.appUser.updateMany({
        where: { authSubject, mustChangePassword: true },
        data: { mustChangePassword: false },
      });
    });
  },
});
