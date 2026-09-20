"use client";

import { Die } from "@/components/dice/Die";
import type { IDiceState } from "@/state/types";

interface ISlotCabinetProps {
  dice: IDiceState;
  canRoll: boolean;
  canLock: boolean;
  rollsLeft: number;
  playerName: string;
  onRoll: () => void;
  onToggleLock: (index: number) => void;
}

export function SlotCabinet({ dice, canRoll, canLock, rollsLeft, playerName, onRoll, onToggleLock }: ISlotCabinetProps) {
  const rolled = dice.rollsUsed > 0;
  return (
    <section aria-label="Dice" className="flex flex-col gap-3 rounded-3xl bg-tile p-4">
      <div className="flex justify-center gap-2">
        {dice.values.map((value, i) => {
          const held = dice.locked[i];
          return (
            <button
              key={i}
              type="button"
              aria-pressed={held}
              aria-label={`Die ${i + 1}: ${rolled ? value : "not rolled"}${held ? ", held" : ""}`}
              disabled={!canLock}
              onClick={() => onToggleLock(i)}
              className={`rounded-lg p-1 ${held ? "ring-2 ring-ink" : ""} ${rolled ? "" : "opacity-40"}`}
            >
              <Die face={rolled ? value : "?"} size={44} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onRoll}
        disabled={!canRoll}
        aria-label="Roll dice"
        className="rounded-full bg-ink py-3 text-lg font-bold text-tile disabled:opacity-30"
      >
        Roll
      </button>
      <p className="text-center text-xs font-bold uppercase tracking-widest text-ink-muted">
        {playerName} · {rollsLeft === 0 ? "No rolls left" : `${rollsLeft} ${rollsLeft === 1 ? "roll" : "rolls"} left`}
      </p>
    </section>
  );
}
