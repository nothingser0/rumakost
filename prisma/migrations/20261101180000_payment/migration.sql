-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "recorded_by_id" UUID NOT NULL,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "rejected_by_id" UUID,
    "rejected_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_amount_positive" CHECK ("amount" > 0),
    CONSTRAINT "payments_review_state_valid" CHECK (
        ("status" = 'PENDING' AND "verified_by_id" IS NULL AND "verified_at" IS NULL AND "rejected_by_id" IS NULL AND "rejected_at" IS NULL)
        OR
        ("status" = 'VERIFIED' AND "verified_by_id" IS NOT NULL AND "verified_at" IS NOT NULL AND "rejected_by_id" IS NULL AND "rejected_at" IS NULL)
        OR
        ("status" = 'REJECTED' AND "verified_by_id" IS NULL AND "verified_at" IS NULL AND "rejected_by_id" IS NOT NULL AND "rejected_at" IS NOT NULL)
    ),
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");
CREATE INDEX "payments_recorded_by_id_idx" ON "payments"("recorded_by_id");
CREATE INDEX "payments_verified_by_id_idx" ON "payments"("verified_by_id");
CREATE INDEX "payments_rejected_by_id_idx" ON "payments"("rejected_by_id");
