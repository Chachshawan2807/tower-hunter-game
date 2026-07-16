# Skill System Implementation Plan

> **Status:** Implemented. Path IDs renamed to `imperial`/`knight`/`vanguard` — see `005_imperial_skill_paths.sql`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full redesigned skill system — 4 skills/path, 2-slot loadout, Skill Points upgrades, enemy skills, and updated UI — per `docs/superpowers/specs/2026-07-14-skill-system-design.md`.

**Architecture:** Unified Skill Runtime in the pure TypeScript engine; server persists loadout/upgrades/SP with row locks; React UI reads effective stats from API. Extend `scripts/validate.ts` for TDD (project has no pytest).

**Tech Stack:** TypeScript, React 19, Hono, PostgreSQL (`pg`), Vite, existing `scripts/validate.ts` test runner.

**Spec:** `docs/superpowers/specs/2026-07-14-skill-system-design.md`

---

## File Map

### Create

| File | Responsibility |
|------|----------------|
| `src/server/db/schema/004_skill_system.sql` | `skill_points`, `player_skill_loadout`, `player_skill_upgrades` |
| `src/engine/skills/loadout.ts` | Loadout validation, auto derivation, defaults |
| `src/engine/skills/effectiveSkill.ts` | Upgrade rank → effective `SkillDefinition` |
| `src/engine/skills/skillPoints.ts` | SP cost table, grant calculation, upgrade apply |
| `src/engine/skills/enemy.ts` | 8 enemy skill definitions |
| `src/engine/skills/enemyTemplates.ts` | Floor → `EnemyTemplate` |
| `src/engine/skills/enemyAi.ts` | `pickEnemySkill()` |
| `src/server/db/skillLoadout.ts` | Loadout CRUD |
| `src/server/db/skillUpgrades.ts` | Upgrade CRUD + SP deduct |
| `src/engine/status/defDebuff.ts` | Merge def_debuff on hit (for `enemy_armor_break`) |
| `src/components/menu/SkillUpgradePanel.tsx` | Upgrade branch UI |
| `src/components/menu/SkillLoadoutPanel.tsx` | Active slot picker UI |

### Modify

| File | Changes |
|------|---------|
| `src/engine/skills/types.ts` | `slotTier`, `autoPriority`, `SkillUpgradeRanks`, unlock levels |
| `src/engine/skills/murim.ts` | 4 skills, tier fields, `murim_dragon` |
| `src/engine/skills/knight.ts` | 4 skills, `knight_bash`, charge → tier 4 |
| `src/engine/skills/fantasy.ts` | 4 skills, `fantasy_meteor`, heal → Lv10 |
| `src/engine/skills/basicAttack.ts` | Add `slotTier: 0` or omit with type adjustment |
| `src/engine/skills/catalog.ts` | Register enemy skills |
| `src/engine/skills/availability.ts` | Enemy skips MP; accept effective skill |
| `src/engine/skills/resolver.ts` | Loadout-aware `pickAutoSkill` |
| `src/engine/skills/index.ts` | Re-exports |
| `src/engine/states/battleState.ts` | `playerLoadout`, `playerSkillUpgrades` on state |
| `src/engine/states/actionChoice.ts` | Active-only manual; enemy AI branch |
| `src/engine/states/skillExecution.ts` | Use `resolveEffectiveSkill` |
| `src/engine/status/applyOnHit.ts` | Support `def_debuff` guaranteed status |
| `src/server/battle/factory.ts` | Enemy template, loadout on state |
| `src/server/db/playerStats.ts` | `skill_points` column |
| `src/server/battle/rewards.ts` | Grant SP on level-up + boss |
| `src/server/api/routes/skills.ts` | loadout, progression, upgrade routes |
| `src/utils/api.ts` | New client methods |
| `src/utils/i18n.ts` | New skill strings + enemy strings |
| `src/components/menu/SkillMenu.tsx` | Loadout + upgrade panels |
| `src/components/battle/BattleArena.tsx` | 2 active buttons, timeout, auto info |
| `src/hooks/useBattle.ts` | 8s manual timeout |
| `scripts/validate.ts` | All new test sections |
| `scripts/db-check.ts` | Loadout/upgrade table checks |

---

## Phase P1: Schema, Types, Loadout, 4 Skills/Path

### Task 1: Extend skill types and unlock levels

