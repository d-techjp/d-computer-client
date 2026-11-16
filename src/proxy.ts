import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy locale prefixes. (`proxy.ts` is Next 16's name for `middleware.ts`.)
 *
 * The storefront used to live under `/ja/...` and `/vi/...`; it is now
 * Japanese only at the bare path. Those old URLs are indexed by Google and
 * sit in shared links, old order mails and Stripe return URLs, so each one is
 * sent to its new home with a *permanent* redirect — that is what tells
 * search engines to move the ranking over instead of dropping the page.
 */
const LEGACY_PREFIX = /^\/(?:ja|vi)(?=\/|$)/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!LEGACY_PREFIX.test(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathname.replace(LEGACY_PREFIX, "") || "/";
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Only the legacy prefixes need the proxy; every other request skips it.
  matcher: ["/ja", "/ja/:path*", "/vi", "/vi/:path*"],
};
