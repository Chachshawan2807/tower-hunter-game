import type {
  AnimationEvent,
  AnimationQueuePayload,
  BattleSnapshot,
  PlayerIntent,
} from "../types";
import { apiRequest } from "./request";

export interface BattleSessionResponse {
  id: string;
  userId: string;
  floor: number;
  state: BattleSnapshot & { autoBattle: boolean };
  turnNonce: string;
  waitingActorId?: string;
  rewards?: { exp: number; gold: string; items: unknown[] };
}

export interface BattleStepResponse {
  sessionId: string;
  state: BattleSnapshot & { autoBattle: boolean };
  events: AnimationEvent[];
  animationQueue: AnimationQueuePayload;
  actionRequired: boolean;
  waitingActorId?: string;
  turnNonce: string;
  rewards?: { exp: number; gold: string; items: unknown[] };
}

export const combatApi = {
  startBattle(userId: string, floor: number, autoBattle = true) {
    return apiRequest<BattleSessionResponse>("/api/battle/start", {
      method: "POST",
      body: JSON.stringify({ userId, floor, autoBattle }),
    });
  },

  battleStep(sessionId: string, maxSteps = 5) {
    return apiRequest<BattleStepResponse>(`/api/battle/${sessionId}/step`, {
      method: "POST",
      body: JSON.stringify({ maxSteps }),
    });
  },

  battleIntent(sessionId: string, intent: PlayerIntent) {
    return apiRequest<BattleStepResponse>(`/api/battle/${sessionId}/intent`, {
      method: "POST",
      body: JSON.stringify({ intent }),
    });
  },
};
