/**
 * The storefront is Japanese only. `Locale` stays a type (rather than being
 * inlined as "ja" everywhere) because the Stripe page language and the order's
 * mail language are keyed by it.
 */
export type Locale = "ja";

export const LOCALE: Locale = "ja";
