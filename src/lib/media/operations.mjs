import { createHash } from "node:crypto";
import { DomainError } from "../errors/domain-error.mjs";
import {
  createUploadIntentSchema,
  finalizeUploadSchema,
  requestAttachmentSchema,
} from "../validation/operations.mjs";

export const PHOTO_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
export const VIDEO_MIME_TYPES = Object.freeze(["video/mp4", "video/quicktime"]);
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 12 * 1024 * 1024;
export const MAX_TICKET_BYTES = 40 * 1024 * 1024;
export const MAX_PROJECT_BYTES = 4_000_000_000;
export const MAX_VIDEO_DURATION_SECONDS = 30;
export const MAX_UPLOAD_INTENTS_PER_MINUTE = 10;
export const UPLOAD_URL_TTL_SECONDS = 5 * 60;
export const DOWNLOAD_URL_TTL_SECONDS = 60;
export const INCOMPLETE_UPLOAD_RETENTION_MS = 60 * 60 * 1000;
export const MAX_CLEANUP_BATCH_SIZE = 50;

const supportedMimeTypes = new Set([...PHOTO_MIME_TYPES, ...VIDEO_MIME_TYPES]);
const mp4Brands = new Set([
  "isom", "iso2", "iso3", "iso4", "iso5", "iso6", "iso7", "iso8", "iso9",
  "mp41", "mp42", "mp71", "avc1", "M4V ", "M4VH", "M4VP", "dash", "MSNV",
  "3gp4", "3gp5", "3gp6", "3g2a", "3g2b", "F4V ", "F4P ", "cmfc", "cmfs",
]);
const actorRoles = new Set(["OWNER", "STAFF", "TENANT"]);

function requireActor(actor) {
  if (!actor || typeof actor.id !== "string" || !actorRoles.has(actor.role)) {
    throw new DomainError("UNAUTHENTICATED");
  }
}

function parseInput(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

export function validateUploadMetadata(input) {
  if (!supportedMimeTypes.has(input.contentType)) {
    throw new DomainError("INVALID_MEDIA");
  }

  if (PHOTO_MIME_TYPES.includes(input.contentType)) {
    if (input.sizeBytes > MAX_PHOTO_BYTES || input.durationSeconds !== undefined) {
      throw new DomainError(input.sizeBytes > MAX_PHOTO_BYTES ? "FILE_TOO_LARGE" : "INVALID_MEDIA");
    }
    return;
  }

  if (
    input.sizeBytes > MAX_VIDEO_BYTES ||
    !Number.isSafeInteger(input.durationSeconds) ||
    input.durationSeconds < 1 ||
    input.durationSeconds > MAX_VIDEO_DURATION_SECONDS
  ) {
    throw new DomainError(input.sizeBytes > MAX_VIDEO_BYTES ? "FILE_TOO_LARGE" : "INVALID_MEDIA");
  }
}

function requestFingerprint(actorId, input) {
  const value = JSON.stringify({
    operation: "createUploadIntent",
    actorId,
    ticketId: input.ticketId,
    commentId: input.commentId ?? null,
    uploadBatchId: input.uploadBatchId,
    fileName: input.fileName,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    durationSeconds: input.durationSeconds ?? null,
  });
  return createHash("sha256").update(value).digest("hex");
}

function dateFrom(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) throw new DomainError("INTERNAL_ERROR");
  return date;
}

export async function createUploadIntent({ actor, input, repository, storage, now = new Date() }) {
  requireActor(actor);
  const data = parseInput(createUploadIntentSchema, input);
  validateUploadMetadata(data);

  const record = await repository.createUploadIntent({
    actorId: actor.id,
    actorRole: actor.role,
    ...data,
    requestHash: requestFingerprint(actor.id, data),
  });
  const createdAt = dateFrom(record.createdAt);
  const expiresAt = new Date(createdAt.valueOf() + UPLOAD_URL_TTL_SECONDS * 1000);
  const signingDate = dateFrom(now);
  const expiresIn = Math.min(
    UPLOAD_URL_TTL_SECONDS,
    Math.floor((expiresAt.valueOf() - signingDate.valueOf()) / 1000),
  );
  if (expiresIn < 1 || record.uploadStatus !== "PENDING_UPLOAD") {
    throw new DomainError("UPLOAD_INCOMPLETE");
  }

  let uploadUrl;
  try {
    uploadUrl = await storage.createUploadUrl({
      objectKey: record.objectKey,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      signingDate,
      expiresIn,
    });
  } catch {
    throw new DomainError("PROVIDER_UNAVAILABLE");
  }

  return {
    attachmentId: record.id,
    uploadUrl,
    expiresAt: expiresAt.toISOString(),
  };
}

