"use server";

import { revalidatePath } from "next/cache";
import type { AppRole } from "@/lib/auth/app-user";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { createManagedAccount, setManagedAccountActive } from "@/lib/users/managed-accounts";
import { validateAccountInput, validateAccountStatusInput } from "@/lib/users/policy.mjs";

export type CreateAccountState = {
  error: string | null;
  message: string | null;
  temporaryPassword: string | null;
};

export type AccountStatusState = {
  error: string | null;
  message: string | null;
};

export async function createAccountAction(
  previousState: CreateAccountState,
  formData: FormData,
): Promise<CreateAccountState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return { error: "Sesi atau akses akun tidak valid.", message: null, temporaryPassword: null };

  const validation = validateAccountInput({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    role: formData.get("role"),
  }, access.user.role) as
    | { success: true; data: { displayName: string; email: string; role: AppRole } }
    | { success: false; error: string };

  if (!validation.success) return { error: validation.error, message: null, temporaryPassword: null };

  try {
    const result = await createManagedAccount(access.user, validation.data);
    if (!result.success) {
      return { error: "Akun tidak dapat dibuat. Periksa email dan akses pengelola.", message: null, temporaryPassword: null };
    }

    revalidatePath("/pengaturan/akun");
    return {
      error: null,
      message: "Akun aktif. Berikan sandi awal ini secara langsung; pengguna harus menggantinya saat masuk pertama kali.",
      temporaryPassword: result.temporaryPassword,
    };
  } catch {
    return { error: "Akun tidak dapat dibuat. Coba lagi sebentar.", message: null, temporaryPassword: null };
  }
}

export async function setAccountStatusAction(
  previousState: AccountStatusState,
  formData: FormData,
): Promise<AccountStatusState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed) return { error: "Sesi atau akses akun tidak valid.", message: null };

  const validation = validateAccountStatusInput({
    id: formData.get("id"),
    isActive: formData.get("isActive"),
  }) as
    | { success: true; data: { id: string; isActive: boolean } }
    | { success: false; error: string };

  if (!validation.success) return { error: validation.error, message: null };

  try {
    const result = await setManagedAccountActive(access.user, validation.data.id, validation.data.isActive);
    if (!result.success) return { error: "Status akun tidak dapat diperbarui.", message: null };

    revalidatePath("/pengaturan/akun");
    return { error: null, message: validation.data.isActive ? "Akun diaktifkan kembali." : "Akun dinonaktifkan." };
  } catch {
    return { error: "Status akun tidak dapat diperbarui. Coba lagi sebentar.", message: null };
  }
}
