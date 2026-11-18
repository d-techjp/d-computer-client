"use client";

import { useCallback, useEffect, useState } from "react";

import { listAddresses } from "@/features/account/api/account.repository";
import type { SavedAddress } from "@/features/account/api/account.schema";
import { useAuthActions, useAuthStatus } from "@/features/auth/store/auth.store";

/**
 * Saved addresses for a signed-in shopper; `[]` for guests (and on any
 * failure — checkout must keep working with the plain form).
 */
export function useSavedAddresses() {
  const status = useAuthStatus();
  const { load } = useAuthActions();
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => {
    try {
      setAddresses(await listAddresses());
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    listAddresses()
      .then((list) => !cancelled && setAddresses(list))
      .catch(() => !cancelled && setAddresses([]));
    return () => {
      cancelled = true;
    };
  }, [status]);

  return {
    status,
    addresses: status === "authenticated" ? addresses : status === "guest" ? [] : null,
    reload,
  };
}
