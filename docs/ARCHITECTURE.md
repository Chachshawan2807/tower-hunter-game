# Architecture — React + Engine (Server-Authoritative MVC)

100-floor turn-based tower game. **No Phaser / no full game framework** — the stack is **Vite + React 19** (view), **pure TypeScript engine** (model), and **Hono + PostgreSQL** (controller).

## Layer overview

```
Player input (React UI)
        │ intent only
        ▼
  src/utils/api.ts  ──HTTP──▶  src/server/api/routes/*
        │                              │
        │                              ▼
        │                     src/server/* (validate, DB, locks)
        │                              │
        │                              ▼
        │                     src/engine/* (pure game logic)
        │                              │
        │◀── snapshot + AnimationEvent[] ──│
        ▼
  hooks (useBattle, usePlayer, …)
        ▼
  components (read-only render + animation queue)
```

| Layer | Path | Responsibility | Must NOT |
|-------|------|----------------|----------|
| **Engine (Model)** | `src/engine/` | Formulas, turn state machine, skills, status, art constants | React, DOM, `fetch`, DB |
| **Server (Controller)** | `src/server/` | Auth/validation, DB, wallet locks, call engine, grant rewards | React, DOM |
| **Client API** | `src/api/` + `src/utils/api.ts` | Typed HTTP client; sends intents, receives DTOs | Game logic |
| **Hooks** | `src/hooks/` | Bridge API ↔ React state; animation queue | Damage/gold formulas |
| **View** | `src/components/` | Layout, HUD, menus, battle presentation | Authoritative calculations |

## Canonical data flow (battle)

Reference implementation — copy this pattern for new gameplay systems.

### 1. Engine — pure logic

- Turn loop: `src/engine/states/turnStateMachine.ts`
- Battle advance: `src/engine/states/battleAdvance.ts`
- Output: `BattleSnapshot` + `AnimationEvent[]` via `src/engine/types.ts`

Engine functions take state in, return new state + events. No side effects except explicit RNG injection.

### 2. Server — validate & persist

- Routes: `src/server/api/routes/battle.ts` (`/start`, `/step`, `/intent`)
- Service: `src/server/battle/service.ts` loads player stats from DB, builds `BattleState`, calls engine, stores session, grants rewards server-side.

Client sends **intent** (`PlayerIntent`), never raw damage or gold deltas.

### 3. Hook — state bridge

- `src/hooks/useBattle.ts` calls `api.startBattle` / `api.battleStep` / `api.battleIntent`
- Pushes `animationQueue` into `src/hooks/useAnimationQueue.ts`
- Exposes `displayedEvents`, `battleSnapshot`, `busy`, action handlers to UI

### 4. View — render only

- `src/components/battle/BattleArena.tsx` — layout, HP bars, sprites
- `src/components/battle/CombatFxCanvas.tsx` — optional Canvas FX driven by `displayedEvents`
- `src/App.tsx` wires hooks to shell (`GameShell`, `TopHud`, `TowerView`)

UI reads `battleSnapshot` and `displayedEvents`; it does **not** re-simulate combat.

## Adding a new feature (checklist)

Use this order every time:

1. **Types** — extend `src/types/` (or `src/engine/types.ts` barrel) with strict interfaces.
2. **Engine** — add pure functions under the right `src/engine/` subfolder (one concern per file, &lt;200 lines).
3. **Server** — route + service: validate input, DB read/write with locks where needed, call engine.
4. **API client** — add typed method in `src/api/` and export via `src/utils/api.ts`.
5. **Hook** — `useXxx.ts` or `use-combat-queue.ts`: fetch/mutate, hold React state, expose actions.
6. **Component** — present data; use `src/styles/tokens.css` and `src/engine/art/` for visuals.
7. **i18n** — strings in `src/utils/i18n.ts`.
8. **Validation** — assertions in `scripts/validate.ts` for engine rules; `scripts/validate-architecture.ts` for import boundaries; run `npm run validate`.