**Files:**
- Modify: `src/engine/skills/types.ts`
- Modify: `src/engine/skills/basicAttack.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Add failing validation for 4 unlock levels**

Add to `scripts/validate.ts` in Skill System section (replace old assertions):

```typescript
import { SKILL_UNLOCK_LEVELS } from "../src/engine/skills/types";

assert(
  SKILL_UNLOCK_LEVELS.join(",") === "1,5,10,15",
  "unlock levels are 1/5/10/15"
);
assert(getSkillsForPath("murim").length === 4, "murim path has 4 skills");
```

- [ ] **Step 2: Run validate — expect FAIL**

```bash
npm run validate
```
Expected: FAIL on unlock levels or skill count.

- [ ] **Step 3: Update types**

In `src/engine/skills/types.ts`:

```typescript
export type SkillSlotTier = 1 | 2 | 3 | 4;

export interface SkillUpgradeRanks {
  damage: 0 | 1 | 2 | 3;
  cooldown: 0 | 1 | 2 | 3;
  mpCost: 0 | 1 | 2 | 3;
}

export type SkillPath = import("../types").SkillPath;

// In SkillDefinition add:
  slotTier: SkillSlotTier;
  autoPriority: number;
```

Change:
```typescript
export const SKILL_UNLOCK_LEVELS = [1, 5, 10, 15] as const;
```

In `basicAttack.ts` add `slotTier: 1` and `autoPriority: 0` (or make `slotTier` optional for basic only via `slotTier?: SkillSlotTier`).

- [ ] **Step 4: Run validate — still FAIL on skill count**

- [ ] **Step 5: Commit**

```bash
git add src/engine/skills/types.ts src/engine/skills/basicAttack.ts scripts/validate.ts
git commit -m "feat(skills): extend types for 4-tier unlock system"
```

---

### Task 2: Player skill catalog — 4 skills per path

**Files:**
- Modify: `src/engine/skills/murim.ts`
- Modify: `src/engine/skills/knight.ts`
- Modify: `src/engine/skills/fantasy.ts`
- Modify: `src/utils/i18n.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Add catalog assertions**

```typescript
const palm = getSkillById("murim_palm");
assert(palm.slotTier === 1 && palm.autoPriority === 75, "palm tier 1");
const dragon = getSkillById("murim_dragon");
assert(dragon.unlockLevel === 15 && dragon.damageMultiplier === 1.75, "dragon ultimate");

const bash = getSkillById("knight_bash");
assert(bash.guaranteedStatus === "stun" && bash.unlockLevel === 10, "knight bash stun");

const meteor = getSkillById("fantasy_meteor");
assert(meteor.defPierce === 0.5 && meteor.unlockLevel === 15, "fantasy meteor");

assert(isSkillUnlocked(getSkillById("murim_qi"), 10), "slot 3 unlocked at Lv10");
assert(!isSkillUnlocked(getSkillById("murim_qi"), 9), "slot 3 locked before Lv10");
```

- [ ] **Step 2: Run validate — FAIL (skills missing)**

- [ ] **Step 3: Update murim.ts**

```typescript
export const MURIM_IRON_PALM: SkillDefinition = {
  id: "murim_palm",
  path: "murim",
  stringId: "skills.murim.palm",
  icon: "👊",
  mpCost: 15,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  cooldownTurns: 2,
  damageMultiplier: 1.35,
  guaranteedStatus: "bleed",
  statusProcBonus: 0.15,
  slotTier: 1,
  autoPriority: 75,
};

export const MURIM_SHADOW_STEP: SkillDefinition = {
  // ...existing fields...
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 55,
};

export const MURIM_INNER_QI: SkillDefinition = {
  // ...existing fields...
  unlockLevel: SKILL_UNLOCK_LEVELS[2], // was [2] index — now Lv10
  slotTier: 3,
  autoPriority: 35,
};

export const MURIM_DRAGON_FIST: SkillDefinition = {
  id: "murim_dragon",
  path: "murim",
  stringId: "skills.murim.dragon",
  icon: "🐉",
  mpCost: 30,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  cooldownTurns: 4,
  damageMultiplier: 1.75,
  guaranteedStatus: "bleed",
  statusProcBonus: 0.25,
  slotTier: 4,
  autoPriority: 90,
};

export const MURIM_SKILLS = [
  MURIM_IRON_PALM,
  MURIM_SHADOW_STEP,
  MURIM_INNER_QI,
  MURIM_DRAGON_FIST,
];
```

- [ ] **Step 4: Update knight.ts**

