/**
 * Locale-stable money formatting.
 *
 * The storefront prices in VND only — the backend does not carry a
 * per-locale price book — so this always formats in `vi-VN` regardless of
 * the UI locale. The explicit `Intl` locale still matters: calling
 * `toLocaleString()` with no argument formats using the *runtime's* locale,
 * which differs between the Node server and the user's browser and produces
 * a hydration mismatch.
 */
const FORMATTER = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export function formatPrice(amount: number): string {
  return `${FORMATTER.format(amount)}₫`;
}
