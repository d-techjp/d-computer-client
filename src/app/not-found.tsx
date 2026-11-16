import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const t = await getDictionary();

  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-[64px] leading-none font-black text-accent">404</p>
      <h1 className="text-2xl font-black">{t.notFoundTitle}</h1>
      <p className="text-sm text-ink-subtle">{t.notFoundDesc}</p>
      <Link href="/" className={buttonVariants()}>
        {t.navItems[0]}
      </Link>
    </div>
  );
}
