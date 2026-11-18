import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AccountGuard } from "@/features/account/components/account-guard";
import { AccountNav } from "@/features/account/components/account-nav";
import { getDictionary } from "@/i18n/get-dictionary";

// Per request like the rest of the site: the root layout reads categories and
// site settings from the backend, which CI cannot reach while building.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.account.title, robots: { index: false, follow: false } };
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const t = await getDictionary();

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="shell py-7 md:py-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-[12.5px] text-ink-muted md:mb-7">
          <Link href="/" className="transition-colors hover:text-accent">
            {t.navItems[0]}
          </Link>
          <span className="mx-2 text-ink-faint" aria-hidden>
            /
          </span>
          <span className="font-semibold text-ink-body">{t.account.title}</span>
        </nav>

        <header className="mb-7 border-b border-line pb-6 md:mb-9 md:pb-7">
          <p className="mb-2 text-[11px] font-black tracking-[1.4px] text-accent uppercase">
            {t.account.eyebrow}
          </p>
          <h1 className="text-[28px] leading-tight font-black md:text-[38px]">
            {t.account.title}
          </h1>
        </header>

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <AccountNav />
          <AccountGuard>{children}</AccountGuard>
        </div>
      </div>
    </div>
  );
}
