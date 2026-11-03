import type { PrismaClient } from "../../generated/prisma/client";
import type { AppRole } from "./app-user";

export type EmailChangeActor = {
  id: string;
  role: AppRole;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type EmailChangeResult =
  | { status: "forbidden" | "invalid" | "conflict" | "delivery-failed" | "sent" | "unchanged" | "not-found" }
  | { status: "pending"; requestId: string; email: string; displayName: string }
  | { status: "completed" | "already-completed" | "expired" };

export type EmailChangeRepository = {
  requestChange(input: {
    actorId: string;
    targetUserId: string;
    email: string;
    now: Date;
    expiresAt: Date;
  }): Promise<EmailChangeResult>;
  completeChange(input: {
    targetUserId: string;
    requestId: string;
    now: Date;
  }): Promise<EmailChangeResult>;
};

export function requestLoginEmailChange(input: {
  actor: EmailChangeActor | null;
  targetUserId: string;
  email: unknown;
  repository: EmailChangeRepository;
  sendVerification(input: { email: string; name: string; url: string }): Promise<void>;
  appOrigin: string;
  secret: string;
  now?: Date;
}): Promise<EmailChangeResult>;

export function completeLoginEmailChange(input: {
  token: unknown;
  repository: EmailChangeRepository;
  secret: string;
  now?: Date;
}): Promise<EmailChangeResult>;

export function createEmailChangeRepository(
  prisma: PrismaClient,
  options?: { createRequestId?: () => string },
): EmailChangeRepository;

export function createEmailChangeToken(input: {
  targetUserId: string;
  requestId: string;
  secret: string;
}): string;

export function isEmailChangeTokenShape(token: unknown): token is string;
