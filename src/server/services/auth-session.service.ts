import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";

import { authTokenSchema, sessionUserSchema } from "@/features/auth/api/auth.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";
import { clearSessionCookie, setSessionCookie } from "@/server/lib/auth-session";

/**
 * Dev-only path (in production nginx sends `/api/*` straight to the backend,
 * which sets the same cookie itself): call a backend auth endpoint and keep
 * the token in the httpOnly session cookie. The browser then reads its profile
 * from `/users/me`, exactly as it does against the real backend.
 */
export async function establishSession(
  request: NextRequest,
  path: string,
  schema: z.ZodTypeAny,
  status = 200,
): Promise<NextResponse> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request", message: "Invalid request" }, { status: 400 });
  }

  try {
    const auth = authTokenSchema.parse(
      await backendFetch<unknown>(path, undefined, {
        method: "POST",
        body: JSON.stringify(parsed.data),
      }),
    );
    const response = NextResponse.json({ ok: true }, { status });
    setSessionCookie(response, auth.accessToken, auth.expiresIn);
    return response;
  } catch (cause) {
    return apiRouteError(cause);
  }
}

/** The current shopper, or an error — a dead session also clears the cookie it came from. */
export async function currentSession(request: NextRequest): Promise<NextResponse> {
  const headers = optionalAuthorization(request);
  if (!headers) return NextResponse.json({ code: "unauthenticated" }, { status: 401 });

  try {
    const profile = await backendFetch<unknown>("/users/me", undefined, { headers });
    return NextResponse.json(sessionUserSchema.parse(profile));
  } catch (cause) {
    const response = apiRouteError(cause);
    // 404: the account behind a still-valid token was deleted.
    if (response.status === 401 || response.status === 404) clearSessionCookie(response);
    return response;
  }
}

export async function endSession(request: NextRequest): Promise<NextResponse> {
  // Best effort: the backend bumps the token version so the token is dead
  // even if someone copied it; the cookie goes regardless.
  await backendFetch<unknown>("/auth/logout", undefined, {
    method: "POST",
    headers: optionalAuthorization(request),
  }).catch(() => undefined);

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
