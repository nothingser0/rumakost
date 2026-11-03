# Raw Verify M06-BE-14 (2026-11-03)

## Unit and SQL contract tests

Command: `npm run test -- data-boundaries`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs data-boundaries

TAP version 13
# Subtest: room list returns a bounded page with a cursor from the last included row
ok 1 - room list returns a bounded page with a cursor from the last included row
  ---
  duration_ms: 5.3074
  ...
# Subtest: floor list returns a bounded page with a cursor from the last included row
ok 2 - floor list returns a bounded page with a cursor from the last included row
  ---
  duration_ms: 1.3004
  ...
# Subtest: invoice and ticket lists use the same bounded page contract and pass authenticated scope
ok 3 - invoice and ticket lists use the same bounded page contract and pass authenticated scope
  ---
  duration_ms: 6.0751
  ...
# Subtest: all four lists default to 20 rows and accept the capped page size of 100
ok 4 - all four lists default to 20 rows and accept the capped page size of 100
  ---
  duration_ms: 27.3832
  ...
# Subtest: cursor values continue each list without repeating the previous page boundary
ok 5 - cursor values continue each list without repeating the previous page boundary
  ---
  duration_ms: 3.5712
  ...
# Subtest: each domain list issues one repository call per page
ok 6 - each domain list issues one repository call per page
  ---
  duration_ms: 0.6892
  ...
# Subtest: Room, Invoice, and Ticket detail reads each use one scoped repository call
ok 7 - Room, Invoice, and Ticket detail reads each use one scoped repository call
  ---
  duration_ms: 5.2049
  ...
# Subtest: all list inputs reject unsafe filter and sort fields before repository access
ok 8 - all list inputs reject unsafe filter and sort fields before repository access
  ---
  duration_ms: 3.8923
  ...
# Subtest: inactive and forced-password-change actors cannot reach any list repository
ok 9 - inactive and forced-password-change actors cannot reach any list repository
  ---
  duration_ms: 2.2133
  ...
# Subtest: report date filters require real dates in ascending order before querying
ok 10 - report date filters require real dates in ascending order before querying
  ---
  duration_ms: 3.7862
  ...
# Subtest: repository list SQL scopes rows before page limits and uses stable indexed ordering
ok 11 - repository list SQL scopes rows before page limits and uses stable indexed ordering
  ---
  duration_ms: 14.6446
  ...
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 341.0328
EXIT_CODE=0
```

## Neon disposable migration and index probe

Command: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-data-boundaries-disposable-verification.ps1 -ProjectId <project-id> -BranchName rumakost-be14-20261103`

The wrapper created a fresh child branch from `dev`, applied the complete 39-migration chain, inspected the index catalog and PostgreSQL order plans, then deleted the disposable branch. The first run applied the migrations but exposed a syntax typo in the new probe script; that branch was deleted. After correcting the typo, the complete rerun passed:

```text
SOURCE_BRANCH=dev
DISPOSABLE_BRANCH_READY=true
BRANCH_TARGET_SAFE=true
Loaded Prisma config from prisma.config.data-boundaries-disposable.ts.
System.Management.Automation.RemoteException
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-lingering-hall-b3t1vdzu.c-4.ap-southeast-1.aws.neon.tech"

39 migrations found in prisma/migrations

Applying migration `20261101125000_restore_tenant_profile_if_missing`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`
Applying migration `20261101180000_payment`
Applying migration `20261101190000_payment_allocation`
Applying migration `20261101200000_deposit_ledger_entry`
Applying migration `20261101210000_payment_reversal`
Applying migration `20261101220000_expense`
Applying migration `20261101230000_ticket`
Applying migration `20261101240000_ticket_comment`
Applying migration `20261101250000_ticket_attachment`
Applying migration `20261101260000_audit_event`
Applying migration `20261101270000_ticket_attachment_comment_ticket_index`
Applying migration `20261101280000_tenant_active_period`
Applying migration `20261101290000_room_type`
Applying migration `20261101300000_room_dimensions`
Applying migration `20261101310000_operating_budget`
Applying migration `20261101320000_room_floor_lifecycle`
Applying migration `20261101330000_wf03_room_operational_rules`
Applying migration `20261101340000_wf04_profile_contract_escrow_integrity`
Applying migration `20261101350000_wf05_financial_integrity`
Applying migration `20261101360000_deposit_collection_reversal`
Applying migration `20261101370000_wf05_invoice_consistency_guards`
Applying migration `20261101380000_payment_rejection_reason_method`
Applying migration `20261101390000_wf07_expense_integrity`
Applying migration `20261101400000_wf08_ticket_integrity`
Applying migration `20261101410000_app_user_email_canonical`
Applying migration `20261101420000_lease_end_request_tenant_guard`
Applying migration `20261101430000_ticket_draft_category_enums`
Applying migration `20261101440000_ticket_draft_media_submission`
Applying migration `20261101450000_ticket_status_event_actor_type`
Applying migration `20261102100000_ticket_system_draft_expiry`
Applying migration `20261103100000_ticket_mov_media`
Applying migration `20261103120000_list_query_indexes`

All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
ROOM_CODE_ORDER_INDEX=PASS
FLOOR_NORMALIZED_NAME_ORDER_INDEX=PASS
INVOICE_DUE_ON_ID_INDEX=PASS
TICKET_CREATED_AT_ID_INDEX=PASS
INVOICE_ORDER_PLAN_USES_INDEX=PASS
TICKET_ORDER_PLAN_USES_INDEX=PASS
INDEX_AND_ORDER_PLAN_CHECKS=6/6
INDEX_PROBE_EXIT_CODE=0
DISPOSABLE_BRANCH_DELETED=true
ONLY_SOURCE_BRANCH_REMAINS=True
EXIT_CODE=0
```

Tidak ada migration yang diterapkan ke branch `dev`. URL koneksi tidak dicatat. Hasil ini hanya mencakup query dan indeks yang menjadi scope M06-BE-14; integrasi Neon runtime berada di M06-INT-01.
