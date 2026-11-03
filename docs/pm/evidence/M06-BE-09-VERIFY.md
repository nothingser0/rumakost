# Raw Verify M06-BE-09 (2026-11-03)

HEAD: `cdd8bb4`

Command: `npm run test -- deposits`

Exit code: `0`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs deposits

TAP version 13
# Subtest: Tenant hanya dapat meminta check-out Lease miliknya dan retry tidak menggandakan event
ok 1 - Tenant hanya dapat meminta check-out Lease miliknya dan retry tidak menggandakan event
  ---
  duration_ms: 10.9102
  ...
# Subtest: permintaan check-out ditolak jika tanggal invalid atau sudah ada permintaan pending
ok 2 - permintaan check-out ditolak jika tanggal invalid atau sudah ada permintaan pending
  ---
  duration_ms: 1.1861
  ...
# Subtest: Owner dapat menolak permintaan tanpa mengakhiri kontrak dan tidak dapat meninjau ulang
ok 3 - Owner dapat menolak permintaan tanpa mengakhiri kontrak dan tidak dapat meninjau ulang
  ---
  duration_ms: 2.37
  ...
# Subtest: persetujuan Owner mengakhiri Lease pada tanggal aktual dan membebaskan Room
ok 4 - persetujuan Owner mengakhiri Lease pada tanggal aktual dan membebaskan Room
  ---
  duration_ms: 0.9375
  ...
# Subtest: Owner mengakhiri Lease langsung hanya dengan tanggal aktual yang valid
ok 5 - Owner mengakhiri Lease langsung hanya dengan tanggal aktual yang valid
  ---
  duration_ms: 1.8889
  ...
# Subtest: settlement deposit mengurangi saldo line RENT dan escrow secara atomik serta idempotent
ok 6 - settlement deposit mengurangi saldo line RENT dan escrow secara atomik serta idempotent
  ---
  duration_ms: 2.7894
  ...
# Subtest: settlement menolak nominal di atas saldo sewa dan saldo escrow serta role bukan Owner
ok 7 - settlement menolak nominal di atas saldo sewa dan saldo escrow serta role bukan Owner
  ---
  duration_ms: 1.6603
  ...
# Subtest: rekonsiliasi hanya setelah Lease selesai; refund pending dicadangkan hingga dibayar atau ditolak
ok 8 - rekonsiliasi hanya setelah Lease selesai; refund pending dicadangkan hingga dibayar atau ditolak
  ---
  duration_ms: 5.2414
  ...
# Subtest: saldo tersedia memperhitungkan reversal dan seluruh escrow yang terpakai/direservasi
ok 9 - saldo tersedia memperhitungkan reversal dan seluruh escrow yang terpakai/direservasi
  ---
  duration_ms: 1.2943
  ...
# Subtest: dua settlement bersamaan tidak dapat memakai escrow yang sama
ok 10 - dua settlement bersamaan tidak dapat memakai escrow yang sama
  ---
  duration_ms: 1.1485
  ...
# Subtest: kegagalan audit membatalkan ledger dan idempotency
ok 11 - kegagalan audit membatalkan ledger dan idempotency
  ---
  duration_ms: 0.7082
  ...
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 277.0325
```
