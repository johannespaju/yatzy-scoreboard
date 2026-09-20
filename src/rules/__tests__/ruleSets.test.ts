import { describe, expect, it } from "vitest";
import { AMERICAN_YATZY } from "../american";
import { DEFAULT_RULE_SET_ID, getRuleSet, isValidScore, RULE_SETS } from "../ruleSets";
import { SCANDINAVIAN_YATZY } from "../scandinavian";
import { ECategory } from "../types";

describe("RULE_SETS", () => {
  it("defaults to Scandinavian Yatzy", () => {
    expect(getRuleSet(DEFAULT_RULE_SET_ID)).toBe(SCANDINAVIAN_YATZY);
  });

  it("registers American Yatzy", () => {
    expect(getRuleSet("american")).toBe(AMERICAN_YATZY);
  });

  it("uses each rule set's own id as its key", () => {
    for (const [key, ruleSet] of Object.entries(RULE_SETS)) expect(ruleSet.id).toBe(key);
  });
});

describe("isValidScore (American Yatzy)", () => {
  it.each([
    [ECategory.FullHouse, 25],
    [ECategory.SmallStraight, 30],
    [ECategory.LargeStraight, 40],
    [ECategory.ThreeOfAKind, 17],
    [ECategory.FourOfAKind, 6],
    [ECategory.Yatzy, 50],
  ])("accepts %s = %i", (categoryId, value) => {
    expect(isValidScore(AMERICAN_YATZY, categoryId, value)).toBe(true);
  });

  it.each([
    [ECategory.FullHouse, 24],
    [ECategory.SmallStraight, 15],
    [ECategory.LargeStraight, 20],
    [ECategory.ThreeOfAKind, 31],
    [ECategory.OnePair, 12],
  ])("rejects %s = %i", (categoryId, value) => {
    expect(isValidScore(AMERICAN_YATZY, categoryId, value)).toBe(false);
  });

  it("allows scratching every category", () => {
    for (const category of AMERICAN_YATZY.categories) expect(isValidScore(AMERICAN_YATZY, category.id, 0)).toBe(true);
  });
});
