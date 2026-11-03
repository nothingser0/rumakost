import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageEnv } from "@/lib/env";
import { DomainError } from "@/lib/errors/domain-error.mjs";
import type { MediaStorage } from "@/lib/media/operations.mjs";

let cached: { client: S3Client; bucket: string } | undefined;

function getStorageClient() {
  if (cached) return cached;
  const env = getStorageEnv();
  cached = {
    client: new S3Client({
      endpoint: env.NEON_STORAGE_ENDPOINT,
      region: "us-east-2",
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.NEON_STORAGE_ACCESS_KEY,
        secretAccessKey: env.NEON_STORAGE_SECRET_KEY,
      },
    }),
    bucket: env.NEON_STORAGE_BUCKET,
  };
  return cached;
}

function requireOpaqueObjectKey(value: string) {
  if (!/^ticket-media\/[0-9a-f-]{36}$/i.test(value)) {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function storageStatus(error: unknown) {
  if (!error || typeof error !== "object") return 0;
  const metadata = "$metadata" in error ? error.$metadata : null;
  if (metadata && typeof metadata === "object" && "httpStatusCode" in metadata) {
    return Number(metadata.httpStatusCode) || 0;
  }
  return 0;
}

export function createNeonObjectStorage(): MediaStorage {
  return {
    async createUploadUrl(input) {
      requireOpaqueObjectKey(input.objectKey);
      const { client, bucket } = getStorageClient();
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: input.objectKey,
          ContentType: input.contentType,
          ContentLength: input.sizeBytes,
        }),
        {
          expiresIn: input.expiresIn,
          signingDate: input.signingDate,
          signableHeaders: new Set(["content-type", "content-length"]),
        },
      );
    },

    async createDownloadUrl(input) {
      requireOpaqueObjectKey(input.objectKey);
      const { client, bucket } = getStorageClient();
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: bucket,
          Key: input.objectKey,
          ResponseCacheControl: "private, no-store, max-age=0",
          ResponseContentDisposition: "inline",
          ResponseContentType: input.contentType,
        }),
        { expiresIn: input.expiresIn, signingDate: input.signingDate },
      );
    },

    async readObject(input) {
      requireOpaqueObjectKey(input.objectKey);
      const { client, bucket } = getStorageClient();
      let response;
      try {
        response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: input.objectKey }));
      } catch (error) {
        if (storageStatus(error) === 404 || (error instanceof Error && error.name === "NoSuchKey")) {
          return null;
        }
        throw error;
      }

      if (!response.Body) return null;
      const contentLength = response.ContentLength;
      if (typeof contentLength !== "number" || !Number.isSafeInteger(contentLength) || contentLength < 1) {
        throw new DomainError("UPLOAD_INCOMPLETE");
      }
      if (contentLength > input.maxBytes) throw new DomainError("FILE_TOO_LARGE");

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      const body = response.Body as AsyncIterable<Uint8Array>;
      for await (const chunk of body) {
        totalBytes += chunk.byteLength;
        if (totalBytes > input.maxBytes) throw new DomainError("FILE_TOO_LARGE");
        chunks.push(chunk);
      }
      if (totalBytes !== contentLength) throw new DomainError("UPLOAD_INCOMPLETE");
      return { bytes: Buffer.concat(chunks), sizeBytes: totalBytes };
    },

    async deleteObject(input) {
      requireOpaqueObjectKey(input.objectKey);
      const { client, bucket } = getStorageClient();
      try {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: input.objectKey }));
      } catch (error) {
        if (storageStatus(error) !== 404 && !(error instanceof Error && error.name === "NoSuchKey")) {
          throw error;
        }
      }
    },
  };
}
