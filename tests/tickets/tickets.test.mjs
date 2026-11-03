import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  addTicketComment,
  assignTicket,
  cancelTicket,
  createTicketDraft,
  discardTicketDraft,
  expireTicketDrafts,
  getTicket,
  listTickets,
  reopenTicket,
  submitTicketDraft,
  updateTicket,
} from "../../src/lib/tickets/operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const OTHER_TENANT_ID = "00000000-0000-4000-8000-000000000004";
const ROOM_ID = "00000000-0000-4000-8000-000000000010";
const LEASE_ID = "00000000-0000-4000-8000-000000000020";
const TICKET_ID = "00000000-0000-4000-8000-000000000030";

const owner = { id: OWNER_ID, role: "OWNER", isActive: true, mustChangePassword: false };
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };
const otherTenant = { ...tenant, id: OTHER_TENANT_ID };

function ticketSummary(overrides = {}) {
  return {
    id: TICKET_ID,
    ticketNumber: "30",
    ticketLabel: "TKT-202611-0030",
    roomId: ROOM_ID,
    roomCode: "A-01",
    leaseId: LEASE_ID,
    createdById: TENANT_ID,
    createdByName: "Tenant Fixture",
    assignedToId: null,
    assignedToName: null,
    title: "Kunci pintu macet",
    category: "DOORS_LOCKS",
    priority: "NORMAL",
    status: "DRAFT",
    targetCompletionOn: null,
    closedAt: null,
    createdAt: "2026-11-03T01:00:00.000Z",
    updatedAt: "2026-11-03T01:00:00.000Z",
    ...overrides,
  };
}

function mutationResult(status = "RECEIVED") {
  return {
    ticketId: TICKET_ID,
    status,
    updatedAt: "2026-11-03T01:00:00.000Z",
  };
}

function ticketDetail(overrides = {}) {
  return {
    ...ticketSummary({ status: "RECEIVED" }),
    description: "Kunci sulit diputar dari sisi dalam.",
    resolutionSummary: null,
    cancellationReason: null,
    cancelledAt: null,
    reopenedAt: null,
    statusChangedById: STAFF_ID,
    comments: [
      {
        id: "00000000-0000-4000-8000-000000000041",
        authorId: STAFF_ID,
        authorName: "Staff Fixture",
        authorRole: "STAFF",
        body: "Vendor belum memberi estimasi.",
        visibility: "INTERNAL",
        createdAt: "2026-11-03T01:10:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000042",
        authorId: TENANT_ID,
        authorName: "Tenant Fixture",
        authorRole: "TENANT",
        body: "Saya bisa dihubungi sore ini.",
        visibility: "TENANT_VISIBLE",
        createdAt: "2026-11-03T01:20:00.000Z",
      },
    ],
    attachments: [
      {
        id: "00000000-0000-4000-8000-000000000051",
        commentId: "00000000-0000-4000-8000-000000000041",
        uploadedById: STAFF_ID,
        mimeType: "image/jpeg",
        sizeBytes: "1024",
        durationSeconds: null,
        uploadStatus: "AVAILABLE",
        createdAt: "2026-11-03T01:10:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000052",
        commentId: "00000000-0000-4000-8000-000000000042",
        uploadedById: TENANT_ID,
        mimeType: "image/jpeg",
        sizeBytes: "2048",
        durationSeconds: null,
        uploadStatus: "AVAILABLE",
        createdAt: "2026-11-03T01:20:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000053",
        commentId: null,
        uploadedById: TENANT_ID,
        mimeType: "image/jpeg",
        sizeBytes: "4096",
        durationSeconds: null,
        uploadStatus: "AVAILABLE",
        createdAt: "2026-11-03T01:30:00.000Z",
      },
    ],
    statusEvents: [],
    ...overrides,
  };
}

