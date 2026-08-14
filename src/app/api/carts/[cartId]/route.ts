import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { cartSchema } from "@/features/cart/api/cart.schema";
import { backendFetch } from "@/server/lib/backend-fetch";
import { apiRouteError, optionalAuthorization } from "@/server/lib/api-route-response";

const paramsSchema = z.object({ cartId: z.string().uuid() });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cartId: string }> },
) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_cart_id", message: "Invalid cart id" }, { status: 400 });
  }

  try {
    const cart = await backendFetch<unknown>(`/carts/${parsed.data.cartId}`, undefined, {
      headers: optionalAuthorization(request),
    });
    return NextResponse.json(cartSchema.parse(cart));
  } catch (cause) {
    return apiRouteError(cause);
  }
}
