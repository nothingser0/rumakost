import assert from "node:assert/strict";
import test from "node:test";
import { performPasswordResetCompletion } from "../../src/lib/auth/password-reset-completion.mjs";

const baseInput = {
  rawToken: "synthetic-reset-token",
  rawNewPassword: "new-password-123",
  rawConfirmPassword: "new-password-123",
};

test("rejects missing or malformed reset input without contacting the provider", async () => {
  let providerCalled = false;

  const result = await performPasswordResetCompletion({
    ...baseInput,
    rawToken: " ",
    resetPassword: async () => { providerCalled = true; },
  });

  assert.deepEqual(result, { status: "invalid" });
  assert.equal(providerCalled, false);
});

test("rejects short, long, or mismatched new passwords before provider access", async () => {
  let providerCalls = 0;

  const shortResult = await performPasswordResetCompletion({
    ...baseInput,
    rawNewPassword: "short",
    rawConfirmPassword: "short",
    resetPassword: async () => { providerCalls += 1; },
  });
  const longResult = await performPasswordResetCompletion({
    ...baseInput,
    rawNewPassword: "x".repeat(129),
    rawConfirmPassword: "x".repeat(129),
    resetPassword: async () => { providerCalls += 1; },
  });
  const mismatchResult = await performPasswordResetCompletion({
    ...baseInput,
    rawConfirmPassword: "another-password-123",
    resetPassword: async () => { providerCalls += 1; },
  });

  assert.deepEqual(shortResult, { status: "invalid" });
  assert.deepEqual(longResult, { status: "invalid" });
  assert.deepEqual(mismatchResult, { status: "invalid" });
  assert.equal(providerCalls, 0);
});

test("uses the provider token and reports success only after provider confirmation", async () => {
  let providerInput;

  const result = await performPasswordResetCompletion({
    ...baseInput,
    resetPassword: async (input) => {
      providerInput = input;
      return { data: { status: true }, error: null };
    },
  });

  assert.deepEqual(result, { status: "success" });
  assert.deepEqual(providerInput, {
    token: "synthetic-reset-token",
    newPassword: "new-password-123",
  });
  assert.equal(JSON.stringify(result).includes("synthetic-reset-token"), false);
  assert.equal(JSON.stringify(result).includes("new-password-123"), false);
});

test("an invalid or expired provider token leaves the account unchanged", async () => {
  let accountPassword = "unchanged-password";

  const result = await performPasswordResetCompletion({
    ...baseInput,
    rawToken: "synthetic-expired-token",
    resetPassword: async ({ token, newPassword }) => {
      if (token !== "synthetic-valid-token") {
        return {
          data: null,
          error: { message: "synthetic invalid token details" },
        };
      }

      accountPassword = newPassword;
      return { data: { status: true }, error: null };
    },
  });

  assert.deepEqual(result, { status: "failed" });
  assert.equal(accountPassword, "unchanged-password");
  assert.equal(JSON.stringify(result).includes("synthetic invalid token details"), false);
});

test("provider rejection and exceptions never expose provider details", async () => {
  const rejected = await performPasswordResetCompletion({
    ...baseInput,
    resetPassword: async () => ({
      data: { status: false },
      error: { message: "synthetic provider rejection" },
    }),
  });
  const thrown = await performPasswordResetCompletion({
    ...baseInput,
    resetPassword: async () => { throw new Error("synthetic provider exception"); },
  });

  assert.deepEqual(rejected, { status: "failed" });
  assert.deepEqual(thrown, { status: "failed" });
  assert.equal(JSON.stringify(rejected).includes("synthetic provider rejection"), false);
  assert.equal(JSON.stringify(thrown).includes("synthetic provider exception"), false);
});
