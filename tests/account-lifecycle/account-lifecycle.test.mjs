import assert from "node:assert/strict";
import test from "node:test";
import { createBetterAuthOptions } from "../../src/lib/auth/provider.mjs";
import {
  createManagedAccount,
  setManagedAccountActive,
  transferStaffTickets,
} from "../../src/lib/users/managed-account-operations.mjs";
import { canManageRole, listVisibleRoles } from "../../src/lib/users/policy.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const NEXT_STAFF_ID = "00000000-0000-4000-8000-000000000003";
const TENANT_ID = "00000000-0000-4000-8000-000000000004";
const TICKET_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
];

const owner = {
  id: OWNER_ID,
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };

function createRepository() {
  const accounts = new Map([
    [OWNER_ID, { id: OWNER_ID, role: "OWNER", isActive: true, emailVerified: true }],
    [STAFF_ID, { id: STAFF_ID, role: "STAFF", isActive: true, emailVerified: true }],
    [NEXT_STAFF_ID, { id: NEXT_STAFF_ID, role: "STAFF", isActive: true, emailVerified: true }],
    [TENANT_ID, { id: TENANT_ID, role: "TENANT", isActive: true, emailVerified: true }],
  ]);
  const tickets = [
    { id: TICKET_IDS[0], status: "IN_PROGRESS", assignedToId: STAFF_ID, number: "101" },
    { id: TICKET_IDS[1], status: "RECEIVED", assignedToId: STAFF_ID, number: "102" },
    { id: TICKET_IDS[2], status: "RESOLVED", assignedToId: STAFF_ID, number: "103" },
  ];
  const audit = [];
  const sessions = new Set([STAFF_ID]);
  const provisioned = new Map();
  let failTransferAudit = false;

  return {
    accounts,
    tickets,
    audit,
    sessions,
    provisioned,
    set failTransferAudit(value) {
      failTransferAudit = value;
    },
    async provisionAccount({ actorId, account }) {
      const existing = provisioned.get(account.email);
      if (existing) {
        return existing.role === account.role && existing.displayName === account.displayName
          ? { status: "pending" }
          : { status: "conflict" };
      }
      provisioned.set(account.email, {
        ...account,
        emailVerified: false,
        isActive: true,
        mustChangePassword: false,
        createdById: actorId,
      });
      audit.push({ action: "APP_USER_ACCOUNT_CREATED", actorId, role: account.role });
      return { status: "pending" };
    },
    async setAccountActive({ actorId, actorRole, accountId, isActive }) {
      const target = accounts.get(accountId);
      if (!target || !canManageRole(actorRole, target.role) || target.role === "OWNER") {
        return { status: "not-found" };
      }
      if (!isActive && target.role === "STAFF") {
        const count = tickets.filter((ticket) =>
          ticket.assignedToId === target.id && ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED"
        ).length;
        if (count > 0) return { status: "active-tickets", count };
      }
      if (target.isActive === isActive) return { status: "unchanged" };
      target.isActive = isActive;
      if (!isActive) sessions.delete(target.id);
      audit.push({ action: isActive ? "APP_USER_ACTIVATED" : "APP_USER_DEACTIVATED", actorId, entityId: target.id });
      return { status: "updated" };
    },
    async transferStaffTickets({ actorId, sourceStaffId, targetAssigneeId }) {
      const source = accounts.get(sourceStaffId);
      const target = accounts.get(targetAssigneeId);
      if (
        !source || source.role !== "STAFF" ||
        !target || !target.isActive || !["OWNER", "STAFF"].includes(target.role)
      ) {
        return { status: "not-found" };
      }
      const assigned = tickets.filter((ticket) =>
        ticket.assignedToId === sourceStaffId && ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED"
      );
      if (assigned.length === 0) return { status: "transferred", count: 0 };
      if (failTransferAudit) throw new Error("AUDIT_WRITE_FAILED");
      for (const ticket of assigned) {
        ticket.assignedToId = targetAssigneeId;
        audit.push({
          action: "TICKET_ASSIGNMENT_TRANSFERRED",
          actorId,
          entityId: ticket.id,
          fromAssigneeId: sourceStaffId,
          toAssigneeId: targetAssigneeId,
        });
      }
      return { status: "transferred", count: assigned.length };
    },
  };
}

