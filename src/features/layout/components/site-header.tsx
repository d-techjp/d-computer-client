import Link from "next/link";

import { UserIcon } from "@/components/ui/icons";
import { CartMenu } from "@/features/cart/components/cart-menu";
import { ProductSearch } from "@/features/search/components/product-search";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Server Component that composes two client islands (search, cart). This is the
 * "client boundary as a leaf" idea: the shell, the nav links and the logo are
 * server-rendered HTML, and only the two genuinely interactive widgets carry
 * JavaScript to the browser.
 */
export function SiteHeader({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="shell flex flex-nowrap items-center gap-4 px-8 py-3.5">
        <Link href={`/${locale}`} className="flex flex-none items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image processing */}
          <img src="/logo-d-tech.png" alt={t.companyName} className="h-11 w-auto flex-none" />
          <span>
            <span className="block text-[17px] font-black tracking-[0.5px] whitespace-nowrap">
              {t.companyName}
            </span>
            <span className="block text-[11px] whitespace-nowrap text-ink-subtle">{t.tagline}</span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] font-medium">
          {t.navItems.map((item) => (
            <Link
              key={item}
              href={`/${locale}`}
              className="border-b-2 border-transparent pb-1 whitespace-nowrap transition-colors hover:border-accent hover:text-accent"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-3">
          <ProductSearch />

          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent"
          >
            <UserIcon />
            {t.login}
          </button>

          <CartMenu />
        </div>
      </div>
    </header>
  );
}
