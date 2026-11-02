import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  endLease,
  requestLeaseEnd,
  reviewLeaseEndRequest,
} from "../../src/lib/leases/operations.mjs";
import {
  reconcileCheckoutDeposit,
  resolveCheckoutRefund,
  settleInvoiceFromDeposit,
} from "../../src/lib/deposits/operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const OTHER_TENANT_ID = "00000000-0000-4000-8000-000000000004";
const LEASE_ID = "00000000-0000-4000-8000-000000000010";
const OTHER_LEASE_ID = "00000000-0000-4000-8000-000000000011";
const ENDED_LEASE_ID = "00000000-0000-4000-8000-000000000012";
const ROOM_ID = "00000000-0000-4000-8000-000000000020";
const INVOICE_ID = "00000000-0000-4000-8000-000000000030";
const RENT_LINE_ID = "00000000-0000-4000-8000-000000000031";
const DEPOSIT_LINE_ID = "00000000-0000-4000-8000-000000000032";
const TODAY = "2026-11-02";

const owner = { id: OWNER_ID, role: "OWNER", isActive: true, mustChangePassword: false };
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };
const otherTenant = { ...tenant, id: OTHER_TENANT_ID };

function cents(value) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function money(value) {
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

function createState({
  leaseStatus = "ACTIVE",
  rentAmount = "200.00",
  rentPaid = "20.00",
  entries = [
    { leaseId: LEASE_ID, kind: "COLLECTED", amount: "100.00" },
    { leaseId: ENDED_LEASE_ID, kind: "COLLECTED", amount: "100.00" },
  ],
  requests = [],
} = {}) {
  return {
    actors: new Map([
      [OWNER_ID, owner],
      [STAFF_ID, staff],
      [TENANT_ID, tenant],
      [OTHER_TENANT_ID, otherTenant],
    ]),
    leases: new Map([
      [LEASE_ID, {
        id: LEASE_ID,
        tenantUserId: TENANT_ID,
        roomId: ROOM_ID,
        startsOn: "2026-10-01",
        endsOn: null,
        status: leaseStatus,
      }],
      [OTHER_LEASE_ID, {
        id: OTHER_LEASE_ID,
        tenantUserId: OTHER_TENANT_ID,
        roomId: "00000000-0000-4000-8000-000000000021",
        startsOn: "2026-10-01",
        endsOn: null,
        status: "ACTIVE",
      }],
      [ENDED_LEASE_ID, {
        id: ENDED_LEASE_ID,
        tenantUserId: TENANT_ID,
        roomId: "00000000-0000-4000-8000-000000000022",
        startsOn: "2026-10-01",
        endsOn: "2026-11-01",
        status: "ENDED",
      }],
    ]),
    requests: new Map(requests.map((request) => [request.id, structuredClone(request)])),
    invoices: new Map([[
      INVOICE_ID,
      {
        id: INVOICE_ID,
        leaseId: LEASE_ID,
        status: "ISSUED",
        lines: [
          { id: RENT_LINE_ID, kind: "RENT", amount: rentAmount, paid: rentPaid },
          { id: DEPOSIT_LINE_ID, kind: "DEPOSIT", amount: "100.00", paid: "0.00" },
        ],
      },
    ]]),
    entries: entries.map((entry, index) => ({
      id: entry.id ?? `00000000-0000-4000-8000-${String(40 + index).padStart(12, "0")}`,
      leaseId: entry.leaseId ?? LEASE_ID,
      invoiceLineId: entry.invoiceLineId ?? null,
      kind: entry.kind,
      amount: entry.amount,
      reason: entry.reason ?? null,
      refundStatus: entry.refundStatus ?? null,
      createdById: entry.createdById ?? OWNER_ID,
    })),
    audits: [],
    idempotency: new Map(),
  };
}

function createRepository(options = {}) {
  let state = createState(options);
  let queue = Promise.resolve();
  let nextId = 100;

  function serialize(operation) {
    const result = queue.then(operation, operation);
    queue = result.then(() => undefined, () => undefined);
    return result;
  }

  function requireActor(actorId, role) {
    const actor = state.actors.get(actorId);
    if (!actor || !actor.isActive || actor.mustChangePassword) {
      throw new DomainError("UNAUTHENTICATED");
    }
    if (actor.role !== role) throw new DomainError(role === "OWNER" ? "NOT_OWNER" : "FORBIDDEN");
    return actor;
  }

  function availableEscrow(current, leaseId) {
    const collected = current.entries
      .filter((entry) => entry.leaseId === leaseId && entry.kind === "COLLECTED")
      .reduce((total, entry) => total + cents(entry.amount), 0n);
    const reversed = current.entries
      .filter((entry) => entry.leaseId === leaseId && entry.kind === "COLLECTION_REVERSED")
      .reduce((total, entry) => total + cents(entry.amount), 0n);
    const used = current.entries
      .filter((entry) => entry.leaseId === leaseId && (
        entry.kind === "APPLIED_TO_RENT" ||
        entry.kind === "WITHHELD_AT_CHECKOUT" ||
        (entry.kind === "REFUNDED" && ["PENDING", "PAID"].includes(entry.refundStatus))
      ))
      .reduce((total, entry) => total + cents(entry.amount), 0n);
    return collected - reversed - used;
  }

  function transaction(operationName, input, mutate) {
    return serialize(async () => {
      const actor = state.actors.get(input.actorId);
      if (!actor || !actor.isActive || actor.mustChangePassword) {
        throw new DomainError("UNAUTHENTICATED");
      }
      if (actor.role !== (operationName === "requestLeaseEnd" ? "TENANT" : "OWNER")) {
        throw new DomainError(operationName === "requestLeaseEnd" ? "FORBIDDEN" : "NOT_OWNER");
      }
      const previous = state.idempotency.get(input.idempotencyKey);
      if (previous) {
        if (previous.operation !== operationName || previous.requestHash !== input.requestHash) {
          throw new DomainError("CONFLICT");
        }
        return structuredClone(previous.data);
      }

      const draft = structuredClone(state);
      const result = mutate(draft, actor);
      if (options.failAuditFor === operationName) throw new DomainError("INTERNAL_ERROR");
      draft.audits.push({
        actorId: actor.id,
        action: result.auditAction,
        entityId: result.entityId,
      });
      draft.idempotency.set(input.idempotencyKey, {
        operation: operationName,
        requestHash: input.requestHash,
        data: structuredClone(result.data),
      });
      state = draft;
      return structuredClone(result.data);
    });
  }

  return {
    get state() {
      return state;
    },
    async requestLeaseEnd(input) {
      return transaction("requestLeaseEnd", input, (draft, actor) => {
        const lease = draft.leases.get(input.leaseId);
        if (!lease || lease.tenantUserId !== actor.id) throw new DomainError("LEASE_NOT_OWNED");
        if (lease.status !== "ACTIVE" || lease.startsOn > input.localDate ||
            (lease.endsOn !== null && lease.endsOn < input.localDate)) {
          throw new DomainError(lease.status === "ENDED" ? "LEASE_ALREADY_ENDED" : "LEASE_NOT_ACTIVE");
        }
        if (input.requestedEndOn <= lease.startsOn || input.requestedEndOn < input.localDate) {
          throw new DomainError("INVALID_DATES");
        }
        if ([...draft.requests.values()].some((request) =>
          request.leaseId === lease.id && request.status === "PENDING"
        )) {
          throw new DomainError("CONFLICT");
        }
        const requestId = randomUUID();
        const request = {
          id: requestId,
          leaseId: lease.id,
          requestedByTenantId: actor.id,
          requestedEndOn: input.requestedEndOn,
          reason: input.reason,
          status: "PENDING",
          reviewedByOwnerId: null,
          reviewedAt: null,
        };
        draft.requests.set(requestId, request);
        return {
          data: {
            requestId,
            leaseId: lease.id,
            requestedEndOn: request.requestedEndOn,
            status: "PENDING",
            createdAt: "2026-11-02T00:00:00.000Z",
          },
          auditAction: "LEASE_END_REQUESTED",
          entityId: requestId,
        };
      });
    },
    async endLease(input) {
      return transaction("endLease", input, (draft, actor) => {
        const lease = draft.leases.get(input.leaseId);
        if (!lease) throw new DomainError("NOT_FOUND");
        if (lease.status !== "ACTIVE") {
          throw new DomainError(lease.status === "ENDED" ? "LEASE_ALREADY_ENDED" : "LEASE_NOT_ACTIVE");
        }
        if (input.actualEndOn <= lease.startsOn || input.actualEndOn > input.localDate) {
          throw new DomainError("INVALID_DATES");
        }
        lease.endsOn = input.actualEndOn;
        lease.status = "ENDED";
        for (const request of draft.requests.values()) {
          if (request.leaseId === lease.id && request.status === "PENDING") {
            request.status = "APPROVED";
            request.reviewedByOwnerId = actor.id;
            request.reviewedAt = "2026-11-02T00:00:00.000Z";
          }
        }
        return {
          data: {
            leaseId: lease.id,
            roomId: lease.roomId,
            status: "ENDED",
            endsOn: lease.endsOn,
          },
          auditAction: "LEASE_ENDED",
          entityId: lease.id,
        };
      });
    },
    async reviewLeaseEndRequest(input) {
      return transaction("reviewLeaseEndRequest", input, (draft, actor) => {
        const request = draft.requests.get(input.requestId);
        if (!request) throw new DomainError("NOT_FOUND");
        if (request.status !== "PENDING") throw new DomainError("CONFLICT");
        const lease = draft.leases.get(request.leaseId);
        if (!lease) throw new DomainError("NOT_FOUND");
        if (input.decision === "APPROVE") {
          if (lease.status !== "ACTIVE") throw new DomainError("LEASE_NOT_ACTIVE");
          if (input.actualEndOn <= lease.startsOn || input.actualEndOn > input.localDate) {
            throw new DomainError("INVALID_DATES");
          }
          lease.endsOn = input.actualEndOn;
          lease.status = "ENDED";
        }
        request.status = input.decision === "APPROVE" ? "APPROVED" : "REJECTED";
        request.reviewedByOwnerId = actor.id;
        request.reviewedAt = "2026-11-02T00:00:00.000Z";
        return {
          data: {
            requestId: request.id,
            leaseId: lease.id,
            status: request.status,
            leaseStatus: lease.status,
            endsOn: lease.endsOn,
          },
          auditAction: `LEASE_END_REQUEST_${request.status}`,
          entityId: request.id,
        };
      });
    },
    async settleInvoiceFromDeposit(input) {
      return transaction("settleInvoiceFromDeposit", input, (draft, actor) => {
        const invoice = [...draft.invoices.values()].find((candidate) =>
          candidate.lines.some((line) => line.id === input.invoiceLineId)
        );
        if (!invoice) throw new DomainError("INVOICE_NOT_FOUND");
        if (invoice.status !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
        const line = invoice.lines.find((candidate) => candidate.id === input.invoiceLineId);
        if (!line || line.kind !== "RENT") throw new DomainError("AMOUNT_INVALID");
        const paid = cents(line.paid);
        const applied = draft.entries
          .filter((entry) => entry.invoiceLineId === line.id && entry.kind === "APPLIED_TO_RENT")
          .reduce((total, entry) => total + cents(entry.amount), 0n);
        const amount = cents(input.amount);
        if (amount > cents(line.amount) - paid - applied) throw new DomainError("OVERPAYMENT");
        const available = availableEscrow(draft, invoice.leaseId);
        if (amount > available) throw new DomainError("DEPOSIT_INSUFFICIENT");
        const entryId = randomUUID();
        draft.entries.push({
          id: entryId,
          leaseId: invoice.leaseId,
          invoiceLineId: line.id,
          kind: "APPLIED_TO_RENT",
          amount: input.amount,
          reason: input.reason,
          refundStatus: null,
          createdById: actor.id,
        });
        return {
          data: {
            entryId,
            leaseId: invoice.leaseId,
            invoiceLineId: line.id,
            amount: input.amount,
            amountOutstanding: money(cents(line.amount) - paid - applied - amount),
            kind: "APPLIED_TO_RENT",
          },
          auditAction: "DEPOSIT_APPLIED_TO_RENT",
          entityId: entryId,
        };
      });
    },
    async reconcileCheckoutDeposit(input) {
      return transaction("reconcileCheckoutDeposit", input, (draft, actor) => {
        const lease = draft.leases.get(input.leaseId);
        if (!lease) throw new DomainError("NOT_FOUND");
        if (lease.status !== "ENDED") throw new DomainError("LEASE_NOT_ENDED");
        const amount = cents(input.amount);
        const available = availableEscrow(draft, lease.id);
        if (amount > available) throw new DomainError("DEPOSIT_INSUFFICIENT");
        const kind = input.mode === "REFUND" ? "REFUNDED" : "WITHHELD_AT_CHECKOUT";
        const refundStatus = input.mode === "REFUND" ? "PENDING" : null;
        const entryId = randomUUID();
        draft.entries.push({
          id: entryId,
          leaseId: lease.id,
          invoiceLineId: null,
          kind,
          amount: input.amount,
          reason: input.reason,
          refundStatus,
          createdById: actor.id,
        });
        return {
          data: {
            entryId,
            leaseId: lease.id,
            amount: input.amount,
            kind,
            reason: input.reason,
            refundStatus,
            availableAfter: money(available - amount),
          },
          auditAction: kind === "REFUNDED"
            ? "DEPOSIT_REFUND_REQUESTED"
            : "DEPOSIT_WITHHELD_AT_CHECKOUT",
          entityId: entryId,
        };
      });
    },
    async resolveCheckoutRefund(input) {
      return transaction("resolveCheckoutRefund", input, (draft, actor) => {
        const entry = draft.entries.find((candidate) => candidate.id === input.entryId);
        if (!entry) throw new DomainError("NOT_FOUND");
        if (entry.kind !== "REFUNDED" || entry.refundStatus !== "PENDING") {
          throw new DomainError("CONFLICT");
        }
        const available = availableEscrow(draft, entry.leaseId);
        entry.refundStatus = input.status;
        const availableAfter = available + (input.status === "REJECTED" ? cents(entry.amount) : 0n);
        return {
          data: {
            entryId: entry.id,
            leaseId: entry.leaseId,
            amount: entry.amount,
            status: input.status,
            availableAfter: money(availableAfter),
          },
          auditAction: `DEPOSIT_REFUND_${input.status}`,
          entityId: entry.id,
        };
      });
    },
  };
}

function actionInput(overrides = {}) {
  return { idempotencyKey: randomUUID(), ...overrides };
}

function assertDomainError(promise, code) {
  return assert.rejects(promise, (error) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, code);
    return true;
  });
}

