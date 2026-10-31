# Status Proyek — Sistem Manajemen Kost Mandiri

## 1. Metadata

- **Project Name**: Sistem Manajemen Kost Mandiri
- **Current Active Module**: M05 · Architecture & Technical Specifications (IN PROGRESS; stack recommendation prepared, owner lock pending)
- **Scale**: medium (7 P0 groups; single-property MVP frozen; implementation planning pending)
- **Delivery**: portfolio
- **Lifecycle Path**: Portfolio / Medium+
- **Primary Tech Stack**: Next.js App Router, TypeScript, PostgreSQL/Prisma on Neon Free, Neon Auth/Object Storage beta, Vercel Hobby
- **Project Language**: Indonesian
- **Last Active Session Date**: 2026-10-30
- **Session Operator**: Solo developer dibantu AI

### 1.1 Intake Gate

```text
- Delivery: portfolio
- Intake-Success-Metric: Dalam demo, satu pengguna dapat menyelesaikan 6 alur utama tanpa mengubah database secara manual: mengatur kamar, membuat kontrak penghuni, menerbitkan tagihan, mencatat pembayaran, mencatat pengeluaran, dan menindaklanjuti laporan kerusakan.
- Intake-P0-Features: 7 (login dan hak akses pemilik/staf; manajemen kamar; data penghuni dan siklus kontrak; tagihan berulang; pencatatan pembayaran termasuk pembayaran sebagian dan riwayat; pengeluaran dan laporan pemasukan/okupansi; laporan kerusakan dan tindak lanjut)
- Intake-Non-Features: marketplace pencarian kost; aplikasi khusus penghuni; payment gateway; pengingat WhatsApp otomatis; banyak properti
- Intake-Time-Capacity: 12 jam/minggu x 18 minggu = 216 jam
- Intake-Sensitive-Data: yes (akun, nama/kontak, kontrak, catatan pembayaran, media tiket; NIK/foto KTP tidak masuk MVP; demo sintetis saja)
- Intake-Integrations: none
- Intake-Branch-Hierarchy: no
- Intake-Compliance: baseline privacy (UU PDP); formal assurance: none
- Intake-Legacy-Core: no
- Intake-Status: ANSWERED
```

## 2. Status Fase dan Gate

**Active Gate Status (2026-10-30): M00 WAIVED, M01 PASSED, M02 PASSED after schedule reconciliation, M03 WAIVED, and M04 PASSED after human Design Freeze approval. M05 passed with human technical sign-off on 2026-10-31; M06 planning is active.**

| Module | Nama | Status | Catatan |
|---|---|---|---|
| M00 | Product Research & Discovery | WAIVED · GATE PASSED (2026-10-30) | Jalur portfolio membebaskan gate riset penuh. Sepuluh wawancara kualitatif yang tercatat mendukung mitigasi M01, bukan validasi pasar skala luas. |
| M01 | Idea Feasibility | CONDITIONAL_GO · GATE PASSED (2026-10-30) | Validator lulus dengan exit code 0; skor rata-rata 3.50 dan mitigasi CONDITIONAL_GO tercatat. |
| M02 | Scope Definition & Freeze | GATE PASSED (2026-10-30; BASELINE 2026-10-22, JADWAL DIPERBARUI 2026-10-30) | Validator lulus; baseline tetap 7 P0/22 Story. Arahan pemilik menyelaraskan tujuh P0 ke M04. Estimasi 186–245 jam; jadwal direvisi menjadi 21 minggu/252 jam (12 jam/minggu), batas atas tertampung dengan sisa 7 jam tanpa perubahan scope. |
| M03 | Legal, SOW & Client Data Protection | WAIVED · GATE PASSED (2026-10-30) | Proyek portfolio/internal; SOW komersial tidak berlaku. Charter solo tetap rekomendasi opsional. |
| M04 | UI/UX & Prototyping | GATE PASSED (2026-10-30) | Pemilik menyetujui Design Freeze melalui chat; `zeenn` dicatat sebagai approver pada `docs/specs/DESIGN_SPEC.md`. UI/UX audit lulus dengan 0 violation dan 48 advisory; delapan dropdown form memakai popover kustom. Evaluasi 613 skenario memetakan 498 kandidat P0 dan 115 backlog/out-of-scope; enam walkthrough E2E telah diselaraskan sebagai acceptance criteria yang belum dieksekusi. Technical sign-off M05 masih menunggu review manusia. |
| M05 | Architecture & Technical Specifications | GATE PASSED (2026-10-31) | Draf ERD/API dan perbandingan stack diperbarui dengan dokumentasi resmi 2026-10-30. Tech Stack Lock Opsi A: Next.js 16.4.3, TypeScript/CSS prototipe, PostgreSQL/Prisma di Neon Free, Neon Auth/Object Storage (beta), dan Vercel Hobby. Pemilik `zeenn` mengunci Opsi A pada 2026-10-30; signup Vercel Hobby tanpa kartu berhasil menurut konfirmasi pemilik, Neon Auth/Object Storage beta diterima untuk demo non-komersial. Draf PRD/FSD dan security blueprint sudah tersedia; keputusan domain operasional dikonfirmasi Owner pada 2026-10-30; review teknis dan technical sign-off disetujui `zeenn` pada 2026-10-31. Kapabilitas Vercel Cron harian dan Neon Free PITR sudah diteliti dari dokumentasi resmi. |

