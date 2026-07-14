# Tower Hunter Game

A 100-floor turn-based tower climbing web game with server-authoritative MVC architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Seed database (migrations + localization + demo user)
set DATABASE_URL=postgresql://user:pass@localhost:5432/tower_hunter
npm run seed

# Terminal 1 — API server (requires PostgreSQL)
set DATABASE_URL=postgresql://user:pass@localhost:5432/tower_hunter
npm run dev:api

# Terminal 2 — PWA client
npm run dev
```

Open `http://localhost:5173` — API proxied to port 3000.

## Art Bible

Visual standard for the project: **[docs/art-bible/MASTER_ART_BIBLE.md](docs/art-bible/MASTER_ART_BIBLE.md)**

- Design tokens: `src/styles/tokens.css`
- Engine constants (zones, palette, weapons): `src/engine/art/`
- Implementation status: `docs/art-bible/IMPLEMENTATION_CHECKLIST.md`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite PWA dev server |
| `npm run dev:api` | Hono API server (watch) |
| `npm run build` | Production PWA build → `dist/` |
| `npm run seed` | Run DB migrations + seed localization & demo user |
