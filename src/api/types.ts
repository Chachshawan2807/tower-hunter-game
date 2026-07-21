export interface UserProfile {
  id: string;
  external_id: string;
  display_name: string;
  gold_balance: string;
  preferred_locale: "th" | "en";
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
    skill_points?: number;
    status_points?: number;
    alloc_hp?: number;
    alloc_mp?: number;
    alloc_atk?: number;
    alloc_def?: number;
    alloc_spd?: number;
    alloc_crit?: number;
    alloc_crit_dmg?: number;
    alloc_resist?: number;
    alloc_eva?: number;
    alloc_acc?: number;
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
  unlockedSkillIds: string[];
  skills: (SkillCatalogEntry & {
    unlocked: boolean;
    upgrades: SkillUpgradeRanks;
  })[];
}

export interface SkillUnlockResponse {
  skillPoints: number;
  unlockedSkillIds: string[];
}

export interface SkillUpgradeResponse {
  ranks: SkillUpgradeRanks;
  skillPoints: number;
}

export type StatusAllocateResponse = PlayerStatsResponse;

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
  slot: string;
  stats: Record<string, number>;
  statPreview: string[];
  sellPrice: string;
  icon: string;
}

export type EquipSlotId =
  | "weapon"
  | "helm"
  | "chest"
  | "gloves"
  | "boots"
  | "cloak";

export interface PlayerEquipmentResponse {
  slots: Partial<
    Record<
      EquipSlotId,
      { gearId: string; rarity: "common" | "rare" | "epic" | "legendary" }
    >
  >;
  path: "imperial" | "knight" | "vanguard";
  statBonus?: GearStatBonusDto;
}

export interface EquipFromBagResponse {
  slot: string;
  equipped: { gearId: string; rarity: string };
  loadout: PlayerEquipmentResponse["slots"];
  statBonusLines: string[];
}

export interface UnequipSlotResponse {
  slot: string;
  loadout: PlayerEquipmentResponse["slots"];
  statBonus?: GearStatBonusDto;
}
