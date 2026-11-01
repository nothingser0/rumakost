import { z } from "zod";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
  });

export function validatePasswordChange(value) {
  return passwordChangeSchema.safeParse(value);
}

export function getPostPasswordChangePath(role) {
  return role === "TENANT" ? "/portal" : "/dashboard";
}

export async function performPasswordChange({
  user,
  mode,
  input,
  changePassword,
  clearForcedPasswordChange,
}) {
  if (!user || !user.isActive) return { error: "Sesi akun tidak valid." };
  if (mode !== "activation" && mode !== "profile") {
    return { error: "Permintaan perubahan sandi tidak valid." };
  }

  if (mode === "activation" && !user.mustChangePassword) {
    return { error: "Akun ini tidak memerlukan aktivasi sandi." };
  }

  if (mode === "profile" && user.mustChangePassword) {
    return { error: "Selesaikan aktivasi sandi terlebih dahulu." };
  }

  const parsed = validatePasswordChange(input);
  if (!parsed.success) {
    return { error: "Periksa sandi saat ini dan sandi baru Anda." };
  }

  const result = await changePassword({
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
  });

  if (!result.success) return { error: "Sandi saat ini tidak cocok atau perubahan gagal." };

  if (mode === "activation") {
    let cleared = false;
    try {
      cleared = await clearForcedPasswordChange(user.authSubject);
    } catch {
      return {
        error: "Sandi sudah berubah, tetapi status aktivasi belum tersimpan. Masuk kembali lalu hubungi pemilik jika masalah berlanjut.",
      };
    }
    if (!cleared) {
      return {
        error: "Sandi sudah berubah, tetapi status aktivasi belum tersimpan. Masuk kembali lalu hubungi pemilik jika masalah berlanjut.",
      };
    }
  }

  return {
    success: true,
    redirectTo: mode === "activation" ? getPostPasswordChangePath(user.role) : null,
  };
}
