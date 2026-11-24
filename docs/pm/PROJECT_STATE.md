# Project State & Lifecycle Handoff

> **Purpose**: Single source of truth for project lifecycle state, module completion, gate outcomes, cross-document consistency, and open assumptions.
> **Location**: `docs/pm/PROJECT_STATE.md`
> **Instruction for AI Agents**: Read this file first when starting or resuming a session to immediately re-establish context and current gate status.

---

## 1. Project Metadata

- **Project Name**: Rumakost (Enterprise-Grade Multi-Property Boarding House & Coliving PMS)
- **Current Active Module**: M04 · UI/UX & Prototyping (M03 WAIVED — portfolio)
- **Scale**: large
- **Delivery**: portfolio
- **Lifecycle Path**: Large (Solo Coding + Advisor — requires signed `docs/pm/SOLO-CAPACITY-RISK-ACCEPTANCE.md`)
- **Primary Tech Stack**: TBD (dikunci di M05 · Architecture & Technical Specifications)
- **Project Language**: Indonesian (prose) / English (code, identifiers, schema)
- **Last Active Session Date**: 2026-11-24
- **Session Operator**: Solo Dev + AI Agent
- **Momentum**:
  - **Started**: 2026-11-23
  - **First Working Screen**: not yet
  - **Ship Target**: 2027-04-12
  - **Shipped**: not yet

### 1.0 Triage — 10 minutes (advisory, every scale)

- **Triage-Problem**: Operator dan pemilik kos multi-cabang (50–500+ kamar) kehilangan waktu puluhan jam/bulan dan kebocoran pendapatan akibat pencatatan sewa pro-rata, meteran listrik/air, parkir, tamu menginap, dan verifikasi pembayaran yang tersebar di Excel & WhatsApp.
- **Triage-Spreadsheet-Test**: pass — spreadsheet & grup WA gagal menangani isolasi multi-owner/multi-cabang (RBAC), perhitungan pro-rata + sub-meter + denda otomatis, audit trail data KTP (UU PDP), dan portal mandiri penghuni.
- **Triage-One-Capability**: Sistem PMS kos multi-owner & multi-cabang terpadu dengan billing engine otomatis (sewa fleksibel + pro-rata + listrik token/sub-meter + parkir + tamu menginap + add-ons) serta pengingat WhatsApp (WAHA dengan fallback lokal).
- **Triage-Domain-Baseline**: Multi-property & room-level inventory, kontrak digital & deposit, tagihan bulanan otomatis + pengingat WA, portal penghuni + ticketing maintenance, laporan keuangan per cabang (benchmark: Mamikos/Singgahsini, Rukita, KosBos, Genari).
- **Triage-Domain-Upgrade**: Pembayaran otomatis Payment Gateway (Midtrans v1), Promo/Diskon multi-bulan, Room Turnover Checklist, House Rules/SP & Blacklist lintas cabang, Public Property Showcase & Booking Pipeline.

### 1.1 Intake Gate (mandatory at EVERY scale)

> The 9 answers from `templates/essentials/INTAKE_GATE.md`. Every module's gate fails while any of these is missing, empty, or `UNKNOWN`.
> The last four are the High-Water-Mark inputs read by `scripts/gates/classify-scale.sh` — answer `none` / `no` explicitly; a missing line is not "none".

