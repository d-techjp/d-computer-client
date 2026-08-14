import { NextResponse, type NextRequest } from "next/server";

import {
  checkoutPreviewRequestSchema,
  checkoutPreviewSchema,
} from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

export async function POST(request: NextRequest) {
  const parsed = checkoutPreviewRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_checkout_preview", message: "Invalid checkout preview request" },
      { status: 400 },
    );
  }

  try {
    const preview = await backendFetch<unknown>("/checkout/preview", undefined, {
      method: "POST",
      headers: optionalAuthorization(request),
      body: JSON.stringify(parsed.data),
    });
    return NextResponse.json(checkoutPreviewSchema.parse(preview));
  } catch (cause) {
    return apiRouteError(cause);
  }
}
