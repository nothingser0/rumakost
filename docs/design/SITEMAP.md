# SITEMAP & ROLE-BASED ROUTING — RumaKost

> **Status**: APPROVED ARCHITECTURE (Fase M04 · UI/UX & Prototyping)  
> **Revisi**: Standarisasi 3 Peran Pengguna (Pemilik, Staf Pengelola, Penghuni) & Estify Visual DNA  
> **Acuan Langsung**: `docs/pm/SCOPE_STATEMENT.md` (Bagian 3 & 4) & `docs/design/DESIGN.md`

---

## 1. Arsitektur Navigasi Topbar Berdasarkan 3 Peran

Navigasi bar bagian atas horizontal mengadopsi konsep **Estify Pill Navigation** yang beradaptasi secara dinamis menurut peran pengguna yang aktif:

### 1.1 Topbar Pemilik (Owner / Superadmin)
Akses penuh ke seluruh operasional, keuangan, dan pengaturan 1 properti:
```
[Logo RumaKost]  ( Dashboard )  ( Kamar )  ( Penghuni )  ( Tagihan )  ( Pembayaran )  ( Laporan )  ( Tiket )   [Cari] [Pesan] [Notifikasi] [Avatar Pemilik ▾]
```
- **Avatar Menu**: Mengarah ke `/pengaturan/profil` dan `/pengaturan/akun` (Kelola staf).

### 1.2 Topbar Staf Pengelola (Staff / Operasional)
Akses operasional lapangan harian (tanpa akses laporan laba bersih dan dilarang memverifikasi pembayaran sendiri):
```
[Logo RumaKost]  ( Dashboard )  ( Kamar )  ( Penghuni )  ( Tagihan )  ( Tiket )  [Badge: Staf Operasional]   [Cari] [Notifikasi] [Avatar Staf ▾]
```
- **Catatan Wewenang**: Menu *Pembayaran* bagi staf berfungsi sebagai *Catat Pembayaran Masuk* (status transaksi berstatus pending hingga disetujui Pemilik). Menu *Laporan Finansial Sensitif* disembunyikan.

### 1.3 Topbar Penghuni Kost (Tenant Portal)
Navigasi mandiri self-service khusus penyewa kamar:
```
[Logo RumaKost]  ( Beranda Kamar )  ( Tagihan Saya )  ( Lapor Kerusakan )   [Kamar A-04 · Budi Santoso ▾]
```
- **Menu Cepat**: Akses langsung ke status sewa, tagihan aktif, serta status perbaikan kamar.

---

## 2. Struktur Lengkap Layar & Rute Aplikasi

### 2.1 Hub Masuk Terpusat (Public / Guest)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-01** | `/login` | Publik / Semua Role | Halaman masuk split-screen dengan showcase 3D di kiri dan formulir masuk 3 tab peran (Pemilik, Staf Pengelola, Penghuni) di kanan. |

---

### 2.2 Portal Manajemen (Pemilik & Staf Pengelola)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-02** | `/dashboard` | Pemilik & Staf | Dasbor utama: 3 kartu metrik gauge, kartu oranye properti ("Kost Budi Makmur"), double bar chart, kondisi tiket, dan grid status kamar cepat. |
| **SCR-03** | `/kamar` | Pemilik & Staf | Katalog 15 unit kamar kost. Filter per lantai, badge ketersediaan (Terisi/Kosong), tombol tambah/edit kamar. |
| **SCR-04** | `/kamar/:id` | Pemilik & Staf | Detail kamar: spesifikasi unit, inventaris fasilitas, riwayat kontrak sewa, penghuni aktif. |
| **SCR-05** | `/penghuni` | Pemilik & Staf | Direktori penyewa kost. Filter status sewa (Aktif, Segera Berakhir, Selesai), modal penugasan kamar baru. |
| **SCR-06** | `/penghuni/:id` | Pemilik & Staf | Profil penyewa: data kontak, masa sewa, tagihan kamar terkait, riwayat komplain. |
| **SCR-07** | `/kontrak` | Pemilik & Staf | Rekap perjanjian sewa kamar: tanggal mulai, jatuh tempo, klausul sewa, deposit jaminan. |
| **SCR-08** | `/kontrak/:id` | Pemilik & Staf | Lembar detail kontrak sewa dan tombol perpanjang masa sewa. |
| **SCR-09** | `/tagihan` | Pemilik & Staf | Matriks tagihan bulanan: filter periode bulan, status pelunasan (Lunas, Jatuh Tempo, Terlambat). |
| **SCR-10** | `/tagihan/:id` | Pemilik & Staf | Lembar invoice penagihan resmi sewa kost dan riwayat pembayaran cicilan parsial. |
| **SCR-11** | `/pembayaran` | Pemilik & Staf | **Pemilik**: Verifikasi mutasi pembayaran & tolak/koreksi transaksi. **Staf**: Form catat pembayaran masuk (Zero Self-Approval: menunggu verifikasi Pemilik). |
| **SCR-12** | `/pengeluaran` | Pemilik & Staf | Catatan belanja operasional (listrik token, air, WiFi, servis) beserta lampiran kuitansi pengeluaran. |
| **SCR-13** | `/laporan` | Pemilik Sahaja | Rekapitulasi keuangan eksekutif (Pemasukan, Pengeluaran, Laba Bersih, Tren Okupansi 12 Bulan). Proteksi hak akses Owner-only. |
| **SCR-14** | `/tiket` | Pemilik & Staf | Manajemen tiket komplain & pemeliharaan: filter urgensi (Mendesak, Normal, Rendah), penugasan staf/teknisi. |
| **SCR-15** | `/tiket/:id` | Pemilik & Staf | Detail penanganan tiket: indikator progres 5 segmen Estify, bukti foto kerusakan, log aktivitas perbaikan. |
| **SCR-16** | `/pengaturan/akun` | Pemilik Sahaja | Manajemen pengguna sistem: buat/aktifkan akun Staf dan Penghuni (F-01). |
| **SCR-17** | `/pengaturan/profil` | Pemilik Sahaja | Konfigurasi identitas kost, alamat fisik, nomor WhatsApp pengelola, dan rekening bank resmi. |

