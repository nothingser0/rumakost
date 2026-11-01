"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { AppRole } from "@/lib/auth/app-user";
import { createAccountAction, setAccountStatusAction, type AccountStatusState, type CreateAccountState } from "@/actions/users";
import type { ManagedAccount } from "@/lib/users/managed-accounts";
import styles from "./page.module.css";

const initialCreateState: CreateAccountState = { error: null, message: null, temporaryPassword: null };
const initialStatusState: AccountStatusState = { error: null, message: null };

type AccountDirectoryProps = {
  accounts: ManagedAccount[];
  actorRole: AppRole;
};

export function AccountDirectory({ accounts, actorRole }: AccountDirectoryProps) {
  return (
    <div className={styles.columns}>
      <section aria-labelledby="create-account-title" className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.sectionLabel}>AKUN BARU</p>
            <h2 id="create-account-title">Buat akun</h2>
          </div>
          <span aria-hidden="true" className={styles.headingMark}>+</span>
        </div>
        <CreateAccountForm actorRole={actorRole} />
      </section>

      <section aria-labelledby="account-list-title" className={`${styles.panel} ${styles.directory}`}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.sectionLabel}>DIREKTORI</p>
            <h2 id="account-list-title">Daftar akun</h2>
          </div>
          <span className={styles.count}>{accounts.length} akun</span>
        </div>
        {accounts.length === 0 ? (
          <p className={styles.empty}>Belum ada akun yang dapat ditampilkan.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Pengguna</th>
                  <th scope="col">Peran</th>
                  <th scope="col">Status</th>
                  <th scope="col">Dibuat</th>
                  <th scope="col"><span className={styles.visuallyHidden}>Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AccountRow account={account} actorRole={actorRole} key={account.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={styles.policyNote}>
          Sandi akun dikelola oleh layanan autentikasi. Pengguna wajib mengganti sandi awal sebelum menggunakan fitur lain.
        </p>
      </section>
    </div>
  );
}

function CreateAccountForm({ actorRole }: { actorRole: AppRole }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState(createAccountAction, initialCreateState);
  const canCreateStaff = actorRole === "OWNER";

  useEffect(() => {
    if (state.temporaryPassword) formRef.current?.reset();
  }, [state.temporaryPassword]);

  async function copyTemporaryPassword() {
    if (!state.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(state.temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <form action={formAction} className={styles.form} ref={formRef}>
      {canCreateStaff ? (
        <fieldset className={styles.roleGroup}>
          <legend>Peran akun</legend>
          <div className={styles.roleChoices}>
            <label className={styles.roleChoice}>
              <input defaultChecked name="role" type="radio" value="TENANT" />
              <span>Penghuni</span>
            </label>
            <label className={styles.roleChoice}>
              <input name="role" type="radio" value="STAFF" />
              <span>Staff</span>
            </label>
          </div>
        </fieldset>
      ) : (
        <input name="role" type="hidden" value="TENANT" />
      )}

      <label className={styles.label} htmlFor="displayName">Nama lengkap</label>
      <input autoComplete="name" className={styles.input} id="displayName" maxLength={100} minLength={2} name="displayName" required />

      <label className={styles.label} htmlFor="email">Email masuk</label>
      <input autoComplete="email" className={styles.input} id="email" maxLength={254} name="email" required type="email" />
      <p className={styles.hint}>Gunakan email yang dapat diakses oleh pengguna.</p>

      {state.error ? <p aria-live="polite" className={styles.error} role="alert">{state.error}</p> : null}
      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? "Membuat akun…" : "Buat akun"}
      </button>

      {state.temporaryPassword ? (
        <div aria-live="polite" className={styles.credential} role="status">
          <p className={styles.credentialTitle}>{state.message}</p>
          <label className={styles.label} htmlFor="temporaryPassword">Sandi awal, tampil satu kali</label>
          <div className={styles.passwordRow}>
            <output className={styles.passwordValue} id="temporaryPassword">{state.temporaryPassword}</output>
            <button className={styles.copyButton} onClick={copyTemporaryPassword} type="button">{copied ? "Tersalin" : "Salin"}</button>
          </div>
          <p className={styles.hint}>Sampaikan langsung kepada pengguna. Jangan kirim lewat kanal publik.</p>
        </div>
      ) : null}
    </form>
  );
}

function AccountRow({ account, actorRole }: { account: ManagedAccount; actorRole: AppRole }) {
  const [state, formAction, pending] = useActionState(setAccountStatusAction, initialStatusState);
  const canManage = account.role !== "OWNER" && (actorRole === "OWNER" || account.role === "TENANT");

  return (
    <tr>
      <td data-label="Pengguna">
        <span className={styles.name}>{account.displayName}</span>
        <span className={styles.email}>{account.email}</span>
      </td>
      <td data-label="Peran"><span className={roleClass(account.role)}>{roleLabel(account.role)}</span></td>
      <td data-label="Status"><span className={account.isActive ? styles.active : styles.inactive}>{account.isActive ? "Aktif" : "Nonaktif"}</span></td>
      <td data-label="Dibuat" className={styles.date}>{account.createdAtLabel}</td>
      <td data-label="Aksi" className={styles.actions}>
        {canManage ? (
          <form action={formAction}>
            <input name="id" type="hidden" value={account.id} />
            <input name="isActive" type="hidden" value={String(!account.isActive)} />
            <button className={account.isActive ? styles.deactivate : styles.activate} disabled={pending} type="submit">
              {pending ? "Menyimpan…" : account.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
            {state.error ? <span className={styles.rowError} role="alert">{state.error}</span> : null}
            {state.message ? <span aria-live="polite" className={styles.visuallyHidden} role="status">{state.message}</span> : null}
          </form>
        ) : <span className={styles.mainAccount}>Akun utama</span>}
      </td>
    </tr>
  );
}

function roleClass(role: AppRole) {
  if (role === "OWNER") return styles.ownerRole;
  if (role === "STAFF") return styles.staffRole;
  return styles.tenantRole;
}

function roleLabel(role: AppRole) {
  if (role === "OWNER") return "Owner";
  if (role === "STAFF") return "Staff";
  return "Penghuni";
}
