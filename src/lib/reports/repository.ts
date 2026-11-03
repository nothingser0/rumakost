import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type {
  FinancialReportRepositoryResult,
  OperatingBudgetResult,
  ReportsRepository,
} from "./operations.mjs";

const moneyTextSchema = z.string().regex(/^\d+\.\d{2}$/);
const signedMoneyTextSchema = z.string().regex(/^-?\d+\.\d{2}$/);
const roleSchema = z.enum(["OWNER", "STAFF", "TENANT"]);

const budgetAttemptSchema = z.object({
  actorId: z.string().uuid().nullable(),
  actorRole: roleSchema.nullable(),
  resultId: z.string().uuid().nullable(),
  resultMonth: z.string().nullable(),
  resultAmount: z.string().nullable(),
  resultUpdatedById: z.string().uuid().nullable(),
  resultCreatedAt: z.string().nullable(),
  resultUpdatedAt: z.string().nullable(),
  auditEventId: z.string().uuid().nullable(),
}).strict();

const reportRowSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  verifiedRentIncome: moneyTextSchema,
  reversedRentPayments: moneyTextSchema,
  grossExpenses: moneyTextSchema,
  expenseReversals: moneyTextSchema,
  occupiedRooms: z.number().int().nonnegative(),
  totalRooms: z.number().int().nonnegative(),
  budgetRows: z.unknown(),
}).strict();

const budgetRowSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  status: z.enum(["SET", "NOT_SET"]),
  budgetAmount: moneyTextSchema.nullable(),
  actualAmount: moneyTextSchema,
  remainingAmount: signedMoneyTextSchema.nullable(),
}).strict();

const SET_OPERATING_BUDGET_SQL = `
  WITH actor AS MATERIALIZED (
    SELECT id, role::text AS role
      FROM app_users
     WHERE id = $1::uuid
       AND role = 'OWNER'::"AppRole"
       AND is_active
       AND NOT must_change_password
  ),
  prior AS MATERIALIZED (
    SELECT id,
           to_char(period_start, 'YYYY-MM') AS month,
           amount::numeric(12,2)::text AS amount,
           updated_by_id AS "updatedById",
           to_char(created_at AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
           to_char(updated_at AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "updatedAt"
      FROM operating_budgets
     WHERE period_start = $3::date
  ),
  written AS (
    INSERT INTO operating_budgets (
      id, period_start, amount, updated_by_id, created_at, updated_at
    )
    SELECT $2::uuid, $3::date, $4::numeric(12,2), actor.id,
           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM actor
     WHERE true
    ON CONFLICT (period_start) DO UPDATE
       SET amount = EXCLUDED.amount,
           updated_by_id = EXCLUDED.updated_by_id,
           updated_at = CURRENT_TIMESTAMP
     WHERE operating_budgets.amount IS DISTINCT FROM EXCLUDED.amount
    RETURNING id,
              to_char(period_start, 'YYYY-MM') AS month,
              amount::numeric(12,2)::text AS amount,
              updated_by_id AS "updatedById",
              to_char(created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
              to_char(updated_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "updatedAt"
  ),
  audit AS (
    INSERT INTO audit_events (
      id, actor_id, action, entity_type, entity_id, occurred_at,
      reason, safe_metadata
    )
    SELECT $5::uuid, actor.id, 'OPERATING_BUDGET_SET', 'OPERATING_BUDGET', written.id,
           CURRENT_TIMESTAMP, NULL,
           jsonb_build_object(
             'month', written.month,
             'amount', written.amount,
             'previousAmount', (SELECT amount FROM prior)
           )
      FROM written
      JOIN actor ON TRUE
    RETURNING id
  )
  SELECT (SELECT id FROM actor) AS "actorId",
         (SELECT role FROM actor) AS "actorRole",
         COALESCE((SELECT id FROM written), (SELECT id FROM prior)) AS "resultId",
         COALESCE((SELECT month FROM written), (SELECT month FROM prior)) AS "resultMonth",
         COALESCE((SELECT amount FROM written), (SELECT amount FROM prior)) AS "resultAmount",
         COALESCE((SELECT "updatedById" FROM written), (SELECT "updatedById" FROM prior)) AS "resultUpdatedById",
         COALESCE((SELECT "createdAt" FROM written), (SELECT "createdAt" FROM prior)) AS "resultCreatedAt",
         COALESCE((SELECT "updatedAt" FROM written), (SELECT "updatedAt" FROM prior)) AS "resultUpdatedAt",
         (SELECT id FROM audit) AS "auditEventId"
    FROM (SELECT 1) AS request
`;

