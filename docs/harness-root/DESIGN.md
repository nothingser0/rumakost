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
- ✅ **VERIFIED (Observed)**: Top Navigation Bar dengan floating pill tabs ber-state hitam solid Pure Black (`#000000`), soft canvas grey (`#F4F5F7`), white cards ber-radius 24px, dan circular profile cluster diamati langsung pada `01-dashboard-flat.png`.
- ✅ **VERIFIED (Observed)**: Semi-circular tachometer radial gauges (25 ticks), orange hero featured property card (`#FF8A24` - `#F97316`), vertical rounded pill bar chart dengan arsiran diagonal, widget building condition progress bars, dan message list diamati langsung pada `01-dashboard-flat.png`.
- ✅ **VERIFIED (Observed)**: Mobile responsive behavior dengan topbar collapse, horizontal swipeable cards, dan full-width hero card diamati langsung pada `03-mobile-view.png`.
- ✅ **VERIFIED (Observed)**: Font Poppins (32px Heading, 24px Subheading, 16px Body) dengan whitespace lapang diamati langsung pada `04-typography-sheet.png`.
- ✅ **VERIFIED (Observed)**: Logo mark geometris dan wordmark berbobot Medium dengan kerning elegan diamati langsung pada `05-logo-style.png`.
- 🔶 **INFERRED**: Hybrid Pure 4-Color Status Palette (`#C2410C` / `#FFF7ED` & `#334155` / `#F1F5F9` & `#B91C1C` / `#FEF2F2` soft tint untuk badge status — termasuk status di atas foto `.badge-sm.badge-on-photo` — agar tidak bersaing dengan CTA solid `CMP-01`; serta solid `#000000`/`#FFFFFF` pada `badge-dark`, `#FFFFFF`/`#000000` pada `badge-overlay` untuk tag media foto non-status, dan solid `#B91C1C`/`#000000`/`#C2410C` pada `.badge-counter`) memenuhi WCAG AA >= 4.5:1 tanpa warna hijau/kuning/biru di luar palet merek.
- 🔶 **INFERRED**: Skala z-index bertingkat (Base 0 hingga Toast 60) diturunkan untuk menjamin keterpisahan modal dialog dan popover dropdown.

---

## 1. Color Palette & WCAG AA Contrast Matrix

| Color Token Name | Hex Code | Background Sample | Contrast Ratio | Conformance Role Target |
|:---|:---:|:---:|:---:|:---|
| Primary Text Body | `#000000` | `#FFFFFF` (Surface) | 21.0:1 | Primary Body Text (>= 7.0:1) |
| Heading Display Dark | `#000000` | `#F4F5F7` (Canvas) | 19.3:1 | Primary Heading Text (>= 7.0:1) |
| Secondary Text Muted | `#475569` | `#FFFFFF` (Surface) | 5.8:1 | Secondary Label (>= 4.5:1) |
| Placeholder Field Text | `#64748B` | `#FFFFFF` (Surface) | 4.6:1 | Input Placeholder (>= 4.5:1) |
| Brand Status Badge Label | `#C2410C` | `#FFF7ED` (Pill Bg) | 4.88:1 | Positive, Active & Locked Status (>= 4.5:1) |
| Neutral Status Badge Label | `#334155` | `#F1F5F9` (Pill Bg) | 9.45:1 | Queue, Draft & Standard Process (>= 4.5:1) |
| Pure Black Dark / Counter Label | `#FFFFFF` | `#000000` (Solid Bg) | 21.0:1 | Occupied, Counter & High Priority (>= 7.0:1) |
| Solid Urgent / Error Counter | `#FFFFFF` | `#B91C1C` (Solid Pill) | 6.47:1 | Urgent Numeric Counter Badge (>= 4.5:1) |
| Error Status & Input Label | `#B91C1C` | `#FEF2F2` (Tint Bg) | 5.91:1 | Overdue Badge & Input Error Message (>= 4.5:1) |
| Control Border (Checkbox/Radio) | `#CBD5E1` | `#FFFFFF` (Surface) | 3.2:1 | UI Control Border & Divider (>= 3.0:1; input formulir borderless sesuai §7.3) |

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

