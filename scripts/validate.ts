import {
  calculateBaseDamage,
  calculateHitChance,
  calculateDotDamage,
  scaleExponentialStat,
  scaleEnemyStatsForFloor,
  tickActionGauge,
  isGaugeReady,
  combatStatsForLevel,
  levelFromTotalExp,
  totalExpForLevel,
  calculateFloorGoldReward,
} from "../src/engine/formulas";
import { createBattleState, DEFAULT_PLAYER_STATS } from "../src/server/battle/factory";
import { advanceBattleStep, resolveActionChoice } from "../src/engine/states";
import { validateManualAction } from "../src/engine/states/actionChoice";
import { applyStatusOnHit } from "../src/engine/status";
import {
  canUseSkill,
  getSkillById,
  getPlayerCatalogSkills,
  getSkillsByType,
  pickSkillForTurn,
  isSkillUnlocked,
  isSkillUnlockedByLevel,
  getSkillUnlockSpCost,
  applySkillCooldown,
  tickSkillCooldowns,
  CATALOG_VERSION,
  normalizeSkillId,
  defaultSkillLoadout,
  validateEquipLoadout,
  MAX_EQUIP_SLOTS,
  calculateRespecRefund,
} from "../src/engine/skills";
import { resolveEffectiveSkill } from "../src/engine/skills/effectiveSkill";
import {
  spCostForNextRank,
  calculateSpGrant,
  canUpgradeBranch,
  MAX_UPGRADE_RANK,
} from "../src/engine/skills/skillPoints";
import {
  calculateStatusPointGrant,
  mergedPlayerStatsFromAllocations,
  playerStatsWithStatusAllocations,
  statusBonusesFromAllocations,
} from "../src/engine/formulas/statusPoints";
import { SKILL_UNLOCK_LEVELS } from "../src/engine/skills/types";
import {
  BOSS_LATE,
  resolveEnemyTemplate,
} from "../src/engine/skills/enemyTemplates";
import { pickEnemySkill } from "../src/engine/skills/enemyAi";
import type { BattleEntity } from "../src/engine/types";
import { toCombatStats } from "../src/server/db/playerStats";
import {
  BattleValidationError,
  validateTargetEntity,
} from "../src/server/battle/validation";
import { getShopRowStats } from "../src/engine/shop/equipmentShopStats";
import { EQUIPMENT_SHOP_ITEMS } from "../src/engine/shop/equipmentShopItems";
import { runBalanceCheck } from "./balanceCheck";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function withReadyActor(
  state: ReturnType<typeof createBattleState>,
  actorId: string
) {
  return {
    ...state,
    entities: state.entities.map((entity) =>
      entity.id === actorId ? { ...entity, actionGauge: 100 } : entity
    ),
  };
}

console.log("=== Validation: Player Stats Mapping ===");
const mapped = toCombatStats({
  user_id: "test",
  level: 5,
  exp: "120",
  hp: "400",
  max_hp: "500",
  mp: "80",
  max_mp: "100",
  atk: "75",
  def: "30",
  speed: "110",
  crit_chance: "0.15",
  crit_damage: "1.8",
  crit_resist: "0",
  accuracy: "105",
  evasion: "12",
  status_chance: "0.05",
  status_resist: "0.05",
  current_floor: 3,
  active_skill_path: "imperial",
  updated_at: new Date(),
});

assert(mapped.level === 5, "level maps correctly");
assert(mapped.atk === 75, "atk maps correctly");
assert(mapped.speed === 110, "speed maps correctly");
assert(mapped.exp === 120, "exp maps correctly");

console.log("\n=== Validation: Damage Formula ===");
const dmg = calculateBaseDamage(100, 50);
assert(dmg >= 1, "damage is at least 1");
assert(dmg < 100, "DEF reduces damage");

console.log("\n=== Validation: Hit Chance ===");
const hitHigh = calculateHitChance(200, 10);
const hitLow = calculateHitChance(50, 200);
assert(hitHigh > hitLow, "higher accuracy yields higher hit chance");
assert(hitHigh <= 0.95, "hit chance capped at 95%");
assert(hitLow >= 0.05, "hit chance floored at 5%");

