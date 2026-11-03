import assert from "node:assert/strict";
import test from "node:test";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import { createMediaRouteHandlers } from "../../src/lib/media/http.mjs";
import {
  cleanupTicketMedia,
  createUploadIntent,
  detectMedia,
  DOWNLOAD_URL_TTL_SECONDS,
  finalizeUpload,
  INCOMPLETE_UPLOAD_RETENTION_MS,
  MAX_CLEANUP_BATCH_SIZE,
  MAX_PHOTO_BYTES,
  MAX_PROJECT_BYTES,
  MAX_TICKET_BYTES,
  MAX_UPLOAD_INTENTS_PER_MINUTE,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  planMediaCleanup,
  requestAttachment,
  UPLOAD_URL_TTL_SECONDS,
  validateStoredMedia,
  validateUploadMetadata,
} from "../../src/lib/media/operations.mjs";

const OWNER_ID = "00000000-0000-4000-8000-000000000001";
const TENANT_ID = "00000000-0000-4000-8000-000000000002";
const TICKET_ID = "00000000-0000-4000-8000-000000000003";
const COMMENT_ID = "00000000-0000-4000-8000-000000000004";
const BATCH_ID = "00000000-0000-4000-8000-000000000005";
const ATTACHMENT_ID = "00000000-0000-4000-8000-000000000006";
const OBJECT_KEY = "ticket-media/00000000-0000-4000-8000-000000000007";
const NOW = new Date("2026-11-03T12:00:00.000Z");
const owner = { id: OWNER_ID, role: "OWNER" };
const tenant = { id: TENANT_ID, role: "TENANT" };

function validInput(overrides = {}) {
  return {
    ticketId: TICKET_ID,
    commentId: COMMENT_ID,
    uploadBatchId: BATCH_ID,
    fileName: "pipa-bocor.jpg",
    contentType: "image/jpeg",
    sizeBytes: jpegBytes().length,
    idempotencyKey: "00000000-0000-4000-8000-000000000008",
    ...overrides,
  };
}

function uploadRecord(overrides = {}) {
  return {
    id: ATTACHMENT_ID,
    objectKey: OBJECT_KEY,
    uploadStatus: "PENDING_UPLOAD",
    createdAt: NOW,
    mimeType: "image/jpeg",
    sizeBytes: jpegBytes().length,
    durationSeconds: null,
    deleteAfter: null,
    ...overrides,
  };
}

function jpegBytes() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9, 0, 0]);
}

function box(type, payload) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 4, "ascii");
  return Buffer.concat([header, payload]);
}

function movieHeader(type, durationSeconds) {
  const payload = Buffer.alloc(20);
  payload.writeUInt32BE(1000, 12);
  payload.writeUInt32BE(durationSeconds * 1000, 16);
  return box(type, payload);
}

function trackHeader(durationSeconds) {
  const payload = Buffer.alloc(32);
  payload.writeUInt32BE(durationSeconds * 1000, 20);
  return box("tkhd", payload);
}

function handlerBox(type) {
  const payload = Buffer.alloc(12);
  payload.write(type, 8, 4, "ascii");
  return box("hdlr", payload);
}

function videoBytes({ durationSeconds = 30, brand = "isom" } = {}) {
  const ftypPayload = Buffer.concat([
    Buffer.from(brand, "ascii"),
    Buffer.alloc(4),
    Buffer.from(brand, "ascii"),
  ]);
  const ftyp = box("ftyp", ftypPayload);
  const mediaHeader = movieHeader("mdhd", durationSeconds);
  const media = box("mdia", Buffer.concat([mediaHeader, handlerBox("vide")]));
  const track = box("trak", Buffer.concat([trackHeader(durationSeconds), media]));
  const moov = box("moov", Buffer.concat([movieHeader("mvhd", durationSeconds), track]));
  return Buffer.concat([ftyp, box("mdat", Buffer.from([1])), moov]);
}

function repository(overrides = {}) {
  return {
    async createUploadIntent() {
      return {
        id: ATTACHMENT_ID,
        objectKey: OBJECT_KEY,
        uploadStatus: "PENDING_UPLOAD",
        createdAt: NOW,
        created: true,
      };
    },
    async getUploadForFinalize() {
      return uploadRecord();
    },
    async queueInvalidUpload() {},
    async finalizeUpload() {
      return true;
    },
    async getAttachmentForDownload() {
      return uploadRecord({ uploadStatus: "AVAILABLE" });
    },
    async prepareMediaCleanup() {
      return [];
    },
    async markAttachmentDeleted() {
      return true;
    },
    ...overrides,
  };
}

