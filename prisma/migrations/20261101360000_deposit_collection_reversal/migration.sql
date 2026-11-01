ALTER TABLE deposit_ledger_entries
  ADD COLUMN reversed_payment_allocation_id UUID,
  DROP CONSTRAINT deposit_ledger_entries_kind_valid,
  ADD CONSTRAINT deposit_ledger_entries_kind_valid CHECK (
    kind IN ('COLLECTED', 'COLLECTION_REVERSED', 'APPLIED_TO_RENT', 'WITHHELD_AT_CHECKOUT', 'REFUNDED')
  ),
  DROP CONSTRAINT deposit_ledger_entries_source_valid,
  ADD CONSTRAINT deposit_ledger_entries_source_valid CHECK (
    (kind = 'COLLECTED'
      AND payment_allocation_id IS NOT NULL
      AND reversed_payment_allocation_id IS NULL
      AND invoice_line_id IS NULL
      AND refund_status IS NULL)
    OR
    (kind = 'COLLECTION_REVERSED'
      AND payment_allocation_id IS NULL
      AND reversed_payment_allocation_id IS NOT NULL
      AND invoice_line_id IS NULL
      AND reason IS NOT NULL
      AND btrim(reason) <> ''
      AND refund_status IS NULL)
    OR
    (kind = 'APPLIED_TO_RENT'
      AND payment_allocation_id IS NULL
      AND reversed_payment_allocation_id IS NULL
      AND invoice_line_id IS NOT NULL
      AND refund_status IS NULL)
    OR
    (kind = 'WITHHELD_AT_CHECKOUT'
      AND payment_allocation_id IS NULL
      AND reversed_payment_allocation_id IS NULL
      AND invoice_line_id IS NULL
      AND reason IS NOT NULL
      AND btrim(reason) <> ''
      AND refund_status IS NULL)
    OR
    (kind = 'REFUNDED'
      AND payment_allocation_id IS NULL
      AND reversed_payment_allocation_id IS NULL
      AND invoice_line_id IS NULL
      AND reason IS NOT NULL
      AND btrim(reason) <> ''
      AND refund_status IS NOT NULL)
  ),
  ADD CONSTRAINT deposit_ledger_entries_reversed_payment_allocation_id_key
    UNIQUE (reversed_payment_allocation_id),
  ADD CONSTRAINT deposit_ledger_entries_reversed_payment_allocation_id_fkey
    FOREIGN KEY (reversed_payment_allocation_id)
    REFERENCES payment_allocations(id) ON DELETE RESTRICT ON UPDATE CASCADE;

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

CREATE FUNCTION record_deposit_collection_reversal() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  collected RECORD;
BEGIN
  FOR collected IN
    SELECT dle.lease_id, dle.payment_allocation_id, dle.amount
      FROM deposit_ledger_entries dle
      JOIN payment_allocations pa ON pa.id = dle.payment_allocation_id
     WHERE dle.kind = 'COLLECTED'
       AND pa.payment_id = NEW.payment_id
  LOOP
    INSERT INTO deposit_ledger_entries (
      id,
      lease_id,
      reversed_payment_allocation_id,
      kind,
      amount,
      reason,
      created_by_id
    ) VALUES (
      gen_random_uuid(),
      collected.lease_id,
      collected.payment_allocation_id,
      'COLLECTION_REVERSED',
      collected.amount,
      NEW.reason,
      NEW.created_by_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_reversals_record_deposit_compensation
AFTER INSERT ON payment_reversals
FOR EACH ROW EXECUTE FUNCTION record_deposit_collection_reversal();
