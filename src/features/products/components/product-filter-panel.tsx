"use client";

import { CheckIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { facetOptionLabel } from "../facet-labels";
import {
  FACET_KEYS,
  FACET_OPTIONS,
  activeFacetCount,
  isFacetSelected,
  type FacetKey,
  type ProductQuery,
} from "../filters";
import type { FacetCounts } from "../types";

/**
 * The facet checkboxes. Pure presentation over `query` + `facets`: it holds no
 * state of its own, because the *URL* is the state. That is what makes a
 * filtered view shareable, bookmarkable and restorable with the back button —
 * and it is why the same component can render in the desktop sidebar and
 * inside the mobile drawer without the two ever disagreeing.
 */
export function ProductFilterPanel({
  query,
  facets,
  onToggle,
  onClear,
  /** The mobile drawer supplies its own title bar, so it turns this off. */
  showHeading = true,
  className,
}: {
  query: ProductQuery;
  facets: FacetCounts;
  onToggle: (key: FacetKey, value: string) => void;
  onClear: () => void;
  showHeading?: boolean;
  className?: string;
}) {
  const { locale, t } = useI18n();
  const active = activeFacetCount(query);

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

      {FACET_KEYS.map((key, index) => (
        <fieldset
          key={key}
          className={cn(
            "border-line-soft pt-4",
            // No rule above the first group when it is also the first thing in
            // the drawer — the title bar already draws one.
            (showHeading || index > 0) && "mt-4 border-t",
          )}
        >
          <legend className="sr-only">{t.facetGroups[key]}</legend>
          <p className="mb-3 text-[13px] font-bold" aria-hidden>
            {t.facetGroups[key]}
          </p>

          <div className="flex flex-col gap-2.5">
            {(FACET_OPTIONS[key] as readonly string[]).map((value) => {
              const count = facets[key][value] ?? 0;
              const checked = isFacetSelected(query, key, value);
              // A zero-count option stays visible but unclickable: hiding it
              // would make the list jump around as you tick things.
              const unavailable = count === 0 && !checked;

              return (
                <label
                  key={value}
                  className={cn(
                    "group flex items-center gap-2.5 text-[13px] select-none",
                    unavailable ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={unavailable}
                    onChange={() => onToggle(key, value)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-[17px] flex-none items-center justify-center rounded-[5px] border-[1.5px] border-line-strong text-transparent transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                      !unavailable && "group-hover:border-accent",
                    )}
                    aria-hidden
                  >
                    <CheckIcon width={11} height={11} />
                  </span>
                  <span className={cn("min-w-0 flex-1", checked && "font-semibold")}>
                    {facetOptionLabel(key, value, locale, t)}
                  </span>
                  <span className="flex-none text-[11.5px] text-ink-faint tabular-nums">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
