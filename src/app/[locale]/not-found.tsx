import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * `not-found.tsx` cannot read route params (it also serves unmatched URLs), so
 * it renders in the default locale.
 */
export default async function NotFound() {
  const t = await getDictionary(DEFAULT_LOCALE);

  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <p className="text-[64px] leading-none font-black text-accent">404</p>
      <h1 className="text-2xl font-black">{t.notFoundTitle}</h1>
      <p className="text-sm text-ink-subtle">{t.notFoundDesc}</p>
      <Link href={`/${DEFAULT_LOCALE}`} className={buttonVariants()}>
        {t.navItems[0]}
      </Link>
    </div>
  );
}
