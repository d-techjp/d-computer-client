import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";

import { CartBar } from "@/features/cart/components/cart-bar";
import { CartAddToast } from "@/features/cart/components/cart-add-toast";
import { buildCategoryTree } from "@/features/catalog/tree";
import { SiteChromeGate } from "@/features/layout/components/site-chrome-gate";
import { SiteFooter } from "@/features/layout/components/site-footer";
import { SiteHeader } from "@/features/layout/components/site-header";
import { SocialBubbles } from "@/features/layout/components/social-bubbles";
import { Topbar } from "@/features/layout/components/topbar";
import { shopPhones } from "@/features/layout/lib/shop-phones";
import { LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/i18n-provider";
import { listCategories } from "@/server/services/catalog.service";
import { getSiteSettings } from "@/server/services/site-settings.service";

import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

// Every page reads categories and site settings from the backend through this
// layout, and the backend is not reachable while CI builds the image. Declared
// here so it also covers routes with no page file of their own (`/_not-found`).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteSettings] = await Promise.all([getDictionary(), getSiteSettings()]);

  return {
    title: { default: siteSettings.companyName, template: `%s | ${siteSettings.companyName}` },
    description: t.tagline,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    // No site-wide canonical here: a layout-level one is inherited by every page
    // that does not set its own, declaring it a duplicate of the home page.
    icons: {
      icon: [{ url: "/logo-d-tech.png", type: "image/png" }],
      shortcut: [{ url: "/logo-d-tech.png", type: "image/png" }],
      apple: [{ url: "/logo-d-tech.png", type: "image/png" }],
    },
    openGraph: {
      title: siteSettings.companyName,
      description: t.tagline,
      locale: "ja_JP",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The header's category menu needs the catalogue tree on every page, so the
  // layout reads it once here rather than each page threading it through.
  const [t, categories, siteSettings] = await Promise.all([
    getDictionary(),
    listCategories(),
    getSiteSettings(),
  ]);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansJp.variable} antialiased`}>
        {/* The dictionary is serialised into the client tree exactly once. */}
        <I18nProvider value={{ locale: LOCALE, t }}>
          <SiteChromeGate>
            <Topbar t={t} phones={shopPhones(siteSettings)} />
            <SiteHeader
              t={t}
             
              categories={buildCategoryTree(categories)}
              siteSettings={siteSettings}
            />
          </SiteChromeGate>
          <main>{children}</main>
          <SiteChromeGate>
            <SiteFooter siteSettings={siteSettings} />
            {/* The bottom bar is fixed, so the last of the footer would sit under
                it forever without a matching run-off below `lg`. */}
            <div className="h-[calc(4.25rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
          </SiteChromeGate>
          <SocialBubbles socialLinks={siteSettings.socialLinks} />
          <CartBar />
          <CartAddToast />
        </I18nProvider>
      </body>
    </html>
  );
}
