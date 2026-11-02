import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import { createLease } from "../../src/lib/leases/operations.mjs";

const TODAY = "2026-11-02";
const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const STAFF_ID = "00000000-0000-4000-8000-000000000002";
const TENANT_ID = "00000000-0000-4000-8000-000000000003";
const SECOND_TENANT_ID = "00000000-0000-4000-8000-000000000004";
const ROOM_ID = "00000000-0000-4000-8000-000000000005";
const SECOND_ROOM_ID = "00000000-0000-4000-8000-000000000006";

function actor(id = OWNER_ID, role = "OWNER") {
  return { id, role, isActive: true, mustChangePassword: false };
}

function input(overrides = {}) {
  return {
    tenantUserId: TENANT_ID,
    roomId: ROOM_ID,
    startsOn: TODAY,
    endsOn: "2026-11-30",
    rentAmount: "1200000.00",
    depositAgreedAmount: "500000.00",
    billingMode: "FULL_MONTH_ANNIVERSARY",
    idempotencyKey: randomUUID(),
    ...overrides,
  };
}

function rangeOverlaps(first, second) {
  const laterStart = first.startsOn > second.startsOn
    ? first.startsOn
    : second.startsOn;
  const earlierEnd = first.endsOn === null
    ? second.endsOn
    : second.endsOn === null
      ? first.endsOn
      : first.endsOn < second.endsOn
        ? first.endsOn
        : second.endsOn;
  return earlierEnd === null || laterStart <= earlierEnd;
}

function createMemoryRepository({ tenants, rooms, failInvoiceOnce = false } = {}) {
  const tenantRows = new Map([
    [TENANT_ID, { role: "TENANT", isActive: true, hasProfile: true }],
    [SECOND_TENANT_ID, { role: "TENANT", isActive: true, hasProfile: true }],
    ...(tenants ?? []),
  ]);
  const roomRows = new Map([
    [ROOM_ID, { archived: false, physicalStatus: "READY", floorArchived: false }],
    [SECOND_ROOM_ID, { archived: false, physicalStatus: "READY", floorArchived: false }],
    ...(rooms ?? []),
  ]);
  const leases = [];
  const idempotency = new Map();
  let queued = Promise.resolve();
  let shouldFailInvoice = failInvoiceOnce;

  return {
    leases,
    idempotency,
    async createLeaseWithInitialInvoice(request) {
      const previous = queued;
      let release;
      queued = new Promise((resolve) => {
        release = resolve;
      });
      await previous;

      try {
        const stored = idempotency.get(request.idempotencyKey);
        if (stored) {
          if (stored.requestHash !== request.requestHash) {
            throw new DomainError("CONFLICT");
          }
          return structuredClone(stored.data);
        }

        const tenant = tenantRows.get(request.tenantUserId);
        if (!tenant || tenant.role !== "TENANT" || !tenant.isActive) {
          throw new DomainError("TENANT_INACTIVE");
        }
        if (!tenant.hasProfile) throw new DomainError("TENANT_PROFILE_NOT_FOUND");

        const room = roomRows.get(request.roomId);
        if (!room || room.archived) throw new DomainError("ROOM_NOT_FOUND");
        if (room.floorArchived) throw new DomainError("FLOOR_NOT_FOUND");
        if (room.physicalStatus === "MAINTENANCE") {
          throw new DomainError("ROOM_IN_USE");
        }

        if (["ACTIVE", "SCHEDULED"].includes(request.status)) {
          const roomConflict = leases.some((lease) =>
            lease.roomId === request.roomId &&
            ["ACTIVE", "SCHEDULED"].includes(lease.status) &&
            rangeOverlaps(lease, request),
          );
          if (roomConflict) throw new DomainError("ROOM_CONFLICT");

          const tenantConflict = leases.some((lease) =>
            lease.tenantUserId === request.tenantUserId &&
            ["ACTIVE", "SCHEDULED"].includes(lease.status) &&
            rangeOverlaps(lease, request),
          );
          if (tenantConflict) throw new DomainError("CONFLICT");
        }

        const lease = {
          id: randomUUID(),
          tenantUserId: request.tenantUserId,
          roomId: request.roomId,
          startsOn: request.startsOn,
          endsOn: request.endsOn,
          rentAmount: request.rentAmount,
          depositAgreedAmount: request.depositAgreedAmount,
          billingMode: request.billingMode,
          status: request.status,
          contractNumber: request.contractNumber,
          createdById: request.actorId,
        };
        const invoice = {
          id: randomUUID(),
          periodStart: request.initialInvoice.periodStart,
          periodEnd: request.initialInvoice.periodEnd,
          dueOn: request.initialInvoice.dueOn,
          kind: "INITIAL",
          status: "ISSUED",
          amountDue: request.initialInvoice.amountDue,
          lines: request.initialInvoice.lines.map((line) => ({
            ...line,
            id: randomUUID(),
          })),
        };
        if (shouldFailInvoice) {
          shouldFailInvoice = false;
          throw new DomainError("INTERNAL_ERROR");
        }

        const data = { lease, invoice };
        leases.push(lease);
        idempotency.set(request.idempotencyKey, {
          requestHash: request.requestHash,
          data: structuredClone(data),
        });
        return structuredClone(data);
      } finally {
        release();
      }
    },
  };
}