- `knight_slash`: `damageMultiplier: 1.20`, `slotTier: 1`, `autoPriority: 70`
- `knight_guard`: `slotTier: 2`, `autoPriority: 30`
- Add `KNIGHT_SHIELD_BASH` at Lv10 (see spec §6.2)
- `knight_charge`: move to Lv15, `damageMultiplier: 1.70`, `slotTier: 4`, `autoPriority: 90`

- [ ] **Step 5: Update fantasy.ts**

- `fantasy_heal`: `unlockLevel: SKILL_UNLOCK_LEVELS[2]`, `slotTier: 3`
- Add `FANTASY_METEOR` at Lv15 (see spec §6.3)
- Add `slotTier` + `autoPriority` to bolt/freeze

- [ ] **Step 6: Add i18n keys** in `src/utils/i18n.ts` for dragon, bash, meteor (EN + TH per spec §4.7)

- [ ] **Step 7: Run validate — PASS skill count assertions**

```bash
npm run validate
```

- [ ] **Step 8: Commit**

```bash
git commit -am "feat(skills): add 4th skill per path and rebalance tiers"
```

---

### Task 3: Loadout engine module

**Files:**
- Create: `src/engine/skills/loadout.ts`
- Modify: `src/engine/skills/index.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Add failing loadout tests**

```typescript
import {
  deriveAutoSkills,
  getDefaultLoadout,
  validateLoadout,
} from "../src/engine/skills/loadout";

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
```

- [ ] **Step 2: Run validate — FAIL (module missing)**

- [ ] **Step 3: Implement `src/engine/skills/loadout.ts`**

```typescript
import type { SkillPath } from "../types";
import { getSkillsForPath } from "./catalog";
import { isSkillUnlocked } from "./availability";

export interface SkillLoadout {
  path: SkillPath;
  activeSlots: [string, string];
}

const DEFAULT_ACTIVE: Record<SkillPath, [string, string]> = {
  murim: ["murim_palm", "murim_dragon"],
  knight: ["knight_slash", "knight_charge"],
  fantasy: ["fantasy_bolt", "fantasy_meteor"],
};

export function getDefaultLoadout(
  path: SkillPath,
  playerLevel: number
): SkillLoadout {
  const skills = getSkillsForPath(path);
  const unlocked = skills.filter((s) => isSkillUnlocked(s, playerLevel));
  const preferred = DEFAULT_ACTIVE[path];
  const slot1 = unlocked.find((s) => s.id === preferred[0])?.id ?? unlocked[0]?.id ?? preferred[0];
  const slot2Candidate = unlocked.find((s) => s.id === preferred[1])?.id
    ?? unlocked.find((s) => s.id !== slot1)?.id
    ?? slot1;
  return { path, activeSlots: [slot1, slot2Candidate] };
}

export function deriveAutoSkills(
  unlockedIds: string[],
  activeSlots: [string, string]
): string[] {
  const activeSet = new Set(activeSlots);
  return unlockedIds.filter((id) => !activeSet.has(id));
}

export function validateLoadout(
  path: SkillPath,
  activeSlots: [string, string],
  playerLevel: number
): { valid: boolean; error?: string } {
  if (activeSlots[0] === activeSlots[1]) {
    return { valid: false, error: "DUPLICATE_SLOT" };
  }
  const pathSkillIds = new Set(getSkillsForPath(path).map((s) => s.id));
  for (const id of activeSlots) {
    if (!pathSkillIds.has(id)) return { valid: false, error: "INVALID_SKILL" };
    const skill = getSkillsForPath(path).find((s) => s.id === id)!;
    if (!isSkillUnlocked(skill, playerLevel)) {
      return { valid: false, error: "SKILL_LOCKED" };
    }
  }
  return { valid: true };
}
```

- [ ] **Step 4: Export from `index.ts`**

- [ ] **Step 5: Run validate — PASS**

- [ ] **Step 6: Commit**

```bash
git add src/engine/skills/loadout.ts src/engine/skills/index.ts scripts/validate.ts
git commit -m "feat(skills): add loadout validation and auto derivation"
```

---

### Task 4: Effective skill resolver

**Files:**
- Create: `src/engine/skills/effectiveSkill.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Add failing tests**

