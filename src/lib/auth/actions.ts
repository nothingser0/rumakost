"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getAppOriginEnv } from "@/lib/env";
import { getAuthAppUser, type AuthAppUser } from "@/lib/auth/app-user";
import { runTrustedAuthMutation } from "./server-action-security";
import { validateSignInInput } from "./auth-policy.mjs";
import {
  getAuthLoginAccountId,
  recordAuthLoginFailure,
  recordAuthLoginSuccess,
  reserveAuthLoginAttempt,
} from "./login-rate-limit";
import { performPasswordResetRequest } from "./password-reset-request.mjs";
import { performPasswordResetCompletion } from "./password-reset-completion.mjs";
import {
  isCredentialAuthError,
  performRateLimitedLogin,
} from "./rate-limited-login.mjs";

export type SignInState = {
  error: string | null;
};

export type PasswordResetRequestState = {
  status: "idle" | "invalid" | "accepted" | "unavailable";
};

export type PasswordResetCompletionState = {
  status: "idle" | "invalid" | "failed" | "success";
};

async function signOutAfterIncompleteLogin(): Promise<void> {
  try {
    const cookieHeader = (await cookies()).toString();
    if (!cookieHeader) return;

    await auth.api.signOut({
      headers: new Headers({
        cookie: cookieHeader,
        origin: getAppOriginEnv().APP_ORIGIN,
      }),
    });
  } catch {
    return;
  }
}

export async function requestPasswordResetAction(
  _previousState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  return runTrustedAuthMutation<PasswordResetRequestState>(
    { status: "unavailable" },
    async (appOrigin) => {
      const result = await performPasswordResetRequest({
        rawEmail: formData.get("email"),
        appOrigin,
        requestReset: async (input: { email: string; redirectTo: string }) =>
          auth.api.requestPasswordReset({
            body: input,
            headers: await headers(),
          }),
      });

      if (result.status === "invalid") return { status: "invalid" };
      if (result.status === "accepted") return { status: "accepted" };
      return { status: "unavailable" };
    },
  );
}

export async function completePasswordResetAction(
  _previousState: PasswordResetCompletionState,
  formData: FormData,
): Promise<PasswordResetCompletionState> {
  return runTrustedAuthMutation<PasswordResetCompletionState>(
    { status: "failed" },
    async () => {
      const result = await performPasswordResetCompletion({
        rawToken: formData.get("token"),
        rawNewPassword: formData.get("newPassword"),
        rawConfirmPassword: formData.get("confirmPassword"),
        resetPassword: async (input: { token: string; newPassword: string }) =>
          auth.api.resetPassword({
            body: input,
            headers: await headers(),
          }),
      });

      if (result.status === "invalid") return { status: "invalid" };
      if (result.status === "success") return { status: "success" };
      return { status: "failed" };
    },
  );
}

export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  return runTrustedAuthMutation<SignInState>(
    { error: "Email atau kata sandi tidak valid." },
    async (appOrigin) => {
      const credentials = validateSignInInput({
        email: formData.get("email"),
        password: formData.get("password"),
        destinationRole: formData.get("destinationRole"),
      });

      if (!credentials.success) {
        return { error: "Email atau kata sandi tidak valid." };
      }

      let authSubject: string | null = null;
      const providerHeaders = new Headers(await headers());
      providerHeaders.set("origin", appOrigin);
      const loginResult = await performRateLimitedLogin({
        email: credentials.data.email,
        findAccountId: getAuthLoginAccountId,
        reserveAttempt: reserveAuthLoginAttempt,
        authenticate: async () => {
          try {
            const result = await auth.api.signInEmail({
              body: {
                email: credentials.data.email,
                password: credentials.data.password,
                rememberMe: formData.get("rememberMe") === "on",
              },
              headers: providerHeaders,
            });

            authSubject = result.user.id;
            return "success";
          } catch (error) {
            return isCredentialAuthError(error) ? "invalid" : "unavailable";
          }
        },
        recordFailure: recordAuthLoginFailure,
        recordSuccess: recordAuthLoginSuccess,
      });

      if (loginResult.status === "invalid") {
        return { error: "Email atau kata sandi tidak valid." };
      }

      if (loginResult.status === "unavailable") {
        return { error: "Belum bisa masuk. Coba lagi sebentar." };
      }

      if (loginResult.status === "authenticated-but-unavailable") {
        await signOutAfterIncompleteLogin();
        return { error: "Belum bisa masuk. Coba lagi sebentar." };
      }

      let appUser: AuthAppUser | null;

      try {
        appUser = authSubject ? await getAuthAppUser(authSubject) : null;
      } catch {
        await signOutAfterIncompleteLogin();
        return { error: "Belum bisa masuk. Coba lagi sebentar." };
      }

      if (
        !appUser?.isActive ||
        (loginResult.appUserId !== null && appUser.id !== loginResult.appUserId)
      ) {
        await signOutAfterIncompleteLogin();
        return { error: "Email atau kata sandi tidak valid." };
      }

      if (appUser.mustChangePassword) redirect("/aktivasi-sandi");
      redirect(appUser.role === "TENANT" ? "/portal" : "/dashboard");
    },
  );
}

export async function signOutAction(): Promise<void> {
  const signedOut = await runTrustedAuthMutation<boolean>(false, async () => {
    try {
      await auth.api.signOut({ headers: await headers() });
      return true;
    } catch {
      return false;
    }
  });

  if (!signedOut) {
    throw new Error("Belum bisa keluar. Coba lagi sebentar.");
  }

  redirect("/login");
}
