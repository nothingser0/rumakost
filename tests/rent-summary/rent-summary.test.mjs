import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RentSummaryBanner,
  formatRupiah,
  resolveStatusBadge,
} from "../../src/components/portal/rent-summary.tsx";

test("formatRupiah formats Indonesian currency correctly", () => {
  assert.equal(formatRupiah(0), "Rp 0");
  assert.equal(formatRupiah(1500000), "Rp 1.500.000");
  assert.equal(formatRupiah(750000), "Rp 750.000");
  assert.equal(formatRupiah(-500), "Rp 0");
});

test("resolveStatusBadge returns proper status labels and styles", () => {
  assert.equal(resolveStatusBadge("PAID").label, "Lunas");
  assert.equal(resolveStatusBadge("UNPAID").label, "Menunggu Pembayaran");
  assert.equal(resolveStatusBadge("PARTIAL").label, "Sebagian Terbayar");
  assert.equal(resolveStatusBadge("OVERDUE").label, "Menunggak");
  assert.equal(resolveStatusBadge("OVERDUE", 5).label, "Menunggak (H+5)");
});

test("renders unpaid rent summary banner with room number, due date, amount, and payment CTA", () => {
  const html = renderToStaticMarkup(
    React.createElement(RentSummaryBanner, {
      tenantName: "Budi Santoso",
      roomNumber: "Kamar A-04",
      roomType: "Deluxe AC",
      invoiceNumber: "INV-202611-A04",
      billingPeriodLabel: "November 2026",
      dueDateLabel: "10 November 2026",
      totalAmount: 1500000,
      status: "UNPAID",
      payHref: "/portal/tagihan",
    }),
  );

  assert.match(html, /Budi Santoso/);
  assert.match(html, /Kamar A-04/);
  assert.match(html, /Deluxe AC/);
  assert.match(html, /#INV-202611-A04/);
  assert.match(html, /November 2026/);
  assert.match(html, /10 November 2026/);
  assert.match(html, /Menunggu Pembayaran/);
  assert.match(html, /Rp 1\.500\.000/);
  assert.match(html, /Konfirmasi Pembayaran/);
  assert.match(html, /href="\/portal\/tagihan"/);

  // Out of scope check: no meteran, utilitas, or kuitansi
  assert.doesNotMatch(html, /meteran/i);
  assert.doesNotMatch(html, /kwh/i);
  assert.doesNotMatch(html, /kuitansi/i);
  assert.doesNotMatch(html, /kwitansi/i);
});

test("renders partial payment breakdown with remaining amount", () => {
  const html = renderToStaticMarkup(
    React.createElement(RentSummaryBanner, {
      tenantName: "Siti Aminah",
      roomNumber: "Kamar B-02",
      totalAmount: 1500000,
      paidAmount: 1000000,
      remainingAmount: 500000,
      dueDateLabel: "15 November 2026",
      status: "PARTIAL",
    }),
  );

  assert.match(html, /Sebagian Terbayar/);
  assert.match(html, /Sisa Tagihan Belum Dibayar/);
  assert.match(html, /Rp 500\.000/);
  assert.match(html, /Telah dibayar: Rp 1\.000\.000/);
  assert.match(html, /dari total Rp 1\.500\.000/);
  assert.match(html, /Konfirmasi Pembayaran/);
});

test("renders paid status with Lunas badge and details link", () => {
  const html = renderToStaticMarkup(
    React.createElement(RentSummaryBanner, {
      tenantName: "Ahmad Dahlan",
      roomNumber: "Kamar A-01",
      totalAmount: 1200000,
      status: "PAID",
      dueDateLabel: "1 November 2026",
    }),
  );

  assert.match(html, /Lunas/);
  assert.match(html, /Status Pembayaran/);
  assert.match(html, /Rp 1\.200\.000/);
  assert.match(html, /Rincian Tagihan/);
  assert.doesNotMatch(html, /Konfirmasi Pembayaran/);
});

test("renders overdue status with days overdue tag", () => {
  const html = renderToStaticMarkup(
    React.createElement(RentSummaryBanner, {
      tenantName: "Dodi Firmansyah",
      roomNumber: "Kamar B-05",
      totalAmount: 1500000,
      status: "OVERDUE",
      daysOverdue: 3,
      dueDateLabel: "10 November 2026",
    }),
  );

  assert.match(html, /Menunggak \(H\+3\)/);
  assert.match(html, /Rp 1\.500\.000/);
  assert.match(html, /Konfirmasi Pembayaran/);
});
