# Audio Assets

No audio files are shipped in the repo. Add OGG files under the paths below and register them in `src/audio/catalog.ts`.

## SFX (`src/audio/catalog.ts` → `SFX_CATALOG`)

| Catalog ID | File path | Notes |
|------------|-----------|-------|
| `metal_hit` | `sfx/metal_hit.ogg` | Sword clash |
| `metal_crit` | `sfx/crit.ogg` | Critical strike |
| `flesh_crit` | `sfx/flesh_crit.ogg` | Flesh impact |
| `footstep` | `sfx/footstep.ogg` | Turn step |
| `ui_click` | `sfx/ui_click.ogg` | UI tap |
| `skill_cast` | `sfx/skill_cast.ogg` | Skill activation |
| `battle_win` | `sfx/battle_win.ogg` | Victory sting |
| `battle_lose` | `sfx/battle_lose.ogg` | Defeat sting |

## Ambient (`AMBIENT_CATALOG`)

| Catalog ID | File path | Loops |
|------------|-----------|-------|
| `wind` | `ambient/wind.ogg` | yes |
| `drip` | `ambient/drip.ogg` | yes |
| `tower_hum` | `ambient/tower_hum.ogg` | yes |

## Music (`MUSIC_CATALOG`)

| Catalog ID | File path | Loops |
|------------|-----------|-------|
| `battle_tension` | `music/battle.ogg` | yes |
| `tower_ambient` | `music/tower.ogg` | yes |

OGG is the primary format. Optional `.mp3` siblings can improve codec support in some browsers.

If a file is missing, playback is skipped silently (`src/audio/catalog.ts`).

## Populate assets

```bash
npm run fetch:audio      # Download Kenney CC0 packs into public/audio/
npm run generate:audio   # Synthesize placeholder WAV → OGG/MP3 under public/audio/
```
