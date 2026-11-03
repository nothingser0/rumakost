import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";
import { getFinancialReport } from "../reports/operations.mjs";
import { resolveDashboardPeriod } from "./period.mjs";

const ticketStatuses = [
  "DRAFT",
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
  "CANCELLED",
];

const occupancyFactsSchema = z.object({
  occupiedRooms: z.number().int().nonnegative(),
  totalRooms: z.number().int().nonnegative(),
}).strict();

const ticketCountSchema = z.object({
  status: z.enum(ticketStatuses),
  count: z.number().int().nonnegative(),
}).strict();

const operationalFactsSchema = z.object({
  occupancy: occupancyFactsSchema,
  ticketStatusCounts: z.array(ticketCountSchema),
}).strict();

const moneyTextSchema = z.string().regex(/^\d+\.\d{2}$/);
const collectionFactsSchema = z.object({
  issuedRentAmount: moneyTextSchema,
  collectedRentAmount: moneyTextSchema,
}).strict();

function requireInternalActor(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER" && actor.role !== "STAFF") {
    throw new DomainError("FORBIDDEN");
  }
}

function percentage(numerator, denominator) {
  if (denominator === 0n) return null;
  const hundredths = (numerator * 10000n + denominator / 2n) / denominator;
  return Number(hundredths) / 100;
}

function cents(value) {
  if (!/^\d+\.\d{2}$/.test(value)) throw new DomainError("INTERNAL_ERROR");
  const [whole, fraction] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction);
}

export function summarizeOccupancy(input) {
  const facts = occupancyFactsSchema.safeParse(input);
  if (!facts.success || facts.data.occupiedRooms > facts.data.totalRooms) {
    throw new DomainError("INTERNAL_ERROR");
  }
  return {
    ...facts.data,
    percentage: facts.data.totalRooms === 0
      ? null
      : Number(((facts.data.occupiedRooms / facts.data.totalRooms) * 100).toFixed(2)),
  };
}

export function summarizeTickets(input) {
  const counts = z.array(ticketCountSchema).safeParse(input);
  if (!counts.success) throw new DomainError("INTERNAL_ERROR");

  const byStatus = Object.fromEntries(ticketStatuses.map((status) => [status, 0]));
  for (const { status, count } of counts.data) byStatus[status] += count;

  const openCount = ticketStatuses
    .filter((status) => status !== "RESOLVED" && status !== "CANCELLED")
    .reduce((total, status) => total + byStatus[status], 0);

  return { openCount, byStatus };
}

export function summarizeCollection(input) {
  const facts = collectionFactsSchema.safeParse(input);
  if (!facts.success) throw new DomainError("INTERNAL_ERROR");

  return {
    ...facts.data,
    percentage: percentage(
      cents(facts.data.collectedRentAmount),
      cents(facts.data.issuedRentAmount),
    ),
  };
}

export async function getDashboardSnapshot({
  actor,
  input = {},
  repository,
  reportsRepository,
  now = new Date(),
}) {
  requireInternalActor(actor);
  const period = resolveDashboardPeriod(input, now);
  const rawOperationalFacts = await repository.getOperationalFacts(period.asOfDate);
  const operational = operationalFactsSchema.safeParse(rawOperationalFacts);
  if (!operational.success) throw new DomainError("INTERNAL_ERROR");

  const data = {
    period: {
      month: period.month,
      startDate: period.startDate,
      endDate: period.endDate,
    },
    occupancy: {
      asOfDate: period.asOfDate,
      ...summarizeOccupancy(operational.data.occupancy),
    },
    tickets: summarizeTickets(operational.data.ticketStatusCounts),
  };

  if (actor.role === "STAFF") return { role: actor.role, ...data };
  if (!reportsRepository) throw new DomainError("INTERNAL_ERROR");

  const [rawCollectionFacts, financialReport] = await Promise.all([
    repository.getCollectionFacts({
      startDate: period.startDate,
      endDate: period.endDate,
    }),
    getFinancialReport({
      actor,
      input: {
        startDate: period.startDate,
        endDate: period.endDate,
      },
      repository: reportsRepository,
    }),
  ]);
  const budget = financialReport.budgets.find(({ month }) => month === period.month) ?? {
    month: period.month,
    status: "NOT_SET",
    budgetAmount: null,
    actualAmount: "0.00",
    remainingAmount: null,
  };

  return {
    role: actor.role,
    ...data,
    finance: {
      collection: summarizeCollection(rawCollectionFacts),
      cashFlow: financialReport.cashFlow,
      budget,
    },
  };
}
