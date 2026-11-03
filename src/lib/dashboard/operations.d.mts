import type { AuthAppUser } from "../auth/app-user";
import type { DashboardPeriod } from "./period.mjs";
import type { ReportsRepository, FinancialReport } from "../reports/operations.mjs";

export type DashboardActor = Pick<
  AuthAppUser,
  "id" | "role" | "isActive" | "mustChangePassword"
>;

export type DashboardOccupancy = {
  occupiedRooms: number;
  totalRooms: number;
  percentage: number | null;
};

export type DashboardTicketStatus =
  | "DRAFT"
  | "RECEIVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "RESOLVED"
  | "CANCELLED";

export type DashboardTicketCounts = {
  openCount: number;
  byStatus: Record<DashboardTicketStatus, number>;
};

export type DashboardCollection = {
  issuedRentAmount: string;
  collectedRentAmount: string;
  percentage: number | null;
};

export type DashboardSnapshot = {
  role: "OWNER" | "STAFF";
  period: Pick<DashboardPeriod, "month" | "startDate" | "endDate">;
  occupancy: DashboardOccupancy & { asOfDate: string };
  tickets: DashboardTicketCounts;
} & (
  | {
      role: "STAFF";
      finance?: never;
    }
  | {
      role: "OWNER";
      finance: {
        collection: DashboardCollection;
        cashFlow: FinancialReport["cashFlow"];
        budget: FinancialReport["budgets"][number];
      };
    }
);

export type DashboardRepository = {
  getOperationalFacts(asOfDate: string): Promise<{
    occupancy: { occupiedRooms: number; totalRooms: number };
    ticketStatusCounts: Array<{ status: DashboardTicketStatus; count: number }>;
  }>;
  getCollectionFacts(input: {
    startDate: string;
    endDate: string;
  }): Promise<{ issuedRentAmount: string; collectedRentAmount: string }>;
};

export function summarizeOccupancy(input: {
  occupiedRooms: number;
  totalRooms: number;
}): DashboardOccupancy;

export function summarizeTickets(
  input: Array<{ status: DashboardTicketStatus; count: number }>,
): DashboardTicketCounts;

export function summarizeCollection(input: {
  issuedRentAmount: string;
  collectedRentAmount: string;
}): DashboardCollection;

export function getDashboardSnapshot(input: {
  actor: DashboardActor;
  input?: unknown;
  repository: DashboardRepository;
  reportsRepository?: ReportsRepository;
  now?: Date;
}): Promise<DashboardSnapshot>;
