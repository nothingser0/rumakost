import assert from "node:assert/strict";
import test from "node:test";
import {
  completeLoginEmailChange,
  createEmailChangeRepository,
  createEmailChangeToken,
  requestLoginEmailChange,
} from "../../src/lib/auth/email-change-operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const AUTH_OWNER_ID = "20000000-0000-4000-8000-000000000001";
const AUTH_STAFF_ID = "20000000-0000-4000-8000-000000000002";
const AUTH_TENANT_ID = "20000000-0000-4000-8000-000000000003";
const REQUEST_ID = "30000000-0000-4000-8000-000000000001";
const NEXT_REQUEST_ID = "30000000-0000-4000-8000-000000000002";
const SECRET = "s".repeat(48);
const ORIGIN = "https://app.rumakost.example";
const NOW = new Date("2026-11-03T00:00:00.000Z");

const owner = {
  id: OWNER_ID,
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };

function createDatabase() {
  const initialState = {
    appUsers: new Map([
      [OWNER_ID, { id: OWNER_ID, authSubject: AUTH_OWNER_ID, emailNormalized: "owner@kost.id", displayName: "Pemilik", role: "OWNER" }],
      [STAFF_ID, { id: STAFF_ID, authSubject: AUTH_STAFF_ID, emailNormalized: "staff@kost.id", displayName: "Dira Putri", role: "STAFF" }],
      [TENANT_ID, { id: TENANT_ID, authSubject: AUTH_TENANT_ID, emailNormalized: "tenant@kost.id", displayName: "Raka Pratama", role: "TENANT" }],
    ]),
    users: new Map([
      [AUTH_OWNER_ID, { id: AUTH_OWNER_ID, email: "owner@kost.id", emailVerified: true }],
      [AUTH_STAFF_ID, { id: AUTH_STAFF_ID, email: "staff@kost.id", emailVerified: true }],
      [AUTH_TENANT_ID, { id: AUTH_TENANT_ID, email: "tenant@kost.id", emailVerified: true }],
    ]),
    verifications: [],
    audits: [],
    failAudit: false,
  };

  const prisma = {
    async $transaction(callback) {
      const working = structuredClone(initialState);
      const transaction = createTransaction(working);
      const result = await callback(transaction);
      initialState.appUsers = working.appUsers;
      initialState.users = working.users;
      initialState.verifications = working.verifications;
      initialState.audits = working.audits;
      return result;
    },
    get state() {
      return initialState;
    },
  };

  return prisma;

  function createTransaction(state) {
    return {
      async $queryRaw() {
        return [];
      },
      appUser: {
        async findUnique({ where }) {
          if (where.id) return structuredClone(state.appUsers.get(where.id) ?? null);
          if (where.emailNormalized) {
            return structuredClone(
              [...state.appUsers.values()].find((user) => user.emailNormalized === where.emailNormalized) ?? null,
            );
          }
          return null;
        },
        async update({ where, data }) {
          const target = state.appUsers.get(where.id);
          if (!target) throw new Error("APP_USER_NOT_FOUND");
          if ([...state.appUsers.values()].some((user) =>
            user.id !== target.id && user.emailNormalized === data.emailNormalized
          )) {
            throw { code: "P2002" };
          }
          Object.assign(target, data);
          return structuredClone(target);
        },
      },
      user: {
        async findUnique({ where }) {
          return structuredClone(state.users.get(where.id) ?? null);
        },
        async findFirst({ where }) {
          const email = where.email.equals.toLowerCase();
          const excludedId = where.NOT.id;
          return structuredClone(
            [...state.users.values()].find((user) =>
              user.id !== excludedId && user.email.toLowerCase() === email
            ) ?? null,
          );
        },
        async update({ where, data }) {
          const target = state.users.get(where.id);
          if (!target) throw new Error("AUTH_USER_NOT_FOUND");
          if ([...state.users.values()].some((user) =>
            user.id !== target.id && user.email.toLowerCase() === data.email.toLowerCase()
          )) {
            throw { code: "P2002" };
          }
          Object.assign(target, data);
          return structuredClone(target);
        },
      },
      verification: {
        async findMany({ where, take }) {
          return state.verifications
            .filter((row) => row.identifier === where.identifier)
            .sort((left, right) => right.createdAt - left.createdAt)
            .slice(0, take)
            .map((row) => structuredClone(row));
        },
        async findFirst({ where }) {
          return structuredClone(
            state.verifications
              .filter((row) => row.identifier === where.identifier)
              .sort((left, right) => right.createdAt - left.createdAt)[0] ?? null,
          );
        },
        async create({ data }) {
          const row = {
            ...data,
            id: `verification-${state.verifications.length + 1}`,
            createdAt: new Date(NOW.getTime() + state.verifications.length),
          };
          state.verifications.push(row);
          return structuredClone(row);
        },
        async update({ where, data }) {
          const row = state.verifications.find((entry) => entry.id === where.id);
          if (!row) throw new Error("VERIFICATION_NOT_FOUND");
          Object.assign(row, data);
          return structuredClone(row);
        },
        async deleteMany({ where }) {
          const before = state.verifications.length;
          state.verifications = state.verifications.filter((row) =>
            row.identifier !== where.identifier || row.id === where.id.not
          );
          return { count: before - state.verifications.length };
        },
      },
      auditEvent: {
        async create({ data }) {
          if (state.failAudit) throw new Error("AUDIT_WRITE_FAILED");
          state.audits.push(structuredClone(data));
          return structuredClone(data);
        },
      },
    };
  }
}

