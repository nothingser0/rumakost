# Idea Brief & Feasibility Scorecard

> Dokumen penyaringan ide awal untuk memvalidasi kelayakan teknis, operasional, regulasi, dan finansial **Rumakost** sebelum masuk ke spesifikasi ruang lingkup (`M02 · Scope Definition & Freeze`).

---

## 1. Project Metadata

- **Idea Name / Project Codename**: Rumakost — Enterprise-Grade Multi-Property Boarding House & Coliving PMS
- **Initiator / Solo Dev**: zeenn
- **Evaluation Date**: 2026-11-23
- **Initial Target Scale**: Large
- **Delivery Model**: Portfolio (Web Application, Self-Hostable / SaaS-Ready)
- **Monetization Model**: Free & Non-Commercial (Portfolio; dengan pemodelan unit economics SaaS sebagai referensi bisnis)
- **Industry Archetype**: PMS — Property Management System (Multi-Property Boarding House & Coliving)
- **Catalog Benchmark**: N/A (Portfolio custom benchmark terhadap Mamikos/Singgahsini, Rukita, KosBos, Genari Kos)

---

## 2. Idea Summary (Elevator Pitch)

- **Elevator Pitch**:
  Untuk **pemilik kos multi-cabang dan operator coliving di Indonesia** yang mengalami **kebocoran pendapatan, kecurangan penjaga kos, tagihan manual rawan salah, dan sengketa deposit/listrik dengan penghuni**, **Rumakost** adalah **Property Management System (PMS) kos-kosan multi-owner & multi-cabang** yang menghadirkan **billing engine otomatis (sewa fleksibel, pro-rata, listrik token/sub-meter, parkir, tamu menginap), kontrol anti-fraud per role, dan portal penghuni transparan**, berbeda dari pencatatan Excel/WhatsApp maupun platform berbasis komisi karena **bebas potongan komisi, memiliki *segregation of duties* ketat, bukti serah terima *immutable*, serta pengingat WhatsApp mandiri via WAHA dengan fallback lokal**.

---

## 3. The 3-Filter Triage & Market Validation

### 3.0 Premise Testing & Assumption Register (Riskiest Assumption First)

| ID | Risk lens | Core Premise / Assumption | Impact if false | Uncertainty | Evidence / context needed | Cheapest credible probe + timebox | Success / failure threshold | Status / decision |
|:---|:---|:---|:---|:---:|:---|:---|:---|:---|
| **ASM-01** | Feasibility / Operations | 21 fitur P0 dapat dibangun solo dalam 3 fase (8+7+6) dalam ~20 minggu (300 jam) dengan 0 error/warn | Proyek macet di tengah jalan / kualitas kode jatuh | High | Rasio penyelesaian task M06 per fase & estimasi epic audit | Dekomposisi WBS 3 fase + cek velocity di M06 Minggu 4 (timebox: 4 minggu) | Success: ≥70% Phase 1 selesai tanpa compiler/lint error; Kill: <30% | Open (Mitigated via `SOLO-CAPACITY-RISK-ACCEPTANCE.md`) |
| **ASM-02** | Feasibility | Adapter WAHA Docker + fallback Notification Outbox/`wa.me` berjalan mulus tanpa memblokir proses cron billing | Tagihan gagal terkirim atau demo portofolio rusak saat WAHA mati | Medium | Hasil uji integrasi HTTP ke WAHA & uji skenario WAHA offline | Uji integrasi lokal dengan container WAHA on & off di M06/M07 (timebox: 1 hari) | Success: 100% invoice tetap terbit & fallback link `wa.me` terbuat saat WAHA mati; Failure: billing terblokir | Open |
| **PREM-01** | Value / Desirability | Pemilik kos multi-cabang & penghuni benar-benar mengalami masalah kebocoran kas, sengketa deposit, dan transparansi listrik | Fitur anti-fraud & handover tidak relevan | Low | Riset sekunder keluh kesah pemilik/penghuni kos & review Mamikos/Rukita | Riset web sekunder lintas 6 platform & forum keluhan kos Indonesia (timebox: selesai di Intake) | Success: ≥3 keluhan utama terkonfirmasi berulang di sumber publik | Validated (Riset Sekunder — 5 pain points utama terkonfirmasi) |
| **PREM-02** | Regulatory / Security | Kontrol UU PDP baseline (masking NIK, *private signed URL* KTP, RBAC least-privilege, audit trail) cukup untuk portofolio tanpa kewajiban audit formal | Risiko pelanggaran privasi data sensitif | Low | Cakupan UU PDP No. 27/2022 untuk aplikasi non-komersial/portofolio | Checklist kepatuhan UU PDP + review threat model 6 role di M01/M05 (timebox: 1 hari) | Success: 0 celah IDOR, 0 akses KTP untuk Caretaker, 100% data uji memakai persona sintetis/realistis non-nyata | Validated (Scope & Threat Model ditetapkan) |

