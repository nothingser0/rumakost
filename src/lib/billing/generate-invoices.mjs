import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";
import {
  dateOnlySchema,
  idSchema,
  rentAmountSchema,
} from "../validation/primitives.mjs";

const billingModeSchema = z.enum([
  "PRORATA_TO_MONTH_END",
  "FULL_MONTH_ANNIVERSARY",
]);
const leaseSchema = z.object({
  id: idSchema,
  startsOn: dateOnlySchema,
  endsOn: dateOnlySchema.nullable(),
  rentAmount: rentAmountSchema,
  billingMode: billingModeSchema,
  status: z.enum(["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"]),
}).strict();
const actorSchema = z.object({
  id: idSchema,
  role: z.enum(["OWNER", "STAFF", "TENANT"]),
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
}).strict();
const runInputSchema = z.object({
  localDate: dateOnlySchema,
  source: z.enum(["SCHEDULER", "OWNER_RERUN"]),
  actor: actorSchema.optional(),
}).strict();
const repositoryResultSchema = z.object({
  eligibleCount: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  duplicateCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
}).strict();

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year, month) {
  if (month === 2) {
    const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
    return leap ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function nextMonth({ year, month }, day) {
  const nextMonthNumber = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  if (nextYear > 9999) throw new DomainError("INVALID_DATES");

  return {
    year: nextYear,
    month: nextMonthNumber,
    day: Math.min(day, daysInMonth(nextYear, nextMonthNumber)),
  };
}

function previousDate({ year, month, day }) {
  if (day > 1) return { year, month, day: day - 1 };

  const previousMonthNumber = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return {
    year: previousYear,
    month: previousMonthNumber,
    day: daysInMonth(previousYear, previousMonthNumber),
  };
}

/**
 * @typedef {Object} RecurringInvoiceCandidate
 * @property {string} leaseId
 * @property {string} periodStart
 * @property {string} periodEnd
 * @property {string} dueOn
 * @property {"RECURRING"} kind
 *
 * @param {{lease: unknown, localDate: unknown}} input
 * @returns {RecurringInvoiceCandidate | null}
 */
export function calculateRecurringInvoice({ lease, localDate }) {
  const row = leaseSchema.parse(lease);
  const dueDate = dateOnlySchema.parse(localDate);
  const due = parseDate(dueDate);
  const starts = parseDate(row.startsOn);

  if (
    !["ACTIVE", "SCHEDULED"].includes(row.status) ||
    row.startsOn >= dueDate ||
    (row.endsOn !== null && row.endsOn < dueDate)
  ) {
    return null;
  }

  let periodEnd;
  if (row.billingMode === "PRORATA_TO_MONTH_END") {
    if (due.day !== 1) return null;
    periodEnd = {
      year: due.year,
      month: due.month,
      day: daysInMonth(due.year, due.month),
    };
  } else {
    const dueDay = Math.min(starts.day, daysInMonth(due.year, due.month));
    if (due.day !== dueDay) return null;

    const nextDue = nextMonth(due, starts.day);
    periodEnd = previousDate(nextDue);
  }

  return {
    leaseId: row.id,
    periodStart: dueDate,
    periodEnd: formatDate(periodEnd),
    dueOn: dueDate,
    kind: "RECURRING",
  };
}

/** @param {Date} [date] */
export function getJakartaLocalDate(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    throw new DomainError("INVALID_DATES");
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return dateOnlySchema.parse(`${values.year}-${values.month}-${values.day}`);
}

/**
 * @typedef {Object} InvoiceGenerationRepository
 * @property {(localDate: string) => Promise<unknown[]>} findEligibleLeases
 * @property {(input: {
 *   localDate: string,
 *   source: "SCHEDULER" | "OWNER_RERUN",
 *   actorId: string | null,
 *   candidates: RecurringInvoiceCandidate[],
 * }) => Promise<unknown>} createRecurringInvoices
 *
 * @param {{
 *   localDate: unknown,
 *   source: unknown,
 *   actor?: unknown,
 *   repository: InvoiceGenerationRepository,
 * }} input
 */
export async function runInvoiceGeneration({
  localDate,
  source,
  actor,
  repository,
}) {
  const request = runInputSchema.parse({
    localDate,
    source,
    ...(actor === undefined ? {} : { actor }),
  });

  if (request.source === "OWNER_RERUN") {
    if (!request.actor || !request.actor.isActive || request.actor.mustChangePassword) {
      throw new DomainError("UNAUTHENTICATED");
    }
    if (request.actor.role !== "OWNER") throw new DomainError("FORBIDDEN");
  } else if (request.actor !== undefined) {
    throw new DomainError("FORBIDDEN");
  }

  if (
    !repository ||
    typeof repository.findEligibleLeases !== "function" ||
    typeof repository.createRecurringInvoices !== "function"
  ) {
    throw new DomainError("INTERNAL_ERROR");
  }

  const leases = await repository.findEligibleLeases(request.localDate);
  const candidateByKey = new Map();
  for (const lease of leases) {
    const candidate = calculateRecurringInvoice({ lease, localDate: request.localDate });
    if (candidate === null) continue;

    const key = [candidate.leaseId, candidate.periodStart, candidate.periodEnd, candidate.kind].join("|");
    candidateByKey.set(key, candidate);
  }
  const candidates = [...candidateByKey.values()];

  const result = repositoryResultSchema.parse(
    await repository.createRecurringInvoices({
      localDate: request.localDate,
      source: request.source,
      actorId: request.actor?.id ?? null,
      candidates,
    }),
  );

  if (result.eligibleCount !== result.createdCount + result.duplicateCount) {
    throw new DomainError("INTERNAL_ERROR");
  }

  return {
    localDate: request.localDate,
    ...result,
  };
}

export function createInvoiceGenerationRunId() {
  return randomUUID();
}
