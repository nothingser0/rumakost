import { auth } from "@/lib/auth/server";
import { isAllowedAuthReadPath } from "@/lib/auth/auth-policy.mjs";

const { GET: neonGetSession } = auth.handler();

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;

  if (!isAllowedAuthReadPath(path)) {
    return new Response(null, { status: 404 });
  }

  return neonGetSession(request, context);
}
