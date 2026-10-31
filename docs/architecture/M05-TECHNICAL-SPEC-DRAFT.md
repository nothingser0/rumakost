# Draft Spesifikasi Teknis M05 — RumaKost

> Status: Tech Stack Lock disetujui pemilik pada 2026-10-30 (`zeenn`). Signup Vercel Hobby tanpa kartu dikonfirmasi pemilik; Neon Auth/Object Storage beta diterima untuk demo portfolio non-komersial. M05 tetap berjalan untuk melengkapi spesifikasi teknis sebelum implementasi. Baseline mengikuti MVP satu properti dan tujuh P0 di `docs/pm/SCOPE_STATEMENT.md`.

## Asumsi yang dipakai

1. Produk adalah aplikasi web responsif, bukan aplikasi native.
2. Targetnya demo portfolio non-komersial dengan biaya hosting serendah mungkin; tidak ada SLA produksi.
3. Satu aplikasi melayani Owner, Staff, dan Penghuni dengan otorisasi ditegakkan di server.
4. PostgreSQL dan Prisma adalah arah awal yang dicatat di `PROJECT_STATE.md`, tetapi belum disetujui sebagai keputusan final.
5. Seluruh data demo dan lampiran bersifat sintetis. Dokumen identitas, detail rekening, dan bukti transfer tidak masuk MVP. Detail rekening refund yang muncul pada skenario check-out M04 tetap dikecualikan oleh batas privasi M02; aplikasi hanya melacak refund manual.
6. Media tiket berada di object storage privat. Batas unggah dan retensi mengikuti scope: foto 4 MB, video 12 MB/30 detik, maksimal 4 foto + 1 video per kiriman, 40 MB per tiket, dihapus 365 hari setelah tiket ditutup.
7. M04 menjadi sumber perilaku layar dan alur untuk fitur dalam tujuh P0. Skenario M04 yang menambahkan kapabilitas di luar tujuh P0 (misalnya izin tamu, renewal mandiri, akun teknisi, OTP/2FA, rating, diskon tahunan, dan notifikasi WhatsApp otomatis) tetap backlog/out-of-scope sesuai M02.

## Objective dan batas produk

Bangun fondasi teknis untuk demo RumaKost yang mendukung enam alur utama tanpa edit database manual: mengatur kamar, membuat kontrak penghuni, menerbitkan tagihan, mencatat dan memverifikasi pembayaran, mencatat pengeluaran, serta menindaklanjuti tiket kerusakan.

MVP mencakup F-01 sampai F-07 saja. Owner/Staff berizin membuat kontrak; Penghuni mengajukan check-out; Owner menginspeksi, mengakhiri kontrak, dan menyetujui rekonsiliasi deposit. Billing check-in mengikuti dua mode WF-04: prorata sampai akhir bulan atau satu bulan penuh pada siklus tanggal masuk. Deposit escrow termasuk dalam alur check-in, invoice pertama, saldo, settlement, dan rekonsiliasi check-out. Pembayaran/refund dicatat manual; aplikasi tidak mentransfer uang atau mengambil mutasi bank. Hanya verifikasi Owner mengurangi saldo invoice. Penghuni hanya mengakses data miliknya. Catatan internal Staff/Owner pada tiket tidak boleh terlihat oleh Penghuni.

## Opsi stack M05 (Opsi A dikunci)

