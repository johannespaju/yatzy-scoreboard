import { describe, expect, it } from "vitest";
import { ECategory } from "@/rules/types";
import { createDiceState } from "../dice";
import { createInitialState, gameReducer, type TGameAction } from "../gameReducer";
import type { IGameState } from "../types";

function newGame(...playerNames: string[]): IGameState {
  return gameReducer(createInitialState(), { type: "NEW_GAME", ruleSetId: "scandinavian", playerNames });
}

function newDiceGame(...playerNames: string[]): IGameState {
  return gameReducer(createInitialState(), { type: "NEW_GAME", ruleSetId: "scandinavian", playerNames, diceMode: true });
}

function play(state: IGameState, ...actions: TGameAction[]): IGameState {
  return actions.reduce(gameReducer, state);
}

const ROLL: TGameAction = { type: "ROLL_DICE", values: [3, 3, 5, 1, 6] };

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

  it("stores the chosen rule set", () => {
    const state = gameReducer(createInitialState(), { type: "NEW_GAME", ruleSetId: "best", playerNames: ["Anna"] });
    expect(state.ruleSetId).toBe("best");
  });

  it("starts with fresh dice when dice mode is on, and no dice otherwise", () => {
    expect(newDiceGame("Anna").dice).toEqual(createDiceState());
    expect("dice" in newGame("Anna")).toBe(false);
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

  it("validates against the game's rule set", () => {
    const state = gameReducer(createInitialState(), { type: "NEW_GAME", ruleSetId: "best", playerNames: ["Anna"] });
    const set = (value: number) =>
      gameReducer(state, { type: "SET_SCORE", playerId: "player-1", categoryId: ECategory.SmallStraight, value });
    expect(set(30).players[0].sheet).toEqual({ [ECategory.SmallStraight]: 30 });
    expect(set(15)).toBe(state);
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

describe("ROLL_DICE", () => {
  it("stores the rolled values and counts the roll", () => {
    const state = gameReducer(newDiceGame("Anna"), ROLL);
    expect(state.dice).toEqual({ values: [3, 3, 5, 1, 6], locked: [false, false, false, false, false], rollsUsed: 1 });
  });

  it("keeps held dice and re-rolls the rest", () => {
    const state = play(
      newDiceGame("Anna"),
      ROLL,
      { type: "TOGGLE_LOCK", index: 0 },
      { type: "TOGGLE_LOCK", index: 4 },
      { type: "ROLL_DICE", values: [2, 2, 2, 2, 2] },
    );
    expect(state.dice?.values).toEqual([3, 2, 2, 2, 6]);
    expect(state.dice?.rollsUsed).toBe(2);
  });

  it("allows at most three rolls per turn", () => {
    const state = play(newDiceGame("Anna"), ROLL, ROLL, ROLL);
    expect(state.dice?.rollsUsed).toBe(3);
    expect(gameReducer(state, { type: "ROLL_DICE", values: [1, 1, 1, 1, 1] })).toBe(state);
  });

  it("is ignored without dice mode or with the wrong number of dice", () => {
    const paper = newGame("Anna");
    expect(gameReducer(paper, ROLL)).toBe(paper);
    const dice = newDiceGame("Anna");
    expect(gameReducer(dice, { type: "ROLL_DICE", values: [1, 2, 3] })).toBe(dice);
  });
});

describe("TOGGLE_LOCK", () => {
  it("holds and releases a die between rolls", () => {
    let state = play(newDiceGame("Anna"), ROLL, { type: "TOGGLE_LOCK", index: 2 });
    expect(state.dice?.locked).toEqual([false, false, true, false, false]);
    state = gameReducer(state, { type: "TOGGLE_LOCK", index: 2 });
    expect(state.dice?.locked).toEqual([false, false, false, false, false]);
  });

  it("is ignored before the first roll, after the last roll, and for bad indexes", () => {
    const fresh = newDiceGame("Anna");
    expect(gameReducer(fresh, { type: "TOGGLE_LOCK", index: 0 })).toBe(fresh);
    const spent = play(fresh, ROLL, ROLL, ROLL);
    expect(gameReducer(spent, { type: "TOGGLE_LOCK", index: 0 })).toBe(spent);
    const rolled = gameReducer(fresh, ROLL);
    expect(gameReducer(rolled, { type: "TOGGLE_LOCK", index: 5 })).toBe(rolled);
  });
});

describe("SCORE_DICE", () => {
  it("scores the dice for the current player and starts a new turn", () => {
    const state = play(newDiceGame("Anna", "Bo"), ROLL, { type: "SCORE_DICE", categoryId: ECategory.Threes });
    expect(state.players[0].sheet).toEqual({ [ECategory.Threes]: 6 });
    expect(state.players[1].sheet).toEqual({});
    expect(state.dice).toEqual(createDiceState());
  });

  it("then lets the next player roll", () => {
    const state = play(
      newDiceGame("Anna", "Bo"),
      ROLL,
      { type: "SCORE_DICE", categoryId: ECategory.Chance },
      ROLL,
      { type: "SCORE_DICE", categoryId: ECategory.OnePair },
    );
    expect(state.players[1].sheet).toEqual({ [ECategory.OnePair]: 6 });
  });

  it("writes 0 when the dice do not qualify", () => {
    const state = play(newDiceGame("Anna"), ROLL, { type: "SCORE_DICE", categoryId: ECategory.Yatzy });
    expect(state.players[0].sheet).toEqual({ [ECategory.Yatzy]: 0 });
  });

  it("is ignored before rolling and for a category that is already filled", () => {
    const fresh = newDiceGame("Anna");
    expect(gameReducer(fresh, { type: "SCORE_DICE", categoryId: ECategory.Ones })).toBe(fresh);
    const filled = play(fresh, ROLL, { type: "SCORE_DICE", categoryId: ECategory.Ones }, ROLL);
    expect(gameReducer(filled, { type: "SCORE_DICE", categoryId: ECategory.Ones })).toBe(filled);
  });
});

describe("UNDO_DICE_SCORE", () => {
  it("clears the score and restores the dice", () => {
    const rolled = gameReducer(newDiceGame("Anna", "Bo"), ROLL);
    const scored = gameReducer(rolled, { type: "SCORE_DICE", categoryId: ECategory.Sixes });
    const undone = gameReducer(scored, {
      type: "UNDO_DICE_SCORE",
      playerId: "player-1",
      categoryId: ECategory.Sixes,
      dice: rolled.dice!,
    });
    expect(undone).toEqual(rolled);
  });
});

describe("dice mode: RESET and END_GAME", () => {
  it("RESET starts a fresh turn and keeps dice mode", () => {
    const state = play(newDiceGame("Anna"), ROLL, { type: "RESET" });
    expect(state.dice).toEqual(createDiceState());
  });

  it("RESET does not add dice to a paper game", () => {
    expect("dice" in gameReducer(newGame("Anna"), { type: "RESET" })).toBe(false);
  });

  it("END_GAME drops the dice", () => {
    expect(gameReducer(newDiceGame("Anna"), { type: "END_GAME" })).toEqual({ ruleSetId: "scandinavian", players: [] });
  });
});
