# Skill System Design — Tower Hunter Game

**Date:** 2026-07-14  
**Status:** Approved — implemented  
**Approach:** Unified Skill Runtime (Approach 1)

> **Path rename (2026-07):** Runtime skill paths are `imperial` · `knight` · `vanguard` (was `murim` · `knight` · `fantasy`). Examples below retain legacy IDs/names where the spec was written; migration: `005_imperial_skill_paths.sql`.

---

## 1. Overview

### 1.1 Goals

Redesign the skill system from scratch while reusing existing engine foundations (`SkillDefinition`, `skillExecution`). The system supports:

- **Hybrid combat:** Auto-battle baseline with 2 manual Active Skill slots
- **Path identity:** 3 skill paths (Imperial / Knight / Vanguard — legacy names Murim / Knight / Fantasy in skill IDs), switchable at no cost
- **Progression:** Level-gated unlocks (Lv 1/5/10/15) + Skill Points for per-skill upgrades
- **Enemy depth:** All enemies use skills (normal: 1, boss: 2–3 by floor tier)

### 1.2 Requirements Summary

| Topic | Decision |
|-------|----------|
| Scope | Full redesign |
| Combat | Auto primary + 2 Active manual slots |
| Paths | Imperial / Knight / Vanguard — free switching |
| Skills per path | 4, unlock at Lv 1 / 5 / 10 / 15 |
| Loadout | Player picks 2 Active; remainder Auto |
| Skill Points | +1 per level up, +2 per boss floor |
| Upgrades | Per-skill, 3 branches (Damage / CD / MP), 3 ranks each |
| Enemies | Normal 1 skill, boss 2–3 skills by floor tier |
| Architecture | Unified Skill Runtime — shared executor for player + enemy |

### 1.3 Non-Goals (v1)

- Skill respec (phase 2: gold cost)
- Data-driven skill catalog in DB
- PvP / multiplayer skill sync
- Skill animations beyond existing animation queue

---

## 2. Architecture

### 2.1 Unified Skill Runtime

```
SkillDefinition (engine)
    ├── PlayerCatalog (murim/knight/fantasy × 4)
    ├── EnemyCatalog (8 skills, 6 templates)
    └── SkillExecutor (damage/buff/heal/status)

BattleLoadout { path, activeSlots: [id, id] }
PlayerSkillProgress { skillId → { damage, cooldown, mpCost } ranks }
EffectiveSkill = resolveEffectiveSkill(base, upgrades)
```

**MVC separation:**

| Layer | Responsibility |
|-------|----------------|
| Engine | `SkillDefinition`, execution, AI, effective skill resolver, validation |
| Server | Loadout persistence, SP grants, upgrade transactions, battle state init |
| UI | Skill Menu (loadout + upgrades), Battle Arena (2 active buttons) |

### 2.2 New Engine Modules

| File | Purpose |
|------|---------|
| `src/engine/skills/effectiveSkill.ts` | Apply upgrade ranks to base skill |
| `src/engine/skills/enemy.ts` | Enemy skill catalog |
| `src/engine/skills/enemyTemplates.ts` | Floor → template mapping |
| `src/engine/skills/enemyAi.ts` | `pickEnemySkill()` |
| `src/engine/skills/loadout.ts` | Loadout validation, auto slot derivation |

### 2.3 Database Schema

```sql
-- Skill points wallet
ALTER TABLE player_stats
  ADD COLUMN skill_points INT NOT NULL DEFAULT 0 CHECK (skill_points >= 0);

-- Per-path loadout (persisted separately per path)
CREATE TABLE player_skill_loadout (
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path           TEXT NOT NULL CHECK (path IN ('murim', 'knight', 'fantasy')),
  active_slot_1  TEXT NOT NULL,
  active_slot_2  TEXT NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, path)
);

-- Per-skill upgrade ranks
CREATE TABLE player_skill_upgrades (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id     TEXT NOT NULL,
  damage_rank  SMALLINT NOT NULL DEFAULT 0 CHECK (damage_rank BETWEEN 0 AND 3),
  cd_rank      SMALLINT NOT NULL DEFAULT 0 CHECK (cd_rank BETWEEN 0 AND 3),
  mp_rank      SMALLINT NOT NULL DEFAULT 0 CHECK (mp_rank BETWEEN 0 AND 3),
  PRIMARY KEY (user_id, skill_id)
);
```