1. **Zero Emoticons**: Dilarang menggunakan karakter unicode emoji (`🏠`, `💰`, `⚠️`, `✅`) pada antarmuka produksi. Seluruh icon menggunakan semantic Lucide SVG (`stroke-width: 1.75` untuk `20–32px`, `2.0` untuk `12–16px`).
2. **Zero Glassmorphism & 100% Borderless**: Dilarang menggunakan efek kartu tembus pandang (`backdrop-blur`) maupun garis border CSS pada komponen UI. Seluruh kartu standar memakai solid opaque white `#FFFFFF` (`border: none`) datar langsung di atas kanvas `#F4F5F7` (`--color-canvas`), tanpa pola latar titik-titik berulang.
3. **Restrained Shadows & Zero Hover Shadow**: Seluruh komponen dan kartu standar (`CMP-01` s/d `CMP-26`) menggunakan permukaan datar **tanpa drop shadow kartu dan tanpa penambahan `box-shadow` pada `:hover`** (*Zero Hover Shadow*). Bayangan dibatasi ketat hanya untuk:
   - Pemisahan elemen putih datar di atas permukaan putih/berwarna (`.btn-secondary`, `.input-pill`, `.action-circle-btn`, `.kivo-copy-btn`, `.badge-on-photo`, `.hero-orange-white-sheet`, `.room-tile-thumb`): `0 1px 3px rgba(0, 0, 0, 0.06)`–`0 2px 6px rgba(0, 0, 0, 0.06)`.
   - Lapisan mengambang / *floating overlays* (`.select-popover`, `.popover-menu`, modal, toast): `0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)` (`--shadow-dropdown`).
   - Garis pemisah hairline internal memakai `box-shadow: inset ...` tanpa properti CSS `border`.
4. **Authentic Domain Values**: Seluruh data dan label antarmuka menggunakan data riil operasional kos Indonesia (e.g. `Kamar Deluxe A-101`, `Token PLN Prabayar`, `Sewa Pro-Rata`, `Deposit Garansi`).
5. **Tactile Micro-Interactions (Zero Hover Translate & Zero Hover Shadow)**: Feedback `:hover` pada kartu dan kontrol interaktif wajib dinyatakan secara seragam melalui **pergeseran tint permukaan (*flat surface tint shift*)** dan penguatan indikator aksi internal (`Zero Hover Translate`, tanpa `translateY` dan tanpa hover `box-shadow`). Tombol taktil menyusut halus saat ditekan (`active:scale-[0.98] duration-150`), dan fokus keyboard `:focus-visible` memakai `outline-offset: 2px` (`#EA580C` untuk aksi umum, `#B91C1C` untuk `Destructive / Void`).
6. **White-on-Orange Brand Consistency**: Seluruh CTA primary (`.btn-primary`), tombol aksi oranye di dalam kartu, pill sorotan oranye (`.card-bento-pill.is-brand`), ikon brand, dan kartu hero oranye (`CMP-21`) konsisten memakai **teks & ikon `#FFFFFF` di atas Brand Orange `#F97316`** (hover `#EA580C`), selaras dengan logo RumaKost dan kontrak terkunci `CMP-01`.

---

## 7. Master Component Visual Specifications & Anatomy (Anti-Guessing Contract)

Setiap komponen yang diimplementasikan pada `docs/design/components/index.html` dan screen prototype wajib mematuhi standar struktur dan class berikut:

### 7.1 Layout Shell & Top-Navigation Bar (`.top-nav`)
- **Struktur**: Header sticky `height: 80px`, `background: var(--color-canvas)`, padding `0 2rem`, kontainer konten terpusat `max-w-[1440px]`.
- **Brand**: Logo RumaKost di kiri (`height: 38px`).
- **Nav Pills (`.nav-pill`)**: Pil navigasi melayang berbentuk kapsul bulat (`border-radius: 9999px`, padding `0.625rem 1.25rem`). State aktif berwujud pil hitam solid Pure Black (`#000000`) dengan teks putih; state inaktif teks abu-abu bersih (`#64748B`).
- **Cluster Aksi & Profil**: Tombol lingkaran 44px (Search, Message, Bell dengan dot merah "7") + user profile pill (avatar foto, nama Budi Santoso, role Branch Manager).

