"use client";

import { Die } from "@/components/dice/Die";
import type { IDiceState } from "@/state/types";
import { RollDots } from "./RollButton";

interface IDiceBarProps {
  dice: IDiceState;
  rollsLeft: number;
  playerName: string;
  visible: boolean;
  onClick: () => void;
}

export function DiceBar({ dice, rollsLeft, playerName, visible, onClick }: IDiceBarProps) {
  const rolled = dice.rollsUsed > 0;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 px-4">
      <button
        type="button"
        aria-label="Back to dice"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={onClick}
        className={`mx-auto flex w-full max-w-lg items-center gap-3 rounded-b-2xl bg-canvas-strong px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-ink shadow-[0_4px_12px_rgb(0_0_0/0.08)] transition-[opacity,transform] duration-200 ${
          visible ? "pointer-events-auto" : "-translate-y-full opacity-0"
        }`}
      >
        <span className="min-w-0 flex-1 truncate text-left text-xs font-bold uppercase tracking-widest">{playerName}</span>
        <span aria-hidden="true" className="flex gap-1 text-ink">
          {dice.values.map((value, i) => (
            <span
              key={i}
              className={`rounded-md bg-tile ${dice.locked[i] ? "shadow-[0_0_0_2px_var(--ink)]" : ""}`}
            >
              <Die face={rolled ? value : "?"} size={22} />
            </span>
          ))}
        </span>
        <RollDots rollsLeft={rollsLeft} />
      </button>
    </div>
  );
}
