import type { TDieValue } from "@/rules/types";
import type { IDiceState } from "./types";

export const DICE_COUNT = 5;
export const MAX_ROLLS = 3;

/** A fresh turn: nothing rolled, nothing held. */
export function createDiceState(): IDiceState {
  return { values: [1, 2, 3, 4, 5], locked: [false, false, false, false, false], rollsUsed: 0 };
}

export function isDieValue(value: unknown): value is TDieValue {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 6;
}

/** Five random die values. `random` is injectable for tests. */
export function randomDieValues(random: () => number = Math.random): TDieValue[] {
  return Array.from({ length: DICE_COUNT }, () => (Math.floor(random() * 6) + 1) as TDieValue);
}
