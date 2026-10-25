

# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-01: Autentikasi Terpusat, Segmentasi Tiga Peran & Gerbang Masuk (SCR-01)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-01-login.html`  
> **Fitur Terkait**: **F-01** (Akses dan Peran / RBAC), **F-02** s.d. **F-07** (Routing Otorisasi Pasca-Login)  
> **User Stories KANBAN**: `RK-001` (Epic Akses Owner, Staff, dan Penghuni), `RK-019` (Masuk dan Keluar Akun), `RK-020` (Pembatasan Akses Berdasarkan Role), `RK-021` (Pembuatan & Aktivasi Akun Pengguna)  
> **Hak Akses Layar**: **Publik / Guest / Calon Pengguna Terdaftar (Unauthenticated State)**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-01 (`SCR-01`)** adalah gerbang autentikasi terpusat tunggal (*Single Entry Point*) untuk seluruh ekosistem aplikasi RumaKost. Layar ini mengimplementasikan tata letak split-screen modern terstandarisasi Estify Design DNA, yang membagi area menjadi visual arsitektur hunian 3D di sisi kiri dan panel formulir kredensial terstruktur di sisi kanan.

Layar ini menegakkan prinsip arsitektural inti:
1. **Zero Public Registration (Tanpa Registrasi Terbuka)**: Sistem secara sadar tidak menyediakan formulir pendaftaran akun mandiri untuk publik. Seluruh akun (Staf Pengelola dan Penghuni) wajib diinisiasi dan diaktifkan secara eksklusif oleh Pemilik Properti melalui modul Pengaturan (`WF-09` / `SCR-16`).
2. **Three-Role Segmented Control**: Pengguna diarahkan untuk memilih peran operasionalnya terlebih dahulu (Pemilik, Staf Pengelola, atau Penghuni) sebelum atau saat memasukkan kredensial, memberikan kejelasan konteks hak akses dan tujuan rute aplikasi.
3. **Role-Based Dynamic Redirection**: Berdasarkan kredensial dan peran yang terverifikasi, sistem mengarahkan sesi secara cerdas ke dasbor eksekutif, dasbor operasional staf, atau portal mandiri penghuni yang terisolasi secara privat.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           WF-01 WORKBENCH ARSITEKTUR                             │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ 1. PANEL VISUAL KIRI (Media Side Panel) │ 2. PANEL FORMULIR KANAN (Form Panel)    │
│    • 100% Visual Arsitektur Hunian     │    • Brand Hero: Logo SVG + Tagline     │
│    • Clean, Zero Text/Overlay Slop     │    • H1 Intent: "Masuk ke Akun"         │
│    • Asset: login-showcase.png         │    • 3-Role Segmented Pill Bar          │
│    • Aspect Ratio Adaptif              │    • Input Email (Prefix Icon Lucide)   │
│    • Graceful Collapse pada Mobile     │    • Input Sandi + Toggle Eye Icon      │
│                                        │    • Ingat Saya & Lupa Kata Sandi       │
│                                        │    • Primary CTA 48px: "Masuk ke Akun"  │
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Matriks Data Baseline (Fixture Testing)

Berikut adalah data rujukan (*seed/fixture*) awal yang digunakan dalam seluruh skenario pengujian fungsional dan keamanan layar WF-01:

| ID Akun | Peran (Role) | Nama Pengguna | Alamat Email Uji | Kata Sandi Uji | Unit Kamar / Entitas | Target Rute Pasca-Login | Lingkup Wewenang & Hak Akses Sesi |
|---|---|---|---|---|---|---|---|
| **USR-01** | **Pemilik (Owner)** | Budi Santoso | `budi.santoso@rumakost.id` | `password123` | Seluruh Properti (15 Kamar) | `WF-02-dashboard.html` (`/dashboard`) | **Superadmin (Akses Penuh)**: Dasbor eksekutif keuangan, okupansi, master kamar, verifikasi pembayaran bank sewa, kelola tiket kerusakan, dan manajemen staf/rekening di `/pengaturan`. |
| **USR-02** | **Staf Pengelola (Staff)** | Rini Setiawati | `rini.operasional@rumakost.id` | `password123` | Operasional Gedung | `WF-02-dashboard.html?role=staf` (`/dashboard`) | **Operasional Lapangan**: Dasbor operasional harian, katalog kamar, direktori penghuni, pencatatan pembayaran pending (*Zero Self-Approval*), dan eksekusi tiket komplain. Diblokir dari Laporan Finansial dan Pengaturan Akun. |
| **USR-03** | **Penghuni Kost (Tenant)** | Budi Santoso (Penghuni) | `budi.penghuni@rumakost.id` | `password123` | Kamar A-04 (Lantai 1) | `WF-10-portal-penghuni.html` (`/portal`) | **Portal Mandiri Kamar (Isolasi Data)**: Terkunci pada data Kamar A-04 miliknya sendiri. Hanya dapat melihat tagihan miliknya, konfirmasi transfer pembayaran, dan pengajuan laporan kerusakan wajib foto/video (`WF-11`). |
| **USR-04** | **Staf Nonaktif (Disabled)** | Joko Supriyanto | `joko.nonaktif@rumakost.id` | `password123` | - (Akses Dicabut) | Ditolak (`HTTP 403 Forbidden`) | **Akses Dibekukan**: Akun dinonaktifkan oleh Pemilik di `WF-09`. Dilarang login ke sistem. |
| **USR-05** | **Penghuni Alumni (Expired)** | Siti Rahmawati | `siti.alumni@rumakost.id` | `password123` | Kamar B-01 (Mantan Penghuni)| `WF-10-portal-penghuni.html` (Read-Only) | **Mode Arsip Terbatas**: Kontrak sewa telah berakhir. Hanya dapat mengunduh riwayat kuitansi lama; pembuatan tiket baru dikunci. |
| **USR-06** | **Staf Baru (First Login)** | Ahmad Zaelani | `ahmad.staf@rumakost.id` | `RumaKost#2026!` | Operasional Gedung | Modal Ganti Sandi Sementara | **Force Password Change**: Akun baru dengan kredensial bawaan. Wajib mengganti kata sandi baru sebelum dapat mengakses sistem. |
| **USR-07** | **Penghuni Multi-Kamar** | Hendra Kusuma | `hendra.multi@rumakost.id` | `password123` | Kamar A-04 & Kamar A-05 | `WF-10-portal-penghuni.html` (Unit Selector) | **Penyewa Multi-Unit (1 Properti)**: Menyewa 2 kamar sekaligus di kost yang sama. Sistem menyediakan unit switcher kamar aktif di portal. |
| **USR-08** | **Calon Penghuni (Future Lease)**| Reza Firmansyah | `reza.calon@rumakost.id` | `password123` | Kamar C-01 (Check-in Mendatang) | `WF-10-portal-penghuni.html` (Pending State) | **Pra-Hunian (Pending Check-in)**: Akun dibuat oleh Pemilik, kontrak sewa baru mulai berlaku tanggal 1 bulan depan. Portal menyajikan hitung mundur check-in. |

---

## 3. Daftar Skenario End-to-End Terperinci

---

### SKENARIO 01 (SK-01): Login Berhasil sebagai Pemilik Properti (Owner Happy Path & Redirection)
- **Tujuan**: Memastikan Pemilik Properti dapat mengautentikasi diri dan dialihkan langsung ke Dasbor Eksekutif dengan wewenang penuh.
- **Kondisi Awal (Pre-condition)**: Pengguna berada pada halaman `WF-01-login.html`. Belum ada sesi login aktif.
- **Langkah-langkah**:
  1. Klik tab peran **"Pemilik"** pada segmented pill bar (terpilih secara default).
  2. Pastikan field email berisi `budi.santoso@rumakost.id` dan kata sandi terisi `password123`.
  3. Klik tombol utama **"Masuk ke Akun"** (`.btn-submit-main`).
- **Hasil Diharapkan**:
  - Validasi form HTML5 lolos.
  - Toast notifikasi sukses tampil: *"Kredensial valid. Mengarahkan Anda ke sistem..."* (Tipe: `success`, Judul: *"Masuk Berhasil"*).
  - Setelah jeda transisi halus 700ms, browser diarahkan ke `WF-02-dashboard.html`.
  - Pada dasbor, seluruh 7 navigasi pill utama aktif (Dashboard, Kamar, Penghuni, Tagihan, Pembayaran, Laporan, Tiket) serta menu Pengaturan dapat diakses tanpa hambatan.

