import { getSkillById, normalizeSkillId } from "./catalog";
import { isPassiveSkillType } from "./skillTypes";
import type { SkillDefinition } from "./types";

export const MAX_EQUIP_SLOTS = 4;

export interface SkillBattlePrefs {
  healOverrideEnabled: boolean;
  healThreshold: number;
}

export interface SkillLoadout {
  equippedSlots: string[];
  battlePrefs: SkillBattlePrefs;
}

export const DEFAULT_BATTLE_PREFS: SkillBattlePrefs = {
  healOverrideEnabled: true,
  healThreshold: 0.35,
};

export function defaultSkillLoadout(
  unlockedSkillIds: readonly string[]
): SkillLoadout {
  const unlocked = unlockedSkillIds.map(normalizeSkillId);
  const preferred = [
    "active_power_slash",
    "active_iron_palm",
    "passive_sturdy_frame",
  ];
  const equipped: string[] = [];
  for (const id of preferred) {
    if (unlocked.includes(id) && equipped.length < MAX_EQUIP_SLOTS) {
      equipped.push(id);
    }
  }
  for (const id of unlocked) {
    if (equipped.length >= MAX_EQUIP_SLOTS) break;
    if (!equipped.includes(id)) equipped.push(id);
  }
  return { equippedSlots: equipped, battlePrefs: { ...DEFAULT_BATTLE_PREFS } };
}

/** @deprecated Use defaultSkillLoadout */
export function getDefaultLoadout(
  _path: string,
  unlockedSkillIds: readonly string[]
): SkillLoadout {
  return defaultSkillLoadout(unlockedSkillIds);
}

export function getBattleSkillsFromLoadout(
  loadout: SkillLoadout
): SkillDefinition[] {
  return loadout.equippedSlots
    .map((id) => getSkillById(id))
    .filter((s) => s.skillType && !isPassiveSkillType(s.skillType));
}

export function getPassiveSkillsFromLoadout(
  loadout: SkillLoadout
): SkillDefinition[] {
  return loadout.equippedSlots
    .map((id) => getSkillById(id))
    .filter((s) => s.skillType && isPassiveSkillType(s.skillType));
}

/** Equipped skills first, in slot order; others keep stable catalog-tier order. */
export function sortSkillsByEquipOrder(
  skills: SkillDefinition[],
  equippedSlots: readonly string[]
): SkillDefinition[] {
  const slotIndex = new Map<string, number>();
  equippedSlots.forEach((id, index) => {
    slotIndex.set(normalizeSkillId(id), index);
  });

  return [...skills].sort((a, b) => {
    const aIdx = slotIndex.get(normalizeSkillId(a.id));
    const bIdx = slotIndex.get(normalizeSkillId(b.id));
    const aEquipped = aIdx !== undefined;
    const bEquipped = bIdx !== undefined;
    if (aEquipped && bEquipped) return aIdx - bIdx;
    if (aEquipped) return -1;
    if (bEquipped) return 1;
    return (a.catalogTier ?? a.slotTier) - (b.catalogTier ?? b.slotTier);
  });
}

export type EquipSkillToLoadoutResult =
  | { ok: true; loadout: SkillLoadout }
  | { ok: false; reason: "ALREADY_EQUIPPED" | "SLOTS_FULL" };

/** Appends skill to the next equip slot (max {@link MAX_EQUIP_SLOTS}). */
export function equipSkillToLoadout(
  loadout: SkillLoadout,
  skillId: string
): EquipSkillToLoadoutResult {
  const id = normalizeSkillId(skillId);
  if (
    loadout.equippedSlots.some((slotId) => normalizeSkillId(slotId) === id)
  ) {
    return { ok: false, reason: "ALREADY_EQUIPPED" };
  }
  if (loadout.equippedSlots.length >= MAX_EQUIP_SLOTS) {
    return { ok: false, reason: "SLOTS_FULL" };
  }
  return {
    ok: true,
    loadout: {
      ...loadout,
      equippedSlots: [...loadout.equippedSlots, skillId],
    },
  };
}

export function canSwapAdjacentEquippedSlot(
  loadout: SkillLoadout,
  slotIndex: number,
  direction: -1 | 1
): boolean {
  const target = slotIndex + direction;
  if (target < 0 || target >= MAX_EQUIP_SLOTS) return false;
  const n = loadout.equippedSlots.length;
  return slotIndex < n && target < n;
}

export function swapAdjacentEquippedSlots(
  loadout: SkillLoadout,
  slotIndex: number,
  direction: -1 | 1
): SkillLoadout | null {
  if (!canSwapAdjacentEquippedSlot(loadout, slotIndex, direction)) {
    return null;
  }
  const target = slotIndex + direction;
  const equippedSlots = [...loadout.equippedSlots];
  [equippedSlots[slotIndex], equippedSlots[target]] = [
    equippedSlots[target],
    equippedSlots[slotIndex],
  ];
  return { ...loadout, equippedSlots };
}

export function unequipSkillFromLoadout(
  loadout: SkillLoadout,
  skillId: string
): SkillLoadout | null {
  const id = normalizeSkillId(skillId);
  const equippedSlots = loadout.equippedSlots.filter(
    (slotId) => normalizeSkillId(slotId) !== id
  );
  if (equippedSlots.length === loadout.equippedSlots.length) {
    return null;
  }
  return { ...loadout, equippedSlots };
}

export function validateEquipLoadout(
  equippedSlots: string[],
  unlockedSkillIds: readonly string[]
): { valid: boolean; error?: string } {
  if (equippedSlots.length > MAX_EQUIP_SLOTS) {
    return { valid: false, error: "TOO_MANY_SLOTS" };
  }
  const unlocked = new Set(unlockedSkillIds.map(normalizeSkillId));
  const seen = new Set<string>();
  for (const rawId of equippedSlots) {
    const id = normalizeSkillId(rawId);
    if (seen.has(id)) return { valid: false, error: "DUPLICATE_SLOT" };
    seen.add(id);
    const skill = getSkillById(id);
    if (skill.path === "basic" || skill.path === "enemy") {
      return { valid: false, error: "INVALID_SKILL" };
    }
    if (!unlocked.has(id) && !unlocked.has(rawId)) {
      return { valid: false, error: "SKILL_LOCKED" };
    }
  }
  return { valid: true };
}

/** @deprecated */
export function validateLoadout(
  _path: string,
  activeSlots: [string, string] | string[],
  unlockedSkillIds: readonly string[]
): { valid: boolean; error?: string } {
  const slots = Array.isArray(activeSlots) ? activeSlots : [...activeSlots];
  return validateEquipLoadout(slots, unlockedSkillIds);
}

/** @deprecated */
export function deriveAutoSkills(
  unlockedIds: string[],
  activeSlots: string[] | [string, string]
): string[] {
  const activeSet = new Set(activeSlots.map(normalizeSkillId));
  return unlockedIds
    .map(normalizeSkillId)
    .filter((id) => !activeSet.has(id));
}
