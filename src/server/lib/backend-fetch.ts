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
 *
 * This must be an *absolute* URL — `http(s)://host/...` — never a bare path
 * like `/api/v1`. A relative path only resolves against "the current page",
 * which is a browser concept; `NEXT_PUBLIC_API_BASE_URL` (the one `apiClient`
 * uses) is deliberately relative so nginx can proxy it same-origin, but this
 * server process makes its own outbound HTTP call with no browser page behind
 * it, so `new URL()` below throws immediately on a relative base. Do not
 * point this at `NEXT_PUBLIC_API_BASE_URL`.
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
      // Prices and stock change server-side, so the default is to always read
      // the current state rather than serve a stale Next.js data-cache entry.
      // Callers whose data is genuinely reference material — the category and
      // brand lists the header and filter sidebar render on *every* page —
      // opt out by passing `next: { revalidate }`, which would otherwise be
      // ignored: `cache: "no-store"` and `next.revalidate` cannot both apply.
      ...(init?.next === undefined ? { cache: "no-store" as const } : {}),
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
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
