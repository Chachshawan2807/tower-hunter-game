import "./render3d-dev.css";

import { DevCalibrationScene } from "./DevCalibrationScene";
import { GameCanvas } from "./GameCanvas";

export function Render3dDevPreviewContent() {
  return (
    <div className="render3d-dev-preview" aria-hidden>
      <GameCanvas>
        <DevCalibrationScene />
      </GameCanvas>
    </div>
  );
}
