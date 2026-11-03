import { canDeactivateAccount, canInviteAccount } from "./policy.mjs";

export async function inviteAccount(context, { actorRole, email, name, targetRole }) {
  if (!canInviteAccount(actorRole, targetRole)) return null;
  if (await context.internalAdapter.findUserByEmail(email)) return null;

  return context.internalAdapter.createUser({
    email,
    name,
    emailVerified: false,
    appRole: targetRole,
  });
}

export async function deactivateAccount(context, { actorRole, targetUserId }) {
  const target = await context.internalAdapter.findUserById(targetUserId);
  if (!target || !canDeactivateAccount(actorRole, target.appRole)) return false;

  await context.internalAdapter.updateUser(target.id, {
    banned: true,
    banReason: "Account deactivated",
  });
  await context.internalAdapter.deleteUserSessions(target.id);
  return true;
}
