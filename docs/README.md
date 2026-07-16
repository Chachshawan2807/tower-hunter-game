# Tower Hunter — Documentation Index

100-floor turn-based tower climbing game. **Stack:** Vite 6 + React 19 PWA (client), Hono + PostgreSQL `pg` (API/server). Strict MVC — pure TypeScript engine, React view, server-authoritative controller.

## Art & Visual

| Doc | Purpose |
|-----|---------|
| [art-bible/MASTER_ART_BIBLE.md](art-bible/MASTER_ART_BIBLE.md) | Canonical visual spec (zones, palette, UI, audio) |
| [art-bible/IMPERIAL_KNIGHT_ICON_STYLE.md](art-bible/IMPERIAL_KNIGHT_ICON_STYLE.md) | UI & equipment slot icon rules (replaces Murim visual language) |
| [art-bible/IMPLEMENTATION_CHECKLIST.md](art-bible/IMPLEMENTATION_CHECKLIST.md) | What is wired in code vs pending art |

**Code references:** `src/styles/tokens.css`, `src/engine/art/`, `public/icons/`

## Design Specs & Plans (`superpowers/`)

Historical design notes and implementation plans. Check the **Status** line in each file.

| Area | Spec | Plan |
|------|------|------|
| Skill system (implemented) | [specs/2026-07-14-skill-system-design.md](superpowers/specs/2026-07-14-skill-system-design.md) | [plans/2026-07-14-skill-system.md](superpowers/plans/2026-07-14-skill-system.md) |
| Heroic sprites (enemies/NPCs; player portrait separate) | [specs/2026-07-15-heroic-sprites-design.md](superpowers/specs/2026-07-15-heroic-sprites-design.md) | [plans/2026-07-15-heroic-sprites.md](superpowers/plans/2026-07-15-heroic-sprites.md) |
| Unified layout (implemented) | [specs/2026-07-15-unified-layout-design.md](superpowers/specs/2026-07-15-unified-layout-design.md) | [plans/2026-07-15-unified-layout.md](superpowers/plans/2026-07-15-unified-layout.md) |
| Floating HUD + line icons (implemented) | [specs/2026-07-15-floating-hud-line-icons-design.md](superpowers/specs/2026-07-15-floating-hud-line-icons-design.md) | — |
| Character equip side slots (implemented) | [specs/2026-07-16-character-equip-side-slots-design.md](superpowers/specs/2026-07-16-character-equip-side-slots-design.md) | — |

## Audio

| Doc | Purpose |
|-----|---------|
| [../public/audio/README.md](../public/audio/README.md) | Asset paths and regeneration commands |
| [../public/audio/CREDITS.md](../public/audio/CREDITS.md) | Kenney CC0 attribution |

## Tower Zones (floors 1–100)

| Floors | Zone ID | Theme |
|--------|---------|-------|
| 1–30 | `forgotten-dungeon` | Dungeon stone |
| 31–60 | `imperial-bastion` | Imperial citadel ramparts |
| 61–90 | `knight-citadel` | High castle |
| 91–100 | `void-pinnacle` | Void / boss floors |

**Skill paths:** `imperial` · `knight` · `vanguard` (legacy DB values `murim`/`fantasy` migrated in `005_imperial_skill_paths.sql`).
