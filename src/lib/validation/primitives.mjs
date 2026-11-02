import { z } from "zod";

const MAX_MONEY_MINOR_UNITS = 999_999_999_999n;
const MAX_RENT_MINOR_UNITS = 10_000_000_000n;

function makeTextSchema(maxLength) {
  let schema = z.string().trim().min(1);
  if (maxLength !== undefined) schema = schema.max(maxLength);
  return schema.transform((value) => value.normalize("NFC"));
}

function normalizeMoney(value) {
  const [whole, fraction = ""] = value.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  return `${normalizedWhole}.${fraction.padEnd(2, "0")}`;
}

function toMinorUnits(value) {
  const [whole, fraction] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction);
}

function isCalendarDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeDimension(value) {
  const normalized = value.includes(".")
    ? value.replace(/0+$/, "").replace(/\.$/, "")
    : value;
  const [whole, fraction = ""] = normalized.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
  return `${normalizedWhole}.${fraction.padEnd(2, "0")}`;
}

export const textSchema = makeTextSchema();
export const text500Schema = makeTextSchema(500);
export const optionalTextSchema = textSchema.optional();
export const optionalNullableTextSchema = textSchema.nullable().optional();
export const optionalNullableText500Schema = text500Schema.nullable().optional();

export const idSchema = z.string().trim().uuid().transform((value) => value.toLowerCase());
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);
export const phoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{0,14}$/);

export const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isCalendarDate);
export const optionalNullableDateOnlySchema = dateOnlySchema.nullable().optional();
export const monthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const timestampSchema = z.string().trim().datetime({ offset: true });

const decimalMoneySchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^\d+(?:\.\d{1,2})?$/)
  .transform(normalizeMoney)
  .refine((value) => toMinorUnits(value) <= MAX_MONEY_MINOR_UNITS);

export const moneySchema = decimalMoneySchema;
export const positiveMoneySchema = decimalMoneySchema.refine(
  (value) => toMinorUnits(value) > 0n,
);
export const rentAmountSchema = positiveMoneySchema.refine(
  (value) => toMinorUnits(value) <= MAX_RENT_MINOR_UNITS,
);
export const depositAmountSchema = decimalMoneySchema.refine(
  (value) => toMinorUnits(value) <= MAX_RENT_MINOR_UNITS,
);

const dimensionStringSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}(?:\.\d{1,2})?$/)
  .transform(normalizeDimension)
  .refine((value) => Number(value) > 0);
const dimensionNumberSchema = z
  .number()
  .finite()
  .positive()
  .max(999.99)
  .refine((value) => Number.isSafeInteger(value * 100))
  .transform((value) => value.toFixed(2));

export const dimensionSchema = z.union([
  dimensionStringSchema,
  dimensionNumberSchema,
]);
export const optionalNullableDimensionSchema = dimensionSchema
  .nullable()
  .optional();

export const positiveSafeIntegerSchema = z
  .number()
  .int()
  .positive()
  .refine(Number.isSafeInteger);
export const nonNegativeSafeIntegerSchema = z
  .number()
  .int()
  .nonnegative()
  .refine(Number.isSafeInteger);
export const idempotencyKeySchema = idSchema;

export function withIdempotencyKey(shape, required = false) {
  return {
    ...shape,
    idempotencyKey: required
      ? idempotencyKeySchema
      : idempotencyKeySchema.optional(),
  };
}
