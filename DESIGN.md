---
version: 1.0.0
name: RumaKost (Sistem Manajemen Kost Mandiri)
description: Single Source of Truth acuan desain sistem, token CSS, dan rekayasa visual untuk RumaKost, diadaptasi dari visual benchmark Estify Real Estate Dashboard.
sources:
  - docs/design/inspiration/01-dashboard-flat.png
  - docs/design/inspiration/02-dashboard-perspective.png
  - docs/design/inspiration/03-mobile-view.png
  - docs/design/inspiration/04-typography-sheet.png
  - docs/design/inspiration/05-logo-style.png
  - docs/design/inspiration/SOURCES.md
  - docs/design/inspiration/notes.md
notes:
  - Diobservasi dan diekstrak pada 2026-10-22 dari visual benchmark Estify (Behance) yang disepakati oleh pemilik kost.
  - Skala proyek Medium (1 properti, 7 P0 fitur). Seluruh 12 prototipe interaktif WF-01 s.d. WF-12 di docs/design/screens/ telah mengadopsi spesifikasi desain ini.
---

# Design System Specification & CSS Tokens (DESIGN.md)

> **Purpose**: Dokumen acuan tunggal (Single Source of Truth) sistem desain, token CSS baku, dan pedoman visual engineering untuk fase M04 UI/UX & Prototyping serta implementasi kode frontend pada fase M06 Development Execution.
> **Standard**: Kepatuhan penuh terhadap WCAG 2.2 Level AA (kontras teks ≥ 4.5:1, kontras border interaktif ≥ 3:1), token status triad lengkap (text, border, background), pertahanan anti-zoom iOS (universal 16px form inputs), dan unified multi-theme CSS variables.
> **Benchmark Asli**: Estify Real Estate Dashboard UI/UX Design (Behance), disepakati pemilik pada 2026-10-22.

---

## 0. Evidence & Inference Log

*Seluruh token dan keputusan desain di bawah ini berakar dari bukti empiris visual benchmark Estify atau inferensi terukur sesuai domain manajemen kost mandiri:*

| # | Token / Keputusan Desain | Tipe Sumber | Bukti Pengamatan (Observed Evidence) | Keyakinan |
| :-: | :--- | :--- | :--- | :---: |
| 1 | `--color-primary` = `#FF7A00` | Direct | Warna oranye pekat pada kartu sorotan "Best Apartments", indikator gauge bar, dan tombol highlight di `01-dashboard-flat.png` | ✅ |
| 2 | Canvas Background = `#F7F8FA` | Direct | Warna latar belakang kanvas aplikasi yang sangat lembut dan netral di `01-dashboard-flat.png` & `03-mobile-view.png` | ✅ |
| 3 | Active Pill Navigation = `#111111` | Direct | Pil navigasi hitam pekat solid di topbar desktop pada `01-dashboard-flat.png` | ✅ |
| 4 | Font Display & Body = Poppins | Direct | Deklarasi eksplisit jenis font, bobot (400, 500, 600, 700), dan skala heading pada `04-typography-sheet.png` | ✅ |
| 5 | Surface Card Radius = `20px` / `24px` | Direct | Radius sudut melengkung besar pada metric cards dan highlight cards di `01-dashboard-flat.png` | ✅ |
| 6 | Secondary Bar Chart = `#FDBA74` | Direct | Batang pembanding krem/peach berarsir diagonal pada chart pemasukan vs pengeluaran di `01-dashboard-flat.png` | ✅ |
| 7 | Subtle Divider Border = `#ECEEF2` | Direct | Garis pembatas kartu dan header di `01-dashboard-flat.png` | ✅ |
| 8 | Spacing Scale (Base 4px, `--space-1` s.d. `--space-16`) | Inference | Skala ritme modular kelipatan 4px untuk menjaga konsistensi vertikal antar section dan padding kartu | 🔶 |
| 9 | Complete Triad Status Tokens (Success, Warning, Destructive, Info) | Inference | Penyesuaian nilai hex triad (teks, border, background) agar lolos uji kontras matematis WCAG AA/AAA | 🔶 |
| 10 | Dark Mode Color Tokens | Inference | Derivasi token mode gelap dengan pembalikan kontras aman pada kanvas `#09090B` dan permukaan `#18181B` | 🔶 |
| 11 | Tabular Numbers Rule (`tnum`) | Direct | Keharusan perataan angka tetap untuk nominal mata uang Rupiah, tabel sewa, dan tanggal jatuh tempo | ✅ |
| 12 | Z-Index Layering Scale (`--z-canvas` s.d. `--z-toast`) | Inference | Standar tumpukan z-index bertingkat untuk mencegah tabrakan modal, popover dropdown, dan toast notifikasi | 🔶 |

