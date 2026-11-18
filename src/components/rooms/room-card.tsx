"use client";

import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import styles from "./room-card.module.css";

export type RoomOccupancy = "OCCUPIED" | "VACANT";
export type RoomPhysicalStatus = "READY" | "CLEANING" | "MAINTENANCE";
export type RoomBillingState = "PAID" | "DUE_SOON" | "OVERDUE";

export interface RoomCardProps {
  roomNumber: string;
  occupancy: RoomOccupancy;
  physicalStatus: RoomPhysicalStatus;
  billingState?: RoomBillingState;
  dueInDays?: number;
  floorLabel?: string;
  tenantName?: string | null;
  roomType?: string;
  monthlyRent?: number | null;
  imageSrc?: string;
  href?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

export interface RoomCardBadge {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
}

export function resolveRoomBadge(input: {
  occupancy: RoomOccupancy;
  physicalStatus: RoomPhysicalStatus;
  billingState?: RoomBillingState;
  dueInDays?: number;
}): RoomCardBadge {
  if (input.occupancy === "OCCUPIED") {
    if (input.billingState === "OVERDUE") return { label: "Terisi · Menunggak", variant: "danger" };
    if (input.billingState === "DUE_SOON") {
      const suffix = input.dueInDays !== undefined ? `H-${input.dueInDays}` : "Jatuh Tempo";
      return { label: `Terisi · ${suffix}`, variant: "warning" };
    }
    return { label: "Terisi · Lunas", variant: "success" };
  }
  if (input.physicalStatus === "MAINTENANCE") return { label: "Perbaikan", variant: "warning" };
  if (input.physicalStatus === "CLEANING") return { label: "Kosong · Dibersihkan", variant: "neutral" };
  return { label: "Kosong · Siap Huni", variant: "brand" };
}

export function formatRoomRent(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

function ArrowUpRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 18v-7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7" />
      <path d="M2 14h20" />
      <path d="M6 9V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <path d="M2 18v2" />
      <path d="M22 18v2" />
    </svg>
  );
}

export function RoomCard({
  roomNumber,
  occupancy,
  physicalStatus,
  billingState,
  dueInDays,
  floorLabel,
  tenantName,
  roomType,
  monthlyRent,
  imageSrc,
  href,
  selected = false,
  onSelect,
  className = "",
}: RoomCardProps) {
  const badge = resolveRoomBadge({ occupancy, physicalStatus, billingState, dueInDays });
  const isOccupied = occupancy === "OCCUPIED";
  const isRepair = !isOccupied && physicalStatus === "MAINTENANCE";

  const toneClass = isOccupied
    ? billingState === "OVERDUE"
      ? styles.overdue
      : billingState === "DUE_SOON"
        ? styles.dueSoon
        : styles.occupied
    : isRepair
      ? styles.repair
      : styles.vacant;

  const specParts = [
    floorLabel,
    isOccupied ? tenantName ?? undefined : roomType,
  ].filter((part): part is string => Boolean(part));

  const classes = [styles.card, toneClass, selected ? styles.selected : "", className]
    .filter(Boolean)
    .join(" ");

  const ariaLabel = `Kamar ${roomNumber}, ${badge.label}${specParts.length ? `, ${specParts.join(", ")}` : ""}`;

  const content: ReactNode = (
    <>
      <div className={styles.thumb}>
        {imageSrc ? (
          <img src={imageSrc} alt={`Kamar ${roomNumber}`} loading="lazy" />
        ) : (
          <BedIcon />
        )}
        <span className={styles.arrow} aria-hidden="true">
          <ArrowUpRightIcon />
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.headerRow}>
          <span className={styles.name}>Kamar {roomNumber}</span>
          <Badge size="sm" variant={badge.variant}>
            {badge.label}
          </Badge>
        </div>
        {specParts.length > 0 && <div className={styles.specs}>{specParts.join(" · ")}</div>}
        {monthlyRent !== undefined && monthlyRent !== null && (
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatRoomRent(monthlyRent)}</span>
            <span className={styles.priceUnit}>/bln</span>
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        aria-current={selected ? "true" : undefined}
        data-occupancy={occupancy}
        data-physical-status={physicalStatus}
        onClick={onSelect}
      >
        {content}
      </Link>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={classes}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={onSelect ? selected : undefined}
      data-occupancy={occupancy}
      data-physical-status={physicalStatus}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {content}
    </div>
  );
}

export default RoomCard;
