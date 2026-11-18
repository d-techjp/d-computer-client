import type { NextRequest } from "next/server";

import { forwardAuthenticated } from "@/server/lib/forward-authenticated";

export function GET(request: NextRequest) {
  return forwardAuthenticated(request, "/users/me/addresses");
}

export function POST(request: NextRequest) {
  return forwardAuthenticated(request, "/users/me/addresses", { method: "POST", status: 201 });
}