function createOperation({ repository = createMemoryRepository(), currentActor = actor(), now } = {}) {
  return {
    repository,
    run: (value) => createLease({
      actor: currentActor,
      input: value,
      repository,
      now: now ?? (() => new Date("2026-11-02T04:00:00.000Z")),
    }),
  };
}

async function expectDomainError(promise, code) {
  await assert.rejects(promise, (error) =>
    error instanceof DomainError && error.code === code,
  );
}

async function expectValidationError(promise) {
  await assert.rejects(promise, (error) => error?.name === "ZodError");
}

test("allows Owner and Staff and records the authenticated actor", async () => {
  for (const currentActor of [actor(), actor(STAFF_ID, "STAFF")]) {
    const operation = createOperation({ currentActor });
    const result = await operation.run(input());

    assert.equal(result.lease.createdById, currentActor.id);
    assert.equal(result.invoice.kind, "INITIAL");
    assert.equal(result.invoice.status, "ISSUED");
  }
});

test("rejects Tenant callers and client-supplied actor fields", async () => {
  const denied = createOperation({ currentActor: actor(TENANT_ID, "TENANT") });
  await expectDomainError(denied.run(input()), "FORBIDDEN");

  const authorized = createOperation();
  await expectValidationError(authorized.run(input({ createdById: STAFF_ID })));
});

test("validates calendar dates and determines Lease status in Jakarta time", async () => {
  const operation = createOperation({
    now: () => new Date("2026-11-01T17:30:00.000Z"),
  });
  await expectValidationError(operation.run(input({ endsOn: TODAY })));

  const current = await operation.run(input({
    idempotencyKey: randomUUID(),
    startsOn: TODAY,
    endsOn: "2026-11-05",
  }));
  const future = await operation.run(input({
    roomId: SECOND_ROOM_ID,
    tenantUserId: SECOND_TENANT_ID,
    idempotencyKey: randomUUID(),
    startsOn: "2026-11-10",
    endsOn: "2026-11-20",
  }));
  const ended = await operation.run(input({
    roomId: SECOND_ROOM_ID,
    tenantUserId: SECOND_TENANT_ID,
    idempotencyKey: randomUUID(),
    startsOn: "2026-10-01",
    endsOn: "2026-10-20",
  }));

  assert.equal(current.lease.status, "ACTIVE");
  assert.equal(future.lease.status, "SCHEDULED");
  assert.equal(ended.lease.status, "ENDED");
});

test("requires an active Tenant account and TenantProfile", async () => {
  const inactive = createOperation({
    repository: createMemoryRepository({
      tenants: [[TENANT_ID, { role: "TENANT", isActive: false, hasProfile: true }]],
    }),
  });
  await expectDomainError(inactive.run(input()), "TENANT_INACTIVE");

  const missingProfile = createOperation({
    repository: createMemoryRepository({
      tenants: [[TENANT_ID, { role: "TENANT", isActive: true, hasProfile: false }]],
    }),
  });
  await expectDomainError(missingProfile.run(input()), "TENANT_PROFILE_NOT_FOUND");
});

