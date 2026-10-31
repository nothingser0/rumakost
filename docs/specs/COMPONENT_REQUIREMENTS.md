# UI Component Requirements — RumaKost

> **Module**: M04 · UI/UX & Prototyping  
> **Source Spec**: Estify Real Estate Dashboard Visual DNA & `DESIGN.md`  
> **Tujuan**: Spesifikasi teknis & visual seluruh komponen antarmuka (primitives & composites) sebagai acuan langsung implementasi prototipe M04 dan pembentukan task `M06-UI-xx` di `TODO.md`.

---

## 1. Aturan Dasar & Standar Kualitas (Craftsmanship Anti-Slop)

1. **Zero Native Select**: Semua elemen seleksi wajib menggunakan *custom floating popover* (`rounded-2xl`, `shadow-xl`, `border-color: #ECEEF2`). Elemen `<select>` bawaan browser dilarang keras.
2. **Zero Native Alert/Confirm**: Seluruh konfirmasi dan umpan balik aksi menggunakan *dialog modal* atau *toast notification* yang dirancang seragam.
3. **Zero Emoji**: Seluruh ikon grafis wajib menggunakan **Lucide Icons** SVG murni dengan bobot garis konsisten (`stroke-width: 2px`).
4. **Interaksi Taktil (Micro-interactions)**:
   - Durasi transisi standar: `150ms cubic-bezier(0.4, 0, 0.2, 1)`.
   - Efek hover: `transform: translateY(-2px)` dengan peningkatan bayangan ambient.
   - Efek klik (active): `transform: scale(0.98)`.
   - Efek fokus: `box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.15)` dengan cincin aksen oranye.

---

## 2. UI Primitives (Atoms & Molecules)

### CMP-01: Button (`M06-UI-BTN`)
Komponen tombol interaktif dengan variasi peran yang tegas:

| Varian | Latar Belakang (BG) | Warna Teks | Border | Padding / Radius | Penggunaan |
|---|---|---|---|---|---|
| **Primary Black** | `#111111` | `#FFFFFF` | None | `10px 20px` / `rounded-full` atau `rounded-xl` | Tombol CTA utama dasbor, simpan data, login, maintenance details |
| **Primary Orange** | `#FF7A00` | `#FFFFFF` | None | `10px 20px` / `rounded-xl` | Aksi konfirmasi pembayaran, bayar cepat, terbitkan invoice |
| **Secondary Ghost** | `#FFFFFF` | `#4B5563` | `1.5px solid #ECEEF2` | `8px 16px` / `rounded-xl` | Filter dropdown trigger, tombol batal, ekspor data |
| **Subtle Danger** | `#FEE2E2` | `#EF4444` | None | `8px 16px` / `rounded-xl` | Akhiri kontrak, hapus tiket, tolak verifikasi |
| **Icon Circle Action** | `#F7F8FA` | `#4B5563` | None | `38px × 38px` / `rounded-full` | Tombol pencarian, pesan, lonceng notifikasi di topbar |
| **Translucent Arrow** | `rgba(255,255,255,0.2)` | `#FFFFFF` | None | `32px × 32px` / `rounded-full` | Tombol panah diagonal `↗` pada kartu properti dan highlight |

- **States**: `default`, `hover` (`translateY(-1px)`), `active` (`scale(0.98)`), `disabled` (`opacity: 0.5; cursor: not-allowed`), `loading` (spinner oranye berputar).

---

### CMP-02: Input & Form Controls (`M06-UI-INPUT`)
Field masukan data yang konsisten di formulir login, pencarian, dan modal:

- **Struktur**: Kontainer input dengan ikon di kiri (misal: `search`, `mail`, `lock`, `phone`) dan teks placeholder berwarna abu-abu redup (`#9CA3AF`).
- **Dimensi**: Tinggi `44px`, padding `10px 14px 10px 40px` (jika berikon), `border-radius: 12px`.
- **Warna**: Latar `#FAFAFA` (berubah jadi `#FFFFFF` saat aktif), border `1.5px solid #ECEEF2`.
- **States**:
  - `focus`: Border berubah `#FF7A00`, ring halus `0 0 0 3px rgba(255, 122, 0, 0.12)`.
  - `error`: Border berubah `#EF4444`, ring merah halus, disertai pesan error teks kecil di bawahnya.
  - `disabled`: Latar `#F3F4F6`, teks `#9CA3AF`.

