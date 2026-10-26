# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-05: Matriks Penagihan Sewa Bulanan & Digital Paper Invoice Dossier (SCR-09 & SCR-10)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: `docs/design/screens/WF-05-tagihan.html`  
> **Fitur Terkait**: **F-04** (Tagihan Berulang & Penagihan Sewa Bulanan), **F-05** (Pembayaran, Saldo Parsial, Rekonsiliasi & Riwayat Transaksi), **F-03** (Penghuni & Siklus Kontrak Sewa)  
> **User Stories KANBAN**: `RK-004` (Epic Pembuatan dan Pemantauan Tagihan), `RK-027` (Pembuatan Tagihan Bulanan Otomatis & Insidental), `RK-028` (Daftar & Filter Status Tagihan), `RK-029` (Pencatatan Status Penyampaian Tagihan Manual WA), `RK-005` (Epic Pembayaran, Saldo Parsial & Riwayat), `RK-030` (Pencatatan Klaim Pembayaran Masuk), `RK-031` (Verifikasi Pembayaran & Zero Self-Approval), `RK-032` (Perhitungan Saldo Pembayaran Parsial), `RK-033` (Koreksi & Pembatalan Tagihan via Void Invoice), `RK-035` (Ringkasan Arus Kas Masuk & Piutang Berjalan)  
> **Hak Akses Layar**: **Pemilik Properti (Owner)** & **Staf Pengelola (Staff)** *(Penghuni diisolasi pada Portal Penghuni `WF-10` / `SCR-P02`)*  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-05 (`SCR-09` & `SCR-10`)** adalah pusat kendali penagihan (*Billing Command Center*) sistem RumaKost yang mengintegrasikan pengawasan piutang sewa, verifikasi penerbitan invoice berkala, penyesuaian biaya (diskon & add-ons), pencatatan penerimaan pembayaran tunai/transfer, hingga siaran pengingat WhatsApp manual dalam satu ruang kerja terpadu.

Layar ini dirancang dengan filosofi **Estify Minimalist DNA** dan tata letak **Asymmetric Split Workbench (65% : 35%)**:
- **Kolom Kiri (SCR-09 Master Billing Ledger)**: Menampilkan tabel ringkasan 11 unit kamar aktif dan 3 draf sistem otomatis dengan metrik progres, chip jatuh tempo, status pelunasan multi-tahap, dan status penyampaian WhatsApp.
- **Kolom Kanan (SCR-10 Digital Paper Invoice Dossier)**: Panel inspeksi bergaya lembar kertas faktur digital (*digital paper invoice sheet*) yang menyajikan rincian biaya teritemisasi, riwayat pembayaran mutasi, stempel dinamis (*watermark stamp*), dan hierarki aksi kontekstual (*Obsidian Black Primary CTA*).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        WF-05 WORKBENCH ARSITEKTUR & LAYOUT                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. TOPBAR FLOATING (70px): Logo RumaKost + Dark Nav Pill (Tagihan) + Avatar Pengelola  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. MACRO METRICS STRIP (3 Kartu Asimetris · Tinggi 156px):                             │
│    • Card 1 (Kas Realisasi): Rp 14,2 Jt (78%) + Radial Speedometer Gauge Hijau         │
│    • Card 2 (Sisa Piutang): Rp 4,0 Jt (22%) + Radial Speedometer Gauge Merah           │
│    • Card 3 (Efisiensi Tagihan): 64% Lunas (7/11) + Multi-Segment Bar + Siaran WA      │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│ 3. MASTER BILLING LEDGER (SCR-09 · 65%)               │ 4. DIGITAL INVOICE DOSSIER     │
│    • Head Bar: Siklus 1–31 Okt + Ekspor CSV           │    (SCR-10 · 35% Sticky)       │
│    • Controls: Search Capsule + Segment Tabs + Floors │    • Invoice ID + Paper Stamp  │
│    • Banner Verifikasi Draf Bulanan Otomatis          │    • Snapshot Profil Penyewa   │
│    • Master Data Table (Kamar, Tenant, Due, Total,    │    • Itemized Cost Breakdown   │
│      Status Pembayaran, Delivery WA Toggle)           │    • Progres Pelunasan (F-05)  │
│    • Zero-Native Clean 10-Row Pagination Bar          │    • Delivery Audit Strip WA   │
│                                                       │    • History Pembayaran Pod    │
│                                                       │    • Obsidian Black Action CTA │
└───────────────────────────────────────────────────────┴────────────────────────────────┘
```

### Pilar Arsitektural & Domain Boundaries:
1. **Draf-to-Active State Gate (*Proteksi Tagihan Terbit*)**:  
   Sistem secara otomatis membuat draf tagihan pada tanggal 1 setiap bulan (`status: 'draf'`). Draf ini terkunci di portal penghuni sehingga tidak membingungkan penyewa sebelum diverifikasi pengelola. Pengelola dapat menyesuaikan biaya tambahan (listrik kWh, air) atau diskon sebelum draf resmi diterbitkan menjadi `status: 'tempo'`.
2. **Prinsip Zero Scope Creep & Manual Payment Record**:  
   Sistem tidak mengintegrasikan payment gateway pihak ketiga (Midtrans/Xendit) atau bot WhatsApp otomatis berbayar. Seluruh pencatatan kas masuk dicatat manual oleh pengelola (tunai, transfer bank BCA/Mandiri, QRIS) dengan unggah bukti transfer sintetis, dan fitur WhatsApp beroperasi via generator tautan resmi manual `https://wa.me/` / `https://api.whatsapp.com/`.
3. **Pemisahan Wewenang Peran (*Zero Self-Approval untuk Staf*)**:  
   Staf pengelola memiliki akses operasional untuk mencatat penerimaan uang, namun transaksi tersebut diberi label *Menunggu Verifikasi* dan dilarang disetujui mandiri oleh staf yang bersangkutan (*Zero Self-Approval*). Pemilik properti memegang wewenang tunggal untuk memvalidasi rekonsiliasi kas dan melakukan pembatalan tagihan (*Void Invoice*).
4. **Escrow Settlement & Non-Cash Deduction**:  
   Modul tagihan mendukung pelunasan sewa melalui pemotongan saldo uang jaminan (`Potong Deposit / Escrow Settlement`) saat pengakhiran kontrak sewa, yang otomatis melunasi tagihan tanpa mutasi fisik uang masuk ke rekening bank.
5. **Jejak Audit Pembatalan (*Void Invoice Guard*)**:  
   Tagihan aktif yang keliru tidak dihapus secara permanen dari database (*zero physical deletion*), melainkan dialihkan statusnya menjadi `batal` (*VOID*) dengan kewajiban mencantumkan alasan tertulis demi integritas pembukuan operasional. Tagihan yang telah Lunas dilarang di-void langsung (wajib melalui prosedur reversal di modul Pembayaran `WF-06`).

---

## 2. Matriks Entitas Data Baseline (14 Tagihan Fixture Testing: 3 Draf + 11 Unit Aktif)

Berikut adalah 14 data fixture awal yang termuat dalam objek `invoicesData` pada pengujian layar `WF-05`:

| ID Tagihan | Unit | Lantai | Nama Penyewa | No. WhatsApp | Periode | Pokok (Rp) | Add-on / Denda / Tunggakan / Diskon | Total Kewajiban | Sisa Saldo | Status Tagihan | Delivery WA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **INV-202611-D01** | A-01 | Lt 1 | Siti Aminah | 0812-3456-7890 | Nov 2026 | 1.200.000 | - | 1.200.000 | 1.200.000 | **Draf Verifikasi** | Belum Terbit |
| **INV-202611-D02** | B-01 | Lt 2 | Nurul Indah | 0819-2233-4455 | Nov 2026 | 1.500.000 | Add-on: +50.000 | 1.550.000 | 1.550.000 | **Draf Verifikasi** | Belum Terbit |
| **INV-202611-D03** | B-04 | Lt 2 | Eko Prasetyo | 0857-1122-3344 | Nov 2026 | 1.500.000 | Tunggakan: +500.000 | 2.000.000 | 2.000.000 | **Draf Verifikasi** | Belum Terbit |
| **INV-202610-01** | A-01 | Lt 1 | Siti Aminah | 0812-3456-7890 | Okt 2026 | 1.200.000 | Saldo Kredit: +50.000 | 1.200.000 | 0 | **Lunas (Kredit +50rb)** | Terkirim WA |
| **INV-202610-02** | A-02 | Lt 1 | Dimas Pratama | 0813-7788-9900 | Okt 2026 | 1.200.000 | - | 1.200.000 | 0 | **Lunas Terverifikasi** | Terkirim WA |
| **INV-202610-04** | A-04 | Lt 1 | Budi Santoso | 0812-3456-7890 | Okt 2026 | 1.200.000 | Add-on: +100.000 | 1.300.000 | 1.300.000 | **Jatuh Tempo** | Terkirim WA |
| **INV-202610-05** | A-05 | Lt 1 | Rian Hidayat | 0812-8877-6655 | Okt 2026 | 1.300.000 | - | 1.300.000 | 0 | **Lunas Terverifikasi** | Terkirim WA |
| **INV-202610-06** | B-01 | Lt 2 | Nurul Indah | 0819-2233-4455 | Okt 2026 | 1.500.000 | - | 1.500.000 | 0 | **Lunas Terverifikasi** | Terkirim WA |
| **INV-202610-07** | B-02 | Lt 2 | Hendra Wijaya | 0812-5544-3322 | Okt 2026 | 1.500.000 | Bayar Cicil: 1.000.000 | 1.500.000 | 500.000 | **Cicilan (67%)** | Belum Dikirim |
| **INV-202610-08** | B-04 | Lt 2 | Eko Prasetyo | 0857-1122-3344 | Okt 2026 | 1.500.000 | - | 1.500.000 | 0 | **Lunas Terverifikasi** | Terkirim WA |
| **INV-202610-09** | B-05 | Lt 2 | Dian Permata | 0812-9988-7711 | Okt 2026 | 1.600.000 | - | 1.600.000 | 1.600.000 | **Jatuh Tempo** | Terkirim WA |
| **INV-202610-10** | C-01 | Lt 3 | Farhan Maulana | 0811-2233-4455 | Okt 2026 | 2.000.000 | Denda Telat: +50.000 | 2.050.000 | 2.050.000 | **Terlambat Bayar** | Terkirim WA |
| **INV-202610-11** | A-03 | Lt 1 | Bayu Saputra | 0813-4455-6677 | Okt 2026 | 1.100.000 | Pembayaran Tunai | 1.100.000 | 0 | **Lunas Terverifikasi** | Terkirim WA |
| **INV-202610-12** | B-03 | Lt 2 | Putri Ramadhani | 0818-6677-8899 | Okt 2026 | 1.500.000 | Prabayar Tahunan | 1.500.000 | 0 | **Lunas (Prabayar 1 Thn)** | Terkirim WA |

---

## 3. Skenario Pengujian Fungsional & Alur Pengguna (Runbook End-to-End)

---

### SKENARIO 01: Inspeksi Tagihan & Seleksi Invoice Dossier di Panel Kanan (Fitts's Law Selection)
* **Tujuan**: Memastikan pengguna dapat memeriksa detail lengkap lembar tagihan secara instan tanpa berpindah halaman (*zero context switching*).
* **Kondisi Awal**: Pengguna membuka halaman `WF-05-tagihan.html`. Tagihan pertama dalam daftar (`INV-202611-D01`) terpilih secara default.
* **Langkah-langkah**:
  1. Arahkan kursor dan klik baris tagihan **Kamar A-04** (Penyewa: Budi Santoso, ID: `INV-202610-04`).
* **Hasil Diharapkan**:
  - Baris tabel Kamar A-04 memperoleh kelas `.active-row` dengan latar highlight oranye transparan (`rgba(255, 122, 0, 0.08)`) dan border aktif.
  - Baris tagihan sebelumnya kembali ke status normal tanpa highlight.
  - Panel **Digital Paper Invoice Dossier (`SCR-10`)** di sebelah kanan diperbarui secara instan:
    - ID Tagihan: `#INV-202610-04` dengan subjudul *"Periode: Oktober 2026 · Kost Budi Makmur"*.
    - Stempel Status (`#paperStampBadge`): Latar oranye lembut dengan teks **"JATUH TEMPO"**.
    - Avatar penyewa menampilkan inisial `"BS"`, nama *"Budi Santoso"*, dan unit *"Kamar A-04 · Lantai 1"*.
    - Breakdown biaya menampilkan: Sewa Pokok `Rp 1.200.000`, Iuran Sampah & Wi-Fi `Rp 100.000`, Denda Keterlambatan `Rp 0`, dan Total Kewajiban `Rp 1.300.000`.
    - Progres pelunasan (`#dossierPercentPaid`) menampilkan *"0% Terbayar"* dengan sisa saldo merah `Rp 1.300.000`.
    - Strip audit menampilkan ikon hijau centang: *"Terkirim via WhatsApp · 22 Okt 2026, 10:15 · oleh Pemilik"*.
    - Tombol aksi utama (Primary CTA) menampilkan label hitam solid: *"Catat Pembayaran Masuk"*.

---

### SKENARIO 02: Penyaringan Tagihan Berdasarkan Status Pembayaran (Segment Tabs)
* **Tujuan**: Menguji filter instan daftar tagihan menggunakan tombol segmen status (Semua, Draf, Perlu Aksi, Cicilan, Lunas, Batal).
* **Kondisi Awal**: Filter status aktif pada tab **"Semua"**.
* **Langkah-langkah**:
  1. Klik tombol tab **"Draf (3)"** (`switchFilterStatus('draf', this)`).
