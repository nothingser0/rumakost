# Arsip Evidence M06

> Arsip ini menyimpan catatan dan output Verify M06 yang sebelumnya berada di `TODO.md`. Isi setiap catatan dipertahankan; `TODO.md` tetap menjadi antrean task dan ringkasan status.

## Indeks

- [M06-SETUP-12](#evidence-m06-setup-12)

- [M06-SETUP-06](#evidence-m06-setup-06)
- [M06-DB-01](#evidence-m06-db-01)
- [M06-SETUP-07](#evidence-m06-setup-07)
- [M06-SETUP-08](#evidence-m06-setup-08)
- [M06-SETUP-09](#evidence-m06-setup-09)
- [M06-SETUP-10](#evidence-m06-setup-10)
- [M06-DB-02](#evidence-m06-db-02)
- [M06-DB-03](#evidence-m06-db-03)
- [M06-DB-04](#evidence-m06-db-04)
- [M06-DB-05](#evidence-m06-db-05)
- [M06-DB-07](#evidence-m06-db-07)
- [M06-DB-14](#evidence-m06-db-14)
- [M06-DB-12](#evidence-m06-db-12)
- [M06-DB-10](#evidence-m06-db-10)
- [M06-DB-09](#evidence-m06-db-09)
- [M06-DB-08](#evidence-m06-db-08)
- [M06-DB-06](#evidence-m06-db-06)
- [M06-DB-11](#evidence-m06-db-11)
- [M06-DB-13](#evidence-m06-db-13)
- [M06-DB-15](#evidence-m06-db-15)
- [M06-DB-16](#evidence-m06-db-16)
- [M06-DB-17](#evidence-m06-db-17)
- [M06-DB-18](#evidence-m06-db-18)
- [M06-DB-19](#evidence-m06-db-19)
- [M06-DB-20](#evidence-m06-db-20)
- [M06-DB-21](#evidence-m06-db-21)
- [M06-DB-22](#evidence-m06-db-22)
- [M06-DB-23](#evidence-m06-db-23)
- [M06-DB-24](#evidence-m06-db-24)
- [M06-DB-25](#evidence-m06-db-25)
- [M06-DB-26](#evidence-m06-db-26)
- [M06-DB-27](#evidence-m06-db-27)
- [M06-DB-28](#evidence-m06-db-28)
- [M06-DB-29](#evidence-m06-db-29)
- [M06-DB-30](#evidence-m06-db-30)
- [M06-DB-31](#evidence-m06-db-31)
- [M06-DB-32](#evidence-m06-db-32)
- [M06-DB-34](#evidence-m06-db-34)
- [M06-DB-35](#evidence-m06-db-35)
- [M06-DB-39](#evidence-m06-db-39)
- [M06-DB-36](#evidence-m06-db-36)
- [M06-DB-37](#evidence-m06-db-37)
- [M06-DB-38](#evidence-m06-db-38)
- [M06-DB-33](#evidence-m06-db-33)
- [M06-DB-40](#evidence-m06-db-40)
- [M06-DB-41](#evidence-m06-db-41)
- [M06-DB-42](#evidence-m06-db-42)
- [M06-DB-43](#evidence-m06-db-43)
- [M06-DB-44](#evidence-m06-db-44)
- [M06-DB-45](#evidence-m06-db-45)
- [M06-DB-46](#evidence-m06-db-46)
- [M06-DB-47](#evidence-m06-db-47)
- [M06-DB-48](#evidence-m06-db-48)
- [M06-DB-49](#evidence-m06-db-49)
- [M06-DB-50](#evidence-m06-db-50)
- [M06-DB-51](#evidence-m06-db-51)
- [M06-DB-52](#evidence-m06-db-52)
- [M06-DB-53](#evidence-m06-db-53)
- [M06-BE-01](#evidence-m06-be-01)
- [M06-BE-02](#evidence-m06-be-02)
- [M06-BE-03](#evidence-m06-be-03)
- [M06-BE-04](#evidence-m06-be-04)
- [M06-BE-05](#evidence-m06-be-05)
- [M06-BE-06](#evidence-m06-be-06)

## Evidence

<a id="evidence-m06-setup-06"></a>

### Evidence tambahan M06-SETUP-06: autentikasi login (2026-10-31)

- Sebelum perubahan, `neon neon-auth domain list` mengembalikan daftar domain kosong.
- `neon neon-auth domain add http://localhost:3000` berhasil; domain muncul sebagai `better_auth` saat diverifikasi.
- Verify login: 3 test lulus, 0 gagal.
- Login live belum terverifikasi: user yang dibuat lewat Neon CLI belum diberi password. Alur aktivasi sandi ada di M06-SETUP-07.

Output ringkas yang tercatat:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth
TAP version 13
# tests 3
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
EXIT_CODE=0
```

<a id="evidence-m06-db-01"></a>

### Evidence M06-DB-01 — AppUser (2026-10-31)

- `npm run db:migrate` raw output:
  ```text
  > rumakost@0.1.0 db:migrate
  > prisma migrate deploy

  Loaded Prisma config from prisma.config.ts.

  Prisma schema loaded from prisma\schema.prisma.
  Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

  1 migration found in prisma/migrations

  Applying migration `20261031120000_app_user`

  The following migration(s) have been applied:

  migrations/
    └─ 20261031120000_app_user/
       └─ migration.sql

  All migrations have been successfully applied.
  ```
- Disposable Neon database `rk_db01_tmp_833d55e3b17a` dipakai untuk Verify ini; database sudah dihapus setelah selesai. Tidak ada tabel aplikasi pada database `neondb` yang disentuh.
- Raw output lanjutan untuk `npm run db:migrate` dan rollback manual pada database disposable:
  ```text
  > rumakost@0.1.0 db:migrate
  > prisma migrate deploy

  Loaded Prisma config from prisma.config.ts.
  Prisma schema loaded from prisma\schema.prisma.
  Datasource "db": PostgreSQL database "rk_db01_tmp_833d55e3b17a", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"
  1 migration found in prisma/migrations
  Applying migration `20261031120000_app_user`
  ┌─────────────────────────────────────────────────────────┐
  │  Update available 7.10.1 -> 8.0.0-rc.29                 │
  │                                                         │
  │  This is a major update - please follow the guide at    │
  │  https://pris.ly/d/major-version-upgrade                │
  │                                                         │
  │  Run the following to update                            │
  │    npm i --save-dev prisma@latest                       │
  │    npm i @prisma/client@latest                           │
  └─────────────────────────────────────────────────────────┘
  The following migration(s) have been applied:
  migrations/
    └─ 20261031120000_app_user/
       └─ migration.sql
  All migrations have been successfully applied.
  Post-migration catalog verification: {"app_users_table":1,"app_role_enum":1,"foreign_keys":1,"indexes":4,"applied_migration":1}
  Applying inverse SQL on disposable database: DROP TABLE public.app_users; DROP TYPE public."AppRole";
  Post-rollback catalog verification: {"app_users_table":0,"app_role_enum":0}
  Disposable database removed: rk_db01_tmp_833d55e3b17a
  RESULT: migration up, schema constraints verified, inverse SQL rollback verified, disposable database removed.
  ```
- Rollback yang diverifikasi dilakukan dengan SQL inverse manual hanya di disposable DB; Prisma tidak memiliki perintah `migrate down` atau file down migration.

<a id="evidence-m06-setup-07"></a>

### Evidence M06-SETUP-07: aktivasi dan kebijakan sandi (2026-11-01)

`npm run test -- auth-password` raw output:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-password

TAP version 13
# Subtest: validates password length, confirmation, and changed value
ok 1 - validates password length, confirmation, and changed value
  ---
  duration_ms: 4.0707
  ...
# Subtest: forced activation changes password before clearing the flag
ok 2 - forced activation changes password before clearing the flag
  ---
  duration_ms: 1.4865
  ...
# Subtest: activation stays blocked when provider change fails
ok 3 - activation stays blocked when provider change fails
  ---
  duration_ms: 0.3578
  ...
# Subtest: profile change is self scoped and blocked until activation completes
ok 4 - profile change is self scoped and blocked until activation completes
  ---
  duration_ms: 0.228
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 215.1597
EXIT_CODE=0
```

<a id="evidence-m06-setup-08"></a>

### Evidence M06-SETUP-08: kebijakan otorisasi (2026-11-01)

`npm run test -- authorization` raw output:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs authorization

TAP version 13
# Subtest: rejects missing or inactive route sessions
ok 1 - rejects missing or inactive route sessions
  ---
  duration_ms: 1.9964
  ...
# Subtest: forces password activation before all protected routes
ok 2 - forces password activation before all protected routes
  ---
  duration_ms: 0.2548
  ...
# Subtest: allows roles only in their assigned route groups
ok 3 - allows roles only in their assigned route groups
  ---
  duration_ms: 1.3726
  ...
# Subtest: keeps account administration, financial reports, and audit routes Owner-only
ok 4 - keeps account administration, financial reports, and audit routes Owner-only
  ---
  duration_ms: 0.4407
  ...
# Subtest: fails closed for protected paths without a policy
ok 5 - fails closed for protected paths without a policy
  ---
  duration_ms: 0.401
  ...
# Subtest: action policy rejects unauthenticated, inactive, forced-change, and disallowed roles
ok 6 - action policy rejects unauthenticated, inactive, forced-change, and disallowed roles
  ---
  duration_ms: 0.322
  ...
# Subtest: tenant resource access requires matching authenticated ownership
ok 7 - tenant resource access requires matching authenticated ownership
  ---
  duration_ms: 0.389
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 127.8907
EXIT_CODE=0
```

<a id="evidence-m06-setup-09"></a>

### Evidence M06-SETUP-09: manajemen akun (2026-11-01)

File yang diubah untuk task ini: `src/lib/authorization/policy.mjs`, `src/lib/users/policy.mjs`, `src/lib/users/managed-accounts.ts`, `src/actions/users.ts`, `src/app/pengaturan/akun/page.tsx`, `src/app/pengaturan/akun/account-directory.tsx`, `src/app/pengaturan/akun/page.module.css`, `tests/users/user-policy.test.mjs`, `tests/authorization/authorization-policy.test.mjs`, and `RUNBOOK_LOCAL.md`.

`npm run test -- users` raw output:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs users

TAP version 13
# Subtest: Owner can manage Staff and Tenant accounts, Staff can manage only Tenant accounts
ok 1 - Owner can manage Staff and Tenant accounts, Staff can manage only Tenant accounts
  ---
  duration_ms: 2.1554
  ...
# Subtest: account route permits Owner and Staff while other settings remain Owner-only
ok 2 - account route permits Owner and Staff while other settings remain Owner-only
  ---
  duration_ms: 0.3423
  ...
# Subtest: new account validation trims name and normalizes email
ok 3 - new account validation trims name and normalizes email
  ---
  duration_ms: 2.0805
  ...
# Subtest: new account validation rejects Owner creation, unknown roles, and malformed email
ok 4 - new account validation rejects Owner creation, unknown roles, and malformed email
  ---
  duration_ms: 0.3123
  ...
# Subtest: account status validation accepts only UUIDs and explicit boolean strings
ok 5 - account status validation accepts only UUIDs and explicit boolean strings
  ---
  duration_ms: 0.6302
  ...
1..5
# tests 5
# suites 0
# pass 5
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 141.1502
EXIT_CODE=0
```

Verify ini hanya menguji policy dan validasi, jadi tidak memakai database maupun membuat akun Neon. Uji integrasi database/provider tetap perlu dilakukan pada environment sekali pakai sebelum penggunaan akun sebenarnya. Akun bootstrap memerlukan role provider `admin` Neon Auth; prasyaratnya dijelaskan di `RUNBOOK_LOCAL.md`. Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-setup-10"></a>

### Evidence M06-SETUP-10: bootstrap Owner (2026-11-01)

File yang diubah: `scripts/bootstrap-owner.mjs`, `package.json`, `RUNBOOK_LOCAL.md`, dan `TODO.md`. Verifier sementara dihapus setelah penggunaan. Script meminta Neon Auth user ID, email, dan nama; menautkan identitas yang sudah ada ke satu `AppUser` ber-role `OWNER`; memakai transaksi/advisory lock; dan menolak jika Owner atau subject/email telah terdaftar. Tidak ada password atau user provider yang dibuat. Status awal `must_change_password=false`, karena Owner menetapkan password pada Neon Auth sendiri.

`node scripts/verify-owner-bootstrap.mjs` raw output ringkas:

```text
VERIFY_BOOTSTRAP_COMMAND=registered
VERIFY_MIGRATE_EXIT=0
All migrations have been successfully applied.
VERIFY_BOOTSTRAP_FIRST_EXIT=0
OWNER_BOOTSTRAP=created
VERIFY_BOOTSTRAP_SECOND_EXIT=1
OWNER_BOOTSTRAP_ERROR=owner_already_exists
VERIFY_OWNER_ROWS=1
VERIFY_OWNER_FIELDS=PASS
DISPOSABLE_DATABASE_REMOVED=true
EXIT_CODE=0
```

Verifikasi memakai Neon database sekali pakai dan nilai identitas sintetis (`.invalid`); migrasi 17/17 berhasil. Input tidak muncul di output bootstrap. Database uji dihapus setelah verifikasi. Perintah npm terdaftar sebagai `db:bootstrap-owner`; pemetaan command dan script diverifikasi. Belum menjalankan bootstrap pada Auth/database milik Owner, dan belum memverifikasi bahwa subject/email yang dimasukkan cocok dengan identitas provider. Task menunggu review Owner.

<a id="evidence-m06-db-02"></a>

### Evidence M06-DB-02: profil Penghuni (2026-11-01)

File yang diubah: `prisma/schema.prisma`, `prisma/migrations/20261101120000_tenant_profile/migration.sql`.

`npm run db:migrate` ? output mentah pada database sekali pakai:

```text

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db02_tmp_b38413ece7", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

2 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
CONSTRAINT_CATALOG=[{"type":"FOREIGN KEY","name":"tenant_profiles_user_id_fkey","column":"user_id","referencedTable":"app_users","referencedColumn":"id"},{"type":"PRIMARY KEY","name":"tenant_profiles_pkey","column":"user_id","referencedTable":"tenant_profiles","referencedColumn":"user_id"}]
DISPOSABLE_DATABASE_REMOVED=true
RESULT=migration applied; TenantProfile user_id primary-key and AppUser foreign-key verified; disposable database removed.
PROCESS_EXIT_CODE=0
```

Profil mempunyai PK `user_id` yang sekaligus FK ke `app_users.id`; kontak darurat opsional mengikuti draft data/API. Database sekali pakai telah dihapus. Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-03"></a>

### Evidence M06-DB-03: kamar (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101130000_room/migration.sql`, `TODO.md`.

Sumber presisi kolom mengikuti skema SQL rinci di `docs/specs/FSD.md` (`NUMERIC(12,2)`); draft M05 menyebut `(14,2)`. Model menyimpan status `READY`, `CLEANING`, `MAINTENANCE`, kode unik, lantai opsional, sewa dan deposit Decimal, serta timestamp. Nilai sewa/deposit negatif ditolak.

`npm run db:migrate` — output mentah pada database sekali pakai:

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db03_tmp_fc845f099c", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

3 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
ROOM_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"code","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"floor","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"monthly_rent","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":null},{"column_name":"deposit_default_amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":"0"},{"column_name":"physical_status","data_type":"USER-DEFINED","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"'READY'::\"RoomPhysicalStatus\""},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"updated_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null}]
ROOM_CONSTRAINTS=[{"conname":"rooms_code_not_null","contype":"n","definition":"NOT NULL code"},{"conname":"rooms_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"rooms_deposit_default_amount_not_null","contype":"n","definition":"NOT NULL deposit_default_amount"},{"conname":"rooms_deposit_default_nonnegative","contype":"c","definition":"CHECK ((deposit_default_amount >= (0)::numeric))"},{"conname":"rooms_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"rooms_monthly_rent_nonnegative","contype":"c","definition":"CHECK ((monthly_rent >= (0)::numeric))"},{"conname":"rooms_monthly_rent_not_null","contype":"n","definition":"NOT NULL monthly_rent"},{"conname":"rooms_physical_status_not_null","contype":"n","definition":"NOT NULL physical_status"},{"conname":"rooms_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"rooms_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"}]
ROOM_PHYSICAL_STATUSES=["READY","CLEANING","MAINTENANCE"]
DUPLICATE_ROOM_CODE_REJECTED=true
DECIMAL_VALUE_ROUNDTRIP={"monthly_rent":"1250000.00","deposit_default_amount":"625000.00","physical_status":"CLEANING"}
ROOM_VERIFY=unique code enforced; NUMERIC(12,2) preserved; READY/CLEANING/MAINTENANCE enum verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-04"></a>

### Evidence M06-DB-04: Lease (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101140000_lease/migration.sql`, `TODO.md`.

Constraint overlap menggunakan `btree_gist` dan `daterange(starts_on, ends_on, '[]')` agar tanggal akhir inklusif. Lease berstatus `SCHEDULED` atau `ACTIVE` pada kamar yang sama tidak boleh bertumpang tindih; Lease `CANCELLED`/`ENDED` tidak memblokir rentang. Indeks GiST dari exclusion constraint mendukung pengecekan bentrok; indeks B-tree kamar/tanggal disediakan untuk query. FK Tenant, kamar, dan pembuat bersifat `RESTRICT`; nominal menggunakan Decimal `NUMERIC(12,2)`.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db04_tmp_a564dc14a8", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

4 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
LEASE_CONSTRAINTS=[{"conname":"leases_billing_mode_not_null","contype":"n","definition":"NOT NULL billing_mode"},{"conname":"leases_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"leases_created_by_id_fkey","contype":"f","definition":"FOREIGN KEY (created_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"leases_created_by_id_not_null","contype":"n","definition":"NOT NULL created_by_id"},{"conname":"leases_dates_valid","contype":"c","definition":"CHECK (((ends_on IS NULL) OR (ends_on > starts_on)))"},{"conname":"leases_deposit_agreed_amount_not_null","contype":"n","definition":"NOT NULL deposit_agreed_amount"},{"conname":"leases_deposit_nonnegative","contype":"c","definition":"CHECK ((deposit_agreed_amount >= (0)::numeric))"},{"conname":"leases_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"leases_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"leases_rent_amount_not_null","contype":"n","definition":"NOT NULL rent_amount"},{"conname":"leases_rent_positive","contype":"c","definition":"CHECK ((rent_amount > (0)::numeric))"},{"conname":"leases_room_active_period_excl","contype":"x","definition":"EXCLUDE USING gist (room_id WITH =, daterange(starts_on, ends_on, '[]'::text) WITH &&) WHERE ((status = ANY (ARRAY['SCHEDULED'::\"LeaseStatus\", 'ACTIVE'::\"LeaseStatus\"])))"},{"conname":"leases_room_id_fkey","contype":"f","definition":"FOREIGN KEY (room_id) REFERENCES rooms(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"leases_room_id_not_null","contype":"n","definition":"NOT NULL room_id"},{"conname":"leases_starts_on_not_null","contype":"n","definition":"NOT NULL starts_on"},{"conname":"leases_status_not_null","contype":"n","definition":"NOT NULL status"},{"conname":"leases_tenant_user_id_fkey","contype":"f","definition":"FOREIGN KEY (tenant_user_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"leases_tenant_user_id_not_null","contype":"n","definition":"NOT NULL tenant_user_id"},{"conname":"leases_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"}]
LEASE_INDEXES=[{"indexname":"leases_created_by_id_idx","indexdef":"CREATE INDEX leases_created_by_id_idx ON public.leases USING btree (created_by_id)"},{"indexname":"leases_pkey","indexdef":"CREATE UNIQUE INDEX leases_pkey ON public.leases USING btree (id)"},{"indexname":"leases_room_active_period_excl","indexdef":"CREATE INDEX leases_room_active_period_excl ON public.leases USING gist (room_id, daterange(starts_on, ends_on, '[]'::text)) WHERE (status = ANY (ARRAY['SCHEDULED'::\"LeaseStatus\", 'ACTIVE'::\"LeaseStatus\"]))"},{"indexname":"leases_room_id_starts_on_ends_on_idx","indexdef":"CREATE INDEX leases_room_id_starts_on_ends_on_idx ON public.leases USING btree (room_id, starts_on, ends_on)"},{"indexname":"leases_tenant_user_id_idx","indexdef":"CREATE INDEX leases_tenant_user_id_idx ON public.leases USING btree (tenant_user_id)"}]
LEASE_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"tenant_user_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"room_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"starts_on","data_type":"date","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"ends_on","data_type":"date","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES"},{"column_name":"rent_amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO"},{"column_name":"deposit_agreed_amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO"},{"column_name":"billing_mode","data_type":"USER-DEFINED","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"status","data_type":"USER-DEFINED","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"created_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"updated_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"}]
INCLUSIVE_END_OVERLAP_REJECTED=true
NEXT_DAY_LEASE_ACCEPTED=true
LEASE_DECIMAL_ENUM_ROUNDTRIP={"rent_amount":"1250000.00","deposit_agreed_amount":"0.00","billing_mode":"PRORATA_TO_MONTH_END","status":"SCHEDULED"}
LEASE_VERIFY=FKs, inclusive room overlap constraint, range query index, Decimal fields and billing/status enums verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-05"></a>

### Evidence M06-DB-05: permintaan check-out (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101150000_lease_end_request/migration.sql`, `TODO.md`.

Status awal `PENDING`; hasil review Owner dapat berupa `APPROVED` atau `REJECTED`. Constraint memastikan request pending belum memiliki reviewer/waktu review dan hasil review sudah memiliki keduanya. FK lease, Tenant pemohon, dan Owner reviewer serta indeksnya diverifikasi.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db05_tmp_1295c2e05f", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

5 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql
  └─ 20261101150000_lease_end_request/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
LEASE_END_REQUEST_CONSTRAINTS=[{"conname":"lease_end_requests_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"lease_end_requests_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"lease_end_requests_lease_id_fkey","contype":"f","definition":"FOREIGN KEY (lease_id) REFERENCES leases(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_lease_id_not_null","contype":"n","definition":"NOT NULL lease_id"},{"conname":"lease_end_requests_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"lease_end_requests_requested_by_tenant_id_fkey","contype":"f","definition":"FOREIGN KEY (requested_by_tenant_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_requested_by_tenant_id_not_null","contype":"n","definition":"NOT NULL requested_by_tenant_id"},{"conname":"lease_end_requests_requested_end_on_not_null","contype":"n","definition":"NOT NULL requested_end_on"},{"conname":"lease_end_requests_review_state_valid","contype":"c","definition":"CHECK ((((status = 'PENDING'::\"LeaseEndRequestStatus\") AND (reviewed_by_owner_id IS NULL) AND (reviewed_at IS NULL)) OR ((status = 'APPROVED'::\"LeaseEndRequestStatus\") AND (reviewed_by_owner_id IS NOT NULL) AND (reviewed_at IS NOT NULL))))"},{"conname":"lease_end_requests_reviewed_by_owner_id_fkey","contype":"f","definition":"FOREIGN KEY (reviewed_by_owner_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_status_not_null","contype":"n","definition":"NOT NULL status"},{"conname":"lease_end_requests_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"}]
LEASE_END_REQUEST_INDEXES=[{"indexname":"lease_end_requests_lease_id_idx","indexdef":"CREATE INDEX lease_end_requests_lease_id_idx ON public.lease_end_requests USING btree (lease_id)"},{"indexname":"lease_end_requests_pkey","indexdef":"CREATE UNIQUE INDEX lease_end_requests_pkey ON public.lease_end_requests USING btree (id)"},{"indexname":"lease_end_requests_requested_by_tenant_id_idx","indexdef":"CREATE INDEX lease_end_requests_requested_by_tenant_id_idx ON public.lease_end_requests USING btree (requested_by_tenant_id)"},{"indexname":"lease_end_requests_reviewed_by_owner_id_idx","indexdef":"CREATE INDEX lease_end_requests_reviewed_by_owner_id_idx ON public.lease_end_requests USING btree (reviewed_by_owner_id)"}]
LEASE_END_REQUEST_COLUMNS=[{"column_name":"id","data_type":"uuid","is_nullable":"NO","column_default":null},{"column_name":"lease_id","data_type":"uuid","is_nullable":"NO","column_default":null},{"column_name":"requested_by_tenant_id","data_type":"uuid","is_nullable":"NO","column_default":null},{"column_name":"requested_end_on","data_type":"date","is_nullable":"NO","column_default":null},{"column_name":"reason","data_type":"text","is_nullable":"YES","column_default":null},{"column_name":"status","data_type":"USER-DEFINED","is_nullable":"NO","column_default":"'PENDING'::\"LeaseEndRequestStatus\""},{"column_name":"reviewed_by_owner_id","data_type":"uuid","is_nullable":"YES","column_default":null},{"column_name":"reviewed_at","data_type":"timestamp with time zone","is_nullable":"YES","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"updated_at","data_type":"timestamp with time zone","is_nullable":"NO","column_default":null}]
REQUEST_DEFAULT_STATUS={"status":"PENDING"}
REQUEST_APPROVAL_ROUNDTRIP={"status":"APPROVED","reviewed_by_owner_id":"3aa38a9d-a24e-41fb-9ee0-c6b1dd4e2795","has_reviewed_at":true}
LEASE_END_REQUEST_VERIFY=FKs and PENDING/APPROVED review state verified
DISPOSABLE_DATABASE_REMOVED=true
```

Verify awal di atas mendahului klarifikasi Owner bahwa status `REJECTED` juga diperlukan. Setelah enum dan constraint diperbarui, Verify ulang menghasilkan:

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db05_tmp_52f1980d3b", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

5 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql
  └─ 20261101150000_lease_end_request/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
LEASE_END_REQUEST_CONSTRAINTS=[{"conname":"lease_end_requests_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"lease_end_requests_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"lease_end_requests_lease_id_fkey","contype":"f","definition":"FOREIGN KEY (lease_id) REFERENCES leases(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_lease_id_not_null","contype":"n","definition":"NOT NULL lease_id"},{"conname":"lease_end_requests_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"lease_end_requests_requested_by_tenant_id_fkey","contype":"f","definition":"FOREIGN KEY (requested_by_tenant_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_requested_by_tenant_id_not_null","contype":"n","definition":"NOT NULL requested_by_tenant_id"},{"conname":"lease_end_requests_requested_end_on_not_null","contype":"n","definition":"NOT NULL requested_end_on"},{"conname":"lease_end_requests_review_state_valid","contype":"c","definition":"CHECK ((((status = 'PENDING'::\"LeaseEndRequestStatus\") AND (reviewed_by_owner_id IS NULL) AND (reviewed_at IS NULL)) OR (status = ANY (ARRAY['APPROVED'::\"LeaseEndRequestStatus\", 'REJECTED'::\"LeaseEndRequestStatus\"]) AND (reviewed_by_owner_id IS NOT NULL) AND (reviewed_at IS NOT NULL))))"},{"conname":"lease_end_requests_reviewed_by_owner_id_fkey","contype":"f","definition":"FOREIGN KEY (reviewed_by_owner_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"lease_end_requests_status_not_null","contype":"n","definition":"NOT NULL status"},{"conname":"lease_end_requests_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"}]
LEASE_END_REQUEST_STATUSES=["PENDING","APPROVED","REJECTED"]
LEASE_END_REQUEST_INDEXES=["lease_end_requests_lease_id_idx","lease_end_requests_pkey","lease_end_requests_requested_by_tenant_id_idx","lease_end_requests_reviewed_by_owner_id_idx"]
REQUEST_DEFAULT_STATUSES=["PENDING","PENDING"]
REQUEST_REVIEW_ROUNDTRIP=[{"status":"APPROVED","reviewed_by_owner_id":"f058a8b7-ded6-4eef-bb2c-a004a7a920c7","has_reviewed_at":true},{"status":"REJECTED","reviewed_by_owner_id":"f058a8b7-ded6-4eef-bb2c-a004a7a920c7","has_reviewed_at":true}]
LEASE_END_REQUEST_VERIFY=FKs, PENDING default, APPROVED and REJECTED outcomes with review metadata verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-07"></a>

### Evidence M06-DB-07: InvoiceLine (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101170000_invoice_line/migration.sql`, `TODO.md`.

`InvoiceLine` membatasi `kind` ke `RENT` atau `DEPOSIT`, menyimpan nilai `NUMERIC(12,2)` positif dan deskripsi wajib, serta memiliki FK terindeks ke Invoice. Mengikuti SQL FSD, periode layanan tidak disimpan pada line; cakupan biayanya tetap RENT/DEPOSIT.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
EARLIER_DISPOSABLE_DATABASE_REMOVED=true
DISPOSABLE_DATABASE_CREATED=rk_db07_tmp_0d5a2bec13

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db07_tmp_0d5a2bec13", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

7 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
INVOICE_LINE_CONSTRAINTS=[{"conname":"invoice_lines_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"invoice_lines_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"invoice_lines_description_not_null","contype":"n","definition":"NOT NULL description"},{"conname":"invoice_lines_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"invoice_lines_invoice_id_fkey","contype":"f","definition":"FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"invoice_lines_invoice_id_not_null","contype":"n","definition":"NOT NULL invoice_id"},{"conname":"invoice_lines_kind_not_null","contype":"n","definition":"NOT NULL kind"},{"conname":"invoice_lines_kind_valid","contype":"c","definition":"CHECK ((kind = ANY (ARRAY['RENT'::text, 'DEPOSIT'::text])))"},{"conname":"invoice_lines_pkey","contype":"p","definition":"PRIMARY KEY (id)"}]
INVOICE_LINE_INDEXES=[{"indexname":"invoice_lines_invoice_id_idx","indexdef":"CREATE INDEX invoice_lines_invoice_id_idx ON public.invoice_lines USING btree (invoice_id)"},{"indexname":"invoice_lines_pkey","indexdef":"CREATE UNIQUE INDEX invoice_lines_pkey ON public.invoice_lines USING btree (id)"}]
INVOICE_LINE_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"invoice_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"kind","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO"},{"column_name":"description","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"}]
INVOICE_LINE_VALID_ROUNDTRIP={"kind":"RENT","amount":"1250000.00","description":"Synthetic rent line"}
INVALID_KIND_REJECTED=true
NON_POSITIVE_AMOUNT_REJECTED=true
MISSING_INVOICE_REJECTED=true
INVOICE_LINE_VERIFY=kind, positive Decimal amount, Invoice FK/index, and amount roundtrip verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-14"></a>

### Evidence M06-DB-14: TicketComment (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101240000_ticket_comment/migration.sql`, `TODO.md`.

`TicketComment` menyimpan ticket, author, body wajib, visibility enum `TENANT_VISIBLE`/`INTERNAL`, dan waktu pembuatan. FK dan indeks mendukung relasi serta urutan komentar per ticket. Pembatasan role untuk membuat komentar internal dan penyaringan respons Tenant tetap diperiksa backend.

Verify task `npm run db:migrate` dan pemeriksaan katalog/invariant, pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db14_tmp_bcbc64bbae

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db14_tmp_bcbc64bbae", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

14 migrations found in prisma/migrations
Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
COMMENT_VISIBILITY_VALUES={TENANT_VISIBLE,INTERNAL}
TICKET_COMMENT_CONSTRAINTS=[{"conname":"ticket_comments_author_id_fkey"},{"conname":"ticket_comments_pkey"},{"conname":"ticket_comments_ticket_id_fkey"}]
TICKET_COMMENT_INDEXES=[{"indexname":"ticket_comments_author_id_idx"},{"indexname":"ticket_comments_pkey"},{"indexname":"ticket_comments_ticket_id_created_at_idx"}]
COMMENT_TENANT_VISIBLE_ROUNDTRIP={"body":"Synthetic comment","visibility":"TENANT_VISIBLE","ticket_id":"95c66e64-5c40-43f4-9bef-2f1595c6a11e","author_id":"647718c3-e726-4a9c-832e-ad43a257196b","created_at":"2026-11-01T04:06:01.677Z"}
COMMENT_INTERNAL_ROUNDTRIP={"body":"Synthetic comment","visibility":"INTERNAL","ticket_id":"95c66e64-5c40-43f4-9bef-2f1595c6a11e","author_id":"647718c3-e726-4a9c-832e-ad43a257196b","created_at":"2026-11-01T04:06:01.725Z"}
INVALID_COMMENT_VISIBILITY_REJECTED=true
MISSING_TICKET_REJECTED=true
MISSING_AUTHOR_REJECTED=true
TICKET_COMMENT_VERIFY=visibility enum, required body, ticket/author FKs, timestamp, and indexes verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-12"></a>

### Evidence M06-DB-12: Expense (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101220000_expense/migration.sql`, `TODO.md`.

`Expense` menyimpan kategori dan deskripsi wajib, nominal positif `NUMERIC(12,2)`, tanggal kalender, pencatat, dan waktu pencatatan. Indeks tersedia untuk tanggal transaksi dan pencatat. Lampiran struk dan relasi tiket tidak dibuat.

`npm run db:migrate` dan pemeriksaan katalog/invariant dijalankan pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db12_tmp_aa208d09c5

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db12_tmp_aa208d09c5", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

12 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
EXPENSE_CONSTRAINTS=[{"conname":"expenses_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"expenses_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"expenses_category_not_null","contype":"n","definition":"NOT NULL category"},{"conname":"expenses_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"expenses_description_not_null","contype":"n","definition":"NOT NULL description"},{"conname":"expenses_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"expenses_occurred_on_not_null","contype":"n","definition":"NOT NULL occurred_on"},{"conname":"expenses_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"expenses_recorded_by_id_fkey","contype":"f","definition":"FOREIGN KEY (recorded_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"expenses_recorded_by_id_not_null","contype":"n","definition":"NOT NULL recorded_by_id"}]
EXPENSE_INDEXES=[{"indexname":"expenses_occurred_on_idx","indexdef":"CREATE INDEX expenses_occurred_on_idx ON public.expenses USING btree (occurred_on)"},{"indexname":"expenses_pkey","indexdef":"CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (id)"},{"indexname":"expenses_recorded_by_id_idx","indexdef":"CREATE INDEX expenses_recorded_by_id_idx ON public.expenses USING btree (recorded_by_id)"}]
EXPENSE_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"category","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":null},{"column_name":"occurred_on","data_type":"date","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"description","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"recorded_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"}]
EXPENSE_ROUNDTRIP={"category":"Utilities","amount":"125000.50","occurred_on":"2026-10-31","description":"Synthetic electricity expense","recorded_by_id":"647718c3-e726-4a9c-832e-ad43a257196b","created_at":"2026-11-01T03:58:15.365Z"}
NON_POSITIVE_EXPENSE_REJECTED=true
MISSING_RECORDED_BY_REJECTED=true
MISSING_CATEGORY_REJECTED=true
MISSING_DESCRIPTION_REJECTED=true
EXPENSE_VERIFY=positive Decimal amount, calendar date, required category/description, recorder FK, and date/recorder indexes verified
PREVIOUS_DISPOSABLE_DATABASE_EXISTS=true
PREVIOUS_DISPOSABLE_DATABASE_REMOVED=true
```

Saat teardown pertama, driver Neon mengeluarkan detail koneksi; output tersebut tidak disalin ke evidence agar secret tidak tercatat. Pemeriksaan terpisah memastikan database disposable ada lalu berhasil menghapusnya. Owner menyatakan rotasi kredensial dilakukan saat persiapan production.

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-10"></a>

### Evidence M06-DB-10: DepositLedgerEntry (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101200000_deposit_ledger_entry/migration.sql`, `TODO.md`.

Ledger tidak menyimpan saldo berjalan. Jenis entry dibatasi ke `COLLECTED`, `APPLIED_TO_RENT`, `WITHHELD_AT_CHECKOUT`, `REFUNDED`; nominal harus positif. `COLLECTED` merujuk alokasi secara unik; settlement merujuk line invoice; pemotongan/refund mensyaratkan alasan. Status refund `PENDING`, `PAID`, atau `REJECTED` hanya berlaku untuk `REFUNDED`; status dapat berpindah sekali dari `PENDING` ke `PAID`/`REJECTED`, sementara nilai dan sumber entry tidak dapat diubah. Trigger menolak delete dan perubahan data ledger lainnya. Batas saldo escrow dan kecocokan sumber lintas-relasi divalidasi atomik pada operasi backend.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
DISPOSABLE_DATABASE_CREATED=rk_db10_tmp_72169fc9a4

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db10_tmp_72169fc9a4", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

10 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`
Applying migration `20261101180000_payment`
Applying migration `20261101190000_payment_allocation`
Applying migration `20261101200000_deposit_ledger_entry`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
DEPOSIT_LEDGER_CONSTRAINTS=[{"conname":"deposit_ledger_entries_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"deposit_ledger_entries_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"deposit_ledger_entries_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"deposit_ledger_entries_created_by_id_fkey","contype":"f","definition":"FOREIGN KEY (created_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"deposit_ledger_entries_created_by_id_not_null","contype":"n","definition":"NOT NULL created_by_id"},{"conname":"deposit_ledger_entries_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"deposit_ledger_entries_invoice_line_id_fkey","contype":"f","definition":"FOREIGN KEY (invoice_line_id) REFERENCES invoice_lines(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"deposit_ledger_entries_kind_not_null","contype":"n","definition":"NOT NULL kind"},{"conname":"deposit_ledger_entries_kind_valid","contype":"c","definition":"CHECK ((kind = ANY (ARRAY['COLLECTED'::text, 'APPLIED_TO_RENT'::text, 'WITHHELD_AT_CHECKOUT'::text, 'REFUNDED'::text])))"},{"conname":"deposit_ledger_entries_lease_id_fkey","contype":"f","definition":"FOREIGN KEY (lease_id) REFERENCES leases(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"deposit_ledger_entries_lease_id_not_null","contype":"n","definition":"NOT NULL lease_id"},{"conname":"deposit_ledger_entries_payment_allocation_id_fkey","contype":"f","definition":"FOREIGN KEY (payment_allocation_id) REFERENCES payment_allocations(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"deposit_ledger_entries_payment_allocation_id_key","contype":"u","definition":"UNIQUE (payment_allocation_id)"},{"conname":"deposit_ledger_entries_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"deposit_ledger_entries_source_valid","contype":"c","definition":"CHECK ((((kind = 'COLLECTED'::text) AND (payment_allocation_id IS NOT NULL) AND (invoice_line_id IS NULL) AND (refund_status IS NULL)) OR ((kind = 'APPLIED_TO_RENT'::text) AND (payment_allocation_id IS NULL) AND (invoice_line_id IS NOT NULL) AND (refund_status IS NULL)) OR ((kind = 'WITHHELD_AT_CHECKOUT'::text) AND (payment_allocation_id IS NULL) AND (invoice_line_id IS NULL) AND (reason IS NOT NULL) AND (refund_status IS NULL)) OR ((kind = 'REFUNDED'::text) AND (payment_allocation_id IS NULL) AND (invoice_line_id IS NULL) AND (reason IS NOT NULL) AND (refund_status IS NOT NULL))))"}]
DEPOSIT_LEDGER_INDEXES=[{"indexname":"deposit_ledger_entries_created_by_id_idx","indexdef":"CREATE INDEX deposit_ledger_entries_created_by_id_idx ON public.deposit_ledger_entries USING btree (created_by_id)"},{"indexname":"deposit_ledger_entries_invoice_line_id_idx","indexdef":"CREATE INDEX deposit_ledger_entries_invoice_line_id_idx ON public.deposit_ledger_entries USING btree (invoice_line_id)"},{"indexname":"deposit_ledger_entries_lease_id_idx","indexdef":"CREATE INDEX deposit_ledger_entries_lease_id_idx ON public.deposit_ledger_entries USING btree (lease_id)"},{"indexname":"deposit_ledger_entries_payment_allocation_id_key","indexdef":"CREATE UNIQUE INDEX deposit_ledger_entries_payment_allocation_id_key ON public.deposit_ledger_entries USING btree (payment_allocation_id)"},{"indexname":"deposit_ledger_entries_pkey","indexdef":"CREATE UNIQUE INDEX deposit_ledger_entries_pkey ON public.deposit_ledger_entries USING btree (id)"}]
DEPOSIT_LEDGER_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"lease_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"invoice_line_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"payment_allocation_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"kind","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":null},{"column_name":"reason","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"refund_status","data_type":"USER-DEFINED","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"created_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"}]
REFUND_STATUSES=["PENDING","PAID","REJECTED"]
DEPOSIT_LEDGER_TRIGGERS=[{"tgname":"deposit_ledger_entries_no_delete","definition":"CREATE TRIGGER deposit_ledger_entries_no_delete BEFORE DELETE ON public.deposit_ledger_entries FOR EACH ROW EXECUTE FUNCTION reject_deposit_ledger_mutation()"},{"tgname":"deposit_ledger_entries_no_update","definition":"CREATE TRIGGER deposit_ledger_entries_no_update BEFORE UPDATE ON public.deposit_ledger_entries FOR EACH ROW EXECUTE FUNCTION reject_deposit_ledger_mutation()"}]
DEPOSIT_LEDGER_ROUNDTRIP=[{"kind":"APPLIED_TO_RENT","amount":"50.00","reason":null,"refund_status":null},{"kind":"COLLECTED","amount":"200.00","reason":null,"refund_status":null},{"kind":"REFUNDED","amount":"125.00","reason":"Synthetic manual refund","refund_status":"PENDING"},{"kind":"WITHHELD_AT_CHECKOUT","amount":"25.00","reason":"Synthetic damage settlement","refund_status":null}]
REFUND_STATUS_TRANSITION={"refund_status":"PAID"}
INVALID_KIND_REJECTED=true
NON_POSITIVE_AMOUNT_REJECTED=true
MISSING_REFUND_REASON_REJECTED=true
COLLECTED_WITHOUT_ALLOCATION_REJECTED=true
DUPLICATE_ALLOCATION_REJECTED=true
LEDGER_AMOUNT_UPDATE_REJECTED=true
LEDGER_DELETE_REJECTED=true
DEPOSIT_LEDGER_VERIFY=kind/source/refund constraints, positive Decimal amounts, unique allocation, indexed FKs, refund state, and append-only money data verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-09"></a>

### Evidence M06-DB-09: PaymentAllocation (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101190000_payment_allocation/migration.sql`, `TODO.md`.

Alokasi menyimpan nilai positif `NUMERIC(12,2)`, FK terindeks ke Payment dan InvoiceLine, serta keunikan per pasangan payment/line. Verify memakai fixture sintetis yang membagi satu payment ke line RENT dan DEPOSIT; validasi total terhadap pembayaran tetap dilakukan atomik oleh task layanan pembayaran.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
DISPOSABLE_DATABASE_CREATED=rk_db09_tmp_f0936c3012

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db09_tmp_f0936c3012", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

9 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`
Applying migration `20261101180000_payment`
Applying migration `20261101190000_payment_allocation`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
PAYMENT_ALLOCATION_CONSTRAINTS=[{"conname":"payment_allocations_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"payment_allocations_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"payment_allocations_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"payment_allocations_invoice_line_id_fkey","contype":"f","definition":"FOREIGN KEY (invoice_line_id) REFERENCES invoice_lines(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payment_allocations_invoice_line_id_not_null","contype":"n","definition":"NOT NULL invoice_line_id"},{"conname":"payment_allocations_payment_id_fkey","contype":"f","definition":"FOREIGN KEY (payment_id) REFERENCES payments(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payment_allocations_payment_id_invoice_line_id_key","contype":"u","definition":"UNIQUE (payment_id, invoice_line_id)"},{"conname":"payment_allocations_payment_id_not_null","contype":"n","definition":"NOT NULL payment_id"},{"conname":"payment_allocations_pkey","contype":"p","definition":"PRIMARY KEY (id)"}]
PAYMENT_ALLOCATION_INDEXES=[{"indexname":"payment_allocations_invoice_line_id_idx","indexdef":"CREATE INDEX payment_allocations_invoice_line_id_idx ON public.payment_allocations USING btree (invoice_line_id)"},{"indexname":"payment_allocations_payment_id_invoice_line_id_key","indexdef":"CREATE UNIQUE INDEX payment_allocations_payment_id_invoice_line_id_key ON public.payment_allocations USING btree (payment_id, invoice_line_id)"},{"indexname":"payment_allocations_pkey","indexdef":"CREATE UNIQUE INDEX payment_allocations_pkey ON public.payment_allocations USING btree (id)"}]
PAYMENT_ALLOCATION_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"payment_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"invoice_line_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO"},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO"}]
PAYMENT_ALLOCATION_ROUNDTRIP=[{"kind":"DEPOSIT","amount":"200.00"},{"kind":"RENT","amount":"800.00"}]
PAYMENT_ALLOCATION_TOTAL={"total":"1000.00"}
DUPLICATE_PAYMENT_LINE_PAIR_REJECTED=true
NON_POSITIVE_ALLOCATION_REJECTED=true
MISSING_PAYMENT_REJECTED=true
MISSING_INVOICE_LINE_REJECTED=true
PAYMENT_ALLOCATION_VERIFY=positive Decimal amounts, both FKs/indexes, unique pair, partial lines, and exact allocation sum verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-08"></a>

### Evidence M06-DB-08: Payment (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101180000_payment/migration.sql`, `TODO.md`.

Payment mendukung `PENDING`, `VERIFIED`, dan `REJECTED`, metode pencatatan, nilai positif `NUMERIC(12,2)`, serta FK Invoice, pencatat, dan reviewer dengan indeks. Check state mewajibkan reviewer/waktu yang sesuai untuk hasil verifikasi atau penolakan.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
DISPOSABLE_DATABASE_CREATED=rk_db08_tmp_9114b5c48d

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db08_tmp_9114b5c48d", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

8 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`
Applying migration `20261101180000_payment`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
PAYMENT_CONSTRAINTS=[{"conname":"payments_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"payments_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"payments_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"payments_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"payments_invoice_id_fkey","contype":"f","definition":"FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payments_invoice_id_not_null","contype":"n","definition":"NOT NULL invoice_id"},{"conname":"payments_method_not_null","contype":"n","definition":"NOT NULL method"},{"conname":"payments_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"payments_recorded_by_id_fkey","contype":"f","definition":"FOREIGN KEY (recorded_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payments_recorded_by_id_not_null","contype":"n","definition":"NOT NULL recorded_by_id"},{"conname":"payments_rejected_by_id_fkey","contype":"f","definition":"FOREIGN KEY (rejected_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payments_review_state_valid","contype":"c","definition":"CHECK ((((status = 'PENDING'::\"PaymentStatus\") AND (verified_by_id IS NULL) AND (verified_at IS NULL) AND (rejected_by_id IS NULL) AND (rejected_at IS NULL)) OR ((status = 'VERIFIED'::\"PaymentStatus\") AND (verified_by_id IS NOT NULL) AND (verified_at IS NOT NULL) AND (rejected_by_id IS NULL) AND (rejected_at IS NULL)) OR ((status = 'REJECTED'::\"PaymentStatus\") AND (verified_by_id IS NULL) AND (verified_at IS NULL) AND (rejected_by_id IS NOT NULL) AND (rejected_at IS NOT NULL))))"},{"conname":"payments_status_not_null","contype":"n","definition":"NOT NULL status"},{"conname":"payments_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"},{"conname":"payments_verified_by_id_fkey","contype":"f","definition":"FOREIGN KEY (verified_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"}]
PAYMENT_INDEXES=[{"indexname":"payments_invoice_id_idx","indexdef":"CREATE INDEX payments_invoice_id_idx ON public.payments USING btree (invoice_id)"},{"indexname":"payments_pkey","indexdef":"CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id)"},{"indexname":"payments_recorded_by_id_idx","indexdef":"CREATE INDEX payments_recorded_by_id_idx ON public.payments USING btree (recorded_by_id)"},{"indexname":"payments_rejected_by_id_idx","indexdef":"CREATE INDEX payments_rejected_by_id_idx ON public.payments USING btree (rejected_by_id)"},{"indexname":"payments_verified_by_id_idx","indexdef":"CREATE INDEX payments_verified_by_id_idx ON public.payments USING btree (verified_by_id)"}]
PAYMENT_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"invoice_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":null},{"column_name":"method","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"status","data_type":"USER-DEFINED","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"'PENDING'::\"PaymentStatus\""},{"column_name":"recorded_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"verified_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"verified_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"rejected_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"rejected_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"YES","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"updated_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null}]
PAYMENT_STATUSES=["PENDING","VERIFIED","REJECTED"]
PAYMENT_PENDING_ROUNDTRIP={"status":"PENDING","amount":"1250000.00","method":"CASH","verified_by_id":null,"verified_at":null,"rejected_by_id":null,"rejected_at":null}
PAYMENT_VERIFIED_ROUNDTRIP={"status":"VERIFIED","verified_by_id":"d5d6bc2c-3a8f-46d6-af52-4b0972b2e291","has_verified_at":true}
PAYMENT_REJECTED_ROUNDTRIP={"status":"REJECTED","rejected_by_id":"d5d6bc2c-3a8f-46d6-af52-4b0972b2e291","has_rejected_at":true}
NON_POSITIVE_AMOUNT_REJECTED=true
INVALID_REVIEW_STATE_REJECTED=true
MISSING_INVOICE_REJECTED=true
PAYMENT_VERIFY=status, positive Decimal amount, review metadata, FK/index, and rejection state verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-06"></a>

### Evidence M06-DB-06: Invoice (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101160000_invoice/migration.sql`, `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`, `TODO.md`.

Invoice menyimpan periode, due date, `kind`, status penerbitan, status penyampaian manual, dan waktu void. Keunikan memakai `(leaseId, periodStart, periodEnd, kind)`; billing mode tetap pada Lease. Total invoice dibentuk dari baris `InvoiceLine` pada M06-DB-07.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db06_tmp_7c0a97ec56", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

6 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
    └─ migration.sql
  └─ 20261101130000_room/
    └─ migration.sql
  └─ 20261101140000_lease/
    └─ migration.sql
  └─ 20261101150000_lease_end_request/
    └─ migration.sql
  └─ 20261101160000_invoice/
    └─ migration.sql

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
INVOICE_CONSTRAINTS=[{"conname":"invoices_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"invoices_delivery_status_not_null","contype":"n","definition":"NOT NULL delivery_status"},{"conname":"invoices_due_on_not_null","contype":"n","definition":"NOT NULL due_on"},{"conname":"invoices_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"invoices_issued_at_not_null","contype":"n","definition":"NOT NULL issued_at"},{"conname":"invoices_kind_not_null","contype":"n","definition":"NOT NULL kind"},{"conname":"invoices_lease_id_fkey","contype":"f","definition":"FOREIGN KEY (lease_id) REFERENCES leases(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"invoices_lease_id_not_null","contype":"n","definition":"NOT NULL lease_id"},{"conname":"invoices_lease_id_period_start_period_end_kind_key","contype":"u","definition":"UNIQUE (lease_id, period_start, period_end, kind)"},{"conname":"invoices_period_end_not_null","contype":"n","definition":"NOT NULL period_end"},{"conname":"invoices_period_start_not_null","contype":"n","definition":"NOT NULL period_start"},{"conname":"invoices_period_valid","contype":"c","definition":"CHECK ((period_end >= period_start))"},{"conname":"invoices_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"invoices_status_not_null","contype":"n","definition":"NOT NULL status"},{"conname":"invoices_updated_at_not_null","contype":"n","definition":"NOT NULL updated_at"},{"conname":"invoices_void_state_valid","contype":"c","definition":"CHECK ((((status = 'ISSUED'::\"InvoiceStatus\") AND (voided_at IS NULL)) OR ((status = 'VOID'::\"InvoiceStatus\") AND (voided_at IS NOT NULL))))"}]
INVOICE_INDEXES=[{"indexname":"invoices_lease_id_period_start_period_end_kind_key","indexdef":"CREATE UNIQUE INDEX invoices_lease_id_period_start_period_end_kind_key ON public.invoices USING btree (lease_id, period_start, period_end, kind)"},{"indexname":"invoices_pkey","indexdef":"CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id)"}]
INVOICE_COLUMNS=[{"column_name":"id","data_type":"uuid","is_nullable":"NO","column_default":null},{"column_name":"lease_id","data_type":"uuid","is_nullable":"NO","column_default":null},{"column_name":"period_start","data_type":"date","is_nullable":"NO","column_default":null},{"column_name":"period_end","data_type":"date","is_nullable":"NO","column_default":null},{"column_name":"due_on","data_type":"date","is_nullable":"NO","column_default":null},{"column_name":"kind","data_type":"text","is_nullable":"NO","column_default":null},{"column_name":"status","data_type":"USER-DEFINED","is_nullable":"NO","column_default":"'ISSUED'::\"InvoiceStatus\""},{"column_name":"issued_at","data_type":"timestamp with time zone","is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"delivery_status","data_type":"USER-DEFINED","is_nullable":"NO","column_default":"'UNSENT'::\"InvoiceDeliveryStatus\""},{"column_name":"voided_at","data_type":"timestamp with time zone","is_nullable":"YES","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"updated_at","data_type":"timestamp with time zone","is_nullable":"NO","column_default":null}]
INVOICE_ENUMS=[{"type_name":"InvoiceDeliveryStatus","enum_label":"UNSENT"},{"type_name":"InvoiceDeliveryStatus","enum_label":"SENT"},{"type_name":"InvoiceStatus","enum_label":"ISSUED"},{"type_name":"InvoiceStatus","enum_label":"VOID"}]
INVOICE_DEFAULTS={"status":"ISSUED","delivery_status":"UNSENT","issued_at_present":true}
DUPLICATE_INVOICE_KEY_REJECTED=true
DIFFERENT_KIND_SAME_PERIOD_ACCEPTED=true
INVOICE_VOID_ROUNDTRIP={"status":"VOID","voided_at_present":true}
INVOICE_VERIFY=lease FK, kind uniqueness, issue/delivery defaults and void timestamp state verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-11"></a>

### Evidence M06-DB-11: PaymentReversal (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101210000_payment_reversal/migration.sql`, `TODO.md`.

Reversal penuh menyimpan satu relasi unik ke Payment, nominal positif, alasan wajib, pencatat, dan waktu. Owner-only dan kecocokan nominal reversal penuh terhadap pembayaran asal divalidasi pada transaksi backend; payment asal tetap tersimpan.

`npm run db:migrate` — output mentah pada database sekali pakai dan pemeriksaan katalog/invariant task:

```text
DISPOSABLE_DATABASE_CREATED=rk_db11_tmp_1485b1bca7

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db11_tmp_1485b1bca7", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

11 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
Applying migration `20261101130000_room`
Applying migration `20261101140000_lease`
Applying migration `20261101150000_lease_end_request`
Applying migration `20261101160000_invoice`
Applying migration `20261101170000_invoice_line`
Applying migration `20261101180000_payment`
Applying migration `20261101190000_payment_allocation`
Applying migration `20261101200000_deposit_ledger_entry`
Applying migration `20261101210000_payment_reversal`

The following migration(s) have been applied:

migrations/
  └─ 20261031120000_app_user/
    └─ migration.sql
  └─ 20261101120000_tenant_profile/
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
PAYMENT_REVERSAL_CONSTRAINTS=[{"conname":"payment_reversals_amount_not_null","contype":"n","definition":"NOT NULL amount"},{"conname":"payment_reversals_amount_positive","contype":"c","definition":"CHECK ((amount > (0)::numeric))"},{"conname":"payment_reversals_created_at_not_null","contype":"n","definition":"NOT NULL created_at"},{"conname":"payment_reversals_created_by_id_fkey","contype":"f","definition":"FOREIGN KEY (created_by_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payment_reversals_created_by_id_not_null","contype":"n","definition":"NOT NULL created_by_id"},{"conname":"payment_reversals_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"payment_reversals_payment_id_fkey","contype":"f","definition":"FOREIGN KEY (payment_id) REFERENCES payments(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"payment_reversals_payment_id_key","contype":"u","definition":"UNIQUE (payment_id)"},{"conname":"payment_reversals_payment_id_not_null","contype":"n","definition":"NOT NULL payment_id"},{"conname":"payment_reversals_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"payment_reversals_reason_not_null","contype":"n","definition":"NOT NULL reason"}]
PAYMENT_REVERSAL_INDEXES=[{"indexname":"payment_reversals_created_by_id_idx","indexdef":"CREATE INDEX payment_reversals_created_by_id_idx ON public.payment_reversals USING btree (created_by_id)"},{"indexname":"payment_reversals_payment_id_key","indexdef":"CREATE UNIQUE INDEX payment_reversals_payment_id_key ON public.payment_reversals USING btree (payment_id)"},{"indexname":"payment_reversals_pkey","indexdef":"CREATE UNIQUE INDEX payment_reversals_pkey ON public.payment_reversals USING btree (id)"}]
PAYMENT_REVERSAL_COLUMNS=[{"column_name":"id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"payment_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"amount","data_type":"numeric","numeric_precision":12,"numeric_scale":2,"is_nullable":"NO","column_default":null},{"column_name":"reason","data_type":"text","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"created_by_id","data_type":"uuid","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":null},{"column_name":"created_at","data_type":"timestamp with time zone","numeric_precision":null,"numeric_scale":null,"is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"}]
PAYMENT_REVERSAL_ROUNDTRIP={"amount":"1250000.00","reason":"Synthetic correction","created_by_id":"647718c3-e726-4a9c-832e-ad43a257196b","created_at":"2026-11-01T03:54:57.038Z"}
PAYMENT_ORIGINAL_AFTER_REVERSAL={"status":"VERIFIED","amount":"1250000.00"}
DUPLICATE_PAYMENT_REVERSAL_REJECTED=true
NON_POSITIVE_REVERSAL_REJECTED=true
MISSING_REASON_REJECTED=true
MISSING_PAYMENT_REJECTED=true
PAYMENT_REVERSAL_VERIFY=unique payment reversal, positive full amount fixture, required reason, owner FK/index, and preserved source payment verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-13"></a>

### Evidence M06-DB-13: Ticket (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101230000_ticket/migration.sql`, `TODO.md`.

`Ticket` menyimpan kamar, pembuat, assignee internal opsional, judul, uraian, prioritas, status, waktu tutup/buka kembali, dan timestamps. Status memakai lima nilai dari spesifikasi (`RECEIVED`, `ASSIGNED`, `IN_PROGRESS`, `INSPECTION`, `RESOLVED`); peristiwa dibuka kembali dicatat pada `reopenedAt`. Prioritas memakai `LOW`, `NORMAL`, `URGENT`. Tenant-only creation dan aturan akses tetap ditegakkan backend pada task layanan.

Verify task `npm run db:migrate` dan pemeriksaan katalog/invariant, pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db13_tmp_2f128a3106

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db13_tmp_2f128a3106", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

13 migrations found in prisma/migrations

Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
TICKET_ENUMS=[{"typname":"TicketPriority","values":"{LOW,NORMAL,URGENT}"},{"typname":"TicketStatus","values":"{RECEIVED,ASSIGNED,IN_PROGRESS,INSPECTION,RESOLVED}"}]
TICKET_INDEXES=[{"indexname":"tickets_assigned_to_id_idx"},{"indexname":"tickets_created_by_id_idx"},{"indexname":"tickets_pkey"},{"indexname":"tickets_room_id_idx"},{"indexname":"tickets_status_created_at_idx"}]
TICKET_FOREIGN_KEYS=[{"conname":"tickets_assigned_to_id_fkey"},{"conname":"tickets_created_by_id_fkey"},{"conname":"tickets_room_id_fkey"}]
TICKET_ROUNDTRIP={"title":"Synthetic ticket","priority":"URGENT","status":"IN_PROGRESS","closed_at":"2026-10-30T08:00:00.000Z","reopened_at":"2026-10-31T08:00:00.000Z"}
TICKET_DEFAULT_STATUS=RECEIVED
INVALID_TICKET_STATUS_REJECTED=true
INVALID_TICKET_PRIORITY_REJECTED=true
MISSING_ASSIGNEE_REJECTED=true
TICKET_VERIFY=valid enums, received default, FKs, close/reopen timestamps, and indexes verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-15"></a>

### Evidence M06-DB-15: TicketAttachment (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101250000_ticket_attachment/migration.sql`, `TODO.md`.

`TicketAttachment` menyimpan object key unik, MIME type, ukuran, durasi opsional, status upload, waktu unggah, jadwal hapus, dan waktu hapus. Constraint memastikan ukuran/durasi positif. Composite FK memastikan comment opsional berasal dari ticket yang sama; object key unik. Ukuran maksimum, kuota gabungan, kepemilikan media, upload awal wajib, dan kebijakan signed URL divalidasi backend/provider sesuai spesifikasi.

Verify task `npm run db:migrate` dan pemeriksaan katalog/invariant, pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db15_tmp_ecd4e43559

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db15_tmp_ecd4e43559", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

15 migrations found in prisma/migrations
Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
TICKET_UPLOAD_STATUS_VALUES={PENDING_UPLOAD,AVAILABLE,DELETE_PENDING,DELETED,FAILED}
TICKET_ATTACHMENT_CONSTRAINTS=[{"conname":"ticket_attachments_comment_id_ticket_id_fkey","contype":"f"},{"conname":"ticket_attachments_created_at_not_null","contype":"n"},{"conname":"ticket_attachments_duration_positive","contype":"c"},{"conname":"ticket_attachments_id_not_null","contype":"n"},{"conname":"ticket_attachments_mime_type_not_null","contype":"n"},{"conname":"ticket_attachments_object_key_key","contype":"u"},{"conname":"ticket_attachments_object_key_not_null","contype":"n"},{"conname":"ticket_attachments_pkey","contype":"p"},{"conname":"ticket_attachments_size_bytes_not_null","contype":"n"},{"conname":"ticket_attachments_size_positive","contype":"c"},{"conname":"ticket_attachments_ticket_id_fkey","contype":"f"},{"conname":"ticket_attachments_ticket_id_not_null","contype":"n"},{"conname":"ticket_attachments_upload_status_not_null","contype":"n"},{"conname":"ticket_attachments_uploaded_by_id_fkey","contype":"f"},{"conname":"ticket_attachments_uploaded_by_id_not_null","contype":"n"}]
TICKET_ATTACHMENT_INDEXES=[{"indexname":"ticket_attachments_comment_id_idx"},{"indexname":"ticket_attachments_delete_after_idx"},{"indexname":"ticket_attachments_object_key_key"},{"indexname":"ticket_attachments_pkey"},{"indexname":"ticket_attachments_ticket_id_idx"},{"indexname":"ticket_attachments_uploaded_by_id_idx"}]
TICKET_ATTACHMENT_COLUMNS=[{"column_name":"id","data_type":"uuid","udt_name":"uuid","is_nullable":"NO","column_default":null},{"column_name":"ticket_id","data_type":"uuid","udt_name":"uuid","is_nullable":"NO","column_default":null},{"column_name":"comment_id","data_type":"uuid","udt_name":"uuid","is_nullable":"YES","column_default":null},{"column_name":"uploaded_by_id","data_type":"uuid","udt_name":"uuid","is_nullable":"NO","column_default":null},{"column_name":"object_key","data_type":"text","udt_name":"text","is_nullable":"NO","column_default":null},{"column_name":"mime_type","data_type":"text","udt_name":"text","is_nullable":"NO","column_default":null},{"column_name":"size_bytes","data_type":"bigint","udt_name":"int8","is_nullable":"NO","column_default":null},{"column_name":"duration_seconds","data_type":"integer","udt_name":"int4","is_nullable":"YES","column_default":null},{"column_name":"upload_status","data_type":"USER-DEFINED","udt_name":"TicketUploadStatus","is_nullable":"NO","column_default":"'PENDING_UPLOAD'::\"TicketUploadStatus\""},{"column_name":"created_at","data_type":"timestamp with time zone","udt_name":"timestamptz","is_nullable":"NO","column_default":"CURRENT_TIMESTAMP"},{"column_name":"delete_after","data_type":"timestamp with time zone","udt_name":"timestamptz","is_nullable":"YES","column_default":null},{"column_name":"deleted_at","data_type":"timestamp with time zone","udt_name":"timestamptz","is_nullable":"YES","column_default":null}]
TICKET_ATTACHMENT_PENDING_ROUNDTRIP={"object_key":"opaque/synthetic-asset-1","mime_type":"image/jpeg","size_bytes":"1024","duration_seconds":null,"upload_status":"PENDING_UPLOAD","delete_after":"2027-10-31T08:00:00.000Z","deleted_at":null}
TICKET_COMMENT_ATTACHMENT_ROUNDTRIP={"comment_id":"b5c66e64-5c40-43f4-9bef-2f1595c6a11e","ticket_id":"95c66e64-5c40-43f4-9bef-2f1595c6a11e","size_bytes":"2048","duration_seconds":12,"upload_status":"AVAILABLE"}
COMMENT_FROM_DIFFERENT_TICKET_REJECTED=true
DUPLICATE_OBJECT_KEY_REJECTED=true
NON_POSITIVE_SIZE_REJECTED=true
NON_POSITIVE_DURATION_REJECTED=true
INVALID_UPLOAD_STATUS_REJECTED=true
TICKET_ATTACHMENT_VERIFY=unique object key, positive size/duration, upload status enum/default, optional comment, same-ticket comment FK, deletion metadata, and indexes verified
DISPOSABLE_DATABASE_REMOVED=true
```

Task menunggu review Owner.

<a id="evidence-m06-db-16"></a>

### Evidence M06-DB-16: AuditEvent (2026-11-01)

File yang diubah untuk task ini: `prisma/schema.prisma`, `prisma/migrations/20261101260000_audit_event/migration.sql`, `TODO.md`.

`AuditEvent` menyimpan actor opsional, aksi, tipe dan ID entity, waktu kejadian, alasan opsional, dan metadata JSONB dengan default `{}`. Indeks mendukung pencarian berdasarkan actor dan entity/waktu. Trigger database menolak `UPDATE` dan `DELETE` pada event; nilai metadata tetap harus dibentuk aman oleh operasi backend, tanpa secret/token/signed URL/konten unggahan.

Verify task `npm run db:migrate` dan pemeriksaan katalog/invariant, pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db16_tmp_6a3ec66dc6

> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Datasource "db": PostgreSQL database "rk_db16_tmp_6a3ec66dc6", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

16 migrations found in prisma/migrations
Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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

All migrations have been successfully applied.
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
MIGRATION_EXIT_CODE=0
AUDIT_EVENT_CONSTRAINTS=[{"conname":"audit_events_action_not_null","contype":"n","definition":"NOT NULL action"},{"conname":"audit_events_actor_id_fkey","contype":"f","definition":"FOREIGN KEY (actor_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE SET NULL"},{"conname":"audit_events_entity_id_not_null","contype":"n","definition":"NOT NULL entity_id"},{"conname":"audit_events_entity_type_not_null","contype":"n","definition":"NOT NULL entity_type"},{"conname":"audit_events_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"audit_events_occurred_at_not_null","contype":"n","definition":"NOT NULL occurred_at"},{"conname":"audit_events_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"audit_events_safe_metadata_not_null","contype":"n","definition":"NOT NULL safe_metadata"}]
AUDIT_EVENT_INDEXES=[{"indexname":"audit_events_actor_id_idx","indexdef":"CREATE INDEX audit_events_actor_id_idx ON public.audit_events USING btree (actor_id)"},{"indexname":"audit_events_entity_time_idx","indexdef":"CREATE INDEX audit_events_entity_time_idx ON public.audit_events USING btree (entity_type, entity_id, occurred_at DESC)"},{"indexname":"audit_events_pkey","indexdef":"CREATE UNIQUE INDEX audit_events_pkey ON public.audit_events USING btree (id)"}]
AUDIT_EVENT_TRIGGERS=[{"tgname":"audit_events_no_delete","definition":"CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit_event_mutation()"},{"tgname":"audit_events_no_update","definition":"CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit_event_mutation()"}]
AUDIT_EVENT_GUARD_FUNCTION=[{"proname":"reject_audit_event_mutation","definition":"CREATE OR REPLACE FUNCTION public.reject_audit_event_mutation()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n    RAISE EXCEPTION 'Audit events are append-only' USING ERRCODE = '55000';\nEND;\n$function$\n"}]
AUDIT_EVENT_ROUNDTRIP={"actor_id":"647718c3-e726-4a9c-832e-ad43a257196b","action":"PAYMENT_VERIFIED","entity_type":"Payment","entity_id":"b5c66e64-5c40-43f4-9bef-2f1595c6a11e","occurred_at":"2026-11-01T04:10:27.556Z","reason":"Synthetic audit reason","safe_metadata":{"count":1,"source":"verify"}}
AUDIT_EVENT_DEFAULTS={"actor_id":null,"safe_metadata":{}}
AUDIT_EVENT_UPDATE_REJECTED=true
AUDIT_EVENT_DELETE_REJECTED=true
AUDIT_EVENT_COUNT_AFTER_REJECTED_MUTATIONS=2
AUDIT_EVENT_VERIFY=append-only update/delete guard, optional actor, safe JSON default, entity/actor indexes, and FK verified
DISPOSABLE_DATABASE_REMOVED=true
```

Approved: 2026-11-01 by zeenn.

Re-Verify setelah FK actor audit diubah dari `ON DELETE SET NULL` ke `ON DELETE RESTRICT`, agar event tetap immutable saat akun actor dihapus:

```text
DISPOSABLE_DATABASE_CREATED=rk_db16_tmp_009c7d5866
Datasource "db": PostgreSQL database "rk_db16_tmp_009c7d5866", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"
16 migrations found in prisma/migrations
Applying migration `20261101260000_audit_event`
All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
AUDIT_EVENT_CONSTRAINTS=[{"conname":"audit_events_action_not_null","contype":"n","definition":"NOT NULL action"},{"conname":"audit_events_actor_id_fkey","contype":"f","definition":"FOREIGN KEY (actor_id) REFERENCES app_users(id) ON UPDATE CASCADE ON DELETE RESTRICT"},{"conname":"audit_events_entity_id_not_null","contype":"n","definition":"NOT NULL entity_id"},{"conname":"audit_events_entity_type_not_null","contype":"n","definition":"NOT NULL entity_type"},{"conname":"audit_events_id_not_null","contype":"n","definition":"NOT NULL id"},{"conname":"audit_events_occurred_at_not_null","contype":"n","definition":"NOT NULL occurred_at"},{"conname":"audit_events_pkey","contype":"p","definition":"PRIMARY KEY (id)"},{"conname":"audit_events_safe_metadata_not_null","contype":"n","definition":"NOT NULL safe_metadata"}]
AUDIT_EVENT_INDEXES=[{"indexname":"audit_events_actor_id_idx","indexdef":"CREATE INDEX audit_events_actor_id_idx ON public.audit_events USING btree (actor_id)"},{"indexname":"audit_events_entity_time_idx","indexdef":"CREATE INDEX audit_events_entity_time_idx ON public.audit_events USING btree (entity_type, entity_id, occurred_at DESC)"},{"indexname":"audit_events_pkey","indexdef":"CREATE UNIQUE INDEX audit_events_pkey ON public.audit_events USING btree (id)"}]
AUDIT_EVENT_TRIGGERS=[{"tgname":"audit_events_no_delete","definition":"CREATE TRIGGER audit_events_no_delete BEFORE DELETE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit_event_mutation()"},{"tgname":"audit_events_no_update","definition":"CREATE TRIGGER audit_events_no_update BEFORE UPDATE ON public.audit_events FOR EACH ROW EXECUTE FUNCTION reject_audit_event_mutation()"}]
AUDIT_EVENT_GUARD_FUNCTION=[{"proname":"reject_audit_event_mutation","definition":"CREATE OR REPLACE FUNCTION public.reject_audit_event_mutation()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n    RAISE EXCEPTION 'Audit events are append-only' USING ERRCODE = '55000';\nEND;\n$function$\n"}]
AUDIT_EVENT_ROUNDTRIP={"actor_id":"647718c3-e726-4a9c-832e-ad43a257196b","action":"PAYMENT_VERIFIED","entity_type":"Payment","entity_id":"b5c66e64-5c40-43f4-9bef-2f1595c6a11e","occurred_at":"2026-11-01T04:11:19.136Z","reason":"Synthetic audit reason","safe_metadata":{"count":1,"source":"verify"}}
AUDIT_EVENT_DEFAULTS={"actor_id":null,"safe_metadata":{}}
AUDIT_EVENT_UPDATE_REJECTED=true
AUDIT_EVENT_DELETE_REJECTED=true
AUDIT_ACTOR_DELETE_REJECTED=true
AUDIT_EVENT_COUNT_AFTER_REJECTED_MUTATIONS=2
AUDIT_EVENT_VERIFY=append-only update/delete guard, optional actor, safe JSON default, entity/actor indexes, and actor deletion protection verified
DISPOSABLE_DATABASE_REMOVED=true
```

<a id="evidence-m06-db-17"></a>

### Evidence M06-DB-17: Seeder sintetis idempotent (2026-11-01)

File yang diubah untuk task ini: `prisma/seed.ts`, `prisma.config.ts`, `package.json`, dan `TODO.md`.

Seed memakai ID tetap dan `ON CONFLICT (id) DO UPDATE` di dalam transaksi. Fixture meliputi Owner, Staff, Tenant, profil Tenant, kamar, lease aktif, invoice dan baris sewa, klaim pembayaran `PENDING`, pengeluaran, tiket berjalan, dan komentar tenant-visible. Email memakai domain `.invalid`; subject seed bukan akun Neon Auth dan tidak dapat dipakai login. Tidak ada password/kredensial yang dibuat.

Verify `npm run db:migrate` dan `npm run db:seed` dua kali pada database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db17_2506e9a59f
16 migrations found in prisma/migrations
Applying migration `20261031120000_app_user`
Applying migration `20261101120000_tenant_profile`
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
All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
SEED_RUN=1
> rumakost@0.1.0 db:seed
> prisma db seed
Running seed command `node --experimental-strip-types prisma/seed.ts` ...
SEED_STATUS=success
SEED_AUTH_ACCOUNTS=not-created; fixture subjects cannot log in
The seed command has been executed.
SEED_SNAPSHOT_1={"counts":{"app_users":3,"tenant_profiles":1,"rooms":1,"leases":1,"invoices":1,"invoice_lines":1,"payments":1,"expenses":1,"tickets":1,"ticket_comments":1},"relations":{"users":3,"owners":1,"staff":1,"tenants":1,"pending_payments":1,"in_progress_tickets":1}}
SEED_RUN=2
> rumakost@0.1.0 db:seed
> prisma db seed
Running seed command `node --experimental-strip-types prisma/seed.ts` ...
SEED_STATUS=success
SEED_AUTH_ACCOUNTS=not-created; fixture subjects cannot log in
The seed command has been executed.
SEED_SNAPSHOT_2={"counts":{"app_users":3,"tenant_profiles":1,"rooms":1,"leases":1,"invoices":1,"invoice_lines":1,"payments":1,"expenses":1,"tickets":1,"ticket_comments":1},"relations":{"users":3,"owners":1,"staff":1,"tenants":1,"pending_payments":1,"in_progress_tickets":1}}
SEED_IDEMPOTENT=true
SEED_VERIFY=three synthetic roles and demo relations present; rerun created no duplicates
DISPOSABLE_DATABASE_REMOVED=true
```

Node lokal yang dipakai adalah v22.13.1; Node mengeluarkan warning bahwa type stripping masih experimental pada versi lokal. Target proyek tetap Node 24.x.

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-18"></a>

### Evidence M06-DB-18: Verifikasi indeks, constraint, dan rollback migrasi (2026-11-01)

Audit migration menemukan FK komposit `ticket_attachments(comment_id, ticket_id)` belum memiliki indeks child dengan urutan kolom lengkap. Schema kini memakai indeks gabungan; migration tambahan `20261101270000_ticket_attachment_comment_ticket_index` mengganti indeks tunggal `comment_id` dengan indeks gabungan tersebut.

Verify `npm run db:migrate`, audit katalog PostgreSQL, dan rollback dengan menghapus database sekali pakai:

```text
DISPOSABLE_DATABASE_CREATED=rk_db18_f315e9c24a
17 migrations found in prisma/migrations
Applying migration `20261101270000_ticket_attachment_comment_ticket_index`
All migrations have been successfully applied.
MIGRATION_EXIT_CODE=0
FK_INDEX_GAPS=[]
CHECK_CONSTRAINT_COUNT=20
REQUIRED_CHECKS=20
MISSING_REQUIRED_CHECKS=[]
UNIQUE_INDEX_COUNT=26
MISSING_REQUIRED_UNIQUE=[]
LEASE_ACTIVE_PERIOD_EXCLUSION=[{"conname":"leases_room_active_period_excl","definition":"EXCLUDE USING gist (room_id WITH =, daterange(starts_on, ends_on, '[]'::text) WITH &&) WHERE ((status = ANY (ARRAY['SCHEDULED'::\"LeaseStatus\", 'ACTIVE'::\"LeaseStatus\"])))"}]
MIGRATION_LEDGER={"applied":17,"all_finished":true}
DB18_CATALOG_VERIFY=FK indexes, numeric/date checks, domain uniqueness and active lease exclusion verified
DISPOSABLE_DATABASE_REMOVED=true
ROLLBACK_DATABASE_ABSENT=true
```

Rollback diverifikasi dengan menghapus database verifikasi terisolasi; Prisma migration tetap bersifat forward-only dan tidak punya skrip down. Tidak ada database utama yang dimigrasikan.

Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-19"></a>

### Evidence M06-DB-19: Lease aktif tunggal per Penghuni (2026-11-01)

File yang diubah: `prisma/migrations/20261101280000_tenant_active_period/migration.sql` dan `TODO.md`. Constraint GiST baru menolak rentang tanggal bertabrakan untuk `tenant_user_id` yang sama pada status `SCHEDULED`/`ACTIVE`. Constraint kamar yang sudah ada tetap berlaku. Data Lease `ENDED`/`CANCELLED` tidak dibatasi oleh constraint baru.

Verify database Neon sekali pakai, dengan data sintetis:

```text
VERIFY_MIGRATE_EXIT=0
VERIFY_MIGRATIONS_APPLIED=true
VERIFY_TENANT_OVERLAP_REJECTED=true
VERIFY_NONOVERLAPPING_PERIOD_ALLOWED=true
VERIFY_DIFFERENT_TENANT_ALLOWED=true
VERIFY_ENDED_HISTORY_ALLOWED=true
DISPOSABLE_DATABASE_REMOVED=true
EXIT_CODE=0
```

Database uji dihapus. `git diff --check` exit 0; hanya warning konversi line ending LF/CRLF. Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-20"></a>

### Evidence M06-DB-20: tipe dan dimensi kamar opsional (2026-11-01)

File diubah: `prisma/schema.prisma`, `prisma/migrations/20261101290000_room_type/migration.sql`, `prisma/migrations/20261101300000_room_dimensions/migration.sql`, `docs/pm/SCOPE_STATEMENT.md`, `docs/pm/KANBAN.md`, `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`, `CONTEXT.md`, dan `TODO.md`.

Verify `npx prisma validate` menggunakan URL PostgreSQL sintetis yang tidak menunjuk ke database:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

`Room.roomType` menyimpan label opsional tanpa tabel katalog dinamis. `widthMeters` dan `lengthMeters` menyimpan pasangan dimensi opsional dalam meter; check constraint menolak pasangan parsial, nol, dan negatif. Luas diturunkan, bukan disimpan. CR-2026-001 menambahkan pagu operasional bulanan ke scope; model pagu dijadwalkan terpisah pada M06-DB-21.

Verify `npx prisma validate` memakai URL PostgreSQL sintetis yang tidak menunjuk ke database. Penerapan dan uji constraint migration pada DB PostgreSQL sekali pakai masih harus diverifikasi; migration tidak dijalankan terhadap Neon milik Owner. Task tetap menunggu review dan verifikasi DB uji.

Raw Verify tambahan 2026-11-01:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0

git diff --check: exit 0
warning: LF will be replaced by CRLF for CONTEXT.md, RUNBOOK_LOCAL.md, package.json, prisma/schema.prisma
```

Raw Verify migration DB-20 pada database PostgreSQL WASM sekali pakai (PGlite, in-memory; tanpa koneksi `.env.local`):

```text
{"existingRowNullable":true,"validPairAccepted":true,"nullPairAccepted":true,"partialPairRejected":true,"zeroRejected":true,"negativeRejected":true,"totalRoomRows":3,"nullableRoomTypes":2}
```

Raw Verify `npx prisma validate --config .prisma.verify.config.ts` dengan URL PostgreSQL sintetis; config sementara dihapus setelah command:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
VERIFY_TEMP_DIR_REMOVED=true
```

Tidak ada database Neon/Owner yang disentuh. Validasi `prisma migrate deploy` terhadap Neon belum dijalankan; task menunggu review Owner.

<a id="evidence-m06-db-21"></a>

### Evidence M06-DB-21: pagu operasional bulanan (2026-11-01)

Ditambahkan model `OperatingBudget`: satu row untuk `periodStart` (tanggal hari pertama bulan), nominal `Decimal(12,2)`, updater wajib `AppUser`, serta waktu dibuat/diubah. Migration menambahkan unique index periode, check hari pertama bulan, check nominal > 0, dan FK updater dengan `ON DELETE RESTRICT`. Tidak ada nilai default pagu. Pembaruan pagu tetap memakai row yang sama; riwayat perubahan dicatat sebagai event terpisah di `AuditEvent`.

Raw Prisma Verify memakai konfigurasi sementara dengan URL PostgreSQL sintetis, tanpa memuat `prisma.config.ts` atau `.env.local`:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

Raw Verify migration tepat pada PGlite in-memory disposable:

```text
{"duplicateRejected":true,"nonFirstRejected":true,"zeroRejected":true,"negativeRejected":true,"badUpdaterRejected":true,"upsertKeepsOneRow":true,"updatedAmount":"1250000.00","auditEventsAfterSetAndUpdate":2}
```

SQL transaksi simulasi berhasil mempertahankan satu pagu dan menambahkan event untuk set serta update. Database hanya menjamin row pagu, constraint, FK, dan penyimpanan event; DB tidak memaksa setiap update pagu menghasilkan event atau memastikan updater ber-role Owner. Operasi backend harus mengecek role Owner dan menulis `AuditEvent` bersama upsert dalam transaksi. `npm run db:migrate` ke server PostgreSQL disposable tidak dijalankan; PGlite memeriksa SQL migration langsung. Tidak ada Neon/DB Owner yang disentuh. Task menunggu review Owner.

<a id="evidence-m06-db-22"></a>

### Evidence M06-DB-22: fixture dimensi kamar dan pagu (2026-11-01)

`prisma/seed.ts` kini menambahkan tipe kamar `Standar AC`, dimensi sintetis 3,50 ? 4,00 meter, dan satu pagu November 2026 sebesar Rp5.000.000 sebagai fixture saja. Seed logic diekspor sebagai fungsi agar dapat dijalankan dengan koneksi database disposable tanpa memuat konfigurasi environment; jalur CLI tetap memuat konfigurasi lokal hanya ketika seed dijalankan langsung.

Raw Verify fungsi seed dijalankan dua kali di PGlite in-memory setelah 20 migration diterapkan:

```text
(node:25792) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
{"migrationsApplied":20,"giSTLeaseConstraintsSkippedForPGlite":true,"seedRuns":2,"countsStable":true,"counts":{"app_users":3,"tenant_profiles":1,"rooms":1,"leases":1,"invoices":1,"invoice_lines":1,"payments":1,"expenses":1,"operating_budgets":1,"tickets":1,"ticket_comments":1},"roomAndBudget":{"room_type":"Standar AC","width_m":"3.50","length_m":"4.00","period_start":"2026-11-01","amount":"5000000.00"}}
```

Percobaan awal menerapkan semua migration menghasilkan kegagalan berikut; Verify dilanjutkan dengan melewati hanya constraint GiST yang tidak didukung PGlite:

```text
MIGRATION_FAILED=20261101140000_lease: extension "btree_gist" is not available
```

PGlite tidak menyediakan ekstensi `btree_gist`; saat membuat DB verifikasi di memori, migration Lease dijalankan tanpa exclusion constraint GiST dan migration exclusion Tenant dilewati. Seed function yang sama dengan jalur CLI tetap dijalankan dua kali dan menghasilkan jumlah row stabil. `npm run db:seed` tidak dijalankan karena konfigurasi CLI memuat `.env.local`; tidak ada nilai secret yang dibaca dan tidak ada database Neon/Owner yang disentuh. Evidence ini memverifikasi idempotensi fixture, bukan exclusion constraint Lease/Tenant. Task menunggu review Owner.

<a id="evidence-m06-db-23"></a>

### Evidence M06-DB-23: cakupan DB untuk WF-02 (2026-11-01)

Audit cakupan dan rekonsiliasi fixture mengikuti rekomendasi yang diterima Owner. Data Room mendukung kode, lantai, tipe, dimensi, tarif, status fisik; okupansi diturunkan dari Lease. Payment/Invoice/Expense/Ticket menyimpan sumber untuk metrik dashboard, sedangkan agregasi periode, filter, status tampilan, dan pembatasan role adalah tanggung jawab query/backend. `OperatingBudget` belum ada di schema/migration; implementasinya tetap task M06-DB-21. Tidak perlu tabel properti untuk satu properti statis; foto kamar dan notification center bukan kebutuhan DB P0 pada scope sekarang.

Baseline WF-02 kini menurunkan penerimaan 8 kamar lunas dari tabel tarif, dan mengasumsikan satu invoice RENT Oktober diterbitkan untuk setiap lease aktif. Nilai invoice cohort Rp14,35 juta; pembayaran lunas Rp10,35 juta; kolektibilitas 72,1%. Ini rekonsiliasi asumsi, bukan bukti detail invoice/payment: runbook belum memiliki transaksi PaymentAllocation atau baris Expense; Rp4,2 juta masih agregat fixture. B-05 diselaraskan ke Standar AC/Rp1,5 juta. A-04 tetap berstatus belum lunas namun belum jatuh tempo, terpisah dari dua kamar terlambat; notifikasi “pembayaran dikonfirmasi” diselaraskan menjadi pengajuan menunggu verifikasi. Arus kas bersih tercatat Rp6,15 juta memakai agregat pengeluaran fixture; klaim tren dihilangkan karena pembanding konsisten tidak tersedia. WF-06/WF-07 memakai fixture penghuni/tarif berbeda dan tidak digabung. Feed aktivitas dapat dirakit dari sumber domain yang ada, tetapi query union/ownership/deep-link dan event yang dicatat perlu dispesifikasikan backend.

Raw Verify kalkulasi fixture:

```text
WF02_ROOM_ROWS=15
WF02_ROOM_MONTHLY_RENT_SUM=20650000
WF02_PAID_ROOM_COUNT=8
WF02_PAID_ROOM_RENT_SUM=10350000
WF02_ACTIVE_LEASES=11
WF02_ASSUMED_ISSUED_RENT_INVOICES=14350000
WF02_COLLECTION_RATE_PERCENT=72.1254
WF02_B05_BASELINE_RENT=1500000
WF02_UNPAID_ROOMS=3 (2 overdue, 1 due in 3 days)
WF02_OPERATING_EXPENSE=4200000
WF02_RECORDED_NET_CASHFLOW=6150000
WF02_PAYMENT_ALLOCATION_ROWS=not present in WF-02 fixture
WF02_EXPENSE_LINE_ITEMS=not present in WF-02 fixture
WF02_A04_NOTIFICATION=payment pending verification (aligned)
```

WF-02-SK-04 crosswalk diperbarui agar CR-2026-001 menggantikan keputusan gauge anggaran ditunda; Rp5 juta tetap ditandai sebagai fixture, bukan default produk. Definisi metrik backend dicatat pada M05 Data/API spec. Prototipe WF-02 M04 masih memuat angka/status lama pada kartu, chart, filter kamar, dan notifikasi pembayaran; selaraskan sebelum verifikasi visual. M06-DB-21 tetap diperlukan untuk tabel OperatingBudget. Perubahan ini menunggu review Owner; tidak ada migration atau test dijalankan.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Raw Verify traceability:

```text
prisma/schema.prisma:133:model Room
prisma/schema.prisma:137:roomType
prisma/schema.prisma:138:widthMeters
prisma/schema.prisma:142:physicalStatus
prisma/schema.prisma:151:model Lease
prisma/schema.prisma:200:model Invoice
prisma/schema.prisma:223:model InvoiceLine
prisma/schema.prisma:266:model PaymentAllocation
prisma/schema.prisma:319:model Expense
prisma/schema.prisma:335:model Ticket
prisma/schema.prisma:405:model AuditEvent
M05-DATA-API-SPEC-DRAFT.md:124:getFinancialReport
M05-DATA-API-SPEC-DRAFT.md:131:Agregat dasbor WF-02
WF-02-SK-04 dan WF-02-SK-07 crosswalk ditemukan
STALE_FIXTURE_SEARCH=0 matches
DIFF_CHECK_EXIT_CODE=0
```

<a id="evidence-m06-db-24"></a>

### Evidence M06-DB-24: integritas dan siklus hidup kamar WF-03 (2026-11-01)

File task ini mengubah `prisma/schema.prisma`, migration `20261101320000_room_floor_lifecycle`, `prisma/seed.ts`, FSD, PRD, Frozen Scope, M05 Data/API, crosswalk WF-03, `CONTEXT.md`, dan task/evidence ini. Migration membuat katalog lantai dan mem-backfill label lantai lama, mengarsipkan Room/Floor, menormalkan kode, membatasi tarif/deposit, serta menghapus default DB deposit agar nilai harus diberikan eksplisit. Fixture kamar demo memakai deposit Rp750.000 (50% dari Rp1.500.000).

Raw Verify Prisma memakai URL PostgreSQL sintetis dan config sementara (tidak membaca `.env.local`):

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid
PRISMA_EXIT_CODE=0
```

Raw Verify migration dan constraint pada PGlite in-memory:

```text
{"migrationApplied":true,"badCodeRejected":true,"tooLongRejected":true,"zeroRentRejected":true,"excessiveRentRejected":true,"excessiveDepositRejected":true,"duplicateCodeRejected":true,"floorHardDeleteRejected":true,"archiveStored":true,"backfilledFloors":1,"backfilledRooms":3,"depositHasNoDefault":true}
EXIT_CODE=0
```

Raw Verify migration menolak benturan kode legacy hasil normalisasi sebelum mengubah data:

```text
{"normalizedCollisionMigrationRejected":true,"existingCodesUnchanged":true,"floorTableNotCreated":true}
EXIT_CODE=0
```

Raw Verify seluruh migration selain exclusion GiST yang tidak didukung PGlite, lalu seed fixture dua kali:

```text
{"migrationsApplied":21,"giSTLeaseConstraintsSkippedForPGlite":true,"seedRuns":2,"counts":{"users":3,"rooms":1,"floors":1,"leases":1,"budgets":1},"roomFixture":{"code":"DEMO-01","monthly_rent":"1500000.00","deposit_default_amount":"750000.00","floor_id":"90000000-0000-4000-8000-000000000001"}}
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
PRISMA_EXIT_CODE=0
DIFF_CHECK_EXIT_CODE=0
```

PGlite tidak menguji exclusion constraint GiST Lease/Tenant. Neon milik Owner dan `.env.local` tidak disentuh; `npm run db:migrate` tidak dijalankan. Task tetap menunggu review Owner. Implementasi operasi arsip, RBAC, audit event, dan larangan mengarsipkan kamar/lantai yang masih aktif tetap pekerjaan backend terpisah.

<a id="evidence-m06-db-25"></a>

### Evidence M06-DB-25: audit seluruh skenario WF-03 untuk lapisan DB (2026-11-01)

Audit mencocokkan 57 judul/runbook SK-01 sampai SK-57, seluruh 57 baris crosswalk WF-03, `prisma/schema.prisma`, migration Room/Floor, FSD, PRD, Frozen Scope, dan M05 Data/API. Tidak ada skenario yang terlewat dari runbook atau crosswalk.

Raw Verify kelengkapan ID dan field terkait:

```text
SCENARIO_COUNT=57
CROSSWALK_COUNT=57
MISSING_SCENARIO_IDS=none
MISSING_CROSSWALK_IDS=none
TENANT_PHONE_FIELD=missing
ROOM_NOTE_FIELD=missing
ROOM_METER_FIELD=missing
FLOOR_ROOM_ARCHIVE_FIELDS=present
ROOM_CODE_AND_AMOUNT_CONSTRAINTS=present
EXIT_CODE=0
```

Data/constraint DB yang sudah tersedia:

- Master Room/Floor: SK-03/04/06/17/28; kode kanonik dan unique, Floor normalized unique, rent/deposit bounded: SK-03/21/28/41; dimensi berpasangan dan positif: SK-14.
- Status fisik/okupansi dan histori: Room physical status, Lease periods/rent snapshot, FK Ticket.roomId: SK-05/07/09/24/26/27/31/35/46/47/54. Invoice/Payment/Allocation menyediakan sumber status pembayaran dan realisasi untuk SK-26/27. Query, agregasi, RBAC, transisi, dan penolakan bisnis lintas tabel tetap bukan constraint schema.
- Archive timestamp untuk Room/Floor tersedia: SK-10/11/17/48. Namun DB belum melarang hard delete kamar tanpa referensi, atau mencegah archive kamar aktif/lantai yang masih punya kamar aktif; FK hanya menolak hard delete saat ada referensi. Guard tersebut perlu dikerjakan backend atau keputusan Owner untuk enforcement DB tambahan.
- SK-56: kolom menyimpan nilai deposit dan rentang valid; rumus 50% dengan pembulatan ke Rp50.000 adalah kalkulasi aplikasi/backend, bukan DB.

Gap/keputusan yang belum selesai:

- SK-16/30/45 memerlukan telepon penghuni untuk link WhatsApp. M05 Data/API menyebut `AppUser.phone?`, tetapi Prisma `AppUser`/`TenantProfile` belum memiliki nomor telepon. Tentukan field kanonik dan aturan normalisasi sebelum menganggap jalur kontak ditopang DB.
- SK-05/24/41 menyebut catatan pemeliharaan/catatan kamar. Room tidak punya kolom notes; detail insiden dapat ditampung pada `Ticket.description`, tetapi catatan umum per kamar belum punya tempat. Pastikan seluruh catatan yang dimaksud adalah deskripsi tiket atau putuskan kolom terpisah.
- SK-07 menampilkan target selesai pemeliharaan. Ticket menyimpan assignee internal, tetapi belum menyimpan target/due date. Akun Teknisi berada di luar scope; putuskan apakah target tanggal tetap dibutuhkan.
- Meter listrik SK-25, fasilitas dinamis SK-34, kapasitas/gender SK-23/SK-51, foto kamar SK-15/SK-57, cetak SK-50, serta fitur P1 keyboard/shortcut SK-54/SK-55 tidak menjadi kebutuhan DB P0 sesuai Frozen Scope. Media P0 tetap untuk Ticket.
- Crosswalk masih salah mengklasifikasikan SK-51, SK-54, dan SK-55 sebagai `MVP candidate`, padahal tabel runbook WF-03 menandai ketiganya P1; status scope crosswalk perlu dirapikan.
- UI/filter/keyboard/modal/deep-link/offline/session/debounce/paste/WA formatting/XSS rendering adalah UI/backend, bukan DB: SK-01/02/08/12/13/18/19/20/22/29/30/33/36/37/38/39/40/42/43/44/49/52/53/55. DB menyimpan sumber terkait jika memang in-scope, tetapi tidak menjalankan perilaku itu.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Audit ini tidak mengubah schema atau BE dan tidak menyentuh Neon. M06-DB-24 tetap menunggu review Owner; M06-DB-25 juga menunggu review. Beberapa keputusan field dan archive enforcement di atas harus diselesaikan sebelum seluruh kebutuhan data WF-03 dapat disebut selesai.

<a id="evidence-m06-db-26"></a>

### Evidence M06-DB-26: penutupan gap persistensi WF-03 (2026-11-01)

Migration menambah `TenantProfile.phoneE164` nullable dengan format E.164 dan tidak unik, `Room.maintenanceNote` opsional maksimal 500 karakter, serta `Ticket.targetCompletionOn` opsional bertipe DATE. Trigger DB menolak hard delete Room/Floor; arsip Room saat Lease `SCHEDULED`/`ACTIVE`; perubahan status fisik Room saat Lease demikian; arsip Floor dengan Room belum diarsipkan; Room aktif yang diarahkan ke Floor arsip; serta Lease `SCHEDULED`/`ACTIVE` pada Room arsip/`MAINTENANCE`. Crosswalk SK-51/54/55 sekarang sesuai P1/out-of-scope dan batas DB.

Raw Verify Prisma dengan URL sintetis:

```text
Loaded Prisma config from .prisma.verify.config.ts.
Prisma schema loaded from prisma\schema.prisma.
Formatted prisma\schema.prisma in 58ms 🚀
Loaded Prisma config from .prisma.verify.config.ts.
Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify migration lengkap dan aturan baru pada PGlite disposable:

```text
(node:2860) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(node:2860) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Workspace\RumaKost\package.json.
{
  "migrationsApplied": 22,
  "giSTLeaseConstraintsSkippedForPGlite": true,
  "seedRuns": 2,
  "counts": {
    "users": 3,
    "rooms": 1,
    "leases": 1,
    "tickets": 1
  },
  "rejected": [
    "phone E.164",
    "room note max 500",
    "active lease blocks room archive",
    "active lease blocks status change",
    "active room blocks floor archive",
    "room hard delete",
    "floor hard delete",
    "lease on maintenance room",
    "lease on archived room",
    "room restore onto archived floor",
    "room insert onto archived floor"
    "room insert onto archived floor"
  ],
  "result": "PASS"
}
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

PGlite tidak menjalankan constraint exclusion GiST; migrasi 22 dari 23 dijalankan, migration Tenant GiST-only dilewati, dan exclusion di migration Lease disingkirkan sementara untuk keterbatasan emulator. Tidak memakai Neon, `.env.local`, atau `npm run db:migrate`. Tidak ada backend yang diubah. M06-DB-26 dan cakupan DB WF-03 menunggu review Owner.

<a id="evidence-m06-db-27"></a>

### Evidence M06-DB-27: audit WF-04 untuk lapisan DB (2026-11-01)

Audit read-only mencocokkan judul skenario WF-04, crosswalk, schema/migration Lease, LeaseEndRequest, Invoice/InvoiceLine, Payment/PaymentAllocation, dan DepositLedgerEntry, serta persyaratan FSD/PRD/M05.

Raw Verify kelengkapan ID runbook dan crosswalk:

```text
{
  "runbookCount": 40,
  "crosswalkCount": 40,
  "missingHeadings": [],
  "missingCrosswalk": [],
  "duplicatesHeadings": [],
  "duplicatesCrosswalk": [],
  "result": "PASS"
}
EXIT_CODE=0
```

Data/invarian yang sudah ditopang DB:

- Profil penghuni memakai `AppUser.displayName`, `TenantProfile.phoneE164` opsional tervalidasi E.164, dan `emergencyContact` nullable. Lease menghubungkan satu `tenantUserId` dengan satu `roomId`; `startsOn`, `endsOn`, tarif/deposit snapshot, `billingMode`, dan status tersimpan. Lease menolak tanggal akhir yang tidak sesudah tanggal mulai, tarif nonpositif, deposit negatif, serta Lease `SCHEDULED`/`ACTIVE` yang tanggalnya bertabrakan pada Tenant atau kamar melalui exclusion constraint rentang inklusif. Ini mendukung data dasar SK-01/02/04/05/09/30.
- Invoice menyimpan periode, due date, status/void, dan unique Lease-periode-jenis; periode akhir tidak boleh sebelum awal. InvoiceLine membatasi tipe ke `RENT`/`DEPOSIT` dan jumlah positif. Payment menyimpan nilai dan state review yang konsisten; PaymentAllocation menyimpan relasi ke payment/line, nilai positif, serta mencegah pasangan payment-line duplikat. Ini menyediakan struktur invoice awal SK-05 dan sumber riwayat/tagihan SK-01/04.
- LeaseEndRequest menyimpan tanggal permintaan dan state review yang konsisten. DepositLedgerEntry membatasi tipe entry, nilai positif, referensi sesuai jenis entry, dan append-only; refund boleh bergerak dari `PENDING` ke `PAID` atau `REJECTED`. Lease + ledger menyediakan penyimpanan check-out/rekonsiliasi SK-11/12.

Gap atau batas yang perlu diputuskan sebelum WF-04 disebut lengkap di DB:

1. **SK-09 — nama kosong masih lolos DB.** `app_users.display_name` adalah `NOT NULL`, tetapi tidak ada `CHECK` yang menolak `''` atau spasi saja. Tambahkan constraint nonblank bila DB harus menjamin kriteria ini, selain validasi form/server.
2. **SK-34 — DB tidak menjamin saldo escrow tidak negatif.** Tiap entry positif, tetapi tidak ada constraint/trigger yang membatasi total `APPLIED_TO_RENT` + `WITHHELD_AT_CHECKOUT` + `REFUNDED` pada saldo `COLLECTED`. M05 menyebut pemeriksaan dan lock di transaksi backend; itu dapat melindungi jalur backend, tetapi bukan jaminan DB bagi semua penulis. Trigger/prosedur DB yang mengunci Lease dapat menegakkan batas agregat bila Owner menginginkannya.
3. **Relasi escrow lintas tabel hanya dicek sebagian.** Constraint memastikan `COLLECTED` punya payment allocation dan `APPLIED_TO_RENT` punya invoice line, tetapi tidak memeriksa bahwa line sumber benar-benar berjenis DEPOSIT/RENT dan berasal dari Lease yang sama. M05 menyatakan invarian tersebut; enforcement sekarang bergantung pada operasi backend.
4. **Kontak darurat belum terstruktur.** SK-02/SK-39 memakai parsing teks untuk memperoleh nomor yang dituju `tel:`. DB menyimpan seluruh `emergencyContact` dalam satu text; hanya nomor telepon utama penghuni yang dinormalisasi. Field telepon kontak darurat terpisah akan membuat nomor yang dapat ditelepon tervalidasi, tetapi perlu keputusan apakah pemisahan nama/relasi/nomor memang diinginkan.
5. **Nomor SPK tidak punya kolom Lease.** SK-04 menampilkan nomor seperti `SPK-2025/RUMA/A-01`; schema hanya menyediakan UUID Lease dan tidak menyimpan nomor kontrak stabil/unik. PRD/FSD tidak mewajibkan nomor SPK dan PDF kontrak berada di luar scope. Putuskan apakah nomor tampilan diturunkan dari ID atau perlu disimpan sebagai nomor kontrak.
6. **Beberapa detail dossier SK-01/SK-05 tidak ada di model, tetapi batas P0 belum menetapkannya:** pekerjaan, instansi, dan kota asal. NIK/dokumen KTP secara eksplisit di luar scope. Karena itu, jangan otomatis menambah kolom sebelum field non-NIK tersebut dikonfirmasi sebagai data P0.
7. **Crosswalk SK-08 terlalu luas.** KTP sintetis/dropzone ditandai `MVP candidate` meski PRD §2/§6 mengecualikan NIK/dokumen identitas. Perilaku unggah identitas harus diklasifikasikan out-of-scope; tidak ada tabel/field identitas pada DB.

Skenario annual upfront/diskon, renewal, roommate, mutasi/transfer PIC, denda, tamu, kendaraan/RFID, biaya insidental, WhatsApp broadcast, token listrik, serta PDF export berada di luar batas MVP menurut PRD/Frozen Scope dan tidak dihitung sebagai gap DB P0. Direktori/filter/tab/deep link/responsivitas juga UI; status tagihan/kontrak diturunkan dari Lease, Invoice, dan Payment, bukan memerlukan status duplikat.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Audit ini tidak mengubah schema, crosswalk, atau backend; tidak menyentuh Neon maupun `.env.local`. Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-28"></a>

### Evidence M06-DB-28 — penutupan gap DB WF-04 (2026-11-01)

Perubahan: migration baru menolak nama kosong/spasi, menyusun field pekerjaan/instansi/kota asal serta kontak darurat terstruktur, mempertahankan `emergency_contact` lama dengan rename ke `emergency_contact_note`, menambahkan nomor SPK opsional unik, dan mengunci Lease ketika memvalidasi sumber serta saldo escrow. Refund baru wajib `PENDING`; yang pending/paid mengambil saldo, sedangkan refund yang ditolak membebaskan kembali saldo. Seed dan PRD/FSD/M05/scope diselaraskan; crosswalk KTP WF-04-SK-08 kini out-of-scope sesuai pengecualian NIK/dokumen identitas. Tidak ada backend atau Neon yang diubah.

Raw Verify `npx prisma validate --config .prisma.verify.config.ts` dengan URL sintetis:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify migration, constraints, ledger, serta seed dua kali pada PGlite in-memory disposable:

```text
(node:25896) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(node:25896) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Workspace\RumaKost\package.json.
{
  "migrationsApplied": 23,
  "migrationDirectories": 24,
  "gistTenantSkipped": true,
  "gistLeaseRemoved": true,
  "legacyEmergencyContactPreserved": true,
  "seedRuns": 2,
  "seedCounts": {
    "users": 4,
    "tenant_profiles": 2,
    "rooms": 1,
    "leases": 1,
    "invoices": 1,
    "invoice_lines": 1,
    "payments": 1,
    "deposit_entries": 0
  },
  "profileChecks": "PASS",
  "contractNumberChecks": "PASS",
  "displayNameNonblank": "PASS",
  "depositSourceAndBalanceChecks": "PASS",
  "finalDeposit": {
    "collected": "750000.00",
    "committed": "750000.00"
  },
  "result": "PASS"
}
EXIT_CODE=0
```

PGlite tidak mendukung exclusion GiST: exclusion kamar pada migration Lease dilewati dan migration GiST tenant dilewati (23 dari 24 migration diterapkan). Verify mencakup preservasi catatan lama; validasi E.164 dan pasangan nama/nomor; nomor kontrak nonblank/unik; nama nonblank; sumber `COLLECTED` terverifikasi dan line deposit; sumber `APPLIED_TO_RENT`; penolakan overdraw; reservasi refund pending; dan pelepasan reservasi saat refund ditolak.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

M06-DB-28 Approved: 2026-11-01 by zeenn. Tidak menjalankan `npm run db:migrate`, tidak membaca `.env.local`, dan tidak menyentuh Neon.

<a id="evidence-m06-db-29"></a>

### Evidence M06-DB-29 — audit WF-05 untuk lapisan DB (2026-11-01)

Audit read-only membandingkan 61 skenario runbook WF-05 dan crosswalk dengan Invoice/InvoiceLine/Payment/PaymentAllocation/PaymentReversal/DepositLedgerEntry, migration PostgreSQL, PRD, FSD, Scope Statement, dan M05 Data/API.

Raw Verify kelengkapan ID runbook dan crosswalk:

```text
{
    "runbookCount":  61,
    "crosswalkCount":  61,
    "missingCrosswalk":  [],
    "missingRunbook":  [],
    "duplicateRunbook":  [],
    "duplicateCrosswalk":  [],
    "result":  "PASS"
}
```

DB yang sudah menangani: invoice menyimpan period/due/issued/delivery/void state dan unik per Lease + periode + kind; periode valid. InvoiceLine hanya `RENT`/`DEPOSIT` dengan amount positif. Payment amount positif dengan field review state konsisten. Allocation positif dan unik per pasangan payment-line. Reversal unik per payment dan positif. Deposit source/saldo sudah dijaga M06-DB-28. Status pelunasan/overdue dapat diturunkan dari line, alokasi terverifikasi, reversal, dan tanggal; filter/paginasi adalah query/UI.

Temuan/gap yang perlu diputuskan atau ditangani sebelum klaim WF-05 lengkap pada DB:

1. **Draft/publish tidak ada pada model.** WF-05 SK-10/11/58/61 mengharuskan state `DRAF` dan transisi ke tagihan terbit. `InvoiceStatus` hanya `ISSUED`/`VOID`; PRD/FSD/Scope tidak mendefinisikan workflow verifikasi draf ini. Putuskan apakah perilaku wireflow ditambahkan ke scope/data model atau dianggap di luar P0. Jangan menambah enum sebelum keputusan itu.
2. **Kunci idempotensi belum menjadi schema runtime.** FSD mendokumentasikan DDL `idempotency_keys`, dan PRD/kontrak M05 mensyaratkan idempotency key untuk retry; tetapi tidak ada model Prisma atau migration untuk tabel tersebut. Flag tombol di browser pada SK-49 tidak mencegah retry/concurrency lintas request. Simpan key dan hasil operasi secara atomik di DB bila kontrak idempotensi tetap berlaku.
3. **Alokasi pembayaran belum cukup dibatasi DB.** DB memastikan amount positif dan unique payment-line, tetapi tidak memastikan Payment dan InvoiceLine milik invoice yang sama, jumlah alokasi tidak melebihi Payment.amount, ataupun saldo line/invoice tidak overallocated. M05 mengharuskan alokasi sesuai nominal payment dan overpayment ditolak; agregat/saldo perlu transaksi backend dengan row lock, sedangkan konsistensi parent payment-line dapat ditegakkan DB.
4. **Reversal hanya dibatasi satu row positif per payment.** Tidak ada constraint bahwa payment asal harus `VERIFIED` atau amount reversal sama dengan nominal Payment (M05 memilih reversal penuh). Pemeriksaan actor Owner/alasan tetap backend; status asal dan nominal bisa diperkuat di DB.
5. **Void dapat melewati pembayaran pada jalur SQL langsung.** `invoices_void_state_valid` hanya mencocokkan status dengan `voided_at`; tidak mencegah void pada invoice yang memiliki alokasi terverifikasi/parsial dan tidak menyimpan alasan void secara langsung. M05 menyatakan invoice dengan payment terverifikasi harus dikoreksi dahulu. Backend wajib mengunci dan memeriksa transaksi serta menulis AuditEvent dengan alasan; DB trigger/kolom dapat menutup bypass jika dipilih.
6. **Transisi finansial belum append-only secara DB.** Payment dapat berubah dari `VERIFIED` kembali ke `PENDING` selama field review di-null-kan; PaymentAllocation dan PaymentReversal dapat diubah/dihapus. Ini dapat mengubah saldo historis. PRD/FSD menyatakan koreksi lewat reversal, bukan overwrite; perlu guard transisi/mutasi DB atau perlindungan server yang sesuai keputusan Owner.
7. **Pembatalan lalu penerbitan ulang belum jelas.** Unique Lease/periode/kind juga mencakup Invoice `VOID`, sehingga invoice keliru yang di-void tidak dapat diganti pada periode yang sama tanpa mengubah baris lama. WF-05 SK-19 meminta pembatalan, tetapi belum menentukan reissue. Tentukan proses koreksi sebelum mengubah unique key.
8. **Referensi pembayaran tidak ada di schema.** M05 mencatat `Payment.reference?`, sedangkan Prisma/migration tidak punya kolom itu; SK-14/SK-38 menampilkan referensi yang berubah per metode dan unik. Putuskan apakah nomor referensi transaksi merupakan data P0 yang perlu dipersistensikan.
9. **Crosswalk belum konsisten dengan scope transfer.** SK-14 diklasifikasikan kandidat MVP padahal skenarionya mencakup unggah bukti transfer dan pengiriman kuitansi otomatis; PRD §5, Scope Statement, dan FSD E2E secara eksplisit mengecualikan bukti transfer/kuitansi dari MVP. Catat hanya pencatatan pembayaran manual sebagai P0; lampiran bukti dan kuitansi otomatis tetap deferred. SK-13 late-fee waiver juga bertanda MVP candidate, padahal denda umum berada di luar P0 menurut M05 §1/§7.

SK-16 saldo kredit, SK-09 utilitas/denda, SK-12/32/52 diskon/penyesuaian, SK-22 broadcast WA, SK-23/41/47/60 kuitansi, SK-25/45 ekspor, SK-30 carry-over tunggakan, SK-31 prabayar tahunan, serta SK-39 broadcast tetap backlog/out-of-scope sebagaimana Scope/M05; tidak dihitung sebagai gap schema P0 selain salah label crosswalk yang disebut di atas. SK-20 status kirim manual dapat disimpan pada `deliveryStatus`; waktu/aktor dapat direkam dalam `AuditEvent` oleh transaksi backend.

Raw Verify pencarian idempotency runtime vs dokumentasi:

```text
docs/specs/FSD.md:274:CREATE TABLE idempotency_keys (
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Audit tidak mengubah schema, migration, crosswalk, scope, backend, Neon, atau `.env.local`. M06-DB-29 menunggu review Owner.

<a id="evidence-m06-db-30"></a>

### Evidence M06-DB-30: integritas finansial WF-05 (2026-11-01)

Implementasi hanya pada lapisan DB dan dokumen kontraknya. Migration menambahkan referensi pembayaran opsional unik/nonblank dan tabel runtime `idempotency_keys`; guard mengharuskan pembayaran berawal `PENDING`, menjaga alokasi hanya pada invoice/line yang sama dan masih `ISSUED`, membatasi total alokasi pada nominal pembayaran, serta mensyaratkan alokasi lengkap sebelum verifikasi. Total aktif terverifikasi dibatasi oleh total invoice dan nilai setiap line. Data finansial pembayaran, invoice line, alokasi, dan reversal tidak bisa ditimpa; reversal harus penuh, untuk pembayaran terverifikasi, dan beralasan. Invoice VOID tidak bisa dipulihkan, ditambah line, atau menerima pembayaran baru, serta tidak dapat di-void selama pembayaran terverifikasi belum direversal.

Crosswalk menyatakan persetujuan/publikasi draft satuan/massal di luar P0; pembayaran manual saja yang masuk scope pada SK-14, sedangkan bukti/kuitansi deferred; waiver denda SK-13 di luar P0. Kunci Invoice Lease/periode/jenis dipertahankan. Penerbitan ulang periode yang sama setelah VOID tetap belum didukung dan dicatat sebagai batas domain, bukan diubah diam-diam.

Raw Verify Prisma schema:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify migration, seed sintetis dua kali, dan 24 skenario integritas pada PGlite sementara:

```text
(node:13484) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(node:13484) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Workspace\RumaKost\package.json.
MIGRATIONS_APPLIED=25
SCENARIOS_PASSED=24
SCENARIOS=all migrations apply and synthetic seed is idempotent (2 runs) | payment reference unique | blank payment reference rejected | allocation cannot cross invoice boundary | fully allocated pending payment verifies | verified payment cannot regress | verified payment financial fields immutable | payment allocation update blocked | payment allocation delete blocked | payment allocation cumulative amount capped | incomplete allocation cannot verify | invoice total overpayment blocked | invoice line over-allocation blocked | second fully allocated payment verifies for void guard | partial reversal blocked | blank reversal reason blocked | full reversal of verified payment accepted | payment reversal update blocked | payment reversal delete blocked | idempotency key and response persisted | invoice with active verified payment cannot be voided | payment cannot be created on void invoice | invoice cannot be restored from void | invoice line cannot be added to void invoice
VERIFY_RESULT=PASS
EXIT_CODE=0
```

Raw Verify apply ulang migration setelah perapian pesan guard:

```text
MIGRATIONS_APPLIED=25
GISt_EXCLUSION_CONSTRAINTS=omitted for PGlite compatibility
VERIFY_RESULT=PASS
EXIT_CODE=0
```

PGlite menerapkan seluruh 25 direktori migration, namun dua exclusion constraint tenant/kamar berbasis GiST tidak dapat diparse oleh emulator sehingga klausa tersebut sementara dihilangkan; keduanya tetap ada dalam migration produksi. Dengan demikian Verify ini tidak membuktikan exclusion GiST. Tidak memakai Neon, `.env.local`, atau `npm run db:migrate`.

Raw Verify kelengkapan runbook dan crosswalk:

```text
{
  "runbookCount": 61,
  "crosswalkCount": 61,
  "missingCrosswalk": [],
  "missingRunbook": [],
  "duplicateRunbook": [],
  "duplicateCrosswalk": [],
  "result": "PASS"
}
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

M06-DB-30 Approved: 2026-11-01 by zeenn. Tidak ada perubahan backend atau penerapan ke database Neon.

<a id="evidence-m06-db-31"></a>

### Evidence M06-DB-31: konsistensi reversal deposit WF-04 dan WF-05 (2026-11-01)

Audit read-only setelah guard payment/reversal WF-05 diterapkan menemukan interaksi yang belum dicakup oleh M06-DB-28 maupun M06-DB-30. Deposit balance menghitung semua baris `COLLECTED`; query/trigger itu tidak mengecualikan alokasi payment yang sudah memiliki `PaymentReversal`. Guard `PaymentReversal` juga tidak memeriksa alokasi/ledger deposit. Akibatnya, reversal penuh dapat meninggalkan setoran deposit tetap tersedia; DB juga masih dapat menambahkan ledger `COLLECTED` dari payment `VERIFIED` yang sudah direversal karena pemeriksaan sumber belum mengecek tabel reversal.

Ini bertentangan dengan perilaku saldo yang dihitung ulang setelah reversal dan berisiko mengizinkan uang deposit yang sudah dikoreksi dipakai untuk settlement atau refund. Pembayaran campuran sewa+deposit juga dapat terkena karena reversal berlaku pada seluruh payment, bukan hanya alokasi deposit.

Raw Verify struktur skenario WF-04 dan jejak enforcement reversal/ledger:

```text
{
  "runbookScenarios": 40,
  "crosswalkRows": 40,
  "depositBalanceCountsCollectedRows": true,
  "depositBalanceExcludesReversedPayments": false,
  "paymentReversalGuardWritesOrRequiresDepositCompensation": false,
  "depositLedgerHasReversalReference": false,
  "finding": "GAP_CONFIRMED"
}
EXIT_CODE=0
```

Rekomendasi untuk keputusan Owner: tambahkan event ledger append-only yang meng-offset bagian deposit pada payment yang direversal; tolak reversal bila dana deposit terkait sudah dipakai/dipesan oleh settlement atau refund, sampai transaksi kompensasi yang sesuai dicatat. Alternatif yang lebih membatasi adalah DB menolak reversal payment yang punya alokasi deposit dan mengarahkan koreksi melalui proses rekonsiliasi deposit. Belum ada perubahan schema atau migration untuk isu ini karena kontrak kompensasinya perlu diputuskan Owner.

Owner menyetujui rekomendasi kompensasi ledger melalui instruksi “rekomendasimu aja” pada 2026-11-01; keputusan diterapkan dalam M06-DB-32. Tidak mengubah backend, Neon, atau `.env.local`.

<a id="evidence-m06-db-32"></a>

### Evidence M06-DB-32: kompensasi ledger deposit saat reversal payment (2026-11-01)

Migration menambah `DepositLedgerEntry.reversedPaymentAllocationId` unik dan jenis append-only `COLLECTION_REVERSED`. Trigger pasca-insert `PaymentReversal` membuat satu event kompensasi per alokasi deposit yang sudah punya `COLLECTED`, memakai jumlah, alasan, dan aktor reversal yang sama. Saldo tersedia kini menghitung `COLLECTED - COLLECTION_REVERSED - APPLIED_TO_RENT - WITHHELD_AT_CHECKOUT - REFUNDED aktif`. Trigger menolak reversal jika saldo bebas tidak mencukupi, sehingga reversal row dan event ledger rollback bersama. Guard `COLLECTED` menolak payment yang sudah direversal; compensation row manual juga ditolak tanpa reversal sumber.

Raw Verify `npx prisma validate --config .prisma.verify.config.ts` memakai URL sintetis:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify seluruh migration, seed sintetis dua kali, dan skenario kompensasi saldo di PGlite disposable:

```text
(node:8448) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(node:8448) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Workspace\RumaKost\package.json.
MIGRATIONS_APPLIED=26
SCENARIOS_PASSED=11
SCENARIOS=migrations apply and synthetic seed succeeds twice | payment reversal appends one matching deposit offset and releases escrow | mixed rent/deposit payment reversal offsets only its deposit allocation | reversed payment cannot be posted as a later deposit collection | payment reversed before collection cannot create escrow later | reversal blocked when deposit is reserved by pending refund | failed reversal rolls back both reversal row and compensation event | declined refund releases reserve for a valid payment reversal | reversal blocked when deposited amount has been settled | reversal blocked after deposit funds are committed to rent | manual compensation without a payment reversal is blocked
VERIFY_RESULT=PASS
EXIT_CODE=0
```

PGlite membutuhkan penghilangan dua exclusion constraint GiST tenant/kamar saat penerapan; semua 26 direktori migration termasuk migration baru diterapkan. Klausa GiST tetap di migration produksi, tetapi tidak diuji emulator. Verify tidak menyentuh Neon, tidak membaca `.env.local`, dan tidak menjalankan `npm run db:migrate`.

Raw Verify crosswalk WF-04 dan whitespace migration baru:

```text
{
  "runbookCount": 40,
  "crosswalkCount": 40,
  "missingCrosswalk": [],
  "extraCrosswalk": [],
  "duplicateRunbook": [],
  "duplicateCrosswalk": [],
  "result": "PASS"
}
NEW_MIGRATION_TRAILING_WHITESPACE=NONE
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'CONTEXT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'RUNBOOK_LOCAL.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

M06-DB-32 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-34"></a>

### Evidence M06-DB-34: guard konsistensi invoice WF-05 (2026-11-01)

Migration `20261101370000_wf05_invoice_consistency_guards` memperketat void agar menolak payment `PENDING` dan payment `VERIFIED` tanpa reversal; pembayaran pending perlu ditolak dahulu. Guard escrow mewajibkan target `APPLIED_TO_RENT` berupa line `RENT` pada invoice `ISSUED`. Constraint trigger `DEFERRABLE INITIALLY DEFERRED` memeriksa minimal satu line pada akhir transaksi invoice. Migration juga berhenti dengan pesan eksplisit bila menemukan invoice lama tanpa line. Ketentuan dicatat pada FSD dan M05 Data/API. Tidak mengubah Prisma model karena perubahan seluruhnya berupa trigger/constraint SQL.

Raw Verify seluruh 27 migration pada PGlite disposable dan aturan void/invoice line:

```text
MIGRATIONS_APPLIED=27
PASS invoice with line commits
PASS pending payment blocks invoice void
PASS rejected pending payment allows invoice void
PASS empty invoice rejected at commit
PASS rejected empty invoice leaves no row
VERIFY_RESULT=PASS
```

Raw Verify payment verified dan settlement deposit:

```text
PASS active verified payment blocks void
PASS deposit settlement to VOID invoice is rejected
PASS deposit settlement to ISSUED invoice accepted
VERIFY_RESULT=PASS
```

Raw Verify preflight untuk data lama:

```text
PASS migration preflight rejects existing empty invoice
VERIFY_RESULT=PASS
```

PGlite memerlukan penghilangan dua exclusion constraint GiST kamar/penghuni serta `CREATE EXTENSION btree_gist` saat apply; batasan tersebut telah diuji pada task DB terdahulu, tetapi tidak tercakup di emulator ini. Migration WF-05 baru dan semua guard terkait berhasil diterapkan. Tidak memakai Neon, tidak membaca `.env.local`, dan tidak menjalankan `npm run db:migrate`.

Raw Verify `git diff --check` pada file task:

```text
EXIT_CODE=0
```

M06-DB-34 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-35"></a>

### Evidence M06-DB-35: audit WF-06 untuk lapisan DB (2026-11-01)

Audit read-only memetakan runbook WF-06 ke crosswalk dan menelusuri `Payment`, `PaymentAllocation`, `PaymentReversal`, `DepositLedgerEntry`, `IdempotencyKey`, `AuditEvent`, `Expense`, migration integritas M06-DB-30/32/34, PRD/FSD/M05 Data API, dan Frozen Scope. Tidak mengubah schema, migration, crosswalk, skenario, backend, Neon, atau `.env.local`.

Raw Verify kelengkapan ID runbook/crosswalk dan indikator enforcement:

```text
{
    "runbookCount":  55,
    "crosswalkCount":  55,
    "missingCrosswalk":  [],
    "missingRunbook":  [],
    "duplicateRunbook":  [],
    "duplicateCrosswalk":  [],
    "paymentReferenceUnique":  true,
    "pendingToVerifiedOrRejected":  true,
    "allocationParentAndInvoiceCaps":  true,
    "reversalFullAmountAndReason":  true,
    "reversalSinglePerPayment":  true,
    "reversalAppendOnly":  true,
    "depositReversalCompensatedAtomically":  true,
    "idempotencyUnique":  true,
    "auditEventReasonOptional":  true,
    "apiRejectionReasonOptional":  true,
    "surplusRefundOutOfScope":  true,
    "doubleTransferResolutionOutOfScope":  true,
    "paymentMethodConstrained":  false,
    "result":  "PASS_STATIC_AUDIT"
}
EXIT_CODE=0
```

Bagian DB yang telah tertangani: nominal payment positif; status hanya mulai `PENDING` dan transisi ke `VERIFIED`/`REJECTED`; alokasi terikat pada invoice/line yang sama dan dibatasi nominal payment, invoice, serta line; pembayaran parsial dihitung dari alokasi terverifikasi; referensi eksternal opsional nonblank dan unik; reversal hanya satu per payment terverifikasi, penuh, beralasan, append-only; reversal tidak menghapus payment asal dan menghitung kembali piutang; deposit yang dikumpulkan melalui alokasi payment dikompensasi atomik saat reversal; overdraw escrow ditolak; retry memiliki `IdempotencyKey`; saldo dan metrik merupakan hasil query dari event, bukan saldo berjalan terpisah.

Temuan/batas yang perlu diselaraskan sebelum klaim seluruh runbook WF-06 didukung:

1. **Alasan penolakan berbeda antara runbook dan kontrak API.** WF-06-SK-11 mewajibkan alasan penolakan dan jejak audit, tetapi M05 menulis `rejection reason?` opsional. `AuditEvent.reason` dapat menyimpan alasan, namun kolomnya nullable dan tidak ada constraint DB yang mengaitkan setiap `REJECTED` dengan event beralasan. Rekomendasi: selaraskan kontrak agar alasan wajib, lalu pastikan backend menulis transisi `REJECTED` dan `AuditEvent` beralasan dalam satu transaksi. Bila Owner meminta enforcement SQL juga, tentukan apakah alasan dimodelkan langsung di Payment atau tetap di AuditEvent sebelum membuat perubahan schema.
2. **Vocabulary metode pembayaran belum dibekukan.** `Payment.method` adalah teks bebas dan tidak ada constraint DB untuk daftar metode yang diterima. Runbook menampilkan BCA/transfer, QRIS, dan tunai; scope membatasi pencatatan manual serta mengecualikan integrasi wallet/bank. Dokumen kontrak M05 tidak menetapkan enum/metode baku. Ini belum dapat dinyatakan sebagai gap constraint karena nilai domain belum disepakati. Rekomendasi: tetapkan metode P0 di M05; setelah itu pilih validasi server atau constraint DB yang sejalan.
3. **Semantik runbook bercampur untuk rejection dan reversal.** SK-11 menyebut status penolakan sebagai `reversed`, sedangkan DB membedakan payment `REJECTED` dari reversal payment terverifikasi yang tercatat pada `PaymentReversal`. Label dan istilah itu sebaiknya dirapikan di runbook/crosswalk; bukan masalah kurangnya entitas DB.

Di luar P0 sesuai crosswalk/PRD: refund kelebihan bayar umum, kredit/carry-forward, resolusi transfer ganda sebagai refund/kredit, rekening sumber atau detail bank, bukti transfer/kuitansi digital dan ekspor CSV. `Expense` mencatat pengeluaran operasional secara terpisah; refund escrow memiliki ledger `REFUNDED` manual dengan alasan/status. RBAC Owner-only, kepemilikan lease, validasi input/XSS, respons status ke UI, query feed/filter, dan penulisan AuditEvent dalam transaksi adalah enforcement backend/query. Data demo M04 (termasuk metode/status surplus/double-transfer) tidak menjadi sumber persistensi P0 bila bertentangan dengan scope beku.

Tidak ada perubahan selain task audit dan Evidence ini. Tidak menjalankan migration, test, atau operasi Neon. M06-DB-35 menunggu review Owner atas temuan dan rekomendasi.

Raw Verify `git diff --check -- TODO.md`:

```text
EXIT_CODE=0
```

<a id="evidence-m06-db-39"></a>

### Evidence M06-DB-39: audit WF-08 untuk lapisan DB (2026-11-01)

Audit read-only membandingkan 68 skenario WF-08 dan crosswalk dengan `Ticket`, `TicketComment`, `TicketAttachment`, `Room`, `Lease`, `AppUser`, `AuditEvent`, `IdempotencyKey`, migration tiket, PRD REQ-07, FSD, M05 Data/API, dan Frozen Scope. Tidak mengubah schema, migration, skenario, crosswalk, backend, Neon, atau `.env.local`.

#### Temuan DB dan rekomendasi

1. **Ticket belum menyimpan Lease yang menjadi dasar pelaporan.** `Ticket` hanya FK ke `Room` dan `createdBy`; PRD meminta tiket terkait kontrak/kamar aktif. Tanpa `leaseId`, DB tidak dapat mempertahankan bukti kontrak yang mengizinkan Tenant membuat tiket atau menjaga konsistensi tenant/kamar. Rekomendasi: putuskan relasi Ticket–Lease dan jaga kesesuaian lease, kamar, dan pelapor; pemeriksaan lease aktif/otorisasi tetap dilakukan server.
2. **Kolom teks wajib menerima string kosong/spasi.** `title`, `description`, dan `TicketComment.body` NOT NULL tetapi tidak memiliki CHECK nonblank. DB juga mengizinkan mengubah/menghapus komentar lama dan menghapus Ticket tanpa child; ini melemahkan histori. Rekomendasi: CHECK nonblank, cegah hard delete tiket, dan jadikan komentar append-only kecuali ada alur koreksi/redaksi ber-audit.
3. **Kategori kerusakan dan nomor tiket tidak dipersistenkan.** WF-08-SK-03/15/53 memakai kategori; SK-18 meminta penomoran otomatis. Model Ticket tidak memiliki kategori maupun `ticketNumber`; hanya UUID. Keduanya berguna di operasional nyata, tetapi PRD/FSD/M05 belum membekukan kategori atau format nomor. Rekomendasi: Owner memilih field/vocabulary kategori dan identifier manusia yang stabil, atau crosswalk menurunkan skenario terkait.
4. **Status hanya membatasi nilai, bukan transisi.** Enum lima status tersedia, tetapi DB menerima lompatan status, tidak mengikat status `RESOLVED` ke `closedAt`, dan tidak menyimpan alasan/aktor/waktu pembatalan. WF-08-SK-47 mengharapkan status `CANCELLED` tetapi enum tidak memilikinya dan crosswalk menandainya MVP, berkonflik dengan model lima tahap M05. Rekomendasi: putuskan apakah cancellation adalah status terminal P0 (dengan alasan dan audit) atau backlog; pertimbangkan guard transisi DB. M05 saat ini menugaskan validasi `INVALID_TRANSITION` kepada backend.
5. **Pembuatan tiket dalam skenario tidak konsisten dengan aturan aktor.** PRD/M05 menetapkan `createTicket` untuk Tenant pada lease aktif, sedangkan WF-08-SK-14/15/16/18 ada pada alur/aktor Owner dan Staff. Jika Staff/Owner boleh mencatat laporan atas nama Tenant, model perlu memisahkan pelaku input dari pelapor dan menyimpan lease sumber; jangan menganggap `createdBy` sekaligus mewakili keduanya.
6. **Metadata media baru memiliki sebagian guard.** DB menolak size/duration nol dan memastikan attachment pada komentar menunjuk tiket yang sama; DB belum membatasi MIME/ukuran/durasi maksimum, jumlah media atau agregat 40 MB, maupun mewajibkan bukti awal. FSD/M05 meletakkan validasi isi/ukuran di server dan objek berada di private storage. Backend harus memfinalisasi batch dan kuota secara aman terhadap retry/konkurensi; jangan mengklaim DB dapat memverifikasi objek eksternal.
7. **Retensi media belum dijaga lintas status tiket.** Field `closedAt`, `reopenedAt`, `deleteAfter`, `deletedAt` serta indeks `deleteAfter` tersedia, tetapi tidak ada guard yang memastikan penutupan menjadwalkan 365 hari dan reopen membatalkan tenggat lama. Update/delete metadata attachment dan transisi upload juga belum dibatasi. Rekomendasi: tentukan mutasi lifecycle DB yang sah; sinkronkan tenggat dalam transaksi close/reopen, pertahankan metadata tombstone, dan serahkan penghapusan object storage ke job idempotent.
8. **Batas scope dan crosswalk:** biaya perbaikan tertaut, garansi, akun/penugasan teknisi, vendor, ekspor, dan notifikasi otomatis tidak menjadi model P0 (F-11/F-13/F-10/F-16). WF-08-SK-09/35 menyebut biaya/garansi walau FSD mengecualikannya; SK-20 masih MVP candidate walau notifikasi berada di F-16 P1. SK-11/44 dan biaya tertaut di SK-50 memang backlog. SK-19 mencampur tautan manual WhatsApp ke Penghuni (sesuai batas tanpa otomatisasi) dengan Teknisi (F-13 backlog), jadi crosswalk perlu dibatasi agar aksi Penghuni tidak ikut terbuang. Jangan menambah biaya/garansi ke Ticket atau menghubungkan Expense dalam task ini.

RBAC/ownership untuk komentar internal, upload/download, Tenant pascakontrak, penugasan hanya kepada Owner/Staff aktif, dan penulisan `AuditEvent`/`IdempotencyKey` atomik merupakan kontrak server/transaksi M05; FK dan enum saat ini tidak cukup untuk menjalankannya sendiri. Klaim `PASSED (100%)` di dokumen M04 adalah hasil prototipe, bukan bukti implementasi DB atau backend.

M06-DB-39 menunggu review Owner, terutama keputusan relasi Lease, kategori/nomor, aktor pembuat tiket, serta status pembatalan. Tidak menjalankan migration, aplikasi/backend, operasi Neon, atau task Verify lain.

Raw Verify kelengkapan 68 ID dan pemeriksaan struktur model:

```text
{
    "runbookCount":  68,
    "runbookUnique":  true,
    "crosswalkCount":  68,
    "crosswalkUnique":  true,
    "missingCrosswalk":  [

                         ],
    "missingRunbook":  [

                       ],
    "ticketHasLeaseId":  false,
    "ticketHasCategory":  false,
    "ticketNumberPersisted":  false,
    "cancelledStatus":  false,
    "titleNonblankCheck":  false,
    "descriptionNonblankCheck":  false,
    "commentBodyNonblankCheck":  false,
    "result":  "PASS_STRUCTURE_COVERAGE"
}
```

Raw Verify `git diff --check -- TODO.md`:

```text
EXIT_CODE=0
```

<a id="evidence-m06-db-36"></a>

### Evidence M06-DB-36: perbaikan integritas pembayaran WF-06 (2026-11-01)

Temuan M06-DB-35 yang disetujui untuk diperbaiki ditangani pada lapisan DB dan kontrak data: Payment `REJECTED` menyimpan alasan wajib/nonblank yang tidak dapat diubah; metode manual dibatasi ke `TRANSFER`, `QRIS`, `CASH`; Payment tidak dapat dihapus; istilah `REJECTED` dipisahkan dari reversal; dan nilai PaymentReversal tersimpan positif. Migration memiliki preflight yang berhenti sebelum DDL bila ada metode lama di luar daftar atau Payment `REJECTED` tanpa alasan, agar Owner dapat melakukan backfill secara terencana. Tidak menerapkan migration ke Neon, tidak membaca `.env.local`, dan tidak mengubah backend/UI.

Raw Verify Prisma dengan URL PostgreSQL sintetis:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify seluruh migration dan constraint pada PGlite disposable. Untuk kompatibilitas emulator saja, dua exclusion constraint GiST (overlap kamar dan tenant) serta `CREATE EXTENSION btree_gist` tidak disertakan dalam salinan SQL uji; migration repository tidak diubah untuk alasan tersebut.

```text
MIGRATIONS_APPLIED=28
PASS allowed method QRIS
PASS allowed method CASH
PASS unlisted method rejected
PASS deposit is not a payment method
PASS rejection requires a reason
PASS blank rejection reason blocked
PASS rejected payment persists nonblank reason
PASS rejection reason cannot be rewritten
PASS payment cannot be hard-deleted
PASS REJECTED distinct from reversal
VERIFY_RESULT=PASS
PASS legacy method preflight
PASS legacy method preflight leaves schema unchanged
PASS legacy rejected reason preflight
PASS legacy rejected reason preflight leaves schema unchanged
EXIT_CODE=0
```

Fixture metode `TRANSFER` juga digunakan dan diterima. Preflight lama diuji dengan data sintetis metode `BCA Transfer` dan Payment `REJECTED` tanpa alasan; kedua kasus gagal aman tanpa perubahan schema.

M06-DB-36 menunggu review Owner. Status M06-DB-35 tetap menunggu review Owner atas audit WF-06. Tidak menjalankan migration, test, atau operasi Neon selain Verify khusus task ini.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'docs/design/SCENARIOS_WF06.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

<a id="evidence-m06-db-37"></a>

### Evidence M06-DB-37: audit WF-07 untuk lapisan DB (2026-11-01)

Audit read-only mencocokkan 50 skenario WF-07 dan crosswalk dengan `Expense`, `OperatingBudget`, `Payment`/`PaymentAllocation`/`PaymentReversal`, `Invoice`/`InvoiceLine`, `Lease`/`Room`, `DepositLedgerEntry`, `IdempotencyKey`, `AuditEvent`, PRD, FSD, M05 Data/API, dan Frozen Scope. Tidak mengubah schema, migration, skenario, crosswalk, backend, Neon, atau `.env.local`.

Raw Verify kelengkapan ID dan pemeriksaan statis lapisan DB:

```text
{
    "runbookCount":  50,
    "crosswalkCount":  50,
    "missingCrosswalk":  [],
    "missingRunbook":  [],
    "duplicateRunbook":  [],
    "duplicateCrosswalk":  [],
    "expenseAmountPositive":  true,
    "expenseCategoryNonblank":  false,
    "expenseDescriptionNonblank":  false,
    "expenseDeleteOrUpdateTrigger":  false,
    "expenseHasRoomLink":  false,
    "expenseHasTicketLink":  false,
    "budgetMonthUnique":  true,
    "budgetFirstDay":  true,
    "budgetPositive":  true,
    "cashBasisSourcesPresent":  true,
    "expenseReversalModel":  false,
    "bankStatementOrCashAccountModel":  false,
    "idempotencyKeyModel":  true,
    "result":  "PASS_STATIC_AUDIT"
}
EXIT_CODE=0
```

Temuan dan klasifikasi:

1. **Validasi Expense belum menolak teks kosong/spasi.** `amount > 0` sudah menjadi CHECK DB dan tanggal, kategori, deskripsi wajib non-NULL. Namun `category` dan `description` tidak memiliki CHECK nonblank, sedangkan M05/SC-10 mengharuskan field wajib. Rekomendasi DB: tambah pemeriksaan `btrim(...) <> ''`; jangan menetapkan enum kategori karena daftar kategori kanonis belum dibekukan.
2. **Aturan koreksi/hapus Expense bertentangan dan belum enforced DB.** FSD/PRD mengarahkan agar histori finansial tidak ditimpa/dihapus dan koreksi memakai reversal atau catatan append-only; M05 menyebut Expense `CRUD`; crosswalk WF-07-SK-33 justru menggolongkan reversal expense sebagai backlog/out-of-scope. Migration Expense saat ini tidak memiliki trigger yang melarang update/delete, dan tidak ada entitas reversal Expense. Perlu keputusan Owner tentang batas P0 dan cara koreksi sebelum mengubah DB; jangan menganggap SK-33 otomatis P0.
3. **Biaya servis per kamar belum dapat diturunkan.** Expense tidak memiliki FK ke Room maupun Ticket, sesuai P1 F-11 dan out-of-scope SK-14/SK-42. WF-07-SK-39 masih diklasifikasikan MVP candidate walau menguji beban servis ekstrem dan kontribusi bersih per unit. Rekomendasi: koreksi crosswalk/skenario menjadi backlog atau batasi MVP pada okupansi dan realisasi sewa per kamar; jangan menebak alokasi biaya dari teks deskripsi.
4. **Klaim rekonsiliasi bank tidak didukung sumber data P0.** Payment allocation terverifikasi, waktu verifikasi, reversal, Expense, dan ledger deposit tersedia untuk hitungan internal; settlement deposit dapat dibedakan dari kas masuk dan pending dapat dikecualikan melalui query. Tidak ada rekening/saldo awal/mutasi bank atau bank statement untuk membandingkan buku dengan bank. Maka angka `Balance 100%` hanya boleh berarti konsistensi aritmetika internal, bukan sudah cocok dengan rekening koran. P&L/NOI pada WF-07 juga perlu disebut ringkasan arus kas operasional sesuai FSD/M05, bukan laporan akuntansi formal.
5. **Akses dan masking laporan bukan constraint DB.** WF-07-SK-19 meminta Staff melihat sebagian laporan dengan NOI dimasking, sedangkan PRD/FSD/Scope menetapkan laporan finansial Owner-only dan server tidak mengirim angka laporan ke Staff. Rekomendasi: backend menolak akses laporan untuk Staff; selaraskan skenario/crosswalk, tanpa RLS/schema baru pada audit ini.
6. **Bagian yang telah didukung / bukan gap DB:** OperatingBudget unik per bulan, tanggal awal bulan, nominal positif; payment/reversal memberi sumber untuk pendapatan kas terverifikasi; ledger escrow terpisah sehingga settlement non-kas bukan penerimaan kas/sewa; `IdempotencyKey` tersedia tetapi pengikatan hasil key dengan mutasi Expense wajib atomik di backend. Bukti transaksi/receipt, ekspor, diskon, integrasi bank, dan tautan Expense–Ticket tercatat backlog/out-of-scope.

M06-DB-37 menunggu review Owner atas temuan dan rekomendasi. Tidak menjalankan migration, test, atau operasi Neon; Verify task ini hanya audit statis.

Owner menyetujui seluruh temuan dan menginstruksikan perbaikannya pada 2026-11-01; implementasi dicatat terpisah di M06-DB-38.

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'docs/design/SCENARIOS_WF06.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

<a id="evidence-m06-db-38"></a>

### Evidence M06-DB-38: integritas Expense dan penyelarasan WF-07 (2026-11-01)

Expense sekarang mewajibkan kategori/deskripsi nonblank, tidak dapat diubah atau dihapus, dan dapat dikoreksi dengan satu ExpenseReversal penuh beralasan yang hanya dapat dibuat Owner. Expense pengganti dicatat terpisah. FSD/PRD/M05/Scope dan WF-07/crosswalk diselaraskan: laporan Owner-only adalah ringkasan kas internal, bukan laporan akuntansi atau pencocokan bank; biaya servis per kamar, ekspor, dan diskon tetap backlog. Seed sintetis menggunakan `ON CONFLICT DO NOTHING` untuk menjaga Expense immutable saat seed diulang. Tidak ada implementasi backend/UI, penerapan Neon, atau akses `.env.local`.

Raw Verify Prisma dengan URL sintetis:

```text
Loaded Prisma config from .prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Raw Verify seluruh migration dan integritas Expense pada PGlite disposable. Untuk kompatibilitas emulator saja, `btree_gist` dan dua exclusion constraint lease tidak disertakan dalam salinan SQL uji; migration repository tetap utuh.

```text
(node:1392) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:1392) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/prisma/seed.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to D:\Workspace\RumaKost\package.json.
MIGRATIONS_APPLIED=29
PASS synthetic seed twice preserves one immutable Expense
PASS blank category blocked
PASS blank description blocked
PASS nonpositive expense blocked
PASS Expense update blocked
PASS Expense hard delete blocked
PASS only Owner may reverse Expense
PASS blank reversal reason blocked
PASS partial reversal blocked
PASS Owner full reasoned reversal accepted
PASS one reversal per Expense
PASS ExpenseReversal update blocked
PASS ExpenseReversal delete blocked
PASS replacement Expense can be recorded after reversal
PASS legacy blank text preflight
PASS failed preflight leaves schema unchanged
VERIFY_RESULT=PASS
EXIT_CODE=0
```

Raw Verify cakupan skenario dan penyelarasan scope/crosswalk:

```text
{
    "runbookIds":  50,
    "crosswalkIds":  50,
    "noDuplicateIds":  true,
    "expenseReversalP0":  true,
    "roomCostScenarioDeferred":  true,
    "reportAccessOwnerOnly":  true,
    "discountScenarioDeferred":  true,
    "scenarioDisclaimsExternalBankMatch":  true,
    "m04ResultsExplicitlyNotM06":  true
}
EXIT_CODE=0
```

AuditEvent dan IdempotencyKey untuk `reverseExpense` tetap kewajiban transaksi backend sesuai kontrak; implementasi backend belum dimulai. Owner meninjau dan menyetujui M06-DB-38 pada 2026-11-01 setelah memastikan tidak ada gap DB WF-07 lain. Migration belum diterapkan ke Neon.

Raw Verify pencatatan persetujuan Owner:

```text
EXIT_CODE=0
```

Raw Verify `git diff --check` awal menemukan dua baris dengan trailing whitespace; keduanya sudah dibersihkan. Raw output awal:

```text
warning: in the working copy of 'docs/design/SCENARIOS_WF06.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF07.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
docs/design/SCENARIOS_WF07.md:7: trailing whitespace.
> **User Stories KANBAN**: `RK-006` (Epic Pengeluaran & Laporan Ringkas), `RK-034` (Pencatatan Pengeluaran Operasional), `RK-035` (Ringkasan Arus Kas Masuk & Keluar), `RK-036` (Rekapitulasi Tingkat Okupansi Kamar). [dua spasi di akhir]
docs/design/SCENARIOS_WF07.md:54: trailing whitespace.
2. **Akses Laporan Finansial Owner-only**: [dua spasi di akhir]
EXIT_CODE=1
```

Raw Verify `git diff --check` setelah pembersihan:

```text
warning: in the working copy of 'docs/design/SCENARIOS_WF06.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF07.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

<a id="evidence-m06-db-33"></a>

### Evidence M06-DB-33: audit akhir WF-05 setelah perubahan integritas (2026-11-01)

Audit read-only membandingkan 61 skenario WF-05 dan crosswalk dengan guard invoice/payment di M06-DB-30, kompensasi escrow M06-DB-32, FSD, dan kontrak M05 Data/API. WF-04 beserta task M06-DB-27/28/32 dinyatakan clear oleh Owner; task-task tersebut ditandai approved di antrean.

Raw Verify kelengkapan skenario dan pemeriksaan guard DB:

```text
{
    "runbookCount":  61,
    "crosswalkCount":  61,
    "missingCrosswalk":  [],
    "missingRunbook":  [],
    "duplicateRunbook":  [],
    "duplicateCrosswalk":  [],
    "voidGuardChecksOnlyVerifiedPayment":  true,
    "paymentReviewRequiresIssuedInvoiceForReject":  true,
    "depositSettlementRequiresIssuedInvoice":  false,
    "invoiceMustHaveAtLeastOneLineConstraint":  false,
    "dueDateCannotPrecedeIssueDateConstraint":  false,
    "result":  "PASS_STRUCTURE_AUDIT"
}
EXIT_CODE=0
```

Temuan DB yang masih perlu ditutup sebelum WF-05 dapat dinyatakan lengkap pada lapisan DB:

1. **Void membiarkan pembayaran `PENDING` menggantung.** Guard invoice hanya mencegah void jika ada pembayaran `VERIFIED` aktif. Setelah invoice menjadi `VOID`, guard review menolak perubahan status pembayaran apa pun karena invoice harus `ISSUED`; akibatnya pembayaran `PENDING` tidak dapat diverifikasi maupun ditolak. Rekomendasi: blokir void selama ada pembayaran `PENDING`; Owner harus menolak pending terlebih dulu, lalu void.
2. **Settlement deposit menerima line sewa dari invoice `VOID`.** Guard `APPLIED_TO_RENT` memeriksa line `RENT` dan Lease yang sama, tetapi tidak status invoice. M05 Data API secara eksplisit mengembalikan `INVOICE_CLOSED` untuk settlement pada invoice tertutup. Rekomendasi: DB mensyaratkan invoice line berstatus `ISSUED` saat settlement.
3. **Invoice kosong dapat commit.** M05 menyatakan invoice berisi satu atau lebih line, tetapi trigger hanya memvalidasi insert line; tidak ada pemeriksaan tertunda saat transaksi commit untuk memastikan invoice yang diterbitkan memiliki line. Rekomendasi: constraint trigger deferrable yang memeriksa minimal satu line pada akhir transaksi pembuatan invoice.

Batas yang ditelusuri namun bukan gap DB yang diputuskan audit ini: `dueOn` yang tidak mendahului tanggal terbit dinyatakan M05 khusus untuk invoice on-demand, tetapi model tidak punya penanda jenis invoice yang cukup untuk menegakkan hanya aturan itu tanpa keputusan kontrak; alasan void dapat dicatat di `AuditEvent` dalam transaksi backend sesuai M05. Draft/publish, bukti transfer, dan kuitansi otomatis sudah dinyatakan di luar P0 pada crosswalk/scope.

Audit tidak mengubah schema/migration, crosswalk, backend, Neon, atau `.env.local`. M06-DB-33 menunggu review Owner sebelum gap di atas diperbaiki. Tidak menjalankan migration aplikasi atau task Verify lain.

Raw Verify `git diff --check -- TODO.md`:

```text
EXIT_CODE=0
```

<a id="evidence-m06-db-40"></a>

### Evidence M06-DB-40: integritas DB ticketing WF-08 (2026-11-01)

Verify M06-DB-40 selesai pada database PGlite disposable. Hasil mentah:

`npx prisma validate --schema prisma/schema.prisma` dengan `DIRECT_URL` sintetis:

```text
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid ??
```

Semua 29 migration terurut dijalankan di PGlite, dengan hanya `btree_gist` dan dua exclusion constraint GiST di-skip karena extension tidak tersedia pada emulator. Fixture sintetis dijalankan dua kali:

```text
MIGRATIONS=PASS (29; PGlite GiST exclusions omitted)
SEED_TWICE=PASS
SEED_TICKETS=1; UNIQUE_NUMBERS=1
NULL_VIDEO_DURATION=REJECTED
```

Uji fungsional pada database disposable:

```text
FUNCTIONAL_ASSERTIONS=17
TICKET_ROLES_LEASE_CANCEL_STATUS_COMMENT_MEDIA_RETENTION=PASS
SEED_TWICE=PASS
```

Kasus yang dicakup: semua role membuat tiket; Tenant wajib punya lease aktif; nomor unik; blank title ditolak; tiket tanpa metadata lampiran gagal saat commit; transition berurutan; Staff tidak dapat reopen dan Owner dapat; histori status tercatat; cancellation wajib alasan, menyimpan aktor/waktu, terminal dan tidak dapat dihapus; komentar append-only; MIME/ukuran/durasi, empat foto per batch, 40 MB agregat, dan retensi saat resolve; durasi video wajib diisi.

Preflight blank legacy ticket:

```text
LEGACY_PREFLIGHT=TICKET_TEXT_BACKFILL_REQUIRED
PREFLIGHT_SCHEMA_RESIDUE=NONE
```

Cakupan runbook/crosswalk:

```text
{"runbookCount": 68, "crosswalkCount": 68, "uniqueRunbook": true, "uniqueCrosswalk": true, "completeIds": true}
EXIT_CODE=0
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/seed.ts', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Batas Verify: PGlite tidak menyediakan extension `btree_gist`, sehingga dua exclusion constraint yang sudah ada dikecualikan dari emulator. Isi file dan keberhasilan upload harus dicek server karena DB hanya dapat menjaga metadata; Neon tidak dipakai dan migration belum diterapkan. M06-DB-40 menunggu review Owner.

<a id="evidence-m06-db-41"></a>

### Evidence M06-DB-41: audit WF-09 untuk lapisan DB (2026-11-01)

Audit read-only pada runbook, crosswalk, PRD/FSD/M05 Data API, Frozen Scope, Prisma schema, dan migration terkait akun. Hasil utama:

- Cakupan runbook/crosswalk lengkap: 90 ID pada masing-masing sumber, unik, tanpa ID hilang atau tambahan.
- Data akun yang sudah dimodelkan: `AppUser` memiliki `authSubject`, `emailNormalized` unik, nama, role tiga nilai (`OWNER`/`STAFF`/`TENANT`), `isActive`, `mustChangePassword`, pembuat opsional, dan timestamp. `TenantProfile` menyimpan kontak penghuni opsional; Lease mempertahankan hubungan penghuni-kamar dan histori kontrak. Database tidak menyimpan password/sesi Neon Auth.
- Uniqueness email saat ini memakai unique index biasa pada `email_normalized`; tidak ditemukan CHECK/functional unique index yang memaksa teks sudah lowercase. Keunikan case-insensitive bergantung pada canonicalization di jalur tepercaya. Rekomendasi: putuskan apakah DB juga harus menolak nilai non-canonical, lalu tambahkan check/unique index jika invariant itu wajib dijamin sampai tingkat DB.
- Tidak ditemukan guard DB untuk membatasi satu akun Owner atau mencegah penonaktifan Owner aktif terakhir. Frozen Scope menyebut satu properti dan PRD menyebut tiga role, tetapi tidak menetapkan satu Owner. WF-09 SK-18/SK-48 mengasumsikan satu Owner; perlu putusan domain sebelum constraint dibuat.
- `isActive` mendukung deaktivasi akun. FK `RESTRICT` mempertahankan referensi akun yang masih dipakai histori, tetapi tidak ada kolom/trigger soft-delete universal; akun tanpa referensi masih dapat dihapus langsung. Jika SK-50 bermakna larangan hard-delete absolut, tetapkan aturan eksplisit DB/API sebelum mengimplementasikannya. Anonimisasi SK-29 belum punya kebijakan retensi/retensi finansial yang disetujui; jangan menambah mekanisme tanpa aturan itu.
- `AuditEvent` sudah append-only melalui trigger UPDATE/DELETE. Tabel menyediakan aktor, aksi, entitas, waktu, alasan, dan `safeMetadata`; tidak ada `ip_address` atau nilai lama/baru sebagai kolom terstruktur. Pencatatan lengkap perubahan akun perlu ditulis atomik oleh backend; bank tidak dimodelkan karena konfigurasi rekening termasuk di luar P0.
- Runbook bertentangan dengan keputusan/scope beku: skenario pendaftaran penghuni mandiri (SK-09) berlawanan dengan pembuatan akun oleh Owner/Staff; arahan Owner sebelumnya juga menyatakan penghuni bisa didaftarkan Owner dan Staff, sedangkan PRD saat ini hanya menyebut Owner. SK-31 menganggap email login immutable, sedangkan Owner sebelumnya meminta reset email. Minta spesifikasi diselaraskan sebelum BE; jangan mengunci keputusan lewat DB.
- Profil properti editable, rekening bank, builder tata tertib, permission Staff granular, dan role Teknisi tidak punya model DB. Ini sesuai Frozen Scope/FSD (backlog/out-of-scope), bukan gap P0. Tidak ada tabel Property karena deployment satu properti; kapasitas/lantai dihitung dari Room/Floor. Pencarian/filter, dirty form, visual validation, password/session/rate limit, dan notifikasi adalah tanggung jawab UI/backend/provider, bukan tabel baru.
- Deaktivasi Staff yang sedang ditugaskan pada tiket perlu alur backend transaksional (blokir atau alihkan assignment) bila Owner menghendaki larangan tiket orphan. SK-68 sendiri terkait Teknisi F-13/backlog; Staff P0 tetap perlu diputuskan sesuai aturan operasional WF-08. Tenant reactivation tidak boleh membuat ulang kepemilikan kamar: Lease yang menjadi sumber relasi dan constraint bentrok.

Rekomendasi: rapikan keputusan pembuatan akun (Owner vs Staff untuk Tenant), kemampuan reset email, cardinality/anti-lockout Owner, hard-delete/anonymization, dan offboarding Staff bertiket di PRD/FSD/M05 sebelum task perubahan schema atau backend. Audit tidak mengubah schema, migration, crosswalk, backend, Neon, atau `.env.local`.

Raw Verify M06-DB-41:

```text
{"runbookCount":90,"crosswalkCount":90,"uniqueRunbook":true,"uniqueCrosswalk":true,"missingCrosswalk":[],"missingRunbook":[],"missingExpected":[],"unexpectedRunbook":[],"result":"PASS_STRUCTURE_AUDIT"}
```

```text
prisma/schema.prisma:10:enum AppRole {
prisma/schema.prisma:98:model AppUser {
prisma/schema.prisma:138:model TenantProfile {
prisma/schema.prisma:154:model Floor {
prisma/schema.prisma:166:model Room {
prisma/schema.prisma:189:model Lease {
prisma/schema.prisma:526:model AuditEvent {
prisma/migrations\20261031120000_app_user\migration.sql:27:CREATE UNIQUE INDEX "app_users_email_normalized_key" ON "app_users"("email_normalized");
prisma/migrations\20261101260000_audit_event\migration.sql:27:CREATE TRIGGER "audit_events_no_update"
prisma/migrations\20261101260000_audit_event\migration.sql:31:CREATE TRIGGER "audit_events_no_delete"
prisma/migrations\20261101340000_wf04_profile_contract_escrow_integrity\migration.sql:2:  ADD CONSTRAINT app_users_display_name_nonblank
```

```text
git diff --check -- TODO.md
EXIT_CODE=0
```

M06-DB-41 Approved: 2026-11-01 by zeenn. Lanjut ke M06-DB-42; tidak menjalankan Verify task lain.

<a id="evidence-m06-db-42"></a>

### Evidence M06-DB-42: sinkronisasi keputusan akun WF-09 (2026-11-01)

Dokumentasi F-01 dan skenario akun WF-09 diselaraskan dengan arahan Owner sebelumnya. Perubahan mencakup PRD, FSD, M05 Data/API, Scope Statement, runbook, dan crosswalk. Tidak ada schema, migration, backend, UI, Neon, atau `.env.local` yang diubah.

Raw Verify M06-DB-42:

```text
{"runbookCount":90,"crosswalkCount":90,"idsUniqueComplete":true,"ownerCreatesStaff":true,"staffCreatesTenant":true,"noSelfSignup":true,"ownerManagedEmail":true,"ownPasswordProvider":true,"tenantRoomViaLease":true,"pendingPolicies":true,"nonP0RolesExcluded":true,"changedM04ClaimsRemoved":true,"result":"PASS_DOC_ALIGNMENT"}
warning: in the working copy of 'docs/design/SCENARIOS_WF09.md', LF will be replaced by CRLF the next time Git touches it
DIFF_CHECK_EXIT_CODE=0
warning: in the working copy of 'docs/design/SCENARIOS_WF09.md', LF will be replaced by CRLF the next time Git touches it
FINAL_DIFF_CHECK_EXIT_CODE=0
```

Scope teknis yang tetap belum diputuskan: jumlah/minimum Owner aktif, hard-delete/anonymization dan retensi, kebijakan deaktivasi Staff yang masih ditugaskan pada tiket, serta perilaku session revocation/password reuse pada Neon Auth. Tidak ada constraint atau janji provider yang dibuat untuk hal tersebut.

M06-DB-42 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-43"></a>

### Evidence M06-DB-43: canonical email AppUser (2026-11-01)

Kontrak email mirror pada M05 Data API menetapkan lowercase tanpa spasi ASCII di tepi. Migration menolak legacy non-canonical melalui preflight; tidak ada backfill otomatis. CHECK juga menolak nilai kosong. Unique index email yang sudah ada tetap exact, dengan uniqueness terjamin setelah CHECK.

Raw Verify `npx prisma validate` dengan `DIRECT_URL` sintetis:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

Raw Verify PGlite in-memory disposable:

```text
CANONICAL_LOWERCASE=ACCEPTED
LEADING_SPACE=REJECTED
TRAILING_SPACE=REJECTED
UPPERCASE=REJECTED
EMPTY=REJECTED
DUPLICATE=REJECTED
MIGRATIONS=PASS (31; PGlite GiST exclusions omitted)
LEGACY_PREFLIGHT=APP_USER_EMAIL_CANONICAL_BACKFILL_REQUIRED
PREFLIGHT_SCHEMA_RESIDUE=NONE
LEGACY_BASELINE_MIGRATIONS=30
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

PGlite tidak mendukung `btree_gist`; dua exclusion constraint lease yang telah ada dikecualikan hanya pada salinan SQL uji. Tidak membaca `.env.local`, tidak memakai Neon, dan tidak menjalankan `npm run db:migrate`. M06-DB-43 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-44"></a>

### Evidence M06-DB-44: audit WF-10 untuk lapisan DB (2026-11-01)

Audit read-only menemukan bahwa model utama untuk Lease, invoice, payment/rejection/reversal, deposit ledger, tiket, profil darurat, dan permintaan check-out tersedia. Overdue dan pembayaran parsial dapat diturunkan dari tanggal jatuh tempo, alokasi, reversal, dan ledger; tidak perlu status/saldo duplikat. Namun, `LeaseEndRequest` hanya mem-FK lease dan pemohon secara terpisah, sehingga DB belum memastikan pemohon adalah Tenant dari Lease tersebut. M05 mensyaratkan kepemilikan pada API/server; rekomendasi DB adalah guard komposit/trigger untuk mencegah mismatch ini.

Temuan keselarasan runbook dan scope:

- WF-10 SK-03 meminta upload struk transfer, tetapi SK-26 menggolongkan bukti transfer sebagai backlog dan PRD/Scope secara eksplisit melarang penyimpanan bukti transfer pada MVP. Tidak ada model PaymentProof/PaymentAttachment; itu sesuai scope, sehingga SK-03 perlu diselaraskan setelah review.
- SK-05 berstatus “MVP candidate” di crosswalk, padahal WiFi/pengumuman tidak punya model P0 dan bukan bagian kontrak data M05. SK-16 mencampur pembaruan kontak darurat yang sudah didukung `TenantProfile` dengan plat kendaraan yang dikecualikan. Crosswalk sebaiknya memisahkan kedua bagian.
- SK-18 meminta rekening refund dan menyebut notice 30 hari. Detail rekening dikecualikan oleh scope dan tidak disimpan. `LeaseEndRequest` menyimpan tanggal yang diminta/alasan/status review, tetapi periode minimum 30 hari tidak ditetapkan PRD/FSD/M05. Jangan menegakkan ambang 30 hari lewat DB tanpa keputusan Owner.
- SK-19 didukung secara nominal oleh saldo ledger escrow; DB tidak membuktikan dana disimpan di rekening terpisah atau telah direkonsiliasi bank. Hindari klaim itu sebagai fakta terverifikasi.
- PDF/kwitansi, multi-unit, meteran listrik, kendaraan, WiFi/pengumuman, tata tertib, dan renewal mandiri sudah berada di luar P0/backlog. Tidak perlu tabel DB pada scope sekarang.
- SK-10 menyebut redirect browser sebagai guard. Itu tidak menggantikan otorisasi server; ownership query, read-only arsip, klaim pembayaran, dan akses tiket Tenant tetap harus ditegakkan BE, bukan diklaim oleh DB.

Raw Verify cakupan runbook/crosswalk dan audit model:

```text
{
  "runbookCount": 26,
  "crosswalkCount": 26,
  "runbookUniqueComplete": true,
  "crosswalkUniqueComplete": true,
  "missingCrosswalk": [],
  "unexpectedCrosswalk": [],
  "verified": {
    "leaseEndRequestAndReviewCheck": true,
    "invoiceNaturalKey": true,
    "paymentRejectionAndUniqueReversal": true,
    "escrowLedger": true,
    "emergencyContactFields": true,
    "optionalLeaseOnTicket": true,
    "paymentProofAndBankDetailsExcluded": true,
    "utilityAndRenewalOutsideP0": true,
    "tenantOwnershipSpecifiedAtServer": true
  },
  "gapSignals": {
    "checkoutRequesterCompositeBoundToLeaseTenant": false,
    "paymentProofPersisted": false,
    "vehicleMeterWifiModels": false,
    "checkoutBankDetailsPersisted": false
  },
  "result": "PASS_WF10_DB_AUDIT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Tidak ada perubahan schema, migration, backend, skenario/crosswalk, Neon, atau `.env.local`. M06-DB-44 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-45"></a>

### Evidence M06-DB-45: guard pemilik Lease dan penyelarasan WF-10 (2026-11-01)

Migration menambah composite unique `(leases.id, leases.tenant_user_id)` dan composite FK dari `(lease_end_requests.lease_id, lease_end_requests.requested_by_tenant_id)`. Preflight menolak request legacy yang pemohonnya bukan Tenant pada Lease, tanpa backfill. M05/FSD mencatat bahwa guard ini menjaga pasangan Tenant-Lease di DB; autentikasi/role dan akses baca tetap tanggung jawab server.

Runbook dan crosswalk WF-10 diselaraskan: klaim pembayaran tidak menyimpan bukti transfer; PDF/kwitansi, WiFi/pengumuman, sub-meteran, kendaraan/izin tamu, tata tertib, multi-unit, dan renewal mandiri ditandai backlog; profil kontak darurat dipisahkan dari kendaraan; checkout tidak meminta detail rekening atau menetapkan notice 30 hari; saldo escrow disebut sebagai saldo ledger, tanpa klaim rekening terpisah/refund penuh; overdue tidak menetapkan toleransi H+3 atau suspend otomatis; SK-10 menguji penolakan server-side.

Raw Verify `npx prisma validate` dengan `DIRECT_URL` sintetis:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

Raw Verify migration dan ownership pada PGlite disposable:

```text
LEASE_OWNER_REQUEST=ACCEPTED
DIFFERENT_TENANT_REQUEST=REJECTED
MIGRATIONS=PASS (32; PGlite GiST exclusions omitted)
LEGACY_PREFLIGHT=LEASE_END_REQUEST_TENANT_BACKFILL_REQUIRED
PREFLIGHT_SCHEMA_RESIDUE=NONE
LEGACY_BASELINE_MIGRATIONS=31
```

Raw Verify kelengkapan ID dan keselarasan runbook/crosswalk:

```text
{
  "runbookCount": 26,
  "crosswalkCount": 26,
  "runbookUniqueComplete": true,
  "crosswalkUniqueComplete": true,
  "missingCrosswalk": [],
  "unexpectedCrosswalk": [],
  "checks": {
    "dbCompositeFk": true,
    "apiContract": true,
    "fsdContract": true,
    "noProofP0": true,
    "backlogProof": true,
    "wifiBacklog": true,
    "mixedProfileSeparated": true,
    "checkoutNoBankOr30Day": true,
    "escrowClaimsBounded": true,
    "serverSecurity": true,
    "pdfReceiptBacklog": true,
    "noUnapprovedH3": true,
    "prototypeBacklogStatus": true
  },
  "result": "PASS_WF10_ALIGNMENT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Raw Verify whitespace migration baru:

```text
NEW_MIGRATION_TRAILING_WHITESPACE=NONE
```

PGlite tidak mendukung `btree_gist`; dua exclusion constraint Lease yang telah ada dikecualikan hanya pada salinan SQL uji. Tidak memakai Neon, `.env.local`, atau `npm run db:migrate`. Perubahan BE tidak dilakukan. M06-DB-45 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-46"></a>

### Evidence M06-DB-46: audit WF-11 untuk lapisan DB (2026-11-01)

Audit read-only awal: 13 skenario dan 13 baris crosswalk tersedia. Trigger DB untuk pembuatan Tenant mengharuskan lease aktif milik pembuat pada kamar yang sama; constraint DB mewajibkan sekurangnya satu record attachment awal, tetapi trigger tidak mensyaratkan uploadStatus AVAILABLE atau mengecualikan FAILED/DELETED. Maka record metadata saja belum membuktikan media berhasil diunggah saat tiket RECEIVED. Guard media DB mencakup metadata, batas tipe/ukuran/durasi, 4 foto + 1 video per batch, 40 MB per tiket, transisi status, dan retensi; pemeriksaan isi file tetap tugas server.

Temuan untuk review Owner:

- Runbook menyajikan 6 kategori, termasuk Pintu & Kunci, sedangkan enum TicketCategory hanya memiliki AC, PLUMBING, ELECTRICAL, FURNITURE, GENERAL. Perlu keputusan apakah Pintu & Kunci digabung ke GENERAL atau kategori DB ditambah; audit tidak memilih diam-diam.
- Guard submit media hanya memastikan ada row TicketAttachment. Row dapat berstatus selain AVAILABLE pada insert; trigger required-media tidak memfilter status. Tetapkan alur agar tiket baru berstatus RECEIVED hanya setelah setidaknya satu objek lolos verifikasi server dan attachment AVAILABLE, atau ubah kontrak/status draft agar kegagalan unggah tidak menjadi tiket terkirim tanpa bukti. Ini gap DB/workflow yang perlu ditutup sebelum implementasi F-07.
- TicketPriority menyimpan LOW/NORMAL/URGENT, tetapi SLA <2 jam, hari ini/besok, dan 2-3 hari tidak punya field/aturan DB atau komitmen di P0. Perlakukan sebagai prioritas saja; hilangkan janji respons kecuali Owner menetapkan SLA operasional dan scope. targetCompletionOn adalah target penyelesaian yang diisi operasional, bukan SLA respons otomatis.
- Checkbox izin masuk kamar tidak punya field atau event persetujuan pada model Ticket. Jika merupakan izin operasional yang harus bisa dibuktikan, perlu keputusan data eksplisit; jangan menyimpulkan persetujuan dari tiket.
- Kontak darurat WhatsApp adalah integrasi/tautan di luar cakupan F-07 P0; WhatsApp/email otomatis tercatat F-16 P2.
- Hapus thumbnail pada form adalah penghapusan pilihan draft sebelum submit. Attachment tiket tersimpan mengikuti status/retensi; penghapusan record/media setelah submit tidak boleh disamakan dengan menghapus pilihan draft.
- Pemisahan role untuk createTicket Tenant dan keterikatan lease/kamar dijaga trigger DB; autentikasi sesi, pemfilteran baca tiket, dan penanganan rute tetap server.



Raw Verify ID, integritas guard, media, dan gap kontrak:

```json
{
  "runbookCount": 13,
  "crosswalkCount": 13,
  "categories": [
    "AC",
    "PLUMBING",
    "ELECTRICAL",
    "FURNITURE",
    "GENERAL"
  ],
  "priorities": [
    "LOW",
    "NORMAL",
    "URGENT"
  ],
  "checks": {
    "runbook13UniqueComplete": true,
    "crosswalk13UniqueComplete": true,
    "tenantLeaseRoomGuard": true,
    "initialAttachmentRecordRequired": true,
    "initialMediaAvailabilityGap": true,
    "mediaQuotaAndMetadata": true,
    "categoryEnumGapRecorded": true,
    "slaNotModeledAndRecorded": true,
    "roomEntryConsentAbsentAndRecorded": true,
    "whatsappOutsideP0Recorded": true,
    "m45ApprovedM46Pending": true
  },
  "result": "PASS_WF11_DB_AUDIT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

Tidak mengubah schema, migration, backend, runbook/crosswalk, Neon, atau `.env.local`. Verify hanya audit M06-DB-46. M06-DB-46 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-47"></a>

### Evidence M06-DB-47: siklus DRAFT dan lampiran tersedia WF-11 (2026-11-01)

Migration menambahkan status Ticket DRAFT dan kategori DOORS_LOCKS. Ticket baru mulai DRAFT; deferred constraint menolak transisi DRAFT ke RECEIVED kecuali pada akhir transaksi sekurangnya satu TicketAttachment berstatus AVAILABLE. Tenant dapat mengirim atau membatalkan draft miliknya; Tenant lain ditolak. Pembuat Tenant harus masih memiliki lease aktif pada saat submit. Owner/Staff tetap dapat membuat, mengirim, atau membatalkan draft sesuai aturan status. Media yang masih PENDING_UPLOAD, FAILED, atau DELETED tidak memenuhi syarat. FSD dan M05 Data API menjelaskan alur; backend/UI belum diubah.

Raw Verify `npx prisma validate` dengan DIRECT_URL sintetis:

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid ??
```

Raw Verify migration dan guard pada PGlite disposable:

```json
{
  "migrations": 33,
  "omittedGiST": [
    "leases_room_active_period_excl (GiST only)",
    "20261101280000_tenant_active_period (GiST exclusion only)"
  ],
  "checks": {
    "migrationsApplied": true,
    "tenantDraft": true,
    "doorCategory": true,
    "missingMediaRejected": true,
    "pendingFailedDeletedRejected": true,
    "availableMediaAccepted": true,
    "statusHistory": true,
    "foreignTenantRejected": true,
    "staffCanSubmit": true,
    "ownerCanCancelDraft": true
  },
  "finalStates": [
    {
      "status": "RECEIVED",
      "n": 2
    },
    {
      "status": "CANCELLED",
      "n": 1
    },
    {
      "status": "DRAFT",
      "n": 5
    }
  ],
  "result": "PASS"
}
```

Raw Verify migration di hadapan tiket lama dan kepemilikan draft Tenant:

```json
{
  "preExistingTicket": {
    "status": "RECEIVED",
    "category": "GENERAL"
  },
  "newTicketDefault": "DRAFT",
  "checks": {
    "legacyTicketPreserved": true,
    "newTicketDefaultDraft": true,
    "tenantCanCancelOwnDraft": true,
    "tenantCannotCancelOtherDraft": true
  },
  "result": "PASS_LEGACY_AND_DRAFT_ROLE_GUARDS"
}
```

Raw Verify spesifikasi dan kategori:

```json
{
  "checks": {
    "schemaDraftDefault": true,
    "doorsLocksPersisted": true,
    "ticketSubmittedOnlyWithAvailable": true,
    "tenantDraftOwnership": true,
    "documentedDataApi": true,
    "noBeImplementation": true
  },
  "result": "PASS_WF11_SPEC_ALIGNMENT"
}
```

Raw Verify `git diff --check`:

```text
EXIT_CODE=0
```

PGlite tidak mendukung extension btree_gist; exclusion constraint GiST Lease yang telah ada dikecualikan hanya dari SQL salinan uji. Tidak menjalankan npm run db:migrate, tidak menerapkan migration ke Neon, dan tidak membaca `.env.local`. Tidak mengubah backend/UI. Kebijakan kapan draft terlantar dibatalkan dan kapan objek medianya dibersihkan belum ditetapkan; putuskan batas waktunya sebelum BE, jangan mengasumsikan default. M06-DB-47 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-48"></a>

### Evidence M06-DB-48: audit WF-12 untuk lapisan DB (2026-11-01)

Audit read-only. Runbook dan crosswalk memuat 14 ID unik WF-12-SK-01–14. Tidak mengubah schema, migration, backend, skenario/crosswalk, Neon, atau `.env.local`.

Temuan lapisan DB:
- Ticket/StatusEvent mendukung DRAFT sebelum submit dan alur `RECEIVED → ASSIGNED → IN_PROGRESS → INSPECTION → RESOLVED`; `CANCELLED` terminal. `ASSIGNED` mensyaratkan assignee internal Owner/Staff aktif; penyelesaian memerlukan ringkasan. Owner saja dapat membuka kembali tiket RESOLVED. Status event menyimpan aktor dan waktu, immutable. Stepper visual 5 tahap memetakan tahap 1–5 ke RECEIVED sampai RESOLVED; DRAFT dan CANCELLED adalah state pra-submit/terminal di luar stepper.
- Konflik WF-12-SK-12: runbook memberi Tenant aksi “Konfirmasi Masalah Selesai” yang mengubah status menjadi RESOLVED. PRD/FSD menyatakan Owner/Staff mengelola status dan Tenant hanya membaca/berkomentar; DB pun membatasi transisi RESOLVED ke Owner/Staff. Rating/testimoni tidak memiliki model khusus dan berada di luar P0. Rekomendasi: Tenant dapat mengirim komentar/konfirmasi terlihat, sedangkan Owner/Staff melakukan transisi RESOLVED; rating tetap backlog. Perlu persetujuan Owner sebelum mengubah runbook/crosswalk.
- TicketComment menolak body kosong/whitespace, immutable/append-only; Tenant hanya dapat membuat TENANT_VISIBLE pada tiket dengan lease aktif miliknya. Catatan INTERNAL oleh Owner/Staff tidak boleh dipaparkan kepada Tenant; pemfilteran respons tetap tanggung jawab backend.
- WF-12-SK-06 after-service evidence dapat disimpan sebagai TicketAttachment oleh Owner/Staff berizin; aktor Teknisi Pak Joko tidak bisa direpresentasikan sebagai role P0. WF-12-SK-08 simulasi balasan otomatis dari Teknisi tidak didukung role/data DB dan di luar scope.
- TicketAttachment menyimpan metadata upload dan komentar opsional, object privat; DB mengatur metadata/kuota/status dan retensi 365 hari setelah tiket ditutup/dibatalkan (hitung ulang jika tiket RESOLVED dibuka kembali). Server tetap memeriksa bytes/isi file, otorisasi kepemilikan, visibilitas, serta membuat signed URL singkat. Media AVAILABLE wajib saat submit dari DRAFT (M06-DB-47).
- SLA 2/24 jam tidak ditetapkan oleh DB/domain sebagai jaminan; priority LOW/NORMAL/URGENT hanya klasifikasi. Kartu biaya Rp0/parts/work detail tidak didukung Ticket; Expense memang tidak tertaut ke Ticket dan P0 tidak memodelkan biaya servis. WhatsApp/vendor, Teknisi, notifikasi respons, serta rating berada di backlog/out-of-scope.
- WF-12-SK-13: parameter `?role=staf`/`?from=staf` hanya konteks navigasi tampilan; tidak dapat menentukan atau menggantikan role autentikasi. Server wajib menurunkan akses dari sesi dan memeriksa role serta kepemilikan resource.

Raw Verify cakupan ID dan jejak lapisan DB:

```json
{
  "runbookScenarioIds": 14,
  "crosswalkRows": 14,
  "idsUniqueAndComplete": true,
  "checks": {
    "ticketLifecycleAndStatusHistory": true,
    "tenantCannotResolve": true,
    "ownerOnlyReopen": true,
    "commentNonblankAppendOnlyAndTenantVisible": true,
    "technicianAndRatingAreNotP0Models": true,
    "ticketMediaPrivateAnd365DayRetention": true,
    "mediaSubmitRequiresAvailableAttachment": true,
    "slaAndPerTicketExpenseAreNotDbGuarantees": true,
    "roleQueryParamIsNotAuthorization": true
  },
  "result": "PASS_WF12_DB_AUDIT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

M06-DB-48 Approved: 2026-11-01 by zeenn. Task ini tidak mengubah WF-12 maupun crosswalk. M06-DB-47 Approved: 2026-11-01 by zeenn.

<a id="evidence-m06-db-49"></a>

### Evidence M06-DB-49: penyelarasan WF-12 terhadap kontrak DB P0 (2026-11-01)

Runbook dan crosswalk WF-12 diperbaiki sesuai PRD/FSD/M05 Data API serta Frozen Scope. WF-12-SK-12 kini memisahkan konfirmasi Tenant melalui komentar terlihat dari perubahan status RESOLVED oleh Owner/Staff; ringkasan penyelesaian diperlukan, dan hanya Owner dapat membuka kembali. Rating/testimoni ditandai backlog. Simulator stepper dinyatakan hanya visual dan tidak menulis status ke DB. Banner tidak lagi menjanjikan SLA. Bukti after-service dan thread memakai aktor Owner/Staff/Tenant; akun Teknisi, auto-reply, WhatsApp, biaya per tiket/Rp 0, dan rating tidak diklaim sebagai kemampuan P0. Skenario media menegaskan akses melalui server, URL singkat, dan retensi yang ditentukan.

Crosswalk 14 baris diperbarui dengan layer DB/server/UI dan status P0/deferred, serta menghapus klaim bahwa hasil PASS prototipe membuktikan implementasi. Tidak mengubah schema, migration, backend, UI, scope, Neon, atau .env.local.

Raw Verify task ini:

{
  "runbookScenarioIds": 14,
  "crosswalkRows": 14,
  "checks": {
    "scenarioAndCrosswalkIdsUniqueComplete": true,
    "tenantCloseConflictRemoved": true,
    "ownerStaffResolutionAndOwnerReopenDocumented": true,
    "ratingDeferred": true,
    "unsupportedP0ClaimsDeferred": true,
    "simulatorExplicitlyNonPersistent": true,
    "roleQueryNotAuthorization": true,
    "mediaServerAccessAndRetention": true,
    "historicalTenantReadIsReadOnly": true,
    "stalePrototypePassClaimsRemoved": true,
    "crosswalkClassifiesClosure": true
  },
  "result": "PASS_WF12_DB_ALIGNMENT"
}
Raw Verify git diff --check:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

M06-DB-49 Approved: 2026-11-01 by zeenn. Tidak mengubah implementasi BE/DB.

<a id="evidence-m06-db-50"></a>

### Evidence M06-DB-50: audit DB enam alur E2E (2026-11-01)

Audit baca-saja; tidak mengubah skenario/crosswalk, schema, migration, backend/UI, Neon, atau `.env.local`.

Temuan:
- ALUR 01–02: Lease overlap, invoice duplikat per lease/periode/jenis, line RENT/DEPOSIT, alokasi dalam invoice sama, batas overpayment, pembayaran pending yang tidak memengaruhi saldo, saldo dari pembayaran verified/reversal, dan escrow yang hanya menerima alokasi deposit didukung guard DB. Perhitungan billing, scheduler harian/idempotensi operasional, urutan alokasi rent-first, due/overdue, dan otorisasi Tenant milik lease tetap perlu implementasi/validasi server. Guard alokasi DB memastikan invoice/line dan nilai, tetapi tidak menentukan prioritas RENT sebelum DEPOSIT.
- ALUR 02: skenario menyebut pembayaran parsial dan overpayment, tetapi tidak menguji jalur `REJECTED`; model DB mewajibkan alasan penolakan nonblank dan immutable. Tambahkan kasus reject sebagai coverage walkthrough sebelum menganggap jalur review payment tercakup.
- ALUR 03: model Ticket dan attachment mendukung tiket ber-lease opsional, draft/submission dengan media tersedia, serta metadata media privat. Walkthrough hanya menguji Tenant pembuat tiket dengan lease aktif. Scope terbaru mengizinkan semua role membuat tiket; Owner/Staff dapat membuat tiket kamar kosong dengan lease opsional. Tambahkan dua variasi itu ke walkthrough. Otorisasi role/ownership, pemeriksaan bytes file, penyaringan komentar/lampiran, dan signed URL adalah tugas server.
- ALUR 04: Expense, ExpenseReversal, dan OperatingBudget tersedia. Walkthrough belum memeriksa perbandingan aktual pengeluaran bulanan terhadap pagu, yang diwajibkan CR-2026-001/PRD REQ-06 P0. Tambahkan penerimaan Owner untuk bulan dengan pagu, dan state “belum diatur” bila pagu belum diset. Kueri agregasi dan larangan mengembalikan laporan/pagu kepada Staff harus ditegakkan server.
- ALUR 05: LeaseEndRequest mengikat pemohon ke Tenant pemilik Lease; status/reviewer request, pengakhiran Lease, ledger deposit, refund manual yang memesan saldo, dan status fisik Room didukung. Walkthrough sebaiknya menyatakan Owner menyetujui/menolak request sebelum tindakan pengakhiran sesuai keputusan Owner; DB tidak otomatis mengakhiri Lease karena request. “Checklist turnover” tidak punya model DB khusus; pada scope saat ini hanya status fisik `CLEANING`/`READY` dan `maintenanceNote` yang tersimpan. Perlakukan checklist sebagai operasional/manual atau minta keputusan scope bila checklist harus persisten.
- ALUR 06: reversal penuh beralasan, unik per payment, mempertahankan payment asal, dan kompensasi koleksi escrow ditolak secara atomik bila escrow bebas tidak cukup termasuk refund pending. Walkthrough belum menguji kasus negatif saat escrow telah dipakai/dipesan; tambahkan agar jaminan ini benar-benar teruji. AuditEvent, IdempotencyKey, dan mutasi bisnis harus disimpan backend dalam transaksi yang sama.
- Crosswalk E2E saat ini menyatakan kriteria P0 secara ringkas dan belum memperlihatkan batas DB vs server. Tidak ada indikasi kebutuhan schema baru untuk enam alur inti; gap utama adalah coverage acceptance dan keputusan apakah checklist turnover harus dipersistenkan.

Raw Verify cakupan ID dan kontrak DB:

```json
{
  "walkthroughIds": ["E2E-ALUR-01", "E2E-ALUR-02", "E2E-ALUR-03", "E2E-ALUR-04", "E2E-ALUR-05", "E2E-ALUR-06"],
  "crosswalkIds": ["E2E-ALUR-01", "E2E-ALUR-02", "E2E-ALUR-03", "E2E-ALUR-04", "E2E-ALUR-05", "E2E-ALUR-06"],
  "checks": {
    "exactlySixWalkthroughAlurs": true,
    "sixUniqueCompleteCrosswalkRows": true,
    "leaseOverlapAndInvoiceIdempotencyKeysExist": true,
    "pendingAllocationAndOverpaymentGuardsExist": true,
    "rejectionReasonDbGuardExists": true,
    "budgetPositiveMonthlyDbGuardExists": true,
    "ticketLeaseOptionalAndRoomStatusExist": true,
    "checkoutRequesterCompositeGuardExists": true,
    "escrowReservationAndReversalGuardExists": true,
    "walkthroughGapsConfirmed": true,
    "turnoverChecklistNotModeled": true
  },
  "result": "PASS_E2E_DB_AUDIT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```
M06-DB-50 Approved: 2026-11-01 by zeenn. Owner menginstruksikan perbaikan temuan audit; tindak lanjut dicatat sebagai M06-DB-51. Belum mengubah DB/backend.

<a id="evidence-m06-db-51"></a>

### Evidence M06-DB-51: penyelarasan acceptance walkthrough E2E dengan DB P0 (2026-11-01)

Walkthrough enam alur dan crosswalk E2E diperbarui mengikuti hasil audit M06-DB-50. Penambahan mencakup reject payment beralasan tanpa pengurangan saldo, variasi pembuatan tiket oleh Owner/Staff pada kamar kosong, pagu bulanan dan state belum diatur beserta audit perubahan, cabang approve/reject check-out, turnover checklist yang manual/tidak dipersistenkan, dan reversal deposit yang ditolak saat saldo escrow sudah dipakai/dipesan. Kriteria juga membedakan constraint/model DB dari scheduler, kalkulasi, RBAC, otorisasi media, agregasi laporan, dan transaksi atomik di server.

Tidak mengubah schema, migration, backend/UI, scope, Neon, atau `.env.local`.

Raw Verify cakupan walkthrough/crosswalk dan gap yang diperbaiki:

```json
{
  "walkthroughIds": ["E2E-ALUR-01", "E2E-ALUR-02", "E2E-ALUR-03", "E2E-ALUR-04", "E2E-ALUR-05", "E2E-ALUR-06"],
  "crosswalkIds": ["E2E-ALUR-01", "E2E-ALUR-02", "E2E-ALUR-03", "E2E-ALUR-04", "E2E-ALUR-05", "E2E-ALUR-06"],
  "checks": {
    "sixWalkthroughIdsUniqueComplete": true,
    "sixCrosswalkRowsUniqueComplete": true,
    "paymentRejectWithReasonAndNoBalanceImpact": true,
    "allRoleTicketCreationAndTenantOwnership": true,
    "budgetComparisonUnsetAndAudit": true,
    "checkoutDecisionAndTurnoverPersistenceBoundary": true,
    "escrowInsufficientReversalNegativeCase": true,
    "databaseAndServerResponsibilitiesSeparated": true,
    "crosswalkListsDbAndServerBoundaries": true,
    "checklistNotClaimedAsPersistedInCrosswalk": true
  },
  "result": "PASS_E2E_WALKTHROUGH_ALIGNMENT"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```
M06-DB-51 Approved: 2026-11-01 by zeenn. Owner menyetujui hasil walkthrough/crosswalk; tidak mengubah DB/backend.

<a id="evidence-m06-db-52"></a>

### Evidence M06-DB-52: rekonsiliasi review Owner untuk task DB (2026-11-01)

Pemeriksaan administratif TODO-only. Kesepuluh task berikut telah memiliki catatan implementasi/Verify, tetapi masing-masing tetap berstatus `[~]` dan Evidence task-nya tidak mencatat `Approved: <tanggal> by <nama>`. Status dipertahankan menunggu review; tidak ada persetujuan Owner yang ditambahkan atas nama Owner.

| Task | Cakupan | Status | Persetujuan tercatat di Evidence |
|---|---|---|---|
| M06-DB-20 | Tipe dan dimensi kamar | Menunggu review | Tidak |
| M06-DB-21 | Pagu operasional bulanan | Menunggu review | Tidak |
| M06-DB-22 | Fixture seed kamar dan pagu | Menunggu review | Tidak |
| M06-DB-23 | Audit dashboard WF-02 | Menunggu review | Tidak |
| M06-DB-24 | Integritas dan lifecycle kamar WF-03 | Menunggu review | Tidak |
| M06-DB-25 | Audit WF-03 | Menunggu review | Tidak |
| M06-DB-26 | Penutupan gap WF-03 | Menunggu review | Tidak |
| M06-DB-29 | Audit WF-05 | Menunggu review | Tidak |
| M06-DB-35 | Audit WF-06 | Menunggu review | Tidak |
| M06-DB-36 | Integritas rejection Payment WF-06 | Menunggu review | Tidak |

Raw Verify rekonsiliasi status dan persetujuan:

```json
{
    "taskIds":  [
                    "M06-DB-20",
                    "M06-DB-21",
                    "M06-DB-22",
                    "M06-DB-23",
                    "M06-DB-24",
                    "M06-DB-25",
                    "M06-DB-26",
                    "M06-DB-29",
                    "M06-DB-35",
                    "M06-DB-36"
                ],
    "statuses":  {
                     "M06-DB-35":  "~",
                     "M06-DB-25":  "~",
                     "M06-DB-29":  "~",
                     "M06-DB-22":  "~",
                     "M06-DB-24":  "~",
                     "M06-DB-21":  "~",
                     "M06-DB-26":  "~",
                     "M06-DB-36":  "~",
                     "M06-DB-20":  "~",
                     "M06-DB-23":  "~"
                 },
    "evidenceApprovalMissing":  [
                                    "M06-DB-20",
                                    "M06-DB-21",
                                    "M06-DB-22",
                                    "M06-DB-23",
                                    "M06-DB-24",
                                    "M06-DB-25",
                                    "M06-DB-26",
                                    "M06-DB-29",
                                    "M06-DB-35",
                                    "M06-DB-36"
                                ],
    "summaryItems":  10,
    "checks":  {
                   "exactlyTenExpectedRowsPresent":  true,
                   "allTenRemainPendingReview":  true,
                   "evidenceApprovalAbsentForAllTen":  true,
                   "summaryListsTenItems":  true
               },
    "result":  "PASS_DB_REVIEW_RECONCILIATION"
}
```

Raw Verify `git diff --check`:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```



#### Catatan review Owner lanjutan (2026-11-01)

Owner secara eksplisit menyetujui sepuluh task yang tercantum di bawah pada 2026-11-01. Status antrean diperbarui ke `[x]`; hasil Verify historis di atas dipertahankan apa adanya.

| Task | Status setelah review | Persetujuan |
|---|---|---|
| M06-DB-20 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-21 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-22 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-23 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-24 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-25 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-26 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-29 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-35 | [x] | Approved: 2026-11-01 by zeenn |
| M06-DB-36 | [x] | Approved: 2026-11-01 by zeenn |
<a id="evidence-m06-db-53"></a>
#### Persetujuan Owner (2026-11-01)

Owner menyetujui M06-DB-53 setelah review perapian antrean dan pemisahan Evidence. Approved: 2026-11-01 by zeenn.

### Evidence M06-DB-53: perapian TODO dan pemisahan arsip Evidence (2026-11-01)

Bukti dan output Verify M06 dipisahkan dari antrean. Lima puluh tujuh section Evidence lama dipindahkan ke arsip ini dengan ID unik; task row M06-DB-49 sampai M06-DB-52 dipindahkan ke task register, lalu M06-DB-53 ditambahkan. Sepuluh task yang menunggu persetujuan Owner tetap `[~]`. `TODO.md` kini memuat tautan tunggal ke arsip Evidence.

Raw Verify struktur TODO dan arsip:

```json
{
  "archivedEvidenceSections": 58,
  "taskRowsInQueue": ["M06-DB-49", "M06-DB-50", "M06-DB-51", "M06-DB-52", "M06-DB-53"],
  "pendingReviewTaskIds": ["M06-DB-20", "M06-DB-21", "M06-DB-22", "M06-DB-23", "M06-DB-24", "M06-DB-25", "M06-DB-26", "M06-DB-29", "M06-DB-35", "M06-DB-36"],
  "checks": {
    "archiveHas58UniqueEvidenceSections": true,
    "allHistoricalSectionsRemainInArchive": true,
    "todoHasNoM06EvidenceBodies": true,
    "todoHasOneArchiveLinkAndNoOldEvidenceLinks": true,
    "tasks49To53AreInRegisterAndOrdered": true,
    "allTenPendingReviewsRetainPendingStatus": true,
    "noTaskRowsEmbeddedInEvidenceArchive": true
  },
  "result": "PASS_M06_TODO_EVIDENCE_REORGANIZATION"
}
```

Raw Verify `git diff --check` (initial run; found trailing blank line in TODO.md):

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
TODO.md:244: new blank line at EOF.
EXIT_CODE=2
```

Final Verify `git diff --check` after removing the extra blank line:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/design/SCENARIOS_WF12.md', LF will be replaced by CRLF the next time Git touches it
EXIT_CODE=0
```

### Verify lanjutan M06-DB-53: rendering tabel antrean (2026-11-01)

Ditemukan tiga baris kosong yang memutus tabel task menjadi beberapa tabel/teks biasa. Baris pemutus dihapus tanpa mengubah isi task, status, atau persetujuan.

Raw Verify struktur:

``json
{
    "tableDataRows":  53,
    "blankLinesInsideTable":  0,
    "nonRowLinesInsideTable":  0,
    "normalizedCellCounts":  [
                                 9
                             ],
    "allTenPendingTasksRemainPending":  true,
    "diffCheckExitCode":  0,
    "diffCheckOutput":  [
                            "warning: in the working copy of \u0027docs/architecture/M05-DATA-API-SPEC-DRAFT.md\u0027, LF will be replaced by CRLF the next time Git touches it",
                            "warning: in the working copy of \u0027docs/design/SCENARIOS_WF12.md\u0027, LF will be replaced by CRLF the next time Git touches it"
                        ],
    "result":  "PASS_M06_TODO_TABLE_RENDERING"
}
``


#### Raw Verify persetujuan eksplisit Owner (2026-11-01)

``json
{
    "approvedTaskIds":  [
                            "M06-DB-20",
                            "M06-DB-21",
                            "M06-DB-22",
                            "M06-DB-23",
                            "M06-DB-24",
                            "M06-DB-25",
                            "M06-DB-26",
                            "M06-DB-29",
                            "M06-DB-35",
                            "M06-DB-36"
                        ],
    "queueRowsFound":  10,
    "allTenRowsMarkedXWithApproval":  true,
    "db52ReconciliationMarkedX":  true,
    "db53RemainsPending":  true,
    "archiveRecordsForApprovedTasks":  10,
    "diffCheckExitCode":  0,
    "diffCheckOutput":  [
                            "warning: in the working copy of \u0027docs/pm/evidence/M06-EVIDENCE.md\u0027, LF will be replaced by CRLF the next time Git touches it"
                        ],
    "result":  "PASS_M06_DB52_OWNER_APPROVAL_RECONCILIATION"
}
``

#### Raw Verify awal (dikoreksi) dan hasil akhir M06-DB-53 (2026-11-01)

Verify awal menemukan satu spasi di akhir pagar code block yang baru ditambahkan. Spasi dihapus, lalu Verify diulang.

Raw Verify awal:

``json
{"attempt":1,"result":"FAIL_M06_DB53_ARCHIVE_REVIEW","diffCheckExitCode":2,"diffCheckOutput":"docs/pm/evidence/M06-EVIDENCE.md:3252: trailing whitespace: +`` "}
`` 

Raw Verify akhir:

``json
{
    "archiveEvidenceAnchors":  58,
    "uniqueEvidenceAnchors":  58,
    "duplicateAnchorCount":  0,
    "todoArchiveLinkCount":  1,
    "allEvidenceArchiveLinksInTodo":  1,
    "todoEvidenceBodies":  0,
    "taskRows49to53OrderedAndApproved":  true,
    "db53ApprovalRecorded":  true,
    "setup03And10RemainPending":  true,
    "diffCheckExitCode":  0,
    "diffCheckOutput":  [

                        ],
    "result":  "PASS_M06_DB53_ARCHIVE_REVIEW"
}
``
<a id="evidence-m06-setup-03-review"></a>
### Evidence M06-SETUP-03: review Owner dan status task (2026-11-01)

Owner menyetujui M06-SETUP-03 pada 2026-11-01 setelah review. Evidence pre-read dan output Verify awal tetap tercatat pada baris task di TODO.

Raw Verify persetujuan:

``json
{
    "task":  "M06-SETUP-03",
    "checks":  {
                   "rowMarkedComplete":  true,
                   "approvalRecorded":  true,
                   "preReadEvidencePreserved":  true,
                   "setup10StillPending":  true
               },
    "diffCheckExitCode":  0,
    "diffCheckOutput":  [
                            "warning: in the working copy of \u0027docs/pm/evidence/M06-EVIDENCE.md\u0027, LF will be replaced by CRLF the next time Git touches it"
                        ],
    "result":  "PASS_M06_SETUP03_OWNER_APPROVAL"
}
``
<a id="evidence-m06-setup-10-review"></a>
### Evidence M06-SETUP-10: review Owner dan status task (2026-11-01)

Owner menyetujui M06-SETUP-10 pada 2026-11-01. Persetujuan mencakup hasil Verify pada database sekali pakai; bootstrap ke Auth/database milik Owner belum dijalankan.

Raw Verify persetujuan:

``json
{
    "task":  "M06-SETUP-10",
    "checks":  {
                   "rowMarkedComplete":  true,
                   "approvalRecorded":  true,
                   "disposableVerifyEvidencePresent":  true,
                   "actualOwnerBootstrapNotClaimed":  true,
                   "setup03Approved":  true
               },
    "diffCheckExitCode":  0,
    "diffCheckOutput":  [

                        ],
    "result":  "PASS_M06_SETUP10_OWNER_APPROVAL"
}
``

<a id="evidence-m06-setup-12"></a>
### Evidence M06-SETUP-12: cakupan task backend M06 (2026-11-01)

Verifikasi awal di bawah gagal karena pemeriksa menghitung baris FE yang hanya menyebut ID BE sebagai prasyarat, dan mencari teks prasyarat `M06-DB-54` tanpa memperhitungkan bentuk daftar slash. Pemeriksa diperbaiki agar menghitung format kolom hanya untuk ID task DB/BE/AUTH dan memeriksa dependency eksplisit. Satu assertion status-summary sempat gagal karena mencari frasa yang tidak dipakai; pengecekan diselaraskan dengan teks status aktual.

Raw Verify awal (gagal):

```json
{
  "checks": {
    "task_ids_unique": true,
    "task_rows_have_9_columns": false,
    "setup11_records_7_day_cancel_cleanup": true,
    "db54_created_pending_with_actor_constraint": true,
    "be11_depends_db54_and_implements_expiry": false,
    "be12_depends_db54_and_cleanup": false,
    "fsd_records_expiry": true,
    "m05_records_expiry_and_actor_contract": true,
    "db54_does_not_claim_implementation": true
  },
  "task_rows": 150,
  "task_ids": 150,
  "failed": [
    "task_rows_have_9_columns",
    "be11_depends_db54_and_implements_expiry",
    "be12_depends_db54_and_cleanup"
  ]
}
```

Raw Verify ulang:

```json
{
  "checks": {
    "task_ids_unique": true,
    "db_be_auth_rows_have_9_columns": true,
    "setup11_records_7_day_cancel_cleanup": true,
    "db54_created_pending_with_actor_constraint": true,
    "be11_depends_db54_and_implements_expiry": true,
    "be12_depends_db54_and_cleanup": true,
    "fsd_records_expiry": true,
    "m05_records_expiry_and_actor_contract": true,
    "db54_does_not_claim_implementation": true,
    "todo_status_summary_current": true
  },
  "task_rows_total": 150,
  "db_be_auth_rows_checked": 70,
  "unique_task_ids": 150,
  "failed": [],
  "result": "PASS"
}
```


Crosswalk operasi M05 ke task penerapan:

| Operasi M05 | Task |
|---|---|
| `createStaffAccount` | M06-SETUP-09 |
| `createTenantAccount` | M06-SETUP-09 |
| `setAccountStatus` | M06-SETUP-09; audit M06-BE-13 |
| `updateTenantProfile` | M06-BE-16; izin Owner disetujui lewat M06-SETUP-13 |
| `changeLoginEmail` | M06-AUTH-01 |
| `changeOwnPassword` | M06-SETUP-07 |
| `createFloor` / `updateFloor` / `archiveFloor` / `restoreFloor` | M06-BE-02 |
| `createRoom` / `updateRoom` / `archiveRoom` / `restoreRoom` | M06-BE-02 |
| `createLease` | M06-BE-03; invoice awal M06-BE-04 |
| `requestLeaseEnd` | M06-BE-09 |
| `endLease` / `reconcileCheckoutDeposit` | M06-BE-09 |
| `runInvoiceGeneration` | M06-BE-05, M06-INT-03 |
| `markInvoiceDelivered` | M06-BE-06 |
| `voidInvoice` | M06-BE-06; DB guard M06-DB-34 |
| `recordPayment` | M06-BE-07 |
| `verifyPayment` / `rejectPayment` | M06-BE-08 |
| `reversePayment` | M06-BE-08 |
| `settleInvoiceFromDeposit` | M06-BE-09 |
| `reconcileCheckoutDeposit` | M06-BE-09 |
| `recordExpense` | M06-BE-10 |
| `reverseExpense` | M06-BE-10 |
| `setOperatingBudget` | M06-BE-10 |
| `getFinancialReport` | M06-BE-10 |
| `createTicketDraft` | M06-BE-11 |
| `submitTicketDraft` / `discardTicketDraft` | M06-BE-11; expiry actor SYSTEM M06-DB-54 |
| `updateTicket` / `assignTicket` / `cancelTicket` / `reopenTicket` | M06-BE-11 |
| `addTicketComment` | M06-BE-11 |
| `createUploadIntent` | M06-BE-12 |
| `finalizeUpload` / `requestAttachment` | M06-BE-12 |
| Cross-cutting: validasi/error domain | M06-BE-01 |
| Cross-cutting: audit atomik | M06-BE-13 |
| Cross-cutting: query/list/detail | M06-BE-14 |
| Cross-cutting: dashboard/activity feed | M06-BE-15 |

Semua 28 baris operasi dan 40 nama metode pada tabel M05 memiliki task penerapan; `reconcileCheckoutDeposit` tertulis dua kali di sumber dan keduanya dipetakan ke M06-BE-09. M06-SETUP-13 disetujui Owner: Tenant mengubah profil sendiri, Owner dapat mengubah profil Tenant, dan Staff read-only. Operasi cross-cutting juga memiliki task khusus.


Raw crosswalk Verify awal setelah keputusan izin profil (sebelum operasi status akun ditambahkan):

```json
{
  "checks": {
    "all_28_m05_operation_rows_mapped": true,
    "all_40_m05_methods_mapped": true,
    "no_unmapped_operation_names": true,
    "crosswalk_task_references_exist": true,
    "all_task_ids_unique": true,
    "db_be_auth_rows_have_9_columns": true,
    "void_invoice_task_and_db_guard_mapped": true,
    "tenant_profile_owner_tenant_staff_policy_aligned": true,
    "tenant_profile_be16_exists_and_is_gated_by_approved_decision": true,
    "ticket_expiry_and_system_actor_prereq_mapped": true
  },
  "task_ids": 152,
  "db_be_auth_rows_checked": 71,
  "operation_rows": 28,
  "unique_methods": 40,
  "crosswalk_methods": 40,
  "unmapped_methods": [],
  "unknown_task_refs": [],
  "result": "PASS"
}
```

Raw `git diff --check` output: `warning: in the working copy of 'docs/architecture/M05-DATA-API-SPEC-DRAFT.md', LF will be replaced by CRLF the next time Git touches it`; `warning: in the working copy of 'docs/specs/FSD.md', LF will be replaced by CRLF the next time Git touches it`. Exit code: `0`.

### Re-audit skenario WF-01?WF-12 dan task BE (2026-11-01)

Runbook memakai heading SKENARIO NN; ID matriks WF-xx-SK-xx dinormalisasi berdasarkan nomor urut. Seluruh 613 heading sumber cocok dengan 613 baris matriks. Ringkasan scope lama tidak cocok dengan label baris saat ini. Ringkasan diperbaiki menjadi 392 kandidat generik, 69 P0 eksplisit, 151 backlog/out-of-scope, dan 1 keputusan Owner terbuka. setAccountStatus kini menjadi operasi M05 ke M06-SETUP-09; audit account lifecycle ditautkan ke M06-BE-13. Kontrol auth request/rate-limit ditambahkan sebagai M06-BE-17, dan rate-limit upload intent dicantumkan pada M06-BE-12. FSD SEC-01/02/07 ditautkan ke task tersebut dan verifikasi provider M07.

Temuan yang menghalangi klaim penuh:
- WF-09-SK-12: Owner belum memutuskan apakah penonaktifan Staff diblokir sampai tiket aktif dialihkan atau tiket dialihkan dalam operasi yang sama.
- WF-09-SK-15/SK-38: skenario menetapkan reset/undangan provider tanpa sandi sementara yang ditampilkan aplikasi; implementasi M06-SETUP-09 sekarang mengembalikan dan menampilkan temporaryPassword. Ini perlu keputusan Owner.
- Tidak ada bukti runtime seluruh skenario; crosswalk per workflow menunjukkan task pemilik dan bukan hasil test.

Raw Verify re-audit:

```json
{
  "checks": {
    "12_sources_613_numbered_headings": true,
    "evaluation_ids_cover_source_heading_sequences": true,
    "workflow_counts_match_sources": true,
    "scope_summary_matches_rows": true,
    "scope_summary_synced_across_docs": true,
    "stale_scope_totals_removed": true,
    "only_open_owner_scenario_wf09_sk12": true,
    "scenario_crosswalk_covers_all_12": true,
    "scenario_crosswalk_task_refs_exist": true,
    "m05_29_rows_41_methods_mapped": true,
    "set_account_status_mapped": true,
    "task_ids_153_unique": true,
    "db_be_auth_rows_complete": true,
    "be12_upload_rate_limit": true,
    "be13_account_audit": true,
    "be17_auth_security": true,
    "test02_covers_be17_auth01": true,
    "fsd_security_traceability": true,
    "account_password_conflict_recorded": true,
    "be_implementation_not_started": true
  },
  "source_files": 12,
  "source_scenario_headings": 613,
  "evaluation_scenario_rows": 613,
  "source_workflow_counts": {
    "WF-01": 64,
    "WF-02": 75,
    "WF-03": 57,
    "WF-04": 40,
    "WF-05": 61,
    "WF-06": 55,
    "WF-07": 50,
    "WF-08": 68,
    "WF-09": 90,
    "WF-10": 26,
    "WF-11": 13,
    "WF-12": 14
  },
  "scope_counts": {
    "generic_mvp": 392,
    "explicit_mvp": 69,
    "all_mvp": 461,
    "backlog_out_of_scope": 151,
    "owner_decisions": 1
  },
  "m05_operation_rows": 29,
  "m05_unique_methods": 41,
  "crosswalk_unique_methods": 41,
  "unmapped_methods": [],
  "task_ids": 153,
  "db_be_auth_rows": 72,
  "scenario_crosswalk_task_refs_checked": 25,
  "open_owner_scenarios": [
    "WF-09-SK-12"
  ],
  "failed": [],
  "result": "PASS"
}
```

Status: dokumentasi dan task register diperbarui; belum mengimplementasikan backend, schema, atau migration. M06-DB-54 menunggu review/eksekusi DB. M06-SETUP-12 menunggu review Owner.

#### Keputusan Owner WF-09 dan tindak lanjut kredensial (2026-11-01)

Owner menyetujui dua kebijakan: (1) penonaktifan Staff diblokir sampai setiap tiket aktif dialihkan manual kepada Staff aktif lain atau Owner; transfer dan histori assignment dipertahankan serta diaudit, dan transfer terpisah dari deaktivasi; (2) onboarding/reset kredensial memakai email provider, tanpa aplikasi membuat/mengembalikan/menampilkan sandi sementara atau token reset. Dukungan email provider harus lulus verifikasi M07; bila tidak tersedia, menjadi blocker tanpa fallback sandi aplikasi.

WF-09-SK-12 diperbarui dari keputusan terbuka menjadi perilaku P0; WF-09-SK-68 menegaskan modal transfer atomik dan role Teknisi berada di backlog. WF-01-SK-22/43/44 diganti ke alur kredensial provider. SCR-01C tidak memiliki route aplikasi. M06-BE-18 ditambahkan untuk implementasi kebijakan akun dan offboarding; kode aplikasi belum diubah. `src/actions/users.ts` dan UI direktori akun masih mengembalikan/menampilkan sandi sementara, sehingga kebijakan telah diputuskan tetapi kode belum sesuai sampai M06-BE-18 dijalankan.

Raw Verify dokumentasi M06-SETUP-12:

```json
{
  "checks": {
    "12_workflow_sources_and_613_headings": true,
    "evaluation_covers_all_source_ids": true,
    "scope_counts_synced_392_70_151_0": true,
    "no_open_owner_scenario": true,
    "wf09_staff_offboarding_policy_in_source_and_crosswalk": true,
    "no_combined_or_automatic_staff_transfer": true,
    "credential_policy_synced_with_account_contract": true,
    "wf01_activation_and_legacy_scenarios_revised": true,
    "activation_route_deferred_in_design_and_todo": true,
    "be18_registered_once_and_integration_tested": true,
    "m05_29_rows_41_unique_methods": true,
    "task_ids_154_unique": true,
    "db_be_auth_rows_73": true,
    "setup12_waiting_owner_review": true,
    "current_temporary_password_code_remains_followup_gap": true,
    "evidence_contains_current_pass_and_known_gap": true,
    "no_application_code_changed": true
  },
  "workflow_counts": {
    "WF-01": 64,
    "WF-02": 75,
    "WF-03": 57,
    "WF-04": 40,
    "WF-05": 61,
    "WF-06": 55,
    "WF-07": 50,
    "WF-08": 68,
    "WF-09": 90,
    "WF-10": 26,
    "WF-11": 13,
    "WF-12": 14
  },
  "source_scenario_headings": 613,
  "evaluation_scenario_rows": 613,
  "scope_counts": {
    "generic_mvp": 392,
    "explicit_mvp": 70,
    "backlog_out_of_scope": 151,
    "owner_decisions": 0
  },
  "m05_operation_rows": 29,
  "m05_method_references": 42,
  "m05_unique_methods": 41,
  "task_ids": 154,
  "db_be_auth_rows": 73,
  "failed": [],
  "result": "PASS"
}
```

Raw `git diff --check`: output kosong; `EXIT_CODE=0`. Verifikasi memastikan tidak ada file aplikasi berubah. M06-SETUP-12 tetap menunggu review Owner; task BE belum dimulai.

#### Persetujuan Owner dan verifikasi status M06-SETUP-12 (2026-11-01)

Owner menyetujui hasil review M06-SETUP-12 melalui "approve". Status task ditandai `[x]` dan `Approved: 2026-11-01 by zeenn` dicatat di `TODO.md`. Audit cakupan sebelumnya tetap PASS: 613 skenario sumber dan 613 baris evaluasi, 41 metode M05 unik, 154 ID task, dan 73 task DB/BE/AUTH. M06-DB-54 tetap pending sebagai prasyarat M06-BE-11/12; implementasi BE belum dimulai.

Raw Verify setelah persetujuan:

```json
{
  "checks": {
    "setup12_marked_approved": true,
    "approval_recorded": true,
    "status_summary_includes_approved_setup_range": true,
    "all_18_be_tasks_registered": true,
    "auth_email_change_task_registered": true,
    "db_be_auth_rows_total_73": true,
    "task_ids_unique_154": true,
    "prior_source_and_evaluation_coverage_pass": true,
    "prior_m05_methods_mapped": true,
    "no_owner_scenario_left_open": true,
    "db54_still_pending_before_be11_and_be12": true,
    "be_implementation_still_not_started": true,
    "git_diff_check_exit_zero": true
  },
  "be_tasks": 18,
  "auth_tasks": 1,
  "task_ids": 154,
  "db_be_auth_rows": 73,
  "prior_coverage": {
    "source_scenarios": 613,
    "evaluation_rows": 613,
    "m05_unique_methods": 41
  },
  "git_diff_check_exit_code": 0,
  "git_diff_check_output": "",
  "failed": [],
  "result": "PASS"
}
```

`EXIT_CODE=0`

### Evidence M06-DB-54: actor SYSTEM pada status event tiket (2026-11-01)

`TicketStatusEvent` kini memiliki `actorType` `USER/SYSTEM`. Migrasi menambahkan kolom dengan default `USER` agar semua histori lama tetap sebagai aksi pengguna, membuat `actorId` nullable, lalu menjaga pasangan actor type dan ID dengan CHECK; FK AppUser tetap membatasi event USER ke pengguna yang ada. Spesifikasi M05 Data API sudah menyatakan kontrak yang sama sehingga tidak perlu diubah. Task belum disetujui Owner; backend/job belum dikerjakan dan migrasi belum diterapkan ke Neon.

Prisma divalidasi memakai config sementara dengan URL PostgreSQL sintetis. Config sementara dihapus setelah Verify; `.env.local` tidak digunakan atau dibaca.

Raw `npx prisma validate --config prisma.verify.config.ts`:

```text
Loaded Prisma config from prisma.verify.config.ts.

Prisma schema loaded from prisma\schema.prisma.
┌─────────────────────────────────────────────────────────┐
│  Update available 7.10.1 -> 8.0.0-rc.29                 │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                           │
└─────────────────────────────────────────────────────────┘
The schema at prisma\schema.prisma is valid 🚀
EXIT_CODE=0
```

Migrasi dijalankan pada fixture `TicketStatusEvent` minimal di PGlite in-memory disposable. Fixture merepresentasikan kolom lama dan FK `ticket_id`/`actor_id`; tidak menerapkan migration ke database Neon.

Raw Verify PGlite:

```json
{
  "checks": {
    "migration_applied_to_disposable_pglite": true,
    "old_event_preserved_as_user": true,
    "user_event_accepts_app_user_fk": true,
    "system_event_accepts_null_actor": true,
    "user_with_null_actor_rejected": true,
    "system_with_app_user_rejected": true,
    "unknown_user_rejected_by_fk": true
  },
  "failed": [],
  "result": "PASS"
}
```

`EXIT_CODE=0`

Raw `git diff --check` dan pengecekan whitespace migration:

```text
warning: in the working copy of 'prisma/schema.prisma', LF will be replaced by CRLF the next time Git touches it
GIT_DIFF_CHECK_EXIT_CODE=0
MIGRATION_TRAILING_WHITESPACE_LINES=0
MIGRATION_FINAL_NEWLINE=True
```

Owner menyetujui M06-DB-54 pada 2026-11-01. Status TODO diubah menjadi `[x]` dan approval dicatat sebagai `Approved: 2026-11-01 by zeenn`. Tidak ada perubahan schema/migration setelah Verify; migrasi belum diterapkan ke Neon dan task BE belum dimulai.

<a id="evidence-m06-be-01"></a>

### Evidence M06-BE-01 — Validasi input dan error domain bersama (2026-11-02)

- Menyediakan 40 schema input server untuk operasi M05. Perubahan sandi tidak memiliki schema server karena credential tetap langsung ke Neon Auth client/provider sesuai kontrak.
- Schema memakai object strict, normalisasi nama/email/kode kamar/nominal, tanggal kalender valid, E.164, rentang tarif/deposit, dimensi berpasangan, dan idempotency key wajib untuk mutasi yang dapat menggandakan transaksi finansial atau histori tiket.
- Error Zod, Prisma, Neon Auth, storage provider, dan error tak dikenal dipetakan ke kode/status stabil; detail SQL, provider, token, dan nilai payload tidak dikembalikan.
- Owner menyetujui patokan uang `NUMERIC(12,2)` pada 2026-11-02. Kalimat M05 yang menyebut `NUMERIC(14,2)` diselaraskan dengan FSD, Prisma, dan migrasi DB.
- Aturan format media tetap perlu diselesaikan pada M06-BE-12: FSD menyebut MP4/MOV, tetapi constraint DB saat ini menerima MP4. Schema upload pada task ini memvalidasi bentuk metadata; allowlist/limit format ditangani bersama keputusan BE-12.
- TODO M06-BE-01 tetap `[ ]` menunggu review Owner.

Verify `npm run test -- validation`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs validation

TAP version 13
# Subtest: exposes strict schemas for each M05 server operation
ok 1 - exposes strict schemas for each M05 server operation
  ---
  duration_ms: 11.7752
  ...
# Subtest: normalizes account names and emails without accepting client role
ok 2 - normalizes account names and emails without accepting client role
  ---
  duration_ms: 3.8186
  ...
# Subtest: normalizes money strings and enforces numeric(12,2) boundaries
ok 3 - normalizes money strings and enforces numeric(12,2) boundaries
  ---
  duration_ms: 7.7985
  ...
# Subtest: enforces room rent limits and paired positive dimensions
ok 4 - enforces room rent limits and paired positive dimensions
  ---
  duration_ms: 9.7015
  ...
# Subtest: rejects impossible dates and invalid lease ranges
ok 5 - rejects impossible dates and invalid lease ranges
  ---
  duration_ms: 5.0433
  ...
# Subtest: requires emergency contact name and phone to change together
ok 6 - requires emergency contact name and phone to change together
  ---
  duration_ms: 4.5541
  ...
# Subtest: maps provider, persistence, validation, and unknown errors safely
ok 7 - maps provider, persistence, validation, and unknown errors safely
  ---
  duration_ms: 3.8433
  ...
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 784.3534
EXIT_CODE=0
```

Catatan waktu: pernyataan task BE belum dimulai pada catatan M06-DB-54 di atas berlaku saat Verify DB54, 2026-11-01. M06-BE-01 dimulai pada 2026-11-02.

### Evidence M06-BE-02 — Operasi kamar dan katalog lantai (2026-11-02)

- Menambahkan Server Actions untuk daftar/baca, buat, ubah, arsip, dan pulihkan Floor/Room. Setiap mutasi memeriksa sesi dan role; hanya Owner mengubah katalog, sementara Staff hanya mengubah status fisik Room. Tenant hanya membaca Room yang punya riwayat Lease atas namanya.
- Validasi server menggunakan schema M06-BE-01: kode Room trim-uppercase, nama Floor trim + NFC dan kunci lowercase, dimensi berpasangan, rentang uang, cursor, dan batas daftar default 20/maksimum 100.
- Deposit default dibuat server sebesar 50% tarif dan dibulatkan ke kelipatan Rp50.000 terdekat; nilai ini hanya saran awal. Update deposit hanya tersedia untuk Owner.
- Query database memakai parameter terikat dan DTO terbatas; tidak ada operasi hard-delete. Error unique, FK, batas DB, dan konflik lifecycle dipetakan ke kode aman. Semua tes menggunakan repository in-memory sintetis.
- Verify pertama menemukan ekspektasi test pembulatan Rp150.000 yang salah; contoh WF-03 menetapkan pembulatan Rp875.000 menjadi Rp900.000, sehingga nilai tepat di tengah dibulatkan ke atas. Ekspektasi dikoreksi dan Verify final lulus.
- Tidak membuat akun, menjalankan Neon CLI, membaca `.env.local`, menjalankan migrasi, atau mengirim query ke Neon pada Verify ini.
- Catatan workspace saat Verify BE-02: file `prisma/migrations/20261101330000_wf03_room_operational_rules/migration.sql` kosong dan suite tidak memverifikasinya. Pada 2026-11-02, atas persetujuan Owner, migrasi dipulihkan dari Git (4.1 KB); tidak menjalankan migrasi atau mengakses Neon.
- M06-BE-01 disetujui Owner lewat instruksi “ok lanjut” pada 2026-11-02. M06-BE-02 disetujui Owner lewat instruksi “ok lanjut” pada 2026-11-02.

Verify `npm run test -- rooms-floors`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs rooms-floors

TAP version 13
# Subtest: normalizes floor names and rejects collisions after normalization
ok 1 - normalizes floor names and rejects collisions after normalization
  ---
  duration_ms: 18.0714
  ...
# Subtest: normalizes room codes and calculates the approved default deposit
ok 2 - normalizes room codes and calculates the approved default deposit
  ---
  duration_ms: 17.0364
  ...
# Subtest: rejects room codes that collide after trimming and uppercasing
ok 3 - rejects room codes that collide after trimming and uppercasing
  ---
  duration_ms: 4.1064
  ...
# Subtest: rejects room-code collisions after normalization during updates
ok 4 - rejects room-code collisions after normalization during updates
  ---
  duration_ms: 8.3957
  ...
# Subtest: enforces money, dimensions, and paired dimension boundaries
ok 5 - enforces money, dimensions, and paired dimension boundaries
  ---
  duration_ms: 14.1774
  ...
# Subtest: allows Staff to change only room physical status
ok 6 - allows Staff to change only room physical status
  ---
  duration_ms: 1.9801
  ...
# Subtest: blocks room archive and physical status changes while a lease is scheduled or active
ok 7 - blocks room archive and physical status changes while a lease is scheduled or active
  ---
  duration_ms: 5.3137
  ...
# Subtest: floor archive waits for active room records; restore requires an active floor
ok 8 - floor archive waits for active room records; restore requires an active floor
  ---
  duration_ms: 3.2668
  ...
# Subtest: allows Tenant to read only rooms connected to their own lease history
ok 9 - allows Tenant to read only rooms connected to their own lease history
  ---
  duration_ms: 1.6084
  ...
# Subtest: bounds room and floor lists to 20 by default and 100 maximum
ok 10 - bounds room and floor lists to 20 by default and 100 maximum
  ---
  duration_ms: 8.912
  ...
# Subtest: maps database race conflicts to stable room and floor errors
ok 11 - maps database race conflicts to stable room and floor errors
  ---
  duration_ms: 4.1621
  ...
# Subtest: normalizes floor edits and rejects collisions after normalization
ok 12 - normalizes floor edits and rejects collisions after normalization
  ---
  duration_ms: 3.6116
  ...
1..12
# tests 12
# suites 0
# pass 12
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 811.0159
EXIT_CODE=0
```


<a id="evidence-m06-be-03"></a>

### Evidence M06-BE-03 - Pembuatan Lease atomik (2026-11-02)

- Owner menyetujui M06-BE-03 pada 2026-11-02; task ditutup di `TODO.md`.
- Menambahkan Server Action `createLeaseAction` di `src/actions/leases.ts`; aksi mengotorisasi Owner/Staff pada server, mengambil `createdById` dari sesi, lalu memperbarui cache daftar kontrak, penghuni, dan tagihan.
- `src/lib/leases/operations.mjs` memvalidasi payload ketat, menolak caller Tenant, membuat fingerprint idempotensi, menghitung status Lease memakai tanggal `Asia/Jakarta`, dan memanggil kalkulator invoice perdana M06-BE-04.
- `src/lib/leases/repository.ts` menjalankan query berurutan melalui satu transaksi Neon HTTP. Transaksi mengunci row AppUser dan Room, mengecek Tenant aktif beserta TenantProfile, status/arsip Room dan Floor, mengecek rentang konflik inklusif, lalu menyimpan Lease, Invoice `INITIAL`, line `RENT`/`DEPOSIT`, dan respons `IdempotencyKey` bersama. Exclusion constraints DB-02/19 dan trigger DB-26 tetap menjadi pagar integritas terhadap race.
- Retry dengan key dan payload sama mengembalikan respons tersimpan; payload berbeda dengan key sama ditolak sebagai konflik. Error database dipetakan ke kode domain yang aman.
- `tests/leases/leases.test.mjs` memakai repository memori dengan fixture sintetis untuk role/actor sesi, account/profile Tenant, status tanggal, overlap inklusif, dua create bersamaan, archived Room/Floor, maintenance, rollback invoice, serta retry berurutan dan bersamaan. Test ini tidak terhubung ke PostgreSQL/Neon; transaksi SQL belum dijalankan terhadap database.
- Verify pertama gagal 3 assertion karena test mengharapkan error domain alih-alih `ZodError` dan mengharapkan Lease future berstatus `ACTIVE`; ekspektasi test diperbaiki sebelum Verify akhir.
- Tidak menjalankan migrasi, Neon CLI/query, atau membaca `.env.local`.

Verify akhir `npm run test -- leases`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs leases

TAP version 13
# Subtest: allows Owner and Staff and records the authenticated actor
ok 1 - allows Owner and Staff and records the authenticated actor
  ---
  duration_ms: 80.2551
  ...
# Subtest: rejects Tenant callers and client-supplied actor fields
ok 2 - rejects Tenant callers and client-supplied actor fields
  ---
  duration_ms: 4.8278
  ...
# Subtest: validates calendar dates and determines Lease status in Jakarta time
ok 3 - validates calendar dates and determines Lease status in Jakarta time
  ---
  duration_ms: 14.5603
  ...
# Subtest: requires an active Tenant account and TenantProfile
ok 4 - requires an active Tenant account and TenantProfile
  ---
  duration_ms: 3.9138
  ...
# Subtest: rejects archived rooms, archived floors, and rooms under maintenance
ok 5 - rejects archived rooms, archived floors, and rooms under maintenance
  ---
  duration_ms: 10.9076
  ...
# Subtest: treats Lease end dates as inclusive for room and Tenant overlap
ok 6 - treats Lease end dates as inclusive for room and Tenant overlap
  ---
  duration_ms: 7.852
  ...
# Subtest: serializes competing creates so only one overlapping room Lease succeeds
ok 7 - serializes competing creates so only one overlapping room Lease succeeds
  ---
  duration_ms: 5.4698
  ...
# Subtest: serializes competing creates so one Tenant cannot hold overlapping Leases
ok 8 - serializes competing creates so one Tenant cannot hold overlapping Leases
  ---
  duration_ms: 3.3988
  ...
# Subtest: rolls back Lease and idempotency when initial invoice creation fails
ok 9 - rolls back Lease and idempotency when initial invoice creation fails
  ---
  duration_ms: 5.2521
  ...
# Subtest: returns the stored result on an identical idempotent retry
ok 10 - returns the stored result on an identical idempotent retry
  ---
  duration_ms: 8.7275
  ...
# Subtest: collapses simultaneous retries with one idempotency key into one Lease
ok 11 - collapses simultaneous retries with one idempotency key into one Lease
  ---
  duration_ms: 4.5421
  ...
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 789.4999
EXIT_CODE=0
```

<a id="evidence-m06-be-04"></a>

### Evidence M06-BE-04 - Kalkulator invoice perdana dan prorata (2026-11-02)

- Owner menyetujui M06-BE-04 pada 2026-11-02; task ditutup di `TODO.md`.
- Menambahkan kalkulator murni di `src/lib/billing/initial-invoice.mjs` beserta entry point TypeScript `src/lib/billing/initial-invoice.ts`.
- Mode `PRORATA_TO_MONTH_END` menghitung hari check-in sampai akhir bulan secara inklusif memakai rumus M05 dan membulatkan nominal ke Rp1.000 terdekat; nilai tepat di tengah dibulatkan ke atas.
- Mode `FULL_MONTH_ANNIVERSARY` menagih satu bulan penuh. Periode invoice berakhir sehari sebelum siklus tanggal masuk berikutnya; tanggal masuk diklem ke hari terakhir pada bulan yang lebih pendek.
- Jatuh tempo invoice perdana sama dengan tanggal check-in. Baris `RENT` dan `DEPOSIT` disimpan terpisah; deposit memakai jumlah yang disepakati, dan line deposit tidak dibuat bila nominalnya nol. Kalkulator tidak memaksakan default deposit kamar.
- Nominal diproses dengan integer minor units (`BigInt`) untuk menjaga presisi. Kalkulasi prorata yang membulat ke nol ditolak sebagai `AMOUNT_INVALID`, sebab `InvoiceLine.amount` wajib positif.
- Fixture WF-05 (15 Okt 2026, Rp1.200.000, 17/31 hari) menghasilkan sewa Rp658.000; fixture WF-04 prorata (16 Nov 2026, Rp1.100.000, deposit Rp500.000) menghasilkan Rp550.000 + Rp500.000; fixture WF-04 full-month menghasilkan Rp1.100.000 + Rp500.000.
- Tidak menjalankan migrasi, Neon CLI, query database, atau membaca `.env.local`.

Verify `npm run test -- initial-invoice`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs initial-invoice

TAP version 13
# Subtest: matches WF-05 prorata amount and inclusive billable days
ok 1 - matches WF-05 prorata amount and inclusive billable days
  ---
  duration_ms: 8.9343
  ...
# Subtest: matches WF-04 prorata check-in with separate rent and deposit lines
ok 2 - matches WF-04 prorata check-in with separate rent and deposit lines
  ---
  duration_ms: 1.1191
  ...
# Subtest: matches WF-04 full-month anniversary billing
ok 3 - matches WF-04 full-month anniversary billing
  ---
  duration_ms: 1.3468
  ...
# Subtest: uses nearest-thousand rounding with positive midpoint rounded up
ok 4 - uses nearest-thousand rounding with positive midpoint rounded up
  ---
  duration_ms: 0.603
  ...
# Subtest: handles final days of common and leap February inclusively
ok 5 - handles final days of common and leap February inclusively
  ---
  duration_ms: 1.0275
  ...
# Subtest: clamps a month-end anniversary to the shorter next month
ok 6 - clamps a month-end anniversary to the shorter next month
  ---
  duration_ms: 0.6153
  ...
# Subtest: keeps prorata at the end of year 9999 within its valid calendar month
ok 7 - keeps prorata at the end of year 9999 within its valid calendar month
  ---
  duration_ms: 0.8314
  ...
# Subtest: uses the agreed deposit amount as provided and omits its line when it is zero
ok 8 - uses the agreed deposit amount as provided and omits its line when it is zero
  ---
  duration_ms: 1.2969
  ...
# Subtest: rejects a positive rent that rounds to a zero invoice line
ok 9 - rejects a positive rent that rounds to a zero invoice line
  ---
  duration_ms: 1.7025
  ...
# Subtest: rejects invalid dates, money, and billing modes
ok 10 - rejects invalid dates, money, and billing modes
  ---
  duration_ms: 3.0051
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 369.4582
EXIT_CODE=0
```

<a id="evidence-m06-be-05"></a>

### Evidence M06-BE-05 - Generator invoice rutin idempotent (2026-11-02)

- Menambahkan kalkulasi periode rutin untuk `PRORATA_TO_MONTH_END` (tanggal 1 sampai akhir bulan) dan `FULL_MONTH_ANNIVERSARY` (tanggal mulai tiap bulan, diklem ke tanggal terakhir bila perlu). Invoice pertama tidak diduplikasi; Lease harus sudah mulai, berstatus `ACTIVE`/`SCHEDULED`, dan tanggal akhir inklusif tidak boleh sebelum tanggal jatuh tempo.
- Scheduler memproses tepat satu `localDate` Jakarta per pemanggilan. Owner-only Server Action dapat meminta rerun tanggal lampau, tetapi menolak tanggal masa depan. Tidak ada backfill otomatis untuk Lease yang sudah `ENDED` atau `CANCELLED`; tanggal terlewat bisa direrun Owner selama Lease masih eligible.
- Repository memvalidasi ulang Lease dan periode, lalu menulis Invoice `RECURRING`, satu line `RENT`, dan AuditEvent dalam satu statement PostgreSQL atomik. Unique key `(lease_id, period_start, period_end, kind)` bersama `ON CONFLICT DO NOTHING` melindungi retry/concurrency dan tidak menerbitkan ulang invoice `VOID`. Audit membedakan `SCHEDULER` (actor null) dari `OWNER_RERUN` (actor Owner) serta menyimpan hitungan aman.
- Test suite memakai repository memori sintetis untuk aturan periode, eligibility, batas tengah malam Jakarta, owner authorization, rerun/concurrency dan sumber audit. Verify ini tidak membuka koneksi PostgreSQL/Neon; SQL transaksional belum diuji pada database. Tidak menjalankan migrasi, Neon CLI/query, atau membaca `.env.local`.
- Task disetujui Owner pada 2026-11-02 oleh zeenn.

Verify `npm run test -- generate-invoices`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs generate-invoices

TAP version 13
# Subtest: creates calendar-mode recurring periods only on the first day of a later month
ok 1 - creates calendar-mode recurring periods only on the first day of a later month
  ---
  duration_ms: 12.7602
  ...
# Subtest: uses the start-day anniversary and clamps each short month from the original start day
ok 2 - uses the start-day anniversary and clamps each short month from the original start day
  ---
  duration_ms: 1.7589
  ...
# Subtest: does not create a recurring invoice on the initial lease date or outside lease eligibility
ok 3 - does not create a recurring invoice on the initial lease date or outside lease eligibility
  ---
  duration_ms: 1.3487
  ...
# Subtest: allows a scheduled Lease after its start date and keeps the end date inclusive
ok 4 - allows a scheduled Lease after its start date and keeps the end date inclusive
  ---
  duration_ms: 0.5507
  ...
# Subtest: derives local generation dates on the Asia/Jakarta midnight boundary
ok 5 - derives local generation dates on the Asia/Jakarta midnight boundary
  ---
  duration_ms: 47.6378
  ...
# Subtest: generates one invoice under concurrent retries and audits both sources
ok 6 - generates one invoice under concurrent retries and audits both sources
  ---
  duration_ms: 8.4134
  ...
# Subtest: rejects unauthorized reruns and a user actor on scheduler runs
ok 7 - rejects unauthorized reruns and a user actor on scheduler runs
  ---
  duration_ms: 2.3051
  ...
# Subtest: records an audited zero-invoice run when no Lease is eligible
ok 8 - records an audited zero-invoice run when no Lease is eligible
  ---
  duration_ms: 0.8556
  ...
# Subtest: rejects invalid billing dates and amounts from persisted Lease records
ok 9 - rejects invalid billing dates and amounts from persisted Lease records
  ---
  duration_ms: 2.3175
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 594.6844
EXIT_CODE=0
```

<a id="evidence-m06-be-06"></a>

### Evidence M06-BE-06 - Pembacaan, penyampaian, dan void invoice (2026-11-02)

- Menambahkan daftar invoice ber-keyset pagination (default 20, maksimum 100) dan detail invoice. Query repository memakai role dari AppUser aktif; Owner/Staff membaca data properti, sedangkan Tenant dibatasi ke Lease miliknya sebelum pagination. Detail Tenant lintas pemilik merespons 404 agar keberadaan invoice tidak dapat ditebak.
- Status tampilan dihitung dari total line dan alokasi payment `VERIFIED` yang belum direversal: `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, atau `VOID`. Alokasi `PENDING`, `REJECTED`, dan payment yang sudah direversal tidak menambah jumlah dibayar. Invoice `VOID` memiliki saldo tertagih nol.
- Owner/Staff dapat menandai invoice `SENT` secara manual. Operasi tidak mengirim pesan, tidak menerima timestamp dari client, serta mencatat AuditEvent satu kali; timestamp penyampaian berasal dari audit.
- Void hanya untuk Owner dengan alasan wajib. Operasi mengunci idempotency key dan row Invoice, lalu secara atomik mengecek payment `PENDING` dan `VERIFIED` aktif, mengubah invoice ke `VOID`, menulis AuditEvent, serta menyimpan respons idempotency. Retry key/payload sama mengembalikan respons; key dengan payload berbeda ditolak. Guard trigger DB tetap menjadi lapisan terakhir untuk menolak void saat klaim pending atau verified aktif masih ada.
- Verify menggunakan repository memori fixture sintetis; 6 test lulus. SQL repository belum dieksekusi pada database, tidak ada Neon/CLI/migrasi, dan `.env.local` tidak dibaca.

Verify `npm run test -- invoices`:

```text

> rumakost@0.1.0 test
> node scripts/run-tests.mjs invoices

TAP version 13
# Subtest: derives unpaid, partial, paid, overdue, and void status from active verified allocation totals
ok 1 - derives unpaid, partial, paid, overdue, and void status from active verified allocation totals
  ---
  duration_ms: 39.668
  ...
# Subtest: limits invoice reads to the Tenant's own Lease and returns a not-found result for another Tenant's invoice
ok 2 - limits invoice reads to the Tenant's own Lease and returns a not-found result for another Tenant's invoice
  ---
  duration_ms: 28.9218
  ...
# Subtest: invoice list pagination is bounded, stable, and emits a keyset cursor
ok 3 - invoice list pagination is bounded, stable, and emits a keyset cursor
  ---
  duration_ms: 4.1712
  ...
# Subtest: manual delivery permits Owner and Staff, is idempotent, and rejects a client-supplied timestamp
ok 4 - manual delivery permits Owner and Staff, is idempotent, and rejects a client-supplied timestamp
  ---
  duration_ms: 4.6787
  ...
# Subtest: void requires an Owner, a reason, rejected pending claims, and reversed verified payments
ok 5 - void requires an Owner, a reason, rejected pending claims, and reversed verified payments
  ---
  duration_ms: 8.4684
  ...
# Subtest: void succeeds after every pending payment is rejected and every verified payment is reversed, then safely replays
ok 6 - void succeeds after every pending payment is rejected and every verified payment is reversed, then safely replays
  ---
  duration_ms: 5.518
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 673.8744
```

- M06-BE-06 Verify lulus dan task menunggu review Owner; task belum ditandai selesai.