function setupDatabase() {
  const prisma = createDatabase();
  let idCount = 0;
  const repository = createEmailChangeRepository(prisma, {
    createRequestId: () => [REQUEST_ID, NEXT_REQUEST_ID][idCount++] ?? REQUEST_ID,
  });
  return { prisma, repository };
}

function tokenFrom(message) {
  return new URL(message.url).searchParams.get("token");
}

test("only an active Owner can start login email changes for a Staff or Tenant account", async () => {
  const { repository } = setupDatabase();
  const sent = [];
  const sendVerification = async (message) => sent.push(message);

  assert.deepEqual(await requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email: " DIRABARU@KOST.ID ",
    repository,
    sendVerification,
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  }), { status: "sent" });
  assert.deepEqual(await requestLoginEmailChange({
    actor: owner,
    targetUserId: TENANT_ID,
    email: "raka-baru@kost.id",
    repository,
    sendVerification,
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  }), { status: "sent" });
  assert.deepEqual(await requestLoginEmailChange({
    actor: staff,
    targetUserId: TENANT_ID,
    email: "raka-lain@kost.id",
    repository,
    sendVerification,
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  }), { status: "forbidden" });
  assert.deepEqual(await requestLoginEmailChange({
    actor: tenant,
    targetUserId: TENANT_ID,
    email: "raka-lain@kost.id",
    repository,
    sendVerification,
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  }), { status: "forbidden" });
  assert.deepEqual(sent.map((message) => message.email), ["dirabaru@kost.id", "raka-baru@kost.id"]);
});

test("email delivery failure is retryable with the same token and a single request audit", async () => {
  const { prisma, repository } = setupDatabase();
  const sent = [];
  const input = {
    actor: owner,
    targetUserId: STAFF_ID,
    email: "dira-baru@kost.id",
    repository,
    appOrigin: `${ORIGIN}/`,
    secret: SECRET,
    now: NOW,
  };
  const failed = await requestLoginEmailChange({
    ...input,
    sendVerification: async (message) => {
      sent.push(message);
      throw new Error("EMAIL_UNAVAILABLE");
    },
  });
  const retried = await requestLoginEmailChange({
    ...input,
    sendVerification: async (message) => sent.push(message),
  });

  assert.deepEqual(failed, { status: "delivery-failed" });
  assert.deepEqual(retried, { status: "sent" });
  assert.equal(tokenFrom(sent[0]), tokenFrom(sent[1]));
  assert.equal(prisma.state.audits.length, 1);
  assert.equal(prisma.state.verifications.length, 1);
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "staff@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "staff@kost.id");
});

test("duplicate application or provider emails are rejected without sending or recording an audit", async () => {
  const { prisma, repository } = setupDatabase();
  const sent = [];
  const makeRequest = (email) => requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email,
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  });

  assert.deepEqual(await makeRequest("tenant@kost.id"), { status: "conflict" });
  prisma.state.users.set("20000000-0000-4000-8000-000000000009", {
    id: "20000000-0000-4000-8000-000000000009",
    email: "another@kost.id",
    emailVerified: true,
  });
  assert.deepEqual(await makeRequest("ANOTHER@KOST.ID"), { status: "conflict" });
  assert.equal(sent.length, 0);
  assert.equal(prisma.state.audits.length, 0);
  assert.equal(prisma.state.verifications.length, 0);
});

