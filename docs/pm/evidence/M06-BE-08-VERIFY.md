# Raw Verify M06-BE-08 (2026-11-03)

HEAD: `64ac893`

Command: `npm run test -- payment-ledger`

Exit code: `0`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs payment-ledger

TAP version 13
# Subtest: Owner may verify their own claim and allocations use RENT before DEPOSIT
ok 1 - Owner may verify their own claim and allocations use RENT before DEPOSIT
  ---
  duration_ms: 7.6064
  ...
# Subtest: allocation fills outstanding RENT before DEPOSIT after earlier verified payments
ok 2 - allocation fills outstanding RENT before DEPOSIT after earlier verified payments
  ---
  duration_ms: 0.8395
  ...
# Subtest: only Owner may verify or reject a payment
ok 3 - only Owner may verify or reject a payment
  ---
  duration_ms: 1.1456
  ...
# Subtest: rejection requires a reason and rejected payments cannot be verified or reversed
ok 4 - rejection requires a reason and rejected payments cannot be verified or reversed
  ---
  duration_ms: 4.233
  ...
# Subtest: concurrent verification serializes invoice balance and rejects an overpayment race
ok 5 - concurrent verification serializes invoice balance and rejects an overpayment race
  ---
  duration_ms: 0.9177
  ...
# Subtest: full reversal compensates deposit and replay creates only one audit
ok 6 - full reversal compensates deposit and replay creates only one audit
  ---
  duration_ms: 1.2233
  ...
# Subtest: reversal fails atomically when escrow is reserved
ok 7 - reversal fails atomically when escrow is reserved
  ---
  duration_ms: 0.6774
  ...
# Subtest: audit failure rolls back verification and leaves no allocations or idempotency record
ok 8 - audit failure rolls back verification and leaves no allocations or idempotency record
  ---
  duration_ms: 0.7453
  ...
# Subtest: reusing an idempotency key with different rejection content conflicts
ok 9 - reusing an idempotency key with different rejection content
  ---
  duration_ms: 1.0774
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 259.1911
```
