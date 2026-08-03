import type { Currency, Locale } from "@/i18n/config";

import type { Category, CpuBrand, FacetKey, GpuTier, RamOption } from "./filters";

export type SpecRow = {
  label: string;
  value: string;
};

/**
 * The machine-readable half of a product, as opposed to the prose in `specs`.
 *
 * The listing filters on these and the cards render them as chips, which is why
 * they are typed enums rather than free text: "RTX 4070" parsed out of a spec
 * string would break the moment someone writes "GeForce RTX 4070".
 */
export type ProductAttributes = {
  category: Category;
  cpuBrand: CpuBrand;
  gpu: GpuTier;
  ram: RamOption;
  storageGb: number;
};

/**
 * The shape a component consumes: already translated, already priced in one
 * currency. Nothing downstream of the service layer knows about locales.
 */
export type Product = {
  slug: string;
  name: string;
  tag: string;
  specs: string;
  description: string;
  image: string;
  currency: Currency;
  /** List price, in the smallest sensible unit for the currency. */
  price: number;
  /** Price after the standing 10% storefront discount. */
  salePrice: number;
  discountPercent: number;
  specTable: SpecRow[];
  attributes: ProductAttributes;
  /**
   * List price in every storefront currency. The cart snapshots this so a line
   * added on the Japanese store still totals correctly after switching to the
   * Vietnamese one — the storefronts price independently, they are not an FX
   * conversion of each other.
   */
  priceBook: Record<Locale, number>;
};

/**
 * How many products each facet option would still match — the number rendered
 * beside every checkbox. Computed on the server, consumed by the sidebar, so it
 * is declared here rather than in either.
 */
export type FacetCounts = Record<FacetKey, Record<string, number>>;

export type Post = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  image: string;
};
