# Frozen Scope — Sistem Manajemen Kost Mandiri

> Status: FROZEN atas arahan pemilik pada 22 Oktober 2026. Keputusan ini menggantikan scope Large sebelumnya: MVP Medium, satu properti, tujuh kelompok P0. Fitur tambahan dipindahkan ke backlog versi berikutnya.

## Keputusan Pemilik tentang Batas Properti

Pemilik menetapkan MVP **Medium dengan satu properti dan tujuh kelompok P0**. Keputusan ini menggantikan scope Large 17 P0 yang sempat disetujui. Fitur tambahan dipindahkan ke backlog versi selanjutnya. Data demo tetap sintetis: nama/kontak, kontrak, tagihan, pembayaran, tiket, dan media yang diperlukan fitur inti. NIK, dokumen KTP, detail rekening, dan bukti transfer tidak masuk MVP dan dapat dinilai untuk versi berikutnya.

Scope Medium MVP disetujui dan FROZEN pada 2026-10-22: satu properti, tujuh P0. Pada 2026-10-30, pemilik mengarahkan agar perilaku tujuh P0 di M05 mengikuti wireframe/runbook M04; deposit escrow dan dua mode billing check-in dimasukkan di slice F-03/F-04/F-05. Breakdown tetap 22 Story, dengan penyesuaian estimasi pada RK-025/RK-027/RK-032. Estimasi MVP terbaru 186–245 jam; atas arahan pemilik, jadwal diperbarui menjadi 21 minggu/252 jam untuk menampung batas atas. Fitur M04 di luar tujuh P0 tetap backlog/out-of-scope.

## 1. Metadata dan Kendali Dokumen

- Nama proyek: Sistem Manajemen Kost Mandiri
- Pemilik proyek: belum dicatat
- Solo developer: pemilik proyek, dibantu AI
- Referensi: IDEA_BRIEF.md dan USER_RESEARCH_REPORT.md
- Status dokumen: FROZEN — MEDIUM MVP DISETUJUI PEMILIK 2026-10-22; menggantikan baseline Large
- Skala: Medium (7 kelompok P0; satu properti)
- Tanggal elicitation: 14–22 Oktober 2026; INT-10 bertanggal rentang 20–21 Oktober, hari tunggal belum diketahui
- Tanggal pembaruan: 30 Oktober 2026 (Penyelarasan M05 ke wireframe/runbook M04 untuk deposit dan dua mode billing check-in)
- Delivery: Portfolio; bukan layanan komersial

### Confidence

| Ikon | Arti | Cara dipakai |
|---|---|---|
| ✅ | Temuan yang disampaikan langsung oleh responden | Berlaku pada sampel wawancara yang dicatat, bukan seluruh pasar |
| 🔶 | Rincian desain/inferensi | Perlu dikonfirmasi pada spesifikasi teknis; tidak boleh mengubah daftar scope tanpa kontrol perubahan |
| ❓ | Belum diketahui | Selesaikan atau keluarkan dari MVP |

### Protokol Pembekuan Scope

Pemilik menetapkan tujuh kelompok P0 untuk MVP Medium satu properti pada 2026-10-22. Keputusan ini menggantikan baseline Large sebelumnya. Perubahan fitur setelah freeze perlu dicatat sebagai perubahan scope. Kriteria teknis dapat diperinci pada M04/M05 sepanjang tidak mengubah batas MVP.

## 2. Tujuan, Akar Masalah, dan Ukuran Keberhasilan

### 2.1 Masalah dan Akar Penyebab

- Masalah inti yang didukung sampel: pengelola kesulitan memastikan tagihan dan status pembayaran karena catatan tersebar di buku, spreadsheet, WhatsApp, dan catatan terpisah.
- Cluster bukti dalam 10 wawancara: friksi tagihan/pembayaran (INT-01–05, INT-09); keluhan/perbaikan terlambat atau hilang (INT-01–05, INT-08); kebutuhan ringkasan keuangan (INT-02, INT-04, INT-06, INT-10); dan kebutuhan lintas properti (INT-02, INT-04, INT-09).
- MVP satu properti berisi tujuh kelompok P0; fitur tambahan disimpan dalam backlog P1/P2 versi berikutnya dan tidak dianggap telah divalidasi wawancara.
- Multi-properti tetap di luar scope atas pilihan pemilik. Jika dibuka kembali sebagai hierarki properti, klasifikasi high-water perlu ditinjau dan dapat menjadi Large.

