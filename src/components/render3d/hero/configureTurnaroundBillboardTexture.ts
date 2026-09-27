import { LinearFilter, SRGBColorSpace, type Texture } from "three";

/** Crisp ink sprites on dark battle/home backgrounds (no mip blur, straight alpha). */
export function configureTurnaroundBillboardTexture(tex: Texture): Texture {
  tex.colorSpace = SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
