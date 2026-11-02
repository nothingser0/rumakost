import { DomainError } from "../errors/domain-error.mjs";
import {
  getFinancialReportSchema,
  setOperatingBudgetSchema,
} from "../validation/operations.mjs";

function requireOwner(actor) {
  if (!actor || !actor.isActive || actor.mustChangePassword) {
    throw new DomainError("UNAUTHENTICATED");
  }
  if (actor.role !== "OWNER") throw new DomainError("NOT_OWNER");
}

function parseInput(schema, input, fieldCodes) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    const code = fieldCodes[issue.path[0]];
    if (code) throw new DomainError(code);
  }

  throw result.error;
}

function cents(value) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

function money(value) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 100n;
  const fraction = String(absolute % 100n).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

export async function setOperatingBudget({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(setOperatingBudgetSchema, input, {
    month: "PERIOD_INVALID",
    amount: "AMOUNT_INVALID",
  });

  return repository.setOperatingBudget({
    actorId: actor.id,
    month: data.month,
    amount: data.amount,
  });
}

export async function getFinancialReport({ actor, input, repository }) {
  requireOwner(actor);
  const data = parseInput(getFinancialReportSchema, input, {
    startDate: "INVALID_DATES",
    endDate: "INVALID_DATES",
  });

  const result = await repository.getFinancialReport(data);
  const netRentIncome = cents(result.cashFlow.verifiedRentIncome) -
    cents(result.cashFlow.reversedRentPayments);
  const netExpenses = cents(result.cashFlow.grossExpenses) -
    cents(result.cashFlow.expenseReversals);
  const percentage = result.occupancy.totalRooms === 0
    ? null
    : Number(((result.occupancy.occupiedRooms / result.occupancy.totalRooms) * 100).toFixed(2));

  return {
    ...result,
    cashFlow: {
      ...result.cashFlow,
      netRentIncome: money(netRentIncome),
      netExpenses: money(netExpenses),
      netOperatingCashFlow: money(netRentIncome - netExpenses),
    },
    occupancy: {
      ...result.occupancy,
      percentage,
    },
  };
}
