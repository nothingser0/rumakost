import type { AuthAppUser } from "../auth/app-user";

export type ReportActor = Pick<
  AuthAppUser,
  "id" | "role" | "isActive" | "mustChangePassword"
>;

export type OperatingBudgetResult = {
  id: string;
  month: string;
  amount: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetRepositoryInput = {
  actorId: string;
  month: string;
  amount: string;
};

export type FinancialReport = {
  period: {
    startDate: string;
    endDate: string;
  };
  cashFlow: {
    verifiedRentIncome: string;
    reversedRentPayments: string;
    netRentIncome: string;
    grossExpenses: string;
    expenseReversals: string;
    netExpenses: string;
    netOperatingCashFlow: string;
  };
  occupancy: {
    asOf: string;
    occupiedRooms: number;
    totalRooms: number;
    percentage: number | null;
  };
  budgets: Array<{
    month: string;
    status: "SET" | "NOT_SET";
    budgetAmount: string | null;
    actualAmount: string;
    remainingAmount: string | null;
  }>;
};

export type FinancialReportRepositoryResult = Omit<FinancialReport, "occupancy" | "cashFlow"> & {
  cashFlow: Omit<FinancialReport["cashFlow"], "netRentIncome" | "netExpenses" | "netOperatingCashFlow">;
  occupancy: Omit<FinancialReport["occupancy"], "percentage">;
};

export type ReportsRepository = {
  setOperatingBudget(input: BudgetRepositoryInput): Promise<OperatingBudgetResult>;
  getFinancialReport(input: {
    startDate: string;
    endDate: string;
  }): Promise<FinancialReportRepositoryResult>;
};

export function setOperatingBudget(input: {
  actor: ReportActor;
  input: unknown;
  repository: ReportsRepository;
}): Promise<OperatingBudgetResult>;

export function getFinancialReport(input: {
  actor: ReportActor;
  input: unknown;
  repository: ReportsRepository;
}): Promise<FinancialReport>;
