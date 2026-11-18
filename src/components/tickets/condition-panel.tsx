"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import styles from "./condition-panel.module.css";

export interface MaintenanceConditionItem {
  id?: string;
  label: string;
  count: number;
  percentage?: number; // 0 - 100
  statusKey?: string;
  ariaLabel?: string;
}

export interface MaintenanceConditionAction {
  key: string;
  label: string;
  icon?: "sync" | "ticket" | ReactNode;
  onClick?: () => void;
}

export interface MaintenanceConditionPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  items?: MaintenanceConditionItem[];
  ticketCounts?: {
    openCount?: number;
    byStatus?: Partial<Record<string, number>>;
  };
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  actions?: MaintenanceConditionAction[];
  onActionClick?: (actionKey: string) => void;
  showMenu?: boolean;
  emptyText?: string;
}

/**
 * Maps raw ticket status counts into reactive maintenance condition panel items.
 * Strictly adheres to P0 reactive maintenance (Dikerjakan, Ditugaskan, Diterima, Diperiksa).
 */
export function mapTicketCountsToConditionItems(ticketCounts?: {
  openCount?: number;
  byStatus?: Partial<Record<string, number>>;
} | null): MaintenanceConditionItem[] {
  if (!ticketCounts) {
    return [
      {
        id: "in_progress",
        label: "Dalam Pengerjaan",
        count: 0,
        percentage: 0,
        statusKey: "IN_PROGRESS",
      },
      {
        id: "assigned",
        label: "Menunggu Penugasan",
        count: 0,
        percentage: 0,
        statusKey: "ASSIGNED",
      },
      {
        id: "received",
        label: "Laporan Baru Masuk",
        count: 0,
        percentage: 0,
        statusKey: "RECEIVED",
      },
    ];
  }

  const byStatus = ticketCounts.byStatus ?? {};
  const inProgress = byStatus.IN_PROGRESS ?? 0;
  const assigned = byStatus.ASSIGNED ?? 0;
  const received = byStatus.RECEIVED ?? 0;
  const inspection = byStatus.INSPECTION ?? 0;

  const totalActive = inProgress + assigned + received + inspection;
  const calcPercent = (val: number): number => {
    if (totalActive <= 0 || val <= 0) return 0;
    return Math.min(100, Math.round((val / totalActive) * 100));
  };

  const items: MaintenanceConditionItem[] = [
    {
      id: "in_progress",
      label: "Dalam Pengerjaan",
      count: inProgress,
      percentage: calcPercent(inProgress),
      statusKey: "IN_PROGRESS",
    },
    {
      id: "assigned",
      label: "Menunggu Penugasan",
      count: assigned,
      percentage: calcPercent(assigned),
      statusKey: "ASSIGNED",
    },
    {
      id: "received",
      label: "Laporan Baru Masuk",
      count: received,
      percentage: calcPercent(received),
      statusKey: "RECEIVED",
    },
  ];

  if (inspection > 0) {
    items.push({
      id: "inspection",
      label: "Dalam Pemeriksaan",
      count: inspection,
      percentage: calcPercent(inspection),
      statusKey: "INSPECTION",
    });
  }

  return items;
}

function MoreVerticalIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function RefreshCwIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export const MaintenanceConditionPanel = forwardRef<
  HTMLDivElement,
  MaintenanceConditionPanelProps
