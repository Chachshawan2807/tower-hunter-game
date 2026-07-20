# Shop-Only Gear Scaling — Tower Hunter Game

**Date:** 2026-07-21  
**Status:** Approved  
**Approach:** Per-Item Stat Catalog  
**Progression model:** Farm Loop (Option B) — ติดชั้น → ฟาร์ม Gold/EXP → ซื้อ Gear → ทะลุ Boss

---

## 1. Overview

### 1.1 Goals

กำหนดระบบ Gear สำหรับ Farm Loop โดย:

- **ไม่มี Gear drop จากการต่อสู้** — รางวัลจาก battle มีแค่ Gold และ EXP
- **Gear ได้จากร้านค้าเท่านั้น** — ซื้อและขายคืนที่ Shop ได้อิสระ
- **ไม่มีระดับ Rarity** — ไม่มี common/rare/epic/legendary สำหรับ Gear
- **แต่ละชิ้นมี stats เฉพาะตัว** — กำหนดค่า stat รายไอเทมใน catalog โดยตรง
- **Gate ด้วย Gold** — ของแพงมี stats ดีกว่า แต่ไม่ได้มาจากสูตร rarity
- **แก้ช่องว่าง `shop_equip_*` ใส่ไม่ได้** — map shop item → slot + stats

### 1.2 Requirements Summary

| Topic | Decision |
|-------|----------|
| Battle rewards | Gold + EXP only |
| Gear source | Shop purchase only |
| Gear disposal | Sell back to shop (50% ของราคาซื้อ) |
| Stat scaling | **Per-item** — `EquipmentShopItemDef.stats` กำหนดตรงๆ |
| Rarity | **ไม่มี** — ไม่ใช้ใน gameplay, UI, หรือ stat formula |
| Shop access | เปิดทั้งหมด — gate ด้วย Gold |
| Path binding | Shop gear ใส่ได้ทุก path — stats เหมือนกัน, visual ตาม assetKey |

### 1.3 Non-Goals (v1)

- Rarity tiers / color-coded item grades
- Stat formulas จาก template × multiplier
- Gear tier / item level / upgrade system
- Crafting / enhancement / fusion
- Floor-gated shop catalog

---

## 2. Progression Loop

```
┌──────────────────────────────────────────────────────────┐
│  ติด Boss ชั้น N                                         │
│       ↓                                                  │
│  ฟาร์มชั้น ≤ current_floor → Gold + EXP                 │
│       ↓                                                  │
│  ซื้อ Gear ที่มี stats เหมาะกับ build จาก Shop           │
│       ↓                                                  │
│  ขาย Gear เก่าคืน (optional) → Gold กลับมา               │
│       ↓                                                  │
│  ลอง Boss อีกครั้ง → ทะลุ                                │
└──────────────────────────────────────────────────────────┘
```

**Gate หลัก = Gold + การเลือกไอเทม** — ผู้เล่นเปรียบเทียบ stats และราคาแต่ละชิ้น ไม่ใช่แค่สี rarity

---

## 3. Battle Rewards (Gold + EXP Only)

### 3.1 ลบ Gear Drop

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/server/battle/rewards.ts` | ลบ item drop logic ทั้งหมด |
| `src/engine/formulas/rewards.ts` | ลบ drop helpers |
| `src/engine/types.ts` | ลบ `NORMAL_DROP_CHANCE`, `BOSS_DROP_CHANCE` |

### 3.2 EXP / Gold (Boss Bonus)

```typescript
export function calculateFloorExpReward(floor: number, baseExp = 10): number {
  const bossMult = isBossFloor(floor) ? 1.5 : 1.0;
  return Math.floor(baseExp * floor * bossMult);
}

export function calculateFloorGoldReward(floor: number, baseGold = 5n): bigint {
  const bossMult = isBossFloor(floor) ? 2n : 1n;
  return baseGold * BigInt(Math.max(1, floor)) * bossMult;
}
```

---

## 4. Shop Catalog — Per-Item Stats

### 4.1 Item Definition

แต่ละ shop item กำหนด stats โดยตรง — **ไม่มี rarity field**:

```typescript
// src/engine/shop/equipmentShopItems.ts

