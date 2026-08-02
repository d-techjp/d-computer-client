import type { Currency } from "@/i18n/config";

/**
 * Locale-stable money formatting.
 *
 * The explicit `Intl` locale per currency matters: calling `toLocaleString()`
 * with no argument formats using the *runtime's* locale, which differs between
 * the Node server and the user's browser and produces a hydration mismatch.
 */
const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  VND: new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }),
  JPY: new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
};

export function formatPrice(amount: number, currency: Currency): string {
  const formatted = FORMATTERS[currency].format(amount);
  return currency === "JPY" ? `¥${formatted}` : `${formatted}₫`;
}
