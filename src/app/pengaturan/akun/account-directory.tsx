"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AppRole } from "@/lib/auth/app-user";
import {
  createAccountAction,
  setAccountStatusAction,
  transferStaffTicketsAction,
  type AccountStatusState,
  type CreateAccountState,
  type TicketTransferState,
} from "@/actions/users";
import type { ManagedAccount, TicketAssigneeOption } from "@/lib/users/managed-accounts";
import styles from "./page.module.css";

const initialCreateState: CreateAccountState = { error: null, message: null };
const initialStatusState: AccountStatusState = { error: null, message: null };
const initialTransferState: TicketTransferState = { error: null, message: null };

type AccountDirectoryProps = {
  accounts: ManagedAccount[];
  actorRole: AppRole;
  assignees: TicketAssigneeOption[];
};

export function AccountDirectory({ accounts, actorRole, assignees }: AccountDirectoryProps) {
  return (
    <div className={styles.columns}>
      <section aria-labelledby="create-account-title" className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.sectionLabel}>AKSES PENGGUNA</p>
            <h2 id="create-account-title">Undang pengguna</h2>
          </div>
        </div>
        <CreateAccountForm actorRole={actorRole} />
      </section>

      <section aria-labelledby="account-list-title" className={`${styles.panel} ${styles.directory}`}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.sectionLabel}>AKUN TERSIMPAN</p>
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
                  <th scope="col">Tiket aktif</th>
                  <th scope="col">Dibuat</th>
                  <th scope="col"><span className={styles.visuallyHidden}>Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AccountRow
                    account={account}
                    actorRole={actorRole}
                    assignees={assignees}
                    key={account.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={styles.policyNote}>
          Tautan aktivasi dikirim lewat email. Pengguna membuat sandinya sendiri sebelum masuk.
        </p>
      </section>
    </div>
  );
}

function CreateAccountForm({ actorRole }: { actorRole: AppRole }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createAccountAction, initialCreateState);
  const canCreateStaff = actorRole === "OWNER";

  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state]);

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
      <input
        autoComplete="name"
        className={styles.input}
        id="displayName"
        maxLength={100}
        minLength={2}
        name="displayName"
        required
      />

      <label className={styles.label} htmlFor="email">Email masuk</label>
      <input
        autoComplete="email"
        className={styles.input}
        id="email"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <p className={styles.hint}>Pastikan alamat ini dapat menerima tautan aktivasi.</p>

      {state.error ? <p aria-live="polite" className={styles.error} role="alert">{state.error}</p> : null}
      {state.message ? <p aria-live="polite" className={styles.message} role="status">{state.message}</p> : null}
      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? "Mengirim undangan…" : "Kirim undangan"}
      </button>
    </form>
  );
}

function AccountRow({
  account,
  actorRole,
  assignees,
}: {
  account: ManagedAccount;
  actorRole: AppRole;
  assignees: TicketAssigneeOption[];
}) {
  const [state, formAction, pending] = useActionState(setAccountStatusAction, initialStatusState);
  const canManage = account.role !== "OWNER" && (actorRole === "OWNER" || account.role === "TENANT");
  const status = account.isActive
    ? account.emailVerified ? "Aktif" : "Menunggu aktivasi"
    : "Nonaktif";
  const statusClass = account.isActive
    ? account.emailVerified ? styles.active : styles.pending
    : styles.inactive;

  return (
    <tr>
      <td data-label="Pengguna">
        <span className={styles.name}>{account.displayName}</span>
        <span className={styles.email}>{account.email}</span>
      </td>
      <td data-label="Peran"><span className={roleClass(account.role)}>{roleLabel(account.role)}</span></td>
      <td data-label="Status"><span className={statusClass}>{status}</span></td>
      <td data-label="Tiket aktif" className={styles.ticketCount}>
        {account.role === "STAFF" ? account.activeTicketCount : "Tidak berlaku"}
      </td>
      <td data-label="Dibuat" className={styles.date}>{account.createdAtLabel}</td>
      <td data-label="Aksi" className={styles.actions}>
        {canManage ? (
          <div className={styles.rowControls}>
            {actorRole === "OWNER" && account.role === "STAFF" && account.activeTicketCount > 0 ? (
              <TicketTransferForm account={account} assignees={assignees} />
            ) : null}
            <form action={formAction}>
              <input name="id" type="hidden" value={account.id} />
              <input name="isActive" type="hidden" value={String(!account.isActive)} />
              <button
                className={account.isActive ? styles.deactivate : styles.activate}
                disabled={pending}
                type="submit"
              >
                {pending ? "Menyimpan…" : account.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              {state.error ? <span className={styles.rowError} role="alert">{state.error}</span> : null}
              {state.message ? <span aria-live="polite" className={styles.rowMessage} role="status">{state.message}</span> : null}
            </form>
          </div>
        ) : <span className={styles.mainAccount}>Akun utama</span>}
      </td>
    </tr>
  );
}

function TicketTransferForm({
  account,
  assignees,
}: {
  account: ManagedAccount;
  assignees: TicketAssigneeOption[];
}) {
  const [state, formAction, pending] = useActionState(transferStaffTicketsAction, initialTransferState);
  const targets = assignees.filter((assignee) => assignee.id !== account.id);

  if (targets.length === 0) {
    return <p className={styles.rowError}>Tidak ada Owner atau Staff aktif lain untuk menerima tiket.</p>;
  }

  return (
    <form action={formAction} className={styles.transferForm}>
      <input name="sourceStaffId" type="hidden" value={account.id} />
      <label className={styles.visuallyHidden} htmlFor={`assignee-${account.id}`}>
        Alihkan tiket {account.displayName} kepada
      </label>
      <select
        className={styles.select}
        defaultValue=""
        id={`assignee-${account.id}`}
        name="targetAssigneeId"
        required
      >
        <option disabled value="">Pilih penerima</option>
        {targets.map((target) => (
          <option key={target.id} value={target.id}>
            {target.displayName} · {roleLabel(target.role)}
          </option>
        ))}
      </select>
      <button className={styles.transferButton} disabled={pending} type="submit">
        {pending ? "Mengalihkan…" : `Alihkan ${account.activeTicketCount} tiket`}
      </button>
      {state.error ? <span className={styles.rowError} role="alert">{state.error}</span> : null}
      {state.message ? <span aria-live="polite" className={styles.rowMessage} role="status">{state.message}</span> : null}
    </form>
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
