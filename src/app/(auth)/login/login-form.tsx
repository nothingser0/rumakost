"use client";

import { useActionState, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { signInAction, type SignInState } from "@/lib/auth/actions";
import styles from "./page.module.css";

const initialState: SignInState = { error: null };

const roles = [
  { value: "OWNER", label: "Pemilik", icon: "shield-check" },
  { value: "STAFF", label: "Staf Pengelola", icon: "user" },
  { value: "TENANT", label: "Penghuni", icon: "home" },
] as const;

type RoleValue = (typeof roles)[number]["value"];
type IconName =
  | "shield-check"
  | "user"
  | "home"
  | "mail"
  | "lock"
  | "eye"
  | "eye-off"
  | "arrow-right"
  | "arrow-up-circle";

const iconPaths: Record<IconName, ReactNode> = {
  "shield-check": (
    <>
      <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15.7 15.7 0 0 1-3.2 4.1" />
      <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4-.7" />
    </>
  ),
  "arrow-right": <path d="M5 12h14m-7-7 7 7-7 7" />,
  "arrow-up-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 4-4 4 4M12 8v8" />
    </>
  ),
};

function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleValue>("OWNER");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const showError = state.error !== null && !pending;

  function updateCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState("CapsLock"));
  }

  return (
    <form action={formAction} autoComplete="on" className={styles.form}>
      <input name="destinationRole" type="hidden" value={selectedRole} />

      <div className={styles.roleSection}>
        <span className={styles.roleLabel} id="roleSectionLabel">
          Pilih Peran
        </span>
        <div
          aria-labelledby="roleSectionLabel"
          className={styles.roleSelector}
          role="group"
        >
          {roles.map((role) => (
            <button
              aria-pressed={selectedRole === role.value}
              className={
                selectedRole === role.value
                  ? `${styles.rolePill} ${styles.rolePillActive}`
                  : styles.rolePill
              }
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              type="button"
            >
              <Icon className={styles.roleIcon} name={role.icon} />
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.fieldLabel} htmlFor="email">
          Alamat Email
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <Icon name="mail" />
          </span>
          <input
            autoCapitalize="none"
            autoComplete="username"
            className={styles.input}
            id="email"
            maxLength={120}
            name="email"
            placeholder="nama@domain.com"
            required
            spellCheck={false}
            type="email"
          />
        </div>
      </div>

      <div className={`${styles.formGroup} ${styles.compactGroup}`}>
        <label className={styles.fieldLabel} htmlFor="password">
          Kata Sandi
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <Icon name="lock" />
          </span>
          <input
            autoComplete="current-password"
            className={styles.input}
            id="password"
            maxLength={128}
            name="password"
            onKeyDown={updateCapsLock}
            onKeyUp={updateCapsLock}
            placeholder="Masukkan kata sandi"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPassword}
            className={styles.eyeButton}
            onClick={() => setShowPassword((visible) => !visible)}
            title={showPassword ? "Sembunyikan kata sandi" : "Lihat Sandi"}
            type="button"
          >
            <Icon name={showPassword ? "eye-off" : "eye"} />
          </button>
        </div>
        <div className={capsLockOn ? `${styles.capsLockSlot} ${styles.capsLockActive}` : styles.capsLockSlot}>
          <div className={styles.capsLockInner}>
            <span aria-live="polite" className={styles.capsLockBadge} role="status">
              <Icon name="arrow-up-circle" />
              <span>Caps Lock Aktif</span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <label className={styles.checkboxLabel}>
          <input
            className={styles.checkbox}
            defaultChecked
            name="rememberMe"
            type="checkbox"
          />
          <span>Ingat saya di perangkat ini</span>
        </label>
        <Link className={styles.forgotLink} href="/lupa-sandi">
          Lupa kata sandi?
        </Link>
      </div>

      <div
        aria-hidden={!showError}
        className={
          showError
            ? `${styles.errorSlot} ${styles.errorSlotVisible}`
            : styles.errorSlot
        }
      >
        <div className={styles.errorSlotInner}>
          <p
            aria-live="polite"
            className={
              showError ? `${styles.error} ${styles.errorVisible}` : styles.error
            }
            role={showError ? "alert" : undefined}
          >
            {showError ? state.error : null}
          </p>
        </div>
      </div>

      <button className={styles.submitButton} disabled={pending} type="submit">
        <span>{pending ? "Sedang masuk…" : "Masuk ke Akun"}</span>
        {pending ? <span aria-hidden="true" className={styles.spinner} /> : <Icon className={styles.submitIcon} name="arrow-right" />}
      </button>
    </form>
  );
}
