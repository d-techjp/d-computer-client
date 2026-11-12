"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { UserIcon } from "@/components/ui/icons";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";

import { ACCOUNT_LINKS, loginHref } from "../lib/account-links";
import { useAuthActions, useAuthStatus, useAuthUser } from "../store/auth.store";

/** The account block at the bottom of the mobile drawer. */
export function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStatus();
  const user = useAuthUser();
  const { load, logout } = useAuthActions();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    void load();
  }, [load]);

  const linkClass =
    "flex items-center gap-2 py-1.5 text-sm font-semibold transition-colors hover:text-accent";

  if (status !== "authenticated" || !user) {
    return (
      <Link href={loginHref(locale, pathname)} onClick={onNavigate} className={`${linkClass} mb-4`}>
        <UserIcon />
        {t.login}
      </Link>
    );
  }

  return (
    <div className="mb-4 flex flex-col">
      <p className="mb-1.5 flex items-center gap-2 text-sm font-bold">
        <UserIcon />
        <span className="truncate">{t.accountMenu.greeting.replace("{name}", user.fullName)}</span>
      </p>
      {ACCOUNT_LINKS.map((link) => (
        <Link
          key={link.key}
          href={`/${locale}${link.path}`}
          onClick={onNavigate}
          className="py-1.5 pl-7 text-[13.5px] text-ink-body transition-colors hover:text-accent"
        >
          {t.accountMenu[link.key]}
        </Link>
      ))}
      <button
        type="button"
        onClick={async () => {
          onNavigate();
          await logout();
          showToast(t.authLoggedOut);
          router.refresh();
        }}
        className="cursor-pointer py-1.5 pl-7 text-left text-[13.5px] text-ink-muted transition-colors hover:text-accent"
      >
        {t.accountMenu.logout}
      </button>
    </div>
  );
}
