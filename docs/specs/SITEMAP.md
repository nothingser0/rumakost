# Sitemap & Information Architecture: Rumakost

> **System Scope**: Enterprise-Grade Multi-Property Boarding House & Coliving PMS  
> **Layout Shell Archetype**: Top-Navigation Bar (`--layout-shell: top-nav`)  
> **Total Unique Screens**: 57 Screens (`SCR-001` through `SCR-057`)  
> **Feature Parity**: 100% Coverage of 21 P0 Features (F-01..F-21) and Core System Workflows  

---

## 1. Public & Authentication Portal (`SCR-001` – `SCR-005`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-001** | `/` | Landing & Property Showcase | Beranda publik, pencarian kamar, katalog fasilitas cabang, simulasi sewa, FAQ, CTA survey | Top-Nav Public | P0 | Public |
| **SCR-002** | `/auth/login` | Portal Masuk Multi-Role | Login terpadu 6 role via email/telepon + password, switch cabang default, link pemulihan | Minimal Auth | P0 | Public |
| **SCR-003** | `/auth/forgot-password` | Pemulihan Password | Pengajuan reset password via email/WA notifikasi outbox terverifikasi | Minimal Auth | P0 | Public |
| **SCR-004** | `/auth/reset-password` | Penetapan Password Baru | Setel kredensial baru dengan token outbox 48-jam dan proteksi token expiration | Minimal Auth | P0 | Public |
| **SCR-005** | `/auth/activate` | Aktivasi Akun Pengguna | Aktivasi kredensial perdana bagi penghuni baru dan staff yang diundang pemilik | Minimal Auth | P0 | Public |

---

## 2. Tenant Portal (`SCR-006` – `SCR-013`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-006** | `/tenant/dashboard` | Dashboard Penghuni | Ringkasan sewa aktif, radial gauge jatuh tempo tagihan, pengumuman, nomor darurat, Wi-Fi | Top-Nav Tenant | P0 | Tenant |
| **SCR-007** | `/tenant/invoices` | Riwayat Tagihan Saya | Daftar invoice bulanan (sewa, listrik, add-ons), status lunas/pending, download PDF kwitansi | Top-Nav Tenant | P0 | Tenant |
| **SCR-008** | `/tenant/invoices/:id` | Detail Tagihan & Bayar | Rincian itemized biaya, instruksi transfer rekening resmi cabang, upload bukti bayar | Top-Nav Tenant | P0 | Tenant |
| **SCR-009** | `/tenant/contract` | Kontrak Sewa Digital | Dokumen perjanjian sewa digital, terms deposit garansi, tanggal mulai/akhir, opsi perpanjangan | Top-Nav Tenant | P0 | Tenant |
| **SCR-010** | `/tenant/tickets` | Tiket Perbaikan Kamar | Pengajuan komplain fasilitas/kerusakan, riwayat tiket, SLA tracking counter | Top-Nav Tenant | P0 | Tenant |
| **SCR-011** | `/tenant/tickets/:id` | Detail & Chat Tiket | Progres penanganan perbaikan, foto sebelum/sesudah oleh teknisi, chat real-time caretaker | Top-Nav Tenant | P0 | Tenant |
| **SCR-012** | `/tenant/guests` | Pendaftaran Tamu | Registrasi tamu menginap malam (nama, NIK, tanggal), kuota gratis & kalkulasi surcharge otomatis | Top-Nav Tenant | P0 | Tenant |
| **SCR-013** | `/tenant/profile` | Profil & Kontak Darurat | Pengaturan data profil pribadi, kontak darurat keluarga, preferensi notifikasi WA, ganti password | Top-Nav Tenant | P0 | Tenant |

---

