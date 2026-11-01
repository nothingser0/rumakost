ALTER TABLE "leases"
ADD CONSTRAINT "leases_tenant_active_period_excl" EXCLUDE USING GIST (
    "tenant_user_id" WITH =,
    daterange("starts_on", "ends_on", '[]') WITH &&
)
WHERE ("status" IN ('SCHEDULED', 'ACTIVE'));
