import Link from "next/link";

import { PhoneIcon } from "@/components/ui/icons";
import type { ShopPhone } from "@/features/layout/lib/shop-phones";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Server Component: the announcement strip and links are static HTML.
 */
export function Topbar({ t, phones }: { t: Dictionary; phones: ShopPhone[] }) {
  return (
    <div className="site-topbar border-b border-[#D4AF37]/30 bg-[#FFFDF8] text-[11.5px] text-[#666158]">
      <div className="shell flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
        {/* Announcements are the first thing to go on a narrow screen: they are
            reassurance, not navigation, and they are repeated in the footer. */}
        <div className="hidden flex-wrap gap-6 lg:flex">
          {t.topbarItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1 max-lg:w-full max-lg:justify-between">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {phones.map((item) => (
              <a
                key={item.kind}
                href={item.href}
                className="flex items-center gap-1.5 transition-colors hover:text-[#A98520] [&_svg]:text-[#D4AF37]"
              >
                <PhoneIcon />
                <span className="text-[#A98520]">{t.phoneLabels[item.kind]}</span>
                {item.number}
              </a>
            ))}
          </span>
          <span className="flex items-center gap-[18px]">
            <Link
              href={"/"}
              className="hidden transition-colors hover:text-[#A98520] sm:inline"
            >
              {t.contact}
            </Link>
            <Link
              href={"/"}
              className="hidden transition-colors hover:text-[#A98520] sm:inline"
            >
              {t.about}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