* **Hasil Diharapkan**:
  - Tab "Draf" memperoleh kelas `.active` berlatar gelap atau oranye brand.
  - Banner oranye *"Draf Tagihan Rutin Dibuat Otomatis Sistem Setiap Tanggal 1"* muncul di atas tabel (`#draftVerificationBanner`).
  - Tabel hanya menampilkan 3 baris tagihan berstatus draf (`INV-202611-D01`, `INV-202611-D02`, `INV-202611-D03`).
  - Baris pagination menampilkan: *"Menampilkan 1–3 dari 3 tagihan"*, tombol navigasi halaman dinonaktifkan.
  2. Klik tombol tab **"Perlu Aksi (3)"** (`switchFilterStatus('attention', this)`).
  - Banner draf otomatis tersembunyi.
  - Tabel hanya menampilkan tagihan yang berstatus Jatuh Tempo atau Terlambat (Kamar A-04, B-05, C-01).
  3. Klik tombol tab **"Lunas (7)"** (`switchFilterStatus('lunas', this)`).
  - Tabel menampilkan 7 tagihan yang telah lunas 100%.

---

### SKENARIO 03: Penyaringan Tagihan Berdasarkan Kluster Lantai (Floor Filter Pills)
* **Tujuan**: Menguji pemilahan data tagihan berdasarkan kluster partisi fisik lantai gedung kost.
* **Kondisi Awal**: Tab status berada pada posisi "Semua", filter lantai aktif pada "Semua".
* **Langkah-langkah**:
  1. Klik tombol filter lantai **"Lt 2"** (`switchFloor('2', this)`).
* **Hasil Diharapkan**:
  - Tombol "Lt 2" aktif; tombol "Semua", "Lt 1", dan "Lt 3" tidak aktif.
  - Tabel hanya memunculkan tagihan kamar yang berada di Lantai 2 (Kamar B-01, B-02, B-03, B-04, B-05).
  - Kamar dari Lantai 1 (seri A) dan Lantai 3 (seri C) disembunyikan.
  - Pagination terhitung ulang sesuai jumlah data tagihan Lantai 2.
  2. Klik kembali tombol **"Semua"**.
  - Seluruh tagihan dari semua lantai kembali ditampilkan secara lengkap.

---

### SKENARIO 04: Pencarian Multi-Entitas Real-Time & Pembersihan Input (Search Capsule)
* **Tujuan**: Memverifikasi fungsionalitas pencarian dinamis pada kotak kapsul pencarian berdasarkan nama penyewa, nomor kamar, atau nomor invoice.
* **Kondisi Awal**: Kotak pencarian (`#billSearchInput`) kosong.
* **Langkah-langkah**:
  1. Ketikkan kata kunci *"farhan"* pada kotak pencarian.
* **Hasil Diharapkan**:
  - Tombol silang pembersih (`#clearSearchBtn`) muncul seketika di ujung kanan kotak pencarian.
  - Tabel memfilter data secara instan tanpa reload halaman, hanya menampilkan 1 baris: Kamar C-01 (Farhan Maulana, ID `INV-202610-10`).
  - Informasi paginasi menampilkan *"Menampilkan 1–1 dari 1 tagihan"*.
  2. Ubah kata kunci menjadi *"B-0"* (pencarian nomor unit kamar).
  - Tabel memuat seluruh unit kamar berawalan B-0 (B-01, B-02, B-03, B-04, B-05).
  3. Klik tombol silang pembersih (`#clearSearchBtn`).
  - Nilai input pencarian terhapus bersih, tombol silang menghilang, kursor tetap berada di kotak pencarian (`focus()`), dan tabel kembali menampilkan seluruh baris tagihan.

---

### SKENARIO 05: Paginasi Estify Clean (10-Row Pagination, Navigasi Halaman & Auto-Scroll)
* **Tujuan**: Memastikan data tagihan terbagi rapi dengan limit 10 baris per halaman dan kontrol navigasi prev/next berfungsi mulus.
* **Kondisi Awal**: Total tagihan berjumlah 14 data (posisi filter "Semua"). Paginasi berada di Halaman 1.
* **Langkah-langkah**:
  1. Periksa teks paginasi di bawah tabel: tertulis *"Menampilkan 1–10 dari 14 tagihan"*.
  2. Periksa tombol **"Prev"**: berstatus *disabled* (`disabled="true"`).
  3. Klik tombol halaman **"2"** atau klik tombol **"Next"** (`changeBillingPage(1)`).
* **Hasil Diharapkan**:
  - State halaman beralih ke `billingCurrentPage = 2`.
  - Tombol nomor 2 memperoleh kelas `.active`.
  - Tombol "Prev" menjadi aktif (bisa diklik), tombol "Next" menjadi *disabled*.
  - Teks paginasi berubah menjadi *"Menampilkan 11–14 dari 14 tagihan"*.
  - Tabel memuat 4 baris data sisanya (Kamar C-01, A-03, B-03, dan data ke-14).
  - Tampilan layar menggulir halus (*smooth scrollIntoView*) ke puncak kartu tabel master.

---

### SKENARIO 06: Interaktivitas Metric Card Arus Kas & Distribusi Penagihan (Clickable Micro-Legends)
* **Tujuan**: Memvalidasi integrasi kartu ringkasan eksekutif Card 3 dengan filter data tabel melalui segmen bar dan chip legenda.
* **Kondisi Awal**: Card 3 menampilkan ringkasan *"64% Lunas · Rp 14,2 Jt / Rp 18,25 Jt"*.
* **Langkah-langkah**:
  1. Klik segmen bar hijau (64%) atau klik chip legenda **"7 Lunas (64%)"** pada Card 3.
* **Hasil Diharapkan**:
  - Sistem mengeksekusi `switchFilterStatus('lunas')`.
  - Tab segmen filter status di toolbar tabel langsung berpindah aktif ke tab **"Lunas (7)"**.
  - Tabel master otomatis menampilkan 7 kamar yang telah lunas.
  2. Klik chip legenda **"1 Cicilan (9%)"** pada Card 3.
  - Tab segmen aktif berpindah ke **"Cicilan (1)"**, tabel memuat Kamar B-02.
  3. Klik chip legenda **"2 Tempo (18%)"** atau **"1 Telat (9%)"**.
  - Tab segmen aktif berpindah ke **"Perlu Aksi (3)"**, memuat kamar berstatus Jatuh Tempo & Terlambat.

---

### SKENARIO 07: Penerbitan Tagihan On-Demand / Insidental — Sewa Penuh & Uang Jaminan Escrow
* **Tujuan**: Menguji alur pembuatan tagihan baru di luar siklus rutin untuk penyewa baru, lengkap dengan opsi penggabungan uang jaminan (*Escrow Perdana*).
* **Kondisi Awal**: Pengguna berada di halaman `WF-05-tagihan.html`.
* **Langkah-langkah**:
  1. Buka modal penerbitan tagihan (`openModalTerbitkanTagihan()`).
  2. Klik dropdown unit kamar (`toggleNewBillRoomDropdown(event)`), pilih kamar **"A-02 · Rahmat Hidayat (Lantai 1)"** dengan tarif Rp 1.500.000.
  3. Pilih kategori tagihan: **"Sewa Kamar"**.
  4. Pilih skema sewa: **"1 Bulan Penuh"** (default).
  5. Centang opsi **"Gabungkan Uang Jaminan Deposit (Escrow Perdana)"** (`#checkIncludeDeposit`).
  6. Periksa field besaran deposit: terisi otomatis `1.000.000` (dapat diedit).
* **Hasil Diharapkan**:
  - Total nominal tagihan (`#inputNewBillAmount`) terkalkulasi otomatis menjadi `2.500.000` (Rp 1.500.000 + Rp 1.000.000).
  - Field catatan tagihan (`#inputNewBillNotes`) otomatis terisi:  
    *"Tagihan sewa 1 bulan penuh Rp 1.500.000 + Uang Jaminan Deposit Rp 1.000.000 periode Oktober 2026."*
  7. Tentukan tanggal jatuh tempo melalui kalender RumaDatePicker (misal: 31 Oktober 2026).
  8. Biarkan checkbox *"Kirim Invoice Digital ke WhatsApp Penghuni"* tercentang.
  9. Klik tombol **"Terbitkan & Kirim Notifikasi"** (`submitTerbitkanTagihan()`).
  - Modal `#modalTerbitkanTagihan` tertutup.
  - Objek tagihan baru dengan ID berformat `INV-202610-ODxx` ditambahkan ke posisi teratas array `invoicesData`.
  - Tagihan baru langsung terpilih di Side Dossier kanan.
  - Toast notifikasi sukses muncul: *"Tagihan #INV-... (A-02 - Rahmat Hidayat) berhasil diterbitkan & notifikasi invoice digital terkirim via WhatsApp!"*.
  - Tabel master me-render baris baru di posisi paling atas dengan status *"Menunggu Pembayaran"*.

---

### SKENARIO 08: Penerbitan Tagihan On-Demand dengan Kalkulator Prorata Hari Berjalan
* **Tujuan**: Memverifikasi kalkulator prorata sewa otomatis untuk penghuni yang check-in di pertengahan bulan.
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` terbuka.
* **Langkah-langkah**:
  1. Pilih unit kamar: **"A-01 · Siti Aminah"** (Tarif pokok: Rp 1.200.000).
  2. Pada pilihan skema sewa, klik kartu **"Prorata Tengah Bulan"** (`#schemeProrata`).
* **Hasil Diharapkan**:
  - Kartu "Prorata Tengah Bulan" memperoleh styling aktif (border oranye).
  - Kotak kalkulator prorata (`#prorataCalcBox`) muncul di bawahnya.
  3. Masukkan Tanggal Masuk Check-in: `2026-10-15`.
  4. Masukkan Akhir Siklus Bulan: `2026-10-31`.
  - Badge hari berjalan menghitung: `17 Hari` (dari tanggal 15 s.d. 31 inklusif).
  - Rumus perhitungan menampilkan: `Rumus: (17 hr ÷ 31 hr) × Rp 1.200.000`.
  - Hasil hitungan otomatis dibulatkan ke ribuan terdekat: **Rp 658.000**.
  - Total nominal tagihan pada input form langsung terbarui menjadi `658.000`.
  - Keterangan tagihan terisi otomatis: *"Tagihan perdana: Sewa prorata (17 Hari) Rp 658.000 periode Oktober 2026."*.
  5. Klik tombol **"Terbitkan & Kirim Notifikasi"**.
  - Tagihan prorata berhasil disimpan dengan nominal sewa pokok Rp 658.000.

---

### SKENARIO 09: Penerbitan Tagihan Insidental Non-Sewa (Listrik kWh & Denda Kerusakan)
* **Tujuan**: Menguji pembuatan tagihan insidental untuk pemakaian utilitas di luar sewa pokok.
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` terbuka.
* **Langkah-langkah**:
  1. Pilih kategori tagihan: **"Listrik / Air"** (`#btypeListrik`).
* **Hasil Diharapkan**:
  - Seksi opsi skema sewa pokok (`#newBillRentOptionsWrap`) disembunyikan.
  - Field keterangan tagihan terisi teks preset: *"Kelebihan pemakaian listrik AC 45 kWh x Rp 2.500"*.
  - Field total nominal terisi otomatis: `112.500`.
  2. Beralih ke kategori: **"Denda / Fasilitas"** (`#btypeLainnya`).
  - Keterangan berganti menjadi: *"Denda keterlambatan sewa / penggantian fasilitas"*.
  - Total nominal berganti menjadi: `50.000`.
  3. Pengelola dapat mengubah nominal menjadi `75.000` dan mengedit catatan menjadi *"Penggantian kunci gerbang hilang"*.
  4. Klik **"Terbitkan & Kirim Notifikasi"**.
  - Tagihan insidental denda berhasil diterbitkan dan masuk ke daftar aktif.

---

### SKENARIO 10: Verifikasi & Penerbitan Draf Tagihan Rutin Bulanan Satuan (Draft to Active)
* **Tujuan**: Memvalidasi alur verifikasi draf otomatis tanggal 1 oleh pengelola agar resmi menjadi tagihan aktif yang dapat diakses penghuni.
* **Kondisi Awal**: Tagihan **Kamar A-01 (`INV-202611-D01`)** berstatus Draf terpilih di dossier kanan.
* **Langkah-langkah**:
  1. Periksa tampilan lembar dossier:
     - Watermark stamp menampilkan badge oranye: **"DRAF VERIFIKASI"**.
     - Notice khusus draf (`#dossierDraftNotice`) tampil dengan teks:  
       *"Tagihan ini belum dapat dilihat oleh penghuni di portal. Anda dapat klik Edit / Diskon untuk menyesuaikan biaya sebelum memverifikasi & menerbitkannya."*
     - Tombol primary CTA berlatar oranye brand: *"Verifikasi & Terbitkan Tagihan"*.
  2. Klik tombol utama **"Verifikasi & Terbitkan Tagihan"** (`handleDossierPrimaryAction()`).
* **Hasil Diharapkan**:
  - Status invoice `INV-202611-D01` bermutasi dari `'draf'` menjadi `'tempo'`.
  - Label status berubah menjadi *"Menunggu Bayar"*, sisa jatuh tempo menjadi *"Sisa 10 Hari"*, dan delivery status menjadi `'sent'` (*Diterbitkan tgl 1 Nov · oleh Staf & WA terkirim*).
  - Stempel dossier berubah menjadi **"JATUH TEMPO"** (latar oranye-merah).
  - Notice draf tersembunyi.
  - Tombol primary CTA berubah warna menjadi hitam solid (*Obsidian Black*) dengan label: *"Catat Pembayaran Masuk"*.
  - Toast konfirmasi sukses muncul: *"Tagihan Kamar A-01 (Siti Aminah) berhasil diverifikasi & resmi diterbitkan! Penghuni sekarang dapat melihat & membayar tagihan."*.
  - Counter badge pada tab "Draf" berkurang dari 3 menjadi 2.

---

### SKENARIO 11: Batch Verifikasi Seluruh Draf Tagihan Rutin Bulanan via Banner Notifikasi
* **Tujuan**: Menguji efisiensi penerbitan seluruh draf tagihan bulanan secara massal dalam satu klik (*bulk action*).
* **Kondisi Awal**: Terdapat 3 draf tagihan aktif (`INV-202611-D01`, `INV-202611-D02`, `INV-202611-D03`). Pengguna mengklik tab "Draf".
* **Langkah-langkah**:
  1. Periksa banner verifikasi di atas tabel (`#draftVerificationBanner`): menampilkan badge *"3 Draf Belum Terbit"*.
  2. Klik tombol aksi oranye pada banner: **"Verifikasi & Terbitkan Semua Draf"** (`verifyAllDrafts()`).
