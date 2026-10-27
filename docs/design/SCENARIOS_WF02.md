# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-02: Dasbor Eksekutif & Operasional (SCR-02 & SCR-02-STAF)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-02-dashboard.html` & `docs/design/screens/WF-02-staf-dashboard.html`  
> **Fitur Terkait**: **F-01** (Akses dan Peran / RBAC), **F-02** (Manajemen Kamar), **F-03** (Penghuni & Kontrak), **F-04** (Tagihan Berulang), **F-05** (Pembayaran & Saldo), **F-06** (Laporan Arus Kas & Okupansi), **F-07** (Ticketing Kerusakan)  
> **User Stories KANBAN**: `RK-001` (Epic Dasbor Multi-Peran), `RK-002` (Ringkasan Keuangan Eksekutif), `RK-003` (Monitoring Okupansi Kamar), `RK-004` (Pemantauan Arus Kas), `RK-005` (Katalog Cepat Kamar), `RK-006` (Log Aktivitas Operasional)  
> **Hak Akses Layar**: **Pemilik Properti (Owner / Superadmin) & Staf Pengelola (Staff / Operasional Terbatas)** — *Penghuni Kost diblokir dan dialihkan ke Portal Mandiri*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-02 (`SCR-02`)** adalah pusat komando visual terpadu (*Executive & Operational Command Center*) untuk sistem manajemen RumaKost. Mengadaptasi filosofi **Estify Real Estate Modern Minimalist DNA**, antarmuka ini mengintegrasikan seluruh ringkasan bisnis esensial ke dalam kanvas 2-kolom asimetris (`minmax(0, 1fr) 360px`) yang padat, proporsional, dan bebas dari distorsi visual (*anti-slop*).

Layar ini menegakkan 4 pilar arsitektur operasional:
1. **Dua Perspektif Peran (Role-Adaptive Presentation)**:
   - **Pemilik (Owner)**: Memperoleh visibilitas menyeluruh atas metrik finansial sensitif (pemasukan kotor, pengeluaran, laba bersih, kolektibilitas tagihan), grafik arus kas 6 bulan, akses penuh ke navigasi Laporan (`WF-07`) dan Pengaturan (`WF-09`).
   - **Staf Pengelola (Staff)**: Mengakses dasbor operasional dengan pembatasan ketat (*Zero Confidential Leak* & *Zero Self-Approval*). Indikator peran menampilkan badge *"Staf Operasional"*, navigasi dibatasi pada 5 pill harian, dan akses ke pengaturan properti dinonaktifkan.
2. **Koleksi Metrik Tiga-Serangkai (Estify Radial Gauge)**: Tiga kartu metrik semi-lingkaran (*semi-circle radial gauge*) menyajikan ringkasan instan tingkat okupansi fisik (73%), kolektibilitas tagihan sewa (82%), dan realisasi pengeluaran terhadap anggaran (84%) tanpa membebani kognisi pengguna.
3. **Komparasi Finansial & Highlight Properti**: Mengombinasikan visualisasi *Double Bar Chart* 6-bulan (Mei s.d. Oktober 2026) dengan kartu *Hero Property Highlight* berwarna oranye Estify (`#FF7A00`) yang menyajikan laba bersih berjalan (Rp 12,3 Jt) secara elegan dan lugas.
4. **Infinite Looping Room Carousel**: Menampilkan katalog 15 unit kamar kost secara horizontal yang mengalir mulus (*infinite wrap-around*), dilengkapi filter instan popover nir-rongga (*zero-void*), pencarian teks bebas lag, dan navigasi langsung ke berkas dossier kamar (`WF-03`).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WF-02 DASHBOARD ARSITEKTUR                                     │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 1. KOLOM UTAMA KIRI (~68% FLOW CONTAINER)                        │ 2. SIDEBAR KANAN (360PX FIXED)│
│    ├─ ROW 1: 3 GAUGE METRIC CARDS (CMP-06)                       │    ├─ CARD 1: KONDISI PROPERTI│
│    │  • Okupansi Kamar (11/15 Unit · 73% Gauge)                  │    │  • Progress Pengerjaan   │
│    │  • Tagihan Lunas (Rp 16,5 Jt · 82% Gauge)                   │    │  • Menunggu Penugasan    │
│    │  • Pengeluaran (Rp 4,2 Jt · 84% Gauge)                      │    │  • Laporan Baru          │
│    ├─ ROW 2: DOUBLE BAR CHART & HIGHLIGHT CARD                   │    │  • CTA 44px: Tiket (WF-08)│
│    │  • Arus Kas 6 Bulan (Mei - Okt 2026) + Hover Tooltip        │    │                               │
│    │  • Popover Filter Tahun (2026, 2025, 2024)                  │    ├─ CARD 2: AKTIVITAS HARIAN│
│    │  • Orange Highlight: Kost Budi Makmur · Net Rp 12,3 Jt      │    │  • Popover Filter Waktu  │
│    ├─ ROW 3: KAMAR KOST TERKINI (CAROUSEL 15 UNIT)               │    │  • 5 Feed Log Interaktif │
│    │  • Toolbar 40px: Search Capsule + Filter Popover Status     │    │  • Deep Links Operasional│
│    │  • Infinite Scroll Carousel (Tampil Awal 3 Unit)            │    │  • Link Semua Aktivitas  │
│    │  • Kartu Kamar 3-Baris + In-Card Arrow 28px                 │    │                               │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             WF-02-STAF DASBOR OPERASIONAL ARSITEKTUR                              │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 1. KOLOM UTAMA KIRI (~65% FLOW CONTAINER)                        │ 2. SIDEBAR KANAN (380PX FIXED)│
│    ├─ TOP: STAFF HERO BANNER                                     │    ├─ CARD 1: CHECKLIST HARIAN│
│    │  • Shift Pagi (08:00 - 17:00) + Operator Rini Setiawati     │    │  • 4 Item Tugas Operasional  │
│    │  • Tombol Sinkron Data Piket & Log Inventaris               │    │  • Checkbox & Strike-through │
│    ├─ ROW 1: 3 GAUGE KPI OPERASIONAL (ZERO CONFIDENTIAL LEAK)    │    │  • Counter Selesai Dinamis   │
│    │  • Okupansi Kamar (11/15 Unit · 73% Gauge) → WF-03          │    ├─ CARD 2: PETA CEPAT KAMAR│
│    │  • Tiket Perbaikan Aktif (3 Tiket · 60% Gauge) → WF-08      │    │  • 15 Unit (3 Lantai @ 5 Unit)│
│    │  • Setoran Pending Owner (2 Transaksi · 50% Gauge) → WF-05  │    │  • Semantic Color Badges     │
│    ├─ ROW 2: ANTREAN TIKET MENDESAK HARI INI                     │    │  • Quick Link ke Detail Unit │
│    │  • Tiket #T-03: Kamar A-04 (AC Tidak Dingin)                │    ├─ CARD 3: KONTAK TEKNISI  │
│    │  • Action: Perbarui Status (Modal) & WA Vendor (+62 812..) │    │  • Pak Joko AC & Bpk. Hendra │
│    │  • Shortcut: Lihat Antrean Penuh Tiket Lapangan             │    │  • Quick Call & WA Shortcuts │
│    ├─ ROW 3: CATAT PEMBAYARAN TUNAI / MANUAL                     │    └───────────────────────────────┘
│    │  • Form Catat: Dropdown Kamar (Autofill Tarif), Tgl, Ket    │
│    │  • Reset Button & Submit (Pending Owner · Zero Self-Approve)│
│    │  • Log Pembayaran Staf Hari Ini (Dimas A-02 & Dodi B-01)    │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai dengan ketetapan **Frozen Scope Medium (1 Properti Mandiri, 7 Kelompok P0)** pada `docs/pm/SCOPE_STATEMENT.md`, pengujian fungsional layar WF-02 dikunci pada batasan berikut:

| Area Batasan | Ketetapan Scope Medium (In-Scope) | Batasan Mutlak (Out-of-Scope / P3 Won't) |
| :--- | :--- | :--- |
| **Batas Properti** | 1 Properti Mandiri: *"Kost Budi Makmur"*, Jl. Flamboyan No. 12 (15 Unit Kamar, 3 Lantai). | Dilarang menguji *multi-property switcher*, agregasi portofolio antar-cabang, atau hierarki holding. |
| **Pencatatan Pembayaran** | Pencatatan konfirmasi manual oleh Pemilik (tunai atau transfer bank manual yang dicek mandiri). | Tidak ada *automated payment gateway* (Midtrans/Xendit) atau *auto-banking mutasi scrape*. |
| **Notifikasi WhatsApp** | Tautan tindakan manual menggunakan protokol URL `https://wa.me/` dengan template teks baku. | Dilarang menguji bot WhatsApp API resmi berbayar atau *webhook scheduler* otomatis pihak ketiga. |
| **Manajemen Pengguna** | Akun Staf dan Penghuni dibuat & dikelola terpusat oleh Pemilik via `WF-09`. | Dilarang menguji formulir registrasi publik mandiri (*public sign-up*). |
| **Karakter Data** | Seluruh data pengujian (nama penghuni, nomor kontak, riwayat sewa) adalah **Data Sintetis**. | Dilarang menggunakan PII (*Personally Identifiable Information*) riil dari responden riset. |

---

## 3. Matriks Data Baseline (Testing Fixtures)

### 3.1 Profil Entitas Kamar (15 Unit Sintetis)

| No | Kode Kamar | Lantai | Tipe & Spesifikasi | Tarif Bulanan | Penghuni Aktif / Status | Status Hunian |
|---|---|---|---|---|---|---|
| 1 | **KM-A01** | Lantai 1 | Deluxe Standar (3×4m) | Rp 1.200.000 | Siti Aminah | `Terisi · Lunas` |
| 2 | **KM-A02** | Lantai 1 | Deluxe Standar (3×4m) | Rp 1.200.000 | Dimas Prasetyo | `Terlambat H+5` |
| 3 | **KM-A03** | Lantai 1 | Standar (3×4m) | Rp 1.100.000 | *(Kosong)* | `Kosong · Siap Huni` |
| 4 | **KM-A04** | Lantai 1 | Superior (3.5×4m) | Rp 1.500.000 | Budi Santoso | `Jatuh Tempo H-3` |
| 5 | **KM-A05** | Lantai 1 | Standar (3×4m) | Rp 1.100.000 | Sri Wahyuni | `Terisi · Lunas` |
| 6 | **KM-B01** | Lantai 2 | Standar (3×4m) | Rp 1.300.000 | Dodi Firmansyah | `Telat 3 Hari` |
| 7 | **KM-B02** | Lantai 2 | Standar (3×4m) | Rp 1.300.000 | Rini Marlina | `Terisi · Lunas` |
| 8 | **KM-B03** | Lantai 2 | Deluxe (4×5m) | Rp 1.800.000 | *(Kosong)* | `Kosong · Siap Huni` |
| 9 | **KM-B04** | Lantai 2 | Standar (3×4m) | Rp 1.300.000 | Eko Prasetyo | `Terisi · Lunas` |
| 10 | **KM-B05** | Lantai 2 | Standar AC (3.5×4m) | Rp 1.500.000 | *(Perbaikan Tiket #T-04)* | `Dalam Perbaikan` |
| 11 | **KM-C01** | Lantai 3 | Standar AC (3.5×4m) | Rp 1.400.000 | Hendra Wijaya | `Terisi · Lunas` |
| 12 | **KM-C02** | Lantai 3 | Deluxe Corner (4.5×5m)| Rp 1.900.000 | *(Kosong)* | `Kosong · Siap Huni` |
| 13 | **KM-C03** | Lantai 3 | Standar (3×4m) | Rp 1.350.000 | Rian Hidayat | `Terisi · Lunas` |
| 14 | **KM-C04** | Lantai 3 | Standar (3×4m) | Rp 1.350.000 | Mega Lestari | `Terisi · Lunas` |
| 15 | **KM-C05** | Lantai 3 | Standar (3×4m) | Rp 1.350.000 | Aditya Pratama | `Terisi · Lunas` |

### 3.2 Metrik Finansial & Operasional Periode Berjalan (Oktober 2026)

| Parameter Metrik | Nilai Nominal / Angka | Persentase / Indikator | Basis Kalkulasi |
|---|---|---|---|
| **Kapasitas Total Kamar** | 15 Unit | 100% | 5 kamar per lantai (3 lantai) |
| **Kamar Terhuni Aktif** | 11 Unit | **73% Okupansi** | 11 unit dihuni (8 Lunas, 3 Jatuh Tempo / Terlambat: A-02, A-04, B-01) |
| **Kamar Kosong Siap Huni**| 3 Unit | 20% Kekosongan | KM-A03, KM-B03, KM-C02 |
| **Kamar Dalam Perbaikan** | 1 Unit | 7% Maintenance | KM-B05 (Tiket Servis AC #T-04) |
| **Penerimaan Sewa Lunas** | Rp 16.500.000 | **82% Kolektibilitas** | Target potensi sewa penuh: Rp 20.100.000 |
| **Pengeluaran Operasional**| Rp 4.200.000 | **84% Realisasi Budget**| Anggaran operasional bulanan: Rp 5.000.000 |
| **Pemasukan Bersih (Net)** | **Rp 12.300.000** | **+15% Trend Laba** | Pemasukan (16,5 Jt) - Pengeluaran (4,2 Jt) |
| **Distribusi Tiket Kerusakan**| 4 Tiket Aktif | 100% Beban Kerja | 2 Dikerjakan (50%), 1 Menunggu (25%), 1 Baru (25%) |

---

## 4. Daftar Skenario Pengujian End-to-End Terperinci

### SKENARIO 01: Akses Dasbor Eksekutif Pemilik (Owner Superadmin Full Access)
- **Tujuan**: Memastikan Pemilik Properti memiliki akses tanpa batas ke seluruh ringkasan bisnis, data finansial sensitif, dan menu navigasi penuh.
- **Kondisi Awal (Pre-condition)**: Pengguna login sebagai `budi.santoso@rumakost.id` (Peran: Pemilik). Rute browser mengarah ke `WF-02-dashboard.html` tanpa parameter role staf.
- **Langkah-langkah Pengujian**:
  1. Buka halaman `WF-02-dashboard.html`.
  2. Periksa Topbar navigasi utama (`#mainTopbar`).
  3. Periksa tampilan kartu metrik, grafik arus kas, dan kartu highlight laba bersih.
  4. Periksa menu dropdown profil pengguna di sudut kanan atas Topbar.
- **Hasil yang Diharapkan**:
  - Topbar menampilkan 7 pill menu utama lengkap: `Dashboard` (status aktif berlatar `#111111`), `Kamar`, `Penghuni`, `Tagihan`, `Pembayaran`, `Laporan`, `Tiket`.
  - Icon profil pengguna menampilkan inisial `"BS"` dengan dropdown yang menyertakan tautan ke `WF-09-pengaturan.html`.
  - Kartu Metrik Baris 1 menampilkan nominal nominal rupiah lengkap: Tagihan Lunas (Rp 16,5 Jt) dan Pengeluaran (Rp 4,2 Jt).
  - Kartu Highlight Oranye menampilkan Pemasukan Bersih sebesar Rp 12,3 Jt tanpa sensor.
  - Tautan *"Lihat Laporan Lengkap"* pada grafik mengarah ke `WF-07-laporan.html`.

---

### SKENARIO 02: Akses Dasbor Operasional Staf & Pembatasan Hak Akses (Staff Restricted Mode)
- **Tujuan**: Memvalidasi adaptasi tampilan saat Staf Operasional mengakses dasbor dan menegakkan pemisahan wewenang (*Zero Confidential Leak* & *Zero Self-Approval*).
- **Kondisi Awal**: Pengguna login sebagai `rini.operasional@rumakost.id` (Peran: Staf Pengelola). Rute browser: `WF-02-dashboard.html?role=staf`.
- **Langkah-langkah Pengujian**:
  1. Buka halaman `WF-02-dashboard.html?role=staf`.
  2. Amati siklus hidup eksekusi fungsi `renderTopbar()` pada `assets/js/components.js`.
  3. Verifikasi pengalihan rute ke dasbor staf khusus `WF-02-staf-dashboard.html`.
  4. Amati struktur Topbar navigasi operasional dan banner shift kerja.
  5. Klik avatar profil Staf pada sudut kanan atas.
  6. Periksa ketiadaan tombol atau tautan ke modul keuangan sensitif (`WF-07` Laporan dan `WF-09` Pengaturan).
- **Hasil yang Diharapkan**:
  - Skrip pengaman otorisasi mendeteksi peran staf dan mengeksekusi `window.location.replace('WF-02-staf-dashboard.html')`.
  - Topbar otomatis beralih ke konfigurasi Staf: hanya menampilkan 5 pill navigasi (`Dashboard Operasional`, `Kamar`, `Penghuni`, `Tagihan & Catat Bayar`, `Tiket Perbaikan`).
  - Menu `Laporan` dan `Tiket` (superadmin) tidak dirender di Topbar.
  - Sisi kanan Topbar memunculkan badge identitas peran: *"Staf Operasional"* dengan aksen latar `#FEF3C7` dan teks `#D97706`.
  - Dropdown pengguna menampilkan profil *"Rini Setiawati"* tanpa opsi ke menu Pengaturan Akun Pemilik.

---

### SKENARIO 03: Guardrail Keamanan Peran Penghuni (Tenant Block & Auto-Redirect)
- **Tujuan**: Memastikan integritas isolasi data di mana Penghuni Kost dilarang keras melihat ringkasan keuangan dan operasional properti.
- **Kondisi Awal**: Pengguna memiliki sesi aktif sebagai Penghuni (`role=penghuni` atau `budi.penghuni@rumakost.id`).
- **Langkah-langkah Pengujian**:
  1. Buka URL `WF-02-dashboard.html?role=penghuni` secara langsung pada address bar browser.
  2. Amati siklus hidup eksekusi fungsi `renderTopbar()` pada `assets/js/components.js`.
- **Hasil yang Diharapkan**:
  - Skrip pengaman otorisasi mendeteksi peran `tenant` pada halaman dasbor utama manajemen.
  - Sistem memblokir rendering konten dan segera mengeksekusi pengalihan paksa (*forced redirection*) ke `WF-10-portal-penghuni.html`.
  - Tidak ada data kamar penghuni lain, saldo kost, atau tiket perbaikan global yang bocor ke browser penghuni.

---

### SKENARIO 04: Validasi Kalkulasi & Visualisasi 3 Speedometer Radial Gauge Cards
- **Tujuan**: Memverifikasi ketepatan nilai metrik, label konteks, dan render SVG gauge progress arc pada Baris 1 dasbor.
- **Kondisi Awal**: Pemilik berada pada halaman dasbor utama.
- **Langkah-langkah Pengujian**:
  1. Amati Kartu 1 (*Okupansi Kamar*):
     - Periksa judul, ikon bangunan berlatar peach lembut, nilai okupansi, dan arc SVG.
  2. Amati Kartu 2 (*Tagihan Lunas*):
     - Periksa judul, ikon kwitansi berlatar dark, nominal rupiah, dan arc SVG hitam.
  3. Amati Kartu 3 (*Pengeluaran*):
     - Periksa judul, ikon panah pengeluaran, nominal rupiah, dan arc SVG merah.
- **Hasil yang Diharapkan**:
  - **Kartu 1**: Nilai menampilkan `"11"` dengan sub-nilai `"/ 15 Kamar"`. Arc lingkaran luar berwana oranye `#FF7A00` dengan `stroke-dashoffset="29"`, teks tengah SVG menunjukkan `"73%"`. Badge tren menampilkan `"+1 Unit"` disertai ikon Lucide `arrow-up`.
  - **Kartu 2**: Nilai menampilkan `"Rp 16,5 Jt"`. Arc SVG berwarna hitam `#111111` dengan `stroke-dashoffset="19"`, teks tengah SVG menunjukkan `"82%"`. Badge tren menampilkan `"+8%"` disertai ikon Lucide `arrow-up`.
  - **Kartu 3**: Nilai menampilkan `"Rp 4,2 Jt"`. Arc SVG menggunakan warna semantik Danger `#EF4444` dengan `stroke-dashoffset="17"`, teks tengah SVG menunjukkan `"84%"`. Badge tren menampilkan `"-4%"` disertai ikon Lucide `arrow-down`.

---

### SKENARIO 05: Eksplorasi Grafik Arus Kas Komparatif & Tooltip Interaktif 6-Bulan
- **Tujuan**: Menguji interaksi kartu grafik *Double Bar Chart* saat kursor diarahkan ke setiap kolom bulan.
- **Kondisi Awal**: Kanvas grafik *"Arus Kas & Operasional"* menampilkan 6 pasang batang (Mei s.d. Okt 2026).
- **Langkah-langkah Pengujian**:
  1. Amati bulan berjalan (Oktober 2026):
     - Periksa warna batang pemasukan dan pengeluaran pada status default.
  2. Arahkan kursor (*hover*) ke kolom bulan **Mei 2026**:
     - Amati respon visual batang dan kemunculan tooltip melayang.
  3. Geser kursor ke kolom bulan **Juni 2026**, **Juli 2026**, **Agustus 2026**, dan **September 2026**.
  4. Pindahkan kursor ke luar area grafik.
- **Hasil yang Diharapkan**:
  - Pada status diam, bulan Oktober (bulan berjalan) memiliki status aktif: batang pemasukan menyala oranye `#FF7A00` dan batang pengeluaran hitam `#111111`. Bulan Mei-September berada dalam mode pastel/muted (`#FED7AA` dan `#E2E8F0`).
  - Saat kursor berada di atas bulan Mei: kedua batang bertransformasi naik halus (`scaleY(1.04)`), warnanya menyala aktif, dan muncul tooltip putih ber-border halus (`.bar-hover-tooltip`) yang menampilkan rincian: *"Mei 2026"*, *"Pemasukan: Rp 13,5 Jt"*, *"Pengeluaran: Rp 2,8 Jt"*.
  - Saat kursor berpindah keluar grafik, tooltip menghilang secara instan (*opacity: 0, visibility: hidden*).

---

### SKENARIO 06: Penyaringan Arsip Periode Tahunan Arus Kas (Year Filter Popover)
- **Tujuan**: Memverifikasi interaktivitas filter tahun pada header kartu Arus Kas & Operasional menggunakan Custom Popover Dropdown (Pilar 5).
- **Kondisi Awal**: Header kartu Arus Kas menampilkan trigger dropdown *"Tahun 2026"*.
- **Langkah-langkah Pengujian**:
  1. Klik kapsul trigger `#wrapYearFilter .pill-dropdown-trigger`.
     - *Verifikasi UI*: Menu popover `#menuYearFilter` terbuka ke arah kanan bawah (`display: flex`), opsi *"Tahun 2026 (Berjalan)"* memiliki class `.selected` (latar hitam `#111111`).
  2. Klik opsi item **"Tahun 2025 (Arsip)"**.
- **Hasil yang Diharapkan**:
  - Menu popover menutup secara otomatis.
  - Label teks trigger berganti menjadi *"Tahun 2025"*.
  - Muncul toast notifikasi: *"Memuat data keuangan Arus Kas tahun 2025..."* (Tipe: `info`, Judul: `Filter Periode`).
  - Kelas `.selected` berpindah ke item Tahun 2025.

---

### SKENARIO 07: Peninjauan Kartu Performa Highlight Properti & Ringkasan Laba Bersih
- **Tujuan**: Memastikan integritas kartu oranye Estify (`.orange-highlight-card`) dalam menyajikan identitas hunian dan akumulasi keuntungan bersih.
- **Kondisi Awal**: Kartu oranye tampil di sebelah kanan grafik pada Baris 2.
- **Langkah-langkah Pengujian**:
  1. Periksa elemen identitas properti: tag pill *"Properti Utama"*, sub-metadata alamat, dan judul besar properti.
  2. Periksa blok penekanan utama (*Emphasis Block*): nominal laba bersih dan pill tren.
  3. Klik tombol lingkaran panah di sudut kanan atas kartu (`.highlight-arrow-round`).
- **Hasil yang Diharapkan**:
  - Teks metadata menampilkan: *"Jl. Flamboyan No. 12 · 15 Unit"*.
  - Judul besar properti berbunyi *"Kost Budi Makmur"*.
  - Angka laba bersih tampil tegas dengan ukuran 30px bold: `"Rp 12,3 Jt"` disertai badge trend `"+15%"` dengan ikon Lucide `arrow-up`.
  - Background kartu bersih dengan motif garis kontur arsitektural halus tanpa bocor (*overflow hidden, border-radius 20px*).
  - Mengklik tombol panah mengarahkan navigasi browser ke katalog kamar lengkap `WF-03-kamar.html`.

---

### SKENARIO 08: Navigasi Katalog Kamar Berkelanjutan (Infinite Looping Room Carousel)
- **Tujuan**: Menguji engine perputaran kamar nir-batas (*infinite wrap carousel*) pada kartu *Kamar Kost Terkini*.
- **Kondisi Awal**: Carousel menampilkan 3 kartu pertama (KM-A01, KM-A02, KM-A03) di posisi scroll tengah awal.
- **Langkah-langkah Pengujian**:
  1. Klik tombol navigasi lingkaran panah kanan (`chevron-right`) sebanyak 3 kali berturut-turut.
  2. Lanjutkan menggulir ke kanan hingga melewati kamar terakhir (KM-C05).
  3. Lakukan pengguliran mundur menggunakan tombol panah kiri (`chevron-left`) hingga melewati kamar pertama (KM-A01).
  4. Lakukan pengguliran menggunakan roda mouse (*mouse wheel*) vertikal di atas area carousel.
- **Hasil yang Diharapkan**:
  - Setiap klik tombol panah menggeser viewport secara presisi sebesar 3 lebar kartu (`behavior: smooth`).
  - Saat scroll mencapai batas ujung klon akhir (KM-C05), engine looping mengeksekusi reset posisi secara transparan tanpa kedipan layar (*silent snap-back*) ke set kartu orisinil.
  - Pengguliran mundur ke kiri melewati KM-A01 secara mulus menyambung ke KM-C05 tanpa terputus.
  - Putaran roda mouse vertikal diterjemahkan secara ergonomis menjadi pergeseran horizontal (*horizontal scroll translation*).

---

### SKENARIO 09: Pencarian Cepat Unit Kamar & Filter Teks (Quick Room Search)
- **Tujuan**: Memverifikasi fitur pencarian instan pada kapsul search toolbar 40px untuk menyaring kamar berdasarkan nomor unit atau nama penyewa.
- **Kondisi Awal**: Carousel berada pada posisi normal (15 kamar aktif).
- **Langkah-langkah Pengujian**:
  1. Klik input pencarian `#quickRoomSearchInput`.
  2. Ketik kata kunci `"B-03"`.
     - *Amati respon UI*.
  3. Ganti kata kunci menjadi nama penyewa: `"Hendra"`.
     - *Amati respon UI*.
  4. Klik tombol silang kecil (*clear button*) `#clearQuickRoomSearch`.
- **Hasil yang Diharapkan**:
  - Saat input terisi teks, tombol clear (`#clearQuickRoomSearch`) yang tadinya tersembunyi langsung muncul (`display: inline-flex`).
  - Seluruh set kartu klon infinite carousel otomatis disembunyikan agar pencarian hanya memadankan 15 unit unik orisinil.
  - Pencarian `"B-03"` menampilkan tepat 1 kartu: Kamar B-03 (`Kosong · Siap Huni`). Badge count toolbar menunjukkan `"1 Unit"`.
  - Pencarian `"Hendra"` menampilkan tepat 1 kartu: Kamar C-01 (`Hendra Wijaya`). Badge count toolbar menunjukkan `"1 Unit"`.
  - Mengklik tombol clear membersihkan field input, menyembunyikan tombol silang, dan mengembalikan tampilan carousel 15 unit lengkap.

---

### SKENARIO 10: Penyaringan Unit Kamar Berdasarkan Status Hunian (Room Status Popover Filter)
- **Tujuan**: Menguji penyaringan kamar menggunakan popover status unit pada toolbar kamar.
- **Kondisi Awal**: Field pencarian kosong. Filter status berada pada opsi default *"Semua Unit (15)"*.
- **Langkah-langkah Pengujian**:
  1. Klik tombol filter lingkaran `#wrapFilterRoomStatus button`.
     - *Verifikasi UI*: Popover menu `#menuFilterRoomStatus` terbuka menampilkan 5 opsi kategori status dengan badge jumlah unit.
  2. Klik opsi **"Kosong · Siap Huni (3)"**.
     - *Amati respon carousel dan badge count*.
  3. Buka kembali popover, lalu pilih opsi **"Terlambat / Tempo (2)"**.
     - *Amati respon carousel*.
  4. Buka kembali popover, lalu pilih opsi **"Semua Unit (15)"**.
- **Hasil yang Diharapkan**:
  - Pemilihan *"Kosong · Siap Huni"* memfilter tampilan sehingga hanya menampilkan 3 unit kartu bergaris putus-putus (`KM-A03`, `KM-B03`, `KM-C02`). Badge total count berubah menjadi `"3 Unit"`. Muncul toast informasi: *"Menampilkan kamar: Kosong · Siap Huni"*.
  - Pemilihan *"Terlambat / Tempo"* menampilkan tepat 2 unit: `KM-A02` (badge merah Terlambat H+5) dan `KM-A04` (badge kuning Jatuh Tempo H-3). Badge count menjadi `"2 Unit"`.
  - Memilih kembali *"Semua Unit"* memulihkan seluruh 15 kartu kamar dan me-reset engine infinite scroll.

---

### SKENARIO 11: Penyaringan Kombinasi Multivariat (Text Query + Status Filter Synchronization)
- **Tujuan**: Memastikan logika filter gabungan (Query Teks AND Kategori Status) berjalan harmonis tanpa tabrakan logika.
- **Kondisi Awal**: Semua kamar aktif ditampilkan.
- **Langkah-langkah Pengujian**:
  1. Pilih filter status kamar: **"Terisi · Lunas (8)"**.
     - *Verifikasi*: 8 kamar berstatus lunas ditampilkan.
  2. Pada input pencarian cepat, ketik: `"Siti"`.
     - *Amati kartu yang lolos seleksi ganda*.
  3. Ganti teks pencarian menjadi: `"Dimas"`.
     - *Amati kartu yang lolos seleksi ganda*.
- **Hasil yang Diharapkan**:
  - Pada langkah 2, sistem hanya menampilkan kamar yang berstatus Lunas **DAN** dihuni oleh Siti Aminah (`KM-A01`). Badge count menunjukkan `"1 Unit"`.
  - Pada langkah 3, meskipun Dimas Prasetyo terdaftar sebagai penghuni di KM-A02, statusnya adalah Terlambat H+5 (bukan Lunas). Oleh karena itu, sistem tidak menemukan kecocokan dan menampilkan panel Empty State.

---

### SKENARIO 12: Penanganan Kondisi Kosong Hasil Pencarian (Filter Zero State vs Stable Height)
- **Tujuan**: Memverifikasi ketahanan layout antarmuka saat pencarian kamar tidak membuahkan hasil apapun.
- **Kondisi Awal**: Input pencarian aktif.
- **Langkah-langkah Pengujian**:
  1. Ketik kata kunci acak yang tidak ada di data: `"XYZ-999"`.
  2. Amati transisi DOM pada kontainer `#quickRoomList`.
  3. Periksa kestabilan tinggi kartu induk (`.properties-section-card`) dan tinggi kontainer empty state.
- **Hasil yang Diharapkan**:
  - Seluruh 15 kartu unit disembunyikan (`display: none`).
  - Panel pesan kosong `#roomEmptySearch` muncul di tengah (`display: flex`) dengan `height: 100%; min-height: 212px;`, mengisi penuh kontainer carousel `.room-cards-3col` (tinggi stabil 228px), lengkap dengan ikon Lucide `search-x` (32px Slate), judul *"Tidak ada unit kamar yang cocok"*, dan teks bantuan *"Coba nomor kamar lain (misal: A-01, B-03, C-05) atau nama penyewa"*.
  - Tinggi kartu induk `.properties-section-card` tetap 100% terkunci stabil pada ketinggian 306px (`height: 306px; min-height: 306px;`), persis membungkus kartu unit kamar tanpa ruang kosong berlebih di bagian bawah, dan dasar bawahnya sejajar rata (*flush bottom*) dengan kartu Aktivitas Terkini di kolom kanan (*zero layout shift / CLS = 0*).

---

### SKENARIO 13: Navigasi Dossier Kamar dari Kartu Terkini (Room Float Action Link)
- **Tujuan**: Memastikan kartu kamar menerapkan prinsip keterpisahan kursor ergonomis (*text selectable, arrow clickable*) dan mengarahkan pengguna ke dossier unit.
- **Kondisi Awal**: Pengguna melihat deretan kartu kamar.
- **Langkah-langkah Pengujian**:
  1. Lakukan seleksi teks (*highlight cursor*) pada nomor kamar `"Kamar A-01"` dan nama penyewa `"Siti Aminah"`.
  2. Arahkan kursor ke tombol panah mengambang di pojok kanan thumbnail gambar (`.room-float-arrow`).
  3. Klik tombol panah tersebut.
- **Hasil yang Diharapkan**:
  - Teks pada badan kartu dapat diseleksi (*selectable text*) untuk kemudahan copy-paste nama/kamar tanpa memicu klik navigasi tidak sengaja.
  - Tombol panah 28px (`.room-float-arrow`) merespon hover: latar berubah menjadi hitam obsidian `#111111`, ikon panah menjadi putih, dan tombol membesar halus (`scale(1.08)`).
  - Mengklik tombol panah langsung mengarahkan rute browser ke halaman katalog kamar `WF-03-kamar.html`.

---

### SKENARIO 14: Pemantauan Kondisi Properti & Distribusi Beban Tiket (Maintenance Progress Bar)
- **Tujuan**: Memvalidasi rendering kartu kondisi fisik bangunan dan akurasi batang persentase tiket kerusakan (F-07).
- **Kondisi Awal**: Pengguna mengamati sidebar kanan atas (*Kondisi Properti*).
- **Langkah-langkah Pengujian**:
  1. Periksa 3 kategori progres pemeliharaan:
     - *Dalam Pengerjaan*
     - *Menunggu Penugasan*
     - *Laporan Baru Masuk*
  2. Periksa tombol CTA utama kartu di bagian bawah (`.btn-maintenance-full`).
- **Hasil yang Diharapkan**:
  - Baris 1: *"Dalam Pengerjaan"* bernilai angka `"2"` dengan batang oranye tebal 7px terisi 50%.
  - Baris 2: *"Menunggu Penugasan"* bernilai angka `"1"` dengan batang oranye terisi 25%.
  - Baris 3: *"Laporan Baru Masuk"* bernilai angka `"1"` dengan batang oranye terisi 25%.
  - Tombol CTA *"Detail Tiket Kerusakan"* memiliki tinggi presisi 44px pill penuh (`#111111`), yang jika diklik mengarahkan pengguna ke `WF-08-tiket.html`.

---

### SKENARIO 15: Menu Aksi Cepat Pemeliharaan & Sinkronisasi Tiket (Condition More Popover Menu)
- **Tujuan**: Menguji tombol opsi titik-tiga vertikal (`more-vertical`) pada header kartu kondisi bangunan.
- **Kondisi Awal**: Pengguna berada di samping header kartu Kondisi Properti.
- **Langkah-langkah Pengujian**:
  1. Klik tombol opsi 32px `#wrapConditionMenu button`.
     - *Verifikasi UI*: Popover menu `#menuConditionMenu` terbuka di sudut kanan header.
  2. Klik opsi **"Sinkron Status"**.
     - *Amati respon toast*.
  3. Buka kembali menu, lalu klik opsi **"Buat Tiket Baru"**.
- **Hasil yang Diharapkan**:
  - Memilih *"Sinkron Status"* menutup menu dan memicu toast feedback sukses: *"Data perawatan sinkron dengan 4 tiket aktif."* (Tipe: `success`, Judul: `Sinkronisasi Sukses`).
  - Memilih *"Buat Tiket Baru"* menutup menu dan segera mengarahkan browser ke halaman manajemen tiket `WF-08-tiket.html`.

---

### SKENARIO 16: Penyaringan Log Aktivitas Terkini Berdasarkan Periode (Activity Filter Popover)
- **Tujuan**: Memverifikasi pengelompokan riwayat operasional harian menggunakan dropdown periode aktivitas.
- **Kondisi Awal**: Header kartu Aktivitas Terkini menampilkan trigger *"Hari ini"*.
- **Langkah-langkah Pengujian**:
  1. Klik trigger `#wrapActivityFilter .pill-dropdown-trigger`.
     - *Verifikasi UI*: Popover menu terbuka menampilkan opsi *"Hari ini"*, *"7 Hari Terakhir"*, dan *"Bulan Ini"*.
  2. Pilih opsi **"7 Hari Terakhir"**.
     - *Amati respon UI*.
  3. Pilih opsi **"Bulan Ini"**.
- **Hasil yang Diharapkan**:
  - Label trigger berganti sesuai opsi yang dipilih (*"7 Hari Terakhir"* / *"Bulan Ini"*).
  - Menu popover otomatis tertutup.
  - Sistem menampilkan toast konfirmasi: *"Aktivitas disaring ke: [Nama Periode]"* (Tipe: `info`).

---

### SKENARIO 17: Penelusuran & Navigasi Kontekstual Log Aktivitas Operasional (Activity Deep Linking)
- **Tujuan**: Memastikan setiap baris feed aktivitas operasional memiliki tautan tujuan mendalam (*deep linking*) yang tepat sesuai SOP RumaKost.
- **Kondisi Awal**: Daftar 5 aktivitas terbaru ditampilkan pada kartu Aktivitas Terkini (ditarik otomatis secara fleksibel/auto-stretch sehingga dasar bawahnya rata sejajar dengan kartu Kamar Kost Terkini).
- **Langkah-langkah Pengujian**:
  1. Klik Baris Aktivitas 1: *Budi Santoso (A-04) - Transfer sewa Rp 1.500.000 · Perlu Verifikasi*.
  2. Kembali ke dasbor, lalu klik Baris Aktivitas 2: *Rini Marlina (B-02) - Tiket baru: Pipa wastafel kamar bocor*.
  3. Kembali ke dasbor, lalu klik Baris Aktivitas 3: *Rini Setiawati (Staf) - Catat belanja token pompa air Rp 150.000*.
  4. Kembali ke dasbor, lalu klik Baris Aktivitas 4: *Siti Aminah (A-01) - Kontrak diperpanjang 12 Bulan · SPK Aktif*.
  5. Kembali ke dasbor, lalu klik Baris Aktivitas 5: *Dimas Prasetyo (A-02) - Tagihan sewa jatuh tempo dalam 3 hari*.
  6. Klik tautan footer: *"Lihat Semua Aktivitas"*.
- **Hasil yang Diharapkan**:
  - Baris 1 (Pembayaran Masuk) mengarahkan verifikator ke `WF-06-pembayaran.html`.
  - Baris 2 (Komplain Kerusakan) mengarahkan penangan ke `WF-08-tiket.html`.
  - Baris 3 (Pengeluaran Kas Staf) mengarahkan pengawas keuangan ke `WF-06-pembayaran.html`.
  - Baris 4 (Pembaruan Kontrak) membuka lembar kontrak spesifik di `WF-04-penghuni.html?id=A-01&tab=contract`.
  - Baris 5 (Peringatan Jatuh Tempo) membuka rincian tagihan di `WF-05-tagihan.html`.
  - Tautan *"Lihat Semua Aktivitas"* mengarahkan pengguna ke direktori penghuni `WF-04-penghuni.html`.

---

### SKENARIO 18: Aksesibilitas Keyboard & Penutupan Layer Global (ESC Key & Click-Outside)
- **Tujuan**: Memastikan kepatuhan WCAG 2.1 dalam hal penanganan interaksi pembatalan layer mengambang (*dismissible overlays*).
- **Kondisi Awal**: Berada di halaman dasbor dengan beberapa menu popover tersedia.
- **Langkah-langkah Pengujian**:
  1. Klik trigger filter status kamar hingga menu popover `#menuFilterRoomStatus` terbuka.
  2. Tekan tombol **`Escape` (ESC)** pada keyboard fisik.
     - *Amati respon popover*.
  3. Klik trigger popover tahun Arus Kas hingga terbuka, lalu klik sembarang area kanvas kosong di luar popover (*click-outside*).
  4. Fokuskan kursor pada input pencarian kamar `#quickRoomSearchInput`, ketik teks `"Kamar"`, lalu tekan tombol **`Escape`**.
- **Hasil yang Diharapkan**:
  - Pada langkah 2, penekanan tombol `Escape` seketika menutup popover status kamar (`.active` dicabut).
  - Pada langkah 3, klik di luar area popover langsung menutup menu popover secara mulus tanpa efek samping.
  - Pada langkah 4, penekanan tombol `Escape` saat field pencarian aktif akan membersihkan teks pencarian, memulihkan 15 kamar, dan melepaskan fokus kursor (*blur search input*).

---

### SKENARIO 19: Pengujian Responsivitas Multi-Viewport (Desktop, Laptop, Tablet, Mobile)
- **Tujuan**: Memverifikasi fluiditas layout Estify 2-kolom saat layar diperkecil melintasi 4 ambang batas (*responsive breakpoints*).
- **Kondisi Awal**: Dasbor terbuka pada resolusi Desktop standar (1440×900px).
- **Langkah-langkah Pengujian**:
  1. Ubah lebar viewport browser ke resolusi **Laptop/Medium (1024px s.d. 1200px)**:
     - Amati penataan kolom master dan sidebar.
  2. Perkecil viewport ke ukuran **Tablet (768px s.d. 860px)**:
     - Amati penataan 3 kartu metrik gauge dan baris grafik.
  3. Perkecil viewport ke ukuran **Mobile Smartphone (375px s.d. 580px)**:
     - Amati toolbar pencarian dan kartu carousel kamar.
- **Hasil yang Diharapkan**:
  - **Laptop (<= 1200px)**: Layout 2-kolom bertumpuk secara vertikal. Dua kartu sidebar (*Kondisi Properti* dan *Aktivitas Terkini*) berjejer rapi berdampingan membentuk grid 2-kolom di bagian bawah.
  - **Tablet (<= 860px)**: Tiga kartu metrik gauge bertumpuk menjadi 1 kolom vertikal. Double bar chart dan highlight card bertumpuk 1 kolom. Carousel menampilkan tepat 2 kartu per baris pandang (`calc((100% - 14px) / 2)`).
  - **Mobile (<= 580px)**: Padding kanvas merapat simetris menjadi 14px. Toolbar kontrol memecah elemen secara fleksibel (*flex-wrap*). Carousel menampilkan 1 kartu dominan dengan efek intip 88% width (`flex: 0 0 88%`), memberi petunjuk visual alami bahwa kartu dapat digeser secara horizontal dengan swipe jari.

---

### SKENARIO 20: Pencarian Global Meluncur pada Topbar (Sliding Global Search & Keyboard Routing)
- **Tujuan**: Menguji aktivasi input pencarian global pada Topbar navigasi (`.search-slide-box`) dan verifikasi alur submit query keyboard `Enter` ke modul kamar.
- **Kondisi Awal**: Pemilik berada pada dasbor utama. Input pencarian topbar dalam kondisi terlipat / tertutup.
- **Langkah-langkah Pengujian**:
  1. Klik tombol ikon kaca pembesar pada Topbar (`.search-slide-trigger`).
     - *Verifikasi UI*: Input field `#topbarSearchContainer` bertransformasi meluncur melebar ke arah kiri (`.open`), kursor secara otomatis fokus pada `#topbarSearchInput`.
  2. Ketik nama penghuni: `"Hendra Wijaya"`.
  3. Tekan tombol **`Enter`** pada keyboard fisik (`handleSlideSearchKey(event)`).
  4. Lakukan pengujian alternatif: Dalam keadaan input terbuka dan fokus, tekan tombol **`Escape` (ESC)**.
- **Hasil yang Diharapkan**:
  - Pada langkah 1, kotak input bergeser halus (*glitch-free slide-to-left*) tanpa menggeser posisi logo atau navigasi pill. Placeholder bertuliskan *"Cari kamar, penghuni, tagihan..."*.
  - Pada langkah 3, penekanan tombol `Enter` mengeksekusi routing navigasi ke direktori pencarian `WF-03-kamar.html?q=Hendra%20Wijaya` atau memunculkan toast konfirmasi pencarian operasional.
  - Pada langkah 4, penekanan tombol `Escape` otomatis melipat kembali kontainer pencarian ke posisi semula (`.open` dicabut) dan melepaskan fokus kursor (*blur*).

---

### SKENARIO 21: Pusat Notifikasi Operasional Topbar & Aksi Tandai Dibaca (Notification Center & Mark All Read)
- **Tujuan**: Memvalidasi fungsionalitas panel notifikasi Topbar, indikator dot merah belum dibaca, pemutakhiran counter unread, dan penandaan status selesai dibaca.
- **Kondisi Awal**: Pemilik login. Terdapat 3 notifikasi operasional baru belum dibaca (`#notifUnreadDot` aktif berkedip oranye/merah, badge bertuliskan `"3 Baru"`).
- **Langkah-langkah Pengujian**:
  1. Klik tombol lonceng notifikasi `#notifBellBtn` pada Topbar.
     - *Verifikasi UI*: Menu popover `#notifDropdownMenu` terbuka menampilkan judul *"Notifikasi"* dan 3 item operasional dengan status unread (latar halus beraksen).
  2. Periksa isi 3 notifikasi:
     - Item 1: Tunggakan Kritis Dimas Prasetyo (A-02) H+5 Overdue.
     - Item 2: Tiket Kerusakan Baru Wastafel Kamar B-02.
     - Item 3: Pembayaran Masuk Budi Santoso (A-04).
  3. Klik tombol **"Tandai dibaca"** (`markAllNotifsRead(event)`) pada header notifikasi.
  4. Buka kembali panel notifikasi untuk memastikan state mutasi tersimpan.
  5. Klik salah satu item notifikasi (misal: Item 1).
- **Hasil yang Diharapkan**:
  - Pada langkah 1, menu terbuka ke arah kanan bawah tanpa terpotong batas layar.
  - Pada langkah 3, seluruh item kehilangan kelas `.unread`, dot merah `#notifUnreadDot` di ikon lonceng seketika menghilang (`display: none`), badge counter berganti menjadi `"0 Baru"`, dan muncul toast sukses: *"Semua notifikasi ditandai telah dibaca"* (Tipe: `info`).
  - Pada langkah 5, mengklik item tunggakan mengarahkan rute browser langsung ke modul tagihan `WF-05-tagihan.html`.

---

### SKENARIO 22: Menu Profil Pengguna & Alur Pengakhiran Sesi Logout (User Profile & Session Termination)
- **Tujuan**: Menguji menu dropdown profil pengguna pada Topbar, verifikasi identitas aktif pemilik properti, dan eksekusi logout sesi kembali ke portal login.
- **Kondisi Awal**: Pemilik berada pada halaman dasbor dengan sesi login tersimpan di `localStorage` / cookie (`session_token`).
- **Langkah-langkah Pengujian**:
  1. Klik tombol avatar pengguna pada pojok kanan atas Topbar (`.user-profile-btn`).
     - *Verifikasi UI*: Dropdown menu profil `#userDropdownMenu` terbuka menampilkan inisial `"BS"`, nama *"Budi Santoso"*, email *"budi.santoso@rumakost.id"*, dan badge *"Pemilik Properti"*.
  2. Klik opsi menu **"Pengaturan Properti"**.
     - *Verifikasi rute*: Browser berpindah ke `WF-09-pengaturan.html`.
  3. Buka kembali menu profil, lalu klik opsi menu bahaya **"Keluar Akun"** (`.dropdown-menu-item.danger`).
- **Hasil yang Diharapkan**:
  - Menu profil memiliki layout terstruktur dengan *user header*, divider tipis, dan icon Lucide di setiap baris.
  - Mengklik *"Keluar Akun"* mengeksekusi penghapusan sesi pengguna, mencabut kredensial aktif, dan mengarahkan pengguna kembali ke halaman login `WF-01-login.html`.
  - Upaya menekan tombol *Back* pada browser setelah logout tidak boleh menampilkan data dasbor yang di-cache (*zero session cache leak*).

---

### SKENARIO 23: Penyaringan Spesifik Kamar Status 'Dalam Perbaikan' (Maintenance Unit Isolation - Kamar KM-B05)
- **Tujuan**: Memastikan integritas seleksi kamar saat pengguna hanya ingin menginspeksi unit yang tidak dapat dihuni akibat perbaikan fisik bangunan (F-02 & F-07).
- **Kondisi Awal**: Dasbor menampilkan seluruh 15 kamar pada status awal.
- **Langkah-langkah Pengujian**:
  1. Buka popover status unit pada toolbar katalog kamar (`#menuFilterRoomStatus`).
  2. Klik opsi item **"Dalam Perbaikan (1)"**.
  3. Amati perubahan kartu pada kontainer carousel `#quickRoomList`.
  4. Periksa spesifikasi kartu kamar yang tertampil.
- **Hasil yang Diharapkan**:
  - Seluruh unit kamar berstatus normal (14 unit lainnya) disembunyikan dari viewport.
  - Hanya tepat **1 unit** yang ditampilkan: `Kamar B-05`.
  - Kartu Kamar B-05 menampilkan badge status berlatar kuning/amber: `Dalam Perbaikan`, dengan sub-deskripsi: *"Lantai 2 · Deluxe (Servis AC)"* dan tarif *"Rp 1.700.000 /bln"*.
  - Badge counter pada toolbar menampilkan label `"1 Unit"`.
  - Muncul toast konfirmasi: *"Menampilkan kamar: Dalam Perbaikan"* (Tipe: `info`).

---

### SKENARIO 24: Resiliensi Klik Beruntun & Anti-Spam Looping Infinite Carousel (Rapid Multi-Click Stress Test)
- **Tujuan**: Menguji ketahanan script infinite loop carousel (`#roomCarousel`) terhadap klik beruntun berkecepatan tinggi agar tidak terjadi desinkronisasi posisi offset scroll atau crash rendering (*race condition prevention*).
- **Kondisi Awal**: Carousel berada pada posisi tengah default (15 unit original aktif dengan klon di awal dan akhir).
- **Langkah-langkah Pengujian**:
  1. Klik tombol navigasi kanan (`chevron-right`) sebanyak 8 kali secara sangat cepat (< 1,5 detik).
  2. Amati transisi gulir carousel selama dan setelah rentetan klik.
  3. Segera klik tombol navigasi kiri (`chevron-left`) sebanyak 8 kali berturut-turut.
  4. Amati apakah mekanisme `isLoopingReset` berhasil mengeksekusi *silent snap-back* tanpa gangguan visual.
- **Hasil yang Diharapkan**:
  - Variabel proteksi `isLoopingReset` mengunci sementara eksekusi reset saat animasi scroll sedang berjalan, mencegah tabrakan *offset position* dan *flicker* layar.
  - Setelah pergerakan meluncur berhenti, posisi carousel otomatis disinkronkan kembali ke set kartu original (`singleSetWidth`), menjaga kontinuitas pengguliran tanpa ujung.
  - Tidak terjadi layout freeze, pembekuan browser, atau elemen kartu terpotong di tengah viewport (*zero clipping glitch*).

---

### SKENARIO 25: Akses Pintas Header Arus Kas ke Modul Laporan Keuangan Penuh (Cash Flow Quick Shortcut ke WF-07)
- **Tujuan**: Memvalidasi fungsi tombol tautan eksternal panah serong (`.pill-arrow-btn`) di sebelah kanan filter tahun pada kartu Arus Kas & Operasional.
- **Kondisi Awal**: Dasbor terbuka pada posisi Baris 2 (Kartu Double Bar Chart).
- **Langkah-langkah Pengujian**:
  1. Arahkan kursor ke tombol lingkaran panah serong di sudut kanan atas header Arus Kas (`.pill-arrow-btn[href="WF-07-laporan.html"]`).
  2. Amati tooltip native browser (`title="Lihat Laporan Lengkap"`).
  3. Klik tombol panah tersebut.
- **Hasil yang Diharapkan**:
  - Tombol berukuran 32×32px merespons hover kursor: latar berganti menjadi hitam `#111111` dan ikon panah `arrow-up-right` berubah menjadi putih bersih.
  - Mengklik tombol segera menavigasi rute browser secara langsung ke modul laporan keuangan mendalam `WF-07-laporan.html`.

---

### SKENARIO 26: Penanganan Status Keterlambatan Sewa & Pemantauan Tagihan (Kamar B-01 · Dodi Firmansyah)
- **Tujuan**: Memvalidasi akurasi data dan visualisasi kartu untuk kamar yang memiliki tunggakan sewa (F-04 & F-05).
- **Kondisi Awal**: Seluruh 15 kamar ditampilkan di carousel. Kamar B-01 memiliki tarif Rp 1.300.000 dengan keterlambatan 3 hari.
- **Langkah-langkah Pengujian**:
  1. Cari atau geser carousel hingga menampilkan Kamar B-01.
  2. Periksa status badge kartu dan teks sub-spesifikasi.
  3. Buka popover status kamar, lalu pilih opsi *"Terlambat / Tempo (3)"*.
  4. Amati apakah Kamar B-01 tetap tampil atau tersembunyi.
- **Hasil yang Diharapkan**:
  - Pada langkah 2, Kamar B-01 menampilkan badge merah bahaya: `Telat 3 Hari` dengan teks sub-spesifikasi eksplisit: *"Lantai 2 · Dodi Firmansyah"*.
  - Tarif menampilkan *"Rp 1.300.000 /bln"*.
  - Pada langkah 4, karena atribut `data-status="terlambat"`, kartu Kamar B-01 bersama unit keterlambatan lainnya (A-02 & A-04) tetap tampil di layar.

---

### SKENARIO 27: Kueri Pencarian Multi-Kecocokan & Kategori Kamar (Multi-Match Room Query)
- **Tujuan**: Menguji ketepatan mesin pencarian instan dalam menangani kueri yang menghasilkan lebih dari satu unit kamar yang cocok (multi-match) dan memastikan rendering kartu kamar tetap proporsional tanpa merusak infinite scroll.
- **Kondisi Awal**: Kolom pencarian cepat `#quickRoomSearchInput` dalam kondisi kosong. Semua 15 kamar original dan klon tersedia.
- **Langkah-langkah Pengujian**:
  1. Ketik kata kunci lantai: `"Lantai 1"`.
     - *Amati kartu yang tampil dan badge total unit*.
  2. Hapus teks pencarian dengan tombol silang (`#clearQuickRoomSearch`), lalu ketik kata kunci tipe kamar: `"Deluxe"`.
     - *Amati kartu yang cocok*.
  3. Hapus teks, lalu ketik nama penyewa yang spesifik: `"Santoso"`.
     - *Amati respon pencarian*.
- **Hasil yang Diharapkan**:
  - Pada langkah 1, sistem menampilkan tepat **5 unit kamar** yang berada di Lantai 1 (`KM-A01`, `KM-A02`, `KM-A03`, `KM-A04`, `KM-A05`). Badge counter toolbar menunjukkan `"5 Unit"`. Seluruh klon loop disembunyikan sehingga hanya 5 unit unik yang tampil.
  - Pada langkah 2, sistem menyaring kamar bertipe Deluxe (`KM-A01`, `KM-A02`, `KM-B03`, `KM-C02`). Badge counter menunjukkan `"4 Unit"`.
  - Pada langkah 3, sistem hanya memadankan Kamar A-04 (`Budi Santoso`), dan badge counter menunjukkan `"1 Unit"`.
  - Pada setiap hasil multi-match, kartu kamar berjejer rapi dalam kontainer horizontal dengan jarak simetris 14px dan tidak terjadi tumpang tindih elemen (*zero overlap glitch*).

---

### SKENARIO 28: Siklus Hidup Komponen Toast Feedback & Auto-Dismissal (Toast Stack Lifecycle)
- **Tujuan**: Memverifikasi pemanggilan utility `RumaUI.showToast()`, rendering kontainer notifikasi mengambang, dan pembersihan otomatis elemen DOM (Pilar 5).
- **Kondisi Awal**: Pengguna berada pada dasbor tanpa ada toast notifikasi aktif.
- **Langkah-langkah Pengujian**:
  1. Buka dropdown opsi pemeliharaan (`#wrapConditionMenu`), lalu klik opsi **"Sinkron Status"**.
     - *Amati kemunculan toast*.
  2. Buka dropdown filter tahun, lalu klik opsi **"Tahun 2025"**.
     - *Amati penumpukan toast kedua*.
  3. Diamkan layar tanpa menyentuh mouse/keyboard selama 4 detik.
- **Hasil yang Diharapkan**:
  - Pada langkah 1, sebuah kartu toast beraksen hijau sukses (`.toast-success`) muncul dengan animasi slide-in halus di sudut kanan bawah, menampilkan ikon centang Lucide, judul *"Sinkronisasi Sukses"*, dan pesan *"Data perawatan sinkron dengan 4 tiket aktif."*.
  - Pada langkah 2, toast kedua muncul di bawahnya membentuk tumpukan rapi (*stacked toasts*), menampilkan informasi *"Memuat data keuangan Arus Kas tahun 2025..."*.
  - Pada langkah 3, setelah melewati timer 3500ms, kedua toast menghilang secara otomatis dengan animasi fade-out, dan elemen DOM-nya dihapus dari pohon dokumen (*zero memory leak*).

---

### SKENARIO 29: Aksesibilitas Navigasi Tab Keyboard & Indikator Fokus (Focus-Visible Accessibility)
- **Tujuan**: Memastikan antarmuka mematuhi standar aksesibilitas WCAG 2.1 (Success Criterion 2.4.7 Focus Visible) bagi pengguna yang mengoperasikan dasbor murni dengan keyboard.
- **Kondisi Awal**: Halaman dasbor dimuat ulang. Kursor mouse tidak digerakkan.
- **Langkah-langkah Pengujian**:
  1. Tekan tombol **`Tab`** secara berulang untuk menjelajahi elemen interaktif: Topbar nav pills → Tombol search topbar → Tombol lonceng notifikasi → Avatar user → Trigger filter tahun → Tombol laporan → Input search kamar → Tombol filter kamar → Tombol scroll carousel → Tombol panah kamar → CTA tiket → Baris aktivitas feed.
  2. Perhatikan indikator visual cincin fokus (*focus ring*).
  3. Pada elemen yang sedang terfokus (misal tombol filter), tekan tombol **`Enter`** atau **`Space`**.
- **Hasil yang Diharapkan**:
  - Setiap elemen interaktif memiliki garis tepi fokus (*focus ring*) yang jelas dan berkontras tinggi (2px solid outline dengan warna brand `#FF7A00` atau `#111111`).
  - Urutan tabulasi berjalan logis dari kiri-ke-kanan dan atas-ke-bawah (*logical DOM tab order*).
  - Tidak terjadi jebakan fokus (*no keyboard trap*).
  - Menekan tombol `Enter` atau `Space` pada elemen yang terfokus berhasil memicu aksi yang sama persis dengan klik mouse.

---

### SKENARIO 30: Ketahanan Gambar Thumbnail Rusak & Fallback Graceful (Image Broken Fallback)
- **Tujuan**: Memastikan antarmuka tidak mengalami keruntuhan visual atau distorsi tata letak jika URL gambar eksternal Unsplash gagal dimuat (*image load failure*).
- **Kondisi Awal**: Simulasi koneksi offline parsial atau CDN gambar eksternal tidak merespons (status HTTP 404 / network timeout).
- **Langkah-langkah Pengujian**:
  1. Ubah URL gambar pada salah satu unit kamar (misal: `Kamar A-01`) menjadi tautan gambar yang tidak valid (`invalid-photo.jpg`).
  2. Muat ulang halaman dasbor.
  3. Amati tampilan thumbnail dan tinggi kartu Kamar A-01 dibandingkan dengan unit lainnya.
- **Hasil yang Diharapkan**:
  - Kontainer thumbnail (`.room-thumb-area`) mempertahankan rasio aspek stabil dengan latar belakang abu-abu netral (`#E2E8F0`).
  - Teks alternatif (`alt="Kamar A-01"`) dirender secara proporsional di dalam area thumbnail tanpa merusak tata letak teks nama, spesifikasi, dan harga kamar.
  - Tinggi total kartu kamar tetap stabil pada 242px, dan tombol panah aksi 28px (`.room-float-arrow`) tetap berada di posisinya di sudut kanan atas thumbnail dan dapat diklik secara normal.

---

### SKENARIO 31: Eksklusi Reksa Popover Dropdown (Mutual Exclusion / Anti-Collision Handling)
- **Tujuan**: Memastikan antarmuka menerapkan proteksi *mutual exclusion* sehingga hanya satu menu popover yang dapat terbuka dalam satu waktu tanpa terjadi penumpukan layer visual.
- **Kondisi Awal**: Seluruh dropdown popover dalam kondisi tertutup (`.active` tidak ada).
- **Langkah-langkah Pengujian**:
  1. Klik trigger popover periode tahun Arus Kas (`#wrapYearFilter .pill-dropdown-trigger`).
     - *Verifikasi UI*: Menu popover `#menuYearFilter` terbuka aktif.
  2. Tanpa mengklik kanvas kosong, langsung klik trigger filter status kamar (`#wrapFilterRoomStatus button`).
     - *Amati respon kedua popover*.
  3. Tanpa mengklik kanvas kosong, langsung klik trigger menu opsi pemeliharaan (`#wrapConditionMenu button`).
- **Hasil yang Diharapkan**:
  - Pada langkah 2, fungsi `closeAllCustomPopovers()` segera menutup `#menuYearFilter` sebelum `#menuFilterRoomStatus` dibuka. Tidak pernah ada dua menu popover yang tampil bersamaan di layar.
  - Pada langkah 3, menu status kamar seketika tertutup dan menu opsi pemeliharaan terbuka secara bersih tanpa glitch atau tabrakan z-index (*zero layer collision*).

---

### SKENARIO 32: Normalisasi Kueri Pencarian Teks (Case-Insensitive & Whitespace Trimming)
- **Tujuan**: Memverifikasi ketahanan algoritma filter cepat terhadap variasi penulisan pengguna, termasuk huruf kapital acak dan spasi berlebih (*leading/trailing whitespace*).
- **Kondisi Awal**: Input pencarian kamar kosong. Seluruh 15 unit tampil di carousel.
- **Langkah-langkah Pengujian**:
  1. Klik input pencarian cepat `#quickRoomSearchInput`.
  2. Ketik kueri dengan spasi ganda di awal dan akhir serta kombinasi huruf kapital: `"   kAmAr b-01   "`.
  3. Amati proses filtering pada kontainer `#quickRoomList`.
  4. Hapus teks, lalu ketik kueri nama penghuni dengan spasi berlebih: `"   riAn   "`.
- **Hasil yang Diharapkan**:
  - Logika pemrosesan teks `(query || '').toLowerCase().trim()` secara otomatis menormalisasi teks menjadi `"kamar b-01"` dan `"rian"`.
  - Pada langkah 2, sistem menyaring tepat unit `Kamar B-01` (Dodi Firmansyah).
  - Pada langkah 4, sistem menyaring tepat unit `Kamar C-03` (Rian Hidayat).
  - Badge total kamar memperbarui nilainya menjadi `"1 Unit"`.

---

### SKENARIO 33: Siklus Hidup Re-hidrasi Ikon Lucide Dinamis (Lucide Icon Re-hydration Lifecycle)
- **Tujuan**: Memastikan pemanggilan `lucide.createIcons()` berjalan konsisten pada setiap manipulasi DOM dinamis, mencegah kemunculan tag `<i>` kosong tanpa ikon SVG.
- **Kondisi Awal**: Halaman baru selesai dimuat (*DOM ready*).
- **Langkah-langkah Pengujian**:
  1. Periksa seluruh kartu klon yang dihasilkan secara dinamis oleh `initInfiniteCarousel()` (`.carousel-clone`).
  2. Ketik sembarang teks di pencarian untuk memunculkan tombol silang `#clearQuickRoomSearch`.
  3. Ketik kata kunci yang tidak ada (`"KOSONG-99"`) untuk memicu kemunculan Empty State `#roomEmptySearch`.
  4. Klik tombol clear pencarian untuk memulihkan tampilan 15 kamar orisinil dan klon.
- **Hasil yang Diharapkan**:
  - Seluruh ikon panah serong 13px (`arrow-up-right`) pada kartu klon berhasil diubah menjadi elemen SVG dengan atribut `stroke-width: 2.2px`.
  - Tombol silang pencarian menampilkan SVG `x` yang valid (13×13px) segera saat teks terisi.
  - Panel Empty State menampilkan ikon SVG `search-x` yang ter-render penuh (32×32px).
  - Tidak ada satupun elemen `<i>` di seluruh dokumen yang tertinggal sebagai elemen kosong tanpa anak SVG (*zero broken icon placeholders*).

---

### SKENARIO 34: Sanitasi Parameter URL Peran & Guardrail Anti-Injeksi (Whitelisted Role Sanitization)
- **Tujuan**: Memastikan fungsi penentu peran `getCurrentRole()` hanya menerima nilai whitelist resmi dan menolak parameter peran tak dikenal atau upaya injeksi URL.
- **Kondisi Awal**: Pengguna memanipulasi parameter query string pada address bar browser.
- **Langkah-langkah Pengujian**:
  1. Buka URL: `WF-02-dashboard.html?role=superadmin`.
  2. Buka URL: `WF-02-dashboard.html?role=guest`.
  3. Buka URL: `WF-02-dashboard.html?role=<script>alert(1)</script>`.
  4. Buka URL: `WF-02-dashboard.html?role=staf` (Whitelist resmi).
- **Hasil yang Diharapkan**:
  - Pada pengujian 1, 2, dan 3: karena nilai parameter tidak cocok dengan whitelist (`staff`, `staf`, `penghuni`, `tenant`), skrip secara aman mem-fallback status peran ke default baku: `'owner'` (Pemilik).
  - Tidak ada script yang tereksekusi (kebal XSS reflection), tidak ada crash runtime JavaScript, dan Topbar dirender dengan konfigurasi aman Pemilik.
  - Pada pengujian 4: parameter whitelist dikenali secara tepat, merender mode Staf Operasional terbatas.

---

### SKENARIO 35: Navigasi Gestur Sentuh & CSS Scroll Snap pada Tampilan Ponsel (Touch Swipe & Mobile Snap)
- **Tujuan**: Menguji kenyamanan interaksi pengguna seluler (*mobile UX*) dalam menelusuri katalog kamar menggunakan usapan jari (*touch swipe*) pada layar sentuh.
- **Kondisi Awal**: Pengujian dijalankan pada mode emulasi Mobile Device (misal iPhone 14 / Pixel 7, lebar 390px).
- **Langkah-langkah Pengujian**:
  1. Letakkan sentuhan jari di atas kartu kamar pertama (Kamar A-01), lalu lakukan usapan horizontal (*swipe left*) cepat ke arah kiri.
  2. Lepaskan sentuhan jari dan amati perhentian kartu.
  3. Lakukan usapan pelan (*slow drag*) dan lepaskan saat kartu berada di posisi 50%.
- **Hasil yang Diharapkan**:
  - Carousel merespons usapan sentuh secara instan dengan akselerasi perangkat keras (*GPU accelerated touch scrolling* via `-webkit-overflow-scrolling: touch`).
  - Aturan CSS `scroll-snap-type: x mandatory` memastikan kartu secara otomatis "mengunci" (*magnetic snap*) tepat di tepi kiri/tengah viewport.
  - Kartu berikutnya terintip sebagian (*peek effect* ~12% lebar layar) untuk memberi umpan balik visual bahwa katalog masih dapat diusap lebih lanjut.

---

### SKENARIO 36: Proteksi Kerahasiaan Data Finansial Dasbor pada Mode Staf (Zero Confidential Leak)
- **Tujuan**: Memvalidasi penegakan batas kerahasiaan bisnis di mana Staf Operasional (`?role=staf`) dibatasi dari akses angka laba bersih properti, visualisasi grafik arus kas, dan modul laporan keuangan eksekutif.
- **Kondisi Awal**: Pengguna mengakses dasbor sebagai Staf Pengelola (`WF-02-dashboard.html?role=staf`).
- **Langkah-langkah Pengujian**:
  1. Amati tampilan Baris 1 (Kartu Metrik Tiga-Serangkai): periksa apakah kartu *Tagihan Lunas* dan *Pengeluaran* menampilkan sensor atau mode pembatasan operasional.
  2. Amati tampilan Baris 2 (Kartu Oranye Highlight Properti): periksa angka *Pemasukan Bersih* (Rp 12,3 Jt).
  3. Periksa header kartu *Arus Kas & Operasional* dan klik tombol panah pintas eksternal (`.pill-arrow-btn[href="WF-07-laporan.html"]`).
  4. Coba ketikkan URL `WF-07-laporan.html?role=staf` secara langsung pada address bar browser.
- **Hasil yang Diharapkan**:
  - Pada langkah 1 dan 2, dasbor operasional staf menyembunyikan atau membatasi data margin finansial eksekutif (*Zero Confidential Leak*), memfokuskan staf hanya pada metrik operasional fisik (Okupansi 11/15 kamar dan tiket pemeliharaan).
  - Pada langkah 3, tombol navigasi ke modul laporan finansial disembunyikan atau dinonaktifkan (`pointer-events: none; opacity: 0.4;`).
  - Pada langkah 4, sistem otorisasi mendeteksi peran staf dan menolak akses ke `WF-07` dengan pengalihan kembali ke `WF-02-dashboard.html?role=staf` disertai toast peringatan: *"Akses Laporan Keuangan terbatas hanya untuk Pemilik Properti"*.

---

### SKENARIO 37: Aksi Kontrol Topbar & Navigasi Dropdown Khusus Staf (Staff Dedicated Controls & Actions)
- **Tujuan**: Menguji kontrol interaktif khusus staf pada Topbar navigasi (tombol pencarian staf, lonceng notifikasi tugas, dan tautan dropdown profil staf).
- **Kondisi Awal**: Pengguna berada pada dasbor dengan mode staf aktif (`WF-02-dashboard.html?role=staf`).
- **Langkah-langkah Pengujian**:
  1. Klik tombol pencarian pada Topbar staf (`button.icon-circle-btn[title="Cari data"]`).
  2. Klik tombol lonceng notifikasi pada Topbar staf (`button.icon-circle-btn[title="Notifikasi"]`).
  3. Klik avatar profil *"RS"* (Rini Setiawati) di sudut kanan atas Topbar.
  4. Klik menu dropdown **"Tiket Perbaikan Ditugaskan"**.
  5. Kembali ke dasbor staf, buka kembali dropdown avatar, lalu klik menu **"Catat Bayar Penyewa"**.
- **Hasil yang Diharapkan**:
  - Pada langkah 1, sistem menampilkan toast info: *"Pencarian operasional dibuka"*.
  - Pada langkah 2, sistem menampilkan toast info: *"Belum ada tugas baru"*.
  - Pada langkah 3, dropdown menu menampilkan nama *"Rini Setiawati"*, email *"staf.operasional@kostmakmur.com"*, dan badge *"Staf Operasional"*. Tidak ada tautan ke Pengaturan Akun Pemilik.
  - Pada langkah 4, browser berpindah ke rute `WF-08-tiket.html?role=staf` dengan mempertahankan parameter peran staf.
  - Pada langkah 5, browser berpindah ke rute `WF-05-tagihan.html?role=staf` dengan mempertahankan parameter peran staf.

---

### SKENARIO 38: Navigasi Langsung (Drill-Down) dari Kartu Metrik Tiga-Serangkai (Gauge Cards Direct Navigation)
- **Tujuan**: Memastikan kartu metrik gauge pada Baris 1 memiliki alur operasional intuitif (drill-down link) yang mengarahkan pengguna ke modul data rinci terkait saat diklik.
- **Kondisi Awal**: Pemilik berada pada dasbor utama.
- **Langkah-langkah Pengujian**:
  1. Klik Kartu Metrik 1 (*Okupansi Kamar 11/15 Kamar*).
  2. Kembali ke dasbor, lalu klik Kartu Metrik 2 (*Tagihan Lunas Rp 16,5 Jt*).
  3. Kembali ke dasbor, lalu klik Kartu Metrik 3 (*Pengeluaran Rp 4,2 Jt*).
- **Hasil yang Diharapkan**:
  - Setiap kartu memiliki kursor bertipe `cursor: pointer` dan respon hover visual (`transform: translateY(-2px)`).
  - Pada langkah 1, klik mengarahkan rute browser langsung ke direktori master kamar `WF-03-kamar.html`.
  - Pada langkah 2, klik mengarahkan rute browser langsung ke modul monitoring tagihan sewa `WF-05-tagihan.html`.
  - Pada langkah 3, klik mengarahkan rute browser langsung ke modul rekapitulasi pembayaran & pengeluaran kas `WF-06-pembayaran.html`.

---

### SKENARIO 39: Penelusuran Lengkap Notifikasi Multi-Kategori Topbar (Tiket Kerusakan & Pembayaran Dikonfirmasi)
- **Tujuan**: Memvalidasi fungsionalitas penelusuran (*deep-link routing*) untuk Notifikasi Item 2 dan Item 3 pada panel notifikasi Topbar.
- **Kondisi Awal**: Pemilik login. Panel notifikasi Topbar terbuka menampilkan 3 item belum dibaca.
- **Langkah-langkah Pengujian**:
  1. Klik Notifikasi Item 2 (*"Laporan Kerusakan Baru: Siti Aminah melaporkan wastafel bocor di Kamar B-02"*).
  2. Periksa respon toast dan perpindahan halaman browser.
  3. Kembali ke dasbor, buka kembali panel notifikasi, lalu klik Notifikasi Item 3 (*"Pembayaran Dikonfirmasi: Budi Santoso (A-04) telah melunasi sewa bulan ini (Rp 1.500.000)"*).
  4. Periksa respon toast dan perpindahan halaman browser.
- **Hasil yang Diharapkan**:
  - Pada langkah 1, muncul toast: *"Membuka tiket perbaikan..."* (Tipe: `info`), dan browser berpindah langsung ke antrean tiket `WF-08-tiket.html`.
  - Pada langkah 3, muncul toast: *"Membuka riwayat pembayaran..."* (Tipe: `info`), dan browser berpindah langsung ke riwayat transaksi `WF-06-pembayaran.html`.
  - Notifikasi yang diklik otomatis ditandai terbaca, dan angka counter notifikasi berkurang secara proporsional.

---

### SKENARIO 40: Kondisi Bebas Komplain / Pemeliharaan Prima pada Kartu Kondisi Properti (Zero Active Maintenance State)
- **Tujuan**: Menguji stabilitas antarmuka dan respon kartu *Kondisi Properti* saat seluruh tiket perbaikan fisik gedung telah selesai dikerjakan (0 tiket aktif).
- **Kondisi Awal**: Seluruh tiket kerusakan (#T-01 s.d #T-04) telah berstatus selesai / ditutup. Nilai tiket aktif adalah 0.
- **Langkah-langkah Pengujian**:
  1. Buka halaman dasbor dengan kondisi data nol tiket aktif.
  2. Amati area visual kartu *Kondisi Properti* pada sidebar kanan atas.
  3. Periksa perhitungan progress bar dan tombol CTA utama.
- **Hasil yang Diharapkan**:
  - Kartu tidak mengalami error pembagian nol (*NaN% glitch*) atau keruntuhan tinggi kontainer.
  - Area progres menampilkan panel status prima: ikon centang hijau Lucide `check-circle-2` (28px), badge *"Fasilitas Prima (100%)"*, dan sub-teks informasi *"Seluruh 15 unit kamar dan utilitas gedung dalam kondisi optimal tanpa komplain aktif"*.
  - Ketiga progress bar menampilkan angka `0` dengan warna abu-abu netral (#ECEEF2).
  - Tombol CTA 44px tetap aktif bertuliskan *"Riwayat Tiket Selesai"* yang mengarahkan ke arsip tiket di `WF-08-tiket.html`.

---

### SKENARIO 41: Kondisi Nir-Aktivitas pada Penyaringan Feed Operasional (Activity Feed Zero State)
- **Tujuan**: Memverifikasi ketahanan layout antarmuka saat filter rentang waktu pada kartu Aktivitas Terkini tidak memiliki riwayat transaksi/aktivitas (misal: filter *"Hari ini"* pada awal hari operasional).
- **Kondisi Awal**: Hari baru dimulai (pukul 06:00 WIB), belum ada aktivitas pembayaran sewa, tiket baru, atau perpanjangan kontrak tercatat hari ini.
- **Langkah-langkah Pengujian**:
  1. Buka dropdown filter aktivitas pada header kartu `#wrapActivityFilter`.
  2. Pilih opsi **"Hari ini"**.
  3. Amati kontainer daftar aktivitas `.tenant-message-list`.
  4. Periksa keselarasan tinggi kartu Aktivitas Terkini terhadap kartu Kamar Kost Terkini di kolom kiri.
- **Hasil yang Diharapkan**:
  - Daftar 5 baris aktivitas disembunyikan secara bersih.
  - Kontainer menampilkan panel Empty State yang elegan: ikon Lucide `clock` atau `inbox` (28px Muted Slate), judul *"Belum ada aktivitas hari ini"*, dan pesan panduan *"Transaksi pembayaran dan laporan kerusakan baru akan tercatat otomatis di sini"*.
  - Tinggi total kartu Aktivitas Terkini tetap stabil membentang (*flex auto-stretch*) sehingga dasar bawahnya tetap sejajar rata (*flush bottom*) dengan batas bawah kartu Kamar Kost Terkini (*zero layout shift / CLS = 0*).

---

### SKENARIO 42: Preservasi Konteks Peran pada Tautan Logo Brand Topbar (Role Context Preservation on Brand Click)
- **Tujuan**: Memastikan interaksi klik pada logo brand *"RumaKost"* di pojok kiri atas Topbar mengarahkan pengguna ke beranda dasbor yang sesuai dengan peran aktif tanpa terjadi eskalasi hak akses (*privilege escalation*).
- **Kondisi Awal**: Sesi aktif berada pada mode Staf Operasional (`WF-02-dashboard.html?role=staf`).
- **Langkah-langkah Pengujian**:
  1. Arahkan kursor ke logo brand RumaKost pada Topbar (`.brand-group`).
  2. Periksa atribut `href` pada elemen anchor logo.
  3. Klik logo brand tersebut.
  4. Ulangi pengujian pada sesi Pemilik (`WF-02-dashboard.html`).
- **Hasil yang Diharapkan**:
  - Pada sesi Staf (langkah 1-3): Atribut `href` bernilai `WF-02-dashboard.html?role=staf`. Mengklik logo me-refresh/kembali ke dasbor staf dengan tetap mempertahankan batasan wewenang operasional (*role parameter preserved*). Staf tidak pernah terlempar ke dasbor eksekutif pemilik tanpa izin.
  - Pada sesi Pemilik (langkah 4): Atribut `href` bernilai `WF-02-dashboard.html`, mengarahkan ke dasbor eksekutif penuh.

---

### SKENARIO 43: Kepatuhan Navigasi Micro-Footer & Informasi Hak Cipta (Micro-Footer Compliance & Links)
- **Tujuan**: Memverifikasi fungsionalitas, keterbacaan, dan kepatuhan navigasi tautan pendukung pada footer minimalis dasbor (`.dashboard-footer-micro`).
- **Kondisi Awal**: Dasbor terbuka pada resolusi Desktop standar.
- **Langkah-langkah Pengujian**:
  1. Gulir ke bagian paling bawah dasbor.
  2. Periksa teks hak cipta di sebelah kiri: `"© 2026 RumaKost · Platform Manajemen Kost Mandiri"`.
  3. Arahkan kursor ke tautan navigasi di sebelah kanan: *"Bantuan"*, *"Kebijakan Privasi"*, *"Syarat Ketentuan"*.
  4. Periksa badge kode layar di sudut kanan: `"WF-02 · SCR-02"` (pada dasbor eksekutif pemilik) dan `"WF-02 · SCR-02-STAF"` (pada dasbor operasional staf).
- **Hasil yang Diharapkan**:
  - Teks hak cipta memiliki ukuran 11px dengan warna `var(--text-muted)` yang memenuhi kontras WCAG AA.
  - Setiap tautan merespons hover kursor secara halus dengan transisi warna ke oranye brand `#FF7A00`.
  - Badge `WF-02 · SCR-02` / `WF-02 · SCR-02-STAF` memiliki opasitas default 0.35 dan bertransisi halus menjadi 1.0 (opasitas penuh) saat di-hover, berfungsi sebagai penanda verifikasi blueprint arsitektur yang tidak mengganggu estetika antarmuka.

---

### SKENARIO 44: Verifikasi Skala Proporsional Matematis Double Bar Chart (Y-Axis Mathematical Precision)
- **Tujuan**: Memverifikasi bahwa visualisasi batang pada kanvas grafik arus kas 6-bulan diskalakan secara matematis presisi ($1\text{ Jt} = 8\text{px}$) terhadap tinggi kanvas 160px (skala maksimum 20 Jt).
- **Kondisi Awal**: Pemilik berada pada Baris 2 dasbor utama.
- **Langkah-langkah Pengujian**:
  1. Periksa tinggi batang pemasukan bulan Mei (Rp 13,5 Jt) dan pengeluaran (Rp 2,8 Jt).
  2. Periksa tinggi batang pemasukan bulan Juli (Rp 18,4 Jt) dan pengeluaran (Rp 3,2 Jt).
  3. Periksa tinggi batang bulan berjalan Oktober (Rp 16,5 Jt pemasukan dan Rp 4,2 Jt pengeluaran).
  4. Periksa posisi 6 garis gridline horizontal (`.chart-grid-line`: `line-50` s.d. `line-0`).
- **Hasil yang Diharapkan**:
  - Batang Mei: tinggi pemasukan tepat 108px ($13.5 \times 8$) dan pengeluaran 22px ($2.8 \times 8$).
  - Batang Juli: tinggi pemasukan tepat 147px ($18.4 \times 8$) dan pengeluaran 26px ($3.2 \times 8$).
  - Batang Oktober: tinggi pemasukan tepat 132px ($16.5 \times 8$) dan pengeluaran 34px ($4.2 \times 8$).
  - Seluruh batang bertumpu persis di atas garis sumbu-X nol (`line-0` pada `top: 160px`) dan tidak ada yang melampaui garis batas 20 Jt (`line-50` pada `top: 0px`).

---

### SKENARIO 45: Perbedaan Semantik Status Tagihan Kamar: Peringatan Tempo (H-3) vs Tunggakan Kritis (H+5)
- **Tujuan**: Memastikan penerapan pembedaan warna semantik antara kamar yang mendekati batas jatuh tempo (Warning) dan kamar yang telah menunggak lewat tempo (Danger).
- **Kondisi Awal**: Semua 15 kamar tampil di carousel.
- **Langkah-langkah Pengujian**:
  1. Cari Kamar A-04 (Budi Santoso). Periksa warna badge status, teks label, dan nominal tarif.
  2. Cari Kamar A-02 (Dimas Prasetyo) dan Kamar B-01 (Dodi Firmansyah). Periksa warna badge status dan teksnya.
  3. Buka popover status kamar dan pilih opsi **"Terlambat / Tempo (3)"**.
- **Hasil yang Diharapkan**:
  - Kamar A-04 menampilkan badge kuning/amber (`.badge-warning`): teks `"Jatuh Tempo H-3"` (memberi tanda peringatan preventif sebelum jatuh tempo).
  - Kamar A-02 menampilkan badge merah terang (`.badge-danger`): teks `"Terlambat H+5"` (menandakan keterlambatan kritis).
  - Kamar B-01 menampilkan badge merah terang (`.badge-danger`): teks `"Telat 3 Hari"`.
  - Pada langkah 3, filter *"Terlambat / Tempo"* memadankan ketiga unit tersebut secara harmonis (total 3 unit) tanpa membedakan status warning vs danger secara eksklusif.

---

### SKENARIO 46: Identifikasi Visual Kamar Kosong Siap Huni (Vacant Room Dashed Frame & Readiness Indicator)
- **Tujuan**: Menguji kartu unit kamar kosong (`KM-A03`, `KM-B03`, `KM-C02`) yang menerapkan bahasa visual Estify DNA khusus: border garis putus-putus (*dashed frame*) dan badge kesiapan huni.
- **Kondisi Awal**: Dasbor menampilkan seluruh katalog kamar.
- **Langkah-langkah Pengujian**:
  1. Geser carousel ke Kamar A-03, Kamar B-03, dan Kamar C-02.
  2. Amati styling kartu (border, warna latar, badge status).
  3. Klik tombol panah mengambang 28px (`.room-float-arrow`) pada thumbnail Kamar A-03.
- **Hasil yang Diharapkan**:
  - Ketiga kartu memiliki class `.status-vacant-card` dengan `border-style: dashed` berwarna halus dan background netral cerah (`#FAFAFB`), membedakannya secara tegas dari kamar yang telah berpenghuni.
  - Badge status bertuliskan `"Kosong · Siap Huni"` dengan warna brand oranye (`.badge-brand`).
  - Baris spesifikasi menyajikan tipe unit dan dimensi (misal: `"Lantai 1 · Standar (3×4m)"`), bukan nama penyewa.
  - Mengklik tombol panah mengarahkan pengguna ke dossier kamar di `WF-03-kamar.html` untuk memfasilitasi pembuatan kontrak baru atau broadcast iklan sewa.

---

### SKENARIO 47: Penanda Titik Merah Interaktif pada Feed Aktivitas (Actionable Unread Dot Indicator)
- **Tujuan**: Memverifikasi penanda titik merah (*unread dot*) pada feed aktivitas harian untuk transaksi yang memerlukan verifikasi manual segera oleh Pemilik Properti.
- **Kondisi Awal**: Terdapat 1 transaksi transfer bank sewa baru dari Budi Santoso (A-04) yang belum diverifikasi.
- **Langkah-langkah Pengujian**:
  1. Periksa baris aktivitas paling atas pada kartu *Aktivitas Terkini* di sidebar kanan.
  2. Amati elemen titik merah `.msg-unread-dot` di sebelah timestamp `"22 mnt"`.
  3. Arahkan kursor (*hover*) ke baris aktivitas tersebut.
  4. Klik baris aktivitas tersebut.
- **Hasil yang Diharapkan**:
  - Baris aktivitas menampilkan nama *"Budi Santoso (A-04)"*, rincian *"Transfer sewa Rp 1.500.000 · Perlu Verifikasi"*, dan titik merah solid 6.5px (`#EF4444`) ber-tooltip native *"Perlu Tindakan"*.
  - Mengarahkan kursor mengubah latar baris menjadi abu-abu halus (`#F7F8FA`) dengan pointer kursor aktif.
  - Mengklik baris segera menavigasi rute browser ke `WF-06-pembayaran.html` untuk membuka antrean verifikasi bukti transfer manual.

---

### SKENARIO 48: Proteksi Anti-Overflow Popover Sisi Kanan (Right-Edge Menu Alignment & Zero Window Scrollbar)
- **Tujuan**: Memastikan menu popover dropdown di sisi kanan dasbor menerapkan class `.menu-right` sehingga membuka ke arah dalam tanpa memicu scrollbar horizontal pada jendela browser.
- **Kondisi Awal**: Dasbor terbuka pada resolusi Desktop (1440px).
- **Langkah-langkah Pengujian**:
  1. Buka dropdown filter tahun pada kartu Arus Kas (`#wrapYearFilter`).
  2. Buka dropdown opsi pemeliharaan pada kartu Kondisi Properti (`#wrapConditionMenu`).
  3. Buka dropdown filter aktivitas pada kartu Aktivitas Terkini (`#wrapActivityFilter`).
  4. Periksa posisi koordinat sisi kanan (`right: 0`) dari seluruh menu popover yang terbuka terhadap tepi kontainer kartu induk.
  5. Periksa ada/tidaknya horizontal scrollbar pada window browser (`document.documentElement.scrollWidth > window.innerWidth`).
- **Hasil yang Diharapkan**:
  - Seluruh menu popover (`#menuYearFilter`, `#menuConditionMenu`, `#menuActivityFilter`, `#menuFilterRoomStatus`) menerapkan positioning `.menu-right` (`left: auto; right: 0;`).
  - Menu popover memanjang ke arah kiri bawah, tetap 100% berada di dalam batas pandang viewport (*viewport-contained*).
  - Tidak terjadi horizontal scrollbar pada halaman (`scrollWidth === innerWidth`), mencegah layout bergoyang (*zero edge clipping*).

---

### SKENARIO 49: Ketahanan Tampilan pada Skala DPI Tinggi (Windows Display Scaling 125% & 150%)
- **Tujuan**: Memverifikasi ketahanan layout 2-kolom asimetris pada layar laptop Windows dengan Display Scaling 125% (lebar efektif ~1228px) dan 150% (lebar efektif ~1024px).
- **Kondisi Awal**: Dasbor dimuat pada browser dengan zoom level diatur ke 125% dan 150%.
- **Langkah-langkah Pengujian**:
  1. Atur zoom browser ke **125%**:
     - Amati proporsi kontainer kolom utama kiri dan sidebar kanan 360px.
  2. Atur zoom browser ke **150%**:
     - Amati transisi breakpoint `@media (max-width: 1200px)`.
- **Hasil yang Diharapkan**:
  - Pada skala 125%, layout mempertahankan rasio 2-kolom secara proporsional berkat batasan kontainer `max-width: 1440px; width: calc(100% - 40px);`.
  - Pada skala 150% (viewport efektif <= 1200px), media query secara anggun mengubah layout menjadi tumpukan 1-kolom terpadu di mana sidebar kanan bertransformasi menjadi grid 2-kolom rapi di bagian bawah kanvas (*laptop-friendly reflow*).
  - Tidak ada teks yang saling bertumpuk, kartu metrik gauge tetap terbaca tajam, dan CLS (*Cumulative Layout Shift*) tetap bernilai 0.

---

### SKENARIO 50: Proteksi Navigasi Sticky Topbar & Masking Top Canopy Overlay (Sticky Scroll Canopy Guard)
- **Tujuan**: Memvalidasi perilaku Topbar navigasi saat halaman digulir vertikal ke bawah (*scroll down*) dan integritas masking lengkungan kanopi atas (`.top-canopy-overlay`).
- **Kondisi Awal**: Pengguna berada di bagian atas dasbor.
- **Langkah-langkah Pengujian**:
  1. Lakukan scrolling ke bawah melewati Baris 1 hingga mencapai kartu katalog kamar.
  2. Amati posisi elemen Topbar (`#mainTopbar`).
  3. Amati elemen `.top-canopy-overlay` di bagian atas kanvas.
  4. Periksa apakah konten kartu dasbor yang melintas di bawah Topbar terlihat rapi melalui efek kaca (*glassmorphism backdrop-filter*).
- **Hasil yang Diharapkan**:
  - Topbar navigasi tetap melekat di bagian atas layar (*floating/sticky navbar*) dengan z-index tinggi (`z-index: 100`), sehingga pengguna dapat berpindah modul kapan saja tanpa harus menggulir kembali ke atas.
  - Elemen `.top-canopy-overlay` mengunci batas atas kanvas scroll dengan lengkungan sudut membulat yang lembut, menyamarkan tepi atas konten yang terpotong.
  - Efek blur latar (`backdrop-filter: blur(12px)`) memberikan kedalaman visual modern tanpa mengaburkan keterbacaan teks navigasi pill.

---

### SKENARIO 51: Penanganan Karakter Khusus & Sanitasi Input Pencarian Kamar (XSS & Special Characters Guard)
- **Tujuan**: Memastikan mesin filter instan kamar kebal terhadap injeksi karakter HTML khusus, simbol skrip (`<script>`), kutip, tanda kurung, dan simbol regex tanpa menimbulkan error runtime.
- **Kondisi Awal**: Pemilik berada pada dasbor dengan 15 unit kamar aktif di carousel.
- **Langkah-langkah Pengujian**:
  1. Klik input pencarian kamar `#quickRoomSearchInput`.
  2. Ketik string skrip berbahaya: `"<script>alert('xss')</script>"`.
  3. Amati respon DOM dan konsol developer browser.
  4. Hapus teks, lalu ketik karakter simbol: `"' OR '1'='1"`, `"><img src=x onerror=alert(1)>"`, `"/* comment */"`.
  5. Hapus teks, lalu ketik simbol tanda kurung dan tanda strip: `"(3×4m)"` atau `"A-01"`.
- **Hasil yang Diharapkan**:
  - Pada langkah 2 dan 4: Karakter teks diperlakukan secara aman sebagai string teks literal murni melalui pembacaan `textContent` (bukan `innerHTML`).
  - Tidak ada skrip yang dieksekusi (*zero XSS execution*), tidak ada crash konsol JavaScript, dan sistem merespons aman dengan menampilkan panel Empty State (`#roomEmptySearch`).
  - Pada langkah 5: Karakter yang sah (seperti tanda kurung spesifikasi dimensi atau tanda strip kode unit) dapat dicocokkan secara akurat dengan unit terkait (`KM-A01` atau unit berdimensi `3×4m`).

---

### SKENARIO 52: Keterpisahan Kursor Ergonomis & Penyeleksian Teks Kartu Kamar (Text Selectability vs Action Arrow)
- **Tujuan**: Memastikan antarmuka menerapkan prinsip ergonomi kursor terpisah (*text selectable, arrow clickable*) agar pengguna dapat menyalin teks nomor kamar, nama penghuni, atau tarif tanpa sengaja memicu navigasi link ke `WF-03`.
- **Kondisi Awal**: Deretan kartu kamar tampil di carousel.
- **Langkah-langkah Pengujian**:
  1. Arahkan kursor mouse ke teks nama penyewa *"Dimas Prasetyo"* pada Kamar A-02.
  2. Amati bentuk kursor (*cursor style*).
  3. Lakukan klik-tahan dan seret (*click-drag*) untuk menyeleksi teks tersebut, lalu tekan `Ctrl + C` (Copy).
  4. Amati apakah terjadi perpindahan halaman browser.
  5. Arahkan kursor ke tombol panah mengambang 28px (`.room-float-arrow`) di sudut kanan atas thumbnail gambar, lalu klik.
- **Hasil yang Diharapkan**:
  - Pada langkah 1-3, kursor berubah menjadi kursor teks balok (*I-beam cursor* via `cursor: text; user-select: text;`). Teks berhasil disalin ke clipboard tanpa memicu peristiwa klik navigasi.
  - Pada langkah 4, halaman dasbor tetap stabil di posisinya (*zero accidental navigation*).
  - Pada langkah 5, kursor pada tombol panah berubah menjadi `cursor: pointer`, tombol merespons hover dengan latar hitam obsidian `#111111`, dan klik secara presisi mengarahkan navigasi ke `WF-03-kamar.html`.

---

### SKENARIO 53: Penanganan Resize Jendela Dinamis pada Offset Infinite Carousel (Dynamic Window Resize Reflow)
- **Tujuan**: Menguji ketahanan kalkulasi lebar satu set kartu (`singleSetWidth`) dan posisi scroll horizontal carousel saat jendela browser diperbesar atau diperkecil secara dinamis (*live viewport resizing*).
- **Kondisi Awal**: Carousel berada pada posisi tengah default (set original).
- **Langkah-langkah Pengujian**:
  1. Geser carousel ke kanan hingga menampilkan unit kamar di Lantai 2 (KM-B01 s.d. KM-B03).
  2. Ubah ukuran jendela browser secara cepat dari lebar Desktop 1440px ke Laptop 1100px.
  3. Perbesar kembali jendela browser ke lebar 1440px.
  4. Lanjutkan pengguliran ke kanan hingga melewati unit klon akhir.
- **Hasil yang Diharapkan**:
  - Transisi CSS dan persentase flex basis kartu kamar (`calc((100% - 28px) / 3)`) menyesuaikan lebar baru secara instan dan elastis.
  - Kartu kamar tidak mengalami keruntuhan tinggi (*zero vertical collapse*) dan tetap sejajar rapi pada tinggi 228px.
  - Mekanisme *infinite loop reset* tetap mendeteksi batas offset set kartu orisinil secara mulus tanpa melompat liar (*zero erratic scroll jump*).

---

### SKENARIO 54: Supresi Kueri Kosong pada Pencarian Global Topbar (Empty Query Suppression)
- **Tujuan**: Memastikan penekanan tombol keyboard `Enter` pada input pencarian global Topbar saat field dalam keadaan kosong atau hanya berisi spasi tidak memicu toast yang membingungkan atau navigasi yang sia-sia.
- **Kondisi Awal**: Input pencarian Topbar dalam kondisi terbuka meluncur (`.search-slide-box.active`).
- **Langkah-langkah Pengujian**:
  1. Klik tombol pencarian pada Topbar hingga kotak input terbuka dan fokus.
  2. Tanpa mengetikkan karakter apapun (string kosong `""`), tekan tombol **`Enter`** pada keyboard.
  3. Ketikkan beberapa spasi kosong (`"     "`), lalu tekan tombol **`Enter`**.
  4. Ketikkan kata kunci valid: `"Kamar A-01"`, lalu tekan tombol **`Enter`**.
- **Hasil yang Diharapkan**:
  - Pada langkah 2 dan 3: Pemanggilan fungsi `handleSlideSearchKey(event)` melakukan sanitasi `.trim()`. Karena panjang string adalah 0, sistem tidak mengeksekusi aksi apapun (tidak ada toast pencarian kosong dan tidak ada navigasi).
  - Pada langkah 4: Sistem mendeteksi kueri yang valid dan memicu toast konfirmasi: *"Mencari data untuk: 'Kamar A-01'"* (Tipe: `info`, Judul: `Pencarian Global`).

---

### SKENARIO 55: Kepatuhan Format Cetak Dokumen Dasbor (@media print Chrome Suppression)
- **Tujuan**: Memastikan antarmuka dasbor ramah cetak (*print-friendly*) saat Pemilik Properti mencetak ringkasan kinerja eksekutif kost ke media kertas fisik atau PDF (`Ctrl + P`).
- **Kondisi Awal**: Dasbor terbuka pada mode Pemilik.
- **Langkah-langkah Pengujian**:
  1. Buka dialog cetak browser dengan menekan kombinasi tombol **`Ctrl + P`** (Print Preview).
  2. Periksa pratinjau halaman cetak (*print preview sheet*).
  3. Amati tampilan elemen interaktif Topbar, toolbar tombol, dan kartu metrik.
- **Hasil yang Diharapkan**:
  - Elemen navigasi interaktif yang tidak relevan di kertas (input field pencarian, tombol navigasi chevron carousel, tombol clear silang, dropdown lonceng notifikasi, dan tombol titik-tiga opsi) disembunyikan atau dihilangkan secara bersih.
  - Tiga kartu speedometer radial gauge, Double Bar Chart arus kas 6-bulan, dan kartu oranye performa properti tercetak tegas dengan kontras teks tinggi di atas kertas putih tanpa terpotong batas margin cetak standar A4 (*page-break friendly*).

---

### SKENARIO 56: Sinkronisasi Terminasi Sesi Lintas-Tab Browser (Cross-Tab Logout Synchronization)
- **Tujuan**: Memastikan integritas keamanan sesi di mana saat pengguna melakukan logout pada satu tab browser, seluruh tab dasbor lain yang sedang terbuka otomatis mendeteksi pembersihan kredensial dan mengalihkan tampilan ke halaman login.
- **Kondisi Awal**: Pengguna membuka dasbor `WF-02-dashboard.html` pada dua tab browser berdampingan (Tab A dan Tab B) dengan token autentikasi aktif di `localStorage`.
- **Langkah-langkah Pengujian**:
  1. Pada Tab A, klik avatar profil pengguna, lalu klik opsi menu bahaya **"Keluar Akun"** (`handleLogout`).
  2. Amati proses pengalihan rute pada Tab A menuju `WF-01-login.html`.
  3. Beralih ke Tab B tanpa me-refresh halaman.
  4. Lakukan interaksi apapun pada Tab B (misal: mengklik tombol filter atau mencoba membuka rute modul lain).
- **Hasil yang Diharapkan**:
  - Pada langkah 1, pembersihan token (`localStorage.removeItem('ruma_auth_token')`) memicu event native `storage` lintas-dokumen.
  - Pada Tab B, listener mendeteksi ketiadaan sesi aktif, seketika membatalkan interaksi pengguna, dan mengeksekusi pengalihan otomatis (*forced redirection*) ke `WF-01-login.html` disertai toast informasi: *"Sesi telah diakhiri dari jendela lain"*.
  - Tidak ada data kamar atau keuangan kost yang dapat diakses dari Tab B pasca-logout (*zero orphaned session leak*).

---

### SKENARIO 57: Kepatuhan Mode Kontras Tinggi Sistem Operasi (Windows High Contrast / Forced Colors Mode)
- **Tujuan**: Memastikan antarmuka dasbor mematuhi pedoman WCAG 2.1 (Success Criterion 1.4.11 Non-text Contrast) saat pengguna mengaktifkan mode aksesibilitas *High Contrast / Contrast Themes* bawaan OS Windows.
- **Kondisi Awal**: Sistem operasi Windows diatur pada mode tema kontras tinggi (*Windows Contrast Themes: Desert, Aquatic, Night Sky, atau Dusk*).
- **Langkah-langkah Pengujian**:
  1. Buka halaman dasbor pada browser yang mendukung kueri media `@media (forced-colors: active)`.
  2. Amati garis batas (*borders*) kartu metrik gauge, kartu highlight oranye, dan deretan kartu unit kamar.
  3. Amati keterbacaan teks dan badge status (Lunas, Kosong, Terlambat, Perbaikan).
  4. Periksa kontras arc SVG pada ketiga speedometer radial gauge.
- **Hasil yang Diharapkan**:
  - Seluruh batas kartu (`border`) secara otomatis dialihkan ke warna sistem `ButtonBorder` / `CanvasText` sehingga struktur kanvas tetap terpisah tegas tanpa mengandalkan warna hex spesifik.
  - Teks pada kartu oranye dan badge status otomatis mengadopsi warna teks sistem berkontras tinggi (`HighlightText` / `CanvasText`).
  - Arc SVG dan indikator grafik batang tetap memiliki garis pemisah tegas atau outline 1px berstandar WCAG, menjamin seluruh data tetap dapat dibedakan dengan jelas oleh pengguna dengan gangguan penglihatan warna (*low vision accessible*).

---

### SKENARIO 58: Aksesibilitas Navigasi Tombol Panah Keyboard pada Track Carousel (Keyboard Arrow Left/Right Carousel Scrolling)
- **Tujuan**: Memverifikasi bahwa kontainer carousel kamar dapat digulirkan secara horizontal menggunakan tombol panah keyboard (`ArrowLeft` dan `ArrowRight`) ketika kontainer atau kartu di dalamnya menerima fokus keyboard.
- **Kondisi Awal**: Dasbor terbuka. Pengguna menggunakan keyboard fisik untuk navigasi.
- **Langkah-langkah Pengujian**:
  1. Tekan tombol **`Tab`** hingga fokus berada pada kartu kamar pertama atau kontainer `#quickRoomList`.
  2. Tekan tombol **`ArrowRight`** sebanyak 3 kali secara berturut-turut.
  3. Amati pergeseran scroll horizontal pada carousel.
  4. Tekan tombol **`ArrowLeft`** sebanyak 3 kali.
  5. Tekan tombol **`Home`** dan **`End`**.
- **Hasil yang Diharapkan**:
  - Penekanan tombol `ArrowRight` menggeser kontainer carousel ke arah kanan secara halus dan memindahkan fokus visual ke set kartu berikutnya.
  - Penekanan tombol `ArrowLeft` menggeser kontainer kembali ke arah kiri.
  - Penekanan tombol `End` meluncurkan scroll langsung ke akhir set kartu, sedangkan tombol `Home` mengembalikan posisi ke awal set kartu.
  - Scroll snap CSS (`scroll-snap-type: x mandatory`) secara magnetik mengunci kartu yang sedang aktif di tepi viewport, menjamin navigasi non-mouse berjalan 100% ergonomis.

---

### SKENARIO 59: Kepatuhan Preferensi Aksesibilitas Gerak Berkurang (@media prefers-reduced-motion)
- **Tujuan**: Memastikan antarmuka mematuhi standar aksesibilitas WCAG 2.1 (Success Criterion 2.2.2 Pause, Stop, Hide & 2.3.3 Animation from Interactions) saat pengguna mengaktifkan pengaturan *"Reduce Motion"* pada sistem operasi.
- **Kondisi Awal**: Fitur preferensi gerak berkurang (*Reduced Motion*) diaktifkan pada sistem operasi pengguna (`prefers-reduced-motion: reduce`).
- **Langkah-langkah Pengujian**:
  1. Buka dasbor dan klik tombol panah penggeser carousel (`chevron-right`).
  2. Arahkan kursor (*hover*) ke kolom batang pada grafik Arus Kas 6-Bulan.
  3. Arahkan kursor (*hover*) ke tombol panah mengambang kartu kamar (`.room-float-arrow`).
- **Hasil yang Diharapkan**:
  - Pada langkah 1, animasi pengguliran carousel beralih dari transisi meluncur lambat (`scroll-behavior: smooth`) menjadi perpindahan instan (`scroll-behavior: auto`), mencegah pemicu mabuk gerak visual (*vestibular motion triggers*).
  - Pada langkah 2 dan 3, efek transformasi penskalaan vertikal (`scaleY(1.04)`) dan zoom tombol panah (`scale(1.08)`) dinonaktifkan atau digantikan dengan perubahan warna latar statis ber-kontras tinggi tanpa transisi gerak (*zero motion dizziness*).

---

### SKENARIO 60: Ketahanan Siklus Pemulihan BFCache Pasca-Navigasi Balik (BFCache Restoration & Anti-Duplication Guard)
- **Tujuan**: Memverifikasi stabilitas siklus hidup DOM dan posisi memori saat pengguna menavigasi dari dasbor ke halaman lain lalu menekan tombol *Back* pada peramban (*Back-Forward Cache / BFCache*).
- **Kondisi Awal**: Pengguna berada pada dasbor, lalu mengklik salah satu unit kamar untuk berpindah ke `WF-03-kamar.html`.
- **Langkah-langkah Pengujian**:
  1. Pada halaman `WF-03-kamar.html`, klik tombol **`Back`** pada peramban web browser.
  2. Amati siklus pemuatan kembali halaman dasbor `WF-02-dashboard.html`.
  3. Periksa jumlah elemen kartu kamar pada DOM kontainer `#quickRoomList`.
  4. Periksa posisi gulir horizontal carousel dan render ikon Lucide SVG.
- **Hasil yang Diharapkan**:
  - Variabel proteksi `isCarouselCloned` mendeteksi bahwa proses kloning telah dilakukan sebelumnya, mencegah duplikasi set kartu klon baru (*anti-duplicate clone guard / total tepat 45 node*).
  - Posisi gulir horizontal carousel tetap bertahan persis pada posisi offset terakhir sebelum pengguna berpindah halaman tanpa melompat ke awal.
  - Ikon SVG Lucide ter-render sempurna tanpa placeholder tag `<i>` kosong (*flawless icon re-hydration*).

---

### SKENARIO 61: Pengalihan Otomatis Akses Staf ke Dasbor Operasional Khusus (Staff Role Auto-Redirection ke WF-02-staf-dashboard.html)
- **Tujuan**: Memastikan guardrail otorisasi RBAC pada `components.js` secara otomatis mengalihkan pengguna berstatus Staf (`role=staf` atau `staff`) dari URL dasbor eksekutif pemilik ke dasbor operasional khusus staf tanpa jeda visual.
- **Kondisi Awal**: Pengguna memiliki sesi aktif sebagai Staf (`role=staf`).
- **Langkah-langkah Pengujian**:
  1. Akses langsung URL `WF-02-dashboard.html?role=staf` pada address bar browser.
  2. Amati siklus eksekusi `renderTopbar('dashboard')` pada `assets/js/components.js`.
  3. Periksa URL akhir pada address bar browser dan komponen yang ter-render.
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi `role === 'staff'` pada halaman `WF-02-dashboard.html`.
  - Fungsi `renderTopbar` mengeksekusi `window.location.replace('WF-02-staf-dashboard.html')`.
  - Halaman seketika berganti ke Dasbor Operasional Staf (`WF-02-staf-dashboard.html`) tanpa membocorkan data grafik keuangan eksekutif atau margin laba bersih pemilik.

---

### SKENARIO 62: Sinkronisasi Jadwal Piket & Log Inventaris pada Banner Shift Staf (Staff Shift Banner & Sync Data)
- **Tujuan**: Memverifikasi banner identitas shift kerja staf lapangan, metadata waktu sistem, operator aktif, dan fungsionalitas tombol sinkronisasi data operasional.
- **Kondisi Awal**: Staf berada pada `WF-02-staf-dashboard.html`.
- **Langkah-langkah Pengujian**:
  1. Amati kartu hero banner staf di bagian atas dasbor (`.staff-hero-banner`).
  2. Periksa informasi tanggal, waktu sistem, nama operator, dan badge shift kerja.
  3. Klik tombol *"Sinkron Data"* (`.btn-white-outline`).
- **Hasil yang Diharapkan**:
  - Banner menampilkan judul *"Dasbor Operasional Kost Budi Makmur"*.
  - Metadata menampilkan tanggal berjalan, waktu sistem, operator *"Rini Setiawati"*, dan badge kuning *"Shift Pagi (08:00 - 17:00)"*.
  - Mengklik tombol *"Sinkron Data"* memicu toast notifikasi informasi: *"Jadwal piket & log inventaris telah disinkronkan"* (Tipe: `info`).

---

### SKENARIO 63: Tindakan Pembaruan Progres Tiket Lapangan Staf (Staff Ticket Progress Update Modal & Redirect)
- **Tujuan**: Menguji alur kerja staf dalam menindaklanjuti antrean tiket perbaikan mendesak di lapangan melalui tombol update progres.
- **Kondisi Awal**: Tiket Kamar A-04 (Pipa Wastafel Bocor) berstatus *Mendesak* & *Dalam Pengerjaan* oleh Pak Joko.
- **Langkah-langkah Pengujian**:
  1. Pada kartu tiket Kamar A-04, periksa identitas kamar, judul komplain, nama pelapor Budi Santoso, dan nama teknisi di lokasi.
  2. Klik tombol *"Detail"* pada baris tiket.
  3. Kembali ke dasbor staf, lalu klik tombol *"Update Progres"* (`updateTicketModal('A-04')`).
- **Hasil yang Diharapkan**:
  - Tombol *"Detail"* mengarahkan pengguna ke dossier tiket portal `WF-12-portal-tiket-detail.html`.
  - Tombol *"Update Progres"* memunculkan toast informasi: *"Membuka panel update tiket Kamar A-04..."*, lalu dalam 500ms mengarahkan rute browser ke halaman detail tiket untuk input catatan progres perbaikan.

---

### SKENARIO 64: Penjadwalan Teknisi Servis AC dari Antrean Tiket Staf (Staff Ticket Scheduling & Toast Feedback)
- **Tujuan**: Memvalidasi aksi penjadwalan teknisi rekanan pada tiket berstatus normal/ditugaskan (Kamar B-02 · Servis AC).
- **Kondisi Awal**: Tiket Kamar B-02 dijadwalkan untuk teknisi Pak Deni (Besok, 09:00 WIB).
- **Langkah-langkah Pengujian**:
  1. Amati kartu tiket Kamar B-02 pada antrean tiket perbaikan lapangan.
  2. Periksa badge status *"Normal"* dan *"Ditugaskan"*.
  3. Klik tombol *"Atur Jadwal"* pada footer kartu tiket.
- **Hasil yang Diharapkan**:
  - Sistem menampilkan toast feedback: *"Membuka jadwal servis AC"* (Tipe: `info`).
  - Staf mendapatkan konfirmasi bahwa jadwal teknisi Pak Deni tetap sinkron dengan kalender operasional properti.

---

### SKENARIO 65: Pengisian Otomatis (Autofill) Nominal Sewa Form Catat Pembayaran Lapangan (Tenant Rent Auto-Fill)
- **Tujuan**: Memverifikasi fitur otomatisasi tarif sewa saat staf memilih kamar/penghuni pada formulir cepat penerimaan sewa lapangan.
- **Kondisi Awal**: Form catat pembayaran dalam kondisi kosong (`inputAmount` kosong).
- **Langkah-langkah Pengujian**:
  1. Klik dropdown `#selectTenant`.
  2. Pilih opsi **"Kamar A-04 — Budi Santoso (Sewa Rp 1.500.000)"**.
     - *Amati nilai pada field `#inputAmount`*.
  3. Ganti pilihan menjadi **"Kamar B-01 — Dodi Firmansyah (Sewa Rp 1.300.000)"**.
     - *Amati nilai pada field `#inputAmount`*.
  4. Ganti pilihan menjadi **"Kamar A-02 — Dimas Prasetyo (Sewa Rp 1.200.000)"**.
     - *Amati nilai pada field `#inputAmount`*.
  5. Kembalikan pilihan ke opsi default `"-- Pilih Kamar --"`.
- **Hasil yang Diharapkan**:
  - Pemilihan Kamar A-04 secara instan mengisi `#inputAmount` dengan nilai `"1.500.000"`.
  - Pemilihan Kamar B-01 mengubah nilai menjadi `"1.300.000"`.
  - Pemilihan Kamar A-02 mengubah nilai menjadi `"1.200.000"`.
  - Memilih opsi kosong mengosongkan kembali field `#inputAmount`, mencegah kesalahan input manual oleh operator.

---

### SKENARIO 66: Validasi Form Kosong Catat Pembayaran Lapangan (Staff Payment Form Mandatory Validation)
- **Tujuan**: Menguji ketahanan formulir terhadap pengiriman data yang tidak lengkap (*Negative Validation Guard*).
- **Kondisi Awal**: Staf berada di depan formulir pembayaran cepat dengan field belum terisi.
- **Langkah-langkah Pengujian**:
  1. Kosongkan pilihan kamar (`#selectTenant` bernilai `""`).
  2. Kosongkan nominal (`#inputAmount` bernilai `""`).
  3. Klik tombol submit *"Simpan & Teruskan ke Pemilik"*.
- **Hasil yang Diharapkan**:
  - Browser memicu validasi native HTML5 `required` pada elemen yang belum terisi.
  - Handler JavaScript `handleStaffPaymentSubmit(e)` memvalidasi parameter: jika data kamar atau nominal kosong, eksekusi dihentikan dan memunculkan toast bahaya: *"Mohon lengkapi data kamar dan nominal sewa"* (Tipe: `danger`).
  - Tidak ada baris kosong yang dimasukkan ke dalam tabel catatan pembayaran staf.

---

### SKENARIO 67: Pencatatan Transaksi Lapangan Dinamis dengan Status Menunggu Pemilik (Dynamic Payment Log & Zero Self-Approval)
- **Tujuan**: Membuktikan penegakan integritas bisnis di mana penerimaan sewa yang dicatat staf secara otomatis berstatus PENDING verifikasi pemilik (*Zero Self-Approval*).
- **Kondisi Awal**: Tabel log pembayaran hari ini menampilkan 2 transaksi sebelumnya.
- **Langkah-langkah Pengujian**:
  1. Pilih Kamar A-01 (Siti Aminah).
  2. Verifikasi nominal terisi Rp 1.200.000.
  3. Pilih metode *"Tunai di Meja Pengelola (Cash)"*.
  4. Isi catatan: `"Titip sewa tunai November 2026 - Kuitansi #K-105"`.
  5. Klik tombol *"Simpan & Teruskan ke Pemilik"*.
  6. Periksa pemutakhiran tabel log pembayaran `#staffPaymentTableBody`.
- **Hasil yang Diharapkan**:
  - Transaksi baru disisipkan di baris paling atas tabel (*prepended row*) dengan latar highlight kuning lembut (`#FFFBEB`).
  - Baris menampilkan rincian: *"Kamar A-01"*, waktu *"Baru saja"*, nominal *"Rp 1.200.000"*, metode *"Tunai di Meja (Titip sewa tunai November 2026 - Kuitansi #K-105)"*, dan badge status kuning tegas: `"Menunggu Pemilik"`.
  - Seluruh field form di-reset bersih secara otomatis.
  - Muncul toast notifikasi sukses: *"Setoran Rp 1.200.000 untuk Kamar A-01 berhasil dicatat (Menunggu verifikasi Owner)"* (Tipe: `success`, Judul: `Catatan Pembayaran Diteruskan`).
  - Staf tidak memiliki tombol atau opsi untuk meng-approve pembayaran tersebut secara sepihak.

---

### SKENARIO 68: Interaktivitas Checklist Tugas Harian Staf & Pemutakhiran Counter Selesai (Staff Daily Checklist & Counter Sync)
- **Tujuan**: Menguji fitur interaktif daftar tugas harian staf, efek coret teks saat selesai, dan sinkronisasi angka pada badge counter tugas.
- **Kondisi Awal**: Terdapat 5 tugas piket staf. 3 tugas telah selesai (`done`), badge counter menampilkan `"3 / 5 Selesai"`.
- **Langkah-langkah Pengujian**:
  1. Amati kartu *Checklist Tugas Harian* pada sidebar kanan (`#checklistContainer`).
  2. Klik item tugas ke-4: *"Dampingi servis pipa Kamar A-04"*.
     - *Amati respon visual checkbox, teks tugas, dan badge counter*.
  3. Klik item tugas ke-5: *"Inspeksi kebersihan kamar kosong A-03"*.
     - *Amati respon*.
  4. Klik kembali item tugas ke-4 untuk membatalkan status selesai (*uncheck*).
- **Hasil yang Diharapkan**:
  - Pada langkah 2, class `.done` ditambahkan ke elemen tugas: kotak checkbox berubah hijau terisi ikon centang Lucide `check`, teks tugas dicoret (*strikethrough*), dan opasitas berkurang halus menjadi 0.65.
  - Badge counter tugas `#taskCounterBadge` seketika bertambah menjadi `"4 / 5 Selesai"`.
  - Pada langkah 3, badge counter berubah menjadi `"5 / 5 Selesai"`.
  - Pada langkah 4, class `.done` dicabut: ikon centang menghilang, coretan teks dibatalkan, dan badge counter berkurang kembali secara akurat menjadi `"4 / 5 Selesai"`.

---

### SKENARIO 69: Pemantauan Matriks Status 15 Kamar Lapangan 3 Lantai (Staff 15-Room Quick Matrix & Direct Link)
- **Tujuan**: Memvalidasi akurasi peta matriks 15 kamar fisik yang terbagi dalam 3 lantai (Lantai 1: A01-A05, Lantai 2: B01-B05, Lantai 3: C01-C05), tooltip nama penghuni, dan tautan ke katalog kamar staf.
- **Kondisi Awal**: Matriks menampilkan 15 tile kamar dengan pewarnaan semantik status lapangan.
- **Langkah-langkah Pengujian**:
  1. Periksa pembagian lantai pada panel *Status Cepat 15 Kamar*:
     - Lantai 1: Kamar A-01 s.d. A-05 (4 hijau terisi, 1 abu-abu kosong A-03).
     - Lantai 2: Kamar B-01 s.d. B-05 (3 hijau terisi, 1 abu-abu kosong B-03, 1 kuning perbaikan B-05).
     - Lantai 3: Kamar C-01 s.d. C-05 (4 hijau terisi, 1 abu-abu kosong C-02).
  2. Arahkan kursor (*hover*) ke tile kamar **A-01**, **A-03**, dan **B-05** untuk memeriksa atribut `title` tooltip native.
  3. Klik tautan header *"Lihat Detail"*.
- **Hasil yang Diharapkan**:
  - Ringkasan legenda di bagian bawah menampilkan tepat: *"Terisi (11)"*, *"Siap Huni (3)"*, dan *"Perlu Servis (1)"*, 100% konsisten dengan data baseline properti Kost Budi Makmur.
  - Hover tile A-01 menampilkan tooltip: `"A-01: Siti Aminah (Terisi · Lunas)"`.
  - Hover tile A-03 menampilkan: `"A-03: Kosong Siap Huni"`.
  - Hover tile B-05 menampilkan: `"B-05: Dalam Perbaikan (Servis AC #T-04)"`.
  - Mengklik tautan *"Lihat Detail"* menavigasi rute browser ke direktori kamar khusus staf `WF-03-kamar.html?role=staf`.

---

### SKENARIO 70: Integrasi Tautan Kontak Cepat WhatsApp Teknisi Rekanan & Pemilik Kost (Contractor & Owner WhatsApp URL Encoding)
- **Tujuan**: Memastikan integritas tautan cepat komunikasi darurat lapangan ke teknisi rekanan dan pemilik properti melalui WhatsApp protocol link.
- **Kondisi Awal**: Panel kontak teknisi & owner menampilkan 3 entitas kontak.
- **Langkah-langkah Pengujian**:
  1. Periksa kartu kontak 1: Pak Joko Santoso (Teknisi Sanitasi & Pipa).
  2. Periksa kartu kontak 2: Pak Deni Kusuma (Teknisi Listrik & AC).
  3. Periksa kartu kontak 3: Budi Santoso (Pemilik Kost / Owner).
  4. Periksa atribut `href`, `target="_blank"`, dan format URL WhatsApp pada masing-masing tombol tombol hijau Lucide `message-square`.
- **Hasil yang Diharapkan**:
  - Kontak Pak Joko mengarah ke `https://wa.me/6281234567890?text=Halo%20Pak%20Joko,%20update%20servis%20pipa%20Kamar%20A-04`.
  - Kontak Pak Deni mengarah ke `https://wa.me/6281398765432?text=Halo%20Pak%20Deni,%20jadwal%20servis%20AC%20Kamar%20B-02`.
  - Kontak Owner mengarah ke `https://wa.me/6281122334455?text=Laporan%20harian%20operasional%20Kost%20Budi%20Makmur`.
  - Seluruh parameter pesan WhatsApp ter-encode dengan aman (*proper URL encoding*), nomor telepon internasional Indonesia (`62`), dan membuka jendela percakapan baru di tab terpisah tanpa menutup dasbor kerja staf.

### SKENARIO 71: Navigasi Langsung (Drill-Down) dari 3 KPI Radial Gauge Dasbor Staf
- **Tujuan**: Memverifikasi bahwa ketiga kartu speedometer radial gauge pada dasbor operasional staf memiliki interaksi klik (drill-down) yang mengarahkan staf ke modul terkait dengan parameter peran staf yang tetap terjaga.
- **Kondisi Awal**: Staf berada pada halaman `WF-02-staf-dashboard.html`.
- **Langkah-langkah Pengujian**:
  1. Klik Kartu 1 (*Okupansi Fisik Kamar: 11 / 15 Unit*).
  2. Kembali ke dasbor staf, lalu klik Kartu 2 (*Tiket Perbaikan Aktif: 3 Tiket*).
  3. Kembali ke dasbor staf, lalu klik Kartu 3 (*Setoran Pending Verifikasi: 2 Transaksi*).
- **Hasil yang Diharapkan**:
  - Seluruh kartu memiliki atribut `cursor: pointer` dan title panduan.
  - Kartu 1 mengarahkan browser ke `WF-03-kamar.html?role=staf`.
  - Kartu 2 mengarahkan browser ke `WF-08-tiket.html?role=staf`.
  - Kartu 3 mengarahkan browser ke `WF-05-tagihan.html?role=staf`.
  - Tidak ada data finansial laba bersih atau pengeluaran pemilik yang terekspos.

---

### SKENARIO 72: Navigasi Antrean Penuh Tiket Lapangan Staf (Header Action Shortcut ke WF-08)
- **Tujuan**: Memvalidasi tombol navigasi pintas *"Lihat Semua Tiket (3)"* pada header panel antrean tiket perbaikan lapangan.
- **Kondisi Awal**: Panel tiket menampilkan 2 kartu tugas mendesak hari ini.
- **Langkah-langkah Pengujian**:
  1. Arahkan kursor ke tombol *"Lihat Semua Tiket (3)"* pada header panel tiket (`.panel-header a.btn-white-outline`).
  2. Periksa atribut `href` pada elemen anchor.
  3. Klik tombol tersebut.
- **Hasil yang Diharapkan**:
  - Tombol memiliki styling capsule pill outline (`.btn-pill.btn-white-outline`) dengan ikon panah kanan Lucide `arrow-right`.
  - Klik langsung mengarahkan rute browser ke modul manajemen tiket staf `WF-08-tiket.html?role=staf`.

---

### SKENARIO 73: Akses Lembar Detail Tiket Lapangan Kamar A-04 (Detail Action Link ke WF-12)
- **Tujuan**: Menguji tombol *"Detail"* pada baris tiket perbaikan kamar A-04 untuk membuka dossier komplain teknis lengkap.
- **Kondisi Awal**: Tiket pipa bocor Kamar A-04 tampil pada antrean tiket lapangan.
- **Langkah-langkah Pengujian**:
  1. Pada kartu tiket Kamar A-04, klik tombol *"Detail"* (`.btn-white-outline`).
  2. Amati respon rute peramban.
- **Hasil yang Diharapkan**:
  - Sistem mengarahkan browser secara langsung ke lembar detail tiket portal `WF-12-portal-tiket-detail.html`.
  - Memungkinkan staf menginspeksi lampiran foto bukti kebocoran pipa yang dikirimkan oleh penghuni Budi Santoso.

---

### SKENARIO 74: Pengosongan Formulir Pembayaran Lapangan Staf (Form Reset Action)
- **Tujuan**: Memvalidasi fungsi tombol *"Reset Form"* untuk membersihkan seluruh input data penerimaan sewa lapangan sebelum pengiriman data.
- **Kondisi Awal**: Staf telah memilih kamar A-04 (nominal terisi Rp 1.500.000) dan mengetikkan catatan tanda terima.
- **Langkah-langkah Pengujian**:
  1. Pastikan dropdown `#selectTenant` terisi dan `#inputAmount` terisi nilai nominal.
  2. Klik tombol *"Reset Form"* (`button[type="reset"]`).
  3. Amati nilai pada seluruh input field formulir.
- **Hasil yang Diharapkan**:
  - Pilihan kamar pada dropdown `#selectTenant` kembali ke opsi default `"-- Pilih Kamar --"`.
  - Field `#inputAmount` dan `#inputNotes` kembali kosong bersih.
  - Dropdown metode pembayaran kembali ke nilai awal (`tunai`).
  - Tidak ada data yang tersisa atau terkirim ke server secara tidak sengaja.

---

### SKENARIO 75: Responsivitas Multi-Perangkat Dasbor Operasional Staf (Tablet & Mobile Stacking Reflow)
- **Tujuan**: Memastikan antarmuka dasbor staf responsif dan ergonomis saat dioperasikan oleh staf melalui perangkat tablet inspeksi lapangan atau smartphone smartphone pengawas.
- **Kondisi Awal**: Halaman `WF-02-staf-dashboard.html` dibuka pada resolusi desktop standar (1440px).
- **Langkah-langkah Pengujian**:
  1. Perkecil lebar viewport browser ke resolusi Tablet / Mobile (`width <= 1024px`).
  2. Amati penataan layout grid 2-kolom (`.dashboard-2col-layout`).
  3. Amati penataan 3 kartu metrik gauge (`.metric-gauge-row`).
  4. Amati matriks 15 kamar dan formulir catat pembayaran.
- **Hasil yang Diharapkan**:
  - Aturan breakpoint `@media (max-width: 1024px)` aktif: kolom sidebar kanan (`col-sidebar-flow`) melebar 100% dan bertumpuk secara rapi di bawah kolom utama (*vertical single-column stack*).
  - Tiga kartu radial gauge bertumpuk menjadi 1 kolom vertikal (`grid-template-columns: 1fr`).
  - Matriks 15 kamar tetap tersusun simetris dan dapat ditap dengan nyaman menggunakan jari (*touch target >= 44px*).
  - Tidak terjadi horizontal layout overflow atau pemotongan elemen teks (*zero viewport bleed*).

---

## 5. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Fitur Terkait | Kategori Pengujian | Status Verifikasi Kode |
|---|---|---|---|---|
| **SK-01** | Akses Dasbor Eksekutif Pemilik (Full Access) | F-01, F-06 | RBAC / Happy Path | **PASSED (Verified)** |
| **SK-02** | Akses Dasbor Operasional Staf (`?role=staf`) | F-01, F-02 | RBAC / Authorization Guard | **PASSED (Verified)** |
| **SK-03** | Guardrail Keamanan Peran Penghuni (Auto-Redirect) | F-01 | Security / Data Isolation | **PASSED (Verified)** |
| **SK-04** | Validasi 3 Speedometer Radial Gauge Cards | F-02, F-05, F-06 | Data Visualization / Metrics | **PASSED (Verified)** |
| **SK-05** | Eksplorasi Double Bar Chart 6-Bulan & Tooltip | F-06 | Data Visualization / Interaction| **PASSED (Verified)** |
| **SK-06** | Penyaringan Arsip Periode Tahunan Arus Kas | F-06 | Filter / Custom Popover | **PASSED (Verified)** |
| **SK-07** | Peninjauan Kartu Performa Highlight Properti | F-02, F-06 | Visual Identity / KPI Summary | **PASSED (Verified)** |
| **SK-08** | Infinite Looping Room Carousel Engine | F-02 | UI Architecture / Animation | **PASSED (Verified)** |
| **SK-09** | Pencarian Cepat Unit Kamar & Debounce Teks | F-02 | Search / Filter Controls | **PASSED (Verified)** |
| **SK-10** | Penyaringan Unit Kamar Berdasarkan Status Hunian | F-02 | Filter / Custom Popover | **PASSED (Verified)** |
| **SK-11** | Penyaringan Kombinasi Multivariat (Query + Status)| F-02 | State Synchronization / Logic | **PASSED (Verified)** |
| **SK-12** | Penanganan Kondisi Kosong Hasil Pencarian | F-02 | Empty State / Layout Stability| **PASSED (Verified)** |
| **SK-13** | Navigasi Dossier Kamar dari Kartu Terkini | F-02, F-03 | Navigation / Ergonomics | **PASSED (Verified)** |
| **SK-14** | Pemantauan Kondisi Properti & Beban Kerja Tiket | F-07 | Maintenance / Progress Flow | **PASSED (Verified)** |
| **SK-15** | Menu Aksi Cepat Pemeliharaan & Sinkronisasi | F-07 | Action Menu / Quick Operations | **PASSED (Verified)** |
| **SK-16** | Penyaringan Log Aktivitas Berdasarkan Periode | F-01, F-05 | Activity Feed / Filtering | **PASSED (Verified)** |
| **SK-17** | Penelusuran Kontekstual Log Aktivitas (Deep Links)| F-03 s.d. F-07 | Navigation / Workflow Integrity | **PASSED (Verified)** |
| **SK-18** | Aksesibilitas Keyboard (ESC Key & Click-Outside) | F-01 s.d. F-07 | Accessibility / WCAG 2.1 | **PASSED (Verified)** |
| **SK-19** | Pengujian Responsivitas Multi-Viewport | F-01 s.d. F-07 | Responsive Design / Mobile-First| **PASSED (Verified)** |
| **SK-20** | Pencarian Global Meluncur pada Topbar | F-01, F-02 | Global Navigation / Search Box | **PASSED (Verified)** |
| **SK-21** | Pusat Notifikasi Operasional Topbar & Mark-Read | F-01, F-04, F-07| Notification Center / State Sync | **PASSED (Verified)** |
| **SK-22** | Menu Profil Pengguna & Terminasi Sesi Logout | F-01 | Authentication / RBAC Session | **PASSED (Verified)** |
| **SK-23** | Penyaringan Kamar Status 'Dalam Perbaikan' | F-02, F-07 | Maintenance / Unit Isolation | **PASSED (Verified)** |
| **SK-24** | Resiliensi Klik Beruntun Infinite Carousel | F-02 | Stress Test / Race Condition | **PASSED (Verified)** |
| **SK-25** | Akses Pintas Header Arus Kas ke Modul Laporan | F-06 | Navigation Shortcut / Analytics | **PASSED (Verified)** |
| **SK-26** | Penanganan Status Keterlambatan Sewa & Tagihan | F-04, F-05 | Financial State / Overdue Tracking| **PASSED (Verified)** |
| **SK-27** | Kueri Pencarian Multi-Kecocokan & Kategori Kamar | F-02, F-03 | Search Integrity / Multi-Match | **PASSED (Verified)** |
| **SK-28** | Siklus Hidup Toast Feedback & Auto-Dismissal | F-01 s.d. F-07 | Feedback UI / Memory Cleanup | **PASSED (Verified)** |
| **SK-29** | Aksesibilitas Navigasi Tab Keyboard (Focus) | F-01 s.d. F-07 | Accessibility / WCAG 2.1 | **PASSED (Verified)** |
| **SK-30** | Ketahanan Gambar Thumbnail Rusak (Fallback) | F-02 | Error Handling / Visual Fallback| **PASSED (Verified)** |
| **SK-31** | Eksklusi Reksa Popover Dropdown (Anti-Collision)| F-01 s.d. F-07 | Layer Management / UI Conflict | **PASSED (Verified)** |
| **SK-32** | Normalisasi Kueri Pencarian (Trim & Lowercase) | F-02 | Search Robustness / Data Clean | **PASSED (Verified)** |
| **SK-33** | Siklus Hidup Re-hidrasi Ikon Lucide Dinamis | F-01 s.d. F-07 | Craftsmanship / Icon Integrity | **PASSED (Verified)** |
| **SK-34** | Sanitasi Parameter URL Peran & Anti-Injeksi | F-01 | Security Guard / URL Whitelist | **PASSED (Verified)** |
| **SK-35** | Navigasi Gestur Sentuh & CSS Scroll Snap | F-02 | Mobile Experience / Gesture UX | **PASSED (Verified)** |
| **SK-36** | Proteksi Kerahasiaan Finansial Mode Staf | F-01, F-06 | RBAC / Zero Confidential Leak | **PASSED (Verified)** |
| **SK-37** | Aksi Kontrol Topbar & Navigasi Dropdown Staf | F-01, F-07 | Staff UI / Operational Actions | **PASSED (Verified)** |
| **SK-38** | Navigasi Langsung (Drill-Down) Metrik Gauge | F-02, F-05, F-06| Navigation / Drill-Down KPI | **PASSED (Verified)** |
| **SK-39** | Penelusuran Notifikasi Multi-Kategori Topbar | F-01, F-05, F-07| Notification Deep Linking | **PASSED (Verified)** |
| **SK-40** | Zero State Pemeliharaan (Kondisi Gedung Prima) | F-07 | Maintenance / Zero State Flow | **PASSED (Verified)** |
| **SK-41** | Zero State Feed Aktivitas Operasional | F-01, F-05 | Activity Feed / Zero State UI | **PASSED (Verified)** |
| **SK-42** | Preservasi Konteks Peran pada Tautan Logo Brand | F-01 | Navigation / Role Preservation | **PASSED (Verified)** |
| **SK-43** | Kepatuhan Navigasi Micro-Footer & Hak Cipta | F-01 s.d. F-07 | Footer Compliance / Legal Nav | **PASSED (Verified)** |
| **SK-44** | Verifikasi Skala Matematis Double Bar Chart | F-06 | Data Visualization / Math Scale | **PASSED (Verified)** |
| **SK-45** | Perbedaan Semantik Tagihan (Warning vs Danger) | F-04, F-05 | Semantic UI / Status Badges | **PASSED (Verified)** |
| **SK-46** | Identifikasi Visual Kamar Kosong (Dashed Frame)| F-02 | Visual Affordance / Vacancy UI | **PASSED (Verified)** |
| **SK-47** | Titik Merah Interaktif pada Feed Aktivitas | F-05 | Activity Log / Actionable Dot | **PASSED (Verified)** |
| **SK-48** | Proteksi Anti-Overflow Popover Sisi Kanan | F-01 s.d. F-07 | Layout Guard / Zero Overflow | **PASSED (Verified)** |
| **SK-49** | Ketahanan Tampilan pada Skala DPI 125% & 150% | F-01 s.d. F-07 | High-DPI Scaling / Laptop UX | **PASSED (Verified)** |
| **SK-50** | Proteksi Sticky Topbar & Masking Canopy Overlay| F-01 s.d. F-07 | Viewport Scroll / Glassmorphism | **PASSED (Verified)** |
| **SK-51** | Sanitasi Input & Anti-XSS Pencarian Kamar | F-02 | Security / XSS Prevention | **PASSED (Verified)** |
| **SK-52** | Seleksi Teks Ergonomis vs Navigasi Panah | F-02 | Ergonomics / Clipboard UX | **PASSED (Verified)** |
| **SK-53** | Ketahanan Resize Jendela pada Carousel Offset | F-02 | Dynamic Viewport / Reflow Guard| **PASSED (Verified)** |
| **SK-54** | Supresi Kueri Kosong Pencarian Global Topbar | F-01 | Search Input / Query Hygiene | **PASSED (Verified)** |
| **SK-55** | Kepatuhan Format Cetak (@media print Preview) | F-01 s.d. F-07 | Print Stylesheet / Clean Layout | **PASSED (Verified)** |
| **SK-56** | Sinkronisasi Terminasi Sesi Lintas-Tab Browser | F-01 | Session Security / Multi-Tab | **PASSED (Verified)** |
| **SK-57** | Kepatuhan Mode Kontras Tinggi OS (High Contrast)| F-01 s.d. F-07 | Accessibility / Forced Colors | **PASSED (Verified)** |
| **SK-58** | Navigasi Tombol Panah Keyboard pada Carousel | F-02 | Keyboard Accessibility / Scroll| **PASSED (Verified)** |
| **SK-59** | Kepatuhan Gerak Berkurang (prefers-reduced-motion)| F-01 s.d. F-07 | WCAG 2.1 / Reduced Motion | **PASSED (Verified)** |
| **SK-60** | Ketahanan Pemulihan BFCache Pasca-Navigasi Balik | F-01 s.d. F-07 | Browser Cache / BFCache Guard | **PASSED (Verified)** |
| **SK-61** | Pengalihan Otomatis Akses Staf ke Dasbor Staf | F-01 | RBAC / Authorization Guard | **PASSED (Verified)** |
| **SK-62** | Sinkronisasi Piket & Log Banner Shift Staf | F-01, F-07 | Staff UI / Operational Sync | **PASSED (Verified)** |
| **SK-63** | Tindakan Pembaruan Progres Tiket Lapangan Staf | F-07 | Maintenance / Ticket Workflow | **PASSED (Verified)** |
| **SK-64** | Penjadwalan Teknisi AC dari Antrean Tiket Staf | F-07 | Maintenance / Scheduling | **PASSED (Verified)** |
| **SK-65** | Pengisian Otomatis (Autofill) Tarif Sewa Lapangan | F-04, F-05 | Staff Form / UX Automation | **PASSED (Verified)** |
| **SK-66** | Validasi Form Kosong Catat Pembayaran Lapangan | F-05 | Form Validation / Negative Guard| **PASSED (Verified)** |
| **SK-67** | Pencatatan Sewa Dinamis (Status Pending Owner) | F-05 | Integrity / Zero Self-Approval | **PASSED (Verified)** |
| **SK-68** | Interaktivitas Checklist Tugas Harian & Counter | F-01, F-07 | Operations / Interactive Task | **PASSED (Verified)** |
| **SK-69** | Pemantauan Matriks 15 Kamar Lapangan (3 Lantai) | F-02 | Room Status / Spatial Grid | **PASSED (Verified)** |
| **SK-70** | Integrasi Tautan Kontak WhatsApp Teknisi & Owner | F-01, F-07 | Communication / WhatsApp Action| **PASSED (Verified)** |
| **SK-71** | Navigasi Langsung (Drill-Down) 3 Gauge Staf | F-02, F-05, F-07| Staff Navigation / KPI Gauges | **PASSED (Verified)** |
| **SK-72** | Navigasi Antrean Penuh Tiket Lapangan Staf | F-07 | Maintenance / Header Shortcut | **PASSED (Verified)** |
| **SK-73** | Akses Lembar Detail Tiket Lapangan Kamar A-04 | F-07 | Ticket Dossier / Detail Link | **PASSED (Verified)** |
| **SK-74** | Pengosongan Formulir Pembayaran Lapangan Staf | F-05 | Form Controls / Reset Action | **PASSED (Verified)** |
| **SK-75** | Responsivitas Multi-Perangkat Dasbor Staf | F-01 s.d. F-07 | Responsive Reflow / Mobile Tablet| **PASSED (Verified)** |

---

## 6. Kesimpulan & Rekomendasi QA Lead

1. **Kepatuhan Terhadap Scope Baseline (Scope Guard: 100%)**:
   - Seluruh **75 skenario pengujian** yang diekstraksi dari `WF-02-dashboard.html`, `WF-02-staf-dashboard.html`, dan `assets/js/components.js` terbukti **100% patuh** pada batasan *Frozen Scope Medium (1 Properti Mandiri, 15 Unit Kamar, 7 Kelompok P0)*.
   - Mengakomodasi arsitektur dwi-layar (*dual-screen architecture*): Dasbor Eksekutif Pemilik (`WF-02-dashboard.html` / `SCR-02`) dan Dasbor Operasional Staf (`WF-02-staf-dashboard.html` / `SCR-02-STAF`) dengan penegakan ketat prinsip *Zero Confidential Leak* dan *Zero Self-Approval*.
   - Tidak ditemukan pelanggaran scope P3/Won't (tidak ada multi-properti, tidak ada payment gateway, dan tidak ada registrasi publik).
2. **Kesiapan Menuju Fase Implementasi (M05 / M06)**:
   - File spesifikasi skenario ini siap dijadikan acuan utama (*System Acceptance Criteria*) bagi unit testing frontend, integration testing Cypress/Playwright, dan perancangan API endpoint pada siklus pengembangan berikutnya.
