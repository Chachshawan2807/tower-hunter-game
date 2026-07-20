# Tower Hunter: Master Art Bible

เอกสารมาตรฐานการออกแบบงานศิลป์ (Art Specification Document)

จัดทำขึ้นตามหลักการวางผังโครงสร้างระบบ (Blueprinting) เพื่อควบคุมความเป็นเอกภาพเชิงทัศนศิลป์ (Visual Integrity) ของเกมไต่อัตโนมัติ 100 ชั้น ภายใต้แนวคิด **Aggressive Minimalism** (มินิมอลดุดัน สะท้อนการเอาตัวรอด)

> **สถานะการนำไปใช้:** ดู [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) สำหรับรายการที่ implement ในโค้ดแล้ว vs งานศิลป์ที่ต้องทำด้วยมือ

---

## 01 — Art Direction (ทิศทางงานศิลป์และภาพรวม)

### Visual Pillars

**แก่นเรื่อง (Core Concept):** การท้าทายตนเองเพื่อเอาชีวิตรอดในหอคอยแห่งการทดลอง 100 ชั้น ต่อสู้กับสัตว์ประหลาดและผู้ท้าทายคนอื่นเพื่อข้ามขีดจำกัดมนุษย์

**การผสมผสานธีม (Hybrid Theme):** ผสาน 3 อารมณ์หลักอย่างกลมกลืน (โทนภาพหลักปัจจุบันเน้น **Imperial Knight** — ดู [IMPERIAL_KNIGHT_ICON_STYLE.md](./IMPERIAL_KNIGHT_ICON_STYLE.md)):

| ธีม | ลักษณะ |
|-----|--------|
| แนวจักรวรรดิ อัศวิน (Imperial Knight) | เกราะแผ่น เหล็กกล้า ปราสาทยุคกลาง — **ภาษาภาพหลักของ UI และฮีโร่** |
| แนวอัศวิน พลังเวท (Knight & Magic) | ความเคร่งขรึม ชุดเกราะเหล็ก และสัญลักษณ์ยุคกลาง |
| แนวแวนการ์ด สัตว์ร้าย (Vanguard & Beast) | สิ่งมีชีวิตกลายพันธุ์ ความลึกลับของอารยธรรมโบราณ |

**อารมณ์และความรู้สึก:** ผู้เล่นต้องรู้สึกถึงความกดดัน ท้าทาย และมุ่งมั่นที่จะเอาตัวรอด บรรยากาศจะไม่มีความสดใส แต่เน้นความสมดุลของโทนสีธรรมชาติที่ไม่จางหรือเข้มเกินไป

**Visual Reference:** The Boundless Necromancer — ลายเส้นคมชัด ดุดัน แสงเงาคอนทราสต์สูง สภาพแวดล้อมแปลกแยกจากโลกภายนอก

---

## 02 — Color Bible (จานสีแห่งหอคอย)

การควบคุมโทนสีเป็น **Unified Palette** โทนธรรมชาติ ไม่ฉูดฉาด แต่ทรงพลัง  
ข้อความ/องค์ประกอบสำคัญใช้ **สีดำ (Pure Black `#000000`)** เพื่อ High Visibility

| ประเภท | รหัสสี | การใช้งาน | ความหมาย |
|--------|--------|-----------|----------|
| Primary Black | `#0D0D0D` – `#1A1A1A` | ฉากหลัง, พื้นหลังเมนู Overlay | ความมืดมิด, กดดัน |
| Pure Black (Ink) | `#000000` | ตัวอักษร UI ทั้งหมด | ความชัดเจนสูงสุด |
| Crimson Red | `#8B0000` – `#B22222` | DoT/เลือดไหล, คริติคอล, HP ศัตรู | อันตราย, การต่อสู้ |
| Dark Yellow | `#DAA520` – `#B8860B` | เมนูสกิล Imperial path, แสงรำไร, EXP | ความหวังที่ริบหรี่ |
| Antique Gold | `#C5A059` – `#996515` | Gold, ไอเทม Rare+, Settings | รางวัล, ความสูงส่ง |

**โค้ดอ้างอิง:** `src/engine/art/palette.ts`, `src/styles/tokens.css`

---

## 03 — Material Bible (พื้นผิวและวัสดุ)

วัสดุทุกชิ้นสะท้อน **Aged & Battle-tested** — 3 คุณลักษณะหลัก:

1. **Ancient Bricks** — Roughness สูง รอยแตกร้าว ไม่สะท้อนแสง
2. **Monolithic Walls** — Aged/Weathered คราบเขม่า เลือดแห้ง ตะไคร่น้ำ
3. **Dark Iron & Steel** — Semi-Glossy รอยขีดข่วน หนักแน่น ดุดัน

**โค้ดอ้างอิง:** `src/engine/art/materials.ts`

