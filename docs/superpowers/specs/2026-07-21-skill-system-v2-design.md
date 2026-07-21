# Skill System v2 — Tower Hunter Game

**Date:** 2026-07-21  
**Status:** Implemented (2026-07-22)  
**Approach:** Composable Registry (Approach 3)  
**Supersedes:** [archive/superpowers/specs/2026-07-14-skill-system-design.md](../../archive/superpowers/specs/2026-07-14-skill-system-design.md) (loadout, upgrade, catalog, paths)

---

## สรุปสำหรับผู้เล่น/ผู้อนุมัติ (อ่านส่วนนี้ก่อน)

### ระบบสกิลทำอะไร?

**ไม่มีสาย Imperial / Knight / Vanguard** — สกิลแบ่งตาม **ประเภทการทำงาน** 4 แบบ:

| ประเภท | คืออะไร | ตัวอย่าง |
|--------|---------|---------|
| **Active** | โจมตี, ร่ายเวท, ฮีล, บัฟ (ใช้ในเทิร์น) | Dragon Fist, Holy Light |
| **Passive** | บัฟถาวรขณะติดตั้ง | +HP, +MP, +ATK, +DEF, +SPD, +CRIT, +CRIT DMG, +RES, +EVA, +ACC |
| **CC** | ควบคุมศัตรู | สตัน, ช้า, ใบ้, แช่แข็ง |
| **Movement** | เคลื่อนที่/หลบ | Shadow Step, Dodge Roll |

สกิลเพิ่ม/ปรับผ่านอัปเดตเรื่อยๆ — ไม่ผูกโซนหอคอย

### ตั้งค่าทั้งหมดในแท็บสกิล (ไม่ตั้งตอนสู้)

- **ติดตั้งได้สูงสุด 4 สกิล** — ผสมประเภทอะไรก็ได้ (เช่น 2 Active + 1 Passive + 1 CC)
- **ลากเรียงลำดับ** ในแท็บสกิล — ลำดับนี้กำหนดว่าสกิลต่อสู้ตัวไหนใช้ก่อน
- **Passive** ในช่องที่ติดตั้ง → ทำงานอัตโนมัติตลอดสู้ (ไม่เข้า rotation)
### ต่อสู้ยังไง?

| โหมด | พฤติกรรม |
|------|----------|
| **Auto** | ใช้สกิลตามลำดับช่องที่ตั้งไว้ — **ไม่มีปุ่มเลือกสกิล** |
| **Manual** | แสดงปุ่มสกิลที่ติดตั้ง (ไม่รวม Passive) — **กดใช้เองได้**; ไม่กดภายใน 8 วินาที → ใช้ลำดับ Auto |

- ติดตั้ง/เปลี่ยนสกิลทำได้เฉพาะ **แท็บสกิล** (ไม่เปลี่ยนชุดสกิลตอนสู้)
- Passive ในช่องที่ติดตั้ง → บัฟตลอดสู้ ไม่มีปุ่ม

### ได้สกิล & เปลี่ยน build

- ใช้ **SP** ปลดล็อกและอัปเกรด
- **รีเซ็ต SP ได้ตลอด** — คืน SP ทั้งหมด, ล้าง unlock/upgrade, จัด build ใหม่ได้

### อัปเกรด (5 สาย × 4 ระดับ)

| สาย | ผล (ต่อระดับ) | ใช้กับ |
|-----|--------------|--------|
| Damage | ดาเมจ +5% | Active / CC / Movement ที่ทำดาเมจ |
| Cooldown | CD −1 เทิร์น | สกิลที่มี CD |
| MP Cost | มานา −8% | สกิลที่ใช้มานา |
| Status Potency | โอกาสสถานะ +10% | CC / สกิลที่มี status |
| Heal Power | ฮีล +8% | Active ฮีล |
| Passive Potency | บัฟ Passive +25% | Passive เท่านั้น |

### พลัง 50/50

**ชั้น 1–100 ทุกช่วง:** Gear จากร้าน + สกิลที่ติดตั้ง/อัปเกรด แบ่งพลังเท่าๆ กัน — ไม่ใช่แค่ endgame

