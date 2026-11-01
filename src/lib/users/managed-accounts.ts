import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";
import { getDatabaseEnv } from "@/lib/env";
import type { AuthAppUser, AppRole } from "@/lib/auth/app-user";
import { canManageRole, listVisibleRoles } from "./policy.mjs";

export type ManagedAccount = {
  id: string;
  displayName: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  createdAtLabel: string;
};

type AccountRow = {
  id: string;
  display_name: string;
  email_normalized: string;
  role: AppRole;
  is_active: boolean;
  created_at: Date;
};

type TargetAccountRow = {
  id: string;
  auth_subject: string;
  role: AppRole;
  is_active: boolean;
};

type ProviderAdminResult<T> = {
  data: T | null;
  error: unknown | null;
};

function getDatabase() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function formatCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export async function listManagedAccounts(actorRole: AppRole): Promise<ManagedAccount[]> {
  const roles = listVisibleRoles(actorRole);
  if (roles.length === 0) return [];

  const query = actorRole === "OWNER"
    ? `SELECT id, display_name, email_normalized, role, is_active, created_at
       FROM app_users
       ORDER BY created_at DESC
       LIMIT 100`
    : `SELECT id, display_name, email_normalized, role, is_active, created_at
       FROM app_users
       WHERE role = 'TENANT'
       ORDER BY created_at DESC
       LIMIT 100`;
  const rows = (await getDatabase().query(query)) as AccountRow[];

  return rows.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    email: row.email_normalized,
    role: row.role,
    isActive: row.is_active,
    createdAtLabel: formatCreatedAt(row.created_at),
  }));
}

export async function createManagedAccount(
  actor: AuthAppUser,
  input: { displayName: string; email: string; role: AppRole },
): Promise<{ success: true; temporaryPassword: string } | { success: false }> {
  if (!canManageRole(actor.role, input.role)) return { success: false };

  const emailRows = (await getDatabase().query(
    `SELECT id FROM app_users WHERE email_normalized = $1 LIMIT 1`,
    [input.email],
  )) as { id: string }[];
  if (emailRows.length > 0) return { success: false };

  const temporaryPassword = randomBytes(24).toString("base64url");
  let identityId: string;

  try {
    const result = (await auth.admin.createUser({
      email: input.email,
      password: temporaryPassword,
      name: input.displayName,
    })) as ProviderAdminResult<{ user: { id: string } }>;
    if (result.error || !result.data?.user.id) return { success: false };
    identityId = result.data.user.id;
  } catch {
    return { success: false };
  }

  try {
    await getDatabase().query(
      `INSERT INTO app_users (
         id, auth_subject, email_normalized, display_name, role,
         is_active, must_change_password, created_by_id, updated_at
       ) VALUES ($1, $2, $3, $4, $5, true, true, $6, CURRENT_TIMESTAMP)`,
      [randomUUID(), identityId, input.email, input.displayName, input.role, actor.id],
    );
  } catch {
    try {
      await auth.admin.removeUser({ userId: identityId });
    } catch {
      return { success: false };
    }
    return { success: false };
  }

  return { success: true, temporaryPassword };
}

export async function setManagedAccountActive(
  actor: AuthAppUser,
  targetId: string,
  isActive: boolean,
): Promise<{ success: true } | { success: false }> {
  const targetRows = (await getDatabase().query(
    `SELECT id, auth_subject, role, is_active
     FROM app_users
     WHERE id = $1
     LIMIT 1`,
    [targetId],
  )) as TargetAccountRow[];
  const target = targetRows[0];

  if (!target || !canManageRole(actor.role, target.role)) return { success: false };
  if (target.is_active && isActive) return { success: true };

  try {
    const result = isActive
      ? await auth.admin.unbanUser({ userId: target.auth_subject })
      : await auth.admin.banUser({ userId: target.auth_subject, banReason: "Akun dinonaktifkan oleh pengelola." });
    if (result.error) return { success: false };
  } catch {
    return { success: false };
  }

  try {
    const updated = await getDatabase().query(
      `UPDATE app_users
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id`,
      [isActive, target.id],
    );
    if (updated.length === 1) return { success: true };
  } catch {
    try {
      if (isActive) {
        await auth.admin.banUser({ userId: target.auth_subject, banReason: "Status akun belum tersimpan." });
      } else {
        await auth.admin.unbanUser({ userId: target.auth_subject });
      }
    } catch {
      return { success: false };
    }
  }

  return { success: false };
}
