-- CreateEnum
CREATE TYPE "TicketUploadStatus" AS ENUM ('PENDING_UPLOAD', 'AVAILABLE', 'DELETE_PENDING', 'DELETED', 'FAILED');

-- CreateIndex
CREATE UNIQUE INDEX "ticket_comments_id_ticket_id_key" ON "ticket_comments"("id", "ticket_id");

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "comment_id" UUID,
    "uploaded_by_id" UUID NOT NULL,
    "object_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "duration_seconds" INTEGER,
    "upload_status" "TicketUploadStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_after" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ticket_attachments_size_positive" CHECK ("size_bytes" > 0),
    CONSTRAINT "ticket_attachments_duration_positive" CHECK ("duration_seconds" IS NULL OR "duration_seconds" > 0),
    CONSTRAINT "ticket_attachments_object_key_key" UNIQUE ("object_key"),
    CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_attachments_comment_id_ticket_id_fkey" FOREIGN KEY ("comment_id", "ticket_id") REFERENCES "ticket_comments"("id", "ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ticket_attachments_ticket_id_idx" ON "ticket_attachments"("ticket_id");
CREATE INDEX "ticket_attachments_comment_id_idx" ON "ticket_attachments"("comment_id");
CREATE INDEX "ticket_attachments_uploaded_by_id_idx" ON "ticket_attachments"("uploaded_by_id");
CREATE INDEX "ticket_attachments_delete_after_idx" ON "ticket_attachments"("delete_after");