---

### CMP-03: Status Badge & Pill (`M06-UI-BADGE`)
Label visual untuk status kamar, pembayaran, dan tiket:

| Status Semantik | Background (BG) | Warna Teks | Ikon Lucide | Contoh Penggunaan |
|---|---|---|---|---|
| **Success** | `#DCFCE7` | `#16A34A` | `check-circle-2` | Kamar Terisi, Tagihan Lunas, Pembayaran Terverifikasi |
| **Warning / Pending** | `#FEF3C7` | `#D97706` | `clock` | Jatuh Tempo, Menunggu Verifikasi, Segera Berakhir |
| **Danger** | `#FEE2E2` | `#EF4444` | `alert-circle` | Tagihan Terlambat, Tiket Mendesak, Kamar Rusak |
| **Neutral / Available** | `#F3F4F6` | `#6B7280` | `circle` | Kamar Kosong / Tersedia, Tiket Ditutup |
| **Brand Orange** | `#FFF7ED` | `#FF7A00` | `sparkles` / `star` | Properti Unggulan, Perpanjangan Otomatis |

- **Spesifikasi**: `padding: 4px 10px`, `border-radius: 9999px`, font `11px font-weight: 600`, tata letak inline-flex dengan spasi ikon `4px`.

---

### CMP-04: Custom Popover Dropdown (`M06-UI-DROPDOWN`)
Pengganti elemen `<select>` bawaan browser untuk filter periode, lantai, dan tipe:

- **Trigger**: Tombol kapsul (pill) dengan label nilai aktif, ikon panah bawah (`chevron-down`), dan latar `#FFFFFF` atau `#F7F8FA`.
- **Panel Melayang (Popover)**:
  - Posisi: `absolute`, z-index `50`, margin-top `6px`.
  - Desain: `background: #FFFFFF`, `border-radius: 16px`, `box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08)`, border `1px solid #ECEEF2`.
  - Isi Opsi: Daftar pilihan dengan padding `10px 14px`, hover `background: #FFF7ED; color: #FF7A00;`, dan ikon centang (`check`) pada opsi yang terpilih.
  - Opsional Search: Input mini di bagian atas jika pilihan > 5 item.

---

### CMP-05: Modal & Dialog Overlay (`M06-UI-MODAL`)
Dialog terpusat untuk "Catat Pembayaran", "Tambah Kamar", atau konfirmasi penting:

- **Backdrop**: `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px); z-index: 1000;`.
- **Kotak Dialog**:
  - `max-width: 520px; width: 90%; background: #FFFFFF; border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.18);`.
  - Animasi Masuk: `opacity: 0 -> 1`, `transform: scale(0.96) -> scale(1)` durasi `200ms ease-out`.
  - Header: Judul tebal `18px`, tombol tutup `x` melingkar di kanan atas.
  - Footer: Baris aksi dengan tombol "Batal" (Ghost) dan tombol eksekusi (Primary Black / Orange).

---

### CMP-06: Radial Speedometer Gauge (`M06-UI-GAUGE`)
Komponen visual khas Estify untuk kartu metrik ringkasan atas:

- **Konstruksi SVG**:
  - Tipe: Setengah lingkaran (semi-donut) busur derajat 180° menghadap ke atas.
  - Track: Garis busur abu-abu lembut (`stroke: #F3F4F6; stroke-width: 12px; fill: none;`).
  - Progress Arc: Busur nilai (`stroke: #FF7A00` atau `#111111` atau `#EF4444`) dengan ujung membulat (`stroke-linecap: round`).
  - Radial Ticks: Garis-garis halus tipis menyebar melingkar menyerupai indikator speedometer analog.
  - Label Tengah: Teks persentase perubahan tebal (`+12% ↑`) di pusat busur.

