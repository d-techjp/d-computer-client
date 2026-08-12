import { z } from "zod";

import { paginatedSchema } from "@/lib/api/envelope";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  // Optional on the wire: older payloads and nested `parent` refs omit them,
  // so they default rather than failing the whole list parse.
  description: z.string().nullable().default(null),
  imageUrl: z.string().nullable().default(null),
  parentId: z.string().nullable(),
  sortOrder: z.number(),
  productCount: z.number().default(0),
});

export const categoryListSchema = paginatedSchema(categorySchema);

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number(),
});

export const brandListSchema = paginatedSchema(brandSchema);
