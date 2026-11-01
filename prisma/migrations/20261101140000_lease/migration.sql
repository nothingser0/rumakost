-- Enable GiST equality support for UUID room identifiers.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CreateEnum
CREATE TYPE "BillingMode" AS ENUM ('PRORATA_TO_MONTH_END', 'FULL_MONTH_ANNIVERSARY');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "leases" (
    "id" UUID NOT NULL,
    "tenant_user_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "rent_amount" DECIMAL(12,2) NOT NULL,
    "deposit_agreed_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "billing_mode" "BillingMode" NOT NULL,
    "status" "LeaseStatus" NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leases_dates_valid" CHECK ("ends_on" IS NULL OR "ends_on" > "starts_on"),
    CONSTRAINT "leases_rent_positive" CHECK ("rent_amount" > 0),
    CONSTRAINT "leases_deposit_nonnegative" CHECK ("deposit_agreed_amount" >= 0),
    CONSTRAINT "leases_room_active_period_excl" EXCLUDE USING GIST (
        "room_id" WITH =,
        daterange("starts_on", "ends_on", '[]') WITH &&
    ) WHERE ("status" IN ('SCHEDULED', 'ACTIVE'))
);

-- CreateIndex
CREATE INDEX "leases_tenant_user_id_idx" ON "leases"("tenant_user_id");

-- CreateIndex
CREATE INDEX "leases_room_id_starts_on_ends_on_idx" ON "leases"("room_id", "starts_on", "ends_on");

-- CreateIndex
CREATE INDEX "leases_created_by_id_idx" ON "leases"("created_by_id");

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_user_id_fkey" FOREIGN KEY ("tenant_user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
