# DESIGN — RumaKost (Sistem Manajemen Kost Mandiri)

> Dokumen acuan desain tunggal (Single Source of Truth) untuk fase M04 UI/UX & Prototyping dan M06 Development Execution.
> Disusun berdasarkan bedah visual komprehensif referensi **Estify (Behance)** yang telah disepakati pemilik pada 2026-10-22.

---

## 1. Identitas Brand & Logo

| Aset | Path / Nilai | Keterangan |
|---|---|---|
| Ikon Utama | `docs/design/brand/rumakost-icon.svg` | Bentuk kepala kunci menyerupai rumah + lubang kunci oranye + stem & 2 gerigi kunci. |
| Logo Lengkap | `docs/design/brand/rumakost-logo.svg` | Ikon + wordmark **Ruma** (`#111111`) **Kost** (`#F97316` / `#FF7A00`). |
| Filosofi | *Kunci Rumah* | Simbol akses, keamanan, rasa kepemilikan, dan kenyamanan hunian kost mandiri. |
| Font Wordmark | **Poppins** (Bold 700) | Bersih, geometris, modern, dan seimbang dengan ikon. |

---

## 2. Palet Warna (Color System)

Diambil langsung dari palet curated Estify:

```css
:root {
  /* Warna Primer & Aksen */
  --color-primary:        #FF7A00;   /* Oranye khas Estify — aksen utama, highlight bar chart, kartu sorotan */
  --color-primary-hover:  #E66E00;   /* State hover/pressed oranye */
  --color-primary-soft:   #FFF7ED;   /* Latar belakang badge oranye lembut, kontainer ikon metrik */
  --color-secondary-bar:  #FDBA74;   /* Oranye peach/krem untuk batang perbandingan pada grafik */

  /* Warna Netral & Permukaan */
  --color-page-bg:        #F7F8FA;   /* Latar belakang kanvas aplikasi (light mode lembut) */
  --color-surface:        #FFFFFF;   /* Latar kartu, panel, dan modal */
  --color-topbar-bg:      #FFFFFF;   /* Latar top navigation bar */
  --color-border:         #ECEEF2;   /* Garis pemisah halus */
  --color-border-subtle:  #F3F4F6;   /* Gridlines chart dan divider kartu */

  /* Warna Kontras & Tombol Aksi */
  --color-black-pill:     #111111;   /* Tombol navigasi aktif, tombol CTA pemeliharaan/simpan */
  --color-black-hover:    #222222;   /* Hover state tombol hitam */

  /* Tipografi */
  --color-text-main:      #111111;   /* Judul besar, angka metrik, teks primer */
  --color-text-body:      #4B5563;   /* Navigasi non-aktif, isi tabel, body copy */
  --color-text-muted:     #9CA3AF;   /* Label kecil, caption, timestamp, ikon sekunder */

  /* Status Semantik */
  --color-success:        #16A34A;   /* Hijau status lunas, kamar terisi, tren naik */
  --color-success-bg:     #DCFCE7;
  --color-warning:        #D97706;   /* Kuning/amber tagihan jatuh tempo, pengingat */
  --color-warning-bg:     #FEF3C7;
  --color-danger:         #EF4444;   /* Merah tagihan terlambat, tiket mendesak, badge unread */
  --color-danger-bg:      #FEE2E2;
}
```

---

## 3. Tipografi — Poppins

Sesuai lembar spesifikasi Estify (`docs/design/inspiration/04-typography-sheet.png`):

| Tingkat | Ukuran (Font Size) | Bobot (Weight) | Jarak Garis (Line Height) | Penggunaan |
|---|---|---|---|---|
| **Display / Heading 1** | `32px` | Bold (700) | `40px` | Judul utama halaman autentikasi / overview |
| **Heading 2** | `24px` | SemiBold (600) | `32px` | Judul section utama, nama properti |
| **Heading 3** | `18px – 20px` | SemiBold (600) | `26px` | Judul kartu besar ("Property Type", "Best Apartments") |
| **Card Title / Sub** | `15px – 16px` | SemiBold (600) | `22px` | Judul kartu standar ("Building Condition", "Message") |
| **Big Numbers / Metric** | `24px – 28px` | Bold (700) | `1.1` | Angka nilai pada metric cards & highlight |
| **Body / Table Content** | `13px – 14px` | Regular (400) / Medium (500) | `20px` | Isi baris tabel, data penghuni, deskripsi |
| **Button / Nav Pill** | `13px` | SemiBold (600) | `16px` | Teks navigasi pill, tombol aksi |
| **Label / Subtext** | `11px – 12px` | Medium (500) | `16px` | Keterangan "This month", nama kolom tabel |
| **Caption / Badge** | `10px – 11px` | SemiBold (600) | `14px` | Indikator status, tanggal/jam singkat |

