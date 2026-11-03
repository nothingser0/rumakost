import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { AuthAppUser } from "@/lib/auth/app-user";
import { getCurrentAuthAppUser } from "@/lib/auth/current-app-user";
import { signOutAction } from "@/lib/auth/actions";
import { getPostPasswordChangePath } from "@/lib/auth/password-policy.mjs";
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
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  const sessionUser = session?.user;

  if (sessionUser) {
    let appUser: AuthAppUser | null;
    try {
      appUser = await getCurrentAuthAppUser();
    } catch {
      return <LoginUnavailable />;
    }

    if (appUser?.isActive && appUser.mustChangePassword) {
      redirect("/aktivasi-sandi");
    }

    if (appUser?.isActive) {
      redirect(getPostPasswordChangePath(appUser.role));
    }

    return <LoginUnavailable />;
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

function LoginUnavailable() {
  return (
    <main className={styles.sessionFallback}>
      <p>Sesi ini tidak dapat digunakan. Keluar lalu coba lagi.</p>
      <form action={signOutAction}>
        <button className={styles.submitButton} type="submit">
          Keluar dari sesi ini
        </button>
      </form>
    </main>
  );
}
