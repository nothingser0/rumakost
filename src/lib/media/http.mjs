import { DomainError, toPublicError } from "../errors/domain-error.mjs";
import {
  createUploadIntent,
  requestAttachment,
} from "./operations.mjs";

const MAX_REQUEST_BYTES = 8 * 1024;
const noStoreHeaders = Object.freeze({
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
});

function response(payload, status = 200) {
  return Response.json(payload, { status, headers: noStoreHeaders });
}

function errorResponse(error) {
  const mapped = toPublicError(error);
  return response({ success: false, error: mapped }, mapped.status);
}

async function readRequestBody(request) {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_REQUEST_BYTES)) {
    throw new DomainError("REQUEST_TOO_LARGE");
  }
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel().catch(() => {});
      throw new DomainError("REQUEST_TOO_LARGE");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function verifyOrigin(request, appOrigin) {
  const origin = request.headers.get("origin");
  const expectedOrigin = typeof appOrigin === "function" ? appOrigin() : appOrigin;
  if (!origin || origin !== expectedOrigin) throw new DomainError("FORBIDDEN");
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new DomainError("VALIDATION_ERROR");
  }
  const text = await readRequestBody(request);
  try {
    return JSON.parse(text);
  } catch {
    throw new DomainError("VALIDATION_ERROR");
  }
}

async function requireActor(authenticate) {
  try {
    const actor = await authenticate();
    if (!actor) throw new DomainError("UNAUTHENTICATED");
    return actor;
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("PROVIDER_UNAVAILABLE");
  }
}

export function createMediaRouteHandlers({ authenticate, createRepository, createStorage, appOrigin }) {
  return {
    async uploadIntent(request) {
      try {
        verifyOrigin(request, appOrigin);
        const actor = await requireActor(authenticate);
        const input = await readJson(request);
        const data = await createUploadIntent({
          actor,
          input,
          repository: createRepository(),
          storage: createStorage(),
        });
        return response({ success: true, data }, 201);
      } catch (error) {
        return errorResponse(error);
      }
    },

    async downloadUrl(request, attachmentId) {
      try {
        verifyOrigin(request, appOrigin);
        const actor = await requireActor(authenticate);
        const body = await readRequestBody(request);
        if (body.trim() !== "" && body.trim() !== "{}") {
          throw new DomainError("VALIDATION_ERROR");
        }
        const data = await requestAttachment({
          actor,
          input: { attachmentId },
          repository: createRepository(),
          storage: createStorage(),
        });
        return response({ success: true, data });
      } catch (error) {
        return errorResponse(error);
      }
    },
  };
}
