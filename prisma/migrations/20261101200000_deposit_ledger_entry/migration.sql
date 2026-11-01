-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED');

-- CreateTable
CREATE TABLE "deposit_ledger_entries" (
    "id" UUID NOT NULL,
    "lease_id" UUID NOT NULL,
    "invoice_line_id" UUID,
    "payment_allocation_id" UUID,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "refund_status" "RefundStatus",
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_ledger_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "deposit_ledger_entries_kind_valid" CHECK ("kind" IN ('COLLECTED', 'APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT', 'REFUNDED')),
    CONSTRAINT "deposit_ledger_entries_amount_positive" CHECK ("amount" > 0),
    CONSTRAINT "deposit_ledger_entries_source_valid" CHECK (
        ("kind" = 'COLLECTED' AND "payment_allocation_id" IS NOT NULL AND "invoice_line_id" IS NULL AND "refund_status" IS NULL)
        OR
        ("kind" = 'APPLIED_TO_RENT' AND "payment_allocation_id" IS NULL AND "invoice_line_id" IS NOT NULL AND "refund_status" IS NULL)
        OR
        ("kind" = 'WITHHELD_AT_CHECKOUT' AND "payment_allocation_id" IS NULL AND "invoice_line_id" IS NULL AND "reason" IS NOT NULL AND "refund_status" IS NULL)
        OR
        ("kind" = 'REFUNDED' AND "payment_allocation_id" IS NULL AND "invoice_line_id" IS NULL AND "reason" IS NOT NULL AND "refund_status" IS NOT NULL)
    ),
    CONSTRAINT "deposit_ledger_entries_payment_allocation_id_key" UNIQUE ("payment_allocation_id"),
    CONSTRAINT "deposit_ledger_entries_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deposit_ledger_entries_invoice_line_id_fkey" FOREIGN KEY ("invoice_line_id") REFERENCES "invoice_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deposit_ledger_entries_payment_allocation_id_fkey" FOREIGN KEY ("payment_allocation_id") REFERENCES "payment_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deposit_ledger_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "deposit_ledger_entries_lease_id_idx" ON "deposit_ledger_entries"("lease_id");
CREATE INDEX "deposit_ledger_entries_invoice_line_id_idx" ON "deposit_ledger_entries"("invoice_line_id");
CREATE INDEX "deposit_ledger_entries_created_by_id_idx" ON "deposit_ledger_entries"("created_by_id");

-- CreateTrigger
CREATE FUNCTION "reject_deposit_ledger_mutation"() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE'
       AND OLD."kind" = 'REFUNDED'
       AND OLD."refund_status" = 'PENDING'
       AND NEW."refund_status" IN ('PAID', 'REJECTED')
       AND NEW."id" IS NOT DISTINCT FROM OLD."id"
       AND NEW."lease_id" IS NOT DISTINCT FROM OLD."lease_id"
       AND NEW."invoice_line_id" IS NOT DISTINCT FROM OLD."invoice_line_id"
       AND NEW."payment_allocation_id" IS NOT DISTINCT FROM OLD."payment_allocation_id"
       AND NEW."kind" IS NOT DISTINCT FROM OLD."kind"
       AND NEW."amount" IS NOT DISTINCT FROM OLD."amount"
       AND NEW."reason" IS NOT DISTINCT FROM OLD."reason"
       AND NEW."created_by_id" IS NOT DISTINCT FROM OLD."created_by_id"
       AND NEW."created_at" IS NOT DISTINCT FROM OLD."created_at" THEN
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Deposit ledger entries are append-only' USING ERRCODE = '55000';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "deposit_ledger_entries_no_update"
BEFORE UPDATE ON "deposit_ledger_entries"
FOR EACH ROW EXECUTE FUNCTION "reject_deposit_ledger_mutation"();

CREATE TRIGGER "deposit_ledger_entries_no_delete"
BEFORE DELETE ON "deposit_ledger_entries"
FOR EACH ROW EXECUTE FUNCTION "reject_deposit_ledger_mutation"();
