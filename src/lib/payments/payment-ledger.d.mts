import type {
  PaymentActor,
  PaymentRejection,
  PaymentRejectionRepositoryInput,
  PaymentReversal,
  PaymentReversalRepositoryInput,
  PaymentReviewRepositoryInput,
  PaymentVerification,
} from "./record-payment.mjs";

export type PaymentLedgerRepository = {
  verifyPayment(input: PaymentReviewRepositoryInput): Promise<PaymentVerification>;
  rejectPayment(input: PaymentRejectionRepositoryInput): Promise<PaymentRejection>;
  reversePayment(input: PaymentReversalRepositoryInput): Promise<PaymentReversal>;
};

export function verifyPayment(input: {
  actor: PaymentActor;
  input: unknown;
  repository: PaymentLedgerRepository;
}): Promise<PaymentVerification>;

export function rejectPayment(input: {
  actor: PaymentActor;
  input: unknown;
  repository: PaymentLedgerRepository;
}): Promise<PaymentRejection>;

export function reversePayment(input: {
  actor: PaymentActor;
  input: unknown;
  repository: PaymentLedgerRepository;
}): Promise<PaymentReversal>;
