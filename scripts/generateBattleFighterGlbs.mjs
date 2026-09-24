/**
 * Shared battle fighter + embedded clips (idle, attack, hit_cc, defeat).
 * Output: public/models/battle-fighter.glb
 */
import { writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const outDir = path.join(root, "public", "models");
const OUT_FILE = "battle-fighter.glb";
const ROOT_NAME = "BattleFighter";

async function loadThree() {
  const THREE = await import("three");
  const { GLTFExporter } = await import(
    "three/examples/jsm/exporters/GLTFExporter.js"
  );
  return { THREE, GLTFExporter };
}

function buildFighterMesh(THREE) {
  const group = new THREE.Group();
  group.name = ROOT_NAME;

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.75, 8, 16),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 0.3,
      roughness: 0.55,
    })
  );
  body.name = "Body";
  body.position.y = 0.655;
  body.castShadow = true;

  const sword = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.62),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 0.55,
      roughness: 0.38,
    })
  );
  sword.name = "Weapon";
  sword.position.set(0.32, 1.05, 0);
  sword.castShadow = true;

  const helm = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.22, 0.36),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      metalness: 0.4,
      roughness: 0.5,
    })
  );
  helm.name = "Helm";
  helm.position.y = 1.22;
  helm.castShadow = true;

  group.add(body, sword, helm);
  return group;
}

function buildAnimationClips(THREE) {
  const p = `${ROOT_NAME}`;

  const idle = new THREE.AnimationClip("idle", 2, [
    new THREE.NumberKeyframeTrack(`${p}.position[y]`, [0, 1, 2], [0, 0.035, 0]),
  ]);

  const attack = new THREE.AnimationClip("attack", 0.42, [
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
  ]);

  const hit_cc = new THREE.AnimationClip("hit_cc", 0.38, [
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
  ]);

  const defeat = new THREE.AnimationClip("defeat", 1.2, [
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
    new THREE.NumberKeyframeTrack(
      `${p}.scale[x]`,
      [0, 1.2],
      [1, 0.85]
    ),
    new THREE.NumberKeyframeTrack(
      `${p}.scale[y]`,
      [0, 1.2],
      [1, 0.85]
    ),
    new THREE.NumberKeyframeTrack(
      `${p}.scale[z]`,
      [0, 1.2],
      [1, 0.85]
    ),
  ]);

  return [idle, attack, hit_cc, defeat];
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
  const { THREE, GLTFExporter } = await loadThree();
  const scene = new THREE.Scene();
  scene.add(buildFighterMesh(THREE));
  scene.animations = buildAnimationClips(THREE);

  const outPath = await exportGlb(GLTFExporter, scene, OUT_FILE);
  console.log(`Wrote ${outPath}`);

  for (const legacy of ["battle-player.glb", "battle-enemy.glb"]) {
    const legacyPath = path.join(outDir, legacy);
    try {
      unlinkSync(legacyPath);
      console.log(`Removed legacy ${legacy}`);
    } catch {
      /* already absent */
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
