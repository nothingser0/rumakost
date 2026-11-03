# Functional Specification Document (FSD) â€” RumaKost

## 1. Document Metadata

- **System / Application Name**: Sistem Manajemen Kost Mandiri (RumaKost)
- **Project Scale**: Medium; satu properti, tujuh kelompok P0
- **Document Status**: Ditinjau dan disetujui sebagai acuan implementasi M06 melalui technical sign-off pemilik pada 2026-10-31; runtime belum diverifikasi
- **PRD Reference**: `docs/specs/PRD.md`
- **Design Reference**: `docs/specs/DESIGN_SPEC.md`, `docs/specs/SITEMAP.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`
- **Data/API model**: `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`
- **Technical stack and rationale**: `docs/architecture/M05-TECHNICAL-SPEC-DRAFT.md`
- **Greenfield assessment**: N/A â€” repository currently contains product and design documents/prototypes, not an application codebase.

### Batas domain hasil crosswalk M04

Implementasi P0 mengikuti tujuh kelompok fitur Frozen Scope M02. Satu Lease memiliki satu Tenant dan satu kamar; roommate, multi-kamar Tenant, mutasi kamar saat kontrak aktif, properti editable, kapasitas/gender/amenity dinamis, tata tertib dinamis, serta permission Staff granular adalah backlog. InvoiceLine dibatasi ke `RENT` dan `DEPOSIT`; pembayaran di atas saldo terbuka ditolak tanpa credit balance, refund surplus, atau pemindahan tunggakan ke invoice lain. Refund manual hanya muncul dari rekonsiliasi deposit. Expense berdiri sendiri tanpa foreign key ke Ticket. Owner, Staff, dan Tenant dapat membuat tiket dengan kategori AC, pipa, kelistrikan, pintu/kunci, furnitur, atau umum; prioritas, judul, uraian, dan minimal satu foto/video yang berhasil diunggah wajib tersedia sebelum tiket dikirim. Tiket dimulai sebagai `DRAFT`; hanya berubah menjadi `RECEIVED` setelah minimal satu attachment `AVAILABLE` pada akhir transaksi. Tenant wajib memakai lease aktif miliknya saat membuat dan mengirim; Owner/Staff dapat memilih kamar kosong dengan lease opsional. DRAFT hanya dapat dibaca pembuat dan Owner/Staff berwenang serta tidak tampil di antrean umum/riwayat Tenant; Tenant hanya mengirim atau membuang draft miliknya. Draft yang belum dikirim kedaluwarsa 7 hari sejak `createdAt`; job mengubahnya menjadi `CANCELLED` dengan alasan `DRAFT_EXPIRED`, mencatat event actor `SYSTEM`, dan memasukkan attachment sementara ke antrean hapus yang aman diulang. Histori tiket dipertahankan; pembatalan beralasan adalah status terminal, sedangkan Owner saja dapat membuka kembali tiket `RESOLVED`. Komentar dan histori status append-only. Biaya servis tertaut, garansi, akun Teknisi, rating, dan notifikasi otomatis berada di luar P0. Akun Tenant pascakontrak read-only menolak seluruh mutasi dan upload, termasuk klaim pembayaran. Peringatan H-3/H+5, suspensi karena tunggakan, serta ambang kebijakan khusus bukan P0.

Expiry adalah satu-satunya pembatalan tiket tanpa AppUser actor dan `DRAFT_EXPIRED` hanya boleh dipakai job expiry: DB menerima hanya transisi `DRAFT` berumur minimal 7 hari ke `CANCELLED` dengan alasan persis `DRAFT_EXPIRED`; `statusChangedById` dan `cancelledById` NULL, sementara status event tercatat sebagai `SYSTEM` dengan `actorId` NULL. Pembatalan oleh pengguna tetap mewajibkan aktor AppUser dan menyimpan aktor yang sama pada `statusChangedById` serta `cancelledById`.

## 2. Component Architecture

### 2.1 Architecture and boundaries

Gunakan modular monolith: satu aplikasi Next.js App Router, satu database PostgreSQL pada Neon Free, dan satu bucket privat Neon Object Storage. Modul domain terdiri dari kamar, kontrak, tagihan, pembayaran/deposit, pengeluaran/laporan, serta tiket/media. UI diadaptasi dari prototipe M04 yang sudah dibekukan; demo tidak menambah layanan API, cache, message broker, atau kumpulan worker terpisah.

```mermaid
flowchart LR
  U[Owner / Staff / Tenant browser] -->|HTTPS| V[Vercel Hobby: Next.js]
  V --> A[Better Auth: app-managed identity and sessions]
  V --> D[Server authorization and domain modules]
  D --> P[(Neon PostgreSQL)]
  D --> O[Neon private Object Storage]
  D --> L[Append-only audit and financial records]
```

Trust boundaries: browser input is untrusted; server actions and route handlers authenticate and authorize each operation; database and object storage credentials are server-only; tenants are isolated by explicit ownership predicates. The MVP has one property, so multi-tenant RLS is N/A â€” single property and `Intake-Branch-Hierarchy: no`; application authorization remains mandatory.

**Existing Repository Assessment**: N/A â€” no existing application codebase. Design prototypes are HTML/CSS/JavaScript artifacts and are not treated as production source or security controls.

**Caching**: N/A â€” no application cache at the expected demo scale. Authenticated and private responses use non-public cache directives. **Pemrosesan terjadwal**: pakai satu pemanggilan Vercel Cron per hari untuk invoice yang jatuh tempo dan pembersihan retensi; operasi harus idempotent karena jadwal Hobby dibatasi harian dan waktunya dapat bergeser dalam satu jam. Handler menolak request tanpa Bearer `CRON_SECRET`. Jika Cron tidak tersedia pada project, hentikan otomatisasi dan lakukan tindakan Owner manual tanpa menambah biaya.