### 2.2 Ukuran Sukses Portfolio

- Ukuran utama: enam skenario end-to-end dapat diselesaikan dengan akun demo dan data sintetis tanpa edit database manual, mencakup tujuh kelompok P0 MVP.
- Ukuran kualitas: pembayaran pending tidak mengurangi saldo; pembayaran terverifikasi mengurangi saldo tepat satu kali; setiap koreksi menyisakan riwayat.
- Guardrail privasi: tidak ada PII nyata dalam seed, tangkapan layar, atau repository.
- Tidak ada target MRR/retensi karena ini portfolio non-komersial.
- Uji dengan calon pengguna/reviewer belum dilakukan.

## 3. Peran dan Otorisasi

Sistem memiliki tiga role. Akun Staff dan Penghuni dibuat/diaktifkan oleh Owner; pendaftaran penghuni publik berada di luar MVP.

| Peran | Lihat | Buat/perbarui | Verifikasi pembayaran | Laporan |
|---|---|---|---|---|
| Owner | Semua data satu properti | Kamar, penghuni, kontrak, tagihan, transaksi, tiket, role dan koreksi | Ya; memeriksa mutasi di luar sistem | Semua laporan |
| Staff | Data operasional yang ditugaskan, tiket, penghuni/kamar terkait | Membuat/check-in kontrak, memperbarui tiket, mencatat pembayaran pending, pengeluaran operasional, atau penyampaian sesuai izin | Tidak; Owner saja | Tidak ada laporan finansial |
| Penghuni | Data kamar/kontrak/tagihan sendiri dan tiket miliknya | Mengajukan check-out; membuat tiket, komentar, serta lampiran | Tidak | Tidak melihat laporan properti |

Aturan: akses media mengikuti hak akses tiket; Penghuni hanya dapat melihat tiket miliknya. **ZERO SELF-APPROVAL untuk Staff:** Staff tidak boleh memverifikasi transaksi yang dicatatnya sendiri; Owner bertindak sebagai verifier independen dan berwenang memverifikasi, menolak, atau mengoreksi transaksi. Detail matriks izin ditetapkan pada spesifikasi M05 sebelum implementasi.

## 4. Batas Fitur (MoSCoW)

MVP memuat tujuh kelompok P0, sesuai rentang Medium (6–15), dan dibatasi ke satu properti. Fitur lain berada di backlog versi selanjutnya.

