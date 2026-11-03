import { z } from "zod";
import { DomainError, mapPersistenceError } from "../errors/domain-error.mjs";
import { createTenantProfileAuditMetadata } from "./audit-metadata.mjs";
import { idSchema } from "../validation/primitives.mjs";
import { updateTenantProfileSchema } from "../validation/operations.mjs";

const updateTenantProfileRequestSchema = z.object({
  tenantUserId: idSchema,
  profile: updateTenantProfileSchema,
}).strict();

const updateTenantProfileResultSchema = z.object({
  tenantUserId: idSchema,
  changed: z.boolean(),
}).strict();

function requireActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }

  if (actor.role !== "OWNER" && actor.role !== "TENANT") {
    throw new DomainError("FORBIDDEN");
  }
}

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

export async function updateTenantProfile({ actor, input, repository }) {
  requireActor(actor);
  const data = parse(updateTenantProfileRequestSchema, input);

  if (actor.role === "TENANT" && data.tenantUserId !== actor.id) {
    throw new DomainError("FORBIDDEN");
  }

  let result;
  try {
    result = await repository.updateTenantProfile({
      actorId: actor.id,
      actorRole: actor.role,
      tenantUserId: data.tenantUserId,
      changes: data.profile,
      safeMetadata: createTenantProfileAuditMetadata(data.profile),
    });
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw mapPersistenceError(error);
  }

  if (!result) throw new DomainError("TENANT_PROFILE_NOT_FOUND");
  const parsedResult = updateTenantProfileResultSchema.safeParse(result);
  if (!parsedResult.success) throw new DomainError("INTERNAL_ERROR");

  return parsedResult.data;
}
