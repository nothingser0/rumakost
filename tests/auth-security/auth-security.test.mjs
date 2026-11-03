import assert from "node:assert/strict";
import test from "node:test";
import {
  isSameOriginAuthMutation,
  runSameOriginAuthMutation,
} from "../../src/lib/auth/request-origin.mjs";
import { performPasswordResetRequest } from "../../src/lib/auth/password-reset-request.mjs";

test("requires a serialized same-origin Origin header for auth mutations", () => {
  assert.equal(isSameOriginAuthMutation("https://rumakost.example", "https://rumakost.example"), true);
  assert.equal(isSameOriginAuthMutation("https://rumakost.example/", "https://rumakost.example"), true);
  assert.equal(isSameOriginAuthMutation(null, "https://rumakost.example"), false);
  assert.equal(isSameOriginAuthMutation("null", "https://rumakost.example"), false);
  assert.equal(isSameOriginAuthMutation("https://attacker.example", "https://rumakost.example"), false);
  assert.equal(isSameOriginAuthMutation("https://rumakost.example.evil", "https://rumakost.example"), false);
  assert.equal(isSameOriginAuthMutation("http://rumakost.example", "https://rumakost.example"), false);
  assert.equal(isSameOriginAuthMutation("https://rumakost.example:8443", "https://rumakost.example"), false);
});

test("rejects malformed configured origins before running an auth mutation", async () => {
  let operationCalls = 0;

  const result = await runSameOriginAuthMutation({
    originHeader: "https://rumakost.example",
    appOrigin: "https://rumakost.example/path",
    rejectedValue: "rejected",
    operation: async () => {
      operationCalls += 1;
      return "executed";
    },
  });

  assert.equal(result, "rejected");
  assert.equal(operationCalls, 0);
});

test("does not invoke the auth provider for cross-origin or missing-origin mutations", async () => {
  let providerCalls = 0;

  for (const originHeader of [null, "https://attacker.example"]) {
    const result = await runSameOriginAuthMutation({
      originHeader,
      appOrigin: "https://rumakost.example",
      rejectedValue: { status: "rejected" },
      operation: async () => {
        providerCalls += 1;
        return { status: "executed" };
      },
    });

    assert.deepEqual(result, { status: "rejected" });
  }

  assert.equal(providerCalls, 0);
});

test("same-origin requests can invoke the auth provider", async () => {
  let providerCalls = 0;

  const result = await runSameOriginAuthMutation({
    originHeader: "https://rumakost.example",
    appOrigin: "https://rumakost.example",
    rejectedValue: { status: "rejected" },
    operation: async () => {
      providerCalls += 1;
      return { status: "executed" };
    },
  });

  assert.deepEqual(result, { status: "executed" });
  assert.equal(providerCalls, 1);
});

test("password reset callback remains on APP_ORIGIN despite a hostile returnTo field", async () => {
  let providerRequest;

  const result = await performPasswordResetRequest({
    rawEmail: "tenant@example.test",
    rawReturnTo: "https://attacker.example/steal",
    appOrigin: "https://rumakost.example",
    requestReset: async (input) => {
      providerRequest = input;
      return { data: { status: true }, error: null };
    },
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.deepEqual(providerRequest, {
    email: "tenant@example.test",
    redirectTo: "https://rumakost.example/reset-sandi",
  });
});

test("password reset remains non-enumerating when the provider rejects or throws", async () => {
  const rejected = await performPasswordResetRequest({
    rawEmail: "known@example.test",
    appOrigin: "https://rumakost.example",
    requestReset: async () => ({ data: null, error: { message: "provider detail" } }),
  });
  const thrown = await performPasswordResetRequest({
    rawEmail: "unknown@example.test",
    appOrigin: "https://rumakost.example",
    requestReset: async () => { throw new Error("provider detail"); },
  });

  assert.deepEqual(rejected, { status: "accepted" });
  assert.deepEqual(thrown, { status: "accepted" });
});