| ID | Area | Deskripsi kebutuhan | Prioritas | Akar masalah | Perkiraan jam (kasar) | Keyakinan |
|---|---|---|---|---|---:|---|
| **F-01** | Akses dan peran | Owner login, membuat/mengaktifkan akun Staff dan Penghuni; masing-masing mendapat hak minimum sesuai perannya. | **P0 (Must)** | Kebutuhan kontrol Owner/Staff/Penghuni | 16–22 | 🔶 |
| **F-02** | Manajemen kamar | Catat kamar dan status operasional/hunian dalam satu properti. | **P0 (Must)** | Prasyarat pengelolaan properti | 10–14 | 🔶 |
| **F-03** | Penghuni dan siklus kontrak | Catat penghuni, periode sewa, status kontrak aktif/berakhir, dan histori kontrak. | **P0 (Must)** | Menghubungkan penghuni dengan tagihan; INT-02/04 melaporkan data penghuni tertinggal | 14–18 | 🔶 |
| **F-04** | Tagihan berulang | Buat tagihan bulanan dari kontrak aktif, cegah duplikasi, dan tampilkan status penyampaian manual. | **P0 (Must)** | Tagihan manual/kontak usang (INT-02/04) | 14–18 | 🔶 |
| **F-05** | Pembayaran, saldo parsial, dan riwayat | Catat pembayaran dan klaim; hanya yang diverifikasi Owner mengurangi saldo. Koreksi menyimpan jejak; tanpa koneksi bank/gateway. | **P0 (Must)** | Rekonsiliasi, pembayaran parsial, dan catatan tersebar (INT-01–05, INT-09) | 18–24 | 🔶 |
| **F-06** | Pengeluaran dan laporan pemasukan/okupansi | Catat pemasukan/pengeluaran kost secara sederhana, lalu tampilkan ringkasan periode dan okupansi satu properti. Bukan akuntansi/pajak. | **P0 (Must)** | Rekap keuangan sulit disusun (INT-02/04/06/10) | 14–18 | 🔶 |
| **F-07** | Ticketing kerusakan dari penghuni | Penghuni membuat tiket untuk kamar/kontraknya dengan uraian dan minimal satu foto/video wajib. Penghuni, Staff, dan Owner dapat berkomentar; komentar dapat menyertakan lampiran. Staff/Owner mengatur prioritas, penanggung jawab, status, serta tindak lanjut. | **P0 (Must)** | Keluhan/perbaikan tercecer atau terlambat (INT-01–05, INT-08) | 26–36 | 🔶 |
| **F-08** | Notifikasi dalam aplikasi | Beri notifikasi saat tiket ditugaskan, status berubah, atau komentar baru masuk; sediakan daftar dan status sudah dibaca. | **P1 (Should)** | Mengurangi tiket yang terlewat | 12–18 | 🔶 |
| **F-09** | Filter dan pengingat tiket lama | Filter tiket menurut status, prioritas, kamar, dan lama terbuka; tandai tiket yang melewati ambang umur. | **P1 (Should)** | Tindak lanjut maintenance | 8–12 | 🔶 |
| **F-10** | Ekspor CSV | Ekspor laporan keuangan dan riwayat tiket dengan filter periode dan pemeriksaan akses role. | **P1 (Should)** | Rekap dan portabilitas laporan | 6–10 | 🔶 |
| **F-11** | Struk pengeluaran dan biaya perbaikan | Lampirkan bukti/struk pada pengeluaran dan tautkan biaya perbaikan ke tiket terkait. | **P1 (Should)** | Bukti biaya operasional dan maintenance | 8–14 | 🔶 |
| **F-12** | Jadwal preventive maintenance | Buat jadwal servis berkala, misalnya AC, dan daftar pekerjaan mendatang/terlambat. | **P2 (Could)** | Mengurangi perbaikan yang terlambat | 12–18 | 🔶 |
| **F-13** | Direktori teknisi/vendor | Catat kontak vendor sintetis/operasional dan hubungkan riwayat pekerjaan ke tiket atau jadwal. | **P2 (Could)** | Penugasan serta histori pekerjaan | 8–12 | 🔶 |
| **F-14** | Analitik tiket | Tampilkan waktu respons/penyelesaian serta kategori kerusakan yang sering muncul. | **P2 (Could)** | Melihat pola maintenance | 10–16 | 🔶 |
| **F-15** | Perbandingan tren periode | Bandingkan tren keuangan dan okupansi lintas periode untuk satu properti. | **P2 (Could)** | Pemahaman kinerja periode | 8–12 | 🔶 |
| **F-16** | Notifikasi WhatsApp/email otomatis | Kirim notifikasi operasional terpilih melalui integrasi WhatsApp/email; perlu provider, biaya, consent, dan fallback yang diputuskan di M05. | **P2 (Could)** | Mengingatkan pihak terkait | 18–30 | 🔶 |
| **F-17** | Field sensitif dan data demo sintetis | Dukung NIK, dokumen identitas, detail rekening, serta bukti transfer sintetis dengan akses terbatas. Tidak memakai data asli responden/penghuni. | **P2 (Could)** | Kelengkapan demo lanjutan; bukan kebutuhan yang divalidasi riset | 16–24 | 🔶 |

F-08–F-11 adalah backlog P1 untuk iterasi berikutnya; F-12–F-17 adalah backlog P2. Semuanya dikeluarkan dari MVP dan estimasi MVP.

