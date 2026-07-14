import type { BattleState } from "../../engine/states";
import type { AnimationEvent, PlayerIntent, RewardPayload } from "../../engine/types";

export interface BattleSession {
  id: string;
  userId: string;
  floor: number;
  state: BattleState;
  waitingActorId?: string;
  priorEvents?: AnimationEvent[];
  rewardsGranted: boolean;
  rewards?: RewardPayload;
  createdAt: string;
  updatedAt: string;
}

export interface BattleStepResponse {
  sessionId: string;
  state: BattleState;
  events: AnimationEvent[];
  actionRequired: boolean;
  waitingActorId?: string;
  rewards?: RewardPayload;
}

export interface StartBattleInput {
  userId: string;
  floor: number;
  autoBattle?: boolean;
}