function repository(overrides = {}) {
  const calls = [];
  const repo = {
    async createTicketDraft(input) {
      calls.push(["createTicketDraft", input]);
      return ticketSummary();
    },
    async listTickets(input) {
      calls.push(["listTickets", input]);
      return [];
    },
    async getTicket(input) {
      calls.push(["getTicket", input]);
      return null;
    },
    async submitTicketDraft(input) {
      calls.push(["submitTicketDraft", input]);
      return mutationResult("RECEIVED");
    },
    async discardTicketDraft(input) {
      calls.push(["discardTicketDraft", input]);
      return mutationResult("CANCELLED");
    },
    async updateTicket(input) {
      calls.push(["updateTicket", input]);
      return mutationResult("IN_PROGRESS");
    },
    async assignTicket(input) {
      calls.push(["assignTicket", input]);
      return mutationResult("ASSIGNED");
    },
    async cancelTicket(input) {
      calls.push(["cancelTicket", input]);
      return mutationResult("CANCELLED");
    },
    async reopenTicket(input) {
      calls.push(["reopenTicket", input]);
      return mutationResult("IN_PROGRESS");
    },
    async addTicketComment(input) {
      calls.push(["addTicketComment", input]);
      return {
        commentId: randomUUID(),
        ticketId: TICKET_ID,
        visibility: input.visibility,
        createdAt: "2026-11-03T01:00:00.000Z",
      };
    },
    async expireTicketDrafts() {
      calls.push(["expireTicketDrafts", {}]);
      return { expiredTickets: 2, queuedAttachments: 1 };
    },
    ...overrides,
  };
  return { repo, calls };
}

function expectDomainError(code) {
  return (error) => error instanceof DomainError && error.code === code;
}

function ticketInput(extra = {}) {
  return { ticketId: TICKET_ID, idempotencyKey: randomUUID(), ...extra };
}

test("createTicketDraft binds the authenticated actor and stable request fingerprint", async () => {
  const { repo, calls } = repository();
  const result = await createTicketDraft({
    actor: tenant,
    input: {
      roomId: ROOM_ID,
      leaseId: LEASE_ID,
      category: "DOORS_LOCKS",
      title: "Kunci pintu macet",
      description: "Kunci sulit diputar dari sisi dalam.",
      priority: "NORMAL",
      idempotencyKey: randomUUID(),
    },
    repository: repo,
  });

  assert.equal(result.status, "DRAFT");
  assert.equal(calls[0][1].actorId, TENANT_ID);
  assert.match(calls[0][1].requestHash, /^[a-f0-9]{64}$/);
  assert.equal(calls[0][1].actorRole, undefined);
});

test("createTicketDraft fingerprints business data independently from its idempotency key", async () => {
  const { repo, calls } = repository();
  const idempotencyKey = randomUUID();
  const input = {
    roomId: ROOM_ID,
    leaseId: LEASE_ID,
    category: "AC",
    title: "AC mati",
    description: "Unit tidak menyala.",
    priority: "NORMAL",
    idempotencyKey,
  };
  await createTicketDraft({ actor: tenant, input, repository: repo });
  await createTicketDraft({ actor: tenant, input, repository: repo });
  assert.equal(calls[0][1].idempotencyKey, idempotencyKey);
  assert.equal(calls[1][1].idempotencyKey, idempotencyKey);
  assert.equal(calls[0][1].requestHash, calls[1][1].requestHash);
});