---

## 4. Bedah Arsitektur Komponen (Estify DNA)

### A. Top Navigation Bar
- **Posisi**: Sticky di atas (`top: 0`, `z-index: 100`, tinggi `64px`).
- **Latar**: Putih bersih (`#FFFFFF`) dengan border bawah sangat halus (`border-bottom: 1px solid #ECEEF2`).
- **Brand (Kiri)**: Ikon Kunci Rumah + teks "RumaKost".
- **Navigasi Utama (Tengah)**:
  - Menggunakan pil horizontal bergaya Estify:
  - **Item Aktif**: Pil hitam solid (`background: #111111; color: #FFFFFF; border-radius: 9999px; padding: 8px 22px; font-weight: 600;`).
  - **Item Non-Aktif**: Teks abu-abu (`color: #6B7280; padding: 8px 18px; border-radius: 9999px; transition: 150ms;`), hover halus.
- **Tools & Profil (Kanan)**:
  - 3 tombol lingkaran utilitas (`width: 38px; height: 38px; border-radius: 50%; background: #F7F8FA;`):
    1. Pencarian (`search`)
    2. Pesan/Log (`message-square`)
    3. Notifikasi (`bell`) dengan badge lingkaran merah kecil (`#EF4444`) di sudut atas.
  - Profil Avatar: Foto lingkaran (`36px`) + Nama ("Budi Santoso", `12px bold`) + Role ("Pemilik", `10px gray`) + Ikon `chevron-down`.

### B. Metric Summary Cards (3 Kolom Atas)
- **Bentuk**: Kartu putih (`#FFFFFF`), `border-radius: 20px`, padding `20px`, `box-shadow: 0 4px 20px rgba(0,0,0,0.03)`.
- **Anatomi**:
  - Pojok kiri atas: Ikon oranye di dalam kotak melengkung berlatar oranye lembut (`#FFF7ED`).
  - Kiri bawah: Label "Bulan Ini" (`11px muted`) + Angka metrik tebal (`26px bold #111111`).
  - Kanan: **Radial Speedometer Gauge**:
    - Setengah busur lingkaran (arc) dengan garis-garis radial (ticks).
    - Teks persentase perbandingan di tengah (`+12% ↑`, `+15% ↑`, dll).
    - Varian warna arc: Oranye (`#FF7A00`), Hitam (`#111111`), atau Merah (`#EF4444`).

### C. Kartu Sorotan Properti ("Best Apartments" Orange Card)
- **Bentuk**: Latar oranye pekat (`#FF7A00`), `border-radius: 24px`, padding `24px`.
- **Anatomi**:
  - Pojok kanan atas: Tombol lingkaran semi-transparan dengan panah diagonal (`↗`).
  - Badge kecil atas: "Properti Utama".
  - Judul besar putih: "Kost Budi Makmur".
  - Nilai metrik teks putih: "Total Kamar: 15" dan "Okupansi: 73%".
  - Pojok kanan bawah: Foto gedung arsitektur modern kost dengan lengkungan rapi.

### D. Double Bar Chart ("Pemasukan & Pengeluaran")
- **Bentuk**: Kartu putih, `border-radius: 20px`, padding `22px`.
- **Anatomi**:
  - Header: Judul kartu + dropdown pil ("Bulanan ▾") + tombol panah `↗`.
  - Chart area:
    - Sumbu Y: `50`, `40`, `30`, `20`, `10`, `0` dengan garis horizontal putus-putus.
    - Garis target horizontal putus-putus oranye.
    - Pasangan batang: Batang kiri (arsiran diagonal krem/peach `#FDBA74`) dan Batang kanan (oranye solid `#FF7A00`).
    - Ujung atas batang membulat (`border-radius: 6px 6px 0 0`).
    - Tooltip mengambang putih halus saat bar disorot.