console.log("\n=== Validation: DoT ===");
const dot = calculateDotDamage(1000);
assert(dot === 50, "DoT is 5% of max HP");

console.log("\n=== Validation: Enemy Scaling (8%) ===");
const floor10Hp = scaleExponentialStat(200, 10);
const expected = 200 * Math.pow(1.08, 9);
assert(Math.abs(floor10Hp - expected) < 0.01, "exponential 8% scaling");

console.log("\n=== Validation: Action Gauge ===");
let gauge = 0;
for (let i = 0; i < 10; i++) {
  gauge = tickActionGauge(gauge, 100);
}
assert(isGaugeReady(gauge), "speed 100 fills gauge in 10 ticks");

console.log("\n=== Validation: Player Progression ===");
assert(levelFromTotalExp(0) === 1, "0 exp is level 1");
assert(levelFromTotalExp(35) === 2, "35 exp reaches level 2");
assert(levelFromTotalExp(170) === 5, "170 exp unlocks slot-2 skills");

const level10Stats = combatStatsForLevel(10);
const floor10Enemy = scaleEnemyStatsForFloor(
  { hp: 200, atk: 30, def: 15, speed: 80, accuracy: 90, evasion: 5 },
  10
);
const level10Dmg = calculateBaseDamage(level10Stats.atk, floor10Enemy.def);
assert(level10Dmg > 50, "level 10 player outscales floor 10 enemy DEF");

const floor10Boss = scaleEnemyStatsForFloor(
  { hp: 200, atk: 30, def: 15, speed: 80, accuracy: 90, evasion: 5 },
  10
);
assert(floor10Boss.hp > 400, "boss floor 10 has 1.5x HP multiplier");
assert(totalExpForLevel(15) <= 1050, "level 15 reachable by floor 15 climb");

console.log("\n=== Validation: Equipment Balance ===");
const v05AxeCross = getShopRowStats("weapon-axe-cross", 4);
assert(v05AxeCross.atk === 80, "v05 dual axes ATK");
assert(v05AxeCross.critDamage === 0.2, "v05 dual axes crit dmg");

const v05Chest = getShopRowStats("chest", 4);
assert(v05Chest.maxHp === 420, "v05 chest HP");

const v05SwordShield = getShopRowStats("weapon-sword-shield", 4);
assert(v05SwordShield.atk === 70, "v05 sword-shield ATK");
assert(v05SwordShield.def === 40, "v05 sword-shield DEF");

const etherHelm = EQUIPMENT_SHOP_ITEMS.find((i) => i.assetKey === "helm-05");
assert(etherHelm?.cost === 1080n, "Ether Helm price 1080");

const expression = EQUIPMENT_SHOP_ITEMS.find(
  (i) => i.assetKey === "weapon-axe-cross-05"
);
assert(expression?.cost === 1404n, "Expression price 1404");

function cumulativeGoldToFloor(floor: number): bigint {
  let total = 0n;
  for (let f = 1; f <= floor; f++) total += calculateFloorGoldReward(f);
  return total;
}

assert(
  cumulativeGoldToFloor(30) >= 2000n,
  "enough gold to start v03 buys by F30"
);
assert(
  cumulativeGoldToFloor(100) >= 25000n,
  "enough gold for multiple v05 pieces by F100"
);

console.log("\n=== Validation: Skill Catalog v2 ===");
assert(CATALOG_VERSION === 3, "catalog version 3");
assert(
  SKILL_UNLOCK_LEVELS.join(",") === "1,5,10,15",
  "unlock levels are 1/5/10/15"
);
assert(getPlayerCatalogSkills().length === 22, "22 player skills in catalog");
assert(getSkillsByType("passive").length === 7, "7 passives");
assert(getSkillsByType("active").length === 7, "7 actives");
assert(getSkillsByType("cc").length === 4, "4 cc skills");
assert(getSkillsByType("movement").length === 4, "4 movement skills");

