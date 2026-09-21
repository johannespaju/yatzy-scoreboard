"use client";

import { useRef, type PointerEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface ILeverProps {
  disabled: boolean;
  onPull: () => void;
}

const PULL_THRESHOLD = 24;
const TAP_MAX = 8;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export function Lever({ disabled, onPull }: ILeverProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const rodRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  function maxPull() {
    return rodRef.current?.offsetHeight ?? PULL_THRESHOLD;
  }

  function styleFor(pull: number) {
    const rodLength = maxPull();
    return { knob: `translateY(${pull}px)`, rod: `scaleY(${(rodLength - pull) / rodLength})` };
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
    return Math.min(maxPull(), Math.max(0, event.clientY - (startY.current ?? event.clientY)));
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
      const max = maxPull();
      animateTo(0, max, 160);
      window.setTimeout(() => animateTo(max, 0, 320), 160);
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
      className={`relative w-10 shrink-0 touch-none select-none transition-opacity duration-200 ${
        disabled ? "opacity-50" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div
        ref={rodRef}
        className="absolute inset-x-0 top-6 bottom-6 mx-auto w-1.5 origin-bottom rounded-full bg-ink/30"
      />
      <div className="absolute inset-x-0 bottom-1 mx-auto h-8 w-6 rounded-md bg-ink/30" />
      <div
        ref={knobRef}
        className="absolute inset-x-0 top-2 mx-auto size-8 rounded-full bg-ink"
      />
    </div>
  );
}
