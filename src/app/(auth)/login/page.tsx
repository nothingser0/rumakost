import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { getSessionUser } from "@/lib/auth/auth-policy.mjs";
import { LoginForm } from "./login-form";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Masuk | RumaKost",
  description: "Masuk ke RumaKost untuk mengelola hunian dan masa sewa.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className={styles.sessionFallback}>
          <p>Memeriksa sesi…</p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  const session = await auth.getSession();

  if (getSessionUser(session)) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.photoPanel} aria-label="Tentang RumaKost">
        <div className={styles.photoOverlay} />
        <a className={styles.brand} href="/login" aria-label="RumaKost, halaman masuk">
          <span className={styles.brandMark} aria-hidden="true">R</span>
          <span>RumaKost</span>
        </a>
        <div className={styles.photoCaption}>
          <p className={styles.eyebrow}>PENGELOLAAN HUNIAN, LEBIH MUDAH</p>
          <h1>Ruang yang nyaman dimulai dari pengelolaan yang rapi.</h1>
          <p>Semua kebutuhan operasional kost Anda, dalam satu tempat.</p>
        </div>
        <p className={styles.photoCredit}>RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <a className={styles.mobileBrand} href="/login" aria-label="RumaKost, halaman masuk">
            <span className={styles.brandMark} aria-hidden="true">R</span>
            <span>RumaKost</span>
          </a>
          <p className={styles.formEyebrow}>SELAMAT DATANG KEMBALI</p>
          <h2>Masuk ke akun Anda</h2>
          <p className={styles.intro}>Gunakan akun RumaKost yang telah diberikan kepada Anda.</p>
          <LoginForm />
          <p className={styles.helpText}>Perlu bantuan akses? Hubungi pemilik kost Anda.</p>
        </div>
        <p className={styles.footer}>© 2026 RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>
    </main>
  );
}