* **Hasil Diharapkan**:
  - Sistem memproses iterasi seluruh tagihan berstatus `'draf'`.
  - Seluruh 3 tagihan bermutasi statusnya menjadi `'tempo'` (Jatuh Tempo / Menunggu Bayar).
  - Banner verifikasi draf otomatis menghilang dari layar.
  - Counter badge tab "Draf" menjadi `0`.
  - Toast notifikasi sukses muncul:  
    *"3 draf tagihan rutin bulanan berhasil diverifikasi dan resmi diterbitkan ke portal penghuni!"*.
  - Tabel master di-render ulang menampilkan tagihan yang kini siap ditagihkan.

---

### SKENARIO 12: Penyesuaian Tagihan Berjalan, Diskon & Tambahan Biaya (`#modalAdjustInvoice`)
* **Tujuan**: Memverifikasi pemberian diskon sewa atau penambahan tagihan listrik/iuran pada tagihan yang sedang berjalan.
* **Kondisi Awal**: Kamar A-04 (Budi Santoso, ID `INV-202610-04`) aktif di dossier.
* **Langkah-langkah**:
  1. Klik tombol sekunder **"Edit / Diskon"** pada dossier footer (`openModalAdjustInvoice()`).
  2. Modal penyesuaian `#modalAdjustInvoice` terbuka, menampilkan Sewa Pokok Kontrak `Rp 1.200.000`.
  3. Masukkan Diskon Potongan Biaya: ketik `100000` (terformat otomatis `100.000`).
  4. Masukkan Biaya Tambahan: ubah menjadi `150.000`.
  5. Isi Alasan Penyesuaian: *"Diskon kompensasi AC rusak 2 hari + kelebihan pemakaian listrik"*.
* **Hasil Diharapkan**:
  - Kotak ringkasan kalkulasi (`.calculation-callout`) menghitung dinamis:  
    `Sewa Pokok (Rp 1.200.000) - Diskon (Rp 100.000) + Add-on (Rp 150.000) = Rp 1.250.000`.
  - Sisa saldo yang wajib dibayar tertera: `Rp 1.250.000`.
  6. Klik tombol **"Simpan Penyesuaian Tagihan"** (`saveInvoiceAdjustment()`).
  - Modal tertutup.
  - Objek invoice terbarui: `discount: 100000`, `addOns: 150000`, `totalAmount: 1250000`, `dueAmount: 1250000`.
  - Baris tabel Kamar A-04 kini menampilkan badge oranye kecil `Diskon` di samping nominal tagihan.
  - Dossier kanan menampilkan baris potongan diskon berwarna hijau: `- Rp 100.000`.
  - Toast notifikasi sukses muncul: *"Tagihan INV-202610-04 (A-04) berhasil disesuaikan: Total Rp 1.250.000."*.

---

### SKENARIO 13: Pembebasan Denda Keterlambatan Tagihan (Late Fee Waiver)
* **Tujuan**: Memastikan Pemilik properti dapat menghapuskan denda keterlambatan atas dasar pertimbangan khusus (*owner discretionary waiver*).
* **Kondisi Awal**: Kamar C-01 (Farhan Maulana, `INV-202610-10`) terpilih di dossier. Tagihan memiliki denda Rp 50.000 (Total tagihan: Rp 2.050.000).
* **Langkah-langkah**:
  1. Klik tombol **"Edit / Diskon"** pada dossier footer.
  2. Pada baris kalkulasi Denda Keterlambatan (`#adjustSummaryLateFeeRow`), klik tombol merah mini: **"Bebaskan Denda"** (`waiveAdjustLateFee()`).
* **Hasil Diharapkan**:
  - Nilai denda keterlambatan langsung dinolkan (`lateFee = 0`).
  - Total tagihan baru terkalkulasi ulang menjadi `Rp 2.000.000` (turun Rp 50.000).
  - Toast info muncul: *"Denda keterlambatan sebesar Rp 50.000 dinolkan. Klik Simpan Penyesuaian untuk menerapkan."*.
  3. Klik tombol **"Simpan Penyesuaian Tagihan"**.
  - Modal tertutup. Total kewajiban Kamar C-01 kembali ke nilai sewa pokok Rp 2.000.000.
  - Riwayat dossier menampilkan denda: `Rp 0`.

---

### SKENARIO 14: Pencatatan Penerimaan Pembayaran Tunai/Transfer Masuk & Pelunasan Sepenuhnya
* **Tujuan**: Menguji pencatatan pembayaran sewa kost secara manual hingga tagihan lunas 100%.
* **Kondisi Awal**: Kamar A-04 (Budi Santoso, sisa piutang: Rp 1.300.000) terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol utama dossier: **"Catat Pembayaran Masuk"** (`openModalCatatBayar()`).
  2. Modal `#modalCatatBayar` terbuka. Data tagihan terisi: Kamar A-04, Budi Santoso, Nominal `1.300.000`.
  3. Pilih metode pembayaran: klik kartu **"BCA Transfer"** (default).
  4. Periksa nomor referensi transaksi: terisi otomatis `TRF-BCA-xxxxxx` (readonly).
  5. Pilih tanggal bayar: `23 Oktober 2026` via RumaDatePicker.
  6. Isi Nama Pengirim Rekening: *"Budi Santoso"*.
  7. Klik area dropzone bukti transfer (`simulateProofUpload()`).
  - Label upload berubah menjadi hijau: *"slip_transfer_bca_23okt.jpg (1.2 MB) (Valid)"*.
  - Toast info muncul: *"Bukti transfer berhasil dilampirkan!"*.
  8. Periksa kalkulasi saldo: Sisa Tagihan Rp 1.300.000 - Dibayarkan Rp 1.300.000 = `Rp 0 (Lunas Sepenuhnya)` berwarna hijau.
  9. Biarkan checkbox *"Kirim Kuitansi & Bukti Bayar via WhatsApp ke Penghuni"* tercentang.
  10. Klik tombol **"Simpan Catatan Pembayaran"** (`submitPaymentRecord()`).
* **Hasil Diharapkan**:
  - Modal `#modalCatatBayar` tertutup.
  - Status invoice `INV-202610-04` berubah menjadi `'lunas'`, statusLabel menjadi *"Lunas Terverifikasi"*, `dueAmount = 0`, `paidAmount = 1300000`.
  - Stempel dossier berubah menjadi hijau cerah: **"LUNAS"**.
  - Progres pelunasan dossier penuh 100% (`width: 100%`), teks *"100% Terbayar"*.
  - Pod riwayat pembayaran dossier menampilkan entri pembayaran baru: `Rp 1.300.000`, metode Transfer BCA, stempel waktu, dan status "Diterima".
  - Tombol primary CTA dossier berubah menjadi: *"Lihat / Cetak Kuitansi Lunas"*.
  - Toast notifikasi sukses muncul:  
    *"Pembayaran Rp 1.300.000 untuk Kamar A-04 (Budi Santoso) berhasil dicatat! Kuitansi pembayaran resmi otomatis dikirimkan ke WhatsApp penghuni."*.
  - Tab baru WhatsApp Web terbuka dengan draf pesan tanda terima pelunasan resmi.

---

### SKENARIO 15: Pencatatan Pembayaran Sebagian / Cicilan Bertahap (Partial Payment)
* **Tujuan**: Memastikan sistem mendukung sistem cicilan tanpa merusak perhitungan piutang berjalan.
* **Kondisi Awal**: Kamar B-05 (Dian Permata, ID `INV-202610-09`) memiliki total tagihan Rp 1.600.000, status Jatuh Tempo.
* **Langkah-langkah**:
  1. Pilih Kamar B-05, lalu klik **"Catat Pembayaran Masuk"**.
  2. Pada input nominal diterima (`#inputPayAmount`), masukkan angka `600000` (cicilan tahap 1).
* **Hasil Diharapkan**:
  - Kotak kalkulasi saldo interaktif seketika menampilkan:  
    `Sisa Tagihan Sebelumnya: Rp 1.600.000`  
    `Nominal yang Dibayarkan: - Rp 600.000`  
    `Sisa Saldo Baru: Rp 1.000.000 (Cicilan / Sisa Piutang)` berwarna oranye.
  3. Pilih metode pembayaran: **"Mandiri"**.
  4. Klik tombol **"Simpan Catatan Pembayaran"**.
  - Modal tertutup.
  - Tagihan Kamar B-05 memperoleh status baru: `'sebagian'`.
  - Label status: *"Dibayar Sebagian (38%)"*.
  - Nilai `paidAmount = 600000`, nilai `dueAmount = 1000000`.
  - Pada tabel master, kolom tagihan menampilkan mini-progress bar oranye dengan teks *"Sisa: Rp 1.000.000"*.
  - Stempel dossier berubah menjadi kuning-oranye: **"CICILAN"**.
  - Toast konfirmasi sukses muncul: *"Pembayaran Rp 600.000 untuk Kamar B-05 (Dian Permata) berhasil dicatat!"*.

---

### SKENARIO 16: Penanganan Kelebihan Bayar & Otomatisasi Saldo Kredit Penghuni (Credit Balance)
* **Tujuan**: Menguji penanganan otomatis sistem saat penghuni mentransfer dana melebihi sisa tagihan yang harus dibayar.
* **Kondisi Awal**: Kamar A-01 memiliki sisa tagihan Rp 1.200.000.
* **Langkah-langkah**:
  1. Buka modal catat bayar untuk Kamar A-01.
  2. Masukkan nominal pembayaran: `1.250.000` (kelebihan Rp 50.000).
* **Hasil Diharapkan**:
  - Kotak kalkulasi mendeteksi surplus: `Rp 0 (Lunas Kelebihan Rp 50.000)` berwarna hijau zamrud (`#059669`).
  3. Klik tombol **"Simpan Catatan Pembayaran"**.
  - Tagihan ditandai `'lunas'`.
  - Kelebihan bayar Rp 50.000 disimpan ke properti `creditBalance = 50000`.
  - Label status menjadi *"Lunas (Kredit +Rp 50rb)"*.
  - Pada tabel master dan dossier, muncul pill hijau: `Kredit Rp 50.000`.
  - Toast sukses menginformasikan:  
    *"Pembayaran Rp 1.250.000 untuk Kamar A-01 (Siti Aminah) berhasil dicatat! Kelebihan bayar Rp 50.000 otomatis disimpan sebagai Saldo Kredit Penghuni untuk periode berikutnya."*.

---

### SKENARIO 17: Pencatatan Pelunasan via Potong Deposit / Escrow Settlement (F-05 Non-Bank)
* **Tujuan**: Memverifikasi metode pelunasan non-tunai melalui klaim saldo uang jaminan penghuni (Check-Out Settlement).
* **Kondisi Awal**: Modal `#modalCatatBayar` terbuka untuk Kamar A-04 (Budi Santoso).
* **Langkah-langkah**:
  1. Pada pilihan metode pembayaran, klik opsi **"Deposit"** (`selectPaymentMethod(this, 'Potong Deposit')`).
* **Hasil Diharapkan**:
  - Opsi "Deposit" aktif berlatar ungu lembut.
  - Callout box informasi deposit (`#depositCalloutBox`) muncul di bawahnya:
    - Badge saldo tersedia: *"Tersedia: Rp 1.500.000"*.
    - Peringatan: *"Pembayaran akan memotong saldo uang jaminan penghuni. Tidak ada mutasi fisik uang masuk ke rekening bank."*.
  - Nomor referensi transaksi otomatis disetel ke format: `DEP-KLAIM-INV202610-04`.
  2. Masukkan nominal pelunasan penuh Rp 1.300.000.
  3. Klik tombol **"Simpan Catatan Pembayaran"**.
  - Tagihan berstatus Lunas dengan metode tertera *"Potong Deposit"*.
  - Tidak terjadi penambahan saldo kas fisik bank pada rekapitulasi operasional.

---

### SKENARIO 18: Penegakan Aturan Zero Self-Approval untuk Staf Operasional pada Modal Catat Bayar
* **Tujuan**: Memastikan staf operasional mendapat peringatan pembatasan wewenang bahwa transaksi yang diinput wajib menunggu persetujuan Pemilik kost.
* **Kondisi Awal**: Pengguna membuka halaman tagihan dalam sesi staf melalui URL parameter: `WF-05-tagihan.html?role=staf`.
* **Langkah-langkah**:
  1. Pilih salah satu tagihan yang belum lunas (misal: Kamar B-05).
  2. Klik tombol **"Catat Pembayaran Masuk"**.
* **Hasil Diharapkan**:
  - Modal `#modalCatatBayar` terbuka.
  - Kotak peringatan khusus staf (`#modalStaffAlert`) otomatis ditampilkan di bagian atas form:
    - Ikon info oranye dengan teks:  
      *"Staf Operasional: Catatan ini akan berstatus Menunggu Verifikasi hingga divalidasi oleh Pemilik kost (Zero Self-Approval)."*
  - Staf tidak menemukan tombol verifikasi instan di halaman ini. Transaksi yang disimpan akan berstatus pending rekonsiliasi hingga diverifikasi oleh Pemilik di `WF-06-pembayaran.html`.

---

