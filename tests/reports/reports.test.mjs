import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  recordExpense,
  reverseExpense,
} from "../../src/lib/expenses/operations.mjs";
import {
  getFinancialReport,
  setOperatingBudget,
} from "../../src/lib/reports/operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const EXPENSE_ID = "00000000-0000-4000-8000-000000000004";
const RECORD_KEY = "00000000-0000-4000-8000-000000000005";
const REVERSE_KEY = "00000000-0000-4000-8000-000000000006";

const owner = {
  id: OWNER_ID,
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };

const initialExpenses = [
  {
    id: EXPENSE_ID,
    category: "Perawatan",
    amount: "100.00",
    occurredOn: "2026-11-03",
    description: "Ganti lampu area umum",
    recordedById: STAFF_ID,
    createdAt: "2026-11-03T08:00:00.000000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    category: "Perawatan",
    amount: "50.00",
    occurredOn: "2026-11-04",
    description: "Catatan yang dikoreksi penuh",
    recordedById: STAFF_ID,
    createdAt: "2026-11-04T08:00:00.000000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    category: "Air",
    amount: "75.00",
    occurredOn: "2026-10-31",
    description: "Pembelian di luar periode",
    recordedById: OWNER_ID,
    createdAt: "2026-10-31T08:00:00.000000Z",
  },
];

const reportFixture = {
  payments: [
    {
      status: "VERIFIED",
      verifiedAt: "2026-11-05T10:00:00+07:00",
      allocations: [{ kind: "RENT", amount: "1000.00" }],
    },
    {
      status: "VERIFIED",
      verifiedAt: "2026-11-05T10:00:00+07:00",
      allocations: [{ kind: "DEPOSIT", amount: "300.00" }],
    },
    {
      status: "PENDING",
      verifiedAt: null,
      allocations: [{ kind: "RENT", amount: "500.00" }],
    },
    {
      status: "VERIFIED",
      verifiedAt: "2026-11-06T10:00:00+07:00",
      allocations: [{ kind: "RENT", amount: "50.00" }],
    },
    {
      status: "VERIFIED",
      verifiedAt: "2026-10-31T23:00:00+07:00",
      allocations: [{ kind: "RENT", amount: "70.00" }],
    },
  ],
  paymentReversals: [
    {
      createdAt: "2026-11-20T10:00:00+07:00",
      allocations: [
        { kind: "RENT", amount: "50.00" },
        { kind: "DEPOSIT", amount: "25.00" },
      ],
    },
  ],
  expenseReversals: [
    {
      expenseId: initialExpenses[1].id,
      amount: "50.00",
      createdAt: "2026-11-08T10:00:00+07:00",
    },
  ],
  rooms: [
    { id: "room-ready", archived: false, physicalStatus: "READY" },
    { id: "room-maintenance", archived: false, physicalStatus: "MAINTENANCE" },
    { id: "room-empty", archived: false, physicalStatus: "READY" },
    { id: "room-archived", archived: true, physicalStatus: "READY" },
  ],
  leases: [
    {
      roomId: "room-ready",
      status: "ACTIVE",
      startsOn: "2026-01-01",
      endsOn: null,
    },
    {
      roomId: "room-maintenance",
      status: "SCHEDULED",
      startsOn: "2026-12-01",
      endsOn: null,
    },
  ],
};

