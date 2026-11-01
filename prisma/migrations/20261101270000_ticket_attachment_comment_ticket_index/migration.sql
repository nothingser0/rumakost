-- Index the complete child key used by the composite comment/ticket foreign key.
DROP INDEX "ticket_attachments_comment_id_idx";

CREATE INDEX "ticket_attachments_comment_id_ticket_id_idx"
ON "ticket_attachments"("comment_id", "ticket_id");
