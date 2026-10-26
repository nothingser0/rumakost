# SITEMAP & ROLE-BASED ROUTING — RumaKost

> **Status**: APPROVED COMPREHENSIVE ARCHITECTURE (Fase M04 · UI/UX & Prototyping)  
> **Revisi**: Standarisasi 3 Peran Pengguna (Pemilik, Staf Pengelola, Penghuni), Siklus Akun & Keamanan Lengkap, Navigasi Mobile, & Estify Visual DNA  
> **Acuan Langsung**: `docs/pm/SCOPE_STATEMENT.md` (Bagian 3 & 4) & `DESIGN.md`

---

## 1. Arsitektur Navigasi Berdasarkan 3 Peran

Aplikasi mengadopsi konsep **Estify Pill Navigation** pada desktop dan **Ergonomic Bottom Navigation Bar** pada tampilan mobile (smartphone):

### 1.1 Navigasi Pemilik (Owner / Superadmin)
Akses penuh ke seluruh operasional, keuangan eksekutif, dan pengaturan 1 properti:
* **Desktop Topbar**:
  ```
  [Logo RumaKost]  ( Dashboard )  ( Kamar )  ( Penghuni )  ( Tagihan )  ( Pembayaran )  ( Laporan )  ( Tiket )   [Cari] [Pesan] [Notifikasi] [Avatar Pemilik ▾]
  ```
  * **Avatar Menu**: `/profil` (Ganti Kata Sandi Pribadi), `/pengaturan/profil` (Properti & Rekening), `/pengaturan/akun` (Kelola Pengguna), `/aktivitas` (Audit Trail), `[Keluar]`.
* **Mobile Bottom Bar (Maks 5 Tombol Jempol)**:
  `[Beranda]` | `[Kamar]` | `[Tagihan]` | `[Tiket]` | `[Menu Lainnya ▾]` *(Laporan, Pembayaran, Pengaturan, Akun)*

---

### 1.2 Navigasi Staf Pengelola (Staff / Operasional Lapangan)
Akses operasional lapangan harian (tanpa akses laporan laba bersih dan dilarang memverifikasi pembayaran sendiri):
* **Desktop Topbar**:
  ```
  [Logo RumaKost]  ( Dashboard )  ( Kamar )  ( Penghuni )  ( Tagihan )  ( Tiket )  [Badge: Staf Operasional]   [Cari] [Notifikasi] [Avatar Staf ▾]
  ```
  * **Avatar Menu**: `/profil` (Profil Staf & Ganti Sandi Mandiri), `[Keluar]`.
  * **Catatan Wewenang**: Menu *Pembayaran* bagi staf berfungsi sebagai *Catat Pembayaran Masuk* (status transaksi *Pending Verifikasi Owner* — **Zero Self-Approval**). Menu *Laporan Finansial Sensitif* dan *Pengaturan Akun* disembunyikan.
* **Mobile Bottom Bar**:
  `[Beranda]` | `[Kamar]` | `[Catat Bayar]` | `[Tiket]` | `[Profil Staf]`

---

### 1.3 Navigasi Penghuni Kost (Tenant Self-Service Portal)
Navigasi mandiri khusus penyewa kamar terisolasi:
* **Desktop Topbar**:
  ```
  [Logo RumaKost]  ( Beranda Kamar )  ( Tagihan Saya )  ( Lapor Kerusakan )  ( Buku Panduan )   [Kamar A-04 · Budi Santoso ▾]
  ```
  * **Dropdown Identitas**: `/portal/profil` (Profil & Ganti Sandi), `/portal/izin-tamu`, `[Keluar]`.
* **Mobile Bottom Bar**:
  `[Kamar Saya]` | `[Tagihan]` | `[Lapor Rusak]` | `[Buku Panduan]` | `[Akun Saya]`

---

## 2. Struktur Lengkap Layar & Rute Aplikasi

