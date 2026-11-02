import assert from "node:assert/strict";
import test from "node:test";
import { ZodError } from "zod";
import {
  archiveFloor,
  createFloor,
  listFloors,
  updateFloor,
} from "../../src/lib/floors/operations.mjs";
import {
  archiveRoom,
  calculateDefaultDeposit,
  createRoom,
  getRoom,
  listRooms,
  restoreRoom,
  updateRoom,
} from "../../src/lib/rooms/operations.mjs";

const owner = {
  id: "00000000-0000-4000-8000-000000000001",
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: "00000000-0000-4000-8000-000000000002", role: "STAFF" };
const tenant = { ...owner, id: "00000000-0000-4000-8000-000000000003", role: "TENANT" };
const otherTenant = { ...owner, id: "00000000-0000-4000-8000-000000000004", role: "TENANT" };
const floorId = "10000000-0000-4000-8000-000000000001";
const roomId = "20000000-0000-4000-8000-000000000001";

function createRepository() {
  let nextFloorId = 2;
  let nextRoomId = 2;
  const floors = new Map();
  const rooms = new Map();
  const blockingLeaseRoomIds = new Set();
  const tenantRoomIds = new Map();

  const repository = {
    floors,
    rooms,
    blockingLeaseRoomIds,
    tenantRoomIds,
    lastRoomListOptions: null,
    lastFloorListOptions: null,
    async findFloor(id) {
      return floors.get(id) ?? null;
    },
    async findFloorByNormalizedName(name) {
      const normalized = name.trim().normalize("NFC").toLowerCase();
      return [...floors.values()].find((floor) => floor.normalizedName === normalized) ?? null;
    },
    async hasUnarchivedRooms(id) {
      return [...rooms.values()].some(
        (room) => room.floorId === id && room.archivedAt === null,
      );
    },
    async createFloor(input) {
      const floor = {
        id: `10000000-0000-4000-8000-${String(nextFloorId++).padStart(12, "0")}`,
        ...input,
        normalizedName: input.name.trim().normalize("NFC").toLowerCase(),
        archivedAt: null,
      };
      floors.set(floor.id, floor);
      return floor;
    },
    async updateFloor(id, input) {
      const floor = {
        ...floors.get(id),
        ...input,
        normalizedName: input.name.trim().normalize("NFC").toLowerCase(),
      };
      floors.set(id, floor);
      return floor;
    },
    async archiveFloor(id) {
      const floor = { ...floors.get(id), archivedAt: "2026-11-02T00:00:00.000Z" };
      floors.set(id, floor);
      return floor;
    },
    async restoreFloor(id) {
      const floor = { ...floors.get(id), archivedAt: null };
      floors.set(id, floor);
      return floor;
    },
    async listFloors(options) {
      this.lastFloorListOptions = options;
      const afterName = options.afterName?.trim().normalize("NFC").toLowerCase();
      return [...floors.values()]
        .filter((floor) => options.includeArchived || floor.archivedAt === null)
        .filter((floor) => !afterName || floor.normalizedName > afterName)
        .slice(0, options.limit);
    },
    async findRoom(id) {
      return rooms.get(id) ?? null;
    },
    async findRoomByCode(code) {
      return [...rooms.values()].find((room) => room.code === code) ?? null;
    },
    async findRoomForTenant(id, tenantUserId) {
      const allowedRoomIds = tenantRoomIds.get(tenantUserId) ?? new Set();
      return allowedRoomIds.has(id) ? rooms.get(id) ?? null : null;
    },
    async hasBlockingLease(id) {
      return blockingLeaseRoomIds.has(id);
    },
    async listRooms(options) {
      this.lastRoomListOptions = options;
      return [...rooms.values()]
        .filter((room) => options.includeArchived || room.archivedAt === null)
        .filter((room) => !options.afterCode || room.code > options.afterCode)
        .slice(0, options.limit);
    },
    async createRoom(input) {
      const room = {
        id: `20000000-0000-4000-8000-${String(nextRoomId++).padStart(12, "0")}`,
        ...input,
        archivedAt: null,
      };
      rooms.set(room.id, room);
      return room;
    },
    async updateRoom(id, input) {
      const room = { ...rooms.get(id), ...input };
      rooms.set(id, room);
      return room;
    },
    async archiveRoom(id) {
      const room = { ...rooms.get(id), archivedAt: "2026-11-02T00:00:00.000Z" };
      rooms.set(id, room);
      return room;
    },
    async restoreRoom(id) {
      const room = { ...rooms.get(id), archivedAt: null };
      rooms.set(id, room);
      return room;
    },
  };

  floors.set(floorId, {
    id: floorId,
    name: "Lantai 1",
    normalizedName: "lantai 1",
    archivedAt: null,
  });

  return repository;
}

