import type { Locale } from "@/i18n/config";

const INTL_LOCALE: Record<Locale, string> = { ja: "ja-JP", vi: "vi-VN" };

const FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat(INTL_LOCALE.ja, { year: "numeric", month: "2-digit", day: "2-digit" }),
  vi: new Intl.DateTimeFormat(INTL_LOCALE.vi, { year: "numeric", month: "2-digit", day: "2-digit" }),
};

export function formatDate(iso: string, locale: Locale): string {
  return FORMATTERS[locale].format(new Date(iso));
}
