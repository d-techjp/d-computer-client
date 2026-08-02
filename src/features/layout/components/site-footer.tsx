"use client";

import Link from "next/link";

import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { useReveal } from "@/hooks/use-reveal";
import { useI18n } from "@/i18n/i18n-provider";

const SOCIALS = ["X", "Y", "IG", "FB"];
const PAYMENTS = ["VISA", "MC", "JCB", "AMEX", "PAY"];

export function SiteFooter() {
  const { locale, t } = useI18n();
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <footer
      ref={ref}
      data-revealed={revealed}
      className="reveal bg-ink-strong text-ink-invert"
    >
      <div className="shell grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8 px-8 pt-14 pb-7 max-lg:grid-cols-2 max-sm:grid-cols-1">
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
              <button
                key={social}
                type="button"
                aria-label={social}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-line-invert text-xs transition-colors hover:bg-accent"
              >
                {social}
              </button>
            ))}
          </div>
        </div>

        {t.footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3.5 text-sm font-bold text-white">{column.title}</h3>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {column.links.map((link) => (
                <Link
                  key={link}
                  href={`/${locale}`}
                  className="opacity-85 transition hover:text-accent hover:opacity-100"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-2.5 border-t border-line-invert px-8 py-5 text-xs">
        <span>{t.copyright}</span>
        <div className="flex gap-2">
          {PAYMENTS.map((payment) => (
            <span
              key={payment}
              className="rounded bg-white px-2.5 py-1 text-[11px] font-bold text-ink-strong"
            >
              {payment}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
