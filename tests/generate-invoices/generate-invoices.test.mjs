import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  calculateRecurringInvoice,
  getJakartaLocalDate,
  runInvoiceGeneration,
} from "../../src/lib/billing/generate-invoices.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const LEASE_ID = "00000000-0000-4000-8000-000000000003";
const SECOND_LEASE_ID = "00000000-0000-4000-8000-000000000004";

function lease(overrides = {}) {
  return {
    id: LEASE_ID,
    startsOn: "2026-10-15",
    endsOn: null,
    rentAmount: "1200000.00",
    billingMode: "PRORATA_TO_MONTH_END",
    status: "ACTIVE",
    ...overrides,
  };
}

function createMemoryRepository(leases = []) {
  const invoices = new Map();
  const auditEvents = [];
  let queue = Promise.resolve();

  return {
    invoices,
    auditEvents,
    async findEligibleLeases(localDate) {
      return structuredClone(leases.filter((row) =>
        ["ACTIVE", "SCHEDULED"].includes(row.status) &&
        row.startsOn < localDate &&
        (row.endsOn === null || row.endsOn >= localDate),
      ));
    },
    async createRecurringInvoices(input) {
      const previous = queue;
      let release;
      queue = new Promise((resolve) => {
        release = resolve;
      });
      await previous;

      try {
        let createdCount = 0;
        let duplicateCount = 0;
        for (const candidate of input.candidates) {
          const key = [
            candidate.leaseId,
            candidate.periodStart,
            candidate.periodEnd,
            candidate.kind,
          ].join("|");
          if (invoices.has(key)) {
            duplicateCount += 1;
            continue;
          }
          invoices.set(key, {
            ...structuredClone(candidate),
            status: "ISSUED",
            line: {
              kind: "RENT",
              amount: leases.find((row) => row.id === candidate.leaseId).rentAmount,
              description: "Sewa rutin",
            },
          });
          createdCount += 1;
        }

        auditEvents.push({
          source: input.source,
          actorId: input.actorId,
          localDate: input.localDate,
          createdCount,
          duplicateCount,
        });

        return {
          eligibleCount: input.candidates.length,
          createdCount,
          duplicateCount,
          skippedCount: 0,
        };
      } finally {
        release();
      }
    },
  };
}

test("creates calendar-mode recurring periods only on the first day of a later month", () => {
  const generated = calculateRecurringInvoice({
    lease: lease(),
    localDate: "2026-11-01",
  });
  const notDue = calculateRecurringInvoice({
    lease: lease(),
    localDate: "2026-11-02",
  });

  assert.deepEqual(generated, {
    leaseId: LEASE_ID,
    periodStart: "2026-11-01",
    periodEnd: "2026-11-30",
    dueOn: "2026-11-01",
    kind: "RECURRING",
  });
  assert.equal(notDue, null);
});

test("uses the start-day anniversary and clamps each short month from the original start day", () => {
  const february = calculateRecurringInvoice({
    lease: lease({
      startsOn: "2025-01-31",
      billingMode: "FULL_MONTH_ANNIVERSARY",
    }),
    localDate: "2025-02-28",
  });
  const march = calculateRecurringInvoice({
    lease: lease({
      startsOn: "2025-01-31",
      billingMode: "FULL_MONTH_ANNIVERSARY",
    }),
    localDate: "2025-03-31",
  });

  assert.equal(february?.periodStart, "2025-02-28");
  assert.equal(february?.periodEnd, "2025-03-30");
  assert.equal(march?.periodStart, "2025-03-31");
  assert.equal(march?.periodEnd, "2025-04-29");
  assert.equal(calculateRecurringInvoice({
    lease: lease({
      startsOn: "2025-01-31",
      billingMode: "FULL_MONTH_ANNIVERSARY",
    }),
    localDate: "2025-03-28",
  }), null);
});

test("does not create a recurring invoice on the initial lease date or outside lease eligibility", () => {
  const cases = [
    lease({ startsOn: "2026-11-01" }),
    lease({ startsOn: "2026-10-15", endsOn: "2026-10-31" }),
    lease({ startsOn: "2026-10-15", status: "ENDED" }),
    lease({ startsOn: "2026-10-15", status: "CANCELLED" }),
    lease({ startsOn: "2026-10-15", billingMode: "FULL_MONTH_ANNIVERSARY" }),
  ];

  for (const item of cases) {
    assert.equal(calculateRecurringInvoice({
      lease: item,
      localDate: "2026-11-01",
    }), null);
  }
});

