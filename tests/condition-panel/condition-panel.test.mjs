import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MaintenanceConditionPanel,
  ConditionPanel,
  mapTicketCountsToConditionItems,
} from "../../src/components/tickets/condition-panel.tsx";

test("MaintenanceConditionPanel renders default P0 reactive maintenance card", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      title: "Kondisi Properti",
    }),
  );

  assert.match(html, /Kondisi Properti/);
  assert.match(html, /Dalam Pengerjaan/);
  assert.match(html, /Menunggu Penugasan/);
  assert.match(html, /Laporan Baru Masuk/);
  assert.match(html, /Detail Tiket Kerusakan/);
  assert.match(html, /role="region"/);
  assert.match(html, /role="progressbar"/);
});

test("ConditionPanel alias works identically to MaintenanceConditionPanel", () => {
  const html = renderToStaticMarkup(
    React.createElement(ConditionPanel, {
      title: "Kondisi Kamar / Tiket",
    }),
  );

  assert.match(html, /Kondisi Kamar \/ Tiket/);
  assert.match(html, /Detail Tiket Kerusakan/);
});

test("mapTicketCountsToConditionItems maps domain ticket counts to items with calculated percentages", () => {
  const items = mapTicketCountsToConditionItems({
    openCount: 4,
    byStatus: {
      IN_PROGRESS: 2,
      ASSIGNED: 1,
      RECEIVED: 1,
    },
  });

  assert.equal(items.length, 3);
  assert.equal(items[0].label, "Dalam Pengerjaan");
  assert.equal(items[0].count, 2);
  assert.equal(items[0].percentage, 50);

  assert.equal(items[1].label, "Menunggu Penugasan");
  assert.equal(items[1].count, 1);
  assert.equal(items[1].percentage, 25);

  assert.equal(items[2].label, "Laporan Baru Masuk");
  assert.equal(items[2].count, 1);
  assert.equal(items[2].percentage, 25);
});

test("mapTicketCountsToConditionItems handles inspection status when present", () => {
  const items = mapTicketCountsToConditionItems({
    openCount: 5,
    byStatus: {
      IN_PROGRESS: 2,
      ASSIGNED: 1,
      RECEIVED: 1,
      INSPECTION: 1,
    },
  });

  assert.equal(items.length, 4);
  assert.equal(items[3].label, "Dalam Pemeriksaan");
  assert.equal(items[3].count, 1);
  assert.equal(items[3].percentage, 20);
});

test("renders accessible progress bars with ARIA attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      items: [
        { label: "Dalam Pengerjaan", count: 3, percentage: 60 },
        { label: "Menunggu Penugasan", count: 2, percentage: 40 },
      ],
    }),
  );

  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="5"/);
  assert.match(html, /aria-valuetext="Dalam Pengerjaan: 3 tiket aktif \(60%\)"/);
});

test("renders empty state when ticket counts are zero", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      ticketCounts: {
        openCount: 0,
        byStatus: {
          IN_PROGRESS: 0,
          ASSIGNED: 0,
          RECEIVED: 0,
        },
      },
      emptyText: "Semua kamar dan fasilitas dalam kondisi prima.",
    }),
  );

  assert.match(html, /Semua kamar dan fasilitas dalam kondisi prima\./);
  assert.doesNotMatch(html, /role="progressbar"/);
});

test("renders menu button with ARIA attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      showMenu: true,
    }),
  );

  assert.match(html, /aria-label="Opsi menu pemeliharaan"/);
  assert.match(html, /aria-haspopup="menu"/);
});

test("renders custom ctaText and ctaHref", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      ctaText: "Lihat Semua Tiket",
      ctaHref: "/admin/tickets",
    }),
  );

  assert.match(html, /Lihat Semua Tiket/);
  assert.match(html, /href="\/admin\/tickets"/);
});

test("anti-scope: strictly reactive maintenance, no preventive maintenance", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {}),
  );

  // Assert absence of preventive maintenance recurring schedules or inspection routines
  assert.doesNotMatch(html, /preventive/i);
  assert.doesNotMatch(html, /pencegahan rutin/i);
  assert.doesNotMatch(html, /jadwal servis berkala/i);
  assert.doesNotMatch(html, /checklist inspeksi berkala/i);
});

test("zero-emoji constraint: rendered markup contains no emoji characters", () => {
  const html = renderToStaticMarkup(
    React.createElement(MaintenanceConditionPanel, {
      title: "Kondisi Properti",
      ticketCounts: {
        openCount: 3,
        byStatus: {
          IN_PROGRESS: 2,
          ASSIGNED: 1,
          RECEIVED: 0,
        },
      },
    }),
  );

  // Unicode emoji ranges regex
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(html), false, "Markup must not contain any emojis");
});
