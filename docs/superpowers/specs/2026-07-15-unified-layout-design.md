# Unified Layout Design

**Date:** 2026-07-15  
**Status:** Implemented

## Goal

Unify spacing and column alignment across every screen in the 9:16 game frame so related UI (lists, stats, balances, headers) shares one section rhythm and one row grid.

## Decisions

- **Scope:** Entire project (Home, Tower/Battle, Character, Bag, Skills, Shop, Settings, HUD/Shell).
- **Layout model:** Shared section rhythm + column alignment for same-category elements.
- **Approach:** Hybrid soft unify (CSS tokens everywhere) + structural CSS primitives only where row markup diverges.

## System rules

1. **Spacing scale (4px base):** `--space-1`…`--space-6` = 4/8/12/16/20/24.
2. **Content inset:** `--content-inline` (16px + safe-area) for HUD, stage, overlay body, home.
3. **Section gap:** `--section-gap` = `--space-4` between sections.
4. **Row columns:** icon `--row-icon-size` (40px) | main `1fr` | action `min-height: --touch-min`.
5. **Preserve Art Bible:** colors, fonts, radii, 9:16 frame, safe-area / bottom-nav — no aesthetic redesign.

## Primitives (CSS)

| Class | Role |
|-------|------|
| `.ui-row` | 3-column list row grid |
| `.ui-section` | Section stack with shared gap |
| `.ui-balance` | Currency / SP chip aligned with HUD gold pattern |

## Out of scope

- Engine/server logic, sprites, battle FX redesign, animation system rewrite.

## Success criteria

- Shared left/right content insets across screens.
- Bag / Shop / Skill rows share icon–text–action columns.
- Section spacing comes from the scale only.
- Touch targets ≥ 44px; no overlap with BottomNav.
