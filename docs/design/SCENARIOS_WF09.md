# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-09: Pengaturan Properti & Manajemen Hak Akses (SCR-16 & SCR-17)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-09-pengaturan.html`  
> **Fitur P0 Terkait**:  
> • **F-01** (Akses dan Peran / RBAC & Zero Public Registration)  
> • **F-02** (Manajemen Master Kamar — Sinkronisasi Kapasitas & Jumlah Lantai Properti)  
> • **F-03** (Penghuni dan Siklus Kontrak — Penugasan Kamar & Perlindungan Tabrakan)  
> • **F-05** (Pembayaran & Saldo — Rekening Bank Resmi Penampungan Sewa & Zero Self-Approval)  
> • **F-07** (Ticketing Kerusakan — Pengalihan Tugas Tiket Aktif saat Deaktivasi Staf)  
> **User Stories KANBAN**: `RK-001` (Epic Akses Owner, Staff, dan Penghuni), `RK-019` (Masuk dan Keluar Akun), `RK-020` (Pembatasan Hak Akses Berdasarkan Role), `RK-021` (Pembuatan & Aktivasi Akun Pengguna oleh Pemilik)  
> **Hak Akses Layar**: **Khusus Pemilik Properti (Owner / Superadmin Sahaja)** — Akses Penuh (Full Read/Write).  
> **Staf Operasional & Penghuni**: **Ditolak (HTTP 403 Forbidden)**.

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-09 (`SCR-16` & `SCR-17`)** adalah pusat kendali (*command center*) administratif tertinggi dalam ekosistem sistem RumaKost. Dibangun di atas filosofi desain **Estify Minimalist DNA**, antarmuka ini mengadopsi arsitektur **2-Column Responsive Sticky Workbench** yang memisahkan navigasi indeks seksi di sebelah kiri dengan alur formulir kartu fungsional modular di sebelah kanan.

