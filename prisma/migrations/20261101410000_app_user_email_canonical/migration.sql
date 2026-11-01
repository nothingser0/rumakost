DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "app_users"
    WHERE "email_normalized" = ''
       OR "email_normalized" <> lower(btrim("email_normalized"))
  ) THEN
    RAISE EXCEPTION 'APP_USER_EMAIL_CANONICAL_BACKFILL_REQUIRED';
  END IF;
END $$;

ALTER TABLE "app_users"
  ADD CONSTRAINT "app_users_email_normalized_canonical_check"
  CHECK (
    "email_normalized" <> ''
    AND "email_normalized" = lower(btrim("email_normalized"))
  );