### 2.2 Relational Database Schema

#### Entity Relationship Diagram

```mermaid
erDiagram
  APP_USER ||--o{ LEASE : creates_or_holds
  ROOM ||--o{ LEASE : assigned_to
  LEASE ||--o{ INVOICE : billed_by
  INVOICE ||--|{ INVOICE_LINE : itemizes
  INVOICE ||--o{ PAYMENT : receives
  PAYMENT ||--o{ PAYMENT_ALLOCATION : allocates
  INVOICE_LINE ||--o{ PAYMENT_ALLOCATION : applied_to
  LEASE ||--o{ DEPOSIT_LEDGER_ENTRY : tracks_escrow
  PAYMENT ||--o| PAYMENT_REVERSAL : reversed_by
  APP_USER ||--o{ EXPENSE : records
  EXPENSE ||--o| EXPENSE_REVERSAL : corrected_by
  APP_USER ||--o{ EXPENSE_REVERSAL : creates
  APP_USER ||--o{ OPERATING_BUDGET : sets
  FLOOR ||--o{ ROOM : contains
  APP_USER ||--o| TENANT_PROFILE : has_profile
  ROOM ||--o{ TICKET : concerns
  LEASE o|--o{ TICKET : optionally_contextualizes
  APP_USER ||--o{ TICKET : creates_or_assigned
  TICKET ||--o{ TICKET_COMMENT : contains
  TICKET ||--o{ TICKET_ATTACHMENT : has
  TICKET ||--o{ TICKET_STATUS_EVENT : records
  APP_USER ||--o{ AUDIT_EVENT : performs

  APP_USER { uuid id PK; text auth_subject UK; text email_normalized UK; app_role role }
  TENANT_PROFILE { uuid user_id PK_FK; varchar phone_e164 nullable; varchar occupation nullable; varchar employer nullable; varchar city_of_origin nullable; varchar emergency_contact_name nullable; varchar emergency_contact_relation nullable; varchar emergency_contact_phone_e164 nullable; text emergency_contact_note nullable }
  FLOOR { uuid id PK; text name; text normalized_name UK; timestamptz archived_at nullable }
  ROOM { uuid id PK; text code UK; uuid floor_id FK nullable; numeric monthly_rent; numeric deposit_default_amount; room_physical_status physical_status; varchar maintenance_note nullable; timestamptz archived_at nullable; numeric width_m nullable; numeric length_m nullable }
  LEASE { uuid id PK; text contract_number UK nullable; uuid room_id FK; uuid tenant_user_id FK; date starts_on; date ends_on; billing_mode billing_mode }
  INVOICE { uuid id PK; uuid lease_id FK; date period_start; date period_end; date due_on }
  INVOICE_LINE { uuid id PK; uuid invoice_id FK; text kind; numeric amount }
  PAYMENT { uuid id PK; uuid invoice_id FK; numeric amount; payment_status status }
  PAYMENT_ALLOCATION { uuid id PK; uuid payment_id FK; uuid invoice_line_id FK; numeric amount }
  DEPOSIT_LEDGER_ENTRY { uuid id PK; uuid lease_id FK; text kind; numeric amount }
  PAYMENT_REVERSAL { uuid id PK; uuid payment_id FK; numeric amount; text reason }
  EXPENSE { uuid id PK; numeric amount; date occurred_on }
  EXPENSE_REVERSAL { uuid id PK; uuid expense_id FK_UK; numeric amount; text reason; uuid created_by FK }
  OPERATING_BUDGET { uuid id PK; date period_start UK; numeric amount; uuid updated_by FK }
  TICKET { uuid id PK; bigint ticket_number UK; uuid room_id FK; uuid lease_id FK nullable; uuid created_by FK; ticket_category category; text title; text description; text status; date target_completion_on nullable; text cancellation_reason nullable; uuid cancelled_by FK nullable; timestamptz cancelled_at nullable }
  TICKET_COMMENT { uuid id PK; uuid ticket_id FK; uuid author_id FK; text visibility }
  TICKET_ATTACHMENT { uuid id PK; uuid ticket_id FK; uuid upload_batch_id; text object_key UK; bigint size_bytes; text mime_type; integer duration_seconds nullable; timestamptz delete_after nullable }
  TICKET_STATUS_EVENT { uuid id PK; uuid ticket_id FK; ticket_status from_status nullable; ticket_status to_status; uuid actor_id FK; text reason nullable; timestamptz occurred_at }
  AUDIT_EVENT { uuid id PK; uuid actor_id FK; text action; timestamptz occurred_at }
```

- **Ticket data integrity**: semua role dapat membuat tiket. Tenant wajib memilih lease aktif miliknya pada kamar terkait; Owner/Staff dapat membuat tiket pada kamar kosong. Status `CANCELLED` terminal dengan alasan/aktor/waktu; tiket tidak dihapus. Status dan komentar memiliki histori append-only. DB menjaga metadata MIME/ukuran/durasi: JPEG/PNG/WebP maksimal 4 MiB; video MP4 atau MOV maksimal 12 MiB dan 1–30 detik; maksimum 4 foto + 1 video per upload batch; serta 40 MiB agregat per tiket dan referensi metadata lampiran awal. Format isi file dan keberhasilan upload diverifikasi server.
- **Object storage decision**: Neon Object Storage (selected), private bucket; signed URLs dibuat server setelah pemeriksaan role/kepemilikan; validasi isi MIME/ukuran/durasi di server; retensi 365 hari setelah tiket selesai atau dibatalkan; tanpa CDN publik.

Daftar entitas logis, constraint, ERD, matriks operasi, dan invarian finansial tersedia di `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`. DDL PostgreSQL berikut mencatat batas integritas utama; model Better Auth harus dipetakan ke Prisma dan dijaga oleh migration chain proyek.