function ascii(bytes, start, length) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function readBox(bytes, start, end) {
  if (start + 8 > end) return null;
  let size = bytes.readUInt32BE(start);
  const type = ascii(bytes, start + 4, 4);
  let headerSize = 8;
  if (size === 1) {
    if (start + 16 > end) return null;
    const largeSize = bytes.readBigUInt64BE(start + 8);
    if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    size = Number(largeSize);
    headerSize = 16;
  } else if (size === 0) {
    size = end - start;
  }

  if (size < headerSize || start + size > end) return null;
  return { type, start, end: start + size, payloadStart: start + headerSize };
}

function childBoxes(bytes, parent) {
  const boxes = [];
  for (let offset = parent.payloadStart; offset < parent.end;) {
    const box = readBox(bytes, offset, parent.end);
    if (!box) return null;
    boxes.push(box);
    offset = box.end;
  }
  return boxes;
}

function parseMovieHeader(bytes, box) {
  const versionOffset = box.payloadStart;
  if (versionOffset + 4 > box.end) return null;
  const version = bytes[versionOffset];
  let timescale;
  let duration;
  if (version === 0) {
    if (versionOffset + 20 > box.end) return null;
    timescale = bytes.readUInt32BE(versionOffset + 12);
    duration = bytes.readUInt32BE(versionOffset + 16);
  } else if (version === 1) {
    if (versionOffset + 32 > box.end) return null;
    timescale = bytes.readUInt32BE(versionOffset + 20);
    duration = bytes.readBigUInt64BE(versionOffset + 24);
  } else {
    return null;
  }
  if (timescale === 0 || duration === 0 || duration === 0xffffffff) return null;
  const seconds = Number(duration) / timescale;
  return Number.isFinite(seconds) ? { timescale, seconds } : null;
}

function parseTrackDuration(bytes, box, movieTimescale) {
  const boxes = childBoxes(bytes, box);
  if (!boxes) return null;
  const tkhd = boxes.find((child) => child.type === "tkhd");
  const mdia = boxes.find((child) => child.type === "mdia");
  if (!tkhd || !mdia) return null;
  const mdiaBoxes = childBoxes(bytes, mdia);
  if (!mdiaBoxes) return null;
  const mdhd = mdiaBoxes.find((child) => child.type === "mdhd");
  const hdlr = mdiaBoxes.find((child) => child.type === "hdlr");
  if (!mdhd || !hdlr || hdlr.payloadStart + 12 > hdlr.end) return null;
  const isVideo = ascii(bytes, hdlr.payloadStart + 8, 4) === "vide";

  const trackVersion = bytes[tkhd.payloadStart];
  let trackDuration;
  if (trackVersion === 0) {
    if (tkhd.payloadStart + 24 > tkhd.end) return null;
    trackDuration = bytes.readUInt32BE(tkhd.payloadStart + 20);
  } else if (trackVersion === 1) {
    if (tkhd.payloadStart + 36 > tkhd.end) return null;
    trackDuration = bytes.readBigUInt64BE(tkhd.payloadStart + 28);
  } else {
    return null;
  }

  const mediaHeader = parseMovieHeader(bytes, mdhd);
  if (!mediaHeader) return null;
  const trackSeconds = Number(trackDuration) / movieTimescale;
  if (!Number.isFinite(trackSeconds)) return null;
  return { seconds: Math.max(trackSeconds, mediaHeader.seconds), isVideo };
}

