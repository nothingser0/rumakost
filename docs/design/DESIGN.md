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
| `--border-subtle` | `#ECEEF2` | Garis batas modular kartu mengambang, pembatas tabel, dan divider seksi |
| `--border-control`| `#E2E8F0` | Garis batas kontrol formulir, pill fasilitas kamar, dropzone berkas |
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


---

## 7. Skala Baku Komponen UI & Token Ukuran (Design Component Scale)

Untuk menjaga konsistensi visual 100% di seluruh layar dan mencegah divergensi ukuran antar halaman, seluruh elemen tipografi, tombol, form, modal, drawer, dan badge dikunci ke dalam skala baku berdasar prinsip **Whole-Pixel Integer Scale** dan **WCAG 2.1 Accessibility Standards**:

### 7.1 Sistem Skala Tipografi Baku (Integer Pixel Typography Scale)

Seluruh ukuran teks di dalam sistem antarmuka RumaKost **wajib menggunakan bilangan bulat murni (Integer Pixels)**. Dilarang keras menggunakan nilai desimal atau sub-pixel (seperti `13.5px`, `12.5px`, `11.5px`, `10.5px`, atau `9.5px`) pada properti tipografi (`font-size`, `line-height`) karena memicu blur antialiasing font pada layar resolusi standar dan mengaburkan hierarki visual.

> [!NOTE]
> **Klarifikasi Optical Sizing Ikon Grafis**: Aturan bilangan bulat berlaku mutlak untuk **tipografi teks**. Untuk aset grafis dan vektor (seperti ukuran SVG Lucide icons `13.5px` atau ketebalan garis `stroke-width: 1.75`), nilai desimal diperbolehkan demi mencapai keseimbangan optik (*optical centering*) yang selaras dengan tinggi huruf kapital (*cap-height*).

| Tingkat / Level | Ukuran Font | Bobot (Weight) | Line Height | Peruntukan & Contoh Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0 (Display / Hero)** | **`24px – 26px`** | Bold (700) | `1.2 – 1.3` | Judul utama halaman dasbor, nominal saldo besar, angka metrik hero card |
| **Level 1 (Section Header)** | **`16px – 17px`** | Bold (700) | `1.3 – 1.4` | Judul grup/kluster (misal: "Lantai 1", "Riwayat Transaksi"), sub-heading kartu |
| **Level 2 (Card Title / Prominent)** | **`14px`** | Bold (700) / SemiBold (600) | `1.4` | Kode kamar ("KM-101"), tombol aksi utama Level 1 (CTA), header tabel data |
| **Level 3 (Body / Form / Toolbar)** | **`13px`** | Medium (500) / SemiBold (600) | `1.4 – 1.5` | Input field formulir, tombol filter Level 2, teks deskripsi utama, baris tabel |
| **Level 4 (Metadata / Secondary)** | **`12px`** | Medium (500) | `1.4` | Sub-label, timestamp, fasilitas kamar, tombol aksi mikro Level 3, helper text |
| **Level 5 (Micro Badge / Threshold)**| **`11px`** | SemiBold (600) | `1.3` | Badge status, pill kategori, footers. *(Batas minimum absolut WCAG 2.1)* |

> [!IMPORTANT]
> **Batas Aksesibilitas & Ketajaman Tipografi (WCAG 2.1 & Windows Anti-Thin Lock)**:
> 1. **Batas Bawah Ukuran**: Ukuran `11px SemiBold` adalah batas terbawah teks yang diizinkan di seluruh aplikasi. Dilarang menggunakan font berukuran `10px` atau di bawahnya demi menjaga keterbacaan (*legibility*) dan kontras rasio minimal 4.5:1.
> 2. **Anti-Thin / Anti-Pudar Rendering (Baseline 500 Medium)**: Dilarang memuat atau menggunakan bobot `300 (Light)`. Baseline bobot teks aplikasi pada `html, body` dikunci ke **`font-weight: 500 (Medium)`**. Pada layar desktop dengan rendering Windows ClearType, font geometric Poppins dengan bobot `400 (Regular)` dan warna abu-abu tampak sangat kurus seperti rambut (*anemic hairline*). Mengunci baseline ke `500 (Medium)` menjamin keseimbangan optik (*optical weight balance*) yang konsisten antara teks kartu/dasbor dengan teks yang diketik di dalam input form.
> 3. **Kasus Huruf Tenang & Isolasi Placeholder (Anti-Capslock Shouting)**:
>    - Seluruh judul seksi modal, label formulir, dan teks contoh placeholder wajib menggunakan *Natural Sentence Case* atau *Title Case* (contoh: `Contoh: A-06 atau D-01`, bukan `CONTOH: A-06 ATAU D-01`).
>    - **Dilarang keras menyematkan `text-transform: uppercase` pada tag `<input>`** karena CSS secara otomatis mengalirkan (*cascade*) efek tersebut ke pseudo-elemen `::placeholder`. Transformasi kapitalisasi nomor unit kamar wajib dilakukan pada level nilai saat diketik (`oninput="this.value = this.value.toUpperCase()"`), dan CSS wajib mengunci `.form-input-field::placeholder { text-transform: none !important; }`.

