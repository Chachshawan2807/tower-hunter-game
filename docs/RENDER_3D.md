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

## Dev preview (smoke test)

Production builds do **not** load the 3D chunk unless you wire a scene into gameplay.

Enable in development:

1. `npm run dev:web:3d` (loads `.env.render3d`), or
2. `VITE_RENDER_3D_DEV=1` in `.env`, or
3. Append `?render3d=1` to the dev URL.

A small picture-in-picture calibration view appears (gold pedestal + grid). Remove or replace when battle 3D ships.

## Adding a battle scene (checklist)

1. Map `AnimationEvent` → motion in **pure TS** (e.g. `src/components/render3d/battle/`) — no combat math.
2. Mount `<GameCanvas>` inside `BattleArena` (or swap `TowerView` background) with props from `useBattle`.
3. Load glTF via `useGLTF` from drei or `GLTFLoader` from three.
4. Reuse `RENDER_3D_ART` / `ART_PALETTE` for materials; avoid hardcoded hex in meshes.
5. Keep `dpr` capped via `RENDER_3D_MAX_DPR` for mobile.

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