---

### CMP-07: Segmented Progress Indicator (`M06-UI-PROGRESS`)
Indikator progres tahapan tiket penanganan kerusakan dan progres pemeliharaan:

- **Varian 1 — Thick Continuous Bar (Building Condition)**:
  - Track: `height: 6px; background: #ECEEF2; border-radius: 9999px; overflow: hidden;`.
  - Fill: `background: #FF7A00; border-radius: 9999px; transition: width 400ms ease;`.
- **Varian 2 — Segmented 5-Step Dashes (Tiket Detail)**:
  - 5 batang terpisah horizontal dengan gap `4px`.
  - Setiap ruas batang mewakili status: *Diterima -> Ditugaskan -> Dikerjakan -> Diperiksa -> Selesai*.
  - Ruas aktif berwarna oranye solid (`#FF7A00`), ruas belum tercapai berwarna abu-abu lembut (`#E5E7EB`).

---

## 3. UI Composites (Organisms & Widgets)

### CMP-08: Topbar Navigation Shell (`M06-UI-TOPBAR`)
- **Struktur**: Bilah horizontal penuh (`height: 64px`, `background: #FFFFFF`, `border-bottom: 1px solid #ECEEF2`).
- **Brand**: Ikon SVG Kunci Rumah (`rumakost-icon.svg`) + Wordmark "RumaKost".
- **Pill Nav**: Daftar rute utama. Item aktif berlatar `#111111` dengan teks putih, item non-aktif teks abu-abu `#6B7280`.
- **Right Utility**: Tombol lingkaran Search, Mail, Bell (dengan badge merah unread), dan dropdown profil pengguna.

---

### CMP-09: Metric Summary Card (`M06-UI-METRIC-CARD`)
- **Struktur**: Kotak putih `border-radius: 20px`, padding `20px`, bayangan ambient halus.
- **Isi**:
  - Kiri: Kotak ikon berlatar `#FFF7ED` dengan ikon oranye, label periode "Bulan ini", dan angka nilai tebal (`26px`).
  - Kanan: Komponen `Radial Speedometer Gauge` (CMP-06).

---

### CMP-10: Property Highlight Card (`M06-UI-HIGHLIGHT-CARD`)
- **Struktur**: Kartu berlatar oranye solid (`#FF7A00`), `border-radius: 24px`, padding `24px`, teks putih.
- **Isi**:
  - Label kecil transparan atas ("Properti Utama").
  - Tombol aksi lingkaran semi-transparan berikon panah diagonal `↗`.
  - Judul besar: "Kost Budi Makmur".
  - Metrik ganda: "Total Kamar: 15" dan "Okupansi: 73%".
  - Gambar arsitektur gedung sudut modern di sudut kanan bawah terpotong rapi dengan border radius kartu.

---

### CMP-11: Double Bar Chart Widget (`M06-UI-CHART`)
- **Struktur**: Kartu putih `border-radius: 20px`, padding `22px`.
- **Header**: Judul ("Pemasukan & Pengeluaran") + Dropdown periode kustom + Tombol panah `↗`.
- **Visual Grafik**:
  - Sumbu Y berlabel angka dengan garis putus-putus horizontal.
  - Garis target horizontal putus-putus oranye.
  - Batang ganda: Batang Pengeluaran (arsiran diagonal peach `#FDBA74`) dan Batang Pemasukan (oranye solid `#FF7A00`).
  - Tooltip interaktif melayang saat kursor berada di atas pasangan batang.

---

### CMP-12: Maintenance Condition Panel (`M06-UI-CONDITION-PANEL`)
- **Struktur**: Kartu putih penampung status pemeliharaan fasilitas dan kamar kost.
- **Header**: Judul ("Kondisi Kamar / Tiket") + Tombol menu tiga titik (`⋮`).
- **Isi Baris**: Label status (misal: "Dalam Pengerjaan"), angka total tebal di kanan, dan progress bar oranye membulat.
- **CTA**: Tombol pil hitam solid (`#111111`) selebar penuh kartu ("Detail Tiket Kerusakan").

