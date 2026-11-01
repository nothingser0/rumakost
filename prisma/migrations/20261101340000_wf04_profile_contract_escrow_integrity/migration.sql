ALTER TABLE app_users
  ADD CONSTRAINT app_users_display_name_nonblank
  CHECK (btrim(display_name) <> '');

ALTER TABLE tenant_profiles
  RENAME COLUMN emergency_contact TO emergency_contact_note;

ALTER TABLE tenant_profiles
  ADD COLUMN occupation VARCHAR(100),
  ADD COLUMN employer VARCHAR(150),
  ADD COLUMN city_of_origin VARCHAR(100),
  ADD COLUMN emergency_contact_name VARCHAR(100),
  ADD COLUMN emergency_contact_relation VARCHAR(50),
  ADD COLUMN emergency_contact_phone_e164 VARCHAR(16),
  ADD CONSTRAINT tenant_profiles_emergency_contact_phone_e164_format CHECK (
    emergency_contact_phone_e164 IS NULL
    OR emergency_contact_phone_e164 ~ '^\+[1-9][0-9]{0,14}$'
  ),
  ADD CONSTRAINT tenant_profiles_emergency_contact_name_phone_pair CHECK (
    (emergency_contact_name IS NULL) = (emergency_contact_phone_e164 IS NULL)
  ),
  ADD CONSTRAINT tenant_profiles_emergency_contact_name_nonblank CHECK (
    emergency_contact_name IS NULL OR btrim(emergency_contact_name) <> ''
  ),
  ADD CONSTRAINT tenant_profiles_emergency_contact_relation_nonblank CHECK (
    emergency_contact_relation IS NULL OR btrim(emergency_contact_relation) <> ''
  );

ALTER TABLE leases
  ADD COLUMN contract_number TEXT,
  ADD CONSTRAINT leases_contract_number_key UNIQUE (contract_number),
  ADD CONSTRAINT leases_contract_number_nonblank CHECK (
    contract_number IS NULL OR btrim(contract_number) <> ''
  );

CREATE FUNCTION guard_deposit_ledger_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  source_amount NUMERIC(12,2);
  collected_amount NUMERIC(12,2);
  reserved_amount NUMERIC(12,2);
BEGIN
  PERFORM 1 FROM leases WHERE id = NEW.lease_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DEPOSIT_LEASE_NOT_FOUND: ledger entry requires an existing lease'
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF NEW.kind = 'COLLECTED' THEN
    SELECT pa.amount
      INTO source_amount
      FROM payment_allocations pa
      JOIN payments p ON p.id = pa.payment_id
      JOIN invoice_lines il ON il.id = pa.invoice_line_id
      JOIN invoices i ON i.id = il.invoice_id
     WHERE pa.id = NEW.payment_allocation_id
       AND p.status = 'VERIFIED'
       AND il.kind = 'DEPOSIT'
       AND i.lease_id = NEW.lease_id
     FOR UPDATE OF pa, p, il, i;

    IF NOT FOUND OR source_amount IS DISTINCT FROM NEW.amount THEN
      RAISE EXCEPTION 'DEPOSIT_COLLECTION_SOURCE_INVALID: collection must match a verified deposit allocation for the same lease'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF NEW.kind = 'APPLIED_TO_RENT' THEN
    PERFORM 1
      FROM invoice_lines il
      JOIN invoices i ON i.id = il.invoice_id
     WHERE il.id = NEW.invoice_line_id
       AND il.kind = 'RENT'
       AND i.lease_id = NEW.lease_id
     FOR UPDATE OF il, i;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'DEPOSIT_RENT_SOURCE_INVALID: settlement must reference a rent line for the same lease'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF NEW.kind IN ('WITHHELD_AT_CHECKOUT', 'REFUNDED')
    AND (NEW.reason IS NULL OR btrim(NEW.reason) = '') THEN
    RAISE EXCEPTION 'DEPOSIT_REASON_REQUIRED: withholding and refund require a nonblank reason'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.kind = 'REFUNDED' AND NEW.refund_status <> 'PENDING' THEN
    RAISE EXCEPTION 'DEPOSIT_REFUND_MUST_START_PENDING: settle refund after recording it'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT', 'REFUNDED') THEN
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE kind = 'COLLECTED'), 0),
      COALESCE(SUM(amount) FILTER (
        WHERE kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT')
           OR (kind = 'REFUNDED' AND refund_status IN ('PENDING', 'PAID'))
      ), 0)
      INTO collected_amount, reserved_amount
      FROM deposit_ledger_entries
     WHERE lease_id = NEW.lease_id;

    IF NEW.amount > collected_amount - reserved_amount THEN
      RAISE EXCEPTION 'DEPOSIT_INSUFFICIENT: ledger entry exceeds available escrow'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER deposit_ledger_entries_guard_insert
BEFORE INSERT ON deposit_ledger_entries
FOR EACH ROW EXECUTE FUNCTION guard_deposit_ledger_insert();
