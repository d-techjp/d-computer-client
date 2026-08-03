"use client";

import { FilterIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/i18n-provider";
import { interpolate } from "@/lib/format/interpolate";

import { SORT_OPTIONS, activeFacetCount, type ProductQuery, type SortOption } from "../filters";

/**
 * Result count, sort control, and — below `lg` — the button that opens the
 * filter drawer.
 *
 * Sorting is a native `<select>` on purpose: it is one tab stop, it announces
 * itself correctly to screen readers, and on a phone it opens the platform
 * picker instead of a bespoke dropdown that fights the on-screen keyboard.
 */
export function ProductToolbar({
  query,
  total,
  onSortChange,
  onOpenFilters,
}: {
  query: ProductQuery;
  total: number;
  onSortChange: (sort: SortOption) => void;
  onOpenFilters: () => void;
}) {
  const { t } = useI18n();
  const active = activeFacetCount(query);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-4">
      <p className="text-[13px] text-ink-muted" aria-live="polite">
        <span className="font-bold text-ink">
          {interpolate(t.listResultCount, { count: total })}
        </span>
        {query.q ? (
          <span className="ml-2">{interpolate(t.listSearchedFor, { query: query.q })}</span>
        ) : null}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border-[1.5px] border-line-strong px-3 py-2 text-[13px] font-bold transition-colors hover:border-accent hover:text-accent lg:hidden"
        >
          <FilterIcon />
          {t.filterOpen}
          {active > 0 ? (
            <span className="flex size-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white tabular-nums">
              {active}
            </span>
          ) : null}
        </button>

        <label className="flex items-center gap-2 text-[12.5px] text-ink-muted">
          <span className="max-sm:sr-only">{t.sortLabel}</span>
          <select
            value={query.sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="cursor-pointer rounded-lg border-[1.5px] border-line-strong bg-white px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.sortOptions[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
