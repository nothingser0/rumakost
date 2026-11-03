# M06-BE-13 Verify

- Tanggal: 2026-11-03
- Perintah: `npm run test -- audit`
- Hasil: PASS, 6 lulus, 0 gagal.
- Cakupan: audit action crosswalk, kolom actor/action/entity/time, allowlist metadata, kode alasan tetap, no-op/replay, serta keberadaan regresi rollback dan retry provider.
- Verifikasi ini memakai pemeriksaan source dan fixture test; tidak membuka koneksi Neon dan tidak membuktikan rollback SQL terhadap PostgreSQL hidup. Pemeriksaan transaksi Neon disposable tetap menjadi bagian dari task integrasi/tes yang sesuai.
- Alasan void invoice disimpan di audit sebagai kode tetap `OWNER_REQUESTED_VOID`; teks bebas tidak disimpan karena model Invoice saat ini tidak memiliki field alasan void khusus. Operasi lain yang memiliki field alasan domain tetap menyimpan alasan pada entitas terkait dan tidak menyalinnya ke AuditEvent.

Output mentah:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs audit

TAP version 13
# Subtest: sensitive mutation paths have an explicit audit action
ok 1 - sensitive mutation paths have an explicit audit action
  ---
  duration_ms: 17.6641
  ...
# Subtest: SQL audit inserts identify actor, action, entity, and occurrence time
ok 2 - SQL audit inserts identify actor, action, entity, and occurrence time
  ---
  duration_ms: 11.3705
  ...
# Subtest: audit metadata omits direct identifiers, credentials, content, and storage keys
ok 3 - audit metadata omits direct identifiers, credentials, content, and storage keys
  ---
  duration_ms: 12.7159
  ...
# Subtest: free-form reasons stay on domain records and audit stores fixed reason codes
ok 4 - free-form reasons stay on domain records and audit stores fixed reason codes
  ---
  duration_ms: 8.5036
  ...
# Subtest: replayed state changes do not create duplicate audit events
ok 5 - replayed state changes do not create duplicate audit events
  ---
  duration_ms: 4.9964
  ...
# Subtest: local audit rollback and provider retry regression cases remain covered
ok 6 - local audit rollback and provider retry regression cases remain covered
  ---
  duration_ms: 4.3193
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 189.2922
```
