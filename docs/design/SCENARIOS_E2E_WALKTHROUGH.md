# Walkthrough Penerimaan E2E M04?M05 ? RumaKost

> Status: spesifikasi acceptance lintas role untuk enam alur utama Frozen Scope M02. Belum dieksekusi karena aplikasi belum diimplementasikan. Data dan akun di bawah adalah fixture sintetis; kredensial dibuat saat M07 dan tidak disalin dari prototipe.

## Aktor dan batas fixture

| Role | Kapabilitas dalam walkthrough |
|---|---|
| Owner | Mengelola kamar/kontrak, memverifikasi pembayaran, merekonsiliasi deposit, melihat laporan, mengelola tiket. |
| Staff | Operasional kamar/kontrak sesuai izin, mencatat pembayaran pending dan pengeluaran, mengelola tiket; tidak memverifikasi pembayaran atau melihat laporan Owner. |
| Tenant | Melihat dan mengubah data miliknya selama kontrak aktif, mengajukan pembayaran/check-out/tiket; setelah kontrak berakhir hanya membaca histori miliknya. |

Akun demo memakai data sintetis dan satu fixture untuk masing-masing role. Tidak ada bukti transfer, rekening bank, aktor Teknisi, multi-kamar, atau kredensial tetap dalam fixture P0.

## ALUR 01 ? Kamar, kontrak, invoice perdana

1. Owner membuat kamar kosong dengan tarif sewa dan default deposit. Owner/Staff berizin membuat satu kontrak untuk satu Tenant; deposit pada kontrak dapat diubah atau nol.
2. Sistem menolak kontrak kedua yang periodenya bertabrakan pada kamar yang sama.
3. Sistem menerbitkan invoice perdana sesuai billing mode yang dipilih: prorata hingga akhir bulan atau satu bulan penuh pada siklus tanggal masuk. Line sewa dan deposit dipisah.
4. Tenant melihat invoice miliknya dan mencatat nominal pembayaran secara manual sebagai pending. Tidak ada unggah bukti transfer atau kuitansi PDF.
5. Owner memverifikasi; saldo hanya berkurang sekali. Alokasi sewa didahulukan, lalu deposit; hanya alokasi deposit menambah escrow. Status kamar menjadi terisi berdasarkan kontrak aktif.

**Penerimaan:** tidak ada duplikasi invoice/kontrak; deposit tidak dihitung sebagai pendapatan sewa; klaim pending tidak mengurangi saldo.

## ALUR 02 ? Invoice rutin dan pembayaran parsial

1. Scheduler idempotent menerbitkan invoice rutin berdasarkan mode kontrak: kalender bulanan atau tanggal anniversary.
2. Tenant mencatat pembayaran parsial pada invoice miliknya. Nominal yang melebihi saldo invoice ditolak; tidak terbentuk kredit Tenant.
3. Staff boleh mencatat pembayaran yang diterima sebagai pending, tetapi tidak dapat memverifikasi. Owner memverifikasi pembayaran.
4. Pada klaim pending terpisah, Owner menolak pembayaran dengan alasan nonblank. Payment tersimpan `REJECTED`; nilainya tidak mengurangi saldo invoice dan alasannya tidak dapat diubah.
5. Invoice untuk pembayaran terverifikasi menjadi parsial dengan sisa yang benar. Tunggakan periode lama tetap pada invoice asal dan tidak dipindahkan menjadi line invoice baru.

**Penerimaan:** status due/overdue dasar diturunkan dari invoice. DB menjaga unik invoice, transisi review, alasan reject, dan batas alokasi; scheduler, perhitungan jatuh tempo, dan otorisasi adalah tanggung jawab server. Tidak ada submeter, biaya tambahan, ambang suspensi, atau carry-over.

## ALUR 03 ? Tiket kerusakan

1. Tenant dengan kontrak aktif membuat tiket untuk kamarnya sendiri dengan uraian dan minimal satu foto/video yang memenuhi batas ukuran/format.
2. Pada variasi terpisah, Owner atau Staff membuat tiket untuk kamar kosong tanpa lease. Setiap role ditolak bila mencoba mengirim tiket tanpa media tersedia; Tenant ditolak untuk kamar kosong atau kamar Tenant lain.
3. Staff menetapkan prioritas/penanggung jawab internal, memperbarui status, dan dapat menambah komentar internal. Owner/Staff berizin dapat mengunggah bukti after-service.
4. Tenant hanya melihat komentar/lampiran tenant-visible pada tiket miliknya. Owner/Staff mengelola penutupan sesuai otorisasi; media mengikuti masa retensi.

**Penerimaan:** semua role dapat membuat tiket; Tenant wajib memakai lease aktif miliknya, sedangkan Owner/Staff dapat memakai kamar kosong dengan lease opsional. DB menjaga referensi, status, dan metadata/media yang tersedia saat submit; server memeriksa role, kepemilikan, isi file, visibilitas, dan akses objek. Tidak ada akun Teknisi, rating, garansi, atau biaya tiket yang otomatis menjadi Expense.

## ALUR 04 ? Pengeluaran dan laporan Owner