- ชั้น 1–10 ใช้ gear v01 + สกิล tier 1–2 → แบ่ง 50/50
- ชั้น 11–30 ใช้ v01–v02 + tier 2–3 → แบ่ง 50/50
- …ไล่ตาม tier จนชั้น 100

---

## 1. Overview

### 1.1 Goals

- **Skill-type taxonomy** — Active / Passive / CC / Movement (no paths)
- **4-slot equip loadout** — free mix of types; all config in Skill tab
- **Dual battle modes** — Auto: slot-order rotation, no buttons; Manual: tap equipped skills, 8s timeout fallback
- **50/50 power split** at **floors 1–100** (every floor band, matched gear tier + skill tier)
- **Live service catalog** — skills added/tuned via manifest updates
- **SP-Only** unlock + upgrade
- **Full SP respec** anytime — refund all SP, reset unlocks/upgrades

### 1.2 Requirements Summary

| Topic | Decision |
|-------|----------|
| Classification | 4 types: `active`, `passive`, `cc`, `movement` |
| Paths | **Removed** |
| Equip limit | **Max 4 skills** — any type mix |
| Loadout config | **Skill tab only** — equip/reorder not during battle |
| Auto-battle | Slot-order rotation; **no skill buttons** |
| Manual battle | Buttons for **equipped battle skills**; 8s timeout → slot-order fallback |
| SP respec | **Anytime** — full refund, reset progression |
| Unlock / upgrade | SP-Only |
| Upgrade tree | 5 branches × 4 ranks |
| Power split | **50/50 floors 1–100** — gear flat stats + skill mult/pierce/DoT/heal/CC at each tier band |
| Skill balance | Tier curves §3.2.3; catalog §3.3; boss turns §3.2.4 |

### 1.3 Non-Goals (v1)

- DB-driven skill catalog (manifest in repo)
- PvP / multiplayer skill sync
- Per-battle skill loadout changes
- Character class / path system

---

## 2. Skill Type Taxonomy

### 2.1 Primary Types

```typescript
type SkillType = "active" | "passive" | "cc" | "movement";
```

| Type | When equipped | In battle |
|------|--------------|-----------|
| **passive** | Always applies stat buff | Auto at battle start; no turn action |
| **active** | Occupies equip slot | Used in turn rotation by slot order |
| **cc** | Occupies equip slot | Used in turn rotation by slot order |
| **movement** | Occupies equip slot | Used in turn rotation by slot order |

**Classification:** by primary purpose (Shield Bash → `cc`, Shadow Step → `movement`).

### 2.2 CC Status Effects (new)

| Status | Effect |
|--------|--------|
| `slow` | Action gauge fills 50% slower for N turns |
| `silence` | Skills disabled (basic_attack only) for N turns |

### 2.3 Movement Effects

`evasion_buff`, `gap_close`, `gauge_boost`

### 2.4 Passive Effects

```typescript
interface PassiveEffect {
  stat:
    | "atk" | "maxHp" | "maxMp" | "def" | "speed"
    | "critChance" | "critDamage" | "evasion" | "statusResist" | "accuracy";
  magnitude: number;
}
```

Applied at battle init for each equipped passive (up to 4 slots shared with other types).

---

## 3. Skill Catalog (Live Service)

### 3.1 Manifest

Flat catalog filtered by `skillType` in UI. No `path` field.

```typescript
interface SkillCatalogEntry {
  id: string;
  skillType: SkillType;
  catalogTier: number;
  contentTag: "core" | "event" | "balance";
  availability?: { eventId: string; endsAt: string };
  unlockSpCost: number;
  // ... base stats, scaling (unchanged)
}
```

### 3.2 Balance Framework (Floors 1–100)

#### 3.2.1 Design constraints (from engine + gear)

| System | Formula / value |
|--------|-----------------|
| Enemy HP/ATK/DEF | × `1.08^(floor−1)`; boss ×1.5 |
| Player stats | × `1.06^(level−1)` base |
| Damage | `ATK × mult × (1 − DEF/(DEF+100))` after pierce |
| DEF pierce | `effectiveDEF = DEF × (1 − min(0.9, pierce))` |
| Bleed / poison DoT | **5% of target max HP** per turn, 3 turns |
| Gear tiers | v01–v05 per slot; full v05 ≈ +88 ATK, +520 HP, +76 DEF, +12% CRIT (striker) |

