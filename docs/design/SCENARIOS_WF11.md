# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-11: Formulir Pelaporan Kerusakan Fasilitas Kamar (SCR-P04)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: [`docs/design/screens/WF-11-portal-tiket-baru.html`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-11-portal-tiket-baru.html)  
> **Fitur Terkait**: **F-01** (Akses dan Peran / RBAC Penghuni), **F-07** (Ticketing Kerusakan Fasilitas dengan Wajib Minimal 1 Foto/Video)  
> **User Stories KANBAN**: `RK-001` (Akses Penghuni Mandiri), `RK-016` (Formulir Pengajuan Komplain Kerusakan), `RK-017` (Validasi Lampiran Media Wajib F-07)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Tenant Role - Kamar A-04 Budi Santoso)** — *Pemilik dan Staf membuat tiket via Dasbor Manajemen*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-11 (`SCR-P04`)** adalah antarmuka formulir terfokus (*distraction-free focused form*) khusus untuk penghuni kost melaporkan kendala kerusakan fasilitas kamar tidur atau fasilitas umum kost. Sesuai arahan desain, halaman ini **meniadakan topbar header global** agar penghuni dapat berkonsentrasi penuh menyelesaikan pelaporan tanpa distraksi menu navigasi.

### Tiga Pilar Penegakan Mutu Formulir:
1. **Penegakan Mutlak Guardrail F-07 (Strict Media Enforcement)**: Sesuai ketetapan `SCOPE_STATEMENT.md`, sistem **menolak keras penerbitan tiket tanpa lampiran bukti visual**. Formulir mengharuskan adanya minimal 1 foto atau video nyata sebelum laporan dapat diteruskan ke sistem triase operasional pengelola.
2. **Kategorisasi Cepat & Triad Urgensi Berstandar Estify**: Pemilihan kategori fasilitas menggunakan kartu taktil (`#FFF7ED` oranye Estify) dan 3 tingkatan urgensi (*Mendesak, Normal, Rendah*) dengan Service Level Agreement (SLA) waktu respons teknisi yang transparan.
3. **Persetujuan Akses Masuk Kamar & Jalur Darurat Malam Hari**: Fasilitas checkbox persetujuan masuk kamar saat penghuni sedang bekerja di luar kost, serta nomor darurat WhatsApp pengelola untuk insiden kritis malam hari (korsleting listrik / pipa utama jebol).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WF-11 FORM TIKET BARU ARSITEKTUR                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TOP UTILITY BAR: [← Kembali ke Beranda Kamar]               [● Kamar A-04 · Budi Santoso]       │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 1. KOLOM FORMULIR UTAMA (66% INPUT AREA)                         │ 2. SIDEBAR EDUKASI (34%)      │
│    ├─ HEADER: Judul Lapor Kerusakan & Info Kamar A-04            │    ├─ CARD 1: KETENTUAN SOP   │
│    ├─ SEKSI 1: 6 Kategori Fasilitas (Pills Grid Taktil)          │    │  • Jam Kerja: 08:00-17:00│
│    │  • AC & Pendingin (wind)                                    │    │  • Biaya Servis: Rp 0    │
│    │  • Pipa & Sanitasi Air (droplets) [Default]                 │    │  • Wajib Bukti Visual    │
│    │  • Kelistrikan & Lampu (zap)                                │    │                          │
│    │  • Pintu, Jendela & Kunci (key-round)                       │    ├─ CARD 2: DARURAT MALAM   │
│    │  • Kasur & Furnitur Kamar (bed-double)                      │    │  • Bahaya Listrik/Pipa   │
│    │  • Fasilitas Umum Kost (building)                           │    │  • [Hubungi Mbak Rini]   │
│    ├─ SEKSI 2: 3 Tingkat Urgensi Penanganan (Triad Semantik)     │    │                          │
│    │  • Mendesak / Darurat (< 2 Jam SLA)                         │    ├─ CARD 3: TIKET TERAKHIR  │
│    │  • Normal / Sedang (Hari Ini / Besok) [Default]             │    │  • #TK-2026-004 (AC)     │
│    │  • Rendah / Kosmetik (2-3 Hari)                             │    │  • Link Detail ke WF-12  │
│    ├─ SEKSI 3: Judul Keluhan & Textarea Kronologi Kerusakan      │    │                          │
│    ├─ SEKSI 4: Zona Unggah Media Wajib F-07 (Min 1 Foto/Video)   │    │                          │
│    │  • Dropzone Foto/Video (Maks. 5 File, Foto 4MB, Video 12MB) │    │                          │
│    │  • Grid Thumbnail Media Aktif + Tombol Hapus [Trash]        │    │                          │
│    │  • Peringatan Merah jika media = 0                          │    │                          │
│    ├─ SEKSI 5: Checkbox Izin Masuk Kamar Saat Bekerja            │    │                          │
│    └─ FOOTER: [Batal] & [Kirim Laporan Kerusakan (CTA Oranye)]   │    │                          │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai ketetapan **Frozen Scope Medium (1 Properti Mandiri, 7 Kelompok P0)** pada `docs/pm/SCOPE_STATEMENT.md`:

