# Product Requirements Document (PRD) — RumaKost

## 1. Document Metadata

- **Status**: Ditinjau dan disetujui sebagai acuan implementasi M06 melalui technical sign-off pemilik pada 2026-10-31; walkthrough E2E tetap belum dieksekusi
- **Produk**: Sistem Manajemen Kost Mandiri (RumaKost)
- **Delivery**: Demo portfolio non-komersial
- **Baseline scope**: Satu properti, tujuh kelompok fitur P0, 22 story
- **Sumber kebutuhan**: `docs/pm/SCOPE_STATEMENT.md`
- **Desain beku**: `docs/specs/DESIGN_SPEC.md`, `docs/design/SITEMAP.md`, dan `docs/design/SCENARIOS_E2E_WALKTHROUGH.md`
- **Tech Stack Lock**: `docs/architecture/M05-TECHNICAL-SPEC-DRAFT.md`
- **Rancangan data/API**: `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`

## 2. Tujuan Produk dan Batas Scope

Demo harus memungkinkan pengguna menyelesaikan enam alur utama tanpa mengubah database secara manual: mengelola kamar, membuat kontrak penghuni, menerbitkan tagihan, mencatat dan memverifikasi pembayaran, mencatat pengeluaran, serta menindaklanjuti tiket kerusakan. Sistem mendukung Owner, Staff, dan Tenant untuk satu properti. Produk ini bukan layanan komersial dan hanya memakai data sintetis.

Di luar scope MVP: banyak properti, pendaftaran Tenant publik, aplikasi native, payment gateway atau sinkronisasi bank, pengingat WhatsApp otomatis, akuntansi/pajak formal, NIK/dokumen identitas, detail rekening, dan transfer refund. Batas domain tambahan: satu Tenant per Lease; tanpa roommate, mutasi kamar, kredit/overpayment, refund surplus pembayaran, carry-over tunggakan ke invoice baru, biaya insidental, tata tertib dinamis, profil properti editable, permission Staff granular, atau akun Teknisi. Invoice hanya memuat RENT dan DEPOSIT. Pembayaran yang melebihi saldo invoice ditolak; refund manual hanya untuk rekonsiliasi deposit. Expense tidak ditautkan ke Ticket; tiket P0 dibuat Tenant pada lease aktif. Status due/overdue bersifat dasar tanpa ambang suspensi otomatis.

## 3. Functional Traceability Matrix (F-xx → REQ-xx → Screen / Endpoint)

| Fitur | Requirement | Layar / alur M04 | Prioritas |
|---|---|---|---|
| F-01 Akses dan peran | REQ-01.1 aktivasi akun; REQ-01.2 role dan kepemilikan; REQ-01.3 sesi | WF-01, WF-02, WF-09, WF-10 | P0 |
| F-02 Manajemen kamar | REQ-02.1 data kamar; REQ-02.2 okupansi dan status operasional | WF-03 | P0 |
| F-03 Penghuni dan kontrak | REQ-03.1 profil penghuni; REQ-03.2 kontrak/check-in; REQ-03.3 permintaan check-out dan rekonsiliasi Owner | WF-04, WF-10 | P0 |
| F-04 Tagihan berulang | REQ-04.1 invoice awal; REQ-04.2 mode tagihan; REQ-04.3 penerbitan idempotent | WF-05 | P0 |
| F-05 Pembayaran dan saldo | REQ-05.1 klaim pending dan verifikasi manual; REQ-05.2 saldo parsial; REQ-05.3 reversal dan ledger deposit | WF-06, WF-10 | P0 |
| F-06 Pengeluaran dan laporan | REQ-06.1 catatan pengeluaran; REQ-06.2 ringkasan Owner-only | WF-07 | P0 |
| F-07 Tiket kerusakan | REQ-07.1 tiket penghuni dengan media wajib; REQ-07.2 alur Staff/Owner; REQ-07.3 komentar/lampiran privat | WF-08, WF-11, WF-12 | P0 |

### 3.1 User Stories dan Acceptance Criteria

#### REQ-01 Akses dan peran

- Owner membuat/mengaktifkan akun Staff dan Tenant; pendaftaran publik dimatikan.
- Given permintaan belum terautentikasi, when mengakses operasi terlindungi, then sistem menolak operasi dan tidak mengirim data terlindungi.
- Given Staff atau Tenant mencoba aksi khusus Owner, when server memeriksa izin, then server menolak tanpa bergantung pada visibilitas UI.
- Given Tenant meminta kamar, kontrak, tagihan, pembayaran, tiket, atau media, when kepemilikan diperiksa, then hanya data Tenant itu sendiri yang dikembalikan.

