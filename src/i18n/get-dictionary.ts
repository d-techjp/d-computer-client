import "server-only";

import type { Locale } from "./config";
import type ja from "./dictionaries/ja";

export type Dictionary = typeof ja;

/**
 * Dictionaries are loaded through dynamic `import()` so only the requested
 * locale is ever pulled into the server bundle for a request — the standard
 * App Router i18n pattern. `server-only` makes accidentally importing this
 * from a Client Component a build error.
 */
const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  ja: () => import("./dictionaries/ja"),
  vi: () => import("./dictionaries/vi"),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await loaders[locale]();
  return mod.default;
}
