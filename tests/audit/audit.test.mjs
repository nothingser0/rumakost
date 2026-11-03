import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

function auditCte(content, startAt) {
  const start = content.indexOf("  audit AS (", startAt);
  const end = content.indexOf("  response_data AS", start);
  assert.ok(start >= startAt && end > start);
  return content.slice(start, end);
}

const auditCoverage = [
  ["src/lib/rooms/repository.ts", ["ROOM_CREATED", "ROOM_UPDATED", "ROOM_ARCHIVED", "ROOM_RESTORED"]],
  ["src/lib/floors/repository.ts", ["FLOOR_CREATED", "FLOOR_UPDATED", "FLOOR_ARCHIVED", "FLOOR_RESTORED"]],
  ["src/lib/leases/repository.ts", ["LEASE_CREATED", "INITIAL_INVOICE_ISSUED"]],
  ["src/lib/leases/lifecycle-repository.ts", [
    "LEASE_END_REQUESTED",
    "LEASE_ENDED",
    "LEASE_END_REQUEST_APPROVED",
    "LEASE_END_REQUEST_REJECTED",
  ]],
  ["src/lib/invoices/repository.ts", ["INVOICE_VOIDED", "INVOICE_DELIVERED"]],
  ["src/lib/billing/invoice-generation-repository.ts", ["INVOICE_GENERATION_RUN"]],
  ["src/lib/payments/repository.ts", ["PAYMENT_RECORDED"]],
  ["src/lib/payments/ledger-repository.ts", ["PAYMENT_VERIFIED", "PAYMENT_REJECTED", "PAYMENT_REVERSED"]],
  ["src/lib/deposits/repository.ts", [
    "DEPOSIT_APPLIED_TO_RENT",
    "DEPOSIT_REFUND_REQUESTED",
    "DEPOSIT_WITHHELD_AT_CHECKOUT",
    "DEPOSIT_REFUND_PAID",
    "DEPOSIT_REFUND_REJECTED",
  ]],
  ["src/lib/expenses/repository.ts", ["EXPENSE_RECORDED", "EXPENSE_REVERSED"]],
  ["src/lib/reports/repository.ts", ["OPERATING_BUDGET_SET"]],
  ["src/lib/tickets/repository.ts", [
    "TICKET_DRAFT_CREATED",
    "TICKET_SUBMITTED",
    "TICKET_DRAFT_DISCARDED",
    "TICKET_UPDATED",
    "TICKET_ASSIGNED",
    "TICKET_CANCELLED",
    "TICKET_REOPENED",
    "TICKET_COMMENT_ADDED",
    "TICKET_DRAFT_EXPIRED",
    "TICKET_MEDIA_DELETE_QUEUED",
  ]],
  ["src/lib/media/repository.ts", [
    "TICKET_MEDIA_UPLOAD_INTENT_CREATED",
    "TICKET_MEDIA_PROJECT_QUOTA_EXCEEDED",
    "TICKET_MEDIA_FINALIZE_REQUESTED",
    "TICKET_MEDIA_FINALIZED",
    "TICKET_MEDIA_DOWNLOAD_URL_REQUESTED",
    "TICKET_MEDIA_DELETE_QUEUED",
    "TICKET_MEDIA_DELETED",
    "TICKET_MEDIA_UPLOAD_REJECTED",
  ]],
  ["src/lib/tenant-profile/repository.ts", ["TENANT_PROFILE_UPDATED"]],
  ["src/lib/users/managed-accounts.ts", [
    "APP_USER_ACCOUNT_CREATED",
    "APP_USER_ACTIVATED",
    "APP_USER_DEACTIVATED",
    "TICKET_ASSIGNMENT_TRANSFERRED",
  ]],
  ["src/lib/auth/email-change-operations.mjs", [
    "APP_USER_LOGIN_EMAIL_CHANGE_REQUESTED",
    "APP_USER_LOGIN_EMAIL_CHANGED",
  ]],
];

test("sensitive mutation paths have an explicit audit action", async () => {
  for (const [path, actions] of auditCoverage) {
    const content = await source(path);
    assert.match(content, /INSERT INTO audit_events|auditEvent\.create/iu, path);
    for (const action of actions) assert.ok(content.includes(action), `${path}: ${action}`);
  }
});

