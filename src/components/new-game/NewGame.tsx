"use client";

import { type FormEvent, useState } from "react";
import { DEFAULT_RULE_SET_ID, RULE_SETS, type TRuleSetId } from "@/rules/ruleSets";

interface INewGameProps {
  onStart: (ruleSetId: TRuleSetId, playerNames: string[]) => void;
}

const MAX_PLAYERS = 6;

export function NewGame({ onStart }: INewGameProps) {
  const [ruleSetId, setRuleSetId] = useState<TRuleSetId>(DEFAULT_RULE_SET_ID);
  const [names, setNames] = useState<string[]>(["", ""]);

  function setName(index: number, name: string) {
    setNames(names.map((n, i) => (i === index ? name : n)));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onStart(ruleSetId, names);
  }

  const canStart = names.some((n) => n.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="flex min-h-dvh w-full max-w-sm mx-auto flex-col justify-center gap-6 px-5 py-10 motion-safe:animate-fade-in">
      <div>
        <h1 className="font-display text-5xl font-bold leading-none tracking-tight">Yatzy Scoreboard</h1>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">Rules</h2>
        <div role="radiogroup" aria-label="Rules" className="flex gap-2">
          {(Object.keys(RULE_SETS) as TRuleSetId[]).map((id) => {
            const active = id === ruleSetId;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRuleSetId(id)}
                className={`flex-1 rounded-full border-2 border-ink py-3 font-medium transition-colors duration-200 ${
                  active ? "bg-ink text-tile" : "active:bg-canvas-strong"
                }`}
              >
                {RULE_SETS[id].name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">New game</h2>
        {names.map((name, i) => (
          <input
            key={i}
            type="text"
            value={name}
            onChange={(e) => setName(i, e.target.value)}
            placeholder={`Player ${i + 1}`}
            aria-label={`Player ${i + 1} name`}
            className="rounded-full border-2 border-rule bg-tile px-5 py-3 text-lg outline-none transition-colors duration-200 placeholder:text-ink-muted/60 focus:border-ink"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {names.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={() => setNames([...names, ""])}
            className="rounded-full border-2 border-ink py-3 font-medium active:bg-canvas-strong"
          >
            Add player
          </button>
        )}
        <button
          type="submit"
          disabled={!canStart}
          className="rounded-full bg-ink py-3 text-lg font-bold text-tile transition-opacity duration-200 disabled:opacity-30"
        >
          Start
        </button>
      </div>
    </form>
  );
}
