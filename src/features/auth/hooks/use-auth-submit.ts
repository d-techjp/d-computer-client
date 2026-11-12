"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";

import type { SessionUser } from "../api/auth.schema";
import { authErrorMessage, safeNextPath } from "../lib/auth-error-message";
import { useAuthActions } from "../store/auth.store";
import { useTurnstile } from "./use-turnstile";

type Flow = "login" | "register" | "google";

/**
 * Everything the login and register forms share: one request at a time, a
 * fresh captcha token per attempt, mapped error copy, and the redirect.
 *
 * `inFlight` is a ref, not just the `pending` state: two clicks in the same
 * frame both see the stale `pending === false`, but only one passes the ref.
 */
export function useAuthSubmit(next: string | null) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const { setUser } = useAuthActions();
  const showToast = useUiStore((state) => state.showToast);
  const turnstile = useTurnstile(locale);

  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (flow: Flow, request: (captchaToken: string) => Promise<SessionUser>) => {
    if (inFlight.current) return;
    const captchaToken = turnstile.consume();
    if (!captchaToken) {
      setError(t.authCaptchaPending);
      return;
    }

    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const user = await request(captchaToken);
      setUser(user);
      showToast(t.authWelcome.replace("{name}", user.fullName));
      // `pending` stays on: the page is about to change and the form must not
      // accept another submit in the meantime.
      router.replace(safeNextPath(next, locale));
    } catch (cause) {
      setError(authErrorMessage(cause, flow, t.authErrors));
      inFlight.current = false;
      setPending(false);
    }
  };

  return {
    turnstile,
    pending,
    error,
    run,
    canSubmit: !pending && Boolean(turnstile.token),
  };
}
