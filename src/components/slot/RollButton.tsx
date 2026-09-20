"use client";

import { MAX_ROLLS } from "@/state/dice";

interface IRollButtonProps {
  rollsLeft: number;
  disabled: boolean;
  onRoll: () => void;
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
        className="flex-1 rounded-full border-2 border-(--slot-gold-bright) bg-linear-to-b from-(--slot-gold-bright) to-(--slot-gold) py-3 font-display text-xl font-extrabold uppercase tracking-widest text-(--slot-red-deep) shadow-[0_4px_0_var(--slot-red-deep),0_6px_12px_rgb(0_0_0/0.4)] transition-[transform,box-shadow,opacity] duration-150 enabled:active:translate-y-1 enabled:active:shadow-[0_0_0_var(--slot-red-deep)] disabled:opacity-40"
      >
        Roll
      </button>
      <div className="flex flex-col items-center gap-1">
        <div aria-hidden="true" className="flex gap-1">
          {Array.from({ length: MAX_ROLLS }, (_, i) => (
            <span
              key={i}
              className={`size-2.5 rounded-full transition-colors duration-200 ${
                i < rollsLeft ? "bg-(--slot-bulb-on) shadow-[0_0_6px_var(--slot-bulb-on)]" : "bg-(--slot-red-deep)"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-(--slot-gold-bright)">{label}</span>
      </div>
    </div>
  );
}
