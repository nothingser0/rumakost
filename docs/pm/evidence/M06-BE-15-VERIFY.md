# M06-BE-15 Verify

- Tanggal: 2026-11-03
- Perintah: `npm run test -- dashboard-activity`
- Hasil: PASS, 10 lulus, 0 gagal.
- Cakupan: agregat okupansi/status tiket/kolektibilitas, finance Owner-only, tanggal periode Jakarta, hak akses dashboard dan feed, deep link, empty state, pagination, batas privacy, serta kontrak query repository.
- Batas: fixture sintetis dan source-contract checks; tidak membuka Neon atau `.env.local` dan tidak mengeksekusi query SQL pada PostgreSQL hidup. Hasil ini tidak menyatakan verifikasi integrasi DB.

Output mentah:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs dashboard-activity

TAP version 13
# Subtest: dashboard facts summarize occupancy including maintenance capacity and current ticket statuses
ok 1 - dashboard facts summarize occupancy including maintenance capacity and current ticket statuses
  ---
  duration_ms: 5.7363
  ...
# Subtest: rent collection uses the selected invoice cohort and exact decimal arithmetic
ok 2 - rent collection uses the selected invoice cohort and exact decimal arithmetic
  ---
  duration_ms: 1.9691
  ...
# Subtest: Owner dashboard includes cash flow, collection, and an unset budget
ok 3 - Owner dashboard includes cash flow, collection, and an unset budget
  ---
  duration_ms: 30.3866
  ...
# Subtest: Staff dashboard never calls the finance repository or returns finance fields
ok 4 - Staff dashboard never calls the finance repository or returns finance fields
  ---
  duration_ms: 1.0055
  ...
# Subtest: Tenant and inactive or forced-change actors cannot request an internal dashboard
ok 5 - Tenant and inactive or forced-change actors cannot request an internal dashboard
  ---
  duration_ms: 0.6625
  ...
# Subtest: period uses Jakarta dates, closes historical months, and rejects future months
ok 6 - period uses Jakarta dates, closes historical months, and rejects future months
  ---
  duration_ms: 1.5607
  ...
# Subtest: activity feed filters Staff events, maps deep links, and returns a keyset cursor
ok 7 - activity feed filters Staff events, maps deep links, and returns a keyset cursor
  ---
  duration_ms: 6.4748
  ...
# Subtest: activity empty state, role scope, and invalid ownership are enforced
ok 8 - activity empty state, role scope, and invalid ownership are enforced
  ---
  duration_ms: 1.3216
  ...
# Subtest: activity deep links point to the owning domain pages
ok 9 - activity deep links point to the owning domain pages
  ---
  duration_ms: 0.792
  ...
# Subtest: repository queries apply financial, role, time, deduplication, and privacy boundaries
ok 10 - repository queries apply financial, role, time, deduplication, and privacy boundaries
  ---
  duration_ms: 3.636
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 300.0242
```