test("Tenant hanya dapat meminta check-out Lease miliknya dan retry tidak menggandakan event", async () => {
  const repository = createRepository();
  const request = actionInput({
    leaseId: LEASE_ID,
    requestedEndOn: "2026-11-10",
    reason: "Pindah kota",
  });
  const result = await requestLeaseEnd({
    actor: tenant,
    input: request,
    repository,
    today: TODAY,
  });
  const replay = await requestLeaseEnd({
    actor: tenant,
    input: request,
    repository,
    today: TODAY,
  });

  assert.equal(result.status, "PENDING");
  assert.deepEqual(replay, result);
  assert.equal(repository.state.requests.size, 1);
  assert.equal(repository.state.audits.length, 1);
  await assertDomainError(requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: OTHER_LEASE_ID, requestedEndOn: "2026-11-10" }),
    repository,
    today: TODAY,
  }), "LEASE_NOT_OWNED");
});

test("permintaan check-out ditolak jika tanggal invalid atau sudah ada permintaan pending", async () => {
  const repository = createRepository();
  await assertDomainError(requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: LEASE_ID, requestedEndOn: "2026-10-01" }),
    repository,
    today: TODAY,
  }), "INVALID_DATES");

  await requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: LEASE_ID, requestedEndOn: "2026-11-10" }),
    repository,
    today: TODAY,
  });
  await assertDomainError(requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: LEASE_ID, requestedEndOn: "2026-11-12" }),
    repository,
    today: TODAY,
  }), "CONFLICT");
});

