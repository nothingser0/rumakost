# Design Specification — RumaKost

> Status: spesifikasi diturunkan dari prototipe dan sitemap. Pemilik menyetujui Design Freeze pada 2026-10-30; nama dan tanggal approver tercatat pada bagian Design Freeze.

## Sumber dan ruang lingkup

- Sitemap: `docs/specs/SITEMAP.md`.
- Prototipe: `docs/design/screens/WF-01-login.html` sampai `WF-09-pengaturan.html`.
- Aturan visual: `DESIGN.md`, token bersama `docs/design/screens/assets/css/theme.css` dan `components.css`.
- Alur interaksi: `docs/design/SCENARIOS_WF01.md` sampai `SCENARIOS_WF12.md`, ditambah `SCENARIOS_E2E_WALKTHROUGH.md`.
- Implementasi MVP mengikuti tujuh kelompok P0 di `docs/pm/SCOPE_STATEMENT.md`. Fitur tambahan pada sitemap/runbook tetap di luar P0 bila tidak tercantum di scope.

## Visual Benchmark Side-by-Side Review

Benchmark terpilih adalah Estify Dashboard UI/UX Design, dengan referensi lokal di `docs/design/inspiration/`. Token, hierarki, dan ukuran mengacu pada `DESIGN.md` dan shared CSS. Checklist ini adalah pemeriksaan untuk dilakukan saat tinjauan manusia; tidak menyatakan tinjauan browser sudah dilakukan.

| Pemeriksaan | Kriteria | Status bukti |
|---|---|---|
| Spatial & Grid Layout | Sidebar/topbar dan kepadatan konten konsisten dengan referensi dan prototipe. | Tercatat pada `DESIGN.md`; tinjauan berdampingan manusia belum direkam. |
| Component Anatomy & Indicators | Kartu, badge, tabel, dan indikator memakai pola bersama dari component requirements. | Tercatat pada `docs/design/COMPONENT_REQUIREMENTS.md`. |
| Color Calibration & Tone Balance | Palet memakai token dengan provenance di `DESIGN.md`; status teks mematuhi kontras terukur. | Token tercatat; validasi per seluruh screen belum direkam. |
| Task Completion & Trust | Aksi jelas, validasi dan status pembayaran tidak menyiratkan pembayaran terverifikasi sebelum Owner menyetujui. | Alur ada pada scenario; eksekusi belum dibuktikan di aplikasi. |
| Human In-Browser Review | Pemilik meninjau prototipe dan membandingkan dengan referensi desain. | Menunggu pencatatan pemilik. |

## Exhaustive Screen Inventory

