import { getRuleSet } from "@/rules/ruleSets";
import { calculateTotals, type ITotals } from "@/rules/totals";
import type { IRuleSet, TScoreSheet } from "@/rules/types";
import type { IGameState, IPlayer } from "./types";

export function getFilledCount(sheet: TScoreSheet, ruleSet: IRuleSet): number {
  return ruleSet.categories.filter((c) => sheet[c.id] !== undefined).length;
}

export function isGameOver(state: IGameState): boolean {
  const ruleSet = getRuleSet(state.ruleSetId);
  return (
    state.players.length > 0 &&
    state.players.every((p) => getFilledCount(p.sheet, ruleSet) === ruleSet.categories.length)
  );
}

export function getCurrentPlayer(state: IGameState): IPlayer | undefined {
  if (isGameOver(state)) return undefined;
  const ruleSet = getRuleSet(state.ruleSetId);
  let current: IPlayer | undefined;
  let fewest = Infinity;
  for (const player of state.players) {
    const filled = getFilledCount(player.sheet, ruleSet);
    if (filled < fewest) {
      fewest = filled;
      current = player;
    }
  }
  return current;
}

export function getPlayerTotals(state: IGameState, player: IPlayer): ITotals {
  return calculateTotals(getRuleSet(state.ruleSetId), player.sheet);
}

export function getStandings(state: IGameState): IPlayer[] {
  const ranked = state.players.map((player) => ({
    player,
    total: getPlayerTotals(state, player).total,
  }));
  ranked.sort((a, b) => b.total - a.total);
  return ranked.map((entry) => entry.player);
}
