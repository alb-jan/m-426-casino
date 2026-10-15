import { describe, expect, it } from "vitest";
import { zoomDistance, ZOOM_MAX, ZOOM_MIN } from "./camera";

describe("zoomDistance", () => {
  it("zoomt beim Scrollen nach oben hinein und nach unten heraus", () => {
    expect(zoomDistance(1.5, -100)).toBeLessThan(1.5);
    expect(zoomDistance(1.5, 100)).toBeGreaterThan(1.5);
    expect(zoomDistance(1.5, 0)).toBe(1.5);
  });

  it("zoomt symmetrisch (rein und wieder raus ergibt den Startwert)", () => {
    expect(zoomDistance(zoomDistance(1.5, -120), 120)).toBeCloseTo(1.5);
  });

  it("bleibt innerhalb der Grenzen", () => {
    expect(ZOOM_MIN).toBeLessThan(ZOOM_MAX);
    expect(ZOOM_MAX).toBeLessThanOrEqual(2.1); // Kessel bleibt gross genug
    expect(zoomDistance(ZOOM_MIN, -5000)).toBe(ZOOM_MIN);
    expect(zoomDistance(ZOOM_MAX, 5000)).toBe(ZOOM_MAX);
  });
});
