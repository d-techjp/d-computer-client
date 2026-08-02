"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { useDismissable } from "@/hooks/use-dismissable";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { useIsPanelOpen, useUiStore } from "../store/ui.store";

/**
 * Switching language is a *navigation*, not local state.
 *
 * The original swapped a `lang` field in component state, so the URL never
 * changed: no bookmarking, no sharing, nothing for a crawler to index. Routing
 * to `/vi/...` makes each storefront a real, indexable page, and the new
 * dictionary is rendered on the server.
 */
export function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const open = useIsPanelOpen("language");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);

  const ref = useDismissable<HTMLDivElement>(open, close);

  const switchTo = useCallback(
    (next: Locale) => {
      close();
      if (next === locale) return;

      // `/ja/products/x` → `/vi/products/x`
      const segments = pathname.split("/");
      segments[1] = next;
      startTransition(() => router.push(segments.join("/")));
    },
    [close, locale, pathname, router],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => toggle("language")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold opacity-90 transition-opacity hover:opacity-100",
          isPending && "opacity-50",
        )}
      >
        {LOCALE_LABELS[locale]}
        <span
          className={cn("text-[9px] transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+10px)] right-0 z-70 min-w-30 overflow-hidden rounded-lg bg-white shadow-menu"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => switchTo(option)}
              className={cn(
                "block w-full cursor-pointer px-4 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-mist",
                option === locale && "text-accent",
              )}
            >
              {LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
