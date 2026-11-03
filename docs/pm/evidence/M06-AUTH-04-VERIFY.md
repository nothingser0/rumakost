# Evidence M06-AUTH-04 — Kontrak Better Auth + Neon PostgreSQL

Tanggal: 2026-11-03
Status: Verify PASS 3/3; Approved: 2026-11-03 by zeenn.

## Hasil

- Owner memilih Better Auth self-hosted dengan Neon PostgreSQL untuk runtime Auth aplikasi. Neon Auth managed diganti; database Prisma/Neon, Neon private Object Storage, Vercel Hobby, dan tanpa upgrade berbayar tetap.
- Scope Statement mencatat CR-2026-003 tanpa mengubah tujuh P0. FSD, PRD, M05 Data API, ADR, arsitektur, project state, TODO, `.env.example`, dan runbook kini menyatakan keputusan serta batas migrasi.
- Password melewati HTTPS ke endpoint Better Auth dan di-hash oleh Better Auth. Domain aplikasi tidak menyimpan, mengembalikan, atau mencatat password mentah maupun token.
- Pengiriman email memerlukan adapter server. Vendor belum dipilih dan uji live tetap di M07.
- M06-AUTH-05 menjadi prasyarat M06-BE-18 dan M06-AUTH-01. BE-13 menunggu keduanya; BE-15 menunggu BE-13.
- Kode runtime, `.env.local`, deployment, akun nyata, dan branch/database Neon aktif tidak disentuh.

## Output mentah Verify terakhir

Command: `npm run test -- auth-architecture-contract`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-architecture-contract

TAP version 13
# Subtest: selected Better Auth architecture is reflected in the active contracts
ok 1 - selected Better Auth architecture is reflected in the active contracts
  ---
  duration_ms: 5.8898
  ...
# Subtest: password, email, and provider boundaries remain explicit
ok 2 - password, email, and provider boundaries remain explicit
  ---
  duration_ms: 2.0331
  ...
# Subtest: Auth migration gates the remaining dependent BE tasks
ok 3 - Auth migration gates the remaining dependent BE tasks
  ---
  duration_ms: 6.1708
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 143.5088
```

Dua run awal mendapati regex Verify tidak mengikuti istilah status dan format rentang dependency TODO; assertion diperbaiki sebelum run terakhir. Tidak ada perubahan aplikasi atau provider pada run tersebut.
