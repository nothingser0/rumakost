import nextEnv from "@next/env";
import { Client } from "@neondatabase/serverless";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { loadEnvConfig } = nextEnv;

const ids = {
  owner: "10000000-0000-4000-8000-000000000001",
  staff: "10000000-0000-4000-8000-000000000002",
  tenant: "10000000-0000-4000-8000-000000000003",
  floor: "90000000-0000-4000-8000-000000000001",
  room: "20000000-0000-4000-8000-000000000001",
  lease: "30000000-0000-4000-8000-000000000001",
  invoice: "40000000-0000-4000-8000-000000000001",
  invoiceLine: "40000000-0000-4000-8000-000000000002",
  payment: "50000000-0000-4000-8000-000000000001",
  expense: "60000000-0000-4000-8000-000000000001",
  ticket: "70000000-0000-4000-8000-000000000001",
  ticketComment: "70000000-0000-4000-8000-000000000002",
  operatingBudget: "80000000-0000-4000-8000-000000000001",
};

const fixtureTimestamp = "2026-11-01T00:00:00.000Z";

interface SeedClient {
  query(queryText: string, values?: unknown[]): Promise<unknown>;
}

export async function seedFixtureData(client: SeedClient): Promise<void> {
  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO app_users
        (id, auth_subject, email_normalized, display_name, role, created_by_id, created_at, updated_at)
       VALUES
        ($1, 'seed:rumakost:owner', 'owner.demo@example.invalid', 'Owner Demo', 'OWNER', NULL, $4, $4),
        ($2, 'seed:rumakost:staff', 'staff.demo@example.invalid', 'Staff Demo', 'STAFF', $1, $4, $4),
        ($3, 'seed:rumakost:tenant', 'tenant.demo@example.invalid', 'Penghuni Demo', 'TENANT', $1, $4, $4)
       ON CONFLICT (id) DO UPDATE SET
        auth_subject = EXCLUDED.auth_subject,
        email_normalized = EXCLUDED.email_normalized,
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role,
        is_active = TRUE,
        must_change_password = TRUE,
        created_by_id = EXCLUDED.created_by_id,
        updated_at = EXCLUDED.updated_at`,
      [ids.owner, ids.staff, ids.tenant, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO tenant_profiles (user_id, emergency_contact_note)
       VALUES ($1, NULL)
       ON CONFLICT (user_id) DO UPDATE SET emergency_contact_note = EXCLUDED.emergency_contact_note`,
      [ids.tenant],
    );

    await client.query(
      `INSERT INTO floors (id, name, normalized_name, created_at, updated_at)
       VALUES ($1, '1', '1', $2, $2)
       ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        normalized_name = EXCLUDED.normalized_name,
        archived_at = NULL,
        updated_at = EXCLUDED.updated_at`,
      [ids.floor, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO rooms
        (id, code, floor_id, room_type, width_m, length_m, monthly_rent, deposit_default_amount, physical_status, created_at, updated_at)
       VALUES ($1, 'DEMO-01', $3, 'Standar AC', 3.50, 4.00, 1500000, 750000, 'READY', $2, $2)
       ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        floor_id = EXCLUDED.floor_id,
        room_type = EXCLUDED.room_type,
        width_m = EXCLUDED.width_m,
        length_m = EXCLUDED.length_m,
        monthly_rent = EXCLUDED.monthly_rent,
        deposit_default_amount = EXCLUDED.deposit_default_amount,
        physical_status = EXCLUDED.physical_status,
        archived_at = NULL,
        updated_at = EXCLUDED.updated_at`,
      [ids.room, fixtureTimestamp, ids.floor],
    );

    await client.query(
      `INSERT INTO leases
        (id, tenant_user_id, room_id, starts_on, ends_on, rent_amount, deposit_agreed_amount,
         billing_mode, status, created_by_id, created_at, updated_at)
       VALUES ($1, $2, $3, '2026-10-01', NULL, 1500000, 750000,
         'FULL_MONTH_ANNIVERSARY', 'ACTIVE', $4, $5, $5)
       ON CONFLICT (id) DO UPDATE SET
        tenant_user_id = EXCLUDED.tenant_user_id,
        room_id = EXCLUDED.room_id,
        starts_on = EXCLUDED.starts_on,
        ends_on = EXCLUDED.ends_on,
        rent_amount = EXCLUDED.rent_amount,
        deposit_agreed_amount = EXCLUDED.deposit_agreed_amount,
        billing_mode = EXCLUDED.billing_mode,
        status = EXCLUDED.status,
        created_by_id = EXCLUDED.created_by_id,
        updated_at = EXCLUDED.updated_at`,
      [ids.lease, ids.tenant, ids.room, ids.owner, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO invoices
        (id, lease_id, period_start, period_end, due_on, kind, status, issued_at,
         delivery_status, created_at, updated_at)
       VALUES ($1, $2, '2026-11-01', '2026-11-30', '2026-11-05', 'RENT',
         'ISSUED', $3, 'UNSENT', $3, $3)
       ON CONFLICT (id) DO UPDATE SET
        lease_id = EXCLUDED.lease_id,
        period_start = EXCLUDED.period_start,
        period_end = EXCLUDED.period_end,
        due_on = EXCLUDED.due_on,
        kind = EXCLUDED.kind,
        status = EXCLUDED.status,
        issued_at = EXCLUDED.issued_at,
        delivery_status = EXCLUDED.delivery_status,
        voided_at = NULL,
        updated_at = EXCLUDED.updated_at`,
      [ids.invoice, ids.lease, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO invoice_lines (id, invoice_id, kind, amount, description)
       VALUES ($1, $2, 'RENT', 1500000, 'Sewa kamar November 2026')
       ON CONFLICT (id) DO UPDATE SET
        invoice_id = EXCLUDED.invoice_id,
        kind = EXCLUDED.kind,
        amount = EXCLUDED.amount,
        description = EXCLUDED.description`,
      [ids.invoiceLine, ids.invoice],
    );

    await client.query(
      `INSERT INTO payments
        (id, invoice_id, amount, method, status, recorded_by_id, created_at, updated_at)
       VALUES ($1, $2, 500000, 'TRANSFER', 'PENDING', $3, $4, $4)
       ON CONFLICT (id) DO UPDATE SET
        invoice_id = EXCLUDED.invoice_id,
        amount = EXCLUDED.amount,
        method = EXCLUDED.method,
        status = 'PENDING',
        recorded_by_id = EXCLUDED.recorded_by_id,
        verified_by_id = NULL,
        verified_at = NULL,
        rejected_by_id = NULL,
        rejected_at = NULL,
        updated_at = EXCLUDED.updated_at`,
      [ids.payment, ids.invoice, ids.tenant, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO expenses (id, category, amount, occurred_on, description, recorded_by_id, created_at)
       VALUES ($1, 'MAINTENANCE', 125000, '2026-11-01', 'Perawatan keran kamar demo', $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [ids.expense, ids.staff, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO operating_budgets
        (id, period_start, amount, updated_by_id, created_at, updated_at)
       VALUES ($1, '2026-11-01', 5000000, $2, $3, $3)
       ON CONFLICT (id) DO UPDATE SET
        period_start = EXCLUDED.period_start,
        amount = EXCLUDED.amount,
        updated_by_id = EXCLUDED.updated_by_id,
        updated_at = EXCLUDED.updated_at`,
      [ids.operatingBudget, ids.owner, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO tickets
        (id, room_id, lease_id, created_by_id, status_changed_by_id, assigned_to_id,
         title, description, category, priority, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4, NULL, 'Keran kamar menetes',
         'Keran wastafel kamar demo menetes perlahan.', 'PLUMBING', 'NORMAL', 'RECEIVED', $5, $5)
       ON CONFLICT (id) DO NOTHING`,
      [ids.ticket, ids.room, ids.lease, ids.tenant, fixtureTimestamp],
    );

    await client.query(
      `INSERT INTO ticket_attachments
        (id, ticket_id, uploaded_by_id, object_key, mime_type, size_bytes, upload_status, created_at)
       VALUES ($1, $2, $3, 'fixture/ticket/seed-evidence.jpg', 'image/jpeg', 1024, 'PENDING_UPLOAD', $4)
       ON CONFLICT (id) DO NOTHING`,
      ["70000000-0000-4000-8000-000000000003", ids.ticket, ids.tenant, fixtureTimestamp],
    );

    await client.query(
      `UPDATE tickets
       SET assigned_to_id = $2, status_changed_by_id = $2, status = 'ASSIGNED'
       WHERE id = $1 AND status = 'RECEIVED'`,
      [ids.ticket, ids.staff],
    );

    await client.query(
      `UPDATE tickets
       SET status_changed_by_id = $2, status = 'IN_PROGRESS'
       WHERE id = $1 AND status = 'ASSIGNED'`,
      [ids.ticket, ids.staff],
    );

    await client.query(
      `INSERT INTO ticket_comments (id, ticket_id, author_id, body, visibility, created_at)
       VALUES ($1, $2, $3, 'Laporan demo sudah diterima dan sedang ditangani.', 'TENANT_VISIBLE', $4)
       ON CONFLICT (id) DO NOTHING`,
      [ids.ticketComment, ids.ticket, ids.tenant, fixtureTimestamp],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("DIRECT_URL is required to seed the database.");
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    await seedFixtureData(client);
    process.stdout.write("SEED_STATUS=success\n");
    process.stdout.write(`SEED_FIXTURE_IDS=${JSON.stringify(ids)}\n`);
    process.stdout.write("SEED_AUTH_ACCOUNTS=not-created; fixture subjects cannot log in\n");
  } catch (error) {
    process.stderr.write("SEED_STATUS=failed\n");
    process.stderr.write(
      `SEED_ERROR=${error instanceof Error ? error.message : "Unknown error"}\n`,
    );
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
