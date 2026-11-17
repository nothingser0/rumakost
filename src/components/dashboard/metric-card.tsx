import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { OccupancyGauge } from "@/components/ui/occupancy-gauge";
import type { DashboardSnapshot } from "@/lib/dashboard/operations.mjs";
import styles from "./metric-card.module.css";

export type MetricTone = "brand" | "dark" | "danger" | "success" | "warning" | "neutral";

/**
 * Compact Indonesian Rupiah formatter (e.g. Rp 16,50 Jt, Rp 800 rb).
 */
export function formatCompactRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Rp 0";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return "Rp 0";
  if (num === 0) return "Rp 0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const formatted = (abs / 1_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}Rp ${formatted} M`;
  }

  if (abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}Rp ${formatted} Jt`;
  }

  if (abs >= 1_000) {
    const formatted = (abs / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    });
    return `${sign}Rp ${formatted} rb`;
  }

  return `${sign}Rp ${abs.toLocaleString("id-ID")}`;
}

/**
 * Full Indonesian Rupiah format (e.g. Rp 16.500.000).
 */
export function formatFullRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Rp 0";
  const num = typeof value === "number" ? Math.floor(value) : parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${new Intl.NumberFormat("id-ID").format(num)}`;
}

/* =========================================================================
   Standard SVG Icons (Zero Emoji)
   ========================================================================= */

export function BuildingIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <rect height="20" rx="2" ry="2" width="16" x="4" y="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

export function ReceiptIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-8" />
      <path d="M16 12h-8" />
      <path d="M10 16h-2" />
    </svg>
  );
}

export function ExpenseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function WrenchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/* =========================================================================
   Base MetricCard Component (CMP-09)
   ========================================================================= */

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  icon: ReactNode;
  iconTone?: MetricTone;
  badge?: ReactNode;
  badgeTone?: MetricTone;
  subtitle: string;
  value: ReactNode;
  subValue?: ReactNode;
  gauge?: ReactNode;
  href?: string;
  ariaLabel?: string;
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    {
      title,
      icon,
      iconTone = "brand",
      badge,
      badgeTone = "brand",
      subtitle,
      value,
      subValue,
      gauge,
      href,
      onClick,
      ariaLabel,
      className,
      ...restProps
    },
    ref,
  ) {
    const effectiveAriaLabel =
      ariaLabel ??
      `${title}: ${typeof value === "string" || typeof value === "number" ? value : ""} ${typeof subValue === "string" ? subValue : ""}`.trim();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === "Enter" || e.key === " ") && (onClick || href)) {
        e.preventDefault();
        if (onClick) {
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        } else if (href && typeof window !== "undefined") {
          window.location.href = href;
        }
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick(e);
      } else if (href && typeof window !== "undefined") {
        window.location.href = href;
      }
    };

    const isInteractive = Boolean(onClick || href);

    return (
      <div
        ref={ref}
        role={isInteractive ? "link" : "region"}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={effectiveAriaLabel}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={[styles.card, className].filter(Boolean).join(" ")}
        {...restProps}
      >
        <div className={styles.cardTop}>
          <div className={styles.titleGroup}>
            <div className={`${styles.iconBox} ${styles[`tone-${iconTone}`]}`}>
              {icon}
            </div>
            <span className={styles.cardTitle}>{title}</span>
          </div>
          {badge ? (
            <span className={`${styles.badgePill} ${styles[`tone-${badgeTone}`]}`}>
              {badge}
            </span>
          ) : null}
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.valueCol}>
            <span className={styles.cardSubtitle}>{subtitle}</span>
            <div className={styles.cardValueHuge}>
              {value}
              {subValue ? <span className={styles.cardSubValue}>{subValue}</span> : null}
            </div>
          </div>

          {gauge ? <div className={styles.gaugeWrap}>{gauge}</div> : null}
        </div>
      </div>
    );
  },
);

/* =========================================================================
   Specialized Dashboard Metric Cards
   ========================================================================= */

/**
 * Card 1: Okupansi Kamar (Owner & Staff Accessible)
 */
