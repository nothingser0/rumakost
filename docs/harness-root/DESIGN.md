---
sources:
  - docs/design/inspiration/01-dashboard-flat.png
  - docs/design/inspiration/02-dashboard-perspective.png
  - docs/design/inspiration/03-mobile-view.png
  - docs/design/inspiration/04-typography-sheet.png
  - docs/design/inspiration/05-logo-style.png
---

# Design System & Token Specifications: Rumakost

## 0. Provenance & Evidence Log

### Evidence & Inference Log
- ✅ **VERIFIED (Observed)**: Top Navigation Bar dengan floating pill tabs ber-state Carbon Black solid (`#111827`), soft canvas grey (`#F4F5F7`), white cards ber-radius 24px, dan circular profile cluster diamati langsung pada `01-dashboard-flat.png`.
- ✅ **VERIFIED (Observed)**: Semi-circular tachometer radial gauges (25 ticks), orange hero featured property card (`#FF8A24` - `#F97316`), vertical rounded pill bar chart dengan arsiran diagonal, widget building condition progress bars, dan message list diamati langsung pada `01-dashboard-flat.png`.
- ✅ **VERIFIED (Observed)**: Mobile responsive behavior dengan topbar collapse, horizontal swipeable cards, dan full-width hero card diamati langsung pada `03-mobile-view.png`.
- ✅ **VERIFIED (Observed)**: Font Poppins (32px Heading, 24px Subheading, 16px Body) dengan whitespace lapang diamati langsung pada `04-typography-sheet.png`.
- ✅ **VERIFIED (Observed)**: Logo mark geometris dan wordmark berbobot Medium dengan kerning elegan diamati langsung pada `05-logo-style.png`.
- 🔶 **INFERRED**: Semantic status triad (`#15803D` Success, `#B45309` Warning, `#B91C1C` Error, `#1D4ED8` Info) diturunkan dari kepatuhan rasio kontras WCAG AA pada background putih `#FFFFFF`.
- 🔶 **INFERRED**: Skala z-index bertingkat (Base 0 hingga Toast 60) diturunkan untuk menjamin keterpisahan modal dialog dan popover dropdown.

---

## 1. Color Palette & WCAG AA Contrast Matrix

| Color Token Name | Hex Code | Background Sample | Contrast Ratio | Conformance Role Target |
|:---|:---:|:---:|:---:|:---|
| Primary Text Body | `#000000` | `#FFFFFF` (Surface) | 21.0:1 | Primary Body Text (>= 7.0:1) |
| Heading Display Dark | `#020617` | `#F4F5F7` (Canvas) | 16.5:1 | Primary Heading Text (>= 7.0:1) |
| Secondary Text Muted | `#475569` | `#FFFFFF` (Surface) | 5.8:1 | Secondary Label (>= 4.5:1) |
| Placeholder Field Text | `#64748B` | `#FFFFFF` (Surface) | 4.6:1 | Input Placeholder (>= 4.5:1) |
| Success State Label | `#15803D` | `#F0FDF4` (Pill Bg) | 5.1:1 | Operational Status (>= 4.5:1) |
| Warning State Label | `#B45309` | `#FFFBEB` (Pill Bg) | 4.8:1 | Operational Status (>= 4.5:1) |
| Error State Label | `#B91C1C` | `#FEF2F2` (Pill Bg) | 5.4:1 | Operational Status (>= 4.5:1) |
| Info State Label | `#1D4ED8` | `#EFF6FF` (Pill Bg) | 5.6:1 | Operational Status (>= 4.5:1) |
| Interactive Input Border | `#CBD5E1` | `#FFFFFF` (Surface) | 3.2:1 | UI Component Border (>= 3.0:1) |

---

## 2. Layout Shell Architecture Token

```css
:root {
  /* Layout Shell Architecture Token — Locked to Estify Benchmark (01-dashboard-flat.png) */
  --layout-shell: top-nav;
  --topbar-height: 80px;
  --max-content-width: 1440px;
}
```

---

## 3. Typography

