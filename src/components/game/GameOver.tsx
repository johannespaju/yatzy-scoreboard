"use client";

import { getPlayerTotals, getStandings } from "@/state/selectors";
import type { IGameState } from "@/state/types";

interface IGameOverProps {
  state: IGameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameOver({ state, onPlayAgain, onNewGame }: IGameOverProps) {
  const standings = getStandings(state);
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-subtle p-4">
      <h2 className="text-xl font-bold">Game over</h2>
      <ol className="flex flex-col gap-1">
        {standings.map((player, i) => (
          <li key={player.id} className={`flex justify-between ${i === 0 ? "font-bold" : ""}`}>
            <span>
              {i + 1}. {player.name}
            </span>
            <span className="tabular-nums">{getPlayerTotals(state, player).total}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <button type="button" onClick={onPlayAgain} className="flex-1 py-3 rounded bg-foreground text-background font-bold">
          Play again
        </button>
        <button type="button" onClick={onNewGame} className="flex-1 py-3 rounded border font-bold">
          New game
        </button>
      </div>
    </section>
  );
}
