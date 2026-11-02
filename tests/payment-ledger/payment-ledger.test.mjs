import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  rejectPayment,
  reversePayment,
  verifyPayment,
} from "../../src/lib/payments/payment-ledger.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const INVOICE_ID = "00000000-0000-4000-8000-000000000010";
const RENT_LINE_ID = "00000000-0000-4000-8000-000000000011";
const DEPOSIT_LINE_ID = "00000000-0000-4000-8000-000000000012";
const PAYMENT_ID = "00000000-0000-4000-8000-000000000020";
const SECOND_PAYMENT_ID = "00000000-0000-4000-8000-000000000021";

const owner = { id: OWNER_ID, role: "OWNER", isActive: true, mustChangePassword: false };
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };

function payment(overrides = {}) {
  return {
    id: PAYMENT_ID,
    invoiceId: INVOICE_ID,
    amount: "50.00",
    status: "PENDING",
    recordedById: STAFF_ID,
    allocations: [],
    reversal: null,
    ...overrides,
  };
}

function invoice(overrides = {}) {
  return {
    id: INVOICE_ID,
    status: "ISSUED",
    lines: [
      { id: RENT_LINE_ID, kind: "RENT", amount: "60.00" },
      { id: DEPOSIT_LINE_ID, kind: "DEPOSIT", amount: "40.00" },
    ],
    payments: [payment()],
    depositLedger: [],
    reservedEscrow: "0.00",
    ...overrides,
  };
}

function toCents(value) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function toMoney(value) {
  return String(value / 100n) + "." + String(value % 100n).padStart(2, "0");
}

function invoicePaidCents(target) {
  return target.payments
    .filter((candidate) => candidate.status === "VERIFIED" && !candidate.reversal)
    .flatMap((candidate) => candidate.allocations)
    .reduce((sum, allocation) => sum + toCents(allocation.amount), 0n);
}

