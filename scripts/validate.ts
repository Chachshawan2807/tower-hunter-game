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
  updated_at: new Date(),
});

assert(mapped.level === 5, "level maps correctly");
assert(mapped.atk === 75, "atk maps correctly");
assert(mapped.speed === 110, "speed maps correctly");
assert(mapped.exp === 120, "exp maps correctly");

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
