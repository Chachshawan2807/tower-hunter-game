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
  auto_dismantle_common?: boolean;
}

export interface GearStatBonusDto {
  maxHp?: number;
  maxMp?: number;
  atk?: number;
  def?: number;
  speed?: number;
  critChance?: number;
  critDamage?: number;
  accuracy?: number;
  evasion?: number;
  statusChance?: number;
  statusResist?: number;
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
    crit_chance?: string;
    crit_damage?: string;
    crit_resist?: string;
    accuracy?: string;
    evasion?: string;
    status_chance?: string;
    status_resist?: string;
    current_floor: number;
    active_skill_path?: "imperial" | "knight" | "vanguard";
  };
  goldBalance: string;
  equipmentStatBonus?: GearStatBonusDto;
}

export interface SkillCatalogEntry {
  id: string;
  path: string;
  stringId: string;
  icon: string;
  mpCost: number;
  kind: string;
  targetType: string;
  unlockLevel: number;
  cooldownTurns: number;
  damageMultiplier?: number;
  healPercent?: number;
  unlocked?: boolean;
}

export interface SkillPathResponse {
  path: "imperial" | "knight" | "vanguard";
  playerLevel: number;
  equippedSkills: string[];
  skills: SkillCatalogEntry[];
}

export interface SkillLoadout {
  path: "imperial" | "knight" | "vanguard";
  activeSlots: [string, string];
}

export interface SkillUpgradeRanks {
  damage: 0 | 1 | 2 | 3;
  cooldown: 0 | 1 | 2 | 3;
  mpCost: 0 | 1 | 2 | 3;
}

export interface SkillProgressionResponse {
  skillPoints: number;
  upgrades: Record<string, SkillUpgradeRanks>;
  path: "imperial" | "knight" | "vanguard";
  loadout: SkillLoadout;
  skills: (SkillCatalogEntry & {
    unlocked: boolean;
    upgrades: SkillUpgradeRanks;
  })[];
}

export interface SkillUpgradeResponse {
  ranks: SkillUpgradeRanks;
  skillPoints: number;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  rarity: string;
  created_at: string;
  updated_at: string;
}

export interface MailboxItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  rarity: string;
  source_floor: number | null;
  expires_at: string;
  created_at: string;
}

export interface ShopCatalogItem {
  id: string;
  stringId: string;
  cost: string;
  rarity: string;
  icon: string;
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

export interface PlayerEquipmentResponse {
  slots: Partial<Record<
    "weapon" | "helm" | "chest" | "gloves" | "boots" | "cloak",
    { gearId: string; rarity: "common" | "rare" | "epic" | "legendary" }
  >>;
  path: "imperial" | "knight" | "vanguard";
  statBonus?: GearStatBonusDto;
}

export interface EquipFromBagResponse {
  slot: string;
  equipped: { gearId: string; rarity: string };
  loadout: PlayerEquipmentResponse["slots"];
  statBonusLines: string[];
}

export const api = {
  createUser(externalId: string, displayName: string) {
    return request<UserProfile>("/api/users", {
      method: "POST",
      body: JSON.stringify({ externalId, displayName }),
    });
  },

  getUserByExternalId(externalId: string) {
    return request<UserProfile>(`/api/users/external/${externalId}`);
  },

  getUser(userId: string) {
    return request<UserProfile>(`/api/users/${userId}`);
  },

  getPlayerStats(userId: string) {
    return request<PlayerStatsResponse>(`/api/users/${userId}/stats`);
  },

  getWallet(userId: string) {
    return request<{ goldBalance: string }>(`/api/users/${userId}/wallet`);
  },

  getInventory(userId: string) {
    return request<{ items: InventoryItem[] }>(`/api/users/${userId}/inventory`);
  },

  getPlayerEquipment(userId: string) {
    return request<PlayerEquipmentResponse>(`/api/users/${userId}/equipment`);
  },

  equipFromBag(
    userId: string,
    slot: "weapon" | "helm" | "chest" | "gloves" | "boots" | "cloak",
    inventoryId: string
  ) {
    return request<EquipFromBagResponse>(`/api/users/${userId}/equipment`, {
      method: "PATCH",
      body: JSON.stringify({ slot, inventoryId }),
    });
  },

  getMailbox(userId: string) {
    return request<{ items: MailboxItem[] }>(`/api/users/${userId}/mailbox`);
  },

  updateSettings(userId: string, settings: { autoDismantleCommon: boolean }) {
    return request<UserProfile>(`/api/users/${userId}/settings`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  },

  getShopCatalog() {
    return request<{ items: ShopCatalogItem[] }>("/api/shop/catalog");
  },

  purchaseShopItem(userId: string, itemId: string, idempotencyKey: string) {
    return request<{
      itemId: string;
      quantity: number;
      goldSpent: string;
      balanceAfter: string;
      inventoryOutcome: string;
    }>(`/api/shop/${userId}/purchase`, {
      method: "POST",
      body: JSON.stringify({ itemId, idempotencyKey, quantity: 1 }),
    });
  },

  getSkillCatalog() {
    return request<{ skills: SkillCatalogEntry[] }>("/api/skills/catalog");
  },

  getSkillPath(userId: string) {
    return request<SkillPathResponse>(`/api/skills/${userId}/path`);
  },

  setSkillPath(userId: string, path: "imperial" | "knight" | "vanguard") {
    return request<SkillPathResponse>(`/api/skills/${userId}/path`, {
      method: "PATCH",
      body: JSON.stringify({ path }),
    });
  },

  patchSkillLoadout(
    userId: string,
    payload: { path: "imperial" | "knight" | "vanguard"; activeSlots: [string, string] }
  ) {
    return request<{ loadout: SkillLoadout }>(`/api/skills/${userId}/loadout`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getSkillProgression(userId: string) {
    return request<SkillProgressionResponse>(`/api/skills/${userId}/progression`);
  },

  upgradeSkill(
    userId: string,
    payload: { skillId: string; branch: "damage" | "cooldown" | "mpCost" }
  ) {
    return request<SkillUpgradeResponse>(`/api/skills/${userId}/upgrade`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
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
