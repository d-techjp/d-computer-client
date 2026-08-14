import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  addCartItemRequestSchema,
  cartMutationResultSchema,
  cartSchema,
} from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

const paramsSchema = z.object({ cartId: z.string().uuid() });
type RouteContext = { params: Promise<{ cartId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const [parsedParams, parsedBody] = await Promise.all([
    paramsSchema.safeParseAsync(await params),
    addCartItemRequestSchema.safeParseAsync(await request.json().catch(() => null)),
  ]);

  if (!parsedParams.success || !parsedBody.success) {
    return NextResponse.json(
      { code: "invalid_cart_item", message: "Invalid cart item request" },
      { status: 400 },
    );
  }

  try {
    const result = await backendFetch<unknown>(
      `/carts/${parsedParams.data.cartId}/items`,
      undefined,
      {
        method: "POST",
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
    return NextResponse.json({ code: "invalid_cart_id", message: "Invalid cart id" }, { status: 400 });
  }

  try {
    const cart = await backendFetch<unknown>(`/carts/${parsed.data.cartId}/items`, undefined, {
      method: "DELETE",
      headers: optionalAuthorization(request),
    });
    return NextResponse.json(cartSchema.parse(cart));
  } catch (cause) {
    return apiRouteError(cause);
  }
}
