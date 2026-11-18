"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CheckoutOrder } from "@/features/cart/api/cart.schema";
import { useUiStore } from "@/features/layout/store/ui.store";
import { useI18n } from "@/i18n/i18n-provider";
import { toApiError } from "@/lib/api/errors";
import { formatPrice } from "@/lib/format/currency";

import { cancelMyOrder, getMyOrder } from "../api/account.repository";
import { addressLine, componentsOf, formatDateTime, purchasedItems } from "../lib/format";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderDetailPanel({ orderId }: { orderId: string }) {
  const { t } = useI18n();
  const showToast = useUiStore((state) => state.showToast);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyOrder(orderId)
      .then((result) => !cancelled && setOrder(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const back = (
    <Link href="/account/orders" className="text-[12.5px] font-bold text-accent hover:underline">
      ← {t.account.orderBack}
    </Link>
  );

  if (failed) {
    return (
      <section>
        {back}
        <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loadError}</p>
      </section>
    );
  }
  if (!order) {
    return <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loading}</p>;
  }

  const onCancel = async () => {
    if (cancelling || !window.confirm(t.account.orderCancelConfirm)) return;
    setCancelling(true);
    try {
      setOrder(await cancelMyOrder(order.id));
      showToast(t.account.orderCancelled);
    } catch (cause) {
      showToast(toApiError(cause).message || t.account.loadError, "error");
    } finally {
      setCancelling(false);
    }
  };

  const address = order.shippingAddress;
  const rows: Array<[string, string]> = [
    [t.account.orderDate, formatDateTime(order.createdAt)],
    [
      t.account.orderPayment,
      `${t.checkoutPaymentMethods[order.paymentMethod]}（${t.account.paymentStatus[order.paymentStatus]}）`,
    ],
  ];

  return (
    <section>
      {back}
      <div className="mt-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black tabular-nums">{order.code}</h2>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mb-6 grid gap-x-6 gap-y-2 border-y border-line py-4 text-[13px] sm:grid-cols-[auto_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-line-soft border-b border-line">
        {purchasedItems(order).map((item) => (
          <li key={item.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3 py-3.5">
            <span className="relative aspect-square overflow-hidden border border-line-soft bg-white">
              <Image
                src={item.thumbnail ?? "/logo-d-tech.png"}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] leading-5 font-bold">{item.productName}</span>
              {componentsOf(order, item.id).map((component) => (
                <span key={component.id} className="block text-[11.5px] text-ink-muted">
                  ・{component.productName} × {component.quantity}
                </span>
              ))}
              <span className="mt-0.5 block text-[12px] text-ink-faint">× {item.quantity}</span>
            </span>
            <span className="text-[13.5px] font-bold tabular-nums">{formatPrice(item.total)}</span>
          </li>
        ))}
      </ul>

      <dl className="ml-auto max-w-xs space-y-1.5 py-4 text-[13px]">
        <Row label={t.cartSubtotal} value={formatPrice(order.subtotal)} />
        {order.discount > 0 ? (
          <Row label={t.checkoutDiscount} value={`-${formatPrice(order.discount)}`} />
        ) : null}
        <Row label={t.checkoutShipping} value={formatPrice(order.shippingFee)} />
        <div className="flex justify-between border-t border-line pt-2 text-[15px] font-black">
          <dt>{t.account.orderTotal}</dt>
          <dd className="tabular-nums">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <div className="grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[13px] font-black">{t.account.orderShipTo}</h3>
          <p className="text-[13px] leading-6 text-ink-body">
            {address.fullName}
            <br />
            {address.phone}
            <br />
            {addressLine({
              province: address.province,
              district: address.district ?? null,
              ward: address.ward ?? null,
              street: address.street,
            })}
          </p>
        </div>
        {order.note ? (
          <div>
            <h3 className="mb-2 text-[13px] font-black">{t.account.orderNote}</h3>
            <p className="text-[13px] leading-6 whitespace-pre-line text-ink-body">{order.note}</p>
          </div>
        ) : null}
      </div>

      {order.status === "pending" ? (
        <div className="mt-8 border-t border-line pt-5 text-right">
          <Button
            variant="outline"
            size="sm"
            disabled={cancelling}
            onClick={() => void onCancel()}
          >
            {t.account.orderCancel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-muted">
      <dt>{label}</dt>
      <dd className="tabular-nums text-ink-body">{value}</dd>
    </div>
  );
}
