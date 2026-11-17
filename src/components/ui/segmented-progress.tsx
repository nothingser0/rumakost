import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./segmented-progress.module.css";

export type ProgressTone =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "dark"
  | "neutral";

export type ProgressSize = "sm" | "md";

export type TicketStepStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "checking"
  | "resolved";

export const DEFAULT_TICKET_STEPS: readonly string[] = [
  "Diterima",
  "Ditugaskan",
  "Dikerjakan",
  "Diperiksa",
  "Selesai",
];

const TICKET_STATUS_MAP: Record<TicketStepStatus, number> = {
  submitted: 1,
  assigned: 2,
  in_progress: 3,
  checking: 4,
  resolved: 5,
};

/**
 * Resolves a ticket step index (1-based, 1 to 5) from status string or number.
 */
export function getTicketStepIndex(status: TicketStepStatus | number): number {
  if (typeof status === "number") {
    if (!Number.isFinite(status) || status < 1) return 1;
    if (status > 5) return 5;
    return Math.floor(status);
  }
  return TICKET_STATUS_MAP[status] ?? 1;
}

/**
 * Resolves the display name for a ticket step.
 */
export function getTicketStepName(
  step: number,
  stepNames: readonly string[] = DEFAULT_TICKET_STEPS,
): string {
  const index = Math.max(1, Math.min(step, stepNames.length)) - 1;
  return stepNames[index] ?? "";
}

/* =========================================================================
   Variant 2: Segmented 5-Step Dashes (Tiket Detail & Stepper)
   ========================================================================= */

export interface SegmentedProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  currentStep: number;
  totalSteps?: number;
  stepNames?: readonly string[];
  label?: string;
  size?: ProgressSize;
  tone?: ProgressTone;
  completedTone?: ProgressTone;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom";
  subText?: ReactNode;
}

export const SegmentedProgress = forwardRef<HTMLDivElement, SegmentedProgressProps>(
  function SegmentedProgress(
    {
      currentStep,
      totalSteps = 5,
      stepNames = DEFAULT_TICKET_STEPS,
      label = "Progres tahapan penanganan",
      size = "sm",
      tone = "brand",
      completedTone = "success",
      showLabel = false,
      labelPosition = "top",
      subText,
      className,
      ...restProps
    },
    ref,
  ) {
    const safeTotal = Math.max(1, Math.floor(totalSteps));
    const safeCurrent = Math.max(0, Math.min(Math.floor(currentStep), safeTotal));
    const stepName = getTicketStepName(safeCurrent, stepNames);
    const isCompleted = safeCurrent >= safeTotal;

    const valueText =
      safeCurrent > 0
        ? `Tahap ${safeCurrent} dari ${safeTotal}: ${stepName}`
        : `Belum dimulai (0 dari ${safeTotal})`;

    const sizeClass = size === "md" ? styles["size-md"] : styles["size-sm"];

    const labelElement = showLabel ? (
      <div className={styles.headerRow}>
        <span className={styles.mainLabel}>
          {safeCurrent > 0 ? `Tahap ${safeCurrent}: ${stepName}` : "Belum Dimulai"}
        </span>
        <span className={styles.subLabel}>
          {subText ?? `Tahap ${safeCurrent} dari ${safeTotal}`}
        </span>
      </div>
    ) : null;

    return (
      <div ref={ref} className={[styles.root, className].filter(Boolean).join(" ")} {...restProps}>
        {labelPosition === "top" ? labelElement : null}

        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={safeCurrent}
          aria-valuemin={0}
          aria-valuemax={safeTotal}
          aria-valuetext={valueText}
          className={`${styles.segmentedTrack} ${sizeClass}`}
        >
          {Array.from({ length: safeTotal }, (_, i) => {
            const stepNumber = i + 1;
            const isFilled = stepNumber <= safeCurrent;
            const effectiveTone = isCompleted ? completedTone : tone;
            const dashClass = isFilled
              ? `${styles.dash} ${styles.dashFilled} ${styles[`tone-${effectiveTone}`]}`
              : styles.dash;

            return <div key={stepNumber} className={dashClass} aria-hidden="true" />;
          })}
        </div>

        <span className={styles.srOnly}>{valueText}</span>

        {labelPosition === "bottom" ? labelElement : null}
      </div>
    );
  },
);