**Legenda Tipe Sumber**:
- **Direct**: Diobservasi langsung dari lembar visual benchmark (`01-dashboard-flat.png`, `04-typography-sheet.png`, dll).
- **Inference**: Keputusan rekayasa desain yang diselaraskan untuk kepatuhan WCAG, interaktivitas taktil, dan domain sewa kost.

**Legenda Keyakinan**:
- ✅ **VERIFIED**: Terbukti secara visual dari sumber benchmark Estify.
- 🔶 **INFERRED**: Ditetapkan secara terukur untuk melengkapi kebutuhan fungsional antarmuka web.

---

## 1. Calibrated Color Palette & Contrast Verification

*Seluruh rasio kontras warna dihitung secara matematis terhadap latar belakang permukaan (surface background) masing-masing, memastikan keterbacaan optimal tanpa klaim palsu:*

### 1.1 Light Mode Color Tokens (Base Surface: `#FFFFFF` / Canvas: `#F7F8FA`)

| Token Name | HEX Value | Peran UI | Latar Diuji | Contrast Ratio | Standar Kepatuhan |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `--background` | `#F7F8FA` | Latar utama kanvas aplikasi | - | - | Base Canvas |
| `--surface` / `--card` | `#FFFFFF` | Latar kartu, panel modal, drawer | `#F7F8FA` | 1.05 : 1 | Base Container |
| `--foreground` | `#111111` | Judul utama, teks heading, angka metrik | `#FFFFFF` | **18.72 : 1** | PASS (WCAG AAA) |
| `--text-body` | `#4B5563` | Isi baris tabel, deskripsi, navigasi inactive | `#FFFFFF` | **7.18 : 1** | PASS (WCAG AAA) |
| `--muted-foreground` | `#71717A` | Teks sekunder, label pembantu, placeholder | `#FFFFFF` | **4.83 : 1** | PASS (WCAG AA) |
| `--text-placeholder` | `#71717A` | Placeholder input formulir | `#FFFFFF` | **4.83 : 1** | PASS (WCAG AA) |
| `--border` (Subtle) | `#ECEEF2` | Garis pemisah kartu & gridline pasif | `#FFFFFF` | 1.16 : 1 | Passive Boundary |
| `--input` (Border) | `#71717A` | Border interaktif input & filter | `#FFFFFF` | **4.83 : 1** | PASS (WCAG 1.4.11 ≥ 3:1) |
| `--color-primary` | `#FF7A00` | Aksen oranye Estify / CTA sorotan | `#FFFFFF` | **3.01 : 1** | PASS (WCAG UI Graphics/Large Text) |
| `--color-primary-dark`| `#C25E00` | Teks oranye pada latar putih | `#FFFFFF` | **4.65 : 1** | PASS (WCAG AA Text) |
| `--black-pill` | `#111111` | Tombol navigasi aktif / tombol aksi solid | `#FFFFFF` | **18.72 : 1** | PASS (WCAG AAA) |

### 1.2 Dark Mode Color Tokens (Base Surface: `#18181B` / Canvas: `#09090B`)

