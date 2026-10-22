# Brief Ide & Kelayakan — Sistem Manajemen Kost Mandiri

> Status: M01 CONDITIONAL_GO (validator pasca-pembaruan lulus 2026-10-22); M02 gate lulus 2026-10-22. Pemilik menetapkan MVP Medium, satu properti, tujuh P0; fitur tambahan masuk backlog versi berikutnya. Usulan jadwal implementasi 20 minggu/240 jam belum disetujui.

## 1. Metadata Proyek

- Nama proyek: Sistem Manajemen Kost Mandiri
- Penggagas: Solo developer (nama belum dicatat)
- Tanggal evaluasi: 2026-10-22
- Skala intake: Medium; MVP disetujui: Medium (7 kelompok P0, satu properti)
- Model delivery: Portfolio
- Monetisasi: Tidak ada; proyek demonstrasi portfolio
- Arketipe: PMS — Property Management System (manajemen kost/boarding house)
- Catalog benchmark: N/A — tidak diklasifikasikan dari katalog taxonomy

## 2. Ringkasan Ide

Untuk pemilik atau pengelola kost skala kecil yang perlu mencatat kamar, kontrak, tagihan, dan pembayaran, Sistem Manajemen Kost Mandiri adalah aplikasi operasional berbasis web yang menghubungkan status hunian dan catatan keuangan dalam satu alur. Nilai portfolio yang ditonjolkan adalah riwayat perubahan yang mudah ditelusuri, saldo tagihan yang konsisten saat ada pembayaran sebagian, dan siklus kontrak yang jelas; keunikan pasar belum terbukti.

## 3. Triage dan Validasi Pasar

### 3.0 Premis dan Asumsi

| ID | Premis | Risiko | Bukti yang diperlukan | Tes murah | Ambang gugur | Status |
|---|---|---|---|---|---|---|
| PREM-01 | Pengelola kost kehilangan waktu atau membuat kesalahan saat mengelola tagihan/pembayaran dengan catatan terpisah. | Tinggi | Contoh alur dan dampak dari pengelola nyata. | Wawancara tentang kejadian terakhir. | Tidak ada responden yang mengalami masalah terkait. | Didukung pada sampel 6/10; pasar luas belum diuji |
| PREM-02 | Demo ledger pembayaran dan histori yang dapat ditelusuri lebih kuat untuk portfolio daripada CRUD umum. | Sedang | Feedback reviewer dan target pengguna atas skenario demo. | Uji skenario prototype terhadap calon reviewer/pengelola. | Reviewer tidak dapat membedakan nilai alur bisnis dari CRUD standar. | Belum diuji |
| PREM-03 | MVP Medium dapat selesai dalam kapasitas yang disetujui. | Sedang | Estimasi Story rinci termasuk buffer, QA, dan portfolio polish. | Tinjau estimasi 22 Story terhadap kapasitas sebelum menyetujui jadwal. | Estimasi rinci melewati kapasitas tersedia. | Breakdown 22 Story selesai; 174–232 jam. Usulan 20 minggu/240 jam menampung batas atas dengan sisa 8 jam; persetujuan jadwal masih menunggu pemilik. |
| PREM-04 | Portfolio dapat memperagakan alur inti tanpa data pribadi nyata. | Sedang | Minimisasi, kontrol akses media, sanitasi, dan retensi. | Threat/data-flow review pada M05. | Demo memasukkan data nyata atau dokumen bisa diakses tanpa hak. | Data demo sintetis; NIK/KTP, detail rekening, dan bukti transfer dikeluarkan dari MVP |

### 3.1 Masalah dan Metode Riset

