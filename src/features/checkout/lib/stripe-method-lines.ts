import type { Dictionary } from "@/i18n/get-dictionary";

export type StripeMethodLine = keyof Dictionary["checkoutStripeMethods"];

/**
 * What to promise the shopper before they leave for Stripe, built from the
 * types the backend actually has switched on. PayPay / Alipay stay hidden
 * until the shop's Stripe account is approved for them — listing a method the
 * hosted page then doesn't offer is worse than not mentioning it.
 *
 * `card` alone stands for several lines: JCB is a card brand, Apple Pay and
 * Google Pay are wallets holding cards. Installments are a card option the
 * admin can switch off on its own.
 */
export function stripeMethodLines(
  types: string[],
  cardInstallments: boolean,
): StripeMethodLine[] {
  const lines: StripeMethodLine[] = [];
  if (types.includes("card")) lines.push("card", "wallets");
  if (types.includes("card") && cardInstallments) lines.push("installments");
  if (types.includes("paypay")) lines.push("paypay");
  if (types.includes("alipay")) lines.push("alipay");
  return lines;
}