### 3.1 Problem Statement, HMW Framing & Research Methodology

- **Primary Problem**: Pengelolaan kos-kosan multi-cabang di Indonesia masih didominasi kombinasi Excel, buku kas kertas, dan grup WhatsApp. Dampaknya: (1) kebocoran pendapatan & kecurangan penjaga kos (terima tunai tidak disetor, kamar dilaporkan kosong padahal terisi, pungli denda), (2) salah hitung sewa pro-rata, meteran listrik/air, parkir, dan tamu menginap, (3) sengketa pemotongan deposit tanpa bukti kondisi awal, serta (4) komplain kerusakan fasilitas vital yang lambat ditangani.
- **How Might We (HMW) Framing**: *"Bagaimana kita membangun sistem PMS kos multi-owner dan multi-cabang yang mengotomatisasi penagihan terpadu sekaligus menutup celah kecurangan antar-role (pemilik, penjaga, finance, penghuni), tanpa membebani pemilik dengan komisi platform atau ketergantungan API berbayar di v0?"*
- **Current Workarounds / Alternatives**: Spreadsheet (Excel/Google Sheets), grup WhatsApp, buku kwitansi fisik, atau bergabung ke operator penuh berbasis bagi hasil/komisi tinggi (Mamikos Singgahsini, Rukita).
- **Measurable Loss / Non-Resolution Impact**: Estimasi 15–30 jam/bulan waktu administrasi manual per 50–100 kamar untuk rekap tagihan/meteran + risiko kebocoran kas 5–15% per bulan jika terjadi kecurangan penjaga atau tunggakan tak terlacak.
- **Research Methodology Disclosure**:
  - Sample Size ($N$): `N = 0` wawancara primer langsung (proyek berstatus **portfolio**; riset menggunakan *secondary empirical research* pada 4 produk PMS/kos aktif di Indonesia + 3 workaround manual + analisis keluhan publik pemilik & penghuni kos di media/forum Indonesia).
  - Recruitment Channel: N/A (portfolio; sumber empiris dari dokumentasi produk publik, ulasan pengguna, dan artikel kasus operasional kos Indonesia).
  - Potential Selection Bias: Keluhan publik di internet cenderung menyoroti kasus ekstrem (penggelapan kas, sengketa deposit besar); dimitigasi dengan menyeimbangkan fitur dasar (*table stakes*) PMS harian.
  - Pricing Question Formulation: N/A untuk transaksi nyata (portfolio non-komersial); model harga SaaS (Rp 299.000/cabang/bulan) dipakai murni sebagai pemodelan referensi unit economics.

### 3.2 Competitor Landscape Benchmark (7 Competitors)

