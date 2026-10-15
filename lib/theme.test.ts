import { describe, expect, it } from "vitest";
import { COLORS } from "./theme";

describe("COLORS (Design-Tokens)", () => {
  it("enthält die Hauptfarben aus dem Prototyp", () => {
    expect(COLORS.gold).toBe("#E8B94A");
    expect(COLORS.text).toBe("#F2EFE6");
    expect(COLORS.muted).toBe("#8FA096");
    expect(COLORS.win).toBe("#7FD6A8");
    expect(COLORS.lose).toBe("#F4B9B3");
    expect(COLORS.bg).toBe("#07100D");
  });
});