```typescript
import { resolveEffectiveSkill } from "../src/engine/skills/effectiveSkill";

const upgraded = resolveEffectiveSkill(palm, { damage: 3, cooldown: 0, mpCost: 0 });
assert(
  Math.abs(upgraded.damageMultiplier! - 1.35 * 1.15) < 0.001,
  "damage rank 3 adds 15%"
);

const cdTest = resolveEffectiveSkill(palm, { damage: 0, cooldown: 3, mpCost: 0 });
assert(cdTest.cooldownTurns === 0, "CD rank 3 reduces CD to 0");

const mpTest = resolveEffectiveSkill(palm, { damage: 0, cooldown: 0, mpCost: 3 });
assert(mpTest.mpCost === 10, "MP rank 3 reduces 15 MP by 30% to 10");
```

- [ ] **Step 2: Run validate — FAIL**

- [ ] **Step 3: Implement**

```typescript
import type { SkillDefinition, SkillUpgradeRanks } from "./types";

const EMPTY_RANKS: SkillUpgradeRanks = { damage: 0, cooldown: 0, mpCost: 0 };

export function resolveEffectiveSkill(
  skill: SkillDefinition,
  upgrades: SkillUpgradeRanks | undefined
): SkillDefinition {
  const ranks = upgrades ?? EMPTY_RANKS;
  if (skill.path === "basic" || skill.path === "enemy") return skill;

  return {
    ...skill,
    damageMultiplier:
      skill.damageMultiplier && skill.kind === "attack"
        ? skill.damageMultiplier * (1 + ranks.damage * 0.05)
        : skill.damageMultiplier,
    cooldownTurns: Math.max(0, skill.cooldownTurns - ranks.cooldown),
    mpCost:
      skill.mpCost > 0
        ? Math.max(1, Math.floor(skill.mpCost * (1 - ranks.mpCost * 0.1)))
        : skill.mpCost,
  };
}
```

- [ ] **Step 4: Run validate — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(skills): add effective skill resolver for upgrades"
```

---

### Task 5: Battle state + loadout integration

**Files:**
- Modify: `src/engine/states/battleState.ts`
- Modify: `src/server/battle/factory.ts`
- Modify: `src/engine/states/skillExecution.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Extend BattleState**

```typescript
import type { SkillLoadout } from "../skills/loadout";
import type { SkillUpgradeRanks } from "../skills/types";

export interface BattleState {
  // ...existing
  playerLoadout: SkillLoadout;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
}
```

Update `cloneBattleState` to shallow-copy `playerSkillUpgrades`.

- [ ] **Step 2: Update factory**

```typescript
import { getDefaultLoadout } from "../../engine/skills/loadout";

// In createBattleState options:
playerLoadout?: SkillLoadout;
playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;

const loadout = options?.playerLoadout
  ?? getDefaultLoadout(options?.playerSkillPath ?? "murim", playerStats.level);

return {
  // ...
  playerLoadout: loadout,
  playerSkillUpgrades: options?.playerSkillUpgrades ?? {},
};
```

- [ ] **Step 3: Use effective skill in skillExecution**

At top of `processExecution`, after `getSkillById`:

```typescript
import { resolveEffectiveSkill } from "../skills/effectiveSkill";

const upgrades = state.playerSkillUpgrades[skill.id];
skill = resolveEffectiveSkill(skill, upgrades);
```

- [ ] **Step 4: Fix all `createBattleState` call sites** (validate.ts, tests) — add default loadout via factory.

- [ ] **Step 5: Run validate + typecheck**

```bash
npm run validate && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(battle): wire loadout and upgrades into battle state"
```

---

### Task 6: DB schema + loadout persistence

**Files:**
- Create: `src/server/db/schema/004_skill_system.sql`
- Create: `src/server/db/skillLoadout.ts`
- Modify: `src/server/db/index.ts`
- Modify: `src/server/db/playerStats.ts`
- Modify: `scripts/db-check.ts`

- [ ] **Step 1: Write migration `004_skill_system.sql`** (copy from spec §2.3)

- [ ] **Step 2: Implement `skillLoadout.ts`**

```typescript
export async function getPlayerLoadout(
  pool: DbPool,
  userId: string,
  path: SkillPath
): Promise<SkillLoadout | null> { /* SELECT */ }

export async function upsertPlayerLoadout(
  pool: DbPool,
  userId: string,
  loadout: SkillLoadout
): Promise<SkillLoadout> { /* INSERT ON CONFLICT UPDATE */ }
```

- [ ] **Step 3: Add `skill_points` to `PlayerStatsRow` and SELECT columns**

- [ ] **Step 4: Extend `db-check.ts`** to verify tables exist

- [ ] **Step 5: Apply migration locally**

```bash
npm run db:check
```

