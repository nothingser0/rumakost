import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import {
  getInvoice,
  listInvoices,
  markInvoiceDelivered,
  voidInvoice,
} from "../../src/lib/invoices/operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const OTHER_TENANT_ID = "00000000-0000-4000-8000-000000000004";
const INVOICE_ID = "00000000-0000-4000-8000-000000000005";
const SECOND_INVOICE_ID = "00000000-0000-4000-8000-000000000006";
const THIRD_INVOICE_ID = "00000000-0000-4000-8000-000000000007";
const IDEMPOTENCY_KEY = "00000000-0000-4000-8000-000000000008";

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
    leaseId: "00000000-0000-4000-8000-000000000009",
    tenantUserId: TENANT_ID,
    tenantName: "Tenant Satu",
    roomId: "00000000-0000-4000-8000-000000000010",
    roomCode: "A-01",
    periodStart: "2026-11-01",
    periodEnd: "2026-11-30",
    dueOn: "2026-11-05",
    kind: "RECURRING",
    status: "ISSUED",
    deliveryStatus: "UNSENT",
    issuedAt: "2026-11-01T00:00:00.000000Z",
    deliveredAt: null,
    voidedAt: null,
    amountDue: "1200000.00",
    amountPaid: "0.00",
    lines: [{
      id: "00000000-0000-4000-8000-000000000011",
      kind: "RENT",
      amount: "1200000.00",
      description: "Sewa rutin",
    }],
    payments: [],
    ...overrides,
  };
}

function createMemoryRepository(records = []) {
  const rows = new Map(records.map((record) => [record.id, structuredClone(record)]));
  const idempotency = new Map();
  const audits = [];

  function isVisible(record, actorId, actorRole) {
    return actorRole !== "TENANT" || record.tenantUserId === actorId;
  }

  function toReadRecord(record) {
    const { payments, ...invoiceRecord } = record;
    if (!payments.length) return structuredClone(invoiceRecord);
    const amountPaidCents = payments
      .filter((payment) => payment.status === "VERIFIED" && !payment.reversed)
      .reduce((total, payment) => {
        const [whole, fraction = ""] = payment.amount.split(".");
        return total + BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
      }, 0n);
    return {
      ...structuredClone(invoiceRecord),
      amountPaid: `${amountPaidCents / 100n}.${String(amountPaidCents % 100n).padStart(2, "0")}`,
    };
  }

  return {
    rows,
    idempotency,
    audits,
    async listInvoices({ actorId, limit, cursor }) {
      return [...rows.values()]
        .filter((record) => isVisible(record, actorId, actorId === TENANT_ID || actorId === OTHER_TENANT_ID ? "TENANT" : "STAFF"))
        .filter((record) => !cursor || record.dueOn < cursor.dueOn || (
          record.dueOn === cursor.dueOn && record.id < cursor.id
        ))
        .sort((first, second) =>
          second.dueOn.localeCompare(first.dueOn) || second.id.localeCompare(first.id),
        )
        .slice(0, limit)
        .map(toReadRecord);
    },
    async getInvoice({ actorId, invoiceId }) {
      const record = rows.get(invoiceId);
      if (!record || !isVisible(record, actorId, actorId === TENANT_ID || actorId === OTHER_TENANT_ID ? "TENANT" : "STAFF")) {
        return null;
      }
      return toReadRecord(record);
    },
    async markInvoiceDelivered({ actorId, invoiceId, channel }) {
      const record = rows.get(invoiceId);
      if (!record) throw new DomainError("INVOICE_NOT_FOUND");
      if (record.status === "VOID") throw new DomainError("INVOICE_ALREADY_VOID");
      if (record.deliveryStatus === "UNSENT") {
        record.deliveryStatus = "SENT";
        record.deliveredAt = "2026-11-02T08:00:00.000000Z";
        audits.push({ actorId, invoiceId, action: "INVOICE_DELIVERED", channel });
      }
      return {
        invoiceId,
        status: "ISSUED",
        deliveryStatus: "SENT",
        channel,
        deliveredAt: record.deliveredAt,
      };
    },
    async voidInvoice(input) {
      const existing = idempotency.get(input.idempotencyKey);
      if (existing) {
        if (existing.requestHash !== input.requestHash) throw new DomainError("CONFLICT");
        return structuredClone(existing.data);
      }

      const record = rows.get(input.invoiceId);
      if (!record) throw new DomainError("INVOICE_NOT_FOUND");
      if (record.status === "VOID") throw new DomainError("INVOICE_ALREADY_VOID");
      if (record.payments.some((payment) => payment.status === "PENDING")) {
        throw new DomainError("PENDING_PAYMENT_EXISTS");
      }
      if (record.payments.some((payment) => payment.status === "VERIFIED" && !payment.reversed)) {
        throw new DomainError("VERIFIED_PAYMENT_UNREVERSED");
      }

      record.status = "VOID";
      record.voidedAt = "2026-11-02T08:00:00.000000Z";
      const data = {
        invoiceId: input.invoiceId,
        status: "VOID",
        voidedAt: record.voidedAt,
      };
      audits.push({ actorId: input.actorId, invoiceId: input.invoiceId, action: "INVOICE_VOIDED", reason: input.reason });
      idempotency.set(input.idempotencyKey, { requestHash: input.requestHash, data });
      return structuredClone(data);
    },
  };
}