### 7.2 Button & Action System (`.btn`) — [LOCKED 2026-11-26]
- **Bentuk & Gaya (Terkunci)**: Seluruh varian wajib **borderless & flat solid** ber-radius penuh (`9999px`), target sentuh minimum `44px` (`btn-sm` visual `36px` dengan pseudo hit-area `44px`), dan transisi `active:scale-[0.98] duration-150`.
- **Primary Button (`.btn-primary`)**: `min-height: 44px`, padding `0.625rem 1.25rem`, `background: #F97316` (hover `#EA580C`), `color: #FFFFFF`, `border-radius: 9999px`.
- **Secondary / Solid Dark / Ghost / Destructive**: `.btn-secondary` (`#FFFFFF` + shadow lembut), `.btn-solid-dark` (`#000000`, hover `#262626`), `.btn-ghost` (transparan, teks `#475569`), `.btn-destructive` (`#FEF2F2`, teks `#B91C1C`).
- **Focus Ring (`:focus-visible`, WCAG 2.2 AA >= 3.0:1)**: `outline-offset: 2px`; aksi umum `#EA580C` (`--color-brand-hover`, 3.4:1–3.56:1), sedangkan `Destructive / Void` menggunakan `#B91C1C` (`--color-error`, 6.18:1–6.47:1).
- **Button Loading State**: Spinner berputar debounced berpasangan dengan teks saat submit form; State Matrix (`Default`, `Hover`, `Pressed`, `Focus Ring`, `Disabled`) terverifikasi di showcase.

### 7.3 Form Input & Data Entry System (Borderless) — [LOCKED 2026-11-27]
- **Input & Select (`.input-pill`, `.pill-input-box`, `.textarea-rounded`, `.number-stepper`, `.compact-file-upload`, `.dropzone-card`)**: Wajib **borderless (`border: none`)** dengan elevasi `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06)` (tanpa garis border di seluruh komponen UI proyek), tinggi minimum `44px` (touch target; `.input-pill-sm` `36px`/`13px` di desktop otomatis membesar menjadi `44px`/`16px` pada perangkat sentuh primer `hover: none` & `pointer: coarse` atau viewport `<= 768px`), skala font selaras `CMP-01` & label (`14px` / `0.875rem` Default desktop, `16px` / `1rem` Large `.input-pill-lg` serta otomatis `16px` untuk seluruh input & textarea pada perangkat sentuh primer / mobile `<= 768px` anti-zoom iOS Safari), `border-radius: 12px` (pengecualian `9999px` pill khusus search input `.is-search` dan `24px` untuk `.dropzone-card`), serta focus ring `:focus-visible` `2px solid #EA580C` (`#B91C1C` pada error) dengan `outline-offset: 2px`.
- **CurrencyInput**: Input numerik IDR wajib menggunakan `inputmode="numeric"`.
- **Pesan Validasi Error**: Berukuran minimal 13px (`font-size: 0.875rem`) dan rasio kontras merah minimal 4.5:1 (`color: #B91C1C`).

### 7.3B Select & PopoverMenu System (`CMP-04` — Borderless) — [LOCKED 2026-11-27]
- **Zero Raw Native Select**: Seluruh pemilihan dropdown dan menu aksi wajib memakai kontainer kustom **100% borderless (`border: none`)** dalam tiga varian: Form Select (`.select-trigger`, radius `12px`, tinggi `44px`, `14px` desktop / `16px` mobile-touch selaras `CMP-02`), Filter Pill Select (`.select-trigger.is-pill`, radius `9999px`, tinggi visual `38px` dengan pseudo hit-area `44px`, varian `#FFFFFF` dan `.is-subtle` `#F4F5F7`), serta Action PopoverMenu (`role="menu"` dipicu `.action-circle-btn` `44px` atau `.btn-secondary`).
- **Floating Popover (`.select-popover`, `.popover-menu`)**: Permukaan `#FFFFFF`, `border: none`, `border-radius: 16px` (`--radius-inner`), `box-shadow: var(--shadow-dropdown)`, adaptif terhadap tepi viewport (flip vertikal `is-open-up` & flip horizontal `is-flip-right` / `is-flip-left`).
- **Option & Menu Rows (`.select-option`, `.popover-menu-item`)**: Target sentuh `min-height: 44px`, ukuran font `14px` (`0.875rem`), status terpilih netral `#F4F5F7` + checkmark `#C2410C` (sub-teks `#475569` >= 4.5:1 WCAG AA), aksi destruktif `#B91C1C` pada `#FEF2F2`, serta navigasi keyboard WAI-ARIA penuh (`Arrow`, `Home`/`End`, `Enter`/`Space`, `Escape`, `Tab`, `focusout`, dan typeahead).