---

## 04 — Environment Bible (สภาพแวดล้อม)

สัดส่วนหลัก **9:16 แนวตั้ง** — Vertical Perspective ส่งเสริมความรู้สึก "ไต่ขึ้นสู่ที่สูง"

**Design Language:** เรขาคณิตแข็งกร้าว มุมแหลม เส้นตรงดิ่ง

องค์ประกอบฉาก: กำแพงหินบีบซ้าย-ขวา, หินศิลาโบราณ, ต้นไม้ไร้ใบ, รั้วเหล็ก/โซ่ตรวนแขวนดิ่ง

**โค้ดอ้างอิง:** `src/styles/environment.css`

---

## 05 — Building Bible (สถาปัตยกรรมหอคอย 100 ชั้น)

4 ช่วงธีมหลัก (สอดคล้อง Exponential Scaling 8%):

| ชั้น | โซน | ธีม |
|------|-----|-----|
| 1–30 | The Forgotten Dungeon | คุกใต้ดินหินหยาบ คบเพลิง โซ่ตรวน |
| 31–60 | The Imperial Bastion | ปราการจักรวรรดิ กำแพงหิน หอคอยยุคกลาง |
| 61–90 | The Knight's Citadel | ปราสาทเหล็กโกธิค ซุ้มโค้งแหลม |
| 91–100 | The Void Pinnacle | แท่นหินลอย ความว่างดำ ออร่าทอง-แดง บอสทุกชั้นลงท้าย 0 |

**โค้ดอ้างอิง:** `src/engine/art/towerZones.ts`

---

## 06 — Character Bible

ตัวละครจัดกึ่งกลาง 2D + Animation Queue (MVC)

- **สัดส่วน:** 7.5–8 ส่วน ท่วงท่ามั่นคงดุดัน
- **สีผิว:** Natural Skin Tones
- **3 สายสกิล:** Imperial (จักรวรรดิ), Knight (เกราะเหล็ก), Vanguard (แวนการ์ด/เวท)
- **ฮีโร่หลัก:** Imperial Knight line art — `public/assets/characters/imperial-knight-hero.svg` (`HeroPortrait`)

**Animation States:** `idle` | `attack` | `hit_cc` | `defeat`

**โค้ดอ้างอิง:** `src/engine/art/animationStates.ts`

---

## 07 — Item Bible

```
ไอเทมสวมใส่
 ├── จักรวรรดิ (Imperial)  → Longsword, Dual Blades, Staff
 ├── อัศวิน (Knight)       → Greatsword, Greataxe, Spear
 └── แวนการ์ด (Vanguard)   → Wand, Bow, Dual Daggers
```

Gear ได้จาก **ร้านค้าเท่านั้น** (ไม่มี drop จากการต่อสู้) — แต่ละชิ้นมี stats กำหนดใน catalog โดยตรง ไม่มีระดับ rarity สำหรับ shop gear

**โค้ดอ้างอิง:** `src/engine/art/weaponTypes.ts`, `src/engine/shop/equipmentShopItems.ts`

---

## 08 — UI Bible

- **High contrast:** ตัวอักษรสีดำเท่านั้นบนแผงอ่านง่าย
- **9:16 Center-locked**
- **HUD:** ซ้ายบน = ชื่อ/Lv/EXP | ขวาบน = Gold + Settings ทอง
- **Bottom Nav:** 5 ปุ่มไอคอน → Overlay SPA + ปุ่ม X
- **Font:** Sans-serif หา ตัดขอบคม ไม่มีหัว

**โค้ดอ้างอิง:** `src/styles/view-readable.css`, `src/styles/layout.css`

---

## 09 — Effect Bible

Performance Optimized (PWA):

- **Environment:** หมอก/ควัน (เลเยอร์โปร่งเทา), ฝน (เส้นบางแนวตั้ง)
- **Combat:** ไฟ/ระเบิด (คริมสัน-ทอง, เฉพาะ Execution), พิษ (ออร่าม่วงดำ), แช่แข็ง (ผลึกใส 1 เทิร์น)

**โค้ดอ้างอิง:** `src/styles/effects.css`, `src/styles/environment.css`

---

## 10 — Audio Bible

| ประเภท | ลักษณะ |
|--------|--------|
| Music | กลองศึก + Guzheng/Pipa + Gothic Chants |
| Ambient | ลมหวีดหวิว, น้ำหยดก้อง |
| SFX | เหล็กปะทะ, ฝีเท้าหนักบนหิน (ตาม Action Gauge) |

> **สถานะ:** OGG/MP3 assets ใน `public/audio/` (`npm run fetch:audio` จาก Kenney; `npm run generate:audio` สำหรับ procedural placeholder) + Settings volume/mute — procedural เป็น fallback หากไฟล์หาย
