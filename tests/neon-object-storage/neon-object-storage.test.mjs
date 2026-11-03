import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createNeonObjectStorageFromEnv } from "../../src/lib/storage/s3-media-storage.mjs";
import {
  DOWNLOAD_URL_TTL_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
} from "../../src/lib/media/operations.mjs";

const enabled = process.env.NEON_STORAGE_INTEGRATION === "1";

test("Neon private bucket accepts signed upload/download and rejects anonymous reads", {
  skip: !enabled,
}, async () => {
  const appEnvironment = {
    NEON_STORAGE_ENDPOINT: process.env.NEON_STORAGE_ENDPOINT ?? process.env.AWS_ENDPOINT_URL_S3,
    NEON_STORAGE_REGION: process.env.NEON_STORAGE_REGION ?? process.env.AWS_REGION,
    NEON_STORAGE_BUCKET: process.env.NEON_STORAGE_BUCKET,
    NEON_STORAGE_ACCESS_KEY: process.env.NEON_STORAGE_ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID,
    NEON_STORAGE_SECRET_KEY: process.env.NEON_STORAGE_SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  };
  const missing = Object.entries(appEnvironment)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  assert.deepEqual(missing, [], `missing storage settings: ${missing.join(", ")}`);

  const storage = createNeonObjectStorageFromEnv(appEnvironment);
  const objectKey = `ticket-media/${randomUUID()}`;
  const contentType = "image/jpeg";
  const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9, 0x00, 0x00]);
  let uploaded = false;

  try {
    const uploadUrl = await storage.createUploadUrl({
      objectKey,
      contentType,
      sizeBytes: bytes.length,
      signingDate: new Date(),
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    });
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": contentType },
      body: bytes,
      cache: "no-store",
    });
    assert.ok(uploadResponse.ok, `signed PUT returned HTTP ${uploadResponse.status}`);
    uploaded = true;

    const unsignedObjectUrl = new URL(appEnvironment.NEON_STORAGE_ENDPOINT);
    unsignedObjectUrl.pathname = [
      unsignedObjectUrl.pathname.replace(/\/+$/, ""),
      encodeURIComponent(appEnvironment.NEON_STORAGE_BUCKET),
      ...objectKey.split("/").map(encodeURIComponent),
    ].filter(Boolean).join("/");
    const unsignedResponse = await fetch(unsignedObjectUrl, { cache: "no-store" });
    assert.ok(
      [401, 403].includes(unsignedResponse.status),
      `anonymous GET returned HTTP ${unsignedResponse.status}`,
    );
    await unsignedResponse.body?.cancel();

    const stored = await storage.readObject({ objectKey, maxBytes: bytes.length });
    assert.ok(stored, "server-side read must find the uploaded object");
    assert.equal(stored.sizeBytes, bytes.length);
    assert.deepEqual(Buffer.from(stored.bytes), bytes);

    const downloadUrl = await storage.createDownloadUrl({
      objectKey,
      contentType,
      signingDate: new Date(),
      expiresIn: DOWNLOAD_URL_TTL_SECONDS,
    });
    const downloadResponse = await fetch(downloadUrl, { cache: "no-store" });
    assert.ok(downloadResponse.ok, `signed GET returned HTTP ${downloadResponse.status}`);
    assert.match(downloadResponse.headers.get("cache-control") ?? "", /private/i);
    assert.deepEqual(Buffer.from(await downloadResponse.arrayBuffer()), bytes);
    assert.equal(downloadResponse.headers.get("content-type"), contentType);
  } finally {
    if (uploaded) {
      await storage.deleteObject({ objectKey });
      await storage.deleteObject({ objectKey });
      assert.equal(await storage.readObject({ objectKey, maxBytes: bytes.length }), null);
    }
  }
});
