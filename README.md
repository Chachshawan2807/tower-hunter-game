# Tower Hunter Game

A 100-floor turn-based tower climbing web game with server-authoritative MVC architecture.

## Architecture

| Layer | Stack | Location |
|-------|-------|----------|
| **View** | React 19 + Vite PWA | `src/components/`, `src/hooks/` |
| **Model / Engine** | Pure TypeScript (no DOM) | `src/engine/` |
| **Controller / Server** | Hono API + PostgreSQL (`pg`) | `src/server/` |

- Client sends **intent** only; gold, XP, drops, and wallet math run server-side (`BIGINT` currency).
- Database migrations: `src/server/db/schema/` — seed with `npm run seed`.
- **Not** Next.js or Supabase SDK — stack is Vite + Hono + `pg`. `DATABASE_URL` may target any PostgreSQL host (local or hosted).

## Quick Start

```bash
# Install dependencies
npm install

# Copy .env.example → .env and set DATABASE_URL (local Postgres or hosted PostgreSQL)
# Seed database (migrations + localization + demo user)
npm run seed

# API (:3000) + Vite PWA (:5173) together
npm run dev
```

Open `http://localhost:5173` — `/api` proxied to port 3000.

For separate terminals: `npm run dev:api` and `npm run dev:web`.

## Art Bible

Visual standard for the project: **[docs/art-bible/MASTER_ART_BIBLE.md](docs/art-bible/MASTER_ART_BIBLE.md)**

- Design tokens: `src/styles/tokens.css`
- Engine constants (zones, palette, weapons): `src/engine/art/`
- Implementation status: `docs/art-bible/IMPLEMENTATION_CHECKLIST.md`
- Full doc index: `docs/README.md`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite PWA together (recommended) |
| `npm run dev:web` | Vite PWA dev server only |
| `npm run dev:api` | Hono API server (watch) only |
| `npm run build` | Production PWA build → `dist/` |
| `npm run start` | Production API server |
| `npm run seed` | Run DB migrations + seed localization & demo user |
| `npm run db:check` | Connect, migrate, verify skill-system schema |
| `npm run validate` | Engine tests + architecture boundary checks + `tsc --noEmit` |
| `npm run export:icons` | Regenerate Imperial Knight UI + skill SVGs |
| `npm run export:nav` | Regenerate bottom-nav, bag, and shop icons only |
| `npm run export:equip-slots` | Regenerate equipment slot silhouettes only |
| `npm run export:hero` | Regenerate `imperial-knight-hero.svg` portrait |
| `npm run generate:sprites` | Regenerate enemy/NPC PNG sprite sheets |
| `npm run generate:audio` | Regenerate procedural audio placeholders |
| `npm run fetch:audio` | Download Kenney CC0 audio into `public/audio/` |