**P3 / Won't untuk MVP**: marketplace pencarian kost, aplikasi native terpisah, banyak properti dalam satu workspace, payment gateway, integrasi bank, akuntansi/pajak formal, tanda tangan elektronik, IoT. Data nyata penghuni/responden tetap dilarang pada demo portfolio.

### 4.1 User Stories dan Acceptance Criteria (Kriteria Penerimaan)

#### F-01 Akses dan peran
- Sebagai Owner, saya ingin membuat/mengaktifkan akun Staff dan Penghuni tanpa pendaftaran publik agar akses terikat ke kost yang tepat.
- Given pengguna berperan Penghuni, when ia membuka data kamar, tagihan, atau tiket, then ia hanya dapat melihat data dirinya sendiri.
- Given Staff mencoba membuka laporan keuangan Owner-only atau data penghuni lain yang tidak dibutuhkan, when akses diperiksa, then sistem menolak permintaan.
- Owner memiliki akses penuh pada satu properti; semua role hanya dapat melihat media lampiran yang diizinkan untuk tiket terkait.

#### F-02 Manajemen kamar
- Sebagai Owner, saya ingin mencatat kamar dan statusnya agar penempatan penghuni bisa ditelusuri.
- Given kamar tercatat memiliki kontrak aktif, when status hunian ditampilkan, then kamar ditandai terisi dan tidak dapat menerima kontrak aktif kedua.
- Given kamar belum memiliki kontrak aktif, when daftar kamar dibuka, then kamar tampil tersedia atau berstatus perawatan sesuai pilihan status.

#### F-03 Penghuni dan kontrak
- Sebagai Owner atau Staff, saya ingin mencatat penghuni dan periode kontrak agar tagihan terhubung dengan masa sewa.
- Given kontrak aktif pada kamar, when kontrak kedua dibuat dengan periode tumpang tindih, then sistem menolak penyimpanan.
- Given master kamar dibuat, when tarif sewa disimpan, then default deposit rekomendasi sebesar 50% tarif terisi otomatis dan dapat diedit Owner; saat kontrak dibuat, Owner/Staff dapat memakai nilai default, menggantinya, atau memilih bebas deposit/nol.
- Given deposit kontrak ditetapkan, when penghuni membuka portal, then nilai dan saldo deposit tersedia ditampilkan terpisah dari pendapatan sewa.
- Given kontrak berakhir, when riwayat penghuni dibuka, then kontrak lama dan catatan terkait tetap tersedia.
- Given penghuni mengajukan check-out, when permintaan dikirim, then Owner menerima permintaan untuk inspeksi dan rekonsiliasi; hanya Owner yang mengesahkan refund/potongan deposit.
- Given penghuni mengajukan check-out, when permintaan dikirim, then Owner menerima permintaan untuk inspeksi dan rekonsiliasi; hanya Owner yang mengesahkan refund/potongan deposit.

#### F-04 Tagihan berulang dan tagihan perdana
- Sebagai Owner/Staff berizin, saya ingin membuat tagihan bulanan dari kontrak aktif agar tagihan yang terlewat atau ganda dapat diketahui.
- Given pendaftaran penghuni baru (check-in), when invoice pertama diterbitkan, then invoice memuat komponen sewa pertama dan deposit escrow secara terpisah.
- Given kontrak dibuat, when invoice perdana diterbitkan saat check-in, then tanggal jatuh tempo invoice pertama tidak mendahului tanggal penerbitan/check-in.
- Given penghuni masuk di tengah bulan, when Owner memilih mode `Prorata s/d Akhir Bulan`, then sewa dihitung dari hari masuk sampai akhir bulan secara inklusif dan invoice rutin berikutnya jatuh tempo tanggal 1.
- Given Owner memilih mode `Siklus 1 Bulan Kalender Penuh`, when penghuni check-in, then sewa bulan pertama ditagih penuh dan invoice berikutnya mengikuti tanggal masuk bulanan (hari yang tidak ada di bulan berikutnya dijatuhkan ke hari terakhir bulan itu).
- Given kontrak aktif pada periode tagihan, when tagihan periode dibuat dua kali, then hanya satu tagihan per kontrak-periode tersimpan.
- Given tagihan dibuat, when status penyampaian ditandai, then status diperbarui manual tanpa mengirim pesan otomatis.