**50/50 meaning (validated, all floors):** At each floor band, when **gear tier matches floor** and **skill catalogTier matches floor**, roughly **half of effective combat output** comes from gear flat stats (ATK/HP/DEF/crit/etc.) and **half from skills** (damage multipliers, DEF pierce, DoT % enemy HP, heals, CC turn skips, passives). Balance scripts must assert this at floors **10, 30, 60, 100** (not endgame-only).

| Floor band | Gear tier | Skill tier | ~Gear share | ~Skill share |
|------------|-----------|------------|-------------|--------------|
| 1–10 | v01 | T1–T2 | ~50% | ~50% |
| 11–30 | v01–v02 | T2–T3 | ~50% | ~50% |
| 31–50 | v02–v03 | T3–T4 | ~50% | ~50% |
| 51–75 | v03–v04 | T4–T6 | ~50% | ~50% |
| 76–100 | v04–v05 | T5–T7 | ~50% | ~50% |

#### 3.2.2 Player milestones (balance assumptions)

| Floor band | ~Level | Gear tier | Example ATK† | 50/50 note |
|------------|--------|-----------|--------------|------------|
| 1–10 | 1–10 | v01 | 55–95 | 1–2 skills; basic_attack ≈ gear-only DPS without skills |
| 11–30 | 11–22 | v01–v02 | 95–200 | Pierce T2+ required; skill mult offsets low gear ATK |
| 31–50 | 23–35 | v02–v03 | 200–380 | Heal + passives ≈ half survivability |
| 51–75 | 36–45 | v03–v04 | 380–650 | CC skips ≈ half tempo advantage |
| 76–100 | 46–50 | v04–v05 | 650–1040 | Pierce + DoT ≈ half boss damage |

† ATK = (base + weapon) × passive ATK% at typical build.

#### 3.2.3 Skill stat curves by `catalogTier`

| Tier | Floor band | `damageMult` | `defPierce` | MP | CD |
|------|------------|--------------|-------------|-----|-----|
| 1 | 1–12 | 1.15–1.25 | 0% | 8–12 | 1–2 |
| 2 | 8–22 | 1.25–1.35 | 0–5% | 10–14 | 1–3 |
| 3 | 20–40 | 1.30–1.45 | 15–20% | 14–18 | 2–3 |
| 4 | 35–55 | 1.40–1.60 | 25–30% | 20–26 | 3–4 |
| 5 | 50–75 | 1.50–1.70 | 30–35% | 24–28 | 3–4 |
| 6 | 70–90 | 1.65–1.85 | 40–50% | 28–34 | 4–5 |
| 7 | 85–100 | 1.80–2.05 | 50–60% | 32–40 | 4–6 |

**Rules:**
- Higher tier → more pierce (mandatory vs exponential enemy DEF)
- Bleed skills: always tier ≥2; `statusProcBonus` scales 10% → 25%
- Heal: `22% → 28%` max HP by tier (scales with gear HP)
- Buffs: ATK/DEF `+15% → +25%` for 2 turns
- MP costs ~`8 + tier × 4` to track player MP pool growth

#### 3.2.4 Target combat metrics (boss fights, geared)

| Floor | Est. turns | Win rate target |
|-------|------------|-----------------|
| 10 | 6–8 | 70–80% |
| 30 | 10–14 | 65–75% |
| 60 | 14–18 | 58–68% |
| 90 | 16–22 | 55–65% |
| 100 | 18–24 | 55–60% |

### 3.3 v1 Starter Catalog (balance-tuned)

#### Active (7)

| Tier | ID | Name | MP | CD | Mult | Pierce | Special |
|------|-----|------|----|----|------|--------|---------|
| 1 | `active_power_slash` | Power Slash | 8 | 1 | ×1.20 | — | — |
| 2 | `active_iron_palm` | Iron Palm | 12 | 2 | ×1.30 | 5% | bleed, +10% proc |
| 3 | `active_arcane_bolt` | Arcane Bolt | 16 | 1 | ×1.35 | 20% | — |
| 4 | `active_inner_qi` | Inner Qi | 22 | 3 | — | — | ATK +18%, 2T |
| 5 | `active_holy_light` | Holy Light | 26 | 3 | — | — | heal 24% HP |
| 6 | `active_dragon_fist` | Dragon Fist | 32 | 4 | ×1.75 | 45% | bleed, +20% proc |
| 7 | `active_meteor` | Meteor | 38 | 5 | ×1.95 | 55% | — |

