import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { listProducts } from "@/server/services/product.service";

/**
 * Route handlers act as the app's BFF: the browser never talks to the data
 * layer directly, and query params are validated before they reach it.
 */
const querySchema = z.object({
  locale: z.enum(LOCALES).default(DEFAULT_LOCALE),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_query", message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { locale, q, limit } = parsed.data;
  const data = await listProducts(locale, { query: q, limit });

  return NextResponse.json({ data });
}
