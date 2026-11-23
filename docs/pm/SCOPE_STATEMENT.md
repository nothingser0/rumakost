# Scope Statement & Requirements Breakdown

> Dokumen penguncian ruang lingkup resmi untuk **Rumakost** hasil elisitasi kebutuhan, riset empiris keluh kesah kos Indonesia, dan audit keamanan/anti-fraud lintas 6 role sebelum masuk ke fase desain UI/UX (`M04 · UI/UX & Prototyping`) dan spesifikasi arsitektur (`M05 · Architecture & Technical Specifications`).

---

## 1. Project Metadata & Document Control

- **Project Name**: Rumakost — Enterprise-Grade Multi-Property Boarding House & Coliving PMS
- **Client / Stakeholder**: zeenn (Solo Founder / Portfolio Owner)
- **Solo Developer / Consultant**: zeenn
- **Document Reference**: `docs/pm/IDEA_BRIEF.md` (v1.0) & `docs/pm/SOLO-CAPACITY-RISK-ACCEPTANCE.md`
- **Document Status**: `APPROVED`
- **Defined Project Scale**: Large (21 Must-Have P0 features; solo delivery under signed `SOLO-CAPACITY-RISK-ACCEPTANCE.md`)
- **Elicitation Completion Date**: 2026-11-23
- **Last Modified**: 2026-11-23

### Data Confidence Legend
| Icon | Level | Meaning | Rule |
|:--:|:--|:--|:--|
| ✅ | **VERIFIED** | Validated via scope owner sign-off, live empirical benchmark, or statutory text | May be built without further confirmation |
| 🔶 | **ASSUMPTION** | Working operational hypothesis; verified during M05/M06 | Confirm before M06 sprint lock |
| ❓ | **UNKNOWN** | Open requirement or technical uncertainty; blocks sprint scheduling | Resolve or move Out-of-Scope |

### Change Control & Scope Freeze Protocol
- **Scope Freeze Rule**: Setelah dokumen ini berstatus `APPROVED` / `LOCKED`, tidak ada fitur baru yang ditambahkan ke rilis v0 tanpa *Change Request (CR)* tertulis (maksimal tetap ≤ 25 P0 untuk menjaga batas skala Large).
- **Change Request (CR) Process**: Setiap perubahan ruang lingkup wajib menyertakan: (1) Deskripsi perubahan, (2) Dampak hari kerja, (3) Fitur yang digeser ke v1 jika kuota penuh, dan (4) Persetujuan tertulis pemilik scope (`zeenn`).

---

## 2. Business Objectives, Root Cause Breakdown & Metrics

### 2.1 Core Problem & 80/20 Root Cause Breakdown
- **Stated Problem Metric**: Operator kos multi-cabang kehilangan 15–30 jam/bulan untuk rekap tagihan manual dan menghadapi risiko kebocoran kas 5–15%/bulan akibat pencatatan tidak terisolasi, sengketa deposit tanpa bukti kondisi awal, serta keluhan kerusakan tanpa pelacakan SLA.
- **Primary Root Causes (≈ 80%)**:
  1. Tidak adanya pemisahan wewenang (*segregation of duties*) sehingga penjaga kos dapat memanipulasi kas/status kamar dan pemilik dapat memotong deposit sepihak.
  2. Perhitungan tagihan bulanan (sewa fleksibel + pro-rata + listrik token/sub-meter + parkir + tamu menginap + add-ons + denda) dilakukan manual di Excel/WhatsApp.
  3. Tidak ada transparansi foto meteran, rekening resmi terkunci, dan bukti handover *before/after* bagi penghuni.
  4. Penanganan komplain fasilitas vital tidak punya SLA dan jalur eskalasi.
- **Secondary Root Causes (≈ 20%)**: Otomasi pembayaran instan via payment gateway (v1), pemasaran listing publik/CRM (v1), dan integrasi akuntansi eksternal/OTA (v2).
- **Problem-Solution Fit Rule**: Seluruh 21 fitur P0 (v0) secara kolektif menyelesaikan ≥85% akar masalah primer (80%).

### 2.2 Project Success Criteria

| Outcome / metric | Definition | Baseline + source | Target + time window | Measurement source | Owner |
|---|---|---|---|---|---|
| **End-to-End Multi-Tenant Cycle** | Siklus lengkap (booking → kontrak → handover → meteran → parkir & tamu → cron invoice → verifikasi bayar → laporan laba rugi) berjalan lintas ≥2 Owner & ≥2 Cabang | 0 (greenfield portfolio, M01) | 100% skenario SIT lulus pada akhir Phase 3 (Minggu 20) | `docs/qa/SIT_WORKBOOK.md` & E2E test suite | zeenn |
| **Zero Defect Build & Runtime** | 0 error & 0 warning pada typecheck, linter, production build, dan runtime log | N/A (greenfield) | 0 error / 0 warning di seluruh fase M06–M07 | CI / local verify (`tsc`, lint, build, test) | zeenn |
| **Anti-Fraud & RBAC Isolation** | 0 celah IDOR lintas Owner/Cabang dan 0 pelanggaran batas wewenang 6 role | N/A (greenfield) | 100% test kasus negatif RBAC/IDOR lulus di M07 | Automated RBAC & security test suite | zeenn |

### 2.3 Primary Outcome Metric & Guardrails
- **North Star / Primary Outcome Metric**: **100% kelulusan skenario operasional end-to-end lintas ≥2 Owner dan ≥2 Cabang dengan 0 error/warning dan 0 kebocoran isolasi data** pada akhir M07 (Minggu 20).
- **Operational Guardrail Metrics (Must NOT degrade)**:
  - **Guardrail 1 (Performance)**: API p95 ≤ 500ms dan Frontend TTI ≤ 3.0 detik pada koneksi 4G.
  - **Guardrail 2 (Billing Idempotency)**: 0 invoice duplikat meskipun cron billing dijalankan berulang untuk periode yang sama.
  - **Guardrail 3 (Graceful Degradation)**: 100% proses billing dan pengingat tetap sukses (fallback ke Outbox + `wa.me`) ketika container WAHA sedang offline.

---

## 3. User Role Matrix & Approval Decision Tree (RBAC)

### 3.1 Role Permission Matrix (6 Roles + Anti-Fraud Guardrails)

