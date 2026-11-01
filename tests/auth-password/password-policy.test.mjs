import assert from "node:assert/strict";
import test from "node:test";
import {
  getPostPasswordChangePath,
  performPasswordChange,
  validatePasswordChange,
} from "../../src/lib/auth/password-policy.mjs";

const activeOwner = {
  authSubject: "synthetic-owner",
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};

test("validates password length, confirmation, and changed value", () => {
  assert.equal(validatePasswordChange({
    currentPassword: "old-pass",
    newPassword: "short",
    confirmPassword: "short",
  }).success, false);
  assert.equal(validatePasswordChange({
    currentPassword: "old-pass",
    newPassword: "new-password",
    confirmPassword: "different-password",
  }).success, false);
  assert.equal(validatePasswordChange({
    currentPassword: "same-password",
    newPassword: "same-password",
    confirmPassword: "same-password",
  }).success, false);
  assert.equal(validatePasswordChange({
    currentPassword: "old-pass",
    newPassword: "new-password",
    confirmPassword: "new-password",
  }).success, true);
});

test("forced activation changes password before clearing the flag", async () => {
  const calls = [];
  const result = await performPasswordChange({
    user: { ...activeOwner, mustChangePassword: true },
    mode: "activation",
    input: {
      currentPassword: "temporary",
      newPassword: "new-password",
      confirmPassword: "new-password",
    },
    changePassword: async () => { calls.push("provider"); return { success: true }; },
    clearForcedPasswordChange: async (subject) => {
      calls.push(subject);
      return true;
    },
  });

  assert.deepEqual(calls, ["provider", "synthetic-owner"]);
  assert.deepEqual(result, { success: true, redirectTo: "/dashboard" });
});

test("activation stays blocked when provider change fails", async () => {
  let flagWasCleared = false;
  const result = await performPasswordChange({
    user: { ...activeOwner, mustChangePassword: true },
    mode: "activation",
    input: {
      currentPassword: "wrong",
      newPassword: "new-password",
      confirmPassword: "new-password",
    },
    changePassword: async () => ({ success: false }),
    clearForcedPasswordChange: async () => { flagWasCleared = true; return true; },
  });

  assert.equal(flagWasCleared, false);
  assert.equal(result.success, undefined);
  assert.equal(typeof result.error, "string");
});

test("profile change is self scoped and blocked until activation completes", async () => {
  let targetSubject = null;
  const result = await performPasswordChange({
    user: { ...activeOwner, authSubject: "synthetic-staff", role: "STAFF", mustChangePassword: true },
    mode: "profile",
    input: {
      currentPassword: "temporary",
      newPassword: "new-password",
      confirmPassword: "new-password",
    },
    changePassword: async () => ({ success: true }),
    clearForcedPasswordChange: async (subject) => { targetSubject = subject; return true; },
  });

  assert.equal(targetSubject, null);
  assert.equal(typeof result.error, "string");
  assert.equal(getPostPasswordChangePath("TENANT"), "/portal");
  assert.equal(getPostPasswordChangePath("STAFF"), "/dashboard");
});