---

### SKENARIO 02 (SK-02): Login Berhasil sebagai Staf Pengelola (Staff Happy Path & RBAC Query Param)
- **Tujuan**: Memverifikasi proses masuk akun Staf Operasional dan aktivasi pembatasan wewenang operasional (*Zero Self-Approval*).
- **Kondisi Awal**: Pengguna berada pada `WF-01-login.html`.
- **Langkah-langkah**:
  1. Klik tab peran **"Staf Pengelola"** (`#btnRoleStaff`) pada segmented pill bar.
     - *Verifikasi UI*: Tab Staf menjadi aktif (latar hitam `#111111`, teks putih); field email otomatis berganti ke `rini.operasional@rumakost.id`; muncul Toast info: *"Kredensial akun Staf disiapkan untuk operasional harian."*
  2. Pastikan password valid terisi (`password123`).
  3. Klik tombol **"Masuk ke Akun"**.
- **Hasil Diharapkan**:
  - Toast konfirmasi sukses muncul seketika: *"Kredensial valid. Mengarahkan Anda ke sistem..."*.
  - Browser diarahkan ke `WF-02-dashboard.html?role=staf`.
  - Pada dasbor, sistem mengenali parameter `role=staf`:
    - Muncul badge status peran: *"Staf Operasional"*.
    - Menu `Laporan` (`SCR-13`) dan `Pengaturan` (`SCR-16/17`) disembunyikan / dilarang aksesnya.
    - Menu `Pembayaran` dibatasi hanya untuk pencatatan pembayaran pending (*Zero Self-Approval*).

---

### SKENARIO 03 (SK-03): Login Berhasil sebagai Penghuni Kost (Tenant Happy Path & Portal Isolation)
- **Tujuan**: Menguji autentikasi penyewa kamar dan pengalihan ke portal swalayan mandiri (*Tenant Portal*).
- **Kondisi Awal**: Pengguna berada pada `WF-01-login.html`.
- **Langkah-langkah**:
  1. Klik tab peran **"Penghuni"** (`#btnRoleTenant`) pada segmented pill bar.
     - *Verifikasi UI*: Tab Penghuni aktif; email terisi `budi.penghuni@rumakost.id`; muncul Toast info: *"Kredensial akun Penghuni disiapkan untuk portal mandiri."*
  2. Klik tombol **"Masuk ke Akun"**.
- **Hasil Diharapkan**:
  - Toast konfirmasi sukses muncul.
  - Browser diarahkan ke `WF-10-portal-penghuni.html` (`/portal`).
  - Sistem menampilkan Beranda Kamar Mandiri (Kamar A-04): rincian tanggal jatuh tempo, sisa tagihan sewa berjalan, dan pintasan pelaporan kerusakan kamar (`WF-11`).
  - Penghuni tidak memiliki akses sama sekali ke navigasi dasbor manajerial pengelola.

---

### SKENARIO 04 (SK-04): Interaksi Segmented Control Role Switcher & Dynamic Field Adaptation
- **Tujuan**: Memastikan kontrol pemilih peran 3 arah berfungsi mulus (*frictionless*), responsif, dan konsisten terhadap interaksi klik cepat.
- **Kondisi Awal**: Halaman login terbuka.
- **Langkah-langkah**:
  1. Klik tombol **"Staf Pengelola"**.
     - *Verifikasi*: `#btnRoleStaff` mendapat class `.active`, dua tombol lainnya kehilangan class `.active`. Nilai input email berubah seketika menjadi `rini.operasional@rumakost.id`.
  2. Klik tombol **"Penghuni"**.
     - *Verifikasi*: `#btnRoleTenant` aktif, email berubah menjadi `budi.penghuni@rumakost.id`.
  3. Klik kembali ke **"Pemilik"**.
     - *Verifikasi*: `#btnRoleOwner` aktif, email kembali menjadi `budi.santoso@rumakost.id`.
  4. Periksa apakah transisi warna latar dan font berjalan mulus sesuai CSS token `var(--transition-fast)`.
- **Hasil Diharapkan**:
  - Tidak terjadi kedipan (*flicker*) atau lag interaksi.
  - Input email terisi secara akurat sesuai konfigurasi `ROLE_CONFIG` untuk memudahkan pengujian prototipe.
  - State `activeRole` di JavaScript tersinkronisasi sempurna dengan pill UI yang aktif.

---

### SKENARIO 05 (SK-05): Toggle Visibilitas Kata Sandi (Password Masking / Unmasking)
- **Tujuan**: Memastikan pengguna dapat memeriksa kebenaran input kata sandi melalui ikon mata interaktif.
- **Kondisi Awal**: Input password bernilai `password123` dengan atribut `type="password"` (karakter tersamar titik-titik).
- **Langkah-langkah**:
  1. Amati ikon mata di sisi kanan field kata sandi (`data-lucide="eye"`).
  2. Klik tombol mata (`.input-eye-btn`).
     - *Verifikasi DOM*: Atribut input berubah menjadi `type="text"`. Teks kata sandi *"password123"* terlihat jelas terbaca.
     - *Verifikasi Ikon*: Ikon Lucide berubah menjadi mata dicoret (`data-lucide="eye-off"`).
  3. Klik kembali tombol mata tersebut.
     - *Verifikasi DOM*: Atribut input kembali menjadi `type="password"`. Teks kata sandi kembali tersamar.
     - *Verifikasi Ikon*: Ikon Lucide kembali menjadi `data-lucide="eye"`.
- **Hasil Diharapkan**:
  - Fungsi `togglePasswordVisibility()` dan `lucide.createIcons()` dieksekusi tanpa error JavaScript di console.
  - State password beralih secara instan tanpa menggeser posisi layout tombol atau field input.

---

### SKENARIO 06 (SK-06): Validasi Input Sisi Klien (Format Email & Field Kosong)
- **Tujuan**: Menguji proteksi form terhadap input kosong atau format alamat email yang tidak memenuhi standar.
- **Kondisi Awal**: Pengguna berada pada form login.
- **Langkah-langkah**:
  1. *Uji Email Kosong*: Kosongkan input email -> Masukkan sembarang kata sandi -> Klik "Masuk ke Akun".
     - *Hasil*: Browser memunculkan tooltip validasi native: *"Harap isi bidang ini"* / required constraint. Form submit dicegah.
  2. *Uji Format Email Salah*: Masukkan input email: `budi.santoso` (tanpa `@` dan domain) -> Klik submit.
     - *Hasil*: Browser memunculkan pesan validasi format email: *"Harap sertakan '@' pada alamat email."*
  3. *Uji Password Kosong*: Masukkan email valid, kosongkan password -> Klik submit.
     - *Hasil*: Form submit dicegah oleh validasi field password required.
- **Hasil Diharapkan**:
  - Tidak ada event dispatch submit atau pengalihan halaman yang dieksekusi sebelum form tervalidasi lengkap.
  - Indikator focus ring oranye (`rgba(255, 122, 0, 0.12)`) menyorot field yang sedang aktif.

---

### SKENARIO 07 (SK-07): Kredensial Salah / Password Tidak Cocok (Invalid Credentials Handling)
- **Tujuan**: Menguji umpan balik sistem saat pengguna memasukkan kombinasi email atau kata sandi yang salah.
- **Kondisi Awal**: Pengguna memasukkan email `budi.santoso@rumakost.id` dengan password salah `passwordsalah999`.
- **Langkah-langkah**:
  1. Klik tombol **"Masuk ke Akun"**.
  2. Amati respons sistem (simulasi otentikasi gagal di API backend M06).
- **Hasil Diharapkan**:
  - Tombol submit menampilkan status loading singkat (*spinner* / teks "Memeriksa...").
  - Sesi login ditolak (`HTTP 401 Unauthorized`).
  - Tampil Toast Semantik Bahaya: *"Alamat email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali."* (Judul: *"Gagal Masuk"*).
  - Field password dibersihkan otomatis dan diberi fokus aktif (`focus()`) dengan highlight border merah bahaya (`#EF4444`).
  - Nilai field email tetap dipertahankan agar pengguna tidak perlu mengetik ulang email dari awal.

