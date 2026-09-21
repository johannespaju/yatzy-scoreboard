"use client";

import type { AnimationEvent, CSSProperties } from "react";
import { Die } from "@/components/dice/Die";
import type { TDieValue } from "@/rules/types";
import { offsetFor, restIndex, startIndex, STRIP_LENGTH, stripFaces } from "./reelGeometry";

export interface ISpin {
  id: number;
  from: TDieValue[];
}

interface IReelProps {
  index: number;
  value: TDieValue;
  held: boolean;
  rolled: boolean;
  canHold: boolean;
  spin: ISpin | null;
  onToggleHold: () => void;
  onSettled: () => void;
}

const STRIP = stripFaces();
const STAGGER_MS = 120;

export function Reel({ index, value, held, rolled, canHold, spin, onToggleHold, onSettled }: IReelProps) {
  const spinning = spin !== null;

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
    <button
      type="button"
      aria-pressed={held}
      aria-label={`Die ${index + 1}: ${rolled ? value : "not rolled"}${held ? ", held" : ""}`}
      disabled={!canHold}
      onClick={onToggleHold}
      className={`relative aspect-square w-full max-w-12 min-w-0 flex-1 overflow-hidden rounded-lg text-ink transition-[background-color,box-shadow] duration-200 enabled:active:scale-95 ${
        held ? "bg-canvas-strong shadow-[0_0_0_2px_var(--ink)]" : "bg-tile"
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
            <Die face={face} size="74%" />
          </div>
        ))}
      </div>
    </button>
  );
}
