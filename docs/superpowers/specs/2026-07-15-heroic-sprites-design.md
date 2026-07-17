# Heroic Character Sprites — Design

**Date:** 2026-07-15  
**Status:** Implemented for enemies/NPCs — player hero superseded by `HeroPortrait` + `imperial-knight-hero.svg` (2026-07-17)

## Goal

Replace Rayman-style floating-limb chibi sheets with **connected 7.5–8 head** figures for enemy/NPC archetypes. The player hero uses a static Imperial Knight portrait SVG instead of a sprite sheet.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | Sprites + UI redesign; **sprites first** |
| Production | Hybrid: polished SVG → PNG now; AI polish later |
| Archetypes | 6 sheet bodies (knight, fantasy/vanguard, beast, demon, merchant, villager); player uses static portrait |
| Proportions | Art Bible §06 — 7.5–8 heads, limbs attached |
| Architecture | Modular SVG templates + sheet generator (Approach 1) |
| Runtime | Keep PNG sprite-sheet + CSS frame animation |
| Equipment | No SVG overlay on sheets (already removed) |

## Canvas & layout

- Frame: `120×200` (logical), sheet `480×800` → raster `@2x` = `960×1600`
- Centerline `x=60`; feet near `y=178`; crown near `y=28–34`
- Body height ≈ 150 → head unit ≈ 19px
- Paint order: shadow → cloak → far arm → legs → torso → near arm → head → gear → weapon

## Animation rows (unchanged contract)

| Row | State | Motion |
|-----|-------|--------|
| 0 | idle | subtle vertical bob |
| 1 | attack | forward lean / lunge |
| 2 | hit_cc | knockback tilt |
| 3 | defeat | fall + fade |

## Module layout

```
scripts/character-sprites/
  colors.mjs
  defs.mjs
  anatomy.mjs      # shared connected skeleton
  poses.mjs        # 4×4 transform offsets
  bodies/*.mjs     # one file per archetype
scripts/generateCharacterSheets.mjs  # compose → sharp PNG
```

## Out of scope (Phase 2+)

- AI polish of sheets
- HUD / Character menu visual redesign
- Per-item equipment recolor on sprite

## Success criteria

1. Limbs are continuous (no floating hands/feet)
2. Silhouettes read as path-distinct (warrior / knight / mystic / beast / demon / merchant / villager)
3. `npm run generate:sprites` refreshes all 6 PNG sheets
4. Character menu shows single clean figure (no equip overlay)
