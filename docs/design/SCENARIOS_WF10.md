# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-10: Portal Mandiri Penghuni & Manajemen Tagihan Digital (SCR-P01 & SCR-P02)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-10-portal-penghuni.html`  
> **Fitur Terkait**: **F-01** (Akses dan Peran / RBAC Penghuni), **F-04** (Tagihan Berulang), **F-05** (Konfirmasi Pembayaran Transfer), **F-07** (Status Tiket Aktif)  
> **User Stories KANBAN**: `RK-001` (Portal Penghuni Mandiri), `RK-010` (Rincian Tagihan Kamar), `RK-013` (Konfirmasi Pembayaran Mandiri)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Tenant Role - Kamar A-04 Budi Santoso)** — *Pemilik dan Staf diarahkan ke Dasbor Manajemen*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-10 (`SCR-P01` & `SCR-P02`)** adalah portal swalayan mandiri (*Tenant Self-Service Hub*) khusus untuk penghuni kost terdaftar. Layar ini memberikan transparansi penuh atas masa sewa kamar, rincian tagihan berjalan, riwayat pembayaran yang telah diverifikasi oleh pemilik kost, status tiket perbaikan aktif, serta informasi akses penting fasilitas kost (kredensial WiFi, jadwal sampah, jam malam gerbang).

### Prinsip Desain & Guardrails:
1. **Pemisahan Wewenang Data Privat (Zero Cross-Tenant Leak)**: Penghuni hanya memiliki akses ke kamar dan tagihan miliknya sendiri (Kamar A-04). Sistem tidak menampilkan data penghuni lain atau data keuangan kost global.
2. **Konfirmasi Pembayaran Transfer Mandiri**: Penghuni dapat melihat rekening bank resmi pemilik kost (BCA a.n. Budi Santoso), mengonfirmasi transfer dengan melampirkan file struk, dan memantau status verifikasi transaksi secara real-time.
3. **Pintasan Cepat Pelaporan Kerusakan**: Menghubungkan langsung penghuni ke formulir pembuatan komplain kerusakan fasilitas (`WF-11`) dan pemantauan tiket (`WF-12`).

---

## 2. Matriks Skenario Pengujian Fungsional

### SKENARIO 01: Verifikasi Tampilan Beranda Kamar & Identitas Kontrak
- **Tujuan**: Memastikan data nomor kamar, tipe kamar, biaya sewa, dan tanggal jatuh tempo dirender secara presisi.
- **Kondisi Awal**: Pengguna login sebagai `budi.penghuni@rumakost.id` pada URL `WF-10-portal-penghuni.html`.
- **Langkah-langkah**:
  1. Buka halaman `WF-10-portal-penghuni.html`.
  2. Periksa banner sambutan dan badge kamar pada topbar kanan.
  3. Periksa grid spesifikasi kamar (Kamar A-04, Deluxe AC, Rp 1.500.000/bln, Jatuh tempo 10 Nov 2026).
- **Hasil yang Diharapkan**:
  - Banner menampilkan nama "Budi Santoso" dan badge "KAMAR A-04".
  - Informasi jatuh tempo sewa menampilkan "10 Nov 2026 (15 Hari)".

---

### SKENARIO 02: Konfirmasi Pembayaran Transfer Sewa Mandiri
- **Tujuan**: Memvalidasi alur modal konfirmasi pembayaran transfer bank oleh penghuni beserta simulasi lampiran struk transfer.
- **Kondisi Awal**: Penghuni memiliki invoice aktif `#INV-202611-A04` dengan status "Menunggu Pembayaran".
- **Langkah-langkah**:
  1. Klik tombol **"Konfirmasi Transfer"**.
  2. Amati modal dialog pembayaran yang muncul.
  3. Klik tombol **"Salin"** pada nomor rekening BCA (8830-123-456).
  4. Klik area dropzone unggah struk transfer.
  5. Klik tombol **"Kirim Konfirmasi Bayar"**.
- **Hasil yang Diharapkan**:
  - Modal terbuka dengan animasi halus (*modalZoom*).
  - Toast notifikasi "Nomor rekening BCA disalin!" muncul saat tombol salin ditekan.
  - Dropzone memperbarui label menjadi "Struk_Transfer_BCA_Budi.jpg (1.2 MB) Terlampir".
  - Pasca submit, modal tertutup dan status tagihan berubah menjadi badge oranye: "Menunggu Verifikasi Pemilik", serta tombol bayar dinonaktifkan.

---

### SKENARIO 03: Salin Kata Sandi WiFi & Akses Kontak WhatsApp
- **Tujuan**: Memastikan kenyamanan operasional penghuni dalam mengakses kredensial WiFi dan kontak darurat pengelola kost.
- **Langkah-langkah**:
  1. Pada kartu "Akses WiFi & Fasilitas", klik tombol **"Salin Sandi"**.
  2. Periksa notifikasi toast.
  3. Klik tombol WhatsApp pada kontak Pemilik Kost (Budi Santoso) atau Staf Operasional (Rini Setiawati).
- **Hasil yang Diharapkan**:
  - Teks password `kostbersama2026` disalin ke clipboard dan toast sukses muncul.
  - Tautan WhatsApp membuka URL `wa.me` resmi dengan pesan pembuka otomatis.