#### F-05 Pembayaran, saldo parsial, dan histori
- Sebagai pengelola, saya ingin mencatat pembayaran terhadap tagihan dan melihat sisa kewajiban.
- Given tagihan Rp1.500.000 dan pembayaran terverifikasi Rp1.000.000, when saldo dihitung, then sisa Rp500.000.
- Given pembayaran masih pending, when saldo dihitung, then saldo terutang belum berkurang.
- Given saldo deposit cukup dan Owner memilih `Potong Deposit`, when settlement disimpan, then saldo invoice sewa dan saldo escrow berkurang dengan jumlah yang sama tanpa menambah kas masuk.
- Given kontrak di-check-out, when Owner memilih refund penuh atau potongan kerusakan/tunggakan dan memberi alasan, then sistem menghitung refund bersih, mencatat rekonsiliasi, dan memasukkan refund ke antrean pencairan manual; aplikasi tidak mentransfer uang.
- Given transaksi terverifikasi perlu dikoreksi, when Owner membuat reversal dengan alasan, then nilai asal tetap di histori dan saldo dihitung ulang tepat satu kali.

#### F-06 Pengeluaran dan laporan pemasukan/okupansi
- Sebagai Owner, saya ingin melihat ringkasan keuangan; Owner/Staff berizin dapat mencatat pengeluaran operasional agar biaya aktual masuk ke rekap.
- Given catatan transaksi memiliki tanggal, kategori, dan nominal, when laporan periode dibuka, then total pemasukan dan pengeluaran hanya menjumlah catatan dalam rentang tanggal itu.
- Given jumlah kamar dan kontrak aktif diketahui, when okupansi dihitung, then angka terisi/tersedia dapat ditelusuri ke status kamar dan kontrak aktif.
- Laporan tidak menyebut laba akuntansi/pajak dan tidak menganggap transaksi yang tidak dicatat sebagai biaya nol.

#### F-07 Ticketing kerusakan oleh penghuni
- Sebagai Penghuni, saya ingin membuat tiket yang terhubung ke kamar/kontrak saya dan melampirkan bukti agar masalah dapat diperiksa.
- Given tiket baru dikirim, when validasi dilakukan, then uraian dan minimal satu foto atau video wajib tersedia; tiket terhubung ke kamar dan pemiliknya.
- Sebagai Penghuni, saya ingin melihat status dan menambahkan komentar; komentar boleh memiliki lampiran.
- Given Staff/Owner memperbarui status, prioritas, penanggung jawab, atau komentar, when perubahan disimpan, then waktu dan pelakunya tercatat dalam riwayat tiket.
- Given catatan internal dibuat oleh Staff/Owner, when Penghuni membuka tiket, then catatan internal tidak terlihat olehnya.
- Given tiket ditutup, when daftar tiket terbuka dibuka, then tiket tertutup tidak muncul sebagai pekerjaan aktif namun riwayat tetap tersedia.