#### REQ-02 Manajemen kamar

- Owner mengelola data dan status operasional kamar; Staff hanya melakukan pembaruan operasional yang diizinkan scope.
- Given kamar mempunyai kontrak aktif yang bertumpang tindih, when kontrak aktif kedua dibuat, then sistem menolak penyimpanan.
- Okupansi dihitung dari status dan tanggal kontrak; status fisik kamar disimpan terpisah.

#### REQ-03 Penghuni dan siklus kontrak

- Owner atau Staff berizin membuat profil penghuni dan kontrak berisi tanggal, tarif, deposit, serta mode billing.
- Deposit boleh nol; nilai default hanya saran dan bukan tagihan wajib. Deposit disimpan terpisah dari pendapatan sewa.
- Given Tenant mengirim permintaan check-out, when sistem menerimanya, then statusnya menunggu review Owner; hanya Owner yang menyelesaikan inspeksi, terminasi, dan rekonsiliasi deposit.
- Given hasil rekonsiliasi memerlukan refund, when Owner menyimpan keputusan, then sistem mencatat tugas pencairan manual dan tidak mentransfer uang atau menyimpan detail rekening tujuan.

#### REQ-04 Tagihan berulang

- Invoice pertama dibuat saat check-in dan tanggal jatuh temponya tidak boleh mendahului tanggal terbit/check-in.
- Kontrak memilih salah satu mode: `PRORATA_TO_MONTH_END` atau `FULL_MONTH_ANNIVERSARY`. Prorata menghitung tanggal masuk sampai akhir bulan secara inklusif. Mode anniversary menagih satu bulan penuh dan tanggal yang tidak tersedia diklem ke hari terakhir bulan.
- Invoice rutin mengikuti tanggal kalender untuk mode prorata dan tanggal mulai kontrak untuk mode anniversary. Satu kontrak/periode/mode hanya menghasilkan satu invoice.
- Status invoice dihitung dari alokasi pembayaran terverifikasi dan reversal. Penandaan penyampaian dilakukan manual tanpa mengirim pesan.

#### REQ-05 Pembayaran dan saldo

- Owner, Staff, atau Tenant pada tagihannya sendiri dapat mencatat klaim pembayaran sebagai pending; hanya Owner dapat memverifikasi atau menolak.
- Klaim pending tidak mengurangi saldo invoice. Pembayaran terverifikasi mengubah saldo tepat satu kali dan tercatat dalam audit.
- Pembayaran parsial menyisakan saldo yang benar; pembayaran di atas saldo terbuka ditolak tanpa kredit Tenant. Reversal mempertahankan transaksi asal dan memerlukan alasan Owner.
- Deposit escrow terpisah dari pendapatan sewa, bertambah hanya dari alokasi pembayaran terverifikasi ke line deposit, dan tidak boleh diselesaikan melebihi saldonya.
- Pembayaran parsial dialokasikan ke line sewa terlebih dahulu, lalu ke line deposit; hanya alokasi terverifikasi ke deposit menambah saldo escrow.

#### REQ-06 Pengeluaran dan laporan

- Owner dan Staff berizin dapat mencatat pengeluaran dengan tanggal, kategori, nominal, dan deskripsi.
- Hanya Owner dapat melihat agregat keuangan. Respons server untuk Staff tidak boleh memuat angka laporan Owner.
- Laporan menunjukkan transaksi tercatat dan okupansi turunan; laporan bukan laporan laba akuntansi atau pajak.

#### REQ-07 Tiket kerusakan

- Tenant membuat tiket yang terkait dengan kontrak/kamar aktif, uraian, dan minimal satu foto atau video.
- Owner/Staff mengelola status, prioritas, penanggung jawab internal, dan komentar internal. Tenant dengan lease aktif hanya membaca/berkomentar pada tiketnya sendiri; setelah kontrak berakhir seluruh mutasi ditolak.
- Komentar internal dan lampiran yang tidak terlihat Tenant tidak pernah dikirim pada respons Tenant.
- Batas unggah: foto maks. 4 MB per file, video maks. 12 MB dan 30 detik, maks. empat foto dan satu video per pengiriman, serta 40 MB per tiket. Validasi dilakukan di server.
- Media tiket disimpan privat dan dihapus 365 hari setelah penutupan terakhir; jika tiket dibuka kembali, hitungan retensi dimulai lagi setelah penutupan berikutnya.