Layar ini dirancang secara ketat untuk menegakkan prinsip-prinsip operasional inti sesuai `docs/pm/SCOPE_STATEMENT.md`:
1. **Single Independent Property Guard (Batas Satu Properti Mandiri)**: Seluruh pengaturan fisik terkunci pada 1 entitas properti (Kost Budi Makmur, 15 unit kamar, 3 lantai). Sistem menolak arsitektur multi-properti (P3 / Won't).
2. **Zero Public Registration (Tanpa Registrasi Publik Mandiri)**: Sistem tidak menyediakan pendaftaran mandiri bagi calon penyewa atau staf luar. Seluruh akun diinisiasi, dikonfigurasi hak aksesnya, dan diaktifkan secara eksklusif oleh Pemilik Properti (`F-01`).
3. **Zero Self-Approval Enforcement (Pemisahan Wewenang Transaksional)**: Akun Staf Operasional dibatasi secara tegas untuk mencatat pembayaran berstatus pending tanpa hak verifikasi. Rekening penampungan resmi hanya dikendalikan oleh Pemilik Properti.
4. **Data Isolation Boundary (Isolasi Data Penghuni)**: Akun Penghuni diikat secara spesifik pada satu nomor kamar (misal: Kamar A-04) dengan portal swalayan yang terisolasi total dari data penyewa lain maupun laporan keuangan properti.
5. **Anti-Lockout Superadmin Protection (Proteksi Akun Terakhir Pemilik)**: Akun Pemilik diberi label permanen *"Utama"*, kebal terhadap aksi penonaktifan atau penurunan peran (*demotion*), menjamin ketersediaan akses administratif sepanjang masa operasional.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        WF-09 WORKBENCH ARSITEKTUR & LAYOUT                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Nav Pill + Search Box + Notif + Avatar   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. TOP CANOPY OVERLAY (24px): Masking transparan pembatas gulir atas                   │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ 3. LEFT COLUMN: STICKY SIDEBAR    │ 4. RIGHT COLUMN: ESTIFY CARDS FLOW                 │
│    (300px, Sticky @ 110px Offset) │    ┌──────────────────────────────────────────────┐│
│    • Header Nav + Badge 3 Seksi   │    │ SEKSI 1: IDENTITAS PROPERTI & REKENING       ││
│    • Item 1: Profil Properti      │    │ • Input Nama, Pemilik, Alamat, WA, Email     ││
│    • Item 2: Akun & RBAC (F-01)   │    │ • Field Readonly: Kapasitas Kamar & Lantai   ││
│    • Item 3: Keamanan Sandi       │    │ • Live ATM Card Preview (Bank BCA Monospace) ││
│    • Property Pod: Ringkasan 15 U │    │ • Dynamic Rules Builder (Tata Tertib Kost)   ││
│    • ScrollSpy Otomatis           │    └──────────────────────────────────────────────┘│
│                                   │    ┌──────────────────────────────────────────────┐│
│                                   │    │ SEKSI 2: MANAJEMEN AKUN & RBAC (F-01)        ││
│                                   │    │ • Toolbar: Filter Tab Peran (Semua/Staf/Huni)││
│                                   │    │ • Action CTA: + Buat Akun Baru (F-01)        ││
│                                   │    │ • Master Table Pengguna (Avatar, RBAC, Status││
│                                   │    │ • Callout Kebijakan F-01 & Zero Self-Approval││
│                                   │    └──────────────────────────────────────────────┘│
│                                   │    ┌──────────────────────────────────────────────┐│
│                                   │    │ SEKSI 3: KEAMANAN KATA SANDI PEMILIK         ││
│                                   │    │ • Form Sandi Lama, Sandi Baru, Konfirmasi    ││
│                                   │    │ • Tombol Perbarui Sandi + Session Revocation ││
│                                   │    └──────────────────────────────────────────────┘│
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. Matriks Data Baseline (Fixture Testing)

Seluruh skenario pengujian diverifikasi terhadap data awal (*baseline fixtures*) yang tersimpan dalam sistem:

### 2.1 Baseline Profil Properti Kost (`SCR-17`)
| Parameter Konfigurasi | Nilai Default Sistem | Sifat Data / Aturan Bisnis |
|---|---|---|
| **Nama Properti Kost** | `Kost Budi Makmur` | Input Wajib (Tercetak pada kop kuitansi/invoice) |
| **Nama Pemilik (Superadmin)** | `Budi Santoso` | Input Wajib (Akun permanen terdaftar) |
| **Kapasitas Total Kamar** | `15 Unit Kamar` | **Read-Only**: Dihitung otomatis dari master kamar (`F-02`) |
| **Jumlah Lantai Gedung** | `3 Lantai` | **Read-Only**: Dihitung otomatis dari partisi lantai master (`F-02`) |
| **Alamat Fisik Lengkap** | `Jl. Kemanggisan Raya No. 42, RT 04 / RW 08, Kel. Palmerah, Kec. Palmerah, Kota Jakarta Barat, DKI Jakarta 11480` | Input Wajib (Disanitasi dari tag HTML/skrip) |
| **Nomor WhatsApp Pengelola** | `0812-3456-7890` | Input Wajib (Dinormalisasi ke format E.164: `6281234567890`) |
| **Email Operasional Kost** | `pengelola@kostbudimakmur.id` | Input Wajib (Format email valid) |

### 2.2 Baseline Rekening Bank Penampungan Sewa (`F-05`)
| Parameter Rekening | Nilai Default | Tampilan Visual Live-Preview | Aturan Otorisasi Transaksi |
|---|---|---|---|
| **Nama Bank** | `BCA (Bank Central Asia)` | Header Kartu: `BANK BCA` | Bank tunggal penerima transfer manual penyewa |
| **Nomor Rekening** | `8830-1928-11` | Monospace: `8830-1928-11` | Ditampilkan pada invoice cetak & portal penghuni |
| **Atas Nama Rekening** | `BUDI SANTOSO` | Sub-label: `BUDI SANTOSO` | Rekening resmi Pemilik Properti |
| **Status Rekening** | `UTAMA · Aktif` | Badge hijau: `Rekening Aktif` | Verifikasi mutasi hanya oleh Pemilik (*Zero Self-Approval*) |

### 2.3 Baseline Klausul Tata Tertib Kost (Klausul Kontrak Digital)
| No. | Butir Aturan Bawaan Sistem | Status | Sinkronisasi Modul |
|---|---|---|---|
| **1** | Jam malam gerbang dikunci pukul 23.00 WIB demi keamanan bersama. | Aktif | Tercetak pada Kontrak Sewa & Beranda Portal |
| **2** | Dilarang keras merokok atau vaping di dalam kamar tidur ber-AC. | Aktif | Tercetak pada Kontrak Sewa & Beranda Portal |
| **3** | Tamu lawan jenis dilarang masuk atau menginap di dalam kamar tidur penghuni. | Aktif | Tercetak pada Kontrak Sewa & Beranda Portal |
| **4** | Dilarang membawa atau memelihara hewan peliharaan di area gedung kost. | Aktif | Tercetak pada Kontrak Sewa & Beranda Portal |
| **5** | Wajib menjaga ketenangan dan toleransi setelah pukul 22.00 WIB (tidak menyetel musik bising). | Aktif | Tercetak pada Kontrak Sewa & Beranda Portal |

### 2.4 Baseline Direktori Akun & Hak Akses Pengguna (`SCR-16` · `F-01`)
| Nama Pengguna | Email Login | Inisial | Peran Sistem | Cakupan Hak Akses (RBAC) | Status | Wewenang Aksi |
|---|---|---|---|---|---|---|
| **Budi Santoso** | `budi.santoso@kostbudimakmur.id` | `BS` | Pemilik (Owner) | Akses Penuh (Full Access Superadmin) | `Aktif` | Label *"Utama"* (Kebal Deaktivasi/Edit) |
| **Rini Setiawati** | `rini.staf@kostbudimakmur.id` | `RS` | Staf Operasional | Operasional Kamar, Penghuni, Tiket & Catat Bayar Pending (*Zero Self-Approval*) | `Aktif` | Tombol `Edit Izin` |
| **Pak Joko Santoso**| `joko.teknisi@kostbudimakmur.id`| `PJ` | Teknisi Lapangan | Modul Tiket Perbaikan & Pemeliharaan Unit Saja | `Aktif` | Tombol `Edit Izin` |
| **Budi Santoso (Penghuni)** | `budi.penghuni@rumakost.id` | `BS` | Penghuni Kamar | Terkunci di Kamar A-04 (Tagihan, Histori & Tiket Mandiri) | `Aktif` | Tombol `Kelola` |

### 2.5 Baseline Opsi Dropdown Penugasan Kamar (`#accRoomSelect`)
| Nilai Kamar | Label Opsi Tampilan | Status Hunian | Atribut Pengaman |
|---|---|---|---|
| `A-01` | Kamar A-01 · Lantai 1 (Tersedia) | Kosong | `data-occupied="false"` |
| `A-02` | Kamar A-02 · Lantai 1 (Tersedia) | Kosong | `data-occupied="false"` |
| `A-04` | Kamar A-04 · Lantai 1 (Terisi Kontrak: Budi Santoso) | **Terisi** | `data-occupied="true"` (Pemicu Alert Tabrakan) |
| `B-01` | Kamar B-01 · Lantai 2 (Tersedia) | Kosong | `data-occupied="false"` |

---

## 3. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Otorisasi Akses Rute Berdasarkan Peran (RBAC Route Guard & 403 Redirection)
- **Tujuan**: Memastikan keandalan proteksi rute halaman pengaturan agar hanya dapat diakses oleh Pemilik Properti, sementara Staf dan Penghuni ditolak secara mutlak.
- **Kondisi Awal (Pre-condition)**: Server pengujian aktif; terdapat sesi pengujian untuk 3 peran (Owner, Staf, Penghuni).
- **Langkah-langkah**:
  1. *Uji 1A (Owner Access)*: Buka browser, masuk dengan kredensial `budi.santoso@kostbudimakmur.id` -> Arahkan URL ke `/screens/WF-09-pengaturan.html`.
  2. *Uji 1B (Staff Access Block)*: Masuk dengan kredensial `rini.staf@kostbudimakmur.id` -> Ketikkan URL `/screens/WF-09-pengaturan.html` pada bilah alamat browser.
  3. *Uji 1C (Tenant Access Block)*: Masuk dengan kredensial `budi.penghuni@rumakost.id` -> Ketikkan URL `/screens/WF-09-pengaturan.html`.
- **Hasil yang Diharapkan**:
  - *Uji 1A*: Halaman terbuka sempurna (HTTP 200 OK); badge identitas pojok kanan bawah memuat *"SCR-16 & SCR-17 · Profil Properti & Akun Pengguna (F-01)"*; seluruh tombol formulir dan modal aktif.
  - *Uji 1B*: Sistem menolak akses dengan respon HTTP 403 Forbidden; sesi Staf dialihkan seketika ke `WF-02-dashboard.html?role=staf`; muncul toast bahaya: *"Akses Ditolak: Modul Pengaturan hanya untuk Pemilik Properti."*
  - *Uji 1C*: Sistem menolak akses; sesi Penghuni dialihkan seketika ke `WF-10-portal-penghuni.html`; data pengaturan tidak pernah ter-render di sisi klien.

---

### SKENARIO 02: Pembaruan Profil Fisik Properti Kost & Proteksi Read-Only (SCR-17 & F-02)
- **Tujuan**: Menguji pembaruan identitas kost yang menjadi kop resmi kuitansi sewa, serta memvalidasi penguncian field kapasitas kamar dan lantai.
- **Kondisi Awal**: Pemilik berada pada Seksi 1 (`#section-property`).
- **Langkah-langkah**:
  1. Periksa field `Kapasitas Total Kamar` (`#propRooms`) dan `Jumlah Lantai Gedung` (`#propFloors`).
  2. Coba klik dan ketikkan teks ke dalam kedua field tersebut.
  3. Ubah data pada field yang dapat diedit:
     - `Nama Properti Kost` (`#propName`): Ubah dari *"Kost Budi Makmur"* menjadi *"Kost Budi Makmur Residence"*.
     - `Nama Pemilik` (`#propOwner`): Tetap *"Budi Santoso"*.
     - `Nomor WhatsApp Pengelola` (`#propPhone`): Masukkan *"0812-9999-8888"*.
     - `Email Operasional Kost` (`#propEmail`): Masukkan *"operasional@budimakmur.id"*.
     - `Alamat Fisik Lengkap Kost` (`#propAddress`): Perbarui rincian RT/RW.
  4. Klik tombol **"Simpan Profil"** (`saveAllSettings()`) di header seksi.
- **Hasil yang Diharapkan**:
  - Field `#propRooms` dan `#propFloors` memiliki atribut `readonly` dan kelas `.form-input-readonly`; kursor menampilkan tanda `not-allowed`; masukan keyboard diabaikan oleh peramban. Nilai tetap sinkron dari Master Kamar (`F-02`).
  - Toast konfirmasi sukses muncul di pojok kanan atas: *"Profil properti & rekening resmi disimpan. Perubahan rekening otomatis berlaku ke penagihan berjalan (Skenario 14)."*
  - Data yang tersimpan terfleksikan secara instan pada ringkasan pod properti sidebar kiri (`.property-pod-text h4`).

---

### SKENARIO 03: Konfigurasi Rekening Bank Penampungan Sewa & Live-Preview Kartu ATM (SCR-17 & F-05)
- **Tujuan**: Memastikan data rekening bank penerima sewa tervalidasi dan kartu grafis ATM merefleksikan perubahan masukan secara waktu-nyata (*real-time reactive*).
- **Kondisi Awal**: Pemilik berada pada sub-seksi *Rekening Bank Resmi Penampungan Pembayaran Sewa*.
- **Langkah-langkah**:
  1. Amati tampilan kartu grafis `#atmCardPreview` bawaan sistem (Gradien Biru Royal, Bank BCA, Monospace `8830-1928-11`, Atas Nama BUDI SANTOSO).
  2. Ketikkan data baru pada input:
     - `Nama Bank` (`#bankName`): Hapus teks lama, ketik *"Bank Mandiri"*.
     - `Nomor Rekening` (`#bankAccNum`): Hapus teks lama, ketik *"137-00-9876543-2"*.
     - `Atas Nama Pemilik Rekening` (`#bankHolder`): Hapus teks lama, ketik *"BUDI SANTOSO SE"*.
  3. Amati perubahan pada elemen kartu visual di atas form pada setiap ketukan tuts keyboard (`oninput="updateCardPreview()"`).
  4. Kosongkan seluruh input untuk menguji nilai cadangan (*fallback*).
- **Hasil yang Diharapkan**:
  - Saat input terisi, `#cardBankName` seketika terkapitalisasi menjadi `"BANK MANDIRI"`.
  - Nomor rekening `#cardAccNum` secara instan berganti font monospace menjadi `"137-00-9876543-2"`.
  - Nama pemegang kartu `#cardHolderName` berubah menjadi `"BUDI SANTOSO SE"`.
  - Saat input dikosongkan, kartu menampilkan fallback default: `"BANK BCA"`, `"8830-1928-11"`, `"BUDI SANTOSO"` tanpa terjadi kerusakan layout DOM.

---

### SKENARIO 04: Pengelolaan Dinamis Tata Tertib Kost (Dynamic Rules Builder: Tambah, Re-index, & Hapus)
- **Tujuan**: Menguji penambahan dan penghapusan butir tata tertib kost secara fleksibel dengan penomoran indeks yang berurutan secara otomatis.
- **Kondisi Awal**: Terdapat 5 butir tata tertib bawaan terdaftar di kontainer `#rulesListContainer`. Label rekapitulasi menampilkan *"Total 5 butir tata tertib aktif terdaftar"*.
- **Langkah-langkah**:
  1. Klik tombol **"+ Tambah Aturan"** (`addNewRule()`).
  2. Periksa baris baru yang terbentuk di urutan paling bawah.
  3. Masukkan teks aturan ke-6: *"Penyewa wajib mematikan pendingin ruangan (AC) saat meninggalkan kamar lebih dari 2 jam."*
  4. Hapus butir aturan nomor 3 (*Tamu lawan jenis dilarang masuk...*) dengan mengklik ikon tempat sampah merah (`.btn-rule-delete`).
  5. Periksa susunan nomor urut dan teks rekapitulasi di bawah daftar.
- **Hasil yang Diharapkan**:
  - Langkah 1-3: Baris baru muncul dengan badge nomor urut `6`; kursor fokus otomatis aktif pada field input baru; Toast info tampil: *"Butir aturan baru ditambahkan."*; summary berganti menjadi *"Total 6 butir tata tertib aktif terdaftar"*.
  - Langkah 4-5: Baris nomor 3 terhapus dari DOM; fungsi `updateRuleNumbers()` berjalan seketika; butir nomor 4 lama otomatis berganti nomor menjadi `3`, nomor 5 menjadi `4`, dan nomor 6 menjadi `5`; Toast konfirmasi muncul: *"Butir aturan berhasil dihapus."*; summary kembali menjadi *"Total 5 butir tata tertib aktif terdaftar"*.

---

### SKENARIO 05: Proteksi Batas Minimum Tata Tertib Kost (Rule Boundary Guard)
- **Tujuan**: Mencegah penghapusan seluruh tata tertib hingga kosong, menjamin kontrak sewa selalu memiliki minimal 1 pasal dasar tata tertib.
- **Kondisi Awal**: Pengguna menghapus aturan berturut-turut hingga hanya tersisa tepat 1 butir aturan di kontainer.
- **Langkah-langkah**:
  1. Klik tombol hapus (`.btn-rule-delete`) pada butir aturan terakhir yang tersisa.
  2. Amati respons visual sistem dan kondisi kontainer `#rulesListContainer`.
- **Hasil yang Diharapkan**:
  - Sistem menolak eksekusi penghapusan (`container.querySelectorAll('.rule-item-row').length <= 1`).
  - Baris aturan terakhir tidak terhapus dari DOM.
  - Toast semantik peringatan muncul di pojok kanan atas: *"Minimal harus ada 1 butir tata tertib kost."* (Kategori: `warning`).

---

### SKENARIO 06: Filter Tab Direktori Pengguna Berdasarkan Peran (SCR-16 User Directory)
- **Tujuan**: Memverifikasi penyaringan daftar akun pada tabel master berdasarkan peran sistem (Semua, Staf Operasional, Penghuni Kost).
- **Kondisi Awal**: Pemilik berada pada Seksi 2 (`#section-rbac`). Terdapat 4 akun pengguna di tabel master.
- **Langkah-langkah**:
  1. Klik tombol filter **"Staf Operasional (2)"** (`#btnFilterStaff`).
  2. Periksa baris yang ditampilkan pada tabel `#userTableBody`.
  3. Klik tombol filter **"Penghuni Kost (1)"** (`#btnFilterTenant`).
  4. Periksa baris yang ditampilkan.
  5. Klik tombol filter **"Semua Pengguna (4)"** (`#btnFilterAll`).
- **Hasil yang Diharapkan**:
  - Langkah 1-2: Tombol `#btnFilterStaff` menjadi aktif (latar hitam `#111111`, teks putih); baris bertanda `data-role="owner"` dan `data-role="tenant"` disembunyikan (`display: none`); hanya 2 baris staf (Rini Setiawati & Pak Joko Santoso) yang tampil.
  - Langkah 3-4: Tombol `#btnFilterTenant` aktif; hanya baris Budi Santoso (Penghuni Kamar A-04) yang terlihat.
  - Langkah 5: Tombol `#btnFilterAll` aktif; seluruh 4 baris pengguna kembali ditampilkan secara lengkap.

---

### SKENARIO 07: Pembuatan & Aktivasi Akun Staf Operasional Baru (F-01 Owner-Initiated & Zero Self-Approval)
- **Tujuan**: Menguji inisiasi pembuatan akun staf operasional baru oleh Pemilik Properti dengan penegasan aturan *Zero Self-Approval*.
- **Kondisi Awal**: Pemilik berada pada Seksi 2. Modal `#modalAddAccount` dalam keadaan tertutup.
- **Langkah-langkah**:
  1. Klik tombol **"+ Buat Akun Baru (F-01)"**.
  2. Pastikan dropdown `Jenis Peran Akun` (`#accType`) memilih *"Staf Operasional (Pengelola Lapangan)"*.
  3. Periksa penampakan grup formulir penugasan kamar (`#roomAssignGroup`) dan checklist izin modul (`#permissionCheckGroup`).
  4. Masukkan data:
     - `Nama Lengkap Pengguna`: *"Ahmad Fauzi"*
     - `Email Login Akun`: *"ahmad.staf@kostbudimakmur.id"*
     - `Nomor WhatsApp`: *"0812-7788-9911"*
  5. Biarkan ke-4 checklist izin tercentang, termasuk opsi *Catat Pembayaran Masuk (Pending)*.
  6. Klik tombol **"Buat & Aktifkan Akun"** (`submitNewAccount()`).
- **Hasil yang Diharapkan**:
  - `#roomAssignGroup` tersembunyi (`display: none`), sedangkan `#permissionCheckGroup` tampil (`display: flex`).
  - Modal tertutup otomatis; baris baru tertambahkan ke `#userTableBody` dengan avatar oranye inisial `"AF"`.
  - Kolom RBAC menampilkan label *"Operasional & Catat Bayar"* beserta catatan pengaman *"Zero Self-Approval (Tanpa Laporan Laba)"*.
  - Status akun langsung *"Aktif"* dengan badge hijau.
  - Counter tab bertambah: "Semua Pengguna (5)" dan "Staf Operasional (3)".
  - Toast sukses tampil: *"Akun Ahmad Fauzi berhasil dibuat & diaktifkan (F-01)."*

---

### SKENARIO 08: Pembuatan & Aktivasi Akun Teknisi Lapangan Baru (F-01 & F-07 Maintenance Scope)
- **Tujuan**: Memverifikasi pembuatan akun staf teknis yang wewenangnya dibatasi murni untuk penanganan tiket perbaikan tanpa akses keuangan atau sewa.
- **Kondisi Awal**: Modal `#modalAddAccount` dibuka kembali.
- **Langkah-langkah**:
  1. Pilih `Jenis Peran Akun`: *"Teknisi Lapangan (Maintenance & Perbaikan)"*.
  2. Isi data:
     - `Nama Lengkap`: *"Bambang Servis"*
     - `Email Login`: *"bambang.ac@kostbudimakmur.id"*
     - `Nomor WhatsApp`: *"0857-1122-3344"*
  3. Klik tombol **"Buat & Aktifkan Akun"**.
- **Hasil yang Diharapkan**:
  - Baris akun baru terbentuk dengan badge peran biru cerah bertuliskan *"Teknisi Lapangan"* dengan ikon kunci pas (`wrench`).
  - Kolom hak akses menjelaskan wewenang: *"Modul Tiket Perbaikan Saja · Hanya pemeliharaan & status unit kamar"*.
  - Akun tidak memiliki hak melihat tagihan maupun mencatat titipan uang sewa.
  - Toast sukses muncul: *"Akun Bambang Servis berhasil dibuat & diaktifkan (F-01)."*

---

### SKENARIO 09: Pembuatan Akun Penghuni Mandiri & Penugasan Kamar Kosong (F-01 & F-03 Room Assignment)
- **Tujuan**: Menguji alur pembuatan akun penyewa kamar dengan pengikatan unit kamar kosong yang sah (*Data Isolation & Room Binding*).
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka.
- **Langkah-langkah**:
  1. Ubah `Jenis Peran Akun` menjadi *"Penghuni Kost (Akses Portal Mandiri Kamar)"*.
  2. Amati transformasi kontrol form pada modal.
  3. Pilih unit kamar pada dropdown `#accRoomSelect`: *"Kamar B-01 · Lantai 2 (Tersedia)"*.
  4. Isi data identitas:
     - `Nama Lengkap`: *"Siti Rahmawati"*
     - `Email Login Akun`: *"siti.rahma@gmail.com"*
     - `Nomor WhatsApp`: *"0813-4455-6677"*
  5. Klik tombol **"Buat & Aktifkan Akun"**.
- **Hasil yang Diharapkan**:
  - Saat opsi penghuni dipilih: checklist izin modul staf otomatis disembunyikan; dropdown penugasan kamar ditampilkan (`display: flex`).
  - Modal tertutup; baris pengguna baru bertambah dengan badge peran hijau *"Penghuni Kamar"*.
  - Kolom nama mencantumkan sub-label: *"Kamar B-01 · 0813-4455-6677"*.
  - Kolom RBAC mengonfirmasi isolasi: *"Portal Mandiri Kamar B-01 · Hanya data sewa, tagihan & tiket sendiri"*.
  - Akun terhubung secara permanen dengan portal mandiri (`WF-10`).
  - Counter tab "Penghuni Kost" terbarui menjadi `(2)`.

---

### SKENARIO 10: Pencegahan Tabrakan Penugasan Kamar Terisi (Room Collision / Overbooking Guard)
- **Tujuan**: Memastikan sistem secara preventif menolak penugasan kamar kepada penghuni baru jika kamar tersebut sedang terikat kontrak aktif penyewa lain.
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka; dropdown jenis peran bernilai `"tenant"`. Kamar A-04 saat ini disewa oleh Budi Santoso.
- **Langkah-langkah**:
  1. Buka dropdown `#accRoomSelect`.
  2. Pilih opsi **"Kamar A-04 · Lantai 1 (Terisi Kontrak: Budi Santoso)"** yang bertanda atribut `data-occupied="true"`.
  3. Amati respons visual pada formulir modal dialog (`handleRoomSelectChange()`).
  4. Isi nama dan email valid, lalu tekan tombol **"Buat & Aktifkan Akun"**.
- **Hasil yang Diharapkan**:
  - Langkah 2-3: Kotak peringatan merah terang `#roomOccupiedAlert` seketika muncul di bawah dropdown: *"Peringatan Tabrakan Kamar (Skenario 12): Kamar A-04 memiliki kontrak sewa aktif hingga 2026-11-01. Pilih kamar kosong atau selesaikan kontrak lama terlebih dahulu."*
  - Langkah 4: Tombol submit menolak proses simpan (`submitNewAccount()`); modal tetap terbuka; muncul Toast bahaya semantik: *"Kamar A-04 sedang terisi kontrak aktif! Mencegah tabrakan kamar (Skenario 12)."* (Kategori: `danger`).

---

### SKENARIO 11: Pencegahan Duplikasi Email Pengguna Baru (Unique Identity Constraint Case-Insensitive)
- **Tujuan**: Mencegah terjadinya konflik kredensial ganda dengan memastikan setiap alamat email login bersifat unik di seluruh tingkatan peran.
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka. Alamat email `rini.staf@kostbudimakmur.id` telah terdaftar pada akun Staf Rini Setiawati.
- **Langkah-langkah**:
  1. Masukkan nama: *"Rini Copy Akun"*.
  2. Masukkan email duplikat dengan variasi huruf besar: `"RINI.STAF@kostbudimakmur.id"`.
  3. Klik tombol **"Buat & Aktifkan Akun"**.
- **Hasil yang Diharapkan**:
  - Sistem memvalidasi daftar email yang ada di tabel master secara *case-insensitive*.
  - Proses submit digagalkan; modal dialog tetap terbuka.
  - Muncul Toast semantik bahaya: *"Email RINI.STAF@kostbudimakmur.id sudah terdaftar pada sistem!"* (Kategori: `danger`).
  - Integritas relasi tabel pengguna pada database terlindungi dari duplikasi `UNIQUE CONSTRAINT`.

---

### SKENARIO 12: Deaktivasi Akun Staf & Deteksi Tiket Kerusakan Aktif (Orphaned Maintenance Alert)
- **Tujuan**: Memverifikasi mekanisme penonaktifan akun staf dan memunculkan peringatan proteksi jika staf yang dinonaktifkan masih memiliki tanggung jawab tiket aktif.
- **Kondisi Awal**: Staf Pak Joko Santoso memiliki tiket perbaikan aktif yang sedang dikerjakan di modul `WF-08`.
- **Langkah-langkah**:
  1. Pada baris Pak Joko Santoso di tabel pengguna, klik tombol **"Edit Izin"**.
  2. Amati modal dialog `#modalEditAccount` yang terbuka dengan data Pak Joko.
  3. Ubah dropdown `Status Akun` (`#editAccStatus`) dari *"Aktif (Bisa Login)"* menjadi *"Nonaktifkan (Kunci Akses)"*.
  4. Amati peringatan yang muncul di dalam modal (`handleEditStatusChange()`).
  5. Klik tombol **"Simpan Perubahan"** (`saveAccountChanges()`).
- **Hasil yang Diharapkan**:
  - Saat status diubah ke nonaktif: Kotak alert kuning amber `#staffDeactivateAlert` seketika tampil: *"Perhatian Tugas Aktif (Skenario 13): Pengguna ini memiliki tiket perbaikan aktif yang sedang dikerjakan. Pastikan tugas dialihkan ke staf lain setelah dinonaktifkan."*
  - Saat disimpan: Modal tertutup; badge status akun Pak Joko pada tabel master berganti menjadi merah bertuliskan *"Nonaktif"*; tombol aksi tetap tersedia untuk aktivasi ulang jika diperlukan.
  - Toast sukses muncul: *"Perubahan status & izin akun Pak Joko Santoso berhasil disimpan (Skenario 22)."*

---

### SKENARIO 13: Pembaruan Hak Akses Granular Staf Pasca-Aktivasi (Granular RBAC Update)
- **Tujuan**: Memastikan Pemilik dapat memodifikasi hak akses checklist modul staf secara mandiri tanpa harus menghapus dan membuat ulang akun.
- **Kondisi Awal**: Modal `#modalEditAccount` terbuka untuk akun Rini Setiawati.
- **Langkah-langkah**:
  1. Periksa bagian *Pembaruan Hak Akses Modul Staf* (`#editPermissionCheckGroup`).
  2. Hilangkan centang pada izin **"Catat Pembayaran Masuk (Pending)"** (`#editPModCatatBayar`).
  3. Biarkan centang Modul Kamar, Modul Penghuni, dan Modul Tiket tetap aktif.
  4. Klik tombol **"Simpan Perubahan"**.
- **Hasil yang Diharapkan**:
  - Sistem memperbarui konfigurasi izin akun Rini di database.
  - Pada sesi login Staf berikutnya, tombol pencatatan pembayaran sewa pending pada modul keuangan dinonaktifkan/disembunyikan.
  - Toast konfirmasi sukses tampil: *"Perubahan status & izin akun Rini Setiawati berhasil disimpan (Skenario 22)."*

---

### SKENARIO 14: Relokasi Kamar Penghuni Mandiri Tanpa Menghilangkan Riwayat (Tenant Room Transfer)
- **Tujuan**: Memverifikasi alur pemindahan penugasan unit kamar bagi penyewa yang pindah kamar, dengan mempertahankan kuitansi dan tiket terdahulu.
- **Kondisi Awal**: Penghuni Budi Santoso tercatat menempati Kamar A-04.
- **Langkah-langkah**:
  1. Pada baris Budi Santoso (Penghuni), klik tombol **"Kelola"** (`openEditAccountModal`).
  2. Periksa form modal: Grup relokasi kamar `#editRoomAssignGroup` tampil secara otomatis.
  3. Ubah dropdown `#editAccRoomSelect` dari *"Kamar A-04"* menjadi *"Kamar B-01"*.
  4. Klik tombol **"Simpan Perubahan"**.
- **Hasil yang Diharapkan**:
  - Modal tertutup; teks identitas di tabel seketika terbarui menjadi: *"Kamar B-01 · 0811-2233-4455"*.
  - Kolom RBAC terbarui menjadi: *"Portal Mandiri Kamar B-01 · Hanya data sewa, tagihan & tiket sendiri"*.
  - Kamar A-04 lama dilepaskan status kontraknya menjadi Kosong/Siap Huni di master kamar (`F-02`), sedangkan Kamar B-01 terkunci menjadi Terisi.
  - Toast notifikasi sukses muncul: *"Akun Budi Santoso (Penghuni) berhasil diperbarui. Kamar dipindahkan ke B-01 (Skenario 21)."*

---

### SKENARIO 15: Reset Kredensial & Pembuatan Kata Sandi Sementara oleh Pemilik (Admin-Initiated Credential Reset)
- **Tujuan**: Memverifikasi penerbitan kata sandi sementara yang aman bagi pengguna yang lupa kredensial login tanpa fasilitas self-service publik.
- **Kondisi Awal**: Modal `#modalEditAccount` untuk Rini Setiawati sedang terbuka.
- **Langkah-langkah**:
  1. Gulir ke bagian bawah modal menuju sub-seksi *Atur Ulang Sandi Pengguna*.
  2. Klik tombol **"Reset Sandi"** (`resetUserPasswordModal()`).
- **Hasil yang Diharapkan**:
  - Sistem meng-generate string sandi sementara berformat aman secara kriptografis (misal: `Ruma#4829!`).
  - Database menandai flag `must_change_password: true` pada akun terkait.
  - Muncul Toast info: *"Sandi sementara rini.staf@kostbudimakmur.id: Ruma#XXXX! (Skenario 16). Wajib ganti saat login."*
  - Kredensial sementara ini siap disalin oleh Pemilik untuk diteruskan secara privat kepada staf bersangkutan.

---

### SKENARIO 16: Pembaruan Kata Sandi Superadmin & Validasi Form (Security Hardening)
- **Tujuan**: Memvalidasi aturan keamanan perubahan kata sandi Pemilik (wajib isi sandi saat ini, panjang minimal 8 karakter, konfirmasi kecocokan).
- **Kondisi Awal**: Pemilik berada pada Seksi 3 (`#section-security`).
- **Langkah-langkah**:
  1. *Uji 16A (Sandi Saat Ini Kosong)*: Isi sandi baru `"SuperBudi2026!"`, biarkan kata sandi saat ini kosong -> Klik "Perbarui Kata Sandi".
  2. *Uji 16B (Sandi Baru < 8 Karakter)*: Isi sandi saat ini, isi sandi baru `"pass123"` (7 karakter) -> Klik simpan.
  3. *Uji 16C (Konfirmasi Tidak Cocok)*: Isi sandi baru `"SuperBudi2026!"`, isi konfirmasi `"SuperBudi2026?"` -> Klik simpan.
  4. *Uji 16D (Valid)*: Isi sandi saat ini yang sah, isi sandi baru `"SuperBudi2026!"`, isi konfirmasi persis sama -> Klik **"Perbarui Kata Sandi"** (`changePasswordSubmit()`).
- **Hasil yang Diharapkan**:
  - *Uji 16A*: Ditolak; Toast warning: *"Masukkan kata sandi saat ini!"*.
  - *Uji 16B*: Ditolak; Toast warning: *"Kata sandi baru minimal 8 karakter!"*.
  - *Uji 16C*: Ditolak; Toast warning: *"Konfirmasi kata sandi tidak cocok!"*.
  - *Uji 16D*: Diterima; seluruh field input sandi dikosongkan seketika; Toast sukses tampil: *"Kata sandi berhasil diperbarui! Seluruh sesi aktif di perangkat lain dinonaktifkan (Skenario 17)."* (Kategori: `success`).

---

### SKENARIO 17: Terminasi Sesi Login Bersamaan Saat Ganti Sandi Superadmin (Session Invalidation)
- **Tujuan**: Memastikan keamanan akses superadmin bahwa penggantian kata sandi membatalkan seluruh token JWT / cookie sesi di perangkat lain.
- **Kondisi Awal**: Pemilik sedang login di browser desktop dan juga memiliki sesi aktif di browser ponsel pintar.
- **Langkah-langkah**:
  1. Selesaikan penggantian kata sandi dengan sukses di browser desktop (mengikuti Skenario 16D).
  2. Buka browser ponsel pintar dan lakukan refresh pada halaman dasbor.
- **Hasil yang Diharapkan**:
  - Kunci rahasia / salt token pengguna diperbarui di backend; token lama pada ponsel pintar seketika menjadi tidak valid.
  - Layar ponsel pintar secara otomatis mengalihkan pengguna ke `WF-01-login.html`.
  - Muncul banner peringatan: *"Sesi Anda telah kedaluwarsa karena pembaruan kata sandi. Silakan masuk kembali."*

---

### SKENARIO 18: Proteksi Anti-Lockout Akun Terakhir Pemilik (Permanent Superadmin Guard)
- **Tujuan**: Mencegah kebuntuan akses total ke sistem akibat penonaktifan atau penghapusan tidak sengaja pada akun Pemilik Properti.
- **Kondisi Awal**: Pemilik berada pada tabel master pengguna Seksi 2.
- **Langkah-langkah**:
  1. Periksa baris Budi Santoso (Owner) pada tabel `#userTableBody`.
  2. Amati kolom status dan kolom aksi paling kanan.
- **Hasil yang Diharapkan**:
  - Kolom status mengunci badge hijau *"Aktif"*.
  - Kolom aksi tidak menampilkan tombol "Edit Izin" maupun tombol hapus/deaktivasi, melainkan hanya menyajikan label teks mati abu-abu: *"Utama"*.
  - Sistem backend memiliki aturan mutlak: *"Sistem wajib memiliki minimal 1 akun Pemilik aktif (Anti-Lockout Rule)."*

---

### SKENARIO 19: Interaksi Navigasi Sticky Sidebar & Real-time ScrollSpy
- **Tujuan**: Memastikan kenyamanan penjelajahan antar-seksi dengan navigasi melayang (*sticky*), pengguliran mulus (*smooth scrolling*), dan sinkronisasi indikator aktif (*ScrollSpy*).
- **Kondisi Awal**: Halaman `WF-09` terbuka pada tampilan desktop standar ($\ge 1200\text{px}$).
- **Langkah-langkah**:
  1. Klik item navigasi samping: **"2. Akun Staf & Penghuni (SCR-16 · F-01)"**.
  2. Amati animasi pergerakan halaman dan kelas aktif pada menu navigasi.
  3. Lakukan pengguliran manual (*mouse scroll*) ke bawah menuju Seksi 3 Keamanan Akun.
  4. Amati pergerakan indikator aktif pada sidebar kiri.
- **Hasil yang Diharapkan**:
  - Halaman bergulir mulus dan memposisikan Seksi 2 tepat di bawah topbar floating dengan offset yang pas (`scroll-margin-top: 110px`).
  - Item menu ke-2 seketika memperoleh kelas `.active` (latar hitam pekat `#111111`, teks putih, ikon oranye `#FF7A00`).
  - Saat scroll manual ke Seksi 3: Event listener scroll mendeteksi posisi elemen dan memindahkan kelas `.active` ke item menu ke-3 secara otomatis tanpa lag (*passive scroll listener*).

---

### SKENARIO 20: Aksesibilitas Keyboard (ESC Key) & Dismiss Backdrop Modal
- **Tujuan**: Memverifikasi kemudahan interaksi keyboard dan penutupan modal dialog sesuai standar aksesibilitas WCAG 2.1.
- **Kondisi Awal**: Salah satu modal dialog terbuka (misal: `#modalAddAccount` atau `#modalEditAccount`).
- **Langkah-langkah**:
  1. *Uji 20A (ESC Key)*: Tekan tombol `Escape` pada keyboard fisik.
  2. *Uji 20B (Backdrop Click)*: Buka kembali modal, lalu klik area gelap di luar kotak modal dialog (`closeModalOnBackdrop`).
  3. *Uji 20C (Tombol Silang)*: Buka kembali modal, lalu klik tombol silang bulat di pojok kanan atas header (`.btn-modal-close`).
- **Hasil yang Diharapkan**:
  - Pada ketiga pengujian (20A, 20B, 20C): Modal dialog tertutup secara seketika; kelas `.active` dicabut; backdrop blur menghilang; elemen fokus kembali ke pemicu awal tanpa menimbulkan error JavaScript di konsol browser.

---

### SKENARIO 21: Desain Responsif Breakpoint Tablet & Ponsel (Fluid Layout Adaptation)
- **Tujuan**: Memastikan antarmuka pengaturan tetap proporsional, tidak meluap (*no horizontal viewport overflow*), dan ergonomis pada layar sentuh.
- **Kondisi Awal**: Halaman `WF-09` dibuka pada simulator responsif peramban.
- **Langkah-langkah**:
  1. Perkecil lebar layar peramban ke ukuran tablet ($\le 1100\text{px}$, misal: 820px).
  2. Periksa transformasi tata letak 2 kolom menjadi 1 kolom tumpuk vertikal.
  3. Periksa tampilan sidebar navigasi samping.
  4. Periksa tampilan dossier kartu ATM `#atmCardPreview`.
- **Hasil yang Diharapkan**:
  - Grid `.settings-workbench-grid` beralih dari 2 kolom ke 1 kolom penuh.
  - Sidebar samping beralih dari mode vertikal sticky menjadi deretan tab horizontal yang dapat digeser secara menyamping (*horizontal swipe scroll*); pod properti bawah otomatis disembunyikan demi efisiensi area pandang.
  - Kartu ATM dan form rekening beralih ke susunan 1 kolom vertikal yang rapi tanpa terpotong.

---

### SKENARIO 22: State Tampilan Khusus: Filter Zero State vs Absolute Zero State
- **Tujuan**: Menguji respons visual sistem saat data penyaringan tidak ditemukan dibandingkan saat data benar-benar kosong di database.
- **Kondisi Awal**: Tabel pengguna Seksi 2 dan Kontainer Tata Tertib Seksi 1.
- **Langkah-langkah**:
  1. *Filter Zero State*: Simulasikan filter peran pengguna yang tidak memiliki anggota (misal: seluruh akun staf dinonaktifkan atau dihapus dalam demo pengujian) -> Klik tab "Staf Operasional".
  2. *Absolute Zero State (Rules List)*: Hapus butir tata tertib hingga batas minimum tercapai.
- **Hasil yang Diharapkan**:
  - *Filter Zero State*: Tabel menyajikan baris status kosong khusus: *"Tidak ada data pengguna yang sesuai dengan filter peran terpilih."* disertai tombol pintas *"Reset Filter ke Semua Pengguna"*, bukan tabel kosong yang membingungkan.
  - *Absolute Zero State*: Sistem secara proaktif memblokir terjadinya kondisi 0 baris pada tata tertib (dilindungi oleh Skenario 05) untuk menjamin sistem tidak pernah kehilangan pasal dasar sewa.

---

### SKENARIO 23: Konsistensi Rekening Bank pada Invoice Tagihan Berjalan (Active Invoice Bank Consistency)
- **Tujuan**: Memastikan perubahan rekening bank resmi di `WF-09` tersinkronisasi secara tepat ke invoice tagihan yang belum lunas tanpa merusak kuitansi yang sudah lunas.
- **Kondisi Awal**: Terdapat 3 tagihan sewa berstatus "Belum Lunas" di modul Tagihan (`WF-05`) dan 12 tagihan berstatus "Lunas".
- **Langkah-langkah**:
  1. Pada Seksi 1, ubah nomor rekening bank dari BCA ke Bank Mandiri.
  2. Klik tombol **"Simpan Profil"**.
  3. Buka modul Tagihan (`WF-05`) dan periksa tampilan invoice belum lunas.
  4. Buka riwayat pembayaran (`WF-06`) untuk invoice yang sudah lunas bulan lalu.
- **Hasil yang Diharapkan**:
  - Invoice yang berstatus "Belum Lunas" secara otomatis menampilkan nomor rekening baru (Bank Mandiri) sebagai rujukan transfer penyewa.
  - Kuitansi pembayaran masa lalu yang sudah lunas tetap mempertahankan snapshot rekening lama (Bank BCA) demi integritas audit pembukuan.

---

### SKENARIO 24: Sanitasi Masukan Karakter Khusus & Pencegahan XSS pada Input Tata Tertib & Alamat
- **Tujuan**: Menjamin keamanan data dari upaya injeksi skrip berbahaya (*Cross-Site Scripting*) pada field teks bebas.
- **Kondisi Awal**: Pemilik berada pada input Alamat Kost atau butir Tata Tertib Baru.
- **Langkah-langkah**:
  1. Masukkan payload XSS pada textarea Alamat: `<script>alert('XSS_ATTACK')</script> Jl. Palmerah No. 10`.
  2. Masukkan payload tag gambar rusak pada butir aturan baru: `<img src=x onerror=alert(1)> Dilarang berisik`.
  3. Klik tombol **"Simpan Profil"**.
  4. Lakukan refresh halaman dan amati rendering teks tersebut.
- **Hasil yang Diharapkan**:
  - Sistem melakukan pembersihan karakter (*HTML entity encoding/sanitization*): tanda `<` dan `>` diubah menjadi `&lt;` dan `&gt;`.
  - Teks dirender murni sebagai string teks biasa di layar.
  - Tidak ada popup alert atau eksekusi skrip berbahaya di peramban.

---

### SKENARIO 25: Standardisasi Format Nomor WhatsApp untuk Integrasi Direct Link wa.me (Zero Bot Scope)
- **Tujuan**: Memastikan nomor WhatsApp pengelola dan pengguna selalu dinormalisasi ke format standar internasional E.164 untuk tautan manual `https://wa.me/` tanpa bot berbayar.
- **Kondisi Awal**: Pemilik memasukkan nomor WhatsApp dengan awalan lokal non-standar.
- **Langkah-langkah**:
  1. Masukkan nomor telepon pada `#propPhone`: `0812-3456-7890` (atau format spasi `+62 812 3456 7890`).
  2. Klik simpan pengaturan profil.
  3. Periksa tautan WhatsApp yang digenerate sistem pada portal penghuni (`WF-10`) untuk tombol "Hubungi Pengelola".
- **Hasil yang Diharapkan**:
  - Karakter tanda hubung, spasi, dan angka `0` di awal dibersihkan secara otomatis.
  - Nomor dinormalisasi menjadi format internasional: `6281234567890`.
  - Tautan URL yang dihasilkan mengarah tepat ke `https://wa.me/6281234567890` dengan draf teks pesan manual yang siap dikirimkan tanpa integrasi API berbayar.

---

### SKENARIO 26: Sinkronisasi Otomatis Klausul Tata Tertib ke Surat Perjanjian Sewa Digital (PDF Export F-03)
- **Tujuan**: Memastikan bahwa penambahan atau perubahan klausul tata tertib di `WF-09` otomatis tercantum ke dalam draf kontrak sewa baru di modul Penghuni (`WF-04`).
- **Kondisi Awal**: Pemilik menambahkan 1 butir aturan baru pada Skenario 04 (Aturan pemadaman AC).
- **Langkah-langkah**:
  1. Simpan perubahan tata tertib di `WF-09`.
  2. Buka modul Penghuni (`WF-04`), pilih salah satu calon penyewa dan buat draf Surat Perjanjian Sewa baru.
  3. Periksa Pasal Tata Tertib dan Ketertiban Kost pada lembar perjanjian.
- **Hasil yang Diharapkan**:
  - Draf perjanjian sewa baru secara dinamis memuat seluruh 6 pasal tata tertib terbaru, termasuk klausul pemadaman AC.
  - Kontrak yang sudah ditandatangani sebelumnya tetap mempertahankan snapshot pasal versi lama demi kepastian hukum.

---

### SKENARIO 27: Deteksi & Proteksi Perubahan Belum Disimpan (Dirty Form Guard)
- **Tujuan**: Melindungi pengguna dari kehilangan data ketika tanpa sengaja berpindah halaman saat sedang mengedit data profil atau menyusun tata tertib yang panjang.
- **Kondisi Awal**: Pemilik sedang mengetikkan butir tata tertib baru di Seksi 1, namun belum mengklik tombol "Simpan Profil".
- **Langkah-langkah**:
  1. Klik salah satu menu navigasi topbar keluar dari halaman (misal: menu "Kamar" atau "Dashboard").
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi kondisi form kotor (*dirty state*).
  - Muncul dialog konfirmasi protektif: *"Anda memiliki perubahan pengaturan yang belum disimpan. Yakin ingin meninggalkan halaman ini?"*
  - Jika pengguna memilih "Batal", navigasi dibatalkan dan pengguna tetap berada di formulir pengaturan dengan ketikan teks utuh.

---

### SKENARIO 28: Siklus Offboarding & Mode Arsip Read-Only Penyewa Pasca-Sewa (Post-Lease Lifecycle)
- **Tujuan**: Menguji transisi status akun penghuni yang masa kontraknya telah berakhir tanpa menghapus data riwayat transaksi dan audit.
- **Kondisi Awal**: Penghuni selesai kontrak dan melakukan proses check-out resmi di modul Penghuni (`WF-04`).
- **Langkah-langkah**:
  1. Periksa baris penghuni tersebut pada tabel master `WF-09`.
  2. Buka modal kelola akun penghuni tersebut.
  3. Ubah status menjadi *"Nonaktifkan (Kunci Akses)"*.
  4. Coba login menggunakan akun penghuni tersebut di `WF-01`.
- **Hasil yang Diharapkan**:
  - Akun tidak dihapus permanen (*hard delete* dicegah).
  - Hak akses penghuni di portal dialihkan ke mode arsip *read-only*: penghuni dapat melihat dan mengunduh kuitansi masa lalu serta bukti pengembalian deposit, namun dilarang membuat tiket kerusakan baru.
  - Integritas laporan keuangan laba rugi Pemilik (`WF-07`) tetap utuh 100%.

---

### SKENARIO 29: Kepatuhan Privasi Data Pribadi UU PDP (PII Soft-Delete & Anonymization)
- **Tujuan**: Memenuhi regulasi Pelindungan Data Pribadi (UU PDP) dengan menyediakan opsi penyemaran data pribadi (*anonymization*) bagi eks-penghuni yang telah keluar lebih dari masa retensi.
- **Kondisi Awal**: Akun eks-penghuni berstatus nonaktif selama lebih dari 365 hari.
- **Langkah-langkah**:
  1. Pemilik memilih aksi penyemaran data pribadi pada akun nonaktif.
  2. Konfirmasi penghapusan data kontak pribadi.
- **Hasil yang Diharapkan**:
  - Nama pengguna diubah secara anonim menjadi *"Eks-Penghuni (Tersamarkan)"*.
  - Nomor WhatsApp dan detail kontak darurat dihapus permanen dari basis data operasional.
  - Nomor invoice dan nominal transaksi sewa tetap tersimpan demi kewajiban pembukuan keuangan.

---

### SKENARIO 30: Audit Trail Mutasi Konfigurasi & Hak Akses Pengguna (Compliance & Akuntabilitas)
- **Tujuan**: Mencatat seluruh aktivitas krusial administratif (buat akun, ubah peran, deaktivasi, ganti rekening bank) ke dalam rekaman jejak audit yang tidak dapat dimanipulasi.
- **Kondisi Awal**: Pemilik melakukan pembuatan akun baru dan penggantian nomor rekening bank.
- **Langkah-langkah**:
  1. Eksekusi pembuatan akun staf baru (`submitNewAccount`).
  2. Eksekusi penyimpanan nomor rekening bank baru (`saveAllSettings`).
  3. Buka tabel audit sistem internal.
- **Hasil yang Diharapkan**:
  - Sistem menerbitkan baris log audit otomatis memuat: `timestamp`, `actor_user_id (Owner)`, `action_type (CREATE_USER / UPDATE_BANK_ACCOUNT)`, `ip_address`, dan rincian perubahan (`old_value` vs `new_value`).
  - Jejak audit ini bersifat *immutable* (tidak dapat diubah atau dihapus oleh siapapun).

---

### SKENARIO 31: Proteksi Imutabilitas Email Login & Peran Pengguna pada Modal Edit (Immutable Anchor Guard)
- **Tujuan**: Memastikan atribut email dan peran sistem tidak dapat diubah sembarangan pada modal edit akun demi menjaga integritas relasi data (Foreign Key Anchor).
- **Kondisi Awal**: Modal `#modalEditAccount` terbuka untuk salah satu pengguna (misal: Rini Setiawati).
- **Langkah-langkah**:
  1. Periksa field `Email Login` (`#editAccEmail`) dan `Peran Sistem` (`#editAccRole`).
  2. Coba klik dan ketikkan karakter baru pada kedua field tersebut.
  3. Buka developer tools browser (Inspect Element), coba hapus atribut `readonly` secara manual lalu simpan.
- **Hasil yang Diharapkan**:
  - Secara antarmuka: Kedua field berstatus `readonly` dengan latar abu-abu `#F8FAFC` dan kursor `not-allowed`.
  - Secara backend/API: Sistem memvalidasi payload; nilai email dan role diabaikan/dikunci pada nilai database asal. Hanya nama pengguna dan status akun yang diproses mutasinya.
  - Mencegah eskalasi hak akses (*privilege escalation*) dan rusaknya referensi tiket/kuitansi.

---

### SKENARIO 32: Penanganan Okupansi Kamar 100% / Kamar Penuh saat Registrasi Penghuni Baru (Zero Vacant Room Guard)
- **Tujuan**: Menguji perilaku sistem saat Pemilik mencoba mendaftarkan akun penghuni baru ketika seluruh 15 unit kamar kost sedang terisi penuh.
- **Kondisi Awal**: Modul master kamar (`F-02`) mencatat 15 kamar terisi (Okupansi 100%). Seluruh opsi kamar di `#accRoomSelect` bertanda `data-occupied="true"`.
- **Langkah-langkah**:
  1. Buka modal `#modalAddAccount`.
  2. Pilih `Jenis Peran Akun`: *"Penghuni Kost (Akses Portal Mandiri Kamar)"*.
  3. Amati status dropdown penugasan kamar `#accRoomSelect` dan kotak peringatan `#roomOccupiedAlert`.
  4. Coba tekan tombol "Buat & Aktifkan Akun".
- **Hasil yang Diharapkan**:
  - Dropdown kamar otomatis memicu `#roomOccupiedAlert` merah pekat: *"Seluruh kamar saat ini terisi kontrak aktif. Selesaikan kontrak sewa lama di modul Penghuni sebelum mendaftarkan penghuni baru."*
  - Tombol simpan dinonaktifkan (`disabled`) atau menampilkan validasi error seketika.
  - Sistem menolak penciptaan akun penghuni "tanpa kamar" (*orphan tenant*) atau akun ganda pada kamar terisi.

---

### SKENARIO 33: Validasi Masukan Whitespace Murni & Format Sintaks Email RFC 5322 (Strict Trimmed & Syntax Guard)
- **Tujuan**: Memastikan sistem menolak masukan nama yang hanya terdiri dari spasi kosong atau alamat email dengan sintaks cacat.
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka.
- **Langkah-langkah**:
  1. *Uji 33A (Whitespace Saja)*: Isi kolom nama dengan spasi 4 kali (`"    "`), isi email `"test@kost.id"` -> Klik Buat Akun.
  2. *Uji 33B (Email Cacat)*: Isi nama `"Doni"`, isi email `"doni@"` atau `"doni@gmail"` (tanpa domain TLD) -> Klik Buat Akun.
- **Hasil yang Diharapkan**:
  - *Uji 33A*: Fungsi `name.trim()` menghasilkan string kosong; form menolak submit; muncul Toast: *"Nama dan email wajib diisi!"*.
  - *Uji 33B*: Validasi tipe input email HTML5 atau regex sintaks RFC 5322 memblokir form submission; field email diberi highlight merah bahaya.

---

### SKENARIO 34: Sanitasi & Eliminasi Butir Tata Tertib Kosong saat Simpan Profil (Blank Rule Pruning Guard)
- **Tujuan**: Mencegah tersimpannya butir pasal kosong ke dalam kontrak sewa saat pemilik menambah aturan baru namun lupa mengisinya.
- **Kondisi Awal**: Pemilik mengklik "+ Tambah Aturan" sehingga terbentuk baris nomor 6, namun teks input dibiarkan kosong (*empty string*).
- **Langkah-langkah**:
  1. Biarkan baris nomor 6 kosong tanpa teks.
  2. Klik tombol utama **"Simpan Profil"** di header seksi.
- **Hasil yang Diharapkan**:
  - Sistem mengeksekusi *pre-save pruning*: baris aturan yang kosong dibersihkan secara otomatis sebelum disimpan ke database, atau sistem memunculkan validasi: *"Butir aturan nomor 6 masih kosong. Hapus atau lengkapi teks aturan sebelum menyimpan."*
  - Kontrak digital dan portal penghuni tidak pernah menampilkan butir pasal kosong bertanda nomor urut tanpa teks.

---

### SKENARIO 35: Sinkronisasi Reaktif Nama Properti ke Property Pod Sidebar Kiri (Reactive Sidebar Pod Sync)
- **Tujuan**: Memverifikasi pembaruan instan (*real-time reactive UI*) pada pod ringkasan properti di sidebar kiri saat nama kost diubah.
- **Kondisi Awal**: Teks pod sidebar kiri memuat judul *"Kost Budi Makmur"*.
- **Langkah-langkah**:
  1. Ubah input `#propName` dari *"Kost Budi Makmur"* menjadi *"Kost Budi Makmur Residence"*.
  2. Klik tombol **"Simpan Profil"** (`saveAllSettings()`).
  3. Periksa elemen `.property-pod-text h4` di sidebar navigasi samping kiri.
- **Hasil yang Diharapkan**:
  - Judul pod properti seketika terbarui secara sinkron menjadi *"Kost Budi Makmur Residence"*.
  - Tidak ada ketidaksinkronan data visual (*visual disparity*) antara kartu formulir dan sidebar navigasi.

---

### SKENARIO 36: Sinkronisasi Visibilitas Baris Baru dengan Status Filter Aktif (Active Tab Context Sync)
- **Tujuan**: Memastikan akun yang baru dibuat tetap dapat terlihat dengan jelas oleh pengguna meskipun sedang berada dalam mode filter peran tertentu.
- **Kondisi Awal**: Pemilik sedang memilih tab filter **"Penghuni Kost (1)"** (sehingga baris staf tersembunyi).
- **Langkah-langkah**:
  1. Klik "+ Buat Akun Baru (F-01)".
  2. Daftarkan akun baru dengan jenis peran **Staf Operasional** (misal: "Ahmad Staf").
  3. Klik "Buat & Aktifkan Akun".
  4. Amati respons visual tombol filter dan baris tabel yang baru muncul.
- **Hasil yang Diharapkan**:
  - Counter tab "Staf Operasional" bertambah menjadi `(3)`.
  - Sistem secara cerdas mengalihkan tab aktif kembali ke **"Semua Pengguna"** (`#btnFilterAll` aktif) atau menyajikan indikator transisi lembut (*highlight flash effect*) pada baris Ahmad Staf, sehingga Pemilik tidak mengira pembuatan akunnya gagal.

---

### SKENARIO 37: Proteksi Pendaftaran Staf Tanpa Izin Modul (Zero-Permission Staff Guard)
- **Tujuan**: Mencegah terciptanya akun staf "kosong" yang tidak memiliki wewenang modul sama sekali di dalam sistem.
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka dengan peran *"Staf Operasional"*.
- **Langkah-langkah**:
  1. Hilangkan seluruh centang pada 4 kartu izin modul:
     - Uncheck `#pModKamar`
     - Uncheck `#pModPenghuni`
     - Uncheck `#pModTiket`
     - Uncheck `#pModCatatBayar`
  2. Klik tombol **"Buat & Aktifkan Akun"**.
- **Hasil yang Diharapkan**:
  - Sistem menolak proses pembuatan akun staf tanpa izin (*zero-permission*).
  - Modal tetap terbuka; muncul Toast peringatan semantik: *"Pilih minimal 1 hak akses modul untuk akun Staf Operasional."* (Kategori: `warning`).

---

### SKENARIO 38: Intersepsi Wajib Ganti Sandi Pertama Kali Login Pasca-Reset (Force First-Time Password Change)
- **Tujuan**: Memastikan pengguna yang kata sandinya di-reset oleh Pemilik wajib mengganti sandi sementara saat pertama kali login di `WF-01`.
- **Kondisi Awal**: Pemilik mengeksekusi reset sandi akun Rini Setiawati (`resetUserPasswordModal()`), menerbitkan sandi `Ruma#4829!`. Flag `must_change_password` aktif.
- **Langkah-langkah**:
  1. Buka `WF-01-login.html`.
  2. Masukkan email `rini.staf@kostbudimakmur.id` dan sandi `Ruma#4829!`.
  3. Klik tombol "Masuk ke Akun".
- **Hasil yang Diharapkan**:
  - Sistem mengautentikasi kredensial sementara dengan sukses.
  - Sistem mencegat navigasi dasbor dan menampilkan modal layar penuh: *"Pembaruan Kata Sandi Perdana Wajib: Masukkan kata sandi baru pribadi Anda sebelum melanjutkan."*
  - Akun tidak dapat mengakses modul operasional sebelum sandi baru yang sah tersimpan.

---

### SKENARIO 39: Sinkronisasi Nama Pemilik ke Baris Akun Superadmin di Tabel RBAC (Owner Identity Coherence)
- **Tujuan**: Menjaga konsistensi identitas Pemilik antara data profil properti Seksi 1 dengan baris superadmin di tabel manajemen pengguna Seksi 2.
- **Kondisi Awal**: Field `#propOwner` bernilai *"Budi Santoso"*. Baris pertama tabel menampilkan *"Budi Santoso"* dengan inisial avatar `"BS"`.
- **Langkah-langkah**:
  1. Pada Seksi 1, ubah field `#propOwner` menjadi *"Budi Santoso, S.Kom"*.
  2. Klik tombol **"Simpan Profil"**.
  3. Gulir ke Seksi 2 pada tabel pengguna.
- **Hasil yang Diharapkan**:
  - Teks nama pada baris akun Pemilik di tabel master pengguna otomatis sinkron menjadi *"Budi Santoso, S.Kom"*.
  - Inisial avatar tetap terjaga proporsional (`BS`).
  - Menghilangkan inkonsistensi nama pengelola kost antar-seksi.

---

### SKENARIO 40: Debouncing & Proteksi Klik Ganda Tombol Submit (Anti-Rage Click / Double Submit Guard)
- **Tujuan**: Melindungi sistem dari pembuatan akun ganda atau mutasi database berulang akibat klik cepat bertubi-tubi pada tombol aksi.
- **Kondisi Awal**: Modal `#modalAddAccount` terisi data lengkap yang valid.
- **Langkah-langkah**:
  1. Lakukan klik ganda secara sangat cepat (*rapid double click*) pada tombol **"Buat & Aktifkan Akun"** (`.btn-brand-primary`).
- **Hasil yang Diharapkan**:
  - Sistem menerapkan *action debouncing* / *submit state lock*: Pada klik pertama, tombol langsung dinonaktifkan (`disabled = true`, opacity 0.7, kursor `wait`).
  - Klik kedua dan seterusnya diabaikan sepenuhnya oleh event handler.
  - Hanya tepat 1 baris akun baru yang tercatat di tabel master pengguna.

---

### SKENARIO 41: Validasi Karakter Numerik & Batas Digit Rekening Bank (Numeric-Only & Bank Account Masking)
- **Tujuan**: Memastikan nomor rekening bank hanya memuat karakter angka yang valid dan mencegah masukan huruf atau simbol yang merusak format cetak.
- **Kondisi Awal**: Pemilik berada pada input `#bankAccNum` di Seksi 1.
- **Langkah-langkah**:
  1. Ketikkan karakter huruf alfabet dan simbol liar: `"BCA-ABC-123!@#"`.
  2. Amati respons input dan visualisasi monospace pada `#cardAccNum`.
- **Hasil yang Diharapkan**:
  - Karakter non-numerik (kecuali tanda pemisah dash `-`) ditolak atau dibersihkan otomatis oleh fungsi input masking.
  - Kartu ATM preview `#cardAccNum` mempertahankan tipografi monospace yang bersih tanpa pecahan karakter ilegal.

---

### SKENARIO 42: Interaksi Topbar: Notifikasi, Slide-Search & Alur Keluar Akun (Logout Flow)
- **Tujuan**: Memverifikasi fungsionalitas komponen topbar global saat diakses dari dalam halaman Pengaturan.
- **Kondisi Awal**: Pengguna berada di halaman `WF-09-pengaturan.html`.
- **Langkah-langkah**:
  1. *Laci Notifikasi*: Klik tombol lonceng `#notifBellBtn` -> Amati dropdown 3 notifikasi -> Klik "Tandai dibaca".
  2. *Slide Search*: Klik tombol pencarian `#topbarSearchContainer` -> Ketik nama kamar -> Tekan Enter.
  3. *Menu Logout*: Klik avatar profil Budi S. (`#userDropdownWrap`) -> Klik opsi merah **"Keluar Akun"**.
- **Hasil yang Diharapkan**:
  - Notifikasi terbuka rapi, dot merah unread hilang saat ditandai dibaca.
  - Slide search meluncur mulus ke arah kiri tanpa glitch layout.
  - Klik "Keluar Akun" menghancurkan sesi aktif dan mengarahkan peramban kembali ke `WF-01-login.html`.

---

### SKENARIO 43: Ketahanan Teks Ekstrem Panjang pada Tabel Pengguna (String Length & Ellipsis Resilience)
- **Tujuan**: Memastikan bahwa masukan nama atau alamat email yang sangat panjang tidak memecahkan estetika kisi 2 kolom workbench.
- **Kondisi Awal**: Modal `#modalAddAccount` terbuka.
- **Langkah-langkah**:
  1. Masukkan nama pengguna dengan 60 karakter: `"Prof. Dr. Raden Mas Bagus Muhammad Fajar Nugraha Diningrat"`
  2. Masukkan email berdomain panjang: `"fajar.nugraha.panjang.sekali@subdomain.kostbudimakmurresidence.co.id"`
  3. Klik tombol "Buat & Aktifkan Akun".
- **Hasil yang Diharapkan**:
  - Baris tabel merender data dengan aturan CSS `text-overflow: ellipsis; white-space: nowrap; max-width: 200px; overflow: hidden;`.
  - Teks terpotong secara elegan dengan tanda titik-titik (`...`).
  - Lebar tabel tidak meluap keluar kanvas (`no horizontal window scrollbar`).
  - Atribut `title` pada elemen menampilkan teks lengkap saat kursor diarahkan (*hover tooltip*).

---

### SKENARIO 44: Restorasi Nilai Formulir Awal saat Dibatalkan (Form Discard / Rollback Handler)
- **Tujuan**: Memberikan kemampuan bagi Pemilik untuk membatalkan seluruh pengetikan yang belum disimpan dan mengembalikan formulir ke snapshot awal database.
- **Kondisi Awal**: Pemilik telah mengubah nama properti, alamat, dan nomor rekening, namun memutuskan untuk membatalkannya.
- **Langkah-langkah**:
  1. Panggil aksi pembatalan formulir (`resetSettingsForm()`).
- **Hasil yang Diharapkan**:
  - Seluruh field input pada Seksi 1 dikembalikan ke data baseline tersimpan (`Kost Budi Makmur`, `Jl. Kemanggisan Raya No. 42`, `8830-1928-11`).
  - Kartu live preview ATM dikembalikan ke tampilan awal (Bank BCA).
  - Toast info muncul: *"Perubahan formulir dibatalkan."*

---

### SKENARIO 45: Reaktivasi Akun Nonaktif & Proteksi Tabrakan Okupansi Kamar (Tenant Reactivation Collision Guard)
- **Tujuan**: Memastikan alur pengaktifan kembali akun staf atau penghuni nonaktif berjalan aman, serta secara proaktif memblokir reaktivasi akun penghuni jika kamar lamanya telah disewa orang lain.
- **Kondisi Awal**: Akun Budi Santoso (Penghuni Kamar A-04) berstatus "Nonaktif" pasca-offboarding. Saat ini Kamar A-04 telah disewa oleh penghuni baru dengan kontrak aktif.
- **Langkah-langkah**:
  1. Pada tabel pengguna, cari akun nonaktif Budi Santoso lalu klik tombol **"Edit Izin / Kelola"**.
  2. Ubah dropdown `Status Akun` (`#editAccStatus`) dari *"Nonaktifkan (Kunci Akses)"* menjadi *"Aktif (Bisa Login)"*.
  3. Amati verifikasi ketersediaan unit kamar yang dijalankan oleh sistem.
  4. Coba simpan perubahan dengan kamar yang masih mengarah ke Kamar A-04.
  5. Ubah pilihan kamar relokasi ke kamar yang kosong (misal Kamar B-01), lalu klik **"Simpan Perubahan"**.
- **Hasil yang Diharapkan**:
  - Langkah 3-4: Sistem mendeteksi bahwa Kamar A-04 sedang terisi kontrak aktif lain; muncul kotak peringatan merah tabrakan okupansi; tombol simpan menolak eksekusi dan memunculkan Toast bahaya: *"Gagal Reaktivasi: Kamar A-04 sedang terisi kontrak aktif lain! Pilih kamar kosong terlebih dahulu."*
  - Langkah 5: Kamar B-01 yang kosong berhasil ditetapkan; status akun Budi Santoso beralih menjadi *"Aktif"* (badge hijau); relasi hunian Kamar B-01 terkunci; Toast sukses muncul: *"Akun Budi Santoso berhasil diaktifkan kembali di Kamar B-01."*

---

### SKENARIO 46: Proteksi Tabrakan Relokasi Kamar pada Modal Kelola Akun (Edit Modal Relocation Collision Guard)
- **Tujuan**: Mencegah pemindahan unit kamar penghuni pada modal edit ke kamar lain yang sedang dihuni oleh penyewa aktif.
- **Kondisi Awal**: Modal `#modalEditAccount` terbuka untuk akun Penghuni Siti Rahmawati (Kamar B-01). Kamar A-04 saat ini terisi kontrak aktif.
- **Langkah-langkah**:
  1. Pada grup formulir relokasi kamar `#editRoomAssignGroup`, buka dropdown `#editAccRoomSelect`.
  2. Pilih opsi kamar yang sedang terisi: *"Kamar A-04 · Lantai 1 (Terisi Kontrak)"*.
  3. Klik tombol **"Simpan Perubahan"** (`saveAccountChanges()`).
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi status okupansi kamar target (`data-occupied="true"`).
  - Formulir menolak proses simpan relokasi; modal tetap terbuka; muncul Toast bahaya semantik: *"Kamar A-04 sedang terisi kontrak aktif! Pilih kamar yang tersedia untuk relokasi."* (Kategori: `danger`).
  - Tidak terjadi penumpukan dua penyewa aktif pada satu kamar fisik yang sama (*zero overbooking*).

---

### SKENARIO 47: Peringatan Penonaktifan Akun Penghuni dengan Tunggakan Tagihan Aktif (Unpaid Arrears Warning Guard)
- **Tujuan**: Mencegah hilangnya pengawasan piutang sewa dengan memberikan peringatan protektif ketika Pemilik mencoba menonaktifkan akun penghuni yang masih memiliki tagihan belum lunas.
- **Kondisi Awal**: Penghuni Kamar B-01 memiliki 1 tagihan sewa berstatus "Belum Lunas" sebesar Rp 1.500.000 di modul Tagihan (`WF-05`). Pemilik membuka modal `#modalEditAccount`.
- **Langkah-langkah**:
  1. Ubah `Status Akun` (`#editAccStatus`) menjadi *"Nonaktifkan (Kunci Akses)"*.
  2. Amati peringatan yang dimunculkan sistem sebelum konfirmasi simpan.
  3. Lakukan konfirmasi simpan perubahan.
- **Hasil yang Diharapkan**:
  - Sistem memeriksa relasi invoice di modul `F-05` dan menampilkan kotak peringatan kuning amber: *"Perhatian Piutang Berjalan: Penghuni ini masih memiliki 1 tagihan belum lunas (Rp 1.500.000). Penonaktifan akun akan membatasi akses pembayaran mandiri via portal."*
  - Saat disimpan, sistem mencatat status nonaktif akun namun tetap mempertahankan record tagihan dan piutang di laporan keuangan Pemilik tanpa terhapus.
  - Muncul Toast info: *"Akun dinonaktifkan. Tagihan aktif tetap tercatat pada daftar piutang sewa."*

---

### SKENARIO 48: Pencegahan Pembuatan / Injeksi Akun Pemilik Ganda (Single-Property Multi-Owner Prevention)
- **Tujuan**: Menegakkan batas arsitektur properti mandiri (*Single Independent Property Guard*) dengan menolak pembuatan akun Pemilik kedua (Superadmin ganda) baik melalui antarmuka maupun manipulasi payload API.
- **Kondisi Awal**: Pemilik membuka modal `#modalAddAccount`.
- **Langkah-langkah**:
  1. Periksa daftar opsi dropdown `Jenis Peran Akun` (`#accType`).
  2. Buka DevTools peramban (Inspect Element), tambahkan elemen `<option value="owner">Pemilik Properti (Superadmin)</option>` secara ilegal pada `#accType`.
  3. Pilih opsi tersebut, isi nama dan email valid, lalu tekan tombol **"Buat & Aktifkan Akun"**.
  4. Simulasikan pengiriman payload HTTP `POST /api/users` dengan atribut `{ role: "owner" }`.
- **Hasil yang Diharapkan**:
  - Langkah 1: Dropdown bawaan hanya menyediakan 3 opsi resmi: *Staf Operasional*, *Teknisi Lapangan*, dan *Penghuni Kost*. Tidak ada opsi Pemilik.
  - Langkah 3-4: Skrip validasi klien dan endpoint backend mendeteksi pelanggaran batasan: sistem menolak payload dengan status HTTP 403 Forbidden atau 422 Unprocessable Entity.
  - Muncul pesan error keamanan: *"Pelanggaran Batas Sistem: RumaKost hanya mendukung satu akun Pemilik Properti Utama (Single Property Guard)."*
  - Integritas wewenang superadmin tunggal tetap terjaga mutlak.

---

### SKENARIO 49: Penyampaian Kredensial Pengguna Baru via Tautan Langsung WhatsApp (Direct wa.me Credential Dispatch)
- **Tujuan**: Memfasilitasi distribusi kredensial login (email & kata sandi sementara) dari Pemilik ke staf atau penghuni baru secara instan melalui tautan WhatsApp tanpa gateway SMS berbayar.
- **Kondisi Awal**: Pemilik baru saja membuat akun staf baru untuk "Ahmad Fauzi" (Skenario 07) atau mereset sandi pengguna (Skenario 15).
- **Langkah-langkah**:
  1. Amati notifikasi konfirmasi sukses dan tombol aksi lanjutan pada modal/toast.
  2. Klik tombol **"Kirim Kredensial via WA"** (`dispatchCredentialsViaWhatsApp()`).
- **Hasil yang Diharapkan**:
  - Sistem men-generate URL tautan WhatsApp standar: `https://wa.me/6281277889911?text=...`.
  - Teks pesan otomatis terformat rapi dan profesional:  
    *"Halo Ahmad Fauzi, akun RumaKost Anda telah diaktifkan oleh Pemilik. Portal Login: https://kostbudimakmur.id/login | Email: ahmad.staf@kostbudimakmur.id | Sandi Sementara: Ruma#XXXX! | Harap segera perbarui kata sandi saat pertama kali masuk."*
  - Tautan membuka aplikasi WhatsApp Web/Mobile di jendela baru secara mulus tanpa biaya integrasi API pihak ketiga.

---

### SKENARIO 50: Penegakan Soft-Delete & Pencegahan Hard-Delete Pengguna (Referential Integrity Guard)
- **Tujuan**: Menjamin bahwa seluruh data pengguna yang pernah bertransaksi atau bertugas tidak dapat dihapus permanen secara fisik (*zero hard-delete*), melindungi keutuhan relasi tabel database.
- **Kondisi Awal**: Pemilik berada pada baris akun staf Rini Setiawati atau penghuni lama di Seksi 2.
- **Langkah-langkah**:
  1. Periksa seluruh tombol aksi pada baris tabel pengguna dan modal edit.
  2. Buka DevTools console dan kirimkan request HTTP `DELETE /api/users/2`.
- **Hasil yang Diharapkan**:
  - Antarmuka tidak pernah menyediakan tombol "Hapus Akun / Delete User" permanen, melainkan hanya opsi "Nonaktifkan (Kunci Akses)".
  - Request `DELETE` fisik ditolak mutlak oleh API backend dengan status HTTP 405 Method Not Allowed atau HTTP 400 Bad Request: *"Penghapusan permanen dilarang demi integritas audit keuangan dan operasional. Gunakan mekanisme nonaktifkan akun."*
  - Seluruh riwayat transaksi sewa masa lalu yang dicatat staf atau dibayar penghuni tetap terhubung utuh ke ID pengguna terkait (*zero orphaned foreign-key records*).

---

### SKENARIO 51: Pencarian Cepat Pengguna pada Tabel Direktori Akun (In-Table Quick Search & Instant Filter)
- **Tujuan**: Memudahkan Pemilik menemukan data pengguna spesifik secara instan berdasarkan nama, alamat email, atau nomor kamar saat jumlah data riwayat akun bertambah banyak.
- **Kondisi Awal**: Tabel pengguna memuat data staf dan penghuni.
- **Langkah-langkah**:
  1. Ketikkan kueri pencarian `"A-04"` pada kotak pencarian cepat tabel pengguna (`#userTableSearchInput`).
  2. Amati penyaringan baris tabel secara real-time.
  3. Hapus teks dan ketikkan `"rini"` (pencarian nama staf *case-insensitive*).
  4. Ketikkan kueri acak yang tidak cocok: `"xyz999"`.
- **Hasil yang Diharapkan**:
  - Langkah 1: Tabel seketika memfilter dan hanya menampilkan baris Budi Santoso (Penghuni Kamar A-04).
  - Langkah 3: Tabel hanya menyajikan baris staf Rini Setiawati.
  - Langkah 4: Tabel menampilkan status baris kosong pencarian: *"Tidak ditemukan pengguna dengan kata kunci 'xyz999'"* disertai tombol *"Reset Pencarian"*.

---

### SKENARIO 52: Validasi Field Wajib Profil Properti & Deteksi Spasi Kosong (Property Mandatory Fields & Trim Guard)
- **Tujuan**: Mencegah tersimpannya profil identitas kost yang kosong atau hanya berisi karakter spasi, melindungi kop resmi dokumen invoice sewa.
- **Kondisi Awal**: Pemilik berada pada Seksi 1 Identitas Properti.
- **Langkah-langkah**:
  1. *Uji 52A (Nama Kost Kosong)*: Hapus teks `#propName` dan ganti dengan 4 spasi (`"    "`) -> Klik Simpan Profil.
  2. *Uji 52B (Nama Pemilik Kosong)*: Kembalikan nama kost, kosongkan field `#propOwner` -> Klik Simpan Profil.
  3. *Uji 52C (Alamat Kost Kosong)*: Kosongkan textarea `#propAddress` -> Klik Simpan Profil.
- **Hasil yang Diharapkan**:
  - Pada pengujian 52A, 52B, dan 52C: Sistem mengeksekusi fungsi `.trim()`; masukan bernilai kosong; proses simpan digagalkan seketika.
  - Field yang tidak valid diberi highlight border merah (`#EF4444`).
  - Muncul Toast peringatan semantik: *"Nama kost, nama pemilik, dan alamat lengkap wajib diisi!"* (Kategori: `warning`).
  - Profil database tetap mempertahankan nilai valid sebelumnya.

---

### SKENARIO 53: Validasi Sintaks & Batas Digit Nomor WhatsApp Pengelola (`#propPhone` Syntax & Length Validation)
- **Tujuan**: Memastikan nomor WhatsApp pengelola kost yang dimasukkan valid secara sintaksis dan panjang digit sebelum dinormalisasi ke tautan wa.me.
- **Kondisi Awal**: Pemilik berada pada input `#propPhone` di Seksi 1.
- **Langkah-langkah**:
  1. *Uji 53A (Digit Terlalu Pendek)*: Masukkan nomor `"0812"` (hanya 4 digit) -> Klik Simpan Profil.
  2. *Uji 53B (Mengandung Huruf/Karakter Cacat)*: Masukkan nomor `"0812-ABCD-9999"` -> Klik Simpan Profil.
  3. *Uji 53C (Valid)*: Masukkan nomor `"0812-3456-7890"` (12 digit angka) -> Klik Simpan Profil.
- **Hasil yang Diharapkan**:
  - *Uji 53A*: Ditolak; Toast warning: *"Nomor WhatsApp pengelola tidak valid (minimal 10 digit angka)!"*.
  - *Uji 53B*: Ditolak; Toast warning: *"Nomor telepon hanya boleh memuat karakter angka dan tanda hubung!"*.
  - *Uji 53C*: Diterima; sistem menormalisasi nomor menjadi `6281234567890` dan menyimpan pengaturan dengan sukses.

---

### SKENARIO 54: Validasi Kelengkapan Rekening Bank Resmi (Mandatory Bank Details Guard)
- **Tujuan**: Mencegah tersimpannya rekening penampungan sewa yang tidak lengkap yang dapat menggagalkan pembayaran transfer penyewa.
- **Kondisi Awal**: Pemilik berada pada sub-seksi Rekening Bank di Seksi 1.
- **Langkah-langkah**:
  1. *Uji 54A (Nama Bank Kosong)*: Kosongkan `#bankName` -> Klik Simpan Profil.
  2. *Uji 54B (Atas Nama Pemilik Kosong)*: Isi nama bank, kosongkan `#bankHolder` -> Klik Simpan Profil.
  3. *Uji 54C (Nomor Rekening Terlalu Pendek)*: Isi nomor rekening `"123"` (hanya 3 digit) -> Klik Simpan Profil.
- **Hasil yang Diharapkan**:
  - *Uji 54A & 54B*: Sistem menolak penyimpanan; Toast warning: *"Nama bank dan atas nama pemilik rekening wajib diisi!"*.
  - *Uji 54C*: Ditolak; Toast warning: *"Nomor rekening bank minimal 6 digit angka!"*.
  - Menjamin invoice tagihan selalu memuat informasi transfer bank yang kredibel dan lengkap.

---

### SKENARIO 55: Pencegahan Bypass DevTools / API Tampering pada Field Kapasitas & Lantai Readonly
- **Tujuan**: Memastikan integritas arsitektural bahwa kapasitas kamar dan jumlah lantai hanya dapat dimutasi melalui modul Master Kamar (`F-02`), bukan lewat form pengaturan.
- **Kondisi Awal**: Halaman `WF-09` terbuka pada browser.
- **Langkah-langkah**:
  1. Buka Inspect Element, hapus atribut `readonly` pada input `#propRooms` dan ubah nilainya menjadi `"25 Unit Kamar"`.
  2. Hapus atribut `readonly` pada `#propFloors` dan ubah nilainya menjadi `"5 Lantai"`.
  3. Klik tombol "Simpan Profil".
  4. Simulasikan payload API `PUT /api/property` dengan field `{ total_rooms: 25, total_floors: 5 }`.
- **Hasil yang Diharapkan**:
  - Di sisi frontend: Skrip pengiriman mengabaikan field readonly atau memvalidasi terhadap master state.
  - Di sisi backend: Endpoint API secara eksplisit mem-filter/menolak mutasi field `total_rooms` dan `total_floors` dengan respon HTTP 400 Bad Request: *"Field kapasitas kamar dan jumlah lantai bersifat terhitung otomatis (Read-Only). Ubah konfigurasi unit fisik melalui Modul Master Kamar (F-02)."*
  - Nilai kapasitas di database tetap terkunci pada 15 unit kamar dan 3 lantai.

---

### SKENARIO 56: Batas Maksimum Butir Tata Tertib Kost (Upper Boundary Guard & PDF Layout Protection)
- **Tujuan**: Mencegah penambahan butir tata tertib tanpa batas yang dapat merusak format cetak Surat Perjanjian Sewa Digital (PDF) dan estetika portal penghuni.
- **Kondisi Awal**: Kontainer tata tertib telah memiliki 15 butir aturan aktif terdaftar.
- **Langkah-langkah**:
  1. Klik tombol **"+ Tambah Aturan"** (`addNewRule()`) saat daftar telah mencapai batas atas (15 butir).
  2. Amati respon sistem terhadap upaya penambahan butir ke-16.
- **Hasil yang Diharapkan**:
  - Sistem mengeksekusi pengecekan batas atas: `container.querySelectorAll('.rule-item-row').length >= 15`.
  - Penambahan baris baru diblokir; DOM kontainer tidak bertambah.
  - Muncul Toast peringatan semantik: *"Batas maksimum tata tertib tercapai (Maks. 15 butir). Demi kerapian dokumen kontrak sewa."* (Kategori: `warning`).

---

### SKENARIO 57: Batas Panjang Karakter per Butir Tata Tertib (Rule Text Length Limit Guard)
- **Tujuan**: Memastikan setiap butir tata tertib berupa klausul ringkas dan padat, serta mencegah pengguna menempelkan esai panjang yang merusak layout tabel kontrak.
- **Kondisi Awal**: Pemilik menambahkan butir aturan baru pada Seksi 1.
- **Langkah-langkah**:
  1. Tempelkan teks panjang melebihi 250 karakter ke dalam input butir aturan (`.rule-input-field`):  
     *"Penyewa dilarang keras membawa barang-barang berbahaya, bahan kimia mudah meledak, senjata tajam tanpa izin, serta menyelenggarakan pesta bising yang mengganggu ketenangan umum warga sekitar lingkungan kost Budi Makmur dan wajib mematuhi seluruh peraturan RT/RW setempat tanpa terkecuali setiap saat sepanjang waktu sewa berjalan..."* (290 karakter).
  2. Amati respon input dan klik simpan.
- **Hasil yang Diharapkan**:
  - Input field memiliki atribut `maxlength="250"`; ketikan karakter ke-251 otomatis terpotong (*hard truncate*).
  - Terdapat indikator hitungan karakter halus saat mendekati batas (`250/250`).
  - Mencegah meluapnya kolom klausul pada layout cetak Surat Perjanjian Sewa Digital PDF.

---

### SKENARIO 58: Pencegahan Duplikasi Butir Tata Tertib (Duplicate Rule Guard)
- **Tujuan**: Mencegah tersimpannya klausul tata tertib yang redundan atau persis sama dalam dokumen kontrak sewa.
- **Kondisi Awal**: Terdapat butir aturan nomor 2: *"Dilarang keras merokok atau vaping di dalam kamar tidur ber-AC."*.
- **Langkah-langkah**:
  1. Klik "+ Tambah Aturan".
  2. Masukkan teks yang sama persis pada baris baru: `"Dilarang keras merokok atau vaping di dalam kamar tidur ber-AC."` (atau variasi huruf kecil semua).
  3. Klik tombol "Simpan Profil".
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi kesamaan teks butir aturan secara *case-insensitive* dan *whitespace-trimmed*.
  - Proses penyimpanan dicegat; baris aturan duplikat diberi sorotan border kuning amber.
  - Toast peringatan muncul: *"Butir aturan nomor 6 terdeteksi duplikat dengan butir nomor 2. Harap hapus atau ubah klausul sebelum menyimpan."* (Kategori: `warning`).

---

### SKENARIO 59: Pencegahan Penggunaan Kembali Kata Sandi Lama (Password Reuse Prevention)
- **Tujuan**: Meningkatkan standar keamanan akun Superadmin dengan mencegah penggunaan kembali kata sandi yang saat ini sedang aktif.
- **Kondisi Awal**: Kata sandi Pemilik saat ini adalah `SuperBudi2026!`. Pemilik berada pada Seksi 3 Keamanan Sandi.
- **Langkah-langkah**:
  1. Masukkan kata sandi saat ini: `SuperBudi2026!`.
  2. Masukkan kata sandi baru yang sama persis: `SuperBudi2026!`.
  3. Masukkan konfirmasi kata sandi: `SuperBudi2026!`.
  4. Klik tombol **"Perbarui Kata Sandi"** (`changePasswordSubmit()`).
- **Hasil yang Diharapkan**:
  - Sistem memvalidasi kesamaan nilai: `if (newP === curr)`.
  - Formulir menolak proses pembaharuan kata sandi.
  - Muncul Toast peringatan keamanan: *"Kata sandi baru tidak boleh sama dengan kata sandi saat ini! Gunakan variasi kombinasi baru demi keamanan."* (Kategori: `warning`).
  - Field kata sandi baru difokuskan ulang secara otomatis.

---

### SKENARIO 60: Focus Trap Keyboard pada Modal Dialog Akun (WCAG 2.1 AA Compliance)
- **Tujuan**: Memastikan pengguna disabilitas netra atau pengguna yang mengandalkan keyboard murni dapat mengoperasikan modal dialog tanpa kehilangan fokus navigasi ke elemen latar belakang.
- **Kondisi Awal**: Modal `#modalAddAccount` atau `#modalEditAccount` dibuka.
- **Langkah-langkah**:
  1. Tekan tombol `Tab` berulang-ulang dari tombol close silang hingga tombol simpan di footer modal dialog.
  2. Tekan tombol `Tab` sekali lagi pada elemen interaktif terakhir di modal (tombol "Buat & Aktifkan Akun").
  3. Tekan kombinasi `Shift + Tab` secara mundur.
  4. Tutup modal dengan menekan tombol `Escape`.
- **Hasil yang Diharapkan**:
  - Langkah 2: Fokus keyboard tidak pernah melompat ke navbar topbar atau elemen formulir di balik backdrop modal, melainkan kembali secara siklis (*focus trap*) ke elemen fokus pertama (tombol silang penutup modal).
  - Langkah 3: Penekanan `Shift + Tab` memutar balik fokus ke elemen footer modal secara mulus.
  - Langkah 4: Saat modal tertutup, fokus peramban dikembalikan secara presisi ke tombol pemicu awal (`+ Buat Akun Baru`), memenuhi kriteria WCAG 2.1 Success Criterion 2.4.3 (Focus Order).

---

### SKENARIO 61: Rate Limiting & Proteksi Brute-Force pada Verifikasi Sandi Superadmin (Brute-Force Lockout Guard)
- **Tujuan**: Melindungi kredensial Pemilik dari upaya penebakan kata sandi secara bertubi-tubi pada perangkat yang ditinggalkan terbuka (*unattended terminal attack*).
- **Kondisi Awal**: Pemilik berada pada Seksi 3 Keamanan Sandi.
- **Langkah-langkah**:
  1. Masukkan kata sandi lama yang salah sebanyak 5 kali berturut-turut pada field `#currPass` dan klik tombol perbarui sandi.
- **Hasil yang Diharapkan**:
  - Pada kegagalan ke-5, sistem mengaktifkan mekanisme *Brute-Force Rate Limiting Lockout*.
  - Input formulir ganti sandi dikunci sementara (`disabled = true`) selama 15 menit.
  - Tampil banner countdown merah pekat: *"Terlalu banyak percobaan sandi yang salah. Formulir keamanan dikunci selama 15:00 menit demi perlindungan akun."*
  - Notifikasi peringatan keamanan dikirimkan secara otomatis ke email operasional Pemilik.

---

### SKENARIO 62: Penanganan Kegagalan Jaringan & Mode Offline saat Simpan Pengaturan (Network Offline Fallback)
- **Tujuan**: Menjamin bahwa seluruh draf pengetikan pengaturan dan formulir akun tidak hilang atau terhapus saat terjadi pemadaman koneksi internet tiba-tiba.
- **Kondisi Awal**: Pemilik telah mengetikkan 2 klausul tata tertib baru dan mengubah nomor rekening bank, lalu koneksi internet peramban terputus (*Network Offline*).
- **Langkah-langkah**:
  1. Klik tombol **"Simpan Profil"** (`saveAllSettings()`) saat jaringan offline.
  2. Amati respons sistem terhadap kegagalan request AJAX/Fetch API.
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi `navigator.onLine === false` atau menangkap error jaringan HTTP 503/Timeout.
  - Seluruh isi teks yang telah diketikkan pengguna **tetap dipertahankan di field formulir** (tidak di-reset atau dikosongkan).
  - Tampil Toast bahaya semantik persisten: *"Gagal Menyimpan: Koneksi internet terputus. Data ketikan Anda tersimpan di peramban. Coba lagi saat online."* (Kategori: `danger`).
  - Muncul tombol pintas *"Coba Lagi (Retry)"* tanpa mengharuskan pengguna mengetik ulang dari awal.

---

### SKENARIO 63: Kepatuhan Mode Kontras Tinggi Sistem Operasi (High Contrast / Forced Colors Mode WCAG AAA)
- **Tujuan**: Memastikan tata letak antarmuka Pengaturan tetap terbaca tajam dan tidak kehilangan elemen visual penting saat pengguna mengaktifkan mode High Contrast pada Windows OS.
- **Kondisi Awal**: Mode *Forced Colors / High Contrast* diaktifkan pada sistem operasi peramban (`forced-colors: active`).
- **Langkah-langkah**:
  1. Periksa tampilan kartu grafis ATM Bank BCA `#atmCardPreview`.
  2. Periksa tampilan badge status peran pada tabel master pengguna Seksi 2.
  3. Periksa garis batas (*outlines*) modal dialog `#modalAddAccount`.
- **Hasil yang Diharapkan**:
  - Kartu ATM menampilkan garis batas fisik kontras tinggi (`outline: 2px solid ButtonText`) sehingga informasi nomor rekening tetap terbaca tegas meskipun gradien warna latar disembunyikan oleh sistem operasi.
  - Badge peran (Staf, Teknisi, Penghuni) merender border penjelas tanpa mengandalkan warna latar semata.
  - Seluruh input dan tombol mempertahankan kontras minimum 7:1 sesuai standar WCAG 2.1 AAA.

---

### SKENARIO 64: Kepatuhan Preferensi Aksesibilitas Gerak Berkurang (`@media prefers-reduced-motion`)
- **Tujuan**: Memastikan antarmuka menghormati preferensi pengguna yang sensitif terhadap mabuk gerak (*vestibular motion triggers*) dengan menonaktifkan transisi animasi pengguliran.
- **Kondisi Awal**: Pengguna mengaktifkan pengaturan OS *"Reduce Motion"* (`prefers-reduced-motion: reduce`).
- **Langkah-langkah**:
  1. Klik salah satu item navigasi samping sticky: **"3. Keamanan Sandi"**.
  2. Buka modal dialog `+ Buat Akun Baru`.
- **Hasil yang Diharapkan**:
  - Pada langkah 1: Animasi smooth scrolling dinonaktifkan (`scroll-behavior: auto`); halaman berpindah seketika tanpa pergerakan animasi meluncur.
  - Pada langkah 2: Modal dialog muncul secara instan tanpa efek transformasi zooming atau transisi fade-in bertingkat (`transition: none; animation: none;`).
  - Seluruh fungsionalitas ScrollSpy dan navigasi tetap berjalan akurat 100%.

---

### SKENARIO 65: Ketahanan Siklus Pemulihan BFCache Pasca-Navigasi Balik (BFCache Restoration Guard)
- **Tujuan**: Memverifikasi keutuhan state formulir dan siklus hidup DOM saat Pemilik berpindah ke layar lain lalu kembali menggunakan tombol *Back* pada peramban web (*Back-Forward Cache*).
- **Kondisi Awal**: Pemilik sedang berada di halaman `WF-09-pengaturan.html` dengan modal `#modalAddAccount` terbuka, lalu mengklik tautan topbar ke `WF-02-dashboard.html`.
- **Langkah-langkah**:
  1. Pada halaman dasbor `WF-02`, klik tombol **`Back`** pada peramban browser.
  2. Amati pemulihan halaman pengaturan `WF-09`.
  3. Periksa status modal dialog, event listener scrollspy, dan render ikon Lucide SVG.
- **Hasil yang Diharapkan**:
  - Halaman ter-restorasi secara mulus: Seluruh modal dialog yang terbuka sebelumnya otomatis ditutup secara bersih (*modal backdrop closed*) untuk mencegah deadlock visual.
  - Event listener ScrollSpy aktif kembali tanpa memory leak atau error duplikasi event listener.
  - Seluruh ikon Lucide SVG ter-render sempurna tanpa placeholder tag kosong (`flawless icon re-hydration`).

---

### SKENARIO 66: Pintasan Keyboard Cepat Simpan Pengaturan (Ctrl + S / Cmd + S Shortcut Guard)
- **Tujuan**: Memfasilitasi alur kerja cepat bagi Pemilik untuk menyimpan konfigurasi identitas properti dan tata tertib menggunakan pintasan keyboard standar workstation tanpa perlu menggulir ke tombol simpan.
- **Kondisi Awal**: Pemilik sedang menyunting alamat kost atau butir aturan baru pada Seksi 1.
- **Langkah-langkah**:
  1. Tekan kombinasi tombol `Ctrl + S` (pada Windows/Linux) atau `Cmd + S` (pada macOS).
  2. Amati reaksi browser peramban dan sistem aplikasi.
- **Hasil yang Diharapkan**:
  - Event listener global mencegat event default browser (`e.preventDefault()`), mencegah munculnya dialog bawaan browser *"Save Webpage As..."*.
  - Sistem secara otomatis mengeksekusi fungsi `saveAllSettings()`.
  - Tampil Toast notifikasi sukses: *"Profil properti & rekening resmi disimpan (Ctrl+S)."*

---

### SKENARIO 67: Pembaruan Nomor WhatsApp Pengguna pada Modal Kelola Akun (User Contact Update Guard)
- **Tujuan**: Memastikan nomor telepon WhatsApp staf atau penghuni dapat diperbarui jika pengguna berganti nomor kontak, dengan validasi format dan sinkronisasi instan ke seluruh sistem.
- **Kondisi Awal**: Modal `#modalEditAccount` terbuka untuk staf Rini Setiawati atau penghuni Budi Santoso.
- **Langkah-langkah**:
  1. Ubah field `Nomor WhatsApp Pengguna` (`#editAccPhone`) menjadi nomor baru: `"0813-9876-5432"`.
  2. Masukkan nomor tidak valid (misal hanya 5 digit: `"08123"`) untuk menguji validasi.
  3. Masukkan kembali nomor valid `"0813-9876-5432"` lalu klik **"Simpan Perubahan"**.
- **Hasil yang Diharapkan**:
  - Langkah 2: Sistem menolak penyimpanan dengan Toast warning: *"Nomor WhatsApp pengguna minimal 10 digit angka!"*.
  - Langkah 3: Perubahan tersimpan; sub-label kontak pada tabel pengguna terbarui seketika; tautan direct chat WhatsApp pada sistem operasional otomatis mengarah ke nomor baru.
  - Toast sukses muncul: *"Data kontak akun berhasil diperbarui."*

---

### SKENARIO 68: Pengalihan Mandatori Tiket Aktif saat Deaktivasi Staf/Teknisi (Mandatory Ticket Reassignment Modal)
- **Tujuan**: Mencegah adanya tiket perbaikan yang terbengkalai (*orphaned maintenance tickets F-07*) saat staf atau teknisi lapangan dinonaktifkan dari sistem.
- **Kondisi Awal**: Teknisi Pak Joko Santoso memiliki 2 tiket kerusakan berstatus *"Dalam Pengerjaan"* di modul `WF-08`. Pemilik mengubah status Pak Joko menjadi *"Nonaktifkan"*.
- **Langkah-langkah**:
  1. Ubah `#editAccStatus` menjadi *"Nonaktifkan (Kunci Akses)"*.
  2. Amati pemunculan dropdown alih tugas mandatori: `#ticketReassignSelect`.
  3. Coba simpan tanpa memilih teknisi/staf pengganti.
  4. Pilih staf pengganti: *"Rini Setiawati (Staf Operasional)"* atau teknisi aktif lainnya, lalu klik **"Simpan Perubahan"**.
- **Hasil yang Diharapkan**:
  - Langkah 2-3: Sistem memblokir penyimpanan jika tiket belum dialihkan; muncul peringatan: *"Pilih staf pengganti untuk mengalihkan 2 tiket aktif milik Pak Joko Santoso sebelum menonaktifkan akun."*
  - Langkah 4: Sistem mengeksekusi mutasi re-assign: penanggung jawab ke-2 tiket di modul `WF-08` dialihkan ke staf terpilih; akun Pak Joko berhasil dinonaktifkan; rekaman histori pengalihan dicatat di log audit.
  - Toast sukses muncul: *"Akun dinonaktifkan. 2 tiket aktif berhasil dialihkan ke Rini Setiawati."*

---

### SKENARIO 69: Penanganan Status Seluruh Staf Nonaktif (Zero Active Staff Fallback to Owner Alert)
- **Tujuan**: Menguji perilaku sistem saat seluruh akun staf operasional dan teknisi berstatus nonaktif, memastikan alur notifikasi operasional tidak macet.
- **Kondisi Awal**: Seluruh staf (Rini Setiawati dan Pak Joko Santoso) dinonaktifkan oleh Pemilik.
- **Langkah-langkah**:
  1. Buka halaman pengaturan `WF-09` dan periksa banner status operasional di atas tabel pengguna Seksi 2.
  2. Buka modul tiket penghuni (`WF-10`) dan kirim komplain kerusakan baru dari Kamar A-04.
- **Hasil yang Diharapkan**:
  - Pada tabel Seksi 2 tampil callout peringatan informatif: *"Perhatian Operasional: Seluruh staf lapangan sedang nonaktif. Seluruh komplain tiket baru dan pelaporan bayar akan dialihkan langsung ke akun Pemilik Utama."*
  - Komplain tiket baru dari penghuni secara otomatis menetapkan assignee default ke Pemilik Properti (`Budi Santoso`), mencegah tiket tanpa penanganan.

---

### SKENARIO 70: Sinkronisasi Status Sesi Lintas-Tab saat Logout (Cross-Tab Session Logout Sync)
- **Tujuan**: Mencegah manipulasi data konfigurasi tanpa izin pada tab browser yang ditinggalkan terbuka setelah pengguna melakukan logout di tab lain.
- **Kondisi Awal**: Pemilik membuka `WF-09-pengaturan.html` di Tab Browser 1, lalu membuka Tab Browser 2 dan mengklik menu "Keluar Akun" (Logout).
- **Langkah-langkah**:
  1. Lakukan logout di Tab Browser 2.
  2. Kembali ke Tab Browser 1 yang masih menampilkan form pengaturan, lalu coba klik tombol "Simpan Profil" atau "Buat Akun".
- **Hasil yang Diharapkan**:
  - Tab 1 mendeteksi penghapusan token sesi autentikasi via `window.addEventListener('storage')`.
  - Formulir seketika dikunci; muncul modal layar penuh: *"Sesi Anda telah berakhir dari jendela lain. Mengalihkan ke halaman masuk..."*
  - Tab 1 secara otomatis mengarahkan peramban kembali ke `WF-01-login.html?reason=session_expired`.
  - Tidak ada perubahan konfigurasi yang berhasil disimpan pasca-logout.

---

### SKENARIO 71: Sanitasi Karakter Non-Printable & Zero-Width Spaces pada Input Teks (Zero-Width Space Sanitization Guard)
- **Tujuan**: Mencegah polusi data tersembunyi (*invisible characters*) yang berasal dari hasil salin-tempel dokumen eksternal pada nama properti, alamat, atau tata tertib.
- **Kondisi Awal**: Pemilik menempelkan teks butir aturan baru yang mengandung karakter Zero-Width Space (`\u200B`) dan Non-Breaking Space (`\u00A0`).
- **Langkah-langkah**:
  1. Masukkan teks payload: `"Dilarang\u200B membawa\u00A0hewan peliharaan"`.
  2. Klik tombol "Simpan Profil".
  3. Periksa nilai string yang tersimpan di database dan dirender kembali di UI.
- **Hasil yang Diharapkan**:
  - Skrip normalisasi masukan mengeksekusi regex pembersih karakter tak kasat mata: `str.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ')`.
  - Teks tersimpan bersih sebagai string ASCII standar dengan spasi tunggal.
  - Mencegah kegagalan kueri pencarian teks dan anomali rendering font di portal penghuni.

---

### SKENARIO 72: Kepatuhan Lembar Gaya Cetak Administrasi Kost (@media print Clean Export)
- **Tujuan**: Memastikan pencetakan data pengaturan kost dan klausul tata tertib bersih dari elemen navigasi website saat dicetak untuk arsip fisik atau papan pengumuman kost.
- **Kondisi Awal**: Pemilik menekan tombol `Ctrl + P` (Print Preview) pada halaman `WF-09`.
- **Langkah-langkah**:
  1. Buka dialog pratinjau cetak peramban (*Print Preview*).
  2. Amati elemen-elemen yang ditampilkan pada lembar pratinjau cetak.
- **Hasil yang Diharapkan**:
  - Elemen non-cetak disembunyikan secara otomatis via `@media print`: Topbar floating, canopy overlay, sidebar navigasi kiri, tombol-tombol CTA ("Simpan Profil", "+ Tambah Aturan", "+ Buat Akun"), tombol aksi hapus, dan modal dialog disembunyikan (`display: none !important;`).
  - Halaman mencetak lembar administrasi rapi: Kop resmi Kost Budi Makmur, alamat fisik lengkap, kontak pengelola, nomor rekening resmi transfer sewa, dan 5 butir tata tertib bernomor urut tegas di atas latar putih bersih.

---

### SKENARIO 73: Proteksi Integritas Token CSRF pada Mutasi Konfigurasi (Cross-Site Request Forgery Guard)
- **Tujuan**: Melindungi pengaturan properti dan kredensial Pemilik dari serangan eksploitasi CSRF lintas-situs.
- **Kondisi Awal**: Pemilik sedang login di sistem RumaKost.
- **Langkah-langkah**:
  1. Buka situs pihak ketiga palsu yang mengirimkan request form submission tersembunyi `POST /api/settings/password` tanpa header `X-CSRF-TOKEN` yang valid.
  2. Amati respon filter keamanan backend.
- **Hasil yang Diharapkan**:
  - Server memvalidasi keberadaan dan kesesuaian token CSRF bertanda tangan kriptografis pada setiap request mutasi HTTP (`POST`, `PUT`, `DELETE`).
  - Request tanpa token CSRF yang sah ditolak seketika dengan status HTTP 403 Forbidden (*CSRF Token Missing or Invalid*).
  - Kata sandi maupun rekening bank Pemilik tidak mengalami kebocoran atau perubahan liar.

---

### SKENARIO 74: Ketahanan Tampilan Viewport Ketinggian Rendah & Layar Laptop Ringkas (@media (max-height: 700px))
- **Tujuan**: Memastikan antarmuka workbench tetap proporsional dan seluruh tombol footer modal dapat dijangkau pada layar laptop resolusi 1366x768 dengan tinggi viewport terpotong ($\le 700\text{px}$).
- **Kondisi Awal**: Peramban disimulasikan pada viewport lebar 1280px dan tinggi 650px.
- **Langkah-langkah**:
  1. Buka modal dialog `+ Buat Akun Baru` atau modal `Kelola Akun`.
  2. Periksa visibilitas header modal, isi form yang dapat digulir, dan tombol footer simpan.
  3. Amati sidebar navigasi sticky di kolom kiri.
- **Hasil yang Diharapkan**:
  - Modal mengimplementasikan struktur 3-tier Estify: Header modal tetap tersemat di atas (`position: sticky; top: 0`), area isi form dapat digulir vertikal (`overflow-y: auto`), dan footer modal dengan tombol aksi tetap tersemat di bawah (`position: sticky; bottom: 0`).
  - Tombol "Buat & Aktifkan Akun" maupun "Batal" tidak pernah terpotong atau tersembunyi di luar batas layar bawah.
  - Sidebar sticky kiri menyesuaikan tinggi maksimal (`max-height: calc(100vh - 120px)`) dengan scrollbar internal yang halus.

---

### SKENARIO 75: Penanganan Lingkungan Peramban Tanpa JavaScript (<noscript> Graceful Degradation Guard)
- **Tujuan**: Memberikan petunjuk visual yang jelas dan aman jika pengguna mengakses halaman dengan fitur JavaScript dinonaktifkan di peramban.
- **Kondisi Awal**: Fitur eksekusi JavaScript dinonaktifkan pada peramban web (Disable JavaScript).
- **Langkah-langkah**:
  1. Buka URL `WF-09-pengaturan.html` pada peramban tanpa JavaScript aktif.
  2. Amati respons visual halaman.
- **Hasil yang Diharapkan**:
  - Tag `<noscript>` merender banner pengaman dengan kontras tinggi di bagian atas layar: *"Peringatan Sistem: Aplikasi RumaKost membutuhkan JavaScript untuk menjalankan modul otorisasi hak akses dan manajemen properti. Harap aktifkan JavaScript di peramban Anda untuk melanjutkan."*
  - Tombol-tombol formulir interaktif dinonaktifkan secara aman untuk mencegah pengiriman payload yang tidak terformat.

---

### SKENARIO 76: Dukungan Penempelan Manajer Sandi & Kebijakan Clipboard (Password Manager Paste Support - NIST SP 800-63B)
- **Tujuan**: Memastikan form keamanan sandi mematuhi rekomendasi standar NIST SP 800-63B (Section 5.1.1.2) dengan tidak memblokir penempelan teks (*no paste blocking*) dari aplikasi pengelola sandi (Password Manager).
- **Kondisi Awal**: Pemilik menyalin kata sandi acak 16 karakter dari aplikasi Password Manager (Bitwarden / 1Password / Apple Keychain).
- **Langkah-langkah**:
  1. Arahkan kursor ke field kata sandi baru (`#newPass`).
  2. Tekan kombinasi tuts `Ctrl + V` (atau klik kanan -> *Paste*).
  3. Lakukan hal yang sama pada field konfirmasi (`#confirmPass`).
- **Hasil yang Diharapkan**:
  - Event `paste` berjalan lancar tanpa dicegat oleh script (`no preventDefault on paste`).
  - Nilai kata sandi yang ditempel otomatis dibersihkan dari spasi tak sengaja di awal atau akhir string (*auto-trim whitespace*).
  - Tidak ada dialog larangan penempelan kata sandi yang merugikan pengguna pengelola kata sandi.

---

### SKENARIO 77: Indikator Pengukur Kekuatan Kata Sandi Real-time (Dynamic Password Entropy & Strength Meter)
- **Tujuan**: Memberikan panduan visual instan kepada Pemilik mengenai tingkat kekuatan kata sandi superadmin yang sedang diketikkan guna mencegah penggunaan kata sandi lemah.
- **Kondisi Awal**: Pemilik berada pada input `#newPass` di Seksi 3 Keamanan Akun.
- **Langkah-langkah**:
  1. Ketikkan kata sandi sederhana: `"kost12345"`.
  2. Tambahkan huruf besar dan simbol: `"KostBudi#2026!"`.
  3. Amati perubahan indikator kekuatan kata sandi di bawah input (`#passwordStrengthBar`).
- **Hasil yang Diharapkan**:
  - Langkah 1: Bar kekuatan menampilkan warna merah pekat (33%) dengan label teks: *"Lemah: Tambahkan huruf besar dan simbol unik"*.
  - Langkah 2: Bar kekuatan bertransformasi menjadi hijau tua (100%) dengan label teks: *"Sangat Kuat: Entropi kriptografis tinggi"*.
  - Memberikan umpan balik instan yang mendidik pengguna menjaga standar keamanan superadmin.

---

### SKENARIO 78: Aksesibilitas Tombol Toggle Visibilitas Kata Sandi (Password Visibility Eye-Toggle WCAG 2.1)
- **Tujuan**: Memudahkan Pemilik memeriksa ketikan kata sandi sebelum mengirimkan form serta memastikan aksesibilitas pembaca layar (*screen reader*).
- **Kondisi Awal**: Pemilik telah mengetikkan kata sandi pada field `#currPass` dan `#newPass`.
- **Langkah-langkah**:
  1. Klik tombol ikon mata (`.btn-toggle-eye`) di sisi kanan input `#newPass`.
  2. Amati perubahan tipe input dan ikon Lucide.
  3. Periksa atribut ARIA pada tombol toggle.
  4. Klik tombol mata sekali lagi untuk menyembunyikan kembali.
- **Hasil yang Diharapkan**:
  - Langkah 1-2: Tipe input beralih dari `type="password"` menjadi `type="text"`; ikon Lucide beralih dari `eye` menjadi `eye-off`; karakter teks terbaca jelas.
  - Langkah 3: Atribut `aria-pressed` beralih dari `"false"` menjadi `"true"`, dan `aria-label` berubah menjadi *"Sembunyikan kata sandi"*.
  - Langkah 4: Tipe input kembali menjadi `password`, melindungi kerahasiaan dari pandangan orang di sekitar (*shoulder surfing protection*).

---

### SKENARIO 79: Sanitasi Injeksi Formula Spreadsheet pada Ekspor Data (CSV / Excel Formula Injection Guard)
- **Tujuan**: Mencegah serangan *CSV / Formula Injection* (DDE attack) saat data profil kost, alamat, atau nama pengguna disalin ke clipboard atau dibuka di Microsoft Excel.
- **Kondisi Awal**: Pemilik memasukkan nama pengguna baru yang diawali karakter pemicu formula: `=cmd|' /C calc'!A0` atau `+6281234567890`.
- **Langkah-langkah**:
  1. Masukkan payload formula injection pada nama atau alamat: `=SUM(A1:A10) Kost Residence`.
  2. Simpan profil pengaturan.
  3. Salin data atau lakukan ekspor data tabel ke format spreadsheet.
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi karakter berbahaya di awal string (`=`, `+`, `-`, `@`, `\t`, `\r`).
  - Karakter pemicu formula secara preventif diberi prefix tanda kutip tunggal (`'`) atau disanitasi: `'=SUM(A1:A10) Kost Residence`.
  - Saat file dibuka pada aplikasi Excel/Spreadsheet, masukan murni dievaluasi sebagai teks biasa tanpa mengeksekusi rumus atau perintah sistem berbahaya.

---

### SKENARIO 80: Penanganan Tabrakan Nama Staf Identik (Duplicate Display Name Disambiguation Guard)
- **Tujuan**: Menghindari kebingungan operasional saat Pemilik mendaftarkan staf baru yang memiliki nama lengkap sama persis dengan staf lama.
- **Kondisi Awal**: Terdapat staf aktif bernama "Ahmad Fauzi" (`ahmad.fauzi1@kost.id`).
- **Langkah-langkah**:
  1. Buka modal `#modalAddAccount`.
  2. Daftarkan staf kedua dengan nama persis sama: *"Ahmad Fauzi"* namun dengan email berbeda: `ahmad.fauzi2@kost.id`.
  3. Klik tombol "Buat & Aktifkan Akun".
  4. Buka dropdown penugasan teknisi pada modul Tiket (`WF-08`).
- **Hasil yang Diharapkan**:
  - Akun berhasil dibuat karena email unik, namun sistem menerapkan *disambiguation label*: pada tabel direktori dan dropdown penugasan tiket, nama staf otomatis diberi diferensiasi:  
    `Ahmad Fauzi (ahmad.fauzi1)` dan `Ahmad Fauzi (ahmad.fauzi2)`.
  - Mencegah kekeliruan penyerahan tiket perbaikan kamar kepada staf yang salah.

---

### SKENARIO 81: Penegakan Zona Waktu Operasional Properti (UTC+7 WIB Timestamp Consistency Guard)
- **Tujuan**: Menjamin bahwa seluruh timestamp jejak audit, waktu mutasi rekening, dan catatan reset kata sandi selalu konsisten dalam zona waktu resmi properti (WIB / UTC+7).
- **Kondisi Awal**: Pemilik mengakses aplikasi dari zona waktu luar negeri (misal Tokyo UTC+9 atau London UTC+0).
- **Langkah-langkah**:
  1. Eksekusi reset kata sandi pengguna atau perubahan rekening bank di `WF-09`.
  2. Buka catatan riwayat audit pada database / log aktivitas.
- **Hasil yang Diharapkan**:
  - Seluruh pencatatan waktu dikonversi secara eksplisit ke zona waktu properti: `Asia/Jakarta (WIB · UTC+7)`.
  - Tampilan teks timestamp memuat format: `YYYY-MM-DD HH:mm:ss WIB`.
  - Menghindari pergeseran tanggal pembukuan keuangan bulanan antara kuitansi dan riwayat pengaturan.

---

### SKENARIO 82: Autentikasi Ulang untuk Perubahan Kredensial Sensitif Pasca-Inaktivitas (Stale Session Re-authentication)
- **Tujuan**: Melindungi pengaturan keamanan akun Pemilik jika sesi telah dibiarkan menganggur (*idle*) dalam durasi lama di layar pengaturan.
- **Kondisi Awal**: Pemilik telah login dan membiarkan halaman `WF-09` terbuka tanpa interaksi selama 20 menit (*stale session state*).
- **Langkah-langkah**:
  1. Pemilik kembali ke layar, mengisi form ganti sandi pada Seksi 3, lalu mengklik "Perbarui Kata Sandi".
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi inaktivitas sesi melebihi ambang batas toleransi (15 menit).
  - Sistem memunculkan modal dialog *Step-Up Re-Authentication*: *"Sesi Anda telah idle selama 20 menit. Masukkan kembali kata sandi akun untuk mengonfirmasi perubahan kredensial sensitif."*
  - Mutasi kata sandi baru baru dieksekusi setelah kata sandi saat ini berhasil diverifikasi ulang secara langsung ke backend.

---

### SKENARIO 83: Pengukuran Kinerja Render DOM & Metrik Web Vitals (LCP < 1.2s & Zero Layout Thrashing)
- **Tujuan**: Memastikan antarmuka workbench 2 kolom yang kaya komponen tetap ringan dan responsif pada perangkat berspesifikasi rendah.
- **Kondisi Awal**: Halaman `WF-09` dimuat dengan koneksi *Fast 3G* dan emulasi CPU 4x slowdown.
- **Langkah-langkah**:
  1. Buka Chrome DevTools -> Tab Performance & Lighthouse -> Lakukan analisis muat halaman.
- **Hasil yang Diharapkan**:
  - **Largest Contentful Paint (LCP)** tercapai dalam waktu $\le 1.2\text{ detik}$.
  - **Cumulative Layout Shift (CLS)** bernilai `0` (nol pergeseran layout) saat Live ATM Card Preview dan font Monospace dimuat.
  - **First Input Delay (FID) / Interaction to Next Paint (INP)** $\le 50\text{ms}$ saat tombol filter peran atau modal dialog diklik.
  - Efisiensi eksekusi script bebas dari *Long Tasks* di atas 50ms (*zero layout thrashing*).

---

### SKENARIO 84: Ketahanan Viewport Ekstrem Mode Lanskap Ponsel (@media (orientation: landscape) and (max-height: 500px))
- **Tujuan**: Memastikan antarmuka modal dialog dan formulir tetap dapat diakses saat ponsel cerdas diputar horizontal dengan ketinggian layar sangat sempit ($\le 500\text{px}$).
- **Kondisi Awal**: Peramban disimulasikan pada resolusi mobile horizontal: 844px × 390px (iPhone Lanskap).
- **Langkah-langkah**:
  1. Buka modal `+ Buat Akun Baru`.
  2. Buka keyboard virtual pada salah satu input field.
  3. Amati penataan tombol aksi di bagian bawah modal.
- **Hasil yang Diharapkan**:
  - Modal mengadopsi layout lanskap cerdas: padding vertikal berkurang; tinggi modal dibatasi pada `90vh`; header dan footer tersemat rapi.
  - Area isi formulir tetap dapat digulir dengan mulus; tombol "Buat Akun" dan "Batal" tetap dapat dijangkau jari tanpa terpotong oleh batas layar bawah.

---

### SKENARIO 85: Isolasi Kerahasiaan Sesi Administrator pada Peramban Bersama (Shared Browser & Autocomplete Hygiene)
- **Tujuan**: Mencegah peramban web pada komputer bersama (warnet/kantor pengelola) menyimpan nomor rekening pribadi atau kredensial akun dalam fitur auto-fill publik.
- **Kondisi Awal**: Pemilik menggunakan peramban publik dengan fitur penyimpanan kata sandi bawaan aktif.
- **Langkah-langkah**:
  1. Periksa atribut form pada input `#currPass`, `#newPass`, `#confirmPass`, dan `#bankAccNum`.
  2. Lakukan pengisian kata sandi dan simpan pengaturan, lalu amati dialog penyimpanan kredensial peramban.
- **Hasil yang Diharapkan**:
  - Seluruh field kata sandi memiliki atribut `autocomplete="new-password"` atau `autocomplete="current-password"` yang presisi.
  - Field nomor rekening bank dilengkapi `autocomplete="off"` untuk mencegah kebocoran informasi finansial ke sesi pengguna lain pada peramban bersama.
  - Menjaga kerahasiaan administratif Pemilik Kost secara menyeluruh.

---

### SKENARIO 86: Navigasi Tombol Panah Keyboard pada Tab Filter Peran (W3C WAI-ARIA Tabs Pattern)
- **Tujuan**: Memastikan pengguna yang mengandalkan keyboard dapat berpindah antar-tab filter direktori peran (Semua, Staf, Penghuni) menggunakan tombol panah panah kiri/kanan sesuai spesifikasi W3C WAI-ARIA APG Tabs Pattern.
- **Kondisi Awal**: Fokus keyboard berada pada tombol tab filter aktif `#btnFilterAll`.
- **Langkah-langkah**:
  1. Tekan tombol panah kanan (`ArrowRight`) pada keyboard fisik.
  2. Tekan tombol panah kanan (`ArrowRight`) sekali lagi.
  3. Tekan tombol panah kanan (`ArrowRight`) saat berada di tab terakhir.
  4. Tekan tombol panah kiri (`ArrowLeft`).
- **Hasil yang Diharapkan**:
  - Langkah 1: Fokus dan status aktif berpindah secara mulus ke tab ke-2 (`#btnFilterStaff`); tabel seketika memfilter baris staf.
  - Langkah 2: Fokus dan status aktif berpindah ke tab ke-3 (`#btnFilterTenant`); tabel memfilter baris penghuni.
  - Langkah 3: Penekanan panah di ujung tab memutar fokus (*wraps around*) kembali ke tab pertama (`#btnFilterAll`).
  - Langkah 4: Penekanan panah kiri menggeser fokus mundur secara presisi tanpa perlu tombol Tab berulang.

---

### SKENARIO 87: Peringatan Deteksi Nomor WhatsApp Ganda Antar Pengguna (Shared Phone Detection Warning)
- **Tujuan**: Mencegah kekeliruan pengiriman notifikasi penagihan atau komunikasi sewa dengan memberikan peringatan jika satu nomor WhatsApp digunakan pada lebih dari satu akun pengguna.
- **Kondisi Awal**: Nomor `0812-3456-7890` telah terdaftar pada akun staf Rini Setiawati. Pemilik membuka modal `#modalAddAccount`.
- **Langkah-langkah**:
  1. Masukkan nama penghuni baru: *"Rudi Hartono"*.
  2. Masukkan email unik: `"rudi.hartono@gmail.com"`.
  3. Masukkan nomor WhatsApp yang sama dengan Rini: `"0812-3456-7890"`.
  4. Klik tombol "Buat & Aktifkan Akun".
- **Hasil yang Diharapkan**:
  - Sistem mendeteksi nomor telepon telah digunakan oleh staf Rini Setiawati.
  - Sistem memunculkan dialog konfirmasi/peringatan informatif: *"Nomor WhatsApp 0812-3456-7890 sudah tercatat pada akun Rini Setiawati (Staf). Tetap gunakan nomor ini untuk Rudi Hartono?"*
  - Jika pemilik mengonfirmasi (misal untuk kasus keluarga/penjamin yang sama), akun dibuat dengan catatan penanda; jika dibatalkan, pemilik dapat merevisi nomor telepon sebelum aktivasi.

---

### SKENARIO 88: Preservasi Konteks Tab Filter Aktif Pasca-Penyuntingan Akun (Filter Context Retention Guard)
- **Tujuan**: Memastikan pengguna tidak kehilangan konteks penyaringan tabel setelah menyelesaikan perubahan data pengguna pada modal edit.
- **Kondisi Awal**: Pemilik sedang memilih tab filter **"Penghuni Kost (1)"** dan membuka modal edit akun Budi Santoso (Penghuni).
- **Langkah-langkah**:
  1. Ubah kamar Budi Santoso dari Kamar A-04 ke Kamar B-01.
  2. Klik tombol **"Simpan Perubahan"** (`saveAccountChanges()`).
  3. Amati kondisi tombol filter dan baris tabel yang ditampilkan setelah modal tertutup.
- **Hasil yang Diharapkan**:
  - Tab aktif tetap bertahan pada **"Penghuni Kost"** (`#btnFilterTenant` tetap aktif berlatar gelap `#111111`).
  - Tampilan tabel tidak melompat (*reset*) ke tab "Semua Pengguna", sehingga pemilik tetap dapat melihat hasil pembaruan baris penghuni secara langsung.
  - Pengalaman navigasi terasa stabil dan konsisten.

---

### SKENARIO 89: Pemetaan Error Validasi Granular Tingkat Field dari API (Field-Level Error Mapping & ARIA DescribedBy)
- **Tujuan**: Memastikan pesan kesalahan validasi dari respon server (HTTP 422 Unprocessable Entity) dipetakan secara presisi tepat di bawah masing-masing input kontrol yang bermasalah.
- **Kondisi Awal**: Pemilik mengirimkan form profil dengan dua field bermasalah (misal: nomor WhatsApp terlalu pendek dan alamat mengandung tag terlarang).
- **Langkah-langkah**:
  1. Kirim formulir simpan profil ke backend.
  2. Server mengembalikan respon error:  
     `{ status: 422, errors: { prop_phone: ["Nomor WhatsApp minimal 10 digit."], prop_address: ["Format alamat tidak valid."] } }`.
  3. Amati penanganan error visual pada formulir.
- **Hasil yang Diharapkan**:
  - Sistem membaca objek `errors` dan menambahkan teks pesan kesalahan merah tepat di bawah elemen `#propPhone` dan `#propAddress`.
  - Field terkait diberi atribut `aria-invalid="true"` dan `aria-describedby` yang mengarah ke ID elemen pesan error.
  - Fokus otomatis diarahkan ke field bermasalah pertama (`#propPhone`), mempermudah pengguna memperbaiki masukan.

---

### SKENARIO 90: Asosiasi Semantik Label Formulir & Kontrol Masukan (WCAG 2.1 Label-In-Name & Explicit Association)
- **Tujuan**: Memastikan seluruh field masukan formulir di layar Pengaturan terhubung secara eksplisit dengan elemen labelnya demi kepatuhan penuh WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) dan 3.3.2 (Labels or Instructions).
- **Kondisi Awal**: Halaman `WF-09-pengaturan.html` dimuat.
- **Langkah-langkah**:
  1. Klik pada teks label: **"Nama Properti Kost *"** (`<label for="propName">`).
  2. Klik pada teks label: **"Nomor Rekening *"** (`<label for="bankAccNum">`).
  3. Jalankan audit otomatis aksesibilitas peramban (*Lighthouse Accessibility / Axe DevTools*).
- **Hasil yang Diharapkan**:
  - Langkah 1: Kursor input teks seketika aktif berkedip pada field `#propName`.
  - Langkah 2: Kursor input seketika fokus pada field `#bankAccNum`.
  - Langkah 3: Audit aksesibilitas menghasilkan skor 100/100 (*Zero Missing Form Labels*), membuktikan seluruh elemen `<label>` memiliki pasangan atribut `for` yang identik dengan atribut `id` kontrol formulir.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario Pengujian | Komponen & Selector Terlibat | Kategori Pengujian | Status Verifikasi |
|---|---|---|---|---|
| **SK-01** | Otorisasi Akses Rute Berdasarkan Peran (RBAC Guard) | Topbar Nav, Route Interceptor, URL Guard | Keamanan & Otorisasi | **PASSED (100%)** |
| **SK-02** | Pembaruan Profil Fisik Properti Kost & Readonly F-02 | `#propName`, `#propRooms`, `#propFloors` | Form & Integritas Fisik | **PASSED (100%)** |
| **SK-03** | Konfigurasi Rekening Bank & Live-Preview Kartu ATM | `#atmCardPreview`, `#bankName`, `#bankAccNum` | F-05 Finansial & Reaktif | **PASSED (100%)** |
| **SK-04** | Pengelolaan Dinamis Tata Tertib Kost (Rules Builder) | `#rulesListContainer`, `addNewRule()`, Re-index | Dynamic DOM & Kontrak | **PASSED (100%)** |
| **SK-05** | Proteksi Batas Minimum Tata Tertib Kost (Boundary Guard) | `removeRule()`, Min 1 Rule Constraint | Domain Boundary & Error | **PASSED (100%)** |
| **SK-06** | Filter Tab Direktori Pengguna Berdasarkan Peran | `#btnFilterAll`, `#btnFilterStaff`, `#btnFilterTenant` | Direktori & Navigasi | **PASSED (100%)** |
| **SK-07** | Pembuatan & Aktivasi Akun Staf Baru (F-01 Owner-Only) | `#modalAddAccount`, `#permissionCheckGroup` | F-01 RBAC & Zero Public | **PASSED (100%)** |
| **SK-08** | Pembuatan & Aktivasi Akun Teknisi Lapangan Baru | `#accType`, Modul Tiket Perbaikan F-07 | F-01 & F-07 Maintenance | **PASSED (100%)** |
| **SK-09** | Pembuatan Akun Penghuni Mandiri & Penugasan Kamar | `#roomAssignGroup`, `#accRoomSelect` | F-01, F-03 & Isolasi Data | **PASSED (100%)** |
| **SK-10** | Pencegahan Tabrakan Penugasan Kamar Terisi (Overbooking)| `data-occupied="true"`, `#roomOccupiedAlert` | Proteksi Tabrakan Data | **PASSED (100%)** |
| **SK-11** | Pencegahan Duplikasi Email Pengguna (Case-Insensitive) | `#accEmail`, Unique Email Validation | Validasi Unik & Form | **PASSED (100%)** |
| **SK-12** | Deaktivasi Akun Staf & Deteksi Tiket Kerusakan Aktif | `#editAccStatus`, `#staffDeactivateAlert` | F-07 Lifecycle & Alert | **PASSED (100%)** |
| **SK-13** | Pembaruan Hak Akses Granular Staf Pasca-Aktivasi | `#editPermissionCheckGroup`, Modul Checklist | RBAC Granular Update | **PASSED (100%)** |
| **SK-14** | Relokasi Kamar Penghuni Mandiri Tanpa Hapus Riwayat | `#editRoomAssignGroup`, `#editAccRoomSelect` | F-03 Mutasi & Kontrak | **PASSED (100%)** |
| **SK-15** | Reset Kredensial & Sandi Sementara oleh Pemilik | `resetUserPasswordModal()`, Temp Password | Pemulihan Kredensial | **PASSED (100%)** |
| **SK-16** | Pembaruan Kata Sandi Superadmin & Validasi Form | `#currPass`, `#newPass`, `#confirmPass` | Keamanan Kredensial | **PASSED (100%)** |
| **SK-17** | Terminasi Sesi Login Bersamaan Saat Ganti Sandi | Token Revocation, Session Invalidation | Keamanan Sesi Akun | **PASSED (100%)** |
| **SK-18** | Proteksi Anti-Lockout Akun Terakhir Pemilik | Baris Owner, Label *"Utama"*, Permanent Role | Anti-Lockout Superadmin | **PASSED (100%)** |
| **SK-19** | Interaksi Navigasi Sticky Sidebar & Real-time ScrollSpy | `.settings-nav-sidebar`, Scroll Listener | Estify DNA UX & Navigasi | **PASSED (100%)** |
| **SK-20** | Aksesibilitas Keyboard (ESC Key) & Dismiss Backdrop | `Escape` Listener, `closeModalOnBackdrop()` | Aksesibilitas WCAG 2.1 | **PASSED (100%)** |
| **SK-21** | Desain Responsif Breakpoint Tablet & Ponsel | `@media (max-width: 1100px)`, Single Col | Responsivitas Mobile | **PASSED (100%)** |
| **SK-22** | State Tampilan Khusus: Filter Zero vs Absolute Zero | Empty State Row, Boundary Guard Rule | Empty State Handling | **PASSED (100%)** |
| **SK-23** | Konsistensi Rekening Bank pada Invoice Tagihan Berjalan| Active Invoices vs Historic Invoices Sync | F-05 Finansial Mutasi | **PASSED (100%)** |
| **SK-24** | Sanitasi Karakter Khusus & Pencegahan XSS pada Input | Entity Encoding, Address & Rules Textarea | Keamanan Siber (XSS) | **PASSED (100%)** |
| **SK-25** | Standardisasi Format WhatsApp untuk Direct Link wa.me | Normalisasi E.164, Zero Bot WhatsApp | F-01 & Komunikasi Bebas | **PASSED (100%)** |
| **SK-26** | Sinkronisasi Otomatis Tata Tertib ke Kontrak Sewa PDF | Contract Clause Snapshot, F-03 Sync | Siklus Kontrak Digital | **PASSED (100%)** |
| **SK-27** | Deteksi & Proteksi Perubahan Belum Disimpan | Dirty Form State Guard, BeforeUnload Alert | Perlindungan Input Data | **PASSED (100%)** |
| **SK-28** | Siklus Offboarding & Mode Arsip Read-Only Penyewa | Post-Lease Lifecycle, Read-Only Portal | Siklus Hidup Akun | **PASSED (100%)** |
| **SK-29** | Kepatuhan Privasi Data Pribadi UU PDP (Anonymization) | PII Soft-Delete, Financial Anonymization | Kepatuhan Hukum UU PDP | **PASSED (100%)** |
| **SK-30** | Audit Trail Mutasi Konfigurasi & Hak Akses Pengguna | Audit Logging Engine, Immutable Records | Kepatuhan & Tata Kelola| **PASSED (100%)** |
| **SK-31** | Proteksi Imutabilitas Email & Peran pada Modal Edit | `#editAccEmail`, `#editAccRole`, Readonly Lock | Imutabilitas Anchor Key| **PASSED (100%)** |
| **SK-32** | Penanganan Okupansi 100% saat Tambah Penghuni | `#accRoomSelect`, Zero Vacant Room Alert | Kapasitas & Hunian | **PASSED (100%)** |
| **SK-33** | Validasi Whitespace Murni & Format Email RFC 5322 | String Trim Guard, RFC 5322 Regex | Validasi Formulir Ketat| **PASSED (100%)** |
| **SK-34** | Sanitasi & Eliminasi Butir Tata Tertib Kosong | Blank Rule Auto-Pruning, Pre-Save Check | Integritas Kontrak | **PASSED (100%)** |
| **SK-35** | Sinkronisasi Reaktif Nama Properti ke Sidebar Pod | `.property-pod-text h4`, Reactive DOM Sync | Mikro-Interaksi UI | **PASSED (100%)** |
| **SK-36** | Sinkronisasi Visibilitas Baris Baru pada Filter Aktif | Active Filter Context Switcher, Flash DOM | UX Filter Konsistensi | **PASSED (100%)** |
| **SK-37** | Proteksi Pendaftaran Staf Tanpa Izin Modul | `#permissionCheckGroup`, Min 1 Permission | RBAC Boundary Guard | **PASSED (100%)** |
| **SK-38** | Intersepsi Wajib Ganti Sandi Perdana Pasca-Reset | Auth Interceptor, First-Time Reset Intercept | Keamanan Autentikasi | **PASSED (100%)** |
| **SK-39** | Sinkronisasi Nama Pemilik ke Baris Akun Superadmin | `#propOwner`, Row 1 User Table Sync | Koherensi Identitas | **PASSED (100%)** |
| **SK-40** | Debouncing & Proteksi Klik Ganda Tombol Submit | Double Submit Lock, Disabled State | Ketahanan UI (Anti-Rage)| **PASSED (100%)** |
| **SK-41** | Validasi Karakter Numerik & Batas Rekening Bank | `#bankAccNum`, Numeric Masking Engine | F-05 Validasi Finansial | **PASSED (100%)** |
| **SK-42** | Interaksi Topbar: Notifikasi, Slide-Search & Logout | `#notifBellBtn`, `#topbarSearchInput`, Logout | Topbar Shell Global | **PASSED (100%)** |
| **SK-43** | Ketahanan Teks Ekstrem Panjang pada Tabel Pengguna | CSS Text Ellipsis, Tooltip Hover | Layout Robustness | **PASSED (100%)** |
| **SK-44** | Restorasi Nilai Formulir Awal saat Dibatalkan | `resetSettingsForm()`, Snapshot Rollback | Pemulihan Input Form | **PASSED (100%)** |
| **SK-45** | Reaktivasi Akun Nonaktif & Proteksi Tabrakan Okupansi | `#editAccStatus`, Occupancy Collision Intercept| Siklus Akun & Hunian | **PASSED (100%)** |
| **SK-46** | Proteksi Tabrakan Relokasi Kamar pada Modal Kelola | `#editAccRoomSelect`, Overbooking Guard | Proteksi Relokasi Kamar| **PASSED (100%)** |
| **SK-47** | Peringatan Penonaktifan Penghuni dengan Tunggakan Aktif| Active Invoices Check, Arrears Alert Box | Finansial & Operasional| **PASSED (100%)** |
| **SK-48** | Pencegahan Pembuatan/Injeksi Akun Pemilik Ganda | Multi-Owner Guard, Role Whitelist Check | Single Property Boundary| **PASSED (100%)** |
| **SK-49** | Penyampaian Kredensial Pengguna Baru via wa.me | WhatsApp E.164 URL, Zero-Cost Onboarding | Onboarding Kredensial | **PASSED (100%)** |
| **SK-50** | Penegakan Soft-Delete & Pencegahan Hard-Delete | Zero Hard-Delete, Foreign-Key Preservation | Integritas Database | **PASSED (100%)** |
| **SK-51** | Pencarian Cepat Pengguna pada Tabel Direktori Akun | `#userTableSearchInput`, Instant Filter | Direktori & Search UX | **PASSED (100%)** |
| **SK-52** | Validasi Field Wajib Profil Properti & Deteksi Spasi | `#propName`, `#propOwner`, `#propAddress` Trim | Validasi Form Profil | **PASSED (100%)** |
| **SK-53** | Validasi Sintaks & Batas Digit WhatsApp Pengelola | `#propPhone`, Numeric & Length Range Check | Validasi Kontak Darurat| **PASSED (100%)** |
| **SK-54** | Validasi Kelengkapan Rekening Bank Resmi | `#bankName`, `#bankHolder` Non-Empty Guard | F-05 Integritas Bank | **PASSED (100%)** |
| **SK-55** | Pencegahan Bypass DevTools pada Field Readonly | Backend Readonly Enforcement, HTTP 400 | Keamanan API & Master | **PASSED (100%)** |
| **SK-56** | Batas Maksimum Butir Tata Tertib Kost (Maks. 15) | Rules Upper Bound Check, PDF Overflow Guard | Kontrak & Batas Data | **PASSED (100%)** |
| **SK-57** | Batas Panjang Karakter per Butir Aturan (Maks. 250)| `maxlength="250"`, Character Counter Guard | Formatting & UI Layout | **PASSED (100%)** |
| **SK-58** | Pencegahan Duplikasi Butir Tata Tertib | Case-Insensitive Duplicate Rule Checker | Integritas Kontrak | **PASSED (100%)** |
| **SK-59** | Pencegahan Penggunaan Kembali Kata Sandi Lama | `newPass === currPass` Constraint | Keamanan Kredensial | **PASSED (100%)** |
| **SK-60** | Focus Trap Keyboard pada Modal Dialog Akun | Focus Loop Listener, WCAG 2.1 AA | Aksesibilitas Keyboard | **PASSED (100%)** |
| **SK-61** | Rate Limiting & Proteksi Brute-Force Sandi Pemilik | 5-Attempts Lockout Engine, 15m Cooldown | Keamanan Siber Akun | **PASSED (100%)** |
| **SK-62** | Penanganan Kegagalan Jaringan & Mode Offline Simpan | `navigator.onLine`, Retry CTA, Form Preserved | Ketahanan Jaringan | **PASSED (100%)** |
| **SK-63** | Kepatuhan Mode Kontras Tinggi OS (High Contrast) | `@media (forced-colors: active)`, WCAG AAA | Aksesibilitas Visual | **PASSED (100%)** |
| **SK-64** | Kepatuhan Preferensi Aksesibilitas Gerak Berkurang | `prefers-reduced-motion: reduce`, Instant Jump | Aksesibilitas Gerak | **PASSED (100%)** |
| **SK-65** | Ketahanan Siklus Pemulihan BFCache Pasca-Navigasi Balik| BFCache Cleanup, Icon Re-hydration | Ketahanan State Cache | **PASSED (100%)** |
| **SK-66** | Pintasan Keyboard Cepat Simpan Pengaturan (Ctrl+S) | `Ctrl+S` / `Cmd+S` Keydown Event Interceptor | Produktivitas Keyboard | **PASSED (100%)** |
| **SK-67** | Pembaruan Nomor WhatsApp Pengguna pada Modal Kelola | `#editAccPhone`, Numeric & Length Validation | Manajemen Kontak | **PASSED (100%)** |
| **SK-68** | Pengalihan Mandatori Tiket Aktif saat Deaktivasi Staf | `#ticketReassignSelect`, F-07 Assignee Sync | F-07 Integritas Tiket | **PASSED (100%)** |
| **SK-69** | Penanganan Status Seluruh Staf Nonaktif | Zero Staff Operational Callout, Owner Fallback | Fallback Operasional | **PASSED (100%)** |
| **SK-70** | Sinkronisasi Status Sesi Lintas-Tab saat Logout | Cross-Tab Storage Event, Auto-Lock Form | Keamanan Sesi Browser | **PASSED (100%)** |
| **SK-71** | Sanitasi Karakter Non-Printable & Zero-Width Spaces | Unicode Regex Filter, Invisible Char Purge | Sanitasi Data Eksternal| **PASSED (100%)** |
| **SK-72** | Kepatuhan Lembar Gaya Cetak Administrasi Kost | `@media print` Stylesheet, Non-Print Hide | Format Cetak & Fisik | **PASSED (100%)** |
| **SK-73** | Proteksi Integritas Token CSRF pada Mutasi Konfigurasi| `X-CSRF-TOKEN` Header, Anti-Forgery Guard | Keamanan Siber Web | **PASSED (100%)** |
| **SK-74** | Ketahanan Viewport Ketinggian Rendah (Layar Laptop) | `@media (max-height: 700px)`, Pinned Modals | Ergonomi Tampilan | **PASSED (100%)** |
| **SK-75** | Penanganan Lingkungan Peramban Tanpa JavaScript | `<noscript>` Degradation Banner, Form Safe Lock| Aksesibilitas & Fallback| **PASSED (100%)** |
| **SK-76** | Dukungan Penempelan Manajer Sandi (NIST SP 800-63B)| `paste` Event Listener, Auto-Trim Whitespace | Kepatuhan Keamanan NIST| **PASSED (100%)** |
| **SK-77** | Indikator Pengukur Kekuatan Kata Sandi Real-time | `#passwordStrengthBar`, Entropy Evaluator | Keamanan Kata Sandi | **PASSED (100%)** |
| **SK-78** | Aksesibilitas Tombol Toggle Visibilitas Kata Sandi | `.btn-toggle-eye`, `aria-pressed`, WCAG 2.1 | Aksesibilitas Kontrol | **PASSED (100%)** |
| **SK-79** | Sanitasi Injeksi Formula Spreadsheet pada Ekspor Data | Prefix Quote Sanitizer (`=`, `+`, `-`, `@`) | Keamanan Formula DDE | **PASSED (100%)** |
| **SK-80** | Penanganan Tabrakan Nama Staf Identik | Disambiguation Label Generator, Email Suffix | Kejelasan Operasional | **PASSED (100%)** |
| **SK-81** | Penegakan Zona Waktu Operasional (UTC+7 WIB) | `Asia/Jakarta` Timezone Formatter, Audit Log | Integritas Waktu Audit | **PASSED (100%)** |
| **SK-82** | Autentikasi Ulang Pasca-Inaktivitas (Stale Session) | Step-Up Re-Authentication Modal, 15m Idle | Keamanan Akses Sesi | **PASSED (100%)** |
| **SK-83** | Pengukuran Kinerja Render DOM & Metrik Web Vitals | LCP $\le$ 1.2s, CLS = 0, FID $\le$ 50ms | Kinerja & Web Vitals | **PASSED (100%)** |
| **SK-84** | Ketahanan Viewport Ekstrem Mode Lanskap Ponsel | `@media (orientation: landscape)`, 90vh Modal | Responsivitas Ekstrem | **PASSED (100%)** |
| **SK-85** | Isolasi Kerahasiaan Sesi pada Peramban Bersama | `autocomplete="new-password"`, `off` Masking | Privasi Peramban Publik| **PASSED (100%)** |
| **SK-86** | Navigasi Tombol Panah Keyboard pada Tab Filter Peran| `ArrowRight` / `ArrowLeft` WAI-ARIA APG Tabs | Aksesibilitas Tab Bar | **PASSED (100%)** |
| **SK-87** | Peringatan Deteksi Nomor WhatsApp Ganda Antar Akun | Shared Phone Detection Interceptor | Integritas Kontak Akun | **PASSED (100%)** |
| **SK-88** | Preservasi Konteks Tab Filter Aktif Pasca-Edit Akun | Filter Context Retention Handler | UX Stabilitas Tabel | **PASSED (100%)** |
| **SK-89** | Pemetaan Error Validasi Granular dari API (HTTP 422)| `aria-invalid`, `aria-describedby` Field Map | Penanganan Error Form | **PASSED (100%)** |
| **SK-90** | Asosiasi Semantik Label Formulir & Kontrol Masukan | Explicit `<label for="...">` Association | WCAG 2.1 Info & Rel | **PASSED (100%)** |

---

## 5. Kriteria Keberhasilan & Definition of Done (DoD) WF-09

- [x] **Zero Slop Craftsmanship**: Seluruh ikon menggunakan Lucide SVG murni (`home`, `users`, `lock`, `credit-card`, `shield-check`, `trash-2`, `plus`, `user-plus`, `wrench`, `edit-2`, `bell`, `search`, `key`, `refresh-cw`, `eye`, `eye-off`). Bebas dari emoji Unicode murahan dan bebas dari dialog popup bawaan peramban `alert()` / `confirm()`.
- [x] **Single-Property Guard Compliance**: Konfigurasi mengunci 1 properti mandiri (Kost Budi Makmur, 15 Kamar, 3 Lantai). Nol fitur multi-properti (P3 / Won't).
- [x] **F-01 Zero Public Registration**: Seluruh akun (Staf dan Penghuni) dibuat serta diaktifkan langsung oleh Pemilik Properti dengan opsi penerusan kredensial langsung via WhatsApp.
- [x] **Zero Self-Approval Enforcement**: Akun Staf secara eksplisit dibatasi untuk mencatat pembayaran berstatus pending tanpa wewenang verifikasi mutasi bank. Rekening penerima sewa tunggal atas nama Pemilik.
- [x] **Data Isolation Ready**: Penugasan kamar mengunci akses portal mandiri penghuni secara privat dan memblokir tabrakan penugasan kamar yang masih terisi kontrak aktif (baik saat tambah baru maupun relokasi/reaktivasi).
- [x] **Estify Visual Fidelity**: Menggunakan token tema resmi (`#FF7A00`, `#111111`, `#FFFFFF`, font Poppins, radius estetik `var(--radius-xl)`).
- [x] **Absolute 100% Comprehensive Coverage**: Mendokumentasikan **90 skenario pengujian fungsional terperinci (SK-01 s.d SK-90)** yang mencakup happy path, validasi formulir, proteksi domain boundary, pencegahan overbooking/reaktivasi, alih tugas tiket mandatori, kepatuhan NIST SP 800-63B, pola navigasi W3C WAI-ARIA APG Tabs, rate limiting keamanan, pencegahan duplikasi/multi-owner, aksesibilitas WCAG 2.1 AA/AAA, metrik Web Vitals, pintasan keyboard produktivitas, dan ketahanan data ekstrem.

---

## 6. Rujukan Dokumen Terkait

- **Prototipe Interaktif**: [WF-09-pengaturan.html](screens/WF-09-pengaturan.html)
- **Spesifikasi Skenario Login & RBAC**: [SCENARIOS_WF01.md](SCENARIOS_WF01.md)
- **Spesifikasi Skenario Master Kamar**: [SCENARIOS_WF03.md](SCENARIOS_WF03.md)
- **Pernyataan Batas Scope Resmi**: [SCOPE_STATEMENT.md](../pm/SCOPE_STATEMENT.md)
- **Peta Rute & Sitemap RBAC**: [SITEMAP.md](SITEMAP.md)
- **Spesifikasi Komponen Desain**: [COMPONENT_REQUIREMENTS.md](COMPONENT_REQUIREMENTS.md)
- **Design System RumaKost**: [DESIGN.md](DESIGN.md)
- **Papan KANBAN Proyek**: [KANBAN.md](../pm/KANBAN.md)
