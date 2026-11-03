# Arsitektur RumaKost

## Topologi

RumaKost memakai modular monolith: satu aplikasi Next.js App Router di Vercel Hobby, satu PostgreSQL di Neon Free melalui Prisma, Better Auth yang berjalan di aplikasi dengan tabel identitas/sesi di Neon PostgreSQL, dan Neon Object Storage dengan bucket privat untuk media tiket. Keputusan Better Auth pada 2026-11-03 menggantikan Neon Auth managed untuk runtime aplikasi; rincian dan batas migrasi ada di ADR-003. Stack tetap untuk demo portfolio non-komersial dan tanpa upgrade berbayar. Vendor email untuk tautan aktivasi/reset belum dipilih; adapter server dan uji pengiriman live dicatat di task terkait M07. Tidak ada microservice, message broker, cache aplikasi, atau identity vendor tambahan dalam baseline.

```text
Browser Owner / Staff / Tenant
          │ HTTPS
          ▼
Next.js App Router ─── Better Auth
          │
          ├── Prisma ─── Neon PostgreSQL
          └── server-authorized media operations ─── Neon private Object Storage
```

## Batas kepercayaan

- Browser dan seluruh input klien tidak dipercaya. Server Actions dan Route Handlers mengautentikasi, memeriksa role, kepemilikan, validasi, serta state transition.
- Secret Better Auth, email adapter, dan koneksi database hanya berada di server. Password dikirim melalui HTTPS ke endpoint Better Auth dan hanya diproses untuk hashing; password mentah dan token tidak dicatat atau disimpan oleh domain aplikasi. Tenant hanya membaca data dan media miliknya; komentar internal hanya tersedia bagi Owner/Staff.
- Satu properti berarti isolasi multi-tenant database tidak menjadi kebutuhan MVP; pemeriksaan otorisasi aplikasi tetap wajib.
- Data uang memakai Prisma Decimal/PostgreSQL NUMERIC. Verifikasi pembayaran, alokasi, ledger deposit, reversal, invoice idempotent, dan audit event mengikuti transaksi/invariant FSD.
- Object storage privat. Server memeriksa otorisasi sebelum membuat signed URL singkat; object key acak tidak memuat PII.

## Batas modul

- `src/app/`: App Router, layout, halaman, Route Handlers, dan Server Actions yang dipisahkan sesuai pola Next.js terpasang.
- `src/lib/`: validasi environment, auth, otorisasi, akses data, aturan domain, audit, dan adapter storage.
- `prisma/`: schema, migrasi, dan seed sintetis yang idempotent.
- `docs/`: keputusan dan spesifikasi proyek; bukan runtime source.

Pertahankan rancangan sebagai modular monolith. Buat modul/domain hanya untuk batas yang tercatat di FSD: kamar, penghuni/kontrak, billing, pembayaran/deposit, pengeluaran/laporan, serta tiket/media.

## Operasi dan retensi

Cron Vercel paling banyak harian dan dapat bergeser; semua proses terjadwal harus idempotent serta memakai Bearer `CRON_SECRET`. Jika Cron atau batas provider gratis tidak memenuhi kebutuhan, hentikan otomasi terkait dan minta keputusan Owner. Media tiket dihapus 365 hari setelah tiket ditutup; cleanup dapat diulang dengan aman. Target backup/recovery dan batas kuota dirinci di `docs/specs/FSD.md`.

## Konfigurasi

Nama environment variable dan secret handling mengikuti FSD §5.2 dan `.env.example`. Runtime memakai URL Neon pooled; migrasi memakai `DIRECT_URL`. Aplikasi tidak boleh mengekspos variabel server ke browser. Detail implementasi ORM, provider, serta API hanya boleh mengikuti versi yang diverifikasi pada task dependency M06.
