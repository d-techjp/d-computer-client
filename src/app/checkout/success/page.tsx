import type { Metadata } from "next";

import { StripePaymentResult } from "@/features/checkout/components/stripe-payment-result";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {

  const t = await getDictionary();
  return {
    title: t.checkoutTitle,
    robots: { index: false, follow: false },
  };
}

/** Stripe Checkout returns here with `?session_id=cs_…` after the customer pays. */
export default async function CheckoutSuccessPage({ searchParams }: PageProps) {

  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="shell py-10 md:py-14">
        <StripePaymentResult sessionId={typeof sessionId === "string" ? sessionId : null} />
      </div>
    </div>
  );
}
