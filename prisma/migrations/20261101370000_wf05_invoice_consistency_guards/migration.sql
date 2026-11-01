CREATE OR REPLACE FUNCTION guard_invoice_state_transition() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'ISSUED' OR NEW.voided_at IS NOT NULL THEN
      RAISE EXCEPTION 'INVOICE_INITIAL_STATE_INVALID: invoice must be created issued and not voided'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    IF NEW.voided_at IS DISTINCT FROM OLD.voided_at THEN
      RAISE EXCEPTION 'INVOICE_VOID_STATE_IMMUTABLE: void state cannot be cleared or rewritten'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status <> 'ISSUED' OR NEW.status <> 'VOID' OR NEW.voided_at IS NULL THEN
    RAISE EXCEPTION 'INVOICE_STATUS_TRANSITION_INVALID: only an issued invoice can be voided'
      USING ERRCODE = 'check_violation';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM payments p
     WHERE p.invoice_id = OLD.id
       AND (
         p.status = 'PENDING'
         OR (
           p.status = 'VERIFIED'
           AND NOT EXISTS (
             SELECT 1 FROM payment_reversals pr WHERE pr.payment_id = p.id
           )
         )
       )
  ) THEN
    RAISE EXCEPTION 'INVOICE_PAYMENT_VOID_DENIED: reject pending payments and reverse verified payments before voiding the invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION guard_deposit_ledger_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  source_amount NUMERIC(12,2);
  collected_amount NUMERIC(12,2);
  reversed_amount NUMERIC(12,2);
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
       AND NOT EXISTS (
         SELECT 1 FROM payment_reversals pr WHERE pr.payment_id = p.id
       )
     FOR UPDATE OF pa, p, il, i;

    IF NOT FOUND OR source_amount IS DISTINCT FROM NEW.amount THEN
      RAISE EXCEPTION 'DEPOSIT_COLLECTION_SOURCE_INVALID: collection must match an unreversed verified deposit allocation for the same lease'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF NEW.kind = 'COLLECTION_REVERSED' THEN
    SELECT pa.amount
      INTO source_amount
      FROM payment_allocations pa
      JOIN payments p ON p.id = pa.payment_id
      JOIN invoice_lines il ON il.id = pa.invoice_line_id
      JOIN invoices i ON i.id = il.invoice_id
      JOIN payment_reversals pr ON pr.payment_id = p.id
     WHERE pa.id = NEW.reversed_payment_allocation_id
       AND p.status = 'VERIFIED'
       AND il.kind = 'DEPOSIT'
       AND i.lease_id = NEW.lease_id
       AND pr.reason = NEW.reason
       AND pr.created_by_id = NEW.created_by_id
       AND EXISTS (
         SELECT 1
           FROM deposit_ledger_entries dle
          WHERE dle.payment_allocation_id = pa.id
            AND dle.kind = 'COLLECTED'
       );

    IF NOT FOUND OR source_amount IS DISTINCT FROM NEW.amount THEN
      RAISE EXCEPTION 'DEPOSIT_REVERSAL_SOURCE_INVALID: reversal must offset an existing collection for the same verified payment and lease'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF NEW.kind = 'APPLIED_TO_RENT' THEN
    PERFORM 1
      FROM invoice_lines il
      JOIN invoices i ON i.id = il.invoice_id
     WHERE il.id = NEW.invoice_line_id
       AND il.kind = 'RENT'
       AND i.lease_id = NEW.lease_id
       AND i.status = 'ISSUED'
     FOR UPDATE OF il, i;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'DEPOSIT_RENT_SOURCE_INVALID: settlement must reference a rent line for the same lease on an issued invoice'
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

  IF NEW.kind IN ('COLLECTION_REVERSED', 'APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT', 'REFUNDED') THEN
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE kind = 'COLLECTED'), 0),
      COALESCE(SUM(amount) FILTER (WHERE kind = 'COLLECTION_REVERSED'), 0),
      COALESCE(SUM(amount) FILTER (
        WHERE kind IN ('APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT')
           OR (kind = 'REFUNDED' AND refund_status IN ('PENDING', 'PAID'))
      ), 0)
      INTO collected_amount, reversed_amount, reserved_amount
      FROM deposit_ledger_entries
     WHERE lease_id = NEW.lease_id;

    IF NEW.amount > collected_amount - reversed_amount - reserved_amount THEN
      RAISE EXCEPTION 'DEPOSIT_INSUFFICIENT: ledger entry exceeds available escrow'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM invoices i
     WHERE NOT EXISTS (
       SELECT 1 FROM invoice_lines il WHERE il.invoice_id = i.id
     )
  ) THEN
    RAISE EXCEPTION 'INVOICE_WITHOUT_LINES_EXISTS: resolve existing empty invoices before applying this migration';
  END IF;
END;
$$;

CREATE FUNCTION enforce_invoice_has_line() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM invoice_lines il WHERE il.invoice_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'INVOICE_REQUIRES_LINE: an invoice must have at least one line before its transaction commits'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER invoices_require_at_least_one_line
AFTER INSERT OR UPDATE ON invoices
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_invoice_has_line();