| Area Batasan | Ketetapan Scope In-Scope | Batasan Mutlak (Out-of-Scope) |
| :--- | :--- | :--- |
| **Pemisahan Peran** | Formulir khusus bagi penghuni Kamar A-04 untuk melaporkan kerusakan unitnya sendiri. | Penghuni dilarang memilih unit kamar milik penghuni lain (*Zero Cross-Unit Tampering*). |
| **Guardrail Media F-07** | Wajib melampirkan minimal 1 media foto (maks. 4 MB) atau video (maks. 12 MB/30 dtk). | Dilarang meloloskan pembuatan tiket dengan lampiran media kosong (0 file). |
| **Batas Kumulatif Media** | Maksimal 5 file lampiran media per tiket dengan total ukuran tidak melebihi 40 MB. | Tidak ada kompresi video di sisi client (transcoding) pada MVP; file berlebih ditolak. |
| **Sifat Data** | Bukti foto wastafel dan genangan air menggunakan data sintetis / stock preview. | Dilarang memuat foto identitas KTP atau dokumen sensitif pribadi penghuni. |

---

## 3. Matriks Data Pengujian Baseline (Testing Fixtures)

* **Penghuni Pelapor**: Budi Santoso (`budi.penghuni@rumakost.id`) &bull; Kamar A-04 (Lantai 2)
* **Kategori Uji Standar**: Pipa & Sanitasi Air (`pipa`)
* **Urgensi Uji Standar**: Normal (Sedang)
* **Judul Default**: *"Pipa Saluran Wastafel Kamar Mandi Bocor"*
* **Kronologi Default**: *"Air menetes cukup deras dari sambungan pipa bawah wastafel kamar mandi sejak tadi pagi. Air merembes ke lantai kamar mandi dan ember penampung sudah hampir penuh. Mohon segera dicek teknisi pipa."*
* **Lampiran Default (2 Berkas)**:
  1. `Wastafel_Bocor_1.jpg` (1.4 MB &bull; Foto Bukti Sambungan Pipa)
  2. `Genangan_Air_2.jpg` (950 KB &bull; Foto Lantai Kamar Mandi)

---

## 4. Daftar Lengkap 13 Skenario Pengujian End-to-End Terperinci

### SKENARIO 01: Navigasi Bebas Header & Fungsionalitas Tombol Kembali
- **Tujuan**: Memastikan topbar header ditiadakan secara total dan tombol navigasi kembali berfungsi mulus.
- **Kondisi Awal**: Pengguna membuka berkas `WF-11-portal-tiket-baru.html`.
- **Langkah Pengujian**:
  1. Periksa bagian paling atas halaman: pastikan tidak ada `<header class="topbar">` atau pill bar navigasi global.
  2. Periksa bar utilitas atas: tombol `[← Kembali ke Beranda Kamar]` di kiri dan badge `Kamar A-04 • Budi Santoso` di kanan.
  3. Klik tombol **"Kembali ke Beranda Kamar"**.