function createRoomInput(overrides = {}) {
  return {
    code: " C-01 ",
    floorId,
    roomType: " Standar ",
    widthMeters: 3.5,
    lengthMeters: 4,
    rent: "1750000",
    physicalStatus: "READY",
    ...overrides,
  };
}

function createExistingRoom(repository, overrides = {}) {
  const room = {
    id: roomId,
    code: "C-01",
    floorId,
    roomType: "Standar",
    widthMeters: "3.50",
    lengthMeters: "4.00",
    monthlyRent: "1750000.00",
    depositDefaultAmount: "900000.00",
    physicalStatus: "READY",
    maintenanceNote: null,
    archivedAt: null,
    ...overrides,
  };
  repository.rooms.set(room.id, room);
  return room;
}

test("normalizes floor names and rejects collisions after normalization", async () => {
  const repository = createRepository();
  const floor = await createFloor({
    actor: owner,
    input: { name: "  LANTAI   2  " },
    repository,
  });

  assert.equal(floor.name, "LANTAI   2");
  assert.equal([...repository.floors.values()].at(-1).normalizedName, "lantai   2");
  await assert.rejects(
    () => createFloor({ actor: owner, input: { name: " lantai   2 " }, repository }),
    (error) => error.code === "FLOOR_NAME_TAKEN",
  );
});

test("normalizes room codes and calculates the approved default deposit", async () => {
  const repository = createRepository();
  const room = await createRoom({ actor: owner, input: createRoomInput(), repository });

  assert.equal(room.code, "C-01");
  assert.equal(room.roomType, "Standar");
  assert.equal(room.widthMeters, "3.50");
  assert.equal(room.monthlyRent, "1750000.00");
  assert.equal(room.depositDefaultAmount, "900000.00");
  assert.equal(calculateDefaultDeposit("1.00"), "0.00");
  assert.equal(calculateDefaultDeposit("150000.00"), "100000.00");
});

test("rejects room codes that collide after trimming and uppercasing", async () => {
  const repository = createRepository();
  createExistingRoom(repository);

  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput({ code: " c-01 " }), repository }),
    (error) => error.code === "ROOM_CODE_TAKEN",
  );
});

test("rejects room-code collisions after normalization during updates", async () => {
  const repository = createRepository();
  createExistingRoom(repository);
  const secondRoom = await createRoom({
    actor: owner,
    input: createRoomInput({ code: "C-02" }),
    repository,
  });

  await assert.rejects(
    () => updateRoom({
      actor: owner,
      input: { roomId: secondRoom.id, code: " c-01 " },
      repository,
    }),
    (error) => error.code === "ROOM_CODE_TAKEN",
  );
});

test("enforces money, dimensions, and paired dimension boundaries", async () => {
  const repository = createRepository();
  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput({ rent: "0" }), repository }),
    (error) => error instanceof ZodError,
  );
  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput({ rent: "100000000.01" }), repository }),
    (error) => error instanceof ZodError,
  );
  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput({ widthMeters: 0 }), repository }),
    (error) => error instanceof ZodError,
  );
  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput({ lengthMeters: undefined }), repository }),
    (error) => error instanceof ZodError,
  );
  createExistingRoom(repository);
  await assert.rejects(
    () => updateRoom({
      actor: owner,
      input: { roomId, depositDefaultAmount: "100000000.01" },
      repository,
    }),
    (error) => error instanceof ZodError,
  );

  const boundaryRoom = await createRoom({
    actor: owner,
    input: createRoomInput({ code: "MAX", rent: "100000000", widthMeters: undefined, lengthMeters: undefined }),
    repository,
  });
  assert.equal(boundaryRoom.depositDefaultAmount, "50000000.00");
});

test("allows Staff to change only room physical status", async () => {
  const repository = createRepository();
  createExistingRoom(repository);

  const updated = await updateRoom({
    actor: staff,
    input: { roomId, physicalStatus: "CLEANING" },
    repository,
  });
  assert.equal(updated.physicalStatus, "CLEANING");

  await assert.rejects(
    () => updateRoom({
      actor: staff,
      input: { roomId, code: "C-02" },
      repository,
    }),
    (error) => error.code === "FORBIDDEN",
  );
  await assert.rejects(
    () => createFloor({ actor: staff, input: { name: "Lantai 2" }, repository }),
    (error) => error.code === "FORBIDDEN",
  );
  await assert.rejects(
    () => createRoom({ actor: tenant, input: createRoomInput(), repository }),
    (error) => error.code === "FORBIDDEN",
  );
});