## 3. Branch Staff & Caretaker Portal (`SCR-014` – `SCR-031`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-014** | `/staff/dashboard` | Dashboard Operasional Cabang | KPI okupansi harian, tagihan jatuh tempo hari ini, tiket terbuka, checklist turnover harian | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-015** | `/staff/rooms` | Inventaris Kamar Cabang | Grid interaktif status kamar (Terisi, Kosong, Perbaikan, Dipesan), filter lantai & tipe | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-016** | `/staff/rooms/:id` | Detail Kamar & Aset | Daftar inventaris aset (AC, kasur, smart door), log riwayat penghuni, status kebersihan | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-017** | `/staff/tenants` | Direktori Penghuni Cabang | Tabel penghuni aktif, nomor kamar, kontak darurat terverifikasi, tanggal jatuh tempo | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-018** | `/staff/tenants/:id` | Detail Penghuni & KYC | Data KTP terenkripsi (UU PDP), riwayat sewa, log kepatuhan aturan kos, catatan internal | Top-Nav Staff | P0 | Branch Manager |
| **SCR-019** | `/staff/tenants/new` | Onboarding Penghuni Baru | Wizard pendaftaran penghuni baru, pilih kamar, input skema bayar pro-rata, unggah KTP | Top-Nav Staff | P0 | Branch Manager |
| **SCR-020** | `/staff/contracts` | Manajemen Kontrak Cabang | Daftar kontrak aktif, perpanjangan sewa, pemberitahuan terminasi normal & penanganan skip-out | Top-Nav Staff | P0 | Branch Manager |
| **SCR-021** | `/staff/handover/:id` | Checklist Handover Kamar | Formulir serah terima kunci/kartu akses, checklist kondisi fisik aset awal/akhir + foto bersama | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-022** | `/staff/meters` | Pencatatan Sub-Meter Listrik | Formulir input angka meteran kWh bulanan, unggah foto bukti meteran fisik, kalkulasi tagihan | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-023** | `/staff/guests` | Buku Tamu Menginap Cabang | Log pengawasan tamu menginap, verifikasi identitas tamu, status pembayaran biaya kelebihan hari | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-024** | `/staff/tickets` | Antrean Tiket Perbaikan | Daftar komplain fasilitas masuk, filter kategori (listrik, air, AC, wifi), penugasan caretaker | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-025** | `/staff/tickets/:id` | Pengerjaan Servis Fasilitas | Log penanganan perbaikan, unggah kwitansi pembelian suku cadang material, tombol tandai selesai | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-026** | `/staff/announcements` | Pengumuman Resmi Cabang | Broadcast pesan info pemadaman/maintenance air via portal dan pemicu notifikasi outbox WA | Top-Nav Staff | P0 | Branch Manager |
| **SCR-027** | `/staff/turnover` | Housekeeping & Kebersihan | Checklist 10 poin pembersihan kamar pasca check-out sebelum kamar dialihkan ke status siap huni | Top-Nav Staff | P0 | Caretaker |
| **SCR-028** | `/staff/parking` | Alokasi Slot Parkir | Manajemen slot parkir mobil & motor, nomor plat kendaraan penghuni, stiker parkir resmi | Top-Nav Staff | P0 | Branch Manager, Caretaker |
| **SCR-029** | `/staff/bookings` | Pipeline Survey & Reservasi | Jadwal kunjungan calon penghuni, status follow-up prospek, penahanan kamar dengan DP booking | Top-Nav Staff | P0 | Branch Manager |
| **SCR-030** | `/staff/reports/rtw` | Laporan Registrasi RT/RW | Ekspor data identitas penghuni berkala format PDF/CSV sesuai regulasi wajib lapor lingkungan | Top-Nav Staff | P0 | Branch Manager |
| **SCR-031** | `/staff/profile` | Pengaturan Akun Petugas | Informasi penugasan cabang, preferensi tugas harian, pergantian kredensial keamanan | Top-Nav Staff | P0 | Branch Manager, Caretaker |

---

## 4. Branch Finance Portal (`SCR-032` – `SCR-036`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-032** | `/finance/dashboard` | Dashboard Keuangan Cabang | KPI arus kas masuk bulanan, total tagihan tertunggak, rekonsiliasi manual pending | Top-Nav Finance | P0 | Finance, Owner |
| **SCR-033** | `/finance/invoices` | Manajemen Tagihan & Invoice | Master list tagihan cabang, status overdue, denda otomatis, eksekusi generator cron manual | Top-Nav Finance | P0 | Finance, Owner |
| **SCR-034** | `/finance/verify` | Verifikasi Pembayaran | Antrean bukti transfer bank, pengecekan anti duplikasi hash transfer, verifikasi cicilan parsial | Top-Nav Finance | P0 | Finance, Owner |
| **SCR-035** | `/finance/cashbook` | Buku Kas Operasional | Pencatatan append-only arus masuk (sewa, denda) & keluar (utilitas, operasional), hapus buku bad debt | Top-Nav Finance | P0 | Finance, Owner |
| **SCR-036** | `/finance/receipts/:id`| Kwitansi Digital Resmi | Pratinjau kwitansi pembayaran resmi ber-QR verification, tombol cetak dan kirim PDF via WA | Top-Nav Finance | P0 | Finance, Owner |

---

