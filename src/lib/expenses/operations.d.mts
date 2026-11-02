import type { AuthAppUser } from "../auth/app-user";

export type ExpenseActor = Pick<
  AuthAppUser,
  "id" | "role" | "isActive" | "mustChangePassword"
>;

export type ExpenseRecord = {
  id: string;
  category: string;
  amount: string;
  occurredOn: string;
  description: string;
  recordedById: string;
  createdAt: string;
};

export type ExpenseReversalRecord = {
  id: string;
  expenseId: string;
  amount: string;
  reason: string;
  createdById: string;
  createdAt: string;
};

export type RecordExpenseRepositoryInput = {
  actorId: string;
  category: string;
  amount: string;
  occurredOn: string;
  description: string;
  idempotencyKey: string;
  requestHash: string;
};

export type ReverseExpenseRepositoryInput = {
  actorId: string;
  expenseId: string;
  reason: string;
  idempotencyKey: string;
  requestHash: string;
};

export type ExpenseRepository = {
  recordExpense(input: RecordExpenseRepositoryInput): Promise<ExpenseRecord>;
  reverseExpense(input: ReverseExpenseRepositoryInput): Promise<ExpenseReversalRecord>;
};

export function recordExpense(input: {
  actor: ExpenseActor;
  input: unknown;
  repository: ExpenseRepository;
}): Promise<ExpenseRecord>;

export function reverseExpense(input: {
  actor: ExpenseActor;
  input: unknown;
  repository: ExpenseRepository;
}): Promise<ExpenseReversalRecord>;
