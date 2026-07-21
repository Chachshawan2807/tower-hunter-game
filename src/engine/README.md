# Engine (Model)

Pure TypeScript game logic — **no React, no DOM, no database**.

## Modules

| Folder | Purpose |
|--------|---------|
| `formulas/` | Damage, hit chance, progression, equipment stats, status points |
| `states/` | Turn state machine, battle advance, action choice |
| `skills/` | Skill v2 catalog (`catalog/`), 4-slot loadout, resolver, enemy AI, SP/respec |
| `status/` | Runtime DoT/CC effects and on-hit procs |
| `art/` | Palette, tower zones, equipment visuals (constants only) |
| `shop/` | Shop gear catalog, per-item stats, sell prices (data only — purchases in server) |
| `player/` | Display-name helpers (non-combat metadata) |

## Rules

1. Functions take state in, return new state + `AnimationEvent[]`.
2. Side effects only via injected `rng` or explicit parameters.
3. New gameplay rules go here first; server calls engine, never the reverse.

Full architecture guide: [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
