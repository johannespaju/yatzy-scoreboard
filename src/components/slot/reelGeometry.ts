import type { TDieValue } from "@/rules/types";

export const REEL_CYCLES = 5;
const REST_CYCLE = REEL_CYCLES - 2;

const FACES: readonly TDieValue[] = [1, 2, 3, 4, 5, 6];

export function stripFaces(): TDieValue[] {
  return Array.from({ length: REEL_CYCLES }, () => FACES).flat();
}

export const STRIP_LENGTH = REEL_CYCLES * FACES.length;

function indexOf(cycle: number, value: TDieValue): number {
  return cycle * FACES.length + (value - 1);
}

export function restIndex(value: TDieValue): number {
  return indexOf(REST_CYCLE, value);
}

export function startIndex(value: TDieValue): number {
  return indexOf(0, value);
}

export function offsetFor(index: number): string {
  return `${(-index * 100) / STRIP_LENGTH}%`;
}