### E. Kartu Kondisi & Pemeliharaan ("Building Condition / Tiket")
- **Bentuk**: Kartu putih, `border-radius: 20px`, padding `22px`.
- **Anatomi**:
  - Header: "Kondisi Kamar / Tiket" + tombol menu 3 titik (`⋮`).
  - Baris item:
    - Teks status di kiri ("Dalam Pengerjaan", "Menunggu Teknisi", "Selesai").
    - Angka jumlah di kanan (tebal `13px`).
    - Progress bar: Track abu-abu lembut (`height: 6px; border-radius: 9999px;`), isian batang oranye melengkung (`#FF7A00`).
  - Tombol CTA: Hitam solid (`#111111`), `rounded-full`, padding `12px`, teks putih tebal: "Detail Tiket Kerusakan".

### F. Kartu Aktivitas / Pesan ("Activity Log")
- **Bentuk**: Kartu putih, header dengan pemilih tanggal ("Hari ini ▾").
- **Daftar**: Avatar melingkar, nama tebal, cuplikan pesan/transaksi, waktu lampau, dan indikator lingkaran merah jika ada item baru.

### G. Bagian Daftar Kamar ("My Properties")
- Header section dengan bar pencarian pil ("Cari nomor kamar atau penghuni...") dan tombol filter slider.
- Grid kartu kamar dengan foto kamar riil, tipe kamar, tarif sewa bulanan, status hunian, dan tombol melingkar `↗`.

---

## 5. Standar Anti-Slop & Craftsmanship

1. **Zero Emoji**: Tidak ada emoji Unicode di tombol, label, badge, atau heading. Seluruh simbol menggunakan **Lucide Icons** SVG murni.
2. **Zero Native Select Slop**: Dilarang menggunakan `<select>` browser default yang kaku. Seluruh dropdown filter dan pemilih periode wajib menggunakan popover melayang bergaya custom pil (`rounded-2xl`, `shadow-xl`, `border-color: #ECEEF2`).
3. **Zero Raw Browser Alerts**: Dilarang menggunakan `alert()`, `confirm()`, atau `prompt()`. Semua notifikasi feedback menggunakan toast animasi atau dialog modal terdesain.
4. **Mikro-Interaksi Taktil**:
   - Transisi default: `transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)`.
   - Tombol / Kartu hover: `transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.06);`.
   - Tombol active: `transform: scale(0.98);`.
   - Input fokus: `border-color: #FF7A00; box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.12); outline: none;`.

---

## 6. Icon Registry (Lucide SVG)

| Kebutuhan UI | Nama Ikon Lucide |
|---|---|
| Dasbor | `layout-dashboard` |
| Kamar / Properti | `door-open` / `home` |
| Penghuni | `users` |
| Tagihan / Dokumen | `receipt` / `file-text` |
| Laporan / Keuangan | `bar-chart-3` / `trending-up` |
| Tiket Pemeliharaan | `wrench` / `hammer` |
| Pengaturan | `settings` |
| Aksi Tambah | `plus` |
| Pencarian | `search` |
| Filter | `sliders-horizontal` |
| Notifikasi | `bell` |
| Pesan | `mail` / `message-square` |
| Panah Navigasi / Luar | `arrow-up-right` (`↗`) / `chevron-down` / `chevron-right` |
| Status Berhasil | `check-circle-2` |
| Status Peringatan | `clock` / `alert-triangle` |
| Status Bahaya | `alert-circle` |


---

## 7. Skala Baku Komponen UI & Token Ukuran (Design Component Scale)

Untuk menjaga konsistensi visual 100% di seluruh layar dan mencegah divergensi ukuran antar halaman, seluruh elemen tombol, form, modal, dan badge dikunci ke dalam skala baku berikut:

### 7.1 Skala Tombol (Button Sizing System)

