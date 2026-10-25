# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-08: Antrean & Triase Tiket Pemeliharaan Kamar (SCR-14 & SCR-15)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-08-tiket.html` (didukung komponen `WF-08-tiket-detail.html` / `SCR-15`)  
> **Fitur Terkait**: **F-07** (Ticketing Kerusakan oleh Penghuni), **F-01** (Akses & Hak Peran RBAC), **F-02** (Manajemen Master Kamar), **F-03** (Penghuni & Siklus Kontrak), **F-06** (Catatan Biaya Pemeliharaan Operasional)  
> **User Stories KANBAN**: `RK-007` (Epic Ticketing Kerusakan Penghuni), `RK-037` (Pembuatan Tiket Aduan dengan Bukti Wajib), `RK-038` (Percakapan & Catatan Tindak Lanjut Tiket), `RK-039` (Triase Prioritas & Penugasan Tiket), `RK-040` (Penyelesaian & Penutupan Siklus Tiket)  
> **Hak Akses Layar**: **Pemilik Properti (Owner)** & **Staf Pengelola (Staff)**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-08 (`SCR-14`)** adalah pusat operasional penanganan komplain kerusakan fasilitas dan pemeliharaan fisik properti RumaKost. Layar ini dibangun di atas filosofi desain **Estify Minimalist DNA** dengan tata letak **Dedicated Queue Stream & Inverted Pyramid Architecture** yang menyajikan visibilitas status antrean pekerjaan secara menyeluruh, cepat, dan transparan.

Antarmuka ini menjembatani aduan kerusakan yang diajukan oleh penghuni kamar (`WF-11` / `WF-12`) dengan proses triase operasional yang dijalankan oleh Staf dan Pemilik properti hingga perbaikan tuntas diverifikasi di lapangan.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            WF-08 WORKBENCH ARSITEKTUR & LAYOUT                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Nav Pill (Tiket Active) + Avatar Profil Pengelola   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. THREE HERO SPEEDOMETER GAUGES (CMP-06):                                                       │
│    • Card 1: Tingkat Penyelesaian Tiket (Resolution Rate % Semi-Donut SVG Gauge)                 │
│    • Card 2: Tiket Mendesak Butuh Aksi Segera (Urgent Tickets Active Indicator)                  │
│    • Card 3: Rata-rata Durasi Respon Kerja (SLA Standard Kost < 8 Jam)                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. CONTROLS STRIP TOOLBAR:                                                                       │
│    • Kiri   : Search Capsule Box (Cari Tiket, Kamar, Penghuni, Deskripsi) + Clear Button (X)     │
│    • Tengah : 5-Segment Status Tabs: Semua (N) | Mendesak (N) | Dikerjakan (N) | Menunggu | Selesai│
│    • Kanan  : Category Filter Dropdown (AC, Plumbing, Listrik, Mebel, Gedung) | Ekspor | Buat Tiket│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. MASTER QUEUE STREAM FEED:                                                                     │
│    • Feed Cards: Thumbnail Foto/Video + Urgency Badge + ID + Kategori + Rel Time + Judul +      │
│      Deskripsi Singkat + Avatar/Nama Pelapor + Kamar/Lantai + Teknisi + Count Komentar +        │
│      Mini 5-Dash Progress Bar + Primary CTA: "Buka Detail ↗"                                    │
│    • Dynamic Empty State Handling (Filter Zero State vs Absolute Zero State)                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. MODAL ECOSYSTEM:                                                                              │
│    • Modal 1: Buat Tiket Baru (SCR-14 · Dropdown Unit/Auto-Fill, Kategori, Urgensi, Dropzone F-07)│
│    • Modal 2: Ekspor Laporan Log Pemeliharaan (PDF Dokumen Resmi vs Spreadsheet Excel XLSX)      │
│    • Modal 3: Large Detail Tiket (CMP-18 · 2-Column Grid: Kronologi, Media, Stepper 5-Tahap,    │
│               Kartu Penghuni + Direct WA, Kartu Teknisi + Direct WA, Thread Catatan Internal)    │
│    • Modal 4: Disposisi / Ganti Teknisi Bertugas (Pilihan Teknisi Siaga + Opsi WA)               │
│    • Modal 5: Konfirmasi Penyelesaian Tiket (Tutup Tiket, Input Biaya Riil & Garansi + Opsi WA)  │
│    • Modal 6: Media Lightbox Viewer (Foto HD Fullscreen & Pemutar Video MP4 F-07 Compliance)     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Pilar Arsitektural & Batasan Domain (Domain Boundaries):
1. **Validasi Mutlak Bukti Media F-07 (*Mandatory Evidence Guard*)**:  
   Setiap tiket baru yang diterbitkan ke dalam sistem wajib menyertakan deskripsi kronologi dan **minimal 1 foto atau video asli** bukti kerusakan fisik. Pengajuan tanpa lampiran media ditolak secara tegas oleh sistem. Batas teknis media: foto $\le 4\text{ MB}$, video $\le 12\text{ MB}$ (durasi $\le 30\text{ detik}$), total kumulatif per tiket $\le 40\text{ MB}$.
2. **Siklus Hidup 5 Tahap & Anti-Manipulasi (*5-Step Linear State Machine*)**:  
   Progres penanganan tiket bergerak secara terstruktur melalui 5 tahapan berurutan (*linear step index 1 s.d. 5*):
   $$\text{Tahap 1: Diterima} \longrightarrow \text{Tahap 2: Ditugaskan} \longrightarrow \text{Tahap 3: Dikerjakan} \longrightarrow \text{Tahap 4: Diperiksa} \longrightarrow \text{Tahap 5: Selesai}$$
   Tiket tidak dapat ditutup secara sepihak tanpa melewati verifikasi pekerjaan di Tahap 4 dan pengisian ringkasan tindakan riil serta catatan biaya operasional di Modal Penyelesaian.
3. **Pemisahan Wewenang Peran & Kompartementalisasi Privasi (*RBAC Privacy Guard*)**:  
   - **Pemilik (Owner)**: Akses penuh untuk melihat seluruh antrean tiket satu properti, memajukan tahapan, mengalihkan teknisi, menyelesaikan tiket, mencatat biaya perbaikan, serta memiliki hak eksklusif membuka kembali (*re-open*) tiket yang telah selesai.
   - **Staf Pengelola (Staff)**: Memeriksa laporan masuk, melakukan triase awal, menugaskan teknisi, memperbarui tahapan pengerjaan lapangan, dan menyematkan **Catatan Internal (Internal Note)**. Catatan bertanda internal diisolasi sepenuhnya dan dilarang tampil pada Portal Penghuni (`WF-10` / `WF-12`).
   - **Penghuni (Tenant)**: Hanya dapat melihat tiket yang terhubung ke nomor kamarnya sendiri.
4. **Auto-Sinkronisasi Unit Kamar & Identitas Pelapor (*Master Data Integrity*)**:  
   Pemilihan unit kamar pada formulir tiket baru secara otomatis menarik dan memvalidasi nama penyewa aktif yang terdaftar di database master kamar (`WF-03` / `WF-04`). Jika area umum komunal dipilih, pelapor otomatis diset sebagai *"Staf Pengelola Kos"*.
5. **Jejak Audit Reversal & Mutasi Reaktif Metrik (*Reactive Synchronized State*)**:  
   Setiap perubahan tahapan, pengalihan teknisi, penambahan komentar, atau penutupan tiket secara otomatis mencatat stempel waktu (*timestamp*) dan identitas operator ke dalam linimasa aktivitas (*activity thread*), sekaligus mengkalkulasi ulang angka persentase pada Radial Speedometer Gauge secara instan (*zero reload*).
6. **Zero External Automation Dependency (*Manual WhatsApp Bridge*)**:  
   Sesuai `SCOPE_STATEMENT.md`, sistem tidak menggunakan bot otomatisasi berbayar maupun webhook pihak ketiga. Komunikasi ke WhatsApp penghuni atau teknisi dieksekusi secara elegan via protokol tautan standar universal `https://wa.me/{nomor}?text={draf_pesan}`.

---

## 2. Matriks Entitas Data Awal (Fixture Testing Baseline)

### 2.1 Direktori Tiket Pemeliharaan (`TICKETS_DB`)

| ID Tiket | Unit Kamar / Area | Tipe Kamar | Nama Pelapor | Urgensi | Kategori | Tahap Status | Teknisi Ditugaskan | Ringkasan Masalah & Bukti |
|---|---|---|---|---|---|---|---|---|
| **TKT-202610-04** | **B-03** (Lt. 2) | Deluxe | Reza Pratama | **Mendesak** (`urgent`) | AC & Pendingin | **Tahap 3: Dikerjakan** (`in_progress`) | Pak Joko Santoso | Pipa buang tersumbat, AC bocor deras ke kasur. Bukti: Foto + Video MP4 (`rekaman_air_menetes.mp4`). |
| **TKT-202610-03** | **A-01** (Lt. 1) | Standar | Rina Marliana | **Normal** (`medium`) | Plumbing & Sanitasi | **Tahap 2: Ditugaskan** (`assigned`) | Pak Joko Santoso | Gagang kran wastafel patah, air merembes di lantai kamar mandi. Bukti: 1 Foto JPG. |
| **TKT-202610-02** | **Umum-3** (Lt. 3) | Area Komunal | Kevin Sanjaya | **Rendah** (`low`) | Kelistrikan | **Tahap 1: Diterima** (`submitted`) | Pak Yanto Listrik | Lampu neon koridor depan kamar C-03 & C-04 padam total. Bukti: 1 Foto JPG. |
| **TKT-202610-01** | **A-04** (Lt. 1) | Executive | Budi Santoso | **Rendah** (`low`) | Mebel & Pintu | **Tahap 5: Selesai** (`resolved`) | Pak Budi Tukang Kayu | Engsel pintu kamar mandi berkarat & seret. Selesai diganti stainless baru (Biaya: Rp 75.000, Garansi 30 Hari). |
| **TKT-202609-18** | **B-02** (Lt. 2) | Deluxe | Hendra Wijaya | **Normal** (`medium`) | Kelistrikan | **Tahap 5: Selesai** (`resolved`) | Pak Yanto Listrik | Stop kontak meja kerja goyang & tidak ada arus. Inbow dos diganti (Biaya: Rp 50.000, Garansi 30 Hari). |
| **TKT-202609-12** | **C-01** (Lt. 3) | Standar | Anisa Putri | **Normal** (`medium`) | Plumbing & Sanitasi | **Tahap 3: Dikerjakan** (`in_progress`) | Pak Joko Santoso | Kepala shower mandi tersumbat kerak kalsium kapur. Bukti: 1 Foto JPG. |

### 2.2 Direktori Rekanan Teknisi Lapangan (Vendor Fixture)

| Nama Teknisi | Avatar | Spesialisasi Utama | Nomor Kontak WhatsApp | Status Kesiapan |
|---|:---:|---|---|---|
| **Pak Joko Santoso** | `PJ` | Teknisi AC, Pipa Saluran, & Plumbing Ledeng | `628123456789` | **Siaga** (`pill-green-soft`) |
| **Pak Yanto Listrik** | `PY` | Ahli Kelistrikan, MCB, Stop Kontak & Lampu | `6281377889900` | **Siaga** (`pill-dark-soft`) |
| **Pak Budi Tukang Kayu** | `PB` | Mebel, Pintu, Lemari, Engsel & Kusen Kayu | `6281122334455` | **Siaga** (`pill-dark-soft`) |

### 2.3 Direktori Master Lokasi Kamar & Area Komunal (`ROOMS_LIST`)