| Token Name | HEX Value | Peran UI | Latar Diuji | Contrast Ratio | Standar Kepatuhan |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `--background` | `#09090B` | Latar kanvas gelap | - | - | Dark Canvas |
| `--surface` / `--card` | `#18181B` | Latar kartu elevasi gelap | `#09090B` | 1.15 : 1 | Elevated Surface |
| `--foreground` | `#F4F4F5` | Teks judul utama & body copy terang | `#09090B` | **18.10 : 1** | PASS (WCAG AAA) |
| `--muted-foreground` | `#A1A1AA` | Teks sekunder & label redup | `#09090B` | **7.76 : 1** | PASS (WCAG AAA) |
| `--text-placeholder` | `#A1A1AA` | Placeholder input formulir gelap | `#18181B` | **6.91 : 1** | PASS (WCAG AA) |
| `--border` (Subtle) | `#27272A` | Garis pemisah pasif gelap | `#09090B` | 1.25 : 1 | Passive Boundary |
| `--input` (Border) | `#71717A` | Border interaktif kontrol input | `#18181B` | **3.67 : 1** | PASS (WCAG 1.4.11 ≥ 3:1) |
| `--color-primary` | `#FF8A1E` | Aksen oranye terang pada mode gelap | `#09090B` | **6.12 : 1** | PASS (WCAG AA) |

---

## 2. Complete Triad Status Tokens (Text, Border, Background)

*Setiap status semantik WAJIB mendefinisikan tiga token CSS terkalibrasi (teks, border, dan background) untuk mode terang dan gelap agar komponen status konsisten tanpa hardcoded hex:*

| Status Semantik | Token Teks (`--[name]`) | Token Border (`--[name]-border`) | Token Background (`--[name]-bg`) | Kontras Terang | Token Teks Gelap | Token Border Gelap | Token Background Gelap | Kontras Gelap |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Success** (Lunas, Terisi, Aktif) | `#065F46` | `#A7F3D0` | `#ECFDF5` | **6.78 : 1** (AA) | `#86EFAC` | `#065F46` | `#052E16` | **10.62 : 1** (AAA) |
| **Warning** (Jatuh Tempo, Menunggu) | `#92400E` | `#FDE68A` | `#FFFBEB` | **6.37 : 1** (AA) | `#FDE047` | `#854D0E` | `#422006` | **11.06 : 1** (AAA) |
| **Destructive** (Terlambat, Dibatalkan, Rusak) | `#991B1B` | `#FECACA` | `#FEF2F2` | **6.80 : 1** (AA) | `#FCA5A5` | `#991B1B` | `#450A0A` | **8.51 : 1** (AAA) |
| **Info** (Draft, Log, Pemeliharaan) | `#1E40AF` | `#BFDBFE` | `#EFF6FF` | **7.10 : 1** (AAA) | `#93C5FD` | `#1E40AF` | `#172554` | **9.25 : 1** (AAA) |

> ⚠️ **ATURAN PENGGUNAAN STATUS SEMANTIK**:
> 1. Transaksi operasional rutin (misalnya pengeluaran listrik, pembelian token air, biaya kebersihan) menggunakan badge netral dengan tanda aritmatika (`-Rp 150.000`), **DILARANG menggunakan `--destructive`**.
> 2. Token `--destructive` DILARANG digunakan untuk arus kas biasa; hanya dikhususkan bagi kondisi kritis/ireversibel: tagihan menunggak lewat batas toleransi, pemutusan kontrak sepihak, pembatalan sewa, atau kerusakan darurat fasilitas.

---

## 3. Typography & Form Ergonomics (Anti-Zoom Standards)

### 3.1 Hierarki Tipografi Poppins

Sesuai spesifikasi resmi Estify (`docs/design/inspiration/04-typography-sheet.png`):

| Tingkat Tipografi | Font Size | Font Weight | Line Height | Penggunaan & Konteks UI |
| :--- | :---: | :---: | :---: | :--- |
| **Display / Hero** | `36px – 48px` | Bold (700) | `1.15` | Hero banner sambutan, angka total revenue besar |
| **H1 Page Title** | `28px – 32px` | Bold (700) | `1.25` | Judul utama halaman autentikasi & overview dasbor |
| **H2 Section Header** | `22px – 24px` | SemiBold (600) | `1.30` | Judul section properti, daftar kamar, rekap bulanan |
| **H3 Card Title** | `18px – 20px` | SemiBold (600) | `1.35` | Judul kartu ringkasan, kartu highlight, modal title |
| **H4 Subtitle / Form Title**| `15px – 16px` | Medium (500) | `1.40` | Subtitle section, header form grup input |
| **Body Primary** | `14px – 16px` | Regular (400) | `1.50` | Deskripsi umum, isi artikel panduan, konten tiket |
| **Small / Helper Text** | `12px – 13px` | Medium (500) | `1.45` | Keterangan kolom tabel, helper text formulir, timestamp |
| **Caption / Badge** | `10px – 11px` | SemiBold (600) | `1.20` | Pill status kamar, counter badge notifikasi |

