import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StripePaymentResult } from "@/features/checkout/components/stripe-payment-result";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  return {
    title: t.checkoutTitle,
    robots: { index: false, follow: false },
  };
}

/** Stripe Checkout returns here with `?session_id=cs_…` after the customer pays. */
export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="shell py-10 md:py-14">
        <StripePaymentResult sessionId={typeof sessionId === "string" ? sessionId : null} />
      </div>
    </div>
  );
}