```
- Delivery: portfolio
- Intake-Success-Metric: Siklus penuh end-to-end (public booking -> onboarding -> kontrak -> listrik token/sub-meter -> parkir & tamu -> auto-invoice cron -> verifikasi bayar manual + notifikasi WAHA/fallback -> laporan laba rugi) berjalan lintas >=2 Owner & >=2 Cabang dengan 0 error/warning (build, typecheck, lint, runtime) dan 100% skenario SIT lulus
- Intake-P0-Features: 21 (F-01 Multi-Owner & Multi-Property Hierarchy + Branch Policy; F-02 Auth & Granular 6-Role RBAC + Anti-Fraud Segregation of Duties + Force Logout & Reset Password; F-03 Immutable Audit Trail & UU PDP Baseline; F-04 Room Inventory & Real-Time Status; F-05 Flexible Rental Schemes & Pro-Rata; F-06 Room Asset Inventory, Key/Card Log & Immutable Handover Before/After; F-07 Tenant Onboarding, KYC, Co-Tenant & RT/RW Export; F-08 Digital Lease Contract PDF, Deposit Refund & Skip-Out Termination; F-09 Overnight Guest Management; F-10 Electricity Token PLN & Sub-Meter Electricity/Water Billing with Photo Proof; F-11 Add-on Services Catalog & Appliance Surcharge; F-12 Parking Slot & Resident Vehicle Management; F-13 Automated Unified Billing Engine via Idempotent Cron; F-14 Manual Payment Verification, Partial Payment, Duplicate Hash Check & PDF Receipt with PaymentProvider Interface; F-15 Notification Outbox, Branch Announcements & WAHA with wa.me Fallback; F-16 Maintenance Ticketing with SLA Timer, Escalation & Repair Receipt; F-17 Tenant Portal with Official Bank Account & Active Wi-Fi Info; F-18 Room Turnover & Housekeeping Checklist; F-19 Survey Pipeline, Owner Screening & DP Booking Hold; F-20 Append-Only Operational Cashbook Income/Expense & Bad Debt Write-Off; F-21 Executive Multi-Property Dashboard & Financial Reports)
- Intake-Non-Features: Midtrans/Xendit automatic payment gateway (v1), Revenue Sharing & Owner Payout (v1), Public Property Showcase & Promo/Voucher (v1), Guest Parking Pass & Day Visitor Log (v1), House Rules/SP/Blacklist (v1), Mailroom/Common Area/Vendor/Shift/Preventive Maintenance (v1), Dynamic Pricing/Tax/GL/e-Meterai/OTA/Corporate Bulk Lease (v2), IoT hardware integration, Multi-owner aggregator marketplace & paid ads, Native mobile apps (iOS/Android)
- Intake-Time-Capacity: 15 hrs/week x 20 weeks = 300 hrs
- Intake-Sensitive-Data: yes
- Intake-Integrations: WAHA (WhatsApp Self-Hosted with local Outbox/wa.me fallback)
- Intake-Branch-Hierarchy: yes
- Intake-Compliance: baseline privacy (UU PDP); formal assurance: none
- Intake-Legacy-Core: no
- Intake-Status: ANSWERED
```

---

## 2. Lifecycle Module Progress & Gate Status

*Legend: `NOT_STARTED` | `IN_PROGRESS` | `PENDING_PRIMARY_RESEARCH` | `PROVISIONAL` | `PENDING_APPROVAL` | `PASS` | `CONDITIONAL_GO` | `PIVOT` | `KILL` | `WAIVED`*

### Active Gate Status: `CONDITIONAL_GO`

**Primary Research Staging & Readiness**:
- **Interview Guide**: WAIVED / Portfolio scope (benchmark empiris berbasis standar industri PMS kos Indonesia)
- **Survey Instrument**: WAIVED (portfolio)
- **Behavioral Smoke Test**: WAIVED (portfolio)
- **Requirement Matrix**: `NOT_STARTED` (dibuat di M02 · Scope Definition & Freeze)
- **Verification Plan**: `NOT_STARTED` (dibuat di M05/M07)

---

| Module ID | Module Name | Required Artifact | Gate Criteria | Gate Status | Completion Date |
|:----------|:------------|:------------------|:--------------|:-----------:|:----------------|
| **M00** | Product Research & Discovery | `docs/pm/M00_LITE.md` (optional for portfolio) | Benchmark empiris industri | `WAIVED` | - |
| **M01** | Idea Feasibility | `docs/pm/IDEA_BRIEF.md` | 4 dimensions scored 1.0–5.0, each ≥ 3.0; scale classifier clean (exit 5 with signed risk acceptance) | `CONDITIONAL_GO` | 2026-11-23 |
| **M02** | Scope Definition & Freeze | `docs/pm/SCOPE_STATEMENT.md` | MoSCoW locked, RBAC defined, 0 ambiguous P0s | `PASS` | 2026-11-23 |
| **M03** | Legal, SOW & Client Data Protection | `docs/pm/SOW_CONTRACT.md` | WAIVED (portfolio project) | `WAIVED` | 2026-11-23 |
| **M04** | UI/UX & Prototyping | `docs/specs/SITEMAP.md`, `DESIGN.md` | SITEMAP multi-role coverage, contrast ≥ 4.5:1 | `NOT_STARTED` | - |
| **M05** | Architecture & Technical Specifications | `docs/specs/PRD.md`, `docs/specs/FSD.md`, `docs/governance/ADR.md` | `Stack Decision LOCKED:` + 8 answers, DDL present, ≥10 endpoint headings, `idempotency_keys`, RLS | `NOT_STARTED` | - |
| **M06** | Development Execution | Root harness files deployed, `TODO.md` | 100% TODO completed, unit tests pass | `NOT_STARTED` | - |
| **M07** | Quality Assurance & System Integration Testing (SIT) | `docs/qa/SIT_WORKBOOK.md` | P0/P1 bugs = 0, security audit clean | `NOT_STARTED` | - |
| **M08** | Data Migration & Seeding | `docs/pm/MIGRATION_RECONCILIATION_REPORT.md` | Seed data & reconciliation verified | `NOT_STARTED` | - |
| **M09** | User Acceptance Testing (UAT) & Client Sign-off | `docs/qa/UAT_SIGNOFF.md` | Portfolio self-UAT checklist signed | `NOT_STARTED` | - |
| **M10** | Production Deployment | `docs/DEPLOYMENT_PROTOCOL.md` + `docs/pm/GO_LIVE_REPORT.md` | Live/Docker deployment verified, healthcheck 200 | `NOT_STARTED` | - |
| **M11** | Handover & Final Acceptance (BAST) | `docs/pm/BAST.md` | WAIVED (portfolio project) | `WAIVED` | - |
| **M12** | Warranty, SLA & Retainer | `docs/pm/RUNBOOK_OPS.md` | Ops runbook verified | `NOT_STARTED` | - |
| **M13** | Product Operations & Iteration | `docs/analytics/METRICS_BASELINE_REPORT.md` | Optional post-v0 iteration (Midtrans v1) | `NOT_STARTED` | - |

