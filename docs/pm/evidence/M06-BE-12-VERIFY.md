# Raw Verify M06-BE-12 (2026-11-03)

## Unit test

Command: `npm run test -- ticket-media`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs ticket-media

TAP version 13
# Subtest: policy constants match the frozen photo, video, ticket, project, and rate limits
ok 1 - policy constants match the frozen photo, video, ticket, project, and rate limits
  ---
  duration_ms: 1.3293
  ...
# Subtest: metadata accepts JPEG/PNG/WebP and MP4/MOV with their size and duration boundaries
ok 2 - metadata accepts JPEG/PNG/WebP and MP4/MOV with their size and duration boundaries
  ---
  duration_ms: 1.3077
  ...
# Subtest: signature detection distinguishes JPEG, PNG, WebP, MP4, MOV, and malformed containers
ok 3 - signature detection distinguishes JPEG, PNG, WebP, MP4, MOV, and malformed containers
  ---
  duration_ms: 2.9363
  ...
# Subtest: stored objects must match actual signature, declared MIME, size, and video duration
ok 4 - stored objects must match actual signature, declared MIME, size, and video duration
  ---
  duration_ms: 1.9239
  ...
# Subtest: upload intent checks ticket, comment, batch, limits, and rate/quota errors before returning opaque IDs
ok 5 - upload intent checks ticket, comment, batch, limits, and rate/quota errors before returning opaque IDs
  ---
  duration_ms: 9.8328
  ...
# Subtest: finalize only marks verified bytes AVAILABLE, keeps early retries open, and queues invalid content
ok 6 - finalize only marks verified bytes AVAILABLE, keeps early retries open, and queues invalid content
  ---
  duration_ms: 1.5606
  ...
# Subtest: download URLs are short-lived and never return storage keys
ok 7 - download URLs are short-lived and never return storage keys
  ---
  duration_ms: 1.1716
  ...
# Subtest: media routes enforce Origin, auth, bounded JSON, error codes, and private response headers
ok 8 - media routes enforce Origin, auth, bounded JSON, error codes, and private response headers
  ---
  duration_ms: 40.6723
  ...
# Subtest: cleanup honors draft and 365-day deadlines and retries failed object deletion
ok 9 - cleanup honors draft and 365-day deadlines and retries failed object deletion
  ---
  duration_ms: 2.4391
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 322.1325
```

## Neon disposable migration and repository probe

The wrapper created a new database on a non-default Neon branch, applied the 38-migration chain, ran the SQL probe, and emitted no connection URL or credentials.

```text
Loaded Prisma config from prisma.config.media-disposable.ts.
System.Management.Automation.RemoteException
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "m06be12review", schema "public" at "ep-old-silence-b34039e2.c-4.ap-southeast-1.aws.neon.tech"

38 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101125000_restore_tenant_profile_if_missing/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql
  └─ 20261101150000_lease_end_request/
    └─ migration.sql
  └─ 20261101160000_invoice/
    └─ migration.sql
  └─ 20261101170000_invoice_line/
    └─ migration.sql
  └─ 20261101180000_payment/
    └─ migration.sql
  └─ 20261101190000_payment_allocation/
    └─ migration.sql
  └─ 20261101200000_deposit_ledger_entry/
    └─ migration.sql
  └─ 20261101210000_payment_reversal/
    └─ migration.sql
  └─ 20261101220000_expense/
    └─ migration.sql
  └─ 20261101230000_ticket/
    └─ migration.sql
  └─ 20261101240000_ticket_comment/
    └─ migration.sql
  └─ 20261101250000_ticket_attachment/
    └─ migration.sql
  └─ 20261101260000_audit_event/
    └─ migration.sql
  └─ 20261101270000_ticket_attachment_comment_ticket_index/
    └─ migration.sql
  └─ 20261101280000_tenant_active_period/
    └─ migration.sql
  └─ 20261101290000_room_type/
    └─ migration.sql
  └─ 20261101300000_room_dimensions/
    └─ migration.sql
  └─ 20261101310000_operating_budget/
    └─ migration.sql
  └─ 20261101320000_room_floor_lifecycle/
    └─ migration.sql
  └─ 20261101330000_wf03_room_operational_rules/
    └─ migration.sql
  └─ 20261101340000_wf04_profile_contract_escrow_integrity/
    └─ migration.sql
  └─ 20261101350000_wf05_financial_integrity/
    └─ migration.sql
  └─ 20261101360000_deposit_collection_reversal/
    └─ migration.sql
  └─ 20261101370000_wf05_invoice_consistency_guards/
    └─ migration.sql
  └─ 20261101380000_payment_rejection_reason_method/
    └─ migration.sql
  └─ 20261101390000_wf07_expense_integrity/
    └─ migration.sql
  └─ 20261101400000_wf08_ticket_integrity/
    └─ migration.sql
  └─ 20261101410000_app_user_email_canonical/
    └─ migration.sql
  └─ 20261101420000_lease_end_request_tenant_guard/
    └─ migration.sql
  └─ 20261101430000_ticket_draft_category_enums/
    └─ migration.sql
  └─ 20261101440000_ticket_draft_media_submission/
    └─ migration.sql
  └─ 20261101450000_ticket_status_event_actor_type/
    └─ migration.sql
  └─ 20261102100000_ticket_system_draft_expiry/
    └─ migration.sql
  └─ 20261103100000_ticket_mov_media/
    └─ migration.sql

