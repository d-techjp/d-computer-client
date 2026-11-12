import type { NextRequest } from "next/server";

import { currentSession } from "@/server/services/auth-session.service";

export function GET(request: NextRequest) {
  return currentSession(request);
}
