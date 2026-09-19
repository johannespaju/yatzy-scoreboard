import type { TRuleSetId, TScoreSheet } from "@/rules";

export interface IPlayer {
  id: string;
  name: string;
  sheet: TScoreSheet;
}

export interface IGameState {
  ruleSetId: TRuleSetId;
  players: IPlayer[];
}
