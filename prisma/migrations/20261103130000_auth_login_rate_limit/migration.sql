CREATE TABLE "auth_login_rate_limits" (
    "app_user_id" UUID NOT NULL,
    "attempt_timestamps" TIMESTAMPTZ(6)[] NOT NULL DEFAULT ARRAY[]::TIMESTAMPTZ(6)[],
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "blocked_until" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_login_rate_limits_pkey" PRIMARY KEY ("app_user_id"),
    CONSTRAINT "auth_login_rate_limits_attempt_count_check"
      CHECK (cardinality("attempt_timestamps") <= 5),
    CONSTRAINT "auth_login_rate_limits_consecutive_failures_check"
      CHECK ("consecutive_failures" BETWEEN 0 AND 31),
    CONSTRAINT "auth_login_rate_limits_app_user_id_fkey"
      FOREIGN KEY ("app_user_id") REFERENCES "app_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE OR REPLACE FUNCTION reserve_auth_login_attempt(p_app_user_id UUID)
RETURNS TABLE (allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ(6) := clock_timestamp();
  v_state "auth_login_rate_limits"%ROWTYPE;
  v_recent TIMESTAMPTZ(6)[];
  v_oldest TIMESTAMPTZ(6);
  v_retry_after INTEGER;
BEGIN
  IF p_app_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_LOGIN_RATE_LIMIT_USER_REQUIRED'
      USING ERRCODE = 'not_null_violation';
  END IF;

  INSERT INTO "auth_login_rate_limits" ("app_user_id", "updated_at")
  VALUES (p_app_user_id, v_now)
  ON CONFLICT ("app_user_id") DO NOTHING;

  SELECT * INTO v_state
  FROM "auth_login_rate_limits"
  WHERE "app_user_id" = p_app_user_id
  FOR UPDATE;

  IF v_state."blocked_until" IS NOT NULL AND v_state."blocked_until" > v_now THEN
    v_retry_after := GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM (v_state."blocked_until" - v_now)))::INTEGER
    );
    RETURN QUERY SELECT FALSE, v_retry_after;
    RETURN;
  END IF;

  SELECT COALESCE(
    array_agg(attempt_at ORDER BY attempt_at),
    ARRAY[]::TIMESTAMPTZ(6)[]
  )
  INTO v_recent
  FROM unnest(v_state."attempt_timestamps") AS attempts(attempt_at)
  WHERE attempt_at > v_now - INTERVAL '60 seconds';

  IF cardinality(v_recent) >= 5 THEN
    v_oldest := v_recent[1];
    v_retry_after := GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM (v_oldest + INTERVAL '60 seconds' - v_now)))::INTEGER
    );

    UPDATE "auth_login_rate_limits"
    SET "attempt_timestamps" = v_recent,
        "updated_at" = v_now
    WHERE "app_user_id" = p_app_user_id;

    RETURN QUERY SELECT FALSE, v_retry_after;
    RETURN;
  END IF;

  v_recent := array_append(v_recent, v_now);
  UPDATE "auth_login_rate_limits"
  SET "attempt_timestamps" = v_recent,
      "updated_at" = v_now
  WHERE "app_user_id" = p_app_user_id;

  RETURN QUERY SELECT TRUE, 0;
END;
$$;

CREATE OR REPLACE FUNCTION record_auth_login_failure(
  p_app_user_id UUID,
  p_initial_delay_seconds INTEGER,
  p_max_delay_seconds INTEGER
)
RETURNS TABLE (consecutive_failures INTEGER, retry_after_seconds INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ(6) := clock_timestamp();
  v_state "auth_login_rate_limits"%ROWTYPE;
  v_failures INTEGER;
  v_delay_seconds INTEGER;
  v_blocked_until TIMESTAMPTZ(6);
BEGIN
  IF p_app_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_LOGIN_RATE_LIMIT_USER_REQUIRED'
      USING ERRCODE = 'not_null_violation';
  END IF;
  IF p_initial_delay_seconds IS NULL
     OR p_max_delay_seconds IS NULL
     OR p_initial_delay_seconds NOT BETWEEN 1 AND 60
     OR p_max_delay_seconds NOT BETWEEN p_initial_delay_seconds AND 900 THEN
    RAISE EXCEPTION 'AUTH_LOGIN_RATE_LIMIT_DELAY_INVALID'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  INSERT INTO "auth_login_rate_limits" ("app_user_id", "updated_at")
  VALUES (p_app_user_id, v_now)
  ON CONFLICT ("app_user_id") DO NOTHING;

  SELECT * INTO v_state
  FROM "auth_login_rate_limits"
  WHERE "app_user_id" = p_app_user_id
  FOR UPDATE;

  v_failures := LEAST(v_state."consecutive_failures" + 1, 31);
  v_delay_seconds := LEAST(
    p_max_delay_seconds::NUMERIC,
    p_initial_delay_seconds::NUMERIC * power(2::NUMERIC, v_failures - 1)
  )::INTEGER;
  v_blocked_until := GREATEST(
    COALESCE(v_state."blocked_until", v_now),
    v_now + make_interval(secs => v_delay_seconds)
  );

  UPDATE "auth_login_rate_limits"
  SET "consecutive_failures" = v_failures,
      "blocked_until" = v_blocked_until,
      "updated_at" = v_now
  WHERE "app_user_id" = p_app_user_id;

  RETURN QUERY SELECT
    v_failures,
    GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_blocked_until - v_now)))::INTEGER);
END;
$$;

CREATE OR REPLACE FUNCTION record_auth_login_success(p_app_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "auth_login_rate_limits"
  SET "consecutive_failures" = 0,
      "blocked_until" = NULL,
      "updated_at" = clock_timestamp()
  WHERE "app_user_id" = p_app_user_id;
END;
$$;