---

### 7.2 Hierarki Tombol & Target Sentuh (Button Hierarchy System)

Ukuran tombol diklasifikasikan ke dalam 3 level hierarki fungsional yang berbanding lurus dengan kepentingannya di layar:

| Level Hierarki | Token / Class | Tinggi (Height) | Font Size & Weight | Padding H | Border Radius | Peruntukan & Contoh |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 1 (Primary CTA)** | **`.btn-lg` / `.btn-brand-add`** | **`44px – 48px`** | `14px` SemiBold | `18px – 24px` | `12px` / `9999px` (Pill) | Tombol aksi utama halaman (`+ Tambah Unit`, `Masuk ke Akun`, `Bayar Sekarang`) |
| **Level 2 (Secondary / Tools)** | **`.btn-md` / `.btn-popover-trigger`** | **`38px – 40px`** | `13px` Medium/SemiBold | `14px – 18px` | `12px` | Tombol filter toolbar, pemilih lantai, trigger popover dropdown, tombol batal |
| **Level 3 (Tertiary / Utility)**| **`.btn-sm` / `.btn-utility`** | **`30px – 32px`** | `12px` SemiBold | `10px – 14px` | `8px` / `9999px` | Aksi baris tabel (`Kuitansi`, `Detail`), tombol aksi drawer (`Edit`, `Pilih Berkas`) |
| **Action Circle** | **`.btn-circle`** | **`36px × 36px`** *(30px In-Card)* | Ikon 16px *(14px In-Card)* | Center | `50%` (Circle) | Navigasi topbar, lonceng notifikasi, close modal (`X`), floating action kamar (`↗`) |

#### Varian Warna Tombol Baku:
- **Brand Primary (`.btn-brand` / `.btn-primary`)**: `background: #FF7A00; color: #FFFFFF; font-weight: 600; box-shadow: 0 4px 14px rgba(255,122,0,0.25);`.
- **Dark Pill (`.btn-dark` / `.btn-black-solid`)**: `background: #111111; color: #FFFFFF; font-weight: 600;` (Ciri khas Estify).
- **White Outline (`.btn-outline` / `.btn-white-outline`)**: `background: #FFFFFF; border: 1.5px solid #ECEEF2; color: #374151; font-weight: 500;` (Hover: border & text `#0F172A`).
- **Subtle Ghost / Action Circle (`.btn-subtle` / `.btn-more-options` / `.btn-circle-filter` / `.pill-dropdown-trigger`)**: `background: #F7F8FA; color: var(--text-secondary); border: 1px solid var(--border-subtle);` (Hover: `background: #FFFFFF; color: #111111; border-color: #D1D5DB;`). Mengikuti interaksi baku pill trigger Aktivitas Terkini (`.pill-dropdown-trigger`), beralih ke warna putih bersih dengan garis batas halus saat di-hover atau aktif, tanpa efek membesar/scale atau bayangan gelap.
- **Floating Action Navigation Arrow (`.room-float-arrow` / `.pill-arrow-btn` pada Arus Kas)**: `background: #F7F8FA; color: var(--text-secondary); border: 1px solid var(--border-subtle);` (Hover: `background: #111111 !important; color: #FFFFFF !important; border-color: #111111 !important; transform: scale(1.08); box-shadow: 0 4px 12px rgba(17,17,17,0.25);`). Keduanya merupakan tombol aksi tautan navigasi eksternal berikon `arrow-up-right` (↗) yang 100% konsisten berlatar hitam pekat saat di-hover.
- **Danger Action (`.btn-danger-pill`)**: `background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48;` (Hover: `#E11D48`, text `#FFFFFF`).
- **WhatsApp Action (`.btn-wa-pill`)**: `background: #16A34A; color: #FFFFFF;` (Hover: `#15803D`).

> [!CAUTION]
> **Integritas State Hover Tombol Aktif (Active Hover Contrast Lock)**:
> Seluruh tombol opsi kapsul, tab segmented, dan pill navigasi berstatus aktif (`.active`) yang berlatar belakang Obsidian Black (`#111111`) **wajib mempertahankan latar belakang gelap saat di-hover** dengan token `--dark-pill-hover: #222222` dan teks tetap `#FFFFFF` (`.duration-pill-opt.active:hover { background: var(--dark-pill-hover, #222222) !important; color: #FFFFFF !important; }`). Dilarang keras membiarkan deklarasi `:hover` umum menimpa (*override*) tombol aktif menjadi abu-abu terang (`#F8FAFC`).

> [!IMPORTANT]
> **Keseragaman Ikonografi Tombol (Button Icon Color Inheritance Standard)**:
> Seluruh ikon Lucide yang disematkan di dalam tombol (baik tombol primary, secondary, utility, drawer action, maupun modal footer) **wajib mewarisi warna teks tombol secara alami (`color: inherit` / `currentColor`)**. Dilarang keras menyematkan style warna mandiri (`style="color: #16A34A;"`, dsb.) pada tag ikon di dalam tombol, karena merusak harmoni visual (*color collision*) dan menyebabkan warna ikon tidak ikut bertransisi secara mulus saat tombol di-hover.

