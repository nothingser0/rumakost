# Kanban — Sistem Manajemen Kost Mandiri (RumaKost)

> Board eksekusi MVP Medium satu properti (7 Epic P0, 22 Story P0). Dioptimalkan khusus untuk alur kerja Solo Developer dengan otomasi Jira dan format scannable.

---

## 1. Workflow & Batas WIP

`	ext
Backlog ──► To Do (5) ──► In Progress (2) ──► In Review (1) ──► Done
`

| Status | WIP Limit | Penjelasan Transisi Ringkas (Maks. 1 Kalimat) |
|---|:---:|---|
| **Backlog** | ∞ | Menampung seluruh ide, tiket, dan kebutuhan fitur yang belum diprioritaskan untuk iterasi aktif. |
| **To Do** | **5** | Item yang sudah siap dikerjakan dengan spesifikasi jelas dan menunggu ditarik saat kapasitas tersedia. |
| **In Progress** | **2** | Pekerjaan yang sedang aktif dikerjakan secara fokus (ideal 1 fokus utama per waktu). |
| **In Review** | **1** | Tahap pemeriksaan mandiri (self-review diff, validasi AC, uji akses) sebelum dinyatakan tuntas. |
| **Done** | ∞ | Seluruh acceptance criteria terpenuhi, pengujian lolos, dan hasil telah diterima. |

---

## 2. Aturan Otomatisasi Field (Solo Project)

Untuk menghilangkan redundansi penulisan manual di setiap kartu:
- **Assignee**: Diatur otomatis via Jira Automation ke **"Assign to me"** saat kartu ditarik ke In Progress (tidak ditulis di tiap kartu).
- **Labels**: Label Solo dihapus dari seluruh kartu; label hanya disematkan jika ada kondisi khusus seperti locked.
- **Due Date**: Dikosongkan secara global untuk seluruh kartu individual, kecuali jika terdapat *hard deadline* eksternal yang mengikat.

---

## 3. Daftar Epic MVP (RK-001 s.d RK-007)

### RK-001 [Epic] — Akses Owner, Staff, dan Penghuni
- **Priority**: Highest
- **Description**: Sediakan modul autentikasi dan isolasi hak akses untuk tiga peran pengguna. Menjadi fondasi keamanan data operasional kost tanpa registrasi publik.
- **Acceptance Criteria**:
  - [ ] Owner dapat membuat dan mengaktifkan akun Staff serta Penghuni.
  - [ ] Penghuni hanya dapat mengakses data kamar, tagihan, dan tiket miliknya.
  - [ ] Staff dibatasi dari laporan keuangan Owner dan data di luar kewenangannya.
- **Estimate**: 16–22 hours
- **Dependencies**: None

### RK-002 [Epic] — Manajemen Kamar Satu Properti
- **Priority**: Highest
- **Description**: Kelola inventaris kamar dan status hunian operasional kost satu properti. Menghubungkan ketersediaan fisik kamar dengan data kontrak sewa aktif.
- **Acceptance Criteria**:
  - [ ] Kamar dengan kontrak sewa aktif otomatis berstatus terisi.
  - [ ] Kamar kosong dapat disetel ke status tersedia atau dalam perawatan.
  - [ ] Sistem menolak alokasi dua kontrak aktif sekaligus pada kamar yang sama.
- **Estimate**: 10–14 hours
- **Dependencies**: RK-001

### RK-003 [Epic] — Data Penghuni dan Siklus Kontrak
- **Priority**: Highest
- **Description**: Catat profil penghuni sintetis dan daftarkan kontrak sewa kamar berbatas waktu. Menjadi entitas sentral penghubung tagihan sewa dan tiket keluhan.
- **Acceptance Criteria**:
  - [ ] Mencegah penyimpanan kontrak sewa aktif dengan tanggal bertabrakan pada kamar yang sama.
  - [ ] Kontrak yang sudah selesai tetap tersimpan utuh dalam histori sewa.
- **Estimate**: 14–18 hours
- **Dependencies**: RK-001, RK-002

### RK-004 [Epic] — Pembuatan dan Pemantauan Tagihan
- **Priority**: Highest
- **Description**: Terbitkan tagihan sewa bulanan otomatis berdasarkan kontrak kamar aktif. Sediakan pemantauan status tagihan yang diperbarui secara manual tanpa gateway luar.
- **Acceptance Criteria**:
  - [ ] Setiap kontrak aktif hanya menghasilkan 1 tagihan per periode sewa.
  - [ ] Pembuatan berulang tidak menimbulkan tagihan duplikat (idempotent).
- **Estimate**: 14–18 hours
- **Dependencies**: RK-003