---

### 2.3 Portal Penghuni Mandiri (Tenant Self-Service)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-P01** | `/portal` | Penghuni Sahaja | **Beranda Kamar Penghuni**: Menampilkan nomor kamar aktif (misal: Kamar A-04), tanggal jatuh tempo sewa, badge status tagihan bulan ini, kontak darurat kost, dan pintasan lapor masalah. |
| **SCR-P02** | `/portal/tagihan` | Penghuni Sahaja | **Lembar Tagihan Saya**: Daftar tagihan kamar milik sendiri, rincian biaya sewa, riwayat cicilan yang telah terverifikasi, dan modal konfirmasi pembayaran transfer bank. |
| **SCR-P03** | `/portal/tiket` | Penghuni Sahaja | **Daftar Komplain Saya**: Riwayat seluruh laporan perbaikan fasilitas yang diajukan oleh penghuni untuk kamarnya. |
| **SCR-P04** | `/portal/tiket/baru` | Penghuni Sahaja | **Form Pelaporan Kerusakan (F-07)**: Input judul kerusakan, kategori area, deskripsi kronologi, dan **area unggah wajib minimal satu foto atau video bukti kerusakan**. |
| **SCR-P05** | `/portal/tiket/:id` | Penghuni Sahaja | **Detail Penanganan Kerusakan**: Indikator tahapan visual 5 segmen (*Diterima -> Ditugaskan -> Pengerjaan -> Pengecekan -> Selesai*), estimasi waktu servis teknisi, dan ruang obrolan komentar dua arah dengan pengelola kost. |

---

## 3. Diagram Hirarki Navigasi Antar Peran

```
                                  [ SCR-01: /login ]
                                          │
                     ┌────────────────────┼────────────────────┐
                     ▼                    ▼                    ▼
             [ Peran: Pemilik ]    [ Peran: Staf ]      [ Peran: Penghuni ]
                     │                    │                    │
          ┌──────────┴──────────┐         │          ┌─────────┴─────────┐
          ▼                     ▼         ▼          ▼                   ▼
    SCR-02: /dashboard      SCR-13:   SCR-02:     SCR-P01: /portal    SCR-P02:
   (Dasbor Eksekutif)      /laporan  /dashboard  (Beranda Kamar)     /portal/tagihan
          │                (Owner    (Dasbor             │
          ├── SCR-03 /kamar  Only)    Operasional)       ├── SCR-P03: /portal/tiket
          ├── SCR-05 /penghuni            │              │
          ├── SCR-09 /tagihan             ├── SCR-03     ├── SCR-P04: /portal/tiket/baru
          ├── SCR-11 /pembayaran          ├── SCR-05     │   (Wajib Foto/Video)
          │   (Bisa Verifikasi)           ├── SCR-09     │
          ├── SCR-14 /tiket               ├── SCR-11     └── SCR-P05: /portal/tiket/:id
          └── SCR-16 & 17 Pengaturan      │   (Hanya         (Progress 5 Tahap & Diskusi)
                                          │    Mencatat)
                                          └── SCR-14
```

---

## 4. Pemetaan Prototipe Mockup HTML (Fase M04)

Seluruh 12 prototipe layar interaktif saling terhubung dan dapat diuji langsung:

| File Prototipe | Kode Layar | Fokus Pengguna & Peran |
|---|---|---|
| `WF-01-login.html` | SCR-01 | Hub Masuk 3 Peran (Pemilik, Staf, Penghuni) + Visual 3D Meja Kerja |
| `WF-02-dashboard.html` | SCR-02 | Dasbor Eksekutif (Pemilik & Staf) |
| `WF-03-kamar.html` | SCR-03 / 04 | Katalog 15 Unit Kamar & Drawer Tambah Kamar |
| `WF-04-penghuni.html` | SCR-05 / 06 | Direktori Penyewa & Modal Tambah Penghuni |
| `WF-05-tagihan.html` | SCR-09 / 10 | Matriks Penagihan Bulanan & Invoice Digital |
| `WF-06-pembayaran.html` | SCR-11 | Verifikasi Pemilik & Pencatatan Pembayaran Parsial |
| `WF-07-laporan.html` | SCR-12 / 13 | Laporan Finansial & Okupansi (Owner-only) |
| `WF-08-tiket.html` | SCR-14 | Antrean & Triase Tiket Pemeliharaan (F-07) |
| `WF-08-tiket-detail.html` | SCR-15 | Detail Penanganan Tiket Kerusakan & Kolaborasi Multi-Role (F-07) |
| `WF-09-pengaturan.html` | SCR-16 / 17 | Konfigurasi Properti, Rekening, & Akun Staf |
| `WF-10-portal-penghuni.html`| SCR-P01 | Beranda Penghuni Mandiri (Kamar A-04) |
| `WF-11-portal-tiket-baru.html`| SCR-P04 | Form Lapor Komplain (Wajib Upload Foto/Video) |
| `WF-12-portal-tiket-detail.html`| SCR-P05 | Detail Tiket Penghuni & Thread Diskusi Teknisi |
