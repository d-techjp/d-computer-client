"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { fetchSession, logout as logoutRequest } from "../api/auth.repository";
import type { SessionUser } from "../api/auth.schema";

type AuthStatus = "unknown" | "guest" | "authenticated";

type AuthStore = {
  status: AuthStatus;
  user: SessionUser | null;
  /** Asks the server who is signed in. Safe to call from many components at once. */
  load: () => Promise<void>;
  setUser: (user: SessionUser) => void;
  logout: () => Promise<void>;
};

/**
 * Not persisted on purpose: the httpOnly cookie is the only source of truth
 * and page JS cannot read it, so the store asks the server once per page load.
 */
let loadPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>()((set) => ({
  status: "unknown",
  user: null,
  load: () => {
    loadPromise ??= fetchSession()
      .then((user) => set({ status: "authenticated", user }))
      .catch(() => {
        // Any failure shows the shopper as a guest — a 401, but also a 404 for
        // an account deleted while its cookie lived on, or the API being down.
        // Waiting on "unknown" would keep the sign-in link hidden for good.
        // `loadPromise` is cleared so the next caller asks again.
        set({ status: "guest", user: null });
        loadPromise = null;
      });
    return loadPromise;
  },
  setUser: (user) => {
    loadPromise = Promise.resolve();
    set({ status: "authenticated", user });
  },
  logout: async () => {
    await logoutRequest().catch(() => undefined);
    loadPromise = Promise.resolve();
    set({ status: "guest", user: null });
  },
}));

export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({ load: state.load, setUser: state.setUser, logout: state.logout })),
  );
