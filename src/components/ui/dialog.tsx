"use client";

import {
  createContext,
  useContext,
  useId,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./dialog.module.css";
import { Button } from "./button";

/* ==========================================================================
   Lucide SVG Close Icon (Zero-Emoji Craftsmanship)
   ========================================================================== */

function XIcon() {
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
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

/* ==========================================================================
   Dialog Context & Types
   ========================================================================== */

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog subcomponents must be rendered within a <Dialog /> parent.");
  }
  return ctx;
}

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: DialogSize;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
  backdropClassName?: string;
}

/* ==========================================================================
   Root Dialog Component
   ========================================================================== */

export function Dialog({
  backdropClassName,
  children,
  className,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  onOpenChange,
  open,
  size = "md",
}: DialogProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-desc`;

  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Mount detection for client-side portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track previous focus and lock body scroll
  useEffect(() => {
    if (!open) return;

    if (typeof document !== "undefined") {
      previousActiveElement.current = document.activeElement as HTMLElement | null;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Focus the dialog card or its first focusable element
      const focusTimer = setTimeout(() => {
        if (cardRef.current) {
          const focusable = cardRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            cardRef.current.focus();
          }
        }
      }, 30);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = originalOverflow;
        previousActiveElement.current?.focus();
      };
    }
  }, [open]);

  // Keyboard navigation & Focus Trap
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    if (e.key === "Escape" && closeOnEscape) {
      e.preventDefault();
      e.stopPropagation();
      onOpenChange(false);
      return;
    }

    if (e.key === "Tab" && cardRef.current) {
      const focusables = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const dialogContent = (
    <DialogContext.Provider
      value={{
        descriptionId,
        onOpenChange,
        open,
        titleId,
      }}
    >
      <div
        className={[styles.backdrop, backdropClassName].filter(Boolean).join(" ")}
        onClick={handleBackdropClick}
      >
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className={[
            styles.card,
            styles[`size-${size}`],
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          onKeyDown={handleKeyDown}
          ref={cardRef}
          role="dialog"
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );

  // Render via portal in browser; directly in SSR / test environments
  if (mounted && typeof document !== "undefined") {
    return createPortal(dialogContent, document.body);
  }

  return dialogContent;
}

/* ==========================================================================
   Dialog Subcomponents
   ========================================================================== */

export interface DialogHeaderProps {
  children?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function DialogHeader({
  children,
  className,
  showCloseButton = true,
}: DialogHeaderProps) {
  const { onOpenChange } = useDialogContext();

  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")}>
      <div className={styles.headerText}>{children}</div>
      {showCloseButton ? (
        <button
          aria-label="Tutup dialog"
          className={styles.closeButton}
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <XIcon />
        </button>
      ) : null}
    </div>
  );
}

export interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return (
    <h3 className={[styles.title, className].filter(Boolean).join(" ")} id={titleId}>
      {children}
    </h3>
  );
}

export interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return (
    <p
      className={[styles.description, className].filter(Boolean).join(" ")}
      id={descriptionId}
    >
      {children}
    </p>
  );
}

export interface DialogBodyProps {
  children: ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export interface DialogCloseProps {
  children?: ReactNode;
  className?: string;
}

export function DialogClose({ children, className }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext();
  return (
    <Button
      className={className}
      onClick={() => onOpenChange(false)}
      type="button"
      variant="secondary-ghost"
    >
      {children ?? "Batal"}
    </Button>
  );
}

/* ==========================================================================
   ConfirmDialog (High-Level Confirmation Helper - Anti-Browser Alert)
   ========================================================================== */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "danger" | "primary-black" | "primary-orange";
  isLoading?: boolean;
}

export function ConfirmDialog({
  cancelText = "Batal",
  confirmText = "Lanjutkan",
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  title,
  variant = "primary-black",
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const buttonVariant =
    variant === "danger"
      ? "subtle-danger"
      : variant === "primary-orange"
        ? "primary-orange"
        : "primary-black";

  return (
    <Dialog onOpenChange={onOpenChange} open={open} size="sm">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      <DialogFooter>
        <Button
          disabled={isLoading}
          onClick={handleCancel}
          type="button"
          variant="secondary-ghost"
        >
          {cancelText}
        </Button>
        <Button
          disabled={isLoading}
          loading={isLoading}
          onClick={handleConfirm}
          type="button"
          variant={buttonVariant}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
