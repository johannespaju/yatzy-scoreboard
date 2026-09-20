import { getRuleSet } from "@/rules/ruleSets";
import { scoreDice } from "@/rules/scoreDice";
import { calculateTotals, type ITotals } from "@/rules/totals";
import type { ECategory, IRuleSet, TScoreSheet } from "@/rules/types";
import { MAX_ROLLS } from "./dice";
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

export function hasRolled(state: IGameState): boolean {
  return state.dice !== undefined && state.dice.rollsUsed > 0;
}

export function getRollsLeft(state: IGameState): number {
  return state.dice ? MAX_ROLLS - state.dice.rollsUsed : 0;
}

export function canRoll(state: IGameState): boolean {
  const { dice } = state;
  if (!dice || dice.rollsUsed >= MAX_ROLLS || isGameOver(state)) return false;
  // Holding every die and rolling again would change nothing.
  return dice.rollsUsed === 0 || dice.locked.some((held) => !held);
}

export function canLock(state: IGameState): boolean {
  const { dice } = state;
  return dice !== undefined && dice.rollsUsed > 0 && dice.rollsUsed < MAX_ROLLS;
}

/** What the current player would score in each still-empty category, or undefined before rolling. */
export function getPreviewScores(state: IGameState): TScoreSheet | undefined {
  const player = getCurrentPlayer(state);
  if (!state.dice || !hasRolled(state) || !player) return undefined;
  const previews: TScoreSheet = {};
  for (const category of getRuleSet(state.ruleSetId).categories) {
    if (player.sheet[category.id] === undefined) previews[category.id] = scoreDice(category, state.dice.values);
  }
  return previews;
}

/** True when tapping this cell should enter the dice score (same guard as SCORE_DICE). */
export function canScoreDice(state: IGameState, playerId: string, categoryId: ECategory): boolean {
  const player = getCurrentPlayer(state);
  return hasRolled(state) && player?.id === playerId && player.sheet[categoryId] === undefined;
}
