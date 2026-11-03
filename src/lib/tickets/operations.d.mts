export type TicketRole = "OWNER" | "STAFF" | "TENANT";
export type TicketStatus =
  | "DRAFT"
  | "RECEIVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "RESOLVED"
  | "CANCELLED";

export type TicketActor = {
  id: string;
  role: TicketRole;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type TicketSummary = {
  id: string;
  ticketNumber: string;
  ticketLabel: string;
  roomId: string;
  roomCode: string;
  leaseId: string | null;
  createdById: string;
  createdByName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  title: string;
  category: "AC" | "PLUMBING" | "ELECTRICAL" | "DOORS_LOCKS" | "FURNITURE" | "GENERAL";
  priority: "LOW" | "NORMAL" | "URGENT";
  status: TicketStatus;
  targetCompletionOn: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetail = TicketSummary & {
  description: string;
  resolutionSummary: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  reopenedAt: string | null;
  statusChangedById: string | null;
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorRole: TicketRole;
    body: string;
    visibility: "TENANT_VISIBLE" | "INTERNAL";
    createdAt: string;
  }>;
  attachments: Array<{
    id: string;
    commentId: string | null;
    uploadedById: string;
    mimeType: string;
    sizeBytes: string;
    durationSeconds: number | null;
    uploadStatus: "PENDING_UPLOAD" | "AVAILABLE" | "DELETE_PENDING" | "DELETED" | "FAILED";
    createdAt: string;
  }>;
  statusEvents: Array<{
    id: string;
    fromStatus: TicketStatus | null;
    toStatus: TicketStatus;
    actorType: "USER" | "SYSTEM";
    actorId: string | null;
    reason: string | null;
    resolutionSummary: string | null;
    occurredAt: string;
  }>;
};

export type TicketMutationResult = {
  ticketId: string;
  status: TicketStatus;
  updatedAt: string;
};

export type TicketCommentResult = {
  commentId: string;
  ticketId: string;
  visibility: "TENANT_VISIBLE" | "INTERNAL";
  createdAt: string;
};

export type TicketExpiryResult = {
  expiredTickets: number;
  queuedAttachments: number;
};
export type TicketListResult = {
  items: TicketSummary[];
  nextCursor: { createdAt: string; id: string } | null;
};

export type TicketRepository = {
  createTicketDraft(input: {
    actorId: string;
    idempotencyKey: string;
    requestHash: string;
    roomId: string;
    leaseId?: string | null;
    category: string;
    title: string;
    description: string;
    priority: string;
  }): Promise<TicketSummary>;
  listTickets(input: {
    actorId: string;
    role: TicketRole;
    limit: number;
    cursor: { createdAt: string; id: string } | null;
  }): Promise<TicketSummary[]>;
  getTicket(input: {
    actorId: string;
    role: TicketRole;
    ticketId: string;
  }): Promise<TicketDetail | null>;
  submitTicketDraft(input: {
    actorId: string;
    actorRole: TicketRole;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
  }): Promise<TicketMutationResult>;
  discardTicketDraft(input: {
    actorId: string;
    actorRole: TicketRole;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
    reason: string;
  }): Promise<TicketMutationResult>;
  updateTicket(input: {
    actorId: string;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
    status?: Exclude<TicketStatus, "DRAFT" | "CANCELLED">;
    priority?: "LOW" | "NORMAL" | "URGENT";
    assignedToId?: string | null;
    targetCompletionOn?: string | null;
    resolutionSummary?: string;
  }): Promise<TicketMutationResult>;
  assignTicket(input: {
    actorId: string;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
    assignedToId: string | null;
  }): Promise<TicketMutationResult>;
  cancelTicket(input: {
    actorId: string;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
    reason: string;
  }): Promise<TicketMutationResult>;
  reopenTicket(input: {
    actorId: string;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
  }): Promise<TicketMutationResult>;
  addTicketComment(input: {
    actorId: string;
    actorRole: TicketRole;
    idempotencyKey: string;
    requestHash: string;
    ticketId: string;
    body: string;
    visibility: "TENANT_VISIBLE" | "INTERNAL";
  }): Promise<TicketCommentResult>;
  expireTicketDrafts(): Promise<TicketExpiryResult>;
};

export function createTicketDraft(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketSummary>;
export function listTickets(args: {
  actor: TicketActor;
  input?: unknown;
  repository: TicketRepository;
}): Promise<TicketListResult>;
export function getTicket(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketDetail>;
export function submitTicketDraft(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function discardTicketDraft(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function updateTicket(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function assignTicket(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function cancelTicket(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function reopenTicket(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketMutationResult>;
export function addTicketComment(args: {
  actor: TicketActor;
  input: unknown;
  repository: TicketRepository;
}): Promise<TicketCommentResult>;
export function expireTicketDrafts(args: {
  repository: TicketRepository;
}): Promise<TicketExpiryResult>;
