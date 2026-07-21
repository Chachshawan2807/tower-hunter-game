import type { BattleState } from "../../engine/states";
import type {
  AnimationEvent,
  AnimationQueuePayload,
  RewardPayload,
} from "../../types";

export interface BattleSession {
  id: string;
  userId: string;
  floor: number;
  state: BattleState;
  /** Rotated after each authoritative step — client must echo on request_action. */
  turnNonce: string;
  waitingActorId?: string;
  priorEvents?: AnimationEvent[];
  rewardsGranted: boolean;
  rewards?: RewardPayload;
  outcomeProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BattleStepResponse {
  sessionId: string;
  state: BattleState;
  events: AnimationEvent[];
  animationQueue: AnimationQueuePayload;
  actionRequired: boolean;
  waitingActorId?: string;
  turnNonce: string;
  rewards?: RewardPayload;
}
export interface StartBattleInput {
  userId: string;
  floor: number;
  autoBattle?: boolean;
}
