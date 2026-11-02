import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";
import {
  dateOnlySchema,
  depositAmountSchema,
  rentAmountSchema,
} from "../validation/primitives.mjs";

const initialInvoiceInputSchema = z.object({
  startsOn: dateOnlySchema,
  rentAmount: rentAmountSchema,
  depositAgreedAmount: depositAmountSchema,
  billingMode: z.enum([
    "PRORATA_TO_MONTH_END",
    "FULL_MONTH_ANNIVERSARY",
  ]),
}).strict();

const ROUNDING_INCREMENT_MINOR_UNITS = 100_000n;

function getDaysInMonth(year, month) {
  if (month === 2) {
    const isLeapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
    return isLeapYear ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nextAnniversaryDate({ year, month, day }) {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  if (nextYear > 9999) throw new DomainError("INVALID_DATES");

  return {
    year: nextYear,
    month: nextMonth,
    day: Math.min(day, getDaysInMonth(nextYear, nextMonth)),
  };
}

function previousDate({ year, month, day }) {
  if (day > 1) return { year, month, day: day - 1 };

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return {
    year: previousYear,
    month: previousMonth,
    day: getDaysInMonth(previousYear, previousMonth),
  };
}

function parseMinorUnits(amount) {
  const [whole, fraction] = amount.split(".");
  return BigInt(whole) * 100n + BigInt(fraction);
}

function formatMinorUnits(amount) {
  return `${amount / 100n}.${String(amount % 100n).padStart(2, "0")}`;
}

function proratedRentMinorUnits(rentAmount, billableDays, daysInMonth) {
  const numerator = rentAmount * BigInt(billableDays);
  const denominator = BigInt(daysInMonth) * ROUNDING_INCREMENT_MINOR_UNITS;
  const wholeIncrements = numerator / denominator;
  const remainder = numerator % denominator;
  const roundedIncrements =
    wholeIncrements + (remainder * 2n >= denominator ? 1n : 0n);

  return roundedIncrements * ROUNDING_INCREMENT_MINOR_UNITS;
}

/**
 * @typedef {{ kind: "RENT" | "DEPOSIT", amount: string, description: string }} InitialInvoiceLine
 * @typedef {{ periodStart: string, periodEnd: string, dueOn: string, amountDue: string, lines: InitialInvoiceLine[] }} InitialInvoice
 * @typedef {z.infer<typeof initialInvoiceInputSchema>} InitialInvoiceInput
 */

/**
 * @param {InitialInvoiceInput} input
 * @returns {InitialInvoice}
 */
export function calculateInitialInvoice(input) {
  const data = initialInvoiceInputSchema.parse(input);
  const startsOn = parseDate(data.startsOn);
  const rentMinorUnits = parseMinorUnits(data.rentAmount);
  const depositMinorUnits = parseMinorUnits(data.depositAgreedAmount);

  let rentChargeMinorUnits = rentMinorUnits;
  let periodEnd;
  let rentDescription;

  if (data.billingMode === "PRORATA_TO_MONTH_END") {
    const daysInMonth = getDaysInMonth(startsOn.year, startsOn.month);
    const billableDays = daysInMonth - startsOn.day + 1;
    rentChargeMinorUnits = proratedRentMinorUnits(
      rentMinorUnits,
      billableDays,
      daysInMonth,
    );
    periodEnd = {
      year: startsOn.year,
      month: startsOn.month,
      day: daysInMonth,
    };
    rentDescription = "Sewa prorata";
  } else {
    periodEnd = previousDate(nextAnniversaryDate(startsOn));
    rentDescription = "Sewa satu bulan penuh";
  }

  if (rentChargeMinorUnits === 0n) throw new DomainError("AMOUNT_INVALID");

  const lines = [
    {
      kind: "RENT",
      amount: formatMinorUnits(rentChargeMinorUnits),
      description: rentDescription,
    },
  ];

  if (depositMinorUnits > 0n) {
    lines.push({
      kind: "DEPOSIT",
      amount: formatMinorUnits(depositMinorUnits),
      description: "Deposit jaminan",
    });
  }

  const amountDue = lines.reduce(
    (total, line) => total + parseMinorUnits(line.amount),
    0n,
  );

  return {
    periodStart: data.startsOn,
    periodEnd: formatDate(periodEnd),
    dueOn: data.startsOn,
    amountDue: formatMinorUnits(amountDue),
    lines,
  };
}
