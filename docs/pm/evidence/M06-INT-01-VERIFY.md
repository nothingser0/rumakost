# Verify M06-INT-01 — Integrasi Neon PostgreSQL dan pooling (2026-11-04)

## Target dan batas verifikasi

- Target proyek Neon `floral-wind-91503829`, branch `dev`, database `neondb`.
- Branch `dev` berstatus `ready`, sekaligus branch `primary` dan `default` pada proyek ini. Penerapan migration dilakukan ke branch itu sesuai keputusan Owner untuk development/demo.
- Pemeriksaan URL membaca `.env.local` secara lokal dan hanya mencetak hasil boolean; nilai connection string tidak ditampilkan.
- Runtime Prisma memakai URL pooled dengan `max: 1` dan timeout koneksi 5 detik. Prisma migration memakai `DIRECT_URL`.
- Tidak ada akun aplikasi saat pemeriksaan akhir: Owner 0, Staff 0, Tenant 0. Pembuatan akun demo adalah task terpisah.

## Disposable PostgreSQL

Migration chain dan auth provider sebelumnya diverifikasi pada branch disposable yang diturunkan dari `dev`. Output lengkap ada di [M06-AUTH-05-VERIFY.md](M06-AUTH-05-VERIFY.md): 41 migration, auth provider 3/3 lulus, branch disposable dihapus, dan `AUTH_PROVIDER_VERIFY=PASS`.

## Target URL dan status migration

Perintah preflight membandingkan URL dari `.env.local` dengan URL yang diberikan Neon CLI untuk branch `dev`. Nilai URL tidak dicetak.

```text
NEON_BRANCH=dev
NEON_BRANCH_READY=true
NEON_BRANCH_PRIMARY=true
NEON_BRANCH_DEFAULT=true
DATABASE_URL_MATCHES_NEON_DEV=true
DATABASE_USES_POOLER=true
DIRECT_URL_MATCHES_NEON_DEV=true
EXIT_CODE=0
```

Perintah: `npm run db:migrate`

```text
> rumakost@0.1.0 db:migrate
> prisma migrate deploy

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-broad-flower-b3eol1ql.c-4.ap-southeast-1.aws.neon.tech"

41 migrations found in prisma/migrations

No pending migrations to apply.
EXIT_CODE=0
```

## Runtime Prisma dan SQL probe

Perintah: `node --experimental-strip-types --experimental-loader ./tests/auth-provider/typescript-loader.mjs scripts/verify-neon-project.mjs`

```text
(node:10932) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("./tests/auth-provider/typescript-loader.mjs", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
(node:10932) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/src/generated/prisma/client.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to \\?\D:\Workspace\RumaKost\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
DATABASE_NAME=neondb
DATABASE_SCHEMA=public
MIGRATIONS_APPLIED=41/41
MIGRATIONS_INCOMPLETE=0
EXISTING_APP_USERS_OWNER=0
EXISTING_APP_USERS_STAFF=0
EXISTING_APP_USERS_TENANT=0
CATALOG_REQUIRED_TABLES=PASS
SQL_RELATION_PROBE=PASS
SQL_PROBE_ROLLED_BACK=true
NEON_PROJECT_VERIFY=PASS
EXIT_CODE=0
```

Probe membuat relasi Owner/Tenant sementara dalam transaksi, memeriksa constraint FK dan `TenantProfile`, lalu rollback. Tidak ada baris probe yang tertinggal.

## Catatan batas

- Branch proyek saat ini adalah `primary/default` meskipun namanya `dev`; periksa ini kembali sebelum memakainya untuk data di luar development/demo.
- Warning `ExperimentalWarning` dan `MODULE_TYPELESS_PACKAGE_JSON` berasal dari cara Node memuat verifier TypeScript dan tidak menggagalkan probe.
- Proyek meminta Node 24.x, sedangkan shell verifikasi lokal saat ini Node 26.13.0. Output migration dan probe tetap exit code 0.
- Akun demo belum dibuat pada task integrasi ini. Tidak ada email live atau signup publik yang digunakan.