---

### 7.3 Skala Form Fields (Uniform 40px – 42px Height Lock)

Semua komponen input formulir satu baris dikunci dengan ketinggian seragam agar garis horizontal grid formulir selalu presisi dan sejajar:

| Elemen Form | Tinggi Baku | Font Size | Border Radius | Padding & Focus Standard |
| :--- | :--- | :--- | :--- | :--- |
| **Text / Number / Tel Input** | **`42px !important`** *(40px Toolbar Search)* | `13px` | `12px` | Padding `0 14px`, Border `#ECEEF2`, Focus ring `#FF7A00` |
| **Custom Select / Popover Trigger** | **`42px !important`** *(40px Toolbar Trigger)* | `13px` | `12px` | Padding `0 14px`, Chevron ikon sejajar kanan |
| **Datepicker Trigger** | **`42px !important`** | `13px` | `12px` | Padding `0 14px`, Kalender ikon di kiri |
| **Textarea Multi-line** | Min-height **`84px`** | `13px` | `12px` | Padding `10px 14px`, Resize vertikal terkontrol |

> [!IMPORTANT]
> **Kesetaraan Tipografi Input & Custom Select (Optical Parity Standard)**:
> Seluruh pemicu dropdown kustom (`.btn-form-select-trigger`, `.btn-custom-select-trigger`) **wajib memiliki ukuran dan bobot font yang persis setara dengan input teks reguler (`.form-input-field`)**, yaitu **`font-size: 13px !important; font-weight: 500 !important; color: var(--text-main, #111827) !important;`**. Dilarang keras menggunakan font yang lebih kecil (seperti `12px` atau desimal `12.5px`) atau bobot tipis (`400 Regular`) pada label nilai terpilih (seperti *"Lantai 1 — Blok A"* atau *"Standar"*), agar seluruh grid formulir memiliki kepadatan dan ketebalan optik yang 100% harmonis dan seragam.

---

### 7.4 Skala Modal & Slide-over Drawer Standar

| Tipe Wadah | Dimensi Baku | Padding Header | Padding Body | Radius | Karakteristik Scrollbar & Footer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Modal Form Standar (1 Kolom)** | Lebar **`580px`** | `16px 22px` | `16px 22px` | `20px` | Hidden scrollbar, smooth-scroll, footer sticky |
| **Modal Kompak / Konfirmasi** | Lebar **`480px – 500px`** | `16px 20px` | `16px 20px` | `20px` | Aksi terpusat / dialog konfirmasi ringkas |
| **Modal Komprehensif (2 Kolom)** | Lebar **`1040px`** | `16px 24px` | `20px 24px` | `20px` | Multi-section formulir / pratinjau invoice |
| **Slide-over Drawer (Detail Dossier)**| Lebar **`480px – 520px`** | `18px 24px` | `20px 24px` | `24px 0 0 24px` | Transisi transform X, backdrop blur, sticky action bar |

> [!IMPORTANT]
> **Ketentuan Visibilitas Modal (Zero Deadzone Rule)**: Wadah latar belakang modal (`.modal-backdrop`) saat tertutup/tidak aktif **wajib** menggunakan `display: none !important;` (bukan hanya `opacity: 0` atau `pointer-events: none`). Hal ini mutlak diterapkan untuk melenyapkan *invisible layer hitbox* atau artefak kursor disabled di tengah layar (`50vw, 50vh`) akibat bug komposit browser. Kelas `.modal-backdrop.open` mengaktifkan `display: flex !important; opacity: 1 !important; pointer-events: auto !important;`.

> [!IMPORTANT]
> **Offset Baku Sidebar Mengambang (Fixed Anchor Gap Preservation Standard — 20px Uniform Gap)**:
> Navigasi Topbar mengambang memiliki tinggi `70px` dengan margin atas `20px` (`top: 20px; bottom: 90px`). Agar posisi panel sidebar kanan (dossier kamar `.card-detail-drawer`) 100% stabil, tidak pernah terdorong/bergeser saat mencapai dasar halaman (*scroll mentok bawah*), dan jarak vertikal dari navbar selalu terkunci presisi di **20px**:
> 1. Pada layar desktop (`> 1200px`), panel sidebar dikunci dengan **`position: fixed !important; top: 110px !important; right: max(20px, calc((100vw - 1440px) / 2)) !important; width: 360px !important;`**.
> 2. Batas tinggi maksimal drawer dikunci pada **`max-height: calc(100vh - 130px) !important;`** dengan `overflow-y: auto;` sehingga konten internalnya dapat di-scroll mandiri tanpa memengaruhi posisi mengambangnya.
> 3. Pendekatan ini melenyapkan bug *CSS Sticky Parent Track Collision* (di mana elemen sticky terdorong naik saat grid induk mencapai batas bawah) sehingga jarak antara dasar navbar dan header sidebar **terkunci permanen pada 20px murni** di posisi scroll mana pun.

---

### 7.5 Skala Status Badge & Chip

