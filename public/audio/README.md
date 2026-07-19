# Audio Assets

No audio files are shipped in the repo. Add your own assets under the folders below and register paths in `src/audio/catalog.ts`.

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

OGG is the primary format. Optional `.mp3` siblings improve codec support in some browsers.

If a file is missing, the game falls back to procedural synth in `src/audio/procedural/`.
