import type { PrismaClient } from "@/generated/prisma/client";
import type { BetterAuthOptions } from "better-auth";
import type { betterAuth } from "better-auth/minimal";
import type { AuthEmailSender } from "./email-delivery";

export type BetterAuthProviderOptions = {
  prisma: PrismaClient;
  baseURL: string;
  secret: string;
  appOrigin: string;
  emailSender: AuthEmailSender;
  isActiveAppUser(authSubject: string): Promise<boolean>;
  onPasswordReset?(authSubject: string): Promise<void>;
  disableSignUp?: boolean;
};

export function createBetterAuthOptions(
  options: BetterAuthProviderOptions,
): BetterAuthOptions;

export function createBetterAuth(
  options: BetterAuthProviderOptions,
): ReturnType<typeof betterAuth>;
