import { ECategory, ESection, type IRuleSet } from "./types";

function range(from: number, to: number, step = 1): number[] {
  const values: number[] = [];
  for (let n = from; n <= to; n += step) values.push(n);
  return values;
}

export const SCANDINAVIAN_YATZY: IRuleSet = {
  id: "scandinavian",
  name: "Scandinavian Yatzy",
  bonus: { threshold: 63, amount: 50 },
  categories: [
    { id: ECategory.Ones, label: "Ones", section: ESection.Upper, validValues: range(1, 5) },
    { id: ECategory.Twos, label: "Twos", section: ESection.Upper, validValues: range(2, 10, 2) },
    { id: ECategory.Threes, label: "Threes", section: ESection.Upper, validValues: range(3, 15, 3) },
    { id: ECategory.Fours, label: "Fours", section: ESection.Upper, validValues: range(4, 20, 4) },
    { id: ECategory.Fives, label: "Fives", section: ESection.Upper, validValues: range(5, 25, 5) },
    { id: ECategory.Sixes, label: "Sixes", section: ESection.Upper, validValues: range(6, 30, 6) },
    { id: ECategory.OnePair, label: "One Pair", section: ESection.Lower, validValues: range(2, 12, 2) },
    { id: ECategory.TwoPairs, label: "Two Pairs", section: ESection.Lower, validValues: range(6, 22, 2) },
    { id: ECategory.ThreeOfAKind, label: "Three of a Kind", section: ESection.Lower, validValues: range(3, 18, 3) },
    { id: ECategory.FourOfAKind, label: "Four of a Kind", section: ESection.Lower, validValues: range(4, 24, 4) },
    { id: ECategory.SmallStraight, label: "Small Straight", section: ESection.Lower, validValues: [15] },
    { id: ECategory.LargeStraight, label: "Large Straight", section: ESection.Lower, validValues: [20] },
    { id: ECategory.FullHouse, label: "Full House", section: ESection.Lower, validValues: range(7, 28) },
    { id: ECategory.Chance, label: "Chance", section: ESection.Lower, validValues: range(5, 30) },
    { id: ECategory.Yatzy, label: "Yatzy", section: ESection.Lower, validValues: [50] },
  ],
};
