import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera } from "three";

import { HOME_HERO_PORTRAIT_ASPECT } from "./homeHeroFraming";

const FIT_MARGIN = 1.06;

type HomeHeroCameraRigProps = {
  planeWidth: number;
  planeHeight: number;
};

function fitDistance(
  camera: PerspectiveCamera,
  planeWidth: number,
  planeHeight: number,
  viewAspect: number
): number {
  const vFovRad = (camera.fov * Math.PI) / 180;
  const distForHeight = (planeHeight * FIT_MARGIN) / (2 * Math.tan(vFovRad / 2));
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * viewAspect);
  const distForWidth = (planeWidth * FIT_MARGIN) / (2 * Math.tan(hFovRad / 2));
  return Math.max(distForHeight, distForWidth, 0.5);
}

/** Frame the full portrait; look at torso center so feet stay near the pedestal shadow. */
export function HomeHeroCameraRig({ planeWidth, planeHeight }: HomeHeroCameraRigProps) {
  const { camera, size } = useThree();
  const distanceRef = useRef(3);
  const centerY = planeHeight / 2;

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    const viewAspect =
      size.width > 0 && size.height > 0 ? size.width / size.height : HOME_HERO_PORTRAIT_ASPECT;
    distanceRef.current = fitDistance(camera, planeWidth, planeHeight, viewAspect);

    camera.position.set(0, centerY, distanceRef.current);
    camera.lookAt(0, centerY, 0);
    camera.near = 0.01;
    camera.far = Math.max(50, distanceRef.current * 4);
    camera.updateProjectionMatrix();
  }, [camera, planeWidth, planeHeight, size.width, size.height, centerY]);

  return null;
}
