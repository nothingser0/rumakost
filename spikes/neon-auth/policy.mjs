const roles = new Set(["OWNER", "STAFF", "TENANT"]);

export function canInviteAccount(actorRole, targetRole) {
  if (!roles.has(actorRole) || !roles.has(targetRole)) return false;
  if (actorRole === "OWNER") return targetRole === "STAFF" || targetRole === "TENANT";
  return actorRole === "STAFF" && targetRole === "TENANT";
}

export function canDeactivateAccount(actorRole, targetRole) {
  if (!roles.has(actorRole) || !roles.has(targetRole)) return false;
  if (actorRole === "OWNER") return targetRole === "STAFF" || targetRole === "TENANT";
  return actorRole === "STAFF" && targetRole === "TENANT";
}

export function canStartTargetEmailChange(actorRole) {
  return actorRole === "OWNER";
}

export function reconcileVerifiedEmailChange(appUser, providerUser, requestedEmail) {
  const requestedEmailNormalized = normalizeEmail(requestedEmail);
  const providerEmailNormalized = normalizeEmail(providerUser?.email);

  if (
    !appUser ||
    !providerUser ||
    providerUser.id !== appUser.authSubject ||
    providerUser.emailVerified !== true ||
    providerEmailNormalized !== requestedEmailNormalized
  ) {
    return appUser;
  }

  if (appUser.emailNormalized === requestedEmailNormalized) return appUser;
  return { ...appUser, emailNormalized: requestedEmailNormalized };
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}
