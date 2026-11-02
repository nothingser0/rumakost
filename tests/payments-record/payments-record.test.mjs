import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import { recordPayment } from "../../src/lib/payments/record-payment.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const OTHER_TENANT_ID = "00000000-0000-4000-8000-000000000004";
const INVOICE_ID = "00000000-0000-4000-8000-000000000005";
const SECOND_INVOICE_ID = "00000000-0000-4000-8000-000000000006";
const IDEMPOTENCY_KEY = "00000000-0000-4000-8000-000000000008";
const SECOND_IDEMPOTENCY_KEY = "00000000-0000-4000-8000-000000000009";

const owner = {
  id: OWNER_ID,
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: STAFF_ID, role: "STAFF" };
const tenant = { ...owner, id: TENANT_ID, role: "TENANT" };
const otherTenant = { ...owner, id: OTHER_TENANT_ID, role: "TENANT" };

function invoice(overrides = {}) {
  return {
    id: INVOICE_ID,
    status: "ISSUED",
    tenantUserId: TENANT_ID,
    leaseStatus: "ACTIVE",
    startsOn: "2026-10-01",
    endsOn: null,
    amountDue: "100.00",
    payments: [],
    ...overrides,
  };
}

function createMemoryRepository(records = [invoice()]) {
  const invoices = new Map(records.map((record) => [record.id, structuredClone(record)]));
  const actors = new Map([
    [OWNER_ID, owner],
    [STAFF_ID, staff],
    [TENANT_ID, tenant],
    [OTHER_TENANT_ID, otherTenant],
  ]);
  const idempotency = new Map();
  const audits = [];

  return {
    invoices,
    idempotency,
    audits,
    async recordPayment(input) {
      const actor = actors.get(input.actorId);
      if (!actor || !actor.isActive || actor.mustChangePassword) {
        throw new DomainError("FORBIDDEN");
      }

      const existing = idempotency.get(input.idempotencyKey);
      if (existing) {
        if (existing.requestHash !== input.requestHash) throw new DomainError("CONFLICT");
        return structuredClone(existing.data);
      }

      const target = invoices.get(input.invoiceId);
      if (!target) {
        throw new DomainError(actor.role === "TENANT" ? "INVOICE_NOT_OWNED" : "INVOICE_NOT_FOUND");
      }
      if (actor.role === "TENANT" && target.tenantUserId !== actor.id) {
        throw new DomainError("INVOICE_NOT_OWNED");
      }
      if (target.status !== "ISSUED") throw new DomainError("INVOICE_CLOSED");
      if (actor.role === "TENANT" && (
        target.leaseStatus !== "ACTIVE" ||
        target.startsOn > input.localDate ||
        (target.endsOn !== null && target.endsOn < input.localDate)
      )) {
        throw new DomainError("LEASE_ENDED");
      }

      const paid = target.payments
        .filter((payment) => payment.status === "VERIFIED" && !payment.reversed)
        .reduce((total, payment) => total + BigInt(payment.amount.replace(".", "")), 0n);
      const [dueWhole, dueFraction = ""] = target.amountDue.split(".");
      const due = BigInt(dueWhole) * 100n + BigInt(dueFraction.padEnd(2, "0"));
      const [amountWhole, amountFraction = ""] = input.amount.split(".");
      const amount = BigInt(amountWhole) * 100n + BigInt(amountFraction.padEnd(2, "0"));
      if (amount > due - paid) throw new DomainError("OVERPAYMENT");

      if (input.reference !== null && [...invoices.values()].some((record) =>
        record.payments.some((payment) => payment.reference === input.reference)
      )) {
        throw new DomainError("CONFLICT");
      }

      const data = {
        id: `00000000-0000-4000-8000-${String(invoices.size + idempotency.size + 100).padStart(12, "0")}`,
        invoiceId: target.id,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
        status: "PENDING",
        createdAt: "2026-11-02T08:00:00.000000Z",
      };
      target.payments.push(data);
      audits.push({ action: "PAYMENT_RECORDED", actorId: input.actorId, paymentId: data.id });
      idempotency.set(input.idempotencyKey, {
        requestHash: input.requestHash,
        data: structuredClone(data),
      });
      return data;
    },
  };
}

