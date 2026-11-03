import { isSameOriginAuthMutation } from "./request-origin.mjs";

export async function handleAuthMutation(request, appOrigin, handler) {
  if (!isSameOriginAuthMutation(request.headers.get("origin"), appOrigin)) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return handler(request);
}
