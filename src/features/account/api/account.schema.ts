import { z } from "zod";

import { checkoutOrderSchema } from "@/features/cart/api/cart.schema";
import { envelopeOrPlainSchema, paginatedSchema } from "@/lib/api/envelope";

/** One saved delivery address (`/users/me/addresses`). Same fields as an order's shipping address. */
export const savedAddressSchema = z.object({
  id: z.string().uuid(),
  label: z.string().nullable(),
  fullName: z.string(),
  phone: z.string(),
  province: z.string(),
  district: z.string().nullable(),
  ward: z.string().nullable(),
  street: z.string(),
  isDefault: z.boolean(),
});

/** Mirrors the backend's CreateAddressDto so the form rejects what the API would. */
export const addressInputSchema = z.object({
  label: z.string().trim().max(50).optional(),
  fullName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(9).max(20),
  province: z.string().trim().min(2).max(150),
  district: z.string().trim().max(150).optional(),
  ward: z.string().trim().max(150).optional(),
  street: z.string().trim().min(3).max(255),
  isDefault: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(9).max(20).optional(),
});

export const savedAddressListResponseSchema = envelopeOrPlainSchema(z.array(savedAddressSchema));
export const savedAddressResponseSchema = envelopeOrPlainSchema(savedAddressSchema);
export const myOrdersResponseSchema = envelopeOrPlainSchema(paginatedSchema(checkoutOrderSchema));
export const myOrderResponseSchema = envelopeOrPlainSchema(checkoutOrderSchema);

export type SavedAddress = z.infer<typeof savedAddressSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
