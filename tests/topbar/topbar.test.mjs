import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Topbar,
  BottomNav,
  NavigationShell,
  getNavItemsForRole,
  getMobileNavItemsForRole,
  normalizeRole,
  getAvatarInitials,
  OWNER_NAV_ITEMS,
  STAFF_NAV_ITEMS,
  TENANT_NAV_ITEMS,
} from "../../src/components/layout/topbar.tsx";

function render(props) {
  return renderToStaticMarkup(React.createElement(Topbar, props));
}

function renderBottom(props) {
  return renderToStaticMarkup(React.createElement(BottomNav, props));
}

test("normalizes roles safely and case-insensitively", () => {
  assert.equal(normalizeRole("OWNER"), "OWNER");
  assert.equal(normalizeRole("owner"), "OWNER");
  assert.equal(normalizeRole("STAFF"), "STAFF");
  assert.equal(normalizeRole("staff"), "STAFF");
  assert.equal(normalizeRole("staf"), "STAFF");
  assert.equal(normalizeRole("TENANT"), "TENANT");
  assert.equal(normalizeRole("tenant"), "TENANT");
  assert.equal(normalizeRole("penghuni"), "TENANT");
  assert.equal(normalizeRole(undefined), "OWNER");
  assert.equal(normalizeRole(""), "OWNER");
});

test("extracts clean avatar initials from various user names", () => {
  assert.equal(getAvatarInitials("Budi Santoso"), "BS");
  assert.equal(getAvatarInitials("Rini"), "RI");
  assert.equal(getAvatarInitials("Ahmad Zulfikar Ramadhan"), "AR");
  assert.equal(getAvatarInitials(""), "RK");
  assert.equal(getAvatarInitials(undefined), "RK");
});

test("renders desktop topbar with brand and logo pointing to /dashboard for OWNER", () => {
  const html = render({ role: "OWNER" });
  assert.match(html, /<header[^>]*role="banner"/);
  assert.match(html, /<a[^>]*class="[^"]*brandGroup[^"]*"[^>]*href="\/dashboard"/);
  assert.match(html, /Ruma/);
  assert.match(html, /Kost/);
  assert.match(html, /<svg[^>]*viewBox="0 0 52 52"/);
});

test("renders exactly 7 navigation pills for OWNER and marks active path", () => {
  const items = getNavItemsForRole("OWNER");
  assert.equal(items.length, 7);
  assert.deepEqual(
    items.map((i) => i.href),
    ["/dashboard", "/kamar", "/penghuni", "/tagihan", "/pembayaran", "/laporan", "/tiket"],
  );

  const html = render({ role: "OWNER", currentPath: "/kamar" });
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /href="\/kamar"/);
  assert.match(html, /href="\/penghuni"/);
  assert.match(html, /href="\/tagihan"/);
  assert.match(html, /href="\/pembayaran"/);
  assert.match(html, /href="\/laporan"/);
  assert.match(html, /href="\/tiket"/);

  // Active pill has aria-current="page"
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/kamar"|<a[^>]*href="\/kamar"[^>]*aria-current="page"/);
  assert.doesNotMatch(html, /<a[^>]*aria-current="page"[^>]*href="\/dashboard"|<a[^>]*href="\/dashboard"[^>]*aria-current="page"/);
});

test("renders exactly 5 navigation pills for STAFF without role badge", () => {
  const items = getNavItemsForRole("STAFF");
  assert.equal(items.length, 5);
  assert.deepEqual(
    items.map((i) => i.href),
    ["/dashboard", "/kamar", "/penghuni", "/tagihan", "/tiket"],
  );

  const html = render({ role: "STAFF", currentPath: "/dashboard" });
  assert.doesNotMatch(html, /Staf Operasional/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/dashboard"|<a[^>]*href="\/dashboard"[^>]*aria-current="page"/);
  assert.match(html, /href="\/kamar"/);
  assert.match(html, /href="\/penghuni"/);
  assert.match(html, /href="\/tagihan"/);
  assert.match(html, /href="\/tiket"/);
});

test("STAFF navigation strictly excludes sensitive financial reports (/laporan)", () => {
  const html = render({ role: "STAFF" });
  assert.doesNotMatch(html, /href="\/laporan"/);
});

test("renders exactly 3 navigation pills for TENANT and targets /portal for brand", () => {
  const items = getNavItemsForRole("TENANT");
  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map((i) => i.href),
    ["/portal", "/portal/tagihan", "/portal/tiket"],
  );

  const html = render({
    role: "TENANT",
    user: { name: "Budi Santoso", roomName: "Kamar A-04" },
    currentPath: "/portal/tagihan",
  });

  // Brand points to /portal
  assert.match(html, /<a[^>]*class="[^"]*brandGroup[^"]*"[^>]*href="\/portal"/);
  // Nav items
  assert.match(html, /href="\/portal"/);
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/portal\/tagihan"|<a[^>]*href="\/portal\/tagihan"[^>]*aria-current="page"/);
  assert.match(html, /href="\/portal\/tiket"/);
});