```sql
CREATE TYPE app_role AS ENUM ('OWNER', 'STAFF', 'TENANT');
CREATE TYPE payment_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE billing_mode AS ENUM ('PRORATA_TO_MONTH_END', 'FULL_MONTH_ANNIVERSARY');

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text NOT NULL UNIQUE,
  email_normalized text NOT NULL UNIQUE,
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  role app_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenant_profile (
  user_id uuid PRIMARY KEY REFERENCES app_user(id) ON DELETE RESTRICT,
  phone_e164 varchar(16) CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{0,14}$'),
  occupation varchar(100),
  employer varchar(150),
  city_of_origin varchar(100),
  emergency_contact_name varchar(100),
  emergency_contact_relation varchar(50),
  emergency_contact_phone_e164 varchar(16),
  emergency_contact_note text,
  CHECK (emergency_contact_phone_e164 IS NULL OR emergency_contact_phone_e164 ~ '^\+[1-9][0-9]{0,14}$'),
  CHECK ((emergency_contact_name IS NULL) = (emergency_contact_phone_e164 IS NULL)),
  CHECK (emergency_contact_name IS NULL OR btrim(emergency_contact_name) <> ''),
  CHECK (emergency_contact_relation IS NULL OR btrim(emergency_contact_relation) <> '')
);

CREATE TABLE floor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name = btrim(name) AND name <> ''),
  normalized_name text NOT NULL UNIQUE,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (normalized_name = lower(btrim(name)))
);

CREATE TABLE room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code = upper(btrim(code)) AND code ~ '^[A-Z0-9-]{1,10}$'),
  floor_id uuid REFERENCES floor(id) ON DELETE RESTRICT,
  room_type text,
  width_m numeric(5,2),
  length_m numeric(5,2),
  monthly_rent numeric(12,2) NOT NULL CHECK (monthly_rent > 0 AND monthly_rent <= 100000000),
  deposit_default_amount numeric(12,2) NOT NULL CHECK (deposit_default_amount BETWEEN 0 AND 100000000),
  physical_status text NOT NULL,
  maintenance_note varchar(500),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((width_m IS NULL) = (length_m IS NULL)
         AND (width_m IS NULL OR (width_m > 0 AND length_m > 0)))
);

CREATE TABLE lease (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number text UNIQUE CHECK (contract_number IS NULL OR btrim(contract_number) <> ''),
  room_id uuid NOT NULL REFERENCES room(id),
  tenant_user_id uuid NOT NULL REFERENCES app_user(id),
  starts_on date NOT NULL,
  ends_on date,
  rent_amount numeric(12,2) NOT NULL CHECK (rent_amount > 0),
  deposit_agreed_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (deposit_agreed_amount >= 0),
  billing_mode billing_mode NOT NULL,
  status text NOT NULL,
  created_by uuid NOT NULL REFERENCES app_user(id),
  CHECK (ends_on IS NULL OR ends_on > starts_on)
);

CREATE TABLE invoice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES lease(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  due_on date NOT NULL,
  kind text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lease_id, period_start, period_end, kind)
);

CREATE TABLE invoice_line (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoice(id),
  kind text NOT NULL CHECK (kind IN ('RENT', 'DEPOSIT')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL
);

CREATE TABLE payment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoice(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('TRANSFER', 'QRIS', 'CASH')),
  reference text UNIQUE CHECK (reference IS NULL OR btrim(reference) <> ''),
  status payment_status NOT NULL DEFAULT 'PENDING',
  recorded_by uuid NOT NULL REFERENCES app_user(id),
  verified_by uuid REFERENCES app_user(id),
  verified_at timestamptz,
  rejected_by uuid REFERENCES app_user(id),
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'VERIFIED') = (verified_by IS NOT NULL AND verified_at IS NOT NULL)),
  CHECK (
    (status = 'REJECTED' AND rejected_by IS NOT NULL AND rejected_at IS NOT NULL
      AND rejection_reason IS NOT NULL AND btrim(rejection_reason) <> '')
    OR
    (status <> 'REJECTED' AND rejected_by IS NULL AND rejected_at IS NULL
      AND rejection_reason IS NULL)
  )
);

CREATE TABLE payment_allocation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payment(id),
  invoice_line_id uuid NOT NULL REFERENCES invoice_line(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  UNIQUE (payment_id, invoice_line_id)
);

CREATE TABLE deposit_ledger_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid NOT NULL REFERENCES lease(id),
  invoice_line_id uuid REFERENCES invoice_line(id),
  payment_allocation_id uuid UNIQUE REFERENCES payment_allocation(id),
  reversed_payment_allocation_id uuid UNIQUE REFERENCES payment_allocation(id),
  kind text NOT NULL CHECK (kind IN ('COLLECTED', 'COLLECTION_REVERSED', 'APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT', 'REFUNDED')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text,
  refund_status text CHECK (refund_status IN ('PENDING', 'PAID', 'REJECTED')),
  created_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'COLLECTED' AND payment_allocation_id IS NOT NULL AND reversed_payment_allocation_id IS NULL AND invoice_line_id IS NULL AND refund_status IS NULL)
    OR (kind = 'COLLECTION_REVERSED' AND payment_allocation_id IS NULL AND reversed_payment_allocation_id IS NOT NULL AND invoice_line_id IS NULL AND reason IS NOT NULL AND btrim(reason) <> '' AND refund_status IS NULL)
    OR (kind = 'APPLIED_TO_RENT' AND payment_allocation_id IS NULL AND reversed_payment_allocation_id IS NULL AND invoice_line_id IS NOT NULL AND refund_status IS NULL)
    OR (kind = 'WITHHELD_AT_CHECKOUT' AND payment_allocation_id IS NULL AND reversed_payment_allocation_id IS NULL AND invoice_line_id IS NULL AND reason IS NOT NULL AND btrim(reason) <> '' AND refund_status IS NULL)
    OR (kind = 'REFUNDED' AND payment_allocation_id IS NULL AND reversed_payment_allocation_id IS NULL AND invoice_line_id IS NULL AND reason IS NOT NULL AND btrim(reason) <> '' AND refund_status IS NOT NULL)
  )
);

CREATE TABLE payment_reversal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL UNIQUE REFERENCES payment(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  created_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Runtime integrity guards are installed by M06-DB migrations:
-- lines can only be added to ISSUED invoices and cannot be edited/deleted;
-- allocations must target a line on the same issued invoice and reconcile exactly
-- before verification; active verified totals cannot exceed invoice or line totals.
-- Payments move only from PENDING to VERIFIED/REJECTED; allocations and reversals
-- are append-only. Rejection requires a nonblank immutable reason. Payment method
-- is TRANSFER, QRIS, or CASH. A reversal must fully reverse a verified payment
-- with a reason; a rejected payment is not a reversal.
-- Payment rows are never hard-deleted.
-- Deposit reversals append COLLECTION_REVERSED per recorded deposit allocation;
-- the reversal is rejected when unreserved escrow cannot cover the compensation.
-- Invoice rows must have at least one line at transaction commit. An invoice
-- cannot be voided while any payment is pending or any verified payment remains
-- unreversed. Deposit rent settlement must target an ISSUED invoice.
-- Expenses require nonblank category/description and are immutable. One full,
-- reasoned reversal per expense is append-only and may be created only by OWNER.

CREATE TABLE expense (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (btrim(category) <> ''),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  occurred_on date NOT NULL,
  description text NOT NULL CHECK (btrim(description) <> ''),
  recorded_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE expense_reversal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL UNIQUE REFERENCES expense(id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL CHECK (btrim(reason) <> ''),
  created_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A trigger requires reversal.amount = expense.amount and created_by.role = OWNER.
-- UPDATE/DELETE are rejected for both Expense and ExpenseReversal. AuditEvent
-- and IdempotencyKey are written with the reversal by the backend transaction.

CREATE TABLE operating_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL UNIQUE CHECK (EXTRACT(DAY FROM period_start) = 1),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  updated_by uuid NOT NULL REFERENCES app_user(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES room(id),
  created_by uuid NOT NULL REFERENCES app_user(id),
  assigned_to uuid REFERENCES app_user(id),
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  target_completion_on date,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES ticket(id),
  author_id uuid NOT NULL REFERENCES app_user(id),
  body text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('TENANT_VISIBLE', 'INTERNAL')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES ticket(id),
  uploaded_by uuid NOT NULL REFERENCES app_user(id),
  object_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  duration_seconds integer,
  delete_after timestamptz,
  deleted_at timestamptz
);

CREATE TABLE idempotency_keys (
  key uuid PRIMARY KEY,
  operation text NOT NULL,
  response_code integer,
  response_payload jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES app_user(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reason text,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lease_room_dates ON lease (room_id, starts_on, ends_on);
CREATE INDEX idx_invoice_lease_due ON invoice (lease_id, due_on);
CREATE INDEX idx_payment_invoice_status ON payment (invoice_id, status);
CREATE INDEX idx_ticket_status_created ON ticket (status, created_at DESC);
CREATE INDEX idx_ticket_attachment_delete_after ON ticket_attachment (delete_after) WHERE deleted_at IS NULL;
CREATE INDEX idx_audit_entity_time ON audit_event (entity_type, entity_id, occurred_at DESC);
```

