/**
 * Fills `{name}` placeholders in a dictionary string.
 *
 * Translations need the variable *inside* the sentence — Japanese puts the
 * count before a counter suffix, Vietnamese after the noun — so concatenating
 * fragments in JSX would force one language's word order onto the other.
 * Unknown placeholders are left untouched so a typo is visible instead of
 * silently rendering "undefined".
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
