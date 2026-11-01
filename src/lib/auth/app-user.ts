import "server-only";

import { neon } from "@neondatabase/serverless";
import { getDatabaseEnv } from "@/lib/env";

export type AppRole = "OWNER" | "STAFF" | "TENANT";

export type AuthAppUser = {
  id: string;
  authSubject: string;
  role: AppRole;
  isActive: boolean;
  mustChangePassword: boolean;
};

type AppUserRow = {
  id: string;
  auth_subject: string;
  role: AppRole;
  is_active: boolean;
  must_change_password: boolean;
};

function getDatabase() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

export async function getAuthAppUser(
  authSubject: string,
): Promise<AuthAppUser | null> {
  const rows = await getDatabase().query(
    `SELECT id, auth_subject, role, is_active, must_change_password
     FROM app_users
     WHERE auth_subject = $1
     LIMIT 1`,
    [authSubject],
  );
  const row = (rows as AppUserRow[])[0];

  if (!row) return null;

  return {
    id: row.id,
    authSubject: row.auth_subject,
    role: row.role,
    isActive: row.is_active,
    mustChangePassword: row.must_change_password,
  };
}

export async function clearForcedPasswordChange(
  authSubject: string,
): Promise<boolean> {
  const rows = await getDatabase().query(
    `UPDATE app_users
     SET must_change_password = false, updated_at = CURRENT_TIMESTAMP
     WHERE auth_subject = $1 AND is_active = true
     RETURNING auth_subject`,
    [authSubject],
  );

  return rows.length === 1;
}
