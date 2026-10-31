"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { validateSignInInput } from "./auth-policy.mjs";

export type SignInState = {
  error: string | null;
};

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

  try {
    const { error } = await auth.signIn.email({
      email: credentials.data.email,
      password: credentials.data.password,
      rememberMe: formData.get("rememberMe") === "on",
    });

    if (error) {
      return { error: "Email atau kata sandi tidak valid." };
    }
  } catch {
    return { error: "Belum bisa masuk. Coba lagi sebentar." };
  }

  redirect(
    credentials.data.destinationRole === "TENANT" ? "/portal" : "/dashboard",
  );
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
