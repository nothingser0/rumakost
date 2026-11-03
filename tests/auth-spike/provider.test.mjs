import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";
import { deactivateAccount, inviteAccount } from "../../spikes/neon-auth/lifecycle.mjs";
import { createProvider, migrateProvider } from "../../spikes/neon-auth/provider.mjs";
import { reconcileVerifiedEmailChange } from "../../spikes/neon-auth/policy.mjs";

const databaseUrl = process.env.AUTH_SPIKE_DATABASE_URL;
const projectId = process.env.AUTH_SPIKE_PROJECT_ID;

test("Better Auth account lifecycle on the disposable Neon project", { skip: !databaseUrl }, async (t) => {
  assert.ok(projectId);
  assert.notEqual(projectId, "floral-wind-91503829");

  const parsedDatabaseUrl = new URL(databaseUrl);
  assert.equal(parsedDatabaseUrl.pathname.slice(1), "neon_auth_spike");

  const inbox = [];
  const runTag = randomBytes(6).toString("hex");
  const { auth, pool } = createProvider({
    databaseUrl,
    secret: randomBytes(32).toString("base64url"),
    inbox,
  });

  try {
    const database = await pool.query("SELECT current_database() AS database_name, version() AS version");
    assert.equal(database.rows[0]?.database_name, "neon_auth_spike");

    await migrateProvider(auth);
    const authTables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)",
      [["user", "session", "verification"]],
    );
    const tableNames = new Set(authTables.rows.map(({ table_name }) => table_name));
    assert.ok(tableNames.has("user"));
    assert.ok(tableNames.has("session"));
    assert.ok(tableNames.has("verification"));
    await t.test("provider schema is applied to Neon PostgreSQL", () => {
      assert.ok(tableNames.size >= 3);
    });

    const context = await auth.$context;
    const owner = await context.internalAdapter.createUser({
      email: `owner-${runTag}@example.invalid`,
      name: "Synthetic Owner",
      emailVerified: true,
      role: "admin",
      appRole: "OWNER",
    });
    const staff = await inviteAccount(context, {
      actorRole: owner.appRole,
      email: `staff-${runTag}@example.invalid`,
      name: "Synthetic Staff",
      targetRole: "STAFF",
    });
    const tenant = await inviteAccount(context, {
      actorRole: staff.appRole,
      email: `tenant-${runTag}@example.invalid`,
      name: "Synthetic Tenant",
      targetRole: "TENANT",
    });

    assert.ok(staff);
    assert.ok(tenant);
    assert.equal(await inviteAccount(context, {
      actorRole: tenant.appRole,
      email: `public-${runTag}@example.invalid`,
      name: "Synthetic Public Signup",
      targetRole: "TENANT",
    }), null);

    const publicSignup = await request(auth, "/api/auth/sign-up/email", {
      body: {
        name: "Synthetic Public Signup",
        email: `public-${runTag}@example.invalid`,
        password: "This-is-a-synthetic-password-123!",
      },
    });
    assert.ok(publicSignup.status >= 400);
    assert.equal(await context.internalAdapter.findUserByEmail(`public-${runTag}@example.invalid`), null);
    await request(auth, "/api/auth/sign-in/magic-link", {
      body: { email: `public-${runTag}@example.invalid` },
    });
    const publicMagicLink = takeInboxItem(inbox, "magic-link", `public-${runTag}@example.invalid`);
    assert.ok(publicMagicLink);
    const publicVerification = await verifyMagicLinkResponse(auth, publicMagicLink.token);
    assert.equal(publicVerification.status, 302);
    assert.equal(await context.internalAdapter.findUserByEmail(`public-${runTag}@example.invalid`), null);
    await t.test("public signup is disabled; server-side invitations assign only permitted roles", () => {
      assert.equal(staff.appRole, "STAFF");
      assert.equal(tenant.appRole, "TENANT");
    });

    await request(auth, "/api/auth/sign-in/magic-link", {
      body: { email: owner.email },
    });
    const ownerLink = takeInboxItem(inbox, "magic-link", owner.email);
    assert.ok(ownerLink);
    assert.ok(ownerLink.url.includes("/api/auth/magic-link/verify"));
    const ownerSession = await verifyMagicLink(auth, ownerLink.token);
    assert.equal(ownerSession.user.id, owner.id);
    const ownerSessionResponse = await request(auth, "/api/auth/get-session", {
      method: "GET",
      cookie: ownerSession.cookie,
    });
    assert.equal((await ownerSessionResponse.json()).user.id, owner.id);

    await request(auth, "/api/auth/sign-in/magic-link", {
      body: { email: tenant.email },
    });
    const tenantLink = takeInboxItem(inbox, "magic-link", tenant.email);
    assert.ok(tenantLink);
    const tenantSession = await verifyMagicLink(auth, tenantLink.token);
    assert.equal(tenantSession.user.id, tenant.id);
    assert.ok(tenantSession.cookie);
    await t.test("provider-generated email links authenticate pre-provisioned accounts without temporary passwords", () => {
      assert.equal(ownerSession.user.appRole, "OWNER");
      assert.equal(tenantSession.user.appRole, "TENANT");
    });

    const beforeChange = await context.internalAdapter.findUserById(owner.id);
    const requestedEmail = `tenant-new-${runTag}@example.invalid`;
    const changeEmailResponse = await request(auth, "/api/auth/change-email", {
      body: { newEmail: requestedEmail, userId: tenant.id },
      cookie: ownerSession.cookie,
    });
    if (!changeEmailResponse.ok) {
      const error = await changeEmailResponse.json();
      assert.fail(`change-email request returned ${changeEmailResponse.status}: ${error.code ?? error.message ?? "unknown provider error"}`);
    }
    const oldEmailConfirmation = takeInboxItem(inbox, "old-email-confirmation", owner.email);
    assert.ok(oldEmailConfirmation, "provider did not send the old-email confirmation callback");
    assert.equal(oldEmailConfirmation.newEmail, requestedEmail);
    assert.equal((await context.internalAdapter.findUserById(owner.id)).email, beforeChange.email);

    await verifyEmailToken(auth, oldEmailConfirmation.token);
    const newEmailVerification = takeInboxItem(inbox, "email-verification", requestedEmail);
    assert.ok(newEmailVerification);
    assert.equal((await context.internalAdapter.findUserById(owner.id)).email, beforeChange.email);

    const verifiedResponse = await verifyEmailToken(auth, newEmailVerification.token);
    assert.equal(verifiedResponse.user.id, owner.id);
    const providerOwner = await context.internalAdapter.findUserById(owner.id);
    assert.equal(providerOwner.email, requestedEmail);
    assert.equal(providerOwner.emailVerified, true);
    const mirror = reconcileVerifiedEmailChange(
      { authSubject: owner.id, emailNormalized: beforeChange.email },
      { id: providerOwner.id, email: providerOwner.email, emailVerified: providerOwner.emailVerified },
      requestedEmail,
    );
    assert.equal(mirror.emailNormalized, requestedEmail);
    assert.equal(mirror.authSubject, owner.id);
    assert.deepEqual(
      reconcileVerifiedEmailChange(mirror, {
        id: providerOwner.id,
        email: providerOwner.email,
        emailVerified: providerOwner.emailVerified,
      }, requestedEmail),
      mirror,
    );
    await t.test("email and mirror change only after the provider verifies the requested address", () => {
      assert.equal(providerOwner.emailVerified, true);
      assert.equal(mirror.authSubject, owner.id);
    });

    const tenantSessionResponse = await request(auth, "/api/auth/get-session", {
      method: "GET",
      cookie: tenantSession.cookie,
    });
    assert.equal((await tenantSessionResponse.json()).user.id, tenant.id);

    assert.equal(await deactivateAccount(context, {
      actorRole: staff.appRole,
      targetUserId: owner.id,
    }), false);
    assert.equal(await deactivateAccount(context, {
      actorRole: staff.appRole,
      targetUserId: tenant.id,
    }), true);
    const afterDeactivation = await request(auth, "/api/auth/get-session", {
      method: "GET",
      cookie: tenantSession.cookie,
    });
    assert.equal(await afterDeactivation.json(), null);

    const bannedLoginResponse = await request(auth, "/api/auth/sign-in/magic-link", {
      body: { email: tenant.email },
    });
    assert.ok(bannedLoginResponse.status < 500);
    const bannedLoginLink = takeInboxItem(inbox, "magic-link", tenant.email);
    assert.ok(bannedLoginLink);
    const bannedVerification = await verifyMagicLinkResponse(auth, bannedLoginLink.token);
    assert.equal(bannedVerification.status, 403);
    await t.test("permitted deactivation bans the account and revokes its existing sessions", () => {
      assert.equal(afterDeactivation.status, 200);
      assert.ok(bannedLoginResponse.status < 500);
    });

    await t.test("provider default email-change endpoint is session-scoped", async () => {
      assert.equal(providerOwner.id, owner.id);
      assert.equal(providerOwner.email, requestedEmail);
      assert.equal((await context.internalAdapter.findUserById(tenant.id)).email, tenant.email);
    });
  } finally {
    await pool.end();
  }
});

async function request(auth, path, { body, cookie, method = "POST" } = {}) {
  const headers = new Headers();
  headers.set("origin", "http://localhost:3000");
  if (body) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  return auth.handler(new Request(`http://localhost:3000${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }));
}

async function verifyMagicLink(auth, token) {
  const response = await verifyMagicLinkResponse(auth, token);
  const payload = await response.json();
  const cookie = sessionCookie(response.headers.getSetCookie());
  return { ...payload, cookie };
}

async function verifyMagicLinkResponse(auth, token) {
  return auth.handler(new Request(
    `http://localhost:3000/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`,
  ));
}

async function verifyEmailToken(auth, token) {
  const response = await auth.handler(new Request(
    `http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(token)}`,
  ));
  assert.equal(response.status, 200);
  return response.json();
}

function takeInboxItem(inbox, kind, email) {
  const index = inbox.findIndex((item) => item.kind === kind && item.email === email);
  return index < 0 ? null : inbox.splice(index, 1)[0];
}

function sessionCookie(setCookies) {
  const session = setCookies.find((cookie) => cookie.startsWith("better-auth.session_token="));
  assert.ok(session);
  return session.split(";", 1)[0];
}