| Token / Class | Tinggi (Height) | Padding Horizontal | Font Size | Border Radius | Peruntukan & Contoh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`.btn-lg`** | **`48px`** | `24px` | `13px` SemiBold | `9999px` (Pill) / `14px` | CTA Login (WF-01), Submit Modal Penuh, Aksi Utama Drawer |
| **`.btn-md`** *(Default)* | **`40px`** | `18px – 20px` | `12.5px – 13px` SemiBold | `9999px` (Pill) / `12px` | Tombol Header Halaman (`+ Tambah`, `+ Registrasi`), Filter Utama, Simpan Form |
| **`.btn-sm`** | **`34px`** | `14px` | `12px` Medium/SemiBold | `9999px` (Pill) / `10px` | Tombol Sub-Header, Tab Pill, `Buka Layar Penuh`, `Perpanjang Kontrak` |
| **`.btn-xs`** | **`28px`** | `10px` | `11px` SemiBold | `9999px` (Pill) / `8px` | Aksi Baris Tabel (`Lihat Solusi`, `Kuitansi`, `Unduh PDF`, `Terminasi`) |
| **`.btn-circle`** | **`36px × 36px`** *(38px Topbar)* | Center / Square | Ikon 16px (18px Topbar) | `50%` (Circle) | Tombol Search, Notifikasi Bell, Close Modal (`X`), Aksi Cepat (`↗`) |

#### Varian Warna Tombol Baku:
- **Dark Pill (`.btn-dark` / `.btn-black-solid`)**: `background: #111111; color: #FFFFFF;` (Ciri khas Estify).
- **Brand Primary (`.btn-primary` / `.btn-brand`)**: `background: #FF7A00; color: #FFFFFF; box-shadow: 0 4px 14px rgba(255,122,0,0.25);`.
- **White Outline (`.btn-outline` / `.btn-white-outline`)**: `background: #FFFFFF; border: 1.5px solid #ECEEF2; color: #374151;` (Hover: border & text `#0F172A`).
- **Subtle Ghost (`.btn-subtle`)**: `background: #F1F5F9; color: #475569;` (Hover: `#E2E8F0`).
- **Danger Pill (`.btn-danger-pill`)**: `background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48;` (Hover: `#E11D48`, text `#FFFFFF`).
- **WhatsApp Pill (`.btn-wa-pill`)**: `background: #16A34A; color: #FFFFFF;` (Hover: `#15803D`).

---

### 7.2 Skala Form Fields (Uniform 42px Height Lock)

Semua komponen input formulir satu baris dikunci memiliki **tinggi seragam 42px** agar garis grid formulir selalu rata:

| Elemen Form | Tinggi Baku | Font Size | Border Radius | Padding & Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Text / Number / Tel Input** | **`42px !important`** | `12.5px – 13px` | `12px` | Padding `0 14px`, Border `#ECEEF2`, Focus ring `#FF7A00` |
| **Custom Select Trigger** | **`42px !important`** | `12.5px – 13px` | `12px` | Padding `0 14px`, Chevron ikon sejajar kanan |
| **Datepicker Trigger** | **`42px !important`** | `12.5px – 13px` | `12px` | Padding `0 14px`, Kalender ikon di kiri |
| **Textarea Multi-line** | Min-height **`84px`** | `12.5px` | `12px` | Padding `10px 14px`, Resize vertikal terkontrol |

---

### 7.3 Skala Modal & Dialog Standar

| Tipe Modal | Lebar Baku (Width) | Padding Header | Padding Body | Radius | Aturan Scrollbar |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Modal Form Standar (1 Kolom)** | **`580px`** | `16px 22px` | `16px 22px` | `20px` | Wajib hidden scrollbar tapi tetap smooth-scrollable |
| **Modal Kompak / Konfirmasi** | **`480px – 500px`** | `16px 20px` | `16px 20px` | `20px` | Wajib hidden scrollbar tapi tetap smooth-scrollable |
| **Modal Komprehensif (2 Kolom)** | **`1040px`** | `16px 24px` | `20px 24px` | `20px` | Wajib hidden scrollbar tapi tetap smooth-scrollable |

---

### 7.4 Skala Status Badge & Pill

| Tipe Badge | Tinggi | Padding | Font Size | Border Radius |
| :--- | :--- | :--- | :--- | :--- |
| **Badge Regular** | `24px` | `4px 10px` | `11px` SemiBold | `9999px` (Pill) |
| **Badge Micro / Table** | `20px` | `2px 8px` | `10px – 10.5px` SemiBold | `6px` / `9999px` |
