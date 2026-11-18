"use client";

import {
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SegmentedProgress,
  DEFAULT_TICKET_STEPS,
} from "@/components/ui/segmented-progress";
import styles from "./ticket-thread.module.css";

/* ==========================================================================
   Types & Domain Definitions (CMP-18 / FSD §2.2 / §4.2)
   ========================================================================== */

export type TicketStatus =
  | "RECEIVED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "INSPECTION"
  | "RESOLVED"
  | "CANCELLED";

export type TicketRole = "OWNER" | "STAFF" | "TENANT";

export type CommentVisibility = "TENANT_VISIBLE" | "INTERNAL";

export interface TicketAttachmentItem {
  id: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface TicketCommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: TicketRole;
  body: string;
  visibility: CommentVisibility;
  createdAt: string | Date;
  attachments?: TicketAttachmentItem[];
}

export interface TicketStatusEventItem {
  id: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  actorName: string;
  actorRole: TicketRole | "SYSTEM";
  reason?: string | null;
  occurredAt: string | Date;
}

export interface TicketThreadProps {
  currentStatus: TicketStatus;
  viewerRole: TicketRole;
  comments: TicketCommentItem[];
  statusEvents?: TicketStatusEventItem[];
  onSubmitComment?: (input: { body: string; visibility: CommentVisibility }) => void;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
  cancellationReason?: string | null;
}

/* ==========================================================================
   SVG Icons (Zero-Emoji Craftsmanship)
   ========================================================================== */

function MessagesSquareIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="13"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="13"
    >
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" />
    </svg>
  );
}

function FileTextIcon() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

function AlertOctagonIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

/* ==========================================================================
   Pure Domain Helpers
   ========================================================================== */

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  RECEIVED: "Diterima",
  ASSIGNED: "Ditugaskan",
  IN_PROGRESS: "Dikerjakan",
  INSPECTION: "Diperiksa",
  RESOLVED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const TICKET_STEP_INDEX_MAP: Record<TicketStatus, number> = {
  RECEIVED: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  INSPECTION: 4,
  RESOLVED: 5,
  CANCELLED: 1,
};

export function getTicketStatusStep(status: TicketStatus): number {
  return TICKET_STEP_INDEX_MAP[status] ?? 1;
}

/**
 * Filter comments so internal notes are NEVER visible to Tenant role.
 */
export function filterVisibleComments(
  comments: TicketCommentItem[],
  viewerRole: TicketRole,
): TicketCommentItem[] {
  if (viewerRole === "TENANT") {
    return comments.filter((c) => c.visibility === "TENANT_VISIBLE");
  }
  return comments;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

export function formatDateLabel(date: string | Date): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
}

/* ==========================================================================
   TicketThread Component (CMP-18)
   ========================================================================== */

