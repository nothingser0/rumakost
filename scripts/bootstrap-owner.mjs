import nextEnv from "@next/env";
import { Client } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import { stdin, stderr, stdout } from "node:process";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  stderr.write("OWNER_BOOTSTRAP_ERROR=configuration\n");
  process.exit(1);
}

const prompts = createInterface({ input: stdin, output: stderr });
const inputLines = prompts[Symbol.asyncIterator]();
let client;

try {
  const ask = async (label) => {
    stderr.write(label);
    const line = await inputLines.next();
    if (line.done) throw new Error("invalid_input");
    return line.value.trim();
  };
  const authSubject = randomUUID();
  const email = (await ask("Email akun Owner: ")).toLowerCase();
  const displayName = await ask("Nama Owner: ");
  prompts.close();

  if (
    email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    displayName.length < 1 ||
    displayName.length > 160 ||
    /[\u0000-\u001f\u007f]/.test(email + displayName)
  ) {
    throw new Error("invalid_input");
  }

  client = new Client({ connectionString });
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(20261101, 10)");

  const owners = await client.query(
    "SELECT 1 FROM app_users WHERE role = 'OWNER' LIMIT 1",
  );
  if (owners.rows.length > 0) throw new Error("owner_already_exists");

  const conflicts = await client.query(
    `SELECT 1 FROM app_users
     WHERE email_normalized = $1
     UNION ALL
     SELECT 1 FROM "user"
     WHERE email = $1
     LIMIT 1`,
    [email],
  );
  if (conflicts.rows.length > 0) throw new Error("identity_already_linked");

  await client.query(
    `INSERT INTO "user"
      (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [authSubject, displayName, email],
  );

  await client.query(
    `INSERT INTO app_users
      (id, auth_subject, email_normalized, display_name, role, is_active,
       must_change_password, created_by_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'OWNER', TRUE, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [randomUUID(), authSubject, email, displayName],
  );
  await client.query("COMMIT");
  stdout.write("OWNER_BOOTSTRAP=created_pending_verification\n");
} catch (error) {
  await client?.query("ROLLBACK").catch(() => undefined);
  const message = error instanceof Error ? error.message : "unknown";
  const code = [
    "owner_already_exists",
    "identity_already_linked",
    "invalid_input",
  ].includes(message)
    ? message
    : "failed";
  stderr.write(`OWNER_BOOTSTRAP_ERROR=${code}\n`);
  process.exitCode = 1;
} finally {
  prompts.close();
  await client?.end().catch(() => undefined);
}
