export type InvoiceActor = {
  id: string;
  role: "OWNER" | "STAFF" | "TENANT";
  isActive: boolean;
  mustChangePassword: boolean;
};

export type InvoiceLine = {
  id: string;
  kind: string;
  amount: string;
  description: string;
};

export type InvoiceRecord = {
  id: string;
  leaseId: string;
  tenantUserId: string;
  tenantName: string;
  roomId: string;
  roomCode: string;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  kind: string;
  status: "ISSUED" | "VOID";
  deliveryStatus: "UNSENT" | "SENT";
  issuedAt: string;
  deliveredAt: string | null;
  voidedAt: string | null;
  amountDue: string;
  amountPaid: string;
  lines: InvoiceLine[];
};

export type InvoiceView = InvoiceRecord & {
  displayStatus: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID";
  amountOutstanding: string;
};

export type InvoiceCursor = { dueOn: string; id: string };
export type InvoiceListResult = {
  items: InvoiceView[];
  nextCursor: InvoiceCursor | null;
};

export type VoidInvoiceInput = {
  actorId: string;
  invoiceId: string;
  reason: string;
  idempotencyKey: string;
  requestHash: string;
};

export type InvoiceRepository = {
  listInvoices(input: {
    actorId: string;
    limit: number;
    cursor: InvoiceCursor | null;
  }): Promise<InvoiceRecord[]>;
  getInvoice(input: {
    actorId: string;
    invoiceId: string;
  }): Promise<InvoiceRecord | null>;
  markInvoiceDelivered(input: {
    actorId: string;
    invoiceId: string;
    channel: "MANUAL";
  }): Promise<{
    invoiceId: string;
    status: "ISSUED";
    deliveryStatus: "SENT";
    channel: "MANUAL";
    deliveredAt: string | null;
  }>;
  voidInvoice(input: VoidInvoiceInput): Promise<{
    invoiceId: string;
    status: "VOID";
    voidedAt: string;
  }>;
};

export function listInvoices(input: {
  actor: InvoiceActor;
  input?: unknown;
  repository: InvoiceRepository;
  today?: string;
}): Promise<InvoiceListResult>;

export function getInvoice(input: {
  actor: InvoiceActor;
  input: unknown;
  repository: InvoiceRepository;
  today?: string;
}): Promise<InvoiceView>;

export function markInvoiceDelivered(input: {
  actor: InvoiceActor;
  input: unknown;
  repository: InvoiceRepository;
}): Promise<{
  invoiceId: string;
  status: "ISSUED";
  deliveryStatus: "SENT";
  channel: "MANUAL";
  deliveredAt: string | null;
}>;

export function voidInvoice(input: {
  actor: InvoiceActor;
  input: unknown;
  repository: InvoiceRepository;
}): Promise<{
  invoiceId: string;
  status: "VOID";
  voidedAt: string;
}>;
