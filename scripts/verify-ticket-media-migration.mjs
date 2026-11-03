import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Client } from "@neondatabase/serverless";

const OWNER_ID = randomUUID();
const ROOM_ID = randomUUID();
const TICKET_ID = randomUUID();
const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  process.stderr.write("DIRECT_URL is required for the disposable migration probe.\n");
  process.exit(1);
}

const client = new Client({ connectionString });

async function insertAttachment(overrides = {}) {
  const values = {
    id: randomUUID(),
    batchId: randomUUID(),
    objectKey: `ticket-media/${randomUUID()}`,
    mimeType: "video/quicktime",
    sizeBytes: 1,
    durationSeconds: 30,
    ...overrides,
  };
  await client.query(
    `INSERT INTO ticket_attachments
       (id, ticket_id, uploaded_by_id, upload_batch_id, object_key, mime_type, size_bytes, duration_seconds, upload_status)
     VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::text, $6::text, $7::bigint, $8::integer, 'PENDING_UPLOAD'::"TicketUploadStatus")`,
    [values.id, TICKET_ID, OWNER_ID, values.batchId, values.objectKey, values.mimeType, values.sizeBytes, values.durationSeconds],
  );
}

async function seedMediaFixture() {
  const createdAt = new Date().toISOString();
  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO app_users
         (id, auth_subject, email_normalized, display_name, role, must_change_password, created_at, updated_at)
       VALUES ($1::uuid, $2::text, $3::text, 'BE-12 Media Migration Fixture', 'OWNER', FALSE, $4::timestamptz, $4::timestamptz)`,
      [OWNER_ID, `be12-media:${randomUUID()}`, `be12-${randomUUID()}@example.invalid`, createdAt],
    );
    await client.query(
      `INSERT INTO rooms
         (id, code, monthly_rent, deposit_default_amount, physical_status, created_at, updated_at)
       VALUES ($1::uuid, $2::text, 1, 0, 'READY', $3::timestamptz, $3::timestamptz)`,
      [ROOM_ID, `B-${randomUUID().slice(0, 8).toUpperCase()}`, createdAt],
    );
    await client.query(
      `INSERT INTO tickets
         (id, room_id, created_by_id, title, description, category, priority, status, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'BE-12 media fixture', 'Synthetic migration probe fixture',
               'PLUMBING', 'NORMAL', 'DRAFT', $4::timestamptz, $4::timestamptz)`,
      [TICKET_ID, ROOM_ID, OWNER_ID, createdAt],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

async function repositorySql(name) {
  const source = await readFile(new URL("../src/lib/media/repository.ts", import.meta.url), "utf8");
  const pattern = new RegExp("const " + name + " = `([\\s\\S]*?)`;");
  const match = source.match(pattern);
  if (!match?.[1]) throw new Error(`Could not find ${name} in the media repository.`);
  return match[1];
}

async function verifyRepositorySql() {
  const createSql = await repositorySql("CREATE_UPLOAD_INTENT_SQL");
  const accessSql = await repositorySql("ATTACHMENT_ACCESS_SQL");
  const finalizeSql = await repositorySql("FINALIZE_UPLOAD_SQL");
  const idempotencyColumns = await client.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'idempotency_keys'
      ORDER BY ordinal_position`,
  );
  process.stdout.write(`IDEMPOTENCY_COLUMNS=${idempotencyColumns.rows.map((row) => row.column_name).join(",")}\n`);
  const attachmentId = randomUUID();
  const idempotencyKey = randomUUID();
  const batchId = randomUUID();
  const objectKey = `ticket-media/${randomUUID()}`;
  let createPassed = false;
  let createReplayPassed = false;
  let accessBeforeFinalizePassed = false;
  let finalizePassed = false;
  let finalizeReplayPassed = false;
  let accessPassed = false;

  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))", [`media:idempotency:${idempotencyKey}`]);
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))", [`media:actor:${OWNER_ID}`]);
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))", ["media:project-quota"]);
    await client.query("SELECT id FROM tickets WHERE id = $1::uuid FOR UPDATE", [TICKET_ID]);

    const result = await client.query(createSql, [
      attachmentId,
      OWNER_ID,
      TICKET_ID,
      null,
      batchId,
      objectKey,
      "video/quicktime",
      1,
      1,
      idempotencyKey,
      10,
      4_000_000_000,
      40 * 1024 * 1024,
      "a".repeat(64),
    ]);
    const row = result.rows?.[0];
    createPassed = row?.actorId === OWNER_ID
      && row.actorRole === "OWNER"
      && row.canUpload === true
      && row.batchConsistent === true
      && row.insertedId === attachmentId
      && row.insertedObjectKey === objectKey
      && row.insertedStatus === "PENDING_UPLOAD";

    if (createPassed) {
      const replay = await client.query(createSql, [
        randomUUID(),
        OWNER_ID,
        TICKET_ID,
        null,
        batchId,
        `ticket-media/${randomUUID()}`,
        "video/quicktime",
        1,
        1,
        idempotencyKey,
        10,
        4_000_000_000,
        40 * 1024 * 1024,
        "a".repeat(64),
      ]);
      const replayRow = replay.rows?.[0];
      const savedResponse = typeof replayRow?.existingResponsePayload === "string"
        ? JSON.parse(replayRow.existingResponsePayload)
        : replayRow?.existingResponsePayload;
      createReplayPassed = replayRow?.existingOperation === "createUploadIntent"
        && replayRow.replayId === attachmentId
        && replayRow.replayObjectKey === objectKey
        && replayRow.replayStatus === "PENDING_UPLOAD"
        && savedResponse?.requestHash === "a".repeat(64)
        && savedResponse?.data?.attachmentId === attachmentId;
    }

    if (createPassed) {
      const access = await client.query(accessSql, [
        OWNER_ID,
        attachmentId,
        true,
        "TICKET_MEDIA_FINALIZE_REQUESTED",
      ]);
      accessBeforeFinalizePassed = access.rows?.[0]?.id === attachmentId
        && access.rows[0].uploadStatus === "PENDING_UPLOAD";
    }
    if (accessBeforeFinalizePassed) {
      const finalized = await client.query(finalizeSql, [OWNER_ID, attachmentId, "TICKET_MEDIA_FINALIZED"]);
      finalizePassed = finalized.rows?.[0]?.finalized === true;
    }
    if (finalizePassed) {
      const replay = await client.query(finalizeSql, [OWNER_ID, attachmentId, "TICKET_MEDIA_FINALIZED"]);
      finalizeReplayPassed = replay.rows?.[0]?.finalized === true;
    }
    if (finalizeReplayPassed) {
      const access = await client.query(accessSql, [
        OWNER_ID,
        attachmentId,
        false,
        "TICKET_MEDIA_DOWNLOAD_URL_REQUESTED",
      ]);
      accessPassed = access.rows?.[0]?.id === attachmentId
        && access.rows[0].uploadStatus === "AVAILABLE";
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
    const message = error && typeof error === "object" && "message" in error ? String(error.message) : "Unknown error";
    process.stderr.write(`REPOSITORY_SQL_ERROR code=${code} message=${message}\n`);
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
  }

  process.stdout.write(`REPOSITORY_UPLOAD_INTENT_SQL=${createPassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`REPOSITORY_UPLOAD_INTENT_REPLAY=${createReplayPassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`REPOSITORY_FINALIZE_ACCESS_SQL=${accessBeforeFinalizePassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`REPOSITORY_FINALIZE_SQL=${finalizePassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`REPOSITORY_FINALIZE_REPLAY=${finalizeReplayPassed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`REPOSITORY_ATTACHMENT_ACCESS_SQL=${accessPassed ? "PASS" : "FAIL"}\n`);
  return [createPassed, createReplayPassed, accessBeforeFinalizePassed, finalizePassed, finalizeReplayPassed, accessPassed];
}

async function expectAccepted(name, action) {
  await client.query("BEGIN");
  let accepted = false;
  try {
    await action();
    accepted = true;
  } catch {
    accepted = false;
  }
  await client.query("ROLLBACK").catch(() => undefined);
  process.stdout.write(`${name}=${accepted ? "PASS" : "FAIL"}\n`);
  return accepted;
}

async function expectRejected(name, expected, action) {
  await client.query("BEGIN");
  let rejectedAsExpected = false;
  try {
    await action();
  } catch (error) {
    rejectedAsExpected = expected(error);
  }
  await client.query("ROLLBACK").catch(() => undefined);
  process.stdout.write(`${name}=${rejectedAsExpected ? "PASS" : "FAIL"}\n`);
  return rejectedAsExpected;
}

async function main() {
  await client.connect();
  const migrationStatus = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 LIMIT 1`,
    ["20261103100000_ticket_mov_media"],
  );
  const migrationAlreadyApplied = Array.isArray(migrationStatus.rows) && migrationStatus.rows.length > 0;
  process.stdout.write(`MOV_MIGRATION_ALREADY_APPLIED=${migrationAlreadyApplied ? "true" : "false"}\n`);
  await seedMediaFixture();
  const repositorySqlChecks = await verifyRepositorySql();
  process.stdout.write(`REPOSITORY_SQL_CHECKS=${repositorySqlChecks.filter(Boolean).length}/${repositorySqlChecks.length}\n`);

  const checks = [];
  checks.push(await expectAccepted("MOV_12_MIB_30S_ACCEPTED", () => insertAttachment()));
  checks.push(await expectAccepted("MP4_12_MIB_30S_ACCEPTED", () => insertAttachment({ mimeType: "video/mp4" })));
  checks.push(await expectRejected(
    "MOV_OVER_12_MIB_REJECTED",
    (error) => error?.code === "23514" && error?.constraint === "ticket_attachments_allowed_media",
    () => insertAttachment({ sizeBytes: 12_582_913 }),
  ));
  checks.push(await expectRejected(
    "MOV_OVER_30S_REJECTED",
    (error) => error?.code === "23514" && error?.constraint === "ticket_attachments_allowed_media",
    () => insertAttachment({ durationSeconds: 31 }),
  ));
  checks.push(await expectRejected(
    "MOV_DURATION_REQUIRED",
    (error) => error?.code === "23514" && error?.constraint === "ticket_attachments_allowed_media",
    () => insertAttachment({ durationSeconds: null }),
  ));
  checks.push(await expectRejected(
    "UNSUPPORTED_VIDEO_MIME_REJECTED",
    (error) => error?.code === "23514" && error?.constraint === "ticket_attachments_allowed_media",
    () => insertAttachment({ mimeType: "video/x-msvideo" }),
  ));
  checks.push(await expectRejected(
    "MP4_AND_MOV_SHARE_ONE_VIDEO_BATCH_LIMIT",
    (error) => error?.code === "P0001" && String(error?.message).includes("TICKET_MEDIA_BATCH_VIDEO_LIMIT_EXCEEDED"),
    async () => {
      const batchId = randomUUID();
      await insertAttachment({ batchId, mimeType: "video/quicktime" });
      await insertAttachment({ batchId, mimeType: "video/mp4" });
    },
  ));
  checks.push(await expectAccepted("FOUR_PHOTOS_AND_ONE_MOV_BATCH_ACCEPTED", async () => {
    const batchId = randomUUID();
    for (let index = 0; index < 4; index += 1) {
      await insertAttachment({ batchId, mimeType: "image/jpeg", sizeBytes: 1, durationSeconds: null });
    }
    await insertAttachment({ batchId, mimeType: "video/quicktime" });
  }));
  checks.push(await expectRejected(
    "FIFTH_PHOTO_IN_BATCH_REJECTED",
    (error) => error?.code === "P0001" && String(error?.message).includes("TICKET_MEDIA_BATCH_PHOTO_LIMIT_EXCEEDED"),
    async () => {
      const batchId = randomUUID();
      for (let index = 0; index < 5; index += 1) {
        await insertAttachment({ batchId, mimeType: "image/jpeg", sizeBytes: 1, durationSeconds: null });
      }
    },
  ));

  const catalog = await client.query(
    `SELECT
       position('video/quicktime' in pg_get_constraintdef(constraint_row.oid)) > 0 AS "mimeConstraintAllowsMov",
       position('video/quicktime' in pg_get_functiondef('guard_ticket_attachment()'::regprocedure)) > 0 AS "batchTriggerCountsMov"
       FROM pg_constraint constraint_row
      WHERE constraint_row.conname = 'ticket_attachments_allowed_media'`,
  );
  const catalogRow = Array.isArray(catalog.rows) ? catalog.rows[0] : undefined;
  const catalogPassed = catalogRow?.mimeConstraintAllowsMov === true && catalogRow?.batchTriggerCountsMov === true;
  process.stdout.write(`MIGRATION_CATALOG=${catalogPassed ? "PASS" : "FAIL"}\n`);
  checks.push(catalogPassed);
  checks.push(...repositorySqlChecks);

  process.stdout.write(`MIGRATION_AND_REPOSITORY_CHECKS=${checks.filter(Boolean).length}/${checks.length}\n`);
  if (checks.some((passed) => !passed)) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
  const constraint = error && typeof error === "object" && "constraint" in error
    ? String(error.constraint)
    : "UNKNOWN";
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message).replace(/postgres(?:ql)?:\/\/[^\s'\"]+/g, "<connection-string-redacted>")
    : "Unknown error";
  process.stderr.write(`MIGRATION_PROBE=FAIL code=${code} constraint=${constraint} message=${message}\n`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
