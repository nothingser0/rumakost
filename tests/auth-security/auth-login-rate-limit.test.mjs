import assert from "node:assert/strict";
import test from "node:test";
import {
  isCredentialAuthError,
  performRateLimitedLogin,
} from "../../src/lib/auth/rate-limited-login.mjs";

test("blocks a reserved account before calling the auth provider", async () => {
  let providerCalls = 0;

  const result = await performRateLimitedLogin({
    email: "OWNER@example.test",
    findAccountId: async (email) => {
      assert.equal(email, "owner@example.test");
      return "app-user-id";
    },
    reserveAttempt: async () => ({ allowed: false }),
    authenticate: async () => {
      providerCalls += 1;
      return "invalid";
    },
    recordFailure: async () => undefined,
    recordSuccess: async () => undefined,
  });

  assert.deepEqual(result, { status: "invalid" });
  assert.equal(providerCalls, 0);
});

test("records failed credentials after reserving an account attempt", async () => {
  const calls = [];

  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => {
      calls.push("find");
      return "app-user-id";
    },
    reserveAttempt: async () => {
      calls.push("reserve");
      return { allowed: true };
    },
    authenticate: async () => {
      calls.push("authenticate");
      return "invalid";
    },
    recordFailure: async () => calls.push("failure"),
    recordSuccess: async () => calls.push("success"),
  });

  assert.deepEqual(result, { status: "invalid" });
  assert.deepEqual(calls, ["find", "reserve", "authenticate", "failure"]);
});

test("clears progressive failures after successful authentication", async () => {
  const calls = [];

  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => "app-user-id",
    reserveAttempt: async () => ({ allowed: true }),
    authenticate: async () => {
      calls.push("authenticate");
      return "success";
    },
    recordFailure: async () => calls.push("failure"),
    recordSuccess: async (appUserId) => calls.push(`success:${appUserId}`),
  });

  assert.deepEqual(result, { status: "success", appUserId: "app-user-id" });
  assert.deepEqual(calls, ["authenticate", "success:app-user-id"]);
});

test("uses the provider for an unknown app account without storing an identity key", async () => {
  let providerCalls = 0;
  let limiterCalls = 0;

  const result = await performRateLimitedLogin({
    email: "unknown@example.test",
    findAccountId: async () => null,
    reserveAttempt: async () => {
      limiterCalls += 1;
      return { allowed: true };
    },
    authenticate: async () => {
      providerCalls += 1;
      return "invalid";
    },
    recordFailure: async () => {
      limiterCalls += 1;
    },
    recordSuccess: async () => {
      limiterCalls += 1;
    },
  });

  assert.deepEqual(result, { status: "invalid" });
  assert.equal(providerCalls, 1);
  assert.equal(limiterCalls, 0);
});

test("fails closed before provider authentication when account lookup fails", async () => {
  let providerCalls = 0;

  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => {
      throw new Error("database unavailable");
    },
    reserveAttempt: async () => ({ allowed: true }),
    authenticate: async () => {
      providerCalls += 1;
      return "success";
    },
    recordFailure: async () => undefined,
    recordSuccess: async () => undefined,
  });

  assert.deepEqual(result, { status: "unavailable" });
  assert.equal(providerCalls, 0);
});

test("fails closed before provider authentication when attempt reservation fails", async () => {
  let providerCalls = 0;

  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => "app-user-id",
    reserveAttempt: async () => {
      throw new Error("database unavailable");
    },
    authenticate: async () => {
      providerCalls += 1;
      return "success";
    },
    recordFailure: async () => undefined,
    recordSuccess: async () => undefined,
  });

  assert.deepEqual(result, { status: "unavailable" });
  assert.equal(providerCalls, 0);
});

test("does not record a progressive credential failure when the provider is unavailable", async () => {
  let recordedFailures = 0;

  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => "app-user-id",
    reserveAttempt: async () => ({ allowed: true }),
    authenticate: async () => "unavailable",
    recordFailure: async () => {
      recordedFailures += 1;
    },
    recordSuccess: async () => undefined,
  });

  assert.deepEqual(result, { status: "unavailable" });
  assert.equal(recordedFailures, 0);
});

test("fails closed when an invalid credential cannot update the account limiter", async () => {
  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => "app-user-id",
    reserveAttempt: async () => ({ allowed: true }),
    authenticate: async () => "invalid",
    recordFailure: async () => {
      throw new Error("database unavailable");
    },
    recordSuccess: async () => undefined,
  });

  assert.deepEqual(result, { status: "unavailable" });
});

test("marks a successful provider login for sign-out when the limiter reset fails", async () => {
  const result = await performRateLimitedLogin({
    email: "tenant@example.test",
    findAccountId: async () => "app-user-id",
    reserveAttempt: async () => ({ allowed: true }),
    authenticate: async () => "success",
    recordFailure: async () => undefined,
    recordSuccess: async () => {
      throw new Error("database unavailable");
    },
  });

  assert.deepEqual(result, { status: "authenticated-but-unavailable" });
});

test("counts invalid credentials without treating provider outages as password failures", () => {
  assert.equal(isCredentialAuthError({ status: 401 }), true);
  assert.equal(isCredentialAuthError({ code: "INVALID_EMAIL_OR_PASSWORD" }), true);
  assert.equal(isCredentialAuthError({ code: "invalid_credentials" }), true);
  assert.equal(isCredentialAuthError({ status: 503 }), false);
  assert.equal(isCredentialAuthError({ status: 429 }), false);
  assert.equal(isCredentialAuthError(null), false);
});
