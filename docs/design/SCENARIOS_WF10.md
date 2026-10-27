# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-10: Portal Mandiri Penghuni & Manajemen Tagihan Digital (SCR-P01 & SCR-P02)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: [`docs/design/screens/WF-10-portal-penghuni.html`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-10-portal-penghuni.html)  
> **Fitur Terkait**: **F-01** (Akses dan Peran / RBAC Penghuni), **F-04** (Tagihan Berulang & Perpanjangan), **F-05** (Konfirmasi Pembayaran Transfer, Penolakan Klaim, Cicilan, & Reversal), **F-07** (Status Tiket Aktif & Empty State)  
> **User Stories KANBAN**: `RK-001` (Portal Penghuni Mandiri), `RK-010` (Rincian Tagihan Kamar), `RK-013` (Konfirmasi Pembayaran Mandiri), `RK-018` (Pintasan Tracking Tiket)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Tenant Role - Kamar A-04 Budi Santoso)** — *Pemilik dan Staf diarahkan ke Dasbor Manajemen*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-10 (`SCR-P01` & `SCR-P02`)** adalah portal swalayan mandiri (*Tenant Self-Service Hub*) khusus untuk penghuni kost terdaftar di RumaKost. Mengadopsi bahasa visual **Estify Real Estate DNA**, antarmuka ini memberikan transparansi penuh atas seluruh siklus hidup hunian (*tenant lifecycle*): mulai dari fase pra-hunian (*pending check-in*), masa sewa aktif, konfirmasi lanjut perpanjangan sewa, tagihan berjalan dan cicilan parsial, rincian sub-meteran kWh listrik, konfirmasi transfer bank, penanganan klaim transfer ditolak pemilik, kwitansi digital bebas navbar (*DOC-01*), pelacakan progres servis kerusakan maupun status bebas keluhan (*empty state*), saldo deposit jaminan (*escrow*), buku panduan tata tertib, hingga rencana check-out dan status alumni.

