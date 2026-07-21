# Equipment Balance — Tower Hunter Game

**Date:** 2026-07-22  
**Status:** Implemented (2026-07-22)  
**Pairs with:** `2026-07-21-skill-system-v2-design.md` (rev 7), `2026-07-21-shop-gear-scaling-design.md`  
**Goal:** Rebalance all shop gear **prices** and **stats** for floors 1–100, aligned with skill v2 and **50/50 power split at every floor band (1–100)**.

---

## สรุป (ภาษาไทย)

- อุปกรณ์ร้าน **50 ชิ้น** (10 ประเภท × 5 tier v01–v05)
- อาวุธ **5 รูปแบบ** — แต่ละแบบมี **เอกลักษณ์ stat ต่างกัน** ไม่มีแบบไหน "แรงสุด" ทุกแบบ power budget ใกล้เคียงกัน
- **v01–v02** ชั้น 1–30 · **v03** ชั้น 31–50 · **v04** ชั้น 51–75 · **v05** ชั้น 76–100
- ราคาเพิ่มตาม tier — ต้องฟาร์ม Gold ก่อนซื้อ tier สูง
- **Gear + สกิล แบ่งพลัง 50/50 ตั้งแต่ชั้น 1–100** — ทุกช่วง tier ต้องสมดุลกัน (ไม่ใช่แค่ endgame)
- **stat ปรับขึ้น ~3–4×** ที่ v05 เทียบของเดิม ให้ Gear มีบทบาทจริงคู่กับสกิลตั้งแต่ชั้นแรก
- ชุด v05 เต็ม 6 ช่อง ≈ **6,800 Gold** (เลือกอาวุธ 1 แบบ)

---

## 1. Balance Principles

### 1.1 Gear vs Skill (50/50 — ชั้น 1–100)

**หลักการ:** ทุกช่วงชั้น เมื่อใช้ gear tier ที่เหมาะกับชั้น + สกิล tier ที่เหมาะกับชั้น → พลังต่อสู้รวมแบ่ง **~50% จากไอเทม / ~50% จากสกิล**

| Floor band | Gear tier | Skill tier | ตัวอย่าง Gear (6 ช่อง) | ตัวอย่าง Skill |
|------------|-----------|------------|------------------------|----------------|
| 1–10 | v01 | T1–T2 | ATK +12, HP +110, DEF +8 | Power Slash ×1.20 |
| 11–30 | v01–v02 | T2–T3 | ATK +22–38, HP +200 | Iron Palm pierce 5% |
| 31–50 | v02–v03 | T3–T4 | ATK +38–56, HP +350 | Arcane Bolt pierce 20% |
| 51–75 | v03–v04 | T4–T6 | ATK +56–70, HP +450 | Holy Light heal 24% |
| 76–100 | v04–v05 | T5–T7 | ATK +70–88, HP +520 | Meteor pierce 55% |

**ชั้น 100 (ตัวอย่าง endgame):**

| Source | Contribution |
|--------|--------------|
| **Gear (v05, 6 slots)** | ครบ **10 stat** (§1.5) · ATK +70–88, HP +520, DEF +76–116 |
| **Skills (4 equip + upgrades)** | Pierce 45–55%, bleed DoT, heal 24%, passives +10% ATK |
| **Player base (Lv50)** | ~904 ATK, ~9,174 HP, ~343 DEF |

Gear feeds **base stats** that skills multiply (ATK → skill damage, HP/MP → heal & casts).

### 1.2 Gold economy

| Milestone | Cumulative gold (first climb 1→N) |
|-----------|-------------------------------------|
| Floor 15 | ~650 |
| Floor 30 | ~2,625 |
| Floor 50 | ~7,125 |
| Floor 75 | ~15,650 |
| Floor 100 | ~28,000 |

Per-win farm at floor F: `5 × F` (normal) or `10 × F` (boss).

**Price rule:** v03 affordable after floor 30 farm; v05 requires dedicated farming at floors 60–90.

### 1.3 Price formula

```typescript
const VARIANT_PRICE_MULT = [1, 2.5, 5, 10, 18] as const;
// cost = round(baseCost × VARIANT_PRICE_MULT[variantIndex])
```

