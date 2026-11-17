import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CashflowChart,
  DEFAULT_CASHFLOW_DATA,
  DEFAULT_YEAR_OPTIONS,
  formatCompactRupiah,
  formatAxisLabel,
  formatFullRupiah,
  calculateChartScale,
} from "../../src/components/dashboard/cashflow-chart.tsx";

test("formatCompactRupiah formats Indonesian numbers accurately", () => {
  assert.equal(formatCompactRupiah(16_500_000), "Rp 16,50 Jt");
  assert.equal(formatCompactRupiah(4_200_000), "Rp 4,20 Jt");
  assert.equal(formatCompactRupiah(800_000), "Rp 800 rb");
  assert.equal(formatCompactRupiah(0), "Rp 0");
  assert.equal(formatCompactRupiah(null), "Rp 0");
  assert.equal(formatCompactRupiah(undefined), "Rp 0");
  assert.equal(formatCompactRupiah("13500000"), "Rp 13,50 Jt");
  assert.equal(formatCompactRupiah(-2_500_000), "-Rp 2,50 Jt");
});

test("formatAxisLabel formats Y-axis intervals cleanly", () => {
  assert.equal(formatAxisLabel(20_000_000), "20 Jt");
  assert.equal(formatAxisLabel(16_000_000), "16 Jt");
  assert.equal(formatAxisLabel(12_500_000), "12,5 Jt");
  assert.equal(formatAxisLabel(500_000), "500 rb");
  assert.equal(formatAxisLabel(0), "0");
});

test("calculateChartScale computes round stepMax and 6 tick lines", () => {
  const scale = calculateChartScale(DEFAULT_CASHFLOW_DATA);
  assert.ok(scale.stepMax >= 18_400_000);
  assert.equal(scale.ticks.length, 6);
  assert.equal(scale.ticks[0].topPercent, 0);
  assert.equal(scale.ticks[5].topPercent, 100);
  assert.equal(scale.ticks[5].value, 0);

  // When targetIncome is provided and higher
  const targetScale = calculateChartScale(DEFAULT_CASHFLOW_DATA, 25_000_000);
  assert.ok(targetScale.stepMax >= 25_000_000);
});

test("CashflowChart renders complete default widget with 6 month columns", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      title: "Arus Kas & Operasional",
      reportHref: "/laporan",
    })
  );

  // Card & Header
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Arus Kas &amp; Operasional \(Tahun 2026 \(Berjalan\)\)"/);
  assert.match(html, /Arus Kas &amp; Operasional/);
  assert.match(html, /Pemasukan/);
  assert.match(html, /Pengeluaran/);
  assert.match(html, /href="\/laporan"/);

  // Filter Trigger
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /Tahun 2026/);

  // 6 Month Labels in sequence
  assert.match(html, /Mei/);
  assert.match(html, /Jun/);
  assert.match(html, /Jul/);
  assert.match(html, /Agu/);
  assert.match(html, /Sep/);
  assert.match(html, /Okt/);

  // Okt active month styling
  assert.match(html, /isOrangeActive/);
  assert.match(html, /isDarkActive/);
  assert.match(html, /barXTxtActive/);
});

test("CashflowChart provides accessible sr-only table for screen readers", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      data: DEFAULT_CASHFLOW_DATA,
    })
  );

  assert.match(html, /<table/);
  assert.match(html, /<caption/);
  assert.match(html, /<th scope="col">Bulan<\/th>/);
  assert.match(html, /<th scope="col">Pemasukan<\/th>/);
  assert.match(html, /<th scope="col">Pengeluaran<\/th>/);
  assert.match(html, /<th scope="col">Surplus Bersih<\/th>/);
  assert.match(html, /Rp\s?16\.500\.000/);
  assert.match(html, /Rp\s?4\.200\.000/);
});

test("CashflowChart renders target income line when provided", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      data: DEFAULT_CASHFLOW_DATA,
      targetIncome: 18_000_000,
      targetLabel: "Pagu Target",
    })
  );

  assert.match(html, /chartTargetLine/);
  assert.match(html, /Pagu Target:\s*Rp\s*18(,00)?\s*Jt/);
});

test("CashflowChart renders empty state when data is empty", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      data: [],
      emptyTitle: "Data Tidak Ditemukan",
      emptyDescription: "Tidak ada riwayat pembukuan kas.",
    })
  );

  assert.match(html, /emptyStateContainer/);
  assert.match(html, /Data Tidak Ditemukan/);
  assert.match(html, /Tidak ada riwayat pembukuan kas\./);
  assert.doesNotMatch(html, /chartBarsTrack/);
});

test("CashflowChart renders error state and retry action", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      error: "Gagal terhubung ke server akuntansi.",
      onRetry: () => {},
    })
  );

  assert.match(html, /errorStateContainer/);
  assert.match(html, /role="alert"/);
  assert.match(html, /Gagal Memuat Arus Kas/);
  assert.match(html, /Gagal terhubung ke server akuntansi\./);
  assert.match(html, /Coba Lagi/);
});

test("CashflowChart renders skeleton loading state", () => {
  const html = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      isLoading: true,
    })
  );

  assert.match(html, /skeletonViewport/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Memuat grafik arus kas\.\.\./);
});

test("CashflowChart supports both green and orange surplus tones", () => {
  const greenHtml = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      surplusTone: "green",
    })
  );
  assert.match(greenHtml, /var\(--color-success-text,\s*#16a34a\)/);

  const orangeHtml = renderToStaticMarkup(
    React.createElement(CashflowChart, {
      surplusTone: "orange",
    })
  );
  assert.match(orangeHtml, /var\(--color-primary-dark,\s*#c25e00\)/);
});

test("CashflowChart strictly satisfies zero-emoji constraint across all states", () => {
  const normalHtml = renderToStaticMarkup(React.createElement(CashflowChart));
  const emptyHtml = renderToStaticMarkup(React.createElement(CashflowChart, { data: [] }));
  const errorHtml = renderToStaticMarkup(React.createElement(CashflowChart, { error: "Error" }));
  const loadingHtml = renderToStaticMarkup(React.createElement(CashflowChart, { isLoading: true }));

  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  assert.equal(emojiRegex.test(normalHtml), false, "normalHtml must not contain emojis");
  assert.equal(emojiRegex.test(emptyHtml), false, "emptyHtml must not contain emojis");
  assert.equal(emojiRegex.test(errorHtml), false, "errorHtml must not contain emojis");
  assert.equal(emojiRegex.test(loadingHtml), false, "loadingHtml must not contain emojis");
});