test("Owner dapat menolak permintaan tanpa mengakhiri kontrak dan tidak dapat meninjau ulang", async () => {
  const repository = createRepository();
  const request = await requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: LEASE_ID, requestedEndOn: "2026-11-10" }),
    repository,
    today: TODAY,
  });
  const result = await reviewLeaseEndRequest({
    actor: owner,
    input: actionInput({ requestId: request.requestId, decision: "REJECT" }),
    repository,
    today: TODAY,
  });

  assert.equal(result.status, "REJECTED");
  assert.equal(result.leaseStatus, "ACTIVE");
  assert.equal(repository.state.leases.get(LEASE_ID).status, "ACTIVE");
  await assertDomainError(reviewLeaseEndRequest({
    actor: owner,
    input: actionInput({ requestId: request.requestId, decision: "REJECT" }),
    repository,
    today: TODAY,
  }), "CONFLICT");
  await assertDomainError(reviewLeaseEndRequest({
    actor: staff,
    input: actionInput({ requestId: request.requestId, decision: "REJECT" }),
    repository,
    today: TODAY,
  }), "NOT_OWNER");
});

test("persetujuan Owner mengakhiri Lease pada tanggal aktual dan membebaskan Room", async () => {
  const repository = createRepository();
  const request = await requestLeaseEnd({
    actor: tenant,
    input: actionInput({ leaseId: LEASE_ID, requestedEndOn: "2026-11-10" }),
    repository,
    today: TODAY,
  });
  const result = await reviewLeaseEndRequest({
    actor: owner,
    input: actionInput({
      requestId: request.requestId,
      decision: "APPROVE",
      actualEndOn: "2026-11-02",
    }),
    repository,
    today: TODAY,
  });

  assert.equal(result.status, "APPROVED");
  assert.equal(result.leaseStatus, "ENDED");
  assert.equal(result.endsOn, "2026-11-02");
  assert.equal(repository.state.leases.get(LEASE_ID).roomId, ROOM_ID);
  assert.equal(repository.state.leases.get(LEASE_ID).status, "ENDED");
});

