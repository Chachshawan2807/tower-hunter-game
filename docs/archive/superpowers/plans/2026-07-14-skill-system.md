# Skill System — Completed Summary

> **Status:** Implemented (2026-07). Superseded by skill v2 — see [2026-07-21-skill-system-v2-design.md](../../../superpowers/specs/2026-07-21-skill-system-v2-design.md). Archived v1 reference.

**Spec:** [../specs/2026-07-14-skill-system-design.md](../specs/2026-07-14-skill-system-design.md)

## What shipped

| Area | Deliverable |
|------|-------------|
| Engine | 4 skills per path (`imperial`, `knight`, `vanguard`), 2-slot loadout, SP upgrades, enemy skills + AI |
| Server | Loadout/upgrades/unlocks CRUD, SP grants on level-up and boss kills |
| UI | `SkillMenu`, loadout picker, upgrade panel, battle active-skill buttons |
| DB | `004_skill_system.sql`, `005_imperial_skill_paths.sql`, `006_player_equipment.sql`, `007_skill_unlocks.sql` |

## Key modules

| Path | Module | Skill IDs (legacy prefix retained in DB) |
|------|--------|---------------------------------------------|
| `imperial` | `src/engine/skills/imperial.ts` | `murim_palm`, `murim_dash`, `murim_qi`, `murim_dragon` |
| `knight` | `src/engine/skills/knight.ts` | `knight_slash`, `knight_guard`, `knight_bash`, `knight_charge` |
| `vanguard` | `src/engine/skills/vanguard.ts` | `fantasy_bolt`, `fantasy_freeze`, `fantasy_heal`, `fantasy_meteor` |

## API routes

- `GET/PUT /api/skills/:userId/loadout`
- `GET/POST /api/skills/:userId/upgrade`
- `GET/POST /api/skills/:userId/unlock` — SP-gated per-skill unlock (`player_skill_unlocks`)

## Verification

```bash
npm run validate   # engine + architecture boundaries + typecheck
npm run db:check   # schema tables present
```

## Notes

- Path rename `murim`/`fantasy` → `imperial`/`vanguard` applied in `005_imperial_skill_paths.sql`.
- Skill **IDs** keep `murim_*` / `fantasy_*` prefixes for DB/i18n compatibility; module filenames match paths.
- `unlockLevel` on skill definitions is legacy metadata; runtime unlock state is SP-gated via `player_skill_unlocks`.