Pencegahan kontrak bertabrakan menggunakan exclusion constraint PostgreSQL dengan rentang tanggal dan `btree_gist`. Nama AppUser menolak nilai kosong/spasi; TenantProfile mendukung pekerjaan/instansi/kota asal opsional serta kontak darurat terstruktur dengan E.164 dan nama/nomor berpasangan; nomor telepon utama tetap opsional dan non-unique. `lease.contract_number` adalah nomor SPK opsional dan unik. Trigger DepositLedgerEntry mengunci Lease saat insert, memvalidasi line sumber sesuai lease dan status payment terverifikasi tanpa reversal untuk setoran, mewajibkan alasan nonblank, dan menolak settlement/refund/reversal setoran yang melebihi escrow tersedia; refund pending ikut dicadangkan sampai dibayar atau ditolak. Reversal payment menambahkan `COLLECTION_REVERSED` secara atomik untuk setoran deposit yang telah dicatat; koreksi gagal seluruhnya bila saldo bebas escrow tidak cukup. `lease_end_request` memakai composite FK `(lease_id, requested_by_tenant_id)` ke `(leases.id, leases.tenant_user_id)` agar DB menolak permintaan check-out atas nama Tenant lain; autentikasi/role pemanggil dan review Owner tetap diverifikasi server. `room.maintenance_note` opsional maksimal 500 karakter; `ticket.target_completion_on` opsional. Migration DB menolak hard delete Room/Floor, arsip Room dengan Lease `SCHEDULED`/`ACTIVE`, perubahan status fisik Room saat Lease tersebut ada, arsip Floor selama masih punya Room yang belum diarsipkan, Room aktif pada Floor arsip, serta Lease `SCHEDULED`/`ACTIVE` pada Room arsip atau `MAINTENANCE`. Backend tetap bertanggung jawab atas RBAC, ownership akses baca, serta audit event operasi. Entitas lain meliputi histori status tiket.

### 2.3 Framework Versions & Ecosystem Libraries (Pinned)

