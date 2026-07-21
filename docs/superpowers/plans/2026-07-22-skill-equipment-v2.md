# Skill System v2 + Equipment Balance — Implementation Plan

> **Status:** Implemented (2026-07-22). Equip loadout logic lives in `src/engine/skills/loadout.ts` (not a separate `equipLoadout.ts`). `SkillMenu.tsx` is under `src/components/menu/`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship skill system v2 (type taxonomy, 4-slot equip, SP respec, manual/auto battle) and rebalance all 50 shop gear items (stats + prices) for floors 1–100.

**Architecture:** Equipment rebalance first (isolated `equipmentShopStats.ts` + price mult). Then skill v2 via composable manifest registry, new loadout model, expanded upgrades, battle picker — following `types → engine → server → api → hook → component`.

**Tech Stack:** TypeScript, Hono, PostgreSQL, React 19, existing engine battle state machine.

**Specs:**
- [`../specs/2026-07-21-skill-system-v2-design.md`](../specs/2026-07-21-skill-system-v2-design.md) (rev 5)
- [`../specs/2026-07-22-equipment-balance-design.md`](../specs/2026-07-22-equipment-balance-design.md)

## Global Constraints

- No Phaser / no client-side authoritative combat math
- Engine files &lt; 200 lines; one concern per module
- Shop gear: per-item stats in catalog, **no rarity**
- Sell price = `floor(buyCost × 0.5)`
- Skill paths `imperial`/`knight`/`vanguard` **removed** from player skills
- Max **4 equipped skills**; SP respec **free**, full refund
- Manual battle: buttons for equipped battle skills; Auto: no buttons, slot-order rotation
- `npm run validate` must pass before merge

---

## File Map

| Area | Create | Modify |
|------|--------|--------|
| Equipment | — | `equipmentShopStats.ts`, `equipmentShopItems.ts`, `validate.ts` |
| Skill types | `skillTypes.ts`, `catalog/manifest.ts`, `catalog/registry.ts` | `types.ts`, `skills/types.ts` |
| Loadout | `loadout.ts`, `skillPicker.ts`, `passiveApply.ts`, `skillRespec.ts` | — |
| Battle | — | `battleAdvance.ts`, `turnStateMachine.ts`, `BattleArena.tsx` |
| Server | `012_skill_v2.sql`, skill respec route | `skill routes`, `battle/service.ts` |
| UI | `SkillEquipPanel.tsx` | `SkillMenu.tsx` |

---

## Phase A — Equipment Balance

### Task 1: Update shop stat tables

**Files:**
- Modify: `src/engine/shop/equipmentShopStats.ts`
- Test: `scripts/validate.ts`

**Interfaces:**
- Produces: `SHOP_EQUIPMENT_STATS` with v01–v05 values from equipment balance spec §3

- [x] **Step 1: Replace stat arrays in `equipmentShopStats.ts`**

```typescript
// helm example — full file per spec §3.1–3.10
helm: [
  { def: 8 },
  { def: 14, maxHp: 25 },
  { def: 24, maxHp: 45 },
  { def: 36, maxHp: 70 },
  { def: 48, maxHp: 100 },
],
// ... chest, boots, gloves, cloak,
// weapon-sword-shield (ATK + DEF — ดาบ+โล่),
// weapon-sword, weapon-sword-cross, weapon-axe, weapon-axe-cross

// weapon-sword-shield example
"weapon-sword-shield": [
  { atk: 9, def: 6 },
  { atk: 16, def: 11 },
  { atk: 28, def: 18 },
  { atk: 42, def: 26, critChance: 0.015 },
  { atk: 68, def: 38, critChance: 0.02 },
],
```

- [x] **Step 2: Add validation assertions**

```typescript
// scripts/validate.ts
const v05AxeCross = getShopRowStats("weapon-axe-cross", 4);
assert(v05AxeCross.atk === 125, "v05 dual axes ATK");
assert(v05AxeCross.critDamage === 0.32, "v05 dual axes crit dmg");

const v05Chest = getShopRowStats("chest", 4);
assert(v05Chest.maxHp === 420, "v05 chest HP");
```

- [x] **Step 3: Run validate**

```bash
npm run validate
```

Expected: all assertions PASS

### Task 1b: Migrate shield → weapon-sword-shield

**Files:**
- Modify: `equipmentShopWeaponCatalogRows.ts`, `equipmentShopCatalogRows.ts`, `equipmentShopStats.ts`
- Rename mapping: `PREFIX_TO_SLOT["weapon-sword-shield"] = "weapon"`
- `assetKey` override: `weapon-sword-shield` variants use existing `shield-{vv}` SVG paths

- [x] **Step 1: Remove `shield` from ARMOR_ROWS; add to WEAPON_CATALOG_ROWS as `weapon-sword-shield`**
- [x] **Step 2: Update display names** (Iron Sword & Ward, …)
- [x] **Step 3: Assert v05 stats ATK 68 + DEF 38**


**Files:**
- Modify: `src/engine/shop/equipmentShopItems.ts`
- Test: `scripts/validate.ts`

