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
4. Invoice menjadi parsial dengan sisa yang benar. Tunggakan periode lama tetap pada invoice asal dan tidak dipindahkan menjadi line invoice baru.

**Penerimaan:** status due/overdue dasar diturunkan dari invoice; tidak ada submeter, biaya tambahan, ambang suspensi, atau carry-over.

## ALUR 03 ? Tiket kerusakan

1. Tenant dengan kontrak aktif membuat tiket untuk kamarnya sendiri dengan uraian dan minimal satu foto/video yang memenuhi batas ukuran/format.
2. Pengiriman tanpa media ditolak. Tenant tidak dapat membuat tiket untuk kamar kosong atau kamar tenant lain.
3. Staff menetapkan prioritas/penanggung jawab internal, memperbarui status, dan dapat menambah komentar internal. Owner/Staff berizin dapat mengunggah bukti after-service.
4. Tenant hanya melihat komentar/lampiran tenant-visible pada tiket miliknya. Owner menutup tiket; media mengikuti masa retensi.

**Penerimaan:** alur status lima tahap dan otorisasi per tiket berjalan; tidak ada akun Teknisi, rating, garansi, atau biaya tiket yang otomatis menjadi Expense.

## ALUR 04 ? Pengeluaran dan laporan Owner

1. Staff berizin mencatat satu pengeluaran operasional mandiri dengan tanggal, kategori, nominal, dan deskripsi.
2. Staff mencoba meminta laporan finansial dan ditolak server tanpa menerima angka laporan.
3. Owner melihat ringkasan pemasukan terverifikasi, pengeluaran tercatat, dan okupansi untuk rentang tanggal. Deposit escrow tidak dianggap pendapatan sewa.

**Penerimaan:** Expense berdiri sendiri dan tidak memiliki relasi ke Ticket; laporan ringkas bukan laporan laba/pajak formal.

## ALUR 05 ? Check-out, rekonsiliasi deposit, turnover

1. Tenant aktif mengajukan permintaan check-out. Tidak ada nomor rekening yang dikumpulkan.
2. Owner memeriksa kontrak dan kondisi kamar, mengakhiri kontrak, lalu mencatat pemotongan beralasan dan/atau antrean refund manual yang tidak melebihi saldo escrow.
3. Akun Tenant beralih menjadi read-only untuk histori miliknya; seluruh mutasi dan unggah baru, termasuk klaim pembayaran, ditolak.
4. Kamar masuk status perlu dibersihkan; Staff menyelesaikan checklist turnover lalu menandai siap huni.

**Penerimaan:** saldo deposit tidak negatif; refund tidak dikirim oleh aplikasi dan tidak menyimpan rekening tujuan.

## ALUR 06 ? Reversal pembayaran

1. Owner atau Staff mencatat pembayaran pada satu invoice; pembayaran pending belum memengaruhi saldo. Owner memverifikasi pembayaran.
2. Owner membuat reversal penuh beralasan atas transaksi terverifikasi. Sistem mempertahankan transaksi asal dan menulis reversal serta audit event secara atomik.
3. Saldo invoice dihitung ulang dari pembayaran terverifikasi dan reversal; reversal kedua untuk pembayaran yang sama ditolak.

**Penerimaan:** tidak ada hard-delete, kredit saldo, transfer antar invoice, atau pembayaran satu kali untuk beberapa kamar.

## Checklist penerimaan (belum dieksekusi)

| Cakupan | Alur | Kriteria yang akan diverifikasi saat M07 |
|---|---|---|
| Kamar dan kontrak | 01 | Konflik lease ditolak; satu tenant per lease; status okupansi turunan benar. |
| Invoice | 01?02 | Mode billing dan idempotensi; line hanya RENT/DEPOSIT; saldo per invoice. |
| Pembayaran dan escrow | 01?02, 05?06 | Klaim pending, verifikasi Owner, alokasi rent-first, batas overpayment, reversal, saldo deposit. |
| Pengeluaran dan laporan | 04 | Expense mandiri; akses laporan Owner-only. |
| Ticketing dan media | 03 | Tenant aktif, media wajib, lima status, komentar privat, akses berbasis ownership. |
| Checkout dan histori | 05 | Rekonsiliasi deposit, refund manual, read-only pascakontrak, turnover. |

Tidak ada hasil PASS yang diklaim sebelum test dijalankan dan bukti mentah ditautkan.
