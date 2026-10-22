# Status Proyek — Sistem Manajemen Kost Mandiri

## 1. Metadata

- **Project Name**: Sistem Manajemen Kost Mandiri
- **Current Active Module**: M04 · UI/UX & Prototyping (PASSED · 9 prototype screens WF-01 s.d. WF-09 selesai) -> Transisi ke M05 (Architecture & Technical Specifications)
- **Scale**: medium (7 P0 groups; single-property MVP frozen; implementation planning pending)
- **Delivery**: portfolio
- **Lifecycle Path**: Portfolio / Medium+
- **Primary Tech Stack**: Belum dipilih (M05)
- **Project Language**: Indonesian
- **Last Active Session Date**: 2026-10-22
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

**Active Gate Status: M01 CONDITIONAL_GO (validator pasca-pembaruan PASSED); M02 PASSED (7 P0, Medium, satu properti); jadwal 20 minggu/240 jam DISETUJUI 2026-10-22; M04 IN PROGRESS — referensi Estify beresolusi tinggi diterima, SOURCES.md, DESIGN.md, dan SITEMAP.md dimutakhirkan**

| Module | Nama | Status | Catatan |
|---|---|---|---|
| M00 | Product Research & Discovery | WAIVED | Jalur portfolio melewati gate penuh M00. Sepuluh wawancara kualitatif mendukung mitigasi M01, bukan validasi pasar skala luas. |
| M01 | Idea Feasibility | CONDITIONAL_GO · REVALIDATED | Validator M01 dijalankan ulang pada 2026-10-22 setelah data wawancara diperbarui dan lulus dengan exit code 0; skor rata-rata 3.50 dan mitigasi tetap tercatat. |
| M02 | Scope Definition & Freeze | PASSED | Breakdown 22 Story tersedia di KANBAN.md; estimasi implementasi 112–150 jam sesuai tujuh Epic. Validator M02 lulus dengan exit code 0 pada 2026-10-22. Total estimasi MVP tetap 174–232 jam terhadap kapasitas 216 jam; validator skala bukan persetujuan atas selisih jadwal ini. |
| M04 | UI/UX & Prototyping | PASSED | Seluruh 12 prototipe HTML (`WF-01` s.d. `WF-12`) mencakup 3 peran (Pemilik, Staf, Penghuni) telah diaudit, disetujui, dan dikunci. Bebas emoticon/emoji (100% Lucide SVG), layout login 100vh presisi dengan visual gedung oranye resmi dan penekanan logo tunggal, serta sistem toast notifikasi modern di pojok kanan atas. Komponen CMP-01 s.d. CMP-19, DESIGN.md, dan SITEMAP.md telah sinkron. |
| M05 | Architecture & Technical Specifications | READY | Siap memulai seleksi teknologi (Tech Stack Lock 5–8 poin), penyusunan dokumen arsitektur sistem, dan skema database PostgreSQL/Prisma. |

## 3. Asumsi Aktif

| ID | Hipotesis | Keyakinan | Cara validasi | Hasil saat ini |
|---|---|---|---|---|
| ASM-01 | Pengelola mengalami friksi pencatatan pembayaran/tagihan dan keluhan maintenance. | ✅ Sampel | 10 wawancara nyata; lihat USER_RESEARCH_REPORT.md. | Didukung dalam sampel kecil; frekuensi pasar belum diketahui. |
| ASM-02 | Billing, maintenance ticketing, dan pelaporan sederhana mendukung tujuan portfolio. | 🔶 Asumsi | Validasi demo dan task breakdown. | Tujuh P0 Medium dibekukan; fixture sintetis hanya untuk data alur inti. Batas media: foto maks. 4 MB, video maks. 12 MB/30 detik, total 40 MB/tiket. |
| ASM-03 | Tujuh P0 Medium satu properti dapat diselesaikan dalam kapasitas yang disetujui. | ✅ Disetujui | Pemilik menyetujui jadwal sebelum baseline implementasi. | **Jadwal 20 minggu / 240 jam disetujui pemilik pada 2026-10-22.** Total MVP 174–232 jam; batas atas 232 jam / sisa 8 jam di bawah kapasitas 240 jam. |
| ASM-04 | Storage privat dan retensi media tiket memadai untuk demo. | 🔶 Asumsi | Tentukan provider, biaya, format, akses, dan retensi teks pada M05. | Rancangan media tiket: private object storage, local hanya dev, tanpa CDN MVP, prune 365 hari setelah close. Skenario media 20 kamar ≈1,1 GB/tahun rata-rata, batas ≈4,8 GB/tahun. |

## 4. Blocker dan Keputusan

- [x] **Kapasitas intake:** pemilik memilih kapasitas 18 minggu × 12 jam = 216 jam untuk draft tujuh P0 awal. Scope kemudian diperluas atas permintaan pemilik; kapasitas tersebut belum disetujui ulang.
- [x] **Validasi pengguna:** sepuluh wawancara nyata dicatat pada USER_RESEARCH_REPORT.md; tanggal INT-10 dikoreksi menjadi rentang 20–21 Oktober (hari tunggal belum dipastikan). Hasil tetap kualitatif.
- [x] **Keputusan batas properti:** satu properti dan tujuh P0 Medium ditetapkan untuk MVP; fitur lain ada di backlog versi berikutnya.
- [x] **Prioritas scope terbaru:** semua P0 berjumlah tujuh; P1/P2 dipindahkan ke versi berikutnya dan tidak masuk estimasi MVP.
- [x] **Data demo:** nama/kontak, kontrak, tagihan/pembayaran, serta tiket/media menggunakan fixture sintetis; NIK/KTP, detail rekening, dan bukti transfer dikeluarkan dari MVP.
- [x] **Rancangan media/storage:** foto maks. 4 MB, video maks. 12 MB/30 detik, maksimal 4 foto + 1 video per kiriman, akumulasi 40 MB/tiket; hapus media 365 hari setelah tiket ditutup sesuai rancangan.
- [x] **Estimasi MVP:** 174–232 jam untuk tujuh P0 termasuk buffer, QA, dan dokumentasi/demo; batas atas 16 jam melebihi intake 216 jam.
- [x] **Scope lock:** pemilik menetapkan ulang dan menyetujui tujuh P0/Medium satu properti pada 2026-10-22; keputusan ini menggantikan baseline Large.
- [x] **M02 gate:** breakdown 22 Story disusun dan jumlah estimasi anak cocok dengan estimasi ketujuh Epic; validator M02 lulus dengan exit code 0 pada 2026-10-22.
- [x] **Persetujuan jadwal:** pemilik menyetujui jadwal 20 minggu / 240 jam pada 2026-10-22; baseline implementasi ditetapkan 20 minggu × 12 jam/minggu = 240 jam.
- [x] **Review gate M01 pasca-pembaruan:** validator dijalankan ulang pada 2026-10-22 setelah bukti wawancara diperbarui; keputusan CONDITIONAL_GO tetap lulus (exit code 0).
- [x] **Referensi desain M04:** 5 gambar referensi resolusi tinggi (flat dashboard, perspektif, mobile, typography Poppins, dan logo) tersimpan di `docs/design/inspiration/`. Bedah visual terdokumentasi di `SOURCES.md`. Logo Kunci Rumah (Concept C) tetap menjadi identitas brand.

## 5. Aksi Berikutnya

Langkah selanjutnya: **Memulai Modul M05 (Architecture & Technical Specifications)** — Penentuan Tech Stack (Stack Lock 8 Pertanyaan), perancangan arsitektur sistem, skema basis data PostgreSQL/Prisma, API contract, dan strategi storage media privat.