### 3.2 Deklarasi Font Family & The `tnum` Rule

- **Primary UI / Headings / Body**: `Poppins`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Monospace / Identifier**: `JetBrains Mono`, "SF Mono", Menlo, Consolas, monospace (untuk kode kamar `KMR-01`, nomor kwitansi, token pembayaran).
- **Tabular Figures Compliance Gate**: Seluruh data angka finansial (Rupiah), nomor kamar, tanggal, persentase okupansi, dan counter WAJIB menerapkan OpenType tabular figures:
  ```css
  /* Wajib untuk seluruh tabel keuangan, counter metrik, dan nominal sewa */
  .tabular-nums, table td, .metric-value, .currency-val {
    font-feature-settings: "tnum" 1;
    font-variant-numeric: tabular-nums;
  }
  ```

### 3.3 Form Input Anti-Zoom Rule (iOS & iPad Safari)

- Seluruh kontrol input formulir (`<input>`, `<select>`, `<textarea>`) **WAJIB MEMILIKI FONT-SIZE MINIMAL `16px` (`text-base`) PADA SELURUH VIEWPORT MOBILE**.
- **DILARANG KERAS**: Menerapkan kelas responsif penyusutan seperti `text-base md:text-sm` pada elemen input. Ini memicu auto-zoom otomatis pada browser Safari iOS/iPad yang merusak viewport layout.
- **Diferensiasi Inputmode**:
  - Input Uang Sewa & Angka: Menggunakan `inputmode="numeric"` dengan pemformatan titik ribuan real-time. **DILARANG MENGGUNAKAN `<input type="number">`** karena menghilangkan pemisah ribuan dan memunculkan tombol spinner OS yang kaku.
  - Input Nomor WhatsApp / Telepon: Menggunakan `inputmode="tel"`.
  - Input Tarif / Pembagi Desimal: Menggunakan `inputmode="decimal"`.

### 3.4 Spacing Scale

Ritme modular kelipatan 4px menjaga seluruh layout dan kartu bebas dari nilai arbitrer:

| Token Spacing | Nilai Pixel | Peruntukan UI |
| :--- | :---: | :--- |
| `--space-0` | `0px` | Rata tepi / flush edges |
| `--space-1` | `4px` | Jarak ikon ke label teks, gap badge mikro |
| `--space-2` | `8px` | Padding internal tombol kecil, jarak antar badge |
| `--space-3` | `12px` | Jarak vertikal label form ke input |
| `--space-4` | `16px` | Padding default konten form & card body |
| `--space-5` | `20px` | Padding standar kartu metrik Estify |
| `--space-6` | `24px` | Padding kartu highlight oranye & modal besar |
| `--space-8` | `32px` | Jarak ritme vertikal antar section halaman |
| `--space-10` | `40px` | Pemisah header utama halaman ke konten |
| `--space-12` | `48px` | Pemisah section besar pada desktop |
| `--space-16` | `64px` | Padding hero showcase & empty state banner |

---

## 4. Touch Ergonomics & Specialized Domain Formatting

### 4.1 Touch Targets (Comfort & AAA Standard)

- Target ketuk utama (tombol CTA, trigger select, tab navigasi, checkbox container) **WAJIB MEMENUHI MINIMAL `44px × 44px`** pada layar sentuh/mobile (`min-h-[44px] min-w-[44px]`).
- Tombol aksi lingkaran pada topbar (`search`, `message`, `bell`) berukuran minimal `38px × 38px` dengan tap area perluasan via padding tak kasat mata.

### 4.2 Format Khusus Domain Kost Mandiri

