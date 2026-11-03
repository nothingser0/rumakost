import { z } from "zod";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

export function validatePasswordResetRequest(value) {
  return requestSchema.safeParse(value);
}

export async function performPasswordResetRequest({
  rawEmail,
  appOrigin,
  requestReset,
}) {
  const parsed = validatePasswordResetRequest({ email: rawEmail });
  if (!parsed.success) return { status: "invalid" };

  const redirectTo = new URL("/reset-sandi", appOrigin).toString();

  try {
    await requestReset({
      email: parsed.data.email,
      redirectTo,
    });
  } catch {
    return { status: "accepted" };
  }

  return { status: "accepted" };
}
