"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { Brand } from "@/features/catalog/types";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { priceBucketLabel } from "../facet-labels";
import { PRICE_BUCKETS, activeFilterCount, type PriceBucket, type ProductQuery } from "../filters";

const BRAND_PREVIEW_COUNT = 6;

/**
 * The filter sidebar. Pure presentation over `query` + the reference lists:
 * filter values live in the *URL*, making a filtered view shareable,
 * bookmarkable and restorable with the back button. The brand group's local
 * state only controls search and disclosure; it never changes filter meaning.
 *
 * Each group is single-select, so clicking an option replaces the previous
 * selection and clicking it again clears it. Category navigation lives in the
 * listing header instead of competing with filters in this panel.
 */
export function ProductFilterPanel({
  query,
  brands,
  onSetBrand,
  onSetPrice,
  onToggleInStock,
  onClear,
  /** The mobile drawer supplies its own title bar, so it turns this off. */
  showHeading = true,
  className,
}: {
  query: ProductQuery;
  brands: Brand[];
  onSetBrand: (brandSlug: string) => void;
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

      {brands.length > 0 ? (
        <FilterGroup title={t.filterGroups.brand} first={!showHeading}>
          <BrandFilter brands={brands} selectedSlug={query.brand} onSelect={onSetBrand} />
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

function BrandFilter({
  brands,
  selectedSlug,
  onSelect,
}: {
  brands: Brand[];
  selectedSlug: string;
  onSelect: (brandSlug: string) => void;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredBrands = useMemo(
    () =>
      normalizedSearch
        ? brands.filter((brand) => brand.name.toLocaleLowerCase().includes(normalizedSearch))
        : brands,
    [brands, normalizedSearch],
  );

  const visibleBrands = useMemo(() => {
    if (normalizedSearch || expanded || brands.length <= BRAND_PREVIEW_COUNT) return filteredBrands;

    const preview = brands.slice(0, BRAND_PREVIEW_COUNT);
    const selected = brands.find((brand) => brand.slug === selectedSlug);
    return selected && !preview.some((brand) => brand.id === selected.id)
      ? [...preview, selected]
      : preview;
  }, [brands, expanded, filteredBrands, normalizedSearch, selectedSlug]);

  const canExpand = brands.length > BRAND_PREVIEW_COUNT;
  const useScrollableList = expanded || normalizedSearch.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {canExpand ? (
        <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-2.5 transition-colors focus-within:border-accent">
          <SearchIcon className="size-3.5 flex-none text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.filterBrandSearch}
            aria-label={t.filterBrandSearch}
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-faint"
          />
        </label>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-2.5",
          useScrollableList && "max-h-52 overflow-y-auto overscroll-contain pr-1",
        )}
      >
        {visibleBrands.length > 0 ? (
          visibleBrands.map((brand) => (
            <FilterOption
              key={brand.id}
              label={brand.name}
              checked={selectedSlug === brand.slug}
              onChange={() => onSelect(brand.slug)}
            />
          ))
        ) : (
          <p className="py-2 text-[12.5px] text-ink-faint">{t.filterBrandEmpty}</p>
        )}
      </div>

      {canExpand && !normalizedSearch ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-fit cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold text-accent transition-colors hover:text-accent/80"
        >
          {expanded
            ? t.filterBrandShowLess
            : t.filterBrandShowMore.replace(
                "{count}",
                String(Math.max(0, brands.length - BRAND_PREVIEW_COUNT)),
              )}
          <ChevronDownIcon
            className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>
      ) : null}
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
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 text-[13px] select-none">
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
