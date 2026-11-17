import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./occupancy-gauge.module.css";

export type OccupancyGaugeTone = "brand" | "dark" | "danger";
export type OccupancyGaugeSize = "xs" | "sm" | "md" | "lg";

export interface OccupancyGaugeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
  label: string;
  value: number;
  min?: number;
  max?: number;
  valueText?: string;
  caption?: ReactNode;
  tone?: OccupancyGaugeTone;
  size?: OccupancyGaugeSize;
  showTicks?: boolean;
  tickCount?: number;
}

const CENTER_X = 100;
const CENTER_Y = 100;
const ARC_RADIUS = 80;
const TICK_INNER_RADIUS = 92;
const TICK_OUTER_RADIUS = 96;
const DEFAULT_TICK_COUNT = 21;

export function getGaugeRatio(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  if (max <= min) {
    return 0;
  }

  const ratio = (value - min) / (max - min);

  if (ratio <= 0) {
    return 0;
  }

  if (ratio >= 1) {
    return 1;
  }

  return ratio;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function buildTicks(count: number) {
  const safeCount = Number.isInteger(count) && count >= 2 ? count : DEFAULT_TICK_COUNT;

  return Array.from({ length: safeCount }, (_, index) => {
    const angle = Math.PI - (Math.PI * index) / (safeCount - 1);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      key: index,
      x1: round(CENTER_X + TICK_INNER_RADIUS * cos),
      y1: round(CENTER_Y - TICK_INNER_RADIUS * sin),
      x2: round(CENTER_X + TICK_OUTER_RADIUS * cos),
      y2: round(CENTER_Y - TICK_OUTER_RADIUS * sin),
    };
  });
}

const ARC_PATH = `M ${CENTER_X - ARC_RADIUS} ${CENTER_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${CENTER_X + ARC_RADIUS} ${CENTER_Y}`;

export const OccupancyGauge = forwardRef<HTMLDivElement, OccupancyGaugeProps>(
  (
    {
      caption,
      className,
      label,
      max = 100,
      min = 0,
      showTicks = false,
      size = "md",
      tickCount = DEFAULT_TICK_COUNT,
      tone = "brand",
      value,
      valueText,
      ...props
    },
    ref,
  ) => {
    const ratio = getGaugeRatio(value, min, max);
    const percent = round(ratio * 100);
    const resolvedValueText = valueText ?? `${Math.round(percent)}%`;
    const nowValue = Number.isFinite(value)
      ? Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max))
      : min;

    return (
      <div
        {...props}
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={nowValue}
        aria-valuetext={resolvedValueText}
        className={[
          styles.gauge,
          styles[`size-${size}`],
          styles[`tone-${tone}`],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        ref={ref}
        role="meter"
      >
        <svg
          aria-hidden="true"
          className={styles.svg}
          focusable="false"
          viewBox="0 0 200 108"
        >
          {showTicks ? (
            <g className={styles.ticks}>
              {buildTicks(tickCount).map((tick) => (
                <line
                  key={tick.key}
                  x1={tick.x1}
                  x2={tick.x2}
                  y1={tick.y1}
                  y2={tick.y2}
                />
              ))}
            </g>
          ) : null}
          <path
            className={styles.track}
            d={ARC_PATH}
            fill="none"
            pathLength={100}
          />
          {ratio > 0 ? (
            <path
              className={styles.progress}
              d={ARC_PATH}
              fill="none"
              pathLength={100}
              strokeDasharray={`${percent} 100`}
            />
          ) : null}
        </svg>
        <div className={styles.center}>
          <span className={styles.value}>{resolvedValueText}</span>
          {caption ? <span className={styles.caption}>{caption}</span> : null}
        </div>
      </div>
    );
  },
);

OccupancyGauge.displayName = "OccupancyGauge";