| No | Competitor Name | URL / Type | Pricing Tiers | Core Features | Offline Mode? | Target Segment | Weakness / Gaps |
|:--:| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| 1 | **Mamikos (Mitra / Singgahsini)** | Direct (mamikos.com) | Komisi / iklan berbayar (GoldPlus/MamiAds) | Listing publik, booking, manajemen kontrak & tagihan dasar | No | Pemilik kos & pencari kos | Komisi/biaya iklan tinggi; fitur pembukuan & anti-fraud internal terbatas; kontrol *screening* pemilik berkurang |
| 2 | **Rukita** | Direct (rukita.co) | Bagi hasil / manajemen penuh | Manajemen aset penuh, aplikasi tenant (Rukees), maintenance, komunitas | No | Pemilik gedung coliving | Pemilik kehilangan kontrol langsung keuangan & komunikasi; pencairan dana (*payout*) terpusat di operator |
| 3 | **KosBos** | Direct (kosbos.com) | SaaS berlangganan bulanan | Multi-properti, auto-invoice, VA/QRIS, WA Gateway, e-contract | No | Pemilik kos menengah–besar | Bergantung pada gateway berbayar; tidak menonjolkan *immutable handover before/after* & anti-fraud 6-role |
| 4 | **Genari Kos** | Direct (genari.app) | SaaS berlangganan bulanan | Multi-cabang, multi-user, laporan laba rugi & okupansi | No | Pemilik multi-properti | Fokus pembukuan umum; fitur tamu menginap, parkir, dan SLA eskalasi maintenance kurang mendalam |
| 5 | **Excel / Google Sheets** | Manual Workaround | Gratis | Rekap kamar, rumus tagihan manual | Yes | Semua segmen | Rawan human error, tidak ada RBAC/isolasi cabang, tidak ada audit trail, mudah dimanipulasi |
| 6 | **Buku Kas & Kwitansi Kertas** | Manual Workaround | Sangat rendah | Catatan penerimaan & pengeluaran fisik | Yes | Kos mikro–kecil | Mudah hilang/rusak, sangat rentan penggelapan oleh penjaga kos |
| 7 | **WhatsApp / Chat Manual** | Manual Substitute | Gratis | Penagihan chat manual, kirim foto bukti transfer | No | Semua segmen | Chat tenggelam, tidak terstruktur, tidak terhubung ke status kamar & laporan keuangan |

**Uniqueness Claim Verification**:
- Stated Differentiator: **PMS kos multi-owner & multi-cabang bebas komisi dengan kontrol anti-fraud lintas 6 role (*segregation of duties*, *immutable handover before/after*, *append-only ledger*), dukungan ganda listrik token PLN & sub-meter berfoto, serta pengingat WA mandiri via WAHA dengan fallback lokal.**
- Claim Verification Status: **Reframed & Verified** — fitur dasar (tagihan otomatis, kontrak, laporan) diakui sebagai *table stakes* yang sudah dimiliki KosBos/Genari; nilai pembeda difokuskan pada kombinasi **anti-fraud transparan dua arah (melindungi pemilik & penghuni sekaligus)** + **dukungan penuh edge-case kos Indonesia (listrik token/sub-meter, parkir, tamu menginap, rekap RT/RW, skip-out)** tanpa ketergantungan API berbayar di v0.

### 3.3 Core User Loop (3-Step Primary Flow)

1. **Step 1 (Input)**: Pengelola/Cron memicu siklus operasional (booking + *screening* → kontrak + handover *before* → input meteran listrik/air, parkir, tamu menginap → cron auto-invoice H-7), atau Penghuni mengunggah bukti transfer & tiket komplain via Portal Penghuni.
2. **Step 2 (Process)**: Backend memvalidasi isolasi multi-tenant & RBAC 6 role, menghitung total tagihan secara 100% *server-side* (sewa + pro-rata + utilitas + parkir + tamu + add-ons + denda), mencatat setiap mutasi pada *immutable audit log*, dan mengantrekan pengingat ke *Notification Outbox* (WAHA / fallback `wa.me`).
3. **Step 3 (Output / Value)**: Status kamar, kontrak PDF, kwitansi resmi bernomor unik, dan laporan Laba Rugi lintas cabang ter-update otomatis secara transparan tanpa celah kecurangan.

### 3.4 Extreme Scope Pruning (The MVP Razor)