### 2.1 Hub Autentikasi & Siklus Kredensial (Global Auth Lifecycle)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-01** | `/login` | Publik / Semua Role | Hub masuk split-screen 3D dengan pemilih 3 peran (Pemilik, Staf, Penghuni). |
| **SCR-01A** | `/lupa-sandi` | Publik / Guest | Pengajuan pemulihan kata sandi (instruksi kontak WhatsApp Pemilik atau email). |
| **SCR-01B** | `/reset-sandi` | Publik (Token Valid) | Formulir pembuatan kata sandi baru pasca-validasi token pemulihan. |
| **SCR-01C** | `/aktivasi-sandi` | Staf & Penghuni Baru | Modal/Layar paksa ganti kata sandi sementara saat login perdana (*First-Time Forced Change*). |

---

### 2.2 Portal Manajemen Pengelola (Pemilik & Staf)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-02** | `/dashboard` | Pemilik & Staf | Dasbor ringkasan: metrik gauge okupansi, double bar chart arus kas, kartu properti, dan status cepat kamar. |
| **SCR-03** | `/kamar` | Pemilik & Staf | Katalog 15 unit kamar: filter lantai, badge ketersediaan (Terisi, Kosong, Perbaikan, Dibersihkan). |
| **SCR-04** | `/kamar/:id` | Pemilik & Staf | Detail unit: inventaris fasilitas kamar, riwayat kontrak, penghuni aktif, checklist inspeksi. |
| **SCR-05** | `/penghuni` | Pemilik & Staf | Direktori penyewa: status sewa aktif, filter jatuh tempo, data plat nomor kendaraan motor/mobil. |
| **SCR-06** | `/penghuni/:id` | Pemilik & Staf | Profil penyewa: kontak WhatsApp, kontak darurat keluarga, masa sewa, dan riwayat komplain. |
| **SCR-07** | `/kontrak` | Pemilik & Staf | Rekap perjanjian sewa: tanggal mulai, klausul sewa, status deposit jaminan (*escrow*). |
| **SCR-08** | `/kontrak/:id` | Pemilik & Staf | Lembar detail kontrak, form serah terima kunci (*check-in/check-out*), potong deposit kerusakan. |
| **SCR-09** | `/tagihan` | Pemilik & Staf | Matriks penagihan bulanan sewa kamar, filter status pelunasan (Lunas, Jatuh Tempo, Terlambat). |
| **SCR-09M**| `/tagihan/meteran` | Pemilik & Staf | Catat angka sub-meteran kWh listrik & air bulanan per unit kamar untuk penambahan tagihan. |
| **SCR-10** | `/tagihan/:id` | Pemilik & Staf | Invoice penagihan sewa digital, tombol kirim pengingat WhatsApp, dan histori cicilan parsial. |
| **SCR-11** | `/pembayaran` | Pemilik & Staf | **Pemilik**: Verifikasi mutasi rekening & approval pelunasan. **Staf**: Form catat titipan bayar (*Zero Self-Approval: status Pending*). |
| **SCR-12** | `/pengeluaran` | Pemilik & Staf | Catatan belanja operasional rutin (token listrik umum, WiFi, air, nota servis teknisi). |
| **SCR-13** | `/laporan` | **Pemilik Sahaja** | Laporan laba bersih, rekap arus kas masuk/keluar, dan tren okupansi 12 bulan (Owner-only). |
| **SCR-14** | `/tiket` | Pemilik & Staf | Manajemen tiket komplain: triase prioritas (Mendesak, Normal, Rendah), penugasan staf/teknisi. |
| **SCR-15** | `/tiket/:id` | Pemilik & Staf | Detail penanganan tiket: indikator progres 5 segmen Estify, bukti foto kerusakan, log aktivitas. |
| **SCR-16** | `/pengaturan/akun` | **Pemilik Sahaja** | Direktori pengguna sistem: buat/aktifkan akun Staf & Penghuni (F-01), opsi reset kredensial. |
| **SCR-17** | `/pengaturan/profil`| **Pemilik Sahaja** | Konfigurasi identitas kost, alamat, kontak pengelola, dan nomor rekening bank resmi. |
| **SCR-18** | `/profil` | Pemilik & Staf | **Profil Akun Saya & Ganti Kata Sandi**: Penggantian kata sandi mandiri & info kontak pribadi. |
| **SCR-19** | `/pengumuman` | Pemilik & Staf | Buat & kelola papan pengumuman kost (jadwal kuras toren, listrik padam, aturan baru). |
| **SCR-20** | `/aktivitas` | **Pemilik Sahaja** | Log audit trail: jejak pencatatan pembayaran staf, perubahan tarif sewa, dan status kamar. |