test("Owner creates Staff/Tenant and Staff creates only Tenant through activation email", async () => {
  const repository = createRepository();
  const sent = [];
  const staffResult = await createManagedAccount({
    actor: owner,
    input: { displayName: "  Dira Putri  ", email: " DIRA@KOST.ID ", role: "STAFF" },
    repository,
    sendActivation: async (message) => sent.push(message),
  });
  const tenantResult = await createManagedAccount({
    actor: staff,
    input: { displayName: "Raka Pratama", email: "raka@kost.id", role: "TENANT" },
    repository,
    sendActivation: async (message) => sent.push(message),
  });

  assert.deepEqual(staffResult, { status: "sent" });
  assert.deepEqual(tenantResult, { status: "sent" });
  assert.deepEqual(sent, [
    { email: "dira@kost.id", displayName: "Dira Putri" },
    { email: "raka@kost.id", displayName: "Raka Pratama" },
  ]);
  assert.equal(repository.provisioned.get("dira@kost.id").emailVerified, false);
  assert.equal(repository.provisioned.get("dira@kost.id").mustChangePassword, false);
  assert.equal("password" in repository.provisioned.get("dira@kost.id"), false);
  assert.equal("token" in staffResult, false);
  assert.deepEqual(repository.audit.map((event) => event.action), [
    "APP_USER_ACCOUNT_CREATED",
    "APP_USER_ACCOUNT_CREATED",
  ]);
});

test("Staff cannot create Staff, Tenant cannot manage accounts, and account visibility follows role", async () => {
  const repository = createRepository();
  const sendActivation = async () => assert.fail("Unauthorized account creation sent email");
  const staffAttempt = await createManagedAccount({
    actor: staff,
    input: { displayName: "Dira Putri", email: "dira@kost.id", role: "STAFF" },
    repository,
    sendActivation,
  });
  const tenantAttempt = await createManagedAccount({
    actor: tenant,
    input: { displayName: "Raka Pratama", email: "raka@kost.id", role: "TENANT" },
    repository,
    sendActivation,
  });

  assert.deepEqual(staffAttempt, { status: "invalid" });
  assert.deepEqual(tenantAttempt, { status: "forbidden" });
  assert.deepEqual(listVisibleRoles("OWNER"), ["OWNER", "STAFF", "TENANT"]);
  assert.deepEqual(listVisibleRoles("STAFF"), ["TENANT"]);
  assert.deepEqual(listVisibleRoles("TENANT"), []);
  assert.equal(canManageRole("STAFF", "STAFF"), false);
  assert.equal(canManageRole("STAFF", "TENANT"), true);
});

test("activation email failure is retryable without duplicate account or audit records", async () => {
  const repository = createRepository();
  const input = { displayName: "Dira Putri", email: "dira@kost.id", role: "STAFF" };
  const failed = await createManagedAccount({
    actor: owner,
    input,
    repository,
    sendActivation: async () => { throw new Error("EMAIL_UNAVAILABLE"); },
  });
  const retried = await createManagedAccount({
    actor: owner,
    input,
    repository,
    sendActivation: async () => {},
  });

  assert.deepEqual(failed, { status: "delivery-failed" });
  assert.deepEqual(retried, { status: "sent" });
  assert.equal(repository.provisioned.size, 1);
  assert.equal(repository.audit.length, 1);
});

