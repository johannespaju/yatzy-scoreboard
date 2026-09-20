import { describe, expect, it } from "vitest";
import { ECategory } from "@/rules/types";
import { loadGameState, parseGameState, saveGameState, STORAGE_KEY } from "../storage";
import type { IGameState } from "../types";

const game: IGameState = {
  ruleSetId: "scandinavian",
  players: [
    { id: "player-1", name: "Anna", sheet: { [ECategory.Ones]: 3 } },
    { id: "player-2", name: "Bo", sheet: {} },
  ],
};

function fakeStorage(items: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(items));
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
  };
}

describe("parseGameState", () => {
  it("round-trips a game through JSON", () => {
    expect(parseGameState(JSON.stringify(game))).toEqual(game);
  });

  it("round-trips a Best Yatzy game", () => {
    const best: IGameState = { ...game, ruleSetId: "best" };
    expect(parseGameState(JSON.stringify(best))).toEqual(best);
  });

  it("round-trips a dice game", () => {
    const dice: IGameState = { ...game, dice: { values: [1, 3, 3, 6, 2], locked: [false, true, true, false, false], rollsUsed: 2 } };
    expect(parseGameState(JSON.stringify(dice))).toEqual(dice);
  });

  it("loads games saved before dice mode existed as paper games", () => {
    const loaded = parseGameState(JSON.stringify(game));
    expect(loaded && "dice" in loaded).toBe(false);
  });

  it("rejects broken dice", () => {
    const withDice = (dice: unknown) => parseGameState(JSON.stringify({ ...game, dice }));
    expect(withDice({ values: [1, 2, 3, 4], locked: [false, false, false, false, false], rollsUsed: 1 })).toBeUndefined();
    expect(withDice({ values: [1, 2, 3, 4, 7], locked: [false, false, false, false, false], rollsUsed: 1 })).toBeUndefined();
    expect(withDice({ values: [1, 2, 3, 4, 5], locked: ["no", false, false, false, false], rollsUsed: 1 })).toBeUndefined();
    expect(withDice({ values: [1, 2, 3, 4, 5], locked: [false, false, false, false, false], rollsUsed: 4 })).toBeUndefined();
    expect(withDice(null)).toBeUndefined();
  });

  it("returns undefined for missing or broken JSON", () => {
    expect(parseGameState(null)).toBeUndefined();
    expect(parseGameState("")).toBeUndefined();
    expect(parseGameState("{not json")).toBeUndefined();
  });

  it("rejects data with the wrong shape", () => {
    expect(parseGameState(JSON.stringify({ ruleSetId: "unknown", players: [] }))).toBeUndefined();
    expect(parseGameState(JSON.stringify({ ruleSetId: "scandinavian" }))).toBeUndefined();
    expect(parseGameState(JSON.stringify({ ruleSetId: "scandinavian", players: [{ name: "Anna" }] }))).toBeUndefined();
    expect(
      parseGameState(JSON.stringify({ ruleSetId: "scandinavian", players: [{ id: "p", name: "A", sheet: { ones: "3" } }] })),
    ).toBeUndefined();
  });
});

describe("loadGameState / saveGameState", () => {
  it("saves under the storage key and loads it back", () => {
    const storage = fakeStorage();
    saveGameState(storage, game);
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(game));
    expect(loadGameState(storage)).toEqual(game);
  });

  it("returns undefined when nothing is saved", () => {
    expect(loadGameState(fakeStorage())).toBeUndefined();
  });

  it("does not throw when storage is unavailable", () => {
    const broken = fakeStorage();
    broken.getItem = () => {
      throw new Error("blocked");
    };
    broken.setItem = () => {
      throw new Error("quota");
    };
    expect(loadGameState(broken)).toBeUndefined();
    expect(() => saveGameState(broken, game)).not.toThrow();
  });
});