### SKENARIO 19: Pembatalan Tagihan Resmi (Void Invoice dengan Alasan Audit & Proteksi Lunas)
* **Tujuan**: Menguji prosedur pembatalan penerbitan tagihan yang keliru dengan proteksi integritas data.
* **Kondisi Awal**: Kamar A-01 periode November (`INV-202611-D01`, status Draf) atau Kamar B-05 (status Jatuh Tempo) terpilih di dossier.
* **Langkah-langkah**:
  1. Periksa bagian bawah footer dossier: temukan tombol merah outline **"Batalkan Tagihan"** (`#btnVoidInvoiceAction`).
  2. Klik tombol tersebut (`openModalVoidInvoice()`).
  - Modal konfirmasi `#modalVoidInvoice` terbuka.
  - Rincian nomor invoice, nama penyewa, dan total kewajiban ditampilkan jelas.
  3. Kosongkan field alasan pembatalan, lalu klik **"Konfirmasi Batalkan Tagihan"**.
  - Sistem menolak dan memunculkan Toast Warning:  
    *"Mohon tuliskan alasan pembatalan tagihan terlebih dahulu."*.
  4. Ketikkan alasan: *"Penghuni membatalkan perpanjangan sewa dan check-out akhir Oktober"*.
  5. Klik kembali **"Konfirmasi Batalkan Tagihan"** (`confirmVoidInvoice()`).
* **Hasil Diharapkan**:
  - Modal tertutup.
  - Status invoice bermutasi menjadi `'batal'`, label status menjadi *"Dibatalkan (Void)"*, `dueDaysLeft = 'Tagihan Dibatalkan'`.
  - Stempel dossier berubah menjadi abu-abu: **"DIBATALKAN"**.
  - Notice pembatalan merah (`#dossierVoidNotice`) muncul di dossier menampilkan kutipan alasan:  
    *"Alasan: Penghuni membatalkan perpanjangan sewa dan check-out akhir Oktober. Seluruh kewajiban pembayaran dinonaktifkan."*.
  - Tombol primary CTA berubah menjadi abu-abu mati (*disabled*): *"Tagihan Dibatalkan (Void)"*.
  - Pod riwayat pembayaran dossier mencatat status VOID beserta tanggal pembatalan.
  - Tombol "Batalkan Tagihan" disembunyikan agar tidak dibatalkan berulang kali.
  - Toast notifikasi sukses muncul: *"Tagihan #INV-... resmi dibatalkan (Status: VOID)."*.
  6. **Uji Proteksi Tagihan Lunas**: Pilih tagihan yang sudah Lunas (misal: Kamar A-02).
  - Tombol "Batalkan Tagihan" otomatis **disembunyikan** dari dossier.
  - Jika fungsi `openModalVoidInvoice()` dipanggil paksa melalui konsol, sistem menolak dengan Toast Warning:  
    *"Tagihan yang sudah Lunas tidak dapat dibatalkan lewat Void. Lakukan Koreksi / Reversal di menu Pembayaran terlebih dahulu."*.

---

### SKENARIO 20: Toggle Manual Status Penyampaian Tagihan WhatsApp (RK-029)
* **Tujuan**: Menguji penandaan status penyampaian nota tagihan secara manual sesuai acceptance criteria RK-029.
* **Kondisi Awal**: Kamar B-02 (`INV-202610-07`) berstatus penyampaian *"Belum Dikirim"*.
* **Langkah-langkah**:
  1. Pada tabel master kolom ke-6 (*Penyampaian WA*), klik tombol toggle abu-abu **"Belum Dikirim"** (`toggleDeliveryStatusRow(event, 'INV-202610-07')`).
* **Hasil Diharapkan**:
  - Nilai `deliveryStatus` berubah menjadi `'sent'`.
  - Tombol toggle di baris tabel langsung berubah warna menjadi hijau dengan ikon centang ganda: **"Terkirim WA"**.
  - Pada dossier kanan, strip audit diperbarui:  
    *"Terkirim via WhatsApp · 23 Okt 2026, [Waktu Saat Ini] · oleh Pemilik"*.
  - Toast sukses muncul: *"Status penyampaian tagihan B-02 ditandai Terkirim WA"*.
  2. Klik kembali tombol **"Terkirim WA"**.
  - Status kembali menjadi `'pending'` ("Belum Dikirim") dengan Toast info.

---

### SKENARIO 21: Pengiriman Tautan Nota Tagihan ke WhatsApp Penghuni via URL `https://wa.me/`
* **Tujuan**: Memastikan tautan WhatsApp manual ter-generate dengan draf teks penagihan yang rapi tanpa bot otomatisasi berbayar.
* **Kondisi Awal**: Kamar A-04 (Budi Santoso, sisa Rp 1.300.000) aktif di dossier.
* **Langkah-langkah**:
  1. Klik tombol sekunder pada dossier footer: **"Kirim ke WA"** (`sendInvoiceWhatsApp()`).
* **Hasil Diharapkan**:
  - Sistem memformat nomor telepon penyewa `0812-3456-7890` menjadi kode negara `6281234567890`.
  - Tab browser baru terbuka mengarah ke URL WhatsApp:  
    `https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Kak%20Budi%20Santoso...`
  - Pesan memuat: nama penyewa, nomor kamar (A-04), nomor invoice (`#INV-202610-04`), periode (Oktober 2026), total tagihan (`Rp 1.300.000`), sisa piutang, dan status tagihan.
  - Status penyampaian tagihan di sistem otomatis ditandai `'sent'` (*Terkirim via WhatsApp Web*).
  2. **Uji Proteksi Tagihan Draf**: Pilih tagihan berstatus Draf (`INV-202611-D01`), lalu klik "Kirim ke WA".
  - Sistem menolak membuka WhatsApp dan menampilkan Toast Warning:  
    *"Tagihan #INV-202611-D01 masih berstatus Draf. Silakan klik 'Verifikasi & Terbitkan' terlebih dahulu sebelum mengirim rincian ke WhatsApp penghuni."*.

---

### SKENARIO 22: Siaran Pengingat WhatsApp Massal (Broadcast WA dengan 4 Template & Live Preview)
* **Tujuan**: Menguji modal siaran massal penagihan dengan segmentasi target dan live preview gelembung chat WhatsApp.
* **Kondisi Awal**: Pengguna berada di halaman utama `WF-05`.
* **Langkah-langkah**:
  1. Klik tombol **"Ingatkan via WA"** pada Card 3 (`openModalBroadcast()`).
  2. Modal `#modalBroadcast` terbuka.
  3. Pada Target Penerima, pilih chip **"Jatuh Tempo (2)"** (`selectBroadcastTarget(this, 'tempo')`).
  4. Pada pilihan Draf Template Cepat, klik tombol **"Jatuh Tempo Hari Ini (H-0)"** (`applyBroadcastTemplate('tempo')`).
* **Hasil Diharapkan**:
  - Textarea isi pesan terisi draf teks pengingat jatuh tempo hari ini.
  - Kotak **Live Preview Pesan WhatsApp** di bawahnya seketika memperbarui pratinjau teks dengan mengganti variabel `[Nama Penyewa]` menjadi *"Budi Santoso"*, `[Kamar]` menjadi *"A-04"*, dan `[Total Tagihan]` menjadi *"Rp 1.300.000"*.
  5. Coba template lain: klik tombol merah **"Surat Peringatan (SP-1 > H+7)"**.
  - Textarea dan kotak preview langsung terisi klausul tegas surat peringatan tunggakan sewa (toleransi 2x24 jam dan pembekuan fasilitas).
  6. Klik tombol hijau utama: **"Kirim Siaran via WA"** (`executeBroadcast()`).
  - Modal tertutup.
  - Toast konfirmasi muncul: *"Sesuai kebijakan Zero-Bot, tautan WhatsApp perorangan disiapkan di daftar aksi untuk pengiriman manual serial."*.

---

### SKENARIO 23: Pratinjau & Cetak Kuitansi Resmi Pelunasan Sewa (`#modalReceipt`)
* **Tujuan**: Memastikan lembar tanda terima pelunasan resmi dapat dipratinjau, dikirim ke WA, dan dicetak ke printer fisik.
* **Kondisi Awal**: Kamar A-01 (`INV-202610-01`, status Lunas) terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol sekunder **"Cetak Kuitansi"** di footer dossier (`openReceiptModal()`).
* **Hasil Diharapkan**:
  - Modal kuitansi `#modalReceipt` terbuka dalam format kartu faktur elegan.
  - Watermark latar belakang samar menampilkan teks besar: **"LUNAS"** berwarna hijau muda.
  - Header memuat identitas: *"RUMAKOST · Kost Budi Makmur · Jakarta Selatan"* dan nomor kuitansi `#INV-202610-01`.
  - Tabel rincian memuat: Telah Terima Dari (Siti Aminah), Unit Kamar (Kamar A-01), Tanggal Transaksi, Metode Pembayaran (Transfer Bank BCA), Status Verifikasi (*Terverifikasi Pemilik*), dan Jumlah Pelunasan (`Rp 1.200.000`).
  2. Klik tombol **"Kirim Kwitansi via WA"** (`sendReceiptWhatsApp()`).
  - Tautan WhatsApp Web terbuka memuat format teks kuitansi digital resmi lengkap dengan nomor kuitansi dan konfirmasi pelunasan.
  3. Klik tombol **"Cetak Dokumen"**.
  - Dialog cetak bawaan browser (`window.print()`) terpicu dengan format cetak ramah dokumen.

---

### SKENARIO 24: Penyalinan Nomor Invoice & Tautan Portal Tagihan ke Clipboard
* **Tujuan**: Menguji utilitas salin instan nomor faktur dan URL akses mandiri portal penghuni.
* **Kondisi Awal**: Kamar A-04 terpilih di dossier.
* **Langkah-langkah**:
  1. Klik tombol salin mini di samping nomor invoice header dossier (`#dossierInvId button`).
* **Hasil Diharapkan**:
  - Nilai teks `INV-202610-04` tersalin ke clipboard sistem.
  - Toast notifikasi sukses muncul: *"Nomor invoice #INV-202610-04 berhasil disalin!"*.
  2. Klik tombol sekunder **"Link Portal"** pada footer dossier (`copyTenantPortalLink()`).
  - URL format portal penghuni (`https://.../WF-10-portal-penghuni.html?inv=INV-202610-04`) tersalin ke clipboard.
  - Toast notifikasi sukses muncul: *"Tautan portal tagihan untuk Budi Santoso berhasil disalin!"*.
  3. **Uji Proteksi Draf**: Pilih tagihan draf (`INV-202611-D01`), lalu klik "Link Portal".
  - Sistem menolak menyalin URL dan menampilkan Toast Warning:  
    *"Tagihan #INV-202611-D01 masih berstatus Draf. Tagihan belum aktif di portal penghuni sampai Anda memverifikasi & menerbitkannya."*.

---

### SKENARIO 25: Ekspor Seluruh Matriks Penagihan ke File CSV (Spreadsheet / Excel Ready)
* **Tujuan**: Memverifikasi fitur ekspor seluruh ledger penagihan bulan berjalan ke file CSV berstandar UTF-8.
* **Kondisi Awal**: Pengguna berada di halaman utama `WF-05`.
* **Langkah-langkah**:
  1. Periksa header kartu tabel master di sisi kanan atas: temukan tombol **"Ekspor CSV"** (`.btn-export-csv`).
  2. Klik tombol tersebut (`exportBillingMatrixToCSV()`).
* **Hasil Diharapkan**:
  - Sistem menyusun string CSV dengan byte order mark UTF-8 (`\uFEFF`) untuk kompatibilitas Microsoft Excel.
  - Seluruh 18 kolom data terekspor rapi: ID Invoice, Nomor Kamar, Lantai, Nama Penghuni, No WhatsApp, Periode, Sewa Pokok, Add-on, Tunggakan Lalu, Denda, Diskon, Saldo Kredit, Total Tagihan, Terbayar, Sisa Piutang, Status, Metode, dan Status WA.
  - Browser otomatis mengunduh file dengan format nama:  
    `Matriks_Penagihan_RumaKost_Okt_2026_[TANGGAL_ISO].csv`.
  - Toast notifikasi sukses muncul:  
    *"Data matriks penagihan (14 tagihan) berhasil diekspor ke file CSV (Excel)!"*.

---

### SKENARIO 26: Penanganan Kondisi Data Kosong (Filter Zero State vs Absolute Zero State)
* **Tujuan**: Memastikan antarmuka memberikan umpan balik visual yang informatif saat kriteria pencarian tidak menemukan hasil.
* **Kondisi Awal**: Pengguna berada di tabel master tagihan.
* **Langkah-langkah**:
  1. Ketikkan kata kunci acak pada kotak pencarian: *"xyz999"*.
* **Hasil Diharapkan**:
  - Array hasil filter menghasilkan 0 data.
  - Baris tabel digantikan oleh tampilan **Filter Zero State**:
    - Ikon kotak masuk (*inbox*) transparan berukuran 36px.
    - Judul tebal: *"Tidak ada tagihan yang cocok dengan filter"*.
    - Subjudul panduan: *"Coba ubah kata kunci pencarian atau status filter."*.
  - Baris kontrol paginasi (`#billingPaginationBar`) otomatis disembunyikan (`display: none`).
  2. Hapus kata kunci pencarian.
  - Seluruh data tabel dan baris paginasi kembali tampil normal.

---

### SKENARIO 27: Aksesibilitas Keyboard, Penutupan Layer (ESC Key) & Dismiss Backdrop
* **Tujuan**: Memastikan pengguna dapat menutup setiap jendela modal dan dropdown menggunakan tombol keyboard `Escape` atau klik di luar modal.
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` atau `#modalCatatBayar` sedang terbuka di layar.
* **Langkah-langkah**:
  1. Tekan tombol **`Escape` (ESC)** pada keyboard fisik komputer.
* **Hasil Diharapkan**:
  - Event listener global `keydown` di `components.js` mendeteksi tombol ESC.
  - Kelas `.active` pada modal dilepas dan modal menutup mulus tanpa jeda.
  2. Buka kembali salah satu modal. Klik pada area backdrop gelap di luar kartu modal.
  - Modal tertutup seketika. Tidak ada perubahan data atau mutasi state yang tersimpan secara tidak sengaja.

---

### SKENARIO 28: Deep Linking URL Parameter Initialization (`?id=`, `?action=`, `?role=`)
* **Tujuan**: Menguji kemampuan inisialisasi state halaman secara otomatis dari parameter query URL rujukan navigasi lain.
* **Kondisi Awal**: Browser membuka URL dengan parameter:  
  `WF-05-tagihan.html?id=INV-202610-09&action=bayar`
