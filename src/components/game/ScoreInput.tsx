"use client";

import { type FormEvent, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { formatValidValues } from "@/rules/format";
import { isValidScore } from "@/rules/ruleSets";
import type { ICategory, IRuleSet } from "@/rules/types";
import type { IPlayer } from "@/state/types";

interface IScoreInputProps {
  player: IPlayer;
  category: ICategory;
  ruleSet: IRuleSet;
  currentValue: number | undefined;
  onSave: (value: number) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ScoreInput({ player, category, ruleSet, currentValue, onSave, onClear, onClose }: IScoreInputProps) {
  const [text, setText] = useState(currentValue === undefined ? "" : String(currentValue));
  const [closing, setClosing] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const value = text.trim() === "" ? undefined : Number(text);
  const isValid = value !== undefined && Number.isInteger(value) && isValidScore(ruleSet, category.id, value);
  const showError = value !== undefined && !isValid;

  function requestClose(action: () => void) {
    if (closing) return;
    if (prefersReducedMotion()) {
      action();
      return;
    }
    pendingAction.current = action;
    setClosing(true);
  }

  function handleAnimationEnd() {
    if (!closing) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValid) requestClose(() => onSave(value));
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        disabled={closing}
        onClick={() => requestClose(onClose)}
        className={`absolute inset-0 touch-none overscroll-contain bg-ink/30 ${
          closing ? "motion-safe:animate-fade-out" : "motion-safe:animate-fade-in"
        }`}
      />
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === "Escape" && requestClose(onClose)}
        onAnimationEnd={handleAnimationEnd}
        className={`relative flex w-full max-w-lg mx-auto flex-col gap-4 rounded-t-3xl bg-tile px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] ${
          closing ? "motion-safe:animate-sheet-down" : "motion-safe:animate-sheet-up"
        }`}
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-ink-muted">{player.name}</div>
          <h2 className="font-display text-2xl font-bold">{category.label}</h2>
        </div>
        <input
          type="number"
          inputMode="numeric"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Score"
          aria-invalid={showError}
          className={`rounded-2xl border-2 bg-canvas/40 px-4 py-3 text-center text-3xl tabular-nums outline-none transition-colors duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none focus:border-ink ${
            showError ? "border-error" : "border-rule"
          }`}
        />
        <p className={`min-h-5 text-sm transition-colors duration-200 ${showError ? "text-error" : "text-ink-muted"}`}>
          Valid: {formatValidValues(category.validValues)}
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isValid || closing}
            className="flex-1 rounded-full bg-ink py-3 font-bold text-tile transition-opacity duration-200 disabled:opacity-30"
          >
            Save
          </button>
          <button
            type="button"
            disabled={closing}
            onClick={() => requestClose(() => onSave(0))}
            className="flex-1 rounded-full border-2 border-ink py-3 font-bold active:bg-canvas-strong"
          >
            Scratch
          </button>
        </div>
        <div className="flex justify-between gap-2">
          {currentValue !== undefined && (
            <button
              type="button"
              disabled={closing}
              onClick={() => requestClose(onClear)}
              className="py-2 font-medium text-error"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            disabled={closing}
            onClick={() => requestClose(onClose)}
            className="ml-auto py-2 font-medium text-ink-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
