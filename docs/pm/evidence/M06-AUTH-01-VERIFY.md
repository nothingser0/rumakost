# Evidence M06-AUTH-01 — Perubahan email login akun target (2026-11-03)

Status: Verify PASS; ditutup sesuai delegasi Owner 2026-11-03.

## Cakupan

- Hanya Owner aktif dapat memulai perubahan email untuk akun Staff atau Tenant. Email dinormalisasi dan diperiksa pada `AppUser` serta identitas Better Auth tanpa mengungkap data ke UI.
- Tautan memakai token HMAC yang terikat ke target dan `requestId`; token tidak memuat alamat email dan tidak disimpan mentah. State pending berada di tabel `Verification` dengan masa berlaku 24 jam.
- Email Better Auth dan `AppUser.emailNormalized` berubah di transaksi PostgreSQL yang sama setelah token valid. `authSubject` tidak berubah. Uniqueness, row lock, audit atomik, replay idempotent, supersede, kedaluwarsa, dan pengiriman ulang setelah email gagal ditangani.
- Audit hanya menyimpan aktor, aksi, entitas, alasan tetap, dan `requestId`. Email dan token tidak disimpan di metadata audit; alamat pending dihapus dari Verification setelah selesai.
- Email memakai adapter fake dalam Verify. Live delivery tetap M07; tidak ada Neon, akun nyata, deployment, atau `.env.local` yang disentuh.

## Output mentah Verify

Command: `npm run test -- auth-email-change`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-email-change

TAP version 13
# Subtest: only an active Owner can start login email changes for a Staff or Tenant account
ok 1 - only an active Owner can start login email changes for a Staff or Tenant account
  ---
  duration_ms: 5.9002
  ...
# Subtest: email delivery failure is retryable with the same token and a single request audit
ok 2 - email delivery failure is retryable with the same token and a single request audit
  ---
  duration_ms: 1.8791
  ...
# Subtest: duplicate application or provider emails are rejected without sending or recording an audit
ok 3 - duplicate application or provider emails are rejected without sending or recording an audit
  ---
  duration_ms: 0.6994
  ...
# Subtest: identity and AppUser mirror change only after a valid token and keep authSubject stable
ok 4 - identity and AppUser mirror change only after a valid token and keep authSubject stable
  ---
  duration_ms: 3.9002
  ...
# Subtest: completion replay is idempotent and does not duplicate the audit event
ok 5 - completion replay is idempotent and does not duplicate the audit event
  ---
  duration_ms: 2.7202
  ...
# Subtest: expired, superseded, and conflicting requests do not partially update either identity
ok 6 - expired, superseded, and conflicting requests do not partially update either identity
  ---
  duration_ms: 2.3783
  ...
# Subtest: request and completion audit failures roll back pending state and identity writes
ok 7 - request and completion audit failures roll back pending state and identity writes
  ---
  duration_ms: 2.3884
  ...
# Subtest: the signed token binds to the requested target and rejects malformed input
ok 8 - the signed token binds to the requested target and rejects malformed input
  ---
  duration_ms: 0.5929
  ...
1..8
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 153.6283
```