test("Owner mengakhiri Lease langsung hanya dengan tanggal aktual yang valid", async () => {
  const repository = createRepository();
  await assertDomainError(endLease({
    actor: owner,
    input: actionInput({ leaseId: LEASE_ID, actualEndOn: "2026-11-03" }),
    repository,
    today: TODAY,
  }), "INVALID_DATES");

  const result = await endLease({
    actor: owner,
    input: actionInput({ leaseId: LEASE_ID, actualEndOn: "2026-11-01" }),
    repository,
    today: TODAY,
  });
  assert.equal(result.status, "ENDED");
  assert.equal(repository.state.leases.get(LEASE_ID).endsOn, "2026-11-01");
  await assertDomainError(endLease({
    actor: owner,
    input: actionInput({ leaseId: LEASE_ID, actualEndOn: "2026-11-01" }),
    repository,
    today: TODAY,
  }), "LEASE_ALREADY_ENDED");
});

test("settlement deposit mengurangi saldo line RENT dan escrow secara atomik serta idempotent", async () => {
  const repository = createRepository();
  const request = actionInput({ invoiceLineId: RENT_LINE_ID, amount: "30.00", reason: "Tunggakan" });
  const result = await settleInvoiceFromDeposit({ actor: owner, input: request, repository });
  const replay = await settleInvoiceFromDeposit({ actor: owner, input: request, repository });

  assert.equal(result.kind, "APPLIED_TO_RENT");
  assert.equal(result.amountOutstanding, "150.00");
  assert.deepEqual(replay, result);
  assert.equal(repository.state.entries.filter((entry) => entry.kind === "APPLIED_TO_RENT").length, 1);
  assert.equal(repository.state.audits.length, 1);
  assert.equal(money(availableEscrow(repository.state, LEASE_ID)), "70.00");
});