function storage(overrides = {}) {
  return {
    async createUploadUrl() {
      return "https://storage.invalid/signed-upload";
    },
    async createDownloadUrl() {
      return "https://storage.invalid/signed-download";
    },
    async readObject() {
      return { bytes: jpegBytes(), sizeBytes: jpegBytes().length };
    },
    async deleteObject() {},
    ...overrides,
  };
}

function mediaRequest(path, body, headers = {}) {
  return new Request(`https://app.example${path}`, {
    method: "POST",
    headers: {
      origin: "https://app.example",
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

function expectCode(code) {
  return (error) => error instanceof DomainError && error.code === code;
}

test("policy constants match the frozen photo, video, ticket, project, and rate limits", () => {
  assert.equal(MAX_PHOTO_BYTES, 4 * 1024 * 1024);
  assert.equal(MAX_VIDEO_BYTES, 12 * 1024 * 1024);
  assert.equal(MAX_VIDEO_DURATION_SECONDS, 30);
  assert.equal(MAX_TICKET_BYTES, 40 * 1024 * 1024);
  assert.equal(MAX_PROJECT_BYTES, 4_000_000_000);
  assert.equal(MAX_UPLOAD_INTENTS_PER_MINUTE, 10);
  assert.equal(UPLOAD_URL_TTL_SECONDS, 300);
  assert.equal(DOWNLOAD_URL_TTL_SECONDS, 60);
  assert.equal(INCOMPLETE_UPLOAD_RETENTION_MS, 60 * 60 * 1000);
  assert.equal(MAX_CLEANUP_BATCH_SIZE, 50);
});

test("metadata accepts JPEG/PNG/WebP and MP4/MOV with their size and duration boundaries", () => {
  for (const contentType of ["image/jpeg", "image/png", "image/webp"]) {
    validateUploadMetadata(validInput({ contentType, sizeBytes: MAX_PHOTO_BYTES }));
  }
  for (const contentType of ["video/mp4", "video/quicktime"]) {
    validateUploadMetadata(validInput({
      contentType,
      fileName: contentType === "video/mp4" ? "pipa-bocor.mp4" : "pipa-bocor.mov",
      sizeBytes: MAX_VIDEO_BYTES,
      durationSeconds: MAX_VIDEO_DURATION_SECONDS,
    }));
  }

  assert.throws(
    () => validateUploadMetadata(validInput({ sizeBytes: MAX_PHOTO_BYTES + 1 })),
    expectCode("FILE_TOO_LARGE"),
  );
  assert.throws(
    () => validateUploadMetadata(validInput({ contentType: "video/mp4", sizeBytes: MAX_VIDEO_BYTES + 1, durationSeconds: 1 })),
    expectCode("FILE_TOO_LARGE"),
  );
  assert.throws(
    () => validateUploadMetadata(validInput({ contentType: "video/quicktime", durationSeconds: MAX_VIDEO_DURATION_SECONDS + 1 })),
    expectCode("INVALID_MEDIA"),
  );
  assert.throws(
    () => validateUploadMetadata(validInput({ contentType: "video/quicktime" })),
    expectCode("INVALID_MEDIA"),
  );
  assert.throws(
    () => validateUploadMetadata(validInput({ contentType: "video/x-msvideo" })),
    expectCode("INVALID_MEDIA"),
  );
  assert.throws(
    () => validateUploadMetadata(validInput({ durationSeconds: 1 })),
    expectCode("INVALID_MEDIA"),
  );
});

test("signature detection distinguishes JPEG, PNG, WebP, MP4, MOV, and malformed containers", () => {
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(8)]);
  const webp = Buffer.alloc(22);
  webp.write("RIFF", 0, "ascii");
  webp.writeUInt32LE(14, 4);
  webp.write("WEBP", 8, "ascii");
  webp.write("VP8 ", 12, "ascii");
  webp.writeUInt32LE(1, 16);
  webp[20] = 1;

  assert.equal(detectMedia(jpegBytes())?.mimeType, "image/jpeg");
  assert.equal(detectMedia(png)?.mimeType, "image/png");
  assert.equal(detectMedia(webp)?.mimeType, "image/webp");
  assert.deepEqual(detectMedia(videoBytes()), { mimeType: "video/mp4", durationSeconds: 30 });
  assert.deepEqual(detectMedia(videoBytes({ brand: "qt  " })), { mimeType: "video/quicktime", durationSeconds: 30 });
  assert.equal(detectMedia(videoBytes({ durationSeconds: 31 }))?.durationSeconds, 31);
  assert.equal(detectMedia(Buffer.from("not a media file")), null);
  assert.equal(detectMedia(box("ftyp", Buffer.from("unknown-brand"))), null);
  assert.equal(detectMedia(Buffer.from([0xff, 0xd8, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0])), null);
});

test("stored objects must match actual signature, declared MIME, size, and video duration", () => {
  validateStoredMedia(uploadRecord(), jpegBytes(), jpegBytes().length);
  validateStoredMedia(uploadRecord({
    mimeType: "video/mp4",
    sizeBytes: videoBytes().length,
    durationSeconds: 30,
  }), videoBytes(), videoBytes().length);
  validateStoredMedia(uploadRecord({
    mimeType: "video/quicktime",
    sizeBytes: videoBytes({ brand: "qt  " }).length,
    durationSeconds: 30,
  }), videoBytes({ brand: "qt  " }), videoBytes({ brand: "qt  " }).length);

  assert.throws(() => validateStoredMedia(uploadRecord({ sizeBytes: videoBytes().length }), videoBytes(), videoBytes().length), expectCode("INVALID_MEDIA"));
  assert.throws(() => validateStoredMedia(uploadRecord({ sizeBytes: 3 }), jpegBytes(), 4), expectCode("UPLOAD_INCOMPLETE"));
  assert.throws(() => validateStoredMedia(uploadRecord({ mimeType: "video/mp4", sizeBytes: videoBytes({ durationSeconds: 31 }).length, durationSeconds: 31 }), videoBytes({ durationSeconds: 31 }), videoBytes({ durationSeconds: 31 }).length), expectCode("INVALID_MEDIA"));
  assert.throws(() => validateStoredMedia(uploadRecord({ mimeType: "video/mp4", sizeBytes: 4, durationSeconds: 1 }), jpegBytes(), MAX_VIDEO_BYTES + 1), expectCode("FILE_TOO_LARGE"));
});

test("upload intent checks ticket, comment, batch, limits, and rate/quota errors before returning opaque IDs", async () => {
  let received;
  let signed;
  const result = await createUploadIntent({
    actor: owner,
    input: validInput(),
    repository: repository({ async createUploadIntent(input) { received = input; return { ...uploadRecord(), created: true }; } }),
    storage: storage({ async createUploadUrl(input) { signed = input; return "https://storage.invalid/signed-upload"; } }),
    now: NOW,
  });

  assert.equal(received.ticketId, TICKET_ID);
  assert.equal(received.commentId, COMMENT_ID);
  assert.equal(received.uploadBatchId, BATCH_ID);
  assert.equal(signed.objectKey, OBJECT_KEY);
  assert.equal(signed.signingDate.toISOString(), NOW.toISOString());
  assert.equal(signed.expiresIn, UPLOAD_URL_TTL_SECONDS);
  assert.equal(result.attachmentId, ATTACHMENT_ID);
  assert.deepEqual(Object.keys(result).sort(), ["attachmentId", "expiresAt", "uploadUrl"]);
  assert.equal("objectKey" in result, false);
  assert.equal(result.expiresAt, new Date(NOW.valueOf() + 300_000).toISOString());

  const replayCreatedAt = new Date(NOW.valueOf() - 240_000);
  await createUploadIntent({
    actor: owner,
    input: validInput(),
    repository: repository({ async createUploadIntent() { return { ...uploadRecord({ createdAt: replayCreatedAt }), created: false }; } }),
    storage: storage({ async createUploadUrl(input) { signed = input; return "https://storage.invalid/replayed"; } }),
    now: NOW,
  });
  assert.equal(signed.signingDate.toISOString(), NOW.toISOString());
  assert.equal(signed.expiresIn, 60);

  await assert.rejects(createUploadIntent({
    actor: owner,
    input: validInput(),
    repository: repository({ async createUploadIntent() { return { ...uploadRecord({ createdAt: new Date(NOW.valueOf() - 301_000) }), created: false }; } }),
    storage: storage(),
    now: NOW,
  }), expectCode("UPLOAD_INCOMPLETE"));

  for (const code of ["TICKET_NOT_OWNED", "LEASE_ENDED", "FORBIDDEN_VISIBILITY", "TICKET_LIMIT_EXCEEDED", "STORAGE_QUOTA_EXCEEDED", "RATE_LIMITED"]) {
    await assert.rejects(createUploadIntent({
      actor: tenant,
      input: validInput(),
      repository: repository({ async createUploadIntent() { throw new DomainError(code); } }),
      storage: storage(),
    }), expectCode(code));
  }
});

test("finalize only marks verified bytes AVAILABLE, keeps early retries open, and queues invalid content", async () => {
  let finalized = 0;
  let queued = 0;
  const repo = repository({
    async finalizeUpload() { finalized += 1; return true; },
    async queueInvalidUpload() { queued += 1; },
  });
  const result = await finalizeUpload({
    actor: owner,
    input: { attachmentId: ATTACHMENT_ID },
    repository: repo,
    storage: storage(),
  });
  assert.deepEqual(result, { attachmentId: ATTACHMENT_ID, uploadStatus: "AVAILABLE" });
  assert.equal(finalized, 1);
  assert.equal(queued, 0);

  await assert.rejects(finalizeUpload({
    actor: owner,
    input: { attachmentId: ATTACHMENT_ID },
    repository: repo,
    storage: storage({ async readObject() { return null; } }),
  }), expectCode("UPLOAD_INCOMPLETE"));
  assert.equal(queued, 0);

  await assert.rejects(finalizeUpload({
    actor: owner,
    input: { attachmentId: ATTACHMENT_ID },
    repository: repository({
      async getUploadForFinalize() {
        return uploadRecord({ mimeType: "video/mp4", sizeBytes: jpegBytes().length, durationSeconds: 30 });
      },
      async queueInvalidUpload() { queued += 1; },
    }),
    storage: storage({ async readObject() { return { bytes: jpegBytes(), sizeBytes: jpegBytes().length }; } }),
  }), expectCode("INVALID_MEDIA"));
  assert.equal(queued, 1);
  assert.equal(finalized, 1);
});

test("download URLs are short-lived and never return storage keys", async () => {
  let signed;
  const result = await requestAttachment({
    actor: tenant,
    input: { attachmentId: ATTACHMENT_ID },
    repository: repository({ async getAttachmentForDownload() { return uploadRecord({ uploadStatus: "AVAILABLE" }); } }),
    storage: storage({ async createDownloadUrl(input) { signed = input; return "https://storage.invalid/signed-download"; } }),
    now: NOW,
  });
  assert.equal(signed.expiresIn, DOWNLOAD_URL_TTL_SECONDS);
  assert.deepEqual(Object.keys(result).sort(), ["attachmentId", "downloadUrl", "expiresAt"]);
  assert.equal("objectKey" in result, false);
  assert.equal(result.expiresAt, new Date(NOW.valueOf() + 60_000).toISOString());

  await assert.rejects(requestAttachment({
    actor: tenant,
    input: { attachmentId: ATTACHMENT_ID },
    repository: repository({ async getAttachmentForDownload() { return uploadRecord({ uploadStatus: "DELETED" }); } }),
    storage: storage(),
  }), expectCode("MEDIA_GONE"));
});

test("media routes enforce Origin, auth, bounded JSON, error codes, and private response headers", async () => {
  let authCalls = 0;
  const handlers = createMediaRouteHandlers({
    authenticate: async () => { authCalls += 1; return owner; },
    createRepository: () => repository(),
    createStorage: () => storage(),
    appOrigin: "https://app.example",
  });
  const badOrigin = await handlers.uploadIntent(mediaRequest("/api/media/upload-intents", JSON.stringify(validInput()), { origin: "https://other.example" }));
  assert.equal(badOrigin.status, 403);
  assert.equal(authCalls, 0);

  const unauthenticated = createMediaRouteHandlers({
    authenticate: async () => null,
    createRepository: () => repository(),
    createStorage: () => storage(),
    appOrigin: "https://app.example",
  });
  const noSession = await unauthenticated.uploadIntent(mediaRequest("/api/media/upload-intents", JSON.stringify(validInput())));
  assert.equal(noSession.status, 401);

  const success = await handlers.uploadIntent(mediaRequest("/api/media/upload-intents", JSON.stringify(validInput())));
  assert.equal(success.status, 201);
  assert.match(success.headers.get("cache-control"), /no-store/);
  assert.equal(success.headers.get("referrer-policy"), "no-referrer");
  const payload = await success.json();
  assert.equal(payload.success, true);
  assert.equal("objectKey" in payload.data, false);

  const invalidContentType = await handlers.uploadIntent(mediaRequest("/api/media/upload-intents", "{}", { "content-type": "text/plain" }));
  assert.equal(invalidContentType.status, 400);
  const malformed = await handlers.uploadIntent(mediaRequest("/api/media/upload-intents", "{"));
  assert.equal(malformed.status, 400);
  const oversized = await handlers.uploadIntent(mediaRequest("/api/media/upload-intents", "{}", { "content-length": "8193" }));
  assert.equal(oversized.status, 413);

  const quota = createMediaRouteHandlers({
    authenticate: async () => owner,
    createRepository: () => repository({ async createUploadIntent() { throw new DomainError("STORAGE_QUOTA_EXCEEDED"); } }),
    createStorage: () => storage(),
    appOrigin: "https://app.example",
  });
  const quotaResponse = await quota.uploadIntent(mediaRequest("/api/media/upload-intents", JSON.stringify(validInput())));
  assert.equal(quotaResponse.status, 409);
  assert.equal((await quotaResponse.json()).error.code, "STORAGE_QUOTA_EXCEEDED");
});

test("cleanup honors draft and 365-day deadlines and retries failed object deletion", async () => {
  const createdAt = new Date("2026-10-27T12:00:00.000Z");
  const draftDeleteAfter = new Date(createdAt.valueOf() + 7 * 24 * 60 * 60 * 1000);
  const closedAt = new Date("2025-11-03T12:00:00.000Z");
  const retentionDeleteAfter = new Date(closedAt.valueOf() + 365 * 24 * 60 * 60 * 1000);
  const records = [
    { id: "draft", objectKey: "ticket-media/draft", uploadStatus: "AVAILABLE", createdAt, deleteAfter: draftDeleteAfter },
    { id: "retention", objectKey: "ticket-media/retention", uploadStatus: "AVAILABLE", createdAt: closedAt, deleteAfter: retentionDeleteAfter },
    { id: "orphan", objectKey: "ticket-media/orphan", uploadStatus: "PENDING_UPLOAD", createdAt: new Date(NOW.valueOf() - INCOMPLETE_UPLOAD_RETENTION_MS - 1), deleteAfter: null },
    { id: "queued", objectKey: "ticket-media/queued", uploadStatus: "DELETE_PENDING", createdAt: NOW, deleteAfter: null },
    { id: "live", objectKey: "ticket-media/live", uploadStatus: "AVAILABLE", createdAt: NOW, deleteAfter: null },
  ];
  assert.deepEqual(planMediaCleanup(records, new Date(draftDeleteAfter.valueOf() - 1)).map(({ id }) => id), ["orphan", "queued"]);
  assert.deepEqual(planMediaCleanup(records, NOW).map(({ id }) => id), ["draft", "retention", "orphan", "queued"]);
  assert.equal(planMediaCleanup(Array.from({ length: 75 }, (_, index) => ({
    id: String(index), uploadStatus: "DELETE_PENDING", createdAt: NOW,
  })), NOW).length, MAX_CLEANUP_BATCH_SIZE);

  const deleted = [];
  const marked = [];
  const cleanupRepository = repository({
    async prepareMediaCleanup() { return records.slice(0, 3); },
    async markAttachmentDeleted(id) { marked.push(id); return true; },
  });
  const result = await cleanupTicketMedia({
    repository: cleanupRepository,
    storage: storage({
      async deleteObject({ objectKey }) {
        if (objectKey.endsWith("retention")) throw new Error("temporary storage failure");
        deleted.push(objectKey);
      },
    }),
    now: NOW,
  });
  assert.deepEqual(result, { selected: 3, deleted: 2, failed: 1 });
  assert.deepEqual(marked, ["draft", "orphan"]);
  assert.equal(deleted.includes("ticket-media/retention"), false);
});
