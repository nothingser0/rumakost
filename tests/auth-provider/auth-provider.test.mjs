import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { PrismaNeon } from "@prisma/adapter-neon";
import { authorizeAction } from "../../src/lib/authorization/policy.mjs";
import { handleAuthMutation } from "../../src/lib/auth/auth-route.mjs";
import {
  createBetterAuth,
  createBetterAuthOptions,
} from "../../src/lib/auth/provider.mjs";

const databaseUrl = process.env.AUTH_PROVIDER_TEST_DATABASE_URL;
const appOrigin = "http://localhost:3000";
const password = "Synthetic-password-84!";

assert.ok(databaseUrl, "Disposable Neon test database is required.");

const { PrismaClient } = await import("../../src/generated/prisma/client.ts");
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: databaseUrl }),
});

const fakeEmailSender = (messages) => ({
  async sendVerification(message) {
    messages.push({ kind: "verification", ...message });
  },
  async sendPasswordReset(message) {
    messages.push({ kind: "password-reset", ...message });
  },
});

function createAuth({ messages, disableSignUp = true }) {
  return createBetterAuth({
    prisma,
    baseURL: appOrigin,
    secret: process.env.BETTER_AUTH_SECRET,
    appOrigin,
    emailSender: fakeEmailSender(messages),
    isActiveAppUser: async (authSubject) => {
      const user = await prisma.appUser.findFirst({
        where: { authSubject, isActive: true },
        select: { id: true },
      });
      return user !== null;
    },
    disableSignUp,
  });
}