import type { GearStatBonus } from "../art/equipment/statBonuses";

export interface EquipmentShopItemDef {
  id: string;
  stringId: string;
  assetKey: string;
  slot: EquipmentSlot;
  cost: bigint;
  stats: GearStatBonus;       // ค่า stat เฉพาะชิ้นนี้
  label: { en: string; th: string };
}
```

ลบ `EquipmentShopRarity`, `VARIANT_RARITY`, และ `rarity` จาก shop item def

### 4.2 ตัวอย่าง Stats (Helm slot)

| Item | ราคา | Stats (เฉพาะชิ้น) |
|------|------|-------------------|
| Iron Hood | 60 | DEF +5 |
| Sun Visor | 72 | DEF +4, EVA +2 |
| Rune Crest | 120 | DEF +8, HP +20 |
| Royal Crown | 210 | DEF +10, HP +35, RES +2% |
| Ether Helm | 360 | DEF +12, HP +50, MP +10, RES +4% |

แต่ละชิ้นมี identity ต่างกัน — ไม่ได้ derive จากสูตร

### 4.3 Authoring Guidelines

เมื่อกำหนด stats รายไอเทม:

1. **Slot primary stat** — weapon→ATK, helm→DEF, chest→HP, gloves→CRIT, boots→SPD, cloak→RES
2. **ราคาสูง ≈ stats ดีกว่า** — แนวโน้ม ไม่ใช่สูตรบังคับ
3. **Trade-off ได้** — ชิ้นราคากลางอาจมี secondary stat แทน raw power
4. **ไม่ซ้ำกันทุกชิ้น** — แต่ละ item id มี `stats` object ของตัวเอง
5. **Balancing** — ใช้ `formatStatBonus` + combat sim ตรวจก่อน lock ค่า

### 4.4 Catalog API

```typescript
interface ShopCatalogItem {
  id: string;
  stringId: string;
  cost: string;
  slot: EquipmentSlot;
  icon: string;
  stats: GearStatBonus;       // raw values
  statPreview: string[];      // formatted lines
  sellPrice: string;          // floor(cost × 0.5)
}
```

ไม่มี `rarity` field

---

## 5. Stat Resolution

### 5.1 Lookup โดยตรง — ไม่มีสูตร

```typescript
// src/engine/shop/shopItemStats.ts (NEW)

const STATS_BY_ID = new Map(
  EQUIPMENT_SHOP_ITEMS.map((item) => [item.id, item.stats])
);

export function getShopItemStats(itemId: string): GearStatBonus | undefined {
  return STATS_BY_ID.get(itemId);
}
```

```typescript
// statBonuses.ts — combat loadout
export function getShopPieceStatBonus(itemId: string): GearStatBonus {
  return getShopItemStats(itemId) ?? {};
}
```

**ไม่ใช้** `RARITY_MULTIPLIER`, `SLOT_STAT_TEMPLATE`, หรือ `scaleBonus` สำหรับ shop gear

### 5.2 Default / Starter Gear

Starter gear จาก `DEFAULT_EQUIPMENT_BY_PATH` คงใช้ `getGearPieceStatBonus(gearId, slot, rarity)` เดิม — แยกจาก shop catalog

หรือ migrate starter เป็น shop item ราคา 0 ในอนาคต (non-goal v1)

---

## 6. Shop Item → Equippable Mapping

```typescript
// src/engine/shop/shopItemMapping.ts (NEW)

