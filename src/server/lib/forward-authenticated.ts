import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { backendFetch, type BackendParams } from "./backend-fetch";
import { apiRouteError, optionalAuthorization } from "./api-route-response";

/**
 * Dev-only pass-through for "my account" endpoints (in production nginx sends
 * `/api/*` straight to the backend). The backend validates the body and scopes
 * everything to the session's user, so this only has to attach the session
 * and refuse anonymous calls early.
 */
export async function forwardAuthenticated(
  request: NextRequest,
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; params?: BackendParams; status?: number } = {},
): Promise<NextResponse> {
  const headers = optionalAuthorization(request);
  if (!headers) return NextResponse.json({ code: "unauthenticated" }, { status: 401 });

  const method = options.method ?? "GET";
  const body =
    method === "POST" || method === "PATCH" ? await request.text().catch(() => "") : undefined;

  try {
    const data = await backendFetch<unknown>(path, options.params, {
      method,
      headers,
      ...(body ? { body } : {}),
    });
    return NextResponse.json(data ?? null, { status: options.status ?? 200 });
  } catch (cause) {
    return apiRouteError(cause);
  }
}

/** Route params are interpolated into a backend path — only ever a UUID. */
export const uuidParam = z.string().uuid();

export function invalidId(): NextResponse {
  return NextResponse.json({ code: "invalid_id", message: "Invalid id" }, { status: 400 });
}