function invoiceActor(actor) {
  return {
    id: actor.id,
    role: actor.role,
    isActive: actor.isActive,
    mustChangePassword: actor.mustChangePassword,
  };
}

test("derives unpaid, partial, paid, overdue, and void status from active verified allocation totals", async () => {
  const repository = createMemoryRepository([
    invoice({ dueOn: "2026-11-10" }),
    invoice({
      id: SECOND_INVOICE_ID,
      dueOn: "2026-11-10",
      payments: [
        { status: "PENDING", amount: "600000.00", reversed: false },
        { status: "REJECTED", amount: "400000.00", reversed: false },
        { status: "VERIFIED", amount: "200000.25", reversed: false },
        { status: "VERIFIED", amount: "100000.00", reversed: true },
      ],
    }),
    invoice({
      id: THIRD_INVOICE_ID,
      dueOn: "2026-11-01",
      payments: [{ status: "VERIFIED", amount: "300000.00", reversed: false }],
    }),
    invoice({
      id: "00000000-0000-4000-8000-000000000012",
      payments: [{ status: "VERIFIED", amount: "1200000.00", reversed: false }],
    }),
    invoice({
      id: "00000000-0000-4000-8000-000000000013",
      status: "VOID",
      amountPaid: "0.00",
      voidedAt: "2026-11-02T08:00:00.000000Z",
    }),
  ]);

  const result = await listInvoices({
    actor: invoiceActor(owner),
    input: { limit: 10 },
    repository,
    today: "2026-11-05",
  });
  const statuses = new Map(result.items.map((item) => [item.id, item.displayStatus]));

  assert.equal(statuses.get(INVOICE_ID), "UNPAID");
  assert.equal(statuses.get(SECOND_INVOICE_ID), "PARTIAL");
  assert.equal(statuses.get(THIRD_INVOICE_ID), "OVERDUE");
  assert.equal(statuses.get("00000000-0000-4000-8000-000000000012"), "PAID");
  assert.equal(statuses.get("00000000-0000-4000-8000-000000000013"), "VOID");
  assert.equal(result.items.find((item) => item.id === SECOND_INVOICE_ID)?.amountOutstanding, "999999.75");
  assert.equal(result.items.find((item) => item.id === "00000000-0000-4000-8000-000000000013")?.amountOutstanding, "0.00");
});

test("limits invoice reads to the Tenant's own Lease and returns a not-found result for another Tenant's invoice", async () => {
  const repository = createMemoryRepository([
    invoice(),
    invoice({
      id: SECOND_INVOICE_ID,
      tenantUserId: OTHER_TENANT_ID,
      tenantName: "Tenant Dua",
    }),
  ]);

  const tenantInvoices = await listInvoices({
    actor: invoiceActor(tenant),
    repository,
  });
  const staffInvoices = await listInvoices({
    actor: invoiceActor(staff),
    repository,
  });

  assert.deepEqual(tenantInvoices.items.map((item) => item.id), [INVOICE_ID]);
  assert.equal(staffInvoices.items.length, 2);
  await assert.rejects(
    getInvoice({ actor: invoiceActor(tenant), input: { invoiceId: SECOND_INVOICE_ID }, repository }),
    (error) => error.code === "INVOICE_NOT_FOUND",
  );
});

test("invoice list pagination is bounded, stable, and emits a keyset cursor", async () => {
  let received;
  const repository = createMemoryRepository([
    invoice(),
    invoice({ id: SECOND_INVOICE_ID, dueOn: "2026-11-06" }),
    invoice({ id: THIRD_INVOICE_ID, dueOn: "2026-11-07" }),
  ]);
  const wrappedRepository = {
    ...repository,
    async listInvoices(input) {
      received = input;
      return repository.listInvoices(input);
    },
  };

  const result = await listInvoices({
    actor: invoiceActor(owner),
    input: { limit: 2 },
    repository: wrappedRepository,
  });

  assert.equal(received.limit, 3);
  assert.deepEqual(result.items.map((item) => item.id), [THIRD_INVOICE_ID, SECOND_INVOICE_ID]);
  assert.deepEqual(result.nextCursor, { dueOn: "2026-11-06", id: SECOND_INVOICE_ID });
  await assert.rejects(
    listInvoices({ actor: invoiceActor(owner), input: { limit: 101 }, repository }),
    (error) => error.name === "ZodError",
  );
});

