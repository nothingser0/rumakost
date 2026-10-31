import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  destinationRole: z.enum(["OWNER", "STAFF", "TENANT"]),
});

export function validateSignInInput(value) {
  return signInSchema.safeParse(value);
}

export function getSessionUser(result) {
  return result?.data?.user ?? null;
}

export function isAllowedAuthReadPath(path) {
  return path.length === 1 && path[0] === "get-session";
}
