"use client";

import { MAX_ROLLS } from "@/state/dice";

interface IRollButtonProps {
  rollsLeft: number;
  disabled: boolean;
  onRoll: () => void;
}

export function RollDots({ rollsLeft }: { rollsLeft: number }) {
  return (
    <div aria-hidden="true" className="flex gap-1">
      {Array.from({ length: MAX_ROLLS }, (_, i) => (
        <span
          key={i}
          className={`size-2 rounded-full transition-colors duration-200 ${
            i < rollsLeft ? "bg-ink" : "bg-ink/15"
          }`}
        />
      ))}
    </div>
  );
}

export function RollButton({ rollsLeft, disabled, onRoll }: IRollButtonProps) {
  const label = rollsLeft === 0 ? "No rolls left" : `${rollsLeft} ${rollsLeft === 1 ? "roll" : "rolls"} left`;
  return (
    <div className="flex flex-1 items-center gap-3">
      <button
        type="button"
        aria-label="Roll dice"
        disabled={disabled}
        onClick={onRoll}
        className="flex-1 rounded-full bg-ink py-3 text-lg font-bold text-tile transition-[transform,opacity] duration-150 enabled:active:scale-95 disabled:opacity-30"
      >
        Roll
      </button>
      <div className="flex flex-col items-center gap-1.5">
        <RollDots rollsLeft={rollsLeft} />
        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
