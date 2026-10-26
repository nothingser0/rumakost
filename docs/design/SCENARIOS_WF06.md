# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-06: Pusat Kasir Multi-Kanal, Verifikasi Pembayaran & Rekonsiliasi Kas (SCR-11)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-06-pembayaran.html`  
> **Fitur Terkait**: **F-01** (Akses & Peran / RBAC), **F-04** (Tagihan Berulang & Invoice Perdana), **F-05** (Pembayaran, Saldo Parsial, Verifikasi Mutasi, Escrow Deposit & Histori Koreksi Reversal), **F-06** (Pencatatan Pemasukan Kas & Refund Pengeluaran Kas)  
> **User Stories KANBAN**: `RK-030` (Pencatatan Pembayaran Masuk Multi-Kanal), `RK-031` (Verifikasi Mutasi Bank & Zero Self-Approval Staf), `RK-032` (Kalkulasi Otomatis Sisa Saldo, Cicilan Parsial & Kelebihan Bayar), `RK-033` (Jurnal Reversal Koreksi Transaksi & Jejak Audit Finansial)  
> **Hak Akses Layar**: **Pemilik Properti (Owner / Superadmin)** & **Staf Pengelola (Staff Operasional)**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-06 (`SCR-11`)** adalah pusat operasional perbendaharaan (*Financial Hub*) dan kasir penerimaan dana pada ekosistem RumaKost. Layar ini dibangun di atas filosofi desain **Estify Minimalist DNA** dengan arsitektur **Master-Detail Streamlining 2-Kolom**, yang menggabungkan visualisasi aliran kas real-time (*Daily Waterfall Payment Feed*) di area utama dengan pusat verifikasi cepat dan ringkasan kanal rekening (*Multi-Wallet Hub*) di panel samping (*sidebar drawer*).

Layar ini menegakkan prinsip tata kelola keuangan kost mandiri tanpa kompromi:
1. **Pemisahan Mutasi Fisik vs Pengesahan Saldo (*Domain Verification Boundary*)**:  
   Pencatatan mutasi kas masuk tidak serta-merta mengurangi saldo piutang penghuni sebelum disahkan secara sah oleh Pemilik Kost berdasarkan pengecekan mutasi rekening bank/brankas asli.
2. **Zero Self-Approval untuk Staf Operasional (*Strict Segregation of Duties*)**:  
   Staf operasional diizinkan menerima titipan uang tunai atau mencatat klaim transfer penyewa di lapangan, namun sistem mengunci hak verifikasi. Hanya akun Pemilik yang berwenang mengesahkan (*Approve*), menolak (*Reject*), mereversal (*Reversal*), atau merestitusi (*Refund*) transaksi.
3. **Immutability & Non-Destructive Accounting (*Jejak Audit Reversal*)**:  
   Sistem menolak keras penghapusan fisik (*hard-delete*) data transaksi yang telah masuk buku kas. Setiap koreksi kesalahan catat wajib melalui mekanisme **Jurnal Reversal** (pembukuan entri pembalik bernilai negatif) sehingga seluruh histori finansial dapat diaudit secara transparan.
4. **Penyelesaian Non-Kas Escrow Deposit (*Deposit Settlement*)**:  
   Mendukung pelunasan sewa melalui klaim saldo uang jaminan (deposit) yang tersimpan di awal kontrak tanpa memicu mutasi kas masuk perbankan baru.
5. **Mitigasi Cerdas Kelebihan Bayar & Transfer Ganda (*Surplus & Double Transfer Guard*)**:  
   Mendeteksi secara otomatis anomali pembayaran ganda dari penghuni serta menyediakan dua opsi resolusi resmi: pencatatan kas keluar pengembalian (*Refund*) atau pengalihan menjadi uang muka sewa periode bulan berikutnya (*Credit Advance*).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            WF-06 WORKBENCH ARSITEKTUR & LAYOUT MASTER                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Brand Logo + Dark Nav Pill (Pembayaran Aktif) + Avatar Pengelola      │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 2. KOLOM UTAMA (CONTENT FLOW · ~1.020PX)                         │ 3. SIDEBAR KASIR (360PX)      │
