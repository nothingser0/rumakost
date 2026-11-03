import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getAuthAppUser } from "@/lib/auth/app-user";

export async function getCurrentAuthAppUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  const subject = session?.user.id;

  return subject ? getAuthAppUser(subject) : null;
}