#### Passive (7)

| Tier | ID | Name | Effect (base @ rank 0) |
|------|-----|------|------------------------|
| 1 | `passive_sturdy_frame` | Sturdy Frame | +6% maxHp |
| 2 | `passive_blade_mastery` | Blade Mastery | +5% atk |
| 2 | `passive_arcane_mind` | Arcane Mind | +8% maxMp |
| 3 | `passive_swift_feet` | Swift Feet | +8 speed, +2% evasion |
| 3 | `passive_keen_eye` | Keen Eye | +4% critChance, +8 accuracy |
| 4 | `passive_guardian_aura` | Guardian Aura | +6% def, +4% statusResist |
| 5 | `passive_brutal_strikes` | Brutal Strikes | +10% critDamage |

#### CC (4)

| Tier | ID | Name | MP | CD | Mult | Pierce | Special |
|------|-----|------|----|----|------|--------|---------|
| 2 | `cc_shield_bash` | Shield Bash | 14 | 3 | ×1.20 | 10% | stun |
| 3 | `cc_frost_nova` | Frost Nova | 18 | 2 | ×1.00 | 15% | freeze |
| 4 | `cc_silencing_word` | Silencing Word | 22 | 3 | — | — | silence 2T |
| 5 | `cc_hamstring` | Hamstring | 18 | 2 | ×0.85 | 20% | slow 3T |

#### Movement (4)

| Tier | ID | Name | MP | CD | Mult | Special |
|------|-----|------|----|----|---------|
| 2 | `move_shadow_step` | Shadow Step | 10 | 1 | ×1.00 | evasion +25%, 1T |
| 3 | `move_dodge_roll` | Dodge Roll | 14 | 2 | — | evasion +40%, 2T |
| 4 | `move_cavalry_charge` | Cavalry Charge | 26 | 4 | ×1.55 | gap_close, stun +15% proc |
| 5 | `move_flash_step` | Flash Step | 20 | 3 | — | gauge +25 |

> **Migration:** legacy IDs (`murim_*`, `knight_*`, `fantasy_*`) map 1:1 to nearest tier above.

### 3.4 Damage & scaling formulas

```
directDamage = calculateBaseDamage(ATK, targetDEF × (1 − pierce))
             × damageMultiplier × (1 + damageRank × 0.05)

dotPerTurn = ceil(target.maxHp × 0.05)     // bleed/poison, 3 turns
healAmount = ceil(self.maxHp × healPercent × (1 + healRank × 0.08))
passiveStat = baseMagnitude × (1 + passivePotencyRank × 0.25)
```

**Gear ↔ skill synergy:** ATK from gear feeds `directDamage`; HP/MP from gear feeds heal/skill casts; DEF + passives extend survival; pierce/DoT skills handle enemy HP scale.

### 3.4.1 Stat coverage (10 stats)

| Stat | Skill source | Gear source (v05) |
|------|--------------|-------------------|
| HP | Sturdy Frame +6% | Chest +420, Helm +100 |
| MP | Arcane Mind +8% | Cloak +80 |
| ATK | Blade Mastery +5%, Inner Qi buff | Weapon +70–88 |
| DEF | Guardian Aura +6% | Helm +48, Chest +28, sword-shield +40 |
| SPD | Swift Feet +8 | Boots +22, dual swords +8 |
| CRIT | Keen Eye +4% | Gloves +7%, weapon bonus |
| CRIT DMG | Brutal Strikes +10% | Axe weapons +20–30% |
| RES | Guardian Aura +4% | Cloak +12% |
| EVA | Swift Feet +2%, Movement skills | Boots +10 |
| ACC | Keen Eye +8 | Gloves +12 |

> รายละเอียดไอเทม: `2026-07-22-equipment-balance-design.md` §1.5

> **Equipment stats & prices:** see `2026-07-22-equipment-balance-design.md` — gear tier bands align with skill `catalogTier` bands (v01–v05 ↔ tiers 1–7).