test("TENANT navigation strictly excludes management routes", () => {
  const html = render({ role: "TENANT" });
  assert.doesNotMatch(html, /href="\/dashboard"/);
  assert.doesNotMatch(html, /href="\/kamar"/);
  assert.doesNotMatch(html, /href="\/penghuni"/);
  assert.doesNotMatch(html, /href="\/laporan"/);
  assert.doesNotMatch(html, /href="\/pembayaran"/);
  assert.doesNotMatch(html, /href="\/aktivitas"/);
});

test("renders right utility items: search, notification bell with unread dot, and user profile", () => {
  const html = render({
    role: "OWNER",
    user: { name: "Budi Santoso", email: "budi@makmur.com" },
    unreadNotifications: 3,
  });

  // Search input and trigger
  assert.match(html, /placeholder="Cari kamar, penghuni, tagihan\.\.\."/);
  assert.match(html, /aria-label="Cari data operasional"/);

  // Notification button with unread count
  assert.match(html, /aria-label="Notifikasi: 3 belum dibaca"/);
  assert.match(html, /class="[^"]*unreadDot/);

  // User profile button with avatar initials and name
  assert.match(html, />BS<\/div>/);
  assert.match(html, />Budi Santoso<\/span>/);
  assert.match(html, /aria-label="Menu Akun: Budi Santoso"/);
});

test("renders mobile bottom navigation bar with role-specific items and min 44px targets", () => {
  const ownerMobile = renderBottom({ role: "OWNER", currentPath: "/dashboard" });
  assert.match(ownerMobile, /aria-label="Navigasi Bawah"/);
  assert.match(ownerMobile, /Beranda/);
  assert.match(ownerMobile, /Kamar/);
  assert.match(ownerMobile, /Tagihan/);
  assert.match(ownerMobile, /Tiket/);
  assert.match(ownerMobile, /Lainnya/);
  assert.match(ownerMobile, /<a[^>]*aria-current="page"[^>]*href="\/dashboard"|<a[^>]*href="\/dashboard"[^>]*aria-current="page"/);

  const staffMobile = renderBottom({ role: "STAFF", currentPath: "/tagihan" });
  assert.match(staffMobile, /Beranda/);
  assert.match(staffMobile, /Kamar/);
  assert.match(staffMobile, /Catat Bayar/);
  assert.match(staffMobile, /Tiket/);
  assert.match(staffMobile, /Profil Staf/);
  assert.match(staffMobile, /<a[^>]*aria-current="page"[^>]*href="\/tagihan"|<a[^>]*href="\/tagihan"[^>]*aria-current="page"/);

  const tenantMobile = renderBottom({ role: "TENANT", currentPath: "/portal" });
  assert.match(tenantMobile, /Kamar Saya/);
  assert.match(tenantMobile, /Tagihan/);
  assert.match(tenantMobile, /Lapor Rusak/);
  assert.match(tenantMobile, /Akun Saya/);
  assert.match(tenantMobile, /<a[^>]*aria-current="page"[^>]*href="\/portal"|<a[^>]*href="\/portal"[^>]*aria-current="page"/);
});

test("NavigationShell wraps Topbar and children properly", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationShell,
      { role: "OWNER", currentPath: "/dashboard" },
      React.createElement("div", { id: "test-content" }, "Dashboard Content"),
    ),
  );

  assert.match(html, /role="banner"/);
  assert.match(html, /<main><div id="test-content">Dashboard Content<\/div><\/main>/);
});

test("satisfies zero-emoji constraint across all rendered markup", () => {
  const ownerHtml = render({ role: "OWNER", unreadNotifications: 5 });
  const staffHtml = render({ role: "STAFF", unreadNotifications: 2 });
  const tenantHtml = render({ role: "TENANT", unreadNotifications: 0 });
  const bottomHtml = renderBottom({ role: "OWNER" });

  for (const markup of [ownerHtml, staffHtml, tenantHtml, bottomHtml]) {
    assert.doesNotMatch(markup, /\p{Extended_Pictographic}/u);
  }
});
