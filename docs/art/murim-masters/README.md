# Murim AI masters

Source poses for the hybrid Murim sprite sheet (Art Bible §06).

- `reference-source.png` — player-supplied 3D reference
- `murim-master-*.png` — stylized anime key poses (idle / attack / hit / defeat)

Rebuild runtime sheet:

```bash
npm run assemble:murim
```

Output: `public/assets/characters/murim-sheet.png`  
Note: `npm run generate:sprites` intentionally skips Murim.