| Kode Lokasi | Label Tampilan | Klasifikasi Lantai | Penghuni Terkait (Auto-Fill) | Tipe Unit |
|---|---|---|---|---|
| **B-03** | Kamar B-03 | Lantai 2 | Reza Pratama | Standar |
| **A-01** | Kamar A-01 | Lantai 1 | Rina Marliana | Deluxe |
| **A-04** | Kamar A-04 | Lantai 1 | Budi Santoso | Standar |
| **B-02** | Kamar B-02 | Lantai 2 | Hendra Wijaya | Deluxe |
| **C-01** | Kamar C-01 | Lantai 3 | Anisa Putri | Standar |
| **C-03** | Kamar C-03 | Lantai 3 | Kevin Sanjaya | Standar |
| **Umum-1** | Area Umum Lantai 1 | Area Komunal | Staf Pengelola Kos (Area Lt. 1) | Fasilitas Publik (Lobi & Parkir) |
| **Umum-2** | Area Umum Lantai 2 | Area Komunal | Staf Pengelola Kos (Area Lt. 2) | Fasilitas Publik (Dapur Komunal) |
| **Umum-3** | Area Umum Lantai 3 | Area Komunal | Staf Pengelola Kos (Area Lt. 3) | Fasilitas Publik (Rooftop & Jemur) |

---

## 3. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Pemuatan Awal Antrean Tiket & Sinkronisasi Tiga Hero Radial Gauge (CMP-06)
* **Tujuan**: Memverifikasi bahwa data antrean tiket berhasil dimuat dengan benar pada pembukaan awal halaman, dan ketiga kartu metrik radial speedometer terhitung secara akurat sesuai data baseline.
* **Kondisi Awal (Pre-condition)**: Pengguna terautentikasi (Owner/Staff) membuka file `WF-08-tiket.html` tanpa parameter query URL.
* **Langkah-langkah**:
  1. Muat halaman `WF-08-tiket.html` pada browser.
  2. Periksa Topbar utama di bagian paling atas.
  3. Periksa tiga kartu metrik ringkasan atas (Hero Gauge Metrics).
  4. Periksa angka counter pada segmented tab filter status.
  5. Periksa kartu antrean tiket yang ter-render pada kontainer feed `#ticketsListFeed`.
* **Hasil Diharapkan**:
  - Topbar memuat navigasi aktif pada pill **"Tiket"** (latar hitam pekat `#111111`, teks putih) dan avatar pengguna pengelola.
  - Floating badge pojok kanan bawah memuat label: `SCR-14 · Antrean & Triase Tiket Pemeliharaan (F-07)`.
  - **Hero Gauge 1 (Tingkat Penyelesaian)**:
    - Subtitle: *"2 dari 6 Tiket Tuntas"* (atau *"8 dari 10 Tiket Tuntas"* sesuai pembagi periode).
    - Nilai besar: `33%` (atau `80%` pada konteks agregat bulan berjalan).
    - Semi-circle SVG stroke-dashoffset terkalibrasi secara matematis sesuai rumus: `106.8 * (1 - (resRate / 100))`.
    - Badge tren: `+6% MoM` (`pill-green-soft`).
  - **Hero Gauge 2 (Tiket Mendesak)**:
    - Menampilkan nilai: `1 Tiket` (dengan warna merah menyala `#DC2626`).
    - Subtitle: Menampilkan rincian tiket mendesak pertama: *"AC B-03 (AC Kamar Menetes...)"*.
    - Badge: `Butuh Aksi` (`pill-danger-soft`) berikon api (`flame`).
    - Teks tengah gauge: `Urgent` berwarna merah.
  - **Hero Gauge 3 (Rata-rata Respon Kerja SLA)**:
    - Menampilkan nilai: `4.8 Jam` (Target SLA kost: `< 8 Jam`).
    - Badge: `SLA Terpenuhi` (`pill-dark-soft`).
  - **Tab Counter Badges**:
    - `Semua (6)` terpilih aktif secara default.
    - `Mendesak (1)`, `Dikerjakan (2)`, `Menunggu (1)`, `Selesai (2)`.
  - Kontainer feed merender tepat 6 kartu tiket secara berurutan waktu. Seluruh ikon Lucide SVG terinisialisasi bersih tanpa error konsol.

---

### SKENARIO 02: Penyaringan Tiket Berdasarkan Tab Status Segmented (Status Tabs Filter)
* **Tujuan**: Memastikan pengguna dapat menyaring daftar tiket berdasarkan tahapan status operasional melalui segmented tab bar di toolbar tengah.
* **Kondisi Awal**: Seluruh 6 tiket tampil di layar (Tab *Semua* aktif).
* **Langkah-langkah**:
  1. Klik tab **"Mendesak (1)"** (`#tabUrgent`).
  2. Klik tab **"Dikerjakan (2)"** (`#tabInProgress`).
  3. Klik tab **"Menunggu (1)"** (`#tabAssigned`).
  4. Klik tab **"Selesai (2)"** (`#tabResolved`).
  5. Klik kembali tab **"Semua (6)"** (`#tabAll`).
* **Hasil Diharapkan**:
  - Pada langkah 1: Tab *Mendesak* memperoleh kelas `.active` (latar putih, font tebal, bayangan lembut). Daftar feed hanya menyajikan 1 tiket yaitu `TKT-202610-04` (AC Kamar B-03).
  - Pada langkah 2: Daftar feed hanya menyajikan 2 tiket berstatus pengerjaan aktif: `TKT-202610-04` dan `TKT-202609-12`.
  - Pada langkah 3: Daftar feed hanya menyajikan 1 tiket yang sedang menunggu kedatangan teknisi: `TKT-202610-03` (Kran wastafel A-01).
  - Pada langkah 4: Daftar feed menyajikan 2 tiket yang telah tuntas diperbaiki: `TKT-202610-01` dan `TKT-202609-18`. Mini progress bar menampilkan ruas hijau solid (`.filled-green`) bertuliskan *"Tahap 5: Selesai"*.
  - Pada langkah 5: Seluruh 6 tiket kembali ditampilkan secara utuh. Tombol Reset Filter di sisi kanan otomatis tersembunyi karena kembali ke kondisi default.

---

### SKENARIO 03: Penyaringan Tiket Berdasarkan Dropdown Kategori Kerusakan
* **Tujuan**: Memverifikasi fungsionalitas pengelompokan tiket berdasarkan kategori spesialisasi perbaikan fasilitas (AC, Plumbing, Kelistrikan, Mebel, Fasilitas Umum).
* **Kondisi Awal**: Tab *Semua* aktif. Dropdown kategori berada pada status *"Semua Kategori"*.
* **Langkah-langkah**:
  1. Klik tombol filter kategori **"Semua Kategori"** (`#btnCategoryFilter`) pada toolbar kanan.
  2. Perhatikan menu popover kategori `#categoryDropdownMenu` yang muncul melayang.
  3. Klik opsi **"AC & Pendingin"** (`catKey = 'AC'`).
  4. Buka kembali dropdown dan pilih opsi **"Plumbing & Ledeng"** (`catKey = 'Plumbing'`).
  5. Buka kembali dropdown dan pilih opsi **"Kelistrikan"** (`catKey = 'Kelistrikan'`).
* **Hasil Diharapkan**:
  - Menu dropdown meluncur terbuka tepat di bawah tombol trigger dengan z-index tinggi (`100`).
  - Saat *"AC & Pendingin"* dipilih:
    - Trigger memperbarui label menjadi *"AC & Pendingin"*.
    - Menu dropdown tertutup otomatis.
    - Kontainer feed hanya merender tiket berkategori AC (`TKT-202610-04`).
  - Saat *"Plumbing & Ledeng"* dipilih:
    - Feed menyaring tiket berkategori pipa/air (`TKT-202610-03` dan `TKT-202609-12`).
  - Saat *"Kelistrikan"* dipilih:
    - Feed menyaring tiket kelistrikan (`TKT-202610-02` dan `TKT-202609-18`).
  - Tombol indikator reset filter muncul di bilah kontrol untuk memudahkan pembersihan kriteria.

---

### SKENARIO 04: Pencarian Real-Time Multi-Parameter & Tombol Bersihkan Input (Search Capsule)
* **Tujuan**: Menguji responsivitas kolom pencarian teks bebas yang memindai ID tiket, nomor kamar, nama penghuni, judul kerusakan, dan teks kronologi secara simultan.
* **Kondisi Awal**: Filter status dan kategori dalam keadaan default (Semua).
* **Langkah-langkah**:
  1. Klik pada kolom input pencarian `#searchInput`.
  2. Ketik kata kunci nomor kamar: `"B-03"`.
  3. Periksa kemunculan tombol silang pembersih `#btnClearSearch`.
  4. Hapus teks dan ketik nama penghuni: `"Rina"`.
  5. Hapus teks dan ketik kata kunci kerusakan: `"bocor"`.
  6. Klik tombol silang mini (`#btnClearSearch`).
* **Hasil Diharapkan**:
  - Pada langkah 2: Hasil pencarian menyaring secara real-time (`oninput`) tanpa kedipan reload. Tiket `TKT-202610-04` (Reza Pratama, Kamar B-03) tampil di urutan atas.
  - Pada langkah 3: Tombol silang abu-abu `#btnClearSearch` bertransisi muncul (`display: inline-flex`) di sisi kanan input capsule.
  - Pada langkah 4: Sistem menampilkan tiket `TKT-202610-03` milik Rina Marliana (Kamar A-01).
  - Pada langkah 5: Sistem menampilkan seluruh tiket yang memuat kata "bocor" baik pada judul maupun deskripsi (`TKT-202610-04` dan `TKT-202610-03`).
  - Pada langkah 6: Input teks seketika dikosongkan, tombol silang menghilang, dan seluruh 6 tiket kembali ditampilkan ke layar.

---

### SKENARIO 05: Penanganan State Kosong Filter vs Reset Semua Filter (Filter Zero State)
* **Tujuan**: Memastikan antarmuka memberikan umpan balik visual ramah saat hasil pencarian bernilai nol tanpa data yang cocok (*Filter Zero State*), serta menyediakan tombol pemulihan instan.
* **Kondisi Awal**: Pengguna berada pada halaman utama tiket.
* **Langkah-langkah**:
  1. Ketik kata kunci acak yang tidak ada di database pada kolom pencarian: `"Kamar Z-99 Genteng Pecah"`.
  2. Amati perubahan DOM pada area feed tiket.
  3. Klik tombol **"Reset Filter Pencarian"** pada panel empty state atau toolbar.
* **Hasil Diharapkan**:
  - Kontainer feed `#ticketsListFeed` dikosongkan.
  - Panel `#emptyStateBox` ditampilkan secara elegan (`display: flex`):
    - Ikon wadah kosong (`inbox`) berlatar abu-abu netral.
    - Judul tebal: *"Tidak Ada Tiket yang Cocok"*.
    - Keterangan: *"Coba sesuaikan kata kunci pencarian atau ubah filter status di atas."*.
    - Tombol aksi sekunder: *"Reset Filter Pencarian"* berikon putar balik (`rotate-ccw`).
  - Saat tombol Reset diklik:
    - Fungsi `resetAllFilters()` dieksekusi: teks pencarian dibersihkan, tab status kembali ke *Semua*, dropdown kategori kembali ke *Semua Kategori*.
    - Toast konfirmasi sukses muncul: *"Semua filter berhasil disetel ulang"*.
    - Panel kosong tersembunyi dan seluruh 6 tiket awal kembali muncul utuh.

---

### SKENARIO 06: Deep-Link Navigasi Sorot Tiket via URL Query Parameter (`?highlight=` / `?id=`)
* **Tujuan**: Memastikan sistem mampu mendeteksi parameter query URL saat pengguna bernavigasi dari modul lain (misal dari kartu perbaikan kamar `WF-03` atau transaksi biaya servis di `WF-06`/`WF-07`) dan langsung membuka modal detail tiket yang bersangkutan secara otomatis.
* **Kondisi Awal**: Browser membuka URL dengan parameter: `WF-08-tiket.html?highlight=TKT-202610-04`.
* **Langkah-langkah**:
  1. Akses tautan `WF-08-tiket.html?highlight=TKT-202610-04` pada browser.
  2. Amati perilaku inisialisasi pada siklus hidup `DOMContentLoaded`.