function readMp4Duration(bytes) {
  const ftyp = readBox(bytes, 0, bytes.length);
  if (!ftyp || ftyp.type !== "ftyp" || ftyp.payloadStart + 8 > ftyp.end) return null;

  const majorBrand = ascii(bytes, ftyp.payloadStart, 4);
  const compatibleBrands = [];
  for (let offset = ftyp.payloadStart + 8; offset + 4 <= ftyp.end; offset += 4) {
    compatibleBrands.push(ascii(bytes, offset, 4));
  }
  const isQuickTime = majorBrand === "qt  " || compatibleBrands.includes("qt  ");
  if (!isQuickTime && !mp4Brands.has(majorBrand) && !compatibleBrands.some((brand) => mp4Brands.has(brand))) {
    return null;
  }

  let moov = null;
  let hasMediaData = false;
  for (let offset = ftyp.end; offset < bytes.length;) {
    const box = readBox(bytes, offset, bytes.length);
    if (!box) return null;
    if (box.type === "moov") moov = box;
    if (box.type === "mdat" && box.end > box.payloadStart) hasMediaData = true;
    offset = box.end;
  }
  if (!moov || !hasMediaData) return null;

  const movieBoxes = childBoxes(bytes, moov);
  const movieHeader = movieBoxes?.find((box) => box.type === "mvhd");
  if (!movieHeader) return null;
  const movieDuration = parseMovieHeader(bytes, movieHeader);
  if (!movieDuration) return null;
  const tracks = movieBoxes?.filter((box) => box.type === "trak") ?? [];
  if (tracks.length === 0) return null;

  let duration = movieDuration.seconds;
  let hasVideoTrack = false;
  for (const track of tracks) {
    const parsed = parseTrackDuration(bytes, track, movieDuration.timescale);
    if (!parsed) return null;
    duration = Math.max(duration, parsed.seconds);
    hasVideoTrack ||= parsed.isVideo;
  }
  if (!hasVideoTrack) return null;
  return { mimeType: isQuickTime ? "video/quicktime" : "video/mp4", durationSeconds: duration };
}

export function detectMedia(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 12) return null;
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { mimeType: "image/jpeg", durationSeconds: null };
  }
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { mimeType: "image/png", durationSeconds: null };
  }
  if (ascii(data, 0, 4) === "RIFF" && ascii(data, 8, 4) === "WEBP") {
    const riffBytes = data.readUInt32LE(4) + 8;
    if (riffBytes >= 22 && riffBytes <= data.byteLength) {
      const chunkSize = data.readUInt32LE(16);
      const paddedChunkSize = chunkSize + (chunkSize % 2);
      if (chunkSize > 0 && 20 + paddedChunkSize <= riffBytes) {
        return { mimeType: "image/webp", durationSeconds: null };
      }
    }
  }
  if (ascii(data, 4, 4) === "ftyp") return readMp4Duration(data);
  return null;
}

export function validateStoredMedia(record, bytes, actualSizeBytes) {
  if (!bytes || actualSizeBytes === null || actualSizeBytes === undefined) {
    throw new DomainError("UPLOAD_INCOMPLETE");
  }
  if (actualSizeBytes > (VIDEO_MIME_TYPES.includes(record.mimeType) ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES)) {
    throw new DomainError("FILE_TOO_LARGE");
  }
  if (actualSizeBytes !== Number(record.sizeBytes) || bytes.byteLength !== actualSizeBytes) {
    throw new DomainError("UPLOAD_INCOMPLETE");
  }

  const detected = detectMedia(bytes);
  if (!detected || detected.mimeType !== record.mimeType) {
    throw new DomainError("INVALID_MEDIA");
  }
  if (VIDEO_MIME_TYPES.includes(record.mimeType)) {
    if (
      detected.durationSeconds <= 0 ||
      detected.durationSeconds > MAX_VIDEO_DURATION_SECONDS ||
      Math.ceil(detected.durationSeconds) !== record.durationSeconds
    ) {
      throw new DomainError("INVALID_MEDIA");
    }
  }
}

