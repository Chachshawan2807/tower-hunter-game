# Tower Hunter — Documentation Index

100-floor turn-based tower climbing game. **Stack:** Vite 6 + React 19 PWA (client), Hono + PostgreSQL `pg` (API/server). Strict MVC — pure TypeScript engine, React view, server-authoritative controller.

## Architecture

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | MVC layers, battle data flow, feature checklist, boundary rules |

**No Phaser** — turn-based combat uses engine + animation queue, not a real-time game loop.

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
| Skill system (v1 — archived) | [archive/superpowers/specs/2026-07-14-skill-system-design.md](archive/superpowers/specs/2026-07-14-skill-system-design.md) | [archive/superpowers/plans/2026-07-14-skill-system.md](archive/superpowers/plans/2026-07-14-skill-system.md) |
| Heroic sprites (enemies/NPCs; player portrait separate) | [specs/2026-07-15-heroic-sprites-design.md](superpowers/specs/2026-07-15-heroic-sprites-design.md) | [plans/2026-07-15-heroic-sprites.md](superpowers/plans/2026-07-15-heroic-sprites.md) |
| Unified layout (implemented) | [specs/2026-07-15-unified-layout-design.md](superpowers/specs/2026-07-15-unified-layout-design.md) | [plans/2026-07-15-unified-layout.md](superpowers/plans/2026-07-15-unified-layout.md) |
| Floating HUD + line icons (implemented) | [specs/2026-07-15-floating-hud-line-icons-design.md](superpowers/specs/2026-07-15-floating-hud-line-icons-design.md) | — |
| Character equip side slots (implemented) | [specs/2026-07-16-character-equip-side-slots-design.md](superpowers/specs/2026-07-16-character-equip-side-slots-design.md) | — |
| Shop-only gear scaling (implemented) | [specs/2026-07-21-shop-gear-scaling-design.md](superpowers/specs/2026-07-21-shop-gear-scaling-design.md) | — |
| Skill system v2 (implemented) | [specs/2026-07-21-skill-system-v2-design.md](superpowers/specs/2026-07-21-skill-system-v2-design.md) | [plans/2026-07-22-skill-equipment-v2.md](superpowers/plans/2026-07-22-skill-equipment-v2.md) |
| Equipment balance v2 (implemented) | [specs/2026-07-22-equipment-balance-design.md](superpowers/specs/2026-07-22-equipment-balance-design.md) | (same plan as skill v2) |

## Audio

| Doc | Purpose |
|-----|---------|
| [../public/audio/README.md](../public/audio/README.md) | Expected asset paths and catalog wiring |

## Tower Zones (floors 1–100)

| Floors | Zone ID | Theme |
|--------|---------|-------|
| 1–30 | `forgotten-dungeon` | Dungeon stone |
| 31–60 | `imperial-bastion` | Imperial citadel ramparts |
| 61–90 | `knight-citadel` | High castle |
| 91–100 | `void-pinnacle` | Void / boss floors |

**Skill v2 catalog:** type-based (Active / Passive / CC / Movement) — no path lock. `player_stats.active_skill_path` (`imperial` · `knight` · `vanguard`) still drives equipment visuals; legacy IDs migrated in `005_imperial_skill_paths.sql` and `012_skill_v2.sql`.

## Database

Migrations in `src/server/db/schema/` — applied by `npm run seed` or `npm run db:check`:

| File | Purpose |
|------|---------|
| `001_initial.sql` | users, wallet, inventory, mailbox, localization |
| `002_player_stats.sql` | `player_stats` combat progression |
| `003_player_skills.sql` | `active_skill_path` column |
| `004_skill_system.sql` | `skill_points`, loadout, upgrade ranks |
| `005_imperial_skill_paths.sql` | path rename `murim`→`imperial`, `fantasy`→`vanguard` |
| `006_player_equipment.sql` | `player_equipment` paper-doll slots |
| `007_skill_unlocks.sql` | `player_skill_unlocks` (SP-gated skill unlock) |
| `008_drop_auto_dismantle.sql` | Drop `auto_dismantle_common` (no gear rarity tiers) |
| `009_status_points.sql` | `status_points` pool + primary stat allocations on `player_stats` |
| `010_status_point_grant_rate.sql` | Grant rate documented in engine (`calculateStatusPointGrant`); no DDL |
| `011_status_alloc_secondary.sql` | Secondary stat allocations (crit, eva, acc, etc.) |
| `012_skill_v2.sql` | 4-slot `player_skill_loadout_v2`, expanded upgrade ranks, legacy skill ID migration |

No `supabase/` folder — schema is managed via raw SQL + `pg`. Env: `.env.example` (`DATABASE_URL`, `PORT`).

## Validation

```bash
npm run validate    # engine rules + architecture import boundaries + typecheck
npm run db:check    # connect, migrate, verify skill v2 + status schema
```
