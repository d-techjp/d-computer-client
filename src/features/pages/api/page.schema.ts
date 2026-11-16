import { z } from "zod";

/** A static page (`/{slug}`) managed in the admin under 表示 → 固定ページ. Published only. */
export const staticPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  updatedAt: z.string(),
});

export type StaticPage = z.infer<typeof staticPageSchema>;
