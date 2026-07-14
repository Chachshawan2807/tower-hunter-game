import type {
  AnimationEvent,
  AnimationQueuePayload,
  BattleSnapshot,
  PlayerIntent,
} from "../engine/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export interface UserProfile {
  id: string;
  external_id: string;
  display_name: string;
  gold_balance: string;
  preferred_locale: "th" | "en";
}

export interface PlayerStatsResponse {
  stats: {
    user_id: string;
    level: number;
    exp: string;
    hp: string;
    max_hp: string;
    mp: string;
    max_mp: string;
    atk: string;
    def: string;
    speed: string;
    current_floor: number;
  };
  goldBalance: string;
}

export interface BattleSessionResponse {
  id: string;
  userId: string;
  floor: number;
  state: BattleSnapshot & { autoBattle: boolean };
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
  rewards?: { exp: number; gold: string; items: unknown[] };
}

export const api = {
  createUser(externalId: string, displayName: string) {
    return request<UserProfile>("/api/users", {
      method: "POST",
      body: JSON.stringify({ externalId, displayName }),
    });
  },

  getPlayerStats(userId: string) {
    return request<PlayerStatsResponse>(`/api/users/${userId}/stats`);
  },

  getWallet(userId: string) {
    return request<{ goldBalance: string }>(`/api/users/${userId}/wallet`);
  },

  getInventory(userId: string) {
    return request<{ items: unknown[] }>(`/api/users/${userId}/inventory`);
  },

  startBattle(userId: string, floor: number, autoBattle = true) {
    return request<BattleSessionResponse>("/api/battle/start", {
      method: "POST",
      body: JSON.stringify({ userId, floor, autoBattle }),
    });
  },

  battleStep(sessionId: string, maxSteps = 5) {
    return request<BattleStepResponse>(`/api/battle/${sessionId}/step`, {
      method: "POST",
      body: JSON.stringify({ maxSteps }),
    });
  },

  battleIntent(sessionId: string, intent: PlayerIntent) {
    return request<BattleStepResponse>(`/api/battle/${sessionId}/intent`, {
      method: "POST",
      body: JSON.stringify({ intent }),
    });
  },
};
