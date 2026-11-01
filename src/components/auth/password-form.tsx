"use client";

import { useActionState } from "react";
import type { PasswordActionState } from "@/lib/auth/password-actions";
import styles from "./password-form.module.css";

type PasswordAction = (
  previousState: PasswordActionState,
  formData: FormData,
) => Promise<PasswordActionState>;

type PasswordFormProps = {
  action: PasswordAction;
  submitLabel: string;
};

const initialState: PasswordActionState = { error: null, success: null };

export function PasswordForm({ action, submitLabel }: PasswordFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      <label className={styles.label} htmlFor="currentPassword">Sandi saat ini</label>
      <input
        autoComplete="current-password"
        className={styles.input}
        id="currentPassword"
        maxLength={128}
        name="currentPassword"
        required
        type="password"
      />

      <label className={styles.label} htmlFor="newPassword">Sandi baru</label>
      <input
        autoComplete="new-password"
        className={styles.input}
        id="newPassword"
        maxLength={128}
        minLength={8}
        name="newPassword"
        required
        type="password"
      />
      <p className={styles.hint}>Gunakan setidaknya 8 karakter.</p>

      <label className={styles.label} htmlFor="confirmPassword">Ulangi sandi baru</label>
      <input
        autoComplete="new-password"
        className={styles.input}
        id="confirmPassword"
        maxLength={128}
        minLength={8}
        name="confirmPassword"
        required
        type="password"
      />

      {state.error ? <p aria-live="polite" className={styles.error} role="alert">{state.error}</p> : null}
      {state.success ? <p aria-live="polite" className={styles.success} role="status">{state.success}</p> : null}

      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}
