import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";
import styles from "../login/page.module.css";

export const metadata: Metadata = {
  title: "Lupa kata sandi | RumaKost",
  description: "Minta tautan untuk mengatur ulang kata sandi akun RumaKost.",
};

export default function ForgotPasswordPage() {
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
          <h1>Pulihkan akses dengan aman.</h1>
          <p>Gunakan email terdaftar untuk menerima tautan pemulihan dari RumaKost.</p>
        </div>
        <p className={styles.photoCredit}>RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <Link className={styles.mobileBrand} href="/login" aria-label="RumaKost, halaman masuk">
            <span className={styles.brandMark} aria-hidden="true">R</span>
            <span>RumaKost</span>
          </Link>
          <p className={styles.formEyebrow}>PEMULIHAN AKUN</p>
          <h2>Lupa kata sandi?</h2>
          <p className={styles.intro}>
            Masukkan email akun Anda. Jika terdaftar, kami akan mengirim tautan untuk membuat kata sandi baru.
          </p>
          <ForgotPasswordForm />
        </div>
        <p className={styles.footer}>© 2026 RumaKost · Sistem Manajemen Kost Mandiri</p>
      </section>
    </main>
  );
}
