"use client";

import Link from "next/link";

import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { footerHref } from "@/config/nav";
import { useReveal } from "@/hooks/use-reveal";
import { useI18n } from "@/i18n/i18n-provider";

const SOCIALS = [
  {
    href: "https://www.facebook.com/nguyenviet.dung.92",
    src: "/fb.png",
    label: "Fanpage Facebook",
  },
  {
    href: "https://www.tiktok.com/@dcomputer7?_r=1&_t=ZS-98octHc6xDp",
    src: "/tiktok.png",
    label: "TikTok Shop",
  },
  {
    href: "https://beacons.ai/dcomputer",
    src: "/beacons.png",
    label: "Beacons - Link Bio",
  },
];

export function SiteFooter() {
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
            <img src="/logo-d-tech.png" alt={t.companyName} className="h-9 w-auto" />
            <span className="text-base font-extrabold text-white">{t.companyName}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed">{t.tagline}</p>
          <div className="mt-4 flex flex-col gap-2 text-[12.5px] opacity-85">
            <span className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 flex-none" />
              {t.address}
            </span>
            <a href={`tel:${t.phone.replace(/-/g, "")}`} className="flex items-center gap-2 transition hover:text-accent hover:opacity-100">
              <PhoneIcon className="flex-none" />
              {t.phone}
            </a>
          </div>
          <div className="mt-[18px] flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="block size-6 overflow-hidden rounded-full ring-2 ring-white sm:size-7"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static social icon */}
                <img src={social.src} alt="" className="size-full object-cover" />
              </a>
            ))}
          </div>
        </div>

        {t.footerColumns.map((column, columnIndex) => (
          <div key={column.title}>
            <h3 className="mb-3.5 text-sm font-bold text-white">{column.title}</h3>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {column.links.map((link, linkIndex) => (
                <Link
                  key={link}
                  href={footerHref(locale, columnIndex, linkIndex)}
                  className="opacity-85 transition hover:text-accent hover:opacity-100"
                >
                  {link}
                </Link>
              ))}
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
