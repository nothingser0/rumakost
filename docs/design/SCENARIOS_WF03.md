# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-03: Manajemen Katalog Kamar, Inventaris & Partisi Lantai (SCR-03)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-03-kamar.html`  
> **Fitur Terkait**: **F-01** (Akses & Peran / RBAC), **F-02** (Manajemen Master Kamar & Partisi Lantai), **F-03** (Pelacakan Status Fisik & Hunian), **F-07** (Pemeliharaan Fasilitas & Tiket Servis)  
> **User Stories KANBAN**: `RK-001` (Akses & Proteksi Hak Peran), `RK-002` (Katalog & Matriks Kamar 15 Unit), `RK-022` (Pendaftaran & Pembaruan Kamar), `RK-023` (Partisi & Skalabilitas Lantai Properti), `RK-024` (Pemisahan Status Fisik vs Okupansi), `RK-025` (Broadcast Iklan WhatsApp Kamar Kosong)  
> **Hak Akses Layar**: **Pemilik Properti (Owner / Superadmin)** & **Staf Pengelola (Staff / Operasional Terbatas)** — *Penghuni Kost diblokir dan dialihkan ke Portal Mandiri (WF-10)*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-03 (`SCR-03`)** adalah pusat operasional tata kelola unit properti RumaKost yang menyajikan visualisasi katalog 15 unit kamar secara komprehensif. Layar ini dibangun di atas filosofi desain **Estify Minimalist DNA** dengan tata letak **Inverted Pyramid Architecture (Piramida Terbalik)** yang mengalir dari ringkasan makro ke detail inspeksi mikro.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               WF-03 WORKBENCH ARSITEKTUR & LAYOUT                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Nav Pill (Role-Adaptive) + User Avatar / Role      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. MACRO METRICS STRIP: 3 Kartu Radial Speedometer Gauge (Okupansi, Rata-rata Tarif, Potensi Sewa)   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. CONTROLS TOOLBAR (40px Row): Kapsul Cari + Popover Filter Lantai + Filter Status + CTA (40px)│
├────────────────────────────────────────────────────────┬────────────────────────────────────────┤
│ 4. MASTER 2-COLUMN FLOW (~68% GRID CANVAS)             │ 5. FOCUSED DOSSIER DRAWER (360PX FIXED)│
│    • Kluster Lantai 1 (Blok A) — 5 Unit Kamar          │    • Foto Hero Kamar (Aspect 16:10)    │
│    • Kluster Lantai 2 (Blok B) — 5 Unit Kamar          │    • Badge Status & Spesifikasi Utama  │
│    • Kluster Lantai 3 (Blok C) — 5 Unit Kamar          │    • 7 Pill Fasilitas Ikonis (8px)     │
│    • Kartu Kompak 3-Baris (Thumb, Specs, Tarif)        │    • Dynamic Dossier Pod Sesuai Status: │
│    • Dynamic Empty State Handling (Filter vs Zero)     │      - Terisi: Info Tenant + WA Direct  │
│    • Partisi Lantai Dinamis (Tambah & Hapus Kluster)   │      - Kosong: Readiness + Iklan WA    │
│                                                        │      - Perbaikan: Maintenance Pod       │
│                                                        │    • Level 1/2 Action Buttons          │
└────────────────────────────────────────────────────────┴────────────────────────────────────────┘
```

### Pilar Arsitektural & Domain Boundaries:
1. **Pemisahan Tegas Status Fisik vs Status Hunian (*Domain Boundary*)**:  
   Modul kamar hanya mengelola kesiapan fisik inventaris (`[ Siap Huni ]` $\leftrightarrow$ `[ Perbaikan ]`). Status `[ Terisi ]` wajib diinisiasi melalui penerbitan kontrak sewa resmi di modul Penghuni (`WF-04`). Kamar berpenghuni aktif terkunci dari perubahan status sepihak dan dilarang keras untuk dihapus dari sistem.
2. **Skalabilitas Partisi Lantai Tanpa Batas (*Infinite Floor Scalability*)**:  
   Mendukung penambahan seksi lantai baru secara *on-the-fly* langsung dari dropdown formulir tanpa dialog browser bawaan, serta dilindungi aturan mutlak *Floor Deletion Guard* (lantai wajib 0 unit untuk dapat dihapus).
3. **Keterhubungan Reaktif Real-Time (*Reactive Synchronized State*)**:  
   Setiap mutasi data unit kamar secara otomatis mengkalkulasi ulang persentase okupansi, nilai sewa tertagih, dan counter chip di toolbar filter secara instan.
4. **Isolasi Peran & Proteksi Wewenang (*Role-Based Access Control*)**:  
   Penghuni dicegah masuk ke layar inventaris properti. Staf operasional dibatasi dari aksi destruktif penghapusan unit kamar dan pembongkaran lantai master.

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai ketetapan **Frozen Scope Medium (1 Properti Mandiri, 7 Kelompok P0)** pada `docs/pm/SCOPE_STATEMENT.md`, pengujian fungsional layar WF-03 dikunci pada batasan berikut:

| Area Batasan | Ketetapan Scope Medium (In-Scope) | Batasan Mutlak (Out-of-Scope / P3 Won't) |
| :--- | :--- | :--- |
| **Batas Properti** | 1 Properti Mandiri: *"RumaKost Flamboyan"* (15 Unit Kamar Fixture Baseline, 3 Lantai Asal). | Dilarang menguji *multi-property selector*, pemindahan unit lintas cabang kost, atau manajemen kluster multi-gedung. |
| **Metode Komunikasi WA**| Tautan URL eksternal manual menggunakan protokol `https://wa.me/` dengan draf teks terformat rapi. | Dilarang menguji integrasi WhatsApp Business Cloud API otomatis, bot broadcast massal berbayar, atau webhook pihak ketiga. |
| **Siklus Check-in/Check-out**| Tautan navigasi kontekstual ke `WF-04-penghuni.html` untuk pembuatan kontrak atau terminasi sewa. | Dilarang mengubah status kamar menjadi `terisi` secara manual di dalam formulir kamar tanpa kontrak valid. |
| **Akses Pengguna (RBAC)**| Role Owner (Akses penuh) dan Staf (Operasional terbatas). Akun Penghuni diblokir dari layar ini. | Dilarang menguji registrasi publik mandiri (*public self sign-up*). |
| **Karakter Data** | Seluruh data pengujian (nama penyewa, kontak telepon, nomor token PLN) adalah **Data Sintetis**. | Dilarang menggunakan PII (*Personally Identifiable Information*) riil dari responden riset. |

---

## 3. Matriks Entitas Data Kamar Awal (15 Kamar Fixture Baseline)

| No. Kamar | Lantai | Tipe Kamar | Dimensi | Tarif / Bulan | Deposit | Meteran PLN | Status | Profil Penghuni / Kondisi Unit |
|---|---|---|---|---|---|---|---|---|
| **A-01** | Lantai 1 | Standar | 3 × 4 M | Rp 1.200.000 | Rp 500.000 | PLN 1423-8891 | **Terisi** | Siti Aminah (Karyawan Swasta) · Lunas Okt 2026 |
| **A-02** | Lantai 1 | Standar | 3 × 4 M | Rp 1.200.000 | Rp 500.000 | PLN 1423-8892 | **Terisi** | Dimas Prasetyo (Karyawan) · Jatuh Tempo H-3 |
| **A-03** | Lantai 1 | Standar | 3 × 4 M | Rp 1.100.000 | Rp 500.000 | PLN 1423-8893 | **Kosong** | Unit bersih, siap huni, token 20 kWh |
| **A-04** | Lantai 1 | Standar AC | 3.5 × 4 M | Rp 1.500.000 | Rp 500.000 | PLN 1423-8894 | **Terisi** | Budi Santoso (Karyawan Swasta) · Tempo H-3 |
| **A-05** | Lantai 1 | Standar | 3 × 4 M | Rp 1.100.000 | Rp 500.000 | PLN 1423-8895 | **Terisi** | Sri Wahyuni (Mahasiswi) · Lunas Okt 2026 |
| **B-01** | Lantai 2 | Standar | 3 × 4 M | Rp 1.300.000 | Rp 500.000 | PLN 1423-8901 | **Terisi** | Dodi Firmansyah (Wiraswasta) · Telat 3 Hari |
| **B-02** | Lantai 2 | Standar | 3 × 4 M | Rp 1.300.000 | Rp 500.000 | PLN 1423-8902 | **Terisi** | Rini Marlina (Karyawan Swasta) · Lunas |
| **B-03** | Lantai 2 | Deluxe | 4 × 5 M | Rp 1.800.000 | Rp 1.000.000| PLN 1423-8903 | **Kosong** | Unit Deluxe luas, Kasur Queen, AC 1 PK, Siap |
| **B-04** | Lantai 2 | Standar | 3 × 4 M | Rp 1.300.000 | Rp 500.000 | PLN 1423-8904 | **Terisi** | Eko Prasetyo (Karyawan Swasta) · Lunas |
| **B-05** | Lantai 2 | Standar AC | 3.5 × 4 M | Rp 1.500.000 | Rp 500.000 | PLN 1423-8905 | **Perbaikan**| Tiket #T-04 · Servis AC & Ganti Pipa Freon (Pak Joko) |
| **C-01** | Lantai 3 | Standar AC | 3.5 × 4 M | Rp 1.400.000 | Rp 500.000 | PLN 1423-8911 | **Terisi** | Hendra Wijaya (Freelancer) · Lunas |
| **C-02** | Lantai 3 | Deluxe Corner | 4.5 × 5 M | Rp 1.900.000 | Rp 1.000.000| PLN 1423-8912 | **Kosong** | Unit sudut lantai 3, balkon pribadi, view asri |
| **C-03** | Lantai 3 | Standar | 3 × 4 M | Rp 1.350.000 | Rp 500.000 | PLN 1423-8913 | **Terisi** | Rian Hidayat (Karyawan Swasta) · Lunas |
| **C-04** | Lantai 3 | Standar | 3 × 4 M | Rp 1.350.000 | Rp 500.000 | PLN 1423-8914 | **Terisi** | Mega Lestari (Mahasiswi) · Lunas |
| **C-05** | Lantai 3 | Standar | 3 × 4 M | Rp 1.350.000 | Rp 500.000 | PLN 1423-8915 | **Terisi** | Aditya Pratama (Karyawan) · Lunas |

---

## 4. Daftar Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Inspeksi Kamar & Seleksi Dossier Drawer (Fitts's Law Selection)
* **Tujuan**: Memastikan pengguna dapat memeriksa rincian lengkap unit kamar secara instan tanpa berpindah halaman (*zero context switching*).
* **Kondisi Awal**: Pengguna berada di `WF-03-kamar.html`. Kamar A-01 terpilih secara default pada drawer kanan.
* **Langkah-langkah Pengujian**:
  1. Klik kartu kamar **"Kamar A-03"** (unit berstatus kosong) pada grid Lantai 1.
* **Hasil Diharapkan**:
  - Kartu Kamar A-03 memperoleh styling aktif: border oranye tebal (`#FF7A00`) dan focus ring `box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.18)`.
  - Kartu kamar sebelumnya (A-01) kembali ke styling normal.
  - Side Drawer kanan memuat dossier Kamar A-03 secara reaktif:
    - Foto hero unit berganti sesuai data Kamar A-03.
    - Judul header: *"Kamar A-03"* dengan sub-label *"Tipe Standar · Lantai 1"*.
    - Status badge: *"Kosong · Siap Huni"* (Latar `#DCFCE7`, teks `#16A34A`).
    - Pill fasilitas menampilkan 7 amenitas berukuran 8px dengan ikon monokrom Slate (`#334155`).
    - Dossier beralih ke **Vacant Readiness Pod** berlatar hijau lembut (`#F0FDF4`), menampilkan checklist kebersihan dan token listrik 20 kWh.
    - Tombol aksi utama (CTA Level 1): *"+ Daftarkan Penghuni Baru"* (mengarahkan ke `WF-04-penghuni.html?action=new&room=A-03`).
    - Tombol sekunder (Level 2): *"Iklankan / Siar WA Unit"* (`shareRoomPromo()`).

---

### SKENARIO 02: Penyaringan Kamar Multi-Kriteria & Sinkronisasi Konteks Drawer
* **Tujuan**: Menguji filter instan (pencarian teks, lantai, status) dan mekanisme *Filter Context Sync*.
* **Kondisi Awal**: Kamar A-01 (Lantai 1) sedang aktif di drawer.
* **Langkah-langkah Pengujian**:
  1. Klik dropdown trigger **"Semua Lantai (15)"** di Toolbar Kontrol.
  2. Pilih opsi **"Lantai 2"**.