| Features in First Release (In-Scope v0 — 21 Fitur P0) | Dropped / Deferred Features (v1 / v2 / Out-of-Scope) |
| :--- | :--- |
| • **F-01–F-03**: Multi-Owner/Property + Branch Policy, Auth/RBAC 6 Role + Anti-Fraud + Force Logout, Immutable Audit Trail & UU PDP | • **v1 (14 fitur)**: Payment Gateway Midtrans/Xendit, Revenue Sharing & Owner Payout, Public Showcase, Promo/Voucher, CRM, Referral, Guest Parking Pass, Day Visitor Log, House Rules/SP/Blacklist, Mailroom, Common Area, Vendor/PO/Stok, Shift Caretaker, Preventive Maintenance |
| • **F-04–F-08**: Room Inventory Real-Time, Sewa Fleksibel + Pro-Rata, Aset/Kunci + Immutable Handover *Before/After*, KYC/Co-Tenant/Rekap RT-RW, Kontrak PDF + Deposit + Skip-Out | • **v2 (7 fitur)**: Dynamic Pricing, Pajak PPN/PB1 & e-Faktur, General Ledger & ekspor Accurate/Jurnal, Komunitas/Event/NPS, e-Meterai & TTE Tersertifikasi, Channel Manager OTA, Corporate Bulk Lease |
| • **F-09–F-12**: Tamu Menginap, Listrik Token PLN & Sub-Meter Berfoto, Add-ons & Appliance Surcharge, Slot Parkir & Kendaraan Penghuni | • **Out-of-Scope (3 item)**: Hardware IoT Fisik (Smart Lock / Smart Meter), Marketplace Agregator Lintas-Owner & Iklan Berbayar, Aplikasi Mobile Native iOS/Android |
| • **F-13–F-15**: Auto-Invoice Cron Idempoten, Verifikasi Bayar Manual/Cicilan/Hash Check + Kwitansi PDF (`PaymentProvider` ready), Notification Outbox + WAHA/fallback `wa.me` | — |
| • **F-16–F-21**: Maintenance Ticketing SLA + Eskalasi, Portal Penghuni (+ rekening resmi & Wi-Fi aktif), Room Turnover Checklist, Pipeline Survei/Screening/Booking DP, Append-Only Cashbook + Bad Debt Write-Off, Dashboard Eksekutif & Laporan Laba Rugi | — |

### 3.5 MVP Razor & Root Cause Validation Gate (MANDATORY)

- **Root Cause Breakdown (80/20 Analysis)**:
  - Primary Root Causes (≈ 80%): Kebocoran pendapatan & kecurangan kas/kamar, kesalahan hitung tagihan manual (sewa pro-rata + listrik + parkir + tamu), sengketa deposit tanpa bukti kondisi awal, serta komplain kerusakan yang tidak terpantau SLA-nya.
  - Secondary Root Causes (≈ 20%): Otomasi pembayaran instan (VA/QRIS), pemasaran listing publik/CRM, integrasi akuntansi eksternal, dan fitur komunitas.
- **Solution-Problem Alignment**: Does MVP Razor solve ≥ 70% of the primary root cause? `YES` (menyelesaikan ~85% akar masalah operasional & anti-fraud inti di v0).
- **Target Segment Feasibility**:
  - Pemilik Kos Multi-Cabang (20–500 kamar) & Pengelola Coliving Mandiri → Fits MVP model: `YES`
  - Penghuni / Anak Kos (via Tenant Portal Web) → Fits MVP model: `YES`
  - Operator Properti Korporat yang Wajib Integrasi SAP/ERP & Audit ISO 27001 → `NO - DROPPED FROM MVP (Out of Scope / Enterprise Advisory)`

### 3.6 Pre-mortem (Before Feasibility Decision)

| Plausible failure cause | Earliest observable warning | Linked assumption ID | Prevention / mitigation |
|:--|:--|:--|:--|
| Scope 21 fitur P0 terlalu berat untuk dikerjakan solo sehingga proyek berhenti di tengah jalan | Velocity M06 Minggu 4 di bawah 50% target Phase 1 atau muncul penumpukan error lint/typecheck | `ASM-01` | Dekomposisi ketat ke 3 fase (8+7+6 P0), eksekusi 1-task-per-turn, dan *zero broken build guard* di setiap tugas |
| Integrasi WAHA bermasalah saat dijalankan reviewer (session QR mati / container tidak aktif) | Error HTTP 5xx dari WAHA menyebabkan cron billing berhenti atau halaman crash | `ASM-02` | Bungkus WAHA di balik `NotificationChannel` dengan *timeout* singkat & fallback otomatis ke *Notification Outbox* + link `wa.me` |
| Celah keamanan multi-tenant (IDOR / bocor data KTP antar cabang atau role Caretaker bisa akses data sensitif) | Test RBAC/IDOR di M07 menemukan endpoint tanpa filter `owner_id`/`branch_id` | `PREM-02` | Terapkan middleware RBAC + tenant-scoped query helper di lapisan service sejak Phase 1 dan uji silang 6 role di M07 |

---

