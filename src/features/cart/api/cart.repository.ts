import { apiClient } from "@/lib/api/client";

import {
  cartMutationResponseSchema,
  cartResponseSchema,
  checkoutOrderResponseSchema,
  checkoutPreviewResponseSchema,
  stripeCheckoutResponseSchema,
  stripeSessionStatusResponseSchema,
  type Cart,
  type CartMutationResult,
  type CheckoutOrder,
  type CheckoutPreview,
  type PaymentMethod,
  type ShippingAddress,
  type StripeCheckoutResult,
  type StripeSessionStatus,
} from "./cart.schema";

export async function createCart(): Promise<Cart> {
  const response = await apiClient.post("/carts");
  return cartResponseSchema.parse(response.data);
}

export async function getCart(cartId: string): Promise<Cart> {
  const response = await apiClient.get(`/carts/${cartId}`);
  return cartResponseSchema.parse(response.data);
}

export async function addCartItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<CartMutationResult> {
  const response = await apiClient.post(`/carts/${cartId}/items`, { variantId, quantity });
  return cartMutationResponseSchema.parse(response.data);
}

export async function updateCartItem(
  cartId: string,
  itemId: string,
  quantity: number,
): Promise<CartMutationResult> {
  const response = await apiClient.patch(`/carts/${cartId}/items/${itemId}`, { quantity });
  return cartMutationResponseSchema.parse(response.data);
}

export async function removeCartItem(cartId: string, itemId: string): Promise<Cart> {
  const response = await apiClient.delete(`/carts/${cartId}/items/${itemId}`);
  return cartResponseSchema.parse(response.data);
}

export async function clearCart(cartId: string): Promise<Cart> {
  const response = await apiClient.delete(`/carts/${cartId}/items`);
  return cartResponseSchema.parse(response.data);
}

export async function previewCheckout(
  cartId: string,
  shippingAddress: ShippingAddress,
): Promise<CheckoutPreview> {
  const response = await apiClient.post("/checkout/preview", { cartId, shippingAddress });
  return checkoutPreviewResponseSchema.parse(response.data);
}

export async function placeOrder(input: {
  cartId: string;
  shippingAddress: ShippingAddress;
  email: string;
  locale: "ja" | "vi";
  paymentMethod: PaymentMethod;
  note?: string;
}): Promise<CheckoutOrder> {
  const response = await apiClient.post("/checkout", input);
  return checkoutOrderResponseSchema.parse(response.data);
}

/** Creates the order and returns the Stripe-hosted payment page to redirect to. */
export async function startStripeCheckout(input: {
  cartId: string;
  shippingAddress: ShippingAddress;
  email: string;
  locale: "ja" | "vi";
  note?: string;
}): Promise<StripeCheckoutResult> {
  const response = await apiClient.post("/checkout/stripe", input);
  return stripeCheckoutResponseSchema.parse(response.data);
}

export async function getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus> {
  const response = await apiClient.get(
    `/checkout/stripe/sessions/${encodeURIComponent(sessionId)}`,
  );
  return stripeSessionStatusResponseSchema.parse(response.data);
}
