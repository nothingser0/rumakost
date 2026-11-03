import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import styles from "../login/page.module.css";

export const metadata: Metadata = {
  title: "Atur kata sandi baru | RumaKost",
  description: "Atur kata sandi baru untuk akun RumaKost Anda.",
  referrer: "no-referrer",
};

type ResetPasswordSearchParams = Promise<{
  error?: string | string[];
  token?: string | string[];
}>;

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: ResetPasswordSearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main aria-busy="true" className={styles.sessionFallback}>
          <p>Menyiapkan formulir…</p>
        </main>
      }
    >
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: ResetPasswordSearchParams;
}) {
  const params = await searchParams;
  const token = params.token;
  const usableToken =
    params.error === undefined &&
    typeof token === "string" &&
    token.trim().length > 0 &&
    token.length <= 2048
      ? token
      : null;

  return (
    <main className={styles.loginPage}>
      <section className={styles.photoPanel} aria-label="Tentang RumaKost">
        <div className={styles.photoOverlay} />
        <Link className={styles.brand} href="/login" aria-label="RumaKost, halaman masuk">
          <span className={styles.brandMark} aria-hidden="true">R</span>
          <span>RumaKost</span>
        </Link>
        <div className={styles.photoCaption}>
          <p className={styles.eyebrow}>AKSES AKUN ANDA</p>
          <h1>Atur ulang kata sandi dengan aman.</h1>
          <p>Gunakan tautan dari email pemulihan untuk membuat kata sandi baru.</p>
        </div>
        <p className={styles.photoCredit}>RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <Link className={styles.mobileBrand} href="/login" aria-label="RumaKost, halaman masuk">
            <span className={styles.brandMark} aria-hidden="true">R</span>
            <span>RumaKost</span>
          </Link>
          {usableToken ? (
            <>
              <p className={styles.formEyebrow}>PEMULIHAN AKUN</p>
              <h2>Atur kata sandi baru</h2>
              <p className={styles.intro}>
                Buat kata sandi baru untuk melanjutkan masuk ke akun RumaKost Anda.
              </p>
              <ResetPasswordForm token={usableToken} />
            </>
          ) : (
            <>
              <p className={styles.formEyebrow}>PEMULIHAN AKUN</p>
              <h2>Tautan tidak dapat digunakan</h2>
              <p className={styles.intro}>
                Tautan pemulihan tidak tersedia. Minta tautan baru untuk melanjutkan.
              </p>
              <Link className={`${styles.submitButton} ${styles.buttonLink}`} href="/lupa-sandi">
                Minta tautan baru
              </Link>
            </>
          )}
        </div>
        <p className={styles.footer}>© 2026 RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>
    </main>
  );
}
