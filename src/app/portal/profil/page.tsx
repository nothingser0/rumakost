import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordForm } from "@/components/auth/password-form";
import { requireRouteAccess } from "@/lib/authorization/server";
import { updateTenantPasswordAction } from "./actions";
import styles from "../../aktivasi-sandi/page.module.css";

export const metadata: Metadata = { title: "Profil penghuni | RumaKost" };

export default function TenantProfilePage() {
  return (
    <Suspense fallback={<main aria-busy="true" className={styles.fallback}>Memeriksa sesi…</main>}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  await requireRouteAccess("/portal/profil");

  return (
    <main className={styles.page}>
      <section aria-labelledby="profile-title" className={styles.card}>
        <p className={styles.eyebrow}>AKUN PENGHUNI</p>
        <h1 id="profile-title">Ubah sandi</h1>
        <p className={styles.intro}>Ganti sandi akun Anda. Perubahan ini hanya berlaku untuk akun yang sedang masuk.</p>
        <PasswordForm action={updateTenantPasswordAction} submitLabel="Simpan sandi baru" />
      </section>
    </main>
  );
}