* **Langkah-langkah**:
  1. Muat halaman dengan URL di atas.
* **Hasil Diharapkan**:
  - Skrip inisialisasi membaca parameter `id=INV-202610-09`.
  - Baris Kamar B-05 (Dian Permata) langsung terpilih sebagai baris aktif di tabel master.
  - Lembar dossier kanan langsung memuat data tagihan Kamar B-05.
  - Skrip mendeteksi `action=bayar` dan otomatis mengeksekusi `openModalCatatBayar()`, sehingga modal pencatatan pembayaran langsung terbuka untuk Kamar B-05 tanpa klik manual tambahan.
  2. Muat halaman dengan parameter `action=broadcast`.
  - Modal siaran pengingat WhatsApp langsung terbuka saat halaman selesai dimuat.

---

### SKENARIO 29: Adaptasi Tata Letak Responsif Tablet & Ponsel (Vertical Stack & Table Scroll)
* **Tujuan**: Memastikan antarmuka matriks tagihan tetap ergonomis saat dioperasikan pada layar tablet ($\le 1024\text{px}$) dan layar ponsel cerdas ($\le 768\text{px}$).
* **Kondisi Awal**: Browser dibuka pada resolusi tablet (lebar $1024\text{px}$) atau ponsel ($480\text{px}$).
* **Langkah-langkah**:
  1. Amati susunan tata letak workbench 2-kolom.
* **Hasil Diharapkan**:
  - Aturan media query `@media (max-width: 1024px)` berlaku: grid dua kolom `.workbench-layout-grid` bertransisi menjadi susunan vertikal satu kolom (*vertical stacked layout*).
  - Kolom Master Ledger (SCR-09) berada di bagian atas kanvas.
  - Panel Digital Paper Invoice Dossier (SCR-10) berpindah posisi ke bagian bawah tabel dengan posisi statis (`position: static`).
  - Baris 3 kartu metrik atas reflow dari 3 kolom menjadi 2 kolom (pada $\le 1100\text{px}$) atau 1 kolom tunggal (pada $\le 720\text{px}$).
  - Grid pemilih metode bayar pada modal reflow dari 5 kolom menjadi 3 kolom (pada $\le 480\text{px}$).
  - Tabel master ledger dilengkapi pembungkus *horizontal overflow scroll* yang mulus sehingga seluruh informasi tagihan tetap dapat diakses tanpa merusak layout layar ponsel.

---

### SKENARIO 30: Inspeksi Tagihan dengan Akumulasi Tunggakan Periode Lalu (Arrears Carry-Over)
* **Tujuan**: Memverifikasi penyajian data tagihan baru yang menggabungkan sisa piutang bulan sebelumnya secara transparan.
* **Kondisi Awal**: Tagihan **Kamar B-04 (`INV-202611-D03`, Eko Prasetyo)** berstatus Draf terpilih di dossier kanan.
* **Langkah-langkah**:
  1. Periksa baris Kamar B-04 pada tabel master ledger.
  2. Periksa rincian breakdown biaya pada panel Digital Paper Invoice Dossier di sisi kanan.
* **Hasil Diharapkan**:
  - Pada tabel master, nominal tagihan menampilkan badge oranye khusus: `+Tunggakan` dengan tooltip *"Termasuk tunggakan bulan lalu Rp 500.000"*.
  - Total nominal dihitung benar: Sewa Pokok `Rp 1.500.000` + Tunggakan Lalu `Rp 500.000` = `Rp 2.000.000`.
  - Pada dossier kanan, baris tunggakan (`#dossierArrearsRow`) otomatis ditampilkan (`display: flex`):
    - Label tunggakan (`#dossierArrearsLabel`): badge kuning bertuliskan *"Sisa Piutang Sewa Okt 2026"*.
    - Nilai tunggakan (`#dossierArrears`): tertera oranye tebal `+ Rp 500.000`.
  - Catatan delivery audit strip (`#auditMetaText`) mencantumkan: *"Dibuat otomatis 1 Nov · Termasuk Tunggakan Okt (Rp 500rb)"*.

---

### SKENARIO 31: Penanganan Kontrak Sewa Prabayar Tahunan di Muka (Annual Prepaid Rent)
* **Tujuan**: Memastikan sistem mengenali dan mengunci tagihan kamar yang telah dilunasi di awal untuk durasi satu tahun penuh.
* **Kondisi Awal**: Tagihan **Kamar B-03 (`INV-202610-12`, Putri Ramadhani)** terpilih di dossier.
* **Langkah-langkah**:
  1. Periksa kolom status pembayaran dan jatuh tempo pada tabel master untuk Kamar B-03.
  2. Periksa panel Digital Paper Invoice Dossier kanan.
* **Hasil Diharapkan**:
  - Kolom Jatuh Tempo pada tabel menampilkan badge hijau aman: `Prabayar 1 Tahun`.
  - Kolom Status Pembayaran menampilkan badge hijau: `Lunas (Prabayar 1 Thn)`.
  - Sisa tagihan tertera `Rp 0` (Lunas 100%).
  - Watermark stamp dossier menampilkan cap hijau: **"LUNAS"**.
  - Ringkasan metode bayar dossier menampilkan: *"Prabayar Tahunan (Transfer BCA)"*.
  - Riwayat pembayaran dossier mencatat waktu: *"Lunas di Muka (Kontrak 1 Thn)"* dengan referensi `REF-MDR-998120`.
  - Tombol aksi utama dossier otomatis menampilkan: *"Lihat / Cetak Kuitansi Lunas"*.

---

### SKENARIO 32: Mutasi Otomatis Status Tagihan Cicilan Menjadi Lunas Melalui Pemberian Diskon Sisa Piutang
* **Tujuan**: Menguji aturan transisi status otomatis saat pengelola memberikan diskon yang meniadakan seluruh sisa piutang berjalan (`dueAmount === 0 && paidAmount > 0`).
* **Kondisi Awal**: Kamar B-02 (Hendra Wijaya, `INV-202610-07`) berstatus `sebagian` (Total: Rp 1.500.000, telah terbayar Rp 1.000.000, sisa piutang: Rp 500.000).
* **Langkah-langkah**:
  1. Klik tombol **"Edit / Diskon"** pada footer dossier Kamar B-02.
  2. Pada input Diskon Potongan Biaya (`#adjustInvDiscount`), masukkan angka `500000` (senilai sisa saldo terutang).
  3. Isi Alasan Penyesuaian: *"Kompensasi renovasi atap bocor selama 1 minggu"*.
  4. Periksa kalkulasi: Total baru menjadi `Rp 1.000.000`, dan sisa saldo terutang menjadi `Rp 0`.
  5. Klik tombol **"Simpan Penyesuaian Tagihan"** (`saveInvoiceAdjustment()`).
* **Hasil Diharapkan**:
  - Logika sistem mendeteksi `inv.dueAmount === 0 && inv.paidAmount > 0`.
  - Status invoice secara otomatis bermutasi dari `'sebagian'` menjadi `'lunas'`.
  - Label status berubah menjadi: *"Lunas Terverifikasi"*.
  - Stempel dossier berubah dari "CICILAN" menjadi **"LUNAS"**.
  - Tombol aksi utama dossier langsung berganti dari "Catat Pembayaran Masuk" menjadi *"Lihat / Cetak Kuitansi Lunas"*.
  - Toast konfirmasi sukses muncul: *"Tagihan INV-202610-07 (B-02) berhasil disesuaikan: Total Rp 1.000.000."*.

---

### SKENARIO 33: Interaksi Custom Popover Dropdown Pemilih Kamar & Pencegahan Event Bubbling
* **Tujuan**: Memastikan menu dropdown pemilihan kamar pada modal penerbitan tagihan beroperasi lancar tanpa bentrok penutupan layer (*zero event bubbling conflict*).
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` terbuka.
* **Langkah-langkah**:
  1. Klik tombol trigger pemilih kamar (`#wrapNewBillRoom .btn-popover-trigger`).
* **Hasil Diharapkan**:
  - Fungsi `toggleNewBillRoomDropdown(event)` memanggil `event.stopPropagation()`.
  - Menu popover `#menuNewBillRoom` memperoleh kelas `.active` dan membuka daftar 7 opsi kamar berpenghuni.
  2. Klik opsi kamar **"B-01 · Fajar Ramadhan (Lantai 2)"** dengan tarif Rp 1.850.000.
  - Pilihan kamar diperbarui: trigger menampilkan *"B-01 · Fajar Ramadhan (Lantai 2)"*, tarif kontrak dasar berubah menjadi `Rp 1.850.000`.
  - Kelas `.selected` berpindah ke tombol opsi B-01.
  - Menu popover tertutup otomatis (`classList.remove('active')`).
  - Total tagihan baru dan rumus prorata (jika mode prorata aktif) langsung dikalkulasi ulang menyesuaikan tarif baru Rp 1.850.000.

---

### SKENARIO 34: Navigasi Cepat dari Notifikasi Sistem Topbar Menuju Lembar Tagihan Kritis
* **Tujuan**: Memvalidasi alur pemantauan pengelola saat menerima peringatan lonceng notifikasi dan langsung diarahkan ke modul tagihan.
* **Kondisi Awal**: Pengguna berada di halaman mana saja dalam aplikasi RumaKost.
* **Langkah-langkah**:
  1. Klik ikon lonceng notifikasi (`#notifBellBtn`) pada topbar navigasi atas.
  2. Temukan notifikasi belum dibaca:  
     *"Tagihan Menunggak: Kamar A-02 belum menyelesaikan pembayaran sewa Oktober (Terlambat 3 hari)"*.
  3. Klik item notifikasi tersebut.
* **Hasil Diharapkan**:
  - Toast notifikasi transisi muncul: *"Membuka tagihan menunggak Kamar A-02..."*.
  - Browser berpindah rute secara langsung menuju `WF-05-tagihan.html`.
  4. Klik tombol **"Tandai dibaca"** (`markAllNotifsRead(event)`).
  - Titik merah indikator notifikasi (`.notif-badge-dot`) menghilang dan seluruh item notifikasi bertransisi ke status telah dibaca.

---

### SKENARIO 35: Seleksi Cepat Tanggal Jatuh Tempo via Tombol Preset RumaDatePicker
* **Tujuan**: Memastikan pengelola dapat menentukan tanggal jatuh tempo secara instan menggunakan tombol pintas preset (*Hari Ini* dan *Awal Bulan Depan*).
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` atau `#modalCatatBayar` terbuka.
* **Langkah-langkah**:
  1. Klik trigger kalender RumaDatePicker (`#wrapNewBillDueDate` atau `#wrapPayDate`).
  - Popover kalender custom CMP-20 terbuka menampilkan grid tanggal bulan berjalan.
  2. Periksa bagian footer popover kalender: temukan dua tombol preset: **"Hari Ini"** dan **"Awal Bln Depan"**.
  3. Klik tombol **"Awal Bln Depan"** (`RumaDatePicker.selectPreset(..., 'next_month')`).
* **Hasil Diharapkan**:
  - Tanggal langsung disetel ke tanggal 1 bulan berikutnya (misal: `1 November 2026`).
  - Nilai input tersembunyi terisi format ISO: `2026-11-01`.
  - Teks trigger kalender menampilkan format ramah Indonesia: *"1 November 2026"*.
  - Popover kalender tertutup otomatis seketika.

---

### SKENARIO 36: Validasi Edge Case Tombol Bulk Verification saat Jumlah Draf Bernilai Nol
* **Tujuan**: Memastikan penanganan graceful error dan feedback informatif jika pengelola mengeksekusi verifikasi draf massal saat tidak ada draf yang tersisa.
* **Kondisi Awal**: Seluruh 3 draf tagihan telah diverifikasi menjadi aktif (jumlah draf = 0).
* **Langkah-langkah**:
  1. Jalankan fungsi `verifyAllDrafts()` (misal dipicu ulang dari konsol atau shortcut).
* **Hasil Diharapkan**:
  - Sistem memeriksa `drafts.length === 0`.
  - Tidak terjadi mutasi data atau rendering tabel yang sia-sia (*guard clause executed*).
  - Toast info informatif muncul ke layar:  
    *"Tidak ada draf tagihan yang perlu diverifikasi."*.

---

### SKENARIO 37: Kombinasi Penyaringan Multi-Dimensi Bersamaan (Compound Cross-Filtering)
* **Tujuan**: Memverifikasi ketepatan logika penyaringan saat pengguna mengombinasikan filter status pembayaran, partisi lantai, dan kata kunci pencarian teks secara bersamaan.
* **Kondisi Awal**: Seluruh 14 data tagihan tampil (filter status: Semua, lantai: Semua, pencarian: kosong).
* **Langkah-langkah**:
  1. Klik tab status **"Lunas"** (`switchFilterStatus('lunas')`) -> menyaring 7 tagihan lunas.
  2. Klik filter lantai **"Lt 1"** (`switchFloor('1')`) -> mempersempit hasil hanya ke kamar Lantai 1 yang lunas (A-01, A-02, A-03, A-05).
  3. Ketikkan kata kunci *"dimas"* pada kotak pencarian teks (`handleSearch('dimas')`).
* **Hasil Diharapkan**:
  - Sistem mengevaluasi ketiga kriteria filter secara serentak (`&&` logic):
    - `inv.status === 'lunas'`
    - `inv.floorNum === '1'`
    - `inv.tenant.toLowerCase().includes('dimas')`
  - Tabel master secara presisi hanya menyisakan tepat 1 baris data: **Kamar A-02 (Dimas Pratama)**.
  - Informasi paginasi memperbarui: *"Menampilkan 1–1 dari 1 tagihan"*.
  - Tidak terjadi konflik filter antar state variabel `currentFilterStatus`, `currentFilterFloor`, dan `currentSearchQuery`.

---

