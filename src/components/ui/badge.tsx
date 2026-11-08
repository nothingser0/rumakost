import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./badge.module.css";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "brand"
  | "info"
  | "dark";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "pill" | "rounded";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  icon?: ReactNode;
  showDefaultIcon?: boolean;
  dot?: boolean;
  pulsing?: boolean;
  count?: number | string;
  children?: ReactNode;
}

/* ==========================================================================
   Lucide SVG Icons for Status Semantics (Zero-Emoji Craftsmanship)
   ========================================================================== */

function CheckCircle2Icon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function CircleDotIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="12">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function getDefaultVariantIcon(variant: BadgeVariant): ReactNode {
  switch (variant) {
    case "success":
      return <CheckCircle2Icon />;
    case "warning":
      return <ClockIcon />;
    case "danger":
      return <AlertCircleIcon />;
    case "neutral":
      return <CircleDotIcon />;
    case "brand":
      return <SparklesIcon />;
    case "info":
      return <InfoIcon />;
    case "dark":
      return <ShieldIcon />;
    default:
      return null;
  }
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className,
      count,
      dot = false,
      icon,
      onClick,
      pulsing = false,
      shape = "pill",
      showDefaultIcon = false,
      size = "md",
      variant = "neutral",
      ...props
    },
    ref,
  ) => {
    const isClickable = Boolean(onClick);
    const resolvedIcon = icon ?? (showDefaultIcon ? getDefaultVariantIcon(variant) : null);

    return (
      <span
        className={[
          styles.badge,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          styles[`shape-${shape}`],
          isClickable ? styles.clickable : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onClick}
        ref={ref}
        role={props.role ?? (isClickable ? "button" : "status")}
        tabIndex={isClickable && props.tabIndex === undefined ? 0 : props.tabIndex}
        {...props}
      >
        {dot ? (
          <span
            aria-hidden="true"
            className={[styles.dot, pulsing ? styles.pulsingDot : null]
              .filter(Boolean)
              .join(" ")}
          />
        ) : null}

        {resolvedIcon ? <span className={styles.iconSlot}>{resolvedIcon}</span> : null}

        <span>{children}</span>

        {count !== undefined && count !== null ? (
          <span className={styles.countPill}>{count}</span>
        ) : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";

/* ==========================================================================
   Domain-Specific Status Badge Helpers (RumaKost Domain Semantics)
   ========================================================================== */

export type RoomStatus = "terisi" | "kosong" | "pemeliharaan" | "menunggubayar";

export function RoomStatusBadge({
  size = "md",
  status,
}: {
  status: RoomStatus;
  size?: BadgeSize;
}) {
  switch (status) {
    case "terisi":
      return (
        <Badge showDefaultIcon size={size} variant="success">
          Terisi · Lunas
        </Badge>
      );
    case "kosong":
      return (
        <Badge showDefaultIcon size={size} variant="brand">
          Kosong · Siap Huni
        </Badge>
      );
    case "pemeliharaan":
      return (
        <Badge showDefaultIcon size={size} variant="warning">
          Perbaikan
        </Badge>
      );
    case "menunggubayar":
      return (
        <Badge dot pulsing size={size} variant="danger">
          Menunggak
        </Badge>
      );
    default:
      return (
        <Badge size={size} variant="neutral">
          {status}
        </Badge>
      );
  }
}

export type PaymentStatus =
  | "LUNAS"
  | "VERIFIED"
  | "PENDING"
  | "SEBAGIAN"
  | "JATUH_TEMPO"
  | "TERLAMBAT"
  | "DITOLAK";

export function PaymentStatusBadge({
  size = "md",
  status,
}: {
  status: PaymentStatus;
  size?: BadgeSize;
}) {
  switch (status) {
    case "LUNAS":
    case "VERIFIED":
      return (
        <Badge showDefaultIcon size={size} variant="success">
          Lunas
        </Badge>
      );
    case "PENDING":
      return (
        <Badge dot pulsing size={size} variant="warning">
          Menunggu Verifikasi
        </Badge>
      );
    case "SEBAGIAN":
      return (
        <Badge showDefaultIcon size={size} variant="info">
          Sebagian
        </Badge>
      );
    case "JATUH_TEMPO":
      return (
        <Badge showDefaultIcon size={size} variant="warning">
          Jatuh Tempo
        </Badge>
      );
    case "TERLAMBAT":
    case "DITOLAK":
      return (
        <Badge showDefaultIcon size={size} variant="danger">
          {status === "DITOLAK" ? "Ditolak" : "Terlambat"}
        </Badge>
      );
    default:
      return (
        <Badge size={size} variant="neutral">
          {status}
        </Badge>
      );
  }
}

export type TicketStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CANCELLED";

export function TicketStatusBadge({
  size = "md",
  status,
}: {
  status: TicketStatus;
  size?: BadgeSize;
}) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge size={size} variant="neutral">
          Draft
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge dot pulsing size={size} variant="warning">
          Menunggu Respon
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge showDefaultIcon size={size} variant="info">
          Sedang Dikerjakan
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge showDefaultIcon size={size} variant="success">
          Selesai
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge size={size} variant="danger">
          Dibatalkan
        </Badge>
      );
    default:
      return (
        <Badge size={size} variant="neutral">
          {status}
        </Badge>
      );
  }
}
