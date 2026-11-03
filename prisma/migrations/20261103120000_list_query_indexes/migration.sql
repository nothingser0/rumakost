CREATE INDEX "invoices_due_on_id_idx"
  ON "invoices" ("due_on" DESC, "id" DESC);

CREATE INDEX "tickets_created_at_id_idx"
  ON "tickets" ("created_at" DESC, "id" DESC);
