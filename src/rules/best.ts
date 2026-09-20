import { range } from "./range";
import { ECategory, ESection, type IRuleSet } from "./types";

/** Scandinavian Yatzy, but with the American straights (four in a row = 30, five in a row = 40). */
export const BEST_YATZY: IRuleSet = {
  id: "best",
  name: "Best Yatzy",
  bonus: { threshold: 63, amount: 50 },
  categories: [
    { id: ECategory.Ones, label: "Ones", section: ESection.Upper, validValues: range(1, 5), dice: [[1, 1, 1, 1, 1]] },
    { id: ECategory.Twos, label: "Twos", section: ESection.Upper, validValues: range(2, 10, 2), dice: [[2, 2, 2, 2, 2]] },
    { id: ECategory.Threes, label: "Threes", section: ESection.Upper, validValues: range(3, 15, 3), dice: [[3, 3, 3, 3, 3]] },
    { id: ECategory.Fours, label: "Fours", section: ESection.Upper, validValues: range(4, 20, 4), dice: [[4, 4, 4, 4, 4]] },
    { id: ECategory.Fives, label: "Fives", section: ESection.Upper, validValues: range(5, 25, 5), dice: [[5, 5, 5, 5, 5]] },
    { id: ECategory.Sixes, label: "Sixes", section: ESection.Upper, validValues: range(6, 30, 6), dice: [[6, 6, 6, 6, 6]] },
    { id: ECategory.OnePair, label: "One Pair", section: ESection.Lower, validValues: range(2, 12, 2), dice: [[6, 6]] },
    { id: ECategory.TwoPairs, label: "Two Pairs", section: ESection.Lower, validValues: range(6, 22, 2), dice: [[6, 6], [5, 5]] },
    { id: ECategory.ThreeOfAKind, label: "Three of a Kind", section: ESection.Lower, validValues: range(3, 18, 3), dice: [[6, 6, 6]] },
    { id: ECategory.FourOfAKind, label: "Four of a Kind", section: ESection.Lower, validValues: range(4, 24, 4), dice: [[5, 5, 5, 5]] },
    { id: ECategory.SmallStraight, label: "Small Straight", section: ESection.Lower, validValues: [30], dice: [[1, 2, 3, 4]] },
    { id: ECategory.LargeStraight, label: "Large Straight", section: ESection.Lower, validValues: [40], dice: [[1, 2, 3, 4, 5]] },
    { id: ECategory.FullHouse, label: "Full House", section: ESection.Lower, validValues: range(7, 28), dice: [[5, 5, 5], [6, 6]] },
    { id: ECategory.Chance, label: "Chance", section: ESection.Lower, validValues: range(5, 30), dice: [["?", "?", "?", "?", "?"]] },
    { id: ECategory.Yatzy, label: "Yatzy", section: ESection.Lower, validValues: [50] },
  ],
};