- **Hasil yang Diharapkan**:
  - Halaman tampil bersih, fokus pada tugas pengisian formulir tanpa elemen navigasi luar.
  - Penekanan tombol kembali mengarahkan pengguna kembali ke `WF-10-portal-penghuni.html`.

---

### SKENARIO 02: Pemilihan Kategori Fasilitas Kerusakan (6 Kategori Taktil)
- **Tujuan**: Memvalidasi interaktivitas seleksi kategori fasilitas fisik kost.
- **Langkah Pengujian**:
  1. Amati 6 kartu kategori: *AC & Pendingin*, *Pipa & Sanitasi Air*, *Kelistrikan & Lampu*, *Pintu & Kunci*, *Kasur & Furnitur*, dan *Fasilitas Umum Kost*.
  2. Klik kartu **"AC & Pendingin"**.
  3. Amati perubahan visual kartu.
  4. Klik kembali kartu **"Pipa & Sanitasi Air"**.
- **Hasil yang Diharapkan**:
  - Kartu yang dipilih aktif dengan latar peach lembut (`#FFF7ED`), border oranye brand (`#FF7A00`), dan ikon berlatar oranye solid.
  - Toast informatif muncul mengonfirmasi kategori yang dipilih.

---

### SKENARIO 03: Penentuan Tingkat Urgensi Penanganan (Triad Semantik SLA)
- **Tujuan**: Memverifikasi seleksi tingkat urgensi dengan indikator SLA yang realistis.
- **Langkah Pengujian**:
  1. Amati 3 kartu tingkat urgensi.
  2. Klik kartu **"Mendesak (Darurat)"**: periksa badge merah lembut dan teks SLA *"Respons Teknisi: < 2 Jam"*.
  3. Klik kartu **"Rendah (Kosmetik)"**: periksa badge biru lembut dan teks SLA *"Respons Teknisi: 2 – 3 Hari"*.
  4. Klik kartu **"Normal (Sedang)"**: periksa badge kuning lembut dan teks SLA *"Respons Teknisi: Hari Ini / Besok Pagi"*.
- **Hasil yang Diharapkan**: Radio button internal terpilih otomatis dan kartu aktif diberi aksen border oranye Estify dengan bayangan lembut.

---

### SKENARIO 04: Pengisian Judul & Deskripsi Kronologis Kerusakan
- **Tujuan**: Memastikan input teks judul keluhan dan textarea kronologi bekerja tanpa hambatan.
- **Langkah Pengujian**:
  1. Kosongkan kolom judul keluhan, lalu klik tombol **"Kirim Laporan Kerusakan"**.
  2. Amati peringatan validasi form.
  3. Masukkan kembali judul: *"Pipa Saluran Wastafel Kamar Mandi Bocor"*.
  4. Periksa textarea kronologi yang memuat penjelasan lengkap kejadian.
- **Hasil yang Diharapkan**: Jika judul kosong, sistem memunculkan toast semantik merah: *"Gagal: Judul keluhan wajib diisi secara jelas"* dan mengarahkan fokus kursor ke input judul.

---

### SKENARIO 05: Validasi Mutlak Guardrail Media F-07 (Strict Enforcement)
- **Tujuan**: Menguji penolakan sistem jika penghuni mencoba mengirim tiket tanpa lampiran media visual (0 berkas).
- **Kondisi Awal**: Formulir terisi judul dan kronologi, dengan 2 media bawaan.
- **Langkah Pengujian**:
  1. Klik tombol tempat sampah `[Trash]` pada foto pertama (`thumbItem1`).
  2. Klik tombol tempat sampah `[Trash]` pada foto kedua (`thumbItem2`).
  3. Amati perubahan tampilan dropzone saat media = 0 berkas.
  4. Klik tombol **"Kirim Laporan Kerusakan"**.
