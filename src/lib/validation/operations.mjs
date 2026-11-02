import { z } from "zod";
import {
  dateOnlySchema,
  depositAmountSchema,
  dimensionSchema,
  emailSchema,
  idSchema,
  monthSchema,
  optionalNullableDateOnlySchema,
  optionalNullableDimensionSchema,
  optionalNullableText500Schema,
  optionalNullableTextSchema,
  optionalTextSchema,
  phoneE164Schema,
  positiveMoneySchema,
  positiveSafeIntegerSchema,
  rentAmountSchema,
  textSchema,
  text500Schema,
  withIdempotencyKey,
} from "./primitives.mjs";

const roomStatuses = ["READY", "CLEANING", "MAINTENANCE"];
const billingModes = ["PRORATA_TO_MONTH_END", "FULL_MONTH_ANNIVERSARY"];
const paymentMethods = ["TRANSFER", "QRIS", "CASH"];
const ticketCategories = [
  "AC",
  "PLUMBING",
  "ELECTRICAL",
  "DOORS_LOCKS",
  "FURNITURE",
  "GENERAL",
];
const ticketPriorities = ["LOW", "NORMAL", "URGENT"];
const ticketStatuses = [
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
];

const strictSchema = (shape) => z.object(shape).strict();
const floorNameSchema = z.string().trim().min(1).transform((value) => value.normalize("NFC"));
const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{1,10}$/);
const roomTypeSchema = textSchema;
const optionalRoomTypeSchema = roomTypeSchema.nullable().optional();
const reasonSchema = textSchema;
const optionalReasonSchema = reasonSchema.optional();
const idempotencyShape = (shape, required = false) =>
  withIdempotencyKey(shape, required);

function addDimensionPairIssue(value, context) {
  const hasWidth = value.widthMeters !== undefined;
  const hasLength = value.lengthMeters !== undefined;
  if (hasWidth !== hasLength) {
    context.addIssue({ code: "custom", path: [hasWidth ? "lengthMeters" : "widthMeters"] });
  }
}

function requireAtLeastOneUpdate(value, keys, context) {
  if (!keys.some((key) => value[key] !== undefined)) {
    context.addIssue({ code: "custom", path: [] });
  }
}

export const createStaffAccountSchema = strictSchema({
  displayName: textSchema,
  email: emailSchema,
});

export const createTenantAccountSchema = strictSchema({
  displayName: textSchema,
  email: emailSchema,
});

export const setAccountStatusSchema = strictSchema({
  userId: idSchema,
  isActive: z.boolean(),
});

export const updateTenantProfileSchema = strictSchema({
  phoneE164: phoneE164Schema.nullable().optional(),
  occupation: optionalNullableTextSchema,
  employer: optionalNullableTextSchema,
  cityOfOrigin: optionalNullableTextSchema,
  emergencyContactName: optionalNullableTextSchema,
  emergencyContactRelation: optionalNullableTextSchema,
  emergencyContactPhoneE164: phoneE164Schema.nullable().optional(),
  emergencyContactNote: optionalNullableTextSchema,
}).superRefine((value, context) => {
  const hasName = value.emergencyContactName !== undefined;
  const hasPhone = value.emergencyContactPhoneE164 !== undefined;

  if (hasName !== hasPhone) {
    context.addIssue({
      code: "custom",
      path: [hasName ? "emergencyContactPhoneE164" : "emergencyContactName"],
    });
  }

  requireAtLeastOneUpdate(
    value,
    [
      "phoneE164",
      "occupation",
      "employer",
      "cityOfOrigin",
      "emergencyContactName",
      "emergencyContactRelation",
      "emergencyContactPhoneE164",
      "emergencyContactNote",
    ],
    context,
  );
});

export const changeLoginEmailSchema = strictSchema(
  idempotencyShape({
    userId: idSchema,
    email: emailSchema,
  }),
);

export const createFloorSchema = strictSchema({
  name: floorNameSchema,
});

export const updateFloorSchema = strictSchema({
  floorId: idSchema,
  name: floorNameSchema,
});

export const archiveFloorSchema = strictSchema({
  floorId: idSchema,
});

export const restoreFloorSchema = strictSchema({
  floorId: idSchema,
});

export const createRoomSchema = strictSchema({
  code: roomCodeSchema,
  floorId: idSchema.nullable().optional(),
  roomType: optionalRoomTypeSchema,
  widthMeters: dimensionSchema.optional(),
  lengthMeters: dimensionSchema.optional(),
  rent: rentAmountSchema,
  physicalStatus: z.enum(roomStatuses),
}).superRefine(addDimensionPairIssue);