* **Hasil Diharapkan**:
  - Halaman memuat seluruh komponen dasar dan feed antrean.
  - Skrip membaca `urlParams.get('highlight')` dan menemukan kecocokan tiket `TKT-202610-04`.
  - Setelah penundaan transisi 350ms, sistem secara otomatis memanggil `openTicketDetail('TKT-202610-04')`.
  - Modal `#modalTicketDetail` terbuka secara mulus di atas layar.
  - Toast informasi muncul: *"Membuka rincian tiket maintenance #TKT-202610-04"*.

---

### SKENARIO 07: Inspeksi Detail Tiket Komprehensif via Modal Dialog 2-Kolom (CMP-18 & F-07)
* **Tujuan**: Memverifikasi bahwa modal rincian tiket menampilkan seluruh data teknis, foto bukti, identitas pelapor, status tahapan, kontak WhatsApp, estimasi biaya, dan linimasa catatan secara presisi.
* **Kondisi Awal**: Antrean tiket tampil di layar. Tiket `TKT-202610-04` (AC Kamar B-03) tersedia.
* **Langkah-langkah**:
  1. Klik kartu tiket `TKT-202610-04` pada antrean, atau klik tombol **"Buka Detail ↗"** (`.btn-open-detail`).
  2. Periksa panel header modal `#modalTicketDetail`.
  3. Periksa kolom kiri modal (Kanvas Kronologi & Lampiran Media F-07).
  4. Periksa kolom kanan modal (Stepper 5-Tahap, Kartu Penghuni, Kartu Teknisi, Estimasi Operasional).
  5. Periksa seksi bawah membentang penuh (Aktivitas & Catatan Penanganan).
* **Hasil Diharapkan**:
  - Modal `#modalTicketDetail` memperoleh kelas `.open` dengan animasi zoom halus (`animation: modalZoomIn 180ms`).
  - **Header Pinned**:
    - Tag ID: `TKT-202610-04` berlatar gelap pekat `#0F172A`.
    - Lokasi: `Kamar B-03 · Lantai 2`.
    - Waktu: `· Dilaporkan 2 jam lalu`.
    - Badge Urgensi: `Mendesak` (`urgency-urgent`, merah).
    - Badge Kategori: `AC & Pendingin` (ikon angin biru muda).
    - Badge Tahap: `Tahap 3: Dikerjakan` (oranye).
    - Judul: *"AC Kamar Menetes Air Deras Membasahi Kasur"*.
  - **Kolom Kiri**:
    - Kronologi memuat uraian lengkap keluhan penghuni.
    - Kotak foto utama memuat gambar unit AC basah dengan caption *"Foto Bukti · Reza Pratama"*.
    - Kotak pemutar video terdeteksi (`#mdVideoContainer`) menampilkan nama file `rekaman_air_menetes.mp4` dengan tombol play melingkar oranye.
  - **Kolom Kanan**:
    - Stepper 5-tahap menandai ruas 1, 2, dan 3 sebagai aktif/oranye (`.active`). Label: *"Tahap 3 dari 5"*.
    - Tombol aksi utama: *"Majukan ke: Tahap 4 (Pengecekan)"*.
    - Kartu Penghuni: Avatar `RP`, Nama `Reza Pratama`, Kamar `B-03`, tombol WhatsApp hijau terhubung ke nomor `6281299887711`.
    - Kartu Teknisi: Avatar `PJ`, Nama `Pak Joko Santoso`, Spesialisasi `Teknisi AC & Plumbing Ledeng`, tombol WhatsApp terhubung ke nomor `628123456789`, serta tombol link *"Ganti Teknisi"*.
    - Estimasi Operasional: Biaya Servis `Rp 75.000` (oranye tebal) dan Garansi `30 Hari`.
  - **Seksi Catatan Penuh (CMP-18)**:
    - Counter menampilkan *"Aktivitas & Catatan Penanganan (4)"*.
    - Ter-render 4 bubble riwayat waktu (Reza Pratama, Rini Setiawati Staf, Catatan Internal Staf, dan Pak Joko Teknisi).

---

### SKENARIO 08: Siklus Kemajuan Tahapan Tiket Bertahap melalui Stepper 5-Langkah
* **Tujuan**: Memastikan alur transisi status tiket maju secara berurutan dan menghasilkan jejak riwayat mutasi otomatis.
* **Kondisi Awal**: Modal Detail Tiket terbuka untuk tiket `TKT-202610-03` (Kran Wastafel A-01, saat ini di Tahap 2: Ditugaskan).
* **Langkah-langkah**:
  1. Periksa label tombol utama stepper di kolom kanan modal: tombol bertuliskan *"Majukan ke: Tahap 3 (Pengerjaan)"*.
  2. Klik tombol **"Majukan ke: Tahap 3 (Pengerjaan)"** (`#btnMdAdvance`).
  3. Amati perubahan visual pada stepper, badge status, stream komentar, dan feed belakang.
* **Hasil Diharapkan**:
  - Ruas ke-3 pada stepper 5-dash seketika menyala oranye (`.active`).
  - Badge header berganti menjadi: `Tahap 3: Pengerjaan` (`#FFF7ED`, teks oranye).
  - Jejak audit baru otomatis disisipkan ke dalam linimasa catatan:
    - Pengirim: *"Staf Operasional"* (`role-tag-staff`).
    - Waktu: *"Baru saja"*.
    - Pesan: *"Status tiket dimajukan ke: Tahap 3 (Pengerjaan)."*.
  - Label tombol aksi utama otomatis diperbarui menjadi: *"Majukan ke: Tahap 4 (Pengecekan)"*.
  - Toast konfirmasi sukses muncul: *"Status tiket TKT-202610-03 dimajukan ke Tahap 3!"*.
  - Kartu tiket pada antrean feed belakang ikut terbarui secara reaktif tanpa reload halaman.

---

### SKENARIO 09: Penyelesaian & Penutupan Tiket Resmi dengan Konfirmasi Biaya & Garansi
* **Tujuan**: Memverifikasi alur transisi dari Tahap 4 (Pengecekan) menuju Tahap 5 (Selesai) yang mewajibkan input ringkasan pekerjaan riil, nominal biaya operasional, dan masa garansi teknisi.
* **Kondisi Awal**: Tiket berada pada Tahap 4 (Pengecekan). Tombol aksi utama pada modal detail bertuliskan *"Konfirmasi: Selesaikan Tiket"*.
* **Langkah-langkah**:
  1. Klik tombol **"Konfirmasi: Selesaikan Tiket"** (`advanceTicketStepModal()`).
  2. Amati terbukanya sub-modal konfirmasi `#modalResolveTicket`.
  3. Periksa input field:
     - Ringkasan pekerjaan: pastikan terisi deskripsi tindakan (misal: *"Pipa saluran telah dikuras, kotoran lumut dibersihkan, dan hembusan AC dingin normal"*).
     - Biaya operasional riil: masukkan angka `120000` (Rp 120.000).
     - Masa garansi teknisi: pastikan terisi *"30 Hari Teknisi"*.
  4. Biarkan checkbox *"Kirim Konfirmasi Selesai via WhatsApp ke Penghuni"* tetap tercentang.
  5. Klik tombol hijau utama **"Konfirmasi Selesai"** (`submitResolveTicketModal()`).
* **Hasil Diharapkan**:
  - Sub-modal `#modalResolveTicket` tertutup.
  - Tiket `TKT-202610-04` bermutasi ke `stepIndex = 5` dan `status = 'resolved'`.
  - Ruas stepper 5-dash seluruhnya berubah warna menjadi hijau sukses (`.completed` / `#16A34A`).
  - Header badge status berganti menjadi hijau lembut: `Tahap 5: Selesai` berikon centang ganda (`check-circle-2`).
  - Catatan audit resmi tersimpan di thread komentar:
    - Pengirim: *"Pemilik Kost"* (`role-tag-owner`).
    - Pesan: *"Perbaikan selesai dikonfirmasi. Tindakan: '...'. Biaya tercatat: Rp 120.000."*.
  - Nilai biaya pada kartu estimasi operasional terbarui menjadi `Rp 120.000`.
  - Tombol aksi utama stepper disembunyikan, dan digantikan oleh tombol sekunder: *"Buka Kembali Tiket"* (`#btnMdReopen`).
  - Counter badge status di toolbar atas terbarui (Selesai bertambah 1).
  - Indikator Radial Speedometer Gauge atas terkalkulasi ulang secara instan.
  - Toast konfirmasi sukses muncul: *"Tiket TKT-202610-04 ditandai selesai & diarsipkan! Konfirmasi penyelesaian terkirim ke WhatsApp penghuni."*.

---

### SKENARIO 10: Pembukaan Kembali Tiket yang Telah Selesai (Re-open Ticket by Owner)
* **Tujuan**: Menguji hak istimewa Pemilik Kost untuk membuka kembali tiket yang telah berstatus selesai jika terdapat komplain susulan dari penghuni bahwa kerusakan kambuh kembali.
* **Kondisi Awal**: Modal Detail terbuka untuk tiket yang berstatus Tahap 5 Selesai (misal: `TKT-202610-01` atau tiket yang baru saja diselesaikan pada SK-09).
* **Langkah-langkah**:
  1. Periksa bagian bawah stepper 5-tahap pada modal detail.
  2. Klik tombol putih outline **"Buka Kembali Tiket"** (`#btnMdReopen`).
  3. Amati mutasi state pada modal dan antrean feed.
* **Hasil Diharapkan**:
  - Tiket dikembalikan statusnya ke `stepIndex = 3` (Tahap Pengerjaan) dan `status = 'in_progress'`.
  - Ruas stepper ke-4 dan ke-5 kembali berwarna abu-abu netral; ruas 1 s.d. 3 menyala oranye.
  - Badge header tiket kembali menjadi oranye: `Tahap 3: Dikerjakan`.
  - Linimasa aktivitas mencatat riwayat pembukaan kembali:
    - Pengirim: *"Pemilik Kost"* (`role-tag-owner`).
    - Pesan: *"Tiket dibuka kembali (re-open) untuk penanganan teknis lanjutan."*.
  - Tombol aksi kembali beralih menjadi *"Majukan ke: Tahap 4 (Pengecekan)"*.
  - Tiket otomatis kembali masuk ke dalam antrean tiket aktif pengerjaan (Tab *Dikerjakan* bertambah 1, Tab *Selesai* berkurang 1).
  - Kebijakan retensi media 365 hari di-reset ulang (*countdown restart*).
  - Toast konfirmasi muncul: *"Tiket TKT-202610-04 dibuka kembali ke Tahap 3 (Pengerjaan)"*.

---

### SKENARIO 11: Triase Disposisi & Pengalihan Teknisi Bertugas (`modalAssignTech`)
* **Tujuan**: Memverifikasi alur pergantian teknisi lapangan yang ditugaskan pada suatu tiket komplain disertai simulasi pengiriman surat tugas via WhatsApp.
* **Kondisi Awal**: Modal Detail Tiket sedang terbuka.
* **Langkah-langkah**:
  1. Pada kartu *Teknisi Bertugas* di kolom kanan, klik tombol teks bergaris bawah **"Ganti Teknisi"** (`openAssignTechFromModal()`).
  2. Amati terbukanya modal disposisi `#modalAssignTech`.
  3. Pilih radio button teknisi kelistrikan: **"Pak Yanto Listrik"** (`Ahli Kelistrikan, MCB, Stop Kontak & Lampu`).
  4. Pastikan opsi centang *"Kirim Surat Tugas via WhatsApp ke Teknisi"* aktif.
  5. Klik tombol utama **"Simpan Penugasan"** (`submitAssignTechModal()`).
