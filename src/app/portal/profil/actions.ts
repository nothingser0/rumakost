"use server";

import { submitPasswordChange, type PasswordActionState } from "@/lib/auth/password-actions";

export async function updateTenantPasswordAction(
  previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  return submitPasswordChange(previousState, formData, "tenant");
}
