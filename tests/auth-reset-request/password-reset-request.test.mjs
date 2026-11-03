import assert from "node:assert/strict";
import test from "node:test";
import { performPasswordResetRequest } from "../../src/lib/auth/password-reset-request.mjs";

test("rejects invalid email input without contacting the provider", async () => {
  let providerCalled = false;

  const result = await performPasswordResetRequest({
    rawEmail: "not-an-email",
    appOrigin: "https://rumakost.example",
    requestReset: async () => { providerCalled = true; },
  });

  assert.deepEqual(result, { status: "invalid" });
  assert.equal(providerCalled, false);
});

test("trims the email and fixes the provider callback to the app reset route", async () => {
  let request;

  const result = await performPasswordResetRequest({
    rawEmail: "  tenant@example.test  ",
    appOrigin: "https://rumakost.example",
    requestReset: async (input) => {
      request = input;
      return { data: { status: true }, error: null };
    },
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.deepEqual(request, {
    email: "tenant@example.test",
    redirectTo: "https://rumakost.example/reset-sandi",
  });
});

test("returns the same accepted state for known and unknown accounts", async () => {
  const providerResponses = [
    { data: { status: true, message: "If this email exists, check your email" }, error: null },
    { data: { status: true, message: "If this email exists, check your email" }, error: null },
  ];

  const results = await Promise.all(providerResponses.map((response, index) =>
    performPasswordResetRequest({
      rawEmail: index === 0 ? "known@example.test" : "unknown@example.test",
      appOrigin: "https://rumakost.example",
      requestReset: async () => response,
    }),
  ));

  assert.deepEqual(results, [{ status: "accepted" }, { status: "accepted" }]);
});

test("provider errors do not change the generic response or expose details", async () => {
  const result = await performPasswordResetRequest({
    rawEmail: "tenant@example.test",
    appOrigin: "https://rumakost.example",
    requestReset: async () => ({
      data: null,
      error: { message: "provider detail must stay server-side" },
    }),
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.equal(JSON.stringify(result).includes("tenant@example.test"), false);
  assert.equal(JSON.stringify(result).includes("provider detail"), false);
});

test("provider exceptions keep the same generic response", async () => {
  const result = await performPasswordResetRequest({
    rawEmail: "tenant@example.test",
    appOrigin: "https://rumakost.example",
    requestReset: async () => { throw new Error("synthetic provider failure"); },
  });

  assert.deepEqual(result, { status: "accepted" });
});
