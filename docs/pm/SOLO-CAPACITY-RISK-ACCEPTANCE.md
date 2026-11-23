# Solo Capacity Risk Acceptance

> **When**: `scripts/gates/classify-scale.sh` evaluates the project to **Large** (16–25 P0
> features / multi-service) with **no** non-delegable obligation — i.e. no
> formal external audit/certification/sector approval obligation and no legacy-core replacement. Baseline privacy duties (including UU PDP) are still required where applicable, but are not a non-delegable assurance obligation.
> Without this file the gate blocks with exit 2.
> **Where**: `docs/pm/SOLO-CAPACITY-RISK-ACCEPTANCE.md`
> **Who**: a real human. The AI agent may draft every field, but **`Accepted-By` and `Accepted-On`
> must be the human's own** — the agent may never accept delivery risk on the human's behalf
> (`docs/AUTHORITY.md`).

---

## What this accepts — and what it cannot

Large-scope solo delivery is a **schedule and quality risk**, not a legal one. This file records
that the human chose to carry it. The gate then continues (exit 5) but the override is **always
surfaced** — it never reads as a clean pass.

**This file cannot open the non-delegable block.** Formal external assurance obligations and legacy-core
replacement require a licensed third party (audit certificate, vendor engagement) that no
signature can manufacture. Those stay hard-blocked (exit 2) regardless of this file.

---

## 1. Capacity evidence (be concrete — these are the numbers being wagered)

```
- Evaluated-Scale: large
- P0-Feature-Count: 21
- Integrations: 1 — WAHA (WhatsApp Self-Hosted with local Outbox/wa.me fallback)
- Solo-Hours-per-Week: 15
- Weeks-To-Target: 20
- Total-Capacity: 300 hrs
- No-Non-Delegable-Obligation: yes
```

---

## 2. Milestone plan (a Large scope solo is only viable when decomposed)

| Phase | Scope (P0 count) | Target | Solo? |
|---|---|---|---|
| Phase 1 — Core Multi-Tenant, Security & Room Operations | F-01 Multi-Owner/Property & Branch Policy, F-02 Auth/RBAC & Anti-Fraud, F-03 Immutable Audit & UU PDP, F-04 Room Inventory, F-05 Flexible Rent & Pro-Rata, F-06 Room Assets/Keys & Handover, F-07 Tenant KYC/Co-Tenant/RT-RW, F-08 Digital Lease/Deposit/Skip-Out (8 P0) | Scale: medium | yes |
| Phase 2 — Utilities, Parking, Billing & Notifications | F-09 Overnight Guest, F-10 Electricity Token/Sub-Meter & Water, F-11 Add-ons & Appliances, F-12 Parking Slots & Vehicles, F-13 Automated Idempotent Cron Billing Engine, F-14 Manual Payment Verification/Partial/Hash Check & PDF Receipt, F-15 Notification Outbox + Announcements + WAHA/wa.me (7 P0) | Scale: medium | yes |
| Phase 3 — Operations, Portal, Pipeline & Executive Analytics | F-16 Maintenance Ticketing with SLA & Escalation, F-17 Tenant Portal, F-18 Room Turnover & Housekeeping, F-19 Survey/Owner Screening & DP Booking, F-20 Append-Only Cashbook & Bad Debt Write-Off, F-21 Executive Multi-Property Dashboard & Financial Reports (6 P0) | Scale: medium | yes |

---

## 3. Risks explicitly accepted

- **Quality**: reduced review depth vs a team; the anti-slop scan and M07/M09 still apply.
- **Timeline**: estimates assume sustained hours (15 hrs/week × 20 weeks); scope drift or availability changes will shift the ship target.
- **Bus factor**: a single maintainer; the M12 runbook (`docs/pm/RUNBOOK_OPS.md`) is the mitigant.
- **Support**: portfolio project with no external commercial SLA; warranty/SLA obligations are N/A.

---

## 4. Sign-off (HUMAN ONLY — the agent never fills these)

```
- Accepted-By: zeenn
- Accepted-On: 2026-11-23
- Scope-Version: v0 (21 P0 features)
```