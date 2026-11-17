import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MetricCard,
  OccupancyMetricCard,
  CollectionMetricCard,
  ExpenseBudgetMetricCard,
  StaffTicketsMetricCard,
  StaffCashDepositMetricCard,
  DashboardMetricsRow,
  formatCompactRupiah,
  formatFullRupiah,
} from "../../src/components/dashboard/metric-card.tsx";

test("formatCompactRupiah formats Indonesian numbers cleanly", () => {
  assert.equal(formatCompactRupiah(16500000), "Rp 16,50 Jt");
  assert.equal(formatCompactRupiah("4200000"), "Rp 4,20 Jt");
  assert.equal(formatCompactRupiah(800000), "Rp 800 rb");
  assert.equal(formatCompactRupiah(0), "Rp 0");
  assert.equal(formatCompactRupiah(null), "Rp 0");
  assert.equal(formatCompactRupiah(undefined), "Rp 0");
  assert.equal(formatCompactRupiah("invalid"), "Rp 0");
});

test("formatFullRupiah formats full currency correctly", () => {
  assert.match(formatFullRupiah(16500000), /Rp\s?16\.500\.000/);
  assert.equal(formatFullRupiah(0), "Rp 0");
});

test("MetricCard renders accessible link semantics when interactive", () => {
  const html = renderToStaticMarkup(
    React.createElement(MetricCard, {
      title: "Okupansi",
      subtitle: "Bulan ini",
      value: "11",
      icon: React.createElement("span", null, "Icon"),
      href: "/kamar",
    }),
  );

  assert.match(html, /role="link"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-label="Okupansi: 11"/);
  assert.match(html, /Okupansi/);
});

test("OccupancyMetricCard renders 11/15 rooms and gauge", () => {
  const html = renderToStaticMarkup(
    React.createElement(OccupancyMetricCard, {
      occupiedRooms: 11,
      totalRooms: 15,
      percentage: 73,
    }),
  );

  assert.match(html, /Okupansi Kamar/);
  assert.match(html, /11/);
  assert.match(html, /\/ 15 Kamar/);
  assert.match(html, /role="meter"/);
  assert.match(html, /aria-valuenow="73"/);
});

test("ExpenseBudgetMetricCard respects CR-2026-001 unset pagu without fixture default", () => {
  const unsetHtml = renderToStaticMarkup(
    React.createElement(ExpenseBudgetMetricCard, {
      role: "OWNER",
      budget: {
        month: "2026-10",
        status: "NOT_SET",
        budgetAmount: null,
        actualAmount: "4200000",
        remainingAmount: null,
      },
      onSetBudget: () => {},
    }),
  );

  assert.match(unsetHtml, /Pengeluaran/);
  assert.match(unsetHtml, /Pagu Belum Diatur/);
  assert.match(unsetHtml, /Atur Pagu/);
  assert.match(unsetHtml, /Rp 4,20 Jt/);
  // Strictly ensure no fallback dummy number like "5.000.000" or similar is printed
  assert.doesNotMatch(unsetHtml, /5\.000\.000/);
  assert.doesNotMatch(unsetHtml, /5 Jt/);

  // When budget is set, displays remaining and gauge correctly
  const setHtml = renderToStaticMarkup(
    React.createElement(ExpenseBudgetMetricCard, {
      role: "OWNER",
      budget: {
        month: "2026-10",
        status: "SET",
        budgetAmount: "5000000",
        actualAmount: "4200000",
        remainingAmount: "800000",
      },
    }),
  );

  assert.match(setHtml, /Sisa Rp 800 rb/);
  assert.match(setHtml, /aria-valuenow="84"/);
});

test("Financial cards are never rendered for STAFF role (Zero Confidential Leak)", () => {
  const staffExpense = renderToStaticMarkup(
    React.createElement(ExpenseBudgetMetricCard, {
      role: "STAFF",
      budget: {
        month: "2026-10",
        status: "SET",
        budgetAmount: "5000000",
        actualAmount: "4200000",
        remainingAmount: "800000",
      },
    }),
  );
  assert.equal(staffExpense, "");

  const staffCollection = renderToStaticMarkup(
    React.createElement(CollectionMetricCard, {
      role: "STAFF",
      collection: {
        issuedRentAmount: "20100000",
        collectedRentAmount: "16500000",
        percentage: 82,
      },
    }),
  );
  assert.equal(staffCollection, "");
});

