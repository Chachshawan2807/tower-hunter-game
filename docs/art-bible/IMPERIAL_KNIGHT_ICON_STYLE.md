# Imperial Knight Hero — Icon & Symbol Style (Canonical)

**Status:** Approved — replaces Murim / ยุทธภพ visual language  
**Date:** 2026-07-16  
**Reference set:** `public/icons/equipment-slots/slot-{helm,chest,weapon,gloves,boots,cloak}.svg`

## Identity

**จักรวรรดิ อัศวิน ผู้กล้า** — medieval European imperial knight line art. Plate armor, great helms, crossed swords, citadel towers, heraldic coins. No wuxia robes, pagodas, ki motifs, or eastern martial arts silhouettes.

## Geometry & Stroke

| Rule | Value |
|------|-------|
| viewBox | `0 0 24 24` |
| Stroke | `#1a1a1a` in asset files; `currentColor` in UI/nav SVGs under `public/icons/ui/` |
| Stroke width | `1.85` default; `1.55` detail; `2` emphasis |
| Line caps / joins | `round` |
| Fills | `none` for silhouettes; small rivet dots may use `#1a1a1a` fill |
| Background | **Transparent only** — never embed UI panel fills in icon art |

## Motifs (use)

- Great helm, pauldrons, segmented plate (cuirass, gauntlet, sabaton)
- Crossed longswords, heater shield, sword & shield crest
- Stone citadel / battlement tower (not pagoda tiers)
- Imperial coin with inner seal
- Leather satchel, anvil/merchant stall, wax-seal dispatch
- Cloak with brooch clasp, draped fabric folds

## Motifs (forbidden)

- Topknot, headband, robe/sash wuxia silhouettes
- Pagoda / temple tier stacks
- Ki burst, dragon motif as path identity
- Katana-specific UI glyphs (use longsword / arming sword)
- Filled soft pill icons without stroke structure

## File layout

```
public/icons/ui/              — HUD, nav, skills, shop (stroke, currentColor)
public/icons/equipment-slots/ — Character doll slot silhouettes
public/favicon.svg            — Brand crest (crossed swords + tower)
docs/art/equipment-slots/reference/ — Source PNGs for slot rebuild
```

## Regeneration

```bash
npm run export:icons   # nav, bag, shop + HUD/skill/upgrade SVGs
npm run export:hero    # imperial-knight-hero.svg portrait
```

Icon path data lives in `scripts/exportImperialIcons.mjs`, `scripts/buildNavButtonSvgs.mjs`, `scripts/buildBagIconSvg.mjs`, `scripts/buildShopIconSvg.mjs`, and `scripts/buildHeroPortraitSvg.mjs`.

## Tower zones (visual)

| Floors | Zone | Theme |
|--------|------|-------|
| 1–30 | Forgotten Dungeon | Mixed dungeon stone |
| 31–60 | Imperial Bastion | Knight citadel ramparts |
| 61–90 | Knight's Citadel | High castle |
| 91–100 | Void Pinnacle | Dark fantasy edge |

Murim Pagoda zone art and naming are **removed**.
