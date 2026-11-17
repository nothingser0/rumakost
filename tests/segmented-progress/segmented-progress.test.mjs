import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SegmentedProgress,
  ContinuousProgress,
  TicketStepTracker,
  getTicketStepIndex,
  getTicketStepName,
  DEFAULT_TICKET_STEPS,
} from "../../src/components/ui/segmented-progress.tsx";

function renderSegmented(props = {}) {
  return renderToStaticMarkup(
    React.createElement(SegmentedProgress, {
      currentStep: 3,
      ...props,
    }),
  );
}

function renderContinuous(props = {}) {
  return renderToStaticMarkup(
    React.createElement(ContinuousProgress, {
      label: "Dalam Pengerjaan",
      value: 50,
      ...props,
    }),
  );
}

function renderTracker(props = {}) {
  return renderToStaticMarkup(
    React.createElement(TicketStepTracker, {
      status: "in_progress",
      ...props,
    }),
  );
}

test("exposes accessible progressbar semantics with Indonesian step text", () => {
  const html = renderSegmented({ currentStep: 3, totalSteps: 5 });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="5"/);
  assert.match(html, /aria-valuetext="Tahap 3 dari 5: Dikerjakan"/);
  assert.match(html, /Tahap 3 dari 5: Dikerjakan/);
});

test("renders exactly 5 dashes with 3 filled and 2 unfilled for step 3", () => {
  const html = renderSegmented({ currentStep: 3, totalSteps: 5 });
  const filledMatches = html.match(/dashFilled/g) || [];
  const allDashes = html.match(/dash(?!Filled)/g) || [];
  assert.equal(filledMatches.length, 3);
  // Total dashes = 5
  assert.equal(allDashes.length, 5);
});

test("renders completed state with green success tone on step 5", () => {
  const html = renderSegmented({ currentStep: 5, totalSteps: 5, completedTone: "success" });
  assert.match(html, /aria-valuenow="5"/);
  assert.match(html, /tone-success/);
  assert.match(html, /Tahap 5 dari 5: Selesai/);
});

test("clamps out-of-range steps and handles zero gracefully", () => {
  assert.equal(getTicketStepIndex(-2), 1);
  assert.equal(getTicketStepIndex(10), 5);
  assert.equal(getTicketStepIndex("submitted"), 1);
  assert.equal(getTicketStepIndex("assigned"), 2);
  assert.equal(getTicketStepIndex("in_progress"), 3);
  assert.equal(getTicketStepIndex("checking"), 4);
  assert.equal(getTicketStepIndex("resolved"), 5);

  const zeroHtml = renderSegmented({ currentStep: 0, totalSteps: 5 });
  assert.match(zeroHtml, /aria-valuenow="0"/);
  assert.match(zeroHtml, /Belum dimulai/);
  const zeroFilled = zeroHtml.match(/dashFilled/g) || [];
  assert.equal(zeroFilled.length, 0);

  const overHtml = renderSegmented({ currentStep: 99, totalSteps: 5 });
  assert.match(overHtml, /aria-valuenow="5"/);
});

test("supports sm and md sizes and optional header label", () => {
  const smHtml = renderSegmented({ size: "sm" });
  assert.match(smHtml, /size-sm/);

  const mdHtml = renderSegmented({ size: "md", showLabel: true });
  assert.match(mdHtml, /size-md/);
  assert.match(mdHtml, /Tahap 3: Dikerjakan/);
  assert.match(mdHtml, /Tahap 3 dari 5/);
});

test("ContinuousProgress renders thick bar with accessible semantics and correct percentage", () => {
  const html = renderContinuous({ value: 75, max: 100, label: "Progres Pemeliharaan" });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-label="Progres Pemeliharaan"/);
  assert.match(html, /aria-valuenow="75"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.match(html, /style="width:75%"/);
});

test("TicketStepTracker mini variant matches WF-08 list item layout", () => {
  const html = renderTracker({ status: "assigned", variant: "mini" });
  assert.match(html, /miniTracker/);
  assert.match(html, /Tahap 2: Ditugaskan/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="2"/);
});

test("TicketStepTracker modal variant matches WF-08 modal stepper layout", () => {
  const html = renderTracker({ status: "resolved", variant: "modal" });
  assert.match(html, /modalTracker/);
  assert.match(html, /Progress Penanganan/);
  assert.match(html, /Tahap 5 dari 5/);
  assert.match(html, /tone-success/);
});

test("satisfies zero-emoji constraint across all variants", () => {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  const html1 = renderSegmented();
  const html2 = renderContinuous();
  const html3 = renderTracker();

  assert.doesNotMatch(html1, emojiRegex);
  assert.doesNotMatch(html2, emojiRegex);
  assert.doesNotMatch(html3, emojiRegex);
});
