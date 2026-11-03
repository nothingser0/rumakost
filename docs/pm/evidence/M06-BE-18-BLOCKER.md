# M06-BE-18 — Blocker permission Neon Auth

Tanggal: 2026-11-03  
Status: blocked; task tetap terbuka di `TODO.md`.

## Keputusan Owner

Owner menyetujui rekomendasi least-privilege: jangan memberi Staff role provider `admin`. Tunda operasi akun provider sampai ada jalur manajemen dengan permission terbatas. Ini keputusan untuk menahan implementasi yang tidak aman, bukan persetujuan bahwa BE-18 selesai.

## Bukti source SDK terpasang

Versi lokal:

```text
0.5.0-beta / 1.6.23
```

Output di atas berasal dari `node -p` yang mencetak versi `@neondatabase/auth` dan `better-auth`.

Source `better-auth` yang terpasang:

```text
admin.mjs:14 adminRoles: options?.adminRoles ?? ["admin"]
statement.mjs:24 const adminAc = defaultAc.newRole({
statement.mjs:25 user: [
statement.mjs:26   "create",
statement.mjs:27   "list",
statement.mjs:28   "set-role",
statement.mjs:29   "ban",
statement.mjs:30   "impersonate",
statement.mjs:31   "delete",
statement.mjs:32   "set-password",
statement.mjs:33   "set-email",
statement.mjs:34   "get",
statement.mjs:35   "update"
statement.mjs:43 const userAc = defaultAc.newRole({
statement.mjs:44 user: [],
statement.mjs:45 session: []
routes.mjs:152 permissions: { user: ["create"] }
routes.mjs:466 permissions: { user: ["ban"] }
routes.mjs:519 permissions: { user: ["ban"] }
```

Interpretasi: akun Staff provider biasa tidak dapat memakai endpoint create/ban/unban. Memberi role `admin` akan memberi sekumpulan permission pengelolaan user dan session yang lebih luas daripada kebutuhan Staff di RumaKost. SDK Neon lokal bertipe dengan `NeonAuthAdapterCoreAuthOptions` yang menghilangkan opsi server `plugins`; tidak ada konfigurasi lokal yang dapat memasang permission server terbatas pada managed provider.

## Verify task

Perintah satu-satunya sesuai Verify BE-18:

```text
npm run test -- account-lifecycle
```

Output mentah:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs account-lifecycle

No tests found for suite: account-lifecycle
EXIT_CODE=1
```

Tidak ada implementasi yang diubah. Tidak ada request Neon Auth, query database, atau perubahan konfigurasi provider. Verify belum lulus; task tetap `[ ]`.

## Langkah pembukaan blocker

Lanjutkan ketika Neon menyediakan API/service credential dengan scope yang dapat membatasi operasi yang dibutuhkan, atau Owner menyetujui desain provider alternatif yang tetap least-privilege. Setelah jalur itu jelas, implementasikan dan uji provisioning/onboarding serta offboarding Staff end-to-end.