All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
MOV_MIGRATION_ALREADY_APPLIED=true
IDEMPOTENCY_COLUMNS=key,operation,response_code,response_payload,completed_at,created_at
REPOSITORY_UPLOAD_INTENT_SQL=PASS
REPOSITORY_UPLOAD_INTENT_REPLAY=PASS
REPOSITORY_FINALIZE_ACCESS_SQL=PASS
REPOSITORY_FINALIZE_SQL=PASS
REPOSITORY_FINALIZE_REPLAY=PASS
REPOSITORY_ATTACHMENT_ACCESS_SQL=PASS
REPOSITORY_SQL_CHECKS=6/6
MOV_12_MIB_30S_ACCEPTED=PASS
MP4_12_MIB_30S_ACCEPTED=PASS
MOV_OVER_12_MIB_REJECTED=PASS
MOV_OVER_30S_REJECTED=PASS
MOV_DURATION_REQUIRED=PASS
UNSUPPORTED_VIDEO_MIME_REJECTED=PASS
MP4_AND_MOV_SHARE_ONE_VIDEO_BATCH_LIMIT=PASS
FOUR_PHOTOS_AND_ONE_MOV_BATCH_ACCEPTED=PASS
FIFTH_PHOTO_IN_BATCH_REJECTED=PASS
MIGRATION_CATALOG=PASS
MIGRATION_AND_REPOSITORY_CHECKS=16/16
MIGRATION_PROBE_EXIT_CODE=0
```

Branch deletion verification:

```text
ERROR: Branch rumakost-be12-verify-final-20261103 not found.
Available branches: dev
EXIT_CODE=1
```

## Rerun after direct cleanup SQL probe (2026-11-03)

Local Verify:

```text
npm run test -- ticket-media

> rumakost@0.1.0 test
> node scripts/run-tests.mjs ticket-media

TAP version 13
# Subtest: policy constants match the frozen photo, video, ticket, project, and rate limits
ok 1 - policy constants match the frozen photo, video, ticket, project, and rate limits
  ---
  duration_ms: 1.2804
  ...
# Subtest: metadata accepts JPEG/PNG/WebP and MP4/MOV with their size and duration boundaries
ok 2 - metadata accepts JPEG/PNG/WebP and MP4/MOV with their size and duration boundaries
  ---
  duration_ms: 1.2119
  ...
# Subtest: signature detection distinguishes JPEG, PNG, WebP, MP4, MOV, and malformed containers
ok 3 - signature detection distinguishes JPEG, PNG, WebP, MP4, MOV, and malformed containers
  ---
  duration_ms: 3.5344
  ...
# Subtest: stored objects must match actual signature, declared MIME, size, and video duration
ok 4 - stored objects must match actual signature, declared MIME, size, and video duration
  ---
  duration_ms: 2.041
  ...
# Subtest: upload intent checks ticket, comment, batch, limits, and rate/quota errors before returning opaque IDs
ok 5 - upload intent checks ticket, comment, batch, limits, and rate/quota errors before returning opaque IDs
  ---
  duration_ms: 10.1737
  ...
# Subtest: finalize only marks verified bytes AVAILABLE, keeps early retries open, and queues invalid content
ok 6 - finalize only marks verified bytes AVAILABLE, keeps early retries open, and queues invalid content
  ---
  duration_ms: 1.7436
  ...
# Subtest: download URLs are short-lived and never return storage keys
ok 7 - download URLs are short-lived and never return storage keys
  ---
  duration_ms: 1.2444
  ...
# Subtest: media routes enforce Origin, auth, bounded JSON, error codes, and private response headers
ok 8 - media routes enforce Origin, auth, bounded JSON, error codes, and private response headers
  ---
  duration_ms: 34.6291
  ...