test("rejects archived rooms, archived floors, and rooms under maintenance", async () => {
  const archivedRoom = createOperation({
    repository: createMemoryRepository({
      rooms: [[ROOM_ID, { archived: true, physicalStatus: "READY", floorArchived: false }]],
    }),
  });
  await expectDomainError(archivedRoom.run(input()), "ROOM_NOT_FOUND");

  const archivedFloor = createOperation({
    repository: createMemoryRepository({
      rooms: [[ROOM_ID, { archived: false, physicalStatus: "READY", floorArchived: true }]],
    }),
  });
  await expectDomainError(archivedFloor.run(input()), "FLOOR_NOT_FOUND");

  const maintenanceRoom = createOperation({
    repository: createMemoryRepository({
      rooms: [[ROOM_ID, { archived: false, physicalStatus: "MAINTENANCE", floorArchived: false }]],
    }),
  });
  await expectDomainError(maintenanceRoom.run(input()), "ROOM_IN_USE");
});

test("treats Lease end dates as inclusive for room and Tenant overlap", async () => {
  const repository = createMemoryRepository();
  const operation = createOperation({ repository });
  await operation.run(input({ startsOn: "2026-11-01", endsOn: "2026-11-10" }));

  await expectDomainError(
    operation.run(input({ startsOn: "2026-11-10", endsOn: "2026-11-20" })),
    "ROOM_CONFLICT",
  );
  await expectDomainError(
    operation.run(input({
      roomId: SECOND_ROOM_ID,
      startsOn: "2026-11-10",
      endsOn: "2026-11-20",
    })),
    "CONFLICT",
  );

  const nextDay = await operation.run(input({
    roomId: SECOND_ROOM_ID,
    tenantUserId: SECOND_TENANT_ID,
    startsOn: "2026-11-11",
    endsOn: "2026-11-20",
  }));
  assert.equal(nextDay.lease.status, "SCHEDULED");
});

test("serializes competing creates so only one overlapping room Lease succeeds", async () => {
  const repository = createMemoryRepository();
  const first = createOperation({ repository });
  const second = createOperation({ repository });
  const results = await Promise.allSettled([
    first.run(input({
      tenantUserId: TENANT_ID,
      idempotencyKey: randomUUID(),
    })),
    second.run(input({
      tenantUserId: SECOND_TENANT_ID,
      idempotencyKey: randomUUID(),
    })),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal(rejected.reason.code, "ROOM_CONFLICT");
  assert.equal(repository.leases.length, 1);
});

test("serializes competing creates so one Tenant cannot hold overlapping Leases", async () => {
  const repository = createMemoryRepository();
  const first = createOperation({ repository });
  const second = createOperation({ repository });
  const results = await Promise.allSettled([
    first.run(input({
      roomId: ROOM_ID,
      idempotencyKey: randomUUID(),
    })),
    second.run(input({
      roomId: SECOND_ROOM_ID,
      idempotencyKey: randomUUID(),
    })),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal(rejected.reason.code, "CONFLICT");
  assert.equal(repository.leases.length, 1);
});

test("rolls back Lease and idempotency when initial invoice creation fails", async () => {
  const repository = createMemoryRepository({ failInvoiceOnce: true });
  const operation = createOperation({ repository });
  const request = input();

  await expectDomainError(operation.run(request), "INTERNAL_ERROR");
  assert.equal(repository.leases.length, 0);
  assert.equal(repository.idempotency.size, 0);

  await operation.run(request);
  assert.equal(repository.leases.length, 1);
  assert.equal(repository.idempotency.size, 1);
});

test("returns the stored result on an identical idempotent retry", async () => {
  const repository = createMemoryRepository();
  const operation = createOperation({ repository });
  const request = input();

  const first = await operation.run(request);
  const retry = await operation.run(request);

  assert.deepEqual(retry, first);
  assert.equal(repository.leases.length, 1);
  assert.equal(repository.idempotency.size, 1);

  await expectDomainError(
    operation.run({ ...request, roomId: SECOND_ROOM_ID }),
    "CONFLICT",
  );
});

test("collapses simultaneous retries with one idempotency key into one Lease", async () => {
  const repository = createMemoryRepository();
  const operation = createOperation({ repository });
  const request = input();
  const results = await Promise.all([
    operation.run(request),
    operation.run(request),
  ]);

  assert.deepEqual(results[1], results[0]);
  assert.equal(repository.leases.length, 1);
  assert.equal(repository.idempotency.size, 1);
});
