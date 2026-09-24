import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { PerspectiveCamera } from "three";

import { HOME_HERO_PORTRAIT_ASPECT } from "./homeHeroFraming";

const FIT_MARGIN = 1.06;

type HomeHeroCameraRigProps = {
  planeWidth: number;
  planeHeight: number;
};

/** Frame the full portrait; look at torso center so feet stay near the pedestal shadow. */
export function HomeHeroCameraRig({ planeWidth, planeHeight }: HomeHeroCameraRigProps) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    const centerY = planeHeight / 2;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const viewAspect =
      size.width > 0 && size.height > 0 ? size.width / size.height : HOME_HERO_PORTRAIT_ASPECT;

    const distForHeight = (planeHeight * FIT_MARGIN) / (2 * Math.tan(vFovRad / 2));
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * viewAspect);
    const distForWidth = (planeWidth * FIT_MARGIN) / (2 * Math.tan(hFovRad / 2));
    const distance = Math.max(distForHeight, distForWidth, 0.5);

    camera.position.set(0, centerY, distance);
    camera.lookAt(0, centerY, 0);
    camera.near = 0.01;
    camera.far = Math.max(50, distance * 4);
    camera.updateProjectionMatrix();
  }, [camera, planeWidth, planeHeight, size.width, size.height]);

  return null;
}