Replaces old `[1, 1.2, 2, 3.5, 6]`.

### 1.4 Stat rules

- v01–v03: **one primary stat** per armor piece
- v04–v05: primary + **one secondary stat** on armor
- **Weapon slot — 5 รูปแบบ** (ทั้งหมดอยู่ในหมวดอาวุธ ไม่มีไอเทม Shield แยก):

| รูปแบบ | Prefix | เอกลักษณ์ (v05) | เหมาะกับ |
|--------|--------|-----------------|----------|
| ดาบ | `weapon-sword` | ATK + CRIT สมดุล | ตีคริสม่ำเสมอ |
| ดาบ + โล่ | `weapon-sword-shield` | ATK + DEF | รอด + ตีได้ |
| ดาบคู่ | `weapon-sword-cross` | ATK ปานกลาง + **CRIT สูง + SPD** | เร็ว คลาสสายเบา |
| ขวาน | `weapon-axe` | ATK ปานกลาง + **CRIT DMG สูง** | ทุบแรงทีละครั้ง |
| ขวานคู่ | `weapon-axe-cross` | ATK ปานกลาง + **CRIT + CRIT DMG** | ดุดัน คลาสสายบ้า |

> ทุกอาวุธ **power budget ใกล้เคียงกัน** — เลือกตามสไตล์ ไม่ใช่แค่ตัวเลข ATK สูงสุด

> **ดาบ + โล่** ไม่ใช่ไอเทมโล่แยก — อยู่ช่องอาวุธ · ใช้ไอคอน `shield-*.svg`

**Migration:** แถว catalog `shield` → `weapon-sword-shield`

### 1.5 Stat coverage — ครบ 10 ค่าสถานะ

ทุก stat ที่ผู้เล่นปรับได้ (แท็บตัวละคร) ต้องเพิ่มได้จาก **ไอเทม + สกิล** ร่วมกัน:

| Stat | ไอเทม (ช่องหลัก) | สกิล (Passive / Buff) |
|------|------------------|------------------------|
| **HP** | เสื้อ, หมวก (รอง) | Sturdy Frame +6% |
| **MP** | ผ้าคลุม (รอง v04–v05) | Arcane Mind +8% |
| **ATK** | อาวุธ | Blade Mastery +5%, Inner Qi +18% |
| **DEF** | หมวก, เสื้อ (รอง), ดาบ+โล่ | Guardian Aura +6% |
| **SPD** | รองเท้า, ดาบคู่ | Swift Feet +8 |
| **CRIT** | ถุงมือ, อาวุธบางแบบ | Keen Eye +4% |
| **CRIT DMG** | ขวาน, ขวานคู่ | Brutal Strikes +10% |
| **RES** | ผ้าคลุม | Guardian Aura +4% |
| **EVA** | รองเท้า (รอง) | Swift Feet +2%, สกิล Movement |
| **ACC** | ถุงมือ (รอง) | Keen Eye +8 |

> ไอเทมให้ค่า **flat** · สกิลให้ **% / flat เสริม** · แต้มสถานะ (Status Points) ยังปรับเองได้ทุก stat

---

## 2. Recommended Floor by Variant

| Variant | Index | Floor band | Role |
|---------|-------|------------|------|
| v01 | 0 | 1–15 | Starter purchases |
| v02 | 1 | 16–30 | Early tower |
| v03 | 2 | 31–50 | Mid tower |
| v04 | 3 | 51–75 | Late tower |
| v05 | 4 | 76–100 | Endgame |

---

## 3. Full Catalog — Stats & Prices

### 3.1 Helm (DEF → HP secondary) · baseCost **60**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Hood | 60 | DEF +8 |
| v02 | Sun Visor | 150 | DEF +14, HP +25 |
| v03 | Rune Crest | 300 | DEF +24, HP +45 |
| v04 | Royal Crown | 600 | DEF +36, HP +70 |
| v05 | Ether Helm | 1,080 | DEF +48, HP +100 |

### 3.2 Chest (HP → DEF secondary) · baseCost **90**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Plate | 90 | HP +70 |
| v02 | Solar Guard | 225 | HP +130 |
| v03 | Rune Mail | 450 | HP +220 |
| v04 | Royal Cuirass | 900 | HP +320, DEF +18 |
| v05 | Ether Aegis | 1,620 | HP +420, DEF +28 |