### RK-005 [Epic] — Pembayaran, Saldo Parsial, dan Riwayat
- **Priority**: Highest
- **Description**: Catat pembayaran tagihan tunai/transfer manual termasuk opsi cicilan bertahap. Verifikasi hanya oleh Owner dengan jejak audit reversal tanpa hapus data.
- **Acceptance Criteria**:
  - [ ] Pembayaran pending tidak memotong sisa tagihan.
  - [ ] Pembayaran terverifikasi langsung memotong saldo tagihan tepat satu kali.
  - [ ] Koreksi salah catat wajib memakai jurnal reversal beralasan.
- **Estimate**: 18–24 hours
- **Dependencies**: RK-004

### RK-006 [Epic] — Pengeluaran dan Laporan Ringkas
- **Priority**: Highest
- **Description**: Rekapitulasi pencatatan biaya operasional serta kalkulasi arus kas dan okupansi kost. Menampilkan performa operasional sederhana, bukan laporan akuntansi formal/pajak.
- **Acceptance Criteria**:
  - [ ] Total penerimaan dan pengeluaran akurat sesuai filter rentang tanggal.
  - [ ] Tingkat okupansi tertelusuri ke jumlah kamar dan kontrak yang sedang aktif.
- **Estimate**: 14–18 hours
- **Dependencies**: RK-002, RK-004, RK-005

### RK-007 [Epic] — Ticketing Kerusakan Penghuni
- **Priority**: Highest
- **Description**: Layanan pelaporan kerusakan kamar dari penghuni dengan lampiran foto/video wajib. Mendukung percakapan interaktif dan pengelolaan status tindak lanjut perbaikan.
- **Acceptance Criteria**:
  - [ ] Pengajuan tiket baru wajib memuat deskripsi serta minimal 1 foto/video bukti.
  - [ ] Batas ukuran media: foto maks 4 MB, video maks 12 MB/30 detik, kumulatif maks 40 MB.
  - [ ] Catatan internal Staff/Owner tidak dapat dibaca oleh Penghuni.
  - [ ] Tiket selesai hilang dari daftar aktif namun arsip riwayat tetap utuh.
- **Estimate**: 26–36 hours
- **Dependencies**: RK-001, RK-002, RK-003

---

## 4. Daftar Story & Task MVP (RK-019 s.d RK-040)

### F-01 — Akses dan Role

#### RK-019 [Story] — Masuk dan Keluar Akun
- **Parent**: RK-001
- **Priority**: Highest
- **Description**: Sediakan fitur login dan logout akun menggunakan kredensial yang telah diaktifkan. Sistem menolak registrasi terbuka publik demi keamanan properti.
- **Acceptance Criteria**:
  - [ ] Kredensial tidak valid atau akun nonaktif ditolak masuk.
  - [ ] Sesi login dapat diakhiri secara aman via tombol logout.
  - [ ] Halaman terlindungi mengarahkan pengguna tanpa sesi ke form login.
- **Estimate**: 6–8 hours
- **Dependencies**: None

#### RK-020 [Story] — Pembatasan Akses Berdasarkan Role
- **Parent**: RK-001
- **Priority**: Highest
- **Description**: Lindungi rute dan endpoint data agar tiap pengguna hanya melihat fitur sesuai perannya. Mencegah kebocoran laporan keuangan dan data privat penghuni lain.
- **Acceptance Criteria**:
  - [ ] Penghuni hanya dapat membaca dan mengubah data/tiket milik sendiri.
  - [ ] Staff diblokir dari akses menu laporan keuangan dan pengaturan akun Owner.
  - [ ] Akses ilegal tanpa izin ditolak di sisi server (403 Forbidden).
- **Estimate**: 6–8 hours
- **Dependencies**: RK-019

#### RK-021 [Story] — Pembuatan dan Aktivasi Akun Pengguna
- **Parent**: RK-001
- **Priority**: Highest
- **Description**: Berikan hak eksklusif kepada Owner untuk mendaftarkan dan mengaktifkan akun Staff dan Penghuni. Memastikan kontrol ketat terhadap pengguna aplikasi.
- **Acceptance Criteria**:
  - [ ] Pembuatan dan aktivasi akun hanya bisa dieksekusi oleh Owner.
  - [ ] Akun nonaktif tidak diizinkan masuk ke dalam sistem.
  - [ ] Perubahan status akun menyimpan jejak waktu dan nama pelaku.
- **Estimate**: 4–6 hours
- **Dependencies**: RK-019, RK-020

---

### F-02 — Manajemen Kamar