---

### 2.3 Portal Penghuni Mandiri (Tenant Self-Service)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SCR-P01** | `/portal` | Penghuni Sahaja | **Beranda Kamar Penghuni**: Menampilkan nomor kamar aktif, hitung mundur check-in (jika pra-hunian), tanggal jatuh tempo, banner pengumuman kost, dan kontak darurat. Mode read-only untuk alumni sewa. |
| **SCR-P02** | `/portal/tagihan` | Penghuni Sahaja | **Lembar Tagihan Saya**: Invoice sewa aktif, rincian biaya pokok + deposit + utilitas listrik, riwayat kwitansi lunas, dan form konfirmasi transfer bank. |
| **SCR-P03** | `/portal/tiket` | Penghuni Sahaja | **Daftar Komplain Saya**: Riwayat seluruh laporan perbaikan fasilitas yang diajukan untuk unit kamarnya. |
| **SCR-P04** | `/portal/tiket/baru` | Penghuni Sahaja | **Form Lapor Kerusakan (F-07)**: Input judul, kronologi kerusakan, dan **area unggah wajib minimal satu foto/video bukti kerusakan**. |
| **SCR-P05** | `/portal/tiket/:id` | Penghuni Sahaja | **Pelacakan Perbaikan**: Indikator 5 tahapan visual (*Diterima -> Ditugaskan -> Pengerjaan -> Pengecekan -> Selesai*), estimasi teknisi, dan thread obrolan dua arah. |
| **SCR-P06** | `/portal/profil` | Penghuni Sahaja | **Profil & Keamanan Akun**: Form ganti kata sandi mandiri, data nomor kontak darurat keluarga, dan registrasi plat nomor kendaraan motor/mobil. |
| **SCR-P07** | `/portal/panduan` | Penghuni Sahaja | **Buku Saku Kost**: Password WiFi aktif, aturan jam bertamu/gerbang malam, jadwal buang sampah, kontak darurat lingkungan/PLN/RS. |
| **SCR-P08** | `/portal/izin-tamu` | Penghuni Sahaja | **Izin Tamu Menginap**: Formulir pelaporan tamu menginap sementara untuk kepatuhan tata tertib. |

---

### 2.4 Dokumen Cetak & Ekspor WhatsApp (Print / Share Views)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **DOC-01** | `/kuitansi/:id` | Semua Terkait | Struk kuitansi digital bebas navbar: memuat stempel LUNAS, QR verifikasi, dan tombol 1-klik *Bagikan ke WhatsApp*. |
| **DOC-02** | `/kontrak/:id/cetak` | Pemilik & Staf | Format Surat Perjanjian Sewa Kost standar A4 untuk ditandatangani di atas meterai. |
| **DOC-03** | `/invoice/:id` | Semua Terkait | Lembar penagihan sewa resmi dengan rincian rekening transfer dan instruksi pembayaran. |

---

### 2.5 Halaman Utilitas & Sistem (System & Error Boundary)
| Kode Layar | Rute URL | Akses Peran | Deskripsi & Komponen Utama |
|---|---|---|---|
| **SYS-01** | `/notifikasi` | Semua Pengguna | Riwayat notifikasi in-app (tiket diupdate, invoice baru terbit, pembayaran disahkan). |
| **SYS-02** | `/403` | Semua Pengguna | Tampilan *Akses Ditolak (Forbidden)* saat pengguna mencoba membuka halaman di luar wewenangnya. |
| **SYS-03** | `/404` | Semua Pengguna | Tampilan *Halaman Tidak Ditemukan (Not Found)* dengan tombol kembali ke dashboard peran. |

---

## 3. Diagram Alur Hubungan & Navigasi Antar Peran

