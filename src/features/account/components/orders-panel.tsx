"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import type { CheckoutOrder } from "@/features/cart/api/cart.schema";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";
import { interpolate } from "@/lib/format/interpolate";

import { listMyOrders } from "../api/account.repository";
import { formatDate, purchasedItems } from "../lib/format";
import { OrderStatusBadge } from "./order-status-badge";
import { PanelHeading } from "./panel-heading";

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; orders: CheckoutOrder[]; totalPages: number };

export function OrdersPanel() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    listMyOrders(page)
      .then(({ items, meta }) => {
        if (!cancelled) setState({ kind: "ready", orders: items, totalPages: meta.totalPages });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <section>
      <PanelHeading title={t.account.ordersTitle} />

      {state.kind === "loading" ? (
        <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loading}</p>
      ) : state.kind === "error" ? (
        <p className="py-10 text-center text-[13px] text-ink-muted">{t.account.loadError}</p>
      ) : state.orders.length === 0 ? (
        <div className="border border-line px-5 py-12 text-center">
          <p className="mb-5 text-[13.5px] text-ink-muted">{t.account.ordersEmpty}</p>
          <Link href="/products" className={buttonVariants({ size: "sm" })}>
            {t.account.ordersShop}
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {state.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={state.totalPages}
            onChange={(next) => {
              setState({ kind: "loading" });
              setPage(next);
            }}
          />
        </>
      )}
    </section>
  );
}

function OrderCard({ order }: { order: CheckoutOrder }) {
  const { t } = useI18n();
  const items = purchasedItems(order);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <li className="border border-line">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-soft bg-mist-soft px-4 py-2.5 text-[12px]">
        <span className="font-bold tabular-nums">{order.code}</span>
        <span className="text-ink-muted">
          {t.account.orderDate}: {formatDate(order.createdAt)}
        </span>
      </div>
      <Link
        href={`/account/orders/${order.id}`}
        className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-mist-soft"
      >
        <span className="flex -space-x-3">
          {items.slice(0, 3).map((item) => (
            <span
              key={item.id}
              className="relative size-12 shrink-0 overflow-hidden border border-line-soft bg-white"
            >
              <Image
                src={item.thumbnail ?? "/logo-d-tech.png"}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </span>
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold">{items[0]?.productName}</span>
          <span className="mt-1 flex items-center gap-2 text-[12px] text-ink-muted">
            <OrderStatusBadge status={order.status} />
            {interpolate(t.account.orderItems, { count })}
          </span>
        </span>
        <span className="text-right">
          <span className="block text-[14px] font-black tabular-nums">{formatPrice(order.total)}</span>
          <span className="text-[11.5px] font-bold text-accent group-hover:underline">
            {t.account.orderDetail}
          </span>
        </span>
      </Link>
    </li>
  );
}
