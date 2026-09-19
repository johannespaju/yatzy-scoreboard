import { describe, expect, it } from "vitest";
import { calculateTotals, ECategory, getMaxTotal, SCANDINAVIAN_YATZY } from "./index";

describe("calculateTotals", () => {
  it("sums an empty sheet to zero", () => {
    expect(calculateTotals(SCANDINAVIAN_YATZY, {})).toEqual({ upperSum: 0, bonus: 0, lowerSum: 0, total: 0 });
  });

  it("gives the bonus at exactly 63 in the upper section", () => {
    const sheet = {
      [ECategory.Ones]: 3,
      [ECategory.Twos]: 6,
      [ECategory.Threes]: 9,
      [ECategory.Fours]: 12,
      [ECategory.Fives]: 15,
      [ECategory.Sixes]: 18,
    };
    expect(calculateTotals(SCANDINAVIAN_YATZY, sheet)).toEqual({ upperSum: 63, bonus: 50, lowerSum: 0, total: 113 });
  });

  it("gives no bonus at 62", () => {
    const sheet = { [ECategory.Sixes]: 30, [ECategory.Fives]: 25, [ECategory.Fours]: 4, [ECategory.Threes]: 3 };
    expect(calculateTotals(SCANDINAVIAN_YATZY, sheet).bonus).toBe(0);
  });

  it("splits upper and lower sums", () => {
    const sheet = { [ECategory.Ones]: 2, [ECategory.Chance]: 20 };
    expect(calculateTotals(SCANDINAVIAN_YATZY, sheet)).toEqual({ upperSum: 2, bonus: 0, lowerSum: 20, total: 22 });
  });
});

describe("getMaxTotal", () => {
  it("is 374 for Scandinavian Yatzy", () => {
    expect(getMaxTotal(SCANDINAVIAN_YATZY)).toBe(374);
  });
});