---

### CMP-13: Activity & Message Feed (`M06-UI-ACTIVITY-FEED`)
- **Struktur**: Kartu putih daftar riwayat transaksi atau pesan terbaru.
- **Header**: Judul ("Aktivitas") + Dropdown pemilih hari ("Hari ini ▾").
- **Item Baris**: Avatar lingkaran pengguna, nama tebal, ringkasan keterangan aksi, jam lampau ("22 mins"), serta indikator lingkaran merah jika belum dibaca.

---

### CMP-14: Room / Property Unit Card (`M06-UI-ROOM-CARD`)
- **Struktur**: Kartu unit kamar kost pada katalog kamar atau dasbor.
- **Gambar**: Foto interior/eksterior kamar berkualitas tinggi, rasio aspek 16:10, sudut lengkung atas.
- **Aksi Pojok**: Tombol melayang semi-transparan di pojok kanan atas foto dengan ikon panah diagonal `↗`.
- **Badan Kartu**: Nomor kamar ("Kamar A-01"), tipe kamar ("Standar"), harga sewa bulanan ("Rp 1.200.000 / bln"), dan badge status ketersediaan (Terisi/Kosong).

---

### CMP-15: Data Table (`M06-UI-TABLE`)
- **Struktur**: Tabel data untuk Penghuni, Tagihan, dan Pengeluaran.
- **Header**: Latar `#FAFAFA`, teks abu-abu kecil kapital (`11px font-weight: 600`), spasi rapi.
- **Row**: Padding vertikal `14px`, garis pemisah halus `#F3F4F6`, transisi hover baris `#F9FAFB`.
- **Aksi Baris**: Tautan kontekstual berwarna oranye (misal: "Catat Bayar ↗" atau "Detail ↗").

---

### CMP-16: Mandatory Media Upload Zone (`M06-UI-MEDIA-UPLOAD`)
- **Tujuan**: Memenuhi kualifikasi F-07 (Penghuni wajib mengunggah minimal satu foto atau video saat membuat tiket komplain).
- **Struktur**: Area drop-zone bergaris putus-putus (`border: 2px dashed #ECEEF2`), radius `16px`, latar `#FAFAFA`.
- **Elemen**: Ikon `upload-cloud` oranye di tengah, petunjuk teks "Tarik foto/video kerusakan atau Klik untuk Unggah", teks batas format (JPG, PNG, MP4 maks 25MB).
- **Preview Slot**: Grid thumbnail file yang berhasil diunggah dengan tombol hapus melingkar di sudut kanan atas tiap berkas.

---

### CMP-17: Tenant Rent Summary Banner (`M06-UI-RENT-BANNER`)
- **Tujuan**: Kartu utama di beranda penghuni (`WF-10`) untuk visibilitas status sewa & tagihan.
- **Struktur**: Kartu gradien oranye-peach lembut (`background: linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)`), radius `24px`, padding `24px`, teks putih.
- **Isi**: Nomor kamar tebal ("Kamar A-04"), nama penyewa, tanggal jatuh tempo sewa, nominal tagihan bulan berjalan, dan tombol CTA "Konfirmasi Pembayaran".

---

### CMP-18: Ticket Timeline & Comment Thread (`M06-UI-COMMENT-THREAD`)
- **Tujuan**: Kolaborasi interaktif antara Penghuni, Staf, dan Pemilik pada detail tiket (`WF-08` / `WF-12`).
- **Struktur**: Thread pesan berurut waktu:
  - Header pesan: Avatar pengirim, nama, badge peran (`[Pemilik]`, `[Staf]`, `[Penghuni]`), dan cap waktu.
  - Isi pesan: Teks penjelasan progres perbaikan dan thumbnail lampiran foto/video pengerjaan.
  - Input balasan: Area teks dengan tombol lampirkan dokumen dan tombol kirim oranye.

---

