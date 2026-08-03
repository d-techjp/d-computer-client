import type { Locale } from "@/i18n/config";

/**
 * Destinations for the dictionary's link lists, indexed to match them — the
 * same pairing `BADGE_ICONS` uses.
 *
 * Hrefs are deliberately *not* in the dictionaries: a route is not a
 * translation, and duplicating it per locale is how `/vi/produits` eventually
 * ships. `""` means the section has no page yet and the link falls back to the
 * storefront home.
 */
const NAV_PATHS: readonly string[] = [
  "", // ホーム / Trang chủ
  "/products", // 製品一覧 / Sản phẩm
  "", // カスタムPC
  "", // ご利用ガイド
  "", // サポート
  "", // ブログ
];

const FOOTER_PATHS: readonly (readonly string[])[] = [
  ["/products", "", "", ""], // 製品・サービス
  ["", "", "", ""], // ご利用ガイド
  ["", "", "", ""], // サポート
  ["", "", ""], // 会社情報
];

function href(locale: Locale, path: string | undefined): string {
  return `/${locale}${path ?? ""}`;
}

export function navHref(locale: Locale, index: number): string {
  return href(locale, NAV_PATHS[index]);
}

export function footerHref(locale: Locale, column: number, index: number): string {
  return href(locale, FOOTER_PATHS[column]?.[index]);
}
