import "server-only";

import { notFound, redirect } from "next/navigation";
import type { AuthAppUser } from "@/lib/auth/app-user";
import { getCurrentAuthAppUser } from "@/lib/auth/current-app-user";
import { authorizeAction, authorizeRoute } from "./policy.mjs";

export async function requireRouteAccess(pathname: string): Promise<AuthAppUser> {
  let user: AuthAppUser | null;
  try {
    user = await getCurrentAuthAppUser();
  } catch {
    redirect("/login?error=session");
  }

  if (!user) redirect("/login");

  const decision = authorizeRoute(user, pathname);
  if (!decision.allowed) {
    if (decision.reason === "unauthenticated" || decision.reason === "inactive") {
      redirect(decision.redirectTo);
    }
    if (decision.reason === "password-change-required") {
      redirect(decision.redirectTo);
    }
    if (decision.reason === "activation-not-required") {
      redirect(decision.redirectTo);
    }
    notFound();
  }

  return user;
}

export async function authorizeCurrentAction(options: {
  roles: AuthAppUser["role"][];
  resourceOwnerAppUserId?: string;
  requiresResourceOwnership?: boolean;
  allowForcedPasswordChange?: boolean;
}) {
  let user: AuthAppUser | null;
  try {
    user = await getCurrentAuthAppUser();
  } catch {
    return { allowed: false as const, reason: "session-unavailable" as const, user: null };
  }

  const decision = authorizeAction(user, options);
  return decision.allowed
    ? { allowed: true as const, reason: "allowed" as const, user }
    : { allowed: false as const, reason: decision.reason, user: null };
}