---

## 3. Cross-Document Consistency Matrix

| Upstream Source Document | Downstream Target Document | Consistency Audit Check | Audit Status | Last Verified Date |
|:-------------------------|:---------------------------|:------------------------|:------------:|:-------------------|
| `SCOPE_STATEMENT.md` (P0/P1 features) | `SITEMAP.md` (Screens) | Every in-scope feature maps to at least 1 screen; 0 orphan screens | `NOT_STARTED` | - |
| `SCOPE_STATEMENT.md` (RBAC Matrix) | `SITEMAP.md` & `COMPONENT_REQUIREMENTS.md` | All declared roles have corresponding route guards & component visibility states | `NOT_STARTED` | - |
| `SCOPE_STATEMENT.md` (Features) | `PRD.md` & `FSD.md` | Exact parity in feature numbering (F-01..F-NN) and acceptance criteria | `NOT_STARTED` | - |
| `FSD.md` (Data Models) | Database Schema / Migrations | Table names, relations, enum variants, and indexes match FSD exactly | `NOT_STARTED` | - |
| `PRD.md` & `FSD.md` | `docs/harness-root/TODO.md` | 100% of P0/P1 features are mapped into sprint tasks in TODO.md | `NOT_STARTED` | - |
| `FSD.md` (Pinned Versions) | `package.json` / Lockfile | Pinned packages match auto-check script output | `NOT_STARTED` | - |

---

## 4. Active Assumption Register

| Assumption ID | Hypothesis | Confidence | Test Method | Kill Threshold | Current Outcome |
|:--------------|:-----------|:----------:|:------------|:---------------|:----------------|
| ASM-01 | 21 fitur P0 dapat dibangun solo dalam 3 fase bertahap tanpa mengorbankan kualitas kode (0 error/warn) | 🔶 | Dekomposisi WBS 3 fase & verifikasi M06 per-task | Scope membengkak >25 P0 atau build/test tidak stabil | Open |
| ASM-02 | Adapter WAHA + fallback Outbox/`wa.me` berjalan mulus di lokal maupun saat WAHA tidak aktif | ✅ | Integration test dengan & tanpa container WAHA | Pengiriman tagihan gagal memblokir proses billing | Open |

---

## 5. Active Blockers & Critical Decisions

- [x] **Blocker 1**: `docs/pm/SOLO-CAPACITY-RISK-ACCEPTANCE.md` sudah ditandatangani oleh human (`Accepted-By: zeenn`, `Accepted-On: 2026-11-23`) — Scale Classifier exit 5 (*Capacity Override Accepted*).
  - *Owner*: User (Human)
  - *Unblocking Action*: Selesai.

---

## 6. Immediate Next Action for Resuming Session

- **Next-Action**: M04 di-reset total dari awal (anti-slop). Memulai Stage 1 (Inspiration Analysis, Vector Logo Suite, SITEMAP, COMPONENT_REQUIREMENTS, DESIGN.md).
- **Open-Decisions**: Alignment per-stage dan konfirmasi arahan visual.

1. **Current Step**: M04 Stage 1 — Inspiration Intake & Brand Foundation.
2. **Target Deliverable**: `docs/design/inspiration/notes.md`, `assets/logo/` SVG suite, `docs/specs/LOGO_DESIGN_BRIEF.md`, `docs/specs/SITEMAP.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`, `docs/harness-root/DESIGN.md`.
3. **Turn-Stopping Confirmation Prompt**:
   > *"Seluruh artefak M04 telah dibersihkan. Memulai eksekusi Stage 1 dari awal secara terstruktur dan bespoke."*