### Example: new status effect

| Step | File |
|------|------|
| Effect logic | `src/engine/status/myEffect.ts` |
| Register | `src/engine/status/index.ts` |
| On-hit hook | `src/engine/status/applyOnHit.ts` (if proc-on-hit) |
| Animation event type | `src/engine/types.ts` → `AnimationEvent` union |
| Battle log label | `src/components/battle/battleLog.ts` |
| Optional FX | `src/components/battle/CombatFxCanvas.tsx` |

### Example: new shop item (server-authoritative gold)

| Step | File |
|------|------|
| Catalog entry | `src/engine/shop/` or `src/server/shop/catalog.ts` |
| Purchase logic + wallet lock | `src/server/shop/purchase.ts` |
| Route | `src/server/api/routes/shop.ts` |
| Client | `src/hooks/usePlayer.ts` or dedicated hook + `ShopMenu.tsx` |

## Animation model (not a game loop)

This is a **turn-based, event-driven** game. There is no `requestAnimationFrame` combat loop.

- Server emits ordered `AnimationEvent[]`.
- `useAnimationQueue` / `use-combat-queue` plays events at `BASE_EVENT_MS / speed`.
- Skip/speed only affect presentation; `finalState` is already authoritative.

Do **not** add Phaser or a continuous physics loop unless the game design changes to real-time action.

## Art & constants

- Colors / typography: `src/styles/tokens.css`
- Tower zones, palette, equipment visuals: `src/engine/art/`
- Spec: `docs/art-bible/MASTER_ART_BIBLE.md`

Never hardcode hex colors in components when a token exists.

## Security rules

- Gold, XP, drops, inventory mutations: **server only**.
- Wallet queries: `BIGINT`, row locks, idempotency (`src/server/db/idempotency.ts`).
- Client `PlayerIntent` is the only gameplay input from the browser.

## Boundary enforcement

Run on every PR:

```bash
npm run validate
```

`scripts/validate-architecture.ts` fails the build if:

- `src/engine/` imports React, DOM APIs, or client/server layers
- `src/components/` or `src/hooks/` import `src/server/` directly
- `src/types/` imports engine, server, hooks, or components

`eslint.config.mjs` enforces `max-lines: 200` (warn) on `src/**` with exceptions for `src/types/**` and `src/engine/skills|statuses/impl/**`.

```bash
npm run lint          # ESLint (warnings allowed)
npm run lint:strict   # fail on any warning
```

## Directory map

```
src/
├── types/           # Data contracts (lowest layer)
│   ├── combat.interface.ts
│   ├── state.interface.ts
│   └── animation.interface.ts
├── engine/          # Model — pure TS game logic
│   ├── combat/      # action-gauge, damage-calculator, turn-resolver
│   ├── formulas/
│   ├── states/
│   ├── skills/
│   │   ├── base-skill.interface.ts
│   │   └── impl/
│   ├── statuses/
│   │   ├── base-status.interface.ts
│   │   └── impl/
│   └── art/
├── server/          # Controller — API, DB, validation
│   ├── controllers/
│   ├── repository/
│   ├── api/routes/
│   ├── battle/
│   └── db/
├── api/             # Client network layer (intent in / result out)
│   └── combat.api.ts
├── hooks/           # React state bridges (use-combat-queue.ts)
├── components/      # View
│   ├── zones/       # forgotten-dungeon, imperial-bastion, knight-citadel, void-pinnacle
│   └── ui/
│       └── action-button.tsx
├── utils/api.ts     # Facade — re-exports api/* + legacy helpers
└── styles/          # Design tokens + layout CSS
```

## Related docs

- [docs/README.md](README.md) — documentation index
- [.cursorrules](../.cursorrules) — AI/editor coding rules
- [art-bible/MASTER_ART_BIBLE.md](art-bible/MASTER_ART_BIBLE.md) — visual spec