export const updateRoomSchema = strictSchema({
  roomId: idSchema,
  code: roomCodeSchema.optional(),
  floorId: idSchema.nullable().optional(),
  roomType: optionalRoomTypeSchema,
  widthMeters: optionalNullableDimensionSchema,
  lengthMeters: optionalNullableDimensionSchema,
  rent: rentAmountSchema.optional(),
  depositDefaultAmount: depositAmountSchema.optional(),
  physicalStatus: z.enum(roomStatuses).optional(),
  maintenanceNote: optionalNullableText500Schema,
}).superRefine((value, context) => {
  addDimensionPairIssue(value, context);
  requireAtLeastOneUpdate(
    value,
    [
      "code",
      "floorId",
      "roomType",
      "widthMeters",
      "lengthMeters",
      "rent",
      "depositDefaultAmount",
      "physicalStatus",
      "maintenanceNote",
    ],
    context,
  );
});

export const archiveRoomSchema = strictSchema({
  roomId: idSchema,
});

export const restoreRoomSchema = strictSchema({
  roomId: idSchema,
});

export const createLeaseSchema = strictSchema(
  idempotencyShape({
    tenantUserId: idSchema,
    roomId: idSchema,
    startsOn: dateOnlySchema,
    endsOn: optionalNullableDateOnlySchema,
    rentAmount: rentAmountSchema,
    depositAgreedAmount: depositAmountSchema,
    billingMode: z.enum(billingModes),
    contractNumber: optionalNullableTextSchema,
  }, true),
).superRefine((value, context) => {
  if (value.endsOn && value.endsOn <= value.startsOn) {
    context.addIssue({ code: "custom", path: ["endsOn"] });
  }
});

export const requestLeaseEndSchema = strictSchema(
  idempotencyShape({
    leaseId: idSchema,
    requestedEndOn: dateOnlySchema,
    reason: optionalReasonSchema,
  }, true),
);

export const endLeaseSchema = strictSchema(
  idempotencyShape({
    leaseId: idSchema,
    actualEndOn: dateOnlySchema,
  }, true),
);

export const reconcileCheckoutDepositSchema = strictSchema(
  idempotencyShape({
    leaseId: idSchema,
    mode: z.enum(["REFUND", "DEDUCTION"]),
    amount: positiveMoneySchema,
    reason: reasonSchema,
  }, true),
);

export const runInvoiceGenerationSchema = strictSchema({
  localDate: dateOnlySchema,
});

export const markInvoiceDeliveredSchema = strictSchema({
  invoiceId: idSchema,
  channel: z.literal("MANUAL"),
});

const invoiceListCursorSchema = strictSchema({
  dueOn: dateOnlySchema,
  id: idSchema,
});

export const listInvoicesSchema = strictSchema({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: invoiceListCursorSchema.optional(),
});

export const getInvoiceSchema = strictSchema({
  invoiceId: idSchema,
});

export const voidInvoiceSchema = strictSchema(
  idempotencyShape({
    invoiceId: idSchema,
    reason: reasonSchema,
  }, true),
);

export const recordPaymentSchema = strictSchema(
  idempotencyShape({
    invoiceId: idSchema,
    amount: positiveMoneySchema,
    method: z.enum(paymentMethods),
    reference: optionalTextSchema,
  }, true),
);

export const verifyPaymentSchema = strictSchema(
  idempotencyShape({
    paymentId: idSchema,
  }, true),
);

export const rejectPaymentSchema = strictSchema(
  idempotencyShape({
    paymentId: idSchema,
    rejectionReason: reasonSchema,
  }, true),
);

export const reversePaymentSchema = strictSchema(
  idempotencyShape({
    paymentId: idSchema,
    reason: reasonSchema,
  }, true),
);

export const settleInvoiceFromDepositSchema = strictSchema(
  idempotencyShape({
    invoiceLineId: idSchema,
    amount: positiveMoneySchema,
    reason: optionalReasonSchema,
  }, true),
);

export const recordExpenseSchema = strictSchema(
  idempotencyShape({
    category: textSchema,
    amount: positiveMoneySchema,
    date: dateOnlySchema,
    description: textSchema,
  }, true),
);

export const reverseExpenseSchema = strictSchema(
  idempotencyShape({
    expenseId: idSchema,
    reason: reasonSchema,
  }, true),
);

