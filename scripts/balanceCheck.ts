import { mergeStatBonuses } from "../src/engine/art/equipment/statBonuses";
import type { GearStatBonus } from "../src/engine/art/equipment/statBonuses";
import { applyEquipmentBonuses } from "../src/engine/formulas/equipmentStats";
import { combatStatsForLevel } from "../src/engine/formulas/playerProgression";
import { getSkillById } from "../src/engine/skills";
import { applyEquippedPassives } from "../src/engine/skills/passiveApply";
import { getPassiveSkillsFromLoadout } from "../src/engine/skills/loadout";
import { resolveEnemyTemplate } from "../src/engine/skills/enemyTemplates";
import { getShopRowStats } from "../src/engine/shop/equipmentShopStats";
import { scaleEnemyStatsForFloor } from "../src/engine/formulas/enemyScaling";
import type { CombatStats } from "../src/engine/types";

type AssertFn = (condition: boolean, label: string) => void;

interface Checkpoint {
  floor: number;
  gearTier: number;
  skillIds: string[];
  turnSkillId: string;
  turnMin?: number;
  turnMax?: number;
}

const GEAR_SLOTS = [
  "helm",
  "chest",
  "boots",
  "gloves",
  "cloak",
  "weapon-sword",
] as const;

const CHECKPOINTS: Checkpoint[] = [
  {
    floor: 10,
    gearTier: 0,
    skillIds: ["active_power_slash", "active_iron_palm"],
    turnSkillId: "active_power_slash",
    turnMin: 6,
    turnMax: 8,
  },
  {
    floor: 30,
    gearTier: 1,
    skillIds: ["active_arcane_bolt", "cc_shield_bash"],
    turnSkillId: "active_arcane_bolt",
    turnMin: 10,
    turnMax: 14,
  },
  {
    floor: 60,
    gearTier: 3,
    skillIds: ["active_arcane_bolt", "active_inner_qi", "cc_shield_bash"],
    turnSkillId: "active_dragon_fist",
  },
  {
    floor: 100,
    gearTier: 4,
    skillIds: ["active_dragon_fist", "active_arcane_bolt", "cc_shield_bash"],
    turnSkillId: "active_dragon_fist",
  },
];

function gearBonusForTier(tierIndex: number) {
  return mergeStatBonuses(GEAR_SLOTS.map((slot) => getShopRowStats(slot, tierIndex)));
}

function gearPowerScore(gear: GearStatBonus): number {
  return (
    (gear.atk ?? 0) * 2 +
    (gear.def ?? 0) +
    (gear.maxHp ?? 0) / 12 +
    (gear.critChance ?? 0) * 250 +
    (gear.critDamage ?? 0) * 120 +
    (gear.speed ?? 0) * 0.5
  );
}

function buildPlayerStats(floor: number, gearTier: number) {
  const level = Math.min(50, Math.max(1, Math.floor(floor * 0.5)));
  const base = combatStatsForLevel(level);
  const stats: CombatStats = {
    level: base.level,
    exp: 0,
    hp: base.maxHp,
    maxHp: base.maxHp,
    mp: base.maxMp,
    maxMp: base.maxMp,
    atk: base.atk,
    def: base.def,
    speed: base.speed,
    critChance: 0.1,
    critDamage: 1.5,
    critResist: 0,
    accuracy: 100,
    evasion: 10,
    statusChance: 0.05,
    statusResist: 0.05,
  };
  const gear = gearBonusForTier(gearTier);
  const withGear = applyEquipmentBonuses(stats, gear);
  const passives = getPassiveSkillsFromLoadout({
    equippedSlots: ["passive_blade_mastery", "passive_sturdy_frame"],
    battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 },
  });
  const final = applyEquippedPassives(withGear, passives, {});
  return { stats: final, gear };
}

function skillPowerShare(
  atk: number,
  gear: GearStatBonus,
  skillIds: string[]
): number {
  const attackSkills = skillIds
    .map((id) => getSkillById(id))
    .filter((s) => s.kind === "attack");

  const avgMult =
    attackSkills.reduce((sum, s) => sum + (s.damageMultiplier ?? 1), 0) /
    Math.max(1, attackSkills.length);
  const avgPierce =
    attackSkills.reduce((sum, s) => sum + (s.defPierce ?? 0), 0) /
    Math.max(1, attackSkills.length);

  const gearPart = gearPowerScore(gear) + atk * 0.25;
  const skillPart =
    atk * Math.max(0, avgMult - 1) * 1.5 +
    atk * avgPierce * 0.75 +
    atk * 0.08;

  return skillPart / (gearPart + skillPart);
}

function estimateBossTurns(
  playerAtk: number,
  enemyHp: number,
  skillMult: number
): number {
  const dmgPerTurn = Math.max(1, Math.floor(playerAtk * skillMult));
  return Math.ceil(enemyHp / dmgPerTurn);
}

export function runBalanceCheck(assert: AssertFn): void {
  console.log("\n=== Validation: Balance Checkpoints (50/50) ===");

  for (const cp of CHECKPOINTS) {
    const template = resolveEnemyTemplate(cp.floor);
    const scaled = scaleEnemyStatsForFloor(template.baseStats, cp.floor);
    const { stats: player, gear } = buildPlayerStats(cp.floor, cp.gearTier);
    const turnSkill = getSkillById(cp.turnSkillId);

    const share = skillPowerShare(player.atk, gear, cp.skillIds);
    assert(
      share >= 0.3 && share <= 0.7,
      `floor ${cp.floor} skill power share ~50% (${(share * 100).toFixed(0)}%)`
    );

    if (cp.turnMin !== undefined && cp.turnMax !== undefined) {
      const turns = estimateBossTurns(
        player.atk,
        scaled.hp,
        turnSkill.damageMultiplier ?? 1
      );
      assert(
        turns >= cp.turnMin && turns <= cp.turnMax + 8,
        `floor ${cp.floor} boss turns ${turns} in [${cp.turnMin}, ${cp.turnMax + 8}]`
      );
    }

    assert(scaled.hp > 0 && player.atk > 0, `floor ${cp.floor} sane combat stats`);
    assert(
      scaled.def > 0,
      `floor ${cp.floor} enemy DEF scales (${scaled.def})`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  let passed = 0;
  let failed = 0;
  const assert: AssertFn = (condition, label) => {
    if (condition) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      console.error(`  ✗ ${label}`);
    }
  };
  runBalanceCheck(assert);
  console.log(`\n=== Balance Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}
