# Heroic Character Sprites Implementation Plan

> **For agentic workers:** Execute task-by-task. Checkboxes track progress.

**Goal:** Ship connected 7.5–8-head SVG→PNG sprite sheets for all 7 archetypes via modular generator templates.

**Architecture:** Shared anatomy primitives + per-archetype body modules; `generateCharacterSheets.mjs` packs 4×4 frames and rasterizes with sharp. Runtime unchanged (`CharacterSpriteSheet`).

**Tech Stack:** Node ESM, sharp, SVG, existing CSS frame-step animation

---

### Task 1: Shared sprite modules

**Files:**
- Create: `scripts/character-sprites/colors.mjs`
- Create: `scripts/character-sprites/defs.mjs`
- Create: `scripts/character-sprites/anatomy.mjs`
- Create: `scripts/character-sprites/poses.mjs`

- [x] **Step 1:** Add palette + gradient defs matching Art Bible colors
- [x] **Step 2:** Add connected heroic skeleton helpers (legs, arms, torso, head)
- [x] **Step 3:** Port 4×4 pose transforms from legacy generator

### Task 2: Seven body templates

**Files:**
- Create: `scripts/character-sprites/bodies/{murim,knight,fantasy,beast,demon,merchant,villager}.mjs`
- Create: `scripts/character-sprites/bodies/index.mjs`

- [x] **Step 1:** Implement murim / knight / fantasy heroes
- [x] **Step 2:** Implement beast / demon enemies
- [x] **Step 3:** Implement merchant / villager NPCs
- [x] **Step 4:** Export registry from `bodies/index.mjs`

### Task 3: Wire generator + regenerate

**Files:**
- Modify: `scripts/generateCharacterSheets.mjs`

- [x] **Step 1:** Import modular bodies; remove inline Rayman bodies
- [x] **Step 2:** Run `npm run generate:sprites`
- [x] **Step 3:** Confirm 7 PNG files at 960×1600

### Task 4: Visual verify

- [x] **Step 1:** Open Character menu in browser
- [x] **Step 2:** Confirm limbs connected, no SVG equip overlay
- [x] **Step 3:** Spot-check home stage

---

## UI redesign (deferred)

Separate plan after sprites land — HUD chrome, Character panel density, nav polish.
