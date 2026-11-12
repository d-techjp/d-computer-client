import type { NextRequest } from "next/server";

import { endSession } from "@/server/services/auth-session.service";

export function POST(request: NextRequest) {
  return endSession(request);
}
