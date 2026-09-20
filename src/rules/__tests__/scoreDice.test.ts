import { describe, expect, it } from "vitest";
import { BEST_YATZY } from "../best";
import { RULE_SETS } from "../ruleSets";
import { SCANDINAVIAN_YATZY } from "../scandinavian";
import { scoreDice } from "../scoreDice";
import { ECategory, type IRuleSet, type TDieValue } from "../types";

function score(ruleSet: IRuleSet, categoryId: ECategory, dice: TDieValue[]): number {
  const category = ruleSet.categories.find((c) => c.id === categoryId)!;
  return scoreDice(category, dice);
}

const scandi = (categoryId: ECategory, dice: TDieValue[]) => score(SCANDINAVIAN_YATZY, categoryId, dice);
const best = (categoryId: ECategory, dice: TDieValue[]) => score(BEST_YATZY, categoryId, dice);

describe("scoreDice", () => {
  it("scores upper categories as the sum of matching dice", () => {
    expect(scandi(ECategory.Threes, [3, 3, 1, 3, 6])).toBe(9);
    expect(scandi(ECategory.Ones, [3, 3, 1, 3, 6])).toBe(1);
    expect(scandi(ECategory.Twos, [3, 3, 1, 3, 6])).toBe(0);
  });

  it("scores One Pair as the highest pair", () => {
    expect(scandi(ECategory.OnePair, [2, 2, 5, 5, 1])).toBe(10);
    expect(scandi(ECategory.OnePair, [6, 6, 6, 1, 2])).toBe(12);
    expect(scandi(ECategory.OnePair, [6, 6, 6, 6, 6])).toBe(12);
    expect(scandi(ECategory.OnePair, [1, 2, 3, 4, 5])).toBe(0);
  });

  it("requires two different pairs for Two Pairs", () => {
    expect(scandi(ECategory.TwoPairs, [2, 2, 5, 5, 1])).toBe(14);
    expect(scandi(ECategory.TwoPairs, [6, 6, 6, 5, 5])).toBe(22);
    expect(scandi(ECategory.TwoPairs, [6, 6, 6, 6, 1])).toBe(0);
    expect(scandi(ECategory.TwoPairs, [3, 3, 3, 3, 3])).toBe(0);
    expect(scandi(ECategory.TwoPairs, [1, 1, 2, 3, 4])).toBe(0);
  });

  it("scores Three and Four of a Kind", () => {
    expect(scandi(ECategory.ThreeOfAKind, [4, 4, 4, 2, 2])).toBe(12);
    expect(scandi(ECategory.FourOfAKind, [4, 4, 4, 2, 2])).toBe(0);
    expect(scandi(ECategory.ThreeOfAKind, [5, 5, 5, 5, 1])).toBe(15);
    expect(scandi(ECategory.FourOfAKind, [5, 5, 5, 5, 1])).toBe(20);
    expect(scandi(ECategory.FourOfAKind, [6, 6, 6, 6, 6])).toBe(24);
  });

  it("requires exactly three and two of different faces for Full House", () => {
    expect(scandi(ECategory.FullHouse, [2, 2, 3, 3, 3])).toBe(13);
    expect(scandi(ECategory.FullHouse, [6, 6, 6, 5, 5])).toBe(28);
    expect(scandi(ECategory.FullHouse, [4, 4, 4, 4, 1])).toBe(0);
    expect(scandi(ECategory.FullHouse, [5, 5, 5, 5, 5])).toBe(0);
    expect(scandi(ECategory.FullHouse, [1, 2, 3, 4, 5])).toBe(0);
  });

  it("scores Scandinavian straights only for the exact faces", () => {
    expect(scandi(ECategory.SmallStraight, [5, 4, 3, 2, 1])).toBe(15);
    expect(scandi(ECategory.LargeStraight, [5, 4, 3, 2, 1])).toBe(0);
    expect(scandi(ECategory.SmallStraight, [2, 3, 4, 5, 6])).toBe(0);
    expect(scandi(ECategory.LargeStraight, [2, 3, 4, 5, 6])).toBe(20);
    expect(scandi(ECategory.SmallStraight, [1, 2, 3, 4, 6])).toBe(0);
  });

  it("scores Best Yatzy straights for any run of four or five", () => {
    expect(best(ECategory.SmallStraight, [1, 2, 3, 4, 4])).toBe(30);
    expect(best(ECategory.LargeStraight, [1, 2, 3, 4, 4])).toBe(0);
    expect(best(ECategory.SmallStraight, [3, 4, 5, 6, 1])).toBe(30);
    expect(best(ECategory.SmallStraight, [1, 2, 3, 4, 5])).toBe(30);
    expect(best(ECategory.LargeStraight, [1, 2, 3, 4, 5])).toBe(40);
    expect(best(ECategory.LargeStraight, [2, 3, 4, 5, 6])).toBe(40);
    expect(best(ECategory.SmallStraight, [1, 2, 3, 5, 6])).toBe(0);
  });

  it("scores Yatzy and Chance", () => {
    expect(scandi(ECategory.Yatzy, [4, 4, 4, 4, 4])).toBe(50);
    expect(scandi(ECategory.Yatzy, [4, 4, 4, 4, 5])).toBe(0);
    expect(scandi(ECategory.Chance, [1, 2, 3, 4, 5])).toBe(15);
  });

  it("does not depend on dice order", () => {
    for (const category of SCANDINAVIAN_YATZY.categories) {
      expect(scoreDice(category, [5, 2, 5, 3, 2])).toBe(scoreDice(category, [2, 2, 3, 5, 5]));
    }
  });

  it("only ever produces 0 or a listed valid value, and reaches every valid value", () => {
    const rolls: TDieValue[][] = [];
    for (let n = 0; n < 6 ** 5; n++) {
      rolls.push([0, 1, 2, 3, 4].map((i) => ((Math.floor(n / 6 ** i) % 6) + 1) as TDieValue));
    }
    for (const ruleSet of Object.values(RULE_SETS)) {
      for (const category of ruleSet.categories) {
        const seen = new Set(rolls.map((dice) => scoreDice(category, dice)));
        for (const value of seen) expect(value === 0 || category.validValues.includes(value)).toBe(true);
        for (const value of category.validValues) expect(seen.has(value)).toBe(true);
      }
    }
  });
});
