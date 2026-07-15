# Murim AI Hybrid Sprite Sheet Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Ship an AI-assembled Murim 4×4 PNG from the dark-ronin reference while preserving the existing sprite runtime.

**Architecture:** Generate four master anime poses from the reference image, place them under `docs/art/murim-masters/`, assemble into `public/assets/characters/murim-sheet.png` via a Sharp script, and exclude Murim from procedural sheet overwrite.

**Tech Stack:** GenerateImage (reference-guided), Sharp, existing `CharacterSpriteSheet` pipeline

## Global Constraints

- Art Bible §06: 7.5–8 heads, stable aggressive silhouette
- Sheet: 960×1600, frames 240×400, 4×4 grid
- No hardcoded colors outside art bible tokens in UI code (asset PNGs OK)
- Files under 200 LOC where practical

---

### Task 1: Masters + assemble script

- [ ] Generate idle / attack / hit_cc / defeat masters (transparent or black BG, full-body)
- [ ] Write `scripts/assembleMurimAiSheet.mjs` (fit-to-frame, 4 idle bob variants)
- [ ] Output `murim-sheet.png`; skip murim in `generateCharacterSheets.mjs`
- [ ] Smoke: home stage + idle CSS animation still works
