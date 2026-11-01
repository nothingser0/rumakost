DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM expenses
     WHERE btrim(category) = '' OR btrim(description) = ''
  ) THEN
    RAISE EXCEPTION 'EXPENSE_TEXT_BACKFILL_REQUIRED: fill nonblank category and description before applying this migration';
  END IF;
END;
$$;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_category_nonblank CHECK (btrim(category) <> ''),
  ADD CONSTRAINT expenses_description_nonblank CHECK (btrim(description) <> '');

CREATE FUNCTION reject_expense_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'EXPENSE_IMMUTABLE: preserve the original expense and correct it with a reasoned reversal and a replacement record when needed'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER expenses_no_update_or_delete
BEFORE UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION reject_expense_mutation();

CREATE TABLE expense_reversals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL UNIQUE REFERENCES expenses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL CHECK (btrim(reason) <> ''),
  created_by_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

CREATE INDEX expense_reversals_created_by_id_idx ON expense_reversals(created_by_id);

CREATE FUNCTION guard_expense_reversal_insert() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expense_amount NUMERIC(12,2);
  actor_role "AppRole";
BEGIN
  SELECT amount INTO expense_amount
    FROM expenses
   WHERE id = NEW.expense_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EXPENSE_NOT_FOUND: the expense to reverse does not exist'
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF NEW.amount IS DISTINCT FROM expense_amount THEN
    RAISE EXCEPTION 'EXPENSE_REVERSAL_AMOUNT_MISMATCH: an expense must be reversed in full'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT role INTO actor_role
    FROM app_users
   WHERE id = NEW.created_by_id;

  IF actor_role IS DISTINCT FROM 'OWNER'::"AppRole" THEN
    RAISE EXCEPTION 'EXPENSE_REVERSAL_OWNER_REQUIRED: only an Owner may reverse an expense'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER expense_reversals_validate_insert
BEFORE INSERT ON expense_reversals
FOR EACH ROW EXECUTE FUNCTION guard_expense_reversal_insert();

CREATE FUNCTION reject_expense_reversal_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'EXPENSE_REVERSAL_IMMUTABLE: preserve the correction event'
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER expense_reversals_no_update_or_delete
BEFORE UPDATE OR DELETE ON expense_reversals
FOR EACH ROW EXECUTE FUNCTION reject_expense_reversal_mutation();
