DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "lease_end_requests" AS request
    JOIN "leases" AS lease ON lease."id" = request."lease_id"
    WHERE request."requested_by_tenant_id" <> lease."tenant_user_id"
  ) THEN
    RAISE EXCEPTION 'LEASE_END_REQUEST_TENANT_BACKFILL_REQUIRED';
  END IF;
END;
$$;

ALTER TABLE "leases"
  ADD CONSTRAINT "leases_id_tenant_user_id_key"
  UNIQUE ("id", "tenant_user_id");

ALTER TABLE "lease_end_requests"
  DROP CONSTRAINT "lease_end_requests_lease_id_fkey",
  ADD CONSTRAINT "lease_end_requests_lease_requester_fkey"
    FOREIGN KEY ("lease_id", "requested_by_tenant_id")
    REFERENCES "leases" ("id", "tenant_user_id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
