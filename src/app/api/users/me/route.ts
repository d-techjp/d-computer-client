import type { NextRequest } from "next/server";

import { forwardAuthenticated } from "@/server/lib/forward-authenticated";
import { currentSession } from "@/server/services/auth-session.service";

export function GET(request: NextRequest) {
  return currentSession(request);
}

export function PATCH(request: NextRequest) {
  return forwardAuthenticated(request, "/users/me", { method: "PATCH" });
}
