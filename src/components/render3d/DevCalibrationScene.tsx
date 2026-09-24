import { Grid, OrbitControls } from "@react-three/drei";

import { RENDER_3D_ART } from "../../engine/art/render3d";

/** Smoke-test scene: palette-aligned lights + placeholder pedestal (not shipped gameplay). */
export function DevCalibrationScene() {
  return (
    <>
      <color attach="background" args={[RENDER_3D_ART.backgroundHex]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} />
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.9]} />
        <meshStandardMaterial color={RENDER_3D_ART.accentHex} metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={RENDER_3D_ART.floorHex} />
      </mesh>
      <Grid
        args={[8, 8]}
        cellSize={0.5}
        cellColor={RENDER_3D_ART.expHex}
        sectionColor={RENDER_3D_ART.dangerHex}
        fadeDistance={12}
        position={[0, 0.01, 0]}
      />
      <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}
