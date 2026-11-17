import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PropertyHighlightCard,
  PropertyCard,
} from "../../src/components/dashboard/property-card.tsx";

test("PropertyHighlightCard renders primary boarding house attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(PropertyHighlightCard, {
      propertyName: "Kost Budi Makmur",
      address: "Jl. Flamboyan No. 12",
      totalRooms: 15,
      netIncome: 12300000,
      netIncomeDelta: "+15%",
    }),
  );

  assert.match(html, /Kost Budi Makmur/);
  assert.match(html, /Jl\. Flamboyan No\. 12/);
  assert.match(html, /15 Unit/);
  assert.match(html, /Properti Utama/);
  assert.match(html, /Rp 12,30 Jt/);
  assert.match(html, /\+15%/);
  assert.match(html, /role="link"/);
  assert.match(html, /tabindex="0"/);
});

test("PropertyCard alias works identically to PropertyHighlightCard", () => {
  const html = renderToStaticMarkup(
    React.createElement(PropertyCard, {
      propertyName: "Kost Budi Makmur",
    }),
  );
  assert.match(html, /Kost Budi Makmur/);
});

test("Staff role strictly hides financial net income and displays operational metrics", () => {
  const staffHtml = renderToStaticMarkup(
    React.createElement(PropertyHighlightCard, {
      role: "STAFF",
      netIncome: 12300000,
      totalRooms: 15,
      occupiedRooms: 11,
      occupancyRate: 73,
    }),
  );

  // Financial income is never exposed to Staff
  assert.doesNotMatch(staffHtml, /Pemasukan Bersih/);
  assert.doesNotMatch(staffHtml, /Rp 12,30 Jt/);

  // Operational metrics are displayed instead
  assert.match(staffHtml, /Ringkasan Okupansi/);
  assert.match(staffHtml, /Total Kamar/);
  assert.match(staffHtml, /15 Unit/);
  assert.match(staffHtml, /Tingkat Hunian/);
  assert.match(staffHtml, /73%/);
  assert.match(staffHtml, /11 dari 15 kamar aktif terisi/);
});

test("strictly adheres to single property scope without multi-property controls", () => {
  const html = renderToStaticMarkup(
    React.createElement(PropertyHighlightCard, {}),
  );

  // Ensure no multi-property dropdown, select, or switcher exists
  assert.doesNotMatch(html, /<select/i);
  assert.doesNotMatch(html, /pilih properti/i);
  assert.doesNotMatch(html, /ganti properti/i);
  assert.doesNotMatch(html, /tambah properti/i);
});

test("satisfies zero-emoji constraint across all variants", () => {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  const htmlOwner = renderToStaticMarkup(
    React.createElement(PropertyHighlightCard, { role: "OWNER" }),
  );
  const htmlStaff = renderToStaticMarkup(
    React.createElement(PropertyHighlightCard, { role: "STAFF" }),
  );

  assert.doesNotMatch(htmlOwner, emojiRegex);
  assert.doesNotMatch(htmlStaff, emojiRegex);
});
