import type { Currency, Locale } from "@/i18n/config";

export type SpecRow = {
  label: string;
  value: string;
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
  /**
   * List price in every storefront currency. The cart snapshots this so a line
   * added on the Japanese store still totals correctly after switching to the
   * Vietnamese one — the storefronts price independently, they are not an FX
   * conversion of each other.
   */
  priceBook: Record<Locale, number>;
};

export type Post = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  image: string;
};
