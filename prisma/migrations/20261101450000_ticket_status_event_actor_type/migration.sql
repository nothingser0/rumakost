CREATE TYPE "TicketStatusActorType" AS ENUM ('USER', 'SYSTEM');

ALTER TABLE "ticket_status_events"
ADD COLUMN "actor_type" "TicketStatusActorType" NOT NULL DEFAULT 'USER';

ALTER TABLE "ticket_status_events"
ALTER COLUMN "actor_id" DROP NOT NULL;

ALTER TABLE "ticket_status_events"
ADD CONSTRAINT "ticket_status_events_actor_type_actor_id_check"
CHECK (
  ("actor_type" = 'USER' AND "actor_id" IS NOT NULL)
  OR
  ("actor_type" = 'SYSTEM' AND "actor_id" IS NULL)
);
