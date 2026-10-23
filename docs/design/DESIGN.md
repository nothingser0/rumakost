# DESIGN SYSTEM & VISUAL SPECIFICATION — RumaKost

> **Status**: APPROVED ARCHITECTURE (Fase M04 · UI/UX & Prototyping)  
> **Visual Reference**: Estify Real Estate Dashboard (Behance Modern Minimalist)  
> **Ruang Lingkup**: MVP Medium (1 Properti, 15 Kamar, 7 Kelompok Fitur P0)  
> **Fondasi Arsitektur Peran**: 3 Role Terisolasi (Pemilik, Staf Pengelola, Penghuni)

---

## 1. Visual DNA & Filosofi Desain (Estify Reference)

Desain antarmuka RumaKost mengadopsi bahasa visual modern minimalist real-estate dari **Estify**:
- **Kanvas Bersih & Terang**: Latar belakang aplikasi menggunakan kanvas abu-abu sangat lembut (`#F7F8FA`) yang memberi kontras tinggi dan kenyamanan visual bagi kartu-kartu putih konten.
- **Elemen Kartu Mengambang**: Seluruh konten dikelompokkan ke dalam kartu putih (`#FFFFFF`) dengan sudut lengkung halus (`border-radius: 20px` hingga `24px`), border halus (`1px solid #ECEEF2`), dan bayangan ambient lembut (`box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04)`).
- **Dark Pill Navigation**: Ciri khas Estify berupa kapsul navigasi hitam pekat (`#111111`) dengan sudut membulat penuh (`rounded-full`) untuk tab aktif dan tombol aksi utama.
- **Brand Accent Energy**: Oranye energik (`#FF7A00`) sebagai aksen primer untuk kartu sorotan properti, status aktif, target okupansi, dan tombol konfirmasi penting. Didukung warna peach (`#FDBA74` / `#FFF7ED`) sebagai latar sekunder.
- **Tipografi Bersih & Terstruktur**: Menggunakan jenis huruf **Poppins** (Google Fonts) dengan hierarki bobot tegas (`400 Regular`, `500 Medium`, `600 SemiBold`, `700 Bold`).
- **Craftsmanship Anti-Slop**:
  - Dilarang keras menggunakan emoticon/emoji Unicode di seluruh UI. Seluruh ikon wajib menggunakan SVG **Lucide Icons** (`stroke-width: 2px`).
  - Dilarang keras menggunakan popup browser bawaan (`alert()`, `confirm()`, `<select>` native). Seluruh interaksi menggunakan *custom modal*, *toast notification*, dan *custom popover dropdown*.

---

## 2. Palet Warna Resmi (Design Tokens)

Sistem warna RumaKost dikunci secara ketat dan konsisten di seluruh aplikasi:

| Token CSS | Kode Hex / Nilai | Peran & Penggunaan |
|---|---|---|
| `--bg-canvas` | `#F7F8FA` | Latar belakang seluruh halaman aplikasi |
| `--bg-card` | `#FFFFFF` | Latar belakang modul kartu, panel modal, drawer |
| `--brand-primary` | `#FF7A00` | Aksen brand utama, tombol bayar, kartu highlight, fokus ring |
| `--brand-secondary` | `#FDBA74` | Peach sekunder, batang grafik pengeluaran, aksen lembut |
| `--brand-light` | `#FFF7ED` | Latar belakang badge oranye, kontainer ikon, hover pill |
| `--dark-pill` | `#111111` | Pill navigasi aktif, tombol aksi dasbor utama, teks kontras tinggi |
| `--dark-pill-hover` | `#262626` | Status hover untuk elemen dark pill |
| `--text-main` | `#111827` | Teks judul utama, nominal saldo, angka metrik tebal |
| `--text-secondary` | `#4B5563` | Teks paragraf, label formulir, keterangan status |
| `--text-muted` | `#6B7280` | Sub-label, timestamp, placeholder input |
| `--text-subtle` | `#9CA3AF` | Keterangan non-aktif, watermark, border pembatas redup |
| `--border-subtle` | `#ECEEF2` | Garis batas antar komponen kartu dan tabel |
| `--border-card` | `#E5E7EB` | Garis luar kartu kontainer utama |
| `--status-success-bg` | `#DCFCE7` | Latar badge lunas, kamar terisi, perbaikan selesai |
| `--status-success-text` | `#16A34A` | Teks badge sukses / verifikasi valid |
| `--status-warning-bg` | `#FEF3C7` | Latar badge jatuh tempo, pending verifikasi |
| `--status-warning-text` | `#D97706` | Teks badge peringatan / pending |
| `--status-danger-bg` | `#FEE2E2` | Latar badge terlambat, tiket mendesak, kamar rusak |
| `--status-danger-text` | `#EF4444` | Teks badge kritis / bahaya / aksi destruktif |