| Opsi | Rangkaian | Kelebihan | Risiko dan batas |
|---|---|---|---|
| **A - Dipilih dan dikunci** | Next.js App Router + TypeScript + CSS prototipe; PostgreSQL/Prisma di Neon Free; Vercel Hobby; Neon Object Storage privat. | Mempertahankan baseline PostgreSQL/Prisma; Vercel Hobby mendukung proyek personal/non-komersial. Neon Free menyatakan tanpa kartu; kuota terbaru mencantumkan 1 GB Postgres dan 5 GB storage. | Pemilik mengonfirmasi pendaftaran Vercel Hobby berhasil tanpa kartu. Neon Object Storage dan Neon Auth masih beta; risiko beta diterima khusus untuk demo portfolio non-komersial. |
| **B - Hindari Vercel** | Next.js melalui Cloudflare Workers; PostgreSQL/Prisma Neon Free; storage privat Neon. | Menghindari ketergantungan deployment pada Vercel; Neon Free tanpa kartu dan kuotanya lebih cocok untuk proyeksi media daripada Supabase Storage Free. | Untuk aplikasi Next baru, Cloudflare merekomendasikan vinext, yang mengimplementasikan ulang API Next; OpenNext tersedia tetapi memiliki batas runtime. Opsi ini tidak dipilih karena kompatibilitas Next.js menjadi batas tambahan untuk demo. |
| **C - Backend terkelola satu vendor** | Next.js + Vercel Hobby + Supabase Free (PostgreSQL, Auth, Storage). | Auth, database, dan storage dikelola dalam satu tempat; jalur Next standar. | Free mencantumkan 500 MB database dan 1 GB file storage; proyeksi media 1,1 GB/tahun melewati storage. Opsi ini tidak dipilih karena batas storage lebih kecil dari proyeksi media dan memerlukan vendor tambahan. |

**Keputusan pemilik:** Opsi A dikunci. Pemilik melaporkan signup Vercel Hobby berhasil tanpa kartu pada 2026-10-30 dan menerima Neon Auth/Object Storage beta untuk demo portfolio. Batas biaya tetap nol: jangan menambahkan metode pembayaran atau mengaktifkan layanan berbayar. Jika kebijakan provider berubah dan kartu/biaya diwajibkan, hentikan penggunaan dan evaluasi ulang Opsi B/C.

### Bukti dan verifikasi terkini (2026-10-30)