- [ ] **Step 6: Commit**

```bash
git add src/server/db/schema/004_skill_system.sql src/server/db/skillLoadout.ts
git commit -m "feat(db): add skill loadout and skill_points schema"
```

---

### Task 7: Loadout API route

**Files:**
- Modify: `src/server/api/routes/skills.ts`
- Modify: `src/utils/api.ts`
- Modify: `src/server/battle/service.ts`

- [ ] **Step 1: Add PATCH `/:userId/loadout`**

```typescript
skillRoutes.patch("/:userId/loadout", async (c) => {
  const body = await c.req.json<{ path: SkillPath; activeSlots: [string, string] }>();
  const userId = c.req.param("userId");
  const stats = await getPlayerStats(c.get("db"), userId);
  const playerLevel = stats?.level ?? 1;
  const result = validateLoadout(body.path, body.activeSlots, playerLevel);
  if (!result.valid) {
    return c.json({ error: result.error, code: result.error }, 400);
  }
  const saved = await upsertPlayerLoadout(c.get("db"), userId, {
    path: body.path,
    activeSlots: body.activeSlots,
  });
  return c.json({ loadout: saved });
});
```

- [ ] **Step 2: On battle start in `service.ts`**, load loadout from DB or default.

- [ ] **Step 3: Add `api.patchSkillLoadout()` in `utils/api.ts`**

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(api): add skill loadout persistence endpoint"
```

---

**P1 checkpoint:**

```bash
npm run validate && npm run typecheck && npm run build
```

---

## Phase P2: Skill Points + Upgrade API/UI

### Task 8: Skill points engine module

**Files:**
- Create: `src/engine/skills/skillPoints.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Add failing tests**

```typescript
import {
  spCostForNextRank,
  calculateSpGrant,
  canUpgradeBranch,
} from "../src/engine/skills/skillPoints";

assert(spCostForNextRank(0) === 1, "rank 0→1 costs 1 SP");
assert(spCostForNextRank(2) === 3, "rank 2→3 costs 3 SP");

assert(calculateSpGrant(1, 3, false) === 2, "2 level ups = 2 SP");
assert(calculateSpGrant(5, 5, true) === 2, "boss grants 2 SP");

assert(
  canUpgradeBranch(palm, "damage", { damage: 3, cooldown: 0, mpCost: 0 }).allowed === false,
  "cannot upgrade beyond rank 3"
);
```

- [ ] **Step 2: Implement `skillPoints.ts`**

```typescript
export type UpgradeBranch = "damage" | "cooldown" | "mpCost";

export function spCostForNextRank(currentRank: number): number {
  return currentRank + 1; // 1, 2, 3
}

export function calculateSpGrant(
  oldLevel: number,
  newLevel: number,
  isBoss: boolean
): number {
  const levelDiff = Math.max(0, newLevel - oldLevel);
  return levelDiff + (isBoss ? 2 : 0);
}

export function canUpgradeBranch(
  skill: SkillDefinition,
  branch: UpgradeBranch,
  ranks: SkillUpgradeRanks
): { allowed: boolean; reason?: string } {
  if (branch === "damage" && skill.kind !== "attack") {
    return { allowed: false, reason: "NOT_ATTACK" };
  }
  if (ranks[branch] >= 3) return { allowed: false, reason: "MAX_RANK" };
  return { allowed: true };
}
```

- [ ] **Step 3: Run validate — PASS**

- [ ] **Step 4: Commit**

---

### Task 9: Upgrade DB + grant SP on battle win

**Files:**
- Create: `src/server/db/skillUpgrades.ts`
- Modify: `src/server/db/playerStats.ts`
- Modify: `src/server/battle/rewards.ts`

- [ ] **Step 1: Implement `skillUpgrades.ts`**

```typescript
export async function upgradeSkillBranch(
  pool: DbPool,
  userId: string,
  skillId: string,
  branch: UpgradeBranch
): Promise<{ ranks: SkillUpgradeRanks; skillPoints: number }> {
  return withTransaction(pool, async (client) => {
    // FOR UPDATE player_stats
    // validate SP, apply rank++, deduct spCostForNextRank
  });
}

export async function getPlayerUpgrades(
  pool: DbPool,
  userId: string
): Promise<Record<string, SkillUpgradeRanks>> { /* ... */ }
```

- [ ] **Step 2: Update `applyBattleWinProgress`**

Track `oldLevel` before update; after level calc:

