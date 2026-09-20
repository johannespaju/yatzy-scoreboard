import { describe, expect, it } from "vitest";
import { ECategory } from "@/rules/types";
import { createInitialState, gameReducer } from "../gameReducer";
import type { IGameState } from "../types";

function newGame(...playerNames: string[]): IGameState {
  return gameReducer(createInitialState(), { type: "NEW_GAME", ruleSetId: "scandinavian", playerNames });
}

describe("NEW_GAME", () => {
  it("creates players with ids and empty sheets", () => {
    expect(newGame("Anna", "Bo")).toEqual({
      ruleSetId: "scandinavian",
      players: [
        { id: "player-1", name: "Anna", sheet: {} },
        { id: "player-2", name: "Bo", sheet: {} },
      ],
    });
  });

  it("trims names and drops empty ones", () => {
    expect(newGame("  Anna ", "", "   ").players).toEqual([{ id: "player-1", name: "Anna", sheet: {} }]);
  });

  it("leaves state unchanged when no names are given", () => {
    const state = newGame("Anna");
    expect(gameReducer(state, { type: "NEW_GAME", ruleSetId: "scandinavian", playerNames: [""] })).toBe(state);
  });
});

describe("SET_SCORE", () => {
  it("stores a valid score", () => {
    const state = gameReducer(newGame("Anna"), {
      type: "SET_SCORE",
      playerId: "player-1",
      categoryId: ECategory.Fours,
      value: 12,
    });
    expect(state.players[0].sheet).toEqual({ [ECategory.Fours]: 12 });
  });

  it("allows scratching with 0 in any category", () => {
    const state = gameReducer(newGame("Anna"), {
      type: "SET_SCORE",
      playerId: "player-1",
      categoryId: ECategory.Yatzy,
      value: 0,
    });
    expect(state.players[0].sheet).toEqual({ [ECategory.Yatzy]: 0 });
  });

  it.each([
    [ECategory.Ones, 6],
    [ECategory.Yatzy, 49],
    [ECategory.OnePair, 7],
    [ECategory.SmallStraight, 14],
  ])("rejects invalid %s = %i and returns the same state", (categoryId, value) => {
    const state = newGame("Anna");
    expect(gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId, value })).toBe(state);
  });

  it("ignores unknown players", () => {
    const state = newGame("Anna");
    expect(
      gameReducer(state, { type: "SET_SCORE", playerId: "player-9", categoryId: ECategory.Ones, value: 1 }),
    ).toBe(state);
  });

  it("overwrites an existing score", () => {
    let state = newGame("Anna");
    state = gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId: ECategory.Ones, value: 1 });
    state = gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId: ECategory.Ones, value: 3 });
    expect(state.players[0].sheet).toEqual({ [ECategory.Ones]: 3 });
  });

  it("does not mutate the previous state", () => {
    const before = newGame("Anna", "Bo");
    const snapshot = structuredClone(before);
    const after = gameReducer(before, {
      type: "SET_SCORE",
      playerId: "player-2",
      categoryId: ECategory.Chance,
      value: 20,
    });
    expect(before).toEqual(snapshot);
    expect(after.players[0]).toBe(before.players[0]);
    expect(after.players[1]).not.toBe(before.players[1]);
  });
});

describe("CLEAR_SCORE", () => {
  it("removes a score", () => {
    let state = newGame("Anna");
    state = gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId: ECategory.Ones, value: 1 });
    state = gameReducer(state, { type: "CLEAR_SCORE", playerId: "player-1", categoryId: ECategory.Ones });
    expect(state.players[0].sheet).toEqual({});
  });
});

describe("RESET", () => {
  it("keeps players but empties their sheets", () => {
    let state = newGame("Anna", "Bo");
    state = gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId: ECategory.Ones, value: 1 });
    state = gameReducer(state, { type: "RESET" });
    expect(state.players.map((p) => p.name)).toEqual(["Anna", "Bo"]);
    expect(state.players.every((p) => Object.keys(p.sheet).length === 0)).toBe(true);
  });
});

describe("END_GAME", () => {
  it("removes all players but keeps the rule set", () => {
    const state = gameReducer(newGame("Anna", "Bo"), { type: "END_GAME" });
    expect(state).toEqual({ ruleSetId: "scandinavian", players: [] });
  });
});
