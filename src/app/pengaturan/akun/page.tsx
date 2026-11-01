import type { Metadata } from "next";
import { Suspense } from "react";
import type { AppRole } from "@/lib/auth/app-user";
import { requireRouteAccess } from "@/lib/authorization/server";
import { listManagedAccounts } from "@/lib/users/managed-accounts";
import { AccountDirectory } from "./account-directory";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Akun pengguna | RumaKost" };

export default function ManagedAccountsPage() {
  return (
    <Suspense fallback={<main aria-busy="true" className={styles.fallback}>Memeriksa sesi…</main>}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const actor = await requireRouteAccess("/pengaturan/akun");
  const accounts = await listManagedAccounts(actor.role as AppRole);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>PENGELOLAAN AKSES</p>
        <h1>Akun pengguna</h1>
        <p className={styles.intro}>
          {actor.role === "OWNER"
            ? "Buat akun Staff dan Penghuni. Akun Owner utama disiapkan terpisah."
            : "Buat dan kelola akun Penghuni. Pengaturan akun Staff hanya tersedia untuk Owner."}
        </p>
      </header>
      <AccountDirectory accounts={accounts} actorRole={actor.role as AppRole} />
    </main>
  );
}
