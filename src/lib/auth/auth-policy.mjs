import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  destinationRole: z.enum(["OWNER", "STAFF", "TENANT"]),
});

export function validateSignInInput(value) {
  return signInSchema.safeParse(value);
}