* **Hasil Diharapkan**:
  - Menu dropdown tertutup otomatis dan trigger menampilkan label *"Lantai 2"*.
  - Seksi Lantai 1 dan Lantai 3 disembunyikan; hanya kluster Lantai 2 (5 unit) yang tampil di layar.
  - **Filter Context Sync Berjalan**: Karena Kamar A-01 berada di Lantai 1 (tersembunyi), drawer kanan secara otomatis mengalihkan seleksi aktif ke kamar pertama yang terlihat di Lantai 2 (**Kamar B-01**).
  3. Ketikkan kata kunci *"deluxe"* pada kotak pencarian (`#kamarSearchInput`).
  - Unit yang tidak bertipe Deluxe disembunyikan secara instan tanpa reload halaman (hanya B-03 yang tampil).
  - Drawer otomatis berpindah memilih unit **Kamar B-03**.
  4. Klik tombol **"Reset Filter"** pada baris kontrol.
  - Seluruh filter dibersihkan, seluruh 15 kamar kembali tampil, dan counter chip kembali normal.

---

### SKENARIO 03: Pendaftaran Unit Kamar Baru & Proteksi Anti-Duplikasi Nomor Kamar
* **Tujuan**: Memverifikasi alur modal tambah kamar, auto-formatting rupiah, dan proteksi nomor duplikat (case-insensitive).
* **Kondisi Awal**: Pengguna berada di halaman utama `WF-03`.
* **Langkah-langkah Pengujian**:
  1. Klik tombol hero **"+ Tambah Unit Kamar"** (`.btn-brand-add`) pada toolbar kanan.
  2. Masukkan nomor kamar yang sudah ada: *"A-01"* (atau huruf kecil *"a-01"*).
  3. Lengkapi tarif sewa: ketik `1600000` (terformat otomatis via `formatRupiahInput` menjadi `1.600.000`).
  4. Klik tombol simpan **"Daftarkan Kamar"** (`.btn-modal-primary`).
* **Hasil Diharapkan**:
  - Sistem menolak pendaftaran dan memunculkan Toast Warning:  
    `Nomor Kamar "A-01" sudah terdaftar! Gunakan nomor kamar unik.`
  5. Ubah nomor kamar menjadi *"A-06"*.
  6. Unggah file foto kamar melalui area dropzone (`#addFotoKamarInput`).
  - Dropzone langsung memperlihatkan thumbnail pratinjau foto secara instan.
  7. Centang fasilitas unit yang tersedia (pilihan fasilitas diambil dari master inventaris Pengaturan Kost): misal *AC 1/2 PK, KM Dalam, Wi-Fi 100 Mbps*.
  8. Klik **"Daftarkan Kamar"**.
  - Modal `#modalTambahKamar` tertutup.
  - Toast Success muncul: *"Kamar A-06 (Lantai 1) berhasil didaftarkan!"*.
  - Kartu Kamar A-06 muncul pada grid Lantai 1 dengan status *"Kosong · Siap Huni"*.
  - Kecepatan Okupansi dan Radial Gauge atas otomatis dikalkulasi ulang (total kamar menjadi 16).
  - Kamar A-06 otomatis terpilih di Side Drawer Dossier.

---

### SKENARIO 04: Penambahan Kluster Lantai Baru Dinamis (On-The-Fly Floor Creation)
* **Tujuan**: Menguji fleksibilitas penambahan kluster lantai properti baru tanpa dialog browser native.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar sedang terbuka.
* **Langkah-langkah Pengujian**:
  1. Klik custom dropdown **"Pilih Lantai Unit"** (`#wrapAddLantai`).
  2. Pada baris bawah menu dropdown, temukan input mini `inputNewFloorAdd` (*"Nama lantai..."*).
  3. Ketikkan *"Lantai 4 — Rooftop Garden"*, lalu tekan `Enter` atau klik tombol centang (`+`).
* **Hasil Diharapkan**:
  - Sistem memvalidasi nama lantai secara unik.
  - Opsi *"Lantai 4 — Rooftop Garden"* langsung ditambahkan ke dalam daftar dropdown dan terpilih otomatis.
  - Tersedia tombol hapus mini (`.btn-del-floor-opt`) di samping opsi baru tersebut jika pengelola ingin membatalkan sebelum kamar didaftarkan.
  - Saat kamar disimpan di lantai baru tersebut, seksi kluster `.floor-box-section` baru untuk Lantai 4 otomatis terbentuk di kanvas utama dengan header seksi dan tombol hapus lantainya.

---

### SKENARIO 05: Proteksi Status Hunian pada Modal Edit Kamar (Domain Boundary)
* **Tujuan**: Memastikan integritas data bahwa kamar berpenghuni aktif tidak dapat diubah statusnya menjadi kosong secara ilegal dari modul kamar.
* **Kondisi Awal**: Kamar A-01 (berpenghuni aktif: Siti Aminah) sedang aktif di drawer.
* **Langkah-langkah Pengujian**:
  1. Klik tombol **"Edit Unit"** (`openEditCurrentRoomModal()`) di Side Drawer.
  2. Perhatikan seksi *"Status Kesiapan Fisik Unit"* pada modal `#modalEditKamar`.
* **Hasil Diharapkan**:
  - Tombol pemilih status fisik (`[ Siap Huni ]` / `[ Perbaikan ]`) disembunyikan.
  - Ditampilkan panel proteksi terkunci berlatar amber halus (`#wrapEditStatusOccupiedLocked`):  
    *"Unit ini sedang dihuni aktif oleh Siti Aminah. Status hunian hanya dapat diubah melalui proses Check-out resmi pada Modul Penghuni."*
  - Dilengkapi badge penghuni dan tautan pintas: `Buka Direktori Penghuni (WF-04) →`.
  - Input tersembunyi `#editStatusKamar` terkunci pada nilai `'terisi'`.
  - Pengelola hanya diizinkan memperbarui data fisik: tipe, dimensi, tarif, nomor meteran PLN, catatan, dan fasilitas.

---

### SKENARIO 06: Relokasi Fisik Unit Kamar Antar-Kluster Lantai (DOM Move)
* **Tujuan**: Menguji kemampuan memindahkan unit kamar antar seksi lantai secara dinamis dan rekalkulasi otomatis counter kluster.
* **Kondisi Awal**: Kamar A-03 (Kosong) berada di Lantai 1.
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-03.
  2. Ubah nomor kamar menjadi *"B-06"*.
  3. Ubah dropdown lantai ke *"Lantai 2 — Blok B"*.
  4. Klik tombol **"Simpan Perubahan"**.
* **Hasil Diharapkan**:
  - Kartu berpindah dari grid Lantai 1 ke grid Lantai 2 di DOM.
  - Metadata counter chip Lantai 1 berkurang 1 unit; counter chip Lantai 2 bertambah 1 unit.
  - Toast Success muncul: *"Perubahan Kamar B-06 (Lantai 2) berhasil disimpan!"*.
  - Drawer kanan memperbarui label lantai menjadi *"Lantai 2"*.

---

### SKENARIO 07: Pemulihan Status Unit Kamar dari Pemeliharaan ke Siap Huni (Mark Maintenance Done)
* **Tujuan**: Menguji alur pemulihan unit dari status perbaikan ke siap huni.
* **Kondisi Awal**: Kamar B-05 (berstatus Perbaikan AC) terpilih di drawer.
* **Langkah-langkah Pengujian**:
  1. Periksa Side Drawer Kamar B-05:
     - Status badge: *"Dalam Perbaikan"* (Latar `#FEF3C7`, teks `#D97706`).
     - Dossier menampilkan **Maintenance Pod** dengan rincian teknisi (Pak Joko), target selesai, dan tiket servis `#T-04`.
  2. Klik tombol di drawer: **"Tandai Selesai & Siap Huni"** (`markMaintenanceDone('B-05')`).
* **Hasil Diharapkan**:
  - Status kamar di `ROOMS_DATA` seketika berubah menjadi `'kosong'`.
  - Status badge kartu Kamar B-05 di grid berganti ke *"Kosong · Siap Huni"* berikon `sparkles` hijau.
  - Side Drawer beralih menampilkan *Vacant Readiness Pod*.
  - Kartu Metrik atas diperbarui: unit siap huni bertambah dari 3 menjadi 4, unit servis berkurang dari 1 menjadi 0.
  - Toast Success tampil: *"Perbaikan Kamar B-05 selesai! Status kamar kini Siap Huni."*.

---

### SKENARIO 08: Generator & Salin Teks Siaran Iklan WhatsApp Kamar Kosong
* **Tujuan**: Memverifikasi fitur otomatisasi penulisan teks penawaran kamar kosong ke calon penyewa melalui WhatsApp manual (`https://wa.me/`).
* **Kondisi Awal**: Kamar A-03 (Kosong) terpilih di drawer.
* **Langkah-langkah Pengujian**:
  1. Klik tombol **"Iklankan / Siar WA Unit"** (`.btn-drawer-secondary`) di drawer.
  2. Modal `#modalIklanKamar` terbuka.
* **Hasil Diharapkan**:
  - Judul modal: *"Siarkan Promo Kamar A-03 via WhatsApp"*.
  - Teks promo terisi otomatis dengan data akurat (tipe Standar, dimensi 3 × 4 M, tarif Rp 1.100.000/bln, deposit Rp 500.000, rincian fasilitas, token mandiri, dan kontak pengelola).
  - Tampil kotak pratinjau pesan WhatsApp bergaya bubble chat realistis.
  3. Klik tombol **"Salin Teks Iklan"** (`copyPromoText()`).
  - Teks tersalin ke clipboard; muncul Toast: *"Draf iklan WhatsApp berhasil disalin ke clipboard!"*.
  4. Klik tombol **"Buka WhatsApp Sekarang"** (`.btn-modal-primary.is-whatsapp`).
  - Tab baru browser terbuka menuju `https://wa.me/?text=...` dengan parameter URL ter-encode rapi tanpa bot otomatisasi.
  - Modal iklan tertutup otomatis.

---

### SKENARIO 09: Proteksi Mutlak Penghapusan Kamar Berpenghuni Aktif
* **Tujuan**: Mencegah kecelakaan operasional penghapusan unit kamar yang sedang ditinggali penyewa aktif.
* **Kondisi Awal**: Kamar A-01 (terisi oleh Siti Aminah) terpilih di drawer.
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-01.
  2. Klik tombol merah **"Hapus Kamar"** (`handleDeleteKamar()`) di sudut kiri bawah footer modal.
* **Hasil Diharapkan**:
  - Sistem menolak eksekusi penghapusan.
  - Dialog konfirmasi hapus **TIDAK DIBUKA**.
  - Muncul Toast Warning:  
    `Kamar A-01 masih berpenghuni aktif (Siti Aminah)! Lakukan check-out terlebih dahulu.`

---

