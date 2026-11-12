import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";

import { readSessionToken } from "./auth-session";

/**
 * The shopper's identity for the backend: the session cookie, or an explicit
 * `Authorization` header (kept for tooling and tests). Carts and checkout use
 * this, so a signed-in shopper's cart and orders attach to their account.
 */
export function optionalAuthorization(request: NextRequest): HeadersInit | undefined {
  const authorization = request.headers.get("authorization");
  if (authorization) return { Authorization: authorization };

  const token = readSessionToken(request);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function apiRouteError(cause: unknown): NextResponse {
  if (cause instanceof ApiError) {
    return NextResponse.json(
      { code: cause.code, message: cause.message },
      { status: cause.status || 502 },
    );
  }

  return NextResponse.json(
    { code: "upstream_error", message: "Unexpected upstream response" },
    { status: 502 },
  );
}
