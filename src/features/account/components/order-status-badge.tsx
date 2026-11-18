"use client";

import type { CheckoutOrder } from "@/features/cart/api/cart.schema";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/utils/cn";

const TONE: Record<CheckoutOrder["status"], string> = {
  awaiting_payment: "bg-[#FFF8E8] text-[#9A6A0C]",
  pending: "bg-[#FFF8E8] text-[#9A6A0C]",
  confirmed: "bg-[#EAF2FB] text-[#2C5F94]",
  processing: "bg-[#EAF2FB] text-[#2C5F94]",
  shipping: "bg-[#EAF2FB] text-[#2C5F94]",
  completed: "bg-[#EAF6EE] text-[#2F7A47]",
  cancelled: "bg-mist text-ink-muted",
  refunded: "bg-mist text-ink-muted",
};

export function OrderStatusBadge({ status }: { status: CheckoutOrder["status"] }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11.5px] font-bold whitespace-nowrap",
        TONE[status],
      )}
    >
      {t.account.orderStatus[status]}
    </span>
  );
}
