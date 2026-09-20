"use client";

import { useEffect, useReducer } from "react";
import { createInitialState, gameReducer, type TGameAction } from "./gameReducer";
import { loadGameState, saveGameState } from "./storage";
import type { IGameState } from "./types";

export interface IUseGame {
  state: IGameState;
  dispatch: (action: TGameAction) => void;
  // False until the saved game has been read from localStorage. The UI should
  // wait for this before deciding which screen to show, or it flashes the
  // "new game" screen on every reload.
  hydrated: boolean;
}

// The hook wraps the pure game reducer with one extra flag. Hydration is part
// of this reducer's state (rather than a separate useState) so the effect only
// needs to dispatch, which keeps the game state and the flag in sync.
interface IStoredGame {
  game: IGameState;
  hydrated: boolean;
}

type TStoredGameAction = TGameAction | { type: "HYDRATE"; game: IGameState | undefined };

function storedGameReducer(state: IStoredGame, action: TStoredGameAction): IStoredGame {
  if (action.type === "HYDRATE") {
    return { game: action.game ?? state.game, hydrated: true };
  }
  return { ...state, game: gameReducer(state.game, action) };
}

export function useGame(): IUseGame {
  const [{ game, hydrated }, dispatch] = useReducer(storedGameReducer, undefined, () => ({
    game: createInitialState(),
    hydrated: false,
  }));

  // The server render and first client render must match, so the saved game is
  // loaded after mount instead of in the initial state.
  useEffect(() => {
    dispatch({ type: "HYDRATE", game: loadGameState(window.localStorage) });
  }, []);

  // Only save once hydrated: otherwise the empty initial state would overwrite
  // the saved game before it has been read.
  useEffect(() => {
    if (hydrated) saveGameState(window.localStorage, game);
  }, [game, hydrated]);

  return { state: game, dispatch, hydrated };
}
