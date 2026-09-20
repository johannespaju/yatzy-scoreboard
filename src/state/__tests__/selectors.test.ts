import { describe, expect, it } from "vitest";
import { SCANDINAVIAN_YATZY } from "@/rules/scandinavian";
import { ECategory, type TScoreSheet } from "@/rules/types";
import { getCurrentPlayer, getPlayerTotals, getStandings, isGameOver } from "../selectors";
import type { IGameState } from "../types";

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
