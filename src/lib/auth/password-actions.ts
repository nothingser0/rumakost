import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { clearForcedPasswordChange } from "@/lib/auth/app-user";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { performPasswordChange } from "./password-policy.mjs";
import { runTrustedAuthMutation } from "./server-action-security";

export type PasswordActionState = { error: string | null; success?: string | null };

export async function submitPasswordChange(
  previousState: PasswordActionState,
  formData: FormData,
  mode: "activation" | "owner-staff" | "tenant",
): Promise<PasswordActionState> {
  void previousState;

  return runTrustedAuthMutation<PasswordActionState>(
    { error: "Permintaan tidak valid. Muat ulang halaman lalu coba lagi." },
    async () => {
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
          changePassword: async ({ currentPassword, newPassword }: {
            currentPassword: string;
            newPassword: string;
          }) => {
            const result = await auth.api.changePassword({
              body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
              },
              headers: await headers(),
            });
            return { success: result.status === true };
          },
          clearForcedPasswordChange,
        });

        return result.success
          ? { error: null, success: "Sandi berhasil diperbarui." }
          : { error: result.error ?? "Perubahan sandi gagal." };
      } catch {
        return { error: "Perubahan sandi gagal. Periksa sandi saat ini lalu coba lagi." };
      }
    },
  );
}
