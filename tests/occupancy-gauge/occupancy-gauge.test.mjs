import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  OccupancyGauge,
  getGaugeRatio,
} from "../../src/components/ui/occupancy-gauge.tsx";

function render(props) {
  return renderToStaticMarkup(
    React.createElement(OccupancyGauge, { label: "Okupansi kamar", ...props }),
  );
}

test("exposes accessible meter semantics with value text", () => {
  const html = render({ value: 73 });
  assert.match(html, /role="meter"/);
  assert.match(html, /aria-label="Okupansi kamar"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.match(html, /aria-valuenow="73"/);
  assert.match(html, /aria-valuetext="73%"/);
  assert.match(html, />73%<\/span>/);
});

test("zero value renders track without a progress arc", () => {
  const html = render({ value: 0 });
  assert.match(html, /aria-valuenow="0"/);
  assert.match(html, /aria-valuetext="0%"/);
  assert.doesNotMatch(html, /stroke-dasharray/);
  assert.doesNotMatch(html, /class="[^"]*progress/);
});

test("full value renders a complete progress arc", () => {
  const html = render({ value: 100 });
  assert.match(html, /aria-valuenow="100"/);
  assert.match(html, /aria-valuetext="100%"/);
  assert.match(html, /stroke-dasharray="100 100"/);
});

test("clamps out-of-range and invalid values", () => {
  assert.equal(getGaugeRatio(150, 0, 100), 1);
  assert.equal(getGaugeRatio(-20, 0, 100), 0);
  assert.equal(getGaugeRatio(Number.NaN, 0, 100), 0);
  assert.equal(getGaugeRatio(5, 10, 10), 0);
  assert.equal(getGaugeRatio(50, 0, 200), 0.25);

  const over = render({ value: 150 });
  assert.match(over, /aria-valuenow="100"/);
  assert.match(over, /stroke-dasharray="100 100"/);

  const under = render({ value: -5 });
  assert.match(under, /aria-valuenow="0"/);
  assert.doesNotMatch(under, /stroke-dasharray/);
});

test("supports custom range, value text, and caption", () => {
  const html = render({
    value: 11,
    min: 0,
    max: 15,
    valueText: "11 dari 15 kamar",
    caption: "Terisi",
  });
  assert.match(html, /aria-valuemax="15"/);
  assert.match(html, /aria-valuetext="11 dari 15 kamar"/);
  assert.match(html, /stroke-dasharray="73\.333 100"/);
  assert.match(html, />Terisi<\/span>/);
});

test("supports tone and size variants and hides decorative svg", () => {
  const html = render({ value: 40, tone: "danger", size: "lg" });
  assert.match(html, /tone-danger/);
  assert.match(html, /size-lg/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.match(html, /<svg[^>]*focusable="false"/);

  const xs = render({ value: 73, size: "xs" });
  assert.match(xs, /size-xs/);
});

test("renders clean by default without radial tick marks, supports optional showTicks", () => {
  const clean = render({ value: 50 });
  assert.equal((clean.match(/<line /g) ?? []).length, 0);

  const withTicks = render({ value: 50, showTicks: true });
  assert.equal((withTicks.match(/<line /g) ?? []).length, 21);

  const custom = render({ value: 50, showTicks: true, tickCount: 11 });
  assert.equal((custom.match(/<line /g) ?? []).length, 11);
});

test("satisfies zero-emoji constraint", () => {
  const html = render({ value: 73, caption: "Terisi" });
  assert.doesNotMatch(html, /\p{Extended_Pictographic}/u);
});