#### Kriteria backlog F-08–F-17 untuk versi berikutnya
- **F-08 Notifikasi aplikasi:** tiket baru/ditugaskan, perubahan status, dan komentar menghasilkan notifikasi bagi role yang berhak; pengguna dapat menandai sudah dibaca; pengguna kost lain tidak dapat melihat notifikasi tersebut.
- **F-09 Filter dan pengingat:** filter dapat menggabungkan status, prioritas, kamar, dan umur tiket; tiket melewati ambang umur yang ditetapkan tampil sebagai perlu ditindaklanjuti.
- **F-10 CSV:** ekspor mengikuti rentang/per filter yang dipilih dan otorisasi role; nilai kosong/teks tidak merusak struktur CSV; data sensitif yang tidak berhak dilihat tidak ikut diekspor.
- **F-11 Struk dan biaya perbaikan:** pengeluaran dapat menyimpan lampiran bukti privat dan ditautkan ke tiket; total laporan tidak menggandakan biaya ketika tautan dibuka atau diubah.
- **F-12 Preventive maintenance:** jadwal servis memiliki aset/kamar, jadwal berikutnya, dan status; pekerjaan jatuh tempo muncul dalam daftar dan pembuatan berikutnya tidak menduplikasi jadwal yang sama.
- **F-13 Direktori vendor:** kontak/vendor dapat dibuat dan dinonaktifkan; riwayat kerja terkait tiket/jadwal tetap dapat ditelusuri; fixture demo hanya berisi data sintetis.
- **F-14 Analitik tiket:** waktu respons dan penyelesaian dihitung dari timestamp peristiwa yang didefinisikan; filter periode/kategori diterapkan konsisten; tiket belum selesai tidak dihitung sebagai selesai.
- **F-15 Perbandingan tren:** dua periode sebanding dapat dipilih; sistem menampilkan rentang dan jumlah catatan sumber serta tidak menganggap data yang tidak tercatat sebagai nol.
- **F-16 WhatsApp/email:** notifikasi memakai provider yang dipilih dan menyimpan status kirim/gagal; demo hanya mengirim ke sandbox atau tujuan uji sintetis dengan consent, tidak ke penghuni nyata; kegagalan tidak membatalkan perubahan tiket.
- **F-17 Data sensitif sintetis:** fixture memakai identitas, telepon, kontrak, NIK, dokumen identitas, rekening, dan bukti transfer fiktif/tidak valid di dunia nyata; data/dokumen hanya terlihat sesuai role dan kepemilikan; ekspor serta log tidak membocorkan nilainya tanpa hak.

### 4.2 NFR Baseline (Usulan Portfolio)

- Pengguna simultan: hingga 5 akun demo.
- Performa API untuk skenario seeded demo: p95 ≤800 ms pada staging; diukur setelah stack dipilih.
- Halaman operasional utama siap dipakai dalam ≤3 detik pada koneksi 4G untuk data demo.
- Platform: web responsif, Chrome/Edge/Firefox/Safari modern; tidak ada aplikasi native.
- Data demo: maksimal 100 kamar dan 100 penghuni historis sebagai batas fixture portfolio, bukan kapasitas komersial. Nama/kontak, kontrak, tagihan, pembayaran, tiket, dan media demo harus sintetis; jangan gunakan catatan responden/penghuni nyata. NIK, dokumen identitas, detail rekening, dan bukti transfer belum masuk MVP.
- Media P0: foto maksimal 4 MB/file; video maksimal 12 MB dan 30 detik. Maksimal 4 foto + 1 video per kiriman, dengan total seluruh lampiran tiket termasuk komentar maksimal 40 MB. Foto/video minimal satu wajib saat tiket dibuat; lampiran komentar opsional.
- Storage produksi/demo ter-host: private object storage, bukan file lokal pada disk server. File hanya dibuka setelah pemeriksaan akses role dan kepemilikan tiket; gunakan URL bertanda tangan berdurasi singkat. CDN tidak diperlukan untuk MVP; bila ditambahkan, origin tetap privat dan akses CDN ditandatangani.
- Retensi media tiket yang disetujui: hapus file lampiran 365 hari setelah tiket ditutup; tiket terbuka tidak dipangkas. Jika tiket dibuka kembali, masa hitung dimulai lagi setelah penutupan berikutnya. Data teks/riwayat tiket dan dokumen demo sintetis mengikuti kebijakan retensi tersendiri yang ditentukan di M05.
- Local storage hanya untuk pengembangan lokal. Gunakan aturan lifecycle provider untuk objek sementara/orphan; proses aplikasi menjadwalkan penghapusan berdasarkan tanggal penutupan tiket.
- Gunakan data sintetis selama pengembangan; jangan unggah media penghuni nyata ke demo portfolio.

## 5. Batas Scope dan Privasi

### 5.1 In-scope
1. Aplikasi web responsif untuk satu properti demo.
2. Tujuh fitur P0 pada tabel 4.
3. Data seed sintetis dan dokumentasi alur Owner/Staff/Penghuni.
4. Rekap pembayaran bulanan, riwayat transaksi, dan tiket maintenance dengan komentar serta lampiran privat.

