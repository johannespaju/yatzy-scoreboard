import { describe, expect, it } from "vitest";
import { BEST_YATZY } from "../best";
import { DEFAULT_RULE_SET_ID, getRuleSet, isValidScore, RULE_SETS } from "../ruleSets";
import { SCANDINAVIAN_YATZY } from "../scandinavian";
import { ECategory } from "../types";

describe("RULE_SETS", () => {
  it("defaults to Scandinavian Yatzy", () => {
    expect(getRuleSet(DEFAULT_RULE_SET_ID)).toBe(SCANDINAVIAN_YATZY);
  });

  it("registers Best Yatzy", () => {
    expect(getRuleSet("best")).toBe(BEST_YATZY);
  });

  it("uses each rule set's own id as its key", () => {
    for (const [key, ruleSet] of Object.entries(RULE_SETS)) expect(ruleSet.id).toBe(key);
  });
});

describe("isValidScore (Best Yatzy)", () => {
  it.each([
    [ECategory.SmallStraight, 30],
    [ECategory.LargeStraight, 40],
    [ECategory.OnePair, 12],
    [ECategory.TwoPairs, 22],
    [ECategory.ThreeOfAKind, 18],
    [ECategory.FullHouse, 28],
    [ECategory.Yatzy, 50],
  ])("accepts %s = %i", (categoryId, value) => {
    expect(isValidScore(BEST_YATZY, categoryId, value)).toBe(true);
  });

  it.each([
    [ECategory.SmallStraight, 15],
    [ECategory.LargeStraight, 20],
    [ECategory.FullHouse, 29],
    [ECategory.FullHouse, 10],
    [ECategory.FullHouse, 25],
    [ECategory.ThreeOfAKind, 17],
    [ECategory.FourOfAKind, 6],
  ])("rejects %s = %i", (categoryId, value) => {
    expect(isValidScore(BEST_YATZY, categoryId, value)).toBe(false);
  });

  it("allows scratching every category", () => {
    for (const category of BEST_YATZY.categories) expect(isValidScore(BEST_YATZY, category.id, 0)).toBe(true);
  });
});