* **Hasil Diharapkan**:
  - Modal `#modalAssignTech` tertutup otomatis.
  - Kartu teknisi pada modal detail seketika terbarui:
    - Avatar berganti ke `PY`.
    - Nama teknisi: `Pak Yanto Listrik`.
    - Spesialisasi: `Ahli Kelistrikan & MCB`.
    - Tautan WhatsApp langsung terhubung ke nomor Pak Yanto (`6281377889900`).
  - Linimasa aktivitas mencatat perpindahan tugas:
    - Pesan: *"Penugasan dialihkan kepada Pak Yanto Listrik."* oleh Staf Operasional.
  - Metadata kartu pada feed utama di belakang layar ikut berganti nama teknisinya secara instan.
  - Toast konfirmasi sukses muncul: *"Teknisi Pak Yanto Listrik berhasil ditugaskan! Surat tugas otomatis terkirim ke WhatsApp Pak Yanto Listrik."*.

---

### SKENARIO 12: Penambahan Komentar Publik dalam Thread Diskusi Tiket (CMP-18)
* **Tujuan**: Memastikan Staf dan Pemilik dapat menambahkan pesan penjelasan progres perbaikan yang dapat dibaca oleh Penghuni pada portal aduannya.
* **Kondisi Awal**: Modal Detail Tiket terbuka pada seksi *Aktivitas & Catatan Penanganan*.
* **Langkah-langkah**:
  1. Klik pada area teks input `#mdReplyInput`.
  2. Ketik tanggapan: *"Teknisi sedang dalam perjalanan mengambil suku cadang pipa baru di toko material. Estimasi tiba kembali pukul 14.15 WIB."*.
  3. Pastikan checkbox *"Catatan Internal Staf (Privat)"* **TIDAK** dicentang (`isInternal = false`).
  4. Klik tombol oranye **"Kirim Catatan"** (`submitModalReply()`).
* **Hasil Diharapkan**:
  - Input teks dibersihkan kembali menjadi kosong.
  - Bubble komentar baru langsung ditambahkan ke bagian terbawah stream percakapan:
    - Pengirim: *"Staf Operasional"*.
    - Badge peran: `Staf` (`role-tag-staff`, latar abu-abu gelap).
    - Teks: Sesuai yang diketikkan pengguna.
    - Waktu: *"Baru saja"*.
    - Background bubble: Putih bersih dengan border abu-abu halus (tanda komentar publik).
  - Counter jumlah catatan naik 1 angka (`mdCommentCount`).
  - Kontainer komentar otomatis melakukan auto-scroll ke elemen paling bawah.
  - Kartu tiket pada feed utama memperbarui indikator jumlah komentar.
  - Toast konfirmasi muncul: *"Tanggapan berhasil ditambahkan"*.

---

### SKENARIO 13: Penambahan Catatan Internal Staf dengan Proteksi Privasi Penghuni (Internal Note Guard)
* **Tujuan**: Memverifikasi pembuatan catatan operasional rahasia (*Internal Note*) antar Staf/Pemilik yang dilindungi secara visual dan diisolasi agar tidak dapat diakses oleh Penghuni.
* **Kondisi Awal**: Modal Detail Tiket terbuka.
* **Langkah-langkah**:
  1. Ketik catatan pada `#mdReplyInput`: *"Peringatan internal: Penghuni kamar ini sudah 2x mengklaim kran patah dalam 3 bulan. Jika patah lagi karena kelalaian, biaya perbaikan berikutnya akan dibebankan ke invoice sewa."*.
  2. Centang checkbox **"Catatan Internal Staf (Privat)"** (`#mdInternalCheck`).
  3. Klik tombol **"Kirim Catatan"**.
* **Hasil Diharapkan**:
  - Input dibersihkan dan checkbox kembali ke kondisi tidak tercentang secara otomatis.
  - Bubble komentar internal disisipkan ke dalam linimasa dengan styling proteksi khusus:
    - Background bubble: Amber/Kuning lembut (`#FEF3C7` / `#FFFBEB`) dengan border oranye putus-putus (`border: 1px dashed #F59E0B`).
    - Pengirim: *"Catatan Internal Staf"*.
    - Badge peran: `Internal Note` (`role-tag-internal`, teks amber pekat).
  - Toast konfirmasi muncul: *"Catatan internal berhasil disimpan"*.
  - **Uji Batas Isolasi (Scope Guard)**: Catatan ini memiliki flag atribut `isInternal: true`. Pada arsitektur backend/API, pesan ini dilarang dikirimkan dalam payload JSON ke endpoint penghuni (`/portal/tiket/:id`).

---

### SKENARIO 14: Pembuatan Tiket Baru: Pemilihan Unit Kamar & Auto-Fill Identitas Pelapor
* **Tujuan**: Menguji interaktivitas custom dropdown pencarian unit kamar dan mekanisme auto-fill nama penyewa aktif saat mendaftarkan komplain baru.
* **Kondisi Awal**: Pengguna berada di halaman utama tiket.
* **Langkah-langkah**:
  1. Klik tombol hero oranye **"+ Buat Tiket Baru"** (`.btn-action-catat`) pada toolbar kanan atas.
  2. Amati terbukanya modal `#modalCreateTicket`.
  3. Klik pada kolom input pencarian kamar `#roomSearchInput`.
  4. Ketik huruf `"C-01"` pada kolom input pencarian kamar.
  5. Klik opsi **"Kamar C-01 · Lantai 3 (Anisa Putri)"** yang muncul pada daftar dropdown.
  6. Buka kembali dropdown dan ketik kata kunci `"Umum"`, lalu pilih **"Area Umum Lantai 2 (Dapur Komunal)"**.
* **Hasil Diharapkan**:
  - Modal `#modalCreateTicket` terbuka menampilkan form estetik terstandarisasi.
  - Saat opsi *"Kamar C-01"* dipilih:
    - Input hidden `#createRoomSelect` bernilai `'C-01'`.
    - Input tampilan menampilkan: `Kamar C-01 · Lt. 3 (Anisa Putri)`.
    - Indikator badge di bawah form seketika memperbarui teks: *"Nama Pelapor: Anisa Putri (Otomatis dari Kamar)"* (`#detectedTenantName`).
    - Input hidden pelapor `#createReporterInput` otomatis terisi `'Anisa Putri'`.
  - Saat *"Area Umum Lantai 2"* dipilih:
    - Input hidden `#createRoomSelect` bernilai `'Umum-2'`.
    - Indikator badge otomatis berganti menjadi: *"Nama Pelapor: Staf Pengelola Kos (Area Lt. 2)"*.

---

### SKENARIO 15: Pembuatan Tiket Baru: Klasifikasi Kategori Kerusakan & Tingkat Urgensi
* **Tujuan**: Memastikan pengguna dapat memilih kategori kerusakan dan tingkat urgensi dengan ikon visual dan deskripsi bantuan yang tepat.
* **Kondisi Awal**: Modal Tambah Tiket sedang terbuka.
* **Langkah-langkah**:
  1. Klik tombol dropdown **"Kategori Kerusakan *"** (`#btnTriggerCategory`).
  2. Pilih opsi **"Kelistrikan & Saklar MCB"**.
  3. Klik tombol dropdown **"Tingkat Urgensi Perbaikan *"** (`#btnTriggerUrgency`).
  4. Pilih opsi **"Mendesak (Darurat) — Respon Segera < 1 Jam"**.
* **Hasil Diharapkan**:
  - Saat kategori Kelistrikan dipilih:
    - Ikon pemicu berganti menjadi ikon petir kuning (`zap`).
    - Label trigger berganti menjadi *"Kelistrikan & Saklar MCB"*.
    - Nilai tersembunyi `#createCategorySelect` terekam sebagai `'Kelistrikan'`.
    - Menu dropdown tertutup seketika.
  - Saat urgensi Mendesak dipilih:
    - Ikon pemicu berganti menjadi segitiga bahaya merah (`alert-triangle`).
    - Label trigger berganti menjadi *"Mendesak (Respon Segera < 1 Jam)"*.
    - Nilai tersembunyi `#createUrgencySelect` terekam sebagai `'urgent'`.
    - Menu dropdown tertutup seketika.

---

### SKENARIO 16: Validasi Formulir Tiket Baru: Penolakan Input Kosong & Proteksi Wajib Bukti Media F-07
* **Tujuan**: Memverifikasi penegakan aturan bisnis bahwa tiket tidak dapat diterbitkan jika judul kosong, kronologi kosong, atau tidak melampirkan minimal 1 bukti foto/video.
* **Kondisi Awal**: Modal Tambah Tiket terbuka. Field judul dan kronologi dalam keadaan kosong, belum ada berkas yang diunggah.
* **Langkah-langkah**:
  1. Langsung klik tombol **"Simpan & Terbitkan Tiket"** (`.btn-modal-primary`) tanpa mengisi form.
  2. Masukkan teks judul: `"Lampu Meja Belajar Konslet"`, namun biarkan kronologi kosong. Klik kembali tombol simpan.
  3. Lengkapi teks kronologi: `"Kabel lampu meja terkelupas dan mengeluarkan percikan api saat dicolokkan"`.
  4. Pastikan belum ada file foto/video yang diunggah (`hasSimulatedAttachment = false`).
  5. Klik tombol **"Simpan & Terbitkan Tiket"**.
* **Hasil Diharapkan**:
  - Pada langkah 1 dan 2: Form menolak submit dan memunculkan Toast Warning:  
    *"Harap lengkapi judul keluhan dan kronologi kerusakan"*.
  - Pada langkah 5 (Proteksi F-07): Sistem menolak penyimpanan dan memunculkan Toast Peringatan Tegas F-07:  
    *"F-07: Wajib melampirkan minimal 1 foto atau video bukti kerusakan!"*.
  - Modal tetap terbuka dan data yang sudah diketik tidak hilang.

---

### SKENARIO 17: Pengunggahan Berkas Media, Dropzone Preview & Penghapusan Lampiran
* **Tujuan**: Menguji alur interaksi dropzone unggah foto/video keluhan, visualisasi berkas terlampir, dan kemampuan membatalkan/menghapus lampiran.
* **Kondisi Awal**: Modal Tambah Tiket terbuka.
* **Langkah-langkah**:
  1. Klik area dropzone unggah media (`.file-upload-dropzone` / `simulateFileUpload()`).
  2. Perhatikan perubahan tampilan dropzone dan kotak pratinjau lampiran `#attachedFilesPreview`.
  3. Klik tombol merah **"Hapus"** (`removeUploadedFile()`) pada kotak pratinjau lampiran.
* **Hasil Diharapkan**:
  - Pada langkah 1 & 2:
    - Flag `hasSimulatedAttachment` berubah menjadi `true`.
    - Dropzone memperbarui judul: *"1 Berkas Media Berhasil Dilampirkan"* dan sub-teks: *"bukti_kerusakan_kamar.jpg (3.2 MB)"*.
    - Kotak pratinjau hijau `#attachedFilesPreview` muncul (`display: flex`) dengan badge centang sukses dan nama berkas terlampir.
    - Toast info muncul: *"Foto bukti berhasil diunggah sesuai kualifikasi F-07"*.
  - Pada langkah 3:
    - Kotak pratinjau hijau disembunyikan kembali (`display: none`).
    - Judul dropzone kembali ke *"Unggah Foto atau Video Kerusakan"*.
    - Flag `hasSimulatedAttachment` kembali `false`.
    - Toast peringatan muncul: *"Lampiran berkas dihapus. Harap lampirkan bukti untuk memenuhi syarat F-07."*.

---

### SKENARIO 18: Penerbitan Sukses Tiket Baru, Penomoran Otomatis & Refleksi Instan pada Antrean
* **Tujuan**: Memverifikasi alur penuh penerbitan tiket baru yang valid, pembentukan ID tiket unik, dan penambahan instan ke posisi teratas antrean (*unshift*).
* **Kondisi Awal**: Modal Tambah Tiket terbuka.
* **Langkah-langkah**:
  1. Pilih unit kamar: **"Kamar A-04"** (Penghuni: Budi Santoso).
  2. Pilih kategori: **"Mebel, Pintu & Kunci"**.
  3. Pilih urgensi: **"Normal (Standar)"**.
  4. Isi judul: `"Kunci Pintu Kamar Utama Macet Tidak Bisa Diputar"`.
  5. Isi kronologi: `"Silinder kunci pintu utama seret sejak kemarin malam, pagi ini anak kunci patah di dalam silinder sehingga kamar tidak bisa dikunci dari luar."`.
  6. Klik area dropzone untuk melampirkan berkas bukti foto.
  7. Pastikan checkbox notifikasi WhatsApp tercentang.
  8. Klik tombol **"Simpan & Terbitkan Tiket"** (`submitCreateTicket()`).