1. Owner menetapkan pagu positif untuk satu bulan kalender; pembuatan/perubahan pagu tercatat di audit. Pada variasi bulan lain, pagu dibiarkan belum diatur. Staff berizin mencatat pengeluaran operasional mandiri dengan tanggal, kategori, nominal, dan deskripsi.
2. Staff mencoba meminta laporan finansial dan ditolak server tanpa menerima angka laporan atau pagu.
3. Owner melihat ringkasan pemasukan terverifikasi, okupansi, serta pengeluaran yang belum direversal pada bulan terpilih dibanding pagu bulan yang sama. Untuk bulan tanpa pagu, laporan menyatakan “belum diatur”, bukan nol atau default. Deposit escrow tidak dianggap pendapatan sewa.

**Penerimaan:** Expense berdiri sendiri dan tidak memiliki relasi ke Ticket. DB menyimpan Expense, reversal, dan pagu bulanan; agregasi laporan serta pembatasan Owner-only ditegakkan server. Laporan ringkas bukan laporan laba/pajak formal.

## ALUR 05 ? Check-out, rekonsiliasi deposit, turnover

1. Tenant aktif mengajukan permintaan check-out. Tidak ada nomor rekening yang dikumpulkan. Owner dapat menyetujui atau menolak permintaan; jika ditolak, kontrak tetap aktif dan tidak ada settlement deposit atau turnover.
2. Untuk permintaan yang disetujui, Owner memeriksa kontrak dan kondisi kamar, menetapkan tanggal akhir dan mengakhiri kontrak, lalu mencatat pemotongan beralasan dan/atau antrean refund manual yang tidak melebihi saldo escrow.
3. Akun Tenant beralih menjadi read-only untuk histori miliknya; seluruh mutasi dan unggah baru, termasuk klaim pembayaran, ditolak.
4. Kamar masuk status `CLEANING`, lalu `READY` setelah Staff menyelesaikan proses bersih-bersih. Checklist turnover adalah proses operasional/manual dan tidak disimpan sebagai daftar terstruktur di DB P0.

**Penerimaan:** DB mengikat permintaan pada Tenant pemilik Lease, menyimpan keputusan review, menjaga saldo escrow termasuk refund pending sebagai reservasi, dan menyimpan status fisik kamar. Server mengatur urutan persetujuan/pengakhiran, otorisasi, dan read-only pascakontrak; saldo deposit tidak negatif, refund tidak dikirim aplikasi, dan rekening tujuan tidak disimpan.

## ALUR 06 ? Reversal pembayaran

1. Owner atau Staff mencatat pembayaran pada satu invoice; pembayaran pending belum memengaruhi saldo. Owner memverifikasi pembayaran.
2. Owner membuat reversal penuh beralasan atas transaksi terverifikasi. Sistem mempertahankan transaksi asal dan menulis reversal serta audit event secara atomik.
3. Saldo invoice dihitung ulang dari pembayaran terverifikasi dan reversal; reversal kedua untuk pembayaran yang sama ditolak.
4. Pada fixture pembayaran terpisah yang memiliki alokasi deposit, escrow lebih dulu dipakai atau dipesan oleh refund pending. Percobaan reversal penuh ditolak karena saldo bebas tidak cukup; pembayaran asal dan seluruh ledger tetap utuh tanpa reversal/kompensasi parsial.

**Penerimaan:** DB menjaga reversal penuh satu kali dan menolak reversal deposit yang melampaui saldo bebas escrow. Server menyimpan mutasi finansial, AuditEvent, dan IdempotencyKey dalam satu transaksi; kegagalan tidak meninggalkan mutasi parsial. Tidak ada hard-delete, kredit saldo, transfer antar invoice, atau pembayaran satu kali untuk beberapa kamar.

## Checklist penerimaan (belum dieksekusi)

| Cakupan | Alur | Kriteria yang akan diverifikasi saat M07 |
|---|---|---|
| Kamar dan kontrak | 01 | Konflik lease ditolak; satu tenant per lease; status okupansi turunan benar. |
| Invoice | 01–02 | Mode billing, idempotensi, line RENT/DEPOSIT, saldo, due/overdue; scheduler dan kalkulasi di server. |
| Pembayaran dan escrow | 01–02, 05–06 | Klaim pending, verifikasi/reject beralasan oleh Owner, rent-first di server, batas overpayment, reversal, reservasi escrow, serta reversal yang ditolak bila saldo escrow tidak cukup. |
| Pengeluaran, pagu, dan laporan | 04 | Expense/reversal, pagu bulanan dan state belum diatur; agregasi serta akses Owner-only di server. |
| Ticketing dan media | 03 | Semua role membuat tiket; Tenant harus memakai lease aktif sendiri; Owner/Staff dapat memilih kamar kosong; media wajib saat submit; lima status, komentar privat, akses ownership dan isi media diperiksa server. |
| Checkout dan histori | 05 | Request Tenant pemilik Lease, keputusan Owner, rekonsiliasi escrow, refund manual, read-only pascakontrak, status turnover; checklist bersifat manual/tidak dipersistenkan. |

Tidak ada hasil PASS yang diklaim sebelum test dijalankan dan bukti mentah ditautkan.
