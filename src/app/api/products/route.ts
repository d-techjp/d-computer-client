import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { productListSchema } from "@/features/products/api/product.schema";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * Route handlers act as the app's BFF: the browser never talks to the real
 * backend directly (so it never needs that origin's CORS policy), and query
 * params are validated before they reach it.
 *
 * Only `search` and `limit` are exposed here — this route exists for the
 * header's search dropdown, not the full listing page (that one is a Server
 * Component reading `productService` directly, no network round trip).
 */
const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_query", message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { search, limit } = parsed.data;

  const data = await backendFetch<unknown>("/products", {
    search,
    limit,
    status: "active",
  });

  return NextResponse.json(productListSchema.parse(data));
}