const palm = getSkillById("active_iron_palm");
assert(palm.slotTier === 2 && palm.autoPriority === 70, "iron palm tier 2");
const dragon = getSkillById("active_dragon_fist");
assert(
  dragon.unlockLevel === 25 && dragon.damageMultiplier === 1.75,
  "dragon fist ultimate"
);

const bash = getSkillById("cc_shield_bash");
assert(bash.guaranteedStatus === "stun" && bash.unlockLevel === 5, "shield bash stun");

const meteor = getSkillById("active_meteor");
assert(meteor.defPierce === 0.55 && meteor.unlockLevel === 30, "meteor pierce");

assert(
  normalizeSkillId("murim_palm") === "active_iron_palm",
  "legacy murim_palm maps to active_iron_palm"
);
assert(
  getSkillById("murim_palm").damageMultiplier === palm.damageMultiplier,
  "legacy murim_palm resolves to iron palm stats"
);

assert(isSkillUnlocked(palm, ["active_iron_palm"]), "palm unlocked when in unlock set");
assert(
  !isSkillUnlocked(getSkillById("move_shadow_step"), ["active_iron_palm"]),
  "shadow step locked without unlock"
);
assert(
  isSkillUnlockedByLevel(getSkillById("active_inner_qi"), 15),
  "inner qi unlocks at Lv15 (tier 4)"
);
assert(getSkillUnlockSpCost(palm) === 2, "tier-2 skill costs 2 SP");
assert(getSkillUnlockSpCost(dragon) === 10, "tier-6 skill costs 10 SP");

const cooldownEntity: BattleEntity = {
  id: "player",
  side: "player",
  name: "Player",
  stats: DEFAULT_PLAYER_STATS,
  actionGauge: 0,
  statusEffects: [],
  skillCooldowns: {},
};
const palmCds = applySkillCooldown(cooldownEntity.skillCooldowns, palm);
assert(
  palmCds.active_iron_palm === palm.cooldownTurns,
  "skill cooldown applied on use"
);
const tickedCds = tickSkillCooldowns(palmCds);
assert(
  tickedCds.active_iron_palm === palm.cooldownTurns - 1,
  "cooldown decrements each turn"
);

console.log("\n=== Validation: Skill Loadout v2 ===");
assert(MAX_EQUIP_SLOTS === 4, "max 4 equip slots");

const defaultLoadout = defaultSkillLoadout([
  "active_iron_palm",
  "active_power_slash",
]);
assert(
  defaultLoadout.equippedSlots[0] === "active_power_slash",
  "default prefers power slash first"
);
assert(
  defaultLoadout.equippedSlots.includes("active_iron_palm"),
  "default loadout includes unlocked skills"
);

assert(
  !validateEquipLoadout(
    ["active_iron_palm", "active_iron_palm"],
    ["active_iron_palm", "active_power_slash"]
  ).valid,
  "duplicate equip slots rejected"
);
assert(
  !validateEquipLoadout(
    ["move_shadow_step", "active_iron_palm"],
    ["active_iron_palm"]
  ).valid,
  "locked skill cannot be equipped"
);
assert(
  !validateEquipLoadout(
    ["a", "b", "c", "d", "e"],
    ["a", "b", "c", "d", "e"]
  ).valid,
  "more than 4 slots rejected"
);

console.log("\n=== Validation: Skill Picker ===");
const pickerEntity: BattleEntity = {
  id: "player",
  side: "player",
  name: "Player",
  stats: { ...DEFAULT_PLAYER_STATS, mp: 200, hp: 100, maxHp: 500 },
  actionGauge: 100,
  statusEffects: [],
  skillCooldowns: {},
};
const healLoadout = defaultSkillLoadout([
  "active_power_slash",
  "active_holy_light",
]);
const healPick = pickSkillForTurn(
  pickerEntity,
  healLoadout,
  {},
  ["active_power_slash", "active_holy_light"]
);
assert(healPick.id === "active_holy_light", "heal override at low HP");