export const setOperatingBudgetSchema = strictSchema({
  month: monthSchema,
  amount: positiveMoneySchema,
});

export const getFinancialReportSchema = strictSchema({
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
}).superRefine((value, context) => {
  if (value.endDate < value.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"] });
  }
});

export const createTicketDraftSchema = strictSchema(
  idempotencyShape({
    roomId: idSchema,
    leaseId: idSchema.nullable().optional(),
    category: z.enum(ticketCategories),
    title: textSchema,
    description: textSchema,
    priority: z.enum(ticketPriorities),
  }, true),
);

export const submitTicketDraftSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
  }, true),
);

export const discardTicketDraftSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    reason: reasonSchema,
  }, true),
);

export const updateTicketSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    status: z.enum(ticketStatuses).optional(),
    priority: z.enum(ticketPriorities).optional(),
    assignedToId: idSchema.nullable().optional(),
    targetCompletionOn: optionalNullableDateOnlySchema,
    resolutionSummary: optionalTextSchema,
  }, true),
).superRefine((value, context) => {
  requireAtLeastOneUpdate(
    value,
    ["status", "priority", "assignedToId", "targetCompletionOn", "resolutionSummary"],
    context,
  );

  if (value.status === "RESOLVED" && value.resolutionSummary === undefined) {
    context.addIssue({ code: "custom", path: ["resolutionSummary"] });
  }
});

export const assignTicketSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    assignedToId: idSchema.nullable(),
  }, true),
);

export const cancelTicketSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    reason: reasonSchema,
  }, true),
);

export const reopenTicketSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
  }, true),
);

export const addTicketCommentSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    body: textSchema,
    visibility: z.enum(["TENANT_VISIBLE", "INTERNAL"]),
  }, true),
);

const safeFileNameSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !/[\\/\u0000-\u001f\u007f]/u.test(value));
const mimeTypeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/);

export const createUploadIntentSchema = strictSchema(
  idempotencyShape({
    ticketId: idSchema,
    fileName: safeFileNameSchema,
    contentType: mimeTypeSchema,
    sizeBytes: positiveSafeIntegerSchema,
    durationSeconds: positiveSafeIntegerSchema.optional(),
    uploadBatchId: idSchema,
  }, true),
);

export const finalizeUploadSchema = strictSchema({
  attachmentId: idSchema,
});

export const requestAttachmentSchema = strictSchema({
  attachmentId: idSchema,
});

export const operationSchemas = Object.freeze({
  createStaffAccount: createStaffAccountSchema,
  createTenantAccount: createTenantAccountSchema,
  setAccountStatus: setAccountStatusSchema,
  updateTenantProfile: updateTenantProfileSchema,
  changeLoginEmail: changeLoginEmailSchema,
  createFloor: createFloorSchema,
  updateFloor: updateFloorSchema,
  archiveFloor: archiveFloorSchema,
  restoreFloor: restoreFloorSchema,
  createRoom: createRoomSchema,
  updateRoom: updateRoomSchema,
  archiveRoom: archiveRoomSchema,
  restoreRoom: restoreRoomSchema,
  createLease: createLeaseSchema,
  requestLeaseEnd: requestLeaseEndSchema,
  endLease: endLeaseSchema,
  reconcileCheckoutDeposit: reconcileCheckoutDepositSchema,
  runInvoiceGeneration: runInvoiceGenerationSchema,
  markInvoiceDelivered: markInvoiceDeliveredSchema,
  voidInvoice: voidInvoiceSchema,
  recordPayment: recordPaymentSchema,
  verifyPayment: verifyPaymentSchema,
  rejectPayment: rejectPaymentSchema,
  reversePayment: reversePaymentSchema,
  settleInvoiceFromDeposit: settleInvoiceFromDepositSchema,
  recordExpense: recordExpenseSchema,
  reverseExpense: reverseExpenseSchema,
  setOperatingBudget: setOperatingBudgetSchema,
  getFinancialReport: getFinancialReportSchema,
  createTicketDraft: createTicketDraftSchema,
  submitTicketDraft: submitTicketDraftSchema,
  discardTicketDraft: discardTicketDraftSchema,
  updateTicket: updateTicketSchema,
  assignTicket: assignTicketSchema,
  cancelTicket: cancelTicketSchema,
  reopenTicket: reopenTicketSchema,
  addTicketComment: addTicketCommentSchema,
  createUploadIntent: createUploadIntentSchema,
  finalizeUpload: finalizeUploadSchema,
  requestAttachment: requestAttachmentSchema,
});
