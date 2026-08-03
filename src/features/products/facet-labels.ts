import { LOCALE_CURRENCY, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format/currency";
import { interpolate } from "@/lib/format/interpolate";

import { priceBucketBound, type FacetKey, type PriceBucket } from "./filters";

/**
 * Display strings for facet values.
 *
 * Only the values that genuinely differ per language live in the dictionary.
 * Price bands are *derived* from their bounds so the label and the filter can
 * never disagree, and "32GB" is the same in both storefronts — translating
 * either would create a second source of truth for no benefit.
 */

type FacetOptionKey = keyof Dictionary["facetOptions"];

export function priceBucketLabel(
  bucket: PriceBucket,
  locale: Locale,
  t: Dictionary,
): string {
  const { min, max } = priceBucketBound(bucket, locale);
  const currency = LOCALE_CURRENCY[locale];

  if (max === null) return interpolate(t.priceOver, { min: formatPrice(min, currency) });
  if (min === 0) return interpolate(t.priceUnder, { max: formatPrice(max, currency) });

  return interpolate(t.priceRange, {
    min: formatPrice(min, currency),
    max: formatPrice(max, currency),
  });
}

export function facetOptionLabel(
  key: FacetKey,
  value: string,
  locale: Locale,
  t: Dictionary,
): string {
  if (key === "ram") return `${value}GB`;
  if (key === "price") return priceBucketLabel(value as PriceBucket, locale, t);

  return t.facetOptions[value as FacetOptionKey] ?? value;
}

/** `500 → "500GB"`, `2000 → "2TB"`. */
export function storageLabel(storageGb: number): string {
  return storageGb >= 1000 ? `${storageGb / 1000}TB` : `${storageGb}GB`;
}