```typescript
import { calculateSpGrant } from "../../engine/skills/skillPoints";
import { isBossFloor } from "../../engine/types";

const spGrant = calculateSpGrant(stats.level, newLevel, isBossFloor(floor));
// ADD to UPDATE: skill_points = skill_points + spGrant
```

- [ ] **Step 3: Commit**

---

### Task 10: Progression + upgrade API routes

**Files:**
- Modify: `src/server/api/routes/skills.ts`
- Modify: `src/utils/api.ts`

- [ ] **Step 1: GET `/:userId/progression`**

Returns `{ skillPoints, upgrades, skills: [...with effective stats] }`

- [ ] **Step 2: POST `/:userId/upgrade`**

```typescript
skillRoutes.post("/:userId/upgrade", async (c) => {
  const body = await c.req.json<{ skillId: string; branch: UpgradeBranch }>();
  const skill = getSkillById(body.skillId);
  if (skill.path === "basic" || skill.path === "enemy") {
    return c.json({ error: "Invalid skill", code: "INVALID_SKILL" }, 400);
  }
  const result = await upgradeSkillBranch(
    c.get("db"),
    c.req.param("userId"),
    body.skillId,
    body.branch
  );
  return c.json(result);
});
```

- [ ] **Step 3: Add client methods `getSkillProgression`, `upgradeSkill`**

- [ ] **Step 4: Commit**

---

### Task 11: Skill Menu — loadout + upgrade UI

**Files:**
- Create: `src/components/menu/SkillLoadoutPanel.tsx`
- Create: `src/components/menu/SkillUpgradePanel.tsx`
- Modify: `src/components/menu/SkillMenu.tsx`
- Modify: `src/styles/menus.css`

- [ ] **Step 1: `SkillLoadoutPanel`** — two `<select>` for active slots, auto preview text, calls `api.patchSkillLoadout` on change (debounce 500ms).

- [ ] **Step 2: `SkillUpgradePanel`** — three branch rows with star rating, SP cost, disabled states per spec §7.1.

- [ ] **Step 3: Refactor `SkillMenu.tsx`** to fetch `getSkillProgression`, show SP balance header, split layout.

- [ ] **Step 4: Manual smoke test** — open Skill menu, change loadout, spend SP.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): skill menu loadout and upgrade panels"
```

---

**P2 checkpoint:**

```bash
npm run validate && npm run typecheck && npm run build
```

---

## Phase P3: Enemy Catalog + AI

### Task 12: Enemy skill definitions

**Files:**
- Create: `src/engine/skills/enemy.ts`
- Create: `src/engine/status/defDebuff.ts`
- Modify: `src/engine/status/applyOnHit.ts`
- Modify: `src/engine/skills/catalog.ts`
- Modify: `src/utils/i18n.ts`

- [ ] **Step 1: Add `defDebuff.ts`** (mirror atk_debuff pattern from buff system)

- [ ] **Step 2: Extend `applyOnHit` for `def_debuff`**

```typescript
case "def_debuff":
  return mergeDefDebuff(effects, attacker.id);
```

- [ ] **Step 3: Create `enemy.ts`** with all 8 skills per spec §5.2 (`path: "enemy"`, `mpCost: 0`, `slotTier: 1`, `autoPriority: 50`)

`enemy_armor_break`:
```typescript
guaranteedStatus: "def_debuff",
selfStatus: undefined,
// OR apply via custom — use guaranteedStatus after applyOnHit extended
```

`enemy_enrage`:
```typescript
kind: "buff",
targetType: "self",
selfStatus: { type: "atk_buff", turns: 2, magnitude: 0.2 },
```

- [ ] **Step 4: Register in catalog** + export `ENEMY_SKILLS`

- [ ] **Step 5: Commit**

---

### Task 13: Enemy templates + factory

**Files:**
- Create: `src/engine/skills/enemyTemplates.ts`
- Modify: `src/engine/types.ts` (add `enemyTemplateId?` on `BattleEntity`)
- Modify: `src/server/battle/factory.ts`

- [ ] **Step 1: Implement `resolveEnemyTemplate(floor: number): EnemyTemplate`**

Logic per spec §5.3:
- Boss floor 10–30 → `boss_early`
- Boss 40–60 → `boss_mid`
- Boss 70–100 → `boss_late`
- Normal 1–30 → `guardian_low`, etc.

- [ ] **Step 2: Update `buildEnemyEntity`**

```typescript
const template = resolveEnemyTemplate(floor);
return {
  id: `enemy_floor_${floor}`,
  enemyTemplateId: template.id,
  name: template.nameKey, // resolve in UI via i18n
  // stats from scaleEnemyStatsForFloor
};
```

- [ ] **Step 3: Add validate tests**

```typescript
import { resolveEnemyTemplate } from "../src/engine/skills/enemyTemplates";

