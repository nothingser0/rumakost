import { z } from "zod";

const completionSchema = z
  .object({
    token: z.string().min(1).max(2048).refine((value) => value.trim().length > 0),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
  });

export function validatePasswordResetCompletion(value) {
  return completionSchema.safeParse(value);
}

export async function performPasswordResetCompletion({
  rawToken,
  rawNewPassword,
  rawConfirmPassword,
  resetPassword,
}) {
  const parsed = validatePasswordResetCompletion({
    token: rawToken,
    newPassword: rawNewPassword,
    confirmPassword: rawConfirmPassword,
  });

  if (!parsed.success) return { status: "invalid" };

  try {
    const result = await resetPassword({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
    });

    if (
      result?.error ||
      (result?.status !== true && result?.data?.status !== true)
    ) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch {
    return { status: "failed" };
  }
}
