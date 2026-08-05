"use client";

import type { ReactNode } from "react";

import type { Brand, Category } from "@/features/catalog/types";
import { CheckIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { priceBucketLabel } from "../facet-labels";
import { PRICE_BUCKETS, activeFilterCount, type PriceBucket, type ProductQuery } from "../filters";

/**
 * The filter sidebar. Pure presentation over `query` + the reference lists:
 * it holds no state of its own, because the *URL* is the state. That is what
 * makes a filtered view shareable, bookmarkable and restorable with the back
 * button — and it is why the same component can render in the desktop
 * sidebar and inside the mobile drawer without the two ever disagreeing.
 *
 * Each group is single-select — the backend only accepts one `categoryId`
 * and one `brandId` per request — so clicking an option replaces whatever
 * was selected in that group, and clicking it again clears it.
 */
export function ProductFilterPanel({
  query,
  categories,
  brands,
  onSetCategory,
  onSetBrand,
  onSetPrice,
  onToggleInStock,
  onClear,
  /** The mobile drawer supplies its own title bar, so it turns this off. */
  showHeading = true,
  className,
}: {
  query: ProductQuery;
  categories: Category[];
  brands: Brand[];
  onSetCategory: (categoryId: string) => void;
  onSetBrand: (brandId: string) => void;
  onSetPrice: (bucket: PriceBucket) => void;
  onToggleInStock: () => void;
  onClear: () => void;
  showHeading?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const active = activeFilterCount(query);

  return (
    <div className={cn("text-ink", className)}>
      {showHeading ? (
        <div className="flex items-baseline justify-between gap-3 pb-1">
          <h2 className="text-[15px] font-black">{t.filterTitle}</h2>
          {active > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="cursor-pointer text-[12.5px] font-semibold text-ink-muted underline-offset-2 transition-colors hover:text-accent hover:underline"
            >
              {t.filterClear}
            </button>
          ) : null}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <FilterGroup title={t.filterGroups.category} first={!showHeading}>
          {categories.map((category) => (
            <FilterOption
              key={category.id}
              label={category.name}
              indent={Boolean(category.parentId)}
              checked={query.categoryId === category.id}
              onChange={() => onSetCategory(category.id)}
            />
          ))}
        </FilterGroup>
      ) : null}

      {brands.length > 0 ? (
        <FilterGroup title={t.filterGroups.brand}>
          {brands.map((brand) => (
            <FilterOption
              key={brand.id}
              label={brand.name}
              checked={query.brandId === brand.id}
              onChange={() => onSetBrand(brand.id)}
            />
          ))}
        </FilterGroup>
      ) : null}

      <FilterGroup title={t.filterGroups.price}>
        {PRICE_BUCKETS.map((bucket) => (
          <FilterOption
            key={bucket}
            label={priceBucketLabel(bucket, t)}
            checked={query.priceBucket === bucket}
            onChange={() => onSetPrice(bucket)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t.filterGroups.stock}>
        <FilterOption
          label={t.filterInStock}
          checked={query.inStock}
          onChange={onToggleInStock}
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  first = false,
  children,
}: {
  title: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className={cn("border-line-soft pt-4", !first && "mt-4 border-t")}>
      <legend className="sr-only">{title}</legend>
      <p className="mb-3 text-[13px] font-bold" aria-hidden>
        {title}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  );
}

function FilterOption({
  label,
  checked,
  indent = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  indent?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 text-[13px] select-none",
        indent && "pl-3",
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className="flex size-[17px] flex-none items-center justify-center rounded-[5px] border-[1.5px] border-line-strong text-transparent transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent group-hover:border-accent"
        aria-hidden
      >
        <CheckIcon width={11} height={11} />
      </span>
      <span className={cn("min-w-0 flex-1", checked && "font-semibold")}>{label}</span>
    </label>
  );
}
