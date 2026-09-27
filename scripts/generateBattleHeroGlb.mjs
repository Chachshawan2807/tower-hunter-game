/**
 * Build battle-hero.glb from turnaround PNGs (visual hull + root motion clips).
 * Input: public/assets/characters/battle-hero/battle-hero-{front,side,back}.png
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  buildVoxelSurfaceGeometry,
  carveVisualHull,
  loadAlphaGrid,
} from "./battleHeroVisualHull.mjs";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      void blob.arrayBuffer().then((result) => {
        this.result = result;
        this.onloadend?.();
      });
    }
  };
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const heroDir = path.join(root, "public", "assets", "characters", "battle-hero");
const outDir = path.join(root, "public", "models");
const OUT_FILE = "battle-hero.glb";
const ROOT_NAME = "BattleHero";
const TARGET_HEIGHT = 1.35;
const VOX = { nx: 36, ny: 52, nz: 36 };

async function loadThree() {
  const THREE = await import("three");
  const { GLTFExporter } = await import(
    "three/examples/jsm/exporters/GLTFExporter.js"
  );
  const { mergeGeometries } = await import(
    "three/examples/jsm/utils/BufferGeometryUtils.js"
  );
  return { THREE, GLTFExporter, mergeGeometries };
}

function buildAnimationClips(THREE) {
  const p = ROOT_NAME;
  return [
    new THREE.AnimationClip("idle", 2, [
      new THREE.NumberKeyframeTrack(`${p}.position[y]`, [0, 1, 2], [0, 0.035, 0]),
    ]),
    new THREE.AnimationClip("attack", 0.42, [
      new THREE.NumberKeyframeTrack(
        `${p}.position[x]`,
        [0, 0.12, 0.28, 0.42],
        [0, 0.42, 0.38, 0]
      ),
      new THREE.NumberKeyframeTrack(
        `${p}.rotation[z]`,
        [0, 0.12, 0.42],
        [0, -0.12, 0]
      ),
    ]),
    new THREE.AnimationClip("hit_cc", 0.38, [
      new THREE.NumberKeyframeTrack(
        `${p}.position[x]`,
        [0, 0.1, 0.38],
        [0, -0.28, -0.05]
      ),
      new THREE.NumberKeyframeTrack(
        `${p}.rotation[z]`,
        [0, 0.1, 0.38],
        [0, 0.18, 0]
      ),
    ]),
    new THREE.AnimationClip("defeat", 1.2, [
      new THREE.NumberKeyframeTrack(
        `${p}.rotation[x]`,
        [0, 0.35, 1.2],
        [0, -1.15, -1.45]
      ),
      new THREE.NumberKeyframeTrack(
        `${p}.position[y]`,
        [0, 0.35, 1.2],
        [0, 0.1, -0.35]
      ),
    ]),
  ];
}

function exportGlb(GLTFExporter, scene, filename) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const outPath = path.join(outDir, filename);
        writeFileSync(outPath, Buffer.from(result));
        resolve(outPath);
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

async function main() {
  const frontPath = path.join(heroDir, "battle-hero-front.png");
  const sidePath = path.join(heroDir, "battle-hero-side.png");
  const backPath = path.join(heroDir, "battle-hero-back.png");

  const pixelHeight = 512;
  const [front, side, back] = await Promise.all([
    loadAlphaGrid(sharp, frontPath, pixelHeight),
    loadAlphaGrid(sharp, sidePath, pixelHeight),
    loadAlphaGrid(sharp, backPath, pixelHeight),
  ]);

  const solid = carveVisualHull(front, side, back, VOX.nx, VOX.ny, VOX.nz);
  console.log(`Visual hull voxels: ${solid.size} solid`);

  const { THREE, GLTFExporter, mergeGeometries } = await loadThree();
  const geometry = await buildVoxelSurfaceGeometry(
    THREE,
    mergeGeometries,
    solid,
    VOX.nx,
    VOX.ny,
    VOX.nz,
    TARGET_HEIGHT
  );

  const group = new THREE.Group();
  group.name = ROOT_NAME;

  const body = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8c8c8"),
      metalness: 0.35,
      roughness: 0.62,
    })
  );
  body.name = "Body";
  body.castShadow = true;

  const weapon = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.55),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#888888"),
      metalness: 0.5,
      roughness: 0.45,
    })
  );
  weapon.name = "Weapon";
  weapon.position.set(0.12, TARGET_HEIGHT * 0.72, -0.22);
  weapon.rotation.y = 0.35;
  weapon.castShadow = true;

  group.add(body, weapon);
  group.rotation.y = -Math.PI / 2;

  const scene = new THREE.Scene();
  scene.add(group);
  scene.animations = buildAnimationClips(THREE);

  const outPath = await exportGlb(GLTFExporter, scene, OUT_FILE);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