function makeRequest(path, { method = "POST", body, cookie, origin = appOrigin } = {}) {
  const headers = new Headers();
  if (body !== undefined) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  if (origin !== null) headers.set("origin", origin);

  return new Request(`${appOrigin}/api/auth${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function sessionCookie(response) {
  const header = response.headers.get("set-cookie") ?? "";
  return header.match(/(?:__Secure-)?better-auth\.session_token=[^;,]+/)?.[0] ?? null;
}

test("auth contract disables public signup, uses secure cookies, and gates sessions on active AppUser", async () => {
  const options = createBetterAuthOptions({
    prisma,
    baseURL: "https://app.example.invalid",
    secret: "x".repeat(32),
    appOrigin: "https://app.example.invalid",
    emailSender: fakeEmailSender([]),
    isActiveAppUser: async (authSubject) => authSubject === "active",
  });

  assert.equal(options.emailAndPassword.disableSignUp, true);
  assert.equal(options.emailAndPassword.requireEmailVerification, true);
  assert.equal(options.session.cookieCache.enabled, false);
  assert.equal(options.advanced.useSecureCookies, true);
  assert.equal(options.advanced.defaultCookieAttributes.httpOnly, true);
  assert.equal(options.advanced.defaultCookieAttributes.sameSite, "lax");
  assert.equal(options.advanced.defaultCookieAttributes.secure, true);
  assert.equal(await options.databaseHooks.session.create.before({ userId: "missing" }), false);
  assert.equal(
    (await options.databaseHooks.session.create.before({ userId: "active" })).data.userId,
    "active",
  );
});

test("auth mutations reject missing and cross-origin requests before calling Better Auth", async () => {
  let handlerCalls = 0;
  const handler = async () => {
    handlerCalls += 1;
    return new Response(null, { status: 200 });
  };

  const missingOrigin = await handleAuthMutation(
    makeRequest("/sign-in/email", { origin: null }),
    appOrigin,
    handler,
  );
  const foreignOrigin = await handleAuthMutation(
    makeRequest("/sign-in/email", { origin: "https://other.example.invalid" }),
    appOrigin,
    handler,
  );

  assert.equal(missingOrigin.status, 403);
  assert.equal(foreignOrigin.status, 403);
  assert.equal(handlerCalls, 0);
});

test("Neon-backed auth verifies email, authenticates active AppUser roles, and revokes sessions", async (t) => {
  const messages = [];
  const productionAuth = createAuth({ messages });
  const fixtureAuth = createAuth({ messages, disableSignUp: false });
  const suffix = randomUUID().replaceAll("-", "");
  const email = `tenant-${suffix}@example.invalid`;
  const displayName = "Synthetic Tenant";
  let authSubject;

  try {
    const authTables = await prisma.$queryRaw`
      SELECT table_name::text AS table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY(ARRAY['user', 'session', 'account', 'verification']::text[])
    `;
    assert.equal(new Set(authTables.map(({ table_name }) => table_name)).size, 4);

    const signupResponse = await handleAuthMutation(
      makeRequest("/sign-up/email", {
        body: { name: displayName, email, password },
      }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(signupResponse.status >= 400);
    assert.equal(await prisma.user.findUnique({ where: { email } }), null);

    const fixtureSignup = await fixtureAuth.handler(
      makeRequest("/sign-up/email", {
        body: { name: displayName, email, password },
      }),
    );
    assert.ok(fixtureSignup.status < 400);
    const authUser = await prisma.user.findUnique({ where: { email } });
    assert.ok(authUser);
    authSubject = authUser.id;
    assert.equal(authUser.emailVerified, false);
    assert.equal("role" in authUser, false);

    const verificationMessage = messages.find(
      (message) => message.kind === "verification" && message.email === email,
    );
    assert.ok(verificationMessage);
    const pendingSignIn = await handleAuthMutation(
      makeRequest("/sign-in/email", { body: { email, password } }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(pendingSignIn.status >= 400);

    const verificationResponse = await fixtureAuth.handler(
      new Request(verificationMessage.url, {
        headers: { origin: appOrigin },
      }),
    );
    assert.ok(verificationResponse.status < 400);
    const verifiedUser = await prisma.user.findUnique({ where: { email } });
    assert.equal(verifiedUser.emailVerified, true);

    const appUser = await prisma.appUser.create({
      data: {
        authSubject,
        emailNormalized: email,
        displayName,
        role: "TENANT",
        isActive: true,
        mustChangePassword: false,
      },
    });
    const appActor = {
      id: appUser.id,
      authSubject: appUser.authSubject,
      role: appUser.role,
      isActive: appUser.isActive,
      mustChangePassword: appUser.mustChangePassword,
    };
    assert.equal(authorizeAction(appActor, { roles: ["OWNER"] }).reason, "role-denied");

    await prisma.appUser.update({
      where: { id: appUser.id },
      data: { isActive: false },
    });
    const inactiveSignIn = await handleAuthMutation(
      makeRequest("/sign-in/email", { body: { email, password } }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(inactiveSignIn.status >= 400);
    assert.equal(sessionCookie(inactiveSignIn), null);
    await prisma.appUser.update({
      where: { id: appUser.id },
      data: { isActive: true },
    });

    const badPassword = await handleAuthMutation(
      makeRequest("/sign-in/email", {
        body: { email, password: "Incorrect-synthetic-password" },
      }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(badPassword.status >= 400);
    assert.equal(sessionCookie(badPassword), null);

    const signInResponse = await handleAuthMutation(
      makeRequest("/sign-in/email", { body: { email, password } }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(signInResponse.status < 400);
    const cookie = sessionCookie(signInResponse);
    assert.ok(cookie);
    const rawSetCookie = signInResponse.headers.get("set-cookie") ?? "";
    assert.match(rawSetCookie, /HttpOnly/i);
    assert.match(rawSetCookie, /SameSite=Lax/i);

    const sessionResponse = await productionAuth.handler(
      makeRequest("/get-session", { method: "GET", cookie }),
    );
    const sessionPayload = await sessionResponse.json();
    assert.equal(sessionPayload.user.id, authSubject);
    assert.equal("role" in sessionPayload.user, false);

    const resetRequest = await handleAuthMutation(
      makeRequest("/request-password-reset", {
        body: {
          email,
          redirectTo: `${appOrigin}/reset-sandi`,
        },
      }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(resetRequest.status < 400);
    assert.ok(messages.some((message) => message.kind === "password-reset" && message.email === email));

    const signOut = await handleAuthMutation(
      makeRequest("/sign-out", { cookie }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    assert.ok(signOut.status < 400);
    const revokedSession = await productionAuth.handler(
      makeRequest("/get-session", { method: "GET", cookie }),
    );
    assert.equal(await revokedSession.json(), null);
  } finally {
    if (authSubject) {
      await prisma.appUser.deleteMany({ where: { authSubject } });
      await prisma.user.deleteMany({ where: { id: authSubject } });
    }
    await prisma.$disconnect();
  }
});
