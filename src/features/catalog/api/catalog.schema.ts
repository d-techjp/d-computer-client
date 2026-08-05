import { z } from "zod";

import { paginatedSchema } from "@/lib/api/envelope";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  sortOrder: z.number(),
});

export const categoryListSchema = paginatedSchema(categorySchema);

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number(),
});

export const brandListSchema = paginatedSchema(brandSchema);
