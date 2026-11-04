# Verify M06-INT-04 — Akun awal demo (2026-11-04)

## Cakupan

- Dibuat tepat satu akun demo untuk setiap role: Owner, Staff, dan Penghuni.
- Email demo sintetis: `owner.demo@rumakost.test`, `staff.demo@rumakost.test`, dan `tenant.demo@rumakost.test`.
- Email verifikasi tidak dikirim. Pengirim fake pada script menahan permintaan Better Auth dan bootstrap menandai hanya tiga akun demo ini terverifikasi.
- Password acak disimpan di `.env.local` pada variabel `RUMAKOST_DEMO_OWNER_PASSWORD`, `RUMAKOST_DEMO_STAFF_PASSWORD`, dan `RUMAKOST_DEMO_TENANT_PASSWORD`; nilainya tidak disalin ke Evidence.
- Email login disimpan pada variabel `RUMAKOST_DEMO_OWNER_EMAIL`, `RUMAKOST_DEMO_STAFF_EMAIL`, dan `RUMAKOST_DEMO_TENANT_EMAIL`.
- `.env.local` diabaikan Git. Tidak ada secret, password, cookie, atau session token pada output.
- Akun dibuat pada Neon `dev`, yang juga berstatus `primary/default` untuk project tersebut.

## Output pembuatan pertama

Perintah:

```powershell
npm run db:bootstrap-demo -- --project-id floral-wind-91503829 --branch dev
```

```text
(node:20416) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("./tests/auth-provider/typescript-loader.mjs", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
(node:20416) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/src/generated/prisma/client.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to \\?\D:\Workspace\RumaKost\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
DEMO_OWNER=READY email_verified=true app_user_active=true
DEMO_STAFF=READY email_verified=true app_user_active=true
DEMO_TENANT=READY email_verified=true app_user_active=true
DEMO_OWNER_LOGIN=PASS session_revoked=true
DEMO_STAFF_LOGIN=PASS session_revoked=true
DEMO_TENANT_LOGIN=PASS session_revoked=true
NEON_BRANCH=dev
NEON_BRANCH_PRIMARY=true
NEON_BRANCH_DEFAULT=true
DEMO_ROLE_COUNTS=OWNER:1,STAFF:1,TENANT:1
DEMO_CREDENTIALS_STORED=.env.local
LIVE_EMAILS_SENT=0
SIGNUP_VERIFICATION_EMAILS_SUPPRESSED=3
PUBLIC_SIGNUP=DISABLED
DEMO_BOOTSTRAP=PASS
EXIT_CODE=0
```

## Output Verify ulang dan idempotensi

Perintah yang sama dijalankan lagi. Hasil ini memastikan script memakai akun yang sama, tidak membuat duplikat, dan bisa melakukan login serta mencabut session uji.

```text
> rumakost@0.1.0 db:bootstrap-demo
> node --experimental-strip-types --experimental-loader ./tests/auth-provider/typescript-loader.mjs scripts/bootstrap-demo-accounts.mjs --project-id floral-wind-91503829 --branch dev

(node:14092) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("./tests/auth-provider/typescript-loader.mjs", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
ENV_LOCAL_GIT_IGNORED=true
(node:14092) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///D:/Workspace/RumaKost/src/generated/prisma/client.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to \\?\D:\Workspace\RumaKost\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
DEMO_OWNER=READY email_verified=true app_user_active=true
DEMO_STAFF=READY email_verified=true app_user_active=true
DEMO_TENANT=READY email_verified=true app_user_active=true
DEMO_OWNER_LOGIN=PASS session_revoked=true
DEMO_STAFF_LOGIN=PASS session_revoked=true
DEMO_TENANT_LOGIN=PASS session_revoked=true
NEON_BRANCH=dev
NEON_BRANCH_PRIMARY=true
NEON_BRANCH_DEFAULT=true
DEMO_ROLE_COUNTS=OWNER:1,STAFF:1,TENANT:1
DEMO_RELATIONSHIPS=PASS
EMAIL_VERIFICATION=PASS
DEMO_CREDENTIALS_STORED=.env.local
LIVE_EMAILS_SENT=0
SIGNUP_VERIFICATION_EMAILS_SUPPRESSED=0
PUBLIC_SIGNUP=DISABLED
DEMO_BOOTSTRAP=PASS
EXIT_CODE=0
```

## Alur akun normal tetap perlu verifikasi email

- `src/lib/auth/provider.mjs` tetap mengharuskan verifikasi email dan default-nya menonaktifkan signup publik.
- `src/lib/users/managed-accounts.ts` tetap membuat akun yang dikelola dengan `emailVerified: false`, lalu mengirim tautan aktivasi/reset. `src/lib/auth/server.ts` menandai email terverifikasi sesudah reset sandi berhasil.
- `src/lib/authorization/policy.mjs` mengizinkan Owner membuat Staff/Penghuni dan Staff membuat Penghuni. Keputusan Owner: hanya satu Owner.
- Pengirim email live belum dikonfigurasi; aktivasi akun yang dikelola baru dapat dipakai setelah integrasi email M07.
- Warning Node tentang loader eksperimental dan modul Prisma generated yang typeless tidak menggagalkan Verify. Shell lokal memakai Node 26 walau project menetapkan Node 24.x.