const slotLoadout = defaultSkillLoadout([
  "active_power_slash",
  "cc_shield_bash",
]);
const slotPick = pickSkillForTurn(
  { ...pickerEntity, stats: { ...pickerEntity.stats, hp: 400 } },
  slotLoadout,
  {},
  ["active_power_slash", "cc_shield_bash"]
);
assert(slotPick.id === "active_power_slash", "slot-order picks first ready skill");

console.log("\n=== Validation: Loadout Integration ===");
const loadoutState = createBattleState(1, {
  autoBattle: false,
  playerLoadout: {
    equippedSlots: ["active_iron_palm", "active_power_slash"],
    battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 },
  },
  playerUnlockedSkillIds: ["active_iron_palm", "active_power_slash"],
});
assert(
  validateManualAction(loadoutState, "player", {
    type: "basic_attack",
    targetId: "enemy_floor_1",
    skillId: "active_inner_qi",
  }) === false,
  "manual action rejects non-equipped skill"
);
assert(
  validateManualAction(loadoutState, "player", {
    type: "basic_attack",
    targetId: "enemy_floor_1",
    skillId: "active_iron_palm",
  }) === true,
  "manual action accepts equipped skill"
);

console.log("\n=== Validation: Effective Skill ===");
const palmDamage4 = resolveEffectiveSkill(palm, {
  damage: 4,
  cooldown: 0,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
});
assert(
  palmDamage4.damageMultiplier === 1.3 * 1.2,
  "damage rank 4 adds +20% multiplier on attack"
);

const palmCd3 = resolveEffectiveSkill(palm, {
  damage: 0,
  cooldown: 3,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
});
assert(palmCd3.cooldownTurns === 0, "cooldown rank 3 floors at 0");

const palmMp3 = resolveEffectiveSkill(palm, {
  damage: 0,
  cooldown: 0,
  mpCost: 3,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
});
assert(palmMp3.mpCost === 9, "mp rank 3 reduces 12 MP to 9");

const qi = getSkillById("active_inner_qi");
const qiDamage3 = resolveEffectiveSkill(qi, {
  damage: 3,
  cooldown: 0,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
});
assert(
  qiDamage3.damageMultiplier === undefined,
  "buff skill ignores damage branch"
);

console.log("\n=== Validation: Skill Points & Respec ===");
assert(spCostForNextRank(0) === 1, "rank 0→1 costs 1 SP");
assert(spCostForNextRank(1) === 2, "rank 1→2 costs 2 SP");
assert(spCostForNextRank(3) === 4, "rank 3→4 costs 4 SP");
assert(
  spCostForNextRank(0) +
    spCostForNextRank(1) +
    spCostForNextRank(2) +
    spCostForNextRank(3) ===
    10,
  "escalating SP cost totals 10 for full branch"
);

assert(calculateSpGrant(4, 5) === 1, "single level up grants +1 skill point");
assert(calculateSpGrant(1, 3) === 2, "two level ups grant +2 skill points");
assert(calculateSpGrant(5, 5, false) === 0, "no level gain grants 0 skill points");
assert(calculateSpGrant(5, 5, true) === 1, "boss floor grants +1 skill point");

assert(
  calculateRespecRefund(["active_iron_palm", "active_power_slash"], {
    active_iron_palm: {
      damage: 1,
      cooldown: 0,
      mpCost: 0,
      statusPotency: 0,
      healPower: 0,
      passivePotency: 0,
    },
  }) === 4,
  "respec refunds unlock + upgrade SP"
);

