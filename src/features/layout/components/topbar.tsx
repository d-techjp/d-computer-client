import Link from "next/link";

import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

import { LanguageSwitcher } from "./language-switcher";

/**
 * Server Component. Only `<LanguageSwitcher>` — the one interactive piece —
 * ships JavaScript; the announcement strip and links are static HTML.
 */
export function Topbar({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <div className="bg-ink-strong text-[12.5px] text-ink-invert-strong">
      <div className="shell flex flex-wrap items-center justify-between gap-2 px-8 py-2">
        <div className="flex flex-wrap gap-5">
          {t.topbarItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-[18px]">
          <Link href={`/${locale}`} className="opacity-85 transition-opacity hover:opacity-100">
            {t.contact}
          </Link>
          <Link href={`/${locale}`} className="opacity-85 transition-opacity hover:opacity-100">
            {t.about}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
