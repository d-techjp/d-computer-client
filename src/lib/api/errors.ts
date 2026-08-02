import axios from "axios";

/**
 * One error type for the whole UI. Components branch on `ApiError` fields
 * instead of poking at `err.response?.data?.message` and hoping.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, options: { status?: number; code?: string; cause?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "unknown_error";
    this.cause = options.cause;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

type ErrorBody = { message?: string; code?: string };

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ErrorBody>(error)) {
    if (axios.isCancel(error)) {
      return new ApiError("Request cancelled", { code: "cancelled", cause: error });
    }

    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    return new ApiError(body?.message ?? error.message, {
      status,
      code: body?.code ?? (status === 0 ? "network_error" : `http_${status}`),
      cause: error,
    });
  }

  return new ApiError(error instanceof Error ? error.message : "Unexpected error", {
    cause: error,
  });
}