---

## 3. Arsitektur Pengalaman Berbasis 3 Peran (3-Role Experience)

Sesuai dengan **Scope Statement (Bagian 3: Peran & Otorisasi)**, RumaKost memiliki **tiga peran pengguna terpisah** dengan kebutuhan alur dan antarmuka yang berbeda secara mendasar:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTENTIKASI UTAMA (WF-01)                       │
│  Layout Split Screen 3D Visual + Form Masuk Kredensial 3 Peran Terpadu  │
└──────────────────┬───────────────────┬─────────────────────────────────┘
                   │                   │
      ┌────────────┴────────┐          │
      ▼                     ▼          ▼
┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐
│  1. PEMILIK      │  │  2. STAF         │  │  3. PENGHUNI               │
│  (Superadmin)    │  │  (Operasional)   │  │  (Tenant Self-Service)     │
├──────────────────┤  ├──────────────────┤  ├────────────────────────────┤
│ • Akses Penuh    │  │ • Akses Terbatas │  │ • Portal Khusus Penghuni   │
│ • Verifikasi     │  │ • Catat Transaksi│  │ • Lihat Info Kamar Sendiri │
│   Pembayaran     │  │   (NO VERIFIKASI)│  │ • Unduh & Pantau Tagihan   │
│ • Semua Laporan  │  │ • Kelola Tiket   │  │ • Buat Tiket Kerusakan     │
│   Keuangan &     │  │   Kerusakan      │  │   (Wajib Foto/Video)       │
│   Okupansi       │  │ • Laporan Harian │  │ • Diskusi Tiket & Lampiran │
│ • Kontrol Akun   │  │ • DILARANG Buka  │  │ • DILARANG Akses Data      │
│   Staf & Kamar   │  │   Laba/Dividen   │  │   Penghuni Lain & Keuangan │
└──────────────────┘  └──────────────────┘  └────────────────────────────┘
```

### 3.1 Peran 1: Pemilik Kost (Owner / Superadmin)
- **Karakter Antarmuka**: Dasbor eksekutif lengkap dengan analitik kecepatan tinggi (Radial Speedometer Gauge, Double Bar Chart arus kas, Matriks Okupansi 15 kamar).
- **Wewenang Eksklusif**:
  - Satu-satunya peran yang berhak **memverifikasi dan merekonsiliasi pembayaran masuk** (`WF-06`).
  - Mengakses laporan laba bersih, dividen, dan tren okupansi tahunan (`WF-07`).
  - Mengelola tarif kamar, data rekening bank transfer, dan akun staf (`WF-09`).
- **Navigasi Topbar**: 7 Pill Penuh (`Dashboard`, `Kamar`, `Penghuni`, `Tagihan`, `Pembayaran`, `Laporan`, `Tiket`) + Pengaturan Akun.

### 3.2 Peran 2: Staf Pengelola (Staff / Operasional)
- **Karakter Antarmuka**: Dasbor operasional lapangan fokus eksekusi tugas harian.
- **Aturan Ketat (Zero Self-Approval)**:
  - Staf dapat mencatat tagihan dan mencatat penerimaan uang tunai / transfer dari penghuni, **namun status transaksi tetap "Menunggu Verifikasi Pemilik"** dan tidak mengurangi saldo tagihan secara otomatis sebelum disetujui Pemilik.
  - Staf mengelola eskalasi tiket kerusakan: menugaskan vendor teknisi, mengubah progres pengerjaan, dan mengunggah foto penyelesaian perbaikan.
  - Akses laporan dibatasi pada laporan operasional harian (tanpa data laba bersih dan dividen sensitif Pemilik).
- **Navigasi Topbar**: Pill Operasional dengan badge peran `[Staf Operasional]`.

### 3.3 Peran 3: Penghuni Kost (Tenant Portal)
- **Karakter Antarmuka**: Portal personal mandiri (Self-service portal) yang intuitif dan ramah perangkat bergerak.
- **Kebutuhan Spesifik**:
  - **Beranda Kamar Pribadi (`WF-10`)**: Informasi nomor kamar, batas jatuh tempo sewa, status kelunasan bulan ini, kontak darurat pengelola kost, dan tautan lapor masalah cepat.
  - **Lembar Tagihan & Riwayat Bayar**: Menampilkan rincian tagihan sewa bulanan dan tombol konfirmasi transfer.
  - **Pelaporan Kerusakan Wajib Media (`WF-11`)**: Form pelaporan komplain dengan **kewajiban melampirkan minimal satu foto atau video** kondisi kerusakan (Sesuai F-07).
  - **Detail & Diskusi Tiket (`WF-12`)**: Tampilan progres perbaikan 5 tahap Estify (*Laporan Diterima -> Teknisi Ditugaskan -> Dalam Pengerjaan -> Pengecekan Hasil -> Selesai*) disertai thread obrolan komentar dua arah dengan pengelola.
- **Navigasi Topbar**: 3 Pill Mandiri (`Beranda Kamar`, `Tagihan Saya`, `Lapor Kerusakan`) + Avatar Penghuni.

---

## 4. Standar Halaman Masuk (Login Layout Specification)

Berdasarkan referensi visual modern 3D workspace yang ditetapkan:
- **Layout Split-Screen Proporsional**:
  - **Sisi Kiri (3D Visual Showcase)**: Kontainer visual estetis berlatar gradien hangat (`#FFF7ED` ke `#FED7AA`) dengan ilustrasi workspace 3D (meja kerja, laptop, gantungan kunci kamar, tanaman hias meja) dengan animasi melayang (*floating animation*) halus. Area ini dapat diganti dengan video atau gambar 3D render tanpa merusak struktur layout.
  - **Sisi Kanan (Form Masuk Bersih)**: Kartu putih terpusat dengan sudut melengkung modern (`border-radius: 28px`), logo resmi RumaKost di bagian atas tengah, judul tegas, pemilih peran 3 tab interaktif, formulir input berikon, tombol masuk pill hitam, dan tombol pintas demo 1-klik untuk pengujian instan.