## 4. Solo Developer Feasibility Scorecard (Stricter Reality Scoring)

| Feasibility Dimension | Score (1–5) | Confidence | Solo Developer Analysis, Reality Checks & Mitigations |
| :--- | :---: | :---: | :--- |
| **1. Technical Feasibility** (`Technical`) | 4.0 / 5 | ✅ | Aplikasi web *online-first* (tidak ada *offline-write sync*), memakai stack relasional standar (*boring stack*), 0 integrasi hardware IoT, dan 1 integrasi HTTP opsional (WAHA) dengan fallback lokal. |
| **2. Operational Feasibility — Solo Effort** (`Operational`) | 3.0 / 5 | 🔶 | Skala **Large** (21 P0) untuk solo dev: 11 minggu dev × 1.2 = 13.2 minggu + 6.5 minggu non-dev overhead = **19.7 minggu** vs rencana **20 minggu** (variansi 1.5%, ≤20%). Risiko kapasitas diterima resmi via `SOLO-CAPACITY-RISK-ACCEPTANCE.md` (`Accepted-By: zeenn`). |
| **3. Regulatory & Legal Feasibility** (`Regulatory`) | 4.0 / 5 | ✅ | Proyek portofolio tanpa kewajiban audit eksternal formal (`baseline privacy (UU PDP); formal assurance: none`), 0 penyimpanan data kartu pembayaran (verifikasi manual di v0), dan 4 kontrol UU PDP baseline sudah masuk scope v0. |
| **4. Commercial Feasibility — Unit Economics** (`Financial`) | 3.5 / 5 | ✅ | Delivery portofolio: biaya API pihak ketiga wajib **Rp 0** (WAHA self-hosted + fallback lokal). Pemodelan referensi komersial menunjukkan unit economics sehat (COGS ~15% dari ARPU Rp 299.000/cabang/bulan). |
| **OVERALL AVERAGE SCORE** | **3.63 / 5** | — | *Rata-rata ≥ 3.5 dan semua dimensi ≥ 3.0; diputuskan `CONDITIONAL_GO` untuk secara transparan membawa mitigasi risiko kapasitas skala Large.* |
| **MITIGATION PLAN** | — | — | `Mitigation: Dekomposisi eksekusi 21 fitur P0 ke dalam 3 fase terisolasi (Phase 1: 8 P0 Core/Security, Phase 2: 7 P0 Utilities/Billing/WAHA, Phase 3: 6 P0 Ops/Portal/Analytics) dengan evaluasi velocity wajib di M06 Minggu 4 dan Minggu 8 sesuai SOLO-CAPACITY-RISK-ACCEPTANCE.md.` |

### Machine Validation Summary (M01 Feasibility Scores & Decision)

```text
Feasibility-Score-Technical: 4.0
Feasibility-Score-Operational: 3.0
Feasibility-Score-Regulatory: 4.0
Feasibility-Score-Financial: 3.5
Feasibility-Evidence-Technical: 21 online-first P0 features, 0 offline-sync mutations, 1 optional self-hosted HTTP adapter (WAHA) with wa.me fallback, 0 hardware/IoT dependencies, BOTEC peak <5 QPS for 12,500 rooms
Feasibility-Evidence-Operational: 21 P0 features decomposed into 3 phases (8+7+6), 19.7 calculated weeks vs 20 planned weeks (1.5% variance), signed SOLO-CAPACITY-RISK-ACCEPTANCE.md (Accepted-By: zeenn, 2026-11-23)
Feasibility-Evidence-Regulatory: 0 external formal audits required (baseline privacy UU PDP only), 0 raw payment cardholder data stored in v0, 4 UU PDP privacy controls scoped (NIK masking, private signed-URL KTP storage, 6-role RBAC least-privilege, immutable audit log)
Feasibility-Evidence-Financial: Portfolio delivery with Rp 0 mandatory 3rd-party API fees; reference commercial SaaS model Rp 299,000/branch/mo with 15% COGS (Rp 45,000/branch/mo)
Feasibility-Decision: CONDITIONAL_GO
Mitigation: Dekomposisi eksekusi 21 fitur P0 ke dalam 3 fase terisolasi (Phase 1: 8 P0 Core/Security, Phase 2: 7 P0 Utilities/Billing/WAHA, Phase 3: 6 P0 Ops/Portal/Analytics) dengan evaluasi velocity wajib di M06 Minggu 4 dan Minggu 8 sesuai SOLO-CAPACITY-RISK-ACCEPTANCE.md
```