>(function MaintenanceConditionPanel(
  {
    title = "Kondisi Properti",
    items: propItems,
    ticketCounts,
    ctaText = "Detail Tiket Kerusakan",
    ctaHref = "/tiket",
    onCtaClick,
    actions,
    onActionClick,
    showMenu = true,
    emptyText = "Semua kamar dan fasilitas dalam kondisi baik.",
    className = "",
    ...rest
  },
  ref,
) {
  const panelId = useId();
  const headingId = `${panelId}-title`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayItems =
    propItems ??
    (ticketCounts
      ? mapTicketCountsToConditionItems(ticketCounts)
      : [
          {
            id: "in_progress",
            label: "Dalam Pengerjaan",
            count: 2,
            percentage: 50,
            statusKey: "IN_PROGRESS",
          },
          {
            id: "assigned",
            label: "Menunggu Penugasan",
            count: 1,
            percentage: 25,
            statusKey: "ASSIGNED",
          },
          {
            id: "received",
            label: "Laporan Baru Masuk",
            count: 1,
            percentage: 25,
            statusKey: "RECEIVED",
          },
        ]);

  const defaultActions: MaintenanceConditionAction[] = [
    {
      key: "sync",
      label: "Sinkron Status",
      icon: "sync",
    },
    {
      key: "ticket",
      label: "Buat Tiket Baru",
      icon: "ticket",
    },
  ];

  const activeActions = actions ?? defaultActions;

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleActionSelect = (action: MaintenanceConditionAction) => {
    setMenuOpen(false);
    if (action.onClick) {
      action.onClick();
    }
    if (onActionClick) {
      onActionClick(action.key);
    }
  };

  const handleMenuItemKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    action: MaintenanceConditionAction,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActionSelect(action);
    }
  };

  const totalCount = displayItems.reduce((acc, curr) => acc + curr.count, 0);

  const renderActionIcon = (icon?: "sync" | "ticket" | ReactNode) => {
    if (icon === "sync") return <RefreshCwIcon />;
    if (icon === "ticket") return <PlusCircleIcon />;
    return icon ?? null;
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-labelledby={headingId}
      className={`${styles.card} ${className}`.trim()}
      {...rest}
    >
      <div className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>

        {showMenu && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Opsi menu pemeliharaan"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="Opsi Pemeliharaan"
            >
              <MoreVerticalIcon />
            </button>

            {menuOpen && (
              <div
                className={styles.menuPopover}
                role="menu"
                aria-label="Menu Opsi Pemeliharaan"
              >
                {activeActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    role="menuitem"
                    className={styles.menuItem}
                    onClick={() => handleActionSelect(action)}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, action)}
                  >
                    {renderActionIcon(action.icon)}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {displayItems.length === 0 || totalCount === 0 ? (
        <div className={styles.emptyState}>{emptyText}</div>
      ) : (
        <div className={styles.progressGroup} role="list" aria-label="Daftar status tiket">
          {displayItems.map((item, idx) => {
            const calculatedPercent =
              item.percentage !== undefined
                ? Math.max(0, Math.min(100, item.percentage))
                : totalCount > 0
                ? Math.round((item.count / totalCount) * 100)
                : 0;

            const itemAriaLabel =
              item.ariaLabel ?? `${item.label}: ${item.count} tiket aktif (${calculatedPercent}%)`;

            return (
              <div
                key={item.id ?? item.statusKey ?? idx}
                className={styles.progressItem}
                role="listitem"
              >
                <div className={styles.metaRow}>
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.count}>{item.count}</span>
                </div>
                <div
                  className={styles.track}
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={totalCount > 0 ? totalCount : 100}
                  aria-valuetext={itemAriaLabel}
                  aria-label={item.label}
                >
                  <div
                    className={styles.fill}
                    style={{ width: `${calculatedPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ctaHref ? (
        <Link
          href={ctaHref}
          className={styles.ctaButton}
          onClick={onCtaClick}
          aria-label={ctaText}
        >
          <span>{ctaText}</span>
          <ArrowRightIcon />
        </Link>
      ) : (
        <button
          type="button"
          className={styles.ctaButton}
          onClick={onCtaClick}
          aria-label={ctaText}
        >
          <span>{ctaText}</span>
          <ArrowRightIcon />
        </button>
      )}
    </div>
  );
});

export const ConditionPanel = MaintenanceConditionPanel;
export default MaintenanceConditionPanel;
