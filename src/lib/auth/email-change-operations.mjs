import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const accountIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const requestIdPattern = accountIdPattern;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const verificationPrefix = "app-user-email-change:";
const requestLifetimeMs = 24 * 60 * 60 * 1000;

export async function requestLoginEmailChange({
  actor,
  targetUserId,
  email,
  repository,
  sendVerification,
  appOrigin,
  secret,
  now = new Date(),
}) {
  if (!actor?.isActive || actor.mustChangePassword || actor.role !== "OWNER") {
    return { status: "forbidden" };
  }

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (
    !accountIdPattern.test(targetUserId) ||
    normalizedEmail.length > 254 ||
    !emailPattern.test(normalizedEmail) ||
    typeof secret !== "string" ||
    secret.length < 32 ||
    !isOrigin(appOrigin)
  ) {
    return { status: "invalid" };
  }

  const request = await repository.requestChange({
    actorId: actor.id,
    targetUserId,
    email: normalizedEmail,
    now,
    expiresAt: new Date(now.getTime() + requestLifetimeMs),
  });

  if (request.status !== "pending") return request;

  const token = createEmailChangeToken({
    targetUserId,
    requestId: request.requestId,
    secret,
  });
  const verificationUrl = new URL("/verifikasi-email", appOrigin);
  verificationUrl.searchParams.set("token", token);

  try {
    await sendVerification({
      email: request.email,
      name: request.displayName,
      url: verificationUrl.toString(),
    });
  } catch {
    return { status: "delivery-failed" };
  }

  return { status: "sent" };
}

export async function completeLoginEmailChange({
  token,
  repository,
  secret,
  now = new Date(),
}) {
  if (typeof token !== "string" || token.length > 256) return { status: "invalid" };
  const payload = readEmailChangeToken(token, secret);
  if (!payload) return { status: "invalid" };
  return repository.completeChange({ ...payload, now });
}