- [x] **Step 1: Change cost multiplier**

```typescript
const VARIANT_COST_MULT = [1, 2.5, 5, 10, 18] as const;
```

- [x] **Step 2: Assert key prices**

```typescript
const etherHelm = EQUIPMENT_SHOP_ITEMS.find(i => i.assetKey === "helm-05");
assert(etherHelm?.cost === 1080n, "Ether Helm price 1080");
const expression = EQUIPMENT_SHOP_ITEMS.find(i => i.assetKey === "weapon-axe-cross-05");
assert(expression?.cost === 1404n, "Expression price 1404");
```

- [x] **Step 3: Run validate**

```bash
npm run validate
```

---

### Task 3: Gold affordability spot-check

**Files:**
- Modify: `scripts/validate.ts`

- [x] **Step 1: Add gold curve helper test**

```typescript
import { calculateFloorGoldReward } from "../src/engine/formulas/rewards";

function cumulativeGoldToFloor(floor: number): bigint {
  let total = 0n;
  for (let f = 1; f <= floor; f++) total += calculateFloorGoldReward(f);
  return total;
}

assert(cumulativeGoldToFloor(30) >= 2000n, "enough gold to start v03 buys by F30");
assert(cumulativeGoldToFloor(100) >= 25000n, "enough gold for multiple v05 pieces by F100");
```

- [x] **Step 2: Run validate**

```bash
npm run validate
```

---

## Phase B — Skill v2 Engine Core

### Task 4: Skill type taxonomy + manifest

**Files:**
- Create: `src/engine/skills/skillTypes.ts`
- Create: `src/engine/skills/catalog/manifest.ts`
- Create: `src/engine/skills/catalog/registry.ts`
- Modify: `src/engine/skills/types.ts`

**Interfaces:**
- Produces: `SkillType`, `SkillCatalogEntry`, `getSkillById()` from manifest, `CATALOG_VERSION = 3`

- [x] **Step 1: Add `SkillType` and extend `SkillDefinition`**

```typescript
// skillTypes.ts
export type SkillType = "active" | "passive" | "cc" | "movement";
export function isBattleSkillType(t: SkillType): boolean {
  return t === "active" || t === "cc" || t === "movement";
}
```

- [x] **Step 2: Author manifest with all 20 skills** (stats from skill spec §3.3)

- [x] **Step 3: Registry builds `Map<string, SkillDefinition>` from manifest**

- [x] **Step 4: Validation — 20 skills, 4 types, tier curves**

```typescript
assert(getSkillsByType("passive").length === 5, "5 passives");
const meteor = getSkillById("active_meteor");
assert(meteor.defPierce === 0.55, "meteor pierce");
```

---

### Task 5: Equip loadout model

**Files:**
- Create: `src/engine/skills/loadout.ts` (4-slot equip + validation)
- Modify: `src/engine/skills/index.ts`

**Interfaces:**
- Produces: `SkillLoadout`, `validateEquipLoadout()`, `MAX_EQUIP_SLOTS = 4`

```typescript
export interface SkillLoadout {
  equippedSlots: string[];
  battlePrefs: { healOverrideEnabled: boolean; healThreshold: number };
}

export function validateEquipLoadout(
  equippedSlots: string[],
  unlockedIds: ReadonlySet<string>
): { valid: boolean; error?: string } {
  if (equippedSlots.length > 4) return { valid: false, error: "TOO_MANY_SLOTS" };
  // no dupes, all unlocked, all exist in catalog
}
```

- [x] **Step 1: Implement validation + default loadout**
- [x] **Step 2: Tests in `validate.ts`**

---

### Task 6: Passive apply + skill picker

**Files:**
- Create: `src/engine/skills/passiveApply.ts`
- Create: `src/engine/skills/skillPicker.ts`
- Modify: `src/engine/skills/resolver.ts` (delegate to skillPicker)

**Interfaces:**
- Produces: `applyEquippedPassives(stats, equippedIds, upgrades)`, `pickSkillForTurn(state, manualSkillId?)`

```typescript
export function pickSkillForTurn(
  actor: BattleEntity,
  loadout: SkillLoadout,
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedIds: readonly string[],
  manualSkillId?: string
): SkillDefinition {
  if (manualSkillId) { /* validate equipped + canUse */ }
  // heal override → slot-order walk → basic_attack
}
```

- [x] **Step 1: Implement passive stat merge at battle init**
- [x] **Step 2: Implement picker (remove random buff branch)**
- [x] **Step 3: Tests — slot order skips passives, heal override**

---

### Task 7: Expanded upgrades (5×4) + respec engine

**Files:**
- Modify: `src/engine/skills/types.ts`, `effectiveSkill.ts`
- Create: `src/engine/skills/skillRespec.ts`
- Modify: `src/engine/skills/skillPoints.ts`

- [x] **Step 1: Extend `SkillUpgradeRanks` with `statusPotency`, `healPower`, `passivePotency` (max rank 4)**
- [x] **Step 2: Update `resolveEffectiveSkill` per spec §5.3**
- [x] **Step 3: `calculateRespecRefund(unlocks, upgrades)` → total SP spent**