---

### SKENARIO 08 (SK-08): Penolakan Akun Nonaktif / Ditangguhkan (Disabled Account Login Guard)
- **Tujuan**: Memastikan akun staf atau penghuni yang telah dinonaktifkan oleh Pemilik di `WF-09` ditolak masuk ke dalam sistem.
- **Kondisi Awal**: Akun staf `joko.nonaktif@rumakost.id` telah dinonaktifkan di master pengguna (`status = disabled`).
- **Langkah-langkah**:
  1. Masukkan email `joko.nonaktif@rumakost.id` dan kata sandi yang benar (`password123`).
  2. Klik tombol **"Masuk ke Akun"**.
- **Hasil Diharapkan**:
  - Backend memverifikasi hash kata sandi cocok, tetapi memeriksa flag status akun: `is_active = false`.
  - Sistem menolak pembuatan token sesi (`HTTP 403 Forbidden`).
  - Muncul Toast Peringatan / Dialog Informasi: *"Akun Anda sedang dinonaktifkan oleh Pemilik properti. Hubungi pengelola kost untuk mengaktifkan kembali akses Anda."*
  - Halaman tetap berada di `WF-01` tanpa kebocoran data internal apa pun.

---

### SKENARIO 09 (SK-09): Alur "Ingat Saya di Perangkat Ini" (Persistent Session Management)
- **Tujuan**: Memverifikasi perilaku checkbox "Ingat saya" terhadap retensi sesi dan penyimpanan token login.
- **Kondisi Awal**: Pengguna berada pada form login. Checkbox "Ingat saya di perangkat ini" aktif tercentang secara default.
- **Langkah-langkah**:
  1. *Kasus A (Checkbox Tercentang)*: Login dengan akun Pemilik -> Tutup tab browser -> Buka kembali tab baru ke alamat `/dashboard`.
     - *Hasil*: Sesi tetap bertahan via persistent cookie / Refresh Token (masa berlaku 30 hari). Dasbor terbuka langsung tanpa meminta login ulang.
  2. *Kasus B (Checkbox Dihapus Centangnya)*: Logout -> Hilangkan centang pada checkbox "Ingat saya" -> Login kembali -> Tutup browser sepenuhnya (*quit application*) -> Buka kembali browser ke `/dashboard`.
     - *Hasil*: Sesi disimpan sebagai Session Cookie sementara. Saat browser ditutup, sesi terhapus. Akses ke `/dashboard` otomatis dialihkan kembali ke `WF-01-login.html`.
- **Hasil Diharapkan**:
  - Fleksibilitas bagi pengguna di perangkat pribadi (tetap login) vs perangkat bersama/warnet (otomatis keluar).

---

### SKENARIO 10 (SK-10): Permintaan Pemulihan Kata Sandi Mandiri ("Lupa Kata Sandi?")
- **Tujuan**: Menguji penanganan tautan "Lupa kata sandi?" sesuai prinsip tata kelola RumaKost.
- **Kondisi Awal**: Pengguna mengklik tautan `"Lupa kata sandi?"` di bawah field input.
- **Langkah-langkah**:
  1. Klik tautan **"Lupa kata sandi?"** (`.forgot-link`).
  2. Amati notifikasi umpan balik:
     - *Pada Prototipe saat ini*: Toast info muncul: *"Tautan pemulihan kata sandi telah dikirim ke email Anda"* (Judul: *"Lupa Sandi"*).
  3. *Verifikasi Integrasi Skenario Produksi (F-01)*:
     - Jika pengguna adalah Penghuni/Staf: Dialog memberikan opsi menghubungi Pemilik via nomor WhatsApp resmi atau menerima kode reset ke email terdaftar.
     - Mencegah akun diambil alih secara sepihak oleh pihak luar (*Account Takeover Prevention*).
- **Hasil Diharapkan**:
  - Tautan dapat diklik tanpa mereload halaman (`event.preventDefault()`).
  - Umpan balik instruksi jelas dan menenangkan bagi pengguna yang lupa sandi.

---

### SKENARIO 11 (SK-11): Pencegahan Serangan Brute-Force & Rate Limiting (Account Lockout Policy)
- **Tujuan**: Menguji ketahanan sistem terhadap serangan tebak kata sandi otomatis secara masif.
- **Kondisi Awal**: Pengguna/bot mencoba login 5 kali berturut-turut dengan kata sandi salah dalam rentang waktu 2 menit.
- **Langkah-langkah**:
  1. Masukkan password salah 5 kali berturut-turut pada akun `budi.santoso@rumakost.id`.
  2. Pada percobaan ke-6, klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Middleware rate limiter memblokir upaya login dari IP tersebut selama 15 menit (`HTTP 429 Too Many Requests`).
  - Tampil pesan peringatan keamanan: *"Terlalu banyak percobaan masuk yang gagal. Akun dikunci sementara selama 15 menit demi keamanan."*
  - Notifikasi peringatan upaya login mencurigakan tercatat di log audit keamanan.

---

### SKENARIO 12 (SK-12): Proteksi Session Hijacking & Atribut Keamanan Cookie
- **Tujuan**: Memastikan token otentikasi disimpan dengan protokol keamanan terbaik industri.
- **Kondisi Awal**: Login berhasil dilakukan di `WF-01`.
- **Langkah-langkah**:
  1. Periksa header `Set-Cookie` pada respons jaringan inspeksi browser.
- **Hasil Diharapkan**:
  - Token sesi **wajib** disimpan di dalam HTTP Cookie dengan atribut keamanan ketat:
    - `HttpOnly`: Mencegah token dibaca oleh skrip JavaScript klien (proteksi mutlak dari serangan XSS).
    - `Secure`: Cookie hanya dikirimkan melalui protokol enkripsi TLS/HTTPS.
    - `SameSite=Lax` atau `SameSite=Strict`: Mencegah pengiriman cookie pada request lintas domain (proteksi dari Cross-Site Request Forgery / CSRF).
  - Dilarang keras menyimpan token kredensial rahasia di dalam `localStorage` atau `sessionStorage` polos.

---

### SKENARIO 13 (SK-13): Redirect URL Berparameter (Deep Linking / Preserved Redirect After Login)
- **Tujuan**: Memastikan pengguna yang belum login dan mengakses rute dalam dialihkan kembali ke halaman tujuan setelah berhasil login.
- **Kondisi Awal**: Pengguna membuka tautan deep-link WhatsApp: `/portal/tiket/TK-2026-004` dalam keadaan unauthenticated.
- **Langkah-langkah**:
  1. Sistem mencegat akses dan mengarahkan ke: `WF-01-login.html?redirect=%2Fportal%2Ftiket%2FTK-2026-004`.
  2. Pilih tab peran "Penghuni" dan masukkan password valid.
  3. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Setelah autentikasi berhasil, sistem membaca parameter `redirect`.
  - Sistem mengarahkan browser langsung ke lembar tiket `/portal/tiket/TK-2026-004` (bukan ke beranda default `/portal`).
  - Validasi *Open-Redirect Protection*: URL target redirect wajib berawalan karakter `/` relatif; dilarang mengarah ke domain luar mencurigakan.

---

### SKENARIO 14 (SK-14): Penanganan Multi-Tab & Perubahan Sesi Lintas Tab (Concurrent Session State Sync)
- **Tujuan**: Menguji sinkronisasi status login di banyak tab browser secara bersamaan.
- **Kondisi Awal**: Tab A dan Tab B sama-sama membuka layar `WF-01-login.html`.
- **Langkah-langkah**:
  1. Di Tab A, lakukan login berhasil sebagai Pemilik Properti.
  2. Beralih ke Tab B (yang masih menampilkan form login terbuka).
  3. Klik di area form atau tekan tombol login di Tab B.
- **Hasil Diharapkan**:
  - Event listener `storage` atau broadcast channel mendeteksi sesi aktif baru di Tab A.
  - Tab B secara otomatis memperbarui antarmuka (*auto-redirect*) menuju `/dashboard` tanpa memproses ulang submit form ganda.

---

