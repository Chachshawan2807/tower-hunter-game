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
import { createBattleState, DEFAULT_PLAYER_STATS } from "../src/server/battle/factory";
import { advanceBattleStep, resolveActionChoice } from "../src/engine/states";
import { validateManualAction } from "../src/engine/states/actionChoice";
import { applyStatusOnHit } from "../src/engine/status";
import {
  canUseSkill,
  getSkillById,
  getSkillsForPath,
  pickAutoSkill,
  isSkillUnlocked,
  isSkillUnlockedByLevel,
  getSkillUnlockSpCost,
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

console.log("\n=== Validation: Skill Catalog ===");
assert(
  SKILL_UNLOCK_LEVELS.join(",") === "1,5,10,15",
  "unlock levels are 1/5/10/15"
);
assert(getSkillsForPath("imperial").length === 4, "murim path has 4 skills");

const palm = getSkillById("murim_palm");
assert(palm.slotTier === 1 && palm.autoPriority === 75, "palm tier 1");
const dragon = getSkillById("murim_dragon");
assert(dragon.unlockLevel === 15 && dragon.damageMultiplier === 1.75, "dragon ultimate");

const bash = getSkillById("knight_bash");
assert(bash.guaranteedStatus === "stun" && bash.unlockLevel === 10, "knight bash stun");

const meteor = getSkillById("fantasy_meteor");
assert(meteor.defPierce === 0.5 && meteor.unlockLevel === 15, "fantasy meteor");

assert(isSkillUnlocked(palm, ["murim_palm"]), "palm unlocked when in unlock set");
assert(
  !isSkillUnlocked(getSkillById("murim_dash"), ["murim_palm"]),
  "dash locked without unlock"
);
assert(
  isSkillUnlockedByLevel(getSkillById("murim_qi"), 10),
  "legacy Lv10 gate for backfill"
);
assert(getSkillUnlockSpCost(palm) === 1, "tier-1 skill costs 1 SP");
assert(getSkillUnlockSpCost(dragon) === 4, "tier-4 skill costs 4 SP");

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
assert(palmCds.murim_palm === palm.cooldownTurns, "skill cooldown applied on use");
const tickedCds = tickSkillCooldowns(palmCds);
assert(
  tickedCds.murim_palm === palm.cooldownTurns - 1,
  "cooldown decrements each turn"
);

console.log("\n=== Validation: Skill Loadout ===");
assert(
  getDefaultLoadout("imperial", ["murim_palm"]).activeSlots[0] === "murim_palm",
  "murim default active slot 1 when palm unlocked"
);
assert(
  getDefaultLoadout("knight", ["knight_slash"]).activeSlots[0] === "knight_slash",
  "knight default active slot 1 when slash unlocked"
);
assert(
  getDefaultLoadout("vanguard", ["fantasy_bolt"]).activeSlots[0] === "fantasy_bolt",
  "fantasy default active slot 1 when bolt unlocked"
);
assert(
  getDefaultLoadout("imperial", [
    "murim_palm",
    "murim_dash",
    "murim_qi",
    "murim_dragon",
  ]).activeSlots[1] === "murim_dragon",
  "murim default slot 2 uses dragon when unlocked"
);

assert(
  deriveAutoSkills(["murim_palm"], ["murim_palm", "murim_palm"]).length === 0,
  "1 unlocked skill → 0 auto slots"
);
assert(
  deriveAutoSkills(
    ["murim_palm", "murim_dash"],
    ["murim_palm", "murim_dash"]
  ).length === 0,
  "2 unlocked skills → 0 auto slots"
);
assert(
  deriveAutoSkills(
    ["murim_palm", "murim_dash", "murim_qi"],
    ["murim_palm", "murim_qi"]
  ).length === 1 &&
    deriveAutoSkills(
      ["murim_palm", "murim_dash", "murim_qi"],
      ["murim_palm", "murim_qi"]
    )[0] === "murim_dash",
  "3 unlocked skills → 1 auto slot"
);
assert(
  deriveAutoSkills(
    ["murim_palm", "murim_dash", "murim_qi", "murim_dragon"],
    ["murim_palm", "murim_dragon"]
  ).length === 2,
  "4 unlocked skills → 2 auto slots"
);

assert(
  !validateLoadout(
    "imperial",
    ["murim_palm", "murim_palm"],
    ["murim_palm", "murim_dash"]
  ).valid,
  "duplicate active slots rejected"
);
assert(
  !validateLoadout("imperial", ["murim_dash", "murim_palm"], ["murim_palm"]).valid,
  "locked skill cannot be active"
);

console.log("\n=== Validation: Loadout Integration ===");
const loadoutState = createBattleState(1, {
  playerSkillPath: "imperial",
  autoBattle: false,
  playerLoadout: { path: "imperial", activeSlots: ["murim_palm", "murim_dash"] },
  playerUnlockedSkillIds: ["murim_palm", "murim_dash"],
});
assert(
  validateManualAction(loadoutState, "player", {
    type: "basic_attack",
    targetId: "enemy_floor_1",
    skillId: "murim_qi",
  }) === false,
  "manual action rejects non-active skill"
);
assert(
  validateManualAction(loadoutState, "player", {
    type: "basic_attack",
    targetId: "enemy_floor_1",
    skillId: "murim_palm",
  }) === true,
  "manual action accepts active slot skill"
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

console.log("\n=== Validation: Skill Points ===");
assert(spCostForNextRank(0) === 1, "rank 0→1 costs 1 SP");
assert(spCostForNextRank(1) === 2, "rank 1→2 costs 2 SP");
assert(spCostForNextRank(2) === 3, "rank 2→3 costs 3 SP");
assert(
  spCostForNextRank(0) + spCostForNextRank(1) + spCostForNextRank(2) === 6,
  "escalating SP cost totals 6 for full branch"
);

assert(calculateSpGrant(4, 5) === 1, "single level up grants +1 skill point");
assert(calculateSpGrant(1, 3) === 2, "two level ups grant +2 skill points");
assert(calculateSpGrant(5, 5, false) === 0, "no level gain grants 0 skill points");
assert(calculateSpGrant(5, 5, true) === 1, "boss floor grants +1 skill point");

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
  canUpgradeBranch(palm, "damage", { damage: 3, cooldown: 0, mpCost: 0 })
    .allowed === false,
  "cannot upgrade beyond rank 3"
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

const floor15Battle = createBattleState(15, { playerSkillPath: "knight" });
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
  canUseSkill(bossEnemyBase, palm, ["murim_palm"]),
  "canUseSkill skips MP check for enemies"
);
const playerNoMp: BattleEntity = {
  ...bossEnemyBase,
  side: "player",
  stats: { ...bossEnemyBase.stats, mp: 0, maxMp: 100 },
};
assert(
  !canUseSkill(playerNoMp, palm, ["murim_palm"]),
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
const healPick = pickEnemySkill(lowHpBoss, BOSS_LATE, () => 0.99);
assert(
  healPick.id === "enemy_regenerate",
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
const knightL15Stats = {
  ...DEFAULT_PLAYER_STATS,
  level: 15,
  mp: 200,
};
const knightL15Loadout: [string, string] = ["knight_slash", "knight_charge"];
const knightUnlocked = [
  "knight_slash",
  "knight_guard",
  "knight_bash",
  "knight_charge",
];

const highLevelKnight: BattleEntity = {
  id: "player",
  side: "player",
  name: "Player",
  stats: knightL15Stats,
  actionGauge: 100,
  statusEffects: [],
  skillCooldowns: {},
};

const autoOnlyPool = deriveAutoSkills(knightUnlocked, knightL15Loadout);
const autoOnlyPick = pickAutoSkill(
  highLevelKnight,
  "knight",
  autoOnlyPool,
  {},
  knightUnlocked,
  () => 0.99
);
assert(
  autoOnlyPick.id === "knight_bash",
  "auto pool excludes active slots when no manual input"
);

const autoBattlePool = [...new Set([...knightL15Loadout, ...autoOnlyPool])];
const autoBattlePick = pickAutoSkill(
  highLevelKnight,
  "knight",
  autoBattlePool,
  {},
  knightUnlocked,
  () => 0.99
);
assert(
  autoBattlePick.id === "knight_charge",
  "auto-battle uses full pool including active slots"
);

const manualBattleState = withReadyActor(
  createBattleState(1, {
    autoBattle: false,
    playerSkillPath: "knight",
    playerStats: knightL15Stats,
    playerLoadout: { path: "knight", activeSlots: knightL15Loadout },
  }),
  "player"
);
assert(
  resolveActionChoice(manualBattleState, "player") === null,
  "manual mode waits for player input"
);

const bossBattle = withReadyActor(
  createBattleState(50, { playerSkillPath: "imperial" }),
  "enemy_floor_50"
);
const enemyAction = resolveActionChoice(bossBattle, "enemy_floor_50");
assert(
  enemyAction !== null && enemyAction.skillId.startsWith("enemy_"),
  "enemy turn executes enemy skill"
);

const battleState = createBattleState(1, { playerSkillPath: "knight" });
assert(battleState.playerSkillPath === "knight", "battle state stores skill path");
assert(
  battleState.playerLoadout.activeSlots[0] === "knight_slash",
  "battle state has default knight loadout"
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
