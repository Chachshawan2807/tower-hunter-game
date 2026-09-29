# 3D rendering — Three.js + React Three Fiber

Optional **view-layer** stack for future battle/tower scenes. Game logic stays in `src/engine/`; WebGL lives under `src/components/render3d/`.

## Packages

| Package | Role |
|---------|------|
| `three` | WebGL scene graph, materials, loaders |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers (controls, grids, environments, glTF) |
| `@react-three/eslint-plugin` | Frame-loop performance rules (ESLint) |

## Directory map

```
src/
├── engine/art/render3d.ts     # Palette-aligned hex colors (no Three import)
├── components/render3d/       # Canvas, scenes, dev preview
│   ├── GameCanvas.tsx         # Single <Canvas> entry — use for all 3D views
│   ├── DevCalibrationScene.tsx
│   └── render3dConfig.ts      # DPR cap, camera, gl options
├── utils/render3dEnv.ts       # Dev preview toggles
public/models/                 # Place .glb / .gltf assets here
```

## Enabling 3D

| Command / flag | Effect |
|----------------|--------|
| **`npm run dev`** | API + Vite — **2D default**; turn on **Settings → 3D battle arena** (saved in `localStorage`) |
| **`npm run dev:3d`** | Same + Vite `--mode render3d` (dev calibration PiP; optional `?render3d=1`) |
| **`npm run dev:2d`** | Alias of default dev (2D-first) |
| `npm run dev:web:3d` | Frontend only (no API) — use `npm run dev` for full stack |
| `VITE_BATTLE_3D=1` (build) | Default battle WebGL on when the player has not chosen 2D/3D in Settings |

**Player control:** Settings → **3D battle arena** persists `tower-hunter-battle-3d` (`1` / `0`) and overrides env defaults when set.

Tower battles flow: `TowerView` → `ZoneBattleArena` → `BattleArena` → lazy `BattleArena3D` + `GameCanvas`.

## Battle animation pipeline

1. Server emits `AnimationEvent[]`; `useAnimationQueue` exposes `displayedEvents`.
2. `useEntityAnimation` + `mapEventToCharacterState` (engine) → `AnimationState` per fighter (`idle` / `attack` / `hit_cc` / `defeat`).
3. `BattleArena` passes `playerAnim` / `enemyAnim` into `BattleScene3D` → `BattleFighterMesh` lerps poses from `fighterPose.ts`.
4. With 3D on, 2D sprites hide (`hideSprites`); HP bars and HUD stay DOM.

Battle uses one `public/models/battle-fighter.glb` (clips: `idle`, `attack`, `hit_cc`, `defeat`). Player/enemy tint in `tintFighterMaterials.ts`. Regenerate placeholder: `npm run generate:battle-models`.

**Player hero in battle:** ink turnaround billboards (`battle-hero-*.png`) by default. Modeler GLB → `public/models/battle-hero.glb` + `BATTLE_HERO_GLTF_AUTHORED = true`. Procedural `npm run generate:battle-hero` is dev-only (not shown in battle).

**Authoring brief for sculpted hero mesh:** [art-bible/BATTLE_FIGHTER_3D_BRIEF.md](art-bible/BATTLE_FIGHTER_3D_BRIEF.md).

## Dev calibration PiP

When 3D flags are on but you are **not** in a tower battle, a small calibration view may appear. It is suppressed during active battles.

## Vite

- `optimizeDeps` pre-bundles `three` and R3F for faster cold start.
- Production `manualChunks` groups `vendor-three` for cache-friendly splits.

## MCP & tooling

- **`.cursor/mcp.json`** — `mcp-game-helper` remains for combat balance / simulation, not 3D authoring.
- There is no required Three.js MCP; use Blender → glTF export and browser devtools for WebGL debugging.
- Optional future additions: Draco/KTX2 decoders in `public/`, postprocessing pass module under `render3d/`.

## Architecture boundaries

`scripts/validate-architecture.ts` fails if `src/engine/` imports `three` or `@react-three/*`. Swapping R3F for imperative Three.js later only rewrites `src/components/render3d/`.

See also [ARCHITECTURE.md](ARCHITECTURE.md) (View layer).

## Product direction (2D today, 3D-ready)

The game **ships 2D-first** (sprites, ink turnarounds, DOM HUD). WebGL is an **alternate view** on the same server snapshots and `AnimationEvent[]` — not a second combat sim.

| Area | Today | Future (same architecture) |
|------|--------|----------------------------|
| Combat authority | `src/engine/` + server | Unchanged |
| Battle characters | 2D sprites; optional WebGL via Settings | Authored `battle-hero.glb`, enemy variants, zone props |
| Tower zones | 2D CSS / zone art | Optional `TowerZonePresentationMode` WebGL backdrops (`hybrid` = 3D floor + DOM HUD) |
| Assets | `public/models/*.glb`, lazy `BattleArena3DSlot` | Draco/KTX2, more clips, per-floor props |
| Toggle | Settings → **3D battle arena** (`useBattle3dSetting`) | Same preference; production default via `VITE_BATTLE_3D=1` |

**Do not** move damage, turns, or drops into Three.js. New 3D work = `src/components/render3d/` + `public/models/` + `src/engine/art/render3d.ts` only.

**Types:** `BattlePresentationMode` / `TowerZonePresentationMode` in `src/types/presentation.interface.ts` (view contracts only).

**Authoring:** [art-bible/BATTLE_FIGHTER_3D_BRIEF.md](art-bible/BATTLE_FIGHTER_3D_BRIEF.md) (Meshy/Tripo → Blender cleanup → GLB handoff).
