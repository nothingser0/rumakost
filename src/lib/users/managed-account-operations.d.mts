import type { AppRole } from "@/lib/auth/app-user";

export type ManagedAccountActor = {
  id: string;
  role: AppRole;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type ManagedAccountInput = {
  displayName: string;
  email: string;
  role: AppRole;
};

export type ManagedAccountOperationResult =
  | { status: "forbidden" | "invalid" | "conflict" | "delivery-failed" | "sent" }
  | { status: "updated" | "unchanged" }
  | { status: "active-tickets"; count: number }
  | { status: "transferred"; count: number }
  | { status: "not-found" };

export function createManagedAccount(input: {
  actor: ManagedAccountActor | null;
  input: unknown;
  repository: {
    provisionAccount(input: {
      actorId: string;
      account: ManagedAccountInput;
    }): Promise<{ status: "pending" | "conflict" }>;
  };
  sendActivation(input: { email: string; displayName: string }): Promise<void>;
}): Promise<ManagedAccountOperationResult>;

export function setManagedAccountActive(input: {
  actor: ManagedAccountActor | null;
  accountId: string;
  isActive: boolean;
  repository: {
    setAccountActive(input: {
      actorId: string;
      actorRole: AppRole;
      accountId: string;
      isActive: boolean;
    }): Promise<ManagedAccountOperationResult>;
  };
}): Promise<ManagedAccountOperationResult>;

export function transferStaffTickets(input: {
  actor: ManagedAccountActor | null;
  sourceStaffId: string;
  targetAssigneeId: string;
  repository: {
    transferStaffTickets(input: {
      actorId: string;
      sourceStaffId: string;
      targetAssigneeId: string;
    }): Promise<ManagedAccountOperationResult>;
  };
}): Promise<ManagedAccountOperationResult>;
