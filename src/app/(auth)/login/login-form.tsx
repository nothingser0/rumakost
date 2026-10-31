"use client";

import { useActionState, useState } from "react";
import { signInAction, type SignInState } from "@/lib/auth/actions";
import styles from "./page.module.css";

const initialState: SignInState = { error: null };
const roles = [
  { value: "OWNER", label: "Pemilik" },
  { value: "STAFF", label: "Staf" },
  { value: "TENANT", label: "Penghuni" },
] as const;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[number]["value"]>("OWNER");

  return (
    <form className={styles.form} action={formAction}>
      <fieldset className={styles.roleFieldset}>
        <legend>Saya masuk sebagai</legend>
        <div className={styles.roleSelector}>
          {roles.map((role) => (
            <button
              aria-pressed={selectedRole === role.value}
              className={selectedRole === role.value ? styles.roleSelected : styles.roleButton}
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              type="button"
            >
              {role.label}
            </button>
          ))}
        </div>
        <input name="destinationRole" type="hidden" value={selectedRole} />
        <p className={styles.roleHint}>Akses ditentukan oleh peran yang tercatat pada akun Anda.</p>
      </fieldset>

      <label className={styles.label} htmlFor="email">Alamat email</label>
      <input
        autoComplete="username"
        className={styles.input}
        id="email"
        maxLength={254}
        name="email"
        placeholder="nama@email.com"
        required
        type="email"
      />

      <div className={styles.passwordLabelRow}>
        <label className={styles.label} htmlFor="password">Kata sandi</label>
      </div>
      <div className={styles.passwordField}>
        <input
          autoComplete="current-password"
          className={styles.passwordInput}
          id="password"
          maxLength={128}
          minLength={1}
          name="password"
          placeholder="Masukkan kata sandi"
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={showPassword}
          className={styles.visibilityButton}
          onClick={() => setShowPassword((visible) => !visible)}
          type="button"
        >
          {showPassword ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>

      <label className={styles.rememberLabel}>
        <input name="rememberMe" type="checkbox" />
        <span>Ingat saya di perangkat ini</span>
      </label>

      {state.error ? <p aria-live="polite" className={styles.error} role="alert">{state.error}</p> : null}

      <button className={styles.submitButton} disabled={pending} type="submit">
        {pending ? "Sedang masuk…" : "Masuk"}
      </button>
    </form>
  );
}