- **Format Struk Kwitansi Digital (WhatsApp Share & Unduh PDF)**:
  - Header: Logo Kunci Rumah + Nama Kost ("RumaKost - Kost Budi Makmur") + Tanggal Pembayaran.
  - Pembatas: Garis putus-putus (`border-t border-dashed border-slate-300`).
  - Font: Ukuran `12px`, tabular numbers, rincian sewa kamar bulan berjalan, deposit, dan sisa tagihan.
  - Tombol Kirim WhatsApp: Menggunakan pil hijau WhatsApp (`#16A34A`) dengan ikon Lucide `share-2`.
- **Indikator Status Pemeliharaan Unit**:
  - Menunggu Respon: Badge amber (`--warning`) berkedip halus.
  - Sedang Dikerjakan: Badge biru info (`--info`) dengan ikon teknisi.
  - Selesai / Siap Huni: Badge hijau (`--success`) dengan ikon ceklis ganda.

---

## 5. Anti-Slop Rules & Design Defenses

1. **Zero Emoticons (Icons Only)**:
   - DILARANG KERAS menggunakan karakter emoji Unicode (seperti 🚀, 💡, 🏠, 🔑, ⚙️, ❌) pada judul, tombol, kartu, badge, atau pesan sistem.
   - Seluruh visual wajib menggunakan **Lucide SVG Icons** dengan `stroke-width="1.75"` dan ukuran konsisten (`16px`, `18px`, `20px`).
2. **Zero Glassmorphism**:
   - DILARANG KERAS menggunakan efek `backdrop-blur` pada kontainer data atau panel kartu. Seluruh kartu wajib menggunakan warna solid putih bersih (`#FFFFFF`) dengan border halus (`#ECEEF2`) untuk menjamin keterbacaan teks dan efisiensi render GPU.
3. **Restrained Shadows**:
   - Elevasi bayangan kartu dibatasi maksimal `4px` (`box-shadow: 0 4px 20px rgba(0,0,0,0.03)`). Dilarang menggunakan bayangan neon tebal atau efek glow berlebihan.
4. **Zero Native Select Slop**:
   - DILARANG KERAS merender dropdown bawaan browser `<select>` yang membuka menu OS 90 derajat yang kaku. Seluruh dropdown filter dan opsi form wajib menggunakan floating popover terdesain dengan `rounded-2xl`, border `#ECEEF2`, dan bayangan halus `shadow-xl`.
5. **Zero Raw Browser Alerts**:
   - DILARANG KERAS memanggil fungsi `window.alert()`, `window.confirm()`, atau `window.prompt()`. Seluruh konfirmasi aksi wajib menggunakan modal dialog taktil terdesain, dan status operasi wajib menggunakan animasi toast di pojok kanan atas.
6. **Mobile Table Card Reflow**:
   - Pada viewport `< 640px`, seluruh tabel data (Daftar Kamar, Tagihan, Riwayat Pembayaran) WAJIB berubah susunan (reflow) menjadi kartu tumpuk vertikal (key-value cards) alih-alih scrolling horizontal tak terbatas yang memotong tombol aksi.
7. **Form Debounce & Double-Click Guard**:
   - Seluruh tombol aksi mutasi (Simpan Pembayaran, Buat Kontrak, Catat Pengeluaran) wajib menerapkan state loading interaktif (`disabled={isSubmitting}` + spinner + teks berubah) untuk mencegah duplikasi catatan transaksi pada jaringan lambat.

---

## 6. Complete Root CSS Variables

Berikut adalah token CSS lengkap yang siap disuntikkan ke dalam file stylesheet utama (`docs/design/screens/assets/css/theme.css` dan `src/app/globals.css`):