assert(calculateStatusPointGrant(4, 5) === 5, "single level up grants +5 status points");
assert(calculateStatusPointGrant(1, 3) === 10, "two level ups grant +10 status points");
assert(
  statusBonusesFromAllocations({
    hp: 2,
    mp: 0,
    atk: 1,
    def: 0,
    spd: 0,
    crit: 0,
    critDmg: 0,
    resist: 0,
    eva: 0,
    acc: 0,
  }).maxHp === 2,
  "HP allocation bonus is +1 per rank"
);
assert(
  Math.abs(
    mergedPlayerStatsFromAllocations(5, {
      hp: 0,
      mp: 0,
      atk: 0,
      def: 0,
      spd: 0,
      crit: 2,
      critDmg: 0,
      resist: 0,
      eva: 0,
      acc: 0,
    }).critChance - 0.12
  ) < 0.0001,
  "CRIT allocation adds +1% per rank"
);
assert(
  playerStatsWithStatusAllocations(5, {
    hp: 1,
    mp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    crit: 0,
    critDmg: 0,
    resist: 0,
    eva: 0,
    acc: 0,
  }).maxHp
    > playerStatsWithStatusAllocations(5, {
      hp: 0,
      mp: 0,
      atk: 0,
      def: 0,
      spd: 0,
      crit: 0,
      critDmg: 0,
      resist: 0,
      eva: 0,
      acc: 0,
    }).maxHp,
  "merged player stats include allocation bonuses"
);

assert(
  canUpgradeBranch(palm, "damage", {
    damage: MAX_UPGRADE_RANK,
    cooldown: 0,
    mpCost: 0,
    statusPotency: 0,
    healPower: 0,
    passivePotency: 0,
  }).allowed === false,
  "cannot upgrade beyond max rank"
);

console.log("\n=== Validation: Enemy Templates ===");
const floor15Template = resolveEnemyTemplate(15);
assert(floor15Template.id === "guardian_low", "floor 15 → guardian_low");
assert(
  floor15Template.skillIds.includes("enemy_heavy_blow"),
  "floor 15 guardian uses heavy_blow"
);

const floor50Template = resolveEnemyTemplate(50);
assert(floor50Template.id === "boss_mid", "floor 50 boss → boss_mid");
assert(floor50Template.skillIds.length === 3, "boss mid has 3 skills");

const floor95Template = resolveEnemyTemplate(95);
assert(floor95Template.id === "guardian_void", "floor 95 → guardian_void");

const floor100Template = resolveEnemyTemplate(100);
assert(floor100Template.id === "boss_void", "floor 100 boss → boss_void");

const floor15Battle = createBattleState(15);
const floor15EnemyEntity = floor15Battle.entities.find((e) => e.side === "enemy")!;
assert(
  floor15EnemyEntity.enemyTemplateId === "guardian_low",
  "factory sets enemyTemplateId on normal floor"
);

console.log("\n=== Validation: Enemy AI ===");
const bossEnemyBase: BattleEntity = {
  id: "enemy_test",
  side: "enemy",
  name: "Boss",
  stats: {
    level: 1,
    exp: 0,
    hp: 500,
    maxHp: 1000,
    mp: 0,
    maxMp: 0,
    atk: 50,
    def: 20,
    speed: 80,
    critChance: 0,
    critDamage: 1.5,
    critResist: 0,
    accuracy: 90,
    evasion: 5,
    statusChance: 0,
    statusResist: 0,
  },
  actionGauge: 100,
  statusEffects: [],
  skillCooldowns: {},
};

assert(
  canUseSkill(bossEnemyBase, palm, ["active_iron_palm"]),
  "canUseSkill skips MP check for enemies"
);
const playerNoMp: BattleEntity = {
  ...bossEnemyBase,
  side: "player",
  stats: { ...bossEnemyBase.stats, mp: 0, maxMp: 100 },
};
assert(
  !canUseSkill(playerNoMp, palm, ["active_iron_palm"]),
  "player cannot use skill without MP"
);

const bossMidPick = pickEnemySkill(
  bossEnemyBase,
  floor50Template,
  () => 0.5
);
assert(
  bossMidPick.id === "enemy_stun_smash",
  "boss mid AI picks highest-priority ready skill"
);

const bossMidOnCd: BattleEntity = {
  ...bossEnemyBase,
  skillCooldowns: { enemy_stun_smash: 2 },
};
const bossMidFallback = pickEnemySkill(
  bossMidOnCd,
  floor50Template,
  () => 0.5
);
assert(
  bossMidFallback.id === "enemy_slam",
  "enemy AI skips skills on cooldown"
);

