/** Account sections, shared by the header dropdown and the mobile drawer. */
export const ACCOUNT_LINKS = [
  { key: "profile", path: "/account" },
  { key: "addresses", path: "/account/addresses" },
  { key: "orders", path: "/account/orders" },
] as const;

/** Where "sign in" should return to: the current page, unless that page is an auth page. */
export function loginHref(locale: string, pathname: string | null): string {
  const here = pathname && !/\/(login|register)$/.test(pathname) ? pathname : null;
  return `/${locale}/login${here ? `?next=${encodeURIComponent(here)}` : ""}`;
}
