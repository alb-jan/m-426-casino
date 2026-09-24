import { describe, expect, it } from "vitest";
import { calculateChips, chipStack, chipView, CHIP_STYLES, DENOMS } from "./chips";

describe("calculateChips", () => {
  it("zerlegt Beträge in möglichst wenige Jetons", () => {
    expect(calculateChips(880)).toEqual([500, 100, 100, 100, 50, 20, 10]);
    expect(calculateChips(30)).toEqual([20, 10]);
    expect(calculateChips(1000)).toEqual([500, 500]);
  });

  it("rundet Restbeträge unter 10 auf einen 10er-Jeton auf", () => {
    expect(calculateChips(5)).toEqual([10]);
    expect(calculateChips(25)).toEqual([20, 10]);
  });

  it("liefert für 0 keine Jetons", () => {
    expect(calculateChips(0)).toEqual([]);
  });
});

describe("chipView", () => {
  it("verwendet die Hausfarbe und einen gestreiften Rand", () => {
    const v = chipView(100);
    expect(v.base).toBe(CHIP_STYLES[100].base);
    expect(v.fg).toBe("#F2EFE6");
    expect(v.edge.startsWith("conic-gradient(")).toBe(true);
    expect(v.edge.match(/#F4EFE0/g)).toHaveLength(8);
  });

  it("fällt bei unbekannten Werten auf den 10er zurück", () => {
    expect(chipView(7).base).toBe(CHIP_STYLES[10].base);
  });
});

describe("chipStack", () => {
  it("begrenzt den Stapel auf max Jetons", () => {
    expect(chipStack(880, 3).map((c) => c.val)).toEqual([500, 100, 100]);
  });

  it("kennt fünf Werte", () => {
    expect(DENOMS).toEqual([500, 100, 50, 20, 10]);
  });
});
