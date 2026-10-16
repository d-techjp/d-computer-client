import { NextResponse, type NextRequest } from "next/server";

import {
  stripeCheckoutRequestSchema,
  stripeCheckoutResultSchema,
} from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

export async function POST(request: NextRequest) {
  const parsed = stripeCheckoutRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_checkout", message: "Invalid checkout request" },
      { status: 400 },
    );
  }

  try {
    const result = await backendFetch<unknown>("/checkout/stripe", undefined, {
      method: "POST",
      headers: optionalAuthorization(request),
      body: JSON.stringify(parsed.data),
    });
    return NextResponse.json(stripeCheckoutResultSchema.parse(result), { status: 201 });
  } catch (cause) {
    return apiRouteError(cause);
  }
}
