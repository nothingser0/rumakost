CREATE TABLE "operating_budgets" (
    "id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "updated_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "operating_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "operating_budgets_period_start_first_day" CHECK (EXTRACT(DAY FROM "period_start") = 1),
    CONSTRAINT "operating_budgets_amount_positive" CHECK ("amount" > 0),
    CONSTRAINT "operating_budgets_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "operating_budgets_period_start_key" ON "operating_budgets"("period_start");
CREATE INDEX "operating_budgets_updated_by_id_idx" ON "operating_budgets"("updated_by_id");