function createMemoryRepository(records = [invoice()], options = {}) {
  const invoices = new Map(records.map((record) => [record.id, structuredClone(record)]));
  const idempotency = new Map();
  const audits = [];
  let queue = Promise.resolve();

  function serialize(operation) {
    const result = queue.then(operation, operation);
    queue = result.then(() => undefined, () => undefined);
    return result;
  }

  function findPayment(paymentId) {
    for (const target of invoices.values()) {
      const found = target.payments.find((candidate) => candidate.id === paymentId);
      if (found) return { invoice: target, payment: found };
    }
    return null;
  }

  function replay(operation, input) {
    const existing = idempotency.get(input.idempotencyKey);
    if (!existing) return null;
    if (existing.operation !== operation || existing.requestHash !== input.requestHash) {
      throw new DomainError("CONFLICT");
    }
    return structuredClone(existing.data);
  }

  function requireOwner(actorId) {
    if (actorId !== OWNER_ID) throw new DomainError("NOT_OWNER");
  }

  function paidAmount(target) {
    return target.payments
      .filter((candidate) => candidate.status === "VERIFIED" && !candidate.reversal)
      .flatMap((candidate) => candidate.allocations)
      .reduce((sum, allocation) => sum + toCents(allocation.amount), 0n);
  }

  function linePaidAmount(target, lineId) {
    return target.payments
      .filter((candidate) => candidate.status === "VERIFIED" && !candidate.reversal)
      .flatMap((candidate) => candidate.allocations)
      .filter((allocation) => allocation.invoiceLineId === lineId)
      .reduce((sum, allocation) => sum + toCents(allocation.amount), 0n);
  }

  function writeAudit(action, current, actorId, target) {
    if (options.failAudit) throw new DomainError("INTERNAL_ERROR");
    audits.push({
      action,
      paymentId: current.id,
      actorId,
      invoiceId: target.id,
      amount: current.amount,
    });
  }

  function save(operation, input, data) {
    idempotency.set(input.idempotencyKey, {
      operation,
      requestHash: input.requestHash,
      data: structuredClone(data),
    });
    return data;
  }

  return {
    invoices,
    idempotency,
    audits,
    async verifyPayment(input) {
      return serialize(() => {
        requireOwner(input.actorId);
        const prior = replay("verifyPayment", input);
        if (prior) return prior;
        const found = findPayment(input.paymentId);
        if (!found) throw new DomainError("PAYMENT_NOT_FOUND");
        const { invoice: target, payment: current } = found;
        if (target.status !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
        if (current.status !== "PENDING") throw new DomainError("PAYMENT_NOT_PENDING");

        const amount = toCents(current.amount);
        const due = target.lines.reduce((sum, line) => sum + toCents(line.amount), 0n);
        const paid = paidAmount(target);
        if (amount > due - paid) throw new DomainError("OVERPAYMENT");
        if (current.allocations.length > 0) throw new DomainError("CONFLICT");

        let remaining = amount;
        const allocations = [];
        const lines = [...target.lines].sort((first, second) => {
          const firstRank = first.kind === "RENT" ? 0 : 1;
          const secondRank = second.kind === "RENT" ? 0 : 1;
          return firstRank - secondRank || first.id.localeCompare(second.id);
        });
        for (const line of lines) {
          const available = toCents(line.amount) - linePaidAmount(target, line.id);
          const allocated = available < remaining ? available : remaining;
          if (allocated <= 0n) continue;
          allocations.push({
            invoiceLineId: line.id,
            kind: line.kind,
            amount: toMoney(allocated),
          });
          remaining -= allocated;
          if (remaining === 0n) break;
        }
        if (remaining !== 0n) throw new DomainError("OVERPAYMENT");

        const result = {
          paymentId: current.id,
          invoiceId: target.id,
          amount: current.amount,
          amountPaid: toMoney(paid + amount),
          amountOutstanding: toMoney(due - paid - amount),
          status: "VERIFIED",
          verifiedAt: "2026-11-02T08:00:00.000Z",
          allocations,
        };
        writeAudit("PAYMENT_VERIFIED", current, input.actorId, target);
        current.status = "VERIFIED";
        current.verifiedById = input.actorId;
        current.allocations = allocations;
        for (const allocation of allocations) {
          if (allocation.kind === "DEPOSIT") {
            target.depositLedger.push({
              kind: "COLLECTED",
              paymentAllocationId: current.id + ":" + allocation.invoiceLineId,
              amount: allocation.amount,
            });
          }
        }
        return save("verifyPayment", input, result);
      });
    },
    async rejectPayment(input) {
      return serialize(() => {
        requireOwner(input.actorId);
        const prior = replay("rejectPayment", input);
        if (prior) return prior;
        const found = findPayment(input.paymentId);
        if (!found) throw new DomainError("PAYMENT_NOT_FOUND");
        const { invoice: target, payment: current } = found;
        if (target.status !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
        if (current.status !== "PENDING") throw new DomainError("PAYMENT_NOT_PENDING");

        const result = {
          paymentId: current.id,
          invoiceId: target.id,
          amount: current.amount,
          amountPaid: toMoney(paidAmount(target)),
          amountOutstanding: toMoney(
            target.lines.reduce((sum, line) => sum + toCents(line.amount), 0n) - paidAmount(target),
          ),
          status: "REJECTED",
          rejectionReason: input.reason,
          rejectedAt: "2026-11-02T08:00:00.000Z",
        };
        writeAudit("PAYMENT_REJECTED", current, input.actorId, target);
        current.status = "REJECTED";
        current.rejectionReason = input.reason;
        return save("rejectPayment", input, result);
      });
    },
    async reversePayment(input) {
      return serialize(() => {
        requireOwner(input.actorId);
        const prior = replay("reversePayment", input);
        if (prior) return prior;
        const found = findPayment(input.paymentId);
        if (!found) throw new DomainError("PAYMENT_NOT_FOUND");
        const { invoice: target, payment: current } = found;
        if (current.reversal) throw new DomainError("ALREADY_REVERSED");
        if (current.status !== "VERIFIED") throw new DomainError("NOT_VERIFIED");

        const depositAllocations = current.allocations.filter((allocation) => allocation.kind === "DEPOSIT");
        const collected = target.depositLedger
          .filter((entry) => entry.kind === "COLLECTED")
          .reduce((sum, entry) => sum + toCents(entry.amount), 0n);
        const reversed = target.depositLedger
          .filter((entry) => entry.kind === "COLLECTION_REVERSED")
          .reduce((sum, entry) => sum + toCents(entry.amount), 0n);
        const reserved = toCents(target.reservedEscrow);
        const compensation = depositAllocations
          .reduce((sum, allocation) => sum + toCents(allocation.amount), 0n);
        if (compensation > collected - reversed - reserved) {
          throw new DomainError("DEPOSIT_INSUFFICIENT");
        }

        const result = {
          paymentId: current.id,
          invoiceId: target.id,
          amount: current.amount,
          amountPaid: toMoney(paidAmount(target) - toCents(current.amount)),
          amountOutstanding: toMoney(
            target.lines.reduce((sum, line) => sum + toCents(line.amount), 0n)
              - paidAmount(target)
              + toCents(current.amount),
          ),
          reason: input.reason,
          reversedAt: "2026-11-02T08:00:00.000Z",
        };
        writeAudit("PAYMENT_REVERSED", current, input.actorId, target);
        current.reversal = { amount: current.amount, reason: input.reason };
        for (const allocation of depositAllocations) {
          target.depositLedger.push({
            kind: "COLLECTION_REVERSED",
            reversedPaymentAllocationId: current.id + ":" + allocation.invoiceLineId,
            amount: allocation.amount,
            reason: input.reason,
          });
        }
        return save("reversePayment", input, result);
      });
    },
  };
}

function actorValue(actor) {
  return {
    id: actor.id,
    role: actor.role,
    isActive: actor.isActive,
    mustChangePassword: actor.mustChangePassword,
  };
}

function verifyInput(paymentId = PAYMENT_ID, key = "00000000-0000-4000-8000-000000000030") {
  return { paymentId, idempotencyKey: key };
}

function rejectInput(overrides = {}) {
  return {
    paymentId: PAYMENT_ID,
    rejectionReason: "Bukti transfer tidak sesuai",
    idempotencyKey: "00000000-0000-4000-8000-000000000031",
    ...overrides,
  };
}

function reverseInput(overrides = {}) {
  return {
    paymentId: PAYMENT_ID,
    reason: "Koreksi pencatatan",
    idempotencyKey: "00000000-0000-4000-8000-000000000032",
    ...overrides,
  };
}

test("Owner may verify their own claim and allocations use RENT before DEPOSIT", async () => {
  const repository = createMemoryRepository([invoice({
    payments: [payment({ recordedById: OWNER_ID })],
  })]);
  const input = verifyInput();
  const result = await verifyPayment({ actor: actorValue(owner), input, repository });

  assert.equal(result.status, "VERIFIED");
  assert.equal(result.amountPaid, "50.00");
  assert.equal(result.amountOutstanding, "50.00");
  assert.deepEqual(result.allocations, [
    { invoiceLineId: RENT_LINE_ID, kind: "RENT", amount: "50.00" },
  ]);
  assert.equal(repository.invoices.get(INVOICE_ID).payments[0].verifiedById, OWNER_ID);
  assert.deepEqual(await verifyPayment({ actor: actorValue(owner), input, repository }), result);
  assert.equal(repository.audits.length, 1);
});

test("allocation fills outstanding RENT before DEPOSIT after earlier verified payments", async () => {
  const earlier = payment({
    amount: "20.00",
    status: "VERIFIED",
    allocations: [{ invoiceLineId: RENT_LINE_ID, kind: "RENT", amount: "20.00" }],
  });
  const pending = payment({ id: SECOND_PAYMENT_ID, amount: "50.00" });
  const repository = createMemoryRepository([invoice({ payments: [earlier, pending] })]);
  const result = await verifyPayment({
    actor: actorValue(owner),
    input: verifyInput(SECOND_PAYMENT_ID),
    repository,
  });

  assert.deepEqual(result.allocations, [
    { invoiceLineId: RENT_LINE_ID, kind: "RENT", amount: "40.00" },
    { invoiceLineId: DEPOSIT_LINE_ID, kind: "DEPOSIT", amount: "10.00" },
  ]);
  assert.equal(result.amountPaid, "70.00");
  assert.equal(result.amountOutstanding, "30.00");
  assert.equal(repository.invoices.get(INVOICE_ID).depositLedger[0].kind, "COLLECTED");
  assert.equal(repository.invoices.get(INVOICE_ID).depositLedger[0].amount, "10.00");
});

test("only Owner may verify or reject a payment", async () => {
  const repository = createMemoryRepository();
  await assert.rejects(
    verifyPayment({ actor: actorValue(staff), input: verifyInput(), repository }),
    (error) => error.code === "NOT_OWNER",
  );
  await assert.rejects(
    rejectPayment({ actor: actorValue(tenant), input: rejectInput(), repository }),
    (error) => error.code === "NOT_OWNER",
  );
  assert.equal(repository.audits.length, 0);
});

test("rejection requires a reason and rejected payments cannot be verified or reversed", async () => {
  const repository = createMemoryRepository();
  await assert.rejects(
    rejectPayment({
      actor: actorValue(owner),
      input: rejectInput({ rejectionReason: "  " }),
      repository,
    }),
    (error) => error.code === "REASON_REQUIRED",
  );
  await assert.rejects(
    reversePayment({
      actor: actorValue(owner),
      input: reverseInput({ reason: "  " }),
      repository,
    }),
    (error) => error.code === "REASON_REQUIRED",
  );
  const result = await rejectPayment({ actor: actorValue(owner), input: rejectInput(), repository });
  assert.equal(result.status, "REJECTED");
  assert.equal(result.amountPaid, "0.00");
  assert.equal(result.amountOutstanding, "100.00");
  assert.equal(result.rejectionReason, "Bukti transfer tidak sesuai");
  await assert.rejects(
    verifyPayment({ actor: actorValue(owner), input: verifyInput(), repository }),
    (error) => error.code === "PAYMENT_NOT_PENDING",
  );
  await assert.rejects(
    reversePayment({ actor: actorValue(owner), input: reverseInput(), repository }),
    (error) => error.code === "NOT_VERIFIED",
  );
});

test("concurrent verification serializes invoice balance and rejects an overpayment race", async () => {
  const repository = createMemoryRepository([invoice({
    lines: [{ id: RENT_LINE_ID, kind: "RENT", amount: "100.00" }],
    payments: [
      payment({ amount: "70.00" }),
      payment({ id: SECOND_PAYMENT_ID, amount: "70.00" }),
    ],
  })]);
  const results = await Promise.allSettled([
    verifyPayment({ actor: actorValue(owner), input: verifyInput(), repository }),
    verifyPayment({
      actor: actorValue(owner),
      input: verifyInput(SECOND_PAYMENT_ID, "00000000-0000-4000-8000-000000000033"),
      repository,
    }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal(rejected.reason.code, "OVERPAYMENT");
  assert.equal(invoicePaidCents(repository.invoices.get(INVOICE_ID)), 7000n);
  assert.equal(repository.audits.length, 1);
});

test("full reversal compensates deposit and replay creates only one audit", async () => {
  const repository = createMemoryRepository([invoice({
    lines: [
      { id: RENT_LINE_ID, kind: "RENT", amount: "30.00" },
      { id: DEPOSIT_LINE_ID, kind: "DEPOSIT", amount: "40.00" },
    ],
    payments: [payment({ amount: "50.00" })],
  })]);
  await verifyPayment({ actor: actorValue(owner), input: verifyInput(), repository });
  const input = reverseInput();
  const result = await reversePayment({ actor: actorValue(owner), input, repository });

  assert.equal(result.amount, "50.00");
  assert.equal(result.amountPaid, "0.00");
  assert.equal(result.amountOutstanding, "70.00");
  assert.equal(invoicePaidCents(repository.invoices.get(INVOICE_ID)), 0n);
  assert.deepEqual(
    repository.invoices.get(INVOICE_ID).depositLedger.map((entry) => entry.kind),
    ["COLLECTED", "COLLECTION_REVERSED"],
  );
  assert.deepEqual(await reversePayment({ actor: actorValue(owner), input, repository }), result);
  assert.equal(repository.audits.length, 2);
});

test("reversal fails atomically when escrow is reserved", async () => {
  const repository = createMemoryRepository([invoice({
    lines: [{ id: DEPOSIT_LINE_ID, kind: "DEPOSIT", amount: "40.00" }],
    payments: [payment({ amount: "20.00" })],
    reservedEscrow: "20.00",
  })]);
  await verifyPayment({ actor: actorValue(owner), input: verifyInput(), repository });
  const target = repository.invoices.get(INVOICE_ID);
  const auditCount = repository.audits.length;
  const keyCount = repository.idempotency.size;

  await assert.rejects(
    reversePayment({ actor: actorValue(owner), input: reverseInput(), repository }),
    (error) => error.code === "DEPOSIT_INSUFFICIENT",
  );
  assert.equal(target.payments[0].reversal, null);
  assert.equal(repository.audits.length, auditCount);
  assert.equal(repository.idempotency.size, keyCount);
});

test("audit failure rolls back verification and leaves no allocations or idempotency record", async () => {
  const repository = createMemoryRepository([invoice()], { failAudit: true });
  await assert.rejects(
    verifyPayment({ actor: actorValue(owner), input: verifyInput(), repository }),
    (error) => error.code === "INTERNAL_ERROR",
  );
  const target = repository.invoices.get(INVOICE_ID);
  assert.equal(target.payments[0].status, "PENDING");
  assert.deepEqual(target.payments[0].allocations, []);
  assert.deepEqual(target.depositLedger, []);
  assert.equal(repository.audits.length, 0);
  assert.equal(repository.idempotency.size, 0);
});

test("reusing an idempotency key with different rejection content conflicts", async () => {
  const repository = createMemoryRepository();
  await rejectPayment({ actor: actorValue(owner), input: rejectInput(), repository });
  await assert.rejects(
    rejectPayment({
      actor: actorValue(owner),
      input: rejectInput({ rejectionReason: "Alasan berbeda" }),
      repository,
    }),
    (error) => error.code === "CONFLICT",
  );
  assert.equal(repository.audits.length, 1);
});