test("blocks room archive and physical status changes while a lease is scheduled or active", async () => {
  const repository = createRepository();
  createExistingRoom(repository);
  repository.blockingLeaseRoomIds.add(roomId);

  await assert.rejects(
    () => archiveRoom({ actor: owner, input: { roomId }, repository }),
    (error) => error.code === "ROOM_IN_USE",
  );
  await assert.rejects(
    () => updateRoom({
      actor: staff,
      input: { roomId, physicalStatus: "MAINTENANCE" },
      repository,
    }),
    (error) => error.code === "ROOM_IN_USE",
  );

  repository.blockingLeaseRoomIds.delete(roomId);
  const archived = await archiveRoom({ actor: owner, input: { roomId }, repository });
  assert.notEqual(archived.archivedAt, null);
  assert.equal(repository.rooms.has(roomId), true);

  repository.blockingLeaseRoomIds.add(roomId);
  await assert.rejects(
    () => restoreRoom({ actor: owner, input: { roomId }, repository }),
    (error) => error.code === "ROOM_IN_USE",
  );
});

test("floor archive waits for active room records; restore requires an active floor", async () => {
  const repository = createRepository();
  createExistingRoom(repository);

  await assert.rejects(
    () => archiveFloor({ actor: owner, input: { floorId }, repository }),
    (error) => error.code === "FLOOR_IN_USE",
  );

  await archiveRoom({ actor: owner, input: { roomId }, repository });
  const archivedFloor = await archiveFloor({ actor: owner, input: { floorId }, repository });
  assert.notEqual(archivedFloor.archivedAt, null);

  await assert.rejects(
    () => restoreRoom({ actor: owner, input: { roomId }, repository }),
    (error) => error.code === "FLOOR_NOT_FOUND",
  );

  repository.floors.set(floorId, { ...archivedFloor, archivedAt: null });
  const restoredRoom = await restoreRoom({ actor: owner, input: { roomId }, repository });
  assert.equal(restoredRoom.archivedAt, null);
  assert.equal(repository.rooms.has(roomId), true);
});

test("allows Tenant to read only rooms connected to their own lease history", async () => {
  const repository = createRepository();
  createExistingRoom(repository);
  repository.tenantRoomIds.set(tenant.id, new Set([roomId]));

  const ownRoom = await getRoom({
    actor: tenant,
    input: { roomId },
    repository,
  });
  assert.equal(ownRoom.id, roomId);

  await assert.rejects(
    () => getRoom({ actor: otherTenant, input: { roomId }, repository }),
    (error) => error.code === "ROOM_NOT_FOUND",
  );
});

test("bounds room and floor lists to 20 by default and 100 maximum", async () => {
  const repository = createRepository();

  await listRooms({ actor: owner, repository });
  assert.deepEqual(repository.lastRoomListOptions, {
    includeArchived: false,
    limit: 20,
  });

  await listFloors({
    actor: owner,
    options: { includeArchived: true, limit: 100, afterName: " LANTAI 1 " },
    repository,
  });
  assert.deepEqual(repository.lastFloorListOptions, {
    includeArchived: true,
    limit: 100,
    afterName: "LANTAI 1",
  });

  await assert.rejects(
    () => listRooms({ actor: owner, options: { limit: 101 }, repository }),
    (error) => error instanceof ZodError,
  );
  await assert.rejects(
    () => listFloors({ actor: staff, options: { includeArchived: true }, repository }),
    (error) => error.code === "FORBIDDEN",
  );
});

test("maps database race conflicts to stable room and floor errors", async () => {
  const repository = createRepository();
  repository.createRoom = async () => {
    const error = new Error("unique violation");
    error.code = "23505";
    error.constraint = "rooms_code_key";
    throw error;
  };
  await assert.rejects(
    () => createRoom({ actor: owner, input: createRoomInput(), repository }),
    (error) => error.code === "ROOM_CODE_TAKEN",
  );

  const floorRepository = createRepository();
  floorRepository.createFloor = async () => {
    const error = new Error("unique violation");
    error.code = "23505";
    error.constraint = "floors_normalized_name_key";
    throw error;
  };
  await assert.rejects(
    () => createFloor({ actor: owner, input: { name: "Lantai 2" }, repository: floorRepository }),
    (error) => error.code === "FLOOR_NAME_TAKEN",
  );

  const leaseRaceRepository = createRepository();
  createExistingRoom(leaseRaceRepository);
  leaseRaceRepository.archiveRoom = async () => {
    throw new Error("ROOM_ACTIVE_LEASE_ARCHIVE_DENIED");
  };
  await assert.rejects(
    () => archiveRoom({ actor: owner, input: { roomId }, repository: leaseRaceRepository }),
    (error) => error.code === "ROOM_IN_USE",
  );
});

test("normalizes floor edits and rejects collisions after normalization", async () => {
  const repository = createRepository();
  const secondFloor = await createFloor({
    actor: owner,
    input: { name: "Lantai 2" },
    repository,
  });

  await assert.rejects(
    () => updateFloor({
      actor: owner,
      input: { floorId: secondFloor.id, name: " lantai 1 " },
      repository,
    }),
    (error) => error.code === "FLOOR_NAME_TAKEN",
  );
});