- **Penghapusan Teks**: Teks *"Akses privat terlindungi UU PDP. Dengan masuk, Anda menyetujui Kebijakan Privasi RumaKost"* **dihapus seutuhnya** sesuai instruksi.

---

## 5. Komponen Kunci Estify (Design Atoms & Composites)

1. **Radial Speedometer Gauge (CMP-06)**: Menampilkan visualisasi persentase kapasitas hunian dan rasio penagihan dengan busur semi-lingkaran analog.
2. **Double Bar Chart (CMP-11)**: Grafik perbandingan pemasukan bulanan (oranye solid `#FF7A00`) dan pengeluaran operasional (arsiran diagonal peach `#FDBA74`).
3. **Segmented Progress Indicator (CMP-07)**: Indikator 5 batang sekuensial pada pelacakan pemeliharaan fasilitas dan tiket penghuni.
4. **Slide-over Drawer & Centered Modal (CMP-05)**: Wadah interaksi pencatatan cepat tanpa meninggalkan konteks halaman dasbor.
5. **Toast Notification System (CMP-20)**: Sistem umpan balik interaktif dengan transisi halus menggantikan fungsi `alert()` bawaan peramban.

---

## 6. Alur Operasional Keuangan & Uang Jaminan (Escrow & Billing Lifecycle)

