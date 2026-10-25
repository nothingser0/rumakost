# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-07: Laporan Finansial, Audit Pembukuan Kas & Kinerja Okupansi (SCR-12 & SCR-13)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-07-laporan.html`  
> **Fitur Terkait**: **F-06** (Pengeluaran Operasional & Laporan Pemasukan/Okupansi Kost), **F-01** (Akses & Peran / RBAC Guard), **F-02** (Manajemen Unit & Utilisasi Kamar), **F-04** (Tagihan Berulang & Aging Schedule), **F-05** (Pembayaran & Saldo Kas Riil), **F-10** (Ekspor Data Tabular CSV & PDF Audit), **F-11** (Pencatatan Struk Pengeluaran & Tautan Tiket Kerusakan)  
> **User Stories KANBAN**: `RK-006` (Epic Pengeluaran & Laporan Ringkas), `RK-034` (Pencatatan Pengeluaran Operasional), `RK-035` (Ringkasan Arus Kas Masuk & Keluar), `RK-036` (Rekapitulasi Tingkat Okupansi Kamar), `RK-020` (Pembatasan Akses Berdasarkan Role - Staff NOI Masking)  
> **Hak Akses Layar**: **Pemilik Properti (Owner - Akses Penuh Superadmin)** & **Staf Pengelola (Staff - Akses Operasional Kas dengan Proteksi Masking Laba Bersih/NOI)**. *Penghuni dilarang mengakses modul ini (Zero Access).*

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-07 (`SCR-12` & `SCR-13`)** adalah pusat audit keuangan eksekutif, rekapitulasi arus kas operasional, dan evaluasi utilisasi properti tunggal RumaKost (*Kost Eksklusif RumaKost - 15 Kamar*). Layar ini dibangun di atas filosofi desain **Estify Minimalist DNA** dengan prinsip **Inverted Pyramid Financial Architecture**: menyajikan 4 kartu indikator kesehatan makro (*Executive KPI Gauges*) di bagian atas, bilah kendali audit terpadu (*Unified Smart Filter Bar*), dan 4 panel tab analisis mendalam (*Segmented Audit Tabs*) yang saling terhubung secara reaktif tanpa reload halaman.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               WF-07 WORKBENCH ARSITEKTUR & FINANCIAL AUDIT                              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Nav Pill (Laporan Aktif) + Avatar Pengelola              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. ESTIFY KPI METRIC GAUGES (4 Cards Radial Speedometer):                                              │
│    • Card 1: Surplus Kas / NOI (Rp 17,40 Jt · +16.0% ↑ · Margin 80.4%) [Masked on Staff Role]          │
│    • Card 2: Beban Operasional / OER (Rp 4,25 Jt · Rasio 19.6% · Gauge 20% Merah Sehat)               │
│    • Card 3: Hasil per Kamar / RevPAR (Rp 1,44 Jt · Yield 86.4% · Gauge 86% Oranye)                   │
│    • Card 4: Ketepatan Bayar Penghuni (100% · 0 Tunggakan · Gauge 100% Biru)                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. AUDIT CONTROLS & FILTER BAR:                                                                        │
│    • Smart Search Capsule (Cross-Tab Instant Filter)    • Popover Filter Pos Akun (Semua/Beban/Omzet)  │
│    • Popover Periode Audit (Oktober 2026/Bulan Lalu)   • Action CTAs: Cetak Dokumen | Ekspor | Catat Kas│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. 4-WAY SEGMENTED REPORT TABS:                                                                        │
│    [ Tab 1: Buku Kas Umum ]  [ Tab 2: Laba Rugi P&L ]  [ Tab 3: Kinerja Kamar ]  [ Tab 4: Umur Piutang ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. REVENUE & RECONCILIATION WORKBENCH CANVAS:                                                          │
│    • Tab 1: Jurnal Kas 16 Transaksi Terverifikasi (Debit, Kredit, Saldo Berjalan, Popover Dokumen)     │
│    • Tab 2: Laporan Laba Rugi SAK Properti (Gross Revenue, OPEX Breakdown, Net Operating Income MoM)  │
│    • Tab 3: Matriks 15 Kamar (3 Lantai, Omzet, Beban Servis AC, Net Kontribusi, Opportunity Cost)     │
│    • Tab 4: Aging Schedule 11 Invoice (Tepat Waktu H-4 s/d Hari H vs Masa Toleransi H+2/H+3)           │
│    • Symmetrical Bottom Reconciliation Strip (Kas Masuk, Kas Keluar, Surplus Bersih, Status 100% Cocok)│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. INTERACTIVE MODAL ENGINES:                                                                          │
│    • Modal Catat Kas Operasional (#modalExpense): Form Pos Akun, Datepicker, Tautan Tiket, Upload Struk│
│    • Modal Pratinjau Kuitansi (#modalProofView): Struk Transaksi Resmi & Cetak Kuitansi Mini           │
│    • Modal Ekspor Finansial (#modalExport): Unduh CSV (UTF-8 BOM), PDF A4 Audit, & Auto-Print Workflow │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Pilar Arsitektural & Batasan Domain (Domain Boundaries):
1. **Basis Kas Riil Terverifikasi (*Cash-Basis & Zero Self-Approval Sync*)**:  
   Pemasukan yang tercatat di Buku Kas Umum hanya bersumber dari pembayaran sewa yang telah diverifikasi oleh Pemilik Kost di modul Pembayaran (`WF-06`). Tagihan berstatus pending atau belum diverifikasi dilarang masuk ke jurnal kas riil.
2. **Pemisahan Wewenang Sensitif (*RBAC Financial Masking*)**:  
   Staf Operasional memiliki izin mencatat mutasi pengeluaran kas harian dan memeriksa buku besar kas lapangan, namun metrik sensitif laba bersih Pemilik (*Net Operating Income / NOI*) secara otomatis disamarkan (*locked & masked*) demi menjaga kerahasiaan profitabilitas properti.
3. **Penyelarasan Biaya Pemeliharaan ke Tiket (*Direct Ticket Maintenance Link*)**:  
   Setiap transaksi pengeluaran servis/perbaikan gedung dapat ditautkan secara langsung (*linked*) ke nomor tiket kerusakan yang diajukan penghuni (`#TKT-xxx`), mewujudkan pelacakan biaya perbaikan per unit kamar secara transparan (*Unit Yield Audit*).
4. **Single Standalone Property Strict Guard (Bebas Multi-Properti)**:  
   Seluruh agregasi finansial, okupansi (13 terisi / 2 kosong dari total 15 unit), dan rekonsiliasi saldo mengikat secara tunggal pada satu entitas properti tanpa dropdown multi-cabang.
5. **Ekspor Mandiri Tanpa Layanan Berbayar (*Standalone Client-Side Export*)**:  
   Ekspor CSV dan PDF digenerasikan langsung di peramban menggunakan format standar UTF-8 with BOM dan Adobe PDF-1.4 tanpa ketergantungan API pihak ketiga berbayar.

---

## 2. Matriks Entitas Data Baseline (Fixture Testing)

### 2.1 Metrik Finansial Makro Baseline (Oktober 2026)
| Parameter Finansial | Nilai Riil Baseline | Indikator / Rasio | Status Kepatuhan |
|---|---|---|---|
| **Total Kas Masuk (Debit)** | Rp 21.650.000 | 11 Transaksi Pelunasan Sewa Terverifikasi | 100% Kas Riil Masuk |
| **Total Kas Keluar (Kredit)**| Rp 4.250.000 | 5 Transaksi Biaya Operasional (Listrik, Air, WiFi, AC, Sampah) | Rasio OPEX 19.6% (Sehat <25%) |
| **Surplus Kas Bersih (NOI)** | Rp 17.400.000 | Margin Laba Operasional 80.4% | +16.0% MoM vs Sep 2026 |
| **Hasil per Kamar (RevPAR)**| Rp 1.443.333 (~Rp 1,44 Jt) | Utilisasi Okupansi 86.7% (13 Terisi / 15 Kamar) | Yield Kinerja Kamar 86.4% |
| **Tingkat Ketepatan Bayar** | 100% Tertagih | 9 Tepat Waktu (H-4 s/d Hari H), 2 Masa Toleransi (H+2, H+3) | 0 Tunggakan / Zero Default |
| **Saldo Rekonsiliasi Kas**   | Rp 17.400.000 | Selisih Buku Kas Rp 0 | 100% Balance & Verified |

### 2.2 Fixture Jurnal 16 Transaksi Buku Kas Umum (`ledgerData`)
| No. Bukti | Tanggal | Kategori Akun | Tipe Mutasi | Uraian Transaksi | Pihak / Entitas | Nominal (Rp) | Saldo Berjalan (Rp) | Tautan Tiket | Pencatat |
|---|---|---|---|---|---|---|---|---|---|
| **TRX-202610-016** | 23 Okt 2026 | Operasional | Expense | Retribusi sampah RT & sabun pembersih lorong | Pak RW / Toko Berkah | (Rp 400.000) | Rp 17.400.000 | &mdash; | Rini (Staf) |
| **TRX-202610-015** | 18 Okt 2026 | Pemeliharaan | Expense | Cuci AC rutin 3 unit & isi freon (#TKT-003) | CV Berkah Mandiri Teknisi | (Rp 1.500.000) | Rp 17.800.000 | `#TKT-003` | Budi (Pemilik) |
| **TRX-202610-014** | 15 Okt 2026 | Utilitas | Expense | Langganan Internet WiFi IndiHome Fiber 100M | PT Telkom Indonesia | (Rp 650.000) | Rp 19.300.000 | &mdash; | Budi (Pemilik) |
| **TRX-202610-013** | 10 Okt 2026 | Utilitas | Expense | Tagihan Air Bersih PDAM Tirta Moedal | PDAM Tirta Moedal | (Rp 450.000) | Rp 19.950.000 | &mdash; | Budi (Pemilik) |
| **TRX-202610-012** | 08 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar C-03 (Bulan Oktober 2026) | Hendrik Santoso (Kamar C-03) | +Rp 1.650.000 | Rp 20.400.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-011** | 07 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar A-03 (Bulan Oktober 2026) | Dimas Prasetyo (Kamar A-03) | +Rp 1.650.000 | Rp 18.750.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-010** | 05 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar B-03 (Bulan Oktober 2026) | Ahmad Fauzi (Kamar B-03) | +Rp 1.650.000 | Rp 17.100.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-009** | 04 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar C-01 (Bulan Oktober 2026) | Rizky Pratama (Kamar C-01) | +Rp 1.650.000 | Rp 15.450.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-008** | 04 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar B-04 (Bulan Oktober 2026) | Eko Wahyudi (Kamar B-04) | +Rp 1.300.000 | Rp 13.800.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-007** | 04 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar B-01 (Bulan Oktober 2026) | Dewi Anggraini (Kamar B-01) | +Rp 1.650.000 | Rp 12.500.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-006** | 03 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar B-02 (Bulan Oktober 2026) | Siti Aminah (Kamar B-02) | +Rp 1.650.000 | Rp 10.850.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-005** | 03 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar A-04 (Bulan Oktober 2026) | Budi Santoso (Kamar A-04) | +Rp 1.800.000 | Rp 9.200.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-004** | 02 Okt 2026 | Utilitas | Expense | Beli Token Listrik PLN Prabayar Fasum Pompa | PLN Prabayar | (Rp 1.250.000) | Rp 7.400.000 | &mdash; | Budi (Pemilik) |
| **TRX-202610-003** | 02 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar B-05 (Bulan Oktober 2026) | Nurul Indah (Kamar B-05) | +Rp 1.650.000 | Rp 8.650.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-002** | 02 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar A-01 (Bulan Oktober 2026) | Lina Marlina (Kamar A-01) | +Rp 1.400.000 | Rp 7.000.000 | &mdash; | Sistem (Auto) |
| **TRX-202610-001** | 01 Okt 2026 | Sewa Kamar | Income | Pelunasan Sewa Kamar A-05 (Bulan Oktober 2026) | Rahmat Hidayat (Kamar A-05) | +Rp 1.100.000 | Rp 5.600.000 | &mdash; | Sistem (Auto) |

### 2.3 Fixture Analisis Umur Piutang 11 Tagihan (`agingData`)
| Unit Kamar | Lantai | Nama Penyewa | No. Invoice | Tarif Sewa (Rp) | Jatuh Tempo | Realisasi Bayar | Deviasi Hari | Metode Bayar | Status Disiplin |
|---|---|---|---|---|---|---|---|---|---|
| **A-01** | Lt 1 | Lina Marlina | `INV-202610-01` | Rp 1.400.000 | 05 Okt 2026 | 02 Okt 2026 | H-3 | Transfer BCA | Tepat Waktu |
| **A-03** | Lt 1 | Dimas Prasetyo | `INV-202610-03` | Rp 1.650.000 | 05 Okt 2026 | 07 Okt 2026 | H+2 | Transfer Mandiri | Masa Toleransi |
| **A-04** | Lt 1 | Budi Santoso | `INV-202610-04` | Rp 1.800.000 | 05 Okt 2026 | 03 Okt 2026 | H-2 | QRIS Statis Kost | Tepat Waktu |
| **A-05** | Lt 1 | Rahmat Hidayat | `INV-202610-05` | Rp 1.100.000 | 05 Okt 2026 | 01 Okt 2026 | H-4 | Transfer BCA | Tepat Waktu |
| **B-01** | Lt 2 | Dewi Anggraini | `INV-202610-06` | Rp 1.650.000 | 05 Okt 2026 | 04 Okt 2026 | H-1 | Transfer BCA | Tepat Waktu |
| **B-02** | Lt 2 | Siti Aminah | `INV-202610-07` | Rp 1.650.000 | 05 Okt 2026 | 03 Okt 2026 | H-2 | Transfer BRI | Tepat Waktu |
| **B-03** | Lt 2 | Ahmad Fauzi | `INV-202610-08` | Rp 1.650.000 | 05 Okt 2026 | 05 Okt 2026 | Hari H | Transfer BCA | Tepat Waktu |
| **B-04** | Lt 2 | Eko Wahyudi | `INV-202610-09` | Rp 1.300.000 | 05 Okt 2026 | 04 Okt 2026 | H-1 | Transfer BNI | Tepat Waktu |
| **B-05** | Lt 2 | Nurul Indah | `INV-202610-10` | Rp 1.650.000 | 05 Okt 2026 | 02 Okt 2026 | H-3 | Transfer Mandiri | Tepat Waktu |
| **C-01** | Lt 3 | Rizky Pratama | `INV-202610-11` | Rp 1.650.000 | 05 Okt 2026 | 04 Okt 2026 | H-1 | Transfer BCA | Tepat Waktu |
| **C-03** | Lt 3 | Hendrik Santoso | `INV-202610-13` | Rp 1.650.000 | 05 Okt 2026 | 08 Okt 2026 | H+3 | Transfer BCA | Masa Toleransi |

### 2.4 Fixture Matriks Utilisasi 15 Kamar Properti
| No. Kamar | Lantai | Tipe Kamar | Tarif / Bulan | Penghuni Aktif | Status Huni | Realisasi Omzet | Beban Servis | Net Kontribusi | Yield |
|---|---|---|---|---|---|---|---|---|---|
| **A-01** | Lt 1 | Standard Plus | Rp 1.400.000 | Lina Marlina | Terisi 31 Hari | Rp 1.400.000 | Rp 0 | Rp 1.400.000 | 100% |
| **A-02** | Lt 1 | Standard Plus | Rp 1.200.000 | *Kosong (Siap Huni)* | Kosong 31 Hari | Rp 0 | Rp 0 | Rp 0 | 0% |
| **A-03** | Lt 1 | Deluxe AC | Rp 1.650.000 | Dimas Prasetyo | Terisi 31 Hari | Rp 1.650.000 | (Rp 500.000) | Rp 1.150.000 | 69.7% |
| **A-04** | Lt 1 | Deluxe VIP AC | Rp 1.800.000 | Budi Santoso | Terisi 31 Hari | Rp 1.800.000 | Rp 0 | Rp 1.800.000 | 100% |
| **A-05** | Lt 1 | Standard | Rp 1.100.000 | Rahmat Hidayat | Terisi 31 Hari | Rp 1.100.000 | Rp 0 | Rp 1.100.000 | 100% |
| **B-01** | Lt 2 | Deluxe AC | Rp 1.650.000 | Dewi Anggraini | Terisi 31 Hari | Rp 1.650.000 | Rp 0 | Rp 1.650.000 | 100% |
| **B-02** | Lt 2 | Deluxe AC | Rp 1.650.000 | Siti Aminah | Terisi 31 Hari | Rp 1.650.000 | Rp 0 | Rp 1.650.000 | 100% |
| **B-03** | Lt 2 | Deluxe AC | Rp 1.650.000 | Ahmad Fauzi | Terisi 31 Hari | Rp 1.650.000 | (Rp 500.000) | Rp 1.150.000 | 69.7% |
| **B-04** | Lt 2 | Standard Plus | Rp 1.300.000 | Eko Wahyudi | Terisi 31 Hari | Rp 1.300.000 | Rp 0 | Rp 1.300.000 | 100% |
| **B-05** | Lt 2 | Deluxe AC | Rp 1.650.000 | Nurul Indah | Terisi 31 Hari | Rp 1.650.000 | Rp 0 | Rp 1.650.000 | 100% |
| **C-01** | Lt 3 | Deluxe AC | Rp 1.650.000 | Rizky Pratama | Terisi 31 Hari | Rp 1.650.000 | Rp 0 | Rp 1.650.000 | 100% |
| **C-02** | Lt 3 | Standard Plus | Rp 1.300.000 | Fajar Nugraha | Terisi 31 Hari | Rp 1.300.000 | Rp 0 | Rp 1.300.000 | 100% |
| **C-03** | Lt 3 | Deluxe AC | Rp 1.650.000 | Hendrik Santoso | Terisi 31 Hari | Rp 1.650.000 | (Rp 500.000) | Rp 1.150.000 | 69.7% |
| **C-04** | Lt 3 | Standard | Rp 1.100.000 | *Kosong (Siap Huni)* | Kosong 31 Hari | Rp 0 | Rp 0 | Rp 0 | 0% |
| **C-05** | Lt 3 | Standard Plus | Rp 1.300.000 | Bambang Soediro | Terisi 31 Hari | Rp 1.300.000 | Rp 0 | Rp 1.300.000 | 100% |

---

## 3. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Inisialisasi Layar, Verifikasi 4 Indikator KPI Estify & Rekonsiliasi Saldo Awal
* **Tujuan**: Memastikan pengguna (Pemilik) yang membuka layar `WF-07` disajikan metrik eksekutif yang akurat, 4 kartu speedometer gauge Estify ter-render sempurna, dan status rekonsiliasi kas terbukti 100% cocok (*zero discrepancy*).
* **Kondisi Awal (Pre-condition)**: Pengguna login sebagai Pemilik (`budi.santoso@rumakost.id`) dan mengakses file `WF-07-laporan.html`.
* **Langkah-langkah**:
  1. Periksa Topbar Navigasi: pastikan pill menu **"Laporan"** berstatus aktif.
  2. Amati area 4 kartu metrik Estify di bagian atas:
     - Kartu 1: Surplus Kas (NOI).
     - Kartu 2: Beban Operasional (OER).
     - Kartu 3: Hasil per Kamar (RevPAR).
     - Kartu 4: Ketepatan Bayar.
  3. Periksa badge status rekonsiliasi pada header workbench tab Buku Kas Umum.
* **Hasil Diharapkan**:
  - Topbar terpasang rapi dengan canopy overlay pelindung notch atas.
  - Kartu 1 menampilkan nilai `Rp 17,40 Jt`, delta badge soft green `+16.0% ↑`, dan semi-circle radial gauge berwarna hijau emerald dengan teks persentase `80%`.
  - Kartu 2 menampilkan beban `Rp 4,25 Jt`, rasio `19.6% Rasio`, dan gauge merah 20% (menandakan batas beban sehat di bawah 25%).
  - Kartu 3 menampilkan hasil `Rp 1,44 Jt`, badge oranye `86.4% Yield`, dan gauge 86%.
  - Kartu 4 menampilkan ketepatan bayar `100%`, badge biru `0 Tunggakan`, dan gauge 100%.
  - Badge proteksi audit pada workbench menampilkan: `Rekonsiliasi Kas 100% Cocok · Selisih Rp 0` dengan ikon perisai hijau emerald (`shield-check`).

---

### SKENARIO 02: Navigasi Antar Tab Pembukuan 4-Way & Sinkronisasi Konteks Pencarian
* **Tujuan**: Menguji peralihan mulus (*frictionless zero page reload*) antara 4 tab audit finansial (Buku Kas Umum, Laba Rugi P&L, Kinerja Kamar, Umur Piutang) beserta sinkronisasi placeholder kotak pencarian.
* **Kondisi Awal**: Pengguna berada di `WF-07-laporan.html` dengan tab default `Buku Kas Umum` aktif.
* **Langkah-langkah**:
  1. Klik tab **"Laba Rugi (P&L)"** (`#tabBtnPL`).
  2. Periksa perubahan tampilan panel dan placeholder pada `#auditSearchInput`.
  3. Klik tab **"Kinerja Kamar (15)"** (`#tabBtnUnitMatrix`).
  4. Periksa placeholder kotak pencarian.
  5. Klik tab **"Umur Piutang (11)"** (`#tabBtnAging`).
  6. Periksa placeholder kotak pencarian.
  7. Klik kembali tab **"Buku Kas Umum (16)"** (`#tabBtnLedger`).
* **Hasil Diharapkan**:
  - Class `.active` berpindah secara instan ke tab tombol dan panel target yang bersangkutan tanpa sentakan layout (*zero CLS*).
  - Pada tab P&L: placeholder search bar berubah otomatis menjadi: *"Cari pos akun beban / pendapatan P&L..."*.
  - Pada tab Kinerja Kamar: placeholder berubah menjadi: *"Cari no kamar, tipe, atau penghuni..."*.
  - Pada tab Umur Piutang: placeholder berubah menjadi: *"Cari nama penghuni, nomor kamar, atau invoice..."*.
  - Pada tab Buku Kas Umum: placeholder kembali menjadi: *"Cari no bukti, transaksi, vendor, penghuni..."*.
  - Ikon-ikon Lucide di-render ulang secara otomatis (`lucide.createIcons()`).

---

### SKENARIO 03: Audit Jurnal Buku Kas Umum (Tab 1), Debit/Kredit & Saldo Berjalan
* **Tujuan**: Memverifikasi penyajian kronologis 16 transaksi buku kas, pembedaan warna debit/kredit, perhitungan saldo berjalan real-time, dan ringkasan strip rekonsiliasi bawah.
* **Kondisi Awal**: Tab `Buku Kas Umum` aktif.
* **Langkah-langkah**:
  1. Periksa tabel baris transaksi pada `#ledgerTableBody`.
  2. Periksa baris transaksi teratas (`TRX-202610-016`) tertanggal 23 Okt 2026.
  3. Periksa baris mutasi pemasukan sewa (misal `TRX-202610-012` Hendrik Santoso).
  4. Periksa baris strip rekonsiliasi bawah (`.ledger-summary-strip`).
* **Hasil Diharapkan**:
  - Baris transaksi tersusun rapi dari transaksi terbaru ke terlama (01 s.d. 23 Okt 2026).
  - Mutasi pengeluaran (kredit) diformat dengan kurung merah: misal `(Rp 400.000)` pada kolom Pengeluaran (Kredit), sedangkan kolom Debit bernilai em-dash `—`.
  - Mutasi pemasukan (debit) diformat dengan plus hijau: misal `+Rp 1.650.000` pada kolom Pemasukan (Debit), sedangkan kolom Kredit bernilai `—`.
  - Kolom Saldo Kas Berjalan menampilkan titik indikator hijau dan saldo terakumulasi akurat (posisi akhir saldo: `Rp 17.400.000`).
  - Strip ringkasan bawah mengonfirmasi:
    - Total Kas Masuk (Debit): `Rp 21.650.000` (hijau).
    - Total Kas Keluar (Kredit): `(Rp 4.250.000)` (merah).
    - Surplus Kas Bersih Periode Ini: `Rp 17.400.000` (oranye brand).
    - Status Tutup Buku Kas: `Balance 100% (No Discrepancy)` dengan ikon gembok hijau terkunci.

---

### SKENARIO 04: Pencarian Global Cerdas (Smart Search Bar) & Filter Simultan Lintas 4 Tab
* **Tujuan**: Menguji fitur pencarian teks instan terpadu yang memfilter baris data dan memperbarui badge counter pada keempat tab secara serentak.
* **Kondisi Awal**: Tab `Buku Kas Umum` aktif, total transaksi awal 16 baris.
* **Langkah-langkah**:
  1. Masukkan kata kunci `"IndiHome"` pada `#auditSearchInput`.
  2. Amati perubahan baris tabel di Buku Kas Umum dan tombol clear `#btnClearAuditSearch`.
  3. Beralih ke tab **"Laba Rugi (P&L)"**.
  4. Beralih ke tab **"Kinerja Kamar"**.
  5. Beralih kembali ke tab Buku Kas, lalu klik tombol silang (clear) `#btnClearAuditSearch`.
* **Hasil Diharapkan**:
  - Tombol silang `btnClearAuditSearch` muncul (`display: inline-flex`) segera setelah ada teks.
  - Pada Buku Kas Umum: tabel tersaring menyisakan 1 baris (`TRX-202610-014`, Internet WiFi IndiHome Fiber 100Mbps, Rp 650.000). Badge counter berubah menjadi `1` dan header berubah menjadi `1 Transaksi Terverifikasi`.
  - Pada tab Laba Rugi: baris yang tampil hanya pos Beban Komunikasi IndiHome Fiber dan baris subtotal/divider tetap dipertahankan untuk konteks audit.
  - Pada tab Kinerja Kamar: menampilkan 0 kamar cocok dan counter badge tersinkronisasi menjadi `0`.
  - Saat tombol silang diklik: input dibersihkan, kursor kembali fokus ke input, seluruh 16 transaksi buku kas pulih, dan tombol silang disembunyikan kembali.

---

### SKENARIO 05: Penyaringan Pos Akun Kas via Account Filter Popover
* **Tujuan**: Memvalidasi kemampuan pengelola memilah transaksi berdasarkan kategori pos akun tertentu (Pendapatan Sewa, Beban Utilitas, Pemeliharaan, Kebersihan, atau Lain-lain).
* **Kondisi Awal**: Pengguna berada di tab `Buku Kas Umum` dengan filter pos akun default *"Semua Akun & Kategori"*.
* **Langkah-langkah**:
  1. Klik tombol trigger filter pos akun (`.btn-account-filter`).
  2. Pada popover `#accountFilterPopover`, pilih opsi **"Beban Utilitas (Listrik & Air)"**.
  3. Periksa respon UI, badge label, dan tabel.
  4. Buka kembali popover dan pilih opsi **"Semua Akun & Kategori"**.
* **Hasil Diharapkan**:
  - Popover terbuka mulus tanpa menabrak dropdown lain.
  - Setelah memilih Utilitas:
    - Tombol trigger menampilkan label *"Beban Utilitas (Listrik & Air)"*.
    - Muncul notifikasi Toast info: `Filter akun diterapkan: Beban Utilitas (Listrik & Air)`.
    - Tabel Buku Kas Umum menyaring dan hanya menampilkan 3 transaksi utilitas (`TRX-202610-014` WiFi, `TRX-202610-013` PDAM, `TRX-202610-004` PLN Token).
    - Counter badge di tab dan header diperbarui menjadi `3`.
  - Saat dikembalikan ke *"Semua Akun & Kategori"*: seluruh 16 transaksi tampil kembali dan counter badge kembali ke `16`.

---

### SKENARIO 06: Pemilihan Periode Pembukuan Audit via Period Popover Menu
* **Tujuan**: Memastikan pengguna dapat beralih rentang audit periode pembukuan (Bulan Berjalan, Bulan Lalu, Q3, YTD) dengan umpan balik sistem yang informatif.
* **Kondisi Awal**: Trigger periode menampilkan *"Oktober 2026 (01 - 31 Okt)"*.
* **Langkah-langkah**:
  1. Klik tombol trigger periode audit (`.btn-audit-period`).
  2. Amati menu popover `#periodPopoverMenu`.
  3. Klik opsi **"September 2026 (Bulan Lalu)"**.
  4. Buka kembali popover dan pilih **"Oktober 2026 (Bulan Berjalan)"**.
* **Hasil Diharapkan**:
  - Menu popover membuka daftar 5 opsi periode pembukuan dengan tanda centang aktif pada opsi terpilih.
  - Saat memilih September 2026:
    - Label tombol berubah menjadi *"September 2026 (01 - 30 Sep)"*.
    - Menu popover tertutup otomatis.
    - Sistem memicu Toast info: `Memuat data audit pembukuan: September 2026 (01 - 30 Sep)`.
  - Saat dikembalikan ke Oktober 2026: label kembali normal dan toast konfirmasi pemuatan data muncul.

---

### SKENARIO 07: Inspeksi Bukti Transaksi Kas (Nota / Struk) via Modal Proof View
* **Tujuan**: Menguji akses terhadap dokumen fisik bukti pengeluaran kas yang tersimpan di sistem melalui menu dokumen pada baris transaksi.
* **Kondisi Awal**: Transaksi `TRX-202610-016` (Retribusi sampah RT & sabun, Rp 400.000) terlihat di tabel.
* **Langkah-langkah**:
  1. Klik tombol trigger **"Dokumen"** (`.btn-doc-trigger`) pada baris transaksi `TRX-202610-016`.
  2. Pada popover menu `#docMenu_TRX-202610-016`, klik opsi **"Lihat Nota / Struk"**.
  3. Amati isi modal pratinjau bukti `#modalProofView`.
  4. Klik tombol **"Tutup"** atau tombol silang modal.
* **Hasil Diharapkan**:
  - Popover dokumen baris terbuka tepat di bawah tombol trigger.
  - Modal `#modalProofView` terbuka dengan backdrop transisi halus.
  - Data modal terisi sesuai transaksi terkait:
    - No. Referensi: `TRX-202610-016`.
    - Kategori: Badge `Operasional`.
    - Uraian: *"Retribusi sampah RT & sabun pembersih lorong gedung"*.
    - Nominal Riil: `Rp 400.000` (warna merah tebal).
    - Tanggal: `23 Okt 2026`.
    - Pencatat: `Pak RW / Toko Berkah`.
    - Area pratinjau menampilkan box berkas struk terlampir.
  - Menekan tombol tutup menutup modal dan mengembalikan fokus ke tabel.

---

### SKENARIO 08: Cetak Kuitansi Individual & Penelusuran Tautan Silang Tiket (`#TKT-xxx`)
* **Tujuan**: Memverifikasi fungsi pencetakan bukti kuitansi mandiri dan tautan navigasi langsung ke tiket pemeliharaan dari baris buku kas.
* **Kondisi Awal**: Baris transaksi `TRX-202610-015` (Cuci AC rutin 3 unit & isi freon, Rp 1.500.000) memiliki tautan tiket `#TKT-003`.
* **Langkah-langkah**:
  1. Klik tombol trigger **"Dokumen"** pada baris `TRX-202610-015`.
  2. Verifikasi keberadaan opsi tautan khusus *"Buka Tiket #TKT-003"*.
  3. Klik opsi **"Cetak Kuitansi"**.
  4. Amati respon Toast dan dialog cetak.
  5. Klik badge tautan tiket `#TKT-003` langsung pada kolom uraian transaksi.
* **Hasil Diharapkan**:
  - Popover menampilkan opsi khusus bertanda obeng oranye: *"Buka Tiket #TKT-003"* dengan tautan URL mengarah ke `WF-08-tiket.html?highlight=TKT-003`.
  - Memilih "Cetak Kuitansi" memunculkan Toast info: *"Mencetak kuitansi pengeluaran..."* dan memanggil fungsi `window.print()` browser.
  - Mengklik badge tiket `#TKT-003` pada tabel mengarahkan pengelola langsung ke layar tiket pemeliharaan dengan tiket terkait tersorot otomatis.

---

### SKENARIO 09: Pencatatan Mutasi Kas Operasional Baru (Happy Path via `#modalExpense`)
* **Tujuan**: Memastikan pengelola dapat mencatat mutasi pengeluaran kas baru secara lengkap, memperbarui saldo berjalan, dan menambahkan transaksi ke puncak buku kas.
* **Kondisi Awal**: Pengguna berada di tab `Buku Kas Umum`. Saldo kas berjalan terakhir adalah Rp 17.400.000 (16 transaksi).
* **Langkah-langkah**:
  1. Klik tombol CTA utama **"+ Catat Mutasi Kas"** (`.btn-action-primary`) di bilah kontrol kanan.
  2. Pada modal `#modalExpense`:
     - Kategori: Biarkan default *"Listrik PLN (Token Fasum & Pompa)"*.
     - Tanggal Transaksi: Terisi default `24 Oktober 2026` via RumaDatePicker.
     - Nominal Biaya: Masukkan angka `250000` (terformat otomatis menjadi `250.000`).
     - Entitas / Vendor: Ketik `"PLN Mobile Prabayar"`.
     - Uraian / Deskripsi: Ketik `"Beli token listrik pompa air lantai 3 & cadangan fasum"`.
  3. Biarkan tautan tiket kosong (*"Tanpa Tautan Tiket"*).
  4. Klik tombol simpan **"Simpan Mutasi Kas"** (`.btn-modal-primary`).
* **Hasil Diharapkan**:
  - Modal `#modalExpense` tertutup secara mulus.
  - Muncul notifikasi Toast sukses: `Mutasi kas Rp 250.000 berhasil dicatat ke buku besar!`.
  - Transaksi baru masuk ke baris paling atas tabel buku kas dengan ID baru `TRX-202610-017`.
  - Tanggal tertulis `24 Okt 2026`, kategori berbadge biru `Listrik PLN`, nominal kredit `(Rp 250.000)`.
  - Saldo kas berjalan berkurang secara akurat: Rp 17.400.000 - Rp 250.000 = `Rp 17.150.000`.
  - Counter badge Buku Kas di tab dan header bertambah dari `16` menjadi `17 Transaksi Terverifikasi`.

---

### SKENARIO 10: Validasi Ketat Formulir Pengeluaran Kas (Zero / Negative Nominal & Required Fields)
* **Tujuan**: Mencegah kesalahan manusia (*human error*) saat mencatat kas keluar (nominal nol, karakter non-angka, uraian kosong).
* **Kondisi Awal**: Modal `#modalExpense` dalam keadaan terbuka.
* **Langkah-langkah**:
  1. Kosongkan input nominal biaya (`#inputExpenseAmount`), lalu klik tombol **"Simpan Mutasi Kas"**.
  2. Masukkan nominal `0`, lalu klik **"Simpan Mutasi Kas"**.
  3. Masukkan nominal `500000`, namun biarkan textarea deskripsi (`#inputExpenseDesc`) kosong, lalu klik simpan.
* **Hasil Diharapkan**:
  - Pada langkah 1 & 2: Form menolak submit dan sistem memunculkan Toast error: `Harap masukkan nominal biaya pengeluaran!`.
  - Pada langkah 3: Form menolak submit dan sistem memunculkan Toast error: `Harap isi uraian mutasi pengeluaran kas!`.
  - Tidak ada data transaksi kosong/ilegal yang masuk ke dalam `ledgerData`.

---

### SKENARIO 11: Penautan Tiket Kerusakan pada Pengeluaran Kas (Autocomplete & Clear Search)
* **Tujuan**: Menguji fungsionalitas kotak pencarian langsung tiket maintenance (`#directTicketSearchWrap`) di dalam formulir pencatatan kas operasional.
* **Kondisi Awal**: Modal `#modalExpense` sedang terbuka.
* **Langkah-langkah**:
  1. Klik pada input pencarian tiket langsung (`#ticketSearchDirectInput`).
  2. Ketikkan kata kunci `"AC"` atau `"A-03"`.
  3. Amati daftar hasil pencarian pada popover `#directTicketResults`.
  4. Klik opsi tiket **"#TKT-003 • Servis AC Kamar A-03"**.
  5. Verifikasi bahwa nilai terpilih masuk dan tombol silang clear muncul.
  6. Klik tombol silang `#btnClearTicketSelection`.
* **Hasil Diharapkan**:
  - Popover hasil pencarian membuka daftar tiket secara dinamis saat fokus.
  - Mengetik `"AC"` menyaring daftar dan hanya menampilkan `#TKT-003 • Servis AC Kamar A-03`.
  - Memilih tiket tersebut mengisi input dengan teks label tiket, menyimpan kode `TKT-003` ke hidden input `#expenseTicketCode`, dan menampilkan tombol silang pembersih.
  - Mengklik tombol silang membersihkan input, mengembalikan hidden value ke string kosong `""`, dan mengembalikan opsi ke *"Tanpa Tautan Tiket"*.

---

### SKENARIO 12: Pengunggahan Struk Bukti Pengeluaran & Kalkulasi Ukuran File Otomatis
* **Tujuan**: Memverifikasi area dropzone unggah bukti pembayaran/nota operasional dan validasi preview ukuran file.
* **Kondisi Awal**: Modal `#modalExpense` sedang terbuka.
* **Langkah-langkah**:
  1. Klik area dropzone unggah struk (`.file-upload-dropzone`).
  2. Pilih berkas gambar contoh: `nota-belanja-material.jpg` (ukuran misal 350 KB).
  3. Amati perubahan visual pada area dropzone.
* **Hasil Diharapkan**:
  - File picker sistem operasi terbuka dan menerima format gambar (`image/*`) serta PDF.
  - Setelah berkas dipilih:
    - Judul dropzone berubah menjadi *"Ganti Berkas Nota"*.
    - Kotak preview hijau `#attachedPhotoPreviewExpense` muncul (`display: inline-flex`).
    - Menampilkan teks: `1 Berkas Terlampir: nota-belanja-material.jpg (350 KB)` dengan ikon centang hijau.
    - Ukuran berkas terformat otomatis dalam KB atau MB sesuai besaran riil file.

---

### SKENARIO 13: Audit Laporan Laba Rugi Komprehensif (Tab 2: P&L MoM Variance)
* **Tujuan**: Memeriksa struktur Laporan Laba Rugi sesuai standar akuntansi properti kost, perhitungan pendapatan kotor, pos OPEX, laba operasi bersih (NOI), dan analisis varians bulanan (*Month-over-Month*).
* **Kondisi Awal**: Pengguna beralih ke tab **"Laba Rugi (P&L)"** (`#panelPL`).
* **Langkah-langkah**:
  1. Amati Section 1: Pendapatan Operasional Sewa (Gross Revenue).
  2. Amati Section 2: Beban Operasional & Pemeliharaan Gedung (OPEX).
  3. Amati Section 3: Laba Operasional Bersih (Net Operating Income / NOI).
  4. Periksa strip kesimpulan bawah dan catatan akuntansi.
* **Hasil Diharapkan**:
  - Section 1 Gross Revenue:
    - Pendapatan sewa kamar rutin (11 kamar terisi): `Rp 21.650.000` (Okt) vs `Rp 21.000.000` (Sep), varians positif `+Rp 650 Rb (+3.1%)`.
    - Total Gross Revenue: `Rp 21.650.000`.
  - Section 2 OPEX:
    - Beban Utilitas Listrik: `(Rp 1.250.000)` vs `(Rp 1.180.000)` (+5.9%).
    - Beban Utilitas Air PDAM: `(Rp 450.000)` vs `(Rp 420.000)` (+7.1%).
    - Beban Internet WiFi: `(Rp 650.000)` vs `(Rp 650.000)` (0.0%).
    - Pemeliharaan Cuci AC (#TKT-003): `(Rp 1.500.000)` vs `(Rp 1.350.000)` (+11.1%).
    - Retribusi Kebersihan: `(Rp 400.000)` vs `(Rp 400.000)` (0.0%).
    - Total OPEX: `(Rp 4.250.000)` vs `(Rp 4.000.000)` (+6.3%).
  - Section 3 NOI:
    - Laba Operasional Bersih: `Rp 17.400.000` vs `Rp 17.000.000`, varians laba tumbuh `+Rp 400 Rb (+2.4%)`.
  - Strip bawah mengonfirmasi Margin Laba Operasional sebesar `80.4% (Margin Sehat)`.
  - Terdapat box catatan akuntansi audit yang menjelaskan bahwa pendapatan diakui berbasis kas riil yang telah diverifikasi Pemilik.

---

### SKENARIO 14: Audit Kinerja 15 Kamar (Tab 3: Unit Matrix), Utilisasi & Biaya Servis Unit
* **Tujuan**: Mengevaluasi utilisasi 15 kamar per lantai, pemisahan unit terisi vs kosong, pemotongan biaya servis pada net kontribusi kamar, dan kartu peluang omzet (*Opportunity Cost*).
* **Kondisi Awal**: Pengguna beralih ke tab **"Kinerja Kamar (15)"** (`#panelUnitMatrix`).
* **Langkah-langkah**:
  1. Periksa pembagian kelompok lantai (Lantai 1 Blok A, Lantai 2 Blok B, Lantai 3 Blok C).
  2. Periksa status unit kosong (Kamar A-02 di Lantai 1 dan Kamar C-04 di Lantai 3).
  3. Periksa unit yang terdampak biaya servis (Kamar A-03, B-03, C-03 dengan beban servis AC Rp 500.000).
  4. Periksa kartu oranye **Peluang Tambahan Omzet (Opportunity Cost)** di bawah tabel.
* **Hasil Diharapkan**:
  - Lantai 1: 5 unit (4 terisi, 1 kosong).
  - Lantai 2: 5 unit (100% Okupansi Terisi Penuh).
  - Lantai 3: 5 unit (4 terisi, 1 kosong).
  - Kamar kosong (A-02 dan C-04) ditandai dengan baris highlight khusus `.tr-unit-vacant`, badge `Kosong 31 Hari`, realisasi omzet `Rp 0`, dan yield `0%` (merah).
  - Kamar A-03, B-03, C-03: Realisasi omzet Rp 1.650.000 dikurangi Biaya Servis `(Rp 500.000)` menghasilkan Net Kontribusi `Rp 1.150.000` dengan Yield `69.7%`.
  - Strip ringkasan bawah: Total Kapasitas 15 Kamar, Okupansi 13 Terisi (86.7%), Realisasi Omzet Rp 21.650.000, Net Kontribusi Kamar Rp 20.150.000 (93.1%).
  - Kartu Opportunity Cost menginformasikan: *"Terdapat 2 unit kamar kosong (A-02 & C-04). Potensi penambahan arus kas sewa sebesar +Rp 2.300.000 / bulan jika mencapai 100% Okupansi"* dengan tautan tombol cepat ke `WF-03-kamar.html?status=kosong`.

---

### SKENARIO 15: Analisis Umur Piutang & Ketepatan Pembayaran (Tab 4: Aging Schedule)
* **Tujuan**: Memeriksa disiplin pembayaran 11 penyewa aktif, penyaringan segmen toleransi/lancar, filter lantai, dan visualisasi delta ketepatan bayar.
* **Kondisi Awal**: Pengguna beralih ke tab **"Umur Piutang (11)"** (`#panelAging`).
* **Langkah-langkah**:
  1. Periksa tabel piutang awal dengan segmen filter *"Semua (11)"*.
  2. Klik tab segmen **"Masa Toleransi (2)"** (`#agingTabTenggang`).
  3. Amati baris data yang tersaring.
  4. Klik pill filter lantai **"Lt 1"**.
  5. Kembalikan filter ke segmen *"Semua"* dan lantai *"Semua Lt"*.
* **Hasil Diharapkan**:
  - Pada segmen *"Semua"*: menampilkan seluruh 11 unit tagihan. 9 berstatus Tepat Waktu (hijau) dan 2 berstatus Masa Toleransi (oranye).
  - Pada segmen *"Masa Toleransi"*:
    - Tabel menyaring hanya 2 penyewa yang membayar lewat dari tanggal 05 Okt:
      1. Dimas Prasetyo (Kamar A-03, jatuh tempo 05 Okt, bayar 07 Okt, delta `H+2`, Masa Toleransi).
      2. Hendrik Santoso (Kamar C-03, jatuh tempo 05 Okt, bayar 08 Okt, delta `H+3`, Masa Toleransi).
    - Counter header dan tab berubah menjadi `2 Unit Tagihan`.
  - Saat mengklik "Lt 1": tabel menyaring hanya menyisakan Dimas Prasetyo (Kamar A-03).
  - Strip bawah mengonfirmasi: Collection Rate `100% Tertagih (Buku Bersih)` dengan Piutang Menunggak `Rp 0 · Zero Default (0.0%)`.

---

### SKENARIO 16: Alur Ekspor Data Finansial ke Format Spreadsheet CSV (UTF-8 BOM Generator)
* **Tujuan**: Memvalidasi modal ekspor laporan keuangan (`#modalExport`), pemilihan format CSV, konfigurasi cakupan modul, dan pembuatan berkas `.csv` berstandar internasional yang kompatibel dengan Microsoft Excel dan Google Sheets.
* **Kondisi Awal**: Pengguna berada di layar utama `WF-07`.
* **Langkah-langkah**:
  1. Klik tombol **"Ekspor CSV"** (`.btn-action-outline`) di bilah kontrol kanan.
  2. Pada modal `#modalExport`:
     - Verifikasi pill format terpilih adalah **"Spreadsheet (.CSV)"** (`#btnFormatCsv`).
     - Pada pilihan cakupan data, klik **"Buku Kas Saja"** (`#btnScopeLedger`).
  3. Amati bagian kalkulasi & ringkasan pra-unduh:
     - Periksa nama berkas preview.
     - Periksa tipe encoding.
  4. Klik tombol **"Unduh Berkas Sekarang"** (`#btnSubmitExport`).
* **Hasil Diharapkan**:
  - Modal `#modalExport` terbuka.
  - Memilih format CSV memunculkan badge `Standar Tabular (.CSV)` dan keterangan bahwa format siap dibuka di Excel & Sheets.
  - Memilih cakupan "Buku Kas Saja" mengubah preview nama berkas menjadi: `RumaKost_Buku_Kas_Okt2026_ledger.csv`.
  - Mengklik unduh:
    - Modal otomatis tertutup.
    - Fungsi `downloadCsvReport()` membuat Blob teks dengan prepended `\uFEFF` (UTF-8 Byte Order Mark) agar karakter Indonesia dan angka terbaca tanpa rusak di Microsoft Windows Excel.
    - Berkas `RumaKost_Buku_Kas_Oktober_2026_ledger.csv` terunduh otomatis ke folder Downloads peramban.
    - Toast sukses muncul: `Berkas CSV Laporan Finansial RumaKost (ledger) berhasil diunduh!`.

---

### SKENARIO 17: Alur Ekspor Dokumen Resmi PDF Standar PDF-1.4 Siap Cetak & Lembar Tanda Tangan
* **Tujuan**: Memverifikasi pembuatan dokumen resmi PDF (Adobe PDF-1.4) siap cetak langsung dari sisi klien lengkap dengan lembar pengesahan tanda tangan Pemilik.
* **Kondisi Awal**: Modal `#modalExport` sedang terbuka.
* **Langkah-langkah**:
  1. Klik pill opsi **"Dokumen Resmi (.PDF)"** (`#btnFormatPdf`).
  2. Amati perubahan kartu spesifikasi berkas pra-unduh.
  3. Pastikan cakupan terpilih adalah **"Semua Modul"** (`#btnScopeAll`).
  4. Klik tombol **"Unduh Berkas Sekarang"**.
* **Hasil Diharapkan**:
  - Badge format berubah menjadi `Dokumen Formal (.PDF)`.
  - Tipe encoding berubah menjadi `Dokumen Resmi Audit A4 (Adobe PDF 1.4)`.
  - Target nama berkas tertera: `RumaKost_Laporan_Finansial_Okt2026_all.pdf`.
  - Notice penjelasan menyatakan bahwa format PDF menyajikan 4 Gauges KPI, Laporan Laba Rugi komprehensif, dan lembar pengesahan tanda tangan.
  - Mengklik unduh:
    - Fungsi `downloadPdfReport()` menyusun binary PDF stream standar 1.4 lengkap dengan blok teks, ringkasan eksekutif KPI, daftar jurnal kas, dan tanda tangan Budi Santoso (Pemilik Kost).
    - Berkas `RumaKost_Laporan_Finansial_Oktober_2026_all.pdf` terunduh otomatis ke perangkat.
    - Toast sukses muncul: `Dokumen PDF Resmi RumaKost (all) berhasil diunduh!`.

---

### SKENARIO 18: Ekspor Terpadu dengan Alur Cetak Otomatis (Auto-Print Workflow) & Cetak Global
* **Tujuan**: Menguji fitur checkbox cetak formal otomatis pasca unduh serta tombol cetak dokumen global pada bilah kontrol.
* **Kondisi Awal**: Modal `#modalExport` terbuka dengan format PDF terpilih.
* **Langkah-langkah**:
  1. Centang opsi checkbox **"Buka Pratinjau Cetak Formal (A4) Sekaligus"** (`#autoPrintAfterDownload`).
  2. Klik tombol **"Unduh Berkas Sekarang"**.
  3. Tunggu hingga proses unduh selesai.
  4. Setelah kembali ke halaman utama, klik tombol **"Cetak Dokumen"** (`.btn-action-outline`) pada bilah filter utama.
* **Hasil Diharapkan**:
  - Checkbox tercentang dengan rapi.
  - Saat tombol unduh diklik, dokumen PDF terunduh dan setelah jeda 600ms sistem otomatis memicu `printFormalReport()`.
  - Muncul notifikasi Toast info: `Menyiapkan format cetak dokumen pembukuan resmi (PDF)...`.
  - Dialog cetak peramban (`window.print()`) terbuka dengan styling CSS media cetak yang rapi, menyembunyikan navbar dan tombol aksi.
  - Tombol cetak langsung pada bilah filter juga memicu alur pratinjau cetak yang sama secara instan.

---

### SKENARIO 19: Penegakan Batasan Wewenang Peran (RBAC): Simulasi Mode Staf & Masking Laba Bersih
* **Tujuan**: Memastikan integritas keamanan hak akses data bahwa Staf Operasional tidak dapat melihat angka laba bersih (NOI) Pemilik, sesuai aturan mutlak `docs/pm/SCOPE_STATEMENT.md` dan `KANBAN.md (RK-020)`.
* **Kondisi Awal**: Pengguna berada di layar utama `WF-07` dalam mode default Pemilik (Superadmin).
* **Langkah-langkah**:
  1. Amati widget mengambang di pojok kanan bawah: Role Simulator Bar (`.wf-badge-role-bar`).
  2. Klik tombol **"Simulasi Role"** (`.btn-toggle-role-pill`).
  3. Amati perubahan URL, teks simulator label, dan nilai pada Kartu 1 (Surplus Kas / NOI).
  4. Periksa apakah staf tetap dapat mengakses Buku Kas Umum dan mencatat pengeluaran operasional.
  5. Klik kembali tombol **"Simulasi Role"** untuk mengembalikan sesi ke Pemilik.
* **Hasil Diharapkan**:
  - Halaman memuat ulang dengan parameter query string `?role=staf`.
  - Role simulator label berubah menjadi *"Mode Staf Operasional"*.
  - **Mekanisme Masking Sensitif Berjalan Sempurna**:
    - Nilai pada `#kpiNoiValue` (Kartu 1) yang semula `Rp 17,40 Jt` diganti dengan badge proteksi gembok abu-abu:  
      `<i data-lucide="lock"></i> Proteksi Pemilik`.
    - Staf dilarang melihat angka laba bersih dan margin profit pemilik.
  - Staf tetap memiliki akses ke pencatatan kas operasional harian (token listrik, belanja kebersihan) di mana nama pencatat otomatis tercatat sebagai `Rini (Staf)`.
  - Mengembalikan simulasi ke Pemilik menghapus parameter `?role=staf` dan menampilkan kembali seluruh angka finansial secara transparan.

---

### SKENARIO 20: Penanganan Respon Zero State & Aksesibilitas Keyboard (ESC / Click Outside)
* **Tujuan**: Memverifikasi respons visual sistem ketika pencarian tidak menemukan hasil (*Filter Zero State*) dan keandalan penutupan popover/modal via tombol Escape serta klik di luar elemen.
* **Kondisi Awal**: Pengguna berada di layar `WF-07`.
* **Langkah-langkah**:
  1. Ketikkan kata kunci acak yang tidak ada pada data: `"XYZ999QWERTY"` pada `#auditSearchInput`.
  2. Amati respons visual pada tabel Buku Kas Umum dan tab Umur Piutang.
  3. Buka menu popover periode audit `#periodPopoverMenu`, lalu klik area kosong kanvas di luar menu.
  4. Buka modal pengeluaran `#modalExpense`, lalu tekan tombol **`Escape`** (ESC) pada keyboard.
* **Hasil Diharapkan**:
  - Pada langkah 1 & 2 (*Filter Zero State*):
    - Tabel tidak rusak atau kosong melompong, melainkan menampilkan kontainer Empty State terpusat dengan ikon kotak masuk abu-abu (`inbox`).
    - Judul: *"Tidak Ada Transaksi yang Cocok"* / *"Tidak Ada Data Piutang yang Cocok"*.
    - Pesan panduan: *"Coba ubah kata kunci pencarian atau reset filter pos akun."*.
  - Pada langkah 3 (*Click-Outside Dismissal*):
    - Popover periode dan filter akun langsung menutup saat pengguna mengklik area luar dokumen.
  - Pada langkah 4 (*Accessibility Keyboard Event*):
    - Menekan tombol `Escape` menutup modal aktif `#modalExpense` seketika dan mengembalikan fokus pengguna.

---

### SKENARIO 21: Segmentasi Piutang "Menunggak (0)" & Evaluasi Absolute Zero Default State
* **Tujuan**: Memverifikasi tampilan dan respon visual tabel Umur Piutang (*Tab 4*) ketika pengguna memilih segmen penagihan tanpa tunggakan (*Zero Default Portfolio*).
* **Kondisi Awal**: Pengguna berada di tab **"Umur Piutang (11)"** (`#panelAging`).
* **Langkah-langkah**:
  1. Amati tombol segmen tab piutang: `Semua (11)`, `Tepat Waktu (9)`, `Masa Toleransi (2)`, dan `Menunggak (0)`.
  2. Klik tombol tab segmen **"Menunggak (0)"** (`#agingTabMenunggak`).
  3. Periksa perubahan isi tabel dan badge counter header.
* **Hasil Diharapkan**:
  - Tombol segmen "Menunggak (0)" memperoleh styling aktif (`.active`).
  - Karena tidak ada piutang macet pada portofolio bulan berjalan (`status === 'menunggak'` berjumlah 0), tabel secara instan menampilkan kotak Empty State:
    - Ikon bulat abu-abu `inbox`.
    - Judul: *"Tidak Ada Data Piutang yang Cocok"*.
    - Subteks: *"Coba ubah filter status atau kata kunci pencarian."*.
  - Counter badge header diperbarui menjadi `0 Unit Tagihan` dan badge tab menjadi `0`.
  - Strip bawah tetap menyajikan ringkasan kesehatan portofolio: `Piutang Menunggak: Rp 0 · Zero Default (0.0%)` dan `Collection Rate: 100% Tertagih (Buku Bersih)`.

---

### SKENARIO 22: Penyusutan Otomatis Header Kluster Lantai (Floor Group Row Collapsing) pada Kinerja Kamar
* **Tujuan**: Memvalidasi algoritma penyaringan cerdas pada tab Kinerja Kamar (*Tab 3*) yang secara otomatis menyembunyikan header pemisah lantai jika tidak ada satu pun unit kamar di lantai tersebut yang cocok dengan kata kunci pencarian.
* **Kondisi Awal**: Pengguna berada di tab **"Kinerja Kamar (15)"** (`#panelUnitMatrix`). Seluruh 3 header lantai (Lantai 1 Blok A, Lantai 2 Blok B, Lantai 3 Blok C) sedang tampil.
* **Langkah-langkah**:
  1. Ketikkan nama penghuni unik di Lantai 1: `"Lina Marlina"` pada `#auditSearchInput`.
  2. Amati baris tabel yang terlihat.
  3. Hapus pencarian dan ketikkan tipe kamar yang hanya ada di sudut tertentu: `"Deluxe VIP"`.
* **Hasil Diharapkan**:
  - Pada langkah 1:
    - Hanya Kamar A-01 yang cocok.
    - Header *Lantai 1 — Blok A* tetap tampil karena memiliki anak (*child row*) yang cocok.
    - Header *Lantai 2 — Blok B* dan *Lantai 3 — Blok C* **disembunyikan secara otomatis** (`display: none`) karena tidak memiliki anak kamar yang cocok (*Floor Group Collapsing*).
    - Counter badge header dan tab diperbarui menjadi `1 Kamar Terdaftar`.
  - Pada langkah 3 ("Deluxe VIP"):
    - Hanya Kamar A-04 yang tampil di bawah header Lantai 1; header Lantai 2 dan 3 tetap disembunyikan rapi.

---

### SKENARIO 23: Preservasi Konteks Akuntansi pada Tab Laba Rugi (P&L Subtotal & Divider Retention)
* **Tujuan**: Memastikan integritas visual Laporan Laba Rugi saat difilter: pos akun individual disaring sesuai kata kunci, namun baris judul seksi, subtotal, dan laba operasional bersih tetap dipertahankan agar rasio keuangan tetap terbaca utuh.
* **Kondisi Awal**: Pengguna berada di tab **"Laba Rugi (P&L)"** (`#panelPL`).
* **Langkah-langkah**:
  1. Masukkan kata kunci pos beban: `"PDAM"` pada `#auditSearchInput`.
  2. Amati struktur tabel laporan laba rugi.
* **Hasil Diharapkan**:
  - Baris beban individual yang tidak mengandung kata "PDAM" disembunyikan.
  - Baris detail *"Beban Utilitas: Air Bersih PDAM Tirta Moedal"* tetap tampil.
  - **Konteks Akuntansi Terjaga**: Seluruh baris header seksi (`.pl-sec-hdr`), baris subtotal (`.pl-subtotal`), dan grand total laba operasional bersih (`.pl-grandtotal`) **tetap terlihat** (`display: ''`).
  - Pengelola tetap dapat membaca posisi subtotal dan NOI tanpa kehilangan konteks hierarki laporan keuangan.

---

### SKENARIO 24: Penegakan Mutual Exclusion pada Seluruh Lapisan Menu Popover
* **Tujuan**: Menjamin tidak terjadi penumpukan (*UI overlay collision / z-index clashing*) antara popover Periode Audit, popover Filter Pos Akun, popover menu dokumen baris, dan dropdown formulir.
* **Kondisi Awal**: Pengguna berada di layar utama `WF-07`.
* **Langkah-langkah**:
  1. Klik tombol trigger Periode Audit (`.btn-audit-period`) hingga `#periodPopoverMenu` terbuka.
  2. Tanpa menutup popover periode, langsung klik tombol trigger Filter Pos Akun (`.btn-account-filter`).
  3. Buka popover dokumen pada baris pertama (`TRX-202610-016`), lalu langsung klik tombol dokumen pada baris kedua (`TRX-202610-015`).
* **Hasil Diharapkan**:
  - Saat trigger Filter Pos Akun diklik pada langkah 2, fungsi `toggleAccountFilterDropdown()` secara otomatis menutup `#periodPopoverMenu` (`classList.remove('open')`) sebelum membuka dirinya sendiri.
  - Saat tombol dokumen baris kedua diklik pada langkah 3, fungsi `toggleDocMenu()` memanggil `closeAllDocMenus()` sehingga popover dokumen baris pertama tertutup otomatis sebelum popover baris kedua terbuka.
  - Hanya ada 1 popover menu aktif di layar pada satu waktu (*Strict Single Popover Invariant*).

---

### SKENARIO 25: Pembersihan & Sanitasi State Formulir Kas Operasional saat Dibuka Ulang
* **Tujuan**: Memastikan modal pencatatan kas (`#modalExpense`) selalu dalam kondisi bersih (*pristine state*) tanpa residu data dari sesi penginputan sebelumnya.
* **Kondisi Awal**: Pengguna sempat membuka modal kas, mengunggah foto struk, memilih tiket perbaikan, mengetik nominal, lalu membatalkannya dengan mengklik tombol "Batal".
* **Langkah-langkah**:
  1. Klik kembali tombol CTA **"+ Catat Mutasi Kas"** (`.btn-action-primary`).
  2. Periksa seluruh field formulir: dropdown kategori, datepicker, nominal, dropzone berkas, dan kotak tiket maintenance.
* **Hasil Diharapkan**:
  - Fungsi `openExpenseModal()` mengeksekusi sanitasi lengkap:
    - `form.reset()` mengosongkan nominal, entitas, dan deskripsi textarea.
    - Dropzone foto preview `#attachedPhotoPreviewExpense` disembunyikan (`display: none`) dan teks dropzone di-reset ke *"Unggah Foto Nota / Kuitansi"*.
    - Dropdown kategori akun dikembalikan ke default *"Listrik PLN (Token Fasum & Pompa)"* (`utility`).
    - Input tiket langsung dibersihkan (`clearDirectTicketSelection()`) dan popover hasil tiket ditutup.
    - Tanggal transaksi di-reinisialisasi ke default `2026-10-24`.
  - Formulir siap digunakan tanpa risiko tercampurnya data lama (*zero state leakage*).

---

### SKENARIO 26: Tata Letak Cetak Dokumen Formal (@media print) & Penelanjangan Elemen Interaktif
* **Tujuan**: Memvalidasi kepatuhan aturan cetak media (`@media print`) untuk pelaporan audit fisik kertas A4, memastikan seluruh tombol aksi, bilah filter, dan dekorasi web disembunyikan secara bersih.
* **Kondisi Awal**: Pengguna berada di layar `WF-07` dengan tab `Buku Kas Umum` atau `Laba Rugi (P&L)` aktif.
* **Langkah-langkah**:
  1. Tekan pintasan cetak browser (`Ctrl + P`) atau klik tombol **"Cetak Dokumen"** (`.btn-action-outline`).
  2. Periksa pratinjau cetak (*Print Preview*) peramban.
* **Hasil Diharapkan**:
  - **Penelanjangan UI Chrome (CSS Print Stripping)**:
    - Seluruh elemen non-dokumen disembunyikan total (`display: none !important`): Top Canopy, Floating Topbar, Bilah Filter & Pencarian, Bar Navigasi Tab, Tombol Simulasi Role, Tombol Aksi Tambah Kas, Dropdown Dokumen Baris, dan Modal Backdrop.
  - Latar belakang kanvas diubah menjadi putih murni (`#FFFFFF`) dengan warna teks gelap pekat (`#0F172A`) dan aturan `print-color-adjust: exact` aktif.
  - Lebar container `.dashboard-wrapper` disesuaikan menjadi `100%` tanpa margin/padding berlebih.
  - Tabel jurnal pembukuan dan tabel laba rugi membentang rapi memenuhi lebar kertas A4 standar akuntansi tanpa terpotong horizontal.

---

### SKENARIO 27: Adaptasi Tata Letak Responsif Mobile & Horizontal Swipe Tab Bar (Reflow Layout)
* **Tujuan**: Memastikan fungsionalitas dan ergonomi antarmuka audit keuangan tetap prima saat diakses melalui perangkat tablet (viewport $\le 900\text{px}$) maupun ponsel cerdas ($\le 600\text{px}$).
* **Kondisi Awal**: Layar dibuka pada mode emulasi peramban responsif.
* **Langkah-langkah**:
  1. Perkecil lebar viewport browser ke $900\text{px}$ (ukuran tablet).
  2. Amati susunan 4 kartu metrik Estify dan bilah filter.
  3. Lakukan gestur geser (*swipe/horizontal scroll*) pada baris tab laporan.
  4. Perkecil kembali viewport ke $600\text{px}$ (ukuran mobile).
  5. Periksa susunan strip ringkasan bawah (*Reconciliation Strip*).
* **Hasil Diharapkan**:
  - Pada $900\text{px}$:
    - Kluster 3 kartu metrik (`.metrics-row-3`) beralih dari 3 kolom ke 1 kolom bertumpuk vertikal yang mudah dibaca.
    - Bilah kontrol filter (`.audit-filter-bar`) bertransisi menjadi `flex-direction: column` dengan input pencarian melebar 100%.
    - Baris tab navigasi (`.report-segmented-cluster`) mengaktifkan `overflow-x: auto` dengan momentum gulir sentuh halus (`-webkit-overflow-scrolling: touch`) dan scrollbar tersembunyi (*clean swipeable tabs*).
    - Strip ringkasan bawah terbagi simetris ke dalam 2 kolom (`grid-template-columns: repeat(2, 1fr)`).
  - Pada $600\text{px}$:
    - Strip ringkasan bawah ter-reflow menjadi 1 kolom bertumpuk (`grid-template-columns: 1fr`) dengan padding kompak $12\text{px}$, bebas dari overflow horizontal pada layar sempit.

---

### SKENARIO 28: Deep-Linking Lintas Modul: Tindak Lanjut Peluang Omzet Kamar Kosong ke WF-03
* **Tujuan**: Menguji integrasi alur kerja manajerial dari evaluasi potensi omzet yang hilang (*Opportunity Cost*) di modul laporan menuju eksekusi pemasaran unit kamar di modul katalog kamar (`WF-03`).
* **Kondisi Awal**: Pengguna berada di tab **"Kinerja Kamar (15)"** (`#panelUnitMatrix`).
* **Langkah-langkah**:
  1. Gulir ke bawah tabel matriks 15 kamar hingga menemukan kartu **Peluang Tambahan Omzet (Opportunity Cost)**.
  2. Baca informasi potensi tambahan arus kas sewa: `+Rp 2.300.000 / bulan` dari 2 kamar kosong (A-02 dan C-04).
  3. Klik tombol aksi **"Kelola Kamar Kosong"** (`.btn-action-primary`).
* **Hasil Diharapkan**:
  - Browser mengeksekusi navigasi langsung ke URL target: `WF-03-kamar.html?status=kosong`.
  - Sistem membawa parameter query string `status=kosong` untuk memicu filter otomatis pada katalog kamar `WF-03` agar pengelola dapat langsung menerbitkan iklan sewa WhatsApp (`shareRoomPromo()`) atau mendaftarkan calon penyewa baru tanpa pencarian manual.

---

### SKENARIO 29: Sanitasi Otomatis Input Nominal & Eliminasi Karakter Non-Numerik (formatRupiahInput)
* **Tujuan**: Menguji ketahanan input nominal kas (`#inputExpenseAmount`) terhadap *pasting* teks tak valid, huruf, simbol mata uang, serta penanganan angka nol di depan (*leading zeros*).
* **Kondisi Awal**: Modal `#modalExpense` sedang terbuka.
* **Langkah-langkah**:
  1. Ketik atau tempel (*paste*) teks dengan format bercampur: `"Rp 1.500.000,00 biaya perbaikan"`.
  2. Hapus seluruh isi input, lalu ketik angka dengan nol di depan: `"000750000"`.
  3. Hapus kembali input hingga kosong.
* **Hasil Diharapkan**:
  - Pada langkah 1: Fungsi `formatRupiahInput()` menggunakan ekspresi reguler `replace(/\D/g, '')` secara instan melucuti seluruh karakter non-digit, mengonversinya ke integer, dan menghasilkan teks terformat rapi: `1.500.000` (tanpa kata dan simbol).
  - Pada langkah 2: `parseInt('000750000', 10)` otomatis memangkas seluruh angka nol di depan dan memformatnya menjadi `750.000`.
  - Pada langkah 3: Menghapus seluruh karakter mengembalikan field menjadi string kosong `""` tanpa menampilkan `NaN` atau `Rp 0`.

---

### SKENARIO 30: Dinamika Visual Pos Akun & Pemetaan Otomatis 7 Kluster Badge Transaksi
* **Tujuan**: Memverifikasi logika fungsi `getCategoryBadge()` yang memetakan kategori transaksi ke dalam 7 tema warna dan ikon Lucide yang spesifik secara otomatis.
* **Kondisi Awal**: Tab `Buku Kas Umum` aktif.
* **Langkah-langkah**:
  1. Periksa badge pada transaksi sewa kamar (tipe `income`), misal `TRX-202610-012`.
  2. Periksa badge pada pengeluaran token listrik fasum (`TRX-202610-004`).
  3. Periksa badge pada pengeluaran tagihan PDAM (`TRX-202610-013`).
  4. Periksa badge pada pengeluaran langganan WiFi IndiHome (`TRX-202610-014`).
  5. Periksa badge pada pemeliharaan servis AC (`TRX-202610-015`).
  6. Periksa badge pada retribusi kebersihan & sampah (`TRX-202610-016`).
* **Hasil Diharapkan**:
  - Pemasukan sewa: Badge hijau (`#ECFDF5`), border `#A7F3D0`, teks `#059669`, ikon rumah `home`.
  - Listrik/Utilitas: Badge biru (`#EFF6FF`), border `#BFDBFE`, teks `#2563EB`, ikon petir `zap`.
  - Air/PDAM: Badge cyan (`#ECFEFF`), border `#A5F3FC`, teks `#0891B2`, ikon tetesan `droplet`.
  - Internet/WiFi: Badge pink (`#FDF2F8`), border `#FBCFE8`, teks `#DB2777`, ikon gelombang `wifi`.
  - Servis Gedung: Badge oranye (`#FFF7ED`), border `#FED7AA`, teks `#EA580C`, ikon kunci pas `wrench`.
  - Kebersihan/Sampah: Badge ungu (`#F5F3FF`), border `#DDD6FE`, teks `#7C3AED`, ikon kilau `sparkles`.
  - Seluruh ikon Lucide ter-render dengan skala tajam $11\times 11\text{px}$.

---

### SKENARIO 31: Pratinjau Kuitansi Pembayaran Sewa Masuk (Income Receipt vs Expense Proof)
* **Tujuan**: Memastikan bahwa modal pratinjau bukti dokumen (`#modalProofView`) dapat digunakan secara fleksibel untuk memeriksa kuitansi penerimaan sewa penghuni maupun bukti pengeluaran kas operasional.
* **Kondisi Awal**: Pengguna berada di tab `Buku Kas Umum`.
* **Langkah-langkah**:
  1. Temukan baris mutasi penerimaan sewa kamar: `TRX-202610-012` (Hendrik Santoso, Kamar C-03, +Rp 1.650.000).
  2. Klik tombol trigger **"Dokumen"** pada baris tersebut.
  3. Klik opsi **"Lihat Nota / Struk"**.
  4. Periksa data yang ditampilkan di dalam modal `#modalProofView`.
* **Hasil Diharapkan**:
  - Modal `#modalProofView` terbuka sempurna.
  - Header No. Referensi memuat: `TRX-202610-012`.
  - Badge kategori memuat: `Sewa Kamar`.
  - Uraian Transaksi memuat: *"Pelunasan Sewa Kamar C-03 (Bulan Oktober 2026)"*.
  - Nominal Riil memuat: `Rp 1.650.000`.
  - Tanggal Transaksi: `08 Okt 2026`.
  - Pencatat Transaksi: `Hendrik Santoso (Kamar C-03)`.
  - Modal berfungsi ganda sebagai penyaji bukti transaksi kas keluar maupun arsip tanda terima pelunasan sewa masuk.

---

### SKENARIO 32: Visualisasi Kolektibilitas Tagihan & Diferensiasi Ikon Metode Bayar (QRIS vs Transfer)
* **Tujuan**: Memvalidasi rendering cerdas pada tab Umur Piutang (*Tab 4*) yang menghasilkan inisial avatar penghuni, badge deviasi hari, dan diferensiasi ikon metode bayar.
* **Kondisi Awal**: Pengguna berada di tab **"Umur Piutang (11)"** (`#panelAging`).
* **Langkah-langkah**:
  1. Amati kolom penyewa untuk Lina Marlina (`LM`) dan Budi Santoso (`BS`).
  2. Amati kolom Metode Pembayaran untuk Budi Santoso (Kamar A-04, `QRIS Statis Kost`).
  3. Amati kolom Metode Pembayaran untuk Dewi Anggraini (Kamar B-01, `Transfer BCA`).
  4. Amati badge deviasi pada kolom Realisasi Bayar: bandingkan pelunasan lebih awal (`H-4` s/d `H-1`) vs masa toleransi (`H+2`, `H+3`).
* **Hasil Diharapkan**:
  - Avatar lingkaran abu-abu menampilkan inisial 2 huruf terpotong otomatis (`initials = tenant.split(' ').map(n => n[0]).slice(0, 2).join('')`).
  - Metode pembayaran QRIS secara dinamis memuat ikon barcode `qr-code`, sedangkan Transfer Bank memuat ikon kartu `credit-card`.
  - Realisasi bayar sebelum/pada jatuh tempo (misal Rahmat Hidayat `H-4`, Lina Marlina `H-3`) memperoleh badge hijau `.aging-delta-badge.is-ontime`.
  - Realisasi bayar terlambat dalam batas toleransi (Dimas Prasetyo `H+2`, Hendrik Santoso `H+3`) memperoleh teks tanggal kuning-oranye (`#D97706`) dan badge amber `.aging-delta-badge.is-grace`.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Komponen & Fitur Terlibat | Batasan Scope | Status Verifikasi |
|---|---|---|---|---|
| **SK-01** | Inisialisasi Layar & 4 KPI Gauges Estify | Topbar, Radial Gauges, Rekonsiliasi Kas | F-06 (P0) / 1 Properti | **PASSED (100%)** |
| **SK-02** | Navigasi 4-Way Segmented Report Tabs | Tab Buttons, Dynamic Placeholder | F-06 (P0) | **PASSED (100%)** |
| **SK-03** | Audit Jurnal Buku Kas Umum & Saldo Berjalan | `#panelLedger`, Debit/Kredit, Summary Strip | F-05, F-06 (P0) | **PASSED (100%)** |
| **SK-04** | Smart Search Bar Simultan Lintas 4 Tab | `#auditSearchInput`, `#btnClearAuditSearch` | F-06 (P0) | **PASSED (100%)** |
| **SK-05** | Filter Pos Akun Buku Kas (Account Filter) | `#accountFilterPopover`, Counter Badge | F-06 (P0) | **PASSED (100%)** |
| **SK-06** | Filter Periode Audit Pembukuan (Period Popover)| `#periodPopoverMenu`, Toast Notification | F-06 (P0) | **PASSED (100%)** |
| **SK-07** | Inspeksi Bukti Transaksi Kas (Modal Proof) | `#modalProofView`, Struk/Nota Preview | F-06, F-11 (P0/P1) | **PASSED (100%)** |
| **SK-08** | Cetak Kuitansi & Tautan Silang Tiket Servis | Popover Dokumen, Direct URL `#TKT-xxx` | F-07, F-11 (P0/P1) | **PASSED (100%)** |
| **SK-09** | Pencatatan Mutasi Kas Baru (Happy Path) | `#modalExpense`, Saldo Real-Time | F-06 (P0) | **PASSED (100%)** |
| **SK-10** | Validasi Ketat Form Kas (Zero/Negative Amount)| Form Validation, Toast Error Guard | F-06 (P0) | **PASSED (100%)** |
| **SK-11** | Penautan Tiket Maintenance pada Kas | `#directTicketSearchWrap`, Autocomplete | F-07, F-11 (P0/P1) | **PASSED (100%)** |
| **SK-12** | Unggah Struk Pengeluaran & Auto Size KB/MB | File Dropzone, Live File Preview | F-11 (P1) | **PASSED (100%)** |
| **SK-13** | Audit Laporan Laba Rugi Komprehensif (P&L) | `#panelPL`, MoM Variance, Margin 80.4% | F-06 (P0) | **PASSED (100%)** |
| **SK-14** | Audit Kinerja 15 Kamar & Opportunity Cost | `#panelUnitMatrix`, Floor Group, Vacant Box | F-02, F-06 (P0) | **PASSED (100%)** |
| **SK-15** | Analisis Umur Piutang (Aging Schedule) | `#panelAging`, Delta Hari, Toleransi H+3 | F-04, F-05 (P0) | **PASSED (100%)** |
| **SK-16** | Ekspor Spreadsheet CSV (UTF-8 with BOM) | `#modalExport`, `downloadCsvReport()` | F-10 (P1) / Client-Side | **PASSED (100%)** |
| **SK-17** | Ekspor Dokumen Resmi PDF Standar PDF-1.4 | `#modalExport`, `downloadPdfReport()` | F-10 (P1) / Client-Side | **PASSED (100%)** |
| **SK-18** | Alur Ekspor Cetak Otomatis (Auto-Print) | `#autoPrintAfterDownload`, Print Layout | F-10 (P1) | **PASSED (100%)** |
| **SK-19** | Penegakan RBAC: Simulasi Staf & Masking NOI | Role Simulator, Lock Badge `#kpiNoiValue` | F-01, F-06 (P0) | **PASSED (100%)** |
| **SK-20** | Respon Zero State & Aksesibilitas Tombol ESC | Empty State Box, ESC Listener, Dismiss | Accessibility Standards | **PASSED (100%)** |
| **SK-21** | Segmentasi Piutang Menunggak & Zero Default | `#agingTabMenunggak`, Absolute Zero State | F-04, F-05 (P0) | **PASSED (100%)** |
| **SK-22** | Floor Group Row Collapsing pada Kinerja Kamar | `.floor-group-row`, Filter DOM Logic | F-02, F-06 (P0) | **PASSED (100%)** |
| **SK-23** | Preservasi Subtotal & Divider saat Filter P&L | `.pl-subtotal-row`, Audit Context Guard | F-06 (P0) | **PASSED (100%)** |
| **SK-24** | Mutual Exclusion Seluruh Menu Popover | `togglePeriodDropdown`, `toggleDocMenu` | UI Stability Guard | **PASSED (100%)** |
| **SK-25** | Sanitasi & Reset State Formulir Kas Dibuka Ulang| `openExpenseModal()`, Zero State Leakage | Form Integrity Guard | **PASSED (100%)** |
| **SK-26** | Media Cetak Formal (@media print) & UI Stripping| Print Stylesheet, Full-Width Table A4 | Financial Audit Print | **PASSED (100%)** |
| **SK-27** | Reflow Responsif & Swipeable Tabs (Tablet/Mobile)| CSS Media Queries, Touch Scrolling | Mobile Ergonomics | **PASSED (100%)** |
| **SK-28** | Deep-Linking Opportunity Cost ke WF-03 (?status) | Opportunity Card, `WF-03-kamar.html` | Cross-Module Navigation | **PASSED (100%)** |
| **SK-29** | Sanitasi Input Nominal & Anti-Leading Zero | `formatRupiahInput()`, Regex `\D` Strip | Input Masking Guard | **PASSED (100%)** |
| **SK-30** | Dinamika Visual Pos Akun & 7 Kluster Badge | `getCategoryBadge()`, Icon Lucide Matrix | Category Mapping Engine | **PASSED (100%)** |
| **SK-31** | Pratinjau Kuitansi Sewa Masuk (Income Proof) | `#modalProofView`, Income & Expense Dual | Document Viewer Versatility | **PASSED (100%)** |
| **SK-32** | Ikon QRIS vs Transfer & Delta Hari Piutang | `renderAgingTable()`, Icon `qr-code` | Visual Payment Fidelity | **PASSED (100%)** |

---

## 5. Rujukan Dokumen Terkait

- **Scope Baseline Frozen**: `docs/pm/SCOPE_STATEMENT.md` (Medium MVP, 1 Properti Mandiri, 7 Kelompok P0).
- **Spesifikasi Wireframe Layar**: `docs/design/screens/WF-07-laporan.html` (`SCR-12` & `SCR-13`).
- **Peta Navigasi & Arsitektur Layar**: `docs/design/SITEMAP.md` (Hubungan SCR-12 Pengeluaran & SCR-13 Laporan).
- **Log Pelacakan Fitur KANBAN**: `docs/pm/KANBAN.md` (`RK-006`, `RK-020`, `RK-034`, `RK-035`, `RK-036`).
- **Skenario Layar Terkait**: `docs/design/SCENARIOS_WF01.md` (Autentikasi & RBAC), `docs/design/SCENARIOS_WF03.md` (Katalog Kamar), `docs/design/SCENARIOS_WF09.md` (Pengaturan Properti & Akun Pengguna).
