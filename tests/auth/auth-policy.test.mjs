import assert from "node:assert/strict";
import test from "node:test";
import {
  getSessionUser,
  isAllowedAuthReadPath,
  validateSignInInput,
} from "../../src/lib/auth/auth-policy.mjs";

test("allows only the read-only session endpoint through the auth proxy", () => {
  assert.equal(isAllowedAuthReadPath(["get-session"]), true);
  assert.equal(isAllowedAuthReadPath(["sign-up", "email"]), false);
  assert.equal(isAllowedAuthReadPath(["sign-in", "email"]), false);
  assert.equal(isAllowedAuthReadPath([]), false);
});

test("rejects malformed credentials before contacting Neon Auth", () => {
  assert.equal(
    validateSignInInput({ email: "not-an-email", password: "wrong", destinationRole: "OWNER" }).success,
    false,
  );
  assert.equal(
    validateSignInInput({ email: "user@example.com", password: "", destinationRole: "OWNER" }).success,
    false,
  );
});

test("a valid server session exposes its user and an absent session exposes none", () => {
  assert.deepEqual(getSessionUser({ data: { user: { id: "synthetic-user" } } }), {
    id: "synthetic-user",
  });
  assert.equal(getSessionUser({ data: null }), null);
  assert.equal(getSessionUser(null), null);
});
