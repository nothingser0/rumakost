import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import styles from "./button.module.css";

export type ButtonVariant =
  | "primary-black"
  | "primary-orange"
  | "secondary-ghost"
  | "subtle-danger"
  | "ghost-link"
  | "link"
  | "icon-circle"
  | "translucent-arrow"
  | "pill-arrow"
  | "white-arrow"
  | "primary"
  | "dark"
  | "secondary"
  | "outline"
  | "destructive";

export type ButtonSize = "lg" | "md" | "sm" | "xs" | "icon";

export type ButtonShape = "pill" | "rounded" | "circle";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

function resolveVariant(variant: ButtonVariant): string {
  switch (variant) {
    case "primary":
    case "primary-orange":
      return styles["variant-primary-orange"];
    case "dark":
    case "primary-black":
      return styles["variant-primary-black"];
    case "secondary":
    case "outline":
    case "secondary-ghost":
      return styles["variant-secondary-ghost"];
    case "destructive":
    case "subtle-danger":
      return styles["variant-subtle-danger"];
    case "link":
    case "ghost-link":
      return styles["variant-ghost-link"];
    case "icon-circle":
      return styles["variant-icon-circle"];
    case "translucent-arrow":
      return styles["variant-translucent-arrow"];
    case "pill-arrow":
    case "white-arrow":
      return styles["variant-pill-arrow"];
    default:
      return styles["variant-primary-black"];
  }
}

function resolveSize(size: ButtonSize): string {
  switch (size) {
    case "lg":
      return styles["size-lg"];
    case "sm":
      return styles["size-sm"];
    case "xs":
      return styles["size-xs"];
    case "icon":
      return styles["size-icon"];
    case "md":
    default:
      return styles["size-md"];
  }
}

function resolveShape(shape?: ButtonShape, size?: ButtonSize, variant?: ButtonVariant): string {
  if (
    shape === "circle" ||
    size === "icon" ||
    variant === "icon-circle" ||
    variant === "translucent-arrow" ||
    variant === "pill-arrow" ||
    variant === "white-arrow"
  ) {
    return styles["shape-circle"];
  }
  if (shape === "rounded") {
    return styles["shape-rounded"];
  }
  return styles["shape-pill"];
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
        style={{ opacity: 0.25 }}
      />
      <path
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
        style={{ opacity: 0.9 }}
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary-black",
      size = "md",
      shape,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled = false,
      type = "button",
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isInactive = disabled || loading;

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (isInactive) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    const classNames = [
      styles.button,
      resolveVariant(variant),
      resolveSize(size),
      resolveShape(shape, size, variant),
      isInactive ? styles.disabled : null,
      loading ? styles.loading : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        aria-busy={loading ? "true" : undefined}
        aria-disabled={isInactive ? "true" : undefined}
        className={classNames}
        disabled={isInactive}
        onClick={handleClick}
        type={type}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className={styles.spinner} />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
            {children}
            {rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
