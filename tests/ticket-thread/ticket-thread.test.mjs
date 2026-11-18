import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  TicketThread,
  filterVisibleComments,
  getTicketStatusStep,
  getInitials,
} from "../../src/components/tickets/ticket-thread.tsx";

const sampleComments = [
  {
    id: "c1",
    authorId: "u-tenant",
    authorName: "Reza Pratama",
    authorRole: "TENANT",
    body: "Air AC menetes deras ke kasur sejak kemarin sore.",
    visibility: "TENANT_VISIBLE",
    createdAt: "2026-10-24T07:15:00.000Z",
  },
  {
    id: "c2",
    authorId: "u-staff",
    authorName: "Rini Setiawati",
    authorRole: "STAFF",
    body: "Laporan telah diverifikasi. Teknisi dijadwalkan tiba jam 10.00 WIB.",
    visibility: "TENANT_VISIBLE",
    createdAt: "2026-10-24T07:35:00.000Z",
  },
  {
    id: "c3",
    authorId: "u-staff",
    authorName: "Rini Setiawati",
    authorRole: "STAFF",
    body: "Catatan rahasia teknisi: pipa pembuangan tersumbat lumut tebal, butuh estimasi biaya khusus.",
    visibility: "INTERNAL",
    createdAt: "2026-10-24T07:40:00.000Z",
  },
];

const sampleEvents = [
  {
    id: "ev1",
    fromStatus: "RECEIVED",
    toStatus: "ASSIGNED",
    actorName: "Rini Setiawati",
    actorRole: "STAFF",
    occurredAt: "2026-10-24T07:30:00.000Z",
  },
];

test("filterVisibleComments strictly excludes INTERNAL comments for TENANT viewer", () => {
  const tenantComments = filterVisibleComments(sampleComments, "TENANT");
  assert.equal(tenantComments.length, 2);
  assert.equal(tenantComments.some((c) => c.visibility === "INTERNAL"), false);
  assert.equal(tenantComments.some((c) => c.body.includes("Catatan rahasia")), false);

  const staffComments = filterVisibleComments(sampleComments, "STAFF");
  assert.equal(staffComments.length, 3);
  assert.equal(staffComments.some((c) => c.visibility === "INTERNAL"), true);

  const ownerComments = filterVisibleComments(sampleComments, "OWNER");
  assert.equal(ownerComments.length, 3);
  assert.equal(ownerComments.some((c) => c.visibility === "INTERNAL"), true);
});

test("renders ticket thread for TENANT without internal comments and without internal checkbox", () => {
  const html = renderToStaticMarkup(
    React.createElement(TicketThread, {
      currentStatus: "IN_PROGRESS",
      viewerRole: "TENANT",
      comments: sampleComments,
      statusEvents: sampleEvents,
    }),
  );

  // Visible comments are rendered
  assert.match(html, /Air AC menetes deras/);
  assert.match(html, /Laporan telah diverifikasi/);

  // INTERNAL comment MUST NOT BE RENDERED for Tenant
  assert.doesNotMatch(html, /Catatan rahasia teknisi/);
  assert.doesNotMatch(html, /Internal Note/);

  // Tenant composer MUST NOT have "Jadikan Catatan Internal" option
  assert.doesNotMatch(html, /Jadikan Catatan Internal/);
  assert.match(html, /Tanggapan akan langsung terlihat oleh pengelola kost/);
});

test("renders ticket thread for STAFF / OWNER with internal notes and checkbox", () => {
  const html = renderToStaticMarkup(
    React.createElement(TicketThread, {
      currentStatus: "IN_PROGRESS",
      viewerRole: "STAFF",
      comments: sampleComments,
      statusEvents: sampleEvents,
    }),
  );

  // Internal comment IS rendered for Staff
  assert.match(html, /Catatan rahasia teknisi/);
  assert.match(html, /Internal Note/);

  // Staff composer HAS internal note checkbox
  assert.match(html, /Jadikan Catatan Internal \(Hanya Staf &amp; Pemilik\)/);
});

test("renders 5-step progress and status transition events", () => {
  const html = renderToStaticMarkup(
    React.createElement(TicketThread, {
      currentStatus: "IN_PROGRESS",
      viewerRole: "OWNER",
      comments: sampleComments,
      statusEvents: sampleEvents,
    }),
  );

  assert.match(html, /Progres Penanganan Tiket/);
  assert.match(html, /Dikerjakan/);
  assert.match(html, /Status: Ditugaskan/);
  assert.match(html, /Rini Setiawati/);
});

test("renders cancelled banner when ticket is CANCELLED", () => {
  const html = renderToStaticMarkup(
    React.createElement(TicketThread, {
      currentStatus: "CANCELLED",
      viewerRole: "TENANT",
      comments: [],
      cancellationReason: "Dibatalkan oleh penghuni karena kendala sudah teratasi mandiri.",
    }),
  );

  assert.match(html, /Tiket ini telah dibatalkan/);
  assert.match(html, /kendala sudah teratasi mandiri/);
  assert.match(html, /Tiket berstatus terminal/);
});

test("getTicketStatusStep maps 5 statuses to steps 1-5", () => {
  assert.equal(getTicketStatusStep("RECEIVED"), 1);
  assert.equal(getTicketStatusStep("ASSIGNED"), 2);
  assert.equal(getTicketStatusStep("IN_PROGRESS"), 3);
  assert.equal(getTicketStatusStep("INSPECTION"), 4);
  assert.equal(getTicketStatusStep("RESOLVED"), 5);
});

test("getInitials formats user initials correctly", () => {
  assert.equal(getInitials("Reza Pratama"), "RP");
  assert.equal(getInitials("Budi"), "BU");
  assert.equal(getInitials("Ahmad Dahlan Putra"), "AP");
});
