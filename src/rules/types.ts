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

export interface ICategory {
  id: ECategory;
  label: string;
  section: ESection;
  validValues: readonly number[];
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
