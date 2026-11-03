import "server-only";

import { neon } from "@neondatabase/serverless";
import { getDatabaseEnv } from "@/lib/env";

type AppUserIdRow = { id: string };
type ReservationRow = { allowed: boolean };

function getDatabase() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

export async function getAuthLoginAccountId(email: string): Promise<string | null> {
  const rows = await getDatabase().query(
    `SELECT id
     FROM app_users
     WHERE email_normalized = $1
     LIMIT 1`,
    [email],
  );
  const row = (rows as AppUserIdRow[])[0];

  return row?.id ?? null;
}

export async function reserveAuthLoginAttempt(
  appUserId: string,
): Promise<{ allowed: boolean }> {
  const rows = await getDatabase().query(
    `SELECT allowed
     FROM reserve_auth_login_attempt($1::uuid)`,
    [appUserId],
  );
  const row = (rows as ReservationRow[])[0];

  if (!row || typeof row.allowed !== "boolean") {
    throw new Error("AUTH_LOGIN_RATE_LIMIT_RESERVATION_INVALID");
  }

  return { allowed: row.allowed };
}

export async function recordAuthLoginFailure(
  appUserId: string,
): Promise<void> {
  const rows = await getDatabase().query(
    `SELECT consecutive_failures
     FROM record_auth_login_failure($1::uuid, 1, 900)`,
    [appUserId],
  );

  if (rows.length !== 1) {
    throw new Error("AUTH_LOGIN_RATE_LIMIT_FAILURE_RECORD_INVALID");
  }
}

export async function recordAuthLoginSuccess(
  appUserId: string,
): Promise<void> {
  const rows = await getDatabase().query(
    `SELECT record_auth_login_success($1::uuid)`,
    [appUserId],
  );

  if (rows.length !== 1) {
    throw new Error("AUTH_LOGIN_RATE_LIMIT_SUCCESS_RESET_INVALID");
  }
}
