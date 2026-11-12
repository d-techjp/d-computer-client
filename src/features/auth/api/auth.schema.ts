import { z } from "zod";

import { envelopeOrPlainSchema } from "@/lib/api/envelope";

/** Mirrors the backend's PASSWORD_RULE so the form rejects what the API would. */
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

const captchaToken = z.string().min(1).max(2048);

export const loginRequestSchema = z.object({
  username: z.string().trim().min(3).max(255),
  password: z.string().min(6).max(72),
  captchaToken,
});

export const registerRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().regex(PASSWORD_RULE),
  phone: z.string().trim().min(9).max(20).optional(),
  captchaToken,
});

export const googleLoginRequestSchema = z.object({
  idToken: z.string().min(20).max(4096),
  captchaToken,
});

/** What the backend's /auth/{login,register,google} return. Never forwarded to the browser. */
export const authTokenSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().int().positive(),
});

/** The signed-in shopper as the storefront sees it (`GET /users/me`). */
export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().nullable(),
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  hasGoogleLogin: z.boolean(),
  createdAt: z.string(),
});

export const authTokenResponseSchema = envelopeOrPlainSchema(authTokenSchema);
export const sessionUserResponseSchema = envelopeOrPlainSchema(sessionUserSchema);

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
