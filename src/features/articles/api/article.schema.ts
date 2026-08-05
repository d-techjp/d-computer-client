import { z } from "zod";

import { paginatedSchema } from "@/lib/api/envelope";

const categorySchema = z.object({ id: z.string(), name: z.string(), slug: z.string() });
const authorSchema = z.object({ id: z.string(), fullName: z.string() });

const articleSummaryShape = {
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  thumbnail: z.string().nullable(),
  publishedAt: z.string().nullable(),
  tags: z
    .array(z.string())
    .nullable()
    .transform((value) => value ?? []),
  viewCount: z.number(),
  category: categorySchema.nullable(),
  author: authorSchema.nullable(),
};

export const articleSummarySchema = z.object(articleSummaryShape);

export const articleListSchema = paginatedSchema(articleSummarySchema);

export const articleSchema = z.object({
  ...articleSummaryShape,
  content: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});