### 7.4 Status Badges & Avatars
- **Badges (`.badge` — `CMP-05` [LOCKED 2026-11-27], Hybrid Pure 4-Color & 100% Borderless)**: Pil oval `border: none` mengikuti palet ketat 4 warna dengan kontras WCAG 2.2 AA `>= 4.5:1`: status daftar/tabel memakai tint lembut agar tidak bersaing dengan tombol aksi `CMP-01` — `.badge-brand` (`#FFF7ED` / `#C2410C`, `4.88:1`), `.badge-neutral` (`#F1F5F9` / `#334155`, `9.45:1`), dan `.badge-error` / `.badge-destructive` (`#FEF2F2` / `#B91C1C`, `5.91:1`); sedangkan elemen penekanan tinggi tampil solid: `.badge-dark` (`#000000` / `#FFFFFF`, `21.0:1`), `.badge-overlay` (`#FFFFFF` / `#000000` + `box-shadow` borderless khusus tag media/foto non-status seperti `4 Foto`), serta `.badge-counter` solid (`#B91C1C`, `#000000`, `#C2410C`). Status unit di atas foto memakai varian semantik compact (`.badge-sm.badge-on-photo` / `.property-media-badge`) dengan shadow elevasi borderless yang sama. Mendukung `.badge-trend`, `.badge-dismissible` (ikon SVG `X`), serta hit-area `44px` (`::after`) dan `:focus-visible` (`2px solid #EA580C` / `#B91C1C` dan `#FFFFFF` di dalam `.badge-dark`).
- **Avatars (`.avatar` — `CMP-09` [LOCKED 2026-11-27], 100% Borderless & Pure 4-Color)**: Lingkaran 1:1 sempurna dalam skala `sm` (`32px`), `md` (`40px`), dan `lg` (`52px`), `border: none`, fallback inisial WCAG AA (`.avatar-initials-dark` `#000000`/`#FFFFFF` `21.0:1`, `.avatar-initials-brand` `#FFF7ED`/`#C2410C` `4.88:1`, `.avatar-initials-neutral` `#F1F5F9`/`#334155` `9.45:1`), tumpukan `.avatar-group` & counter `.avatar-counter` (`+N` `tabular-nums`, zero `translateY`), serta dot kehadiran `.avatar-status` (`is-online` `#EA580C` `3.56:1`, `is-away` `#64748B` `4.76:1`, `role="status"`) dengan ring cutout `box-shadow: 0 0 0 2px #FFFFFF`.

### 7.4B Boolean Controls System (`CMP-06` — Flat Borderless) — [LOCKED 2026-11-27]
- **100% Flat Borderless & Zero Hover Translate**: Seluruh kontrol boolean (`.custom-checkbox`, `.custom-radio`, `.btn-group.is-radio-pills`, `.choice-list`/`.choice-card`, `.toggle-switch`, `.settings-group`/`.settings-row`) menggunakan `border: none` tanpa drop shadow kartu maupun `translateY`, target sentuh minimum `44px` (termasuk `.toggle-slider::after` `44px` untuk sakelar standalone), serta cincin fokus `:focus-visible` tunggal (`#EA580C` normal, `#B91C1C` error, `outline-offset: 2px`).
- **Kontras & State Terkunci**: Aksen aktif/terpilih `#EA580C` (`3.56:1`, hover `#C2410C`) dengan indikator `#FFFFFF` solid; batas checkbox/radio idle `#64748B` (`4.76:1`), track switch OFF `#7E8B9D` (`3.16:1`–`3.46:1`), state terkunci `disabled:checked` radio/switch netral `#94A3B8` (tanpa penumpukan opacity pada switch).
- **Choice Card & Grouped Settings Panel**: `.choice-card` (duotone wireframe `.choice-visual` `68×48px` desktop / `52×38px` mobile) dan `.settings-group`/`.settings-row` menggunakan permukaan `#F8FAFC`, hover `#F1F5F9`, pilihan aktif `#FFF7ED`, divider hairline `inset 0 1px 0 #E2E8F0`, judul `14px` SemiBold, serta sub-teks `#475569` (`6.92:1`–`7.24:1` WCAG AA).

### 7.4C Loading Spinner System (`CMP-07` — Borderless) — [LOCKED 2026-11-27]
- **100% Borderless Sweep & Ukuran Atomik**: `.spinner` memakai pure CSS `conic-gradient` + `radial-gradient` cap + `mask` (`border: none`), rotasi `600ms linear infinite`, fallback lembut `spinnerPulse` (`1.8s ease-in-out infinite`) saat `@media (prefers-reduced-motion: reduce)`, serta 4 ukuran (`sm` `16px`, `md` `24px`, `lg` `32px`, `xl` `48px`).
- **Warna WCAG 2.2 AA & Integrasi UI**: Varian `brand` (`#EA580C` `3.56:1`), `white` (`#FFFFFF`), `neutral` (`#64748B` `4.76:1`), dan `dark` (`#000000`). Tombol loading (`.btn.is-loading`) memakai `cursor: wait`, guard anti-submit ganda, `aria-busy="true"`, dan spinner `aria-hidden="true"`; kontainer `.card-loading-state` memakai latar `#F8FAFC` flat borderless dengan teks `#475569` (`7.24:1`).