- Masalah yang didukung pada sampel: catatan terpisah menyulitkan penelusuran tagihan/pembayaran (6/10), tindak lanjut maintenance (6/10), dan ringkasan keuangan (2 eksplisit); 3/10 mengelola lebih dari satu properti.
- HMW: Bagaimana membantu pengelola kost melihat siapa yang tinggal di tiap kamar dan status kewajiban sewanya, dengan riwayat perubahan yang jelas dan administrasi sederhana?
- Cara saat ini: responden menyebut Excel, buku kas/catatan, WhatsApp, notes ponsel, mutasi rekening, dan kalkulator.
- Kerugian terukur: belum diketahui; tidak ada angka waktu atau finansial yang diklaim.
- Metode sekunder: 7 halaman produk publik ditinjau 2026-10-22; tidak ada uji produk langsung. Riset primer: 10 wawancara nyata, 401 menit total/rata-rata 40,1 menit. INT-10 bertanggal rentang 20–21 Oktober, hari tunggal belum diketahui. Dua lampiran identik dihitung satu kali.
- Bias: halaman pemasaran menonjolkan fitur dan manfaat vendor, bukan bukti penggunaan independen.
- Temuan ringkas: selain masalah INT-01–03, INT-04–05 dan INT-08 menceritakan maintenance terlambat/hilang; INT-06 dan INT-10 menginginkan visibilitas keuangan; INT-02, INT-04, dan INT-09 mengelola banyak properti.
- Batas: tidak ada survei, pengujian solusi, atau bukti WTP. Pembelian template Excel Rp50.000 oleh INT-02 tidak dianggap WTP aplikasi. Sampel kualitatif kecil dan nonacak; M00 gate penuh WAIVED pada jalur portfolio.

### 3.2 Lanskap Kompetitif

