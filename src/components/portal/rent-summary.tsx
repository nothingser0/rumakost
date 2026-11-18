"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./rent-summary.module.css";

/* ==========================================================================
   Types & Interfaces (CMP-17 / F-04 / F-05 / Frozen Scope)
   ========================================================================== */

export type TenantInvoiceStatus = "PAID" | "UNPAID" | "PARTIAL" | "OVERDUE";

export interface TenantRentSummaryProps {
  tenantName: string;
  roomNumber: string;
  roomType?: string;
  invoiceNumber?: string;
  billingPeriodLabel?: string;
  dueDateLabel?: string;
  daysOverdue?: number;
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  status: TenantInvoiceStatus;
  onPay?: () => void;
  payHref?: string;
  className?: string;
}

/* ==========================================================================
   SVG Icons (Zero-Emoji Craftsmanship)
   ========================================================================== */

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="14"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="14"
    >
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="15"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

/* ==========================================================================
   Helper Functions (Pure Formatting & Status Resolution)
   ========================================================================== */

export function formatRupiah(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "Rp 0";
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

export function resolveStatusBadge(
  status: TenantInvoiceStatus,
  daysOverdue?: number,
): { label: string; className: string; icon: ReactNode } {
  switch (status) {
    case "PAID":
      return {
        label: "Lunas",
        className: styles.statusPaid,
        icon: <CheckCircleIcon />,
      };
    case "PARTIAL":
      return {
        label: "Sebagian Terbayar",
        className: styles.statusPartial,
        icon: <ClockIcon />,
      };
    case "OVERDUE": {
      const suffix = daysOverdue ? ` (H+${daysOverdue})` : "";
      return {
        label: `Menunggak${suffix}`,
        className: styles.statusOverdue,
        icon: <AlertTriangleIcon />,
      };
    }
    case "UNPAID":
    default:
      return {
        label: "Menunggu Pembayaran",
        className: styles.statusUnpaid,
        icon: <ClockIcon />,
      };
  }
}

/* ==========================================================================
   RentSummaryBanner Component (CMP-17)
   ========================================================================== */

export function RentSummaryBanner({
  tenantName,
  roomNumber,
  roomType,
  invoiceNumber,
  billingPeriodLabel,
  dueDateLabel,
  daysOverdue,
  totalAmount,
  paidAmount = 0,
  remainingAmount,
  status,
  onPay,
  payHref = "/portal/tagihan",
  className = "",
}: TenantRentSummaryProps) {
  const badge = resolveStatusBadge(status, daysOverdue);
  const effectiveRemaining = remainingAmount ?? (status === "PAID" ? 0 : totalAmount - paidAmount);

  return (
    <article
      className={`${styles.card} ${className}`.trim()}
      aria-label={`Ringkasan sewa dan tagihan ${tenantName} kamar ${roomNumber}`}
    >
      {/* Background Architectural Accent Lines */}
      <div className={styles.bgPattern} aria-hidden="true">
        <svg width="100%" height="100%" fill="none" viewBox="0 0 600 300" preserveAspectRatio="none">
          <circle cx="550" cy="50" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="550" cy="50" r="240" stroke="currentColor" strokeWidth="1.5" />
          <path d="M-50 280 C150 180, 350 320, 650 200" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Top Header Row: Room Pill & Status Badge */}
      <div className={styles.topRow}>
        <div className={styles.chipGroup}>
          <span className={styles.roomPill}>{roomNumber}</span>
          {roomType && <span className={styles.roomSub}>· {roomType}</span>}
          {invoiceNumber && <span className={styles.roomSub}>· #{invoiceNumber}</span>}
        </div>
        <span className={`${styles.statusBadge} ${badge.className}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Middle Greeting & Tenant Info */}
      <div className={styles.greetingSection}>
        <p className={styles.tenantGreeting}>Selamat datang kembali,</p>
        <h2 className={styles.roomTitle}>{tenantName}</h2>
        {billingPeriodLabel && (
          <span className={styles.roomSub}>
            Periode Sewa: <strong>{billingPeriodLabel}</strong>
          </span>
        )}
      </div>

      {/* Bottom Billing Container */}
      <div className={styles.bottomSection}>
        <div className={styles.billingInfo}>
          <span className={styles.billingLabel}>
            {status === "PAID"
              ? "Status Pembayaran"
              : status === "PARTIAL"
                ? "Sisa Tagihan Belum Dibayar"
                : "Tagihan Bulan Ini"}
          </span>
          <span className={styles.billingAmount}>
            {status === "PAID" ? formatRupiah(totalAmount) : formatRupiah(effectiveRemaining)}
          </span>
          <div className={styles.billingMeta}>
            {dueDateLabel && (
              <span>
                Jatuh Tempo: <strong>{dueDateLabel}</strong>
              </span>
            )}
            {status === "PARTIAL" && paidAmount > 0 && (
              <span>
                (Telah dibayar: {formatRupiah(paidAmount)} dari total {formatRupiah(totalAmount)})
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Konfirmasi Pembayaran or Lihat Rincian */}
        <div className={styles.actionContainer}>
          {status !== "PAID" ? (
            onPay ? (
              <button
                type="button"
                onClick={onPay}
                className={styles.actionBtn}
                aria-label={`Konfirmasi pembayaran tagihan ${roomNumber}`}
              >
                <CreditCardIcon />
                <span>Konfirmasi Pembayaran</span>
              </button>
            ) : (
              <Link
                href={payHref}
                className={styles.actionBtn}
                aria-label={`Konfirmasi pembayaran tagihan ${roomNumber}`}
              >
                <CreditCardIcon />
                <span>Konfirmasi Pembayaran</span>
              </Link>
            )
          ) : (
            <Link
              href={payHref}
              className={styles.actionBtnSecondary}
              aria-label={`Lihat rincian tagihan lunas ${roomNumber}`}
            >
              <span>Rincian Tagihan</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default RentSummaryBanner;
