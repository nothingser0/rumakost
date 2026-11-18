"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import styles from "./media-upload.module.css";

/* ==========================================================================
   Constants & Invariants (FSD §2.2, SEC-05, CMP-16)
   ========================================================================== */

export const DEFAULT_MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MiB
export const DEFAULT_MAX_VIDEO_BYTES = 12 * 1024 * 1024; // 12 MiB
export const DEFAULT_MAX_PHOTOS = 4;
export const DEFAULT_MAX_VIDEOS = 1;
export const DEFAULT_MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40 MiB
export const DEFAULT_MAX_VIDEO_DURATION_SECONDS = 30;

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
] as const;

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_PHOTO_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
] as const;

/* ==========================================================================
   SVG Icons (Zero-Emoji Craftsmanship)
   ========================================================================== */

function UploadCloudIcon() {
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
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <rect width="14" height="14" x="2" y="5" rx="2" />
      <polygon points="22 7 16 12 22 17 22 7" fill="currentColor" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="13"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function AlertCircleIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

/* ==========================================================================
   Type Definitions
   ========================================================================== */

export interface MediaUploadItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  mimeType: string;
  previewUrl?: string;
  status: "pending" | "uploading" | "available" | "error";
  progress?: number;
  error?: string;
}

export interface MediaUploadLimits {
  maxPhotoBytes: number;
  maxVideoBytes: number;
  maxPhotos: number;
  maxVideos: number;
  maxTotalBytes: number;
  maxVideoDurationSeconds: number;
}

export interface FileValidationResult {
  valid: boolean;
  code?:
    | "INVALID_MIME"
    | "PHOTO_TOO_LARGE"
    | "VIDEO_TOO_LARGE"
    | "MAX_PHOTOS_REACHED"
    | "MAX_VIDEOS_REACHED"
    | "TOTAL_TOO_LARGE";
  error?: string;
}

export interface MediaUploadProps {
  items: MediaUploadItem[];
  onChange?: (items: MediaUploadItem[]) => void;
  onAddFiles?: (files: File[]) => void;
  onRemoveItem?: (id: string) => void;
  required?: boolean; // Default: true (F-07: Minimal 1 media)
  disabled?: boolean;
  limits?: Partial<MediaUploadLimits>;
  error?: string | null;
  className?: string;
  id?: string;
  label?: string;
  hint?: string;
}

/* ==========================================================================
   Helper Functions (Pure Validation & Formatting)
   ========================================================================== */

