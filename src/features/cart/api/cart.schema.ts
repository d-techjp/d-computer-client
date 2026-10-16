import { z } from "zod";

import { envelopeOrPlainSchema } from "@/lib/api/envelope";

export const cartItemIssueSchema = z.enum([
  "out_of_stock",
  "insufficient_stock",
  "variant_inactive",
  "product_unavailable",
  "max_quantity_exceeded",
  "price_changed",
]);

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid(),
  productId: z.string().uuid(),
  slug: z.string(),
  sku: z.string(),
  productName: z.string(),
  variantName: z.string(),
  image: z.string().nullable().optional().default(null),
  unitPrice: z.number(),
  compareAtPrice: z.number().nullable().optional().default(null),
  addedUnitPrice: z.number().optional(),
  priceChanged: z.boolean().optional().default(false),
  quantity: z.number().int().min(1),
  lineTotal: z.number(),
  availableStock: z.number().int().nullable().optional().default(null),
  isAvailable: z.boolean(),
  issues: z.array(cartItemIssueSchema),
});

export const cartSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "converted"]),
  itemCount: z.number().int().min(0),
  subtotal: z.number(),
  hasBlockingIssues: z.boolean(),
  items: z.array(cartItemSchema),
  updatedAt: z.string().datetime(),
});

export const addCartItemRequestSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemRequestSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const addToCartResultSchema = z.object({
  variantId: z.string().uuid(),
  requested: z.number().int().min(1),
  accepted: z.number().int().min(0),
  quantityInCart: z.number().int().min(0),
  availableStock: z.number().int().nullable().optional().default(null),
  status: z.enum(["added", "adjusted", "rejected"]),
  issue: cartItemIssueSchema.nullable(),
  message: z.string(),
});

export const cartMutationResultSchema = z.object({
  cart: cartSchema,
  result: addToCartResultSchema,
});

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(9).max(20),
  street: z.string().trim().min(3).max(255),
  ward: z.string().trim().max(150).nullable().optional(),
  district: z.string().trim().max(150).nullable().optional(),
  province: z.string().trim().min(2).max(150),
  note: z.string().trim().max(255).nullable().optional(),
});

export const paymentMethodSchema = z.enum([
  "cod",
  "bank_transfer",
  "credit_card",
  "e_wallet",
  "stripe",
]);

export const checkoutPreviewRequestSchema = z.object({
  cartId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
});

export const checkoutPreviewSchema = z.object({
  items: z.array(cartItemSchema),
  subtotal: z.number(),
  discount: z.number(),
  shippingFee: z.number(),
  total: z.number(),
  shippingAddress: shippingAddressSchema,
  paymentMethods: z.array(paymentMethodSchema),
  canPlaceOrder: z.boolean(),
});

export const checkoutEmailSchema = z.string().trim().email().max(255);
export const checkoutLocaleSchema = z.enum(["ja", "vi"]);

export const placeOrderRequestSchema = z.object({
  cartId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
  email: checkoutEmailSchema,
  locale: checkoutLocaleSchema.optional(),
  paymentMethod: paymentMethodSchema.optional().default("cod"),
  note: z.string().trim().max(500).nullable().optional(),
});

const orderItemSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
  productName: z.string(),
  variantName: z.string().nullable().optional(),
  sku: z.string(),
  thumbnail: z.string().nullable().optional(),
  unitPrice: z.number(),
  quantity: z.number().int().min(1),
  total: z.number(),
});

export const checkoutOrderSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  userId: z.string().uuid().nullable().optional(),
  status: z.enum([
    "awaiting_payment",
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "completed",
    "cancelled",
    "refunded",
  ]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]),
  paymentMethod: paymentMethodSchema,
  subtotal: z.number(),
  discount: z.number(),
  shippingFee: z.number(),
  total: z.number(),
  shippingAddress: shippingAddressSchema,
  customerEmail: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z.array(orderItemSchema),
  createdAt: z.string().datetime(),
});

export const orderStatusSchema = checkoutOrderSchema.shape.status;
export const paymentStatusSchema = checkoutOrderSchema.shape.paymentStatus;

/**
 * Card / PayPay go through Stripe Checkout: the backend creates the order
 * (awaiting payment, stock not yet taken) and hands back a hosted page URL.
 * `locale` picks both the Stripe page language and the return URL path.
 */
export const stripeCheckoutRequestSchema = z.object({
  cartId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
  email: checkoutEmailSchema,
  note: z.string().trim().max(500).nullable().optional(),
  locale: checkoutLocaleSchema,
});

export const stripeCheckoutResultSchema = z.object({
  id: z.string().uuid(),
  orderCode: z.string(),
  checkoutUrl: z.string().url(),
});

export const stripeSessionStatusSchema = z.object({
  orderCode: z.string(),
  total: z.number(),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
});

export const cartResponseSchema = envelopeOrPlainSchema(cartSchema);
export const cartMutationResponseSchema = envelopeOrPlainSchema(cartMutationResultSchema);
export const checkoutPreviewResponseSchema = envelopeOrPlainSchema(checkoutPreviewSchema);
export const checkoutOrderResponseSchema = envelopeOrPlainSchema(checkoutOrderSchema);
export const stripeCheckoutResponseSchema = envelopeOrPlainSchema(stripeCheckoutResultSchema);
export const stripeSessionStatusResponseSchema = envelopeOrPlainSchema(stripeSessionStatusSchema);

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CartItemIssue = z.infer<typeof cartItemIssueSchema>;
export type CartMutationResult = z.infer<typeof cartMutationResultSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CheckoutPreview = z.infer<typeof checkoutPreviewSchema>;
export type CheckoutOrder = z.infer<typeof checkoutOrderSchema>;
export type StripeCheckoutResult = z.infer<typeof stripeCheckoutResultSchema>;
export type StripeSessionStatus = z.infer<typeof stripeSessionStatusSchema>;
