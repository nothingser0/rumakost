import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RoomCard,
  resolveRoomBadge,
  formatRoomRent,
} from "../../src/components/rooms/room-card.tsx";

function render(props) {
  return renderToStaticMarkup(React.createElement(RoomCard, { roomNumber: "A-01", ...props }));
}

test("occupied room shows tenant, floor, rent, and paid badge", () => {
  const html = render({
    occupancy: "OCCUPIED",
    physicalStatus: "READY",
    billingState: "PAID",
    floorLabel: "Lantai 1",
    tenantName: "Siti Aminah",
    monthlyRent: 1200000,
  });
  assert.match(html, /Kamar A-01/);
  assert.match(html, /Terisi · Lunas/);
  assert.match(html, /Lantai 1 · Siti Aminah/);
  assert.match(html, /Rp 1\.200\.000/);
  assert.match(html, /\/bln/);
});

test("occupancy is never conflated with physical status", () => {
  const occupied = render({ occupancy: "OCCUPIED", physicalStatus: "READY" });
  assert.doesNotMatch(occupied, /Siap Huni/);
  assert.match(occupied, /data-occupancy="OCCUPIED"/);
  assert.match(occupied, /data-physical-status="READY"/);

  const vacantRepair = render({ occupancy: "VACANT", physicalStatus: "MAINTENANCE" });
  assert.doesNotMatch(vacantRepair, /Terisi/);
  assert.match(vacantRepair, /Perbaikan/);

  const vacantCleaning = render({ occupancy: "VACANT", physicalStatus: "CLEANING" });
  assert.match(vacantCleaning, /Kosong · Dibersihkan/);

  const vacantReady = render({ occupancy: "VACANT", physicalStatus: "READY" });
  assert.match(vacantReady, /Kosong · Siap Huni/);
});

test("resolveRoomBadge maps billing states for occupied rooms only", () => {
  assert.deepEqual(
    resolveRoomBadge({ occupancy: "OCCUPIED", physicalStatus: "READY", billingState: "DUE_SOON", dueInDays: 3 }),
    { label: "Terisi · H-3", variant: "warning" },
  );
  assert.deepEqual(
    resolveRoomBadge({ occupancy: "OCCUPIED", physicalStatus: "READY", billingState: "OVERDUE" }),
    { label: "Terisi · Menunggak", variant: "danger" },
  );
  assert.deepEqual(
    resolveRoomBadge({ occupancy: "VACANT", physicalStatus: "READY", billingState: "OVERDUE" }),
    { label: "Kosong · Siap Huni", variant: "brand" },
  );
});

test("vacant room hides tenant name and shows room type", () => {
  const html = render({
    occupancy: "VACANT",
    physicalStatus: "READY",
    floorLabel: "Lantai 1",
    roomType: "Standar",
    tenantName: "Tidak Boleh Muncul",
    monthlyRent: 1100000,
  });
  assert.doesNotMatch(html, /Tidak Boleh Muncul/);
  assert.match(html, /Lantai 1 · Standar/);
});

test("rent is omitted when not provided or null", () => {
  assert.doesNotMatch(render({ occupancy: "VACANT", physicalStatus: "READY" }), /Rp /);
  assert.doesNotMatch(render({ occupancy: "VACANT", physicalStatus: "READY", monthlyRent: null }), /Rp /);
  assert.equal(formatRoomRent(1100000), "Rp 1.100.000");
});

test("link variant renders href and aria-label", () => {
  const html = render({ occupancy: "VACANT", physicalStatus: "READY", href: "/kamar/abc" });
  assert.match(html, /href="\/kamar\/abc"/);
  assert.match(html, /aria-label="Kamar A-01, Kosong · Siap Huni"/);
});

test("selectable variant exposes button semantics and pressed state", () => {
  const html = render({
    occupancy: "VACANT",
    physicalStatus: "READY",
    selected: true,
    onSelect: () => {},
  });
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-pressed="true"/);
});

test("image renders only when provided, no emoji", () => {
  const without = render({ occupancy: "VACANT", physicalStatus: "READY" });
  assert.doesNotMatch(without, /<img/);
  const withImg = render({ occupancy: "VACANT", physicalStatus: "READY", imageSrc: "/kamar.jpg" });
  assert.match(withImg, /<img[^>]+src="\/kamar\.jpg"/);
  assert.equal(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u.test(without), false);
});
