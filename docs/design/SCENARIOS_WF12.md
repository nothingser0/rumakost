# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-12: Detail Tiket Kerusakan, Pelacak 5 Tahap Estify & Thread Diskusi Multi-Peran (SCR-P05)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: [`docs/design/screens/WF-12-portal-tiket-detail.html`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-12-portal-tiket-detail.html)  
> **Fitur Terkait**: **F-01** (Akses Peran Penghuni & Staf), **F-07** (Ticketing Kerusakan Fasilitas, Galeri Bukti Media Wajib, Pelacakan Progres Servis, Diskusi Multi-Peran)  
> **User Stories KANBAN**: `RK-018` (Pelacakan Progres Tiket Kerusakan & Thread Chat Komentar Multi-Peran), `RK-019` (Verifikasi Hasil Pengerjaan Lapangan & Ulasan Kepuasan)  
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Kamar A-04 Budi Santoso), Staf Operasional (Mbak Rini), & Pemilik Kost**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-12 (`SCR-P05`)** menyajikan antarmuka pemantauan komprehensif atas status penanganan kerusakan fasilitas kost yang telah dilaporkan. Sesuai prinsip **Focused Task View (Tanpa Header Topbar Global)**, halaman ini memusatkan perhatian pengguna pada transparansi penanganan, dialog komunikasi langsung, dan verifikasi fisik perbaikan tanpa distraksi navigasi portal utama.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   WF-12 TIKET DETAIL ARSITEKTUR                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TOP UTILITY BAR: [← Kembali ke Portal Kamar]                    [● Kamar A-04 · Budi S] [+ Lapor]│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ BANNER NOTIFIKASI: [✔ Laporan Kerusakan Berhasil Diterbitkan! SLA: 2 Jam] (Kondisional ?new=true)│
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 1. KOLOM ALUR UTAMA (68% MAIN WORKFLOW)                          │ 2. SIDEBAR INFO & AKSI (32%)  │
│    ├─ HEADER: ID #TK-2026-004 · Pipa Wastafel Bocor & Menetes    │    ├─ CARD 1: TEKNISI UTAMA   │
│    │  • Badge Kategori: Pipa & Sanitasi                          │    │  • Pak Joko Santoso (4.9)│
│    │  • Badge Urgensi: Normal (SLA 24 Jam)                       │    │  • Status: Di Lokasi     │
│    │  • Izin Masuk Kamar: Disetujui Penghuni                     │    │  • [Hubungi via WhatsApp]│
│    │                                                             │    │                          │
│    ├─ SEKSI 1: ESTIFY 5-STEP SEGMENTED PROGRESS TRACKER          │    ├─ CARD 2: BIAYA & SUKU CDG│
│    │  • 1. Diterima (Hijau)                                      │    │  • Seal Silikon: 25.000  │
│    │  • 2. Ditugaskan (Hijau)                                    │    │  • Pipa Drainase: 35.000 │
│    │  • 3. Pengerjaan Lapangan (Oranye Pulse) [Active]           │    │  • Jasa Teknisi: 50.000  │
│    │  • 4. Pengecekan Bersama (Abu-abu)                          │    │  • Beban Penghuni: Rp 0  │
│    │  • 5. Selesai & Ditutup (Abu-abu)                           │    │    (Ditanggung Kost 100%)│
│    │  • [Simulasi Bar: Tahap 1 | 2 | 3 | 4 | 5]                  │    │                          │
│    │                                                             │    ├─ CARD 3: AKSI KONFIRMASI │
│    │    SEKSI 2: KRONOLOGI KELUHAN & GALERI FOTO F-07            │    │  • "Pengecekan Servis"   │
│    │  • Deskripsi Keluhan Awal Penghuni (Border Aksen Oranye)    │    │  • [Konfirmasi Selesai]  │
│    │  • Grid Bukti Foto: Wastafel Bocor, Genangan Lantai         │    │                          │
│    │  • Bukti Teknisi: Pipa PVC & Seal Baru Terpasang            │    └─ CARD 4: TIMELINE AUDIT  │
│    │  • Interaksi Lightbox Zoom Gambar Resolusi Penuh            │       • 09:15 Lapor           │
│    │                                                             │       • 09:30 Ditugaskan      │
│    │ ├─ SEKSI 3: RUANG DISKUSI MULTI-PERAN (THREAD CHAT)         │       • 10:10 Tiba di Lokasi  │
│    │  • Bubble Penghuni (Kanan, Peach #FFF7ED)                   │       • 10:15 Penggantian     │
│    │  • Bubble Staf Operasional (Kiri, Amber #FEF3C7)            │                               │
│    │  • Bubble Teknisi Rekanan (Kiri, Biru #EFF6FF)              │                               │
│    │  • Input Balas Pesan + Tombol Kirim + Auto-Scroll DOM       │                               │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai ketetapan **Frozen Scope Medium (1 Properti Mandiri, 7 Kelompok P0)** pada `docs/pm/SCOPE_STATEMENT.md`:

| Area Batasan | Ketetapan In-Scope | Batasan Mutlak (Out-of-Scope) |
| :--- | :--- | :--- |
| **Hak Akses & Modus Tampilan** | Menampilkan tiket kamar aktif milik penghuni (A-04). Mendukung mode staf operasional (`?role=staf`). | Tidak ada multi-properti switcher atau akses silang antar penghuni kamar berbeda. |
| **Transparansi Biaya** | Rincian suku cadang riil dengan penegasan biaya Rp 0 bagi penghuni untuk aus pemakaian wajar. | Penghuni dilarang ditagih pembayaran sepihak tanpa berita acara kerusakan kesengajaan. |
| **Verifikasi Visual Media** | Modal lightbox untuk meninjau detail visual sebelum dan sesudah perbaikan (Before/After). | Tidak ada pengeditan foto (crop/filter) di sisi aplikasi web MVP. |
| **Interaksi Thread Diskusi** | Log percakapan kronologis terintegrasi antara 3 pihak: Penghuni, Staf, dan Teknisi. | Bukan aplikasi instant messenger bebas (obrolan hanya seputar tiket terkait). |

---

## 3. Matriks Data Pengujian Baseline (Testing Fixtures)

* **Nomor Tiket**: `#TK-2026-004` (Tiket Eksisting Pipa Bocor) / `#TK-2026-005` (Jika diterbitkan baru)
* **Kamar & Pelapor**: Kamar A-04 (Lantai 2) &bull; Budi Santoso (`budi.penghuni@rumakost.id`)
* **Kategori Fasilitas**: Pipa & Sanitasi Air (`droplet`)
* **Tingkat Urgensi**: Normal (Sedang &bull; SLA Respons 24 Jam)
* **Teknisi Penanggung Jawab**: Pak Joko Santoso (`0812-3456-7890`) &bull; Spesialis Pipa (Rating 4.9 ★)
* **Staf Pendamping Operasional**: Mbak Rini (Staf Operasional RumaKost)
* **Dokumentasi Media (3 Berkas)**:
  1. `Foto_Pipa_Bocor.jpg` (Before &bull; Penghuni)
  2. `Genangan_Lantai.jpg` (Before &bull; Penghuni)
  3. `Pipa_Baru_Terpasang.jpg` (After &bull; Teknisi Pak Joko)

---

## 4. Daftar Lengkap 14 Skenario Pengujian End-to-End Terperinci

### SKENARIO 01: Navigasi Tanpa Header & Fungsionalitas Bar Utilitas Atas
- **Tujuan**: Memastikan topbar header global ditiadakan untuk konsentrasi tugas dan tombol navigasi kembali berfungsi mulus.
- **Kondisi Awal**: Pengguna membuka halaman `WF-12-portal-tiket-detail.html`.
- **Langkah Pengujian**:
  1. Periksa bagian atas: pastikan tidak ada `<header class="topbar">` standar admin.
  2. Amati elemen bar utilitas atas (`top-utility-bar`):
     - Tombol kembali `[← Kembali ke Portal Kamar]` di sisi kiri.
     - Badge identitas `Kamar A-04 • Budi Santoso` di sisi kanan.
     - Tombol pintas `[+ Lapor Baru]` yang mengarah ke `WF-11`.
  3. Klik tombol **"Kembali ke Portal Kamar"**.
- **Hasil yang Diharapkan**:
  - Halaman tampil bersih tanpa header global yang mendistraksi.
  - Klik tombol navigasi kembali berhasil mengarahkan pengguna ke `WF-10-portal-penghuni.html`.

---

### SKENARIO 02: Banner Notifikasi Penerbitan Tiket Baru (`?new=true`)
- **Tujuan**: Memvalidasi umpan balik visual ketika penghuni dialihkan dari formulir pembuatan tiket `WF-11`.
- **Kondisi Awal**: Pengguna mengakses tautan `WF-12-portal-tiket-detail.html?new=true`.
- **Langkah Pengujian**:
  1. Periksa bagian atas di bawah bar utilitas.
  2. Amati keberadaan banner hijau muda (`#ECFDF5` dengan border `#A7F3D0`).
  3. Verifikasi teks banner: *"Laporan Kerusakan Berhasil Diterbitkan! Tiket #TK-2026-004 telah masuk antrean triase staf. Teknisi rekanan ditargetkan merespons dalam 2 jam (SLA Normal)."*
  4. Klik ikon silang `[x]` pada sudut kanan banner.
- **Hasil yang Diharapkan**:
  - Banner konfirmasi sukses muncul secara elegan tanpa dialog browser pop-up.
  - Mengklik tombol silang menyembunyikan banner secara mulus.

---

### SKENARIO 03: Visualisasi Pelacak 5-Tahap Estify Segmented Stepper
- **Tujuan**: Memastikan progress bar 5 segmen Estify merefleksikan posisi pengerjaan saat ini secara intuitif.
- **Kondisi Awal**: Status tiket default berada pada Tahap 3 (Pengerjaan Lapangan).
- **Langkah Pengujian**:
  1. Amati kartu pelacak di bagian teratas kolom utama (`tracker-card`).
  2. Periksa badge status: *"Tahap 3 dari 5"* dan judul *"Sedang Dikerjakan di Lapangan"*.
  3. Periksa warna masing-masing segmen:
     - Segmen 1 (Laporan Diterima): Hijau solid `#10B981` (Selesai).
     - Segmen 2 (Teknisi Ditugaskan): Hijau solid `#10B981` (Selesai).
     - Segmen 3 (Pengerjaan Lapangan): Oranye brand `#FF7A00` dengan animasi denyut (*pulseBar*).
     - Segmen 4 (Pengecekan Bersama): Abu-abu netral `#E2E8F0` (Menunggu).
     - Segmen 5 (Selesai & Ditutup): Abu-abu netral `#E2E8F0` (Menunggu).
  4. Periksa teks label di bawah bar: Tahap 1 & 2 bertuliskan hijau tebal, Tahap 3 oranye tebal, Tahap 4 & 5 abu-abu.
- **Hasil yang Diharapkan**:
  - Stepper 5 segmen mengomunikasikan progres pengerjaan seketika tanpa kebingungan teknis.

---

### SKENARIO 04: Simulasi Transisi Tahapan Stepper (Step 1 s.d Step 5)
- **Tujuan**: Menguji responsivitas antarmuka saat status tiket berganti dari Tahap 1 hingga Tahap 5 melalui bilah simulator pengujian.
- **Kondisi Awal**: Pengguna berada pada halaman `WF-12-portal-tiket-detail.html`.
- **Langkah Pengujian**:
  1. Pada bilah simulasi abu-abu di bawah stepper, klik tombol **"Tahap 1"**.
     - Amati: Hanya segmen 1 aktif, status berganti ke *"Laporan Diterima (Menunggu Triase Staf)"*.
  2. Klik tombol **"Tahap 2"**.
     - Amati: Segmen 1 selesai (hijau), segmen 2 aktif (oranye), status berganti ke *"Teknisi Rekanan Ditugaskan (Pak Joko)"*.
  3. Klik tombol **"Tahap 4 (Cek)"**.
     - Amati: Segmen 1 s.d 3 selesai (hijau), segmen 4 aktif (oranye), kartu aksi samping berganti judul: *"Teknisi Selesai: Silakan Cek Bersama"* dan tombol utama berubah menjadi *"Konfirmasi Masalah Selesai & Beri Ulasan"*.
  4. Klik tombol **"Tahap 5 (Lunas/Tutup)"**.
     - Amati: Seluruh segmen 1 s.d 5 berwarna hijau selesai, kartu aksi samping menampilkan lencana hijau *"Masalah Telah Tuntas Terverifikasi"*.
- **Hasil yang Diharapkan**:
  - Setiap transisi memicu toast konfirmasi perubahan status dan memperbarui seluruh elemen dinamis secara sinkron.

---

### SKENARIO 05: Pemeriksaan Bukti Media F-07 & Modal Lightbox Full-Res
- **Tujuan**: Memastikan guardrail bukti media F-07 dapat ditinjau dalam resolusi tinggi oleh penghuni dan staf melalui modal lightbox.
- **Kondisi Awal**: Galeri foto menampilkan 3 kartu thumbnail foto (2 foto Before, 1 foto After).
- **Langkah Pengujian**:
  1. Arahkan kursor ke kartu foto pertama (*Pipa_Bocor.jpg*): amati efek hover sedikit terangkat dan ikon kaca pembesar muncul di sudut kanan atas.
  2. Klik kartu foto tersebut.
  3. Amati modal lightbox yang terbuka menutupi layar dengan latar gelap transparan (`#09090B`).
  4. Periksa judul modal: *"Foto Pipa Pembuangan Rembes (Diunggah oleh Budi S. saat pelaporan)"* dan timestamp *"24 Okt 2026, 09:12 WIB"*.
  5. Tekan tombol tombol **Escape** pada keyboard atau klik tombol silang `[x]`.
- **Hasil yang Diharapkan**:
  - Foto ditampilkan utuh (*object-fit: contain*) tanpa distorsi proporsi.
  - Modal lightbox tertutup dengan mulus saat tombol silang atau Escape ditekan.

---

### SKENARIO 06: Verifikasi Foto Suku Cadang Terpasang (After-Service Evidence)
- **Tujuan**: Memvalidasi transparansi bukti kerja fisik yang diunggah oleh teknisi rekanan kost.
- **Kondisi Awal**: Kartu foto ketiga berlabel *"Teknisi: Pipa_Baru.jpg"* dengan border biru muda.
- **Langkah Pengujian**:
  1. Klik kartu foto ketiga (*Pipa_Baru.jpg*).
  2. Periksa keterangan pada modal lightbox: *"Pipa PVC & Seal Silikon Baru Terpasang (Diunggah Teknisi Pak Joko)"*.
  3. Verifikasi timestamp pemasangan: *"Hari Ini, 10:45 WIB"*.
  4. Klik area backdrop di luar bingkai foto untuk menutup lightbox.
- **Hasil yang Diharapkan**:
  - Penghuni dapat melihat bukti fisik bahwa perbaikan telah benar-benar dikerjakan sebelum mengonfirmasi penutupan tiket.

---

### SKENARIO 07: Pengiriman Balasan Pesan pada Ruang Diskusi Multi-Peran
- **Tujuan**: Memvalidasi fitur kirim pesan balasan oleh penghuni ke dalam alur percakapan kronologis.
- **Kondisi Awal**: Container ruang diskusi menampilkan 3 pesan riwayat (Budi, Mbak Rini, Pak Joko).
- **Langkah Pengujian**:
  1. Gulir ke bagian **"Ruang Diskusi & Log Komunikasi Multi-Peran"**.
  2. Periksa badge penghitung pesan: *"3 Pesan Tersimpan"*.
  3. Pada kolom teks balasan, ketik: *"Terima kasih Pak Joko dan Mbak Rini. Nanti sore jam 17:00 saya tes kembali saat pulang kerja."*
  4. Klik tombol **"Kirim"** (atau tekan Enter jika didukung).
- **Hasil yang Diharapkan**:
  - Balon pesan baru muncul di bagian terbawah obrolan dengan alignment kanan (*bubble me*, aksen peach `#FFF7ED` dengan border `#FED7AA`).
  - Identitas pengirim mencantumkan *"Budi Santoso (Penghuni Kamar A-04)"* dan jam kirim saat ini.
  - Kolom teks langsung dikosongkan.
  - Wadah obrolan otomatis melakukan *scroll-to-bottom*.
  - Lencana counter pesan bertambah menjadi *"4 Pesan Tersimpan"*.
  - Toast sukses muncul: *"Pesan balasan berhasil dikirim ke teknisi dan staf"*.

---

### SKENARIO 08: Respons Otomatis Teknisi Simulatif saat Diskusi Pengujian Aliran
- **Tujuan**: Menguji simulasi alur interaksi dua arah cerdas saat penghuni membahas pengujian pipa.
- **Kondisi Awal**: Pengguna berada pada kolom input pesan balasan.
- **Langkah Pengujian**:
  1. Ketik pesan yang mengandung kata kunci pengujian: *"Tolong dicek dan dites alirannya ya Pak Joko."*
  2. Klik tombol **"Kirim"**.
  3. Tunggu selama 2.5 detik tanpa menyentuh layar.
- **Hasil yang Diharapkan**:
  - Setelah jeda 2.5 detik, sistem otomatis menginjeksi balon pesan balasan simulatif dari Pak Joko (Teknisi Rekanan):
    *"Siap Mas Budi, instalasi seal silikon sudah kering dan kami tes kran deras selama 5 menit. Tidak ada rembesan sama sekali, kondisi pipa aman dan kering sempurna."*
  - Balon pesan teknisi tampil di sisi kiri berwarna biru muda (`#EFF6FF`).
  - Toast informatif muncul: *"Pesan baru diterima dari Pak Joko (Teknisi)"*.
  - Lencana counter pesan diperbarui otomatis.

---

### SKENARIO 09: Pencegahan Pengiriman Pesan Balasan Kosong
- **Tujuan**: Memastikan sistem memvalidasi kelayakan input teks dan mencegah spam pesan tanpa konten.
- **Kondisi Awal**: Kolom teks balasan dalam keadaan kosong (hanya berisi spasi).
- **Langkah Pengujian**:
  1. Ketik beberapa spasi pada textarea atau biarkan kosong sama sekali.
  2. Klik tombol **"Kirim"**.
- **Hasil yang Diharapkan**:
  - Sistem mencegat aksi pengiriman.
  - Tidak ada balon pesan kosong yang bertambah di wadah obrolan.
  - Toast peringatan muncul: *"Harap tuliskan pesan balasan terlebih dahulu!"*.

---

### SKENARIO 10: Hubungi Teknisi Rekanan via Direct WhatsApp CTA
- **Tujuan**: Memastikan penghuni dapat melakukan eskalasi darurat langsung ke kontak WhatsApp resmi teknisi penanggung jawab.
- **Kondisi Awal**: Kartu teknisi samping menampilkan profil Pak Joko Santoso.
- **Langkah Pengujian**:
  1. Amati kartu samping *"Teknisi Penanggung Jawab"*.
  2. Periksa status badge: *"Sedang di Lokasi"* dengan indikator titik hijau berdenyut.
  3. Klik tombol hijau **"Hubungi Teknisi via WhatsApp"**.
- **Hasil yang Diharapkan**:
  - Browser membuka tautan WhatsApp resmi (`https://wa.me/6281234567890`) pada tab baru.
  - Pesan pembuka telah terformat rapi:
    *"Halo Pak Joko, saya Budi Santoso penghuni Kamar A-04 mengenai tiket pipa wastafel bocor #TK-2026-004"*.

---

### SKENARIO 11: Transparansi Rincian Biaya Servis (Kebijakan Rp 0 Beban Penghuni)
- **Tujuan**: Memvalidasi kepatuhan terhadap prinsip keterbukaan biaya dan garansi bebas pungli bagi penghuni kost.
- **Kondisi Awal**: Pengguna memeriksa kartu *"Rincian Biaya & Suku Cadang"*.
- **Langkah Pengujian**:
  1. Periksa rincian biaya:
     - Seal Karet Silikon Fleksibel 1.5": Rp 25.000
     - Pipa Sambungan PVC Drainase: Rp 35.000
     - Jasa Servis Teknisi Rekanan: Rp 50.000
  2. Periksa baris total beban biaya penghuni:
     - Teks: *"Beban Biaya Penghuni (Ditanggung 100% Pengelola Kost)"*.
     - Nominal: **Rp 0** berwarna hijau tebal (`#16A34A`).
  3. Baca catatan kebijakan di bawahnya: mengonfirmasi bahwa kerusakan aus wajar operasional harian kamar ditanggung penuh oleh manajemen RumaKost.
- **Hasil yang Diharapkan**:
  - Rincian biaya transparan dan nominal beban penghuni tercantum tegas Rp 0 tanpa klausul tersembunyi.

---

### SKENARIO 12: Modal Konfirmasi Penyelesaian & Ulasan Bintang Kepuasan (SCR-P05B)
- **Tujuan**: Memvalidasi alur penutupan tiket oleh penghuni disertai penilaian bintang kepuasan layanan teknisi.
- **Kondisi Awal**: Tiket berada pada Tahap 4 (Pengecekan Bersama).
- **Langkah Pengujian**:
  1. Pada kartu samping *"Pengecekan Hasil Servis"*, klik tombol oranye **"Konfirmasi Masalah Selesai"**.
  2. Amati modal konfirmasi ulasan yang muncul di tengah layar (`rating-modal-overlay`).
  3. Uji interaktivitas bintang ulasan:
     - Klik bintang ke-4: amati 4 bintang pertama menyala kuning keemasan (`#F59E0B`) dan label berubah menjadi *"Puas (4 Bintang)"*.
     - Klik bintang ke-5: amati seluruh bintang menyala dan label berubah menjadi *"Sangat Puas (5 Bintang)"*.
  4. Ketik testimoni pada kolom catatan: *"Perbaikan cepat, Pak Joko ramah dan wastafel kini tidak bocor lagi."*
  5. Klik tombol **"Kirim & Tutup Tiket"**.
- **Hasil yang Diharapkan**:
  - Modal tertutup secara halus.
  - Stepper 5 segmen langsung berpindah ke Tahap 5 (Selesai/Tutup) dengan seluruh segmen berwarna hijau.
  - Tombol aksi utama berubah menjadi lencana hijau: *"Masalah Telah Tuntas Terverifikasi"*.
  - Toast sukses muncul: *"Terima kasih! Tiket #TK-2026-004 telah ditutup dengan rating 5 bintang."*.

---

### SKENARIO 13: Adaptasi Peran Staf Operasional (`?role=staf` / `?from=staf`)
- **Tujuan**: Memastikan antarmuka dapat diakses secara adaptif oleh staf operasional dengan penyesuaian navigasi kembali ke antrean tiket staf.
- **Kondisi Awal**: Pengguna membuka halaman dengan parameter peran: `WF-12-portal-tiket-detail.html?role=staf`.
- **Langkah Pengujian**:
  1. Periksa tombol kembali di pojok kiri atas bar utilitas:
     - Teks berubah dari *"Kembali ke Portal Kamar"* menjadi *"Kembali ke Antrean Tiket"*.
     - Tautan tautan mengarah ke `WF-08-tiket.html?role=staf`.
  2. Periksa lencana identitas di sudut kanan atas:
     - Menampilkan ikon staf operasional dan teks: *"Staf Operasional: Mbak Rini"*.
  3. Klik tombol kembali.
- **Hasil yang Diharapkan**:
  - Staf operasional diarahkan kembali ke antrean tiket manajemen staf tanpa terlempar ke portal penghuni.

---

### SKENARIO 14: Responsivitas Tampilan Mobile & Bar Navigasi Bawah
- **Tujuan**: Memverifikasi tampilan detail tiket pada layar ponsel cerdas (viewport 375px s.d 414px).
- **Kondisi Awal**: Ubah ukuran jendela browser ke lebar 390px (standar iPhone / Android).
- **Langkah Pengujian**:
  1. Periksa penataan kolom: susunan 2 kolom otomatis reflow menjadi 1 kolom vertikal rapi (*single column layout*).
  2. Periksa bar utilitas atas: tombol kembali dan badge unit tetap proporsional tanpa terpotong (*no horizontal scroll*).
  3. Periksa stepper 5 segmen: segmen bar menyusut secara fleksibel dan teks label mengecil menjadi 10px tanpa tumpang tindih.
  4. Periksa galeri foto: tersusun dalam kisi 2 kolom responsif.
  5. Periksa bar navigasi bawah ponsel (`mobile-bottom-bar`):
     - Muncul di posisi tetap di dasar layar (*fixed bottom*).
     - Menu *"Detail Tiket"* dalam keadaan aktif bertinta oranye.
     - Lencana identitas mengambang bergeser ke atas bar bawah (*bottom: 74px*) agar tidak tertutup menu navigasi.
- **Hasil yang Diharapkan**:
  - Pengalaman pengguna di ponsel setara dengan aplikasi native (*PWA feel*), bebas overflow horizontal, dan seluruh tombol interaktif mudah disentuh jari (*touch target >= 44px*).

---

## 5. Ringkasan Status Kesiapan Layar WF-12

| Komponen Fungsional | Status Verifikasi | Catatan Mutu Estify Visual DNA |
| :--- | :---: | :--- |
| **Headerless Task Flow** | **LULUS (100%)** | Topbar global admin ditiadakan; utilitas navigasi kembali elegan. |
| **5-Step Segmented Tracker** | **LULUS (100%)** | Animasi denyut oranye Tahap 3, warna hijau semantik untuk tahap selesai. |
| **Simulasi Bilah Stepper** | **LULUS (100%)** | Penguji dapat beralih dinamis ke Tahap 1, 2, 3, 4, dan 5 secara instan. |
| **Galeri Bukti Media F-07** | **LULUS (100%)** | Foto Before/After dengan modal lightbox resolusi penuh & penutup Escape. |
| **Ruang Diskusi Multi-Peran** | **LULUS (100%)** | 3 bubble peran berbeda warna, input kirim dinamis, auto-scroll & auto-reply. |
| **Direct WhatsApp Teknisi** | **LULUS (100%)** | Tautan resmi `wa.me` dengan teks draft tiket #TK-2026-004 otomatis. |
| **Transparansi Biaya Rp 0** | **LULUS (100%)** | Rincian harga komponen jelas dan penegasan tanggungan kost 100%. |
| **Modal Ulasan Kepuasan** | **LULUS (100%)** | Selektor 5 bintang interaktif, penutupan tiket tuntas dengan feedback. |
| **Adaptasi Peran Staf** | **LULUS (100%)** | Dukungan query parameter `?role=staf` menuju `WF-08-tiket.html?role=staf`. |
| **Responsivitas Ponsel** | **LULUS (100%)** | Bottom bar navigasi mobile aktif, adaptasi layout rapi tanpa overflow. |

Dengan selesainya layar `WF-12-portal-tiket-detail.html` dan pembekuan 14 skenario runbook pada `SCENARIOS_WF12.md`, seluruh **12 Wireframe Modul M04 · UI/UX & Prototyping** resmi diselesaikan dan siap untuk **Design Freeze**.
