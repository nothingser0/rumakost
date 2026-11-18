"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { PopoverSelect } from "@/components/ui/popover-select";
import type { ActivityPage } from "@/lib/activity/operations.mjs";
import { canViewActivityAction } from "@/lib/activity/operations.mjs";
import styles from "./activity-feed.module.css";

export type ActivityFeedItem = ActivityPage["items"][number];
export type ActivityViewerRole = "OWNER" | "STAFF" | "TENANT";

export interface ActivityPeriodOption {
  value: string;
  label: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  role: ActivityViewerRole;
  title?: string;
  now?: Date;
  periods?: ActivityPeriodOption[];
  selectedPeriod?: string;
  onPeriodChange?: (value: string) => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyText?: string;
  maxItems?: number;
  className?: string;
}

const DEFAULT_PERIODS: ActivityPeriodOption[] = [
  { value: "today", label: "Hari ini" },
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draf",
  RECEIVED: "Diterima",
  ASSIGNED: "Ditugaskan",
  IN_PROGRESS: "Dikerjakan",
  INSPECTION: "Diperiksa",
  RESOLVED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const ENTITY_LABELS: Record<string, string> = {
  ROOM: "Kamar",
  LEASE: "Kontrak",
  LEASE_END_REQUEST: "Pengajuan akhir kontrak",
  INVOICE: "Tagihan",
  PAYMENT: "Pembayaran",
  TICKET: "Tiket",
  TICKET_ATTACHMENT: "Lampiran tiket",
  TICKET_COMMENT: "Komentar tiket",
  TENANT: "Penghuni",
  EXPENSE: "Pengeluaran",
};

function humanize(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function describeActivity(item: ActivityFeedItem): string {
  const entity = ENTITY_LABELS[item.entity.type] ?? humanize(item.entity.type);
  if (item.statusChange?.toStatus) {
    const to = STATUS_LABELS[item.statusChange.toStatus] ?? humanize(item.statusChange.toStatus);
    const from = item.statusChange.fromStatus
      ? STATUS_LABELS[item.statusChange.fromStatus] ?? humanize(item.statusChange.fromStatus)
      : null;
    return from ? `${entity}: ${from} ke ${to}` : `${entity}: ${to}`;
  }
  return `${entity}: ${humanize(item.action)}`;
}

export function formatRelativeTime(occurredAt: string, now: Date = new Date()): string {
  const time = new Date(occurredAt).getTime();
  if (!Number.isFinite(time)) return "";
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - time) / 60000));
  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} mnt`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} jam`;
  const days = Math.floor(hours / 24);
  return `${days} hari`;
}

function actorInitials(name: string | null): string {
  if (!name) return "SI";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "SI";
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function ActivityFeed({
  items,
  role,
  title = "Aktivitas Terkini",
  now,
  periods = DEFAULT_PERIODS,
  selectedPeriod,
  onPeriodChange,
  viewAllHref,
  viewAllLabel = "Lihat Semua Aktivitas",
  emptyText = "Belum ada aktivitas pada periode ini.",
  maxItems = 5,
  className = "",
}: ActivityFeedProps) {
  const headingId = `${useId()}-title`;
  const [internalPeriod, setInternalPeriod] = useState(periods[0]?.value ?? "");
  const activePeriod = selectedPeriod ?? internalPeriod;

  const visible =
    role === "TENANT"
      ? []
      : items
          .filter((item) =>
            canViewActivityAction(role, { entityType: item.entity.type, action: item.action }),
          )
          .slice(0, Math.max(0, maxItems));

  const selectPeriod = (value: string) => {
    setInternalPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={`${styles.card} ${className}`.trim()}
    >
      <div className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {periods.length > 0 && (
          <PopoverSelect
            title="Filter periode aktivitas"
            size="sm"
            shape="pill"
            align="right"
            inline
            options={periods}
            value={activePeriod}
            onChange={(value) => selectPeriod(value as string)}
          />
        )}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>{emptyText}</div>
      ) : (
        <ul className={styles.list}>
          {visible.map((item) => {
            const actorName = item.actor.type === "SYSTEM" ? "Sistem" : item.actor.name ?? "Pengguna";
            const summary = describeActivity(item);
            const time = formatRelativeTime(item.occurredAt, now);
            const inner = (
              <>
                <span
                  className={`${styles.avatar} ${item.actor.type === "SYSTEM" ? styles.avatarSystem : ""}`.trim()}
                  aria-hidden="true"
                >
                  {item.actor.type === "SYSTEM" ? "SI" : actorInitials(item.actor.name)}
                </span>
                <span className={styles.content}>
                  <span className={styles.name}>{actorName}</span>
                  <span className={styles.snippet}>{summary}</span>
                </span>
                <span className={styles.time}>{time}</span>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={styles.row}
                    aria-label={`${actorName}, ${summary}, ${time}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={styles.row}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {viewAllHref && visible.length > 0 && (
        <Link href={viewAllHref} className={styles.viewAll}>
          <span>{viewAllLabel}</span>
          <ArrowRightIcon />
        </Link>
      )}
    </section>
  );
}

export default ActivityFeed;
