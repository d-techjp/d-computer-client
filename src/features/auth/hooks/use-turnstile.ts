"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useExternalScript } from "@/hooks/use-external-script";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile, explicit-render mode. A token is single-use on the
 * server, so `consume()` hands it out once and immediately asks the widget for
 * a fresh one — the submit button stays disabled until that arrives, which is
 * also what stops a held-down Enter key from firing a burst of sign-ups.
 */
export function useTurnstile(locale: string) {
  const status = useExternalScript(SITE_KEY ? SCRIPT_SRC : null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // The widget's own error state (blocked domain, ad blocker, no network). Without
  // it the form would sit on "verifying…" forever with no explanation.
  const [failed, setFailed] = useState(false);

  const updateToken = useCallback((value: string | null) => {
    tokenRef.current = value;
    setToken(value);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (status !== "ready" || !container || !window.turnstile) return;

    const id = window.turnstile.render(container, {
      sitekey: SITE_KEY,
      language: locale,
      callback: (value: string) => {
        setFailed(false);
        updateToken(value);
      },
      "expired-callback": () => updateToken(null),
      "error-callback": () => {
        setFailed(true);
        updateToken(null);
      },
    });
    widgetId.current = id;

    return () => {
      window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [locale, status, updateToken]);

  /** Reads the latest token (also from inside third-party callbacks) and spends it. */
  const consume = useCallback((): string | null => {
    const value = tokenRef.current;
    updateToken(null);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
    return value;
  }, [updateToken]);

  return {
    containerRef,
    token,
    consume,
    failed: failed || !SITE_KEY || status === "error",
  };
}