### 3.3 Boots (SPD → Evasion secondary) · baseCost **50**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Stride | 50 | SPD +5 |
| v02 | Solar Spur | 125 | SPD +9 |
| v03 | Rune Tread | 250 | SPD +14 |
| v04 | Royal Sabaton | 500 | SPD +18, EVA +5 |
| v05 | Ether Pass | 900 | SPD +22, EVA +10 |

### 3.4 Gloves (CRIT → ACC secondary) · baseCost **45**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Grip | 45 | CRIT +2.5% |
| v02 | Solar Claw | 113 | CRIT +3.5% |
| v03 | Rune Fist | 225 | CRIT +5.0% |
| v04 | Royal Gauntlet | 450 | CRIT +6.0%, ACC +8 |
| v05 | Ether Spark | 810 | CRIT +7.0%, ACC +12 |

### 3.5 Cloak (Status Resist → MP secondary) · baseCost **55**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Shroud | 55 | RES +4% |
| v02 | Solar Veil | 138 | RES +5.5% |
| v03 | Rune Wave | 275 | RES +7.5% |
| v04 | Royal Mantle | 550 | RES +9.5%, MP +50 |
| v05 | Ether Cape | 990 | RES +12%, MP +80 |

### 3.6 Weapon — Sword & Shield (Guardian: ATK + DEF) · baseCost **68**

รูปแบบ **ดาบ + โล่** — อยู่ช่องอาวุธ · ให้ทั้ง ATK และ DEF ทุก tier (ไม่ใช่โล่อย่างเดียว)

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Iron Sword & Ward | 68 | ATK +9, DEF +6 |
| v02 | Solar Blade & Guard | 170 | ATK +16, DEF +11 |
| v03 | Rune Sword & Bulwark | 340 | ATK +28, DEF +18 |
| v04 | Royal Sword & Aegis | 680 | ATK +42, DEF +26, CRIT +1.5% |
| v05 | Ether Sword & Bastion | 1,224 | ATK +70, DEF +40, CRIT +2% |

### 3.7 Weapon — Sword (Striker: ATK + CRIT) · baseCost **70**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Corvus Grand | 70 | ATK +12 |
| v02 | Sunsplice | 175 | ATK +22 |
| v03 | Runeheart | 350 | ATK +38 |
| v04 | Aurelius | 700 | ATK +56, CRIT +3.5% |
| v05 | Ethernus | 1,260 | ATK +88, CRIT +5% |

### 3.8 Weapon — Dual Swords (Duelist: CRIT + SPD) · baseCost **75**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Ignis & Nox | 75 | ATK +11, SPD +2 |
| v02 | Sol & Luna | 188 | ATK +20, SPD +3 |
| v03 | Veris & Volt | 375 | ATK +34, CRIT +3%, SPD +5 |
| v04 | Crisis & Doom | 750 | ATK +52, CRIT +5.5%, SPD +6 |
| v05 | Ether & Abyss | 1,350 | ATK +82, CRIT +7%, SPD +8 |

### 3.9 Weapon — Axe (Brute: ATK + CRIT DMG) · baseCost **72**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Ironhorn | 72 | ATK +12 |
| v02 | Steel Smash | 180 | ATK +22 |
| v03 | Solfront | 360 | ATK +38 |
| v04 | Sunraptor | 720 | ATK +56, CRIT DMG +20% |
| v05 | Rune Split | 1,296 | ATK +86, CRIT DMG +30% |

### 3.10 Weapon — Dual Axes (Berserker: CRIT + CRIT DMG) · baseCost **78**

| Var | Name (EN) | Price | Stats |
|-----|-----------|-------|-------|
| v01 | Gryphon Heart | 78 | ATK +11, CRIT +1.5% |
| v02 | Aura Thorn | 195 | ATK +20, CRIT +2% |
| v03 | Royal Slayer | 390 | ATK +34, CRIT DMG +12% |
| v04 | Eclipse Ripper | 780 | ATK +52, CRIT +3.5%, CRIT DMG +16% |
| v05 | Expression | 1,404 | ATK +80, CRIT +4%, CRIT DMG +20% |

