import { validateAccountInput } from "./policy.mjs";

const accountIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const managerRoles = ["OWNER", "STAFF"];

function isManager(actor) {
  return Boolean(
    actor &&
    actor.id &&
    actor.isActive &&
    !actor.mustChangePassword &&
    managerRoles.includes(actor.role),
  );
}

export async function createManagedAccount({ actor, input, repository, sendActivation }) {
  if (!isManager(actor)) return { status: "forbidden" };

  const validation = validateAccountInput(input, actor.role);
  if (!validation.success) return { status: "invalid" };

  const provision = await repository.provisionAccount({
    actorId: actor.id,
    account: validation.data,
  });
  if (provision.status !== "pending") return { status: "conflict" };

  try {
    await sendActivation({
      email: validation.data.email,
      displayName: validation.data.displayName,
    });
  } catch {
    return { status: "delivery-failed" };
  }

  return { status: "sent" };
}

export async function setManagedAccountActive({ actor, accountId, isActive, repository }) {
  if (!isManager(actor)) return { status: "forbidden" };
  if (!accountIdPattern.test(accountId) || typeof isActive !== "boolean") {
    return { status: "invalid" };
  }

  return repository.setAccountActive({
    actorId: actor.id,
    actorRole: actor.role,
    accountId,
    isActive,
  });
}

export async function transferStaffTickets({
  actor,
  sourceStaffId,
  targetAssigneeId,
  repository,
}) {
  if (!actor?.isActive || actor.mustChangePassword || actor.role !== "OWNER") {
    return { status: "forbidden" };
  }
  if (
    !accountIdPattern.test(sourceStaffId) ||
    !accountIdPattern.test(targetAssigneeId) ||
    sourceStaffId === targetAssigneeId
  ) {
    return { status: "invalid" };
  }

  return repository.transferStaffTickets({
    actorId: actor.id,
    sourceStaffId,
    targetAssigneeId,
  });
}
