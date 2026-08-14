"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserIcon } from "@/components/ui/icons";
import { navHref } from "@/config/nav";
import { CartMenu } from "@/features/cart/components/cart-menu";
import type { CategoryNode } from "@/features/catalog/tree";
import { ProductSearch } from "@/features/search/components/product-search";
import { useCondensedHeader } from "@/hooks/use-condensed-header";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils/cn";

import { CategoryMenu } from "./category-menu";
import { MobileNav } from "./mobile-nav";

/**
 * Two rows at rest on desktop: brand + search + account utilities on top, and
 * beneath them the navigation bar led by the category launcher. The inline nav
 * is hidden below `lg` rather than allowed to wrap — six links, a search field,
 * a login button and a cart in one row only works with a mouse, and
 * `<MobileNav>` renders the same content as a sheet.
 *
 * Scrolled past `useCondensedHeader`'s threshold, the desktop header drops to a
 * single row: the nav bar folds away and the category launcher joins the
 * utilities that are already up top. Only the launcher moves between rows, and
 * that is the point — search and cart keep their identity, so neither a typed
 * query nor an open cart panel is disturbed by scrolling. The launcher's own
 * state is "which flyout is open", which *should* reset when the page moves.
 *
 * Mobile is unaffected: its single row is already compact, and its `<details>`
 * menu has nothing to fold away.
 *
 * A Client Component only for that scroll state — the nav links and brand are
 * still plain markup, and search/cart/menu were already client islands.
 */
export function SiteHeader({
  t,
  locale,
  categories,
}: {
  t: Dictionary;
  locale: Locale;
  categories: CategoryNode[];
}) {
  const condensed = useCondensedHeader();
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="site-header__main shell flex flex-nowrap items-center gap-3 py-3 md:gap-5 md:py-3.5">
        {/* Leads the row on touch, where the menu is the primary way into the
            catalogue and the left edge is where a thumb expects to find it. */}
        <MobileNav categories={categories} />

        <Link href={`/${locale}`} className="flex min-w-0 flex-none items-center gap-2.5 md:gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image processing */}
          <img
            src="/logo-d-tech.png"
            alt={t.companyName}
            className={cn(
              "w-auto flex-none transition-[height] duration-200",
              condensed ? "h-8 md:h-9" : "h-9 md:h-11",
            )}
          />
          <span className="site-header__brand-copy min-w-0">
            <span className="block truncate text-[15px] font-bold text-[#171717] md:text-[17px]">
              {t.companyName}
            </span>
            {/* First thing to go when space tightens: it is the one line here
                that no one is navigating with. */}
            <span
              className={cn(
                "text-[11px] whitespace-nowrap text-[#77736B]",
                condensed ? "hidden" : "hidden sm:block",
              )}
            >
              {t.tagline}
            </span>
          </span>
        </Link>

        {/* Joins this row only while condensed; otherwise it leads the nav bar
            below, which is where it lives at rest. */}
        {condensed ? (
          <div className="ml-2 hidden lg:block">
            <CategoryMenu categories={categories} compact />
          </div>
        ) : null}

        {/* The cart is not here below `lg` — `<CartBar>` puts it on the bottom
            edge instead, so this row is only search and account on a phone. */}
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2.5 md:gap-3 lg:flex-none">
          <ProductSearch />

          <button
            type="button"
            className="site-header__utility-action hidden cursor-pointer items-center gap-1.5 text-sm font-medium lg:flex"
          >
            <UserIcon />
            {t.login}
          </button>

          <CartMenu />
        </div>
      </div>

      {/* The nav bar. Hidden below `lg` — its links live in `<MobileNav>` and
          its categories in that sheet's own expandable list. Collapsed by
          height rather than unmounted so the fold reads as the header
          compacting, instead of the page below it jumping up a row. */}
      {/* `overflow-hidden` only while collapsing. Left on permanently it also
          clips the category flyout, which drops out of this row — the panel
          renders but is sliced off at the row's height. */}
      <div
        className={cn(
          "site-header__nav hidden transition-[max-height,opacity] duration-200 ease-out lg:block",
          condensed ? "max-h-0 overflow-hidden opacity-0" : "max-h-16 opacity-100",
        )}
        aria-hidden={condensed}
      >
        <div className="shell flex min-h-12 items-stretch gap-1">
          <CategoryMenu categories={categories} />

          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 pl-5 text-[13px] font-medium">
            {t.navItems.map((item, index) => {
              const href = navHref(locale, index);
              const homeHref = `/${locale}`;
              const active =
                index === 0
                  ? pathname === homeHref
                  : href !== homeHref && (pathname === href || pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={item}
                  href={href}
                  tabIndex={condensed ? -1 : 0}
                  aria-current={active ? "page" : undefined}
                  className="site-header__nav-link flex h-full items-center px-3.5 whitespace-nowrap"
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
