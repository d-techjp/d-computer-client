"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Pagination } from "@/components/ui/pagination";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils/cn";

import type { ArticleListing } from "@/server/services/article.service";
import { ArticleCard } from "./article-card";

/**
 * Thin client wrapper around the server-rendered article grid: only the
 * pagination needs interactivity, so that is the only part carrying a
 * `router.push` — the cards themselves stay plain server output.
 */
export function ArticleListBrowser({
  listing,
  locale,
}: {
  listing: ArticleListing;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handlePage = useCallback(
    (page: number) => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", String(page));
        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  return (
    <div className={cn("transition-opacity duration-200", isPending && "opacity-50")}>
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 md:gap-[22px] lg:grid-cols-2 xl:grid-cols-3">
        {listing.articles.map((article) => (
          <ArticleCard key={article.slug} article={article} locale={locale} />
        ))}
      </div>

      <Pagination page={listing.page} totalPages={listing.totalPages} onChange={handlePage} />
    </div>
  );
}