### 7.4D Semantic Iconography System (`CMP-08` — Borderless) — [LOCKED 2026-11-27]
- **Skala, Stroke & Aksesibilitas Lucide SVG**: Zero unicode emoji; skala baku `12px` (`xs`), `16px` (`sm`), `20px` (`md`), `24px` (`lg`), dan `32px` (`xl`) dengan `stroke-width: 2.0` (`12–16px`) dan `1.75` (`20–32px`), warna muted minimal `#64748B` (`4.55:1` di `#F8FAFC`), serta `aria-hidden="true"` pada SVG dekoratif.
- **Icon Box Pure 4-Color & Borderless**: `.icon-box` (`sm 36px`, `md 44px`, `lg 52px`) memakai `border: none` (`brand` `#FFF7ED`/`#C2410C` `4.88:1`, `neutral` `#F1F5F9`/`#334155` `9.45:1`, `error` `#FEF2F2`/`#B91C1C` `5.91:1`, `dark` `#000000`/`#FFFFFF` `21.0:1`), serta `.icon-count-badge` tanpa CSS border (`box-shadow: 0 0 0 1.5px #FFFFFF`).

### 7.4E FormField Wrapper & Validation System (`CMP-10` — Borderless) — [LOCKED 2026-11-27]
- **Anatomi & Aksesibilitas WAI-ARIA**: `.input-wrapper` menggabungkan Label (`14px` SemiBold `#334155`, tanda wajib `.required` `#C2410C` `5.18:1` / `4.75:1` `aria-hidden="true"`, penanda `.input-optional` `#475569`), kontrol `CMP-02/03/04/06` (`aria-required="true"` pada custom combobox/datepicker), pesan error (`14px` `#B91C1C`, ikon SVG `16px` `stroke-width="2"`, `role="alert"` pada error dinamis yang disisipkan sebelum `.input-hint` & diprioritaskan paling depan di `aria-describedby`), serta Hint (`12px` `#475569` `6.95:1` pada kanvas `#F4F5F7`).
- **Kanvas Ganda, Read-Only vs Disabled & Layout Horizontal**: Input putih `#FFFFFF` duduk di kanvas `#F4F5F7` (`.showcase-canvas.is-borderless`), sedangkan di dalam kartu/modal putih `.form-surface-white` memakai permukaan inset `#F4F5F7` (`#FFFFFF` saat fokus). State terkunci `.is-readonly` (`#F8FAFC` + inset ringan + `.input-readonly-tag`) tetap bisa difokuskan & disalin, berbeda dengan `:disabled` di atas kanvas `#F4F5F7` (`#E2E8F0` / `#334155` `8.40:1`). Layout pengaturan mendukung `.form-section-list` + `.form-field-row` (`1fr : 1.35fr` dengan hairline `inset 0 1px 0 #E2E8F0`, menumpuk `<= 768px`).
- **Siklus Validasi & SubmitButton Rule**: Tombol simpan tidak pernah dinonaktifkan saat pristine; mendukung validasi `blur` (nilai salah format/tersentuh), pemulihan langsung (`input`/`change`), banner `.form-error-summary`, pembersihan status lengkap pada `reset`, fokus otomatis ke kolom invalid pertama + error toast persisten, dan debounce spinner `.btn.is-loading`.