### 2.4 API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/skills/:userId/progression` | SP balance, upgrades, catalog with effective stats |
| POST | `/skills/:userId/upgrade` | `{ skillId, branch: "damage" \| "cooldown" \| "mpCost" }` |
| PATCH | `/skills/:userId/loadout` | `{ path, activeSlots: [string, string] }` |
| GET | `/skills/:userId/path` | *(existing)* path + skills + unlocked state |
| PATCH | `/skills/:userId/path` | *(existing)* change path, load saved loadout for path |

---

## 3. Skill Structure & Loadout

### 3.1 SkillDefinition Extensions

```typescript
interface SkillDefinition {
  id: string;
  path: SkillPath | "basic" | "enemy";
  stringId: string;
  icon: string;
  kind: "attack" | "buff" | "heal";
  targetType: "enemy" | "self";
  unlockLevel: number;        // player only; enemy = 0
  mpCost: number;
  cooldownTurns: number;
  damageMultiplier?: number;
  accuracyBonus?: number;
  defPierce?: number;
  guaranteedStatus?: StatusEffectType;
  statusProcBonus?: number;
  selfStatus?: SkillSelfStatus;
  healPercent?: number;
  slotTier: 1 | 2 | 3 | 4;
  autoPriority: number;       // higher = AI prefers first
  isManualOnly?: boolean;
}
```

**Rules:**

- `basic_attack` is outside loadout; used when no skill is ready
- Locked skills (level too low) excluded from loadout and auto pool
- Enemy skills use `path: "enemy"`, no unlock level, `mpCost: 0`

### 3.2 Loadout Model

```typescript
interface SkillLoadout {
  path: SkillPath;
  activeSlots: [string, string];
}
// autoSkills = unlockedSkills - activeSlots (computed, not stored)
```

| Unlocked | Active chosen | Auto |
|----------|---------------|------|
| 1 | 1 | 0 |
| 2 | 2 | 0 |
| 3 | 2 | 1 |
| 4 | 2 | 2 |

**Constraints:**

- Active slots must be unlocked, distinct skills
- Self-target skills in active slot auto-target player
- Path change loads saved loadout for new path (or default if none)
- Loadout cannot change mid-battle

**Default loadout per path:**

| Path | Active 1 | Active 2 |
|------|----------|----------|
| Murim | `murim_palm` | `murim_dragon` (or tier-2 if Lv < 15) |
| Knight | `knight_slash` | `knight_charge` |
| Fantasy | `fantasy_bolt` | `fantasy_meteor` |

### 3.3 Battle Turn Flow

```
Player turn reached
  → If manual mode: show 2 Active buttons (+ timeout 8s)
    → Player taps Active → execute Active skill
    → No tap / timeout → Auto AI from autoSkills
  → Auto mode: pool = active + auto, full AI priority
  → No skill ready → basic_attack

Enemy turn
  → pickEnemySkill(template, entity)
  → execute via shared processExecution()
```

**Player auto AI priority** (for auto slots):

1. Heal if HP < 35% and heal skill ready
2. Buff with 25% random chance
3. Highest `autoPriority` among ready attack skills
4. Fallback: `basic_attack`

**Manual action validation:**

- `skillId` must be in `activeSlots`
- `canUseSkill()` with effective stats (upgrades applied)

---

## 4. Skill Points & Upgrade Tree

### 4.1 SP Sources

| Event | SP |
|-------|-----|
| Level up | +1 per level gained |
| Boss floor win (10, 20, …, 100) | +2 |

**Estimated total (~Lv 40, 100 floors):** ~59 SP

### 4.2 Upgrade Ranks

```typescript
interface SkillUpgradeRanks {
  damage: 0 | 1 | 2 | 3;
  cooldown: 0 | 1 | 2 | 3;
  mpCost: 0 | 1 | 2 | 3;
}
```

**SP cost per rank (escalating per branch):**

| Rank transition | SP cost | Cumulative per branch |
|-----------------|---------|----------------------|
| 0 → 1 | 1 | 1 |
| 1 → 2 | 2 | 3 |
| 2 → 3 | 3 | 6 |

Max one skill (all 3 branches): 18 SP  
Max one path (4 skills): 72 SP (exceeds available SP → meaningful choices)

### 4.3 Branch Effects

| Branch | Per rank | Max effect | Applies to |
|--------|----------|------------|------------|
| Damage | +5% `damageMultiplier` | +15% | `kind: "attack"` only |
| Cooldown | −1 turn CD | −3 turns (min 0) | all skills |
| MP Cost | −10% MP | −30% (min 1 MP) | all skills with mpCost > 0 |

