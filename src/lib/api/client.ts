import axios, { type AxiosInstance } from "axios";

import { toApiError } from "./errors";

/**
 * The one configured axios instance for the app.
 *
 * Nothing else in the codebase imports `axios` directly — cross-cutting
 * concerns (base URL, timeout, auth header, error shape, tracing) live here, so
 * adding one later is a single-file change instead of a grep-and-pray.
 *
 * Relative `baseURL` keeps browser requests same-origin. Server-side callers
 * should use `productService` directly rather than this client: a Server
 * Component fetching its own route handler is a wasted network round trip.
 */
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    // Where an auth token or correlation id would be attached.
    // config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    // Normalising here means every caller catches `ApiError` and nothing else.
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return instance;
}

export const apiClient = createApiClient();
