import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PopoverSelect } from "../../src/components/ui/popover-select.tsx";

const sampleOptions = [
  { value: "all", label: "Semua Lantai" },
  { value: "lt1", label: "Lantai 1 (Kamar A-01 s/d A-05)" },
  { value: "lt2", label: "Lantai 2 (Kamar B-01 s/d B-05)" },
  { value: "lt3", label: "Lantai 3 (Kamar C-01 s/d C-05)", disabled: true },
];

test("renders trigger button with accessible attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      id: "filter-floor",
      label: "Filter Lantai",
      options: sampleOptions,
      placeholder: "Pilih lantai...",
    }),
  );

  assert.match(html, /<button/);
  assert.match(html, /id="filter-floor"/);
  assert.match(html, /aria-haspopup="listbox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Pilih lantai.../);
  assert.match(html, /Filter Lantai/);
});

test("renders selected option label on the trigger button", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      options: sampleOptions,
      value: "lt1",
    }),
  );

  assert.match(html, /Lantai 1 \(Kamar A-01 s\/d A-05\)/);
});

test("supports trigger variants (pill and rounded)", () => {
  const pillHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      options: sampleOptions,
      triggerVariant: "pill",
    }),
  );
  assert.doesNotMatch(pillHtml, /trigger-rounded/);

  const roundedHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      options: sampleOptions,
      triggerVariant: "rounded",
    }),
  );
  assert.match(roundedHtml, /trigger-rounded/);
});

test("associates hint and error with aria-describedby", () => {
  const hintHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      hint: "Pilih lantai unit kamar.",
      id: "select-with-hint",
      options: sampleOptions,
    }),
  );
  assert.match(hintHtml, /aria-describedby="select-with-hint-hint"/);
  assert.match(hintHtml, /id="select-with-hint-hint"/);

  const errorHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      error: "Lantai wajib dipilih.",
      id: "select-with-error",
      options: sampleOptions,
    }),
  );
  assert.match(errorHtml, /aria-describedby="select-with-error-error"/);
  assert.match(errorHtml, /aria-invalid="true"/);
  assert.match(errorHtml, /role="alert"/);
});

test("renders disabled state with appropriate attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      disabled: true,
      options: sampleOptions,
    }),
  );

  assert.match(html, /disabled=""/);
});

test("renders custom triggerIcon and chevrondown icon", () => {
  const icon = React.createElement("span", { "data-testid": "filter-icon" }, "ICON");
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      options: sampleOptions,
      triggerIcon: icon,
    }),
  );

  assert.match(html, /data-testid="filter-icon"/);
  assert.match(html, /<svg/); // Chevron down SVG
});

test("supports multiple selection mode with count indicator", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      multiple: true,
      options: sampleOptions,
      value: ["lt1", "lt2"],
    }),
  );

  assert.match(html, /2 opsi terpilih/);
});

test("renders hidden input fields for form integration", () => {
  const singleHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      name: "floor_id",
      options: sampleOptions,
      value: "lt1",
    }),
  );
  assert.match(singleHtml, /<input type="hidden" name="floor_id" value="lt1"\/>/);

  const multiHtml = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      multiple: true,
      name: "selected_floors",
      options: sampleOptions,
      value: ["lt1", "lt2"],
    }),
  );
  assert.match(multiHtml, /<input type="hidden" name="selected_floors" value="lt1"\/>/);
  assert.match(multiHtml, /<input type="hidden" name="selected_floors" value="lt2"\/>/);
});

test("renders open popover listbox and options when defaultOpen is true", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      defaultOpen: true,
      options: sampleOptions,
      value: "lt1",
    }),
  );

  assert.match(html, /role="listbox"/);
  assert.match(html, /role="option"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-disabled="true"/); // for lt3
  assert.match(html, /Semua Lantai/);
  assert.match(html, /Lantai 1 \(Kamar A-01 s\/d A-05\)/);
  assert.match(html, /checkIcon/); // checkmark SVG for lt1
});

test("renders search input inside popover when searchable and open", () => {
  const html = renderToStaticMarkup(
    React.createElement(PopoverSelect, {
      defaultOpen: true,
      options: sampleOptions,
      searchPlaceholder: "Cari nomor lantai...",
      searchable: true,
    }),
  );

  assert.match(html, /<input/);
  assert.match(html, /placeholder="Cari nomor lantai\.\.\."/);
  assert.match(html, /searchInput/);
});

