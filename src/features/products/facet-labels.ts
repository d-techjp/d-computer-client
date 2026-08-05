import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format/currency";
import { interpolate } from "@/lib/format/interpolate";

import { PRICE_BUCKET_BOUNDS, type PriceBucket } from "./filters";

/**
 * Display string for a price band. Derived from its bounds so the label and
 * the filter can never disagree.
 */
export function priceBucketLabel(bucket: PriceBucket, t: Dictionary): string {
  const { min, max } = PRICE_BUCKET_BOUNDS[bucket];

  if (max === null) return interpolate(t.priceOver, { min: formatPrice(min) });
  if (min === 0) return interpolate(t.priceUnder, { max: formatPrice(max) });

  return interpolate(t.priceRange, { min: formatPrice(min), max: formatPrice(max) });
}
