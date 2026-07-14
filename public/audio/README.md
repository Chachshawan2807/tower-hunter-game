# Audio Assets

Shipped **OGG + MP3** studio files from [Kenney](https://kenney.nl) (CC0), installed by `npm run fetch:audio`.

| Path | Purpose |
|------|---------|
| `ambient/wind.ogg` | Wind through stone (loops) |
| `ambient/drip.ogg` | Water drip ambience (loops) |
| `ambient/tower_hum.ogg` | Low tower drone (loops) |
| `sfx/metal_hit.ogg` | Sword clash |
| `sfx/crit.ogg` | Critical strike |
| `sfx/flesh_crit.ogg` | Flesh impact |
| `sfx/footstep.ogg` | Turn step |
| `sfx/ui_click.ogg` | UI tap |
| `sfx/skill_cast.ogg` | Skill activation |
| `sfx/battle_win.ogg` | Victory sting |
| `sfx/battle_lose.ogg` | Defeat sting |
| `music/battle.ogg` | Battle BGM (loops) |
| `music/tower.ogg` | Tower ambient music (loops) |

Each asset also has an `.mp3` sibling for broader codec support.

Paths are registered in `src/audio/catalog.ts`. Missing files fall back to procedural synth in `src/audio/procedural/`.

To refresh from Kenney mirror: `npm run fetch:audio`  
To regenerate placeholder synth audio: `npm run generate:audio`

See `CREDITS.md` for attribution.
