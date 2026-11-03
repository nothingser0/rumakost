import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getFinancialReport } from "../../src/lib/reports/operations.mjs";
import { listFloors } from "../../src/lib/floors/operations.mjs";
import { getInvoice, listInvoices } from "../../src/lib/invoices/operations.mjs";
import { getTicket, listTickets } from "../../src/lib/tickets/operations.mjs";
import { getRoom, listRooms } from "../../src/lib/rooms/operations.mjs";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};

const staff = { ...owner, id: "22222222-2222-4222-8222-222222222222", role: "STAFF" };
const tenant = { ...owner, id: "33333333-3333-4333-8333-333333333333", role: "TENANT" };

function floor(name) {
  return {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name,
    archivedAt: null,
  };
}

function invoice(id, dueOn = "2026-11-05") {
  return {
    id,
    leaseId: "44444444-4444-4444-8444-444444444444",
    tenantUserId: tenant.id,
    tenantName: "Tenant Sintetis",
    roomId: "55555555-5555-4555-8555-555555555555",
    roomCode: "A-01",
    periodStart: "2026-11-01",
    periodEnd: "2026-11-30",
    dueOn,
    kind: "RECURRING",
    status: "ISSUED",
    deliveryStatus: "UNSENT",
    issuedAt: "2026-11-01T00:00:00.000Z",
    deliveredAt: null,
    voidedAt: null,
    amountDue: "1000000.00",
    amountPaid: "0.00",
    lines: [{ id: "66666666-6666-4666-8666-666666666666", kind: "RENT", amount: "1000000.00", description: "Sewa" }],
  };
}