| Tipe Badge | Tinggi | Padding | Font Size & Bobot | Border Radius | Peruntukan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Badge Regular** | `24px` | `4px 10px` | `11px` SemiBold | `9999px` (Pill) | Status transaksi tagihan, status sewa kamar utama |
| **Badge Micro / Table** | `20px – 22px` | `2px 8px` | `11px` SemiBold | `6px` / `9999px` | Label lantai di kartu kamar, badge baris tabel |

---

### 7.5.1 Standar Pill Fasilitas & Inventaris Kamar (Facility Amenity Pill Standard)

Untuk membedakan entitas **fasilitas unit** dengan **badge status hunian**, seluruh fasilitas kamar (baik pada Drawer Dossier `WF-03` maupun Kuadran 4 `WF-04`) dikunci dengan spesifikasi baku berikut:

| Parameter Desain | Nilai Spesifikasi Baku | Rationale & Dampak UI/UX |
| :--- | :--- | :--- |
| **Bentuk Geometris** | **Rounded Rectangle (`border-radius: 8px`)** | Dilarang keras berbentuk kapsul lonjong `rounded-full` (`9999px`) agar tidak rancu dengan badge status sewa/transaksi. |
| **Latar & Elevasi** | **Background `#FFFFFF` + Subtle Shadow** | `background: #FFFFFF; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);` menciptakan kontras elegan di atas kanvas/panel. |
| **Garis Batas (Border)** | **`1px solid #E2E8F0`** | Border abu-abu netral sangat halus, memberikan batas jelas tanpa terlihat tebal. Hover: `#CBD5E1; background: #F8FAFC;`. |
| **Tipografi & Warna Teks** | **`12px` Medium 500 (`#0F172A`)** | Teks slate gelap kontras tinggi (Level 4 WCAG), terbaca tajam dan tidak pudar. |
| **Ikonografi Lucide** | **Monokrom `#334155` (`13.5px x 13.5px`)** | Ikon monokromatis netral dengan `stroke-width: 1.75`, jarak/gap `7px` ke teks fasilitas. Dilarang memakai warna oranye/merah. |
| **Padding & Spacing** | **Padding `5.5px 11px`, Gap Antar Pill `7px - 8px`** | Menghasilkan baris rapi yang mengalir alami (*flex-wrap*) ke 2-3 baris seimbang. |

#### 7 Daftar Fasilitas Kamar Standar RumaKost:
1. `AC 1/2 PK` (Ikon Lucide: `wind`)
2. `KM Dalam` (Ikon Lucide: `bath`)
3. `Water Heater` (Ikon Lucide: `flame`)
4. `Springbed 120x200` (Ikon Lucide: `bed`)
5. `Lemari 2 Pintu` (Ikon Lucide: `box`)
6. `Meja & Kursi` (Ikon Lucide: `laptop`)
7. `Wi-Fi 100 Mbps` (Ikon Lucide: `wifi`)

---

### 7.5.2 Pemetaan Semantik Badge Status pada Filter Popover & Dropdown Counter

Untuk menjamin diferensiasi visual yang tajam antar opsi status pada filter popover dan mencegah kerancuan warna yang sama (*color collision*):
1. **Opsi Total/Agregat (`Semua Unit`)**: Wajib menggunakan badge netral abu-abu (`.badge-dark` dengan latar `#F4F5F7` dan teks `#111111`).
2. **Opsi Lunas / Terisi (`Terisi · Lunas`)**: Wajib menggunakan badge hijau lunas (`.badge-success` dengan latar `#DCFCE7`, teks `#16A34A`, border `#BBF7D0`). Dilarang keras menduplikasi `.badge-dark` pada opsi ini agar tidak identik/kembar dengan opsi `Semua Unit`.
3. **Opsi Kosong / Tersedia (`Kosong · Siap Huni`)**: Wajib menggunakan badge oranye brand (`.badge-brand` dengan latar `#FFF7ED`, teks `#FF7A00`, border `#FFEDD5`).
4. **Opsi Keterlambatan / Jatuh Tempo (`Terlambat / Tempo`)**: Wajib menggunakan badge merah bahaya (`.badge-danger` dengan latar `#FEE2E2`, teks `#DC2626`, border `#FECDD3`).
5. **Opsi Pemeliharaan (`Dalam Perbaikan`)**: Wajib menggunakan badge kuning/amber (`.badge-warning` dengan latar `#FEF3C7`, teks `#D97706`, border `#FDE68A`).

---

### 7.6 Standar Simetri Batas Vertikal Kanvas (Vertical Spacing & Boundary Symmetry)

Untuk memastikan ritme vertikal antarmuka stabil dan proporsional di seluruh resolusi layar, batas atas dan batas bawah kontainer dikunci dengan aturan simetri mutlak:

1. **Kanvas Kontainer Utama (`.dashboard-wrapper`)**:
   - **Desktop (`> 860px`)**: Wajib menggunakan padding simetris mutlak `padding: 20px 0;` (Jarak atas `20px` dari dasar Topbar, jarak bawah `20px` dari batas bawah jendela viewport saat mentok ke dasar). Dilarang keras membuat padding bawah lebih tebal (seperti `32px`, `60px`, atau `80px`) karena memicu *over-scroll void* (ruang kosong berlebih yang mengambang canggung di bawah kartu kamar). Seluruh kestabilan sidebar mengambang diselesaikan melalui arsitektur Fixed Anchor (`position: fixed`), bukan dengan memanjangkan kanvas halaman secara artifisial.
   - **Mobile (`<= 860px`)**: Wajib menggunakan padding simetris `padding: 14px 0;`.