function cents(value) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function money(value) {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

function createMemoryRepository() {
  const expenses = new Map(initialExpenses.map((expense) => [expense.id, structuredClone(expense)]));
  const reversals = new Map(reportFixture.expenseReversals.map((reversal) => [
    reversal.expenseId,
    {
      id: "00000000-0000-4000-8000-000000000009",
      expenseId: reversal.expenseId,
      amount: reversal.amount,
      reason: "Nominal salah dicatat",
      createdById: OWNER_ID,
      createdAt: reversal.createdAt,
    },
  ]));
  const budgets = new Map([["2026-11", "500.00"]]);
  const idempotency = new Map();
  const auditEvents = [];

  return {
    expenses,
    reversals,
    budgets,
    idempotency,
    auditEvents,
    async recordExpense(input) {
      const prior = idempotency.get(input.idempotencyKey);
      if (prior) {
        if (prior.requestHash !== input.requestHash) throw new DomainError("CONFLICT");
        return structuredClone(prior.data);
      }
      const data = {
        id: `00000000-0000-4000-8000-${String(expenses.size + 10).padStart(12, "0")}`,
        category: input.category,
        amount: input.amount,
        occurredOn: input.occurredOn,
        description: input.description,
        recordedById: input.actorId,
        createdAt: "2026-11-02T08:00:00.000000Z",
      };
      expenses.set(data.id, data);
      auditEvents.push({ action: "EXPENSE_RECORDED", expenseId: data.id });
      idempotency.set(input.idempotencyKey, {
        requestHash: input.requestHash,
        data: structuredClone(data),
      });
      return data;
    },
    async reverseExpense(input) {
      const prior = idempotency.get(input.idempotencyKey);
      if (prior) {
        if (prior.requestHash !== input.requestHash) throw new DomainError("CONFLICT");
        return structuredClone(prior.data);
      }
      const expense = expenses.get(input.expenseId);
      if (!expense) throw new DomainError("EXPENSE_NOT_FOUND");
      if (reversals.has(expense.id)) throw new DomainError("ALREADY_REVERSED");
      const data = {
        id: "00000000-0000-4000-8000-000000000010",
        expenseId: expense.id,
        amount: expense.amount,
        reason: input.reason,
        createdById: input.actorId,
        createdAt: "2026-11-02T09:00:00.000000Z",
      };
      reversals.set(expense.id, data);
      auditEvents.push({ action: "EXPENSE_REVERSED", expenseId: expense.id });
      idempotency.set(input.idempotencyKey, {
        requestHash: input.requestHash,
        data: structuredClone(data),
      });
      return data;
    },
    async setOperatingBudget(input) {
      const data = {
        id: "00000000-0000-4000-8000-000000000011",
        month: input.month,
        amount: input.amount,
        updatedById: input.actorId,
        createdAt: "2026-11-02T09:00:00.000000Z",
        updatedAt: "2026-11-02T09:00:00.000000Z",
      };
      budgets.set(input.month, input.amount);
      auditEvents.push({ action: "OPERATING_BUDGET_SET", month: input.month });
      return data;
    },
    async getFinancialReport(input) {
      const withinRange = (date) => date >= input.startDate && date <= input.endDate;
      const verifiedRentIncome = reportFixture.payments
        .filter((payment) => payment.status === "VERIFIED" && withinRange(payment.verifiedAt.slice(0, 10)))
        .flatMap((payment) => payment.allocations)
        .filter((allocation) => allocation.kind === "RENT")
        .reduce((total, allocation) => total + cents(allocation.amount), 0n);
      const reversedRentPayments = reportFixture.paymentReversals
        .filter((reversal) => withinRange(reversal.createdAt.slice(0, 10)))
        .flatMap((reversal) => reversal.allocations)
        .filter((allocation) => allocation.kind === "RENT")
        .reduce((total, allocation) => total + cents(allocation.amount), 0n);
      const grossExpenses = [...expenses.values()]
        .filter((expense) => withinRange(expense.occurredOn))
        .reduce((total, expense) => total + cents(expense.amount), 0n);
      const expenseReversals = [...reversals.values()]
        .filter((reversal) => withinRange(reversal.createdAt.slice(0, 10)))
        .reduce((total, reversal) => total + cents(reversal.amount), 0n);

      const monthCursor = new Date(`${input.startDate.slice(0, 7)}-01T00:00:00.000Z`);
      const lastMonth = input.endDate.slice(0, 7);
      const monthlyBudgets = [];
      while (monthCursor.toISOString().slice(0, 7) <= lastMonth) {
        const month = monthCursor.toISOString().slice(0, 7);
        const budgetAmount = budgets.get(month) ?? null;
        const actual = [...expenses.values()]
          .filter((expense) => expense.occurredOn.startsWith(month) && !reversals.has(expense.id))
          .reduce((total, expense) => total + cents(expense.amount), 0n);
        monthlyBudgets.push({
          month,
          status: budgetAmount === null ? "NOT_SET" : "SET",
          budgetAmount,
          actualAmount: money(actual),
          remainingAmount: budgetAmount === null ? null : money(cents(budgetAmount) - actual),
        });
        monthCursor.setUTCMonth(monthCursor.getUTCMonth() + 1);
      }

      const activeRooms = reportFixture.rooms.filter((room) => !room.archived);
      const occupiedRooms = activeRooms.filter((room) => reportFixture.leases.some((lease) =>
        lease.roomId === room.id && lease.status === "ACTIVE" &&
        lease.startsOn <= input.endDate && (lease.endsOn === null || lease.endsOn >= input.endDate),
      )).length;

      return {
        period: { startDate: input.startDate, endDate: input.endDate },
        cashFlow: {
          verifiedRentIncome: money(verifiedRentIncome),
          reversedRentPayments: money(reversedRentPayments),
          grossExpenses: money(grossExpenses),
          expenseReversals: money(expenseReversals),
        },
        occupancy: {
          asOf: input.endDate,
          occupiedRooms,
          totalRooms: activeRooms.length,
        },
        budgets: monthlyBudgets,
      };
    },
  };
}

function actorValue(actor) {
  return {
    id: actor.id,
    role: actor.role,
    isActive: actor.isActive,
    mustChangePassword: actor.mustChangePassword,
  };
}

function recordInput(overrides = {}) {
  return {
    category: "Perawatan",
    amount: "35",
    date: "2026-11-02",
    description: "Ganti lampu lorong",
    idempotencyKey: RECORD_KEY,
    ...overrides,
  };
}

test("Owner and Staff can record Expense once with an idempotent retry", async () => {
  for (const actor of [owner, staff]) {
    const repository = createMemoryRepository();
    const input = recordInput({ idempotencyKey: actor.id === OWNER_ID ? RECORD_KEY : REVERSE_KEY });
    const first = await recordExpense({ actor: actorValue(actor), input, repository });
    const retry = await recordExpense({ actor: actorValue(actor), input, repository });

    assert.equal(first.recordedById, actor.id);
    assert.deepEqual(retry, first);
    assert.equal(repository.expenses.size, initialExpenses.length + 1);
    assert.equal(repository.auditEvents.filter((event) => event.action === "EXPENSE_RECORDED").length, 1);
  }
});

test("Expense input requires a positive amount, nonblank text, and a real date", async () => {
  const repository = createMemoryRepository();
  for (const amount of ["0", "-1.00", "abc", "10000000000.00"]) {
    await assert.rejects(
      recordExpense({ actor: actorValue(owner), input: recordInput({ amount }), repository }),
      (error) => error.code === "AMOUNT_INVALID",
    );
  }
  await assert.rejects(
    recordExpense({ actor: actorValue(owner), input: recordInput({ category: "   " }), repository }),
    (error) => error.code === "TEXT_REQUIRED",
  );
  await assert.rejects(
    recordExpense({ actor: actorValue(owner), input: recordInput({ date: "2026-02-30" }), repository }),
    (error) => error.code === "INVALID_DATES",
  );
});

test("Tenant cannot record Expense; Staff cannot reverse Expense", async () => {
  const repository = createMemoryRepository();
  await assert.rejects(
    recordExpense({ actor: actorValue(tenant), input: recordInput(), repository }),
    (error) => error.code === "FORBIDDEN",
  );
  await assert.rejects(
    reverseExpense({
      actor: actorValue(staff),
      input: { expenseId: EXPENSE_ID, reason: "Koreksi", idempotencyKey: REVERSE_KEY },
      repository,
    }),
    (error) => error.code === "NOT_OWNER",
  );
});

test("Owner reversal is full, append-only, reasoned, and idempotent", async () => {
  const repository = createMemoryRepository();
  const input = {
    expenseId: EXPENSE_ID,
    reason: "Nominal salah dicatat",
    idempotencyKey: REVERSE_KEY,
  };
  const first = await reverseExpense({ actor: actorValue(owner), input, repository });
  const retry = await reverseExpense({ actor: actorValue(owner), input, repository });

  assert.equal(first.amount, "100.00");
  assert.deepEqual(retry, first);
  assert.equal(repository.expenses.get(EXPENSE_ID).amount, "100.00");
  assert.equal(repository.reversals.size, 2);
  assert.equal(repository.auditEvents.filter((event) => event.action === "EXPENSE_REVERSED").length, 1);
  await assert.rejects(
    reverseExpense({
      actor: actorValue(owner),
      input: { ...input, idempotencyKey: "00000000-0000-4000-8000-000000000012" },
      repository,
    }),
    (error) => error.code === "ALREADY_REVERSED",
  );
  await assert.rejects(
    reverseExpense({ actor: actorValue(owner), input: { ...input, reason: "   " }, repository }),
    (error) => error.code === "REASON_REQUIRED",
  );
});

test("Owner can set one positive monthly budget and the operation audits each update", async () => {
  const repository = createMemoryRepository();
  const first = await setOperatingBudget({
    actor: actorValue(owner),
    input: { month: "2026-12", amount: "250" },
    repository,
  });
  const updated = await setOperatingBudget({
    actor: actorValue(owner),
    input: { month: "2026-12", amount: "300.00" },
    repository,
  });

  assert.equal(first.month, "2026-12");
  assert.equal(updated.amount, "300.00");
  assert.equal(repository.budgets.get("2026-12"), "300.00");
  assert.equal(repository.auditEvents.filter((event) => event.action === "OPERATING_BUDGET_SET").length, 2);
  await assert.rejects(
    setOperatingBudget({ actor: actorValue(staff), input: { month: "2026-12", amount: "300" }, repository }),
    (error) => error.code === "NOT_OWNER",
  );
  await assert.rejects(
    setOperatingBudget({ actor: actorValue(owner), input: { month: "2026-13", amount: "300" }, repository }),
    (error) => error.code === "PERIOD_INVALID",
  );
  await assert.rejects(
    setOperatingBudget({ actor: actorValue(owner), input: { month: "2026-12", amount: "0" }, repository }),
    (error) => error.code === "AMOUNT_INVALID",
  );
});

test("Owner report filters period, excludes deposit and pending money, and reconciles net cash", async () => {
  const repository = createMemoryRepository();
  const report = await getFinancialReport({
    actor: actorValue(owner),
    input: { startDate: "2026-11-01", endDate: "2026-11-30" },
    repository,
  });

  assert.deepEqual(report.period, { startDate: "2026-11-01", endDate: "2026-11-30" });
  assert.equal(report.cashFlow.verifiedRentIncome, "1050.00");
  assert.equal(report.cashFlow.reversedRentPayments, "50.00");
  assert.equal(report.cashFlow.netRentIncome, "1000.00");
  assert.equal(report.cashFlow.grossExpenses, "150.00");
  assert.equal(report.cashFlow.expenseReversals, "50.00");
  assert.equal(report.cashFlow.netExpenses, "100.00");
  assert.equal(report.cashFlow.netOperatingCashFlow, "900.00");
  assert.deepEqual(report.occupancy, {
    asOf: "2026-11-30",
    occupiedRooms: 1,
    totalRooms: 3,
    percentage: 33.33,
  });
  assert.deepEqual(report.budgets, [{
    month: "2026-11",
    status: "SET",
    budgetAmount: "500.00",
    actualAmount: "100.00",
    remainingAmount: "400.00",
  }]);
});

test("unconfigured monthly budget stays distinct from zero and reports empty actuals as zero", async () => {
  const repository = createMemoryRepository();
  const report = await getFinancialReport({
    actor: actorValue(owner),
    input: { startDate: "2026-12-01", endDate: "2026-12-31" },
    repository,
  });

  assert.deepEqual(report.budgets, [{
    month: "2026-12",
    status: "NOT_SET",
    budgetAmount: null,
    actualAmount: "0.00",
    remainingAmount: null,
  }]);
});

test("Staff and Tenant receive no financial report payload", async () => {
  const repository = createMemoryRepository();
  const input = { startDate: "2026-11-01", endDate: "2026-11-30" };
  for (const actor of [staff, tenant]) {
    await assert.rejects(
      getFinancialReport({ actor: actorValue(actor), input, repository }),
      (error) => error.code === "NOT_OWNER",
    );
  }
  await assert.rejects(
    getFinancialReport({
      actor: actorValue(owner),
      input: { startDate: "2026-12-01", endDate: "2026-11-30" },
      repository,
    }),
    (error) => error.code === "INVALID_DATES",
  );
});
