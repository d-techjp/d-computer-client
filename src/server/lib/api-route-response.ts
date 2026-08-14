import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";

export function optionalAuthorization(request: NextRequest): HeadersInit | undefined {
  const authorization = request.headers.get("authorization");
  return authorization ? { Authorization: authorization } : undefined;
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