test("allows a scheduled Lease after its start date and keeps the end date inclusive", () => {
  const generated = calculateRecurringInvoice({
    lease: lease({
      startsOn: "2026-10-15",
      endsOn: "2026-11-01",
      status: "SCHEDULED",
    }),
    localDate: "2026-11-01",
  });

  assert.equal(generated?.dueOn, "2026-11-01");
});

test("derives local generation dates on the Asia/Jakarta midnight boundary", () => {
  assert.equal(getJakartaLocalDate(new Date("2026-11-01T16:59:59.000Z")), "2026-11-01");
  assert.equal(getJakartaLocalDate(new Date("2026-11-01T17:00:00.000Z")), "2026-11-02");
  assert.throws(() => getJakartaLocalDate(new Date("invalid")), {
    code: "INVALID_DATES",
  });
});

test("generates one invoice under concurrent retries and audits both sources", async () => {
  const repository = createMemoryRepository([
    lease(),
    lease({ id: SECOND_LEASE_ID, billingMode: "FULL_MONTH_ANNIVERSARY" }),
  ]);
  const schedulerInput = {
    localDate: "2026-11-01",
    source: "SCHEDULER",
    repository,
  };
  const [first, second] = await Promise.all([
    runInvoiceGeneration(schedulerInput),
    runInvoiceGeneration(schedulerInput),
  ]);

  assert.equal(repository.invoices.size, 1);
  assert.deepEqual(
    [first.createdCount + second.createdCount, first.duplicateCount + second.duplicateCount],
    [1, 1],
  );
  assert.equal(repository.auditEvents.length, 2);
  assert.deepEqual(repository.auditEvents.map(({ source, actorId }) => ({ source, actorId })), [
    { source: "SCHEDULER", actorId: null },
    { source: "SCHEDULER", actorId: null },
  ]);

  const rerun = await runInvoiceGeneration({
    localDate: "2026-11-01",
    source: "OWNER_RERUN",
    actor: {
      id: OWNER_ID,
      role: "OWNER",
      isActive: true,
      mustChangePassword: false,
    },
    repository,
  });
  assert.equal(rerun.createdCount, 0);
  assert.equal(rerun.duplicateCount, 1);
  assert.deepEqual(repository.auditEvents.at(-1), {
    source: "OWNER_RERUN",
    actorId: OWNER_ID,
    localDate: "2026-11-01",
    createdCount: 0,
    duplicateCount: 1,
  });
});

test("rejects unauthorized reruns and a user actor on scheduler runs", async () => {
  const repository = createMemoryRepository([lease()]);
  const staff = {
    id: STAFF_ID,
    role: "STAFF",
    isActive: true,
    mustChangePassword: false,
  };

  await assert.rejects(
    runInvoiceGeneration({
      localDate: "2026-11-01",
      source: "OWNER_RERUN",
      actor: staff,
      repository,
    }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  await assert.rejects(
    runInvoiceGeneration({
      localDate: "2026-11-01",
      source: "SCHEDULER",
      actor: staff,
      repository,
    }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  assert.equal(repository.auditEvents.length, 0);
});

test("records an audited zero-invoice run when no Lease is eligible", async () => {
  const repository = createMemoryRepository([
    lease({ startsOn: "2026-11-01" }),
  ]);
  const result = await runInvoiceGeneration({
    localDate: "2026-11-01",
    source: "SCHEDULER",
    repository,
  });

  assert.deepEqual(result, {
    localDate: "2026-11-01",
    eligibleCount: 0,
    createdCount: 0,
    duplicateCount: 0,
    skippedCount: 0,
  });
  assert.equal(repository.auditEvents.length, 1);
});

test("rejects invalid billing dates and amounts from persisted Lease records", () => {
  assert.throws(() => calculateRecurringInvoice({
    lease: lease({ rentAmount: "0.00" }),
    localDate: "2026-11-01",
  }));
  assert.throws(() => calculateRecurringInvoice({
    lease: lease(),
    localDate: "2026-02-30",
  }));
});
