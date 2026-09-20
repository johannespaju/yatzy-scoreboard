import { RULE_SETS } from "@/rules/ruleSets";
import type { IGameState } from "./types";

export const STORAGE_KEY = "yatzy-scoreboard.game";

export function parseGameState(json: string | null): IGameState | undefined {
  if (!json) return undefined;
  try {
    const data: unknown = JSON.parse(json);
    if (!isGameState(data)) return undefined;
    return data;
  } catch {
    return undefined;
  }
}

function isGameState(data: unknown): data is IGameState {
  if (typeof data !== "object" || data === null) return false;
  const { ruleSetId, players } = data as Record<string, unknown>;
  return typeof ruleSetId === "string" && ruleSetId in RULE_SETS && Array.isArray(players) && players.every(isPlayer);
}

function isPlayer(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const { id, name, sheet } = data as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof name === "string" &&
    typeof sheet === "object" &&
    sheet !== null &&
    Object.values(sheet).every((v) => typeof v === "number")
  );
}

export function loadGameState(storage: Storage): IGameState | undefined {
  try {
    return parseGameState(storage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function saveGameState(storage: Storage, state: IGameState): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