### 5.2 Out-of-scope
1. Banyak properti/cabang dalam satu workspace.
2. Pemrosesan pembayaran, verifikasi mutasi otomatis, atau penyimpanan kredensial bank.
3. Pengiriman otomatis WhatsApp/email/SMS (backlog versi berikutnya); pada MVP pengguna mengirim komunikasi di luar sistem.
4. Marketplace, booking, dan daftar tunggu. Portal Penghuni web responsif untuk ticketing termasuk P0; aplikasi native terpisah tidak masuk MVP.
5. Akuntansi/pajak formal, tanda tangan elektronik, dan IoT. Fitur pengeluaran sederhana serta maintenance dasar masuk P0.
6. Migrasi atau entry data dari spreadsheet nyata.
7. Nasihat hukum/pajak dan kebijakan yang dipublikasikan tanpa review profesional.

### 5.3 Privasi dan perlindungan
- Gunakan data demo sintetis; jangan gunakan nama, nomor telepon, kontrak, rekening, atau catatan pembayaran responden/penghuni nyata.
- MVP hanya memerlukan nama tampilan, kontak fiktif, periode sewa, tagihan, transaksi, tiket, komentar, dan bukti media yang relevan.
- Field NIK, dokumen identitas, detail rekening, dan bukti transfer berada di backlog versi berikutnya, tidak di MVP. Jika kelak dipilih, gunakan nilai/file sintetis, akses privat, dan kebijakan retensi yang disepakati sebelum implementasi.
- Finalisasi retensi/penghapusan, format file, provider, biaya, dan akses database pada M05. Jangan hubungkan provider pesan/media ke akun pribadi atau mengirim data demo yang menyerupai data asli.
- Draft kebijakan privasi/S&K belum dipublikasikan.
- LEGAL-REVIEW: PENDING — DRAFT TEKNIS, WAJIB DITINJAU OLEH LEGAL COUNSEL SEBELUM DIPUBLIKASIKAN

## 6. Batas Data dan Aturan Finansial untuk Spesifikasi Berikutnya
- Nilai uang menggunakan tipe desimal presisi, bukan floating point.
- Pembayaran merupakan catatan internal, bukan pemindahan uang.
- Hanya transaksi yang Owner verifikasi mengurangi saldo terutang.
- Koreksi melalui reversal yang mencatat alasan; tidak ada hapus permanen atas transaksi terverifikasi.
- Satu invoice rutin per kontrak-periode sesuai mode billing lease. Arahan pemilik terbaru menjadikan wireframe/runbook M04 sebagai acuan: mendukung prorata sampai akhir bulan dan siklus satu bulan penuh berbasis tanggal masuk. Keputusan sebelumnya untuk tanpa prorata/due day per kontrak digantikan.
- **Deposit termasuk dalam slice MVP F-02/F-03/F-04/F-05/F-06** sesuai WF-03/WF-04/WF-05/WF-06/WF-10 dan E2E Alur 1 & 5: default kamar 50% tarif (editable), nilai kontrak/opsi nol, line invoice awal, tracking saldo escrow, settlement ke tagihan, dan rekonsiliasi check-out (refund/potongan beralasan). Ledger escrow terpisah dari pendapatan sewa dan settlement non-cash tidak menambah kas. Refund tetap pencatatan/pencairan manual; aplikasi tidak mentransfer uang. Nomor rekening refund, KTP/NIK, diskon tahunan, multi-penghuni, dan fitur tambahan lain tetap di luar tujuh P0 atau perlu perubahan scope.
- Single-property demo; isolasi data lintas akun/workspace ditentukan di M05. Tidak ada asumsi provider/stack sebelum stack lock.

## 7. Dependensi dan Asumsi

| ID | Item | Pemilik | Status |
|---|---|---|---|
| DEP-01 | Scope tujuh kelompok P0 Medium dan batas satu properti disetujui pemilik. | Pemilik proyek | Selesai 2026-10-22; menggantikan baseline Large sebelumnya |
| DEP-02 | Billing mode, komponen invoice, pending vs verified, escrow, settlement, dan check-out diselaraskan dengan M04. | Pemilik proyek | Tagihan dan deposit ditetapkan mengikuti M04 pada 2026-10-30; detail teknis dimodelkan di M05 |
| DEP-03 | Stack/arsitektur dan provider private object storage dipilih di M05; integrasi pesan eksternal bukan MVP. | Pemilik proyek | Terbuka |
| ASM-01 | Role Staff operasional tersedia; akun demo dapat diaktifkan oleh Owner. | Pemilik proyek | Hak akses mengikuti M04; kebutuhan akun Staff wajib di seed masih terbuka |
| ASM-02 | Batas satu properti cukup untuk demo; laporan multi-lokasi ditunda. | Pemilik proyek | Disetujui dan dibekukan 2026-10-22 |

