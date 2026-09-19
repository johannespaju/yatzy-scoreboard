import { type ECategory, getRuleSet, isValidScore, type TRuleSetId } from "@/rules";
import type { IGameState, IPlayer } from "./types";

export type TGameAction =
  | { type: "NEW_GAME"; ruleSetId: TRuleSetId; playerNames: string[] }
  | { type: "SET_SCORE"; playerId: string; categoryId: ECategory; value: number }
  | { type: "CLEAR_SCORE"; playerId: string; categoryId: ECategory }
  | { type: "RESET" };

export function createInitialState(): IGameState {
  return { ruleSetId: "scandinavian", players: [] };
}

function updatePlayer(state: IGameState, playerId: string, update: (player: IPlayer) => IPlayer): IGameState {
  if (!state.players.some((p) => p.id === playerId)) return state;
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? update(p) : p)),
  };
}

export function gameReducer(state: IGameState, action: TGameAction): IGameState {
  switch (action.type) {
    case "NEW_GAME": {
      const names = action.playerNames.map((n) => n.trim()).filter((n) => n.length > 0);
      if (names.length === 0) return state;
      return {
        ruleSetId: action.ruleSetId,
        players: names.map((name, i) => ({ id: `player-${i + 1}`, name, sheet: {} })),
      };
    }

    case "SET_SCORE": {
      if (!isValidScore(getRuleSet(state.ruleSetId), action.categoryId, action.value)) return state;
      return updatePlayer(state, action.playerId, (p) => ({
        ...p,
        sheet: { ...p.sheet, [action.categoryId]: action.value },
      }));
    }

    case "CLEAR_SCORE":
      return updatePlayer(state, action.playerId, (p) => {
        const sheet = { ...p.sheet };
        delete sheet[action.categoryId];
        return { ...p, sheet };
      });

    case "RESET":
      return { ...state, players: state.players.map((p) => ({ ...p, sheet: {} })) };
  }
}
