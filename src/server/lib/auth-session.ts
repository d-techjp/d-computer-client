import "server-only";

import type { NextRequest, NextResponse } from "next/server";

/**
 * The storefront session is the backend JWT kept in an httpOnly cookie.
 *
 * The browser never sees the token: an XSS bug can still make requests while
 * the page is open, but it cannot read the token and replay it elsewhere.
 * `SameSite=Lax` keeps other sites' forms and fetches from riding on it, and
 * the cookie is only ever sent to this Next app — route handlers turn it into
 * the `Authorization` header the backend expects.
 */
export const SESSION_COOKIE = "dcs_session";

export function readSessionToken(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value || undefined;
}

export function setSessionCookie(response: NextResponse, token: string, maxAgeSeconds: number) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