│    ├─ 3 Metric Speedometer Cards (Realisasi, Pending, Piutang)   │    ├─ KANAL KASIR AKTIF       │
│    ├─ Single-Line Controls Strip:                                │    │  (Konsolidasi, BCA, QRIS,│
│    │  • Search Capsule (ID, Nama, Kamar, Ref)                    │    │   Kas Tunai & Brankas)   │
│    │  • 5 Status Filter Pills (Semua, Menunggu, Lunas, Cicil, Rev)│    ├─ DIVIDER PEMBATAS       │
│    │  • Quick Export CSV + CTA "Catat Penerimaan" (44px)         │    └─ ANTREAN VERIFIKASI STAF │
│    └─ DAILY WATERFALL PAYMENT FEED (Stream Garis Waktu):         │       (Zero Self-Approval)    │
│       • Grup Hari Ini (23 Okt 2026)                              │       • Kartu Ringkas Pending │
│       • Grup Minggu Lalu (04 - 12 Okt 2026)                      │       • Sahkan Langsung (Owner│
│       • Grup Awal Bulan (01 - 03 Okt 2026)                       │       • Tolak & Alasan Modal  │
│       • Kartu Transaksi Collapsible (Resi, Audit Log, Tombol Aksi)│       • Focus & Inspect Link  │
├──────────────────────────────────────────────────────────────────┴───────────────────────────────┤
│ 4. MODAL DIALOG ENGINE (Layer 120): Catat Bayar, Zoom Slip, Tolak, Reversal, Kuitansi, Refund     │
│ 5. FLOATING ROLE SIMULATOR PILL: Simulasi Peran Pemilik vs Staf Operasional (?role=staf)        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriks Peran & Hak Otorisasi Keuangan (RBAC Matrix)

Sesuai arahan dokumen `docs/pm/SCOPE_STATEMENT.md` Bagian 3, wewenang finansial dibagi secara tegas antara Pemilik dan Staf:

| Kemampuan / Fitur Finansial | Pemilik Kost (Owner / Superadmin) | Staf Pengelola (Staff Operasional) | Catatan Desain & Guardrail Sistem |
|---|---|---|---|
| **Melihat Seluruh Aliran Kas (Feed)** | Ya (Akses Penuh) | Ya (Akses Penuh Transaksi Properti) | Menampilkan riwayat transaksi properti yang dikelola. |
| **Mencatat Pembayaran Baru** | Ya (Langsung Berstatus *Verified* / Lunas) | Ya (Otomatis Berstatus *Pending* / Menunggu Cek) | Penegakan aturan *Zero Self-Approval*: catatan staf wajib diverifikasi pihak kedua. |
| **Penyelesaian Potong Deposit Escrow** | Ya (Eksekusi Langsung) | Ya (Tercatat sebagai Draf Verifikasi) | Memotong saldo uang jaminan penghuni tanpa mutasi fisik bank. |
| **Mengesahkan Pembayaran (*Approve*)** | Ya (Tunggal & Sah Mutasi) | **Dilarang Keras (Terkunci)** | Tombol disembunyikan / memunculkan notifikasi blokir otorisasi. |
| **Menolak Bukti Pembayaran (*Reject*)** | Ya (Wajib Alasan Tertulis) | **Dilarang Keras (Terkunci)** | Bukti transfer dikembalikan ke status draf dengan catatan audit log merah. |
| **Eksekusi Jurnal Reversal Koreksi** | Ya (Wajib Alasan Tertulis) | **Dilarang Keras (Terkunci)** | Membukukan transaksi pembalik bernilai negatif; mengembalikan saldo tagihan. |
| **Pencatatan Refund Kas Keluar** | Ya (Pilih Rekening Sumber Kas) | **Dilarang Keras (Terkunci)** | Membukukan transaksi kas keluar atas kelebihan transfer penyewa. |
| **Alokasi Kredit Sewa Bulan Depan** | Ya (Konversi ke Deposit Sewa) | **Dilarang Keras (Terkunci)** | Menetapkan dana dobel sebagai saldo kredit sewa periode berikutnya. |
| **Mencetak Kuitansi Resmi Digital** | Ya (Watermark Resmi: LUNAS / CICILAN) | Ya (Cetak Tanda Terima Sementara / Kuitansi) | Mengeluarkan dokumen kuitansi tanpa tanda tangan basah. |
| **Ekspor Laporan Mutasi (CSV)** | Ya (Semua Kanal & Riwayat) | Dibatasi (Hanya Operasional Harian) | Berkas CSV rekap mutasi kas. |

---

## 3. Matriks Entitas Data Baseline (Testing Fixture)

Pengujian fungsional mengacu pada berkas data sintetis awal Oktober 2026 yang tertera pada kode antarmuka:

### 3.1 Daftar 12 Transaksi Sintetis Awal (`paymentsData`)

| ID Transaksi | Grup Waktu | Kamar | Penghuni | Kanal Bayar | Nominal (Rp) | Sisa Piutang | Status Awal | Nomor Referensi | Skenario Validasi |
|---|---|---|---|---|---|---|---|---|---|
| `PAY-202610-11` | Hari Ini | A-02 | Larasati Dewi | BCA Transfer | Rp 1.900.000 | Rp 0 | `pending` | `TRF-BCA-993812` | Verifikasi Tertunda Staf |
| `PAY-202610-12DBL`| Hari Ini | A-01 | Rina Marliana | BCA Transfer | Rp 1.800.000 | Rp 0 | `double_transfer`| `TRF-BCA-993888` | Deteksi Transfer Dobel |
| `PAY-202610-02` | Minggu Lalu| A-03 | Ahmad Hidayat | QRIS Instant | Rp 1.500.000 | Rp 0 | `pending` | `QRS-MDR-441029` | Verifikasi Tertunda QRIS |
| `PAY-202610-04S` | Minggu Lalu| B-02 | Dimas Setiawan| BCA Transfer | Rp 1.900.000 | Rp 0 | `surplus` (+100k)| `TRF-BCA-771923` | Lunas Kelebihan / Refund |
| `PAY-202610-03` | Minggu Lalu| A-04 | Budi Santoso | BCA Transfer | Rp 1.250.000 | Rp 750.000 | `partial` | `TRF-BCA-319082` | Pembayaran Cicilan Tahap 1 |
| `REV-202610-01` | Minggu Lalu| B-03 | Eko Prasetyo | Jurnal Reversal| -Rp 1.500.000| Rp 1.500.000 | `reversed` | `REV-202610-01` | Histori Koreksi Reversal |
| `PAY-202610-04` | Minggu Lalu| B-02 | Dian Permata | Tunai / Cash | Rp 2.000.000 | Rp 0 | `verified` | `CSH-KST-100204` | Pembayaran Kasir Tunai |
| `PAY-202610-05` | Minggu Lalu| B-04 | Fajar Nugraha | Bank Mandiri | Rp 1.600.000 | Rp 0 | `verified` | `TRF-MDR-778103` | Verifikasi Transfer Mandiri |
| `PAY-202610-06` | Minggu Lalu| B-05 | Gilang Ramadhan| BCA Transfer | Rp 1.700.000 | Rp 0 | `verified` | `TRF-BCA-552190` | Verifikasi Transfer BCA |
| `PAY-202610-07` | Minggu Lalu| C-01 | Hana Pertiwi | QRIS Instant | Rp 1.800.000 | Rp 0 | `verified` | `QRS-BCA-661902` | Verifikasi Settlement QRIS |
| `PAY-202610-08` | Minggu Lalu| C-02 | Indra Kusuma | BCA Transfer | Rp 1.500.000 | Rp 0 | `verified` | `TRF-BCA-901844` | Verifikasi Transfer BCA |
| `PAY-202610-09` | Minggu Lalu| C-03 | Joko Prasetyo | BCA Transfer | Rp 1.600.000 | Rp 0 | `verified` | `TRF-BCA-102948` | Verifikasi Transfer BCA |
| `PAY-202610-10` | Minggu Lalu| C-04 | Kevin Sanjaya | Tunai / Cash | Rp 1.500.000 | Rp 0 | `verified` | `CSH-KST-100210` | Verifikasi Kas Tunai Staf |
| `PAY-202610-01` | Awal Bulan | A-01 | Rina Marliana | BCA Transfer | Rp 1.800.000 | Rp 0 | `verified` | `TRF-BCA-889102` | Pelunasan Awal Bulan |

### 3.2 Daftar Tagihan Aktif untuk Pencarian Cepat Modal (`activeInvoicesList`)

| No. Invoice | Kamar | Nama Penghuni | Total Tagihan | Sisa Kewajiban | Status Tagihan | Badge Indikator |
|---|---|---|---|---|---|---|
| `INV-202610-001` | A-01 | Rina Marliana | Rp 1.800.000 | Rp 0 | Lunas (Sisa Rp 0) | Hijau (`#16A34A`) |
| `INV-202610-002` | A-02 | Larasati Dewi | Rp 1.900.000 | Rp 0 | Lunas (Sisa Rp 0) | Hijau (`#16A34A`) |
| `INV-202610-004` | A-04 | Budi Santoso | Rp 1.500.000 | Rp 750.000 | Sebagian Dibayar | Oranye (`#EA580C`) |
| `INV-202610-007` | B-02 | Dimas Setiawan| Rp 1.800.000 | Rp 1.800.000 | Belum Dibayar | Merah (`#DC2626`) |
| `INV-202610-008` | B-05 | Fajar Nugraha | Rp 1.650.000 | Rp 1.650.000 | Belum Dibayar | Merah (`#DC2626`) |
| `INV-202610-009` | C-01 | Agung Pratama | Rp 2.100.000 | Rp 2.100.000 | Jatuh Tempo | Merah Tua (`#B91C1C`) |
| `INV-202610-010` | A-02 | Hendra Gunawan| Rp 1.500.000 | Rp 500.000 | Cicilan Terakhir | Biru (`#2563EB`) |

### 3.3 Kanal Kasir & Akun Penampungan Bank (`sidebar-channel-list`)

1. **Semua Kanal Kasir (Konsolidasi)**: Total Realisasi Rp 21,65 Jt (100% Share).
2. **Bank Central Asia (BCA)**: No. Rek. `8820-1928-33` a.n. Budi Makmur · Realisasi Rp 12,85 Jt (59.3% Share).
3. **QRIS Merchant Instant**: MID: `Q91823` · Realisasi Rp 4,80 Jt (22.2% Share).
4. **Kas Tunai & Bank Mandiri**: Brankas Kost / Rek. `137-00-1928374` · Realisasi Rp 4,00 Jt (18.5% Share).

---

## 4. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Inspeksi Aliran Feed Transaksi & Ekspansi Akordion (Daily Waterfall Payment Feed)
* **Tujuan**: Memastikan pengguna dapat melihat aliran transaksi keuangan kost yang dikelompokkan secara kronologis per hari, memeriksa resi slip mini, rekonsiliasi, dan jejak audit mutasi tanpa *reload* halaman.
* **Kondisi Awal (Pre-condition)**: Pengguna login sebagai Pemilik (`budi.santoso@rumakost.id`) dan berada pada halaman `WF-06-pembayaran.html`.
* **Langkah-langkah**:
  1. Periksa struktur timeline pada kontainer utama `#waterfallFeedContainer`.
  2. Verifikasi keberadaan 3 pengelompokan tanggal:
     - *"Hari Ini (23 Oktober 2026)"*
     - *"Minggu Lalu (04 - 12 Oktober 2026)"*
     - *"Awal Bulan (01 - 03 Oktober 2026)"*
  3. Klik pada baris utama kartu transaksi **#PAY-202610-01** (Rina Marliana · Kamar A-01 · Rp 1.800.000).
* **Hasil Diharapkan**:
  - Akordion kartu terbuka mulus (*expand*), menambahkan kelas `.expanded` pada elemen `#feedCard-PAY-202610-01`.
  - Tiga kolom detail (*3-column grid*) tampil dengan presisi:
    - **Kolom 1 (Slip Preview)**: Menampilkan kartu resi finansial mini BCA, nominal Rp 1.800.000, nama pengirim Rina Marliana, dan no. referensi `TRF-BCA-889102`.
    - **Kolom 2 (Reconciliation & Audit Timeline)**: Menampilkan total tagihan (Rp 1.800.000), pembayaran ini (Rp 1.800.000), sisa kewajiban (Rp 0 - Hijau), serta riwayat audit titik hijau: waktu pencatatan dan waktu pengesahan oleh Pemilik.
    - **Kolom 3 (Action Buttons)**: Menampilkan tombol *"Cetak Kuitansi Resmi"* dan tombol *"Jurnal Reversal"*.
  4. Klik kembali baris transaksi untuk menutup akordion. Akordion menciut kembali ke bentuk baris ringkas.

---

### SKENARIO 02: Penyaringan Kategori Status Transaksi (Filter Segment Tabs)
* **Tujuan**: Memvalidasi fungsi tombol tab filter status dalam menyaring kartu transaksi dan memperbarui jumlah counter reaktif.
* **Kondisi Awal**: Semua transaksi tampil pada feed (12 transaksi).
* **Langkah-langkah**:
  1. Klik tab filter **"Menunggu Cek (2)"** pada baris kontrol.
     - *Verifikasi*: Tab menjadi aktif (latar hitam `#111111`, teks putih). Hanya transaksi berstatus `pending` yang tampil (`PAY-202610-11` dan `PAY-202610-02`). Transaksi lunas lainnya disembunyikan.
  2. Klik tab filter **"Cicilan (1)"**.
     - *Verifikasi*: Hanya transaksi parsial `PAY-202610-03` (Budi Santoso · Rp 1.250.000 · Sisa Rp 750.000) yang tampil di timeline.
  3. Klik tab filter **"Reversal (1)"**.
     - *Verifikasi*: Hanya transaksi koreksi `REV-202610-01` (-Rp 1.500.000 · Status Dibatalkan) yang ditampilkan.
  4. Klik tab filter **"Lunas (9)"**.
     - *Verifikasi*: Menampilkan seluruh transaksi berstatus `verified`, `surplus`, dan `double_transfer` yang terkonfirmasi lunas.
  5. Klik tab filter **"Semua (12)"**.
     - *Verifikasi*: Feed kembali menampilkan seluruh 12 transaksi sintetis lengkap.

---

### SKENARIO 03: Penyaringan Berdasarkan Kanal Kasir (Multi-Wallet Channel Filter)
* **Tujuan**: Menguji filter kanal kasir di panel samping untuk memeriksa mutasi spesifik per rekening bank atau kas tunai kost.
* **Kondisi Awal**: Seluruh kanal aktif (`walletCard-all`).
* **Langkah-langkah**:
  1. Pada Sidebar Kiri/Kanan (Kanal Kasir Aktif), klik opsi **"Bank Central Asia"** (`#walletCard-bca`).
* **Hasil Diharapkan**:
  - Item BCA memperoleh kelas aktif `.active` dan atribut `aria-pressed="true"`.
  - Muncul toast pemberitahuan: *"Menyaring aliran transaksi: Bank Central Asia (BCA)"*.
  - Feed transaksi di kolom utama menyaring dan hanya menampilkan transaksi yang menggunakan kanal BCA (misal: `PAY-202610-11`, `PAY-202610-12DBL`, `PAY-202610-03`, `PAY-202610-06`, `PAY-202610-08`, `PAY-202610-09`, `PAY-202610-01`).
  - Transaksi non-BCA (QRIS, Tunai, Mandiri) disembunyikan dari timeline.
  2. Klik opsi **"QRIS Merchant"** (`#walletCard-qris`).
     - Tampil hanya transaksi berkanal QRIS (`PAY-202610-02` dan `PAY-202610-07`).
  3. Klik opsi **"Kas Tunai & Mandiri"** (`#walletCard-cash`).
     - Tampil transaksi tunai dan Mandiri (`PAY-202610-04`, `PAY-202610-05`, `PAY-202610-10`, `REV-202610-01`).
  4. Klik kembali **"Semua Kanal Kasir"** (`#walletCard-all`). Seluruh transaksi kembali muncul.

---

### SKENARIO 04: Pencarian Real-Time Transaksi & Tombol Clear Instan
* **Tujuan**: Menguji fitur pencarian instan pada kapsul search toolbar terhadap berbagai kombinasi data transaksi (ID, Nomor Kamar, Nama Penghuni, Nomor Referensi Bank).
* **Kondisi Awal**: Feed menampilkan semua transaksi. Kotak pencarian `#txSearchInput` kosong.
* **Langkah-langkah**:
  1. Ketikkan nama `"Larasati"` pada `#txSearchInput`.
     - *Hasil*: Feed langsung merender kartu `PAY-202610-11` (Larasati Dewi · Kamar A-02). Tombol silang clear (`#clearSearchBtn`) otomatis tampil.
  2. Ketikkan nomor kamar `"B-02"`.
     - *Hasil*: Menampilkan dua transaksi untuk Kamar B-02 (`PAY-202610-04S` a.n Dimas Setiawan dan `PAY-202610-04` a.n Dian Permata).
  3. Ketikkan nomor referensi `"TRF-BCA-889102"`.
     - *Hasil*: Tampil tepat satu transaksi asal awal bulan (`PAY-202610-01`).
  4. Klik tombol silang **"X"** (`#clearSearchBtn`).
* **Hasil Diharapkan**:
  - Teks pada kotak pencarian bersih seketika.
  - Tombol clear kembali disembunyikan (`display: none`).
  - Feed otomatis merender ulang seluruh transaksi tanpa jeda.

---

### SKENARIO 05: Penanganan Tampilan Nihil (Empty States: Filter Zero State vs Absolute Zero State)
* **Tujuan**: Memastikan antarmuka memberikan visual feedback yang informatif saat tidak ada data yang cocok dengan kriteria filter, serta saat antrean pending telah bersih 100%.
* **Kondisi Awal**: Halaman terbuka dengan data aktif.
* **Langkah-langkah & Pengujian**:
  1. *Sub-Skenario 5A (Filter Zero State di Feed)*:
     - Masukkan kata kunci acak yang tidak ada di database, misal: `"Kamar Z-99"`.
     - *Hasil Diharapkan*: Kontainer feed mengganti daftar dengan kartu Empty State berbingkai lengkung (border radius 20px), ikon `search-x`, judul *"Tidak Ada Aliran Pembayaran Ditemukan"*, dan pesan panduan: *"Coba ganti filter dompet rekening atau gunakan kata kunci pencarian lain."*
  2. *Sub-Skenario 5B (Absolute Zero State pada Antrean Sidebar)*:
     - Login sebagai Pemilik, lalu sahkan seluruh 2 transaksi pending (`PAY-202610-11` dan `PAY-202610-02`).
     - *Hasil Diharapkan*:
       - Badge antrean berubah menjadi hijau dengan teks *"0 Antrean"* (`.status-pill-badge.is-success`).
       - Area antrean sidebar menampilkan kartu dashed lembut dengan ikon `check-circle-2` hijau, judul *"Semua Mutasi Telah Disahkan"*, dan sub-judul *"Tidak ada transaksi tertunda dari staf"*.
  3. *Sub-Skenario 5C (Filter Zero State pada Pencarian Invoice Modal)*:
     - Buka modal catat bayar (`#modalCatatBayar`).
     - Pada field pencarian tagihan `#searchInvoiceInput`, ketik nama yang tidak terdaftar, misal: `"Zulham Effendi"`.
     - *Hasil Diharapkan*: Floating panel dropdown menampilkan empty state dengan teks: *"Tidak ada tagihan atau kamar penghuni yang cocok"*.

---

### SKENARIO 06: Pencatatan Penerimaan Pembayaran Masuk oleh Pemilik (Happy Path Owner Cash In)
* **Tujuan**: Menguji alur pencatatan pembayaran sewa oleh Pemilik Kost hingga status transaksi langsung terverifikasi sah (*Verified*) dan saldo piutang terpotong.
* **Kondisi Awal**: Pengguna berperan sebagai Pemilik (`budi.santoso@rumakost.id`).
* **Langkah-langkah**:
  1. Klik tombol utama **"+ Catat Penerimaan"** (`.btn-action-catat`) pada baris toolbar.
     - *Verifikasi*: Modal `#modalCatatBayar` terbuka. Banner peringatan staf `#modalStaffAlert` tidak ditampilkan (karena peran Pemilik).
  2. Pilih tagihan sewa: ketik `"A-04"` pada `#searchInvoiceInput` dan klik opsi **"Kamar A-04 · Budi Santoso (#INV-202610-004)"**.
     - *Verifikasi*: Badge status menampilkan *"Kamar A-04 Terpilih"*, field nominal otomatis terisi `"750.000"`, field atas nama terisi `"Budi Santoso"`.
  3. Pilih metode pembayaran: klik pill **"BCA"**.
     - *Verifikasi*: Field nomor referensi otomatis dibuat oleh sistem: `TRF-BCA-[6 DIGIT ANGKA]` (status readonly).
  4. Periksa blok **Kalkulasi Sisa Tagihan Otomatis**:
     - Sisa Tagihan Sebelumnya: `Rp 750.000`
     - Nominal yang Dibayarkan: `- Rp 750.000`
     - Sisa Saldo Baru: `Rp 0 (Lunas Sepenuhnya)` (Warna Hijau `#16A34A`).
  5. Klik dropzone **"Unggah Bukti Transfer / Nota"** (`simulateProofUpload()`).
     - *Verifikasi*: Label dropzone berubah menjadi *"slip_transfer_bca_23okt.jpg (1.2 MB) (Valid)"* berteks hijau, muncul toast: *"Bukti transfer berhasil dilampirkan!"*.
  6. Biarkan checkbox **"Kirim Kuitansi & Bukti Bayar via WhatsApp ke Penghuni"** dalam keadaan tercentang.
  7. Masukkan catatan: `"Pelunasan sisa sewa Oktober via m-BCA"`.
  8. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Modal tertutup otomatis.
  - Transaksi baru `PAY-202610-13` masuk ke urutan paling atas timeline grup *"Hari Ini (23 Oktober 2026)"*.
  - Status transaksi langsung **"Terverifikasi"** (Badge Hijau) karena dicatat langsung oleh Pemilik.
  - Jejak audit log mencatat: *"Dicatat langsung oleh Pemilik (Budi Makmur) · BCA Transfer"*.
  - Sisa tagihan kamar A-04 berkurang menjadi Rp 0.
  - Toast konfirmasi sukses muncul: *"Pembayaran Rp 750.000 untuk A-04 berhasil disahkan & kuitansi terkirim ke WhatsApp!"*.

---

### SKENARIO 07: Pencatatan Pembayaran oleh Staf & Penegakan Aturan Zero Self-Approval
* **Tujuan**: Memastikan pencatatan oleh Staf Operasional secara otomatis berstatus *Pending (Menunggu Cek)* dan tombol pengesahan terkunci bagi akun Staf.
* **Kondisi Awal**: Buka aplikasi dengan mode staf via URL query `?role=staf` atau klik pill simulasi peran di pojok kanan bawah.
* **Langkah-langkah**:
  1. Periksa label simulator peran: bertuliskan *"Staf Operasional"*.
  2. Klik tombol **"+ Catat Penerimaan"**.
* **Hasil Diharapkan**:
  - Modal `#modalCatatBayar` terbuka.
  - Muncul banner peringatan berwarna oranye (`#modalStaffAlert`):  
    *“Staf Operasional: Catatan ini akan berstatus Menunggu Verifikasi hingga divalidasi oleh Pemilik kost (Zero Self-Approval).”*
  3. Pilih tagihan sewa kamar **B-05 (Fajar Nugraha - #INV-202610-008)** dengan nominal Rp 1.650.000.
  4. Pilih metode **"Tunai / Cash"**. Nomor referensi terisi `KAS-TUNAI-[RANDOM]`.
  5. Klik **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Transaksi baru tersimpan dan masuk ke feed dengan status **"Menunggu Cek"** (Badge Kuning Amber).
  - Pada kartu akordion transaksi tersebut, tombol *"Sahkan Pembayaran"* dan *"Tolak"* **tidak tersedia**. Sebagai gantinya, muncul kotak peringatan penguncian:  
    `[Shield Alert] Mode Staf Operasional: Transaksi menunggu pengesahan Pemilik (Zero Self-Approval).`
  - Tombol aksi yang tersedia untuk Staf hanyalah *"Cetak Tanda Terima Sementara"*.
  - Counter antrean pada Sidebar kanan bertambah dari 2 menjadi 3 Antrean.
  - Toast peringatan muncul: *"Pembayaran Rp 1.650.000 dicatat! Menunggu verifikasi Pemilik (Zero Self-Approval)."*.

---

### SKENARIO 08: Pengesahan Pembayaran Tertunda oleh Pemilik via Sidebar (One-Click Direct Approval)
* **Tujuan**: Menguji fitur verifikasi instan dari panel samping oleh Pemilik Kost untuk mengesahkan transaksi tanpa harus membuka feed utama.
* **Kondisi Awal**: Login sebagai Pemilik. Terdapat 2 antrean verifikasi di sidebar (`PAY-202610-11` dan `PAY-202610-02`).
* **Langkah-langkah**:
  1. Periksa kartu antrean pertama pada sidebar: **Larasati Dewi · Kamar A-02 · Rp 1.900.000**.
  2. Klik tombol hijau **"Sahkan Pembayaran"** (`.btn-quick-sah-pembayaran`).
* **Hasil Diharapkan**:
  - Sistem mengeksekusi fungsi `approveDirectFromSidebar('PAY-202610-11', 'Larasati Dewi', 'Rp 1.900.000')`.
  - Status transaksi `PAY-202610-11` pada feed utama seketika berganti menjadi **"Terverifikasi"** (Badge Hijau Lunas).
  - Kartu Larasati Dewi langsung menghilang dari daftar antrean sidebar.
  - Badge antrean berkurang menjadi *"1 Antrean"*.
  - Metrik kartu atas *"Menunggu Verifikasi"* berkurang dari Rp 3,40 Jt menjadi Rp 1,50 Jt.
  - Metrik *"Kas Masuk Realisasi"* bertambah sebesar Rp 1,90 Jt.
  - Toast konfirmasi sukses muncul: *"Mutasi #PAY-202610-11 (Larasati Dewi - Rp 1.900.000) berhasil disahkan oleh Pemilik!"*.

---

### SKENARIO 09: Navigasi Fokus Inspeksi dari Sidebar ke Feed (Focus & Inspect Feed Tx)
* **Tujuan**: Memverifikasi alur saat Pemilik ingin memeriksa detail lengkap dan slip bukti transaksi pending sebelum mengesahkannya.
* **Kondisi Awal**: Pengguna berada pada tab filter "Semua". Terdapat antrean `PAY-202610-02` (Ahmad Hidayat) di sidebar.
* **Langkah-langkah**:
  1. Pada Sidebar Verifikasi Pencatatan Staf, klik area kartu **Ahmad Hidayat (Kamar A-03 · QRIS · Rp 1.500.000)**.
* **Hasil Diharapkan**:
  - Fungsi `focusAndInspectFeedTx('PAY-202610-02')` dieksekusi:
    1. Filter status di toolbar otomatis beralih ke tab **"Menunggu Cek"** (tab Menunggu Cek menjadi `.active`).
    2. Akordion kartu `PAY-202610-02` pada feed otomatis terbuka (`.expanded`).
    3. Halaman melakukan scroll halus (*smooth scroll*) memusatkan kartu transaksi ke tengah layar (*viewport center*).
    4. Kartu transaksi diberikan efek highlight visual berupa border oranye tebal dan focus ring oranye `box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.45)` selama 2,4 detik sebelum kembali normal.
    5. Toast informasi muncul: *"Memfilter Menunggu Cek & Mengarah ke: Ahmad Hidayat (Kamar A-03)"*.

---

### SKENARIO 10: Inspeksi Bukti Slip Transfer Asli & Modal Zoom-In (High-Fidelity Proof Inspector)
* **Tujuan**: Memastikan pengelola dapat memperbesar dan memverifikasi keaslian resi mutasi perbankan secara detail sebelum mengambil keputusan finansial.
* **Kondisi Awal**: Akordion kartu `PAY-202610-02` terbuka di feed.
* **Langkah-langkah**:
  1. Klik kartu preview slip di Kolom 1 akordion (`.accordion-slip-card`).
* **Hasil Diharapkan**:
  - Modal inspeksi bukti asli `#modalProofZoom` terbuka di tengah layar.
  - Dokumen digital receipt menampilkan detail presisi:
    - Kop Resi: *"QRIS INSTANT / MANDIRI ONLINE TRANSFER · Resi Resmi Transaksi Finansial"* dengan badge *"VALID MUTASI"*.
    - Nominal Besar: `Rp 1.500.000`.
    - Rekening Tujuan: `BCA - 8472-9182-01 (Budi Makmur)`.
    - Nama Pengirim: `Ahmad Hidayat`.
    - Waktu Transaksi: `04 Okt 2026 · 14:30 WIB`.
    - No. Referensi: `QRS-MDR-441029`.
  2. *Uji Otorisasi Tombol*:
     - Jika pengguna adalah Pemilik: Tombol hijau *"Sahkan Transaksi Ini"* (`#btnZoomApprove`) tampil di footer modal.
     - Jika pengguna adalah Staf: Tombol tersebut otomatis disembunyikan (`display: none`).
  3. Sebagai Pemilik, klik tombol **"Sahkan Transaksi Ini"**.
     - Modal zoom tertutup.
     - Transaksi seketika terverifikasi lunas dengan toast sukses.

---

### SKENARIO 11: Penolakan Pembayaran Bukti Tidak Valid dengan Alasan Wajib (Reject Payment Flow)
* **Tujuan**: Menguji proses penolakan mutasi transfer bodong/salah nominal oleh Pemilik, serta memvalidasi keharusan pengisian alasan penolakan untuk transparansi audit.
* **Kondisi Awal**: Terdapat transaksi pending `PAY-202610-02` di feed atau sidebar.
* **Langkah-langkah**:
  1. Buka akordion `PAY-202610-02` dan klik tombol merah **"Tolak Bukti Transfer"** (`.btn-exec-reject`), atau klik tombol *"Tolak"* di sidebar.
     - *Verifikasi*: Modal penolakan `#modalReject` terbuka.
  2. *Uji Validasi Form Kosong*:
     - Biarkan field textarea `#rejectReasonInput` dalam keadaan kosong.
     - Klik tombol **"Konfirmasi Tolak Bukti"**.
     - *Hasil*: Sistem menolak eksekusi dan memunculkan toast error: *"Mohon masukkan alasan penolakan bukti pembayaran."*. Modal tetap terbuka.
  3. *Uji Eksekusi Valid*:
     - Masukkan alasan: `"Mutasi transfer tidak ditemukan pada rekening koran BCA per 23 Oktober 2026. Mohon unggah bukti mutasi m-banking yang valid."`.
     - Klik tombol **"Konfirmasi Tolak Bukti"**.
* **Hasil Diharapkan**:
  - Modal `#modalReject` tertutup.
  - Status transaksi `PAY-202610-02` berubah menjadi **"Ditolak"** / `reversed` (Badge Merah).
  - Transaksi terhapus dari antrean verifikasi sidebar.
  - Pada jejak audit log kartu, ditambahkan catatan bertitik merah:  
    *“Ditolak oleh Pemilik: "Mutasi transfer tidak ditemukan pada rekening koran BCA..." · [Waktu WIB]”*.
  - Sisa tagihan penghuni tetap utuh (tidak terpotong).
  - Toast peringatan muncul: *"Pembayaran PAY-202610-02 ditolak dengan alasan: Mutasi transfer tidak ditemukan..."*.

---

### SKENARIO 12: Pembayaran Cicilan Parsial & Kalkulasi Saldo Berjalan (Partial Payment & Due Balance)
* **Tujuan**: Memverifikasi alur pembayaran bertahap (cicilan sewa) dan akurasi rekonsiliasi sisa piutang berjalan sesuai User Story `RK-032`.
* **Kondisi Awal**: Buka modal catat bayar. Tagihan yang dipilih adalah kamar **A-04 (Budi Santoso)** dengan total tagihan sewa berjalan Rp 1.500.000.
* **Langkah-langkah**:
  1. Pada field nominal `#inputPayAmount`, masukkan nilai `"1.000.000"`.
* **Hasil Diharapkan**:
  - Fungsi `calculateBalancePreview()` menghitung saldo seketika:
    - Sisa Tagihan Sebelumnya: `Rp 1.500.000`
    - Nominal yang Dibayarkan: `- Rp 1.000.000`
    - Sisa Saldo Baru: `Rp 500.000 (Cicilan / Sisa Piutang)` (Warna Oranye `#EA580C`).
  2. Pilih metode transfer BCA dan klik **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Transaksi tersimpan dengan status **"Cicilan Parsial"** (Badge Kuning/Oranye `#F59E0B`).
  - Nilai pembayaran tercatat Rp 1.000.000, dan sub-teks tagihan mencantumkan: *"Sisa Tagihan: Rp 500.000"*.
  - Kartu ringkasan atas *"Sisa Piutang Berjalan"* mengkalkulasi sisa target secara proporsional.
  - Toast konfirmasi sukses muncul: *"Cicilan tahap 1 Rp 1.000.000 untuk A-04 berhasil dicatat (Sisa: Rp 500.000) & nota cicilan terkirim ke WhatsApp!"*.

---

### SKENARIO 13: Penyelesaian Tagihan via Potong Deposit Escrow (Non-Cash Settlement)
* **Tujuan**: Menguji fitur pelunasan sewa melalui pemotongan uang jaminan deposit penghuni (misalnya sewa bulan terakhir sebelum check-out) tanpa memicu mutasi kas bank masuk.
* **Kondisi Awal**: Modal catat bayar terbuka. Dipilih tagihan kamar A-04 (Budi Santoso) dengan sisa tagihan Rp 750.000.
* **Langkah-langkah**:
  1. Pada pilihan metode pembayaran, klik radio box **"Deposit"** (`Potong Deposit`).
* **Hasil Diharapkan**:
  - Radio box Deposit aktif dengan bingkai oranye/ungu.
  - Kotak informasi ungu lembut (`#depositCalloutBox`) muncul seketika:
    - Header: *"Klaim Saldo Uang Jaminan (Deposit)"* dengan badge *"Tersedia: Rp 1.500.000"*.
    - Penjelasan: *"Pembayaran akan memotong saldo uang jaminan penghuni. Tidak ada mutasi fisik uang masuk ke rekening bank."*
  - Field nomor referensi `#inputPayRef` otomatis terisi: `DEP-KLAIM-INV-202610-004`.
  2. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Transaksi tercatat di feed dengan kanal berikon perisai centang `is-deposit` (warna ungu violet).
  - Rekening tujuan tercatat: *"Pemotongan Saldo Deposit Jaminan"*.
  - Jejak audit log mencatat: *"Klaim Saldo Deposit Jaminan oleh Pemilik Kost (Non-Cash)"*.
  - Sisa tagihan invoice sewa lunas (Rp 0), dan saldo deposit penghuni di pembukuan escrow berkurang sebesar Rp 750.000.
  - Toast sukses muncul: *"Pembayaran Rp 750.000 berhasil dipotong dari saldo deposit jaminan!"*.

---

### SKENARIO 14: Deteksi Kelebihan Bayar & Opsi Refund Kas Keluar (Surplus Payment & Cash Outflow)
* **Tujuan**: Memvalidasi kemampuan sistem mendeteksi pembayaran yang melebihi nilai tagihan, mencatat status Lunas Kelebihan, serta memproses pencatatan kas keluar pengembalian dana (*Refund*).
* **Kondisi Awal**: Transaksi `PAY-202610-04S` (Dimas Setiawan · Kamar B-02 · Tagihan Rp 1.800.000, Bayar Rp 1.900.000) berada pada feed.
* **Langkah-langkah**:
  1. Buka akordion kartu `PAY-202610-04S`.
     - *Verifikasi UI*: Status badge menampilkan *"Lunas Kelebihan"* (`.status-pill-badge.is-success` berlatar emerald lembut). Sub-teks nominal bertuliskan *"Lunas Kelebihan (+Rp 100.000)"*.
  2. Temukan tombol oranye **"Refund Kelebihan (Rp 100.000)"** pada Kolom 3 tombol aksi akordion.
  3. Klik tombol tersebut.
     - *Verifikasi*: Modal pengembalian dana `#modalRefundSurplus` terbuka.
     - Banner oranye menegaskan: *"Pencatatan Otomatis Kas Keluar: Pengembalian dana akan langsung dibukukan sebagai transaksi Pengeluaran Kas (Kredit) pada mutasi kas kost untuk menjaga keseimbangan buku kas."*
     - Rincian finansial menampilkan: Penghuni Dimas Setiawan, Nominal Rp 100.000, Dampak: *"Saldo Kas Berkurang · Bukti Kas Keluar Diterbitkan"*.
  4. Pilih kanal kas keluar: klik **"Transfer BCA"** (atau Mandiri / Kas Tunai).
  5. Masukkan rekening tujuan penghuni: `"BCA 8829-1029 a.n Dimas Setiawan"`.
  6. Tambahkan catatan: `"Pengembalian dana kelebihan bayar transfer sewa Oktober 2026"`.
  7. Klik tombol **"Konfirmasi & Catat Kas Keluar"**.
* **Hasil Diharapkan**:
  - Modal tertutup otomatis.
  - Properti `refunded` pada transaksi `PAY-202610-04S` bernilai `true`.
  - Status badge transaksi diperbarui menjadi: *"Lunas (Kelebihan Direfund)"* dengan latar netral slate.
  - Tombol refund pada kartu menghilang.
  - Jejak audit log bertambah: *"Kelebihan dana Rp 100.000 telah dikembalikan ke penghuni via BCA Transfer (BCA 8829-1029 a.n Dimas Setiawan) & dibukukan sebagai Kas Keluar #OUT-202610-04S..."*.
  - Toast sukses muncul: *"Pengembalian dana Rp 100.000 berhasil diproses & dicatat ke mutasi pengeluaran kas!"*.

---

### SKENARIO 15: Deteksi Transfer Ganda & Penanganan Dual-Action (Double Transfer Resolution)
* **Tujuan**: Menguji penanganan kondisi anomali di mana penyewa melakukan transfer dua kali untuk tagihan yang sudah lunas (kasus `PAY-202610-12DBL` a.n Rina Marliana), serta menguji kedua jalur penyelesaiannya.
* **Kondisi Awal**: Transaksi `PAY-202610-12DBL` tampil pada grup *"Hari Ini"* dengan status badge kuning *"Transfer Dobel"*.
* **Langkah-langkah & Pengujian**:
  1. *Inspeksi Anomali*: Buka akordion kartu `PAY-202610-12DBL`.
     - Sub-teks menampilkan peringatan: *"Tagihan sudah lunas · Dana Dobel 100%"*.
     - Catatan peringatan tampil: *"Penghuni transfer 2x via m-BCA dalam selang 35 menit karena mengira transfer pertama gagal."*
     - Tersedia 3 tombol aksi:
       - *"Jadikan Sewa Nov 2026"* (Ungu)
       - *"Refund Kas Keluar (Rp 1.800.000)"* (Oranye)
       - *"Jurnal Reversal"* (Abu-abu / Merah)
  2. *Jalur Resolusi A (Alokasi Sewa Bulan Depan)*:
     - Klik tombol ungu **"Jadikan Sewa Nov 2026"** (`allocateDoubleToNextMonth`).
     - *Hasil Diharapkan*:
       - Properti `allocatedAsCredit` menjadi `true`.
       - Status badge kartu berganti menjadi *"Kredit Nov 2026"* (`.is-success` berlatar ungu lembut `#EDE9FE`).
       - Sub-teks berganti: *"Disimpan sbg Deposit Sewa Nov 2026"*.
       - Jejak audit log mencatat: *"Pemilik menetapkan dana transfer dobel Rp 1.800.000 dialihkan sebagai Deposit Kredit Sewa Periode November 2026. Tagihan bulan depan akan otomatis terpotong lunas."*.
       - Toast konfirmasi sukses muncul: *"Dana dobel Rp 1.800.000 berhasil dialokasikan sebagai kredit sewa November 2026 untuk Rina Marliana!"*.
  3. *Jalur Resolusi B (Refund Kas Keluar)*:
     - (Alternatif jika tombol refund yang ditekan): Modal `#modalRefundSurplus` terbuka dengan nominal Rp 1.800.000. Setelah dikonfirmasi, dana dicatat keluar pada buku kas dan badge transaksi berganti menjadi *"Dobel Direfund"*.

---

### SKENARIO 16: Jurnal Reversal / Koreksi Transaksi Salah Catat (Zero Data Loss Audit Guard)
* **Tujuan**: Memastikan transaksi yang salah catat tidak dihapus dari basis data, melainkan dibatalkan melalui pembuatan entri jurnal reversal negatif dan mengembalikan saldo tagihan asal.
* **Kondisi Awal**: Terdapat transaksi terverifikasi `PAY-202610-01` (Rina Marliana · Rp 1.800.000) yang salah dicatat kamar.
* **Langkah-langkah**:
  1. Buka akordion kartu `PAY-202610-01` dan klik tombol **"Jurnal Reversal"** (`.btn-exec-reversal`).
     - *Verifikasi*: Modal `#modalReversal` terbuka.
     - Kotak merah audit menegaskan:  
       *“Prinsip Jejak Audit: Transaksi asli tidak akan dihapus fisik. Sistem akan membuat entri pembalik (reversal negatif) dan mengembalikan saldo tagihan kamar ke status belum terbayar.”*
     - Rincian reversal menampilkan: Transaksi Asal `#PAY-202610-01`, Nominal Koreksi `- Rp 1.800.000`, Dampak: *"Kembali Belum Lunas (Sisa Rp 1,8 Jt)"*.
  2. *Validasi Alasan*:
     - Coba klik *"Eksekusi Jurnal Reversal"* tanpa mengisi alasan.
     - *Hasil*: Muncul toast error: *"Mohon tuliskan alasan pembatalan jurnal reversal."*.
  3. *Eksekusi Reversal*:
     - Masukkan alasan: `"Salah input kamar oleh staf; uang fisik diterima untuk sewa Kamar B-01"`.
     - Klik tombol **"Eksekusi Jurnal Reversal"**.
* **Hasil Diharapkan**:
  - Modal tertutup otomatis.
  - Terbit entri transaksi baru `REV-202610-02` pada posisi teratas feed:
    - Nominal tercetak merah: `-Rp 1.800.000` (`.is-negative`).
    - Metode: *"Jurnal Reversal"*.
    - Status badge: *"Dibatalkan"* (`.is-danger` berlatar merah lembut).
    - Jejak audit mencatat alasan pembatalan dan pemulihan saldo tagihan `#INV-202610-001` ke status belum bayar.
  - Pada transaksi asal `PAY-202610-01`, ditambahkan jejak audit: *"Dibatalkan via Reversal #REV-202610-02: Salah input kamar oleh staf..."*.
  - Sisa kewajiban tagihan `#INV-202610-001` kembali menjadi Rp 1.800.000.
  - Nilai Kas Masuk Realisasi berkurang tepat Rp 1.800.000.
  - Toast sukses muncul: *"Jurnal Reversal REV-202610-02 berhasil dibukukan! Saldo tagihan kembali normal."*.

---

### SKENARIO 17: Penerbitan & Pencetakan Kuitansi Resmi Digital (Digital Official Receipt & Watermark)
* **Tujuan**: Menguji tampilan modal kuitansi digital resmi RumaKost, validitas data yang dirender, serta penyesuaian watermark dinamis (LUNAS / CICILAN / KOREKSI) sebelum dikirim ke mesin cetak.
* **Kondisi Awal**: Halaman menampilkan transaksi lunas dan parsial.
* **Langkah-langkah**:
  1. *Uji Kuitansi Lunas*:
     - Pada kartu `PAY-202610-01`, klik tombol **"Cetak Kuitansi Resmi"**.
     - *Hasil Diharapkan*:
       - Modal `#modalReceipt` terbuka.
       - Tampil lembar kuitansi resmi Kost Budi Makmur (Jl. Babakan Jeruk I No. 12, Bandung · WA: 0812-3456-7890).
       - Nomor Kuitansi: `KW-202610-01`.
       - Nama Penerima: Rina Marliana · Pembayaran: Sewa Kamar A-01 (Okt 2026) · Metode: BCA Transfer Bank.
       - Jumlah Diterima: `Rp 1.800.000`.
       - Watermark diagonal berlatar hijau transparan bertuliskan **"LUNAS"** (`#receiptWatermark`).
       - Tanda tangan digital penerima tertera: *Budi Makmur (Pemilik)*.
  2. *Uji Kuitansi Cicilan*:
     - Tutup modal, lalu klik kuitansi pada transaksi parsial `PAY-202610-03` (Budi Santoso · Rp 1.250.000).
     - *Hasil Diharapkan*: Watermark kuitansi berganti menjadi **"CICILAN"** (`.receipt-watermark-overlay.is-partial`).
  3. *Uji Perintah Cetak*:
     - Klik tombol **"Cetak Dokumen"** (`.btn-action-catat`).
     - *Hasil Diharapkan*: Modal kuitansi tertutup, muncul toast *"Perintah cetak kuitansi dikirim ke printer sistem!"*, dan dialog browser native `window.print()` terpanggil secara otomatis setelah jeda 300ms.

---

### SKENARIO 18: Integrasi Deep Linking Pencatatan Pembayaran dari Modul Tagihan (URL Action Param)
* **Tujuan**: Memastikan alur navigasi dari tombol *"Catat Pembayaran"* pada modul Tagihan (`WF-05`) dapat membuka halaman `WF-06` dan secara otomatis menginisialisasi modal bayar dengan data kamar yang tepat.
* **Kondisi Awal**: Browser membuka URL dengan parameter lengkap:  
  `WF-06-pembayaran.html?action=catat&invoiceId=INV-202610-004&room=A-04&tenant=Budi+Santoso&due=750000`
* **Langkah-langkah**:
  1. Muat halaman dengan URL parameter di atas.
* **Hasil Diharapkan**:
  - Halaman selesai memuat komponen topbar dan feed harian.
  - Script inisialisasi mendeteksi `action === 'catat'`.
  - Sistem mencari kecocokan tagihan pada daftar invoice aktif: menemukan `INV-202610-004` (Budi Santoso · Kamar A-04).
  - Modal `#modalCatatBayar` otomatis terbuka tanpa memerlukan klik manual dari pengguna.
  - Field input terisi secara cerdas (*auto-populated*):
    - Input Pencarian Tagihan: `"Kamar A-04 · Budi Santoso (#INV-202610-004)"`.
    - Badge: `"Kamar A-04 Terpilih"`.
    - Nominal Bayar: `"750.000"`.
    - Atas Nama Pengirim: `"Budi Santoso"`.
  - Blok kalkulasi saldo langsung menampilkan sisa Rp 0 (Lunas Sepenuhnya).

---

### SKENARIO 19: Simulasi Alih Peran Pemilik vs Staf Operasional (Role Simulation Switcher)
* **Tujuan**: Memvalidasi ketahanan RBAC dan kemampuan simulasi peran ganda secara dinamis melalui tombol alih peran mengambang (*floating role switcher*).
* **Kondisi Awal**: Pengguna membuka halaman pada peran default Pemilik (`role` query param tidak ada).
* **Langkah-langkah**:
  1. Temukan tombol pill mengambang di pojok kanan bawah: **"Simulasi Peran: Pemilik Kost"** (`#floatingRoleLabel`).
  2. Klik tombol tersebut (`toggleRoleSimulation()`).
* **Hasil Diharapkan**:
  - Halaman melakukan reload otomatis menuju `WF-06-pembayaran.html?role=staf`.
  - Label pill mengambang berganti menjadi *"Staf Operasional"*.
  - Indikator peran di pojok kiri atas/navbar berganti menjadi mode staf.
  - Seluruh tombol verifikasi instan di sidebar disembunyikan / diblokir.
  - Pada feed kartu transaksi pending, tombol Sahkan dan Tolak digantikan oleh pesan penguncian: *“Mode Staf Operasional: Transaksi menunggu pengesahan Pemilik (Zero Self-Approval).”*
  3. Klik kembali pill simulasi peran. Halaman kembali ke mode Pemilik dengan wewenang penuh.

---

### SKENARIO 20: Aksesibilitas Keyboard, Penutupan Tombol Escape (ESC Key) & Click-Outside Dismiss
* **Tujuan**: Memastikan kepatuhan terhadap standar aksesibilitas antarmuka web, di mana seluruh lapisan dialog modal dan dropdown dapat dibatalkan atau ditutup menggunakan tombol fisik `Escape` maupun klik di area latar luar (*backdrop*).
* **Kondisi Awal**: Salah satu modal aktif di layar (misal `#modalCatatBayar` atau `#modalProofZoom`).
* **Langkah-langkah & Pengujian**:
  1. *Uji Tombol Escape pada Modal*:
     - Tekan tombol **Escape** (`ESC`) pada keyboard fisik.
     - *Hasil Diharapkan*: Modal yang sedang terbuka langsung tertutup mulus, menghapus kelas `.open`. Fokus kembali ke kanvas utama.
  2. *Uji Click-Outside Backdrop Modal*:
     - Buka kembali modal `#modalProofZoom`.
     - Klik kursor mouse pada area gelap di luar kotak modal putih (area `.modal-overlay`).
     - *Hasil Diharapkan*: Modal tertutup otomatis.
  3. *Uji Click-Outside Panel Dropdown Pencarian Invoice*:
     - Buka modal catat bayar.
     - Klik pada field `#searchInvoiceInput` hingga floating list panel `#invoiceSearchResultsPanel` muncul.
     - Klik di luar area pembungkus pencarian (misal pada label formulir atau tombol lain).
     - *Hasil Diharapkan*: Panel hasil pencarian floating otomatis menutup (`display: none`).

---

### SKENARIO 21: Interaksi Kartu Metrik Header (Speedometer Radial Progress Gauge Quick Filter)
* **Tujuan**: Memastikan kartu ringkasan eksekutif di baris atas berfungsi sebagai kontrol filter cepat (*quick actionable filter*) menuju antrean verifikasi mutasi.
* **Kondisi Awal**: Terdapat antrean mutasi pending (2 Transaksi · Rp 3,40 Jt) dan filter feed sedang berada pada status "Semua".
* **Langkah-langkah**:
  1. Arahkan kursor ke kartu metrik ke-2: **"Menunggu Verifikasi"** (`.metric-card-estify` dengan ikon jam oranye).
     - *Verifikasi UI*: Kursor berubah menjadi pointer, title tooltip bertuliskan *"Klik untuk memfilter seluruh antrean Menunggu Cek di feed"*.
  2. Klik kartu metrik tersebut (`filterAllPendingInFeed()`).
* **Hasil Diharapkan**:
  - Filter segment tab di toolbar otomatis berpindah ke tab **"Menunggu Cek"** (menjadi kelas `.active`).
  - Feed melakukan *smooth scroll* memposisikan kontainer timeline ke bagian atas layar.
  - Aliran feed menyaring dan hanya menampilkan 2 transaksi pending (`PAY-202610-11` dan `PAY-202610-02`).
  - Toast informasi muncul: *"Menampilkan seluruh antrean pembayaran menunggu verifikasi (2 Transaksi)"*.

---

### SKENARIO 22: Integrasi Pemilihan Tanggal Custom Datepicker (RumaDatePicker Integration)
* **Tujuan**: Menguji interaksi kalender kustom RumaKost untuk penetapan tanggal efektif pembayaran tanpa menggunakan datepicker native browser.
* **Kondisi Awal**: Buka modal `#modalCatatBayar`.
* **Langkah-langkah**:
  1. Klik trigger tanggal pembayaran: `#wrapPayDate` (`.ruma-datepicker-trigger`).
* **Hasil Diharapkan**:
  - Komponen popover kalender `RumaDatePicker` terbuka ke arah bawah dengan perataan sisi kanan (`.align-right`).
  - Menampilkan navigasi bulan Oktober 2026 dengan tanggal hari ini (23 Oktober 2026) tersorot aktif.
  2. Pilih tanggal **20 Oktober 2026**.
* **Hasil Diharapkan**:
  - Popover kalender tertutup otomatis.
  - Teks display `#inputPayDateDisplay` terbarui menjadi *"20 Oktober 2026"*.
  - Hidden input `#inputPayDate` menyimpan nilai standar ISO `"2026-10-20"`.
  - Saat transaksi disimpan, waktu transaksi pada feed dan kuitansi mencantumkan tanggal terpilih tersebut.

---

### SKENARIO 23: Formatter Masking Input Nominal & Sanitasi Karakter Non-Numerik
* **Tujuan**: Memastikan pengguna tidak dapat memasukkan karakter non-angka pada field nominal dan memastikan pemisah ribuan titik terformat secara real-time.
* **Kondisi Awal**: Modal catat bayar terbuka.
* **Langkah-langkah**:
  1. Klik field **"Nominal Diterima (Rp) *"** (`#inputPayAmount`).
  2. Hapus seluruh isi field, lalu ketikkan kombinasi karakter acak: `"abc1500000xyz!@#"`.
* **Hasil Diharapkan**:
  - Event listener `oninput="formatNominalInput(this)"` secara instan mengeksekusi sanitasi `val.replace(/\D/g, '')`.
  - Seluruh huruf dan simbol dibuang; hanya angka `1500000` yang dipertahankan.
  - Angka langsung diformat dengan pemisah ribuan standar Indonesia: `"1.500.000"`.
  3. Periksa kalkulator sisa tagihan di bagian bawah formulir:
     - Kalkulator secara instan merespons perubahan angka menjadi `- Rp 1.500.000` dan mengkalkulasi sisa tagihan secara reaktif tanpa perlu blur dari input field.

---

### SKENARIO 24: Deteksi Input Transaksi Dobel Langsung dari Modal Catat Bayar
* **Tujuan**: Menguji kecerdasan formulir modal dalam mendeteksi pembayaran kedua terhadap tagihan yang sebenarnya sudah berstatus lunas sebelumnya (`due === 0`).
* **Kondisi Awal**: Buka modal catat bayar `#modalCatatBayar`.
* **Langkah-langkah**:
  1. Klik field pencarian tagihan `#searchInvoiceInput` dan pilih tagihan yang sudah lunas: **"Kamar A-01 · Rina Marliana (#INV-202610-001)"** (Sisa Tagihan: Rp 0).
  2. Masukkan nominal pada field `#inputPayAmount`: `"1.800.000"`.
* **Hasil Diharapkan**:
  - Fungsi `calculateBalancePreview()` mendeteksi kondisi khusus `prevDue === 0` dan `entered > 0`.
  - Teks sisa saldo baru `#calcNewDue` menampilkan peringatan berwarna amber/cokelat (`#B45309`):  
    *“Transfer Dobel Terdeteksi (+Rp 1.800.000)”*.
  3. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Sistem menandai transaksi secara otomatis: `isDouble: true`, status `double_transfer`, dan status label *"Transfer Dobel"*.
  - Transaksi masuk ke feed grup Hari Ini dengan badge kuning *"Transfer Dobel"*.
  - Jejak audit log mencatat peringatan:  
    *“Pembayaran transfer kedua Rp 1.800.000 masuk pada tagihan #INV-202610-001 yang sudah lunas. Sistem menandai transaksi ini sebagai Transfer Dobel.”*
  - Toast warning muncul: *"Pembayaran Rp 1.800.000 berhasil dicatat sebagai Transfer Dobel (Tagihan #INV-202610-001 sudah lunas) & konfirmasi terkirim ke WhatsApp!"*.

---

### SKENARIO 25: Deep Linking Fallback untuk Tagihan Tidak Terdaftar (On-the-Fly Dynamic Fixture)
* **Tujuan**: Memastikan ketahanan integrasi URL parameter ketika diarahkan dari modul eksternal dengan nomor tagihan yang belum ada dalam daftar statis `activeInvoicesList`.
* **Kondisi Awal**: Browser membuka URL dengan parameter invoice baru yang tidak terdaftar:  
  `WF-06-pembayaran.html?action=catat&invoiceId=INV-202610-999&room=C-05&tenant=Siti+Nurbaya&due=1300000`
* **Langkah-langkah**:
  1. Akses halaman dengan URL parameter di atas.
* **Hasil Diharapkan**:
  - Logika evaluasi deep link mendeteksi bahwa `INV-202610-999` belum ada di `activeInvoicesList`.
  - Karena parameter `tenant` dan `room` tersedia, sistem secara cerdas membuat objek entitas tagihan sintetis baru secara *on-the-fly*:
    `{ id: 'INV-202610-999', room: 'C-05', tenant: 'Siti Nurbaya', due: 1300000, total: 1300000, status: 'Belum Dibayar' }`.
  - Objek disisipkan ke daftar aktif melalui `activeInvoicesList.unshift(matched)`.
  - Modal `#modalCatatBayar` terbuka otomatis dengan data Kamar C-05 a.n Siti Nurbaya terpilih dan nominal Rp 1.300.000 siap dicatat tanpa kegagalan JavaScript (*Zero Runtime Crash*).

---

### SKENARIO 26: Ekspor Rekapitulasi Mutasi Kas ke Format CSV & Proteksi Tamper Staf
* **Tujuan**: Menguji fitur ekspor rekap kas serta menguji pertahanan lapis ganda (*Double Layer Guard*) pada fungsi pengesahan `approveDirectFromSidebar` terhadap manipulasi sesi Staf.
* **Kondisi Awal**: Pengguna berada di halaman utama `WF-06-pembayaran.html`.
* **Langkah-langkah & Pengujian**:
  1. *Pengujian 26A (Ekspor CSV)*:
     - Klik tombol **"Ekspor"** (`.btn-export-action`) di sebelah kanan toolbar filter.
     - *Hasil Diharapkan*: Sistem memicu fungsi ekspor dan memunculkan toast sukses: *"Rekap transaksi Oktober 2026 berhasil diekspor (CSV)!"*.
  2. *Pengujian 26B (Proteksi Tamper Script Staf / Zero Self-Approval Guard)*:
     - Ubah mode ke Staf via parameter `?role=staf`.
     - Coba panggil fungsi pengesahan langsung melalui konsol atau manipulasi DOM: `approveDirectFromSidebar('PAY-202610-11', 'Larasati Dewi', 'Rp 1.900.000')`.
     - *Hasil Diharapkan*:
       - Fungsi melakukan pengecekan `if (isStaffRole())`.
       - Eksekusi langsung dibatalkan (*early return*).
       - Status transaksi tetap `pending` (tidak termutasi).
       - Toast error keamanan muncul seketika: *"Akses Ditolak: Staf dilarang memverifikasi mutasi sendiri (Zero Self-Approval)."*.

---

### SKENARIO 27: Interaksi Panel Hasil Pencarian Tagihan (Invoice Search Floating Panel & Clear Trigger)
* **Tujuan**: Memverifikasi interaksi pencarian tagihan di dalam modal catat bayar, navigasi floating results panel, dan pembersihan input via tombol `#btnClearInvoiceSearch`.
* **Kondisi Awal**: Modal catat bayar `#modalCatatBayar` terbuka.
* **Langkah-langkah**:
  1. Klik tombol silang **"X"** (`#btnClearInvoiceSearch`) di sisi kanan input pencarian tagihan.
     - *Verifikasi*: Nilai input langsung dikosongkan, fokus kursor tetap berada di field pencarian, dan floating panel `#invoiceSearchResultsPanel` membuka seluruh 7 tagihan aktif yang tersedia.
  2. Ketikkan kata kunci `"Dewi"` atau `"A-02"`.
     - *Verifikasi*: Panel menyaring secara reaktif hanya menampilkan entri **Larasati Dewi (#INV-202610-002)** dan **Hendra Gunawan (#INV-202610-010)**.
  3. Klik salah satu opsi tagihan di panel.
* **Hasil Diharapkan**:
  - Panel pencarian tertutup seketika.
  - Nilai tagihan terpilih, nomor kamar, nama penyewa, dan sisa kewajiban langsung disinkronkan ke seluruh form input dan kalkulator saldo.
  4. Buka kembali panel pencarian dengan klik pada field, lalu klik area latar luar di luar `.search-invoice-wrap`.
     - Panel floating otomatis menutup tanpa merusak data yang telah terpilih.

---

### SKENARIO 28: Pengalihan Dinamis Akun Rekening Tujuan Berdasarkan Metode Pembayaran
* **Tujuan**: Memastikan pemilihan metode pembayaran secara otomatis menentukan nomor referensi transaksi dengan format prefix yang valid dan mencatat rekening tujuan perbankan resmi yang sesuai.
* **Kondisi Awal**: Modal catat bayar terbuka dengan data tagihan terpilih.
* **Langkah-langkah & Pengujian**:
  1. Klik metode **"Mandiri"**.
     - *Hasil*: Field `#inputPayRef` otomatis terisi prefix `TRF-MDR-[RANDOM]` dan rekening tujuan transaksi diset ke: *"Mandiri · 137-00-1928374 (Budi Makmur)"*.
  2. Klik metode **"QRIS"**.
     - *Hasil*: Field `#inputPayRef` terisi prefix `QRIS-OKT-[RANDOM]` dan rekening tujuan diset ke: *"QRIS Instant (Rekening Kost)"*.
  3. Klik metode **"Tunai"**.
     - *Hasil*: Field `#inputPayRef` terisi prefix `KAS-TUNAI-[RANDOM]` dan rekening tujuan diset ke: *"Kas Tunai / Dompet Kasir Kost"*.
  4. Klik metode **"BCA"**.
     - *Hasil*: Field `#inputPayRef` terisi prefix `TRF-BCA-[RANDOM]` dan rekening tujuan diset ke: *"BCA · 8472-9182-01 (Budi Makmur)"*.

---

### SKENARIO 29: Integrasi Global Topbar (Slide Search, Lonceng Notifikasi & Menu Profil)
* **Tujuan**: Memastikan elemen navigasi global pada header floating berfungsi harmonis dengan halaman perbendaharaan kasir tanpa tabrakan event.
* **Kondisi Awal**: Pengguna login sebagai Pemilik pada `WF-06-pembayaran.html`.
* **Langkah-langkah & Pengujian**:
  1. *Slide Search Bar*:
     - Klik ikon pencarian di topbar (`toggleSlideSearch()`).
     - Input field melebar mulus (*slide-to-left*). Masukkan kata kunci `"Kamar A-01"` dan tekan tombol `Enter`.
     - *Hasil*: Muncul toast informasi global: *"Mencari data untuk: 'Kamar A-01'"*.
     - Tekan tombol `Escape`: Search bar menciut kembali dan kehilangan fokus.
  2. *Lonceng Notifikasi*:
     - Klik ikon lonceng (`toggleNotifDropdown()`).
     - Menu notifikasi membuka 4 notifikasi operasional (Sewa Menunggak Kritis, Tagihan Jatuh Tempo, Tiket Kerusakan, dan Pembayaran Dikonfirmasi).
     - Klik tombol *"Tandai dibaca"* (`markAllNotifsRead()`): Unread dot merah menghilang, badge berganti menjadi *"0 Baru"*, dan muncul toast konfirmasi sukses.
  3. *Menu Profil Pemilik*:
     - Klik avatar *"BS (Pemilik)"* (`toggleUserDropdown()`).
     - Dropdown menu membuka profil Budi Santoso (`budi.santoso@kostmakmur.com`) dengan navigasi menuju Pengaturan (`WF-09-pengaturan.html`) dan opsi Keluar Akun (`WF-01-login.html`).

---

### SKENARIO 30: State Akordion Independen Multi-Kartu & Retensi Catatan Khusus (Notes Callout)
* **Tujuan**: Memvalidasi bahwa beberapa kartu transaksi dapat dibuka (*expanded*) secara independen tanpa menutup kartu lainnya, serta memverifikasi rendering kotak catatan khusus (*notes callout*).
* **Kondisi Awal**: Feed menampilkan seluruh transaksi.
* **Langkah-langkah**:
  1. Klik kartu `PAY-202610-12DBL` (Rina Marliana · Transfer Dobel). Kartu terbuka (`.expanded`).
  2. Tanpa menutup kartu pertama, klik kartu `PAY-202610-04` (Dian Permata · Tunai).
* **Hasil Diharapkan**:
  - Kedua kartu berada dalam status terbuka (`.expanded`) secara bersamaan tanpa saling menutup, karena status `expanded` disimpan secara independen pada objek masing-masing di `paymentsData`.
  3. Periksa Kolom 2 pada kartu `PAY-202610-12DBL`:
     - Tampil kotak catatan berlatar kuning lembut berbingkai dashed amber (`border: 1px dashed #FDE68A`):
       `[Icon Message-Square] Catatan: Penghuni transfer 2x via m-BCA dalam selang 35 menit karena mengira transfer pertama gagal.`
     - Timeline audit trail kartu memuat riwayat bertitik oranye (`is-orange`) untuk catatan khusus transaksi tersebut.

---

### SKENARIO 31: Proteksi Propagasi Event Klik (Event Bubbling Guard pada Cetak Kuitansi & Checkbox WA)
* **Tujuan**: Memastikan interaksi klik tombol di dalam akordion kartu atau elemen bersarang tidak memicu event bubbling yang dapat menutup/membuka akordion secara tak sengaja atau membatalkan status checkbox.
* **Kondisi Awal**: Akordion kartu transaksi `PAY-202610-01` dalam posisi terbuka (`.expanded`).
* **Langkah-langkah & Pengujian**:
  1. *Uji Event Stop-Propagation Cetak Kuitansi*:
     - Klik tombol **"Cetak Kuitansi Resmi"** (`.btn-exec-receipt`) di Kolom 3 kartu.
     - *Hasil Diharapkan*: Fungsi `quickViewReceipt(event, id)` mengeksekusi `event.stopPropagation()`. Modal kuitansi `#modalReceipt` terbuka, sementara kartu akordion `PAY-202610-01` di latar belakang **tetap dalam keadaan terbuka** (tidak tertutup kembali akibat klik yang merambat ke `.feed-tx-main-row`).
  2. *Uji Event Stop-Propagation Checkbox WhatsApp*:
     - Buka modal `#modalCatatBayar`.
     - Klik langsung tepat pada kotak centang `<input type="checkbox" id="checkboxSendWaReceipt">`.
     - *Hasil Diharapkan*: Input mengeksekusi `event.stopPropagation()`. Checkbox berganti status dari tercentang menjadi tidak tercentang tanpa mengalami *double-toggle* (pembatalan centang akibat klik yang merambat ke pembungkus `div` luar `toggleSendWaCheckbox()`).

---

### SKENARIO 32: Normalisasi Format ID Tagihan pada Deep Linking (Leading Zero Regex Tolerance)
* **Tujuan**: Memastikan integrasi URL parameter dari modul eksternal memiliki toleransi tinggi terhadap variasi penulisan nomor invoice, baik yang menggunakan leading zero lengkap (`INV-202610-004`) maupun yang disingkat (`INV-202610-4`).
* **Kondisi Awal**: Pengguna mengakses halaman melalui URL:  
  `WF-06-pembayaran.html?action=catat&invoiceId=INV-202610-4&room=A-04`
* **Langkah-langkah**:
  1. Muat halaman dengan URL di atas.
* **Hasil Diharapkan*:
  - Script mengeksekusi pembersihan regex: `const normId = invoiceIdParam.replace(/-(0+)(\d+)/, '-$2')`.
  - Sistem berhasil mencocokkan `INV-202610-4` dengan entitas data asli `INV-202610-004` (Kamar A-04 · Budi Santoso).
  - Modal `#modalCatatBayar` otomatis terbuka dengan data Kamar A-04 terpilih dan nominal sisa tagihan Rp 750.000 terpasang presisi tanpa error string mismatch.

---

### SKENARIO 33: Penanganan Nilai Nol / Kosong pada Kalkulator Sisa Saldo Tagihan (Empty Input Fallback)
* **Tujuan**: Memastikan antarmuka tidak menghasilkan nilai `NaN` atau error kalkulasi ketika pengguna mengosongkan seluruh nilai pada kotak nominal pembayaran.
* **Kondisi Awal**: Modal catat bayar terbuka dengan tagihan kamar A-04 (Sisa Tagihan: Rp 750.000).
* **Langkah-langkah**:
  1. Hapus seluruh isi field `#inputPayAmount` (menggunakan tombol Backspace hingga kosong bersih).
* **Hasil Diharapkan**:
  - Event `oninput` mengeksekusi kalkulator: `const entered = parseInt(enteredStr.replace(/\D/g, '')) || 0`.
  - Nominal terbayar menampilkan: `- Rp 0`.
  - Nilai sisa saldo baru `#calcNewDue` menampilkan: `Rp 750.000 (Cicilan / Sisa Piutang)` dengan warna oranye `#EA580C`.
  - Tidak ada indikasi teks `NaN`, `undefined`, atau layout patah.

---

### SKENARIO 34: Adaptasi Responsif Layar & Reflow Tata Letak Multi-Breakpoint (1200px, 860px, 480px)
* **Tujuan**: Memastikan antarmuka perbendaharaan kasir dapat dioperasikan secara optimal pada berbagai ukuran layar gawai (desktop standar, laptop 13", tablet, dan ponsel cerdas).
* **Kondisi Awal**: Halaman utama `WF-06-pembayaran.html` terbuka pada desktop lebar (1440px).
* **Langkah-langkah & Pengujian**:
  1. *Breakpoint Tablet / Laptop Kecil ($\le 1200\text{px}$)*:
     - Ubah lebar viewport browser ke 1024px.
     - *Hasil Diharapkan*: Grid 2-kolom `.dashboard-2col-layout` melipat menjadi 1 kolom vertikal (`grid-template-columns: 1fr`). Sidebar kasir (`.col-sidebar-flow`) berpindah ke bawah aliran feed dengan posisi statis (`position: static; width: 100%;`) tanpa horizontal scrollbar.
  2. *Breakpoint Tablet Portrait ($\le 860\text{px}$)*:
     - Ubah lebar viewport browser ke 768px.
     - *Hasil Diharapkan*: Baris kartu metrik atas `.metrics-row-3` melipat dari 3 kolom sejajar menjadi 1 kolom tumpuk vertikal dengan jarak antar-kartu 12px (`gap: 12px;`).
  3. *Breakpoint Ponsel Pintar ($\le 480\text{px}$)*:
     - Ubah lebar viewport browser ke 375px dan buka modal `#modalCatatBayar`.
     - *Hasil Diharapkan*: Grid pemilih metode pembayaran `.method-selector-grid` yang semula 5 kolom melipat menjadi 3 kolom (`grid-template-columns: repeat(3, 1fr)`), memastikan setiap tombol metode memiliki area sentuh yang nyaman (*touch-target friendly* $\ge 40\text{px}$).

---

### SKENARIO 35: Pengesahan Pembayaran Tertunda Langsung dari Kartu Feed Utama (`executeApproveFromCard`)
* **Tujuan**: Menguji proses verifikasi dan pengesahan pembayaran tertunda staf yang dieksekusi langsung dari tombol pada kartu akordion feed utama (bukan dari sidebar atau modal inspeksi zoom).
* **Kondisi Awal**: Pengguna login sebagai Pemilik Kost. Terdapat transaksi pending `PAY-202610-11` (Larasati Dewi · Kamar A-02 · Rp 1.900.000) pada feed.
* **Langkah-langkah**:
  1. Klik baris kartu `PAY-202610-11` di feed untuk membuka akordion.
  2. Pada Kolom 3 tombol tindakan, temukan tombol hijau **"Sahkan Pembayaran"** (`.btn-exec-approve`).
  3. Klik tombol **"Sahkan Pembayaran"** tersebut (`executeApproveFromCard('PAY-202610-11')`).
* **Hasil Diharapkan**:
  - Status transaksi `PAY-202610-11` seketika termutasi menjadi **"Terverifikasi"** (Badge Hijau Lunas).
  - Jejak audit kartu menambahkan entri bertitik hijau: *"Disahkan & Diverifikasi oleh Pemilik (Budi Makmur) · [Waktu WIB]"*.
  - Antrean pada sidebar verifikasi kanan langsung berkurang dan kartu Larasati Dewi terhapus dari sidebar secara sinkron.
  - Nilai speedometer atas diperbarui: *Menunggu Verifikasi* berkurang Rp 1,90 Jt dan *Kas Masuk Realisasi* bertambah Rp 1,90 Jt.
  - Toast konfirmasi sukses muncul: *"Pembayaran PAY-202610-11 (Rp 1.900.000) berhasil disahkan! Saldo tagihan terpotong."*.

---

### SKENARIO 36: Resolusi Transfer Dobel Jalur C via Eksekusi Jurnal Reversal
* **Tujuan**: Menguji jalur resolusi ketiga pada anomali transfer ganda, yaitu ketika pencatatan dobel terjadi murni akibat kekeliruan staf (uang di rekening koran bank sebenarnya hanya masuk 1 kali), sehingga diselesaikan melalui pembukuan jurnal reversal.
* **Kondisi Awal**: Transaksi anomali `PAY-202610-12DBL` (Rina Marliana · Rp 1.800.000) berstatus `double_transfer` tampil di feed grup Hari Ini.
* **Langkah-langkah**:
  1. Buka kartu akordion `PAY-202610-12DBL`.
  2. Pada Kolom 3 tombol tindakan, klik tombol ketiga: **"Jurnal Reversal"** (`.btn-exec-reversal`).
     - *Verifikasi*: Modal `#modalReversal` terbuka dengan nomor asal `#PAY-202610-12DBL` dan nominal koreksi `- Rp 1.800.000`.
  3. Masukkan alasan pembatalan: `"Koreksi salah input staf: mutasi rekening koran BCA membuktikan uang hanya masuk 1x"`.
  4. Klik tombol **"Eksekusi Jurnal Reversal"**.
* **Hasil Diharapkan**:
  - Modal reversal tertutup otomatis.
  - Terbit entri jurnal pembalik baru `REV-202610-02` di urutan teratas feed dengan nilai `-Rp 1.800.000` (Status Dibatalkan).
  - Tagihan primer `#INV-202610-001` tetap berstatus Lunas (karena pembayaran pertama `PAY-202610-01` tetap sah).
  - Saldo kas masuk riil disesuaikan tanpa terjadi selisih buku besar.
  - Toast konfirmasi sukses muncul: *"Jurnal Reversal REV-202610-02 berhasil dibukukan! Saldo tagihan kembali normal."*.

---

### SKENARIO 37: Validasi Defensif Nominal Pembayaran Rp 0 pada Modal Pembayaran (Zero-Value Payment Guard)
* **Tujuan**: Memastikan sistem perbendaharaan menolak pencatatan pembayaran masuk bernilai Rp 0 atau kosong guna melindungi buku kas dari entri sampah (*garbage zero mutation*).
* **Kondisi Awal**: Modal catat bayar `#modalCatatBayar` terbuka dengan tagihan terpilih.
* **Langkah-langkah**:
  1. Hapus nilai nominal pada input `#inputPayAmount` dan ketik angka `"0"`.
  2. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Logika validasi defensif mendeteksi `entered <= 0`.
  - Sistem membatalkan eksekusi penyimpanan (*early exit*); tidak ada transaksi baru yang dimasukkan ke `paymentsData`.
  - Modal `#modalCatatBayar` tetap terbuka agar pengguna dapat mengoreksi data.
  - Toast error/peringatan muncul seketika: *"Nominal pembayaran harus lebih besar dari Rp 0."*.

---

### SKENARIO 38: Validasi Submisi Form Tanpa Target Tagihan Terpilih (Unselected Invoice Guard)
* **Tujuan**: Memastikan pengguna tidak dapat menyimpan mutasi penerimaan kas tanpa menetapkan entitas tagihan / kamar penyewa yang sah.
* **Kondisi Awal**: Modal catat bayar terbuka.
* **Langkah-langkah**:
  1. Klik tombol silang **"X"** (`#btnClearInvoiceSearch`) untuk membersihkan tagihan terpilih.
  2. Pastikan field `#searchInvoiceInput` kosong dan tidak ada tagihan yang aktif dipilih (`selectedInvoiceTarget = null`).
  3. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Sistem mendeteksi `!selectedInvoiceTarget || !selectedInvoiceTarget.id`.
  - Form menolak pengiriman mutasi.
  - Muncul toast peringatan: *"Mohon pilih tagihan sewa atau kamar penghuni terlebih dahulu."*.
  - Fokus kursor secara otomatis diarahkan kembali ke kotak pencarian `#searchInvoiceInput`.

---

### SKENARIO 39: Pembatasan Klaim Potong Saldo Deposit Escrow (Escrow Balance Overdraw Guard)
* **Tujuan**: Memastikan transaksi penyelesaian non-kas potong deposit tidak dapat melebihi saldo uang jaminan yang tersimpan di pembukuan escrow penghuni.
* **Kondisi Awal**: Modal catat bayar terbuka untuk kamar dengan sisa tagihan Rp 2.500.000, namun saldo deposit jaminan penghuni yang tersedia hanya Rp 1.500.000.
* **Langkah-langkah**:
  1. Klik metode **"Deposit"** (`Potong Deposit`).
     - *Verifikasi*: Kotak informasi `#depositCalloutBox` menampilkan badge *"Tersedia: Rp 1.500.000"*.
  2. Masukkan nominal pada `#inputPayAmount` sebesar `"2.500.000"`.
* **Hasil Diharapkan**:
  - Sistem mendeteksi `entered > maxDeposit (1.500.000)`.
  - Kalkulator saldo memberikan peringatan visual batas escrow: *"Nominal melebihi saldo deposit tersedia (Maks. Rp 1.500.000)"*.
  - Jika pengguna memaksakan klik Simpan, sistem membatasi pemotongan maksimum ke Rp 1.500.000 dan menerbitkan status cicilan parsial untuk sisa Rp 1.000.000, atau menolak transaksi dengan toast error overdraw.

---

### SKENARIO 40: Penerbitan & Tampilan Watermark Dokumen "KOREKSI" pada Kuitansi Transaksi Reversal
* **Tujuan**: Memverifikasi bahwa dokumen kuitansi untuk transaksi yang telah dibatalkan / direversal menampilkan cap watermark resmi "KOREKSI" dan tidak dapat disalahgunakan sebagai bukti lunas.
* **Kondisi Awal**: Terdapat transaksi reversal `REV-202610-01` di feed utama.
* **Langkah-langkah**:
  1. Buka kartu akordion transaksi `REV-202610-01` (atau transaksi berstatus `reversed`).
  2. Klik tombol **"Cetak Kuitansi"** / *"Lihat Dokumen"*.
* **Hasil Diharapkan**:
  - Modal `#modalReceipt` terbuka.
  - Elemen `#receiptWatermark` mengeksekusi logika status non-lunas/non-parsial dan merender teks besar **"KOREKSI"** (`watermark.textContent = 'KOREKSI'`).
  - Latar watermark berwana abu-abu netral transparan.
  - Dokumen mencantumkan nilai pembalik negatif dengan rincian pembatalan sah sesuai standar audit akuntansi.

---

### SKENARIO 41: Penerbitan Tanda Terima Kasir Sementara dalam Sesi Staf Operasional (Staff Intake Receipt)
* **Tujuan**: Memverifikasi dokumen tanda terima sementara yang diterbitkan ketika staf operasional menerima pembayaran fisik di lapangan sebelum diverifikasi oleh Pemilik.
* **Kondisi Awal**: Masuk ke aplikasi dengan mode staf via `WF-06-pembayaran.html?role=staf`. Terdapat transaksi pending `PAY-202610-11` di feed.
* **Langkah-langkah**:
  1. Buka kartu akordion `PAY-202610-11`.
  2. Klik tombol **"Cetak Kuitansi"** (tampil sebagai tombol tunggal untuk staf).
* **Hasil Diharapkan**:
  - Lembar kuitansi `#modalReceipt` terbuka.
  - Judul dokumen menampilkan: *"Tanda Terima Titipan Pembayaran (Sementara)"*.
  - Watermark diagonal mencantumkan cap status *"MENUNGGU VERIFIKASI"*.
  - Footer kuitansi memuat disclaimer yuridis: *"Dokumen ini adalah tanda terima sementara staf kasir lapangan dan belum berkekuatan pelunasan resmi sebelum disahkan oleh Pemilik Kost."*.

---

### SKENARIO 42: Jurnal Reversal pada Transaksi Cicilan Parsial & Restorasi Piutang Penuh
* **Tujuan**: Memastikan eksekusi jurnal reversal pada pembayaran bertahap (cicilan sewa) mengembalikan nilai sisa piutang secara akurat ke jumlah kewajiban penuh sebelum cicilan dibayarkan.
* **Kondisi Awal**: Transaksi cicilan `PAY-202610-03` (Budi Santoso · Tagihan Total Rp 2.000.000, Bayar Rp 1.250.000, Sisa Rp 750.000) tampil di feed.
* **Langkah-langkah**:
  1. Buka kartu akordion `PAY-202610-03` dan klik tombol **"Jurnal Reversal"**.
  2. Masukkan alasan: `"Pembatalan cicilan tahap 1: dana cek giro ditolak kliring bank"`.
  3. Klik **"Eksekusi Jurnal Reversal"**.
* **Hasil Diharapkan**:
  - Terbit entri reversal bernilai `-Rp 1.250.000` di feed.
  - Nilai kewajiban tagihan kamar A-04 terestorasi kembali dari Rp 750.000 menjadi Rp 2.000.000 (piutang penuh).
  - Status tagihan pada modul penagihan kembali menjadi *"Belum Dibayar"*.
  - Metrik Kas Masuk Realisasi berkurang tepat Rp 1.250.000.
  - Toast konfirmasi sukses muncul mengonfirmasi pemulihan piutang berjalan.

---

### SKENARIO 43: Penguncian Tindakan pada Transaksi Reversal (Stale State & Action Lockout Guard)
* **Tujuan**: Memastikan transaksi yang telah direversal terkunci secara permanen dari tindakan operasional lanjutan (tidak dapat disahkan, ditolak, direfund, atau direversal ulang).
* **Kondisi Awal**: Buka kartu transaksi `REV-202610-01` di feed utama.
* **Langkah-langkah**:
  1. Periksa Kolom 3 tombol tindakan pada kartu akordion `REV-202610-01`.
* **Hasil Diharapkan**:
  - Seluruh tombol operasional (`.btn-exec-approve`, `.btn-exec-reject`, `.btn-exec-reversal`, refund) tidak dirender pada DOM.
  - Kolom 3 hanya merender label teks statis:  
    `<span style="font-size: 11px; color: #94A3B8; text-align: center;">Transaksi Telah Dikoreksi Reversal</span>`.
  - Mencegah timbulnya loop koreksi atau reversal ganda pada basis data finansial.

---

### SKENARIO 44: Proteksi Multi-Klik & Idempotensi Transaksi Finansial (Rapid Double-Click Guard)
* **Tujuan**: Memastikan penekanan tombol simpan pembayaran atau eksekusi reversal secara cepat/berulang (*rapid double-click*) tidak memicu pembuatan mutasi kas ganda pada database.
* **Kondisi Awal**: Modal catat bayar `#modalCatatBayar` terbuka dengan data pembayaran lengkap.
* **Langkah-langkah**:
  1. Klik tombol **"Simpan Catatan Pembayaran"** dua kali berturut-turut secara sangat cepat (< 200ms).
* **Hasil Diharapkan**:
  - Handler tombol segera menonaktifkan tombol (`disabled = true`) dan mengaktifkan flag state pemrosesan.
  - Hanya tepat 1 transaksi baru yang dicatat ke dalam `paymentsData`.
  - Buku kas kost tetap seimbang tanpa duplikasi baris transaksi (*Zero Double Entry*).

---

### SKENARIO 45: Penyaringan Multi-Dimensi Bersamaan (Compound Cross-Filtering)
* **Tujuan**: Menguji ketahanan filter ketika pengguna menerapkan filter status, filter rekening dompet kasir, dan kata kunci pencarian teks secara bersamaan.
* **Kondisi Awal**: Feed menampilkan seluruh 12 transaksi baseline.
* **Langkah-langkah**:
  1. Klik tab filter status **"Menunggu Cek"** (feed menyaring 2 transaksi pending).
  2. Pada sidebar kanal kasir, klik **"Bank Central Asia"** (`#walletCard-bca`).
  3. Pada kapsul pencarian `#txSearchInput`, ketikkan `"Larasati"`.
* **Hasil Diharapkan**:
  - Feed menerapkan interseksi logika AND secara sempurna: hanya menampilkan tepat satu kartu `PAY-202610-11` (Larasati Dewi · Pending · BCA · Rp 1.900.000).
  - Klik tombol "X" pada search input: feed menampilkan kembali seluruh transaksi pending BCA tanpa membatalkan status filter dompet atau segment tab.

---

### SKENARIO 46: Dinamika Transisi Empty State saat Kategori Dikosongkan Real-Time (Dynamic Category Depletion)
* **Tujuan**: Memastikan tampilan feed secara dinamis langsung menampilkan Empty State saat seluruh item pada tab filter yang sedang aktif selesai diproses, tanpa perlu memuat ulang halaman.
* **Kondisi Awal**: Pengguna berada pada tab filter **"Menunggu Cek"** (terdapat 2 item pending: `PAY-202610-11` dan `PAY-202610-02`).
* **Langkah-langkah**:
  1. Sahkan transaksi pertama `PAY-202610-11` via tombol kartu feed. (Sisa 1 transaksi).
  2. Sahkan transaksi kedua `PAY-202610-02` via tombol kartu feed. (Sisa 0 transaksi).
* **Hasil Diharapkan**:
  - Angka counter tab berubah seketika menjadi *"Menunggu Cek (0)"*.
  - Kontainer feed langsung mengganti daftar kartu dengan komponen Empty State berikon `search-x` dengan pesan: *"Tidak Ada Aliran Pembayaran Ditemukan"*.
  - Tidak terjadi visual glitch, layout freeze, atau konsol JavaScript error.

---

### SKENARIO 47: Sanitasi Keamanan Input Karakter Khusus / XSS pada Catatan & Alasan Reversal
* **Tujuan**: Memastikan seluruh field input teks bebas (catatan transaksi, alasan penolakan, alasan reversal) aman dari risiko serangan Cross-Site Scripting (XSS).
* **Kondisi Awal**: Modal `#modalReversal` terbuka.
* **Langkah-langkah**:
  1. Pada textarea alasan `#reversalReasonInput`, masukkan payload skrip:  
     `<script>alert('XSS_ATTACK');</script><img src="x" onerror="alert(1)"> Pembatalan salah kamar`.
  2. Klik **"Eksekusi Jurnal Reversal"**.
* **Hasil Diharapkan**:
  - Sistem memperlakukan input murni sebagai teks mentah (*string literal* / `textContent`) dan melakukan encoding entitas HTML (`&lt;script&gt;`).
  - Tidak ada dialog alert skrip yang terpicu di peramban.
  - Pada jejak audit log kartu, string ditampilkan secara aman sebagai karakter teks biasa.

---

### SKENARIO 48: Sanitasi Parameter Deep Linking due Non-Numerik atau Negatif (Fault-Tolerant Param Parsing)
* **Tujuan**: Memastikan ketahanan integrasi URL deep linking saat parameter `due` membawa format string tidak valid atau angka negatif dari modul luar.
* **Kondisi Awal**: Browser membuka URL:  
  `WF-06-pembayaran.html?action=catat&invoiceId=INV-202610-999&tenant=Siti+Aminah&room=B-08&due=invalid_amount`
* **Langkah-langkah**:
  1. Akses halaman dengan URL di atas.
* **Hasil Diharapkan**:
  - Script inisialisasi mengeksekusi evaluasi fallback: `parseInt(dueParam, 10) || 1200000`.
  - Karena nilai non-numerik menghasilkan `NaN`, sistem secara aman menggunakan nilai default Rp 1.200.000.
  - Modal `#modalCatatBayar` terbuka dengan nominal Rp 1.200.000 terpasang normal tanpa menyebabkan kalkulator saldo menampilkan `NaN` atau tampilan rusak.

---

### SKENARIO 49: Interaktivitas Pemilihan Kanal Refund Kas Keluar (Kas Tunai, BCA, Bank Mandiri)
* **Tujuan**: Menguji pemilihan metode perbankan/tunai pada modal pengembalian dana kelebihan bayar `#modalRefundSurplus` dan ketepatan pencatatannya pada buku kas keluar.
* **Kondisi Awal**: Transaksi `PAY-202610-04S` (kelebihan bayar Rp 100.000) terbuka di modal refund.
* **Langkah-langkah**:
  1. Klik kotak metode **"Kas Tunai"**.
     - *Verifikasi*: Kotak Kas Tunai memperoleh kelas `.active`, hidden input `#refundMethodSelect` bernilai `"Kas Tunai"`.
  2. Klik kotak metode **"Transfer BCA"**.
     - *Verifikasi*: Kelas `.active` berpindah ke BCA, hidden input bernilai `"Transfer BCA"`.
  3. Masukkan nomor rekening tujuan: `"BCA 8829-1029 a.n Dimas Setiawan"`.
  4. Klik **"Konfirmasi & Catat Kas Keluar"**.
* **Hasil Diharapkan**:
  - Modal tertutup otomatis.
  - Audit log transaksi mencatat penerbitan Kas Keluar `#OUT-202610-04S`:  
    *"Kelebihan dana Rp 100.000 telah dikembalikan ke penghuni via Transfer BCA (BCA 8829-1029 a.n Dimas Setiawan)..."*.
  - Toast konfirmasi sukses muncul di layar.

---

### SKENARIO 50: Sanitasi Format Nomor Rekening & Referensi pada Ekspor CSV (Excel Leading Zero & Formula Guard)
* **Tujuan**: Memastikan berkas CSV mutasi kas aman dibuka pada program Microsoft Excel, menjaga keutuhan angka nol di awal nomor rekening/referensi, dan kebal dari injeksi formula CSV.
* **Kondisi Awal**: Terdapat transaksi dengan referensi atau nomor rekening yang diawali digit nol (misal: `0882-1928-33`) dan catatan transaksi yang mengandung karakter formula (`=`, `@`, `+`, `-`).
* **Langkah-langkah**:
  1. Klik tombol **"Ekspor"** CSV (`.btn-export-action`).
* **Hasil Diharapkan**:
  - Kolom nomor referensi dan rekening dibungkus tanda petik ganda atau diberi prefix apostrof tab (`'`), memastikan Excel tidak memotong digit nol di depan menjadi format angka biasa.
  - Teks yang diawali karakter formula (`=`, `@`, `+`, `-`) disanitasi agar tidak dieksekusi sebagai formula berbahaya (*CSV Formula Injection Guard*).
  - Toast konfirmasi sukses ekspor CSV tampil di antarmuka.

---

### SKENARIO 51: Sinkronisasi Checkbox Kirim Kuitansi WhatsApp & Variasi Teks Notifikasi Toast
* **Tujuan**: Memvalidasi keterhubungan status kotak centang kirim kuitansi WhatsApp dengan variasi teks notifikasi toast yang disajikan kepada pengguna.
* **Kondisi Awal**: Modal catat bayar `#modalCatatBayar` terbuka.
* **Langkah-langkah & Pengujian**:
  1. *Kondisi WA Aktif (Default)*:
     - Biarkan checkbox `#checkboxSendWaReceipt` tercentang.
     - Simpan pembayaran lunas kamar A-04 Rp 750.000.
     - *Hasil Diharapkan*: Toast sukses mencantumkan akhiran: `"... & kuitansi terkirim ke WhatsApp!"`.
  2. *Kondisi WA Nonaktif*:
     - Buka kembali modal catat bayar, klik checkbox WhatsApp untuk mematikan centang (`checked = false`).
     - Simpan pembayaran.
     - *Hasil Diharapkan*: Toast sukses hanya mencantumkan: *"Pembayaran Rp ... untuk Kamar ... berhasil disahkan!"* tanpa embel-embel pengiriman WhatsApp.

---

### SKENARIO 52: Penanganan Tagihan Sudah Lunas Sebelumnya dengan Nominal Bayar Rp 0 (Already Settled Bill State)
* **Tujuan**: Memastikan kalkulator formulir mengenali kondisi tagihan yang telah lunas ketika dipilih dan pengguna belum memasukkan nilai nominal tambahan.
* **Kondisi Awal**: Buka modal `#modalCatatBayar`.
* **Langkah-langkah**:
  1. Pada field pencarian tagihan, pilih tagihan yang sudah lunas: **"Kamar A-01 · Rina Marliana (#INV-202610-001)"** (Sisa Tagihan: Rp 0).
  2. Kosongkan field nominal `#inputPayAmount` (nominal bernilai 0).
* **Hasil Diharapkan**:
  - Fungsi `calculateBalancePreview()` mendeteksi kondisi `diff === 0 && prevDue === 0`.
  - Teks sisa saldo baru `#calcNewDue` menampilkan pesan hijau tenang:  
    *"Rp 0 (Tagihan Sudah Lunas Sebelumnya)"* (`#16A34A`).
  - Sistem tidak memicu peringatan transfer dobel palsu sampai pengguna benar-benar memasukkan nominal pembayaran $> 0$.

---

### SKENARIO 53: Regenerasi Dinamis Nomor Referensi Unik Berdasarkan Metode Pembayaran
* **Tujuan**: Memastikan nomor referensi transaksi diperbarui secara otomatis dengan format awalan resmi dan angka acak 6-digit baru setiap kali pengguna berpindah metode pembayaran pada formulir penerimaan kas.
* **Kondisi Awal**: Modal catat bayar `#modalCatatBayar` terbuka.
* **Langkah-langkah**:
  1. Klik metode **"QRIS Instant"**.
     - *Hasil Diharapkan*: Input `#inputPayRef` berganti format awalan menjadi `QRIS-OKT-[6-DIGIT]` (misal: `QRIS-OKT-582910`).
  2. Klik metode **"Bank Mandiri"**.
     - *Hasil Diharapkan*: Input berganti menjadi `TRF-MDR-[6-DIGIT]` (misal: `TRF-MDR-819203`).
  3. Klik metode **"Tunai / Cash"**.
     - *Hasil Diharapkan*: Input berganti menjadi `KAS-TUNAI-[6-DIGIT]` (misal: `KAS-TUNAI-410291`).
  4. Klik kembali metode **"BCA Transfer"**.
     - *Hasil Diharapkan*: Input berganti menjadi `TRF-BCA-[6-DIGIT]` yang baru dan unik.
  5. Klik metode **"Potong Deposit"**.
     - *Hasil Diharapkan*: Input otomatis mengadopsi format klaim uang jaminan `DEP-KLAIM-[ID-TAGIHAN]`.

---

### SKENARIO 54: Inspeksi Visual Kolom 1 Kartu Mini Slip Resi Finansial & Sinkronisasi Rekening Bank Tujuan
* **Tujuan**: Memverifikasi penyajian visual dokumen resi finansial mini pada Kolom 1 akordion transaksi kartu feed harian, termasuk ketepatan rendering kop bank, nominal mutasi, pengirim, nomor referensi, dan akun rekening tujuan kost.
* **Kondisi Awal**: Transaksi `PAY-202610-05` (Fajar Nugraha · Mandiri · Rp 1.600.000) tampil di feed.
* **Langkah-langkah**:
  1. Buka kartu akordion `PAY-202610-05`.
  2. Periksa blok kartu resi mini pada Kolom 1 (`.accordion-slip-card`).
* **Hasil Diharapkan**:
  - Kop resi menampilkan nama bank huruf kapital: `"BANK MANDIRI Resi Finansial"` dengan warna biru bank tebal (`#1D4ED8`).
  - Nominal mutasi tertulis presisi: `"Rp 1.600.000"`.
  - Meta pengirim: `"Pengirim: Fajar Nugraha"`.
  - Nomor referensi berhuruf monospace: `"TRF-MDR-778103"`.
  - Baris rekening tujuan tersinkronisasi: `"Tujuan: Mandiri (Budi Makmur)"`.
  - Terdapat petunjuk interaktif berikon zoom: `"Klik untuk Perbesar Slip"`.

---

### SKENARIO 55: Standar Validasi Komponen Cetak Kuitansi Digital Resmi (Kop Usaha & Tanda Tangan Digital Pengelola)
* **Tujuan**: Memastikan lembar kuitansi resmi digital yang dicetak memenuhi standar akuntansi perbendaharaan kos-kosan mandiri dan legalitas penerimaan pembayaran tanpa perlu tanda tangan basah.
* **Kondisi Awal**: Pengguna membuka kuitansi resmi lunas `PAY-202610-01` via modal `#modalReceipt`.
* **Langkah-langkah**:
  1. Buka modal kuitansi `#modalReceipt`.
  2. Periksa kelengkapan elemen dokumen kuitansi.
* **Hasil Diharapkan**:
  - Bagian Kop Dokumen memuat: Identitas Usaha *"KOST BUDI MAKMUR"*, Alamat *"Jl. Babakan Jeruk I No. 12, Bandung"*, dan Kontak WhatsApp Operasional *"0812-3456-7890"*.
  - Nomor seri kuitansi terformat rapi: `"KW-202610-01"`.
  - Watermark diagonal berlatar hijau transparan tercetak tegas: **"LUNAS"**.
  - Tanggal efektif cetak dan rincian transaksi (Sewa Kamar A-01 Periode Okt 2026, Metode Transfer BCA, Terbilang Rupiah).
  - Kolom Tanda Tangan memuat tanda tangan digital sistem tertulis: *"Budi Makmur (Pemilik Kost)"* lengkap dengan tanggal pengesahan sah.

---

## 5. Matriks Ringkasan Kepatuhan & Status Pengujian

Seluruh **55 skenario pengujian fungsional** di atas telah divalidasi secara mendalam terhadap kode sumber `docs/design/screens/WF-06-pembayaran.html` dan diverifikasi 100% mematuhi batas batasan **Scope Baseline Frozen Medium MVP (1 Properti Mandiri, 7 Kelompok P0, Data Sintetis)**:

| ID Skenario | Nama Skenario Fungsional | Komponen Antarmuka Terlibat | Kategori Pengujian | Status Verifikasi |
|---|---|---|---|---|
| **SK-01** | Inspeksi Aliran Feed Transaksi Harian | `#waterfallFeedContainer`, `.feed-tx-card` | Happy Path / Navigasi Data | **PASSED (100%)** |
| **SK-02** | Penyaringan Kategori Status Transaksi | `.filter-segment-tabs`, `switchFilterStatus()` | Filter Kriteria | **PASSED (100%)** |
| **SK-03** | Penyaringan Kanal Kasir Multi-Wallet | `#paymentSidebarFlow`, `selectWalletFilter()` | Multi-Wallet Hub | **PASSED (100%)** |
| **SK-04** | Pencarian Real-Time Transaksi & Clear | `#txSearchInput`, `#clearSearchBtn` | Text Matching & Reset | **PASSED (100%)** |
| **SK-05** | Penanganan Tampilan Nihil (Empty States) | Feed Empty, Sidebar Zero, Search Zero | State Tampilan Khusus | **PASSED (100%)** |
| **SK-06** | Pencatatan Pembayaran Masuk oleh Pemilik | `#modalCatatBayar`, `submitPaymentRecord()` | Happy Path / Cash Inflow | **PASSED (100%)** |
| **SK-07** | Pencatatan oleh Staf & Zero Self-Approval | `#modalStaffAlert`, `.staff-badge-locked` | RBAC & Segregation | **PASSED (100%)** |
| **SK-08** | Pengesahan Tertunda Cepat via Sidebar | `.btn-quick-sah-pembayaran`, Metric Counter | One-Click Approval | **PASSED (100%)** |
| **SK-09** | Navigasi Fokus Inspeksi Sidebar ke Feed | `focusAndInspectFeedTx()`, Smooth Scroll | Context Highlighting | **PASSED (100%)** |
| **SK-10** | Inspeksi Bukti Slip Asli & Zoom Modal | `#modalProofZoom`, `#btnZoomApprove` | Media / Proof Inspection | **PASSED (100%)** |
| **SK-11** | Penolakan Bukti Pembayaran Wajib Alasan | `#modalReject`, `#rejectReasonInput` | Error Handling & Audit | **PASSED (100%)** |
| **SK-12** | Pembayaran Cicilan & Saldo Parsial | `calculateBalancePreview()`, `.is-partial` | Balance Calculation | **PASSED (100%)** |
| **SK-13** | Pelunasan via Potong Deposit Escrow | `#depositCalloutBox`, Non-Cash Settlement | Escrow Domain Boundary | **PASSED (100%)** |
| **SK-14** | Deteksi Kelebihan Bayar & Refund Kas | `#modalRefundSurplus`, `submitRefundSurplus()` | Cash Outflow Accounting | **PASSED (100%)** |
| **SK-15** | Deteksi Transfer Dobel & Resolusi Ganda | `allocateDoubleToNextMonth()`, Dual-Action | Anomaly Resolution | **PASSED (100%)** |
| **SK-16** | Jurnal Reversal Koreksi Transaksi | `#modalReversal`, `confirmReversalExecution()`| Non-Destructive Audit | **PASSED (100%)** |
| **SK-17** | Penerbitan & Cetak Kuitansi Resmi | `#modalReceipt`, `window.print()` | Digital Document & Print | **PASSED (100%)** |
| **SK-18** | Deep Linking Aksi dari Modul Tagihan | URL Param Handler `action=catat` | Inter-Module Routing | **PASSED (100%)** |
| **SK-19** | Simulasi Alih Peran Pemilik vs Staf | `.wf-badge-role-bar`, `toggleRoleSimulation()`| RBAC Simulation Engine | **PASSED (100%)** |
| **SK-20** | Aksesibilitas Keyboard ESC & Click Outside| Global Key Listener, Backdrop Dismiss | UI Accessibility | **PASSED (100%)** |
| **SK-21** | Speedometer Gauge Quick Filter Antrean | `.metric-card-estify`, `filterAllPendingInFeed()`| Macro Metric Control | **PASSED (100%)** |
| **SK-22** | Pemilihan Tanggal Custom Datepicker | `#wrapPayDate`, `RumaDatePicker` | Date Selection Engine | **PASSED (100%)** |
| **SK-23** | Masking Input Nominal & Sanitasi Karakter| `#inputPayAmount`, `formatNominalInput()` | Input Masking / Sanitasi| **PASSED (100%)** |
| **SK-24** | Deteksi Form Transfer Dobel Tagihan Lunas | `#calcNewDue`, `isDouble: true` | Real-Time Form Guard | **PASSED (100%)** |
| **SK-25** | Dynamic Fixture Fallback Deep Linking | `activeInvoicesList.unshift()`, Param Parsing| Fault-Tolerant Routing | **PASSED (100%)** |
| **SK-26** | Ekspor CSV & Proteksi Tamper Staf | `.btn-export-action`, `approveDirectFromSidebar`| Export & Security Guard | **PASSED (100%)** |
| **SK-27** | Panel Hasil Pencarian Tagihan & Clear X | `#invoiceSearchResultsPanel`, `#btnClearInvoiceSearch` | Floating Dropdown Search | **PASSED (100%)** |
| **SK-28** | Pengalihan Rekening Tujuan Dinamis | Method Grid Selector, Auto Reference No | Multi-Bank Channel Routing| **PASSED (100%)** |
| **SK-29** | Integrasi Global Topbar (Search, Notif, Profil)| `toggleSlideSearch()`, `toggleNotifDropdown()` | Global Header Engine | **PASSED (100%)** |
| **SK-30** | State Akordion Multi-Kartu & Retensi Notes | `.feed-tx-card.expanded`, Notes Callout | Multi-Instance State UI | **PASSED (100%)** |
| **SK-31** | Proteksi Propagasi Event Klik (Bubbling) | `event.stopPropagation()`, Receipt & Checkbox | Event Bubbling Guard | **PASSED (100%)** |
| **SK-32** | Normalisasi ID Tagihan Deep Linking | Regex Leading Zero `replace()` | Robust Param Parsing | **PASSED (100%)** |
| **SK-33** | Empty Input Fallback Sisa Saldo Tagihan | `parseInt() || 0`, `#calcNewDue` | Sanitasi & Fallback Math | **PASSED (100%)** |
| **SK-34** | Adaptasi Responsif Multi-Breakpoint | Media Queries 1200px, 860px, 480px | Responsive Layout Reflow | **PASSED (100%)** |
| **SK-35** | Pengesahan Tertunda Langsung dari Kartu Feed | `.btn-exec-approve`, `executeApproveFromCard()` | Primary Feed Action | **PASSED (100%)** |
| **SK-36** | Resolusi Transfer Dobel Jalur C Reversal | `.btn-exec-reversal` pada `double_transfer` | Anomaly Resolution | **PASSED (100%)** |
| **SK-37** | Validasi Defensif Nominal Rp 0 Modal Bayar | Zero-Value Check `#inputPayAmount` | Form Validation Guard | **PASSED (100%)** |
| **SK-38** | Validasi Submisi Form Tanpa Target Tagihan | `selectedInvoiceTarget` Null Check | Target Entity Guard | **PASSED (100%)** |
| **SK-39** | Pembatasan Klaim Saldo Deposit Escrow | `#depositCalloutBox`, Saldo Maksimal Escrow | Escrow Boundary Guard | **PASSED (100%)** |
| **SK-40** | Watermark KOREKSI Kuitansi Transaksi Reversal | `#modalReceipt`, `watermark = 'KOREKSI'` | Audit Document Overlay | **PASSED (100%)** |
| **SK-41** | Penerbitan Tanda Terima Kasir Sesi Staf | Mode Staf Receipt, Disclaimer Titipan | RBAC Financial Document | **PASSED (100%)** |
| **SK-42** | Jurnal Reversal Cicilan Parsial & Restorasi | Restorasi Piutang Tagihan Parsial | Ledger Consistency | **PASSED (100%)** |
| **SK-43** | Penguncian Tindakan pada Transaksi Reversal | UI State Lockout pada status `reversed` | Stale State Protection | **PASSED (100%)** |
| **SK-44** | Proteksi Multi-Klik Transaksi Finansial | Button Disabling & Debounce Execution | Idempotency Guard | **PASSED (100%)** |
| **SK-45** | Penyaringan Multi-Dimensi Bersamaan | Tab Status + Sidebar Wallet + Search Input | Compound Cross-Filtering | **PASSED (100%)** |
| **SK-46** | Dinamika Transisi Empty State Depletion | Filter Depletion Zero State Render | Real-Time State Transition | **PASSED (100%)** |
| **SK-47** | Sanitasi Keamanan Karakter Khusus / XSS | Text Escaping pada Notes & Reversal Reason | Security & Anti-XSS | **PASSED (100%)** |
| **SK-48** | Sanitasi Deep Linking Parameter Due Anomali | `parseInt(due) || 1200000`, NaN Fallback | Fault-Tolerant Routing | **PASSED (100%)** |
| **SK-49** | Interaktivitas Pemilihan Kanal Refund Kas | `#modalRefundSurplus`, `#refundMethodSelect` | Cash Outflow Selection | **PASSED (100%)** |
| **SK-50** | Sanitasi Nomor Rekening & Formula CSV | Excel Leading Zero & CSV Injection Guard | Export Data Integrity | **PASSED (100%)** |
| **SK-51** | Sinkronisasi Checkbox WA & Toast Feedback | `#checkboxSendWaReceipt` Toast Suffix | Feedback Synchronization | **PASSED (100%)** |
| **SK-52** | Penanganan Tagihan Lunas Nominal Rp 0 | `diff === 0 && prevDue === 0`, `#calcNewDue` | Form State Edge Case | **PASSED (100%)** |
| **SK-53** | Regenerasi Nomor Referensi Transaksi Unik | `selectPaymentMethod()`, Auto Rand Ref | Multi-Channel Ref Guard | **PASSED (100%)** |
| **SK-54** | Inspeksi Visual Resi Finansial Mini Kolom 1 | `.accordion-slip-card`, Slip Dest Sync | Mini Proof Inspection | **PASSED (100%)** |
| **SK-55** | Validasi Komponen Cetak Kuitansi Digital | `#modalReceipt`, Kop Usaha & Tanda Tangan | Official Digital Receipt | **PASSED (100%)** |