test("Better Auth blocks unverified sessions and activates an account only after password reset", async () => {
  const verified = new Set();
  const options = createBetterAuthOptions({
    prisma: {},
    baseURL: "https://app.example.invalid",
    secret: "x".repeat(32),
    appOrigin: "https://app.example.invalid",
    emailSender: {
      async sendVerification() {},
      async sendPasswordReset() {},
    },
    isActiveAppUser: async (authSubject) => verified.has(authSubject),
    onPasswordReset: async (authSubject) => { verified.add(authSubject); },
  });

  assert.equal(options.emailAndPassword.disableSignUp, true);
  assert.equal(options.emailAndPassword.requireEmailVerification, true);
  assert.equal(
    await options.databaseHooks.session.create.before({ userId: "pending-account" }),
    false,
  );
  await options.emailAndPassword.onPasswordReset({
    user: { id: "pending-account" },
  });
  assert.equal(
    (await options.databaseHooks.session.create.before({ userId: "pending-account" })).data.userId,
    "pending-account",
  );
});

test("assigned active tickets block Staff deactivation until Owner transfers them", async () => {
  const repository = createRepository();
  const blocked = await setManagedAccountActive({
    actor: owner,
    accountId: STAFF_ID,
    isActive: false,
    repository,
  });

  assert.deepEqual(blocked, { status: "active-tickets", count: 2 });
  assert.equal(repository.accounts.get(STAFF_ID).isActive, true);
  assert.equal(repository.sessions.has(STAFF_ID), true);

  const transferred = await transferStaffTickets({
    actor: owner,
    sourceStaffId: STAFF_ID,
    targetAssigneeId: NEXT_STAFF_ID,
    repository,
  });
  assert.deepEqual(transferred, { status: "transferred", count: 2 });
  assert.deepEqual(
    repository.audit.filter((event) => event.action === "TICKET_ASSIGNMENT_TRANSFERRED").map((event) => event.entityId),
    TICKET_IDS.slice(0, 2),
  );
  assert.equal(repository.tickets[2].assignedToId, STAFF_ID);

  const retry = await transferStaffTickets({
    actor: owner,
    sourceStaffId: STAFF_ID,
    targetAssigneeId: NEXT_STAFF_ID,
    repository,
  });
  assert.deepEqual(retry, { status: "transferred", count: 0 });
  assert.equal(repository.audit.filter((event) => event.action === "TICKET_ASSIGNMENT_TRANSFERRED").length, 2);

  const deactivated = await setManagedAccountActive({
    actor: owner,
    accountId: STAFF_ID,
    isActive: false,
    repository,
  });
  assert.deepEqual(deactivated, { status: "updated" });
  assert.equal(repository.accounts.get(STAFF_ID).isActive, false);
  assert.equal(repository.sessions.has(STAFF_ID), false);
  assert.equal(repository.audit.at(-1).action, "APP_USER_DEACTIVATED");
});

test("ticket transfer requires Owner and an active Owner/Staff target", async () => {
  const repository = createRepository();
  assert.deepEqual(await transferStaffTickets({
    actor: staff,
    sourceStaffId: STAFF_ID,
    targetAssigneeId: NEXT_STAFF_ID,
    repository,
  }), { status: "forbidden" });
  assert.deepEqual(await transferStaffTickets({
    actor: owner,
    sourceStaffId: STAFF_ID,
    targetAssigneeId: TENANT_ID,
    repository,
  }), { status: "not-found" });
  assert.equal(repository.tickets[0].assignedToId, STAFF_ID);
});

test("ticket assignment and its audit history roll back together if audit persistence fails", async () => {
  const repository = createRepository();
  repository.failTransferAudit = true;

  await assert.rejects(
    transferStaffTickets({
      actor: owner,
      sourceStaffId: STAFF_ID,
      targetAssigneeId: NEXT_STAFF_ID,
      repository,
    }),
    /AUDIT_WRITE_FAILED/,
  );
  assert.equal(repository.tickets[0].assignedToId, STAFF_ID);
  assert.equal(repository.audit.length, 0);
});
