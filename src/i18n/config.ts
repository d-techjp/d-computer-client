export const LOCALES = ["ja", "vi"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  vi: "Tiếng Việt",
};

/** Currency each storefront prices in. Drives formatting, not conversion. */
export const LOCALE_CURRENCY = {
  ja: "JPY",
  vi: "VND",
} as const satisfies Record<Locale, string>;

export type Currency = (typeof LOCALE_CURRENCY)[Locale];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * A value that exists once per locale. Source data is authored this way and
 * flattened to a plain string by the service layer before it leaves the server,
 * so components never carry translation logic.
 */
export type Localized<T> = Record<Locale, T>;

export function resolve<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
