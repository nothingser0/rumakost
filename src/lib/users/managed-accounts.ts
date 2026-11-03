import "server-only";

import { headers } from "next/headers";
import type { AppRole, AuthAppUser } from "@/lib/auth/app-user";
import { auth } from "@/lib/auth/server";
import { getAppOriginEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { canManageRole, listVisibleRoles } from "./policy.mjs";
import {
  createManagedAccount as createManagedAccountOperation,
  setManagedAccountActive as setManagedAccountActiveOperation,
  transferStaffTickets as transferStaffTicketsOperation,
} from "./managed-account-operations.mjs";

const activeTicketStatuses = ["DRAFT", "RECEIVED", "ASSIGNED", "IN_PROGRESS", "INSPECTION"] as const;

export type ManagedAccount = {
  id: string;
  displayName: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  emailVerified: boolean;
  activeTicketCount: number;
  createdAtLabel: string;
};

export type TicketAssigneeOption = {
  id: string;
  displayName: string;
  role: "OWNER" | "STAFF";
};

type AccountInput = {
  displayName: string;
  email: string;
  role: AppRole;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export async function listManagedAccounts(actorRole: AppRole): Promise<ManagedAccount[]> {
  const roles = listVisibleRoles(actorRole) as AppRole[];
  if (roles.length === 0) return [];

  const accounts = await prisma.appUser.findMany({
    where: { role: { in: roles } },
    orderBy: [{ role: "asc" }, { displayName: "asc" }, { id: "asc" }],
    select: {
      id: true,
      authSubject: true,
      displayName: true,
      emailNormalized: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (accounts.length === 0) return [];

  const authSubjects = accounts.map((account) => account.authSubject);
  const [authUsers, ticketCounts] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: authSubjects } },
      select: { id: true, emailVerified: true },
    }),
    prisma.ticket.groupBy({
      by: ["assignedToId"],
      where: {
        assignedToId: { in: accounts.map((account) => account.id) },
        status: { in: [...activeTicketStatuses] },
      },
      _count: { _all: true },
    }),
  ]);
  const verifiedBySubject = new Map(authUsers.map((user) => [user.id, user.emailVerified]));
  const ticketCountByAssignee = new Map(
    ticketCounts.flatMap((row) => row.assignedToId
      ? [[row.assignedToId, row._count._all] as const]
      : []),
  );

  return accounts.map((account) => ({
    id: account.id,
    displayName: account.displayName,
    email: account.emailNormalized,
    role: account.role,
    isActive: account.isActive,
    emailVerified: verifiedBySubject.get(account.authSubject) ?? false,
    activeTicketCount: ticketCountByAssignee.get(account.id) ?? 0,
    createdAtLabel: dateFormatter.format(account.createdAt),
  }));
}

export async function listTicketAssignees(actorRole: AppRole): Promise<TicketAssigneeOption[]> {
  if (actorRole !== "OWNER") return [];

  const accounts = await prisma.appUser.findMany({
    where: {
      role: { in: ["OWNER", "STAFF"] },
      isActive: true,
    },
    orderBy: [{ role: "asc" }, { displayName: "asc" }, { id: "asc" }],
    select: { id: true, displayName: true, role: true },
  });

  return accounts.flatMap((account) => account.role === "OWNER" || account.role === "STAFF"
    ? [{ ...account, role: account.role }]
    : []);
}

export async function createManagedAccount(
  actor: AuthAppUser,
  input: AccountInput,
) {
  return createManagedAccountOperation({
    actor,
    input,
    repository: {
      provisionAccount: provisionAccountForActivation,
    },
    sendActivation: sendActivationEmail,
  });
}

export async function setManagedAccountActive(
  actor: AuthAppUser,
  accountId: string,
  isActive: boolean,
) {
  return setManagedAccountActiveOperation({
    actor,
    accountId,
    isActive,
    repository: { setAccountActive: updateAccountStatus },
  });
}

export async function transferStaffTickets(
  actor: AuthAppUser,
  sourceStaffId: string,
  targetAssigneeId: string,
) {
  return transferStaffTicketsOperation({
    actor,
    sourceStaffId,
    targetAssigneeId,
    repository: { transferStaffTickets: moveActiveTicketAssignments },
  });
}