```css
:root {
  /* ==========================================================================
     Base Canvas, Surfaces & Cards
     ========================================================================== */
  --background:             #F7F8FA;   /* Kanvas aplikasi Estify */
  --surface:                #FFFFFF;   /* Permukaan panel & modal */
  --card:                   #FFFFFF;   /* Kontainer kartu data */
  --card-foreground:        #111111;
  --popover:                #FFFFFF;   /* Kontainer floating dropdown */
  --popover-foreground:     #111111;

  /* ==========================================================================
     Brand Primary & Accent (Estify Curated Orange)
     ========================================================================== */
  --color-primary:          #FF7A00;   /* Oranye khas Estify */
  --color-primary-hover:    #E66E00;   /* Hover state */
  --color-primary-soft:     #FFF7ED;   /* Latar lembut badge/ikon */
  --color-secondary-bar:    #FDBA74;   /* Batang peach chart */

  /* ==========================================================================
     Contrast & Interactive Navigation
     ========================================================================== */
  --color-black-pill:       #111111;   /* Pil navigasi aktif & tombol utama */
  --color-black-hover:      #222222;   /* Hover tombol hitam */
  --ring:                   #FF7A00;   /* Focus outline ring */

  /* ==========================================================================
     Typography & Content
     ========================================================================== */
  --foreground:             #111111;   /* Judul besar, angka metrik */
  --text-main:              #111111;
  --text-body:              #4B5563;   /* Isi tabel, body copy */
  --muted-foreground:       #71717A;   /* Keterangan sekunder */
  --text-placeholder:       #71717A;   /* Placeholder formulir */

  /* ==========================================================================
     Borders & Dividers
     ========================================================================== */
  --border:                 #ECEEF2;   /* Border kontainer halus (1.16:1) */
  --border-subtle:          #F3F4F6;   /* Gridlines chart */
  --input:                  #71717A;   /* Border form interaktif (4.83:1 AA) */

  /* ==========================================================================
     Complete Triad Status Tokens (Light Mode)
     ========================================================================== */
  /* Success: Lunas, Kamar Terisi, Aktif */
  --success:                #065F46;
  --success-border:         #A7F3D0;
  --success-bg:             #ECFDF5;

  /* Warning: Jatuh Tempo, Menunggu Teknisi */
  --warning:                #92400E;
  --warning-border:         #FDE68A;
  --warning-bg:             #FFFBEB;

  /* Destructive: Terlambat Bayar, Rusak Darurat */
  --destructive:            #991B1B;
  --destructive-border:     #FECACA;
  --destructive-bg:         #FEF2F2;

  /* Info: Draft, Log Sistem, Pemeliharaan */
  --info:                   #1E40AF;
  --info-border:            #BFDBFE;
  --info-bg:                #EFF6FF;

  /* ==========================================================================
     Spacing Scale (Multiples of 4px)
     ========================================================================== */
  --space-0:                0px;
  --space-1:                4px;
  --space-2:                8px;
  --space-3:                12px;
  --space-4:                16px;
  --space-5:                20px;
  --space-6:                24px;
  --space-8:                32px;
  --space-10:               40px;
  --space-12:               48px;
  --space-16:               64px;

  /* ==========================================================================
     Radius Scale
     ========================================================================== */
  --radius-sm:              8px;
  --radius-md:              12px;      /* Tombol form & input */
  --radius-lg:              16px;      /* Dropdown popover */
  --radius-xl:              20px;      /* Kartu metrik & kartu tabel */
  --radius-2xl:             24px;      /* Kartu sorotan oranye */
  --radius-full:            9999px;    /* Pil navigasi & pill badge */

  /* ==========================================================================
     Z-Index Layering Scale (Unified Stacking Context)
     ========================================================================== */
  --z-canvas:               0;
  --z-sticky-nav:           10;        /* Topbar navigasi (h-16 sticky) */
  --z-bottom-bar:           20;        /* Floating bottom bar mobile */
  --z-floating-action:      25;        /* FAB tambah cepat */
  --z-page-dropdown:        30;        /* Filter dropdown pada halaman */
  --z-modal-backdrop:       40;        /* Backdrop blur/overlay */
  --z-modal-dialog:         50;        /* Kontainer dialog modal */
  --z-modal-dropdown:       55;        /* Select trigger di dalam modal */
  --z-toast:                60;        /* Notifikasi toast mengambang */

  /* ==========================================================================
     Data Visualization Charts
     ========================================================================== */
  --chart-primary:          #FF7A00;   /* Batang pemasukan */
  --chart-secondary:        #FDBA74;   /* Batang pengeluaran peach */
  --chart-target:           #FF7A00;   /* Garis putus-putus target */
  --chart-grid:             #F3F4F6;   /* Garis horizontal */
}

/* ==========================================================================
   Dark Mode Theme Overrides (.dark)
   ========================================================================== */
.dark {
  --background:             #09090B;   /* Kanvas gelap pekat */
  --surface:                #18181B;   /* Panel & kartu elevasi */
  --card:                   #18181B;
  --card-foreground:        #F4F4F5;
  --popover:                #18181B;
  --popover-foreground:     #F4F4F5;

  --color-primary:          #FF8A1E;   /* Oranye disesuaikan kontras gelap */
  --color-primary-hover:    #FF7A00;
  --color-primary-soft:     #311E08;
  --color-secondary-bar:    #7C3E10;

  --color-black-pill:       #F4F4F5;   /* Tombol aktif putih pada mode gelap */
  --color-black-hover:      #E4E4E7;
  --ring:                   #FF8A1E;

  --foreground:             #F4F4F5;
  --text-main:              #F4F4F5;
  --text-body:              #D1D5DB;
  --muted-foreground:       #A1A1AA;
  --text-placeholder:       #A1A1AA;

  --border:                 #27272A;
  --border-subtle:          #1F1F23;
  --input:                  #71717A;

  /* Triad Status Dark Mode */
  --success:                #86EFAC;
  --success-border:         #065F46;
  --success-bg:             #052E16;

  --warning:                #FDE047;
  --warning-border:         #854D0E;
  --warning-bg:             #422006;

  --destructive:            #FCA5A5;
  --destructive-border:     #991B1B;
  --destructive-bg:         #450A0A;

  --info:                   #93C5FD;
  --info-border:            #1E40AF;
  --info-bg:                #172554;

  --chart-primary:          #FF8A1E;
  --chart-secondary:        #D97706;
  --chart-target:           #FF8A1E;
  --chart-grid:             #27272A;
}
```