export function TicketThread({
  currentStatus,
  viewerRole,
  comments,
  statusEvents = [],
  onSubmitComment,
  disabled = false,
  className = "",
  readOnly = false,
  cancellationReason,
}: TicketThreadProps) {
  const checkboxId = useId();
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  // Security barrier: Filter internal notes for Tenant viewer
  const visibleComments = filterVisibleComments(comments, viewerRole);

  const canPostInternal = viewerRole === "OWNER" || viewerRole === "STAFF";
  const isClosed = currentStatus === "CANCELLED" || currentStatus === "RESOLVED" || readOnly;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || disabled || isClosed) return;

    // Tenant can NEVER post INTERNAL visibility
    const effectiveVisibility: CommentVisibility =
      canPostInternal && isInternal ? "INTERNAL" : "TENANT_VISIBLE";

    onSubmitComment?.({
      body: trimmed,
      visibility: effectiveVisibility,
    });

    setCommentText("");
    setIsInternal(false);
  };

  // Combine comments and status events chronologically
  type TimelineItem =
    | { type: "comment"; data: TicketCommentItem; time: number }
    | { type: "event"; data: TicketStatusEventItem; time: number };

  const timelineItems: TimelineItem[] = [
    ...visibleComments.map((c) => ({
      type: "comment" as const,
      data: c,
      time: new Date(c.createdAt).getTime(),
    })),
    ...statusEvents.map((e) => ({
      type: "event" as const,
      data: e,
      time: new Date(e.occurredAt).getTime(),
    })),
  ].sort((a, b) => a.time - b.time);

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      {/* 1. Stepper & Progress Section */}
      <section className={styles.stepperCard} aria-label="Status penanganan tiket">
        <div className={styles.stepperHeader}>
          <div className={styles.stepperTitle}>
            <span>Progres Penanganan Tiket</span>
            <Badge
              size="sm"
              variant={
                currentStatus === "RESOLVED"
                  ? "success"
                  : currentStatus === "CANCELLED"
                    ? "danger"
                    : "brand"
              }
            >
              {TICKET_STATUS_LABELS[currentStatus]}
            </Badge>
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted, #64748B)" }}>
            {viewerRole === "OWNER"
              ? "Tampilan Pemilik"
              : viewerRole === "STAFF"
                ? "Tampilan Staf"
                : "Tampilan Penghuni"}
          </span>
        </div>

        {currentStatus === "CANCELLED" ? (
          <div className={styles.cancelledAlert} role="alert">
            <AlertOctagonIcon />
            <div>
              <strong>Tiket ini telah dibatalkan.</strong>
              {cancellationReason && <span> Alasan: {cancellationReason}</span>}
            </div>
          </div>
        ) : (
          <SegmentedProgress
            currentStep={getTicketStatusStep(currentStatus)}
            totalSteps={5}
            stepNames={DEFAULT_TICKET_STEPS}
            size="md"
          />
        )}
      </section>

      {/* 2. Timeline & Comment Stream */}
      <section className={styles.streamSection} aria-label="Aktivitas dan diskusi penanganan">
        <div className={styles.streamHeader}>
          <div className={styles.streamTitle}>
            <MessagesSquareIcon />
            <span>Aktivitas &amp; Catatan Penanganan</span>
          </div>
          <span className={styles.streamCount}>
            {visibleComments.length} Catatan
          </span>
        </div>

        <div className={styles.timelineList}>
          {timelineItems.length === 0 ? (
            <div className={styles.emptyStream}>Belum ada catatan aktivitas atau komentar.</div>
          ) : (
            timelineItems.map((item) => {
              if (item.type === "event") {
                const ev = item.data;
                const toLabel = TICKET_STATUS_LABELS[ev.toStatus];
                return (
                  <div key={ev.id} className={styles.statusEventRow}>
                    <div className={styles.statusEventLine} />
                    <span className={styles.statusEventBadge}>
                      <span>Status: {toLabel}</span>
                      <span>·</span>
                      <span>{ev.actorName}</span>
                      <span>·</span>
                      <span>{formatDateLabel(ev.occurredAt)}</span>
                    </span>
                    <div className={styles.statusEventLine} />
                  </div>
                );
              }

              const comment = item.data;
              const isInternalComment = comment.visibility === "INTERNAL";

              return (
                <div
                  key={comment.id}
                  className={`${styles.bubble} ${isInternalComment ? styles.bubbleInternal : ""}`.trim()}
                >
                  <div className={styles.bubbleHeader}>
                    <div className={styles.authorGroup}>
                      <span className={styles.authorAvatar} aria-hidden="true">
                        {getInitials(comment.authorName)}
                      </span>
                      <span className={styles.authorName}>{comment.authorName}</span>
                      {isInternalComment ? (
                        <Badge size="sm" variant="warning" className={styles.internalBadge}>
                          <LockIcon />
                          <span>Internal Note</span>
                        </Badge>
                      ) : (
                        <Badge
                          size="sm"
                          variant={
                            comment.authorRole === "OWNER"
                              ? "brand"
                              : comment.authorRole === "STAFF"
                                ? "neutral"
                                : "dark"
                          }
                        >
                          {comment.authorRole === "OWNER"
                            ? "Pemilik"
                            : comment.authorRole === "STAFF"
                              ? "Staf"
                              : "Penghuni"}
                        </Badge>
                      )}
                    </div>
                    <span className={styles.timestamp}>
                      {formatDateLabel(comment.createdAt)}
                    </span>
                  </div>

                  <p className={styles.commentBody}>{comment.body}</p>

                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className={styles.attachmentList}>
                      {comment.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.downloadUrl || att.previewUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.attachmentThumb}
                        >
                          <FileTextIcon />
                          <span>{att.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 3. Reply Composer Box */}
        {isClosed ? (
          <div className={styles.closedNotice}>
            Tiket berstatus terminal ({TICKET_STATUS_LABELS[currentStatus]}). Diskusi dan penambahan catatan telah dinonaktifkan.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.composer}>
            <label htmlFor="ticket-comment-input" className={styles.composerLabel}>
              Tambah Tanggapan / Catatan Penanganan
            </label>
            <textarea
              id="ticket-comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                canPostInternal
                  ? "Tulis tanggapan untuk penghuni atau centang Catatan Internal untuk staf..."
                  : "Tulis tanggapan atau informasi tambahan mengenai kendala..."
              }
              disabled={disabled}
              className={styles.textarea}
              rows={3}
            />

            <div className={styles.composerFooter}>
              {canPostInternal ? (
                <label htmlFor={checkboxId} className={styles.visibilityCheckbox}>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    disabled={disabled}
                  />
                  <span>Jadikan Catatan Internal (Hanya Staf &amp; Pemilik)</span>
                </label>
              ) : (
                <span style={{ fontSize: 11, color: "var(--text-muted, #64748B)" }}>
                  Tanggapan akan langsung terlihat oleh pengelola kost.
                </span>
              )}

              <Button
                type="submit"
                size="sm"
                variant="primary-orange"
                disabled={disabled || !commentText.trim()}
                leftIcon={<SendIcon />}
              >
                Kirim Balasan
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default TicketThread;
