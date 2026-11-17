"use client";

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import styles from "./cashflow-chart.module.css";

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */

export interface CashflowDataPoint {
  /** Identifier or index */
  id?: string;
  /** Month short label (e.g. "Mei", "Jun", "Okt") */
  month: string;
  /** Year (e.g. 2026) */
  year?: number | string;
  /** Full label for tooltip (e.g. "Okt 2026 (Bulan Ini)") */
  label?: string;
  /** Income amount in Rupiah (e.g. 16500000) */
  income: number;
  /** Expense amount in Rupiah (e.g. 4200000) */
  expense: number;
  /** Whether this data point represents the current/selected active month */
  isActive?: boolean;
  /** Contextual annotation (e.g. "Peak Sewa Ajaran Baru") */
  annotation?: string;
}

export interface YearOption {
  value: string;
  label: string;
}

export interface CashflowChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Cashflow monthly points */
  data?: CashflowDataPoint[];
  /** Card title (default: "Arus Kas & Operasional") */
  title?: string;
  /** Target link for detail report (default: "/laporan") */
  reportHref?: string;
  /** Accessible label for report link */
  reportLabel?: string;
  /** Available year options for filter */
  yearOptions?: YearOption[];
  /** Currently selected year value */
  selectedYear?: string;
  /** Callback when year selection changes */
  onYearChange?: (year: string) => void;
  /** Optional target income line (dashed orange indicator) */
  targetIncome?: number;
  /** Target label text (default: "Target") */
  targetLabel?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error message if loading failed */
  error?: string | null;
  /** Retry callback if error occurred */
  onRetry?: () => void;
  /** Custom empty state heading */
  emptyTitle?: string;
  /** Custom empty state description */
  emptyDescription?: string;
  /** Color tone for positive surplus: "green" (default, semantic profit #16A34A) or "orange" (brand accent #C25E00) */
  surplusTone?: "green" | "orange";
}

/* ==========================================================================
   Default Fixture Data (Matches WF-02 & DESIGN.md §1)
   ========================================================================== */

export const DEFAULT_YEAR_OPTIONS: YearOption[] = [
  { value: "2026", label: "Tahun 2026 (Berjalan)" },
  { value: "2025", label: "Tahun 2025 (Arsip)" },
  { value: "2024", label: "Tahun 2024 (Arsip)" },
];

export const DEFAULT_CASHFLOW_DATA: CashflowDataPoint[] = [
  {
    month: "Mei",
    year: 2026,
    label: "Mei 2026",
    income: 13_500_000,
    expense: 2_800_000,
    annotation: "Periode Hemat",
  },
  {
    month: "Jun",
    year: 2026,
    label: "Jun 2026",
    income: 15_800_000,
    expense: 6_800_000,
    annotation: "Perawatan & Servis AC",
  },
  {
    month: "Jul",
    year: 2026,
    label: "Jul 2026",
    income: 18_400_000,
    expense: 3_200_000,
    annotation: "Peak Sewa Ajaran Baru",
  },
  {
    month: "Agu",
    year: 2026,
    label: "Agu 2026",
    income: 17_200_000,
    expense: 5_400_000,
    annotation: "Pajak & Utilitas",
  },
  {
    month: "Sep",
    year: 2026,
    label: "Sep 2026",
    income: 14_200_000,
    expense: 3_600_000,
    annotation: "Checkout Akhir Kontrak",
  },
  {
    month: "Okt",
    year: 2026,
    label: "Okt 2026 (Bulan Ini)",
    income: 16_500_000,
    expense: 4_200_000,
    isActive: true,
    annotation: "Highlight Bulan Berjalan",
  },
];

/* ==========================================================================
   Formatting Helpers (Indonesian Locale & Compact Rupiah)
   ========================================================================== */

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