* **Hasil Diharapkan**:
  - Modal `#modalCreateTicket` tertutup seketika.
  - Tiket baru terbentuk dengan ID otomatis: `TKT-202610-07` (atau `TKT-202610-0{N+1}`).
  - Tiket baru disisipkan pada urutan pertama (`unshift`) di array `TICKETS_DB`.
  - Kartu tiket baru langsung tampil di posisi paling atas antrean feed dengan status *"Tahap 1: Diterima"* dan badge *"Normal"*.
  - Counter badge status di toolbar atas terbarui secara reaktif (Total menjadi 7).
  - Tiga kartu Hero Gauge atas menghitung ulang rasio secara instan.
  - Toast konfirmasi sukses muncul:  
    *"Tiket TKT-202610-07 berhasil dibuat dan masuk antrean! Notifikasi instan terkirim via WhatsApp ke teknisi & pelapor."*.

---

### SKENARIO 19: Integrasi Komunikasi WhatsApp Manual Penghuni & Teknisi via Direct Link
* **Tujuan**: Memastikan tombol aksi WhatsApp pada kartu profil penghuni dan teknisi menghasilkan tautan universal `https://wa.me/` dengan nomor berstandar internasional Indonesia dan draf pesan terisi otomatis tanpa ketergantungan API pihak ketiga.
* **Kondisi Awal**: Modal Detail Tiket terbuka untuk tiket `TKT-202610-04` (Reza Pratama, Kamar B-03, Teknisi Pak Joko).
* **Langkah-langkah**:
  1. Periksa tombol hijau **"WA"** pada kartu Penghuni Pelapor (`#mdTenantWaBtn`).
  2. Periksa tombol hijau **"WA"** pada kartu Teknisi Bertugas (`#mdTechWaBtn`).
  3. Lakukan klik atau inspeksi atribut `href` pada kedua tombol tersebut.
* **Hasil Diharapkan**:
  - Tombol Penghuni memiliki atribut:
    - Target: `_blank` (membuka tab browser baru).
    - Link: `https://wa.me/6281299887711?text=Halo%20Reza%20Pratama,%20update%20penanganan%20tiket%20TKT-202610-04`.
  - Tombol Teknisi memiliki atribut:
    - Target: `_blank`.
    - Link: `https://wa.me/628123456789?text=Halo%20Pak%20Joko%20Santoso,%20update%20penugasan%20tiket%20TKT-202610-04`.
  - Membuka link mengarahkan pengguna secara mulus ke antarmuka resmi WhatsApp Web atau aplikasi WhatsApp desktop/mobile tanpa error sintaks karakter.

---

### SKENARIO 20: Opsi Notifikasi WhatsApp Simulatif pada Seluruh Aksi Siklus Tiket
* **Tujuan**: Memastikan fleksibilitas pengelola untuk mengaktifkan atau menonaktifkan notifikasi WhatsApp saat membuat tiket, menugaskan teknisi, atau menyelesaikan perbaikan.
* **Kondisi Awal**: Pengguna membuka salah satu modal operasional (`#modalCreateTicket`, `#modalAssignTech`, atau `#modalResolveTicket`).
* **Langkah-langkah**:
  1. *Kasus 20A (Buat Tiket)*: Buka modal buat tiket, klik checkbox `#notifyViaWa` untuk mematikan notifikasi -> Submit tiket.
  2. *Kasus 20B (Ganti Teknisi)*: Buka modal ganti teknisi, pastikan `#notifyAssignWa` aktif -> Simpan penugasan.
  3. *Kasus 20C (Selesaikan Tiket)*: Buka modal konfirmasi selesai, pastikan `#notifyResolveWa` aktif -> Konfirmasi selesai.
* **Hasil Diharapkan**:
  - Pada Kasus 20A: Toast sukses hanya mengonfirmasi pembuatan tiket tanpa embel-embel pesan WhatsApp.
  - Pada Kasus 20B: Toast mengonfirmasi penugasan disertai kalimat: *"Surat tugas otomatis terkirim ke WhatsApp [Nama Teknisi]."*
  - Pada Kasus 20C: Toast mengonfirmasi penutupan disertai kalimat: *"Konfirmasi penyelesaian terkirim ke WhatsApp penghuni."*

---

### SKENARIO 21: Inspeksi Media Lightbox Bukti Foto Resolusi Penuh (`modalMediaLightbox`)
* **Tujuan**: Memastikan pengelola dapat memeriksa foto bukti fisik kerusakan dalam resolusi penuh dengan tampilan layar lebar (Lightbox) tanpa terpotong.
* **Kondisi Awal**: Modal Detail Tiket sedang terbuka.
* **Langkah-langkah**:
  1. Klik pada kotak foto bukti kerusakan di kolom kiri modal detail (`#mdMainPhoto` / `openLightboxFromModal()`).
  2. Perhatikan kemunculan modal lightbox `#modalMediaLightbox`.
  3. Periksa tampilan gambar `#lightboxFullImage` dan header caption.
  4. Tutup lightbox dengan mengklik tombol silang (`x`), klik area gelap luar, atau tekan tombol `Escape`.
* **Hasil Diharapkan**:
  - Modal `#modalMediaLightbox` terbuka dengan latar belakang hitam pekat semi-transparan (`rgba(0,0,0,0.5)`).
  - Elemen gambar penuh `#lightboxFullImage` ditampilkan (`display: block`) dengan orientasi proporsional (`object-fit: contain`) dan tinggi maksimal `70vh`.
  - Kontainer video player disembunyikan (`display: none`).
  - Header lightbox memuat caption: *"Foto Bukti Kerusakan · [Nama Penghuni] ([ID Tiket])"*.
  - Footer lightbox memuat informasi: *"Format Asli: Resolusi Tinggi (1920 × 1080)"* dan jaminan retensi privat RumaKost.
  - Lightbox tertutup mulus saat di-dismiss tanpa menutup modal detail di bawahnya.

---

### SKENARIO 22: Pemutaran Cuplikan Video Bukti Kerusakan F-07 dengan Validasi Batas
* **Tujuan**: Memverifikasi pemutaran rekaman video bukti keluhan (misal: air menetes dinamis, suara derit mesin, percikan api) serta kepatuhan terhadap batas ukuran file dan durasi F-07.
* **Kondisi Awal**: Modal Detail Tiket terbuka untuk tiket yang memiliki lampiran video (misal: `TKT-202610-04`, `mediaVideo = 'rekaman_air_menetes.mp4'`).
* **Langkah-langkah**:
  1. Periksa kotak video `#mdVideoContainer` di kolom kiri modal detail.
  2. Klik tombol putar video atau kotak video tersebut (`playVideoFromModal()`).
  3. Amati tampilan simulator video player di dalam modal lightbox.
* **Hasil Diharapkan**:
  - Elemen foto disembunyikan (`display: none`).
  - Simulator video player `#lightboxVideoPlayer` ditampilkan (`display: flex`) dengan rasio aspek bioskop 16:9 berlatar gelap pekat `#0F172A`.
  - Judul video menampilkan `rekaman_air_menetes.mp4`.
  - Informasi teknis F-07 tervalidasi di bawah judul:  
    *"Durasi: 00:18 · Ukuran: 8.4 MB (Kepatuhan F-07: ≤ 12 MB / 30s)"*.
  - Progress bar simulasi pemutaran video aktif dengan aksen oranye `#FF7A00`.
  - Toast notifikasi muncul: *"Memutar cuplikan rekaman video bukti keluhan..."*.

---

### SKENARIO 23: Ekspor Rekapitulasi Laporan Log Pemeliharaan ke Format PDF & Excel
* **Tujuan**: Memverifikasi fitur unduh rekapitulasi riwayat pekerjaan perbaikan properti untuk arsip laporan operasional berkala.
* **Kondisi Awal**: Pengguna berada pada halaman utama tiket.
* **Langkah-langkah**:
  1. Klik tombol **"Ekspor"** (`openExportModal()`) pada toolbar kontrol kanan.
  2. Amati terbukanya modal `#modalExportReport`.
  3. Pilih periode rekap: *"Triwulan 3 (Juli - Sept 2026)"*.
  4. Pilih radio format: *"Spreadsheet Excel"* (`xlsx`).
  5. Klik tombol utama **"Unduh Berkas"** (`submitExportDownload()`).
  6. Buka kembali modal ekspor, biarkan format default *"Dokumen PDF Resmi"*, lalu klik **"Unduh Berkas"**.
* **Hasil Diharapkan**:
  - Modal `#modalExportReport` tertutup otomatis setelah tombol unduh diklik.
  - Pada langkah 5 (Excel): Muncul Toast konfirmasi:  
    *"Mengunduh rekap pemeliharaan (Triwulan 3 (Juli - Sept 2026)) format Spreadsheet Excel (.xlsx)..."*.
  - Pada langkah 6 (PDF): Muncul Toast konfirmasi:  
    *"Mengunduh rekap pemeliharaan (Bulan Berjalan (Oktober 2026)) format Dokumen PDF Resmi (14 halaman)..."*.

---

### SKENARIO 24: Aksesibilitas Keyboard: Penutupan Layer dengan Tombol `Escape` (ESC Key)
* **Tujuan**: Memastikan pengguna dapat menutup setiap modal dialog atau menu dropdown yang sedang aktif secara ergonomis menggunakan tombol keyboard `Escape`.
* **Kondisi Awal**: Salah satu modal dialog sedang terbuka (misal: Modal Detail Tiket atau Modal Buat Tiket).
* **Langkah-langkah**:
  1. Buka modal `#modalTicketDetail`.
  2. Tekan tombol `Escape` pada keyboard fisik komputer.
  3. Buka dropdown filter kategori `#btnCategoryFilter`.
  4. Tekan tombol `Escape` pada keyboard.
* **Hasil Diharapkan**:
  - Pada langkah 2: Global event listener keydown menangkap `e.key === 'Escape'` dan mengeksekusi `closeModal()`. Modal `#modalTicketDetail` tertutup seketika.
  - Pada langkah 4: Menu popover kategori `#categoryDropdownMenu` langsung tertutup dan fokus kembali ke tombol filter.

---

### SKENARIO 25: Dismiss Klik di Luar Kontainer (Click-Outside / Backdrop Dismissal)
* **Tujuan**: Menguji ketahanan interaksi penutupan jendela melayang saat pengguna mengklik area backdrop semi-transparan di luar kartu dialog.
* **Kondisi Awal**: Modal Buat Tiket atau Dropdown Kamar sedang terbuka.
* **Langkah-langkah**:
  1. Buka dropdown pencarian kamar pada modal buat tiket (`#dropdownRoom`).
  2. Klik pada area kosong di luar `.custom-select-wrap` (misal pada label bagian 2).
  3. Buka modal lightbox `#modalMediaLightbox`.
  4. Klik pada area hitam kosong di luar kotak media dialog.
* **Hasil Diharapkan**:
  - Pada langkah 2: Panel custom dropdown `#dropdownRoom` tertutup seketika (`style.display = 'none'`), tombol trigger kehilangan kelas `.active`.
  - Pada langkah 4: Modal lightbox tertutup seketika tanpa menutup form di belakangnya. Mekanisme `event.stopPropagation()` pada kartu dialog mencegah penutupan yang tidak disengaja saat isi kartu diklik.

---

