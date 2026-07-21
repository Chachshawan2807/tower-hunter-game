import type { BattleEntity } from "../types";
import { getSkillById, normalizeSkillId } from "./catalog";
import { canUseSkill } from "./availability";
import { resolveEffectiveSkill } from "./effectiveSkill";
import {
  getBattleSkillsFromLoadout,
  getPassiveSkillsFromLoadout,
  type SkillLoadout,
} from "./loadout";
import { isPassiveSkillType } from "./skillTypes";
import type { SkillDefinition, SkillUpgradeRanks } from "./types";

const EMPTY_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
};

function resolveUsable(
  actor: BattleEntity,
  skill: SkillDefinition,
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[]
): SkillDefinition | null {
  const effective = resolveEffectiveSkill(
    skill,
    upgrades[skill.id] ?? EMPTY_UPGRADES
  );
  return canUseSkill(actor, effective, unlockedSkillIds) ? effective : null;
}

function pickHealOverride(
  actor: BattleEntity,
  loadout: SkillLoadout,
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[]
): SkillDefinition | null {
  if (!loadout.battlePrefs.healOverrideEnabled) return null;
  const hpRatio = actor.stats.hp / actor.stats.maxHp;
  if (hpRatio >= loadout.battlePrefs.healThreshold) return null;

  for (const skillId of loadout.equippedSlots) {
    const skill = getSkillById(skillId);
    if (skill.skillType && isPassiveSkillType(skill.skillType)) continue;
    if (skill.kind !== "heal") continue;
    const usable = resolveUsable(actor, skill, upgrades, unlockedSkillIds);
    if (usable) return usable;
  }
  return null;
}

function pickBySlotOrder(
  actor: BattleEntity,
  loadout: SkillLoadout,
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[]
): SkillDefinition | null {
  for (const skillId of loadout.equippedSlots) {
    const skill = getSkillById(skillId);
    if (skill.skillType && isPassiveSkillType(skill.skillType)) continue;
    const usable = resolveUsable(actor, skill, upgrades, unlockedSkillIds);
    if (usable) return usable;
  }
  return null;
}

export function pickSkillForTurn(
  actor: BattleEntity,
  loadout: SkillLoadout,
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[],
  manualSkillId?: string
): SkillDefinition {
  const unlocked = unlockedSkillIds.map(normalizeSkillId);
  const equippedBattleIds = new Set(
    getBattleSkillsFromLoadout(loadout).map((s) => s.id)
  );

  if (manualSkillId) {
    const id = normalizeSkillId(manualSkillId);
    if (!equippedBattleIds.has(id)) {
      return getSkillById("basic_attack");
    }
    const skill = getSkillById(id);
    const usable = resolveUsable(actor, skill, upgrades, unlocked);
    if (usable) return usable;
  }

  const heal = pickHealOverride(actor, loadout, upgrades, unlocked);
  if (heal) return heal;

  const ordered = pickBySlotOrder(actor, loadout, upgrades, unlocked);
  if (ordered) return ordered;

  return getSkillById("basic_attack");
}

export function getEquippedBattleSkillIds(loadout: SkillLoadout): string[] {
  return getBattleSkillsFromLoadout(loadout).map((s) => s.id);
}

export function getEquippedPassiveSkillIds(loadout: SkillLoadout): string[] {
  return getPassiveSkillsFromLoadout(loadout).map((s) => s.id);
}

/** @deprecated Use pickSkillForTurn */
export function pickAutoSkill(
  actor: BattleEntity,
  _path: string,
  _skillPool: string[],
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[],
  _rng: () => number = Math.random
): SkillDefinition {
  const loadout: SkillLoadout = {
    equippedSlots: _skillPool.slice(0, 4),
    battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 },
  };
  return pickSkillForTurn(actor, loadout, upgrades, unlockedSkillIds);
}
