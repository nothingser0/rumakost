# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-04: Manajemen Data Penghuni, Siklus Kontrak & Buku Kas Sewa (SCR-04)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-04-penghuni.html`  
> **Fitur Terkait**: **F-01** (Akses dan Peran), **F-02** (Manajemen Master Kamar & Okupansi), **F-03** (Penghuni & Siklus Kontrak Sewa), **F-04** (Tagihan Berulang & Tagihan Perdana), **F-05** (Pembayaran & Deposit Escrow), **F-07** (Ticketing Kerusakan Kamar)  
> **User Stories KANBAN**: `RK-001` (Akses Pengguna & Otorisasi), `RK-003` (Data Penghuni & Siklus Kontrak), `RK-020` (Pembatasan Akses Berdasarkan Role), `RK-021` (Pembuatan & Aktivasi Akun Pengguna oleh Pengelola), `RK-024` (Pengelolaan Profil Penghuni Sintetis), `RK-025` (Pembuatan & Pengakhiran Kontrak Sewa), `RK-026` (Validasi Kontrak Tumpang Tindih), `RK-027` (Pembuatan Tagihan Perdana Sewa + Deposit Escrow), `RK-029` (Pencatatan Status Penyampaian Tagihan via WhatsApp Manual), `RK-037` (Keterhubungan Tiket Aduan Kamar)  
> **Hak Akses Layar**: **Pemilik Properti (Owner)** & **Staf Pengelola (Staff)**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-04 (`SCR-04`)** adalah pusat komando operasional tata kelola penghuni dan siklus hidup ikatan sewa (*tenancy lifecycle*) di RumaKost. Mengusung arsitektur antarmuka **Master-Detail Workbench (2-Column Architecture)**, layar ini menggabungkan direktori penelusuran cepat di kolom kiri (*sticky master list* 410px) dengan lembar inspeksi komprehensif di kolom kanan (*responsive detail dossier* minmax(0, 1fr)).

