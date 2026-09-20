"use client";

import type { IDiceState } from "@/state/types";
import { Lever } from "./Lever";
import { Marquee } from "./Marquee";
import { Reel, type ISpin } from "./Reel";
import { RollButton } from "./RollButton";
import { useHaptics } from "./useHaptics";

interface ISlotCabinetProps {
  dice: IDiceState;
  /** The roll currently animating, if any. */
  spin: ISpin | null;
  canRoll: boolean;
  canLock: boolean;
  rollsLeft: number;
  playerName: string;
  onRoll: () => void;
  onToggleLock: (index: number) => void;
  /** All reels have stopped. */
  onSettled: () => void;
}

export function SlotCabinet({
  dice,
  spin,
  canRoll,
  canLock,
  rollsLeft,
  playerName,
  onRoll,
  onToggleLock,
  onSettled,
}: ISlotCabinetProps) {
  const { tick, switchRef } = useHaptics();
  const spinning = spin !== null;
  const rolled = dice.rollsUsed > 0;
  // Reels stop left to right, so the last unheld one ends the spin.
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
      aria-label="Dice"
      className="slot-cabinet flex flex-col gap-3 rounded-3xl border-4 border-(--slot-gold) bg-linear-to-b from-(--slot-red) to-(--slot-red-deep) p-3 text-(--slot-gold-bright) shadow-[0_10px_30px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.25)]"
    >
      <Marquee busy={spinning} />

      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border-2 border-(--slot-felt-deep) bg-(--slot-felt) px-2 py-3 shadow-[inset_0_4px_12px_rgb(0_0_0/0.5)]">
          <div className="flex w-full max-w-72 gap-1.5">
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
        <Lever disabled={!canRoll || spinning} onPull={roll} />
      </div>

      <div className="flex items-center gap-3">
        <RollButton rollsLeft={rollsLeft} disabled={!canRoll || spinning} onRoll={roll} />
      </div>

      <p className="text-center text-xs font-bold uppercase tracking-widest text-(--slot-gold)">
        <span className="text-(--slot-gold-bright)">{playerName}</span> to roll
      </p>

      {/* iOS haptics: toggling a native switch gives a tick. Kept off-screen but clickable. */}
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
