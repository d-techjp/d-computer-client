import Link from "next/link";

import { PhoneIcon } from "@/components/ui/icons";
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
      <div className="shell flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2">
        {/* Announcements are the first thing to go on a narrow screen: they are
            reassurance, not navigation, and they are repeated in the footer. */}
        <div className="hidden flex-wrap gap-5 lg:flex">
          {t.topbarItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1 max-lg:w-full max-lg:justify-between">
          <a
            href={`tel:${t.phone.replace(/-/g, "")}`}
            className="flex items-center gap-1.5 opacity-85 transition-opacity hover:opacity-100"
          >
            <PhoneIcon />
            {t.phone}
          </a>
          <span className="flex items-center gap-[18px]">
            <Link
              href={`/${locale}`}
              className="hidden opacity-85 transition-opacity hover:opacity-100 sm:inline"
            >
              {t.contact}
            </Link>
            <Link
              href={`/${locale}`}
              className="hidden opacity-85 transition-opacity hover:opacity-100 sm:inline"
            >
              {t.about}
            </Link>
            <LanguageSwitcher />
          </span>
        </div>
      </div>
    </div>
  );
}
