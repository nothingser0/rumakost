# Status Proyek â€” Sistem Manajemen Kost Mandiri

## 1. Metadata

- **Project Name**: Sistem Manajemen Kost Mandiri
- **Current Active Module**: M06 · Development Execution (M06-SETUP-02 harness root awaiting owner review)
- **Scale**: medium (7 P0 groups; single-property MVP frozen; implementation planning pending)
- **Delivery**: portfolio
- **Lifecycle Path**: Portfolio / Medium+
- **Primary Tech Stack**: Next.js App Router, TypeScript, PostgreSQL/Prisma on Neon Free, Neon Auth/Object Storage beta, Vercel Hobby
- **Project Language**: Indonesian
- **Last Active Session Date**: 2026-10-31
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

**Status Gate (2026-10-31): M00 · Product Research & Discovery WAIVED, M01 · Idea Feasibility PASSED, M02 · Scope Definition & Freeze PASSED, M03 · Legal, SOW & Client Data Protection WAIVED, M04 · UI/UX & Prototyping PASSED, dan M05 · Architecture & Technical Specifications PASSED setelah technical sign-off pemilik. M06 · Development Execution aktif; scaffold disetujui pemilik dan task berikutnya adalah pemasangan harness root.**

| Module | Nama | Status | Catatan |
|---|---|---|---|
| M00 | Product Research & Discovery | WAIVED Â· GATE PASSED (2026-10-30) | Jalur portfolio membebaskan gate riset penuh. Sepuluh wawancara kualitatif yang tercatat mendukung mitigasi M01, bukan validasi pasar skala luas. |
| M01 | Idea Feasibility | CONDITIONAL_GO Â· GATE PASSED (2026-10-30) | Validator lulus dengan exit code 0; skor rata-rata 3.50 dan mitigasi CONDITIONAL_GO tercatat. |
| M02 | Scope Definition & Freeze | GATE PASSED (2026-10-30; BASELINE 2026-10-22, JADWAL DIPERBARUI 2026-10-30) | Validator lulus; baseline tetap 7 P0/22 Story. Arahan pemilik menyelaraskan tujuh P0 ke M04. Estimasi 186â€“245 jam; jadwal direvisi menjadi 21 minggu/252 jam (12 jam/minggu), batas atas tertampung dengan sisa 7 jam tanpa perubahan scope. |
| M03 | Legal, SOW & Client Data Protection | WAIVED Â· GATE PASSED (2026-10-30) | Proyek portfolio/internal; SOW komersial tidak berlaku. Charter solo tetap rekomendasi opsional. |
| M04 | UI/UX & Prototyping | GATE PASSED (2026-10-30) | Pemilik menyetujui Design Freeze melalui chat; `zeenn` dicatat sebagai approver pada `docs/specs/DESIGN_SPEC.md`. UI/UX audit lulus dengan 0 violation dan 48 advisory; delapan dropdown form memakai popover kustom. Evaluasi 613 skenario memetakan 498 kandidat P0 dan 115 backlog/out-of-scope; enam walkthrough E2E telah diselaraskan sebagai acceptance criteria yang belum dieksekusi. |
| M05 | Architecture & Technical Specifications | GATE PASSED (2026-10-31) | Opsi A dikunci pemilik: Next.js 16.4.3, TypeScript/CSS prototipe, PostgreSQL/Prisma di Neon Free, Neon Auth/Object Storage (beta), dan Vercel Hobby. Keputusan domain dikonfirmasi 2026-10-30; technical sign-off `zeenn` pada 2026-10-31 mencakup review PRD/FSD, scope, handoff M04, keputusan domain, backup, dan kemampuan provider. Catatan implementasi yang belum executable dipindahkan menjadi tugas M06; tidak ada klaim bahwa aplikasi atau E2E sudah diuji. |
| M06 | Development Execution | IN PROGRESS; M06-SETUP-02 AWAITING OWNER REVIEW | Pemilik menyetujui TODO dan daftar layar deferred. Scaffold Next.js 16.4.3 tersedia dan disetujui pemilik pada 2026-10-31. Harness Medium+ sembilan file sudah disalin ke root dan diverifikasi; `.env.example` dikecualikan dari aturan ignore, dan runbook menjelaskan sumber tiap environment value. M06-SETUP-04/05 perlu merekonsiliasi kontrak `NEON_AUTH_SECRET` dan nama kredensial Object Storage terhadap SDK/provider sebelum integrasi. Dependency sudah terpasang untuk memulihkan `npm run dev`; audit versi/deprecation dan pin tooling tetap menjadi task M06-SETUP-04. Server dev siap melalui Webpack; binary SWC native Windows masih memberi peringatan. |

## 3. Asumsi Aktif

