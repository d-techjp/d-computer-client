import { sessionUserResponseSchema, type SessionUser } from "@/features/auth/api/auth.schema";
import type { CheckoutOrder } from "@/features/cart/api/cart.schema";
import { apiClient } from "@/lib/api/client";

import {
  myOrderResponseSchema,
  myOrdersResponseSchema,
  savedAddressListResponseSchema,
  savedAddressResponseSchema,
  type AddressInput,
  type ProfileUpdate,
  type SavedAddress,
} from "./account.schema";

/**
 * Signed-in shopper's own data. Every path is scoped to "me" by the backend
 * (from the session), so nothing here ever sends a user id.
 */
export async function updateProfile(update: ProfileUpdate): Promise<SessionUser> {
  const { data } = await apiClient.patch<unknown>("/users/me", update);
  return sessionUserResponseSchema.parse(data);
}

export async function listAddresses(): Promise<SavedAddress[]> {
  const { data } = await apiClient.get<unknown>("/users/me/addresses");
  return savedAddressListResponseSchema.parse(data);
}

export async function createAddress(input: AddressInput): Promise<SavedAddress> {
  const { data } = await apiClient.post<unknown>("/users/me/addresses", input);
  return savedAddressResponseSchema.parse(data);
}

export async function updateAddress(id: string, input: AddressInput): Promise<SavedAddress> {
  const { data } = await apiClient.patch<unknown>(`/users/me/addresses/${id}`, input);
  return savedAddressResponseSchema.parse(data);
}

export async function setDefaultAddress(id: string): Promise<SavedAddress> {
  const { data } = await apiClient.patch<unknown>(`/users/me/addresses/${id}/default`);
  return savedAddressResponseSchema.parse(data);
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/users/me/addresses/${id}`);
}

export async function listMyOrders(page: number, limit = 10) {
  const { data } = await apiClient.get<unknown>("/orders", { params: { page, limit } });
  return myOrdersResponseSchema.parse(data);
}

export async function getMyOrder(id: string): Promise<CheckoutOrder> {
  const { data } = await apiClient.get<unknown>(`/orders/${id}`);
  return myOrderResponseSchema.parse(data);
}

export async function cancelMyOrder(id: string, reason?: string): Promise<CheckoutOrder> {
  const { data } = await apiClient.patch<unknown>(`/orders/${id}/cancel`, reason ? { reason } : {});
  return myOrderResponseSchema.parse(data);
}
