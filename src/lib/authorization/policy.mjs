const routePolicies = [
  { prefix: "/aktivasi-sandi", roles: ["OWNER", "STAFF", "TENANT"], activationOnly: true },
  { prefix: "/pengaturan/akun", roles: ["OWNER", "STAFF"] },
  { prefix: "/portal", roles: ["TENANT"] },
  { prefix: "/laporan", roles: ["OWNER"] },
  { prefix: "/aktivitas", roles: ["OWNER"] },
  { prefix: "/pengaturan", roles: ["OWNER"] },
  { prefix: "/dashboard", roles: ["OWNER", "STAFF"] },
  { prefix: "/profil", roles: ["OWNER", "STAFF"] },
  { prefix: "/kamar", roles: ["OWNER", "STAFF"] },
  { prefix: "/penghuni", roles: ["OWNER", "STAFF"] },
  { prefix: "/kontrak", roles: ["OWNER", "STAFF"] },
  { prefix: "/tagihan", roles: ["OWNER", "STAFF"] },
  { prefix: "/pembayaran", roles: ["OWNER", "STAFF"] },
  { prefix: "/pengeluaran", roles: ["OWNER", "STAFF"] },
  { prefix: "/tiket", roles: ["OWNER", "STAFF"] },
];

const landingForRole = (role) => role === "TENANT" ? "/portal" : "/dashboard";

function findRoutePolicy(pathname) {
  return routePolicies.find(({ prefix }) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function authorizeRoute(user, pathname) {
  if (!user) return { allowed: false, reason: "unauthenticated", redirectTo: "/login" };
  if (!user.isActive) return { allowed: false, reason: "inactive", redirectTo: "/login" };

  const policy = findRoutePolicy(pathname);
  if (!policy) return { allowed: false, reason: "unclassified-route", redirectTo: "/403" };

  if (user.mustChangePassword && !policy.activationOnly) {
    return { allowed: false, reason: "password-change-required", redirectTo: "/aktivasi-sandi" };
  }

  if (policy.activationOnly && !user.mustChangePassword) {
    return { allowed: false, reason: "activation-not-required", redirectTo: landingForRole(user.role) };
  }

  if (!policy.roles.includes(user.role)) {
    return { allowed: false, reason: "role-denied", redirectTo: "/403" };
  }

  return { allowed: true, reason: "allowed", redirectTo: null };
}

export function authorizeAction(user, {
  roles,
  resourceOwnerAppUserId = "",
  requiresResourceOwnership = false,
  allowForcedPasswordChange = false,
}) {
  if (!user) return { allowed: false, reason: "unauthenticated" };
  if (!user.isActive) return { allowed: false, reason: "inactive" };
  if (user.mustChangePassword && !allowForcedPasswordChange) {
    return { allowed: false, reason: "password-change-required" };
  }
  if (!roles.includes(user.role)) return { allowed: false, reason: "role-denied" };

  if (
    requiresResourceOwnership &&
    user.role === "TENANT" &&
    resourceOwnerAppUserId !== user.id
  ) {
    return { allowed: false, reason: "ownership-denied" };
  }

  return { allowed: true, reason: "allowed" };
}