| Role Code | Role Name | Create | Read | Update | Delete / Void / Archive | Special Permissions & Domain Guardrails |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ROL-01** | **Super Admin** | Owner/Org, sistem global | Semua tenant (hanya untuk administrasi, tercatat audit) | Konfigurasi platform & status tenant | Soft-delete / suspend tenant (Audit log wajib) | Setiap akses ke data sensitif/KTP lintas Owner wajib tercatat di *immutable audit log*; KTP diakses via *short-lived signed URL*. |
| **ROL-02** | **Owner** | Cabang, Staff, Kamar, Kebijakan Cabang, Kontrak, Kas | Seluruh data di bawah `org_id` miliknya | Semua entitas miliknya (kecuali handover & invoice yang sudah terkunci *immutable*) | Void/Reversal transaksi kas & terminasi kontrak (tanpa *hard-delete*) | **Satu-satunya role** yang boleh mengubah nomor rekening bank resmi cabang (wajib re-autentikasi password + audit log) & melakukan *Force Logout* staff. |
| **ROL-03** | **Branch Manager** | Kamar, Booking, Kontrak, Handover, Tiket, Pengumuman, Pengeluaran cabang | Hanya cabang yang ditugaskan (`branch_ids`) | Status kamar, kontrak, tiket, turnover di cabangnya | Ajukan Void/Adjustment (butuh approval Owner) | **ZERO SELF-APPROVAL** untuk pengajuan diskon/penghapusan denda/biaya perbaikan di atas ambang batas; tidak bisa ubah rekening bank cabang. |
| **ROL-04** | **Finance** | Invoice adjustment, Kwitansi, Buku Kas | Seluruh tagihan, bukti bayar, & kas cabang yang ditugaskan | Verifikasi bayar (`Approve`/`Reject`), catat *partial payment* & *bad debt write-off* | Void entri kas (wajib alasan, append-only) | **Tidak bisa mengubah nomor rekening bank cabang**; **ZERO SELF-APPROVAL** untuk reversal transaksi yang dibuat sendiri (butuh approval Owner). |
| **ROL-05** | **Caretaker (Penjaga Kos)** | Catat angka meteran + foto, log tamu menginap, checklist handover/turnover, update tiket maintenance | Daftar kamar, penghuni aktif (tanpa NIK/KTP), tugas housekeeping & maintenance di cabangnya | Progres tiket maintenance & checklist kebersihan | None (eskalasi ke Branch Manager) | **Segregation of Duties ketat**: dilarang approve pembayaran, dilarang ubah nominal invoice/denda, **ZERO ACCESS** ke foto KTP & NIK penuh (masking UU PDP). |
| **ROL-06** | **Tenant (Penghuni)** | Upload bukti transfer, ajukan tiket komplain, daftar tamu menginap, setujui handover | Hanya data kontrak, tagihan + foto meteran, rekening resmi cabang, pengumuman & Wi-Fi (saat kontrak `Active`) miliknya | Profil kontak darurat & upload ulang bukti bayar yang ditolak | None | Anti-IDOR ketat (`tenant_id === session.user.id`); 0 akses ke data penghuni/kamar lain; seluruh kalkulasi tagihan 100% *server-side*. |

### 3.2 Workflow Approval Decision Tree (Anti-Fraud & Zero Self-Approval)

```text
[Aksi Sensitif Dipicu] ──► Routing Persetujuan
├── Verifikasi Bukti Transfer Penghuni    ──► ROL-04 (Finance) atau ROL-02 (Owner) [ROL-05 Caretaker DIBLOKIR]
├── Perubahan Nomor Rekening Bank Cabang  ──► HANYA ROL-02 (Owner) + Re-Auth Password + Audit Log
├── Biaya Maintenance / Pengeluaran > Batas ──► ROL-03 (Branch Manager) → jika dibuat ROL-03, eskalasi ROL-02 (ZERO SELF-APPROVAL)
├── Potongan Deposit Check-Out            ──► Berbasis Foto Handover Before/After (Immutable) + Persetujuan ROL-02/ROL-03 + Transparan ke ROL-06
├── Void / Reversal Transaksi Kas         ──► Jika dibuat ROL-04 (Finance), wajib alasan & notifikasi/approval ROL-02 (ZERO SELF-APPROVAL)
├── Screening & Approval Booking DP       ──► ROL-03 (Branch Manager) atau ROL-02 (Owner)
└── Eskalasi Tiket Maintenance Urgent SLA ──► Auto-flag Overdue → Dashboard ROL-03 & ROL-02
```

---

## 4. Functional Scope Breakdown (MoSCoW)

