# Evidence M06-BE-18 — Provision akun dan offboarding Staff (2026-11-03)

Status: Verify PASS 7/7. Email live belum diuji; adapter saat ini tetap fake/tidak dikonfigurasi sesuai batas M07.

## Hasil

- Provision akun Owner/Staff menggunakan email aktivasi Better Auth melalui alur reset sandi. Password, token, dan tautan tidak dikembalikan ke state UI. Signup publik tetap dimatikan.
- Akun baru dibuat belum terverifikasi dan `mustChangePassword` tidak memblokir akun baru. Better Auth menolak sesi sampai password reset melalui tautan email berhasil; setelah reset, email ditandai terverifikasi.
- Staff hanya dapat membuat/melihat/mengelola Tenant; Owner dapat mengelola Staff dan Tenant. Tenant tidak dapat mengelola akun.
- Pengiriman yang gagal dapat dicoba ulang dengan input yang sama tanpa menggandakan akun atau audit pembuatan.
- Penonaktifan Staff ditolak selama ada tiket aktif yang ditugaskan. Owner dapat mengalihkan seluruh tiket ke Owner/Staff aktif; tiap perpindahan menyimpan `TICKET_ASSIGNMENT_TRANSFERRED` pada AuditEvent dalam transaksi yang sama. Retry tidak menggandakan event. Penonaktifan mencabut sesi Better Auth.
- Filter role dan email terverifikasi diterapkan di server; halaman akun menampilkan status aktivasi dan kontrol alih tugas.
- Verify memakai repository fake. Tidak ada Neon branch/database, akun nyata, `.env.local`, atau pengiriman email live yang disentuh.

## Output mentah Verify

Command: `npm run test -- account-lifecycle`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs account-lifecycle

TAP version 13
# Subtest: Owner creates Staff/Tenant and Staff creates only Tenant through activation email
ok 1 - Owner creates Staff/Tenant and Staff creates only Tenant through activation email
  ---
  duration_ms: 4.077
  ...
# Subtest: Staff cannot create Staff, Tenant cannot manage accounts, and account visibility follows role
ok 2 - Staff cannot create Staff, Tenant cannot manage accounts, and account visibility follows role
  ---
  duration_ms: 0.6241
  ...
# Subtest: activation email failure is retryable without duplicate account or audit records
ok 3 - activation email failure is retryable without duplicate account or audit records
  ---
  duration_ms: 0.5819
  ...
# Subtest: Better Auth blocks unverified sessions and activates an account only after password reset
ok 4 - Better Auth blocks unverified sessions and activates an account only after password reset
  ---
  duration_ms: 3.3406
  ...
# Subtest: assigned active tickets block Staff deactivation until Owner transfers them
ok 5 - assigned active tickets block Staff deactivation until Owner transfers them
  ---
  duration_ms: 1.2888
  ...
# Subtest: ticket transfer requires Owner and an active Owner/Staff target
ok 6 - ticket transfer requires Owner and an active Owner/Staff target
  ---
  duration_ms: 0.295
  ...
# Subtest: ticket assignment and its audit history roll back together if audit persistence fails
ok 7 - ticket assignment and its audit history roll back together if audit persistence fails
  ---
  duration_ms: 0.9773
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 691.8239
EXIT_CODE=0
```
