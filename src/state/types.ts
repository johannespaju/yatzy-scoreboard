import type { TRuleSetId } from "@/rules/ruleSets";
import type { ECategory, TDieValue, TScoreSheet } from "@/rules/types";

export interface IPlayer {
  id: string;
  name: string;
  sheet: TScoreSheet;
}

/** The current turn's dice, only present when playing with virtual dice. */
export interface IDiceState {
  /** Always five values. Before the first roll of a turn they are placeholders. */
  values: TDieValue[];
  /** Which dice are held and skip the next roll. */
  locked: boolean[];
  /** 0–3. A turn ends (and this resets) when a score is entered. */
  rollsUsed: number;
}

export interface IGameState {
  ruleSetId: TRuleSetId;
  players: IPlayer[];
  /** Present means the game is played with virtual dice. */
  dice?: IDiceState;
}

export interface ISelectedCell {
  playerId: string;
  categoryId: ECategory;
}
