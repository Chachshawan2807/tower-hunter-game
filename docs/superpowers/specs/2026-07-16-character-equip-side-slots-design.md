# Character Equipment Side Slots

**Date:** 2026-07-16  
**Status:** Implemented

## Goal

Replace the character menu’s bottom 6-slot equipment grid with empty square slots flanking the character figure — 3 on the left, 3 on the right — each showing a dedicated slot silhouette icon. Keep stats below unchanged.

## Decisions (locked)

| Topic | Choice |
|---|---|
| Layout | Approach 1: left column · figure · right column |
| Slot order (body topology) | Left: helm → chest → boots · Right: weapon → gloves → cloak |
| Slot content | Empty frame + icon only (no type/name text under figure) |
| Icons | New dedicated stroke silhouettes per slot (Art Bible §08 Aggressive Minimalism) |

## Layout

```
[helm]                      [weapon]
[chest]   [character fig]   [gloves]
[boots]                     [cloak]
```

- One horizontal composition (flex/grid): left rail · stage · right rail
- Remove the bottom `.char-equip-slots` 2×3 text cards entirely
- Slot size: compact square (~36–44px) so the figure remains the visual center
- Empty: muted border + faded silhouette (`opacity` / secondary ink)
- Equipped: rarity border classes retained; silhouette or gear glyph at full opacity
- Stats block (`char-menu__section`) stays below the doll row

## Icons

Add six stroke-only `GameIcon` names in `paths.ts` (same stroke weight language as HUD line icons):

| Slot | Icon intent |
|---|---|
| helm | Angular helmet / headpiece silhouette |
| chest | Chestplate / cuirass silhouette |
| gloves | Gauntlet / fist with cuff |
| boots | Tall boot / greave silhouette |
| cloak | Shoulder cloak / cape fold |
| weapon | Blade / sword silhouette (may reuse or tighten `skill-sword` geometry) |

Empty slots always show that slot’s silhouette. Equipped slots keep the same silhouette for scanability in v1 (no per-item art thumbnails required).

## Accessibility

- Each slot has an accessible name from existing i18n keys (`char.slot.*`)
- When equipped, expose gear name via `aria-label` / `title` (screen readers + hover hint)
- Visual UI remains icon-only per the locked decision

## Non-goals

- Paper-doll absolute anchoring onto body parts
- Tap-to-open detail panel / equip interaction rework
- Server, inventory, or gear catalog changes
- Per-item thumbnail art in slots

## Components / files

| Area | Change |
|---|---|
| `CharacterEquipmentPanel.tsx` | Rebuild doll as left · stage · right; icon-only slots |
| `character.css` | Side-rail layout; square slots; remove bottom text-card styles where unused |
| `paths.ts` (+ registry types) | Six slot silhouette icon defs |
| i18n | Reuse existing `char.slot.*` for a11y labels only |

## Out of scope files

- `CharacterMenu.tsx` stats section (keep as-is)
- `engine/art/equipment/*` slot definitions / resolve logic
- Equip-from-bag API flow