test("identity and AppUser mirror change only after a valid token and keep authSubject stable", async () => {
  const { prisma, repository } = setupDatabase();
  const sent = [];
  const requested = await requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email: "dira-baru@kost.id",
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  });
  assert.deepEqual(requested, { status: "sent" });
  const token = tokenFrom(sent[0]);
  assert.ok(token);
  assert.equal(token.includes("dira-baru@kost.id"), false);
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "staff@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "staff@kost.id");

  assert.deepEqual(await completeLoginEmailChange({ token: `${token.slice(0, -1)}x`, repository, secret: SECRET, now: NOW }), {
    status: "invalid",
  });
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "staff@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "staff@kost.id");

  assert.deepEqual(await completeLoginEmailChange({ token, repository, secret: SECRET, now: NOW }), {
    status: "completed",
  });
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "dira-baru@kost.id");
  assert.equal(prisma.state.appUsers.get(STAFF_ID).authSubject, AUTH_STAFF_ID);
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "dira-baru@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).emailVerified, true);

  const auditJson = JSON.stringify(prisma.state.audits);
  assert.equal(auditJson.includes("dira-baru@kost.id"), false);
  assert.equal(auditJson.includes(token), false);
  assert.deepEqual(prisma.state.audits.map((event) => event.action), [
    "APP_USER_LOGIN_EMAIL_CHANGE_REQUESTED",
    "APP_USER_LOGIN_EMAIL_CHANGED",
  ]);
  assert.deepEqual(prisma.state.audits[1].safeMetadata, { requestId: REQUEST_ID });
});

test("completion replay is idempotent and does not duplicate the audit event", async () => {
  const { prisma, repository } = setupDatabase();
  const sent = [];
  await requestLoginEmailChange({
    actor: owner,
    targetUserId: TENANT_ID,
    email: "raka-baru@kost.id",
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  });
  const token = tokenFrom(sent[0]);

  assert.deepEqual(await completeLoginEmailChange({ token, repository, secret: SECRET, now: NOW }), {
    status: "completed",
  });
  assert.deepEqual(await completeLoginEmailChange({ token, repository, secret: SECRET, now: NOW }), {
    status: "already-completed",
  });
  assert.equal(prisma.state.audits.filter((event) => event.action === "APP_USER_LOGIN_EMAIL_CHANGED").length, 1);
  assert.equal(JSON.stringify(prisma.state.verifications).includes("raka-baru@kost.id"), false);
});

test("expired, superseded, and conflicting requests do not partially update either identity", async () => {
  const { prisma, repository } = setupDatabase();
  const sent = [];
  const request = (email) => requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email,
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  });
  await request("dira-lama@kost.id");
  const oldToken = tokenFrom(sent[0]);
  await request("dira-baru@kost.id");
  assert.deepEqual(await completeLoginEmailChange({ token: oldToken, repository, secret: SECRET, now: NOW }), {
    status: "invalid",
  });

  const latestToken = tokenFrom(sent[1]);
  prisma.state.users.set("20000000-0000-4000-8000-000000000009", {
    id: "20000000-0000-4000-8000-000000000009",
    email: "dira-baru@kost.id",
    emailVerified: true,
  });
  assert.deepEqual(await completeLoginEmailChange({ token: latestToken, repository, secret: SECRET, now: NOW }), {
    status: "conflict",
  });
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "staff@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "staff@kost.id");

  const expired = await completeLoginEmailChange({
    token: latestToken,
    repository,
    secret: SECRET,
    now: new Date(NOW.getTime() + 25 * 60 * 60 * 1000),
  });
  assert.deepEqual(expired, { status: "expired" });
});

test("request and completion audit failures roll back pending state and identity writes", async () => {
  const { prisma, repository } = setupDatabase();
  prisma.state.failAudit = true;
  const sent = [];

  await assert.rejects(requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email: "dira-baru@kost.id",
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  }), /AUDIT_WRITE_FAILED/);
  assert.equal(prisma.state.verifications.length, 0);
  assert.equal(sent.length, 0);

  prisma.state.failAudit = false;
  await requestLoginEmailChange({
    actor: owner,
    targetUserId: STAFF_ID,
    email: "dira-baru@kost.id",
    repository,
    sendVerification: async (message) => sent.push(message),
    appOrigin: ORIGIN,
    secret: SECRET,
    now: NOW,
  });
  const token = tokenFrom(sent[0]);
  prisma.state.failAudit = true;
  await assert.rejects(
    completeLoginEmailChange({ token, repository, secret: SECRET, now: NOW }),
    /AUDIT_WRITE_FAILED/,
  );
  assert.equal(prisma.state.appUsers.get(STAFF_ID).emailNormalized, "staff@kost.id");
  assert.equal(prisma.state.users.get(AUTH_STAFF_ID).email, "staff@kost.id");
  assert.equal(JSON.parse(prisma.state.verifications[0].value).status, "pending");
});

test("the signed token binds to the requested target and rejects malformed input", async () => {
  const token = createEmailChangeToken({ targetUserId: STAFF_ID, requestId: REQUEST_ID, secret: SECRET });
  assert.equal(token.includes("@"), false);
  assert.equal(token.split(".").length, 3);
  assert.throws(() => createEmailChangeToken({ targetUserId: "not-a-uuid", requestId: REQUEST_ID, secret: SECRET }));
  assert.deepEqual(await completeLoginEmailChange({
    token,
    repository: { async completeChange() { return { status: "completed" }; } },
    secret: "wrong".repeat(8),
    now: NOW,
  }), { status: "invalid" });
});
