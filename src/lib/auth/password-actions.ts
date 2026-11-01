import "server-only";

import { auth } from "@/lib/auth/server";
import { clearForcedPasswordChange } from "@/lib/auth/app-user";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { performPasswordChange } from "./password-policy.mjs";

export type PasswordActionState = { error: string | null; success?: string | null };

export async function submitPasswordChange(
  previousState: PasswordActionState,
  formData: FormData,
  mode: "activation" | "owner-staff" | "tenant",
): Promise<PasswordActionState> {
  void previousState;

  const access = await authorizeCurrentAction({
    roles: mode === "tenant" ? ["TENANT"] : mode === "owner-staff" ? ["OWNER", "STAFF"] : ["OWNER", "STAFF", "TENANT"],
    allowForcedPasswordChange: mode === "activation",
  });
  if (!access.allowed) {
    return { error: "Sesi atau akses akun tidak valid. Masuk kembali dan coba lagi." };
  }
  const user = access.user;

  try {
    const result = await performPasswordChange({
      user,
      mode: mode === "activation" ? "activation" : "profile",
      input: {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
      },
      changePassword: async ({ currentPassword, newPassword }) => {
        const { error } = await auth.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        return { success: !error };
      },
      clearForcedPasswordChange,
    });

    return result.success
      ? { error: null, success: "Sandi berhasil diperbarui." }
      : { error: result.error ?? "Perubahan sandi gagal." };
  } catch {
    return { error: "Perubahan sandi gagal. Periksa sandi saat ini lalu coba lagi." };
  }
}
