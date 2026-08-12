/**
 * Locale-stable money formatting.
 *
 * The storefront displays prices as Japanese yen. `en-US` gives the compact
 * half-width yen sign (`¥`) while still using JPY currency rules. The explicit
 * `Intl` locale still matters: calling
 * `toLocaleString()` with no argument formats using the *runtime's* locale,
 * which differs between the Node server and the user's browser and produces
 * a hydration mismatch.
 */
const FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "JPY",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatPrice(amount: number): string {
  return FORMATTER.format(amount);
}
