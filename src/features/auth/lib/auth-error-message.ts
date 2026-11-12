import type ja from "@/i18n/dictionaries/ja";
import { toApiError } from "@/lib/api/errors";

type AuthErrors = (typeof ja)["authErrors"];
type Flow = "login" | "register" | "google";

/**
 * Backend messages are Vietnamese and meant for logs, so the storefront maps
 * status codes to its own ja/vi copy. The two 400s and 401s that need telling
 * apart are distinguished by a stable fragment of the backend message.
 */
export function authErrorMessage(cause: unknown, flow: Flow, errors: AuthErrors): string {
  const error = toApiError(cause);
  const message = error.message.toLowerCase();

  switch (error.status) {
    case 400:
      return message.includes("chống bot") ? errors.captcha : errors.invalidInput;
    case 401:
      if (message.includes("khoá") || message.includes("kích hoạt")) return errors.accountLocked;
      return flow === "google" ? errors.googleFailed : errors.invalidCredentials;
    case 403:
      return errors.internalAccount;
    case 409:
      return flow === "google" ? errors.googleFailed : errors.emailTaken;
    case 503:
      return flow === "google" && message.includes("google")
        ? errors.googleUnavailable
        : errors.unavailable;
    default:
      return error.isNetworkError || error.isServerError ? errors.unavailable : errors.generic;
  }
}

/** Only same-site, same-locale paths: `?next=//evil.com` must not become an open redirect. */
export function safeNextPath(next: string | null | undefined, locale: string): string {
  const fallback = `/${locale}`;
  if (!next || !next.startsWith(`/${locale}`) || next.startsWith("//")) return fallback;
  if (next.includes("\\") || /^\/[^/]+\/(login|register)\b/.test(next)) return fallback;
  return next;
}
