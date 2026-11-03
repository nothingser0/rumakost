# M06-AUTH-01 — Blocker perubahan email akun target

Tanggal: 2026-11-03  
Status: blocked; task tetap terbuka di `TODO.md`.

## Kontrak yang disetujui saat ini

`M05-DATA-API-SPEC-DRAFT.md` mendefinisikan `changeLoginEmail` untuk Owner dengan input `userId` dan email baru. WF-09-SK-31 menyebut Owner memilih akun target. FSD mensyaratkan verifikasi Neon Auth, `authSubject` tetap, dan perubahan `AppUser.emailNormalized` baru dilakukan sesudah provider mengonfirmasi alamat baru.

## Kemampuan SDK/provider yang ditemukan

Versi SDK lokal:

```text
0.5.0-beta / 1.6.23
```

Source `better-auth` yang terpasang:

```text
POST /change-email
body: newEmail, callbackURL
middleware: sensitiveSessionMiddleware
target account: ctx.context.session.user.email
```

Endpoint ini mengubah email akun yang sedang login. Ia tidak menerima ID akun target. Endpoint OTP `/email-otp/change-email` juga memperoleh email dan user dari sesi aktif.

Jalur admin target-user:

```text
POST /admin/update-user
permission: user:set-email
mutation: internalAdapter.updateUser(userId, data)
```

Jalur tersebut mengubah email provider secara langsung tanpa mengirim atau menunggu verifikasi alamat baru. Ia tidak memenuhi kontrak M06-AUTH-01. Better Auth mendokumentasikan bahwa email pengguna hanya diperbarui setelah verifikasi alamat baru; Neon menyatakan Managed Auth belum mendukung custom server-side handlers/plugins.

Sumber: [Better Auth User & Accounts](https://better-auth.com/docs/concepts/users-accounts); [Neon Auth architecture](https://neon.com/blog/neon-auth-branchable-identity-in-your-database).

## Verify task

Perintah satu-satunya sesuai Verify M06-AUTH-01:

```text
npm run test -- auth-email-change
```

Output mentah:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-email-change

No tests found for suite: auth-email-change
EXIT_CODE=1
```

Tidak ada source aplikasi atau data provider yang diubah. Verify belum lulus; task tetap `[ ]`.

## Keputusan yang diperlukan

Rekomendasi: pertahankan perubahan email akun target oleh Owner dengan konfirmasi alamat baru, dan tunda sampai provider menyediakan alur admin-initiated yang terverifikasi atau Owner menyetujui desain provider alternatif.

Pilihan perubahan scope: batasi perubahan email menjadi self-service untuk akun Owner yang sedang login. Pilihan ini mengubah keputusan domain di PRD, FSD, M05 Data API, dan WF-09; jangan implementasikan hanya dengan mengubah handler.
