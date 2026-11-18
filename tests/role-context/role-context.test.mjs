import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RoleProvider,
  useRole,
  resolveEffectiveRole,
  sanitizeRole,
  canRoleAccessRoute,
  RoleSwitcherPillBar,
} from "../../src/components/layout/role-context.tsx";

test("sanitizeRole strictly validates and normalizes valid roles", () => {
  assert.equal(sanitizeRole("OWNER"), "OWNER");
  assert.equal(sanitizeRole("owner"), "OWNER");
  assert.equal(sanitizeRole("STAFF"), "STAFF");
  assert.equal(sanitizeRole("staf"), "STAFF");
  assert.equal(sanitizeRole("TENANT"), "TENANT");
  assert.equal(sanitizeRole("penghuni"), "TENANT");

  // Invalid inputs rejected
  assert.equal(sanitizeRole("ADMIN"), null);
  assert.equal(sanitizeRole("SUPERUSER"), null);
  assert.equal(sanitizeRole(""), null);
  assert.equal(sanitizeRole(null), null);
  assert.equal(sanitizeRole(undefined), null);
  assert.equal(sanitizeRole(123), null);
  assert.equal(sanitizeRole({ role: "OWNER" }), null);
});

test("resolveEffectiveRole prevents client-side role spoofing and tampering", () => {
  // Server says TENANT, client attempts to pass OWNER via query string or state
  const spoofedAttempt = "OWNER";
  const effective = resolveEffectiveRole("TENANT", spoofedAttempt);
  assert.equal(effective, "TENANT", "Must preserve server role and reject client spoofing attempt");

  // Server says STAFF, client attempts query param ?role=owner
  assert.equal(resolveEffectiveRole("STAFF", "?role=owner"), "STAFF");

  // Server says null (unauthenticated), client attempts to claim OWNER
  assert.equal(resolveEffectiveRole(null, "OWNER"), null);
  assert.equal(resolveEffectiveRole(undefined, "STAFF"), null);

  // Valid server roles without tampering
  assert.equal(resolveEffectiveRole("OWNER"), "OWNER");
  assert.equal(resolveEffectiveRole("STAFF"), "STAFF");
  assert.equal(resolveEffectiveRole("TENANT"), "TENANT");
});

test("canRoleAccessRoute strictly enforces role boundaries across routes", () => {
  // Public routes open to anyone
  assert.equal(canRoleAccessRoute(null, "/login"), true);
  assert.equal(canRoleAccessRoute(null, "/lupa-sandi"), true);
  assert.equal(canRoleAccessRoute(null, "/403"), true);

  // Unauthenticated blocked from protected routes
  assert.equal(canRoleAccessRoute(null, "/dashboard"), false);
  assert.equal(canRoleAccessRoute(null, "/portal"), false);
  assert.equal(canRoleAccessRoute(null, "/kamar"), false);

  // TENANT access boundaries
  assert.equal(canRoleAccessRoute("TENANT", "/portal"), true);
  assert.equal(canRoleAccessRoute("TENANT", "/portal/tagihan"), true);
  assert.equal(canRoleAccessRoute("TENANT", "/dashboard"), false, "Tenant cannot access management dashboard");
  assert.equal(canRoleAccessRoute("TENANT", "/laporan"), false, "Tenant cannot access financial reports");
  assert.equal(canRoleAccessRoute("TENANT", "/kamar"), false, "Tenant cannot access room management");

  // STAFF access boundaries
  assert.equal(canRoleAccessRoute("STAFF", "/dashboard"), true);
  assert.equal(canRoleAccessRoute("STAFF", "/kamar"), true);
  assert.equal(canRoleAccessRoute("STAFF", "/tiket"), true);
  assert.equal(canRoleAccessRoute("STAFF", "/portal"), false, "Staff cannot access tenant portal");
  assert.equal(canRoleAccessRoute("STAFF", "/laporan"), false, "Staff cannot access Owner financial reports");

  // OWNER access boundaries
  assert.equal(canRoleAccessRoute("OWNER", "/dashboard"), true);
  assert.equal(canRoleAccessRoute("OWNER", "/laporan"), true, "Owner has access to financial reports");
  assert.equal(canRoleAccessRoute("OWNER", "/aktivitas"), true, "Owner has access to audit trail");
  assert.equal(canRoleAccessRoute("OWNER", "/portal"), false, "Owner cannot access tenant portal");
});

test("RoleProvider provides immutable server session without client setRole mutator", () => {
  function TestConsumer() {
    const { role, isStaff, isOwner, isTenant, canAccessRoute } = useRole();
    return React.createElement(
      "div",
      null,
      React.createElement("span", { id: "role-display" }, role),
      React.createElement("span", { id: "is-staff" }, String(isStaff)),
      React.createElement("span", { id: "is-owner" }, String(isOwner)),
      React.createElement("span", { id: "can-report" }, String(canAccessRoute("/laporan"))),
    );
  }

  const serverUser = {
    id: "usr-staff-1",
    name: "Rini Marlina",
    email: "staff@rumakost.test",
    role: "STAFF",
  };

  const html = renderToStaticMarkup(
    React.createElement(
      RoleProvider,
      { serverUser },
      React.createElement(TestConsumer, null),
    ),
  );

  assert.match(html, />STAFF</);
  assert.match(html, />true</); // isStaff
  assert.match(html, />false</); // isOwner
  assert.match(html, /<span id="can-report">false<\/span>/); // Cannot access /laporan
});

test("RoleSwitcherPillBar renders 3 role tabs with correct active state", () => {
  const html = renderToStaticMarkup(
    React.createElement(RoleSwitcherPillBar, {
      selectedRole: "STAFF",
    }),
  );

  assert.match(html, /role="radiogroup"/);
  assert.match(html, /Pemilik/);
  assert.match(html, /Staf Pengelola/);
  assert.match(html, /Penghuni/);
  assert.match(html, /aria-checked="true"[^>]*>.*Staf Pengelola/);
});