Sesuai dengan **Scope Statement F-03, F-04, F-05**:
1. **Invoice Tagihan Perdana (Check-in Baru)**:
   - Penggabungan biaya awal: `Sewa Bulan ke-1 + Uang Jaminan Deposit (Escrow)`.
   - Mendukung perhitungan **Prorata Hari Berjalan** jika masuk di pertengahan bulan (misal 15–31 Oktober) atau **Siklus Tanggal Masuk (Anniversary)**.
2. **Matriks Penagihan Sewa Bulanan (WF-05)**:
   - Tagihan sewa reguler dibuat **100% otomatis oleh sistem** setiap tanggal 1 bulan berjalan untuk seluruh kamar aktif.
   - Penghuni yang telah membayar sewa 1 tahun penuh di muka berstatus otomatis **Lunas (Prabayar 1 Thn)** dengan sisa tagihan Rp 0.
   - Tombol manual `+ Terbitkan Tagihan` berfungsi untuk tagihan *on-demand / insidental* (penghuni baru susulan, kelebihan listrik kWh, denda keterlambatan, atau kerusakan fasilitas) dengan data kontrak yang terisi otomatis begitu unit kamar dipilih.
3. **Penyelesaian Potong Deposit (Escrow Settlement)**:
   - Pada modal pencatatan pembayaran (WF-05 / WF-06), tersedia metode pembayaran **`Potong Deposit (Escrow Settlement)`**.
   - Digunakan saat penghuni check-out di bulan terakhir atau kondisi darurat sewa, yang otomatis melunasi tagihan sewa dan mendebit saldo deposit kamar secara aman dan transparan.
4. **Pengakhiran Sewa, Terminasi / Usir & Check-Out Penghuni (WF-04 · SCR-08)**:
   - Tindakan pengakhiran sewa atau pengusiran penghuni bermasalah dapat dilakukan langsung melalui tombol aksi cepat **`Akhiri Sewa / Usir`** di bagian atas header profil penghuni (Dossier Header) tanpa perlu menggulir ke bawah dokumen SPK.
   - Membuka modal **`Pengakhiran Sewa / Check-Out Penghuni`** dengan alur SOP terpadu:
     a. Penentuan tanggal efektif check-out (menggunakan kalender datepicker arah ke bawah dengan trigger putih bersih senada field input).
     b. Rekonsiliasi dana jaminan deposit (refund utuh atau potong tunggakan sewa/kerusakan).
     c. Rekening tujuan pencairan refund penghuni.
     d. Checklist digital serah terima kunci dan inspeksi fisik fasilitas kamar.
   - Status unit kamar pasca check-out otomatis dialihkan menjadi **`Kosong / Siap Bersih`** pada sistem kamar (WF-03).
5. **Integrasi Metrik & Distribusi Tagihan (Layout 1 : 1 : 1.9 & Eliminasi Redundansi)**:
   - Header metrik atas pada halaman tagihan menggunakan proporsi asimetris yang efisien:
     - **Card 1 (Kas Masuk Realisasi)**: `1fr` kompak dengan sparkline curve realisasi kas.
     - **Card 2 (Sisa Piutang Berjalan)**: `1fr` kompak dengan rincian breakdown telat vs berjalan.
     - **Card 3 (Efisiensi & Distribusi Tagihan - Hero Executive Card)**: `1.9fr` lebar berlatar *Obsidian Dark* (#111111), menggabungkan rasio penagihan, target nominal, multi-segmented distribution bar (Lunas, Cicilan, Jatuh Tempo, Terlambat), serta chip filter status interaktif dan tombol aksi siaran WA.
   - **Eliminasi Kartu Terpisah**: Kartu Distribusi Tagihan terpisah dihapus total sehingga menghemat ~140px ruang vertikal, memungkinkan tabel Matriks Penagihan langsung terlihat jelas di layar tanpa perlu scroll ke bawah.
   - **Tooltip Standar Browser**: Menggunakan tooltip bawaan browser (`title="..."`) yang ringan, instan, andal tanpa kedip/flicker.
