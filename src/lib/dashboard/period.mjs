import { z } from "zod";
import { DomainError } from "../errors/domain-error.mjs";

const periodSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
}).strict();

function jakartaDate(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${value.year}-${value.month}-${value.day}`;
}

function lastDateOfMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (year < 1900) throw new DomainError("PERIOD_INVALID");
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

export function resolveDashboardPeriod(input = {}, now = new Date()) {
  const parsed = periodSchema.safeParse(input);
  if (!parsed.success) throw new DomainError("PERIOD_INVALID");

  const today = jakartaDate(now);
  const currentMonth = today.slice(0, 7);
  const month = parsed.data.month ?? currentMonth;
  if (month > currentMonth) throw new DomainError("PERIOD_INVALID");

  const monthEnd = lastDateOfMonth(month);
  return {
    month,
    startDate: `${month}-01`,
    endDate: month === currentMonth ? today : monthEnd,
    asOfDate: month === currentMonth ? today : monthEnd,
  };
}
