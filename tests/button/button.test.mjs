import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../../src/components/ui/button.tsx";

test("renders semantic button element with default props", () => {
  const html = renderToStaticMarkup(React.createElement(Button, null, "Kirim"));
  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, />Kirim<\/button>$/);
  assert.match(html, /variant-primary-black/);
  assert.match(html, /size-md/);
  assert.match(html, /shape-pill/);
});

test("supports all CMP-01 variants", () => {
  const variants = [
    { name: "primary-black", classMatch: /variant-primary-black/ },
    { name: "dark", classMatch: /variant-primary-black/ },
    { name: "primary-orange", classMatch: /variant-primary-orange/ },
    { name: "primary", classMatch: /variant-primary-orange/ },
    { name: "secondary-ghost", classMatch: /variant-secondary-ghost/ },
    { name: "outline", classMatch: /variant-secondary-ghost/ },
    { name: "subtle-danger", classMatch: /variant-subtle-danger/ },
    { name: "destructive", classMatch: /variant-subtle-danger/ },
    { name: "ghost-link", classMatch: /variant-ghost-link/ },
    { name: "link", classMatch: /variant-ghost-link/ },
    { name: "icon-circle", classMatch: /variant-icon-circle/ },
    { name: "translucent-arrow", classMatch: /variant-translucent-arrow/ },
    { name: "pill-arrow", classMatch: /variant-pill-arrow/ },
    { name: "white-arrow", classMatch: /variant-pill-arrow/ },
  ];

  for (const { name, classMatch } of variants) {
    const html = renderToStaticMarkup(
      React.createElement(Button, { variant: name }, "Action"),
    );
    assert.match(html, classMatch, `Variant ${name} should apply expected class`);
  }
});

test("supports all button sizing tiers (lg, md, sm, xs, icon)", () => {
  const sizes = [
    { size: "lg", classMatch: /size-lg/ },
    { size: "md", classMatch: /size-md/ },
    { size: "sm", classMatch: /size-sm/ },
    { size: "xs", classMatch: /size-xs/ },
    { size: "icon", classMatch: /size-icon/ },
  ];

  for (const { size, classMatch } of sizes) {
    const html = renderToStaticMarkup(
      React.createElement(Button, { size }, "Action"),
    );
    assert.match(html, classMatch, `Size ${size} should apply expected class`);
  }
});

test("supports button shapes (pill, rounded, circle)", () => {
  const shapes = [
    { shape: "pill", classMatch: /shape-pill/ },
    { shape: "rounded", classMatch: /shape-rounded/ },
    { shape: "circle", classMatch: /shape-circle/ },
  ];

  for (const { shape, classMatch } of shapes) {
    const html = renderToStaticMarkup(
      React.createElement(Button, { shape }, "Action"),
    );
    assert.match(html, classMatch, `Shape ${shape} should apply expected class`);
  }
});

test("automatically applies circle shape for icon-circle and translucent-arrow", () => {
  const circleVariants = ["icon-circle", "translucent-arrow", "pill-arrow", "white-arrow"];
  for (const variant of circleVariants) {
    const html = renderToStaticMarkup(
      React.createElement(Button, { variant }, "↗"),
    );
    assert.match(html, /shape-circle/);
  }
});

test("renders disabled state with appropriate attributes and classes", () => {
  const html = renderToStaticMarkup(
    React.createElement(Button, { disabled: true }, "Nonaktif"),
  );
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled/);
});

test("renders loading state with spinner and accessibility attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(Button, { loading: true }, "Memproses"),
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /<svg aria-hidden="true"/);
  assert.match(html, />Memproses/);
});

test("displays custom loadingText during loading state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { loading: true, loadingText: "Menyimpan data..." },
      "Simpan",
    ),
  );
  assert.match(html, />Menyimpan data\.\.\./);
  assert.doesNotMatch(html, />Simpan/);
});

test("renders leftIcon and rightIcon correctly when not loading", () => {
  const leftIcon = React.createElement("span", { id: "left" }, "←");
  const rightIcon = React.createElement("span", { id: "right" }, "→");

  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { leftIcon, rightIcon },
      "Lanjut",
    ),
  );

  assert.match(html, /id="left">←<\/span>/);
  assert.match(html, /Lanjut/);
  assert.match(html, /id="right">→<\/span>/);
});

test("hides icons when loading is active", () => {
  const leftIcon = React.createElement("span", { id: "left" }, "←");
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { leftIcon, loading: true },
      "Proses",
    ),
  );
  assert.doesNotMatch(html, /id="left"/);
  assert.match(html, /<svg aria-hidden="true"/);
});

test("supports submit and reset button types", () => {
  const submitHtml = renderToStaticMarkup(
    React.createElement(Button, { type: "submit" }, "Simpan"),
  );
  assert.match(submitHtml, /type="submit"/);

  const resetHtml = renderToStaticMarkup(
    React.createElement(Button, { type: "reset" }, "Reset"),
  );
  assert.match(resetHtml, /type="reset"/);
});

test("merges custom className and forwards extra HTML attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button,
      { className: "custom-action-btn", id: "btn-action", "data-testid": "test-btn" },
      "Aksi",
    ),
  );
  assert.match(html, /custom-action-btn/);
  assert.match(html, /id="btn-action"/);
  assert.match(html, /data-testid="test-btn"/);
});

test("guards onClick handler when button is disabled or loading", () => {
  let clickCount = 0;
  const onClick = () => {
    clickCount += 1;
  };

  const preventDefault = () => {};
  const stopPropagation = () => {};
  const syntheticEvent = { preventDefault, stopPropagation };

  const renderBtn = (props) => (Button.render ? Button.render(props, null) : Button(props));

  // Create component element and inspect onClick prop wrapper
  const normalElement = renderBtn({ onClick, children: "Klik" });
  normalElement.props.onClick(syntheticEvent);
  assert.equal(clickCount, 1, "Active button triggers onClick");

  // Disabled button
  const disabledElement = renderBtn({ disabled: true, onClick, children: "Disabled" });
  disabledElement.props.onClick(syntheticEvent);
  assert.equal(clickCount, 1, "Disabled button guards against onClick");

  // Loading button
  const loadingElement = renderBtn({ loading: true, onClick, children: "Loading" });
  loadingElement.props.onClick(syntheticEvent);
  assert.equal(clickCount, 1, "Loading button guards against onClick");
});