- **Framework**: Next.js 16.4.3 (App Router)
- **React / React DOM**: 19.3.1 / 19.3.1
- **Language / Runtime**: TypeScript 5.9.3; Node.js 24.x (tersedia di Vercel; [`engines.node`](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions))
- **Database Engine**: PostgreSQL (Neon Free)
- **ORM**: Prisma 7.10.1 with `@prisma/adapter-neon` 7.10.1; versions pinned after registry verification
- **Authentication**: Better Auth runs in the application and stores identity/session records in the same Neon PostgreSQL database through the project Prisma migration chain. The M06-AUTH-03 spike passed the core invitation and session lifecycle on a disposable Neon project; the application integration is M06-AUTH-05.
- **Account lifecycle (F-01)**: Owner creates/activates Staff and Tenant accounts; Staff may create/activate Tenant accounts only. No public or self-registration. Activation, verification, and reset links are issued through a server-side email adapter; the delivery vendor remains unselected and live delivery is verified in M07. Passwords reach the Better Auth application endpoint over HTTPS and are hashed by Better Auth; raw passwords, verification tokens, and session tokens are never persisted by application domain code, returned to UI state, or logged. Owner initiates a target user's login-email change; the new address must be verified before the Better Auth identity and `AppUser.emailNormalized` mirror change, while `authSubject` remains stable. M06-AUTH-01 implements this custom target-account flow because Better Auth's built-in change-email flow is session-scoped.
- **Object storage**: Neon Object Storage private buckets (beta)
- **Validation**: Zod 4.6.7, registry-checked and pinned for server environment validation in M06-SETUP-05
- **Form state**: React Hook Form 7.91.0 candidate; compatibility must be verified before first use
- **UI styling**: CSS from the approved prototype; Tailwind not selected
- **Tooling pinned at M06 scaffold (2026-10-31)**: `create-next-app` 16.4.3; `eslint` 10.14.0 with `@next/eslint-plugin-next` 16.4.3; TypeScript 5.9.3; `@types/node` 24.19.2; `@types/react` and `@types/react-dom` 19.3.0. Registry and peer checks performed before install; exact resolution recorded in `package-lock.json`.

### 2.4 Architecture Decision Record

The architecture decision is recorded in `docs/governance/ADR.md`: modular monolith on the locked Option A stack, with Cloudflare Workers and the Supabase alternative rejected for this portfolio demo based on compatibility and free storage constraints.

## 3. Application Operations and API Contracts

Mutasi UI internal memakai Server Actions yang memeriksa autentikasi. HTTP handler hanya dipakai untuk operasi yang memerlukan URL storage langsung. Operasi domain, otorisasi, input, efek, dan kode error tercatat di `M05-DATA-API-SPEC-DRAFT.md`; daftar dan pencarian selalu dibatasi (default 20, maksimum 100), sementara mutasi saldo atau transisi status bersifat idempotent.

#### POST /api/media/upload-intents

- **Auth**: signed-in Owner/Staff, or Tenant who owns the active ticket; server verifies role and ticket ownership.
- **Request**: `ticketId`, optional `commentId`, `uploadBatchId`, declared `fileName`, `contentType`, `sizeBytes`, optional `durationSeconds`, idempotency key. Allowed content types are JPEG/PNG/WebP (4 MiB), MP4/MOV (12 MiB, 1–30 seconds). `commentId` must belong to the same ticket and be visible to the caller.
- **Success**: `201`; returns opaque attachment ID, short-lived signed upload URL, and expiry. URL is created only after quota and ticket authorization checks.
- **Error**: `401`, `403`/non-enumerating `404`, `409` idempotency/quota conflict, `413` file too large, `415` unsupported media, `503` provider unavailable.

The browser uploads bytes directly to the signed URL, then calls the internal `finalizeUpload` Server Action. The server reads the stored object, checks its signature, actual MIME, size, and video duration, and only then marks the attachment `AVAILABLE`. This does not add a third public Route Handler.

#### POST /api/media/attachments/{attachmentId}/download-url

- **Auth**: Owner/Staff with ticket access or Tenant owning a tenant-visible attachment; visibility and ownership rechecked server-side.
- **Request**: empty JSON body; attachment ID is in the route.
- **Success**: `200`; short-lived signed download URL, no object key disclosure.
- **Error**: `401`, `403`/non-enumerating `404`, `410` deleted media, `503` provider unavailable.

Mutasi aplikasi lainnya memakai Server Actions dan mengikuti kontrak operasi Bagian 5 pada spesifikasi data/API. Hasilnya berupa respons domain bertipe; detail internal database/provider tidak pernah dikirim. Tidak ada API publik atau tanpa autentikasi.

## 4. Role Capability and Limitation Matrix

| Role | Boleh Dilakukan (Allowed Capabilities) | DILARANG / UI MASKED | Dedicated view and server enforcement |
|---|---|---|---|
| Owner | Full access to one property's rooms, tenants, tenant profiles, leases, invoices, payments, reversals, deposit reconciliation, expenses, reports, ticket assignment, internal notes, role management, and audit events. | Cannot introduce payment gateways, multiple properties, or real sensitive demo data without approved scope change. | Owner management workspace. Server checks Owner role for payment verify/reject/reversal, financial reports, account administration, audit data, and deposit reconciliation. |
| Staff | View assigned/operational rooms and related tenant/lease details; create/check-in contracts when authorized; create permitted expenses; record pending payment claims; manage tickets and internal comments. | Cannot verify/reject/reverse any payment; cannot approve own work; cannot see Owner financial reports/audit events; cannot change active lease terms or approve deposit reconciliation; cannot access unrelated tenant data or edit TenantProfile contacts. | Dedicated operational workspace. Every Server Action and Route Handler repeats role and resource checks; unauthorized operations return 403 or non-enumerating 404. |
| Tenant | View and update own TenantProfile, current/historical lease, own invoices/payment history, own tickets and visible comments/media; submit payment claim; request checkout; create/comment on own ticket. | Cannot view other Tenants, room management, internal comments, Owner/Staff data, financial reports, audit events, or administrative actions. Cannot choose internal comment visibility or sign arbitrary media URLs. | Dedicated tenant portal. Every query is scoped to authenticated user and owned lease/ticket; UI masking is supplemental only. |

## 5. Security Blueprint

