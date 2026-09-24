# Battle Fighter 3D — Art Brief & GLB Export Checklist

**Project:** Tower Hunter (100-floor turn-based web game)  
**Hero line:** Imperial Knight — medieval European plate armor, citadel fantasy (not wuxia / not anime chibi for this asset).  
**Canonical 2D reference:** `public/assets/characters/imperial-knight-hero.svg`  
**Additional refs:** `docs/art/characters/reference/imperial-knight-hero-*.png`

Attach the **ink/monochrome full-body knight illustration** (plate + chainmail + tattered cape + greatsword on back) when contacting a modeler or image-to-3D tool.

---

## 1. Creative brief (copy-paste for modeler / AI tools)

### Title
**Imperial Knight — battle fighter glTF (real-time web game)**

### Visual goal
Create a **single game-ready 3D character** that reads as the **same hero** as our 2D ink illustration: a stoic imperial knight in **full plate** over **chainmail**, with a **long torn cape**, and a **large sword sheathed on the back** (hilt visible over the shoulder). The 2D source is **monochrome ink / cross-hatching** on parchment — the 3D version should **translate that mood** (weathered metal, heavy silhouette, grim medieval tone) using **real-time PBR materials**, not a flat paper texture wrapped on a card.

### Proportions & silhouette
- **Adult human proportions** (~7–7.5 heads tall). Sturdy, grounded stance — not super-deformed chibi.
- **Broad shoulders**, thick greaves, **great helm** or visored bascinet with a **narrow horizontal eye slit** (readable at small on-screen size).
- **Cape** reaches near the ankles; **ragged, torn hem**; drapes from both shoulders.
- **Sword on back**: longsword/greatsword, crossguard and pommel visible; scabbard mostly hidden behind torso/cape.
- **Chainmail** visible at neck, elbows, and as a skirt under the fauld where plate gaps.

### Armor & costume (must-have)
| Element | Notes |
|--------|--------|
| Helm | Full-face visor, vertical breath slits; battle-worn scratches |
| Torso | Breastplate + fauld; rivets/seams suggested |
| Limbs | Pauldrons, couters, vambraces, gauntlets; poleyns, greaves, sabatons |
| Cape | Heavy fabric, torn lower edge, folds with gravity |
| Weapon | Named mesh **`Weapon`** (see technical section) — blade on back in idle |

### Style direction (3D interpretation of ink art)
- **Palette (in-engine tint):** warm **antique gold / brass** tones for player armor accents; enemies use **crimson** accent (materials are recolored in code — see checklist).
- **Surface:** brushed steel, subtle wear; avoid mirror chrome or plastic toy look.
- **No** eastern robes, ki effects, oversized anime eyes, or modern military gear.
- **Lighting-friendly:** clear silhouette from front **¾ view** (camera sees player from slightly right-front).

### Pose & orientation (authoring)
- **Bind pose / idle:** combat-ready **idle**, feet **shoulder-width**, slight forward lean optional; **facing +X** in Blender (character looks toward positive X). Game places player on the **left** of the arena and rotates the root to face the enemy.
- **Feet on the ground plane** (soles at Y = 0 in the export root before normalization).

### Animations (required clip names — exact spelling)
| Clip name | Loop | Description |
|-----------|------|-------------|
| `idle` | yes | Slow breath, subtle weight shift, minimal cape/cloth |
| `attack` | no | One clear melee strike toward +X, ~0.35–0.5 s |
| `hit_cc` | no | Stagger/recoil backward, ~0.3–0.4 s |
| `defeat` | no | Collapse to ground/kneel, ~1.0–1.2 s, hold last frame |

Use a **single armature** skinned to the mesh. Root motion optional for attack/hit; keep feet roughly planted for idle.

### Deliverables
1. **`battle-fighter.glb`** — one file, binary glTF 2.0, embedded textures (if any).
2. **Optional:** `.blend` source + texture PNGs at 1K–2K.
3. **Screenshot turntable** (front, ¾, back) for approval.

