import { RULE_SETS } from "@/rules/ruleSets";
import { DICE_COUNT, isDieValue, MAX_ROLLS } from "./dice";
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
  const { ruleSetId, players, dice } = data as Record<string, unknown>;
  return (
    typeof ruleSetId === "string" &&
    ruleSetId in RULE_SETS &&
    Array.isArray(players) &&
    players.every(isPlayer) &&
    (dice === undefined || isDiceState(dice))
  );
}

function isDiceState(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const { values, locked, rollsUsed } = data as Record<string, unknown>;
  return (
    Array.isArray(values) &&
    values.length === DICE_COUNT &&
    values.every(isDieValue) &&
    Array.isArray(locked) &&
    locked.length === DICE_COUNT &&
    locked.every((v) => typeof v === "boolean") &&
    typeof rollsUsed === "number" &&
    Number.isInteger(rollsUsed) &&
    rollsUsed >= 0 &&
    rollsUsed <= MAX_ROLLS
  );
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