Inventori berikut disalin dari seluruh baris screen pada sitemap M04. Rute fitur P1/P2 tetap dokumentasi desain, bukan bagian implementasi P0 tanpa perubahan scope.
| **SCR-01** | `/login` | Publik / Semua Role | Hub masuk split-screen 3D dengan pemilih 3 peran (Pemilik, Staf, Penghuni). |
| **SCR-01A** | `/lupa-sandi` | Publik / Guest | Pengajuan pemulihan kata sandi (instruksi kontak WhatsApp Pemilik atau email). |
| **SCR-01B** | `/reset-sandi` | Publik (Token Valid) | Formulir pembuatan kata sandi baru pasca-validasi token pemulihan. |
| **SCR-01C** | `/aktivasi-sandi` | Staf & Penghuni Baru | Modal/Layar paksa ganti kata sandi sementara saat login perdana (*First-Time Forced Change*). |
| **SCR-02** | `/dashboard` | Pemilik & Staf | Dasbor ringkasan: metrik gauge okupansi, double bar chart arus kas, kartu properti, dan status cepat kamar. |
| **SCR-03** | `/kamar` | Pemilik & Staf | Katalog 15 unit kamar: filter lantai, badge ketersediaan (Terisi, Kosong, Perbaikan, Dibersihkan). |
| **SCR-04** | `/kamar/:id` | Pemilik & Staf | Detail unit: inventaris fasilitas kamar, riwayat kontrak, penghuni aktif, checklist inspeksi. |
| **SCR-05** | `/penghuni` | Pemilik & Staf | Direktori penyewa: status sewa aktif, filter jatuh tempo, data plat nomor kendaraan motor/mobil. |
| **SCR-06** | `/penghuni/:id` | Pemilik & Staf | Profil penyewa: kontak WhatsApp, kontak darurat keluarga, masa sewa, dan riwayat komplain. |
| **SCR-07** | `/kontrak` | Pemilik & Staf | Rekap perjanjian sewa: tanggal mulai, klausul sewa, status deposit jaminan (*escrow*). |
| **SCR-08** | `/kontrak/:id` | Pemilik & Staf | Lembar detail kontrak, form serah terima kunci (*check-in/check-out*), potong deposit kerusakan. |
| **SCR-09** | `/tagihan` | Pemilik & Staf | Matriks penagihan bulanan sewa kamar, filter status pelunasan (Lunas, Jatuh Tempo, Terlambat). |
| **SCR-09M**| `/tagihan/meteran` | Pemilik & Staf | Catat angka sub-meteran kWh listrik & air bulanan per unit kamar untuk penambahan tagihan. |
| **SCR-10** | `/tagihan/:id` | Pemilik & Staf | Invoice penagihan sewa digital, tombol kirim pengingat WhatsApp, dan histori cicilan parsial. |
| **SCR-11** | `/pembayaran` | Pemilik & Staf | **Pemilik**: Verifikasi mutasi rekening & approval pelunasan. **Staf**: Form catat titipan bayar (*Zero Self-Approval: status Pending*). |
| **SCR-12** | `/pengeluaran` | Pemilik & Staf | Catatan belanja operasional rutin (token listrik umum, WiFi, air, nota servis teknisi). |
| **SCR-13** | `/laporan` | **Pemilik Sahaja** | Laporan laba bersih, rekap arus kas masuk/keluar, dan tren okupansi 12 bulan (Owner-only). |
| **SCR-14** | `/tiket` | Pemilik & Staf | Manajemen tiket komplain: triase prioritas (Mendesak, Normal, Rendah), penugasan staf/teknisi. |
| **SCR-15** | `/tiket/:id` | Pemilik & Staf | Detail penanganan tiket: indikator progres 5 segmen Estify, bukti foto kerusakan, log aktivitas. |
| **SCR-16** | `/pengaturan/akun` | **Pemilik Sahaja** | Direktori pengguna sistem: buat/aktifkan akun Staf & Penghuni (F-01), opsi reset kredensial. |
| **SCR-17** | `/pengaturan/profil`| **Pemilik Sahaja** | Konfigurasi identitas kost, alamat, kontak pengelola, dan nomor rekening bank resmi. |
| **SCR-18** | `/profil` | Pemilik & Staf | **Profil Akun Saya & Ganti Kata Sandi**: Penggantian kata sandi mandiri & info kontak pribadi. |
| **SCR-19** | `/pengumuman` | Pemilik & Staf | Buat & kelola papan pengumuman kost (jadwal kuras toren, listrik padam, aturan baru). |
| **SCR-20** | `/aktivitas` | **Pemilik Sahaja** | Log audit trail: jejak pencatatan pembayaran staf, perubahan tarif sewa, dan status kamar. |
| **SCR-P01** | `/portal` | Penghuni Sahaja | **Beranda Kamar Penghuni**: Menampilkan nomor kamar aktif, hitung mundur check-in (jika pra-hunian), tanggal jatuh tempo, banner pengumuman kost, dan kontak darurat. Mode read-only untuk alumni sewa. |
| **SCR-P02** | `/portal/tagihan` | Penghuni Sahaja | **Lembar Tagihan Saya**: Invoice sewa aktif, rincian biaya pokok + deposit + utilitas listrik, riwayat kwitansi lunas, dan form konfirmasi transfer bank. |
| **SCR-P03** | `/portal/tiket` | Penghuni Sahaja | **Daftar Komplain Saya**: Riwayat seluruh laporan perbaikan fasilitas yang diajukan untuk unit kamarnya. |
| **SCR-P04** | `/portal/tiket/baru` | Penghuni Sahaja | **Form Lapor Kerusakan (F-07)**: Input judul, kronologi kerusakan, dan **area unggah wajib minimal satu foto/video bukti kerusakan**. |
| **SCR-P05** | `/portal/tiket/:id` | Penghuni Sahaja | **Pelacakan Perbaikan**: Indikator 5 tahapan visual (*Diterima -> Ditugaskan -> Pengerjaan -> Pengecekan -> Selesai*), estimasi teknisi, dan thread obrolan dua arah. |
| **SCR-P06** | `/portal/profil` | Penghuni Sahaja | **Profil & Keamanan Akun**: Form ganti kata sandi mandiri, data nomor kontak darurat keluarga, dan registrasi plat nomor kendaraan motor/mobil. |
| **SCR-P07** | `/portal/panduan` | Penghuni Sahaja | **Buku Saku Kost**: Password WiFi aktif, aturan jam bertamu/gerbang malam, jadwal buang sampah, kontak darurat lingkungan/PLN/RS. |
| **SCR-P08** | `/portal/izin-tamu` | Penghuni Sahaja | **Izin Tamu Menginap**: Formulir pelaporan tamu menginap sementara untuk kepatuhan tata tertib. |
| **SYS-01** | `/notifikasi` | Semua Pengguna | Riwayat notifikasi in-app (tiket diupdate, invoice baru terbit, pembayaran disahkan). |
| **SYS-02** | `/403` | Semua Pengguna | Tampilan *Akses Ditolak (Forbidden)* saat pengguna mencoba membuka halaman di luar wewenangnya. |
| **SYS-03** | `/404` | Semua Pengguna | Tampilan *Halaman Tidak Ditemukan (Not Found)* dengan tombol kembali ke dashboard peran. |
## Matriks 5-State