export function isPhotoMimeType(mime: string): boolean {
  if (!mime) return false;
  return (ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(mime.toLowerCase());
}

export function isVideoMimeType(mime: string): boolean {
  if (!mime) return false;
  return (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mime.toLowerCase());
}

export function isSupportedMimeType(mime: string): boolean {
  return isPhotoMimeType(mime) || isVideoMimeType(mime);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function hasMetMinimumRequirement(
  items: MediaUploadItem[],
  required = true,
): boolean {
  if (!required) return true;
  return items.some((item) => item.status !== "error");
}

export function validateCandidateFile(
  file: { name: string; size: number; type: string },
  currentItems: MediaUploadItem[],
  customLimits?: Partial<MediaUploadLimits>,
): FileValidationResult {
  const limits: MediaUploadLimits = {
    maxPhotoBytes: customLimits?.maxPhotoBytes ?? DEFAULT_MAX_PHOTO_BYTES,
    maxVideoBytes: customLimits?.maxVideoBytes ?? DEFAULT_MAX_VIDEO_BYTES,
    maxPhotos: customLimits?.maxPhotos ?? DEFAULT_MAX_PHOTOS,
    maxVideos: customLimits?.maxVideos ?? DEFAULT_MAX_VIDEOS,
    maxTotalBytes: customLimits?.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES,
    maxVideoDurationSeconds:
      customLimits?.maxVideoDurationSeconds ?? DEFAULT_MAX_VIDEO_DURATION_SECONDS,
  };

  const mime = file.type ? file.type.toLowerCase() : "";
  if (!isSupportedMimeType(mime)) {
    return {
      valid: false,
      code: "INVALID_MIME",
      error: `Format berkas "${file.name}" tidak didukung. Hanya menerima JPG, PNG, WebP, atau MP4/MOV.`,
    };
  }

  const isPhoto = isPhotoMimeType(mime);
  const isVideo = isVideoMimeType(mime);

  if (isPhoto && file.size > limits.maxPhotoBytes) {
    return {
      valid: false,
      code: "PHOTO_TOO_LARGE",
      error: `Foto "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal ${formatFileSize(limits.maxPhotoBytes)}.`,
    };
  }

  if (isVideo && file.size > limits.maxVideoBytes) {
    return {
      valid: false,
      code: "VIDEO_TOO_LARGE",
      error: `Video "${file.name}" (${formatFileSize(file.size)}) melebihi batas maksimal ${formatFileSize(limits.maxVideoBytes)}.`,
    };
  }

  const validItems = currentItems.filter((i) => i.status !== "error");
  const existingPhotos = validItems.filter((i) => isPhotoMimeType(i.mimeType));
  const existingVideos = validItems.filter((i) => isVideoMimeType(i.mimeType));

  if (isPhoto && existingPhotos.length >= limits.maxPhotos) {
    return {
      valid: false,
      code: "MAX_PHOTOS_REACHED",
      error: `Maksimal ${limits.maxPhotos} foto diperbolehkan per tiket.`,
    };
  }

  if (isVideo && existingVideos.length >= limits.maxVideos) {
    return {
      valid: false,
      code: "MAX_VIDEOS_REACHED",
      error: `Maksimal ${limits.maxVideos} video diperbolehkan per tiket.`,
    };
  }

  const currentTotalBytes = validItems.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  if (currentTotalBytes + file.size > limits.maxTotalBytes) {
    return {
      valid: false,
      code: "TOTAL_TOO_LARGE",
      error: `Total ukuran lampiran melebihi batas maksimal ${formatFileSize(limits.maxTotalBytes)}.`,
    };
  }

  return { valid: true };
}

/* ==========================================================================
   MediaUpload Component (CMP-16)
   ========================================================================== */

export function MediaUpload({
  items,
  onChange,
  onAddFiles,
  onRemoveItem,
  required = true,
  disabled = false,
  limits,
  error = null,
  className = "",
  id,
  label = "Lampiran Bukti Foto / Video",
  hint,
}: MediaUploadProps) {
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const effectiveLimits: MediaUploadLimits = {
    maxPhotoBytes: limits?.maxPhotoBytes ?? DEFAULT_MAX_PHOTO_BYTES,
    maxVideoBytes: limits?.maxVideoBytes ?? DEFAULT_MAX_VIDEO_BYTES,
    maxPhotos: limits?.maxPhotos ?? DEFAULT_MAX_PHOTOS,
    maxVideos: limits?.maxVideos ?? DEFAULT_MAX_VIDEOS,
    maxTotalBytes: limits?.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES,
    maxVideoDurationSeconds: limits?.maxVideoDurationSeconds ?? DEFAULT_MAX_VIDEO_DURATION_SECONDS,
  };

  const validItems = items.filter((i) => i.status !== "error");
  const photoCount = validItems.filter((i) => isPhotoMimeType(i.mimeType)).length;
  const videoCount = validItems.filter((i) => isVideoMimeType(i.mimeType)).length;
  const totalBytes = validItems.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  const requirementMet = hasMetMinimumRequirement(items, required);

  const displayError = error ?? localError;

  const processFiles = (fileList: FileList | File[]) => {
    if (disabled) return;
    setLocalError(null);

    const files = Array.from(fileList);
    const validNewItems: MediaUploadItem[] = [];
    const accumulated = [...items];

    for (const file of files) {
      const check = validateCandidateFile(file, accumulated, effectiveLimits);
      if (!check.valid) {
        setLocalError(check.error ?? "Berkas tidak valid.");
        return;
      }

      const newItem: MediaUploadItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        previewUrl: isPhotoMimeType(file.type) ? URL.createObjectURL(file) : undefined,
        status: "available",
      };

      validNewItems.push(newItem);
      accumulated.push(newItem);
    }

    if (validNewItems.length > 0) {
      onChange?.(accumulated);
      onAddFiles?.(files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset value so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDropzoneClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (itemId: string) => {
    if (disabled) return;
    setLocalError(null);
    const updated = items.filter((i) => i.id !== itemId);
    onChange?.(updated);
    onRemoveItem?.(itemId);
  };

  const renderStatusBadge = (status: MediaUploadItem["status"]) => {
    switch (status) {
      case "available":
        return <Badge size="sm" variant="success">Tersedia</Badge>;
      case "uploading":
        return <Badge size="sm" variant="brand" pulsing>Mengunggah...</Badge>;
      case "pending":
        return <Badge size="sm" variant="neutral">Menunggu</Badge>;
      case "error":
        return <Badge size="sm" variant="danger">Gagal</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.wrap} ${className}`.trim()} role="region" aria-label={label}>
      {/* Header & Status Indicator */}
      <div className={styles.header}>
        <div className={styles.labelGroup}>
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
          {required && (
            <Badge size="sm" variant={requirementMet ? "success" : "warning"}>
              {requirementMet ? "Syarat Minimal Terpenuhi" : "Wajib Minimal 1"}
            </Badge>
          )}
        </div>
        <div className={styles.counter}>
          <span>Foto: {photoCount}/{effectiveLimits.maxPhotos}</span>
          {" · "}
          <span>Video: {videoCount}/{effectiveLimits.maxVideos}</span>
          {" · "}
          <span>Total: {formatFileSize(totalBytes)}/{formatFileSize(effectiveLimits.maxTotalBytes)}</span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(",")}
        multiple
        disabled={disabled}
        onChange={handleInputChange}
        className={styles.hiddenInput}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
      />

      {/* Dropzone Area */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label="Area unggah berkas. Tekan Enter untuk memilih berkas."
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ""} ${disabled ? styles.disabled : ""}`.trim()}
        onClick={handleDropzoneClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.dropzoneLeft}>
          <div className={styles.iconBox}>
            <UploadCloudIcon />
          </div>
          <div className={styles.dropzoneText}>
            <span className={styles.title}>Unggah Foto atau Video Kerusakan</span>
            <span className={styles.subtitle}>
              Format: JPG, PNG, WebP (maks. {formatFileSize(effectiveLimits.maxPhotoBytes)}) · MP4, MOV (maks. {formatFileSize(effectiveLimits.maxVideoBytes)}).
            </span>
          </div>
        </div>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          className={styles.chooseBtn}
          aria-hidden="true"
        >
          Pilih Berkas
        </button>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className={styles.alert} role="alert" aria-live="assertive">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <AlertCircleIcon />
            <span>{displayError}</span>
          </div>
          <button
            type="button"
            className={styles.alertDismiss}
            onClick={() => setLocalError(null)}
            aria-label="Tutup pesan peringatan"
          >
            ×
          </button>
        </div>
      )}

      {/* Preview / Attachment Items */}
      {items.length > 0 && (
        <div className={styles.previewList} aria-label="Daftar berkas terlampir">
          {items.map((item) => (
            <div key={item.id} className={styles.previewItem}>
              <div className={styles.previewLeft}>
                <div className={styles.thumbBox}>
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={`Pratinjau ${item.fileName}`}
                      className={styles.thumbImg}
                    />
                  ) : isVideoMimeType(item.mimeType) ? (
                    <VideoIcon />
                  ) : (
                    <ImageIcon />
                  )}
                </div>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName} title={item.fileName}>
                    {item.fileName}
                  </span>
                  <span className={styles.fileMeta}>
                    <span>{formatFileSize(item.fileSize)}</span>
                    {item.error ? (
                      <span style={{ color: "#DC2626" }}>· {item.error}</span>
                    ) : (
                      <span>· {renderStatusBadge(item.status)}</span>
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.previewRight}>
                <button
                  type="button"
                  className={styles.removeBtn}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                  aria-label={`Hapus berkas ${item.fileName}`}
                  title="Hapus berkas"
                >
                  <TrashIcon />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screen reader live region */}
      <div className={styles.srOnly} role="status" aria-live="polite">
        {items.length === 0
          ? "Belum ada berkas terlampir."
          : `${items.length} berkas terlampir. ${requirementMet ? "Syarat wajib terpenuhi." : "Syarat wajib belum terpenuhi."}`}
      </div>
    </div>
  );
}

export default MediaUpload;