#### RK-022 [Story] — Pencatatan dan Pembaruan Data Kamar
- **Parent**: RK-002
- **Priority**: Highest
- **Description**: Fasilitasi pengelolaan master data kamar satu properti seperti nomor, tipe, dan harga sewa. Menyediakan basis kamar untuk dikaitkan dengan kontrak sewa.
- **Acceptance Criteria**:
  - [ ] Kamar dapat dibuat, diubah, dan dilihat oleh Owner/Staff berizin.
  - [ ] Validasi form mencegah duplikasi nomor kamar dalam properti.
  - [ ] Kamar kosong dapat diubah statusnya menjadi tersedia atau perawatan.
- **Estimate**: 5–7 hours
- **Dependencies**: RK-020

#### RK-023 [Story] — Tampilan Okupansi Kamar Otomatis
- **Parent**: RK-002
- **Priority**: Highest
- **Description**: Hubungkan status kamar dengan ketersediaan kontrak sewa aktif secara otomatis. Menghilangkan risiko kamar tersewa ganda akibat kesalahan manusia.
- **Acceptance Criteria**:
  - [ ] Kamar otomatis berstatus terisi bila terdapat kontrak sewa aktif.
  - [ ] Sistem menolak penambahan kontrak aktif pada kamar yang sedang terisi.
- **Estimate**: 5–7 hours
- **Dependencies**: RK-022, RK-025

---

### F-03 — Data Penghuni dan Kontrak

#### RK-024 [Story] — Pengelolaan Profil Penghuni Sintetis
- **Parent**: RK-003
- **Priority**: Highest
- **Description**: Kelola data kontak dan identitas minimal penghuni menggunakan data demo sintetis. Menghubungkan orang dengan kamar sewa, data pembayaran, dan riwayat tiket.
- **Acceptance Criteria**:
  - [ ] Profil penghuni dapat dikelola oleh Owner/Staff yang berhak.
  - [ ] Akun penghuni hanya dapat melihat profil miliknya sendiri.
  - [ ] Seluruh data demo menggunakan data fiktif tanpa PII nyata.
- **Estimate**: 4–6 hours
- **Dependencies**: RK-020

#### RK-025 [Story] — Pembuatan dan Pengakhiran Kontrak Sewa
- **Parent**: RK-003
- **Priority**: Highest
- **Description**: Catat ikatan sewa antara penghuni dan kamar untuk jangka waktu tertentu. Menjadi dasar resmi perhitungan tagihan sewa bulanan.
- **Acceptance Criteria**:
  - [ ] Kontrak valid menghubungkan 1 penghuni, 1 kamar, serta periode sewa.
  - [ ] Kontrak dapat diakhiri (check-out) dan mencatat tanggal pengakhiran.
  - [ ] Kontrak selesai tetap dapat diakses pada tab histori kontrak.
- **Estimate**: 5–6 hours
- **Dependencies**: RK-022, RK-024

#### RK-026 [Story] — Validasi Kontrak Tumpang Tindih
- **Parent**: RK-003
- **Priority**: Highest
- **Description**: Tolak pembuatan kontrak baru yang memiliki rentang tanggal bertabrakan pada kamar yang sama. Memastikan jadwal hunian kamar tidak berbenturan.
- **Acceptance Criteria**:
  - [ ] Sistem menolak simpan jika periode sewa menabrak kontrak aktif lain di kamar sama.
  - [ ] Riwayat kontrak terdahulu tetap tampil utuh di riwayat kamar.
- **Estimate**: 5–6 hours
- **Dependencies**: RK-025

---

### F-04 — Tagihan Berulang

#### RK-027 [Story] — Pembuatan Tagihan Bulanan Otomatis
- **Parent**: RK-004
- **Priority**: Highest
- **Description**: Hasilkan tagihan sewa berkala secara otomatis untuk seluruh kontrak yang aktif pada periode target. Menghindari kelalaian penagihan manual per kamar.
- **Acceptance Criteria**:
  - [ ] Tagihan terbit otomatis dari kontrak aktif sesuai jadwal periode.
  - [ ] Idempotent: eksekusi berulang tidak memicu duplikasi tagihan pada periode sama.
- **Estimate**: 6–8 hours
- **Dependencies**: RK-025, RK-026

#### RK-028 [Story] — Daftar dan Filter Status Tagihan
- **Parent**: RK-004
- **Priority**: Highest
- **Description**: Tampilkan daftar tagihan sewa beserta status pembayaran dan sisa tunggakan. Memudahkan pengawasan piutang sewa operasional.
- **Acceptance Criteria**:
  - [ ] Owner/Staff dapat melihat daftar seluruh tagihan dan memfilter statusnya.
  - [ ] Penghuni hanya dapat melihat daftar tagihan kamar miliknya.
  - [ ] Rincian tagihan menampilkan nilai sewa, jumlah dibayar, dan saldo sisa.