### 3.5 Example builds by floor (4 equip slots)

| Floor | Example loadout | Role |
|-------|-----------------|------|
| 1–10 | Power Slash, Iron Palm, Sturdy Frame, (empty) | Learn rotation |
| 30 | Dragon Fist†, Iron Palm, Blade Mastery, Shield Bash | Pierce + bleed + CC |
| 60 | Dragon Fist, Holy Light, Guardian Aura, Frost Nova | Sustain + control |
| 100 | Meteor, Brutal Strikes, Keen Eye, Dodge Roll | Max pierce + crit dmg + evasion |

† Dragon Fist unlock tier 6 — at F30 use Arcane Bolt + Iron Palm instead until unlocked.


---

## 4. Equip Loadout & Battle Flow

### 4.1 Equip Model (Skill Tab)

```typescript
interface SkillLoadout {
  /** Ordered equip slots, max 4. Order = battle priority for non-passives. */
  equippedSlots: string[];
  battlePrefs: SkillBattlePrefs;
}

interface SkillBattlePrefs {
  healOverrideEnabled: boolean;  // default: true
  healThreshold: number;         // default: 0.35
}
```

**Rules:**

| Rule | Detail |
|------|--------|
| Max slots | **4** total |
| Type mix | **Free** — e.g. 4 Passive, or 2 Active + 2 CC, any combo |
| Unlock required | Only unlocked skills can be equipped |
| No duplicates | Same skill cannot occupy two slots |
| Order matters | Top-to-bottom = priority for battle skills |
| Passive in list | Applies buff at battle start; skipped in turn rotation |
| Changes | Skill tab only; **not during battle** |
| Empty slots | Allowed (0–4 equipped) |
| Fallback | `basic_attack` if no battle skill ready |

### 4.2 Example

```
แท็บสกิล — ติดตั้ง (4/4):
  1. Dragon Fist     (Active)   ← ใช้ก่อนในเทิร์น
  2. Blade Mastery   (Passive)  ← บัฟ +ATK ตลอดสู้
  3. Shield Bash     (CC)       ← ใช้ถัดไปถ้า Dragon ยัง CD
  4. Shadow Step     (Movement) ← ใช้ถัดไป

Auto: ระบบไล่ 1→3→4 อัตโนมัติ (ข้าม 2)
Manual: แสดงปุ่ม Dragon Fist, Shield Bash, Shadow Step — กดเองได้
```

### 4.3 Battle Flow

```
Battle start:
  1. Apply equipped passives → CombatStats
  2. Apply gear stats
  3. Turn loop
```

**Shared skill-pick algorithm** (Auto mode + Manual timeout fallback):

```
Player turn:
  1. Heal Override (if enabled): HP < threshold
     → first ready heal in equippedSlots (by slot order, skip passives)
  2. Slot-order walk: equippedSlots top→bottom
     → skip passives
     → first battle skill where canUseSkill() = true
  3. Fallback: basic_attack
```

#### Auto-battle ON

- Hide skill buttons
- Every player turn uses the shared algorithm above
- Passive icons on HUD (display only)

#### Manual (Auto-battle OFF)

- Show buttons for **equipped battle skills only** (active / cc / movement)
- Buttons ordered by slot position; show CD overlay, MP cost, disabled when unavailable
- Player taps any equipped battle skill → execute if `canUseSkill()`
- **8s timeout** with no tap → shared algorithm (slot-order fallback)
- Passives: HUD icons only — no button
- Server validates: `skillId` ∈ equipped battle skills, unlocked, `canUseSkill()`

### 4.4 UI — Battle Arena

```
┌────────────────────────────────────────┐
│  [Enemy HP]                            │
│  ...battle log...                      │
│  Passive: [⚔ Blade Mastery]          │  ← HUD only
├────────────────────────────────────────┤
│  MANUAL ONLY:                          │
│  [🐉 Dragon Fist] [🛡 Shield Bash]     │
│  [👟 Shadow Step]                      │
│  [Auto Battle: OFF]                    │
└────────────────────────────────────────┘
```

Auto-battle ON: hide the three skill buttons; rotation runs automatically.

### 4.5 UI — Skill Tab

