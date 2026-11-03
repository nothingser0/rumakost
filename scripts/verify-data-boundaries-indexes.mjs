import { Client } from "@neondatabase/serverless";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
  process.stderr.write("DIRECT_URL is required for the disposable index probe.\n");
  process.exit(1);
}

const client = new Client({ connectionString });

async function hasIndex(tableName, indexName, expectedColumns) {
  const result = await client.query(
    `SELECT index_row.indisvalid AS valid,
            index_row.indisready AS ready,
            pg_get_indexdef(index_row.indexrelid) AS definition
       FROM pg_index index_row
       JOIN pg_class index_class ON index_class.oid = index_row.indexrelid
       JOIN pg_class table_class ON table_class.oid = index_row.indrelid
       JOIN pg_namespace namespace_row ON namespace_row.oid = table_class.relnamespace
      WHERE namespace_row.nspname = 'public'
        AND table_class.relname = $1
        AND index_class.relname = $2`,
    [tableName, indexName],
  );
  const row = result.rows[0];
  return Boolean(
    row?.valid
      && row.ready
      && String(row.definition).toLowerCase().includes(expectedColumns.toLowerCase()),
  );
}

async function planUsesIndex(tableName, orderBy, indexName) {
  const result = await client.query(
    `EXPLAIN (FORMAT JSON)
       SELECT id FROM ${tableName}
       ORDER BY ${orderBy}
       LIMIT 20`,
  );
  const rawPlan = result.rows[0]?.["QUERY PLAN"];
  const plan = typeof rawPlan === "string" ? JSON.parse(rawPlan) : rawPlan;
  return JSON.stringify(plan).includes(indexName);
}

async function main() {
  await client.connect();
  const checks = [
    ["ROOM_CODE_ORDER_INDEX", await hasIndex("rooms", "rooms_code_key", "(code)")],
    ["FLOOR_NORMALIZED_NAME_ORDER_INDEX", await hasIndex("floors", "floors_normalized_name_key", "(normalized_name)")],
    ["INVOICE_DUE_ON_ID_INDEX", await hasIndex("invoices", "invoices_due_on_id_idx", "(due_on DESC, id DESC)")],
    ["TICKET_CREATED_AT_ID_INDEX", await hasIndex("tickets", "tickets_created_at_id_idx", "(created_at DESC, id DESC)")],
  ];

  await client.query("SET enable_seqscan = off");
  checks.push([
    "INVOICE_ORDER_PLAN_USES_INDEX",
    await planUsesIndex("invoices", "due_on DESC, id DESC", "invoices_due_on_id_idx"),
  ]);
  checks.push([
    "TICKET_ORDER_PLAN_USES_INDEX",
    await planUsesIndex("tickets", "created_at DESC, id DESC", "tickets_created_at_id_idx"),
  ]);

  for (const [name, passed] of checks) {
    process.stdout.write(`${name}=${passed ? "PASS" : "FAIL"}\n`);
  }
  process.stdout.write(`INDEX_AND_ORDER_PLAN_CHECKS=${checks.filter(([, passed]) => passed).length}/${checks.length}\n`);
  if (checks.some(([, passed]) => !passed)) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
  process.stderr.write(`INDEX_PROBE=FAIL code=${code}\n`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
