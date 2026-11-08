"use client";

import {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import styles from "./popover-select.module.css";

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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
      width="14"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */

export interface PopoverSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface PopoverSelectProps {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: PopoverSelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  defaultOpen?: boolean;
  triggerIcon?: ReactNode;
  triggerVariant?: "pill" | "rounded";
  align?: "left" | "right";
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
}

/* ==========================================================================
   PopoverSelect Component (CMP-04)
   ========================================================================== */

export const PopoverSelect = forwardRef<HTMLButtonElement, PopoverSelectProps>(
  (
    {
      align = "left",
      className,
      defaultOpen = false,
      defaultValue,
      disabled = false,
      error,
      hint,
      id,
      label,
      multiple = false,
      name,
      onChange,
      options = [],
      placeholder = "Pilih opsi...",
      popoverClassName,
      required = false,
      searchable = false,
      searchPlaceholder = "Cari pilihan...",
      triggerClassName,
      triggerIcon,
      triggerVariant = "pill",
      value: controlledValue,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const listId = `${selectId}-list`;
    const labelId = label ? `${selectId}-label` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    // Internal value state for uncontrolled mode
    const [internalValue, setInternalValue] = useState<string | string[]>(() => {
      if (defaultValue !== undefined) return defaultValue;
      return multiple ? [] : "";
    });

    const isControlled = controlledValue !== undefined;
    const activeValue = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on search query
    const filteredOptions = searchQuery.trim()
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        )
      : options;

    // Check if an option is selected
    const isOptionSelected = (optValue: string): boolean => {
      if (multiple && Array.isArray(activeValue)) {
        return activeValue.includes(optValue);
      }
      return activeValue === optValue;
    };

    // Label to display on trigger
    const getTriggerText = (): ReactNode => {
      if (multiple && Array.isArray(activeValue)) {
        if (activeValue.length === 0) {
          return <span className={styles.placeholder}>{placeholder}</span>;
        }
        if (activeValue.length === 1) {
          const opt = options.find((o) => o.value === activeValue[0]);
          return opt ? opt.label : activeValue[0];
        }
        return `${activeValue.length} opsi terpilih`;
      }

      if (typeof activeValue === "string" && activeValue) {
        const selected = options.find((o) => o.value === activeValue);
        return selected ? selected.label : activeValue;
      }

      return <span className={styles.placeholder}>{placeholder}</span>;
    };

    // Handle selection
    const handleSelect = (optValue: string) => {
      if (multiple) {
        const currentList = Array.isArray(activeValue) ? [...activeValue] : [];
        const index = currentList.indexOf(optValue);
        const nextList =
          index >= 0
            ? currentList.filter((item) => item !== optValue)
            : [...currentList, optValue];

        if (!isControlled) {
          setInternalValue(nextList);
        }
        onChange?.(nextList);
      } else {
        if (!isControlled) {
          setInternalValue(optValue);
        }
        onChange?.(optValue);
        setIsOpen(false);
        setSearchQuery("");
        triggerRef.current?.focus();
      }
    };

    // Click outside handler
    useEffect(() => {
      if (!isOpen) return;

      const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
      };
    }, [isOpen]);

    // Auto-focus search input or list when opened
    useEffect(() => {
      if (isOpen) {
        setFocusedIndex(0);
        if (searchable && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    }, [isOpen, searchable]);

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          triggerRef.current?.focus();
          break;

        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= filteredOptions.length ? 0 : next;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? filteredOptions.length - 1 : next;
          });
          break;

        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case "End":
          e.preventDefault();
          setFocusedIndex(filteredOptions.length - 1);
          break;

        case "Enter":
        case " ":
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            e.preventDefault();
            const focusedOption = filteredOptions[focusedIndex];
            if (!focusedOption.disabled) {
              handleSelect(focusedOption.value);
            }
          }
          break;

        case "Tab":
          setIsOpen(false);
          setSearchQuery("");
          break;
      }
    };

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={[styles.container, className].filter(Boolean).join(" ")} ref={containerRef}>
        {label ? (
          <label className={styles.label} id={labelId}>
            {label}
            {required ? <span className={styles.requiredIndicator}>*</span> : null}
          </label>
        ) : null}

        {/* Hidden inputs to support standard HTML form submissions */}
        {name ? (
          multiple && Array.isArray(activeValue) ? (
            activeValue.map((val, idx) => (
              <input key={`${name}-${idx}`} name={name} type="hidden" value={val} />
            ))
          ) : (
            <input
              name={name}
              type="hidden"
              value={typeof activeValue === "string" ? activeValue : ""}
            />
          )
        ) : null}

        <button
          aria-controls={isOpen ? listId : undefined}
          aria-describedby={describedBy}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          aria-labelledby={labelId}
          aria-required={required}
          className={[
            styles.trigger,
            triggerVariant === "rounded" ? styles["trigger-rounded"] : null,
            isOpen ? styles.triggerOpen : null,
            error ? styles.triggerInvalid : null,
            triggerClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          id={selectId}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="button"
        >
          <span className={styles.triggerContent}>
            {triggerIcon ? <span className={styles.triggerIcon}>{triggerIcon}</span> : null}
            <span>{getTriggerText()}</span>
          </span>
          <span
            className={[styles.chevronIcon, isOpen ? styles.chevronOpen : null]
              .filter(Boolean)
              .join(" ")}
          >
            <ChevronDownIcon />
          </span>
        </button>

        {isOpen ? (
          <div
            className={[
              styles.popover,
              align === "right" ? styles["align-right"] : styles["align-left"],
              popoverClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {searchable ? (
              <div className={styles.searchWrapper}>
                <input
                  aria-label={searchPlaceholder}
                  className={styles.searchInput}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                />
              </div>
            ) : null}

            <ul
              aria-labelledby={labelId}
              aria-multiselectable={multiple}
              className={styles.list}
              id={listId}
              ref={listRef}
              role="listbox"
              tabIndex={-1}
            >
              {filteredOptions.length === 0 ? (
                <li className={styles.emptyMessage}>Tidak ada opsi yang sesuai</li>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = isOptionSelected(opt.value);
                  const isFocused = idx === focusedIndex;

                  return (
                    <li
                      aria-disabled={opt.disabled}
                      aria-selected={isSelected}
                      className={[
                        styles.item,
                        isSelected ? styles.itemSelected : null,
                        isFocused ? styles.itemFocused : null,
                        opt.disabled ? styles.itemDisabled : null,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      id={`${selectId}-option-${idx}`}
                      key={opt.value}
                      onClick={() => {
                        if (!opt.disabled) {
                          handleSelect(opt.value);
                        }
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      role="option"
                    >
                      <div className={styles.itemMain}>
                        {opt.icon ? <span className={styles.itemIcon}>{opt.icon}</span> : null}
                        <div>
                          <div className={styles.itemText}>{opt.label}</div>
                          {opt.description ? (
                            <div className={styles.itemDescription}>{opt.description}</div>
                          ) : null}
                        </div>
                      </div>

                      {isSelected ? (
                        <span className={styles.checkIcon}>
                          <CheckIcon />
                        </span>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className={styles.error} id={errorId} role="alert">
            {error}
          </div>
        ) : hint ? (
          <div className={styles.hint} id={hintId}>
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

PopoverSelect.displayName = "PopoverSelect";
