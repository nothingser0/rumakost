# Design Reference Analysis: Rumakost

> Extract visual patterns from reference screenshots saved in this folder.
> **Purpose**: Guide AI/Prototype to generate components matching reference style, not generic templates.

---

## Screenshot Inventory

### Screenshot 1: 01-dashboard-flat.png
**Source**: Estify Dashboard UI — Flat Desktop Production Screenshot (Behance)  
**Focus**: Layout shell architecture, top navigation bar, radial tachometer gauges, split 2-column grid, property photo cards

**Observations**:
- **Colors**:
  - Primary Brand Accent: `#F97316` (Warm Orange) & `#FF8A24` (Gradient Start)
  - Dark Neutral: `#111827` (Carbon Black for active pill tabs, solid dark buttons, and typography)
  - Canvas Neutral: `#F4F5F7` (Soft calming light grey canvas)
  - Card Surface: `#FFFFFF` (Pure white card background)
  - Borders: `#ECEEF2` (Subtle 1px contour)
  - Status Accents: `#15803D` (Success green), `#E11D48` (Revenue crimson/red-orange)
- **Typography**:
  - Headings: Poppins Medium / Bold, clean geometric tracking
  - Body: 16px, highly legible sans-serif
  - Numerals: Tabular digits on all metrics, currency, and timestamps
- **Spacing**:
  - Card Padding: 24px–28px (generous whitespace)
  - Grid Gaps: 24px between main cards
  - Topbar Height: 80px
- **Borders & Radii**:
  - Card Corner Radius: 24px (`--radius-card`)
  - Nav Tabs & Badges: Pill shape (`border-radius: 9999px`)
  - Inset Photos: 16px (`--radius-inner`)
- **Layout Architecture**:
  - Archetype: **Top-Navigation Bar** (Zero dark left sidebar)
  - Master Grid: 2-Column Structure (Left ~72% vs Right ~28%)
    - Left Column: KPI Row (3 cards) ➔ Mid Subgrid (Bar chart + Orange hero card) ➔ My Properties Gallery
    - Right Column (Top to Bottom): Building Condition Card ➔ Message List Card
- **Component DNA & Micro-Patterns**:
  - Radial Gauges: 25-tick radiating speedometer lines with center pill percentage (`+12% ↑`, `+15% ↑`, `+40% ↑`)
  - Bar Chart: Rounded vertical capsule bars with diagonal hatched/striped top segments, Y-axis guidelines (10..50), and floating tooltip card
  - Action Density: Exactly 1 solid dark pill button per widget
  - Avatar Craft: Circular photo avatars with unread notification counter badge
  - Photography: 16:10 real architecture photography with floating circle arrow button `↗`

---

### Screenshot 2: 02-dashboard-perspective.png
**Source**: Estify Real Estate Dashboard — Monitor Perspective Mockup (Behance)  
**Focus**: Presentation context, overall ambient shadow, depth, bezel proportions

**Observations**:
- Displays the complete desktop dashboard rendered on an ultra-slim monitor, validating that the 2-column layout and soft grey canvas `#F4F5F7` create a calm, premium visual atmosphere without clutter.

---

### Screenshot 3: 03-mobile-view.png
**Source**: Estify Mobile View — iPhone Screen Mockup  
**Focus**: Mobile responsive behavior, card stacking, topbar collapse, horizontal swipe

**Observations**:
- **Mobile Header**: Collapsed cleanly — Logo on the left, Search circle button + Bell notification circle button on the right. Floating pill tabs are hidden on mobile screens.
- **KPI Cards on Mobile**: Reflows from 3-column desktop grid into a **horizontal swipeable carousel card row** (`Active Properties`, `New Leads`).
- **Hero Card on Mobile**: `Best Apartments - Sunset Valley` becomes a **full-width card** with the architecture photo prominently displayed.
- **Bar Chart on Mobile**: Stacks vertically below the hero card, maintaining the capsule pill shape and hatched diagonal stripes.

---

### Screenshot 4: 04-typography-sheet.png
**Source**: Estify Typography Specification Sheet  
**Focus**: Typeface pairing, scale hierarchy, line heights, font weights

**Observations**:
- **Typeface**: `Poppins`, sans-serif (Weights: Light, Regular, Medium, Bold)
- **Scale Hierarchy**:
  - Heading Display: 32px (Bold / Medium)
  - Subheading Title: 24px (Medium)
  - Body Text: 16px (Regular / Light)
  - Caption / Subtext: 12px–14px
