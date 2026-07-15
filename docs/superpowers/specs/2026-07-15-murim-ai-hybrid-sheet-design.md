# Murim AI Hybrid Sprite Sheet — Design

**Date:** 2026-07-15  
**Status:** Approved (Approach 1 Hybrid + Style B anime + Scope B full sheet)

## Goal

Replace the procedural Murim starter sprite sheet with a **stylized anime/game-illustration** dark-ronin hero derived from the player-supplied reference, covering **idle / attack / hit_cc / defeat**, without changing the runtime sprite-sheet contract.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | Full Murim path sheet only (other archetypes unchanged) |
| Style | Stylized anime, 7.5–8 heads, readable on mobile |
| Production | Hybrid: AI master poses → assemble 4×4 PNG |
| Runtime | Keep `CharacterSpriteSheet` + URLs / frame size |
| Regeneration | Murim PNG is hand-authored; skip in procedural `generate:sprites` |

## Canvas & layout (unchanged contract)

- Frame: `240×400` (@2× from logical `120×200`)
- Sheet: `960×1600` (4 cols × 4 rows)
- Rows: `idle` → `attack` → `hit_cc` → `defeat`
- Feet near bottom of frame; character centered on vertical midline

## Pose bible

| Row | State | Pose |
|-----|-------|------|
| 0 | idle | Grounded ready stance, katana low-right, left fist at side; 4 frames = subtle breath/bob |
| 1 | attack | Forward lunge / katana slash arc |
| 2 | hit_cc | Knockback lean, recoil |
| 3 | defeat | Collapse / fade-ready tilt |

## Asset layout

```
public/assets/characters/
  murim-sheet.png          # runtime sheet (AI-assembled)
  murim-sheet.svg          # leftover procedural optional; not source of truth for murim
docs/art/murim-masters/    # AI master frames (idle, attack, hit, defeat)
scripts/assembleMurimAiSheet.mjs
```

## Out of scope

- Knight / Fantasy / enemy / NPC reskins
- Live2D / skeletal animation
- Equipment overlay recolor on this sheet

## Success criteria

1. Home `MainStage` Murim figure reads as the dark-ronin reference in anime 2D
2. All four animation rows play via existing CSS sheet animation
3. `npm run generate:sprites` does **not** overwrite `murim-sheet.png`
4. Frame/grid contract matches `characterSheetConfig.ts`
