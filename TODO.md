# TODO.md — Rencana Implementasi M06 · Development Execution

> Status: TODO disetujui pemilik. M06-SETUP-00 sampai M06-SETUP-09 dan M06-DB-01 sampai M06-DB-18 disetujui; M06-SETUP-10 menunggu review.
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
- [Evidence terbaru: Setup 10](#evidence-m06-setup-10-bootstrap-owner-2026-11-01)
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
- [Evidence terbaru: DB 30](#evidence-m06-db-30-integritas-finansial-wf-05-2026-11-01)
- [Evidence terbaru: DB 31](#evidence-m06-db-31-konsistensi-reversal-deposit-wf-04-dan-wf-05-2026-11-01)
- [Evidence terbaru: DB 32](#evidence-m06-db-32-kompensasi-ledger-deposit-saat-reversal-payment-2026-11-01)

## Protokol task

Selesaikan satu task per giliran. Untuk setiap task, agent mengerjakan hanya task itu, menjalankan perintah `Verify`, melaporkan output mentah dan file yang berubah, lalu berhenti. Pemilik meninjau perubahan dan memberi persetujuan sebelum task ditandai `[x]` atau task berikutnya dimulai. Agent tidak menandai persetujuan atas nama pemilik.

Urutan kolom task: **Status · ID task · Tujuan · File · Prasyarat · Tindakan · Di luar cakupan · Verifikasi / ekspektasi · Sumber**.

## Keputusan pemilik dan batas implementasi

Keputusan Owner, 2026-11-01: akun tidak mendaftar sendiri. Owner mendaftarkan Staff; Owner atau Staff mendaftarkan Penghuni. Akun Owner awal disediakan melalui bootstrap terpisah. Pemulihan sandi melalui email masuk scope dan harus memakai alur token dari Neon Auth; tidak boleh membuat reset sandi sendiri tanpa verifikasi provider. Keputusan ini membatalkan catatan exclusion lama untuk SCR-01A/SCR-01B. Catatan keputusan dari Owner: “untuk owner staff dan penghuni itu tidak daftar sendiri tapi didaftarkan owner ini didaftarkan dan bisa reset email, staff ini didaftarkan oleh owner, penghuni bisa didaftarkan owner dan staff”.
Keputusan Owner, 2026-11-01: tidak ada suspensi otomatis akun Penghuni berdasarkan tunggakan dalam MVP; penghuni tetap dapat mengakses portal, dan penanganan tunggakan dilakukan manual oleh Owner. Catatan ini menegaskan batas scope PRD/FSD; tidak menambah aturan suspensi atau ambang tunggakan.

Keputusan scope terdahulu bahwa gauge anggaran ditunda dibatalkan oleh CR-2026-001. Owner menyetujui pagu pengeluaran operasional bulanan untuk M06: nilainya diatur Owner per bulan, tanpa default fixture, perubahan diaudit, dan hanya angka realisasi Owner yang dibandingkan dengan pagu.

Keputusan Owner, 2026-11-01: `Room.roomType` adalah label opsional tanpa katalog dinamis. CR-2026-001 menambahkan dimensi opsional `widthMeters` dan `lengthMeters` dalam meter; keduanya harus kosong atau positif berpasangan. Luas diturunkan, tidak disimpan.
CR-2026-001 disetujui Owner melalui instruksi chat 2026-11-01: tambah dimensi kamar ke F-02 dan pagu pengeluaran per bulan ke F-06. Tujuh kelompok P0/satu properti tetap; klasifikasi Medium tidak berubah. Estimasi scope dan jadwal direvisi di `docs/pm/SCOPE_STATEMENT.md`.
Keputusan Owner, 2026-11-01: untuk evaluasi DB WF-02, tabel baseline kamar menjadi sumber tarif/tipe; kolektibilitas diturunkan dari nilai invoice RENT dan alokasi pembayaran terverifikasi pada periode yang sama; `B-05` memakai Standar AC/Rp1.500.000 sesuai baseline. Istilah finansial memakai arus kas tercatat, tanpa klaim laba/tren bila periode pembanding tidak tersedia.

Keputusan akses tambahan Owner, 2026-11-01: Staff dapat mengakses direktori akun hanya untuk melihat/membuat/mengaktifkan/nonaktifkan akun Penghuni; akun Staff hanya dapat dikelola Owner. Akses akun ini tidak memberi Staff akses ke pengaturan Owner lainnya. M04 mencatat `/pengaturan/akun` Owner-only; keputusan terbaru ini menggantinya hanya untuk layar dan operasi terbatas akun Penghuni. Neon Auth admin API juga mensyaratkan identitas provider Owner diberi role `admin` secara terpisah dari role aplikasi `OWNER`; langkah bootstrap dicatat di `RUNBOOK_LOCAL.md`.

Pengecualian M02/FSD tetap berlaku untuk SCR-09M (meteran), SCR-17 (profil properti/rekening), SCR-19 (pengumuman), SCR-P07 (buku panduan), SCR-P08 (izin tamu), dan SYS-01 (notifikasi in-app). Pada layar campuran, hilangkan hanya field/aksi di luar scope (misalnya plat kendaraan, data rekening, utilitas, teknisi, ekspor, dan WhatsApp otomatis). Task SCR-01A/SCR-01B kini menunggu implementasi alur reset email provider pada tasknya; task ini hanya mencatat keputusan dan tidak membuat route reset.

## Urutan pengerjaan dan task register

### Persiapan, auth, dan database

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [x] | M06-SETUP-00 | Kunci inventory route aktif sesuai frozen scope | `TODO.md` | Persetujuan TODO oleh pemilik | Catat pengecualian layar yang disetujui pemilik di crosswalk ini dan tandai sebagai deferred tanpa route produk. Dokumen desain beku tetap menjadi sumber historis; perubahan kapabilitas memerlukan change request. | Implementasi fitur P1/P2 | Persetujuan pemilik tercatat; setiap route aktif punya task FE dan tiap pengecualian scope ditandai deferred tanpa route produk. | Scope M02; sitemap M04. Evidence: "approve"; Approved: 2026-10-31 by zeenn |
| [x] | M06-SETUP-01 | Scaffold Next.js 16.4.3 sesuai perintah FSD | `package.json`, `src/`, konfigurasi scaffold | M06-SETUP-00 | Jalankan perintah terkunci di FSD ke `.\rumakost`; salin file app/config yang diperlukan ke root tanpa menimpa `docs/`, `DESIGN.md`, aset `public/`, atau `.gitignore`; buang scaffold sementara setelah verifikasi. Jangan install dependency sebelum pemeriksaan registry/peer/deprecation. | Fitur domain dan deployment produksi | PowerShell `Test-Path package.json, tsconfig.json, next.config.*`; file scaffold tersedia; versi/lockfile diverifikasi setelah dependency install pada M06-SETUP-04/M06-GATE-01. | FSD §2.3, §8; Evidence: "Creating a new Next.js app in D:\Workspace\RumaKost\rumakost."; "Success! Created rumakost at D:\Workspace\RumaKost\rumakost"; Verify output: `OK package.json`, `OK tsconfig.json`, `OK next.config.ts`; prior file checks: `OK eslint.config.mjs`, `OK src\app\layout.tsx`, `OK src\app\page.tsx`, `OK AGENTS.md`, `OK next-env.d.ts`, `OK README.md`, `OK docs\pm\PROJECT_STATE.md`, `OK docs\specs\FSD.md`, `OK docs\design\SITEMAP.md`, `OK public\file.svg`, `OK public\window.svg`, `OK DESIGN.md`, `OK TODO.md`; `npm install` exit 0: `removed 53 packages, changed 21 packages, and audited 347 packages in 49s`; `16 moderate severity vulnerabilities`; `npm run dev`: `▲ Next.js 16.4.3 (webpack)`, `✓ Ready in 1490ms`, `http://localhost:3000`; process dihentikan dengan Ctrl+C setelah startup terkonfirmasi. Warning: `@next/swc-win32-x64-msvc ... is not a valid Win32 application`, running with WASM bindings. The dev script uses Webpack to avoid Turbopack's native-binding blocker. Approved: 2026-10-31 by zeenn |
| [x] | M06-SETUP-02 | Pasang harness root Medium+ | `AGENTS.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONVENTIONS.md`, `TODO.md`, `.env.example`, `RUNBOOK_LOCAL.md`, `VERIFY_LOCAL.md`, `.gitignore` | M06-SETUP-01 | Setelah scaffold, deploy sembilan file harness ke root dari staging. Gunakan template resmi (`04-dev-execution/` dan `02-design/DESIGN_MD_TEMPLATE.md` bila perlu), selaraskan dengan FSD, verifikasi seluruh file sebelum menghapus staging. | Mengisi secret lokal atau implementasi domain | PowerShell `Test-Path` untuk sembilan file; semua bernilai `True`; `.env.example` tidak diabaikan Git. | Skill M06 §STEP 2; templates `04-dev-execution/`; Evidence: `True AGENTS.md`, `True CONTEXT.md`, `True ARCHITECTURE.md`, `True DESIGN.md`, `True CONVENTIONS.md`, `True TODO.md`, `True .env.example`, `True RUNBOOK_LOCAL.md`, `True VERIFY_LOCAL.md`; `.env.example is not ignored`; `staging=False`. Root `DESIGN.md` dipakai sebagai versi terbaru karena staging lama. Setelah review awal, `.env.example` diberi petunjuk sumber tiap variabel dan `RUNBOOK_LOCAL.md` ditambah langkah mendapatkannya. Pemilik memilih Neon Auth managed pada 2026-10-31; M06-SETUP-05 menyelaraskan kontrak Auth ke NEON_AUTH_BASE_URL tanpa secret aplikasi. Kredensial Object Storage dipetakan dari nama provider AWS_* ke nama NEON_STORAGE_* yang dipakai aplikasi. Pemilik menyatakan `ok sudah, selanjutnya` pada 2026-10-31; Approved: 2026-10-31 by zeenn |
| [~] | M06-SETUP-03 | Pre-read semua spesifikasi sebelum coding | `TODO.md` (catatan task) | M06-SETUP-02 | Catat versi stack, handoff Level 2, model status, idempotensi, matriks role, daftar layar, model data, dan sumber acceptance criteria di catatan task ini. | Perubahan requirement dan implementasi | `rg`/review dokumen; checklist pre-read lengkap tanpa keputusan domain baru. | FSD, PRD, SITEMAP, DESIGN_SPEC, COMPONENT_REQUIREMENTS. Evidence: pre-read `docs/pm/SCOPE_STATEMENT.md`, `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/design/SITEMAP.md`, `docs/specs/DESIGN_SPEC.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`, `CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONVENTIONS.md`, `docs/architecture/M05-TECHNICAL-SPEC-DRAFT.md`, dan `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`. Stack terkunci: Next.js 16.4.3 App Router, TypeScript, CSS prototipe, PostgreSQL/Prisma di Neon, Neon Auth/Object Storage, Vercel Hobby; `package.json` saat ini memasang React/React DOM 19.3.0, sementara technical spec mencatat React 19.3.1 dan FSD meminta TypeScript 5.9.3/Node 24.x; RUNBOOK_LOCAL masih menyebut Node 22 LTS. Prisma/SDK versions masih perlu diverifikasi di M06-SETUP-04. Handoff Level 2: port prototipe M04 dengan layout/copy/token/responsiveness/state/interaksi yang disetujui; ganti simulator role/data lokal dengan sesi dan otorisasi server; jangan bawa perilaku di luar scope. Model status: Lease `SCHEDULED/ACTIVE/ENDED/CANCELLED`; Invoice tersimpan `ISSUED/VOID`, tampilan `UNPAID/PARTIAL/PAID/OVERDUE` diturunkan; Payment `PENDING/VERIFIED/REJECTED` dengan reversal terpisah; Ticket memakai lima tahap M04; media `PENDING_UPLOAD/AVAILABLE/DELETE_PENDING/DELETED/FAILED`. Idempotensi: invoice unik lease/periode/jenis-mode; mutasi sensitif memakai idempotency key, transaksi/constraint/locking; verifikasi pembayaran, alokasi, ledger, dan audit atomik; media retry/cleanup aman diulang. Matriks role: OWNER/STAFF/TENANT; hanya Owner verifikasi/reversal/laporan/akun dan rekonsiliasi deposit; Staff operasi yang diizinkan dan mencatat payment pending; Tenant hanya resource milik sendiri, pascakontrak read-only. Layar: ikuti inventory/task M06-FE-21–55; layar deferred tanpa route produksi: SCR-01A/B, SCR-09M, SCR-17, SCR-19, SCR-P07/P08, SYS-01; pada layar campuran buang field/aksi di luar scope. Model data: AppUser, TenantProfile, Room, Lease, LeaseEndRequest, Invoice, InvoiceLine, Payment, PaymentAllocation, DepositLedgerEntry, PaymentReversal, Expense, OperatingBudget, Ticket, TicketComment, TicketAttachment, AuditEvent. Acceptance bersumber dari frozen Scope Statement → PRD REQ-01–07 dan enam E2E/wireflows yang belum dieksekusi; detail aturan/invarian FSD dan DATA/API spec; layar dari SITEMAP setelah crosswalk TODO; komponen dari COMPONENT_REQUIREMENTS dan DESIGN_SPEC. Verify output: `scope=True`, `prd=True`, `fsd=True`, `sitemap=True`, `design_spec=True`, `component_requirements=True`, `technical_spec=True`, `data_api_spec=True`, `handoff=True`, `typed_environment=True`, `role_matrix=True`, `models=True`, `idempotency=True`, `screen_tasks=True`, `stack_versions=True`. |
| [x] | M06-SETUP-04 | Verifikasi dependencies dan pin tooling | `package.json`, `package-lock.json`, `eslint.config.mjs` | M06-SETUP-01 | Periksa peer dependencies, status deprecated, dan versi resmi sebelum install; pin versi Prisma/Neon SDK dan semua dependency yang dipilih. Gunakan plugin Next langsung dengan ESLint 10. | Dependency berbayar atau integrasi baru | Peer dependency tidak konflik, dependency terpilih tidak deprecated, install bersih. | FSD §2.3, §8; M05 technical spec. Evidence: Registry command: `npm view <package@version> version deprecated --json` untuk semua dependency direct terpilih. Raw output versi (kolom `deprecated` tidak dikembalikan registry): AWS `3.1161.0, 3.1161.0`; Neon serverless `1.2.0`; Prisma adapter/client/CLI `7.10.1, 7.10.1, 7.10.1`; Next/React/React DOM `16.4.3, 19.3.1, 19.3.1`; ESLint/@eslint/js/Next plugin `10.14.0, 10.0.1, 16.4.3`; typescript-eslint/TypeScript `8.72.1, 5.9.3`. Sebelumnya `eslint@9.39.5` dilaporkan deprecated/EOL; ESLint 10 dipilih. Metadata peer `eslint-config-next` transitive membatasi plugin ke ESLint <=9; Next lokal `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md` menyarankan plugin Next langsung bila konflik plugin. Auth SDK beta ditunda ke M06-SETUP-06 setelah percobaan install menunjukkan peer conflict pada dependensi transitif/deprecated. `npm install --package-lock-only --ignore-scripts --no-audit --no-fund --strict-peer-deps`: `npm warn EBADENGINE ... required node 24.x, current v22.13.1 ...`; `up to date in 11s`; exit 0. `npm ci --strict-peer-deps --no-audit --no-fund`: warning EBADENGINE yang sama; `added 297 packages in 3m`; exit 0, tidak ada ERESOLVE/peer/deprecation warning. `npm ls --depth=0` exit 0 raw: `rumakost@0.1.0 D:\Workspace\RumaKost`; `@aws-sdk/client-s3@3.1161.0`; `@aws-sdk/s3-request-presigner@3.1161.0`; `@emnapi/runtime@1.11.3 extraneous`; `@eslint/js@10.0.1`; `@img/sharp-wasm32@0.35.5 extraneous`; `@neondatabase/serverless@1.2.0`; `@next/eslint-plugin-next@16.4.3`; `@prisma/adapter-neon@7.10.1`; `@prisma/client@7.10.1`; `@types/node@24.19.2`; `@types/react-dom@19.3.0`; `@types/react@19.3.0`; `eslint@10.14.0`; `next@16.4.3`; `prisma@7.10.1`; `react-dom@19.3.1`; `react@19.3.1`; `typescript-eslint@8.72.1`; `typescript@5.9.3`. Dua paket extraneous adalah optional sharp/WASM lintas platform. `eslint --print-config src/app/page.tsx`: `eslint_config=valid`, exit 0. Lockfile/package version check: `all_selected_versions=exact`; `auth_sdk_deferred=true`; `eslint_config_next_removed=true`; exit 0. `package.json` mempertahankan Node target `24.x` dan script `typecheck`; runtime lokal masih Node 22.13.1 (perlu diselaraskan sebelum gate selanjutnya). File yang diubah: `package.json`, `package-lock.json`, `eslint.config.mjs`. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-05 | Siapkan typed environment dan koneksi database lokal | .env.example, src/lib/env.ts, prisma/schema.prisma, prisma.config.ts, package.json, package-lock.json, docs/specs/FSD.md, RUNBOOK_LOCAL.md | M06-SETUP-04 | Validasi env server-side dengan Zod; pisahkan URL runtime pooled dan migrasi direct; secret nyata hanya ditulis pemilik ke .env.local. Neon Auth managed memakai Auth URL tanpa secret aplikasi. | Membaca/menyalin secret ke repo atau chat | npm run typecheck; invalid/missing variable ditolak dengan pesan aman, tanpa membocorkan nilai. | FSD §5.2, §6; keputusan Owner: Neon Auth managed. Registry npm view zod@4.6.7 version peerDependencies deprecated --json mengembalikan "4.6.7"; @next/env@16.4.3 mengembalikan "16.4.3"; server-only@0.0.1 mengembalikan "0.0.1"; metadata peer/deprecated tidak ada. npm install --package-lock-only --ignore-scripts --no-audit --no-fund --strict-peer-deps: npm warn EBADENGINE ... required node 24.x, current v22.13.1 ...; up to date in 4s; exit 0. npm install --strict-peer-deps --no-audit --no-fund: warning EBADENGINE yang sama; added 2 packages in 22s; exit 0. Verify npm run typecheck raw output: > rumakost@0.1.0 typecheck; > tsc --noEmit; exit 0. src/lib/env.ts memakai Zod, server-only, validasi PostgreSQL/HTTPS/origin lokal dan panjang CRON secret; error hanya menyebut nama variabel, tidak nilainya. prisma.config.ts memakai @next/env untuk memuat .env.local dan DIRECT_URL untuk migrasi; schema memakai Prisma Client generator v7. .env.example dan FSD menghapus NEON_AUTH_SECRET; RUNBOOK menjelaskan pemetaan output storage Neon AWS ke variabel aplikasi. Node lokal 22.13.1 tetap mengeluarkan EBADENGINE; jalankan dengan Node 24.x sesuai FSD. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-06 | Integrasi autentikasi dan sesi provider | `src/lib/auth/`, `src/app/(auth)/` | M06-SETUP-05 | Implementasikan login/logout dan sesi server memakai Neon Auth sesuai versi terpin; cookie HttpOnly/Secure/SameSite sesuai environment; tanpa token di localStorage. | Pendaftaran publik, OTP/2FA | `npm run test -- auth`; sesi valid terbaca server-side dan kredensial invalid ditolak tanpa data terlindungi. | REQ-01.1, REQ-01.3; FSD §3, §5. Evidence 2026-10-31: Neon Auth SDK 0.6.0-beta serta override sejalur 1.7.6 tetap gagal strict peer resolution. Mengikuti customer workaround pada Neon issue #212, dipin `@neondatabase/auth@0.5.0-beta` dengan `@neondatabase/auth-ui@0.3.0-beta` dan root overrides Better Auth 1.6.23, `@better-auth/utils@0.4.2`, `@better-fetch/fetch@1.3.1`, `better-call@1.3.7`. `npm install --save-exact @neondatabase/auth@0.5.0-beta --strict-peer-deps --no-audit --no-fund`: exit 0, `added 196 packages in 2m`; output juga memuat `EBADENGINE` (lokal Node 22.13.1, syarat 24.x) dan warning deprecated untuk paket transitive `@react-email/*`. `npm ci --strict-peer-deps --no-audit --no-fund`: exit 0, `added 495 packages in 3m`, dengan warning yang sama. `npm ls @neondatabase/auth @neondatabase/auth-ui better-auth @better-auth/core @better-auth/api-key @better-auth/passkey @better-auth/telemetry @better-auth/utils @better-fetch/fetch better-call --all`: exit 0; pohon memperlihatkan Auth 0.5.0-beta/UI 0.3.0-beta, seluruh Better Auth/passkey/core/api-key/telemetry 1.6.23, dan tidak ada `invalid` peer. Verify task auth masih gagal karena script belum dibuat: `$ npm run test -- auth`; `npm error Missing script: "test"`; `EXIT_CODE=1`. Dependency blocker sudah teratasi. Implementasi: Neon Auth `createNeonAuth` server instance dengan cookie SDK HttpOnly, Secure, SameSite=Lax; server actions validasi email/password dan memanggil provider untuk login/logout; GET auth proxy hanya meneruskan `get-session`, tanpa POST/signup/reset/OTP/2FA; `/login` membaca sesi di Server Component dan mengikuti prototipe responsif tanpa kredensial demo/localStorage. Role picker hanya memilih tujuan navigasi; bukan otorisasi. `npm run test -- auth` raw output: `> rumakost@0.1.0 test`; `> node scripts/run-tests.mjs auth`; `TAP version 13`; `ok 1 - allows only the read-only session endpoint through the auth proxy`; `ok 2 - rejects malformed credentials before contacting Neon Auth`; `ok 3 - a valid server session exposes its user and an absent session exposes none`; `# tests 3`; `# pass 3`; `# fail 0`; exit 0. Contrast checker: CTA `#AD4F00` on white `5.39:1 PASS`; muted text `#71717A` on white `4.83:1 PASS`; error `#B42318` on `#FEF3F2` `6.05:1 PASS`. Unit tests use synthetic session only; live managed-provider acceptance (valid session and wrong-password rejection) remains unverified pending a synthetic provider account. NEON_AUTH_COOKIE_SECRET dibuat dengan RandomNumberGenerator dan ditambahkan ke `.env.local`; output hanya menyatakan penambahan, nilai tidak dibaca/ditampilkan. Startup awal menemukan `node_modules/next/dist/compiled/@edge-runtime/primitives/load.js` berbeda hash dan gagal `node --check`; file dipulihkan dari tarball registry Next 16.4.3; hash lokal=tarball dan `node --check` exit 0. `npm run dev` raw startup: `▲ Next.js 16.4.3 (webpack)`; `✓ Ready in 7.0s`. Probe pertama `/login` 500 karena `force-dynamic` tidak kompatibel dengan `cacheComponents`; diubah menjadi `Suspense` untuk request-time sesi sesuai panduan lokal Next. Probe kedua `/login`: `HTTP_STATUS=200`, `CONTENT_TYPE=text/html; charset=utf-8`, `HAS_LOGIN_TITLE=True`. Validasi environment dipisah per kapabilitas agar halaman Auth tidak memerlukan variabel Storage sebelum integrasi Storage dipakai. Verify ulang `npm run test -- auth`: `# tests 3`, `# pass 3`, `# fail 0`, exit 0. Live wrong-password rejection/provider session belum diuji dengan akun uji sintetis. Approved: 2026-10-31 by zeenn. |
| [x] | M06-SETUP-07 | Aktivasi sandi perdana dan perubahan sandi mandiri | `src/app/aktivasi-sandi/`, `src/app/profil/`, `src/app/portal/profil/` | M06-SETUP-06 | Terapkan forced password change untuk akun yang ditandai dan perubahan sandi akun sendiri; role dan status akun dibaca ulang di server; jangan sertakan field profil di luar scope. | Reset email (ditangani task SCR-01A/B); profil kendaraan | `npm run test -- auth-password`; akun `mustChangePassword` tertahan di aktivasi sampai berhasil; role lain hanya dapat mengubah sandi sendiri. | SCR-01C, SCR-18, SCR-P06; REQ-01. Evidence verify (2026-11-01): exit 0; `# tests 4`, `# pass 4`, `# fail 0`. Raw output tercatat di evidence M06-SETUP-07 di bawah. Approved: 2026-11-01 by zeenn |
| [x] | M06-SETUP-08 | Route guard dan otorisasi server Owner/Staff/Tenant | `src/proxy.ts`, `src/lib/auth/`, `src/lib/authorization/` | M06-SETUP-06 | Gunakan auth.middleware di Proxy untuk sesi awal; tegakkan role, status, forced-change, dan ownership di server page/action/data-access. | Permission Staff granular dan multi-property | `npm run test -- authorization`; matriks allow/deny FSD lulus pada server boundary. Evidence: Verify exit 0; 7 passed, 0 failed. | REQ-01.2; FSD §4; SITEMAP §4. Approved: 2026-11-01 by zeenn |
| [x] | M06-SETUP-09 | Pembuatan dan aktivasi akun oleh Owner/Staff | `src/actions/users.ts`, `src/app/pengaturan/akun/` | M06-SETUP-08, M06-DB-01 | Owner membuat/menonaktifkan akun Staff dan Penghuni; Owner/Staff membuat/menonaktifkan Penghuni; atur sandi awal/undangan melalui provider tanpa public signup. Owner awal disiapkan terpisah. | Manajemen role di luar tiga role MVP | `npm run test -- users`; Owner dapat mengelola Staff/Penghuni, Staff hanya Penghuni, Penghuni tidak dapat membuat akun, dan pendaftaran publik tidak tersedia. | REQ-01.1; SCR-16; keputusan Owner 2026-11-01. Approved: 2026-11-01 by zeenn |
| [~] | M06-SETUP-10 | Tautkan Owner bootstrap Neon Auth ke AppUser | `scripts/bootstrap-owner.mjs`, `package.json`, `RUNBOOK_LOCAL.md`, `TODO.md` | M06-SETUP-05/06/09, M06-DB-01 | Buat tepat satu baris `OWNER` untuk identitas Neon Auth yang sudah ada. Terima auth subject, email, dan nama secara interaktif; tolak jika Owner atau identitas/email sudah ada. Gunakan transaksi dan advisory lock. Tidak membuat identitas provider atau password. | Membaca kredensial, signup publik, mengganti role provider | Database sementara bermigrasi: bootstrap sukses sekali, pemanggilan kedua ditolak, hanya satu OWNER, tidak ada input/secret di output; hapus database uji. | Keputusan Owner 2026-11-01; RUNBOOK_LOCAL.md |

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
| [x] | M06-DB-19 | Cegah Lease aktif tumpang tindih untuk Penghuni yang sama | `prisma/migrations/20261101280000_tenant_active_period/migration.sql` | M06-DB-18; keputusan scope satu Penghuni tidak menyewa beberapa kamar aktif bersamaan | Tambahkan exclusion constraint berbasis `tenant_user_id` untuk rentang tanggal pada status `SCHEDULED`/`ACTIVE`, konsisten dengan constraint bentrok kamar. Lease historis `ENDED`/`CANCELLED` tetap boleh tumpang tindih. | Mengubah tanggal inklusif Lease atau menghapus histori | Database sekali pakai: overlap Penghuni pada kamar berbeda ditolak; periode berurutan, Tenant lain, serta histori nonaktif tetap dapat disimpan; hapus database uji. | FSD §2; M05-DATA-API §2 dan §7; keputusan Owner di chat WF-01. Approved: 2026-11-01 by zeenn |
| [~] | M06-DB-20 | Lengkapi model kamar untuk tipe dan dimensi opsional | `prisma/schema.prisma`, `prisma/migrations/20261101290000_room_type/migration.sql`, `prisma/migrations/20261101300000_room_dimensions/migration.sql`, `TODO.md` | M06-DB-03; keputusan Owner 2026-11-01; CR-2026-001 | Simpan `roomType` dan pasangan `widthMeters`/`lengthMeters` nullable dalam meter. Constraint menolak pasangan parsial atau dimensi nol/negatif. | Katalog tipe dinamis, fasilitas, foto, luas tersimpan, perubahan tarif otomatis | `npx prisma validate`; DB disposable: kolom nullable/constraint valid; data lama dan pasangan valid lolos, parsial/nonpositif ditolak. Jangan pakai DB utama. | WF-02 SK-27; FSD §2.2; M05-DATA-API §2; CR-2026-001. Verify SQL migration di PGlite ephemeral lulus; Prisma migrate deploy ke Neon tidak dijalankan. Menunggu review Owner. |
| [~] | M06-DB-21 | Model pagu anggaran operasional bulanan | `prisma/schema.prisma`, `prisma/migrations/20261101310000_operating_budget/migration.sql`, `TODO.md` | M06-DB-16; keputusan CR-2026-001 | Satu pagu positif per bulan kalender, periode disimpan sebagai tanggal hari pertama; updater dicatat. Owner-only upsert dan audit per perubahan dijalankan backend dalam transaksi; tidak ada default dan histori berada di AuditEvent. | Budget kategori, proyeksi, akuntansi/pajak | Prisma validate dan migration SQL pada DB disposable; cek unique bulan, hari pertama, nominal positif, FK updater, serta simulasi upsert + event audit. Tidak memakai DB utama. | F-06; FSD ?2.2; M05-DATA-API ?2/?5; CR-2026-001. Verify disposable PGlite lulus; menunggu review Owner. |
| [~] | M06-DB-23 | Audit cakupan data dasbor WF-02 | `docs/design/SCENARIOS_WF02.md`, `docs/design/SCENARIO_EVALUATION.md`, `docs/specs/FSD.md`, `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`, `TODO.md` | M06-DB-20; CR-2026-001 | Petakan kebutuhan dashboard ke data Room/Lease/Invoice/Payment/Expense/Ticket/AuditEvent; pisahkan kebutuhan DB dari agregasi/otorisasi backend; rekonsiliasi fixture finansial dan harga unit. | Membangun schema/report API, menambah fitur di luar scope | `rg` traceability dan kalkulasi fixture; tidak menjalankan migration/test. Bukti: Room mendukung tipe/dimensi; OperatingBudget masih task M06-DB-21; angka WF-02 direkonsiliasi dengan asumsi dan batas fixture dicatat. Menunggu review Owner. | WF-02 SK-01–17, SK-23, SK-26–27; FSD §2; M05-DATA-API §2/§5; CR-2026-001 |
| [~] | M06-DB-22 | Perbarui fixture seed kamar dan anggaran | `prisma/seed.ts`, `TODO.md` | M06-DB-20, M06-DB-21 | Isi dimensi kamar sintetis dan satu pagu bulanan sintetis agar dashboard punya contoh; seed tetap idempotent. | Data nyata, credential login, budget sebagai nilai default produk | Jalankan fixture seed dua kali pada DB disposable; data dimensi/pagu ada dan jumlah record tidak bertambah; jangan gunakan DB utama. | FSD §7; CR-2026-001. Verify fungsi seed dua kali pada PGlite lulus; batas ekstensi GiST dicatat di evidence; menunggu review Owner. |

| [~] | M06-DB-24 | Lengkapi integritas data dan siklus hidup kamar WF-03 | `prisma/schema.prisma`, `prisma/migrations/20261101320000_room_floor_lifecycle/migration.sql`, `prisma/seed.ts`, FSD/PRD/M05 Data API, scenario evaluation, `CONTEXT.md`, `TODO.md` | M06-DB-20; keputusan Owner WF-03; CR-2026-002 | Katalog Floor satu properti; Room.floorId; arsip Room/Floor; normalisasi kode kamar dan unik; batas tarif/deposit; migrasi aman/backfill floor; seed contoh default deposit 50%. | Foto kamar, properti multi-tenant, operasi/action/route BE, perubahan data Neon Owner | `npx prisma validate` dengan URL sintetis; migration dan constraints di PGlite disposable; backfill lantai; cek code collision/format, batas nilai, FK lantai, archive fields, seed idempotence dan default deposit. Jangan pakai DB Owner. | WF-03 SK-03/04/10/11/14/28/41/48/56/57; FSD REQ-02; M05 Data/API §2/§5; CR-2026-002. Menunggu review Owner. |
| [~] | M06-DB-25 | Audit seluruh 57 skenario WF-03 pada lapisan DB | `docs/design/SCENARIOS_WF03.md`, `docs/design/SCENARIO_EVALUATION.md`, schema/migrations, `TODO.md` | M06-DB-24; permintaan Owner 2026-11-01 | Petakan tiap skenario ke data/constraint DB, aturan aplikasi, atau out-of-scope; catat gap dan konflik crosswalk tanpa mengimplementasikan BE. | Perubahan schema/BE, penetapan keputusan domain baru, penerapan ke Neon | Verifikasi hitungan 57 ID skenario dan 57 baris crosswalk; telusuri Room/Floor/Lease/Ticket/Invoice/Payment/AuditEvent terhadap kebutuhan persistensi; catat temuan di Evidence. | WF-03 SK-01-SK-57; FSD REQ-02/03/07; PRD; M05 Data/API; Frozen Scope. Menunggu review Owner. |
| [~] | M06-DB-26 | Tutup gap DB tersisa dari audit WF-03 | `prisma/schema.prisma`, `prisma/migrations/20261101330000_wf03_room_operational_rules/migration.sql`, FSD, M05 Data/API, Frozen Scope, scenario evaluation, `TODO.md` | M06-DB-25; instruksi Owner "fix" 2026-11-01 | Tambahkan telepon E.164 opsional pada TenantProfile, catatan operasional Room, target tanggal penyelesaian Ticket, serta trigger lifecycle Room/Floor/Lease. Selaraskan klasifikasi P1 SK-51/54/55 dengan scope satu penghuni dan kebutuhan DB. | Backend/API/RBAC/audit, Technician role, multi-penghuni, integrasi WhatsApp, apply ke Neon | Prisma validate dengan URL sintetis; seluruh migrasi selain kendala GiST PGlite; uji check telepon, arsip/status Room/Floor, Lease vs Room, hard delete; seed dua kali; diff check. Tidak memakai DB utama. | WF-03 SK-05/07/16/30/45/47/51/54/55; FSD REQ-02/03/07; M05 Data/API; Frozen Scope. Verify dan raw output dicatat di Evidence; menunggu review Owner. |
| [x] | M06-DB-27 | Audit cakupan data WF-04 pada lapisan DB | `docs/design/SCENARIOS_WF04.md`, `docs/design/SCENARIO_EVALUATION.md`, `prisma/schema.prisma`, `prisma/migrations/`, PRD/FSD/M05 Data API, `TODO.md` | M06-DB-26; permintaan Owner cek WF-04 2026-11-01 | Cocokkan 40 skenario dengan persistensi penghuni/Lease, billing awal, pembayaran, checkout/deposit; bedakan constraint DB, invariants transaksi/backend, data yang belum terstruktur, dan fitur out-of-scope. | Mengubah schema/migration/crosswalk, implementasi backend/UI, Neon | Verifikasi 40 ID runbook dan 40 baris crosswalk unik/lengkap; audit field dan constraint terkait profil, kontrak, invoice, payment, checkout, dan deposit; catat gap DB yang nyata serta ambiguitas scope di Evidence. Read-only selain TODO. | WF-04 SK-01–40; FSD REQ-03/04/05; PRD; M05 Data/API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-28 | Tutup temuan DB WF-04 | `prisma/schema.prisma`, `prisma/migrations/20261101340000_wf04_profile_contract_escrow_integrity/migration.sql`, `prisma/seed.ts`, PRD/FSD/M05 Data API, scope, crosswalk, `TODO.md` | M06-DB-27; instruksi Owner “fix semua” 2026-11-01 | Enforce nama nonblank, profil penghuni/kontak darurat terstruktur, nomor SPK opsional, dan integritas sumber serta saldo escrow. Pertahankan data legacy kontak darurat saat rename. Koreksi KTP SK-08 menjadi out-of-scope. | Backend, RBAC, UI, generasi SPK, apply ke Neon | Prisma validate memakai URL sintetis; seluruh migration di PGlite selain exclusion GiST yang tak didukung; cek constraint profil, nomor SPK, sumber ledger, saldo/refund, seed dua kali; git diff --check. Jangan baca .env.local atau menyentuh Neon. Catat raw output di Evidence dan berhenti untuk review Owner. | WF-04 SK-01/02/04/05/08/09/11/12/34/39; PRD REQ-03/05; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [~] | M06-DB-29 | Audit cakupan data WF-05 pada lapisan DB | `docs/design/SCENARIOS_WF05.md`, `docs/design/SCENARIO_EVALUATION.md`, schema/migrations, PRD/FSD/M05 Data API, `TODO.md` | M06-DB-28; instruksi Owner lanjut setelah WF-04 2026-11-01 | Cocokkan seluruh 61 skenario WF-05 dengan model invoice/pembayaran; bedakan constraint DB, transaksi/backend, batas scope, dan konflik spesifikasi. | Mengubah schema/migration/backend atau scope sebelum keputusan Owner | Hitung 61 ID runbook dan crosswalk; audit status draft/publish, pembayaran/alokasi/reversal, void, idempotensi, referensi transaksi, bukti transfer, serta koreksi klasifikasi crosswalk. Read-only selain TODO; catat gap dan rekomendasi dalam Evidence lalu berhenti untuk review Owner. | WF-05 SK-01–61; PRD REQ-03/04/05; FSD; M05 Data API; Frozen Scope. Menunggu review Owner. |
| [x] | M06-DB-30 | Tutup gap integritas finansial WF-05 | `prisma/schema.prisma`, `prisma/migrations/20261101350000_wf05_financial_integrity/migration.sql`, FSD, M05 Data API, crosswalk, `TODO.md` | M06-DB-29; arahan Owner “ya rekomendasimu aja” 2026-11-01 | Tambah idempotency runtime, referensi payment, guard alokasi/review/reversal/void, dan koreksi scope draft WF-05. Pertahankan natural key invoice Lease/periode/jenis; catat keterbatasan reissue setelah VOID. | Backend/API, UI, penerbitan draft, workflow approval, apply ke Neon, `.env.local` | Prisma validate memakai URL sintetis; apply seluruh migration di PGlite dengan exclusion GiST dihilangkan karena emulator; seed dua kali; uji referensi, alokasi lintas invoice/nominal, verifikasi, overpayment invoice/line, transisi append-only, reversal penuh, void, idempotency, crosswalk 61 ID, `git diff --check`. Catat raw output di Evidence dan berhenti untuk review Owner. | WF-05 SK-01–61; PRD REQ-03/04/05; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-31 | Audit konsistensi reversal payment terhadap saldo deposit WF-04 | `prisma/schema.prisma`, migration escrow WF-04, migration finansial WF-05, PRD/FSD/M05, `TODO.md` | M06-DB-28 dan M06-DB-30; permintaan Owner cek WF-04 2026-11-01 | Pastikan reversal pembayaran yang dialokasikan ke deposit tidak meninggalkan saldo escrow semu atau membolehkan penggunaan/refund atas setoran yang sudah direversal. Bedakan efek saat reversal sebelum dan sesudah ledger dipakai. | Mengubah schema/migration/aturan reversal sebelum keputusan Owner; backend/UI/Neon | Verifikasi 40 ID runbook dan crosswalk; cocokkan efek `COLLECTED`, `PaymentReversal`, dan saldo deposit dengan PRD/FSD/M05; dokumentasikan gap dan rekomendasi. Read-only selain TODO; berhenti untuk keputusan Owner jika aturan kompensasi belum ditetapkan. | WF-04 SK-05/11/12/34; WF-05 reversal; PRD REQ-05.3; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-32 | Jaga saldo escrow saat reversal payment deposit | `prisma/schema.prisma`, `prisma/migrations/20261101360000_deposit_collection_reversal/migration.sql`, FSD, M05 Data API, `TODO.md` | M06-DB-31; keputusan Owner “rekomendasimu aja” 2026-11-01 | Tambah event append-only `COLLECTION_REVERSED` yang ditulis atomik untuk alokasi deposit ter-posting. Saldo escrow menghitung event ini sebagai pengurang; reversal ditolak bila saldo bebas tidak cukup karena settlement/withholding/refund aktif. Tolak posting `COLLECTED` dari payment yang sudah direversal. | Backend, UI, transfer refund otomatis, apply ke Neon, `.env.local` | Prisma validate dengan URL sintetis; jalankan semua migration pada PGlite disposable dengan dua exclusion GiST dihilangkan untuk kompatibilitas; seed dua kali; uji reversal deposit penuh/campuran, kompensasi otomatis, reversal sebelum ledger post, penolakan jika dana terpakai/direservasi, atomic rollback, crosswalk WF-04, `git diff --check`. Catat raw output dan berhenti untuk review Owner. | WF-04 SK-05/11/12/34; WF-05 reversal; PRD REQ-05.3; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-33 | Audit akhir cakupan WF-05 setelah integritas finansial dan escrow | `docs/design/SCENARIOS_WF05.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, `TODO.md` | M06-DB-30 dan M06-DB-32; Owner menyatakan WF-04 clear dan meminta lanjut ke WF-05 2026-11-01 | Audit ulang seluruh 61 skenario WF-05 setelah guard invoice/payment/reversal dan kompensasi escrow. Pastikan isu yang tersisa benar-benar tanggung jawab DB; pisahkan invariants transaksi/backend dan batas scope. | Implementasi schema/migration/backend atau keputusan domain baru tanpa review Owner; Neon; `.env.local` | Verifikasi hitungan 61 ID runbook dan crosswalk; telusuri void terhadap payment pending, escrow settlement terhadap status invoice, minimal satu line invoice, due date, alasan audit, serta status finansial. Catat hasil/rekomendasi di Evidence; read-only selain TODO dan berhenti untuk review Owner. | WF-05 SK-01–61; FSD REQ-04/05; PRD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-34 | Tutup gap konsistensi invoice WF-05 | `prisma/migrations/20261101370000_wf05_invoice_consistency_guards/migration.sql`, FSD, M05 Data API, `TODO.md` | M06-DB-33; Owner menyetujui rekomendasi audit WF-05 2026-11-01 | Cegah void ketika ada payment `PENDING` atau `VERIFIED` aktif; wajibkan settlement deposit menunjuk invoice `ISSUED`; tegakkan minimal satu invoice line saat transaksi commit. Tolak penerapan bila data existing memiliki invoice kosong. | Backend, UI, keputusan reissue invoice, Neon, `.env.local` | Apply seluruh migration pada PGlite disposable; uji void ditolak dengan payment pending, reject lalu void lolos, invoice verified belum direversal tetap tertahan, settlement ke invoice VOID ditolak dan ISSUED lolos, invoice kosong gagal saat commit sementara invoice ber-line lolos, preflight menolak data existing kosong. Jalankan hanya Verify task ini dan catat output mentah; `git diff --check`. | WF-05 SK-17/19/40; FSD; M05 Data API; M06-DB-33. Approved: 2026-11-01 by zeenn. |
| [~] | M06-DB-35 | Audit cakupan data WF-06 pada lapisan DB | `docs/design/SCENARIOS_WF06.md`, `docs/design/SCENARIO_EVALUATION.md`, schema/migrations, PRD/FSD/M05 Data API, Frozen Scope, `TODO.md` | M06-DB-34; permintaan Owner audit WF-06 DB 2026-11-01 | Cocokkan seluruh skenario WF-06 dengan model Payment, PaymentAllocation, PaymentReversal, DepositLedgerEntry, IdempotencyKey, AuditEvent, serta Expense; bedakan constraint DB, transaksi/backend/RBAC, konflik spesifikasi, dan fitur di luar P0. | Perubahan schema/migration/backend, memperluas scope surplus/transfer/refund rekening, atau revisi skenario sebelum review Owner; Neon; `.env.local` | Verifikasi jumlah dan kelengkapan ID runbook/crosswalk; audit status dan alokasi pembayaran, metode/referensi, penolakan/alasan audit, reversal/idempotensi, escrow/refund, double transfer/overpayment, serta klasifikasi scope. Read-only selain TODO; catat gap dan rekomendasi tanpa implementasi. | WF-06 SK-01–55; PRD REQ-05/06; FSD; M05 Data API; Scope Statement. Menunggu review Owner. |
| [~] | M06-DB-36 | Simpan alasan rejection dan batasi metode Payment P0 | `prisma/schema.prisma`, `prisma/migrations/20261101380000_payment_rejection_reason_method/migration.sql`, FSD, M05 Data API, `docs/design/SCENARIOS_WF06.md`, `TODO.md` | M06-DB-35; instruksi Owner “fix” 2026-11-01 | Simpan alasan wajib/nonblank pada Payment `REJECTED` secara immutable; batasi metode manual menjadi `TRANSFER`, `QRIS`, `CASH`; tolak hard delete Payment; bedakan REJECTED dari reversal dan normalkan nilai reversal yang tersimpan positif dari tampilan negatif. Migration fail-safe jika data lama perlu backfill. | Payment gateway/bank sync, detail rekening/nama bank, refund surplus/kredit, backend/UI, penerapan Neon, `.env.local` | `npx prisma validate` dengan URL sintetis; apply seluruh migration pada PGlite disposable; verifikasi nilai metode yang diizinkan dan penolakan metode lain, alasan wajib saat reject, penolakan reason blank/mutasi, Payment tidak dapat dihapus, preflight tidak meninggalkan perubahan jika ada status/metode lama yang perlu backfill, fixture sintetis metode `TRANSFER`; `git diff --check`. Catat output mentah task ini saja. | WF-06 SK-06/07/11/16/42/44/53; PRD REQ-05; FSD; M05 Data API; Scope Statement. Menunggu review Owner. |
| [x] | M06-DB-37 | Audit cakupan data WF-07 pada lapisan DB | `docs/design/SCENARIOS_WF07.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, Scope Statement, `TODO.md` | M06-DB-36; Owner meminta lanjut ke WF-07 2026-11-01 | Cocokkan seluruh 50 skenario dengan Expense, OperatingBudget, Payment/Allocation/Reversal, Invoice, Lease, Room, dan AuditEvent; pisahkan constraint DB, transaksi/backend/RBAC, konflik spesifikasi, dan fitur di luar P0. | Implementasi schema/migration/backend atau perubahan scope sebelum review Owner; Neon; `.env.local` | Verifikasi 50 ID runbook/crosswalk unik dan lengkap; audit validasi Expense, koreksi/retensi transaksi, metode kalkulasi pemasukan-kas dan deposit, anggaran, okupansi/biaya per kamar, rekonsiliasi bank, akses laporan, dan idempotensi. Catat gap/rekomendasi serta konflik scope dalam Evidence; read-only selain TODO. | WF-07 SK-01–50; PRD REQ-06; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-38 | Tegakkan integritas Expense dan selaraskan laporan WF-07 | `prisma/schema.prisma`, `prisma/migrations/20261101390000_wf07_expense_integrity/migration.sql`, `prisma/seed.ts`, PRD/FSD/M05 Data API/Scope, `docs/design/SCENARIOS_WF07.md`, `docs/design/SCENARIO_EVALUATION.md`, `TODO.md` | M06-DB-37; Owner meminta memperbaiki semua temuan WF-07 2026-11-01 | Tambah validasi nonblank, append-only Expense, reversal penuh beralasan oleh Owner, dan constraints unik/amount/immutability. Selaraskan laporan sebagai kas internal Owner-only; tetapkan biaya per kamar/diskon/ekspor sebagai backlog yang sudah dibekukan. | Implementasi backend/UI, rekonsiliasi bank, tautan Expense ke Room/Ticket, Neon, `.env.local` | `npx prisma validate` memakai URL sintetis; seluruh migration pada PGlite disposable dengan exclusion GiST dihilangkan hanya untuk emulator; uji blank category/description, fail-safe preflight tanpa schema residue, nominal/role/reason/amount reversal, satu reversal per Expense, update/delete Expense dan reversal ditolak, Expense pengganti setelah reversal; jalankan seed sintetis dua kali; tinjau konsistensi spesifikasi/crosswalk; `git diff --check`. Catat output raw Verify task ini saja; jangan menjalankan task Verify lain. | WF-07 SK-10/14/19/33/39/45/49/50; PRD REQ-06; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-39 | Audit cakupan data WF-08 pada lapisan DB | `docs/design/SCENARIOS_WF08.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, Scope Statement, `TODO.md` | M06-DB-38; Owner meminta lanjut setelah WF-07 2026-11-01 | Cocokkan seluruh 68 skenario dengan Ticket, TicketComment, TicketAttachment, Room, Lease, AppUser, AuditEvent, dan IdempotencyKey. Pisahkan constraint DB, transaksi/backend/RBAC, konflik spesifikasi/scope, dan fitur backlog. | Perubahan schema/migration/backend atau scope sebelum review Owner; Neon; `.env.local` | Verifikasi 68 ID runbook/crosswalk unik dan lengkap; audit relasi ticket-ke-lease, kategori/nomor tiket, status/transisi/pembatalan, teks wajib, histori/retensi, lampiran dan batas media, idempotensi, aktor/pemilik, serta klaim biaya/garansi. Catat gap/rekomendasi dan konflik tanpa implementasi. Read-only selain TODO; jalankan hanya Verify task ini dan catat output mentah. | WF-08 SK-01–68; PRD REQ-07; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-40 | Tegakkan integritas ticketing WF-08 dan selaraskan kontrak data | `prisma/schema.prisma`, `prisma/migrations/20261101400000_wf08_ticket_integrity/migration.sql`, `prisma/seed.ts`, PRD/FSD/M05 Data API/Scope, `docs/design/SCENARIOS_WF08.md`, `docs/design/SCENARIO_EVALUATION.md`, `TODO.md` | M06-DB-39; Owner mengarahkan perbaikan semua temuan serta menetapkan semua role boleh membuat tiket 2026-11-01 | Tambah relasi lease opsional (wajib aktif/milik untuk Tenant), kategori dan nomor unik, validasi teks, status transition + histori, pembatalan terminal beralasan, assignment internal, komentar append-only, guard metadata/batch/media/retensi, dan minimal satu metadata lampiran. Selaraskan biaya/garansi/teknisi/notifikasi sebagai backlog P0. | Backend/UI/RBAC implementation, content verification object storage, Neon, `.env.local`, `npm run db:migrate` | `npx prisma validate` memakai URL sintetis; seluruh migration pada PGlite disposable; jalankan seed sintetis dua kali; uji create tiga role/Lease/vacant-room, category/number/text checks, transisi normal/reopen Owner-only/cancel + history, no delete/edit comments, media type/size/duration/batch/aggregate, retention, deferred required attachment metadata, fail-safe preflight tanpa schema residue; `git diff --check`. Catat output mentah task ini saja; jangan menjalankan Verify task lain atau apply ke Neon. | WF-08 SK-03/09/15/18/20/26/35/45/47/50; PRD REQ-07; FSD; M05 Data API; M06-DB-39. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-41 | Audit cakupan data WF-09 pada lapisan DB | `docs/design/SCENARIOS_WF09.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, Scope Statement, `TODO.md` | M06-DB-40; Owner melanjutkan audit WF-09 2026-11-01 | Cocokkan 90 skenario dengan AppUser/TenantProfile/Lease/Room/Floor/AuditEvent dan batas Neon Auth; pisahkan persistensi DB, otorisasi/transaksi/backend, konflik antara runbook dan keputusan/scope beku, serta backlog. | Perubahan schema/migration/backend atau scope sebelum review Owner; Neon; `.env.local` | Verifikasi 90 ID runbook/crosswalk unik dan lengkap; audit aktivasi akun dan tiga role, email/identitas, deaktivasi/reaktivasi dan histori Lease, properti/rekening/tata tertib, anti-lockout Owner, audit trail, credential/session, Staff permission, Teknisi, privasi/penghapusan, dan efek ke tiket aktif. Read-only selain TODO; jangan menambahkan entitas atau aturan sebelum review. Catat gap dan rekomendasi di Evidence; jalankan hanya Verify task ini lalu berhenti untuk review Owner. | WF-09 SK-01–90; PRD REQ-01/03/07; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-42 | Selaraskan aturan pembuatan akun dan siklus kredensial WF-09 dengan keputusan Owner | `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`, `docs/pm/SCOPE_STATEMENT.md`, `docs/design/SCENARIOS_WF09.md`, `docs/design/SCENARIO_EVALUATION.md`, `TODO.md` | M06-DB-41; Owner menegaskan akun bukan self-service; Tenant dapat didaftarkan Owner/Staff, email login dikelola Owner, dan semua role mengganti password sendiri via provider | Selaraskan F-01: Owner membuat Staff/Tenant; Staff juga boleh membuat Tenant; tidak ada public signup. Email login diperbarui hanya melalui alur Owner yang dikelola Neon Auth; `authSubject` stabil, AppUser mirror diubah setelah konfirmasi provider. Owner/Staff/Tenant mengganti password sendiri melalui Neon Auth. Pisahkan akun Tenant dari Lease/kamar; tandai Teknisi/granular permission backlog dan keputusan cardinality Owner, hard-delete/anonymization, serta sesi/password reuse provider yang belum terverifikasi. | Perubahan schema/migration/backend/UI, implementasi Neon Auth, penerapan Neon, `.env.local` | Periksa konsistensi aktor/email/password pada PRD/FSD/M05/Scope/WF-09/crosswalk; pastikan tidak ada self-registration/temp password/custom session, `authSubject` tetap anchor dan relasi kamar melalui Lease; unresolved policy/provider behavior tetap tercatat. `git diff --check`; catat raw output task ini saja. Docs-only; jangan menjalankan Verify lain. | Arahan Owner sebelumnya tentang manajemen akun dan password; WF-09 SK-07/08/09/15/16/17/31/38/49/59; PRD REQ-01; FSD; Neon Auth managed. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-43 | Tegakkan email AppUser canonical pada lapisan DB | `prisma/schema.prisma`, `prisma/migrations/20261101410000_app_user_email_canonical/migration.sql`, M05 Data API, `TODO.md` | M06-DB-42; keputusan Owner bahwa email login terkelola dan unik setelah normalisasi | Tegakkan kontrak email mirror sebagai lowercase dengan spasi ASCII di tepi dipangkas; nilai kosong/non-canonical ditolak. Tambahkan CHECK fail-safe dengan preflight yang membatalkan migration bila data lama perlu dibersihkan; jangan mengubah/backfill email otomatis. Unique index exact tetap cukup setelah nilai canonical. | Neon Auth/backend/UI, email format verification, backfill otomatis, penerapan Neon, `.env.local` | `npx prisma validate` dengan URL sintetis; terapkan seluruh migration di PGlite disposable (lewati hanya GiST yang tak didukung); canonical lowercase lolos, spasi tepi/huruf besar/kosong/duplikat ditolak; uji legacy non-canonical membatalkan migration tanpa schema residue; `git diff --check`. Catat output mentah task ini saja, jangan apply ke Neon. | WF-09 SK-10/12/18/31/43/49; PRD REQ-01; FSD; M05 Data API; M06-DB-41. Approved: 2026-11-01 by zeenn. |

| [x] | M06-DB-44 | Audit cakupan data WF-10 pada lapisan DB | `docs/design/SCENARIOS_WF10.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, Scope Statement, `TODO.md` | M06-DB-43; Owner melanjutkan audit WF-10 2026-11-01 | Cocokkan 26 skenario portal Tenant dengan Lease/LeaseEndRequest, Invoice/InvoiceLine/Payment/Allocation/Reversal/DepositLedgerEntry, Ticket, dan TenantProfile; pisahkan constraint DB, invariants backend/RBAC, konflik runbook terhadap scope, dan backlog. | Perubahan schema/migration/backend, implementasi portal, memperluas scope, Neon, `.env.local` | Verifikasi 26 ID runbook dan crosswalk unik/lengkap; audit pra-hunian/arsip/overdue/parsial, kepemilikan Tenant, check-out, escrow, klaim rejected/reversal, bukti transfer, PDF/receipt, meteran/WiFi/pengumuman/kendaraan/renewal. Catat gap dan rekomendasi DB serta batas backend/scope di Evidence; read-only selain TODO; jangan mengubah WF-10/crosswalk sebelum review. Jalankan Verify task ini saja, `git diff --check`, lalu berhenti untuk review Owner. | WF-10 SK-01–26; PRD REQ-01/03/04/05/07; FSD; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn. |

| [x] | M06-DB-45 | Tutup temuan integritas dan scope WF-10 | prisma/schema.prisma, prisma/migrations/20261101420000_lease_end_request_tenant_guard/migration.sql, docs/architecture/M05-DATA-API-SPEC-DRAFT.md, docs/specs/FSD.md, docs/design/SCENARIOS_WF10.md, docs/design/SCENARIO_EVALUATION.md, TODO.md | M06-DB-44; Owner meminta perbaikan 2026-11-01 | Ikat pemohon LeaseEndRequest pada Tenant pemilik Lease melalui composite FK fail-safe. Selaraskan runbook/crosswalk untuk bukti transfer, rekening refund, batas notice check-out, fitur P0 vs backlog, batas klaim escrow, dan akses server-side. | Backend/UI implementation, file/payment proof storage, bank details, 30-day minimum policy, auto-notifications, physical escrow/bank reconciliation, Neon, .env.local | npx prisma validate dengan URL sintetis; terapkan semua migration pada PGlite (lewati hanya exclusion GiST); uji migration fail-safe untuk request lama mismatch tanpa schema residue; uji pemilik Lease dapat membuat request dan Tenant lain ditolak; verifikasi 26 ID runbook/crosswalk lengkap dan skenario/crosswalk selaras scope; git diff --check. Catat output mentah task ini saja; jangan apply ke Neon. | WF-10 SK-03/05/10/16/18/19/23/26; PRD REQ-01/03/05/07; FSD; M05 Data API; M06-DB-44. Approved: 2026-11-01 by zeenn. |
| [x] | M06-DB-46 | Audit cakupan data WF-11 pada lapisan DB | `docs/design/SCENARIOS_WF11.md`, `docs/design/SCENARIO_EVALUATION.md`, Prisma schema/migrations, PRD/FSD/M05 Data API, Scope Statement, `TODO.md` | M06-DB-45; Owner melanjutkan audit WF-11 2026-11-01 | Cocokkan 13 skenario formulir Tenant dengan Ticket, status/history, TicketAttachment, enum kategori/prioritas, dan guard lease aktif; pisahkan constraint DB, invariants server/RBAC, konflik runbook terhadap scope, serta backlog. | Perubahan schema/migration/backend, implementasi form, perluasan scope, Neon, `.env.local` | Verifikasi 13 ID runbook dan crosswalk unik/lengkap; audit kategori 6 kartu vs enum DB, SLA vs priority, izin masuk, kewajiban media dan batas unggah, hapus lampiran draft, kontak WhatsApp, sukses/riwayat tiket, serta isolasi lease/kamar. Catat gap dan rekomendasi DB serta batas backend/scope di Evidence; read-only selain TODO; jangan mengubah WF-11/crosswalk sebelum review. Jalankan Verify task ini saja dan `git diff --check`, lalu berhenti untuk review Owner. | WF-11 SK-01?13; PRD REQ-01/07; FSD F-07/SEC-05; M05 Data API; Frozen Scope. Approved: 2026-11-01 by zeenn.
| [~] | M06-DB-47 | Tegakkan submission ticket setelah media tersedia dan selaraskan kategori WF-11 | `prisma/schema.prisma`, `prisma/migrations/20261101430000_ticket_draft_category_enums/migration.sql`, `prisma/migrations/20261101440000_ticket_draft_media_submission/migration.sql`, `docs/specs/FSD.md`, `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`, `TODO.md` | M06-DB-46; Owner melanjutkan perbaikan temuan WF-11 2026-11-01 | Pisahkan Ticket DRAFT dari tiket terkirim; DB hanya mengizinkan DRAFT menjadi RECEIVED bila ada minimal satu TicketAttachment AVAILABLE pada akhir transaksi. Izinkan Tenant mengirim/membuang draft miliknya; Owner/Staff dapat mengelola sesuai guard role. Tambah kategori DOORS_LOCKS agar enam kategori runbook terwakili. | Backend/UI flow, verifikasi byte objek (tetap server), SLA/izin masuk/WhatsApp, Neon, `.env.local` | Prisma validate dengan URL sintetis; semua migration pada PGlite disposable (lewati hanya exclusion GiST); existing tickets tetap valid; uji create DRAFT, submit ditolak tanpa AVAILABLE/PENDING_UPLOAD/FAILED/DELETED, submit lolos dengan AVAILABLE, Tenant hanya submit/batalkan draft sendiri, Owner/Staff submit dan cancel, event history, kategori DOORS_LOCKS, seed sintetis bila relevan; git diff --check. Catat output mentah task ini saja; jangan implementasi backend atau apply ke Neon. | WF-11 SK-02/05/06/07/09/13; PRD REQ-07; FSD F-07/SEC-05; M05 Data API; M06-DB-46.

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


### Layanan domain dan operasi server

| Status | ID task | Tujuan | File | Prasyarat | Tindakan | Di luar cakupan | Verifikasi / ekspektasi | Sumber |
|---|---|---|---|---|---|---|---|---|
| [ ] | M06-BE-01 | Validasi input dan error domain bersama | `src/lib/validation/`, `src/lib/errors/` | M06-SETUP-04 | Terapkan schema ketat dan pemetaan error tanpa detail SQL/provider. | Validasi client sebagai kontrol keamanan | `npm run test -- validation`; payload invalid menghasilkan error stabil dan tidak memuat detail internal. | FSD §3; DATA/API §5 |
| [ ] | M06-BE-02 | Operasi kamar | `src/actions/rooms.ts`, `src/lib/rooms/` | M06-DB-20, M06-SETUP-08 | `createRoom`/`updateRoom` dengan izin Owner, validasi pasangan dimensi, dan update status Staff sesuai matriks. | Penghapusan histori kamar | `npm run test -- rooms`; duplicate code/in-use conflict dan dimensi parsial/nonpositif ditolak. | REQ-02; `createRoom`, `updateRoom` |
| [ ] | M06-BE-03 | Profil Tenant dan siklus kontrak/check-out | `src/actions/leases.ts`, `src/lib/leases/` | M06-DB-04/05 | Buat Lease + invoice awal atomik; cek overlap; request check-out Tenant dan end/reconcile oleh Owner. | Banyak Tenant/kamar, auto-refund | `npm run test -- leases`; overlap ditolak, role dan tanggal diverifikasi. | REQ-03; `createLease`, `requestLeaseEnd`, `endLease` |
| [ ] | M06-BE-04 | Mesin invoice awal dan prorata | `src/lib/billing/initial-invoice.ts` | M06-DB-06/07 | Implementasi dua mode billing, prorata inklusif, pembulatan ribuan, line deposit terpisah. | Denda/utilitas | `npm run test -- initial-invoice`; boundary tanggal dan contoh WF-05 cocok. | REQ-04; DATA/API §2 |
| [ ] | M06-BE-05 | Scheduler invoice idempotent | `src/actions/invoices.ts`, `src/lib/billing/generate-invoices.ts` | M06-BE-04, M06-DB-06 | Implementasikan generator harian Asia/Jakarta, key lease/periode/kind, audit sumber/rerun. | Cron lebih sering dari harian | `npm run test -- generate-invoices`; dua kali proses memberi satu invoice dan mencatat duplikat. | REQ-04.3; `runInvoiceGeneration` |
| [ ] | M06-BE-06 | Penyampaian dan pembacaan invoice | `src/actions/invoices.ts` | M06-DB-06/07, M06-SETUP-08 | Daftar/detail invoice dan penandaan penyampaian manual dengan ownership check. | Pengiriman WhatsApp/email | `npm run test -- invoices`; role dan kepemilikan sesuai matrix. | REQ-04; `markInvoiceDelivered` |
| [ ] | M06-BE-07 | Pencatatan klaim pembayaran | `src/actions/payments.ts` | M06-DB-08, M06-SETUP-08 | Buat payment PENDING oleh role yang diizinkan; cek kepemilikan Tenant, saldo, amount dan idempotency. | Bank sync, overpayment, bukti transfer | `npm run test -- payments-record`; klaim pending tidak mengubah saldo; overpayment ditolak. | REQ-05.1/05.2; `recordPayment` |
| [ ] | M06-BE-08 | Verifikasi, alokasi, reversal pembayaran | `src/actions/payments.ts`, `src/lib/payments/` | M06-DB-09–11 | Transaksi atomik Owner-only: sewa lebih dahulu lalu deposit, audit event, saldo turunan, reversal penuh dengan alasan. | Verifikasi oleh Staff atau self-approval Staff | `npm run test -- payment-ledger`; retry tidak menggandakan saldo, saldo/escrow invariant tetap benar. | REQ-05.2–05.4; verify/reject/reverse |
| [ ] | M06-BE-09 | Settlement dan rekonsiliasi deposit | `src/actions/deposits.ts`, `src/lib/deposits/` | M06-DB-10 | Settlement ke invoice rent dan rekonsiliasi checkout/refund manual dengan saldo dan alasan. | Transfer uang, detail rekening, refund surplus umum | `npm run test -- deposits`; saldo negatif/settlement melebihi saldo ditolak. | REQ-03.3/05.4; DATA/API §5 |
| [ ] | M06-BE-10 | Expense, pagu bulanan, dan laporan Owner-only | `src/actions/expenses.ts`, `src/actions/reports.ts` | M06-DB-12, M06-DB-21, M06-SETUP-08 | Catat expense; Owner mengatur pagu per bulan; agregasikan pemasukan/pengeluaran/okupansi dan perbandingan realisasi terhadap pagu hanya untuk Owner. Audit setiap perubahan pagu. | Laporan akuntansi/pajak/ekspor, kategori budget, nilai default | `npm run test -- reports`; Staff/Tenant ditolak, pagu kosong tidak dianggap nol, expense bulanan dibandingkan dengan pagu bulan yang sama. | REQ-06; `recordExpense`, `setOperatingBudget`, `getFinancialReport` |
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
| [ ] | M06-FE-10 | Metric summary card | `src/components/dashboard/metric-card.tsx` | M06-FE-02–04, M06-BE-10 | Port metrik dashboard P0 termasuk gauge pengeluaran terhadap pagu bulanan untuk Owner; tampilkan state belum diatur tanpa nilai fixture/default. | Menampilkan angka ke Staff/Tenant atau memperlakukan fixture sebagai nilai produk | `npm run test -- metric-card`; nilai dan state bersumber dari laporan Owner, angka finansial tak dikirim ke role lain. | CMP-09; CR-2026-001 |
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
| [ ] | M06-FE-25 | SCR-02 `/dashboard` | `src/app/dashboard/page.tsx` | M06-FE-09–15, M06-BE-10 | Port dashboard sesuai data dan role; tampilkan gauge pagu/realisasi bulanan Owner-only termasuk state belum diatur. | Route probe 200/307 untuk Owner dan Staff; Staff response tanpa laporan finansial atau pagu. | SCR-02; REQ-02/06; CR-2026-001 |
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
| [ ] | M06-FE-37 | SCR-13 `/laporan` | `src/app/laporan/page.tsx` | M06-BE-10, M06-SETUP-08 | Port laporan pemasukan/pengeluaran/okupansi Owner-only dan form set/update pagu bulanan. | Route probe Owner 200; Staff/Tenant ditolak tanpa payload laporan/pagu. | SCR-13; REQ-06.2; CR-2026-001 |
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
EXIT_CODE=0
```

Audit ini tidak mengubah schema atau BE dan tidak menyentuh Neon. M06-DB-24 tetap menunggu review Owner; M06-DB-25 juga menunggu review. Beberapa keputusan field dan archive enforcement di atas harus diselesaikan sebelum seluruh kebutuhan data WF-03 dapat disebut selesai.


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
