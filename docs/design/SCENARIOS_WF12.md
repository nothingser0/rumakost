# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-12: Detail Tiket Kerusakan, Pelacak 5 Tahap Estify & Thread Diskusi Multi-Peran (SCR-P05)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-12-portal-tiket-detail.html`  
> **Fitur Terkait**: **F-07** (Ticketing Kerusakan Fasilitas, Kolaborasi Komentar Multi-Peran, Pelacakan Progres Servis)  
> **User Stories KANBAN**: `RK-018` (Pelacakan Progres Tiket Kerusakan & Thread Chat Komentar)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Kamar A-04), Staf Operasional, & Pemilik Kost**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-12 (`SCR-P05`)** menyajikan antarmuka pemantauan status perbaikan menyeluruh untuk laporan kerusakan fasilitas kamar yang telah diajukan oleh penghuni. Layar ini menampilkan:
1. **Pelacak Tahapan 5 Segmen Estify Visual**:
   - Tahap 1: Laporan Diterima (Completed)
   - Tahap 2: Teknisi Ditugaskan (Completed - Ditugaskan ke Pak Joko)
   - Tahap 3: Pengerjaan Lapangan (Active / Berkedip)
   - Tahap 4: Pengecekan Bersama (Pending)
   - Tahap 5: Masalah Selesai (Pending)
2. **Galeri Media Tiket**: Bukti visual awal penghuni dan suku cadang yang diunggah teknisi.
3. **Ruang Diskusi & Thread Chat Real-Time**: Interaksi dua arah antara Penghuni, Staf Operasional, dan Teknisi Rekanan.
4. **Metadata Penanggung Jawab & Biaya**: Transparansi biaya (Rp 0 / Tanggungan Kost) dan tautan direct chat WhatsApp ke teknisi.

---

## 2. Matriks Skenario Pengujian Fungsional

### SKENARIO 01: Verifikasi Visual 5-Step Segmented Progress Bar
- **Tujuan**: Memastikan progress bar Estify 5 segmen merefleksikan status pengerjaan saat ini secara visual tanpa teks yang berantakan.
- **Langkah-langkah**:
  1. Buka halaman `WF-12-portal-tiket-detail.html`.
  2. Amati komponen stepper pada header kartu tiket.
- **Hasil yang Diharapkan**:
  - Segmen 1 & 2 berwarna hijau (#10B981) dengan status selesai.
  - Segmen 3 berwarna oranye (#FF7A00) dengan animasi denyut (*pulseBar*) menandakan pekerjaan sedang berlangsung.
  - Segmen 4 & 5 berwarna abu-abu pasif (#E2E8F0).

---

### SKENARIO 02: Interaksi Balas Pesan pada Thread Diskusi Komentar
- **Tujuan**: Memvalidasi kemampuan penghuni mengirim pesan balasan atau klarifikasi teknis kepada pengelola kost.
- **Langkah-langkah**:
  1. Gulir ke bagian **"Ruang Diskusi & Log Tindak Lanjut"**.
  2. Ketik pesan pada textarea: *"Terima kasih Pak Joko, saya tunggu hasil tes alirannya."*
  3. Klik tombol **"Kirim"**.
- **Hasil yang Diharapkan**:
  - Pesan baru ditambahkan ke bagian bawah obrolan dengan alignment kanan (*bubble me* berwarna peach lembut khas Estify).
  - Avatar penghuni menampilkan "BS" (Budi Santoso).
  - Textarea dikosongkan secara otomatis.
  - Toast notifikasi sukses muncul: *"Pesan balasan berhasil dikirim ke teknisi dan staf"*.

---

### SKENARIO 03: Tautan Komunikasi Direct WhatsApp ke Teknisi Utama
- **Tujuan**: Memastikan penghuni dapat melakukan eskalasi darurat langsung ke nomor kontak teknisi rekanan kost.
- **Langkah-langkah**:
  1. Pada kartu samping "Penanggung Jawab Tiket", klik tombol **"Hubungi via WhatsApp"**.
- **Hasil yang Diharapkan**:
  - Browser membuka tautan WhatsApp ke nomor `0812-3456-7890` (Pak Joko Santoso) secara aman pada tab baru.
