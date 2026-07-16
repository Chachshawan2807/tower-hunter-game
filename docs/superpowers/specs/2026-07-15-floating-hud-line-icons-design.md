# Floating HUD + Stroke Line Icons

**Date:** 2026-07-15  
**Status:** Implemented — superseded in part by Imperial Knight icon set (`npm run export:icons`)

## Goal

Remove shared cream/dark chrome bars behind Top HUD, Hero nameplate, and Bottom Nav. Present status and nav as floating text + universal black stroke icons. Keep contrast adaptive: ink black on `view-readable`, light ink on dark themes.

## Scope

| Surface | Change |
|---|---|
| `TopHud` / `.hud-chrome` | No bar, badge, gold chip, or settings plate backgrounds |
| `hero-showcase__nameplate` | No card chrome; name + path/level tags float |
| `BottomNav` / `.bottom-nav__dock` | No dock bar; tabs float; active = color / weight, not box fill |
| Nav + HUD icons (`paths.ts`) | Stroke-only universal symbols (character, star, tower, bag, shop, coin, gear) |

## Non-goals

- Overlay panel chrome (menus/modals keep panels)
- Full icon registry redesign for skills/shop catalog glyphs
- New layout structure beyond floating chrome removal

## Contrast

- `.view-readable`: `--ink-black` for icons/labels; EXP may keep dark-yellow accent per Art Bible
- Non-readable / dark stage: existing light text / secondary tokens
- EXP gauge: keep a thin progress track (functional, not a chrome plate)

## Files

- `src/styles/layout.css`
- `src/styles/view-readable.css`
- `src/styles/home-screen.css`
- `src/styles/ui-animations.css`
- `src/components/ui/icons/paths.ts`
- `src/components/layouts/BottomNav.tsx` (tower wrap simplification if needed)
