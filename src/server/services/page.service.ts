import "server-only";

import { cache } from "react";

import { staticPageSchema, type StaticPage } from "@/features/pages/api/page.schema";
import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/server/lib/backend-fetch";

/**
 * `null` for "no such published page" (the backend answers 404 for drafts too),
 * so the route can fall through to `notFound()`.
 *
 * Wrapped in `cache` because `generateMetadata` and the page both ask for the
 * same slug in one request — and `[slug]` also receives every mistyped URL, so
 * doubling those backend calls would add up.
 */
export const getPageBySlug = cache(async (slug: string): Promise<StaticPage | null> => {
  try {
    const data = await backendFetch<unknown>(`/pages/slug/${encodeURIComponent(slug)}`);
    return staticPageSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