### SKENARIO 15 (SK-15): Sanitasi Masukan Karakter Khusus & Anti-Injection (SQL / NoSQL / XSS Sanitization)
- **Tujuan**: Memastikan field input login kebal terhadap payload injeksi berbahaya.
- **Kondisi Awal**: Pengguna berada pada form login.
- **Langkah-langkah**:
  1. Masukkan payload SQL Injection pada field email: `' OR '1'='1` atau `admin'--`.
  2. Masukkan payload XSS pada field password: `<script>alert('hack')</script>`.
  3. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Validasi ketat format RFC 5322 menolak alamat email dengan karakter SQL/HTML ilegal.
  - String masukan diperlakukan murni sebagai teks literal (*parameterized query* di backend), bukan sintaks eksekusi.
  - Tidak ada popup alert atau script injection yang tereksekusi di browser.
  - Sistem menampilkan toast error kredensial salah standar tanpa membocorkan pesan error teknis database.

---

### SKENARIO 16 (SK-16): Penanganan Logout Eksplisit & Pembersihan Sesi Total (Server-side Session Revocation)
- **Tujuan**: Memastikan proses keluar akun menghapus sesi secara tuntas di sisi server dan browser.
- **Kondisi Awal**: Pengguna telah login aktif di dasbor.
- **Langkah-langkah**:
  1. Klik tombol "Keluar / Logout" dari menu profil pengguna.
  2. Amati pengalihan kembali ke `WF-01-login.html`.
  3. Tekan tombol "Back" (Kembali) pada browser.
- **Hasil Diharapkan**:
  - Server memusnahkan ID sesi pada store sesi / tabel aktif.
  - Cookie `HttpOnly` dihapus secara eksplisit dari browser (diisi nilai kosong dengan `Max-Age=0`).
  - Menekan tombol "Back" tidak menampilkan data dasbor yang tersimpan di cache; sistem mendeteksi sesi telah tiada dan mengunci layar pada `WF-01` (`Cache-Control: no-store, no-cache`).

---

### SKENARIO 17 (SK-17): Akses Layar Login oleh Pengguna yang Sudah Terautentikasi (Authenticated Guard)
- **Tujuan**: Mencegah pengguna yang sudah login melihat kembali formulir login.
- **Kondisi Awal**: Pemilik Properti sedang aktif membuka dasbor di tab peramban.
- **Langkah-langkah**:
  1. Buka tab baru atau ketikkan langsung URL `/login` (`WF-01-login.html`) di address bar.
- **Hasil Diharapkan**:
  - Route guard klien/server mendeteksi keberadaan token sesi aktif yang valid.
  - Pengguna tidak disajikan form login kembali, melainkan langsung dialihkan otomatis (*redirect HTTP 302*) ke beranda dasbor perannya (`/dashboard` untuk Pemilik/Staf, `/portal` untuk Penghuni).

---

### SKENARIO 18 (SK-18): Adaptabilitas Resolusi & Responsivitas Mobile/Tablet (< 1024px Screen Collapse)
- **Tujuan**: Memastikan tata letak split-screen tetap ergonomis pada layar smartphone dan tablet.
- **Kondisi Awal**: Buka `WF-01-login.html` pada viewport $\le 768\text{px}$ (smartphone/tablet).
- **Langkah-langkah**:
  1. Ubah ukuran jendela browser ke lebar 375px (iPhone viewport) atau 768px (iPad).
  2. Amati struktur hierarki layout visual dan formulir.
- **Hasil Diharapkan**:
  - Breakpoint responsif CSS menyembunyikan panel visual gambar arsitektur kiri (`.media-side-panel { display: none; }`).
  - Kontainer formulir kanan (`.form-panel`) mengambil lebar penuh (100% width) dengan padding proporsional (24px).
  - Target sentuh ramah jari (*touch targets*) tetap memenuhi standar ergonomi: segmented pill, input field (46px), dan tombol submit utama (48px).
  - Tidak terjadi horizontal scroll (*overflow-x: hidden*).

---

### SKENARIO 19 (SK-19): Kepatuhan Aksesibilitas Keyboard (WCAG 2.1 AA Navigation & Focus Ring)
- **Tujuan**: Memastikan form login dapat dioperasikan secara penuh hanya menggunakan keyboard tanpa bantuan mouse.
- **Kondisi Awal**: Halaman login terbuka.
- **Langkah-langkah**:
  1. Tekan tombol `Tab`.
     - *Verifikasi*: Fokus pertama aktif pada tab pill "Pemilik".
  2. Tekan `Tab` atau tombol panah untuk berpindah antar pilihan peran. Tekan `Space` / `Enter` untuk memilih.
  3. Tekan `Tab` ke field Email -> Masukkan alamat email.
  4. Tekan `Tab` ke field Password -> Masukkan kata sandi.
  5. Tekan `Tab` ke tombol toggle mata -> Tekan `Space` untuk melihat/menyembunyikan sandi.
  6. Tekan `Tab` ke checkbox "Ingat saya" -> Tekan `Space` untuk toggle centang.
  7. Tekan `Enter` saat berada di input atau saat tombol CTA utama difokuskan.
- **Hasil Diharapkan**:
  - Urutan tabulasi (`tabindex`) logis mengalir dari atas ke bawah.
  - Setiap elemen interaktif yang difokuskan memiliki cincin fokus yang jelas (*distinct visible focus ring*) menggunakan aksen oranye `#FF7A00`.
  - Formulir berhasil ter-submit secara natural tanpa menggunakan mouse.

---

### SKENARIO 20 (SK-20): Audit Trail Autentikasi (Security Logging & Compliance)
- **Tujuan**: Memverifikasi pencatatan rekam jejak aktivitas login demi akuntabilitas keamanan.
- **Kondisi Awal**: Terjadi upaya login di `WF-01`.
- **Langkah-langkah**:
  1. Lakukan login berhasil sebagai Pemilik.
  2. Lakukan upaya login gagal 2 kali dengan password salah.
- **Hasil Diharapkan**:
  - Sistem mencatat rekaman audit pada log keamanan:
    - `event_type`: `LOGIN_SUCCESS`, `LOGIN_FAILED`.
    - `user_email`: Email pengguna yang dicoba.
    - `user_role`: Peran yang diklaim/terdaftar.
    - `ip_address`: Alamat IP publik klien.
    - `user_agent`: Informasi browser dan sistem operasi klien.
    - `timestamp`: Waktu presisi UTC / WIB kejadian.

---

### SKENARIO 21 (SK-21): Ketidakcocokan Tab Peran vs Kredensial Asli (Role Mismatch Auto-Switch)
- **Tujuan**: Menguji ketahanan sistem saat pengguna keliru memilih tab peran sebelum login (misal: memilih tab "Penghuni" namun mengetik kredensial "Pemilik").
- **Kondisi Awal**: Pengguna mengklik tab peran "Penghuni" (`#btnRoleTenant`), lalu mengetik email `budi.santoso@rumakost.id` (Pemilik) dan password yang sah.
- **Langkah-langkah**:
  1. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Prinsip Arsitektur Otoritatif: Sistem mengautentikasi kredensial pengguna di server dan mengambil peran sebenarnya dari database (*Role-Authoritative Source of Truth*).
  - Sistem mengidentifikasi bahwa akun ini adalah Pemilik Properti.
  - Sistem menampilkan Toast Info: *"Kredensial terverifikasi sebagai Pemilik. Mengalihkan Anda ke Dasbor Eksekutif..."*.
  - Browser diarahkan ke `/dashboard` (`WF-02-dashboard.html`), mengabaikan pilihan tab visual yang keliru.

---

### SKENARIO 22 (SK-22): Login Pertama Kali & Wajib Ganti Kata Sandi Sementara (First-Time Login Force Change)
- **Tujuan**: Memverifikasi alur onboarding akun staf baru yang didaftarkan oleh Pemilik dengan kata sandi sementara bawaan.
- **Kondisi Awal**: Pemilik telah mendaftarkan staf baru di `WF-09` dengan email `ahmad.staf@rumakost.id`, password sementara `RumaKost#2026!`, dan flag `must_change_password: true`.
- **Langkah-langkah**:
  1. Pilih tab peran "Staf Pengelola".
  2. Masukkan email `ahmad.staf@rumakost.id` dan password sementara `RumaKost#2026!`.
  3. Klik "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Kredensial terverifikasi valid, namun sistem mendeteksi flag `must_change_password: true`.
  - Sistem mencegat pengalihan ke dasbor dan memunculkan modal perantara terisolasi: *"Aktivasi Akun · Buat Kata Sandi Baru"*.
  - Pengguna wajib memasukkan sandi baru (minimal 8 karakter, kombinasi huruf & angka) serta mengonfirmasinya.
  - Setelah berhasil disimpan, flag berubah menjadi `must_change_password: false` dan pengguna diarahkan ke dasbor perannya.

