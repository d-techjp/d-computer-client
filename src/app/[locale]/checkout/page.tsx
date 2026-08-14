import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutFlow } from "@/features/checkout/components/checkout-flow";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  return {
    title: t.checkoutTitle,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="shell py-7 md:py-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-[12.5px] text-ink-muted md:mb-7">
          <Link href={`/${locale}`} className="transition-colors hover:text-accent">
            {t.navItems[0]}
          </Link>
          <span className="mx-2 text-ink-faint" aria-hidden>
            /
          </span>
          <span className="font-semibold text-ink-body">{t.checkoutTitle}</span>
        </nav>

        <header className="mb-7 border-b border-line pb-6 md:mb-9 md:pb-7">
          <p className="mb-2 text-[11px] font-black tracking-[1.4px] text-accent uppercase">
            {t.checkoutEyebrow}
          </p>
          <h1 className="text-[28px] leading-tight font-black md:text-[38px]">
            {t.checkoutTitle}
          </h1>
        </header>

        <CheckoutFlow />
      </div>
    </div>
  );
}
