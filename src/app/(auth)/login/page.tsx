import type { Metadata } from "next";
import Image from "next/image";
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
  title: "Masuk ke Akun | RumaKost",
  description:
    "Masuk ke RumaKost sebagai pemilik, staf pengelola, atau penghuni.",
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
    <main className={styles.pageRoot}>
      <section aria-labelledby="loginTitle" className={styles.loginCard}>
        <div className={styles.mediaPanel}>
          <Image
            alt="Hunian kost modern dengan area komunal yang nyaman"
            className={styles.mediaImage}
            fill
            priority
            sizes="(max-width: 900px) 0px, 56vw"
            src="/login-showcase.png"
          />
        </div>

        <div className={styles.formPanel}>
          <div className={styles.brandHero}>
            <div className={styles.brandBadge}>
              <span className={styles.brandIconBox} aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                  <rect width="52" height="52" rx="14" fill="#FF7A00" />
                  <polygon
                    points="14,32 14,16 20,10 26,5 32,10 38,16 38,32"
                    fill="#FFFFFF"
                  />
                  <circle cx="26" cy="21" r="6.5" fill="#FF7A00" />
                  <rect x="23" y="31" width="6" height="16" rx="1.5" fill="#FFFFFF" />
                  <rect x="29" y="37" width="5" height="4" rx="1" fill="#FFFFFF" />
                  <rect x="29" y="44" width="3" height="3" rx="1" fill="#FFFFFF" />
                </svg>
              </span>
              <span className={styles.brandTextGroup}>
                <span className={styles.brandName}>
                  Ruma<span>Kost</span>
                </span>
                <span className={styles.brandTagline}>
                  Sistem Manajemen Kost Mandiri
                </span>
              </span>
            </div>

            <h1 className={styles.formTitle} id="loginTitle">
              Masuk ke Akun
            </h1>
            <p className={styles.formSubtitle}>
              Pilih peran Anda dan masukkan kredensial terdaftar.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}

function LoginUnavailable() {
  return (
    <main className={styles.sessionFallback}>
      <div>
        <p>Sesi ini tidak dapat digunakan. Keluar lalu coba lagi.</p>
        <form action={signOutAction}>
          <button className={styles.fallbackButton} type="submit">
            Keluar dari sesi ini
          </button>
        </form>
      </div>
    </main>
  );
}
