# Unified Layout Implementation Plan

> **Status:** Implemented.

> **For agentic workers:** Implement task-by-task. Checkboxes track progress.

**Goal:** Apply a shared spacing scale and row/section primitives so every screen aligns consistently inside the 9:16 frame.

**Architecture:** Soft-unify via CSS tokens; add `layout-primitives.css` for `.ui-row` / `.ui-section` / `.ui-balance`; remap shell + menus + home + battle gaps to those tokens; adjust Bag/Shop row markup only where needed.

**Tech Stack:** CSS custom properties, existing React menu/layout components (no engine changes).

---

### Task 1: Tokens + primitives

**Files:**
- Modify: `src/styles/tokens.css`
- Create: `src/styles/layout-primitives.css`
- Modify: `src/styles/global.css`

- [x] Add `--space-*`, `--content-inline`, `--section-gap`, `--row-icon-size`, `--row-gap`
- [x] Define `.ui-row`, `.ui-section`, `.ui-balance`
- [x] Import primitives after `layout.css`

### Task 2: Shell rhythm (HUD / overlay / stage / nav)

**Files:**
- Modify: `src/styles/layout.css`
- Modify: `src/styles/home-screen.css`

- [x] Remap padding/gaps to space scale + `--content-inline`
- [x] Align overlay header/body inset with content inset

### Task 3: Menu lists + settings

**Files:**
- Modify: `src/styles/menus.css`
- Modify: `src/components/menu/BagMenu.tsx`
- Modify: `src/components/menu/ShopMenu.tsx` (classes only if needed)

- [x] Bag/Shop/Skill rows use `.ui-row` columns
- [x] Balances use `.ui-balance`
- [x] Settings/section gaps use `--section-gap`

### Task 4: Battle + character panels + verify

**Files:**
- Modify: `src/styles/battle.css` (gap/padding tokens only near tower/battle chrome)
- Modify: `src/styles/character.css` (equipment panel gaps)
- Verify: Visual check via running `npm run dev`

- [x] Align stage/battle content gaps to scale
- [x] Confirm no BottomNav overlap / touch targets intact
