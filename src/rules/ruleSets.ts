import { AMERICAN_YATZY } from "./american";
import { SCANDINAVIAN_YATZY } from "./scandinavian";
import type { ECategory, IRuleSet } from "./types";

export const RULE_SETS = {
  scandinavian: SCANDINAVIAN_YATZY,
  american: AMERICAN_YATZY,
} as const;

export type TRuleSetId = keyof typeof RULE_SETS;

export const DEFAULT_RULE_SET_ID: TRuleSetId = "scandinavian";

export function getRuleSet(id: TRuleSetId): IRuleSet {
  return RULE_SETS[id];
}

export function isValidScore(ruleSet: IRuleSet, categoryId: ECategory, value: number): boolean {
  if (value === 0) return true;
  const category = ruleSet.categories.find((c) => c.id === categoryId);
  return category?.validValues.includes(value) ?? false;
}