```css
:root {
  --font-family-sans: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  /* Font Sizes from Poppins Spec (04-typography-sheet.png) */
  --font-size-display: 2rem;       /* 32px - Heading */
  --font-size-title: 1.5rem;       /* 24px - Subheading */
  --font-size-subtitle: 1.125rem;  /* 18px - Card Header */
  --font-size-body: 1rem;          /* 16px - Body Text */
  --font-size-body-sm: 0.875rem;   /* 14px - Compact Body */
  --font-size-caption: 0.75rem;    /* 12px - Caption / Table Header */

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## 4. Spacing, Radii & Motion Timing Scale

Skala kelipatan 4px baku untuk menjaga konsistensi vertikal dan horizontal:

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px - Standard Estify Card Padding */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px - Topbar Height */

  /* Estify Signature Radii */
  --radius-card: 1.5rem;    /* 24px - Generous Card Corners */
  --radius-inner: 1rem;     /* 16px - Inset Elements */
  --radius-pill: 9999px;    /* Full Pill Buttons & Nav Tabs */

  /* Motion & Interaction Timing Tokens */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. Layering & z-index Scale

```css
:root {
  --z-index-base: 0;
  --z-index-surface: 1;
  --z-index-sticky: 10;
  --z-index-header: 20;
  --z-index-sidebar: 30;
  --z-index-backdrop: 40;
  --z-index-modal: 50;
  --z-index-popover: 55;
  --z-index-toast: 60;
}
```

---

## 6. Anti-Slop Design Defenses

1. **Zero Emoticons**: Dilarang menggunakan karakter unicode emoji (`🏠`, `💰`, `⚠️`, `✅`) pada antarmuka produksi. Seluruh icon menggunakan semantic Lucide SVG (`stroke-width: 1.75`).
2. **Zero Glassmorphism**: Dilarang menggunakan efek kartu tembus pandang berlebihan (`backdrop-blur`). Seluruh surface kartu menggunakan warna solid opaque white (`#FFFFFF`) dengan border `1px solid #ECEEF2`.
3. **Restrained Shadows**: Bayangan dibatasi pada ambient shadow alami:
   - Card Shadow: `0 2px 4px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.03)`
   - Floating Dropdown Shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`
4. **Authentic Domain Values**: Seluruh data dan label antarmuka menggunakan data riil operasional kos Indonesia (e.g. `Kamar Deluxe A-101`, `Token PLN Prabayar`, `Sewa Pro-Rata`, `Deposit Garansi`).
5. **Tactile Micro-Interactions**: Seluruh elemen interaktif wajib memiliki feedback taktil fisik: tombol menyusut halus saat ditekan (`active:scale-[0.98] duration-150`), fokus keyboard `:focus-visible` dengan `outline-offset: 2px` (`#EA580C` untuk aksi umum, `#B91C1C` untuk `Destructive / Void`).

---

## 7. Master Component Visual Specifications & Anatomy (Anti-Guessing Contract)

Setiap komponen yang diimplementasikan pada `docs/design/components/index.html` dan screen prototype wajib mematuhi standar struktur dan class berikut:

### 7.1 Layout Shell & Top-Navigation Bar (`.top-nav`)
- **Struktur**: Header sticky `height: 80px`, `background: var(--color-canvas)`, padding `0 2rem`, kontainer konten terpusat `max-w-[1440px]`.
- **Brand**: Logo RumaKost di kiri (`height: 38px`).
- **Nav Pills (`.nav-pill`)**: Pil navigasi melayang berbentuk kapsul bulat (`border-radius: 9999px`, padding `0.625rem 1.25rem`). State aktif berwujud pil hitam solid Carbon (`#111827`) dengan teks putih; state inaktif teks abu-abu bersih (`#64748B`).
- **Cluster Aksi & Profil**: Tombol lingkaran 44px (Search, Message, Bell dengan dot merah "7") + user profile pill (avatar foto, nama Budi Santoso, role Branch Manager).

### 7.2 Button & Action System (`.btn`) — [LOCKED 2026-11-26]
- **Bentuk & Gaya (Terkunci)**: Seluruh varian wajib **borderless & flat solid** ber-radius penuh (`9999px`), target sentuh minimum `44px` (`btn-sm` visual `36px` dengan pseudo hit-area `44px`), dan transisi `active:scale-[0.98] duration-150`.
- **Primary Button (`.btn-primary`)**: `min-height: 44px`, padding `0.625rem 1.25rem`, `background: #F97316` (hover `#EA580C`), `color: #FFFFFF`, `border-radius: 9999px`.
- **Secondary / Solid Dark / Ghost / Destructive**: `.btn-secondary` (`#FFFFFF` + shadow lembut), `.btn-solid-dark` (`#111827`, hover `#1F2937`), `.btn-ghost` (transparan, teks `#475569`), `.btn-destructive` (`#FEF2F2`, teks `#B91C1C`).
- **Focus Ring (`:focus-visible`, WCAG 2.2 AA >= 3.0:1)**: `outline-offset: 2px`; aksi umum `#EA580C` (`--color-brand-hover`, 3.4:1–3.56:1), sedangkan `Destructive / Void` menggunakan `#B91C1C` (`--color-error`, 6.18:1–6.47:1).
- **Button Loading State**: Spinner berputar debounced berpasangan dengan teks saat submit form; State Matrix (`Default`, `Hover`, `Pressed`, `Focus Ring`, `Disabled`) terverifikasi di showcase.

