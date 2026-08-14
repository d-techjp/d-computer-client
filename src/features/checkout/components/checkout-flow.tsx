"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";
import {
  useCartActions,
  useCartCount,
  useCartId,
  useCartLines,
  useCartLoading,
  useCartSubtotal,
} from "@/features/cart/store/cart.store";
import { useCartHydrated } from "@/features/cart/store/use-cart-hydrated";
import {
  placeOrder as placeCheckoutOrder,
  previewCheckout,
} from "@/features/cart/api/cart.repository";
import type {
  CartItem,
  CheckoutOrder,
  CheckoutPreview,
  PaymentMethod,
  ShippingAddress,
} from "@/features/cart/api/cart.schema";
import { useI18n } from "@/i18n/i18n-provider";
import { toApiError } from "@/lib/api/errors";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils/cn";

type CheckoutStep = "address" | "review";

type CheckoutFormState = {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  orderNote: string;
};

const EMPTY_FORM: CheckoutFormState = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  street: "",
  orderNote: "",
};

const fieldClass =
  "h-11 w-full border border-line-strong bg-white px-3.5 text-[13.5px] outline-none transition-colors placeholder:text-ink-faint focus:border-[#C98B14] focus:ring-2 focus:ring-[#C98B14]/15";

export function CheckoutFlow() {
  const { locale, t } = useI18n();
  const hydrated = useCartHydrated();
  const cartLoading = useCartLoading();
  const cartId = useCartId();
  const lines = useCartLines();
  const count = useCartCount();
  const cartSubtotal = useCartSubtotal();
  const { refresh, discard } = useCartActions();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [form, setForm] = useState<CheckoutFormState>(EMPTY_FORM);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CheckoutOrder | null>(null);

  if (!hydrated || (cartLoading && lines.length === 0)) return <CheckoutSkeleton />;

  if (createdOrder) {
    return (
      <section className="mx-auto max-w-2xl border border-line bg-white px-5 py-12 text-center shadow-card sm:px-10 sm:py-16">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#EAF7EF] text-stock">
          <CheckIcon className="size-6" />
        </span>
        <p className="mb-2 text-[11px] font-black tracking-[1.2px] text-stock uppercase">
          {t.checkoutSuccessEyebrow}
        </p>
        <h2 className="mb-3 text-2xl font-black md:text-3xl">{t.checkoutSuccessTitle}</h2>
        <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-6 text-ink-muted">
          {t.checkoutSuccessDesc}
        </p>
        <div className="mx-auto mb-7 max-w-sm border-y border-line py-4">
          <span className="block text-xs text-ink-muted">{t.checkoutOrderCode}</span>
          <strong className="mt-1 block text-xl tracking-[1px]">{createdOrder.code}</strong>
          <span className="mt-2 block text-lg font-black text-accent tabular-nums">
            {formatPrice(createdOrder.total)}
          </span>
        </div>
        <p className="mx-auto mb-7 max-w-md text-xs leading-5 font-semibold text-[#9B6808]">
          {t.checkoutSaveOrderCode}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}/products`} className={buttonVariants({ size: "md" })}>
            {t.checkoutContinueShopping}
          </Link>
          <a
            href={`tel:${t.phone.replace(/-/g, "")}`}
            className={buttonVariants({ variant: "outline", size: "md" })}
          >
            <PhoneIcon className="size-4" />
            {t.checkoutContactOrder}
          </a>
        </div>
      </section>
    );
  }

  if (!cartId || lines.length === 0) {
    return (
      <section className="mx-auto max-w-2xl border border-line px-5 py-14 text-center md:py-18">
        <h2 className="mb-2 text-xl font-black">{t.checkoutEmptyTitle}</h2>
        <p className="mb-6 text-[13.5px] text-ink-muted">{t.checkoutEmptyDesc}</p>
        <Link href={`/${locale}/cart`} className={buttonVariants({ size: "md" })}>
          {t.checkoutBackToCart}
        </Link>
      </section>
    );
  }

  const shippingAddress = toShippingAddress(form);
  const changeField =
    (field: keyof CheckoutFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const confirmAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (previewing) return;

    setPreviewing(true);
    setError("");
    try {
      const nextPreview = await previewCheckout(cartId, shippingAddress);
      setPreview(nextPreview);
      setPaymentMethod(resolvePaymentMethod(nextPreview.paymentMethods));
      setForm((current) => ({
        ...current,
        fullName: nextPreview.shippingAddress.fullName,
        phone: nextPreview.shippingAddress.phone,
        province: nextPreview.shippingAddress.province,
        district: nextPreview.shippingAddress.district ?? "",
        ward: nextPreview.shippingAddress.ward ?? "",
        street: nextPreview.shippingAddress.street,
      }));
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      const apiError = toApiError(cause);
      if (apiError.status === 403 || apiError.status === 404) discard();
      setError(apiError.message || t.checkoutPreviewError);
    } finally {
      setPreviewing(false);
    }
  };

  const placeOrder = async () => {
    if (!preview?.canPlaceOrder || !paymentMethod || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const order = await placeCheckoutOrder({
        cartId,
        shippingAddress: preview.shippingAddress,
        paymentMethod,
        ...(form.orderNote.trim() ? { note: form.orderNote.trim() } : {}),
      });
      setCreatedOrder(order);
      discard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      const apiError = toApiError(cause);
      setError(apiError.message || t.checkoutOrderError);

      if (apiError.status === 400) {
        await refresh();
        try {
          const nextPreview = await previewCheckout(cartId, shippingAddress);
          setPreview(nextPreview);
          setPaymentMethod(resolvePaymentMethod(nextPreview.paymentMethods));
        } catch {
          // Keep the checkout error as the primary message. The cart refresh
          // above already synchronised whatever state is still recoverable.
        }
      } else if (apiError.status === 403 || apiError.status === 404) {
        discard();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayedItems = step === "review" && preview ? preview.items : lines;
  const pricing = preview ?? {
    subtotal: cartSubtotal,
    discount: 0,
    shippingFee: 0,
    total: cartSubtotal,
  };

  return (
    <>
      <CheckoutSteps step={step} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <section className="min-w-0">
          {step === "address" ? (
            <form id="shipping-form" onSubmit={(event) => void confirmAddress(event)}>
              <div className="mb-6">
                <h2 className="text-xl font-black">{t.checkoutAddressTitle}</h2>
                <p className="mt-1.5 text-[13px] leading-5 text-ink-muted">
                  {t.checkoutAddressDesc}
                </p>
              </div>

              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <FormField
                  name="fullName"
                  label={t.checkoutFullName}
                  value={form.fullName}
                  onChange={changeField("fullName")}
                  autoComplete="name"
                  required
                />
                <FormField
                  name="phone"
                  label={t.checkoutPhone}
                  value={form.phone}
                  onChange={changeField("phone")}
                  autoComplete="tel"
                  inputMode="tel"
                  minLength={9}
                  maxLength={20}
                  required
                />
                <FormField
                  name="province"
                  label={t.checkoutProvince}
                  value={form.province}
                  onChange={changeField("province")}
                  autoComplete="address-level1"
                  minLength={2}
                  maxLength={150}
                  required
                />
                <FormField
                  name="district"
                  label={t.checkoutDistrict}
                  optional={t.checkoutOptional}
                  value={form.district}
                  onChange={changeField("district")}
                  autoComplete="address-level2"
                  maxLength={150}
                />
                <FormField
                  name="ward"
                  label={t.checkoutWard}
                  optional={t.checkoutOptional}
                  value={form.ward}
                  onChange={changeField("ward")}
                  autoComplete="address-level3"
                  maxLength={150}
                />
                <FormField
                  name="street"
                  label={t.checkoutStreet}
                  value={form.street}
                  onChange={changeField("street")}
                  autoComplete="street-address"
                  minLength={3}
                  maxLength={255}
                  required
                  className="sm:col-span-2"
                />
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[12.5px] font-bold">
                    {t.checkoutNote}
                    <span className="ml-1 font-normal text-ink-faint">({t.checkoutOptional})</span>
                  </span>
                  <textarea
                    name="orderNote"
                    value={form.orderNote}
                    onChange={changeField("orderNote")}
                    maxLength={500}
                    rows={4}
                    className={cn(fieldClass, "h-auto resize-y py-3")}
                  />
                </label>
              </div>
            </form>
          ) : preview ? (
            <ReviewPanel
              preview={preview}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onEdit={() => {
                setError("");
                setStep("address");
              }}
            />
          ) : null}
        </section>

        <aside className="border border-line bg-white p-5 shadow-card sm:p-6 lg:sticky lg:top-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-lg font-black">{t.checkoutSummary}</h2>
            <span className="text-xs text-ink-muted">
              {count} {t.cartItemsUnit}
            </span>
          </div>

          {step === "address" ? <CompactOrderItems items={displayedItems} /> : null}

          <dl className="space-y-3 border-y border-line py-4 text-[13.5px]">
            <PriceRow label={t.cartSubtotal} value={pricing.subtotal} />
            {step === "review" ? (
              <>
                <PriceRow label={t.checkoutDiscount} value={-pricing.discount} />
                <PriceRow label={t.checkoutShipping} value={pricing.shippingFee} />
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t.checkoutShipping}</dt>
                <dd className="text-right text-xs font-semibold text-ink-subtle">
                  {t.checkoutAfterAddress}
                </dd>
              </div>
            )}
          </dl>

          {step === "review" ? (
            <div className="flex items-end justify-between gap-4 py-5">
              <span className="text-sm font-bold">{t.checkoutTotal}</span>
              <strong className="text-[24px] leading-none font-black text-accent tabular-nums">
                {formatPrice(pricing.total)}
              </strong>
            </div>
          ) : null}

          {step === "address" ? (
            <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-2.5">
              <Link
                href={`/${locale}/cart`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "block" }),
                  "min-h-12 px-2 text-center leading-5",
                )}
              >
                {t.checkoutBackToCart}
              </Link>
              <Button
                type="submit"
                form="shipping-form"
                size="block"
                disabled={previewing}
                className="min-h-12 px-2 text-center leading-5"
              >
                {previewing ? t.checkoutPreviewing : t.checkoutConfirmAddress}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="block"
                onClick={() => setStep("address")}
                disabled={submitting}
                className="min-h-12 px-2 text-center leading-5"
              >
                {t.checkoutEditAddress}
              </Button>
              <Button
                type="button"
                size="block"
                onClick={() => void placeOrder()}
                disabled={submitting || !preview?.canPlaceOrder || !paymentMethod}
                className="min-h-12 px-2 text-center leading-5"
              >
                {submitting ? t.checkoutPlacingOrder : t.checkoutPlaceOrder}
              </Button>
            </div>
          )}

          {preview && !preview.canPlaceOrder ? (
            <p className="mt-3 text-xs leading-5 font-semibold text-accent">
              {t.checkoutBlockingIssues}
            </p>
          ) : null}
          {preview && preview.paymentMethods.length === 0 ? (
            <p className="mt-3 text-xs leading-5 font-semibold text-accent">
              {t.checkoutNoPaymentMethod}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-3 border-l-2 border-accent bg-[#FFF1EF] px-3 py-2.5 text-xs leading-5">
              {error}
            </p>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function toShippingAddress(form: CheckoutFormState): ShippingAddress {
  return {
    fullName: form.fullName,
    phone: form.phone,
    province: form.province,
    street: form.street,
    ...(form.district ? { district: form.district } : {}),
    ...(form.ward ? { ward: form.ward } : {}),
  };
}

function resolvePaymentMethod(methods: PaymentMethod[]): PaymentMethod | null {
  return methods.includes("cod") ? "cod" : (methods[0] ?? null);
}

function CheckoutSteps({ step }: { step: CheckoutStep }) {
  const { t } = useI18n();

  return (
    <ol className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line pb-6 md:mb-10 md:max-w-xl">
      <li className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink-strong text-xs font-black text-white">
          1
        </span>
        <span className="text-[12.5px] font-bold">{t.checkoutStepAddress}</span>
      </li>
      <li aria-hidden className="h-px w-7 list-none bg-line-strong sm:w-14" />
      <li className="flex items-center justify-end gap-2.5">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-xs font-black",
            step === "review" ? "bg-ink-strong text-white" : "bg-mist text-ink-faint",
          )}
        >
          2
        </span>
        <span className={cn("text-[12.5px] font-bold", step === "address" && "text-ink-faint")}>
          {t.checkoutStepReview}
        </span>
      </li>
    </ol>
  );
}

function ReviewPanel({
  preview,
  paymentMethod,
  onPaymentMethodChange,
  onEdit,
}: {
  preview: CheckoutPreview;
  paymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onEdit: () => void;
}) {
  const { t } = useI18n();
  const address = preview.shippingAddress;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">{t.checkoutReviewTitle}</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-muted">{t.checkoutReviewDesc}</p>
        </div>
        <button type="button" onClick={onEdit} className="cursor-pointer text-[12.5px] font-bold text-accent">
          {t.checkoutEditAddress}
        </button>
      </div>

      <section className="mb-7 border-y border-line py-5" aria-labelledby="address-review">
        <h3 id="address-review" className="mb-3 text-sm font-black">{t.checkoutAddressTitle}</h3>
        <p className="text-[13.5px] font-bold">{address.fullName}</p>
        <p className="mt-1 text-[13px] leading-5 text-ink-muted">
          {[address.province, address.district, address.ward].filter(Boolean).join(", ")}
          <br />
          {address.street}
        </p>
        <p className="mt-2 text-[13px] text-ink-body">{address.phone}</p>
      </section>

      {preview.paymentMethods.length > 0 ? (
        <label className="mb-7 block max-w-sm">
          <span className="mb-2 block text-[12.5px] font-bold">{t.checkoutPaymentMethod}</span>
          <select
            value={paymentMethod ?? ""}
            onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod)}
            className={cn(fieldClass, "cursor-pointer")}
          >
            {preview.paymentMethods.map((method) => (
              <option key={method} value={method}>{t.checkoutPaymentMethods[method]}</option>
            ))}
          </select>
        </label>
      ) : null}

      <ReadOnlyOrderItems items={preview.items} />
    </div>
  );
}

type FormFieldProps = {
  name: keyof CheckoutFormState;
  label: string;
  optional?: string;
  className?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  inputMode?: "text" | "tel";
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

function FormField({ label, optional, className, required, ...inputProps }: FormFieldProps) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[12.5px] font-bold">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
        {optional ? <span className="ml-1 font-normal text-ink-faint">({optional})</span> : null}
      </span>
      <input {...inputProps} required={required} className={fieldClass} />
    </label>
  );
}

function CompactOrderItems({ items }: { items: CartItem[] }) {
  return (
    <ul className="mb-4 max-h-52 space-y-3 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3">
          <span className="relative aspect-square overflow-hidden border border-line-soft bg-white">
            <Image
              src={item.image ?? "/logo-d-tech.png"}
              alt=""
              fill
              sizes="46px"
              className="object-contain p-1"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-bold">{item.productName}</span>
            <span className="mt-0.5 block text-[11px] text-ink-faint">× {item.quantity}</span>
          </span>
          <strong className="text-xs tabular-nums">{formatPrice(item.lineTotal)}</strong>
        </li>
      ))}
    </ul>
  );
}

function ReadOnlyOrderItems({ items }: { items: CartItem[] }) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="review-products">
      <h3 id="review-products" className="mb-3 text-sm font-black">{t.checkoutItemsTitle}</h3>
      <ul className="border-t border-line">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:gap-4"
          >
            <span className="relative aspect-square overflow-hidden border border-line-soft bg-white">
              <Image
                src={item.image ?? "/logo-d-tech.png"}
                alt=""
                fill
                sizes="76px"
                className="object-contain p-1.5"
              />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-[13px] leading-5 font-bold">{item.productName}</span>
              <span className="mt-1 block truncate text-[11.5px] text-ink-faint">
                {item.variantName} · {t.checkoutQuantity}: {item.quantity}
              </span>
              {item.issues.length > 0 ? (
                <span className="mt-1 block text-[10.5px] leading-4 text-accent">
                  {item.issues.map((issue) => t.cartIssueLabels[issue]).join(" · ")}
                </span>
              ) : null}
            </span>
            <strong className="text-[13px] tabular-nums sm:text-sm">{formatPrice(item.lineTotal)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-bold tabular-nums">{formatPrice(value)}</dd>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <div className="h-7 w-60 bg-mist" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-16 bg-mist-soft" />)}
        </div>
      </div>
      <div className="h-96 border border-line bg-mist-soft" />
    </div>
  );
}
