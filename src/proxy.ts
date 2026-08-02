import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

/**
 * Locale negotiation at the edge. (`proxy.ts` is Next 16's name for what used
 * to be `middleware.ts`.)
 *
 * Every page lives under `/{locale}`, so a request to `/` or `/products/x` has
 * to be sent somewhere. The visitor's `Accept-Language` decides, falling back
 * to Japanese — matching the original page's default.
 */
function resolveLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";

  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.split("-")[0].toLowerCase(), quality: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  return preferred.find((entry) => LOCALES.includes(entry.tag as never))?.tag ?? DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${resolveLocale(request)}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Static assets and API routes are not locale-scoped and must not be rewritten.
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.).*)"],
};
