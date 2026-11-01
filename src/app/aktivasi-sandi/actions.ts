"use server";

import { redirect } from "next/navigation";
import { submitPasswordChange, type PasswordActionState } from "@/lib/auth/password-actions";
import { getCurrentAuthAppUser } from "@/lib/auth/current-app-user";
import { getPostPasswordChangePath } from "@/lib/auth/password-policy.mjs";

export async function activatePasswordAction(
  previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const state = await submitPasswordChange(previousState, formData, "activation");
  if (state.error) return state;

  const user = await getCurrentAuthAppUser();
  if (!user) redirect("/login");
  redirect(getPostPasswordChangePath(user.role));
}