# Subtest: cleanup honors draft and 365-day deadlines and retries failed object deletion
ok 9 - cleanup honors draft and 365-day deadlines and retries failed object deletion
  ---
  duration_ms: 1.2487
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 301.9933
EXIT_CODE=0
```

Neon disposable Verify command:

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-ticket-media-disposable-verification.ps1 -ProjectId floral-wind-91503829 -BranchName rumakost-be12-cleanup-20261103 -DatabaseName m06be12cleanup -CreateDatabase
BRANCH_TARGET_SAFE=true
DISPOSABLE_DATABASE_CREATED=true
Loaded Prisma config from prisma.config.media-disposable.ts.
System.Management.Automation.RemoteException
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "m06be12cleanup", schema "public" at "ep-dawn-queen-b3hb0grw.c-4.ap-southeast-1.aws.neon.tech"

38 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101125000_restore_tenant_profile_if_missing/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql
  └─ 20261101150000_lease_end_request/
    └─ migration.sql
  └─ 20261101160000_invoice/
    └─ migration.sql
  └─ 20261101170000_invoice_line/
    └─ migration.sql
  └─ 20261101180000_payment/
    └─ migration.sql
  └─ 20261101190000_payment_allocation/
    └─ migration.sql
  └─ 20261101200000_deposit_ledger_entry/
    └─ migration.sql
  └─ 20261101210000_payment_reversal/
    └─ migration.sql
  └─ 20261101220000_expense/
    └─ migration.sql
  └─ 20261101230000_ticket/
    └─ migration.sql
  └─ 20261101240000_ticket_comment/
    └─ migration.sql
  └─ 20261101250000_ticket_attachment/
    └─ migration.sql
  └─ 20261101260000_audit_event/
    └─ migration.sql
  └─ 20261101270000_ticket_attachment_comment_ticket_index/
    └─ migration.sql
  └─ 20261101280000_tenant_active_period/
    └─ migration.sql
  └─ 20261101290000_room_type/
    └─ migration.sql
  └─ 20261101300000_room_dimensions/
    └─ migration.sql
  └─ 20261101310000_operating_budget/
    └─ migration.sql
  └─ 20261101320000_room_floor_lifecycle/
    └─ migration.sql
  └─ 20261101330000_wf03_room_operational_rules/
    └─ migration.sql
  └─ 20261101340000_wf04_profile_contract_escrow_integrity/
    └─ migration.sql
  └─ 20261101350000_wf05_financial_integrity/
    └─ migration.sql
  └─ 20261101360000_deposit_collection_reversal/
    └─ migration.sql
  └─ 20261101370000_wf05_invoice_consistency_guards/
    └─ migration.sql
  └─ 20261101380000_payment_rejection_reason_method/
    └─ migration.sql
  └─ 20261101390000_wf07_expense_integrity/
    └─ migration.sql
  └─ 20261101400000_wf08_ticket_integrity/
    └─ migration.sql
  └─ 20261101410000_app_user_email_canonical/
    └─ migration.sql
  └─ 20261101420000_lease_end_request_tenant_guard/
    └─ migration.sql
  └─ 20261101430000_ticket_draft_category_enums/
    └─ migration.sql
  └─ 20261101440000_ticket_draft_media_submission/
    └─ migration.sql
  └─ 20261101450000_ticket_status_event_actor_type/
    └─ migration.sql
  └─ 20261102100000_ticket_system_draft_expiry/
    └─ migration.sql
  └─ 20261103100000_ticket_mov_media/
    └─ migration.sql

All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
MOV_MIGRATION_ALREADY_APPLIED=true
IDEMPOTENCY_COLUMNS=key,operation,response_code,response_payload,completed_at,created_at
REPOSITORY_UPLOAD_INTENT_SQL=PASS
REPOSITORY_UPLOAD_INTENT_REPLAY=PASS
REPOSITORY_FINALIZE_ACCESS_SQL=PASS
REPOSITORY_FINALIZE_SQL=PASS
REPOSITORY_FINALIZE_REPLAY=PASS
REPOSITORY_ATTACHMENT_ACCESS_SQL=PASS
REPOSITORY_SQL_CHECKS=6/6
REPOSITORY_EXPIRED_PENDING_UPLOAD_QUEUED=PASS
REPOSITORY_MARK_ATTACHMENT_DELETED=PASS
REPOSITORY_MEDIA_DELETION_AUDIT=PASS
REPOSITORY_CLEANUP_SQL_CHECKS=3/3
MOV_12_MIB_30S_ACCEPTED=PASS
MP4_12_MIB_30S_ACCEPTED=PASS
MOV_OVER_12_MIB_REJECTED=PASS
MOV_OVER_30S_REJECTED=PASS
MOV_DURATION_REQUIRED=PASS
UNSUPPORTED_VIDEO_MIME_REJECTED=PASS
MP4_AND_MOV_SHARE_ONE_VIDEO_BATCH_LIMIT=PASS
FOUR_PHOTOS_AND_ONE_MOV_BATCH_ACCEPTED=PASS
FIFTH_PHOTO_IN_BATCH_REJECTED=PASS
MIGRATION_CATALOG=PASS
MIGRATION_AND_REPOSITORY_CHECKS=19/19
MIGRATION_PROBE_EXIT_CODE=0
```

Disposable branch lifecycle:

```text
DISPOSABLE_BRANCH_CREATED=true
DISPOSABLE_BRANCH_NAME=rumakost-be12-cleanup-20261103
PARENT_BRANCH=dev
CONNECTION_SECRETS_OUTPUT=disabled
DISPOSABLE_BRANCH_STILL_EXISTS=false
REMAINING_BRANCHES=dev
```