function paymentInput(overrides = {}) {
  return {
    invoiceId: INVOICE_ID,
    amount: "70.00",
    method: "TRANSFER",
    idempotencyKey: IDEMPOTENCY_KEY,
    ...overrides,
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

test("Owner, Staff, and Tenant can record pending claims; Tenant ownership and active Lease are enforced", async () => {
  const ownerRepository = createMemoryRepository();
  const staffRepository = createMemoryRepository();
  const tenantRepository = createMemoryRepository();

  for (const [actor, repository] of [
    [owner, ownerRepository],
    [staff, staffRepository],
    [tenant, tenantRepository],
  ]) {
    const result = await recordPayment({
      actor: actorValue(actor),
      input: paymentInput(),
      repository,
      today: "2026-11-02",
    });
    assert.equal(result.status, "PENDING");
  }

  const endedLeaseRepository = createMemoryRepository([
    invoice({ leaseStatus: "ENDED", endsOn: "2026-10-31" }),
  ]);
  await assert.rejects(
    recordPayment({
      actor: actorValue(tenant),
      input: paymentInput(),
      repository: endedLeaseRepository,
      today: "2026-11-02",
    }),
    (error) => error.code === "LEASE_ENDED",
  );

  const oldInvoiceRepository = createMemoryRepository([
    invoice({ leaseStatus: "ENDED", endsOn: "2026-10-31" }),
  ]);
  const ownerPayment = await recordPayment({
    actor: actorValue(owner),
    input: paymentInput(),
    repository: oldInvoiceRepository,
    today: "2026-11-02",
  });
  assert.equal(ownerPayment.status, "PENDING");
});

test("Tenant cannot record a claim against another Tenant's invoice", async () => {
  const repository = createMemoryRepository([
    invoice({ tenantUserId: OTHER_TENANT_ID }),
  ]);

  await assert.rejects(
    recordPayment({
      actor: actorValue(tenant),
      input: paymentInput(),
      repository,
      today: "2026-11-02",
    }),
    (error) => error.code === "INVOICE_NOT_OWNED",
  );
});

test("void invoices are closed and a fully paid issued invoice rejects a new amount as overpayment", async () => {
  const voidRepository = createMemoryRepository([invoice({ status: "VOID" })]);
  await assert.rejects(
    recordPayment({
      actor: actorValue(owner),
      input: paymentInput(),
      repository: voidRepository,
    }),
    (error) => error.code === "INVOICE_CLOSED",
  );

  const paidRepository = createMemoryRepository([
    invoice({ payments: [{ status: "VERIFIED", amount: "100.00", reversed: false }] }),
  ]);
  await assert.rejects(
    recordPayment({
      actor: actorValue(owner),
      input: paymentInput({ amount: "0.01" }),
      repository: paidRepository,
    }),
    (error) => error.code === "OVERPAYMENT",
  );
});

test("rejects invalid methods, nonpositive or malformed amounts, and claims above outstanding balance", async () => {
  const repository = createMemoryRepository();

  await assert.rejects(
    recordPayment({ actor: actorValue(owner), input: paymentInput({ method: "BANK" }), repository }),
    (error) => error.name === "ZodError",
  );
  for (const amount of ["0", "-1.00", "abc", "10000000000.00"]) {
    await assert.rejects(
      recordPayment({ actor: actorValue(owner), input: paymentInput({ amount }), repository }),
      (error) => error.code === "AMOUNT_INVALID",
    );
  }
  await assert.rejects(
    recordPayment({ actor: actorValue(owner), input: paymentInput({ amount: "100.01" }), repository }),
    (error) => error.code === "OVERPAYMENT",
  );
});

test("pending claims do not reduce open balance; only active verified allocations count", async () => {
  const repository = createMemoryRepository([
    invoice({
      amountDue: "100.00",
      payments: [
        { status: "VERIFIED", amount: "30.00", reversed: false },
        { status: "PENDING", amount: "70.00", reversed: false },
        { status: "VERIFIED", amount: "10.00", reversed: true },
      ],
    }),
  ]);

  const first = await recordPayment({
    actor: actorValue(tenant),
    input: paymentInput({ amount: "70.00" }),
    repository,
    today: "2026-11-02",
  });
  const second = await recordPayment({
    actor: actorValue(tenant),
    input: paymentInput({ amount: "70.00", idempotencyKey: SECOND_IDEMPOTENCY_KEY }),
    repository,
    today: "2026-11-02",
  });

  assert.equal(first.status, "PENDING");
  assert.equal(second.status, "PENDING");
  assert.equal(repository.invoices.get(INVOICE_ID).payments.filter((payment) => payment.status === "PENDING").length, 3);
});

test("optional reference must be unique and idempotency replay returns one persisted claim", async () => {
  const repository = createMemoryRepository([
    invoice({
      payments: [{ status: "REJECTED", amount: "10.00", reference: "TX-OLD", reversed: false }],
    }),
    invoice({
      id: SECOND_INVOICE_ID,
      payments: [],
    }),
  ]);

  await assert.rejects(
    recordPayment({
      actor: actorValue(owner),
      input: paymentInput({ reference: "TX-OLD" }),
      repository,
    }),
    (error) => error.code === "CONFLICT",
  );

  const input = paymentInput({ reference: " TX-NEW " });
  const first = await recordPayment({ actor: actorValue(owner), input, repository });
  const replay = await recordPayment({ actor: actorValue(owner), input, repository });
  assert.deepEqual(replay, first);
  assert.equal(first.reference, "TX-NEW");
  assert.equal(repository.invoices.get(INVOICE_ID).payments.length, 2);
  assert.equal(repository.audits.length, 1);

  await assert.rejects(
    recordPayment({
      actor: actorValue(owner),
      input: paymentInput({ amount: "60.00" }),
      repository,
    }),
    (error) => error.code === "CONFLICT",
  );
});
