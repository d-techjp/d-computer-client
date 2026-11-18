import type { NextRequest } from "next/server";

import { forwardAuthenticated } from "@/server/lib/forward-authenticated";

export function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const toInt = (value: string | null, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  return forwardAuthenticated(request, "/orders", {
    params: { page: toInt(search.get("page"), 1), limit: Math.min(toInt(search.get("limit"), 10), 50) },
  });
}
