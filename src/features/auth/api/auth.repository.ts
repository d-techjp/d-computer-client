import { apiClient } from "@/lib/api/client";

import {
  sessionUserResponseSchema,
  type GoogleLoginRequest,
  type LoginRequest,
  type RegisterRequest,
  type SessionUser,
} from "./auth.schema";

/**
 * Browser-side auth calls. The paths mirror the backend's, so the same code
 * works in dev (Next route handlers set the cookie) and in production (nginx
 * forwards to the backend, which sets it). The response body is ignored on
 * purpose: the token lives in an httpOnly cookie and never enters page JS.
 */
export async function login(request: LoginRequest): Promise<SessionUser> {
  await apiClient.post("/auth/login", request);
  return fetchSession();
}

export async function register(request: RegisterRequest): Promise<SessionUser> {
  await apiClient.post("/auth/register", request);
  return fetchSession();
}

export async function loginWithGoogle(request: GoogleLoginRequest): Promise<SessionUser> {
  await apiClient.post("/auth/google", request);
  return fetchSession();
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function fetchSession(): Promise<SessionUser> {
  const { data } = await apiClient.get<unknown>("/users/me");
  return sessionUserResponseSchema.parse(data);
}