export function OccupancyMetricCard({
  occupiedRooms,
  totalRooms,
  percentage,
  delta = "+1 Unit",
  href = "/kamar",
  onClick,
}: {
  occupiedRooms: number;
  totalRooms: number;
  percentage?: number | null;
  delta?: string;
  href?: string;
  onClick?: () => void;
}) {
  const safeTotal = Math.max(1, totalRooms);
  const ratio = Math.max(0, Math.min(occupiedRooms / safeTotal, 1));
  const percentValue = percentage ?? Math.round(ratio * 100);

  return (
    <MetricCard
      title="Okupansi Kamar"
      icon={<BuildingIcon />}
      iconTone="brand"
      badge={delta}
      badgeTone="brand"
      subtitle="Hunian Saat Ini"
      value={occupiedRooms}
      subValue={`/ ${safeTotal} Kamar`}
      gauge={
        <OccupancyGauge
          label="Tingkat Okupansi"
          size="xs"
          value={percentValue}
          tone="brand"
        />
      }
      href={href}
      onClick={onClick}
      ariaLabel={`Okupansi Kamar ${occupiedRooms} dari ${safeTotal} Unit, ${percentValue}% Terisi`}
    />
  );
}

/**
 * Card 2 (Owner): Tagihan Lunas / Kolektibilitas (Owner-Only)
 */
export function CollectionMetricCard({
  collection,
  role = "OWNER",
  delta = "+8%",
  href = "/laporan",
  onClick,
}: {
  collection: {
    issuedRentAmount: string;
    collectedRentAmount: string;
    percentage: number | null;
  };
  role?: "OWNER" | "STAFF";
  delta?: string;
  href?: string;
  onClick?: () => void;
}) {
  // Security guard: Never render confidential finance to Staff/Tenant
  if (role !== "OWNER") return null;

  const collected = parseFloat(collection.collectedRentAmount) || 0;
  const percent = collection.percentage ?? 0;

  return (
    <MetricCard
      title="Tagihan Lunas"
      icon={<ReceiptIcon />}
      iconTone="dark"
      badge={delta}
      badgeTone="dark"
      subtitle="Bulan ini"
      value={formatCompactRupiah(collected)}
      gauge={
        <OccupancyGauge
          label="Kolektibilitas Tagihan"
          size="xs"
          value={percent}
          tone="dark"
        />
      }
      href={href}
      onClick={onClick}
      ariaLabel={`Tagihan Lunas ${formatCompactRupiah(collected)}, ${percent}% tertagih`}
    />
  );
}

/**
 * Card 3 (Owner): Pengeluaran terhadap Pagu Bulanan (Owner-Only, CR-2026-001)
 * Displays "Belum Diatur" state cleanly without dummy/fixture values when budget is unset.
 */
export function ExpenseBudgetMetricCard({
  budget,
  role = "OWNER",
  onSetBudget,
  href = "/pengeluaran",
  onClick,
}: {
  budget: {
    month: string;
    status: "SET" | "NOT_SET";
    budgetAmount: string | null;
    actualAmount: string;
    remainingAmount: string | null;
  };
  role?: "OWNER" | "STAFF";
  onSetBudget?: () => void;
  href?: string;
  onClick?: () => void;
}) {
  // Security guard: Never render confidential finance to Staff/Tenant
  if (role !== "OWNER") return null;

  const actualNum = parseFloat(budget.actualAmount) || 0;
  const isBudgetSet = budget.status === "SET" && budget.budgetAmount !== null;

  if (!isBudgetSet) {
    // CR-2026-001 requirement:
    // Tampilkan state belum diatur tanpa nilai fixture/default pagu!
    // Badge langsung bertindak sebagai aksi "Atur Pagu" merah yang bersih tanpa tabrakan teks.
    return (
      <MetricCard
        title="Pengeluaran"
        icon={<ExpenseIcon />}
        iconTone="danger"
        badge="Atur Pagu"
        badgeTone="danger"
        subtitle="Pagu Belum Diatur"
        value={formatCompactRupiah(actualNum)}
        gauge={
          <OccupancyGauge
            label="Pengeluaran (Pagu Belum Diatur)"
            size="xs"
            value={0}
            tone="danger"
            valueText="--"
          />
        }
        href={onSetBudget ? undefined : href}
        onClick={onSetBudget ?? onClick}
        ariaLabel={`Pengeluaran ${formatCompactRupiah(actualNum)}, pagu belum diatur. Klik untuk atur pagu`}
      />
    );
  }

  // Budget is configured (SET)
  const budgetNum = parseFloat(budget.budgetAmount as string) || 1;
  const percent = Math.round((actualNum / budgetNum) * 100);
  const remainingNum = budget.remainingAmount !== null ? parseFloat(budget.remainingAmount) : budgetNum - actualNum;
  const isOverBudget = percent > 100;

  const badgeText = isOverBudget
    ? "Melebihi Pagu"
    : `Sisa ${formatCompactRupiah(Math.max(0, remainingNum))}`;

  return (
    <MetricCard
      title="Pengeluaran"
      icon={<ExpenseIcon />}
      iconTone="danger"
      badge={badgeText}
      badgeTone="danger"
      subtitle="Bulan ini"
      value={formatCompactRupiah(actualNum)}
      gauge={
        <OccupancyGauge
          label="Pengeluaran terhadap Pagu"
          size="xs"
          value={percent}
          tone="danger"
        />
      }
      href={href}
      onClick={onClick}
      ariaLabel={`Pengeluaran ${formatCompactRupiah(actualNum)} dari pagu ${formatCompactRupiah(budgetNum)} (${percent}%)`}
    />
  );
}

