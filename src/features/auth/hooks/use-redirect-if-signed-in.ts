"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useI18n } from "@/i18n/i18n-provider";

import { safeNextPath } from "../lib/auth-error-message";
import { useAuthActions, useAuthStatus } from "../store/auth.store";

/** An already signed-in shopper landing on /login or /register goes straight on. */
export function useRedirectIfSignedIn(next: string | null) {
  const { locale } = useI18n();
  const router = useRouter();
  const status = useAuthStatus();
  const { load } = useAuthActions();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status === "authenticated") router.replace(safeNextPath(next, locale));
  }, [locale, next, router, status]);
}