## 3. Asumsi Aktif

| ID | Hipotesis | Keyakinan | Cara validasi | Hasil saat ini |
|---|---|---|---|---|
| ASM-01 | Pengelola mengalami friksi pencatatan pembayaran/tagihan dan keluhan maintenance. | ✅ Sampel | 10 wawancara nyata; lihat USER_RESEARCH_REPORT.md. | Didukung dalam sampel kecil; frekuensi pasar belum diketahui. |
| ASM-02 | Billing, maintenance ticketing, dan pelaporan sederhana mendukung tujuan portfolio. | 🔶 Asumsi | Validasi demo dan task breakdown. | Tujuh P0 Medium dibekukan; fixture sintetis hanya untuk data alur inti. Batas media: foto maks. 4 MB, video maks. 12 MB/30 detik, total 40 MB/tiket. |
| ASM-03 | Tujuh P0 Medium satu properti dapat diselesaikan dalam kapasitas yang disetujui. | 🔶 Mitigasi diterapkan | Estimasi Story dan jadwal dibandingkan setelah rekonsiliasi escrow/billing. | Jadwal M02 diperbarui atas arahan pemilik 2026-10-30 menjadi 21 minggu/252 jam; estimasi 186–245 jam tertampung tanpa perubahan scope. |
| ASM-04 | Storage privat dan retensi media tiket memadai untuk demo. | 🔶 Asumsi | Tentukan provider, biaya, format, akses, dan retensi teks pada M05. | Rancangan media tiket: private object storage, local hanya dev, tanpa CDN MVP, prune 365 hari setelah close. Skenario media 20 kamar ≈1,1 GB/tahun rata-rata, batas ≈4,8 GB/tahun. |

## 4. Blocker dan Keputusan

- [x] **Kapasitas:** intake awal 18 minggu/216 jam. Atas arahan pemilik pada 2026-10-30, jadwal implementasi direvisi menjadi 21 minggu/252 jam untuk menampung estimasi maksimum 245 jam.
- [x] **Validasi pengguna:** sepuluh wawancara nyata dicatat pada USER_RESEARCH_REPORT.md; tanggal INT-10 dikoreksi menjadi rentang 20–21 Oktober (hari tunggal belum dipastikan). Hasil tetap kualitatif.
- [x] **Keputusan batas properti:** satu properti dan tujuh P0 Medium ditetapkan untuk MVP; fitur lain ada di backlog versi berikutnya.
- [x] **Prioritas scope terbaru:** semua P0 berjumlah tujuh; P1/P2 dipindahkan ke versi berikutnya dan tidak masuk estimasi MVP.
- [x] **Data demo:** nama/kontak, kontrak, tagihan/pembayaran, serta tiket/media menggunakan fixture sintetis; NIK/KTP, detail rekening, dan bukti transfer dikeluarkan dari MVP.
- [x] **Rancangan media/storage:** foto maks. 4 MB, video maks. 12 MB/30 detik, maksimal 4 foto + 1 video per kiriman, akumulasi 40 MB/tiket; hapus media 365 hari setelah tiket ditutup sesuai rancangan.
- [x] **Estimasi baseline pra-M04:** 174–232 jam. **Estimasi pasca-rekonsiliasi M04:** 186–245 jam; jadwal diperbarui atas arahan pemilik menjadi 21 minggu/252 jam.
- [x] **Scope lock:** pemilik menetapkan ulang dan menyetujui tujuh P0/Medium satu properti pada 2026-10-22; keputusan ini menggantikan baseline Large.
- [x] **M02 gate:** breakdown 22 Story disusun dan jumlah estimasi anak cocok dengan estimasi ketujuh Epic; validator M02 lulus pada 2026-10-22 dan dijalankan ulang setelah revisi jadwal pada 2026-10-30 (exit code 0).
- [x] **Riwayat jadwal:** jadwal awal 20 minggu/240 jam disetujui pada 2026-10-22. Atas arahan pemilik pada 2026-10-30, jadwal diperbarui menjadi 21 minggu × 12 jam/minggu = 252 jam.
- [x] **Review gate M01 pasca-pembaruan:** validator dijalankan ulang pada 2026-10-22 setelah bukti wawancara diperbarui; keputusan CONDITIONAL_GO tetap lulus (exit code 0).
- [x] **Referensi desain M04:** 5 gambar referensi resolusi tinggi (flat dashboard, perspektif, mobile, typography Poppins, dan logo) tersimpan di `docs/design/inspiration/`. Bedah visual terdokumentasi di `SOURCES.md`. Logo Kunci Rumah (Concept C) tetap menjadi identitas brand.
- [x] **Master E2E Walkthrough:** 6 alur demonstrasi end-to-end lintas peran (Pemilik, Staf, Penghuni) dibakukan di `docs/design/SCENARIOS_E2E_WALKTHROUGH.md`.

## 5. Aksi Berikutnya

Susun TODO M06 satu-ke-satu dengan sitemap, requirement, tabel, dan mesin domain; minta pemilik memvalidasi cakupannya sebelum implementasi dimulai.