function ticket(id, createdAt = "2026-11-03T00:00:00.000Z") {
  return {
    id,
    ticketNumber: "27",
    ticketLabel: "TKT-202611-0027",
    roomId: "55555555-5555-4555-8555-555555555555",
    roomCode: "A-01",
    leaseId: "44444444-4444-4444-8444-444444444444",
    createdById: owner.id,
    createdByName: "Owner Sintetis",
    assignedToId: null,
    assignedToName: null,
    title: "Kebocoran keran",
    category: "PLUMBING",
    priority: "NORMAL",
    status: "RECEIVED",
    targetCompletionOn: null,
    closedAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

function room(code) {
  return {
    id: code === "A-01" ? "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" : "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    code,
    floorId: null,
    roomType: null,
    widthMeters: null,
    lengthMeters: null,
    monthlyRent: "1000000.00",
    depositDefaultAmount: "500000.00",
    physicalStatus: "READY",
    maintenanceNote: null,
    archivedAt: null,
  };
}

test("room list returns a bounded page with a cursor from the last included row", async () => {
  let receivedLimit = 0;
  const first = room("A-01");
  const second = room("B-01");
  const result = await listRooms({
    actor: owner,
    options: { limit: 1 },
    repository: {
      async listRooms(input) {
        receivedLimit = input.limit;
        return [first, second];
      },
    },
  });

  assert.equal(receivedLimit, 2);
  assert.deepEqual(result, {
    items: [first],
    nextCursor: { afterCode: "A-01" },
  });
});

test("floor list returns a bounded page with a cursor from the last included row", async () => {
  let receivedLimit = 0;
  const first = floor("Lantai 1");
  const second = floor("Lantai 2");
  const result = await listFloors({
    actor: owner,
    options: { limit: 1 },
    repository: {
      async listFloors(input) {
        receivedLimit = input.limit;
        return [first, second];
      },
    },
  });

  assert.equal(receivedLimit, 2);
  assert.deepEqual(result, {
    items: [first],
    nextCursor: { afterName: "Lantai 1" },
  });
});

test("invoice and ticket lists use the same bounded page contract and pass authenticated scope", async () => {
  const firstInvoice = invoice("77777777-7777-4777-8777-777777777777", "2026-11-05");
  const secondInvoice = invoice("88888888-8888-4888-8888-888888888888", "2026-11-05");
  let invoiceInput;
  const invoicePage = await listInvoices({
    actor: tenant,
    input: { limit: 1 },
    repository: {
      async listInvoices(input) {
        invoiceInput = input;
        return [firstInvoice, secondInvoice];
      },
    },
    today: "2026-11-03",
  });
  assert.equal(invoiceInput.limit, 2);
  assert.equal(invoiceInput.actorId, tenant.id);
  assert.deepEqual(invoicePage.nextCursor, { dueOn: firstInvoice.dueOn, id: firstInvoice.id });

  const firstTicket = ticket("99999999-9999-4999-8999-999999999991");
  const secondTicket = ticket("99999999-9999-4999-8999-999999999992", "2026-11-02T00:00:00.000Z");
  let ticketInput;
  const ticketPage = await listTickets({
    actor: tenant,
    input: { limit: 1 },
    repository: {
      async listTickets(input) {
        ticketInput = input;
        return [firstTicket, secondTicket];
      },
    },
  });
  assert.equal(ticketInput.limit, 2);
  assert.equal(ticketInput.actorId, tenant.id);
  assert.equal(ticketInput.role, "TENANT");
  assert.deepEqual(ticketPage.nextCursor, { createdAt: firstTicket.createdAt, id: firstTicket.id });
});

test("all four lists default to 20 rows and accept the capped page size of 100", async () => {
  const received = [];
  const repository = {
    async listRooms(input) { received.push(["rooms", input.limit]); return []; },
    async listFloors(input) { received.push(["floors", input.limit]); return []; },
    async listInvoices(input) { received.push(["invoices", input.limit]); return []; },
    async listTickets(input) { received.push(["tickets", input.limit]); return []; },
  };

  await listRooms({ actor: owner, repository });
  await listFloors({ actor: owner, repository });
  await listInvoices({ actor: owner, repository });
  await listTickets({ actor: owner, repository });
  assert.deepEqual(received, [
    ["rooms", 21],
    ["floors", 21],
    ["invoices", 21],
    ["tickets", 21],
  ]);

  received.length = 0;
  await listRooms({ actor: owner, options: { limit: 100 }, repository });
  await listFloors({ actor: owner, options: { limit: 100 }, repository });
  await listInvoices({ actor: owner, input: { limit: 100 }, repository });
  await listTickets({ actor: owner, input: { limit: 100 }, repository });
  assert.deepEqual(received, [
    ["rooms", 101],
    ["floors", 101],
    ["invoices", 101],
    ["tickets", 101],
  ]);
});

test("cursor values continue each list without repeating the previous page boundary", async () => {
  const roomRows = [room("A-01"), room("B-01"), room("C-01")];
  const roomRepository = {
    async listRooms(input) {
      return roomRows
        .filter((row) => !input.afterCode || row.code > input.afterCode)
        .slice(0, input.limit);
    },
  };
  const firstRoomPage = await listRooms({ actor: owner, options: { limit: 1 }, repository: roomRepository });
  const secondRoomPage = await listRooms({
    actor: owner,
    options: { limit: 1, ...firstRoomPage.nextCursor },
    repository: roomRepository,
  });
  assert.deepEqual([...firstRoomPage.items, ...secondRoomPage.items].map((row) => row.code), ["A-01", "B-01"]);

  const floorRows = [floor("Lantai 1"), floor("Lantai 2"), floor("Lantai 3")];
  const floorRepository = {
    async listFloors(input) {
      const afterName = input.afterName?.trim().toLowerCase();
      return floorRows
        .filter((row) => !afterName || row.name.toLowerCase() > afterName)
        .slice(0, input.limit);
    },
  };
  const firstFloorPage = await listFloors({ actor: owner, options: { limit: 1 }, repository: floorRepository });
  const secondFloorPage = await listFloors({
    actor: owner,
    options: { limit: 1, ...firstFloorPage.nextCursor },
    repository: floorRepository,
  });
  assert.deepEqual([...firstFloorPage.items, ...secondFloorPage.items].map((row) => row.name), ["Lantai 1", "Lantai 2"]);

  const invoiceRows = [
    invoice("77777777-7777-4777-8777-777777777777", "2026-11-07"),
    invoice("88888888-8888-4888-8888-888888888888", "2026-11-06"),
    invoice("99999999-9999-4999-8999-999999999999", "2026-11-05"),
  ];
  const invoiceRepository = {
    async listInvoices(input) {
      return invoiceRows
        .filter((row) => !input.cursor || row.dueOn < input.cursor.dueOn || (
          row.dueOn === input.cursor.dueOn && row.id < input.cursor.id
        ))
        .slice(0, input.limit);
    },
  };
  const firstInvoicePage = await listInvoices({ actor: owner, input: { limit: 1 }, repository: invoiceRepository });
  const secondInvoicePage = await listInvoices({
    actor: owner,
    input: { limit: 1, cursor: firstInvoicePage.nextCursor },
    repository: invoiceRepository,
  });
  assert.deepEqual([...firstInvoicePage.items, ...secondInvoicePage.items].map((row) => row.id), [invoiceRows[0].id, invoiceRows[1].id]);

  const ticketRows = [
    ticket("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", "2026-11-03T03:00:00.000Z"),
    ticket("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2", "2026-11-03T02:00:00.000Z"),
    ticket("cccccccc-cccc-4ccc-8ccc-ccccccccccc3", "2026-11-03T01:00:00.000Z"),
  ];
  const ticketRepository = {
    async listTickets(input) {
      return ticketRows
        .filter((row) => !input.cursor || row.createdAt < input.cursor.createdAt || (
          row.createdAt === input.cursor.createdAt && row.id < input.cursor.id
        ))
        .slice(0, input.limit);
    },
  };
  const firstTicketPage = await listTickets({ actor: owner, input: { limit: 1 }, repository: ticketRepository });
  const secondTicketPage = await listTickets({
    actor: owner,
    input: { limit: 1, cursor: firstTicketPage.nextCursor },
    repository: ticketRepository,
  });
  assert.deepEqual([...firstTicketPage.items, ...secondTicketPage.items].map((row) => row.id), [ticketRows[0].id, ticketRows[1].id]);
});

test("each domain list issues one repository call per page", async () => {
  const calls = [];
  const repository = {
    async listRooms() { calls.push("rooms"); return []; },
    async listFloors() { calls.push("floors"); return []; },
    async listInvoices() { calls.push("invoices"); return []; },
    async listTickets() { calls.push("tickets"); return []; },
  };

  await listRooms({ actor: owner, repository });
  await listFloors({ actor: owner, repository });
  await listInvoices({ actor: owner, repository });
  await listTickets({ actor: owner, repository });
  assert.deepEqual(calls, ["rooms", "floors", "invoices", "tickets"]);
});

test("Room, Invoice, and Ticket detail reads each use one scoped repository call", async () => {
  const calls = [];
  const roomRecord = room("A-01");
  await getRoom({
    actor: owner,
    input: { roomId: roomRecord.id },
    repository: {
      async findRoom(id) { calls.push(["room", id]); return roomRecord; },
    },
  });

  const invoiceRecord = invoice("77777777-7777-4777-8777-777777777777");
  await getInvoice({
    actor: owner,
    input: { invoiceId: invoiceRecord.id },
    repository: {
      async getInvoice(input) { calls.push(["invoice", input.actorId, input.invoiceId]); return invoiceRecord; },
    },
    today: "2026-11-03",
  });

  const ticketRecord = {
    ...ticket("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1"),
    description: "Bocor pada sambungan keran.",
    resolutionSummary: null,
    cancellationReason: null,
    cancelledAt: null,
    reopenedAt: null,
    statusChangedById: null,
    comments: [],
    attachments: [],
    statusEvents: [],
  };
  await getTicket({
    actor: owner,
    input: { ticketId: ticketRecord.id },
    repository: {
      async getTicket(input) { calls.push(["ticket", input.actorId, input.role, input.ticketId]); return ticketRecord; },
    },
  });

  assert.deepEqual(calls, [
    ["room", roomRecord.id],
    ["invoice", owner.id, invoiceRecord.id],
    ["ticket", owner.id, "OWNER", ticketRecord.id],
  ]);
});

test("all list inputs reject unsafe filter and sort fields before repository access", async () => {
  const repository = {
    async listRooms() { assert.fail("Room repository must not be called"); },
    async listFloors() { assert.fail("Floor repository must not be called"); },
    async listInvoices() { assert.fail("Invoice repository must not be called"); },
    async listTickets() { assert.fail("Ticket repository must not be called"); },
  };

  await assert.rejects(listRooms({ actor: owner, options: { sort: "createdAt" }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listFloors({ actor: owner, options: { filter: "all" }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listInvoices({ actor: owner, input: { sort: "amount" }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listTickets({ actor: owner, input: { status: "DRAFT" }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listRooms({ actor: owner, options: { limit: 101 }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listFloors({ actor: owner, options: { limit: 101 }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listInvoices({ actor: owner, input: { limit: 101 }, repository }), (error) => error.name === "ZodError");
  await assert.rejects(listTickets({ actor: owner, input: { limit: 101 }, repository }), (error) => error.name === "ZodError");
});

test("inactive and forced-password-change actors cannot reach any list repository", async () => {
  const invalidActors = [
    { ...owner, isActive: false },
    { ...staff, mustChangePassword: true },
  ];
  const repository = {
    async listRooms() { assert.fail("Room repository must not be called"); },
    async listFloors() { assert.fail("Floor repository must not be called"); },
    async listInvoices() { assert.fail("Invoice repository must not be called"); },
    async listTickets() { assert.fail("Ticket repository must not be called"); },
  };

  for (const actor of invalidActors) {
    await assert.rejects(listRooms({ actor, repository }), (error) => error.code === "UNAUTHENTICATED");
    await assert.rejects(listFloors({ actor, repository }), (error) => error.code === "UNAUTHENTICATED");
    await assert.rejects(listInvoices({ actor, repository }), (error) => error.code === "UNAUTHENTICATED");
    await assert.rejects(listTickets({ actor, repository }), (error) => error.code === "UNAUTHENTICATED");
  }
  await assert.rejects(listRooms({ actor: tenant, repository }), (error) => error.code === "FORBIDDEN");
  await assert.rejects(listFloors({ actor: tenant, repository }), (error) => error.code === "FORBIDDEN");
});

test("report date filters require real dates in ascending order before querying", async () => {
  let calls = 0;
  const repository = {
    async getFinancialReport() {
      calls += 1;
      return {};
    },
  };

  await assert.rejects(getFinancialReport({
    actor: owner,
    input: { startDate: "2026-02-30", endDate: "2026-03-01" },
    repository,
  }), (error) => error.code === "INVALID_DATES");
  await assert.rejects(getFinancialReport({
    actor: owner,
    input: { startDate: "2026-11-04", endDate: "2026-11-03" },
    repository,
  }), (error) => error.code === "INVALID_DATES");
  assert.equal(calls, 0);
});

test("repository list SQL scopes rows before page limits and uses stable indexed ordering", async () => {
  const [roomSql, floorSql, invoiceSql, ticketSql, schema, migration] = await Promise.all([
    readFile(new URL("../../src/lib/rooms/repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../../src/lib/floors/repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../../src/lib/invoices/repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../../src/lib/tickets/repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../../prisma/schema.prisma", import.meta.url), "utf8"),
    readFile(new URL("../../prisma/migrations/20261103120000_list_query_indexes/migration.sql", import.meta.url), "utf8"),
  ]);

  assert.match(roomSql, /WHERE \(\$1::boolean OR archived_at IS NULL\)[\s\S]*?ORDER BY code[\s\S]*?LIMIT \$3::integer/);
  assert.match(floorSql, /WHERE \(\$1::boolean OR archived_at IS NULL\)[\s\S]*?ORDER BY normalized_name[\s\S]*?LIMIT \$3::integer/);
  const invoiceListSql = invoiceSql.slice(invoiceSql.indexOf("async listInvoices"), invoiceSql.indexOf("async getInvoice"));
  assert.match(invoiceListSql, /lease\.tenant_user_id = actor\.id[\s\S]*?ORDER BY invoice\.due_on DESC, invoice\.id DESC[\s\S]*?LIMIT \$2::integer/);
  assert.match(invoiceListSql, /WHERE id = \$1::uuid[\s\S]*?AND is_active[\s\S]*?NOT must_change_password[\s\S]*?role IN/);
  const invoiceDetailSql = invoiceSql.slice(invoiceSql.indexOf("async getInvoice"), invoiceSql.indexOf("async markInvoiceDelivered"));
  assert.match(invoiceDetailSql, /invoice\.id = \$2::uuid[\s\S]*?lease\.tenant_user_id = actor\.id[\s\S]*?LIMIT 1/);
  const ticketListSql = ticketSql.slice(ticketSql.indexOf("async listTickets"), ticketSql.indexOf("async getTicket"));
  assert.match(ticketListSql, /id = \$1::uuid AND is_active AND NOT must_change_password/);
  assert.match(ticketListSql, /lease\.tenant_user_id = actor\.id[\s\S]*?ORDER BY ticket\.created_at DESC, ticket\.id DESC[\s\S]*?LIMIT \$2::integer/);
  const roomDetailSql = roomSql.slice(roomSql.indexOf("async findRoomForTenant"), roomSql.indexOf("async findFloor"));
  assert.match(roomDetailSql, /room\.id = \$1::uuid[\s\S]*?leases\.tenant_user_id = \$2::uuid[\s\S]*?LIMIT 1/);
  const ticketDetailSql = ticketSql.slice(ticketSql.indexOf("async getTicket"), ticketSql.indexOf("async submitTicketDraft"));
  assert.match(ticketDetailSql, /ticket\.created_by_id = actor\.id[\s\S]*?lease\.tenant_user_id = actor\.id/);
  assert.match(ticketDetailSql, /id = \$1::uuid AND is_active AND NOT must_change_password/);
  assert.match(schema, /@@index\(\[dueOn\(sort: Desc\), id\(sort: Desc\)\], map: "invoices_due_on_id_idx"\)/);
  assert.match(schema, /@@index\(\[createdAt\(sort: Desc\), id\(sort: Desc\)\], map: "tickets_created_at_id_idx"\)/);
  assert.match(migration, /CREATE INDEX "invoices_due_on_id_idx"[\s\S]*?ON "invoices" \("due_on" DESC, "id" DESC\)/);
  assert.match(migration, /CREATE INDEX "tickets_created_at_id_idx"[\s\S]*?ON "tickets" \("created_at" DESC, "id" DESC\)/);
});