### 5.1 Data classification and threat-to-control mapping

| ID / threat | Data and risk | Control and enforcement point | Planned verification in M07 |
|---|---|---|---|
SEC-01 Spoofing/session theft | Accounts and authenticated sessions | Better Auth session cookies are HTTP-only, Secure in HTTPS environments, and SameSite=Lax; server validates the session for each protected action and sign-out revokes it. No auth token in localStorage. | M06-AUTH-05, M06-BE-17; M07 test expired/revoked sessions, CSRF posture, cookie attributes, and unauthenticated actions. |
SEC-02 Credential attacks | Passwords and account access | Passwords are submitted to the app's Better Auth endpoint over HTTPS and hashed by Better Auth; raw values are never persisted, returned, or logged. Activation/reset links use a server-side email adapter; no public signup or custom WhatsApp OTP. Apply account and edge rate limits, target 5 attempts/minute per IP/account with progressive delay; avoid account enumeration. | M06-AUTH-05, M06-BE-17/18; M07 repeated login/reset/onboarding tests, email delivery, and rate-limit boundary. |
SEC-03 Tampering/replay | Payment, invoice, lease, deposit and expense state | Server-authoritative validation; PostgreSQL transactions, unique constraints, row locking for verification/reversal/settlement, idempotency keys, Decimal amounts, append-only audit events. Client-supplied role/status/balance is ignored. | Replay/concurrent mutation integration tests; verify no duplicate balance effect and valid audit trail. |
SEC-04 Information disclosure | Contact, lease, finance and ticket data | Data minimization; synthetic records only; role and ownership authorization in data access layer and every Server Action/Route Handler. Staff financial responses are omitted server-side. UU PDP baseline privacy practices apply; no formal assurance claim. | Cross-role and cross-tenant denial matrix; inspect response payloads, logs, exports, and error responses. |
SEC-05 Ticket media exposure | Private photos/videos | Neon private bucket, random opaque keys, server MIME/signature/size/duration checks, authorization before short-lived signed URL, private cache controls, orphan cleanup and deletion after 365 days. | Attempt public access, expired URL, cross-tenant fetch, spoofed MIME, oversized media, and retention cleanup. |
SEC-06 Injection and unsafe content | Form fields, comments, search and file names | Schema validation on server, parameterized Prisma queries, output escaping, safe text-only rendering for user prose, normalized filenames not used as object keys. | XSS payload tests, malformed input tests, SQL injection probes and filename traversal attempts. |
SEC-07 Denial of service/cost exhaustion | Auth, media uploads, database and free-tier quotas | Rate limits on authentication and upload intents (10 new intents/minute per active user); bounded pagination; server-side file quota of 40 MB/ticket and internal storage cap 4 GB/project; reject upload when cap is reached; no automatic paid upgrade. | M06-BE-12/17; M07 burst and quota-exhaustion tests, verify fail-closed behavior and no upload after cap. |
SEC-08 Repudiation/data loss | Financial mutations and demo continuity | Append-only audit event for sensitive actions; managed provider encryption at rest and HTTPS in transit; daily logical export/snapshot if free plan supports it. Proposed portfolio RPO 24 hours, RTO 8 hours; perform and record the restore drill during M07 before release readiness. No application AES-256-GCM layer unless a concrete field-level threat requires it. | Confirm provider encryption evidence, audit completeness, backup availability and restore drill. |

**Encryption at rest**: rely on Neon/Vercel managed encryption for provider storage; application-level AES-256-GCM is not selected because the MVP excludes identity documents, bank details, and payment receipts, and managed data storage is already the chosen boundary. Secrets use provider environment-variable storage and are never committed. **OWASP**: address access control, injection, session management, CSRF, XSS, SSRF, and unrestricted resource consumption at the listed enforcement points. Privacy: comply with the project's UU PDP baseline through data minimization, purpose limitation, access restriction, and deletion policy; legal review is outside this technical specification.

### 5.2 Typed environment contract and secret handling

