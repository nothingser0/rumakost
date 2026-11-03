import {
  DomainError,
  mapPersistenceError,
} from "../errors/domain-error.mjs";
import {
  archiveFloorSchema,
  createFloorSchema,
  restoreFloorSchema,
  updateFloorSchema,
} from "../validation/operations.mjs";
import {
  createCursorPage,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../data/pagination.mjs";
import { z } from "zod";

const floorListOptionsSchema = z.object({
  includeArchived: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(MAX_PAGE_SIZE).optional().default(DEFAULT_PAGE_SIZE),
  afterName: z.string().trim().max(100).transform((value) => value.normalize("NFC")).optional(),
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

function mapFloorPersistenceError(error) {
  if (error instanceof DomainError) return error;

  const record = error && typeof error === "object" ? error : {};
  const code = typeof record.code === "string" ? record.code : "";
  const constraint = typeof record.constraint === "string" ? record.constraint : "";
  const message = typeof record.message === "string" ? record.message : "";

  if (message.includes("FLOOR_NOT_FOUND")) {
    return new DomainError("FLOOR_NOT_FOUND");
  }

  if (code === "23505" || code === "P2002") {
    return new DomainError("FLOOR_NAME_TAKEN");
  }
  if (message.includes("FLOOR_ACTIVE_ROOMS_ARCHIVE_DENIED")) {
    return new DomainError("FLOOR_IN_USE");
  }
  if (code === "23503") return new DomainError("FLOOR_NOT_FOUND");
  if (code === "23514") return new DomainError("VALIDATION_ERROR");

  if (constraint.includes("floors_normalized_name")) {
    return new DomainError("FLOOR_NAME_TAKEN");
  }
  return mapPersistenceError(error);
}

async function persist(operation) {
  try {
    return await operation();
  } catch (error) {
    throw mapFloorPersistenceError(error);
  }
}

async function requireAvailableName(repository, name, floorId = null) {
  const existing = await persist(() => repository.findFloorByNormalizedName(name));

  if (existing && existing.id !== floorId) {
    throw new DomainError("FLOOR_NAME_TAKEN");
  }
}

export async function createFloor({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { name } = parse(createFloorSchema, input);
  await requireAvailableName(repository, name);

  return persist(() => repository.createFloor({ name, actorId: actor.id }));
}

export async function updateFloor({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { floorId, name } = parse(updateFloorSchema, input);
  const floor = await persist(() => repository.findFloor(floorId));
  if (!floor || floor.archivedAt !== null) {
    throw new DomainError("FLOOR_NOT_FOUND");
  }

  await requireAvailableName(repository, name, floorId);
  if (name === floor.name) return floor;
  return persist(() =>
    repository.updateFloor(floorId, { name }, actor.id),
  );
}

export async function archiveFloor({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { floorId } = parse(archiveFloorSchema, input);
  const floor = await persist(() => repository.findFloor(floorId));
  if (!floor || floor.archivedAt !== null) {
    throw new DomainError("FLOOR_NOT_FOUND");
  }

  if (await persist(() => repository.hasUnarchivedRooms(floorId))) {
    throw new DomainError("FLOOR_IN_USE");
  }

  return persist(() => repository.archiveFloor(floorId, actor.id));
}

export async function restoreFloor({ actor, input, repository }) {
  requireActor(actor, ["OWNER"]);
  const { floorId } = parse(restoreFloorSchema, input);
  const floor = await persist(() => repository.findFloor(floorId));
  if (!floor || floor.archivedAt === null) {
    throw new DomainError("FLOOR_NOT_FOUND");
  }

  await requireAvailableName(repository, floor.name, floorId);
  return persist(() => repository.restoreFloor(floorId, actor.id));
}

export async function listFloors({ actor, options = {}, repository }) {
  requireActor(actor, ["OWNER", "STAFF"]);
  const parsedOptions = parse(floorListOptionsSchema, options);
  if (parsedOptions.includeArchived && actor.role !== "OWNER") {
    throw new DomainError("FORBIDDEN");
  }

  const rows = await persist(() => repository.listFloors({
    ...parsedOptions,
    limit: parsedOptions.limit + 1,
  }));
  if (!Array.isArray(rows)) throw new DomainError("INTERNAL_ERROR");

  return createCursorPage(rows, parsedOptions.limit, (floor) => ({
    afterName: floor.name,
  }));
}
