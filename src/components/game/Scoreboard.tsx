"use client";

import { getRuleSet } from "@/rules/ruleSets";
import { ESection, type ECategory, type ICategory } from "@/rules/types";
import { getCurrentPlayer, getPlayerTotals } from "@/state/selectors";
import type { IGameState, IPlayer } from "@/state/types";

interface IScoreboardProps {
  state: IGameState;
  onSelectCell: (playerId: string, categoryId: ECategory) => void;
}

const LABEL_CELL = "sticky left-0 bg-background px-2 text-left whitespace-nowrap";
const SCORE_CELL = "min-w-14 text-center tabular-nums";

export function Scoreboard({ state, onSelectCell }: IScoreboardProps) {
  const ruleSet = getRuleSet(state.ruleSetId);
  const current = getCurrentPlayer(state);
  const upper = ruleSet.categories.filter((c) => c.section === ESection.Upper);
  const lower = ruleSet.categories.filter((c) => c.section === ESection.Lower);
  const totals = state.players.map((p) => getPlayerTotals(state, p));

  function renderCategoryRow(category: ICategory) {
    return (
      <tr key={category.id} className="border-t border-muted">
        <th scope="row" className={`${LABEL_CELL} font-normal`}>
          {category.label}
        </th>
        {state.players.map((player) => (
          <td key={player.id} className={`${SCORE_CELL} p-0`}>
            <ScoreCell
              player={player}
              category={category}
              highlighted={player.id === current?.id}
              onClick={() => onSelectCell(player.id, category.id)}
            />
          </td>
        ))}
      </tr>
    );
  }

  function renderTotalRow(label: string, values: number[]) {
    return (
      <tr className="border-t border-muted bg-subtle font-bold">
        <th scope="row" className={`${LABEL_CELL} bg-subtle py-2`}>
          {label}
        </th>
        {values.map((value, i) => (
          <td key={state.players[i].id} className={`${SCORE_CELL} py-2`}>
            {value}
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-base">
        <thead>
          <tr>
            <th className={LABEL_CELL} />
            {state.players.map((player) => (
              <th
                key={player.id}
                scope="col"
                className={`${SCORE_CELL} px-1 py-2 truncate max-w-24 ${
                  player.id === current?.id ? "bg-highlight rounded-t" : ""
                }`}
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {upper.map(renderCategoryRow)}
          {renderTotalRow("Sum", totals.map((t) => t.upperSum))}
          {renderTotalRow("Bonus", totals.map((t) => t.bonus))}
          {lower.map(renderCategoryRow)}
          {renderTotalRow("Total", totals.map((t) => t.total))}
        </tbody>
      </table>
    </div>
  );
}

interface IScoreCellProps {
  player: IPlayer;
  category: ICategory;
  highlighted: boolean;
  onClick: () => void;
}

function ScoreCell({ player, category, highlighted, onClick }: IScoreCellProps) {
  const score = player.sheet[category.id];
  const isEmpty = score === undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${player.name}, ${category.label}`}
      className={`w-full min-h-11 ${highlighted ? "bg-highlight" : ""} ${
        isEmpty ? "text-muted-foreground" : score === 0 ? "text-muted-foreground line-through" : ""
      }`}
    >
      {isEmpty ? "–" : score}
    </button>
  );
}
