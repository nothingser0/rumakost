import assert from "node:assert/strict";
import test from "node:test";
import { authorizeRoute } from "../../src/lib/authorization/policy.mjs";
import {
  canManageRole,
  listVisibleRoles,
  validateAccountInput,
  validateAccountStatusInput,
} from "../../src/lib/users/policy.mjs";

const accountUser = (role) => ({
  id: "user-1",
  role,
  isActive: true,
  mustChangePassword: false,
});

test("Owner can manage Staff and Tenant accounts, Staff can manage only Tenant accounts", () => {
  assert.equal(canManageRole("OWNER", "STAFF"), true);
  assert.equal(canManageRole("OWNER", "TENANT"), true);
  assert.equal(canManageRole("STAFF", "TENANT"), true);
  assert.equal(canManageRole("STAFF", "STAFF"), false);
  assert.equal(canManageRole("TENANT", "TENANT"), false);
  assert.deepEqual(listVisibleRoles("OWNER"), ["OWNER", "STAFF", "TENANT"]);
  assert.deepEqual(listVisibleRoles("STAFF"), ["TENANT"]);
  assert.deepEqual(listVisibleRoles("TENANT"), []);
});

test("account route permits Owner and Staff while other settings remain Owner-only", () => {
  assert.equal(authorizeRoute(accountUser("OWNER"), "/pengaturan/akun").allowed, true);
  assert.equal(authorizeRoute(accountUser("STAFF"), "/pengaturan/akun").allowed, true);
  assert.equal(authorizeRoute(accountUser("TENANT"), "/pengaturan/akun").allowed, false);
  assert.equal(authorizeRoute(accountUser("STAFF"), "/pengaturan/profil").allowed, false);
});

test("new account validation trims name and normalizes email", () => {
  assert.deepEqual(
    validateAccountInput({ displayName: "  Siti Amanah ", email: " SITI@KOST.ID ", role: "TENANT" }, "STAFF"),
    { success: true, data: { displayName: "Siti Amanah", email: "siti@kost.id", role: "TENANT" } },
  );
});

test("new account validation rejects Owner creation, unknown roles, and malformed email", () => {
  assert.equal(validateAccountInput({ displayName: "Pemilik", email: "owner@kost.id", role: "OWNER" }, "OWNER").success, false);
  assert.equal(validateAccountInput({ displayName: "Teknisi", email: "teknisi@kost.id", role: "TECHNICIAN" }, "OWNER").success, false);
  assert.equal(validateAccountInput({ displayName: "Siti", email: "bukan-email", role: "TENANT" }, "STAFF").success, false);
});

test("account status validation accepts only UUIDs and explicit boolean strings", () => {
  assert.deepEqual(
    validateAccountStatusInput({ id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8", isActive: "false" }),
    { success: true, data: { id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8", isActive: false } },
  );
  assert.equal(validateAccountStatusInput({ id: "not-an-id", isActive: "false" }).success, false);
  assert.equal(validateAccountStatusInput({ id: "6ba7b810-9dad-41d1-80b4-00c04fd430c8", isActive: "yes" }).success, false);
});
