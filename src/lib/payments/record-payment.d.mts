export type PaymentActor = {
  id: string;
  role: "OWNER" | "STAFF" | "TENANT";
  isActive: boolean;
  mustChangePassword: boolean;
};

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  amount: string;
  method: "TRANSFER" | "QRIS" | "CASH";
  reference: string | null;
  status: "PENDING";
  createdAt: string;
};

export type RecordPaymentRepositoryInput = {
  actorId: string;
  invoiceId: string;
  amount: string;
  method: "TRANSFER" | "QRIS" | "CASH";
  reference: string | null;
  idempotencyKey: string;
  localDate: string;
  requestHash: string;
};

export type PaymentAllocationRecord = {
  invoiceLineId: string;
  kind: "RENT" | "DEPOSIT";
  amount: string;
};

export type PaymentVerification = {
  paymentId: string;
  invoiceId: string;
  amount: string;
  amountPaid: string;
  amountOutstanding: string;
  status: "VERIFIED";
  verifiedAt: string;
  allocations: PaymentAllocationRecord[];
};

export type PaymentRejection = {
  paymentId: string;
  invoiceId: string;
  amount: string;
  amountPaid: string;
  amountOutstanding: string;
  status: "REJECTED";
  rejectionReason: string;
  rejectedAt: string;
};

export type PaymentReversal = {
  paymentId: string;
  invoiceId: string;
  amount: string;
  amountPaid: string;
  amountOutstanding: string;
  reason: string;
  reversedAt: string;
};

export type PaymentReviewRepositoryInput = {
  actorId: string;
  paymentId: string;
  idempotencyKey: string;
  requestHash: string;
};

export type PaymentRejectionRepositoryInput = PaymentReviewRepositoryInput & {
  reason: string;
};

export type PaymentReversalRepositoryInput = PaymentReviewRepositoryInput & {
  reason: string;
};

export type PaymentRepository = {
  recordPayment(input: RecordPaymentRepositoryInput): Promise<PaymentRecord>;
  verifyPayment(input: PaymentReviewRepositoryInput): Promise<PaymentVerification>;
  rejectPayment(input: PaymentRejectionRepositoryInput): Promise<PaymentRejection>;
  reversePayment(input: PaymentReversalRepositoryInput): Promise<PaymentReversal>;
};

export function recordPayment(input: {
  actor: PaymentActor;
  input: unknown;
  repository: PaymentRepository;
  today?: string;
}): Promise<PaymentRecord>;
