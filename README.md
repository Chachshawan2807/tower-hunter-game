# Tower Hunter Game

A 100-floor turn-based tower climbing web game with server-authoritative MVC architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Terminal 1 — API server (requires PostgreSQL)
set DATABASE_URL=postgresql://user:pass@localhost:5432/tower_hunter
npm run dev:api

# Terminal 2 — PWA client
npm run dev
```

Open `http://localhost:5173` — API proxied to port 3000.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite PWA dev server |
| `npm run dev:api` | Hono API server (watch) |
| `npm run build` | Production PWA build → `dist/` |
| `npm run typecheck` | TypeScript check |
