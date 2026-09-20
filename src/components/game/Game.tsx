"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { getRuleSet } from "@/rules/ruleSets";
import type { ECategory } from "@/rules/types";
import { randomDieValues } from "@/state/dice";
import { canLock, canRoll, canScoreDice, getCurrentPlayer, getPreviewScores, getRollsLeft, isGameOver } from "@/state/selectors";
import type { IDiceState, ISelectedCell } from "@/state/types";
import { useGame } from "@/state/useGame";
import { NewGame } from "@/components/new-game/NewGame";
import type { ISpin } from "@/components/slot/Reel";
import { SlotCabinet } from "@/components/slot/SlotCabinet";
import { Scoreboard } from "./Scoreboard";
import { ScoreInput } from "./ScoreInput";
import { GameOver } from "./GameOver";

/** A dice score that can still be taken back, with the dice as they were. */
interface IUndo extends ISelectedCell {
  dice: IDiceState;
}

const UNDO_MS = 6000;

export function Game() {
  const { state, dispatch, hydrated } = useGame();
  const [selected, setSelected] = useState<ISelectedCell | null>(null);
  const [lastSaved, setLastSaved] = useState<ISelectedCell | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [undo, setUndo] = useState<IUndo | null>(null);
  // The roll whose reels are still turning. Scores stay hidden until they stop.
  const [spin, setSpin] = useState<ISpin | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const spinning = spin !== null;

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo]);

  if (!hydrated) return null;

  if (state.players.length === 0) {
    return <NewGame onStart={(options) => dispatch({ type: "NEW_GAME", ...options })} />;
  }

  const ruleSet = getRuleSet(state.ruleSetId);
  const current = getCurrentPlayer(state);
  const selectedPlayer = selected && state.players.find((p) => p.id === selected.playerId);
  const selectedCategory = selected && ruleSet.categories.find((c) => c.id === selected.categoryId);
  const undoCategory = undo && ruleSet.categories.find((c) => c.id === undo.categoryId);
  const undoValue = undo && state.players.find((p) => p.id === undo.playerId)?.sheet[undo.categoryId];

  function endGame() {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }
    setConfirmEnd(false);
    setLastSaved(null);
    setUndo(null);
    setSpin(null);
    dispatch({ type: "END_GAME" });
  }

  function selectCell(playerId: string, categoryId: ECategory) {
    if (!state.dice) {
      setSelected({ playerId, categoryId });
      return;
    }
    // Dice mode: the cell is saved right away and can be undone for a moment.
    const dice = state.dice;
    dispatch({ type: "SCORE_DICE", categoryId });
    setLastSaved({ playerId, categoryId });
    setUndo({ playerId, categoryId, dice });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function roll() {
    if (!state.dice || !canRoll(state) || spinning) return;
    const from = state.dice.values;
    setUndo(null);
    dispatch({ type: "ROLL_DICE", values: randomDieValues() });
    // With reduced motion the reels don't animate, so there is no animationend to wait for.
    if (!prefersReducedMotion()) {
      setSpinCount(spinCount + 1);
      setSpin({ id: spinCount + 1, from });
    }
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

      {state.dice && current && (
        <SlotCabinet
          dice={state.dice}
          spin={spin}
          canRoll={canRoll(state)}
          canLock={canLock(state)}
          rollsLeft={getRollsLeft(state)}
          playerName={current.name}
          onRoll={roll}
          onToggleLock={(index) => dispatch({ type: "TOGGLE_LOCK", index })}
          onSettled={() => setSpin(null)}
        />
      )}

      {undo && undoCategory && undoValue !== undefined && (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "UNDO_DICE_SCORE", playerId: undo.playerId, categoryId: undo.categoryId, dice: undo.dice });
            setLastSaved(null);
            setUndo(null);
          }}
          className="self-center rounded-full border-2 border-ink px-4 py-1.5 text-sm font-medium active:bg-canvas-strong motion-safe:animate-rise-in"
        >
          Undo {undoCategory.label} {undoValue}
        </button>
      )}

      <Scoreboard
        state={state}
        lastSaved={lastSaved}
        onPopEnd={() => setLastSaved(null)}
        onSelectCell={selectCell}
        previews={spinning ? undefined : getPreviewScores(state)}
        canSelect={state.dice ? (player, category) => !spinning && canScoreDice(state, player.id, category.id) : undefined}
      />

      {isGameOver(state) && (
        <GameOver
          state={state}
          onPlayAgain={() => {
            setLastSaved(null);
            setUndo(null);
            dispatch({ type: "RESET" });
          }}
          onNewGame={() => {
            setLastSaved(null);
            setUndo(null);
            setSpin(null);
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
