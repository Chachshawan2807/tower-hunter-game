# UI chrome redesign + overlap purge — Design note

**Date:** 2026-07-15

## Overlap fixes (project-wide)

1. **SVG EquipmentLayers on PNG sheets** — already unmounted from `CharacterFigure` (legacy marked `@deprecated`).
2. **Double motion** — disabled ISO wrap transforms (bob/lunge/shake/fall) while sprite-sheet frame animations run; dual motion + drop-shadow caused ghosting.
3. **Tower always “selected”** — gold border/glow only when `nav-btn--active`; idle tower is muted.
4. **Equip slot grid** — removed `grid-column: 2` weapon offset that looked accidental/stacked.
5. **Pedestal** — re-anchored under feet inside platform (was floating mid-figure).

## UI redesign

| Surface | Change |
|---------|--------|
| TopHud | Single `hud-chrome` bar (Lv + EXP + gold + settings) |
| BottomNav | Stone dock + always-visible labels; tower elevate kept, active-only gold |
| Character panel | Stage vignette + 2×3 icon slots (no letter badges) + vital/combat stat split |

## Follow-ups (later)

- AI polish of sprite sheets
- HP/MP true meters in Character panel
- Bag/Skills/Shop chrome pass to match
