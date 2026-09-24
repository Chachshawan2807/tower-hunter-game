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
| **`npm run dev`** or **`npm run dev:3d`** | API + Vite with `--mode render3d` (battle WebGL **on** in dev) |
| `npm run dev:2d` | API + Vite without render3d mode (2D-only unless `?render3d=1`) |
| `npm run dev:web:3d` | Frontend only (no API) — use `npm run dev` for full stack |
| `VITE_BATTLE_3D=1` (build) | Battle WebGL in production |

Tower battles flow: `TowerView` → `ZoneBattleArena` → `BattleArena` → lazy `BattleArena3D` + `GameCanvas`.

## Battle animation pipeline

1. Server emits `AnimationEvent[]`; `useAnimationQueue` exposes `displayedEvents`.
2. `useEntityAnimation` + `mapEventToCharacterState` (engine) → `AnimationState` per fighter (`idle` / `attack` / `hit_cc` / `defeat`).
3. `BattleArena` passes `playerAnim` / `enemyAnim` into `BattleScene3D` → `BattleFighterMesh` lerps poses from `fighterPose.ts`.
4. With 3D on, 2D sprites hide (`hideSprites`); HP bars and HUD stay DOM.

Battle uses one `public/models/battle-fighter.glb` (clips: `idle`, `attack`, `hit_cc`, `defeat`). Player/enemy tint in `tintFighterMaterials.ts`. Regenerate placeholder: `npm run generate:battle-models`. **Authoring brief for real hero mesh:** [art-bible/BATTLE_FIGHTER_3D_BRIEF.md](art-bible/BATTLE_FIGHTER_3D_BRIEF.md).

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
