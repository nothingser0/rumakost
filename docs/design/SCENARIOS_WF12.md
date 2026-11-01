# SPESIFIKASI SKENARIO PENGUJIAN & ALUR PENGGUNA (RUNBOOK)
## WF-12: Detail Tiket Kerusakan, Pelacak 5 Tahap Estify & Thread Diskusi Multi-Peran (SCR-P05)

> **Modul**: M04 · UI/UX & Prototyping (Transisi ke M05 Arsitektur Teknis / M06 Implementasi Frontend & Backend)  
> **Acuan Desain**: [`docs/design/screens/WF-12-portal-tiket-detail.html`](file:///D:/Workspace/RumaKost/docs/design/screens/WF-12-portal-tiket-detail.html)  
> **Fitur Terkait**: **F-01** (Akses Peran Penghuni & Staf), **F-07** (Ticketing Kerusakan Fasilitas, Galeri Bukti Media Wajib, Pelacakan Progres Servis, Diskusi Multi-Peran)  
> **User Stories KANBAN**: `RK-018` (Pelacakan Progres Tiket Kerusakan & Thread Chat Komentar Multi-Peran), `RK-019` (Verifikasi Hasil Pengerjaan Lapangan; rating ditangguhkan di luar P0)
> **Hak Akses Layar**: **Penghuni Kost Sahaja (Kamar A-04 Budi Santoso), Staf Operasional (Mbak Rini), & Pemilik Kost**  

---

## 1. Ringkasan Eksekutif Layar

Layar **WF-12 (`SCR-P05`)** menyajikan antarmuka pemantauan komprehensif atas status penanganan kerusakan fasilitas kost yang telah dilaporkan. Sesuai prinsip **Focused Task View (Tanpa Header Topbar Global)**, halaman ini memusatkan perhatian pengguna pada transparansi penanganan, dialog komunikasi langsung, dan verifikasi fisik perbaikan tanpa distraksi navigasi portal utama.

WF-12 memuat detail tiket, status lima tahap, media privat, dan komentar pada tiket.
Penghuni hanya melihat dan berkomentar pada tiketnya sendiri selama lease aktif.
Owner/Staff mengelola status dan catatan internal. Semua otorisasi dilakukan server-side.
Akun Teknisi, SLA otomatis, biaya per tiket, rating, dan WhatsApp bukan bagian P0.

---

## 2. Batasan Ruang Lingkup Pengujian (Scope Guardrails)

Sesuai Frozen Scope Medium satu properti dan tujuh kelompok P0 di docs/pm/SCOPE_STATEMENT.md:

| Area | In-scope P0 | Di luar P0 / batas server |
| :--- | :--- | :--- |
| Akses | Owner/Staff mengelola tiket; Tenant melihat tiket sendiri selama lease aktif. | Parameter query hanya mengubah navigasi tampilan, bukan role atau otorisasi. Server memeriksa sesi, role, dan kepemilikan resource. |
| Status | Status tiket dan event perubahan tersimpan; Owner/Staff mengelola status. | Tenant tidak menutup atau membuka kembali tiket. Hanya Owner dapat membuka kembali tiket RESOLVED. |
| Media | Lampiran privat sebelum/sesudah servis; metadata dan retensi mengikuti F-07. | Server memeriksa isi objek, role/kepemilikan dan visibility, lalu membuat signed URL singkat. |
| Komentar | Komentar Tenant terlihat Tenant; catatan internal hanya Owner/Staff. Komentar terikat tiket. | Tidak ada akun Teknisi atau auto-reply. Respons tidak boleh membocorkan komentar/lampiran internal. |
| Biaya dan komunikasi | Tiket pemeliharaan dasar tanpa biaya servis tertaut. | SLA otomatis, biaya per tiket/Rp 0, direktori Teknisi, rating, notifikasi, dan WhatsApp berada di luar P0. |

---

## 3. Matriks Data Pengujian Baseline (Testing Fixtures)

* Nomor tiket: TK-2026-004 (fixture tiket pipa bocor) / TK-2026-005 (fixture tiket baru)
* Kamar dan pelapor: A-04, Budi Santoso (identitas sintetis)
* Kategori: Pipa dan sanitasi; prioritas NORMAL. Prioritas bukan janji waktu respons.
* Status awal detail: IN_PROGRESS, assignee internal Mbak Rini (Staff).
* Media: dua lampiran awal oleh Tenant dan satu bukti setelah servis yang diunggah Owner/Staff; ketiganya privat dan dapat dilihat sesuai otorisasi.
* Thread: komentar Tenant dan Staff saja. Tidak ada akun atau pesan Teknisi.

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

### SKENARIO 02: Banner Penerbitan Tiket Baru (?new=true)
- Tujuan: Memeriksa umpan balik visual setelah Penghuni mengirim tiket dari WF-11.
- Kondisi awal: Penghuni yang berwenang kembali dari pengiriman tiket.
- Langkah:
  1. Periksa banner konfirmasi dan nomor tiket yang dikembalikan server.
  2. Tutup banner dengan tombolnya.
- Hasil yang diharapkan:
  - Banner menampilkan konfirmasi penerimaan tanpa menjanjikan SLA atau waktu respons tertentu.
  - Tombol menutup banner; status tiket tetap berasal dari data server.

---

### SKENARIO 03: Visualisasi Pelacak 5-Tahap Estify Segmented Stepper
- **Tujuan**: Memastikan progress bar 5 segmen Estify merefleksikan posisi pengerjaan saat ini secara intuitif.
- **Kondisi Awal**: Fixture tiket tersimpan berstatus IN_PROGRESS (Tahap 3).
- **Langkah Pengujian**:
  1. Amati kartu pelacak di bagian teratas kolom utama (`tracker-card`).
  2. Periksa badge status: *"Tahap 3 dari 5"* dan judul *"Sedang Dikerjakan di Lapangan"*.
  3. Periksa warna masing-masing segmen:
     - Segmen 1 (Laporan Diterima): Hijau solid `#10B981` (Selesai).
     - Segmen 2 (Owner/Staff Ditugaskan): Hijau solid `#10B981` (Selesai).
     - Segmen 3 (Pengerjaan Lapangan): Oranye brand `#FF7A00` dengan animasi denyut (*pulseBar*).
     - Segmen 4 (Pengecekan Bersama): Abu-abu netral `#E2E8F0` (Menunggu).
     - Segmen 5 (Selesai & Ditutup): Abu-abu netral `#E2E8F0` (Menunggu).
  4. Periksa teks label di bawah bar: Tahap 1 & 2 bertuliskan hijau tebal, Tahap 3 oranye tebal, Tahap 4 & 5 abu-abu.
- **Hasil yang Diharapkan**:
  - Stepper 5 segmen mengomunikasikan progres pengerjaan seketika tanpa kebingungan teknis.

---

### SKENARIO 04: Simulasi Visual Transisi Stepper (UI Prototype)
- Tujuan: Memeriksa tampilan lima tahap pada prototipe.
- Kondisi awal: Buka simulator visual pada WF-12.
- Langkah:
  1. Pilih tahap 1 sampai 5 pada kontrol simulator.
  2. Periksa label dan warna setiap tahap.
- Hasil yang diharapkan:
  - Kontrol simulator hanya mengubah state visual lokal; tidak mengubah status tiket atau menulis ke database.
  - Status produksi mengikuti event tiket di server: RECEIVED, ASSIGNED, IN_PROGRESS, INSPECTION, RESOLVED. DRAFT belum masuk stepper; CANCELLED adalah status terminal di luar lima tahap.
  - Pada produksi hanya Owner/Staff yang dapat mengubah status; setiap perubahan valid menghasilkan histori aktor dan waktu. Resolusi memerlukan ringkasan.

---

### SKENARIO 05: Pemeriksaan Lampiran Privat dan Akses Media
- Tujuan: Memastikan galeri menampilkan lampiran yang boleh dilihat oleh role pada tiket.
- Kondisi awal: Tiket memuat lampiran foto berstatus AVAILABLE.
- Langkah:
  1. Buka lampiran dari detail tiket dengan akun yang berhak.
  2. Minta URL unduh melalui server.
  3. Ulangi dengan Tenant lain dan dengan lampiran yang tidak terlihat Tenant.
- Hasil yang diharapkan:
  - Pengguna berhak mendapat URL bertanda tangan berdurasi singkat; object key tidak dikirim ke browser.
  - Tenant lain atau Tenant tanpa hak ditolak (atau mendapat respons non-enumerating 404); UI tidak dapat melewati pemeriksaan server.
  - Media yang dihapus tidak bisa diunduh. Retensi media dimulai 365 hari setelah tiket ditutup; jika tiket dibuka kembali, hitung ulang dari penutupan berikutnya.
  - Pemeriksaan bytes/isi file tetap dilakukan server, bukan database.

---

### SKENARIO 06: Bukti Setelah Servis oleh Owner/Staff
- Tujuan: Memastikan bukti pengerjaan dapat ditambahkan oleh pengguna internal yang berwenang.
- Kondisi awal: Tiket sedang ditangani dan akun Staff/Owner memiliki akses.
- Langkah:
  1. Staff atau Owner mengunggah foto bukti setelah servis sebagai lampiran tiket.
  2. Minta URL tampilan untuk Tenant pemilik tiket.
  3. Ulangi permintaan dengan Tenant lain.
- Hasil yang diharapkan:
  - Lampiran tercatat dengan pengunggah Owner/Staff dan mengikuti batas media serta retensi tiket.
  - Tenant pemilik tiket dapat membaca lampiran yang diizinkan, termasuk pada akses riwayat read-only setelah lease berakhir; Tenant lain ditolak. Lease aktif tetap diwajibkan untuk mutasi Tenant.
  - Akun Teknisi/Pak Joko bukan aktor P0 dan tidak muncul sebagai pengunggah terautentikasi.

---

### SKENARIO 07: Balasan Penghuni pada Thread Tiket
- Tujuan: Memeriksa komentar kronologis Tenant pada tiket miliknya.
- Kondisi awal: Thread berisi dua komentar terlihat: satu dari Budi dan satu dari Mbak Rini.
- Langkah:
  1. Pastikan hanya komentar TENANT_VISIBLE ditampilkan pada tampilan Tenant.
  2. Budi mengirim komentar: "Terima kasih, nanti sore saya cek kembali saat pulang kerja."
  3. Muat ulang detail tiket.
- Hasil yang diharapkan:
  - Komentar baru tersimpan dengan author dan waktu; jumlah bertambah dari dua menjadi tiga.
  - Tenant hanya dapat mengirim komentar terlihat pada tiket miliknya selama lease aktif.
  - Balasan tidak menjanjikan pengiriman ke Teknisi eksternal; pesan INTERNAL dan lampirannya tidak pernah dikirim kepada Tenant.

---

### SKENARIO 08: Respons Otomatis Teknisi (Deferred)
- Status: Di luar P0; tidak dijalankan sebagai acceptance test.
- Alasan: P0 tidak memiliki akun Teknisi maupun mekanisme auto-reply. Thread hanya memakai aktor Owner, Staff, dan Tenant yang terautentikasi.

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

### SKENARIO 10: Hubungi Teknisi via WhatsApp (Deferred)
- Status: Backlog/out-of-scope; tidak dijalankan sebagai acceptance test.
- Alasan: Direktori/vendor Teknisi dan integrasi WhatsApp bukan bagian P0. Nomor fixture tidak digunakan untuk mengirim pesan atau membuat tautan komunikasi pada acceptance test.

---

### SKENARIO 11: Rincian Biaya Servis (Deferred)
- Status: Di luar model Ticket P0; tidak dijalankan sebagai acceptance test.
- Alasan: Expense berdiri sendiri dan tidak ditautkan ke Ticket. Database tidak menyimpan harga suku cadang, ongkos perbaikan, maupun beban Rp 0 per tiket. Jangan menampilkan angka tersebut sebagai fakta tersimpan atau jaminan kebijakan.

---

### SKENARIO 12: Konfirmasi Tenant dan Penutupan oleh Owner/Staff
- Tujuan: Memastikan Tenant dapat memberi konfirmasi terlihat, sedangkan status selesai dicatat oleh pihak internal yang berwenang.
- Kondisi awal: Tiket berstatus INSPECTION; lampiran setelah servis tersedia.
- Langkah:
  1. Tenant pemilik lease aktif memeriksa bukti setelah servis.
  2. Tenant mengirim komentar TENANT_VISIBLE untuk menyatakan hasil pemeriksaannya.
  3. Pastikan tiket masih INSPECTION; komentar Tenant tidak menutup tiket.
  4. Owner/Staff meninjau tiket dan mengubahnya menjadi RESOLVED dengan ringkasan penyelesaian.
  5. Periksa event status yang mencatat aktor, waktu, dan transisi INSPECTION ke RESOLVED.
- Hasil yang diharapkan:
  - Tenant tidak dapat mengubah status menjadi RESOLVED dan tidak dapat membuka kembali tiket.
  - Owner/Staff dapat menyelesaikan setelah ringkasan nonblank disimpan; hanya Owner dapat membuka kembali tiket RESOLVED.
  - Rating bintang/testimoni tidak disimpan dan tetap backlog.

---

### SKENARIO 13: Mode Navigasi Staf (?role=staf / ?from=staf)
- Tujuan: Memeriksa tautan kembali dan tampilan navigasi staf.
- Kondisi awal: Buka halaman dengan ?role=staf.
- Langkah:
  1. Periksa tautan kembali menuju antrean tiket Staf.
  2. Ubah/hapus parameter query dan periksa bahwa itu tidak mengubah role sesi.
  3. Coba akses tiket yang tidak diizinkan untuk akun tersebut.
- Hasil yang diharapkan:
  - Parameter query hanya menentukan konteks navigasi tampilan.
  - Server memeriksa sesi, role, dan kepemilikan tiket; query tidak memberi otorisasi.
  - Permintaan tanpa hak ditolak di server walau UI menampilkan mode staf.

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

## 5. Ringkasan Cakupan WF-12 untuk P0

| Area | Kontrak P0 |
| :--- | :--- |
| Status | Lima tahap memetakan RECEIVED, ASSIGNED, IN_PROGRESS, INSPECTION, RESOLVED. CANCELLED terminal; DRAFT pra-submit. |
| Aktor | Owner/Staff mengelola status. Tenant hanya membaca dan berkomentar pada tiket sendiri selama lease aktif. |
| Thread | Komentar append-only; Tenant hanya TENANT_VISIBLE; INTERNAL tidak dikirim ke tampilan Tenant. |
| Media | Lampiran privat; akses dan signed URL diperiksa server. Media dihapus setelah 365 hari dari penutupan sesuai lifecycle F-07. |
| Deferred | Akun/auto-reply Teknisi, SLA otomatis, biaya per tiket, rating, WhatsApp, dan notifikasi tidak menjadi acceptance P0. |

Hasil verifikasi desain M04 bukan bukti bahwa implementasi atau otorisasi backend telah lulus. Perilaku deferred tidak masuk acceptance test P0.

Dengan selesainya prototipe WF-12, skenario ini menjadi acuan desain M04. Implementasi tetap harus mengikuti scope P0 dan pemeriksaan server yang dirinci pada skenario serta crosswalk.

---