### SKENARIO 10: Penghapusan Kamar Kosong dengan Dialog Konfirmasi Dua Langkah
* **Tujuan**: Memastikan alur penghapusan kamar kosong berjalan aman melalui dialog konfirmasi dua langkah (*two-step confirmation*).
* **Kondisi Awal**: Kamar A-03 (Kosong) terpilih di drawer.
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-03, lalu klik **"Hapus Kamar"**.
  2. Modal konfirmasi `#modalKonfirmasiHapusKamar` terbuka.
  - Label konfirmasi menegaskan: *"Hapus Kamar A-03 permanen dari sistem?"*.
  3. Klik tombol merah **"Ya, Hapus Kamar"** (`executeDeleteKamar()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Elemen `#card-A-03` dihapus dari DOM grid lantai.
  - Data `ROOMS_DATA['A-03']` dihapus dari memori runtime.
  - Radial Speedometer Gauge atas dan hitungan counter chip toolbar otomatis berkurang 1 unit (total kamar menjadi 14).
  - Toast Info muncul: *"Kamar A-03 berhasil dihapus dari daftar."*.
  - Drawer kanan secara mulus beralih memilih unit berikutnya yang tersedia.

---

### SKENARIO 11: Proteksi & Aturan Hapus Seksi Lantai (Floor Deletion Guard)
* **Tujuan**: Menguji aturan keamanan penghapusan kluster lantai properti.
* **Kondisi Awal**: Lantai 1 memiliki 5 unit kamar; Lantai 4 (hasil uji skenario 04) memiliki 0 unit kamar.
* **Uji Kasus A (Lantai Masih Berisi Unit Kamar — Penolakan Tegas)**:
  1. Pada header kluster Lantai 1, klik ikon tempat sampah (`.btn-del-floor-sec`).
  - Sistem menolak tindakan dan memunculkan Toast Warning:  
    `Lantai "Lantai 1" masih memiliki 5 kamar! Lantai harus kosong jika ingin dihapus.`
  - Kluster Lantai 1 tetap aman di layar.
* **Uji Kasus B (Lantai Kosong / 0 Unit — Eksekusi Berhasil)**:
  2. Pada header kluster Lantai 4 (yang kosong), klik ikon tempat sampah.
  - Modal `#modalKonfirmasiHapusLantai` terbuka memaparkan konfirmasi pembongkaran partisi.
  3. Klik tombol **"Ya, Hapus Lantai"** (`executeDeleteFloor()`).
  - Seksi `#floorSection4` dihapus dari DOM.
  - Opsi Lantai 4 dibersihkan dari dropdown `#menuAddLantai`, `#menuEditLantai`, dan `#menuFilterLantai`.
  - Toast Info tampil: *"Lantai \"Lantai 4\" berhasil dihapus."*.

---

### SKENARIO 12: Penanganan Antarmuka Filter Zero State vs Absolute Zero State & Kunci Layout Layar Tunggal (No-Scroll)
* **Tujuan**: Memastikan antarmuka memberikan umpan balik visual yang ramah dan kontekstual saat katalog tidak memiliki data, dengan layout grid dan side drawer yang presisi, harmonis, serta terkunci rapi pada satu layar (single-screen dashboard view) tanpa scrollbar vertikal.
* **Uji Kasus A: Filter Zero State (Pencarian / Filter Nihil)**:
  1. Ketikkan kata kunci acak pada kotak pencarian: *"Kamar XYZ 999"*.
  - Seluruh kartu kamar tersembunyi.
  - Ditampilkan kartu `#kamarEmptyState` dengan ikon `search-x`:  
    *"Tidak ada kamar yang cocok dengan filter atau kata kunci pencarian Anda."*
  - Tampil tombol Level 2: `"Reset Filter"`.
  - Halaman otomatis di-scroll ke top 0 dan scroll vertikal body dinonaktifkan (`overflowY = 'hidden'`) sehingga tampilan pas 1 layar penuh tanpa scrollbar atau pergeseran layout.
  - Sidebar kanan tetap berada di posisi aslinya (`top: 110px`, tinggi `calc(100vh - 130px)` / 565.2px, tepat di sebelah kanan card Potensi Sewa) dan beralih ke state kosong (`setDrawerEmptyState()`), menampilkan ikon `layout-grid`, judul *"Belum Ada Kamar Dipilih"*, subteks *"Pilih salah satu kamar di daftar sebelah kiri untuk melihat rincian spesifikasi, penghuni, atau status unit."*, serta border dashed subtle.
  - Kotak `#kamarEmptyState` di sebelah kiri menyesuaikan ketinggiannya secara adaptif (`alignLeftEmptyStateBottom()`) sehingga **batas bawah kotak kiri sejajar rata dengan batas bawah sidebar kanan**, tanpa memicu scrolling vertikal.
  2. Klik tombol `"Reset Filter"` atau hapus teks pencarian:
  - Scroll vertikal diaktifkan kembali (`document.body.style.overflowY = ''`).
  - Seluruh kamar dan kluster lantai tampil kembali secara utuh dan dapat di-scroll normal.
* **Uji Kasus B: Absolute Zero State (Katalog Bersih 0 Unit di Sistem)**:
  3. Jika seluruh data kamar dihapus dari properti (`ROOMS_DATA = {}`):
  - Ditampilkan pesan sambutan kosong berikon `door-open`:  
    *"Belum ada unit kamar di kost Anda. Mulai kelola hunian dengan mendaftarkan kamar pertama."*
  - Tampil tombol Level 1 hero: `"+ Daftarkan Kamar Pertama"`.
  - Sidebar kanan menampilkan pesan *"Belum Ada Kamar Terdaftar"* dengan tombol pendaftaran unit pertama.
  - Batas bawah kotak kiri tetap sejajar rata dengan batas bawah sidebar kanan tanpa scroll.

---

### SKENARIO 13: Aksesibilitas Tombol Escape Global (Global ESC Key Dismissal)
* **Tujuan**: Memenuhi kriteria aksesibilitas WCAG 2.1 untuk penutupan layer interaktif dengan keyboard.
* **Kondisi Awal**: Buka modal dialog, popover filter toolbar, atau drawer mobile.
* **Langkah-langkah Pengujian**:
  1. Tekan tombol keyboard **`Escape` (ESC)**.
* **Hasil Diharapkan**:
  - Seluruh modal overlay yang terbuka (`.modal-backdrop.open`) tertutup seketika.
  - Seluruh menu popover (`.popover-dropdown-menu.active`) dan menu form (`.form-select-menu.is-open`) tertutup.
  - Panel drawer mobile (jika pada viewport ponsel) menutup ke kanan.
  - Fokus keyboard kembali ke elemen pemicu tanpa kehilangan state data.

---

### SKENARIO 14: Auto-Sinkronisasi Dimensi Kamar Berdasarkan Pilihan Tipe Kamar (2-Column Dimension Inputs)
* **Tujuan**: Mempercepat proses pendaftaran unit kamar dengan membagi input dimensi menjadi 2 kolom angka mandiri (Panjang × Lebar dalam meter) yang terisi otomatis berdasarkan tipe kamar.
* **Kondisi Awal**: Modal Tambah Kamar (`#modalTambahKamar`) atau Edit Kamar (`#modalEditKamar`) sedang terbuka.
* **Langkah-langkah Pengujian**:
  1. Klik custom dropdown **"Tipe Unit Kamar"** (`#wrapAddTipe`).
  2. Pilih opsi **"Standar AC"**.
* **Hasil Diharapkan**:
  - Kolom input Panjang (`#addDimensiPanjang`) terisi `3.5`, kolom Lebar (`#addDimensiLebar`) terisi `4`, dan hidden input `#addUkuranKamar` tersinkronisasi menjadi `"3.5 × 4 Meter"`.
  3. Ubah pilihan tipe kamar menjadi **"Deluxe"**.
  - Kolom Panjang otomatis terisi `4` dan Lebar terisi `5` (`"4 × 5 Meter"`).
  4. Ubah ke **"Deluxe Corner View"**.
  - Kolom Panjang otomatis terisi `4.5` dan Lebar terisi `5` (`"4.5 × 5 Meter"`).
  5. Pengguna dapat mengubah angka panjang atau lebar secara langsung (misal: isi `3` dan `4`), sistem merangkai dimensi secara otomatis tanpa perlu mengetik manual simbol perkalian atau satuan.

---

### SKENARIO 15: Penggantian Foto Unit pada Modal Edit & Refleksi Instan ke Kartu Grid dan Hero Drawer
* **Tujuan**: Memastikan pengelola dapat memperbarui foto dokumentasi unit kamar dengan pratinjau live yang langsung terfleksikan ke thumbnail kartu dan Drawer Dossier saat disimpan.
* **Kondisi Awal**: Kamar A-01 terpilih di drawer. Modal Edit Kamar terbuka.
* **Langkah-langkah Pengujian**:
  1. Klik area dropzone unggah foto kamar (`#editFotoKamarInput`).
  2. Pilih file gambar baru dari komputer lokal (misal: `kamar-a01-renovasi.jpg`).
* **Hasil Diharapkan**:
  - Label upload berganti menampilkan nama file: `kamar-a01-renovasi.jpg (Siap disimpan)`.
  - Kotak ikon dropzone menampilkan pratinjau instan gambar baru (`URL.createObjectURL`).
  - Muncul Toast: *"Foto unit berhasil dipilih: kamar-a01-renovasi.jpg"*.
  3. Klik tombol **"Simpan Perubahan"** (`.btn-modal-primary`).
  - Modal tertutup.
  - Gambar thumbnail pada kartu `#card-A-01` di grid lantai langsung berganti ke foto baru.
  - Gambar hero header pada Drawer Dossier `#drawerPhoto` seketika berganti ke foto baru secara sinkron tanpa reload halaman.

---

### SKENARIO 16: Interaksi Cepat Chat WhatsApp Penyewa Aktif di Side Drawer
* **Tujuan**: Memberikan jalan pintas komunikasi langsung kepada pengelola kost untuk menghubungi penyewa aktif tanpa harus berpindah ke modul penghuni.
* **Kondisi Awal**: Kamar terisi aktif (misal: Kamar A-01, Siti Aminah) terpilih di Side Drawer kanan.
* **Langkah-langkah Pengujian**:
  1. Periksa bagian footer tombol aksi pada Side Drawer.
  2. Temukan tombol hijau sekunder: **"Chat WA Penyewa"** (`#linkDirectWa` / `.btn-drawer-wa`).
  3. Arahkan kursor atau klik tombol tersebut.
* **Hasil Diharapkan**:
  - Tombol memformat nomor WhatsApp penyewa ke standar internasional Indonesia (mengubah prefix `08...` menjadi `https://wa.me/628...`).
  - Mengklik tombol membuka tab baru WhatsApp Web / WhatsApp App secara langsung menuju nomor kontak penyewa aktif.
  - Tombol ini otomatis **disembunyikan** jika kamar berstatus Kosong atau Dalam Perbaikan.

---

### SKENARIO 17: Pembatalan & Pembersihan Opsi Lantai Draft/Typo di Menu Dropdown Formulir
* **Tujuan**: Memberikan fleksibilitas bagi pengelola untuk menghapus opsi lantai yang salah ketik (typo) atau tidak jadi digunakan langsung dari dalam menu dropdown.
* **Kondisi Awal**: Pengelola baru saja mengetik nama lantai baru di input mini dropdown (`submitInlineNewFloor`), namun belum menyimpan unit kamar pada lantai tersebut.
* **Langkah-langkah Pengujian**:
  1. Buka kembali custom dropdown lantai (`#wrapAddLantai`).
  2. Arahkan kursor (hover) pada opsi lantai draft yang baru saja dibuat.
  3. Klik tombol silang merah mini (`.btn-del-floor-opt`) di sisi kanan opsi tersebut.
* **Hasil Diharapkan**:
  - Opsi lantai draft tersebut langsung dibersihkan dan dihapus dari daftar menu dropdown (`removeDraftFloorOption()`).
  - Nilai dropdown terpilih dialihkan kembali ke opsi default (Lantai 1).
  - Tidak ada seksi kluster kosong yang tertinggal di kanvas utama.

---

### SKENARIO 18: Tampilan Responsif & Transisi Mobile Sheet Drawer dengan Backdrop Overlay
* **Tujuan**: Memastikan antarmuka manajemen kamar dapat dioperasikan secara ergonomis pada perangkat tablet dan layar ponsel cerdas ($\le 1200\text{px}$ dan $\le 768\text{px}$).
* **Kondisi Awal**: Browser dibuka pada resolusi ponsel/tablet ($\le 768\text{px}$).
* **Langkah-langkah Pengujian**:
  1. Side Drawer kanan secara default bergeser ke luar layar (*off-canvas*).
  2. Klik salah satu kartu kamar di grid (misal: Kamar A-02).
* **Hasil Diharapkan**:
  - Backdrop gelap semi-transparan (`#drawerMobileBackdrop`) muncul menutupi kanvas utama.
  - Side Drawer meluncur halus (*slide-in*) dari sisi kanan sebagai modal sheet mobile.
  - Header drawer menampilkan tombol silang tutup bulat (`.drawer-close-btn`).
  3. Klik tombol silang atau klik area backdrop luar, atau tekan tombol `Escape`.
  - Drawer mobile meluncur kembali ke luar layar (*slide-out*) dan backdrop menghilang secara mulus.

---

### SKENARIO 19: Penanganan Deep Linking URL Masuk (?room=... & ?status=...)
* **Tujuan**: Memastikan antarmuka dapat merespons parameter query URL saat dibuka dari layar lain (misal dari daftar unit kosong di Dasbor `WF-02`, tautan kamar di Tiket Perbaikan `WF-08`, atau riwayat sewa di `WF-04`).
* **Kondisi Awal**: Pengguna mengklik tautan inspeksi kamar dari luar modul WF-03.
* **Uji Kasus A: Deep Link Kamar Spesifik (`?room=B-03` atau `?kamar=B-03`)**:
  1. Akses halaman dengan URL: `WF-03-kamar.html?room=B-03`.
  - Sistem menginisialisasi parameter URL.
  - Kamar B-03 (Lantai 2) seketika terpilih di kartu grid dan Side Drawer memuat dossier Kamar B-03 (bukan fallback ke A-01).
  - Halaman otomatis melakukan *smooth scrolling* ke kluster seksi Lantai 2.
* **Uji Kasus B: Deep Link Filter Status (`?status=perbaikan`)**:
  2. Akses halaman dengan URL: `WF-03-kamar.html?status=perbaikan`.
  - Dropdown filter status otomatis terpilih ke *"Dalam Perbaikan"*.
  - Grid hanya menampilkan kamar dalam perbaikan (Kamar B-05), dan drawer langsung menginspeksi kamar tersebut.

---

### SKENARIO 20: Isolasi Hak Akses RBAC & Proteksi Wewenang (Role-Adaptive Guardrails)
* **Tujuan**: Menegakkan pemisahan wewenang peran sesuai `SCOPE_STATEMENT.md` (F-01) antara Pemilik, Staf, dan Penghuni.
* **Kondisi Awal**: Akun pengguna login dengan role berbeda.
* **Uji Kasus A: Penghuni Kost Membuka Halaman Katalog (`?role=penghuni`)**:
  1. Akses halaman dengan URL: `WF-03-kamar.html?role=penghuni`.
  - Script pengaman RBAC mendeteksi peran Penghuni.
  - Sistem seketika memblokir rendering halaman kamar dan me-*redirect* browser ke Portal Penghuni: `WF-10-portal-penghuni.html`.
  - Muncul notifikasi toast: *"Akses Ditolak: Halaman katalog master kamar hanya untuk pengelola properti."*
* **Uji Kasus B: Staf Operasional Membuka Halaman Katalog (`?role=staf`)**:
  2. Akses halaman dengan URL: `WF-03-kamar.html?role=staf`.
  - Topbar menampilkan badge *"Staf Operasional"* dan 5 pill navigasi kerja operasional (tanpa menu Laporan dan Pengaturan).
  - Tombol Tambah Kamar Baru (`.btn-brand-add` di toolbar & drawer) disembunyikan untuk staf sesuai matriks otorisasi `SCOPE_STATEMENT.md` (Owner-Only).
  - Tombol hapus kamar permanen (`.btn-modal-danger`) di modal edit dan tombol hapus lantai (`.btn-del-floor-sec`, `.btn-del-floor-opt`) disembunyikan.
  - Pada Modal Edit Kamar, seluruh spesifikasi master kamar (Nomor Kamar, Lokasi Lantai, Tipe, Dimensi, Tarif Sewa, Deposit, Kapasitas, Aturan Gender) dikunci menjadi read-only dengan banner informasi *"Wewenang Terbatas Staf"*.
  - Staf tetap dapat menginspeksi kamar, memperbarui status kesiapan fisik unit (`[ Siap Huni ]` $\leftrightarrow$ `[ Perbaikan ]`), memperbarui catatan pemeliharaan, serta memicu aksi operasional WhatsApp dan tiket perbaikan.
* **Uji Kasus C: Jejak Audit Akuntabilitas Pembaruan Kamar (Data & Backend Audit Trail)**:
  3. Lakukan pembaruan status fisik kamar sebagai Staf Operasional (`?role=staf`).
  - Sistem merekam metadata audit lengkap di level model data (`lastModified`):
    `by: 'Staf Operasional', operatorEmail: 'staf.operasional@kostmakmur.com', role: 'staff', at: '[Timestamp] WIB', action: 'Status fisik unit diubah / Catatan pemeliharaan diperbarui'`.
  - Jika kamar diperbarui oleh Pemilik (`role=owner`), metadata tercatat: `by: 'Budi Santoso (Owner)'`.
  - Drawer inspeksi tetap ramping dan bersih (*minimalist zero visual clutter*), menjaga fokus kerja operasional harian tanpa membebani layar dengan pod riwayat yang tidak esensial.

---

### SKENARIO 21: Validasi Sanitasi Input Form & Batas Media Foto (Media Upload Guard)
* **Tujuan**: Menjaga higienitas data master kamar dan mematuhi batas ukuran media (maks 4 MB) sesuai `SCOPE_STATEMENT.md`.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar sedang terbuka.
* **Uji Kasus A: Sanitasi Spasi & Format Nomor Kamar**:
  1. Masukkan nomor kamar dengan spasi berlebih: `"  b-07  "`.
  2. Simpan formulir.
  - Sistem melakukan pembersihan otomatis (`trim()` & `toUpperCase()`), menghasilkan kode entitas bersih `"B-07"` tanpa spasi liar.
* **Uji Kasus B: Proteksi Ukuran & Tipe Berkas Foto**:
  3. Unggah file dokumen ilegal (misal `brosur.pdf` atau file foto berukuran $> 4\text{ MB}$).
  - Sistem menolak berkas dengan Toast Warning:  
    `Format file harus berupa gambar (JPG/PNG/WEBP) dengan ukuran maksimal 4 MB.`
  - Dropzone mempertahankan status foto sebelumnya tanpa merusak tata letak form.
* **Uji Kasus C: Validasi Nilai Negatif / Nol pada Tarif Sewa**:
  4. Ketikkan nilai tarif sewa `0` atau angka negatif.
  - Sistem memvalidasi bahwa tarif sewa bulanan wajib berupa nominal positif $> 0$.

---

### SKENARIO 22: Sinergi Filter Bersarang Simultan 3 Kriteria (Multi-Filter Synergy)
* **Tujuan**: Memastikan antarmuka mendukung penyaringan bersarang multi-kriteria secara simultan tanpa konflik status antar komponen.
* **Kondisi Awal**: Semua 15 kamar aktif tampil di grid.
* **Langkah-langkah Pengujian**:
  1. Atur Filter Lantai = *"Lantai 3"*. (Hanya 5 unit Lantai 3 tampil).
  2. Atur Filter Status = *"Hanya Kosong"*. (Hanya unit kosong di Lantai 3 yang tampil: C-02).
  3. Ketikkan kata kunci pencarian pada kotak pencarian: *"Corner"*.
* **Hasil Diharapkan**:
  - Filter bekerja secara sinergis (`AND` logic).
  - Tepat 1 unit tertampil di kanvas: **Kamar C-02** (Lantai 3 · Deluxe Corner View · Kosong).
  - Counter chip lantai memperbarui info visual sesuai kamar yang lolos filter.
  - Drawer kanan mengunci seleksi pada Kamar C-02.
  4. Hapus teks pencarian dan kembalikan filter status ke *"Semua Status"*.
  - Seksi Lantai 3 kembali menampilkan 5 unit kamar secara proporsional tanpa perlu me-reload halaman.

---

### SKENARIO 23: Pembaruan Konfigurasi Kapasitas & Aturan Gender Kamar (Single vs Double Occupancy)
* **Tujuan**: Memverifikasi pembaruan kapasitas penghuni dan preferensi gender unit kost pada kartu grid dan Side Drawer Dossier.
* **Kondisi Awal**: Kamar A-03 (Standar, kapasitas default 1 Orang, Campur) terbuka di modal Edit Kamar.
* **Langkah-langkah Pengujian**:
  1. Pada modal Edit Kamar, klik pill kapasitas: pilih **"2 Orang"**.
  2. Pada pill gender aturan kamar, pilih **"Khusus Wanita"**.
  3. Klik **"Simpan Perubahan"**.
* **Hasil Diharapkan**:
  - Modal tertutup dan Toast Success muncul.
  - Grid kartu kamar dan Side Drawer Dossier memperbarui spesifikasi kapasitas:  
    `drawerKapasitas` menampilkan *"2 Orang · Khusus Wanita"*.
  - Catatan spesifikasi kamar tersimpan rapi untuk mempermudah pencocokan calon penyewa baru.

---

### SKENARIO 24: Transisi Kamar Kosong ke Dalam Perbaikan & Integrasi Tiket Servis (WF-08)
* **Tujuan**: Memverifikasi alur ketika kamar kosong mengalami kerusakan inventaris fisik dan harus dialihkan ke status perbaikan dengan rujukan tiket servis.
* **Kondisi Awal**: Kamar A-03 (Kosong · Siap Huni) terpilih di drawer.
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-03.
  2. Pada pilihan status kesiapan fisik unit, klik opsi **"Perbaikan"** (`status = 'perbaikan'`).
  3. Masukkan catatan kendala: *"Instalasi pipa water heater bocor, butuh teknisi plumbing"*.
  4. Klik **"Simpan Perubahan"**.
* **Hasil Diharapkan**:
  - Kartu Kamar A-03 di grid berubah menjadi kartu servis (`.status-repair-card`) dengan badge kuning *"Dalam Perbaikan"* dan ikon `wrench`.
  - Drawer Dossier seketika beralih memuat **Maintenance Pod** dan tombol aksi utama berubah menjadi:  
    `"Buka Tiket Perbaikan #T-05"` (mengarahkan ke modul `WF-08-tiket.html?kamar=A-03`).
  - Metrik global atas memperbarui jumlah kamar siap huni berkurang 1 unit dan unit perbaikan bertambah 1 unit.

---

### SKENARIO 25: Integrasi Sub-metering Token PLN / Nomor ID Pelanggan Listrik Kamar
* **Tujuan**: Memastikan pencatatan identitas meteran listrik per kamar tersimpan akurat untuk kebutuhan survei unit dan pengisian token awal.
* **Kondisi Awal**: Pengelola mendaftarkan atau mengedit unit kamar.
* **Langkah-langkah Pengujian**:
  1. Pada modal Edit Kamar B-03, periksa field *"Nomor Meteran Listrik / ID Pelanggan PLN"*.
  2. Ubah nomor meteran menjadi *"PLN 5411-9988-2200"*.
  3. Simpan perubahan.
* **Hasil Diharapkan**:
  - Data tersimpan di entitas `ROOMS_DATA['B-03'].pln`.
  - Side Drawer Dossier pada kartu grid spesifikasi menampilkan nomor meteran baru:  
    `drawerMeteran` = `"PLN 5411-9988-2200"`.
  - Saat modal Iklan WhatsApp dibuka, informasi nomor meteran token mandiri terintegrasi ke dalam pesan draf penawaran.

---

### SKENARIO 26: Adaptasi Visual Kartu Kamar Berpenghuni Sesuai Status Kolektibilitas Tagihan & Smart Note Bubble
* **Tujuan**: Memastikan antarmuka menyajikan diferensiasi visual yang tegas antara penyewa tertib (Lunas), masa jatuh tempo mendekat (H-3), dan penunggak sewa (Telat Bayar) pada kartu grid serta Drawer Dossier.
* **Kondisi Awal**: Pengguna berada di halaman katalog kamar `WF-03`.
* **Uji Kasus A: Status Lunas (Kamar A-01 / Siti Aminah)**:
  1. Klik kartu Kamar A-01.
  - Badge status tagihan di kartu dan drawer: *"Terisi · Lunas"* berlatar abu-abu gelap (`.badge-dark`).
  - Drawer Tenant Note Bubble menampilkan latar hijau lembut (`#F0FDF4`), border hijau (`#BBF7D0`), dan teks hijau tua (`#166534`):  
    *"Kontrak sewa aktif, pembayaran tagihan tepat waktu via transfer bank."*
* **Uji Kasus B: Status Jatuh Tempo H-3 (Kamar A-02 / Dimas Prasetyo)**:
  2. Klik kartu Kamar A-02.
  - Badge status tagihan di kartu dan drawer: *"Terisi · Tempo H-3"* berlatar amber (`.badge-warning`).
  - Drawer Tenant Note Bubble menampilkan latar kuning hangat (`#FFFBEB`), border kuning (`#FDE68A`), dan teks cokelat tua (`#92400E`):  
    *"Masa sewa bulan ini jatuh tempo 3 hari lagi. Invoice telah diterbitkan."*
* **Uji Kasus C: Status Menunggak / Telat (Kamar B-01 / Dodi Firmansyah)**:
  3. Klik kartu Kamar B-01.
  - Badge status tagihan di kartu dan drawer: *"Terisi · Menunggak"* berlatar merah (`.badge-danger`).
  - Teks status tagihan berwarna merah cerah (`#EF4444`).
  - Drawer Tenant Note Bubble menampilkan latar merah lembut (`#FEF2F2`), border merah (`#FECACA`), dan teks merah tua (`#B91C1C`):  
    *"Tagihan sewa melewati jatuh tempo 3 hari. Pengingat telah dikirim via WA."*

---

### SKENARIO 27: Rekalkulasi Matematis Radial Speedometer Gauge & Nilai Realisasi Finansial
* **Tujuan**: Memverifikasi ketelitian formula matematis kalkulasi pendapatan potensial, pendapatan terkumpul, tingkat okupansi, dan animasi `stroke-dashoffset` SVG radial gauge saat tarif unit kamar diperbarui.
* **Kondisi Awal**: Total 15 kamar terdaftar. Tarif awal Kamar A-03 adalah Rp 1.100.000.
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-03.
  2. Ubah tarif sewa bulanan dari `1.100.000` menjadi `2.100.000` (kenaikan Rp 1.000.000).
  3. Klik **"Simpan Perubahan"**.
* **Hasil Diharapkan**:
  - Fungsi `refreshGlobalMetrics()` seketika menghitung ulang total potensi pendapatan kost:  
    Total potensi meningkat Rp 1.000.000 (dari Rp 20,5 Jt menjadi Rp 21,5 Jt).
  - Teks kartu metrik ke-3 (`#metricIncomeVal`) memperbarui display menjadi `"Rp 21,5 Jt"`.
  - Persentase realisasi sewa (`#metricIncomePct`) dan nilai `stroke-dashoffset` pada SVG `#metricIncomeGauge` dikalkulasi ulang secara instan berdasarkan keliling busur `106.8 * (1 - (realisasi / 100))`.
  - Nilai tarif baru terformat rapi pada thumbnail kartu grid dan Drawer Dossier.

---

### SKENARIO 28: Proteksi Anti-Duplikasi Nama Lantai Baru pada Dropdown Input Mini
* **Tujuan**: Mencegah terciptanya duplikasi seksi kluster lantai akibat ketidaksengajaan pengguna memasukkan nama lantai yang sudah ada di sistem.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar terbuka. Lantai 1, Lantai 2, dan Lantai 3 sudah terdaftar.
* **Langkah-langkah Pengujian**:
  1. Buka custom dropdown lantai (`#wrapAddLantai`).
  2. Pada input mini `inputNewFloorAdd`, ketikkan nama lantai yang sudah ada: *"Lantai 2"* (atau variasi huruf kecil *"lantai 2 "*).
  3. Tekan `Enter` atau klik tombol centang (`+`).
* **Hasil Diharapkan**:
  - Logika verifikasi duplikasi (`submitInlineNewFloor`) mendeteksi keberadaan entitas lantai yang sama.
  - Sistem **menolak penambahan item baru** dan tidak membuat kluster ganda di DOM.
  - Dropdown secara cerdas langsung mengarahkan seleksi aktif ke opsi *"Lantai 2"* yang sudah ada sebelumnya.
  - Muncul Toast Info: *"Lantai \"Lantai 2\" sudah terdaftar dalam pilihan!"*.
  - Kolom input mini dibersihkan secara otomatis.

---

### SKENARIO 29: Penanganan Fallback Gambar Rusak (Broken Image Fallback)
* **Tujuan**: Memastikan antarmuka memiliki ketahanan (*fault-tolerance*) visual jika URL foto kamar eksternal/lokal mengalami kegagalan muat (galat 404 atau offline).
* **Kondisi Awal**: Sebuah kamar memiliki URL foto yang rusak atau tidak dapat diakses jaringan (`404 Not Found`).
* **Langkah-langkah Pengujian**:
  1. Klik kartu kamar yang memiliki URL foto rusak tersebut.
  2. Perhatikan area hero image di Drawer Dossier kanan (`#drawerPhoto`).
* **Hasil Diharapkan**:
  - Event handler `dPhoto.onerror` menangkap galat pemuatan berkas gambar secara senyap.
  - Listener mencegah pemanggilan berulang (`this.onerror = null`).
  - Gambar seketika digantikan oleh aset fallback lokal sistem: `assets/img/login-showcase.png`.
  - Tata letak drawer tetap proporsional tanpa menampilkan ikon gambar pecah (*broken image icon*) bawaan browser.

---

### SKENARIO 30: Normalisasi Format Kontak Telepon Penyewa Internasional pada Tautan WA Direct
* **Tujuan**: Memastikan nomor telepon lokal Indonesia penyewa (`08...`, format spasi, atau tanda strip) dinormalisasi secara otomatis menjadi standar internasional ITU-T E.164 (`628...`) pada parameter URL WhatsApp.
* **Kondisi Awal**: Kamar terisi aktif terpilih di drawer dengan nomor telepon format lokal: `"0812-3456-7890"`.
* **Langkah-langkah Pengujian**:
  1. Arahkan kursor atau periksa atribut `href` pada tombol hijau **"Chat WA Penyewa"** (`#linkDirectWa`).
* **Hasil Diharapkan**:
  - Script pembersih regex `.replace(/[^0-9]/g, '')` membuang seluruh karakter non-numerik (strip, spasi, tanda kurung).
  - Prefix `0` di awal nomor digantikan secara presisi dengan kode negara Indonesia `62`.
  - Tautan tombol mengarah ke: `https://wa.me/6281234567890`.
  - Saat diklik, WhatsApp Web atau WhatsApp Mobile langsung mengenali nomor kontak tujuan tanpa galat *"Nomor telepon tidak valid"*.

---

### SKENARIO 31: Deteksi Kondisi Kluster Lantai Penuh (100% Occupancy Badge State)
* **Tujuan**: Memberikan indikasi visual cepat kepada pengelola ketika seluruh unit kamar pada satu lantai tertentu telah terisi penuh oleh penyewa.
* **Kondisi Awal**: Lantai 1 memiliki 5 unit kamar (A-01, A-02, A-04, A-05 terisi; A-03 kosong).
* **Langkah-langkah Pengujian**:
  1. Buka modal Edit Kamar pada Kamar A-03.
  2. Pindahkan Kamar A-03 ke Lantai 2 (atau ubah statusnya menjadi terisi melalui kontrak di WF-04).
  3. Periksa header kluster Lantai 1 (`#floorSection1 .floor-meta-chip`).
* **Hasil Diharapkan**:
  - Fungsi `refreshFloorStats()` mendeteksi kondisi `terisi === total` pada kluster Lantai 1 (4 unit terisi dari 4 unit yang tersisa).
  - Teks metadata chip pada header lantai berubah dari format rincian biasa menjadi penanda tegas:  
    `"4 Unit · Penuh (100%)"`.
  - Memberikan visual feedback instan kepada staf bahwa tidak ada lagi inventaris kamar kosong di kluster lantai tersebut.

---

### SKENARIO 32: Verifikasi Parameter URL Navigasi Kontekstual ke Modul Penghuni (WF-04)
* **Tujuan**: Memastikan tombol aksi utama pada Drawer Dossier mengalirkan parameter URL yang tepat ke modul Penghuni (`WF-04`) sesuai status kamar (kamar terisi vs kamar kosong).
* **Kondisi Awal**: Pengguna menginspeksi kamar di Drawer Dossier.
* **Uji Kasus A: Kamar Kosong (Registrasi Kontrak Sewa Baru)**:
  1. Pilih unit kosong: **Kamar A-03**.
  2. Periksa target tautan tombol utama: `"+ Daftarkan Penghuni Baru"` (`#btnPrimaryAction`).
  - Target URL berparameter: `WF-04-penghuni.html?action=new&room=A-03`.
  - Saat diklik, modul `WF-04` langsung membuka formulir pendaftaran penghuni dengan kamar A-03 sudah terpilih secara otomatis.
* **Uji Kasus B: Kamar Terisi (Inspeksi Profil Penyewa Aktif)**:
  3. Pilih unit terisi: **Kamar A-01**.
  2. Periksa target tautan tombol utama: `"Lihat Profil Penghuni"` (`#btnPrimaryAction`).
  - Target URL berparameter: `WF-04-penghuni.html?id=A-01`.
  - Saat diklik, modul `WF-04` langsung membuka tab dossier profil Siti Aminah.

---

### SKENARIO 33: Penutupan Interaktif Elemen Dropdown & Popover Melalui Klik Area Luar (Click-Outside Dismissal)
* **Tujuan**: Memastikan seluruh menu popover filter toolbar dan custom dropdown formulir menutup secara otomatis saat pengguna mengklik area luar kanvas (*click-outside dismiss pattern*).
* **Kondisi Awal**: Pengguna membuka salah satu menu dropdown (misal: Popover Filter Lantai di toolbar atau Dropdown Tipe Kamar di dalam modal).
* **Langkah-langkah Pengujian**:
  1. Klik trigger `#wrapFilterLantai` $\rightarrow$ Menu popover `.popover-dropdown-menu` terbuka dengan class `.active`.
  2. Klik pada area kosong di kanvas utama (luar elemen dropdown).
* **Hasil Diharapkan**:
  - Global click listener (`document.addEventListener('click')`) menangkap interaksi klik di luar elemen.
  - Class `.active` pada menu popover dan class `.is-open` pada tombol pemicu dicabut seketika.
  - Menu menutup dengan rapi tanpa mengubah nilai filter yang sedang aktif.

---

### SKENARIO 34: Pemetaan Dinamis Ikon Fasilitas (Amenities Dynamic Icon Mapping Engine)
* **Tujuan**: Memverifikasi kecerdasan *icon mapping engine* dalam menerjemahkan teks nama amenitas/fasilitas kamar menjadi ikon visual Lucide yang relevan di Drawer Dossier.
* **Kondisi Awal**: Buka modal Edit Kamar pada salah satu unit.
* **Langkah-langkah Pengujian**:
  1. Periksa daftar fasilitas kamar yang memiliki variasi amenitas:
     - Mengandung kata `"AC"` $\rightarrow$ Diterjemahkan ke ikon `wind`.
     - Mengandung kata `"KM Dalam"` atau `"mandi"` $\rightarrow$ Diterjemahkan ke ikon `bath`.
     - Mengandung kata `"Water Heater"` $\rightarrow$ Diterjemahkan ke ikon `flame`.
     - Mengandung kata `"Springbed"` atau `"kasur"` $\rightarrow$ Diterjemahkan ke ikon `bed`.
     - Mengandung kata `"Lemari"` $\rightarrow$ Diterjemahkan ke ikon `box`.
     - Mengandung kata `"Meja & Kursi"` atau `"kerja"` $\rightarrow$ Diterjemahkan ke ikon `laptop`.
     - Mengandung kata `"Wi-Fi"` $\rightarrow$ Diterjemahkan ke ikon `wifi`.
     - Mengandung kata `"Listrik"` atau `"Token PLN"` $\rightarrow$ Diterjemahkan ke ikon `zap`.
     - Mengandung kata fasilitas kustom baru (misal: *"Dispenser Air"*) $\rightarrow$ Diterjemahkan ke ikon fallback `check`.
* **Hasil Diharapkan**:
  - Seluruh chip fasilitas di Drawer Dossier (`#drawerAmenityGrid`) ter-render dengan ikon Lucide yang serasi dan proporsional (ukuran 8px) tanpa galat rendering SVG.

---

### SKENARIO 35: Proteksi Rekalkulasi Metrik saat Katalog Kosong Total (Zero State Metric Reset)
* **Tujuan**: Memastikan radial gauge, persentase okupansi, dan counter pendapatan ter-reset sempurna ke angka 0 (tanpa mempertahankan nilai usang / *frozen stale values*) ketika seluruh unit kamar terhapus dari sistem.
* **Kondisi Awal**: Seluruh kamar di katalog dihapus bertahap hingga menyisakan 0 unit.
* **Langkah-langkah Pengujian**:
  1. Hapus kamar terakhir di sistem melalui aksi modal konfirmasi hapus.
  2. Amati 3 kartu metrik ringkasan di area header dasbor.
* **Hasil Diharapkan**:
  - `refreshGlobalMetrics()` mendeteksi kondisi `totalUnits === 0`.
  - Kartu Unit Kosong: menampilkan `0 Siap Huni`, `0 / 0 Unit`, gauge terisi 0% (`stroke-dashoffset: 106.8`).
  - Kartu Okupansi: menampilkan `0% Okupansi`, `0 Penyewa aktif · 0 Servis`, gauge terisi 0%.
  - Kartu Potensi Pendapatan: menampilkan `Realisasi 0%`, `Rp 0 Jt`, gauge terisi 0%.
  - Filter toolbar dropdown ter-update: *"Semua Lantai (0)"*, *"Semua Status (0)"*, dsb.

---

### SKENARIO 36: Sanitasi Injeksi HTML / XSS pada Nomor Kamar & Spesifikasi (Stored XSS Guard)
* **Tujuan**: Mencegah serangan Cross-Site Scripting (XSS) melalui injeksi script berbahaya (seperti `<script>alert(1)</script>` atau `<img src=x onerror=...>`) ke dalam atribut nomor kamar, tipe, ukuran, atau catatan fasilitas.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar terbuka.
* **Langkah-langkah Pengujian**:
  1. Pada formulir Tambah Kamar, masukkan nomor kamar atau deskripsi yang disisipi karakter HTML: `<script>alert(1)</script>`.
  2. Sistem memvalidasi regex nomor kamar (`/^[A-Z0-9\-\. ]+$/`) yang secara otomatis menolak karakter kurung siku sudut (`<`, `>`).
  3. Pada rendering template string dinamis kartu grid dan dossier, seluruh variabel diproses melalui fungsi `escapeHTML()`.
* **Hasil Diharapkan**:
  - Input berbahaya dinetralkan menjadi entitas HTML aman (`&lt;script&gt;alert(1)&lt;/script&gt;`).
  - Tidak ada script asing yang dapat dieksekusi di konteks DOM pengguna.
  - Keamanan integritas data runtime tetap terlindungi 100%.

---

### SKENARIO 37: Proteksi Double-Submit & Rapid-Click pada Formulir Mutasi Kamar (Double-Click Shield)
* **Tujuan**: Mencegah duplikasi data entitas atau pemanggilan ganda (*race condition*) akibat klik berulang secara cepat (*rapid-clicking*) pada tombol submit atau konfirmasi hapus.
* **Kondisi Awal**: Pengguna telah mengisi formulir tambah/edit kamar atau membuka modal konfirmasi hapus kamar/lantai.
* **Langkah-langkah Pengujian**:
  1. Klik tombol **"Daftarkan Kamar"** atau **"Hapus Kamar"** secara cepat sebanyak 3-4 kali berturut-turut.
* **Hasil Diharapkan**:
  - Flag penahan konkurensi (`isAddSubmitting` / `isEditSubmitting` / `isDeleteRoomSubmitting` / `isDeleteFloorSubmitting`) seketika aktif pada klik pertama.
  - Tombol submit formulir seketika dinonaktifkan (`disabled = true`) dengan visual opacity `0.7`.
  - Klik ke-2, ke-3, dan seterusnya ditolak seketika oleh guard clause (`if (isSubmitting) return;`).
  - Tidak terjadi duplikasi ID kartu di DOM, duplikasi data di `ROOMS_DATA`, maupun pemanggilan toast berulang.
  - Flag konkurensi di-reset kembali setelah siklus eksekusi tuntas.

---

### SKENARIO 38: Pengamanan Kehilangan Data Formulir saat Refresh / Navigasi (Dirty Form Guard)
* **Tujuan**: Mencegah hilangnya data ketikan pengguna secara tidak sengaja ketika sedang mengisi formulir tambah/edit kamar lalu me-refresh halaman atau menutup tab.
* **Kondisi Awal**: Pengguna membuka modal Tambah Kamar dan telah mengetikkan beberapa informasi data unit.
* **Langkah-langkah Pengujian**:
  1. Ketikkan beberapa nilai pada field nomor kamar atau catatan unit (`isAddFormDirty = true`).
  2. Tekan pintasan keyboard reload browser (`Ctrl + R` / `F5`) atau klik tombol back navigasi browser.
* **Hasil Diharapkan**:
  - Event listener `window.onbeforeunload` mendeteksi status form dalam kondisi dirty (`isAddFormDirty === true`).
  - Browser memunculkan dialog konfirmasi bawaan: *"Perubahan yang Anda buat mungkin tidak tersimpan. Tinggalkan situs?"*.
  - Jika pengguna memilih "Batal", halaman tetap bertahan dan seluruh ketikan formulir tidak hilang.
  - Jika form di-submit sukses atau ditutup secara resmi melalui tombol batal/silang, status dirty di-reset ke `false`.

---

### SKENARIO 39: Penanganan Riwayat Browser & Back-Button Trapping pada Modal (History API Modal Dismiss)
* **Tujuan**: Memberikan pengalaman pengguna native pada perangkat mobile dan desktop: menekan tombol Back browser saat modal terbuka akan menutup modal tersebut alih-alih me-redirect pengguna keluar dari aplikasi.
* **Kondisi Awal**: Pengguna sedang membuka modal Tambah Kamar atau modal Edit Kamar.
* **Langkah-langkah Pengujian**:
  1. Buka modal Tambah Kamar $\rightarrow$ `history.pushState({ modalOpen: true, modalId: 'modalTambahKamar' }, '')` tercatat di stack riwayat peramban.
  2. Tekan tombol **Back** pada browser (atau gesture swipe back di ponsel/tablet).
* **Hasil Diharapkan**:
  - Event `popstate` tertangkap oleh listener sistem.
  - Sistem mendeteksi elemen modal aktif dan memanggil `closeTambahKamarModal()`.
  - Modal dan backdrop menutup secara mulus tanpa memicu navigasi keluar dari halaman `WF-03-kamar.html`.

---

### SKENARIO 40: Pembersihan Memori Objek Pratinjau Foto Unit (Object URL Memory Leak Prevention)
* **Tujuan**: Mencegah kebocoran memori RAM peramban (*memory leak*) akibat penumpukan objek blob `URL.createObjectURL` yang tidak pernah dibebaskan saat berkas foto diunggah berkali-kali atau modal dibatalkan.
* **Kondisi Awal**: Pengguna mengunggah beberapa kali pratinjau foto unit kamar pada modal.
* **Langkah-langkah Pengujian**:
  1. Pilih foto kamar pertama pada dropzone unggah foto. Pratinjau tampil di box.
  2. Pilih kembali foto kedua untuk mengganti pratinjau sebelumnya.
  3. Klik tombol silang/batal untuk menutup modal.
* **Hasil Diharapkan**:
  - Fungsi utilitas `cleanupPhotoUrls()` dipanggil secara otomatis saat modal ditutup atau saat foto baru dipilih.
  - Sistem mengeksekusi `URL.revokeObjectURL(url)` untuk mencabut izin akses memori blob lama.
  - Variabel penampung pratinjau di-reset kembali ke `null`, menjaga jejak memori (*memory footprint*) aplikasi tetap ringan dan stabil.

---

### SKENARIO 41: Validasi Batas Maksimal Karakter & Plafon Nominal Finansial (Upper-Bound Ceiling Guard)
* **Tujuan**: Mencegah kerusakan tata letak UI dan anomali kalkulasi finansial akibat injeksi nilai string berukuran raksasa atau nominal angka di luar batas kewajaran bisnis.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar terbuka.
* **Langkah-langkah Pengujian**:
  1. Cek pembatasan panjang karakter input:
     - Nomor Kamar dibatasi atribut `maxlength="10"` dan pola regex alfanumerik.
     - Dimensi Ukuran dan Token Meteran dibatasi `maxlength="30"`.
     - Tarif Sewa dan Deposit dibatasi `maxlength="15"`.
     - Catatan Kamar dibatasi `maxlength="500"`.
  2. Masukkan tarif sewa atau deposit fiktif bernilai Rp 500.000.000 (melebihi batas plafon Rp 100 Jt).
  3. Klik submit formulir.
* **Hasil Diharapkan**:
  - Sistem menolak input dengan Toast Warning: *"Nominal tarif sewa/deposit tidak boleh melebihi Rp 100.000.000!"*.
  - Fokus kursor otomatis diarahkan ke input terkait.
  - Melindungi integritas basis data dan kestabilan tampilan layout kartu grid.

---

### SKENARIO 42: Ketahanan Jaringan & Mode Offline (Offline Interceptor)
* **Tujuan**: Memberikan respon yang ramah dan mencegah kegagalan mutasi data diam-diam (*silent failure*) ketika koneksi internet pengguna terputus saat mengakses antarmuka.
* **Kondisi Awal**: Pengguna sedang membuka modul `WF-03-kamar.html`.
* **Langkah-langkah Pengujian**:
  1. Putuskan sambungan internet / aktifkan mode Offline pada tab DevTools Network.
  2. Event `window.addEventListener('offline')` seketika memicu notifikasi Toast bahaya:  
     `"Koneksi internet terputus. Mode offline aktif."`
  3. Coba lakukan mutasi data (Tambah Kamar, Simpan Edit Kamar, atau Hapus Lantai).
* **Hasil Diharapkan**:
  - Seluruh *handler* mutasi mendeteksi `!navigator.onLine` dan memblokir aksi sebelum state rusak:  
     `"Koneksi internet terputus. Periksa jaringan Anda."`
  4. Sambungkan kembali internet.
  - Event `window.addEventListener('online')` memicu Toast Success: *"Koneksi internet kembali stabil."*

---

### SKENARIO 43: Sinkronisasi Invalidasi Sesi Lintas Tab (Multi-Tab Session Synchronization)
* **Tujuan**: Mencegah kebocoran data dan operasi ilegal ketika pengguna telah logout dari tab browser lain namun tab katalog kamar masih terbuka.
* **Kondisi Awal**: Pengguna membuka aplikasi RumaKost pada Tab 1 (Katalog Kamar) dan Tab 2 (Profil Akun).
* **Langkah-langkah Pengujian**:
  1. Pada Tab 2, pengguna mengklik tombol Keluar / Logout, sehingga key penyimpanan `rumakost_active_session` dihapus dari `localStorage`.
  2. Amati perilaku pada Tab 1 (modul WF-03).
* **Hasil Diharapkan**:
  - Event `window.addEventListener('storage')` pada Tab 1 mendeteksi perubahan kunci sesi yang terhapus.
  - Tab 1 seketika memunculkan Toast Peringatan: *"Sesi kerja Anda telah berakhir dari tab lain. Mengarahkan ke halaman masuk..."*.
  - Browser secara otomatis me-redirect tab ke `WF-01-login.html?reason=session_expired` dalam waktu 1 detik.

---

### SKENARIO 44: Optimasi Responsivitas Filter melalui Debounce Pencarian (Debounce Search Optimization)
* **Tujuan**: Menghindari beban eksekusi filter DOM secara sinkron pada setiap penekanan tombol (*keystroke*), yang dapat menyebabkan *input lag* atau *frame drop* pada daftar katalog kamar yang besar.
* **Kondisi Awal**: Pengguna berada di halaman katalog kamar dan memfokuskan kursor pada kotak pencarian toolbar.
* **Langkah-langkah Pengujian**:
  1. Ketikkan kata kunci secara cepat pada kotak pencarian `#kamarSearchInput` (misal mengetikkan kata *"Deluxe"* secara berturut-turut tanpa jeda).
* **Hasil Diharapkan**:
  - Fungsi `debounce(handleKamarFilter, 200)` menahan eksekusi filter selama 200ms sejak ketikan terakhir.
  - Filter hanya dieksekusi 1 kali setelah pengguna berhenti mengetik, menghemat siklus rendering DOM hingga 80%.
  - UI terasa mulus, responsif, dan bebas jeda (*zero stuttering*).

---

### SKENARIO 45: Sanitasi Tautan WhatsApp Kontak Kosong & Penanganan Fallback Thumbnail Grid
* **Tujuan**: Mencegah tombol WhatsApp di drawer menghasilkan tautan rusak (`wa.me/` tanpa nomor atau nomor fiktif placeholder) saat data kontak penyewa kosong atau belum tercatat, serta memastikan seluruh thumbnail kartu di grid memiliki proteksi kegagalan muat gambar.
* **Kondisi Awal**: Pengguna menginspeksi kamar terisi yang tidak memiliki nomor kontak telepon valid (`phone === '—'` atau karakter non-numerik).
* **Langkah-langkah Pengujian**:
  1. Klik kamar yang nomor telepon penyewanya tidak valid atau bernilai strip.
  2. Amati tombol WhatsApp (`#linkDirectWa`) pada Side Drawer.
* **Hasil Diharapkan**:
  - Sistem mendeteksi `cleanPhone.length < 9 || data.phone === '—'`.
  - Tombol WhatsApp disembunyikan secara otomatis (`waBtn.style.display = 'none'`).
  - Pada thumbnail kartu grid, atribut `onerror="this.onerror=null; this.src='assets/img/login-showcase.png';"` memastikan jika tautan gambar rusak, gambar fallback resmi segera menggantikannya tanpa merusak aspek rasio 16:9 kartu kamar.

---

### SKENARIO 46: Proteksi Perubahan Tarif Kamar Terisi (Grandfathered Pricing Protection)
* **Tujuan**: Mencegah kesalahpahaman dan sengketa sewa dengan menegaskan bahwa perubahan/kenaikan tarif kamar terisi hanya berlaku untuk kontrak sewa berikutnya (*future tenants*) dan tidak menaikkan tagihan penyewa aktif yang masih dalam masa kontrak berjalan.
* **Kondisi Awal**: Buka modal Edit Kamar pada kamar yang berstatus terisi aktif (misal Kamar A-01 / Siti Aminah).
* **Langkah-langkah Pengujian**:
  1. Periksa bagian input Tarif Sewa per Bulan pada `#modalEditKamar`.
  2. Amati badge/callout proteksi `#editGrandfatheredNotice`.
* **Hasil Diharapkan**:
  - Callout bernuansa biru informatif tampil di bawah input tarif: *"Grandfathered Rate: Perubahan tarif unit hanya berlaku untuk kontrak penyewa baru mendatang. Kontrak berjalan penyewa aktif saat ini tetap terkunci sesuai invoice awal."*
  - Nilai tagihan aktif penyewa Siti Aminah di `ROOMS_DATA` dan database billing tidak terpengaruh secara sepihak.

---

### SKENARIO 47: Kunci Sewa Unit 'Dalam Perbaikan' (Maintenance Lease Lockout)
* **Tujuan**: Memastikan kamar yang sedang mengalami kerusakan fisik / dalam pemeliharaan (status `perbaikan`) terkunci secara mutlak dari penerbitan kontrak sewa baru, baik melalui tombol antarmuka maupun manipulasi query URL.
* **Kondisi Awal**: Pilih kamar dalam perbaikan (Kamar B-05).
* **Langkah-langkah Pengujian**:
  1. Amati tombol aksi utama di Side Drawer.
  2. Buka modul dengan URL pendaftaran sewa paksa: `WF-03-kamar.html?action=new&room=B-05`.
* **Hasil Diharapkan**:
  - Tombol aksi utama berubah menjadi *"Buka Tiket Perbaikan #T-04"* dan tombol "+ Daftarkan Penghuni Baru" di-hide.
  - Sistem mendeteksi parameter `action=new` pada kamar berstatus perbaikan dan menampilkan Toast Warning: *"Kamar B-05 sedang dalam pemeliharaan (Tiket #T-04) dan terkunci dari kontrak sewa baru."*

---

### SKENARIO 48: Mekanisme Pembatalan Penghapusan Kamar Berjangka (Undo Deleted Room Toast Action)
* **Tujuan**: Memberikan jaring pengaman (*safety net*) bagi pengelola jika tidak sengaja mengonfirmasi penghapusan unit kamar kosong melalui tombol "Urungkan (Undo)" pada notifikasi toast selama 5 detik.
* **Kondisi Awal**: Kamar A-03 (Kosong · Siap Huni) dihapus melalui modal konfirmasi hapus.
* **Langkah-langkah Pengujian**:
  1. Klik konfirmasi hapus kamar pada modal.
  2. Amati toast notifikasi yang muncul di sudut layar.
  3. Sebelum 5 detik berlalu, klik tautan/tombol **"Urungkan (Undo)"** pada toast.
* **Hasil Diharapkan**:
  - Fungsi `undoDeleteKamar()` mengembalikan snapshot data Kamar A-03 ke `ROOMS_DATA`.
  - Kartu Kamar A-03 di-render ulang secara instan pada kluster seksi Lantai 1 di grid DOM.
  - Metrik makro okupansi dan potensi pendapatan dihitung ulang ke nilai semula.
  - Kamar A-03 langsung terpilih kembali di Side Drawer dengan status Siap Huni.

---

### SKENARIO 49: Ketahanan Karakter Khusus Regex pada Kotak Pencarian (Literal Search Resilience)
* **Tujuan**: Memastikan kotak pencarian toolbar kebal terhadap karakter simbol metakarakter regex (seperti `.*`, `[`, `]`, `\`, `(`, `)`, `+`, `?`) dan memprosesnya secara aman sebagai string literal tanpa melempar pengecualian JavaScript.
* **Kondisi Awal**: Pengguna memfokuskan kursor pada kotak input pencarian `#kamarSearchInput`.
* **Langkah-langkah Pengujian**:
  1. Ketikkan rangkaian simbol regex ekstrem pada input: `[A-Z].*+(1)` atau `\d+?`.
* **Hasil Diharapkan**:
  - Fungsi `handleKamarFilter()` menggunakan pencarian literal `.includes()` yang membandingkan substring mentah.
  - Tidak terjadi crash atau error `SyntaxError: Invalid regular expression` pada console peramban.
  - Sistem menampilkan empty state filter bersih (*Filter Zero State*) jika tidak ada kamar yang cocok.

---

### SKENARIO 50: Optimasi Cetak Brosur Kamar Kosong (Print-Friendly Vacancy Sheet)
* **Tujuan**: Menyediakan tata letak cetak dokumen yang rapi, hemat tinta, dan bebas distraksi saat pengelola menekan pintasan cetak browser (`Ctrl + P`) untuk keperluan survei fisik lapangan.
* **Kondisi Awal**: Pengguna berada di halaman katalog kamar `WF-03`.
* **Langkah-langkah Pengujian**:
  1. Buka dialog pratinjau cetak browser (`Ctrl + P` atau `Print`).
* **Hasil Diharapkan**:
  - Aturan stylesheet `@media print` menyembunyikan elemen navigasi topbar, panel filter, tombol hapus lantai, tombol floating arrow, dan modal.
  - Latar belakang halaman diubah menjadi putih bersih (`#FFFFFF`) dengan warna teks gelap (`#0F172A`).
  - Kluster lantai dan kartu unit kamar mempertahankan border garis halus tanpa bayangan tebal (*shadowless*), dengan aturan `break-inside: avoid` untuk mencegah kartu terpotong antar-halaman kertas.

---

### SKENARIO 51: Penegasan Tarif Dasar vs Biaya Tambahan Pasangan (Double Occupancy Base Rate Policy)
* **Tujuan**: Menjamin transparansi informasi penentuan harga bahwa tarif bulanan di master kamar adalah tarif dasar (*base rate*), dan biaya tambahan orang kedua/pasutri dikonfigurasi saat penerbitan kontrak di WF-04.
* **Kondisi Awal**: Modal Tambah Kamar atau Edit Kamar terbuka.
* **Langkah-langkah Pengujian**:
  1. Pada pilihan pill kapasitas, klik opsi **"2 Orang"** (atau "3 Orang", "4+ Orang").
* **Hasil Diharapkan**:
  - Tampil catatan bantu informatif di bawah deretan pill: *"Tarif tercantum adalah tarif dasar kamar. Tambahan biaya penghuni ke-2 (surcharge) dikonfigurasi saat pembuatan kontrak di WF-04."*
  - Jika pill dikembalikan ke opsi "1 Orang", catatan bantu otomatis disembunyikan.

---

### SKENARIO 52: Penanganan Tautan Masuk Kamar Fiktif (Invalid Deep Link Graceful Fallback)
* **Tujuan**: Memberikan respon yang ramah dan memandu pengguna ketika mengakses URL deep link dengan nomor kamar yang tidak terdaftar di sistem (misal tautan usang atau typo).
* **Kondisi Awal**: Buka aplikasi dengan parameter kamar fiktif: `WF-03-kamar.html?room=Z-99`.
* **Langkah-langkah Pengujian**:
  1. Halaman memuat dan menginisialisasi parameter URL.
* **Hasil Diharapkan**:
  - Sistem memvalidasi `matchKey` pada `ROOMS_DATA`. Karena Kamar Z-99 tidak ada, sistem melakukan fallback anggun ke kamar pertama (Kamar A-01).
  - Muncul notifikasi Toast Warning: *"Kamar \"Z-99\" tidak ditemukan dalam katalog properti. Menampilkan unit default A-01."*
  - Pengguna tidak terjebak dalam blank screen atau drawer kosong tanpa konteks.

---

### SKENARIO 53: Sanitasi Paste Nilai Rupiah Berdesimal Sen (Cents Sanitizer on Paste)
* **Tujuan**: Mencegah inflasi nilai nominal 100x lipat saat pengguna menyalin-tempel (*copy-paste*) angka dari spreadsheet atau mutasi bank yang mencantumkan desimal sen `,00`.
* **Kondisi Awal**: Kursor berada pada input tarif sewa `#addHargaKamar` atau `#editHargaKamar`.
* **Langkah-langkah Pengujian**:
  1. Salin teks berdesimal sen: `"Rp 1.500.000,00"` atau `"1500000,00"`.
  2. Tempel (*paste*) ke dalam kolom input tarif sewa.
* **Hasil Diharapkan**:
  - Fungsi `formatRupiahInput()` memangkas akhiran sen desimal `,00` terlebih dahulu dengan regex `replace(/,[0-9]{1,2}$/, '')`.
  - Nilai yang terformat di input adalah `"1.500.000"` (Satu Juta Lima Ratus Ribu Rupiah), BUKAN `"150.000.000"` (Seratus Lima Puluh Juta Rupiah).

---

### SKENARIO 54: Pintasan Lapor Kerusakan Kamar Kosong Langsung dari Drawer (Direct Issue Reporting)
* **Tujuan**: Memfasilitasi alur operasional cepat ketika pengelola menemukan kerusakan saat inspeksi unit kosong tanpa harus melalui alur edit kamar manual terlebih dahulu.
* **Kondisi Awal**: Kamar kosong (misal Kamar A-03) terpilih di Side Drawer.
* **Langkah-langkah Pengujian**:
  1. Amati deretan tombol aksi di Side Drawer Dossier.
  2. Klik tombol pintasan **"Laporkan Kendala / Servis Fisik"** (`#btnDrawerReportRepair`).
* **Hasil Diharapkan**:
  - Tombol tampil proporsional di bawah tombol siar WhatsApp unit kosong.
  - Tautan mengarah langsung ke formulir tiket aduan baru dengan kamar ter-prefill: `WF-08-tiket.html?action=new&kamar=A-03`.

---

### SKENARIO 55: Navigasi Keyboard Arrow Antar-Kartu Unit (Keyboard Grid Traversal)
* **Tujuan**: Meningkatkan efisiensi inspeksi visual (*power-user traversal*) melalui navigasi tombol panah keyboard tanpa harus mengklik mouse berulang kali.
* **Kondisi Awal**: Pengguna berada di halaman katalog kamar, kursor tidak sedang fokus di dalam kolom input teks, dan tidak ada modal yang terbuka.
* **Langkah-langkah Pengujian**:
  1. Tekan tombol panah kanan (`ArrowRight`) atau panah bawah (`ArrowDown`).
  2. Tekan tombol panah kiri (`ArrowLeft`) atau panah atas (`ArrowUp`).
* **Hasil Diharapkan**:
  - Seleksi kamar berpindah secara mulus ke kartu unit kamar terlihat berikutnya/sebelumnya.
  - Kartu aktif ter-highlight oranye dan Side Drawer seketika memperbarui dossier unit terpilih.
  - Kartu baru yang terpilih otomatis melakukan scroll ke area pandang (*smooth scrolling*).
  - Navigasi keyboard otomatis tidak aktif ketika pengguna sedang mengetik di kolom pencarian atau formulir modal.

---

### SKENARIO 56: Auto-Kalkulasi Nominal Deposit Default Berdasarkan Tarif Sewa
* **Tujuan**: Membantu pemilik kos menghitung nominal uang jaminan (deposit sewa) secara proporsional dan otomatis (default 50% dari tarif sewa bulanan, dibulatkan ke kelipatan Rp 50.000 terdekat) saat mendaftarkan atau memperbarui kamar tanpa membebani antarmuka dengan teks/badge berlebih (clean minimalist DNA), dengan tetap memberikan kebebasan kustomisasi manual tanpa terkunci.
* **Kondisi Awal**: Pemilik membuka Modal Tambah Kamar (`#modalTambahKamar`) atau Modal Edit Kamar (`#modalEditKamar`).
* **Langkah-langkah Pengujian**:
  1. Pada form modal tambah kamar, ketikkan tarif sewa bulanan, misalnya `Rp 1.750.000`.
  2. Amati kolom input **"Nominal Deposit Default (Rp)"** (`#addDepositKamar`).
  3. Lakukan pengeditan manual pada kolom deposit, misalnya diubah menjadi `Rp 1.000.000`.
  4. Coba ubah tarif sewa kembali.
* **Hasil Diharapkan**:
  - Saat tarif diisi Rp 1.750.000, deposit terisi otomatis secara mulus sebesar **Rp 900.000** (50% dari 1.750.000 adalah 875.000, dibulatkan ke kelipatan Rp 50.000 terdekat menjadi 900.000) tanpa badge atau teks pembantu panjang yang mengotori visual form.
  - Ketika pemilik mengetik langsung nominal deposit sendiri, sistem mendeteksi input telah disesuaikan manual sehingga angka yang diketik pemilik tidak akan tertimpa saat tarif sewa diubah kembali.
  - Alur kalkulasi yang sama berjalan konsisten pada formulir Edit Kamar (`#editDepositKamar`).

---

### SKENARIO 57: Inspeksi Foto Kamar Layar Penuh Minimalis (Minimalist Photo Lightbox)
* **Tujuan**: Memfasilitasi pemilik dan staf untuk menginspeksi foto ruangan kamar dalam tampilan **layar penuh murni yang sangat bersih dan simpel** (hanya foto besar di tengah dan tombol tutup X di pojok kanan atas).
* **Kondisi Awal**: Sebuah kamar (misal Kamar A-01) terpilih di Side Drawer kanan.
* **Langkah-langkah Pengujian**:
  1. Arahkan kursor (*hover*) pada kotak foto hero kamar di Side Drawer (`#drawerPhotoWrap`).
  2. Amati efek visual (zoom scale halus gambar & kemunculan kapsul petunjuk *"Layar Penuh"* berikon `maximize-2`).
  3. Klik kotak foto tersebut.
  4. Amati tampilan layar penuh `#modalPhotoLightbox` yang muncul:
     - Seluruh layar menjadi backdrop gelap bersih berlatar `rgba(10, 10, 12, 0.94)` dengan efek blur halus.
     - Foto unit ditampilkan besar dan proporsional di tengah layar (`max-width: 92vw; max-height: 90vh; object-fit: contain;`).
     - Terdapat satu tombol bulat tutup **X** (`.btn-minimal-close`) yang bersih di pojok kanan atas.
  5. Tutup tampilan foto dengan salah satu cara: klik tombol close `X`, klik di area gelap luar foto, atau tekan tombol `ESC` keyboard.
* **Hasil Diharapkan**:
  - Foto terbuka seketika dalam tampilan layar penuh minimalis bebas distraksi.
  - Tampilan dapat ditutup seketika tanpa jeda.

---

## 5. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Komponen / Target Interaksi | Prioritas Scope | Status Verifikasi |
|---|---|---|:---:|:---:|
| **SK-01** | Seleksi Kamar di Side Drawer Dossier | Grid Kamar, Drawer Dossier | **P0 (Must)** | **PASSED (100%)** |
| **SK-02** | Filter Multi-Kriteria & Sinkronisasi Konteks | Toolbar Popover, Search Capsule | **P0 (Must)** | **PASSED (100%)** |
| **SK-03** | Pendaftaran Kamar Baru & Anti-Duplikasi No. | `#modalTambahKamar`, Dropzone Preview | **P0 (Must)** | **PASSED (100%)** |
| **SK-04** | Penambahan Partisi Lantai Dinamis On-the-Fly | `#wrapAddLantai`, Mini Floor Input | **P0 (Must)** | **PASSED (100%)** |
| **SK-05** | Proteksi Status Fisik vs Okupansi (Boundary) | `#modalEditKamar`, `#wrapLockedNotice` | **P0 (Must)** | **PASSED (100%)** |
| **SK-06** | Relokasi Fisik Unit Kamar Antar-Lantai | Grid DOM, Refresh Counter Lantai | **P0 (Must)** | **PASSED (100%)** |
| **SK-07** | Pemulihan Pemeliharaan (Mark Maintenance Done)| Maintenance Pod, Speedometer Gauge | **P0 (Must)** | **PASSED (100%)** |
| **SK-08** | Generator & Salin Teks Iklan WhatsApp Manual | `#modalIklanKamar`, Direct WA Link | **P0 (Must)** | **PASSED (100%)** |
| **SK-09** | Proteksi Hapus Kamar Berpenghuni Aktif | Delete Handler, Tenant Guard | **P0 (Must)** | **PASSED (100%)** |
| **SK-10** | Konfirmasi Hapus Kamar Kosong Dua Langkah | `#modalKonfirmasiHapusKamar` | **P0 (Must)** | **PASSED (100%)** |
| **SK-11** | Floor Deletion Guard (Wajib 0 Kamar) | `.btn-del-floor-sec`, `#modalHapusLantai`| **P0 (Must)** | **PASSED (100%)** |
| **SK-12** | Antarmuka Filter Zero State vs Absolute Zero | Empty State Pod, Reset Trigger | **P0 (Must)** | **PASSED (100%)** |
| **SK-13** | Aksesibilitas Tombol Escape (ESC Key Global) | Global Event Listener, Modal Backdrop | **P0 (Must)** | **PASSED (100%)** |
| **SK-14** | Auto-Sinkronisasi Dimensi Kamar (Preset) | `#wrapAddTipe`, `#addUkuranKamar` | **P0 (Must)** | **PASSED (100%)** |
| **SK-15** | Penggantian Foto Unit & Refleksi Instan | Dropzone Edit, Thumbnail & Hero Sync | **P0 (Must)** | **PASSED (100%)** |
| **SK-16** | Chat WhatsApp Penyewa Aktif di Drawer | `.btn-drawer-wa`, `https://wa.me/` | **P0 (Must)** | **PASSED (100%)** |
| **SK-17** | Hapus Opsi Lantai Draft/Typo di Dropdown | `.btn-del-floor-opt`, Custom Menu | **P0 (Must)** | **PASSED (100%)** |
| **SK-18** | Tampilan Responsif & Transisi Mobile Drawer | Mobile Drawer, Backdrop Sheet | **P0 (Must)** | **PASSED (100%)** |
| **SK-19** | Penanganan Deep Linking URL (?room=... & ?status=...)| `URLSearchParams`, Auto Scroll & Sync | **P0 (Must)** | **PASSED (100%)** |
| **SK-20** | Isolasi Hak Akses RBAC (Tenant Redirect & Staff Guard)| RBAC Middleware, Action Button Shield| **P0 (Must)** | **PASSED (100%)** |
| **SK-21** | Validasi Sanitasi Form & Batas Media Foto (4 MB) | Input Sanitizer, File Upload Validator | **P0 (Must)** | **PASSED (100%)** |
| **SK-22** | Sinergi Filter Bersarang Simultan 3 Kriteria | Compound Filter Logic (`AND`), DOM Grid | **P0 (Must)** | **PASSED (100%)** |
| **SK-23** | Konfigurasi Kapasitas & Aturan Gender Kamar | Capacity Pills, Gender Policy Engine | **P0 (Must)** | **PASSED (100%)** |
| **SK-24** | Transisi Kamar Kosong ke Perbaikan & Tiket WF-08 | `#modalEditKamar`, WF-08 Ticket Bridge | **P0 (Must)** | **PASSED (100%)** |
| **SK-25** | Sub-metering Token PLN / Nomor ID Pelanggan Listrik | Specs Grid, Electricity Token Storage | **P0 (Must)** | **PASSED (100%)** |
| **SK-26** | Diferensiasi Visual Kolektibilitas & Smart Note Bubble| Tenant Note Bubble, Bill Badge Variants| **P0 (Must)** | **PASSED (100%)** |
| **SK-27** | Rekalkulasi Matematis Radial Gauge Finansial | Macro Speedometer, SVG Dashoffset | **P0 (Must)** | **PASSED (100%)** |
| **SK-28** | Proteksi Duplikasi Nama Lantai Dropdown Mini | Inline Floor Validator, Select Redirect| **P0 (Must)** | **PASSED (100%)** |
| **SK-29** | Penanganan Fallback Gambar Rusak (Broken Image) | `img.onerror` Handler, Fallback Asset | **P0 (Must)** | **PASSED (100%)** |
| **SK-30** | Normalisasi Kontak Telepon WA Internasional (+62) | Regex Sanitizer, ITU-T E.164 Formatter| **P0 (Must)** | **PASSED (100%)** |
| **SK-31** | Deteksi Kluster Lantai Penuh (100% Occupancy Chip) | `refreshFloorStats()`, 100% Penuh Chip | **P0 (Must)** | **PASSED (100%)** |
| **SK-32** | Parameter URL Alur Kontekstual ke Penghuni (WF-04)| Contextual Link, Action & ID Query Param| **P0 (Must)** | **PASSED (100%)** |
| **SK-33** | Click-Outside Dismissal Dropdown & Popover | Global Document Click Listener | **P0 (Must)** | **PASSED (100%)** |
| **SK-34** | Dynamic Amenities Icon Mapping Engine | Keyword Icon Parser, Lucide Engine | **P0 (Must)** | **PASSED (100%)** |
| **SK-35** | Proteksi Rekalkulasi Metrik saat Katalog Kosong | `refreshGlobalMetrics()`, Zero Gauge Reset | **P0 (Must)** | **PASSED (100%)** |
| **SK-36** | Sanitasi Injeksi HTML / XSS Nomor & Spesifikasi | `escapeHTML()`, XSS Sanitization Filter | **P0 (Must)** | **PASSED (100%)** |
| **SK-37** | Proteksi Double-Submit & Rapid-Click Formulir | Concurrency Guard, Button Disabling | **P0 (Must)** | **PASSED (100%)** |
| **SK-38** | Pengamanan Kehilangan Data Formulir (Dirty Form) | `window.onbeforeunload`, Dirty Tracker | **P0 (Must)** | **PASSED (100%)** |
| **SK-39** | Riwayat Browser & Back-Button Modal Dismiss | History API `pushState`, `popstate` Trap | **P0 (Must)** | **PASSED (100%)** |
| **SK-40** | Pembersihan Memori Objek Pratinjau Foto Unit | `cleanupPhotoUrls()`, `revokeObjectURL` | **P0 (Must)** | **PASSED (100%)** |
| **SK-41** | Validasi Batas Maksimal & Plafon Finansial (100 Jt)| `maxlength` Guard, Ceiling Validator | **P0 (Must)** | **PASSED (100%)** |
| **SK-42** | Ketahanan Jaringan & Mode Offline Interceptor | `online`/`offline` Listener, Mutation Guard| **P0 (Must)** | **PASSED (100%)** |
| **SK-43** | Sinkronisasi Invalidasi Sesi Lintas Tab | Storage Event Listener, Multi-Tab Sync | **P0 (Must)** | **PASSED (100%)** |
| **SK-44** | Optimasi Filter via Debounce Pencarian (200ms) | `debounce()` Engine, Input Latency Guard| **P0 (Must)** | **PASSED (100%)** |
| **SK-45** | Sanitasi Tautan WA Kosong & Fallback Thumbnail | Clean Phone Validator, 16:9 Image Guard | **P0 (Must)** | **PASSED (100%)** |
| **SK-46** | Proteksi Perubahan Tarif Kamar Terisi (Grandfathered)| `#modalEditKamar`, Grandfathered Notice | **P0 (Must)** | **PASSED (100%)** |
| **SK-47** | Kunci Sewa Unit 'Dalam Perbaikan' (Lease Lockout)| `action=new` Guard, Maint Lease Shield | **P0 (Must)** | **PASSED (100%)** |
| **SK-48** | Pembatalan Hapus Kamar Berjangka (Undo Toast) | `undoDeleteKamar()`, 5s Recovery Window | **P0 (Must)** | **PASSED (100%)** |
| **SK-49** | Ketahanan Karakter Khusus Regex pada Pencarian | `handleKamarFilter()`, Literal Substring | **P0 (Must)** | **PASSED (100%)** |
| **SK-50** | Optimasi Cetak Brosur Kamar Kosong (@media print)| Print Stylesheet, Shadowless Media Card| **P1 (Should)**| **PASSED (100%)** |
| **SK-51** | Penegasan Tarif Dasar vs Surcharge Penghuni Ganda| Capacity Pills, Surcharge Policy Notice | **P1 (Should)**| **PASSED (100%)** |
| **SK-52** | Penanganan Tautan Masuk Kamar Fiktif (Deep Link) | URL Param Sanitizer, Graceful Fallback | **P0 (Must)** | **PASSED (100%)** |
| **SK-53** | Sanitasi Paste Nilai Rupiah Berdesimal Sen | `formatRupiahInput()`, Cents Stripper | **P0 (Must)** | **PASSED (100%)** |
| **SK-54** | Pintasan Lapor Kerusakan Cepat Kamar Kosong | `#btnDrawerReportRepair`, Direct WF-08 | **P1 (Should)**| **PASSED (100%)** |
| **SK-55** | Navigasi Keyboard Arrow Antar-Kartu Unit | Keydown Arrow Traversal, Focus Scroll | **P1 (Should)**| **PASSED (100%)** |
| **SK-56** | Auto-Kalkulasi Rekomendasi Deposit Default (50%) | `#addDepositKamar`, Recommended 50% Sync | **P0 (Must)** | **PASSED (100%)** |
| **SK-57** | Inspeksi Foto Kamar Resolusi Penuh (Lightbox) | `#drawerPhotoWrap`, `#modalPhotoLightbox`| **P1 (Should)**| **PASSED (100%)** |

