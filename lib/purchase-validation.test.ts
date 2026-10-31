import { describe, expect, it } from "vitest";
import { parseAmount, previewChips, validatePurchase } from "./purchase";

describe("US-05 vollständige Betragsvalidierung", () => {
  it.each(["-25", "−25", "+25", "CHF -25", "25abc", "abc25", "1e2", "25.5.6", "25,5,6", "5.001", "25.", ".25", "NaN", "Infinity", "1 00"])("lehnt %s vollständig ab", (input) => {
    expect(parseAmount(input)).toBeNaN();
    expect(previewChips(input)).toBe(0);
    expect(validatePurchase(input).ok).toBe(false);
  });
  it.each(["5", "5.0", "5,00", " CHF 5.00 ", "CHF25", "chf 25,50", "500.00"])("akzeptiert %s", (input) => {
    expect(validatePurchase(input).ok).toBe(true);
  });
  it("rechnet über Rappen ohne Gleitkommafehler", () => {
    expect(validatePurchase("12.55")).toEqual({ok:true,chf:12.55,chips:125});
    expect(validatePurchase("5.10")).toEqual({ok:true,chf:5.1,chips:51});
    expect(validatePurchase("500.01").ok).toBe(false);
    expect(validatePurchase("4.99").ok).toBe(false);
  });
});
