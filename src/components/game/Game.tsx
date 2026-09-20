"use client";

import { getRuleSet } from "@/rules/ruleSets";
import { useGame } from "@/state/useGame";
import { NewGame } from "@/components/new-game/NewGame";

export function Game() {
  const { state, dispatch, hydrated } = useGame();

  // Nothing is rendered until the saved game has been read, see useGame.
  if (!hydrated) return null;

  if (state.players.length === 0) {
    return (
      <NewGame onStart={(playerNames) => dispatch({ type: "NEW_GAME", ruleSetId: "scandinavian", playerNames })} />
    );
  }

  // Placeholder until the Scoreboard component exists.
  return (
    <main className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-bold">{getRuleSet(state.ruleSetId).name}</h1>
      <ul>
        {state.players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <button type="button" onClick={() => dispatch({ type: "END_GAME" })} className="underline self-start">
        New game
      </button>
    </main>
  );
}
