ALTER TABLE payments
  ADD COLUMN reference TEXT,
  ADD CONSTRAINT payments_reference_key UNIQUE (reference),
  ADD CONSTRAINT payments_reference_nonblank CHECK (
    reference IS NULL OR btrim(reference) <> ''
  );

CREATE TABLE idempotency_keys (
  key UUID NOT NULL,
  operation TEXT NOT NULL,
  response_code INTEGER,
  response_payload JSONB,
  completed_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT idempotency_keys_pkey PRIMARY KEY (key)
);

CREATE FUNCTION guard_invoice_state_transition() RETURNS trigger
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
      JOIN payment_allocations pa ON pa.payment_id = p.id
     WHERE p.invoice_id = OLD.id
       AND p.status = 'VERIFIED'
       AND NOT EXISTS (
         SELECT 1 FROM payment_reversals pr WHERE pr.payment_id = p.id
       )
  ) THEN
    RAISE EXCEPTION 'INVOICE_PAYMENT_VOID_DENIED: reverse verified payments before voiding the invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER invoices_guard_state_transition
BEFORE INSERT OR UPDATE OF status, voided_at ON invoices
FOR EACH ROW EXECUTE FUNCTION guard_invoice_state_transition();

CREATE FUNCTION guard_invoice_line_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_status "InvoiceStatus";
BEGIN
  SELECT i.status INTO invoice_status
    FROM invoices i
   WHERE i.id = NEW.invoice_id
   FOR UPDATE;

  IF NOT FOUND OR invoice_status <> 'ISSUED' THEN
    RAISE EXCEPTION 'INVOICE_LINE_REQUIRES_ISSUED_INVOICE: invoice lines require an issued invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER invoice_lines_guard_insert
BEFORE INSERT ON invoice_lines
FOR EACH ROW EXECUTE FUNCTION guard_invoice_line_insert();

CREATE FUNCTION reject_invoice_line_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.id IS NOT DISTINCT FROM OLD.id
     AND NEW.invoice_id IS NOT DISTINCT FROM OLD.invoice_id
     AND NEW.kind IS NOT DISTINCT FROM OLD.kind
     AND NEW.description IS NOT DISTINCT FROM OLD.description
     AND NEW.amount IS NOT DISTINCT FROM OLD.amount THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'INVOICE_LINE_APPEND_ONLY: invoice correction must follow invoice lifecycle policy'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER invoice_lines_no_update
BEFORE UPDATE ON invoice_lines
FOR EACH ROW EXECUTE FUNCTION reject_invoice_line_mutation();

CREATE TRIGGER invoice_lines_no_delete
BEFORE DELETE ON invoice_lines
FOR EACH ROW EXECUTE FUNCTION reject_invoice_line_mutation();

CREATE FUNCTION guard_payment_allocation_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payment_invoice_id UUID;
  payment_amount NUMERIC(12,2);
  payment_status "PaymentStatus";
  line_invoice_id UUID;
  invoice_status "InvoiceStatus";
  allocated_amount NUMERIC(12,2);
BEGIN
  SELECT p.invoice_id, p.amount, p.status
    INTO payment_invoice_id, payment_amount, payment_status
    FROM payments p
   WHERE p.id = NEW.payment_id
   FOR UPDATE;

  IF NOT FOUND OR payment_status <> 'PENDING' THEN
    RAISE EXCEPTION 'PAYMENT_ALLOCATION_REQUIRES_PENDING_PAYMENT: allocations can only be added to pending payments'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT il.invoice_id, i.status
    INTO line_invoice_id, invoice_status
    FROM invoice_lines il
    JOIN invoices i ON i.id = il.invoice_id
   WHERE il.id = NEW.invoice_line_id
   FOR UPDATE OF il, i;

  IF NOT FOUND OR line_invoice_id <> payment_invoice_id THEN
    RAISE EXCEPTION 'PAYMENT_ALLOCATION_INVOICE_MISMATCH: payment and invoice line must belong to the same invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  IF invoice_status <> 'ISSUED' THEN
    RAISE EXCEPTION 'PAYMENT_ALLOCATION_INVOICE_CLOSED: allocations require an issued invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT COALESCE(SUM(pa.amount), 0)
    INTO allocated_amount
    FROM payment_allocations pa
   WHERE pa.payment_id = NEW.payment_id;

  IF allocated_amount + NEW.amount > payment_amount THEN
    RAISE EXCEPTION 'PAYMENT_ALLOCATION_EXCEEDS_PAYMENT: allocations exceed the payment amount'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_allocations_guard_insert
BEFORE INSERT ON payment_allocations
FOR EACH ROW EXECUTE FUNCTION guard_payment_allocation_insert();

CREATE FUNCTION reject_payment_allocation_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'PAYMENT_ALLOCATION_APPEND_ONLY: create a correcting payment or reversal instead'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER payment_allocations_no_update
BEFORE UPDATE ON payment_allocations
FOR EACH ROW EXECUTE FUNCTION reject_payment_allocation_mutation();

CREATE TRIGGER payment_allocations_no_delete
BEFORE DELETE ON payment_allocations
FOR EACH ROW EXECUTE FUNCTION reject_payment_allocation_mutation();

