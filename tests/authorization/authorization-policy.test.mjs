import assert from "node:assert/strict";
import test from "node:test";
import { authorizeAction, authorizeRoute } from "../../src/lib/authorization/policy.mjs";

const owner = {
  id: "app-owner",
  authSubject: "synthetic-owner",
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, authSubject: "synthetic-staff", role: "STAFF" };
const tenant = { ...owner, id: "app-tenant", authSubject: "synthetic-tenant", role: "TENANT" };

test("rejects missing or inactive route sessions", () => {
  assert.deepEqual(authorizeRoute(null, "/dashboard"), {
    allowed: false,
    reason: "unauthenticated",
    redirectTo: "/login",
  });
  assert.equal(authorizeRoute({ ...owner, isActive: false }, "/dashboard").reason, "inactive");
});

test("forces password activation before all protected routes", () => {
  const forcedTenant = { ...tenant, mustChangePassword: true };
  assert.equal(authorizeRoute(forcedTenant, "/portal/tagihan").redirectTo, "/aktivasi-sandi");
  assert.equal(authorizeRoute(forcedTenant, "/aktivasi-sandi").allowed, true);
  assert.equal(authorizeRoute(tenant, "/aktivasi-sandi").redirectTo, "/portal");
});

test("allows roles only in their assigned route groups", () => {
  assert.equal(authorizeRoute(owner, "/dashboard").allowed, true);
  assert.equal(authorizeRoute(staff, "/kamar/room-1").allowed, true);
  assert.equal(authorizeRoute(tenant, "/portal/tiket").allowed, true);
  assert.equal(authorizeRoute(tenant, "/dashboard").reason, "role-denied");
  assert.equal(authorizeRoute(staff, "/portal").reason, "role-denied");
});

test("allows Staff to manage tenant accounts while keeping other settings, reports, and audit Owner-only", () => {
  assert.equal(authorizeRoute(owner, "/pengaturan/akun").allowed, true);
  assert.equal(authorizeRoute(staff, "/pengaturan/akun").allowed, true);
  assert.equal(authorizeRoute(tenant, "/pengaturan/akun").reason, "role-denied");
  for (const path of ["/pengaturan/profil", "/laporan", "/aktivitas"]) {
    assert.equal(authorizeRoute(owner, path).allowed, true);
    assert.equal(authorizeRoute(staff, path).reason, "role-denied");
    assert.equal(authorizeRoute(tenant, path).reason, "role-denied");
  }
});

test("fails closed for protected paths without a policy", () => {
  assert.equal(authorizeRoute(owner, "/unknown-private-area").reason, "unclassified-route");
});

test("action policy rejects unauthenticated, inactive, forced-change, and disallowed roles", () => {
  assert.equal(authorizeAction(null, { roles: ["OWNER"] }).allowed, false);
  assert.equal(authorizeAction({ ...owner, isActive: false }, { roles: ["OWNER"] }).reason, "inactive");
  assert.equal(authorizeAction({ ...owner, mustChangePassword: true }, { roles: ["OWNER"] }).reason, "password-change-required");
  assert.equal(authorizeAction(staff, { roles: ["OWNER"] }).reason, "role-denied");
  assert.equal(authorizeAction({ ...tenant, mustChangePassword: true }, {
    roles: ["TENANT"],
    allowForcedPasswordChange: true,
  }).allowed, true);
});

test("tenant resource access requires matching authenticated ownership", () => {
  assert.equal(authorizeAction(tenant, {
    roles: ["OWNER", "STAFF", "TENANT"],
    resourceOwnerAppUserId: "app-tenant",
    requiresResourceOwnership: true,
  }).allowed, true);
  assert.equal(authorizeAction(tenant, {
    roles: ["OWNER", "STAFF", "TENANT"],
    resourceOwnerAppUserId: "app-another-tenant",
    requiresResourceOwnership: true,
  }).reason, "ownership-denied");
  assert.equal(authorizeAction(tenant, {
    roles: ["OWNER", "STAFF", "TENANT"],
    requiresResourceOwnership: true,
  }).reason, "ownership-denied");
  assert.equal(authorizeAction(staff, {
    roles: ["OWNER", "STAFF", "TENANT"],
    resourceOwnerAppUserId: "app-tenant",
    requiresResourceOwnership: true,
  }).allowed, true);
});