| Pola | Idle / Default | Loading | Empty | Error | Success |
|---|---|---|---|---|---|
| Daftar kamar, penghuni, tagihan, tiket | Tampilkan data sesuai role dan filter aktif. | Pertahankan header/filter; tampilkan indikator pemuatan yang tidak menggeser layout. | Jelaskan belum ada data dan tampilkan aksi yang boleh dilakukan role tersebut. | Jelaskan data gagal dimuat dan sediakan aksi coba lagi; jangan hilangkan state terakhir bila aman. | Perbarui baris/status setelah server mengonfirmasi aksi. |
| Form login, kontrak, pembayaran, pengeluaran, tiket | Field berlabel, nilai awal yang aman, tombol aksi tersedia. | Cegah submit berulang dan tampilkan label sedang diproses. | Tampilkan panduan singkat saat form belum diisi bila sesuai konteks. | Tautkan pesan validasi ke field; jangan menampilkan detail internal atau mengubah pending menjadi terverifikasi. | Beri konfirmasi eksplisit setelah server menerima perubahan. |
| Detail kontrak, invoice, pembayaran, tiket | Rincian dan histori hanya sesuai izin role. | Placeholder pada area data yang belum tersedia. | Beri keterangan histori kosong dan aksi berikutnya sesuai akses. | Tampilkan pesan gagal beserta cara memuat ulang. | Tampilkan nilai/status baru dan jejak perubahan relevan. |

## Spatial & Grid Layout

Desktop menggunakan shell navigasi dan topbar yang mengikuti prototipe; konten memakai grid yang dapat menyusut tanpa menutupi kolom tabel. Pada layar sempit, navigasi dan susunan metrik berpindah ke pola mobile yang ditunjukkan referensi. Tabel keuangan dan operasional tetap dapat dibaca dengan reflow atau gulir horizontal yang jelas.

## Component Anatomy & Indicators

- Navigasi menampilkan hanya tujuan yang diizinkan role. Laporan dan pengaturan finansial hanya tersedia bagi Owner.
- Ringkasan dashboard memisahkan penerimaan, tunggakan, okupansi, dan saldo deposit escrow. Escrow tidak dicampur ke pendapatan sewa.
- Tabel utama memakai pencarian/filter, badge status, baris detail, dan pagination sesuai wireframe WF-03 sampai WF-08.
- Form kontrak menampilkan tarif, nominal deposit, tanggal mulai, dan pilihan billing yang ditetapkan di M04. Invoice pertama memisahkan komponen sewa dan deposit.
- Status pembayaran `Pending` dan `Terverifikasi` dibedakan secara tekstual dan visual; hanya Owner dapat mengesahkan pembayaran.
- Permintaan check-out penghuni diteruskan ke Owner; inspeksi dan rekonsiliasi refund/potongan dilakukan Owner.
- Form tiket membutuhkan uraian dan minimal satu foto/video; komentar internal tidak terlihat oleh penghuni.

## Motion & Interaction

Transisi komponen mengikuti token shared CSS (`150ms` untuk respons cepat dan `200ms` untuk transisi normal). Gunakan perubahan warna/status yang membantu menunjukkan hasil tindakan; hindari gerakan dekoratif. `prefers-reduced-motion` harus mengurangi transisi non-esensial. Dialog mengembalikan fokus ke pemicu dan focus ring tetap terlihat.

## Accessibility

Gunakan label form yang terhubung, nama aksesibel pada tombol ikon, urutan fokus logis, focus ring terlihat, pesan error yang menjelaskan pemulihan, dan kontras teks sesuai catatan `DESIGN.md`. Status selalu menyertakan teks, tidak hanya warna. Aksi finansial yang mengubah saldo membutuhkan konfirmasi dan umpan balik hasil.

## Design Freeze

Status: **APPROVED AND FROZEN**. Pemilik menyetujui Design Freeze melalui percakapan pada 2026-10-30.

Approved by: zeenn
Approved on: 2026-10-30