test("settlement menolak nominal di atas saldo sewa dan saldo escrow serta role bukan Owner", async () => {
  const lineLimitedRepository = createRepository({ rentAmount: "50.00", rentPaid: "20.00" });
  await assertDomainError(settleInvoiceFromDeposit({
    actor: owner,
    input: actionInput({ invoiceLineId: RENT_LINE_ID, amount: "31.00" }),
    repository: lineLimitedRepository,
  }), "OVERPAYMENT");
  const escrowLimitedRepository = createRepository({ rentAmount: "200.00", rentPaid: "20.00" });
  await assertDomainError(settleInvoiceFromDeposit({
    actor: owner,
    input: actionInput({ invoiceLineId: RENT_LINE_ID, amount: "101.00" }),
    repository: escrowLimitedRepository,
  }), "DEPOSIT_INSUFFICIENT");
  await assertDomainError(reconcileCheckoutDeposit({
    actor: staff,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "REFUND", amount: "1.00", reason: "R" }),
    repository: escrowLimitedRepository,
  }), "NOT_OWNER");
});

test("rekonsiliasi hanya setelah Lease selesai; refund pending dicadangkan hingga dibayar atau ditolak", async () => {
  const repository = createRepository();
  const activeRepository = createRepository();
  await assertDomainError(reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "DEDUCTION", amount: "1.00" }),
    repository,
  }), "REASON_REQUIRED");
  await assertDomainError(reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: LEASE_ID, mode: "REFUND", amount: "20.00", reason: "Refund" }),
    repository: activeRepository,
  }), "LEASE_NOT_ENDED");

  const refund = await reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "REFUND", amount: "60.00", reason: "Sisa deposit" }),
    repository,
  });
  assert.equal(refund.refundStatus, "PENDING");
  assert.equal(refund.availableAfter, "40.00");
  await assertDomainError(reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "DEDUCTION", amount: "41.00", reason: "Kerusakan" }),
    repository,
  }), "DEPOSIT_INSUFFICIENT");

  const rejected = await resolveCheckoutRefund({
    actor: owner,
    input: actionInput({ entryId: refund.entryId, status: "REJECTED" }),
    repository,
  });
  assert.equal(rejected.availableAfter, "100.00");
  const secondRefund = await reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "REFUND", amount: "100.00", reason: "Koreksi" }),
    repository,
  });
  const paid = await resolveCheckoutRefund({
    actor: owner,
    input: actionInput({ entryId: secondRefund.entryId, status: "PAID" }),
    repository,
  });
  assert.equal(paid.availableAfter, "0.00");
  await assertDomainError(resolveCheckoutRefund({
    actor: owner,
    input: actionInput({ entryId: secondRefund.entryId, status: "REJECTED" }),
    repository,
  }), "CONFLICT");
});