## 5. Multi-Property Owner Executive Portal (`SCR-037` – `SCR-047`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-037** | `/owner/dashboard` | Dashboard Portofolio Eksekutif | Konsolidasi pendapatan kotor/bersih lintas semua cabang, okupansi rata-rata, tren tunggakan | Top-Nav Owner | P0 | Owner |
| **SCR-038** | `/owner/branches` | Manajemen Cabang Properti | Daftar cabang properti kos, konfigurasi alamat, kapasitas total kamar, penugasan branch manager | Top-Nav Owner | P0 | Owner |
| **SCR-039** | `/owner/branches/:id/policy` | Kebijakan & Rekening Cabang | Pengaturan nomor rekening bank resmi cabang (terkunci), aturan denda keterlambatan, toleransi | Top-Nav Owner | P0 | Owner |
| **SCR-040** | `/owner/staff` | Manajemen Akses Karyawan | Undangan karyawan cabang, penetapan peran RBAC (Finance, Manager, Caretaker), cabut sesi | Top-Nav Owner | P0 | Owner |
| **SCR-041** | `/owner/rooms` | Peta Okupansi Multi-Cabang | Matriks visual perbandingan okupansi dan ketersediaan kamar seluruh properti pemilik | Top-Nav Owner | P0 | Owner |
| **SCR-042** | `/owner/approvals` | Otorisasi Khusus Pemilik | Antrean persetujuan void transaksi kas, penghapusan piutang macet, dan terminasi sengketa | Top-Nav Owner | P0 | Owner |
| **SCR-043** | `/owner/reports` | Laporan Laba Rugi Konsolidasi | Analisis laporan keuangan (Pendapatan Sewa, Listrik, Beban Operasional, Net Income) | Top-Nav Owner | P0 | Owner |
| **SCR-044** | `/owner/audit` | Audit Trail Keamanan Sistem | Log keabadian aktivitas finansial, perubahan rekening, pengubahan hak akses, data log KTP | Top-Nav Owner | P0 | Owner |
| **SCR-045** | `/owner/addons` | Katalog Layanan Tambahan | Tarif sewa alat elektronik (kulkas, dispenser), laundry bulanan, katering, biaya parkir mobil | Top-Nav Owner | P0 | Owner |
| **SCR-046** | `/owner/simulation` | Simulasi Cron Billing Bulanan | Uji coba otomasi perhitungan tagihan sewa + meteran + denda secara visual tanpa mutasi data | Top-Nav Owner | P0 | Owner |
| **SCR-047** | `/owner/profile` | Profil & Organisasi Pemilik | Data legal pemilik kos (NPWP, badan usaha/perorangan), kontak pimpinan, pengaturan sesi akun | Top-Nav Owner | P0 | Owner |

---

## 6. Super Admin & Platform System Portal (`SCR-048` – `SCR-053`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-048** | `/admin/dashboard` | Dashboard Administrator | Metrik global platform (total tenant, volume transaksi bulan ini, load server, outbox queue health) | Top-Nav Admin | P0 | Super Admin |
| **SCR-049** | `/admin/owners` | Direktori Organisasi Pemilik | Daftar akun organisasi pemilik kos terdaftar, status langganan platform, batas kuota kamar | Top-Nav Admin | P0 | Super Admin |
| **SCR-050** | `/admin/owners/:id` | Detail & Audit Kepatuhan | Tinjauan kepatuhan legal organisasi, batas properti, log akses audit darurat | Top-Nav Admin | P0 | Super Admin |
| **SCR-051** | `/admin/config` | Konfigurasi Global Platform | Pengaturan parameter sistem, rate limiting, gerbang WAHA instance, pemeliharaan terjadwal | Top-Nav Admin | P0 | Super Admin |
| **SCR-052** | `/admin/audit` | Master Audit Trail Platform | Log global aktivitas root, audit trail eskalasi keamanan, penegakan kepatuhan UU PDP | Top-Nav Admin | P0 | Super Admin |
| **SCR-053** | `/admin/profile` | Profil Root Administrator | Manajemen kredensial super admin, audit session aktif, rotasi secret token sistem | Top-Nav Admin | P0 | Super Admin |

---

## 7. System & Error Fallback Screens (`SCR-054` – `SCR-057`)

| Screen ID | Route / URL | Screen Title | Purpose & Primary Capability | Layout Shell | Priority | RBAC Guard |
|:---|:---|:---|:---|:---|:---:|:---|
| **SCR-054** | `/errors/403` | Akses Ditolak (Forbidden) | Halaman perlindungan hak akses RBAC jika user mencoba mengakses rute di luar wewenang | Minimal Error | P0 | All Roles |
| **SCR-055** | `/errors/404` | Halaman Tidak Ditemukan | Halaman panduan jika tautan URL yang dituju rusak atau nomor ID data tidak ditemukan | Minimal Error | P0 | All Roles |
| **SCR-056** | `/errors/500` | Gangguan Server Internal | Penanganan kesalahan runtime server, log referensi error code, tombol coba muat ulang | Minimal Error | P0 | All Roles |
| **SCR-057** | `/offline` | Mode Offline Jaringan | Tampilan offline saat koneksi internet terputus, informasi data tertahan di antrean lokal | Minimal Error | P0 | All Roles |
