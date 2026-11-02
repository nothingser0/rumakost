import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import {
  mapAuthProviderError,
  mapPersistenceError,
  toPublicError,
} from "../../src/lib/errors/domain-error.mjs";
import {
  createLeaseSchema,
  createRoomSchema,
  createStaffAccountSchema,
  operationSchemas,
  recordPaymentSchema,
  updateTenantProfileSchema,
} from "../../src/lib/validation/operations.mjs";

const id = "54f2c610-3295-461e-9c63-418ec573a66a";
const idempotencyKey = "7380f06a-687c-4c0c-b64a-32110e0f508c";

test("exposes strict schemas for each M05 server operation", () => {
  assert.equal(Object.keys(operationSchemas).length, 40);
  assert.equal("changeOwnPassword" in operationSchemas, false);
  assert.equal(createStaffAccountSchema.safeParse({
    displayName: " Owner ",
    email: " OWNER@EXAMPLE.COM ",
    role: "OWNER",
  }).success, false);
});

test("normalizes account names and emails without accepting client role", () => {
  const result = createStaffAccountSchema.safeParse({
    displayName: "  Siti Aminah  ",
    email: " SITI@Example.COM ",
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    displayName: "Siti Aminah",
    email: "siti@example.com",
  });
});

test("normalizes money strings and enforces numeric(12,2) boundaries", () => {
  const accepted = recordPaymentSchema.safeParse({
    invoiceId: id,
    idempotencyKey,
    amount: " 0009999999999.99 ",
    method: "CASH",
  });
  const tooLarge = recordPaymentSchema.safeParse({
    invoiceId: id,
    idempotencyKey,
    amount: "10000000000.00",
    method: "CASH",
  });
  const tooPrecise = recordPaymentSchema.safeParse({
    invoiceId: id,
    idempotencyKey,
    amount: "1.001",
    method: "CASH",
  });
  const exponent = recordPaymentSchema.safeParse({
    invoiceId: id,
    idempotencyKey,
    amount: "1e3",
    method: "CASH",
  });
  const zero = recordPaymentSchema.safeParse({
    invoiceId: id,
    idempotencyKey,
    amount: "0.00",
    method: "CASH",
  });

  assert.equal(accepted.success, true);
  assert.equal(accepted.data.amount, "9999999999.99");
  assert.equal(tooLarge.success, false);
  assert.equal(tooPrecise.success, false);
  assert.equal(exponent.success, false);
  assert.equal(zero.success, false);
  assert.equal(recordPaymentSchema.safeParse({
    invoiceId: id,
    amount: "100",
    method: "CASH",
  }).success, false);
});

test("enforces room rent limits and paired positive dimensions", () => {
  const room = createRoomSchema.safeParse({
    code: " a-01 ",
    widthMeters: " 3.5 ",
    lengthMeters: 4,
    rent: "100000000",
    physicalStatus: "READY",
  });
  const rentTooLarge = createRoomSchema.safeParse({
    code: "A-02",
    rent: "100000000.01",
    physicalStatus: "READY",
  });
  const unpairedDimension = createRoomSchema.safeParse({
    code: "A-03",
    widthMeters: 3,
    rent: "1000000",
    physicalStatus: "READY",
  });

  assert.equal(room.success, true);
  assert.equal(room.data.code, "A-01");
  assert.equal(room.data.widthMeters, "3.50");
  assert.equal(room.data.lengthMeters, "4.00");
  assert.equal(rentTooLarge.success, false);
  assert.equal(unpairedDimension.success, false);
});

test("rejects impossible dates and invalid lease ranges", () => {
  const validLeapDay = createLeaseSchema.safeParse({
    tenantUserId: id,
    roomId: id,
    idempotencyKey,
    startsOn: "2024-02-29",
    endsOn: "2024-03-01",
    rentAmount: "1000000",
    depositAgreedAmount: "0",
    billingMode: "PRORATA_TO_MONTH_END",
  });
  const impossibleStart = createLeaseSchema.safeParse({
    tenantUserId: id,
    roomId: id,
    idempotencyKey,
    startsOn: "2025-02-29",
    rentAmount: "1000000",
    depositAgreedAmount: "0",
    billingMode: "PRORATA_TO_MONTH_END",
  });
  const reversedRange = createLeaseSchema.safeParse({
    tenantUserId: id,
    roomId: id,
    idempotencyKey,
    startsOn: "2026-02-02",
    endsOn: "2026-02-01",
    rentAmount: "1000000",
    depositAgreedAmount: "0",
    billingMode: "PRORATA_TO_MONTH_END",
  });

  assert.equal(validLeapDay.success, true);
  assert.equal(impossibleStart.success, false);
  assert.equal(reversedRange.success, false);
});

test("requires emergency contact name and phone to change together", () => {
  assert.equal(updateTenantProfileSchema.safeParse({
    emergencyContactName: "Ibu",
  }).success, false);
  assert.equal(updateTenantProfileSchema.safeParse({
    emergencyContactName: null,
    emergencyContactPhoneE164: null,
  }).success, true);
  assert.equal(updateTenantProfileSchema.safeParse({
    phoneE164: "+6281234567890",
  }).success, true);
  assert.equal(updateTenantProfileSchema.safeParse({
    phoneE164: "081234567890",
  }).success, false);
});

test("maps provider, persistence, validation, and unknown errors safely", () => {
  const provider = toPublicError(mapAuthProviderError(
    new Error("provider secret token=private-value"),
  ));
  const persistence = toPublicError(mapPersistenceError({
    code: "P2002",
    message: "duplicate key SQL details",
  }));
  const invalidInput = toPublicError(z.string().email().safeParse("secret-value").error);
  const unknown = toPublicError(new Error("database URL contains credentials"));

  assert.deepEqual(provider, { code: "AUTH_PROVIDER_ERROR", status: 503 });
  assert.deepEqual(persistence, { code: "CONFLICT", status: 409 });
  assert.equal(invalidInput.code, "VALIDATION_ERROR");
  assert.equal(invalidInput.status, 400);
  assert.equal(JSON.stringify(invalidInput).includes("secret-value"), false);
  assert.deepEqual(unknown, { code: "INTERNAL_ERROR", status: 500 });
});
