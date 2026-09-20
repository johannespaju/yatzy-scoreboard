import { range } from "./range";
import { ECategory, ESection, type IRuleSet } from "./types";

// 3 of one face + 2 of another. 10 and 25 are impossible (they would need the same face twice).
const FULL_HOUSE_VALUES = [7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28];

/** Scandinavian Yatzy, but with the American straights (four in a row = 30, five in a row = 40). */
export const BEST_YATZY: IRuleSet = {
  id: "best",
  name: "Best Yatzy",
  bonus: { threshold: 63, amount: 50 },
  categories: [
    { id: ECategory.Ones, label: "Ones", section: ESection.Upper, validValues: range(1, 5), scoring: { kind: "face", face: 1 }, dice: [[1, 1, 1, 1, 1]] },
    { id: ECategory.Twos, label: "Twos", section: ESection.Upper, validValues: range(2, 10, 2), scoring: { kind: "face", face: 2 }, dice: [[2, 2, 2, 2, 2]] },
    { id: ECategory.Threes, label: "Threes", section: ESection.Upper, validValues: range(3, 15, 3), scoring: { kind: "face", face: 3 }, dice: [[3, 3, 3, 3, 3]] },
    { id: ECategory.Fours, label: "Fours", section: ESection.Upper, validValues: range(4, 20, 4), scoring: { kind: "face", face: 4 }, dice: [[4, 4, 4, 4, 4]] },
    { id: ECategory.Fives, label: "Fives", section: ESection.Upper, validValues: range(5, 25, 5), scoring: { kind: "face", face: 5 }, dice: [[5, 5, 5, 5, 5]] },
    { id: ECategory.Sixes, label: "Sixes", section: ESection.Upper, validValues: range(6, 30, 6), scoring: { kind: "face", face: 6 }, dice: [[6, 6, 6, 6, 6]] },
    { id: ECategory.OnePair, label: "One Pair", section: ESection.Lower, validValues: range(2, 12, 2), scoring: { kind: "ofAKind", count: 2 }, dice: [[6, 6]] },
    { id: ECategory.TwoPairs, label: "Two Pairs", section: ESection.Lower, validValues: range(6, 22, 2), scoring: { kind: "twoPairs" }, dice: [[6, 6], [5, 5]] },
    { id: ECategory.ThreeOfAKind, label: "Three of a Kind", section: ESection.Lower, validValues: range(3, 18, 3), scoring: { kind: "ofAKind", count: 3 }, dice: [[6, 6, 6]] },
    { id: ECategory.FourOfAKind, label: "Four of a Kind", section: ESection.Lower, validValues: range(4, 24, 4), scoring: { kind: "ofAKind", count: 4 }, dice: [[5, 5, 5, 5]] },
    { id: ECategory.SmallStraight, label: "Small Straight", section: ESection.Lower, validValues: [30], scoring: { kind: "run", length: 4, score: 30 }, dice: [[1, 2, 3, 4]] },
    { id: ECategory.LargeStraight, label: "Large Straight", section: ESection.Lower, validValues: [40], scoring: { kind: "run", length: 5, score: 40 }, dice: [[1, 2, 3, 4, 5]] },
    { id: ECategory.FullHouse, label: "Full House", section: ESection.Lower, validValues: FULL_HOUSE_VALUES, scoring: { kind: "fullHouse" }, dice: [[5, 5, 5], [6, 6]] },
    { id: ECategory.Chance, label: "Chance", section: ESection.Lower, validValues: range(5, 30), scoring: { kind: "chance" }, dice: [["?", "?", "?", "?", "?"]] },
    { id: ECategory.Yatzy, label: "Yatzy", section: ESection.Lower, validValues: [50], scoring: { kind: "yatzy", score: 50 } },
  ],
};