### Target platform
- **WebGL / mobile browsers** — prefer **≤ 25k triangles** for the character (cape included); 2K textures max per material unless approved.

### Image-to-3D note
If using AI mesh tools (Meshy, Tripo, etc.): use the attached **full-body ink reference**; expect **manual cleanup** in Blender (topology, cape, helm slit, sword on back). AI rarely nails **back-mounted sword + torn cape** without edits.

---

## 2. GLB export checklist (`BattleFighterGltf` integration)

**Drop-in path:** `public/models/battle-fighter.glb`  
**Code:** `src/components/render3d/battle/BattleFighterGltf.tsx`

### File & format
- [ ] **Binary GLB** (`.glb`), glTF 2.0
- [ ] Filename exactly **`battle-fighter.glb`**
- [ ] Single character per file (player and enemy share this mesh; side is distinguished by tint only)

### Scale & origin (critical)
- [ ] Character **height** in file is arbitrary; runtime scales to **1.35 world units** tall (`BATTLE_FIGHTER_TARGET_HEIGHT` in `src/engine/art/battleFighterModels.ts`)
- [ ] After export, **lowest point of feet** should sit on **Y = 0** on the model root (or root group containing the skinned mesh)
- [ ] Model **forward** for gameplay: design idle facing **+X** (attack animation moves toward enemy on the right)

### Materials (current engine behavior)
- [ ] Meshes use **`MeshStandardMaterial`** (required for current tint pass)
- [ ] Name the sword mesh (or mesh group leaf) **`Weapon`** — it receives a distinct tint (EXP yellow for player, crimson for enemy)
- [ ] **Warning:** `tintFighterMaterials.ts` **replaces `material.color`** on every mesh with palette hex (gold vs crimson). **Albedo textures may look wrong** until engineering disables tint for textured assets. For first delivery, **simple metal materials** work with tint; for full PBR textures, coordinate a small code change.

### Animations (critical)
- [ ] Exactly four clips, names **case-sensitive**:
  - `idle`
  - `attack`
  - `hit_cc`
  - `defeat`
- [ ] Clips are **skeletal** (skinned armature), not only object transform on a dummy root (transform-only clips work for placeholders but not for skinned heroes)
- [ ] `idle` loops; others play once and clamp on last frame

### Scene graph
- [ ] One primary skinned mesh (cape can be same rig or separate skinned mesh)
- [ ] No extra cameras/lights required in the GLB (scene supplies lights)
- [ ] Avoid non-uniform scale on armature bones

### Performance
- [ ] Draco mesh compression **optional** (not configured in repo yet — prefer uncompressed GLB until we add decoder)
- [ ] Texture dimensions power-of-two; prefer **1K** for mobile

### Verification in project
```bash
# Replace public/models/battle-fighter.glb, then:
npm run dev          # or npm run dev:3d
# Enter tower battle — 3D fighters when render3d mode is on
npm run typecheck
```

**Quick manual checks in https://gltf-viewer.donmccurdy.com/ or Blender:**
- [ ] Feet on ground, reasonable height
- [ ] All four animations play
- [ ] No missing textures / pink materials

### Legacy
- Do **not** ship separate `battle-player.glb` / `battle-enemy.glb` — one shared file only (`scripts/generateBattleFighterGlbs.mjs` removes legacy names).

---

## 3. Reference attachment list (for email / ticket)

1. Ink illustration — imperial knight full body (user reference / `imperial-knight-hero.svg` export PNG)
2. Link to this doc
3. `docs/art-bible/IMPERIAL_KNIGHT_ICON_STYLE.md` (line-art / UI consistency)
4. `docs/art-bible/MASTER_ART_BIBLE.md` §06 (character pillar)

---

## 4. Engineering follow-up (textured hero)

When a textured GLB is approved, update `tintFighterMaterials.ts` to **skip tint** (or tint only `Weapon`) so ink-accurate albedo/normal maps display correctly. Home screen may continue using the SVG billboard (`HomeHeroBillboard`) until battle mesh is approved.