```
┌──────────────────────────────────────────────────────────┐
│ SP: 24                          [รีเซ็ต SP ทั้งหมด]     │
├──────────────────────────────────────────────────────────┤
│ ติดตั้ง (3/4) — ลากเรียงลำดับ                            │
│ ≡ 1. [🐉 Dragon Fist    ] Active                         │
│ ≡ 2. [⚔ Blade Mastery  ] Passive                       │
│ ≡ 3. [🛡 Shield Bash    ] CC                            │
│ ≡ 4. [ empty slot       ]                                │
├──────────────────────────────────────────────────────────┤
│ [☑ ฮีลอัตโนมัติเมื่อเลือด < 35%]                         │
├──────────────────────────────────────────────────────────┤
│ คลังสกิล (กรอง: ทั้งหมด | Active | Passive | CC | Move)  │
│ [ปลดล็อก / อัปเกรดแต่ละการ์ด]                            │
└──────────────────────────────────────────────────────────┘
```

Tap empty slot or catalog card → equip (if unlocked and room). Drag to reorder.

### 4.6 SP Respec

**Anytime** from Skill tab (not mid-battle):

```
POST /skills/:userId/respec
```

| Effect | Detail |
|--------|--------|
| SP refund | 100% of all SP spent on unlocks + upgrades |
| Unlocks | All removed (`player_skill_unlocks` cleared) |
| Upgrades | All ranks reset to 0 |
| Equipped | `equippedSlots` cleared |
| Cost | **Free** in v1 |

After respec, player reallocates SP from scratch. Confirmation dialog required.

### 4.7 Database

```sql
CREATE TABLE IF NOT EXISTS player_skill_loadout_v2 (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  equipped_slots TEXT[] NOT NULL DEFAULT '{}',  -- max 4, ordered
  heal_override BOOLEAN NOT NULL DEFAULT true,
  heal_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.35,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT equipped_slots_max_4 CHECK (cardinality(equipped_slots) <= 4)
);
```

---

## 5. SP Economy & Upgrade Tree (5 × 4)

### 5.1 SP Income

| Event | SP |
|-------|-----|
| Level up | +1 |
| Boss win (×10 floors) | +2 each |
| Zone first clear (30, 60, 90) | +3 each (once) |

**~78 SP** total to floor 100 — respec lets players experiment without permanent lock-in.

### 5.2 Unlock Costs

| catalogTier | SP |
|-------------|-----|
| 1–7 | 1, 2, 4, 6, 8, 10, 12 |
| event | 8–15 |

### 5.3 Upgrade Branches

```typescript
interface SkillUpgradeRanks {
  damage:        0 | 1 | 2 | 3 | 4;
  cooldown:      0 | 1 | 2 | 3 | 4;
  mpCost:        0 | 1 | 2 | 3 | 4;
  statusPotency: 0 | 1 | 2 | 3 | 4;
  healPower:     0 | 1 | 2 | 3 | 4;
  passivePotency: 0 | 1 | 2 | 3 | 4;  // passive skills only
}
```

| Branch | Per rank | Max (r4) | Applies to |
|--------|----------|----------|------------|
| Damage | +5% mult | +20% | attack-type battle skills |
| Cooldown | −1 CD | −4 (min 0) | battle skills with CD |
| MP Cost | −8% MP | −32% (min 1) | skills with mpCost |
| Status Potency | +10% proc | +40%; +1T at r4 | cc / status skills |
| Heal Power | +8% heal | +32% | heal actives |
| Passive Potency | +25% stat | +100% | passive skills |

**SP per branch (full):** 1+2+3+4 = **10 SP**  
**SP per skill (all branches):** up to **50 SP** (battle) or **10 SP** (passive-only has 1 branch)

### 5.4 SP Rules

- SP global pool
- Respec refunds everything; no penalty v1
- Server: atomic unlock/upgrade/respec transactions

---

## 6. Architecture & API

### 6.1 Key Modules

`catalog/`, `skillTypes.ts`, `loadout.ts`, `passiveApply.ts`, `skillPicker.ts`, `skillRespec.ts`

