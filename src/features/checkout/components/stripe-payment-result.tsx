"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { getStripeSessionStatus } from "@/features/cart/api/cart.repository";
import type { StripeSessionStatus } from "@/features/cart/api/cart.schema";
import { useCartActions } from "@/features/cart/store/cart.store";
import { useI18n } from "@/i18n/i18n-provider";
import { formatPrice } from "@/lib/format/currency";

/** Card / PayPay settle within seconds; give the webhook ~20s before giving up. */
const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 10;

type ResultState =
  | { kind: "loading" }
  | { kind: "paid" | "refunded" | "failed" | "pending"; session: StripeSessionStatus }
  | { kind: "error" };

function classify(session: StripeSessionStatus): Exclude<ResultState["kind"], "loading" | "error"> {
  if (session.paymentStatus === "refunded") return "refunded";
  // Paid but cancelled = went out of stock mid-payment; the refund is on its way.
  if (session.status === "cancelled") return session.paymentStatus === "paid" ? "refunded" : "failed";
  if (session.paymentStatus === "paid") return "paid";
  if (session.paymentStatus === "failed") return "failed";
  return "pending";
}

export function StripePaymentResult({ sessionId }: { sessionId: string | null }) {
  const { locale, t } = useI18n();
  const { discard } = useCartActions();
  const [state, setState] = useState<ResultState>(
    sessionId ? { kind: "loading" } : { kind: "error" },
  );

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (attempt: number) => {
      try {
        const session = await getStripeSessionStatus(sessionId);
        if (cancelled) return;

        const kind = classify(session);
        // The backend closed the cart when the payment settled; drop the
        // local reference so the header badge and cart page start fresh.
        if (kind === "paid") discard();

        if (kind === "pending" && attempt < MAX_POLLS) {
          timer = setTimeout(() => void poll(attempt + 1), POLL_INTERVAL_MS);
        }
        setState({ kind, session });
      } catch {
        if (!cancelled) setState({ kind: "error" });
      }
    };

    void poll(1);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, discard]);

  if (state.kind === "loading" || state.kind === "pending") {
    return (
      <ResultFrame
        title={t.checkoutPaymentPendingTitle}
        description={t.checkoutPaymentPendingDesc}
        busy
      />
    );
  }

  if (state.kind === "error") {
    return (
      <ResultFrame title={t.checkoutPaymentFailedTitle} description={t.checkoutPaymentCheckError}>
        <Link href={`/${locale}/checkout`} className={buttonVariants({ size: "md" })}>
          {t.checkoutBackToCheckout}
        </Link>
      </ResultFrame>
    );
  }

  const { session } = state;

  if (state.kind === "paid") {
    return (
      <ResultFrame
        eyebrow={t.checkoutPaidEyebrow}
        title={t.checkoutPaidTitle}
        description={t.checkoutPaidDesc}
        success
      >
        <OrderSummary session={session} />
        <p className="mx-auto mb-8 max-w-md text-xs leading-5 font-semibold text-[#9B6808]">
          {t.checkoutSaveOrderCode}
        </p>
        <Link
          href={`/${locale}`}
          className="text-[13.5px] font-bold text-ink-body underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          {t.checkoutBackToHome}
        </Link>
      </ResultFrame>
    );
  }

  return (
    <ResultFrame
      title={t.checkoutPaymentFailedTitle}
      description={
        state.kind === "refunded" ? t.checkoutPaymentRefundedDesc : t.checkoutPaymentFailedDesc
      }
    >
      <OrderSummary session={session} />
      <Link href={`/${locale}/checkout`} className={buttonVariants({ size: "md" })}>
        {t.checkoutBackToCheckout}
      </Link>
    </ResultFrame>
  );
}

function OrderSummary({ session }: { session: StripeSessionStatus }) {
  const { t } = useI18n();

  return (
    <div className="mx-auto mb-7 max-w-sm border-y border-line py-4">
      <span className="block text-xs text-ink-muted">{t.checkoutOrderCode}</span>
      <strong className="mt-1 block text-xl tracking-[1px]">{session.orderCode}</strong>
      <span className="mt-2 block text-lg font-black text-accent tabular-nums">
        {formatPrice(session.total)}
      </span>
    </div>
  );
}

function ResultFrame({
  eyebrow,
  title,
  description,
  success = false,
  busy = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  success?: boolean;
  busy?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-busy={busy}
      className="mx-auto max-w-2xl border border-line px-5 py-14 text-center md:py-18"
    >
      {success ? (
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#EAF7EF] text-stock">
          <CheckIcon className="size-6" />
        </span>
      ) : busy ? (
        <span
          aria-hidden
          className="mx-auto mb-5 block size-10 animate-spin rounded-full border-2 border-line-strong border-t-[#C98B14]"
        />
      ) : null}
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-black tracking-[1.2px] text-stock uppercase">{eyebrow}</p>
      ) : null}
      <h2 role={busy ? "status" : undefined} className="mb-3 text-2xl font-black md:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-6 text-ink-muted">{description}</p>
      {children}
    </section>
  );
}