### 7.5 Cards & Surfaces System (Hierarki 3-Tier Surface)
- **Tier 1 — Card Standar Putih Datar (`.card-base`, `CMP-11` [Dalam Review])**: Seluruh kartu analitik, daftar antrean, penagihan, konten, otorisasi, serta galeri foto (`1.`–`3.`, `6.`–`9.`) wajib menggunakan permukaan putih murni `#FFFFFF` tanpa gradient (`box-shadow: none`, **100% borderless `border: none`**) di atas kanvas `#F4F5F7` bersih agar teks angka, badge status, dan foto tetap terjaga keterbacaannya (`21:1`); radius sudut `24px` (`--radius-card`) untuk kartu utama dan `20px` untuk tile/notice/resource, separator internal `box-shadow: inset 0 1px 0 #F1F5F9`.
- **Hover & Selection State (Konsistensi Sistem)**: Kartu interaktif (`.card-base.is-interactive`, `.room-tile`, `.property-card`) mematuhi **Zero Hover Shadow** (`box-shadow: none`) & **Zero Hover Translate** — feedback `:hover` hanya menggeser tint permukaan (`#FFFFFF → #F8FAFC` / tint semantik) dan menyalakan indikator panah internal. State `.is-selected` memakai cincin borderless `box-shadow: 0 0 0 2px #F97316` di atas `#FFFBF7`.
- **Tier 2 — Room Status Tile Gradient Semantik (Eksklusif `4.`)**: Khusus `4. Room Status Tile` (`SCR-015`, `SCR-041`) menggunakan gradasi permukaan semantik tipis (`#FFFFFF` → `#FFF7ED` / `#FEF2F2` / `#F8FAFC`) plus thumbnail `48×48px` untuk identifikasi cepat keterisian kamar; varian kartu operasional lainnya (`1A`–`1C`, `2A`–`2B`, `3A`–`3B`, `7.`–`9.`) tetap menggunakan Tier 1 putih datar.
- **Tier 3 — Hero Atmospheric Gradient Showcase (`.hero-pop-card` & `.hero-orange-kivo`, `CMP-21`)**: Eksklusif untuk kartu sorotan utama dashboard (`5A`/`5B`): **`5A`** memakai langit gradien senja lembut `#FFFBF7`–`#FFF7ED`–`#FFEDD5` berhias siluet awan `.hero-pop-sky-clouds`, badge `CMP-05` `Okupansi 96%`, chip metrik putih `.hero-pop-kpi` (`24px` bold + badge tren `#FFF7ED`/`#C2410C`), panggung gradien oranye `#FF8A24`–`#EA580C` bersudut lengkung `40px` + render cutout `assets/images/hero-kost-building.png`, stack avatar `CMP-09`, CTA `.btn.btn-solid-dark.hero-pop-cta` (`CMP-01`), & indikator titik cabang `.hero-pop-dots`; **`5B`** memakai gradien senada berhias `.hero-orange-clouds`, badge `Mode Aman`, chip simulasi `.hero-sim-chips`, & floating `#FFFFFF` sheet bertombol `CMP-01` (`.btn.btn-primary`).
- **Media Property Card (`.property-card`, `CMP-24`)**: Tetap menggunakan Tier 1 `#FFFFFF` datar tanpa gradient kartu agar foto kamar `16:10` (radius `16px`, borderless) tidak bersaing secara visual, dengan badge & panah bulat melayang (`.badge-on-photo`, `.circle-arrow-btn.on-photo`), **Zero Hover Shadow**, serta harga sewa IDR `tabular-nums`.

### 7.6 Data Table & Mobile Reflow System
- **Desktop Grid**: Tabular dengan perataan angka ke kanan (`align-right tabular-nums`), border horizontal halus.
- **Mobile Card Reflow (<640px)**: Tabel otomatis membongkar susunannya menjadi tumpukan kartu baris key-value di layar kecil.

### 7.7 Overlays, Modals & Dialogs
- **Modal Dialog (`.modal-dialog`)**: Backdrop semi-transparan `rgba(0, 0, 0, 0.45)` ber-blur halus, kontainer modal `z-index: 50` dengan fokus trap dan ESC handler.
- **Modal Destruktif**: Wajib mewajibkan pengisian alasan audit dan pengetikan teks `HAPUS` sebelum eksekusi.

### 7.8 Feedback & State Displays
- **Toast Notifications (`.toast`)**: Container `z-index: 60`, toast sukses auto-dismiss 4.5 detik, toast error persisten non-dismissing.
- **Empty State**: Kontainer terpusat dengan ikon vektor, judul penjelasan, dan tombol tindakan utama CTA.

### 7.9 Signature Domain Organisms Estify
- **Radial Tachometer Ray Gauge (`.tachometer-gauge-wrapper`)**: Gauge setengah lingkaran dengan 25 garis jarum memancar (*radial ray ticks*) oranye/hitam/merah dan pill persentase di tengahnya.
- **Hatched Bar Chart**: Kapsul vertikal dengan pola arsiran diagonal pada segmen atas, garis bantu putus-putus Y-axis, dan floating tooltip card.
- **Building Condition Progress Bars**: 3 horizontal progress bars pemantauan kondisi fasilitas dengan tombol hitam solid `[ Maintenance Details ]`.
