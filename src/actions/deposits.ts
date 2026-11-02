"use server";

import { revalidatePath } from "next/cache";
import { DomainError, toPublicError } from "@/lib/errors/domain-error.mjs";
import { authorizeCurrentAction } from "@/lib/authorization/server";
import {
  reconcileCheckoutDeposit,
  resolveCheckoutRefund,
  settleInvoiceFromDeposit,
} from "@/lib/deposits/operations.mjs";
import { createDepositRepository } from "@/lib/deposits/repository";
import type {
  CheckoutDepositResult,
  CheckoutRefundResult,
  DepositSettlementResult,
} from "@/lib/deposits/repository";

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

function revalidateDepositViews() {
  revalidatePath("/tagihan");
  revalidatePath("/pembayaran");
  revalidatePath("/kontrak");
  revalidatePath("/portal");
  revalidatePath("/laporan");
}

export async function settleInvoiceFromDepositAction(
  input: unknown,
): Promise<ActionResult<DepositSettlementResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await settleInvoiceFromDeposit({
      actor: access.user,
      input,
      repository: createDepositRepository(),
    });
    revalidateDepositViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function reconcileCheckoutDepositAction(
  input: unknown,
): Promise<ActionResult<CheckoutDepositResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await reconcileCheckoutDeposit({
      actor: access.user,
      input,
      repository: createDepositRepository(),
    });
    revalidateDepositViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function resolveCheckoutRefundAction(
  input: unknown,
): Promise<ActionResult<CheckoutRefundResult>> {
  const access = await authorizeCurrentAction({ roles: ["OWNER"] });
  if (!access.allowed) return authorizationFailure(access.reason);

  try {
    const data = await resolveCheckoutRefund({
      actor: access.user,
      input,
      repository: createDepositRepository(),
    });
    revalidateDepositViews();
    return { success: true, data };
  } catch (error) {
    return actionFailure(error);
  }
}