test("saldo tersedia memperhitungkan reversal dan seluruh escrow yang terpakai/direservasi", async () => {
  const repository = createRepository({
    entries: [
      { leaseId: ENDED_LEASE_ID, kind: "COLLECTED", amount: "100.00" },
      { leaseId: ENDED_LEASE_ID, kind: "COLLECTION_REVERSED", amount: "20.00" },
      { leaseId: ENDED_LEASE_ID, kind: "APPLIED_TO_RENT", amount: "10.00" },
      { leaseId: ENDED_LEASE_ID, kind: "WITHHELD_AT_CHECKOUT", amount: "10.00" },
      { leaseId: ENDED_LEASE_ID, kind: "REFUNDED", amount: "20.00", refundStatus: "PENDING" },
    ],
  });
  assert.equal(money(availableEscrow(repository.state, ENDED_LEASE_ID)), "40.00");
  await assertDomainError(reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "DEDUCTION", amount: "41.00", reason: "Biaya" }),
    repository,
  }), "DEPOSIT_INSUFFICIENT");
  const finalUse = await reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "DEDUCTION", amount: "40.00", reason: "Biaya" }),
    repository,
  });
  assert.equal(finalUse.availableAfter, "0.00");
});

test("dua settlement bersamaan tidak dapat memakai escrow yang sama", async () => {
  const repository = createRepository({ rentAmount: "200.00", rentPaid: "0.00" });
  const results = await Promise.allSettled([
    settleInvoiceFromDeposit({
      actor: owner,
      input: actionInput({ invoiceLineId: RENT_LINE_ID, amount: "60.00" }),
      repository,
    }),
    settleInvoiceFromDeposit({
      actor: owner,
      input: actionInput({ invoiceLineId: RENT_LINE_ID, amount: "60.00" }),
      repository,
    }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.equal(money(availableEscrow(repository.state, LEASE_ID)), "40.00");
});

test("kegagalan audit membatalkan ledger dan idempotency", async () => {
  const repository = createRepository({ failAuditFor: "reconcileCheckoutDeposit" });
  await assertDomainError(reconcileCheckoutDeposit({
    actor: owner,
    input: actionInput({ leaseId: ENDED_LEASE_ID, mode: "DEDUCTION", amount: "25.00", reason: "Kerusakan" }),
    repository,
  }), "INTERNAL_ERROR");
  assert.equal(repository.state.entries.length, 2);
  assert.equal(repository.state.audits.length, 0);
  assert.equal(repository.state.idempotency.size, 0);
});

function availableEscrow(state, leaseId) {
  const collected = state.entries
    .filter((entry) => entry.leaseId === leaseId && entry.kind === "COLLECTED")
    .reduce((total, entry) => total + cents(entry.amount), 0n);
  const reversed = state.entries
    .filter((entry) => entry.leaseId === leaseId && entry.kind === "COLLECTION_REVERSED")
    .reduce((total, entry) => total + cents(entry.amount), 0n);
  const used = state.entries
    .filter((entry) => entry.leaseId === leaseId && (
      entry.kind === "APPLIED_TO_RENT" ||
      entry.kind === "WITHHELD_AT_CHECKOUT" ||
      (entry.kind === "REFUNDED" && ["PENDING", "PAID"].includes(entry.refundStatus))
    ))
    .reduce((total, entry) => total + cents(entry.amount), 0n);
  return collected - reversed - used;
}
