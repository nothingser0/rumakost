import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  process.stderr.write("NEON_PROJECT_VERIFY=FAIL DATABASE_URL_MISSING\n");
  process.exit(1);
}

const adapter = new PrismaNeon({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 5_000,
});
const prisma = new PrismaClient({ adapter });
let stage = "database-query";

async function main() {
  const [database] = await prisma.$queryRaw`
    SELECT current_database()::text AS name, current_schema()::text AS schema
  `;
  process.stdout.write(`DATABASE_NAME=${database.name}\n`);
  process.stdout.write(`DATABASE_SCHEMA=${database.schema}\n`);

  const [migrationSummary] = await prisma.$queryRaw`
    SELECT
      count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int AS applied,
      count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL)::int AS incomplete
    FROM "_prisma_migrations"
  `;
  process.stdout.write(`MIGRATIONS_APPLIED=${migrationSummary.applied}/41\n`);
  process.stdout.write(`MIGRATIONS_INCOMPLETE=${migrationSummary.incomplete}\n`);

  const accountCounts = await prisma.appUser.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  for (const role of ["OWNER", "STAFF", "TENANT"]) {
    const count = accountCounts.find((row) => row.role === role)?._count._all ?? 0;
    process.stdout.write(`EXISTING_APP_USERS_${role}=${count}\n`);
  }

  const [catalog] = await prisma.$queryRaw`
    SELECT
      to_regclass('public.app_users') IS NOT NULL AS app_users,
      to_regclass('public.tenant_profiles') IS NOT NULL AS tenant_profiles,
      to_regclass('public.user') IS NOT NULL AS better_auth_users,
      to_regclass('public.session') IS NOT NULL AS better_auth_sessions,
      to_regclass('public.audit_events') IS NOT NULL AS audit_events
  `;
  const catalogPassed = Object.values(catalog).every(Boolean);
  process.stdout.write(`CATALOG_REQUIRED_TABLES=${catalogPassed ? "PASS" : "FAIL"}\n`);

  stage = "transactional-sql-probe";
  const ownerId = randomUUID();
  const tenantId = randomUUID();
  const suffix = randomUUID();
  const timestamp = new Date();
  const probe = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SAVEPOINT m06_int01_probe`;
    await transaction.$executeRaw`
      INSERT INTO app_users
        (id, auth_subject, email_normalized, display_name, role, is_active,
         must_change_password, created_by_id, created_at, updated_at)
      VALUES
        (${ownerId}::uuid, ${`int01-owner:${suffix}`}, ${`int01-owner-${suffix}@example.invalid`},
         'M06 INT-01 owner probe', 'OWNER', FALSE, FALSE, NULL, ${timestamp}, ${timestamp}),
        (${tenantId}::uuid, ${`int01-tenant:${suffix}`}, ${`int01-tenant-${suffix}@example.invalid`},
         'M06 INT-01 tenant probe', 'TENANT', FALSE, FALSE, ${ownerId}::uuid, ${timestamp}, ${timestamp})
    `;
    await transaction.$executeRaw`
      INSERT INTO tenant_profiles (user_id) VALUES (${tenantId}::uuid)
    `;
    const rows = await transaction.$queryRaw`
      SELECT
        owner.role::text AS owner_role,
        tenant.role::text AS tenant_role,
        profile.user_id IS NOT NULL AS tenant_profile_exists,
        tenant.created_by_id = owner.id AS owner_created_tenant
      FROM app_users owner
      JOIN app_users tenant ON tenant.id = ${tenantId}::uuid
      LEFT JOIN tenant_profiles profile ON profile.user_id = tenant.id
      WHERE owner.id = ${ownerId}::uuid
    `;
    await transaction.$executeRaw`ROLLBACK TO SAVEPOINT m06_int01_probe`;
    await transaction.$executeRaw`RELEASE SAVEPOINT m06_int01_probe`;

    return rows[0];
  });

  const sqlPassed =
    probe?.owner_role === "OWNER" &&
    probe?.tenant_role === "TENANT" &&
    probe?.tenant_profile_exists === true &&
    probe?.owner_created_tenant === true;
  process.stdout.write(`SQL_RELATION_PROBE=${sqlPassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write("SQL_PROBE_ROLLED_BACK=true\n");

  const migrationsPassed = migrationSummary.applied === 41 && migrationSummary.incomplete === 0;
  const passed = migrationsPassed && catalogPassed && sqlPassed;
  process.stdout.write(`NEON_PROJECT_VERIFY=${passed ? "PASS" : "FAIL"}\n`);
  if (!passed) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
  const rawMessage = error instanceof Error ? error.message : "Safe diagnostic unavailable";
  const message = rawMessage.replace(/postgres(?:ql)?:\/\/[^\s'\"]+/g, "<connection-string-redacted>");
  process.stderr.write(`NEON_PROJECT_VERIFY=FAIL stage=${stage} code=${code} message=${message.slice(0, 240)}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