- **Hasil yang Diharapkan**:
  - Dropzone otomatis berubah border menjadi garis merah putus-putus (`#EF4444`).
  - Muncul kotak peringatan merah: *"Peringatan Guardrail F-07: Anda wajib melampirkan minimal 1 foto/video bukti fisik..."*.
  - Pengiriman tiket **DICEGAT TOTAL**; toast merah muncul: *"Gagal mengirim: Lampiran minimal 1 foto atau video kerusakan bersifat WAJIB (F-07)."*.
  - Halaman otomatis melakukan *smooth scroll* ke area dropzone.

---

### SKENARIO 06: Penambahan Media Dropzone & Validasi Batasan Ukuran/Format
- **Tujuan**: Memvalidasi penambahan media baru via dropzone interaktif beserta validasi ukuran maksimal file.
- **Langkah Pengujian**:
  1. Klik area kotak dropzone media.
  2. Simulasikan pemilihan berkas foto baru (`Foto_Pipa_Bocor_Baru.png`, ukuran 2.1 MB).
  3. Simulasikan pemilihan berkas berukuran melebihi batas (misal: video 15 MB).
- **Hasil yang Diharapkan**:
  - Berkas valid otomatis masuk ke dalam daftar thumbnail dan penghitung berkas diperbarui (*"3 Berkas Terlampir"*).
  - Berkas berukuran lebih dari batas ditolak dengan toast error: *"Berkas melebihi batas ukuran maksimal"*.

---

### SKENARIO 07: Penghapusan Selektif Thumbnail Media
- **Tujuan**: Memastikan penghuni dapat membatalkan atau menghapus foto tertentu yang salah ambil.
- **Langkah Pengujian**:
  1. Dari 3 media yang terlampir, klik tombol tempat sampah pada foto kedua (`Genangan_Air_2.jpg`).
  2. Periksa sisa thumbnail media di layar.
- **Hasil yang Diharapkan**:
  - Thumbnail foto kedua terhapus dari DOM secara instan.
  - Penghitung media berkurang menjadi *"2 Berkas Terlampir"*.
  - Toast feedback muncul: *"Lampiran media dihapus"*.

---

### SKENARIO 08: Persetujuan Izin Masuk Kamar Saat Bekerja
- **Tujuan**: Memastikan kenyamanan dan kepatuhan privasi penghuni mengenai waktu masuk teknisi ke kamar pribadi.
- **Langkah Pengujian**:
  1. Amati kartu checkbox persetujuan masuk kamar: periksa keterangan izin didampingi staf operasional saat penghuni di luar kost.
  2. Hilangkan centang (uncheck), lalu centang kembali (checked).
- **Hasil yang Diharapkan**: Checkbox merespons klik dengan aksen oranye Estify yang selaras.

---

### SKENARIO 09: Alur Sukses Penerbitan Tiket & Pengalihan Halus ke WF-12
- **Tujuan**: Memvalidasi proses berhasilnya penerbitan tiket ketika seluruh validasi (judul & media F-07) terpenuhi.
- **Kondisi Awal**: Judul terisi, kategori pipa terpilih, urgensi normal, dan minimal 1 foto aktif terlampir.
- **Langkah Pengujian**:
  1. Klik tombol **"Kirim Laporan Kerusakan"**.
  2. Amati tombol CTA: periksa animasi spinner loading *"Menerbitkan Tiket..."* dan status disabled.
  3. Amati toast notifikasi yang muncul.
  4. Tunggu pengalihan halaman otomatis.
- **Hasil yang Diharapkan**:
  - Toast hijau sukses muncul: *"Laporan kerusakan berhasil diterbitkan! Mengalihkan ke pelacakan status tiket..."*.
  - Dalam waktu 800ms, browser otomatis berpindah ke [`WF-12-portal-tiket-detail.html?new=true`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-12-portal-tiket-detail.html?new=true).

---

