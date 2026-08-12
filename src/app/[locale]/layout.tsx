import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/features/layout/components/site-footer";
import { SiteHeader } from "@/features/layout/components/site-header";
import { SocialBubbles } from "@/features/layout/components/social-bubbles";
import { Topbar } from "@/features/layout/components/topbar";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/i18n-provider";

import "../globals.css";

/**
 * `[locale]` is the *root* layout: it is the highest segment that knows which
 * language it is rendering, and only the root layout may emit `<html>`. This is
 * the layout structure Next.js recommends for i18n without a library.
 */

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

/** Both storefronts are prerendered at build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);

  return {
    title: { default: t.companyName, template: `%s | ${t.companyName}` },
    description: t.tagline,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((item) => [item, `/${item}`])),
    },
    icons: {
      icon: [{ url: "/logo-d-tech.png", type: "image/png" }],
      shortcut: [{ url: "/logo-d-tech.png", type: "image/png" }],
      apple: [{ url: "/logo-d-tech.png", type: "image/png" }],
    },
    openGraph: {
      title: t.companyName,
      description: t.tagline,
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // A hand-typed `/de` must 404 rather than render an empty dictionary.
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJp.variable} antialiased`}>
        {/* The dictionary is serialised into the client tree exactly once. */}
        <I18nProvider value={{ locale, t }}>
          <Topbar t={t} locale={locale} />
          <SiteHeader t={t} locale={locale} />
          <main>{children}</main>
          <SiteFooter />
          <SocialBubbles />
        </I18nProvider>
      </body>
    </html>
  );
}
