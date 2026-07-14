# Heroic Character Sprites — Design

**Date:** 2026-07-15  
**Status:** Approved (Approach 1 + Option A proportions)

## Goal

Replace Rayman-style floating-limb chibi sheets with **connected 7.5–8 head** figures for all 7 archetypes, so Character/Home/Battle no longer look like stacked blobs.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | Sprites + UI redesign; **sprites first** |
| Production | Hybrid: polished SVG → PNG now; AI polish later |
| Archetypes | All 7 (murim, knight, fantasy, beast, demon, merchant, villager) |
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
3. `npm run generate:sprites` refreshes all 7 PNG sheets
4. Character menu shows single clean figure (no equip overlay)
