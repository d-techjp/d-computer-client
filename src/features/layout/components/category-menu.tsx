"use client";

import Link from "next/link";
import { useState } from "react";

import { ChevronRightIcon, MenuIcon } from "@/components/ui/icons";
import type { CategoryNode } from "@/features/catalog/tree";
import { categoryHref } from "@/features/products/filters";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

/**
 * The "all categories" launcher in the header bar: hovering it drops a column
 * of top-level categories, and hovering one of those opens a panel beside it
 * with everything underneath.
 *
 * Hover drives it, but hover is never the *only* way in — the button toggles on
 * click for touch, focus opens the same panels for keyboard users, and every
 * entry is a real link, so the menu still navigates with JavaScript disabled.
 *
 * Open state is local rather than in the shared UI store: that store exists to
 * keep the click-opened overlays (cart, search, mobile nav) mutually exclusive,
 * and a menu that closes as soon as the pointer leaves does not need to
 * participate. It does close on navigation, which the store would not do.
 */
export function CategoryMenu({
  categories,
  /**
   * Set when the menu sits in the condensed header's single row rather than
   * leading its own nav bar: a self-contained pill instead of a tab welded to
   * the bar's top edge.
   */
  compact = false,
}: {
  categories: CategoryNode[];
  compact?: boolean;
}) {
  const { locale, t } = useI18n();

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setActiveId(null);
  };

  if (categories.length === 0) return null;

  const active = categories.find((category) => category.id === activeId) ?? null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        data-open={open}
        className={cn(
          "site-header__category-trigger flex h-full cursor-pointer items-center gap-2 text-[13px] font-bold",
          compact
            ? "site-header__category-trigger--compact rounded-md border px-3.5 py-2"
            : "site-header__category-trigger--nav px-5 py-2.5",
        )}
      >
        <MenuIcon className="size-4" aria-hidden />
        {t.categoryRailTitle}
        <ChevronRightIcon
          className={cn(
            "size-3.5 transition-transform duration-200",
            open ? "-rotate-90" : "rotate-90",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className={cn(
            "site-header__category-flyout absolute top-full left-0 z-50 flex animate-flyout",
            // Padding, never margin: the compact pill stops short of the
            // header's edge, and this has to *bridge* that gap rather than
            // leave a dead strip that fires `mouseleave` on the way down.
            compact ? "pt-3 md:pt-3.5" : "pt-px",
          )}
          // A click navigates client-side, so the pointer never "leaves" the
          // panel and it would otherwise hang over the page it just opened.
          onClick={close}
        >
          {/* Level 1 — the parent column. */}
          <ul className="w-64 flex-none rounded-bl-lg border border-line bg-surface py-1.5 shadow-pop">
            {categories.map((category) => {
              const isActive = category.id === activeId;

              return (
                <li key={category.id}>
                  <Link
                    href={categoryHref(locale, category.slug)}
                    onMouseEnter={() => setActiveId(category.id)}
                    onFocus={() => setActiveId(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium transition-colors",
                      isActive ? "bg-mist text-accent" : "hover:bg-mist hover:text-accent",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    {/* Nudges toward its panel when open, so the row that is
                        driving the panel beside it is unambiguous. */}
                    {category.children.length > 0 ? (
                      <ChevronRightIcon
                        className={cn(
                          "size-3.5 flex-none transition-transform duration-200",
                          isActive ? "translate-x-0.5 text-accent" : "text-ink-faint",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}

            <li className="mt-1 border-t border-line-soft px-4 pt-2.5 pb-1">
              <Link
                href={`/${locale}/products`}
                className="text-[12.5px] font-bold text-accent underline-offset-4 hover:underline"
              >
                {t.categoryRailAll} <span aria-hidden>→</span>
              </Link>
            </li>
          </ul>

          {/* Level 2 — everything under the hovered parent. */}
          {active && active.children.length > 0 ? (
            <MegaPanel category={active} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The wide panel beside the parent column.
 *
 * Children that have children of their own become headed columns; the plain
 * ones are collected into a single column under the parent's own name. That is
 * what makes a deep branch read like the grouped layout it is, without the
 * shallow branches rendering as a wall of lonely headings.
 */
function MegaPanel({ category }: { category: CategoryNode }) {
  const { locale, t } = useI18n();

  const groups = category.children.filter((child) => child.children.length > 0);
  const loose = category.children.filter((child) => child.children.length === 0);

  // Columns are counted, not fixed: a two-level branch has one column and the
  // panel stays narrow, while a deep one fills out to four and wraps. A fixed
  // width would leave today's shallow catalogue as mostly empty panel.
  const columns = Math.min(4, (loose.length > 0 ? 1 : 0) + groups.length);

  return (
    <div className="max-h-[70vh] w-max max-w-[min(56rem,60vw)] overflow-y-auto rounded-br-lg border border-l-0 border-line bg-surface px-6 py-5 shadow-pop">
      <div
        className="grid gap-x-8 gap-y-6"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(11rem, 1fr))` }}
      >
        {loose.length > 0 ? (
          <MegaColumn
            heading={category.name}
            headingHref={categoryHref(locale, category.slug)}
            items={loose}
          />
        ) : null}

        {groups.map((group) => (
          <MegaColumn
            key={group.id}
            heading={group.name}
            headingHref={categoryHref(locale, group.slug)}
            items={group.children}
          />
        ))}
      </div>

      <Link
        href={categoryHref(locale, category.slug)}
        className="mt-5 inline-block border-t border-line-soft pt-4 text-[12.5px] font-bold text-accent underline-offset-4 hover:underline"
      >
        {t.categoryMenuViewAll.replace("{name}", category.name)} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function MegaColumn({
  heading,
  headingHref,
  items,
}: {
  heading: string;
  headingHref: string;
  items: CategoryNode[];
}) {
  return (
    <div className="min-w-0">
      <Link
        href={headingHref}
        className="mb-2 block truncate text-[12.5px] font-black tracking-[0.4px] text-accent uppercase underline-offset-4 hover:underline"
      >
        {heading}
      </Link>
      <MegaList items={items} />
    </div>
  );
}

/**
 * A column's links, nesting for as many levels as the branch actually has.
 *
 * The panel's columns are drawn from the first two levels, so anything below
 * those lands here. Rather than truncate it, each level indents under its
 * parent against a rule — a fourth-level entry stays reachable instead of
 * being silently dropped from the menu.
 */
function MegaList({ items }: { items: CategoryNode[] }) {
  const { locale } = useI18n();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={categoryHref(locale, item.slug)}
            className="block truncate rounded py-1 text-[13px] text-ink-body transition-colors hover:text-accent"
          >
            {item.name}
          </Link>

          {item.children.length > 0 ? (
            <div className="mt-0.5 mb-1 ml-1 border-l border-line-soft pl-2.5">
              <MegaList items={item.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