- **Spacing & Whitespace**: Generous line-height (`1.3` to `1.5`), airy layout, pill badge indicators (`Font`, `Aa`)

---

### Screenshot 5: 05-logo-style.png
**Source**: Estify Logo Style Guide  
**Focus**: Brand mark geometry, wordmark weight, optical kerning, proportion

**Observations**:
- **Geometry**: Modern geometric icon mark with clean rounded diagonal cuts.
- **Wordmark Typography**: Set in a clean, elegant **Medium weight** geometric sans-serif (not overly heavy/boxy) with natural, balanced letter tracking.
- **Optical Balance**: Wordmark height optically aligns with the vertical bounds of the icon mark, producing a balanced horizontal lockup.

---

## Benchmark Selection & Logo Alignment (Decision Gate)

### 1. Selected Primary Benchmark ("Paling OK")
- **Winning Reference**: `01-dashboard-flat.png` (Desktop) & `03-mobile-view.png` (Mobile)
- **Why Selected**: Menghadirkan visual DNA kontemporer untuk manajemen properti—menolak sidebar hitam konvensional demi **Top-Navigation Bar**, kanvas abu-abu lembut (`#F4F5F7`), kartu putih sudut lapang (24px), radial tachometer gauges, dan arsitektur 2-kolom utuh.
- **Harmonisasi Tipografi**: Dipadukan dengan `04-typography-sheet.png` untuk hierarki teks Poppins (32px / 24px / 16px).
- **Dynamic Effects (Stated by Human)**: Efek interaksi bersih dan terukur (*clean effects*): hover transisi 150ms, active scale 0.98, cincin fokus keyboard kontras, dan modal backdrop blur halus tanpa animasi berlebihan.

### 2. Logo Palette Alignment
- **Brand Logo Source**: `05-logo-style.png` (Logo style benchmark) + RumaKost "Kunci Rumah" Vector
- **Logo Core Hex**: `#F97316` (Primary Warm Orange) / `#000000` (Pure Black Wordmark)
- **Harmonization Strategy**:
  - [x] Mempertahankan layout top-navigation dan densitas 2-kolom Estify.
  - [x] Menyelaraskan aksen oranye Estify dengan core hex logo RumaKost (`#F97316`).
  - [x] Mengadopsi teks logo Pure Black (`#000000`) dan token tombol hitam murni global.

### 3. Layout Shell Architecture Contract (MANDATORY)
- **Shell Archetype**: **Top-Navigation Bar** (`--layout-shell: top-nav`)
- **Header Specifications**: Height `80px`, Max Container Width `1440px`, Background Tone `#F4F5F7`, Sticky `top: 0`
- **Canvas / Viewport Background**: `#F4F5F7` (Soft Estify Grey)
- **Hallucination Prevention Rule**: Karena benchmark utama menggunakan **Top-Navigation Bar**, pembuatan sidebar kiri kaku dilarang keras sebagai visual hallucination. Seluruh screen prototype wajib setia pada layout shell top-nav ini.

### 4. Benchmark Signature Components (MANDATORY PORTING CONTRACT)

| # | Signature Organism Name | Anatomy & Visual Traits Observed | Target Role / Screen |
|:-:|:------------------------|:---------------------------------|:---------------------|
| 1 | `RadialTachometerGauge` | Semi-circular radial ray ticks (25 lines) with percentage center badge (`+12%`, `+15%`, `+40%`) | Tenant & Staff KPI Cards (`SCR-006`, `SCR-014`) |
| 2 | `HeroOrangePropertyCard` | Banner card gradien oranye hangat (`#FF8A24`–`#F97316`) dengan foto gedung arsitektur asli, metrik okupansi, dan circle arrow button `↗` | Staff & Owner Dashboard (`SCR-014`, `SCR-037`) |
| 3 | `PillNavGroup` | Bilah navigasi melayang berbentuk pil bulat penuh dengan state aktif hitam solid Carbon (`#111827`) | Topbar Header (Seluruh Screen) |
| 4 | `HatchedBarChart` | Grafik batang vertikal berpola kapsul bulat dengan arsiran diagonal (*hatched stripes*) pada segmen atas dan floating tooltip | Branch Occupancy & Finance (`SCR-015`, `SCR-032`) |
| 5 | `BuildingConditionMeters` | Tiga progress bar horizontal bertahap pemantauan kondisi fasilitas dengan tombol pil hitam solid `[ Maintenance Details ]` | Caretaker & SLA Ticketing (`SCR-024`, `SCR-010`) |
| 6 | `MessageContactWidget` | Daftar baris kontak dengan foto avatar bulat, nama, cuplikan pesan, waktu relatif, dan badge unread counter merah | Widget Komunikasi Penghuni & Caretaker (`SCR-011`, `SCR-025`) |

