import { describe, expect, it } from "vitest";
import type { TDieValue } from "@/rules/types";
import { offsetFor, REEL_CYCLES, restIndex, startIndex, STRIP_LENGTH, stripFaces } from "../reelGeometry";

const VALUES: TDieValue[] = [1, 2, 3, 4, 5, 6];

describe("reel geometry", () => {
  it("repeats the six faces for every cycle", () => {
    expect(stripFaces()).toHaveLength(STRIP_LENGTH);
    expect(STRIP_LENGTH).toBe(6 * REEL_CYCLES);
    expect(stripFaces().slice(0, 6)).toEqual(VALUES);
    expect(stripFaces().slice(-6)).toEqual(VALUES);
  });

  it("rests and starts on the requested face", () => {
    for (const value of VALUES) {
      expect(stripFaces()[restIndex(value)]).toBe(value);
      expect(stripFaces()[startIndex(value)]).toBe(value);
    }
  });

  it("always spins forward by at least two full turns", () => {
    for (const from of VALUES) {
      for (const to of VALUES) expect(restIndex(to) - startIndex(from)).toBeGreaterThanOrEqual(12);
    }
  });

  it("leaves a full cycle below the rest position for the overshoot", () => {
    expect(STRIP_LENGTH - 1 - restIndex(6)).toBeGreaterThanOrEqual(6);
  });

  it("offsets are a share of the strip height", () => {
    expect(offsetFor(0)).toBe("0%");
    expect(offsetFor(STRIP_LENGTH / 2)).toBe("-50%");
  });
});
