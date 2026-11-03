# Evidence M06-AUTH-03 — Better Auth di Neon disposable

Tanggal: 2026-11-03  
Status: Verify lulus; menunggu review Owner. Task tetap `[ ]`.

## Lingkungan dan batas

- Better Auth `1.6.23`, `@neondatabase/serverless` `1.2.0`, Node `24.22.2`, Neon PostgreSQL `18`.
- Verify terakhir memakai project disposable `rumakost-auth-spike-20261103-final` (`crimson-smoke-55337414`), database `neon_auth_spike`. Koneksi dibuat dengan Neon CLI untuk project ID tersebut, disimpan hanya pada environment process, dan tidak dicetak atau ditulis ke file.
- `.env.local`, project `rumakost` (`floral-wind-91503829`), serta branch/database aktif tidak dibaca atau diubah. Email capture lokal memakai alamat sintetis `.invalid`; tidak ada email sungguhan dikirim.
- Disposable project sebelumnya dari percobaan awal juga dihapus: `restless-lake-11842616` dan `steep-cloud-44347524`. Setelah penghapusan project terakhir, `neon projects list` hanya menampilkan project `rumakost` (`floral-wind-91503829`); tidak ada project spike tersisa.
- Percobaan Verify awal berhenti pada pemeriksaan origin karena request fixture tidak mengirim `Origin`. Fixture diperbaiki untuk memakai origin lokal, lalu Verify terakhir lulus penuh.

## Temuan

- Better Auth dapat memakai Neon PostgreSQL dan membuat tabel autentikasi di database disposable.
- Public email/password signup dinonaktifkan. Magic link untuk alamat yang belum diundang tidak membuat user; akun hanya dibuat oleh helper server setelah matriks role mengizinkan. Owner dapat mengundang Staff/Penghuni; Staff hanya Penghuni. Magic link provider tidak membutuhkan password sementara buatan aplikasi.
- Penonaktifan lewat helper server memeriksa role target, menandai user banned, menghapus sesi aktif, dan menolak penerbitan sesi baru. Fixture Owner/Staff/Tenant menguji batas izin.
- Perubahan email bawaan menunggu konfirmasi alamat lama dan verifikasi alamat baru sebelum mengganti email user. Reconciliation mirror mempertahankan `authSubject` dan idempotent saat diulang.
- **Gap yang tersisa:** endpoint bawaan `/change-email` hanya mengubah user pada sesi yang sedang login. Ketika Owner mengirim `userId` Tenant, provider tetap mengubah alamat Owner dan tidak mengubah Tenant. Jadi alur Owner mengubah email akun target belum terpenuhi dan M06-AUTH-01 tetap terbuka. Memenuhi kontrak itu memerlukan custom flow/plugin terkontrol atau pilihan provider lain, dengan state verifikasi, anti-replay, audit, dan reconciliation yang harus dirancang serta diuji.
- Plugin Admin Better Auth bawaan mewajibkan password pada endpoint `createUser`; spike menghindarinya lewat `internalAdapter.createUser` hanya di helper server. Itu membuktikan jalur teknis, tetapi bukan keputusan integrasi produksi. Endpoint server yang mengikat helper ke session dan audit, email delivery nyata, sinkronisasi AppUser, serta lifecycle production belum dibuat. M06-BE-18 tetap menunggu keputusan dan implementasi terpisah.

Rujukan resmi: [Better Auth PostgreSQL v1.6](https://better-auth.com/docs/1.6/adapters/postgresql), [Admin plugin v1.6](https://better-auth.com/docs/1.6/plugins/admin), [Magic Link v1.6](https://better-auth.com/docs/1.6/plugins/magic-link), [User & Accounts v1.6](https://better-auth.com/docs/1.6/concepts/users-accounts).

## Output mentah Verify terakhir

Command Verify: `npm run test -- auth-spike`, dijalankan melalui npm CLI di bawah Node `24.22.2`; URL Neon ditangkap dari `neon connection-string` dan tidak ditampilkan.

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-spike

TAP version 13
# Subtest: Owner and Staff invitation scope follows the RumaKost role contract
ok 1 - Owner and Staff invitation scope follows the RumaKost role contract
  ---
  duration_ms: 3.0416
  ...
# Subtest: account deactivation cannot affect a role above the actor scope
ok 2 - account deactivation cannot affect a role above the actor scope
  ---
  duration_ms: 0.3191
  ...
# Subtest: only Owner may initiate a target account email change
ok 3 - only Owner may initiate a target account email change
  ---
  duration_ms: 0.2337
  ...
# Subtest: email mirror stays unchanged until provider confirms the requested address
ok 4 - email mirror stays unchanged until provider confirms the requested address
  ---
  duration_ms: 2.6136
  ...
# Subtest: verified target email updates mirror while preserving auth subject and retry result
ok 5 - verified target email updates mirror while preserving auth subject and retry result
  ---
  duration_ms: 1.3414
  ...
# Subtest: email mirror ignores a different auth subject or a different verified address
ok 6 - email mirror ignores a different auth subject or a different verified address
  ---
  duration_ms: 0.2927
  ...
# Subtest: Better Auth account lifecycle on the disposable Neon project
    # Subtest: provider schema is applied to Neon PostgreSQL
    ok 1 - provider schema is applied to Neon PostgreSQL
      ---
      duration_ms: 1.3123
      ...
    # Subtest: public signup is disabled; server-side invitations assign only permitted roles
    ok 2 - public signup is disabled; server-side invitations assign only permitted roles
      ---
      duration_ms: 0.7438
      ...
    # Subtest: provider-generated email links authenticate pre-provisioned accounts without temporary passwords
    ok 3 - provider-generated email links authenticate pre-provisioned accounts without temporary passwords
      ---
      duration_ms: 0.4982
      ...
    # Subtest: email and mirror change only after the provider verifies the requested address
    ok 4 - email and mirror change only after the provider verifies the requested address
      ---
      duration_ms: 1.5744
      ...
    # Subtest: permitted deactivation bans the account and revokes its existing sessions
    ok 5 - permitted deactivation bans the account and revokes its existing sessions
      ---
      duration_ms: 0.1941
      ...
    # Subtest: provider default email-change endpoint is session-scoped
    ok 6 - provider default email-change endpoint is session-scoped
      ---
      duration_ms: 35.1675
      ...
    1..6
ok 7 - Better Auth account lifecycle on the disposable Neon project
  ---
  duration_ms: 3757.7753
  ...
1..7
# tests 13
# suites 0
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 7257.0644
```

Disposable cleanup: `neon projects delete crimson-smoke-55337414` returned the project name/ID; subsequent `neon projects list --org-id org-bold-paper-24268339 --output json` showed only `rumakost` (`floral-wind-91503829`).