CREATE FUNCTION guard_payment_review_transition() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_status "InvoiceStatus";
  allocation_total NUMERIC(12,2);
  invoice_total NUMERIC(12,2);
  active_paid_total NUMERIC(12,2);
  line_overallocated BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'PENDING' THEN
      RAISE EXCEPTION 'PAYMENT_INITIAL_STATE_INVALID: payment must start pending'
        USING ERRCODE = 'check_violation';
    END IF;

    SELECT i.status
      INTO invoice_status
      FROM invoices i
     WHERE i.id = NEW.invoice_id
     FOR UPDATE;

    IF NOT FOUND OR invoice_status <> 'ISSUED' THEN
      RAISE EXCEPTION 'PAYMENT_INVOICE_CLOSED: payments require an issued invoice'
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id
     OR NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.method IS DISTINCT FROM OLD.method
     OR NEW.reference IS DISTINCT FROM OLD.reference
     OR NEW.recorded_by_id IS DISTINCT FROM OLD.recorded_by_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'PAYMENT_FINANCIAL_FIELDS_IMMUTABLE: record a correction instead of editing payment data'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF NEW.status = OLD.status THEN
    IF NEW.verified_by_id IS DISTINCT FROM OLD.verified_by_id
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
       OR NEW.rejected_by_id IS DISTINCT FROM OLD.rejected_by_id
       OR NEW.rejected_at IS DISTINCT FROM OLD.rejected_at THEN
      RAISE EXCEPTION 'PAYMENT_REVIEW_STATE_IMMUTABLE: review fields change only during a pending decision'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status <> 'PENDING' OR NEW.status NOT IN ('VERIFIED', 'REJECTED') THEN
    RAISE EXCEPTION 'PAYMENT_STATUS_TRANSITION_INVALID: pending payment can only be verified or rejected'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT i.status
    INTO invoice_status
    FROM invoices i
   WHERE i.id = NEW.invoice_id
   FOR UPDATE;

  IF NOT FOUND OR invoice_status <> 'ISSUED' THEN
    RAISE EXCEPTION 'PAYMENT_INVOICE_CLOSED: payment review requires an issued invoice'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'VERIFIED' THEN
    SELECT COALESCE(SUM(pa.amount), 0)
      INTO allocation_total
      FROM payment_allocations pa
     WHERE pa.payment_id = NEW.id;

    IF allocation_total <> NEW.amount THEN
      RAISE EXCEPTION 'PAYMENT_ALLOCATION_INCOMPLETE: verified payment allocations must equal its amount'
        USING ERRCODE = 'check_violation';
    END IF;

    SELECT COALESCE(SUM(il.amount), 0)
      INTO invoice_total
      FROM invoice_lines il
     WHERE il.invoice_id = NEW.invoice_id;

    SELECT COALESCE(SUM(pa.amount), 0)
      INTO active_paid_total
      FROM payments p
      JOIN payment_allocations pa ON pa.payment_id = p.id
     WHERE p.invoice_id = NEW.invoice_id
       AND p.status = 'VERIFIED'
       AND NOT EXISTS (
         SELECT 1 FROM payment_reversals pr WHERE pr.payment_id = p.id
       );

    IF active_paid_total + NEW.amount > invoice_total THEN
      RAISE EXCEPTION 'PAYMENT_OVERPAYMENT: verified allocations exceed the invoice balance'
        USING ERRCODE = 'check_violation';
    END IF;

    SELECT EXISTS (
      SELECT 1
        FROM payment_allocations current_pa
        JOIN invoice_lines il ON il.id = current_pa.invoice_line_id
       WHERE current_pa.payment_id = NEW.id
       GROUP BY current_pa.invoice_line_id, il.amount
      HAVING SUM(current_pa.amount) + COALESCE((
        SELECT SUM(other_pa.amount)
          FROM payment_allocations other_pa
          JOIN payments other_p ON other_p.id = other_pa.payment_id
         WHERE other_pa.invoice_line_id = current_pa.invoice_line_id
           AND other_p.invoice_id = NEW.invoice_id
           AND other_p.status = 'VERIFIED'
           AND NOT EXISTS (
             SELECT 1 FROM payment_reversals pr WHERE pr.payment_id = other_p.id
           )
      ), 0) > il.amount
    ) INTO line_overallocated;

    IF line_overallocated THEN
      RAISE EXCEPTION 'PAYMENT_LINE_OVERALLOCATION: verified allocations exceed an invoice line amount'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_guard_review_transition
BEFORE INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION guard_payment_review_transition();

CREATE FUNCTION guard_payment_reversal_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  original_amount NUMERIC(12,2);
  original_status "PaymentStatus";
  payment_invoice_id UUID;
BEGIN
  SELECT p.amount, p.status, p.invoice_id
    INTO original_amount, original_status, payment_invoice_id
    FROM payments p
   WHERE p.id = NEW.payment_id
   FOR UPDATE;

  IF NOT FOUND OR original_status <> 'VERIFIED' THEN
    RAISE EXCEPTION 'PAYMENT_REVERSAL_REQUIRES_VERIFIED_PAYMENT: only verified payments can be reversed'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.amount <> original_amount THEN
    RAISE EXCEPTION 'PAYMENT_REVERSAL_MUST_BE_FULL: reversal amount must equal the original payment'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.reason IS NULL OR btrim(NEW.reason) = '' THEN
    RAISE EXCEPTION 'PAYMENT_REVERSAL_REASON_REQUIRED: reversal requires a nonblank reason'
      USING ERRCODE = 'check_violation';
  END IF;

  PERFORM 1 FROM invoices WHERE id = payment_invoice_id FOR UPDATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_reversals_guard_insert
BEFORE INSERT ON payment_reversals
FOR EACH ROW EXECUTE FUNCTION guard_payment_reversal_insert();

CREATE FUNCTION reject_payment_reversal_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'PAYMENT_REVERSAL_APPEND_ONLY: preserve the original reversal record'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER payment_reversals_no_update
BEFORE UPDATE ON payment_reversals
FOR EACH ROW EXECUTE FUNCTION reject_payment_reversal_mutation();

CREATE TRIGGER payment_reversals_no_delete
BEFORE DELETE ON payment_reversals
FOR EACH ROW EXECUTE FUNCTION reject_payment_reversal_mutation();
