import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { parseProductQuery } from "@/features/products/filters";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { listProducts } from "@/server/services/product.service";

/**
 * Route handlers act as the app's BFF: the browser never talks to the data
 * layer directly, and query params are validated before they reach it.
 *
 * Locale and limit are strict — a bad value there is a caller bug worth a 400.
 * The facet params are parsed leniently by `parseProductQuery`, which drops
 * anything it does not recognise: a shared link carrying a facet value that has
 * since been retired should still return products.
 */
const querySchema = z.object({
  locale: z.enum(LOCALES).default(DEFAULT_LOCALE),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_query", message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { locale, q, limit } = parsed.data;
  const { facets, sort } = parseProductQuery(params);

  const data = await listProducts(locale, { query: q, limit, facets, sort });

  return NextResponse.json({ data });
}