test("manual delivery permits Owner and Staff, is idempotent, and rejects a client-supplied timestamp", async () => {
  const repository = createMemoryRepository([invoice()]);
  const input = { invoiceId: INVOICE_ID, channel: "MANUAL" };

  const first = await markInvoiceDelivered({ actor: invoiceActor(owner), input, repository });
  const second = await markInvoiceDelivered({ actor: invoiceActor(staff), input, repository });

  assert.equal(first.deliveryStatus, "SENT");
  assert.equal(first.channel, "MANUAL");
  assert.equal(first.deliveredAt, "2026-11-02T08:00:00.000000Z");
  assert.deepEqual(second, first);
  assert.equal(repository.audits.length, 1);
  await assert.rejects(
    markInvoiceDelivered({
      actor: invoiceActor(tenant),
      input,
      repository,
    }),
    (error) => error.code === "FORBIDDEN",
  );
  await assert.rejects(
    markInvoiceDelivered({
      actor: invoiceActor(owner),
      input: { ...input, deliveredAt: "2026-11-02T08:00:00Z" },
      repository,
    }),
    (error) => error.name === "ZodError",
  );
  await assert.rejects(
    markInvoiceDelivered({
      actor: invoiceActor(owner),
      input,
      repository: createMemoryRepository([
        invoice({ status: "VOID", voidedAt: "2026-11-02T08:00:00.000000Z" }),
      ]),
    }),
    (error) => error.code === "INVOICE_ALREADY_VOID",
  );
});

test("void requires an Owner, a reason, rejected pending claims, and reversed verified payments", async () => {
  const pendingRepository = createMemoryRepository([
    invoice({ payments: [{ status: "PENDING", reversed: false }] }),
  ]);
  const verifiedRepository = createMemoryRepository([
    invoice({ payments: [{ status: "VERIFIED", amount: "200000.00", reversed: false }] }),
  ]);
  const validInput = {
    invoiceId: INVOICE_ID,
    reason: "Tagihan dibuat ganda",
    idempotencyKey: IDEMPOTENCY_KEY,
  };

  await assert.rejects(
    voidInvoice({ actor: invoiceActor(owner), input: validInput, repository: pendingRepository }),
    (error) => error.code === "PENDING_PAYMENT_EXISTS",
  );
  await assert.rejects(
    voidInvoice({ actor: invoiceActor(owner), input: validInput, repository: verifiedRepository }),
    (error) => error.code === "VERIFIED_PAYMENT_UNREVERSED",
  );
  await assert.rejects(
    voidInvoice({ actor: invoiceActor(staff), input: validInput, repository: pendingRepository }),
    (error) => error.code === "NOT_OWNER",
  );
  await assert.rejects(
    voidInvoice({
      actor: invoiceActor(owner),
      input: { ...validInput, reason: "  " },
      repository: pendingRepository,
    }),
    (error) => error.code === "REASON_REQUIRED",
  );
  await assert.rejects(
    voidInvoice({
      actor: invoiceActor(owner),
      input: { invoiceId: INVOICE_ID, reason: "Duplikat" },
      repository: pendingRepository,
    }),
    (error) => error.name === "ZodError",
  );
});

test("void succeeds after every pending payment is rejected and every verified payment is reversed, then safely replays", async () => {
  const record = invoice({
    payments: [
      { status: "REJECTED", reversed: false },
      { status: "VERIFIED", reversed: true },
    ],
  });
  const repository = createMemoryRepository([record]);
  const input = {
    invoiceId: INVOICE_ID,
    reason: "Invoice salah periode",
    idempotencyKey: IDEMPOTENCY_KEY,
  };

  const first = await voidInvoice({ actor: invoiceActor(owner), input, repository });
  const replay = await voidInvoice({ actor: invoiceActor(owner), input, repository });

  assert.equal(first.status, "VOID");
  assert.deepEqual(replay, first);
  assert.equal(repository.audits.filter((event) => event.action === "INVOICE_VOIDED").length, 1);
  await assert.rejects(
    voidInvoice({
      actor: invoiceActor(owner),
      input: { ...input, reason: "Alasan berbeda" },
      repository,
    }),
    (error) => error.code === "CONFLICT",
  );
  await assert.rejects(
    voidInvoice({
      actor: invoiceActor(owner),
      input: { ...input, reason: "Alasan berbeda", idempotencyKey: THIRD_INVOICE_ID },
      repository,
    }),
    (error) => error.code === "INVOICE_ALREADY_VOID",
  );
});
