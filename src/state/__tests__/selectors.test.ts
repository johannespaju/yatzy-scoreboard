import { describe, expect, it } from "vitest";
import { SCANDINAVIAN_YATZY } from "@/rules/scandinavian";
import { ECategory, type TScoreSheet } from "@/rules/types";
import {
  canLock,
  canRoll,
  canScoreDice,
  getCurrentPlayer,
  getPlayerTotals,
  getPreviewScores,
  getRollsLeft,
  getStandings,
  hasRolled,
  isGameOver,
} from "../selectors";
import type { IDiceState, IGameState } from "../types";

function game(...sheets: TScoreSheet[]): IGameState {
  return {
    ruleSetId: "scandinavian",
    players: sheets.map((sheet, i) => ({ id: `player-${i + 1}`, name: `P${i + 1}`, sheet })),
  };
}

const fullSheet: TScoreSheet = Object.fromEntries(
  SCANDINAVIAN_YATZY.categories.map((c) => [c.id, c.validValues[c.validValues.length - 1]]),
);

describe("getCurrentPlayer", () => {
  it("starts with the first player", () => {
    expect(getCurrentPlayer(game({}, {}))?.id).toBe("player-1");
  });

  it("rotates through players and back to the first", () => {
    expect(getCurrentPlayer(game({ [ECategory.Ones]: 1 }, {}))?.id).toBe("player-2");
    expect(getCurrentPlayer(game({ [ECategory.Ones]: 1 }, { [ECategory.Ones]: 0 }))?.id).toBe("player-1");
  });

  it("counts a scratched 0 as filled", () => {
    expect(getCurrentPlayer(game({ [ECategory.Yatzy]: 0 }, {}))?.id).toBe("player-2");
  });

  it("is undefined with no players or when the game is over", () => {
    expect(getCurrentPlayer(game())).toBeUndefined();
    expect(getCurrentPlayer(game(fullSheet))).toBeUndefined();
  });
});

describe("isGameOver", () => {
  it("is false for an empty game and while any sheet is unfinished", () => {
    expect(isGameOver(game())).toBe(false);
    expect(isGameOver(game(fullSheet, {}))).toBe(false);
  });

  it("is true when every player has filled every category", () => {
    expect(isGameOver(game(fullSheet, fullSheet))).toBe(true);
  });
});

describe("getPlayerTotals", () => {
  it("reaches the max total of 374", () => {
    const state = game(fullSheet);
    expect(getPlayerTotals(state, state.players[0])).toEqual({ upperSum: 105, bonus: 50, lowerSum: 219, total: 374 });
  });
});

describe("getStandings", () => {
  it("sorts players by total, highest first, without changing state order", () => {
    const state = game({ [ECategory.Ones]: 1 }, fullSheet, { [ECategory.Chance]: 20 });
    expect(getStandings(state).map((p) => p.id)).toEqual(["player-2", "player-3", "player-1"]);
    expect(state.players.map((p) => p.id)).toEqual(["player-1", "player-2", "player-3"]);
  });
});

describe("dice selectors", () => {
  const dice = (rollsUsed: number, locked = [false, false, false, false, false]): IDiceState => ({
    values: [2, 2, 5, 5, 5],
    locked,
    rollsUsed,
  });
  const diceGame = (d: IDiceState, ...sheets: TScoreSheet[]): IGameState => ({ ...game(...sheets), dice: d });

  it("reports nothing rolled and no rolls left in a paper game", () => {
    const paper = game({}, {});
    expect(hasRolled(paper)).toBe(false);
    expect(getRollsLeft(paper)).toBe(0);
    expect(canRoll(paper)).toBe(false);
    expect(canLock(paper)).toBe(false);
    expect(getPreviewScores(paper)).toBeUndefined();
    expect(canScoreDice(paper, "player-1", ECategory.Ones)).toBe(false);
  });

  it("counts rolls", () => {
    expect(getRollsLeft(diceGame(dice(0), {}))).toBe(3);
    expect(getRollsLeft(diceGame(dice(2), {}))).toBe(1);
    expect(hasRolled(diceGame(dice(0), {}))).toBe(false);
    expect(hasRolled(diceGame(dice(1), {}))).toBe(true);
  });

  it("allows rolling until the third roll, unless every die is held or the game is over", () => {
    expect(canRoll(diceGame(dice(0), {}))).toBe(true);
    expect(canRoll(diceGame(dice(2), {}))).toBe(true);
    expect(canRoll(diceGame(dice(3), {}))).toBe(false);
    expect(canRoll(diceGame(dice(1, [true, true, true, true, true]), {}))).toBe(false);
    expect(canRoll(diceGame(dice(0), fullSheet))).toBe(false);
  });

  it("allows holding only between the first and last roll", () => {
    expect(canLock(diceGame(dice(0), {}))).toBe(false);
    expect(canLock(diceGame(dice(1), {}))).toBe(true);
    expect(canLock(diceGame(dice(2), {}))).toBe(true);
    expect(canLock(diceGame(dice(3), {}))).toBe(false);
  });

  it("previews scores for the current player's empty categories only", () => {
    // Both have one score, so player 1 is current again.
    const state = diceGame(dice(1), { [ECategory.Ones]: 1 }, { [ECategory.Ones]: 0 });
    const previews = getPreviewScores(state)!;
    expect(previews[ECategory.FullHouse]).toBe(19);
    expect(previews[ECategory.Twos]).toBe(4);
    expect(previews[ECategory.Yatzy]).toBe(0);
    expect(previews[ECategory.Ones]).toBe(undefined);
    expect(Object.keys(previews)).toHaveLength(SCANDINAVIAN_YATZY.categories.length - 1);
  });

  it("has no previews before rolling", () => {
    expect(getPreviewScores(diceGame(dice(0), {}))).toBeUndefined();
  });

  it("lets only the current player score an empty cell after rolling", () => {
    const state = diceGame(dice(1), { [ECategory.Ones]: 1 }, {});
    expect(canScoreDice(state, "player-2", ECategory.Chance)).toBe(true);
    expect(canScoreDice(state, "player-1", ECategory.Chance)).toBe(false);
    expect(canScoreDice(diceGame(dice(0), {}), "player-1", ECategory.Chance)).toBe(false);
    expect(canScoreDice(diceGame(dice(1), { [ECategory.Chance]: 20 }), "player-1", ECategory.Chance)).toBe(false);
  });
});
