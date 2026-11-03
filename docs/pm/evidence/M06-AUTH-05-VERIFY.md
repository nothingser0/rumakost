# Evidence M06-AUTH-05 — Better Auth + Neon PostgreSQL (2026-11-03)

Status: Verify PASS; tugas ditutup sesuai delegasi Owner pada 2026-11-03.

## Cakupan

- Runtime auth diganti ke Better Auth dengan Prisma adapter; migration chain menambah tabel identitas, sesi, account, dan verification.
- Sesi hanya dibuat untuk `AppUser` aktif. Role aplikasi tetap dibaca dari `AppUser`; signup publik ditolak.
- Cookie sesi diuji HttpOnly/SameSite=Lax, reset email menggunakan fake sender, dan logout mencabut sesi.
- Owner bootstrap menolak duplikasi email yang sudah ada di `app_users` maupun tabel Better Auth `user`. Identitas yang dibuat tetap pending sampai alur aktivasi dan pengiriman email tersedia.
- Runbook menjelaskan env Better Auth, verifier Neon disposable, serta batas bahwa akun bootstrap belum dapat login.

## Output mentah Verify terakhir

Command: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-auth-provider-disposable.ps1 -ProjectId floral-wind-91503829 -ParentBranch dev`

```text
NODE_VERSION=v22.13.1
PARENT_BRANCH_READY=true
DISPOSABLE_BRANCH_CREATED=true
BRANCH_SCHEMA_ONLY=true
BRANCH_SECRETS_IN_OUTPUT=false
DISPOSABLE_BRANCH_SAFE=true
EMPTY_DISPOSABLE_DATABASE_CREATED=true
> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

Loaded Prisma config from prisma.config.generate.ts.
System.Management.Automation.RemoteException
Prisma schema loaded from prisma\schema.prisma.

✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 459ms

PRISMA_GENERATE_EXIT_CODE=0
DISPOSABLE_ENVIRONMENT_SET=true
Loaded Prisma config from prisma.config.auth-provider-disposable.ts.
System.Management.Automation.RemoteException
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "auth05_verify_0bd85fa63f73", schema "public" at "ep-rapid-mouse-b340tmyo.c-4.ap-southeast-1.aws.neon.tech"

41 migrations found in prisma/migrations

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
Applying migration `20261103120000_list_query_indexes`
Applying migration `20261103130000_auth_login_rate_limit`
Applying migration `20261103140000_better_auth`

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
  └─ 20261103120000_list_query_indexes/
    └─ migration.sql
  └─ 20261103130000_auth_login_rate_limit/
    └─ migration.sql
  └─ 20261103140000_better_auth/
    └─ migration.sql

All migrations have been successfully applied.
PRISMA_MIGRATE_DEPLOY_EXIT_CODE=0

> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-provider

(node:5076) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
TAP version 13
# (node:700) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# (node:700) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
# --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("file%3A///D%3A/Workspace/RumaKost/tests/auth-provider/typescript-loader.mjs", pathToFileURL("./"));'
# (node:700) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# (node:700) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/src/generated/prisma/client.ts is not specified and it doesn't parse as CommonJS.
# Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
# To eliminate this warning, add "type": "module" to D:\\Workspace\\RumaKost\\package.json.
# Subtest: auth contract disables public signup, uses secure cookies, and gates sessions on active AppUser
ok 1 - auth contract disables public signup, uses secure cookies, and gates sessions on active AppUser
  ---
  duration_ms: 4.0419
  ...
# Subtest: auth mutations reject missing and cross-origin requests before calling Better Auth
ok 2 - auth mutations reject missing and cross-origin requests before calling Better Auth
  ---
  duration_ms: 30.7057
  ...
# 2026-11-03T10:00:27.949Z ERROR [Better Auth]: Failed to create session
# 2026-11-03T10:00:28.243Z WARN [Better Auth]: Invalid password
# Subtest: Neon-backed auth verifies email, authenticates active AppUser roles, and revokes sessions
ok 3 - Neon-backed auth verifies email, authenticates active AppUser roles, and revokes sessions
  ---
  duration_ms: 3064.189
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 4357.0049
AUTH_PROVIDER_TEST_EXIT_CODE=0
DISPOSABLE_BRANCH_DELETED=true
AUTH_PROVIDER_VERIFY=PASS
VERIFY_EXIT_CODE=0
```

## Catatan

- Neon membuat branch schema-only dengan database kosong dari induk `dev`; semua 41 migration diterapkan di database itu. Branch disposable telah dihapus. Branch `dev` hanya dibaca untuk validasi induk.
- `.env.local` tidak dibaca atau diubah; verifier menggunakan URL database dan secret sementara yang disimpan hanya di environment proses lalu dibersihkan.
- 3 test lulus, 0 gagal. Log `Failed to create session` berasal dari skenario akun nonaktif yang memang harus ditolak; `Invalid password` berasal dari skenario kredensial salah.
- Node lokal `v22.13.1` lulus dengan warning eksperimental untuk type stripping/loader; target project tetap Node 24.x.
- Run sebelumnya menemukan incompatibility skrip, file dependency lokal yang rusak, resolusi import client Prisma TS, dan default ID Prisma. Semua branch disposable dihapus dan isu diperbaiki sebelum output Verify terakhir di atas.
- Test memakai akun/email sintetis dan fake email sender. Tidak ada user nyata, email live, branch database aktif, deployment, atau `.env.local` yang disentuh. Bootstrap Owner masih membuat identitas pending yang belum dapat login; aktivasi menunggu task lifecycle/email berikutnya.