| ID | Hipotesis | Keyakinan | Cara validasi | Hasil saat ini |
|---|---|---|---|---|
| ASM-01 | Pengelola mengalami friksi pencatatan pembayaran/tagihan dan keluhan maintenance. | âœ… Sampel | 10 wawancara nyata; lihat USER_RESEARCH_REPORT.md. | Didukung dalam sampel kecil; frekuensi pasar belum diketahui. |
| ASM-02 | Billing, maintenance ticketing, dan pelaporan sederhana mendukung tujuan portfolio. | ðŸ”¶ Asumsi | Validasi demo dan task breakdown. | Tujuh P0 Medium dibekukan; fixture sintetis hanya untuk data alur inti. Batas media: foto maks. 4 MB, video maks. 12 MB/30 detik, total 40 MB/tiket. |
| ASM-03 | Tujuh P0 Medium satu properti dapat diselesaikan dalam kapasitas yang disetujui. | ðŸ”¶ Mitigasi diterapkan | Estimasi Story dan jadwal dibandingkan setelah rekonsiliasi escrow/billing. | Jadwal M02 diperbarui atas arahan pemilik 2026-10-30 menjadi 21 minggu/252 jam; estimasi 186â€“245 jam tertampung tanpa perubahan scope. |
| ASM-04 | Storage privat dan retensi media tiket memadai untuk demo. | ðŸ”¶ Asumsi | Tentukan provider, biaya, format, akses, dan retensi teks pada M05. | Rancangan media tiket: private object storage, local hanya dev, tanpa CDN MVP, prune 365 hari setelah close. Skenario media 20 kamar â‰ˆ1,1 GB/tahun rata-rata, batas â‰ˆ4,8 GB/tahun. |

## 4. Blocker dan Keputusan

- [x] **Kapasitas:** intake awal 18 minggu/216 jam. Atas arahan pemilik pada 2026-10-30, jadwal implementasi direvisi menjadi 21 minggu/252 jam untuk menampung estimasi maksimum 245 jam.
- [x] **Validasi pengguna:** sepuluh wawancara nyata dicatat pada USER_RESEARCH_REPORT.md; tanggal INT-10 dikoreksi menjadi rentang 20â€“21 Oktober (hari tunggal belum dipastikan). Hasil tetap kualitatif.
- [x] **Keputusan batas properti:** satu properti dan tujuh P0 Medium ditetapkan untuk MVP; fitur lain ada di backlog versi berikutnya.
- [x] **Prioritas scope terbaru:** semua P0 berjumlah tujuh; P1/P2 dipindahkan ke versi berikutnya dan tidak masuk estimasi MVP.
- [x] **Data demo:** nama/kontak, kontrak, tagihan/pembayaran, serta tiket/media menggunakan fixture sintetis; NIK/KTP, detail rekening, dan bukti transfer dikeluarkan dari MVP.
- [x] **Rancangan media/storage:** foto maks. 4 MB, video maks. 12 MB/30 detik, maksimal 4 foto + 1 video per kiriman, akumulasi 40 MB/tiket; hapus media 365 hari setelah tiket ditutup sesuai rancangan.
- [x] **Estimasi baseline pra-M04:** 174â€“232 jam. **Estimasi pasca-rekonsiliasi M04:** 186â€“245 jam; jadwal diperbarui atas arahan pemilik menjadi 21 minggu/252 jam.
- [x] **Scope lock:** pemilik menetapkan ulang dan menyetujui tujuh P0/Medium satu properti pada 2026-10-22; keputusan ini menggantikan baseline Large.
- [x] **M02 gate:** breakdown 22 Story disusun dan jumlah estimasi anak cocok dengan estimasi ketujuh Epic; validator M02 lulus pada 2026-10-22 dan dijalankan ulang setelah revisi jadwal pada 2026-10-30 (exit code 0).
- [x] **Riwayat jadwal:** jadwal awal 20 minggu/240 jam disetujui pada 2026-10-22. Atas arahan pemilik pada 2026-10-30, jadwal diperbarui menjadi 21 minggu Ã— 12 jam/minggu = 252 jam.
- [x] **Review gate M01 pasca-pembaruan:** validator dijalankan ulang pada 2026-10-22 setelah bukti wawancara diperbarui; keputusan CONDITIONAL_GO tetap lulus (exit code 0).
- [x] **Referensi desain M04:** 5 gambar referensi resolusi tinggi (flat dashboard, perspektif, mobile, typography Poppins, dan logo) tersimpan di `docs/design/inspiration/`. Bedah visual terdokumentasi di `SOURCES.md`. Logo Kunci Rumah (Concept C) tetap menjadi identitas brand.
- [x] **Master E2E Walkthrough:** 6 alur demonstrasi end-to-end lintas peran (Pemilik, Staf, Penghuni) dibakukan di `docs/design/SCENARIOS_E2E_WALKTHROUGH.md`.

## 5. Aksi Berikutnya

Pemilik meninjau M06-SETUP-02; setelah disetujui, lanjutkan ke M06-SETUP-03 (pre-read spesifikasi).






