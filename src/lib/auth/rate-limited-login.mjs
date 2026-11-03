const credentialFailureCodes = new Set([
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_PASSWORD",
  "invalid_credentials",
]);

export function isCredentialAuthError(error) {
  if (typeof error !== "object" || error === null) return false;

  const authError = error;
  if (authError.status === 401) return true;

  return (
    typeof authError.code === "string" &&
    credentialFailureCodes.has(authError.code)
  );
}

export async function performRateLimitedLogin({
  email,
  findAccountId,
  reserveAttempt,
  authenticate,
  recordFailure,
  recordSuccess,
}) {
  let appUserId;

  try {
    appUserId = await findAccountId(email.trim().toLowerCase());
  } catch {
    return { status: "unavailable" };
  }

  if (appUserId) {
    let reservation;

    try {
      reservation = await reserveAttempt(appUserId);
    } catch {
      return { status: "unavailable" };
    }

    if (reservation?.allowed !== true) {
      return reservation?.allowed === false
        ? { status: "invalid" }
        : { status: "unavailable" };
    }
  }

  let authenticationResult;

  try {
    authenticationResult = await authenticate();
  } catch {
    return { status: "unavailable" };
  }

  if (authenticationResult === "invalid") {
    if (appUserId) {
      try {
        await recordFailure(appUserId);
      } catch {
        return { status: "unavailable" };
      }
    }

    return { status: "invalid" };
  }

  if (authenticationResult !== "success") {
    return { status: "unavailable" };
  }

  if (appUserId) {
    try {
      await recordSuccess(appUserId);
    } catch {
      return { status: "authenticated-but-unavailable" };
    }
  }

  return { status: "success", appUserId: appUserId ?? null };
}