assert(resolveEnemyTemplate(15).id === "guardian_low", "floor 15 normal");
assert(resolveEnemyTemplate(50).id === "boss_mid", "floor 50 boss mid");
assert(resolveEnemyTemplate(50).skillIds.length === 3, "boss mid has 3 skills");
```

- [ ] **Step 4: Run validate — PASS**

- [ ] **Step 5: Commit**

---

### Task 14: Enemy AI + action choice

**Files:**
- Create: `src/engine/skills/enemyAi.ts`
- Modify: `src/engine/skills/availability.ts`
- Modify: `src/engine/states/actionChoice.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Enemy `canUseSkill` bypass**

```typescript
export function canUseSkill(entity, skill, playerLevel) {
  if (skill.id === "basic_attack") return true;
  if (entity.side === "enemy") {
    return !isSkillOnCooldown(entity, skill.id);
  }
  // player logic unchanged
}
```

- [ ] **Step 2: Implement `pickEnemySkill`** per spec §5.4 with HP < 30% heal override.

- [ ] **Step 3: Update `actionChoice.ts`**

```typescript
if (actor.side === "enemy") {
  const template = resolveEnemyTemplate(state.floor);
  const skill = pickEnemySkill(actor, template, Math.random);
  const targetId =
    skill.targetType === "self"
      ? actor.id
      : getOpponents(state, actor)[0]?.id ?? actor.id;
  return { type: "basic_attack", targetId, skillId: skill.id };
}
```

- [ ] **Step 4: Add validate tests** for enemy CD respect and regenerate preference.

- [ ] **Step 5: Run validate — PASS**

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(skills): enemy catalog, templates, and AI"
```

---

**P3 checkpoint:**

```bash
npm run validate && npm run typecheck && npm run build
```

---

## Phase P4: Battle UI + Loadout-Aware Player AI

### Task 15: Loadout-aware player auto AI

**Files:**
- Modify: `src/engine/skills/resolver.ts`
- Modify: `src/engine/states/actionChoice.ts`
- Test: `scripts/validate.ts`

- [ ] **Step 1: Refactor `pickAutoSkill` signature**

```typescript
export function pickAutoSkill(
  actor: BattleEntity,
  path: SkillPath,
  skillPool: string[], // skill ids allowed this turn
  upgrades: Record<string, SkillUpgradeRanks>,
  rng: () => number = Math.random
): SkillDefinition
```

Filter `skillPool` through `canUseSkill` with `resolveEffectiveSkill`.

- [ ] **Step 2: Update `actionChoice.ts` player branch**

```typescript
const { activeSlots } = state.playerLoadout;
const unlocked = getSkillsForPath(state.playerSkillPath)
  .filter(s => isSkillUnlocked(s, actor.stats.level))
  .map(s => s.id);

const autoIds = deriveAutoSkills(unlocked, activeSlots);
const fullPool = state.autoBattle
  ? [...new Set([...activeSlots, ...autoIds])]
  : autoIds;

