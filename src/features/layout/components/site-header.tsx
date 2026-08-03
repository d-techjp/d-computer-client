import Link from "next/link";

import { UserIcon } from "@/components/ui/icons";
import { navHref } from "@/config/nav";
import { CartMenu } from "@/features/cart/components/cart-menu";
import { ProductSearch } from "@/features/search/components/product-search";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { MobileNav } from "./mobile-nav";

/**
 * Server Component that composes three client islands (search, cart, mobile
 * menu). This is the "client boundary as a leaf" idea: the shell, the nav links
 * and the logo are server-rendered HTML, and only the genuinely interactive
 * widgets carry JavaScript to the browser.
 *
 * The inline nav is hidden below `lg` rather than allowed to wrap: six links,
 * a search field, a login button and a cart in one row is a layout that only
 * works on a desktop, and `<MobileNav>` renders the same list as a sheet.
 */
export function SiteHeader({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="shell flex flex-nowrap items-center gap-3 py-3 md:gap-4 md:py-3.5">
        <Link href={`/${locale}`} className="flex flex-none items-center gap-2.5 md:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image processing */}
          <img
            src="/logo-d-tech.png"
            alt={t.companyName}
            className="h-9 w-auto flex-none md:h-11"
          />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-black tracking-[0.5px] md:text-[17px]">
              {t.companyName}
            </span>
            <span className="hidden text-[11px] whitespace-nowrap text-ink-subtle sm:block">
              {t.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] font-medium lg:flex">
          {t.navItems.map((item, index) => (
            <Link
              key={item}
              href={navHref(locale, index)}
              className="border-b-2 border-transparent pb-1 whitespace-nowrap transition-colors hover:border-accent hover:text-accent"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2.5 md:gap-3">
          <ProductSearch />

          <button
            type="button"
            className="hidden cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent lg:flex"
          >
            <UserIcon />
            {t.login}
          </button>

          <CartMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