> ℹ️ **IN-SCOPE CLARIFICATION**:
> - **P0 (Must-Have)**: Strictly IN-SCOPE untuk **v0 (21 Fitur — Skala Large, 3 Fase)**.
> - **P1 (Should-Have)**: Dijadwalkan untuk **v1 (14 Fitur — Pasca v0 stabil)**.
> - **P2 (Could-Have)**: Dijadwalkan untuk **v2 (7 Fitur — Skala Korporat & Ekosistem Eksternal)**.
> - **P3 (Won't-Have)**: Secara eksplisit DIKECUALIKAN (*Out-of-Scope*).

### 4.1 MoSCoW Feature Inventory

| Feature ID | Module / Domain | Functional Description | Priority | Est. Effort (Days) | Root Cause Addressed | Target Release | Confidence |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **F-01** | Fondasi & Akses | Hierarki Multi-Owner & Multi-Properti (`Owner → Cabang → Lantai → Kamar → Bed`) + Branch Policy (denda, grace period, tarif tamu, rekening resmi terkunci) | **P0 (Must)** | 3 days | Isolasi multi-cabang & aturan fleksibel | v0 (Phase 1) | ✅ |
| **F-02** | Fondasi & Akses | Auth (Email/Password), RBAC Granular 6 Role, Anti-Fraud Segregation of Duties, Force Logout Staff, Aktivasi Akun via Token 48 Jam & Reset Password via Outbox | **P0 (Must)** | 4 days | Pencegahan kecurangan antar role & akun tak sah | v0 (Phase 1) | ✅ |
| **F-03** | Fondasi & Akses | Immutable Audit Trail (perubahan kamar, tagihan, bayar, rekening) & UU PDP Baseline (masking NIK, private signed-URL KTP) | **P0 (Must)** | 3 days | Auditabilitas & privasi data pribadi | v0 (Phase 1) | ✅ |
| **F-04** | Kamar & Aset | Inventaris Kamar & Status Real-Time (`Available`, `Booked`, `Occupied`, `Cleaning`, `Maintenance`), tipe kamar, fasilitas & galeri | **P0 (Must)** | 2 days | Keterlacakan stok kamar akurat | v0 (Phase 1) | ✅ |
| **F-05** | Kamar & Aset | Skema Sewa Fleksibel (Harian/Menginap, Mingguan, Bulanan, Tahunan) + Kalkulasi Pro-Rata Otomatis Server-Side | **P0 (Must)** | 3 days | Salah hitung tarif & pro-rata manual | v0 (Phase 1) | ✅ |
| **F-06** | Kamar & Aset | Inventaris Aset Kamar, Log Kunci/Kartu Akses & Handover *Before/After* Berfoto (terkunci *immutable* setelah disetujui bersama) | **P0 (Must)** | 3 days | Sengketa potongan deposit sepihak | v0 (Phase 1) | ✅ |
| **F-07** | Penghuni & Kontrak | Onboarding Penghuni, KYC (KTP + kontak darurat), Dukungan Co-Tenant (Sekamar Berdua) & Ekspor Rekap Wajib Lapor RT/RW (PDF/CSV) | **P0 (Must)** | 3 days | Pendataan rapi & kepatuhan RT/RW | v0 (Phase 1) | ✅ |
| **F-08** | Penghuni & Kontrak | Kontrak Sewa Digital (PDF), Perpanjangan, Pindah Kamar, Terminasi Normal/Skip-Out (Kabur) + Internal Blacklist & Rincian Refund Deposit Transparan | **P0 (Must)** | 4 days | Bukti perjanjian, penanganan kabur & blacklist | v0 (Phase 1) | ✅ |
| **F-09** | Utilitas & Parkir | Manajemen Tamu Menginap (*Overnight Guest*: kuota malam gratis vs tarif per malam otomatis masuk invoice) | **P0 (Must)** | 2 days | Kebocoran biaya tamu menginap | v0 (Phase 2) | ✅ |
| **F-10** | Utilitas & Parkir | Listrik Mandiri (Mode Token PLN: ID meter + saldo kWh check-in/out) & Sub-Meter Listrik/Air Pascabayar (foto angka meteran tampil di invoice) | **P0 (Must)** | 3 days | Sengketa tagihan listrik tidak transparan | v0 (Phase 2) | ✅ |
| **F-11** | Utilitas & Parkir | Katalog Layanan Tambahan (Add-ons: laundry, cleaning, sewa alat) & Deklarasi Alat Elektronik Tambahan (*Appliance Surcharge*) | **P0 (Must)** | 2 days | Kebocoran & sengketa charge tambahan | v0 (Phase 2) | ✅ |
| **F-12** | Utilitas & Parkir | Manajemen Slot Parkir (Mobil/Motor/Sepeda), Plat Nomor, Kuota Cabang & Biaya Parkir Bulanan Otomatis | **P0 (Must)** | 2 days | Kontrol kapasitas & pendapatan parkir | v0 (Phase 2) | ✅ |
| **F-13** | Billing & Notifikasi | Auto-Generate Invoice Terpadu via Scheduled Cron Idempoten (sewa + pro-rata + utilitas + parkir + tamu + add-ons + denda) + Tombol Simulasi Demo | **P0 (Must)** | 4 days | Beban & salah hitung penagihan bulanan | v0 (Phase 2) | ✅ |
| **F-14** | Billing & Notifikasi | Verifikasi Pembayaran Manual, Cicilan (*Partial Payment*), *Credit Balance*, Cek Duplikat Hash Bukti Transfer, Kwitansi PDF & Interface `PaymentProvider` | **P0 (Must)** | 4 days | Pencegahan bukti palsu & kolusi kas | v0 (Phase 2) | ✅ |
| **F-15** | Billing & Notifikasi | Notification Outbox, Editor Template Pesan WAHA Dinamis, Pengumuman Cabang & Pengingat WA (dengan Fallback Otomatis ke Link `wa.me`) | **P0 (Must)** | 3 days | Tunggakan telat & otomatisasi komunikasi | v0 (Phase 2) | ✅ |
| **F-16** | Operasional & Portal | Ticketing Maintenance & Komplain dengan SLA Timer, Eskalasi Otomatis (`Overdue`) & Lampiran Struk Biaya Perbaikan | **P0 (Must)** | 3 days | Komplain kerusakan vital di-*ghosting* | v0 (Phase 3) | ✅ |
| **F-17** | Operasional & Portal | Portal Penghuni (*Tenant Portal*: kontrak, rekening resmi Owner, invoice + foto meteran, upload bukti bayar, tamu, komplain, pengumuman & Wi-Fi aktif) | **P0 (Must)** | 3 days | Transparansi penuh & cegah transfer ke penjaga | v0 (Phase 3) | ✅ |
| **F-18** | Operasional & Portal | Room Turnover & Housekeeping Checklist (Check-out otomatis memicu status `Cleaning` hingga checklist selesai baru `Available`) | **P0 (Must)** | 2 days | Kamar kotor tak terpantau pasca check-out | v0 (Phase 3) | ✅ |
| **F-19** | Akuisisi & Keuangan | Pipeline Survei, *Screening* & Approval Pemilik, serta Booking Kamar dengan DP + *Auto-Expire Hold* | **P0 (Must)** | 3 days | Kurangnya kontrol *screening* calon penghuni | v0 (Phase 3) | ✅ |
| **F-20** | Akuisisi & Keuangan | Buku Kas Operasional (*Append-Only Income & Expense* tanpa *hard-delete*, dukungan *Void/Reversal* & *Bad Debt Write-Off*) | **P0 (Must)** | 2 days | Manipulasi catatan kas & piutang macet | v0 (Phase 3) | ✅ |
| **F-21** | Akuisisi & Keuangan | Dashboard Eksekutif Multi-Properti & Laporan Keuangan (Okupansi, *Aging* Tunggakan, Laba Rugi per Cabang/Owner, Ekspor CSV/PDF) | **P0 (Must)** | 3 days | Visibilitas performa lintas cabang | v0 (Phase 3) | ✅ |
| **V1-01..V1-14** | Growth, Payment & Ops Lanjut | Midtrans/Xendit Payment Gateway Otomatis, Revenue Sharing & Owner Payout, Public Showcase, Promo/Voucher, CRM, Referral, Guest Parking Pass, Day Visitor Log, House Rules/SP/Blacklist, Mailroom, Common Area, Vendor/PO/Stok, Shift Caretaker, Preventive Maintenance | **P1 (Should)** | 30 days | Otomasi pembayaran & skala lanjutan | v1 (Post-v0) | 🔶 |
| **V2-01..V2-07** | Korporat & Ekosistem | Dynamic Pricing, Pajak PPN/PB1 & e-Faktur, General Ledger & Ekspor Accurate/Jurnal, Komunitas/Event/NPS, e-Meterai & TTE Tersertifikasi, Channel Manager OTA, Corporate Bulk Lease | **P2 (Could)** | 25 days | Ekspansi korporat & integrasi berbayar | v2 Backlog | 🔶 |
| **OOS-01..OOS-03** | Excluded | Hardware IoT Fisik (Smart Lock / Smart Meter), Marketplace Agregator Lintas-Owner & Iklan Berbayar, Aplikasi Mobile Native iOS/Android | **P3 (Won't)** | — | Di luar ruang lingkup v0–v2 | Excluded | ✅ |

### 4.2a Hipotesis Outcome Epic (3 Fase Eksekusi v0)

| Epic / release slice | Pengguna sasaran | Hipotesis: Jika ... maka ... karena ... | Sinyal awal + target / periode | Bukti pendukung | Keputusan bila tercapai / tidak tercapai |
|---|---|---|---|---|---|
| **Phase 1 — Core Multi-Tenant, Security & Rooms (F-01..F-08)** | Owner, Branch Manager, Caretaker | Jika isolasi multi-tenant, RBAC 6 role, handover *immutable*, dan kontrak digital selesai dulu, maka fondasi anti-fraud & data kamar siap menopang billing tanpa refactor | 100% tes RBAC/isolasi & CRUD Phase 1 lulus (0 error/warn) di Minggu 7 | `IDEA_BRIEF.md` §3.2 & Threat Model | Tercapai: lanjut Phase 2; Tidak tercapai (<30% di Minggu 4): aktifkan review Kill/Pivot |
| **Phase 2 — Utilities, Parking, Billing & WAHA (F-09..F-15)** | Finance, Caretaker, Tenant | Jika cron billing idempoten, meteran berfoto, verifikasi bayar manual + cek hash, dan Outbox WAHA/fallback berjalan, maka 100% siklus penagihan tanpa kebocoran kas tercapai | 0 invoice duplikat & 100% fallback WA aktif saat WAHA mati di Minggu 14 | `IDEA_BRIEF.md` §3.5 (80/20 root cause) | Tercapai: lanjut Phase 3; Slip >30%: geser fitur non-inti Phase 3 |
| **Phase 3 — Ops, Portal, Pipeline & Analytics (F-16..F-21)** | Tenant, Owner, Branch Manager | Jika portal penghuni, tiket SLA, turnover, pipeline screening, kas *append-only*, dan dashboard Laba Rugi terhubung, maka siklus end-to-end siap SIT 100% | 100% skenario SIT lintas ≥2 Owner & ≥2 Cabang lulus di Minggu 20 | `PROJECT_STATE.md` Success Metric | Tercapai: masuk M07–M10; Gagal: perbaiki defect P0/P1 sebelum rilis |

### 4.3 User Stories & Acceptance Criteria (INVEST & Given-When-Then — Seluruh 21 Fitur P0)

#### Feature F-01: Hierarki Multi-Owner, Multi-Properti & Kebijakan Cabang
- **User Story**: As an `Owner`, I want to manage multiple branches, floors, rooms, and per-branch operational policies including official bank accounts, so that every branch runs under clear rules with isolated data.
- **Acceptance Criteria**:
  - [ ] Given an authenticated `Owner`, when they create a branch with floor/room hierarchy and branch policy (late fee rule, grace period, overnight guest rate, official bank account), then all records are stored scoped to `org_id` and immediately visible only to authorized staff of that branch.
  - [ ] Edge Case: Given a `Finance` or `Branch Manager` user, when they attempt to update the branch official bank account, then the system rejects the request with `403 FORBIDDEN` and logs an audit entry.

#### Feature F-02: Auth & RBAC Granular 6 Role + Anti-Fraud
- **User Story**: As an `Owner`, I want role-based access control across 6 roles with immediate session revocation and admin/outbox password reset, so that ex-staff or unauthorized roles cannot tamper with operations.
- **Acceptance Criteria**:
  - [ ] Given valid email and password credentials, when a user logs in, then the system sets an `HttpOnly; Secure; SameSite=Lax` session cookie and redirects to the role-appropriate dashboard.
  - [ ] Given an `Owner` triggers *Force Logout* on a `Caretaker` or `Finance` account, when that staff member makes their next request, then the session is immediately rejected with `401 UNAUTHORIZED` and redirected to `/login`.

#### Feature F-03: Immutable Audit Trail & UU PDP Baseline
- **User Story**: As an `Owner` or `Super Admin`, I want every sensitive mutation logged immutably and personal ID documents protected under UU PDP baseline controls, so that fraud is traceable and resident privacy is preserved.
- **Acceptance Criteria**:
  - [ ] Given any change to room status, invoice adjustment, payment verification, or bank account, when the mutation succeeds, then an append-only row is written to `audit_logs` with actor ID, role, before/after snapshot, and timestamp, with zero `DELETE` or `UPDATE` endpoints exposed.
  - [ ] Edge Case: Given a `Caretaker` views a resident profile, when the profile renders, then the NIK is masked (e.g., `3273********0004`) and the KTP image URL is withheld with `403 FORBIDDEN` if requested directly.

#### Feature F-04: Inventaris Kamar & Status Real-Time
- **User Story**: As a `Branch Manager`, I want to manage room types, facilities, photos, and real-time room statuses, so that occupancy availability is always accurate.
- **Acceptance Criteria**:
  - [ ] Given a branch has rooms configured with type, base rates, and facilities, when a room transitions between `Available`, `Booked`, `Occupied`, `Cleaning`, and `Maintenance`, then the API returns `HTTP 200`, the room board updates immediately, and `1` audit row is written to `audit_logs`.
  - [ ] Edge Case: Given a room is currently `Occupied` or `Maintenance`, when a user attempts to mark it `Available` without completing check-out/turnover or maintenance resolution, then the system rejects the transition with `HTTP 422` validation error.

#### Feature F-05: Skema Sewa Fleksibel & Kalkulasi Pro-Rata
- **User Story**: As a `Branch Manager`, I want to configure daily, weekly, monthly, and yearly rental schemes with automatic server-side pro-rata calculation, so that mid-month check-ins are billed accurately without manual math.
- **Acceptance Criteria**:
  - [ ] Given a room with a monthly rate of Rp 2.000.000, when a tenant checks in on the 16th of a 30-day month under a pro-rata policy, then the server calculates the exact pro-rata charge (`DECIMAL(15,2)`) for 15 days and ignores any client-submitted price override.
  - [ ] Edge Case: Given a daily (*menginap*) stay of 3 nights, when the lease is created, then the system computes `3 × daily_rate` and generates a single stay invoice immediately.

#### Feature F-06: Inventaris Aset Kamar, Kunci & Handover *Before/After*
- **User Story**: As a `Caretaker` and `Tenant`, I want to record room asset conditions, key/access card serial numbers, and timestamped photos during check-in and check-out, so that deposit deductions are backed by indisputable evidence.
- **Acceptance Criteria**:
  - [ ] Given a check-in handover checklist with asset items, key numbers, and *before* photos is submitted and confirmed by both parties, when the status becomes `LOCKED`, then any edit or delete attempt by `Owner` or `Caretaker` returns `HTTP 409 CONFLICT` with `0` mutations persisted.
  - [ ] Edge Case: Given a check-out handover marks an asset as damaged or a key as lost, when the deduction summary is generated, then the system returns `HTTP 200` displaying side-by-side *before* and *after* photos with itemized `DECIMAL(15,2)` deduction totals.

#### Feature F-07: Onboarding Penghuni, KYC, Co-Tenant & Rekap RT/RW
- **User Story**: As a `Branch Manager`, I want to onboard tenants with KYC documents, emergency contacts, optional co-tenants, and one-click RT/RW registry export, so that resident records stay compliant with local neighborhood rules.
- **Acceptance Criteria**:
  - [ ] Given a new tenant with KTP upload, emergency contact, and an optional second occupant (*co-tenant*), when onboarding is saved, then the API returns `HTTP 201`, stores `1` encrypted KTP object in private storage, and links the co-tenant surcharge to the active lease.
  - [ ] Given a branch has active tenants, when `Branch Manager` exports the RT/RW report, then the system returns `HTTP 200` producing a formatted PDF/CSV with `0` unescaped CSV formula-injection prefixes (`=`, `+`, `-`, `@`).

#### Feature F-08: Kontrak Sewa Digital (PDF), Perpanjangan, Terminasi & Skip-Out
- **User Story**: As an `Owner`, I want to generate PDF lease contracts, handle renewals, room transfers, normal check-outs, and *skip-out (kabur)* terminations, so that tenancy lifecycles and deposit refunds are legally clear.
- **Acceptance Criteria**:
  - [ ] Given an approved tenant and room, when the lease is activated, then the API returns `HTTP 201`, generates `1` PDF contract containing unit terms and deposit amount, and sets room status to `Occupied`.
  - [ ] Edge Case: Given a tenant abandons the room with unpaid invoices, when `Owner` executes a `Skip-Out (Kabur)` termination, then the API returns `HTTP 200`, closes the lease, flags `100%` of unpaid balance for *Bad Debt Write-Off* review, and transitions the room to `Cleaning`.

#### Feature F-09: Manajemen Tamu Menginap (*Overnight Guest*)
- **User Story**: As a `Tenant` or `Caretaker`, I want to register overnight guests with automatic free-night quota tracking and per-night surcharge billing, so that guest stays are transparent and billed fairly.
- **Acceptance Criteria**:
  - [ ] Given a branch policy allows 2 free overnight guest nights per month and Rp 50.000/night thereafter, when a tenant logs a 4-night guest stay, then the system automatically queues a Rp 100.000 line item onto the tenant's next invoice.
  - [ ] Edge Case: Given a guest stay exceeds the branch's maximum consecutive nights limit, when submitted, then the system flags the request for `Branch Manager` approval before confirmation.

#### Feature F-10: Listrik Mandiri (Token PLN) & Sub-Meter Listrik/Air
- **User Story**: As a `Caretaker`, I want to record PLN prepaid meter IDs with check-in/check-out kWh balances or monthly postpaid sub-meter readings with photo proof, so that utility billing is accurate and dispute-free.
- **Acceptance Criteria**:
  - [ ] Given a room uses postpaid sub-metering with tariff Rp 1.700/kWh, when `Caretaker` submits current reading `1250` (previous `1100`) with a meter photo, then the system calculates `150 kWh × Rp 1.700 = Rp 255.000` and attaches the photo to the tenant's invoice view.
  - [ ] Edge Case: Given a submitted meter reading is lower than the previous reading, when `Caretaker` submits the form, then the system rejects it unless flagged as `Meter Replaced` with `Branch Manager` approval.

#### Feature F-11: Katalog Add-ons & Deklarasi Alat Elektronik (*Appliance Surcharge*)
- **User Story**: As a `Branch Manager`, I want to manage recurring or one-time add-on services and declared extra appliances, so that extra charges appear transparently on monthly invoices.
- **Acceptance Criteria**:
  - [ ] Given a tenant subscribes to a recurring add-on (e.g., laundry Rp 150.000/month) and declares a mini-fridge (Rp 75.000/month), when the monthly billing cycle runs, then `2` separate itemized lines totaling Rp 225.000 appear on the invoice.
  - [ ] Edge Case: Given a tenant cancels a recurring add-on mid-month, when the next billing cycle runs, then `0` cancelled items are billed while historical invoices remain unchanged (`0` retroactive mutations).

#### Feature F-12: Manajemen Slot Parkir & Kendaraan Penghuni
- **User Story**: As a `Branch Manager`, I want to assign car/motorcycle/bicycle parking slots with license plates against branch capacity quotas and bill recurring parking fees automatically, so that parking space is never oversold.
- **Acceptance Criteria**:
  - [ ] Given a branch has 20 motorcycle slots and 5 car slots, when a tenant is assigned slot `M-04` with plate `B 1234 XYZ` at Rp 50.000/month, then remaining motorcycle quota decrements to 19 and Rp 50.000 is added to recurring billing.
  - [ ] Edge Case: Given all car slots are occupied (0 remaining), when a user attempts to assign a car slot, then the system blocks assignment with `PARKING_QUOTA_FULL`.

#### Feature F-13: Auto-Generate Invoice Terpadu via Scheduled Cron
- **User Story**: As an `Owner`, I want an idempotent daily cron job (plus a manual demo trigger) to generate unified invoices 7 days before due dates and apply late fees after grace periods, so that billing never depends on manual spreadsheets.
- **Acceptance Criteria**:
  - [ ] Given active leases entering the H-7 billing window, when the billing cron executes, then exactly one unified invoice per lease per billing period is created combining rent, pro-rata, utilities, parking, overnight guests, and add-ons using `DECIMAL(15,2)`.
  - [ ] Edge Case: Given the billing cron or manual trigger is executed twice for the same period, when the second run completes, then `0` duplicate invoices are created (enforced by unique `(lease_id, billing_period)` idempotency key).

#### Feature F-14: Verifikasi Pembayaran Manual, Cicilan, Hash Check & Kwitansi PDF
- **User Story**: As a `Finance` officer, I want to verify tenant transfer proofs with duplicate-file detection, partial payment/credit balance support, and automatic numbered PDF receipts, so that fake proofs and accounting errors are eliminated.
- **Acceptance Criteria**:
  - [ ] Given a tenant uploads a transfer proof image for a Rp 2.000.000 invoice, when `Finance` approves Rp 1.000.000 as a partial payment, then the invoice status updates to `Partially Paid` (remaining Rp 1.000.000) and a uniquely numbered PDF receipt is generated.
  - [ ] Edge Case: Given a tenant uploads a transfer proof whose SHA-256 hash matches a previously submitted payment proof, when submitted, then the system flags a `DUPLICATE_PROOF_WARNING` to `Finance` and blocks auto-approval.

#### Feature F-15: Notification Outbox, Pengumuman Cabang & WAHA dengan Fallback `wa.me`
- **User Story**: As a `Branch Manager`, I want automated WhatsApp reminders via WAHA and branch announcements with automatic fallback to `wa.me` links when WAHA is offline, so that communication never breaks billing.
- **Acceptance Criteria**:
  - [ ] Given an invoice is generated or reaches H-3 / overdue, when the notification worker processes the Outbox, then it dispatches the message via WAHA HTTP API and logs status `SENT` with timestamp.
  - [ ] Edge Case: Given the WAHA container is unreachable or returns HTTP 5xx, when the worker attempts delivery, then the Outbox marks the entry `FALLBACK_READY`, provides a pre-filled `https://wa.me/...` button for staff, and never blocks invoice generation.

#### Feature F-16: Ticketing Maintenance dengan SLA Timer & Eskalasi Otomatis
- **User Story**: As a `Tenant` and `Branch Manager`, I want maintenance tickets with photos, priority-based SLA timers, automatic overdue escalation, and receipt-backed repair costs, so that urgent room issues are never ignored.
- **Acceptance Criteria**:
  - [ ] Given a tenant submits an `Urgent` ticket (e.g., water outage) with a photo, when it remains unacknowledged past the branch SLA threshold, then the system flags status `OVERDUE` and surfaces `1` escalation alert on the `Branch Manager` and `Owner` dashboards.
  - [ ] Edge Case: Given `Caretaker` logs a repair expense above the branch approval threshold without a receipt photo, when submitted, then the API returns `HTTP 422` until a receipt image is attached and routed for `Branch Manager`/`Owner` approval.

#### Feature F-17: Portal Penghuni (*Tenant Portal*)
- **User Story**: As a `Tenant`, I want a self-service web portal showing my contract, locked official Owner bank account, itemized invoices with meter photos, payment proof upload, guest registration, complaints, and active Wi-Fi details, so that I have full transparency.
- **Acceptance Criteria**:
  - [ ] Given an authenticated `Tenant` with an `Active` lease, when they open the portal, then the system returns `HTTP 200` displaying their contract PDF, official branch bank account, itemized invoice + meter photo, branch announcements, and current floor Wi-Fi credentials.
  - [ ] Edge Case: Given a tenant's lease status becomes `Terminated` or `Skip-Out`, when they request active Wi-Fi credentials or submit a new complaint, then the API returns `HTTP 403 FORBIDDEN` while historical receipts remain downloadable (`HTTP 200`).

#### Feature F-18: Room Turnover & Housekeeping Checklist
- **User Story**: As a `Branch Manager`, I want check-outs to automatically transition rooms into `Cleaning` with a caretaker housekeeping checklist before they can become `Available`, so that dirty or uninspected rooms are never rented out.
- **Acceptance Criteria**:
  - [ ] Given a lease terminates, when check-out completes, then the room status automatically changes to `Cleaning` and `1` turnover task is assigned to `Caretaker`.
  - [ ] Edge Case: Given a turnover checklist still has unchecked mandatory items (bedding, AC check, bathroom), when `Caretaker` attempts to mark the room `Available`, then the API returns `HTTP 422` until `100%` of mandatory items are checked and verified.

#### Feature F-19: Pipeline Survei, *Screening* Owner & Booking Kamar dengan DP
- **User Story**: As a `Branch Manager`, I want to manage room survey schedules, owner screening approval, and DP booking holds that auto-expire if unpaid, so that owners keep full control over incoming residents without ghost bookings locking rooms.
- **Acceptance Criteria**:
  - [ ] Given a prospective tenant completes a survey and passes `Owner`/`Branch Manager` screening, when a DP booking hold is created with a 48-hour expiry, then the API returns `HTTP 201`, sets room status to `Booked`, and blocks competing bookings with `HTTP 409`.
  - [ ] Edge Case: Given the 48-hour DP deadline passes without verified payment, when the expiry cron runs, then the booking transitions to `Expired` (`0` active holds remaining) and the room automatically returns to `Available`.

#### Feature F-20: Buku Kas Operasional (*Append-Only* & *Bad Debt Write-Off*)
- **User Story**: As a `Finance` officer and `Owner`, I want an append-only branch cashbook for operational income/expenses and bad-debt write-offs with zero hard deletes, so that financial records cannot be tampered with.
- **Acceptance Criteria**:
  - [ ] Given `Finance` records an operational expense (e.g., building electricity Rp 1.500.000 with receipt), when saved, then the API returns `HTTP 201` creating `1` immutable ledger entry immediately reflected in branch net profit.
  - [ ] Edge Case: Given `Finance` submits a `Void/Reversal` on an entry they created, when submitted, then the original row remains visible as `VOIDED`, `1` pending counter-entry is created, and `Owner` approval is required (`HTTP 403` on self-approval — **ZERO SELF-APPROVAL**).

#### Feature F-21: Dashboard Eksekutif Multi-Properti & Laporan Keuangan
- **User Story**: As an `Owner`, I want an executive dashboard showing occupancy rates, overdue aging, and per-branch/consolidated Profit & Loss reports exportable to CSV/PDF, so that I can monitor business health across all properties at a glance.
- **Acceptance Criteria**:
  - [ ] Given an `Owner` manages ≥2 branches, when they open the executive dashboard and filter by date range or branch, then the API returns `HTTP 200` rendering occupancy %, `3` AR aging buckets (0–7d, 8–30d, >30d), gross income, operational expenses, and net profit (`Laba Bersih`).
  - [ ] Edge Case: Given the `Owner` exports the Profit & Loss report to CSV, when opened in a spreadsheet application, then `0` cells start with unescaped formula triggers (`=`, `+`, `-`, `@`) and the export includes the operational estimation disclaimer.

---

### 4.3a Tinjauan Red-Team Scope (Sebelum Lock)

**Red-team reviewer / date**: AI Agent (Anti-Yes-Man Audit) & zeenn — 2026-11-23

| Tantangan / potensi kegagalan | ID terdampak | Bukti atau alasan | Disposisi (ubah / tunda / tolak) + alasan | Pemilik keputusan |
|---|---|---|---|---|
| Jumlah awal 25 P0 terlalu mepet batas maksimum Large (25 P0), berisiko kena blokir Enterprise saat ada penyesuaian minor di M05 | F-13 (Guest Parking), House Rules, Public Showcase, Promo | Audit MoSCoW Hari-1 menunjukkan 4 fitur tersebut tidak memblokir operasional inti | **Ubah (Geser ke v1)** — v0 dikunci di **21 P0** agar punya margin aman 4 slot & fokus 100% misi inti | zeenn |
| Integrasi WAHA berisiko mati/scan QR expired saat demo portofolio | F-15 | WAHA menggunakan sesi WhatsApp Web non-resmi | **Ubah (Tambah Fallback)** — WAHA dibungkus `NotificationChannel` dengan fallback otomatis ke Outbox + `wa.me` | zeenn |
| Pemilik kos bisa memotong deposit sepihak dengan mengubah data check-in lama | F-06, F-08 | Keluhan paling dominan dari riset anak kos Indonesia | **Ubah (Tambah Guardrail)** — Handover check-in dikunci *immutable* setelah disetujui bersama + foto *before/after* | zeenn |
| Penjaga kos (Caretaker) bisa menggelapkan uang sewa tunai atau menyalahgunakan KTP penghuni | F-02, F-03, F-14, F-17 | Kasus penggelapan penjaga kos di media Indonesia | **Ubah (Tambah Guardrail)** — Caretaker diblokir dari approve bayar & akses KTP; rekening resmi Owner terkunci di Portal Penghuni | zeenn |
| Integrasi hardware IoT Smart Lock / Smart Meter PLN diajukan di awal | OOS-01 | Meteran PLN token tidak punya API resmi; IoT butuh hardware fisik | **Tolak (Out-of-Scope)** — diganti catat ID meter + saldo kWh check-in/out & log kunci fisik | zeenn |

### 4.4 Non-Functional Requirements (NFR) Baseline SLA

- **Target Concurrent Users**: 100 active concurrent operational sessions (target skala multi-cabang v0).
- **API Performance**: p95 response time ≤ 500ms under benchmark load.
- **Frontend Performance**: Time-to-Interactive (TTI) ≤ 3.0s on 4G mobile; initial JS bundle ≤ 200KB gzipped.
- **Platform & Browser Target**: Evergreen modern browsers (Chrome, Edge, Safari, Firefox — latest 2 major versions) pada Desktop & Mobile Web; browser legacy (IE11 / pre-Chromium) secara eksplisit *Out-of-Scope*.
- **Data Retention & Storage Ceiling**: 5GB relational DB storage, 25GB private media assets (KTP, foto handover, foto meteran, bukti transfer) per deployment referensi.

---

## 5. Strict Scope Boundaries, Tax & Legal Compliance

### 5.1 In-Scope (Work DELIVERED)
1. Desain arsitektur, skema database multi-tenant + RLS, *immutable audit log*, dan UI web responsif untuk seluruh **21 fitur P0 (v0)**.
2. Integrasi WAHA (self-hosted Docker) dengan fallback Outbox/`wa.me`, serta antarmuka `PaymentProvider` siap pakai untuk Midtrans v1.
3. Pengujian SIT, uji isolasi RBAC/IDOR 6 role, seeding data multi-owner/multi-cabang realistis, dan dokumentasi operasional (`RUNBOOK_OPS.md`).
4. Target kualitas teknis: **0 error & 0 warning** pada typecheck, linter, production build, dan runtime.

### 5.2 Out-of-Scope (Work NOT INCLUDED & Cannot Be Demanded in v0)
1. **Hardware IoT Fisik**: Integrasi Smart Door Lock (TTLock/Tuya) maupun Smart kWh Meter fisik.
2. **Integrasi Pembayaran & API Eksternal Berbayar di v0**: Midtrans/Xendit live payment gateway (ditunda ke v1), WhatsApp Cloud API berbayar, e-Meterai Privy/VIDA (v2), dan Channel Manager OTA (v2).
3. **Marketplace Agregator & Aplikasi Mobile Native**: Platform pencarian kos lintas-owner/iklan berbayar serta aplikasi native iOS/Android.
4. **Migrasi Data Fisik / Legacy Core**: Digitalisasi arsip kertas lama atau integrasi sistem ERP/SAP/Accurate eksternal.
5. **Konsultasi Hukum & Pajak Resmi**: Aplikasi menyediakan pencatatan & laporan operasional; pelaporan pajak resmi (DJP/PB1) dan keabsahan hukum kontrak tetap menjadi tanggung jawab pemilik properti.

### 5.3 Tax Calculation Disclaimers (PP 55/2022 jo. PP 20/2026)
- Dasar regulasi referensi: **PP 55/2022 jo. PP 20/2026** (PPh Final UMKM 0,5% hanya berlaku bagi WP Orang Pribadi, PT Perorangan, dan Koperasi dengan omzet bruto ≤ Rp 4,8 miliar/tahun; batas omzet tidak kena pajak Rp 500.000.000/tahun khusus WP OP; tidak berlaku bagi CV, Firma, atau PT Non-Perorangan).
- Mandatory In-App Disclaimer pada Dashboard & Ekspor Laporan Keuangan:
  *"Laporan keuangan ini bersifat estimasi operasional internal dan bukan laporan audit akuntan publik maupun pelaporan pajak resmi (DJP/Pajak Daerah). Pajak sewa/PPN/PB1 tidak diperhitungkan otomatis pada rilis v0."*

### 5.4 Mandatory Data Privacy Compliance (UU PDP No. 27/2022)
- [x] **Privacy Policy & Terms of Service**: Disiapkan sebagai template operasional di M04 dan ditampilkan saat onboarding.
- [x] **Data Retention**: Catatan transaksi keuangan & audit log dipertahankan minimal 3 tahun; data KTP mantan penghuni mendukung anonimisasi/penghapusan pasca masa retensi.
- [x] **PII Scrubbing**: Log aplikasi dan pelacak error dikonfigurasi menyaring NIK, nomor HP, email, dan nominal sensitif.
- [x] **CSV Injection Prevention**: Seluruh ekspor CSV (rekap RT/RW, Laba Rugi, tunggakan) menambahkan prefix `'` pada sel yang diawali `=`, `+`, `-`, `@`, `\t`, `\r`, `\n`, `|`.

> ⚠️ **LEGAL REVIEW REQUIRED**: Teks Kebijakan Privasi, Syarat & Ketentuan, template kontrak sewa, dan disclaimer pajak pada §5.3 adalah **draft teknis operasional, bukan nasihat hukum/pajak**.

```text
LEGAL-REVIEW: PENDING — DRAFT TEKNIS, WAJIB DITINJAU OLEH LEGAL COUNSEL / PAKAR PAJAK SEBELUM DIPUBLIKASIKAN
```

---

## 6. Technical Architecture & Database Schema Constraints

### 6.1 Database Schema Guardrails
- **Universal Tenant Isolation**: Setiap tabel bisnis wajib memiliki `org_id UUID NOT NULL REFERENCES organizations(id)` (dan `branch_id` pada entitas cabang) dengan Row-Level Security (RLS) yang membaca `public.user_roles`.
- **Financial Precision**: Seluruh nilai uang memakai `DECIMAL(15, 2)` (dilarang `FLOAT`/`DOUBLE`); baris item invoice menyimpan snapshot `unit_cost` historis agar perubahan tarif tidak mengubah tagihan lama.
- **Audit Trails & Append-Only**: Buku kas (`cashbook_entries`) dan mutasi pembayaran bersifat *append-only* / *void-only* (tanpa hard `DELETE`). `audit_logs` mencatat setiap mutasi sensitif secara *immutable*.
- **Column-Level Security**: Lapisan query backend menyaring kolom sensitif (`nik`, `ktp_object_key`) untuk role `Caretaker` (karena RLS memfilter baris, bukan kolom).
- **Idempotency Keys**: Tabel `idempotency_keys` dan constraint unik `(lease_id, billing_period)` menjamin cron billing dan verifikasi pembayaran 100% idempoten.

### 6.2 Architecture Realism
- **Online-Only Web App**: Tidak menggunakan *offline-write sync*; fokus ke konsistensi kuat (*strong consistency*) untuk transaksi keuangan & status kamar.
- **Performance Budgets**: TTI ≤ 3.0 detik pada 4G; initial JS bundle ≤ 200KB gzipped; API p95 ≤ 500ms.
- **PDF Engine**: Menggunakan library PDF ringan (dikunci di M05, tanpa ketergantungan browser headless berat jika tidak diperlukan).
- **Tech Stack Locking**: Seluruh versi paket dikunci (*pinned minor versions*) pada `M05 · Architecture & Technical Specifications`.

---

## 7. Dependency Register (Dependency SLA)

| Dep Code | Requirement | Delivery Deadline | Consequence If Delayed |
| :--- | :--- | :--- | :--- |
| **DEP-01** | Referensi inspirasi UI/UX (`docs/design/inspiration/`) dari human sebelum masuk M04 | Sebelum M04 Step 1 | Desain M04 tertahan sesuai Ask-First Stop M04 |
| **DEP-02** | Pemilihan 8 keputusan Tech Stack di M05 oleh human | M05 Lock | Scaffold M06 tidak dapat dimulai |
| **DEP-03** | Docker Desktop aktif di mesin lokal untuk PostgreSQL, MinIO/storage, dan WAHA opsional | Awal M06 | Pengujian integrasi WAHA jatuh ke mode fallback `wa.me` |
| **DEP-04** | Keputusan review per fase (Large scale stop per phase) | Maks. 3 hari kerja per fase | Target selesai bergeser sebanding dengan waktu tunggu |

---

## 8. Realistic Timeline, Process Phasing & Verification Plan

- **M04 · UI/UX & Prototyping**: 2 minggu (SITEMAP 6 role, Design System, komponen & layar utama)
- **M05 · Architecture & Technical Specifications**: 1 minggu (Stack Lock, PRD, FSD, ERD + RLS SQL, ADR)
- **M06 · Development Execution**: 13.2 minggu (11 minggu dev + 20% buffer, dibagi 3 fase: Phase 1 = 8 P0, Phase 2 = 7 P0, Phase 3 = 6 P0)
- **M07 · Quality Assurance & SIT**: 2 minggu (SIT semua 21 P0 + uji keamanan RBAC/IDOR 6 role + 0 error/warn audit)
- **M08–M12 · Seeding, Self-UAT, Deployment & Ops Runbook**: 1.5 minggu
- **Total Timeline**: **~19.7 minggu (Target 20 minggu @ 15 jam/minggu = 300 jam)**
- **Change Request (CR) Freeze**: Dikunci **2 minggu sebelum M07 QA dimulai**.
- **Phase 1.5 (v1 — Midtrans & 13 fitur P1 lainnya)**: Dijadwalkan ketat **pasca v0 lulus M10**, bukan di tengah QA v0.

---

## 9. Scope Validation & Sign-Off

Dokumen ini mengunci ruang lingkup **v0 (21 fitur P0)** sebagai dasar tunggal untuk `M04 · UI/UX & Prototyping` dan `M05 · Architecture & Technical Specifications` (`M03 · Legal, SOW & Client Data Protection` berstatus `WAIVED` karena proyek ini berjenis `portfolio`).

- Validated by Solo Developer / Scope Owner: **zeenn** (Date: 2026-11-23)

---

## Machine Validation Summary (M02 Scope Lock)

```text
Scope-P0-Count: 21
Scope-Lock-Decision: LOCKED
```
