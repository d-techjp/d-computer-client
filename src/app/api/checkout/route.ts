import { NextResponse, type NextRequest } from "next/server";

import {
  checkoutOrderSchema,
  placeOrderRequestSchema,
} from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

export async function POST(request: NextRequest) {
  const parsed = placeOrderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_checkout", message: "Invalid checkout request" },
      { status: 400 },
    );
  }

  try {
    const order = await backendFetch<unknown>("/checkout", undefined, {
      method: "POST",
      headers: optionalAuthorization(request),
      body: JSON.stringify(parsed.data),
    });
    return NextResponse.json(checkoutOrderSchema.parse(order), { status: 201 });
  } catch (cause) {
    return apiRouteError(cause);
  }
}