- Pemeriksaan registry dari lifecycle skill (`check-package-versions.ps1 -Framework nextjs`) mengambil Next.js 16.4.3, React/React DOM 19.3.1, Tailwind CSS 4.3.3, Zod 4.6.7, React Hook Form 7.91.0, dan `@supabase/ssr` 0.12.7 dari registry. Skrip memberi peringatan kompatibilitas dan merekomendasikan Tailwind 3.4.17/Zod 3.23.8 untuk konfigurasi tertentu. Karena UI memakai CSS prototipe, Tailwind belum diperlukan untuk dikunci.
- Neon menyatakan signup Free tanpa kartu. Pengumuman 2 Oktober 2026 mencantumkan 1 GB Postgres, 100 CU-hours/bulan, dan 5 GB Object Storage per proyek. [Neon Free Plan tanpa kartu](https://neon.com/blog/making-pricing-more-predictable), [kuota Neon Free terbaru](https://neon.com/blog/neon-free-plan-1-gb-per-project).
- Neon mengumumkan Object Storage dan backend primitives terkait dalam beta; harga GA belum diumumkan. [Status beta Neon](https://neon.com/blog/neon-backend-is-beta).
- Bucket Neon mendukung akses privat dan presigned URL singkat; implementasi harus menandatangani URL di server setelah pemeriksaan role/kepemilikan. [Contoh bucket privat dan URL singkat](https://neon.com/blog/building-a-private-searchable-photo-library-on-the-neon-backend).
- Vercel Hobby gratis untuk penggunaan personal/non-komersial. Panduan signup mendukung email atau Git provider, tetapi sumber resmi terkini yang diperiksa tidak memastikan apakah kartu diminta saat onboarding. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [cara signup Vercel](https://vercel.com/docs/accounts).
- Cloudflare merekomendasikan vinext untuk aplikasi Next.js baru di Workers; OpenNext tetap tersedia untuk kompatibilitas tertentu. [Panduan resmi Next.js di Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).
- Supabase Free mencantumkan 500 MB database dan 1 GB storage, serta proyek dapat dijeda menurut aturan free plan. [Kuota Free Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase).

### Delapan keputusan stack (Tech Stack Lock)

| # | Keputusan | Baseline yang diusulkan | Status |
|---:|---|---|---|
| 1 | Platform produk | Web responsif; satu properti, tiga role; tanpa aplikasi native. | Dikonfirmasi dari scope |
| 2 | Framework/runtime | Next.js App Router 16.4.3 + Node.js LTS saat implementasi. | DIKUNCI oleh zeenn (2026-10-30) |
| 3 | Bahasa dan UI | TypeScript; token CSS dan komponen dari prototipe; tanpa utility CSS sampai ada kebutuhan. | DIKUNCI oleh zeenn (2026-10-30) |
| 4 | Database | PostgreSQL pada Neon Free; 1 GB/project. | DIKUNCI oleh zeenn (2026-10-30) |
| 5 | ORM/migrasi | Prisma; koneksi pooled untuk runtime dan direct untuk migrasi jika didukung provider. | DIKUNCI oleh zeenn (2026-10-30) |
| 6 | Auth/session | Neon Auth managed; sesi dikelola melalui integrasi server-side dan cookie aman. Neon Auth masih beta. | DIKUNCI oleh zeenn (2026-10-30); risiko beta diterima untuk demo |
| 7 | File/media | Neon Object Storage private bucket dengan presigned URL singkat; batas kuota dan beta diterima. | DIKUNCI oleh zeenn (2026-10-30); risiko beta diterima untuk demo |
| 8 | Hosting dan verifikasi | Vercel Hobby untuk demo portfolio non-komersial; npm/Playwright. | DIKUNCI oleh zeenn (2026-10-30); pemilik mengonfirmasi signup berhasil tanpa kartu |

**Tech Stack Lock:** Opsi A disetujui oleh `zeenn` pada 2026-10-30. Verifikasi signup tanpa kartu berdasarkan konfirmasi pemilik. Syarat biaya nol tetap batas mutlak; kuota internal media demo dibatasi dan hanya memakai fixture sintetis.

## Arsitektur aplikasi yang diusulkan

Gunakan **modular monolith**: satu aplikasi Next.js, satu database PostgreSQL, dan satu bucket privat. Hindari microservices dan integrasi eksternal yang tidak diperlukan untuk satu properti demo.

```mermaid
flowchart LR
  B[Browser: Owner / Staff / Penghuni] --> W[Next.js App Router]
  W --> A[Auth terkelola + sesi]
  W --> D[Server-side authorization / domain]
  D --> P[(PostgreSQL)]
  D --> R[Neon private Object Storage (beta)]
  W -->|signed upload/download singkat setelah otorisasi| R
```

Prinsip batas:

- Server Components membaca data langsung melalui lapisan akses data; jangan memanggil API aplikasi sendiri untuk pengambilan data server-side.
- Mutasi dilakukan melalui Server Actions atau Route Handlers yang memverifikasi sesi, role, dan kepemilikan. Semua Route Handlers diperlakukan sebagai endpoint publik.
- Data finansial memakai tipe presisi (`NUMERIC`/Decimal), tidak menggunakan floating point. Verifikasi pembayaran dan perubahan saldo harus atomik dan idempotent.
- File tidak pernah memakai bucket publik. Server memeriksa izin tiket sebelum membuat signed URL; URL berumur singkat. Penghapusan media terjadwal berdasarkan tanggal penutupan tiket.
- Kegagalan mengunggah file tidak boleh meninggalkan tiket tanpa lampiran wajib. Object yang terunggah tetapi gagal dikaitkan ke tiket masuk antrean pembersihan.

## Model data tingkat domain

Rancangan awal entitas: `User`, `Room`, `TenantProfile`, `Lease`, `Invoice`, `InvoiceLine`, `Payment`, `PaymentAllocation`, `DepositLedgerEntry`, `PaymentReversal`, `Expense`, `Ticket`, `TicketComment`, `TicketAttachment`, dan `AuditEvent`. Detail kolom, kardinalitas, indeks, constraint, enum status, soft-delete, dan aturan retensi ada di draft ERD/API.

Draft ERD logis, constraint per entitas, matriks izin, dan kontrak operasi tersedia di [M05-DATA-API-SPEC-DRAFT.md](M05-DATA-API-SPEC-DRAFT.md).

Invarian yang harus ditegakkan oleh database dan domain:

- Satu properti pada MVP; satu kamar tidak boleh memiliki dua kontrak aktif yang periodenya bertabrakan.
- Check-in menyimpan satu dari dua billing mode M04: prorata hingga akhir bulan atau sewa satu bulan penuh pada siklus tanggal masuk.
- Invoice pertama memisahkan line sewa dan deposit; saldo escrow dihitung dari ledger, tidak dicampur dengan pendapatan sewa.
- Settlement escrow dan rekonsiliasi checkout menjaga saldo non-negatif, audit trail immutable, dan tidak membuat penerimaan kas palsu.
- Satu invoice otomatis per lease/periode/mode; penerbitan ulang idempotent.
- Pembayaran pending tidak mengurangi saldo. Pembayaran terverifikasi Owner mengurangi saldo tepat satu kali.
- Transaksi terverifikasi tidak dihapus; koreksi melalui reversal dengan alasan dan audit event.
- Penghuni hanya membaca invoice, kontrak, dan tiket miliknya; lampiran mengikuti otorisasi tiket.
- Komentar internal hanya dapat dibaca Owner/Staff.

## Kontrak API dan operasi

Karena browser dan backend berada dalam satu aplikasi, gunakan Server Actions untuk mutasi UI internal dan Route Handlers hanya untuk kebutuhan yang memerlukan endpoint HTTP langsung (misalnya pembuatan upload URL, callback, atau health check). Spesifikasi M05 final tetap mendokumentasikan input, output, role yang diizinkan, validasi, efek samping, dan error tiap operasi.

Operasi minimum: login/logout/aktivasi akun; CRUD kamar; profil penghuni, pembuatan kontrak oleh Owner/Staff, pengajuan check-out oleh Penghuni, serta terminasi/rekonsiliasi oleh Owner; penerbitan invoice dengan billing mode M04; pencatatan, alokasi, verifikasi, penolakan, reversal, dan settlement deposit; pengeluaran dan laporan ringkas dengan escrow terpisah; pembuatan tiket, komentar, perubahan status/prioritas/penanggung jawab; unggah, akses, dan penghapusan media.

## Media privat

- Validasi MIME nyata, ekstensi, ukuran, durasi video, jumlah file, dan kuota tiket di server; jangan percaya validasi browser.
- Tetapkan kunci objek acak yang tidak memuat nama/email penghuni. Metadata relasional tetap di PostgreSQL.
- Akses file lewat server setelah pemeriksaan role dan kepemilikan, kemudian signed URL singkat.
- Terapkan batas file: JPEG/PNG/WebP dan MP4/MOV sesuai persetujuan Owner 2026-10-30; validasi signature, konten, dan MIME dilakukan di server.
- Hapus objek 365 hari setelah tiket ditutup; tiket dibuka kembali memulai ulang hitungan setelah penutupan berikutnya. Teks tiket mengikuti kebijakan retensi terpisah.
- Simpan status upload dan waktu penghapusan yang direncanakan agar retry penghapusan aman dan dapat diaudit.

## Perintah, struktur repo, gaya, dan strategi verifikasi

Repo saat ini berisi dokumen dan prototipe HTML, belum memiliki source aplikasi. Perintah build/dev/lint/migrate dan struktur folder final harus ditetapkan setelah stack lock. Draft awal struktur:

```text
src/app/                 Routes, layouts, Server Actions, Route Handlers
src/modules/             Modul domain kamar, kontrak, billing, pembayaran, laporan, tiket
src/server/              Auth, akses data, otorisasi, storage adapter
prisma/                  Schema dan migrations (bila Prisma dipilih)
docs/architecture/       Spesifikasi, ERD, kontrak API, keputusan arsitektur
```

Gaya kode usulan: domain functions menerima nilai eksplisit, tidak membaca request/global state, dan mengembalikan hasil terketik; setiap Server Action/Route Handler melakukan autentikasi dan otorisasi sebelum memanggil domain logic.

```ts
type Money = string; // decimal string pada boundary API; Decimal di domain/database

type VerifyPaymentInput = {
  paymentId: string;
  decision: "verify" | "reject";
  reason?: string;
};
```

Perintah target setelah package scripts dibuat (saat ini belum dapat dijalankan karena source app belum ada):

```text
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npx playwright test
npx prisma migrate dev
npx prisma db seed
```

Strategi verifikasi yang diusulkan: unit test untuk aturan domain finansial/status; integration test dengan PostgreSQL untuk transaksi, uniqueness, dan otorisasi; E2E Playwright lintas role berdasarkan enam acceptance walkthrough M04?M05 (belum dieksekusi); pemeriksaan akses signed URL serta retensi objek. Jalankan browser context terpisah per role dan test denial untuk tiap data tenant/Staff. Tidak ada test yang dijalankan pada tahap spesifikasi.

## Batas perubahan

- **Selalu:** server-side authorization; data demo sintetis; validasi server; Decimal untuk uang; migrasi terkontrol; private media; audit perubahan finansial.
- **Perlu persetujuan sebelum mengubah:** tujuh kelompok P0, data sensitif, integrasi provider berbayar, penambahan P1/P2, kebijakan finansial yang belum diputuskan.
- **Jangan:** simpan token sesi di `localStorage`; publikasikan bucket lampiran; gunakan data penghuni nyata; masukkan secret ke repo; menambah marketplace/payment gateway/otomasi WhatsApp ke MVP.

## Kriteria selesai M05

- [x] Pemilik menyetujui Tech Stack Lock Opsi A pada 2026-10-30 (`zeenn`): framework/runtime, database/ORM, auth/session, hosting, storage, UI approach, dan tooling dasar. Strategi environment/secret masih perlu dirinci.
- [x] Keputusan model ancaman, trust boundaries, matriks RBAC, sesi, rate limit, audit log, dan strategi backup/restore tertulis; restore drill dijadwalkan pada M07.
- [ ] ERD dan constraint mencakup F-01–F-07 serta invarian pembayaran dan kontrak.
- [x] Kontrak operasi mencatat role, input/output, error, dan efek samping.
- [x] Alur media privat mencakup upload, pemeriksaan akses, signed URLs, orphan cleanup, dan retensi 365 hari.
- [x] Seluruh 613 heading skenario M04 dipetakan sebagai kandidat MVP ber-REQ atau backlog/out-of-scope; enam alur E2E dihitung terpisah. Pemetaan masih menunggu technical sign-off pemilik.
- [x] Keputusan bisnis yang memengaruhi schema dan saldo telah dijawab atau secara eksplisit dikeluarkan dari MVP pada 2026-10-30.
- [ ] Commands, project structure, dan testing strategy menjadi executable saat scaffold M06; strategi verifikasi sudah dirancang.
- [x] Pemilik mengonfirmasi signup Vercel Hobby berhasil tanpa kartu pada 2026-10-30. Kuota usage dan perilaku fail-closed dirancang dalam FSD; implementasi dilakukan saat M06.

## Keputusan terkonfirmasi dan item teknis tersisa

1. **Alokasi pembayaran parsial (disetujui Owner, 2026-10-30):** line sewa lebih dahulu, lalu deposit; saldo escrow hanya bertambah dari alokasi deposit yang terverifikasi.
2. **Seed Staff (disetujui Owner, 2026-10-30):** sertakan satu akun Staff sintetis agar ketiga role P0 dapat diuji; buat kredensial baru saat M07.
3. **Tenant pascakontrak (disetujui Owner, 2026-10-30):** akses baca hanya untuk histori sendiri; mutasi dan unggah baru dinonaktifkan.
4. **Format media (disetujui Owner, 2026-10-30):** foto JPEG/PNG/WebP dan video MP4/MOV; validasi konten di server.
5. **Operasi gratis (disetujui Owner, 2026-10-30):** scale-to-zero/tidur diterima untuk demo tanpa SLA; gunakan Vercel Hobby Cron sekali sehari dan Neon Free PITR 6 jam/1 GB.
6. **Item teknis scaffold:** versi Prisma dan SDK Neon Auth/Storage diverifikasi dan dipin saat scaffold melalui dokumentasi/registry terkini; ini pekerjaan implementasi, bukan keputusan domain Owner.

Tech Stack Lock Opsi A sudah disetujui `zeenn` pada 2026-10-30 dan signup tanpa kartu dikonfirmasi pemilik.
## Perintah yang masih TBD

`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:migrate`, dan `db:seed` akan ditetapkan bersama `package.json` saat scaffold aplikasi M06 dimulai; stack sudah dikunci.