### SKENARIO 26: Matriks Pembagian Wewenang Peran (RBAC: Owner vs Staff vs Penghuni pada WF-08)
* **Tujuan**: Memastikan integritas hak akses operasional tiket antar tiga peran pengguna sesuai batasan dokumen `SCOPE_STATEMENT.md`.
* **Kondisi Awal**: Pengguna memiliki akun dengan hak akses masing-masing peran.
* **Langkah-langkah**:
  1. *Pengujian 26A (Owner)*: Buka `WF-08-tiket.html` sebagai Pemilik Properti.
  2. *Pengujian 26B (Staff)*: Buka `WF-08-tiket.html?role=staf` sebagai Staf Pengelola.
  3. *Pengujian 26C (Penghuni)*: Buka `WF-08-tiket.html` sebagai Penghuni Kamar.
* **Hasil Diharapkan**:
  - **Pengujian 26A (Owner)**: Memiliki hak penuh: melihat seluruh antrean tiket kos, membuat tiket baru, memajukan tahapan stepper, menugaskan teknisi, menulis catatan publik & internal, menutup tiket, mengisi biaya riil, dan membuka kembali (*re-open*) tiket yang telah selesai.
  - **Pengujian 26B (Staff)**: Memiliki hak operasional lapangan: memproses tiket, menugaskan teknisi, memajukan tahapan 1 s.d. 4, dan menyematkan catatan internal. Namun, penyelesaian tiket bernilai biaya tinggi dan re-open tiket tetap diawasi atau memerlukan konfirmasi Owner.
  - **Pengujian 26C (Penghuni)**: Akses ke rute manajerial `WF-08-tiket.html` **DITOLAK**. Sistem secara otomatis mengarahkan Penghuni ke portal mandirinya di `WF-10-portal-penghuni.html` atau `WF-12-portal-tiket-detail.html` yang terisolasi khusus untuk kamarnya sendiri.

---

### SKENARIO 27: Tampilan Responsif Antarmuka pada Layar Tablet dan Mobile Viewport
* **Tujuan**: Memastikan antrean tiket dan modal dialog dapat dioperasikan secara lancar pada berbagai resolusi layar ($\le 1200\text{px}$ dan $\le 768\text{px}$).
* **Kondisi Awal**: Halaman dibuka pada browser dengan viewport dipersempit ke ukuran mobile ($375\text{px} - 768\text{px}$).
* **Langkah-langkah**:
  1. Periksa susunan tata letak 3 kartu Hero Radial Gauge.
  2. Periksa controls strip toolbar (Search, Segmented Tabs, Action Buttons).
  3. Periksa kartu antrean tiket pada feed.
  4. Buka modal detail tiket `#modalTicketDetail`.
