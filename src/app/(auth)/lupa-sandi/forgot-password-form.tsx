"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState,
} from "@/lib/auth/actions";
import styles from "../login/page.module.css";

const initialState: PasswordResetRequestState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <>
      <form className={styles.form} action={formAction}>
        <label className={styles.label} htmlFor="reset-email">
          Alamat email
        </label>
        <input
          autoComplete="email"
          className={styles.input}
          id="reset-email"
          inputMode="email"
          maxLength={254}
          name="email"
          placeholder="nama@email.com"
          required
          type="email"
          aria-describedby={state.status === "invalid" ? "reset-email-error" : undefined}
          aria-invalid={state.status === "invalid"}
        />

        {state.status === "invalid" ? (
          <p aria-live="polite" className={styles.error} id="reset-email-error" role="alert">
            Masukkan alamat email yang valid.
          </p>
        ) : null}

        {state.status === "accepted" ? (
          <p aria-live="polite" className={styles.helpText} role="status">
            Jika alamat email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan spam.
          </p>
        ) : null}

        {state.status === "unavailable" ? (
          <p aria-live="polite" className={styles.error} role="alert">
            Permintaan belum dapat diproses. Coba lagi beberapa saat lagi.
          </p>
        ) : null}

        <button className={styles.submitButton} disabled={pending} type="submit">
          {pending ? "Mengirim permintaan…" : "Kirim tautan pemulihan"}
        </button>
      </form>

      <p className={styles.helpText}>
        <Link className={styles.textLink} href="/login">
          Kembali ke halaman masuk
        </Link>
      </p>
    </>
  );
}
