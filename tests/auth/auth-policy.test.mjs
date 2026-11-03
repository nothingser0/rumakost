import assert from "node:assert/strict";
import test from "node:test";
import { validateSignInInput } from "../../src/lib/auth/auth-policy.mjs";

test("rejects malformed credentials before contacting the authentication provider", () => {
  assert.equal(
    validateSignInInput({ email: "not-an-email", password: "wrong", destinationRole: "OWNER" }).success,
    false,
  );
  assert.equal(
    validateSignInInput({ email: "user@example.com", password: "", destinationRole: "OWNER" }).success,
    false,
  );
});