test("idempotent create replay returns one ticket and does not duplicate the audit fixture", async () => {
  const records = new Map();
  const audits = [];
  const { repo } = repository({
    async createTicketDraft(input) {
      const existing = records.get(input.idempotencyKey);
      if (existing) {
        if (existing.requestHash !== input.requestHash) throw new DomainError("CONFLICT");
        return existing.result;
      }
      const result = ticketSummary({ id: randomUUID() });
      records.set(input.idempotencyKey, { requestHash: input.requestHash, result });
      audits.push({ action: "TICKET_DRAFT_CREATED", ticketId: result.id });
      return result;
    },
  });
  const idempotencyKey = randomUUID();
  const commonInput = {
    roomId: ROOM_ID,
    leaseId: LEASE_ID,
    category: "AC",
    title: "AC mati",
    description: "Unit tidak menyala.",
    priority: "NORMAL",
    idempotencyKey,
  };

  const first = await createTicketDraft({ actor: tenant, input: commonInput, repository: repo });
  const replay = await createTicketDraft({ actor: tenant, input: commonInput, repository: repo });
  assert.equal(replay.id, first.id);
  assert.equal(audits.length, 1);
  await assert.rejects(createTicketDraft({
    actor: tenant,
    input: { ...commonInput, description: "Deskripsi berbeda." },
    repository: repo,
  }), expectDomainError("CONFLICT"));
  assert.equal(audits.length, 1);
});

test("inactive actors and forced password change cannot create tickets", async () => {
  const { repo, calls } = repository();
  const input = {
    roomId: ROOM_ID,
    leaseId: LEASE_ID,
    category: "AC",
    title: "AC mati",
    description: "Unit tidak menyala.",
    priority: "NORMAL",
    idempotencyKey: randomUUID(),
  };

  await assert.rejects(createTicketDraft({
    actor: { ...tenant, isActive: false }, input, repository: repo,
  }), expectDomainError("UNAUTHENTICATED"));
  await assert.rejects(createTicketDraft({
    actor: { ...tenant, mustChangePassword: true }, input, repository: repo,
  }), expectDomainError("UNAUTHENTICATED"));
  assert.equal(calls.length, 0);
});

test("invalid draft input is rejected before persistence", async () => {
  const { repo, calls } = repository();
  await assert.rejects(createTicketDraft({
    actor: owner,
    input: {
      roomId: ROOM_ID,
      category: "UNKNOWN",
      title: "",
      description: "Deskripsi",
      priority: "NORMAL",
      idempotencyKey: randomUUID(),
    },
    repository: repo,
  }), (error) => error.name === "ZodError");
  assert.equal(calls.length, 0);
});

test("listTickets requests one extra row and builds a stable next cursor", async () => {
  const first = ticketSummary();
  const second = ticketSummary({ id: randomUUID(), createdAt: "2026-11-02T01:00:00.000Z" });
  const { repo, calls } = repository({ async listTickets(input) {
    calls.push(["listTickets", input]);
    return [first, second];
  } });

  const result = await listTickets({ actor: owner, input: { limit: 1 }, repository: repo });
  assert.equal(calls[0][1].limit, 2);
  assert.equal(result.items.length, 1);
  assert.deepEqual(result.nextCursor, { createdAt: first.createdAt, id: first.id });
});

test("listTickets rejects pagination beyond the approved cap", async () => {
  const { repo, calls } = repository();
  await assert.rejects(listTickets({
    actor: owner, input: { limit: 101 }, repository: repo,
  }), (error) => error.name === "ZodError");
  assert.equal(calls.length, 0);
});

test("Tenant ticket lists suppress drafts created by other users", async () => {
  const ownDraft = ticketSummary();
  const otherDraft = ticketSummary({ id: randomUUID(), createdById: OTHER_TENANT_ID });
  const { repo } = repository({ async listTickets() { return [ownDraft, otherDraft]; } });
  const result = await listTickets({ actor: tenant, input: {}, repository: repo });
  assert.deepEqual(result.items.map((item) => item.createdById), [TENANT_ID]);
});

test("getTicket maps an inaccessible or missing ticket to the non-enumerating error", async () => {
  const { repo } = repository();
  await assert.rejects(getTicket({
    actor: otherTenant,
    input: { ticketId: TICKET_ID },
    repository: repo,
  }), expectDomainError("TICKET_NOT_FOUND"));
});

