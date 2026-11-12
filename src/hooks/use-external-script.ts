"use client";

import { useSyncExternalStore } from "react";

type ScriptStatus = "loading" | "ready" | "error";

const statuses = new Map<string, ScriptStatus>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Injects a third-party `<script>` once per URL, however many components ask for it. */
function ensureScript(src: string) {
  if (statuses.has(src)) return;
  statuses.set(src, "loading");

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    statuses.set(src, "ready");
    notify();
  };
  script.onerror = () => {
    statuses.set(src, "error");
    notify();
  };
  document.head.appendChild(script);
}

/** `null` src means "not needed" (e.g. a feature without its key configured). */
export function useExternalScript(src: string | null): ScriptStatus | "idle" {
  return useSyncExternalStore(
    (onChange) => {
      if (src) ensureScript(src);
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => (src ? (statuses.get(src) ?? "loading") : "idle"),
    () => (src ? "loading" : "idle"),
  );
}
