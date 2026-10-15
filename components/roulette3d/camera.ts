/** Kameraabstand-Grenzen (Modelleinheiten, Kessel-Radius ≈ 0.41). */
export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.6;

/** Neuer Kameraabstand nach einem Mausrad-Event. */
export function zoomDistance(dist: number, deltaY: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, dist * Math.exp(deltaY * 0.0012)));
}
