# Referensi Desain Inspirasi — Estify Real Estate Dashboard

> Sumber: Behance — *Real Estate Dashboard | UI UX Design* (Estify)
> File referensi tersimpan di: `docs/design/inspiration/`

---

## 1. Inventaris Asset Referensi

| File | Tipe | Deskripsi |
|---|---|---|
| `01-dashboard-flat.png` | Screenshot Utama | Tampilan frontal datar resolusi tinggi dasbor desktop Estify. Menampilkan seluruh komponen, grid, metrik, chart, dan cards. |
| `02-dashboard-perspective.png` | Mockup Monitor | Tampilan perspektif sudut dasbor pada monitor studio. |
| `03-mobile-view.png` | Responsif Mobile | Tampilan tata letak dasbor pada layar mobile (Dynamic Island, vertical stack, horizontal scrollable card). |
| `04-typography-sheet.png` | Lembar Tipografi | Spesifikasi jenis font **Poppins**, bobot (Light, Regular, Medium, Bold), serta skala heading (32px, 24px, 16px). |
| `05-logo-style.png` | Brand Mark | Contoh identitas logo: geometric glyph + sans-serif wordmark pada gradasi lembut. |

---

## 2. Bedah Komponen & Visual DNA Asli

Berdasarkan analisis visual langsung dari gambar beresolusi tinggi:

### A. Shell & Layout
- **Skema Warna Umum**: **Light Mode Murni**. Bukan dark sidebar/topbar. Latar belakang kanvas berwarna abu-abu sangat lembut (`#F7F8FA` atau `#F6F7F9`).
- **Topbar**:
  - Latar belakang putih bersih (`#FFFFFF`) menyatu dengan kanvas.
  - **Brand**: Logo di kiri (ikon + teks "RumaKost").
  - **Navigasi Utama (Tengah)**: Navigasi horizontal berbentuk pil.
    - Halaman aktif bertombol **Hitam Pekat Solid (`#111111`)**, teks putih, rounded-full (`border-radius: 9999px`).
    - Halaman non-aktif berupa teks polos berwarna abu gelap (`#4B5563` / `#6B7280`) tanpa border/background tebal.
  - **Area Aksi (Kanan)**:
    - Tombol ikon melingkar (`36px × 36px` lingkaran putih halus): Pencarian (`search`), Pesan (`mail`/`message-square`), Notifikasi (`bell`) dengan badge indikator merah bulat di kanan atas.
    - Profil Pengguna: Foto profil melingkar + Nama tebal ("Budi Santoso") + Peran kecil abu-abu ("Pemilik") + Ikon panah bawah (`chevron-down`).

### B. Kartu Metrik Ringkasan (Top 3 Cards)
- **Struktur Kartu**: Latar putih (`#FFFFFF`), sudut melengkung besar (`border-radius: 20px`), bayangan halus tanpa border tebal.
- **Elemen Isi**:
  1. Ikon topik di kiri atas dalam kotak tumpul berlatar oranye lembut (`#FFF7ED`).
  2. Nilai metrik angka tebal besar (`font-size: 24px - 28px`, bold).
  3. Indikator perbandingan di kanan: **Radial Gauge Meter (Setengah Lingkaran / Speedometer)** dengan garis ticks radial dan persentase perubahan (`+12% ↑`, `+15% ↑`, `+40% ↑`).

### C. Kartu Sorotan Oranye ("Highlight Card")
- **Karakteristik Unik**: Latar oranye cerah solid (`#FF7A00` atau `#F97316`), sudut melengkung `24px`.
- **Elemen**:
  - Label pill kecil di atas ("Best Apartments" -> diadaptasi menjadi unit/kamar unggulan atau status properti).
  - Judul besar teks putih tebal (misal: nama kost / unit utama).
  - Metrik ganda teks putih (Total Okupansi, Total Pemasukan).
  - Foto arsitektur bangunan di sudut kanan bawah kartu yang terpotong rapi dengan sudut melengkung.
  - Tombol aksi lingkaran transparan dengan panah diagonal (`↗`).

### D. Grafik Batang ("Double Bar Chart")
- **Gaya Visual**:
  - Dua batang berdampingan per periode:
    - Batang 1: Warna krem/peach lembut dengan pola arsiran diagonal (`pattern hatch`).
    - Batang 2: Warna oranye solid (`#FF7A00`).
    - Ujung atas batang membulat (`border-radius: 6px 6px 0 0`).
  - Garis batas target/ambang berupa garis putus-putus oranye horizontal.
  - Kartu tooltip mengambang putih dengan bayangan lembut ketika di-hover.
  - Filter dropdown pil di pojok kanan kartu ("Bulanan ▾") + tombol panah `↗`.

### E. Kartu Kondisi & Pemeliharaan ("Building Condition")
- **Struktur**: Latar putih, judul tebal dengan tombol menu 3-titik (`⋮`).
- **Bar Status**:
  - Judul item di kiri, angka total di kanan tebal.
  - Progress bar membulat tebal: track abu-abu lembut, isian batang oranye (`#FF7A00`).
- **Tombol Aksi**: Tombol pil hitam pekat (`#111111`) selebar penuh kartu (`width: 100%`, `rounded-full`), teks putih: "Detail Pemeliharaan".

### F. Daftar Aktivitas / Pesan ("Message / Activity")
- **Struktur**: Latar putih, judul dengan pemilih filter tanggal ("Hari ini ▾").
- **Baris Aktivitas**:
  - Avatar lingkaran.
  - Nama tebal + cuplikan keterangan + waktu lampau (misal: "22 mins").
  - Indikator pesan belum terbaca berupa lingkaran merah kecil.

### G. Bagian Properti / Kamar ("My Properties")
- Header judul tebal + bar pencarian pil ("Cari unit kamar...") + tombol filter slider melingkar.
- Grid kartu properti dengan foto real estate berkualitas tinggi, sudut melengkung lebar, dan tombol aksi melingkar `↗`.

---

## 3. Pemetaan ke RumaKost (1 Properti, 7 Fitur P0)

| Komponen Estify | Adaptasi RumaKost | Catatan Implementasi |
|---|---|---|
| Active Properties | **Tingkat Okupansi** (misal: 73%, gauge meter oranye) | Metrik utama keterisian kamar |
| New Leads | **Penghuni Aktif** (misal: 11 orang, gauge meter hitam) | Data penyewa kost aktif |
| Total Sales | **Pemasukan Bulan Ini** (misal: Rp 13,5 jt, gauge meter merah/oranye) | Arus kas penerimaan |
| Best Apartments (Orange Card) | **Kost Budi Makmur (Highlight)** | Kartu oranye identitas properti, tarif dasar, status kamar terisi, foto kamar/fasilitas |
| Property Type Chart | **Pemasukan vs Pengeluaran Bulanan** | Bar peach (pengeluaran) + bar oranye (pemasukan) |
| Building Condition | **Status Tiket Kerusakan** | Progres tiket: Ditangani, Menunggu Teknisi, Selesai + Tombol "Kelola Tiket" hitam |
| Message | **Aktivitas & Log Pembayaran Terbaru** | Riwayat bayar masuk, laporan komplain, kontrak masuk |
| My Properties | **Daftar Kamar Kost** | Grid foto kamar, nomor kamar, tipe, tarif sewa, status lunas/terisi |