### SKENARIO 10: Pemanfaatan Kontak Darurat WhatsApp Malam Hari
- **Tujuan**: Memastikan penghuni memiliki jalur cepat darurat jika terjadi kerusakan kritis di luar jam operasional teknisi.
- **Kondisi Awal**: Pengguna membaca kartu samping *Darurat di Luar Jam Kerja?*.
- **Langkah Pengujian**:
  1. Periksa instruksi kondisi darurat (kebakaran listrik, pipa utama jebol, pintu terkunci malam hari).
  2. Klik tombol **"Hubungi Staf Jaga (Mbak Rini)"**.
- **Hasil yang Diharapkan**: Membuka URL resmi `https://wa.me/6281987654321` dengan template pesan otomatis: *"DARURAT Kamar A-04: Mohon bantuan segera..."*.

---

### SKENARIO 11: Akses Pintasan ke Tiket Sebelumnya (#TK-2026-004)
- **Tujuan**: Memfasilitasi penghuni yang ingin mengecek keluhan yang sedang berlangsung sebelum membuat tiket baru.
- **Kondisi Awal**: Pengguna melihat kartu *Tiket Terakhir Anda* di sidebar kanan.
- **Langkah Pengujian**: Klik tautan **"Pantau Progres Tiket di WF-12 →"**.
- **Hasil yang Diharapkan**: Mengarahkan pengguna langsung ke halaman pelacakan detail tiket berjalan [`WF-12-portal-tiket-detail.html`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-12-portal-tiket-detail.html).

---

### SKENARIO 12: Uji Ergonomi & Responsivitas Mobile (Form Reflow)
- **Tujuan**: Memastikan seluruh kontrol formulir nyaman diisi melalui layar ponsel pintar (*viewport 375px*).
- **Langkah Pengujian**:
  1. Perkecil lebar jendela browser menjadi 375px (iPhone viewport).
  2. Amati reflow layout: kolom formulir utama dan sidebar berpindah menjadi tumpukan vertikal.
  3. Amati grid kategori dan kartu urgensi: bertransformasi menjadi 1 kolom vertikal dengan tap target minimal 44×44px.
- **Hasil yang Diharapkan**: Tidak ada komponen yang terpotong secara horizontal (*zero horizontal scroll*), teks tetap terbaca nyaman, dan tombol CTA mudah dijangkau ibu jari.

---

### SKENARIO 13: Isolasi Keamanan RBAC (Kepatuhan Kamar Mandiri)
- **Tujuan**: Menjamin bahwa tiket yang diterbitkan secara otomatis terkunci pada identitas Kamar A-04 milik Budi Santoso tanpa kemungkinan salah alamat unit.
- **Langkah Pengujian**:
  1. Periksa badge unit pada header formulir dan bar utilitas atas.
  2. Pastikan tidak ada dropdown pemilih kamar lain untuk mencegah pelaporan palsu atas kamar penghuni lain.
- **Hasil yang Diharapkan**: Perlindungan data privat dan integritas operasional kost terjaga 100% (*Zero Cross-Unit Tampering*).

---

## 5. Ringkasan Kepatuhan Standar Kualitas (Quality Checklist)

| Kriteria Kualitas | Status | Catatan Verifikasi |
|---|:---:|---|
| **Distraction-Free Form** | ✅ PASS | Topbar header ditiadakan total; digantikan bar utilitas tombol kembali yang elegan. |
| **Estify Visual DNA** | ✅ PASS | Font Poppins, radius `24px`, aksen oranye `#FF7A00`, kanvas `#F7F8FA`. |
| **Bebas Emoji (Anti-Slop)** | ✅ PASS | 100% menggunakan ikon vektor Lucide SVG (`wrench`, `wind`, `droplets`, `zap`, `trash-2`, dll). |
| **Bebas Alert Browser Mentah**| ✅ PASS | Menggunakan sistem toast kustom teranimasi (`RumaUI.showToast`). |
| **Kepatuhan Guardrail F-07** | ✅ PASS | Validasi ketat wajib minimal 1 foto/video sebelum tiket bisa dikirim; pencegatan saat 0 berkas. |
| **Responsif Ponsel Pintar** | ✅ PASS | Reflow 1 kolom rapi dengan tap target kontrol formulir &ge; 44px. |
