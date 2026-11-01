# TODO.md — Rencana Implementasi M06 · Development Execution

> Status: TODO disetujui pemilik. M06-SETUP-00 sampai M06-SETUP-09 dan M06-DB-01 sampai M06-DB-18 disetujui.
> Baseline: Medium, satu properti, tujuh kelompok P0. Sumber otoritatif scope: `docs/pm/SCOPE_STATEMENT.md`; spesifikasi yang telah ditinjau: `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/design/SITEMAP.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`, dan `docs/specs/DESIGN_SPEC.md`.

## Navigasi

- [Protokol task](#protokol-task)
- [Keputusan pemilik dan batas implementasi](#keputusan-pemilik-dan-batas-implementasi)
- [Persiapan, autentikasi, dan database](#persiapan-auth-dan-database)
- [Model data](#model-data-satu-task-per-model)
- [Layanan domain](#layanan-domain-dan-operasi-server)
- [Desain sistem dan port layar](#desain-sistem-dan-port-layar-satu-task-per-komponen)
- [Integrasi dan handoff](#integrasi-verifikasi-dan-handoff)
- [Ringkasan cakupan](#ringkasan-cakupan-untuk-validasi)
- [Evidence terbaru: Setup 09](#evidence-m06-setup-09-manajemen-akun-2026-11-01)
- [Evidence terbaru: DB 02](#evidence-m06-db-02-profil-penghuni-2026-11-01)
- [Evidence terbaru: DB 03](#evidence-m06-db-03-kamar-2026-11-01)
- [Evidence terbaru: DB 04](#evidence-m06-db-04-lease-2026-11-01)
- [Evidence terbaru: DB 05](#evidence-m06-db-05-permintaan-check-out-2026-11-01)
- [Evidence terbaru: DB 06](#evidence-m06-db-06-invoice-2026-11-01)
- [Evidence terbaru: DB 07](#evidence-m06-db-07-invoice-line-2026-11-01)
- [Evidence terbaru: DB 08](#evidence-m06-db-08-payment-2026-11-01)
- [Evidence terbaru: DB 09](#evidence-m06-db-09-payment-allocation-2026-11-01)
- [Evidence terbaru: DB 10](#evidence-m06-db-10-deposit-ledger-entry-2026-11-01)
- [Evidence terbaru: DB 11](#evidence-m06-db-11-payment-reversal-2026-11-01)
- [Evidence terbaru: DB 12](#evidence-m06-db-12-expense-2026-11-01)
- [Evidence terbaru: DB 13](#evidence-m06-db-13-ticket-2026-11-01)
- [Evidence terbaru: DB 14](#evidence-m06-db-14-ticketcomment-2026-11-01)
- [Evidence terbaru: DB 15](#evidence-m06-db-15-ticketattachment-2026-11-01)
- [Evidence terbaru: DB 16](#evidence-m06-db-16-auditevent-2026-11-01)
- [Evidence terbaru: DB 16](#evidence-m06-db-16-auditevent-2026-11-01)

## Protokol task

Selesaikan satu task per giliran. Untuk setiap task, agent mengerjakan hanya task itu, menjalankan perintah `Verify`, melaporkan output mentah dan file yang berubah, lalu berhenti. Pemilik meninjau perubahan dan memberi persetujuan sebelum task ditandai `[x]` atau task berikutnya dimulai. Agent tidak menandai persetujuan atas nama pemilik.

Urutan kolom task: **Status · ID task · Tujuan · File · Prasyarat · Tindakan · Di luar cakupan · Verifikasi / ekspektasi · Sumber**.

## Keputusan pemilik dan batas implementasi

Keputusan Owner, 2026-11-01: akun tidak mendaftar sendiri. Owner mendaftarkan Staff; Owner atau Staff mendaftarkan Penghuni. Akun Owner awal disediakan melalui bootstrap terpisah. Pemulihan sandi melalui email masuk scope dan harus memakai alur token dari Neon Auth; tidak boleh membuat reset sandi sendiri tanpa verifikasi provider. Keputusan ini membatalkan catatan exclusion lama untuk SCR-01A/SCR-01B. Catatan keputusan dari Owner: “untuk owner staff dan penghuni itu tidak daftar sendiri tapi didaftarkan owner ini didaftarkan dan bisa reset email, staff ini didaftarkan oleh owner, penghuni bisa didaftarkan owner dan staff”.

Keputusan akses tambahan Owner, 2026-11-01: Staff dapat mengakses direktori akun hanya untuk melihat/membuat/mengaktifkan/nonaktifkan akun Penghuni; akun Staff hanya dapat dikelola Owner. Akses akun ini tidak memberi Staff akses ke pengaturan Owner lainnya. M04 mencatat `/pengaturan/akun` Owner-only; keputusan terbaru ini menggantinya hanya untuk layar dan operasi terbatas akun Penghuni. Neon Auth admin API juga mensyaratkan identitas provider Owner diberi role `admin` secara terpisah dari role aplikasi `OWNER`; langkah bootstrap dicatat di `RUNBOOK_LOCAL.md`.

Pengecualian M02/FSD tetap berlaku untuk SCR-09M (meteran), SCR-17 (profil properti/rekening), SCR-19 (pengumuman), SCR-P07 (buku panduan), SCR-P08 (izin tamu), dan SYS-01 (notifikasi in-app). Pada layar campuran, hilangkan hanya field/aksi di luar scope (misalnya plat kendaraan, data rekening, utilitas, teknisi, ekspor, dan WhatsApp otomatis). Task SCR-01A/SCR-01B kini menunggu implementasi alur reset email provider pada tasknya; task ini hanya mencatat keputusan dan tidak membuat route reset.

## Urutan pengerjaan dan task register

### Persiapan, auth, dan database

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [x] | M06-SETUP-00 | Kunci inventory route aktif sesuai frozen scope | `TODO.md` | Persetujuan TODO oleh pemilik | Catat pengecualian layar yang disetujui pemilik di crosswalk ini dan tandai sebagai deferred tanpa route produk. Dokumen desain beku tetap menjadi sumber historis; perubahan kapabilitas memerlukan change request. | Implementasi fitur P1/P2 | Persetujuan pemilik tercatat; setiap route aktif punya task FE dan tiap pengecualian scope ditandai deferred tanpa route produk. | Scope M02; sitemap M04. Evidence: "approve"; Approved: 2026-10-31 by zeenn |
| [x] | M06-SETUP-01 | Scaffold Next.js 16.4.3 sesuai perintah FSD | `package.json`, `src/`, konfigurasi scaffold | M06-SETUP-00 | Jalankan perintah terkunci di FSD ke `.\rumakost`; salin file app/config yang diperlukan ke root tanpa menimpa `docs/`, `DESIGN.md`, aset `public/`, atau `.gitignore`; buang scaffold sementara setelah verifikasi. Jangan install dependency sebelum pemeriksaan registry/peer/deprecation. | Fitur domain dan deployment produksi | PowerShell `Test-Path package.json, tsconfig.json, next.config.*`; file scaffold tersedia; versi/lockfile diverifikasi setelah dependency install pada M06-SETUP-04/M06-GATE-01. | FSD §2.3, §8; Evidence: "Creating a new Next.js app in D:\Workspace\RumaKost\rumakost."; "Success! Created rumakost at D:\Workspace\RumaKost\rumakost"; Verify output: `OK package.json`, `OK tsconfig.json`, `OK next.config.ts`; prior file checks: `OK eslint.config.mjs`, `OK src\app\layout.tsx`, `OK src\app\page.tsx`, `OK AGENTS.md`, `OK next-env.d.ts`, `OK README.md`, `OK docs\pm\PROJECT_STATE.md`, `OK docs\specs\FSD.md`, `OK docs\design\SITEMAP.md`, `OK public\file.svg`, `OK public\window.svg`, `OK DESIGN.md`, `OK TODO.md`; `npm install` exit 0: `removed 53 packages, changed 21 packages, and audited 347 packages in 49s`; `16 moderate severity vulnerabilities`; `npm run dev`: `▲ Next.js 16.4.3 (webpack)`, `✓ Ready in 1490ms`, `http://localhost:3000`; process dihentikan dengan Ctrl+C setelah startup terkonfirmasi. Warning: `@next/swc-win32-x64-msvc ... is not a valid Win32 application`, running with WASM bindings. The dev script uses Webpack to avoid Turbopack's native-binding blocker. Approved: 2026-10-31 by zeenn |
| [x] | M06-SETUP-02 | Pasang harness root Medium+ | `AGENTS.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONVENTIONS.md`, `TODO.md`, `.env.example`, `RUNBOOK_LOCAL.md`, `VERIFY_LOCAL.md`, `.gitignore` | M06-SETUP-01 | Setelah scaffold, deploy sembilan file harness ke root dari staging. Gunakan template resmi (`04-dev-execution/` dan `02-design/DESIGN_MD_TEMPLATE.md` bila perlu), selaraskan dengan FSD, verifikasi seluruh file sebelum menghapus staging. | Mengisi secret lokal atau implementasi domain | PowerShell `Test-Path` untuk sembilan file; semua bernilai `True`; `.env.example` tidak diabaikan Git. | Skill M06 §STEP 2; templates `04-dev-execution/`; Evidence: `True AGENTS.md`, `True CONTEXT.md`, `True ARCHITECTURE.md`, `True DESIGN.md`, `True CONVENTIONS.md`, `True TODO.md`, `True .env.example`, `True RUNBOOK_LOCAL.md`, `True VERIFY_LOCAL.md`; `.env.example is not ignored`; `staging=False`. Root `DESIGN.md` dipakai sebagai versi terbaru karena staging lama. Setelah review awal, `.env.example` diberi petunjuk sumber tiap variabel dan `RUNBOOK_LOCAL.md` ditambah langkah mendapatkannya. Pemilik memilih Neon Auth managed pada 2026-10-31; M06-SETUP-05 menyelaraskan kontrak Auth ke NEON_AUTH_BASE_URL tanpa secret aplikasi. Kredensial Object Storage dipetakan dari nama provider AWS_* ke nama NEON_STORAGE_* yang dipakai aplikasi. Pemilik menyatakan `ok sudah, selanjutnya` pada 2026-10-31; Approved: 2026-10-31 by zeenn |
| [~] | M06-SETUP-03 | Pre-read semua spesifikasi sebelum coding | `TODO.md` (catatan task) | M06-SETUP-02 | Catat versi stack, handoff Level 2, model status, idempotensi, matriks role, daftar layar, model data, dan sumber acceptance criteria di catatan task ini. | Perubahan requirement dan implementasi | `rg`/review dokumen; checklist pre-read lengkap tanpa keputusan domain baru. | FSD, PRD, SITEMAP, DESIGN_SPEC, COMPONENT_REQUIREMENTS. Evidence: pre-read `docs/pm/SCOPE_STATEMENT.md`, `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/design/SITEMAP.md`, `docs/specs/DESIGN_SPEC.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONVENTIONS.md`, `docs/architecture/M05-TECHNICAL-SPEC-DRAFT.md`, dan `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`. Stack terkunci: Next.js 16.4.3 App Router, TypeScript, CSS prototipe, PostgreSQL/Prisma di Neon, Neon Auth/Object Storage, Vercel Hobby; `package.json` saat ini memasang React/React DOM 19.3.0, sementara technical spec mencatat React 19.3.1 dan FSD meminta TypeScript 5.9.3/Node 24.x; RUNBOOK_LOCAL masih menyebut Node 22 LTS. Prisma/SDK versions masih perlu diverifikasi di M06-SETUP-04. Handoff Level 2: port prototipe M04 dengan layout/copy/token/responsiveness/state/interaksi yang disetujui; ganti simulator role/data lokal dengan sesi dan otorisasi server; jangan bawa perilaku di luar scope. Model status: Lease `SCHEDULED/ACTIVE/ENDED/CANCELLED`; Invoice tersimpan `ISSUED/VOID`, tampilan `UNPAID/PARTIAL/PAID/OVERDUE` diturunkan; Payment `PENDING/VERIFIED/REJECTED` dengan reversal terpisah; Ticket memakai lima tahap M04; media `PENDING_UPLOAD/AVAILABLE/DELETE_PENDING/DELETED/FAILED`. Idempotensi: invoice unik lease/periode/jenis-mode; mutasi sensitif memakai idempotency key, transaksi/constraint/locking; verifikasi pembayaran, alokasi, ledger, dan audit atomik; media retry/cleanup aman diulang. Matriks role: OWNER/STAFF/TENANT; hanya Owner verifikasi/reversal/laporan/akun dan rekonsiliasi deposit; Staff operasi yang diizinkan dan mencatat payment pending; Tenant hanya resource milik sendiri, pascakontrak read-only. Layar: ikuti inventory/task M06-FE-21–55; layar deferred tanpa route produksi: SCR-01A/B, SCR-09M, SCR-17, SCR-19, SCR-P07/P08, SYS-01; pada layar campuran buang field/aksi di luar scope. Model data: AppUser, TenantProfile, Room, Lease, LeaseEndRequest, Invoice, InvoiceLine, Payment, PaymentAllocation, DepositLedgerEntry, PaymentReversal, Expense, Ticket, TicketComment, TicketAttachment, AuditEvent. Acceptance bersumber dari frozen Scope Statement → PRD REQ-01–07 dan enam E2E/wireflows yang belum dieksekusi; detail aturan/invarian FSD dan DATA/API spec; layar dari SITEMAP setelah crosswalk TODO; komponen dari COMPONENT_REQUIREMENTS dan DESIGN_SPEC. Verify output: `scope=True`, `prd=True`, `fsd=True`, `sitemap=True`, `design_spec=True`, `component_requirements=True`, `technical_spec=True`, `data_api_spec=True`, `handoff=True`, `typed_environment=True`, `role_matrix=True`, `models=True`, `idempotency=True`, `screen_tasks=True`, `stack_versions=True`. |
| [x] | M06-SETUP-04 | Verifikasi dependencies dan pin tooling | `package.json`, `package-lock.json`, `eslint.config.mjs` | M06-SETUP-01 | Periksa peer dependencies, status deprecated, dan versi resmi sebelum install; pin versi Prisma/Neon SDK dan semua dependency yang dipilih. Gunakan plugin Next langsung dengan ESLint 10. | Dependency berbayar atau integrasi baru | Peer dependency tidak konflik, dependency terpilih tidak deprecated, install bersih. | FSD §2.3, §8; M05 technical spec. Evidence: Registry command: `npm view <package@version> version deprecated --json` untuk semua dependency direct terpilih. Raw output versi (kolom `deprecated` tidak dikembalikan registry): AWS `3.1161.0, 3.1161.0`; Neon serverless `1.2.0`; Prisma adapter/client/CLI `7.10.1, 7.10.1, 7.10.1`; Next/React/React DOM `16.4.3, 19.3.1, 19.3.1`; ESLint/@eslint/js/Next plugin `10.14.0, 10.0.1, 16.4.3`; typescript-eslint/TypeScript `8.72.1, 5.9.3`. Sebelumnya `eslint@9.39.5` dilaporkan deprecated/EOL; ESLint 10 dipilih. Metadata peer `eslint-config-next` transitive membatasi plugin ke ESLint <=9; Next lokal `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md` menyarankan plugin Next langsung bila konflik plugin. Auth SDK beta ditunda ke M06-SETUP-06 setelah percobaan install menunjukkan peer conflict pada dependensi transitif/deprecated. `npm install --package-lock-only --ignore-scripts --no-audit --no-fund --strict-peer-deps`: `npm warn EBADENGINE ... required node 24.x, current v22.13.1 ...`; `up to date in 11s`; exit 0. `npm ci --strict-peer-deps --no-audit --no-fund`: warning EBADENGINE yang sama; `added 297 packages in 3m`; exit 0, tidak ada ERESOLVE/peer/deprecation warning. `npm ls --depth=0` exit 0 raw: `rumakost@0.1.0 D:\Workspace\RumaKost`; `@aws-sdk/client-s3@3.1161.0`; `@aws-sdk/s3-request-presigner@3.1161.0`; `@emnapi/runtime@1.11.3 extraneous`; `@eslint/js@10.0.1`; `@img/sharp-wasm32@0.35.5 extraneous`; `@neondatabase/serverless@1.2.0`; `@next/eslint-plugin-next@16.4.3`; `@prisma/adapter-neon@7.10.1`; `@prisma/client@7.10.1`; `@types/node@24.19.2`; `@types/react-dom@19.3.0`; `@types/react@19.3.0`; `eslint@10.14.0`; `next@16.4.3`; `prisma@7.10.1`; `react-dom@19.3.1`; `react@19.3.1`; `typescript-eslint@8.72.1`; `typescript@5.9.3`. Dua paket extraneous adalah optional sharp/WASM lintas platform. `eslint --print-config src/app/page.tsx`: `eslint_config=valid`, exit 0. Lockfile/package version check: `all_selected_versions=exact`; `auth_sdk_deferred=true`; `eslint_config_next_removed=true`; exit 0. `package.json` mempertahankan Node target `24.x` dan script `typecheck`; runtime lokal masih Node 22.13.1 (perlu diselaraskan sebelum gate selanjutnya). File yang diubah: `package.json`, `package-lock.json`, `eslint.config.mjs`. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-05 | Siapkan typed environment dan koneksi database lokal | .env.example, src/lib/env.ts, prisma/schema.prisma, prisma.config.ts, package.json, package-lock.json, docs/specs/FSD.md, RUNBOOK_LOCAL.md | M06-SETUP-04 | Validasi env server-side dengan Zod; pisahkan URL runtime pooled dan migrasi direct; secret nyata hanya ditulis pemilik ke .env.local. Neon Auth managed memakai Auth URL tanpa secret aplikasi. | Membaca/menyalin secret ke repo atau chat | npm run typecheck; invalid/missing variable ditolak dengan pesan aman, tanpa membocorkan nilai. | FSD §5.2, §6; keputusan Owner: Neon Auth managed. Registry npm view zod@4.6.7 version peerDependencies deprecated --json mengembalikan "4.6.7"; @next/env@16.4.3 mengembalikan "16.4.3"; server-only@0.0.1 mengembalikan "0.0.1"; metadata peer/deprecated tidak ada. npm install --package-lock-only --ignore-scripts --no-audit --no-fund --strict-peer-deps: npm warn EBADENGINE ... required node 24.x, current v22.13.1 ...; up to date in 4s; exit 0. npm install --strict-peer-deps --no-audit --no-fund: warning EBADENGINE yang sama; added 2 packages in 22s; exit 0. Verify npm run typecheck raw output: > rumakost@0.1.0 typecheck; > tsc --noEmit; exit 0. src/lib/env.ts memakai Zod, server-only, validasi PostgreSQL/HTTPS/origin lokal dan panjang CRON secret; error hanya menyebut nama variabel, tidak nilainya. prisma.config.ts memakai @next/env untuk memuat .env.local dan DIRECT_URL untuk migrasi; schema memakai Prisma Client generator v7. .env.example dan FSD menghapus NEON_AUTH_SECRET; RUNBOOK menjelaskan pemetaan output storage Neon AWS ke variabel aplikasi. Node lokal 22.13.1 tetap mengeluarkan EBADENGINE; jalankan dengan Node 24.x sesuai FSD. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-06 | Integrasi autentikasi dan sesi provider | `src/lib/auth/`, `src/app/(auth)/` | M06-SETUP-05 | Implementasikan login/logout dan sesi server memakai Neon Auth sesuai versi terpin; cookie HttpOnly/Secure/SameSite sesuai environment; tanpa token di localStorage. | Pendaftaran publik, OTP/2FA | `npm run test -- auth`; sesi valid terbaca server-side dan kredensial invalid ditolak tanpa data terlindungi. | REQ-01.1, REQ-01.3; FSD §3, §5. Evidence 2026-10-31: Neon Auth SDK 0.6.0-beta serta override sejalur 1.7.6 tetap gagal strict peer resolution. Mengikuti customer workaround pada Neon issue #212, dipin `@neondatabase/auth@0.5.0-beta` dengan `@neondatabase/auth-ui@0.3.0-beta` dan root overrides Better Auth 1.6.23, `@better-auth/utils@0.4.2`, `@better-fetch/fetch@1.3.1`, `better-call@1.3.7`. `npm install --save-exact @neondatabase/auth@0.5.0-beta --strict-peer-deps --no-audit --no-fund`: exit 0, `added 196 packages in 2m`; output juga memuat `EBADENGINE` (lokal Node 22.13.1, syarat 24.x) dan warning deprecated untuk paket transitive `@react-email/*`. `npm ci --strict-peer-deps --no-audit --no-fund`: exit 0, `added 495 packages in 3m`, dengan warning yang sama. `npm ls @neondatabase/auth @neondatabase/auth-ui better-auth @better-auth/core @better-auth/api-key @better-auth/passkey @better-auth/telemetry @better-auth/utils @better-fetch/fetch better-call --all`: exit 0; pohon memperlihatkan Auth 0.5.0-beta/UI 0.3.0-beta, seluruh Better Auth/passkey/core/api-key/telemetry 1.6.23, dan tidak ada `invalid` peer. Verify task auth masih gagal karena script belum dibuat: `$ npm run test -- auth`; `npm error Missing script: "test"`; `EXIT_CODE=1`. Dependency blocker sudah teratasi. Implementasi: Neon Auth `createNeonAuth` server instance dengan cookie SDK HttpOnly, Secure, SameSite=Lax; server actions validasi email/password dan memanggil provider untuk login/logout; GET auth proxy hanya meneruskan `get-session`, tanpa POST/signup/reset/OTP/2FA; `/login` membaca sesi di Server Component dan mengikuti prototipe responsif tanpa kredensial demo/localStorage. Role picker hanya memilih tujuan navigasi; bukan otorisasi. `npm run test -- auth` raw output: `> rumakost@0.1.0 test`; `> node scripts/run-tests.mjs auth`; `TAP version 13`; `ok 1 - allows only the read-only session endpoint through the auth proxy`; `ok 2 - rejects malformed credentials before contacting Neon Auth`; `ok 3 - a valid server session exposes its user and an absent session exposes none`; `# tests 3`; `# pass 3`; `# fail 0`; exit 0. Contrast checker: CTA `#AD4F00` on white `5.39:1 PASS`; muted text `#71717A` on white `4.83:1 PASS`; error `#B42318` on `#FEF3F2` `6.05:1 PASS`. Unit tests use synthetic session only; live managed-provider acceptance (valid session and wrong-password rejection) remains unverified pending a synthetic provider account. NEON_AUTH_COOKIE_SECRET dibuat dengan RandomNumberGenerator dan ditambahkan ke `.env.local`; output hanya menyatakan penambahan, nilai tidak dibaca/ditampilkan. Startup awal menemukan `node_modules/next/dist/compiled/@edge-runtime/primitives/load.js` berbeda hash dan gagal `node --check`; file dipulihkan dari tarball registry Next 16.4.3; hash lokal=tarball dan `node --check` exit 0. `npm run dev` raw startup: `▲ Next.js 16.4.3 (webpack)`; `✓ Ready in 7.0s`. Probe pertama `/login` 500 karena `force-dynamic` tidak kompatibel dengan `cacheComponents`; diubah menjadi `Suspense` untuk request-time sesi sesuai panduan lokal Next. Probe kedua `/login`: `HTTP_STATUS=200`, `CONTENT_TYPE=text/html; charset=utf-8`, `HAS_LOGIN_TITLE=True`. Validasi environment dipisah per kapabilitas agar halaman Auth tidak memerlukan variabel Storage sebelum integrasi Storage dipakai. Verify ulang `npm run test -- auth`: `# tests 3`, `# pass 3`, `# fail 0`, exit 0. Live wrong-password rejection/provider session belum diuji dengan akun uji sintetis. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-07 | Aktivasi sandi perdana dan perubahan sandi mandiri | `src/app/aktivasi-sandi/`, `src/app/profil/`, `src/app/portal/profil/` | M06-SETUP-06 | Terapkan forced password change untuk akun yang ditandai dan perubahan sandi akun sendiri; role dan status akun dibaca ulang di server; jangan sertakan field profil di luar scope. | Reset email (ditangani task SCR-01A/B); profil kendaraan | `npm run test -- auth-password`; akun `mustChangePassword` tertahan di aktivasi sampai berhasil; role lain hanya dapat mengubah sandi sendiri. | SCR-01C, SCR-18, SCR-P06; REQ-01. Evidence verify (2026-11-01): exit 0; `# tests 4`, `# pass 4`, `# fail 0`. Raw output tercatat di evidence M06-SETUP-07 di bawah. Approved: 2026-11-01 by zeenn |
| [x] | M06-SETUP-08 | Route guard dan otorisasi server Owner/Staff/Tenant | `src/proxy.ts`, `src/lib/auth/`, `src/lib/authorization/` | M06-SETUP-06 | Gunakan auth.middleware di Proxy untuk sesi awal; tegakkan role, status, forced-change, dan ownership di server page/action/data-access. | Permission Staff granular dan multi-property | `npm run test -- authorization`; matriks allow/deny FSD lulus pada server boundary. Evidence: Verify exit 0; 7 passed, 0 failed. | REQ-01.2; FSD §4; SITEMAP §4. Approved: 2026-11-01 by zeenn |
| [x] | M06-SETUP-09 | Pembuatan dan aktivasi akun oleh Owner/Staff | `src/actions/users.ts`, `src/app/pengaturan/akun/` | M06-SETUP-08, M06-DB-01 | Owner membuat/menonaktifkan akun Staff dan Penghuni; Owner/Staff membuat/menonaktifkan Penghuni; atur sandi awal/undangan melalui provider tanpa public signup. Owner awal disiapkan terpisah. | Manajemen role di luar tiga role MVP | `npm run test -- users`; Owner dapat mengelola Staff/Penghuni, Staff hanya Penghuni, Penghuni tidak dapat membuat akun, dan pendaftaran publik tidak tersedia. | REQ-01.1; SCR-16; keputusan Owner 2026-11-01. Approved: 2026-11-01 by zeenn |

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

### Model data: satu task per model

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [x] | M06-DB-01 | Model `AppUser` | `prisma/schema.prisma`, migration | M06-SETUP-05 | Definisikan subject auth unik, email ternormalisasi, tiga role, aktivasi, forced-change, dan FK creator. | Password/session disimpan aplikasi | `npm run db:migrate`; constraint user/role terbentuk dan migration dapat di-rollback. Evidence disposable DB: migration dan inverse SQL rollback berhasil; database uji dihapus. Approved: 2026-11-01 by zeenn | ERD AppUser; REQ-01 |
| [x] | M06-DB-02 | Model `TenantProfile` | `prisma/schema.prisma`, migration | M06-DB-01 | Simpan profil minimum yang disetujui dan relasi one-to-one ke user. | Kendaraan, dokumen identitas, rekening | `npm run db:migrate`; FK/unique profile terbentuk. | ERD TenantProfile; REQ-03. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-03 | Model `Room` | `prisma/schema.prisma`, migration | M06-DB-01 | Definisikan kode unik, lantai, sewa, deposit default, status fisik, dan indeks FK. | Fasilitas/kategori dinamis jika tidak diperlukan F-02 | `npm run db:migrate`; kode duplikat ditolak dan nilai uang Decimal. | ERD Room; REQ-02.1. Keputusan Owner 2026-11-01: status fisik tersimpan mencakup `READY`, `CLEANING`, `MAINTENANCE`. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-04 | Model `Lease` | `prisma/schema.prisma`, migration | M06-DB-02, M06-DB-03 | Definisikan satu Tenant/satu kamar, tanggal, rent/deposit Decimal, billing mode, status, dan batas overlap. | Roommate/multi-room/mutasi kamar | `npm run db:migrate`; constraint dan indeks rentang lease tersedia. | ERD Lease; REQ-02.2, REQ-03.1/03.2. Keputusan Owner 2026-11-01: `endsOn` inklusif, penyewa masih menempati kamar sampai tanggal itu. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-05 | Model `LeaseEndRequest` | `prisma/schema.prisma`, migration | M06-DB-04 | Simpan permintaan check-out Tenant dan keputusan Owner beserta waktu/reviewer. | Persetujuan check-out oleh Staff | `npm run db:migrate`; FK dan status request terbentuk. | ERD LeaseEndRequest; REQ-03.3. Keputusan Owner 2026-11-01: status `PENDING`, `APPROVED`, atau `REJECTED`. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-06 | Model `Invoice` | `prisma/schema.prisma`, migration | M06-DB-04 | Definisikan periode, due date, kind, delivery status, void, dan unique key lease/periode/kind. | WhatsApp otomatis, carry-over tunggakan | `npm run db:migrate`; duplicate invoice key ditolak. | ERD Invoice; REQ-04.1–04.3. Keputusan Owner 2026-11-01: kunci unik memakai `kind`; billing mode tetap milik Lease. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-07 | Model `InvoiceLine` | `prisma/schema.prisma`, migration | M06-DB-06 | Simpan line RENT/DEPOSIT terpisah dengan nilai Decimal positif. | Utilitas/biaya insidental | `npm run db:migrate`; jenis line dan constraint nominal berlaku. | ERD InvoiceLine; REQ-04, REQ-05.4. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-08 | Model `Payment` | `prisma/schema.prisma`, migration | M06-DB-06 | Simpan klaim, status, pencatat, verifier, waktu, metode, dan nominal Decimal. | Bukti transfer dan integrasi bank | `npm run db:migrate`; status/nominal constraint berlaku. | ERD Payment; REQ-05.1. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-09 | Model `PaymentAllocation` | `prisma/schema.prisma`, migration | M06-DB-07, M06-DB-08 | Simpan alokasi payment ke invoice line dengan nominal Decimal. | Saldo berjalan duplikat | `npm run db:migrate`; semua FK dan indeks terbentuk. | ERD PaymentAllocation; REQ-05.2/05.4. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-10 | Model `DepositLedgerEntry` | `prisma/schema.prisma`, migration | M06-DB-04, M06-DB-07, M06-DB-09 | Buat ledger append-only dengan jenis entry, alasan, refund status manual, dan relasi alokasi unik. | Transfer refund otomatis | `npm run db:migrate`; saldo escrow dapat diturunkan dari ledger tanpa kolom saldo. | ERD DepositLedgerEntry; REQ-03.3, REQ-05.4. Owner menetapkan status refund `PENDING`, `PAID`, `REJECTED` pada entry `REFUNDED` (2026-11-01). Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-11 | Model `PaymentReversal` | `prisma/schema.prisma`, migration | M06-DB-08 | Simpan maksimal satu reversal penuh per payment terverifikasi beserta alasan dan Owner. | Penghapusan/penimpaan payment asal | `npm run db:migrate`; unique payment reversal berlaku. | ERD PaymentReversal; REQ-05.3. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-12 | Model `Expense` | `prisma/schema.prisma`, migration | M06-DB-01 | Simpan kategori, nominal Decimal positif, tanggal, deskripsi, pencatat. | Lampiran struk dan relasi tiket | `npm run db:migrate`; indeks tanggal/pencatat terbentuk. | ERD Expense; REQ-06.1. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-13 | Model `Ticket` | `prisma/schema.prisma`, migration | M06-DB-03, M06-DB-04 | Simpan pembuat, kamar, assignee internal, prioritas/status, dan waktu tutup/buka kembali. | Akun Teknisi eksternal | `npm run db:migrate`; FK dan enum status valid. | ERD Ticket; REQ-07.1/07.2. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-14 | Model `TicketComment` | `prisma/schema.prisma`, migration | M06-DB-13 | Simpan komentar dengan visibility tenant-visible/internal dan author. | Komentar internal dari Tenant | `npm run db:migrate`; relasi comment-ticket berlaku. | ERD TicketComment; REQ-07.2/07.3. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-15 | Model `TicketAttachment` | `prisma/schema.prisma`, migration | M06-DB-13, M06-DB-14 | Simpan metadata objek privat, status upload, ukuran, durasi dan jadwal hapus. | Public bucket/CDN | `npm run db:migrate`; object key unik dan metadata constraints terbentuk. | ERD TicketAttachment; REQ-07.1/07.3. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-16 | Model `AuditEvent` | `prisma/schema.prisma`, migration | M06-DB-01 | Buat event append-only untuk mutasi sensitif dan metadata aman. | Secret, token, signed URL, konten unggahan | `npm run db:migrate`; role aplikasi tidak dapat update/delete event. | ERD AuditEvent; SEC-08. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-17 | Seeder sintetis idempotent | `prisma/seed.ts` | M06-DB-01–16 | Seed deterministik untuk Owner/Staff/Tenant, kamar, lease, invoice, payment, expense, dan tiket demo; gunakan upsert/static IDs. | Data nyata dan kredensial contoh dari prototipe | Jalankan `npm run db:seed` dua kali; jumlah record sama dan tanpa duplikasi. | FSD §7; PRD §7. Approved: 2026-11-01 by zeenn |
| [x] | M06-DB-18 | Verifikasi indeks, constraint, dan rollback migrasi | `prisma/migrations/` | M06-DB-01–16 | Pastikan FK terindeks, nominal/date checks lengkap, migration reversible, dan uniqueness mencakup domain invariants. | Mengubah keputusan domain | `npm run db:migrate` lalu rollback/restore lokal; schema bersih dan semua invariant terdokumentasi. | FSD §2.2; ERD/API spec §8. Approved: 2026-11-01 by zeenn |

#### Evidence M06-DB-01 — AppUser (2026-10-31)

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


### Layanan domain dan operasi server

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [ ] | M06-BE-01 | Validasi input dan error domain bersama | `src/lib/validation/`, `src/lib/errors/` | M06-SETUP-04 | Terapkan schema ketat dan pemetaan error tanpa detail SQL/provider. | Validasi client sebagai kontrol keamanan | `npm run test -- validation`; payload invalid menghasilkan error stabil dan tidak memuat detail internal. | FSD §3; DATA/API §5 |
| [ ] | M06-BE-02 | Operasi kamar | `src/actions/rooms.ts`, `src/lib/rooms/` | M06-DB-03, M06-SETUP-08 | `createRoom`/`updateRoom` dengan izin Owner dan update status Staff sesuai matriks. | Penghapusan histori kamar | `npm run test -- rooms`; duplicate code/in-use conflict ditolak. | REQ-02; `createRoom`, `updateRoom` |
| [ ] | M06-BE-03 | Profil Tenant dan siklus kontrak/check-out | `src/actions/leases.ts`, `src/lib/leases/` | M06-DB-04/05 | Buat Lease + invoice awal atomik; cek overlap; request check-out Tenant dan end/reconcile oleh Owner. | Banyak Tenant/kamar, auto-refund | `npm run test -- leases`; overlap ditolak, role dan tanggal diverifikasi. | REQ-03; `createLease`, `requestLeaseEnd`, `endLease` |
| [ ] | M06-BE-04 | Mesin invoice awal dan prorata | `src/lib/billing/initial-invoice.ts` | M06-DB-06/07 | Implementasi dua mode billing, prorata inklusif, pembulatan ribuan, line deposit terpisah. | Denda/utilitas | `npm run test -- initial-invoice`; boundary tanggal dan contoh WF-05 cocok. | REQ-04; DATA/API §2 |
| [ ] | M06-BE-05 | Scheduler invoice idempotent | `src/actions/invoices.ts`, `src/lib/billing/generate-invoices.ts` | M06-BE-04, M06-DB-06 | Implementasikan generator harian Asia/Jakarta, key lease/periode/kind, audit sumber/rerun. | Cron lebih sering dari harian | `npm run test -- generate-invoices`; dua kali proses memberi satu invoice dan mencatat duplikat. | REQ-04.3; `runInvoiceGeneration` |
| [ ] | M06-BE-06 | Penyampaian dan pembacaan invoice | `src/actions/invoices.ts` | M06-DB-06/07, M06-SETUP-08 | Daftar/detail invoice dan penandaan penyampaian manual dengan ownership check. | Pengiriman WhatsApp/email | `npm run test -- invoices`; role dan kepemilikan sesuai matrix. | REQ-04; `markInvoiceDelivered` |
| [ ] | M06-BE-07 | Pencatatan klaim pembayaran | `src/actions/payments.ts` | M06-DB-08, M06-SETUP-08 | Buat payment PENDING oleh role yang diizinkan; cek kepemilikan Tenant, saldo, amount dan idempotency. | Bank sync, overpayment, bukti transfer | `npm run test -- payments-record`; klaim pending tidak mengubah saldo; overpayment ditolak. | REQ-05.1/05.2; `recordPayment` |
| [ ] | M06-BE-08 | Verifikasi, alokasi, reversal pembayaran | `src/actions/payments.ts`, `src/lib/payments/` | M06-DB-09–11 | Transaksi atomik Owner-only: sewa lebih dahulu lalu deposit, audit event, saldo turunan, reversal penuh dengan alasan. | Verifikasi oleh Staff atau self-approval Staff | `npm run test -- payment-ledger`; retry tidak menggandakan saldo, saldo/escrow invariant tetap benar. | REQ-05.2–05.4; verify/reject/reverse |
| [ ] | M06-BE-09 | Settlement dan rekonsiliasi deposit | `src/actions/deposits.ts`, `src/lib/deposits/` | M06-DB-10 | Settlement ke invoice rent dan rekonsiliasi checkout/refund manual dengan saldo dan alasan. | Transfer uang, detail rekening, refund surplus umum | `npm run test -- deposits`; saldo negatif/settlement melebihi saldo ditolak. | REQ-03.3/05.4; DATA/API §5 |
| [ ] | M06-BE-10 | Expense dan laporan Owner-only | `src/actions/expenses.ts`, `src/actions/reports.ts` | M06-DB-12, M06-SETUP-08 | Catat expense; agregasikan pemasukan/pengeluaran/okupansi hanya untuk Owner. | Laporan akuntansi/pajak/ekspor | `npm run test -- reports`; Staff/Tenant ditolak dan payload tidak mengandung angka laporan. | REQ-06; `recordExpense`, `getFinancialReport` |
| [ ] | M06-BE-11 | Ticket, assignment, status, dan komentar | `src/actions/tickets.ts`, `src/lib/tickets/` | M06-DB-13/14, M06-SETUP-08 | Terapkan ownership Tenant aktif, transisi status, komentar visibility, role assignment dan audit. | Akun teknisi, rating, biaya servis | `npm run test -- tickets`; Tenant tidak dapat membuka tiket lain/menulis komentar internal. | REQ-07.1–07.3; ticket operations |
| [ ] | M06-BE-12 | Upload/download media privat dan retensi | `src/app/api/uploads/`, `src/lib/storage/` | M06-DB-15, M06-BE-11 | Upload intent dan finalisasi; validasi signature/MIME/ukuran/durasi/agregat; signed URL setelah authorization; orphan cleanup dan retensi 365 hari. | CDN/public objects | `npm run test -- ticket-media`; akses lintas role ditolak, limit ditegakkan, cleanup aman diulang. | REQ-07; SEC-04–07; DATA/API §5–6 |
| [ ] | M06-BE-13 | Audit event untuk mutasi sensitif | `src/lib/audit/` | M06-DB-16 | Tulis audit dalam transaksi untuk aksi auth-role, lease, invoice, payment, reversal, deposit, dan media. | Logging PII/token | `npm run test -- audit`; mutasi tercatat sekali dan metadata tidak berisi secret/PII terlarang. | SEC-08; ERD AuditEvent |
| [ ] | M06-BE-14 | Pagination, keamanan query, dan batas resource | `src/lib/data/` | M06-DB-01–16 | Batasi list default 20/maksimum 100, query terindeks, hindari N+1, dan isolasi ownership di query. | Cache atau layanan eksternal | `npm run test -- data-boundaries`; limit tak dapat dilewati dan query Tenant terikat resource sendiri. | FSD §3, §6; SEC-04 |

### Desain sistem dan port layar: satu task per komponen

Task UI memakai compatibility Level 2: port dari prototipe M04 ke React, jaga hierarchy, copy yang disetujui, token, responsivitas, state, serta interaksi. Jangan menyalin fitur di luar scope atau simulator role sebagai kontrol otorisasi.

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [ ] | M06-FE-01 | Token dan fondasi gaya bersama | `src/app/globals.css`, `src/components/` | M06-SETUP-03 | Port token/theme CSS M04 dan aturan responsive, focus, reduced motion. | Desain baru di luar prototype | `npm run build`; token terpakai dan tidak ada hydration warning pada render awal. | DESIGN.md; shared CSS; Level 2 |
| [ ] | M06-FE-02 | Button primitive | `src/components/ui/button.tsx` | M06-FE-01 | Port state default/hover/active/focus/disabled/loading. | Tombol aksi tanpa handler | `npm run test -- button`; semua state dan keyboard behavior sesuai spec. | CMP-01 |
| [ ] | M06-FE-03 | Input dan form controls | `src/components/ui/input.tsx` | M06-FE-01 | Port label, hint, error, disabled, focus dan invalid states. | Field untuk atribut out-of-scope | `npm run test -- input`; label/error association teruji. | CMP-02 |
| [ ] | M06-FE-04 | Status badge dan pill | `src/components/ui/badge.tsx` | M06-FE-01 | Port status dengan teks dan warna token. | Status domain baru | `npm run test -- badge`; semua status terbaca tanpa mengandalkan warna saja. | CMP-03 |
| [ ] | M06-FE-05 | Custom popover dropdown | `src/components/ui/popover-select.tsx` | M06-FE-01 | Port dropdown keyboard-accessible dan focus-managed. | Native select polos | `npm run test -- popover-select`; buka/pilih/tutup dengan keyboard. | CMP-04 |
| [ ] | M06-FE-06 | Modal dan dialog | `src/components/ui/dialog.tsx` | M06-FE-01 | Port modal, focus trap, escape, backdrop dan reduced-motion behavior. | `window.alert/confirm/prompt` | `npm run test -- dialog`; keyboard/focus lifecycle lulus. | CMP-05 |
| [ ] | M06-FE-07 | Gauge okupansi | `src/components/ui/occupancy-gauge.tsx` | M06-FE-01 | Port radial gauge dengan nilai aksesibel. | Metrik tambahan | `npm run test -- occupancy-gauge`; rentang nol/penuh tampil benar. | CMP-06 |
| [ ] | M06-FE-08 | Segmented progress | `src/components/ui/segmented-progress.tsx` | M06-FE-01 | Port indikator segmen lima tahap. | Progress bar generik pengganti desain | `npm run test -- segmented-progress`; tahap/status diumumkan aksesibel. | CMP-07 |
| [ ] | M06-FE-09 | Topbar dan navigasi role | `src/components/layout/topbar.tsx` | M06-FE-02–05 | Port layout desktop/mobile sesuai role; menu hanya refleksi izin server. | Simulator role sebagai otorisasi | `npm run test -- topbar`; tiap role mendapat navigasi yang sesuai. | CMP-08; SITEMAP §1 |
| [ ] | M06-FE-10 | Metric summary card | `src/components/dashboard/metric-card.tsx` | M06-FE-02–04 | Port kartu metrik dashboard dari prototype. | Data finance untuk Staff | `npm run test -- metric-card`; value/label/state tampil benar. | CMP-09 |
| [ ] | M06-FE-11 | Property highlight card | `src/components/dashboard/property-card.tsx` | M06-FE-02–04 | Port kartu properti satu kost dari prototype. | Pengaturan multi-property | `npm run test -- property-card`; fixture/data properti mengikuti scope satu properti. | CMP-10 |
| [ ] | M06-FE-12 | Double bar chart | `src/components/dashboard/cashflow-chart.tsx` | M06-FE-01 | Port chart arus kas dengan label aksesibel. | Analitik lintas tahun di luar acceptance | `npm run test -- cashflow-chart`; empty/error state tersedia. | CMP-11 |
| [ ] | M06-FE-13 | Maintenance condition panel | `src/components/tickets/condition-panel.tsx` | M06-FE-02–04 | Port panel status/tiket yang dipakai P0. | Preventive maintenance | `npm run test -- condition-panel`; status sesuai domain Ticket. | CMP-12 |
| [ ] | M06-FE-14 | Activity/message feed | `src/components/activity/activity-feed.tsx` | M06-FE-02–04 | Port feed aktivitas untuk audit dan tiket sesuai izin. | Notifikasi in-app P1 | `npm run test -- activity-feed`; data dibatasi role. | CMP-13 |
| [ ] | M06-FE-15 | Room card | `src/components/rooms/room-card.tsx` | M06-FE-02–04 | Port kartu kamar dan status fisik/okupansi terpisah. | Fasilitas dinamis di luar scope | `npm run test -- room-card`; okupansi tidak disamakan dengan status fisik. | CMP-14 |
| [ ] | M06-FE-16 | Data table | `src/components/ui/data-table.tsx` | M06-FE-02–05 | Port tabel, filter dan pagination bounded. | Ekspor CSV P1 | `npm run test -- data-table`; empty/loading/error states ada, page size maksimal 100. | CMP-15 |
| [ ] | M06-FE-17 | Private media upload zone | `src/components/tickets/media-upload.tsx` | M06-FE-02–05 | Port upload wajib dengan batas dan feedback status. | Upload public atau media selain foto/video yang diizinkan | `npm run test -- media-upload`; batas per file dan total ditampilkan/diterapkan. | CMP-16 |
| [ ] | M06-FE-18 | Tenant rent summary banner | `src/components/portal/rent-summary.tsx` | M06-FE-02–04 | Port banner sewa/tagihan tenant. | Meteran, utilitas, kuitansi | `npm run test -- rent-summary`; hanya ringkasan invoice sendiri. | CMP-17 |
| [ ] | M06-FE-19 | Ticket timeline/comment thread | `src/components/tickets/ticket-thread.tsx` | M06-FE-02–06 | Port lima status dan komentar dengan visibility server-bound. | Akun teknisi atau chat pihak luar | `npm run test -- ticket-thread`; komentar internal tidak dirender ke Tenant. | CMP-18 |
| [ ] | M06-FE-20 | Role switcher prototype replacement | `src/components/layout/role-context.tsx` | M06-SETUP-08, M06-FE-09 | Ganti role switcher demo dengan role/session server; tidak menerima role dari query string. | Mengubah privilege dari client | `npm run test -- role-context`; role tidak dapat dipalsukan dari browser state. | CMP-19; FSD §7 |

#### Pemetaan layar 1:1 dari sitemap

Satu ID layar = satu task FE. Rute detail menggunakan parameter dinamis; setiap `Verify` harus probe route spesifik dan mengharapkan HTTP 200/307, bukan 404. Baris yang sudah dinyatakan di luar scope tetap tercatat satu per satu agar pemilik dapat mengesahkan pengecualian tersebut.

| Status | Task ID | Layar / rute | Files | Depends | Action dan batas | Verify / Expected | Source trace |
|---|---|---|---|---|---|---|---|
| [ ] | M06-FE-21 | SCR-01 `/login` | `src/app/login/page.tsx` | M06-SETUP-06, M06-FE-02–06 | Port login multi-role; role picker tidak memberi hak akses. | Route probe `/login` 200; login valid/invalid state sesuai prototype. | SCR-01; REQ-01 |
| [ ] | M06-FE-22 | SCR-01A `/lupa-sandi` | `src/app/lupa-sandi/page.tsx` | M06-SETUP-06 | Implementasikan permintaan reset email melalui alur resmi Neon Auth; respons tidak membocorkan apakah email terdaftar dan tidak menyediakan public signup. | Reset sandi tanpa token/provider; pendaftaran publik. | Owner-approved route probe 200; email tidak dapat dienumerasi; request token provider valid. | SCR-01A; keputusan Owner 2026-11-01 |
| [ ] | M06-FE-23 | SCR-01B `/reset-sandi` | `src/app/reset-sandi/page.tsx` | M06-FE-22 | Implementasikan penyelesaian reset memakai token resmi Neon Auth dan sandi baru yang divalidasi. | Token buatan aplikasi atau token invalid yang mengubah akun. | Owner-approved route probe; token invalid/kedaluwarsa ditolak tanpa perubahan akun. | SCR-01B; keputusan Owner 2026-11-01 |
| [ ] | M06-FE-24 | SCR-01C `/aktivasi-sandi` | `src/app/aktivasi-sandi/page.tsx` | M06-SETUP-07 | Paksa akun baru ganti sandi sebelum akses aplikasi. | Route probe 200; akun forced-change tidak dapat membuka route terlindungi lain. | SCR-01C; REQ-01 |
| [ ] | M06-FE-25 | SCR-02 `/dashboard` | `src/app/dashboard/page.tsx` | M06-FE-09–15, M06-BE-10 | Port dashboard sesuai data dan role; financial detail Owner-only. | Route probe 200/307 untuk Owner dan Staff; Staff response tanpa laporan finansial. | SCR-02; REQ-02/06 |
| [ ] | M06-FE-26 | SCR-03 `/kamar` | `src/app/kamar/page.tsx` | M06-FE-09, M06-FE-15/16, M06-BE-02 | Port daftar kamar, filter dan status. | Route probe 200/307; fixture data kamar sesuai F-02. | SCR-03; REQ-02 |
| [ ] | M06-FE-27 | SCR-04 `/kamar/:id` | `src/app/kamar/[id]/page.tsx` | M06-FE-26, M06-BE-02 | Port detail kamar dan histori yang berada dalam scope. | Route probe valid ID 200, missing ID 404 UI, akses Tenant terbatas ke kamar sendiri. | SCR-04; REQ-02 |
| [ ] | M06-FE-28 | SCR-05 `/penghuni` | `src/app/penghuni/page.tsx` | M06-FE-09, M06-FE-16, M06-BE-03 | Port direktori penghuni; hapus kendaraan/field non-P0. | Route probe 200/307; data dan filter sewa sesuai scope. | SCR-05; REQ-03 |
| [ ] | M06-FE-29 | SCR-06 `/penghuni/:id` | `src/app/penghuni/[id]/page.tsx` | M06-FE-28, M06-BE-03 | Port profil minimum dan histori lease/tiket yang diizinkan. | Route probe; role/ownership denial diuji di server. | SCR-06; REQ-03 |
| [ ] | M06-FE-30 | SCR-07 `/kontrak` | `src/app/kontrak/page.tsx` | M06-BE-03 | Port daftar lease dan status. | Route probe 200/307; data mengikuti status lease. | SCR-07; REQ-03 |
| [ ] | M06-FE-31 | SCR-08 `/kontrak/:id` | `src/app/kontrak/[id]/page.tsx` | M06-FE-30, M06-BE-03/09 | Port detail/check-in/check-out dan rekonsiliasi Owner. | Route probe; Staff tidak dapat mengubah syarat aktif atau melakukan rekonsiliasi Owner. | SCR-08; REQ-03 |
| [ ] | M06-FE-32 | SCR-09 `/tagihan` | `src/app/tagihan/page.tsx` | M06-BE-05/06 | Port daftar invoice dan status turunan. | Route probe 200/307; status berasal dari invoice/payment data. | SCR-09; REQ-04/05 |
| [ ] | M06-FE-33 | SCR-09M `/tagihan/meteran` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan; tangani mismatch sitemap sebagai scope exclusion, bukan placeholder route. | Konfirmasi tertulis exclusion; route dihapus dari active sitemap/implementation inventory melalui approval. | SCR-09M; M02 out of scope |
| [ ] | M06-FE-34 | SCR-10 `/tagihan/:id` | `src/app/tagihan/[id]/page.tsx` | M06-FE-32, M06-BE-06/07 | Port detail invoice dan pembayaran parsial; hapus WhatsApp/bukti transfer. | Route probe; ownership/role dan saldo tampil benar. | SCR-10; REQ-04/05 |
| [ ] | M06-FE-35 | SCR-11 `/pembayaran` | `src/app/pembayaran/page.tsx` | M06-BE-07/08 | Port klaim pending dan verifikasi Owner. | Route probe; Staff tidak dapat verifikasi. | SCR-11; REQ-05 |
| [ ] | M06-FE-36 | SCR-12 `/pengeluaran` | `src/app/pengeluaran/page.tsx` | M06-BE-10 | Port pencatatan expense tanpa receipt atau relasi tiket. | Route probe; nominal/date validation sesuai F-06. | SCR-12; REQ-06.1 |
| [ ] | M06-FE-37 | SCR-13 `/laporan` | `src/app/laporan/page.tsx` | M06-BE-10, M06-SETUP-08 | Port laporan pemasukan/pengeluaran/okupansi Owner-only. | Route probe Owner 200; Staff/Tenant ditolak tanpa payload laporan. | SCR-13; REQ-06.2 |
| [ ] | M06-FE-38 | SCR-14 `/tiket` | `src/app/tiket/page.tsx` | M06-BE-11/12 | Port triase Owner/Staff tanpa akun teknisi eksternal. | Route probe 200/307; list dibatasi role dan pagination. | SCR-14; REQ-07 |
| [ ] | M06-FE-39 | SCR-15 `/tiket/:id` | `src/app/tiket/[id]/page.tsx` | M06-FE-38, M06-BE-11/12 | Port detail, status, komentar, attachment privat. | Route probe; Tenant tidak mendapat internal comments/attachment. | SCR-15; REQ-07.2/07.3 |
| [ ] | M06-FE-40 | SCR-16 `/pengaturan/akun` | `src/app/pengaturan/akun/page.tsx` | M06-SETUP-09 | Port manajemen akun Owner dan Staff; Staff hanya melihat/mengelola Penghuni, Owner mengelola Staff/Penghuni. | Staff mengelola Staff atau pengaturan Owner lain; Tenant route | Route probe Owner/Staff 200 dengan daftar sesuai role; Tenant ditolak tanpa payload akun. | SCR-16; REQ-01.1; keputusan Owner 2026-11-01 |
| [ ] | M06-FE-41 | SCR-17 `/pengaturan/profil` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan profil properti editable/rekening untuk MVP. | Konfirmasi exclusion dan hapus dari active route inventory melalui approval. | SCR-17; M02 out of scope |
| [ ] | M06-FE-42 | SCR-18 `/profil` | `src/app/profil/page.tsx` | M06-SETUP-07 | Port profil akun minimum dan perubahan sandi Owner/Staff. | Properti, rekening, kendaraan | Route probe 200/307; user hanya mengubah profil sendiri. | SCR-18; REQ-01 |
| [ ] | M06-FE-43 | SCR-19 `/pengumuman` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan announcement/broadcast pada MVP. | Konfirmasi exclusion dan hapus dari active route inventory melalui approval. | SCR-19; M02 excludes; F-08+ |
| [ ] | M06-FE-44 | SCR-20 `/aktivitas` | `src/app/aktivitas/page.tsx` | M06-BE-13 | Port audit trail Owner-only dengan metadata aman. | Log rahasia/PII terlarang | Route probe Owner 200; role lain ditolak. | SCR-20; SEC-08 |
| [ ] | M06-FE-45 | SCR-P01 `/portal` | `src/app/portal/page.tsx` | M06-FE-09/18, M06-BE-03/06 | Port beranda Tenant, termasuk histori read-only pascakontrak. | Pengumuman, izin tamu, fasilitas dinamis | Route probe 200/307; hanya data lease Tenant sendiri. | SCR-P01; REQ-01/03 |
| [ ] | M06-FE-46 | SCR-P02 `/portal/tagihan` | `src/app/portal/tagihan/page.tsx` | M06-FE-45, M06-BE-07 | Port invoice dan klaim pembayaran manual milik Tenant. | Meteran, kuitansi transfer, rekening | Route probe; ownership check; klaim pascakontrak ditolak. | SCR-P02; REQ-04/05 |
| [ ] | M06-FE-47 | SCR-P03 `/portal/tiket` | `src/app/portal/tiket/page.tsx` | M06-BE-11 | Port daftar tiket milik Tenant. | Tiket tenant lain | Route probe; response hanya tiket milik session user. | SCR-P03; REQ-07 |
| [ ] | M06-FE-48 | SCR-P04 `/portal/tiket/baru` | `src/app/portal/tiket/baru/page.tsx` | M06-FE-17, M06-BE-11/12 | Port pembuatan tiket dan lampiran wajib saat lease aktif. | Upload pascakontrak atau lampiran publik | Route probe; submit tanpa media ditolak server. | SCR-P04; REQ-07.1 |
| [ ] | M06-FE-49 | SCR-P05 `/portal/tiket/:id` | `src/app/portal/tiket/[id]/page.tsx` | M06-FE-47, M06-FE-19, M06-BE-11/12 | Port tracker dan diskusi tiket milik Tenant; read-only setelah lease selesai. | Estimasi teknisi eksternal | Route probe; ID tenant lain ditolak dan internal comment tidak bocor. | SCR-P05; REQ-07.2/07.3 |
| [ ] | M06-FE-50 | SCR-P06 `/portal/profil` | `src/app/portal/profil/page.tsx` | M06-SETUP-07 | Port penggantian sandi dan profil minimum Tenant. | Plat kendaraan/field tambahan | Route probe; kepemilikan terikat session Tenant. | SCR-P06; REQ-01 |
| [ ] | M06-FE-51 | SCR-P07 `/portal/panduan` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan buku panduan/data WiFi/aturan pada MVP. | Konfirmasi exclusion dan hapus dari active route inventory melalui approval. | SCR-P07; M02 out of scope |
| [ ] | M06-FE-52 | SCR-P08 `/portal/izin-tamu` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan izin tamu pada MVP. | Konfirmasi exclusion dan hapus dari active route inventory melalui approval. | SCR-P08; M02 out of scope |
| [ ] | M06-FE-53 | SYS-01 `/notifikasi` | Deferred; no production route unless scope changes | M06-SETUP-00 | Jangan implementasikan inbox notifikasi P1. | Konfirmasi exclusion dan hapus dari active route inventory melalui approval. | SYS-01; F-08 P1 |
| [ ] | M06-FE-54 | SYS-02 `/403` | `src/app/403/page.tsx` | M06-SETUP-08 | Port akses ditolak dengan navigasi aman sesuai role. | Membocorkan keberadaan resource | Route probe 200; tidak menampilkan payload resource. | SYS-02; FSD §4 |
| [ ] | M06-FE-55 | SYS-03 `/404` | `src/app/not-found.tsx` | M06-FE-01 | Port halaman not-found dan navigasi kembali. | Dead link atau tombol tanpa handler | Route probe unknown path menghasilkan UI 404; tombol navigasi aktif. | SYS-03; M06 quality gate |

### Integrasi, verifikasi, dan handoff

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [ ] | M06-INT-01 | Integrasi Neon PostgreSQL dan pooling | `src/lib/db.ts`, `prisma/` | M06-DB-18 | Konfigurasikan pooled runtime URL dan direct migration URL dengan batas koneksi aman. | Provider berbayar atau multi-database | `npm run db:migrate`; koneksi runtime/migration terpisah dan secret tidak tercetak. | FSD §2.1, §6 |
| [ ] | M06-INT-02 | Integrasi private Neon Object Storage | `src/lib/storage/`, upload route | M06-BE-12 | Konfigurasikan bucket privat, signed upload/download, batas kuota internal dan cleanup. | CDN/public bucket | Integration test lokal/provider sandbox; akses tanpa signed authorization gagal. | FSD §5.3, §6; REQ-07 |
| [ ] | M06-INT-03 | Cron harian Vercel untuk invoice | `src/app/api/cron/invoices/route.ts`, konfigurasi deployment | M06-BE-05 | Hubungkan pemanggil terautentikasi untuk scheduler Asia/Jakarta sekali sehari. | Deploy produksi tanpa persetujuan manusia | Test route dengan secret lokal; unauthenticated ditolak dan rerun idempotent. | FSD §6; REQ-04.3 |
| [ ] | M06-TEST-01 | Unit test kalkulasi billing, saldo, okupansi, dan retensi | `tests/unit/` | M06-BE-04/05/08/09/10/12 | Uji boundary kalender, prorata, anniversary, alokasi, reversal, escrow, okupansi dan retention date. | Mengklaim E2E telah lulus | `npm run test`; semua unit test lulus dan kasus sumber ditautkan ke REQ. | PRD §3.2; FSD §9 |
| [ ] | M06-TEST-02 | Integration test transaction dan authorization | `tests/integration/` | M06-BE-01–14 | Uji overlap lease, idempotency invoice/payment, locking, audit atomicity, ownership/RBAC, media privacy. | Data produksi | `npm run test:integration`; seluruh invariant dan negative access cases lulus. | FSD §5.4; DATA/API §6 |
| [ ] | M06-TEST-03 | E2E enam walkthrough P0 | `tests/e2e/` | Semua P0 screen/service tasks | Implementasikan acceptance flows enam walkthrough; data sintetis saja; hasil dicatat sebagai runtime evidence baru. | E2E fitur backlog | `npm run test:e2e`; enam alur lulus untuk role terkait; tidak ada 404 atau console error blocker. | `docs/design/SCENARIOS_E2E_WALKTHROUGH.md`; PRD §3.2 |
| [ ] | M06-TEST-04 | Audit screen states dan responsive behavior | `tests/e2e/`, `docs/specs/DESIGN_SPEC.md` | Semua screen P0 | Verifikasi idle/loading/success/error/empty, mobile/desktop, keyboard/focus, dan prototype parity. | Klaim persetujuan design baru | `npm run test:e2e`; matrix 5-state dan viewport P0 terlapor. | DESIGN_SPEC §63ff; COMPONENT_REQUIREMENTS |
| [ ] | M06-GATE-01 | Framework version gate | `package.json`, `package-lock.json` | M06-SETUP-04 | Jalankan verifier framework; cocokkan framework major/minor dan manifest dengan FSD. | Mengubah pin tanpa keputusan tercatat | `scripts/verify/verify-framework-version.ps1`; exit 0. | M06 §STEP 3 |
| [ ] | M06-GATE-02 | Security, lint, typecheck, build dan smoke lokal | `VERIFY_LOCAL.md`, aplikasi | Semua task implementasi dan test | Jalankan perintah yang benar-benar tercatat di harness; review migration/security dan smoke semua route aktif. | Deploy/merge/tag | Semua command exit 0; smoke semua route aktif dan negative authorization lulus. | M06 §STEP 7; FSD §5 |
| [ ] | M06-GATE-03 | AI pre-merge review log | `AI_REVIEW_LOG.md` | M06-GATE-02 | Review diff terhadap task/REQ; catat findings, disposition, dan risiko yang diterima pemilik. | Self-approval atau mengubah scope | Log berisi seluruh finding dan referensi task; tidak ada blocker terbuka. | M06 §pre-merge AI review |
| [ ] | M06-GATE-04 | Runbook, verify guide, dan progress tracker | `RUNBOOK_LOCAL.md`, `VERIFY_LOCAL.md`, `DEVELOPMENT_PROGRESS_TRACKER.md` | M06-GATE-02 | Lengkapi setup lokal, migrasi/seed, verifikasi, recovery, dan status pengerjaan dengan output aktual. | Secret, klaim hasil yang belum dijalankan | Instruksi dapat diikuti dari clone bersih; command dan output aktual terdokumentasi. | M06 §2 output artifacts |
| [ ] | M06-GATE-05 | Gate M06 dan handoff ke M07 · Quality Assurance & System Integration Testing | `TODO.md`, seluruh artefak M06 | Semua task lain disetujui pemilik | Jalankan gate M06; pastikan setiap `[x]` punya Evidence mentah dan `Approved: YYYY-MM-DD by <name>`. Pemilik melakukan merge/tag sesuai otoritasnya. | Agent commit, merge, tag, deploy, atau menandai dirinya approver | Cari dan jalankan gate M06 resmi `.ps1`/`.sh` bila tersedia; jika script belum dipaketkan di workspace, catat blocker dan minta jalur script sebelum menyatakan gate lulus. Output harus disertakan verbatim. | M06 gate; AUTHORITY.md |

## Ringkasan cakupan untuk validasi

- 10 task persiapan/auth, 18 task/model database, 14 domain service, 20 task design system, dan 35 entri screen 1:1 (SCR-01 sampai SCR-P08 serta SYS-01–03), 3 integrasi, 4 test groups, 5 gate/handoff tasks.
- Screen di luar P0 sengaja ditandai deferred; persetujuan pemilik diperlukan untuk menghapusnya dari daftar route aktif. Tidak ada fitur P1/P2 yang dimasukkan sebagai implementasi MVP.
- TODO ini mencatat rencana sekaligus evidence per task. Jalankan hanya Verify task aktif; persetujuan pemilik tetap diperlukan sebelum status task diubah menjadi `[x]`.

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

### Keputusan M06-DB-03 — status fisik kamar

Owner memutuskan pada 2026-11-01 bahwa `CLEANING` disimpan sebagai status fisik bersama `READY` dan `MAINTENANCE`. “Terisi/Kosong” tetap diturunkan dari lease aktif dan bukan nilai status fisik.

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

### Keputusan M06-DB-04 — batas tanggal Lease

Owner memutuskan pada 2026-11-01 bahwa `endsOn` inklusif: penghuni masih menempati kamar pada tanggal akhir kontrak. Lease lain pada kamar yang sama baru dapat dimulai setelah `endsOn`.

### Keputusan M06-DB-05 — hasil review check-out

Owner memutuskan pada 2026-11-01 bahwa request dimulai pada status `PENDING`; hasil review Owner dapat berupa `APPROVED` atau `REJECTED`.

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

### Keputusan M06-DB-06 — kunci unik Invoice

Owner menyetujui pada 2026-11-01 kunci unik `(lease, periodStart, periodEnd, kind)` mengikuti SQL FSD. Billing mode tetap pada Lease. TODO dan catatan generator M05 telah diselaraskan ke `kind`.

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
