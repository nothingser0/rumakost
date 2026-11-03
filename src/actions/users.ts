"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AppRole } from "@/lib/auth/app-user";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  completeLoginEmailChange,
  requestLoginEmailChange,
} from "@/lib/auth/email-change";
import {
  createManagedAccount,
  setManagedAccountActive,
  transferStaffTickets,
} from "@/lib/users/managed-accounts";
import { validateAccountInput, validateAccountStatusInput } from "@/lib/users/policy.mjs";

export type CreateAccountState = {
  error: string | null;
  message: string | null;
};

export type AccountStatusState = {
  error: string | null;
  message: string | null;
};

export type TicketTransferState = {
  error: string | null;
  message: string | null;
};

export type EmailChangeState = {
  error: string | null;
  message: string | null;
};

export async function createAccountAction(
  previousState: CreateAccountState,
  formData: FormData,
): Promise<CreateAccountState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed || !access.user) return { error: "Sesi atau akses akun tidak valid.", message: null };

  const validation = validateAccountInput({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    role: formData.get("role"),
  }, access.user.role) as
    | { success: true; data: { displayName: string; email: string; role: AppRole } }
    | { success: false; error: string };

  if (!validation.success) return { error: validation.error, message: null };

  try {
    const result = await createManagedAccount(access.user, validation.data);
    if (result.status === "sent") {
      revalidatePath("/pengaturan/akun");
      return { error: null, message: "Tautan aktivasi dikirim ke alamat email yang didaftarkan." };
    }
    if (result.status === "delivery-failed") {
      revalidatePath("/pengaturan/akun");
      return {
        error: "Akun tersimpan, tetapi tautan aktivasi belum terkirim. Kirim ulang data yang sama setelah layanan email tersedia.",
        message: null,
      };
    }
    return { error: "Akun tidak dapat dibuat. Periksa email dan akses pengelola.", message: null };
  } catch {
    return { error: "Akun tidak dapat dibuat. Coba lagi sebentar.", message: null };
  }
}

export async function setAccountStatusAction(
  previousState: AccountStatusState,
  formData: FormData,
): Promise<AccountStatusState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF"] });
  if (!access.allowed || !access.user) return { error: "Sesi atau akses akun tidak valid.", message: null };

  const validation = validateAccountStatusInput({
    id: formData.get("id"),
    isActive: formData.get("isActive"),
  }) as
    | { success: true; data: { id: string; isActive: boolean } }
    | { success: false; error: string };

  if (!validation.success) return { error: validation.error, message: null };

  try {
    const result = await setManagedAccountActive(access.user, validation.data.id, validation.data.isActive);
    if (result.status === "active-tickets") {
      return {
        error: `Alihkan ${result.count} tiket aktif yang ditugaskan sebelum menonaktifkan Staff.`,
        message: null,
      };
    }
    if (result.status !== "updated" && result.status !== "unchanged") {
      return { error: "Status akun tidak dapat diperbarui.", message: null };
    }

    revalidatePath("/pengaturan/akun");
    return {
      error: null,
      message: result.status === "unchanged"
        ? "Status akun sudah sesuai."
        : validation.data.isActive ? "Akun diaktifkan kembali." : "Akun dinonaktifkan.",
    };
  } catch {
    return { error: "Status akun tidak dapat diperbarui. Coba lagi sebentar.", message: null };
  }
}

export async function transferStaffTicketsAction(
  previousState: TicketTransferState,
  formData: FormData,
): Promise<TicketTransferState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed || !access.user) return { error: "Sesi atau akses akun tidak valid.", message: null };

  const sourceStaffId = formData.get("sourceStaffId");
  const targetAssigneeId = formData.get("targetAssigneeId");
  if (typeof sourceStaffId !== "string" || typeof targetAssigneeId !== "string") {
    return { error: "Tujuan pengalihan tidak valid.", message: null };
  }

  try {
    const result = await transferStaffTickets(access.user, sourceStaffId, targetAssigneeId);
    if (result.status !== "transferred") {
      return { error: "Tiket tidak dapat dialihkan. Periksa akun penerima.", message: null };
    }

    revalidatePath("/pengaturan/akun");
    return {
      error: null,
      message: result.count === 0
        ? "Tidak ada tiket aktif yang perlu dialihkan."
        : `${result.count} tiket aktif dialihkan dan riwayatnya dicatat.`,
    };
  } catch {
    return { error: "Tiket tidak dapat dialihkan. Coba lagi sebentar.", message: null };
  }
}

export async function requestLoginEmailChangeAction(
  previousState: EmailChangeState,
  formData: FormData,
): Promise<EmailChangeState> {
  void previousState;

  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed || !access.user) {
    return { error: "Sesi atau akses akun tidak valid.", message: null };
  }

  const targetUserId = formData.get("id");
  const email = formData.get("email");
  if (typeof targetUserId !== "string" || typeof email !== "string") {
    return { error: "Data perubahan email tidak valid.", message: null };
  }

  try {
    const result = await requestLoginEmailChange(access.user, targetUserId, email);
    if (result.status === "sent") {
      revalidatePath("/pengaturan/akun");
      return { error: null, message: "Tautan verifikasi dikirim ke alamat email baru." };
    }
    if (result.status === "delivery-failed") {
      revalidatePath("/pengaturan/akun");
      return {
        error: "Permintaan tersimpan, tetapi email belum terkirim. Kirim ulang alamat yang sama setelah layanan tersedia.",
        message: null,
      };
    }
    if (result.status === "unchanged") {
      return { error: null, message: "Email login akun sudah menggunakan alamat tersebut." };
    }
    if (result.status === "conflict") {
      return { error: "Alamat email sudah digunakan akun lain.", message: null };
    }
    if (result.status === "not-found") {
      return { error: "Akun tidak ditemukan.", message: null };
    }
    return { error: "Perubahan email tidak dapat dimulai.", message: null };
  } catch {
    return { error: "Perubahan email tidak dapat dimulai. Coba lagi sebentar.", message: null };
  }
}

export async function verifyLoginEmailChangeAction(formData: FormData): Promise<void> {
  const token = formData.get("token");
  let result: Awaited<ReturnType<typeof completeLoginEmailChange>>;
  try {
    result = await completeLoginEmailChange(token);
  } catch {
    redirect("/verifikasi-email?status=unavailable");
  }

  if (result.status === "completed" || result.status === "already-completed") {
    revalidatePath("/pengaturan/akun");
    redirect("/verifikasi-email?status=verified");
  }
  if (result.status === "expired") {
    redirect("/verifikasi-email?status=expired");
  }
  if (result.status === "conflict") {
    redirect("/verifikasi-email?status=conflict");
  }
  redirect("/verifikasi-email?status=invalid");
}
