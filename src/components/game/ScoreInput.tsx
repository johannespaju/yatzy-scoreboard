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
      <button type="button" aria-label="Close" onClick={onClose} className="flex-1 bg-black/40" />
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex flex-col gap-3 rounded-t-2xl bg-background p-4 pb-6"
      >
        <div>
          <div className="text-sm text-muted-foreground">{player.name}</div>
          <h2 className="text-xl font-bold">{category.label}</h2>
        </div>
        <input
          type="number"
          inputMode="numeric"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Score"
          aria-invalid={showError}
          className="border rounded px-3 py-2 text-2xl tabular-nums"
        />
        <p className={`text-sm min-h-5 ${showError ? "text-error" : "text-muted-foreground"}`}>
          Valid: {formatValidValues(category.validValues)}
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-3 rounded bg-foreground text-background font-bold disabled:opacity-40"
          >
            Save
          </button>
          <button type="button" onClick={() => onSave(0)} className="flex-1 py-3 rounded border font-bold">
            Scratch
          </button>
        </div>
        <div className="flex gap-2 justify-between">
          {currentValue !== undefined && (
            <button type="button" onClick={onClear} className="py-2 underline text-error">
              Clear
            </button>
          )}
          <button type="button" onClick={onClose} className="py-2 underline ml-auto">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
