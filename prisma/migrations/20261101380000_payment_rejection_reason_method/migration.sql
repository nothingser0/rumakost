DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM payments
     WHERE method NOT IN ('TRANSFER', 'QRIS', 'CASH')
  ) THEN
    RAISE EXCEPTION 'PAYMENT_METHOD_BACKFILL_REQUIRED: normalize existing methods to TRANSFER, QRIS, or CASH before applying this migration';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM payments
     WHERE status = 'REJECTED'
  ) THEN
    RAISE EXCEPTION 'PAYMENT_REJECTION_REASON_BACKFILL_REQUIRED: add a nonblank rejection reason to existing rejected payments before applying this migration';
  END IF;
END;
$$;

ALTER TABLE payments
  ADD COLUMN rejection_reason TEXT,
  ADD CONSTRAINT payments_method_valid CHECK (method IN ('TRANSFER', 'QRIS', 'CASH')),
  ADD CONSTRAINT payments_rejection_reason_state_valid CHECK (
    (status = 'REJECTED' AND rejection_reason IS NOT NULL AND btrim(rejection_reason) <> '')
    OR
    (status <> 'REJECTED' AND rejection_reason IS NULL)
  );

CREATE FUNCTION guard_payment_rejection_reason_update() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'PENDING'
     AND NEW.status = 'REJECTED'
     AND OLD.rejection_reason IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
    RAISE EXCEPTION 'PAYMENT_REJECTION_REASON_IMMUTABLE: rejection reason is recorded once when a pending payment is rejected'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_guard_rejection_reason_update
BEFORE UPDATE OF rejection_reason ON payments
FOR EACH ROW EXECUTE FUNCTION guard_payment_rejection_reason_update();

CREATE FUNCTION reject_payment_delete() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'PAYMENT_HARD_DELETE_DENIED: preserve payment history and correct verified payments through reversal'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER payments_no_delete
BEFORE DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION reject_payment_delete();
