import { NextResponse, type NextRequest } from "next/server";

import { cartSchema } from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

export async function POST(request: NextRequest) {
  try {
    const cart = await backendFetch<unknown>("/carts", undefined, {
      method: "POST",
      headers: optionalAuthorization(request),
    });

    return NextResponse.json(cartSchema.parse(cart), { status: 201 });
  } catch (cause) {
    return apiRouteError(cause);
  }
}
