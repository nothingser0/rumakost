-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'INSPECTION', 'RESOLVED');

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "assigned_to_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'RECEIVED',
    "closed_at" TIMESTAMPTZ(6),
    "reopened_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tickets_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "tickets_room_id_idx" ON "tickets"("room_id");
CREATE INDEX "tickets_created_by_id_idx" ON "tickets"("created_by_id");
CREATE INDEX "tickets_assigned_to_id_idx" ON "tickets"("assigned_to_id");
CREATE INDEX "tickets_status_created_at_idx" ON "tickets"("status", "created_at" DESC);
