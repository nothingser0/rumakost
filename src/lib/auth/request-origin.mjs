function parseWebOrigin(value) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.pathname !== "/" ||
      url.search.length > 0 ||
      url.hash.length > 0
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function isSameOriginAuthMutation(originHeader, appOrigin) {
  if (typeof originHeader !== "string") return false;

  const requestOrigin = parseWebOrigin(originHeader);
  const trustedOrigin = parseWebOrigin(appOrigin);

  return requestOrigin !== null && requestOrigin === trustedOrigin;
}

export async function runSameOriginAuthMutation({
  originHeader,
  appOrigin,
  rejectedValue,
  operation,
}) {
  if (!isSameOriginAuthMutation(originHeader, appOrigin)) return rejectedValue;
  return operation();
}
