import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActivityFeed,
  describeActivity,
  formatRelativeTime,
} from "../../src/components/activity/activity-feed.tsx";

const NOW = new Date("2026-11-18T10:00:00.000Z");

function item(overrides = {}) {
  return {
    id: "a1",
    source: "TICKET_STATUS",
    action: "STATUS_CHANGED",
    occurredAt: "2026-11-18T09:38:00.000Z",
    actor: { id: "u1", name: "Rini Marlina", role: "STAFF", type: "USER" },
    entity: { type: "TICKET", id: "t1" },
    statusChange: { fromStatus: "RECEIVED", toStatus: "ASSIGNED" },
    href: "/tiket/t1",
    ...overrides,
  };
}

function render(props) {
  return renderToStaticMarkup(React.createElement(ActivityFeed, { now: NOW, ...props }));
}

test("renders actor, summary, relative time, and deep link", () => {
  const html = render({ role: "OWNER", items: [item()] });
  assert.match(html, /Aktivitas Terkini/);
  assert.match(html, /Rini Marlina/);
  assert.match(html, /Tiket: Diterima ke Ditugaskan/);
  assert.match(html, /22 mnt/);
  assert.match(html, /href="\/tiket\/t1"/);
  assert.match(html, /role="region"/);
});

test("filter control exposes listbox semantics and default label", () => {
  const html = render({ role: "OWNER", items: [item()] });
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /title="Filter periode aktivitas"/);
  assert.match(html, /Hari ini/);
});

test("Staff does not see financial-only entities", () => {
  const html = render({
    role: "STAFF",
    items: [
      item({ id: "e1", entity: { type: "EXPENSE", id: "x" }, statusChange: null, action: "CREATED", href: null }),
      item({ id: "t2" }),
    ],
  });
  assert.doesNotMatch(html, /Pengeluaran/);
  assert.match(html, /Tiket: Diterima ke Ditugaskan/);
});

test("Tenant never receives feed rows", () => {
  const html = render({ role: "TENANT", items: [item()] });
  assert.doesNotMatch(html, /Rini Marlina/);
  assert.match(html, /Belum ada aktivitas/);
});

test("empty state and system actor", () => {
  const empty = render({ role: "OWNER", items: [], emptyText: "Kosong." });
  assert.match(empty, /Kosong\./);
  const system = render({
    role: "OWNER",
    items: [item({ actor: { id: null, name: null, role: null, type: "SYSTEM" }, href: null })],
  });
  assert.match(system, /Sistem/);
});

test("maxItems bounds the rendered list and view-all link renders", () => {
  const items = Array.from({ length: 8 }, (_, index) => item({ id: `i${index}`, href: null }));
  const html = render({ role: "OWNER", items, maxItems: 3, viewAllHref: "/aktivitas" });
  assert.equal((html.match(/<li>/g) ?? []).length, 3);
  assert.match(html, /href="\/aktivitas"/);
});

test("helpers format time and descriptions", () => {
  assert.equal(formatRelativeTime("2026-11-18T09:59:50.000Z", NOW), "Baru saja");
  assert.equal(formatRelativeTime("2026-11-18T07:00:00.000Z", NOW), "3 jam");
  assert.equal(formatRelativeTime("2026-11-16T10:00:00.000Z", NOW), "2 hari");
  assert.equal(
    describeActivity(item({ statusChange: null, action: "ROOM_UPDATED", entity: { type: "ROOM", id: "r" } })),
    "Kamar: Room updated",
  );
});

test("no emoji in markup", () => {
  const html = render({ role: "OWNER", items: [item()] });
  assert.equal(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u.test(html), false);
});
