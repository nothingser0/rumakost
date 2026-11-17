import { forwardRef, type HTMLAttributes } from "react";
import { formatCompactRupiah } from "./metric-card";
import styles from "./property-card.module.css";

export interface PropertyHighlightCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  propertyName?: string;
  address?: string;
  totalRooms?: number;
  occupiedRooms?: number;
  occupancyRate?: number;
  netIncome?: number | string;
  netIncomeDelta?: string;
  tagText?: string;
  imageUrl?: string;
  href?: string;
  variant?: "finance" | "operational";
  role?: "OWNER" | "STAFF";
  ariaLabel?: string;
}

/**
 * Diagonal arrow icon (Zero emoji).
 */
export function DiagonalArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="15">
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

/**
 * Arrow up trend icon (Zero emoji).
 */
export function TrendUpIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="11">
      <line x1="12" x2="12" y1="19" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

/**
 * CMP-10: Property Highlight Card (M06-UI-HIGHLIGHT-CARD)
 * Single-property highlight card for the primary boarding house ("Kost Budi Makmur").
 */
export const PropertyHighlightCard = forwardRef<HTMLDivElement, PropertyHighlightCardProps>(
  function PropertyHighlightCard(
    {
      propertyName = "Kost Budi Makmur",
      address = "Jl. Flamboyan No. 12",
      totalRooms = 15,
      occupiedRooms = 11,
      occupancyRate = 73,
      netIncome = 12300000,
      netIncomeDelta = "+15%",
      tagText = "Properti Utama",
      imageUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      href = "/kamar",
      variant = "finance",
      role = "OWNER",
      onClick,
      ariaLabel,
      className,
      ...restProps
    },
    ref,
  ) {
    // Security / Role scoping: Staff must NEVER see financial income!
    const effectiveVariant = role === "STAFF" ? "operational" : variant;

    const formattedIncome =
      typeof netIncome === "number" || typeof netIncome === "string"
        ? formatCompactRupiah(netIncome)
        : "Rp 0";

    const defaultAriaLabel =
      effectiveVariant === "finance"
        ? `${propertyName}, ${address}, ${totalRooms} Unit, Pemasukan Bersih ${formattedIncome}. Buka Katalog Kamar`
        : `${propertyName}, ${address}, Total Kamar: ${totalRooms}, Okupansi: ${occupancyRate}%. Buka Katalog Kamar`;

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
        aria-label={ariaLabel ?? defaultAriaLabel}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={[styles.card, className].filter(Boolean).join(" ")}
        {...restProps}
      >
        {/* Architectural Wave Pattern Motif */}
        <svg
          className={styles.patternSvg}
          viewBox="0 0 400 300"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-40 220 C 60 140, 160 280, 280 180 C 340 130, 420 200, 480 160"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M-20 260 C 80 180, 180 320, 300 220 C 360 170, 440 240, 500 200"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M0 300 C 100 220, 200 360, 320 260 C 380 210, 460 280, 520 240"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="45" cy="55" r="110" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="45" cy="55" r="150" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 5" />
        </svg>

        {/* Top Row: Tag Pill & Action Arrow */}
        <div className={styles.topRow}>
          <span className={styles.tagPill}>{tagText}</span>
          <button
            type="button"
            className={styles.arrowButton}
            title={`Lihat detail ${propertyName}`}
            aria-label={`Buka detail properti ${propertyName}`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
          >
            <DiagonalArrowIcon />
          </button>
        </div>

        {/* Main Body */}
        <div className={styles.mainBody}>
          <div className={styles.headerGroup}>
            <span className={styles.subMeta}>
              {`${address} · ${totalRooms} Unit`}
            </span>
            <h2 className={styles.mainTitle}>{propertyName}</h2>
          </div>

          {/* Conditional Metric Block */}
          {effectiveVariant === "finance" ? (
            <div className={styles.emphasisBlock}>
              <span className={styles.emphasisLabel}>Pemasukan Bersih Bulan Ini</span>
              <div className={styles.emphasisValWrap}>
                <span className={styles.emphasisValHuge}>{formattedIncome}</span>
                {netIncomeDelta ? (
                  <span className={styles.emphasisPillTrend}>
                    {netIncomeDelta} <TrendUpIcon />
                  </span>
                ) : null}
              </div>
              <span className={styles.emphasisSubText}>Akumulasi laba bersih berjalan</span>
            </div>
          ) : (
            <div className={styles.emphasisBlock}>
              <span className={styles.emphasisLabel}>Ringkasan Okupansi</span>
              <div className={styles.dualMetricsWrap}>
                <div className={styles.dualMetricItem}>
                  <span className={styles.dualMetricLabel}>Total Kamar</span>
                  <span className={styles.dualMetricValue}>{`${totalRooms} Unit`}</span>
                </div>
                <div className={styles.dualMetricItem}>
                  <span className={styles.dualMetricLabel}>Tingkat Hunian</span>
                  <span className={styles.dualMetricValue}>{`${occupancyRate}%`}</span>
                </div>
              </div>
              <span className={styles.emphasisSubText}>
                {`${occupiedRooms} dari ${totalRooms} kamar aktif terisi`}
              </span>
            </div>
          )}
        </div>

        {/* Perspective Building Photo Cutout */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Gedung ${propertyName}`}
            className={styles.buildingImg}
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  },
);

PropertyHighlightCard.displayName = "PropertyHighlightCard";

// Alias for convenience
export const PropertyCard = PropertyHighlightCard;
