import type { TDieValue } from "@/rules/types";

/** The strip repeats the six faces this many times so a spin can travel a few turns. */
export const REEL_CYCLES = 5;
/** Where the strip comes to rest: a full cycle is still below it so the overshoot has faces to show. */
const REST_CYCLE = REEL_CYCLES - 2;

const FACES: readonly TDieValue[] = [1, 2, 3, 4, 5, 6];

/** All faces on the strip, top to bottom. */
export function stripFaces(): TDieValue[] {
  return Array.from({ length: REEL_CYCLES }, () => FACES).flat();
}

export const STRIP_LENGTH = REEL_CYCLES * FACES.length;

/** Strip index of `value` in a given cycle. */
function indexOf(cycle: number, value: TDieValue): number {
  return cycle * FACES.length + (value - 1);
}

/** Strip index shown in the window when the reel is still. */
export function restIndex(value: TDieValue): number {
  return indexOf(REST_CYCLE, value);
}

/** Strip index a spin starts from: the same face near the top, so it always travels forward. */
export function startIndex(value: TDieValue): number {
  return indexOf(0, value);
}

/** translateY that scrolls the strip so `index` sits in the window. Percent of the strip's own height, so the reel can be any size. */
export function offsetFor(index: number): string {
  return `${(-index * 100) / STRIP_LENGTH}%`;
}
