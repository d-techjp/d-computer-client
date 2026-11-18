/**
 * The shopper's checkout details kept in this browser, so leaving the page —
 * the Stripe payment page and back, a reload, closing the tab — never means
 * typing the address again.
 *
 * Per-device convenience only: storage may be blocked (private mode) or wiped,
 * so every access is wrapped and a missing draft just means an empty form.
 * The order note is deliberately not kept: it belongs to one order, and a stale
 * note silently carried into the next one is worse than retyping it.
 */
const KEY = "dcs_checkout_draft_v1";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type CheckoutDraft = {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  /** Signed-in shoppers: which saved address was picked, or "new". */
  addressChoice?: string;
};

const FIELDS = ["fullName", "phone", "email", "province", "district", "ward", "street"] as const;

export function loadCheckoutDraft(): Partial<CheckoutDraft> {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { savedAt?: number; draft?: Record<string, unknown> };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS || !parsed.draft) return {};

    const draft: Partial<CheckoutDraft> = {};
    for (const field of FIELDS) {
      const value = parsed.draft[field];
      if (typeof value === "string") draft[field] = value.slice(0, 255);
    }
    if (typeof parsed.draft.addressChoice === "string") {
      draft.addressChoice = parsed.draft.addressChoice;
    }
    return draft;
  } catch {
    return {};
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  try {
    const picked: Record<string, string> = {};
    for (const field of FIELDS) picked[field] = draft[field];
    if (draft.addressChoice) picked.addressChoice = draft.addressChoice;
    window.localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), draft: picked }));
  } catch {
    // Storage full or blocked — the form still works, it just won't be remembered.
  }
}
