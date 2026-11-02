import assert from "node:assert/strict";
import test from "node:test";
import { calculateInitialInvoice } from "../../src/lib/billing/initial-invoice.mjs";

test("matches WF-05 prorata amount and inclusive billable days", () => {
  const result = calculateInitialInvoice({
    startsOn: "2026-10-15",
    rentAmount: "1200000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.deepEqual(result, {
    periodStart: "2026-10-15",
    periodEnd: "2026-10-31",
    dueOn: "2026-10-15",
    amountDue: "658000.00",
    lines: [
      {
        kind: "RENT",
        amount: "658000.00",
        description: "Sewa prorata",
      },
    ],
  });
});

test("matches WF-04 prorata check-in with separate rent and deposit lines", () => {
  const result = calculateInitialInvoice({
    startsOn: "2026-11-16",
    rentAmount: "1100000.00",
    depositAgreedAmount: "500000.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.equal(result.periodEnd, "2026-11-30");
  assert.equal(result.dueOn, "2026-11-16");
  assert.equal(result.amountDue, "1050000.00");
  assert.deepEqual(result.lines.map(({ kind, amount }) => ({ kind, amount })), [
    { kind: "RENT", amount: "550000.00" },
    { kind: "DEPOSIT", amount: "500000.00" },
  ]);
});

test("matches WF-04 full-month anniversary billing", () => {
  const result = calculateInitialInvoice({
    startsOn: "2026-11-16",
    rentAmount: "1100000.00",
    depositAgreedAmount: "500000.00",
    billingMode: "FULL_MONTH_ANNIVERSARY",
  });

  assert.equal(result.periodStart, "2026-11-16");
  assert.equal(result.periodEnd, "2026-12-15");
  assert.equal(result.dueOn, "2026-11-16");
  assert.equal(result.amountDue, "1600000.00");
  assert.deepEqual(result.lines.map(({ kind, amount }) => ({ kind, amount })), [
    { kind: "RENT", amount: "1100000.00" },
    { kind: "DEPOSIT", amount: "500000.00" },
  ]);
});

test("uses nearest-thousand rounding with positive midpoint rounded up", () => {
  const result = calculateInitialInvoice({
    startsOn: "2026-11-16",
    rentAmount: "1317000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.equal(result.lines[0].amount, "659000.00");
});

test("handles final days of common and leap February inclusively", () => {
  const commonYear = calculateInitialInvoice({
    startsOn: "2025-02-28",
    rentAmount: "2800000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });
  const leapYear = calculateInitialInvoice({
    startsOn: "2024-02-29",
    rentAmount: "2900000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.equal(commonYear.periodEnd, "2025-02-28");
  assert.equal(commonYear.lines[0].amount, "100000.00");
  assert.equal(leapYear.periodEnd, "2024-02-29");
  assert.equal(leapYear.lines[0].amount, "100000.00");
});

test("clamps a month-end anniversary to the shorter next month", () => {
  const result = calculateInitialInvoice({
    startsOn: "2025-01-31",
    rentAmount: "1000000.00",
    depositAgreedAmount: "0.00",
    billingMode: "FULL_MONTH_ANNIVERSARY",
  });

  assert.equal(result.periodEnd, "2025-02-27");
});

test("keeps prorata at the end of year 9999 within its valid calendar month", () => {
  const result = calculateInitialInvoice({
    startsOn: "9999-12-31",
    rentAmount: "31000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.equal(result.periodEnd, "9999-12-31");
  assert.equal(result.lines[0].amount, "1000.00");
});

test("uses the agreed deposit amount as provided and omits its line when it is zero", () => {
  const editedDeposit = calculateInitialInvoice({
    startsOn: "2026-11-16",
    rentAmount: "1100000.00",
    depositAgreedAmount: "125000.00",
    billingMode: "FULL_MONTH_ANNIVERSARY",
  });
  const zeroDeposit = calculateInitialInvoice({
    startsOn: "2026-11-16",
    rentAmount: "1100000.00",
    depositAgreedAmount: "0.00",
    billingMode: "FULL_MONTH_ANNIVERSARY",
  });

  assert.deepEqual(editedDeposit.lines.map(({ kind, amount }) => ({ kind, amount })), [
    { kind: "RENT", amount: "1100000.00" },
    { kind: "DEPOSIT", amount: "125000.00" },
  ]);
  assert.equal(zeroDeposit.amountDue, "1100000.00");
  assert.deepEqual(zeroDeposit.lines.map((line) => line.kind), ["RENT"]);
});

test("rejects a positive rent that rounds to a zero invoice line", () => {
  assert.throws(
    () => calculateInitialInvoice({
      startsOn: "2026-10-31",
      rentAmount: "100.00",
      depositAgreedAmount: "0.00",
      billingMode: "PRORATA_TO_MONTH_END",
    }),
    { code: "AMOUNT_INVALID" },
  );
});

test("rejects invalid dates, money, and billing modes", () => {
  const validInput = {
    startsOn: "2026-11-16",
    rentAmount: "1100000.00",
    depositAgreedAmount: "0.00",
    billingMode: "PRORATA_TO_MONTH_END",
  };

  assert.throws(() => calculateInitialInvoice({ ...validInput, startsOn: "2026-02-29" }));
  assert.throws(() => calculateInitialInvoice({ ...validInput, rentAmount: "0" }));
  assert.throws(() => calculateInitialInvoice({ ...validInput, billingMode: "CALENDAR" }));
});
