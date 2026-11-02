import {
  DomainError,
  mapPersistenceError,
} from "../errors/domain-error.mjs";
import {
  archiveRoomSchema,
  createRoomSchema,
  restoreRoomSchema,
  updateRoomSchema,
} from "../validation/operations.mjs";
import { z } from "zod";

const roomListOptionsSchema = z.object({
  includeArchived: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(20),
  afterCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{1,10}$/).optional(),
}).strict();

function requireActor(actor, roles) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }

  if (!roles.includes(actor.role)) throw new DomainError("FORBIDDEN");
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

function mapRoomPersistenceError(error) {
  if (error instanceof DomainError) return error;

  const record = error && typeof error === "object" ? error : {};
  const code = typeof record.code === "string" ? record.code : "";
  const constraint = typeof record.constraint === "string" ? record.constraint : "";
  const message = typeof record.message === "string" ? record.message : "";

  if (message.includes("ROOM_NOT_FOUND")) {
    return new DomainError("ROOM_NOT_FOUND");
  }

  if (code === "23505" || code === "P2002") {
    if (constraint.includes("floors_normalized_name")) {
      return new DomainError("FLOOR_NAME_TAKEN");
    }
    return new DomainError("ROOM_CODE_TAKEN");
  }

  if (
    message.includes("ROOM_ACTIVE_LEASE_ARCHIVE_DENIED") ||
    message.includes("ROOM_OCCUPIED_STATUS_CHANGE_DENIED")
  ) {
    return new DomainError("ROOM_IN_USE");
  }
  if (message.includes("ROOM_ARCHIVED_FLOOR_DENIED")) {
    return new DomainError("CONFLICT");
  }

  if (code === "23514") return new DomainError("VALIDATION_ERROR");
  if (code === "23503") return new DomainError("FLOOR_NOT_FOUND");
  return mapPersistenceError(error);
}

async function persist(operation) {
  try {
    return await operation();
  } catch (error) {
    throw mapRoomPersistenceError(error);
  }
}

function calculateDefaultDeposit(rent) {
  const [whole, fraction] = rent.split(".");
  const rentMinorUnits = BigInt(whole) * 100n + BigInt(fraction);
  const increment = 5_000_000n;
  const roundedMinorUnits =
    ((rentMinorUnits + increment) / (increment * 2n)) * increment;

  return `${roundedMinorUnits / 100n}.${String(roundedMinorUnits % 100n).padStart(2, "0")}`;
}

async function requireActiveFloor(repository, floorId) {
  if (floorId === null || floorId === undefined) return;

  const floor = await persist(() => repository.findFloor(floorId));
  if (!floor || floor.archivedAt !== null) throw new DomainError("FLOOR_NOT_FOUND");
}

export async function createRoom({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const data = parse(createRoomSchema, input);
  await requireActiveFloor(repository, data.floorId ?? null);

  const existing = await persist(() => repository.findRoomByCode(data.code));
  if (existing) throw new DomainError("ROOM_CODE_TAKEN");

  return persist(() =>
    repository.createRoom({
      code: data.code,
      floorId: data.floorId ?? null,
      roomType: data.roomType ?? null,
      widthMeters: data.widthMeters ?? null,
      lengthMeters: data.lengthMeters ?? null,
      monthlyRent: data.rent,
      depositDefaultAmount: calculateDefaultDeposit(data.rent),
      physicalStatus: data.physicalStatus,
      maintenanceNote: null,
    }),
  );
}

export async function updateRoom({ actor, input, repository }) {
  requireActor(actor, ["OWNER", "STAFF"]);
  const data = parse(updateRoomSchema, input);
  const isStaff = actor.role === "STAFF";
  const fields = Object.keys(data).filter((key) => key !== "roomId");

  if (isStaff && (fields.length !== 1 || fields[0] !== "physicalStatus")) {
    throw new DomainError("FORBIDDEN");
  }

  const room = await persist(() => repository.findRoom(data.roomId));
  if (!room || room.archivedAt !== null) throw new DomainError("ROOM_NOT_FOUND");

  if (data.floorId !== undefined) {
    await requireActiveFloor(repository, data.floorId ?? null);
  }

  if (
    data.physicalStatus !== undefined &&
    data.physicalStatus !== room.physicalStatus &&
    (await persist(() => repository.hasBlockingLease(data.roomId)))
  ) {
    throw new DomainError("ROOM_IN_USE");
  }

  if (data.code !== undefined) {
    const existing = await persist(() => repository.findRoomByCode(data.code));
    if (existing && existing.id !== data.roomId) {
      throw new DomainError("ROOM_CODE_TAKEN");
    }
  }

  const updates = {};
  if (data.code !== undefined) updates.code = data.code;
  if (data.floorId !== undefined) updates.floorId = data.floorId;
  if (data.roomType !== undefined) updates.roomType = data.roomType;
  if (data.widthMeters !== undefined) updates.widthMeters = data.widthMeters;
  if (data.lengthMeters !== undefined) updates.lengthMeters = data.lengthMeters;
  if (data.rent !== undefined) updates.monthlyRent = data.rent;
  if (data.depositDefaultAmount !== undefined) {
    updates.depositDefaultAmount = data.depositDefaultAmount;
  }
  if (data.physicalStatus !== undefined) {
    updates.physicalStatus = data.physicalStatus;
  }
  if (data.maintenanceNote !== undefined) updates.maintenanceNote = data.maintenanceNote;

  return persist(() => repository.updateRoom(data.roomId, updates));
}

export async function archiveRoom({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { roomId } = parse(archiveRoomSchema, input);
  const room = await persist(() => repository.findRoom(roomId));
  if (!room || room.archivedAt !== null) throw new DomainError("ROOM_NOT_FOUND");
  if (await persist(() => repository.hasBlockingLease(roomId))) {
    throw new DomainError("ROOM_IN_USE");
  }

  return persist(() => repository.archiveRoom(roomId));
}

export async function restoreRoom({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { roomId } = parse(restoreRoomSchema, input);
  const room = await persist(() => repository.findRoom(roomId));
  if (!room || room.archivedAt === null) throw new DomainError("ROOM_NOT_FOUND");

  await requireActiveFloor(repository, room.floorId);
  if (await persist(() => repository.hasBlockingLease(roomId))) {
    throw new DomainError("ROOM_IN_USE");
  }

  return persist(() => repository.restoreRoom(roomId));
}

export async function getRoom({ actor, input, repository }) {
  requireActor(actor, ["OWNER", "STAFF", "TENANT"]);
  const { roomId } = parse(archiveRoomSchema, input);

  const room = actor.role === "TENANT"
    ? await persist(() => repository.findRoomForTenant(roomId, actor.id))
    : await persist(() => repository.findRoom(roomId));

  if (!room) throw new DomainError("ROOM_NOT_FOUND");
  return room;
}

export async function listRooms({ actor, options = {}, repository }) {
  requireActor(actor, ["OWNER", "STAFF"]);
  const parsedOptions = parse(roomListOptionsSchema, options);
  if (parsedOptions.includeArchived && actor.role !== "OWNER") {
    throw new DomainError("FORBIDDEN");
  }

  return persist(() => repository.listRooms(parsedOptions));
}

export { calculateDefaultDeposit };
