"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { getPlayerTotals, getStandings } from "@/state/selectors";
import type { IGameState } from "@/state/types";

interface IGameOverProps {
  state: IGameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameOver({ state, onPlayAgain, onNewGame }: IGameOverProps) {
  const standings = getStandings(state);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
  }, []);

  return (
    <section ref={sectionRef} className="flex flex-col gap-4 rounded-3xl bg-tile p-5 motion-safe:animate-rise-in">
      <h2 className="font-display text-2xl font-bold">Game over</h2>
      <ol className="flex flex-col">
        {standings.map((player, i) => (
          <li
            key={player.id}
            style={{ animationDelay: `${100 + i * 60}ms` }}
            className={`flex items-center justify-between border-b border-canvas py-2 last:border-0 motion-safe:animate-rise-in ${
              i === 0 ? "font-bold" : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-5 tabular-nums ${i === 0 ? "" : "text-ink-muted"}`}>{i + 1}.</span>
              {player.name}
            </span>
            <span className="tabular-nums font-bold">{getPlayerTotals(state, player).total}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <button type="button" onClick={onPlayAgain} className="flex-1 rounded-full bg-ink py-3 font-bold text-tile">
          Play again
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="flex-1 rounded-full border-2 border-ink py-3 font-bold active:bg-canvas-strong"
        >
          New game
        </button>
      </div>
    </section>
  );
}
