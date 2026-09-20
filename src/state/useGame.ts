"use client";

import { useEffect, useReducer } from "react";
import { createInitialState, gameReducer, type TGameAction } from "./gameReducer";
import { loadGameState, saveGameState } from "./storage";
import type { IGameState } from "./types";

export interface IUseGame {
  state: IGameState;
  dispatch: (action: TGameAction) => void;
  hydrated: boolean;
}

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

  useEffect(() => {
    dispatch({ type: "HYDRATE", game: loadGameState(window.localStorage) });
  }, []);

  useEffect(() => {
    if (hydrated) saveGameState(window.localStorage, game);
  }, [game, hydrated]);

  return { state: game, dispatch, hydrated };
}
