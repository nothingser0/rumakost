import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordForm } from "@/components/auth/password-form";
import { requireRouteAccess } from "@/lib/authorization/server";
import { activatePasswordAction } from "./actions";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Aktivasi sandi | RumaKost" };

export default function ActivatePasswordPage() {
  return (
    <Suspense fallback={<main aria-busy="true" className={styles.fallback}>Memeriksa sesi…</main>}>
      <ActivationContent />
    </Suspense>
  );
}

async function ActivationContent() {
  await requireRouteAccess("/aktivasi-sandi");

  return (
    <main className={styles.page}>
      <section aria-labelledby="activation-title" className={styles.card}>
        <p className={styles.eyebrow}>AKUN RUMAKOST</p>
        <h1 id="activation-title">Buat sandi baru</h1>
        <p className={styles.intro}>Sebelum melanjutkan, ganti sandi awal yang diberikan kepada Anda.</p>
        <PasswordForm action={activatePasswordAction} submitLabel="Simpan sandi dan lanjutkan" />
      </section>
    </main>
  );
}
