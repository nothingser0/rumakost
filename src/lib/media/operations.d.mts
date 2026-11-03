export type MediaActor = {
  id: string;
  role: "OWNER" | "STAFF" | "TENANT";
};

export type UploadMetadata = {
  ticketId: string;
  commentId?: string;
  uploadBatchId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds?: number;
  idempotencyKey: string;
};

export type StoredUpload = {
  id: string;
  objectKey: string;
  uploadStatus: "PENDING_UPLOAD" | "AVAILABLE" | "DELETE_PENDING" | "DELETED" | "FAILED";
  createdAt: Date | string;
  created: boolean;
};

export type UploadRecord = Omit<StoredUpload, "created"> & {
  mimeType: string;
  sizeBytes: string | number;
  durationSeconds: number | null;
};

export type MediaRepository = {
  createUploadIntent(input: Record<string, unknown>): Promise<StoredUpload>;
  getUploadForFinalize(input: Record<string, unknown>): Promise<UploadRecord | null>;
  queueInvalidUpload(id: string): Promise<void>;
  finalizeUpload(input: Record<string, unknown>): Promise<boolean>;
  getAttachmentForDownload(input: Record<string, unknown>): Promise<(UploadRecord & { deleteAfter: Date | string | null }) | null>;
  prepareMediaCleanup(input: { now: Date; limit: number }): Promise<Array<{ id: string; objectKey: string }>>;
  markAttachmentDeleted(id: string): Promise<boolean>;
};

export type MediaStorage = {
  createUploadUrl(input: { objectKey: string; contentType: string; sizeBytes: number; signingDate: Date; expiresIn: number }): Promise<string>;
  createDownloadUrl(input: { objectKey: string; contentType: string; signingDate: Date; expiresIn: number }): Promise<string>;
  readObject(input: { objectKey: string; maxBytes: number }): Promise<{ bytes: Uint8Array; sizeBytes: number } | null>;
  deleteObject(input: { objectKey: string }): Promise<void>;
};

export const MAX_PHOTO_BYTES: number;
export const MAX_VIDEO_BYTES: number;
export const MAX_TICKET_BYTES: number;
export const MAX_PROJECT_BYTES: number;
export const MAX_VIDEO_DURATION_SECONDS: number;
export const MAX_UPLOAD_INTENTS_PER_MINUTE: number;
export const VIDEO_MIME_TYPES: readonly string[];
export const UPLOAD_URL_TTL_SECONDS: number;
export const DOWNLOAD_URL_TTL_SECONDS: number;
export const INCOMPLETE_UPLOAD_RETENTION_MS: number;
export const MAX_CLEANUP_BATCH_SIZE: number;
export const VIDEO_MIME_TYPES: readonly string[];
export function validateUploadMetadata(input: UploadMetadata): void;
export function detectMedia(bytes: Uint8Array): { mimeType: string; durationSeconds: number | null } | null;
export function validateStoredMedia(record: UploadRecord, bytes: Uint8Array, actualSizeBytes: number): void;
export function planMediaCleanup(records: Array<{ uploadStatus: string; deleteAfter?: Date | string | null; createdAt: Date | string }>, now?: Date): Array<unknown>;
export function createUploadIntent(args: { actor: MediaActor; input: unknown; repository: MediaRepository; storage: MediaStorage; now?: Date }): Promise<{ attachmentId: string; uploadUrl: string; expiresAt: string }>;
export function finalizeUpload(args: { actor: MediaActor; input: unknown; repository: MediaRepository; storage: MediaStorage }): Promise<{ attachmentId: string; uploadStatus: "AVAILABLE" }>;
export function requestAttachment(args: { actor: MediaActor; input: unknown; repository: MediaRepository; storage: MediaStorage; now?: Date }): Promise<{ attachmentId: string; downloadUrl: string; expiresAt: string }>;
export function cleanupTicketMedia(args: { repository: MediaRepository; storage: MediaStorage; now?: Date }): Promise<{ selected: number; deleted: number; failed: number }>;