- **Estimate**: 4–5 hours
- **Dependencies**: RK-020, RK-027

#### RK-029 [Story] — Pencatatan Status Penyampaian Tagihan
- **Parent**: RK-004
- **Priority**: Highest
- **Description**: Tandai secara manual apakah informasi tagihan telah disampaikan kepada penghuni. MVP tidak mengirim notifikasi WhatsApp/email otomatis.
- **Acceptance Criteria**:
  - [ ] Status penyampaian tagihan dapat diubah manual (Terkirim/Belum).
  - [ ] Perubahan status mencatat waktu dan operator yang melakukan pembaruan.
- **Estimate**: 4–5 hours
- **Dependencies**: RK-027, RK-028

---

### F-05 — Pembayaran, Saldo Parsial, dan Riwayat

#### RK-030 [Story] — Pencatatan Klaim Pembayaran Masuk
- **Parent**: RK-005
- **Priority**: Highest
- **Description**: Catat data transfer atau uang tunai yang diserahkan penghuni dengan status awal 'Pending'. Menjaga agar klaim belum memotong saldo sebelum diaudit.
- **Acceptance Criteria**:
  - [ ] Form mencatat tanggal, nominal positif, dan tagihan yang dituju.
  - [ ] Catatan pembayaran baru otomatis berstatus Pending.
  - [ ] Pembayaran pending tidak mengurangi saldo tagihan penghuni.
- **Estimate**: 4–5 hours
- **Dependencies**: RK-027, RK-028

#### RK-031 [Story] — Verifikasi Pembayaran oleh Owner
- **Parent**: RK-005
- **Priority**: Highest
- **Description**: Berikan wewenang verifikasi mutasi pembayaran masuk secara tunggal kepada Owner. Terapkan prinsip zero self-approval untuk transaksi yang diinput staf.
- **Acceptance Criteria**:
  - [ ] Hanya akun Owner yang memiliki akses verifikasi atau tolak pembayaran.
  - [ ] Transaksi yang dibuat akun Staff dilarang diverifikasi oleh staf bersangkutan.
  - [ ] Penolakan pembayaran wajib menyertakan catatan alasan.
- **Estimate**: 5–7 hours
- **Dependencies**: RK-030

#### RK-032 [Story] — Perhitungan Saldo Pembayaran Parsial
- **Parent**: RK-005
- **Priority**: Highest
- **Description**: Hitung sisa saldo tagihan secara otomatis setelah pembayaran terverifikasi dicatat. Mendukung sistem cicilan tanpa merusak akurasi piutang.
- **Acceptance Criteria**:
  - [ ] Pembayaran terverifikasi langsung memotong sisa tagihan tepat satu kali.
  - [ ] Pembayaran sebagian otomatis mengubah status tagihan menjadi 'Dibayar Sebagian'.
  - [ ] Total pembayaran tidak boleh mengakibatkan saldo tagihan bernilai negatif.
- **Estimate**: 4–6 hours
- **Dependencies**: RK-030, RK-031

#### RK-033 [Story] — Koreksi Pembayaran via Reversal
- **Parent**: RK-005
- **Priority**: Highest
- **Description**: Sediakan mekanisme pembatalan pembayaran salah input dengan entri pembalik beralasan. Menjaga audit trail transaksi keuangan tetap utuh tanpa hapus data.
- **Acceptance Criteria**:
  - [ ] Pembatalan pembayaran menggunakan jurnal reversal beralasan.
  - [ ] Transaksi asli tetap tersimpan dalam riwayat dan tidak dihapus fisik.
  - [ ] Saldo tagihan otomatis terkalkulasi ulang kembali ke posisi semula.
- **Estimate**: 5–6 hours
- **Dependencies**: RK-031, RK-032

---

### F-06 — Pengeluaran dan Laporan

#### RK-034 [Story] — Pencatatan Pengeluaran Operasional
- **Parent**: RK-006
- **Priority**: Highest
- **Description**: Catat biaya pengeluaran kost seperti utilitas listrik/air dan pemeliharaan gedung. Memberikan data biaya untuk rekapitulasi arus kas properti.
- **Acceptance Criteria**:
  - [ ] Form pengeluaran mewajibkan tanggal, kategori biaya, nominal, dan keterangan.
  - [ ] Seluruh pengeluaran tersimpan dalam riwayat pembukuan operasional.
