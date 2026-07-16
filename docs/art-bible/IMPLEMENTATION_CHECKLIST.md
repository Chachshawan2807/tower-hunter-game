# Art Bible — Implementation Checklist

Status of Master Art Bible wiring in code (updated: 2026-07-17).

## Wired in UI (production-ready)

| Section | Item | Location |
|---------|------|----------|
| 06 Character | Player hero portrait (Imperial Knight SVG) | `HeroPortrait.tsx`, `imperial-knight-hero.svg`, `npm run export:hero` |
| 06 Character | Enemy/NPC PNG sprite sheets (4×4, CSS frame-step) | `CharacterSpriteSheet.tsx`, `character.css`, `npm run generate:sprites` |
| 06 Character | Archetype registry (player / enemy / NPC) | `src/engine/art/characters/` |
| 07 Item | 6 equipment slots + path gear catalog | `src/engine/art/equipment/` |
| 07 Item | Character menu equipment panel (side slots + icons) | `CharacterEquipmentPanel.tsx` |
| 07 Item | Equip from bag + per-piece stat bonuses | `equipFromInventory.ts`, `statBonuses.ts`, `BagMenu` |
| Server | Persisted `player_equipment` + API | `005_player_equipment.sql`, equipment routes |
| 02–05 | Colors, zones, FX CSS, PWA textures | `tokens.css`, `textures.css`, `effects.css`, `towerZones.ts` |
| 04/05 | Zone background SVGs (4 zones, floors 1–100) | `public/assets/zones/` (`imperial-bastion` replaces Murim Pagoda) |
| 08 UI | Imperial Knight stroke icons + `GameIcon` | `public/icons/ui/`, `npm run export:icons` |
| 08 UI | Equipment slot silhouettes | `public/icons/equipment-slots/` |
| 08 UI | Settings overlay (audio, language) | `SettingsMenu.tsx`, `TopHud.tsx` |
| 08 UI | Readable HUD on all screens incl. battle | `view-readable.css`, `App.tsx` |
| 08 UI | Path skill tab theming (Imperial / Knight / Vanguard) | `menus.css`, `SkillMenu.tsx` |
| 08 UX | Safe-area insets, focus trap, arrow-key nav | `tokens.css`, `useFocusTrap`, `BottomNav` |
| 10 | Kenney CC0 audio + procedural fallback | `public/audio/`, `npm run fetch:audio`, `catalog.ts` |

## Optional upgrades (later)

| Section | Item |
|---------|------|
| 04/05 | Bitmap zone backgrounds (replace SVG vectors) |
| 06 | Animated player hero (portrait is static SVG today) |

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
// BagMenu: Equip → equipFromBag(slot, inventoryId)
```

## Asset scripts

| Command | Output |
|---------|--------|
| `npm run export:hero` | `public/assets/characters/imperial-knight-hero.svg` |
| `npm run export:icons` | Nav + bag/shop + Imperial UI icons under `public/icons/ui/` |
| `npm run generate:sprites` | Enemy/NPC PNG sheets under `public/assets/characters/` |