| Produk / alternatif | Tipe | Fitur yang tercantum publik | Harga | Offline | Catatan |
|---|---|---|---|---|---|
| [Nestera](https://nestera.id/) | Langsung | Kamar, penghuni, kontrak, tagihan, impor mutasi bank, laporan, hak akses tim, maintenance, aplikasi staf/penghuni. | Ada paket gratis dan Pro; harga perlu dicek langsung. | Tidak dijelaskan. | Cakupan luas; audit ledger belum diuji. |
| [AppKos](https://appkos.id/fitur.php) | Langsung | Kamar/penghuni, tagihan, pembayaran sebagian/cicilan, pengeluaran, laporan, reminder. | Perlu verifikasi langsung. | Tidak dijelaskan. | Sudah mencakup banyak fitur dasar yang direncanakan. |
| [KosBos](https://www.kosbos.com/) | Langsung | Dashboard, kamar/penghuni, tagihan otomatis, reminder WhatsApp, booking, pembayaran online. | Halaman menyebut paket gratis dan berbayar; detail perlu diverifikasi. | Tidak dijelaskan. | Otomasi promosi dan pembayaran di luar scope awal. |
| [KosDong](https://www.kosdong.my.id/) | Langsung | Reminder WhatsApp, dashboard pembayaran, kuitansi; transfer manual ditandai lunas oleh pemilik. | Halaman menyebut Rp30.000/bulan; belum diverifikasi lewat pembelian. | Tidak dijelaskan. | Berfokus pada pemilik kost kecil; versi awal satu properti menurut FAQ. |
| [AturKos](https://aturkos.id/) | Langsung | Data penghuni, status kamar, pencatatan pembayaran, reminder, laporan/ekspor. | Halaman menyebut paket gratis dan mulai Rp49.000/bulan; perlu verifikasi. | Tidak dijelaskan. | Fitur inti portfolio bukan pembeda unik. |
| Spreadsheet / Excel / Google Sheets | Pengganti manual | Data fleksibel dan laporan melalui formula sendiri. | Gratis atau sudah tersedia bagi pengguna. | Bisa digunakan lokal; kolaborasi tergantung layanan. | Formula dan perubahan dapat sulit diaudit; perlu diuji. |
| Buku catatan + WhatsApp | Pengganti manual | Catatan transaksi dan komunikasi informal. | Biaya perangkat/layanan umum. | Buku bisa offline; chat perlu koneksi. | Riwayat tersebar; belum diuji pada alur pengguna nyata. |

Kualitas benchmark: sumber publik saja. Belum ada uji produk, waktu onboarding, matriks fitur hands-on, atau verifikasi harga. Fitur yang ditawarkan setidaknya dua produk tidak diklaim unik.

Diferensiasi yang diusulkan untuk portfolio: tunjukkan ketepatan model bisnis melalui riwayat pembayaran, saldo sisa yang benar untuk pembayaran parsial, dan transisi kontrak tanpa menghapus histori. Status: hipotesis, belum diverifikasi unik. Nestera dan AppKos menawarkan sebagian alur finansial tersebut; klaim dibatasi pada kualitas implementasi dan demonstrasi.

### 3.3 Alur Pengguna Utama

1. Pemicu: pemilik menetapkan kamar dan kontrak penghuni baru.
2. Mutasi: sistem mengaktifkan kontrak, menghasilkan kewajiban sewa berkala, dan mencatat pembayaran serta saldo tersisa.
3. Nilai: pemilik melihat status hunian, tagihan, tunggakan, dan riwayat yang dapat ditelusuri.

### 3.4 MVP Razor

| Masuk versi pertama (scope FROZEN 2026-10-22) | Di luar MVP |
|---|---|
| Tujuh P0: akses Owner/Staff/Penghuni; kamar; penghuni/kontrak; tagihan; pembayaran/riwayat; pengeluaran dan laporan pemasukan/okupansi; ticketing kerusakan penghuni dengan lampiran wajib dan komentar berlampiran. Portal penghuni web responsif. | Marketplace, aplikasi native terpisah, banyak properti, payment gateway/bank, notifikasi otomatis, NIK/KTP, detail rekening, bukti transfer, fitur backlog P1/P2, akuntansi/pajak formal, tanda tangan elektronik, IoT. Data demo sintetis saja. |

P1 versi berikutnya: notifikasi aplikasi, filter/pengingat tiket, ekspor CSV, lampiran struk dan tautan biaya perbaikan. P2: preventive maintenance, direktori vendor, analitik tiket, tren lintas periode, WhatsApp/email otomatis, dan field sensitif tambahan.

### 3.5 Akar Masalah dan Kecocokan

- Akar masalah sampel: catatan pembayaran/tagihan tersebar (INT-01–05, INT-09), keluhan/perbaikan terlambat atau tak tercatat (INT-01–05, INT-08), dan ringkasan keuangan sulit disusun (INT-06, INT-10; permintaan ringkasan properti pada INT-02/04).
- Scope yang dibekukan adalah Medium satu properti dengan tujuh P0; fitur tambahan masuk backlog versi berikutnya.
- Segmen terpilih adalah pemilik/pengelola satu properti; tiga responden multi-properti menjadi temuan kebutuhan di luar MVP.
- Portal Penghuni web responsif untuk ticketing termasuk MVP; aplikasi native terpisah, pembayaran otomatis, dan banyak properti tetap di luar MVP.

## 4. Kelayakan Developer Solo

| Dimensi | Skor sementara | Keyakinan | Analisis dan mitigasi |
|---|---:|---|---|
| Teknis | 4.0/5 | 🔶 Asumsi | Aplikasi web konvensional; pembayaran parsial, otorisasi, histori, notifikasi eksternal, dan field/dokumen sensitif perlu desain eksplisit. |
| Operasional | 3.0/5 | 🔶 Asumsi | Breakdown 22 Story mengestimasi 174–232 jam total; batas atas 16 jam melebihi intake 216 jam. Usulan jadwal 20 minggu/240 jam menunggu persetujuan. Integrasi eksternal dipindah ke backlog. |
| Regulasi | 4.0/5 | 🔶 Asumsi | Demo dengan data sintetis dan minimisasi PII; baseline UU PDP tetap diperhatikan bila dipakai pengguna nyata. Tidak ada assurance formal. Ini bukan kajian hukum. |
| Finansial/komersial | 3.0/5 | 🔶 Asumsi | Tidak ada monetisasi; nilai portfolio dilihat dari aturan bisnis, dokumentasi keputusan, keamanan, dan demo. Metrik ini perlu disepakati dalam scope. |

Rata-rata sementara: 3.5/5; penilaian berbasis asumsi dan tidak menggantikan keputusan kelayakan pemilik.

Feasibility-Score-Technical: 4.0
Feasibility-Score-Operational: 3.0
Feasibility-Score-Regulatory: 4.0
Feasibility-Score-Financial: 3.0
Feasibility-Decision: CONDITIONAL_GO
Mitigation: Sepuluh wawancara nyata dicatat; temuan mendukung hambatan tagihan/pembayaran, maintenance, dan sebagian kebutuhan laporan keuangan. Pemilik menetapkan MVP Medium satu properti dengan tujuh P0; fitur tambahan masuk backlog. Breakdown 22 Story kini tersedia di KANBAN.md dan merekonsiliasi estimasi implementasi tujuh P0 menjadi 112–150 jam.

Keputusan CONDITIONAL_GO ditetapkan pemilik pada 2026-10-22. Setelah bukti wawancara diperbarui, validator M01 dijalankan ulang pada 2026-10-22 dan lulus; keputusan tetap CONDITIONAL_GO. Riset tidak membuktikan ukuran pasar atau willingness-to-pay.

### 4.1 Pemeriksaan Kapasitas Setelah Perubahan Scope

Estimasi Story pada Kanban telah dipecah dan jumlahnya konsisten dengan estimasi fitur:

| Area | Perkiraan jam |
|---|---:|
| Login, sesi, dan hak akses tiga role | 16–22 |
| Kamar dan status hunian | 10–14 |
| Penghuni dan kontrak | 14–18 |
| Tagihan berulang | 14–18 |
| Pembayaran parsial, saldo, dan histori | 18–24 |
| Pengeluaran dan laporan | 14–18 |
| Ticketing, upload media, komentar dan auto-prune | 26–36 |
| Implementasi tujuh P0 Medium | 112–150 |
| Buffer 20% | 22–30 |
| QA/integrasi/bug-fix | 24–32 |
| Dokumentasi/demo/portfolio polish | 16–20 |
| Total estimasi | 174–232 |

Kapasitas intake 216 jam (12 jam/minggu × 18 minggu). Breakdown 22 Story mengonfirmasi total 174–232 jam termasuk buffer 20%, QA/integrasi, dan dokumentasi/demo: estimasi tengah 203 jam (sekitar 16,9 minggu), batas atas 232 jam (sekitar 19,3 minggu), atau 16 jam di atas intake. Usulan jadwal adalah 20 minggu/240 jam pada kapasitas yang sama, menyisakan 8 jam di atas batas estimasi; ini belum disetujui pemilik. P1/P2 dan biaya provider eksternal tidak masuk estimasi MVP.

Kapasitas intake sudah ditetapkan pemilik, tetapi jadwal implementasi final belum disetujui:

Pemilik menetapkan intake 18 minggu × 12 jam = 216 jam dan menyetujui MVP Medium tujuh P0 pada 2026-10-22. Estimasi atas 232 jam melampaui intake 16 jam. Usulan 20 minggu × 12 jam = 240 jam dibuka untuk keputusan pemilik; ini tidak mengubah scope tujuh P0 atau menarik fitur backlog.

### 4.2 Build vs Adopt

| Area | Keputusan awal | Alasan |
|---|---|---|
| Auth/session | Adopt library/provider terkelola setelah stack lock | Komoditas; hindari menulis autentikasi sendiri. Provider dipilih di M05. |
| WhatsApp/email | Dipindahkan ke P2 versi berikutnya | Provider, biaya, consent, templat, dan fallback ditinjau untuk iterasi tersebut; payment gateway/bank tetap di luar MVP. |
| Aturan tagihan dan ledger | Build | Inti demonstrasi aturan bisnis; histori dan saldo harus konsisten. |
| Penyimpanan lampiran dan dokumen demo | Private object storage untuk deployment; local hanya untuk dev; tanpa CDN di MVP | Akses privat berbasis role/tiket melalui URL bertanda tangan singkat. Media tiket dijadwalkan terhapus 365 hari setelah tiket ditutup; dokumen identitas/bukti pembayaran demo sintetis perlu retensi dan sanitasi khusus; provider belum dipilih. |

### 4.3 BOTEC Awal

- Asumsi demo: 1 properti × 20 kamar; akun Owner, Staff, dan Penghuni; maksimal 20 penghuni aktif.
- Beban contoh: 2 pengguna × 30 aksi/hari = 60 aksi/hari; rata-rata 60 / 86.400 = 0,0007 aksi/detik. Dengan faktor puncak 5× ≈ 0,0035 aksi/detik.
- Penyimpanan contoh data terstruktur: 20 penghuni × 12 invoice/tahun × 3 tahun = 720 invoice. Dengan 2 KB/rekaman ≈ 1,44 MB, belum termasuk indeks/log/backup.
- Penyimpanan media ticketing (skenario, bukan data riset): 20 kamar × 0,5 tiket/kamar/bulan = 10 tiket/bulan. Asumsi rata-rata 2 foto × 3 MB; 20% tiket juga punya 1 video × 10 MB; 30% mendapat satu foto tambahan di komentar. Perkiraan ≈8,9 MB/tiket, 89 MB/bulan atau sekitar 1,1 GB/tahun sebelum salinan/versi; cap 40 MB/tiket menghasilkan batas teoritis 4,8 GB/tahun. Tiket terbuka dapat memperpanjang masa simpan.
- Penyimpanan foto identitas dan bukti transfer sintetis belum termasuk sizing tersebut; fixture demo harus dikecilkan/sanitasi dan memakai nilai tidak valid di dunia nyata.
- Ini sizing demo portfolio, bukan target komersial; tidak membenarkan arsitektur multi-service.

### 4.4 Privasi

- Gunakan data demo sintetis untuk nama, nomor telepon, kontrak, tagihan/pembayaran, dan media tiket. Jangan masukkan data responden/penghuni nyata ke repository, storage demo, atau screenshot publik.
- NIK/foto KTP, detail rekening, dan bukti transfer tidak masuk MVP; jangan kumpulkan atau unggah data nyata tersebut.
- Media tiket dapat memuat detail pribadi/lokasi: gunakan bucket privat, URL bertanda tangan berumur pendek, dan hapus metadata EXIF lokasi jika layak secara teknis. Lampiran dipangkas 365 hari setelah tiket ditutup; tiket terbuka tidak dipangkas otomatis.
- Jika kelak dipakai dengan data nyata, siapkan kebijakan privasi, retensi/penghapusan, dan pemeriksaan pemroses pihak ketiga sebelum rilis. Legal review masih terbuka.
- Tidak menyimpan kredensial pembayaran; payment gateway tidak masuk scope.

## 5. Kriteria Pivot / Berhenti

- Revisi scope bila estimasi rinci melebihi kapasitas yang disetujui.
- Ubah alur inti bila wawancara menunjukkan masalah utama bukan rekonsiliasi kamar, kontrak, dan pembayaran.
- Untuk portfolio, evaluasi berdasarkan kelengkapan alur demo, konsistensi transaksi, dokumentasi keputusan teknis, dan kontrol akses; target numerik dikunci pada M02.

## 6. Klasifikasi Skala

- Skala intake: Medium (7 P0 awal; rentang Medium 6–15), satu properti.
- MVP yang disetujui: Medium, tujuh P0, satu properti; fitur tambahan masuk backlog P1/P2 versi berikutnya.
- Estimasi 174–232 jam; breakdown 22 Story selesai. Batas atas melebihi intake 216 jam sebanyak 16 jam. Usulan 20 minggu/240 jam menampung batas atas dengan sisa 8 jam dan menunggu persetujuan pemilik. Perubahan fitur setelah freeze memerlukan kontrol perubahan. Multi-properti tetap di luar MVP.

## 7. Pertanyaan Awal untuk M02 · Scope Definition & Freeze

1. Bagaimana status tagihan dan saldo dihitung untuk pembayaran parsial serta koreksi transaksi?
2. Peran apa yang boleh melihat atau mengubah data penghuni dan catatan keuangan?
3. Apakah satu kamar dapat memiliki lebih dari satu penghuni, atau hanya satu kontrak aktif?

## Sumber

- [Nestera — aplikasi manajemen kost](https://nestera.id/) (halaman publik ditinjau 2026-10-22)
- [AppKos — fitur](https://appkos.id/fitur.php) (halaman publik ditinjau 2026-10-22)
- [KosBos](https://www.kosbos.com/) (halaman publik ditinjau 2026-10-22)
- [KosDong](https://www.kosdong.my.id/) (halaman publik ditinjau 2026-10-22)
- [AturKos](https://aturkos.id/) (halaman publik ditinjau 2026-10-22)