/**
 * Card 2 (Staff): Antrean Tiket Lapangan (Staff Operational)
 */
export function StaffTicketsMetricCard({
  tickets,
  href = "/tiket",
  onClick,
}: {
  tickets: {
    openCount: number;
    urgentCount?: number;
    byStatus?: Record<string, number>;
  };
  href?: string;
  onClick?: () => void;
}) {
  const urgent = tickets.urgentCount ?? (tickets.byStatus?.["IN_PROGRESS"] ?? 0);
  // Benchmark capacity: 5 tickets
  const loadPercentage = Math.min(100, Math.round((tickets.openCount / 5) * 100));

  return (
    <MetricCard
      title="Tiket Kerusakan"
      icon={<WrenchIcon />}
      iconTone="danger"
      badge={urgent > 0 ? `${urgent} Mendesak` : "Terkendali"}
      badgeTone={urgent > 0 ? "danger" : "success"}
      subtitle="Antrean Tiket Lapangan"
      value={tickets.openCount}
      subValue="Tiket"
      gauge={
        <OccupancyGauge
          label="Beban Servis Lapangan"
          size="xs"
          value={loadPercentage}
          tone="danger"
        />
      }
      href={href}
      onClick={onClick}
      ariaLabel={`Tiket Kerusakan ${tickets.openCount} tiket, ${urgent} mendesak`}
    />
  );
}

/**
 * Card 3 (Staff): Setoran Kas Lapangan Pending (Staff Operational)
 */
export function StaffCashDepositMetricCard({
  pendingCount = 2,
  amount = 2800000,
  href = "/tagihan",
  onClick,
}: {
  pendingCount?: number;
  amount?: number | string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <MetricCard
      title="Setoran Lapangan"
      icon={<ReceiptIcon />}
      iconTone="dark"
      badge={`${pendingCount} Pending`}
      badgeTone="warning"
      subtitle="Uang Kas di Tangan Staf"
      value={formatCompactRupiah(amount)}
      gauge={
        <OccupancyGauge
          label="Setoran Menunggu Validasi"
          size="xs"
          value={50}
          tone="dark"
        />
      }
      href={href}
      onClick={onClick}
      ariaLabel={`Setoran Lapangan ${formatCompactRupiah(amount)}, ${pendingCount} transaksi pending validasi`}
    />
  );
}

/* =========================================================================
   Container: DashboardMetricsRow
   Accepts standard DashboardSnapshot from M06-BE-15 and renders correctly
   without leaking financial data to Staff.
   ========================================================================= */

export function DashboardMetricsRow({
  snapshot,
  onSetBudget,
}: {
  snapshot: DashboardSnapshot;
  onSetBudget?: () => void;
}) {
  if (snapshot.role === "OWNER") {
    const { occupancy, finance } = snapshot;
    return (
      <div className={styles.metricsRow}>
        <OccupancyMetricCard
          occupiedRooms={occupancy.occupiedRooms}
          totalRooms={occupancy.totalRooms}
          percentage={occupancy.percentage}
        />
        <CollectionMetricCard
          role="OWNER"
          collection={finance.collection}
        />
        <ExpenseBudgetMetricCard
          role="OWNER"
          budget={finance.budget}
          onSetBudget={onSetBudget}
        />
      </div>
    );
  }

  // Staff role: purely operational, zero financial leakage
  const { occupancy, tickets } = snapshot;
  return (
    <div className={styles.metricsRow}>
      <OccupancyMetricCard
        occupiedRooms={occupancy.occupiedRooms}
        totalRooms={occupancy.totalRooms}
        percentage={occupancy.percentage}
      />
      <StaffTicketsMetricCard tickets={tickets} />
      <StaffCashDepositMetricCard />
    </div>
  );
}