Nama variabel deployment berikut dicatat tanpa nilainya; secret tidak boleh ditulis di dokumen atau chat. Vercel Hobby hanya mengizinkan satu eksekusi Cron per hari dan waktu panggilnya dapat bergeser; route harus idempotent dan mengotorisasi dengan `CRON_SECRET` ([Vercel Cron pricing and limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [securing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)):

| Variable | Scope | Validation | Handling |
|---|---|---|---|
| `DATABASE_URL` | Server | PostgreSQL URL, non-empty | Pooled Neon runtime URL; server-only. |
| `DIRECT_URL` | Migration only | PostgreSQL URL, non-empty | Direct Neon migration URL; never exposed to browser. |
| `BETTER_AUTH_URL` | Server | Same valid origin as `APP_ORIGIN`; HTTPS except local development | Explicit base URL for Better Auth routes and trusted redirect handling. |
| `BETTER_AUTH_SECRET` | Server | Random secret, at least 32 characters | Better Auth signing and encryption key; application-generated and distinct from Neon credentials. |
| `NEON_STORAGE_ENDPOINT` | Server | Valid HTTPS URL | Server-only S3-compatible storage endpoint. |
| `NEON_STORAGE_REGION` | Server | Non-empty region identifier | SigV4 signing region supplied by Neon for Object Storage. |
| `NEON_STORAGE_BUCKET` | Server | Non-empty bucket name | Name of the private bucket provisioned on the same Neon branch; not a secret. |
| `NEON_STORAGE_ACCESS_KEY` | Server | Non-empty secret | Server-only; least-privilege storage access. |
| `NEON_STORAGE_SECRET_KEY` | Server | Non-empty secret | Server-only; rotate on suspected exposure. |
| `APP_ORIGIN` | Server | Valid HTTPS URL outside local development | Allowed origin for redirects/CSRF checks. |
| `CRON_SECRET` | Server | Random secret with at least 16 characters | Bearer authentication for daily scheduled route; server-only. |

`.env.example` dan `src/lib/env.ts` memvalidasi kontrak Better Auth (`BETTER_AUTH_URL` dan `BETTER_AUTH_SECRET`) serta mewajibkan URL tersebut sama origin dengan `APP_ORIGIN`. Petakan `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, dan `AWS_SECRET_ACCESS_KEY` dari Neon ke variabel `NEON_STORAGE_*`; isi `NEON_STORAGE_BUCKET` dengan nama bucket privat pada branch yang sama. Simpan nilai kredensial hanya di `.env.local` atau secret provider; jangan meminta secret lewat chat dan jangan membaca `.env.local` untuk memverifikasinya. Pastikan `.env*` diabaikan Git kecuali `.env.example`. Validasi dilakukan saat kapabilitas terkait digunakan. Rotasi secret segera jika ter-commit atau terekspos.

### 5.3 Privacy, retention, backups, and incident boundary

- Demo data must be wholly synthetic. No interview participant data, actual tenant contact details, NIK, identity files, bank account data, or transfer receipts.
- Retain ticket media until 365 days after closure; purge via an idempotent cleanup operation. Financial/audit events are not hard-deleted or overwritten; an expense correction is a full reasoned Owner reversal plus a new expense record when needed.
- Neon Free menyediakan instant restore/PITR sampai 6 jam dengan batas histori perubahan 1 GB ([plan limits](https://neon.com/docs/introduction/plans)). Batas ini tidak menggantikan backup independen. Karena data demo sintetis, pemulihan awal memakai migrasi dan seed yang dapat diulang; Owner menjalankan PITR bila perlu dan mendokumentasikan hasil restore drill pada M07. Target operasional demo yang diusulkan: RPO maksimal 6 jam selama histori berada dalam kuota dan RTO 8 jam; keduanya bukan SLA.
- Do not log credentials, session tokens, signed URLs, raw uploaded content, or internal comments in application logs. Security incident response: revoke affected provider credentials, invalidate sessions, disable uploads if needed, preserve audit evidence, and restore from a verified backup.

### 5.4 Security requirement traceability

| Requirement | Control | Component | Verification |
|---|---|---|---|
| REQ-01.2/01.3 | SEC-01, SEC-02, SEC-04 | Auth adapter, authorization functions, edge rate controls | M06-BE-17 request-security checks; M07 auth/session/provider and role matrix |
| REQ-03.2/04.3/05.1/05.3 | SEC-03, SEC-08 | Domain service, PostgreSQL transaction, audit event | M07 integrity, retry, concurrency tests |
| REQ-06.2 | SEC-04 | Financial report query/service | M07 Staff/Tenant denial and payload audit |
| REQ-07.1/07.3 | SEC-04, SEC-05, SEC-06, SEC-07 | Upload route, private bucket, ticket data layer | M06-BE-12 upload controls; M07 upload, access, input, rate-limit, and quota tests |

## 6. Reliability, Capacity, and Cost Controls

- One property and at most five simultaneous demo users, consistent with the frozen scope.
- All list reads are paginated (default 20, maximum 100); ticket/event history uses cursor pagination if it grows.
- No cache or paid external integration. Use bounded connection pooling and distinguish runtime pooled and migration direct database URLs.
- Neon internal storage stop threshold: 4 GB/project, below the stated Free quota; refuse new uploads at/above the internal threshold and record a safe append-only operational event for Owner review, without storing filenames or object keys.
- No billing method is to be added to Vercel or Neon. Do not enable paid upgrades or unbounded usage. If a provider changes its no-card/free policy or cannot enforce a safe limit, stop the affected integration and revisit the architecture.
- Restore drill dan pemeriksaan usage alerts menjadi prasyarat sign-off. Ketersediaan selalu aktif tidak dijanjikan; scale-to-zero/tidur diterima untuk demo portfolio.

## 7. Module 04 Handoff Strategy (Strategi Peralihan Prototipe)

**Compatibility Level: Level 2**

Ubah prototipe HTML beku menjadi komponen React Next.js sambil mempertahankan tata letak, copy, token warna/tipografi, perilaku responsif, state, dan interaksi yang disetujui. Ekstrak token CSS/primitif bersama dari aset M04; gunakan peta layar-ke-route/komponen pada `docs/design/SITEMAP.md` dan `docs/specs/COMPONENT_REQUIREMENTS.md`. Ganti simulator role dan data lokal prototipe dengan state server yang terautentikasi; jangan membawa pergantian role lewat query string ke otorisasi produksi. Data contoh prototipe hanya menjadi fixture sintetis. Perilaku yang tidak tercakup scope tetap menjadi backlog; jangan menciptakan UI atau aturan domain saat porting. Persetujuan Design Freeze manusia tercatat di `DESIGN_SPEC.md`.

## 8. Stack Decision dan Input Arsitektur

### Stack Decision (LOCKED â€” human decision)

Stack Decision LOCKED: Next.js App Router + TypeScript + CSS prototype system; PostgreSQL/Prisma on Neon Free; Better Auth self-hosted on Neon PostgreSQL and private Neon Object Storage beta; Vercel Hobby for non-commercial portfolio demo; zero paid upgrades. The Better Auth decision supersedes the Neon Auth managed component as recorded in ADR-003 on 2026-11-03.
Stack-Locked-by: zeenn on 2026-10-30

- Q1 Team Expertise: Solo developer with AI assistance, documented in `PROJECT_STATE.md`; no additional engineering team.
- Q2 Database Experience: Experience level was not recorded; choose managed PostgreSQL with Prisma to keep operational work bounded. Treat ORM/database conventions as a learning item in M06 planning, not a claim of prior expertise.
- Q3 Deployment Topology: One Next.js deployment on Vercel Hobby plus one Neon PostgreSQL database and one private Neon Object Storage bucket; confirmed by owner stack choice.
- Q4 Expected Scale (Year 1): Portfolio demo, one property, up to five concurrent users, no commercial SLA; from `SCOPE_STATEMENT.md`.
- Q5 Data Model Characteristics: Relational room/tenant/lease/invoice/payment/expense/ticket data, precise monetary values, immutable correction records, and private ticket media; from P0 scope and M04.
- Q6 DevOps Complexity Tolerance: Low-cost, no-card setup and minimal operational overhead; owner explicitly selected no-card hosting and accepted beta for demo.
- Q7 Critical Feature Priority: Seven P0 groups F-01â€“F-07, especially financial integrity, role/ownership isolation, and private maintenance media; from `SCOPE_STATEMENT.md`.
- Q8 Compliance Requirements: Baseline privacy under UU PDP; no formal assurance, no real sensitive identity/banking data, synthetic demo data only; from intake and scope.

### Pilihan arsitektur dan alternatif

- **Chosen**: modular monolith, one database, one private object store, server-side authorization.
- **Rejected for this demo**: Cloudflare Workers as primary host because the available Next.js compatibility path introduces framework/runtime translation; Supabase Free because its stated storage allowance is below the internal media forecast. Re-evaluate only if the chosen providers require a card, paid usage, or cannot meet private-media controls.
- **ADR**: `docs/governance/ADR.md`.

## 9. Pemetaan Skenario M04 ke Implementasi

`docs/design/SCENARIO_EVALUATION.md` memuat 613 skenario WF-01 sampai WF-12 serta enam acceptance walkthrough E2E. Matriks mencatat klasifikasi scope dan lapisan verifikasi yang disarankan; status seluruh skenario adalah belum dieksekusi.

Pemetaan saat ini: 392 skenario kandidat generik ditautkan ke REQ; 70 skenario P0 dipetakan eksplisit; 151 backlog/out-of-scope; 0 keputusan Owner skenario terbuka. Total 613 baris. Keputusan operasional WF-09-SK-12 dicatat pada 2026-11-01; alur email tanpa sandi sementara masih menunggu implementasi M06-BE-18 dan uji provider M07. Enam E2E adalah acceptance walkthrough yang belum dieksekusi, bukan bukti PASS.

| Walkthrough E2E | P0 yang dipertahankan | Penyesuaian agar sesuai scope M02 |
|---|---|---|
| 01 Onboarding kamar, kontrak, invoice awal | F-02, F-03, F-04, F-05: kontrak, mode billing, invoice, verifikasi klaim pembayaran, dan escrow | Tidak menggunakan bukti transfer atau kuitansi; pakai klaim pembayaran manual dengan fixture sintetis. |
| 02 Tagihan bulanan dan cicilan | F-04 dan F-05: invoice berulang, pembayaran parsial, saldo, dan verifikasi Owner | Sub-meter listrik dan penagihan utilitas tetap backlog. |
| 03 Tiket kerusakan | F-07: tiket, media privat, status, komentar penghuni dan catatan internal | Akun/WhatsApp teknisi eksternal dan biaya servis tertaut ke tiket dikeluarkan; penanggung jawab internal hanya Owner/Staff aktif jika diputuskan. |
| 04 Pengeluaran dan laporan | F-06: catat pengeluaran, ringkasan arus kas/okupansi Owner-only | Struk, ekspor/print, dan akuntansi formal tidak masuk MVP. |
| 05 Check-out dan turnover | F-02, F-03, F-05: check-out, inspeksi Owner, rekonsiliasi escrow, status kamar | Detail rekening tujuan dan transfer refund otomatis tidak disimpan/dilakukan. |
| 06 Pembayaran dan koreksi | F-05: pembayaran, verifikasi, saldo parsial, reversal beralasan | Skenario multi-kamar disederhanakan menjadi satu lease; kuitansi/bukti transfer tidak digunakan. |

Akun/password contoh di runbook tidak boleh disalin sebagai kredensial aplikasi. M07 harus membuat kredensial dan data sintetis baru; jangan memakai data kontak/nomor rekening yang terlihat seperti data riil.
## 10. Keputusan Domain Terkonfirmasi dan Technical Sign-Off

Keputusan domain disetujui Owner (`zeenn`) pada 2026-10-30: pembayaran parsial dialokasikan ke sewa dahulu lalu deposit; seed demo menyertakan akun Staff sintetis; Tenant pascakontrak hanya membaca histori miliknya tanpa mutasi/unggah; foto menerima JPEG/PNG/WebP dan video MP4/MOV dengan validasi konten di server. Operasi gratis menerima scale-to-zero/tidur, Vercel Cron sekali sehari, serta Neon Free PITR dengan batas 6 jam/1 GB histori. Rujukan dan batas provider tercatat pada bagian operasi dan sumber FSD.

Review teknis disetujui oleh pemilik pada 2026-10-31 setelah meninjau PRD/FSD, scope, handoff M04, keputusan domain, batas backup, dan kemampuan provider. Persetujuan ini berlaku untuk spesifikasi dan stack M05, bukan implementasi atau pengujian runtime.

- Approved by: zeenn
- Approved on: 2026-10-31
- Validated by Solo Developer: zeenn

### M06 scaffold command (locked)

The workspace directory is named `RumaKost`, which npm rejects as a package name. From the repository root, scaffold to a temporary lowercase child directory, then merge only the generated application/configuration files into the root, preserving `docs/`, `DESIGN.md`, existing `public/` assets, and `.gitignore`. Remove the temporary scaffold directory after verifying the merged files. Use the locked version and npm with TypeScript, `src/`, ESLint, and no Tailwind; defer dependency installation until pre-install checks complete:

```powershell
npx create-next-app@16.4.3 .\rumakost --typescript --eslint --app --src-dir --import-alias "@/*" --no-tailwind --use-npm --skip-install --disable-git --yes --empty
```