/* =========================================================================
   Variant 1: Thick Continuous Bar (Building Condition / General Progress)
   ========================================================================= */

export interface ContinuousProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  value: number;
  min?: number;
  max?: number;
  label: string;
  size?: ProgressSize;
  tone?: ProgressTone;
  valueText?: string;
  showValue?: boolean;
}

export const ContinuousProgress = forwardRef<HTMLDivElement, ContinuousProgressProps>(
  function ContinuousProgress(
    {
      value,
      min = 0,
      max = 100,
      label,
      size = "md",
      tone = "brand",
      valueText,
      showValue = false,
      className,
      ...restProps
    },
    ref,
  ) {
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 100;
    const rawValue = Number.isFinite(value) ? value : safeMin;
    const clampedValue = Math.max(safeMin, Math.min(rawValue, safeMax));
    const percentage = Math.round(((clampedValue - safeMin) / (safeMax - safeMin)) * 100);

    const displayValueText = valueText ?? `${percentage}%`;
    const sizeClass = size === "sm" ? styles["size-sm"] : styles["size-md"];

    return (
      <div ref={ref} className={[styles.root, className].filter(Boolean).join(" ")} {...restProps}>
        {showValue ? (
          <div className={styles.headerRow}>
            <span className={styles.mainLabel}>{label}</span>
            <span className={styles.subLabel}>{displayValueText}</span>
          </div>
        ) : null}

        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={clampedValue}
          aria-valuemin={safeMin}
          aria-valuemax={safeMax}
          aria-valuetext={displayValueText}
          className={`${styles.continuousTrack} ${sizeClass}`}
        >
          <div
            className={`${styles.continuousFill} ${styles[`tone-${tone}`]}`}
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>

        <span className={styles.srOnly}>{`${label}: ${displayValueText}`}</span>
      </div>
    );
  },
);

/* =========================================================================
   TicketStepTracker: Convenience Composite for Ticket List and Modal
   ========================================================================= */

export interface TicketStepTrackerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  status: TicketStepStatus | number;
  variant?: "mini" | "modal";
  label?: string;
  showLabel?: boolean;
  stepNames?: readonly string[];
}

export const TicketStepTracker = forwardRef<HTMLDivElement, TicketStepTrackerProps>(
  function TicketStepTracker(
    {
      status,
      variant = "mini",
      label = "Progress Penanganan",
      showLabel = true,
      stepNames = DEFAULT_TICKET_STEPS,
      className,
      ...restProps
    },
    ref,
  ) {
    const stepIndex = getTicketStepIndex(status);
    const stepName = getTicketStepName(stepIndex, stepNames);
    const isDone = stepIndex === 5;
    const isNeutral = stepIndex === 1;

    const currentTextClass = [
      styles.stepCurrentText,
      isDone ? styles.isDone : "",
      isNeutral ? styles.isNeutral : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (variant === "mini") {
      return (
        <div
          ref={ref}
          className={[styles.miniTracker, className].filter(Boolean).join(" ")}
          {...restProps}
        >
          {showLabel ? (
            <span className={currentTextClass}>
              {`Tahap ${stepIndex}: ${stepName}`}
            </span>
          ) : null}
          <SegmentedProgress
            currentStep={stepIndex}
            totalSteps={5}
            stepNames={stepNames}
            label={label}
            size="sm"
            tone="brand"
            completedTone="success"
            showLabel={false}
          />
        </div>
      );
    }

    // Modal variant (full-width 7px dashes)
    return (
      <div
        ref={ref}
        className={[styles.modalTracker, className].filter(Boolean).join(" ")}
        {...restProps}
      >
        {showLabel ? (
          <div className={styles.headerRow}>
            <span className={styles.mainLabel}>{label}</span>
            <span
              className={styles.subLabel}
              style={{ color: isDone ? "#16a34a" : "#ff7a00", fontWeight: 700 }}
            >
              {`Tahap ${stepIndex} dari 5`}
            </span>
          </div>
        ) : null}
        <SegmentedProgress
          currentStep={stepIndex}
          totalSteps={5}
          stepNames={stepNames}
          label={label}
          size="md"
          tone="brand"
          completedTone="success"
          showLabel={false}
        />
      </div>
    );
  },
);