- **Estimate**: 4–5 hours
- **Dependencies**: RK-020

#### RK-035 [Story] — Ringkasan Arus Kas Masuk dan Keluar
- **Parent**: RK-006
- **Priority**: Highest
- **Description**: Tampilkan dasbor rekapitulasi pemasukan riil dan pengeluaran operasional per rentang tanggal. Memberikan gambaran cashflow bersih operasional kost.
- **Acceptance Criteria**:
  - [ ] Pemasukan hanya mengakumulasi pembayaran yang berstatus terverifikasi.
  - [ ] Filter rentang tanggal diterapkan konsisten untuk pemasukan dan pengeluaran.
  - [ ] Menampilkan total pemasukan, total pengeluaran, dan saldo selisih kas.
- **Estimate**: 5–7 hours
- **Dependencies**: RK-032, RK-033, RK-034

#### RK-036 [Story] — Rekapitulasi Tingkat Okupansi Kamar
- **Parent**: RK-006
- **Priority**: Highest
- **Description**: Sajikan visualisasi jumlah kamar terisi berbanding total kamar dalam satu properti. Membantu pemilik menilai kinerja keterisian kost secara cepat.
- **Acceptance Criteria**:
  - [ ] Menampilkan jumlah dan persentase kamar terisi vs total kamar.
  - [ ] Angka okupansi dapat ditelusuri langsung ke daftar kamar dan kontrak aktif.
- **Estimate**: 5–6 hours
- **Dependencies**: RK-022, RK-026

---

### F-07 — Ticketing Penghuni

#### RK-037 [Story] — Pembuatan Tiket Aduan dengan Bukti Wajib
- **Parent**: RK-007
- **Priority**: Highest
- **Description**: Formulir pelaporan kerusakan fasilitas kost dari penghuni dengan lampiran foto/video wajib. Menjamin keluhan terverifikasi jelas sebelum teknisi ditugaskan.
- **Acceptance Criteria**:
  - [ ] Tiket otomatis terhubung ke kamar dan profil penghuni pelapor.
  - [ ] Form menolak pengajuan jika uraian kosong atau tanpa lampiran media.
  - [ ] Validasi ukuran media: foto maks 4 MB, video maks 12 MB/30s, kumulatif maks 40 MB.
- **Estimate**: 8–10 hours
- **Dependencies**: RK-020, RK-022, RK-025

#### RK-038 [Story] — Percakapan dan Catatan Tindak Lanjut Tiket
- **Parent**: RK-007
- **Priority**: Highest
- **Description**: Fasilitasi dialog interaktif di dalam tiket antara Penghuni, Staff, dan Owner. Memungkinkan koordinasi perbaikan dan pengunggahan bukti progres kerja.
- **Acceptance Criteria**:
  - [ ] Pengguna berhak dapat menambahkan komentar dan lampiran foto pendukung.
  - [ ] Catatan bertanda 'Internal' hanya terlihat oleh Owner dan Staff.
  - [ ] Penghuni kost dilarang mengakses percakapan tiket kamar lain.
- **Estimate**: 5–7 hours
- **Dependencies**: RK-037

#### RK-039 [Story] — Triase Prioritas dan Penugasan Tiket
- **Parent**: RK-007
- **Priority**: Highest
- **Description**: Kelola prioritas dan status penanganan tiket perbaikan oleh Owner/Staff. Memperjelas status pengerjaan bagi penghuni dan pelaksana perbaikan.
- **Acceptance Criteria**:
  - [ ] Owner/Staff dapat mengubah prioritas (Low/Med/High/Urgent) dan status tiket.
  - [ ] Setiap pembaruan status mencatat waktu dan identitas operator.
  - [ ] Pembaruan status tiket otomatis terlihat oleh penghuni pembuat tiket.
- **Estimate**: 7–9 hours
- **Dependencies**: RK-020, RK-037

#### RK-040 [Story] — Penyelesaian dan Penutupan Siklus Tiket
- **Parent**: RK-007
- **Priority**: Highest
- **Description**: Selesaikan dan tutup tiket aduan yang telah tuntas diperbaiki oleh tim. Menjaga daftar aktif tetap bersih serta memulai hitungan retensi media 1 tahun.
- **Acceptance Criteria**:
  - [ ] Tiket selesai otomatis keluar dari daftar antrean aktif.
  - [ ] Seluruh riwayat percakapan dan media tetap dapat diakses di tab riwayat.
  - [ ] Tiket yang dibuka kembali (re-open) otomatis kembali ke daftar tiket aktif.
- **Estimate**: 6–10 hours
- **Dependencies**: RK-037, RK-038, RK-039