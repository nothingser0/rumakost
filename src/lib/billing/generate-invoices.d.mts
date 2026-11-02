export type BillingMode = "PRORATA_TO_MONTH_END" | "FULL_MONTH_ANNIVERSARY";
export type LeaseStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
export type GenerationSource = "SCHEDULER" | "OWNER_RERUN";

export type EligibleLease = {
  id: string;
  startsOn: string;
  endsOn: string | null;
  rentAmount: string;
  billingMode: BillingMode;
  status: LeaseStatus;
};

export type RecurringInvoiceCandidate = {
  leaseId: string;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  kind: "RECURRING";
};

export type InvoiceGenerationActor = {
  id: string;
  role: "OWNER" | "STAFF" | "TENANT";
  isActive: boolean;
  mustChangePassword: boolean;
};

export type InvoiceGenerationResult = {
  localDate: string;
  eligibleCount: number;
  createdCount: number;
  duplicateCount: number;
  skippedCount: number;
};

export type InvoiceGenerationRepository = {
  findEligibleLeases(localDate: string): Promise<EligibleLease[]>;
  createRecurringInvoices(input: {
    localDate: string;
    source: GenerationSource;
    actorId: string | null;
    candidates: RecurringInvoiceCandidate[];
  }): Promise<Omit<InvoiceGenerationResult, "localDate">>;
};

export function calculateRecurringInvoice(input: {
  lease: EligibleLease;
  localDate: string;
}): RecurringInvoiceCandidate | null;

export function getJakartaLocalDate(date?: Date): string;

export function runInvoiceGeneration(input: {
  localDate: string;
  source: GenerationSource;
  actor?: InvoiceGenerationActor;
  repository: InvoiceGenerationRepository;
}): Promise<InvoiceGenerationResult>;

export function createInvoiceGenerationRunId(): string;
