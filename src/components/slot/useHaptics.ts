"use client";

import { useRef, type RefObject } from "react";

export interface IHaptics {
  /** A short tap. Best effort: silently does nothing where haptics are unavailable. */
  tick: () => void;
  /** Attach to the hidden `<input type="checkbox" switch>` rendered by the cabinet. */
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
    } catch {
      // Haptics are decoration; never let them break a roll.
    }
  }

  return { tick, switchRef };
}
