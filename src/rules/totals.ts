import { ESection, type IRuleSet, type TScoreSheet } from "./types";

export interface ITotals {
  upperSum: number;
  bonus: number;
  lowerSum: number;
  total: number;
}

export function calculateTotals(ruleSet: IRuleSet, sheet: TScoreSheet): ITotals {
  let upperSum = 0;
  let lowerSum = 0;
  for (const category of ruleSet.categories) {
    const score = sheet[category.id] ?? 0;
    if (category.section === ESection.Upper) upperSum += score;
    else lowerSum += score;
  }
  const bonus = upperSum >= ruleSet.bonus.threshold ? ruleSet.bonus.amount : 0;
  return { upperSum, bonus, lowerSum, total: upperSum + bonus + lowerSum };
}

export function getMaxTotal(ruleSet: IRuleSet): number {
  const maxSheet: TScoreSheet = {};
  for (const category of ruleSet.categories) {
    maxSheet[category.id] = category.validValues[category.validValues.length - 1];
  }
  return calculateTotals(ruleSet, maxSheet).total;
}
