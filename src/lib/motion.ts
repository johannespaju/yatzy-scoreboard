/** True when the OS asks for reduced motion. Animations are then skipped, so `animationend` never fires. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