const GET_FINANCIAL_REPORT_SQL = `
  WITH bounds AS MATERIALIZED (
    SELECT $1::date AS start_date, $2::date AS end_date
  ),
  rent_income AS MATERIALIZED (
    SELECT COALESCE(SUM(allocation.amount), 0)::numeric(30,2)::text AS amount
      FROM bounds
      JOIN payments payment ON payment.verified_at >=
             (bounds.start_date::timestamp AT TIME ZONE 'Asia/Jakarta')
           AND payment.verified_at <
             ((bounds.end_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
      JOIN payment_allocations allocation ON allocation.payment_id = payment.id
      JOIN invoice_lines line ON line.id = allocation.invoice_line_id
     WHERE payment.status = 'VERIFIED'::"PaymentStatus"
       AND line.kind = 'RENT'
  ),
  rent_reversals AS MATERIALIZED (
    SELECT COALESCE(SUM(allocation.amount), 0)::numeric(30,2)::text AS amount
      FROM bounds
      JOIN payment_reversals reversal ON reversal.created_at >=
             (bounds.start_date::timestamp AT TIME ZONE 'Asia/Jakarta')
           AND reversal.created_at <
             ((bounds.end_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
      JOIN payment_allocations allocation ON allocation.payment_id = reversal.payment_id
      JOIN invoice_lines line ON line.id = allocation.invoice_line_id
     WHERE line.kind = 'RENT'
  ),
  gross_expenses AS MATERIALIZED (
    SELECT COALESCE(SUM(expense.amount), 0)::numeric(30,2)::text AS amount
      FROM expenses expense
      CROSS JOIN bounds
     WHERE expense.occurred_on BETWEEN bounds.start_date AND bounds.end_date
  ),
  expense_reversal_total AS MATERIALIZED (
    SELECT COALESCE(SUM(reversal.amount), 0)::numeric(30,2)::text AS amount
      FROM bounds
      JOIN expense_reversals reversal ON reversal.created_at >=
             (bounds.start_date::timestamp AT TIME ZONE 'Asia/Jakarta')
           AND reversal.created_at <
             ((bounds.end_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
  ),
  room_snapshot AS MATERIALIZED (
    SELECT COUNT(room.id)::integer AS "totalRooms",
           COUNT(room.id) FILTER (
             WHERE EXISTS (
               SELECT 1
                 FROM leases lease
                WHERE lease.room_id = room.id
                  AND lease.status = 'ACTIVE'::"LeaseStatus"
                  AND lease.starts_on <= bounds.end_date
                  AND (lease.ends_on IS NULL OR lease.ends_on >= bounds.end_date)
             )
           )::integer AS "occupiedRooms"
      FROM rooms room
      CROSS JOIN bounds
     WHERE room.archived_at IS NULL
  ),
  report_months AS MATERIALIZED (
    SELECT generate_series(
             date_trunc('month', bounds.start_date::timestamp),
             date_trunc('month', bounds.end_date::timestamp),
             interval '1 month'
           )::date AS period_start
      FROM bounds
  ),
  monthly_budget AS MATERIALIZED (
    SELECT to_char(months.period_start, 'YYYY-MM') AS month,
           budget.amount::numeric(12,2)::text AS "budgetAmount",
           COALESCE(actual.amount, 0)::numeric(30,2)::text AS "actualAmount",
           CASE WHEN budget.id IS NULL THEN 'NOT_SET' ELSE 'SET' END AS status,
           CASE WHEN budget.id IS NULL THEN NULL
                ELSE (budget.amount - COALESCE(actual.amount, 0))::numeric(30,2)::text
           END AS "remainingAmount"
      FROM report_months months
      LEFT JOIN operating_budgets budget ON budget.period_start = months.period_start
      LEFT JOIN LATERAL (
        SELECT SUM(expense.amount) AS amount
          FROM expenses expense
         WHERE expense.occurred_on >= months.period_start
           AND expense.occurred_on < (months.period_start + interval '1 month')::date
           AND NOT EXISTS (
             SELECT 1 FROM expense_reversals reversal
              WHERE reversal.expense_id = expense.id
           )
      ) actual ON TRUE
  ),
  budget_list AS MATERIALIZED (
    SELECT COALESCE(
             jsonb_agg(
               jsonb_build_object(
                 'month', monthly_budget.month,
                 'status', monthly_budget.status,
                 'budgetAmount', monthly_budget."budgetAmount",
                 'actualAmount', monthly_budget."actualAmount",
                 'remainingAmount', monthly_budget."remainingAmount"
               ) ORDER BY monthly_budget.month
             ),
             '[]'::jsonb
           ) AS rows
      FROM monthly_budget
  )
  SELECT to_char(bounds.start_date, 'YYYY-MM-DD') AS "startDate",
         to_char(bounds.end_date, 'YYYY-MM-DD') AS "endDate",
         rent_income.amount AS "verifiedRentIncome",
         rent_reversals.amount AS "reversedRentPayments",
         gross_expenses.amount AS "grossExpenses",
         expense_reversal_total.amount AS "expenseReversals",
         room_snapshot."occupiedRooms",
         room_snapshot."totalRooms",
         budget_list.rows AS "budgetRows"
    FROM bounds
    CROSS JOIN rent_income
    CROSS JOIN rent_reversals
    CROSS JOIN gross_expenses
    CROSS JOIN expense_reversal_total
    CROSS JOIN room_snapshot
    CROSS JOIN budget_list
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function firstRow(rows: unknown[]): unknown {
  return Array.isArray(rows) ? rows[0] : undefined;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function mapReportsPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  if (["23505", "23503", "23514", "40001", "40P01"].includes(code)) {
    return new DomainError("CONFLICT");
  }
  return mapPersistenceError(error);
}

export function createReportsRepository(): ReportsRepository {
  return {
    async setOperatingBudget(input): Promise<OperatingBudgetResult> {
      const sql = getSql();
      let results: unknown[][];
      try {
        results = await sql.transaction([
          sql.query(
            `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))`,
            [input.month],
          ),
          sql.query(SET_OPERATING_BUDGET_SQL, [
            input.actorId,
            randomUUID(),
            `${input.month}-01`,
            input.amount,
            randomUUID(),
          ]),
        ]);
      } catch (error) {
        throw mapReportsPersistenceError(error);
      }

      const attempt = budgetAttemptSchema.safeParse(firstRow(results[1]));
      if (!attempt.success) throw new DomainError("INTERNAL_ERROR");
      if (!attempt.data.actorId || attempt.data.actorRole !== "OWNER") {
        throw new DomainError("NOT_OWNER");
      }
      if (!attempt.data.resultId || !attempt.data.resultMonth || !attempt.data.resultAmount ||
          !attempt.data.resultUpdatedById || !attempt.data.resultCreatedAt ||
          !attempt.data.resultUpdatedAt) {
        throw new DomainError("INTERNAL_ERROR");
      }

      return {
        id: attempt.data.resultId,
        month: attempt.data.resultMonth,
        amount: attempt.data.resultAmount,
        updatedById: attempt.data.resultUpdatedById,
        createdAt: attempt.data.resultCreatedAt,
        updatedAt: attempt.data.resultUpdatedAt,
      };
    },

    async getFinancialReport(input): Promise<FinancialReportRepositoryResult> {
      const sql = getSql();
      let rows: unknown[];
      try {
        rows = await sql.query(GET_FINANCIAL_REPORT_SQL, [input.startDate, input.endDate]);
      } catch (error) {
        throw mapReportsPersistenceError(error);
      }

      const parsed = reportRowSchema.safeParse(firstRow(rows));
      if (!parsed.success) throw new DomainError("INTERNAL_ERROR");

      const budgetRows = z.array(budgetRowSchema).safeParse(parseJson(parsed.data.budgetRows));
      if (!budgetRows.success) throw new DomainError("INTERNAL_ERROR");

      const verifiedRentIncome = parsed.data.verifiedRentIncome;
      const reversedRentPayments = parsed.data.reversedRentPayments;
      const grossExpenses = parsed.data.grossExpenses;
      const expenseReversals = parsed.data.expenseReversals;

      return {
        period: {
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
        },
        cashFlow: {
          verifiedRentIncome,
          reversedRentPayments,
          grossExpenses,
          expenseReversals,
        },
        occupancy: {
          asOf: parsed.data.endDate,
          occupiedRooms: parsed.data.occupiedRooms,
          totalRooms: parsed.data.totalRooms,
        },
        budgets: budgetRows.data,
      };
    },
  };
}
