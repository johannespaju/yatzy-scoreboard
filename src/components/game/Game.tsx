"use client";

import { useState } from "react";
import { getRuleSet } from "@/rules/ruleSets";
import { isGameOver } from "@/state/selectors";
import type { ISelectedCell } from "@/state/types";
import { useGame } from "@/state/useGame";
import { NewGame } from "@/components/new-game/NewGame";
import { Scoreboard } from "./Scoreboard";
import { ScoreInput } from "./ScoreInput";
import { GameOver } from "./GameOver";

export function Game() {
  const { state, dispatch, hydrated } = useGame();
  const [selected, setSelected] = useState<ISelectedCell | null>(null);
  const [lastSaved, setLastSaved] = useState<ISelectedCell | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!hydrated) return null;

  if (state.players.length === 0) {
    return <NewGame onStart={(ruleSetId, playerNames) => dispatch({ type: "NEW_GAME", ruleSetId, playerNames })} />;
  }

  const ruleSet = getRuleSet(state.ruleSetId);
  const selectedPlayer = selected && state.players.find((p) => p.id === selected.playerId);
  const selectedCategory = selected && ruleSet.categories.find((c) => c.id === selected.categoryId);

  function endGame() {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }
    setConfirmEnd(false);
    setLastSaved(null);
    dispatch({ type: "END_GAME" });
  }

  return (
    <main className="flex w-full max-w-lg mx-auto flex-col gap-5 px-4 py-5 motion-safe:animate-fade-in">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold leading-none tracking-tight">Yatzy Scoreboard</h1>
          <h2 className="mt-2 text-xs font-bold uppercase tracking-widest text-ink-muted">{ruleSet.name}</h2>
        </div>
        {!isGameOver(state) && (
          <button
            type="button"
            onClick={endGame}
            onBlur={() => setConfirmEnd(false)}
            className={`shrink-0 rounded-full border-2 border-ink px-3 py-1 text-sm font-medium transition-colors duration-200 ${
              confirmEnd ? "bg-ink text-tile" : ""
            }`}
          >
            {confirmEnd ? "End game?" : "New game"}
          </button>
        )}
      </header>

      <Scoreboard
        state={state}
        lastSaved={lastSaved}
        onPopEnd={() => setLastSaved(null)}
        onSelectCell={(playerId, categoryId) => setSelected({ playerId, categoryId })}
      />

      {isGameOver(state) && (
        <GameOver
          state={state}
          onPlayAgain={() => {
            setLastSaved(null);
            dispatch({ type: "RESET" });
          }}
          onNewGame={() => {
            setLastSaved(null);
            dispatch({ type: "END_GAME" });
          }}
        />
      )}

      {selectedPlayer && selectedCategory && (
        <ScoreInput
          key={`${selectedPlayer.id}-${selectedCategory.id}`}
          player={selectedPlayer}
          category={selectedCategory}
          ruleSet={ruleSet}
          currentValue={selectedPlayer.sheet[selectedCategory.id]}
          onSave={(value) => {
            dispatch({ type: "SET_SCORE", playerId: selectedPlayer.id, categoryId: selectedCategory.id, value });
            setLastSaved(selected);
            setSelected(null);
          }}
          onClear={() => {
            dispatch({ type: "CLEAR_SCORE", playerId: selectedPlayer.id, categoryId: selectedCategory.id });
            setLastSaved(null);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
