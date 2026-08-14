import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  cartMutationResultSchema,
  cartSchema,
  updateCartItemRequestSchema,
} from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

const paramsSchema = z.object({ cartId: z.string().uuid(), itemId: z.string().uuid() });
type RouteContext = { params: Promise<{ cartId: string; itemId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const [parsedParams, parsedBody] = await Promise.all([
    paramsSchema.safeParseAsync(await params),
    updateCartItemRequestSchema.safeParseAsync(await request.json().catch(() => null)),
  ]);

  if (!parsedParams.success || !parsedBody.success) {
    return NextResponse.json(
      { code: "invalid_cart_item", message: "Invalid cart item request" },
      { status: 400 },
    );
  }

  try {
    const result = await backendFetch<unknown>(
      `/carts/${parsedParams.data.cartId}/items/${parsedParams.data.itemId}`,
      undefined,
      {
        method: "PATCH",
        headers: optionalAuthorization(request),
        body: JSON.stringify(parsedBody.data),
      },
    );
    return NextResponse.json(cartMutationResultSchema.parse(result));
  } catch (cause) {
    return apiRouteError(cause);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_cart_item_id", message: "Invalid cart item id" },
      { status: 400 },
    );
  }

  try {
    const cart = await backendFetch<unknown>(
      `/carts/${parsed.data.cartId}/items/${parsed.data.itemId}`,
      undefined,
      { method: "DELETE", headers: optionalAuthorization(request) },
    );
    return NextResponse.json(cartSchema.parse(cart));
  } catch (cause) {
    return apiRouteError(cause);
  }
}
