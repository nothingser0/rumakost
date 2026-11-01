import "server-only";

import { auth } from "@/lib/auth/server";
import { getAuthAppUser } from "@/lib/auth/app-user";

export async function getCurrentAuthAppUser() {
  const session = await auth.getSession();
  const subject = session.data?.user?.id;

  return subject ? getAuthAppUser(subject) : null;
}
