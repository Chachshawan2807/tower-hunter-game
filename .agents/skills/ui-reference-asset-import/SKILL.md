---
name: ui-reference-asset-import
description: >-
  Import a user reference image (any file path) into public/icons/ui and wire
  React UI with CSS mask + currentColor. Use when the user gives an image path
  or attachment and wants buttons/icons/HUD to match the reference.
---

# UI reference asset import

Follow `.cursor/rules/ui-reference-asset-import.mdc` and run the export script yourself.

## Quick command

```powershell
py -3 scripts/export-ui-icon.py --src "<REFERENCE_PATH>" --out public/icons/ui/<asset-id>.png
```

## React pattern (tinted)

```tsx
<span
  className="game-icon game-icon--file game-icon--<asset-id>"
  style={{
    width: size,
    height: size,
    ["--icon-mask" as string]: "url(/icons/ui/<asset-id>.png)",
  }}
  aria-hidden
/>
```

Parent/button sets `color: var(--crimson-deep)` (or other token) for semantic tint.

## Checklist

- [ ] Source path resolved (user path, not assumed Downloads)
- [ ] PNG has alpha (script run)
- [ ] Component wired; mask-mode alpha if needed
- [ ] User told to Ctrl+F5 after deploy
