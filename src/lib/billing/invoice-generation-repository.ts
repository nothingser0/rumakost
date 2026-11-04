import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import { createInvoiceGenerationRunId } from "./generate-invoices.mjs";
import type {
  EligibleLease,
  InvoiceGenerationRepository,
  RecurringInvoiceCandidate,
} from "./generate-invoices";

const leaseRowSchema = z.object({
  id: z.string().uuid(),
  startsOn: z.string(),
  endsOn: z.string().nullable(),
  rentAmount: z.string(),
  billingMode: z.enum([
    "PRORATA_TO_MONTH_END",
    "FULL_MONTH_ANNIVERSARY",
  ]),
  status: z.enum(["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"]),
}).strict();

const generationRowSchema = z.object({
  eligibleCount: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  duplicateCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  auditCount: z.number().int().nonnegative(),
  lineCount: z.number().int().nonnegative(),
}).strict();

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function parseLeaseRows(rows: unknown[]): EligibleLease[] {
  try {
    return rows.map((row) => leaseRowSchema.parse(row));
  } catch {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function toCandidateRecords(candidates: RecurringInvoiceCandidate[]) {
  return candidates.map((candidate) => ({
    invoiceId: randomUUID(),
    lineId: randomUUID(),
    leaseId: candidate.leaseId,
    periodStart: candidate.periodStart,
    periodEnd: candidate.periodEnd,
    dueOn: candidate.dueOn,
  }));
}

export function createInvoiceGenerationRepository(): InvoiceGenerationRepository {
  return {
    async findEligibleLeases(localDate) {
      const rows: unknown[] = await getSql().query(
        `SELECT id,
                starts_on::text AS "startsOn",
                ends_on::text AS "endsOn",
                rent_amount::text AS "rentAmount",
                billing_mode::text AS "billingMode",
                status::text AS status
           FROM leases
          WHERE status IN ('ACTIVE'::"LeaseStatus", 'SCHEDULED'::"LeaseStatus")
            AND starts_on < $1::date
            AND (ends_on IS NULL OR ends_on >= $1::date)
          ORDER BY id`,
        [localDate],
      );
      return parseLeaseRows(rows);
    },

    async createRecurringInvoices({
      localDate,
      source,
      actorId,
      candidates,
    }) {
      const sql = getSql();
      const records = toCandidateRecords(candidates);
      const runId = createInvoiceGenerationRunId();
      const rows: unknown[] = await sql.query(
        `WITH candidates AS MATERIALIZED (
           SELECT *
             FROM jsonb_to_recordset($1::jsonb) AS candidate(
               "invoiceId" uuid,
               "lineId" uuid,
               "leaseId" uuid,
               "periodStart" date,
               "periodEnd" date,
               "dueOn" date
             )
         ),
         authorized_actor AS MATERIALIZED (
           SELECT CASE
                    WHEN $2::text = 'SCHEDULER' THEN NULL::uuid
                    ELSE app_user.id
                  END AS actor_id
             FROM (SELECT 1) AS request
             LEFT JOIN app_users AS app_user
               ON $2::text = 'OWNER_RERUN'
              AND app_user.id = $4::uuid
              AND app_user.role = 'OWNER'::"AppRole"
              AND app_user.is_active
              AND NOT app_user.must_change_password
            WHERE $2::text = 'SCHEDULER' OR app_user.id IS NOT NULL
         ),
         valid_candidates AS MATERIALIZED (
           SELECT candidate.*
             FROM candidates AS candidate
             JOIN leases AS lease ON lease.id = candidate."leaseId"
            WHERE candidate."periodStart" = $3::date
              AND candidate."dueOn" = $3::date
              AND candidate."periodEnd" >= candidate."periodStart"
              AND lease.status IN ('ACTIVE'::"LeaseStatus", 'SCHEDULED'::"LeaseStatus")
              AND lease.starts_on < $3::date
              AND (lease.ends_on IS NULL OR lease.ends_on >= $3::date)
              AND (
                (
                  lease.billing_mode = 'PRORATA_TO_MONTH_END'::"BillingMode"
                  AND date_trunc('month', $3::date)::date = $3::date
                  AND candidate."periodEnd" =
                    (date_trunc('month', $3::date) + interval '1 month - 1 day')::date
                )
                OR
                (
                  lease.billing_mode = 'FULL_MONTH_ANNIVERSARY'::"BillingMode"
                  AND EXTRACT(DAY FROM $3::date)::integer = LEAST(
                    EXTRACT(DAY FROM lease.starts_on)::integer,
                    EXTRACT(DAY FROM (
                      date_trunc('month', $3::date) + interval '1 month - 1 day'
                    ))::integer
                  )
                  AND candidate."periodEnd" = (
                    date_trunc('month', $3::date)
                    + interval '1 month'
                    + (
                      LEAST(
                        EXTRACT(DAY FROM lease.starts_on)::integer,
                        EXTRACT(DAY FROM (
                          date_trunc('month', $3::date) + interval '2 months - 1 day'
                        ))::integer
                      ) - 1
                    ) * interval '1 day'
                    - interval '1 day'
                  )::date
                )
              )
         ),
         inserted_invoices AS (
           INSERT INTO invoices (
             id, lease_id, period_start, period_end, due_on, kind, status,
             issued_at, delivery_status, voided_at, created_at, updated_at
           )
           SELECT candidate."invoiceId",
                  lease.id,
                  candidate."periodStart",
                  candidate."periodEnd",
                  candidate."dueOn",
                  'RECURRING',
                  'ISSUED'::"InvoiceStatus",
                  CURRENT_TIMESTAMP,
                  'UNSENT'::"InvoiceDeliveryStatus",
                  NULL,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
             FROM valid_candidates AS candidate
             JOIN leases AS lease ON lease.id = candidate."leaseId"
             CROSS JOIN authorized_actor
           WHERE TRUE
           ON CONFLICT (lease_id, period_start, period_end, kind) DO NOTHING
           RETURNING id, lease_id, period_start, period_end
         ),
         inserted_lines AS (
           INSERT INTO invoice_lines (id, invoice_id, kind, amount, description)
           SELECT candidate."lineId",
                  invoice.id,
                  'RENT',
                  lease.rent_amount,
                  'Sewa rutin'
             FROM inserted_invoices AS invoice
             JOIN valid_candidates AS candidate
               ON candidate."leaseId" = invoice.lease_id
              AND candidate."periodStart" = invoice.period_start
              AND candidate."periodEnd" = invoice.period_end
             JOIN leases AS lease ON lease.id = invoice.lease_id
           RETURNING invoice_id
         ),
         audit_event AS (
           INSERT INTO audit_events (
             id, actor_id, action, entity_type, entity_id, occurred_at,
             reason, safe_metadata
           )
           SELECT $5::uuid,
                  authorized_actor.actor_id,
                  'INVOICE_GENERATION_RUN',
                  'INVOICE_GENERATION',
                  $5::uuid,
                  CURRENT_TIMESTAMP,
                  NULL,
                  jsonb_build_object(
                    'source', $2::text,
                    'localDate', $3::text,
                    'eligibleCount', (SELECT COUNT(*)::integer FROM valid_candidates),
                    'createdCount', (SELECT COUNT(*)::integer FROM inserted_invoices),
                    'duplicateCount',
                      (SELECT COUNT(*) FROM valid_candidates)
                      - (SELECT COUNT(*) FROM inserted_invoices),
                    'skippedCount',
                      $6::integer - (SELECT COUNT(*) FROM valid_candidates),
                    'lineCount', (SELECT COUNT(*)::integer FROM inserted_lines)
                  )
             FROM authorized_actor
           RETURNING id
         )
         SELECT (SELECT COUNT(*)::integer FROM valid_candidates) AS "eligibleCount",
                (SELECT COUNT(*)::integer FROM inserted_invoices) AS "createdCount",
                (
                  (SELECT COUNT(*) FROM valid_candidates)
                  - (SELECT COUNT(*) FROM inserted_invoices)
                )::integer AS "duplicateCount",
                (
                  $6::integer - (SELECT COUNT(*) FROM valid_candidates)
                )::integer AS "skippedCount",
                (SELECT COUNT(*)::integer FROM audit_event) AS "auditCount",
                (SELECT COUNT(*)::integer FROM inserted_lines) AS "lineCount"
         FROM audit_event`,
        [
          JSON.stringify(records),
          source,
          localDate,
          actorId,
          runId,
          records.length,
        ],
      );

      if (rows.length !== 1) {
        if (source === "OWNER_RERUN") throw new DomainError("FORBIDDEN");
        throw new DomainError("INTERNAL_ERROR");
      }

      let result: z.infer<typeof generationRowSchema>;
      try {
        result = generationRowSchema.parse(rows[0]);
      } catch {
        throw new DomainError("INTERNAL_ERROR");
      }

      if (result.auditCount !== 1 || result.lineCount !== result.createdCount) {
        throw new DomainError("INTERNAL_ERROR");
      }

      return {
        eligibleCount: result.eligibleCount,
        createdCount: result.createdCount,
        duplicateCount: result.duplicateCount,
        skippedCount: result.skippedCount,
      };
    },
  };
}