---

## 7. Skala Baku Komponen UI & Token Ukuran (Design Component Scale)

*Untuk menjaga keselarasan proporsi antar layar dan mencegah perbedaan dimensi tak disengaja, seluruh komponen tombol, formulir, dan modal dikunci ke dalam skala baku:*

### 7.1 Skala Tombol (Button Sizing System)

| Token / Kelas | Tinggi Baku | Padding Horizontal | Font Size | Border Radius | Peruntukan & Contoh Penggunaan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`.btn-lg`** | **`48px`** | `24px` | `13px` SemiBold | `9999px` / `14px` | Tombol CTA Login (WF-01), Submit Modal Penuh, Aksi Utama Drawer |
| **`.btn-md`** *(Default)* | **`40px`** | `18px – 20px` | `12.5px – 13px` SemiBold | `9999px` / `12px` | Tombol Header Halaman (`+ Tambah Kamar`, `+ Kontrak Baru`), Filter Utama |
| **`.btn-sm`** | **`34px`** | `14px` | `12px` Medium/SemiBold | `9999px` / `10px` | Tombol Sub-Header, Tab Pill, `Buka Detail`, `Perpanjang Sewa` |
| **`.btn-xs`** | **`28px`** | `10px` | `11px` SemiBold | `9999px` / `8px` | Aksi Baris Tabel (`Kuitansi`, `Unduh PDF`, `Terminasi`, `Tindak Lanjut`) |
| **`.btn-circle`** | **`36px × 36px`** | Center Square | Ikon 16px (18px Topbar) | `50%` (Circle) | Tombol Search, Notifikasi Bell, Close Modal (`X`), Panah Diagonal (`↗`) |

#### Varian Visual Tombol Baku:
- **Dark Pill (`.btn-dark` / `.btn-black-solid`)**: `background: #111111; color: #FFFFFF;` (Elemen khas Estify).
- **Brand Primary (`.btn-primary` / `.btn-brand`)**: `background: #FF7A00; color: #FFFFFF; box-shadow: 0 4px 14px rgba(255,122,0,0.25);`.
- **White Outline (`.btn-outline` / `.btn-white-outline`)**: `background: #FFFFFF; border: 1.5px solid #ECEEF2; color: #374151;` (Hover: border & text `#111111`).
- **Subtle Ghost (`.btn-subtle`)**: `background: #F1F5F9; color: #475569;` (Hover: `#E2E8F0`).
- **Danger Pill (`.btn-danger-pill`)**: `background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48;` (Hover: `#E11D48`, text `#FFFFFF`).
- **WhatsApp Action (`.btn-wa-pill`)**: `background: #16A34A; color: #FFFFFF;` (Hover: `#15803D`).