### CMP-19: Role Switcher Pill Bar (`M06-UI-ROLE-SWITCHER`)
- **Tujuan**: Pemilih peran 3 arah (Pemilik, Staf Pengelola, Penghuni) pada halaman login (`WF-01`) dan context preview bar.
- **Struktur**: Bar kapsul dengan 3 tab tombol (`border-radius: 9999px`, background `#F7F8FA`).
- **States**: Tab aktif menggunakan latar hitam pekat `#111111` dengan teks putih dan ikon Lucide yang relevan (`shield-check` untuk Pemilik, `user` untuk Staf, `home` untuk Penghuni).

---

## 4. Matriks Pemetaan ke Task M06-UI

| ID Komponen | Nama Komponen | Tipe | Task Frontend Terkait |
|---|---|---|---|
| CMP-01 | Button System | Primitive | `M06-UI-01` |
| CMP-02 | Input & Form Controls | Primitive | `M06-UI-02` |
| CMP-03 | Status Badge & Pill | Primitive | `M06-UI-03` |
| CMP-04 | Custom Popover Dropdown | Primitive | `M06-UI-04` |
| CMP-05 | Modal & Dialog Overlay | Primitive | `M06-UI-05` |
| CMP-06 | Radial Speedometer Gauge | Primitive | `M06-UI-06` |
| CMP-07 | Segmented Progress Indicator | Primitive | `M06-UI-07` |
| CMP-08 | Topbar Navigation Shell | Composite | `M06-UI-08` |
| CMP-09 | Metric Summary Card | Composite | `M06-UI-09` |
| CMP-10 | Property Highlight Card | Composite | `M06-UI-10` |
| CMP-11 | Double Bar Chart Widget | Composite | `M06-UI-11` |
| CMP-12 | Maintenance Condition Panel | Composite | `M06-UI-12` |
| CMP-13 | Activity & Message Feed | Composite | `M06-UI-13` |
| CMP-14 | Room / Property Unit Card | Composite | `M06-UI-14` |
| CMP-15 | Data Table | Composite | `M06-UI-15` |
| CMP-16 | Mandatory Media Upload Zone | Composite | `M06-UI-16` |
| CMP-17 | Tenant Rent Summary Banner | Composite | `M06-UI-17` |
| CMP-18 | Ticket Timeline & Comment Thread | Composite | `M06-UI-18` |
| CMP-19 | Role Switcher Pill Bar | Composite | `M06-UI-19` |

## 5. Accessibility (WCAG 2.2 AA)

- Semua kontrol dapat dijangkau dan dioperasikan dengan keyboard; fokus terlihat dan tidak tertutup dialog atau navigasi tetap.
- Setiap input memiliki label programatis, pesan validasi terhubung ke field, dan error tidak hanya dibedakan dengan warna.
- Teks normal memakai kontras minimum 4.5:1; teks besar dan komponen grafis penting memakai minimum 3:1 sesuai token terverifikasi di `DESIGN.md`.
- Target sentuh utama pada layar ponsel sekurangnya 44 × 44 piksel. Tabel mengubah susunan atau menyediakan gulir horizontal yang terarah pada viewport sempit.
- Dialog mempertahankan fokus, menyediakan nama aksesibel dan aksi tutup; setelah ditutup, fokus kembali ke pemicu.
- Animasi menghormati `prefers-reduced-motion`; perubahan status juga disampaikan lewat teks yang dapat dibaca pembaca layar.

## 6. Batas Scope dan Handoff

Komponen dikaitkan dengan tujuh feature P0 di `docs/pm/SCOPE_STATEMENT.md`. Komponen untuk fitur yang ditandai P1/P2 atau Won't pada scope tidak masuk implementasi MVP tanpa perubahan scope. Runbook M04 dapat memuat kasus tambahan; keberadaannya tidak otomatis menjadikan komponen tambahan sebagai P0.

Permukaan finansial Owner-only tidak dirender pada tampilan Staff maupun Penghuni. Staff boleh mencatat pengeluaran operasional dan pembayaran berstatus pending sesuai skenario; hanya Owner dapat melihat laporan finansial atau mengesahkan pembayaran.
