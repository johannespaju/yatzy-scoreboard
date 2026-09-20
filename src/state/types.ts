import type { TRuleSetId } from "@/rules/ruleSets";
import type { ECategory, TScoreSheet } from "@/rules/types";

export interface IPlayer {
  id: string;
  name: string;
  sheet: TScoreSheet;
}

export interface IGameState {
  ruleSetId: TRuleSetId;
  players: IPlayer[];
}

export interface ISelectedCell {
  playerId: string;
  categoryId: ECategory;
}