export function createEmailChangeRepository(prisma, { createRequestId = randomUUID } = {}) {
  return {
    async requestChange(input) {
      try {
        return await prisma.$transaction(async (transaction) => {
          await lockAppUser(transaction, input.targetUserId);
          const target = await transaction.appUser.findUnique({
            where: { id: input.targetUserId },
            select: {
              id: true,
              authSubject: true,
              displayName: true,
              role: true,
              emailNormalized: true,
            },
          });
          if (!target || target.role === "OWNER") return { status: "not-found" };
          if (target.emailNormalized === input.email) return { status: "unchanged" };

          const [existingAppUser, existingAuthUser, authUser] = await Promise.all([
            transaction.appUser.findUnique({
              where: { emailNormalized: input.email },
              select: { id: true },
            }),
            transaction.user.findFirst({
              where: {
                email: { equals: input.email, mode: "insensitive" },
                NOT: { id: target.authSubject },
              },
              select: { id: true },
            }),
            transaction.user.findUnique({
              where: { id: target.authSubject },
              select: { id: true },
            }),
          ]);
          if (existingAppUser || existingAuthUser || !authUser) {
            return existingAppUser || existingAuthUser
              ? { status: "conflict" }
              : { status: "not-found" };
          }

          const identifier = `${verificationPrefix}${target.id}`;
          const verifications = await transaction.verification.findMany({
            where: { identifier },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 2,
            select: { id: true, value: true, expiresAt: true },
          });
          const current = verifications[0];
          const currentValue = readVerificationValue(current?.value);
          const reuse = Boolean(
            current &&
            currentValue?.status === "pending" &&
            currentValue.email === input.email &&
            current.expiresAt > input.now,
          );
          const requestId = reuse ? currentValue.requestId : createRequestId();
          if (!requestIdPattern.test(requestId)) throw new Error("INVALID_EMAIL_CHANGE_REQUEST_ID");
          const value = JSON.stringify({
            requestId,
            status: "pending",
            email: input.email,
            requestedById: reuse ? currentValue.requestedById : input.actorId,
          });

          if (current) {
            await transaction.verification.update({
              where: { id: current.id },
              data: {
                value,
                expiresAt: reuse ? current.expiresAt : input.expiresAt,
              },
            });
          } else {
            await transaction.verification.create({
              data: { identifier, value, expiresAt: input.expiresAt },
            });
          }
          if (verifications.length > 1) {
            await transaction.verification.deleteMany({
              where: { identifier, id: { not: current.id } },
            });
          }

          if (!reuse) {
            await transaction.auditEvent.create({
              data: {
                actorId: input.actorId,
                action: "APP_USER_LOGIN_EMAIL_CHANGE_REQUESTED",
                entityType: "APP_USER",
                entityId: target.id,
                reason: "OWNER_REQUESTED_LOGIN_EMAIL_CHANGE",
                safeMetadata: { requestId },
              },
            });
          }

          return {
            status: "pending",
            requestId,
            email: input.email,
            displayName: target.displayName,
          };
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) return { status: "conflict" };
        throw error;
      }
    },

    async completeChange(input) {
      try {
        return await prisma.$transaction(async (transaction) => {
          await lockAppUser(transaction, input.targetUserId);
          const target = await transaction.appUser.findUnique({
            where: { id: input.targetUserId },
            select: {
              id: true,
              authSubject: true,
              emailNormalized: true,
            },
          });
          if (!target) return { status: "invalid" };

          const identifier = `${verificationPrefix}${target.id}`;
          const verification = await transaction.verification.findFirst({
            where: { identifier },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            select: { id: true, value: true, expiresAt: true },
          });
          const value = readVerificationValue(verification?.value);
          if (!verification || value?.requestId !== input.requestId) {
            return { status: "invalid" };
          }
          if (value.status === "completed") return { status: "already-completed" };
          if (
            value.status !== "pending" ||
            verification.expiresAt <= input.now ||
            typeof value.email !== "string" ||
            typeof value.requestedById !== "string"
          ) {
            return { status: "expired" };
          }

          const [existingAppUser, existingAuthUser, authUser] = await Promise.all([
            transaction.appUser.findUnique({
              where: { emailNormalized: value.email },
              select: { id: true },
            }),
            transaction.user.findFirst({
              where: {
                email: { equals: value.email, mode: "insensitive" },
                NOT: { id: target.authSubject },
              },
              select: { id: true },
            }),
            transaction.user.findUnique({
              where: { id: target.authSubject },
              select: { id: true, email: true, emailVerified: true },
            }),
          ]);
          if (existingAppUser || existingAuthUser) return { status: "conflict" };
          if (!authUser) return { status: "invalid" };

          if (authUser.email.toLowerCase() !== value.email || !authUser.emailVerified) {
            await transaction.user.update({
              where: { id: target.authSubject },
              data: { email: value.email, emailVerified: true },
            });
          }
          if (target.emailNormalized !== value.email) {
            await transaction.appUser.update({
              where: { id: target.id },
              data: { emailNormalized: value.email },
            });
          }

          await transaction.auditEvent.create({
            data: {
              actorId: value.requestedById,
              action: "APP_USER_LOGIN_EMAIL_CHANGED",
              entityType: "APP_USER",
              entityId: target.id,
              reason: "NEW_LOGIN_EMAIL_VERIFIED",
              safeMetadata: { requestId: value.requestId },
            },
          });
          await transaction.verification.update({
            where: { id: verification.id },
            data: {
              value: JSON.stringify({ requestId: value.requestId, status: "completed" }),
            },
          });

          return { status: "completed" };
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) return { status: "conflict" };
        throw error;
      }
    },
  };
}

export function createEmailChangeToken({ targetUserId, requestId, secret }) {
  if (
    !accountIdPattern.test(targetUserId) ||
    !requestIdPattern.test(requestId) ||
    typeof secret !== "string" ||
    secret.length < 32
  ) {
    throw new Error("INVALID_EMAIL_CHANGE_TOKEN_INPUT");
  }
  const payload = `${targetUserId}.${requestId}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isEmailChangeTokenShape(token) {
  return typeof token === "string" &&
    token.length <= 256 &&
    /^[0-9a-f-]{36}\.[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/i.test(token);
}

async function lockAppUser(transaction, targetUserId) {
  await transaction.$queryRaw`SELECT id FROM app_users WHERE id = ${targetUserId}::uuid FOR UPDATE`;
}

function readEmailChangeToken(token, secret) {
  if (
    !isEmailChangeTokenShape(token) ||
    typeof secret !== "string" ||
    secret.length < 32
  ) {
    return null;
  }
  const [targetUserId, requestId, signature] = token.split(".");
  if (!accountIdPattern.test(targetUserId) || !requestIdPattern.test(requestId)) return null;
  const expected = createHmac("sha256", secret)
    .update(`${targetUserId}.${requestId}`)
    .digest();
  const supplied = Buffer.from(signature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return { targetUserId, requestId };
}

function readVerificationValue(value) {
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !requestIdPattern.test(parsed.requestId) ||
      (parsed.status !== "pending" && parsed.status !== "completed")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isOrigin(value) {
  try {
    const url = new URL(value);
    return url.pathname === "/" &&
      url.search === "" &&
      url.hash === "" &&
      (url.protocol === "https:" || url.hostname === "localhost");
  } catch {
    return false;
  }
}

function isUniqueConstraintError(error) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002",
  );
}
