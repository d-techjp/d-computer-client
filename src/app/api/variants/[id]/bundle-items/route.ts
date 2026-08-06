import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { bundleItemListSchema } from "@/features/products/api/product.schema";
import { backendFetch } from "@/server/lib/backend-fetch";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = paramsSchema.safeParse(await params);

  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid_variant_id", message: "Invalid variant id" },
      { status: 400 },
    );
  }

  const data = await backendFetch<unknown>(
    `/variants/${encodeURIComponent(parsed.data.id)}/bundle-items`,
  );

  return NextResponse.json(bundleItemListSchema.parse(data));
}
