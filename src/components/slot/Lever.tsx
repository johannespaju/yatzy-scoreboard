"use client";

import { useRef, type PointerEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface ILeverProps {
  disabled: boolean;
  onPull: () => void;
}

/** How far the knob can be dragged, how far counts as a pull, and what still counts as a tap. */
const LEVER_MAX = 72;
const PULL_THRESHOLD = 44;
const TAP_MAX = 8;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Decorative slot-machine arm: tap it, or drag it down past the threshold, to roll.
 * It is aria-hidden because the Roll button is the accessible control.
 */
export function Lever({ disabled, onPull }: ILeverProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const rodRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  /** Knob moves down, rod shortens from the bracket up so nothing pokes out above the knob. */
  function styleFor(pull: number) {
    const rodLength = rodRef.current?.offsetHeight ?? LEVER_MAX;
    return { knob: `translateY(${pull}px)`, rod: `scaleY(${Math.max(0, (rodLength - pull) / rodLength)})` };
  }

  function setPull(pull: number) {
    const { knob, rod } = styleFor(pull);
    if (knobRef.current) knobRef.current.style.transform = knob;
    if (rodRef.current) rodRef.current.style.transform = rod;
  }

  function animateTo(from: number, to: number, duration: number) {
    if (prefersReducedMotion()) {
      setPull(to);
      return;
    }
    const start = styleFor(from);
    const end = styleFor(to);
    knobRef.current?.animate([{ transform: start.knob }, { transform: end.knob }], { duration, easing: EASE });
    rodRef.current?.animate([{ transform: start.rod }, { transform: end.rod }], { duration, easing: EASE });
    setPull(to);
  }

  function pullFrom(event: PointerEvent<HTMLDivElement>) {
    return Math.min(LEVER_MAX, Math.max(0, event.clientY - (startY.current ?? event.clientY)));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (startY.current !== null) setPull(pullFrom(event));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startY.current === null) return;
    const pull = pullFrom(event);
    startY.current = null;
    if (pull < TAP_MAX) {
      // A tap: yank the handle down and back.
      animateTo(0, LEVER_MAX, 160);
      window.setTimeout(() => animateTo(LEVER_MAX, 0, 320), 160);
      onPull();
      return;
    }
    animateTo(pull, 0, 320);
    if (pull >= PULL_THRESHOLD) onPull();
  }

  return (
    <div
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-12 shrink-0 touch-none select-none transition-opacity duration-200 ${
        disabled ? "opacity-50" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* Rod from the knob's rest position down to the bracket */}
      <div
        ref={rodRef}
        className="absolute inset-x-0 top-4 bottom-6 mx-auto w-2 origin-bottom bg-linear-to-r from-(--slot-chrome-dark) via-(--slot-chrome) to-(--slot-chrome-dark)"
      />
      {/* Bracket */}
      <div className="absolute inset-x-0 bottom-1 mx-auto h-9 w-7 rounded-md bg-linear-to-r from-(--slot-chrome-dark) via-(--slot-chrome) to-(--slot-chrome-dark) shadow-[0_2px_4px_rgb(0_0_0/0.5)]" />
      {/* Knob */}
      <div
        ref={knobRef}
        className="absolute inset-x-0 top-0 mx-auto size-9 rounded-full bg-radial-[at_35%_30%] from-[#ff7b7b] via-(--slot-red) to-(--slot-red-deep) shadow-[0_3px_6px_rgb(0_0_0/0.5),inset_0_-2px_4px_rgb(0_0_0/0.3)]"
      />
    </div>
  );
}
