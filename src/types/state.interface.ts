import type { BattleEntity } from "./combat.interface";

export type TurnPhase =
  | "start_of_turn"
  | "action_choice"
  | "execution"
  | "end_of_turn";

export interface TurnContext {
  phase: TurnPhase;
  activeEntityId: string;
  floor: number;
  turnNumber: number;
  autoBattle: boolean;
}

export interface BattleSnapshot {
  entities: BattleEntity[];
  floor: number;
  turnNumber: number;
  isComplete: boolean;
  result?: "win" | "lose";
}

export type PlayerIntent =
  | {
      type: "request_action";
      skillId: string;
      targetId: string;
      turnNonce?: string;
    }
  | { type: "toggle_auto_battle"; enabled: boolean }
  | { type: "toggle_auto_climb"; enabled: boolean }
  | { type: "skip_animation" };

export function toActionIntent(
  intent: Extract<PlayerIntent, { type: "request_action" }>,
  characterId: string
): {
  characterId: string;
  skillId: string;
  targetId: string;
  turnNonce: string;
} | null {
  if (!intent.turnNonce) return null;
  return {
    characterId,
    skillId: intent.skillId,
    targetId: intent.targetId,
    turnNonce: intent.turnNonce,
  };
}
