# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-11: Formulir Pelaporan Kerusakan Fasilitas Kamar (SCR-P04)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-11-portal-tiket-baru.html`  
> **Fitur Terkait**: **F-07** (Ticketing Kerusakan Fasilitas dengan Wajib Minimal 1 Foto/Video)  
> **User Stories KANBAN**: `RK-016` (Form Pengajuan Komplain Kerusakan Kamar), `RK-017` (Validasi Lampiran Media Wajib)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Tenant Role - Kamar A-04 Budi Santoso)**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-11 (`SCR-P04`)** adalah formulir pelaporan kerusakan fasilitas (*Maintenance Ticket Submission Form*) yang mematuhi spesifikasi fitur inti **F-07** secara ketat. Layar ini mengharuskan penghuni memilih kategori fasilitas, tingkat urgensi penanganan, memberikan deskripsi kronologis, serta melampirkan **minimal 1 bukti foto atau video** sebelum laporan dapat diterbitkan ke sistem triase operasional pengelola kost.

---

## 2. Matriks Skenario Pengujian Fungsional

### SKENARIO 01: Pemilihan Kategori Fasilitas & Tingkat Urgensi
- **Tujuan**: Memastikan selektor kategori (Pipa, Listrik, AC, Pintu, Kasur, Lainnya) dan kartu urgensi (Mendesak, Normal, Rendah) berinteraksi secara mulus.
- **Kondisi Awal**: Penghuni membuka `WF-11-portal-tiket-baru.html`.
- **Langkah-langkah**:
  1. Klik kartu kategori **"AC & Pendingin"**.
  2. Klik kartu tingkat urgensi **"Normal (Sedang)"**.
- **Hasil yang Diharapkan**:
  - Pill kategori AC aktif dengan warna brand primary `#FF7A00`.
  - Kartu urgensi normal aktif dengan aksen latar `#FFFBEB` dan border `#F59E0B`.

---

### SKENARIO 02: Validasi Guardrail Lampiran Media Wajib (F-07 Strict Compliance)
- **Tujuan**: Memverifikasi penegakan aturan F-07 di mana pembuatan tiket kerusakan dilarang keras tanpa bukti visual.
- **Kondisi Awal**: Penghuni berada pada formulir laporan kerusakan.
- **Langkah-langkah**:
  1. Hapus lampiran media aktif dengan menekan tombol tempat sampah pada kartu pratinjau foto.
  2. Klik tombol **"Kirim Laporan Kerusakan"**.
- **Hasil yang Diharapkan**:
  - Sistem mencegat pengiriman formulir.
  - Toast error bersemantik merah muncul dengan pesan tegas: *"Gagal mengirim: Lampiran minimal 1 foto atau video kerusakan bersifat WAJIB (F-07)."*
  - Tiket tidak diterbitkan.

---

### SKENARIO 03: Alur Sukses Penerbitan Tiket & Pengalihan ke Layar Detail
- **Tujuan**: Memvalidasi proses berhasilnya penerbitan tiket dan transisi otomatis ke layar detail (`WF-12`).
- **Kondisi Awal**: Formulir terisi lengkap dengan lampiran foto aktif (`Foto_Pipa_Wastafel_Bocor.jpg`).
- **Langkah-langkah**:
  1. Klik tombol **"Kirim Laporan Kerusakan"**.
  2. Amati animasi loading pada tombol CTA.
- **Hasil yang Diharapkan**:
  - Tombol CTA menampilkan spinner indikator.
  - Toast notifikasi sukses muncul: *"Laporan kerusakan berhasil dikirim! Tiket #TK-202610-003 diterbitkan."*
  - Browser otomatis dialihkan ke halaman `WF-12-portal-tiket-detail.html`.