### SKENARIO 38: Regenerasi Otomatis Nomor Referensi Transaksi Unik Berdasarkan Metode Pembayaran
* **Tujuan**: Memastikan form pencatatan pembayaran menghasilkan format nomor referensi audit yang sesuai dengan kanal transaksi yang dipilih pengelola.
* **Kondisi Awal**: Modal `#modalCatatBayar` terbuka untuk salah satu tagihan.
* **Langkah-langkah**:
  1. Periksa nilai awal field nomor referensi (`#inputPayRef`): terisi otomatis format BCA (`TRF-BCA-xxxxxx`).
  2. Klik metode pembayaran **"QRIS"** (`selectPaymentMethod(this, 'QRIS Instant')`).
  - Nilai field `#inputPayRef` seketika berganti format menjadi: `QRIS-OKT-xxxxxx`.
  3. Klik metode pembayaran **"Mandiri"** (`selectPaymentMethod(this, 'Bank Mandiri')`).
  - Nilai field `#inputPayRef` berganti format menjadi: `TRF-MDR-xxxxxx`.
  4. Klik metode pembayaran **"Tunai"** (`selectPaymentMethod(this, 'Tunai / Cash')`).
  - Nilai field `#inputPayRef` berganti format menjadi: `KAS-TUNAI-xxxxxx`.
  5. Klik metode pembayaran **"Deposit"** (`selectPaymentMethod(this, 'Potong Deposit')`).
  - Nilai field `#inputPayRef` berganti format menjadi: `DEP-KLAIM-[INVOICE_ID]`.
* **Hasil Diharapkan**:
  - Input referensi transaksi berstatus `readonly` (mencegah salah ketik manual oleh pengelola).
  - Setiap pergantian metode memperbarui nomor unik secara dinamis dan transparan demi akurasi jejak audit mutasi kas.

---

### SKENARIO 39: Kustomisasi Pesan Bebas pada Siaran WA & Penanganan Gelembung Pratinjau Kosong
* **Tujuan**: Memastikan pengguna dapat mengetik pesan pengingat bebas (tanpa template) dengan live preview gelembung WhatsApp yang responsif.
* **Kondisi Awal**: Modal `#modalBroadcast` terbuka.
* **Langkah-langkah**:
  1. Hapus seluruh isi teks pada textarea pesan siaran (`#broadcastMsgInput`).
* **Hasil Diharapkan**:
  - Gelembung live preview WhatsApp (`#broadcastPreviewTxt`) secara otomatis menampilkan teks fallback penjelas:  
    *"(Isi pesan siaran kosong)"*.
  2. Ketikkan pesan kustom sendiri:  
     *"Pagi Kak [Nama Penyewa], mohon segera konfirmasi sewa Kamar [Kamar] ya sebesar [Total Tagihan]. Ditunggu siang ini."*
  - Gelembung preview secara reaktif me-replace variabel:  
     `[Nama Penyewa]` -> *"Budi Santoso"*  
     `[Kamar]` -> *"A-04"*  
     `[Total Tagihan]` -> *"Rp 1.300.000"*  
  - Teks terformat rapi menyerupai tampilan pesan WhatsApp nyata.

---

### SKENARIO 40: Proteksi Aksi Penyesuaian & Pembayaran pada Tagihan Berstatus BATAL (VOID)
* **Tujuan**: Memastikan seluruh tombol transaksi dan penyesuaian biaya terkunci secara mutlak saat suatu tagihan telah dibatalkan (*VOID state integrity*).
* **Kondisi Awal**: Tagihan Kamar A-01 periode November (`INV-202611-D01`) telah berstatus `batal` (*VOID*).
* **Langkah-langkah**:
  1. Pilih tagihan yang telah dibatalkan tersebut di tabel master.
  2. Amati tombol aksi utama (Primary CTA) pada panel Digital Paper Invoice Dossier kanan.
* **Hasil Diharapkan**:
  - Tombol aksi utama berubah menjadi abu-abu mati: *"Tagihan Dibatalkan (Void)"* dengan kursor `not-allowed`.
  3. Klik tombol aksi utama tersebut (`handleDossierPrimaryAction()`).
  - Sistem menolak eksekusi dan memunculkan Toast Info:  
    *"Tagihan ini telah dibatalkan (Status: VOID) dan tidak dapat diproses lagi."*.
  4. Coba panggil fungsi penyesuaian biaya untuk tagihan ini (`openModalAdjustInvoice('INV-202611-D01')`).
  - Sistem menolak membuka modal penyesuaian dan memunculkan Toast Warning:  
    *"Tagihan #INV-202611-D01 telah dibatalkan (Status: VOID). Tidak dapat disesuaikan lagi."*.
  5. Coba klik tombol "Kirim ke WA" (`sendInvoiceWhatsApp()`).
  - Sistem menolak dengan Toast Warning:  
    *"Tagihan #INV-202611-D01 telah dibatalkan (Status: VOID). Tidak dapat dikirim ke WhatsApp penghuni."*.

---

### SKENARIO 41: Watermark Dinamis Kuitansi Resmi pada Berbagai Status Tagihan
* **Tujuan**: Memastikan dokumen kuitansi resmi menampilkan cap air (*watermark*) yang tepat sesuai dengan status penyelesaian tagihan.
* **Kondisi Awal**: Pengguna membuka modal kuitansi resmi (`#modalReceipt`).
* **Langkah-langkah**:
  1. Buka kuitansi untuk tagihan berstatus **Lunas** (misal Kamar A-01, `INV-202610-01`).
* **Hasil Diharapkan**:
  - Watermark latar belakang lembar kuitansi (`#receiptWatermark`) menampilkan teks besar: **"LUNAS"** dengan rona hijau lembut (`rgba(22, 163, 74, 0.08)`).
  2. Buka kuitansi untuk tagihan berstatus **Cicilan Sebagian** (misal Kamar B-02, `INV-202610-07`).
  - Watermark berganti otomatis menampilkan teks: **"CICILAN"** dengan rona oranye-amber (`rgba(217, 119, 6, 0.08)`).
  3. Buka kuitansi untuk tagihan yang masih berstatus **Jatuh Tempo / Belum Bayar** (misal Kamar A-04, `INV-202610-04`).
  - Watermark berganti otomatis menampilkan teks: **"TAGIHAN"** dengan rona merah lembut (`rgba(239, 68, 68, 0.08)`).

---

### SKENARIO 42: Sanitasi Input Format Nominal Mata Uang Non-Digit & Pencegahan State NaN
* **Tujuan**: Memastikan field input uang (Rupiah) kebal terhadap karakter abjad atau simbol aneh dan terformat ribuan secara otomatis.
* **Kondisi Awal**: Modal `#modalCatatBayar` atau `#modalAdjustInvoice` terbuka.
* **Langkah-langkah**:
  1. Pada field nominal diterima (`#inputPayAmount`), ketikkan kombinasi karakter tidak valid: *"abc!@#$1500000xyz"*.
* **Hasil Diharapkan**:
  - Fungsi `formatNominalInput(input)` mengekstrak angka murni (`input.value.replace(/\D/g, '')`).
  - Seluruh karakter huruf dan simbol dibersihkan seketika.
  - Nilai angka terformat otomatis dengan pemisah ribuan titik Indonesia: `1.500.000`.
  2. Hapus seluruh isi field (input kosong atau backspace habis).
  - Sistem tidak menghasilkan nilai `NaN` atau tampilan rusak, melainkan menyetel nilai fallback: `'0'`.
  - Kalkulasi sisa saldo berjalan (`calculateBalancePreview()`) tetap berjalan stabil dan aman.

---

### SKENARIO 43: Proteksi Rentang Tanggal Terbalik pada Kalkulator Prorata (Negative Date Diff Guard)
* **Tujuan**: Memastikan kalkulator hitungan sewa prorata hari berjalan terlindungi dari kesalahan input tanggal masuk yang melebihi tanggal akhir bulan.
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` terbuka, skema sewa berada pada mode "Prorata Tengah Bulan".
* **Langkah-langkah**:
  1. Masukkan Tanggal Masuk Check-in: `2026-10-31`.
  2. Masukkan Akhir Siklus Bulan secara keliru: `2026-10-15` (tanggal akhir lebih awal dari tanggal masuk).
* **Hasil Diharapkan**:
  - Logika perhitungan `diffDays = Math.round((d2 - d1) / ...) + 1` menghasilkan nilai negatif.
  - Aturan *Date Boundary Guard* sistem bekerja: `if (diffDays < 1) diffDays = 1` dan `if (diffDays > 31) diffDays = 31`.
  - Nilai hari berjalan pada badge (`#prorataDaysBadge`) otomatis disetel aman ke: `1 Hari Berjalan`.
  - Nominal sewa prorata tetap valid untuk minimal 1 hari, mencegah nominal sewa bernilai negatif atau minus.

---

### SKENARIO 44: Penyesuaian Otomatis Halaman Paginasi saat Pengurangan Data (Pagination Page Overflow Guard)
* **Tujuan**: Memastikan sistem secara otomatis mengembalikan posisi halaman aktif ke halaman 1 saat pengguna berpindah ke filter dengan jumlah data yang lebih sedikit dari halaman saat ini.
* **Kondisi Awal**: Filter status berada pada tab "Semua" (14 data). Pengguna sedang berada di **Halaman 2** (`billingCurrentPage = 2`).
* **Langkah-langkah**:
  1. Klik tab filter **"Cicilan"** (`switchFilterStatus('partial')`) yang hanya memiliki 1 data.
* **Hasil Diharapkan**:
  - Total halaman baru menjadi 1 (`totalPages = 1`).
  - Logika guard paginasi bekerja: `if (billingCurrentPage > totalPages) billingCurrentPage = totalPages`.
  - Nilai halaman aktif otomatis dikoreksi kembali ke `billingCurrentPage = 1`.
  - Tabel langsung menampilkan 1 baris Kamar B-02 tanpa mengalami tampilan kosong (*zero blank screen*).
  - Teks paginasi memperbarui: *"Menampilkan 1–1 dari 1 tagihan"*.

---

### SKENARIO 45: Sanitasi Format Nomor Telepon pada Ekspor CSV (Excel Leading Zero Protection)
* **Tujuan**: Memastikan nomor kontak WhatsApp penyewa (awalan `08...`) tidak kehilangan angka nol di depan saat file CSV dibuka di Microsoft Excel.
* **Kondisi Awal**: Pengguna berada di halaman utama `WF-05`.
* **Langkah-langkah**:
  1. Klik tombol **"Ekspor CSV"** (`exportBillingMatrixToCSV()`).
  2. Buka file CSV hasil unduhan menggunakan aplikasi spreadsheet atau teks editor.
* **Hasil Diharapkan**:
  - Kolom nomor telepon diekspor dengan format khusus: `\'${inv.phone}` (misal: `'0812-3456-7890`).
  - Tanda petik tunggal (`'`) memaksa Microsoft Excel memperlakukan kolom tersebut sebagai teks string, bukan tipe numerik integer.
  - Angka nol di depan (`08...`) tetap utuh 100% dan tidak berubah menjadi `8123456...`.

---

### SKENARIO 46: Fallback Salin Clipboard pada Lingkungan Browser Non-Secure (Clipboard API Fallback)
* **Tujuan**: Memastikan pengguna tetap menerima umpan balik informatif ketika API `navigator.clipboard` ditolak atau berjalan di protokol non-HTTPS.
* **Kondisi Awal**: Pengguna membuka halaman pada lingkungan tanpa izin clipboard API aktif.
* **Langkah-langkah**:
  1. Klik tombol salin nomor invoice di samping header dossier (`copyInvoiceId()`).
* **Hasil Diharapkan**:
  - Blok `.catch()` terpanggil saat `navigator.clipboard.writeText()` ditolak browser.
  - Sistem menampilkan Toast Info yang mencantumkan nomor invoice: *"Nomor invoice #INV-202610-04"*.
  2. Klik tombol "Link Portal" (`copyTenantPortalLink()`).
  - Blok `.catch()` menampilkan Toast Info memuat URL lengkap: *"Tautan portal tagihan: http://.../WF-10-portal-penghuni.html?inv=INV-202610-04"*.

---

### SKENARIO 47: Penanganan Stop-Propagation pada Checkbox Kirim Kuitansi WA (Double-Toggle Prevention)
* **Tujuan**: Memastikan interaksi klik tepat pada kotak centang tidak memicu pembatalan centang akibat klik ganda (*double toggle bug*).
* **Kondisi Awal**: Modal `#modalCatatBayar` terbuka.
* **Langkah-langkah**:
  1. Klik tepat pada elemen checkbox kotak centang WhatsApp (`#checkboxSendWaReceipt`).
* **Hasil Diharapkan**:
  - Atribut `onclick="event.stopPropagation()"` pada checkbox mencegah event bubbling merambat ke pembungkus `div` luar (`toggleSendWaCheckbox()`).
  - Checkbox beralih status secara presisi dari tercentang menjadi tidak tercentang (atau sebaliknya) tepat satu kali.
  2. Klik pada area teks pembungkus box di samping checkbox.
  - Event `toggleSendWaCheckbox()` terpanggil dan membalik status centang dengan mulus.

---

### SKENARIO 48: Kondisi Saldo Nol pada Modal Catat Bayar untuk Tagihan yang Telah Lunas (Already Settled Bill State)
* **Tujuan**: Memastikan antarmuka kalkulasi memberikan status penjelas yang tepat saat modal pembayaran dibuka untuk tagihan yang sebelumnya telah lunas.
* **Kondisi Awal**: Tagihan Kamar A-02 (`INV-202610-02`, status Lunas) dibuka di modal catat bayar dengan nominal bayar `0`.
* **Langkah-langkah**:
  1. Periksa baris ringkasan saldo baru (`#calcNewDue`) pada `.calculation-callout`.
* **Hasil Diharapkan**:
  - Logika sistem mendeteksi kondisi: `diff === 0 && prevDue === 0`.
  - Teks saldo baru tertera hijau cerah:  
    `Rp 0 (Tagihan Sudah Lunas Sebelumnya)`.
  - Mencegah kebingungan pengelola bahwa tagihan tersebut memang tidak memiliki sisa piutang terutang.