2. **Kartu Metrik & Panel (`.metric-card-estify`)**:
   - Wajib menggunakan padding vertikal simetris: `padding: 20px 24px;` (Atas `20px`, Bawah `20px`).
3. **Bodi Kartu Entitas (`.room-unit-body`)**:
   - Dikunci menggunakan padding simetris: `padding: 4px;` dengan `gap: 5px;` antar baris konten.

---

### 7.7 Standar Avatar Profil Inisial (Obsidian Circle Profile Standard)

Seluruh avatar identitas profil pengguna (Pemilik, Staf Pengelola, maupun Penghuni Kost) di seluruh antarmuka dikunci dengan spesifikasi baku berikut:

| Parameter Desain | Nilai Spesifikasi Baku | Rationale / Dampak UI/UX |
| :--- | :--- | :--- |
| **Bentuk Geometris** | **Membulat Penuh (Circle / `border-radius: 50%`)** | Dilarang keras berbentuk squircle / rounded-rectangle (`8px` – `12px`) demi keseragaman visual DNA Estify. |
| **Warna Latar (Background)** | **Obsidian Black (`#111111`)** | Mengadopsi warna gelap netral berwibawa khas Estify, mencegah tabrakan visual (*color collision*) dengan oranye brand (`#FF7A00`) dan badge status. |
| **Tipografi & Inisial** | **2 Huruf Kapital Putih (`#FFFFFF`)** | Font Poppins Bold 700 / SemiBold 600, diambil otomatis dari 2 huruf depan nama (misal: "Siti Aminah" → **`SA`**, "Dimas Prasetyo" → **`DP`**, "Budi Santoso" → **`BS`**). |
| **Ukuran Regular (Drawer Dossier)** | **`34px × 34px`** (Font `11px` Bold 700) | Ukuran proporsional di dalam kartu profil penghuni drawer dossier kamar. |
| **Ukuran Topbar Navigation** | **`32px × 32px`** (Font `11px` Bold 700) | Ukuran kompak di baris topbar navigation kanan. |
| **Ukuran Baris Tabel Mikro** | **`28px × 28px`** (Font `11px` SemiBold 600) | Ukuran efisien pada baris tabel daftar penyewa. |

---

## 8. Arsitektur Informasi & Pola Layout Top-Down (Inverted Pyramid Architecture)

Untuk menjamin alur navigasi yang intuitif bagi pengelola properti saat memantau unit kamar dan penghuni, antarmuka mengadopsi pola **Kerucut Terbalik (Top-Down Flow)** 5 lapisan:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. MACRO METRICS STRIP (Statistik Global: Total, Terisi, Kosong, Kas)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. CONTROLS TOOLBAR (Pencarian Cepat, Filter Status/Tipe, Tombol Aksi)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. LOGICAL GROUP CLUSTER (Pemisahan Fisik: Kluster Lantai 1, 2, 3)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. MICRO ENTITY GRID (Kartu Satuan Kamar: Status, Penghuni, Jatuh Tempo)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 5. FOCUSED DOSSIER DRAWER (Pemeriksaan Mendalam & Aksi Cepat Satuan)   │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Spesifikasi Baris Tunggal Toolbar (Single Horizontal Row Rule)

Toolbar navigasi dan kontrol halaman (seperti pada `WF-03 Kamar` dan `WF-05 Tagihan`) wajib mematuhi aturan tata letak berikut:
1. **Satu Baris Horizontal Penuh**:
   - Kontrol pencarian, filter, dan tombol aksi utama wajib berada dalam **satu baris datar** (`display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap;`).
   - Dilarang membuat baris kontrol terpecah menjadi dua baris jika mengakibatkan kekosongan visual (*visual void*) atau tata letak gantung (*orphan controls*).
2. **Kapsul Pencarian Fleksibel (`.search-capsule-wide`)**:
   - Memiliki `flex: 1; max-width: 420px; min-width: 260px; height: 40px;` untuk pencarian instan nama penghuni, nomor kamar, atau nomor invoice.
