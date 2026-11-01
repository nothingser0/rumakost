import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordForm } from "@/components/auth/password-form";
import { requireRouteAccess } from "@/lib/authorization/server";
import { updateOwnerStaffPasswordAction } from "./actions";
import styles from "../aktivasi-sandi/page.module.css";

export const metadata: Metadata = { title: "Profil akun | RumaKost" };

export default function OwnerStaffProfilePage() {
  return (
    <Suspense fallback={<main aria-busy="true" className={styles.fallback}>Memeriksa sesi…</main>}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await requireRouteAccess("/profil");

  return (
    <main className={styles.page}>
      <section aria-labelledby="profile-title" className={styles.card}>
        <p className={styles.eyebrow}>PENGATURAN AKUN</p>
        <h1 id="profile-title">Ubah sandi</h1>
        <p className={styles.intro}>Ganti sandi akun Anda. Perubahan ini hanya berlaku untuk akun yang sedang masuk.</p>
        <PasswordForm action={updateOwnerStaffPasswordAction} submitLabel="Simpan sandi baru" />
      </section>
    </main>
  );
}
