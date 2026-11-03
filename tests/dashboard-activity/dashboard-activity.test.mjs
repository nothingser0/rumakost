import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  getDashboardSnapshot,
  summarizeCollection,
  summarizeOccupancy,
  summarizeTickets,
} from "../../src/lib/dashboard/operations.mjs";
import { resolveDashboardPeriod } from "../../src/lib/dashboard/period.mjs";
import {
  activityHref,
  canViewActivityAction,
  getActivityPage,
} from "../../src/lib/activity/operations.mjs";

const ids = {
  owner: "10000000-0000-4000-8000-000000000001",
  staff: "10000000-0000-4000-8000-000000000002",
  tenant: "10000000-0000-4000-8000-000000000003",
  room: "20000000-0000-4000-8000-000000000001",
  ticket: "30000000-0000-4000-8000-000000000001",
  attachment: "30000000-0000-4000-8000-000000000002",
  lease: "40000000-0000-4000-8000-000000000001",
  request: "40000000-0000-4000-8000-000000000002",
  invoice: "50000000-0000-4000-8000-000000000001",
  statusEvent: "60000000-0000-4000-8000-000000000001",
  auditEvent: "60000000-0000-4000-8000-000000000002",
};

const owner = {
  id: ids.owner,
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = {
  id: ids.staff,
  role: "STAFF",
  isActive: true,
  mustChangePassword: false,
};

const reportingRooms = [
  { id: "room-1", archived: false, physicalStatus: "READY" },
  { id: "room-2", archived: false, physicalStatus: "MAINTENANCE" },
  { id: "room-3", archived: false, physicalStatus: "CLEANING" },
  { id: "room-4", archived: false, physicalStatus: "READY" },
  { id: "room-5", archived: true, physicalStatus: "READY" },
];

const reportingLeases = [
  { roomId: "room-1", status: "ACTIVE", startsOn: "2026-10-01", endsOn: null },
  { roomId: "room-2", status: "ENDED", startsOn: "2026-09-01", endsOn: "2026-11-03" },
  { roomId: "room-3", status: "CANCELLED", startsOn: "2026-10-01", endsOn: null },
  { roomId: "room-5", status: "ACTIVE", startsOn: "2026-10-01", endsOn: null },
];

const currentTicketStatuses = [
  "RECEIVED", "RECEIVED", "ASSIGNED", "IN_PROGRESS", "RESOLVED",
  "RESOLVED", "RESOLVED", "CANCELLED", "DRAFT",
];

const collectionInvoices = [
  { id: "invoice-1", issuedOn: "2026-11-01", status: "ISSUED", lines: [
    { id: "line-1", kind: "RENT", amountCents: 100000 },
    { id: "deposit-1", kind: "DEPOSIT", amountCents: 30000 },
  ] },
  { id: "invoice-2", issuedOn: "2026-11-02", status: "ISSUED", lines: [
    { id: "line-2", kind: "RENT", amountCents: 80000 },
  ] },
  { id: "invoice-void", issuedOn: "2026-11-02", status: "VOID", lines: [
    { id: "line-void", kind: "RENT", amountCents: 50000 },
  ] },
  { id: "invoice-old", issuedOn: "2026-10-31", status: "ISSUED", lines: [
    { id: "line-old", kind: "RENT", amountCents: 60000 },
  ] },
];

const collectionPayments = [
  { id: "payment-1", status: "VERIFIED" },
  { id: "payment-pending", status: "PENDING" },
  { id: "payment-rejected", status: "REJECTED" },
  { id: "payment-reversed", status: "VERIFIED" },
  { id: "payment-deposit", status: "VERIFIED" },
  { id: "payment-void", status: "VERIFIED" },
  { id: "payment-old", status: "VERIFIED" },
];

const collectionAllocations = [
  { paymentId: "payment-1", lineId: "line-1", amountCents: 70000 },
  { paymentId: "payment-pending", lineId: "line-1", amountCents: 20000 },
  { paymentId: "payment-rejected", lineId: "line-2", amountCents: 10000 },
  { paymentId: "payment-1", lineId: "line-2", amountCents: 40000 },
  { paymentId: "payment-reversed", lineId: "line-2", amountCents: 10000 },
  { paymentId: "payment-deposit", lineId: "deposit-1", amountCents: 30000 },
  { paymentId: "payment-void", lineId: "line-void", amountCents: 15000 },
  { paymentId: "payment-old", lineId: "line-old", amountCents: 60000 },
];

const reversedPayments = new Set(["payment-reversed"]);

function reportingOperationalFacts(asOfDate) {
  const rooms = reportingRooms.filter(({ archived }) => !archived);
  const occupiedRooms = rooms.filter((room) => reportingLeases.some((lease) =>
    lease.roomId === room.id &&
    ["ACTIVE", "ENDED"].includes(lease.status) &&
    lease.startsOn <= asOfDate &&
    (lease.endsOn === null || lease.endsOn >= asOfDate)
  )).length;
  const ticketStatusCounts = [...new Set(currentTicketStatuses)].map((status) => ({
    status,
    count: currentTicketStatuses.filter((ticketStatus) => ticketStatus === status).length,
  }));
  return {
    occupancy: { occupiedRooms, totalRooms: rooms.length },
    ticketStatusCounts,
  };
}

function reportingCollectionFacts(startDate, endDate) {
  const cohort = collectionInvoices.filter((invoice) =>
    invoice.issuedOn >= startDate && invoice.issuedOn <= endDate && invoice.status !== "VOID"
  );
  const cohortLines = cohort.flatMap((invoice) => invoice.lines.map((line) => ({
    ...line,
    invoiceId: invoice.id,
    invoiceStatus: invoice.status,
  })));
  const linesById = new Map(cohortLines.map((line) => [line.id, line]));
  const paymentsById = new Map(collectionPayments.map((payment) => [payment.id, payment]));
  const issuedRentCents = cohortLines
    .filter((line) => line.kind === "RENT")
    .reduce((sum, line) => sum + line.amountCents, 0);
  const collectedRentCents = collectionAllocations.reduce((sum, allocation) => {
    const line = linesById.get(allocation.lineId);
    const payment = paymentsById.get(allocation.paymentId);
    if (line?.kind !== "RENT" || line.invoiceStatus === "VOID") return sum;
    if (payment?.status !== "VERIFIED" || reversedPayments.has(payment.id)) return sum;
    return sum + allocation.amountCents;
  }, 0);
  const formatCents = (amount) => `${Math.floor(amount / 100)}.${String(amount % 100).padStart(2, "0")}`;
  return {
    issuedRentAmount: formatCents(issuedRentCents),
    collectedRentAmount: formatCents(collectedRentCents),
  };
}

const reportResult = {
  period: { startDate: "2026-11-01", endDate: "2026-11-03" },
  cashFlow: {
    verifiedRentIncome: "1200.00",
    reversedRentPayments: "100.00",
    grossExpenses: "350.00",
    expenseReversals: "50.00",
  },
  occupancy: { asOf: "2026-11-03", occupiedRooms: 2, totalRooms: 4 },
  budgets: [],
};

function activity(overrides = {}) {
  return {
    id: ids.auditEvent,
    source: "AUDIT",
    action: "TICKET_SUBMITTED",
    entityType: "TICKET",
    entityId: ids.ticket,
    parentEntityId: null,
    occurredAt: "2026-11-03T02:00:00.000000Z",
    actorId: ids.staff,
    actorName: "Staff Satu",
    actorRole: "STAFF",
    actorType: "USER",
    fromStatus: null,
    toStatus: null,
    ...overrides,
  };
}

test("dashboard facts summarize occupancy including maintenance capacity and current ticket statuses", () => {
  const facts = reportingOperationalFacts("2026-11-03");
  assert.deepEqual(facts.occupancy, { occupiedRooms: 2, totalRooms: 4 });
  assert.deepEqual(summarizeOccupancy(facts.occupancy), {
    occupiedRooms: 2,
    totalRooms: 4,
    percentage: 50,
  });
  assert.deepEqual(summarizeTickets(facts.ticketStatusCounts), {
    openCount: 5,
    byStatus: {
      DRAFT: 1,
      RECEIVED: 2,
      ASSIGNED: 1,
      IN_PROGRESS: 1,
      INSPECTION: 0,
      RESOLVED: 3,
      CANCELLED: 1,
    },
  });
  assert.equal(summarizeOccupancy({ occupiedRooms: 0, totalRooms: 0 }).percentage, null);
});

test("rent collection uses the selected invoice cohort and exact decimal arithmetic", () => {
  const collection = reportingCollectionFacts("2026-11-01", "2026-11-03");
  assert.deepEqual(collection, {
    issuedRentAmount: "1800.00",
    collectedRentAmount: "1100.00",
  });
  assert.deepEqual(summarizeCollection(collection), {
    issuedRentAmount: "1800.00",
    collectedRentAmount: "1100.00",
    percentage: 61.11,
  });
  assert.equal(summarizeCollection({
    issuedRentAmount: "0.00",
    collectedRentAmount: "0.00",
  }).percentage, null);
  assert.throws(() => summarizeCollection({
    issuedRentAmount: "1.001",
    collectedRentAmount: "0.00",
  }), (error) => error instanceof DomainError && error.code === "INTERNAL_ERROR");
});

test("Owner dashboard includes cash flow, collection, and an unset budget", async () => {
  let collectionPeriod;
  let reportPeriod;
  const snapshot = await getDashboardSnapshot({
    actor: owner,
    now: new Date("2026-11-03T02:00:00.000Z"),
    repository: {
      async getOperationalFacts(asOfDate) { return reportingOperationalFacts(asOfDate); },
      async getCollectionFacts(input) {
        collectionPeriod = input;
        return reportingCollectionFacts(input.startDate, input.endDate);
      },
    },
    reportsRepository: {
      async getFinancialReport(input) {
        reportPeriod = input;
        return reportResult;
      },
      async setOperatingBudget() { throw new Error("not used"); },
    },
  });

  assert.equal(snapshot.role, "OWNER");
  assert.equal(snapshot.occupancy.percentage, 50);
  assert.equal(snapshot.tickets.openCount, 5);
  assert.equal(snapshot.finance.collection.percentage, 61.11);
  assert.deepEqual(snapshot.finance.cashFlow, {
    ...reportResult.cashFlow,
    netRentIncome: "1100.00",
    netExpenses: "300.00",
    netOperatingCashFlow: "800.00",
  });
  assert.deepEqual(snapshot.finance.budget, {
    month: "2026-11",
    status: "NOT_SET",
    budgetAmount: null,
    actualAmount: "0.00",
    remainingAmount: null,
  });
  assert.deepEqual(collectionPeriod, { startDate: "2026-11-01", endDate: "2026-11-03" });
  assert.deepEqual(reportPeriod, collectionPeriod);
});

test("Staff dashboard never calls the finance repository or returns finance fields", async () => {
  let financeCalls = 0;
  const snapshot = await getDashboardSnapshot({
    actor: staff,
    repository: {
      async getOperationalFacts(asOfDate) { return reportingOperationalFacts(asOfDate); },
      async getCollectionFacts() { throw new Error("staff finance query"); },
    },
    reportsRepository: {
      async getFinancialReport() { financeCalls += 1; throw new Error("staff finance query"); },
      async setOperatingBudget() { throw new Error("not used"); },
    },
  });

  assert.deepEqual(Object.keys(snapshot).sort(), ["occupancy", "period", "role", "tickets"]);
  assert.equal(snapshot.role, "STAFF");
  assert.equal(financeCalls, 0);
  assert.equal("finance" in snapshot, false);
});

test("Tenant and inactive or forced-change actors cannot request an internal dashboard", async () => {
  const repository = {
    async getOperationalFacts() { throw new Error("must not query"); },
    async getCollectionFacts() { throw new Error("must not query"); },
  };
  await assert.rejects(
    getDashboardSnapshot({ actor: { ...owner, role: "TENANT" }, repository }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  await assert.rejects(
    getDashboardSnapshot({ actor: { ...staff, isActive: false }, repository }),
    (error) => error instanceof DomainError && error.code === "UNAUTHENTICATED",
  );
  await assert.rejects(
    getDashboardSnapshot({ actor: { ...staff, mustChangePassword: true }, repository }),
    (error) => error instanceof DomainError && error.code === "UNAUTHENTICATED",
  );
});

test("period uses Jakarta dates, closes historical months, and rejects future months", () => {
  const now = new Date("2026-11-03T17:30:00.000Z");
  assert.deepEqual(resolveDashboardPeriod({}, now), {
    month: "2026-11",
    startDate: "2026-11-01",
    endDate: "2026-11-04",
    asOfDate: "2026-11-04",
  });
  assert.deepEqual(resolveDashboardPeriod({ month: "2026-10" }, now), {
    month: "2026-10",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    asOfDate: "2026-10-31",
  });
  assert.throws(
    () => resolveDashboardPeriod({ month: "2026-12" }, now),
    (error) => error instanceof DomainError && error.code === "PERIOD_INVALID",
  );
});

test("activity feed filters Staff events, maps deep links, and returns a keyset cursor", async () => {
  const records = [
    activity({
      id: ids.auditEvent,
      entityType: "TICKET",
      entityId: ids.ticket,
      action: "TICKET_SUBMITTED",
    }),
    activity({
      id: ids.statusEvent,
      source: "TICKET_STATUS",
      action: "TICKET_STATUS_CHANGED",
      entityType: "TICKET",
      entityId: ids.ticket,
      occurredAt: "2026-11-02T02:00:00.000000Z",
      fromStatus: "RECEIVED",
      toStatus: "ASSIGNED",
    }),
  ];
  let query;
  const page = await getActivityPage({
    actor: staff,
    input: { month: "2026-11", limit: 1 },
    now: new Date("2026-11-03T02:00:00.000Z"),
    repository: {
      async listActivity(input) {
        query = input;
        return records;
      },
    },
  });

  assert.equal(query.actorRole, "STAFF");
  assert.equal(query.startDate, "2026-11-01");
  assert.equal(query.endDate, "2026-11-03");
  assert.equal(query.limit, 2);
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].href, `/tiket/${ids.ticket}`);
  assert.equal(page.items[0].actor.name, "Staff Satu");
  assert.deepEqual(page.nextCursor, {
    occurredAt: records[0].occurredAt,
    id: records[0].id,
  });
  assert.equal("reason" in page.items[0], false);
  assert.equal("metadata" in page.items[0], false);
});

test("activity empty state, role scope, and invalid ownership are enforced", async () => {
  const empty = await getActivityPage({
    actor: owner,
    repository: { async listActivity() { return []; } },
  });
  assert.deepEqual(empty.items, []);
  assert.equal(empty.nextCursor, null);
  assert.equal(canViewActivityAction("STAFF", activity({ entityType: "EXPENSE" })), false);
  assert.equal(canViewActivityAction("STAFF", activity({ entityType: "DEPOSIT_LEDGER_ENTRY" })), false);
  assert.equal(canViewActivityAction("STAFF", activity({ entityType: "TICKET_ATTACHMENT" })), true);
  await assert.rejects(
    getActivityPage({ actor: { ...owner, role: "TENANT" }, repository: { async listActivity() { throw new Error("must not query"); } } }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  await assert.rejects(
    getActivityPage({ actor: owner, input: { limit: 101 }, repository: { async listActivity() { throw new Error("must not query"); } } }),
    (error) => error instanceof DomainError && error.code === "VALIDATION_ERROR",
  );
});

test("activity deep links point to the owning domain pages", () => {
  assert.equal(activityHref({ entityType: "ROOM", entityId: ids.room, parentEntityId: null }), `/kamar/${ids.room}`);
  assert.equal(activityHref({ entityType: "LEASE", entityId: ids.lease, parentEntityId: null }), `/kontrak/${ids.lease}`);
  assert.equal(activityHref({ entityType: "LEASE_END_REQUEST", entityId: ids.request, parentEntityId: ids.lease }), `/kontrak/${ids.lease}`);
  assert.equal(activityHref({ entityType: "INVOICE", entityId: ids.invoice, parentEntityId: null }), `/tagihan/${ids.invoice}`);
  assert.equal(activityHref({ entityType: "TICKET_ATTACHMENT", entityId: ids.attachment, parentEntityId: ids.ticket }), `/tiket/${ids.ticket}`);
  assert.equal(activityHref({ entityType: "FUTURE_ENTITY", entityId: ids.room, parentEntityId: null }), null);
});

test("repository queries apply financial, role, time, deduplication, and privacy boundaries", () => {
  const dashboardRepository = readFileSync("src/lib/dashboard/repository.ts", "utf8");
  const activityRepository = readFileSync("src/lib/activity/repository.ts", "utf8");
  const dashboardAction = readFileSync("src/actions/dashboard.ts", "utf8");
  const activityAction = readFileSync("src/actions/activity.ts", "utf8");

  assert.match(dashboardRepository, /WHERE room\.archived_at IS NULL/);
  assert.match(dashboardRepository, /GROUP BY ticket\.status/);
  assert.match(dashboardRepository, /line\.kind = 'RENT'/);
  assert.match(dashboardRepository, /payment\.status = 'VERIFIED'::"PaymentStatus"/);
  assert.match(dashboardRepository, /NOT EXISTS \([\s\S]*FROM payment_reversals/);
  assert.match(dashboardRepository, /invoice\.status <> 'VOID'::"InvoiceStatus"/);
  assert.match(dashboardRepository, /AT TIME ZONE 'Asia\/Jakarta'/);
  assert.match(activityRepository, /OR event\.entity_type IN \([\s\S]*'TICKET_ATTACHMENT'[\s\S]*'LEASE_END_REQUEST'/);
  assert.match(activityRepository, /NOT EXISTS \([\s\S]*FROM audit_events audit[\s\S]*event\.actor_id[\s\S]*event\.occurred_at/);
  assert.match(activityRepository, /\(sort_time, id\) < \(\$4::timestamptz, \$5::uuid\)/);
  assert.match(activityRepository, /ORDER BY sort_time DESC, id DESC/);
  assert.doesNotMatch(activityRepository, /event\.reason|resolution_summary|AS "safeMetadata"/);
  assert.match(dashboardAction, /roles: \["OWNER", "STAFF"\]/);
  assert.match(dashboardAction, /access\.user\.role === "OWNER" \? createReportsRepository\(\) : undefined/);
  assert.match(activityAction, /roles: \["OWNER", "STAFF"\]/);
});
