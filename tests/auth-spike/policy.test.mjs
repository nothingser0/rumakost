import assert from "node:assert/strict";
import test from "node:test";
import {
  canDeactivateAccount,
  canInviteAccount,
  canStartTargetEmailChange,
  reconcileVerifiedEmailChange,
} from "../../spikes/neon-auth/policy.mjs";

test("Owner and Staff invitation scope follows the RumaKost role contract", () => {
  assert.equal(canInviteAccount("OWNER", "STAFF"), true);
  assert.equal(canInviteAccount("OWNER", "TENANT"), true);
  assert.equal(canInviteAccount("STAFF", "TENANT"), true);
  assert.equal(canInviteAccount("STAFF", "STAFF"), false);
  assert.equal(canInviteAccount("TENANT", "TENANT"), false);
});

test("account deactivation cannot affect a role above the actor scope", () => {
  assert.equal(canDeactivateAccount("OWNER", "STAFF"), true);
  assert.equal(canDeactivateAccount("OWNER", "TENANT"), true);
  assert.equal(canDeactivateAccount("STAFF", "TENANT"), true);
  assert.equal(canDeactivateAccount("STAFF", "STAFF"), false);
  assert.equal(canDeactivateAccount("TENANT", "TENANT"), false);
});

test("only Owner may initiate a target account email change", () => {
  assert.equal(canStartTargetEmailChange("OWNER"), true);
  assert.equal(canStartTargetEmailChange("STAFF"), false);
  assert.equal(canStartTargetEmailChange("TENANT"), false);
});

test("email mirror stays unchanged until provider confirms the requested address", () => {
  const appUser = { authSubject: "auth-user-1", emailNormalized: "old@example.invalid" };

  assert.deepEqual(
    reconcileVerifiedEmailChange(appUser, {
      id: "auth-user-1",
      email: "new@example.invalid",
      emailVerified: false,
    }, "new@example.invalid"),
    appUser,
  );
});

test("verified target email updates mirror while preserving auth subject and retry result", () => {
  const appUser = { authSubject: "auth-user-1", emailNormalized: "old@example.invalid" };
  const providerUser = {
    id: "auth-user-1",
    email: " New@Example.Invalid ",
    emailVerified: true,
  };

  const reconciled = reconcileVerifiedEmailChange(appUser, providerUser, "new@example.invalid");

  assert.deepEqual(reconciled, {
    authSubject: "auth-user-1",
    emailNormalized: "new@example.invalid",
  });
  assert.deepEqual(reconcileVerifiedEmailChange(reconciled, providerUser, "new@example.invalid"), reconciled);
});

test("email mirror ignores a different auth subject or a different verified address", () => {
  const appUser = { authSubject: "auth-user-1", emailNormalized: "old@example.invalid" };
  const mismatchedSubject = {
    id: "auth-user-2",
    email: "new@example.invalid",
    emailVerified: true,
  };
  const mismatchedEmail = {
    id: "auth-user-1",
    email: "other@example.invalid",
    emailVerified: true,
  };

  assert.deepEqual(
    reconcileVerifiedEmailChange(appUser, mismatchedSubject, "new@example.invalid"),
    appUser,
  );
  assert.deepEqual(
    reconcileVerifiedEmailChange(appUser, mismatchedEmail, "new@example.invalid"),
    appUser,
  );
});
