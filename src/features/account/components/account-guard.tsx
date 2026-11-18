"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { loginHref } from "@/features/auth/lib/account-links";
import { useAuthActions, useAuthStatus } from "@/features/auth/store/auth.store";
import { useI18n } from "@/i18n/i18n-provider";

/**
 * Account pages are client-rendered behind the session cookie, which page JS
 * cannot read: ask the server once, and send guests to sign-in with a way back.
 */
export function AccountGuard({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStatus();
  const { load } = useAuthActions();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status === "guest") router.replace(loginHref(pathname));
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return <p className="py-16 text-center text-[13px] text-ink-muted">{t.account.loading}</p>;
  }
  return <>{children}</>;
}
