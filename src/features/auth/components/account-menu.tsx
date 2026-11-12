"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ChevronDownIcon, UserIcon } from "@/components/ui/icons";
import { useIsPanelOpen, useUiStore } from "@/features/layout/store/ui.store";
import { useDismissable } from "@/hooks/use-dismissable";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

import { ACCOUNT_LINKS, loginHref } from "../lib/account-links";
import { useAuthActions, useAuthStatus, useAuthUser } from "../store/auth.store";

/**
 * Header account entry (desktop). Guests get a sign-in link that returns them
 * to the current page; signed-in shoppers get their name and a small menu.
 */
export function AccountMenu() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStatus();
  const user = useAuthUser();
  const { load, logout } = useAuthActions();
  const showToast = useUiStore((state) => state.showToast);

  const open = useIsPanelOpen("account");
  const toggle = useUiStore((state) => state.toggle);
  const close = useUiStore((state) => state.close);
  const ref = useDismissable<HTMLDivElement>(open, close);

  useEffect(() => {
    void load();
  }, [load]);

  const triggerClass =
    "site-header__utility-action hidden cursor-pointer items-center gap-1.5 text-sm font-medium lg:flex";

  if (status !== "authenticated" || !user) {
    return (
      <Link
        href={loginHref(locale, pathname)}
        // Hidden, not absent, while unknown: the slot keeps its width so the
        // header does not shift when the session check comes back.
        className={cn(triggerClass, status === "unknown" && "invisible")}
      >
        <UserIcon />
        {t.login}
      </Link>
    );
  }

  const onLogout = async () => {
    close();
    await logout();
    showToast(t.authLoggedOut);
    router.refresh();
  };

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        type="button"
        onClick={() => toggle("account")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(triggerClass, "max-w-[180px]")}
      >
        <UserIcon />
        <span className="truncate">{t.accountMenu.greeting.replace("{name}", user.fullName)}</span>
        <ChevronDownIcon className="size-3.5 flex-none" />
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-fade-in absolute top-[calc(100%+12px)] right-0 z-60 w-56 overflow-hidden rounded-xl border border-line-soft bg-white py-1.5 shadow-pop"
        >
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.key}
              role="menuitem"
              href={`/${locale}${link.path}`}
              onClick={close}
              className="block px-4 py-2.5 text-[13.5px] text-ink-body transition-colors hover:bg-mist hover:text-accent"
            >
              {t.accountMenu[link.key]}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => void onLogout()}
            className="mt-1 block w-full cursor-pointer border-t border-line-faint px-4 py-2.5 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-mist hover:text-accent"
          >
            {t.accountMenu.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
