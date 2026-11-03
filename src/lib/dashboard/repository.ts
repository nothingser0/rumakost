import "server-only";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { DomainError, mapPersistenceError } from "@/lib/errors/domain-error.mjs";
import { getDatabaseEnv } from "@/lib/env";
import type { DashboardRepository } from "./operations.mjs";

const moneyTextSchema = z.string().regex(/^\d+\.\d{2}$/);
const ticketStatusSchema = z.enum([
  "DRAFT",
  "RECEIVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "INSPECTION",
  "RESOLVED",
  "CANCELLED",
]);

const ticketCountSchema = z.object({
  status: ticketStatusSchema,
  count: z.number().int().nonnegative(),
}).strict();

const operationalFactsSchema = z.object({
  occupiedRooms: z.number().int().nonnegative(),
  totalRooms: z.number().int().nonnegative(),
  ticketStatusCounts: z.array(ticketCountSchema),
}).strict();

const collectionFactsSchema = z.object({
  issuedRentAmount: moneyTextSchema,
  collectedRentAmount: moneyTextSchema,
}).strict();

const OPERATIONAL_DASHBOARD_SQL = `
  WITH room_snapshot AS MATERIALIZED (
    SELECT COUNT(room.id)::integer AS "totalRooms",
           COUNT(room.id) FILTER (
             WHERE EXISTS (
               SELECT 1
                 FROM leases lease
                WHERE lease.room_id = room.id
                  AND lease.status IN ('ACTIVE'::"LeaseStatus", 'ENDED'::"LeaseStatus")
                  AND lease.starts_on <= $1::date
                  AND (lease.ends_on IS NULL OR lease.ends_on >= $1::date)
             )
           )::integer AS "occupiedRooms"
      FROM rooms room
     WHERE room.archived_at IS NULL
  ),
  ticket_counts AS MATERIALIZED (
    SELECT ticket.status::text AS status, COUNT(*)::integer AS count
      FROM tickets ticket
     GROUP BY ticket.status
  )
  SELECT room_snapshot."occupiedRooms",
         room_snapshot."totalRooms",
         COALESCE((
           SELECT jsonb_agg(
                    jsonb_build_object('status', ticket_counts.status, 'count', ticket_counts.count)
                    ORDER BY ticket_counts.status
                  )
             FROM ticket_counts
         ), '[]'::jsonb) AS "ticketStatusCounts"
    FROM room_snapshot
`;

const OWNER_COLLECTION_SQL = `
  WITH bounds AS MATERIALIZED (
    SELECT $1::date AS start_date, $2::date AS end_date
  ),
  issued_rent AS MATERIALIZED (
    SELECT COALESCE(SUM(line.amount), 0)::numeric(30,2)::text AS amount
      FROM bounds
      JOIN invoices invoice ON invoice.issued_at >=
             (bounds.start_date::timestamp AT TIME ZONE 'Asia/Jakarta')
           AND invoice.issued_at <
             ((bounds.end_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
      JOIN invoice_lines line ON line.invoice_id = invoice.id
     WHERE invoice.status <> 'VOID'::"InvoiceStatus"
       AND line.kind = 'RENT'
  ),
  collected_rent AS MATERIALIZED (
    SELECT COALESCE(SUM(allocation.amount), 0)::numeric(30,2)::text AS amount
      FROM bounds
      JOIN invoices invoice ON invoice.issued_at >=
             (bounds.start_date::timestamp AT TIME ZONE 'Asia/Jakarta')
           AND invoice.issued_at <
             ((bounds.end_date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')
      JOIN invoice_lines line ON line.invoice_id = invoice.id AND line.kind = 'RENT'
      JOIN payment_allocations allocation ON allocation.invoice_line_id = line.id
      JOIN payments payment ON payment.id = allocation.payment_id
     WHERE invoice.status <> 'VOID'::"InvoiceStatus"
       AND payment.status = 'VERIFIED'::"PaymentStatus"
       AND NOT EXISTS (
         SELECT 1 FROM payment_reversals reversal
          WHERE reversal.payment_id = payment.id
       )
  )
  SELECT issued_rent.amount AS "issuedRentAmount",
         collected_rent.amount AS "collectedRentAmount"
    FROM issued_rent
    CROSS JOIN collected_rent
`;

function getSql() {
  return neon(getDatabaseEnv().DATABASE_URL);
}

function firstRow(rows: unknown[]): unknown {
  return Array.isArray(rows) ? rows[0] : undefined;
}

function mapDashboardPersistenceError(error: unknown): DomainError {
  if (error instanceof DomainError) return error;
  return mapPersistenceError(error);
}

export function createDashboardRepository(): DashboardRepository {
  return {
    async getOperationalFacts(asOfDate) {
      let rows: unknown[];
      try {
        rows = await getSql().query(OPERATIONAL_DASHBOARD_SQL, [asOfDate]);
      } catch (error) {
        throw mapDashboardPersistenceError(error);
      }

      const parsed = operationalFactsSchema.safeParse(firstRow(rows));
      if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
      const ticketCounts = z.array(ticketCountSchema).safeParse(parsed.data.ticketStatusCounts);
      if (!ticketCounts.success) throw new DomainError("INTERNAL_ERROR");
      return {
        occupancy: {
          occupiedRooms: parsed.data.occupiedRooms,
          totalRooms: parsed.data.totalRooms,
        },
        ticketStatusCounts: ticketCounts.data,
      };
    },

    async getCollectionFacts(input) {
      let rows: unknown[];
      try {
        rows = await getSql().query(OWNER_COLLECTION_SQL, [input.startDate, input.endDate]);
      } catch (error) {
        throw mapDashboardPersistenceError(error);
      }

      const parsed = collectionFactsSchema.safeParse(firstRow(rows));
      if (!parsed.success) throw new DomainError("INTERNAL_ERROR");
      return parsed.data;
    },
  };
}
