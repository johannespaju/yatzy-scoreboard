"use client";

import { useRef, type RefObject } from "react";

export interface IHaptics {
  tick: () => void;
  switchRef: RefObject<HTMLInputElement | null>;
}

/**
 * Android browsers support navigator.vibrate. iOS Safari does not, but since iOS 17.4
 * toggling a native switch control gives a haptic tick, so we click a hidden one.
 */
export function useHaptics(): IHaptics {
  const switchRef = useRef<HTMLInputElement>(null);

  function tick() {
    try {
      if (typeof navigator.vibrate === "function" && navigator.vibrate(12)) return;
      switchRef.current?.click();
    } catch {}
  }

  return { tick, switchRef };
}
