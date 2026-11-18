import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DataTable,
  RowActionLink,
  clampPageSize,
  clampPage,
  getPageCount,
  getPageWindow,
  DATA_TABLE_MAX_PAGE_SIZE,
} from "../../src/components/ui/data-table.tsx";

const columns = [
  { key: "name", header: "Penghuni", cell: (row) => row.name },
  { key: "room", header: "Kamar", cell: (row) => row.room },
  {
    key: "action",
    header: "Aksi",
    hideHeader: true,
    align: "right",
    cell: (row) => React.createElement(RowActionLink, { href: `/penghuni/${row.id}`, label: "Detail" }),
  },
];

function makeRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `r${index + 1}`,
    name: `Penghuni ${index + 1}`,
    room: `A-${String(index + 1).padStart(2, "0")}`,
  }));
}

function render(props) {
  return renderToStaticMarkup(
    React.createElement(DataTable, {
      columns,
      getRowKey: (row) => row.id,
      caption: "Daftar penghuni",
      ...props,
    }),
  );
}

test("renders headers, rows, caption, and row action link", () => {
  const html = render({ rows: makeRows(3) });
  assert.match(html, /<caption[^>]*>Daftar penghuni<\/caption>/);
  assert.match(html, /scope="col"/);
  assert.match(html, /Penghuni 1/);
  assert.match(html, /A-03/);
  assert.match(html, /href="\/penghuni\/r2"/);
  assert.match(html, /Detail/);
});

test("empty state renders when there are no rows", () => {
  const html = render({ rows: [], emptyTitle: "Belum ada penghuni", emptyText: "Tambah penghuni baru." });
  assert.match(html, /Belum ada penghuni/);
  assert.match(html, /Tambah penghuni baru\./);
  assert.doesNotMatch(html, /Navigasi halaman/);
});

test("loading state shows skeleton rows, busy flag, and no data rows", () => {
  const html = render({ rows: makeRows(3), loading: true });
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Memuat data/);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 5);
  assert.doesNotMatch(html, /Penghuni 1/);
});

test("error state shows alert and retry button", () => {
  const html = render({ rows: makeRows(3), error: "Server tidak merespons.", onRetry: () => {} });
  assert.match(html, /role="alert"/);
  assert.match(html, /Data gagal dimuat/);
  assert.match(html, /Server tidak merespons\./);
  assert.match(html, /Coba Lagi/);
  assert.doesNotMatch(html, /Penghuni 1/);
});

test("client pagination defaults to 20 rows and reports range", () => {
  const html = render({ rows: makeRows(45) });
  assert.match(html, /Menampilkan 1-20 dari 45/);
  assert.match(html, /Penghuni 20</);
  assert.doesNotMatch(html, /Penghuni 21</);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /aria-label="Halaman sebelumnya"[^>]*disabled|disabled=""[^>]*aria-label="Halaman sebelumnya"/);
});

test("page size is bounded to a maximum of 100", () => {
  assert.equal(DATA_TABLE_MAX_PAGE_SIZE, 100);
  assert.equal(clampPageSize(500), 100);
  assert.equal(clampPageSize(0), 1);
  assert.equal(clampPageSize(undefined), 20);
  assert.equal(clampPageSize(Number.NaN), 20);
  const html = render({ rows: makeRows(150), pageSize: 500 });
  assert.match(html, /Menampilkan 1-100 dari 150/);
  assert.doesNotMatch(html, /Penghuni 101</);
});

test("server-driven mode trusts total and caps rendered rows to the page size", () => {
  const html = render({ rows: makeRows(10), total: 95, page: 3, pageSize: 10 });
  assert.match(html, /Menampilkan 21-30 dari 95/);
  assert.match(html, /aria-label="Halaman 3" aria-current="page"|aria-current="page"[^>]*aria-label="Halaman 3"/);
});

test("pagination helpers clamp inputs", () => {
  assert.equal(getPageCount(0, 20), 1);
  assert.equal(getPageCount(41, 20), 3);
  assert.equal(clampPage(99, 3), 3);
  assert.equal(clampPage(-4, 3), 1);
  assert.deepEqual(getPageWindow(1, 10), [1, 2, 3, 4, 5]);
  assert.deepEqual(getPageWindow(10, 10), [6, 7, 8, 9, 10]);
  assert.deepEqual(getPageWindow(2, 3), [1, 2, 3]);
});

test("toolbar slot renders and no emoji appear", () => {
  const html = render({ rows: makeRows(2), toolbar: React.createElement("span", null, "Filter Slot") });
  assert.match(html, /Filter Slot/);
  assert.equal(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u.test(html), false);
});
