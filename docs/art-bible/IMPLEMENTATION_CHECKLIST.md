# Art Bible — Implementation Checklist



สถานะการนำ Master Art Bible ไปใช้ในโปรเจ็กต์ (อัปเดต: 2026-07-14)



## ✅ Wired in UI (production-ready)



| หมวด | รายการ | ตำแหน่ง |

|------|--------|---------|

| 06 Character | Isometric chibi SVG models (7 archetypes) | `src/components/character/svg/iso/` |

| 06 Character | Character archetype registry (player/enemy/NPC) | `src/engine/art/characters/` |

| 06 Character | Sprite sheet animation (4×4 grid, CSS frame-step) | `CharacterSpriteSheet.tsx`, `character.css` |
| 06 Character | High-res PNG sprite sheets (2×, 960×1600) | `public/assets/characters/*-sheet.png`, `npm run generate:sprites` |
| 06 Character | Equipment layers (helm/chest/gloves/boots/cloak/weapon) | `equipmentLayers/` |

| 07 Item | 6 equipment slots + 18 gear pieces (3 paths × 6 slots) | `src/engine/art/equipment/` |

| 07 Item | Weapon SVG on character (9 types + rarity FX) | `src/components/character/svg/WeaponSvg.tsx` |

| 07 Item | Character menu equipment panel | `src/components/character/CharacterEquipmentPanel.tsx` |

| 07 Item | PATCH equip จากกระเป๋า + stat bonus ต่อชิ้น | `equipFromInventory.ts`, `statBonuses.ts`, `BagMenu` |

| Server | Persisted `player_equipment` table + API | `005_player_equipment.sql`, equipment routes |

| UI | Main stage + battle show equipped gear | `MainStage`, `BattleArena` |

| 02–09 | Colors, zones, FX CSS, PWA, textures on panels | `tokens.css`, `textures.css`, `effects.css` |

| 08 UI | SVG icon assets + GameIcon (menus + battle) | `src/components/ui/icons/` |

| 08 UI | Settings overlay (audio, language) | `SettingsMenu.tsx`, `TopHud.tsx` |

| 08 UI | view-readable HUD on all screens incl. battle | `view-readable.css`, `App.tsx` |

| 08 UX | Safe-area insets, focus trap, arrow-key nav | `tokens.css`, `useFocusTrap`, `BottomNav` |

| 04/05 | Zone background SVG assets (4 zones × floors 1–100) | `public/assets/zones/` |

| 08 UI | Path-specific skill tab theming (Murim/Knight/Fantasy) | `menus.css`, `SkillMenu.tsx` |

| 08 UI | Bag item localized names | `itemLabel.ts`, `BagMenu.tsx` |

| 10 | Kenney CC0 studio audio (OGG/MP3) + procedural fallback | `public/audio/`, `npm run fetch:audio`, `catalog.ts` |



## 🔶 Asset exists / partial



| หมวด | รายการ | หมายเหตุ |

|------|--------|----------|

| 06 | ISO SVG models (legacy / source art) | ยังอยู่ใน `svg/iso/` — runtime ใช้ PNG sprite sheet |



## 🎨 อัปเกรดภายหลัง (optional bitmap)



| หมวด | รายการ |

|------|--------|

| 04/05 | Bitmap zone backgrounds (แทน SVG vector) |



## API



```http

GET /api/users/:userId/equipment

→ { path, slots, statBonus }



PATCH /api/users/:userId/equipment

Body: { slot, inventoryId }

→ { slot, equipped, loadout, statBonusLines }

```



## Client



```ts

import { usePlayerEquipment } from "./hooks/usePlayerEquipment";



const { visual, statBonus, equipFromBag } = usePlayerEquipment(userId, skillPath);

// BagMenu: ปุ่ม Equip → equipFromBag(slot, inventoryId)

```


