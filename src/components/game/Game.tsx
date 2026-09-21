"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { getRuleSet } from "@/rules/ruleSets";
import type { ECategory } from "@/rules/types";
import { randomDieValues } from "@/state/dice";
import { canLock, canRoll, canScoreDice, getCurrentPlayer, getPreviewScores, getRollsLeft, isGameOver } from "@/state/selectors";
import type { IDiceState, ISelectedCell } from "@/state/types";
import { useGame } from "@/state/useGame";
import { NewGame } from "@/components/new-game/NewGame";
import { DiceBar } from "@/components/slot/DiceBar";
import type { ISpin } from "@/components/slot/Reel";
import { SlotCabinet } from "@/components/slot/SlotCabinet";
import { Scoreboard } from "./Scoreboard";
import { ScoreInput } from "./ScoreInput";
import { GameOver } from "./GameOver";

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
  const [spin, setSpin] = useState<ISpin | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const spinning = spin !== null;
  const cabinetRef = useRef<HTMLElement>(null);
  const [cabinetVisible, setCabinetVisible] = useState(true);
  const showCabinet = hydrated && state.dice !== undefined && getCurrentPlayer(state) !== undefined;

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [undo]);

  useEffect(() => {
    const cabinet = cabinetRef.current;
    if (!cabinet) return;
    const observer = new IntersectionObserver(([entry]) => setCabinetVisible(entry.intersectionRatio >= 0.5), {
      threshold: [0.5],
    });
    observer.observe(cabinet);
    return () => {
      observer.disconnect();
      setCabinetVisible(true);
    };
  }, [showCabinet]);

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
    const dice = state.dice;
    dispatch({ type: "SCORE_DICE", categoryId });
    setLastSaved({ playerId, categoryId });
    setUndo({ playerId, categoryId, dice });
    scrollToTop();
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function roll() {
    if (!state.dice || !canRoll(state) || spinning) return;
    const from = state.dice.values;
    setUndo(null);
    dispatch({ type: "ROLL_DICE", values: randomDieValues() });
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

      {showCabinet && state.dice && current && (
        <>
          <SlotCabinet
            ref={cabinetRef}
            dice={state.dice}
            spin={spin}
            canRoll={canRoll(state)}
            canLock={canLock(state)}
            rollsLeft={getRollsLeft(state)}
            onRoll={roll}
            onToggleLock={(index) => dispatch({ type: "TOGGLE_LOCK", index })}
            onSettled={() => setSpin(null)}
          />
          <DiceBar
            dice={state.dice}
            rollsLeft={getRollsLeft(state)}
            playerName={current.name}
            visible={!cabinetVisible}
            onClick={scrollToTop}
          />
        </>
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
