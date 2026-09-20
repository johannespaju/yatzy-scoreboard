"use client";

import type { AnimationEvent, CSSProperties } from "react";
import { Die } from "@/components/dice/Die";
import type { TDieValue } from "@/rules/types";
import { offsetFor, restIndex, startIndex, STRIP_LENGTH, stripFaces } from "./reelGeometry";

/** One roll's animation. `from` is what each reel showed before the roll. */
export interface ISpin {
  id: number;
  from: TDieValue[];
}

interface IReelProps {
  index: number;
  value: TDieValue;
  held: boolean;
  rolled: boolean;
  /** Whether tapping the reel may toggle hold right now (false while any reel spins). */
  canHold: boolean;
  /** Set while this reel should be spinning towards `value`; held reels get null. */
  spin: ISpin | null;
  onToggleHold: () => void;
  onSettled: () => void;
}

const STRIP = stripFaces();
const STAGGER_MS = 120;

export function Reel({ index, value, held, rolled, canHold, spin, onToggleHold, onSettled }: IReelProps) {
  const spinning = spin !== null;

  // The strip is remounted per spin (key) so the CSS animation restarts cleanly.
  const stripStyle: CSSProperties & Record<`--${string}`, string> = {
    height: `${STRIP_LENGTH * 100}%`,
    transform: `translateY(${offsetFor(restIndex(value))})`,
    "--reel-from": offsetFor(startIndex(spin?.from[index] ?? value)),
    "--reel-to": offsetFor(restIndex(value)),
    animationDelay: `${index * STAGGER_MS}ms`,
  };

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onSettled();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <button
        type="button"
        aria-pressed={held}
        aria-label={`Die ${index + 1}: ${rolled ? value : "not rolled"}${held ? ", held" : ""}`}
        disabled={!canHold}
        onClick={onToggleHold}
        className={`relative aspect-[6/7] w-full max-w-12 overflow-hidden rounded-lg border-2 border-(--slot-chrome-dark) bg-tile text-ink transition-[box-shadow,transform] duration-200 enabled:active:scale-95 ${
          held ? "border-(--slot-gold) motion-safe:animate-lock-glow shadow-[0_0_0_3px_var(--slot-gold)]" : ""
        }`}
      >
        <div
          key={spin?.id ?? "still"}
          onAnimationEnd={handleAnimationEnd}
          className={`flex flex-col will-change-transform ${spinning ? "motion-safe:animate-reel-spin" : ""}`}
          style={stripStyle}
        >
          {STRIP.map((face, i) => (
            <div key={i} className="flex flex-1 items-center justify-center">
              <Die face={face} size="82%" />
            </div>
          ))}
        </div>
        {/* Curved-drum shading */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent via-30% to-black/40" />
      </button>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest text-(--slot-gold-bright) transition-opacity duration-200 ${
          held ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        Hold
      </span>
    </div>
  );
}
