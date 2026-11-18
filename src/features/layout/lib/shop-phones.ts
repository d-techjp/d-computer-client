import type { SiteSettings } from "@/features/layout/api/site-settings.schema";

export type ShopPhoneKind = "hotline" | "mobile";

export interface ShopPhone {
  kind: ShopPhoneKind;
  number: string;
  /** `tel:` link with the hyphens stripped, so every dialer accepts it. */
  href: string;
}

/**
 * The shop's numbers in display order. The hotline is the main line and comes
 * first; the mobile follows. Either may be missing (the hotline is optional
 * in admin), so callers render whatever is left and never an empty label.
 */
export function shopPhones({ phone, hotline }: Pick<SiteSettings, "phone" | "hotline">): ShopPhone[] {
  const phones: ShopPhone[] = [];
  if (hotline) phones.push({ kind: "hotline", number: hotline, href: telHref(hotline) });
  if (phone) phones.push({ kind: "mobile", number: phone, href: telHref(phone) });
  return phones;
}

function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