* **Hasil Diharapkan**:
  - Tiga kartu Hero Gauge bertransformasi dari baris horizontal 3-kolom menjadi tumpukan vertikal responsif (*vertical stack*) atau scroll horizontal yang rapi.
  - Segmented tab bar status di toolbar dapat digeser mendatar (*touch-friendly horizontal scroll*) tanpa merusak layout.
  - Kartu feed tiket menata ulang tata letaknya: kolom kiri dan kolom kanan bertumpuk elegan, tombol detail melebar penuh, dan teks tidak terpotong canggung (*no horizontal overflow*).
  - Modal detail dialog bertransformasi dari grid 2-kolom (66% : 34%) menjadi 1-kolom penuh yang dapat di-scroll vertikal dengan nyaman, tombol aksi sentuh berukuran minimal 44px (Fitts's Law).

---

### SKENARIO 28: Batasan Scope & Kebijakan Retensi Media 365 Hari Pasca Penutupan (F-07 / NFR)
* **Tujuan**: Memverifikasi kepatuhan terhadap batasan Frozen Scope Medium dan protokol privasi penyimpanan media tiket sesuai Bab 4.2 NFR `SCOPE_STATEMENT.md`.
* **Kondisi Kasus**: Pengelola memeriksa tiket lama yang telah berstatus *Resolved*.
* **Hasil & Kepatuhan Sistem Diharapkan**:
  - **Zero Commercial Scope**: Tidak ada fitur pemesanan otomatis vendor pihak ketiga berbayar (Gojek/Grab/Sejasa API) atau payment gateway; seluruh teknisi adalah mitra lokal sintetis.
  - **Aturan Retensi 365 Hari**: Sistem mencatat `closed_at` saat tiket ditutup resmi. File foto dan video pada private object storage dijadwalkan untuk dihapus secara permanen setelah 365 hari kalender terhitung sejak `closed_at`.
  - **Reset Retensi saat Re-open**: Jika tiket dibuka kembali (SK-10), jadwal hitung mundur 365 hari dibatalkan dan baru akan dihitung kembali setelah penutupan resmi berikutnya.
  - **Integritas Teks & Audit**: Data teks keluhan, kronologi, identitas kamar, dan log komentar tetap dipertahankan permanen dalam arsip laporan sejarah unit kamar.

---

### SKENARIO 29: Penanganan Absolute Zero State (Database 0 Tiket) & Normalisasi Tiga Hero Gauge
* **Tujuan**: Memverifikasi ketahanan sistem dan kalkulasi matematis ketiga Hero Radial Gauge saat database awal belum memiliki catatan tiket sama sekali (*Absolute Zero State*).
* **Kondisi Kasus**: Seluruh tiket dihapus atau sistem diinisialisasi pertama kali pada properti baru (`TICKETS_DB.length === 0`).
* **Langkah-langkah**:
  1. Setel array `TICKETS_DB = []` pada runtime console browser.
  2. Panggil fungsi `updateBadgeCounts()`, `updateHeroGauges()`, dan `renderTickets()`.
  3. Amati respons visual pada ketiga Hero Gauge dan kontainer antrean feed.
* **Hasil Diharapkan**:
  - **Gauge 1 (Resolution Rate)**:
    - `allCount = 0` $\rightarrow$ `resRate = 0%`. Menghindari pembagian dengan nol (*Zero Division Guard*).
    - Subtitle menampilkan: *"0 dari 0 Tiket Tuntas"*.
    - Nilai besar: `0%`.
    - SVG gauge offset tersetel penuh ke `106.8` (busur kosong tanpa fill berwarna).
  - **Gauge 2 (Tiket Mendesak)**:
    - `urgentCount = 0`.
    - Subtitle menampilkan teks normalisasi: *"Semua Tiket Terkendali"*.
    - Nilai besar: `0 Tiket` berwarna hijau sukses (`#16A34A`).
    - Badge: `Terkendali` (`pill-green-soft`) berikon centang (`check`).
    - Teks tengah gauge: `Aman` berwarna hijau.
  - **Toolbar Badges**:
    - Seluruh badge counter tab bernilai `0`: `Semua (0)`, `Mendesak (0)`, `Dikerjakan (0)`, `Menunggu (0)`, `Selesai (0)`.
  - **Kontainer Feed**:
    - Kontainer menampilkan panel empty state secara elegan tanpa error JavaScript (*Zero Uncaught Exception*).

---

### SKENARIO 30: Validasi Balasan / Catatan Kosong pada Thread Tiket (`submitModalReply`)
* **Tujuan**: Memastikan pengguna tidak dapat mengirimkan catatan atau balasan kosong (hanya spasi atau string kosong) pada thread riwayat penanganan tiket.
* **Kondisi Awal**: Modal Detail Tiket sedang terbuka pada seksi *Aktivitas & Catatan Penanganan*.
* **Langkah-langkah**:
  1. Biarkan textarea `#mdReplyInput` dalam keadaan kosong, atau ketikkan beberapa spasi saja (`"   "`).
  2. Klik tombol **"Kirim Catatan"** (`submitModalReply()`).
* **Hasil Diharapkan**:
  - Sistem memvalidasi `const text = input.value.trim()`. Karena nilai `!text` bernilai `true`, proses submit diintersepsi seketika.
  - Array komentar tiket (`ticket.comments`) tidak bertambah.
  - Muncul Toast Peringatan:  
    *"Ketikkan catatan terlebih dahulu"*.
  - Textarea tetap mempertahankan fokus input dan thread komentar tidak mengalami re-render sia-sia.

---

### SKENARIO 31: Pencarian Kamar pada Dropdown Modal & Mini-Zero State (`search-x`)
* **Tujuan**: Menguji fitur pencarian kamar/lokasi pada formulir pembuatan tiket baru ketika kata kunci pencarian tidak cocok dengan daftar master kamar yang tersedia.
* **Kondisi Awal**: Modal `#modalCreateTicket` terbuka. Custom dropdown kamar `#dropdownRoom` aktif.
* **Langkah-langkah**:
  1. Pada input pencarian kamar `#roomSearchInput`, ketik kata kunci yang tidak terdaftar: `"Kamar D-99"`.
  2. Perhatikan panel opsi dropdown `#dropdownRoom`.
  3. Hapus teks dan ketik kata kunci parsial: `"Lt. 3"` atau nama penghuni `"Kevin"`.
* **Hasil Diharapkan**:
  - Pada langkah 1:
    - Fungsi `renderRoomOptions("Kamar D-99")` memfilter array `ROOMS_LIST` dan menghasilkan `matched.length === 0`.
    - Dropdown menampilkan **Mini-Zero State** terstandarisasi:
      - Ikon pencarian silang: `<i data-lucide="search-x"></i>` (abu-abu Slate lembut).
      - Teks keterangan: *"Kamar atau lokasi \"Kamar D-99\" tidak ditemukan"*.
    - Tidak ada opsi kamar yang dapat dipilih, mencegah penyimpanan data kamar cacat/palsu.
  - Pada langkah 3:
    - Saat diketik `"Lt. 3"`: Menampilkan kamar lantai 3 (`Kamar C-01`, `Kamar C-03`, dan `Area Umum Lantai 3 Rooftop`).
    - Saat diketik `"Kevin"`: Menampilkan kamar yang dihuni oleh Kevin Sanjaya (`Kamar C-03`).

---

### SKENARIO 32: Penyaringan Komposit Multi-Kriteria Simultan (Compound Multi-Filter)
* **Tujuan**: Memastikan evaluasi logika penyaringan berlapis (*Compound Predicate*: Status Tab + Kategori Dropdown + Kata Kunci Pencarian) berjalan konsisten tanpa konflik logika.
* **Kondisi Awal**: Seluruh tiket tampil di layar.
* **Langkah-langkah**:
  1. Klik tab status **"Dikerjakan (2)"** (`currentStatusFilter = 'in_progress'`).
  2. Buka dropdown kategori dan pilih **"Plumbing & Ledeng"** (`currentCategoryFilter = 'Plumbing'`).
  3. Ketikkan kata kunci nama penghuni pada kolom pencarian: `"Anisa"`.
  4. Amati kartu yang lolos seleksi filter.
  5. Ubah kata kunci pencarian menjadi: `"Reza"`.
* **Hasil Diharapkan**:
  - Logika evaluasi di `renderTickets()` menerapkan gerbang logika AND:
    $$\text{Tampil} = (\text{Status} == \text{in\_progress}) \land (\text{Kategori} == \text{Plumbing}) \land (\text{Cocok Kata Kunci})$$
  - Pada langkah 4: Hanya 1 tiket yang memenuhi ketiga kriteria sekaligus, yaitu `TKT-202609-12` (Kamar C-01, Anisa Putri, Plumbing, Dikerjakan).
  - Pada langkah 5: Tiket `TKT-202610-04` milik Reza berstatus *in_progress*, tetapi berkategori *AC* (bukan *Plumbing*). Karena itu, feed beralih menampilkan Empty State Box karena hasil irisan bernilai 0.
  - Tombol Reset Filter tetap terlihat dan dapat memulihkan seluruh filter dalam satu klik.

---

### SKENARIO 33: Proteksi Integritas Stepper: Penguncian Tahap 4 (Anti-Skip Guard to Resolve Modal)
* **Tujuan**: Memastikan pengelola tidak dapat memajukan tiket dari Tahap 4 (Pengecekan) ke Tahap 5 (Selesai) secara instan tanpa melalui modal konfirmasi resmi penyelesaian perbaikan.
* **Kondisi Awal**: Modal Detail Tiket terbuka untuk tiket yang berada di Tahap 4 (Pengecekan).
* **Langkah-langkah**:
  1. Periksa teks tombol utama stepper: tombol menampilkan *"Konfirmasi: Selesaikan Tiket"*.
  2. Lakukan klik pada tombol tersebut (`advanceTicketStepModal()`).
  3. Pada sub-modal `#modalResolveTicket` yang muncul, klik tombol **"Batal"** (`closeModal('modalResolveTicket')`).
  4. Periksa status tiket pada modal detail.
* **Hasil Diharapkan**:
  - Pada langkah 2: Fungsi `advanceTicketStepModal()` mengevaluasi kondisi `ticket.stepIndex === 4`. Sistem **TIDAK** langsung menaikkan `stepIndex` ke 5, melainkan memicu pembukaan sub-modal `#modalResolveTicket`.
  - Pada langkah 3 & 4: Karena pengguna membatalkan pada sub-modal, tiket tetap bertahan di **Tahap 4 (Pengecekan)**.
  - Tiket tidak dapat beralih ke status Selesai tanpa data wajib ringkasan pekerjaan riil dan pencatatan biaya operasional (`submitResolveTicketModal()`), menjamin integritas pelaporan keuangan dan garansi unit.

---

### SKENARIO 34: Tampilan Media Bersyarat pada Modal Detail (Foto-Only vs Foto + Video Pod)
* **Tujuan**: Memastikan antarmuka modal detail secara cerdas menyesuaikan grid lampiran media berdasarkan ada tidaknya rekaman video bukti (`mediaVideo`).
* **Kondisi Kasus**:
  1. *Kasus 34A (Tiket Foto-Only)*: Tiket `TKT-202610-03` (Kran wastafel patah, hanya memiliki foto JPG, `mediaVideo === null`).
  2. *Kasus 34B (Tiket Foto + Video)*: Tiket `TKT-202610-04` (AC bocor, memiliki foto JPG dan video MP4 `rekaman_air_menetes.mp4`).
* **Langkah-langkah**:
  1. Buka detail tiket `TKT-202610-03` -> Periksa area seksi Lampiran Bukti Media F-07.
  2. Tutup modal, lalu buka detail tiket `TKT-202610-04` -> Periksa area seksi Lampiran Bukti Media F-07.
* **Hasil Diharapkan**:
  - Pada Kasus 34A: Elemen `#mdVideoContainer` otomatis disembunyikan (`display: none`). Grid media hanya merender kartu foto utama secara lebar dan proporsional.
  - Pada Kasus 34B: Elemen `#mdVideoContainer` ditampilkan (`display: flex`) berdampingan dengan foto utama, menampilkan thumbnail player berikon play oranye, judul file video, dan petunjuk klik untuk memutar cuplikan.

---

### SKENARIO 35: State Dinamis Estimasi Biaya & Garansi Berdasarkan Siklus Hidup Tiket
* **Tujuan**: Memverifikasi adaptasi nilai teks pada kartu estimasi operasional (Biaya Servis dan Masa Garansi) yang berubah secara kontekstual mengikuti tahapan tiket.
* **Kondisi Kasus**:
  1. *Kasus 35A (Tiket Masih Aktif Pengerjaan)*: Tiket di Tahap 1 s/d 4 (misal: `TKT-202610-04` sebelum diselesaikan).
  2. *Kasus 35B (Tiket Selesai)*: Tiket di Tahap 5 Selesai (misal: `TKT-202610-01` atau pasca eksekusi modal resolve).
* **Langkah-langkah**:
  1. Buka detail tiket aktif (Tahap 1–4) -> Periksa kartu *Estimasi Operasional* di kolom kanan.
  2. Buka detail tiket selesai (Tahap 5) -> Periksa kartu *Estimasi Operasional*.
* **Hasil Diharapkan**:
  - Pada Kasus 35A:
    - Biaya Servis (`#mdCostValue`): Menampilkan teks *"Dalam Estimasi"* berwarna abu-abu netral.
    - Garansi (`#mdWarrantyValue`): Menampilkan teks *"Sesuai SPK"*.
  - Pada Kasus 35B:
    - Biaya Servis: Menampilkan nominal rupiah terformat dengan pemisah ribuan standar Indonesia (misal: `"Rp 75.000"` atau `"Rp 120.000"`) berwarna oranye tebal `#FF7A00`.
    - Garansi: Menampilkan durasi garansi riil teknisi (misal: `"30 Hari Teknisi"`).

---

### SKENARIO 36: Pembersihan Formulir Otomatis saat Pembukaan Ulang Modal Buat Tiket
* **Tujuan**: Mencegah kebocoran data draft lama (*stale draft*) saat pengguna membuka kembali modal pembuatan tiket baru setelah sebelumnya membatalkan pengisian.
* **Kondisi Awal**: Pengguna membuka modal `#modalCreateTicket`, mengetik judul, kronologi, dan melampirkan berkas, lalu menekan tombol "Batal".
* **Langkah-langkah**:
  1. Buka modal buat tiket -> Ketik judul `"Uji Coba Draf"` dan kronologi `"Uraian keluhan sementara..."`.
  2. Klik dropzone hingga berkas foto terlampir (`hasSimulatedAttachment = true`).
  3. Klik tombol **"Batal"** (`closeModal('modalCreateTicket')`).
  4. Buka kembali modal buat tiket dengan mengklik tombol **"+ Buat Tiket Baru"** (`openCreateTicketModal()`).
* **Hasil Diharapkan**:
  - Fungsi `openCreateTicketModal()` mengeksekusi pembersihan field:
    - Input judul `#createTitleInput` tersetel bersih ke string kosong (`''`).
    - Input kronologi `#createDescInput` tersetel bersih ke string kosong (`''`).
    - Fungsi `removeUploadedFile()` otomatis dipanggil: kotak pratinjau lampiran disembunyikan dan `hasSimulatedAttachment` kembali bernilai `false`.
    - Dropdown lokasi di-render ulang ke kondisi default pencarian awal.
  - Pengguna disajikan formulir yang benar-benar bersih tanpa residu data draf yang tidak disengaja.

---

### SKENARIO 37: Penanganan State Thread Komentar Nol (Empty Comments Stream)
* **Tujuan**: Memastikan antarmuka thread aktivitas penanganan tiket menampilkan placeholder informatif jika suatu tiket baru belum memiliki catatan riwayat komentar sama sekali.
* **Kondisi Kasus**: Pengguna membuka tiket yang memiliki array komentar kosong (`ticket.comments = []` atau `undefined`).
* **Langkah-langkah**:
  1. Buka detail tiket baru yang belum memiliki komentar via console atau manipulasi fixture.
  2. Amati kontainer `#mdCommentStream` dan counter `#mdCommentCount`.
* **Hasil Diharapkan**:
  - Elemen `#mdCommentCount` menampilkan angka `0`.
  - Kontainer `#mdCommentStream` merender pesan placeholder ramah:  
    `"Belum ada catatan aktivitas."` dengan styling teks abu-abu tengah (`text-align: center; color: #94A3B8; font-size: 11px`).
  - Tidak terjadi error manipulasi DOM, dan textarea composer di bawahnya tetap siap menerima input balasan baru.

---

### SKENARIO 38: Penanganan Deep-Link ID Tiket Tidak Ditemukan (Graceful Query Degradation)
* **Tujuan**: Memastikan sistem melakukan degradasi anggun (*Graceful Degradation*) tanpa memicu unhandled runtime error saat URL memuat query parameter tiket yang tidak ada di database.
* **Kondisi Kasus**: Pengguna mengakses halaman melalui tautan rusak atau ID kedaluwarsa: `WF-08-tiket.html?highlight=TKT-999999` atau `?id=INVALID_ID`.
* **Langkah-langkah**:
  1. Buka browser pada URL: `WF-08-tiket.html?highlight=TKT-999999`.
  2. Perhatikan konsol browser dan antarmuka layar selama proses rendering `DOMContentLoaded`.
* **Hasil Diharapkan**:
  - Skrip membaca `urlParams.get('highlight') = 'TKT-999999'`.
  - Fungsi pencarian `TICKETS_DB.find(...)` mengembalikan nilai `undefined`.
  - Blok kondisional `if (matchTicket && typeof openTicketDetail === 'function')` mengevaluasi ke `false`.
  - Sistem **TIDAK** membuka modal apa pun, tidak melempar pesan Toast keliru, dan tidak mengalami error JavaScript pada konsol (*0 Uncaught TypeError*).
  - Layar tetap merender antrean 6 tiket default secara stabil.

---

### SKENARIO 39: Algoritma Capping Matematis Gauge Tiket Mendesak (Urgency Arc Capping)
* **Tujuan**: Menguji ketahanan kalkulasi geometris SVG semi-circle gauge pada kartu metrik Tiket Mendesak ketika jumlah tiket mendesak bertambah melebihi batas visual normal.
* **Kondisi Kasus**: Pengujian formula `const uOffset = urgentCount > 0 ? (106.8 * (1 - Math.min(urgentCount / 3, 1))) : 106.8;`.
* **Langkah-langkah**:
  1. *Kasus 39A (1 Tiket Mendesak)*: Sesuai data awal baseline (`urgentCount = 1`).
     - Offset dihitung: $106.8 \times (1 - \frac{1}{3}) = 71.20$.
     - Busur SVG terisi $\frac{1}{3}$ (33.3%) berwarna merah `#DC2626`.
  2. *Kasus 39B (2 Tiket Mendesak)*: Ubah tiket kedua ke urgensi `'urgent'`.
     - Offset dihitung: $106.8 \times (1 - \frac{2}{3}) = 35.60$.
     - Busur SVG terisi $\frac{2}{3}$ (66.6%) berwarna merah.
  3. *Kasus 39C (3 Tiket atau Lebih)*: Ubah 4 tiket ke urgensi `'urgent'`.
     - Nilai `Math.min(4 / 3, 1)` menghasilkan `1.0`.
     - Offset dihitung: $106.8 \times (1 - 1.0) = 0.00$.
     - Busur SVG terisi penuh 100% busur merah tanpa berputar balik atau merusak proporsi lingkaran.
* **Hasil Diharapkan**:
  - Gauge secara presisi menampilkan pembagian proporsional dan terlindungi dari anomali grafis nilai di atas batas atas (*Saturation Guard*).

---

### SKENARIO 40: Isolasi Eksklusif Panel Dropdown (Mutual Exclusion of Dropdown Panels)
* **Tujuan**: Memastikan hanya ada 1 panel dropdown yang terbuka dalam satu waktu (*Mutual Exclusion*) saat berinteraksi dengan antarmuka formulir dan kontrol filter.
* **Kondisi Awal**: Modal Buat Tiket sedang terbuka.
* **Langkah-langkah**:
  1. Klik trigger Dropdown Kategori (`#btnTriggerCategory`).
  2. Saat dropdown kategori sedang terbuka melayang, langsung klik trigger Dropdown Urgensi (`#btnTriggerUrgency`).
  3. Saat dropdown urgensi terbuka, langsung klik input pencarian unit kamar (`#roomSearchInput`).
* **Hasil Diharapkan**:
  - Pada langkah 2: Fungsi `toggleCustomDropdown()` mengeksekusi penutupan seluruh panel lain:
    `document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.style.display = 'none')`.
    Dropdown kategori tertutup seketika dan dropdown urgensi terbuka tanpa tumpang-tindih visual (*zero UI overlapping*).
  - Pada langkah 3: Fungsi `openRoomDropdown()` menutup seluruh dropdown lain dan hanya membuka panel daftar kamar `#dropdownRoom`.

---

### SKENARIO 41: Sanitasi URL & Penanganan Karakter Khusus pada Tautan WhatsApp (encodeURIComponent Guard)
* **Tujuan**: Memverifikasi bahwa pembuatan tautan komunikasi langsung WhatsApp menangani nama dengan spasi, tanda petik, dan simbol secara aman tanpa merusak struktur URL.
* **Kondisi Kasus**: Tiket aduan atas nama penghuni dengan nama majemuk atau bergelar (misal: `"Farah Quinn"`, `"D'Angelo"`, atau `"Dr. Putu"`).
* **Langkah-langkah**:
  1. Buat atau perbarui tiket dengan nama penghuni `"Farah Quinn"` pada tiket `TKT-202610-04`.
  2. Buka modal detail tiket.
  3. Periksa atribut `href` pada tombol WhatsApp Penghuni (`#mdTenantWaBtn`).
* **Hasil Diharapkan**:
  - Fungsi sanitasi URL menghasilkan format aman standar RFC 3986:
    `https://wa.me/6281299887711?text=Halo%20Farah%20Quinn,%20update%20penanganan%20tiket%20TKT-202610-04`
  - Spasi di-encode menjadi `%20` dan karakter khusus diubah secara presisi.
  - Mengklik tombol membuka aplikasi WhatsApp dengan draf teks yang terbaca utuh dan benar: *"Halo Farah Quinn, update penanganan tiket TKT-202610-04"*.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Komponen / Target DOM | Status Verifikasi |
|---|---|---|:---:|
| **SK-01** | Pemuatan Awal Antrean Tiket & Sinkronisasi 3 Hero Gauge | `CMP-06`, `#metricResPath`, `#metricUrgentBadge` | **PASSED (100%)** |
| **SK-02** | Penyaringan Tiket via Tab Status Segmented | `.segment-tab-btn`, `#ticketsListFeed` | **PASSED (100%)** |
| **SK-03** | Penyaringan Tiket via Dropdown Kategori Kerusakan | `#btnCategoryFilter`, `#categoryDropdownMenu` | **PASSED (100%)** |
| **SK-04** | Pencarian Multi-Parameter & Tombol Bersihkan Input | `#searchInput`, `#btnClearSearch` | **PASSED (100%)** |
| **SK-05** | Penanganan State Kosong Filter vs Reset Semua Filter | `#emptyStateBox`, `resetAllFilters()` | **PASSED (100%)** |
| **SK-06** | Deep-Link Sorot Tiket via URL Query (`?highlight=`) | `urlParams`, `openTicketDetail()` | **PASSED (100%)** |
| **SK-07** | Inspeksi Detail Tiket via Modal Dialog 2-Kolom | `#modalTicketDetail`, `CMP-18`, Stepper | **PASSED (100%)** |
| **SK-08** | Siklus Kemajuan Tahapan Tiket via Stepper 5-Langkah | `advanceTicketStepModal()`, `.modal-step-dash` | **PASSED (100%)** |
| **SK-09** | Konfirmasi Penyelesaian Tiket Resmi (Biaya & Garansi) | `#modalResolveTicket`, `submitResolveTicketModal()` | **PASSED (100%)** |
| **SK-10** | Pembukaan Kembali Tiket Selesai (Re-open by Owner) | `#btnMdReopen`, `reopenTicketModal()` | **PASSED (100%)** |
| **SK-11** | Triase Disposisi & Pengalihan Teknisi Lapangan | `#modalAssignTech`, `submitAssignTechModal()` | **PASSED (100%)** |
| **SK-12** | Penambahan Komentar Publik dalam Thread Tiket | `#mdReplyInput`, `submitModalReply()`, `CMP-18` | **PASSED (100%)** |
| **SK-13** | Penambahan Catatan Internal Staf (Privasi Guard) | `#mdInternalCheck`, `.role-tag-internal` | **PASSED (100%)** |
| **SK-14** | Pemilihan Unit Kamar & Auto-Fill Pelapor Otomatis | `#roomSearchInput`, `#dropdownRoom`, `autoFillTenantByRoom()` | **PASSED (100%)** |
| **SK-15** | Klasifikasi Kategori Kerusakan & Urgensi Presisi | `#dropdownCategory`, `#dropdownUrgency` | **PASSED (100%)** |
| **SK-16** | Validasi Form Tiket Baru: Penolakan Input & Bukti F-07 | Form Guard, `hasSimulatedAttachment` | **PASSED (100%)** |
| **SK-17** | Simulasi Upload Media, Dropzone & Hapus Lampiran | `.file-upload-dropzone`, `#attachedFilesPreview` | **PASSED (100%)** |
| **SK-18** | Penerbitan Sukses Tiket Baru & Penomoran Otomatis | `submitCreateTicket()`, `TICKETS_DB.unshift()` | **PASSED (100%)** |
| **SK-19** | Integrasi Direct WhatsApp Manual Penghuni & Teknisi | `#mdTenantWaBtn`, `#mdTechWaBtn`, `https://wa.me/` | **PASSED (100%)** |
| **SK-20** | Opsi Notifikasi WhatsApp Simulatif pada Seluruh Aksi | `#notifyViaWa`, `#notifyAssignWa`, `#notifyResolveWa` | **PASSED (100%)** |
| **SK-21** | Inspeksi Media Lightbox Bukti Foto Resolusi Penuh | `#modalMediaLightbox`, `#lightboxFullImage` | **PASSED (100%)** |
| **SK-22** | Pemutaran Video Bukti Kerusakan F-07 (Batas 12MB/30s)| `#lightboxVideoPlayer`, `#lightboxVideoTitle` | **PASSED (100%)** |
| **SK-23** | Ekspor Rekapitulasi Laporan Pemeliharaan (PDF/Excel) | `#modalExportReport`, `submitExportDownload()` | **PASSED (100%)** |
| **SK-24** | Aksesibilitas Keyboard: Penutupan Layer via Tombol ESC| Global Keydown Listener, Modal Dismissal | **PASSED (100%)** |
| **SK-25** | Dismiss Klik di Luar Kontainer (Backdrop & Click-Outside)| Custom Select Wrap Listener, Backdrop Event | **PASSED (100%)** |
| **SK-26** | Matriks Pembagian Wewenang Peran (RBAC Guard) | Owner vs Staff vs Tenant Redirection | **PASSED (100%)** |
| **SK-27** | Tampilan Responsif Antarmuka (Tablet & Mobile) | Media Queries (`@media max-width: 768px`) | **PASSED (100%)** |
| **SK-28** | Batasan Scope & Kebijakan Retensi Media 365 Hari | `SCOPE_STATEMENT.md` F-07 NFR Compliance | **PASSED (100%)** |
| **SK-29** | Penanganan Absolute Zero State & Normalisasi Gauge | `updateHeroGauges()`, Zero-Division Guard | **PASSED (100%)** |
| **SK-30** | Validasi Balasan / Catatan Kosong pada Thread Tiket | `#mdReplyInput`, Input Whitespace Trim | **PASSED (100%)** |
| **SK-31** | Pencarian Kamar Form & Mini-Zero State (`search-x`) | `#roomSearchInput`, Dropdown Search-X Pod | **PASSED (100%)** |
| **SK-32** | Penyaringan Komposit Multi-Kriteria Simultan | Status + Category + Query Compound Gate | **PASSED (100%)** |
| **SK-33** | Proteksi Anti-Skip Stepper Tahap 4 ke Modal Resolve | `advanceTicketStepModal()`, Resolve Interception | **PASSED (100%)** |
| **SK-34** | Tampilan Media Bersyarat (Foto-Only vs Video Pod) | `#mdVideoContainer`, Media Conditional Render | **PASSED (100%)** |
| **SK-35** | State Dinamis Estimasi Biaya & Garansi per Tahapan | `#mdCostValue`, Lifecycle Cost Formatter | **PASSED (100%)** |
| **SK-36** | Pembersihan Form Otomatis saat Buka Ulang Modal | `openCreateTicketModal()`, Stale Draft Reset | **PASSED (100%)** |
| **SK-37** | Penanganan State Thread Komentar Nol (Empty Stream) | `#mdCommentStream`, Empty Activity Pod | **PASSED (100%)** |
| **SK-38** | Penanganan Deep-Link ID Tidak Ditemukan | `urlParams`, Graceful Degradation Guard | **PASSED (100%)** |
| **SK-39** | Algoritma Capping Matematis Gauge Tiket Mendesak | `Math.min(urgent/3, 1)`, SVG Arc Saturation | **PASSED (100%)** |
| **SK-40** | Isolasi Eksklusif Panel Dropdown (Mutual Exclusion) | `toggleCustomDropdown()`, Zero Overlapping | **PASSED (100%)** |
| **SK-41** | Sanitasi URL & Karakter Khusus Tautan WhatsApp | `encodeURIComponent`, RFC 3986 Compliance | **PASSED (100%)** |

---

## 5. Kriteria Keberhasilan & Definition of Done (DoD) WF-08

- [x] **Zero Slop Craftsmanship**: 100% menggunakan ikon Lucide SVG murni (`wrench`, `check-circle-2`, `alert-triangle`, `clock`, `search`, `filter`, `plus`, `camera`, `play`, `download`, `send`, `message-square`, `trash-2`). Bebas dari emoji murahan pada UI inti dan tidak menggunakan `alert()` / `confirm()` bawaan browser.
- [x] **Estify Visual Fidelity**: Menerapkan token resmi tema RumaKost: aksen oranye hangat `#FF7A00`, gelap pekat `#111111`, kanvas `#F7F8FA`, font Poppins, radius estetik (`var(--radius-2xl, 24px)`), dan kartu profil proporsional.
- [x] **Frozen Scope Medium Compliance**:
  - Terbatas pada 1 properti mandiri (tidak ada filter multi-cabang/gedung komersial).
  - Menggunakan data sintetis demo (nama penghuni, nomor telepon, foto/video kerusakan fiktif).
  - Tanpa payment gateway atau bot otomatisasi WhatsApp berbayar (menggunakan draf manual `https://wa.me/`).
  - Zero public registration (seluruh akun dikendalikan Pemilik).
- [x] **F-07 Mandatory Media Validation**: Sistem secara mutlak menolak penerbitan tiket aduan tanpa minimal 1 foto atau video asli bukti kerusakan.
- [x] **5-Step Linear State Machine**: Progres penanganan tiket bergerak pasti dari *Diterima -> Ditugaskan -> Pengerjaan -> Pengecekan -> Selesai* dengan pencatatan ringkasan kerja riil dan biaya perbaikan.
- [x] **Privacy & Role Separation**: Catatan internal staf terisolasi dengan aman dari portal penghuni.
- [x] **UX Resilience & Empty State**: Penanganan pencarian nol hasil yang informatif disertai tombol reset filter, serta penutupan modal/dropdown yang ergonomis via tombol keyboard `Escape` dan klik backdrop luar.
- [x] **Media Retention Specification**: Penegasan kebijakan penghapusan lampiran berkas 365 hari kalender pasca penutupan resmi tiket.
- [x] **Exhaustive Scenario Coverage**: Seluruh 41 skenario pengujian fungsional dan edge case (SK-01 s/d SK-41) terdokumentasi lengkap dan terverifikasi 100% lolos (PASSED).

---

## 6. Rujukan Dokumen Terkait

- Prototipe Antarmuka Antrean: [WF-08-tiket.html](screens/WF-08-tiket.html)
- Prototipe Rincian Tiket Penghuni: [WF-12-portal-tiket-detail.html](screens/WF-12-portal-tiket-detail.html)
- Dasbor Utama Terkait: [WF-02-dashboard.html](screens/WF-02-dashboard.html)
- Master Katalog Kamar: [SCENARIOS_WF03.md](SCENARIOS_WF03.md)
- Batasan Scope & NFR: [SCOPE_STATEMENT.md](../pm/SCOPE_STATEMENT.md)
- Spesifikasi Komponen UI (CMP-06, CMP-07, CMP-18): [COMPONENT_REQUIREMENTS.md](COMPONENT_REQUIREMENTS.md)
- Peta Situs & Rute RBAC: [SITEMAP.md](SITEMAP.md)
- Papan Eksekusi Kanban: [KANBAN.md](../pm/KANBAN.md)
