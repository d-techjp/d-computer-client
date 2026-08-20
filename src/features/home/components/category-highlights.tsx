"use client";

import Link from "next/link";

import { BADGE_ICONS } from "@/config/glyphs";
import { SlidersIcon } from "@/components/ui/icons";
import type { CategoryNode } from "@/features/catalog/tree";
import { categoryHref } from "@/features/products/filters";
import { useI18n } from "@/i18n/i18n-provider";

/** How many cards fit the hero's height without the stack going scrawny. */
const MAX_CARDS = 4;

type Card = {
  key: string;
  href: string;
  title: string;
  sub: string;
  Icon: (typeof BADGE_ICONS)[number];
};

/**
 * The hero's right column. Same card shape the static trust badges used, but
 * each one now stands for a real catalogue category and links straight into
 * the listing filtered to it — so the panel that used to restate the shop's
 * promises is instead the shortest path from the front page to a product.
 *
 * The sub-line is drawn from whatever the category actually has: its own
 * description, otherwise the names of its children, otherwise a product count.
 * That keeps the card honest for a category the admin has not written copy for
 * yet, instead of rendering a blank row.
 */
export function CategoryHighlights({ categories }: { categories: CategoryNode[] }) {
  const { locale, t } = useI18n();

  const cards: Card[] = categories.slice(0, MAX_CARDS).map((category, index) => ({
    key: category.id,
    href: categoryHref(locale, category.slug),
    title: category.name,
    sub:
      category.description ||
      (category.children.length > 0
        ? category.children.map((child) => child.name).join(" · ")
        : t.categoryCardCount.replace("{count}", String(category.productCount))),
    Icon: BADGE_ICONS[index % BADGE_ICONS.length],
  }));

  if (cards.length === 0) return null;

  // A short catalogue would leave the column stubby next to a full-height
  // banner, so the empty slot becomes the catch-all link rather than blank space.
  if (cards.length < MAX_CARDS) {
    cards.push({
      key: "all",
      href: `/${locale}/products`,
      title: t.categoryRailAll,
      sub: t.categoryCardAllSub,
      Icon: SlidersIcon,
    });
  }

  return (
    <aside className="flex flex-1 flex-col justify-between gap-2 p-4 max-lg:grid max-lg:grid-cols-2 max-lg:pt-0 lg:min-w-52.5">
      {cards.map(({ key, href, title, sub, Icon }) => (
        <Link
          key={key}
          href={href}
          className="group flex flex-1 flex-col justify-center gap-2 rounded border border-[#DEDEDE] px-4 py-4.5 transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_18px_oklch(15%_0.01_260/0.12)]"
        >
          <span
            className="flex size-8.5 items-center justify-center rounded border border-[#9D9D9D] text-ink-strong transition-colors group-hover:border-accent group-hover:text-accent"
            aria-hidden
          >
            <Icon />
          </span>
          <span className="text-[13.5px] leading-[1.4] font-bold text-[#5D5D5D] transition-colors group-hover:text-accent">
            {title}
          </span>
          <span className="line-clamp-2 text-[11.5px] leading-[1.4] text-ink-body">{sub}</span>
        </Link>
      ))}
    </aside>
  );
}
