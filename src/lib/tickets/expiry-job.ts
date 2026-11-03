import "server-only";

import { createTicketRepository } from "./repository";
import type { TicketExpiryResult } from "./operations.mjs";

export async function runTicketDraftExpiryJob(): Promise<TicketExpiryResult> {
  return createTicketRepository().expireTicketDrafts();
}