test("Tenant details never expose internal comment bodies or their attachments", async () => {
  const { repo, calls } = repository({
    async getTicket(input) {
      calls.push(["getTicket", input]);
      return ticketDetail();
    },
  });
  const result = await getTicket({
    actor: tenant,
    input: { ticketId: TICKET_ID },
    repository: repo,
  });

  assert.deepEqual(result.comments.map((comment) => comment.visibility), ["TENANT_VISIBLE"]);
  assert.deepEqual(result.attachments.map((attachment) => attachment.id), [
    "00000000-0000-4000-8000-000000000052",
    "00000000-0000-4000-8000-000000000053",
  ]);
  assert.equal(calls[0][1].actorId, TENANT_ID);
  assert.equal(calls[0][1].role, "TENANT");
});

test("Tenant cannot read another user's draft even if a repository returns it", async () => {
  const { repo } = repository({ async getTicket() {
    return ticketDetail({ status: "DRAFT", createdById: OTHER_TENANT_ID });
  } });
  await assert.rejects(getTicket({
    actor: tenant,
    input: { ticketId: TICKET_ID },
    repository: repo,
  }), expectDomainError("TICKET_NOT_FOUND"));
});

test("submitTicketDraft includes the authenticated role and request fingerprint", async () => {
  const { repo, calls } = repository();
  const input = ticketInput();
  const result = await submitTicketDraft({ actor: tenant, input, repository: repo });

  assert.equal(result.status, "RECEIVED");
  assert.equal(calls[0][1].actorId, TENANT_ID);
  assert.equal(calls[0][1].actorRole, "TENANT");
  assert.match(calls[0][1].requestHash, /^[a-f0-9]{64}$/);
});

test("submitTicketDraft passes through media and active-Lease failures from storage logic", async () => {
  const noMedia = repository({ async submitTicketDraft() {
    throw new DomainError("MEDIA_REQUIRED");
  } });
  await assert.rejects(submitTicketDraft({
    actor: owner, input: ticketInput(), repository: noMedia.repo,
  }), expectDomainError("MEDIA_REQUIRED"));

  const inactiveLease = repository({ async submitTicketDraft() {
    throw new DomainError("LEASE_NOT_ACTIVE");
  } });
  await assert.rejects(submitTicketDraft({
    actor: tenant, input: ticketInput(), repository: inactiveLease.repo,
  }), expectDomainError("LEASE_NOT_ACTIVE"));
});

test("discardTicketDraft requires a reason and persists tenant ownership context", async () => {
  const { repo, calls } = repository();
  await assert.rejects(discardTicketDraft({
    actor: tenant, input: ticketInput(), repository: repo,
  }), (error) => error.name === "ZodError");
  assert.equal(calls.length, 0);

  const result = await discardTicketDraft({
    actor: tenant,
    input: ticketInput({ reason: "Tidak jadi dilaporkan." }),
    repository: repo,
  });
  assert.equal(result.status, "CANCELLED");
  assert.equal(calls[0][1].actorRole, "TENANT");
  assert.equal(calls[0][1].reason, "Tidak jadi dilaporkan.");
});

test("updateTicket is restricted to Owner and Staff", async () => {
  const { repo, calls } = repository();
  await assert.rejects(updateTicket({
    actor: tenant,
    input: ticketInput({ priority: "URGENT" }),
    repository: repo,
  }), expectDomainError("FORBIDDEN"));
  assert.equal(calls.length, 0);

  await updateTicket({
    actor: staff,
    input: ticketInput({ targetCompletionOn: "2026-11-10" }),
    repository: repo,
  });
  assert.equal(calls[0][0], "updateTicket");
  assert.equal(calls[0][1].actorId, STAFF_ID);
});

test("state transition conflicts are returned without exposing persistence details", async () => {
  const { repo } = repository({ async updateTicket() {
    throw new DomainError("INVALID_TRANSITION");
  } });
  await assert.rejects(updateTicket({
    actor: staff,
    input: ticketInput({ status: "RESOLVED", resolutionSummary: "Selesai" }),
    repository: repo,
  }), expectDomainError("INVALID_TRANSITION"));
});