test("SQL audit inserts identify actor, action, entity, and occurrence time", async () => {
  const sqlPaths = auditCoverage
    .map(([path]) => path)
    .filter((path) => path.endsWith(".ts") && path !== "src/lib/users/managed-accounts.ts");

  for (const path of sqlPaths) {
    const content = await source(path);
    assert.match(content, /actor_id[\s\S]*?action[\s\S]*?entity_type[\s\S]*?entity_id[\s\S]*?occurred_at/iu, path);
  }

  const accountSource = await source("src/lib/users/managed-accounts.ts");
  assert.match(accountSource, /actorId:[\s\S]*?action:[\s\S]*?entityType:[\s\S]*?entityId:/u);
  assert.match(accountSource, /transaction\.auditEvent\.create(?:Many)?\(/u);
});

test("audit metadata omits direct identifiers, credentials, content, and storage keys", async () => {
  const sqlPaths = auditCoverage
    .map(([path]) => path)
    .filter((path) => path.endsWith(".ts") && path !== "src/lib/users/managed-accounts.ts");
  const forbiddenMetadataKeys = /['"](?:email|password|token|cookie|objectKey|object_key|signedUrl|signed_url|body|description|phone|userAgent|ipAddress)['"]\s*,/iu;

  for (const path of sqlPaths) {
    const content = await source(path);
    const inserts = [...content.matchAll(/INSERT INTO audit_events\s*\([\s\S]*?RETURNING id/giu)];
    assert.ok(inserts.length > 0, `${path}: audit insert not found`);
    for (const insert of inserts) assert.doesNotMatch(insert[0], forbiddenMetadataKeys, path);
  }

  const accountSource = await source("src/lib/users/managed-accounts.ts");
  const accountAudit = accountSource.split("await transaction.auditEvent.create")[1];
  assert.doesNotMatch(accountAudit, /safeMetadata:\s*\{[^}]*\b(?:email|password|token)\b/iu);

  const mediaSource = await source("src/lib/media/repository.ts");
  const intentAudit = mediaSource.slice(mediaSource.indexOf("intent_audit AS"), mediaSource.indexOf("quota_alert AS"));
  assert.ok(intentAudit.length > 0);
  assert.doesNotMatch(intentAudit, /object_key|objectKey|signedUrl/iu);
});

test("free-form reasons stay on domain records and audit stores fixed reason codes", async () => {
  const invoice = await source("src/lib/invoices/repository.ts");
  const ticket = await source("src/lib/tickets/repository.ts");
  const deposit = await source("src/lib/deposits/repository.ts");
  const expense = await source("src/lib/expenses/repository.ts");
  const lifecycle = await source("src/lib/leases/lifecycle-repository.ts");
  const reconcileStart = deposit.indexOf("const RECONCILE_CHECKOUT_DEPOSIT_SQL");
  const reconcileAudit = auditCte(deposit, reconcileStart);

  assert.match(invoice, /'INVOICE_VOIDED'[\s\S]{0,110}'OWNER_REQUESTED_VOID'/u);
  assert.match(ticket, /WHEN 'discardTicketDraft' THEN 'CREATOR_DISCARDED_DRAFT'[\s\S]*?WHEN 'cancelTicket' THEN 'USER_REQUESTED_CANCELLATION'/u);
  const ticketMutationStart = ticket.indexOf("const mutationSql =");
  const ticketAuditStart = ticket.indexOf("  audit AS (", ticketMutationStart);
  const ticketAuditEnd = ticket.indexOf("  response_data AS", ticketAuditStart);
  assert.ok(ticketAuditStart > ticketMutationStart && ticketAuditEnd > ticketAuditStart);
  assert.doesNotMatch(ticket.slice(ticketAuditStart, ticketAuditEnd), /->>'reason'/u);
  assert.match(deposit, /DEPOSIT_APPLIED_TO_RENT'[\s\S]{0,120}'OWNER_APPLIED_DEPOSIT_TO_RENT'/u);
  assert.match(deposit, /WHEN 'REFUNDED' THEN 'OWNER_REQUESTED_CHECKOUT_REFUND'/u);
  assert.doesNotMatch(reconcileAudit, /'reason',\s*inserted\.reason/u);
  assert.match(expense, /'EXPENSE_REVERSED'[\s\S]{0,120}'OWNER_RECORDED_EXPENSE_REVERSAL'/u);
  assert.doesNotMatch(expense, /CURRENT_TIMESTAMP,\s*inserted\.reason/u);
  assert.match(lifecycle, /'LEASE_END_REQUESTED'[\s\S]{0,120}'TENANT_REQUESTED_EARLY_END'/u);
});

test("replayed state changes do not create duplicate audit events", async () => {
  const budget = await source("src/lib/reports/repository.ts");
  const account = await source("src/lib/users/managed-accounts.ts");
  const emailChange = await source("src/lib/auth/email-change-operations.mjs");
  const rooms = await source("src/lib/rooms/repository.ts");
  const floors = await source("src/lib/floors/repository.ts");
  const leases = await source("src/lib/leases/repository.ts");
  const media = await source("src/lib/media/repository.ts");

  assert.match(budget, /WHERE operating_budgets\.amount IS DISTINCT FROM EXCLUDED\.amount/u);
  assert.match(account, /if \(target\.isActive === input\.isActive\) return \{ status: "unchanged" as const \}/u);
  assert.match(emailChange, /if \(!reuse\)[\s\S]*?APP_USER_LOGIN_EMAIL_CHANGE_REQUESTED/u);
  assert.match(emailChange, /value\.status === "completed"[\s\S]*?return \{ status: "already-completed" \}/u);
  assert.match(rooms, /prior\.monthly_rent IS DISTINCT FROM|IS DISTINCT FROM/u);
  assert.match(floors, /prior\.name IS DISTINCT FROM/u);
  assert.match(leases, /idempotency_keys[\s\S]*?LEASE_CREATED/u);
  assert.match(media, /saved AS \([\s\S]*?idempotency_keys[\s\S]*?intent_audit AS/u);
});

test("local audit rollback and provider retry regression cases remain covered", async () => {
  const accountTests = await source("tests/account-lifecycle/account-lifecycle.test.mjs");
  const emailTests = await source("tests/auth-email-change/email-change.test.mjs");
  const paymentTests = await source("tests/payment-ledger/payment-ledger.test.mjs");
  const mediaTests = await source("tests/ticket-media/ticket-media.test.mjs");

  assert.match(accountTests, /activation email failure is retryable without duplicate account or audit records/u);
  assert.match(accountTests, /ticket assignment and its audit history roll back together if audit persistence fails/u);
  assert.match(emailTests, /email delivery failure is retryable with the same token and a single request audit/u);
  assert.match(emailTests, /request and completion audit failures roll back pending state and identity writes/u);
  assert.match(paymentTests, /audit failure rolls back verification and leaves no allocations or idempotency record/u);
  assert.match(mediaTests, /cleanup honors draft and 365-day deadlines and retries failed object deletion/u);
});
