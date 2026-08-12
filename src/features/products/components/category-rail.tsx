import Link from "next/link";

import type { Category } from "@/features/catalog/types";
import { categoryHref } from "@/features/products/filters";
import type { Locale } from "@/i18n/config";

/**
 * Direct children of the selected category, deliberately separate from the
 * sidebar filters. On phones, every option is visible in a two-column grid;
 * a horizontal scroller hides options and makes category discovery needlessly
 * difficult. Desktop keeps the compact wrapping tab rail.
 */
export function CategoryRail({
  categories,
  locale,
}: {
  categories: Category[];
  locale: Locale;
}) {
  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Subcategories"
      className="mb-6 border-y border-line-soft bg-mist-soft p-2 md:mb-9 md:px-4 md:py-2.5"
    >
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={categoryHref(locale, category.id)}
            className="group flex min-h-11 min-w-0 items-center justify-between gap-2 border border-line bg-surface px-3 py-2.5 text-[12px] font-bold transition-colors hover:border-line-strong hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex md:min-h-0 md:py-2"
          >
            <span className="line-clamp-2">{category.name}</span>
            <span
              className="text-[13px] leading-none text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