3. **Penyatuan Filter ke dalam Popover Dropdown (Natural Hug-Content Standard — Zero Void)**:
   - Tombol pemicu dropdown (`.btn-popover-trigger`) menggunakan tinggi baku `40px`, border-radius pill `9999px`, padding rapat `0 14px`, dan tipografi `12px Medium` (WCAG Level 4 Estify).
   - **Eliminasi Ruang Kosong Canggung (Zero Void Rule)**: Dilarang menggunakan `justify-content: space-between` pada lebar tombol yang dipaksakan kaku karena akan menimbulkan rongga/jarak kosong yang canggung antara teks label dan ikon chevron panah. Ikon status, label teks, dan ikon panah chevron wajib disusun menyatu rapat (`display: inline-flex; align-items: center; gap: 7px; width: auto;`).
   - Dengan pendekatan *hug-content*, tombol tampil proporsional, padat, dan elegan tanpa rongga kosong, dengan transisi halus (`transition: all var(--transition-fast)`).
   - **Konsistensi Menu Dropdown Satu Baris & Hug-Content (Zero Void)**: Wadah menu (`.popover-dropdown-menu`) wajib menggunakan `width: max-content; box-sizing: border-box;` (memeluk konten secara natural tanpa memaksakan `min-width` berlebih yang menimbulkan ruang kosong canggung) dan setiap opsi item (`.popover-item`) wajib memiliki `white-space: nowrap;` untuk menjamin seluruh teks item (seperti `"Semua Unit (15)"` atau `"Terlambat / Tempo (3)"`) tampil rapi dan proporsional dalam **satu baris datar** tanpa terpecah ke baris kedua.
   - **Standar Zero-Jitter & Anti-Layout Shift pada Hover Dropdown (`.popover-item`)**:
     - **Dilarang Mengubah `font-weight` pada Hover**: Seluruh opsi item popover dropdown (`.popover-item`) wajib mempertahankan bobot font yang konstan (`font-weight: 500`). Dilarang keras menaikkan `font-weight: 600` saat hover karena perubahan ketebalan glif (*glyph advance width*) menyebabkan teks bertambah lebar secara dinamis dan memicu menu popover melebar/berubah ukuran secara mendadak (*layout shift / size popping*).
     - **Transisi Terisolasi Properti Non-Geometri**: Dilarang menggunakan `transition: all` pada item dropdown. Transisi wajib dibatasi secara eksplisit pada properti visual non-geometri: `transition: background-color var(--transition-fast), color var(--transition-fast);`.
     - **Warna Hover Netral (Obsidian Standard)**: State hover opsi item dropdown wajib menggunakan warna latar netral (`background: var(--bg-hover, #F3F4F6); color: var(--text-main, #111827);`). Dilarang mengubah teks menjadi oranye pada hover menu item biasa.
     - **Tombol Circle Filter & Utility Bebas Jitter (`.btn-circle-filter`, `.btn-more-options`)**: Tombol filter bundar 36px dan utility 32px saat di-hover atau aktif (`.is-open`) mengadopsi interaksi baku pill trigger Aktivitas Terkini (`.pill-dropdown-trigger`), yaitu beralih ke warna putih bersih (`background: #FFFFFF; border-color: #D1D5DB; color: #111111;`) tanpa efek translasi (`translateY`), scale pembesaran, atau bayangan gelap.
     - **Tombol Panah Tautan Navigasi Luar (`.pill-arrow-btn` Arus Kas & `.room-float-arrow`)**: Kedua tombol bundar berikon panah ↗ ini berbagi interaksi identik: saat di-hover beralih ke gaya solid Obsidian Dark (`background: #111111 !important; color: #FFFFFF !important; transform: scale(1.08);`).
4. **Tombol Aksi Utama Berdiri di Kanan Luar**:
   - Tombol CTA utama (Level 1: `+ Tambah Unit` / `+ Terbitkan Tagihan`) ditempatkan di ujung paling kanan dengan kontras visual tinggi (Brand Orange `#FF7A00` atau Obsidian Black `#111111`) dengan tinggi `44px` yang sedikit lebih dominan dibanding kontrol filter `40px`.
5. **Skalabilitas Lantai & Bangunan Tanpa Batas (*Infinite Floor Scalability*)**:
   - Sistem memiliki konfigurasi default 3 lantai (Lantai 1 — Blok A, Lantai 2 — Blok B, Lantai 3 — Blok C).
   - Penambahan lantai dapat dilakukan langsung secara *on-the-fly* pada dropdown lantai form Tambah/Edit Kamar melalui form inline yang ringkas (`placeholder="Nama lantai..."`) tanpa *native browser prompt/alert*.
   - **Mekanisme & Validasi Hapus Lantai (*Floor Deletion Guard Rule*)**:
     - Setiap header seksi kluster lantai (`.floor-box-header`) dilengkapi tombol hapus lantai (`.btn-del-floor-sec`).
     - **Aturan Mutlak — Lantai Wajib Kosong**: Penghapusan lantai **hanya diperbolehkan jika lantai tersebut memiliki 0 kamar**.
     - Apabila lantai masih memiliki 1 kamar atau lebih, sistem secara tegas menolak tindakan penghapusan dengan peringatan toast: `Lantai "[nama]" masih memiliki [count] kamar! Lantai harus kosong jika ingin dihapus.`
     - **Dialog Konfirmasi Pencegah Salah Klik**: Jika lantai sudah kosong (0 kamar), sistem memunculkan modal dialog konfirmasi khusus (`#modalKonfirmasiHapusLantai`). Setelah disetujui pengelola, seksi kluster dihapus dari DOM, dan opsi lantai dihapus secara reaktif dari dropdown Tambah Kamar (`#menuAddLantai`), Edit Kamar (`#menuEditLantai`), serta Toolbar Filter (`#menuFilterLantai`).

