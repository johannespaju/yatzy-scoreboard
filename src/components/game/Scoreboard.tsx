"use client";

import { getRuleSet } from "@/rules/ruleSets";
import { ESection, type ECategory, type ICategory } from "@/rules/types";
import { getCurrentPlayer, getPlayerTotals } from "@/state/selectors";
import type { IGameState, IPlayer, ISelectedCell } from "@/state/types";
import { DiceRow } from "@/components/dice/DiceRow";

interface IScoreboardProps {
  state: IGameState;
  lastSaved: ISelectedCell | null;
  onPopEnd: () => void;
  onSelectCell: (playerId: string, categoryId: ECategory) => void;
}

const LABEL_CELL = "sticky left-0 bg-canvas pr-2 text-left text-sm whitespace-nowrap";
const SCORE_CELL = "min-w-12 text-center tabular-nums";

export function Scoreboard({ state, lastSaved, onPopEnd, onSelectCell }: IScoreboardProps) {
  const ruleSet = getRuleSet(state.ruleSetId);
  const current = getCurrentPlayer(state);
  const upper = ruleSet.categories.filter((c) => c.section === ESection.Upper);
  const lower = ruleSet.categories.filter((c) => c.section === ESection.Lower);
  const totals = state.players.map((p) => getPlayerTotals(state, p));

  function renderCategoryRow(category: ICategory) {
    return (
      <tr key={category.id}>
        <th scope="row" className={`${LABEL_CELL} font-medium`}>
          {category.dice ? (
            <>
              <span className="sr-only">{category.label}</span>
              <DiceRow groups={category.dice} />
            </>
          ) : (
            category.label
          )}
        </th>
        {state.players.map((player) => (
          <td key={player.id} className={`${SCORE_CELL} p-0.5`}>
            <ScoreCell
              player={player}
              category={category}
              highlighted={player.id === current?.id}
              justSaved={lastSaved?.playerId === player.id && lastSaved.categoryId === category.id}
              onClick={() => onSelectCell(player.id, category.id)}
              onPopEnd={onPopEnd}
            />
          </td>
        ))}
      </tr>
    );
  }

  function renderTotalRow(label: string, values: number[], isFinal = false) {
    const border = isFinal ? "border-t-2 border-ink" : "";
    return (
      <tr className="font-bold">
        <th scope="row" className={`${LABEL_CELL} py-2 ${border}`}>
          {label}
        </th>
        {values.map((value, i) => (
          <td key={state.players[i].id} className={`${SCORE_CELL} py-2 ${border} ${isFinal ? "text-lg" : ""}`}>
            {value}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={LABEL_CELL} />
            {state.players.map((player) => (
              <th key={player.id} scope="col" className={`${SCORE_CELL} px-0.5 pb-1.5 text-sm font-bold`}>
                <span
                  className={`mx-auto block max-w-20 truncate rounded-full px-2 py-1 transition-colors duration-200 ${
                    player.id === current?.id ? "bg-ink text-tile" : ""
                  }`}
                >
                  {player.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {upper.map(renderCategoryRow)}
          {renderTotalRow("Sum", totals.map((t) => t.upperSum))}
          {renderTotalRow("Bonus", totals.map((t) => t.bonus))}
          {lower.map(renderCategoryRow)}
          {renderTotalRow("Total", totals.map((t) => t.total), true)}
        </tbody>
      </table>
    </div>
  );
}

interface IScoreCellProps {
  player: IPlayer;
  category: ICategory;
  highlighted: boolean;
  justSaved: boolean;
  onClick: () => void;
  onPopEnd: () => void;
}

function ScoreCell({ player, category, highlighted, justSaved, onClick, onPopEnd }: IScoreCellProps) {
  const score = player.sheet[category.id];
  const isEmpty = score === undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      onAnimationEnd={onPopEnd}
      aria-label={`${player.name}, ${category.label}`}
      className={`h-11 w-full select-none rounded-lg font-medium transition-[background-color,transform] duration-150 active:scale-95 active:bg-canvas-strong ${
        highlighted ? "bg-canvas-strong" : "bg-tile"
      } ${isEmpty ? "text-ink-muted" : score === 0 ? "text-ink-muted line-through" : ""} ${
        justSaved ? "motion-safe:animate-tile-pop" : ""
      }`}
    >
      {isEmpty ? "–" : score}
    </button>
  );
}