---

## Phase C — Server & Database

### Task 8: DB migration `012_skill_v2.sql`

**Files:**
- Create: `src/server/db/schema/012_skill_v2.sql`

```sql
CREATE TABLE IF NOT EXISTS player_skill_loadout_v2 (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  equipped_slots TEXT[] NOT NULL DEFAULT '{}',
  heal_override BOOLEAN NOT NULL DEFAULT true,
  heal_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.35,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT equipped_slots_max_4 CHECK (cardinality(equipped_slots) <= 4)
);

ALTER TABLE player_skill_upgrades
  ADD COLUMN IF NOT EXISTS status_rank SMALLINT NOT NULL DEFAULT 0 CHECK (status_rank BETWEEN 0 AND 4),
  ADD COLUMN IF NOT EXISTS heal_rank SMALLINT NOT NULL DEFAULT 0 CHECK (heal_rank BETWEEN 0 AND 4),
  ADD COLUMN IF NOT EXISTS passive_rank SMALLINT NOT NULL DEFAULT 0 CHECK (passive_rank BETWEEN 0 AND 4);
-- Widen damage/cd/mp rank checks to 0–4
```

- [x] **Step 1: Write migration + data migration from path loadouts**
- [x] **Step 2: Map legacy skill IDs → new IDs in unlocks table**
- [x] **Step 3: `npm run db:check`**

---

### Task 9: API routes

**Files:**
- Modify: `src/server/api/routes/skills.ts` (or equivalent)
- Modify: `src/utils/api.ts`

| Endpoint | Body |
|----------|------|
| `PATCH /skills/:id/loadout` | `{ equippedSlots, healOverride?, healThreshold? }` |
| `POST /skills/:id/respec` | `{}` |
| `GET /skills/catalog` | returns manifest version + skills by type |

- [x] **Step 1: Loadout PATCH with validation**
- [x] **Step 2: Respec POST — atomic refund + clear unlocks/upgrades/equip**
- [x] **Step 3: Remove path switch endpoint**

---

### Task 10: Battle service integration

**Files:**
- Modify: `src/server/battle/service.ts`
- Modify: `src/engine/states/battleAdvance.ts`

- [x] **Step 1: Battle init calls `applyEquippedPassives`**
- [x] **Step 2: Manual intent validates `skillId` in equipped battle skills**
- [x] **Step 3: Auto turn uses `pickSkillForTurn` without manual id**

---

## Phase D — UI

### Task 11: Skill Menu — equip panel

**Files:**
- Create: `src/components/skills/SkillEquipPanel.tsx`
- Modify: `src/components/menu/SkillMenu.tsx`

- [x] **Step 1: 4-slot drag-and-drop equip UI**
- [x] **Step 2: Catalog filter by skill type**
- [x] **Step 3: Respec button + confirm dialog**
- [x] **Step 4: Upgrade panel — 5 branches × 4 ranks**

---

### Task 12: Battle Arena — manual vs auto

**Files:**
- Modify: `src/components/battle/BattleArena.tsx`

- [x] **Step 1: Auto ON — hide skill buttons**
- [x] **Step 2: Manual — show equipped battle skill buttons only**
- [x] **Step 3: 8s timeout → auto picker**
- [x] **Step 4: Passive icons on HUD**

---

## Phase E — Enemy Zone 4 + Final Validation

### Task 13: Void enemy templates

**Files:**
- Modify: `src/engine/skills/enemyTemplates.ts`
- Create: enemy skill impl files for void zone

- [x] **Step 1: `guardian_void`, `boss_void` templates**
- [x] **Step 2: Status potency scaling floor 61+**

---

### Task 14: Balance validation script

**Files:**
- Create: `scripts/balanceCheck.ts` (wired into `scripts/validate.ts`)

- [x] **Step 1: Simulate boss fights at floors 10, 30, 60, 100 with matched gear tier + skill tier**
- [x] **Step 2: Assert turn counts within spec ranges AND ~50/50 gear/skill damage contribution at each checkpoint**
- [x] **Step 3: Wire into `npm run validate`**

```bash
npm run validate && npm run typecheck && npm run build
```

---

## Spec Coverage Self-Review

| Spec requirement | Task |
|------------------|------|
| Equipment stats §3.1–3.10 | Task 1 |
| Equipment prices `[1,2.5,5,10,18]` | Task 2 |
| 4 skill types, 20 skills | Task 4 |
| 4 equip slots | Task 5 |
| Manual/Auto battle | Task 6, 12 |
| SP respec | Task 7, 9 |
| 5×4 upgrades | Task 7 |
| Remove paths | Task 4, 9, 10 |
| 50/50 balance targets (floors 1–100) | Task 14 |
| Void enemies | Task 13 |

No placeholders remain — all stat values defined in equipment spec §3; skill values in skill spec §3.3.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-22-skill-equipment-v2.md`.**

**Execution:** Completed inline (2026-07-22). All tasks checked; `npm run validate` (113/113) and `npm run db:check` pass.