---

### SKENARIO 49: Proteksi Double-Click & Idempotensi Tombol Transaksi Finansial (Debounce & Button Disabling Guard)
* **Tujuan**: Mencegah terjadinya duplikasi pencatatan pembayaran atau penerbitan tagihan ganda akibat klik ganda cepat (*rapid double-click*) oleh pengelola.
* **Kondisi Awal**: Modal `#modalCatatBayar` atau `#modalTerbitkanTagihan` terbuka.
* **Langkah-langkah**:
  1. Klik tombol submit secara cepat sebanyak 2 kali berturut-turut (*rapid double-click*).
* **Hasil Diharapkan**:
  - Flag lock (`isSubmittingPayment` / `isSubmittingNewBill`) aktif seketika pada klik pertama.
  - Tombol submit memperoleh atribut `disabled="true"`, penurunan opasitas, dan pointer-events dinonaktifkan.
  - Klik kedua diblokir sepenuhnya tanpa memicu eksekusi mutasi data tambahan.
  - Hanya tepat 1 transaksi yang tersimpan ke dalam array buku besar `invoicesData`.

---

### SKENARIO 50: Validasi Defensif Nominal Rp 0 pada Modal Pembayaran (Zero-Value Payment Guard)
* **Tujuan**: Memastikan pengguna tidak dapat mencatat pembayaran dengan nominal Rp 0 atau string kosong yang berisiko memicu bug pelunasan fiktif.
* **Kondisi Awal**: Modal `#modalCatatBayar` terbuka untuk tagihan aktif Kamar A-04 (sisa Rp 1.300.000).
* **Langkah-langkah**:
  1. Pada field nominal diterima (`#inputPayAmount`), ketikkan angka `0` atau hapus seluruh isinya.
  2. Klik tombol **"Simpan Catatan Pembayaran"**.
* **Hasil Diharapkan**:
  - Sistem menolak pemrosesan transaksi.
  - Toast Warning muncul: *"Nominal pembayaran harus lebih besar dari Rp 0."*.
  - Fokus kursor otomatis kembali ke field `#inputPayAmount`.
  - Tagihan tetap berstatus belum lunas tanpa perubahan saldo.

---

### SKENARIO 51: Pencegahan Penerbitan Tagihan Ganda untuk Unit & Periode Sama (Duplicate Billing Guard)
* **Tujuan**: Mencegah pembuatan dua faktur sewa aktif untuk kamar dan bulan yang sama (*overbilling prevention*).
* **Kondisi Awal**: Modal `#modalTerbitkanTagihan` terbuka. Kamar A-01 sudah memiliki tagihan aktif periode Oktober 2026.
* **Langkah-langkah**:
  1. Pilih unit Kamar A-01 dengan kategori "Sewa Kamar".
  2. Klik tombol **"Terbitkan & Kirim Notifikasi"**.
* **Hasil Diharapkan**:
  - Sistem mendeteksi `existingActiveBill` dengan kriteria unit sama, periode sama, dan status belum dibatalkan.
  - Proses penerbitan dibatalkan seketika.
  - Toast Warning muncul: *"Unit Kamar A-01 sudah memiliki tagihan sewa aktif (#INV-...) untuk periode Oktober 2026. Mencegah tagihan ganda!"*.
  - Tidak ada faktur baru yang ditambahkan ke daftar ledger.

---

### SKENARIO 52: Pencegahan Selisih Buku Besar akibat Diskon Melebihi Sisa Tagihan (Ledger Consistency Guard)
* **Tujuan**: Memastikan nilai penyesuaian diskon tidak menurunkan total tagihan di bawah nominal uang yang telah disetor oleh penghuni (`computedTotal < inv.paidAmount`).
* **Kondisi Awal**: Kamar B-02 memiliki total tagihan Rp 1.500.000 dan telah dicicil sebesar Rp 1.000.000 (`paidAmount = 1000000`, sisa piutang Rp 500.000). Modal `#modalAdjustInvoice` terbuka.
* **Langkah-langkah**:
  1. Masukkan diskon sebesar `Rp 700.000` (sehingga total tagihan menjadi Rp 800.000, padahal penghuni sudah bayar Rp 1.000.000).
  2. Klik tombol **"Simpan Penyesuaian Tagihan"**.
* **Hasil Diharapkan**:
  - Sistem mengevaluasi `computedTotal < inv.paidAmount`.
  - Sistem menolak menyimpan perubahan.
  - Toast Warning muncul: *"Diskon terlalu besar! Total tagihan (Rp 800.000) tidak boleh lebih kecil dari uang yang sudah dicicil (Rp 1.000.000)."*.
  - Menjaga konsistensi neraca buku besar agar tidak terjadi anomali `paidAmount > totalAmount`.

---

### SKENARIO 53: Proteksi Pembatalan (Void) pada Tagihan dengan Pembayaran Cicilan Aktif (Partial Payment Void Guard)
* **Tujuan**: Memastikan tagihan yang sudah memiliki mutasi kas masuk sebagian (cicilan) dilarang dibatalkan langsung via Void.
* **Kondisi Awal**: Kamar B-02 (status cicilan, telah membayar Rp 1.000.000) terpilih di dossier.
* **Langkah-langkah**:
  1. Buka modal pembatalan tagihan melalui fungsi `openModalVoidInvoice()`.
* **Hasil Diharapkan**:
  - Sistem memeriksa `inv.paidAmount > 0`.
  - Modal pembatalan dilarang terbuka.
  - Toast Warning muncul: *"Tagihan yang memiliki riwayat pembayaran (Lunas / Cicilan) tidak dapat dibatalkan lewat Void. Lakukan Koreksi / Reversal di menu Pembayaran terlebih dahulu."*.

---

### SKENARIO 54: Validasi Format Nomor Kontak Seluler Indonesia pada Tautan WhatsApp (Indonesian Phone Sanitizer)
* **Tujuan**: Mencegah tautan WhatsApp rusak (*broken link*) saat kontak penghuni tidak valid atau kosong.
* **Kondisi Awal**: Salah satu data tagihan memiliki nomor telepon non-standar (misal: "021-123456" atau hanya 3 digit "081").
* **Langkah-langkah**:
  1. Klik tombol **"Kirim ke WA"** (`sendInvoiceWhatsApp()`).
* **Hasil Diharapkan**:
  - Fungsi `validateIndonesianPhone()` memvalidasi format regex `/^628[1-9][0-9]{7,11}$/`.
  - Validasi gagal.
  - Browser tidak membuka tab WhatsApp kosong/rusak.
  - Toast Warning muncul: *"Nomor kontak WhatsApp penghuni (...) tidak valid! Format wajib nomor seluler aktif (08...)."*.

---

### SKENARIO 55: Penanganan Deep Link ID Tagihan yang Tidak Ditemukan (Invalid Query Parameter Fallback)
* **Tujuan**: Memastikan aplikasi tidak mengalami error senyap atau tampilan kosong jika pengguna mengakses tautan dengan parameter ID yang salah atau telah dihapus.
* **Kondisi Awal**: Browser membuka URL: `WF-05-tagihan.html?id=INV-999999-NOTFOUND`.
* **Langkah-langkah**:
  1. Halaman dimuat secara lengkap.
* **Hasil Diharapkan**:
  - Skrip inisialisasi mendeteksi `paramId` tidak ada di array `invoicesData`.
  - Toast Warning muncul: *"ID Tagihan #INV-999999-NOTFOUND dari URL tidak ditemukan. Menampilkan data awal."*.
  - Sistem otomatis memilih tagihan pertama yang valid (`currentSelectedId = 'INV-202611-D01'`) sebagai fallback aman tanpa layar putih (*no blank screen crash*).

---

### SKENARIO 56: Proteksi Integritas Akumulasi Tunggakan Lalu saat Penyesuaian Biaya (Arrears Preservation Guard)
* **Tujuan**: Memastikan nilai tunggakan bulan sebelumnya (`previousArrears`) tidak terhapus saat pengelola menyimpan penyesuaian biaya tambahan atau diskon sewa.
* **Kondisi Awal**: Kamar B-04 (`INV-202611-D03`) memiliki sewa pokok Rp 1.500.000 dan tunggakan lalu Rp 500.000 (Total Rp 2.000.000). Modal `#modalAdjustInvoice` dibuka.
* **Langkah-langkah**:
  1. Periksa kotak kalkulasi: baris `#adjustSummaryArrearsRow` menampilkan *"Tunggakan Bulan Lalu: + Rp 500.000"*.
  2. Tambahkan biaya tambahan WiFi: `Rp 50.000`.
  3. Klik tombol **"Simpan Penyesuaian Tagihan"** (`saveInvoiceAdjustment()`).
* **Hasil Diharapkan**:
  - Formula perhitungan menyertakan tunggakan: `Rp 1.500.000 + Rp 500.000 + Rp 50.000 = Rp 2.050.000`.
  - Total kewajiban tersimpan `Rp 2.050.000` (tunggakan Rp 500.000 tetap terjaga dan tidak hilang).
  - Toast sukses mengonfirmasi penyesuaian total baru Rp 2.050.000.

---

### SKENARIO 57: Proteksi Pembagian Nol pada Kalkulasi Progres Pelunasan (Zero-Division Percentage Guard)
* **Tujuan**: Memastikan antarmuka tidak menampilkan teks rusak `"NaN%"` saat total kewajiban tagihan bernilai Rp 0.
* **Kondisi Awal**: Tagihan memiliki `totalAmount = 0` (misal akibat pembebasan penuh atau diskon 100%).
* **Langkah-langkah**:
  1. Amati rendering baris tabel dan lembar dossier untuk tagihan tersebut.
* **Hasil Diharapkan**:
  - Fungsi `getPaymentPercentage()` mengevaluasi `total <= 0` dan mengembalikan nilai aman `0%` (atau `100%` jika `paidAmount > 0`).
  - Tidak ada teks `"NaN% Terbayar"` atau `"Cicilan (NaN%)"` di layar.
  - Lebar progress bar disetel aman (`width: 0%` atau `100%`) tanpa layout glitch.

---

### SKENARIO 58: Proteksi Akses Catat Bayar pada Tagihan Draf & Batal (Draft & Void Payment Blocker)
* **Tujuan**: Memastikan modal pencatatan pembayaran dilarang dibuka untuk faktur yang masih draf belum terbit atau yang telah dibatalkan (VOID).
* **Kondisi Awal**: Tagihan berstatus Draf (`INV-202611-D01`) atau Batal terpilih di sistem.
* **Langkah-langkah**:
  1. Jalankan fungsi `openModalCatatBayar()` (misal via parameter URL `?action=bayar`).
* **Hasil Diharapkan**:
  - Sistem mendeteksi `inv.status === 'draf'` atau `'batal'`.
  - Modal pembayaran ditolak untuk dibuka.
  - Toast Warning muncul: *"Tagihan #INV-... masih berstatus Draf / Batal. Verifikasi & terbitkan tagihan terlebih dahulu sebelum mencatat pembayaran."*.
  - Eksekusi `submitPaymentRecord()` juga memiliki guard clause ganda untuk menolak mutasi data pada status draf/batal.

---

### SKENARIO 59: Penanganan Tampilan Kolom Progres & Persentase Pelunasan pada Tagihan Dibatalkan (Void State Display Guard)
* **Tujuan**: Memastikan tabel master dan lembar dossier tidak menampilkan status "Lunas 100%" atau kalkulasi persentase aktif saat tagihan telah dibatalkan (VOID).
* **Kondisi Awal**: Tagihan Kamar A-01 atau B-05 dibatalkan melalui modal pembatalan (`confirmVoidInvoice()`), menyetel `dueAmount = 0` dan `status = 'batal'`.
* **Langkah-langkah**:
  1. Amati rendering baris tabel pada kolom Total Tagihan & Progres Pelunasan.
  2. Amati panel dossier kanan pada pod progres pelunasan.
* **Hasil Diharapkan**:
  - Kolom progres tabel master menampilkan label abu-abu netral: *"Tagihan Dibatalkan"*, bukan label hijau *"Lunas 100%"*.
  - Pod progres dossier menampilkan teks *"Dibatalkan"* dengan bar progres 0%.
  - Seluruh informasi visual selaras dengan status pembatalan dan tidak menimbulkan kesalahpahaman pencatatan keuangan.

---

### SKENARIO 60: Proteksi Integritas Kuitansi & Pengiriman Tanda Terima WhatsApp (Receipt Integrity Guard)
* **Tujuan**: Memastikan lembar kuitansi resmi dan pengiriman tautan kuitansi via WhatsApp dilarang dibuka untuk tagihan draf, tagihan dibatalkan (VOID), atau tagihan aktif yang belum memiliki riwayat pembayaran (`paidAmount === 0`).
* **Kondisi Awal**: Tagihan berstatus Draf (`INV-202611-D01`), Batal, atau Belum Bayar terpilih di sistem.
* **Langkah-langkah**:
  1. Panggil fungsi `openReceiptModal()` atau `sendReceiptWhatsApp()` secara langsung.
* **Hasil Diharapkan**:
  - Sistem memeriksa integritas status dan riwayat pembayaran:
    - Jika status `'batal'`: Menolak dengan Toast Warning *"Tagihan yang telah dibatalkan (VOID) tidak memiliki kuitansi pembayaran."*.
    - Jika status `'draf'`: Menolak dengan Toast Warning *"Tagihan berstatus draf belum memiliki kuitansi pembayaran."*.
    - Jika `paidAmount === 0` dan belum lunas: Menolak dengan Toast Warning *"Tagihan ini belum memiliki pembayaran tercatat untuk diterbitkan kuitansi."*.
  - Lembar modal kuitansi dilarang terbuka dan tab browser WhatsApp tidak diluncurkan.

---

