import { describe, expect, it } from "vitest";
import { hashSeed, seededRng } from "./random";

describe("seededRng", () => {
  it("liefert reproduzierbare Zahlen in [0, 1)", () => {
    const a = seededRng(42);
    const b = seededRng(42);
    const xs = Array.from({ length: 1000 }, () => a());
    expect(xs).toEqual(Array.from({ length: 1000 }, () => b()));
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it("verteilt gleichmässig", () => {
    const r = seededRng(7);
    const mean = Array.from({ length: 10000 }, () => r()).reduce((s, x) => s + x, 0) / 10000;
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
  });
});

describe("hashSeed", () => {
  it("bildet Texte stabil auf Zahlen ab", () => {
    expect(hashSeed("As Kd")).toBe(hashSeed("As Kd"));
    expect(hashSeed("As Kd")).not.toBe(hashSeed("As Kh"));
  });
});
