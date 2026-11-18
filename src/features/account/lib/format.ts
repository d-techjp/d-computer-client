import type { CheckoutOrder } from "@/features/cart/api/cart.schema";

import type { SavedAddress } from "../api/account.schema";

const DATE = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DATE_TIME = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDate = (iso: string) => DATE.format(new Date(iso));
export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso));

/** One line, Japanese order: prefecture → city → town → street. */
export function addressLine(
  address: Pick<SavedAddress, "province" | "district" | "ward" | "street">,
): string {
  return [address.province, address.district, address.ward, address.street]
    .filter(Boolean)
    .join(" ");
}

/** Bundle component rows (price 0) are listed under their bundle, not as purchases. */
export function purchasedItems(order: CheckoutOrder) {
  return order.items.filter((item) => !item.parentItemId);
}

export function componentsOf(order: CheckoutOrder, parentId: string) {
  return order.items.filter((item) => item.parentItemId === parentId);
}

export const fieldClass =
  "h-11 w-full border border-line-strong bg-white px-3.5 text-[13.5px] outline-none transition-colors placeholder:text-ink-faint focus:border-[#C98B14] focus:ring-2 focus:ring-[#C98B14]/15 disabled:bg-mist disabled:text-ink-muted";
