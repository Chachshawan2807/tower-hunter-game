/**
 * Orthographic visual hull from front / side / back alpha mattes.
 * @see scripts/generateBattleHeroGlb.mjs
 */

const ALPHA_CUT = 48;

export async function loadAlphaGrid(sharp, filePath, targetHeight) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .resize({
      height: targetHeight,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const alpha = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < width * height; i++, p += channels) {
    alpha[i] = data[p + 3];
  }
  return { alpha, width, height };
}

function sampleAlpha(grid, u, v) {
  const x = Math.min(grid.width - 1, Math.max(0, Math.floor(u * grid.width)));
  const y = Math.min(grid.height - 1, Math.max(0, Math.floor(v * grid.height)));
  return grid.alpha[y * grid.width + x] >= ALPHA_CUT;
}

export function voxelKey(ix, iy, iz) {
  return `${ix},${iy},${iz}`;
}

/** Returns Set of solid voxel indices. */
export function carveVisualHull(front, side, back, nx, ny, nz) {
  const solid = new Set();
  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const x = ix / (nx - 1) - 0.5;
        const y = iy / (ny - 1);
        const z = iz / (nz - 1) - 0.5;
        const uFront = x + 0.5;
        const v = 1 - y;
        const uSide = z + 0.5;
        const uBack = 1 - (x + 0.5);
        if (
          sampleAlpha(front, uFront, v) &&
          sampleAlpha(side, uSide, v) &&
          sampleAlpha(back, uBack, v)
        ) {
          solid.add(voxelKey(ix, iy, iz));
        }
      }
    }
  }
  return solid;
}

export function isSurfaceVoxel(solid, ix, iy, iz) {
  if (!solid.has(voxelKey(ix, iy, iz))) return false;
  const neighbors = [
    [ix - 1, iy, iz],
    [ix + 1, iy, iz],
    [ix, iy - 1, iz],
    [ix, iy + 1, iz],
    [ix, iy, iz - 1],
    [ix, iy, iz + 1],
  ];
  return neighbors.some(([a, b, c]) => !solid.has(voxelKey(a, b, c)));
}

export async function buildVoxelSurfaceGeometry(
  THREE,
  mergeGeometries,
  solid,
  nx,
  ny,
  nz,
  targetHeight
) {
  const sx = targetHeight * 0.42;
  const sy = targetHeight;
  const sz = targetHeight * 0.42;
  const vx = sx / nx;
  const vy = sy / ny;
  const vz = sz / nz;
  const boxGeo = new THREE.BoxGeometry(vx * 0.94, vy * 0.94, vz * 0.94);
  const geometries = [];

  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        if (!isSurfaceVoxel(solid, ix, iy, iz)) continue;
        const x = (ix / (nx - 1) - 0.5) * sx;
        const y = (iy / (ny - 1)) * sy + vy * 0.5;
        const z = (iz / (nz - 1) - 0.5) * sz;
        const mesh = new THREE.Mesh(boxGeo);
        mesh.position.set(x, y, z);
        mesh.updateMatrix();
        geometries.push(mesh.geometry.clone().applyMatrix4(mesh.matrix));
      }
    }
  }

  boxGeo.dispose();

  if (geometries.length === 0) {
    return new THREE.BoxGeometry(0.4, targetHeight, 0.4);
  }

  const merged = mergeGeometries(geometries, false);
  for (const g of geometries) g.dispose();
  return merged;
}
