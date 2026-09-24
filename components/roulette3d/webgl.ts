/** Prüft, ob der Browser WebGL unterstützt (sonst wird der Ersatz-Kessel gezeigt). */
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
