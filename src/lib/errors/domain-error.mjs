import { ZodError } from "zod";

const domainErrorStatus = Object.freeze({
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_OWNER: 403,
  OWNER_REQUIRED: 403,
  SELF_APPROVAL: 403,
  AUTH_PROVIDER_ERROR: 503,
  PROVIDER_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
  VALIDATION_ERROR: 400,
  REQUEST_TOO_LARGE: 413,
  FILE_TOO_LARGE: 413,
  AMOUNT_INVALID: 400,
  INVALID_DATES: 400,
  PERIOD_INVALID: 400,
  REASON_REQUIRED: 400,
  TEXT_REQUIRED: 400,
  PROVIDER_REJECTED: 400,
  INVALID_MEDIA: 415,
  MEDIA_GONE: 410,
  MEDIA_REQUIRED: 400,
  FORBIDDEN_VISIBILITY: 403,
  NOT_FOUND: 404,
  FLOOR_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  TENANT_PROFILE_NOT_FOUND: 404,
  ROOM_NOT_FOUND: 404,
  INVOICE_NOT_FOUND: 404,
  INVOICE_NOT_OWNED: 404,
  EXPENSE_NOT_FOUND: 404,
  LEASE_NOT_OWNED: 404,
  TICKET_NOT_FOUND: 404,
  TICKET_NOT_OWNED: 404,
  EMAIL_TAKEN: 409,
  STAFF_HAS_ACTIVE_TICKETS: 409,
  FLOOR_NAME_TAKEN: 409,
  FLOOR_IN_USE: 409,
  ROOM_CODE_TAKEN: 409,
  ROOM_IN_USE: 409,
  ROOM_CONFLICT: 409,
  TENANT_INACTIVE: 409,
  LEASE_ALREADY_ENDED: 409,
  LEASE_NOT_ACTIVE: 409,
  LEASE_ENDED: 409,
  LEASE_NOT_ENDED: 409,
  INVOICE_CLOSED: 409,
  INVOICE_ALREADY_VOID: 409,
  INVOICE_HAS_DEPOSIT_SETTLEMENT: 409,
  PENDING_PAYMENT_EXISTS: 409,
  VERIFIED_PAYMENT_UNREVERSED: 409,
  OVERPAYMENT: 409,
  PAYMENT_NOT_FOUND: 404,
  PAYMENT_NOT_PENDING: 409,
  NOT_VERIFIED: 409,
  ALREADY_REVERSED: 409,
  DEPOSIT_INSUFFICIENT: 409,
  INVALID_TRANSITION: 409,
  CANCELLED_TERMINAL: 409,
  TICKET_LIMIT_EXCEEDED: 409,
  UPLOAD_INCOMPLETE: 409,
  RATE_LIMITED: 429,
  STORAGE_QUOTA_EXCEEDED: 409,
  CONFLICT: 409,
});

const allowedIssueCodes = new Set([
  "custom",
  "invalid_format",
  "invalid_type",
  "invalid_value",
  "invalid_union",
  "not_multiple_of",
  "too_big",
  "too_small",
  "unrecognized_keys",
]);

function safePathSegment(segment) {
  if (typeof segment === "number") {
    return Number.isSafeInteger(segment) && segment >= 0 ? String(segment) : "_";
  }

  return /^[A-Za-z][A-Za-z0-9]*$/.test(segment) ? segment : "_";
}

function mapValidationIssues(error) {
  return error.issues
    .map((issue) => ({
      path: issue.path.map(safePathSegment),
      code: allowedIssueCodes.has(issue.code) ? issue.code : "invalid",
    }))
    .sort((first, second) => {
      const firstPath = first.path.join(".");
      const secondPath = second.path.join(".");
      return firstPath.localeCompare(secondPath) || first.code.localeCompare(second.code);
    });
}

export class DomainError extends Error {
  constructor(code) {
    const status = domainErrorStatus[code];
    if (status === undefined) throw new TypeError("Unknown domain error code.");

    super(code);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
  }
}

export const domainErrorCodes = Object.freeze(Object.keys(domainErrorStatus));

export function mapAuthProviderError(_error) {
  return new DomainError("AUTH_PROVIDER_ERROR");
}

export function mapStorageProviderError(_error) {
  return new DomainError("PROVIDER_UNAVAILABLE");
}

export function mapPersistenceError(error) {
  const code = error && typeof error.code === "string" ? error.code : "";

  if (["P2002", "P2003", "P2034", "P2028"].includes(code)) {
    return new DomainError("CONFLICT");
  }

  if (code === "P2025") return new DomainError("NOT_FOUND");
  return new DomainError("INTERNAL_ERROR");
}

export function toPublicError(error) {
  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      status: domainErrorStatus.VALIDATION_ERROR,
      issues: mapValidationIssues(error),
    };
  }

  if (error instanceof DomainError) {
    return {
      code: error.code,
      status: error.status,
    };
  }

  return {
    code: "INTERNAL_ERROR",
    status: domainErrorStatus.INTERNAL_ERROR,
  };
}
