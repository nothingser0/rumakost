# Raw Verify M06-BE-10 (2026-11-03)

HEAD: `b6fadbd`

Command: `npm run test -- reports`

Exit code: `0`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs reports

TAP version 13
# Subtest: Owner and Staff can record Expense once with an idempotent retry
ok 1 - Owner and Staff can record Expense once with an idempotent retry
  ---
  duration_ms: 8.7216
  ...
# Subtest: Expense input requires a positive amount, nonblank text, and a real date
ok 2 - Expense input requires a positive amount, nonblank text, and a real date
  ---
  duration_ms: 3.3953
  ...
# Subtest: Tenant cannot record Expense; Staff cannot reverse Expense
ok 3 - Tenant cannot record Expense; Staff cannot reverse Expense
  ---
  duration_ms: 0.6006
  ...
# Subtest: Owner reversal is full, append-only, reasoned, and idempotent
ok 4 - Owner reversal is full, append-only, reasoned, and idempotent
  ---
  duration_ms: 1.7159
  ...
# Subtest: Owner can set one positive monthly budget and the operation audits each update
ok 5 - Owner can set one positive monthly budget and the operation audits each update
  ---
  duration_ms: 1.8569
  ...
# Subtest: Owner report filters period, excludes deposit and pending money, and reconciles net cash
ok 6 - Owner report filters period, excludes deposit and pending money, and reconciles net cash
  ---
  duration_ms: 4.2307
  ...
# Subtest: unconfigured monthly budget stays distinct from zero and reports empty actuals as zero
ok 7 - unconfigured monthly budget stays distinct from zero and reports empty actuals as zero
  ---
  duration_ms: 0.6197
  ...
# Subtest: Staff and Tenant receive no financial report payload
ok 8 - Staff and Tenant receive no financial report payload
  ---
  duration_ms: 0.9503
  ...
1..8
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 273.8833
```