Desain layar ini mengimplementasikan prinsip estetika **Estify Minimalist DNA** dengan tata letak yang bersih, bebas kekacauan (*zero slop*), kontras visual tegas, serta sistem interaksi reaktif yang menyelaraskan data penyewa secara langsung tanpa memicu penyegaran halaman (*zero page reload*).

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              WF-04 MASTER-DETAIL WORKBENCH LAYOUT                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Pill Navigation + Avatar Pengelola (Owner/Staff)         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. CONTROL STRIP & STATS BAR: Segment Tabs (Semua, Perhatian, Lunas) + Floor Filter (Lt 1, 2, 3)       │
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ 3. MASTER TENANT DIRECTORY (Col-Left:    │ 4. FOCUSED TENANT DOSSIER CARD (Col-Right: minmax(0, 1fr))  │
│    Width 410px, Sticky Top 110px)        │    • Header: Foto Profil, Nama, Kamar, Kontak WA/Call       │
│    • Kapsul Cari (Nama, Kamar, Telp)     │    • Critical Alert Strip (Tunggakan, Jatuh Tempo, Expiring) │
│    • Filter Chips (All, Lt 1, 2, 3)      │    • Quick Actions Pod: SP WA, Perpanjang, Pindah Kamar, Usir│
│    • Counter Total Penghuni Terdaftar    │    • Quad Micro-Stats: Sisa Sewa, Tarif, Deposit, Kapasitas │
│    • Daftar Kartu Kompak (11 Tenants):   │    • Sub-Section Pod: Kontak Darurat, Rekan Sekamar, Parkir │
│      - Avatar + Inisial / Foto           ├─────────────────────────────────────────────────────────────┤
│      - Nomor Kamar & Lantai              │ 5. DOSSIER MULTI-TAB EXPANSION PANE                         │
│      - Nama Penyewa & Profesi/Instansi   │    [ Tab 1: SPK Kontrak ] · Detail Legal, NIK Demo, PLN     │
│      - Countdown Masa Sewa (Safe/Warning)│    [ Tab 2: Buku Kas / Ledger ] · Riwayat Pembayaran/Tagihan│
│      - Status Tagihan (Lunas, Tempo, Telat│   [ Tab 3: Tiket Komplain ] · Riwayat Servis Kamar Unit     │
│    • Dynamic Empty State Handling        │    • Contextual Level-1 / Level-2 Modal Action Triggers     │
└──────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### Pilar Arsitektural & Domain Boundaries:

1. **Tata Kelola Siklus Hidup Kontrak Penuh (*Full Tenancy Lifecycle Governance*)**:  
   Modul ini menjadi pengawal status legal sewa di RumaKost, mulai dari tahap reservasi/check-in perdana (`modalTambahPenghuni`), perpanjangan masa tinggal berkala (`modalPerpanjang` - Mode Renew), mutasi pindah kamar internal (`modalPindahKamar`), manajemen teman sekamar dan alih kontrak utama (`modalKelolaPenghuni`), fasilitas cuti/tahan kamar sementara (`modalCutiSewa`), penertiban denda tunggakan sewa (`modalSuratPeringatan`), pembebanan biaya insidental (`modalBiayaInsidental`), hingga penyelesaian sewa / terminasi / pengosongan kamar dengan rekonsiliasi pengembalian deposit jaminan sewa (*escrow deposit settlement*).
2. **Isolasi Akun, Privasi Data Sintetis & Zero Self-Approval (*Role Security Guard*)**:  
   - Tidak ada pendaftaran mandiri publik (*No Public Self-Registration*). Akun penghuni dan kredensial portal dibuatkan secara internal oleh pihak pengelola.
   - Sesuai batas **Frozen Scope Medium**, seluruh data identitas (NIK, Nomor Telepon, Nama Keluarga Darurat) menggunakan **data demo sintetis** tanpa PII nyata. NIK di antarmuka disamarkan (*masked* `320102******0002`).
   - Pemisahan Wewenang: Staf dapat mencatat transaksi operasional, izin tamu, atau memperbarui kendaraan, namun verifikasi pembayaran keuangan mutlak berada di bawah wewenang Pemilik (*Owner Verification Only*).
3. **Keterhubungan Sinkron Lintas Modul (*Cross-Module State Synchronization*)**:  
   - **Sinkronisasi Unit Kamar (`WF-03`)**: Pendaftaran penghuni baru otomatis memotong stok kamar kosong (`vacantRoomsData`) dan mengunci unit di `WF-03` menjadi berstatus `[ Terisi ]`. Pengakhiran sewa (Check-out) otomatis membebaskan kamar kembali ke `[ Kosong / Siap Bersih ]`.
   - **Sinkronisasi Tagihan Perdana (`WF-05`)**: Pendaftaran sewa baru otomatis menerbitkan tagihan invoice perdana yang menggabungkan sewa bulan ke-1 (baik skema Prorata hari berjalan maupun Anniversary penuh) dengan saldo Uang Jaminan Deposit Escrow.
   - **Sinkronisasi Buku Kas (`WF-06`)**: Pembayaran lunas di muka (*Upfront Annual Term*) langsung mencatatkan mutasi kas lunas terverifikasi di buku kas.
   - **Sinkronisasi Layanan Aduan (`WF-08` / `WF-10`)**: Tab tiket pada dossier penghuni terhubung langsung dengan riwayat pelaporan kerusakan unit kamar terkait.

---

## 2. Matriks Entitas Data Baseline (Fixture Testing)

### 2.1 Direktori Penghuni Aktif Awal (11 Entitas Sintetis Baseline)

| ID / Kamar | Lantai | Nama Penyewa Utama | Tipe Kamar | Tarif / Bulan | Uang Deposit | Status Tagihan | Kategori Kontrak | Masa Sewa & Hitung Mundur | Rekan Sekamar / Status Hunian | ID Meteran PLN |
|---|---|---|---|---|---|---|---|---|---|---|
| **A-01** | Lantai 1 | **Siti Aminah** | Standar (3×4m) | Rp 1.200.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 1 Mar 2025 – 28 Feb 2027 (16 Bln Lagi) | Tunggal (1 Orang) · Mandiri | `3210-9876-5432` |
| **A-02** | Lantai 1 | **Dimas Prasetyo** | Standar (3×4m) | Rp 1.200.000 | Rp 1.000.000 | **Jatuh Tempo H-3** | Segera Berakhir | 15 Des 2025 – 15 Nov 2026 (Sisa 23 Hari) | Tunggal (1 Orang) · Mandiri | `3210-9876-5433` |
| **A-04** | Lantai 1 | **Budi Santoso** | Standar AC (3.5×4m) | Rp 1.500.000 | Rp 1.000.000 | **Jatuh Tempo H-3** | Aktif Aman | 1 Jan 2026 – 31 Des 2026 (68 Hari Lagi) | Tunggal (1 Orang) · Mandiri | `3210-9876-5435` |
| **A-05** | Lantai 1 | **Sri Wahyuni** | Standar (3×4m) | Rp 1.100.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 1 Feb 2026 – 31 Jan 2027 (3 Bln Lagi) | 2 Orang (bersama Retno Wulandari) | `3210-9876-5436` |
| **B-01** | Lantai 2 | **Dodi Firmansyah** | Standar (3×4m) | Rp 1.300.000 | Rp 1.000.000 | **Telat Bayar (H+3)** | Aktif Aman | 1 Okt 2025 – 30 Sep 2027 (11 Bln Lagi) | Tunggal (1 Orang) · Menunggak | `3210-9876-5437` |
| **B-02** | Lantai 2 | **Rini Marlina** | Deluxe (3.5×4m) | Rp 1.300.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 15 Agt 2025 – 15 Agt 2027 (10 Bln Lagi) | 2 Orang (bersama Anita Sari) | `3210-9876-5438` |
| **B-04** | Lantai 2 | **Eko Prasetyo** | Deluxe (3.5×4m) | Rp 1.300.000 | Rp 1.000.000 | **Lunas** (Okt) | Penyewa Baru | 1 Okt 2026 – 30 Sep 2027 (11 Bln Lagi) | Tunggal (1 Orang) · Mandiri | `3210-9876-5440` |
| **C-01** | Lantai 3 | **Hendra Wijaya** | VIP Balkon (4×4m) | Rp 1.400.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 1 Jun 2025 – 31 Mei 2027 (7 Bln Lagi) | 3 Orang (bersama Kevin & Farhan) | `3210-9876-5441` |
| **C-03** | Lantai 3 | **Rian Hidayat** | Standar (3×4m) | Rp 1.350.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 10 Nov 2025 – 10 Nov 2026 (Sisa 16 Hari) | Tunggal (1 Orang) · Mandiri | `3210-9876-5443` |
| **C-04** | Lantai 3 | **Mega Lestari** | Standar (3×4m) | Rp 1.350.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 1 Jan 2026 – 31 Des 2026 (68 Hari Lagi) | Tunggal (1 Orang) · Mandiri | `3210-9876-5444` |
| **C-05** | Lantai 3 | **Aditya Pratama** | Standar (3×4m) | Rp 1.350.000 | Rp 1.000.000 | **Lunas** (Okt) | Aktif Aman | 1 Apr 2026 – 31 Mar 2027 (5 Bln Lagi) | Tunggal (1 Orang) · Mandiri | `3210-9876-5445` |

### 2.2 Inventaris Kamar Kosong Tersedia (`vacantRoomsData` Fixture Baseline)

| No. Kamar | Lantai | Tipe Kamar | Dimensi Unit | Tarif Sewa / Bln | Deposit Escrow Wajib | Batas Kapasitas |
|---|---|---|---|---|---|---|
| **A-03** | Lantai 1 | Standar | 3 × 4 Meter | Rp 1.100.000 | Rp 500.000 | Maksimal 1 Orang |
| **B-03** | Lantai 2 | Deluxe | 3.5 × 4 Meter | Rp 1.800.000 | Rp 500.000 | Maksimal 2 Orang |
| **B-05** | Lantai 2 | Deluxe | 3.5 × 4 Meter | Rp 1.800.000 | Rp 500.000 | Maksimal 2 Orang |
| **C-02** | Lantai 3 | VIP Balkon | 4 × 4 Meter | Rp 1.900.000 | Rp 1.000.000 | Maksimal 3 Orang |

---

## 3. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Seleksi Master Directory & Tampilan Profil Dossier (Fitts's Law Flow)
* **Tujuan**: Memverifikasi interaksi seleksi daftar penghuni di kolom kiri dan pembaruan dossier detail di kolom kanan secara instan tanpa reload halaman (*zero context switching*).
* **Kondisi Awal**: Pengguna membuka halaman `WF-04-penghuni.html`. Penghuni pertama (Siti Aminah, Kamar A-01) terpilih secara default.
* **Langkah-langkah**:
  1. Perhatikan kartu tile Siti Aminah pada direktori kiri; kartu memiliki class `.active` dengan border oranye (`#FF7A00`) dan background tint halus.
  2. Klik kartu tile penghuni **"Dimas Prasetyo"** (Kamar A-02).
* **Hasil Diharapkan**:
  - Class `.active` berpindah dari kartu A-01 ke kartu A-02 secara instan.
  - Dossier kanan (`#detailDossierCard`) me-reset posisi scroll ke paling atas (`scrollTop = 0`).
  - Elemen header dossier kanan diperbarui secara sinkron:
    - Foto avatar (`#dAvatarImg`) menampilkan foto Dimas Prasetyo.
    - Judul nama (`#dNameTitle`) menampilkan *"Dimas Prasetyo"*.
    - Subtitle pekerjaan (`#dRoleSub`) menampilkan *"Karyawan Swasta · Bank Mandiri"*.
    - Thumbnail kamar (`#dRoomThumb`) dan label (`#dRoomName`) menampilkan *"Kamar A-02"* (`Lantai 1 · Tipe Standar (3×4m)`).
    - Tautan WhatsApp (`#dBtnWa`) mengarah ke `https://wa.me/6281388776655`.
    - Tautan Panggil (`#dBtnCall`) mengarah ke `tel:0813-8877-6655`.
  - Alert banner strip (`#dAlertStrip`) beralih ke tema warning amber (`.is-warning`) dengan ikon jam (`clock`):  
    *"Perhatian Operasional: Tagihan sewa bulan berjalan jatuh tempo H-3. Mohon pastikan konfirmasi transfer."*
  - Quad micro-stats menampilkan: Sisa Sewa: *"Sisa 23 Hari"*, Tarif: *"Rp 1.200.000 / bln"*, Deposit: *"Rp 1.000.000"*, Rekan: *"1 Orang (Mandiri)"*.

---

### SKENARIO 02: Penyaringan Segmen Operasional & Kluster Lantai (Segment & Floor Filters)
* **Tujuan**: Memastikan pengguna dapat memfilter daftar penghuni berdasarkan status operasional (Perlu Perhatian, Lunas) dan pembagian lantai fisik (Lantai 1, 2, 3).
* **Kondisi Awal**: Tab segmen aktif pada *"Semua Penghuni"* (`all`) dan filter lantai pada *"Semua Lantai"* (`all`). Total terdaftar: 11 penghuni.
* **Langkah-langkah**:
  1. Klik tab segmen **"Perlu Perhatian"** (`switchTab('attention')`).
* **Hasil Diharapkan**:
  - Tab "Perlu Perhatian" aktif dengan styling gelap solid.
  - Sistem menyaring data yang memenuhi kondisi: `billStatus !== 'lunas'` ATAU `contractCategory !== 'aman'`.
  - Kartu penghuni yang tampil di direktori berkurang menjadi 3 orang:
    - Dimas Prasetyo (A-02, Jatuh Tempo H-3 & Kontrak Segera Berakhir)
    - Budi Santoso (A-04, Jatuh Tempo H-3)
    - Dodi Firmansyah (B-01, Telat Bayar H+3)
    - Rian Hidayat (C-03, Kontrak Segera Berakhir H-16)
  - Badge counter pada header direktori (`#masterCountDisplay`) memperbarui jumlah secara instan.
  2. Klik tombol filter lantai **"Lantai 2"** (`switchFloor('2', this)`).
  - Daftar menyaring lebih lanjut menjadi penghuni di Lantai 2 saja: hanya **Dodi Firmansyah (B-01)** yang tampil.
  3. Klik tab segmen **"Lunas (Okt)"** (`switchTab('lunas')`).
  - Dodi Firmansyah disembunyikan; daftar menampilkan penghuni Lantai 2 yang lunas: **Rini Marlina (B-02)** dan **Eko Prasetyo (B-04)**.
  4. Klik kembali filter lantai **"Semua"** dan tab **"Semua Penghuni"**.
  - Seluruh 11 penghuni kembali tampil di direktori.

---

### SKENARIO 03: Pencarian Reaktif Multi-Atribut (Live Search & Clear Filter)
* **Tujuan**: Menguji responsivitas pencarian teks reaktif yang mencakup tiga atribut sekaligus (Nama Penghuni, Nomor Kamar, Nomor WhatsApp/Telepon) serta tombol pembersih pencarian.
* **Kondisi Awal**: Berada di halaman utama `WF-04-penghuni.html`.
* **Langkah-langkah**:
  1. Ketik *"B-01"* pada kotak pencarian (`#masterSearchInput`).
* **Hasil Diharapkan**:
  - Tombol silang pembersih (`#masterSearchClearBtn`) otomatis muncul (`display: flex`).
  - Direktori master langsung menyaring dan hanya menampilkan kartu **Dodi Firmansyah (Kamar B-01)**.
  - Counter badge menunjukkan angka `1`.
  2. Hapus input dan ketikkan nama sebagian: *"lestari"*.
  - Direktori langsung menampilkan kartu **Mega Lestari (Kamar C-04)**.
  3. Hapus input dan ketikkan fragmen nomor kontak: *"8877"*.
  - Direktori menampilkan kartu **Dimas Prasetyo** (`0813-8877-6655`).
  4. Klik tombol silang **(X)** pada kotak pencarian (`clearSearch()`).
  - Input teks terhapus bersih, tombol silang menghilang, dan direktori menampilkan kembali seluruh penghuni.

---

### SKENARIO 04: Navigasi Tab Tri-Panel Dossier (Kontrak, Buku Kas & Tiket Servis)
* **Tujuan**: Menguji peralihan antara tiga panel dossier (Detail Kontrak SPK, Buku Kas Transaksi/Ledger, dan Tiket Komplain) dengan mekanisme auto-scroll vertikal yang mulus.
* **Kondisi Awal**: Penghuni Siti Aminah (A-01) terpilih. Tab default dossier berada pada **"Detail Kontrak"** (`#paneTabContract`).
* **Langkah-langkah**:
  1. Klik tab **"Buku Kas & Tagihan"** (`#btnTabLedger`).
* **Hasil Diharapkan**:
  - Tab tombol `#btnTabLedger` memperoleh class `.active`.
  - Panel `#paneTabLedger` tampil (`display: block`), panel lain disembunyikan.
  - Jendela browser melakukan *smooth scroll* vertikal ke baris tab (offset `-76px` di bawah navbar mengambang).
  - Tabel transaksi memuat riwayat pembayaran sewa:
    - Periode: *Oktober 2026*, Nominal: *Rp 1.200.000*, Tanggal: *01 Okt 2026*, Metode: *BCA Transfer*, Status: Badge Hijau *Lunas*.
    - Tersedia tombol aksi mini: *"Kuitansi PDF"* (`RumaUI.showToast`).
  2. Klik tab **"Tiket & Komplain"** (`#btnTabTickets`).
  - Panel `#paneTabTickets` aktif.
  - Ditampilkan kartu tiket aduan perbaikan kamar A-01:
    - `TK-029`: *Pembersihan Filter AC Berkala* (Status: Selesai, Teknisi: Pak Joko).
    - `TK-014`: *Penggantian Bohlam Balkon Luar* (Status: Selesai).
    - `TK-005`: *Pengecekan Tekanan Air Shower* (Status: Selesai).
  3. Klik kembali tab **"Detail Kontrak"** (`#btnTabContract`).
  - Panel kontrak memuat informasi legal SPK: Nomor Kontrak (`SPK-2025/RUMA/A-01`), NIK tersensor (`320102******0002`), Kota Asal, Token PLN, Kontak Darurat, dan tombol *"Unduh SPK PDF"*.

---

### SKENARIO 05: Pendaftaran Penghuni Baru Skema Standar Prorata & Penerbitan Invoice Perdana
* **Tujuan**: Memvalidasi alur lengkap pendaftaran penghuni baru (Check-in), pemilihan kamar kosong, durasi sewa, skema penagihan prorata hari berjalan, dan penggabungan tagihan sewa perdana dengan uang deposit jaminan escrow.
* **Kondisi Awal**: Kamar A-03 tersedia di daftar kamar kosong (`vacantRoomsData`). Pengguna membuka modal pendaftaran penghuni baru (`#modalTambahPenghuni`).
* **Langkah-langkah**:
  1. Klik tombol **"+ Daftarkan Penghuni Baru"** di sudut kanan header direktori master.
  2. Modal `#modalTambahPenghuni` terbuka.
  3. Buka dropdown kamar (`openRoomDropdown()`), lalu pilih **"Kamar A-03 (Lantai 1 · Standar)"**.
     - Sistem otomatis mengisi tarif bulanan: `Rp 1.100.000` dan deposit jaminan: `Rp 500.000`.
  4. Pilih durasi kontrak: klik pill **"6 Bulan"** (`selectModalDuration(this, '6')`).
  5. Pilih skema pembayaran: klik tombol **"Bulanan (Monthly)"** (`setRegPayTerm('monthly')`).
  6. Pilih tanggal mulai sewa: atur tanggal masuk ke pertengahan bulan, misal: `2026-11-16`.
  7. Pilih skema penagihan awal: klik pill **"Prorata Hari Berjalan"** (`setRegBillingMode('prorata')`).
* **Hasil Diharapkan**:
  - Sistem mengkalkulasi tarif prorata secara otomatis:
    - Jumlah hari tersisa di bulan November (15 hari dari 30 hari) = $\frac{15}{30} \times \text{Rp } 1.100.000 = \text{Rp } 550.000$.
    - Uang Jaminan Deposit Escrow = `Rp 500.000`.
    - **Total Tagihan Pertama = Rp 1.050.000** (Sewa Prorata + Deposit).
    - Tanggal jatuh tempo berikutnya: *1 Desember 2026*.
  8. Lengkapi formulir identitas:
     - Nama Lengkap: *"Ahmad Fauzi"*
     - No. WhatsApp: *"0812-7788-9900"*
     - NIK (Sintetis): *"3201021405980005"*
     - Pekerjaan: *"UI/UX Designer"* · Kantor: *"PT Solusi Digital"*
     - Kota Asal: *"Yogyakarta"*
     - Kontak Darurat: *"Bpk. Subagyo (Paman) · 0811-9988-1122"*
  9. Pastikan checkbox *"Kirim kredensial akses portal & rincian sewa via WhatsApp"* dicentang.
  10. Klik tombol simpan **"Daftarkan Penghuni Sekarang"** (`saveTambahPenghuni()`).
* **Hasil Diharapkan**:
  - Modal `#modalTambahPenghuni` tertutup.
  - Kamar A-03 dikeluarkan dari `vacantRoomsData` (stok berkurang 1).
  - Objek penyewa baru di-*unshift* ke dalam array `tenantsData` pada posisi teratas.
  - Direktori master me-render ulang list; kartu Ahmad Fauzi (Kamar A-03) muncul paling atas dengan badge *"Tagihan Baru / Belum Bayar"*.
  - Dossier kanan otomatis memilih Ahmad Fauzi (`selectTenant('A-03')`).
  - Muncul Toast Success:  
    `Penghuni Ahmad Fauzi di Kamar A-03 berhasil didaftarkan! Tagihan awal prorata Rp 1.050.000 (Sewa + Deposit) otomatis terbit di menu Tagihan dengan status 'Belum Bayar'. Kredensial portal & tanda terima invoice dikirimkan via WhatsApp.`

---

### SKENARIO 06: Pendaftaran Penghuni Baru Skema Bayar Lunas di Muka (Upfront 1 Tahun) & Diskon Sewa
* **Tujuan**: Memverifikasi alur pendaftaran sewa tahunan dengan pembayaran penuh di muka (*Upfront Annual Term*), penerapan insentif diskon 1 bulan gratis, dan pencatatan status otomatis lunas.
* **Kondisi Awal**: Modal pendaftaran penghuni baru terbuka.
* **Langkah-langkah**:
  1. Pilih kamar kosong: **"Kamar B-03 (Lantai 2 · Deluxe)"** (Tarif: `Rp 1.800.000/bln`, Deposit: `Rp 500.000`).
  2. Pilih durasi sewa: klik pill **"12 Bulan (1 Tahun)"**.
  3. Pilih skema pembayaran: klik tombol **"Bayar Penuh di Muka (Upfront)"** (`setRegPayTerm('upfront')`).
  4. Seksi insentif diskon tahunan terbuka (`#regAnnualDiscountSection`).
  5. Klik pill insentif: **"1 Bulan Gratis (Bayar 11 Bln)"** (`setRegAnnualDiscount('free1')`).
* **Hasil Diharapkan**:
  - Sistem mengkalkulasi formula sewa tahunan:
    - Tarif kotor (12 bulan): $12 \times \text{Rp } 1.800.000 = \text{Rp } 21.600.000$.
    - Diskon 1 bulan: $-\text{Rp } 1.800.000$.
    - Sewa bersih (11 bulan): $\text{Rp } 19.800.000$.
    - Deposit Escrow: $\text{Rp } 500.000$.
    - **Total Tagihan Perdana = Rp 20.300.000**.
  6. Masukkan nama: *"Farhan Ramadhan"* dan data diri sintetis.
  7. Klik tombol **"Daftarkan Penghuni Sekarang"**.
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Data Farhan Ramadhan tercatat dengan `billStatus: 'lunas'`, `contractBadge: 'Lunas di Muka'`, dan `progressPct: 100%`.
  - Riwayat pembayaran di tab Ledger langsung mencatat transaksi:  
    *Sewa Upfront (1 Tahun s/d 31 Okt 2027) + Escrow Deposit* senilai *Rp 20.300.000* dengan metode *BCA Transfer (Lunas Penuh)* berstatus **Lunas**.
  - Toast Success:  
    `Penghuni Farhan Ramadhan di Kamar B-03 berhasil didaftarkan! Tagihan sewa 1 Tahun Lunas di Muka sebesar Rp 20.300.000 otomatis tercatat LUNAS.`

---

### SKENARIO 07: Pendaftaran Multi-Penghuni (Roommate Capacity) & Penambahan Biaya Sewa Surcharge
* **Tujuan**: Menguji formulir pendaftaran ketika kamar dihuni lebih dari 1 orang (teman sekamar/pasangan), pembukaan field input rekan tambahan secara dinamis, dan pencatatan nama ganda pada kontrak.
* **Kondisi Awal**: Modal pendaftaran penghuni baru terbuka. Kamar terpilih berkapasitas 2 orang (Kamar B-05).
* **Langkah-langkah**:
  1. Pada pilihan kapasitas hunian, klik tombol **"2 Orang"** (`selectOccupancy(this, '2')`).
* **Hasil Diharapkan**:
  - Seksi input rekan tambahan (`#secExtraOccupants`) terbuka secara dinamis.
  - Muncul field input baru: *"Nama Lengkap Rekan Tambahan #2"*, *"No. WhatsApp Rekan #2"*, dan field KTP rekan.
  2. Isi nama penyewa utama: *"Danang Wicaksono"*.
  3. Isi nama rekan sekamar #2: *"Reza Fahlevi"*.
  4. Selesaikan pendaftaran dan klik simpan.
* **Hasil Diharapkan**:
  - Entitas tersimpan dengan nama gabungan: *"Danang Wicaksono & Reza Fahlevi"*.
  - Tab kontrak dan sub-section penghuni menampilkan kapasitas: *"2 Penghuni Aktif"*.
  - Sub-section Rekan Sekamar pada dossier memuat daftar dua profil penghuni lengkap dengan status penanggung jawab utama (PIC) vs teman sekamar.

---

### SKENARIO 08: Unggah Berkas Identitas KTP Demo Sintetis & Pratinjau Dokumen Dropzone
* **Tujuan**: Memastikan area dropzone unggah dokumen identitas berfungsi dengan pratinjau thumbnail instan dan pencegahan file tidak valid.
* **Kondisi Awal**: Modal pendaftaran penghuni baru terbuka.
* **Langkah-langkah**:
  1. Klik area dropzone unggah identitas (`#uploadKtpInput`).
  2. Pilih file gambar demo: `ktp-sintetis-ahmad.jpg`.
* **Hasil Diharapkan**:
  - Event `handleKtpUpload(event)` dieksekusi.
  - Dropzone menyembunyikan ikon upload standar dan menampilkan pratinjau instan foto KTP (`URL.createObjectURL`).
  - Label status teks (`#ktpFileNameDisplay`) menampilkan nama berkas:  
    `ktp-sintetis-ahmad.jpg (Tersedia untuk disimpan)`.
  - Muncul Toast Info: *"Dokumen KTP berhasil dipilih: ktp-sintetis-ahmad.jpg"*.

---

### SKENARIO 09: Validasi Input Wajib & Proteksi Form Pendaftaran Penghuni Baru
* **Tujuan**: Mencegah pendaftaran data penghuni kosong atau tidak lengkap demi integritas database.
* **Kondisi Awal**: Modal pendaftaran penghuni baru terbuka dalam keadaan kosong.
* **Langkah-langkah**:
  1. Kosongkan field Nama Lengkap (`#regNama`).
  2. Klik langsung tombol **"Daftarkan Penghuni Sekarang"**.
* **Hasil Diharapkan**:
  - Sistem menolak penyimpanan data (`saveTambahPenghuni()` batal).
  - Modal tetap terbuka.
  - Muncul Toast Warning tegas:  
    `Silakan isi Nama Lengkap Penghuni sesuai KTP`.
  - Fokus kursor diarahkan ke field nama yang kosong.

---

### SKENARIO 10: Perpanjangan Kontrak Sewa (Renewal) & Pembaruan Masa Berlaku SPK
* **Tujuan**: Menguji alur perpanjangan kontrak sewa aktif penghuni yang mendekati akhir masa tinggal (*contract expiration*).
* **Kondisi Awal**: Dimas Prasetyo (A-02, sisa kontrak 23 hari) terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol **"Perpanjang Sewa"** di Quick Actions dossier (`openPerpanjangModal('renew')`).
  2. Modal `#modalPerpanjang` terbuka dalam mode Renew.
  3. Header modal menampilkan ikon kalender oranye dan judul: *"Perpanjangan Kontrak Kamar A-02"*.
  4. Pilih durasi perpanjangan: klik tombol **"12 Bulan"** (`selectRenewDuration(this, '12')`).
* **Hasil Diharapkan**:
  - Sistem menghitung tanggal akhir baru: dari tanggal akhir lama (15 Nov 2026) diperpanjang 12 bulan menjadi **15 November 2027**.
  - Total nominal perpanjangan dihitung otomatis: $12 \times \text{Rp } 1.200.000 = \text{Rp } 14.400.000$.
  5. Klik tombol **"Simpan Perpanjangan Kontrak"** (`savePerpanjang()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Masa kontrak Dimas Prasetyo diperbarui hingga 15 November 2027.
  - Alert strip kuning berganti menjadi hijau (*Aktif Aman*).
  - Toast Success:  
    `Kontrak Kamar A-02 (Dimas Prasetyo) berhasil diperpanjang 12 Bulan! Tagihan periode baru dijadwalkan otomatis.`

---

### SKENARIO 11: Pengakhiran Sewa (Check-out) & Rekonsiliasi Penuh Deposit Escrow (100% Refund)
* **Tujuan**: Memverifikasi proses check-out resmi tanpa kerusakan inventaris, di mana seluruh uang deposit jaminan dikembalikan utuh (*Full Refund*).
* **Kondisi Awal**: Dimas Prasetyo (A-02, Deposit: Rp 1.000.000) terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol **"Akhiri Sewa / Usir"** pada header dossier (`openPerpanjangModal('checkout')`).
  2. Modal terbuka dan otomatis beralih ke tab **"Check-out / Pengakhiran Sewa"** (`setPerpanjangMode('checkout')`).
  3. Pilih opsi pengembalian deposit: klik **"Kembalikan Penuh (100% Utuh)"** (`setReconcileOption('full')`).
* **Hasil Diharapkan**:
  - Baris input potongan kerusakan disembunyikan.
  - Panel ringkasan menampilkan: Nilai Deposit Awal: `Rp 1.000.000`, Potongan Kerusakan: `Rp 0`, **Sisa Bersih Dikembalikan: Rp 1.000.000**.
  4. Klik tombol **"Konfirmasi Pengakhiran Sewa"** (`savePerpanjang()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Kamar A-02 dialihkan ke status `[ Kosong / Siap Bersih ]` dan dimasukkan kembali ke inventaris kamar kosong.
  - Toast Success:  
    `Pengakhiran sewa Kamar A-02 (Dimas Prasetyo) berhasil diproses! Unit dialihkan ke 'Kosong / Siap Bersih'. Refund deposit Rp 1.000.000 diteruskan ke antrean pencairan.`

---

### SKENARIO 12: Pengakhiran Sewa (Check-out) dengan Pemotongan Deposit Escrow (Deduct Kerusakan)
* **Tujuan**: Memverifikasi pemotongan saldo deposit sewa untuk menutupi biaya perbaikan kerusakan unit atau tunggakan listrik/kunci.
* **Kondisi Awal**: Modal pengakhiran sewa terbuka untuk penyewa dengan deposit Rp 1.000.000.
* **Langkah-langkah**:
  1. Pada tab Check-out, pilih opsi: **"Potong Biaya Perbaikan / Tunggakan"** (`setReconcileOption('deduct')`).
* **Hasil Diharapkan**:
  - Baris input nominal pemotongan (`#checkoutDeductInputRow`) terbuka.
  2. Masukkan nominal pemotongan: `350000` (terformat otomatis menjadi `Rp 350.000`).
  3. Isi catatan klaim kerusakan: *"Penggantian cover stopkontak pecah & pengecatan ulang dinding kamar mandi"*.
* **Hasil Diharapkan**:
  - Sistem menghitung sisa pengembalian bersih secara real-time:  
    $\text{Net Refund} = \text{Rp } 1.000.000 - \text{Rp } 350.000 = \text{\bf Rp 650.000}$.
  4. Klik tombol **"Konfirmasi Pengakhiran Sewa"**.
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Toast Success memaparkan rincian pengembalian bersih:  
    `Pengakhiran sewa Kamar A-02 berhasil diproses! Unit dialihkan ke 'Kosong / Siap Bersih'. Refund deposit Rp 650.000 diteruskan ke antrean pencairan.`

---

### SKENARIO 13: Relokasi / Mutasi Kamar Internal (Room Transfer & Prorata Selisih Tarif)
* **Tujuan**: Menguji proses pemindahan kamar penghuni yang sedang aktif ke kamar lain yang kosong beserta penyesuaian selisih harga sewa dan pengalihan deposit.
* **Kondisi Awal**: Siti Aminah (Kamar A-01, Tarif Rp 1.200.000) ingin pindah ke Kamar B-02 (Deluxe, Tarif Rp 1.500.000).
* **Langkah-langkah**:
  1. Klik tombol **"Pindah Kamar"** di Quick Actions dossier (`openPindahKamarModal()`).
  2. Modal `#modalPindahKamar` terbuka.
  3. Buka dropdown kamar tujuan (`openMoveRoomDropdown()`), lalu pilih **"Kamar B-02 (Lantai 2 · Deluxe)"**.
* **Hasil Diharapkan**:
  - Sistem menampilkan kalkulator perbandingan kamar:
    - Kamar Saat Ini: *Kamar A-01 (Rp 1.200.000 / bln)*.
    - Kamar Baru: *Kamar B-02 (Rp 1.500.000 / bln)*.
    - **Selisih Tarif: +Rp 300.000 / bln (Upgrade)**.
    - Saldo Deposit: Dialihkan 100% tanpa potongan.
  4. Atur tanggal efektif pindah kamar: `2026-11-01`.
  5. Klik tombol **"Konfirmasi Pindah Kamar"** (`savePindahKamar()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Kamar lama (A-01) dikembalikan ke status `[ Kosong / Siap Bersih ]` dan dimasukkan ke `vacantRoomsData`.
  - Kamar baru (B-02) dihapus dari `vacantRoomsData`.
  - Data Siti Aminah diperbarui: kamar berubah menjadi `B-02`, lantai berubah menjadi `2`, tarif baru menjadi `Rp 1.500.000`, dan nomor SPK ditambahkan akhiran `/ADD-MUTASI`.
  - Invoice selisih sewa `Rp 300.000` otomatis dicatatkan pada buku kas dengan status *Belum Bayar*.
  - Toast Success:  
    `Mutasi berhasil! Siti Aminah resmi pindah ke Kamar B-02. Kamar A-01 dialihkan ke status 'Kosong / Siap Bersih'. Saldo deposit 100% dialihkan.`

---

### SKENARIO 14: Manajemen Rekan Sekamar — Penambahan Teman Baru & Pembaruan Kapasitas
* **Tujuan**: Memverifikasi penambahan teman sekamar baru pada kamar yang sedang dihuni, penambahan biaya surcharge sewa bulanan, dan penerbitan akun portal.
* **Kondisi Awal**: Kamar A-05 (Sri Wahyuni, saat ini dihuni 2 orang). Pengguna membuka modal kelola rekan (`openKelolaPenghuniModal()`).
* **Langkah-langkah**:
  1. Klik tombol **"Kelola Rekan (2 Org)"** di dossier.
  2. Modal `#modalKelolaPenghuni` terbuka menampilkan daftar penghuni aktif saat ini.
  3. Klik tombol **"+ Tambah Rekan Sekamar Baru"** (`showAddOccupantForm()`).
  4. Form penambahan rekan terbuka (`#sectionTambahRekan`).
  5. Masukkan Nama Rekan: *"Dewi Sartika"*.
  6. Masukkan No. HP/WA: *"0813-2211-4433"*.
  7. Masukkan Surcharge Tambahan: `250000` (Biaya tambahan orang ke-3).
  8. Klik tombol **"Simpan & Daftarkan Rekan"** (`confirmAddOccupant()`).
* **Hasil Diharapkan**:
  - Objek rekan baru ditambahkan ke array `occupants`.
  - Tarif sewa kamar A-05 otomatis bertambah dari `Rp 1.100.000` menjadi `Rp 1.350.000/bln`.
  - Badge kapasitas kamar diperbarui menjadi *"3 Penghuni Aktif"*.
  - Toast Success:  
    `Rekan baru Dewi Sartika berhasil ditambahkan ke Kamar A-05! Akun portal WF-10 terkirim via WA ke 0813-2211-4433.`

---

### SKENARIO 15: Manajemen Rekan Sekamar — Pengeluaran Teman Sekamar & Opsi Pemotongan Tarif
* **Tujuan**: Memverifikasi alur pengeluaran salah satu teman sekamar (check-out rekan), pencabutan hak akses portal, dan penyesuaian tarif bulanan kamar.
* **Kondisi Awal**: Modal kelola penghuni terbuka untuk kamar dengan multi-occupants.
* **Langkah-langkah**:
  1. Pada baris rekan sekamar yang ingin dikeluarkan (misal: Anita Sari), klik tombol ikon tempat sampah merah (`initRemoveOccupant('Anita Sari')`).
  2. Panel konfirmasi keluarkan rekan terbuka (`#sectionKeluarkanRekan`).
  3. Label konfirmasi memaparkan: *"Keluarkan Anita Sari dari Kamar B-02?"*.
  4. Pilih opsi penyesuaian tarif sewa: pilih opsi **"Potong Biaya Tambahan (-Rp 250.000/bln)"**.
  5. Klik tombol merah **"Konfirmasi Keluarkan Rekan"** (`confirmRemoveOccupant()`).
* **Hasil Diharapkan**:
  - Anita Sari dihapus dari daftar `occupants`.
  - Tarif sewa bulanan disesuaikan berkurang `Rp 250.000`.
  - Dicatatkan riwayat addendum pada buku kas: *Addendum Rekan Keluar (Anita Sari)*.
  - Toast Success:  
    `Rekan sekamar Anita Sari berhasil dikeluarkan dari Kamar B-02! Akses portal dinonaktifkan. Kapasitas kamar kini 1 Orang. Tarif sewa bulanan disesuaikan.`

---

### SKENARIO 16: Alih Kontrak / Balik Nama Penanggung Jawab Sewa Utama (PIC Transfer & Addendum SPK)
* **Tujuan**: Menguji proses alih kontrak resmi ketika penyewa utama (PIC) menyerahkan tanggung jawab sewa kepada rekan sekamar yang tinggal bersama.
* **Kondisi Awal**: Kamar C-01 (Hendra Wijaya sebagai PIC Utama, bersama rekan Kevin & Farhan). Modal kelola penghuni terbuka.
* **Langkah-langkah**:
  1. Pada baris rekan Kevin, klik tombol ikon pertukaran kartu **"Balik Nama PIC"** (`initTransferOccupant('Kevin')`).
  2. Panel alih kontrak terbuka (`#sectionBalikNama`).
  3. Label menegaskan: *"Alihkan SPK Utama & Saldo Deposit ke Kevin"*.
  4. Atur tanggal efektif peralihan: `2026-11-01`.
  5. Klik tombol **"Konfirmasi Balik Nama SPK"** (`confirmTransferOccupant()`).
* **Hasil Diharapkan**:
  - Status primary (`isPrimary: true`) beralih ke Kevin; Hendra Wijaya diturunkan statusnya menjadi Teman Sekamar biasa (`isPrimary: false`).
  - Nama utama entitas penyewa di direktori master berganti menjadi **Kevin**.
  - Nomor telepon utama disinkronkan dengan kontak Kevin.
  - Saldo deposit escrow (`Rp 1.000.000`) dialihkan sepenuhnya ke penanggung jawab baru tanpa pengembalian dana tunai.
  - Buku kas mencatat entri audit: *Addendum Alih Kontrak (Hendra Wijaya → Kevin)* senilai `Rp 0`.
  - Toast Success:  
    `Alih kontrak Kamar C-01 ke Kevin berhasil! Saldo deposit jaminan (Rp 1.000.000) dialihkan dan addendum SPK resmi diterbitkan.`

---

### SKENARIO 17: Penerbitan Surat Peringatan (SP 1, SP 2, SP 3) & Denda Tunggakan via WhatsApp
* **Tujuan**: Memverifikasi alur penerbitan surat peringatan tunggakan sewa, perhitungan denda keterlambatan harian, dan pembukaan draf pesan WhatsApp resmi tanpa bot berbayar.
* **Kondisi Awal**: Penghuni Dodi Firmansyah (B-01, Telat Bayar H+3) terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol **"Kirim SP WA"** pada alert strip merah di dossier (`openSuratPeringatanModal()`).
  2. Modal `#modalSuratPeringatan` terbuka.
  3. Header menampilkan data penunggak: *Dodi Firmansyah (Kamar B-01 · Rp 1.300.000)*.
  4. Klik tab level peringatan: pilih **"SP 1 (Teguran H+3)"** (`setSpLevel('sp1')`).
* **Hasil Diharapkan**:
  - Denda keterlambatan dikalkulasi otomatis: 3 hari $\times$ Rp 10.000/hari = `Rp 30.000`.
  - Total kewajiban terhitung: $\text{Rp } 1.300.000 + \text{Rp } 30.000 = \text{\bf Rp 1.330.000}$.
  - Textarea pratinjau memuat draf surat peringatan formal lengkap dengan nomor rekening bank pengelola dan batas waktu pembayaran.
  5. Klik tombol hijau **"Kirim Pesan Peringatan via WhatsApp"** (`sendSpWhatsApp()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Browser membuka tab baru menuju URL: `https://wa.me/6281234567890?text=...` dengan teks surat peringatan ter-encode rapi.
  - Toast Success:  
    `Notifikasi SP1 berhasil disiapkan dan diteruskan via WhatsApp ke Dodi Firmansyah!`

---

### SKENARIO 18: Pencatatan Izin Tamu Menginap Sementara (Guest Stay Permit & Overstay Fee)
* **Tujuan**: Memvalidasi kepatuhan tata tertib kost terkait pencatatan izin tamu menginap, kalkulasi jumlah malam, dan penagihan biaya tambahan overstay.
* **Kondisi Awal**: Penghuni Siti Aminah (A-01) terpilih. Modal izin tamu dibuka (`openIzinTamuModal()`).
* **Langkah-langkah**:
  1. Klik tombol **"+ Izin Tamu"** di dossier.
  2. Modal `#modalIzinTamu` terbuka.
  3. Masukkan Nama Tamu: *"Rina Anggraini"*.
  4. Pilih Hubungan Tamu: buka custom popover, pilih opsi **"Saudara Kandung (Kakak / Adik)"**.
  5. Atur rentang tanggal menginap: dari `2026-10-26` hingga `2026-10-29` (3 malam).
* **Hasil Diharapkan**:
  - Sistem menghitung durasi: `3 Malam`.
  - Tarif inap standar dihitung: $3 \times \text{Rp } 50.000 = \text{Rp } 150.000$.
  6. Pilih opsi penagihan: pilih **"Bebankan ke Tagihan Sewa Bulan Depan"** (`setGuestBillingOpt('paid')`).
  7. Klik tombol **"Terbitkan Izin Menginap"** (`confirmIzinTamu()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Log tamu tercatat di sistem keamanan.
  - Biaya tamu `Rp 150.000` dijadwalkan masuk ke invoice tagihan periode mendatang.
  - Toast Success:  
    `Izin menginap Rina Anggraini (Saudara Kandung · 3 Malam) untuk Kamar A-01 berhasil diterbitkan! Tercatat di log sekuriti dan biaya (Rp 150.000) masuk invoice berjalan.`

---

### SKENARIO 19: Fasilitas Cuti Sewa / Tahan Kamar (Hold Room) dengan Skema Diskon Retensi
* **Tujuan**: Menguji fitur cuti sewa bagi penghuni yang bepergian sementara (libur semester/tugas dinas) agar kamar tidak dialihkan ke orang lain dengan kompensasi diskon tarif retensi.
* **Kondisi Awal**: Penghuni Budi Santoso (A-04, Tarif Rp 1.500.000) terpilih.
* **Langkah-langkah**:
  1. Klik tombol **"Cuti Sewa (Tahan Kamar)"** di dossier (`openCutiSewaModal()`).
  2. Modal `#modalCutiSewa` terbuka.
  3. Atur rentang cuti: `2026-11-01` s/d `2026-11-30` (1 bulan).
  4. Pilih skema diskon retensi: klik pill **"Diskon 50% (Bayar Separuh)"** (`setCutiDiscount(50)`).
* **Hasil Diharapkan**:
  - Sistem mengkalkulasi tarif penyesuaian cuti:  
    $\text{Tarif Cuti} = 50\% \times \text{Rp } 1.500.000 = \text{\bf Rp 750.000 / bln}$.
    - Penghematan penghuni: `Rp 750.000`.
  5. Klik tombol **"Terbitkan Persetujuan Cuti Sewa"** (`confirmCutiSewa()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Entri penyesuaian dicatat di ledger: *Tahan Kamar (Diskon Cuti 50%)* sebesar *Rp 750.000*.
  - Akses pintu RFID dinonaktifkan sementara selama masa cuti.
  - Toast Success:  
    `Persetujuan cuti sewa Kamar A-04 berhasil diterbitkan! Tarif sewa cuti Rp 750.000 / bln. Kartu RFID dinonaktifkan sementara.`

---

### SKENARIO 20: Registrasi Kendaraan & Penerbitan Nomor Stiker Parkir / Hak Akses RFID
* **Tujuan**: Memastikan alokasi slot parkir properti terkontrol dengan mencatat tipe kendaraan, plat nomor, dan stiker resmi.
* **Kondisi Awal**: Modal kelola kendaraan dibuka (`openKelolaKendaraanModal()`).
* **Langkah-langkah**:
  1. Klik ikon pensil/edit pada baris Kendaraan di sub-section dossier.
  2. Modal `#modalKelolaKendaraan` terbuka.
  3. Pilih tipe kendaraan: klik **"Mobil"** (`setVehicleType('mobil')`).
  4. Masukkan Merek/Model: *"Honda Brio RS Hitam"*.
  5. Masukkan Nomor Plat Polisi: ketik *"b 1234 rmk"* (otomatis terkapitalisasi menjadi `B 1234 RMK`).
  6. Masukkan Nomor Stiker Parkir Resmi: *"STK-RMK-042"*.
  7. Centang opsi *"Aktifkan Hak Akses Palang RFID"*.
  8. Klik tombol **"Simpan Data Kendaraan"** (`confirmSaveVehicle()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Tampilan kendaraan pada dossier diperbarui menjadi:  
    `1 Mobil (B 1234 RMK) · Stiker STK-RMK-042`.
  - Data tersimpan di atribut `t.vehicle`.
  - Toast Success: *"Data kendaraan & stiker parkir berhasil diperbarui!"*.

---

### SKENARIO 21: Pencatatan Biaya Insidental (Denda Kerusakan Inventaris) via Preset
* **Tujuan**: Menguji pembebanan denda insidental (misal: kunci kamar hilang, remote AC rusak) dengan tombol preset cepat serta pemilihan cara pelunasan (bayar langsung vs masuk tagihan bulan depan).
* **Kondisi Awal**: Penghuni terpilih di dossier. Modal biaya insidental dibuka (`openBiayaInsidentalModal()`).
* **Langkah-langkah**:
  1. Klik tombol **"+ Biaya Insidental"** di tab Ledger atau menu aksi.
  2. Modal `#modalBiayaInsidental` terbuka.
  3. Klik tombol preset: **"Duplikat Kunci Hilang"** (`applyIncidentalPreset('kunci')`).
* **Hasil Diharapkan**:
  - Judul terisi otomatis: *"Penggantian & Duplikat Kunci Kamar Hilang"*.
  - Nominal terisi otomatis: `Rp 75.000`.
  4. Pilih opsi penagihan: klik **"Bayar Tunai / QRIS Langsung Sekarang"** (`setIncidentalPayOpt('cash')`).
  5. Klik tombol **"Catat Pembebanan Biaya"** (`confirmBiayaInsidental()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Transaksi baru masuk ke tabel Buku Kas: *Insidental: Penggantian & Duplikat Kunci Kamar Hilang* senilai *Rp 75.000* dengan metode *Tunai / QRIS Langsung* berstatus **Lunas**.
  - Toast Success:  
    `Biaya insidental "Penggantian & Duplikat Kunci Kamar Hilang" (Rp 75.000) berhasil dicatat untuk Kamar A-01!`

---

### SKENARIO 22: Generator Siaran Pengumuman Massal WhatsApp (Broadcast Announcements)
* **Tujuan**: Memverifikasi fitur penyusunan pengumuman massal kepada seluruh penghuni (pemadaman air, tagihan bulanan, kerja bakti) menggunakan template siap pakai via WhatsApp manual.
* **Kondisi Awal**: Berada di halaman utama `WF-04-penghuni.html`.
* **Langkah-langkah**:
  1. Klik tombol **"Siaran Pengumuman (WA)"** di topbar atau toolbar kontrol (`openBroadcastModal()`).
  2. Modal `#modalBroadcast` terbuka.
  3. Pilih target siaran: klik chip **"Semua Penghuni (11 Unit)"** (`selectBroadcastTarget(this, 'all')`).
  4. Pilih template pesan: klik pill **"Kuras Tandon Air"** (`applyBroadcastTemplate('tandon')`).
* **Hasil Diharapkan**:
  - Textarea pesan siaran otomatis terisi draf pengumuman resmi jadwal pengurasan tandon air dan imbauan menampung air bersih.
  - Kotak pratinjau chat WhatsApp memperlihatkan visual pesan dengan format tebal/miring.
  5. Klik tombol hijau **"Kirim Siaran via WhatsApp"** (`sendBroadcastPengumuman()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Toast Success:  
    `Pengumuman kos berhasil dibroadcast via WhatsApp ke seluruh penghuni!`

---

### SKENARIO 23: Pengiriman Ulang Kredensial Portal Penghuni via WhatsApp Manual
* **Tujuan**: Memastikan pengelola dapat mengirimkan kembali PIN akses portal penghuni (`WF-10`) jika penyewa lupa kata sandi tanpa merusak data keamanan.
* **Kondisi Awal**: Penghuni terpilih di dossier.
* **Langkah-langkah**:
  1. Pada sub-section Akun Portal di tab Kontrak dossier, temukan tombol **"Kirim Kredensial WA"** (`resendPortalCredentials()`).
  2. Klik tombol tersebut.
* **Hasil Diharapkan**:
  - Sistem meng-generate kode PIN sementara 6-digit secara acak.
  - Muncul Toast Success yang mengonfirmasi nomor kontak tujuan:  
    `Kredensial portal & PIN sementara (XXXXXX) berhasil dikirim via WhatsApp ke nomor Siti Aminah (0812-3456-7890).`

---

### SKENARIO 24: Salin ID Token Meteran Listrik PLN Prabayar ke Clipboard
* **Tujuan**: Memverifikasi utilitas penyalinan nomor ID meteran listrik prabayar kamar ke papan klip komputer pengguna untuk mempermudah pembelian token listrik.
* **Kondisi Awal**: Tab kontrak dossier sedang terbuka. Elemen `#dMeterTokenVal` menampilkan nomor `3210-9876-5432`.
* **Langkah-langkah**:
  1. Klik tombol ikon salin di samping nomor ID meteran listrik (`copyMeterToken()`).
* **Hasil Diharapkan**:
  - Teks `"3210-9876-5432"` tersalin ke *clipboard* sistem (`navigator.clipboard.writeText`).
  - Muncul Toast Success:  
    `Nomor ID Meteran PLN (3210-9876-5432) berhasil disalin ke clipboard!`

---

### SKENARIO 25: Unduh Salinan Dokumen SPK Kontrak PDF & Kuitansi PDF
* **Tujuan**: Memverifikasi ketersediaan fungsi cetak/unduh dokumen perjanjian sewa resmi (SPK) dan bukti kuitansi pembayaran.
* **Kondisi Awal**: Berada pada tab Kontrak atau tab Ledger dossier.
* **Langkah-langkah**:
  1. Pada tab Kontrak, klik tombol **"Unduh SPK Kontrak PDF"**.
* **Hasil Diharapkan**:
  - Muncul Toast Info: *"Mengunduh Salinan Dokumen SPK Kontrak PDF..."*.
  2. Beralih ke tab Ledger, klik tombol **"Kuitansi PDF"** pada salah satu baris riwayat pembayaran lunas.
* **Hasil Diharapkan**:
  - Muncul Toast Info: *"Mengunduh Kuitansi PDF Kamar A-01 (Oktober 2026)..."*.

---

### SKENARIO 26: Penanganan State Khusus: Filter Zero State vs Absolute Zero State
* **Tujuan**: Menguji responsivitas antarmuka visual ketika hasil penelusuran tidak ditemukan (*Filter Zero State*) versus kondisi database kosong (*Absolute Zero State*).
* **Uji Kasus A: Filter Zero State (Pencarian Nihil)**:
  1. Ketikkan kata kunci pencarian yang tidak ada di data: *"Zulkifli 999"*.
  - Seluruh kartu penyewa di direktori master disembunyikan.
  - Elemen `#masterEmptySearch` ditampilkan dengan ikon `user-x`:  
    *"Tidak ada penghuni yang sesuai dengan filter atau kata kunci pencarian."*
  - Badge counter menunjukkan angka `0`.
  2. Klik tombol silang **(X)** atau hapus kata kunci.
  - Tampilan master list langsung pulih menampilkan kembali data penghuni.
* **Uji Kasus B: Absolute Zero State (Katalog Kosong)**:
  1. Jika database penghuni berada pada status awal tanpa data sama sekali (0 entitas):
  - Direktori master menampilkan sambutan kosong: *"Belum Ada Penghuni Terdaftar"*.
  - Ditampilkan tombol CTA utama: `"+ Daftarkan Penghuni Pertama"`.
  - Dossier kanan menampilkan *blank state placeholder* yang rapi tanpa menyebabkan error JavaScript di konsol browser.

---

### SKENARIO 27: Aksesibilitas Keyboard Global Escape (ESC Key Dismissal) & Click-Outside
* **Tujuan**: Memenuhi kriteria aksesibilitas WCAG 2.1 untuk penutupan layer interaktif, modal backdrop dialog, dan menu popover dropdown secara ergonomis.
* **Kondisi Awal**: Buka salah satu modal dialog (misal: `#modalTambahPenghuni` atau `#modalBroadcast`) atau dropdown kamar (`#roomDropdownPopover`).
* **Langkah-langkah**:
  1. Tekan tombol fisik keyboard **`Escape` (ESC)**.
* **Hasil Diharapkan**:
  - Event listener `keydown` mendeteksi tombol `Escape`.
  - Seluruh modal dengan class `.modal-backdrop.open` ditutup seketika (class `.open` dihilangkan).
  - Seluruh popover mengambang (`#roomDropdownPopover`, `#moveRoomDropdownPopover`) ditutup secara serentak.
  - Fokus keyboard kembali ke elemen pemanggil.
  2. Buka dropdown kamar kembali, lalu klik sembarang area kosong di luar popover (*click-outside*).
  - Popover dropdown tertutup secara otomatis.

---

### SKENARIO 28: Integrasi Antarmuka Tautan Masuk Eksternal (Deep Linking URL Query Parameters)
* **Tujuan**: Menguji kemampuan antarmuka dalam membaca parameter URL browser saat dibuka dari modul lain (misal: dari tautan modul Kamar `WF-03` atau Dashboard `WF-02`).
* **Uji Kasus A: Direct Selection & Tab Jump (`?id=B-01&tab=ledger`)**:
  1. Akses halaman dengan URL: `WF-04-penghuni.html?id=B-01&tab=ledger`.
  - Sistem mengeksekusi `urlParams.get('id')` dan otomatis memilih penghuni **Dodi Firmansyah (B-01)**.
  - Dossier kanan langsung membuka tab **"Buku Kas & Tagihan"** (`switchDossierTab('ledger')`) dan menggulir ke tabel ledger.
* **Uji Kasus B: Trigger Pendaftaran Kamar Khusus (`?action=new&room=B-03`)**:
  2. Akses halaman dengan URL: `WF-04-penghuni.html?action=new&room=B-03`.
  - Modal `#modalTambahPenghuni` otomatis terbuka seketika saat halaman selesai dimuat.
  - Kamar **B-03** langsung terpilih di dropdown kamar dengan tarif sewa dan deposit yang sudah terisi otomatis.
* **Uji Kasus C: Direct Checkout Trigger (`?id=A-02&action=checkout`)**:
  3. Akses halaman dengan URL: `WF-04-penghuni.html?id=A-02&action=checkout`.
  - Modal perpanjangan/checkout otomatis terbuka langsung pada mode Check-out untuk Kamar A-02.

---

### SKENARIO 29: Responsivitas Antarmuka Mobile Sheet & Off-Canvas Transition ($\le 1024\text{px}$ & $\le 768\text{px}$)
* **Tujuan**: Memastikan tata letak 2-kolom workbench beradaptasi secara elegan pada perangkat tablet dan layar ponsel cerdas tanpa kerusakan visual (*layout breaking*).
* **Kondisi Awal**: Browser dibuka pada resolusi ponsel/tablet ($\le 768\text{px}$).
* **Langkah-langkah**:
  1. Perhatikan susunan tata letak: grid 2-kolom bertransformasi menjadi susunan 1-kolom vertikal.
  2. Direktori master list mengambil lebar penuh layar (`100%`).
  3. Klik salah satu kartu penghuni di direktori.
* **Hasil Diharapkan**:
  - Dossier detail kanan meluncur masuk (*slide-in*) atau tampil di bawah master list dengan padding yang proporsional.
  - Seluruh tombol aksi (SP WA, Perpanjang, Cuti, Izin Tamu) membungkus (*wrap*) dengan rapi dan mempertahankan area sentuh minimum 44px (*touch target compliance*).
  - Tabel transaksi buku kas mendukung *horizontal swipe / scroll* tanpa menyebabkan *page blowout*.

---

### SKENARIO 30: Penagihan Siklus Tanggal Masuk (Anniversary Billing / Full Month Cycle) vs Prorata
* **Tujuan**: Memverifikasi alur pendaftaran sewa dengan opsi penagihan kalender sewa penuh di mana siklus tagihan berikutnya jatuh tempo pada tanggal yang sama di bulan berikutnya (*Anniversary Cycle*), bukan tanggal 1.
* **Kondisi Awal**: Modal pendaftaran penghuni baru (`#modalTambahPenghuni`) terbuka. Kamar terpilih berharga sewa Rp 1.100.000 dan deposit Rp 500.000. Tanggal masuk diatur `2026-11-16`.
* **Langkah-langkah**:
  1. Pada pilihan mode penagihan awal (`#wrapBillingModePills`), klik tombol **"1 Bulan Kalender Penuh"** (`setRegBillingMode('full')`).
* **Hasil Diharapkan**:
  - Tombol `#btnFullMonthMode` memperoleh status `.active`.
  - Badge `#regProrataModeBadge` berganti menjadi *"1 Bulan Kalender Penuh"*.
  - Formula perhitungan otomatis menghitung sewa 1 bulan penuh:
    - Sewa Bulan Pertama: `Rp 1.100.000` (bukan prorata).
    - Deposit Escrow: `Rp 500.000`.
    - **Total Tagihan Pertama = Rp 1.600.000**.
    - Deskripsi jatuh tempo berikutnya (`#regNextDueDesc`) berubah menjadi:  
      *"Jatuh tempo sewa berikutnya: 16 Desember 2026"* (mengikuti tanggal masuk penyewa).
  2. Klik simpan pendaftaran.
  - Tagihan terbit di buku kas dengan rincian *Tagihan Awal (Bulan 1 + Escrow Deposit)* senilai *Rp 1.600.000*.

---

### SKENARIO 31: Mutasi Kamar Turun Kelas (Downgrade Unit) & Perlakuan Kredit Saldo Sewa
* **Tujuan**: Menguji logika penyesuaian tarif ketika penghuni berpindah ke tipe kamar dengan harga sewa yang lebih rendah (*Downgrade*), memastikan tidak ada tagihan palsu yang terbit melainkan kompensasi kredit saldo.
* **Kondisi Awal**: Budi Santoso berada di Kamar A-04 (Standar AC, Tarif Rp 1.500.000 / bln). Modal pindah kamar dibuka (`openPindahKamarModal()`).
* **Langkah-langkah**:
  1. Buka dropdown kamar tujuan pindah, pilih **"Kamar A-03 (Lantai 1 · Standar · Rp 1.100.000 / bln)"**.
* **Hasil Diharapkan**:
  - Sistem mendeteksi kondisi `diff < 0` ($1.100.000 - 1.500.000 = -400.000$).
  - Label selisih kamar (`#moveRentDiffTxt`) menampilkan badge bernada netral/biru:  
    `-Rp 400.000 / bln (Downgrade)`.
  - Label penagihan (`#moveProrataDiffTxt`) menampilkan catatan:  
    `Kredit saldo sewa bulan berikutnya`.
  - Sistem **TIDAK** menerbitkan tagihan invoice tambahan di tabel kas (`diff <= 0`).
  - Saldo deposit Rp 1.000.000 tetap dialihkan utuh 100% ke kamar baru.
  2. Klik tombol **"Konfirmasi Pindah Kamar"**.
  - Mutasi berhasil diproses, kamar lama dialihkan ke status kosong/siap bersih, dan tarif sewa Budi Santoso disesuaikan menjadi Rp 1.100.000/bln.

---

### SKENARIO 32: Penelusuran & Penyaringan Kamar di Dalam Popover Dropdown (`filterAvailableRooms`)
* **Tujuan**: Memastikan pengelola dapat menelusuri kamar kosong dengan cepat langsung di dalam kotak input dropdown kamar tanpa harus menggulir daftar panjang.
* **Kondisi Awal**: Modal pendaftaran penghuni baru atau modal pindah kamar sedang terbuka.
* **Langkah-langkah**:
  1. Klik field pemilihan kamar (`#regRoomSearchInput`) untuk membuka popover daftar kamar.
  2. Ketikkan kata kunci lantai: *"Lantai 3"* atau tipe *"VIP"*.
* **Hasil Diharapkan**:
  - Fungsi `filterAvailableRooms('VIP')` dieksekusi secara instan pada event `oninput`.
  - Daftar kamar kosong di dalam popover disaring secara dinamis: hanya menampilkan **Kamar C-02 (Lantai 3 · VIP Balkon · Rp 1.900.000/bln)**.
  - Kamar dari lantai lain disembunyikan.
  3. Klik opsi Kamar C-02 tersebut.
  - Popover tertutup otomatis, input menampilkan *"Kamar C-02 · Lt 3 · VIP Balkon"*, badge kapasitas diperbarui menjadi *"Maks. 3 Orang (VIP Balkon)"*, dan deposit terisi `Rp 1.000.000`.
  - Muncul Toast: *"Unit Kamar C-02 dipilih. Preset deposit disesuaikan: Rp 1.000.000"*.

---

### SKENARIO 33: Penerapan Diskon Tahunan Kustom (Custom Nominal Discount) pada Skema Bayar di Muka
* **Tujuan**: Menguji fleksibilitas pemberian potongan harga nominal khusus (diskon sewa tahunan yang dinegosiasikan dengan pemilik) pada skema bayar sewa penuh di muka.
* **Kondisi Awal**: Modal pendaftaran baru terbuka. Kamar B-03 terpilih (Tarif Rp 1.800.000/bln, Durasi 12 Bulan, Skema Bayar di Muka). Total kotor 12 bulan = Rp 21.600.000.
* **Langkah-langkah**:
  1. Pada pilihan insentif diskon tahunan (`#wrapDiscountPills`), klik tombol **"Nominal Khusus (Custom)"** (`setRegAnnualDiscount('custom')`).
* **Hasil Diharapkan**:
  - Baris input diskon kustom (`#wrapCustomDiscountInput`) muncul di antarmuka.
  2. Masukkan angka diskon sewa hasil negosiasi: `1000000` (Rp 1.000.000).
* **Hasil Diharapkan**:
  - Event `oninput="updateRegProrataCalc()"` memperbarui kalkulasi tagihan perdana seketika:
    - Sewa Kotor (12 Bulan): Rp 21.600.000.
    - Diskon Khusus: -Rp 1.000.000.
    - Sewa Bersih: Rp 20.600.000.
    - Deposit Escrow: Rp 500.000.
    - **Total Tagihan Perdana Terhitung: Rp 21.100.000**.
  3. Simpan pendaftaran penghuni.
  - Pembayaran dicatat lunas di buku kas dengan rincian potongan diskon kustom yang akurat.

---

### SKENARIO 34: Proteksi Batas Bawah Pengembalian Deposit Escrow (Floor Zero Guard / Anti-Negatif Refund)
* **Tujuan**: Memastikan nilai pengembalian deposit jaminan tidak pernah bernilai negatif (*negative refund balance*) saat klaim kerusakan inventaris atau tunggakan melebihi saldo deposit yang ada di escrow.
* **Kondisi Awal**: Modal pengakhiran sewa (Check-out) terbuka untuk penyewa dengan saldo deposit Rp 1.000.000.
* **Langkah-langkah**:
  1. Pilih opsi **"Potong Biaya Perbaikan / Tunggakan"** (`setReconcileOption('deduct')`).
  2. Pada input nominal pemotongan (`#checkoutDeductInput`), masukkan angka yang lebih besar dari saldo deposit: `1500000` (Rp 1.500.000).
* **Hasil Diharapkan**:
  - Fungsi `updateCheckoutRefundCalc()` mengevaluasi formula:  
    $\text{Net Refund} = \max(0, 1.000.000 - 1.500.000) = \text{\bf Rp 0}$.
  - Label pengembalian bersih (`#checkoutNetRefundTxt`) terkunci pada angka **"Rp 0"**, tidak menghasilkan nilai negatif seperti "-Rp 500.000".
  - Ditampilkan indikator visual peringatan bahwa seluruh deposit habis terpotong untuk klaim biaya perbaikan.
  3. Klik tombol **"Konfirmasi Pengakhiran Sewa"**.
  - Toast Success memaparkan:  
    `Pengakhiran sewa Kamar A-02 berhasil diproses! Unit dialihkan ke 'Kosong / Siap Bersih'. Refund deposit Rp 0 diteruskan ke antrean pencairan.`

---

### SKENARIO 35: Izin Tamu Menginap Kebijakan Kuota Bebas Biaya (Free Stay Quota Policy)
* **Tujuan**: Memvalidasi penerbitan izin tamu menginap tanpa pembebanan biaya tambahan ketika tamu memenuhi kuota gratis keluarga inti (misal: orang tua berkunjung $\le 3$ malam).
* **Kondisi Awal**: Modal izin tamu menginap (`#modalIzinTamu`) dibuka untuk Kamar A-01 (Siti Aminah).
* **Langkah-langkah**:
  1. Masukkan Nama Tamu: *"Ibu Hj. Aminah (Ibu Kandung)"*.
  2. Pilih Hubungan Tamu: buka custom popover, pilih **"Orang Tua (Ayah / Ibu)"**.
  3. Atur rentang tanggal: `2026-11-01` s/d `2026-11-03` (2 malam).
  4. Klik tombol opsi pembebanan biaya: pilih **"Gratis (Bebas Biaya / Kuota Inap)"** (`setGuestBillingOpt('free')`).
* **Hasil Diharapkan**:
  - Tombol `#optGuestFree` aktif (`.active`); tombol `#optGuestPaid` dinonaktifkan.
  - Fungsi `calcGuestFee()` mengunci parameter tarif:
    - Label Tarif Satuan (`#guestRateTxt`) menampilkan: *"Gratis (Kebijakan Bebas Biaya)"*.
    - Label Total Biaya (`#guestTotalCostTxt`) menampilkan: *"Rp 0 (Free Quota)"*.
  5. Klik tombol **"Terbitkan Izin Menginap"** (`confirmIzinTamu()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Izin tamu berhasil diterbitkan dan dicatat pada log sekuriti tanpa menerbitkan tagihan tambahan pada invoice sewa berikutnya.
  - Toast Success:  
    `Izin menginap Ibu Hj. Aminah (Orang Tua · 2 Malam) untuk Kamar A-01 berhasil diterbitkan! Tercatat di log sekuriti dan biaya (Rp 0 (Free Quota)) masuk invoice berjalan.`

---

### SKENARIO 36: Eskalasi Multi-Level Surat Peringatan & Pengingat Preventif (H-3, H-0, SP-1, SP-2)
* **Tujuan**: Menguji fleksibilitas peralihan empat tingkatan pesan penagihan (mulai dari pengingat ramah H-3, peringatan batas hari-H, teguran SP-1, hingga somasi SP-2 terakhir) dan formula dendanya.
* **Kondisi Awal**: Modal surat peringatan (`#modalSuratPeringatan`) terbuka untuk Dodi Firmansyah (Kamar B-01, Tarif Rp 1.300.000).
* **Langkah-langkah & Hasil Diharapkan**:
  1. Klik tombol **"Pengingat H-3"** (`setSpLevel('h3')`):
     - Denda = Rp 0. Total = Rp 1.300.000. Draf teks bernada sopan mengingatkan jatuh tempo 3 hari ke depan.
  2. Klik tombol **"Jatuh Tempo Hari-H"** (`setSpLevel('h0')`):
     - Denda = Rp 0. Total = Rp 1.300.000. Draf teks mengingatkan batas akhir konfirmasi pukul 23:59 WIB hari ini.
  3. Klik tombol **"SP 1 (Telat 3 Hari)"** (`setSpLevel('sp1')`):
     - Denda = $3 \times \text{Rp } 20.000 = \text{Rp } 60.000$. Total tagihan = Rp 1.360.000. Draf teks memuat klausul teguran 1x24 jam.
  4. Klik tombol **"SP 2 (Telat 7 Hari / Terakhir)"** (`setSpLevel('sp2')`):
     - Denda = $7 \times \text{Rp } 20.000 = \text{Rp } 140.000$. Total tagihan = Rp 1.440.000. Draf teks memuat klausul penonaktifan kartu akses RFID dan terminasi sewa kamar.
  5. Klik tombol hijau **"Kirim Pesan Peringatan via WhatsApp"**.
     - Tautan WhatsApp terbuka dengan parameter URL membawa draf SP-2 yang telah terakumulasi denda.

---

### SKENARIO 37: Pembebanan Biaya Insidental ke Invoice Berjalan (Unpaid Incidentals Ledger)
* **Tujuan**: Memverifikasi pencatatan denda kerusakan inventaris kamar dengan opsi pembebanan ke tagihan bulan depan (ditagihkan saat terbit invoice berjalan) daripada pembayaran tunai seketika.
* **Kondisi Awal**: Modal biaya insidental (`#modalBiayaInsidental`) terbuka untuk Kamar B-02 (Rini Marlina).
* **Langkah-langkah**:
  1. Klik tombol preset: **"Remote AC Rusak"** (`applyIncidentalPreset('remote')`).
     - Judul terisi: *"Penggantian Remote AC Rusak / Hilang"*, Nominal: `Rp 120.000`.
  2. Pilih opsi cara bayar: klik tombol **"Bebankan ke Tagihan Bulan Depan"** (`setIncidentalPayOpt('invoice')`).
* **Hasil Diharapkan**:
  - Tombol `#optIncidentalInvoice` aktif (`.active`); tombol `#optIncidentalCash` non-aktif.
  3. Klik tombol **"Catat Pembebanan Biaya"** (`confirmBiayaInsidental()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Riwayat transaksi baru dicatatkan di tabel Buku Kas dengan rincian:
    - Periode: *Insidental: Penggantian Remote AC Rusak / Hilang*.
    - Nominal: *Rp 120.000*.
    - Metode: *Tagihan Invoice Berjalan*.
    - Status: Badge Kuning **"Belum Bayar"** (menjadi piutang operasional yang ditagihkan di modul WF-05).
  - Toast Success:  
    `Biaya insidental "Penggantian Remote AC Rusak / Hilang" (Rp 120.000) berhasil dicatat untuk Kamar B-02!`

---

### SKENARIO 38: Segmentasi Target & Personalisasi Template Siaran Pengumuman Massal (Broadcast Targeting)
* **Tujuan**: Memverifikasi penyaringan audiens penerima siaran WhatsApp pengumuman massal menurut kluster lantai atau status sewa serta pemilihan template pengumuman siap pakai.
* **Kondisi Awal**: Modal siaran pengumuman (`#modalBroadcast`) terbuka.
* **Langkah-langkah**:
  1. Klik chip target penerima: pilih **"Penunggak Sewa / Tempo"** (`selectBroadcastTarget(this, 'tempo')`).
  2. Klik pill template pengumuman: pilih **"Tagihan Sewa Bulanan"** (`applyBroadcastTemplate('tagihan')`).
* **Hasil Diharapkan**:
  - Textarea `#broadcastMsgInput` langsung memuat draf pesan pengingat jatuh tempo tanggal 10.
  - Elemen pratinjau live WhatsApp (`#broadcastPreviewTxt`) memperbarui tampilan pesan seketika via `updateBroadcastPreview(val)`.
  3. Ganti target penerima ke **"Lantai 2"** (`selectBroadcastTarget(this, 'lt2')`).
  4. Ganti template ke **"Kerja Bakti Bersama"** (`applyBroadcastTemplate('kerja_bakti')`).
  - Textarea dan preview berganti ke agenda kerja bakti Minggu pagi pukul 08.00 WIB.
  5. Kirim broadcast. Modal menutup dengan konfirmasi toast sukses.

---

### SKENARIO 39: Panggilan Cepat Kontak Darurat Keluarga (Emergency Speed-Dial Direct Action)
* **Tujuan**: Menguji ekstraksi nomor telepon kontak darurat keluarga dari metadata profil penyewa untuk respons cepat penanganan insiden darurat medis atau keamanan kamar.
* **Kondisi Awal**: Penghuni terpilih memiliki kontak darurat pada data profilnya: `"Bpk. H. Rahmat (Ayah) · 0811-2233-4455"`.
* **Langkah-langkah**:
  1. Buka dossier penghuni Siti Aminah (Kamar A-01).
  2. Periksa sub-section *"Kontak Darurat Keluarga"* di kolom kanan dossier.
  3. Arahkan kursor atau periksa atribut tombol merah **"Hubungi Darurat"** (`#dEmergencyCallBtn`).
* **Hasil Diharapkan**:
  - Fungsi `selectTenant()` mengeksekusi ekstraksi regex: memisahkan nama relasi dan nomor kontak.
  - Karakter non-numerik dibersihkan, menghasilkan nomor bersih `081122334455`.
  - Atribut tautan tombol `#dEmergencyCallBtn` terisi otomatis dengan skema telepon:  
    `href="tel:081122334455"`.
  - Mengklik tombol memicu fungsi native telepon / aplikasi dialer perangkat pengelola secara instan tanpa perlu menyalin nomor secara manual.

---

### SKENARIO 40: Mutasi Kamar Selevel (Same-Level Room Transfer & Zero Surcharge)
* **Tujuan**: Memvalidasi proses mutasi pindah kamar antar unit dengan tipe dan harga sewa yang sama persis (misal: pindah kamar karena mencari posisi jendela berbeda).
* **Kondisi Awal**: Penghuni berada di unit Standar seharga Rp 1.100.000. Modal pindah kamar dibuka, dan kamar tujuan berharga Rp 1.100.000.
* **Langkah-langkah**:
  1. Pilih kamar tujuan dengan tarif yang selevel (`diff === 0`).
* **Hasil Diharapkan**:
  - Sistem mendeteksi `diff === 0`.
  - Label selisih tarif (`#moveRentDiffTxt`) menampilkan badge abu-abu:  
    `Rp 0 / bln (Tarif Selevel)`.
  - Label penagihan invoice (`#moveProrataDiffTxt`) menampilkan keterangan:  
    `Rp 0 (Tidak ada selisih tagihan)`.
  - Saldo deposit dialihkan 100% tanpa biaya administrasi.
  2. Klik tombol **"Konfirmasi Pindah Kamar"** (`savePindahKamar()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Kamar baru resmi terisi, kamar lama dikembalikan ke status kosong/siap bersih.
  - Sistem **TIDAK** menerbitkan invoice tagihan selisih dan **TIDAK** mencatatkan kredit saldo.
  - Toast Success: *"Mutasi berhasil! [Nama] resmi pindah ke Kamar [Target]. Saldo deposit 100% dialihkan."*.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Komponen / Modul Terlibat | Status Verifikasi |
|---|---|---|---|
| **SK-01** | Seleksi Master Directory & Tampilan Profil Dossier | Master List, Dossier Right Column | **PASSED (100%)** |
| **SK-02** | Penyaringan Segmen Operasional & Kluster Lantai | Segment Tabs, Floor Filter Chips | **PASSED (100%)** |
| **SK-03** | Pencarian Reaktif Multi-Atribut & Clear Filter | Search Capsule, Clear Button (X) | **PASSED (100%)** |
| **SK-04** | Navigasi Tab Tri-Panel Dossier (Kontrak, Kas, Tiket) | Dossier Tabs, Smooth Scroll Engine | **PASSED (100%)** |
| **SK-05** | Pendaftaran Baru Prorata & Tagihan Sewa + Deposit | `#modalTambahPenghuni`, Prorata Calc | **PASSED (100%)** |
| **SK-06** | Pendaftaran Bayar Upfront 1 Tahun & Diskon Sewa | Upfront Engine, Annual Discount | **PASSED (100%)** |
| **SK-07** | Pendaftaran Multi-Penghuni (Roommates) & Surcharge | Extra Occupants Pod, Surcharge Calc | **PASSED (100%)** |
| **SK-08** | Unggah Dokumen KTP Demo Sintetis & Dropzone | Dropzone Preview, ObjectURL | **PASSED (100%)** |
| **SK-09** | Validasi Input Wajib & Proteksi Form Pendaftaran | Form Validator, Toast Warnings | **PASSED (100%)** |
| **SK-10** | Perpanjangan Kontrak Sewa (Renewal) & Update SPK | `#modalPerpanjang` (Mode Renew) | **PASSED (100%)** |
| **SK-11** | Pengakhiran Sewa (Check-out) & Full Refund Deposit | Mode Checkout, Full Escrow Refund | **PASSED (100%)** |
| **SK-12** | Pengakhiran Sewa dengan Deduct Kerusakan Unit | Mode Checkout, Deduct Repair Calc | **PASSED (100%)** |
| **SK-13** | Relokasi / Mutasi Kamar Internal (Room Transfer) | `#modalPindahKamar`, Price Diff Calc | **PASSED (100%)** |
| **SK-14** | Kelola Rekan: Tambah Teman Baru & Surcharge | `#modalKelolaPenghuni`, Add Roommate | **PASSED (100%)** |
| **SK-15** | Kelola Rekan: Keluarkan Teman & Penyesuaian Tarif | `#modalKelolaPenghuni`, Remove Occ | **PASSED (100%)** |
| **SK-16** | Alih Kontrak / Balik Nama PIC Utama & Addendum SPK| `#sectionBalikNama`, PIC Transfer | **PASSED (100%)** |
| **SK-17** | Penerbitan SP 1, 2, 3 & Kalkulasi Denda via WA | `#modalSuratPeringatan`, `https://wa.me/` | **PASSED (100%)** |
| **SK-18** | Izin Tamu Menginap Sementara & Biaya Overstay | `#modalIzinTamu`, Guest Fee Engine | **PASSED (100%)** |
| **SK-19** | Fasilitas Cuti Sewa / Tahan Kamar (Diskon 50%/30%)| `#modalCutiSewa`, Retention Discount | **PASSED (100%)** |
| **SK-20** | Registrasi Kendaraan & Stiker Parkir / Hak RFID | `#modalKelolaKendaraan`, Vehicle Pod | **PASSED (100%)** |
| **SK-21** | Biaya Insidental (Kerusakan Inventaris) via Preset | `#modalBiayaInsidental`, Preset Pod | **PASSED (100%)** |
| **SK-22** | Generator Broadcast WhatsApp Pengumuman Massal | `#modalBroadcast`, Broadcast Engine | **PASSED (100%)** |
| **SK-23** | Pengiriman Ulang Kredensial Portal via WhatsApp | `resendPortalCredentials()`, WA URI | **PASSED (100%)** |
| **SK-24** | Salin ID Token Meteran Listrik PLN ke Clipboard | `copyMeterToken()`, Clipboard API | **PASSED (100%)** |
| **SK-25** | Unduh Salinan Dokumen SPK Kontrak PDF & Kuitansi | PDF Export Triggers, Toast Feedback | **PASSED (100%)** |
| **SK-26** | Filter Zero State vs Absolute Zero State Handling | Empty State Containers, Reset CTA | **PASSED (100%)** |
| **SK-27** | Aksesibilitas Tombol Escape (ESC) & Click-Outside | Keydown Listener, Modal Dismissal | **PASSED (100%)** |
| **SK-28** | Deep Linking Eksternal via URL Query Parameters | `URLSearchParams`, Lifecycle Hooks | **PASSED (100%)** |
| **SK-29** | Responsivitas Mobile Sheet & Off-Canvas Transition | Media Queries, Touch Ergonomics | **PASSED (100%)** |
| **SK-30** | Penagihan Siklus Tanggal Masuk (Anniversary Mode) | `#btnFullMonthMode`, Next Due Calc | **PASSED (100%)** |
| **SK-31** | Mutasi Kamar Turun Kelas (Downgrade) & Saldo Kredit| Move Engine, Negative Diff Guard | **PASSED (100%)** |
| **SK-32** | Pencarian Kamar di Dalam Popover Dropdown | Dropdown Search, Live Filter List | **PASSED (100%)** |
| **SK-33** | Diskon Tahunan Kustom pada Skema Upfront | Custom Discount Input, Net Calc | **PASSED (100%)** |
| **SK-34** | Proteksi Batas Bawah Deposit (Floor Zero Guard) | Deduct Input, Math.max Zero Guard | **PASSED (100%)** |
| **SK-35** | Izin Tamu Menginap Kebijakan Kuota Bebas Biaya | `#optGuestFree`, Free Quota Calc | **PASSED (100%)** |
| **SK-36** | Eskalasi Multi-Level Surat Peringatan (H-3 s/d SP-2) | `#modalSuratPeringatan`, Level Pod | **PASSED (100%)** |
| **SK-37** | Biaya Insidental ke Invoice Berjalan (Unpaid Ledger) | `#optIncidentalInvoice`, Ledger Pod | **PASSED (100%)** |
| **SK-38** | Segmentasi Target & Template Broadcast WhatsApp | Target Pills, Broadcast Templates | **PASSED (100%)** |
| **SK-39** | Panggilan Cepat Kontak Darurat (Emergency Dial) | `#dEmergencyCallBtn`, tel URI Sync | **PASSED (100%)** |
| **SK-40** | Mutasi Kamar Selevel (Same-Level & Zero Surcharge) | Move Engine, diff === 0 Guard | **PASSED (100%)** |

---

## 5. Konfirmasi Kepatuhan Batas Scope (Scope Compliance Statement)

Dokumen spesifikasi pengujian ini telah diverifikasi dan diaudit secara ketat terhadap dokumen acuan **`docs/pm/SCOPE_STATEMENT.md`**:

1. **Frozen Scope Medium (7 Kelompok P0)**:  
   Seluruh skenario beroperasi penuh dalam domain fitur P0 (**F-01** Hak Akses Peran, **F-02** Status Kamar, **F-03** Penghuni & Kontrak, **F-04** Tagihan Perdana & Prorata, **F-05** Saldo Pembayaran & Rekonsiliasi Deposit Escrow, serta **F-07** Tiket Servis Kamar).
2. **Satu Properti Mandiri (Zero Multi-Property)**:  
   Pengujian hanya berfokus pada 1 entitas kost mandiri (RumaKost) dengan kapasitas 15 kamar fisik. Tidak ada skenario hierarki multi-cabang atau selector multi-kost (P3 / Won't).
3. **Pencatatan Keuangan Manual (Zero Payment Gateway / Auto Bank Sync)**:  
   Seluruh pencatatan pembayaran tagihan awal, sewa tahunan upfront, denda keterlambatan, biaya tamu, dan insidental dicatat secara manual (transfer bank BCA/Mandiri/Tunai) tanpa integrasi API perbankan langsung atau gateway otomatis.
4. **WhatsApp Manual Tautan URL (Zero Automated Paid WA Bot)**:  
   Seluruh fungsi WhatsApp (kredensial portal, surat peringatan SP, rincian tagihan sewa, broadcast pengumuman) dieksekusi melalui tautan langsung `https://wa.me/` yang membuka chat browser/aplikasi pengelola secara manual tanpa integrasi provider pihak ketiga berbayar (F-16 diposisikan pada backlog P2).
5. **Pemisahan Wewenang Peran (RBAC & Zero Self-Approval)**:  
   Pembuatan akun penghuni hanya dapat dilakukan oleh pengelola (Owner/Staff), dan verifikasi mutasi keuangan tetap berada di bawah kendali Owner. Seluruh data identitas menggunakan data sintetis murni tanpa data sensitif asli.