---

## 5. Technical & Bandwidth Cross-Check Details

### 5.1 Bandwidth Epic Breakdown Audit & BOTEC Sizing
- **Total Must-Have Features**: `21` fitur P0
- **Raw Development Epic Sum**: `11.0` minggu (14 fitur CRUD/operasional @ 0.35w = 4.9w; 7 fitur kompleks seperti Multi-Tenant RBAC, Billing Cron Engine, Pro-Rata & Utility Metering, Handover & PDF, Dashboard Laba Rugi @ 0.87w = 6.1w)
- **Buffered Development Weeks (+20%)**: `13.2` minggu
- **Non-Development Overhead (Large: 6–7w)**: `6.5` minggu (M01–M05 specs/design + M07 SIT/Security + M08 seeding + M10 Docker/deploy)
- **Total Calculated Weeks**: `19.7` minggu (vs Initial Timeline Claim: `20` minggu @ 15 jam/minggu = 300 jam)
- **Variance**: `1.5%` (≤ 20% — **PASS**)
- **BOTEC Capacity Sizing (Target Skala Enterprise Benchmark)**:
  - Asumsi skala beban referensi: 50 Owner × 5 Cabang × 50 Kamar = **12.500 kamar aktif**.
  - Beban Cron Billing: 12.500 invoice/bulan (batch diproses per cabang, ~400 invoice/hari → **< 5 QPS** pada jam puncak).
  - Storage Media (KTP, foto handover, foto meteran, bukti transfer): rata-rata ~2 MB/kamar/tahun → **~25 GB/tahun** (sangat ringan untuk *object storage* S3/MinIO lokal).

### 5.1b Build vs Buy Triage Matrix (Commodity 40-Hour Rule)

| Component / Utility | Type | Decision | Selected Tool / Library / Provider | Rationale |
|---|---|---|---|---|
| Authentication & Session Security | Commodity | BUY / ADOPT | Library auth matang (dikunci di M05, mis. Auth.js / Better-Auth / Passport + bcrypt/argon2) | Membangun manajemen sesi/hashing/revocation dari nol >40 jam & rawan celah |
| WhatsApp Delivery Channel | Commodity | BUY / ADOPT | WAHA (Self-Hosted Docker) + fallback `wa.me` | Gratis, lokal, dibungkus interface `NotificationChannel` |
| PDF Generation (Kontrak, Kwitansi, RT/RW) | Commodity | BUY / ADOPT | Library PDF matang (React-PDF / PDFKit / Puppeteer) | Tidak menulis encoder PDF manual |
| Unified Billing, Pro-Rata & Anti-Fraud Engine | Core Differentiator | BUILD | Custom In-House TypeScript Domain Engine | Nilai inti & pembeda utama portofolio Rumakost |

### 5.1c External Platform Approval & Lead-Time Audit

| External Platform / API | Verification Requirement | Estimated Lead-Time | Submission Target Milestone | Operational Fallback if Delayed |
|---|---|---|---|---|
| WAHA (WhatsApp HTTP API) | Self-hosted Docker + scan QR WA uji | 0 hari kerja (instan) | M06 | Fallback otomatis ke *Notification Outbox* + link `wa.me` |
| Midtrans / Xendit (v1 — di luar v0) | KYC Individu/Badan Usaha + Rekening | 3–7 hari kerja | Ditunda ke v1 | Verifikasi transfer manual + Kwitansi PDF (sudah penuh di v0) |

### 5.1d Technical Spike & Sandbox POC Verification
- **Spike Directory**: `N/A - Standard Boring Stack` (aplikasi web relasional standar + REST HTTP call ke WAHA; tidak ada protokol sync eksotis atau hardware IoT).

