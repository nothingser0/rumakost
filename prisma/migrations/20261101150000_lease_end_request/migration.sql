-- CreateEnum
CREATE TYPE "LeaseEndRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "lease_end_requests" (
    "id" UUID NOT NULL,
    "lease_id" UUID NOT NULL,
    "requested_by_tenant_id" UUID NOT NULL,
    "requested_end_on" DATE NOT NULL,
    "reason" TEXT,
    "status" "LeaseEndRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_owner_id" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lease_end_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lease_end_requests_review_state_valid" CHECK (
        ("status" = 'PENDING' AND "reviewed_by_owner_id" IS NULL AND "reviewed_at" IS NULL)
        OR
        ("status" IN ('APPROVED', 'REJECTED') AND "reviewed_by_owner_id" IS NOT NULL AND "reviewed_at" IS NOT NULL)
    )
);

-- CreateIndex
CREATE INDEX "lease_end_requests_lease_id_idx" ON "lease_end_requests"("lease_id");

-- CreateIndex
CREATE INDEX "lease_end_requests_requested_by_tenant_id_idx" ON "lease_end_requests"("requested_by_tenant_id");

-- CreateIndex
CREATE INDEX "lease_end_requests_reviewed_by_owner_id_idx" ON "lease_end_requests"("reviewed_by_owner_id");

-- AddForeignKey
ALTER TABLE "lease_end_requests" ADD CONSTRAINT "lease_end_requests_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_end_requests" ADD CONSTRAINT "lease_end_requests_requested_by_tenant_id_fkey" FOREIGN KEY ("requested_by_tenant_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_end_requests" ADD CONSTRAINT "lease_end_requests_reviewed_by_owner_id_fkey" FOREIGN KEY ("reviewed_by_owner_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