---

### 8.2 Integritas Data & Skenario Bisnis Kamar (Data Integrity & Business Guards)

1. **Proteksi Anti-Duplikasi Nama Lantai di Dropdown**:
   - Input cepat tambah lantai memeriksa apakah opsi dengan nama atau nilai lantai serupa sudah ada di menu. Jika sudah terdaftar, sistem secara otomatis memilih opsi yang ada tanpa membuat duplikat, dan memberi notifikasi ramah kepada pengguna.
2. **Sinkronisasi Dinamis Kartu Metrik Header (`refreshGlobalMetrics`)**:
   - Seluruh perubahan data unit (tambah kamar, edit status/harga, hapus kamar, relokasi lantai, selesainya tiket perbaikan) secara reaktif memicu kalkulasi ulang pada:
     - Kartu Kamar Kosong: Total unit siap huni, rasio kosong, dan progress radial gauge.
     - Kartu Kamar Terisi: Persentase okupansi riil, jumlah penyewa aktif, unit servis, dan progress radial gauge.
     - Kartu Potensi Sewa: Akumulasi nilai sewa per bulan, total nominal realisasi terkumpul, dan persentase ketercapaian.
     - Toolbar Filter: Label counter unit pada opsi `Semua Lantai (N)`, `Semua Status (N)`, `Hanya Terisi (N)`, `Hanya Kosong (N)`, dan `Dalam Perbaikan (N)`.
3. **Standarisasi Huruf Kapital & Anti-Duplikasi Nomor Kamar (Case-Insensitive)**:
   - Input nomor kamar secara otomatis terkapitalisasi (`toUpperCase()`) untuk mencegah inkonsistensi penamaan (seperti `a-01` vs `A-01`). Pengecekan duplikasi nomor kamar bersifat *case-insensitive*.
4. **Pemisahan Wewenang Status Fisik vs Status Hunian (*Domain Boundary: Physical vs Occupancy Status*)**:
   - **Form Kamar Hanya Mengelola Fisik Unit**: Form Tambah dan Edit Kamar secara ketat hanya mengelola kesiapan fisik unit: `[ Siap Huni ]` $\leftrightarrow$ `[ Perbaikan ]`.
   - **Larangan Manipulasi Manual Status Terisi**: Dilarang mengubah kamar kosong menjadi "Terisi" secara manual dari form kamar, karena status hunian terisi wajib berakar dari registrasi kontrak sewa sah di modul Penghuni (`WF-04`).
   - **Status Terkunci pada Unit Berpenghuni**: Jika kamar sedang dihuni penyewa aktif, pilihan status fisik pada modal Edit Kamar otomatis disembunyikan dan digantikan dengan panel status terkunci (`#wrapLockedStatusNotice`). Panel ini menampilkan nama penyewa aktif dengan badge dan tautan langsung ke halaman Penghuni (`WF-04`) guna mencegah terjadinya manipulasi atau *check-out* terselubung yang mengabaikan SOP deposit dan inventaris.
5. **Sinkronisasi Konteks Filter pada Drawer Dossier (`Filter Context Sync`)**:
   - Jika filter toolbar disaring ke lantai atau status tertentu sehingga kamar yang sedang aktif di drawer tersembunyi, sistem secara otomatis mengalihkan seleksi ke kamar pertama yang terlihat di layar (*visible room*).
6. **Penghapusan Opsi Lantai Draft/Typo di Dropdown (`Unused Floor Option Removal`)**:
   - Opsi lantai yang baru dibuat dan belum memiliki seksi unit kamar di halaman utama dilengkapi tombol hapus mini (`btn-del-floor-opt`) di dalam dropdown agar pengelola dapat membatalkan atau menghapus opsi salah ketik tanpa perlu me-refresh halaman.
7. **Auto-Formatting Ribuan Rupiah pada Input Tarif & Deposit**:
   - Input tarif sewa dan deposit memformat angka secara instan dengan pemisah titik ribuan Indonesia (`1.500.000`) saat pengetikan untuk menjaga konsistensi tampilan mata uang.
8. **Diferensiasi Absolute Zero State vs Filter Zero State**:
   - Jika katalog kost benar-benar kosong ($0$ unit kamar terdaftar), antarmuka menampilkan pesan pembuka hunian dengan tombol CTA langsung `+ Daftarkan Kamar Pertama`. Apabila kamar ada namun tidak cocok dengan pencarian, antarmuka menampilkan pesan filter dengan tombol `Reset Filter`.
9. **Eliminasi Ghost Data pada Drawer saat Kamar Terakhir Dihapus**:
   - Jika unit kamar terakhir dihapus dari sistem, drawer dossier kanan beralih ke *empty placeholder state* agar data kamar yang telah dihapus tidak tertinggal di layar.
10. **Pratinjau Foto Langsung (*Live Photo Preview & Persistence*)**:
    - Saat pengelola memilih foto unit kamar pada modal Tambah atau Edit Kamar, pratinjau foto langsung tampil di area unggah berkas (`URL.createObjectURL(file)`), dan gambar tersebut langsung dipetakan ke kartu kamar di grid serta Drawer Dossier saat disimpan.