```typescript
function resolveEffectiveSkill(skill, upgrades): SkillDefinition {
  return {
    ...skill,
    damageMultiplier: skill.damageMultiplier
      ? skill.damageMultiplier * (1 + upgrades.damage * 0.05)
      : undefined,
    cooldownTurns: Math.max(0, skill.cooldownTurns - upgrades.cooldown),
    mpCost: Math.max(1, Math.floor(skill.mpCost * (1 - upgrades.mpCost * 0.10))),
  };
}
```

### 4.4 SP & Upgrade Rules

- SP pool is **global**; upgrades are **per skillId** (persist across path switches)
- No respec in v1
- Server validates: branch not maxed, SP sufficient, skill exists in player catalog
- Damage branch disabled in UI for buff/heal skills

---

## 5. Enemy Skills

### 5.1 Enemy Template

```typescript
interface EnemyTemplate {
  id: string;
  nameKey: string;
  tier: "normal" | "boss";
  baseStats: EnemyBaseStats;
  skillIds: string[];
  aiProfile: { skillBias: number; skillPriority: string[] };
}
```

### 5.2 Skill Catalog

| ID | Kind | Effect | CD |
|----|------|--------|-----|
| `enemy_strike` | attack | ×1.0 | 0 |
| `enemy_heavy_blow` | attack | ×1.3 | 2 |
| `enemy_poison_stab` | attack | ×0.9 + poison | 3 |
| `enemy_armor_break` | attack | ×1.0 + def_debuff | 3 |
| `enemy_enrage` | buff | self ATK buff | 4 |
| `enemy_slam` | attack | ×1.5 | 3 |
| `enemy_stun_smash` | attack | ×1.2 + stun | 4 |
| `enemy_regenerate` | heal | 15% HP | 5 |

### 5.3 Templates by Floor

**Normal:**

| Floors | Template | Skills |
|--------|----------|--------|
| 1–30 | `guardian_low` | `enemy_heavy_blow` |
| 31–60 | `guardian_mid` | `enemy_poison_stab` |
| 61–100 | `guardian_high` | `enemy_armor_break` |

**Boss (every 10th floor):**

| Floors | Template | Skills |
|--------|----------|--------|
| 10–30 | `boss_early` | slam, enrage |
| 40–60 | `boss_mid` | stun_smash, slam, enrage |
| 70–100 | `boss_late` | stun_smash, slam, regenerate |

**CD scaling (floor 70+ bosses):** CD −1, minimum 2

### 5.4 Enemy AI

```typescript
function pickEnemySkill(actor, template, rng): SkillDefinition {
  const usable = template.skillIds
    .map(getSkillById)
    .filter(s => !isSkillOnCooldown(actor, s.id));

  if (usable.length === 0) return getSkillById("enemy_strike");
  if (rng() > template.aiProfile.skillBias) return getSkillById("enemy_strike");

  for (const id of template.aiProfile.skillPriority) {
    const skill = usable.find(s => s.id === id);
    if (skill) return skill;
  }
  return usable[0];
}
```

**AI profiles:**

| Template | skillBias | Priority |
|----------|-----------|----------|
| guardian_* | 0.70 | [single skill] |
| boss_early | 0.80 | slam → enrage |
| boss_mid | 0.85 | stun_smash → slam → enrage |
| boss_late | 0.90 | stun_smash → slam → regenerate |

**Overrides:**

- Enemy HP < 30% + `enemy_regenerate` ready → force heal
- `canUseSkill` for enemies: skip MP check, only CD matters

---

## 6. Player Skills — Full Catalog

### 6.1 Murim (Aggressive / DoT)

| Tier | Lv | ID | Name | Kind | MP | CD | Mult | Special | autoPriority |
|------|-----|-----|------|------|----|----|------|---------|-------------|
| 1 | 1 | `murim_palm` | Iron Palm | attack | 15 | 2 | ×1.35 | bleed, status+15% | 75 |
| 2 | 5 | `murim_dash` | Shadow Step | attack | 10 | 1 | ×1.00 | accuracy +30 | 55 |
| 3 | 10 | `murim_qi` | Inner Qi | buff | 20 | 3 | — | ATK buff +20%, 2T | 35 |
| 4 | 15 | `murim_dragon` | Dragon Roar | attack | 30 | 4 | ×1.75 | bleed, status+25% | 90 |

### 6.2 Knight (Tank / Control)