const lowHpBoss: BattleEntity = {
  ...bossEnemyBase,
  stats: { ...bossEnemyBase.stats, hp: 200, maxHp: 1000 },
};
const healPickEnemy = pickEnemySkill(lowHpBoss, BOSS_LATE, () => 0.99);
assert(
  healPickEnemy.id === "enemy_regenerate",
  "enemy HP < 30% prefers regenerate"
);

const lowHpBossRegenCd: BattleEntity = {
  ...lowHpBoss,
  skillCooldowns: { enemy_regenerate: 3 },
};
const noHealPick = pickEnemySkill(lowHpBossRegenCd, BOSS_LATE, () => 0.5);
assert(
  noHealPick.id !== "enemy_regenerate",
  "regenerate not forced when on cooldown"
);

console.log("\n=== Validation: Battle Integration ===");
const battleLoadout = {
  equippedSlots: ["active_power_slash", "cc_shield_bash"],
  battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 },
};
const battleUnlocked = [
  "active_power_slash",
  "cc_shield_bash",
  "passive_guardian_aura",
];

const highLevelPlayer: BattleEntity = {
  id: "player",
  side: "player",
  name: "Player",
  stats: { ...DEFAULT_PLAYER_STATS, level: 15, mp: 200 },
  actionGauge: 100,
  statusEffects: [],
  skillCooldowns: {},
};

const autoPick = pickSkillForTurn(
  highLevelPlayer,
  battleLoadout,
  {},
  battleUnlocked
);
assert(
  autoPick.id === "active_power_slash",
  "auto picker uses slot-order rotation"
);

const manualBattleState = withReadyActor(
  createBattleState(1, {
    autoBattle: false,
    playerStats: DEFAULT_PLAYER_STATS,
    playerLoadout: battleLoadout,
    playerUnlockedSkillIds: battleUnlocked,
  }),
  "player"
);
assert(
  resolveActionChoice(manualBattleState, "player") === null,
  "manual mode waits for player input"
);

const bossBattle = withReadyActor(createBattleState(50), "enemy_floor_50");
const enemyAction = resolveActionChoice(bossBattle, "enemy_floor_50");
assert(
  enemyAction !== null && enemyAction.skillId.startsWith("enemy_"),
  "enemy turn executes enemy skill"
);

const battleState = createBattleState(1, {
  playerUnlockedSkillIds: ["active_power_slash"],
});
assert(
  battleState.playerLoadout.equippedSlots.includes("active_power_slash"),
  "battle state has default loadout from unlocks"
);

runBalanceCheck(assert);

console.log("\n=== Validation: Status On Hit ===");
const player = battleState.entities.find((e) => e.side === "player")!;
const enemy = battleState.entities.find((e) => e.side === "enemy")!;
const alwaysProc = applyStatusOnHit(
  { ...player, stats: { ...player.stats, statusChance: 1 } },
  enemy,
  () => 0
);
assert(alwaysProc.events.length > 0, "status proc generates event");
assert(
  alwaysProc.statusEffects.some((e) =>
    ["poison", "bleed", "stun", "freeze"].includes(e.type)
  ),
  "status effect applied"
);

console.log("\n=== Validation: Battle Advance ===");
const advance = advanceBattleStep(battleState, { rng: () => 0.5 });
assert(advance.payload !== undefined, "battle advance produces payload");
assert(advance.state.turnNumber >= 1, "battle state valid after advance");

console.log("\n=== Validation: Target Entity ===");
try {
  validateTargetEntity(["enemy_floor_1"], "enemy_floor_1");
  assert(true, "valid target passes");
} catch {
  assert(false, "valid target passes");
}

try {
  validateTargetEntity(["enemy_floor_1"], "invalid");
  assert(false, "invalid target throws");
} catch (err) {
  assert(
    err instanceof BattleValidationError && err.code === "INVALID_TARGET",
    "invalid target throws INVALID_TARGET"
  );
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