export function formatAxisLabel(val: number): string {
  if (val === 0) return "0";
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${formatted} Jt`;
  }
  if (val >= 1_000) {
    return `${Math.round(val / 1_000)} rb`;
  }
  return String(val);
}

export function formatFullRupiah(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Rp 0";
  const num = typeof value === "number" ? Math.floor(value) : parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(num)) return "Rp 0";
  return `Rp ${new Intl.NumberFormat("id-ID").format(num)}`;
}

/* ==========================================================================
   Lucide SVG Icons (Zero-Emoji Craftsmanship)
   ========================================================================== */

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowUpRightIcon() {
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
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="22"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="22"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/* ==========================================================================
   Scale Calculation Logic
   ========================================================================== */

interface ScaleConfig {
  stepMax: number;
  ticks: { value: number; label: string; topPercent: number }[];
}

export function calculateChartScale(
  data: CashflowDataPoint[],
  targetIncome?: number
): ScaleConfig {
  let highest = 0;
  for (const point of data) {
    if (point.income > highest) highest = point.income;
    if (point.expense > highest) highest = point.expense;
  }
  if (targetIncome && targetIncome > highest) {
    highest = targetIncome;
  }

  // Minimum highest bound for clean display
  if (highest <= 0) highest = 10_000_000;

  // Find round step ceiling for 5 interval lines
  const intervalBase = highest / 5;
  let niceInterval: number;

  if (intervalBase <= 1_000_000) {
    niceInterval = Math.ceil(intervalBase / 200_000) * 200_000;
  } else if (intervalBase <= 5_000_000) {
    niceInterval = Math.ceil(intervalBase / 500_000) * 500_000;
  } else if (intervalBase <= 10_000_000) {
    niceInterval = Math.ceil(intervalBase / 1_000_000) * 1_000_000;
  } else {
    niceInterval = Math.ceil(intervalBase / 5_000_000) * 5_000_000;
  }

  if (niceInterval <= 0) niceInterval = 4_000_000;
  const stepMax = niceInterval * 5;

  // 5 intervals -> 6 tick lines (indices 0 to 5)
  const ticks = [
    { value: stepMax, label: formatAxisLabel(stepMax), topPercent: 0 },
    { value: niceInterval * 4, label: formatAxisLabel(niceInterval * 4), topPercent: 20 },
    { value: niceInterval * 3, label: formatAxisLabel(niceInterval * 3), topPercent: 40 },
    { value: niceInterval * 2, label: formatAxisLabel(niceInterval * 2), topPercent: 60 },
    { value: niceInterval * 1, label: formatAxisLabel(niceInterval * 1), topPercent: 80 },
    { value: 0, label: "0", topPercent: 100 },
  ];

  return { stepMax, ticks };
}

/* ==========================================================================
   Main CashflowChart Component (CMP-11)
   ========================================================================== */

export const CashflowChart = forwardRef<HTMLDivElement, CashflowChartProps>(
  (
    {
      data = DEFAULT_CASHFLOW_DATA,
      title = "Arus Kas & Operasional",
      reportHref = "/laporan",
      reportLabel = "Lihat Laporan Lengkap Arus Kas",
      yearOptions = DEFAULT_YEAR_OPTIONS,
      selectedYear: selectedYearProp,
      onYearChange,
      targetIncome,
      targetLabel = "Target",
      isLoading = false,
      error = null,
      onRetry,
      emptyTitle = "Belum Ada Data Arus Kas",
      emptyDescription = "Belum ada transaksi pemasukan atau pengeluaran tercatat pada periode ini.",
      surplusTone = "green",
      className,
      ...props
    },
    ref
  ) => {
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [internalYear, setInternalYear] = useState<string>(
      selectedYearProp || yearOptions[0]?.value || "2026"
    );
    const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

    const yearDropdownRef = useRef<HTMLDivElement>(null);

    const activeYearValue = selectedYearProp !== undefined ? selectedYearProp : internalYear;
    const activeYearLabel =
      yearOptions.find((opt) => opt.value === activeYearValue)?.label ||
      `Tahun ${activeYearValue}`;

    // Handle Year Selection
    const handleSelectYear = (val: string) => {
      setInternalYear(val);
      onYearChange?.(val);
      setIsYearDropdownOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
      const handleOutsideClick = (e: globalThis.MouseEvent) => {
        if (
          yearDropdownRef.current &&
          !yearDropdownRef.current.contains(e.target as Node)
        ) {
          setIsYearDropdownOpen(false);
        }
      };

      if (isYearDropdownOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isYearDropdownOpen]);

    // Handle Keyboard navigation for Year Dropdown
    const handleDropdownKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsYearDropdownOpen(true);
      } else if (e.key === "Escape") {
        setIsYearDropdownOpen(false);
      }
    };

    const TRACK_HEIGHT = 160;
    const { stepMax, ticks } = calculateChartScale(data, targetIncome);

    // Target Line Position
    const targetTopPx =
      targetIncome && stepMax > 0
        ? Math.round(TRACK_HEIGHT * (1 - Math.min(targetIncome, stepMax) / stepMax))
        : null;

    return (
      <div
        ref={ref}
        className={`${styles.chartCardBox} ${className ?? ""}`}
        role="region"
        aria-label={`${title} (${activeYearLabel})`}
        {...props}
      >
        {/* Card Header */}
        <div className={styles.cardTopHeader}>
          <div className={styles.titleAndLegend}>
            <h2 className={styles.cardTitleText}>{title}</h2>
            <div className={styles.legendGroup} aria-hidden="true">
              <span className={styles.legendItem}>
                <span className={styles.legendDotIncome} />
                <span>Pemasukan</span>
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotExpense} />
                <span>Pengeluaran</span>
              </span>
            </div>
          </div>

          <div className={styles.headerCtrlGroup}>
            {/* Popover Year Selector */}
            <div className={styles.customPopoverWrap} ref={yearDropdownRef}>
              <button
                type="button"
                className={`${styles.pillDropdownTrigger} ${
                  isYearDropdownOpen ? styles.pillDropdownTriggerOpen : ""
                }`}
                onClick={() => setIsYearDropdownOpen((prev) => !prev)}
                onKeyDown={handleDropdownKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isYearDropdownOpen}
                aria-label={`Pilih Periode Tahun: ${activeYearLabel}`}
              >
                <span>{activeYearLabel.split(" ")[0]} {activeYearValue}</span>
                <ChevronDownIcon />
              </button>

              {isYearDropdownOpen && (
                <div
                  className={styles.popoverDropdownMenu}
                  role="listbox"
                  aria-label="Pilihan Tahun Arus Kas"
                >
                  {yearOptions.map((opt) => {
                    const isSelected = opt.value === activeYearValue;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.popoverItem} ${
                          isSelected ? styles.popoverItemSelected : ""
                        }`}
                        onClick={() => handleSelectYear(opt.value)}
                      >
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Arrow Link to /laporan */}
            {reportHref && (
              <Link
                href={reportHref}
                className={styles.pillArrowBtn}
                title={reportLabel}
                aria-label={reportLabel}
              >
                <ArrowUpRightIcon />
              </Link>
            )}
          </div>
        </div>

        {/* State 1: Error State */}
        {error ? (
          <div className={styles.errorStateContainer} role="alert">
            <div className={styles.errorStateIconWrap}>
              <AlertCircleIcon />
            </div>
            <h3 className={styles.errorStateTitle}>Gagal Memuat Arus Kas</h3>
            <p className={styles.errorStateDescription}>{error}</p>
            {onRetry && (
              <button
                type="button"
                className={styles.errorRetryBtn}
                onClick={onRetry}
              >
                Coba Lagi
              </button>
            )}
          </div>
        ) : isLoading ? (
          /* State 2: Loading / Skeleton State */
          <div
            className={styles.skeletonViewport}
            aria-busy="true"
            aria-label="Memuat grafik arus kas..."
          >
            {[40, 65, 80, 50, 60, 75].map((h, i) => (
              <div key={i} className={styles.skeletonPair}>
                <div
                  className={styles.skeletonBar}
                  style={{ height: `${h * 1.5}px` }}
                />
                <div
                  className={styles.skeletonBar}
                  style={{ height: `${Math.round(h * 0.4)}px` }}
                />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          /* State 3: Empty State */
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyStateIconWrap}>
              <BarChartIcon />
            </div>
            <h3 className={styles.emptyStateTitle}>{emptyTitle}</h3>
            <p className={styles.emptyStateDescription}>{emptyDescription}</p>
          </div>
        ) : (
          /* State 4: Default Double Bar Chart */
          <div className={styles.barChartViewport}>
            {/* Screen Reader Accessible Data Summary */}
            <table className={styles.srOnly}>
              <caption>{title} - Ringkasan Arus Kas {activeYearLabel}</caption>
              <thead>
                <tr>
                  <th scope="col">Bulan</th>
                  <th scope="col">Pemasukan</th>
                  <th scope="col">Pengeluaran</th>
                  <th scope="col">Surplus Bersih</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, idx) => (
                  <tr key={d.id ?? idx}>
                    <th scope="row">{d.label || d.month}</th>
                    <td>{formatFullRupiah(d.income)}</td>
                    <td>{formatFullRupiah(d.expense)}</td>
                    <td>{formatFullRupiah(d.income - d.expense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sumbu Y Angka */}
            <div className={styles.chartYNumbers} aria-hidden="true">
              {ticks.map((t, idx) => (
                <span
                  key={idx}
                  className={styles.chartYVal}
                  style={{ top: `${(t.topPercent / 100) * TRACK_HEIGHT}px` }}
                >
                  {t.label}
                </span>
              ))}
            </div>

            {/* Area Gridlines & Bars Track */}
            <div className={styles.chartBarsTrack}>
              {/* Dashed Gridlines */}
              {ticks.slice(0, 5).map((t, idx) => (
                <div
                  key={idx}
                  className={styles.chartGridLine}
                  style={{ top: `${(t.topPercent / 100) * TRACK_HEIGHT}px` }}
                  aria-hidden="true"
                />
              ))}
              <div className={styles.chartGridLineBase} aria-hidden="true" />

              {/* Optional Target Income Line */}
              {targetTopPx !== null && (
                <div
                  className={styles.chartTargetLine}
                  style={{ top: `${targetTopPx}px` }}
                  aria-hidden="true"
                >
                  <span className={styles.targetBadge}>
                    {targetLabel}: {formatCompactRupiah(targetIncome)}
                  </span>
                </div>
              )}

              {/* Data Columns */}
              {data.map((point, idx) => {
                const incomeHeight =
                  stepMax > 0
                    ? Math.max(4, Math.round((point.income / stepMax) * TRACK_HEIGHT))
                    : 4;
                const expenseHeight =
                  stepMax > 0
                    ? Math.max(4, Math.round((point.expense / stepMax) * TRACK_HEIGHT))
                    : 4;

                const isCurrentActive = Boolean(point.isActive);
                const isHovered = activeHoverIndex === idx;

                const fullLabel = point.label || `${point.month} ${point.year ?? ""}`.trim();
                const netSurplus = point.income - point.expense;

                // Tooltip bottom placement (above the highest bar of the pair)
                const tallestBarHeight = Math.max(incomeHeight, expenseHeight);
                const tooltipBottomPx = tallestBarHeight + 12;

                return (
                  <div
                    key={point.id ?? idx}
                    className={`${styles.barsPairColumn} ${
                      isCurrentActive ? styles.barsPairColumnSelected : ""
                    }`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${fullLabel}: Pemasukan ${formatCompactRupiah(
                      point.income
                    )}, Pengeluaran ${formatCompactRupiah(point.expense)}`}
                    onMouseEnter={() => setActiveHoverIndex(idx)}
                    onMouseLeave={() => setActiveHoverIndex(null)}
                    onFocus={() => setActiveHoverIndex(idx)}
                    onBlur={() => setActiveHoverIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveHoverIndex((prev) => (prev === idx ? null : idx));
                      }
                    }}
                  >
                    {/* Floating Tooltip */}
                    <div
                      className={styles.barHoverTooltip}
                      style={{ bottom: `${tooltipBottomPx}px` }}
                      role="tooltip"
                      aria-hidden={!isHovered}
                    >
                      <div className={styles.tooltipTitle}>{fullLabel}</div>
                      <div className={styles.tooltipRow}>
                        <span className={styles.tooltipDotOrange} />
                        <span>Pemasukan:</span>
                        <strong>{formatCompactRupiah(point.income)}</strong>
                      </div>
                      <div className={styles.tooltipRow}>
                        <span className={styles.tooltipDotDark} />
                        <span>Pengeluaran:</span>
                        <strong>{formatCompactRupiah(point.expense)}</strong>
                      </div>
                      <div
                        className={styles.tooltipRow}
                        style={{
                          marginTop: 2,
                          paddingTop: 3,
                          borderTop: "1px dashed var(--border-subtle, #eceef2)",
                          fontSize: 10,
                          color:
                            netSurplus >= 0
                              ? surplusTone === "orange"
                                ? "var(--color-primary-dark, #c25e00)"
                                : "var(--color-success-text, #16a34a)"
                              : "var(--color-danger-text, #dc2626)",
                          fontWeight: 600,
                        }}
                      >
                        <span>Surplus:</span>
                        <span>{formatCompactRupiah(netSurplus)}</span>
                      </div>
                    </div>

                    {/* Bars Duo (Income & Expense) */}
                    <div className={styles.barsDuo}>
                      {/* Pemasukan Capsule */}
                      <div
                        className={styles.estifyBarCapsule}
                        style={{ height: `${incomeHeight}px` }}
                        title={`Pemasukan: ${formatCompactRupiah(point.income)}`}
                      >
                        <div
                          className={`${styles.barFillSolid} ${styles.isPemasukan} ${
                            isCurrentActive ? styles.isOrangeActive : ""
                          }`}
                        />
                      </div>

                      {/* Pengeluaran Capsule */}
                      <div
                        className={styles.estifyBarCapsule}
                        style={{ height: `${expenseHeight}px` }}
                        title={`Pengeluaran: ${formatCompactRupiah(point.expense)}`}
                      >
                        <div
                          className={`${styles.barFillSolid} ${styles.isPengeluaran} ${
                            isCurrentActive ? styles.isDarkActive : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Month X-Axis Label */}
                    <span
                      className={`${styles.barXTxt} ${
                        isCurrentActive ? styles.barXTxtActive : ""
                      }`}
                      aria-hidden="true"
                    >
                      {point.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CashflowChart.displayName = "CashflowChart";
