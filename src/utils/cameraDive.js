import { mapScrollProgress } from './scrollProgress';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export const CAMERA_Z_START = 125;
export const CAMERA_Z_END = 8;
export const CAMERA_Y_START = 16;
export const CAMERA_Y_END = 10;
export const CAMERA_FOV_START = 45;
export const CAMERA_FOV_END = 58;

export function smoothstep(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Camera + card zoom — uses same dive channel as CSS `--dive`. */
export function getCameraDiveState(scrollProgress) {
  const { dive: t } = mapScrollProgress(scrollProgress);
  const ease = smoothstep(t);
  const cameraZ = lerp(CAMERA_Z_START, CAMERA_Z_END, ease);
  const cameraY = lerp(CAMERA_Y_START, CAMERA_Y_END, ease);
  const cameraFov = lerp(CAMERA_FOV_START, CAMERA_FOV_END, ease);

  const fovRadStart = (CAMERA_FOV_START * Math.PI) / 180 / 2;
  const fovRad = (cameraFov * Math.PI) / 180 / 2;
  const baseScale = Math.tan(fovRadStart) / CAMERA_Z_START;
  const currentScale = Math.tan(fovRad) / cameraZ;
  const cardZoom = currentScale / baseScale;

  return { t, ease, cameraZ, cameraY, cameraFov, cardZoom };
}

/** Card dust dissolve — tied to camera ease, not raw scroll. */
export const DISSOLVE_EASE_START = 0.32;
export const DISSOLVE_EASE_END = 0.94;

export function getCardDissolveProgress(ease) {
  return clamp01((ease - DISSOLVE_EASE_START) / (DISSOLVE_EASE_END - DISSOLVE_EASE_START));
}

/** Particle drift after the card has fully dissolved. */
export function getCardDriftProgress(ease) {
  if (ease <= DISSOLVE_EASE_END) return 0;
  return clamp01((ease - DISSOLVE_EASE_END) / (1 - DISSOLVE_EASE_END));
}