```
                                      [ /login (SCR-01) ]
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        ▼                      ▼                      ▼
                [ Peran: Pemilik ]      [ Peran: Staf ]        [ Peran: Penghuni ]
                        │                      │                      │
            ┌───────────┴───────────┐          │          ┌───────────┴───────────┐
            ▼                       ▼          ▼          ▼                       ▼
      SCR-02: /dashboard        SCR-13:    SCR-02:    SCR-P01: /portal        SCR-P02:
     (Dasbor Eksekutif)        /laporan   /dashboard (Beranda Kamar)         /portal/tagihan
            │                  (Owner)    (Opsional)      │                       │
            ├── SCR-03 /kamar                  │          ├── SCR-P03: /portal/tiket
            ├── SCR-05 /penghuni               ├── SCR-03 │   ├── SCR-P04: /baru (Wajib Foto)
            ├── SCR-09 /tagihan                ├── SCR-05 │   └── SCR-P05: /:id (5 Tahap Tracker)
            │   └── SCR-09M: /meteran          ├── SCR-09 ├── SCR-P06: /portal/profil (Ganti Sandi)
            ├── SCR-11 /pembayaran (Sahkan)    ├── SCR-11 ├── SCR-P07: /portal/panduan (WiFi/Rules)
            ├── SCR-14 /tiket                  │  (Catat) └── SCR-P08: /portal/izin-tamu
            ├── SCR-16 & 17 Pengaturan         ├── SCR-14
            ├── SCR-18 /profil (Ganti Sandi)   ├── SCR-18 /profil (Ganti Sandi)
            ├── SCR-19 /pengumuman             └── SCR-19 /pengumuman
            └── SCR-20 /aktivitas (Audit)
```

---

## 4. Matriks Ringkasan Hak Akses (RBAC Matrix)

| Modul / Fitur | Owner | Staff | Penghuni | Catatan Kontrol Keamanan |
|---|:---:|:---:|:---:|---|
| **Manajemen Kamar & Fasilitas** | Penuh (CRUD) | Lihat & Update Status | Hanya unit miliknya | Staf hanya update status (kotor/bersih). |
| **Data Penghuni & Kendaraan** | Penuh (CRUD) | Lihat & Koordinasi | Hanya profil sendiri | Termasuk nomor plat motor/mobil. |
| **Pencatatan Sub-Meteran Listrik** | Ya | Ya | Hanya melihat hasil tagihan | Dicatat tiap tanggal tutup buku. |
| **Penerbitan Invoice Tagihan** | Penuh | Matriks Tagihan | Invoice miliknya | Otomatis dibuat tiap siklus sewa. |
| **Catat Pembayaran Masuk** | Ya | Ya (Status Pending) | Ya (Konfirmasi Transfer) | **Zero Self-Approval**: Staf dilarang mengesahkan transaksi. |
| **Verifikasi Pembayaran Bank** | **Ya (Otoritas Tunggal)**| ❌ Ditolak | ❌ Ditolak | Saldo sewa hanya berkurang jika Owner approve. |
| **Laporan Finansial & Arus Kas** | **Ya (Owner-Only)**| ❌ Ditolak | ❌ Ditolak | Disembunyikan total dari Staf/Penghuni. |
| **Buat Tiket Perbaikan Kamar** | Ya | Ya | Ya (Wajib Foto/Video) | Pelaporan mandiri penyewa wajib bukti fisik. |
| **Kelola Progres Tiket & Komentar**| Ya | Ya | Thread Diskusi Saja | Mengubah status dari Diterima s.d. Selesai. |
| **Papan Pengumuman & Broadcast** | Ya | Ya | Baca Banner Pengumuman | Notifikasi massal pemadaman/aturan. |
| **Ganti Kata Sandi Mandiri** | Ya (`/profil`) | Ya (`/profil`) | Ya (`/portal/profil`) | Form mandiri untuk seluruh peran login. |
| **Aktivasi Sandi Perdana** | - | Ya (`/aktivasi-sandi`) | Ya (`/aktivasi-sandi`) | Intersepsi pergantian password sementara. |
| **Log Jejak Audit (*Audit Trail*)**| **Ya (Owner-Only)**| ❌ Ditolak | ❌ Ditolak | Rekam jejak siapa input bayar / ganti status. |