// manual: validate skillId in activeSlots only
export function validateManualAction(...) {
  if (skillId !== "basic_attack" && !state.playerLoadout.activeSlots.includes(skillId)) {
    return false;
  }
}
```

- [ ] **Step 3: Update validate.ts** — replace `pickAutoSkill` tests with loadout context.

- [ ] **Step 4: Commit**

---

### Task 16: Battle Arena — 2 active buttons + timeout

**Files:**
- Modify: `src/components/battle/BattleArena.tsx`
- Modify: `src/hooks/useBattle.ts`
- Modify: `src/components/battle/TowerView.tsx`
- Modify: `src/styles/battle.css`

- [ ] **Step 1: BattleArena props**

```typescript
activeSlots?: [string, string];
autoSkillIds?: string[];
playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
```

Render only `activeSlots` as buttons (not all path skills).

- [ ] **Step 2: Button states** — ready / CD overlay / MP dim per spec §7.2.

- [ ] **Step 3: Auto info line** — `"Auto: Dash · Qi"` from `autoSkillIds`.

- [ ] **Step 4: `useBattle.ts` — 8s timeout**

```typescript
useEffect(() => {
  if (!actionRequired || autoBattle) return;
  const timer = setTimeout(() => {
    battle.submitAutoFromPool(); // new method: pick from auto pool
  }, 8000);
  return () => clearTimeout(timer);
}, [actionRequired, autoBattle]);
```

Wire `submitAutoFromPool` through battle hook to send intent without skillId (server auto-picks).

- [ ] **Step 5: Keyboard 1/2** for active slots when `actionRequired`.

- [ ] **Step 6: Hide active buttons when `autoBattle === true`.**

- [ ] **Step 7: Commit**

---

### Task 17: Battle log skill names

**Files:**
- Modify: `src/components/battle/battleLog.ts`
- Modify: `src/utils/i18n.ts`

- [ ] **Step 1: Format `metadata.skillId`** in attack events as localized skill name.

- [ ] **Step 2: Add enemy skill i18n keys** (`skills.enemy.slam`, etc.)

- [ ] **Step 3: Commit**

---

**P4 checkpoint:**

```bash
npm run validate && npm run typecheck && npm run build
```

Manual: run through test plan items 1–8 from spec §8.3.

---

## Phase P5: Balance Pass + Full Validation

### Task 18: Expand validate.ts — full test coverage

**Files:**
- Modify: `scripts/validate.ts`

- [ ] **Step 1: Add sections** per spec §8.1 (loadout, effective, SP, enemy, battle integration) — all assertions from P1–P4 tasks plus:

```typescript
console.log("\n=== Validation: Loadout Integration ===");
const loadoutState = createBattleState(1, {
  playerSkillPath: "murim",
  playerLoadout: { path: "murim", activeSlots: ["murim_palm", "murim_dash"] },
});
assert(
  validateManualAction(loadoutState, "player", {
    type: "basic_attack",
    targetId: "enemy_floor_1",
    skillId: "murim_qi",
  }) === false,
  "manual action rejects non-active skill"
);

console.log("\n=== Validation: Enemy AI ===");
// pickEnemySkill with mocked rng — regenerate at low HP
```

- [ ] **Step 2: Update old assertions** that reference 3 skills, Lv15 slot 3, etc.

- [ ] **Step 3: Run validate — 0 failures**

```bash
npm run validate
```

- [ ] **Step 4: Commit**

---

### Task 19: Balance tuning pass

**Files:**
- Modify: `src/engine/skills/murim.ts` (if needed)
- Modify: `src/engine/skills/knight.ts` (if needed)
- Modify: `src/engine/skills/fantasy.ts` (if needed)
- Modify: `src/engine/skills/enemy.ts` (if needed)

- [ ] **Step 1: Run MCP simulate_combat** (if `project-0-tower-hunter-game-mcp-game-helper` available) for floors 1, 15, 50, 100 per path.

- [ ] **Step 2: Target win rate 55–70%** — adjust `damageMultiplier` ±0.05 or enemy `skillBias` ±0.05 if outside range.

- [ ] **Step 3: Re-run validate**

- [ ] **Step 4: Commit**

```bash
git commit -am "chore(balance): tune skill multipliers from combat simulation"
```

---

### Task 20: Update design spec status + final gate

**Files:**
- Modify: `docs/superpowers/specs/2026-07-14-skill-system-design.md`

- [ ] **Step 1: Change status to `Approved — implemented`**

- [ ] **Step 2: Final regression**

```bash
npm run validate && npm run typecheck && npm run build
```

Expected: all pass, 0 failures.

- [ ] **Step 3: Commit**

```bash
git commit -am "docs: mark skill system spec implemented"
```

---

## Self-Review (Plan vs Spec)

| Spec section | Covered by |
|--------------|------------|
| §2 Architecture | Tasks 1–7, 12–14 |
| §3 Loadout | Tasks 3, 5, 6, 7, 15 |
| §4 Skill Points | Tasks 8, 9, 10, 11 |
| §5 Enemy skills | Tasks 12, 13, 14 |
| §6 Player catalog | Task 2 |
| §7 UI/UX | Tasks 11, 16, 17 |
| §8 Testing | Tasks 18, 19, 20 |
| §9 Phases P1–P5 | All tasks |

No placeholders. Type names consistent: `SkillUpgradeRanks`, `SkillLoadout`, `UpgradeBranch`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-14-skill-system.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. Use `superpowers:subagent-driven-development`.

2. **Inline Execution** — implement tasks in this session with checkpoints after each phase. Use `superpowers:executing-plans`.

**Which approach?**