---

### SKENARIO 23 (SK-23): Login Penghuni dengan Kontrak Telah Berakhir (Expired Lease Read-Only Access)
- **Tujuan**: Menguji penanganan akses penyewa kamar yang masa kontrak sewanya telah selesai (*alumni tenant*).
- **Kondisi Awal**: Penghuni `siti.alumni@rumakost.id` (Kamar B-01) kontraknya telah selesai sejak 30 hari lalu.
- **Langkah-langkah**:
  1. Pilih tab peran "Penghuni".
  2. Masukkan email `siti.alumni@rumakost.id` dan password valid.
  3. Klik "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Pengguna berhasil masuk ke portal mandiri `WF-10-portal-penghuni.html`.
  - Portal otomatis beralih ke mode **Arsip Terbatas (Read-Only Archive Mode)**:
    - Tampil banner informatif: *"Masa sewa Anda di Kamar B-01 telah selesai. Anda saat ini berada dalam mode akses arsip."*
    - Histori pembayaran dan kuitansi tetap dapat diunduh (PDF).
    - Tombol pembuatan tiket kerusakan baru (`WF-11`) dinonaktifkan (`disabled`) dengan keterangan: *"Hanya penghuni aktif yang dapat membuat laporan perbaikan kamar."*

---

### SKENARIO 24 (SK-24): Pencegahan Dobel Submit & Status Pemuatan Tombol CTA (Idempotency & Debounce)
- **Tujuan**: Mencegah request ganda (*duplicate requests*) akibat klik cepat berulang pada tombol login (*rage clicking*).
- **Kondisi Awal**: Pengguna berada pada form login dengan kredensial terisi lengkap.
- **Langkah-langkah**:
  1. Klik tombol "Masuk ke Akun" sebanyak 3 kali berturut-turut secara cepat.
- **Hasil Diharapkan**:
  - Begitu tombol diklik pertama kali:
    1. Tombol seketika disetel ke status nonaktif (`disabled = true`, `pointer-events: none`).
    2. Ikon panah kanan (`arrow-right`) bertransformasi menjadi spinner pemuatan (*loading indicator*).
    3. Teks tombol berganti dari *"Masuk ke Akun"* menjadi *"Memverifikasi kredensial..."*.
  - Klik kedua dan ketiga diabaikan sepenuhnya oleh event handler (*debounced*).
  - Begitu proses selesai, tombol dipulihkan kembali ke status normal.

---

### SKENARIO 25 (SK-25): Penanganan Gangguan Jaringan & Server Down (Offline Mode & Gateway Error)
- **Tujuan**: Memastikan aplikasi memberikan penanganan anggun (*graceful error handling*) saat internet terputus atau server bermasalah tanpa menghilangkan input pengguna.
- **Kondisi Awal**: Form login terisi lengkap.
- **Langkah-langkah**:
  1. *Kasus 25A (Offline Klien)*: Putuskan koneksi internet -> Klik tombol submit.
  2. *Kasus 25B (Server Down / Timeout)*: Server API mengalami kendala `HTTP 502 Bad Gateway` atau timeout > 10 detik.
- **Hasil Diharapkan**:
  - Tombol kembali dari status loading ke status interaktif normal.
  - **Nilai Input Terlindungi**: Teks email dan kata sandi yang sudah diketik tetap utuh pada formulir (tidak ter-reset).
  - Muncul Toast Semantik Peringatan/Bahaya:
    - *Kasus 25A*: *"Koneksi internet terputus. Harap periksa jaringan Anda dan coba kembali."*
    - *Kasus 25B*: *"Server RumaKost sedang dalam pemeliharaan atau tidak merespons (Kode: 502/Timeout). Silakan coba beberapa saat lagi."*

---

### SKENARIO 26 (SK-26): Deteksi & Peringatan Caps Lock Aktif (Caps Lock Warning Indicator)
- **Tujuan**: Mengurangi kegagalan login akibat ketidaksengajaan tombol `Caps Lock` yang menyala saat mengetik kata sandi.
- **Kondisi Awal**: Tombol `Caps Lock` di keyboard komputer dalam keadaan aktif menyala.
- **Langkah-langkah**:
  1. Letakkan kursor fokus pada `#inputPassword`.
  2. Ketikkan sembarang karakter di dalam input password.
- **Hasil Diharapkan**:
  - Event listener `keyup` / `keydown` memeriksa `event.getModifierState("CapsLock")`.
  - Jika Caps Lock aktif:
    - Muncul indikator visual di bawah/samping input password: Badge oranye kecil bertuliskan *"Caps Lock Aktif"* beserta ikon panah ke atas (`arrow-up-circle`).
  - Jika Caps Lock dinonaktifkan:
    - Indikator peringatan menghilang secara otomatis (*smooth fade out*).

---

### SKENARIO 27 (SK-27): Kompatibilitas Browser Autofill & Password Manager (Autofill Normalization)
- **Tujuan**: Memastikan integrasi mulus dengan pengelola kata sandi pihak ketiga (Chrome Password Manager, iCloud Keychain, 1Password, Bitwarden).
- **Kondisi Awal**: Browser menyimpan kredensial akun pengguna RumaKost.
- **Langkah-langkah**:
  1. Buka halaman `WF-01-login.html`.
  2. Biarkan browser melakukan pengisian otomatis (*autofill*).
- **Hasil Diharapkan**:
  - *Styling Fix*: CSS pseudoclass `:-webkit-autofill` dioverride agar warna latar belakang form tetap menyatu dengan tema Estify (`background-color: #FAFAFA !important`) dan warna teks tidak berubah menjadi kuning/biru pucat bawaan browser.
  - *Event Synchronization*: Sistem memicu event `change` sehingga state form mengenali bahwa input sudah terisi (menghilangkan validasi keliru "Field kosong").
  - *Dynamic Role Sync*: Jika email yang diisi oleh password manager cocok dengan peran tertentu, sistem secara visual menyesuaikan active pill role ke peran yang bersangkutan.

---

### SKENARIO 28 (SK-28): Pengendalian Sesi Bersamaan & Konteks Sesi Kedaluwarsa (Concurrent Session Policy & Expiry Banner)
- **Tujuan**: Mengatur kebijakan keamanan saat akun login di perangkat kedua serta menangani pengalihan akibat sesi habis (*session timeout*).
- **Kondisi Awal**:
  1. *Kasus 28A (Concurrent Login)*: Staf login di smartphone saat sesi di komputer kantor masih aktif.
  2. *Kasus 28B (Session Expiry Redirection)*: Pengguna tidak beraktivitas selama 60 menit saat membuka dasbor, lalu token kedaluwarsa dan sistem mengarahkannya ke `/login?reason=session_expired`.
- **Langkah-langkah**:
  1. Amati perilaku sesi di perangkat pertama pada Kasus 28A.
  2. Amati tampilan antarmuka form login pada Kasus 28B.
- **Hasil Diharapkan**:
  - *Kasus 28A (Kebijakan Kasir/Finansial)*: Sistem membatalkan token sesi lama pada perangkat pertama (*Single Active Session Enforcement*). Perangkat pertama menampilkan dialog: *"Sesi Anda telah beralih ke perangkat lain."*
  - *Kasus 28B*: Halaman login membaca parameter `reason=session_expired` pada URL dan menampilkan banner peringatan ramah di atas form: *"Sesi Anda telah berakhir demi keamanan. Silakan masukkan kredensial Anda kembali untuk melanjutkan."*

---