test("Staff operational cards render tickets and cash deposit without financial leakage", () => {
  const ticketHtml = renderToStaticMarkup(
    React.createElement(StaffTicketsMetricCard, {
      tickets: { openCount: 3, urgentCount: 1 },
    }),
  );
  assert.match(ticketHtml, /Tiket Kerusakan/);
  assert.match(ticketHtml, /1 Mendesak/);
  assert.match(ticketHtml, /3/);
  assert.match(ticketHtml, /Tiket/);

  const depositHtml = renderToStaticMarkup(
    React.createElement(StaffCashDepositMetricCard, {
      pendingCount: 2,
      amount: 2800000,
    }),
  );
  assert.match(depositHtml, /Setoran Lapangan/);
  assert.match(depositHtml, /2 Pending/);
  assert.match(depositHtml, /Rp 2,80 Jt/);
});

test("DashboardMetricsRow renders corresponding cards per role", () => {
  const ownerSnapshot = {
    role: "OWNER",
    period: { month: "2026-10", startDate: "2026-10-01", endDate: "2026-10-31" },
    occupancy: { occupiedRooms: 11, totalRooms: 15, percentage: 73, asOfDate: "2026-10-15" },
    tickets: { openCount: 3, byStatus: { RECEIVED: 1, IN_PROGRESS: 2 } },
    finance: {
      collection: {
        issuedRentAmount: "20100000",
        collectedRentAmount: "16500000",
        percentage: 82,
      },
      cashFlow: {
        verifiedRentIncome: "16500000",
        reversedRentPayments: "0",
        netRentIncome: "16500000",
        grossExpenses: "4200000",
        expenseReversals: "0",
        netExpenses: "4200000",
        netOperatingCashFlow: "12300000",
      },
      budget: {
        month: "2026-10",
        status: "SET",
        budgetAmount: "5000000",
        actualAmount: "4200000",
        remainingAmount: "800000",
      },
    },
  };

  const ownerHtml = renderToStaticMarkup(
    React.createElement(DashboardMetricsRow, { snapshot: ownerSnapshot }),
  );

  assert.match(ownerHtml, /Okupansi Kamar/);
  assert.match(ownerHtml, /Tagihan Lunas/);
  assert.match(ownerHtml, /Pengeluaran/);
  assert.match(ownerHtml, /Rp 16,50 Jt/);
  assert.match(ownerHtml, /Rp 4,20 Jt/);

  const staffSnapshot = {
    role: "STAFF",
    period: { month: "2026-10", startDate: "2026-10-01", endDate: "2026-10-31" },
    occupancy: { occupiedRooms: 11, totalRooms: 15, percentage: 73, asOfDate: "2026-10-15" },
    tickets: { openCount: 3, byStatus: { RECEIVED: 1, IN_PROGRESS: 2 } },
  };

  const staffHtml = renderToStaticMarkup(
    React.createElement(DashboardMetricsRow, { snapshot: staffSnapshot }),
  );

  assert.match(staffHtml, /Okupansi Kamar/);
  assert.match(staffHtml, /Tiket Kerusakan/);
  assert.match(staffHtml, /Setoran Lapangan/);
  // Ensure staff receives NO tagihan lunas or pagu
  assert.doesNotMatch(staffHtml, /Tagihan Lunas/);
  assert.doesNotMatch(staffHtml, /Pagu/);
});

test("satisfies zero-emoji constraint across metric cards", () => {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  const html1 = renderToStaticMarkup(
    React.createElement(OccupancyMetricCard, { occupiedRooms: 11, totalRooms: 15 }),
  );
  const html2 = renderToStaticMarkup(
    React.createElement(ExpenseBudgetMetricCard, {
      role: "OWNER",
      budget: { month: "2026-10", status: "NOT_SET", budgetAmount: null, actualAmount: "0", remainingAmount: null },
    }),
  );
  const html3 = renderToStaticMarkup(
    React.createElement(StaffTicketsMetricCard, { tickets: { openCount: 3 } }),
  );

  assert.doesNotMatch(html1, emojiRegex);
  assert.doesNotMatch(html2, emojiRegex);
  assert.doesNotMatch(html3, emojiRegex);
});