export async function finalizeUpload({ actor, input, repository, storage }) {
  requireActor(actor);
  const data = parseInput(finalizeUploadSchema, input);
  const record = await repository.getUploadForFinalize({ actorId: actor.id, actorRole: actor.role, ...data });
  if (!record) throw new DomainError("TICKET_NOT_FOUND");
  if (record.uploadStatus === "AVAILABLE") {
    return { attachmentId: record.id, uploadStatus: "AVAILABLE" };
  }
  if (record.uploadStatus !== "PENDING_UPLOAD") throw new DomainError("UPLOAD_INCOMPLETE");

  let storedObject;
  try {
    storedObject = await storage.readObject({
      objectKey: record.objectKey,
      maxBytes: VIDEO_MIME_TYPES.includes(record.mimeType) ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES,
    });
  } catch (error) {
    if (error instanceof DomainError && ["FILE_TOO_LARGE", "UPLOAD_INCOMPLETE"].includes(error.code)) {
      await repository.queueInvalidUpload(record.id, actor.id, error.code);
      throw error;
    }
    throw new DomainError("PROVIDER_UNAVAILABLE");
  }
  if (!storedObject) throw new DomainError("UPLOAD_INCOMPLETE");

  try {
    validateStoredMedia(record, storedObject.bytes, storedObject.sizeBytes);
  } catch (error) {
    if (error instanceof DomainError && ["INVALID_MEDIA", "FILE_TOO_LARGE", "UPLOAD_INCOMPLETE"].includes(error.code)) {
      await repository.queueInvalidUpload(record.id, actor.id, error.code);
    }
    throw error;
  }

  const finalized = await repository.finalizeUpload({
    actorId: actor.id,
    actorRole: actor.role,
    attachmentId: record.id,
  });
  if (!finalized) throw new DomainError("UPLOAD_INCOMPLETE");
  return { attachmentId: record.id, uploadStatus: "AVAILABLE" };
}

export async function requestAttachment({ actor, input, repository, storage, now = new Date() }) {
  requireActor(actor);
  const data = parseInput(requestAttachmentSchema, input);
  const record = await repository.getAttachmentForDownload({ actorId: actor.id, actorRole: actor.role, ...data });
  if (!record) throw new DomainError("TICKET_NOT_FOUND");
  if (record.uploadStatus === "DELETED") throw new DomainError("MEDIA_GONE");
  if (record.uploadStatus !== "AVAILABLE") throw new DomainError("UPLOAD_INCOMPLETE");

  try {
    const downloadUrl = await storage.createDownloadUrl({
      objectKey: record.objectKey,
      contentType: record.mimeType,
      signingDate: dateFrom(now),
      expiresIn: DOWNLOAD_URL_TTL_SECONDS,
    });
    return {
      attachmentId: record.id,
      downloadUrl,
      expiresAt: new Date(dateFrom(now).valueOf() + DOWNLOAD_URL_TTL_SECONDS * 1000).toISOString(),
    };
  } catch {
    throw new DomainError("PROVIDER_UNAVAILABLE");
  }
}

export function planMediaCleanup(records, now = new Date()) {
  const currentTime = dateFrom(now).valueOf();
  return records
    .filter((record) => {
      if (record.uploadStatus === "DELETE_PENDING") return true;
      if (!["AVAILABLE", "PENDING_UPLOAD"].includes(record.uploadStatus)) return false;
      if (record.deleteAfter && dateFrom(record.deleteAfter).valueOf() <= currentTime) return true;
      return record.uploadStatus === "PENDING_UPLOAD" &&
        dateFrom(record.createdAt).valueOf() + INCOMPLETE_UPLOAD_RETENTION_MS <= currentTime;
    })
    .slice(0, MAX_CLEANUP_BATCH_SIZE);
}

export async function cleanupTicketMedia({ repository, storage, now = new Date() }) {
  const candidates = await repository.prepareMediaCleanup({ now, limit: MAX_CLEANUP_BATCH_SIZE });
  let deleted = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      await storage.deleteObject({ objectKey: candidate.objectKey });
      if (await repository.markAttachmentDeleted(candidate.id)) deleted += 1;
    } catch {
      failed += 1;
    }
  }

  return { selected: candidates.length, deleted, failed };
}