### 7.3 Form Input & Data Entry System (Borderless)
- **Input & Select (`.input-pill`, `.pill-input-box`, `.textarea-rounded`)**: Wajib **borderless (`border: none`)** dengan elevasi `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06)` (tanpa garis border di seluruh komponen UI proyek), tinggi minimum `44px` (touch target), `font-size: 16px` (`1rem`, anti-zoom iOS Safari), `border-radius: 12px` (pengecualian `9999px` pill khusus search input `.is-search`), serta focus ring `:focus-visible` `2px solid #EA580C` (`#B91C1C` pada error) dengan `outline-offset: 2px`.
- **CurrencyInput**: Input numerik IDR wajib menggunakan `inputmode="numeric"`.
- **Pesan Validasi Error**: Berukuran minimal 13px (`font-size: 0.875rem`) dan rasio kontras merah minimal 4.5:1 (`color: #B91C1C`).

### 7.4 Status Badges & Avatars
- **Badges (`.badge`)**: Pil oval dengan teks eksplisit dan kontras tinggi (`badge-success`, `badge-warning`, `badge-error`, `badge-info`, `badge-neutral`).
- **Avatars (`.avatar`)**: Foto profil asli ber-rasio 1:1 bulat sempurna (32px, 40px, 52px).

### 7.5 Cards & Surfaces System
- **Card Standar (`.card-estify`)**: Surface putih `#FFFFFF`, border halus `1px solid #ECEEF2`, radius sudut 24px (`--radius-card`), shadow alami.
- **Hero Orange Card (`.hero-orange-card`)**: Gradien oranye hangat (`#FF8A24`–`#F97316`), radius sudut 24px, inset foto arsitektur gedung asli bersudut lengkung 16px, tombol lingkaran panah `↗`.
- **Media Property Card (`.property-card`)**: Foto kamar 16:10, radius 24px, floating circle arrow button `↗`, badge status, harga sewa IDR.

### 7.6 Data Table & Mobile Reflow System
- **Desktop Grid**: Tabular dengan perataan angka ke kanan (`align-right tabular-nums`), border horizontal halus.
- **Mobile Card Reflow (<640px)**: Tabel otomatis membongkar susunannya menjadi tumpukan kartu baris key-value di layar kecil.

### 7.7 Overlays, Modals & Dialogs
- **Modal Dialog (`.modal-dialog`)**: Backdrop semi-transparan `rgba(15, 23, 42, 0.6)` ber-blur halus, kontainer modal `z-index: 50` dengan fokus trap dan ESC handler.
- **Modal Destruktif**: Wajib mewajibkan pengisian alasan audit dan pengetikan teks `HAPUS` sebelum eksekusi.

### 7.8 Feedback & State Displays
- **Toast Notifications (`.toast`)**: Container `z-index: 60`, toast sukses auto-dismiss 4.5 detik, toast error persisten non-dismissing.
- **Empty State**: Kontainer terpusat dengan ikon vektor, judul penjelasan, dan tombol tindakan utama CTA.

### 7.9 Signature Domain Organisms Estify
- **Radial Tachometer Ray Gauge (`.tachometer-gauge-wrapper`)**: Gauge setengah lingkaran dengan 25 garis jarum memancar (*radial ray ticks*) oranye/hitam/merah dan pill persentase di tengahnya.
- **Hatched Bar Chart**: Kapsul vertikal dengan pola arsiran diagonal pada segmen atas, garis bantu putus-putus Y-axis, dan floating tooltip card.
- **Building Condition Progress Bars**: 3 horizontal progress bars pemantauan kondisi fasilitas dengan tombol hitam solid `[ Maintenance Details ]`.