## 8. Jadwal dan Perkiraan Usaha
- Kapasitas: 12 jam/minggu × 18 minggu = **216 jam**.
- Estimasi implementasi tujuh P0 Medium setelah penambahan alur escrow/billing M04: **119–158 jam** (naik 7–8 jam); P1/P2 tetap tidak dihitung.
- Buffer 20%: **24–32 jam**; QA/integrasi/bug-fix: **26–34 jam**; dokumentasi/demo/portfolio polish: **17–21 jam**.
- Total estimasi MVP yang diperbarui: **186–245 jam**. Breakdown 22 Story di `docs/pm/KANBAN.md` sesuai estimasi fitur; pada kapasitas 12 jam/minggu rentangnya sekitar 15,5–20,4 minggu. Atas arahan pemilik pada 2026-10-30, jadwal menjadi 21 minggu/252 jam, cukup untuk estimasi maksimum dengan sisa 7 jam. Scope tujuh P0 tetap; P1/P2 tidak ditambahkan.
- Provider storage belum dipilih. CDN, transcoding, lampiran struk, integrasi WhatsApp/email, serta NIK/dokumen KTP/detail rekening/bukti transfer tidak masuk MVP. MVP menolak file media yang melewati batas.
- QA dimulai setelah freeze; perubahan fitur sesudah itu perlu persetujuan perubahan scope.

## 9. Keputusan Scope

Scope Medium MVP disetujui dan FROZEN pada 2026-10-22: satu properti, tujuh P0. Pada 2026-10-30, pemilik mengarahkan agar perilaku tujuh P0 di M05 mengikuti wireframe/runbook M04; deposit escrow dan dua mode billing check-in dimasukkan di slice F-03/F-04/F-05. Breakdown tetap 22 Story, dengan penyesuaian estimasi pada RK-025/RK-027/RK-032. Estimasi MVP terbaru 186–245 jam; atas arahan pemilik, jadwal diperbarui menjadi 21 minggu/252 jam untuk menampung batas atas. Fitur M04 di luar tujuh P0 tetap backlog/out-of-scope.

Scope-P0-Count: 7
Scope-Lock-Decision: LOCKED

Persetujuan pemilik proyek: MVP Medium tujuh P0 dikonfirmasi pada chat 2026-10-22 setelah scope Large dinyatakan melebihi kebutuhan. Kapasitas intake tetap 216 jam; estimasi atas MVP sekitar 16 jam di atasnya dan perlu dikendalikan lewat task breakdown.

## Rujukan Teknis Storage (ditinjau 22 Oktober 2026)

- [Cloudflare R2 object lifecycle](https://developers.cloudflare.com/r2/buckets/object-lifecycles/) menjelaskan aturan retensi/penghapusan berdasarkan umur objek dan bahwa penghapusan biasanya berlangsung dalam 24 jam dari waktu kedaluwarsa.
- [Cloudflare cache untuk R2](https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/) menyatakan bucket R2 privat secara default; menghubungkan custom domain untuk cache membuat URL bucket dapat diakses publik.
- [AWS S3 lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html) menghitung umur berdasarkan waktu pembuatan/modifikasi objek, bukan tanggal tiket ditutup.
- [AWS CloudFront private content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html) mendukung pengiriman konten privat dengan signed URL/cookie.

Rujukan provider ini menjelaskan pola dan kemampuan; proyek belum memilih provider. Karena retensi produk dihitung dari `closed_at`, penghapusan lampiran aktif dijadwalkan aplikasi. Lifecycle provider hanya menjadi pembersih objek sementara/orphan, bukan aturan satu tahun untuk seluruh media.

