"use client";

import Link from "next/link";

import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import type { SiteSettings } from "@/features/layout/api/site-settings.schema";
import { useReveal } from "@/hooks/use-reveal";
import { useI18n } from "@/i18n/i18n-provider";

const FOOTER_LINK_CLASS = "opacity-85 transition hover:text-accent hover:opacity-100";

/** `""` = no destination page yet, falls back to the storefront home. An absolute
 * URL is used as-is (external); anything else is a storefront-relative path. */
function resolveFooterLinkHref(locale: Locale, url: string): string {
  if (!url) return `/${locale}`;
  if (/^https?:\/\//i.test(url)) return url;
  return `/${locale}${url}`;
}

export function SiteFooter({ siteSettings }: { siteSettings: SiteSettings }) {
  const { locale, t } = useI18n();
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <footer
      ref={ref}
      data-revealed={revealed}
      className="reveal bg-ink-strong text-ink-invert"
    >
      <div className="shell grid grid-cols-1 gap-8 pt-12 pb-7 xs:grid-cols-2 md:pt-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image processing */}
            <img src="/logo-d-tech.png" alt={siteSettings.companyName} className="h-9 w-auto" />
            <span className="text-base font-extrabold text-white">{siteSettings.companyName}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed">{t.tagline}</p>
          <div className="mt-4 flex flex-col gap-2 text-[12.5px] opacity-85">
            <span className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 flex-none" />
              {siteSettings.address}
            </span>
            <a href={`tel:${siteSettings.phone.replace(/-/g, "")}`} className="flex items-center gap-2 transition hover:text-accent hover:opacity-100">
              <PhoneIcon className="flex-none" />
              {siteSettings.phone}
            </a>
          </div>
          <div className="mt-[18px] flex gap-3">
            {siteSettings.socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="block size-6 overflow-hidden rounded-full ring-2 ring-white sm:size-7"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed logo URL, arbitrary domain */}
                <img src={social.logoUrl} alt="" className="size-full object-cover" />
              </a>
            ))}
          </div>
        </div>

        {siteSettings.footerColumns.map((column) => (
          <div key={column.id}>
            <h3 className="mb-3.5 text-sm font-bold text-white">{column.title}</h3>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {column.links.map((link) =>
                /^https?:\/\//i.test(link.url) ? (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_LINK_CLASS}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.id}
                    href={resolveFooterLinkHref(locale, link.url)}
                    className={FOOTER_LINK_CLASS}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-2.5 border-t border-line-invert py-5 text-xs">
        <span>{t.copyright}</span>
      </div>
    </footer>
  );
}
