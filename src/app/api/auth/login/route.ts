import type { NextRequest } from "next/server";

import { loginRequestSchema } from "@/features/auth/api/auth.schema";
import { establishSession } from "@/server/services/auth-session.service";

export function POST(request: NextRequest) {
  return establishSession(request, "/auth/login", loginRequestSchema);
}
