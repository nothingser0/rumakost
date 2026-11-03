import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

export function createBetterAuthOptions({
  prisma,
  baseURL,
  secret,
  appOrigin,
  emailSender,
  isActiveAppUser,
  onPasswordReset,
  disableSignUp = true,
}) {
  const secureCookies = new URL(baseURL).protocol === "https:";

  return {
    appName: "RumaKost",
    baseURL,
    secret,
    trustedOrigins: [appOrigin],
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      disableSignUp,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url }) =>
        emailSender.sendPasswordReset({ email: user.email, name: user.name, url }),
      onPasswordReset: onPasswordReset
        ? async ({ user }) => onPasswordReset(user.id)
        : undefined,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) =>
        emailSender.sendVerification({ email: user.email, name: user.name, url }),
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            if (!(await isActiveAppUser(session.userId))) return false;
            return { data: session };
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    advanced: {
      database: { generateId: "uuid" },
      useSecureCookies: secureCookies,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
        path: "/",
      },
    },
    plugins: [nextCookies()],
  };
}

export function createBetterAuth(options) {
  return betterAuth(createBetterAuthOptions(options));
}