export function resolveShopEquippable(itemId: string): {
  slot: EquipmentSlot;
  assetKey: string;
} | null { /* ... */ }
```

```typescript
// itemMapping.ts
const shop = resolveShopEquippable(itemId);
if (shop) {
  return { gearId: `shop.${shop.assetKey}`, slot: shop.slot };
}
```

**Combat stats:** ใช้ `itemId` (shop_equip_*) lookup stats จาก catalog — ไม่ผ่าน rarity

**Path binding:** shop gear ใส่ได้ทุก path

### 6.1 Inventory / DB Rarity Column

`inventory_items.rarity` และ `player_equipment.rarity` ยังมีใน schema — สำหรับ shop gear:

- บันทึกค่าคงที่ `"standard"` หรือเก็บ `""` (migration เพิ่ม default)
- **Stats ไม่อ่านจาก rarity** — อ่านจาก `item_id` → shop catalog เท่านั้น
- UI ไม่แสดง rarity label / color border ตาม grade

---

## 7. Sell Mechanic

| Rule | Value |
|------|-------|
| Sell price | `floor(buyCost × 0.5)` |
| Equipped items | ห้ามขาย |
| Only shop items | `shop_equip_*` เท่านั้น |

```
POST /api/shop/:userId/sell
Body: { inventoryId: string, idempotencyKey: string }
```

---

## 8. UI / UX

### 8.1 Shop

- แสดง **stat lines เฉพาะชิ้น** ก่อนซื้อ (ไม่มี rarity badge/color)
- ราคาซื้อ + ราคาขายคืน (50%)
- เปรียบเทียบ stats ระหว่างชิ้นในหมวดเดียวกัน (slot category)
- Border ใช้ neutral style เดียว (หรือตาม slot category ไม่ใช่ rarity)

### 8.2 Bag

- แสดง stat lines ของชิ้นที่เลือก
- ไม่แสดง rarity short label (`bag.rarity_short.*`)
- ปุ่มขาย + confirmation

### 8.3 Equipment Panel

- ลบ rarity border classes (`--common`, `--rare`, etc.) สำหรับ shop gear
- แสดง stat bonus lines จาก catalog

---

## 9. Architecture

### 9.1 New / Modified Files

| File | Change |
|------|--------|
| `src/engine/shop/equipmentShopItems.ts` | เพิ่ม `stats` + `slot` ต่อ item, ลบ rarity |
| `src/engine/shop/shopItemStats.ts` | **NEW** — lookup stats by item id |
| `src/engine/shop/shopItemMapping.ts` | **NEW** — shop ID → slot |
| `src/engine/art/equipment/statBonuses.ts` | route shop items → `getShopItemStats` |
| `src/engine/art/equipment/itemMapping.ts` | shop branch, cross-path, ลบ drop branch |
| `src/engine/formulas/equipmentStats.ts` | pass `itemId` สำหรับ shop gear |
| `src/engine/formulas/rewards.ts` | boss bonus, ลบ drops |
| `src/server/battle/rewards.ts` | ลบ item drops |
| `src/server/shop/catalog.ts` | stats + statPreview, ลบ rarity |
| `src/server/shop/sell.ts` | **NEW** |
| `src/server/shop/purchase.ts` | ลบ rarity จาก inventory insert |
| `src/components/menu/ShopMenu.tsx` | stat preview, ลบ rarity styling |
| `src/components/menu/BagItemSlot.tsx` | ลบ rarity display, เพิ่ม sell |
| `src/components/menu/ShopItemIcon.tsx` | neutral border |

### 9.2 Stat Data Authoring

สร้าง stats สำหรับ ~50 shop items (10 slot families × 5 variants) ใน `equipmentShopItems.ts` หรือแยกไฟล์ `equipmentShopStats.ts` ถ้าเกิน 200 บรรทัด

---

## 10. Testing

| Test | Assert |
|------|--------|
| `buildBattleRewards` | `items.length === 0` |
| `getShopItemStats("shop_equip_helm_01")` | `{ def: 5 }` (ตามที่กำหนด) |
| สองชิ้นราคาต่างกัน | stats ต่างกัน (ไม่ derive จากสูตรเดียวกัน) |
| ไม่มี rarity ใน catalog response | ✓ |
| Equip shop item | stats จาก catalog ถูก apply |
| Sell | 50% refund |

---

## 11. Resolved Decisions

| Question | Decision |
|----------|----------|
| Gear drop? | **ไม่** |
| Rarity? | **ไม่มี** |
| Stat source? | **Per-item catalog** |
| Sell price? | 50% |
| Floor unlock? | **ไม่มี** |
| Cross-path? | ใส่ได้ทุก path |
| DB rarity column? | เก็บ placeholder — stats ไม่อ่านจากนี้ |

---

## 12. Implementation Order

1. **Data:** กำหนด `stats` ให้ทุก shop item ใน catalog
2. **Engine:** `shopItemStats.ts`, `shopItemMapping.ts`
3. **Equip path:** itemMapping + equipmentStats (per-item lookup)
4. **Rewards:** ลบ drops, boss bonus
5. **Shop server:** catalog + sell
6. **UI:** ลบ rarity display, แสดง per-item stats
7. **Migration:** ลบ drop items, cleanup

---

## Appendix A — Authoritative Stat Table (50 items)

กฎ:
- v01–v03: stat หลักอย่างเดียว
- v04–v05: stat หลัก + stat รอง (2 อันดับราคาแพงสุด)
- ไม่มี rarity

### Helm → DEF

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Hood | 60 | DEF +5 |
| Sun Visor | 72 | DEF +6 |
| Rune Crest | 120 | DEF +10 |
| Royal Crown | 210 | DEF +14, HP +30 |
| Ether Helm | 360 | DEF +18, HP +50 |

### Chest → HP

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Plate | 90 | HP +40 |
| Solar Guard | 108 | HP +48 |
| Rune Mail | 180 | HP +80 |
| Royal Cuirass | 315 | HP +110, DEF +8 |
| Ether Aegis | 540 | HP +150, DEF +12 |

### Boots → SPD

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Stride | 50 | SPD +4 |
| Solar Spur | 60 | SPD +5 |
| Rune Tread | 100 | SPD +8 |
| Royal Sabaton | 175 | SPD +11, EVA +3 |
| Ether Pass | 300 | SPD +15, EVA +6 |

### Gloves → CRIT

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Grip | 45 | CRIT +2.0% |
| Solar Claw | 54 | CRIT +2.5% |
| Rune Fist | 90 | CRIT +3.5% |
| Royal Gauntlet | 158 | CRIT +4.5%, CRIT DMG +10% |
| Ether Spark | 270 | CRIT +6.0%, CRIT DMG +20% |

### Cloak → Status Resist

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Shroud | 55 | RES +3.0% |
| Solar Veil | 66 | RES +3.5% |
| Rune Wave | 110 | RES +5.5% |
| Royal Mantle | 193 | RES +7.5%, EVA +2 |
| Ether Cape | 330 | RES +10.0%, EVA +5 |

### Sword → ATK

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Corvus Grand | 70 | ATK +7 |
| Sunsplice | 84 | ATK +9 |
| Runeheart | 140 | ATK +14 |
| Aurelius | 245 | ATK +20, CRIT +1.5% |
| Ethernus | 420 | ATK +28, CRIT +2.5% |

### Dual Swords → ATK

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Ignis & Nox | 75 | ATK +8 |
| Sol & Luna | 90 | ATK +10 |
| Veris & Volt | 150 | ATK +16 |
| Crisis & Doom | 263 | ATK +22, CRIT +1.5% |
| Ether & Abyss | 450 | ATK +32, CRIT +3.0% |

### Shield → DEF

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Iron Bulwark | 65 | DEF +6 |
| Zenith Aegis | 78 | DEF +7 |
| Raptor Ward | 130 | DEF +12 |
| Fang Bastion | 228 | DEF +16, HP +35 |
| Rex Ultima | 390 | DEF +22, HP +55 |

### Axe → ATK

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Ironhorn | 72 | ATK +8 |
| Steel Smash | 86 | ATK +10 |
| Solfront | 144 | ATK +16 |
| Sunraptor | 252 | ATK +23, CRIT DMG +12% |
| Rune Split | 432 | ATK +33, CRIT DMG +22% |

### Dual Axes → ATK

| ชิ้น | ราคา | Stats |
|------|------|-------|
| Gryphon Heart | 78 | ATK +9 |
| Aura Thorn | 94 | ATK +11 |
| Royal Slayer | 156 | ATK +18 |
| Eclipse Ripper | 273 | ATK +25, CRIT DMG +15% |
| Expression | 468 | ATK +36, CRIT DMG +25% |

**Source of truth:** `src/engine/shop/equipmentShopStats.ts`

