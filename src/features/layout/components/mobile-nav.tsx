"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CloseIcon, MenuIcon, PhoneIcon, UserIcon } from "@/components/ui/icons";
import { navHref } from "@/config/nav";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";

import { useIsPanelOpen, useUiStore } from "../store/ui.store";

/**
 * The navigation below `lg`, where six inline links plus a search field plus a
 * cart cannot share one row without wrapping into an unusable pile.
 *
 * It shares the single-panel UI store with the cart and search dropdowns, so
 * opening the menu closes whatever else was open — the invariant that would be
 * easy to break with a boolean per overlay. Outside-click and Escape come from
 * `useDismissable`, the same hook every other overlay on the site uses.
 */
export function MobileNav() {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  const open = useIsPanelOpen("nav");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);

  const panelRef = useDismissable<HTMLElement>(open, close);

  // A tap that navigates must also dismiss the sheet; without this the new page
  // renders underneath a menu that is still covering it.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // The sheet covers the viewport — letting the page scroll behind it is the
  // classic mobile bug where dismissing it leaves you somewhere else entirely.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => toggle("nav")}
        aria-expanded={open}
        aria-label={t.menu}
        className="flex cursor-pointer items-center justify-center text-ink transition-colors hover:text-accent lg:hidden"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="fixed inset-0 z-60 bg-ink-strong/40 lg:hidden">
          <nav
            ref={panelRef}
            aria-label={t.menu}
            className="absolute inset-y-0 right-0 flex w-[82vw] max-w-[320px] flex-col overflow-y-auto bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <span className="text-sm font-black">{t.menu}</span>
              <button
                type="button"
                onClick={close}
                aria-label={t.menuClose}
                className="cursor-pointer text-ink-muted transition-colors hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col px-2 py-2">
              {t.navItems.map((item, index) => (
                <Link
                  key={item}
                  href={navHref(locale, index)}
                  onClick={close}
                  className="rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:bg-mist hover:text-accent"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="mt-auto border-t border-line-soft px-5 py-4">
              <button
                type="button"
                className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
              >
                <UserIcon />
                {t.login}
              </button>

              <a
                href={`tel:${t.phone.replace(/-/g, "")}`}
                className="flex items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-accent"
              >
                <PhoneIcon />
                {t.phone}
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