### SKENARIO 61: Proteksi Transisi Status pada Penerbitan Draf Satuan (Draft Verification State Enforcement)
* **Tujuan**: Memastikan fungsi penerbitan draf tagihan satuan (`verifyAndPublishInvoice`) hanya dapat dijalankan pada faktur yang berstatus `'draf'`, serta menolak mutasi status pada faktur yang telah aktif, lunas, atau dibatalkan.
* **Kondisi Awal**: Tagihan yang sudah berstatus Lunas (`INV-202610-02`) atau Batal terpilih di sistem.
* **Langkah-langkah**:
  1. Eksekusi fungsi `verifyAndPublishInvoice('INV-202610-02')`.
* **Hasil Diharapkan**:
  - Sistem mendeteksi `inv.status !== 'draf'`.
  - Sistem menolak eksekusi mutasi.
  - Toast Info muncul: *"Tagihan #INV-202610-02 (A-02) sudah aktif atau berstatus LUNAS. Tidak perlu diverifikasi lagi."*.
  - Data buku besar tagihan tetap terlindungi tanpa mengalami regresi perubahan status menjadi 'tempo'.

---

## 4. Matriks Ringkasan Kepatuhan & Status Pengujian

| ID Skenario | Nama Skenario | Komponen UI Terlibat | Kepatuhan Scope Baseline | Status Verifikasi |
|---|---|---|---|---|
| **SK-01** | Inspeksi Tagihan & Seleksi Invoice Dossier | Table Row, Dossier Pane SCR-10 | Single Property (Kost Budi Makmur) | **PASSED (100%)** |
| **SK-02** | Filter Multi-Status Pembayaran (Segment Tabs) | `.filter-segment-tabs`, Master Table | F-04 / RK-028 (Daftar & Filter Tagihan) | **PASSED (100%)** |
| **SK-03** | Filter Kluster Lantai Gedung (Lt 1, Lt 2, Lt 3) | `.floor-filter-pills`, Filter State | F-02 Master Kamar & Partisi Lantai | **PASSED (100%)** |
| **SK-04** | Pencarian Multi-Entitas Real-Time & Clear Btn | `#billSearchInput`, `#clearSearchBtn` | F-04 / Pencarian Instan Client-Side | **PASSED (100%)** |
| **SK-05** | Paginasi Estify Clean (10-Row Pagination) | `#billingPaginationBar`, Page Cluster | F-04 / Estify Zero-Native Controls | **PASSED (100%)** |
| **SK-06** | Interaktivitas Metric Card Arus Kas & Distribusi | Metric Card 3, Clickable Bar & Chips | RK-035 Ringkasan Arus Kas Masuk | **PASSED (100%)** |
| **SK-07** | Terbitkan Tagihan On-Demand Sewa + Deposit | `#modalTerbitkanTagihan`, Escrow Opt | F-04 / RK-027 Tagihan Perdana & Escrow | **PASSED (100%)** |
| **SK-08** | Kalkulator Prorata Hari Berjalan Otomatis | `#prorataCalcBox`, Date Range Inputs | F-04 Hitungan Prorata Tengah Bulan | **PASSED (100%)** |
| **SK-09** | Terbitkan Tagihan Insidental Listrik & Denda | Radio Kategori, Preset Auto-fill | F-04 Tagihan Non-Sewa On-Demand | **PASSED (100%)** |
| **SK-10** | Verifikasi & Penerbitan Draf Satuan (Draf to Active) | Dossier Primary CTA, `#dossierDraftNotice` | F-04 / RK-027 Draf Rutin Tanggal 1 | **PASSED (100%)** |
| **SK-11** | Batch Verifikasi Semua Draf via Banner Hero | `#draftVerificationBanner`, Bulk Handler | F-04 Otomasi Tagihan Bulanan | **PASSED (100%)** |
| **SK-12** | Penyesuaian Tagihan, Diskon & Add-on Berjalan | `#modalAdjustInvoice`, Calc Summary | F-04 / F-05 Penyesuaian Biaya & Diskon | **PASSED (100%)** |
| **SK-13** | Pembebasan Denda Keterlambatan (Late Fee Waiver) | `#btnAdjustWaiveLateFee`, Waiver Handler| Kebijaksanaan Pemilik / Discretionary | **PASSED (100%)** |
| **SK-14** | Catat Bayar Tunai/Transfer & Pelunasan 100% | `#modalCatatBayar`, Dropzone Proof | F-05 / RK-030 Catat Klaim Pembayaran | **PASSED (100%)** |
| **SK-15** | Catat Pembayaran Parsial / Cicilan Bertahap | Balance Preview, Mini Progress Bar | F-05 / RK-032 Saldo Parsial Cicilan | **PASSED (100%)** |
| **SK-16** | Kelebihan Bayar & Otomasi Saldo Kredit Penghuni | Credit Balance Surplus Logic, Badges | F-05 Saldo Kredit Mengendap | **PASSED (100%)** |
| **SK-17** | Pelunasan Potong Deposit (Escrow Settlement) | `#depositCalloutBox`, Non-cash Ref | F-05 Escrow Settlement Tanpa Mutasi Bank| **PASSED (100%)** |
| **SK-18** | Zero Self-Approval Staf Operasional | `#modalStaffAlert`, Pending Validation | RBAC Boundary / Zero Self-Approval | **PASSED (100%)** |
| **SK-19** | Pembatalan Tagihan (Void Invoice dengan Alasan)| `#modalVoidInvoice`, `#dossierVoidNotice`| RK-033 Audit Trail Pembatalan | **PASSED (100%)** |
| **SK-20** | Toggle Manual Status Delivery WA (RK-029) | `.btn-toggle-wa`, Audit Timestamp Strip | RK-029 Pencatatan Status Penyampaian | **PASSED (100%)** |
| **SK-21** | Kirim Nota Tagihan via Link WhatsApp Manual | `.btn-dossier-secondary-pill`, `wa.me/` | Zero Bot / Tautan Resmi Manual | **PASSED (100%)** |
| **SK-22** | Siaran Pengingat WA Massal (4 Template & Preview)| `#modalBroadcast`, WhatsApp Bubble | Zero Bot / Draf Template Personalisasi | **PASSED (100%)** |
| **SK-23** | Pratinjau & Cetak Kuitansi Resmi Pelunasan | `#modalReceipt`, `window.print()` | F-05 Bukti Tanda Terima Sah | **PASSED (100%)** |
| **SK-24** | Salin No. Invoice & Link Portal ke Clipboard | Copy Handlers, Navigator Clipboard | F-04 Aksesibilitas Data Cepat | **PASSED (100%)** |
| **SK-25** | Ekspor Matriks Penagihan Lengkap ke CSV | `.btn-export-csv`, UTF-8 Blob Download | F-04 / F-06 Rekapitulasi Data Keuangan | **PASSED (100%)** |
| **SK-26** | Penanganan Filter Zero State (Pencarian Nihil)| Table Empty State Row, Inbox Lucide | UX Hygiene / Zero Broken Layout | **PASSED (100%)** |
| **SK-27** | Aksesibilitas Keyboard (ESC) & Dismiss Backdrop | Keydown Global Listener, Modal Overlays | A11y / Keyboard Navigation Standard | **PASSED (100%)** |
| **SK-28** | Deep Linking URL Query Params Handling | `URLSearchParams` Initialization Logic | Inter-Module Routing (`WF-02`, `WF-06`)| **PASSED (100%)** |
| **SK-29** | Adaptasi Responsif Tablet & Ponsel Cerdas | Media Queries (`≤1024px`, `≤480px`) | Mobile Layout & Touch Ergonomics | **PASSED (100%)** |
| **SK-30** | Inspeksi Akumulasi Tunggakan Lalu (Arrears) | `#dossierArrearsRow`, `+Tunggakan` Pill | F-04 Carry-Over Piutang Sewa Lalu | **PASSED (100%)** |
| **SK-31** | Penanganan Sewa Prabayar Tahunan di Muka | `Prabayar 1 Tahun` Chip, Locked Lunas | F-03 / F-04 Kontrak Sewa 1 Tahun Penuh | **PASSED (100%)** |
| **SK-32** | Mutasi Otomatis Cicilan ke Lunas via Diskon | `saveInvoiceAdjustment()`, Auto-lunas | F-04 / F-05 Domain Transition Guard | **PASSED (100%)** |
| **SK-33** | Popover Dropdown Kamar & Stop Propagation | `#wrapNewBillRoom`, `stopPropagation` | UX Form Hygiene / Event Handling | **PASSED (100%)** |
| **SK-34** | Navigasi Lonceng Notifikasi Topbar ke Tagihan | Notification Bell Dropdown CMP-03 | Inter-Page Communication | **PASSED (100%)** |
| **SK-35** | Tombol Preset Kalender RumaDatePicker | `selectPreset('today' / 'next_month')` | CMP-20 Zero-Native Custom Calendar | **PASSED (100%)** |
| **SK-36** | Edge Case Bulk Verification saat Draf Kosong | `verifyAllDrafts()`, Guard Clause Toast | F-04 Idempotent Batch Action | **PASSED (100%)** |
| **SK-37** | Compound Cross-Filtering (Status+Lantai+Cari)| Multiple Filter Logic Evaluator | F-04 Multi-Dimensional Data Filter | **PASSED (100%)** |
| **SK-38** | Auto-Regenerasi No. Referensi Per Metode Bayar| Dynamic Prefix (`TRF-BCA`, `DEP-KLAIM`)| F-05 Jejak Audit Mutasi Kas Masuk | **PASSED (100%)** |
| **SK-39** | Kustomisasi Pesan Bebas & Preview WA Fallback| Live Bubble Text Parser & Fallback | Zero Bot WhatsApp Template Hygiene | **PASSED (100%)** |
| **SK-40** | Proteksi Aksi Total pada Tagihan Batal (VOID)| VOID Action Guards & Toast Blockers | F-04 / F-05 Immutable Void Record | **PASSED (100%)** |
| **SK-41** | Watermark Dinamis Kuitansi Resmi Multi-Status | `#receiptWatermark` (LUNAS/CICILAN/TAGIHAN)| F-05 Bukti Transaksi Kontekstual | **PASSED (100%)** |
| **SK-42** | Sanitasi Input Nominal Uang & NaN Defense | `formatNominalInput()`, Fallback '0' | Robust Input Validation Hygiene | **PASSED (100%)** |
| **SK-43** | Proteksi Rentang Tanggal Terbalik Prorata | `diffDays < 1` Guard, Min 1 Day Clamp | Edge Case Defensive Date Math | **PASSED (100%)** |
| **SK-44** | Koreksi Overflow Halaman Paginasi Otomatis | `billingCurrentPage > totalPages` Guard| Paginasi Estify Zero Broken State | **PASSED (100%)** |
| **SK-45** | Sanitasi Format No. Telepon CSV Leading Zero | Excel Text Prefix `\'${inv.phone}` | Interoperabilitas Data Excel/CSV | **PASSED (100%)** |
| **SK-46** | Fallback Clipboard Non-Secure Context | `.catch()` Notification Fallback Toast | Browser Security & A11y Resilience | **PASSED (100%)** |
| **SK-47** | Stop-Propagation Checkbox Kirim Kuitansi WA | `event.stopPropagation()` on Checkbox | UI Event Bubbling Bug Prevention | **PASSED (100%)** |
| **SK-48** | Saldo Nol Catat Bayar Tagihan Lunas | `diff === 0 && prevDue === 0` State | F-05 Penanganan Tagihan Nihil | **PASSED (100%)** |
| **SK-49** | Proteksi Double-Click & Idempotensi Tombol Transaksi | Form Action Buttons Locking & Debounce | Financial Integrity & Anti-Duplicate | **PASSED (100%)** |
| **SK-50** | Validasi Defensif Nominal Pembayaran Rp 0 | `inputPayAmount <= 0` Guard Blocker | Bug Defense / Anti-Zero Auto Settle | **PASSED (100%)** |
| **SK-51** | Pencegahan Penerbitan Tagihan Ganda Periode Sama | Room & Period Duplication Evaluator | F-04 Anti Double-Billing Protection | **PASSED (100%)** |
| **SK-52** | Pencegahan Selisih Buku Besar akibat Diskon Berlebih| `computedTotal < inv.paidAmount` Guard | Accounting Ledger Consistency | **PASSED (100%)** |
| **SK-53** | Proteksi Pembatalan (Void) pada Tagihan Berbayar | `inv.paidAmount > 0` Void Blocker | Audit Trail & Cash Reversal Protection | **PASSED (100%)** |
| **SK-54** | Validasi Format Kontak Seluler Indonesia WA | `validateIndonesianPhone()` Regex | Zero Broken Links / WA Sanitization | **PASSED (100%)** |
| **SK-55** | Penanganan Fallback Deep Link ID Tidak Ditemukan | URL Parameter Safe Lookup & Fallback | Zero Blank Screen / Deep Link Hygiene | **PASSED (100%)** |
| **SK-56** | Proteksi Akumulasi Tunggakan Lalu saat Penyesuaian | `previousArrears` Preserved in Calc | Arrears Integrity & Anti Lost Debt | **PASSED (100%)** |
| **SK-57** | Proteksi Pembagian Nol Progres Pelunasan (NaN) | `getPaymentPercentage()` Safe Math Guard | Zero Divide by Zero / NaN Glitch | **PASSED (100%)** |
| **SK-58** | Proteksi Akses Catat Bayar Tagihan Draf & Batal | `inv.status === 'draf'/'batal'` Guard | State Transition Enforcement Gate | **PASSED (100%)** |
| **SK-59** | Penanganan Kolom Progres Tagihan Dibatalkan (VOID) | `renderBillingTable` & Dossier Void Check | Visual Integrity / Anti-False Paid | **PASSED (100%)** |
| **SK-60** | Proteksi Integritas Kuitansi & WA Draf/Batal/Nol | `openReceiptModal` & `sendReceiptWhatsApp` | Accounting Compliance & Proof Hygiene | **PASSED (100%)** |
| **SK-61** | Proteksi Transisi Status Penerbitan Draf Satuan | `verifyAndPublishInvoice` State Check | State Machine Integrity / Anti-Regress | **PASSED (100%)** |

