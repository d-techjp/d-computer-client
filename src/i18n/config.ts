export const LOCALES = ["ja", "vi"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  vi: "Tiếng Việt",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