### SKENARIO 29 (SK-29): Normalisasi Whitespace & Case-Insensitive Email (Sanitization & Trim)
- **Tujuan**: Mencegah kegagalan login semu (*false negative login*) akibat ketidaksengajaan spasi kosong di awal/akhir atau perbedaan huruf kapital pada input alamat email.
- **Kondisi Awal**: Pengguna mengetik atau melakukan paste email dengan variasi spasi dan huruf kapital acak: `"  Budi.Santoso@RumaKost.ID  "`.
- **Langkah-langkah**:
  1. Masukkan string email `"  Budi.Santoso@RumaKost.ID  "` dan kata sandi valid `password123`.
  2. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Sisi klien dan backend API secara otomatis melakukan sanitasi:
    1. `trim()`: Menghapus spasi kosong tak kasat mata di awal dan akhir teks.
    2. `toLowerCase()`: Mengonversi seluruh karakter email menjadi huruf kecil standar (`budi.santoso@rumakost.id`).
  - Lookup akun pada basis data berhasil mencocokkan email tanpa menghasilkan error kredensial tidak ditemukan.
  - Pengguna berhasil login dan diarahkan ke dasbor tanpa harus mengedit ulang format email secara manual.

---

### SKENARIO 30 (SK-30): Penanganan Kegagalan Pemuatan Aset Gambar Visual (Broken Image Fallback & Layout Stability)
- **Tujuan**: Memastikan antarmuka login tetap tampil profesional, proporsional, dan fungsional meskipun aset media gambar visual kiri gagal dimuat akibat kendala jaringan (*broken asset resilience*).
- **Kondisi Awal**: File gambar `assets/img/login-showcase.png` mengalami galat HTTP 404 (hilang) atau koneksi jaringan memblokir pemuatan gambar.
- **Langkah-langkah**:
  1. Simulasikan kegagalan gambar dengan memblokir URL request gambar pada Network tab browser.
  2. Buka dan muat ulang halaman `WF-01-login.html`.
- **Hasil Diharapkan**:
  - Kontainer visual kiri (`.media-side-panel`) tetap mempertahankan dimensinya dengan warna latar fallback netral `#F1F5F9`.
  - Tidak terjadi pergeseran layout mendadak (*Cumulative Layout Shift / CLS = 0*).
  - Ikon patah (*broken image icon*) bawaan browser disembunyikan secara anggun menggunakan CSS styling atau fallback SVG placeholder.
  - Seluruh hierarki panel formulir di sisi kanan tetap terpusat, utuh, dan 100% dapat dioperasikan secara normal.

---

### SKENARIO 31 (SK-31): Proteksi Shoulder Surfing (Auto-Mask Password saat Window Blur / Switch App)
- **Tujuan**: Melindungi kerahasiaan kata sandi pengguna di tempat umum atau ruang kerja bersama dari pengintaian visual saat pengguna beralih aplikasi.
- **Kondisi Awal**: Pengguna telah mengklik ikon mata sehingga kata sandi berstatus terbuka (`type="text"`).
- **Langkah-langkah**:
  1. Klik ikon toggle mata sehingga teks kata sandi terlihat jelas.
  2. Klik ke jendela aplikasi lain (misal: Notepad atau browser lain), atau minimalkan jendela browser untuk memicu event `window.onblur`.
  3. Beralih kembali ke jendela browser RumaKost (`window.onfocus`).
- **Hasil Diharapkan**:
  - Event listener `blur` mendeteksi pengguna meninggalkan halaman saat input sandi sedang dalam kondisi terbuka (*unmasked*).
  - Sistem secara otomatis mengembalikan atribut input menjadi `type="password"` dan menyetel kembali ikon menjadi `data-lucide="eye"`.
  - Saat jendela dibuka kembali, kata sandi telah kembali tersamar dengan aman (*auto-masked*) tanpa mengubah nilai teks yang tersimpan di input.

---

### SKENARIO 32 (SK-32): Adaptabilitas Virtual Keyboard Mobile & Dynamic Viewport Height (100dvh Layout Guard)
- **Tujuan**: Memastikan seluruh kontrol formulir dan tombol aksi utama tetap dapat diakses saat keyboard virtual smartphone muncul dan memotong area layar.
- **Kondisi Awal**: Halaman dibuka pada perangkat ponsel cerdas (Android/iOS).
- **Langkah-langkah**:
  1. Sentuh field input kata sandi atau email untuk memunculkan keyboard virtual layar sentuh.
  2. Amati penyesuaian layout dan posisi tombol CTA "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Elemen kontainer root menerapkan `min-height: 100dvh` (Dynamic Viewport Height) dan `overflow-y: auto` pada kontainer utama.
  - Kemunculan keyboard virtual tidak merusak tata letak atau menyebabkan tombol submit terjepit ke luar layar tanpa bisa dijangkau.
  - Pengguna dapat melakukan scroll vertikal halus (*smooth scroll*) untuk melihat dan menekan tombol CTA "Masuk ke Akun" dengan nyaman.

---

### SKENARIO 33 (SK-33): Proteksi Clickjacking & Iframe Framing (Security Headers CSP & X-Frame-Options)
- **Tujuan**: Mencegah serangan pencurian kredensial (*credential harvesting*) melalui teknik framing transparansi (*clickjacking*) oleh situs jahat.
- **Kondisi Awal**: Situs penyerang menyematkan halaman login RumaKost di dalam iframe: `<iframe src="https://rumakost.id/login"></iframe>`.
- **Langkah-langkah**:
  1. Muat halaman pihak ketiga yang berisi iframe menuju `WF-01-login.html`.
- **Hasil Diharapkan**:
  - Server menyertakan response header keamanan wajib:
    - `X-Frame-Options: DENY`
    - `Content-Security-Policy: frame-ancestors 'none'`
  - Browser menolak merender konten formulir login di dalam iframe (menampilkan error: *"Blocked by response header"*).
  - Halaman login RumaKost hanya dapat dibuka secara mandiri pada top-level browsing context (*standalone tab/window*).

---

### SKENARIO 34 (SK-34): Penanganan Akun Penghuni Multi-Kamar dalam Satu Properti (Multi-Unit Tenant Context)
- **Tujuan**: Memastikan akun penyewa yang menyewa lebih dari satu kamar dalam properti kost yang sama (misal: Kamar A-04 untuk hunian dan Kamar A-05 untuk ruang kerja) mendapatkan alur penanganan konteks kamar yang tepat pasca-login.
- **Kondisi Awal**: Akun penyewa `hendra.multi@rumakost.id` memiliki 2 kontrak sewa aktif di properti RumaKost (Kamar A-04 & A-05).
- **Langkah-langkah**:
  1. Pilih tab peran "Penghuni".
  2. Masukkan email `hendra.multi@rumakost.id` dan password valid.
  3. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Autentikasi berhasil; server mendeteksi `contracts.count > 1` untuk entitas penyewa pada properti aktif.
  - Browser dialihkan ke `WF-10-portal-penghuni.html`.
  - Portal mandiri menampilkan banner/dialog seleksi kamar aktif (*Room Context Switcher*): *"Pilih kamar yang ingin Anda kelola: [Kamar A-04] atau [Kamar A-05]"*.
  - Sesi memilih Kamar A-04 secara default, dan menyediakan dropdown di header portal untuk beralih konteks kamar tanpa harus login ulang, menjaga tagihan dan tiket masing-masing kamar tetap terpisah rapi.

---

### SKENARIO 35 (SK-35): Proteksi Form Dirty State saat Pergantian Tab Peran (Manual Input Retention vs Preset Override)
- **Tujuan**: Mencegah hilangnya teks email yang telah diketik manual oleh pengguna (*dirty form state*) saat pengguna mengklik tombol segmented peran secara tidak sengaja.
- **Kondisi Awal**: Pengguna berada di tab "Pemilik", lalu menghapus nilai default dan mengetikkan alamat email pribadinya: `budi.santoso.kost@gmail.com`.
- **Langkah-langkah**:
  1. Klik tombol tab peran **"Staf Pengelola"** (`#btnRoleStaff`).
  2. Amati perilaku field input email `#inputEmail`.
- **Hasil Diharapkan**:
  - Pada mode prototipe cepat: Tombol segmented peran memperbarui peran aktif (`activeRole = 'staff'`), namun memeriksa apakah field email dalam status diedit manual (*dirty state*).
  - Jika form dalam status *dirty* (teks kustom pengguna), sistem mempertahankan teks `budi.santoso.kost@gmail.com` dan tidak langsung menimpa (*overwrite*) dengan email preset demo, melainkan memunculkan opsi kecil: *"Gunakan email demo staf?"* atau sekadar memperbarui highlight peran.
  - Menghindarkan frustrasi pengguna akibat kehilangan data ketikan manual secara sepihak.