| Tier | Lv | ID | Name | Kind | MP | CD | Mult | Special | autoPriority |
|------|-----|-----|------|------|----|----|------|---------|-------------|
| 1 | 1 | `knight_slash` | Knight Slash | attack | 10 | 1 | ×1.20 | — | 70 |
| 2 | 5 | `knight_guard` | Shield Guard | buff | 15 | 2 | — | DEF buff +20%, 2T | 30 |
| 3 | 10 | `knight_bash` | Shield Bash | attack | 20 | 3 | ×1.25 | stun | 65 |
| 4 | 15 | `knight_charge` | Cavalry Charge | attack | 28 | 4 | ×1.70 | stun, status+20% | 90 |

### 6.3 Fantasy (Magic / Sustain)

| Tier | Lv | ID | Name | Kind | MP | CD | Mult | Special | autoPriority |
|------|-----|-----|------|------|----|----|------|---------|-------------|
| 1 | 1 | `fantasy_bolt` | Arcane Bolt | attack | 15 | 1 | ×1.25 | pierce 30% DEF | 70 |
| 2 | 5 | `fantasy_freeze` | Frost Nova | attack | 20 | 2 | ×1.00 | freeze | 60 |
| 3 | 10 | `fantasy_heal` | Holy Light | heal | 25 | 3 | — | heal 25% HP | 40 |
| 4 | 15 | `fantasy_meteor` | Meteor | attack | 35 | 5 | ×1.90 | pierce 50% DEF | 95 |

### 6.4 Path Comparison

| Dimension | Murim | Knight | Fantasy |
|-----------|-------|--------|---------|
| DPS | ★★★★ | ★★★ | ★★★★★ |
| Survivability | ★★ | ★★★★★ | ★★★ |
| CC | Bleed | Stun | Freeze |
| Sustain | — | DEF buff | Heal |
| MP usage | Medium | Low | High |

### 6.5 Migration from Current Code

| Change | Detail |
|--------|--------|
| `SKILL_UNLOCK_LEVELS` | `[1, 5, 10, 15]` (was `[1, 5, 15]`) |
| `murim_qi` unlock | 15 → 10 |
| `knight_charge` | Split: `knight_bash` at Lv10, charge at Lv15 |
| `fantasy_heal` unlock | 15 → 10 |
| `knight_slash` mult | 1.15 → 1.20 |
| New skills | `murim_dragon`, `knight_bash`, `fantasy_meteor` |
| Add fields | `slotTier`, `autoPriority` on all player skills |

---

## 7. UI/UX

### 7.1 Skill Menu (Out of Battle)

**Layout — two panels:**

```
┌─────────────────────────────────────────┐
│ Skill Paths: [Murim] [Knight] [Fantasy]│
│ Skill Points: 12                         │
├──────────────────┬──────────────────────┤
│ LOADOUT          │ SKILL DETAIL          │
│ Active Slot 1: ▼ │ 👊 Iron Palm          │
│ Active Slot 2: ▼ │ ─────────────────     │
│ Auto: Dash, Qi   │ ⚔ Damage  [★★☆] 2 SP  │
│                  │ ⏱ CD      [★☆☆] 1 SP  │
│ [Save Loadout]   │ 💧 MP     [☆☆☆] 1 SP  │
└──────────────────┴──────────────────────┘
```

**Behaviors:**

- Path tabs switch path instantly (no cost); loadout panel reloads saved loadout for that path
- Active slot dropdowns: only unlocked skills for current path
- Auto list: computed preview (unlocked − active), read-only
- Upgrade buttons: show next SP cost; disabled if locked, maxed, or insufficient SP
- Locked skills: grey card, show unlock level, upgrades visible but disabled
- Effective stats shown (post-upgrade MP/CD/mult)
- Save loadout on change (debounced PATCH) or explicit Save button

### 7.2 Battle Arena

**Manual mode (auto-battle OFF):**

```
┌────────────────────────────────────┐
│  [Enemy HP bar]                    │
│  ...battle log...                  │
│  [Player HP / MP bars]             │
├────────────────────────────────────┤
│  ACTIVE SKILLS                     │
│  [👊 Palm  MP15]  [🐉 Dragon MP30] │
│  (CD overlay when cooling down)    │
│  Auto: Dash · Qi  (info only)      │
│  [Auto Battle: OFF]                │
└────────────────────────────────────┘
```

**Rules:**

- Show **only 2 Active slot buttons** (not all 4 skills)
- Button states: ready (clickable), cooldown (grey + turn count), no MP (dim), locked (hidden)
- Self-skill active button: no target selection needed
- 8-second timeout on player turn → auto-pick from auto pool if no tap
- Auto-battle ON: hide active buttons; AI uses full pool (active + auto)

**Battle log additions:**