---

## Extracted Common Patterns

### Colors

**Primary Brand Color**: `#F97316` (Warm Orange dari Kunci Rumah & Aksen Estify)  
**Secondary/Accent**: `#FF8A24` (Oranye cerah untuk gradien hero card)

**Neutral Scale**:
```
Canvas Background: #F4F5F7 (Soft Estify grey, bukan harsh pure white)
Card Surface: #FFFFFF (Pure white cards)
Card Border: #ECEEF2 (Subtle 1px contour)
Interactive Border: #CBD5E1 (Slate 300)
Muted text: #64748B (Slate 500, kontras 4.6:1 pada putih)
Primary text: #111827 (Carbon Black, kontras 17.2:1 pada putih)
```

**Semantic Colors**:
```
Success: #15803D (Green 700, kontras 5.1:1 pada #F0FDF4)
Error: #B91C1C (Red 700, kontras 5.4:1 pada #FEF2F2)
Warning: #B45309 (Amber 700, kontras 4.8:1 pada #FFFBEB)
Info: #1D4ED8 (Blue 700, kontras 5.6:1 pada #EFF6FF)
```

**Rationale**: Palet warna mengawinkan kehangatan keramahan kos Indonesia (`#F97316`) dengan ketegasan operasional enterprise Estify (`#111827`), memenuhi standar keterbacaan WCAG AA tanpa silau optis.

---

### Typography

**Font Family**: `Poppins`, sans-serif  
**Source**: Google Fonts  
**Weights Used**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)  
**Weights NOT Used**: 100, 200, 900 (menghindari visual noise)

**Type Scale**:
```
H1 (Heading Display): 32px / line-height 40px (1.25) / weight 700
H2 (Subheading Title): 24px / line-height 32px (1.33) / weight 600
H3 (Card Header): 18px / line-height 26px (1.44) / weight 600
Body: 16px / line-height 24px (1.5) / weight 400–500
Small / Caption: 12px–14px / line-height 18px / weight 400–500
Tabular: Seluruh angka uang, meteran, dan tanggal wajib 'tabular-nums'
```

---

### Spacing & Layout

**Grid System**: Skala kelipatan 4px baku (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`, `80px`)

**Common Padding**:
- Buttons: `10px` vertikal × `20px` horizontal (Pill shape)
- Cards: `24px`–`28px` (generous padding)
- Topbar: `80px` height, `32px` horizontal padding
- Input fields: `12px` vertikal × `16px` horizontal (tinggi min 44px)

**Layout Constraints**:
- Max content width: `1440px` terpusat
- Master Grid Desktop: 2-Kolom (`1fr 340px`, gap `24px`)
- Mobile Grid: 1-Kolom tumpuk, KPI kartu horizontal swipeable, topbar collapse

**Touch Targets**: Minimum 44×44px pada seluruh kontrol interaktif layar sentuh

---

### Borders, Corners & Shadows

**Border Width**: `1px` solid  
**Border Color**: `#ECEEF2` untuk kartu, `#CBD5E1` untuk input formulir  

**Corner Radius**:
```
Buttons & Nav Tabs: 9999px (Pill shape penuh)
Cards: 24px (--radius-card)
Inset Photos: 16px (--radius-inner)
Input Fields: 12px (--radius-md)
```

**Shadow Values**:
```css
/* Card Ambient Shadow */
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.03);

/* Dropdown & Popover Floating Shadow */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
```

---

### Animation & Motion

**Transition Speed**: Fast `150ms` (hover & click), Normal `250ms` (modal fade-in)  
**Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`  

**Micro-Interactions**:
- Button Hover: Brightness naik halus `duration-150`
- Button Active: Menyusut taktil `scale-[0.98]`
- Card Hover: Sedikit melayang `translate-y-[-4px]` dengan transisi `shadow-md`
- Focus State: Cincin fokus oranye terlihat `focus-visible:ring-2 ring-primary ring-offset-2`
