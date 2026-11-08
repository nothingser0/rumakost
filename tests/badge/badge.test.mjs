import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Badge,
  PaymentStatusBadge,
  RoomStatusBadge,
  TicketStatusBadge,
} from "../../src/components/ui/badge.tsx";

test("renders semantic badge with default props and role='status'", () => {
  const html = renderToStaticMarkup(
    React.createElement(Badge, null, "Aktif"),
  );
  assert.match(html, /^<span/);
  assert.match(html, /role="status"/);
  assert.match(html, /variant-neutral/);
  assert.match(html, /size-md/);
  assert.match(html, /shape-pill/);
  assert.match(html, />Aktif<\/span>/);
});

test("supports all CMP-03 semantic status variants", () => {
  const variants = [
    { name: "success", pattern: /variant-success/ },
    { name: "warning", pattern: /variant-warning/ },
    { name: "danger", pattern: /variant-danger/ },
    { name: "neutral", pattern: /variant-neutral/ },
    { name: "brand", pattern: /variant-brand/ },
    { name: "info", pattern: /variant-info/ },
    { name: "dark", pattern: /variant-dark/ },
  ];

  for (const { name, pattern } of variants) {
    const html = renderToStaticMarkup(
      React.createElement(Badge, { variant: name }, name),
    );
    assert.match(html, pattern, `Variant ${name} should apply expected class`);
  }
});

test("supports all badge size tiers (sm, md, lg)", () => {
  const sizes = [
    { size: "sm", pattern: /size-sm/ },
    { size: "md", pattern: /size-md/ },
    { size: "lg", pattern: /size-lg/ },
  ];

  for (const { size, pattern } of sizes) {
    const html = renderToStaticMarkup(
      React.createElement(Badge, { size }, "Tag"),
    );
    assert.match(html, pattern, `Size ${size} should apply expected class`);
  }
});

test("supports badge shapes (pill and rounded)", () => {
  const shapes = [
    { shape: "pill", pattern: /shape-pill/ },
    { shape: "rounded", pattern: /shape-rounded/ },
  ];

  for (const { shape, pattern } of shapes) {
    const html = renderToStaticMarkup(
      React.createElement(Badge, { shape }, "Tag"),
    );
    assert.match(html, pattern, `Shape ${shape} should apply expected class`);
  }
});

test("renders built-in semantic Lucide icons when showDefaultIcon is enabled", () => {
  const variants = ["success", "warning", "danger", "neutral", "brand", "info", "dark"];
  for (const variant of variants) {
    const html = renderToStaticMarkup(
      React.createElement(Badge, { variant, showDefaultIcon: true }, variant),
    );
    assert.match(html, /<svg [^>]*aria-hidden="true"/);
    assert.match(html, /iconSlot/);
  }
});

test("renders custom icon slot when provided", () => {
  const customIcon = React.createElement("span", { id: "custom-icon" }, "★");
  const html = renderToStaticMarkup(
    React.createElement(Badge, { icon: customIcon }, "Bintang"),
  );
  assert.match(html, /id="custom-icon"/);
  assert.match(html, />Bintang<\/span>/);
});

test("renders indicator dot and optional pulsing animation", () => {
  const staticDot = renderToStaticMarkup(
    React.createElement(Badge, { dot: true }, "Live"),
  );
  assert.match(staticDot, /dot/);
  assert.doesNotMatch(staticDot, /pulsingDot/);

  const pulsingDot = renderToStaticMarkup(
    React.createElement(Badge, { dot: true, pulsing: true }, "Urgent"),
  );
  assert.match(pulsingDot, /dot/);
  assert.match(pulsingDot, /pulsingDot/);
});

test("renders counter pill when count is supplied", () => {
  const html = renderToStaticMarkup(
    React.createElement(Badge, { count: 5 }, "Kamar Kosong"),
  );
  assert.match(html, /countPill/);
  assert.match(html, />5<\/span>/);
});

test("renders accessible clickable button role when onClick handler is attached", () => {
  const html = renderToStaticMarkup(
    React.createElement(Badge, { onClick: () => {} }, "Filter Lantai 1"),
  );
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /clickable/);
});

test("RoomStatusBadge maps domain statuses to correct semantics and copy", () => {
  const cases = [
    { status: "terisi", text: "Terisi · Lunas", variant: /variant-success/ },
    { status: "kosong", text: "Kosong · Siap Huni", variant: /variant-brand/ },
    { status: "pemeliharaan", text: "Perbaikan", variant: /variant-warning/ },
    { status: "menunggubayar", text: "Menunggak", variant: /variant-danger/ },
  ];

  for (const { status, text, variant } of cases) {
    const html = renderToStaticMarkup(
      React.createElement(RoomStatusBadge, { status }),
    );
    assert.match(html, new RegExp(text));
    assert.match(html, variant);
  }
});

test("PaymentStatusBadge maps invoice & payment states to correct semantics", () => {
  const cases = [
    { status: "LUNAS", text: "Lunas", variant: /variant-success/ },
    { status: "VERIFIED", text: "Lunas", variant: /variant-success/ },
    { status: "PENDING", text: "Menunggu Verifikasi", variant: /variant-warning/ },
    { status: "SEBAGIAN", text: "Sebagian", variant: /variant-info/ },
    { status: "JATUH_TEMPO", text: "Jatuh Tempo", variant: /variant-warning/ },
    { status: "TERLAMBAT", text: "Terlambat", variant: /variant-danger/ },
    { status: "DITOLAK", text: "Ditolak", variant: /variant-danger/ },
  ];

  for (const { status, text, variant } of cases) {
    const html = renderToStaticMarkup(
      React.createElement(PaymentStatusBadge, { status }),
    );
    assert.match(html, new RegExp(text));
    assert.match(html, variant);
  }
});

test("TicketStatusBadge maps repair maintenance stages to correct semantics", () => {
  const cases = [
    { status: "DRAFT", text: "Draft", variant: /variant-neutral/ },
    { status: "SUBMITTED", text: "Menunggu Respon", variant: /variant-warning/ },
    { status: "IN_PROGRESS", text: "Sedang Dikerjakan", variant: /variant-info/ },
    { status: "RESOLVED", text: "Selesai", variant: /variant-success/ },
    { status: "CANCELLED", text: "Dibatalkan", variant: /variant-danger/ },
  ];

  for (const { status, text, variant } of cases) {
    const html = renderToStaticMarkup(
      React.createElement(TicketStatusBadge, { status }),
    );
    assert.match(html, new RegExp(text));
    assert.match(html, variant);
  }
});

test("satisfies accessibility requirement: never relies on color alone", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Badge,
      { variant: "danger", showDefaultIcon: true },
      "Tagihan Terlambat",
    ),
  );
  assert.match(html, /Tagihan Terlambat/);
  assert.match(html, /<svg/);
  assert.match(html, /role="status"/);
});