### 6.2 API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/skills/catalog` | Catalog by skillType |
| GET | `/skills/:userId/progression` | SP, unlocks, upgrades, equip loadout |
| POST | `/skills/:userId/unlock` | `{ skillId }` |
| POST | `/skills/:userId/upgrade` | `{ skillId, branch }` |
| PATCH | `/skills/:userId/loadout` | `{ equippedSlots, healOverride?, healThreshold? }` |
| POST | `/skills/:userId/respec` | Full SP reset |
| POST | `/skills/:userId/milestone` | Zone SP bonus |

---

## 7. Enemy Skill Scaling

*(Unchanged — zone 4 void enemies, scaling rules, balance targets)*

---

## 8. Testing

- Balance: equip limits, tier curves, boss turn targets (§3.2.4)
- Sim spot-check: floors 10, 30, 60, 100 with gear milestones
- Any type mix valid
- Passive applies at battle init
- Slot-order rotation skips passives
- Auto: no skill buttons; Manual: equipped battle skill buttons only
- Manual timeout → slot-order fallback
- Manual tap invalid skill → server rejects
- Respec refunds SP, clears unlocks/upgrades/equip
- Heal override from battlePrefs

---

## 9. Implementation Phases

| Phase | Scope |
|-------|-------|
| P1 | SkillType, manifest, remove paths |
| P2 | 4-slot equip loadout, battle auto-picker |
| P3 | 5×4 upgrades, SP economy, respec |
| P4 | Skill tab UI (equip, drag, respec) |
| P5 | Enemy zone 4, balance, validate |

---

## 10. Resolved Decisions

| Question | Resolution |
|----------|------------|
| Equip limit | **4 slots**, free type mix |
| Loadout changes | **Skill tab only** — not during battle |
| Auto-battle | Slot-order rotation; no buttons |
| Manual battle | Tap equipped battle skills; 8s timeout → slot-order |
| Rotation | Slot order; passives auto-apply, skipped in turns |
| SP respec | **Free, anytime** — full refund |
| Paths | Removed |
| Classification | active / passive / cc / movement |
| Upgrade | 5×4 (+ passivePotency) |
| Power split | **50/50 floors 1–100** — validated per tier band (§3.2.1) |

---

## Appendix A — อธิบาย 5 สาย × 4 ระดับ (ภาษาไทย)

**แต่ละสกิลที่ปลดล็อกแล้ว อัปเกรดแยกเป็น "สาย" ได้** — แต่ละสายมี 4 ระดับ:

```
Dragon Fist
├── Damage      ★★★☆  (3/4)  → ดาเมจ +15%
├── Cooldown    ★☆☆☆  (1/4)  → CD 4→3
├── MP Cost     ☆☆☆☆  (0/4)
├── Status      ★★☆☆  (2/4)  → bleed proc +20%
└── Heal        (ไม่มี — สกิลนี้ไม่ฮีล)
```

**Passive Potency** ใช้กับ Passive เท่านั้น — เช่น Blade Mastery +5% ATK ที่ rank 4 → +10% ATK

**ราคา:** ระดับ 1=1 SP, 2=2 SP, 3=3 SP, 4=4 SP (รวม 10 SP/สาย)

**รีเซ็ต SP** = กดปุ่มแล้วได้ SP คืนทั้งหมด ล้าง unlock/upgrade เพื่อลอง build ใหม่

## Appendix B — ติดตั้ง 4 ช่อง (ภาษาไทย)

คิดเหมือน **ช่องสกิล 4 ช่อง** ในแท็บสกิล:

- ใส่ได้ **ไม่เกิน 4 ตัว** จากสกิลที่ปลดล็อกแล้ว
- **ไม่บังคับ** ว่าต้องมี Active กี่ตัว Passive กี่ตัว — จะใส่ Passive 4 ตัวก็ได้ (แต่ไม่มีสกิลโจมตีใน rotation)
- **ลำดับสำคัญ** — ตัวบนใช้ก่อน (เฉพาะ Active/CC/Movement)
- **Passive** ในช่องใดก็ได้ → บัฟทำงานทันทีที่เริ่มสู้
- **Auto**: ใช้ตามลำดับช่องอัตโนมัติ — ไม่มีปุ่ม
- **Manual**: กดปุ่มสกิลที่ติดตั้งเองได้; ไม่กด → ใช้ลำดับช่องแทน

---

*End of design document.*
