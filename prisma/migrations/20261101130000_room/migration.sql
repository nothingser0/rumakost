-- CreateEnum
CREATE TYPE "RoomPhysicalStatus" AS ENUM ('READY', 'CLEANING', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "floor" TEXT,
    "monthly_rent" DECIMAL(12,2) NOT NULL,
    "deposit_default_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "physical_status" "RoomPhysicalStatus" NOT NULL DEFAULT 'READY',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rooms_monthly_rent_nonnegative" CHECK ("monthly_rent" >= 0),
    CONSTRAINT "rooms_deposit_default_nonnegative" CHECK ("deposit_default_amount" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_code_key" ON "rooms"("code");
