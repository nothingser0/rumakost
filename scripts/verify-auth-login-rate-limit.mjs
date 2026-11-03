import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const baseMigration = await readFile(
  join(root, "prisma/migrations/20261031120000_app_user/migration.sql"),
  "utf8",
);
const rateLimitMigration = await readFile(
  join(root, "prisma/migrations/20261103130000_auth_login_rate_limit/migration.sql"),
  "utf8",
);
const database = new PGlite();
const appUserId = "15000000-0000-4000-8000-000000000001";

try {
  await database.exec(baseMigration);
  await database.exec(rateLimitMigration);
  assert.match(rateLimitMigration, /FOR UPDATE/i);
  assert.match(rateLimitMigration, /ON CONFLICT \("app_user_id"\) DO NOTHING/i);
  process.stdout.write("ATOMIC_ROW_LOCKING_SQL_PRESENT=PASS\n");
  await database.query(
    `INSERT INTO app_users
       (id, auth_subject, email_normalized, display_name, role, is_active, must_change_password, updated_at)
     VALUES ($1::uuid, 'synthetic-auth-login-rate-limit', 'synthetic-auth-login-rate-limit@example.invalid', 'Fixture Owner', 'OWNER', TRUE, FALSE, clock_timestamp())`,
    [appUserId],
  );

  const reservations = [];
  for (let index = 0; index < 6; index += 1) {
    const result = await database.query(
      "SELECT * FROM reserve_auth_login_attempt($1::uuid)",
      [appUserId],
    );
    reservations.push(result.rows[0]);
  }
  assert.deepEqual(reservations.slice(0, 5).map((row) => row.allowed), [true, true, true, true, true]);
  assert.equal(reservations[5].allowed, false);
  assert.ok(reservations[5].retry_after_seconds >= 1 && reservations[5].retry_after_seconds <= 60);
  process.stdout.write("SLIDING_WINDOW_5_ALLOWED_6TH_DENIED=PASS\n");

  const beforeExpiry = await database.query(
    `SELECT cardinality(attempt_timestamps)::integer AS count
     FROM auth_login_rate_limits WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  assert.equal(beforeExpiry.rows[0].count, 5);
  await database.query(
    `UPDATE auth_login_rate_limits
     SET attempt_timestamps = ARRAY[
       clock_timestamp() - INTERVAL '61 seconds', clock_timestamp() - INTERVAL '61 seconds',
       clock_timestamp() - INTERVAL '61 seconds', clock_timestamp() - INTERVAL '61 seconds',
       clock_timestamp() - INTERVAL '61 seconds'
     ]::timestamptz[]
     WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  const reopened = await database.query(
    "SELECT * FROM reserve_auth_login_attempt($1::uuid)",
    [appUserId],
  );
  assert.equal(reopened.rows[0].allowed, true);
  const afterExpiry = await database.query(
    `SELECT cardinality(attempt_timestamps)::integer AS count
     FROM auth_login_rate_limits WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  assert.equal(afterExpiry.rows[0].count, 1);
  process.stdout.write("EXPIRED_TIMESTAMPS_PRUNED_AND_SLOT_REOPENED=PASS\n");

  const firstFailure = await database.query(
    "SELECT * FROM record_auth_login_failure($1::uuid, 1, 900)",
    [appUserId],
  );
  assert.equal(firstFailure.rows[0].consecutive_failures, 1);
  assert.ok(firstFailure.rows[0].retry_after_seconds >= 1);
  const blocked = await database.query(
    "SELECT * FROM reserve_auth_login_attempt($1::uuid)",
    [appUserId],
  );
  assert.equal(blocked.rows[0].allowed, false);
  assert.ok(blocked.rows[0].retry_after_seconds >= 1);
  await database.query(
    `UPDATE auth_login_rate_limits
     SET blocked_until = clock_timestamp() - INTERVAL '1 second'
     WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  const secondFailure = await database.query(
    "SELECT * FROM record_auth_login_failure($1::uuid, 1, 900)",
    [appUserId],
  );
  assert.equal(secondFailure.rows[0].consecutive_failures, 2);
  assert.ok(secondFailure.rows[0].retry_after_seconds >= 2);
  process.stdout.write("PROGRESSIVE_DELAY_INCREASES_AND_BLOCKS=PASS\n");

  await assert.rejects(
    database.query("SELECT * FROM record_auth_login_failure($1::uuid, 0, 900)", [appUserId]),
  );
  await assert.rejects(
    database.query("SELECT * FROM record_auth_login_failure($1::uuid, 1, 901)", [appUserId]),
  );
  await assert.rejects(
    database.query("SELECT * FROM record_auth_login_failure($1::uuid, NULL, 900)", [appUserId]),
  );
  process.stdout.write("INVALID_DELAY_PARAMETERS_REJECTED=PASS\n");

  await database.query("SELECT record_auth_login_success($1::uuid)", [appUserId]);
  const reset = await database.query(
    `SELECT consecutive_failures, blocked_until IS NULL AS unblocked
     FROM auth_login_rate_limits WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  assert.equal(reset.rows[0].consecutive_failures, 0);
  assert.equal(reset.rows[0].unblocked, true);
  process.stdout.write("SUCCESS_RESETS_FAILURE_ESCALATION=PASS\n");

  await assert.rejects(
    database.query(
      "SELECT * FROM reserve_auth_login_attempt($1::uuid)",
      ["25000000-0000-4000-8000-000000000001"],
    ),
  );
  process.stdout.write("UNKNOWN_APP_USER_FK_REJECTED=PASS\n");

  await assert.rejects(
    database.query(
      `UPDATE auth_login_rate_limits
       SET attempt_timestamps = ARRAY[
         clock_timestamp(), clock_timestamp(), clock_timestamp(), clock_timestamp(), clock_timestamp(), clock_timestamp()
       ]::timestamptz[]
       WHERE app_user_id = $1::uuid`,
      [appUserId],
    ),
  );
  const columns = await database.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'auth_login_rate_limits'
     ORDER BY ordinal_position`,
  );
  assert.deepEqual(columns.rows.map((row) => row.column_name), [
    "app_user_id",
    "attempt_timestamps",
    "consecutive_failures",
    "blocked_until",
    "updated_at",
  ]);
  process.stdout.write("MAX_5_TIMESTAMPS_AND_NO_PII_COLUMNS=PASS\n");

  await database.query(
    `UPDATE auth_login_rate_limits
     SET attempt_timestamps = ARRAY[]::timestamptz[], blocked_until = NULL
     WHERE app_user_id = $1::uuid`,
    [appUserId],
  );
  const parallelCalls = await Promise.all(
    Array.from({ length: 6 }, () =>
      database.query("SELECT * FROM reserve_auth_login_attempt($1::uuid)", [appUserId]),
    ),
  );
  assert.equal(parallelCalls.filter((result) => result.rows[0].allowed).length, 5);
  assert.equal(parallelCalls.filter((result) => !result.rows[0].allowed).length, 1);
  process.stdout.write("PARALLEL_RESERVATION_CAP=PASS (single disposable PGlite connection)\n");
  process.stdout.write("AUTH_LOGIN_RATE_LIMIT_DB_VERIFY=PASS\n");
} finally {
  await database.close();
}
