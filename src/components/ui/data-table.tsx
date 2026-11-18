"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PopoverSelect } from "@/components/ui/popover-select";
import styles from "./data-table.module.css";

export const DATA_TABLE_DEFAULT_PAGE_SIZE = 20;
export const DATA_TABLE_MAX_PAGE_SIZE = 100;
const PAGE_SIZE_CHOICES = [10, 20, 50, 100];
const SKELETON_ROWS = 5;

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  hideHeader?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption: string;
  toolbar?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyText?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function clampPageSize(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DATA_TABLE_DEFAULT_PAGE_SIZE;
  return Math.min(DATA_TABLE_MAX_PAGE_SIZE, Math.max(1, Math.floor(value)));
}

export function getPageCount(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  return Math.max(1, Math.ceil(total / clampPageSize(pageSize)));
}

export function clampPage(page: number | undefined, pageCount: number): number {
  if (page === undefined || !Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.floor(page)), Math.max(1, pageCount));
}

export function getPageWindow(page: number, pageCount: number, size = 5): number[] {
  const count = Math.min(size, pageCount);
  let start = Math.max(1, page - Math.floor(count / 2));
  if (start + count - 1 > pageCount) start = Math.max(1, pageCount - count + 1);
  return Array.from({ length: count }, (_, index) => start + index);
}

export function RowActionLink({
  href,
  label = "Detail",
  ariaLabel,
}: {
  href: string;
  label?: string;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className={styles.rowAction} aria-label={ariaLabel}>
      {label}
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

function alignClass(align: DataTableColumn<unknown>["align"]): string {
  if (align === "right") return styles.alignRight;
  if (align === "center") return styles.alignCenter;
  return "";
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  toolbar,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "Belum ada data",
  emptyText = "Data akan muncul di sini setelah tersedia.",
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className = "",
}: DataTableProps<T>) {
  const captionId = `${useId()}-caption`;
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(clampPageSize(pageSize));

  const size = clampPageSize(pageSize ?? internalPageSize);
  const serverDriven = total !== undefined;
  const totalCount = serverDriven ? Math.max(0, total) : rows.length;
  const pageCount = getPageCount(totalCount, size);
  const current = clampPage(page ?? internalPage, pageCount);

  const visibleRows = serverDriven ? rows.slice(0, size) : rows.slice((current - 1) * size, current * size);
  const from = totalCount === 0 ? 0 : (current - 1) * size + 1;
  const to = totalCount === 0 ? 0 : Math.min(totalCount, from + visibleRows.length - 1);

  const goTo = (next: number) => {
    const target = clampPage(next, pageCount);
    setInternalPage(target);
    onPageChange?.(target);
  };

  const changeSize = (value: number) => {
    const next = clampPageSize(value);
    setInternalPageSize(next);
    setInternalPage(1);
    onPageSizeChange?.(next);
    onPageChange?.(1);
  };

  const showFooter = !loading && !error && totalCount > 0;
  const sizeOptions = PAGE_SIZE_CHOICES.filter((choice) => choice <= DATA_TABLE_MAX_PAGE_SIZE).map((choice) => ({
    value: String(choice),
    label: `${choice} / halaman`,
  }));

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}

      <div
        className={styles.scroll}
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        aria-busy={loading || undefined}
      >
        <table className={styles.table}>
          <caption id={captionId} className={styles.srOnly}>
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${styles.th} ${alignClass(column.align)}`.trim()}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.hideHeader ? <span className={styles.srOnly}>{column.header}</span> : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      <span className={styles.skeleton} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className={styles.state} role="alert">
                  <span className={styles.stateTitle}>Data gagal dimuat</span>
                  {error}
                  {onRetry && (
                    <div>
                      <span className={styles.stateAction}>
                        <Button size="xs" variant="secondary-ghost" onClick={onRetry}>
                          Coba Lagi
                        </Button>
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {!loading && !error && visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className={styles.state}>
                  <span className={styles.stateTitle}>{emptyTitle}</span>
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              visibleRows.map((row) => (
                <tr key={getRowKey(row)} className={styles.row}>
                  {columns.map((column) => (
                    <td key={column.key} className={`${styles.td} ${alignClass(column.align)}`.trim()}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <span className={styles.srOnly} role="status">
          Memuat data
        </span>
      )}

      {showFooter && (
        <div className={styles.footer}>
          <span className={styles.summary}>
            Menampilkan {from}-{to} dari {totalCount}
          </span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <PopoverSelect
              title="Jumlah baris per halaman"
              size="sm"
              shape="pill"
              align="right"
              inline
              options={sizeOptions}
              value={String(size)}
              onChange={(value) => changeSize(Number(value))}
            />
            <nav className={styles.pager} aria-label="Navigasi halaman">
              <button
                type="button"
                className={styles.pageBtn}
                disabled={current <= 1}
                onClick={() => goTo(current - 1)}
                aria-label="Halaman sebelumnya"
              >
                Sebelumnya
              </button>
              {getPageWindow(current, pageCount).map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`${styles.pageBtn} ${number === current ? styles.pageBtnActive : ""}`.trim()}
                  aria-current={number === current ? "page" : undefined}
                  aria-label={`Halaman ${number}`}
                  onClick={() => goTo(number)}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageBtn}
                disabled={current >= pageCount}
                onClick={() => goTo(current + 1)}
                aria-label="Halaman berikutnya"
              >
                Berikutnya
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
