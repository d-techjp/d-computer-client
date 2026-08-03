"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import {
  activeFacetCount,
  clearFacets,
  toQueryString,
  toggleFacet,
  withSort,
  type FacetKey,
  type ProductQuery,
  type SortOption,
} from "../filters";
import type { FacetCounts } from "../types";
import { ActiveFilterChips } from "./active-filter-chips";
import { ProductFilterPanel } from "./product-filter-panel";
import { ProductToolbar } from "./product-toolbar";

/**
 * Interactive shell around a server-rendered results grid.
 *
 * Two things carry their weight here:
 *
 *  1. The grid arrives as `children`. It is rendered on the server and passed
 *     through, so the cards — twelve images, twelve links — never enter the
 *     client bundle even though the chrome around them is a Client Component.
 *
 *  2. Filtering is a *navigation*, not local state. `router.push` re-runs the
 *     page on the server with the new search params, which keeps the URL, the
 *     rendered list and the facet counts in lockstep and makes the result
 *     shareable. `useOptimistic` ticks the checkbox on the same frame as the
 *     click so the round trip is invisible, and `isPending` fades the old
 *     results rather than blanking them.
 */
export function ProductBrowser({
  query,
  facets,
  total,
  children,
}: {
  query: ProductQuery;
  facets: FacetCounts;
  total: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const apply = useCallback(
    (next: ProductQuery) => {
      startTransition(() => {
        setOptimisticQuery(next);
        // `scroll: false` — re-filtering should not throw the visitor back to
        // the top of the page they are already reading.
        router.push(`${pathname}${toQueryString(next)}`, { scroll: false });
      });
    },
    [pathname, router, setOptimisticQuery],
  );

  const handleToggle = useCallback(
    (key: FacetKey, value: string) => apply(toggleFacet(optimisticQuery, key, value)),
    [apply, optimisticQuery],
  );

  const handleClear = useCallback(() => apply(clearFacets(optimisticQuery)), [apply, optimisticQuery]);

  const handleSort = useCallback(
    (sort: SortOption) => apply(withSort(optimisticQuery, sort)),
    [apply, optimisticQuery],
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const drawerRef = useDismissable<HTMLDivElement>(drawerOpen, closeDrawer);

  // The drawer covers the viewport; letting the page scroll behind it is the
  // classic mobile bug where closing it leaves you somewhere else entirely.
  useEffect(() => {
    if (!drawerOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const activeCount = activeFacetCount(optimisticQuery);

  return (
    <div className="flex gap-8 xl:gap-10">
      {/* Wide enough for a fully written-out đồng price band — the longest
          facet label either storefront produces. */}
      <aside className="hidden w-[264px] flex-none lg:block">
        <div className="sticky top-[88px] max-h-[calc(100vh-108px)] overflow-y-auto pr-1 pb-2">
          <ProductFilterPanel
            query={optimisticQuery}
            facets={facets}
            onToggle={handleToggle}
            onClear={handleClear}
          />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <ProductToolbar
          query={optimisticQuery}
          total={total}
          onSortChange={handleSort}
          onOpenFilters={() => setDrawerOpen(true)}
        />

        <ActiveFilterChips
          query={optimisticQuery}
          onToggle={handleToggle}
          onClear={handleClear}
        />

        <div
          className={cn(
            "mt-6 transition-opacity duration-200",
            isPending && "pointer-events-none opacity-50",
          )}
        >
          {children}
        </div>
      </div>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-70 bg-ink-strong/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.filterTitle}
        >
          <div
            ref={drawerRef}
            className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[340px] flex-col bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <span className="text-[15px] font-black">{t.filterTitle}</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={t.filterClose}
                className="cursor-pointer text-ink-muted transition-colors hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-1 pb-6">
              <ProductFilterPanel
                query={optimisticQuery}
                facets={facets}
                onToggle={handleToggle}
                onClear={handleClear}
                showHeading={false}
              />
            </div>

            <div className="border-t border-line-soft px-5 py-4">
              <Button size="block" onClick={closeDrawer}>
                {t.filterApply}
                {activeCount > 0 ? ` (${activeCount})` : ""}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
