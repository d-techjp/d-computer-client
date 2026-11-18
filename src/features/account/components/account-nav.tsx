"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ACCOUNT_LINKS } from "@/features/auth/lib/account-links";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

export function AccountNav() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label={t.account.title}
      className="-mx-4 mb-7 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0 lg:mb-0 lg:flex-col lg:gap-0.5 lg:border-0"
    >
      {ACCOUNT_LINKS.map((link) => {
        const active =
          link.path === "/account" ? pathname === "/account" : pathname.startsWith(link.path);
        return (
          <Link
            key={link.key}
            href={link.path}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors lg:border-b-0 lg:border-l-2 lg:px-4",
              active
                ? "border-[#C98B14] text-ink-strong lg:bg-[#FFF8E8]"
                : "border-transparent text-ink-muted hover:text-accent",
            )}
          >
            {t.accountMenu[link.key]}
          </Link>
        );
      })}
    </nav>
  );
}
