import type { Metadata } from "next";
import Link from "next/link";
import { verifyLoginEmailChangeAction } from "@/actions/users";
import { isEmailChangeTokenShape } from "@/lib/auth/email-change";
import styles from "../(auth)/login/page.module.css";

export const metadata: Metadata = {
  title: "Verifikasi email | RumaKost",
  description: "Verifikasi alamat email baru untuk akun RumaKost.",
  referrer: "no-referrer",
};

type VerificationPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    token?: string | string[];
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerificationPageProps) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const token = typeof params.token === "string" && isEmailChangeTokenShape(params.token)
    ? params.token
    : null;
  const verified = status === "verified";
  const headline = verified
    ? "Email login sudah diperbarui"
    : status === "expired"
      ? "Tautan sudah kedaluwarsa"
      : status === "conflict"
        ? "Alamat tidak dapat digunakan"
        : status === "unavailable"
          ? "Verifikasi belum selesai"
          : status === "invalid" || !token
            ? "Tautan tidak dapat digunakan"
            : "Verifikasi alamat email baru";
  const description = verified
    ? "Alamat baru sudah terverifikasi dan tersimpan pada akun Anda."
    : status === "expired"
      ? "Minta Owner mengirim tautan verifikasi baru untuk melanjutkan."
      : status === "conflict"
        ? "Alamat tersebut sudah dipakai akun lain. Hubungi Owner untuk memilih alamat berbeda."
        : status === "unavailable"
          ? "Perubahan belum dapat disimpan. Coba buka tautan ini lagi atau minta Owner mengirim ulang."
          : status === "invalid" || !token
            ? "Tautan verifikasi tidak valid atau sudah diganti. Minta Owner mengirim tautan baru."
            : "Lanjutkan hanya jika Anda ingin mengganti email masuk akun RumaKost dengan alamat yang menerima tautan ini.";

  return (
    <main className={styles.loginPage}>
      <section aria-label="Tentang RumaKost" className={styles.photoPanel}>
        <div className={styles.photoOverlay} />
        <Link aria-label="RumaKost, halaman masuk" className={styles.brand} href="/login">
          <span aria-hidden="true" className={styles.brandMark}>R</span>
          <span>RumaKost</span>
        </Link>
        <div className={styles.photoCaption}>
          <p className={styles.eyebrow}>KEAMANAN AKUN</p>
          <h1>Pastikan alamat email benar-benar milik Anda.</h1>
          <p>Perubahan baru berlaku setelah alamat baru diverifikasi.</p>
        </div>
        <p className={styles.photoCredit}>RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <Link aria-label="RumaKost, halaman masuk" className={styles.mobileBrand} href="/login">
            <span aria-hidden="true" className={styles.brandMark}>R</span>
            <span>RumaKost</span>
          </Link>
          <p className={styles.formEyebrow}>VERIFIKASI AKUN</p>
          <h2>{headline}</h2>
          <p className={styles.intro}>{description}</p>
          {token && !status ? (
            <form action={verifyLoginEmailChangeAction}>
              <input name="token" type="hidden" value={token} />
              <button className={styles.submitButton} type="submit">Verifikasi dan perbarui email</button>
            </form>
          ) : null}
          {verified ? (
            <Link className={`${styles.submitButton} ${styles.buttonLink}`} href="/login">
              Masuk ke RumaKost
            </Link>
          ) : null}
        </div>
        <p className={styles.footer}>© 2026 RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>
    </main>
  );
}
