"use client";

import {
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  Children,
  isValidElement,
} from "react";
import styles from "./input.module.css";

function EyeIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="15">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "default" | "capsule" | "search";
  containerClassName?: string;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      variant = "default",
      type = "text",
      showPasswordToggle = true,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && showPassword ? "text" : type;

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const resolvedRightIcon = rightIcon
      ? rightIcon
      : isPassword && showPasswordToggle ? (
          <button
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className={styles.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            type="button"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null;

    const inputClasses = [
      styles.input,
      variant === "capsule" || variant === "search" ? styles["variant-capsule"] : null,
      leftIcon ? styles.hasLeftIcon : null,
      resolvedRightIcon ? styles.hasRightIcon : null,
      error ? styles.invalid : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={[styles.field, containerClassName].filter(Boolean).join(" ")}>
        {label ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {required ? (
              <span aria-hidden="true" className={styles.requiredIndicator}>
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div className={styles.inputWrapper}>
          {leftIcon ? <span className={styles.leftIconSlot}>{leftIcon}</span> : null}
          <input
            ref={ref}
            aria-describedby={describedBy}
            aria-disabled={disabled ? "true" : undefined}
            aria-errormessage={errorId}
            aria-invalid={error ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            className={inputClasses}
            disabled={disabled}
            id={inputId}
            required={required}
            type={effectiveType}
            {...props}
          />
          {resolvedRightIcon ? (
            <span className={styles.rightIconSlot}>{resolvedRightIcon}</span>
          ) : null}
        </div>

        {error ? (
          <p
            aria-live="polite"
            className={styles.error}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const textareaClasses = [
      styles.textarea,
      error ? styles.invalid : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={[styles.field, containerClassName].filter(Boolean).join(" ")}>
        {label ? (
          <label className={styles.label} htmlFor={textareaId}>
            {label}
            {required ? (
              <span aria-hidden="true" className={styles.requiredIndicator}>
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <textarea
          ref={ref}
          aria-describedby={describedBy}
          aria-disabled={disabled ? "true" : undefined}
          aria-errormessage={errorId}
          aria-invalid={error ? "true" : undefined}
          aria-required={required ? "true" : undefined}
          className={textareaClasses}
          disabled={disabled}
          id={textareaId}
          required={required}
          {...props}
        />

        {error ? (
          <p
            aria-live="polite"
            className={styles.error}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const hintId = hint ? `${checkboxId}-hint` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={[styles.checkboxWrapper, containerClassName].filter(Boolean).join(" ")}>
        <label
          className={[
            styles.checkboxContainer,
            disabled ? styles.checkboxDisabled : null,
          ]
            .filter(Boolean)
            .join(" ")}
          htmlFor={checkboxId}
        >
          <input
            ref={ref}
            aria-describedby={describedBy}
            aria-disabled={disabled ? "true" : undefined}
            aria-errormessage={errorId}
            aria-invalid={error ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            className={[styles.checkboxInput, className].filter(Boolean).join(" ")}
            disabled={disabled}
            id={checkboxId}
            required={required}
            type="checkbox"
            {...props}
          />
          {label ? <span className={styles.checkboxLabel}>{label}</span> : null}
        </label>

        {error ? (
          <p
            aria-live="polite"
            className={styles.error}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  options?: SelectOption[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      hint,
      error,
      className,
      containerClassName,
      disabled,
      required,
      options,
      placeholder,
      value,
      defaultValue,
      onChange,
      onValueChange,
      children,
      name,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const listboxId = `${selectId}-listbox`;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Extract options from props.options OR from children (<option>)
    const parsedOptions: SelectOption[] = [];
    if (options && options.length > 0) {
      parsedOptions.push(...options);
    } else if (children) {
      Children.forEach(children, (child) => {
        if (isValidElement(child) && child.props) {
          const childProps = child.props as {
            value?: string | number;
            children?: ReactNode;
            disabled?: boolean;
          };
          parsedOptions.push({
            value: String(childProps.value ?? ""),
            label:
              typeof childProps.children === "string"
                ? childProps.children
                : String(childProps.value ?? ""),
            disabled: childProps.disabled,
          });
        }
      });
    }

    const initialVal =
      value !== undefined
        ? String(value)
        : defaultValue !== undefined
        ? String(defaultValue)
        : parsedOptions[0]?.value ?? "";

    const [selectedValue, setSelectedValue] = useState(initialVal);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(String(value));
      }
    }, [value]);

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const activeOption = parsedOptions.find((opt) => opt.value === selectedValue);
    const displayText = activeOption ? activeOption.label : placeholder || "-- Pilih --";

    const handleSelectOption = (optVal: string) => {
      setSelectedValue(optVal);
      setIsOpen(false);
      onValueChange?.(optVal);

      // Trigger standard native change event if ref is bound
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };

    const handleNativeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedValue(e.target.value);
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className={[styles.field, containerClassName].filter(Boolean).join(" ")}>
        {label ? (
          <label className={styles.label} htmlFor={selectId}>
            {label}
            {required ? (
              <span aria-hidden="true" className={styles.requiredIndicator}>
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div className={styles.customSelectWrapper} ref={wrapperRef}>
          {/* Hidden native select for form submit and test queries */}
          <select
            ref={ref}
            aria-hidden="true"
            className={styles.visuallyHiddenSelect}
            disabled={disabled}
            id={selectId}
            name={name}
            onChange={handleNativeSelectChange}
            required={required}
            tabIndex={-1}
            value={value !== undefined ? value : selectedValue}
            {...props}
          >
            {parsedOptions.map((opt) => (
              <option disabled={opt.disabled} key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom Styled Trigger */}
          <button
            aria-controls={listboxId}
            aria-describedby={describedBy}
            aria-disabled={disabled ? "true" : undefined}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className={[
              styles.customSelectTrigger,
              isOpen ? styles.isOpen : null,
              error ? styles.invalid : null,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            ref={triggerRef}
            type="button"
          >
            <span
              className={[
                styles.triggerText,
                !activeOption && placeholder ? styles.triggerPlaceholder : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {displayText}
            </span>
            <span
              className={[
                styles.triggerChevron,
                isOpen ? styles.triggerChevronRotated : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ChevronDownIcon />
            </span>
          </button>

          {/* Floating Popover Options Menu */}
          {isOpen ? (
            <div
              aria-labelledby={selectId}
              className={styles.popoverMenu}
              id={listboxId}
              role="listbox"
            >
              {parsedOptions.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <button
                    aria-selected={isSelected}
                    className={[
                      styles.dropdownItem,
                      isSelected ? styles.dropdownItemSelected : null,
                      opt.disabled ? styles.dropdownItemDisabled : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={opt.disabled}
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    role="option"
                    type="button"
                  >
                    <span>{opt.label}</span>
                    {isSelected ? (
                      <span className={styles.dropdownItemCheck}>
                        <CheckIcon />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            aria-live="polite"
            className={styles.error}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

function CalendarIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
      <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="15">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="15">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const RUMA_MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const RUMA_MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const RUMA_DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatIndonesianRupiah(value: number | string): string {
  if (value === "" || value === undefined || value === null) return "";
  const numeric = typeof value === "number" ? Math.floor(value) : parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(numeric)) return "";
  return new Intl.NumberFormat("id-ID").format(numeric);
}

export interface CurrencyInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onChange"> {
  value?: number | string;
  defaultValue?: number | string;
  onValueChange?: (numericValue: number, formattedString: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onChange,
      placeholder = "0",
      ...props
    },
    ref,
  ) => {
    const [displayVal, setDisplayVal] = useState<string>(() => {
      const init = value ?? defaultValue;
      return init !== undefined && init !== null ? formatIndonesianRupiah(init) : "";
    });

    useEffect(() => {
      if (value !== undefined) {
        setDisplayVal(formatIndonesianRupiah(value));
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      const numeric = raw ? parseInt(raw, 10) : 0;
      const formatted = raw ? formatIndonesianRupiah(numeric) : "";

      if (value === undefined) {
        setDisplayVal(formatted);
      }
      onValueChange?.(numeric, formatted);
      onChange?.(e);
    };

    return (
      <Input
        inputMode="numeric"
        leftIcon={<span className={styles.currencyPrefix}>Rp</span>}
        onChange={handleInputChange}
        placeholder={placeholder}
        ref={ref}
        type="text"
        value={value !== undefined ? formatIndonesianRupiah(value) : displayVal}
        {...props}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

function parseIsoDate(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return { year: parts[0], month: parts[1] - 1, day: parts[2] };
  }
  return null;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 1) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 31;
}

function getFirstDayOfWeek(year: number, month: number): number {
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let y = year;
  const m = month + 1;
  if (m < 3) y -= 1;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + 1) % 7;
}

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string; // "YYYY-MM-DD"
  defaultValue?: string; // "YYYY-MM-DD"
  min?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (dateString: string, date: Date) => void;
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      error,
      hint,
      id,
      label,
      name,
      onChange,
      onDateChange,
      placeholder = "Pilih tanggal...",
      required,
      value,
    },
    ref,
  ) => {
    const generatedId = useId();
    const datePickerId = id || `datepicker-${generatedId}`;
    const hintId = `${datePickerId}-hint`;
    const errorId = `${datePickerId}-error`;

    const initialDateStr = value ?? defaultValue ?? "";
    const [selectedDateStr, setSelectedDateStr] = useState<string>(initialDateStr);
    const [isOpen, setIsOpen] = useState(false);

    const initialParsed = parseIsoDate(initialDateStr);
    const [viewYear, setViewYear] = useState<number>(() => initialParsed?.year ?? 2026);
    const [viewMonth, setViewMonth] = useState<number>(() => initialParsed?.month ?? 10);
    const [todayInfo, setTodayInfo] = useState<{ year: number; month: number; day: number } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const now = new Date();
      const currentY = now.getFullYear();
      const currentM = now.getMonth();
      const currentD = now.getDate();
      setTodayInfo({ year: currentY, month: currentM, day: currentD });

      if (!initialDateStr) {
        setViewYear(currentY);
        setViewMonth(currentM);
      }
    }, [initialDateStr]);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedDateStr(value);
        const parsed = parseIsoDate(value);
        if (parsed) {
          setViewYear(parsed.year);
          setViewMonth(parsed.month);
        }
      }
    }, [value]);

    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    const activeParsed = parseIsoDate(selectedDateStr);

    const displayText = activeParsed
      ? `${activeParsed.day} ${RUMA_MONTH_NAMES[activeParsed.month]} ${activeParsed.year}`
      : "";

    const handleSelectDate = (y: number, m: number, d: number) => {
      const yStr = y;
      const mStr = String(m + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const resultStr = `${yStr}-${mStr}-${dStr}`;

      if (value === undefined) {
        setSelectedDateStr(resultStr);
      }

      setIsOpen(false);

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = resultStr;
        const event = new Event("change", { bubbles: true });
        hiddenInputRef.current.dispatchEvent(event);
      }

      onDateChange?.(resultStr, new Date(y, m, d));
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewMonth((prev) => {
        if (prev === 0) {
          setViewYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      });
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewMonth((prev) => {
        if (prev === 11) {
          setViewYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });
    };

    const handleQuickPreset = (preset: "today" | "next_month", e: React.MouseEvent) => {
      e.stopPropagation();
      const now = new Date();
      if (preset === "today") {
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        handleSelectDate(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (preset === "next_month") {
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        setViewYear(nextMonthDate.getFullYear());
        setViewMonth(nextMonthDate.getMonth());
        handleSelectDate(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1);
      }
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayIndex = getFirstDayOfWeek(viewYear, viewMonth);
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const isCurrentMonthView =
      todayInfo !== null && todayInfo.year === viewYear && todayInfo.month === viewMonth;
    const todayDate = todayInfo ? todayInfo.day : null;

    const selYear = activeParsed ? activeParsed.year : null;
    const selMonth = activeParsed ? activeParsed.month : null;
    const selDate = activeParsed ? activeParsed.day : null;

    const prevDays: number[] = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevDays.push(daysInPrevMonth - i);
    }

    const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const totalRendered = firstDayIndex + daysInMonth;
    const nextMonthCells = (totalRendered <= 35 ? 35 : 42) - totalRendered;
    const nextDays = Array.from({ length: nextMonthCells }, (_, i) => i + 1);

    return (
      <div className={styles.field} ref={containerRef}>
        {label ? (
          <label className={styles.label} htmlFor={datePickerId}>
            {label}
            {required ? <span className={styles.requiredIndicator}>*</span> : null}
          </label>
        ) : null}

        <div className={styles.datePickerWrap}>
          <input
            id={datePickerId}
            name={name}
            onChange={onChange}
            ref={(node) => {
              hiddenInputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) (ref as any).current = node;
            }}
            type="hidden"
            value={value !== undefined ? value : selectedDateStr}
          />

          <button
            aria-describedby={
              [error ? errorId : null, hint ? hintId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-invalid={Boolean(error)}
            className={[
              styles.datePickerTrigger,
              isOpen ? styles.isOpen : null,
              error ? styles.invalid : null,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
          >
            <div className={styles.datePickerTriggerLeft}>
              <span className={styles.datePickerTriggerIcon}>
                <CalendarIcon />
              </span>
              <span
                className={
                  displayText ? styles.datePickerValueText : styles.datePickerPlaceholder
                }
              >
                {displayText || placeholder}
              </span>
            </div>
            <span
              className={[
                styles.triggerChevron,
                isOpen ? styles.triggerChevronRotated : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ChevronDownIcon />
            </span>
          </button>

          {isOpen ? (
            <div
              aria-label="Kalender Pilih Tanggal"
              className={styles.datePickerPopover}
              role="dialog"
            >
              <div className={styles.rdpHead}>
                <button
                  aria-label="Bulan Sebelumnya"
                  className={styles.rdpNavBtn}
                  onClick={handlePrevMonth}
                  type="button"
                >
                  <ChevronLeftIcon />
                </button>
                <span className={styles.rdpTitle}>
                  {RUMA_MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  aria-label="Bulan Berikutnya"
                  className={styles.rdpNavBtn}
                  onClick={handleNextMonth}
                  type="button"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              <div className={styles.rdpWeekdays}>
                {RUMA_DAY_NAMES.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className={styles.rdpDaysGrid}>
                {prevDays.map((d) => (
                  <button
                    className={[styles.rdpDayBtn, styles.rdpDayOtherMonth].join(" ")}
                    disabled
                    key={`prev-${d}`}
                    tabIndex={-1}
                    type="button"
                  >
                    {d}
                  </button>
                ))}
                {currentDays.map((d) => {
                  const isToday = isCurrentMonthView && d === todayDate;
                  const isSelected =
                    selYear === viewYear && selMonth === viewMonth && selDate === d;
                  return (
                    <button
                      className={[
                        styles.rdpDayBtn,
                        isToday ? styles.rdpDayToday : null,
                        isSelected ? styles.rdpDaySelected : null,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={`curr-${d}`}
                      onClick={() => handleSelectDate(viewYear, viewMonth, d)}
                      type="button"
                    >
                      {d}
                    </button>
                  );
                })}
                {nextDays.map((d) => (
                  <button
                    className={[styles.rdpDayBtn, styles.rdpDayOtherMonth].join(" ")}
                    disabled
                    key={`next-${d}`}
                    tabIndex={-1}
                    type="button"
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className={styles.rdpFooter}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className={styles.rdpPresetBtn}
                    onClick={(e) => handleQuickPreset("today", e)}
                    type="button"
                  >
                    Hari Ini
                  </button>
                  <button
                    className={styles.rdpPresetBtn}
                    onClick={(e) => handleQuickPreset("next_month", e)}
                    type="button"
                  >
                    Awal Bln Depan
                  </button>
                </div>
                <span className={styles.rdpNoteText}>
                  {activeParsed
                    ? `${activeParsed.day} ${RUMA_MONTH_SHORT[activeParsed.month]} ${activeParsed.year}`
                    : ""}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            aria-live="polite"
            className={styles.error}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p className={styles.hint} id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      disabled,
      error,
      hint,
      id,
      label,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const radioId = id || `radio-${generatedId}`;
    const hintId = `${radioId}-hint`;
    const errorId = `${radioId}-error`;

    const [isChecked, setIsChecked] = useState(Boolean(checked ?? defaultChecked));

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        className={[
          styles.radioField,
          disabled ? styles.checkboxDisabled : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor={radioId}
      >
        <input
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={Boolean(error)}
          checked={checked !== undefined ? checked : isChecked}
          className={styles.visuallyHiddenCheckbox}
          disabled={disabled}
          id={radioId}
          onChange={handleChange}
          ref={ref}
          type="radio"
          {...props}
        />
        <span
          aria-hidden="true"
          className={[
            styles.radioControl,
            (checked !== undefined ? checked : isChecked)
              ? styles.radioControlChecked
              : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.radioDot} />
        </span>
        {label || hint ? (
          <span className={styles.radioTextWrapper}>
            {label ? <span className={styles.radioLabel}>{label}</span> : null}
            {hint ? (
              <span className={styles.radioHint} id={hintId}>
                {hint}
              </span>
            ) : null}
            {error ? (
              <span className={styles.error} id={errorId}>
                {error}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);

Radio.displayName = "Radio";

export interface RadioCardProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
}

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(
  (
    {
      className,
      disabled,
      id,
      label,
      description,
      icon,
      badge,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const radioId = id || `radiocard-${generatedId}`;

    const [isChecked, setIsChecked] = useState(Boolean(checked ?? defaultChecked));

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const active = checked !== undefined ? checked : isChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        className={[
          styles.radioCard,
          active ? styles.radioCardChecked : null,
          disabled ? styles.radioCardDisabled : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor={radioId}
      >
        <input
          checked={active}
          className={styles.visuallyHiddenCheckbox}
          disabled={disabled}
          id={radioId}
          onChange={handleChange}
          ref={ref}
          type="radio"
          {...props}
        />
        {icon ? <span className={styles.radioCardIcon}>{icon}</span> : null}
        <span className={styles.radioCardBody}>
          <span className={styles.radioCardLabel}>{label}</span>
          {description ? (
            <span className={styles.radioCardDescription}>{description}</span>
          ) : null}
        </span>
        {badge ? <span className={styles.radioCardBadge}>{badge}</span> : null}
      </label>
    );
  },
);

RadioCard.displayName = "RadioCard";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      disabled,
      error,
      hint,
      id,
      label,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const switchId = id || `switch-${generatedId}`;
    const hintId = `${switchId}-hint`;
    const errorId = `${switchId}-error`;

    const [isChecked, setIsChecked] = useState(Boolean(checked ?? defaultChecked));

    useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const active = checked !== undefined ? checked : isChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        className={[
          styles.switchField,
          disabled ? styles.switchDisabled : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        htmlFor={switchId}
      >
        <input
          aria-checked={active}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={Boolean(error)}
          checked={active}
          className={styles.visuallyHiddenCheckbox}
          disabled={disabled}
          id={switchId}
          onChange={handleChange}
          ref={ref}
          role="switch"
          type="checkbox"
          {...props}
        />
        <span
          aria-hidden="true"
          className={[
            styles.switchTrack,
            active ? styles.switchTrackChecked : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.switchThumb} />
        </span>
        {label || hint ? (
          <span className={styles.radioTextWrapper}>
            {label ? <span className={styles.radioLabel}>{label}</span> : null}
            {hint ? (
              <span className={styles.radioHint} id={hintId}>
                {hint}
              </span>
            ) : null}
            {error ? (
              <span className={styles.error} id={errorId}>
                {error}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);

Switch.displayName = "Switch";

