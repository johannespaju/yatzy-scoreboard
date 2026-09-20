export enum ECategory {
  Ones = "ones",
  Twos = "twos",
  Threes = "threes",
  Fours = "fours",
  Fives = "fives",
  Sixes = "sixes",
  OnePair = "onePair",
  TwoPairs = "twoPairs",
  ThreeOfAKind = "threeOfAKind",
  FourOfAKind = "fourOfAKind",
  SmallStraight = "smallStraight",
  LargeStraight = "largeStraight",
  FullHouse = "fullHouse",
  Chance = "chance",
  Yatzy = "yatzy",
}

export enum ESection {
  Upper = "upper",
  Lower = "lower",
}

/** A rolled die value. */
export type TDieValue = 1 | 2 | 3 | 4 | 5 | 6;

/** A die face, or "?" for "any die" (used by Chance). */
export type TDieFace = TDieValue | "?";

/** How a category is scored from five dice. Interpreted by `scoreDice`. */
export type TScoring =
  | { kind: "face"; face: TDieValue }
  | { kind: "ofAKind"; count: 2 | 3 | 4 }
  | { kind: "twoPairs" }
  | { kind: "fullHouse" }
  /** Exactly these faces, e.g. Scandinavian 1-2-3-4-5. */
  | { kind: "straight"; faces: readonly TDieValue[]; score: number }
  /** Any `length` consecutive faces, e.g. American four in a row. */
  | { kind: "run"; length: 4 | 5; score: number }
  | { kind: "yatzy"; score: number }
  | { kind: "chance" };

export interface ICategory {
  id: ECategory;
  label: string;
  section: ESection;
  validValues: readonly number[];
  scoring: TScoring;
  /** Shown instead of the label; groups are drawn with a gap between them, e.g. Two Pairs: [[6, 6], [5, 5]]. */
  dice?: readonly (readonly TDieFace[])[];
}

export interface IBonusRule {
  threshold: number;
  amount: number;
}

export interface IRuleSet {
  id: string;
  name: string;
  categories: readonly ICategory[];
  bonus: IBonusRule;
}

export type TScoreSheet = Partial<Record<ECategory, number>>;
