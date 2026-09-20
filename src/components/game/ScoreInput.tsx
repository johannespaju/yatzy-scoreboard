"use client";

import { type FormEvent, useState } from "react";
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

  const value = text.trim() === "" ? undefined : Number(text);
  const isValid = value !== undefined && Number.isInteger(value) && isValidScore(ruleSet, category.id, value);
  const showError = value !== undefined && !isValid;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValid) onSave(value);
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="flex-1 bg-ink/30 animate-fade-in" />
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex w-full max-w-lg mx-auto flex-col gap-4 rounded-t-3xl bg-tile px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] animate-sheet-up"
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
          className={`rounded-2xl border-2 bg-canvas/40 px-4 py-3 text-center text-3xl tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none focus:border-ink ${
            showError ? "border-error" : "border-rule"
          }`}
        />
        <p className={`min-h-5 text-sm ${showError ? "text-error" : "text-ink-muted"}`}>
          Valid: {formatValidValues(category.validValues)}
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 rounded-full bg-ink py-3 font-bold text-tile disabled:opacity-30"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onSave(0)}
            className="flex-1 rounded-full border-2 border-ink py-3 font-bold active:bg-canvas-strong"
          >
            Scratch
          </button>
        </div>
        <div className="flex justify-between gap-2">
          {currentValue !== undefined && (
            <button type="button" onClick={onClear} className="py-2 font-medium text-error">
              Clear
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto py-2 font-medium text-ink-muted">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
