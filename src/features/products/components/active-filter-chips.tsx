"use client";

import type { Brand, Category } from "@/features/catalog/types";
import { useI18n } from "@/i18n/i18n-provider";
import { interpolate } from "@/lib/format/interpolate";

import { priceBucketLabel } from "../facet-labels";
import { activeFilterEntries, type PriceBucket, type ProductQuery } from "../filters";

/**
 * Chips for everything currently narrowing the list.
 *
 * On a phone the sidebar is behind a drawer, so without these the only clue
 * that a filter is on would be a short result list. Each chip removes exactly
 * one selection, which is far quicker than reopening the drawer to untick it.
 */
export function ActiveFilterChips({
  query,
  categories,
  brands,
  onSetCategory,
  onSetBrand,
  onSetPrice,
  onToggleInStock,
  onClear,
}: {
  query: ProductQuery;
  categories: Category[];
  brands: Brand[];
  onSetCategory: (categorySlug: string) => void;
  onSetBrand: (brandSlug: string) => void;
  onSetPrice: (bucket: PriceBucket) => void;
  onToggleInStock: () => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const entries = activeFilterEntries(query);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4">
      <span className="text-[12.5px] text-ink-subtle">{t.filterActive}</span>

      {entries.map(({ key, value }) => {
        const label =
          key === "category"
            ? (categories.find((category) => category.slug === value)?.name ?? value)
            : key === "brand"
              ? (brands.find((brand) => brand.slug === value)?.name ?? value)
              : key === "price"
                ? priceBucketLabel(value as PriceBucket, t)
                : t.filterInStock;

        const remove = () => {
          if (key === "category") onSetCategory(value);
          else if (key === "brand") onSetBrand(value);
          else if (key === "price") onSetPrice(value as PriceBucket);
          else onToggleInStock();
        };

        return (
          <button
            key={`${key}:${value}`}
            type="button"
            onClick={remove}
            aria-label={interpolate(t.filterRemove, { label })}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-soft bg-mist-soft py-1 pr-2 pl-3 text-[12.5px] font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            {label}
            <span aria-hidden className="text-[11px] text-ink-faint">
              ✕
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer text-[12.5px] font-semibold text-ink-muted underline underline-offset-2 transition-colors hover:text-accent"
      >
        {t.filterClear}
      </button>
    </div>
  );
}
