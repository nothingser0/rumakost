"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  completePasswordResetAction,
  type PasswordResetCompletionState,
} from "@/lib/auth/actions";
import styles from "../login/page.module.css";

const initialState: PasswordResetCompletionState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    completePasswordResetAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div aria-live="polite" className={styles.helpText} role="status">
        <p>Kata sandi berhasil diperbarui.</p>
        <Link className={styles.textLink} href="/login">
          Masuk dengan kata sandi baru
        </Link>
      </div>
    );
  }

  if (state.status === "failed") {
    return (
      <div aria-live="polite" className={styles.helpText} role="alert">
        <p>Tautan pemulihan tidak dapat digunakan. Minta tautan baru.</p>
        <Link className={styles.textLink} href="/lupa-sandi">
          Minta tautan pemulihan baru
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <input name="token" type="hidden" value={token} />

      <label className={styles.label} htmlFor="new-password">
        Kata sandi baru
      </label>
      <input
        autoComplete="new-password"
        className={styles.input}
        id="new-password"
        aria-describedby={state.status === "invalid" ? "password-reset-error" : undefined}
        aria-invalid={state.status === "invalid"}
        maxLength={128}
        minLength={8}
        name="newPassword"
        required
        type="password"
      />

      <label className={styles.label} htmlFor="confirm-password">
        Ulangi kata sandi baru
      </label>
      <input
        autoComplete="new-password"
        className={styles.input}
        id="confirm-password"
        aria-describedby={state.status === "invalid" ? "password-reset-error" : undefined}
        aria-invalid={state.status === "invalid"}
        maxLength={128}
        minLength={8}
        name="confirmPassword"
        required
        type="password"
      />

      {state.status === "invalid" ? (
        <p aria-live="polite" className={styles.error} id="password-reset-error" role="alert">
          Kata sandi harus berisi 8–128 karakter dan kedua isian harus sama.
        </p>
      ) : null}

      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending ? "Memperbarui kata sandi…" : "Simpan kata sandi baru"}
      </button>

      <p className={styles.helpText}>
        <Link className={styles.textLink} href="/login">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}
