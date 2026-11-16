import "server-only";

import ja from "./dictionaries/ja";

export type Dictionary = typeof ja;

/**
 * Japanese is the only storefront language. Still an async server-only
 * accessor so pages keep one way of reading copy, and `server-only` keeps the
 * dictionary out of Client Component imports (they read it from context).
 */
export async function getDictionary(): Promise<Dictionary> {
  return ja;
}