- `"You used Dragon Roar!"` / `"Floor 30 Boss used Slam!"`
- Status procs, miss, crit unchanged

### 7.3 Feedback & Accessibility

| Element | Treatment |
|---------|-----------|
| CD | Numeric overlay on button + `aria-label` |
| MP cost | Shown on button; red tint when unaffordable |
| Upgrade confirm | Brief toast: `"Iron Palm Damage → Rank 3"` |
| Path switch | Toast: `"Switched to Knight path"` |
| Touch targets | Min 44×44px for battle skill buttons |
| Keyboard | 1/2 keys for active slots when action required |

### 7.4 Error States

| Case | UX |
|------|-----|
| API fail on upgrade | Inline error, SP unchanged |
| Invalid loadout save | Revert dropdowns to last saved |
| Mid-battle skill hack | Server rejects; client falls back to basic_attack |
| 0 SP | Upgrade buttons disabled with hint |

---

## 8. Testing Strategy

### 8.1 Engine Unit Tests (`scripts/validate.ts`)

Extend existing validation script (no new test framework in v1):

**Loadout:**

- ✓ Auto slots derived correctly for 1–4 unlocked skills
- ✓ Duplicate active slots rejected
- ✓ Locked skill cannot be in active slots
- ✓ Default loadout generated per path

**Effective skill:**

- ✓ Damage rank 3 → +15% multiplier
- ✓ CD rank 3 → CD reduced by 3 (min 0)
- ✓ MP rank 3 → −30% cost (min 1)
- ✓ Buff skill ignores damage branch

**Skill points:**

- ✓ Level up grants +1 SP
- ✓ Boss floor grants +2 SP
- ✓ Upgrade deducts correct escalating SP cost
- ✓ Cannot upgrade beyond rank 3

**Enemy:**

- ✓ Floor 15 → guardian_low + heavy_blow
- ✓ Floor 50 boss → boss_mid with 3 skills
- ✓ Enemy AI respects cooldown
- ✓ Enemy HP < 30% prefers regenerate
- ✓ `canUseSkill` skips MP for enemies

**Battle integration:**

- ✓ Manual action only accepts active slot skills
- ✓ Auto AI uses auto pool when no manual input
- ✓ Player auto-battle uses full pool
- ✓ Enemy turn executes enemy skill

### 8.2 Server Integration Checks

| Check | Method |
|-------|--------|
| Loadout persist per path | `db-check` script extension |
| Upgrade transaction atomicity | Concurrent upgrade test |
| SP never negative | DB constraint + app validation |
| Idempotent battle rewards | Existing idempotency key pattern |

### 8.3 Manual Test Plan

| # | Scenario | Expected |
|---|----------|----------|
| 1 | New player Lv1 Murim | 1 skill, 1 active slot, 0 auto |
| 2 | Reach Lv5 | 2 skills, 2 active, 0 auto |
| 3 | Reach Lv10 | 2 active + 1 auto fires in battle |
| 4 | Set loadout, switch to Knight, switch back | Murim loadout restored |
| 5 | Upgrade damage rank 1 | Effective mult increases in battle UI |
| 6 | Manual mode: tap active skill | Skill executes, MP/CD applied |
| 7 | Manual mode: wait 8s | Auto skill fires |
| 8 | Auto-battle ON | No manual buttons; skills rotate |
| 9 | Floor 10 boss | Boss uses 2+ skills in log |
| 10 | Win boss | +2 SP reflected in Skill Menu |
| 11 | Enemy stun skill | Player skips turn |
| 12 | Fantasy heal auto | Fires when HP < 35% |

### 8.4 Balance Validation

Run MCP `simulate_combat` (if available) across:

- Floors 1, 15, 50, 100
- Each path with default loadout
- Target: player win rate 55–70% at appropriate level for floor

### 8.5 Regression Gate

Before merge:

```bash
npm run validate   # all engine + skill tests pass
npm run typecheck
npm run build
```

---

## 9. Implementation Phases (Suggested)

| Phase | Scope |
|-------|-------|
| **P1** | Schema, loadout model, 4 skills/path, effective skill resolver |
| **P2** | SP + upgrade API/UI |
| **P3** | Enemy catalog + AI |
| **P4** | Battle UI (2 active buttons, timeout), Skill Menu redesign |
| **P5** | Balance pass + validate.ts expansion |

---

## 10. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Path switch cost | Free |
| Active vs auto split | 2 active, rest auto |
| SP per path or global | Global SP, per-skill upgrades |
| Enemy MP | No MP; CD only |
| Respec | Deferred to phase 2 |

---

*End of design document.*
