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

export type TDieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type TDieFace = TDieValue | "?";

export type TScoring =
  | { kind: "face"; face: TDieValue }
  | { kind: "ofAKind"; count: 2 | 3 | 4 }
  | { kind: "twoPairs" }
  | { kind: "fullHouse" }
  | { kind: "straight"; faces: readonly TDieValue[]; score: number }
  | { kind: "run"; length: 4 | 5; score: number }
  | { kind: "yatzy"; score: number }
  | { kind: "chance" };

export interface ICategory {
  id: ECategory;
  label: string;
  section: ESection;
  validValues: readonly number[];
  scoring: TScoring;
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
