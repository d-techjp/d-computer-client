import "server-only";

import { ApiError } from "@/lib/api/errors";

/**
 * The one place that talks to the real backend over HTTP.
 *
 * Server Components and route handlers call this instead of `apiClient`
 * (browser-facing axios): it lives server-side only (`API_BASE_URL` has no
 * `NEXT_PUBLIC_` prefix, so it never leaks into the client bundle), and it
 * unwraps the `{ success, data }` envelope every backend response shares so
 * callers work with the payload directly.
 */
const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3030/api/v1";

export type BackendParams = Record<string, string | number | boolean | undefined>;

type Envelope = { success: boolean; message?: string; code?: string; data: unknown };

function buildUrl(path: string, params?: BackendParams): string {
  const url = new URL(path.replace(/^\//, ""), `${BASE_URL.replace(/\/?$/, "/")}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function backendFetch<T>(
  path: string,
  params?: BackendParams,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      // Prices and stock change server-side; always read the current state
      // rather than serving a stale Next.js data-cache entry.
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApiError("Failed to reach the backend", { code: "network_error", cause });
  }

  const body = (await response.json().catch(() => null)) as Envelope | null;

  if (!response.ok || !body?.success) {
    throw new ApiError(body?.message ?? response.statusText, {
      status: response.status,
      code: body?.code ?? `http_${response.status}`,
    });
  }

  return body.data as T;
}