### Empat Pilar Arsitektur Antarmuka Penghuni:
1. **Pemisahan Wewenang Data Privat (Zero Cross-Tenant Leak)**: Penghuni hanya memiliki akses ke kamar dan tagihan miliknya sendiri (Kamar A-04). Sistem tidak menampilkan data penghuni lain atau data keuangan kost global.
2. **Siklus Pembayaran Transparan, Meteran, & Kwitansi Sah (F-04 & F-05)**: Penghuni dapat meninjau rincian tagihan sewa pokok, iuran kebersihan/sampah, dan sub-meteran listrik kWh, menyalin nomor rekening resmi bank pemilik kost, mengonfirmasi transfer dengan melampirkan struk, melihat alasan jika transfer ditolak pemilik (*payment rejected notice*), serta mencetak atau membagikan kuitansi digital (*DOC-01*) berstempel LUNAS ke WhatsApp.
3. **Pintasan Cepat Pelaporan & Tracking Tiket (F-07)**: Menghubungkan langsung penghuni ke pelacakan status perbaikan fasilitas aktif via stepper 5 segmen Estify, menyajikan status kamar normal (*zero ticket empty state*), serta tombol navigasi menuju formulir pembuatan komplain baru ([`WF-11`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-11-portal-tiket-baru.html)) dan lembar detail komprehensif ([`WF-12`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-12-portal-tiket-detail.html)).
4. **Utilitas Keseharian, Deposit, & Tata Tertib**: Kredensial WiFi dedicated dengan tombol *1-Click Copy*, pengumuman pemeliharaan fasilitas bersama, transparansi saldo deposit jaminan, formulir pelaporan tamu menginap (*Izin Tamu*), pembaharuan plat nomor kendaraan, konfirmasi lanjut sewa, serta rencana check-out mandiri.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WF-10 TENANT PORTAL ARSITEKTUR                                 │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 1. KOLOM UTAMA KIRI (~68% FLOW CONTAINER)                        │ 2. SIDEBAR KANAN (380PX FIXED)│
│    ├─ HERO BANNER WELCOME & LEASE TIMELINE                       │    ├─ CARD 0: DEPOSIT ESCROW  │
│    │  • Sapaan Personal: Budi Santoso (Kamar A-04)               │    │  • Saldo Jaminan: Rp 500rb│
│    │  • Badge Spesifikasi: Deluxe AC · Rp 1.500.000/bln          │    │  • Status: Aman Tersimpan │
│    │  • Chips: Kasur Queen, KM Dalam, Sub-meteran, WiFi 50 Mbps  │    │                               │
│    │  • Hitung Mundur: 10 Okt - 10 Nov 2026 (Sisa 15 Hari)       │    ├─ CARD 1: WIFI & FASILITAS│
│    │  • Konfirmasi Lanjut Sewa: [Lanjut Sewa Bulan Depan]        │    │  • SSID: RumaKost_Lt2_5G │
│    │  • Progress Track Siklus Sewa Bulanan (50%)                 │    │  • Sandi: kostbersama2026│
│    ├─ TAGIHAN AKTIF BULAN INI (#INV-202611-A04)                  │    │  • [Salin Sandi] + Toast │
│    │  • Sewa Kamar Pokok       : Rp 1.500.000                    │    │  • Tombol [Buku Panduan] │
│    │  • Iuran Sampah/Kebersihan: Rp    50.000                    │    │                               │
│    │  • Listrik Sub-Meteran    : Rp         0 [Detail kWh]       │    │                               │
│    │  • Total Tagihan          : Rp 1.550.000                    │    ├─ CARD 2: PENGUMUMAN      │
│    │  • Status: Menunggu / Pending Verifikasi / Ditolak Owner    │    │  • Kuras Toren Air Bersama│
│    │  • CTA: [Konfirmasi Transfer] & [Unduh Invoice PDF]         │    │  • Waktu: Sabtu 28 Okt   │
│    ├─ TIKET PERBAIKAN AKTIF ATAU EMPTY STATE                     │    │                               │
│    │  • Jika ada tiket: Estify 5-Segment Stepper (Pengerjaan)    │    ├─ CARD 3: KONTAK PENGELOLA│
│    │  • Jika nihil tiket: Empty State "Semua Fasilitas Baik"     │    │  • Pemilik : Budi Santoso│
│    │  • CTA: [Pantau Detail (WF-12)] & [+ Lapor Baru (WF-11)]    │    │  • Staf Ops: Rini S.     │
│    ├─ TABEL RIWAYAT PEMBAYARAN LUNAS & REVERSAL                  │    │  • Tombol [Chat WhatsApp]│
│    │  • #INV-202610-A04 (Rp 1.500.000 · LUNAS) [Kwitansi DOC-01] │    │                               │
│    │  • #INV-202609-A04 (Rp 1.500.000 · LUNAS) [Kwitansi DOC-01] │    ├─ CARD 4: WIDGET PINTASAN │
│    │  • #INV-202608-A04 (Rp 2.000.000 · LUNAS) [Kwitansi DOC-01] │    │  • Lapor Tamu Menginap   │
│    │  • #REV-202610-01 (Rp 500.000 · DIBATALKAN) [Audit Reversal]│    │  • Profil & Plat Nomor   │
│    │                                                             │    │  • Rencana Check-Out     │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai ketetapan **Frozen Scope Medium (1 Properti Mandiri, 7 Kelompok P0)** pada `docs/pm/SCOPE_STATEMENT.md`:

| Area Batasan | Ketetapan Scope In-Scope | Batasan Mutlak (Out-of-Scope) |
| :--- | :--- | :--- |
| **Pemisahan Peran** | Layar terisolasi khusus peran **Penghuni Kost** (Kamar A-04 Budi Santoso). | Dilarang menampilkan navigasi laporan laba bersih, katalog unit kamar lain, atau direktori pengguna global. |
| **Metode Pembayaran** | Transfer bank manual ke rekening resmi BCA Pemilik & pelaporan konfirmasi upload struk. | Tidak ada integrasi payment gateway otomatis (Midtrans/Xendit/QRIS Dinamis) atau auto-debet perbankan. |
| **Verifikasi Pembayaran** | Pengajuan struk hanya mengubah status menjadi *"Menunggu Verifikasi Pemilik"*. Pemilik berhak mengesahkan atau menolak klaim. | **Zero Self-Approval**: Penghuni dilarang mengesahkan tagihan secara mandiri menjadi status "Lunas". |
| **Komunikasi** | Integrasi tautan URL langsung `https://wa.me/` dengan pesan permulaan terformat. | Tidak ada integrasi WhatsApp Business Cloud API berbayar atau chatbot AI penjawab otomatis. |
| **Data Pengujian** | Data sewa, nomor invoice, nomor rekening, dan kontak adalah **Data Sintetis**. | Dilarang memuat informasi pribadi (PII) asli dari pemilik atau penghuni riil. |

---

## 3. Matriks Data Pengujian Baseline (Testing Fixtures)

* **Nama Penghuni**: Budi Santoso (`budi.penghuni@rumakost.id`)
* **Unit Kamar**: Kamar A-04 (Lantai 2, Kamar Pojok Timur) &bull; Tipe: Deluxe AC &bull; Rp 1.500.000 / bulan
* **Fasilitas Kamar**: Kasur Queen Size, Kamar Mandi Dalam, Sub-Meteran Listrik Kwh Mandiri, Akses WiFi 50 Mbps
* **Siklus Sewa Berjalan**: 10 Oktober 2026 s.d. 10 November 2026 (Sisa 15 Hari)
* **Tagihan Berjalan**: `#INV-202611-A04` (Rp 1.550.000) &bull; Jatuh Tempo: 10 November 2026
* **Angka Sub-Meteran Listrik**: 1.240 kWh (Lalu) &rarr; 1.315 kWh (Kini) = 75 kWh (Masuk kuota gratis 100 kWh)
* **Deposit Jaminan (Escrow)**: Rp 500.000 (Aman tersimpan di rekening pengelola)
* **Tiket Kerusakan Aktif**: `#TK-2026-004` (AC Kamar Kurang Dingin & Meneteskan Air) &bull; Tahap 3 (Pengerjaan Lapangan)
* **Rekening Resmi Kost**: Bank Central Asia (BCA) `8830-123-456` a.n. Budi Santoso

---

## 4. Daftar Lengkap 26 Skenario Pengujian (End-to-End & Edge Cases)

---

### SKENARIO 01: Verifikasi Tampilan Beranda Kamar & Identitas Kontrak
- **Tujuan**: Memastikan data nomor kamar, tipe kamar, tarif sewa, fasilitas, dan tanggal jatuh tempo dirender secara presisi.
- **Kondisi Awal**: URL `WF-10-portal-penghuni.html` dibuka secara langsung.
- **Langkah Pengujian**:
  1. Periksa topbar navigasi pada bagian atas: pastikan navigasi pil menampilkan *Beranda Kamar*, *Tagihan Saya*, dan *Lapor Kerusakan*.
  2. Periksa identitas pengguna di sisi kanan topbar: badge `Kamar A-04` dan avatar `BS (Budi S. - Penghuni)`.
  3. Amati hero banner gelap sambutan: periksa nama *"Halo, Budi Santoso!"*, badge kamar, lokasi lantai 2, serta 4 chip fasilitas.
  4. Amati bilah hitung mundur masa sewa: pastikan rentang tanggal menampilkan *"10 Okt 2026 – 10 Nov 2026"* dengan keterangan *"Sisa 15 Hari Lagi"*.
- **Hasil yang Diharapkan**: Seluruh identitas kontrak tampil presisi dengan Estify Dark Gradient DNA.

---

### SKENARIO 02: Peninjauan Rincian Invoice Tagihan Berjalan & Unduh PDF
- **Tujuan**: Memvalidasi akurasi perhitungan nominal tagihan sewa kamar berjalan dan simulasi pengunduhan invoice.
- **Langkah Pengujian**:
  1. Periksa rincian item pada kartu tagihan: Sewa Pokok (Rp 1.500.000) + Sampah (Rp 50.000) + Listrik Sub-Meteran (Rp 0).
  2. Periksa baris total kewajiban: **Rp 1.550.000**.
  3. Klik tombol **"Unduh Invoice PDF"**.
- **Hasil yang Diharapkan**: Toast notifikasi informatif muncul: *"Mengunduh berkas invoice digital #INV-202611-A04.pdf..."*.

---

### SKENARIO 03: Alur Konfirmasi Pembayaran Transfer Bank Mandiri (F-05)
- **Tujuan**: Memvalidasi alur modal bayar, tombol salin rekening BCA, dropzone struk transfer, dan transisi status tagihan.
- **Langkah Pengujian**:
  1. Klik tombol **"Konfirmasi Pembayaran Transfer"**.
  2. Klik tombol **"Salin No. Rek"** pada baris rekening BCA `8830-123-456`.
  3. Klik dropzone atau pilih file struk transfer (`Struk_Transfer_BCA_Budi.jpg`).
  4. Klik tombol **"Kirim Konfirmasi Bayar"**.
- **Hasil yang Diharapkan**:
  - Toast *"Nomor Rekening BCA berhasil disalin ke clipboard!"* muncul.
  - Dropzone menampilkan nama berkas struk aktif.
  - Status invoice berubah menjadi badge oranye: **"Menunggu Verifikasi Pemilik"**.
  - Tombol bayar utama dinonaktifkan (`disabled`) dengan teks *"Konfirmasi Terkirim"*.

---

### SKENARIO 04: Pelacakan Status Tiket Kerusakan Aktif (Estify 5-Segment Stepper)
- **Tujuan**: Memverifikasi antarmuka pemantauan status perbaikan fasilitas kamar dengan stepper 5 segmen Estify.
- **Langkah Pengujian**:
  1. Amati kartu tiket aktif `#TK-2026-004` (AC Kamar Bocor).
  2. Periksa segmen stepper: Segmen 1 & 2 hijau (*Completed*), Segmen 3 oranye berdenyut (*Pengerjaan Aktif*), Segmen 4 & 5 abu-abu (*Pending*).
  3. Klik tombol **"Pantau Detail Tracking"** (mengarahkan ke `WF-12`).
  4. Klik tombol **"Lapor Kerusakan Baru"** (mengarahkan ke `WF-11`).
- **Hasil yang Diharapkan**: Stepper 5 segmen merefleksikan status pengerjaan secara intuitif dan tombol pintasan mengarah ke halaman yang tepat.

---

### SKENARIO 05: Interaktivitas Kredensial WiFi & Pengumuman Kost
- **Tujuan**: Memastikan fungsionalitas salin sandi WiFi kamar dan keterbacaan pengumuman operasional.
- **Langkah Pengujian**:
  1. Klik tombol **"Salin"** pada baris SSID `RumaKost_Lt2_5G`.
  2. Klik tombol **"Salin Sandi"** pada kata sandi `kostbersama2026`.
  3. Periksa banner pengumuman jadwal kuras toren air.
- **Hasil yang Diharapkan**: Toast sukses muncul mengonfirmasi teks telah disalin ke clipboard.

---

### SKENARIO 06: Koordinasi Cepat via WhatsApp Pengelola Kost
- **Tujuan**: Memvalidasi integrasi tautan kontak darurat dan koordinasi pengelola via WhatsApp.
- **Langkah Pengujian**: Klik tombol **"WhatsApp"** pada kontak Budi Santoso (Pemilik) atau Rini Setiawati (Staf).
- **Hasil yang Diharapkan**: Membuka URL resmi `https://wa.me/` pada tab baru dengan pesan permulaan terformat otomatis.

---

### SKENARIO 07: Pengajuan Lapor Tamu Menginap (Modal SCR-P08)
- **Tujuan**: Memverifikasi formulir izin tamu menginap sementara guna kepatuhan tata tertib kost.
- **Langkah Pengujian**:
  1. Klik tombol **"Ajukan Izin Tamu"**.
  2. Isi data tamu: Nama *"Andi Santoso"*, Hubungan *"Adik Kandung"*, Durasi *"1 Hari"*, Plat Kendaraan *"B 3456 KST"*.
  3. Klik tombol **"Kirim Pemberitahuan"**.
- **Hasil yang Diharapkan**: Modal tertutup dan muncul toast: *"Pemberitahuan izin tamu atas nama Andi Santoso telah dicatat untuk pengelola kost."*.

---

### SKENARIO 08: Peninjauan Riwayat Pembayaran & Kwitansi Digital Lunas
- **Tujuan**: Memastikan riwayat sewa masa lalu tersaji lengkap dengan akses kwitansi resmi.
- **Langkah Pengujian**:
  1. Periksa 3 baris histori sewa sebelumnya (Oktober, September, Agustus 2026 berstatus Lunas).
  2. Klik tombol **"Kwitansi"** pada baris invoice Oktober 2026.
- **Hasil yang Diharapkan**: Modal dialog kwitansi digital resmi (*DOC-01*) terbuka dengan stempel LUNAS.

---

### SKENARIO 09: Uji Ergonomi Seluler (Mobile Responsive & Bottom Navigation)
- **Tujuan**: Memastikan antarmuka portal dapat dioperasikan secara ergonomis pada perangkat ponsel pintar (*viewport < 768px*).
- **Langkah Pengujian**: Perkecil browser ke lebar 375px dan uji tap target pada *Fixed Bottom Bar* serta FAB tengah `+`.
- **Hasil yang Diharapkan**: Layout reflow vertikal mulus, bottom bar fixed di bawah, dan FAB tengah membuka formulir komplain `WF-11`.

---

### SKENARIO 10: Uji Guardrail Keamanan & RBAC Isolasi Data
- **Tujuan**: Menjamin bahwa peran Penghuni dicegat saat mencoba membuka rute sensitif milik Pemilik Kost.
- **Langkah Pengujian**: Ketik `WF-02-dashboard.html` atau `WF-07-laporan.html` di address bar browser.
- **Hasil yang Diharapkan**: Script pengaman di `components.js` mencegat akses dan meredirect kembali ke `WF-10-portal-penghuni.html`.

---

### SKENARIO 11: Status Pra-Hunian / Menunggu Check-In (`?status=pending_checkin`)
- **Tujuan**: Menguji tampilan portal bagi calon penyewa baru yang telah membayar sewa awal namun belum menempati kamar fisik.
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?status=pending_checkin`.
- **Hasil yang Diharapkan**: Banner menampilkan *"Simulasi Pra-Hunian"*, hitung mundur check-in H-5, jadwal serah terima kunci, serta status DP/Sewa Awal Lunas tanpa penagihan ulang.

---

### SKENARIO 12: Status Alumni Kost / Kontrak Berakhir — Mode Read-Only (`?mode=archive`)
- **Tujuan**: Memastikan akun penyewa yang telah check-out dikunci ke dalam status arsip baca-saja (*read-only*).
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?mode=archive`.
- **Hasil yang Diharapkan**: Status sewa beralih ke arsip alumni, tombol bayar ditutup, tombol tiket dinonaktifkan, namun seluruh histori kwitansi masa lalu tetap dapat diakses.

---

### SKENARIO 13: Status Tagihan Terlambat Lewat Jatuh Tempo (`?status=overdue`)
- **Tujuan**: Memvalidasi penegakan visual jika pembayaran sewa melewati tanggal jatuh tempo (H+3).
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?status=overdue`.
- **Hasil yang Diharapkan**: Border kartu berwarna merah, badge status *Destructive Triad* *"Terlambat 3 Hari"*, dan penegasan batas toleransi keterlambatan.

---

### SKENARIO 14: Status Pembayaran Parsial / Cicilan Bertahap (`?status=partial`)
- **Tujuan**: Menguji penanganan fitur inti F-05 untuk pembayaran sebagian sewa kamar.
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?status=partial`.
- **Hasil yang Diharapkan**: Menampilkan rincian cicilan masuk Rp 1.000.000 dan sisa kekurangan Rp 550.000 yang otomatis ditarik ke dalam modal transfer.

---

### SKENARIO 15: Penghuni Pemegang Unit Ganda / Multi-Unit Switcher (`?multi=true`)
- **Tujuan**: Memastikan penghuni yang menyewa lebih dari satu kamar (misal: A-04 & A-05) dapat berpindah unit tanpa salah alur.
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?multi=true`.
- **Hasil yang Diharapkan**: Header menyajikan dropdown pemilih unit (*Kamar A-04 ⇄ Kamar A-05*) dan memperbarui konteks data saat dipindahkan.

---

### SKENARIO 16: Pembaruan Profil Mandiri & Pendaftaran Plat Kendaraan (`SCR-P06`)
- **Tujuan**: Memverifikasi kemampuan penghuni memperbarui kontak darurat keluarga dan nomor plat motor/mobil untuk akses parkir kost.
- **Hasil yang Diharapkan**: Formulir modal menyimpan data nomor kontak darurat dan plat kendaraan dengan feedback toast sukses.

---

### SKENARIO 17: Akses Buku Saku Panduan & Tata Tertib Kost (`SCR-P07`)
- **Tujuan**: Memastikan penghuni dapat membaca tata tertib kost secara digital kapan saja.
- **Hasil yang Diharapkan**: Modal menyajikan jam malam gerbang (23:00 WIB), aturan bertamu di ruang tamu umum, dan jadwal buang sampah.

---

### SKENARIO 18: Pengajuan Rencana Check-Out / Notice to Vacate 30 Hari
- **Tujuan**: Memfasilitasi penghuni yang tidak berencana memperpanjang sewa untuk memberikan pemberitahuan resmi kepada pengelola.
- **Hasil yang Diharapkan**: Form merekam tanggal check-out, nomor rekening pengembalian deposit, alasan, dan mengirim notifikasi ke pengelola kost.

---

### SKENARIO 19: Transparansi Status Saldo Deposit Jaminan (Escrow Tracking)
- **Tujuan**: Menjamin ketenangan penyewa terkait kejelasan uang jaminan kamar yang dipegang pengelola.
- **Hasil yang Diharapkan**: Kartu escrow samping menampilkan saldo Rp 500.000 aman tersimpan beserta syarat pengembalian 100%.

---

### SKENARIO 20: Transparansi Sub-Meteran Listrik kWh & Audit Pemakaian (`SCR-09M`)
- **Tujuan**: Mencegah sengketa penagihan listrik dengan menyediakan transparansi angka meteran awal, angka akhir, dan batas kuota gratis.
- **Hasil yang Diharapkan**: Modal perbandingan meteran menampilkan angka awal (1.240 kWh) vs akhir (1.315 kWh) dengan status pemakaian 75 kWh di bawah kuota gratis 100 kWh.

---

### SKENARIO 21: Pratinjau Kuitansi Digital Lunas Bebas Navbar (`DOC-01`)
- **Tujuan**: Memfasilitasi penghuni melihat bukti pembayaran resmi berstempel LUNAS, ber-QR code otentikasi, serta tombol cetak dan bagikan ke WhatsApp.
- **Hasil yang Diharapkan**: Tampilan kwitansi formal standar `DOC-01` dengan stempel tanda air hijau dan tombol cetak dokumen.

---

### SKENARIO 22: Transparansi Jejak Audit Koreksi Pembayaran / Reversal (`?status=reversed`)
- **Tujuan**: Memverifikasi penegakan aturan F-05 bahwa salah catat pembayaran ditandai secara transparan sebagai jurnal reversal.
- **Hasil yang Diharapkan**: Baris transaksi salah catat tampil tercoret dengan status *"Dibatalkan (Salah Nominal)"* tanpa penghapusan data sepihak.

---

### SKENARIO 23: Penolakan Klaim Transfer oleh Pemilik Kost (`?status=rejected`)
- **Tujuan**: Menguji alur ketika struk transfer yang dikirim penghuni tidak valid atau mutasi bank belum masuk saat diperiksa Pemilik Kost.
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?status=rejected`.
- **Langkah Pengujian**:
  1. Periksa kartu tagihan sewa.
  2. Amati badge status: berubah menjadi merah *Destructive Triad* bertuliskan *"Klaim Pembayaran Ditolak Pemilik"*.
  3. Amati kotak pemberitahuan alasan penolakan: *"Alasan Owner: Mutasi pada rekening BCA belum ditemukan untuk nominal Rp 1.550.000. Harap periksa tanggal efektif transfer atau unggah struk mutasi yang valid."*.
  4. Periksa tombol aksi: tombol berubah menjadi **[Unggah Ulang Bukti Transfer]** dan tombol hubungi pemilik via WhatsApp.
- **Hasil yang Diharapkan**: Penghuni memperoleh feedback transparan mengapa klaim bayar belum di-ACC tanpa kebingungan, serta dapat segera mengirim ulang bukti yang benar.

---

### SKENARIO 24: Kondisi Kamar Bebas Keluhan / Nihil Tiket Aktif (`?ticket=empty`)
- **Tujuan**: Memastikan antarmuka menyajikan status positif (*Empty State*) saat tidak ada laporan kerusakan aktif di kamar penyewa.
- **Kondisi Awal**: Buka URL: `WF-10-portal-penghuni.html?ticket=empty`.
- **Langkah Pengujian**:
  1. Amati kartu pelaporan pemeliharaan fasilitas kamar.
  2. Periksa tampilan kartu: stepper progres 5 tahap disembunyikan.
  3. Periksa pesan status kamar: menampilkan kartu hijau lembut dengan ikon centang pelindung bertuliskan *"Seluruh Fasilitas Kamar Berfungsi Normal &mdash; Tidak ada tiket keluhan aktif untuk Kamar A-04"*.
  4. Periksa tombol CTA: tombol tetap menyediakan opsi **[+ Lapor Kerusakan Baru]** jika kelak terjadi kendala mendadak.
- **Hasil yang Diharapkan**: Antarmuka terlihat tenang (*visual calm*), melegakan penghuni, dan bebas dari clutter informasi kadaluarsa.

---

### SKENARIO 25: Konfirmasi Rencana Perpanjang Sewa Mandiri (Lease Renewal Intent)
- **Tujuan**: Memfasilitasi penghuni yang ingin mengonfirmasi kelanjutan sewa untuk bulan berikutnya tanpa menunggu ditagih.
- **Kondisi Awal**: Masa sewa mendekati akhir periode berjalan (H-15).
- **Langkah Pengujian**:
  1. Pada kartu Hero Sambutan, amati widget kecil *Rencana Periode Berikutnya*.
  2. Klik tombol **"Lanjut Sewa Bulan Depan"**.
  3. Amati dialog konfirmasi perpanjangan kontrak.
  4. Klik tombol **"Ya, Konfirmasi Lanjut Sewa"**.
- **Hasil yang Diharapkan**: Sistem mencatat komitmen perpanjangan sewa dan menampilkan toast sukses: *"Terima kasih! Konfirmasi perpanjangan sewa Kamar A-04 telah dicatat. Invoice periode Desember 2026 akan terbit tepat waktu."*.

---

### SKENARIO 26: Validasi Batasan Ukuran & Format Berkas Struk Transfer
- **Tujuan**: Memastikan dropzone mengamankan sistem dari pengunggahan berkas yang tidak sesuai ketentuan (F-05 & F-17).
- **Kondisi Awal**: Buka modal konfirmasi pembayaran transfer.
- **Langkah Pengujian**:
  1. Simulasikan pemilihan berkas yang bukan format gambar/PDF (misal: berkas `.exe` atau `.zip`).
  2. Simulasikan pengunggahan gambar dengan ukuran melebihi batas 5 MB.
- **Hasil yang Diharapkan**: Sistem mencegat pengunggahan berkas dan menampilkan toast error bersemantik merah: *"Gagal melampirkan berkas: Format wajib JPG, PNG, atau PDF dengan ukuran maksimal 5 MB."*.

---

## 5. Ringkasan Kepatuhan Standar Kualitas (Quality Checklist)

| Kriteria Kualitas | Status | Catatan Verifikasi |
|---|:---:|---|
| **Estify Visual DNA** | ✅ PASS | Font Poppins, radius `20px/24px`, aksen oranye `#FF7A00`, kanvas `#F7F8FA`. |
| **Bebas Emoji (Anti-Slop)** | ✅ PASS | 100% menggunakan ikon vektor Lucide SVG (`home`, `receipt`, `wifi`, `wrench`, `shield-check`, `qr-code`, dll). |
| **Bebas Alert Browser Mentah**| ✅ PASS | Menggunakan 7 dialog modal Estify dan sistem toast kustom teranimasi (`RumaUI.showToast`). |
| **Aksesibilitas Kontras (WCAG)**| ✅ PASS | Kontras teks body 7.18:1 (AAA), judul 18.72:1 (AAA), status triad terkalibrasi. |
| **Kepatuhan Guardrail F-05** | ✅ PASS | Penghuni hanya bisa submit bukti transfer/cicilan; penolakan klaim dan reversal terdokumentasi transparan. |
| **Kepatuhan Guardrail F-07** | ✅ PASS | Stepper 5 segmen Estify aktif, empty state kamar normal, dan tombol navigasi langsung ke form lapor kerusakan. |
| **Kelengkapan Dokumen Cetak DOC-01** | ✅ PASS | Modal kuitansi resmi lengkap dengan watermark LUNAS dan QR code otentikasi digital. |
| **Kelengkapan Siklus Hidup** | ✅ PASS | Mendukung simulasi Pra-Hunian, Alumni/Arsip, Overdue, Parsial, Rejection, Empty State, Renewal Intent, Multi-Unit, Reversal, dan Notice Check-out via query string URL. |
| **Responsif Ponsel Pintar** | ✅ PASS | Bottom navigation bar ergonomis dengan floating action button (FAB) terpusat. |