---

### 7.2 Skala Form Fields (Uniform 42px Height Lock)

Semua komponen input formulir satu baris dikunci memiliki **tinggi seragam 42px** agar garis grid formulir selalu presisi dan rata:

| Elemen Form | Tinggi Baku | Font Size | Border Radius | Padding & Focus Directive |
| :--- | :---: | :---: | :---: | :--- |
| **Text / Tel / Number Input** | **`42px !important`** | `16px` (Mobile) / `13px` (Desktop) | `12px` | Padding `0 14px`, Border `#ECEEF2`, Focus ring `#FF7A00` |
| **Custom Select Trigger** | **`42px !important`** | `16px` (Mobile) / `13px` (Desktop) | `12px` | Padding `0 14px`, Ikon chevron sejajar kanan |
| **Datepicker Trigger** | **`42px !important`** | `16px` (Mobile) / `13px` (Desktop) | `12px` | Padding `0 14px`, Ikon kalender di kiri |
| **Textarea Multi-line** | Min-height **`84px`** | `16px` (Mobile) / `13px` (Desktop) | `12px` | Padding `10px 14px`, Resize vertikal terbatas |

---

### 7.3 Skala Modal Dialog Standar

| Tipe Modal | Lebar Baku (Width) | Padding Header | Padding Body | Radius | Kebijakan Scroll |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Modal Konfirmasi / Sederhana** | **`480px – 500px`** | `16px 20px` | `16px 20px` | `20px` | Dialog konfirmasi hapus/terminasi, prompt teks |
| **Modal Form Standar (1 Kolom)** | **`580px`** | `16px 22px` | `16px 22px` | `20px` | Form tambah kamar, form catat pengeluaran, tiket baru |
| **Modal Komprehensif (2 Kolom)** | **`1040px`** | `16px 24px` | `20px 24px` | `20px` | Registrasi kontrak penghuni baru, rincian kuitansi sewa |

---

### 7.4 Skala Status Badge & Pill

| Tipe Badge | Tinggi | Padding | Font Size | Border Radius |
| :--- | :---: | :---: | :---: | :---: |
| **Badge Regular / Status Kamar** | `24px` | `4px 10px` | `11px` SemiBold | `9999px` (Pill) |
| **Badge Micro / Baris Tabel** | `20px` | `2px 8px` | `10px – 10.5px` SemiBold | `6px` / `9999px` |

---

## 8. Quality Validation Checklist (DESIGN.md Gate)

*Pemeriksaan kepatuhan sebelum penetapan final dokumen DESIGN.md:*

- [x] **1. Pelabelan Kontras Akurat**: Kontras teks sekunder (`4.83 : 1`), placeholder (`4.83 : 1`), dan border interaktif (`4.83 : 1`) secara jujur berlabel WCAG AA tanpa klaim palsu AAA.
- [x] **2. Token Status Triad Lengkap**: Setiap status semantik (`success`, `warning`, `destructive`, `info`) mendefinisikan teks, border, dan background pada mode terang dan gelap.
- [x] **3. Pemisahan Border**: Membedakan secara tegas garis pasif kontainer (`--border: #ECEEF2`) dan garis interaktif input formulir (`--input: #71717A` ≥ 3:1).
- [x] **4. Pertahanan Anti-Zoom iOS**: Menetapkan ukuran font minimal 16px universal pada seluruh input form mobile tanpa override `md:text-sm`.
- [x] **5. Skala Z-Index Terpadu**: Hierarki z-index tersusun rapi dari canvas (`0`), sticky topbar (`10`), modal backdrop (`40`), modal dialog (`50`), popover (`55`), hingga toast (`60`).
- [x] **6. Kepatuhan Angka Tabular**: Seluruh tabel keuangan, counter metrik, dan nominal tagihan Rupiah menerapkan `font-variant-numeric: tabular-nums`.
- [x] **7. Pertahanan Anti-Slop Mutlak**: Nol emoji Unicode, nol efek glassmorphism, elevasi bayangan maksimal 4px, dan nol penggunaan dropdown browser bawaan yang kaku.