### 5.2 Legal Compliance Checklist (UU PDP No. 27/2022 & Solo Guardrails)
- [x] **Privacy Policy (Kebijakan Privasi)** direncanakan (pengumpulan KTP/kontrak, retensi data, hak penghapusan/anonimisasi mantan penghuni)
- [x] **Terms of Service (Syarat & Ketentuan)** direncanakan (batasan tanggung jawab platform & kontrak sewa)
- [x] **Payment Delegated / Zero Card Storage**: Tidak menyimpan data kartu kredit/CVV sama sekali (v0 verifikasi bukti transfer manual; v1 delegasi penuh ke Midtrans/Xendit)
- [x] **Data Access Control**: KTP disimpan di *private storage* dengan *short-lived signed URL*, NIK dimasking di UI, role `Caretaker` diblokir dari akses KTP
- [x] **Disclaimers**: Disclaimer laporan keuangan operasional (bukan laporan audit akuntan publik/pajak resmi) direncanakan di dashboard/ekspor PDF

### 5.3 Unit Economics Modeling (Referensi Komersial — Delivery Aktual: Portfolio Non-Komersial)
- Delivery Aktual: **Portfolio** (`Rp 0` biaya API pihak ketiga wajib; seluruh stack dapat dijalankan via Docker lokal).
- Pemodelan Referensi SaaS (jika dikomersialkan di masa depan):
  - Price / Subscription Tier: `Rp 299.000 / cabang / bulan`
  - Modeled COGS (~15% ARPU): `Rp 45.000 / cabang / bulan` (VPS/DB, object storage, monitoring)
  - Realistic Conversion Rate (referensi): `20%` dari trial ke berbayar
  - Modeled Customer Lifetime: `18 bulan`
  - Pre-Launch Estimated CAC: `Rp 600.000`
  - Fixed Monthly Overhead (VPS/DB/Domain): `Rp 450.000 / bulan`
  - Break-Even Subscribers: `450.000 / (299.000 × 85%) ≈ 2 cabang aktif`
  - Estimated LTV : CAC Ratio: `(299.000 × 0.85 × 18) : 600.000 ≈ 7.6 : 1` (Target ≥ 3:1)

---

## 6. Post-Development Kill & Pivot Criteria

*Ditinjau ulang pada M06 Minggu 4, Minggu 8, dan M07:*
- **Kill Criteria**:
  - Progress M06 Minggu 4: fitur berjalan <30% dari target Phase 1.
  - Kualitas kode gagal mencapai target 0 error/warning setelah perbaikan berulang.
- **Pivot Criteria**:
  - Timeline slip >30% di Phase 2 → pangkas fitur sekunder Phase 3 (mis. geser F-18 Room Turnover / F-19 Survey Pipeline ke v1) agar core billing + anti-fraud tetap rilis bersih.
  - Container WAHA tidak stabil di environment target → aktifkan mode `Outbox + wa.me` sebagai default utama tanpa memblokir rilis.

---

## 7. Assigned Scale Classification Parameters

- **Selected Scale**: `Large`
- **Selection Rationale**: 21 fitur P0, struktur hierarki multi-owner & multi-cabang (`Branch / Tenant Hierarchy: yes`), data sensitif KTP/keuangan (UU PDP baseline), 6-role RBAC dengan kontrol anti-fraud, tanpa kewajiban *formal assurance* non-delegable dan tanpa *legacy-core replacement*. Risiko kapasitas solo telah diterima tertulis di `docs/pm/SOLO-CAPACITY-RISK-ACCEPTANCE.md` (`Accepted-By: zeenn`, `Accepted-On: 2026-11-23`).
- **Target Development Timeline**: `20 minggu` (3 fase: Phase 1 = 8 P0, Phase 2 = 7 P0, Phase 3 = 6 P0).

---

## 8. Next Steps for Module 02 (`M02 · Scope Definition & Freeze`)
1. Kunci **RBAC Permission Matrix** detail untuk 6 role (`Super Admin`, `Owner`, `Branch Manager`, `Caretaker`, `Finance`, `Tenant`) termasuk batasan anti-fraud (*segregation of duties*, penguncian rekening bank, akses KTP).
2. Definisikan **MoSCoW & Kriteria Penerimaan (*Acceptance Criteria*)** untuk seluruh 21 fitur P0 (F-01 s.d. F-21) beserta batas tegas v1 (14 fitur) dan v2 (7 fitur).
3. Susun aturan bisnis (*business rules*) detail untuk perhitungan pro-rata, denda keterlambatan, pemotongan deposit, dan status kamar (`Available → Booked → Occupied → Cleaning → Available`).
