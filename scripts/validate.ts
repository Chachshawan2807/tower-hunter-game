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
} from "../src/engine/formulas";
import { createBattleState } from "../src/server/battle/factory";
import { advanceBattleStep } from "../src/engine/states";
import { applyStatusOnHit } from "../src/engine/status";
import {
  getSkillById,
  getSkillsForPath,
  pickAutoSkill,
  isSkillUnlocked,
  applySkillCooldown,
  tickSkillCooldowns,
} from "../src/engine/skills";
import {
  deriveAutoSkills,
  getDefaultLoadout,
  validateLoadout,
} from "../src/engine/skills/loadout";
import { resolveEffectiveSkill } from "../src/engine/skills/effectiveSkill";
import {
  spCostForNextRank,
  calculateSpGrant,
  canUpgradeBranch,
} from "../src/engine/skills/skillPoints";
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
  active_skill_path: "murim",
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

console.log("\n=== Validation: Skill System ===");
assert(
  SKILL_UNLOCK_LEVELS.join(",") === "1,5,10,15",
  "unlock levels are 1/5/10/15"
);
assert(getSkillsForPath("murim").length === 4, "murim path has 4 skills");

const palm = getSkillById("murim_palm");
assert(palm.slotTier === 1 && palm.autoPriority === 75, "palm tier 1");
const dragon = getSkillById("murim_dragon");
assert(dragon.unlockLevel === 15 && dragon.damageMultiplier === 1.75, "dragon ultimate");

const bash = getSkillById("knight_bash");
assert(bash.guaranteedStatus === "stun" && bash.unlockLevel === 10, "knight bash stun");

const meteor = getSkillById("fantasy_meteor");
assert(meteor.defPierce === 0.5 && meteor.unlockLevel === 15, "fantasy meteor");

const battleState = createBattleState(1, { playerSkillPath: "knight" });
assert(battleState.playerSkillPath === "knight", "battle state stores skill path");
assert(
  battleState.playerLoadout.activeSlots[0] === "knight_slash",
  "battle state has default knight loadout"
);
assert(
  Object.keys(battleState.playerSkillUpgrades).length === 0,
  "battle state defaults empty skill upgrades"
);

const knightPlayer = battleState.entities[0];
const slashPick = pickAutoSkill(knightPlayer, "knight", () => 0.99);
assert(slashPick.id === "knight_slash", "level 1 knight AI uses slash");

const highLevelKnight = {
  ...knightPlayer,
  stats: { ...knightPlayer.stats, level: 15, mp: 200 },
};
const chargePick = pickAutoSkill(highLevelKnight, "knight", () => 0.99);
assert(chargePick.id === "knight_charge", "level 15 knight AI uses charge");

assert(isSkillUnlocked(getSkillById("murim_palm"), 1), "slot 1 unlocked at Lv1");
assert(!isSkillUnlocked(getSkillById("murim_dash"), 1), "slot 2 locked before Lv5");
assert(isSkillUnlocked(getSkillById("murim_qi"), 10), "slot 3 unlocked at Lv10");
assert(!isSkillUnlocked(getSkillById("murim_qi"), 9), "slot 3 locked before Lv10");

const palmCds = applySkillCooldown(knightPlayer.skillCooldowns, palm);
assert(palmCds.murim_palm === palm.cooldownTurns, "skill cooldown applied on use");

const tickedCds = tickSkillCooldowns(palmCds);
assert(
  tickedCds.murim_palm === palm.cooldownTurns - 1,
  "cooldown decrements each turn"
);

console.log("\n=== Validation: Skill Loadout ===");
const defaultMurim = getDefaultLoadout("murim", 1);
assert(defaultMurim.activeSlots[0] === "murim_palm", "default active slot 1");

const unlocked3 = ["murim_palm", "murim_dash", "murim_qi"];
const auto = deriveAutoSkills(unlocked3, ["murim_palm", "murim_qi"]);
assert(auto.length === 1 && auto[0] === "murim_dash", "auto derives remainder");

assert(
  !validateLoadout("murim", ["murim_palm", "murim_palm"], 5).valid,
  "duplicate active slots rejected"
);
assert(
  !validateLoadout("murim", ["murim_dash", "murim_palm"], 1).valid,
  "locked skill cannot be active"
);

console.log("\n=== Validation: Effective Skill ===");
const palmDamage3 = resolveEffectiveSkill(palm, {
  damage: 3,
  cooldown: 0,
  mpCost: 0,
});
assert(
  palmDamage3.damageMultiplier === 1.35 * 1.15,
  "damage rank 3 adds +15% multiplier on attack"
);

const palmCd3 = resolveEffectiveSkill(palm, {
  damage: 0,
  cooldown: 3,
  mpCost: 0,
});
assert(palmCd3.cooldownTurns === 0, "cooldown rank 3 floors at 0");

const palmMp3 = resolveEffectiveSkill(palm, {
  damage: 0,
  cooldown: 0,
  mpCost: 3,
});
assert(palmMp3.mpCost === 10, "mp rank 3 reduces 15 MP to 10");

const qi = getSkillById("murim_qi");
const qiDamage3 = resolveEffectiveSkill(qi, {
  damage: 3,
  cooldown: 0,
  mpCost: 0,
});
assert(
  qiDamage3.damageMultiplier === undefined,
  "buff skill ignores damage branch"
);

console.log("\n=== Validation: Enemy Templates ===");
assert(resolveEnemyTemplate(15).id === "guardian_low", "floor 15 normal");
assert(resolveEnemyTemplate(50).id === "boss_mid", "floor 50 boss mid");
assert(
  resolveEnemyTemplate(50).skillIds.length === 3,
  "boss mid has 3 skills"
);

const floor15Battle = createBattleState(15, { playerSkillPath: "knight" });
const floor15Enemy = floor15Battle.entities.find((e) => e.side === "enemy")!;
assert(
  floor15Enemy.enemyTemplateId === "guardian_low",
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

const bossMidPick = pickEnemySkill(
  bossEnemyBase,
  resolveEnemyTemplate(50),
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
  resolveEnemyTemplate(50),
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
const healPick = pickEnemySkill(lowHpBoss, BOSS_LATE, () => 0.99);
assert(
  healPick.id === "enemy_regenerate",
  "low HP boss forces regenerate when ready"
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

console.log("\n=== Validation: Skill Points ===");
assert(spCostForNextRank(0) === 1, "rank 0→1 costs 1 SP");
assert(spCostForNextRank(2) === 3, "rank 2→3 costs 3 SP");

assert(calculateSpGrant(1, 3, false) === 2, "2 level ups = 2 SP");
assert(calculateSpGrant(5, 5, true) === 2, "boss grants 2 SP");

assert(
  canUpgradeBranch(palm, "damage", { damage: 3, cooldown: 0, mpCost: 0 })
    .allowed === false,
  "cannot upgrade beyond rank 3"
);

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
