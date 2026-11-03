import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DomainError } from "../errors/domain-error.mjs";

function requireOpaqueObjectKey(value) {
  if (!/^ticket-media\/[0-9a-f-]{36}$/i.test(value)) {
    throw new DomainError("INTERNAL_ERROR");
  }
}

function storageStatus(error) {
  if (!error || typeof error !== "object") return 0;
  const metadata = "$metadata" in error ? error.$metadata : null;
  if (metadata && typeof metadata === "object" && "httpStatusCode" in metadata) {
    return Number(metadata.httpStatusCode) || 0;
  }
  return 0;
}

function createS3MediaStorage({ endpoint, region, bucket, accessKeyId, secretAccessKey }) {
  const client = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    async createUploadUrl(input) {
      requireOpaqueObjectKey(input.objectKey);
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

      const chunks = [];
      let totalBytes = 0;
      const body = response.Body;
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

export function createNeonObjectStorageFromEnv(env) {
  return createS3MediaStorage({
    endpoint: env.NEON_STORAGE_ENDPOINT,
    region: env.NEON_STORAGE_REGION,
    bucket: env.NEON_STORAGE_BUCKET,
    accessKeyId: env.NEON_STORAGE_ACCESS_KEY,
    secretAccessKey: env.NEON_STORAGE_SECRET_KEY,
  });
}
