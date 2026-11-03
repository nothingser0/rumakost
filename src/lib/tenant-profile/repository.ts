import "server-only";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { getDatabaseEnv } from "@/lib/env";
import type { AppRole } from "@/lib/auth/app-user";

export type TenantProfileField =
  | "phoneE164"
  | "occupation"
  | "employer"
  | "cityOfOrigin"
  | "emergencyContactName"
  | "emergencyContactRelation"
  | "emergencyContactPhoneE164"
  | "emergencyContactNote";

export type TenantProfileChanges = Partial<Record<TenantProfileField, string | null>>;
type TenantProfileAuditMetadata = { updatedFields: TenantProfileField[] };

type UpdateTenantProfileInput = {
  actorId: string;
  actorRole: AppRole;
  tenantUserId: string;
  changes: TenantProfileChanges;
  safeMetadata: TenantProfileAuditMetadata;
};

type SqlValue = string | null;

const resultSchema = z.object({
  tenantUserId: z.string().uuid(),
  changed: z.boolean(),
}).strict();

const columnByField: Record<TenantProfileField, string> = {
  phoneE164: "phone_e164",
  occupation: "occupation",
  employer: "employer",
  cityOfOrigin: "city_of_origin",
  emergencyContactName: "emergency_contact_name",
  emergencyContactRelation: "emergency_contact_relation",
  emergencyContactPhoneE164: "emergency_contact_phone_e164",
  emergencyContactNote: "emergency_contact_note",
};

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

export function createTenantProfileRepository() {
  return {
    async updateTenantProfile(input: UpdateTenantProfileInput) {
      const fields = Object.keys(input.changes) as TenantProfileField[];
      if (fields.length === 0) throw new TypeError("Tenant profile update is empty.");

      const parameters: SqlValue[] = [
        input.tenantUserId,
        input.actorId,
        input.actorRole,
      ];
      const assignments: string[] = [];
      const differences: string[] = [];

      for (const field of fields) {
        const value = input.changes[field];
        const column = columnByField[field];
        if (!column || value === undefined) {
          throw new TypeError("Invalid Tenant profile update field.");
        }

        parameters.push(value);
        const parameter = `$${parameters.length}`;
        assignments.push(`${column} = ${parameter}`);
        differences.push(`profile.${column} IS DISTINCT FROM ${parameter}`);
      }

      parameters.push(JSON.stringify(input.safeMetadata));
      const metadataParameter = `$${parameters.length}`;
      const rows: unknown[] = await getSql().query(
        `WITH eligible AS MATERIALIZED (
           SELECT profile.user_id
             FROM tenant_profiles AS profile
             JOIN app_users AS target ON target.id = profile.user_id
             JOIN app_users AS actor ON actor.id = $2::uuid
            WHERE profile.user_id = $1::uuid
              AND target.role::text = 'TENANT'
              AND actor.role::text = $3::text
              AND actor.is_active = true
              AND actor.must_change_password = false
              AND (
                actor.role::text = 'OWNER'
                OR (actor.role::text = 'TENANT' AND actor.id = target.id)
              )
         ), updated AS (
           UPDATE tenant_profiles AS profile
              SET ${assignments.join(", ")}
             FROM eligible
            WHERE profile.user_id = eligible.user_id
              AND (${differences.join(" OR ")})
           RETURNING profile.user_id
         ), audit AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at, safe_metadata
           )
           SELECT gen_random_uuid(), $2::uuid, 'TENANT_PROFILE_UPDATED',
                  'TENANT_PROFILE', updated.user_id, CURRENT_TIMESTAMP,
                  ${metadataParameter}::jsonb
             FROM updated
           RETURNING id
         )
         SELECT eligible.user_id AS "tenantUserId",
                EXISTS (SELECT 1 FROM updated) AS changed
           FROM eligible
          LIMIT 1`,
        parameters,
      );

      const parsed = resultSchema.safeParse(rows[0]);
      return parsed.success ? parsed.data : null;
    },
  };
}
