"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getAuthAppUser, type AuthAppUser } from "@/lib/auth/app-user";
import { getAppOriginEnv } from "@/lib/env";
import { validateSignInInput } from "./auth-policy.mjs";
import { performPasswordResetRequest } from "./password-reset-request.mjs";

export type SignInState = {
  error: string | null;
};

export type PasswordResetRequestState = {
  status: "idle" | "invalid" | "accepted" | "unavailable";
};

export async function requestPasswordResetAction(
  _previousState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  let appOrigin: string;

  try {
    appOrigin = getAppOriginEnv().APP_ORIGIN;
  } catch {
    return { status: "unavailable" };
  }

  const result = await performPasswordResetRequest({
    rawEmail: formData.get("email"),
    appOrigin,
    requestReset: ({ email, redirectTo }) =>
      auth.requestPasswordReset({ email, redirectTo }),
  });

  return result;
}

export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const credentials = validateSignInInput({
    email: formData.get("email"),
    password: formData.get("password"),
    destinationRole: formData.get("destinationRole"),
  });

  if (!credentials.success) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  let signInFailed = false;

  try {
    const { error } = await auth.signIn.email({
      email: credentials.data.email,
      password: credentials.data.password,
      rememberMe: formData.get("rememberMe") === "on",
    });

    signInFailed = Boolean(error);
  } catch {
    signInFailed = true;
  }

  if (signInFailed) return { error: "Email atau kata sandi tidak valid." };

  let appUser: AuthAppUser | null;

  try {
    const session = await auth.getSession();
    const subject = session.data?.user?.id;
    appUser = subject ? await getAuthAppUser(subject) : null;
  } catch {
    return { error: "Belum bisa masuk. Coba lagi sebentar." };
  }

  if (!appUser?.isActive) {
    try {
      await auth.signOut();
    } catch {
      return { error: "Akun belum aktif. Coba keluar lalu hubungi pemilik kost." };
    }
    return { error: "Akun belum aktif atau belum terdaftar. Hubungi pemilik kost." };
  }

  if (appUser.mustChangePassword) redirect("/aktivasi-sandi");
  redirect(appUser.role === "TENANT" ? "/portal" : "/dashboard");
}

export async function signOutAction(): Promise<void> {
  let failed = false;

  try {
    const { error } = await auth.signOut();
    failed = Boolean(error);
  } catch {
    failed = true;
  }

  if (failed) {
    throw new Error("Belum bisa keluar. Coba lagi sebentar.");
  }

  redirect("/login");
}