---

## 5. Pemetaan Prototipe Mockup HTML (Fase M04)

Seluruh prototipe layar interaktif saling terhubung dan dapat diuji langsung di `docs/design/screens/`:

| File Prototipe | Kode Layar | Fokus Pengguna & Peran | Skenario Pengujian |
|---|---|---|---|
| `WF-01-login.html` | SCR-01 | Hub Masuk 3 Peran (Pemilik, Staf, Penghuni) | [SCENARIOS_WF01.md](SCENARIOS_WF01.md) |
| `WF-02-dashboard.html` | SCR-02 | Dasbor Eksekutif Finansial & Okupansi (Pemilik) | [SCENARIOS_WF02.md](SCENARIOS_WF02.md) |
| `WF-02-staf-dashboard.html` | SCR-02-STAF | Dasbor Operasional Lapangan, Checklist & Catat Bayar (Staf) | [SCENARIOS_WF02.md](SCENARIOS_WF02.md#skenario-02-akses-dasbor-operasional-staf--pembatasan-hak-akses-staff-restricted-mode) |
| `WF-03-kamar.html` | SCR-03 / 04 | Katalog 15 Unit Kamar Kost & Drawer Tambah Kamar | [SCENARIOS_WF03.md](SCENARIOS_WF03.md) |
| `WF-04-penghuni.html` | SCR-05 / 06 | Direktori Penyewa Kost & Modal Tambah Penghuni | [SCENARIOS_WF04.md](SCENARIOS_WF04.md) |
| `WF-05-tagihan.html` | SCR-09 / 10 | Matriks Penagihan Bulanan & Invoice Digital | [SCENARIOS_WF05.md](SCENARIOS_WF05.md) |
| `WF-06-pembayaran.html` | SCR-11 | Verifikasi Pemilik & Pencatatan Pembayaran Parsial | [SCENARIOS_WF06.md](SCENARIOS_WF06.md) |
| `WF-07-laporan.html` | SCR-12 / 13 | Laporan Finansial & Okupansi (Owner-Only) | [SCENARIOS_WF07.md](SCENARIOS_WF07.md) |
| `WF-08-tiket.html` | SCR-14 / 15 | Antrean & Triase Tiket Pemeliharaan Lapangan | [SCENARIOS_WF08.md](SCENARIOS_WF08.md) |
| `WF-09-pengaturan.html` | SCR-16 / 17 | Konfigurasi Properti, Rekening Bank, & Akun Staf | [SCENARIOS_WF09.md](SCENARIOS_WF09.md) |
| `WF-10-portal-penghuni.html` | SCR-P01 s.d P08 | Portal Layanan Mandiri Terpadu Penghuni (Timeline Sewa, Tagihan BCA, Kuitansi DOC-01, Sub-Meteran kWh, Deposit Escrow, Izin Tamu, WiFi & Panduan) | [SCENARIOS_WF10.md](SCENARIOS_WF10.md) |
| `WF-10-portal-dashboard.html` | SCR-P01 | Beranda Kamar Mandiri Penghuni (Kamar A-04) & Fasilitas | [SCENARIOS_WF10.md](SCENARIOS_WF10.md) |
| `WF-10-portal-tagihan.html` | SCR-P02 | Lembar Tagihan Saya, Konfirmasi Transfer Bank & Kuitansi | [SCENARIOS_WF10.md](SCENARIOS_WF10.md) |
| `WF-10-portal-tiket.html` | SCR-P03 | Daftar Riwayat Komplain & Tiket Kerusakan Kamar Saya | [SCENARIOS_WF10.md](SCENARIOS_WF10.md) |
| `WF-11-portal-tiket-baru.html` | SCR-P04 | Formulir Pengajuan Komplain Kerusakan Kamar (Wajib Foto/Video F-07) | [SCENARIOS_WF11.md](SCENARIOS_WF11.md) |
| `WF-12-portal-tiket-detail.html` | SCR-P05 | Detail Tiket, Pelacak 5 Tahap Estify & Thread Chat Multi-Peran | [SCENARIOS_WF12.md](SCENARIOS_WF12.md) |