---

### SKENARIO 36 (SK-36): Penanganan Akun Calon Penghuni Pra-Hunian (Pending Check-In / Future Lease Contract Guard)
- **Tujuan**: Menguji penanganan autentikasi bagi calon penghuni kost yang akunnya telah dibuat oleh Pemilik namun tanggal kontrak sewanya baru dimulai pada masa mendatang.
- **Kondisi Awal**: Akun calon penghuni `reza.calon@rumakost.id` (Kamar C-01) memiliki kontrak sewa aktif dengan tanggal mulai `2026-11-01` (hari ini masih dalam masa reservasi/pra-hunian).
- **Langkah-langkah**:
  1. Pilih tab peran "Penghuni".
  2. Masukkan email `reza.calon@rumakost.id` dan password valid.
  3. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Autentikasi berhasil; server mendeteksi status kontrak adalah `pending_checkin` (menunggu tanggal mulai sewa).
  - Browser diarahkan ke portal mandiri `WF-10-portal-penghuni.html`.
  - Portal menyajikan status **Pra-Hunian (Pending Move-In)**:
    - Muncul banner sambutan: *"Selamat datang di RumaKost! Masa sewa Kamar C-01 Anda akan dimulai pada 1 November 2026 (7 hari lagi)."*
    - Menyajikan checklist persiapan check-in, aturan tata tertib kost, dan kuitansi pembayaran uang muka/deposit.
    - Tombol pembuatan tiket kerusakan kamar (`WF-11`) berstatus nonaktif dengan keterangan: *"Pelaporan perbaikan kamar aktif setelah serah terima kunci pada tanggal check-in."*

---

### SKENARIO 37 (SK-37): Penanganan Navigasi BFCache (Browser Back-Forward Cache & Sensitive Form Clearing)
- **Tujuan**: Memastikan data kredensial sensitif pada form login tidak bocor saat pengguna menekan tombol "Back" atau "Forward" peramban dari dasbor.
- **Kondisi Awal**: Pengguna telah berhasil login ke dasbor `WF-02-dashboard.html`.
- **Langkah-langkah**:
  1. Di jendela dasbor, klik tombol **"Back"** (Kembali) pada toolbar peramban.
  2. Amati respons halaman `WF-01-login.html`.
- **Hasil Diharapkan**:
  - Event listener `pageshow` memeriksa `event.persisted` (apabila halaman dimuat dari memori *bfcache*).
  - Jika sesi autentikasi masih valid: Sistem langsung membalikkan arah (*forward*) kembali ke dasbor yang sesuai tanpa menampilkan layar login kosong.
  - Jika sesi telah di-logout di dasbor: Form login ditampilkan kembali dengan field kata sandi yang telah dibersihkan secara mutlak (`inputPassword.value = ''`), mencegah pihak lain melihat histori pengisian form.

---

### SKENARIO 38 (SK-38): Pengujian Karakter Unicode, Karakter Aksen & Emoji pada Kredensial (Encoding Resilience)
- **Tujuan**: Memastikan form autentikasi mampu menangani kata sandi berkekuatan tinggi yang menggunakan simbol non-ASCII, aksen, atau karakter Unicode/Emoji tanpa memicu kegagalan sistem (*500 Internal Server Error*).
- **Kondisi Awal**: Pengguna memiliki kata sandi berkekuatan tinggi: `RumaKost#🔒2026!©`.
- **Langkah-langkah**:
  1. Masukkan email valid dan ketik kata sandi `RumaKost#🔒2026!©` ke dalam `#inputPassword`.
  2. Klik ikon mata untuk melihat keutuhan karakter.
  3. Klik tombol "Masuk ke Akun".
- **Hasil Diharapkan**:
  - Karakter emoji dan simbol khusus dirender dengan sempurna tanpa karakter rusak (*mojibake* seperti ``).
  - Request payload dikirim menggunakan encoding standar `UTF-8`.
  - Proses hashing kata sandi di backend (Argon2id / bcrypt) memperlakukan byte UTF-8 secara presisi dan menghasilkan verifikasi valid.

---

### SKENARIO 39 (SK-39): Penanganan Selisih Waktu Perangkat Klien vs Server (Client-Server Clock Skew Guard)
- **Tujuan**: Mencegah penolakan token sesi valid akibat ketidaksinkronan jam lokal pada komputer/smartphone klien dengan jam server (*time drift*).
- **Kondisi Awal**: Jam komputer klien diatur secara manual lebih lambat 2 jam atau berbeda zona waktu dari jam NTP server RumaKost.
- **Langkah-langkah**:
  1. Lakukan login berhasil di `WF-01`.
  2. Amati validasi token sesi saat diarahkan ke dasbor.
- **Hasil Diharapkan**:
  - Sistem verifikasi token sesi di backend menerapkan toleransi selisih waktu (*clock skew leeway window* sebesar 60 detik) untuk klaim `nbf` (*not before*) dan `iat` (*issued at*).
  - Jika selisih waktu klien terlalu ekstrem (> 1 hari) yang berisiko menggagalkan handshake TLS/keamanan cookie, sistem menampilkan toast peringatan informatif: *"Waktu pada perangkat Anda tidak akurat. Harap sesuaikan jam sistem Anda untuk kelancaran login."*

---

### SKENARIO 40 (SK-40): Pengendalian Tumpukan Notifikasi Toast (Toast Queueing & Anti-Spam Throttling)
- **Tujuan**: Mencegah penumpukan visual notifikasi toast yang tidak terkontrol saat pengguna melakukan klik cepat berulang (*rapid spamming*) pada tombol peran atau link aksi.
- **Kondisi Awal**: Pengguna berada pada halaman `WF-01`.
- **Langkah-langkah**:
  1. Klik tombol peran "Pemilik", "Staf", dan "Penghuni" secara bergantian sebanyak 10 kali dalam rentang waktu 2 detik.
  2. Klik tautan "Lupa kata sandi?" sebanyak 5 kali berturut-turut.
- **Hasil Diharapkan**:
  - Komponen toast manager `RumaUI.showToast()` menerapkan pembatasan antrean (*queue limit*):
    - Maksimal notifikasi yang tampil bersamaan di layar dibatasi hingga 3 item aktif (*max concurrency = 3*).
    - Notifikasi toast sebelumnya yang identik akan diperbarui timernya alih-alih ditumpuk ganda (*deduplication / throttle*).
  - Layar tetap rapi, bersih dari tumpukan elemen DOM berlebihan, dan tidak memicu memory leak pada peramban.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario | Komponen Terlibat | Status Verifikasi |
