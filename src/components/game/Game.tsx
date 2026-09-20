"use client";

import { useState } from "react";
import { DEFAULT_RULE_SET_ID, getRuleSet } from "@/rules/ruleSets";
import type { ECategory } from "@/rules/types";
import { isGameOver } from "@/state/selectors";
import { useGame } from "@/state/useGame";
import { NewGame } from "@/components/new-game/NewGame";
import { Scoreboard } from "./Scoreboard";
import { ScoreInput } from "./ScoreInput";
import { GameOver } from "./GameOver";

interface ISelectedCell {
  playerId: string;
  categoryId: ECategory;
}

export function Game() {
  const { state, dispatch, hydrated } = useGame();
  const [selected, setSelected] = useState<ISelectedCell | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!hydrated) return null;

  if (state.players.length === 0) {
    return <NewGame onStart={(playerNames) => dispatch({ type: "NEW_GAME", ruleSetId: DEFAULT_RULE_SET_ID, playerNames })} />;
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
    dispatch({ type: "END_GAME" });
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">{ruleSet.name}</h1>
        {!isGameOver(state) && (
          <button type="button" onClick={endGame} onBlur={() => setConfirmEnd(false)} className="underline text-sm">
            {confirmEnd ? "End game?" : "New game"}
          </button>
        )}
      </header>

      <Scoreboard state={state} onSelectCell={(playerId, categoryId) => setSelected({ playerId, categoryId })} />

      {isGameOver(state) && (
        <GameOver
          state={state}
          onPlayAgain={() => dispatch({ type: "RESET" })}
          onNewGame={() => dispatch({ type: "END_GAME" })}
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
            setSelected(null);
          }}
          onClear={() => {
            dispatch({ type: "CLEAR_SCORE", playerId: selectedPlayer.id, categoryId: selectedCategory.id });
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