11. **Dialog Konfirmasi Penghapusan Lantai (*Accidental Click Guard*)**:
    - Untuk mencegah terhapusnya seksi lantai yang kosong akibat sentuhan atau klik yang tidak disengaja, sistem menampilkan modal dialog konfirmasi khusus (`#modalKonfirmasiHapusLantai`) sebelum seksi lantai dan opsinya dibersihkan dari sistem.
12. **Aksesibilitas Tombol Escape (ESC Key Dismissal)**:
    - Menekan tombol `Escape` pada keyboard secara instan menutup seluruh custom dropdown menu, popover filter toolbar, modal dialog yang aktif, serta panel drawer mobile sesuai standar aksesibilitas WCAG 2.1.
13. **Batasan Alur Check-out Penyewa (*Tenant Check-out Domain Boundary*)**:
    - **SOP Check-out Eksklusif di Modul Penghuni (`WF-04`)**: Sesuai tata kelola operasional properti, proses *check-out* penyewa dilarang dilakukan secara instan dari modul kamar (`WF-03`). Check-out memiliki rantai prosedur wajib (inspeksi inventaris fasilitas, perhitungan meteran listrik terakhir, verifikasi pemotongan/pengembalian deposit sewa, serta penerbitan tanda terima akhir). Oleh karena itu, Drawer Dossier kamar terisi secara strictly hanya menyediakan navigasi `Lihat Profil Penghuni` ke halaman `WF-04-penghuni.html` untuk memproses *check-out* resmi.

---

### 8.3 Spesifikasi Kartu Entitas Kamar (Room Card Entity Specification — 3-Row Compact Standard)

Untuk menyelaraskan katalog kamar dengan keanggunan kartu *Kamar Kost Terkini* di halaman Dashboard (`WF-02`) dan mencegah kepadatan visual (*visual clutter*), kartu entitas kamar dikunci dengan spesifikasi baku berikut:

1. **Eliminasi Redundansi Kluster (Anti-Redundancy Rule)**:
   - Karena setiap kartu kamar sudah ditempatkan di dalam wadah kluster fisik bertingkat (misal: header grup `"Lantai 1 — Blok A"`), **dilarang keras** mengulang tulisan `"Lantai X"` di dalam kartu individual.
2. **Struktur Anatomi 3-Baris Bersih**:
   - **Baris 1 (Header Row)**:
     - Nomor Kamar: Font `14px` Bold 700 (`color: #111111`).
     - Status Badge: Level 5 Micro (`11px` SemiBold, padding `3px 8px`, rounded-full).
   - **Baris 2 (Sub-specs Dinamis 1 Baris)**:
     - Diringkas menjadi 1 baris fleksibel berikon SVG Lucide (`12px` Medium 500, `color: #64748B`, `white-space: nowrap; text-overflow: ellipsis;`):
       - Unit Terisi: `<i data-lucide="user"></i> {Nama Penghuni} · {Tipe Kamar}`
       - Unit Kosong: `<i data-lucide="sparkles"></i> Kosong · {Tipe} ({Dimensi})`
       - Unit Perbaikan: `<i data-lucide="wrench"></i> Perbaikan {Item} · {Tipe / Tiket}`
   - **Baris 3 (Harga & Siklus Sewa)**:
     - Garis pemisah halus atas: `border-top: 1px solid #F1F3F5; padding-top: 5px;`.
     - Nominal: Font `14px` Bold 700 (`color: #FF7A00`).
     - Satuan: Font `11px` Regular (`color: #94A3B8; /bln`).
3. **Proporsi Frame & Target Interaksi**:
   - Frame Luar: `border-radius: 16px; padding: 8px; border: 1.5px solid #ECEEF2; background: #FFFFFF;` (Saat aktif terpilih: `border-color: #FF7A00; box-shadow: 0 0 0 3px rgba(255,122,0,0.18);`).
   - Thumbnail Container: `height: 108px; border-radius: 12px; overflow: hidden;`.
   - Floating Action Circle: Ukuran Level 3 Utility `30px × 30px` melayang di pojok kanan atas thumbnail (`top: 6px; right: 6px;`).
4. **Diferensiasi Kursor Ergonomis (Cursor Affordance Rule)**:
   - **Pada Halaman Dashboard (Carousel Teaser - Non-selection)**:
     - Kartu & Gambar Thumbnail: `cursor: default;` (Bukan target klik penuh, mencegah *false click affordance*).
     - Seluruh Teks Konten (Nomor kamar, penghuni, spesifikasi, harga): `cursor: text; user-select: text;` (Memungkinkan teks diseleksi/disalin).
     - Badge Status: `cursor: default; user-select: none;`.
     - Tombol Panah Mengambang (`.room-float-arrow`): `cursor: pointer;` (Satu-satunya pemicu tautan navigasi ke halaman detail).
   - **Pada Halaman Kamar (Master-Detail Workspace)**:
     - Seluruh Kartu: `cursor: pointer;` (Mengklik area mana saja langsung memuat data kamar ke dalam Drawer Dossier kanan sesuai prinsip *Fitts's Law*).