async function provisionAccountForActivation(input: {
  actorId: string;
  account: AccountInput;
}): Promise<{ status: "pending" | "conflict" }> {
  const normalizedEmail = input.account.email.trim().toLowerCase();

  try {
    return await prisma.$transaction(async (transaction) => {
      const existingAppUser = await transaction.appUser.findUnique({
        where: { emailNormalized: normalizedEmail },
        select: {
          id: true,
          authSubject: true,
          displayName: true,
          role: true,
          isActive: true,
        },
      });
      const existingAuthUser = await transaction.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, emailVerified: true },
      });

      if (existingAppUser || existingAuthUser) {
        const retryablePendingAccount = Boolean(
          existingAppUser &&
          existingAuthUser &&
          existingAppUser.authSubject === existingAuthUser.id &&
          existingAppUser.displayName === input.account.displayName &&
          existingAppUser.role === input.account.role &&
          existingAppUser.isActive &&
          !existingAuthUser.emailVerified,
        );
        return { status: retryablePendingAccount ? "pending" : "conflict" };
      }

      const authUser = await transaction.user.create({
        data: {
          name: input.account.displayName,
          email: normalizedEmail,
          emailVerified: false,
        },
        select: { id: true },
      });
      const appUser = await transaction.appUser.create({
        data: {
          authSubject: authUser.id,
          emailNormalized: normalizedEmail,
          displayName: input.account.displayName,
          role: input.account.role,
          isActive: true,
          mustChangePassword: false,
          createdById: input.actorId,
        },
        select: { id: true },
      });

      if (input.account.role === "TENANT") {
        await transaction.tenantProfile.create({ data: { userId: appUser.id } });
      }

      await transaction.auditEvent.create({
        data: {
          actorId: input.actorId,
          action: "APP_USER_ACCOUNT_CREATED",
          entityType: "APP_USER",
          entityId: appUser.id,
          safeMetadata: { role: input.account.role },
        },
      });

      return { status: "pending" };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return { status: "conflict" };
    throw error;
  }
}

async function sendActivationEmail(input: { email: string; displayName: string }): Promise<void> {
  const appOrigin = getAppOriginEnv().APP_ORIGIN;
  const response = await auth.api.requestPasswordReset({
    body: {
      email: input.email,
      redirectTo: `${appOrigin}/reset-sandi`,
    },
    headers: new Headers(await headers()),
  });

  if (!response.status) throw new Error("ACCOUNT_ACTIVATION_EMAIL_UNAVAILABLE");
}

async function updateAccountStatus(input: {
  actorId: string;
  actorRole: AppRole;
  accountId: string;
  isActive: boolean;
}) {
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT id FROM app_users WHERE id = ${input.accountId}::uuid FOR UPDATE`;
    const target = await transaction.appUser.findUnique({
      where: { id: input.accountId },
      select: { id: true, authSubject: true, role: true, isActive: true },
    });

    if (!target || !canManageRole(input.actorRole, target.role) || target.role === "OWNER") {
      return { status: "not-found" as const };
    }

    if (target.role === "STAFF" && !input.isActive) {
      const activeTicketCount = await transaction.ticket.count({
        where: {
          assignedToId: target.id,
          status: { in: [...activeTicketStatuses] },
        },
      });
      if (activeTicketCount > 0) {
        return { status: "active-tickets" as const, count: activeTicketCount };
      }
    }

    if (target.isActive === input.isActive) return { status: "unchanged" as const };

    const updated = await transaction.appUser.updateMany({
      where: { id: target.id, isActive: target.isActive },
      data: { isActive: input.isActive },
    });
    if (updated.count !== 1) return { status: "not-found" as const };

    if (!input.isActive) {
      await transaction.session.deleteMany({ where: { userId: target.authSubject } });
    }

    await transaction.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.isActive ? "APP_USER_ACTIVATED" : "APP_USER_DEACTIVATED",
        entityType: "APP_USER",
        entityId: target.id,
        safeMetadata: { role: target.role },
      },
    });

    return { status: "updated" as const };
  });
}

async function moveActiveTicketAssignments(input: {
  actorId: string;
  sourceStaffId: string;
  targetAssigneeId: string;
}) {
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`
      SELECT id FROM app_users
       WHERE id IN (${input.sourceStaffId}::uuid, ${input.targetAssigneeId}::uuid)
       ORDER BY id
       FOR UPDATE
    `;
    const accounts = await transaction.appUser.findMany({
      where: { id: { in: [input.sourceStaffId, input.targetAssigneeId] } },
      select: { id: true, role: true, isActive: true },
    });
    const source = accounts.find((account) => account.id === input.sourceStaffId);
    const target = accounts.find((account) => account.id === input.targetAssigneeId);

    if (
      !source ||
      source.role !== "STAFF" ||
      !target ||
      !target.isActive ||
      (target.role !== "OWNER" && target.role !== "STAFF")
    ) {
      return { status: "not-found" as const };
    }

    const tickets = await transaction.ticket.findMany({
      where: {
        assignedToId: source.id,
        status: { in: [...activeTicketStatuses] },
      },
      select: { id: true, ticketNumber: true },
      orderBy: { id: "asc" },
    });
    if (tickets.length === 0) return { status: "transferred" as const, count: 0 };

    const updated = await transaction.ticket.updateMany({
      where: {
        id: { in: tickets.map((ticket) => ticket.id) },
        assignedToId: source.id,
        status: { in: [...activeTicketStatuses] },
      },
      data: { assignedToId: target.id },
    });
    if (updated.count !== tickets.length) throw new Error("STAFF_TICKET_TRANSFER_CONFLICT");

    await transaction.auditEvent.createMany({
      data: tickets.map((ticket) => ({
        actorId: input.actorId,
        action: "TICKET_ASSIGNMENT_TRANSFERRED",
        entityType: "TICKET",
        entityId: ticket.id,
        reason: "STAFF_OFFBOARDING",
        safeMetadata: {
          ticketNumber: ticket.ticketNumber.toString(),
          fromAssigneeId: source.id,
          toAssigneeId: target.id,
        },
      })),
    });

    return { status: "transferred" as const, count: tickets.length };
  }, { isolationLevel: "Serializable" });
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002",
  );
}