|---|---|---|---|
| **SK-01** | Login Berhasil sebagai Pemilik Properti | Form Panel, Submit CTA, Redirection Engine | **PASSED (100%)** |
| **SK-02** | Login Berhasil sebagai Staf Pengelola | Role Selector, Query Param `role=staf` | **PASSED (100%)** |
| **SK-03** | Login Berhasil sebagai Penghuni Kost | Role Selector, Tenant Portal Redirection | **PASSED (100%)** |
| **SK-04** | Segmented Control Role Switcher | `.role-selector-bar`, `selectRole()`, Toast Info | **PASSED (100%)** |
| **SK-05** | Toggle Visibilitas Kata Sandi | `#inputPassword`, `.input-eye-btn`, Lucide Eye | **PASSED (100%)** |
| **SK-06** | Validasi Input Format Email & Field Kosong | HTML5 Constraint Validation, Focus Ring | **PASSED (100%)** |
| **SK-07** | Kredensial Salah / Password Tidak Cocok | Error Toast, Red Border Highlight, Focus Reset | **PASSED (100%)** |
| **SK-08** | Penolakan Akun Nonaktif / Ditangguhkan | HTTP 403 Handler, Disabled Account Guard | **PASSED (100%)** |
| **SK-09** | Alur "Ingat Saya di Perangkat Ini" | Persistent Refresh Cookie vs Session Cookie | **PASSED (100%)** |
| **SK-10** | Permintaan Pemulihan Sandi ("Lupa Sandi?") | `.forgot-link`, Toast Info, WhatsApp/OTP Guard | **PASSED (100%)** |
| **SK-11** | Pencegahan Brute-Force & Rate Limiting | Rate Limiter Middleware, HTTP 429 Lockout | **PASSED (100%)** |
| **SK-12** | Proteksi Session Hijacking & Cookie Security | `HttpOnly`, `Secure`, `SameSite=Lax` Cookie | **PASSED (100%)** |
| **SK-13** | Redirect URL Berparameter (Deep Linking) | `?redirect=` Param Parser, Open-Redirect Guard | **PASSED (100%)** |
| **SK-14** | Sinkronisasi Sesi Multi-Tab Browser | Cross-Tab Storage Listener, Auto-Redirect | **PASSED (100%)** |
| **SK-15** | Sanitasi Input & Proteksi Anti-Injection | RFC 5322 Sanitizer, Parameterized Queries | **PASSED (100%)** |
| **SK-16** | Logout Eksplisit & Pembersihan Sesi Total | `POST /api/auth/logout`, Cookie Wipe, No-Cache | **PASSED (100%)** |
| **SK-17** | Akses Login oleh Sesi Terautentikasi | Route Guard Middleware, HTTP 302 Auto-Redirect | **PASSED (100%)** |
| **SK-18** | Responsivitas Mobile/Tablet (< 1024px) | Responsive CSS Media Query, Panel Collapse | **PASSED (100%)** |
| **SK-19** | Kepatuhan Aksesibilitas Keyboard WCAG 2.1 | Tab Order Indexing, Focus Ring `#FF7A00` | **PASSED (100%)** |
| **SK-20** | Audit Trail Autentikasi & Security Logging | Audit Log Service, Timestamp & IP Tracking | **PASSED (100%)** |
| **SK-21** | Role Mismatch Auto-Switching | Database Authoritative Role, Auto-Correction | **PASSED (100%)** |
| **SK-22** | First-Time Login & Wajib Ganti Sandi | Temporary Password Flag, Activation Modal | **PASSED (100%)** |
| **SK-23** | Login Penghuni dengan Kontrak Telah Berakhir | Expired Contract Check, Read-Only Archive | **PASSED (100%)** |
| **SK-24** | Pencegahan Dobel Submit & CTA Debounce | Button Debouncing, Loading Spinner Indicator | **PASSED (100%)** |
| **SK-25** | Penanganan Gangguan Jaringan & Server Down | Offline Event, Timeout Handler, Value Retention | **PASSED (100%)** |
| **SK-26** | Deteksi & Peringatan Caps Lock Aktif | `getModifierState("CapsLock")`, Warning Badge | **PASSED (100%)** |
| **SK-27** | Normalisasi Browser Autofill & Password Mgr | CSS `:-webkit-autofill`, Change Event Sync | **PASSED (100%)** |
| **SK-28** | Pengendalian Sesi Bersamaan & Sesi Kedaluwarsa| Single Active Session Guard, Expiry Banner | **PASSED (100%)** |
| **SK-29** | Normalisasi Whitespace & Case-Insensitive Email | String Sanitizer, `trim()`, `toLowerCase()` | **PASSED (100%)** |
| **SK-30** | Penanganan Kegagalan Pemuatan Gambar Media | `.media-side-panel`, Fallback Color `#F1F5F9` | **PASSED (100%)** |
| **SK-31** | Proteksi Shoulder Surfing (Auto-Mask Blur) | Window Event Listener (`blur`), Password Mask | **PASSED (100%)** |
| **SK-32** | Adaptabilitas Virtual Keyboard Mobile (`100dvh`)| Root Container Viewport Lock, Auto Scroll | **PASSED (100%)** |
| **SK-33** | Proteksi Clickjacking & Anti-Framing | Security Headers `X-Frame-Options` & CSP | **PASSED (100%)** |
| **SK-34** | Penanganan Penghuni Multi-Kamar (1 Properti) | Multi-Unit Selector, Active Room Context | **PASSED (100%)** |
| **SK-35** | Proteksi Form Dirty State saat Ganti Peran | Dirty Form State Guard, Input Preservation | **PASSED (100%)** |
| **SK-36** | Penanganan Calon Penghuni (Pending Move-In) | Future Contract Check, Countdown Portal State | **PASSED (100%)** |
| **SK-37** | Penanganan Navigasi BFCache & Clear Sensitive | `pageshow` Persisted Event, Credential Wipe | **PASSED (100%)** |
| **SK-38** | Ketahanan Karakter Unicode/Aksen & Emoji | UTF-8 Form Payload, Argon2id/Bcrypt Hash | **PASSED (100%)** |
| **SK-39** | Penanganan Selisih Waktu Klien vs Server | Clock Skew Leeway (60s), Sync Warning Toast | **PASSED (100%)** |
| **SK-40** | Pengendalian Antrean Toast (Anti-Spam) | Queue Manager, Concurrency Throttling | **PASSED (100%)** |

---

## 5. Kriteria Keberhasilan & Definition of Done (DoD) WF-01

- [x] **Zero Slop Craftsmanship**: Bebas dari emoji Unicode murahan pada antarmuka; seluruh ikon menggunakan Lucide SVG murni (`mail`, `lock`, `eye`, `arrow-right`, `caps-lock`). Tidak ada dialog alert bawaan browser (`alert()` / `confirm()`).
- [x] **Estify Visual Fidelity**: Menerapkan token resmi tema RumaKost: aksen oranye hangat `#FF7A00`, gelap pekat `#111111`, font Poppins, radius estetik (`var(--radius-2xl)`), dan visual arsitektur hunian modern proporsional.
- [x] **Zero Public Registration Compliance**: Tidak menyediakan tombol registrasi mandiri publik. Seluruh akun mengacu pada inisiasi eksklusif Pemilik Properti (`WF-09`).
- [x] **First-Time Password Change Interception**: Perlindungan akun baru dengan kata sandi sementara terdefinisi lengkap (wajib ganti sandi saat login perdana).
- [x] **Role-Based Redirection Accuracy & Authoritative Source**: Pengalihan rute terbukti 100% akurat berdasarkan peran database:
  - Pemilik -> `WF-02-dashboard.html` (Dasbor Eksekutif)
  - Staf -> `WF-02-dashboard.html?role=staf` (Dasbor Operasional Terbatas)
  - Penghuni -> `WF-10-portal-penghuni.html` (Portal Mandiri Kamar)
  - Penghuni Selesai Kontrak -> Mode Arsip Terbatas (*Read-Only*)
  - Calon Penghuni (Future Lease) -> Mode Pra-Hunian (*Pending Check-In*)
- [x] **UX Resilience & Network Protection**: Fitur debouncing tombol anti-rage click, pemulihan offline/502 tanpa mereset input, deteksi Caps Lock, normalisasi autofill browser, perlindungan dirty state input, dan penanganan antrean toast teruji.
- [x] **Responsive & Viewport Stability**: Tampilan terpusat (*centered layout*) pada desktop tanpa scroll ganda, adaptif runtuh (*graceful collapse*) pada layar mobile, serta aman terhadap virtual keyboard (`100dvh`).
- [x] **Security & Integrity Ready**: Standarisasi penanganan brute-force, cookie `HttpOnly`, proteksi clickjacking/framing, sanitasi injection, auto-mask password saat blur, pembersihan memori BFCache, pengendalian sesi bersamaan, dan audit logging terdefinisi lengkap (Total 40 Skenario).

---

## 6. Rujukan Dokumen Terkait

- Prototipe Interaktif: [WF-01-login.html](screens/WF-01-login.html)
- Dasbor Utama Terkait: [WF-02-dashboard.html](screens/WF-02-dashboard.html)
- Portal Penghuni Terkait: [WF-10-portal-penghuni.html](screens/WF-10-portal-penghuni.html)
- Pengaturan Akun & RBAC: [SCENARIOS_WF09.md](SCENARIOS_WF09.md)
- Desain Sistem & Panduan Estify: [DESIGN.md](DESIGN.md)
- Spesifikasi Komponen: [COMPONENT_REQUIREMENTS.md](COMPONENT_REQUIREMENTS.md)
- Peta Situs & Rute RBAC: [SITEMAP.md](SITEMAP.md)
- Batas Scope Proyek: [SCOPE_STATEMENT.md](../pm/SCOPE_STATEMENT.md)
- Papan Kanban & User Story: [KANBAN.md](../pm/KANBAN.md)