### 3.2 Skenario Penerimaan Rilis (Given-When-Then)

1. Given satu kontrak aktif pada kamar, when kontrak lain yang bertumpang tindih dikirim, then sistem menolaknya dan mempertahankan kontrak awal.
2. Given proses penerbitan invoice dijalankan dua kali untuk kontrak/periode sama, when kedua proses selesai, then hanya satu invoice tersimpan.
3. Given klaim pembayaran masih pending, when saldo invoice dihitung, then klaim itu belum mengubah saldo.
4. Given Owner memverifikasi pembayaran pending yang valid, when operasi idempotent diulang, then saldo hanya berubah sekali dan audit mencatat verifier.
5. Given Staff meminta laporan Owner atau memverifikasi pembayaran, when server memeriksa izin, then permintaan ditolak tanpa membuka data.
6. Given Tenant meminta invoice/tiket Tenant lain, when server memeriksa kepemilikan, then akses ditolak tanpa mengungkap apakah resource tersebut ada.
7. Given Tenant mengunggah lampiran tidak valid atau melebihi batas, when server memvalidasi file, then upload ditolak dan objek yatim dijadwalkan untuk dibersihkan.
8. Given tiket ditutup lalu dibuka kembali, when tiket ditutup lagi, then retensi media dihitung dari tanggal penutupan terakhir.

## 4. Roadmap dan Batas Rilis

- **MVP**: F-01 sampai F-07 saja, diverifikasi melalui enam walkthrough E2E penerimaan yang diselaraskan pada FSD; walkthrough tersebut belum dieksekusi dan bukan bukti PASS.
- **Backlog berikutnya**: F-08 sampai F-17 seperti tercatat pada `SCOPE_STATEMENT.md`.
- **Tidak untuk MVP**: payment gateway, banyak properti, aplikasi native, pendaftaran publik, pesan otomatis, data identitas/rekening nyata, akuntansi atau pajak formal.

## 5. Integritas Data dan Idempotensi

Histori finansial dikoreksi melalui catatan reversal/rekonsiliasi, bukan penghapusan atau penimpaan transaksi. Verifikasi pembayaran, alokasi, efek ledger deposit, dan audit event disimpan atomik. Penerbitan invoice memakai kunci unik kontrak/periode/mode. Mutasi yang dapat diulang memakai idempotency key. Entitas dan constraint rinci terdapat pada `M05-DATA-API-SPEC-DRAFT.md` dan akan diselaraskan ke FSD berdasarkan keputusan Owner yang dicatat pada 2026-10-30.

## 6. Privasi dan Batas Keamanan

Gunakan identitas dan kontak sintetis. Jangan menyimpan NIK, dokumen identitas, detail rekening, atau bukti transfer. Otorisasi role dan kepemilikan wajib dijalankan di server. Laporan finansial hanya untuk Owner; komentar dan media tiket mengikuti visibilitas serta kepemilikan tiket. Rancangan kontrol keamanan dan rencana verifikasi ada di `FSD.md`.

## 7. Asumsi dan Batas Operasional

- Satu properti, tiga role, maksimal lima pengguna demo simultan, dan penggunaan portfolio non-komersial.
- Seed demo menyertakan satu akun Staff sintetis; kredensial baru dibuat saat M07.
- Akun Tenant pascakontrak dapat membaca histori miliknya saja; mutasi dan unggah baru dinonaktifkan.
- Media menerima foto JPEG/PNG/WebP dan video MP4/MOV; konten file tetap divalidasi di server.
- Demo menerima scale-to-zero; Vercel Cron berjalan sekali sehari dan pemulihan Neon Free bergantung pada PITR sampai 6 jam/1 GB histori.
- Target performa pada scope adalah target perencanaan untuk diukur saat QA, bukan SLA.

## 8. Catatan Persetujuan Manusia

- Persetujuan scope: tercatat pada `docs/pm/PROJECT_STATE.md` dan `SCOPE_STATEMENT.md`.
- Tech Stack Lock: `zeenn`, 2026-10-30, tercatat pada `M05-TECHNICAL-SPEC-DRAFT.md`.
- Review PRD/FSD dan technical sign-off M05 disetujui `zeenn` pada 2026-10-31; persetujuan mencakup spesifikasi dan stack, bukan implementasi atau hasil runtime.
