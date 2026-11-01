-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'VOID');

-- CreateEnum
CREATE TYPE "InvoiceDeliveryStatus" AS ENUM ('UNSENT', 'SENT');

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "lease_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "due_on" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_status" "InvoiceDeliveryStatus" NOT NULL DEFAULT 'UNSENT',
    "voided_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoices_period_valid" CHECK ("period_end" >= "period_start"),
    CONSTRAINT "invoices_void_state_valid" CHECK (
        ("status" = 'ISSUED' AND "voided_at" IS NULL)
        OR
        ("status" = 'VOID' AND "voided_at" IS NOT NULL)
    ),
    CONSTRAINT "invoices_lease_id_period_start_period_end_kind_key" UNIQUE ("lease_id", "period_start", "period_end", "kind"),
    CONSTRAINT "invoices_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
