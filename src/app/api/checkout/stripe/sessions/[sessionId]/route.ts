import { NextResponse, type NextRequest } from "next/server";

import { stripeSessionStatusSchema } from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError } from "@/server/lib/api-route-response";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { sessionId } = await params;
  // Stripe Checkout Session ids look like `cs_test_…` / `cs_live_…`.
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json(
      { code: "invalid_session", message: "Invalid payment session" },
      { status: 400 },
    );
  }

  try {
    const status = await backendFetch<unknown>(
      `/checkout/stripe/sessions/${encodeURIComponent(sessionId)}`,
    );
    return NextResponse.json(stripeSessionStatusSchema.parse(status));
  } catch (cause) {
    return apiRouteError(cause);
  }
}
