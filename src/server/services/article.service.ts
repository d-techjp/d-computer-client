import "server-only";

import { articleListSchema, articleSchema } from "@/features/articles/api/article.schema";
import type { Article, ArticleSummary } from "@/features/articles/types";
import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * The single place that talks to the backend's `/articles` endpoints —
 * mirrors `product.service.ts`. `GET /articles` already only returns
 * published articles (it is the "published" listing, distinct from the
 * admin-only `/articles/manage`), so there is no status filter to apply here.
 */
const PAGE_SIZE = 12;

export type ListArticlesOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ArticleListing = {
  articles: ArticleSummary[];
  total: number;
  totalPages: number;
  page: number;
};

export async function listArticles(options: ListArticlesOptions = {}): Promise<ArticleListing> {
  const data = await backendFetch<unknown>("/articles", {
    page: options.page ?? 1,
    limit: options.limit ?? PAGE_SIZE,
    search: options.search,
    sortBy: "publishedAt",
    sortOrder: "DESC",
  });

  const parsed = articleListSchema.parse(data);

  return {
    articles: parsed.items,
    total: parsed.meta.total,
    totalPages: parsed.meta.totalPages,
    page: parsed.meta.page,
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const data = await backendFetch<unknown>(`/articles/slug/${encodeURIComponent(slug)}`);
    return articleSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