---

## 4. Example Loadouts

### Duelist (ดาบคู่ — เร็ว + คริต)

| Slot | v05 item | Stats |
|------|----------|-------|
| Weapon | Ether & Abyss | ATK +82, CRIT +7%, SPD +8 |
| Chest | Ether Aegis | HP +420, DEF +28 |
| Helm | Ether Helm | DEF +48, HP +100 |
| Boots | Ether Pass | SPD +22, EVA +10 |
| Gloves | Ether Spark | CRIT +7%, ACC +12 |
| Cloak | Ether Cape | RES +12%, MP +80 |

**Total:** ATK +82, HP +520, DEF +76, SPD +30, CRIT +14%, ACC +12, RES +12%, MP +80

### Berserker (ขวานคู่ — คริต + ดาเมจคริต)

| Slot | v05 item | Stats |
|------|----------|-------|
| Weapon | Expression | ATK +80, CRIT +4%, CRIT DMG +20% |
| Chest | Ether Aegis | HP +420, DEF +28 |
| Helm | Ether Helm | DEF +48, HP +100 |
| Boots | Ether Pass | SPD +22, EVA +10 |
| Gloves | Ether Spark | CRIT +7%, ACC +12 |
| Cloak | Ether Cape | RES +12%, MP +80 |

**Total:** ATK +80, HP +520, DEF +76, SPD +22, CRIT +11%, CRIT DMG +20%, ACC +12, RES +12%, MP +80

### Guardian (ดาบ + โล่ — รอด + ตีได้)

| Slot | v05 item | Stats |
|------|----------|-------|
| Weapon | Ether Sword & Bastion | ATK +70, DEF +40, CRIT +2% |
| Chest | Ether Aegis | HP +420, DEF +28 |
| Helm | Ether Helm | DEF +48, HP +100 |
| Boots | Ether Pass | SPD +22, EVA +10 |
| Gloves | Ether Spark | CRIT +7%, ACC +12 |
| Cloak | Ether Cape | RES +12%, MP +80 |

**Total:** ATK +70, HP +520, DEF +116, SPD +22, CRIT +9%, ACC +12, RES +12%, MP +80 — เน้นรอด + ตีได้พอสมควร

---

## 5. Balance Validation Targets

Boss fights with gear tier + skill tier matching floor band:

| Floor | Gear | Skills (equip 4) | Boss turns | Win rate |
|-------|------|------------------|------------|----------|
| 10 | v01–v02 | T1–T2 | 4–6 | 70–80% |
| 30 | v02–v03 | T2–T4 | 9–12 | 65–75% |
| 60 | v03–v04 | T4–T6 | 14–18 | 58–68% |
| 100 | v05 | T5–T7 | 18–22 | 55–60% |

---

## 6. Implementation Files

| File | Change |
|------|--------|
| `src/engine/shop/equipmentShopStats.ts` | Replace stat arrays; add `weapon-sword-shield` |
| `src/engine/shop/equipmentShopWeaponCatalogRows.ts` | Move shield row → `weapon-sword-shield` |
| `src/engine/shop/equipmentShopCatalogRows.ts` | Remove `shield` from ARMOR_ROWS |
| `src/engine/shop/equipmentShopItems.ts` | `VARIANT_COST_MULT` → `[1, 2.5, 5, 10, 18]` |
| `scripts/validate.ts` | Add gear tier + gold affordability assertions |
| `docs/superpowers/specs/2026-07-21-shop-gear-scaling-design.md` | Addendum note pointing here |

---

## 7. Resolved Decisions

| Question | Resolution |
|----------|------------|
| Stat buff magnitude | ~3–4× at v05 vs old values |
| Price curve | `[1, 2.5, 5, 10, 18] × baseCost` |
| Weapon identity | 5 styles — **equal power budget**, distinct stats (no "best ATK" weapon) |
| Sword & shield | Weapon-slot style; **not** a standalone shield item |
| Stat coverage | **10/10 stats** from gear + skills (§1.5) |
| Power split | **50/50 floors 1–100** (matched tier bands) |
| Sell price | 50% buy cost (unchanged) |

---

*End of design document.*