test("assignTicket permits internal roles and rejects malformed assignee IDs", async () => {
  const { repo, calls } = repository();
  await assert.rejects(assignTicket({
    actor: tenant,
    input: ticketInput({ assignedToId: STAFF_ID }),
    repository: repo,
  }), expectDomainError("FORBIDDEN"));
  await assert.rejects(assignTicket({
    actor: owner,
    input: ticketInput({ assignedToId: "not-a-uuid" }),
    repository: repo,
  }), (error) => error.name === "ZodError");
  assert.equal(calls.length, 0);

  const result = await assignTicket({
    actor: staff,
    input: ticketInput({ assignedToId: OWNER_ID }),
    repository: repo,
  });
  assert.equal(result.status, "ASSIGNED");
});

test("manual cancellation cannot use the reserved system expiry reason", async () => {
  const { repo, calls } = repository();
  await assert.rejects(cancelTicket({
    actor: owner,
    input: ticketInput({ reason: "DRAFT_EXPIRED" }),
    repository: repo,
  }), expectDomainError("CONFLICT"));
  assert.equal(calls.length, 0);
});

test("cancelled tickets stay terminal", async () => {
  const { repo } = repository({ async cancelTicket() {
    throw new DomainError("CANCELLED_TERMINAL");
  } });
  await assert.rejects(cancelTicket({
    actor: staff,
    input: ticketInput({ reason: "Permintaan ditutup." }),
    repository: repo,
  }), expectDomainError("CANCELLED_TERMINAL"));
});

test("reopenTicket is Owner-only", async () => {
  const { repo, calls } = repository();
  await assert.rejects(reopenTicket({
    actor: staff, input: ticketInput(), repository: repo,
  }), expectDomainError("OWNER_REQUIRED"));
  assert.equal(calls.length, 0);
  assert.equal((await reopenTicket({
    actor: owner, input: ticketInput(), repository: repo,
  })).status, "IN_PROGRESS");
});

test("Tenant cannot create an internal comment", async () => {
  const { repo, calls } = repository();
  await assert.rejects(addTicketComment({
    actor: tenant,
    input: ticketInput({ body: "Catatan internal", visibility: "INTERNAL" }),
    repository: repo,
  }), expectDomainError("FORBIDDEN_VISIBILITY"));
  assert.equal(calls.length, 0);
});

test("Tenant comments are persisted as tenant-visible and include actor identity", async () => {
  const { repo, calls } = repository();
  const result = await addTicketComment({
    actor: tenant,
    input: ticketInput({ body: "Saya bisa dihubungi sore ini.", visibility: "TENANT_VISIBLE" }),
    repository: repo,
  });
  assert.equal(result.visibility, "TENANT_VISIBLE");
  assert.equal(calls[0][1].actorId, TENANT_ID);
  assert.equal(calls[0][1].actorRole, "TENANT");
});

test("Tenant comments are rejected after their lease ends", async () => {
  const { repo } = repository({ async addTicketComment() {
    throw new DomainError("LEASE_ENDED");
  } });
  await assert.rejects(addTicketComment({
    actor: tenant,
    input: ticketInput({ body: "Terima kasih.", visibility: "TENANT_VISIBLE" }),
    repository: repo,
  }), expectDomainError("LEASE_ENDED"));
});

test("malformed repository records fail closed", async () => {
  const { repo } = repository({ async updateTicket() { return { status: "RESOLVED" }; } });
  await assert.rejects(updateTicket({
    actor: owner,
    input: ticketInput({ priority: "URGENT" }),
    repository: repo,
  }), expectDomainError("INTERNAL_ERROR"));
});

test("draft expiry validates counts returned by the internal job", async () => {
  const { repo, calls } = repository();
  assert.deepEqual(await expireTicketDrafts({ repository: repo }), {
    expiredTickets: 2,
    queuedAttachments: 1,
  });
  assert.equal(calls[0][0], "expireTicketDrafts");
});
