"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import { recordPayment } from "@/lib/payments/record-payment.mjs";
import type { PaymentRecord } from "@/lib/payments/record-payment.mjs";
import {
  rejectPayment as rejectPaymentOperation,
  reversePayment as reversePaymentOperation,
  verifyPayment as verifyPaymentOperation,
} from "@/lib/payments/payment-ledger.mjs";
import type {
  PaymentRejection,
  PaymentReversal,
  PaymentVerification,
} from "@/lib/payments/record-payment.mjs";
import { createPaymentLedgerRepository } from "@/lib/payments/ledger-repository";
import { createPaymentRepository } from "@/lib/payments/repository";

type ActionFailure = {
  success: false;
  error: {
    code: string;
    status: number;
    issues?: Array<{ path: Array<string | number>; code: string }>;
  };
};

type ActionResult<T> = { success: true; data: T } | ActionFailure;

function authorizationFailure(reason: string): ActionFailure {
  const code = reason === "role-denied"
    ? "FORBIDDEN"
    : reason === "session-unavailable"
      ? "PROVIDER_UNAVAILABLE"
      : "UNAUTHENTICATED";
  return {
    success: false,
    error: toPublicError(new DomainError(code)),
  };
}

function actionFailure(error: unknown): ActionFailure {
  return { success: false, error: toPublicError(error) };
}

function ownerAuthorizationFailure(reason: string): ActionFailure {
  return reason === "role-denied"
    ? actionFailure(new DomainError("NOT_OWNER"))
    : authorizationFailure(reason);
}

function refreshPaymentViews() {
  revalidatePath("/tagihan");
  revalidatePath("/pembayaran");
  revalidatePath("/portal");
  revalidatePath("/portal/tagihan");
}

export async function recordPaymentAction(
  input: unknown,
): Promise<ActionResult<PaymentRecord>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER", "STAFF", "TENANT"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await recordPayment({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createPaymentRepository(),
    });
    refreshPaymentViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function verifyPaymentAction(
  input: unknown,
): Promise<ActionResult<PaymentVerification>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return ownerAuthorizationFailure(access.reason);

  try {
    const data = await verifyPaymentOperation({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createPaymentLedgerRepository(),
    });
    refreshPaymentViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function rejectPaymentAction(
  input: unknown,
): Promise<ActionResult<PaymentRejection>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return ownerAuthorizationFailure(access.reason);

  try {
    const data = await rejectPaymentOperation({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createPaymentLedgerRepository(),
    });
    refreshPaymentViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function reversePaymentAction(
  input: unknown,
): Promise<ActionResult<PaymentReversal>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return ownerAuthorizationFailure(access.reason);

  try {
    const data = await reversePaymentOperation({
      actor: {
        id: access.user.id,
        role: access.user.role,
        isActive: access.user.isActive,
        mustChangePassword: access.user.mustChangePassword,
      },
      input,
      repository: createPaymentLedgerRepository(),
    });
    refreshPaymentViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
