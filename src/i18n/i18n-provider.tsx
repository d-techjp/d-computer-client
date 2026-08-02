"use client";

import { createContext, use, type ReactNode } from "react";

import type { Locale } from "./config";
import type { Dictionary } from "./get-dictionary";

type I18nValue = {
  locale: Locale;
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * The dictionary is resolved on the server and handed to the client tree once.
 * Client Components read it from context instead of receiving it through five
 * layers of props — and no translation file reaches the browser bundle beyond
 * the active locale.
 */
export function I18nProvider({
  value,
  children,
}: {
  value: I18nValue;
  children: ReactNode;
}) {
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const value = use(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return value;
}
