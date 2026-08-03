"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n-provider";

/**
 * Route-level error boundary. A throw anywhere in this segment renders here
 * instead of a blank page, and `reset()` retries the segment without a full
 * reload. Must be a Client Component — error boundaries need state.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    // Where Sentry / your logger would receive it. `digest` correlates the
    // client-visible error with the full server-side stack.
    console.error("[route error]", error.digest, error);
  }, [error]);

  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-black">{t.errorTitle}</h1>
      <p className="text-sm text-ink-subtle">{t.errorDesc}</p>
      <Button onClick={reset}>{t.errorRetry}</Button>
    </div>
  );
}
