"use client";

import type { Ref } from "react";
import type { IDiceState } from "@/state/types";
import { Lever } from "./Lever";
import { Marquee } from "./Marquee";
import { Reel, type ISpin } from "./Reel";
import { RollButton } from "./RollButton";
import { useHaptics } from "./useHaptics";

interface ISlotCabinetProps {
  ref?: Ref<HTMLElement>;
  dice: IDiceState;
  spin: ISpin | null;
  canRoll: boolean;
  canLock: boolean;
  rollsLeft: number;
  onRoll: () => void;
  onToggleLock: (index: number) => void;
  onSettled: () => void;
}

function HoldLamp({ lit }: { lit: boolean }) {
  return (
    <span
      className={`w-full max-w-12 min-w-0 flex-1 rounded-md py-px text-center text-[9px] font-bold uppercase tracking-widest transition-colors duration-200 ${
        lit ? "bg-ink text-tile" : "bg-ink/10 text-ink/30"
      }`}
    >
      Hold
    </span>
  );
}

export function SlotCabinet({ ref, dice, spin, canRoll, canLock, rollsLeft, onRoll, onToggleLock, onSettled }: ISlotCabinetProps) {
  const { tick, switchRef } = useHaptics();
  const spinning = spin !== null;
  const rolled = dice.rollsUsed > 0;
  const lastSpinningIndex = dice.locked.lastIndexOf(false);

  function roll() {
    if (!canRoll || spinning) return;
    tick();
    onRoll();
  }

  function toggleLock(index: number) {
    tick();
    onToggleLock(index);
  }

  return (
    <section
      ref={ref}
      aria-label="Dice"
      className="flex flex-col gap-3 rounded-3xl bg-canvas-strong p-3"
    >
      <Marquee busy={spinning} />

      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full justify-center rounded-2xl bg-tile px-2 py-3">
            <div className="flex w-full max-w-72 justify-center gap-1.5">
              {dice.values.map((value, i) => {
                const held = dice.locked[i];
                return (
                  <Reel
                    key={i}
                    index={i}
                    value={value}
                    held={held}
                    rolled={rolled}
                    canHold={canLock && !spinning}
                    spin={held ? null : spin}
                    onToggleHold={() => toggleLock(i)}
                    onSettled={() => {
                      tick();
                      if (i === lastSpinningIndex) onSettled();
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div aria-hidden="true" className="flex w-full max-w-72 justify-center gap-1.5 px-2">
            {dice.locked.map((held, i) => (
              <HoldLamp key={i} lit={held} />
            ))}
          </div>
        </div>
        <Lever disabled={!canRoll || spinning} onPull={roll} />
      </div>

      <RollButton rollsLeft={rollsLeft} disabled={!canRoll || spinning} onRoll={roll} />

      <input
        ref={switchRef}
        type="checkbox"
        {...{ switch: "" }}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute size-px opacity-0"
      />
    </section>
  );
}
